/**
 * ════════════════════════════════════════════════════════════════════════════════
 * © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * PROPRIETARY AND CONFIDENTIAL - INTELLECTUAL PROPERTY PROTECTION
 * 
 * This file contains proprietary intellectual property of Ryan Barbrick.
 * All concepts, algorithms, implementations, and innovations are protected by
 * copyright law and are considered trade secrets.
 * 
 * PROVISIONAL PATENT NOTICE:
 * The ideas, methods, systems, and code contained in this file are subject to
 * provisional patent protection. Unauthorized use, reproduction, modification,
 * or distribution is strictly prohibited.
 * 
 * LEGAL WARNING:
 * Unauthorized use of this intellectual property may result in:
 * - Civil litigation for copyright infringement
 * - Claims for actual and statutory damages ($750-$150,000 per work)
 * - Injunctive relief and cease & desist orders
 * - Criminal prosecution for willful infringement
 * - Recovery of attorney fees and legal costs
 * 
 * CREATOR INFORMATION:
 * Author: Ryan Barbrick
 * Business: Barbrick Design
 * Contact: BarbrickDesign@gmail.com
 * AI Assistant: Merlin AI
 * Repository: https://github.com/barbrickdesign/barbrickdesign.github.io
 * 
 * PATENT DECLARATION:
 * File: printer-board-detection.js
 * Declaration ID: IP-30919294-MLL28ZVL
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * GemBot 3D Printer Board Detection & Communication System
 * Detects and communicates with various 3D printer control boards
 * Includes parts inventory, recycling database, and NFT integration
 * 
 * Supported Firmwares:
 * - Marlin (most common - Ender, Prusa, CR-10, etc.)
 * - Klipper (Raspberry Pi based)
 * - RepRapFirmware (Duet boards)
 * - Smoothieware (Smoothieboard)
 * - grbl (CNC/laser cutters)
 * - TinyG (Othermill, Shapeoko)
 * - OctoPrint (web interface)
 * - MatterControl (MatterHackers)
 * - PrusaSlicer Connect
 * - Bambu Lab firmware
 * 
 * © 2024-2025 Ryan Barbrick / Barbrick Design
 */

const GemBotPrinterBridge = {
    version: '2.0.0',
    initialized: false,
    
    // Connection state
    connection: {
        port: null,
        reader: null,
        writer: null,
        connected: false,
        boardType: null,
        firmware: null,
        firmwareVersion: null,
        connectionType: 'usb', // 'usb', 'wifi', 'ethernet'
        ipAddress: null,
        wsConnection: null
    },
    
    // Detected printer info
    printer: {
        name: null,
        manufacturer: null,
        model: null,
        serialNumber: null,
        features: [],
        axes: { x: true, y: true, z: true, e: true },
        bedSize: { x: 0, y: 0, z: 0 },
        hotendCount: 1,
        heatedBed: false,
        autoLevel: false,
        toolchangerType: null, // 'manual', 'automatic', 'mmu2', 'mmu3', null
        enclosure: false,
        camera: false,
        filamentSensor: false,
        powerRecovery: false,
        touchscreen: false
    },
    
    // Firmware signatures for detection
    firmwareSignatures: {
        marlin: {
            patterns: [
                /FIRMWARE_NAME:Marlin/i,
                /Marlin\s+[\d\.]+/i,
                /echo:Marlin/i
            ],
            probe: 'M115\n',
            responseKey: 'FIRMWARE_NAME',
            gcodeDialect: 'marlin'
        },
        klipper: {
            patterns: [
                /Klipper/i,
                /klippy/i
            ],
            probe: 'M115\n',
            responseKey: 'FIRMWARE_NAME',
            gcodeDialect: 'klipper',
            note: 'Usually accessed via Moonraker API, not direct serial'
        },
        reprap: {
            patterns: [
                /RepRapFirmware/i,
                /FIRMWARE_NAME:RepRap/i,
                /Duet/i
            ],
            probe: 'M115\n',
            responseKey: 'FIRMWARE_NAME',
            gcodeDialect: 'reprap'
        },
        smoothie: {
            patterns: [
                /Smoothie/i,
                /FIRMWARE_NAME:Smoothie/i
            ],
            probe: 'M115\n',
            responseKey: 'FIRMWARE_NAME',
            gcodeDialect: 'smoothie'
        },
        grbl: {
            patterns: [
                /Grbl\s+[\d\.]+/i,
                /\[VER:/,
                /\$\$/  // Settings dump
            ],
            probe: '$I\n',
            responseKey: 'VER',
            gcodeDialect: 'grbl'
        },
        tinyg: {
            patterns: [
                /tinyg/i,
                /TinyG/,
                /"fv":/  // JSON response
            ],
            probe: '{"sr":""}\n',
            responseKey: 'fv',
            gcodeDialect: 'tinyg'
        },
        prusa: {
            patterns: [
                /Prusa-Firmware/i,
                /FIRMWARE_NAME:Prusa/i
            ],
            probe: 'M115\n',
            responseKey: 'FIRMWARE_NAME',
            gcodeDialect: 'marlin' // Prusa uses Marlin dialect
        }
    },
    
    // Comprehensive 3D Printer Database with Parts Lists for Recycling & Inventory
    printerDatabase: {
        // ========== ENDER SERIES ==========
        'Ender 3': {
            manufacturer: 'Creality',
            year: 2018,
            bedSize: { x: 220, y: 220, z: 250 },
            board: 'Creality 1.1.5',
            firmware: 'marlin',
            parts: {
                hotend: { model: 'MK8', value: 15, condition: 'good' },
                stepperMotors: { count: 4, model: 'Nema17 42-40', value: 12, condition: 'excellent' },
                bed: { type: 'heated', size: '235x235mm', value: 25, condition: 'good' },
                extruder: { type: 'bowden', model: 'MK8', value: 10, condition: 'good' },
                frame: { material: 'aluminum extrusion 2040', value: 45, condition: 'excellent' },
                psu: { specs: '24V 15A 360W', value: 20, condition: 'good' },
                display: { type: 'LCD12864', value: 8, condition: 'fair' },
                belts: { type: 'GT2', length: '2x 760mm, 1x 800mm', value: 5, condition: 'fair' },
                bearings: { type: 'LM8UU', count: 12, value: 2, condition: 'good' },
                rods: { type: '8mm chrome', length: '4x 350mm, 2x 370mm', value: 15, condition: 'good' }
            },
            recyclability: {
                nftUse: 'hotend-lightsaber',
                gemCutting: 'stepper-precision-control',
                salvageValue: 157,
                ecoRating: 8.5
            },
            commonIssues: ['bed leveling', 'hotend clog', 'belt tension', 'extruder clicking']
        },
        'Ender 3 V2': {
            manufacturer: 'Creality',
            year: 2020,
            bedSize: { x: 220, y: 220, z: 250 },
            board: 'Creality 4.2.2',
            firmware: 'marlin',
            parts: {
                hotend: { model: 'MK8 all-metal', value: 25, condition: 'excellent' },
                stepperMotors: { count: 4, model: 'Nema17 42-40 silent', value: 18, condition: 'excellent' },
                bed: { type: 'heated glass', size: '235x235mm', value: 35, condition: 'excellent' },
                extruder: { type: 'bowden upgraded', model: 'MK8', value: 15, condition: 'excellent' },
                frame: { material: 'aluminum extrusion 2040', value: 45, condition: 'excellent' },
                psu: { specs: '24V 15A 360W Meanwell', value: 30, condition: 'excellent' },
                display: { type: 'Color LCD', value: 25, condition: 'excellent' },
                belts: { type: 'GT2', length: '2x 760mm, 1x 800mm', value: 8, condition: 'good' },
                bearings: { type: 'POM wheels', count: 12, value: 3, condition: 'excellent' },
                toolhead: { model: 'V2 upgraded', value: 20, condition: 'excellent' }
            },
            recyclability: {
                nftUse: 'hotend-premium-lightsaber',
                gemCutting: 'silent-stepper-precision',
                salvageValue: 224,
                ecoRating: 9.2
            },
            commonIssues: ['firmware update needed', 'hotend gap', 'filament sensor']
        },
        'Ender 3 S1': {
            manufacturer: 'Creality',
            year: 2022,
            bedSize: { x: 220, y: 220, z: 270 },
            board: 'Creality 4.2.7',
            firmware: 'marlin',
            parts: {
                hotend: { model: 'Sprite Pro direct drive', value: 45, condition: 'premium' },
                stepperMotors: { count: 4, model: 'Nema17 TMC2208', value: 25, condition: 'premium' },
                bed: { type: 'heated PEI spring steel', size: '235x235mm', value: 45, condition: 'premium' },
                extruder: { type: 'direct drive dual gear', model: 'Sprite', value: 35, condition: 'premium' },
                frame: { material: 'aluminum extrusion 2040', value: 50, condition: 'excellent' },
                psu: { specs: '24V 20A 480W', value: 40, condition: 'excellent' },
                display: { type: '4.3" Color Touch', value: 35, condition: 'premium' },
                probe: { type: 'CR Touch auto-level', value: 25, condition: 'premium' },
                filamentSensor: { type: 'runout detection', value: 10, condition: 'excellent' }
            },
            recyclability: {
                nftUse: 'direct-drive-elite-lightsaber',
                gemCutting: 'ultra-precision-control',
                salvageValue: 310,
                ecoRating: 9.8
            },
            commonIssues: ['probe calibration', 'direct drive tuning']
        },

        // ========== PRUSA SERIES ==========
        'Prusa i3 MK3S+': {
            manufacturer: 'Prusa Research',
            year: 2021,
            bedSize: { x: 250, y: 210, z: 210 },
            board: 'Einsy RAMBo',
            firmware: 'prusa',
            parts: {
                hotend: { model: 'E3D V6 clone', value: 35, condition: 'premium' },
                stepperMotors: { count: 4, model: 'LDO Nema17', value: 30, condition: 'premium' },
                bed: { type: 'heated magnetic steel', size: '250x210mm', value: 60, condition: 'premium' },
                extruder: { type: 'Bondtech gears direct', model: 'Prusa', value: 50, condition: 'premium' },
                frame: { material: 'powder-coated steel', value: 80, condition: 'premium' },
                psu: { specs: '24V 240W', value: 35, condition: 'excellent' },
                display: { type: 'LCD with SD', value: 15, condition: 'good' },
                probe: { type: 'PINDA v2 inductive', value: 20, condition: 'premium' },
                filamentSensor: { type: 'IR + mechanical', value: 15, condition: 'premium' },
                bearings: { type: 'Misumi LM8UU', count: 8, value: 5, condition: 'premium' }
            },
            recyclability: {
                nftUse: 'bondtech-precision-lightsaber',
                gemCutting: 'professional-grade-control',
                salvageValue: 345,
                ecoRating: 9.5
            },
            commonIssues: ['PINDA height', 'first layer calibration', 'filament sensor']
        },
        'Prusa MINI+': {
            manufacturer: 'Prusa Research',
            year: 2020,
            bedSize: { x: 180, y: 180, z: 180 },
            board: 'Buddy',
            firmware: 'prusa',
            parts: {
                hotend: { model: 'E3D V6 hotend', value: 35, condition: 'premium' },
                stepperMotors: { count: 4, model: 'LDO Nema17', value: 25, condition: 'premium' },
                bed: { type: 'heated magnetic', size: '180x180mm', value: 40, condition: 'premium' },
                extruder: { type: 'Bondtech direct drive', model: 'MINI', value: 40, condition: 'premium' },
                frame: { material: 'aluminum extrusion', value: 35, condition: 'excellent' },
                psu: { specs: '24V 150W', value: 25, condition: 'excellent' },
                display: { type: '3.5" Color Touch', value: 30, condition: 'premium' },
                probe: { type: 'SuperPINDA', value: 25, condition: 'premium' },
                wifi: { module: 'ESP32', value: 10, condition: 'excellent' }
            },
            recyclability: {
                nftUse: 'compact-precision-lightsaber',
                gemCutting: 'desktop-precision-control',
                salvageValue: 265,
                ecoRating: 9.3
            },
            commonIssues: ['wifi connectivity', 'extruder calibration']
        },

        // ========== ARTILLERY SERIES ==========
        'Artillery Sidewinder X1': {
            manufacturer: 'Artillery',
            year: 2020,
            bedSize: { x: 300, y: 300, z: 400 },
            board: 'Artillery Ruby',
            firmware: 'marlin',
            specs: {
                dualZMotors: true,
                leadScrewPitch: '8mm',
                layerHeight: '0.1mm',
                gemBotCompatibility: 'Excellent - Dual Z perfect for angle control'
            },
            gemBotConversion: {
                feasibilityScore: 95,
                angleControlMotors: 'Dual Z-axis steppers (NEMA 17)',
                verticalControl: 'Y-axis stepper',
                motorPrecision: '0.1125° angle / 0.1mm vertical',
                estimatedConversionTime: '8-10 hours',
                costSavings: '$3,350 vs new GemBot Trinity'
            },
            parts: {
                hotend: { model: 'Volcano all-metal', value: 45, condition: 'excellent' },
                stepperMotors: { count: 5, model: 'Dual Z NEMA17 + XY + E', value: 25, condition: 'excellent' },
                bed: { type: 'heated glass 310x310mm', size: '310x310mm', value: 60, condition: 'excellent' },
                extruder: { type: 'direct drive titan', model: 'Titan', value: 35, condition: 'excellent' },
                frame: { material: 'aluminum extrusion heavy duty', value: 80, condition: 'excellent' },
                psu: { specs: '24V 400W', value: 40, condition: 'excellent' },
                display: { type: 'TFT35 touchscreen', value: 45, condition: 'excellent' },
                dualZMotors: { type: 'synchronized NEMA17', value: 50, condition: 'excellent', applications: ['GemBot angle control', 'precision positioning'] },
                leveling: { type: 'auto bed leveling', value: 25, condition: 'excellent' },
                enclosure: { type: 'partial side panels', value: 35, condition: 'good' }
            },
            recyclability: {
                nftUse: 'dual-motor-precision-lightsaber',
                gemCutting: 'dual-stepper-angle-control',
                salvageValue: 440,
                ecoRating: 8.7,
                gemBotConversionRating: 'Ideal for Trinity conversion'
            },
            commonIssues: ['bed warping', 'dual Z sync', 'extruder calibration']
        },

        // ========== BAMBU LAB SERIES ==========
        'Bambu Lab X1 Carbon': {
            manufacturer: 'Bambu Lab',
            year: 2022,
            bedSize: { x: 256, y: 256, z: 256 },
            board: 'Bambu Custom ARM',
            firmware: 'bambu',
            parts: {
                hotend: { model: 'All-metal 300C', value: 80, condition: 'premium' },
                stepperMotors: { count: 4, model: 'CoreXY + Z dual', value: 60, condition: 'premium' },
                bed: { type: 'heated textured PEI', size: '256x256mm', value: 70, condition: 'premium' },
                extruder: { type: 'direct drive', model: 'Bambu', value: 90, condition: 'premium' },
                frame: { material: 'carbon fiber panels', value: 150, condition: 'premium' },
                psu: { specs: '24V 350W', value: 50, condition: 'premium' },
                display: { type: '5" Color Touch', value: 80, condition: 'premium' },
                lidar: { type: 'AI failure detection', value: 120, condition: 'premium' },
                ams: { type: '4-spool changer', value: 200, condition: 'premium' },
                camera: { type: 'HD monitoring', value: 50, condition: 'premium' },
                filter: { type: 'HEPA + Carbon', value: 30, condition: 'excellent' }
            },
            recyclability: {
                nftUse: 'carbon-fiber-elite-lightsaber',
                gemCutting: 'ai-assisted-precision',
                salvageValue: 990,
                ecoRating: 9.9
            },
            commonIssues: ['AMS jamming', 'lidar calibration', 'filter replacement']
        },

        // ========== ULTIMAKER SERIES ==========
        'Ultimaker S3': {
            manufacturer: 'Ultimaker',
            year: 2018,
            bedSize: { x: 230, y: 190, z: 200 },
            board: 'Ultimaker',
            firmware: 'marlin',
            parts: {
                hotend: { model: 'Ultimaker dual nozzle', value: 150, condition: 'premium' },
                stepperMotors: { count: 6, model: 'Ultimaker custom', value: 45, condition: 'premium' },
                bed: { type: 'heated glass', size: '230x190mm', value: 60, condition: 'premium' },
                extruder: { type: 'bowden dual', model: 'Ultimaker', value: 180, condition: 'premium' },
                frame: { material: 'aluminum + panels', value: 120, condition: 'premium' },
                psu: { specs: '24V 221W', value: 40, condition: 'excellent' },
                display: { type: '3" Touch', value: 60, condition: 'premium' },
                probe: { type: 'capacitive auto-level', value: 40, condition: 'premium' },
                feeder: { type: 'dual Bondtech', value: 120, condition: 'premium' }
            },
            recyclability: {
                nftUse: 'dual-extrusion-lightsaber',
                gemCutting: 'professional-dual-precision',
                salvageValue: 815,
                ecoRating: 9.4
            },
            commonIssues: ['dual nozzle alignment', 'feeder maintenance']
        },

        // ========== VORON SERIES ==========
        'Voron 2.4': {
            manufacturer: 'Voron Design',
            year: 2020,
            bedSize: { x: 350, y: 350, z: 350 },
            board: 'Spider/Octopus',
            firmware: 'klipper',
            parts: {
                hotend: { model: 'Dragon/Revo', value: 60, condition: 'premium' },
                stepperMotors: { count: 6, model: 'LDO Nema17', value: 180, condition: 'premium' },
                bed: { type: '350x350 heated aluminum', value: 120, condition: 'premium' },
                extruder: { type: 'Clockwork direct drive', model: 'Voron', value: 80, condition: 'premium' },
                frame: { material: '2020 extrusion + panels', value: 200, condition: 'premium' },
                psu: { specs: '24V 600W', value: 60, condition: 'excellent' },
                controller: { type: 'Raspberry Pi 4', value: 80, condition: 'excellent' },
                probe: { type: 'Klicky/Euclid', value: 30, condition: 'premium' },
                chamber: { type: 'enclosed heated', value: 150, condition: 'premium' },
                toolhead: { type: 'CNC aluminum', value: 100, condition: 'premium' }
            },
            recyclability: {
                nftUse: 'enclosed-chamber-lightsaber',
                gemCutting: 'high-temp-precision-control',
                salvageValue: 1060,
                ecoRating: 9.7
            },
            commonIssues: ['chamber heating', 'klipper config', 'toolhead assembly']
        }
    },

    // ========== TOURMALINE CRYSTAL LIGHT SABER NFT SYSTEM ==========
    lightSaberNftSystem: {
        crystalTypes: {
            tourmaline: {
                varieties: {
                    'green-tourmaline': { rarity: 'rare', power: 85, frequency: '528Hz' },
                    'pink-tourmaline': { rarity: 'uncommon', power: 70, frequency: '639Hz' },
                    'blue-tourmaline': { rarity: 'epic', power: 95, frequency: '741Hz' },
                    'watermelon-tourmaline': { rarity: 'legendary', power: 100, frequency: '852Hz' },
                    'black-tourmaline': { rarity: 'common', power: 60, frequency: '396Hz' },
                    'chrome-tourmaline': { rarity: 'mythic', power: 120, frequency: '963Hz' }
                },
                properties: {
                    hardness: 7.5,
                    piezoelectric: true,
                    pyroelectric: true,
                    dichroic: true,
                    energetic: 'protective and grounding'
                }
            }
        },

        nftTemplates: {
            'hotend-lightsaber': {
                description: 'Basic lightsaber crafted from recycled 3D printer hotend',
                baseValue: 50,
                components: ['hotend', 'tourmaline crystal', 'LED array', 'sound module'],
                powerRating: 'Apprentice',
                edition: 'Common',
                abilities: ['basic illumination', 'sound effects']
            },
            'hotend-premium-lightsaber': {
                description: 'Enhanced lightsaber with all-metal hotend core',
                baseValue: 125,
                components: ['all-metal hotend', 'pink tourmaline', 'RGB LED array', 'premium sound'],
                powerRating: 'Padawan',
                edition: 'Uncommon',
                abilities: ['color changing', 'motion reactive sound', 'heat dissipation']
            },
            'direct-drive-elite-lightsaber': {
                description: 'Elite lightsaber featuring direct drive precision mechanism',
                baseValue: 250,
                components: ['direct drive mechanism', 'blue tourmaline', 'neopixel blade', 'haptic feedback'],
                powerRating: 'Knight',
                edition: 'Rare',
                abilities: ['precision control', 'haptic feedback', 'synchronized light/sound']
            },
            'bondtech-precision-lightsaber': {
                description: 'Professional grade lightsaber with Bondtech gear precision',
                baseValue: 400,
                components: ['bondtech gears', 'green tourmaline', 'proffie board', 'speaker array'],
                powerRating: 'Master',
                edition: 'Epic',
                abilities: ['gear-driven effects', 'programmable sequences', 'battle sounds']
            },
            'carbon-fiber-elite-lightsaber': {
                description: 'Premium carbon fiber lightsaber with AI-assisted features',
                baseValue: 800,
                components: ['carbon fiber frame', 'watermelon tourmaline', 'AI processor', 'adaptive lighting'],
                powerRating: 'Grand Master',
                edition: 'Legendary',
                abilities: ['AI battle assistance', 'adaptive lighting', 'force feedback', 'voice commands']
            },
            'enclosed-chamber-lightsaber': {
                description: 'Ultimate lightsaber with heated chamber technology',
                baseValue: 1500,
                components: ['heated chamber', 'chrome tourmaline', 'quantum processor', 'holographic display'],
                powerRating: 'Sith Lord / Jedi Master',
                edition: 'Mythic',
                abilities: ['thermal control', 'holographic interface', 'quantum entanglement', 'reality distortion']
            }
        },

        generateNft(printerModel, condition = 'good') {
            const printer = this.printerDatabase[printerModel];
            if (!printer) return null;

            const nftType = printer.recyclability.nftUse;
            const template = this.nftTemplates[nftType];
            
            if (!template) return null;

            const crystalType = this.selectCrystal(template.edition);
            const serialNumber = this.generateSerial(printerModel, Date.now());
            
            return {
                id: `GBOT-LS-${serialNumber}`,
                name: `${template.description} #${serialNumber}`,
                edition: template.edition,
                rarity: crystalType.rarity,
                powerRating: template.powerRating,
                baseValue: template.baseValue,
                crystal: crystalType,
                components: template.components,
                abilities: template.abilities,
                sourceModel: printerModel,
                craftedAt: new Date().toISOString(),
                condition: condition,
                metadata: {
                    blockchain: 'Solana',
                    collection: 'GemBot Lightsabers',
                    artist: 'Ryan Barbrick / Barbrick Design',
                    frequency: crystalType.frequency,
                    power: crystalType.power,
                    salvageValue: printer.recyclability.salvageValue
                }
            };
        },

        selectCrystal(edition) {
            const crystals = this.crystalTypes.tourmaline.varieties;
            switch(edition.toLowerCase()) {
                case 'common': return crystals['black-tourmaline'];
                case 'uncommon': return crystals['pink-tourmaline'];
                case 'rare': return crystals['green-tourmaline'];
                case 'epic': return crystals['blue-tourmaline'];
                case 'legendary': return crystals['watermelon-tourmaline'];
                case 'mythic': return crystals['chrome-tourmaline'];
                default: return crystals['black-tourmaline'];
            }
        },

        generateSerial(model, timestamp) {
            const modelCode = model.replace(/\s+/g, '').substring(0, 4).toUpperCase();
            const timeCode = timestamp.toString().slice(-6);
            return `${modelCode}-${timeCode}`;
        }
    },

    // ========== BOARD DETECTION DATABASE ==========
    boardDatabase: {
        'RAMPS': {
            manufacturer: 'RepRep',
            mcu: 'ATmega2560',
            voltage: '12V/24V',
            drivers: 'A4988/DRV8825',
            features: ['5 stepper drivers', 'heated bed', '3 thermistors']
        },
        'SKR': {
            manufacturer: 'BigTreeTech',
            mcu: 'STM32/LPC1768',
            voltage: '12V/24V',
            drivers: 'TMC2208/2209/5160',
            features: ['silent drivers', 'SD card', 'USB-C']
        },
        'Duet': {
            manufacturer: 'Duet3D',
            mcu: 'SAM4E8E/SAM4S',
            voltage: '12V/24V',
            drivers: 'TMC2660/5160',
            features: ['WiFi', 'web interface', 'expansion boards']
        },
        'Smoothieboard': {
            manufacturer: 'Smoothie',
            mcu: 'LPC1769',
            voltage: '12V/24V',
            drivers: 'A5984',
            features: ['ethernet', 'SD card', 'modular']
        },
        'Einsy': {
            manufacturer: 'Prusa Research',
            mcu: 'ATmega2560',
            voltage: '24V',
            drivers: 'TMC2130',
            features: ['silent mode', 'PINDA probe', 'removable bed']
        },
        'Creality': {
            manufacturer: 'Creality',
            mcu: 'STM32F103/GD32F303',
            voltage: '24V',
            drivers: 'A4988/TMC2208',
            features: ['basic LCD', 'SD card', 'upgradeable']
        },
        'MKS': {
            manufacturer: 'Makerbase',
            mcu: 'STM32F407',
            voltage: '12V/24V',
            drivers: 'TMC2209',
            features: ['WiFi module', 'TFT display', 'relay control']
        },
        'Archim': {
            manufacturer: 'UltiMachine',
            mcu: 'SAM3X8E',
            voltage: '12V/24V',
            drivers: 'TMC2130',
            features: ['32-bit', 'USB host', 'expandable']
        }
    },

    // ========== COMMUNICATION PROTOCOLS ==========
    communicationProtocols: {
        marlin: {
            baudRate: 115200,
            lineEnding: '\n',
            commands: {
                probe: 'M115',
                position: 'M114',
                temperature: 'M105',
                home: 'G28',
                move: 'G1 X{x} Y{y} Z{z} F{feedrate}',
                setTemp: 'M104 S{temp}',
                fanSpeed: 'M106 S{speed}',
                emergencyStop: 'M112'
            },
            responses: {
                ok: 'ok',
                error: 'Error:',
                temperature: /T:\d+\.\d+/,
                position: /X:\d+\.\d+ Y:\d+\.\d+ Z:\d+\.\d+/
            }
        },
        klipper: {
            baudRate: 115200,
            lineEnding: '\n',
            apiEndpoint: '/printer/objects/query',
            commands: {
                probe: 'STATUS',
                position: 'GET_POSITION', 
                temperature: 'QUERY_ADC',
                home: 'G28',
                move: 'G1 X{x} Y{y} Z{z} F{feedrate}',
                emergencyStop: 'EMERGENCY_STOP'
            },
            moonrakerApi: true
        },
        reprap: {
            baudRate: 57600,
            lineEnding: '\n',
            commands: {
                probe: 'M115',
                position: 'M114',
                temperature: 'M408 S0',
                home: 'G28',
                move: 'G1 X{x} Y{y} Z{z} F{feedrate}',
                setTemp: 'G10 P0 S{temp}',
                emergencyStop: 'M112'
            }
        },
        grbl: {
            baudRate: 115200,
            lineEnding: '\n',
            commands: {
                probe: '$I',
                status: '?',
                home: '$H',
                move: 'G1 X{x} Y{y} Z{z} F{feedrate}',
                emergencyStop: '!'
            }
        }
    },

    // ========== MENU INJECTION SYSTEM ==========
    menuInjectionSystem: {
        detectedMenus: {},
        
        injectGemBotMenu(targetSystem) {
            const gemBotMenu = {
                title: '💎 GemBot Control',
                icon: 'gembot-icon.png',
                items: [
                    { id: 'gem-cutting', label: '💎 Gem Cutting Mode', action: () => this.enableGemCuttingMode() },
                    { id: 'precision-movement', label: '📐 Precision Movement', action: () => this.showPrecisionControls() },
                    { id: 'crystal-alignment', label: '🔮 Crystal Alignment', action: () => this.alignCrystal() },
                    { id: 'tourmaline-settings', label: '💠 Tourmaline Settings', action: () => this.configureTourmaline() },
                    { id: 'nft-creation', label: '🎭 Create Lightsaber NFT', action: () => this.createLightsaberNft() },
                    { id: 'parts-inventory', label: '📦 Parts Inventory', action: () => this.showPartsInventory() },
                    { id: 'recycling-mode', label: '♻️ Recycling Analysis', action: () => this.analyzeForRecycling() }
                ]
            };

            switch(targetSystem) {
                case 'octoprint':
                    this.injectOctoPrintMenu(gemBotMenu);
                    break;
                case 'klipper':
                    this.injectKlipperMenu(gemBotMenu);
                    break;
                case 'prusa':
                    this.injectPrusaMenu(gemBotMenu);
                    break;
                case 'bambu':
                    this.injectBambuMenu(gemBotMenu);
                    break;
                default:
                    this.injectUniversalMenu(gemBotMenu);
            }
        },

        injectOctoPrintMenu(menu) {
            // Inject into OctoPrint's web interface
            const navbar = document.querySelector('#navbar');
            if (navbar) {
                const gemBotTab = this.createMenuElement(menu);
                navbar.appendChild(gemBotTab);
                console.log('🖨️ GemBot menu injected into OctoPrint');
            }
        },

        injectKlipperMenu(menu) {
            // Inject into Fluidd/Mainsail interface
            const sidebar = document.querySelector('.v-navigation-drawer__content');
            if (sidebar) {
                const gemBotSection = this.createMenuElement(menu);
                sidebar.appendChild(gemBotSection);
                console.log('🖨️ GemBot menu injected into Klipper interface');
            }
        },

        createMenuElement(menu) {
            const element = document.createElement('div');
            element.className = 'gembot-menu-injection';
            element.innerHTML = `
                <div class="gembot-menu-header">
                    <img src="${menu.icon}" alt="GemBot" />
                    <span>${menu.title}</span>
                </div>
                <ul class="gembot-menu-items">
                    ${menu.items.map(item => `
                        <li class="gembot-menu-item" data-action="${item.id}">
                            <a href="#" onclick="GemBotPrinterBridge.menuInjectionSystem.handleMenuClick('${item.id}')">${item.label}</a>
                        </li>
                    `).join('')}
                </ul>
            `;
            return element;
        },

        handleMenuClick(actionId) {
            const menuItem = this.getMenuItem(actionId);
            if (menuItem && menuItem.action) {
                menuItem.action();
            }
        },

        getMenuItem(actionId) {
            // This would return the corresponding menu item with its action
            const actions = {
                'gem-cutting': { action: () => this.enableGemCuttingMode() },
                'precision-movement': { action: () => this.showPrecisionControls() },
                'crystal-alignment': { action: () => this.alignCrystal() },
                'tourmaline-settings': { action: () => this.configureTourmaline() },
                'nft-creation': { action: () => this.createLightsaberNft() },
                'parts-inventory': { action: () => this.showPartsInventory() },
                'recycling-mode': { action: () => this.analyzeForRecycling() }
            };
            return actions[actionId];
        }
    },

    // ========== USB COMMUNICATION SYSTEM ==========
    usbCommunication: {
        supportedDevices: [
            // Arduino-based boards
            { vendorId: 0x2341, productId: 0x0043, name: 'Arduino Uno' },
            { vendorId: 0x2341, productId: 0x0001, name: 'Arduino Uno (Rev 1)' },
            { vendorId: 0x2341, productId: 0x0042, name: 'Arduino Mega 2560 Rev3' },
            { vendorId: 0x2341, productId: 0x0010, name: 'Arduino Mega 2560' },
            
            // FTDI chips (common in 3D printers)
            { vendorId: 0x0403, productId: 0x6001, name: 'FTDI FT232R' },
            { vendorId: 0x0403, productId: 0x6015, name: 'FTDI FT231X' },
            
            // CP210x chips (Silicon Labs)
            { vendorId: 0x10C4, productId: 0xEA60, name: 'CP210x UART Bridge' },
            
            // CH340/CH341 chips (common in Chinese boards)
            { vendorId: 0x1A86, productId: 0x7523, name: 'CH341 UART' },
            { vendorId: 0x1A86, productId: 0x5523, name: 'CH340 UART' },
            
            // STM32-based boards
            { vendorId: 0x0483, productId: 0x5740, name: 'STM32 Virtual COM Port' },
            { vendorId: 0x0483, productId: 0x374B, name: 'STM32 DFU Mode' },
            
            // Prusa specific
            { vendorId: 0x2C99, productId: 0x0002, name: 'Prusa i3 MK3' },
            
            // Creality specific  
            { vendorId: 0x1D50, productId: 0x6029, name: 'Creality 3D Printer' }
        ],

        async scanForPrinters() {
            const detectedPrinters = [];
            
            try {
                // Get all serial ports
                const ports = await navigator.serial.getPorts();
                console.log(`🔍 Found ${ports.length} serial ports`);
                
                for (const port of ports) {
                    const info = port.getInfo();
                    const device = this.identifyDevice(info);
                    
                    if (device) {
                        console.log(`🖨️ Detected: ${device.name} (VID: 0x${info.usbVendorId?.toString(16)}, PID: 0x${info.usbProductId?.toString(16)})`);
                        
                        // Try to connect and identify printer
                        const printerInfo = await this.probePrinter(port, device);
                        if (printerInfo) {
                            detectedPrinters.push({
                                port: port,
                                device: device,
                                printer: printerInfo
                            });
                        }
                    }
                }
                
                // Also scan for network-connected printers
                const networkPrinters = await this.scanNetworkPrinters();
                detectedPrinters.push(...networkPrinters);
                
            } catch (error) {
                console.error('❌ Error scanning for printers:', error);
            }
            
            return detectedPrinters;
        },

        identifyDevice(info) {
            return this.supportedDevices.find(device => 
                device.vendorId === info.usbVendorId && 
                device.productId === info.usbProductId
            );
        },

        async probePrinter(port, device) {
            try {
                // Open the serial connection
                await port.open({ baudRate: 115200 });
                console.log(`🔗 Connected to ${device.name}`);
                
                const writer = port.writable.getWriter();
                const reader = port.readable.getReader();
                
                // Send firmware identification command
                await writer.write(new TextEncoder().encode('M115\n'));
                
                // Read response with timeout
                const response = await this.readWithTimeout(reader, 5000);
                
                // Analyze firmware response
                const firmwareInfo = this.analyzeFirmwareResponse(response);
                
                // Try to identify printer model
                const printerModel = this.identifyPrinterModel(firmwareInfo, response);
                
                // Clean up connection
                reader.releaseLock();
                writer.releaseLock();
                await port.close();
                
                return {
                    firmware: firmwareInfo,
                    model: printerModel,
                    capabilities: this.detectCapabilities(response),
                    rawResponse: response
                };
                
            } catch (error) {
                console.warn(`⚠️ Could not probe ${device.name}:`, error.message);
                try {
                    await port.close();
                } catch (e) {}
                return null;
            }
        }
    },

    // ========== PARTS INVENTORY SYSTEM ==========
    partsInventory: {
        inventory: {},
        
        addToInventory(printerModel, condition = 'unknown') {
            const printer = GemBotPrinterBridge.printerDatabase[printerModel];
            if (!printer) return false;
            
            const inventoryId = `INV-${Date.now()}-${printerModel.replace(/\s+/g, '')}`;
            const analysis = this.analyzePrinterForParts(printerModel);
            
            this.inventory[inventoryId] = {
                ...analysis,
                addedAt: new Date().toISOString(),
                condition: condition,
                status: 'available'
            };
            
            console.log(`📦 Added ${printerModel} to parts inventory (ID: ${inventoryId})`);
            return inventoryId;
        },

        analyzePrinterForParts(printerModel) {
            const printer = GemBotPrinterBridge.printerDatabase[printerModel];
            if (!printer) return null;
            
            return {
                model: printerModel,
                manufacturer: printer.manufacturer,
                totalValue: printer.recyclability.salvageValue,
                ecoRating: printer.recyclability.ecoRating,
                nftPotential: printer.recyclability.nftUse,
                parts: Object.entries(printer.parts).map(([name, info]) => ({
                    name,
                    model: info.model,
                    value: info.value,
                    condition: info.condition
                }))
            };
        },

        // GemBot Trinity Motor Conversion System
        motorConversion: {
            // Analyze printer for GemBot motor compatibility
            analyzeForGemBotConversion: function(printerModel) {
                const printer = GemBotPrinterBridge.printerDatabase[printerModel];
                if (!printer) return null;
                
                const conversion = {
                    printerModel: printerModel,
                    manufacturer: printer.manufacturer,
                    gemBotVersion: 'Trinity v3.0',
                    feasibility: this.calculateFeasibility(printer),
                    motorMapping: this.generateMotorMapping(printer),
                    wiring: this.generateWiringPlan(printer),
                    controllerIntegration: this.planControllerIntegration(printer),
                    estimatedBuildTime: this.estimateBuildTime(printer),
                    costSavings: this.calculateCostSavings(printer)
                };
                
                return conversion;
            },
            
            // Generate motor mapping for GemBot Trinity
            generateMotorMapping: function(printer) {
                return {
                    // Use dual Z motors for precision angle control
                    angleControl: {
                        source: 'Z-axis dual motors',
                        motorType: 'NEMA 17 Stepper',
                        stepsPerRevolution: 200,
                        microstepping: 16,
                        totalSteps: 3200, // 200 * 16
                        gearing: '1:1 direct drive',
                        precision: '0.1125° per step', // 360° / 3200
                        usage: 'High precision gem angle positioning',
                        wiring: 'Extend Z-motor cables with jumper to GemBot angle mount'
                    },
                    
                    // Y-axis becomes up/down control
                    verticalControl: {
                        source: 'Y-axis motor (build plate)',
                        motorType: 'NEMA 17 Stepper',
                        stepsPerRevolution: 200,
                        microstepping: 16,
                        leadScrewPitch: printer.specs?.leadScrewPitch || '8mm',
                        precision: printer.specs?.layerHeight || '0.1mm',
                        usage: 'Vertical positioning for gem cutting depth',
                        wiring: 'Direct connection via existing Y-motor cables'
                    },
                    
                    // X-axis removed/repurposed
                    removedMotor: {
                        source: 'X-axis motor (left/right)',
                        status: 'REMOVED - Not needed for GemBot Trinity',
                        repurpose: 'Spare motor for future upgrades or projects',
                        value: '$25 salvage value'
                    },
                    
                    // Index control stays on Arduino
                    indexControl: {
                        source: 'Arduino + Motor Shield (existing)',
                        motorType: 'Custom 96-step precision stepper',
                        stepsPerRevolution: 96,
                        precision: '3.75° per step', // 360° / 96
                        facetAccuracy: 'True to traditional faceting designs',
                        usage: 'Precise gem rotation for facet cutting',
                        connection: 'USB serial to main controller',
                        integration: 'Parallel control with 3D printer board'
                    }
                };
            },
            
            // Generate detailed wiring plan
            generateWiringPlan: function(printer) {
                return {
                    overview: 'Convert 3D printer to GemBot Trinity gem cutting machine',
                    
                    step1_preparation: {
                        title: 'Printer Preparation',
                        actions: [
                            'Power down and disconnect 3D printer',
                            'Remove print head assembly (extruder/hotend)',
                            'Remove X-axis motor and belt system',
                            'Keep Y-axis (build plate) and dual Z-motors intact',
                            'Preserve all motor driver connections'
                        ]
                    },
                    
                    step2_motor_remapping: {
                        title: 'Motor Connection Remapping',
                        connections: {
                            'Z1_MOTOR': 'GemBot Angle Control Motor #1',
                            'Z2_MOTOR': 'GemBot Angle Control Motor #2', 
                            'Y_MOTOR': 'GemBot Vertical Control',
                            'X_MOTOR': 'DISCONNECTED (removed)',
                            'E0_MOTOR': 'DISCONNECTED (extruder removed)'
                        },
                        wiringExtensions: [
                            'Extend Z1/Z2 motor cables with 2-meter jumper cables',
                            'Route cables to GemBot angle control mount',
                            'Ensure proper shielding for precision control'
                        ]
                    },
                    
                    step3_arduino_integration: {
                        title: 'Arduino Index Control Integration',
                        setup: [
                            'Keep existing Arduino + motor shields for index control',
                            'Connect Arduino via USB to main computer',
                            'Run parallel serial communication:',
                            '  - 3D printer board: Angle + Vertical control',
                            '  - Arduino: Index motor (96-step precision)'
                        ],
                        motorSpecs: {
                            type: '96-step precision stepper',
                            stepsPerRevolution: 96,
                            stepAngle: '3.75°',
                            facetingCompatibility: 'Traditional gem cutting standards'
                        }
                    },
                    
                    step4_software_integration: {
                        title: 'Software Control Integration',
                        approach: 'Dual-controller system',
                        implementation: [
                            'Use Web Serial API for 3D printer board communication',
                            'Send G-code commands for Y (vertical) and Z (angle) control',
                            'Parallel Arduino communication for index control',
                            'Coordinate movements through master control script'
                        ]
                    }
                };
            },
            
            // Plan controller integration
            planControllerIntegration: function(printer) {
                return {
                    approach: 'Hybrid Control System',
                    
                    printerBoardControl: {
                        device: printer.controlBoard || 'Original 3D printer mainboard',
                        motors: ['Y-axis (vertical)', 'Dual Z-axis (angle control)'],
                        communication: 'Web Serial API + G-code',
                        commands: {
                            verticalMove: 'G1 Y{position} F{feedrate}',
                            angleControl: 'G1 Z{angle} F{feedrate}',
                            home: 'G28 Y Z',
                            position: 'M114 (get current position)'
                        },
                        advantages: [
                            'Existing stepper drivers and power supply',
                            'Proven motion control firmware',
                            'Web browser integration',
                            'No additional hardware costs'
                        ]
                    },
                    
                    arduinoIndexControl: {
                        device: 'Arduino + Motor Shield (existing)',
                        motor: '96-step precision stepper',
                        communication: 'USB Serial (parallel to printer)',
                        commands: {
                            rotate: 'ROTATE {steps}',
                            home: 'HOME',
                            position: 'POS?',
                            calibrate: 'CAL'
                        },
                        advantages: [
                            'Proven index control system',
                            'Precision 96-step motor compatibility',
                            'Independent operation',
                            'Faceting standard compliance'
                        ]
                    },
                    
                    masterControl: {
                        software: 'GemBot Trinity Control Interface',
                        coordination: 'Synchronized dual-serial communication',
                        features: [
                            'Unified cutting pattern programming',
                            'Coordinated 3-axis movement',
                            'Safety interlocks and limits',
                            'Progress monitoring and logging'
                        ]
                    }
                };
            },
            
            // Calculate conversion feasibility
            calculateFeasibility: function(printer) {
                let score = 0;
                let maxScore = 100;
                
                // Check for dual Z motors (critical for angle control)
                if (printer.specs?.dualZMotors || printer.model.includes('Artillery') || printer.model.includes('Ender 3')) {
                    score += 40; // Most important factor
                }
                
                // Check build volume (larger is better for gem cutting)
                const buildVol = printer.buildVolume;
                if (buildVol && (buildVol.includes('220') || buildVol.includes('250'))) {
                    score += 20;
                }
                
                // Check for quality components
                if (printer.type === 'FDM' && printer.manufacturer !== 'Unknown') {
                    score += 20;
                }
                
                // Check for standard stepper motors
                const hasStandardSteppers = printer.parts && Object.values(printer.parts).some(part => 
                    part.name && (part.name.includes('NEMA 17') || part.name.includes('Stepper'))
                );
                if (hasStandardSteppers) score += 20;
                
                return {
                    score: score,
                    percentage: Math.round((score / maxScore) * 100),
                    rating: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Poor',
                    recommendation: score >= 60 ? 'Highly recommended for conversion' : 
                                  score >= 40 ? 'Suitable with modifications' : 'Consider alternative printer'
                };
            },
            
            // Estimate build time
            estimateBuildTime: function(printer) {
                return {
                    disassembly: '2-3 hours',
                    wiringModification: '3-4 hours', 
                    softwareSetup: '1-2 hours',
                    testing: '2-3 hours',
                    total: '8-12 hours',
                    complexity: 'Intermediate (requires basic electronics knowledge)',
                    tools: [
                        'Screwdriver set',
                        'Wire strippers/crimpers',
                        'Jumper cables (2-meter)',
                        'Multimeter',
                        'Computer with Chrome/Edge browser'
                    ]
                };
            },
            
            // Calculate cost savings
            calculateCostSavings: function(printer) {
                const newGemBotCost = 3500; // Estimated new GemBot Trinity cost
                const conversionCost = 150;  // Wire, connectors, labor
                const printerValue = printer.recyclability?.salvageValue || 200;
                
                return {
                    newGemBotCost: newGemBotCost,
                    conversionCost: conversionCost,
                    printerValue: printerValue,
                    totalCost: conversionCost, // You already own the printer
                    savings: newGemBotCost - conversionCost,
                    savingsPercentage: Math.round(((newGemBotCost - conversionCost) / newGemBotCost) * 100),
                    roi: 'Immediate - functional gem cutting machine',
                    additionalBenefits: [
                        'Sustainable recycling of electronics',
                        'Learning experience in machine conversion',
                        'Customizable for specific gem types',
                        'Scalable for multiple machine builds'
                    ]
                };
            }
        }
    },

    // Board database continues...
    boardDatabase: {
        'RAMPS': {
            manufacturer: 'RepRep',
            mcu: 'ATmega2560',
            voltage: '12V/24V',
            drivers: 'A4988/DRV8825',
            features: ['5 stepper drivers', 'heated bed', '3 thermistors']
            features: ['silent mode', 'PINDA probe', 'removable bed']
        },
        'Creality': {
            manufacturer: 'Creality',
            mcu: 'STM32F103/GD32F303',
            voltage: '24V',
            drivers: 'A4988/TMC2208',
            features: ['basic LCD', 'SD card', 'upgradeable']
        },
        'MKS': {
            manufacturer: 'Makerbase',
            mcu: 'STM32F407',
            voltage: '12V/24V',
            drivers: 'TMC2209',
            features: ['WiFi module', 'TFT display', 'relay control']
        },
        'Archim': {
            manufacturer: 'UltiMachine',
            mcu: 'SAM3X8E',
            voltage: '12V/24V',
            drivers: 'TMC2130',
            features: ['32-bit', 'USB host', 'expandable']
        }
    },
    
    /**
     * Initialize the printer bridge
     */
    async init() {
        if (this.initialized) return this;
        
        console.log('🖨️ GemBot Printer Bridge initializing...');
        
        // Check for Web Serial API support
        if (!('serial' in navigator)) {
            console.warn('⚠️ Web Serial API not supported in this browser');
            this.webSerialSupported = false;
        } else {
            this.webSerialSupported = true;
            console.log('✅ Web Serial API available');
        }
        
        // Load saved printer configurations
        this.loadSavedPrinters();
        
        this.initialized = true;
        console.log('✅ Printer Bridge initialized');
        
        return this;
    },
    
    /**
     * Request USB serial port access and connect
     */
    async connect() {
        if (!this.webSerialSupported) {
            throw new Error('Web Serial API not supported. Use Chrome, Edge, or Opera.');
        }
        
        try {
            // Request port from user
            const port = await navigator.serial.requestPort();
            
            // Open port with common baud rates
            const baudRates = [115200, 250000, 57600, 9600];
            let connected = false;
            
            for (const baud of baudRates) {
                try {
                    await port.open({ baudRate: baud });
                    console.log(`📡 Connected at ${baud} baud`);
                    connected = true;
                    break;
                } catch (e) {
                    console.log(`❌ ${baud} baud failed, trying next...`);
                }
            }
            
            if (!connected) {
                throw new Error('Could not connect at any standard baud rate');
            }
            
            this.connection.port = port;
            this.connection.connected = true;
            
            // Setup reader/writer
            const textDecoder = new TextDecoderStream();
            const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
            this.connection.reader = textDecoder.readable.getReader();
            
            const textEncoder = new TextEncoderStream();
            const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
            this.connection.writer = textEncoder.writable.getWriter();
            
            // Detect firmware
            await this.detectFirmware();
            
            // Dispatch connection event
            window.dispatchEvent(new CustomEvent('printerConnected', {
                detail: {
                    firmware: this.connection.firmware,
                    version: this.connection.firmwareVersion,
                    printer: this.printer
                }
            }));
            
            return true;
            
        } catch (error) {
            console.error('❌ Connection failed:', error);
            throw error;
        }
    },
    
    /**
     * Detect firmware type by probing the board
     */
    async detectFirmware() {
        console.log('🔍 Detecting firmware...');
        
        // Send M115 (universal firmware info command)
        await this.sendCommand('M115');
        
        // Wait for response
        const response = await this.readResponse(2000);
        console.log('📨 Firmware response:', response);
        
        // Match against known signatures
        for (const [name, sig] of Object.entries(this.firmwareSignatures)) {
            for (const pattern of sig.patterns) {
                if (pattern.test(response)) {
                    this.connection.firmware = name;
                    this.connection.boardType = this.detectBoardFromResponse(response);
                    
                    // Extract version
                    const versionMatch = response.match(/[\d]+\.[\d]+\.[\d]+/);
                    if (versionMatch) {
                        this.connection.firmwareVersion = versionMatch[0];
                    }
                    
                    console.log(`✅ Detected: ${name} ${this.connection.firmwareVersion || ''}`);
                    
                    // Get printer capabilities
                    await this.queryCapabilities();
                    
                    return;
                }
            }
        }
        
        console.warn('⚠️ Unknown firmware detected');
        this.connection.firmware = 'unknown';
    },
    
    /**
     * Detect board type from firmware response
     */
    detectBoardFromResponse(response) {
        const boardPatterns = {
            'SKR': /BTT\s*SKR|BIGTREETECH.*SKR/i,
            'RAMPS': /RAMPS/i,
            'Duet': /Duet/i,
            'Smoothieboard': /Smoothie/i,
            'Einsy': /Einsy|Prusa/i,
            'Creality': /Creality|CR-|Ender/i,
            'MKS': /MKS|Makerbase/i,
            'Archim': /Archim|UltiMachine/i
        };
        
        for (const [board, pattern] of Object.entries(boardPatterns)) {
            if (pattern.test(response)) {
                return board;
            }
        }
        
        return 'Generic';
    },
    
    /**
     * Query printer capabilities
     */
    async queryCapabilities() {
        const firmware = this.connection.firmware;
        
        if (firmware === 'marlin' || firmware === 'prusa') {
            // Get bed size from M503 (EEPROM settings)
            await this.sendCommand('M503');
            const settings = await this.readResponse(3000);
            
            // Parse bed size from M211 response
            const sizeMatch = settings.match(/M211.*X([\d.]+).*Y([\d.]+).*Z([\d.]+)/i);
            if (sizeMatch) {
                this.printer.bedSize = {
                    x: parseFloat(sizeMatch[1]),
                    y: parseFloat(sizeMatch[2]),
                    z: parseFloat(sizeMatch[3])
                };
            }
            
            // Check for auto-level (G29)
            this.printer.autoLevel = /G29|BLTouch|PINDA|ABL/i.test(settings);
            
            // Check extruder count
            const extruderMatch = settings.match(/EXTRUDERS[:\s]+(\d+)/i);
            if (extruderMatch) {
                this.printer.hotendCount = parseInt(extruderMatch[1]);
            }
        }
        
        if (firmware === 'grbl') {
            // grbl settings
            await this.sendCommand('$$');
            const grblSettings = await this.readResponse(2000);
            
            // Parse work area from $130, $131, $132
            const xMax = grblSettings.match(/\$130=([\d.]+)/);
            const yMax = grblSettings.match(/\$131=([\d.]+)/);
            const zMax = grblSettings.match(/\$132=([\d.]+)/);
            
            if (xMax && yMax && zMax) {
                this.printer.bedSize = {
                    x: parseFloat(xMax[1]),
                    y: parseFloat(yMax[1]),
                    z: parseFloat(zMax[1])
                };
            }
        }
        
        console.log('📊 Printer capabilities:', this.printer);
    },
    
    /**
     * Send G-code command to printer
     */
    async sendCommand(command) {
        if (!this.connection.connected || !this.connection.writer) {
            throw new Error('Not connected to printer');
        }
        
        const cmd = command.endsWith('\n') ? command : command + '\n';
        await this.connection.writer.write(cmd);
        console.log('📤 Sent:', command);
    },
    
    /**
     * Read response from printer with timeout
     */
    async readResponse(timeout = 1000) {
        if (!this.connection.reader) {
            throw new Error('No reader available');
        }
        
        let response = '';
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            try {
                const { value, done } = await Promise.race([
                    this.connection.reader.read(),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('timeout')), 100)
                    )
                ]);
                
                if (done) break;
                if (value) response += value;
                
                // Check for end markers
                if (response.includes('ok') || response.includes('error')) {
                    break;
                }
            } catch (e) {
                if (e.message !== 'timeout') throw e;
            }
        }
        
        return response;
    },
    
    /**
     * Disconnect from printer
     */
    async disconnect() {
        if (this.connection.reader) {
            await this.connection.reader.cancel();
        }
        if (this.connection.writer) {
            await this.connection.writer.close();
        }
        if (this.connection.port) {
            await this.connection.port.close();
        }
        
        this.connection = {
            port: null,
            reader: null,
            writer: null,
            connected: false,
            boardType: null,
            firmware: null,
            firmwareVersion: null
        };
        
        console.log('🔌 Disconnected from printer');
        
        window.dispatchEvent(new CustomEvent('printerDisconnected'));
    },
    
    /**
     * Inject GemBot menu into printer's display
     * Works by sending custom M117 messages or LCD commands
     */
    async injectGemBotMenu() {
        if (!this.connection.connected) {
            throw new Error('Not connected to printer');
        }
        
        const firmware = this.connection.firmware;
        
        console.log('💉 Injecting GemBot menu into', firmware, 'firmware...');
        
        // Display GemBot welcome message
        if (firmware === 'marlin' || firmware === 'prusa') {
            await this.sendCommand('M117 GemBot Connected!');
            await this.sendCommand('M300 S440 P200'); // Beep
        } else if (firmware === 'reprap') {
            await this.sendCommand('M291 P"GemBot Connected!" R"GemBot" S0 T5');
        } else if (firmware === 'klipper') {
            // Klipper uses macros - would need to define via Moonraker
            console.log('📝 Klipper detected - menu injection requires Moonraker API');
        }
        
        // Set up status polling
        this.startStatusPolling();
        
        return true;
    },
    
    /**
     * Start polling printer status
     */
    startStatusPolling() {
        if (this.statusInterval) {
            clearInterval(this.statusInterval);
        }
        
        this.statusInterval = setInterval(async () => {
            if (!this.connection.connected) {
                clearInterval(this.statusInterval);
                return;
            }
            
            try {
                await this.sendCommand('M105'); // Get temperatures
                const tempResponse = await this.readResponse(500);
                
                // Parse temperature
                const hotendMatch = tempResponse.match(/T:(\d+\.?\d*)/);
                const bedMatch = tempResponse.match(/B:(\d+\.?\d*)/);
                
                const status = {
                    hotendTemp: hotendMatch ? parseFloat(hotendMatch[1]) : null,
                    bedTemp: bedMatch ? parseFloat(bedMatch[1]) : null,
                    timestamp: Date.now()
                };
                
                window.dispatchEvent(new CustomEvent('printerStatus', { detail: status }));
                
            } catch (e) {
                // Ignore polling errors
            }
        }, 2000);
    },
    
    /**
     * Execute GemBot-specific operations
     */
    async executeGemBotOperation(operation, params = {}) {
        console.log('🔧 Executing GemBot operation:', operation);
        
        switch (operation) {
            case 'homeAll':
                await this.sendCommand('G28');
                break;
                
            case 'homeXY':
                await this.sendCommand('G28 X Y');
                break;
                
            case 'homeZ':
                await this.sendCommand('G28 Z');
                break;
                
            case 'moveToPosition':
                const { x, y, z, feedrate = 3000 } = params;
                let cmd = `G0 F${feedrate}`;
                if (x !== undefined) cmd += ` X${x}`;
                if (y !== undefined) cmd += ` Y${y}`;
                if (z !== undefined) cmd += ` Z${z}`;
                await this.sendCommand(cmd);
                break;
                
            case 'setHotend':
                await this.sendCommand(`M104 S${params.temp || 0}`);
                break;
                
            case 'setBed':
                await this.sendCommand(`M140 S${params.temp || 0}`);
                break;
                
            case 'startSpindle':
                // For CNC/gemstone operations
                const rpm = params.rpm || 10000;
                if (this.connection.firmware === 'grbl') {
                    await this.sendCommand(`M3 S${rpm}`);
                } else {
                    await this.sendCommand(`M3 S${rpm}`);
                }
                break;
                
            case 'stopSpindle':
                await this.sendCommand('M5');
                break;
                
            case 'emergencyStop':
                await this.sendCommand('M112');
                break;
                
            case 'gemCutSequence':
                // Custom gemstone cutting sequence
                await this.executeGemCutSequence(params);
                break;
                
            default:
                console.warn('Unknown operation:', operation);
        }
    },
    
    /**
     * Execute gemstone cutting sequence
     */
    async executeGemCutSequence(params) {
        const { facets = 8, angle = 42, depth = 0.5 } = params;
        
        console.log(`💎 Starting gem cut: ${facets} facets at ${angle}°`);
        
        // Home first
        await this.sendCommand('G28');
        await this.readResponse(30000);
        
        // Move to safe height
        await this.sendCommand('G0 Z50 F1000');
        await this.readResponse(5000);
        
        // Start spindle
        await this.sendCommand('M3 S10000');
        await new Promise(r => setTimeout(r, 2000));
        
        // Cut each facet
        const angleStep = 360 / facets;
        for (let i = 0; i < facets; i++) {
            const rotationAngle = i * angleStep;
            console.log(`  Cutting facet ${i + 1}/${facets} at ${rotationAngle}°`);
            
            // Rotate A-axis (if available)
            await this.sendCommand(`G0 A${rotationAngle} F1000`);
            await this.readResponse(3000);
            
            // Approach cut
            await this.sendCommand(`G1 Z${-depth} F100`);
            await this.readResponse(5000);
            
            // Retract
            await this.sendCommand('G0 Z5 F500');
            await this.readResponse(2000);
        }
        
        // Stop spindle
        await this.sendCommand('M5');
        
        // Return home
        await this.sendCommand('G28');
        
        console.log('✅ Gem cut sequence complete');
    },
    
    /**
     * Load saved printer configurations from localStorage
     */
    loadSavedPrinters() {
        try {
            const saved = localStorage.getItem('gembot_saved_printers');
            if (saved) {
                this.savedPrinters = JSON.parse(saved);
                console.log('📂 Loaded', Object.keys(this.savedPrinters).length, 'saved printers');
            } else {
                this.savedPrinters = {};
            }
        } catch (e) {
            this.savedPrinters = {};
        }
    },
    
    /**
     * Save current printer configuration
     */
    savePrinterConfig(name) {
        if (!this.connection.connected) {
            console.warn('No printer connected');
            return;
        }
        
        this.savedPrinters[name] = {
            firmware: this.connection.firmware,
            firmwareVersion: this.connection.firmwareVersion,
            boardType: this.connection.boardType,
            printer: { ...this.printer },
            savedAt: new Date().toISOString()
        };
        
        localStorage.setItem('gembot_saved_printers', JSON.stringify(this.savedPrinters));
        console.log('💾 Saved printer config:', name);
    },
    
    /**
     * Render connection UI
     */
    renderConnectionUI() {
        const connected = this.connection.connected;
        const firmware = this.connection.firmware;
        const version = this.connection.firmwareVersion;
        
        return `
            <div class="printer-connection-panel" style="
                background: linear-gradient(135deg, #1a1f3a 0%, #2d1f3a 100%);
                border: 2px solid ${connected ? '#4affff' : '#667eea'};
                border-radius: 12px;
                padding: 20px;
                color: white;
                font-family: system-ui, sans-serif;
            ">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                    <span style="font-size: 32px;">${connected ? '🖨️' : '🔌'}</span>
                    <div>
                        <h3 style="margin: 0; color: #4affff;">3D Printer Bridge</h3>
                        <p style="margin: 4px 0 0; font-size: 12px; color: #9f7aea;">
                            ${connected ? `Connected: ${firmware} ${version}` : 'Not connected'}
                        </p>
                    </div>
                </div>
                
                ${connected ? `
                    <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px;">
                            <div>📐 Board: <span style="color: #ffd700;">${this.connection.boardType}</span></div>
                            <div>🔧 Firmware: <span style="color: #ffd700;">${firmware}</span></div>
                            <div>📏 Bed: <span style="color: #4affff;">${this.printer.bedSize.x}×${this.printer.bedSize.y}×${this.printer.bedSize.z}mm</span></div>
                            <div>🔥 Hotends: <span style="color: #4affff;">${this.printer.hotendCount}</span></div>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <button onclick="GemBotPrinterBridge.executeGemBotOperation('homeAll')" 
                            style="padding: 8px 16px; background: #667eea; border: none; border-radius: 6px; color: white; cursor: pointer;">
                            🏠 Home All
                        </button>
                        <button onclick="GemBotPrinterBridge.executeGemBotOperation('startSpindle', {rpm: 10000})" 
                            style="padding: 8px 16px; background: #10b981; border: none; border-radius: 6px; color: white; cursor: pointer;">
                            ⚡ Start Spindle
                        </button>
                        <button onclick="GemBotPrinterBridge.executeGemBotOperation('stopSpindle')" 
                            style="padding: 8px 16px; background: #f59e0b; border: none; border-radius: 6px; color: white; cursor: pointer;">
                            ⏹️ Stop
                        </button>
                        <button onclick="GemBotPrinterBridge.executeGemBotOperation('emergencyStop')" 
                            style="padding: 8px 16px; background: #ef4444; border: none; border-radius: 6px; color: white; cursor: pointer;">
                            🚨 E-STOP
                        </button>
                        <button onclick="GemBotPrinterBridge.disconnect()" 
                            style="padding: 8px 16px; background: rgba(255,255,255,0.1); border: 1px solid #667eea; border-radius: 6px; color: white; cursor: pointer;">
                            🔌 Disconnect
                        </button>
                    </div>
                ` : `
                    <button onclick="GemBotPrinterBridge.connect().catch(e => alert(e.message))" 
                        style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea, #9f7aea); 
                        border: none; border-radius: 8px; color: white; font-size: 16px; cursor: pointer;">
                        🔗 Connect to 3D Printer
                    </button>
                    ${!this.webSerialSupported ? `
                        <p style="color: #f59e0b; font-size: 12px; margin-top: 8px;">
                            ⚠️ Web Serial not supported. Use Chrome, Edge, or Opera.
                        </p>
                    ` : ''}
                `}
            </div>
        `;
    }
};

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GemBotPrinterBridge.init());
} else {
    GemBotPrinterBridge.init();
}

// Export
window.GemBotPrinterBridge = GemBotPrinterBridge;
