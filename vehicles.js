/**
 * Vehicle Profiles & Acoustic Configurations
 * Optimized gear progression:
 * - 0 - 130 km/h: Gears 1 to 5 provide rapid shifting, 2nd gear screams, and high-RPM action.
 * - 130+ km/h: Overdrive gears (6th & 7th, or 5th in Tofaş) extend smoothly up to 260-280 km/h
 *   so you can cruise at 140, 160, 200+ km/h without hitting a brick wall or endless rev limiter!
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
        idleCutoff: 150,
        redlineCutoff: 750,
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
            { multiplier: 1.0, gain: 0.60, detune: 6, waveType: 'deep' },
            { multiplier: 2.0, gain: 0.72 },
            { multiplier: 3.0, gain: 0.38 },
            { multiplier: 4.0, gain: 0.22 }
        ],
        soundDescription: 'Efsane 1.6 SLX Tempra motoru, 2. viteste bağırtma, vanalı abart egzoz rezonansı ve çatara patara egzoz patlatması (0-215 km/h).'
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
        idleCutoff: 145,
        redlineCutoff: 780,
        manifoldFreq: 135,
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
            { multiplier: 1.0, gain: 0.58, detune: 10, waveType: 'deep' },
            { multiplier: 2.0, gain: 0.75 },
            { multiplier: 3.0, gain: 0.42 },
            { multiplier: 4.0, gain: 0.25 }
        ],
        soundDescription: 'Açık Varex düz boru yırtılması, 2. viteste dip gaz kesici (tatatata) ve gaza basıp bırakınca arka arkaya patırtılar.'
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
        idleCutoff: 140,
        redlineCutoff: 650,
        manifoldFreq: 95,
        hasTurbo: false,
        hasSupercharger: true,
        superchargerRatio: 1.8,
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
            { multiplier: 1.0, gain: 0.75, detune: 18, waveType: 'deep' },
            { multiplier: 2.0, gain: 0.55 },
            { multiplier: 3.0, gain: 0.28 },
            { multiplier: 4.0, gain: 0.18 }
        ],
        soundDescription: 'Tok 5.2L Amerikan V8 homurtusu ve yüksek devirde yırtıcı kompresör ıslığı (0-270 km/h).'
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
        idleCutoff: 160,
        redlineCutoff: 720,
        manifoldFreq: 110,
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
            { multiplier: 1.0, gain: 0.70, detune: 8, waveType: 'deep' },
            { multiplier: 1.5, gain: 0.50 },
            { multiplier: 3.0, gain: 0.32 },
            { multiplier: 4.5, gain: 0.12 }
        ],
        soundDescription: '4.0L safkan atmosferik Flat-6 boksör kükremesi ve 9.000 devir çığlığı (0-275 km/h).'
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
        idleCutoff: 165,
        redlineCutoff: 740,
        manifoldFreq: 120,
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
            { multiplier: 1.0, gain: 0.65, waveType: 'deep' },
            { multiplier: 2.0, gain: 0.48 },
            { multiplier: 2.5, gain: 0.38 },
            { multiplier: 5.0, gain: 0.15 }
        ],
        soundDescription: 'Yırtıcı 5.2L V10 İtalyan çığlığı, ara hızlanmalarda 2. vites kükremesi ve sert DCT vites patlamaları.'
    },
    {
        id: 'ferrari_v12',
        name: 'Ferrari 812 Superfast',
        type: '6.5L Naturally Aspirated V12',
        badge: '8,900 RPM',
        accentColor: '#F59E0B',
        glowColor: 'rgba(245, 158, 11, 0.4)',
        cylinders: 12,
        idleRpm: 950,
        redlineRpm: 8900,
        shiftRpm: 8700,
        idleCutoff: 170,
        redlineCutoff: 780,
        manifoldFreq: 130,
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
            { multiplier: 1.0, gain: 0.65, waveType: 'deep' },
            { multiplier: 2.0, gain: 0.45 },
            { multiplier: 3.0, gain: 0.35 },
            { multiplier: 6.0, gain: 0.14 }
        ],
        soundDescription: '6.5L safkan İtalyan V12 tınısı, yüksek devir senfonisi ve Formula 1 hissi veren vites geçişleri.'
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
        idleCutoff: 145,
        redlineCutoff: 640,
        manifoldFreq: 100,
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
            { multiplier: 1.0, gain: 0.72, detune: 12, waveType: 'deep' },
            { multiplier: 1.5, gain: 0.45 },
            { multiplier: 2.5, gain: 0.32 }
        ],
        soundDescription: 'Tok 5 silindir hırıltısı, anında dolan turbo ıslığı, blow-off valf sesi ve DSG vites patırtıları.'
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
        idleCutoff: 180,
        redlineCutoff: 700,
        manifoldFreq: 150,
        hasTurbo: false,
        hasSupercharger: false,
        gears: [
            { ratio: 1.0, maxSpeed: 260 }
        ],
        finalDrive: 1.0,
        harmonics: [
            { multiplier: 0.5, gain: 0.75, waveType: 'deep' },
            { multiplier: 1.0, gain: 0.45 },
            { multiplier: 2.0, gain: 0.20 }
        ],
        soundDescription: 'Derin hipersürücü warp titreşimi ve alt frekans kuantum itişi (0-260 km/h).'
    }
];

window.VEHICLE_PROFILES = VEHICLE_PROFILES;
