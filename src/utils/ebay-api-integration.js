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
 * File: ebay-api-integration.js
 * Declaration ID: IP-3B49112-MLL28ZWE
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * @aul-enabled
 * This file is compatible with AI Universal Language (AUL)
 * Learn more: https://barbrickdesign.github.io/ai-universal-language.html
 */

/**
 * eBay API Integration Utility
 * 
 * Purpose: Provide comprehensive eBay API functionality for:
 * - Mineral identification and pricing (fluoriteId.html, mineralMarket.html)
 * - Autonomous marketing and listing (marketing-agent.js, ebaySwarm.html)
 * - Product research and competitive analysis
 * 
 * eBay APIs Supported:
 * - Browse API: Search for items, get item details
 * - Buy API: Get pricing information, product details
 * - Sell API: Create and manage listings (requires OAuth)
 * - Marketing API: Promotions and analytics
 * 
 * Documentation: https://developer.ebay.com/develop/get-started
 * 
 * @author BarbrickDesign (barbrickdesign@gmail.com)
 * @version 1.0.0
 * @license Ethical Use Only - Revenue Generation Focused
 */

class EbayApiIntegration {
  constructor(config = {}) {
    this.config = {
      // API Credentials
      clientId: config.clientId || process.env.EBAY_CLIENT_ID || null,
      clientSecret: config.clientSecret || process.env.EBAY_CLIENT_SECRET || null,
      
      // Environment: sandbox or production
      environment: config.environment || process.env.EBAY_ENVIRONMENT || 'production',
      
      // API Endpoints
      endpoints: {
        production: {
          browse: 'https://api.ebay.com/buy/browse/v1',
          buy: 'https://api.ebay.com/buy/marketplace_insights/v1',
          sell: 'https://api.ebay.com/sell/inventory/v1',
          marketing: 'https://api.ebay.com/sell/marketing/v1',
          oauth: 'https://api.ebay.com/identity/v1/oauth2/token'
        },
        sandbox: {
          browse: 'https://api.sandbox.ebay.com/buy/browse/v1',
          buy: 'https://api.sandbox.ebay.com/buy/marketplace_insights/v1',
          sell: 'https://api.sandbox.ebay.com/sell/inventory/v1',
          marketing: 'https://api.sandbox.ebay.com/sell/marketing/v1',
          oauth: 'https://api.sandbox.ebay.com/identity/v1/oauth2/token'
        }
      },
      
      // Default marketplace
      marketplace: config.marketplace || 'EBAY_US',
      
      // Cache settings
      cacheEnabled: config.cacheEnabled !== false,
      cacheDuration: config.cacheDuration || 3600000, // 1 hour
      
      ...config
    };
    
    this.accessToken = null;
    this.tokenExpiry = null;
    this.cache = new Map();
    this.logs = [];
    
    this.init();
  }
  
  /**
   * Initialize the eBay API integration
   */
  async init() {
    try {
      this.log('Initializing eBay API integration...', 'info');
      
      // Load configuration from localStorage if available
      await this.loadConfiguration();
      
      // Get OAuth token if credentials are available
      if (this.config.clientId && this.config.clientSecret) {
        await this.authenticate();
      } else {
        this.log('eBay API credentials not configured. Some features will be limited.', 'warning');
      }
      
      this.log('eBay API integration initialized', 'success');
      
    } catch (error) {
      this.log(`Failed to initialize eBay API: ${error.message}`, 'error');
    }
  }
  
  /**
   * Load configuration from localStorage
   */
  async loadConfiguration() {
    try {
      if (typeof localStorage !== 'undefined') {
        const storedConfig = localStorage.getItem('ebayApiConfig');
        if (storedConfig) {
          const parsed = JSON.parse(storedConfig);
          this.config = { ...this.config, ...parsed };
        }
      }
    } catch (error) {
      this.log(`Configuration load warning: ${error.message}`, 'warning');
    }
  }
  
  /**
   * Authenticate with eBay OAuth
   */
  async authenticate() {
    try {
      this.log('Authenticating with eBay...', 'info');
      
      const endpoint = this.config.endpoints[this.config.environment].oauth;
      const credentials = btoa(`${this.config.clientId}:${this.config.clientSecret}`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`
        },
        body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope'
      });
      
      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.access_token;
        this.tokenExpiry = Date.now() + (data.expires_in * 1000);
        
        this.log('eBay authentication successful', 'success');
        return true;
      } else {
        throw new Error(`Authentication failed: ${response.status}`);
      }
      
    } catch (error) {
      this.log(`Authentication error: ${error.message}`, 'error');
      return false;
    }
  }
  
  /**
   * Ensure valid authentication token
   */
  async ensureAuthenticated() {
    if (!this.accessToken || Date.now() >= this.tokenExpiry - 60000) {
      await this.authenticate();
    }
  }
  
  /**
   * Get API endpoint URL
   */
  getEndpoint(api) {
    return this.config.endpoints[this.config.environment][api];
  }
  
  /**
   * Make authenticated API request
   */
  async makeRequest(endpoint, options = {}) {
    try {
      await this.ensureAuthenticated();
      
      const headers = {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'X-EBAY-C-MARKETPLACE-ID': this.config.marketplace,
        ...options.headers
      };
      
      const response = await fetch(endpoint, {
        ...options,
        headers
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }
      
    } catch (error) {
      this.log(`API request error: ${error.message}`, 'error');
      throw error;
    }
  }
  
  /**
   * Search for items on eBay
   * Perfect for mineral identification - find similar items and pricing
   */
  async searchItems(query, options = {}) {
    try {
      this.log(`Searching eBay for: ${query}`, 'info');
      
      // Check cache first
      const cacheKey = `search_${query}_${JSON.stringify(options)}`;
      if (this.config.cacheEnabled) {
        const cached = this.getFromCache(cacheKey);
        if (cached) {
          this.log('Returning cached search results', 'info');
          return cached;
        }
      }
      
      const endpoint = this.getEndpoint('browse');
      const params = new URLSearchParams({
        q: query,
        limit: options.limit || 50,
        ...(options.categoryId && { category_ids: options.categoryId }),
        ...(options.filter && { filter: options.filter }),
        ...(options.sort && { sort: options.sort })
      });
      
      const url = `${endpoint}/item_summary/search?${params}`;
      const data = await this.makeRequest(url);
      
      // Process and format results
      const results = {
        total: data.total || 0,
        items: (data.itemSummaries || []).map(item => ({
          itemId: item.itemId,
          title: item.title,
          price: item.price ? {
            value: item.price.value,
            currency: item.price.currency
          } : null,
          condition: item.condition,
          image: item.image?.imageUrl,
          itemWebUrl: item.itemWebUrl,
          seller: item.seller?.username,
          shippingCost: item.shippingOptions?.[0]?.shippingCost,
          itemLocation: item.itemLocation?.country
        }))
      };
      
      // Cache results
      if (this.config.cacheEnabled) {
        this.saveToCache(cacheKey, results);
      }
      
      this.log(`Found ${results.total} items`, 'success');
      return results;
      
    } catch (error) {
      this.log(`Search failed: ${error.message}`, 'error');
      throw error;
    }
  }
  
  /**
   * Get item details by ID
   */
  async getItemDetails(itemId) {
    try {
      this.log(`Getting details for item: ${itemId}`, 'info');
      
      // Check cache
      const cacheKey = `item_${itemId}`;
      if (this.config.cacheEnabled) {
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;
      }
      
      const endpoint = this.getEndpoint('browse');
      const url = `${endpoint}/item/${itemId}`;
      
      const data = await this.makeRequest(url);
      
      const details = {
        itemId: data.itemId,
        title: data.title,
        subtitle: data.subtitle,
        price: data.price,
        description: data.description,
        condition: data.condition,
        conditionDescription: data.conditionDescription,
        images: data.image?.imageUrl ? [data.image.imageUrl] : (data.additionalImages || []).map(img => img.imageUrl),
        category: data.categoryPath,
        itemWebUrl: data.itemWebUrl,
        seller: {
          username: data.seller?.username,
          feedbackScore: data.seller?.feedbackScore,
          feedbackPercentage: data.seller?.feedbackPercentage
        },
        shipping: data.shippingOptions,
        itemLocation: data.itemLocation,
        estimatedAvailabilities: data.estimatedAvailabilities,
        returnTerms: data.returnTerms,
        product: data.product
      };
      
      // Cache results
      if (this.config.cacheEnabled) {
        this.saveToCache(cacheKey, details);
      }
      
      this.log('Item details retrieved successfully', 'success');
      return details;
      
    } catch (error) {
      this.log(`Get item details failed: ${error.message}`, 'error');
      throw error;
    }
  }
  
  /**
   * Get price insights for a specific item type
   * Useful for mineral market pricing
   */
  async getPriceInsights(itemName, categoryId = null) {
    try {
      this.log(`Getting price insights for: ${itemName}`, 'info');
      
      // Search for similar items
      const searchResults = await this.searchItems(itemName, {
        categoryId,
        limit: 100,
        filter: 'conditionIds:{1000|2000|3000}', // New, Like New, Very Good
        sort: 'price' // Sort by price
      });
      
      if (searchResults.items.length === 0) {
        return {
          available: false,
          message: 'No items found for pricing analysis'
        };
      }
      
      // Calculate price statistics
      const prices = searchResults.items
        .filter(item => item.price && item.price.value)
        .map(item => parseFloat(item.price.value))
        .sort((a, b) => a - b);
      
      const insights = {
        available: true,
        itemName,
        sampleSize: prices.length,
        currency: searchResults.items[0].price?.currency || 'USD',
        prices: {
          min: prices[0],
          max: prices[prices.length - 1],
          average: prices.reduce((sum, p) => sum + p, 0) / prices.length,
          median: prices[Math.floor(prices.length / 2)],
          q1: prices[Math.floor(prices.length * 0.25)],
          q3: prices[Math.floor(prices.length * 0.75)]
        },
        recommendations: {
          competitive: prices[Math.floor(prices.length * 0.4)], // 40th percentile
          market: prices[Math.floor(prices.length * 0.5)],      // Median
          premium: prices[Math.floor(prices.length * 0.75)]     // 75th percentile
        },
        topListings: searchResults.items.slice(0, 5)
      };
      
      this.log('Price insights calculated successfully', 'success');
      return insights;
      
    } catch (error) {
      this.log(`Price insights failed: ${error.message}`, 'error');
      throw error;
    }
  }
  
  /**
   * Search for mineral-specific items
   * Enhanced search for fluorite, minerals, crystals
   */
  async searchMinerals(mineralName, options = {}) {
    try {
      this.log(`Searching for mineral: ${mineralName}`, 'info');
      
      // Mineral category IDs on eBay
      const mineralCategories = {
        'rocks-fossils-minerals': '3213',
        'crystals': '158747',
        'fluorite': '158747',
        'minerals': '158748'
      };
      
      const categoryId = options.categoryId || mineralCategories['rocks-fossils-minerals'];
      
      // Enhanced query with mineral-specific terms
      const enhancedQuery = `${mineralName} ${options.type || 'specimen'}`;
      
      const results = await this.searchItems(enhancedQuery, {
        categoryId,
        limit: options.limit || 50,
        filter: options.filter || 'conditionIds:{1000|3000}', // New or Very Good
        sort: options.sort || 'price'
      });
      
      // Add mineral-specific metadata
      results.mineralType = mineralName;
      results.categoryId = categoryId;
      results.searchEnhanced = true;
      
      return results;
      
    } catch (error) {
      this.log(`Mineral search failed: ${error.message}`, 'error');
      throw error;
    }
  }
  
  /**
   * Get suggested listing details for a mineral specimen
   * Helps create listings for identified minerals
   */
  async getSuggestedListingDetails(mineralName, characteristics = {}) {
    try {
      this.log(`Generating listing suggestions for: ${mineralName}`, 'info');
      
      // Get price insights
      const priceInsights = await this.getPriceInsights(mineralName);
      
      // Search for similar listings
      const similarListings = await this.searchMinerals(mineralName, {
        limit: 20
      });
      
      // Analyze common title patterns
      const titleWords = {};
      similarListings.items.forEach(item => {
        const words = item.title.toLowerCase().split(/\s+/);
        words.forEach(word => {
          if (word.length > 3) { // Ignore short words
            titleWords[word] = (titleWords[word] || 0) + 1;
          }
        });
      });
      
      // Get most common descriptive words
      const popularWords = Object.entries(titleWords)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word]) => word);
      
      const suggestions = {
        mineralName,
        pricing: priceInsights.available ? {
          recommended: priceInsights.recommendations.market,
          competitive: priceInsights.recommendations.competitive,
          premium: priceInsights.recommendations.premium,
          currency: priceInsights.currency
        } : null,
        title: {
          suggested: this.generateMineralTitle(mineralName, characteristics, popularWords),
          popularKeywords: popularWords
        },
        description: {
          template: this.generateMineralDescription(mineralName, characteristics),
          suggestedSections: [
            'Specimen Details',
            'Origin & Locality',
            'Condition',
            'Dimensions',
            'Color & Fluorescence',
            'Scientific Properties',
            'Collector Notes',
            'Shipping Information'
          ]
        },
        category: {
          primary: '3213', // Rocks, Fossils & Minerals
          specific: '158747' // Crystals & Mineral Specimens
        },
        similarListings: similarListings.items.slice(0, 5),
        marketTrends: {
          averageViews: 'Data not available without seller API',
          competitionLevel: similarListings.total > 100 ? 'High' : similarListings.total > 50 ? 'Medium' : 'Low',
          totalListings: similarListings.total
        }
      };
      
      this.log('Listing suggestions generated successfully', 'success');
      return suggestions;
      
    } catch (error) {
      this.log(`Listing suggestions failed: ${error.message}`, 'error');
      throw error;
    }
  }
  
  /**
   * Generate optimized title for mineral listing
   */
  generateMineralTitle(mineralName, characteristics, popularWords = []) {
    const parts = [mineralName.toUpperCase()];
    
    // Add size/weight if available
    if (characteristics.weight) {
      parts.push(`${characteristics.weight}g`);
    } else if (characteristics.dimensions) {
      parts.push(`${characteristics.dimensions}`);
    }
    
    // Add color if available
    if (characteristics.color) {
      parts.push(characteristics.color);
    }
    
    // Add locality if available
    if (characteristics.locality) {
      parts.push(`from ${characteristics.locality}`);
    }
    
    // Add fluorescence info
    if (characteristics.fluorescent) {
      parts.push('UV REACTIVE');
    }
    
    // Add condition
    parts.push('Natural Specimen');
    
    // Add popular keyword if not already included
    if (popularWords.length > 0) {
      const keyword = popularWords.find(w => 
        !parts.join(' ').toLowerCase().includes(w) && 
        !['mineral', 'specimen', 'crystal'].includes(w)
      );
      if (keyword) {
        parts.push(keyword.toUpperCase());
      }
    }
    
    return parts.join(' • ');
  }
  
  /**
   * Generate comprehensive description for mineral listing
   */
  generateMineralDescription(mineralName, characteristics) {
    const sections = [];
    
    sections.push(`STUNNING ${mineralName.toUpperCase()} SPECIMEN`);
    sections.push('');
    sections.push('SPECIMEN DETAILS:');
    
    if (characteristics.weight) {
      sections.push(`• Weight: ${characteristics.weight}g`);
    }
    if (characteristics.dimensions) {
      sections.push(`• Dimensions: ${characteristics.dimensions}`);
    }
    if (characteristics.color) {
      sections.push(`• Color: ${characteristics.color}`);
    }
    if (characteristics.locality) {
      sections.push(`• Origin: ${characteristics.locality}`);
    }
    if (characteristics.fluorescent) {
      sections.push(`• UV Fluorescence: ${characteristics.fluorescent}`);
    }
    
    sections.push('');
    sections.push('CONDITION:');
    sections.push('Natural mineral specimen in excellent condition. This piece showcases the natural beauty and geological wonder of ' + mineralName + '.');
    
    sections.push('');
    sections.push('PERFECT FOR:');
    sections.push('• Mineral collectors');
    sections.push('• Geology enthusiasts');
    sections.push('• Educational displays');
    sections.push('• Home decor');
    sections.push('• Scientific study');
    
    sections.push('');
    sections.push('SHIPPING:');
    sections.push('Carefully packaged to ensure safe delivery. Ships within 1-2 business days.');
    
    sections.push('');
    sections.push('Questions? Feel free to message us!');
    
    return sections.join('\n');
  }
  
  /**
   * Get competitive analysis for marketing
   */
  async getCompetitiveAnalysis(productName, options = {}) {
    try {
      this.log(`Running competitive analysis for: ${productName}`, 'info');
      
      const searchResults = await this.searchItems(productName, {
        limit: 100,
        ...options
      });
      
      // Analyze competition
      const analysis = {
        productName,
        totalCompetitors: searchResults.total,
        topCompetitors: searchResults.items.slice(0, 10),
        priceRange: {
          lowest: Math.min(...searchResults.items.map(i => i.price?.value || Infinity)),
          highest: Math.max(...searchResults.items.map(i => i.price?.value || 0)),
          average: searchResults.items.reduce((sum, i) => sum + (i.price?.value || 0), 0) / searchResults.items.length
        },
        commonKeywords: this.extractCommonKeywords(searchResults.items),
        marketGaps: this.identifyMarketGaps(searchResults.items),
        recommendations: []
      };
      
      // Generate recommendations
      if (analysis.totalCompetitors < 20) {
        analysis.recommendations.push('Low competition - great opportunity!');
      }
      if (analysis.priceRange.highest / analysis.priceRange.lowest > 3) {
        analysis.recommendations.push('Wide price range - room for different positioning strategies');
      }
      
      this.log('Competitive analysis complete', 'success');
      return analysis;
      
    } catch (error) {
      this.log(`Competitive analysis failed: ${error.message}`, 'error');
      throw error;
    }
  }
  
  /**
   * Extract common keywords from listings
   */
  extractCommonKeywords(items) {
    const keywords = {};
    
    items.forEach(item => {
      const words = item.title.toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 3);
      
      words.forEach(word => {
        keywords[word] = (keywords[word] || 0) + 1;
      });
    });
    
    return Object.entries(keywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({ word, frequency: count }));
  }
  
  /**
   * Identify market gaps and opportunities
   */
  identifyMarketGaps(items) {
    const gaps = [];
    
    // Check for missing price points
    const prices = items.map(i => i.price?.value || 0).sort((a, b) => a - b);
    const priceGaps = [];
    
    for (let i = 1; i < prices.length; i++) {
      const gap = prices[i] - prices[i - 1];
      if (gap > prices[i] * 0.3) { // 30% gap
        priceGaps.push({
          lower: prices[i - 1],
          upper: prices[i],
          gap: gap
        });
      }
    }
    
    if (priceGaps.length > 0) {
      gaps.push({
        type: 'pricing',
        description: 'Significant price gaps exist in the market',
        opportunities: priceGaps
      });
    }
    
    return gaps;
  }
  
  /**
   * Cache management
   */
  saveToCache(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
  
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.config.cacheDuration) {
      return cached.value;
    }
    return null;
  }
  
  clearCache() {
    this.cache.clear();
    this.log('Cache cleared', 'info');
  }
  
  /**
   * Logging system
   */
  log(message, level = 'info') {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message
    };
    
    this.logs.push(entry);
    
    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
    
    // Console output with color
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m'    // Red
    };
    
    console.log(`${colors[level]}[EBAY] ${message}\x1b[0m`);
  }
  
  /**
   * Get system status
   */
  getStatus() {
    return {
      authenticated: !!this.accessToken,
      tokenExpiry: this.tokenExpiry,
      environment: this.config.environment,
      marketplace: this.config.marketplace,
      cacheSize: this.cache.size,
      logs: this.logs.slice(-10)
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EbayApiIntegration;
}

// Make available globally in browser
if (typeof window !== 'undefined') {
  window.EbayApiIntegration = EbayApiIntegration;
}
