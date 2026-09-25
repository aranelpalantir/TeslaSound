/**
 * Vehicle Profiles & Acoustic Configurations
 * Tuned with deep rotational harmonics, low-frequency lope,
 * and maximum acoustic exhaust body.
 */

const VEHICLE_PROFILES = [
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
        redlineCutoff: 580,
        manifoldFreq: 95,
        hasTurbo: false,
        hasSupercharger: true,
        superchargerRatio: 1.8,
        gears: [
            { ratio: 3.14, maxSpeed: 64 },
            { ratio: 2.05, maxSpeed: 98 },
            { ratio: 1.43, maxSpeed: 142 },
            { ratio: 1.10, maxSpeed: 185 },
            { ratio: 0.86, maxSpeed: 236 },
            { ratio: 0.68, maxSpeed: 290 },
            { ratio: 0.56, maxSpeed: 325 }
        ],
        finalDrive: 3.73,
        harmonics: [
            { multiplier: 1.0, gain: 0.75, detune: 18, waveType: 'deep' }, // Heavy crankshaft rumble & crossplane lope
            { multiplier: 2.0, gain: 0.55 },                               // Cylinder bank pair thump
            { multiplier: 3.0, gain: 0.28 },                               // Guttural iron block growl
            { multiplier: 4.0, gain: 0.18 }                                // Exhaust throat
        ],
        soundDescription: 'Ultra-tok, devasa 5.2L Amerikan V8 homurtusu ve derin kompresör bası.'
    },
    {
        id: 'porsche_gt3',
        name: 'Porsche 911 GT3 RS',
        type: '4.0L Naturally Aspirated Flat-6',
        badge: '9,000 RPM',
        accentColor: '#E53E3E',
        glowColor: 'rgba(229, 62, 62, 0.4)',
        cylinders: 6,
        idleRpm: 850,
        redlineRpm: 9000,
        shiftRpm: 8800,
        idleCutoff: 160,
        redlineCutoff: 680,
        manifoldFreq: 110,
        hasTurbo: false,
        hasSupercharger: false,
        gears: [
            { ratio: 3.75, maxSpeed: 68 },
            { ratio: 2.38, maxSpeed: 108 },
            { ratio: 1.72, maxSpeed: 150 },
            { ratio: 1.34, maxSpeed: 192 },
            { ratio: 1.11, maxSpeed: 232 },
            { ratio: 0.96, maxSpeed: 275 },
            { ratio: 0.84, maxSpeed: 318 }
        ],
        finalDrive: 3.97,
        harmonics: [
            { multiplier: 1.0, gain: 0.70, detune: 8, waveType: 'deep' },  // Boxer crankshaft rotation thud
            { multiplier: 1.5, gain: 0.50 },                               // 3-cylinder bank alternate lope
            { multiplier: 3.0, gain: 0.32 },                               // Boxer cylinder firing throat
            { multiplier: 4.5, gain: 0.12 }                                // Exhaust presence
        ],
        soundDescription: 'Derin, tok ve gırtlaktan gelen 4.0L atmosferik Flat-6 boksör kükremesi.'
    },
    {
        id: 'lambo_v10',
        name: 'Lamborghini Huracán V10',
        type: '5.2L Naturally Aspirated V10',
        badge: '8,500 RPM',
        accentColor: '#10B981',
        glowColor: 'rgba(16, 185, 129, 0.4)',
        cylinders: 10,
        idleRpm: 900,
        redlineRpm: 8500,
        shiftRpm: 8300,
        idleCutoff: 165,
        redlineCutoff: 720,
        manifoldFreq: 120,
        hasTurbo: false,
        hasSupercharger: false,
        gears: [
            { ratio: 3.91, maxSpeed: 72 },
            { ratio: 2.44, maxSpeed: 115 },
            { ratio: 1.81, maxSpeed: 156 },
            { ratio: 1.40, maxSpeed: 200 },
            { ratio: 1.13, maxSpeed: 248 },
            { ratio: 0.94, maxSpeed: 295 },
            { ratio: 0.79, maxSpeed: 330 }
        ],
        finalDrive: 3.73,
        harmonics: [
            { multiplier: 1.0, gain: 0.65, waveType: 'deep' },
            { multiplier: 2.0, gain: 0.48 },
            { multiplier: 2.5, gain: 0.38 },                               // 5-cylinder odd lope
            { multiplier: 5.0, gain: 0.15 }
        ],
        soundDescription: 'Tok, yırtıcı 5.2L V10 egzoz homurtusu ve derin vites patırtıları.'
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
        redlineCutoff: 750,
        manifoldFreq: 130,
        hasTurbo: false,
        hasSupercharger: false,
        gears: [
            { ratio: 3.40, maxSpeed: 78 },
            { ratio: 2.19, maxSpeed: 122 },
            { ratio: 1.63, maxSpeed: 165 },
            { ratio: 1.29, maxSpeed: 208 },
            { ratio: 1.03, maxSpeed: 260 },
            { ratio: 0.84, maxSpeed: 310 },
            { ratio: 0.63, maxSpeed: 340 }
        ],
        finalDrive: 4.38,
        harmonics: [
            { multiplier: 1.0, gain: 0.65, waveType: 'deep' },
            { multiplier: 2.0, gain: 0.45 },
            { multiplier: 3.0, gain: 0.35 },
            { multiplier: 6.0, gain: 0.14 }
        ],
        soundDescription: 'Karakteristik 6.5L safkan İtalyan V12 gövde bası ve derin egzoz tınısı.'
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
        redlineCutoff: 600,
        manifoldFreq: 100,
        hasTurbo: true,
        hasSupercharger: false,
        gears: [
            { ratio: 3.56, maxSpeed: 55 },
            { ratio: 2.14, maxSpeed: 92 },
            { ratio: 1.48, maxSpeed: 135 },
            { ratio: 1.11, maxSpeed: 180 },
            { ratio: 0.87, maxSpeed: 230 },
            { ratio: 0.69, maxSpeed: 275 },
            { ratio: 0.57, maxSpeed: 300 }
        ],
        finalDrive: 4.05,
        harmonics: [
            { multiplier: 1.0, gain: 0.72, detune: 12, waveType: 'deep' }, // Derin 5-silindir homurtusu
            { multiplier: 1.5, gain: 0.45 },
            { multiplier: 2.5, gain: 0.32 }
        ],
        soundDescription: 'Tok 5 silindir hırıltısı, derin turbo dolumu ve sert DSG vites patlamaları.'
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
        redlineCutoff: 650,
        manifoldFreq: 150,
        hasTurbo: false,
        hasSupercharger: false,
        gears: [
            { ratio: 1.0, maxSpeed: 280 }
        ],
        finalDrive: 1.0,
        harmonics: [
            { multiplier: 0.5, gain: 0.75, waveType: 'deep' },             // Derin uzay aracı warp titreşimi
            { multiplier: 1.0, gain: 0.45 },
            { multiplier: 2.0, gain: 0.20 }
        ],
        soundDescription: 'Derin hipersürücü warp titreşimi ve alt frekans kuantum itişi.'
    }
];

window.VEHICLE_PROFILES = VEHICLE_PROFILES;
