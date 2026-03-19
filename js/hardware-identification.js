// RootIB: RB-20260319142113-5683E006
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
 * File: hardware-identification.js
 * Declaration ID: IP-94C3424-MLL28ZV3
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Hardware Identification System
 * Specialized detection and classification for nuts, bolts, screws, and fasteners
 */

class HardwareIdentification {
    constructor() {
        // Hardware categories database
        this.hardwareDB = this.initializeHardwareDB();
        
        // Size patterns (imperial and metric)
        this.sizePatterns = {
            imperial: [
                '1/4-20', '1/4-28', '5/16-18', '5/16-24',
                '3/8-16', '3/8-24', '7/16-14', '7/16-20',
                '1/2-13', '1/2-20', '5/8-11', '5/8-18',
                '3/4-10', '3/4-16', '7/8-9', '1-8'
            ],
            metric: [
                'M3', 'M4', 'M5', 'M6', 'M8', 'M10',
                'M12', 'M14', 'M16', 'M18', 'M20', 'M24'
            ]
        };
        
        // Material types
        this.materials = {
            'stainless steel': { density: 7.9, multiplier: 3.0, symbol: '🔩' },
            'steel': { density: 7.85, multiplier: 1.0, symbol: '⚙️' },
            'brass': { density: 8.4, multiplier: 2.5, symbol: '🟡' },
            'aluminum': { density: 2.7, multiplier: 1.5, symbol: '⚪' },
            'zinc': { density: 7.14, multiplier: 1.2, symbol: '🔹' },
            'copper': { density: 8.96, multiplier: 4.0, symbol: '🟠' },
            'plastic': { density: 1.2, multiplier: 0.3, symbol: '🔷' },
            'titanium': { density: 4.5, multiplier: 10.0, symbol: '💎' }
        };
        
        // Grade specifications
        this.grades = {
            'Grade 2': { strength: 'low', multiplier: 1.0 },
            'Grade 5': { strength: 'medium', multiplier: 1.3 },
            'Grade 8': { strength: 'high', multiplier: 1.8 },
            '304 SS': { strength: 'medium', multiplier: 2.5 },
            '316 SS': { strength: 'high', multiplier: 3.0 },
            'A2': { strength: 'medium', multiplier: 2.2 },
            'A4': { strength: 'high', multiplier: 2.8 }
        };
    }

    /**
     * Initialize comprehensive hardware database
     */
    initializeHardwareDB() {
        return {
            nuts: {
                'hex nut': {
                    description: 'Standard hexagonal nut',
                    commonSizes: ['1/4-20', '5/16-18', '3/8-16', '1/2-13', 'M6', 'M8', 'M10'],
                    avgWeightPerPiece: 0.02, // ounces
                    typicalLotSize: 100,
                    detectKeywords: ['hex', 'nut', 'hexagonal']
                },
                'lock nut': {
                    description: 'Self-locking nut with nylon insert',
                    commonSizes: ['1/4-20', '5/16-18', '3/8-16', '1/2-13', 'M6', 'M8', 'M10'],
                    avgWeightPerPiece: 0.025,
                    typicalLotSize: 100,
                    detectKeywords: ['lock', 'nylon', 'nylock', 'stop']
                },
                'wing nut': {
                    description: 'Hand-tightenable nut with wings',
                    commonSizes: ['1/4-20', '5/16-18', '3/8-16'],
                    avgWeightPerPiece: 0.03,
                    typicalLotSize: 50,
                    detectKeywords: ['wing', 'butterfly']
                },
                'cap nut': {
                    description: 'Acorn or dome nut',
                    commonSizes: ['1/4-20', '5/16-18', '3/8-16'],
                    avgWeightPerPiece: 0.028,
                    typicalLotSize: 100,
                    detectKeywords: ['cap', 'acorn', 'dome']
                },
                'square nut': {
                    description: 'Four-sided nut',
                    commonSizes: ['1/4-20', '5/16-18', '3/8-16', '1/2-13'],
                    avgWeightPerPiece: 0.022,
                    typicalLotSize: 100,
                    detectKeywords: ['square']
                },
                'flange nut': {
                    description: 'Nut with integrated washer flange',
                    commonSizes: ['M6', 'M8', 'M10', 'M12'],
                    avgWeightPerPiece: 0.035,
                    typicalLotSize: 100,
                    detectKeywords: ['flange', 'serrated']
                }
            },
            
            bolts: {
                'hex bolt': {
                    description: 'Hexagonal head bolt',
                    commonSizes: ['1/4-20', '5/16-18', '3/8-16', '1/2-13', 'M6', 'M8', 'M10'],
                    avgWeightPerPiece: 0.15, // 1 inch length
                    typicalLotSize: 100,
                    detectKeywords: ['hex', 'bolt', 'cap screw']
                },
                'carriage bolt': {
                    description: 'Round head bolt with square neck',
                    commonSizes: ['1/4-20', '5/16-18', '3/8-16', '1/2-13'],
                    avgWeightPerPiece: 0.18,
                    typicalLotSize: 100,
                    detectKeywords: ['carriage', 'coach']
                },
                'lag bolt': {
                    description: 'Heavy-duty wood bolt',
                    commonSizes: ['1/4', '5/16', '3/8', '1/2', '5/8'],
                    avgWeightPerPiece: 0.25,
                    typicalLotSize: 50,
                    detectKeywords: ['lag', 'lag screw']
                },
                'eye bolt': {
                    description: 'Bolt with looped head',
                    commonSizes: ['1/4', '5/16', '3/8', '1/2'],
                    avgWeightPerPiece: 0.35,
                    typicalLotSize: 50,
                    detectKeywords: ['eye', 'hook']
                },
                'u-bolt': {
                    description: 'U-shaped bolt',
                    commonSizes: ['1/4', '5/16', '3/8', '1/2'],
                    avgWeightPerPiece: 0.40,
                    typicalLotSize: 50,
                    detectKeywords: ['u-bolt', 'u bolt']
                }
            },
            
            screws: {
                'wood screw': {
                    description: 'Tapered screw for wood',
                    commonSizes: ['#6', '#8', '#10', '#12'],
                    avgWeightPerPiece: 0.05,
                    typicalLotSize: 100,
                    detectKeywords: ['wood', 'deck']
                },
                'machine screw': {
                    description: 'Uniform diameter screw',
                    commonSizes: ['4-40', '6-32', '8-32', '10-24', '10-32'],
                    avgWeightPerPiece: 0.04,
                    typicalLotSize: 100,
                    detectKeywords: ['machine', 'pan head', 'flat head']
                },
                'sheet metal screw': {
                    description: 'Self-tapping screw',
                    commonSizes: ['#6', '#8', '#10'],
                    avgWeightPerPiece: 0.045,
                    typicalLotSize: 100,
                    detectKeywords: ['sheet metal', 'self-tapping', 'tek']
                },
                'drywall screw': {
                    description: 'Phillips drive screw for drywall',
                    commonSizes: ['#6 x 1-1/4"', '#6 x 1-5/8"', '#6 x 2"'],
                    avgWeightPerPiece: 0.055,
                    typicalLotSize: 100,
                    detectKeywords: ['drywall', 'sheetrock']
                },
                'set screw': {
                    description: 'Headless screw for securing',
                    commonSizes: ['1/4-20', '5/16-18', '3/8-16', 'M6', 'M8'],
                    avgWeightPerPiece: 0.03,
                    typicalLotSize: 100,
                    detectKeywords: ['set screw', 'grub screw']
                }
            },
            
            washers: {
                'flat washer': {
                    description: 'Standard flat washer',
                    commonSizes: ['#6', '#8', '#10', '1/4', '5/16', '3/8', '1/2'],
                    avgWeightPerPiece: 0.01,
                    typicalLotSize: 100,
                    detectKeywords: ['flat', 'plain washer']
                },
                'lock washer': {
                    description: 'Split ring washer',
                    commonSizes: ['#6', '#8', '#10', '1/4', '5/16', '3/8', '1/2'],
                    avgWeightPerPiece: 0.008,
                    typicalLotSize: 100,
                    detectKeywords: ['lock', 'split', 'spring']
                },
                'fender washer': {
                    description: 'Large OD washer',
                    commonSizes: ['1/4', '5/16', '3/8', '1/2'],
                    avgWeightPerPiece: 0.015,
                    typicalLotSize: 100,
                    detectKeywords: ['fender', 'large']
                },
                'star washer': {
                    description: 'Toothed lock washer',
                    commonSizes: ['#6', '#8', '#10', '1/4', '5/16', '3/8'],
                    avgWeightPerPiece: 0.009,
                    typicalLotSize: 100,
                    detectKeywords: ['star', 'tooth', 'external']
                }
            },
            
            anchors: {
                'concrete anchor': {
                    description: 'Expansion anchor for masonry',
                    commonSizes: ['1/4', '5/16', '3/8', '1/2'],
                    avgWeightPerPiece: 0.20,
                    typicalLotSize: 50,
                    detectKeywords: ['concrete', 'wedge', 'sleeve']
                },
                'toggle bolt': {
                    description: 'Hollow wall anchor',
                    commonSizes: ['1/8', '3/16', '1/4'],
                    avgWeightPerPiece: 0.12,
                    typicalLotSize: 50,
                    detectKeywords: ['toggle', 'molly']
                },
                'wall anchor': {
                    description: 'Plastic expansion anchor',
                    commonSizes: ['#6', '#8', '#10'],
                    avgWeightPerPiece: 0.05,
                    typicalLotSize: 100,
                    detectKeywords: ['wall', 'plastic anchor', 'ribbed']
                }
            }
        };
    }

    /**
     * Identify hardware from image or description
     */
    identifyHardware(input) {
        const text = (input.description || input.text || '').toLowerCase();
        const results = [];

        // Search through all categories
        for (const [category, items] of Object.entries(this.hardwareDB)) {
            for (const [type, data] of Object.entries(items)) {
                const keywords = data.detectKeywords || [];
                const matchScore = this.calculateMatchScore(text, keywords);
                
                if (matchScore > 0) {
                    results.push({
                        category,
                        type,
                        matchScore,
                        data,
                        confidence: matchScore > 0.7 ? 'high' : matchScore > 0.4 ? 'medium' : 'low'
                    });
                }
            }
        }

        // Sort by match score
        results.sort((a, b) => b.matchScore - a.matchScore);

        return results.length > 0 ? results[0] : null;
    }

    /**
     * Calculate match score between text and keywords
     */
    calculateMatchScore(text, keywords) {
        let matches = 0;
        for (const keyword of keywords) {
            if (text.includes(keyword)) {
                matches++;
            }
        }
        return matches / keywords.length;
    }

    /**
     * Extract size from text
     */
    extractSize(text) {
        // Try imperial sizes
        for (const size of this.sizePatterns.imperial) {
            if (text.includes(size)) {
                return { size, system: 'imperial' };
            }
        }
        
        // Try metric sizes
        for (const size of this.sizePatterns.metric) {
            const pattern = new RegExp(`\\b${size}\\b`, 'i');
            if (pattern.test(text)) {
                return { size, system: 'metric' };
            }
        }
        
        return null;
    }

    /**
     * Extract material from text
     */
    extractMaterial(text) {
        const lowerText = text.toLowerCase();
        
        for (const [material, props] of Object.entries(this.materials)) {
            if (lowerText.includes(material)) {
                return { material, ...props };
            }
        }
        
        // Default to steel if not specified
        return { material: 'steel', ...this.materials.steel };
    }

    /**
     * Extract grade/specification
     */
    extractGrade(text) {
        const lowerText = text.toLowerCase();
        
        for (const [grade, props] of Object.entries(this.grades)) {
            if (lowerText.includes(grade.toLowerCase())) {
                return { grade, ...props };
            }
        }
        
        return null;
    }

    /**
     * Estimate quantity from image or container
     */
    estimateQuantity(params) {
        const {
            containerType, // 'pile', 'bin', 'bag', 'box', 'pallet'
            weight,        // total weight in pounds
            pieceWeight,   // weight per piece in ounces
            volume,        // container volume estimation
            density        // packing density (0-1)
        } = params;

        // Weight-based estimation
        if (weight && pieceWeight) {
            const totalOunces = weight * 16;
            const quantity = Math.floor(totalOunces / pieceWeight);
            return {
                quantity,
                method: 'weight',
                confidence: 'high'
            };
        }

        // Volume-based estimation
        if (volume && density) {
            // Approximate quantities for common containers
            const containerEstimates = {
                'pile': volume * 200 * density,
                'bin': volume * 300 * density,
                'bag': volume * 250 * density,
                'box': volume * 280 * density,
                'pallet': volume * 500 * density
            };
            
            const quantity = Math.floor(containerEstimates[containerType] || volume * 200);
            return {
                quantity,
                method: 'volume',
                confidence: 'medium'
            };
        }

        // Visual estimation (rough)
        const visualEstimates = {
            'handful': 25,
            'small pile': 50,
            'medium pile': 150,
            'large pile': 500,
            'small bin': 200,
            'medium bin': 1000,
            'large bin': 5000,
            'bag': 100,
            'box': 500,
            'bucket': 1500,
            'pallet': 10000
        };

        return {
            quantity: visualEstimates[containerType] || 100,
            method: 'visual-estimate',
            confidence: 'low'
        };
    }

    /**
     * Complete hardware analysis
     */
    analyzeHardware(input) {
        const identification = this.identifyHardware(input);
        
        if (!identification) {
            return {
                success: false,
                message: 'Unable to identify hardware type'
            };
        }

        const size = this.extractSize(input.description || input.text || '');
        const material = this.extractMaterial(input.description || input.text || '');
        const grade = this.extractGrade(input.description || input.text || '');
        
        const quantity = input.quantity || this.estimateQuantity({
            containerType: input.containerType,
            weight: input.weight,
            pieceWeight: identification.data.avgWeightPerPiece,
            volume: input.volume,
            density: input.density || 0.6
        });

        return {
            success: true,
            category: identification.category,
            type: identification.type,
            description: identification.data.description,
            size: size?.size || 'standard',
            sizeSystem: size?.system || 'unknown',
            material: material.material,
            materialSymbol: material.symbol,
            grade: grade?.grade || 'standard',
            quantity: quantity.quantity || quantity,
            quantityMethod: quantity.method,
            confidence: identification.confidence,
            avgWeightPerPiece: identification.data.avgWeightPerPiece,
            typicalLotSize: identification.data.typicalLotSize,
            commonSizes: identification.data.commonSizes,
            searchKeywords: this.buildSearchKeywords({
                size: size?.size,
                type: identification.type,
                material: material.material,
                grade: grade?.grade
            })
        };
    }

    /**
     * Build search keywords for pricing lookup
     */
    buildSearchKeywords(params) {
        const { size, type, material, grade } = params;
        const parts = [size, type, material, grade].filter(Boolean);
        return parts.join(' ');
    }

    /**
     * Analyze bulk material (aluminum, copper, etc.)
     */
    analyzeMaterial(input) {
        const material = this.extractMaterial(input.description || input.text || '');
        const weight = input.weight || 0;
        
        return {
            success: true,
            material: material.material,
            materialSymbol: material.symbol,
            density: material.density,
            weight: weight,
            form: input.form || 'scrap',
            estimatedValue: weight * material.multiplier,
            searchKeywords: `${material.material} ${input.form || 'scrap'} metal`
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HardwareIdentification;
}
