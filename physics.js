/**
 * ApexRev - Physics & Vehicle Dynamics Simulation
 * Handles GPS smoothing, predictive acceleration estimation, automatic transmission,
 * manual paddle shifts, and realistic inertia modeling.
 */

class VehiclePhysics {
    constructor(audioEngine) {
        this.audio = audioEngine;
        this.profile = null;

        // Dynamic State
        this.currentSpeedKmh = 0;       // Displayed / simulated speed in km/h
        this.targetSpeedKmh = 0;        // Target speed from GPS or manual slider
        this.smoothedSpeedKmh = 0;
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
        this.shiftDurationMs = 120;     // Fast DCT shift

        // GPS tracking metadata
        this.lastGpsTimestamp = 0;
        this.lastGpsSpeedMs = 0;
        this.gpsAccuracy = null;
        this.gpsActive = false;

        // Constants for standard wheel dimensions (Tesla Model 3/Y 235/40 R19 ~ 0.67m diameter)
        this.wheelCircumferenceMeters = 2.10; 

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
     * Ingest new GPS position data from navigator.geolocation
     */
    handleGpsUpdate(position) {
        if (!this.isEngineRunning) return;
        const coords = position.coords;
        const now = position.timestamp || Date.now();
        this.gpsActive = true;
        this.gpsAccuracy = coords.accuracy;

        // coords.speed is in meters per second (null if device cannot calculate)
        let speedMs = coords.speed;

        if (speedMs === null || isNaN(speedMs) || speedMs < 0) {
            speedMs = 0;
        }

        // Convert to km/h
        const speedKmh = Math.max(0, speedMs * 3.6);
        this.targetSpeedKmh = speedKmh;

        // Calculate real acceleration from GPS points
        if (this.lastGpsTimestamp > 0 && now > this.lastGpsTimestamp) {
            const dtSeconds = (now - this.lastGpsTimestamp) / 1000;
            if (dtSeconds > 0.2 && dtSeconds < 4.0) {
                const dv = speedMs - this.lastGpsSpeedMs;
                this.acceleration = dv / dtSeconds;

                // Estimate throttle based on acceleration
                if (this.acceleration > 1.8) {
                    this.targetThrottle = 1.0; // Hard acceleration
                } else if (this.acceleration > 0.8) {
                    this.targetThrottle = 0.75;
                } else if (this.acceleration > 0.2) {
                    this.targetThrottle = 0.45;
                } else if (this.acceleration > -0.3 && speedKmh > 5) {
                    this.targetThrottle = 0.20; // Cruising
                } else {
                    this.targetThrottle = 0.0; // Deceleration / engine braking
                }
            }
        }

        this.lastGpsTimestamp = now;
        this.lastGpsSpeedMs = speedMs;
    }

    /**
     * Physics tick called every animation frame (dt in seconds)
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
            // GPS dead-reckoning smoothing (eliminates 1Hz GPS stutter)
            const speedSmoothingFactor = Math.min(1.0, dt * 5.0);
            this.currentSpeedKmh += (this.targetSpeedKmh - this.currentSpeedKmh) * speedSmoothingFactor;
        }

        // Throttle response smoothing (rapid rise, smooth fall)
        const throttleSmoothing = this.targetThrottle > this.throttle ? Math.min(1.0, dt * 14.0) : Math.min(1.0, dt * 7.0);
        this.throttle += (this.targetThrottle - this.throttle) * throttleSmoothing;
        this.throttle = Math.max(0, Math.min(1, this.throttle));

        // Calculate RPM based on current speed and gear ratio
        if (this.currentSpeedKmh < 0.5) {
            // Vehicle stopped / idling
            this.targetRpm = this.profile.idleRpm + (this.throttle * 4000); // Revving in neutral/park
            this.currentGear = 1;
        } else {
            const gearConfig = this.profile.gears[this.currentGear - 1] || this.profile.gears[0];
            const speedMps = (this.currentSpeedKmh * 1000) / 3600;
            const wheelRps = speedMps / this.wheelCircumferenceMeters;
            const calculatedRpm = wheelRps * gearConfig.ratio * this.profile.finalDrive * 60;

            this.targetRpm = Math.max(this.profile.idleRpm, calculatedRpm);

            // Automatic transmission logic
            if (this.transmissionMode === 'auto' && !this.isShifting) {
                this._handleAutoShifting();
            }

            // Rev limiter check
            if (this.currentRpm >= this.profile.redlineRpm) {
                this.audio.triggerRevLimiter();
                this.currentRpm = this.profile.redlineRpm - 150;
            }
        }

        // RPM inertia smoothing
        const rpmSmoothing = Math.min(1.0, dt * 18.0);
        this.currentRpm += (this.targetRpm - this.currentRpm) * rpmSmoothing;

        // Send state to audio engine
        this.audio.update(this.currentRpm, this.throttle, this.currentSpeedKmh, this.acceleration);
    }

    _handleAutoShifting() {
        const gears = this.profile.gears;
        const totalGears = gears.length;

        // Upshift condition: RPM exceeds shift threshold
        if (this.currentRpm >= this.profile.shiftRpm && this.currentGear < totalGears) {
            this.shiftUp();
            return;
        }

        // Downshift condition: RPM drops too low while vehicle is moving
        if (this.currentGear > 1) {
            const lowerGear = gears[this.currentGear - 2];
            const speedMps = (this.currentSpeedKmh * 1000) / 3600;
            const wheelRps = speedMps / this.wheelCircumferenceMeters;
            const projectedRpm = wheelRps * lowerGear.ratio * this.profile.finalDrive * 60;

            // Only downshift if the projected RPM won't exceed redline - 800
            if (this.currentRpm < (this.profile.idleRpm + 1400) && projectedRpm < (this.profile.redlineRpm - 800)) {
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
        this.throttle = Math.min(1.0, this.throttle + 0.5);

        setTimeout(() => {
            this.isShifting = false;
            this.throttle = originalThrottle;
        }, this.shiftDurationMs + 60);
    }

    /**
     * Simulator test bench physics (allows testing without driving)
     */
    _updateSimulation(dt) {
        let targetAccel = 0;

        if (this.simPedalDown) {
            this.targetThrottle = 1.0;
            // Realistic fast sports car acceleration (0-100 in 3.4s -> ~8 m/s^2)
            targetAccel = 7.5;
            this.currentSpeedKmh += targetAccel * dt * 3.6;
        } else if (this.simBrakeDown) {
            this.targetThrottle = 0.0;
            targetAccel = -12.0; // Hard braking
            this.currentSpeedKmh = Math.max(0, this.currentSpeedKmh + targetAccel * dt * 3.6);
        } else {
            // Coasting with gentle rolling friction and aerodynamic drag
            this.targetThrottle = 0.0;
            targetAccel = -1.2;
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
        this.targetSpeedKmh = Math.max(0, Math.min(350, val));
        this.currentSpeedKmh = this.targetSpeedKmh;
    }
}

window.VehiclePhysics = VehiclePhysics;
