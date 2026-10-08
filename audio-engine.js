/**
 * TeslaSound - Dynamic Acoustic Engine (Next-Gen Procedural Engine Synthesizer)
 * 
 * Physics-Based Automotive Acoustic Architecture:
 * - Asymmetric Phase-Dispersed Combustion Waveforms (True Cylinder Exhaust Impulse)
 * - Dynamic Intake Induction Layer (Helmholtz Resonant Cavity Roar on Throttle)
 * - Micro-Jitter & Organic Crankshaft Imperfection (Eliminates Sterile Digital Synth Drone)
 * - Balanced Acoustic Formant Network:
 *     * Sub-Bass (38 Hz Clean Cut - Zero Infrasound Drone)
 *     * Engine Core Body (120-150 Hz Punch on Load, Clean Neutral Idle)
 *     * De-Mud Notch (280 Hz -1.5 dB - Eliminates Boxy Tractor Mud Completely)
 *     * Throat & Manifold Growl (420-560 Hz Dynamic Tracking)
 *     * Metallic Exhaust Rasp Formant (2600-3400 Hz Crisp Articulation / Net Ses)
 *     * Acoustic Exhaust Cutoff (Dynamic 2200 - 6500 Hz Rolloff - Zero Dentist-Drill Buzz)
 * - Asymmetric Pipe Saturation (Even & Odd Harmonics of Real Metal Exhaust Pipes)
 * - Multi-Stage Overrun Backfires & Pops ("Çatara Patara" & Gunshot Cracks)
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

        // Custom High-Clarity Asymmetric Periodic Waveforms
        this.combustionPulseWave = null;
        this.v8GrowlWave = null;
        this.raspyExhaustWave = null;
        this.boxerGrowlWave = null;
        this.deepRumbleWave = null;

        // Dynamic Combustion Modulation (Cylinder Firing Strobe)
        this.harmonicsBus = null;
        this.pulseModNode = null;
        this.pulseOsc = null;
        this.pulseDepthGain = null;
        this.camLopeOsc = null;
        this.camLopeDepthGain = null;

        // Dedicated Intake Induction Roar Subsystem
        this.intakeOsc = null;
        this.intakeFilter = null;
        this.intakeGain = null;

        // Acoustic Resonator & EQ Network
        this.distortionNode = null;
        this.subFilter = null;
        this.bodyFilter = null;
        this.deMudFilter = null;
        this.throatFilter = null;
        this.clarityFilter = null;
        this.exhaustFilter = null;
        this.presenceFilter = null;

        // Oscillators for engine harmonics
        this.oscillators = [];
        this.oscGains = [];

        // Sub-Bass Body Shaker (tight punch, strictly 0.0 at standstill)
        this.subBassOsc = null;
        this.subBassGain = null;

        // Turbo nodes
        this.turboOsc = null;
        this.turboGain = null;
        this.turboFilter = null;

        // Supercharger nodes
        this.superchargerOsc = null;
        this.superchargerGain = null;
        this.superchargerFilter = null;

        // Mechanical noise / Valvetrain texture
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
     * Initialize Web Audio Context on user gesture
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

        // 1. Synthesize Phase-Dispersed Asymmetric Periodic Waveforms
        this._buildCombustionWaveforms();

        // 2. Master Output Dynamics & Fast Peak Limiting
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);

        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-14, this.ctx.currentTime);
        this.compressor.knee.setValueAtTime(6, this.ctx.currentTime);
        this.compressor.ratio.setValueAtTime(4.0, this.ctx.currentTime);
        this.compressor.attack.setValueAtTime(0.002, this.ctx.currentTime);
        this.compressor.release.setValueAtTime(0.05, this.ctx.currentTime);

        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 128;
        this.analyser.smoothingTimeConstant = 0.70;

        this.masterGain.connect(this.compressor);
        this.compressor.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);

        // 3. Engine Master Fader
        this.engineMasterGain = this.ctx.createGain();
        this.engineMasterGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
        this.engineMasterGain.connect(this.masterGain);

        // 4. Harmonics Bus & Cylinder Firing Pulse Modulator
        this.harmonicsBus = this.ctx.createGain();
        this.harmonicsBus.gain.setValueAtTime(1.0, this.ctx.currentTime);

        this.pulseModNode = this.ctx.createGain();
        this.pulseModNode.gain.setValueAtTime(1.0, this.ctx.currentTime);

        // Cylinder Firing Pulse Oscillator
        this.pulseOsc = this.ctx.createOscillator();
        this.pulseOsc.type = 'sawtooth';
        this.pulseOsc.frequency.setValueAtTime(32, this.ctx.currentTime);

        this.pulseDepthGain = this.ctx.createGain();
        this.pulseDepthGain.gain.setValueAtTime(0.16, this.ctx.currentTime);

        this.pulseOsc.connect(this.pulseDepthGain);
        this.pulseDepthGain.connect(this.pulseModNode.gain);
        this.pulseOsc.start();

        // Cam Lope Modulator (uneven idle burble for V8 / carbs)
        this.camLopeOsc = this.ctx.createOscillator();
        this.camLopeOsc.type = 'triangle';
        this.camLopeOsc.frequency.setValueAtTime(12, this.ctx.currentTime);

        this.camLopeDepthGain = this.ctx.createGain();
        this.camLopeDepthGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

        this.camLopeOsc.connect(this.camLopeDepthGain);
        this.camLopeDepthGain.connect(this.pulseModNode.gain);
        this.camLopeOsc.start();

        this.harmonicsBus.connect(this.pulseModNode);

        // 5. Asymmetric Exhaust Pipe Saturation (WaveShaper)
        this.distortionNode = this.ctx.createWaveShaper();
        this.distortionNode.curve = this._makeAsymmetricExhaustCurve(1.4);
        this.distortionNode.oversample = '4x';
        this.pulseModNode.connect(this.distortionNode);

        // 6. Dedicated Intake Induction Roar Subsystem
        this._initIntakeSubsystem();

        // 7. Dynamic Acoustic EQ & Filter Resonator Chain:
        // A. Sub-Bass Filter (Highpass 38 Hz - removes DC offset & mud, keeps tight punch)
        this.subFilter = this.ctx.createBiquadFilter();
        this.subFilter.type = 'highpass';
        this.subFilter.frequency.setValueAtTime(38, this.ctx.currentTime);
        this.subFilter.Q.setValueAtTime(0.707, this.ctx.currentTime);

        // B. Body Filter (Peaking 130 Hz - solid mechanical engine mass under load)
        this.bodyFilter = this.ctx.createBiquadFilter();
        this.bodyFilter.type = 'peaking';
        this.bodyFilter.frequency.setValueAtTime(130, this.ctx.currentTime);
        this.bodyFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);
        this.bodyFilter.gain.setValueAtTime(0.0, this.ctx.currentTime);

        // C. De-Mud Filter (Peaking 280 Hz - cuts out the cardboard boxy drone completely!)
        this.deMudFilter = this.ctx.createBiquadFilter();
        this.deMudFilter.type = 'peaking';
        this.deMudFilter.frequency.setValueAtTime(280, this.ctx.currentTime);
        this.deMudFilter.Q.setValueAtTime(1.4, this.ctx.currentTime);
        this.deMudFilter.gain.setValueAtTime(-1.5, this.ctx.currentTime);

        // D. Throat Resonator (Peaking 440 Hz - vocal engine growl / manifold presence)
        this.throatFilter = this.ctx.createBiquadFilter();
        this.throatFilter.type = 'peaking';
        this.throatFilter.frequency.setValueAtTime(440, this.ctx.currentTime);
        this.throatFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);
        this.throatFilter.gain.setValueAtTime(1.5, this.ctx.currentTime);

        // E. Clarity & Metallic Rasp Formant (Peaking 2850 Hz - NETLİK & YIRTILMA)
        this.clarityFilter = this.ctx.createBiquadFilter();
        this.clarityFilter.type = 'peaking';
        this.clarityFilter.frequency.setValueAtTime(2850, this.ctx.currentTime);
        this.clarityFilter.Q.setValueAtTime(1.6, this.ctx.currentTime);
        this.clarityFilter.gain.setValueAtTime(4.0, this.ctx.currentTime);

        // F. Dynamic Exhaust Low-Pass (Natural pipe rolloff 2200 - 6500 Hz)
        this.exhaustFilter = this.ctx.createBiquadFilter();
        this.exhaustFilter.type = 'lowpass';
        this.exhaustFilter.frequency.setValueAtTime(2400, this.ctx.currentTime);
        this.exhaustFilter.Q.setValueAtTime(0.707, this.ctx.currentTime);

        // G. Presence High-Shelf (4200 Hz - sparkling crispness without ear fatigue)
        this.presenceFilter = this.ctx.createBiquadFilter();
        this.presenceFilter.type = 'highshelf';
        this.presenceFilter.frequency.setValueAtTime(4200, this.ctx.currentTime);
        this.presenceFilter.gain.setValueAtTime(2.0, this.ctx.currentTime);

        // Connect the Resonator Filter Chain
        this.distortionNode.connect(this.subFilter);
        this.subFilter.connect(this.bodyFilter);
        this.bodyFilter.connect(this.deMudFilter);
        this.deMudFilter.connect(this.throatFilter);
        this.throatFilter.connect(this.clarityFilter);
        this.clarityFilter.connect(this.exhaustFilter);
        this.exhaustFilter.connect(this.presenceFilter);
        this.presenceFilter.connect(this.engineMasterGain);

        // 8. Sub-Bass Body Shaker (Connected directly to engineMasterGain, strictly 0 at standstill)
        this.subBassGain = this.ctx.createGain();
        this.subBassGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
        this.subBassOsc = this.ctx.createOscillator();
        this.subBassOsc.type = 'sine';
        this.subBassOsc.frequency.setValueAtTime(46, this.ctx.currentTime);
        this.subBassOsc.connect(this.subBassGain);
        this.subBassGain.connect(this.engineMasterGain);
        this.subBassOsc.start();

        // 9. Auxiliary Acoustic Layers
        this._initNoiseLayer();
        this._initTurboLayer();
        this._initSuperchargerLayer();

        this.isStarted = true;
        this.isRunning = false;
    }

    /**
     * Dedicated Intake Induction Subsystem (Helmholtz Resonant Cavity Roar)
     */
    _initIntakeSubsystem() {
        this.intakeOsc = this.ctx.createOscillator();
        this.intakeOsc.type = 'sawtooth';
        this.intakeOsc.frequency.setValueAtTime(45, this.ctx.currentTime);

        this.intakeFilter = this.ctx.createBiquadFilter();
        this.intakeFilter.type = 'bandpass';
        this.intakeFilter.frequency.setValueAtTime(320, this.ctx.currentTime);
        this.intakeFilter.Q.setValueAtTime(2.2, this.ctx.currentTime);

        this.intakeGain = this.ctx.createGain();
        this.intakeGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

        this.intakeOsc.connect(this.intakeFilter);
        this.intakeFilter.connect(this.intakeGain);
        // Connect into the saturation node so induction roar warms up with the exhaust
        this.intakeGain.connect(this.distortionNode);
        this.intakeOsc.start();
    }

    /**
     * Synthesize Phase-Dispersed Asymmetric Periodic Waveforms
     * Real cylinder exhaust pressure wavefronts have both cosine and sine components
     */
    _buildCombustionWaveforms() {
        const nCoeffs = 32;

        const createAsymmetricWave = (ampFunc, phaseSpread = 0.38) => {
            const real = new Float32Array(nCoeffs);
            const imag = new Float32Array(nCoeffs);
            for (let i = 1; i < nCoeffs; i++) {
                const amp = ampFunc(i);
                const phase = (i * phaseSpread) % (Math.PI * 2);
                real[i] = amp * Math.cos(phase);
                imag[i] = amp * Math.sin(phase);
            }
            return this.ctx.createPeriodicWave(real, imag);
        };

        // 1. Organic Combustion Pulse (Punchy 4-stroke asymmetric cylinder exhaust wave)
        this.combustionPulseWave = createAsymmetricWave((i) => {
            return (i === 1 ? 0.75 : 1.0 / Math.pow(i, 0.88));
        }, 0.36);

        // 2. American Crossplane V8 Growl Wave (Deep burble, syncopated harmonics)
        const v8Amps = [
            0,
            0.65, 0.95, 0.40, 0.80, 0.25, 0.30, 0.18, 0.22,
            0.12, 0.10, 0.08, 0.07, 0.06, 0.05, 0.04, 0.035,
            0.03, 0.025, 0.02, 0.018, 0.015, 0.012, 0.01, 0.009,
            0.008, 0.007, 0.006, 0.005, 0.004, 0.003, 0.002
        ];
        this.v8GrowlWave = createAsymmetricWave((i) => v8Amps[i] || (1.0 / (i * 2)), 0.42);

        // 3. Tofaş Abart & Open Varex Raspy Wave (Odd harmonic dominance, razor-sharp metallic rasp)
        this.raspyExhaustWave = createAsymmetricWave((i) => {
            const isOdd = (i % 2 !== 0);
            return (i === 1 ? 0.60 : (isOdd ? 1.25 : 0.85) / Math.pow(i, 0.78));
        }, 0.48);

        // 4. Porsche Flat-6 Boxer Howl Wave (Prominent 3rd and 6th harmonic howl)
        this.boxerGrowlWave = createAsymmetricWave((i) => {
            const isThird = (i % 3 === 0);
            return (i === 1 ? 0.60 : (isThird ? 1.35 : 0.75) / Math.pow(i, 0.84));
        }, 0.32);

        // 5. Deep Foundation / EV Hyperdrive Wave
        this.deepRumbleWave = createAsymmetricWave((i) => {
            return 1.0 / Math.pow(i, 1.15);
        }, 0.22);
    }

    /**
     * Asymmetric wave shaping simulating hot steel exhaust pipe expansion
     */
    _makeAsymmetricExhaustCurve(k = 1.4, n_samples = 2048) {
        const curve = new Float32Array(n_samples);
        const norm = Math.tanh(k) + 0.12;
        for (let i = 0; i < n_samples; ++i) {
            const x = (i * 2) / (n_samples - 1) - 1;
            // Asymmetric tube saturation generates both even (warm) and odd (rasp) harmonics
            const y = Math.tanh(k * x) + 0.12 * Math.sin(Math.PI * x);
            curve[i] = y / norm;
        }
        return curve;
    }

    /**
     * Valvetrain, Camshaft & Mechanical Texture
     */
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
            data[i] = (b0 + b1 + b2) * 0.65;
        }

        this.noiseNode = this.ctx.createBufferSource();
        this.noiseNode.buffer = buffer;
        this.noiseNode.loop = true;

        this.noiseFilter = this.ctx.createBiquadFilter();
        this.noiseFilter.type = 'bandpass';
        this.noiseFilter.frequency.setValueAtTime(950, this.ctx.currentTime);
        this.noiseFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);

        this.noiseGain = this.ctx.createGain();
        this.noiseGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

        this.noiseNode.connect(this.noiseFilter);
        this.noiseFilter.connect(this.noiseGain);
        this.noiseGain.connect(this.engineMasterGain);
        this.noiseNode.start();
    }

    /**
     * Turbocharger Whine & Spool
     */
    _initTurboLayer() {
        this.turboOsc = this.ctx.createOscillator();
        this.turboOsc.type = 'sine';
        this.turboOsc.frequency.setValueAtTime(500, this.ctx.currentTime);

        this.turboFilter = this.ctx.createBiquadFilter();
        this.turboFilter.type = 'bandpass';
        this.turboFilter.frequency.setValueAtTime(850, this.ctx.currentTime);
        this.turboFilter.Q.setValueAtTime(2.6, this.ctx.currentTime);

        this.turboGain = this.ctx.createGain();
        this.turboGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

        this.turboOsc.connect(this.turboFilter);
        this.turboFilter.connect(this.turboGain);
        this.turboGain.connect(this.engineMasterGain);
        this.turboOsc.start();
    }

    /**
     * Roots-style Supercharger Screaming Whine
     */
    _initSuperchargerLayer() {
        this.superchargerOsc = this.ctx.createOscillator();
        this.superchargerOsc.type = 'sawtooth';
        this.superchargerOsc.frequency.setValueAtTime(350, this.ctx.currentTime);

        this.superchargerFilter = this.ctx.createBiquadFilter();
        this.superchargerFilter.type = 'bandpass';
        this.superchargerFilter.frequency.setValueAtTime(750, this.ctx.currentTime);
        this.superchargerFilter.Q.setValueAtTime(2.4, this.ctx.currentTime);

        this.superchargerGain = this.ctx.createGain();
        this.superchargerGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

        this.superchargerOsc.connect(this.superchargerFilter);
        this.superchargerFilter.connect(this.superchargerGain);
        this.superchargerGain.connect(this.engineMasterGain);
        this.superchargerOsc.start();
    }

    /**
     * Start engine with smooth idle ramp
     */
    start() {
        if (!this.ctx) return;
        this.isRunning = true;
        const now = this.ctx.currentTime;
        this.engineMasterGain.gain.cancelScheduledValues(now);
        this.engineMasterGain.gain.setValueAtTime(0.0, now);
        this.engineMasterGain.gain.linearRampToValueAtTime(0.32, now + 0.15);
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
        if (this.intakeGain) {
            this.intakeGain.gain.cancelScheduledValues(now);
            this.intakeGain.gain.setValueAtTime(0.0, now + 0.05);
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

    /**
     * Load vehicle acoustic profile
     */
    loadProfile(profile) {
        this.currentProfile = profile;
        if (!this.isStarted) return;

        // Disconnect old oscillators
        this.oscillators.forEach(item => {
            try { item.osc.stop(); item.osc.disconnect(); } catch (e) { }
        });
        this.oscillators = [];
        this.oscGains = [];

        const harmonics = profile.harmonics || [
            { multiplier: 1.0, gain: 0.35 },
            { multiplier: 2.0, gain: 0.90 }
        ];

        harmonics.forEach((hConfig, index) => {
            const osc = this.ctx.createOscillator();
            
            let chosenWave = this.combustionPulseWave;
            if (hConfig.waveType === 'v8growl' && this.v8GrowlWave) {
                chosenWave = this.v8GrowlWave;
            } else if (hConfig.waveType === 'rasp' && this.raspyExhaustWave) {
                chosenWave = this.raspyExhaustWave;
            } else if (hConfig.waveType === 'boxer' && this.boxerGrowlWave) {
                chosenWave = this.boxerGrowlWave;
            } else if (hConfig.waveType === 'growl' && this.v8GrowlWave) {
                chosenWave = this.v8GrowlWave;
            } else if (hConfig.waveType === 'deep' && this.deepRumbleWave) {
                chosenWave = this.deepRumbleWave;
            } else if (hConfig.waveType === 'pulse' && this.combustionPulseWave) {
                chosenWave = this.combustionPulseWave;
            }

            if (chosenWave) {
                osc.setPeriodicWave(chosenWave);
            } else {
                osc.type = hConfig.type || 'sawtooth';
            }

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.0, this.ctx.currentTime);

            osc.connect(gain);
            gain.connect(this.harmonicsBus);
            osc.start();

            this.oscillators.push({ 
                osc, 
                multiplier: hConfig.multiplier, 
                detune: hConfig.detune || 0,
                index: index 
            });
            this.oscGains.push({ gain, baseGain: hConfig.gain || 0.4 });
        });

        if (profile.throatFreq) {
            this.throatFilter.frequency.setValueAtTime(profile.throatFreq, this.ctx.currentTime);
        }
        if (profile.clarityFreq) {
            this.clarityFilter.frequency.setValueAtTime(profile.clarityFreq, this.ctx.currentTime);
        }
    }

    /**
     * Dynamic Audio Update Loop (Instant 12ms tracking, zero lag)
     */
    update(rpm, throttle, speedKmh, acceleration) {
        if (!this.isRunning || !this.isStarted || !this.currentProfile || this.isShifting) return;

        const now = this.ctx.currentTime;
        const profile = this.currentProfile;
        const isStopped = speedKmh < 0.3 && throttle < 0.01;
        const rpmRatio = Math.max(0, Math.min(1, (rpm - profile.idleRpm) / (profile.redlineRpm - profile.idleRpm)));

        // Base rotational frequency (RPM / 60)
        const rotationFreq = Math.max(12, rpm / 60);

        // 1. Organic Cylinder Firing Strobe Modulation
        const cylinders = profile.cylinders || 4;
        const firingFreq = rotationFreq * (cylinders / 2);
        this.pulseOsc.frequency.setTargetAtTime(Math.max(16, firingFreq), now, 0.012);

        // Distinct rhythmic cylinder purr at idle (16%), smooth at high revs (8%)
        const basePulseDepth = isStopped ? 0.16 : (0.14 - rpmRatio * 0.06 + throttle * 0.04);
        this.pulseDepthGain.gain.setTargetAtTime(basePulseDepth, now, 0.015);

        // Cam lope (V8 / AMG / Carb / Subaru Boxer idle burble)
        const isV8 = profile.id.includes('v8') || profile.id.includes('amg');
        const isCarbOrBoxer = profile.id.includes('tofas') || profile.id.includes('subaru');
        const lopeDepth = isStopped ? (isV8 ? 0.12 : (isCarbOrBoxer ? 0.08 : 0.0)) : 0.0;
        this.camLopeDepthGain.gain.setTargetAtTime(lopeDepth, now, 0.02);

        // 2. Harmonic Oscillators Pitch & Organic Micro-Jitter
        this.oscillators.forEach((item) => {
            const targetFreq = rotationFreq * item.multiplier;
            item.osc.frequency.setTargetAtTime(Math.max(14, targetFreq), now, 0.012);

            // Crankshaft micro-variance removes sterile digital phase-lock
            const microJitter = Math.sin(now * 11.0 + item.index * 1.7) * 2.5;
            const detuneVal = (item.detune || 0) + microJitter;
            item.osc.detune.setTargetAtTime(detuneVal, now, 0.015);
        });

        // Individual Harmonic Level Balance
        this.oscGains.forEach((item) => {
            const loadMultiplier = isStopped ? 0.50 : (0.75 + throttle * 0.45);
            item.gain.gain.setTargetAtTime(item.baseGain * loadMultiplier, now, 0.015);
        });

        // 3. Dynamic Intake Induction Roar (Helmholtz Resonant Cavity)
        const intakeFreq = Math.max(26, rotationFreq * 1.5);
        this.intakeOsc.frequency.setTargetAtTime(intakeFreq, now, 0.015);

        const baseIntakeRes = profile.manifoldFreq ? (profile.manifoldFreq * 2.3) : 320;
        const dynamicIntakeRes = baseIntakeRes + (rpmRatio * 150);
        this.intakeFilter.frequency.setTargetAtTime(dynamicIntakeRes, now, 0.02);

        // Induction roar opens aggressively on throttle, silent at idle/coasting
        const targetIntakeGain = isStopped 
            ? 0.0 
            : (Math.pow(throttle, 1.25) * 0.42 + Math.max(0, acceleration * 0.06));
        this.intakeGain.gain.setTargetAtTime(targetIntakeGain, now, 0.015);

        // 4. Sub-Bass Seat Shaker (STRICTLY 0.0 at standstill, tight punch under load)
        if (isStopped) {
            this.subBassGain.gain.setTargetAtTime(0.0, now, 0.04);
            this.bodyFilter.gain.setTargetAtTime(0.0, now, 0.04);
        } else {
            const subFreq = Math.max(38, Math.min(52, rotationFreq * 0.85));
            this.subBassOsc.frequency.setTargetAtTime(subFreq, now, 0.02);
            const subVolume = Math.min(0.20, 0.04 + throttle * 0.14);
            this.subBassGain.gain.setTargetAtTime(subVolume, now, 0.02);

            const dynamicBody = 0.5 + throttle * 2.0;
            this.bodyFilter.gain.setTargetAtTime(dynamicBody, now, 0.02);
        }

        // 5. De-Mud Filter (Fixed -1.5 dB at 280 Hz: completely destroys boxy tractor drone)
        this.deMudFilter.gain.setTargetAtTime(-1.5, now, 0.02);

        // 6. Throat Formant (Vocal engine growl)
        const baseThroat = profile.throatFreq || 420;
        const dynamicThroat = baseThroat + (rpmRatio * 75);
        this.throatFilter.frequency.setTargetAtTime(dynamicThroat, now, 0.02);
        const dynamicThroatGain = 1.0 + throttle * 2.0;
        this.throatFilter.gain.setTargetAtTime(dynamicThroatGain, now, 0.02);

        // 7. Clarity & Metallic Exhaust Rasp (Netlik & Egzoz Yırtılması)
        const baseClarity = profile.clarityFreq || 2850;
        const dynamicClarity = baseClarity + (rpmRatio * 320);
        this.clarityFilter.frequency.setTargetAtTime(dynamicClarity, now, 0.018);
        const clarityBoost = (isStopped ? 2.5 : 3.5) + (throttle * 3.5);
        this.clarityFilter.gain.setTargetAtTime(clarityBoost, now, 0.018);

        // 8. Dynamic Exhaust Pipe Lowpass (Smooth, natural 2200 - 6500 Hz acoustic rolloff)
        let baseCutoff = profile.idleCutoff || 2200;
        let maxCutoff = profile.redlineCutoff || 6200;
        if (this.exhaustMode === 'quiet') {
            baseCutoff *= 0.80;
            maxCutoff *= 0.70;
        } else if (this.exhaustMode === 'sport') {
            maxCutoff *= 1.00;
        } else if (this.exhaustMode === 'race') {
            maxCutoff *= 1.15;
        } else if (this.exhaustMode === 'straight_pipe') {
            baseCutoff *= 1.15;
            maxCutoff *= 1.25;
        }

        const targetCutoff = isStopped
            ? baseCutoff
            : baseCutoff + (maxCutoff - baseCutoff) * (rpmRatio * 0.40 + throttle * 0.60);

        this.exhaustFilter.frequency.setTargetAtTime(Math.min(7500, targetCutoff), now, 0.016);
        this.exhaustFilter.Q.setTargetAtTime(0.707, now, 0.02);

        // 9. Presence High-Shelf Filter
        let presenceGain = 0;
        if (this.exhaustMode === 'quiet') presenceGain = -2.5;
        else if (this.exhaustMode === 'sport') presenceGain = 1.0 + throttle * 1.5;
        else if (this.exhaustMode === 'race') presenceGain = 2.5 + throttle * 2.0;
        else if (this.exhaustMode === 'straight_pipe') presenceGain = 4.0 + throttle * 2.5;
        this.presenceFilter.gain.setTargetAtTime(presenceGain, now, 0.02);

        // 10. Master Engine Gain Response (Instantaneous 12ms attack on pedal touch!)
        const accelBoost = Math.max(0, Math.min(0.20, acceleration * 0.18));
        const targetEngineGain = isStopped 
            ? 0.32 
            : Math.min(1.10, 0.72 + throttle * 0.28 + accelBoost);
        const gainRamp = (targetEngineGain > this.engineMasterGain.gain.value) ? 0.012 : 0.035;
        this.engineMasterGain.gain.setTargetAtTime(targetEngineGain, now, gainRamp);

        // 11. Mechanical Valvetrain & Air Texture
        const mechVolume = isStopped ? 0.015 : (0.02 + throttle * 0.06) * (rpm / profile.redlineRpm);
        this.noiseGain.gain.setTargetAtTime(mechVolume, now, 0.03);
        this.noiseFilter.frequency.setTargetAtTime(950 + rpm * 0.22, now, 0.03);

        // 12. Turbocharger Whine & Spool
        if (profile.hasTurbo) {
            const turboSpool = isStopped ? 0.0 : Math.min(1.0, Math.max(0, throttle * 0.75 + rpmRatio * 0.25));
            const turboFreq = 450 + turboSpool * 1100;
            this.turboOsc.frequency.setTargetAtTime(turboFreq, now, 0.035);
            this.turboFilter.frequency.setTargetAtTime(turboFreq, now, 0.035);
            this.turboGain.gain.setTargetAtTime(turboSpool * 0.14, now, 0.04);

            if (this.lastThrottle > 0.55 && throttle < 0.20 && rpm > (profile.idleRpm + 1400)) {
                this.triggerBlowOffValve();
            }
        }

        // 13. Supercharger Screaming Whine
        if (profile.hasSupercharger) {
            const scRatio = profile.superchargerRatio || 1.85;
            const scFreq = Math.min(1250, (rpm / 60) * scRatio * 2);
            this.superchargerOsc.frequency.setTargetAtTime(scFreq, now, 0.025);
            this.superchargerFilter.frequency.setTargetAtTime(scFreq, now, 0.025);
            const scVol = isStopped ? 0.0 : (0.02 + throttle * 0.12) * rpmRatio;
            this.superchargerGain.gain.setTargetAtTime(scVol, now, 0.03);
        }

        // 14. Deceleration Pops, Bangs & Overrun ("Çatara Patara")
        const isDecelerating = acceleration < -0.8 || (throttle < 0.15 && this.lastThrottle > 0.40);
        if (isDecelerating && rpm > (profile.idleRpm + 1200) && !this.popTimeout && !isStopped) {
            const isAggressiveCar = profile.id.includes('tofas') || profile.id.includes('r34') || profile.id.includes('amg') || profile.id.includes('m3');
            const popChance = (this.exhaustMode === 'straight_pipe' || isAggressiveCar) ? 0.88 : 0.55;
            if (Math.random() < popChance) {
                this.triggerPopAndBangs(rpm, profile);
            }
        }

        this.lastThrottle = throttle;
        this.lastRpm = rpm;
    }

    /**
     * Trigger Multi-Stage Exhaust Crackles & Overrun
     */
    triggerPopAndBangs(rpm, profile) {
        if (!this.isRunning || this.isShifting) return;

        const isAggressiveCar = profile.id.includes('tofas') || profile.id.includes('r34') || profile.id.includes('amg') || profile.id.includes('m3');
        const count = isAggressiveCar ? (2 + Math.floor(Math.random() * 4)) : (1 + Math.floor(Math.random() * 3));
        let delay = 0;

        for (let i = 0; i < count; i++) {
            delay += 40 + Math.random() * 60;
            setTimeout(() => {
                if (!this.ctx || !this.isRunning) return;
                this._createSinglePop(rpm, profile);
            }, delay);
        }

        this.popTimeout = setTimeout(() => {
            this.popTimeout = null;
        }, delay + 220);
    }

    _createSinglePop(rpm, profile) {
        const now = this.ctx.currentTime;
        const isTofas = profile.id.includes('tofas');
        const isAggressive = isTofas || profile.id.includes('r34') || profile.id.includes('amg') || profile.id.includes('m3');

        // 1. Low-end exhaust chamber thump
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = isAggressive ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(isAggressive ? (145 + Math.random() * 35) : (95 + Math.random() * 30), now);
        osc.frequency.exponentialRampToValueAtTime(isAggressive ? 45 : 30, now + 0.07);

        const popGainVal = (isAggressive ? 1.20 : 0.90) * (this.exhaustMode === 'straight_pipe' ? 1.35 : 1.0);
        oscGain.gain.setValueAtTime(popGainVal, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc.connect(oscGain);
        oscGain.connect(this.engineMasterGain);
        osc.start(now);
        osc.stop(now + 0.10);

        // 2. Sharp metallic gunshot snap (crisp exhaust crack)
        const burstLen = isAggressive ? 0.05 : 0.06;
        const burstBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * burstLen), this.ctx.sampleRate);
        const burstData = burstBuffer.getChannelData(0);
        for (let j = 0; j < burstData.length; j++) {
            burstData[j] = (Math.random() * 2 - 1) * Math.exp(-j / (this.ctx.sampleRate * 0.014));
        }

        const noiseSrc = this.ctx.createBufferSource();
        noiseSrc.buffer = burstBuffer;

        const crackleFilter = this.ctx.createBiquadFilter();
        crackleFilter.type = 'bandpass';
        crackleFilter.frequency.setValueAtTime(isTofas ? (2200 + Math.random() * 700) : (1800 + Math.random() * 500), now);
        crackleFilter.Q.setValueAtTime(2.4, now);

        const crackleGain = this.ctx.createGain();
        crackleGain.gain.setValueAtTime(isTofas ? 0.95 : 0.65, now);

        noiseSrc.connect(crackleFilter);
        crackleFilter.connect(crackleGain);
        crackleGain.connect(this.engineMasterGain);
        noiseSrc.start(now);
    }

    /**
     * Turbo Blow-Off Valve Flutter ("su-su-su-tsuuu!")
     */
    triggerBlowOffValve() {
        if (!this.ctx || !this.isRunning || this.isShifting) return;
        const now = this.ctx.currentTime;

        const duration = 0.32;
        const bovBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * duration), this.ctx.sampleRate);
        const bovData = bovBuffer.getChannelData(0);

        for (let i = 0; i < bovData.length; i++) {
            const t = i / this.ctx.sampleRate;
            const flutter = 1.0 + 0.45 * Math.sin(2 * Math.PI * 25 * t);
            bovData[i] = (Math.random() * 2 - 1) * Math.exp(-t * 8.5) * flutter;
        }

        const bovSrc = this.ctx.createBufferSource();
        bovSrc.buffer = bovBuffer;

        const bovFilter = this.ctx.createBiquadFilter();
        bovFilter.type = 'bandpass';
        bovFilter.frequency.setValueAtTime(1350, now);
        bovFilter.Q.setValueAtTime(1.8, now);

        const bovGain = this.ctx.createGain();
        bovGain.gain.setValueAtTime(0.38, now);

        bovSrc.connect(bovFilter);
        bovFilter.connect(bovGain);
        bovGain.connect(this.engineMasterGain);
        bovSrc.start(now);
    }

    /**
     * Synthesize realistic starter motor crank and ignition surge
     * High-fidelity sample-level DSP with solenoid clicks, cyclic compression strain,
     * pinion gear mesh, bendix freewheel, and cold-start induction roar
     */
    triggerIgnitionAudio(profile, onFire) {
        if (!this.ctx) return;
        this.isRunning = true;
        const now = this.ctx.currentTime;
        const isTofas = profile.id.includes('tofas');
        const isV8 = profile.id.includes('v8') || profile.id.includes('amg');
        const isSupercar = profile.id.includes('ferrari') || profile.id.includes('lambo') || profile.id.includes('porsche') || profile.id.includes('gt3') || profile.id.includes('m3');

        const duration = isTofas ? 0.96 : (isV8 ? 0.90 : 0.82);
        const sampleRate = this.ctx.sampleRate;
        const numSamples = Math.floor(sampleRate * duration);
        const starterBuffer = this.ctx.createBuffer(1, numSamples, sampleRate);
        const channelData = starterBuffer.getChannelData(0);

        // 1. Solenoid engagement mechanical impacts (solenoid pull-in & pinion ring gear mesh)
        for (let i = 0; i < Math.floor(sampleRate * 0.04); i++) {
            const t = i / sampleRate;
            const click1 = (Math.random() * 2 - 1) * Math.exp(-t * 220);
            const ring1 = Math.sin(2 * Math.PI * 1450 * t) * Math.exp(-t * 120) * 0.55;
            channelData[i] += (click1 + ring1) * 0.70;
        }
        const meshOffset = Math.floor(sampleRate * 0.026);
        for (let i = meshOffset; i < Math.floor(sampleRate * 0.065); i++) {
            const t = (i - meshOffset) / sampleRate;
            const click2 = (Math.random() * 2 - 1) * Math.exp(-t * 260);
            const ring2 = Math.sin(2 * Math.PI * 2100 * t) * Math.exp(-t * 140) * 0.45;
            channelData[i] += (click2 + ring2) * 0.60;
        }

        // 2. Starter Cranking (Rhythmic compression resistance & gear whine)
        const crankRate = isTofas ? 4.2 : (isV8 ? 4.6 : 5.4); // revs/sec
        const baseGearFreq = isSupercar ? 820 : (isTofas ? 510 : (isV8 ? 620 : 710));
        const compFreqMultiplier = (profile.cylinders || 4) / 2;
        const pulseFreq = crankRate * compFreqMultiplier;

        for (let i = Math.floor(sampleRate * 0.035); i < numSamples; i++) {
            const t = i / sampleRate;
            const progress = (t - 0.035) / (duration - 0.035);

            // Cyclic compression hesitation (starter strains as piston reaches TDC)
            const cyclePhase = (t * pulseFreq * 2 * Math.PI);
            const compressionDip = Math.pow(Math.max(0, Math.cos(cyclePhase)), 2.8);
            const instSpeed = 1.0 - (isTofas ? 0.38 : (isV8 ? 0.32 : 0.25)) * compressionDip;

            // Electric armature gear mesh whine
            const gearFreq = (baseGearFreq + progress * 90) * instSpeed;
            const gearSine = Math.sin(2 * Math.PI * gearFreq * t);
            const gearHarmonic = Math.sin(4 * Math.PI * gearFreq * t) * 0.35;
            const gearWhine = (gearSine + gearHarmonic) * 0.24 * (1.0 - 0.3 * compressionDip);

            // Low-end cylinder compression thud (the mechanical 'chug / gıj')
            const thudFreq = isV8 ? 58 : (isTofas ? 68 : 82);
            const thud = Math.sin(2 * Math.PI * (thudFreq * instSpeed) * t) * compressionDip * 0.45;

            // Commutator / brush mechanical friction texture
            const brushNoise = (Math.random() * 2 - 1) * (0.07 + 0.18 * compressionDip);

            // Fade out as engine fires
            const fireStartTime = duration - 0.16;
            const fadeOut = t > fireStartTime ? Math.max(0, (duration - t) / 0.16) : 1.0;

            channelData[i] += (gearWhine + thud + brushNoise) * fadeOut;
        }

        // 3. Overrunning bendix clutch freewheel spin-down whirr
        const clutchStartTime = Math.floor(sampleRate * (duration - 0.15));
        for (let i = clutchStartTime; i < numSamples; i++) {
            const t = (i - clutchStartTime) / sampleRate;
            const clutchFreq = 1600 - t * 6500;
            if (clutchFreq > 200) {
                const clutchWhine = Math.sin(2 * Math.PI * clutchFreq * t) * Math.exp(-t * 22) * 0.22;
                const clutchRustle = (Math.random() * 2 - 1) * Math.exp(-t * 25) * 0.12;
                channelData[i] += (clutchWhine + clutchRustle);
            }
        }

        // Soft clip normalization
        for (let i = 0; i < numSamples; i++) {
            channelData[i] = Math.tanh(channelData[i] * 1.25) * 0.90;
        }

        // Play the high-fidelity starter buffer
        const starterSource = this.ctx.createBufferSource();
        starterSource.buffer = starterBuffer;

        const starterFilter = this.ctx.createBiquadFilter();
        starterFilter.type = 'lowpass';
        starterFilter.frequency.setValueAtTime(4500, now);

        const starterGain = this.ctx.createGain();
        starterGain.gain.setValueAtTime(0.88, now);

        starterSource.connect(starterFilter);
        starterFilter.connect(starterGain);
        starterGain.connect(this.masterGain);

        starterSource.start(now);

        // 4. Combustion Fire Catch & Cold-Start Throttle Bark
        const fireDelayMs = Math.round((duration - 0.15) * 1000);
        setTimeout(() => {
            if (!this.ctx) return;
            if (onFire) onFire();

            // First fire compression bark
            this._createSinglePop(profile.idleRpm + 2200, profile);

            const fireNow = this.ctx.currentTime;

            // Open induction roar for authentic cold-start breath
            if (this.intakeGain) {
                this.intakeGain.gain.cancelScheduledValues(fireNow);
                this.intakeGain.gain.setValueAtTime(0.42, fireNow);
                this.intakeGain.gain.exponentialRampToValueAtTime(0.001, fireNow + 0.55);
            }

            // Start main engine gain with explosive attack
            this.engineMasterGain.gain.cancelScheduledValues(fireNow);
            this.engineMasterGain.gain.setValueAtTime(0.12, fireNow);
            this.engineMasterGain.gain.linearRampToValueAtTime(0.96, fireNow + 0.07);
            this.engineMasterGain.gain.exponentialRampToValueAtTime(0.32, fireNow + 0.65);
        }, fireDelayMs);
    }

    /**
     * Shutdown Audio (Fuel cut & progressive 4-stroke compression rundown)
     */
    triggerShutdownAudio(onComplete) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const profile = this.currentProfile || { cylinders: 4 };
        const isTofas = profile.id && profile.id.includes('tofas');

        // Smoothly fade main engine gain
        this.engineMasterGain.gain.cancelScheduledValues(now);
        this.engineMasterGain.gain.setValueAtTime(this.engineMasterGain.gain.value, now);
        this.engineMasterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

        // Piston rundown compression thuds (3-4 dying compression thumps with slowing intervals)
        const rundownThuds = isTofas ? 3 : 4;
        for (let i = 0; i < rundownThuds; i++) {
            const thudTime = now + 0.08 + i * (0.10 + i * 0.04);
            const thudOsc = this.ctx.createOscillator();
            const thudGain = this.ctx.createGain();

            thudOsc.type = 'triangle';
            thudOsc.frequency.setValueAtTime(70 - i * 12, thudTime);
            thudOsc.frequency.exponentialRampToValueAtTime(25, thudTime + 0.07);

            thudGain.gain.setValueAtTime(0.28 / (1 + i * 0.4), thudTime);
            thudGain.gain.exponentialRampToValueAtTime(0.001, thudTime + 0.07);

            thudOsc.connect(thudGain);
            thudGain.connect(this.masterGain);
            thudOsc.start(thudTime);
            thudOsc.stop(thudTime + 0.08);
        }

        setTimeout(() => {
            this.isRunning = false;
            if (onComplete) onComplete();
        }, 580);
    }

    /**
     * Crisp Gear Shift Dynamics
     */
    triggerGearShift(isUpshift = true) {
        if (!this.ctx || !this.isRunning) return;
        const now = this.ctx.currentTime;
        this.isShifting = true;

        if (isUpshift) {
            this.engineMasterGain.gain.setValueAtTime(0.85, now);
            this.engineMasterGain.gain.linearRampToValueAtTime(0.08, now + 0.015);
            this.engineMasterGain.gain.linearRampToValueAtTime(0.92, now + 0.075);

            setTimeout(() => {
                if (this.currentProfile && this.isRunning) {
                    this._createSinglePop(this.lastRpm, this.currentProfile);
                }
                this.isShifting = false;
            }, 45);
        } else {
            this.engineMasterGain.gain.setValueAtTime(0.85, now);
            this.engineMasterGain.gain.linearRampToValueAtTime(1.15, now + 0.025);
            this.engineMasterGain.gain.linearRampToValueAtTime(0.88, now + 0.095);

            setTimeout(() => {
                if (Math.random() < 0.70 && this.currentProfile && this.isRunning) {
                    this._createSinglePop(this.lastRpm, this.currentProfile);
                }
                this.isShifting = false;
            }, 65);
        }
    }

    /**
     * Rev Limiter Stutter ("tatatata" kesici)
     */
    triggerRevLimiter() {
        if (!this.ctx || !this.isRunning) return;
        const now = this.ctx.currentTime;
        
        this.engineMasterGain.gain.setValueAtTime(1.10, now);
        this.engineMasterGain.gain.setValueAtTime(0.02, now + 0.015);
        this.engineMasterGain.gain.setValueAtTime(1.10, now + 0.030);

        if (Math.random() < 0.85) {
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
