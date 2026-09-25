/**
 * TeslaSound - Dynamic Acoustic Engine
 * Tuned for 0-130 km/h driving:
 * - Silent/Gentle Idle (NO boomy drone/hum when stopped or starting)
 * - Explosive roar & screaming high-RPM frequencies during acceleration
 * - Dynamic 2nd gear hold & kickdown scream
 * - Iconic Tofaş (Doğan/Şahin) vanalı abart egzoz, çatara patara, and rapid kesici
 */

class VehicleAudioEngine {
    constructor() {
        this.ctx = null;
        this.isStarted = false;
        this.isRunning = false;
        this.currentProfile = null;

        // Master nodes
        this.masterGain = null;
        this.engineMasterGain = null;
        this.compressor = null;
        this.analyser = null;

        // Custom Organic Combustion Waveforms
        this.pressurePulseWave = null;
        this.deepRumbleWave = null;
        this.tofasRaspWave = null;

        // Dynamic Resonator Network
        this.lowShelfFilter = null;
        this.exhaustCavityFilter = null;
        this.manifoldFilter = null;
        this.exhaustFilter1 = null;
        this.exhaustFilter2 = null;
        this.distortionNode = null;

        // Oscillators for engine harmonics
        this.oscillators = [];
        this.oscGains = [];

        // Sub-Bass Body Shaker (Active ONLY during acceleration/driving, NEVER at idle)
        this.subBassOsc = null;
        this.subBassGain = null;

        // Turbo nodes
        this.turboOsc = null;
        this.turboGain = null;
        this.turboFilter = null;

        // Supercharger nodes
        this.superchargerOsc = null;
        this.superchargerGain = null;

        // Mechanical noise
        this.noiseNode = null;
        this.noiseGain = null;
        this.noiseFilter = null;

        // Pop & crackle generator
        this.popTimeout = null;
        this.lastThrottle = 0;
        this.lastRpm = 1000;
        this.isShifting = false;

        // Exhaust modes: 'quiet', 'sport', 'race', 'straight_pipe'
        this.exhaustMode = 'race';
        this.masterVolume = 0.85;
    }

    /**
     * Initialize Audio Context on user gesture
     */
    async init() {
        if (this.ctx && this.ctx.state !== 'closed') {
            if (this.ctx.state === 'suspended') {
                await this.ctx.resume();
            }
            return;
        }

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext({ latencyHint: 'interactive', sampleRate: 44100 });

        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }

        this._buildCombustionWaveforms();

        // 1. Master Output Gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);

        // 2. Dynamics compressor
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-16, this.ctx.currentTime);
        this.compressor.knee.setValueAtTime(10, this.ctx.currentTime);
        this.compressor.ratio.setValueAtTime(6, this.ctx.currentTime);
        this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
        this.compressor.release.setValueAtTime(0.10, this.ctx.currentTime);

        // 3. Analyser for visualizer
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 128;
        this.analyser.smoothingTimeConstant = 0.80;

        this.masterGain.connect(this.compressor);
        this.compressor.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);

        // 4. Engine Master Gain - Starts at 0.0 (silent until rolling/accelerating)
        this.engineMasterGain = this.ctx.createGain();
        this.engineMasterGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

        // 5. Warm analog soft saturation
        this.distortionNode = this.ctx.createWaveShaper();
        this.distortionNode.curve = this._makeWarmSaturationCurve(1.6);
        this.distortionNode.oversample = '4x';

        // 6. Low-Shelf Filter (Dynamic: gentle +3dB at idle, up to +12dB under load)
        this.lowShelfFilter = this.ctx.createBiquadFilter();
        this.lowShelfFilter.type = 'lowshelf';
        this.lowShelfFilter.frequency.setValueAtTime(100, this.ctx.currentTime);
        this.lowShelfFilter.gain.setValueAtTime(3.0, this.ctx.currentTime);

        // 7. Muffler Chamber Cavity
        this.exhaustCavityFilter = this.ctx.createBiquadFilter();
        this.exhaustCavityFilter.type = 'peaking';
        this.exhaustCavityFilter.frequency.setValueAtTime(80, this.ctx.currentTime);
        this.exhaustCavityFilter.Q.setValueAtTime(1.4, this.ctx.currentTime);
        this.exhaustCavityFilter.gain.setValueAtTime(4.0, this.ctx.currentTime);

        // 8. Cylinder Manifold Resonance
        this.manifoldFilter = this.ctx.createBiquadFilter();
        this.manifoldFilter.type = 'peaking';
        this.manifoldFilter.frequency.setValueAtTime(140, this.ctx.currentTime);
        this.manifoldFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);
        this.manifoldFilter.gain.setValueAtTime(5.0, this.ctx.currentTime);

        // 9. Dual Low-Pass Filter Network
        this.exhaustFilter1 = this.ctx.createBiquadFilter();
        this.exhaustFilter1.type = 'lowpass';
        this.exhaustFilter1.frequency.setValueAtTime(220, this.ctx.currentTime);
        this.exhaustFilter1.Q.setValueAtTime(0.8, this.ctx.currentTime);

        this.exhaustFilter2 = this.ctx.createBiquadFilter();
        this.exhaustFilter2.type = 'lowpass';
        this.exhaustFilter2.frequency.setValueAtTime(350, this.ctx.currentTime);
        this.exhaustFilter2.Q.setValueAtTime(0.7, this.ctx.currentTime);

        // 10. Sub-Bass Seat Shaker (Starts muted: 0.0)
        this.subBassGain = this.ctx.createGain();
        this.subBassGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
        this.subBassOsc = this.ctx.createOscillator();
        this.subBassOsc.type = 'sine';
        this.subBassOsc.frequency.setValueAtTime(38, this.ctx.currentTime);
        this.subBassOsc.connect(this.subBassGain);
        this.subBassGain.connect(this.engineMasterGain);
        this.subBassOsc.start();

        // 11. Mechanical & Turbo layers
        this._initNoiseLayer();
        this._initTurboLayer();
        this._initSuperchargerLayer();

        // Wire Audio Graph
        this.engineMasterGain.connect(this.distortionNode);
        this.distortionNode.connect(this.lowShelfFilter);
        this.lowShelfFilter.connect(this.exhaustCavityFilter);
        this.exhaustCavityFilter.connect(this.manifoldFilter);
        this.manifoldFilter.connect(this.exhaustFilter1);
        this.exhaustFilter1.connect(this.exhaustFilter2);
        this.exhaustFilter2.connect(this.masterGain);

        this.isStarted = true;
        this.isRunning = false;
    }

    _buildCombustionWaveforms() {
        const nCoeffs = 32;

        // 1. Organic Pressure Pulse
        const real1 = new Float32Array(nCoeffs);
        const imag1 = new Float32Array(nCoeffs);
        real1[1] = 0; imag1[1] = 1.0;
        real1[2] = 0; imag1[2] = 0.60;
        real1[3] = 0; imag1[3] = 0.28;
        real1[4] = 0; imag1[4] = 0.10;
        this.pressurePulseWave = this.ctx.createPeriodicWave(real1, imag1);

        // 2. Sub-Rumble Deep Wave
        const real2 = new Float32Array(nCoeffs);
        const imag2 = new Float32Array(nCoeffs);
        real2[1] = 0; imag2[1] = 1.0;
        real2[2] = 0; imag2[2] = 0.35;
        this.deepRumbleWave = this.ctx.createPeriodicWave(real2, imag2);

        // 3. Tofaş & High-Rev Rasp Wave (crisp metallic abart exhaust character)
        const real3 = new Float32Array(nCoeffs);
        const imag3 = new Float32Array(nCoeffs);
        real3[1] = 0; imag3[1] = 1.0;
        real3[2] = 0; imag3[2] = 0.75; // Strong 2nd harmonic (4-cylinder bark)
        real3[3] = 0; imag3[3] = 0.45; // 3rd harmonic (open pipe rasp)
        real3[4] = 0; imag3[4] = 0.25; // 4th harmonic (tinny exhaust buzz)
        real3[5] = 0; imag3[5] = 0.12;
        this.tofasRaspWave = this.ctx.createPeriodicWave(real3, imag3);
    }

    _makeWarmSaturationCurve(drive) {
        const k = drive || 1.6;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        for (let i = 0; i < n_samples; ++i) {
            const x = (i * 2) / n_samples - 1;
            curve[i] = Math.tanh(k * x) / Math.tanh(k);
        }
        return curve;
    }

    _initNoiseLayer() {
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.992 * b0 + white * 0.04;
            b1 = 0.970 * b1 + white * 0.04;
            b2 = 0.900 * b2 + white * 0.04;
            data[i] = (b0 + b1 + b2) * 0.7;
        }

        this.noiseNode = this.ctx.createBufferSource();
        this.noiseNode.buffer = buffer;
        this.noiseNode.loop = true;

        this.noiseFilter = this.ctx.createBiquadFilter();
        this.noiseFilter.type = 'lowpass';
        this.noiseFilter.frequency.setValueAtTime(180, this.ctx.currentTime);
        this.noiseFilter.Q.setValueAtTime(0.7, this.ctx.currentTime);

        this.noiseGain = this.ctx.createGain();
        this.noiseGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

        this.noiseNode.connect(this.noiseFilter);
        this.noiseFilter.connect(this.noiseGain);
        this.noiseGain.connect(this.engineMasterGain);
        this.noiseNode.start();
    }

    _initTurboLayer() {
        this.turboOsc = this.ctx.createOscillator();
        this.turboOsc.type = 'sine';
        this.turboOsc.frequency.setValueAtTime(350, this.ctx.currentTime);

        this.turboFilter = this.ctx.createBiquadFilter();
        this.turboFilter.type = 'bandpass';
        this.turboFilter.frequency.setValueAtTime(550, this.ctx.currentTime);
        this.turboFilter.Q.setValueAtTime(2.2, this.ctx.currentTime);

        this.turboGain = this.ctx.createGain();
        this.turboGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

        this.turboOsc.connect(this.turboFilter);
        this.turboFilter.connect(this.turboGain);
        this.turboGain.connect(this.engineMasterGain);
        this.turboOsc.start();
    }

    _initSuperchargerLayer() {
        this.superchargerOsc = this.ctx.createOscillator();
        this.superchargerOsc.type = 'sine';
        this.superchargerOsc.frequency.setValueAtTime(220, this.ctx.currentTime);

        const scFilter = this.ctx.createBiquadFilter();
        scFilter.type = 'bandpass';
        scFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
        scFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);

        this.superchargerGain = this.ctx.createGain();
        this.superchargerGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

        this.superchargerOsc.connect(scFilter);
        scFilter.connect(this.superchargerGain);
        this.superchargerGain.connect(this.engineMasterGain);
        this.superchargerOsc.start();
    }

    /**
     * Start engine cleanly without aggressive booming starter rumble
     */
    start() {
        if (!this.ctx) return;
        this.isRunning = true;
        const now = this.ctx.currentTime;
        this.engineMasterGain.gain.cancelScheduledValues(now);
        // Start very softly at idle level (0.16) so it never booms or vibrates while stopped
        this.engineMasterGain.gain.setValueAtTime(0.0, now);
        this.engineMasterGain.gain.linearRampToValueAtTime(0.18, now + 0.15);
    }

    stop() {
        this.isRunning = false;
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        this.engineMasterGain.gain.cancelScheduledValues(now);
        this.engineMasterGain.gain.linearRampToValueAtTime(0.0, now + 0.05);

        if (this.subBassGain) {
            this.subBassGain.gain.cancelScheduledValues(now);
            this.subBassGain.gain.setValueAtTime(0.0, now + 0.05);
        }
        if (this.noiseGain) {
            this.noiseGain.gain.cancelScheduledValues(now);
            this.noiseGain.gain.setValueAtTime(0.0, now + 0.05);
        }
        if (this.turboGain) {
            this.turboGain.gain.cancelScheduledValues(now);
            this.turboGain.gain.setValueAtTime(0.0, now + 0.05);
        }
        if (this.superchargerGain) {
            this.superchargerGain.gain.cancelScheduledValues(now);
            this.superchargerGain.gain.setValueAtTime(0.0, now + 0.05);
        }

        if (this.popTimeout) {
            clearTimeout(this.popTimeout);
            this.popTimeout = null;
        }
    }

    loadProfile(profile) {
        this.currentProfile = profile;
        if (!this.isStarted) return;

        this.oscillators.forEach(item => {
            try { item.osc.stop(); item.osc.disconnect(); } catch (e) { }
        });
        this.oscillators = [];
        this.oscGains = [];

        const harmonics = profile.harmonics || [
            { multiplier: 1.0, gain: 0.70 },
            { multiplier: 2.0, gain: 0.40 }
        ];

        const isTofas = profile.id.includes('tofas');

        harmonics.forEach((hConfig) => {
            const osc = this.ctx.createOscillator();
            
            if (isTofas && this.tofasRaspWave) {
                osc.setPeriodicWave(this.tofasRaspWave);
            } else if (this.pressurePulseWave && hConfig.useCustom !== false) {
                osc.setPeriodicWave(hConfig.waveType === 'deep' ? this.deepRumbleWave : this.pressurePulseWave);
            } else {
                osc.type = hConfig.type || 'triangle';
            }

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.0, this.ctx.currentTime);

            osc.connect(gain);
            gain.connect(this.engineMasterGain);
            osc.start();

            this.oscillators.push({ osc, multiplier: hConfig.multiplier, detune: hConfig.detune || 0 });
            this.oscGains.push({ gain, baseGain: hConfig.gain || 0.4 });
        });

        if (profile.manifoldFreq) {
            this.manifoldFilter.frequency.setValueAtTime(profile.manifoldFreq, this.ctx.currentTime);
        }
    }

    /**
     * Dynamic Audio Update Loop
     * - Idle: Calm, gentle purr (NO room-shaking drone)
     * - Driving: Instant, explosive throttle response and high-rev scream
     */
    update(rpm, throttle, speedKmh, acceleration) {
        if (!this.isRunning || !this.isStarted || !this.currentProfile || this.isShifting) return;

        const now = this.ctx.currentTime;
        const profile = this.currentProfile;
        const isStopped = speedKmh < 0.8 && throttle < 0.05;

        // Base mechanical rotation frequency (RPM / 60)
        const rotationFreq = Math.max(12, rpm / 60);

        // 1. Sub-Bass Shaker Management:
        // ELIMINATE IDLE DRONE: When stopped, sub-bass is 0.0!
        // Only kicks in when vehicle is moving and under load
        if (isStopped) {
            this.subBassGain.gain.setTargetAtTime(0.0, now, 0.08);
            this.lowShelfFilter.gain.setTargetAtTime(2.0, now, 0.08); // Relax low-shelf
        } else {
            const subFreq = Math.max(30, Math.min(54, rotationFreq * 0.80));
            this.subBassOsc.frequency.setTargetAtTime(subFreq, now, 0.04);
            // Dynamic sub punch proportional to throttle and positive acceleration
            const accelPunch = Math.max(0, acceleration * 0.25);
            const subVolume = Math.min(1.2, (0.20 + throttle * 0.70 + accelPunch) * (this.exhaustMode === 'straight_pipe' ? 1.3 : 1.0));
            this.subBassGain.gain.setTargetAtTime(subVolume, now, 0.05);

            // Dynamic low shelf boost up to +12dB under heavy throttle
            const dynamicShelf = 3.0 + throttle * 8.5;
            this.lowShelfFilter.gain.setTargetAtTime(dynamicShelf, now, 0.06);
        }

        // 2. Harmonic Oscillators Frequency & Pitch
        this.oscillators.forEach((item) => {
            const targetFreq = rotationFreq * item.multiplier;
            item.osc.frequency.setTargetAtTime(Math.max(14, targetFreq), now, 0.03);
            if (item.detune) {
                const wobble = Math.sin(now * 12) * item.detune;
                item.osc.detune.setTargetAtTime(wobble, now, 0.02);
            }
        });

        // 3. Engine Master Volume & Load Response:
        // Idle is gentle (0.18). During acceleration bursts, volume dynamically surges!
        const accelBoost = Math.max(0, Math.min(0.40, acceleration * 0.25));
        const targetEngineGain = isStopped 
            ? 0.18 
            : Math.min(1.20, 0.75 + throttle * 0.25 + accelBoost);
        this.engineMasterGain.gain.setTargetAtTime(targetEngineGain, now, isStopped ? 0.12 : 0.035);

        // Update harmonic gains
        this.oscGains.forEach((item) => {
            const loadMultiplier = isStopped ? 0.35 : (0.65 + throttle * 0.65);
            item.gain.gain.setTargetAtTime(item.baseGain * loadMultiplier, now, 0.04);
        });

        // 4. Exhaust Filter Opening (Raspy high-RPM screams during 2nd gear pulls)
        let baseCutoff = profile.idleCutoff || 150;
        let maxCutoff = profile.redlineCutoff || 700;
        if (this.exhaustMode === 'quiet') maxCutoff *= 0.60;
        if (this.exhaustMode === 'straight_pipe') maxCutoff *= 1.25;

        const rpmRatio = Math.max(0, Math.min(1, (rpm - profile.idleRpm) / (profile.redlineRpm - profile.idleRpm)));
        // Aggressive filter opening: even mid-throttle opens the pipes
        const targetCutoff = isStopped 
            ? baseCutoff 
            : baseCutoff + (maxCutoff - baseCutoff) * (rpmRatio * 0.45 + throttle * 0.55);

        this.exhaustFilter1.frequency.setTargetAtTime(Math.min(1250, targetCutoff), now, 0.04);
        this.exhaustFilter1.Q.setTargetAtTime(0.75 + throttle * 0.40, now, 0.05);

        this.exhaustFilter2.frequency.setTargetAtTime(Math.min(1450, targetCutoff * 1.30), now, 0.04);
        this.exhaustFilter2.Q.setTargetAtTime(0.7, now, 0.05);

        // 5. Intake & Air Rush
        const intakeVolume = isStopped ? 0.0 : (0.02 + throttle * 0.08) * (rpm / profile.redlineRpm);
        this.noiseGain.gain.setTargetAtTime(intakeVolume, now, 0.05);
        this.noiseFilter.frequency.setTargetAtTime(140 + rpm * 0.06, now, 0.05);

        // 6. Turbo Whine
        if (profile.hasTurbo) {
            const turboSpool = isStopped ? 0.0 : Math.min(1.0, Math.max(0, throttle * 0.75 + (rpm / profile.redlineRpm) * 0.25));
            const turboFreq = 300 + turboSpool * 700;
            this.turboOsc.frequency.setTargetAtTime(turboFreq, now, 0.05);
            this.turboFilter.frequency.setTargetAtTime(turboFreq, now, 0.05);
            this.turboGain.gain.setTargetAtTime(turboSpool * 0.08, now, 0.06);

            if (this.lastThrottle > 0.55 && throttle < 0.20 && rpm > (profile.idleRpm + 1500)) {
                this.triggerBlowOffValve();
            }
        }

        // 7. Supercharger Whine
        if (profile.hasSupercharger) {
            const scRatio = profile.superchargerRatio || 1.8;
            const scFreq = Math.min(750, (rpm / 60) * scRatio * 2);
            this.superchargerOsc.frequency.setTargetAtTime(scFreq, now, 0.03);
            const scVol = isStopped ? 0.0 : (0.01 + throttle * 0.07) * (rpm / profile.redlineRpm);
            this.superchargerGain.gain.setTargetAtTime(scVol, now, 0.04);
        }

        // 8. Deceleration Pops, Bangs & Overrun (Çatara Patara)
        const isDecelerating = acceleration < -0.8 || (throttle < 0.15 && this.lastThrottle > 0.40);
        if (isDecelerating && rpm > (profile.idleRpm + 1200) && !this.popTimeout && !isStopped) {
            const popChance = (this.exhaustMode === 'straight_pipe' || profile.id.includes('tofas')) ? 0.88 : 0.55;
            if (Math.random() < popChance) {
                this.triggerPopAndBangs(rpm, profile);
            }
        }

        this.lastThrottle = throttle;
        this.lastRpm = rpm;
    }

    /**
     * Trigger cannon exhaust thumps and crackles
     */
    triggerPopAndBangs(rpm, profile) {
        if (!this.isRunning || this.isShifting) return;

        const isTofas = profile.id.includes('tofas');
        const count = isTofas ? (2 + Math.floor(Math.random() * 4)) : (1 + Math.floor(Math.random() * 3));
        let delay = 0;

        for (let i = 0; i < count; i++) {
            delay += 50 + Math.random() * 70;
            setTimeout(() => {
                if (!this.ctx || !this.isRunning) return;
                this._createSinglePop(rpm, profile);
            }, delay);
        }

        this.popTimeout = setTimeout(() => {
            this.popTimeout = null;
        }, delay + 250);
    }

    _createSinglePop(rpm, profile) {
        const now = this.ctx.currentTime;
        const isTofas = profile.id.includes('tofas');

        // Low thump oscillator
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = isTofas ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(isTofas ? (120 + Math.random() * 40) : (75 + Math.random() * 20), now);
        osc.frequency.exponentialRampToValueAtTime(isTofas ? 45 : 26, now + 0.09);

        const popGainVal = (isTofas ? 1.1 : 0.85) * (this.exhaustMode === 'straight_pipe' ? 1.3 : 1.0);
        oscGain.gain.setValueAtTime(popGainVal, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

        osc.connect(oscGain);
        oscGain.connect(this.engineMasterGain);
        osc.start(now);
        osc.stop(now + 0.12);

        // Sharp crackle burst
        const burstLen = isTofas ? 0.06 : 0.08;
        const burstBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * burstLen), this.ctx.sampleRate);
        const burstData = burstBuffer.getChannelData(0);
        for (let j = 0; j < burstData.length; j++) {
            burstData[j] = (Math.random() * 2 - 1) * Math.exp(-j / (this.ctx.sampleRate * (isTofas ? 0.015 : 0.025)));
        }

        const noiseSrc = this.ctx.createBufferSource();
        noiseSrc.buffer = burstBuffer;

        const crackleFilter = this.ctx.createBiquadFilter();
        crackleFilter.type = isTofas ? 'bandpass' : 'lowpass';
        crackleFilter.frequency.setValueAtTime(isTofas ? (450 + Math.random() * 300) : (320 + Math.random() * 150), now);
        crackleFilter.Q.setValueAtTime(isTofas ? 2.5 : 1.2, now);

        const crackleGain = this.ctx.createGain();
        crackleGain.gain.setValueAtTime(isTofas ? 0.65 : 0.40, now);

        noiseSrc.connect(crackleFilter);
        crackleFilter.connect(crackleGain);
        crackleGain.connect(this.engineMasterGain);
        noiseSrc.start(now);
    }

    triggerBlowOffValve() {
        if (!this.ctx || !this.isRunning || this.isShifting) return;
        const now = this.ctx.currentTime;

        const duration = 0.28;
        const bovBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * duration), this.ctx.sampleRate);
        const bovData = bovBuffer.getChannelData(0);

        for (let i = 0; i < bovData.length; i++) {
            const t = i / this.ctx.sampleRate;
            const flutter = 1.0 + 0.35 * Math.sin(2 * Math.PI * 20 * t);
            bovData[i] = (Math.random() * 2 - 1) * Math.exp(-t * 10) * flutter;
        }

        const bovSrc = this.ctx.createBufferSource();
        bovSrc.buffer = bovBuffer;

        const bovFilter = this.ctx.createBiquadFilter();
        bovFilter.type = 'bandpass';
        bovFilter.frequency.setValueAtTime(680, now);
        bovFilter.Q.setValueAtTime(1.4, now);

        const bovGain = this.ctx.createGain();
        bovGain.gain.setValueAtTime(0.24, now);

        bovSrc.connect(bovFilter);
        bovFilter.connect(bovGain);
        bovGain.connect(this.engineMasterGain);
        bovSrc.start(now);
    }

    triggerGearShift(isUpshift = true) {
        if (!this.ctx || !this.isRunning) return;
        const now = this.ctx.currentTime;
        this.isShifting = true;

        if (isUpshift) {
            // Crisp torque cut
            this.engineMasterGain.gain.setValueAtTime(0.85, now);
            this.engineMasterGain.gain.linearRampToValueAtTime(0.10, now + 0.015);
            this.engineMasterGain.gain.linearRampToValueAtTime(0.85, now + 0.08);

            setTimeout(() => {
                if (this.currentProfile && this.isRunning) {
                    this._createSinglePop(this.lastRpm, this.currentProfile);
                }
                this.isShifting = false;
            }, 50);
        } else {
            // Rev match throttle blip
            this.engineMasterGain.gain.setValueAtTime(0.85, now);
            this.engineMasterGain.gain.linearRampToValueAtTime(1.10, now + 0.025);
            this.engineMasterGain.gain.linearRampToValueAtTime(0.85, now + 0.10);

            setTimeout(() => {
                if (Math.random() < 0.70 && this.currentProfile && this.isRunning) {
                    this._createSinglePop(this.lastRpm, this.currentProfile);
                }
                this.isShifting = false;
            }, 70);
        }
    }

    /**
     * Tofaş / Supercar Ignition Cut Rev Limiter ("tatatatata")
     */
    triggerRevLimiter() {
        if (!this.ctx || !this.isRunning) return;
        const now = this.ctx.currentTime;
        
        // Fast ignition stutter
        this.engineMasterGain.gain.setValueAtTime(1.0, now);
        this.engineMasterGain.gain.setValueAtTime(0.0, now + 0.018);
        this.engineMasterGain.gain.setValueAtTime(1.0, now + 0.036);

        if (Math.random() < 0.75) {
            this._createSinglePop(this.lastRpm, this.currentProfile);
        }
    }

    setMasterVolume(val) {
        this.masterVolume = Math.max(0, Math.min(1, val));
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.05);
        }
    }

    setExhaustMode(mode) {
        this.exhaustMode = mode;
    }
}

window.VehicleAudioEngine = VehicleAudioEngine;
