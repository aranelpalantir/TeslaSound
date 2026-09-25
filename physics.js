/**
 * TeslaSound - Physics & Vehicle Dynamics Simulation
 * Tuned for 0-130 km/h real-world driving:
 * - Dynamic kickdown & 2nd gear hold on acceleration
 * - Highly responsive GPS acceleration-to-throttle curve
 * - Authentic gear ratio RPM progression across 0-130 km/h
 */

class VehiclePhysics {
    constructor(audioEngine) {
        this.audio = audioEngine;
        this.profile = null;

        // Dynamic State
        this.currentSpeedKmh = 0;       // Displayed / simulated speed in km/h
        this.targetSpeedKmh = 0;        // Target speed from GPS or manual slider
        this.currentRpm = 900;
        this.targetRpm = 900;
        this.throttle = 0.0;            // 0.0 (idle/brake) to 1.0 (WOT)
        this.targetThrottle = 0.0;
        this.acceleration = 0.0;        // m/s^2
        this.currentGear = 1;           // 1 to N
        this.transmissionMode = 'auto'; // 'auto' or 'manual'

        // Shifting state
        this.isShifting = false;
        this.shiftStartTime = 0;
        this.shiftDurationMs = 100;     // Fast crisp shift

        // GPS tracking metadata
        this.lastGpsTimestamp = 0;
        this.lastGpsSpeedMs = 0;
        this.gpsAccuracy = null;
        this.gpsActive = false;

        // Simulation parameters
        this.isSimulating = false;
        this.simPedalDown = false;
        this.simBrakeDown = false;
        this.isEngineRunning = false;
    }

    setProfile(profile) {
        this.profile = profile;
        this.currentGear = 1;
        this.currentRpm = this.isEngineRunning ? profile.idleRpm : 0;
        this.targetRpm = this.isEngineRunning ? profile.idleRpm : 0;
    }

    /**
     * Ingest GPS position data with highly sensitive acceleration detection
     */
    handleGpsUpdate(position) {
        if (!this.isEngineRunning) return;
        const coords = position.coords;
        const now = position.timestamp || Date.now();
        this.gpsActive = true;
        this.gpsAccuracy = coords.accuracy;

        let speedMs = coords.speed;
        if (speedMs === null || isNaN(speedMs) || speedMs < 0) {
            speedMs = 0;
        }

        const speedKmh = Math.max(0, speedMs * 3.6);
        this.targetSpeedKmh = speedKmh;

        // Calculate real acceleration from GPS points
        if (this.lastGpsTimestamp > 0 && now > this.lastGpsTimestamp) {
            const dtSeconds = (now - this.lastGpsTimestamp) / 1000;
            if (dtSeconds > 0.15 && dtSeconds < 4.0) {
                const dv = speedMs - this.lastGpsSpeedMs;
                this.acceleration = dv / dtSeconds;

                // High-sensitivity throttle mapping for real road driving:
                // Gentle press -> high sound, spirited pull -> 100% full roar!
                if (this.acceleration > 1.2) {
                    this.targetThrottle = 1.0; // Dip gaz / Kickdown!
                } else if (this.acceleration > 0.6) {
                    this.targetThrottle = 0.85; // Güçlü ivmelenme
                } else if (this.acceleration > 0.25) {
                    this.targetThrottle = 0.65; // Belirgin hızlanma
                } else if (this.acceleration > 0.08) {
                    this.targetThrottle = 0.40; // Hafif gaz verme
                } else if (this.acceleration > -0.3 && speedKmh > 3) {
                    this.targetThrottle = 0.15; // Sabit hızda akma (cruising)
                } else {
                    this.targetThrottle = 0.0; // Gaz bırakma / kompresyon / egzoz patlatma
                }
            }
        }

        this.lastGpsTimestamp = now;
        this.lastGpsSpeedMs = speedMs;
    }

    /**
     * Physics tick called every animation frame
     */
    update(dt) {
        if (!this.profile) return;

        if (!this.isEngineRunning) {
            this.targetThrottle = 0;
            this.throttle = 0;
            this.simPedalDown = false;
            this.simBrakeDown = false;
            this.currentRpm = Math.max(0, this.currentRpm - dt * 5000);
            this.currentSpeedKmh = Math.max(0, this.currentSpeedKmh - dt * 35);
            this.targetSpeedKmh = 0;
            this.acceleration = 0;
            return;
        }

        // Handle Simulator Controls if in Test Bench Mode
        if (this.isSimulating) {
            this._updateSimulation(dt);
        } else {
            // GPS dead-reckoning smoothing
            const speedSmoothingFactor = Math.min(1.0, dt * 6.0);
            this.currentSpeedKmh += (this.targetSpeedKmh - this.currentSpeedKmh) * speedSmoothingFactor;
        }

        // Throttle response smoothing (instant attack, organic decay)
        const throttleSmoothing = this.targetThrottle > this.throttle ? Math.min(1.0, dt * 18.0) : Math.min(1.0, dt * 8.0);
        this.throttle += (this.targetThrottle - this.throttle) * throttleSmoothing;
        this.throttle = Math.max(0, Math.min(1, this.throttle));

        // Calculate RPM based on current speed and gear ratio
        if (this.currentSpeedKmh < 0.6) {
            // Vehicle stopped / idling quietly
            this.targetRpm = this.profile.idleRpm + (this.throttle * 3800);
            this.currentGear = 1;
        } else {
            const gears = this.profile.gears;
            const isTopGear = this.currentGear >= gears.length;
            const gearConfig = gears[this.currentGear - 1] || gears[0];
            const maxSpeed = gearConfig.maxSpeed || 50;

            // Direct acoustic mapping:
            let calculatedRpm = (this.currentSpeedKmh / maxSpeed) * this.profile.redlineRpm;

            // In top gear, prevent perpetual rev-limiter when driving fast on highway:
            if (isTopGear && calculatedRpm >= this.profile.redlineRpm) {
                calculatedRpm = this.profile.redlineRpm - 100;
            }

            this.targetRpm = Math.max(this.profile.idleRpm, calculatedRpm);

            // Automatic transmission logic with dynamic kickdown & 2nd gear hold
            if (this.transmissionMode === 'auto' && !this.isShifting) {
                this._handleAutoShifting();
            }

            // Rev limiter check ("tatatata" kesici) - active in lower gears when screaming to redline:
            if (!isTopGear && this.currentRpm >= this.profile.redlineRpm) {
                this.audio.triggerRevLimiter();
                this.currentRpm = this.profile.redlineRpm - 120;
            }
        }

        // RPM inertia smoothing
        const rpmSmoothing = Math.min(1.0, dt * 20.0);
        this.currentRpm += (this.targetRpm - this.currentRpm) * rpmSmoothing;

        // Send state to audio engine
        this.audio.update(this.currentRpm, this.throttle, this.currentSpeedKmh, this.acceleration);
    }

    /**
     * Automatic Transmission with "2. Viteste Bağırtma" & Kickdown
     */
    _handleAutoShifting() {
        const gears = this.profile.gears;
        const totalGears = gears.length;

        // Hard acceleration check: holds lower gears (especially 2nd gear) longer!
        const isAccelerating = this.acceleration > 0.35 || this.throttle > 0.45;
        
        // When stepping on the gas, shift at the very redline limit (e.g. 96%); when cruising, shift earlier
        const dynamicShiftRpm = isAccelerating 
            ? (this.profile.redlineRpm - 180) 
            : (this.profile.shiftRpm || this.profile.redlineRpm * 0.82);

        // KICKDOWN (Ara hızlanmada 2. vitese çekip bağırtma):
        // If accelerating hard and current gear is 3 or higher, check if dropping to a lower gear screams into powerband
        if (isAccelerating && this.currentGear > 1) {
            const lowerGearConfig = gears[this.currentGear - 2];
            const projectedRpm = (this.currentSpeedKmh / lowerGearConfig.maxSpeed) * this.profile.redlineRpm;
            // Downshift if projected RPM won't blow past redline
            if (projectedRpm < (this.profile.redlineRpm - 250)) {
                this.shiftDown();
                return;
            }
        }

        // Upshift condition
        if (this.currentRpm >= dynamicShiftRpm && this.currentGear < totalGears) {
            this.shiftUp();
            return;
        }

        // Downshift condition when decelerating
        if (this.currentGear > 1) {
            const lowerGearConfig = gears[this.currentGear - 2];
            const projectedRpm = (this.currentSpeedKmh / lowerGearConfig.maxSpeed) * this.profile.redlineRpm;
            if (this.currentRpm < (this.profile.idleRpm + 600) && projectedRpm < (this.profile.redlineRpm - 500)) {
                this.shiftDown();
            }
        }
    }

    shiftUp() {
        if (this.currentGear >= this.profile.gears.length || this.isShifting) return;

        this.isShifting = true;
        this.currentGear++;
        this.audio.triggerGearShift(true);

        setTimeout(() => {
            this.isShifting = false;
        }, this.shiftDurationMs);
    }

    shiftDown() {
        if (this.currentGear <= 1 || this.isShifting) return;

        this.isShifting = true;
        this.currentGear--;
        this.audio.triggerGearShift(false);

        // Rev-match throttle blip
        const originalThrottle = this.throttle;
        this.throttle = Math.min(1.0, this.throttle + 0.45);

        setTimeout(() => {
            this.isShifting = false;
            this.throttle = originalThrottle;
        }, this.shiftDurationMs + 50);
    }

    /**
     * Simulator test bench physics
     */
    _updateSimulation(dt) {
        let targetAccel = 0;

        if (this.simPedalDown) {
            this.targetThrottle = 1.0;
            // Sports acceleration through full speed range up to 260 km/h
            targetAccel = 8.5;
            this.currentSpeedKmh = Math.min(260, this.currentSpeedKmh + targetAccel * dt * 3.6);
        } else if (this.simBrakeDown) {
            this.targetThrottle = 0.0;
            targetAccel = -14.0;
            this.currentSpeedKmh = Math.max(0, this.currentSpeedKmh + targetAccel * dt * 3.6);
        } else {
            // Coasting
            this.targetThrottle = 0.0;
            targetAccel = -1.5;
            this.currentSpeedKmh = Math.max(0, this.currentSpeedKmh + targetAccel * dt * 3.6);
        }

        this.acceleration = targetAccel;
        this.targetSpeedKmh = this.currentSpeedKmh;
    }

    setSimPedal(isPressed) {
        this.simPedalDown = isPressed;
    }

    setSimBrake(isPressed) {
        this.simBrakeDown = isPressed;
    }

    setTransmissionMode(mode) {
        this.transmissionMode = mode;
    }

    setManualSpeedKmh(val) {
        this.targetSpeedKmh = Math.max(0, Math.min(260, val));
        this.currentSpeedKmh = this.targetSpeedKmh;
    }
}

window.VehiclePhysics = VehiclePhysics;
