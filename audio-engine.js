/**
 * TeslaSound - Deep Acoustic Engine (Tok & Bas Odaklı)
 * Anchored to true crankshaft mechanical rotation (RPM / 60),
 * massive 110Hz body resonance (+14dB low-shelf), custom rounded pressure-pulse
 * waveforms, and a steep brickwall low-pass filter cutting off harsh high frequencies.
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

        // Custom rounded acoustic pressure wave (eliminates harsh digital saw buzz)
        this.pressurePulseWave = null;
        this.deepRumbleWave = null;

        // Heavy Bass Resonator Network
        this.lowShelfFilter = null;     // Massive +14 dB bass boost around 95 Hz
        this.exhaustCavityFilter = null; // Peaking filter for muffler box boom at 75 Hz
        this.manifoldFilter = null;      // Throat resonance at 110-180 Hz
        this.exhaustFilter1 = null;      // Stage 1 steep lowpass
        this.exhaustFilter2 = null;      // Stage 2 brickwall lowpass
        this.distortionNode = null;

        // Oscillators for engine harmonics
        this.oscillators = [];
        this.oscGains = [];

        // Sub-bass body shaker (30-50 Hz)
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

        // Custom Organic Combustion Waveforms (Harmonics roll off fast, no screeching edges)
        this._buildCombustionWaveforms();

        // 1. Master Output Gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);

        // 2. Heavy-duty dynamics compressor (prevents bass clipping while giving maximum punch)
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
        this.compressor.knee.setValueAtTime(12, this.ctx.currentTime);
        this.compressor.ratio.setValueAtTime(8, this.ctx.currentTime);
        this.compressor.attack.setValueAtTime(0.004, this.ctx.currentTime);
        this.compressor.release.setValueAtTime(0.12, this.ctx.currentTime);

        // 3. Analyser for visualizer
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 128;
        this.analyser.smoothingTimeConstant = 0.82;

        this.masterGain.connect(this.compressor);
        this.compressor.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);

        // 4. Engine Master Gain
        this.engineMasterGain = this.ctx.createGain();
        this.engineMasterGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

        // 5. Warm analog soft saturation (warm tube compression)
        this.distortionNode = this.ctx.createWaveShaper();
        this.distortionNode.curve = this._makeWarmSaturationCurve(1.5);
        this.distortionNode.oversample = '4x';

        // 6. Massive Low-Shelf Filter (+14 dB at 95 Hz for thick, heavy exhaust displacement)
        this.lowShelfFilter = this.ctx.createBiquadFilter();
        this.lowShelfFilter.type = 'lowshelf';
        this.lowShelfFilter.frequency.setValueAtTime(95, this.ctx.currentTime);
        this.lowShelfFilter.gain.setValueAtTime(14.0, this.ctx.currentTime);

        // 7. Muffler Chamber Cavity Boom (peaking at 75 Hz, +8 dB)
        this.exhaustCavityFilter = this.ctx.createBiquadFilter();
        this.exhaustCavityFilter.type = 'peaking';
        this.exhaustCavityFilter.frequency.setValueAtTime(75, this.ctx.currentTime);
        this.exhaustCavityFilter.Q.setValueAtTime(1.6, this.ctx.currentTime);
        this.exhaustCavityFilter.gain.setValueAtTime(8.0, this.ctx.currentTime);

        // 8. Cylinder Manifold Resonance (warm throat at 110-180 Hz)
        this.manifoldFilter = this.ctx.createBiquadFilter();
        this.manifoldFilter.type = 'peaking';
        this.manifoldFilter.frequency.setValueAtTime(130, this.ctx.currentTime);
        this.manifoldFilter.Q.setValueAtTime(1.4, this.ctx.currentTime);
        this.manifoldFilter.gain.setValueAtTime(6.0, this.ctx.currentTime);

        // 9. Dual Low-Pass Filter Network (eliminates ALL tinny/thin highs; max cutoff 550-700 Hz)
        this.exhaustFilter1 = this.ctx.createBiquadFilter();
        this.exhaustFilter1.type = 'lowpass';
        this.exhaustFilter1.frequency.setValueAtTime(160, this.ctx.currentTime);
        this.exhaustFilter1.Q.setValueAtTime(0.8, this.ctx.currentTime);

        this.exhaustFilter2 = this.ctx.createBiquadFilter();
        this.exhaustFilter2.type = 'lowpass';
        this.exhaustFilter2.frequency.setValueAtTime(220, this.ctx.currentTime);
        this.exhaustFilter2.Q.setValueAtTime(0.7, this.ctx.currentTime);

        // 10. Sub-Bass Seat Shaker (32-52 Hz subwoofer vibration)
        this.subBassGain = this.ctx.createGain();
        this.subBassGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
        this.subBassOsc = this.ctx.createOscillator();
        this.subBassOsc.type = 'sine';
        this.subBassOsc.frequency.setValueAtTime(38, this.ctx.currentTime);
        this.subBassOsc.connect(this.subBassGain);
        this.subBassGain.connect(this.engineMasterGain);
        this.subBassOsc.start();

        // 11. Mechanical low rumble
        this._initNoiseLayer();

        // 12. Turbo & Supercharger
        this._initTurboLayer();
        this._initSuperchargerLayer();

        // Wire Audio Graph
        // [Sources] -> engineMasterGain -> distortionNode -> lowShelf -> exhaustCavity -> manifold -> exhaust1 -> exhaust2 -> masterGain
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

    /**
     * Custom Fourier Series for smooth, bass-heavy combustion pressure waves
     * (Zero harsh high-frequency harmonics)
     */
    _buildCombustionWaveforms() {
        const nCoeffs = 32;
        const real = new Float32Array(nCoeffs);
        const imag = new Float32Array(nCoeffs);

        // 1. Pressure pulse wave: heavy fundamental, warm 2nd/3rd harmonic, zero high fizz
        real[0] = 0;
        imag[0] = 0;
        real[1] = 0; imag[1] = 1.0;   // Fundamental (deep thud)
        real[2] = 0; imag[2] = 0.65;  // 2nd harmonic (exhaust pair)
        real[3] = 0; imag[3] = 0.30;  // 3rd harmonic (throat)
        real[4] = 0; imag[4] = 0.12;  // 4th harmonic
        real[5] = 0; imag[5] = 0.04;
        for (let i = 6; i < nCoeffs; i++) {
            real[i] = 0;
            imag[i] = 0;
        }
        this.pressurePulseWave = this.ctx.createPeriodicWave(real, imag);

        // 2. Sub-rumble wave: ultra-deep asymmetrical lope
        const r2 = new Float32Array(nCoeffs);
        const i2 = new Float32Array(nCoeffs);
        r2[1] = 0; i2[1] = 1.0;
        r2[2] = 0; i2[2] = 0.40;
        r2[3] = 0; i2[3] = 0.10;
        for (let i = 4; i < nCoeffs; i++) { r2[i] = 0; i2[i] = 0; }
        this.deepRumbleWave = this.ctx.createPeriodicWave(r2, i2);
    }

    _makeWarmSaturationCurve(drive) {
        const k = drive || 1.5;
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
        this.superchargerOsc.type = 'sine'; // Pure sine for low whine, no harsh saw
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

    start() {
        if (!this.ctx) return;
        this.isRunning = true;
        const now = this.ctx.currentTime;
        this.engineMasterGain.gain.cancelScheduledValues(now);
        this.engineMasterGain.gain.setValueAtTime(0.0, now);
        this.engineMasterGain.gain.linearRampToValueAtTime(0.85, now + 0.1);
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

        harmonics.forEach((hConfig) => {
            const osc = this.ctx.createOscillator();
            // Use organic combustion pressure pulse wave
            if (this.pressurePulseWave && hConfig.useCustom !== false) {
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
     */
    update(rpm, throttle, speedKmh, acceleration) {
        if (!this.isRunning || !this.isStarted || !this.currentProfile || this.isShifting) return;

        const now = this.ctx.currentTime;
        const profile = this.currentProfile;

        // CRITICAL ACOUSTIC FIX FOR "TOK SES":
        // Base frequency is anchored directly to Crankshaft Mechanical Rotational Speed (RPM / 60)!
        // 800 RPM -> 13.3 Hz (sub-audible mechanical chug)
        // 2500 RPM -> 41.6 Hz (deep chest-thump cruising rumble)
        // 5000 RPM -> 83.3 Hz (visceral, deep bass roar)
        // 7500 RPM -> 125 Hz (rich, heavy guttural roar, NOT a 500+ Hz thin beep)
        const rotationFreq = Math.max(10, rpm / 60);

        // Sub-Bass Body Shaker (tuned between 30 Hz and 50 Hz to directly vibrate Tesla seats)
        const subFreq = Math.max(28, Math.min(52, rotationFreq * 0.75));
        this.subBassOsc.frequency.setTargetAtTime(subFreq, now, 0.04);
        const subVolume = (0.50 + throttle * 0.65) * (this.exhaustMode === 'straight_pipe' ? 1.35 : 1.0);
        this.subBassGain.gain.setTargetAtTime(subVolume, now, 0.05);

        // Update harmonic oscillators based on true rotation frequency
        this.oscillators.forEach((item) => {
            const targetFreq = rotationFreq * item.multiplier;
            item.osc.frequency.setTargetAtTime(Math.max(14, targetFreq), now, 0.035);
            if (item.detune) {
                const wobble = Math.sin(now * 10) * item.detune;
                item.osc.detune.setTargetAtTime(wobble, now, 0.02);
            }
        });

        // Update gains based on engine load
        this.oscGains.forEach((item) => {
            const loadMultiplier = 0.65 + throttle * 0.60;
            item.gain.gain.setTargetAtTime(item.baseGain * loadMultiplier, now, 0.04);
        });

        // Dual Stage Brickwall Low-Pass Filters (Cutting off thin/high buzz)
        // Idle: 140-180 Hz (very deep, muffled bubbling lope)
        // Full throttle: 480-680 Hz (maximum deep roar, zero shrillness)
        let baseCutoff = profile.idleCutoff || 150;
        let maxCutoff = profile.redlineCutoff || 580;
        if (this.exhaustMode === 'quiet') maxCutoff *= 0.60;
        if (this.exhaustMode === 'straight_pipe') maxCutoff *= 1.20;

        const rpmRatio = Math.max(0, Math.min(1, (rpm - profile.idleRpm) / (profile.redlineRpm - profile.idleRpm)));
        const targetCutoff = baseCutoff + (maxCutoff - baseCutoff) * (rpmRatio * 0.40 + throttle * 0.60);

        this.exhaustFilter1.frequency.setTargetAtTime(Math.min(950, targetCutoff), now, 0.04);
        this.exhaustFilter1.Q.setTargetAtTime(0.75 + throttle * 0.35, now, 0.05);

        this.exhaustFilter2.frequency.setTargetAtTime(Math.min(1150, targetCutoff * 1.25), now, 0.04);
        this.exhaustFilter2.Q.setTargetAtTime(0.7, now, 0.05);

        // Low-end air intake thrum
        const intakeVolume = (0.02 + throttle * 0.05) * (rpm / profile.redlineRpm);
        this.noiseGain.gain.setTargetAtTime(intakeVolume, now, 0.05);
        this.noiseFilter.frequency.setTargetAtTime(140 + rpm * 0.05, now, 0.05);

        // Turbo Whine (warm, subtle low whistle)
        if (profile.hasTurbo) {
            const turboSpool = Math.min(1.0, Math.max(0, throttle * 0.70 + (rpm / profile.redlineRpm) * 0.30));
            const turboFreq = 300 + turboSpool * 650; // 300-950 Hz, deep and subtle
            this.turboOsc.frequency.setTargetAtTime(turboFreq, now, 0.06);
            this.turboFilter.frequency.setTargetAtTime(turboFreq, now, 0.06);
            this.turboGain.gain.setTargetAtTime(turboSpool * 0.06, now, 0.08);

            if (this.lastThrottle > 0.6 && throttle < 0.25 && rpm > 3200) {
                this.triggerBlowOffValve();
            }
        }

        // Supercharger Whine
        if (profile.hasSupercharger) {
            const scRatio = profile.superchargerRatio || 2.0;
            const scFreq = Math.min(650, (rpm / 60) * scRatio * 2);
            this.superchargerOsc.frequency.setTargetAtTime(scFreq, now, 0.03);
            const scVol = (0.01 + throttle * 0.06) * (rpm / profile.redlineRpm);
            this.superchargerGain.gain.setTargetAtTime(scVol, now, 0.04);
        }

        // Exhaust Cannon Pops & Thumps on Deceleration
        const isDecelerating = acceleration < -1.1 || (throttle < 0.12 && this.lastThrottle > 0.45);
        if (isDecelerating && rpm > (profile.idleRpm + 1600) && !this.popTimeout) {
            if (Math.random() < (this.exhaustMode === 'straight_pipe' ? 0.85 : 0.50)) {
                this.triggerPopAndBangs(rpm, profile);
            }
        }

        this.lastThrottle = throttle;
        this.lastRpm = rpm;
    }

    /**
     * Trigger deep cannon exhaust thumps
     */
    triggerPopAndBangs(rpm, profile) {
        if (!this.isRunning || this.isShifting) return;

        const count = 1 + Math.floor(Math.random() * 3);
        let delay = 0;

        for (let i = 0; i < count; i++) {
            delay += 60 + Math.random() * 80;
            setTimeout(() => {
                if (!this.ctx || !this.isRunning) return;
                this._createSinglePop(rpm, profile);
            }, delay);
        }

        this.popTimeout = setTimeout(() => {
            this.popTimeout = null;
        }, delay + 280);
    }

    _createSinglePop(rpm, profile) {
        const now = this.ctx.currentTime;

        // Deep sub-bass cannon thump (75 Hz down to 26 Hz)
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(75 + Math.random() * 20, now);
        osc.frequency.exponentialRampToValueAtTime(26, now + 0.10);

        oscGain.gain.setValueAtTime(0.85 * (this.exhaustMode === 'straight_pipe' ? 1.3 : 1.0), now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(oscGain);
        oscGain.connect(this.engineMasterGain);
        osc.start(now);
        osc.stop(now + 0.13);

        // Low muffled thud body (peaking around 220 Hz, not tinny crackle)
        const burstBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.08, this.ctx.sampleRate);
        const burstData = burstBuffer.getChannelData(0);
        for (let j = 0; j < burstData.length; j++) {
            burstData[j] = (Math.random() * 2 - 1) * Math.exp(-j / (this.ctx.sampleRate * 0.025));
        }

        const noiseSrc = this.ctx.createBufferSource();
        noiseSrc.buffer = burstBuffer;

        const crackleFilter = this.ctx.createBiquadFilter();
        crackleFilter.type = 'lowpass';
        crackleFilter.frequency.setValueAtTime(320 + Math.random() * 150, now);
        crackleFilter.Q.setValueAtTime(1.2, now);

        const crackleGain = this.ctx.createGain();
        crackleGain.gain.setValueAtTime(0.40, now);

        noiseSrc.connect(crackleFilter);
        crackleFilter.connect(crackleGain);
        crackleGain.connect(this.engineMasterGain);
        noiseSrc.start(now);
    }

    triggerBlowOffValve() {
        if (!this.ctx || !this.isRunning || this.isShifting) return;
        const now = this.ctx.currentTime;

        const duration = 0.30;
        const bovBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * duration, this.ctx.sampleRate);
        const bovData = bovBuffer.getChannelData(0);

        for (let i = 0; i < bovData.length; i++) {
            const t = i / this.ctx.sampleRate;
            const flutter = 1.0 + 0.3 * Math.sin(2 * Math.PI * 18 * t);
            bovData[i] = (Math.random() * 2 - 1) * Math.exp(-t * 9) * flutter;
        }

        const bovSrc = this.ctx.createBufferSource();
        bovSrc.buffer = bovBuffer;

        const bovFilter = this.ctx.createBiquadFilter();
        bovFilter.type = 'bandpass';
        bovFilter.frequency.setValueAtTime(650, now); // Deep air release
        bovFilter.Q.setValueAtTime(1.2, now);

        const bovGain = this.ctx.createGain();
        bovGain.gain.setValueAtTime(0.20, now);

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
            // DCT torque cut
            this.engineMasterGain.gain.setValueAtTime(0.85, now);
            this.engineMasterGain.gain.linearRampToValueAtTime(0.12, now + 0.02);
            this.engineMasterGain.gain.linearRampToValueAtTime(0.85, now + 0.10);

            setTimeout(() => {
                if (this.currentProfile && this.isRunning) {
                    this._createSinglePop(this.lastRpm, this.currentProfile);
                }
                this.isShifting = false;
            }, 55);
        } else {
            // Downshift rev match blip
            this.engineMasterGain.gain.setValueAtTime(0.85, now);
            this.engineMasterGain.gain.linearRampToValueAtTime(1.0, now + 0.03);
            this.engineMasterGain.gain.linearRampToValueAtTime(0.85, now + 0.12);

            setTimeout(() => {
                if (Math.random() < 0.65 && this.currentProfile && this.isRunning) {
                    this._createSinglePop(this.lastRpm, this.currentProfile);
                }
                this.isShifting = false;
            }, 80);
        }
    }

    triggerRevLimiter() {
        if (!this.ctx || !this.isRunning) return;
        const now = this.ctx.currentTime;
        this.engineMasterGain.gain.setValueAtTime(0.9, now);
        this.engineMasterGain.gain.setValueAtTime(0.0, now + 0.025);
        this.engineMasterGain.gain.setValueAtTime(0.9, now + 0.05);

        if (Math.random() < 0.6) {
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
