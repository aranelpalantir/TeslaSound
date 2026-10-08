/**
 * Vehicle Profiles & Acoustic Configurations
 * Next-Gen Procedural Engine Synthesizer Profiles:
 * - Precise firing order harmonic fundamentals
 * - Balanced formant cavities (Throat, Clarity Rasp, Manifold)
 * - Calibrated lowpass ceilings (Zero digital transistor buzz, pure automotive tone)
 * - Distinct acoustic character per engine architecture
 */

const VEHICLE_PROFILES = [
    {
        id: 'tofas_dogan_slx',
        name: 'Tofaş Doğan SLX 1.6',
        type: '1.6L 8V SOHC (Abart Egzoz / Düz Boru)',
        badge: '6,800 RPM',
        accentColor: '#DC2626',
        glowColor: 'rgba(220, 38, 38, 0.45)',
        cylinders: 4,
        idleRpm: 850,
        redlineRpm: 6800,
        shiftRpm: 6500,
        idleCutoff: 2300,
        redlineCutoff: 6200,
        throatFreq: 420,
        clarityFreq: 2750,
        manifoldFreq: 140,
        hasTurbo: false,
        hasSupercharger: false,
        gears: [
            { ratio: 3.91, maxSpeed: 28 },  // 1. Vites: kalkış
            { ratio: 2.17, maxSpeed: 55 },  // 2. Vites: meşhur 2. vites bağırtması!
            { ratio: 1.41, maxSpeed: 88 },  // 3. Vites: ara hızlanma & çatara patara
            { ratio: 1.00, maxSpeed: 128 }, // 4. Vites: 128 km/h'ye kadar 4 vites devirip patlatır!
            { ratio: 0.81, maxSpeed: 215 }  // 5. Vites: 130-215 km/h otoban uzun vites, kesiciye girmez!
        ],
        finalDrive: 4.10,
        harmonics: [
            { multiplier: 1.0, gain: 0.35, detune: 4, waveType: 'growl' },
            { multiplier: 2.0, gain: 0.95, waveType: 'rasp' },  // 4-silindir ana ateşleme vuruşu
            { multiplier: 3.0, gain: 0.50, waveType: 'rasp' },  // Meşhur abart egzoz yırtılması
            { multiplier: 4.0, gain: 0.32, waveType: 'pulse' },
            { multiplier: 6.0, gain: 0.18, waveType: 'rasp' }
        ],
        soundDescription: 'Net ve canlı 1.6 SLX Tempra motor sesi, boğukluksuz temiz devir tırmanışı, tiz abart egzoz yırtılması ve çatara patara patırtılar.'
    },
    {
        id: 'tofas_sahin_varex',
        name: 'Tofaş Şahin S (Varex & Kesici)',
        type: '1.6L Karbüratörlü (Açık Varex & Kesicili)',
        badge: '7,000 RPM',
        accentColor: '#F59E0B',
        glowColor: 'rgba(245, 158, 11, 0.45)',
        cylinders: 4,
        idleRpm: 800,
        redlineRpm: 7000,
        shiftRpm: 6700,
        idleCutoff: 2400,
        redlineCutoff: 6500,
        throatFreq: 440,
        clarityFreq: 2950,
        manifoldFreq: 145,
        hasTurbo: false,
        hasSupercharger: false,
        gears: [
            { ratio: 4.00, maxSpeed: 28 },
            { ratio: 2.22, maxSpeed: 54 },  // 2. viteste dip gaz kesiciye girer!
            { ratio: 1.44, maxSpeed: 86 },
            { ratio: 1.02, maxSpeed: 126 },
            { ratio: 0.83, maxSpeed: 210 }  // 5. vites otoban
        ],
        finalDrive: 4.10,
        harmonics: [
            { multiplier: 1.0, gain: 0.30, detune: 5, waveType: 'growl' },
            { multiplier: 2.0, gain: 1.00, waveType: 'rasp' },  // Açık Varex düz boru vuruşu
            { multiplier: 3.0, gain: 0.55, waveType: 'rasp' },
            { multiplier: 4.0, gain: 0.38, waveType: 'pulse' },
            { multiplier: 5.0, gain: 0.22, waveType: 'rasp' }
        ],
        soundDescription: 'Jilet gibi net açık Varex düz boru yırtılması, temiz egzoz tınısı, 2. viteste berrak kesici (tatatata) ve arka arkaya patırtılar.'
    },
    {
        id: 'bmw_m3_e46',
        name: 'BMW M3 E46 (S54)',
        type: '3.2L 24V DOHC Atmosferik Düz-6 (Metalik CSL Rasp)',
        badge: '8,200 RPM',
        accentColor: '#2563EB',
        glowColor: 'rgba(37, 99, 235, 0.45)',
        cylinders: 6,
        idleRpm: 800,
        redlineRpm: 8200,
        shiftRpm: 8000,
        idleCutoff: 2400,
        redlineCutoff: 6800,
        throatFreq: 460,
        clarityFreq: 3100,
        manifoldFreq: 135,
        hasTurbo: false,
        hasSupercharger: false,
        gears: [
            { ratio: 4.23, maxSpeed: 30 },
            { ratio: 2.53, maxSpeed: 55 },
            { ratio: 1.67, maxSpeed: 84 },
            { ratio: 1.23, maxSpeed: 115 },
            { ratio: 1.00, maxSpeed: 155 },
            { ratio: 0.83, maxSpeed: 280 }
        ],
        finalDrive: 3.62,
        harmonics: [
            { multiplier: 1.0, gain: 0.30, detune: 2, waveType: 'growl' },
            { multiplier: 1.5, gain: 0.25, detune: -3, waveType: 'growl' },
            { multiplier: 3.0, gain: 1.00, waveType: 'rasp' },  // Düz-6 ana ateşleme
            { multiplier: 4.5, gain: 0.40, waveType: 'rasp' },
            { multiplier: 6.0, gain: 0.65, waveType: 'rasp' },  // Meşhur E46 M3 CSL metalik zırıltı raspı
            { multiplier: 9.0, gain: 0.28, waveType: 'rasp' }
        ],
        soundDescription: 'Efsanevi S54 atmosferik sıralı 6 silindir, meşhur CSL metalik egzoz zırıltısı ("rasp"), 8.200 devir çığlığı ve SMG vites patlamaları.'
    },
    {
        id: 'shelby_v8',
        name: 'Shelby Mustang GT500',
        type: '5.2L Supercharged Crossplane V8',
        badge: '7,500 RPM',
        accentColor: '#3B82F6',
        glowColor: 'rgba(59, 130, 246, 0.4)',
        cylinders: 8,
        idleRpm: 750,
        redlineRpm: 7500,
        shiftRpm: 7300,
        idleCutoff: 2000,
        redlineCutoff: 5800,
        throatFreq: 380,
        clarityFreq: 2450,
        manifoldFreq: 115,
        hasTurbo: false,
        hasSupercharger: true,
        superchargerRatio: 1.85,
        gears: [
            { ratio: 3.14, maxSpeed: 26 },
            { ratio: 2.05, maxSpeed: 48 },  // 2. vites çığlık
            { ratio: 1.43, maxSpeed: 72 },
            { ratio: 1.10, maxSpeed: 98 },
            { ratio: 0.86, maxSpeed: 126 }, // 126 km/h'ye kadar 5 vites!
            { ratio: 0.68, maxSpeed: 170 }, // 6. vites
            { ratio: 0.56, maxSpeed: 270 }  // 7. vites uzun otoban
        ],
        finalDrive: 3.73,
        harmonics: [
            { multiplier: 0.5, gain: 0.22, detune: 6, waveType: 'v8growl' }, // Egzantrik döngü homurtusu
            { multiplier: 1.0, gain: 0.48, detune: 4, waveType: 'v8growl' },
            { multiplier: 1.5, gain: 0.38, detune: -5, waveType: 'v8growl' }, // Crossplane 90° senkop
            { multiplier: 2.0, gain: 0.75, waveType: 'v8growl' },
            { multiplier: 3.0, gain: 0.25, waveType: 'pulse' },
            { multiplier: 4.0, gain: 0.90, waveType: 'v8growl' }, // V8 8-silindir ana ateşleme
            { multiplier: 6.0, gain: 0.22, waveType: 'rasp' }
        ],
        soundDescription: 'Net ve dengeli 5.2L V8 sesi, boğukluk ve uğultudan arındırılmış temiz kaslı ton ve net kompresör ıslığı.'
    },
    {
        id: 'mercedes_c63_amg',
        name: 'Mercedes-Benz C63 AMG',
        type: '6.2L Naturally Aspirated V8 (M156 Safkan Canavar)',
        badge: '7,400 RPM',
        accentColor: '#E11D48',
        glowColor: 'rgba(225, 29, 72, 0.45)',
        cylinders: 8,
        idleRpm: 700,
        redlineRpm: 7400,
        shiftRpm: 7200,
        idleCutoff: 2100,
        redlineCutoff: 6100,
        throatFreq: 360,
        clarityFreq: 2500,
        manifoldFreq: 110,
        hasTurbo: false,
        hasSupercharger: false,
        gears: [
            { ratio: 4.38, maxSpeed: 25 },
            { ratio: 2.86, maxSpeed: 46 },
            { ratio: 1.92, maxSpeed: 70 },
            { ratio: 1.37, maxSpeed: 98 },
            { ratio: 1.00, maxSpeed: 135 },
            { ratio: 0.82, maxSpeed: 185 },
            { ratio: 0.73, maxSpeed: 290 }
        ],
        finalDrive: 2.82,
        harmonics: [
            { multiplier: 0.5, gain: 0.20, detune: 5, waveType: 'v8growl' },
            { multiplier: 1.0, gain: 0.52, detune: 3, waveType: 'v8growl' },
            { multiplier: 1.5, gain: 0.35, detune: -4, waveType: 'v8growl' },
            { multiplier: 2.0, gain: 0.80, waveType: 'v8growl' },
            { multiplier: 4.0, gain: 0.95, waveType: 'v8growl' }, // 6.2L devasa Alman V8 gök gürültüsü
            { multiplier: 6.0, gain: 0.30, waveType: 'rasp' },
            { multiplier: 8.0, gain: 0.18, waveType: 'rasp' }
        ],
        soundDescription: 'Efsanevi M156 6.2L atmosferik V8 gök gürültüsü, kalın ve kaslı Alman homurtusu, devir tırmanışında vahşi kükreme ve Speedshift ara gaz patlamaları.'
    },
    {
        id: 'nissan_gtr_r34',
        name: 'Nissan Skyline GT-R R34',
        type: '2.6L Twin-Turbo DOHC Düz-6 (RB26DETT Godzilla)',
        badge: '8,200 RPM',
        accentColor: '#8B5CF6',
        glowColor: 'rgba(139, 92, 246, 0.45)',
        cylinders: 6,
        idleRpm: 850,
        redlineRpm: 8200,
        shiftRpm: 8000,
        idleCutoff: 2300,
        redlineCutoff: 6600,
        throatFreq: 440,
        clarityFreq: 2900,
        manifoldFreq: 125,
        hasTurbo: true,
        hasSupercharger: false,
        gears: [
            { ratio: 3.82, maxSpeed: 29 },
            { ratio: 2.36, maxSpeed: 53 },
            { ratio: 1.68, maxSpeed: 80 },
            { ratio: 1.31, maxSpeed: 110 },
            { ratio: 1.00, maxSpeed: 155 },
            { ratio: 0.79, maxSpeed: 285 }
        ],
        finalDrive: 3.54,
        harmonics: [
            { multiplier: 1.0, gain: 0.32, detune: 2, waveType: 'growl' },
            { multiplier: 2.0, gain: 0.38, waveType: 'pulse' },
            { multiplier: 3.0, gain: 1.00, waveType: 'rasp' },  // RB26 3x ana ateşleme
            { multiplier: 4.5, gain: 0.45, waveType: 'rasp' },
            { multiplier: 6.0, gain: 0.60, waveType: 'rasp' },
            { multiplier: 7.5, gain: 0.25, waveType: 'rasp' }
        ],
        soundDescription: 'Japon efsanesi RB26DETT twin-turbo sıralı 6 silindir sesi, düz boru egzoz yırtılması, çift turbo ıslığı ve vites geçişlerinde Godzilla alev patlamaları.'
    },
    {
        id: 'subaru_wrx_sti',
        name: 'Subaru Impreza WRX STI',
        type: '2.5L Turbo Boxer-4 (UEL Headers & Boxer Rumble)',
        badge: '7,500 RPM',
        accentColor: '#0284C7',
        glowColor: 'rgba(2, 132, 199, 0.45)',
        cylinders: 4,
        idleRpm: 750,
        redlineRpm: 7500,
        shiftRpm: 7200,
        idleCutoff: 2200,
        redlineCutoff: 6400,
        throatFreq: 390,
        clarityFreq: 2700,
        manifoldFreq: 115,
        hasTurbo: true,
        hasSupercharger: false,
        gears: [
            { ratio: 3.63, maxSpeed: 28 },
            { ratio: 2.23, maxSpeed: 52 },
            { ratio: 1.52, maxSpeed: 76 },
            { ratio: 1.13, maxSpeed: 105 },
            { ratio: 0.89, maxSpeed: 145 },
            { ratio: 0.70, maxSpeed: 265 }
        ],
        finalDrive: 3.90,
        harmonics: [
            { multiplier: 0.5, gain: 0.22, detune: 5, waveType: 'boxer' }, // UEL headers eşitsiz senkop
            { multiplier: 1.0, gain: 0.55, detune: 3, waveType: 'boxer' },
            { multiplier: 1.5, gain: 0.35, detune: -4, waveType: 'boxer' },
            { multiplier: 2.0, gain: 0.95, waveType: 'boxer' }, // 4-silindir bokser vuruşu
            { multiplier: 3.0, gain: 0.45, waveType: 'rasp' },
            { multiplier: 4.0, gain: 0.35, waveType: 'pulse' },
            { multiplier: 6.0, gain: 0.18, waveType: 'rasp' }
        ],
        soundDescription: 'WRC efsanesi eşit olmayan (UEL) egzoz manifolduyla meşhur derin Subaru bokser homurtusu, turbo ıslığı, wastegate ve blow-off çatlamaları.'
    },
    {
        id: 'porsche_gt3',
        name: 'Porsche 911 GT3 RS',
        type: '4.0L Naturally Aspirated Flat-6',
        badge: '9,000 RPM',
        accentColor: '#EF4444',
        glowColor: 'rgba(239, 68, 68, 0.4)',
        cylinders: 6,
        idleRpm: 850,
        redlineRpm: 9000,
        shiftRpm: 8800,
        idleCutoff: 2400,
        redlineCutoff: 6800,
        throatFreq: 460,
        clarityFreq: 3200,
        manifoldFreq: 130,
        hasTurbo: false,
        hasSupercharger: false,
        gears: [
            { ratio: 3.75, maxSpeed: 28 },
            { ratio: 2.38, maxSpeed: 52 },
            { ratio: 1.72, maxSpeed: 76 },
            { ratio: 1.34, maxSpeed: 102 },
            { ratio: 1.11, maxSpeed: 130 }, // 130 km/h'de 5. vitese geçer!
            { ratio: 0.96, maxSpeed: 175 }, // 6. vites
            { ratio: 0.84, maxSpeed: 275 }  // 7. vites
        ],
        finalDrive: 3.97,
        harmonics: [
            { multiplier: 1.0, gain: 0.30, detune: 2, waveType: 'boxer' },
            { multiplier: 1.5, gain: 0.32, detune: -3, waveType: 'boxer' },
            { multiplier: 3.0, gain: 1.00, waveType: 'boxer' }, // Flat-6 ana ateşleme
            { multiplier: 4.5, gain: 0.38, waveType: 'rasp' },
            { multiplier: 6.0, gain: 0.55, waveType: 'rasp' },
            { multiplier: 9.0, gain: 0.20, waveType: 'rasp' }
        ],
        soundDescription: '4.0L safkan atmosferik Flat-6 yarış motoru, sıfır uğultu, 9.000 devirde kristal berraklığında yarış çığlığı.'
    },
    {
        id: 'lambo_v10',
        name: 'Lamborghini Huracán V10',
        type: '5.2L Naturally Aspirated V10',
        badge: '8,500 RPM',
        accentColor: '#10B981',
        glowColor: 'rgba(168, 85, 247, 0.4)',
        cylinders: 10,
        idleRpm: 900,
        redlineRpm: 8500,
        shiftRpm: 8300,
        idleCutoff: 2400,
        redlineCutoff: 7000,
        throatFreq: 500,
        clarityFreq: 3350,
        manifoldFreq: 135,
        hasTurbo: false,
        hasSupercharger: false,
        gears: [
            { ratio: 3.91, maxSpeed: 28 },
            { ratio: 2.44, maxSpeed: 52 },
            { ratio: 1.81, maxSpeed: 78 },
            { ratio: 1.40, maxSpeed: 104 },
            { ratio: 1.13, maxSpeed: 132 },
            { ratio: 0.94, maxSpeed: 175 },
            { ratio: 0.79, maxSpeed: 280 }
        ],
        finalDrive: 3.73,
        harmonics: [
            { multiplier: 1.0, gain: 0.25, waveType: 'growl' },
            { multiplier: 2.5, gain: 0.45, waveType: 'growl' },
            { multiplier: 5.0, gain: 1.00, waveType: 'rasp' }, // V10 ana ateşleme
            { multiplier: 7.5, gain: 0.35, waveType: 'rasp' },
            { multiplier: 10.0, gain: 0.22, waveType: 'rasp' }
        ],
        soundDescription: 'Yırtıcı 5.2L V10 İtalyan çığlığı, boğukluksuz temiz tını, berrak üst devirler ve net DCT vites patlamaları.'
    },
    {
        id: 'ferrari_v12',
        name: 'Ferrari 812 Superfast',
        type: '6.5L Naturally Aspirated V12',
        badge: '8,900 RPM',
        accentColor: '#EAB308',
        glowColor: 'rgba(234, 179, 8, 0.4)',
        cylinders: 12,
        idleRpm: 950,
        redlineRpm: 8900,
        shiftRpm: 8700,
        idleCutoff: 2500,
        redlineCutoff: 7200,
        throatFreq: 520,
        clarityFreq: 3500,
        manifoldFreq: 140,
        hasTurbo: false,
        hasSupercharger: false,
        gears: [
            { ratio: 3.40, maxSpeed: 30 },
            { ratio: 2.19, maxSpeed: 55 },
            { ratio: 1.63, maxSpeed: 82 },
            { ratio: 1.29, maxSpeed: 108 },
            { ratio: 1.03, maxSpeed: 135 },
            { ratio: 0.84, maxSpeed: 180 },
            { ratio: 0.63, maxSpeed: 290 }
        ],
        finalDrive: 4.38,
        harmonics: [
            { multiplier: 1.0, gain: 0.22, waveType: 'growl' },
            { multiplier: 3.0, gain: 0.40, waveType: 'pulse' },
            { multiplier: 6.0, gain: 1.00, waveType: 'rasp' }, // V12 ana ateşleme
            { multiplier: 9.0, gain: 0.35, waveType: 'rasp' },
            { multiplier: 12.0, gain: 0.26, waveType: 'rasp' }
        ],
        soundDescription: 'Kristal berraklığında 6.5L V12 senfonisi, saf Formula 1 yüksek devir çığlığı ve cerrahi vites geçişleri.'
    },
    {
        id: 'audi_rs3_turbo',
        name: 'Audi RS3 / Golf R (Turbo)',
        type: '2.5L Turbo Inline-5 / TSI',
        badge: '7,200 RPM',
        accentColor: '#06B6D4',
        glowColor: 'rgba(6, 182, 212, 0.4)',
        cylinders: 5,
        idleRpm: 800,
        redlineRpm: 7200,
        shiftRpm: 7000,
        idleCutoff: 2200,
        redlineCutoff: 6200,
        throatFreq: 420,
        clarityFreq: 2800,
        manifoldFreq: 125,
        hasTurbo: true,
        hasSupercharger: false,
        gears: [
            { ratio: 3.56, maxSpeed: 25 },
            { ratio: 2.14, maxSpeed: 48 },
            { ratio: 1.48, maxSpeed: 72 },
            { ratio: 1.11, maxSpeed: 98 },
            { ratio: 0.87, maxSpeed: 128 },
            { ratio: 0.69, maxSpeed: 168 },
            { ratio: 0.57, maxSpeed: 260 }
        ],
        finalDrive: 4.05,
        harmonics: [
            { multiplier: 0.5, gain: 0.18, detune: 4, waveType: 'boxer' },
            { multiplier: 1.0, gain: 0.38, detune: 3, waveType: 'growl' },
            { multiplier: 1.5, gain: 0.32, detune: -4, waveType: 'boxer' },
            { multiplier: 2.5, gain: 1.00, waveType: 'growl' }, // 5-silindir meşhur ana ateşleme
            { multiplier: 3.5, gain: 0.25, waveType: 'pulse' },
            { multiplier: 5.0, gain: 0.55, waveType: 'rasp' },
            { multiplier: 7.5, gain: 0.20, waveType: 'rasp' }
        ],
        soundDescription: 'Net 1-2-4-5-3 ateşlemeli 5 silindir tınısı, uğultusuz temiz devir, berrak turbo ıslığı, blow-off ve DSG çatlamaları.'
    },
    {
        id: 'cyber_speeder',
        name: 'Cyber Falcon (Sci-Fi EV)',
        type: 'Quantum Ion Hyperdrive',
        badge: '14,000 RPM',
        accentColor: '#A855F7',
        glowColor: 'rgba(168, 85, 247, 0.4)',
        cylinders: 4,
        idleRpm: 1200,
        redlineRpm: 14000,
        shiftRpm: 13500,
        idleCutoff: 2600,
        redlineCutoff: 7800,
        throatFreq: 580,
        clarityFreq: 3800,
        manifoldFreq: 180,
        hasTurbo: false,
        hasSupercharger: false,
        gears: [
            { ratio: 1.0, maxSpeed: 260 }
        ],
        finalDrive: 1.0,
        harmonics: [
            { multiplier: 0.5, gain: 0.45, waveType: 'deep' },
            { multiplier: 1.0, gain: 0.65, waveType: 'pulse' },
            { multiplier: 2.0, gain: 0.35, waveType: 'rasp' },
            { multiplier: 4.0, gain: 0.20, waveType: 'rasp' }
        ],
        soundDescription: 'Temiz hipersürücü warp tonu, net rezonans ve yüksek frekans kuantum itiş sesi (0-260 km/h).'
    }
];

window.VEHICLE_PROFILES = VEHICLE_PROFILES;
