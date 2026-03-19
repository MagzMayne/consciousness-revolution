// RootIB: RB-20260319142113-C8144A64
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
 * File: ebay-pricing-api.js
 * Declaration ID: IP-32E5C344-MLL28ZV2
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * eBay Pricing API Integration
 * Fetches real-time pricing data from eBay for inventory valuation
 */

class EbayPricingAPI {
    constructor() {
        // eBay Finding API endpoint (using public API)
        this.apiEndpoint = 'https://svcs.ebay.com/services/search/FindingService/v1';
        
        // Cache for pricing data (24 hour expiry)
        this.priceCache = new Map();
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        
        // Rate limiting
        this.lastRequestTime = 0;
        this.minRequestInterval = 1000; // 1 second between requests
        
        // API configuration
        this.config = {
            appId: 'BarbrickD-Inventor-PRD-2e9e8c8db-e4c5d0a9', // Example App ID (replace with real one)
            globalId: 'EBAY-US',
            sortOrder: 'EndTimeSoonest',
            maxResults: 20
        };
    }

    /**
     * Get pricing data for an item
     * @param {string} keywords - Search keywords (e.g., "1/4-20 hex bolt stainless steel")
     * @param {object} options - Additional search options
     * @returns {Promise<object>} Pricing data with min, max, average, recent sales
     */
    async getPricing(keywords, options = {}) {
        // Check cache first
        const cacheKey = this.getCacheKey(keywords, options);
        const cached = this.getCached(cacheKey);
        if (cached) {
            console.log(`📦 Using cached pricing for: ${keywords}`);
            return cached;
        }

        // Rate limiting
        await this.rateLimit();

        try {
            const pricingData = await this.fetchFromEbay(keywords, options);
            
            // Cache the result
            this.setCache(cacheKey, pricingData);
            
            return pricingData;
        } catch (error) {
            console.error('Failed to fetch eBay pricing:', error);
            return this.getFallbackPricing(keywords);
        }
    }

    /**
     * Fetch pricing data from eBay Finding API
     */
    async fetchFromEbay(keywords, options = {}) {
        const params = new URLSearchParams({
            'OPERATION-NAME': 'findCompletedItems',
            'SERVICE-VERSION': '1.0.0',
            'SECURITY-APPNAME': this.config.appId,
            'RESPONSE-DATA-FORMAT': 'JSON',
            'REST-PAYLOAD': '',
            'keywords': keywords,
            'sortOrder': options.sortOrder || this.config.sortOrder,
            'paginationInput.entriesPerPage': options.maxResults || this.config.maxResults,
            'itemFilter(0).name': 'SoldItemsOnly',
            'itemFilter(0).value': 'true',
            'itemFilter(1).name': 'Condition',
            'itemFilter(1).value': options.condition || 'New',
        });

        // Add category filter if specified
        if (options.category) {
            params.append('categoryId', options.category);
        }

        const url = `${this.apiEndpoint}?${params.toString()}`;

        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return this.parseEbayResponse(data, keywords);
        } catch (error) {
            console.warn('eBay API call failed, using fallback pricing:', error);
            throw error;
        }
    }

    /**
     * Parse eBay API response and extract pricing information
     */
    parseEbayResponse(data, keywords) {
        const searchResult = data.findCompletedItemsResponse?.[0]?.searchResult?.[0];
        
        if (!searchResult || searchResult['@count'] === '0') {
            console.warn(`No completed items found for: ${keywords}`);
            return this.getFallbackPricing(keywords);
        }

        const items = searchResult.item || [];
        const prices = [];
        const recentSales = [];

        items.forEach(item => {
            const sellingStatus = item.sellingStatus?.[0];
            const currentPrice = sellingStatus?.currentPrice?.[0];
            
            if (currentPrice && currentPrice.__value__) {
                const price = parseFloat(currentPrice.__value__);
                prices.push(price);
                
                recentSales.push({
                    title: item.title?.[0] || 'Unknown',
                    price: price,
                    currency: currentPrice['@currencyId'] || 'USD',
                    endTime: item.listingInfo?.[0]?.endTime?.[0],
                    condition: item.condition?.[0]?.conditionDisplayName?.[0] || 'Used',
                    url: item.viewItemURL?.[0]
                });
            }
        });

        if (prices.length === 0) {
            return this.getFallbackPricing(keywords);
        }

        // Calculate statistics
        const sortedPrices = prices.sort((a, b) => a - b);
        const minPrice = sortedPrices[0];
        const maxPrice = sortedPrices[sortedPrices.length - 1];
        const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
        const medianPrice = sortedPrices[Math.floor(sortedPrices.length / 2)];

        return {
            keywords,
            timestamp: new Date().toISOString(),
            count: prices.length,
            prices: {
                min: minPrice,
                max: maxPrice,
                average: avgPrice,
                median: medianPrice,
                recommended: this.calculateRecommendedPrice(sortedPrices)
            },
            recentSales: recentSales.slice(0, 5), // Top 5 recent sales
            dataSource: 'ebay-completed-listings',
            confidence: this.calculateConfidence(prices.length)
        };
    }

    /**
     * Calculate recommended pricing based on recent sales
     */
    calculateRecommendedPrice(sortedPrices) {
        // Use 25th percentile for conservative pricing
        const index = Math.floor(sortedPrices.length * 0.25);
        return sortedPrices[index];
    }

    /**
     * Calculate confidence level based on number of data points
     */
    calculateConfidence(count) {
        if (count >= 15) return 'high';
        if (count >= 8) return 'medium';
        if (count >= 3) return 'low';
        return 'very-low';
    }

    /**
     * Get fallback pricing when API fails or no data available
     */
    getFallbackPricing(keywords) {
        console.log(`Using fallback pricing for: ${keywords}`);
        
        // Simple fallback based on keywords
        const fallbackDB = {
            // Nuts (per 100 pieces)
            'hex nut': { min: 5, max: 25, avg: 12 },
            'lock nut': { min: 8, max: 35, avg: 18 },
            'wing nut': { min: 10, max: 40, avg: 20 },
            'cap nut': { min: 12, max: 50, avg: 25 },
            
            // Bolts (per 100 pieces)
            'hex bolt': { min: 8, max: 40, avg: 20 },
            'carriage bolt': { min: 10, max: 45, avg: 22 },
            'lag bolt': { min: 15, max: 60, avg: 30 },
            'machine bolt': { min: 12, max: 50, avg: 25 },
            
            // Screws (per 100 pieces)
            'wood screw': { min: 5, max: 30, avg: 15 },
            'machine screw': { min: 8, max: 35, avg: 18 },
            'sheet metal screw': { min: 6, max: 28, avg: 14 },
            'drywall screw': { min: 4, max: 20, avg: 10 },
            
            // Washers (per 100 pieces)
            'flat washer': { min: 3, max: 15, avg: 8 },
            'lock washer': { min: 4, max: 18, avg: 10 },
            'fender washer': { min: 5, max: 20, avg: 12 },
            
            // Materials (per pound)
            'aluminum scrap': { min: 0.50, max: 1.50, avg: 0.85 },
            'copper scrap': { min: 2.50, max: 4.00, avg: 3.25 },
            'brass scrap': { min: 1.50, max: 3.00, avg: 2.15 },
            'stainless steel scrap': { min: 0.30, max: 0.80, avg: 0.50 },
            'steel scrap': { min: 0.05, max: 0.15, avg: 0.10 }
        };

        // Find matching fallback data
        const lowerKeywords = keywords.toLowerCase();
        for (const [key, value] of Object.entries(fallbackDB)) {
            if (lowerKeywords.includes(key)) {
                return {
                    keywords,
                    timestamp: new Date().toISOString(),
                    count: 0,
                    prices: {
                        min: value.min,
                        max: value.max,
                        average: value.avg,
                        median: value.avg,
                        recommended: value.avg
                    },
                    recentSales: [],
                    dataSource: 'fallback-database',
                    confidence: 'estimated'
                };
            }
        }

        // Generic fallback
        return {
            keywords,
            timestamp: new Date().toISOString(),
            count: 0,
            prices: {
                min: 1,
                max: 50,
                average: 15,
                median: 15,
                recommended: 15
            },
            recentSales: [],
            dataSource: 'generic-estimate',
            confidence: 'unknown'
        };
    }

    /**
     * Rate limiting to avoid API throttling
     */
    async rateLimit() {
        const now = Date.now();
        const elapsed = now - this.lastRequestTime;
        
        if (elapsed < this.minRequestInterval) {
            const delay = this.minRequestInterval - elapsed;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        this.lastRequestTime = Date.now();
    }

    /**
     * Generate cache key
     */
    getCacheKey(keywords, options = {}) {
        return `${keywords}-${JSON.stringify(options)}`;
    }

    /**
     * Get cached data
     */
    getCached(key) {
        const cached = this.priceCache.get(key);
        
        if (!cached) return null;
        
        // Check if cache expired
        const age = Date.now() - cached.timestamp;
        if (age > this.cacheExpiry) {
            this.priceCache.delete(key);
            return null;
        }
        
        return cached.data;
    }

    /**
     * Set cache
     */
    setCache(key, data) {
        this.priceCache.set(key, {
            data,
            timestamp: Date.now()
        });
        
        // Limit cache size
        if (this.priceCache.size > 1000) {
            const firstKey = this.priceCache.keys().next().value;
            this.priceCache.delete(firstKey);
        }
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.priceCache.clear();
        console.log('Price cache cleared');
    }

    /**
     * Get bulk pricing for multiple items
     */
    async getBulkPricing(items) {
        const results = [];
        
        for (const item of items) {
            const pricing = await this.getPricing(item.keywords, item.options);
            results.push({
                item,
                pricing
            });
        }
        
        return results;
    }

    /**
     * Get price for hardware with specifications
     */
    async getHardwarePrice(spec) {
        const {
            type,        // 'nut', 'bolt', 'screw', 'washer'
            size,        // '1/4-20', 'M6', etc.
            material,    // 'stainless steel', 'brass', 'zinc'
            quantity,    // number of pieces
            grade        // '304', '316', 'Grade 8', etc.
        } = spec;

        // Build search keywords
        let keywords = `${size || ''} ${type || ''} ${material || ''} ${grade || ''}`.trim();
        
        const pricing = await this.getPricing(keywords, {
            condition: 'New'
        });

        // Adjust for quantity
        if (quantity && pricing.prices.recommended) {
            // Most eBay listings are per lot, estimate per-piece price
            const perPiecePrice = pricing.prices.recommended / 100; // Assume 100 per lot
            pricing.totalPrice = perPiecePrice * quantity;
            pricing.perPiecePrice = perPiecePrice;
        }

        return pricing;
    }

    /**
     * Get price for bulk materials (aluminum, copper, etc.)
     */
    async getMaterialPrice(spec) {
        const {
            material,    // 'aluminum', 'copper', 'brass', 'steel'
            weight,      // weight in pounds
            form         // 'scrap', 'sheet', 'bar', 'ingot'
        } = spec;

        const keywords = `${material} ${form || 'scrap'} metal`;
        
        const pricing = await this.getPricing(keywords, {
            condition: 'Used'
        });

        // Material pricing is typically per pound
        if (weight && pricing.prices.recommended) {
            pricing.totalPrice = pricing.prices.recommended * weight;
            pricing.perPoundPrice = pricing.prices.recommended;
        }

        return pricing;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EbayPricingAPI;
}
