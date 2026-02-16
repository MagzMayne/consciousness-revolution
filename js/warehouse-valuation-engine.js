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
 * File: warehouse-valuation-engine.js
 * Declaration ID: IP-48771A61-MLL28ZVD
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Warehouse Valuation Engine
 * Auto-values electronics based on type, condition, age, and market data
 */

class WarehouseValuationEngine {
    constructor() {
        this.valuationDatabase = this.initValuationDB();
        this.conditionMultipliers = {
            'excellent': 0.9,
            'good': 0.7,
            'fair': 0.5,
            'poor': 0.3,
            'for-parts': 0.1,
            'unknown': 0.5,
            'new': 1.0
        };
        
        this.ageDepreciationRate = 0.15; // 15% per year
        
        // Initialize eBay pricing integration if available
        this.ebayPricing = typeof EbayPricingAPI !== 'undefined' ? new EbayPricingAPI() : null;
        
        // Initialize hardware identification if available
        this.hardwareIdentifier = typeof HardwareIdentification !== 'undefined' ? new HardwareIdentification() : null;
    }

    /**
     * Initialize valuation database with common electronics
     */
    initValuationDB() {
        return {
            // Desktop Computers
            computer: {
                'Dell OptiPlex': { base: 250, series: {
                    '3020': 150, '7020': 200, '9020': 250, '3050': 300, '7050': 350
                }},
                'HP EliteDesk': { base: 250, series: {
                    '800 G1': 200, '800 G2': 250, '800 G3': 300, '800 G4': 400
                }},
                'Lenovo ThinkCentre': { base: 200, series: {
                    'M73': 150, 'M83': 180, 'M93': 220, 'M720': 350
                }},
                'Apple iMac': { base: 500, series: {
                    '21.5"': 400, '27"': 600, 'Pro': 1200
                }},
                'Custom Gaming PC': { base: 800 },
                'Workstation': { base: 1000 },
                'Generic Desktop': { base: 100 }
            },

            // Laptops
            laptop: {
                'Dell Latitude': { base: 300, series: {
                    'E5440': 200, 'E7440': 250, '5490': 400, '7490': 500
                }},
                'HP EliteBook': { base: 350, series: {
                    '820': 300, '840': 350, '850': 400
                }},
                'Lenovo ThinkPad': { base: 350, series: {
                    'T440': 250, 'T450': 300, 'T480': 450, 'X1 Carbon': 600
                }},
                'MacBook Pro': { base: 800, series: {
                    '13"': 700, '15"': 1000, '16"': 1500
                }},
                'MacBook Air': { base: 600 },
                'Gaming Laptop': { base: 700 },
                'Chromebook': { base: 150 },
                'Generic Laptop': { base: 150 }
            },

            // Printers
            printer: {
                'HP LaserJet': { base: 200, series: {
                    'P2055': 100, 'M401': 150, 'M402': 180, 'M506': 250, 'M607': 300
                }},
                'HP OfficeJet': { base: 100, series: {
                    'Pro 8600': 80, 'Pro 8710': 100, 'Pro 9015': 150
                }},
                'Canon ImageClass': { base: 180, series: {
                    'MF232w': 120, 'MF445dw': 200
                }},
                'Epson WorkForce': { base: 150 },
                'Brother HL-Series': { base: 120, series: {
                    'HL-L2350DW': 100, 'HL-L2395DW': 150
                }},
                'Multifunction Printer': { base: 150 },
                'Generic Inkjet': { base: 30 },
                'Generic Laser': { base: 80 }
            },

            // Monitors
            monitor: {
                'Dell UltraSharp': { base: 200, series: {
                    '24"': 150, '27"': 200, '32"': 300, '4K': 400
                }},
                'HP EliteDisplay': { base: 180, series: {
                    '24"': 140, '27"': 190
                }},
                'LG UltraFine': { base: 250, series: {
                    '4K': 350, '5K': 500
                }},
                'Samsung': { base: 150, series: {
                    '24"': 120, '27"': 160, '32"': 220, 'Curved': 300
                }},
                'Generic Monitor': { base: 50 }
            },

            // Servers
            server: {
                'Dell PowerEdge': { base: 800, series: {
                    'R210': 300, 'R410': 400, 'R610': 500, 'R710': 600, 'R720': 800
                }},
                'HP ProLiant': { base: 750, series: {
                    'DL360': 600, 'DL380': 800, 'ML350': 700
                }},
                'Generic Server': { base: 400 }
            },

            // Tablets
            tablet: {
                'iPad': { base: 300, series: {
                    'Air': 350, 'Pro 11"': 500, 'Pro 12.9"': 700
                }},
                'Microsoft Surface': { base: 400, series: {
                    'Go': 300, 'Pro': 500
                }},
                'Generic Android': { base: 100 }
            },

            // Networking Equipment
            network: {
                'Cisco Router': { base: 200 },
                'Cisco Switch': { base: 300 },
                'Ubiquiti': { base: 150 },
                'Generic Router': { base: 30 },
                'Generic Switch': { base: 50 }
            },

            // Other Electronics
            electronics: {
                'Scanner': { base: 80 },
                'External Drive': { base: 40 },
                'UPS': { base: 100 },
                'Graphics Card': { base: 150 },
                'RAM Module': { base: 30 },
                'SSD': { base: 50 },
                'HDD': { base: 25 },
                'Docking Station': { base: 60 },
                'Generic Component': { base: 20 }
            }
        };
    }

    /**
     * Estimate value of an item
     */
    estimateValue(itemData) {
        const {
            category = 'electronics',
            type = 'generic',
            manufacturer = '',
            model = '',
            name = '',
            condition = 'unknown',
            year = null,
            specs = {}
        } = itemData;

        let baseValue = 0;

        // Get base value from database
        if (this.valuationDatabase[category]) {
            const categoryDB = this.valuationDatabase[category];
            
            // Try to find specific manufacturer/model from name, manufacturer, or type
            const searchTerms = [name, manufacturer, type, model].filter(Boolean).join(' ').toLowerCase();
            
            const manufacturerKey = Object.keys(categoryDB).find(key => 
                searchTerms.includes(key.toLowerCase())
            );

            if (manufacturerKey) {
                const manufacturerData = categoryDB[manufacturerKey];
                baseValue = manufacturerData.base || 100;

                // Check for specific series/model
                if (manufacturerData.series) {
                    const seriesKey = Object.keys(manufacturerData.series).find(key =>
                        searchTerms.includes(key.toLowerCase())
                    );
                    if (seriesKey) {
                        baseValue = manufacturerData.series[seriesKey];
                    }
                }
            } else {
                // Use generic value for category
                const genericKey = Object.keys(categoryDB).find(key => 
                    key.toLowerCase().includes('generic')
                );
                if (genericKey) {
                    baseValue = categoryDB[genericKey].base || 50;
                } else {
                    baseValue = 100; // Fallback
                }
            }
        } else {
            baseValue = 50; // Default fallback
        }

        // Apply condition multiplier
        const conditionMultiplier = this.conditionMultipliers[condition] || 0.5;
        let estimatedValue = baseValue * conditionMultiplier;

        // Apply age depreciation
        if (year) {
            const currentYear = new Date().getFullYear();
            const age = currentYear - year;
            const depreciationFactor = Math.pow(1 - this.ageDepreciationRate, age);
            estimatedValue *= Math.max(0.1, depreciationFactor); // Minimum 10% of value
        }

        // Apply spec bonuses
        estimatedValue = this.applySpecBonuses(estimatedValue, category, specs);

        // Round to nearest dollar and ensure minimum value
        return Math.max(10, Math.round(estimatedValue));
    }

    /**
     * Apply bonuses based on specifications
     */
    applySpecBonuses(baseValue, category, specs) {
        let value = baseValue;

        if (category === 'computer' || category === 'laptop') {
            // RAM bonus
            if (specs.ram) {
                const ramGB = parseInt(specs.ram);
                if (ramGB >= 32) value *= 1.5;
                else if (ramGB >= 16) value *= 1.3;
                else if (ramGB >= 8) value *= 1.1;
            }

            // Storage bonus
            if (specs.storage) {
                if (specs.storage.toLowerCase().includes('ssd')) {
                    const storageGB = parseInt(specs.storage);
                    if (storageGB >= 1000) value *= 1.3;
                    else if (storageGB >= 500) value *= 1.2;
                    else if (storageGB >= 256) value *= 1.1;
                }
            }

            // CPU bonus
            if (specs.cpu) {
                const cpu = specs.cpu.toLowerCase();
                if (cpu.includes('i9') || cpu.includes('ryzen 9')) value *= 1.5;
                else if (cpu.includes('i7') || cpu.includes('ryzen 7')) value *= 1.3;
                else if (cpu.includes('i5') || cpu.includes('ryzen 5')) value *= 1.1;
            }

            // GPU bonus
            if (specs.gpu && specs.gpu !== 'integrated') {
                value *= 1.3;
            }
        }

        return value;
    }

    /**
     * Get market price estimate (simulated API call)
     */
    async getMarketPrice(itemData) {
        // In a real implementation, this would call eBay API or similar
        // For now, we'll simulate it
        const baseEstimate = this.estimateValue(itemData);
        
        // Simulate market variance (±20%)
        const variance = 0.2;
        const marketLow = Math.round(baseEstimate * (1 - variance));
        const marketHigh = Math.round(baseEstimate * (1 + variance));
        const marketAvg = Math.round((marketLow + marketHigh) / 2);

        return {
            estimated: baseEstimate,
            marketLow,
            marketHigh,
            marketAvg,
            confidence: this.calculateConfidence(itemData),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Calculate confidence level of valuation
     */
    calculateConfidence(itemData) {
        let confidence = 0.5; // Base confidence

        // Higher confidence if we have more information
        if (itemData.manufacturer) confidence += 0.1;
        if (itemData.model) confidence += 0.1;
        if (itemData.year) confidence += 0.1;
        if (itemData.condition !== 'unknown') confidence += 0.1;
        if (itemData.specs && Object.keys(itemData.specs).length > 0) confidence += 0.1;

        return Math.min(1.0, confidence);
    }

    /**
     * Estimate total pallet value
     */
    estimatePalletValue(items) {
        const totalValue = items.reduce((sum, item) => {
            const itemValue = this.estimateValue(item);
            return sum + (itemValue * (item.quantity || 1));
        }, 0);

        return {
            totalValue: Math.round(totalValue),
            itemCount: items.length,
            averageItemValue: Math.round(totalValue / items.length),
            breakdown: items.map(item => ({
                name: item.name || item.type,
                quantity: item.quantity || 1,
                unitValue: this.estimateValue(item),
                totalValue: this.estimateValue(item) * (item.quantity || 1)
            }))
        };
    }

    /**
     * Suggest pricing strategy
     */
    suggestPricing(itemData) {
        const valuation = this.estimateValue(itemData);
        
        return {
            quickSale: Math.round(valuation * 0.7), // 30% discount for quick sale
            retail: Math.round(valuation * 1.2), // 20% markup for retail
            wholesale: Math.round(valuation * 0.6), // 40% discount for wholesale
            scrap: Math.round(valuation * 0.1), // 90% discount for parts/scrap
            recommended: valuation
        };
    }

    /**
     * Get valuation by barcode/serial (simulated lookup)
     */
    async lookupByIdentifier(identifier) {
        // In a real implementation, this would lookup from external APIs
        // For now, return null indicating no match found
        console.log(`Looking up identifier: ${identifier}`);
        
        // Simulated delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return null; // No match found (would return item data if found)
    }

    /**
     * Analyze condition from image (AI-powered)
     */
    analyzeConditionFromImage(imageData) {
        // This would integrate with TensorFlow.js model
        // For now, return a simulated result
        return {
            condition: 'good',
            confidence: 0.75,
            details: {
                scratches: 'minimal',
                dents: 'none',
                discoloration: 'slight',
                functionalityIndicator: 'appears functional'
            }
        };
    }

    /**
     * Value hardware items (nuts, bolts, screws, etc.) with eBay pricing
     */
    async valueHardware(hardwareData) {
        const {
            category,      // 'nuts', 'bolts', 'screws', etc.
            type,          // specific type
            size,          // '1/4-20', 'M6', etc.
            material,      // 'stainless steel', 'brass', etc.
            grade,         // 'Grade 8', '304 SS', etc.
            quantity,      // number of pieces
            condition = 'new',
            containerType  // 'pile', 'bin', 'box', etc.
        } = hardwareData;

        // Build search keywords for eBay
        const searchKeywords = [size, type, material, grade]
            .filter(Boolean)
            .join(' ');

        let pricing = null;
        let useEbayData = false;

        // Try to get live eBay pricing
        if (this.ebayPricing && searchKeywords) {
            try {
                pricing = await this.ebayPricing.getHardwarePrice({
                    type, size, material, quantity, grade
                });
                useEbayData = true;
                console.log('✅ Using live eBay pricing:', pricing);
            } catch (error) {
                console.warn('Failed to get eBay pricing, using fallback:', error);
            }
        }

        // Calculate valuation
        let unitPrice = 0;
        let totalValue = 0;
        let confidence = 'medium';

        if (useEbayData && pricing) {
            // Use eBay data
            unitPrice = pricing.perPiecePrice || (pricing.prices.recommended / 100);
            totalValue = unitPrice * quantity;
            confidence = pricing.confidence;
        } else {
            // Use fallback pricing
            const fallbackPrices = {
                'nuts': { base: 0.10, stainless: 0.18, brass: 0.25 },
                'bolts': { base: 0.15, stainless: 0.25, brass: 0.35 },
                'screws': { base: 0.08, stainless: 0.15, brass: 0.22 },
                'washers': { base: 0.05, stainless: 0.10, brass: 0.15 },
                'anchors': { base: 0.20, stainless: 0.35, brass: 0.50 }
            };

            const categoryPrices = fallbackPrices[category] || fallbackPrices['bolts'];
            const materialKey = material?.toLowerCase().includes('stainless') ? 'stainless' :
                              material?.toLowerCase().includes('brass') ? 'brass' : 'base';
            
            unitPrice = categoryPrices[materialKey] || categoryPrices.base;
            
            // Apply grade multiplier
            if (grade?.toLowerCase().includes('grade 8')) unitPrice *= 1.5;
            if (grade?.toLowerCase().includes('316')) unitPrice *= 1.3;
            
            totalValue = unitPrice * quantity;
            confidence = 'estimated';
        }

        return {
            category,
            type,
            size,
            material,
            grade,
            quantity,
            condition,
            unitPrice: Math.round(unitPrice * 100) / 100, // Round to 2 decimals
            totalValue: Math.round(totalValue * 100) / 100,
            searchKeywords,
            pricingSource: useEbayData ? 'ebay-live' : 'fallback-database',
            confidence,
            ebayData: pricing,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Value bulk material (aluminum, copper, steel, etc.) with eBay pricing
     */
    async valueMaterial(materialData) {
        const {
            material,      // 'aluminum', 'copper', 'brass', 'steel'
            weight,        // weight in pounds
            form = 'scrap', // 'scrap', 'sheet', 'bar', 'ingot'
            purity,        // 0-100%, for metals like aluminum (6061, 7075)
            condition = 'used'
        } = materialData;

        let pricing = null;
        let useEbayData = false;

        // Try to get live eBay pricing
        if (this.ebayPricing) {
            try {
                pricing = await this.ebayPricing.getMaterialPrice({
                    material, weight, form
                });
                useEbayData = true;
                console.log('✅ Using live eBay material pricing:', pricing);
            } catch (error) {
                console.warn('Failed to get eBay pricing for material, using fallback:', error);
            }
        }

        // Calculate valuation
        let pricePerPound = 0;
        let totalValue = 0;
        let confidence = 'medium';

        if (useEbayData && pricing) {
            // Use eBay data
            pricePerPound = pricing.perPoundPrice || pricing.prices.recommended;
            totalValue = pricePerPound * weight;
            confidence = pricing.confidence;
        } else {
            // Fallback commodity pricing (approximate current market rates)
            const commodityPrices = {
                'aluminum': { scrap: 0.85, sheet: 2.50, bar: 3.00, ingot: 1.20 },
                'copper': { scrap: 3.25, sheet: 6.50, bar: 7.00, ingot: 4.00 },
                'brass': { scrap: 2.15, sheet: 4.50, bar: 5.00, ingot: 2.80 },
                'stainless steel': { scrap: 0.50, sheet: 3.00, bar: 3.50, ingot: 1.00 },
                'steel': { scrap: 0.10, sheet: 0.80, bar: 1.00, ingot: 0.30 },
                'lead': { scrap: 0.45, ingot: 0.90 },
                'zinc': { scrap: 0.80, ingot: 1.50 },
                'nickel': { scrap: 4.00, ingot: 8.00 }
            };

            const materialPrices = commodityPrices[material?.toLowerCase()] || commodityPrices['steel'];
            pricePerPound = materialPrices[form] || materialPrices['scrap'];
            
            // Apply purity multiplier if specified
            if (purity) {
                pricePerPound *= (purity / 100);
            }
            
            totalValue = pricePerPound * weight;
            confidence = 'estimated';
        }

        return {
            material,
            weight,
            form,
            purity,
            condition,
            pricePerPound: Math.round(pricePerPound * 100) / 100,
            totalValue: Math.round(totalValue * 100) / 100,
            pricingSource: useEbayData ? 'ebay-live' : 'commodity-rates',
            confidence,
            ebayData: pricing,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Analyze and value mixed hardware lot
     */
    async valueMixedLot(items) {
        const valuations = [];
        let totalValue = 0;

        for (const item of items) {
            let valuation;
            
            if (item.category === 'material' || item.form) {
                // Bulk material
                valuation = await this.valueMaterial(item);
            } else if (item.category && ['nuts', 'bolts', 'screws', 'washers', 'anchors'].includes(item.category)) {
                // Hardware
                valuation = await this.valueHardware(item);
            } else {
                // Regular electronics
                valuation = {
                    ...item,
                    totalValue: this.estimateValue(item) * (item.quantity || 1),
                    pricingSource: 'electronics-database'
                };
            }

            valuations.push(valuation);
            totalValue += valuation.totalValue || 0;
        }

        return {
            items: valuations,
            totalValue: Math.round(totalValue * 100) / 100,
            itemCount: items.length,
            averageValue: Math.round((totalValue / items.length) * 100) / 100,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Smart identification and valuation from description
     */
    async smartValue(description, options = {}) {
        // Try to identify what type of item this is
        if (this.hardwareIdentifier) {
            const identification = this.hardwareIdentifier.identifyHardware({ 
                description, 
                ...options 
            });

            if (identification && identification.success) {
                // It's hardware
                return await this.valueHardware({
                    ...identification,
                    ...options
                });
            }

            // Check if it's bulk material
            const materialAnalysis = this.hardwareIdentifier.analyzeMaterial({ 
                description, 
                ...options 
            });

            if (materialAnalysis && materialAnalysis.success) {
                return await this.valueMaterial({
                    ...materialAnalysis,
                    ...options
                });
            }
        }

        // Fall back to regular electronics valuation
        return this.estimateValue({ 
            name: description, 
            ...options 
        });
    }
}

// Create global instance
const valuationEngine = new WarehouseValuationEngine();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WarehouseValuationEngine;
}
