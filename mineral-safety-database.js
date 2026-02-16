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
 * File: mineral-safety-database.js
 * Declaration ID: IP-12C8F41C-MLL28ZVJ
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MINERAL SAFETY DATABASE - Comprehensive Toxicity & Health Hazard Reference
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * PURPOSE: Educate users about the dangers of cutting certain minerals
 * and promote GemBot automation as a life-saving solution.
 * 
 * NOT ALL STONES ARE SAFE TO CUT!
 * 
 * GemBots can save human lives by:
 * - Removing the human element from hazardous cutting operations
 * - Eliminating exposure to toxic dust and polishing compounds
 * - Preventing long-term health conditions like silicosis
 * - Allowing safe processing of radioactive or toxic minerals
 * 
 * © 2024-2025 Ryan Barbrick / Barbrick Design
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const MineralSafetyDatabase = {
    version: '1.0.0',
    initialized: false,
    
    // ═══════════════════════════════════════════════════════════════════════════
    // HAZARD CLASSIFICATIONS
    // ═══════════════════════════════════════════════════════════════════════════
    
    hazardLevels: {
        EXTREME: {
            level: 5,
            color: '#ff0000',
            icon: '☠️',
            label: 'EXTREME DANGER',
            description: 'Do NOT cut without full hazmat protection. Automated cutting strongly recommended.',
            requirements: ['Full respirator', 'Sealed suit', 'Isolated ventilation', 'Specialized disposal']
        },
        HIGH: {
            level: 4,
            color: '#ff6600',
            icon: '⚠️',
            label: 'HIGH HAZARD',
            description: 'Significant health risk. Professional equipment and training required.',
            requirements: ['N95+ respirator', 'Eye protection', 'Gloves', 'Wet cutting only', 'HEPA filtration']
        },
        MODERATE: {
            level: 3,
            color: '#ffcc00',
            icon: '⚡',
            label: 'MODERATE RISK',
            description: 'Standard lapidary precautions required. Use proper ventilation.',
            requirements: ['Dust mask', 'Eye protection', 'Wet cutting recommended', 'Good ventilation']
        },
        LOW: {
            level: 2,
            color: '#00cc00',
            icon: '✅',
            label: 'LOW RISK',
            description: 'Generally safe with basic precautions.',
            requirements: ['Dust mask optional', 'Eye protection', 'Basic ventilation']
        },
        MINIMAL: {
            level: 1,
            color: '#00ff00',
            icon: '💚',
            label: 'MINIMAL RISK',
            description: 'Safe for cutting with basic workshop practices.',
            requirements: ['Standard shop safety']
        }
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // HAZARD TYPES
    // ═══════════════════════════════════════════════════════════════════════════
    
    hazardTypes: {
        TOXIC: {
            icon: '☠️',
            name: 'Toxic',
            description: 'Contains poisonous elements that can cause acute or chronic illness'
        },
        RADIOACTIVE: {
            icon: '☢️',
            name: 'Radioactive',
            description: 'Emits ionizing radiation that can cause cancer and genetic damage'
        },
        CARCINOGENIC: {
            icon: '🎗️',
            name: 'Carcinogenic',
            description: 'Known to cause cancer with prolonged exposure'
        },
        FIBROUS: {
            icon: '🫁',
            name: 'Fibrous/Asbestiform',
            description: 'Releases microscopic fibers that damage lung tissue'
        },
        SILICOSIS: {
            icon: '💨',
            name: 'Silicosis Risk',
            description: 'Fine silica dust causes irreversible lung disease'
        },
        HEAVY_METAL: {
            icon: '⚗️',
            name: 'Heavy Metal',
            description: 'Contains lead, mercury, arsenic, or other heavy metals'
        },
        SKIN_IRRITANT: {
            icon: '🖐️',
            name: 'Skin Irritant',
            description: 'Can cause dermatitis, rashes, or chemical burns'
        },
        SOLUBLE: {
            icon: '💧',
            name: 'Water Soluble Toxins',
            description: 'Releases toxic compounds when wet - especially dangerous during wet cutting'
        }
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // DANGEROUS MINERALS DATABASE
    // ═══════════════════════════════════════════════════════════════════════════
    
    dangerousMinerals: {
        // ============ EXTREME DANGER ============
        
        cinnabar: {
            name: 'Cinnabar',
            formula: 'HgS',
            chemicalName: 'Mercury(II) Sulfide',
            hazardLevel: 'EXTREME',
            hazardTypes: ['TOXIC', 'HEAVY_METAL'],
            mercuryContent: '86.2%',
            color: 'Bright red to brownish-red',
            hardness: 2.0,
            specificGravity: 8.1,
            crystalSystem: 'Trigonal',
            description: 'The primary ore of mercury. Extremely toxic - releases mercury vapor when heated or cut.',
            healthEffects: [
                'Mercury poisoning (Mad Hatter disease)',
                'Neurological damage',
                'Kidney failure',
                'Tremors and memory loss',
                'Birth defects if pregnant'
            ],
            cuttingNotes: 'NEVER cut dry. Mercury vapor is invisible and odorless. Even brief exposure can cause permanent neurological damage.',
            safetyGuidelines: [
                'Use full-face respirator with mercury-rated cartridges',
                'Cut only in sealed, negative-pressure environment',
                'Dispose of all slurry as hazardous waste',
                'Monitor air quality continuously',
                'AUTOMATED CUTTING STRONGLY RECOMMENDED'
            ],
            gembotBenefit: 'GemBot eliminates all human exposure to deadly mercury vapor during cutting operations.'
        },
        
        orpiment: {
            name: 'Orpiment',
            formula: 'As₂S₃',
            chemicalName: 'Arsenic Trisulfide',
            hazardLevel: 'EXTREME',
            hazardTypes: ['TOXIC', 'CARCINOGENIC', 'HEAVY_METAL'],
            arsenicContent: '61%',
            color: 'Yellow to orange-yellow',
            hardness: 1.5,
            specificGravity: 3.5,
            crystalSystem: 'Monoclinic',
            description: 'Beautiful golden mineral but extremely toxic. Historically used as a pigment until its dangers were understood.',
            healthEffects: [
                'Arsenic poisoning',
                'Multiple organ failure',
                'Cancer (lung, skin, bladder, kidney)',
                'Peripheral neuropathy',
                'Death from acute exposure'
            ],
            cuttingNotes: 'Dust is highly toxic. Arsenic accumulates in the body and does not naturally excrete.',
            safetyGuidelines: [
                'Full hazmat suit required',
                'Supplied air respirator',
                'All waste is toxic - specialized disposal',
                'No skin contact ever',
                'DO NOT ATTEMPT MANUAL CUTTING'
            ],
            gembotBenefit: 'GemBot processes orpiment specimens without any human exposure to arsenic compounds.'
        },
        
        realgar: {
            name: 'Realgar',
            formula: 'As₄S₄',
            chemicalName: 'Arsenic Sulfide',
            hazardLevel: 'EXTREME',
            hazardTypes: ['TOXIC', 'CARCINOGENIC', 'HEAVY_METAL'],
            arsenicContent: '70%',
            color: 'Deep red to orange-red',
            hardness: 1.5,
            specificGravity: 3.6,
            crystalSystem: 'Monoclinic',
            description: 'Often found with orpiment. Equally deadly due to high arsenic content.',
            healthEffects: [
                'Arsenic poisoning',
                'Liver damage',
                'Cancer',
                'Cardiovascular disease',
                'Neurological damage'
            ],
            cuttingNotes: 'Degrades to powder when exposed to light over time. Dust is extremely hazardous.',
            safetyGuidelines: [
                'Same as orpiment - extreme caution',
                'Store in dark conditions',
                'Supplied air required',
                'Automated processing only'
            ],
            gembotBenefit: 'GemBot enables safe study and preparation of realgar specimens for collectors and researchers.'
        },
        
        torbernite: {
            name: 'Torbernite',
            formula: 'Cu(UO₂)₂(PO₄)₂·8-12H₂O',
            chemicalName: 'Copper Uranyl Phosphate',
            hazardLevel: 'EXTREME',
            hazardTypes: ['RADIOACTIVE', 'CARCINOGENIC', 'TOXIC'],
            uraniumContent: '~50% UO₂',
            color: 'Bright green to dark green',
            hardness: 2.5,
            specificGravity: 3.2,
            crystalSystem: 'Tetragonal',
            description: 'Beautiful green crystal that is highly radioactive and releases radon gas.',
            healthEffects: [
                'Radiation exposure',
                'Lung cancer from radon',
                'Kidney damage from uranium',
                'Bone cancer',
                'Genetic mutations'
            ],
            cuttingNotes: 'Releases radon gas continuously. Radioactive dust is especially dangerous if inhaled.',
            safetyGuidelines: [
                'Radiation monitoring required',
                'Sealed containment',
                'Radon extraction ventilation',
                'Licensed handling only',
                'NEVER COLLECT OR STORE IN HOME'
            ],
            gembotBenefit: 'GemBot can process radioactive minerals in shielded enclosures, protecting humans from radiation exposure.'
        },
        
        autunite: {
            name: 'Autunite',
            formula: 'Ca(UO₂)₂(PO₄)₂·10-12H₂O',
            chemicalName: 'Calcium Uranyl Phosphate',
            hazardLevel: 'EXTREME',
            hazardTypes: ['RADIOACTIVE', 'CARCINOGENIC'],
            uraniumContent: '~48% UO₂',
            color: 'Yellow to yellow-green (fluorescent)',
            hardness: 2.0,
            specificGravity: 3.1,
            crystalSystem: 'Tetragonal',
            description: 'Fluorescent uranium mineral. Beautiful but deadly radioactive.',
            healthEffects: [
                'Same as torbernite',
                'Radiation burns possible',
                'Cumulative radiation damage'
            ],
            cuttingNotes: 'Dehydrates and crumbles over time, releasing radioactive particles.',
            safetyGuidelines: [
                'Keep sealed in radiation-shielded container',
                'Never cut or grind',
                'Radioactive waste disposal required'
            ],
            gembotBenefit: 'Research institutions can use GemBot for safe preparation of radioactive mineral specimens.'
        },
        
        hutchinsonite: {
            name: 'Hutchinsonite',
            formula: '(Tl,Pb)₂As₅S₉',
            chemicalName: 'Thallium Lead Arsenic Sulfide',
            hazardLevel: 'EXTREME',
            hazardTypes: ['TOXIC', 'HEAVY_METAL'],
            toxicElements: 'Thallium, Lead, Arsenic',
            color: 'Deep red',
            hardness: 1.5,
            specificGravity: 4.6,
            crystalSystem: 'Orthorhombic',
            description: 'Contains THREE of the most toxic heavy metals: thallium, lead, and arsenic.',
            healthEffects: [
                'Thallium poisoning (extremely toxic)',
                'Hair loss',
                'Nerve damage',
                'Organ failure',
                'Death from small exposures'
            ],
            cuttingNotes: 'One of the most dangerous minerals to handle. Thallium is absorbed through skin.',
            safetyGuidelines: [
                'Chemical-resistant suit required',
                'Double gloves mandatory',
                'NO amateur handling',
                'Professional toxicology support'
            ],
            gembotBenefit: 'GemBot is the ONLY safe way to prepare specimens of this triple-threat toxic mineral.'
        },
        
        // ============ HIGH HAZARD ============
        
        stibnite: {
            name: 'Stibnite',
            formula: 'Sb₂S₃',
            chemicalName: 'Antimony Sulfide',
            hazardLevel: 'HIGH',
            hazardTypes: ['TOXIC', 'HEAVY_METAL'],
            antimonyContent: '71.7%',
            color: 'Lead-gray to steel-gray',
            hardness: 2.0,
            specificGravity: 4.6,
            crystalSystem: 'Orthorhombic',
            description: 'Primary ore of antimony. Beautiful crystal specimens but toxic.',
            healthEffects: [
                'Antimony poisoning',
                'Respiratory irritation',
                'Cardiac effects',
                'Skin lesions',
                'Eye irritation'
            ],
            cuttingNotes: 'Very soft and brittle. Dust is toxic. Often collected as display specimens only.',
            safetyGuidelines: [
                'N95 or better respirator',
                'Gloves required',
                'Wet cutting only',
                'HEPA filtration'
            ],
            gembotBenefit: 'GemBot can prepare display-quality stibnite specimens without exposing cutters to antimony.'
        },
        
        galena: {
            name: 'Galena',
            formula: 'PbS',
            chemicalName: 'Lead(II) Sulfide',
            hazardLevel: 'HIGH',
            hazardTypes: ['TOXIC', 'HEAVY_METAL'],
            leadContent: '86.6%',
            color: 'Lead-gray with metallic luster',
            hardness: 2.5,
            specificGravity: 7.6,
            crystalSystem: 'Cubic',
            description: 'Primary ore of lead. Beautiful cubic crystals but highly toxic.',
            healthEffects: [
                'Lead poisoning',
                'Neurological damage',
                'Kidney damage',
                'Developmental delays in children',
                'Reproductive harm'
            ],
            cuttingNotes: 'Lead dust is easily absorbed. Accumulates in bones and stays for decades.',
            safetyGuidelines: [
                'HEPA respirator required',
                'Wash hands thoroughly after handling',
                'No eating/drinking in work area',
                'Blood lead testing recommended'
            ],
            gembotBenefit: 'GemBot eliminates lead exposure risk when preparing galena specimens for collectors.'
        },
        
        arsenopyrite: {
            name: 'Arsenopyrite',
            formula: 'FeAsS',
            chemicalName: 'Iron Arsenic Sulfide',
            hazardLevel: 'HIGH',
            hazardTypes: ['TOXIC', 'CARCINOGENIC', 'HEAVY_METAL'],
            arsenicContent: '46%',
            color: 'Silver-white to steel-gray',
            hardness: 5.5,
            specificGravity: 6.1,
            crystalSystem: 'Monoclinic',
            description: 'Common arsenic mineral. Often mistaken for pyrite but much more dangerous.',
            healthEffects: [
                'Arsenic poisoning',
                'Cancer risk',
                'Peripheral neuropathy',
                'Cardiovascular effects'
            ],
            cuttingNotes: 'Releases arsenic when heated or ground. Can look like fool\'s gold.',
            safetyGuidelines: [
                'Proper identification before handling',
                'Full respiratory protection',
                'Wet processing only'
            ],
            gembotBenefit: 'GemBot can distinguish and safely process arsenopyrite without human arsenic exposure.'
        },
        
        chrysotile: {
            name: 'Chrysotile (White Asbestos)',
            formula: 'Mg₃(Si₂O₅)(OH)₄',
            chemicalName: 'Magnesium Silicate Hydroxide',
            hazardLevel: 'HIGH',
            hazardTypes: ['FIBROUS', 'CARCINOGENIC'],
            fiberType: 'Serpentine asbestos',
            color: 'White to pale green',
            hardness: 2.5,
            specificGravity: 2.5,
            crystalSystem: 'Monoclinic',
            description: 'The most common form of asbestos. Causes mesothelioma and asbestosis.',
            healthEffects: [
                'Mesothelioma (deadly cancer)',
                'Asbestosis (lung scarring)',
                'Lung cancer',
                'Pleural plaques',
                'Effects may take 20-50 years to appear'
            ],
            cuttingNotes: 'NEVER cut, grind, or disturb. One fiber can cause cancer decades later.',
            safetyGuidelines: [
                'Licensed asbestos handling only',
                'Full containment required',
                'HEPA filtration',
                'Medical monitoring program'
            ],
            gembotBenefit: 'GemBot in sealed enclosure can process asbestos-containing minerals for research without human exposure.'
        },
        
        // ============ MODERATE RISK ============
        
        malachite: {
            name: 'Malachite',
            formula: 'Cu₂CO₃(OH)₂',
            chemicalName: 'Copper Carbonate Hydroxide',
            hazardLevel: 'MODERATE',
            hazardTypes: ['TOXIC', 'HEAVY_METAL'],
            copperContent: '57.5%',
            color: 'Bright green with banding',
            hardness: 3.5,
            specificGravity: 4.0,
            crystalSystem: 'Monoclinic',
            description: 'Popular decorative stone. Copper dust is toxic but manageable with precautions.',
            healthEffects: [
                'Copper toxicity (if dust inhaled)',
                'Respiratory irritation',
                'Eye irritation',
                'Generally safe when sealed/polished'
            ],
            cuttingNotes: 'Always cut wet. Sealed and polished malachite is safe to handle.',
            safetyGuidelines: [
                'Wet cutting mandatory',
                'Dust mask recommended',
                'Good ventilation',
                'Wash hands after handling raw material'
            ],
            gembotBenefit: 'GemBot makes malachite cutting safer by containing copper dust and maintaining wet cutting.'
        },
        
        azurite: {
            name: 'Azurite',
            formula: 'Cu₃(CO₃)₂(OH)₂',
            chemicalName: 'Copper Carbonate Hydroxide',
            hazardLevel: 'MODERATE',
            hazardTypes: ['TOXIC', 'HEAVY_METAL'],
            copperContent: '55.3%',
            color: 'Deep azure blue',
            hardness: 3.5,
            specificGravity: 3.8,
            crystalSystem: 'Monoclinic',
            description: 'Beautiful blue copper mineral. Similar hazards to malachite.',
            healthEffects: [
                'Copper toxicity from dust',
                'Respiratory irritation',
                'Safe when sealed'
            ],
            cuttingNotes: 'Soft and often unstable. Wet cutting essential.',
            safetyGuidelines: [
                'Same as malachite',
                'Extra care due to softness'
            ],
            gembotBenefit: 'GemBot precisely controls cutting speed for soft azurite while containing copper dust.'
        },
        
        fluorite: {
            name: 'Fluorite',
            formula: 'CaF₂',
            chemicalName: 'Calcium Fluoride',
            hazardLevel: 'MODERATE',
            hazardTypes: ['TOXIC'],
            fluorineContent: '48.7%',
            color: 'All colors (purple, green, blue, yellow, clear)',
            hardness: 4.0,
            specificGravity: 3.2,
            crystalSystem: 'Cubic',
            description: 'Popular mineral with beautiful colors. Fluorine can be released when cut.',
            healthEffects: [
                'Fluorine toxicity (high exposure)',
                'Respiratory irritation',
                'Dental/skeletal fluorosis (chronic exposure)'
            ],
            cuttingNotes: 'Perfect cleavage makes it fragile. Wet cutting controls dust.',
            safetyGuidelines: [
                'Wet cutting required',
                'Dust mask recommended',
                'Good ventilation'
            ],
            gembotBenefit: 'GemBot handles fluorite\'s cleavage planes precisely while controlling fluorine-containing dust.'
        },
        
        // ============ SILICOSIS RISK MINERALS ============
        
        quartz: {
            name: 'Quartz (all varieties)',
            formula: 'SiO₂',
            chemicalName: 'Silicon Dioxide',
            hazardLevel: 'MODERATE',
            hazardTypes: ['SILICOSIS', 'CARCINOGENIC'],
            silicaContent: '100%',
            color: 'Clear, purple (amethyst), pink (rose), yellow (citrine), smoky',
            hardness: 7.0,
            specificGravity: 2.65,
            crystalSystem: 'Trigonal',
            description: 'Most common cutting material. Silica dust causes silicosis - an incurable lung disease.',
            healthEffects: [
                'Silicosis (progressive, incurable lung disease)',
                'Lung cancer (crystalline silica is carcinogenic)',
                'Increased risk of tuberculosis',
                'Autoimmune disorders',
                'Death from respiratory failure'
            ],
            varieties: ['Amethyst', 'Citrine', 'Rose Quartz', 'Smoky Quartz', 'Rock Crystal', 'Prasiolite', 'Chalcedony', 'Agate', 'Jasper', 'Carnelian', 'Onyx'],
            cuttingNotes: 'ALWAYS cut wet. Never dry grind quartz. Dust is invisible but deadly over time.',
            safetyGuidelines: [
                'WET CUTTING MANDATORY',
                'HEPA air filtration',
                'N95+ respirator when any dust present',
                'Regular lung function tests for professional cutters'
            ],
            gembotBenefit: 'GemBot maintains consistent wet cutting and contains all silica dust, preventing silicosis in lapidary workers.'
        },
        
        tigers_eye: {
            name: 'Tiger\'s Eye',
            formula: 'SiO₂ with crocidolite fibers',
            chemicalName: 'Silicified Crocidolite',
            hazardLevel: 'MODERATE',
            hazardTypes: ['SILICOSIS', 'FIBROUS'],
            composition: 'Quartz with altered asbestos',
            color: 'Golden-brown with chatoyancy',
            hardness: 7.0,
            specificGravity: 2.65,
            crystalSystem: 'Trigonal',
            description: 'Beautiful chatoyant stone that was originally asbestos (crocidolite) now replaced by quartz.',
            healthEffects: [
                'Silicosis risk (quartz)',
                'Possible residual asbestos fibers',
                'Combined fiber and silica hazard'
            ],
            cuttingNotes: 'Most tiger\'s eye is fully silicified and safe, but some specimens may retain asbestos fibers.',
            safetyGuidelines: [
                'Wet cutting mandatory',
                'Treat as potential asbestos until verified',
                'Good ventilation'
            ],
            gembotBenefit: 'GemBot safely processes tiger\'s eye specimens of unknown origin with full containment.'
        },
        
        // ============ LOW RISK BUT NOTABLE ============
        
        amazonite: {
            name: 'Amazonite',
            formula: 'KAlSi₃O₈',
            chemicalName: 'Potassium Aluminum Silicate (Lead-colored)',
            hazardLevel: 'LOW',
            hazardTypes: ['HEAVY_METAL'],
            leadContent: 'Trace (causes green color)',
            color: 'Blue-green to green',
            hardness: 6.0,
            specificGravity: 2.6,
            crystalSystem: 'Triclinic',
            description: 'Green feldspar colored by trace lead. Generally safe with basic precautions.',
            healthEffects: [
                'Minimal risk from trace lead',
                'Standard silicate dust precautions'
            ],
            cuttingNotes: 'Wet cutting recommended. Low but present lead content.',
            safetyGuidelines: [
                'Wet cutting recommended',
                'Basic dust control'
            ],
            gembotBenefit: 'GemBot ensures consistent wet cutting and dust control for amazonite.'
        },
        
        labradorite: {
            name: 'Labradorite',
            formula: '(Ca,Na)(Al,Si)₄O₈',
            chemicalName: 'Calcium Sodium Aluminum Silicate',
            hazardLevel: 'LOW',
            hazardTypes: ['SILICOSIS'],
            color: 'Gray with blue-green-gold iridescence',
            hardness: 6.0,
            specificGravity: 2.7,
            crystalSystem: 'Triclinic',
            description: 'Beautiful iridescent feldspar. Standard silicate dust precautions needed.',
            healthEffects: [
                'Standard silicate dust risks',
                'Generally safe with precautions'
            ],
            cuttingNotes: 'Cleavage can make it fragile. Wet cutting recommended.',
            safetyGuidelines: [
                'Wet cutting recommended',
                'Dust mask helpful'
            ],
            gembotBenefit: 'GemBot handles labradorite\'s cleavage planes while controlling silicate dust.'
        }
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // SAFE MINERALS FOR REFERENCE
    // ═══════════════════════════════════════════════════════════════════════════
    
    safeMinerals: {
        corundum: {
            name: 'Corundum (Ruby & Sapphire)',
            formula: 'Al₂O₃',
            chemicalName: 'Aluminum Oxide',
            hazardLevel: 'MINIMAL',
            color: 'All colors (red=ruby, blue=sapphire, other=fancy sapphire)',
            hardness: 9.0,
            specificGravity: 4.0,
            description: 'Second hardest mineral. Aluminum oxide is biologically inert.',
            safetyNotes: 'Standard workshop safety. Dust is not toxic but eye/respiratory protection recommended.'
        },
        
        diamond: {
            name: 'Diamond',
            formula: 'C',
            chemicalName: 'Carbon',
            hazardLevel: 'MINIMAL',
            color: 'Colorless to all colors',
            hardness: 10.0,
            specificGravity: 3.5,
            description: 'Hardest mineral. Pure carbon is biologically inert.',
            safetyNotes: 'Graphite dust from cutting is not harmful. Standard eye protection needed.'
        },
        
        beryl: {
            name: 'Beryl (Emerald, Aquamarine, Morganite)',
            formula: 'Be₃Al₂Si₆O₁₈',
            chemicalName: 'Beryllium Aluminum Cyclosilicate',
            hazardLevel: 'LOW',
            hazardTypes: ['TOXIC'],
            berylliumContent: '~5%',
            color: 'Green (emerald), blue (aquamarine), pink (morganite)',
            hardness: 7.5,
            specificGravity: 2.7,
            description: 'Contains beryllium but tightly bound in crystal structure.',
            safetyNotes: 'Beryllium is toxic but beryl is generally safe. Wet cutting recommended. Don\'t inhale dust.',
            cuttingNotes: 'The beryllium in beryl is not easily released, making it much safer than raw beryllium compounds.'
        },
        
        topaz: {
            name: 'Topaz',
            formula: 'Al₂SiO₄(F,OH)₂',
            chemicalName: 'Aluminum Fluoro-Hydroxyl Silicate',
            hazardLevel: 'LOW',
            color: 'Colorless, blue, yellow, orange, pink',
            hardness: 8.0,
            specificGravity: 3.5,
            description: 'Hard and durable. Contains fluorine but tightly bound.',
            safetyNotes: 'Perfect cleavage requires careful handling. Wet cutting recommended.'
        },
        
        tourmaline: {
            name: 'Tourmaline',
            formula: '(Na,Ca)(Li,Mg,Al,Fe)₃Al₆(BO₃)₃Si₆O₁₈(OH)₄',
            chemicalName: 'Complex Borosilicate',
            hazardLevel: 'MINIMAL',
            color: 'All colors, often multicolored',
            hardness: 7.0,
            specificGravity: 3.1,
            description: 'Complex chemistry but biologically inert in solid form.',
            safetyNotes: 'Standard lapidary precautions. Some iron-rich varieties may cause dust staining.'
        },
        
        garnet: {
            name: 'Garnet',
            formula: 'X₃Y₂(SiO₄)₃',
            chemicalName: 'Silicate (various)',
            hazardLevel: 'MINIMAL',
            color: 'Red, green, orange, purple, pink',
            hardness: 6.5,
            specificGravity: 3.5,
            description: 'Large family of minerals. Generally safe to cut.',
            safetyNotes: 'Standard precautions. No special hazards.'
        },
        
        spinel: {
            name: 'Spinel',
            formula: 'MgAl₂O₄',
            chemicalName: 'Magnesium Aluminum Oxide',
            hazardLevel: 'MINIMAL',
            color: 'All colors, especially red, blue, pink',
            hardness: 8.0,
            specificGravity: 3.6,
            description: 'Durable and safe. Often confused with ruby/sapphire.',
            safetyNotes: 'Very safe to cut. Standard precautions only.'
        },
        
        peridot: {
            name: 'Peridot (Olivine)',
            formula: '(Mg,Fe)₂SiO₄',
            chemicalName: 'Magnesium Iron Silicate',
            hazardLevel: 'MINIMAL',
            color: 'Yellow-green to olive green',
            hardness: 6.5,
            specificGravity: 3.3,
            description: 'Safe and beautiful green gem.',
            safetyNotes: 'Standard precautions. Sensitive to temperature changes.'
        },
        
        zircon: {
            name: 'Zircon',
            formula: 'ZrSiO₄',
            chemicalName: 'Zirconium Silicate',
            hazardLevel: 'LOW',
            color: 'Colorless, blue, green, yellow, brown',
            hardness: 7.5,
            specificGravity: 4.7,
            description: 'May contain trace uranium/thorium but usually insignificant.',
            safetyNotes: 'Some specimens are very slightly radioactive. Generally safe. Heat-treated stones are not radioactive.'
        }
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // GEMBOT BENEFITS SUMMARY
    // ═══════════════════════════════════════════════════════════════════════════
    
    gembotSafetyBenefits: {
        title: '🤖 Why GemBot Saves Lives',
        summary: 'GemBot automated cutting systems protect human health by removing people from hazardous operations.',
        
        benefits: [
            {
                icon: '🫁',
                title: 'Eliminates Silicosis Risk',
                description: 'No human exposure to deadly silica dust. GemBot contains and filters all cutting debris.',
                stats: 'Silicosis affects thousands of lapidary workers annually and is 100% preventable.'
            },
            {
                icon: '☢️',
                title: 'Safe Radioactive Processing',
                description: 'Uranium and thorium-bearing minerals can be processed in shielded GemBot enclosures.',
                stats: 'Radiation exposure during cutting can be reduced to near-zero.'
            },
            {
                icon: '☠️',
                title: 'Handles Toxic Minerals',
                description: 'Mercury, arsenic, lead, and thallium-bearing minerals processed without human contact.',
                stats: 'Heavy metal poisoning is irreversible - prevention is the only cure.'
            },
            {
                icon: '🎗️',
                title: 'Reduces Cancer Risk',
                description: 'Crystalline silica is a Group 1 carcinogen. GemBot eliminates exposure.',
                stats: 'Professional lapidaries have elevated lung cancer rates.'
            },
            {
                icon: '⏰',
                title: 'No Cumulative Exposure',
                description: 'Unlike human cutters, GemBot doesn\'t accumulate toxic substances over years.',
                stats: 'Many occupational diseases take 20-40 years to manifest.'
            },
            {
                icon: '🔬',
                title: 'Enables Safe Research',
                description: 'Researchers can study dangerous minerals without personal risk.',
                stats: 'Museums and universities can safely prepare toxic mineral specimens.'
            }
        ],
        
        callToAction: 'Every stone cut by GemBot is a stone that won\'t harm a human cutter.'
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Initialize the database
     */
    init() {
        console.log('⚠️ Mineral Safety Database initialized');
        this.initialized = true;
        window.MineralSafetyDatabase = this;
        return this;
    },
    
    /**
     * Get mineral by name
     */
    getMineral(name) {
        const searchName = name.toLowerCase().replace(/[^a-z]/g, '');
        
        // Check dangerous minerals
        for (const [key, mineral] of Object.entries(this.dangerousMinerals)) {
            if (key.replace(/_/g, '') === searchName || 
                mineral.name.toLowerCase().replace(/[^a-z]/g, '') === searchName) {
                return { ...mineral, category: 'dangerous' };
            }
        }
        
        // Check safe minerals
        for (const [key, mineral] of Object.entries(this.safeMinerals)) {
            if (key.replace(/_/g, '') === searchName || 
                mineral.name.toLowerCase().replace(/[^a-z]/g, '') === searchName) {
                return { ...mineral, category: 'safe' };
            }
        }
        
        return null;
    },
    
    /**
     * Get all minerals by hazard level
     */
    getMineralsByHazardLevel(level) {
        const results = [];
        for (const mineral of Object.values(this.dangerousMinerals)) {
            if (mineral.hazardLevel === level) {
                results.push(mineral);
            }
        }
        return results;
    },
    
    /**
     * Get all minerals with specific hazard type
     */
    getMineralsByHazardType(type) {
        const results = [];
        for (const mineral of Object.values(this.dangerousMinerals)) {
            if (mineral.hazardTypes && mineral.hazardTypes.includes(type)) {
                results.push(mineral);
            }
        }
        return results;
    },
    
    /**
     * Check if a mineral is safe to cut
     */
    isSafeToCut(mineralName) {
        const mineral = this.getMineral(mineralName);
        if (!mineral) return { safe: null, message: 'Mineral not found in database' };
        
        const hazardLevel = this.hazardLevels[mineral.hazardLevel];
        
        return {
            safe: hazardLevel.level <= 2,
            hazardLevel: mineral.hazardLevel,
            message: hazardLevel.description,
            requirements: hazardLevel.requirements,
            gembotRecommended: hazardLevel.level >= 3
        };
    },
    
    /**
     * Get safety checklist for a mineral
     */
    getSafetyChecklist(mineralName) {
        const mineral = this.getMineral(mineralName);
        if (!mineral) return null;
        
        const hazardLevel = this.hazardLevels[mineral.hazardLevel];
        
        return {
            mineral: mineral.name,
            hazardLevel: mineral.hazardLevel,
            hazardIcon: hazardLevel.icon,
            hazardColor: hazardLevel.color,
            requirements: hazardLevel.requirements,
            specificGuidelines: mineral.safetyGuidelines || mineral.safetyNotes,
            healthEffects: mineral.healthEffects || [],
            gembotBenefit: mineral.gembotBenefit || 'GemBot provides safer cutting through automation and dust containment.',
            automatedRecommended: hazardLevel.level >= 4
        };
    },
    
    /**
     * Render safety info UI
     */
    renderMineralSafetyCard(mineralName) {
        const mineral = this.getMineral(mineralName);
        if (!mineral) return `<div class="safety-card error">Mineral "${mineralName}" not found</div>`;
        
        const hazardLevel = this.hazardLevels[mineral.hazardLevel] || this.hazardLevels.MINIMAL;
        
        return `
            <div class="mineral-safety-card" style="border-color: ${hazardLevel.color}">
                <div class="safety-header" style="background: ${hazardLevel.color}20">
                    <span class="hazard-icon">${hazardLevel.icon}</span>
                    <h3>${mineral.name}</h3>
                    <span class="hazard-badge" style="background: ${hazardLevel.color}">${hazardLevel.label}</span>
                </div>
                
                <div class="safety-content">
                    <div class="formula-section">
                        <strong>Formula:</strong> ${mineral.formula}
                        ${mineral.chemicalName ? `<br><em>${mineral.chemicalName}</em>` : ''}
                    </div>
                    
                    <div class="properties-section">
                        <span><strong>Hardness:</strong> ${mineral.hardness}</span>
                        <span><strong>SG:</strong> ${mineral.specificGravity}</span>
                    </div>
                    
                    <p class="description">${mineral.description}</p>
                    
                    ${mineral.hazardTypes ? `
                        <div class="hazard-types">
                            ${mineral.hazardTypes.map(type => {
                                const hazard = this.hazardTypes[type];
                                return `<span class="hazard-tag" title="${hazard.description}">${hazard.icon} ${hazard.name}</span>`;
                            }).join('')}
                        </div>
                    ` : ''}
                    
                    ${mineral.healthEffects ? `
                        <div class="health-effects">
                            <h4>⚠️ Health Effects</h4>
                            <ul>
                                ${mineral.healthEffects.map(effect => `<li>${effect}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${mineral.safetyGuidelines || mineral.safetyNotes ? `
                        <div class="safety-guidelines">
                            <h4>🛡️ Safety Guidelines</h4>
                            ${Array.isArray(mineral.safetyGuidelines) ? 
                                `<ul>${mineral.safetyGuidelines.map(g => `<li>${g}</li>`).join('')}</ul>` :
                                `<p>${mineral.safetyGuidelines || mineral.safetyNotes}</p>`
                            }
                        </div>
                    ` : ''}
                    
                    ${mineral.gembotBenefit ? `
                        <div class="gembot-benefit">
                            <h4>🤖 GemBot Advantage</h4>
                            <p>${mineral.gembotBenefit}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },
    
    /**
     * Render the GemBot benefits section
     */
    renderGembotBenefits() {
        const benefits = this.gembotSafetyBenefits;
        
        return `
            <div class="gembot-safety-benefits">
                <h2>${benefits.title}</h2>
                <p class="summary">${benefits.summary}</p>
                
                <div class="benefits-grid">
                    ${benefits.benefits.map(benefit => `
                        <div class="benefit-card">
                            <div class="benefit-icon">${benefit.icon}</div>
                            <h3>${benefit.title}</h3>
                            <p>${benefit.description}</p>
                            <div class="benefit-stat">${benefit.stats}</div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="call-to-action">
                    <p>${benefits.callToAction}</p>
                </div>
            </div>
        `;
    },
    
    /**
     * Search minerals
     */
    search(query) {
        const results = [];
        const searchTerms = query.toLowerCase().split(/\s+/);
        
        const searchIn = (mineral, category) => {
            const searchableText = [
                mineral.name,
                mineral.formula,
                mineral.chemicalName,
                mineral.description,
                ...(mineral.healthEffects || []),
                ...(mineral.hazardTypes || [])
            ].join(' ').toLowerCase();
            
            if (searchTerms.every(term => searchableText.includes(term))) {
                results.push({ ...mineral, category });
            }
        };
        
        Object.values(this.dangerousMinerals).forEach(m => searchIn(m, 'dangerous'));
        Object.values(this.safeMinerals).forEach(m => searchIn(m, 'safe'));
        
        return results;
    }
};

// Initialize on load
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => MineralSafetyDatabase.init());
    } else {
        MineralSafetyDatabase.init();
    }
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MineralSafetyDatabase;
}
