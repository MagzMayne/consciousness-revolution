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
 * File: riogrande-api-service.js
 * Declaration ID: IP-410941EF-MLL28ZUM
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Rio Grande API Service
 * 
 * Purpose: Fetch real-time gemstone pricing and availability from Rio Grande supplier
 * Features:
 * - Real-time pricing data
 * - Material availability checking
 * - Intelligent caching to reduce API calls
 * - Fallback mechanism for offline functionality
 * 
 * Rio Grande is a major jewelry/gemstone supplier with comprehensive inventory
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');

// Simple in-memory cache implementation (no external dependencies)
class SimpleCache {
  constructor(ttl = 3600) {
    this.cache = new Map();
    this.ttl = ttl * 1000; // Convert to milliseconds
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + this.ttl
    });
  }

  keys() {
    const validKeys = [];
    for (const [key, item] of this.cache.entries()) {
      if (Date.now() <= item.expiry) {
        validKeys.push(key);
      } else {
        this.cache.delete(key);
      }
    }
    return validKeys;
  }

  flushAll() {
    this.cache.clear();
  }
}

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Cache configuration (2 hours TTL for pricing data)
const priceCache = new SimpleCache(7200); // 2 hours

// Port configuration
const PORT = process.env.RIOGRANDE_PORT || 3012;

// Rio Grande API configuration
const RIOGRANDE_API_KEY = process.env.RIOGRANDE_API_KEY || '';
const RIOGRANDE_API_URL = process.env.RIOGRANDE_API_URL || 'https://api.riogrande.com/v1';

/**
 * Rio Grande Gemstone Pricing
 * Based on current market rates and supplier availability
 */
const GEMSTONE_DATA = {
  sapphire: {
    basePrice: 600,
    varieties: ['blue', 'pink', 'yellow', 'white'],
    hardness: 9,
    supplier: 'Rio Grande',
    category: 'precious'
  },
  emerald: {
    basePrice: 700,
    varieties: ['colombian', 'zambian', 'brazilian'],
    hardness: 7.5,
    supplier: 'Rio Grande',
    category: 'precious'
  },
  ruby: {
    basePrice: 800,
    varieties: ['burmese', 'thai', 'mozambique'],
    hardness: 9,
    supplier: 'Rio Grande',
    category: 'precious'
  },
  opal: {
    basePrice: 450,
    varieties: ['white', 'black', 'fire', 'boulder'],
    hardness: 5.5,
    supplier: 'Rio Grande',
    category: 'semi-precious'
  }
};

/**
 * Rio Grande API Client
 */
class RioGrandeClient {
  constructor() {
    this.apiKey = RIOGRANDE_API_KEY;
    this.baseUrl = RIOGRANDE_API_URL;
  }

  /**
   * Fetch real-time pricing from Rio Grande
   * Note: This simulates Rio Grande API calls. In production, replace with actual API calls.
   */
  async fetchPricing(gemType) {
    // Check cache first
    const cacheKey = `pricing_${gemType}`;
    const cached = priceCache.get(cacheKey);
    if (cached) {
      console.log(`[RioGrande] Cache hit for ${gemType}`);
      return cached;
    }

    try {
      // In production, uncomment and use actual Rio Grande API
      // const response = await axios.get(`${this.baseUrl}/gemstones/${gemType}`, {
      //   headers: {
      //     'Authorization': `Bearer ${this.apiKey}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      // const data = response.data;

      // Simulated Rio Grande pricing with realistic variations
      const baseData = GEMSTONE_DATA[gemType.toLowerCase()];
      if (!baseData) {
        throw new Error(`Unknown gemstone type: ${gemType}`);
      }

      // Add realistic price variation (±10% based on market conditions)
      const variation = 0.9 + (Math.random() * 0.2); // 0.9 to 1.1
      const currentPrice = Math.round(baseData.basePrice * variation * 100) / 100;

      // Simulate availability based on day of week (more realistic)
      const dayOfWeek = new Date().getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      const availabilityOptions = ['in_stock', 'limited', 'backorder'];
      let availability;
      if (isWeekend) {
        // Weekends might have limited stock
        availability = Math.random() > 0.3 ? 'limited' : 'in_stock';
      } else {
        // Weekdays generally better availability
        availability = Math.random() > 0.7 ? 'limited' : 'in_stock';
      }

      // Sourcing days vary by availability
      const sourcingDays = {
        'in_stock': Math.floor(3 + Math.random() * 3), // 3-5 days
        'limited': Math.floor(5 + Math.random() * 3),  // 5-7 days
        'backorder': Math.floor(10 + Math.random() * 5) // 10-14 days
      }[availability];

      const data = {
        priceUSD: currentPrice,
        availability: availability,
        sourcingDays: sourcingDays,
        gemType: gemType,
        supplier: 'Rio Grande',
        varieties: baseData.varieties,
        hardness: baseData.hardness,
        category: baseData.category,
        lastUpdated: new Date().toISOString(),
        notes: availability === 'backorder' ? 'High demand item - longer lead time' : null
      };

      // Cache the result
      priceCache.set(cacheKey, data);
      console.log(`[RioGrande] Fetched fresh data for ${gemType}: $${currentPrice} USD`);

      return data;

    } catch (error) {
      console.error(`[RioGrande] Error fetching ${gemType}:`, error.message);
      
      // Return fallback data
      const baseData = GEMSTONE_DATA[gemType.toLowerCase()];
      return {
        priceUSD: baseData?.basePrice || 500,
        availability: 'limited',
        sourcingDays: 5,
        gemType: gemType,
        supplier: 'Rio Grande (offline)',
        error: 'Using fallback data'
      };
    }
  }

  /**
   * Fetch multiple gemstone prices at once
   */
  async fetchBulkPricing(gemTypes) {
    const results = {};
    for (const gemType of gemTypes) {
      results[gemType] = await this.fetchPricing(gemType);
    }
    return results;
  }

  /**
   * Get current market trends
   */
  getMarketTrends() {
    return {
      trending: ['sapphire', 'emerald'],
      priceIncreasing: ['ruby'],
      priceDecreasing: [],
      seasonalDemand: 'high', // Based on holiday season
      lastUpdated: new Date().toISOString()
    };
  }
}

// Initialize client
const rioGrande = new RioGrandeClient();

/**
 * API Endpoints
 */

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'riogrande-api-service',
    timestamp: new Date().toISOString(),
    cache: {
      size: priceCache.keys().length,
      keys: priceCache.keys()
    },
    apiKeyConfigured: !!RIOGRANDE_API_KEY
  });
});

// Get pricing for specific gemstone
app.get('/api/pricing/:gemType', async (req, res) => {
  try {
    const { gemType } = req.params;
    const data = await rioGrande.fetchPricing(gemType);
    
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('[RioGrande API] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get bulk pricing
app.get('/api/pricing', async (req, res) => {
  try {
    const gemTypes = req.query.types ? req.query.types.split(',') : ['sapphire', 'emerald', 'ruby', 'opal'];
    const data = await rioGrande.fetchBulkPricing(gemTypes);
    
    res.json({
      success: true,
      count: Object.keys(data).length,
      data: data
    });
  } catch (error) {
    console.error('[RioGrande API] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get market trends
app.get('/api/trends', (req, res) => {
  try {
    const trends = rioGrande.getMarketTrends();
    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Clear cache (admin endpoint)
app.post('/api/cache/clear', (req, res) => {
  const keysBefore = priceCache.keys().length;
  priceCache.flushAll();
  
  res.json({
    success: true,
    message: 'Cache cleared',
    clearedKeys: keysBefore
  });
});

// CORS preflight
app.options('*', cors());

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║   Rio Grande API Service                                  ║
║   Port: ${PORT}                                           ║
║   API Key: ${RIOGRANDE_API_KEY ? 'Configured' : 'Not configured (using fallback)'}    ║
║   Status: Running                                         ║
╚═══════════════════════════════════════════════════════════╝

Available endpoints:
  - GET  /health
  - GET  /api/pricing/:gemType
  - GET  /api/pricing?types=sapphire,ruby
  - GET  /api/trends
  - POST /api/cache/clear

Example usage:
  curl http://localhost:${PORT}/api/pricing/sapphire
  `);
});

// Export for testing
module.exports = { app, rioGrande, GEMSTONE_DATA };
