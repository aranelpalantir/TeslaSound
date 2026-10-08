/**
 * ApexRev - Main Application Controller
 * Handles UI events, instrument cluster rendering, GPS tracking,
 * Tesla steering wheel events, Wake Lock, and animation frame loop.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Audio and Physics Instances
    const audio = new VehicleAudioEngine();
    const physics = new VehiclePhysics(audio);

    // 2. DOM Elements
    const carsGrid = document.getElementById('carsGrid');
    const gaugeCanvas = document.getElementById('gaugeCanvas');
    const gaugeCtx = gaugeCanvas.getContext('2d');
    const visualizerCanvas = document.getElementById('visualizerCanvas');
    const visualizerCtx = visualizerCanvas.getContext('2d');

    // Readout elements
    const gearDisplay = document.getElementById('gearDisplay');
    const speedValue = document.getElementById('speedValue');
    const rpmValue = document.getElementById('rpmValue');
    const throttleValue = document.getElementById('throttleValue');
    const throttleMeterFill = document.getElementById('throttleMeterFill');
    const accelValue = document.getElementById('accelValue');
    const gpsStatusDot = document.getElementById('gpsStatusDot');
    const gpsStatusText = document.getElementById('gpsStatusText');

    // Engine Start / Stop & Status Elements
    const engineStartStopBtn = document.getElementById('engineStartStopBtn');
    const engineBtnLabel = document.getElementById('engineBtnLabel');
    const engineBadge = document.getElementById('engineBadge');
    const engineStatusDot = document.getElementById('engineStatusDot');
    const engineBadgeText = document.getElementById('engineBadgeText');
    const autoStartBtn = document.getElementById('autoStartBtn');

    // Controls
    const driveModeAuto = document.getElementById('modeAuto');
    const driveModeManual = document.getElementById('modeManual');
    const sourceGps = document.getElementById('sourceGps');
    const sourceSim = document.getElementById('sourceSim');
    const simDrawer = document.getElementById('simDrawer');
    const simGasBtn = document.getElementById('simGasBtn');
    const simBrakeBtn = document.getElementById('simBrakeBtn');
    const paddleUp = document.getElementById('paddleUp');
    const paddleDown = document.getElementById('paddleDown');
    const simSpeedSlider = document.getElementById('simSpeedSlider');
    const exhaustModeBtns = document.querySelectorAll('[data-exhaust]');
    const volumeSlider = document.getElementById('volumeSlider');
    const fullscreenBtn = document.getElementById('fullscreenBtn');

    // Shift Light LEDs
    const leds = document.querySelectorAll('.shift-lights-bar .led');

    // State
    let isEngineRunning = false;
    let selectedVehicle = VEHICLE_PROFILES[0];
    let gpsWatchId = null;
    let wakeLock = null;
    let lastFrameTime = performance.now();

    // High DPI Canvas Scaling
    function setupCanvas(canvas, ctx) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
    }
    setupCanvas(gaugeCanvas, gaugeCtx);
    setupCanvas(visualizerCanvas, visualizerCtx);
    window.addEventListener('resize', () => {
        setupCanvas(gaugeCanvas, gaugeCtx);
        setupCanvas(visualizerCanvas, visualizerCtx);
    });

    // 3. Render Vehicle Profiles
    function renderVehicles() {
        carsGrid.innerHTML = '';
        VEHICLE_PROFILES.forEach((profile) => {
            const features = [];
            if (profile.hasTurbo) features.push('🌀 Turbo');
            if (profile.hasSupercharger) features.push('⚡ Kompresör');
            if (!profile.hasTurbo && !profile.hasSupercharger && profile.id !== 'cyber_speeder') features.push('🔩 Atmo');
            if (profile.id === 'cyber_speeder') features.push('🛸 EV');

            const card = document.createElement('div');
            card.className = `car-card ${profile.id === selectedVehicle.id ? 'selected' : ''}`;
            card.title = profile.soundDescription;
            card.innerHTML = `
                <div class="car-badge">${profile.badge}</div>
                <div class="car-name">${profile.name}</div>
                <div class="car-engine-type">${profile.type}</div>
                <div class="car-features" style="margin-top:8px; display:flex; gap:4px; flex-wrap:wrap;">
                    ${features.map(f => `<span style="font-size:0.62rem; background:var(--bg-primary); border:1px solid var(--border-color); padding:2px 6px; border-radius:8px; color:var(--text-secondary);">${f}</span>`).join('')}
                </div>
            `;
            card.addEventListener('click', () => selectVehicle(profile));
            carsGrid.appendChild(card);
        });
    }

    function selectVehicle(profile) {
        selectedVehicle = profile;
        document.documentElement.style.setProperty('--car-accent', profile.accentColor);
        document.documentElement.style.setProperty('--car-glow', profile.glowColor);

        // Update cards
        document.querySelectorAll('.car-card').forEach((card, idx) => {
            if (VEHICLE_PROFILES[idx].id === profile.id) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        });

        // Update physics and audio
        physics.setProfile(profile);
        if (isEngineRunning) {
            audio.loadProfile(profile);
        }

        const soundProfileText = document.getElementById('soundProfileText');
        if (soundProfileText) {
            soundProfileText.textContent = profile.soundDescription;
        }
    }

    // 4. Tactical Supercar Engine Start / Stop Controller
    let autoStartEnabled = localStorage.getItem('teslasound_autostart') === 'true';

    function updateAutoStartUI() {
        if (autoStartBtn) {
            autoStartBtn.textContent = autoStartEnabled ? 'Açık' : 'Kapalı';
            if (autoStartEnabled) {
                autoStartBtn.classList.add('active');
            } else {
                autoStartBtn.classList.remove('active');
            }
        }
    }
    updateAutoStartUI();

    if (autoStartBtn) {
        autoStartBtn.addEventListener('click', () => {
            autoStartEnabled = !autoStartEnabled;
            localStorage.setItem('teslasound_autostart', autoStartEnabled ? 'true' : 'false');
            updateAutoStartUI();
        });
    }

    function updateEngineButtonUI(state) {
        if (!engineStartStopBtn) return;

        if (state === 'cranking') {
            engineStartStopBtn.className = 'engine-start-stop-btn cranking';
            if (engineBtnLabel) engineBtnLabel.textContent = 'CRANKING...';
            if (engineStatusDot) {
                engineStatusDot.style.background = '#f59e0b';
                engineStatusDot.style.boxShadow = '0 0 10px #f59e0b';
            }
            if (engineBadgeText) {
                engineBadgeText.textContent = 'MARŞ ALIYOR';
                engineBadgeText.style.color = '#fbbf24';
            }
            if (engineBadge) engineBadge.style.borderColor = 'rgba(245, 158, 11, 0.45)';
        } else if (state === 'running') {
            engineStartStopBtn.className = 'engine-start-stop-btn running';
            if (engineBtnLabel) engineBtnLabel.textContent = 'STOP ENGINE';
            if (engineStatusDot) {
                engineStatusDot.style.background = '#22c55e';
                engineStatusDot.style.boxShadow = '0 0 8px #22c55e';
            }
            if (engineBadgeText) {
                engineBadgeText.textContent = 'MOTOR AKTİF';
                engineBadgeText.style.color = '#4ade80';
            }
            if (engineBadge) engineBadge.style.borderColor = 'rgba(34, 197, 94, 0.35)';
        } else {
            // off / standby
            engineStartStopBtn.className = 'engine-start-stop-btn off';
            if (engineBtnLabel) engineBtnLabel.textContent = 'START ENGINE';
            if (engineStatusDot) {
                engineStatusDot.style.background = '#ef4444';
                engineStatusDot.style.boxShadow = '0 0 8px #ef4444';
            }
            if (engineBadgeText) {
                engineBadgeText.textContent = 'STANDBY';
                engineBadgeText.style.color = '#f87171';
            }
            if (engineBadge) engineBadge.style.borderColor = 'rgba(239, 68, 68, 0.35)';
        }
    }

    async function startEngine() {
        if (physics.isStarting || isEngineRunning) return;
        try {
            await audio.init();
            physics.setProfile(selectedVehicle);
            audio.loadProfile(selectedVehicle);

            updateEngineButtonUI('cranking');

            physics.startEngineSequence(() => {
                isEngineRunning = true;
                updateEngineButtonUI('running');
                requestWakeLock();

                if (!physics.isSimulating) {
                    startGpsTracking();
                    startMotionTracking();
                }
            });
        } catch (err) {
            console.warn("Audio start error:", err);
            updateEngineButtonUI('off');
        }
    }

    function stopEngine() {
        if (!isEngineRunning && !physics.isStarting) return;
        isEngineRunning = false;
        updateEngineButtonUI('off');

        physics.stopEngine(() => {
            audio.stop();
        });

        stopGpsTracking();
        stopMotionTracking();
        releaseWakeLock();
    }

    function toggleEngine() {
        if (physics.isStarting) return;
        if (isEngineRunning) {
            stopEngine();
        } else {
            startEngine();
        }
    }

    if (engineStartStopBtn) {
        engineStartStopBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleEngine();
        });
    }

    // Browser Autoplay Policy: If auto-start is active, first touch starts engine
    const unlockOnUserGesture = async () => {
        if (!audio.ctx || audio.ctx.state === 'suspended') {
            await audio.init();
        }
        if (autoStartEnabled && !isEngineRunning && !physics.isStarting) {
            await startEngine();
        }
        ['pointerdown', 'touchstart', 'click', 'keydown'].forEach(evt => {
            document.removeEventListener(evt, unlockOnUserGesture);
        });
    };
    ['pointerdown', 'touchstart', 'click', 'keydown'].forEach(evt => {
        document.addEventListener(evt, unlockOnUserGesture, { passive: true });
    });

    // 5. GPS & Accelerometer Tracking (Hybrid 60Hz IMU + GPS)
    let motionHandler = null;

    function startMotionTracking() {
        if (typeof window.DeviceMotionEvent !== 'undefined') {
            motionHandler = (event) => {
                if (isEngineRunning && !physics.isSimulating) {
                    physics.handleMotionUpdate(event);
                }
            };

            if (typeof DeviceMotionEvent.requestPermission === 'function') {
                DeviceMotionEvent.requestPermission()
                    .then((perm) => {
                        if (perm === 'granted') {
                            window.addEventListener('devicemotion', motionHandler, { passive: true });
                        }
                    })
                    .catch(() => {});
            } else {
                window.addEventListener('devicemotion', motionHandler, { passive: true });
            }
        }
    }

    function stopMotionTracking() {
        if (motionHandler) {
            window.removeEventListener('devicemotion', motionHandler);
            motionHandler = null;
        }
    }

    function startGpsTracking() {
        if (!navigator.geolocation) {
            gpsStatusDot.className = 'status-dot';
            gpsStatusText.textContent = 'GPS UNSUPPORTED';
            return;
        }

        gpsStatusDot.className = 'status-dot searching';
        gpsStatusText.textContent = 'SEARCHING GPS...';

        gpsWatchId = navigator.geolocation.watchPosition(
            (pos) => {
                gpsStatusDot.className = 'status-dot active';
                const acc = pos.coords.accuracy ? Math.round(pos.coords.accuracy) : '--';
                gpsStatusText.textContent = `GPS + IMU LOCKED (±${acc}m)`;
                physics.handleGpsUpdate(pos);
            },
            (err) => {
                console.warn("GPS error:", err.message);
                gpsStatusDot.className = 'status-dot';
                gpsStatusText.textContent = 'GPS DENIED / NO SIGNAL';
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 10000
            }
        );
    }

    function stopGpsTracking() {
        if (gpsWatchId !== null) {
            navigator.geolocation.clearWatch(gpsWatchId);
            gpsWatchId = null;
        }
        gpsStatusDot.className = 'status-dot';
        gpsStatusText.textContent = 'GPS STANDBY';
    }

    // 6. Screen Wake Lock
    async function requestWakeLock() {
        try {
            if ('wakeLock' in navigator) {
                wakeLock = await navigator.wakeLock.request('screen');
            }
        } catch (e) {
            console.warn("Wake lock failed:", e);
        }
    }

    function releaseWakeLock() {
        if (wakeLock) {
            wakeLock.release().catch(() => {});
            wakeLock = null;
        }
    }

    // 7. Mode Toggles (Auto vs Manual, GPS vs Simulator)
    driveModeAuto.addEventListener('click', () => {
        driveModeAuto.classList.add('active');
        driveModeManual.classList.remove('active');
        physics.setTransmissionMode('auto');
    });

    driveModeManual.addEventListener('click', () => {
        driveModeManual.classList.add('active');
        driveModeAuto.classList.remove('active');
        physics.setTransmissionMode('manual');
    });

    sourceGps.addEventListener('click', () => {
        sourceGps.classList.add('active');
        sourceSim.classList.remove('active');
        simDrawer.classList.remove('active');
        physics.isSimulating = false;
        if (isEngineRunning) {
            startGpsTracking();
            startMotionTracking();
        }
    });

    sourceSim.addEventListener('click', () => {
        sourceSim.classList.add('active');
        sourceGps.classList.remove('active');
        simDrawer.classList.add('active');
        physics.isSimulating = true;
        stopGpsTracking();
        stopMotionTracking();
        gpsStatusDot.className = 'status-dot active';
        gpsStatusText.textContent = 'TEST BENCH ACTIVE';
    });

    // 8. Simulator Controls
    function bindPedal(btn, onDown, onUp) {
        btn.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            btn.classList.add('pressed');
            onDown();
        });
        window.addEventListener('pointerup', () => {
            btn.classList.remove('pressed');
            onUp();
        });
        window.addEventListener('pointercancel', () => {
            btn.classList.remove('pressed');
            onUp();
        });
    }

    bindPedal(simGasBtn, () => physics.setSimPedal(true), () => physics.setSimPedal(false));
    bindPedal(simBrakeBtn, () => physics.setSimBrake(true), () => physics.setSimBrake(false));

    paddleUp.addEventListener('click', () => physics.shiftUp());
    paddleDown.addEventListener('click', () => physics.shiftDown());

    simSpeedSlider.addEventListener('input', (e) => {
        physics.setManualSpeedKmh(parseFloat(e.target.value));
    });

    // 9. Exhaust Mode & Volume
    exhaustModeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            exhaustModeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            audio.setExhaustMode(btn.dataset.exhaust);
        });
    });

    volumeSlider.addEventListener('input', (e) => {
        audio.setMasterVolume(parseFloat(e.target.value));
    });

    // 10. Fullscreen Toggle (Great for Tesla Browser)
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    });

    // 10.1 Help Modal Toggle
    const helpBtn = document.getElementById('helpBtn');
    const helpModal = document.getElementById('helpModal');
    const closeHelpModal = document.getElementById('closeHelpModal');
    const modalUnderstandBtn = document.getElementById('modalUnderstandBtn');

    if (helpBtn && helpModal) {
        helpBtn.addEventListener('click', () => {
            helpModal.classList.add('active');
        });
        const hideModal = () => helpModal.classList.remove('active');
        if (closeHelpModal) closeHelpModal.addEventListener('click', hideModal);
        if (modalUnderstandBtn) modalUnderstandBtn.addEventListener('click', hideModal);
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) hideModal();
        });
    }

    // 11. Steering Wheel & Keyboard Interactivity
    // In Tesla Browser: Steering wheel scroll wheels emit 'wheel' events!
    window.addEventListener('wheel', (e) => {
        if (!isEngineRunning) return;
        if (e.deltaY < 0) {
            // Scroll Up: Upshift
            physics.shiftUp();
        } else if (e.deltaY > 0) {
            // Scroll Down: Downshift
            physics.shiftDown();
        }
    }, { passive: true });

    // Keyboard Shortcuts (Desktop / Simulator Testing)
    window.addEventListener('keydown', (e) => {
        if (e.repeat) return;
        if (e.code === 'KeyW' || e.code === 'ArrowUp') {
            physics.setSimPedal(true);
            simGasBtn.classList.add('pressed');
        } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
            physics.setSimBrake(true);
            simBrakeBtn.classList.add('pressed');
        } else if (e.code === 'KeyE' || e.code === 'BracketRight') {
            physics.shiftUp();
        } else if (e.code === 'KeyQ' || e.code === 'BracketLeft') {
            physics.shiftDown();
        } else if (e.code === 'KeyM') {
            e.preventDefault();
            if (audio.masterVolume > 0) {
                audio.setMasterVolume(0);
                if (volumeSlider) volumeSlider.value = 0;
            } else {
                audio.setMasterVolume(0.85);
                if (volumeSlider) volumeSlider.value = 0.85;
            }
        } else if (e.code === 'Space') {
            e.preventDefault();
            toggleEngine();
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'KeyW' || e.code === 'ArrowUp') {
            physics.setSimPedal(false);
            simGasBtn.classList.remove('pressed');
        } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
            physics.setSimBrake(false);
            simBrakeBtn.classList.remove('pressed');
        }
    });

    // 12. Shift Light LEDs Rendering
    function updateShiftLights(rpm, redline, shiftRpm) {
        const ratio = (rpm - selectedVehicle.idleRpm) / (redline - selectedVehicle.idleRpm);
        const totalLeds = leds.length; // 10
        const litCount = Math.floor(ratio * totalLeds);

        const isAtShiftPoint = rpm >= shiftRpm;

        leds.forEach((led, i) => {
            led.classList.remove('flashing');
            if (isAtShiftPoint) {
                led.className = 'led red on flashing';
            } else if (i < litCount) {
                if (i < 4) led.className = 'led green on';
                else if (i < 7) led.className = 'led yellow on';
                else led.className = 'led red on';
            } else {
                led.className = `led ${i < 4 ? 'green' : i < 7 ? 'yellow' : 'red'}`;
            }
        });
    }

    // 13. Analog / Digital Tachometer Needle Rendering
    function drawGauge(rpm, redline) {
        const width = 280;
        const height = 280;
        const cx = width / 2;
        const cy = height / 2;
        const radius = 115;

        gaugeCtx.clearRect(0, 0, width, height);

        const startAngle = 0.75 * Math.PI; // Bottom-left (135 deg)
        const endAngle = 2.25 * Math.PI;   // Bottom-right (405 deg)
        const totalAngle = endAngle - startAngle;

        // Background Track Arc
        gaugeCtx.beginPath();
        gaugeCtx.arc(cx, cy, radius, startAngle, endAngle);
        gaugeCtx.lineWidth = 10;
        gaugeCtx.strokeStyle = '#161b24';
        gaugeCtx.lineCap = 'round';
        gaugeCtx.stroke();

        // Redline Arc
        const redlineRatio = (selectedVehicle.shiftRpm - selectedVehicle.idleRpm) / (redline - selectedVehicle.idleRpm);
        const redlineStartAngle = startAngle + (totalAngle * redlineRatio);

        gaugeCtx.beginPath();
        gaugeCtx.arc(cx, cy, radius, redlineStartAngle, endAngle);
        gaugeCtx.lineWidth = 10;
        gaugeCtx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
        gaugeCtx.lineCap = 'round';
        gaugeCtx.stroke();

        // Active RPM Arc
        const rpmRatio = Math.max(0, Math.min(1, (rpm - selectedVehicle.idleRpm) / (redline - selectedVehicle.idleRpm)));
        const activeAngle = startAngle + (totalAngle * rpmRatio);

        gaugeCtx.beginPath();
        gaugeCtx.arc(cx, cy, radius, startAngle, activeAngle);
        gaugeCtx.lineWidth = 10;
        gaugeCtx.strokeStyle = selectedVehicle.accentColor;
        gaugeCtx.lineCap = 'round';
        gaugeCtx.stroke();

        // Tick marks and numbers
        const maxDisplayRpm = Math.ceil(redline / 1000);
        for (let i = 0; i <= maxDisplayRpm; i++) {
            const tickRpm = i * 1000;
            const tickRatio = (tickRpm - selectedVehicle.idleRpm) / (redline - selectedVehicle.idleRpm);
            if (tickRatio < 0 || tickRatio > 1) continue;

            const angle = startAngle + (totalAngle * tickRatio);
            const innerR = radius - 14;
            const outerR = radius - 6;

            const x1 = cx + Math.cos(angle) * innerR;
            const y1 = cy + Math.sin(angle) * innerR;
            const x2 = cx + Math.cos(angle) * outerR;
            const y2 = cy + Math.sin(angle) * outerR;

            gaugeCtx.beginPath();
            gaugeCtx.moveTo(x1, y1);
            gaugeCtx.lineTo(x2, y2);
            gaugeCtx.lineWidth = (i % 2 === 0) ? 2 : 1;
            gaugeCtx.strokeStyle = tickRpm >= selectedVehicle.shiftRpm ? '#ef4444' : '#64748b';
            gaugeCtx.stroke();

            // Label numbers
            if (i % 2 === 0 || i === maxDisplayRpm) {
                const textR = radius - 26;
                const tx = cx + Math.cos(angle) * textR;
                const ty = cy + Math.sin(angle) * textR + 4;
                gaugeCtx.font = '600 11px monospace';
                gaugeCtx.fillStyle = tickRpm >= selectedVehicle.shiftRpm ? '#ef4444' : '#94a3b8';
                gaugeCtx.textAlign = 'center';
                gaugeCtx.fillText(i.toString(), tx, ty);
            }
        }

        // Center Inner Dial Plate (protects readout numbers)
        gaugeCtx.beginPath();
        gaugeCtx.arc(cx, cy, 54, 0, Math.PI * 2);
        gaugeCtx.fillStyle = '#0f1218';
        gaugeCtx.fill();
        gaugeCtx.lineWidth = 2;
        gaugeCtx.strokeStyle = '#222836';
        gaugeCtx.stroke();

        // Sweeping Needle (starts from inner disc to outer rim)
        const needleStartR = 56;
        const needleEndR = radius - 8;
        const sx = cx + Math.cos(activeAngle) * needleStartR;
        const sy = cy + Math.sin(activeAngle) * needleStartR;
        const nx = cx + Math.cos(activeAngle) * needleEndR;
        const ny = cy + Math.sin(activeAngle) * needleEndR;

        gaugeCtx.beginPath();
        gaugeCtx.moveTo(sx, sy);
        gaugeCtx.lineTo(nx, ny);
        gaugeCtx.lineWidth = 3.5;
        gaugeCtx.strokeStyle = selectedVehicle.accentColor;
        gaugeCtx.shadowColor = selectedVehicle.accentColor;
        gaugeCtx.shadowBlur = 10;
        gaugeCtx.stroke();
        gaugeCtx.shadowBlur = 0; // reset

        // Needle base pip
        gaugeCtx.beginPath();
        gaugeCtx.arc(sx, sy, 3, 0, Math.PI * 2);
        gaugeCtx.fillStyle = '#ffffff';
        gaugeCtx.fill();
    }

    // 14. Audio FFT Visualizer
    function drawVisualizer() {
        const width = visualizerCanvas.width;
        const height = visualizerCanvas.height;

        visualizerCtx.clearRect(0, 0, width, height);

        if (!audio.analyser || !isEngineRunning) {
            visualizerCtx.fillStyle = '#1c212d';
            visualizerCtx.fillRect(0, height / 2 - 1, width, 2);
            return;
        }

        const bufferLength = audio.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        audio.analyser.getByteFrequencyData(dataArray);

        const barWidth = (width / bufferLength) * 2.2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * height;

            visualizerCtx.fillStyle = selectedVehicle.accentColor;
            visualizerCtx.fillRect(x, height - barHeight, barWidth - 1, barHeight);

            x += barWidth;
            if (x > width) break;
        }
    }

    // 15. Main Animation Frame Loop (60 FPS)
    function mainLoop(now) {
        requestAnimationFrame(mainLoop);

        const dt = Math.min(0.1, (now - lastFrameTime) / 1000);
        lastFrameTime = now;

        // Update vehicle dynamics & audio
        physics.update(dt);

        // Update Cluster UI
        const spd = Math.round(physics.currentSpeedKmh);
        const rpm = Math.round(physics.currentRpm);
        const gear = physics.currentGear;
        const throttlePct = Math.round(physics.throttle * 100);

        speedValue.textContent = spd;
        rpmValue.textContent = rpm;
        throttleValue.textContent = `${throttlePct}%`;
        throttleMeterFill.style.width = `${throttlePct}%`;
        accelValue.textContent = `${physics.acceleration >= 0 ? '+' : ''}${physics.acceleration.toFixed(1)} m/s²`;

        gearDisplay.textContent = physics.currentSpeedKmh < 0.5 ? 'N' : gear;


        // Render shift lights & gauge
        updateShiftLights(rpm, selectedVehicle.redlineRpm, selectedVehicle.shiftRpm);
        drawGauge(rpm, selectedVehicle.redlineRpm);
        drawVisualizer();

        // Dynamic exhaust valve status
        const exhaustStatusText = document.getElementById('exhaustStatusText');
        if (exhaustStatusText) {
            const mode = audio.exhaustMode;
            const exhaustLabels = { quiet: 'Kapalı (Sessiz)', sport: 'Yarı Açık', race: 'Tam Açık', straight_pipe: 'Düz Boru 🔥' };
            exhaustStatusText.textContent = exhaustLabels[mode] || 'Açık';
        }

        // Throttle meter color changes from green (low) to orange (mid) to red (high)
        const throttleHue = Math.round(120 - (physics.throttle * 120)); // 120=green, 0=red
        throttleMeterFill.style.background = `hsl(${throttleHue}, 85%, 50%)`;

        // Transmission type label (changes with vehicle)
        const transTypeDisplay = document.getElementById('transTypeDisplay');
        if (transTypeDisplay) {
            const mode = physics.transmissionMode === 'auto' ? 'DCT' : 'Manuel';
            const gears = selectedVehicle.gears.length;
            transTypeDisplay.textContent = gears === 1
                ? `Tek Vitesli EV`
                : `${gears}-İleri ${mode}`;
        }
    }

    // Initialize UI
    renderVehicles();
    selectVehicle(VEHICLE_PROFILES[0]);
    updateEngineButtonUI('off');
    requestAnimationFrame(mainLoop);

    // Register PWA Service Worker (Safari/WebKit Redirect-Safe)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => {
                    console.log('TeslaSound PWA Service Worker aktif:', reg.scope);
                    reg.update();
                })
                .catch(err => {
                    console.warn('Service Worker kaydı yapılamadı:', err);
                });
        });
    }
});
