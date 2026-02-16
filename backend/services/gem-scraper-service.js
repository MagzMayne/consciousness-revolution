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
 * File: gem-scraper-service.js
 * Declaration ID: IP-571C8B1-MLL28ZUL
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Gem Scraper Service
 * 
 * Purpose: Automated Instagram and eBay scraping for gemstone profit analysis
 * Features:
 * - Instagram post scraping for gemstone listings
 * - eBay sold listings API integration
 * - Automated profit calculation
 * - Data caching to reduce API costs
 * - Real-time recommendation engine
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Cache configuration (1 hour TTL for Instagram, 6 hours for eBay)
const instagramCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });
const ebayCache = new NodeCache({ stdTTL: 21600, checkperiod: 3600 });

// Port configuration
const PORT = process.env.GEM_SCRAPER_PORT || 3010;

// API Keys (from environment variables)
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';
const EBAY_APP_ID = process.env.EBAY_APP_ID || '';

/**
 * Instagram Scraping Utilities
 */
class InstagramScraper {
  constructor() {
    this.baseURL = 'https://instagram-scraper-api2.p.rapidapi.com/v1';
    this.headers = {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'instagram-scraper-api2.p.rapidapi.com'
    };
  }

  /**
   * Extract gemstone data from Instagram posts
   * Looks for price, weight, and stone type mentions
   */
  extractGemData(caption) {
    const data = {
      stone_name: null,
      price_value: null,
      weight_ct: null,
      detected_terms: []
    };

    if (!caption) return data;

    const text = caption.toLowerCase();

    // Common gemstone types
    const stoneTypes = [
      'diamond', 'ruby', 'sapphire', 'emerald', 'tourmaline', 'spinel',
      'topaz', 'aquamarine', 'garnet', 'peridot', 'amethyst', 'citrine',
      'tanzanite', 'opal', 'jade', 'turquoise', 'morganite', 'kunzite',
      'zircon', 'alexandrite', 'chrysoberyl', 'moonstone', 'sunstone'
    ];

    // Find stone type
    for (const stone of stoneTypes) {
      if (text.includes(stone)) {
        data.stone_name = stone.charAt(0).toUpperCase() + stone.slice(1);
        data.detected_terms.push(stone);
        break;
      }
    }

    // Extract price (various formats)
    const pricePatterns = [
      /\$\s*([0-9,]+(?:\.[0-9]{2})?)/i,           // $150 or $1,500.00
      /([0-9,]+(?:\.[0-9]{2})?)\s*(?:usd|dollars?)/i, // 150 USD
      /price[:\s]+\$?\s*([0-9,]+(?:\.[0-9]{2})?)/i    // Price: $150
    ];

    for (const pattern of pricePatterns) {
      const match = caption.match(pattern);
      if (match) {
        const priceStr = match[1].replace(/,/g, '');
        data.price_value = parseFloat(priceStr);
        if (!isNaN(data.price_value)) break;
      }
    }

    // Extract weight in carats
    const weightPatterns = [
      /([0-9]+(?:\.[0-9]+)?)\s*(?:ct|carat|carats)/i,
      /([0-9]+(?:\.[0-9]+)?)\s*c[\s,.$]/i  // More specific: requires space, comma, period, or end marker after 'c'
    ];

    for (const pattern of weightPatterns) {
      const match = caption.match(pattern);
      if (match) {
        data.weight_ct = parseFloat(match[1]);
        if (!isNaN(data.weight_ct)) break;
      }
    }

    return data;
  }

  /**
   * Scrape Instagram user posts
   */
  async scrapeUserPosts(username, limit = 20) {
    const cacheKey = `ig_user_${username}_${limit}`;
    const cached = instagramCache.get(cacheKey);
    if (cached) {
      console.log(`[Instagram] Cache hit for ${username}`);
      return cached;
    }

    try {
      // Note: This is a placeholder for Instagram API integration
      // In production, use RapidAPI Instagram Scraper or similar service
      console.log(`[Instagram] Fetching posts for ${username}...`);
      
      if (!RAPIDAPI_KEY) {
        console.warn('[Instagram] No RapidAPI key configured, using mock data');
        return this.getMockInstagramData(username);
      }

      const response = await axios.get(`${this.baseURL}/posts`, {
        headers: this.headers,
        params: {
          username_or_id_or_url: username,
          count: limit
        },
        timeout: 15000
      });

      const posts = response.data?.data?.items || [];
      const processed = posts.map(post => {
        const caption = post.caption?.text || '';
        const gemData = this.extractGemData(caption);
        
        return {
          id: post.id,
          username: post.user?.username || username,
          caption: caption,
          permalink: post.permalink || `https://instagram.com/p/${post.code}`,
          timestamp: post.taken_at,
          image_url: post.thumbnail_url || post.display_url,
          likes: post.like_count || 0,
          comments: post.comment_count || 0,
          ...gemData
        };
      }).filter(post => post.stone_name && post.price_value && post.weight_ct);

      instagramCache.set(cacheKey, processed);
      console.log(`[Instagram] Found ${processed.length} gem posts for ${username}`);
      return processed;

    } catch (error) {
      console.error('[Instagram] Scraping error:', error.message);
      // Fallback to mock data for development
      return this.getMockInstagramData(username);
    }
  }

  /**
   * Search Instagram hashtags for gemstones
   */
  async scrapeHashtag(hashtag, limit = 30) {
    const cacheKey = `ig_hashtag_${hashtag}_${limit}`;
    const cached = instagramCache.get(cacheKey);
    if (cached) {
      console.log(`[Instagram] Cache hit for #${hashtag}`);
      return cached;
    }

    try {
      console.log(`[Instagram] Searching hashtag #${hashtag}...`);
      
      if (!RAPIDAPI_KEY) {
        console.warn('[Instagram] No RapidAPI key configured, using mock data');
        return this.getMockHashtagData(hashtag);
      }

      const response = await axios.get(`${this.baseURL}/hashtag`, {
        headers: this.headers,
        params: {
          hashtag: hashtag,
          count: limit
        },
        timeout: 15000
      });

      const posts = response.data?.data?.items || [];
      const processed = posts.map(post => {
        const caption = post.caption?.text || '';
        const gemData = this.extractGemData(caption);
        
        return {
          id: post.id,
          username: post.user?.username || 'unknown',
          caption: caption,
          permalink: post.permalink || `https://instagram.com/p/${post.code}`,
          timestamp: post.taken_at,
          image_url: post.thumbnail_url || post.display_url,
          likes: post.like_count || 0,
          comments: post.comment_count || 0,
          ...gemData
        };
      }).filter(post => post.stone_name && post.price_value && post.weight_ct);

      instagramCache.set(cacheKey, processed);
      console.log(`[Instagram] Found ${processed.length} gem posts for #${hashtag}`);
      return processed;

    } catch (error) {
      console.error('[Instagram] Hashtag search error:', error.message);
      return this.getMockHashtagData(hashtag);
    }
  }

  /**
   * Mock data for development/testing
   */
  getMockInstagramData(username) {
    return [
      {
        id: 'mock_1',
        username: username,
        caption: 'Beautiful 2.5ct Tourmaline for sale! $150 DM for details 💎',
        permalink: 'https://instagram.com/p/mock1',
        timestamp: Date.now() / 1000,
        image_url: '',
        likes: 245,
        comments: 12,
        stone_name: 'Tourmaline',
        price_value: 150,
        weight_ct: 2.5,
        detected_terms: ['tourmaline']
      },
      {
        id: 'mock_2',
        username: username,
        caption: 'Stunning 3.8ct Spinel - Price: $420 USD 🔥',
        permalink: 'https://instagram.com/p/mock2',
        timestamp: Date.now() / 1000,
        image_url: '',
        likes: 189,
        comments: 8,
        stone_name: 'Spinel',
        price_value: 420,
        weight_ct: 3.8,
        detected_terms: ['spinel']
      },
      {
        id: 'mock_3',
        username: username,
        caption: 'Natural Sapphire 1.2 carats - $890 💙',
        permalink: 'https://instagram.com/p/mock3',
        timestamp: Date.now() / 1000,
        image_url: '',
        likes: 456,
        comments: 23,
        stone_name: 'Sapphire',
        price_value: 890,
        weight_ct: 1.2,
        detected_terms: ['sapphire']
      }
    ];
  }

  getMockHashtagData(hashtag) {
    return this.getMockInstagramData(hashtag);
  }
}

/**
 * eBay API Integration
 */
class EbayScraper {
  constructor() {
    this.baseURL = 'https://svcs.ebay.com/services/search/FindingService/v1';
  }

  /**
   * Search eBay sold listings
   */
  async getSoldListings(query, limit = 50) {
    const cacheKey = `ebay_${query}_${limit}`;
    const cached = ebayCache.get(cacheKey);
    if (cached) {
      console.log(`[eBay] Cache hit for "${query}"`);
      return cached;
    }

    try {
      console.log(`[eBay] Searching sold listings for "${query}"...`);

      if (!EBAY_APP_ID) {
        console.warn('[eBay] No App ID configured, using fallback scraping');
        return await this.fallbackScraping(query);
      }

      // eBay Finding API call
      const params = {
        'OPERATION-NAME': 'findCompletedItems',
        'SERVICE-VERSION': '1.0.0',
        'SECURITY-APPNAME': EBAY_APP_ID,
        'RESPONSE-DATA-FORMAT': 'JSON',
        'REST-PAYLOAD': true,
        'keywords': query,
        'paginationInput.entriesPerPage': limit,
        'sortOrder': 'EndTimeSoonest',
        'itemFilter(0).name': 'SoldItemsOnly',
        'itemFilter(0).value': 'true',
        'itemFilter(1).name': 'Condition',
        'itemFilter(1).value': 'New'
      };

      const response = await axios.get(this.baseURL, { params, timeout: 15000 });
      const items = response.data?.findCompletedItemsResponse?.[0]?.searchResult?.[0]?.item || [];

      const processed = items.map(item => ({
        title: item.title?.[0] || '',
        price: item.sellingStatus?.[0]?.currentPrice?.[0]?.__value__ || '0',
        currency: item.sellingStatus?.[0]?.currentPrice?.[0]?.['@currencyId'] || 'USD',
        end_time: item.listingInfo?.[0]?.endTime?.[0] || '',
        item_id: item.itemId?.[0] || '',
        link: item.viewItemURL?.[0] || ''
      })).filter(item => item.title && parseFloat(item.price) > 0);

      ebayCache.set(cacheKey, processed);
      console.log(`[eBay] Found ${processed.length} sold listings`);
      return processed;

    } catch (error) {
      console.error('[eBay] API error:', error.message);
      return await this.fallbackScraping(query);
    }
  }

  /**
   * Fallback HTML scraping (using existing igGems logic)
   */
  async fallbackScraping(query) {
    try {
      const ebayURL = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&_sop=13&LH_Sold=1&LH_Complete=1`;
      const proxied = `https://cors.isomorphic-git.org/${ebayURL}`;
      
      const response = await axios.get(proxied, { timeout: 15000 });
      const html = response.data;
      
      // Parse HTML for items (simplified)
      const items = [];
      const itemRegex = /<li[^>]*class="s-item[^>]*>[\s\S]*?<\/li>/gi;
      const matches = html.match(itemRegex) || [];
      
      for (const match of matches) {
        const titleMatch = match.match(/<div[^>]*class="s-item__title[^>]*>(.*?)<\/div>/i);
        const priceMatch = match.match(/<span[^>]*class="s-item__price[^>]*>(.*?)<\/span>/i);
        const linkMatch = match.match(/href="([^"]*)" class="s-item__link/i);
        
        if (titleMatch && priceMatch && linkMatch) {
          items.push({
            title: titleMatch[1].replace(/<[^>]*>/g, '').trim(),
            price: priceMatch[1].replace(/<[^>]*>/g, '').trim(),
            link: linkMatch[1]
          });
        }
      }
      
      console.log(`[eBay] Fallback scraping found ${items.length} items`);
      return items;

    } catch (error) {
      console.error('[eBay] Fallback scraping error:', error.message);
      return [];
    }
  }

  /**
   * Calculate statistics from sold listings
   * Note: This is a simplified per-carat estimation. Ideally, each eBay item's
   * actual carat weight should be extracted and used for per-carat calculations.
   * Current implementation assumes similar weights to the Instagram stone for
   * quick estimation. For more accuracy, extract carat weight from each eBay listing.
   */
  calculateStats(items, caratWeight) {
    const prices = items.map(item => {
      const priceStr = String(item.price).replace(/[^0-9.]/g, '');
      return parseFloat(priceStr);
    }).filter(p => !isNaN(p) && p > 0);

    if (prices.length === 0) {
      return {
        count: 0,
        median: null,
        average: null,
        min: null,
        max: null,
        perCarat: null,
        confidence: 0
      };
    }

    prices.sort((a, b) => a - b);
    
    const count = prices.length;
    const sum = prices.reduce((a, b) => a + b, 0);
    const average = sum / count;
    const median = prices[Math.floor(count / 2)];
    const min = prices[0];
    const max = prices[count - 1];
    
    // Calculate per-carat price if weight provided
    const perCarat = caratWeight > 0 ? average / caratWeight : null;
    
    // Confidence based on number of samples
    const confidence = Math.min(0.95, 0.3 + (count / 100));

    return {
      count,
      median,
      average,
      min,
      max,
      perCarat,
      confidence
    };
  }
}

/**
 * Profit Analysis Engine
 */
class ProfitAnalyzer {
  /**
   * Calculate profit and ROI
   * Note: eBay average fee is approximately 13% (includes final value fees,
   * payment processing, and shipping costs). Actual fees may vary by category.
   */
  analyze(instagramPrice, ebayStats, caratWeight) {
    if (!ebayStats || !ebayStats.average || !instagramPrice) {
      return {
        profitable: false,
        profit: 0,
        roi: 0,
        confidence: 0,
        recommendation: 'insufficient_data'
      };
    }

    const estimatedSalePrice = ebayStats.average;
    const purchasePrice = instagramPrice;
    
    // Account for eBay fees (approximately 13%)
    const ebayFees = estimatedSalePrice * 0.13;
    const netProfit = estimatedSalePrice - ebayFees - purchasePrice;
    const roi = (netProfit / purchasePrice) * 100;

    let recommendation = 'hold';
    if (roi >= 50 && ebayStats.confidence >= 0.6) {
      recommendation = 'strong_buy';
    } else if (roi >= 25 && ebayStats.confidence >= 0.5) {
      recommendation = 'buy';
    } else if (roi >= 10) {
      recommendation = 'consider';
    } else if (roi < 0) {
      recommendation = 'avoid';
    }

    return {
      profitable: netProfit > 0,
      profit: netProfit,
      roi: roi,
      estimatedSalePrice,
      ebayFees,
      confidence: ebayStats.confidence,
      recommendation,
      sampleSize: ebayStats.count
    };
  }

  /**
   * Rank opportunities by profitability
   */
  rankOpportunities(opportunities) {
    return opportunities
      .filter(opp => opp.analysis && opp.analysis.profitable)
      .sort((a, b) => {
        // Sort by ROI * confidence score
        const scoreA = a.analysis.roi * a.analysis.confidence;
        const scoreB = b.analysis.roi * b.analysis.confidence;
        return scoreB - scoreA;
      });
  }
}

// Initialize services
const instagramScraper = new InstagramScraper();
const ebayScraper = new EbayScraper();
const profitAnalyzer = new ProfitAnalyzer();

/**
 * API Endpoints
 */

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'gem-scraper-service',
    timestamp: new Date().toISOString(),
    cache: {
      instagram: instagramCache.keys().length,
      ebay: ebayCache.keys().length
    }
  });
});

// Scrape Instagram user
app.get('/api/instagram/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    
    const posts = await instagramScraper.scrapeUserPosts(username, limit);
    
    res.json({
      success: true,
      username,
      count: posts.length,
      posts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Scrape Instagram hashtag
app.get('/api/instagram/hashtag/:hashtag', async (req, res) => {
  try {
    const { hashtag } = req.params;
    const limit = parseInt(req.query.limit) || 30;
    
    const posts = await instagramScraper.scrapeHashtag(hashtag, limit);
    
    res.json({
      success: true,
      hashtag,
      count: posts.length,
      posts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get eBay sold listings
app.get('/api/ebay/sold', async (req, res) => {
  try {
    const { query, limit } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter required'
      });
    }
    
    const items = await ebayScraper.getSoldListings(query, parseInt(limit) || 50);
    
    res.json({
      success: true,
      query,
      count: items.length,
      items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Full profit analysis
app.post('/api/analyze', async (req, res) => {
  try {
    const { stone_name, price_value, weight_ct, source } = req.body;
    
    if (!stone_name || !price_value || !weight_ct) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: stone_name, price_value, weight_ct'
      });
    }

    // Get eBay data
    const query = `${stone_name} gemstone ${weight_ct}ct`;
    const ebayItems = await ebayScraper.getSoldListings(query, 50);
    const ebayStats = ebayScraper.calculateStats(ebayItems, weight_ct);
    
    // Analyze profit
    const analysis = profitAnalyzer.analyze(price_value, ebayStats, weight_ct);
    
    res.json({
      success: true,
      stone: {
        stone_name,
        price_value,
        weight_ct,
        source
      },
      ebay: ebayStats,
      analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Automated discovery - scan Instagram for profitable stones
app.post('/api/discover', async (req, res) => {
  try {
    const { usernames = [], hashtags = [] } = req.body;
    
    let allPosts = [];
    
    // Scrape specified usernames
    for (const username of usernames) {
      const posts = await instagramScraper.scrapeUserPosts(username, 20);
      allPosts = allPosts.concat(posts);
    }
    
    // Scrape specified hashtags
    for (const hashtag of hashtags) {
      const posts = await instagramScraper.scrapeHashtag(hashtag, 30);
      allPosts = allPosts.concat(posts);
    }
    
    console.log(`[Discover] Found ${allPosts.length} total posts`);
    
    // Analyze each post
    const opportunities = [];
    
    for (const post of allPosts) {
      if (!post.stone_name || !post.price_value || !post.weight_ct) continue;
      
      const query = `${post.stone_name} gemstone ${post.weight_ct}ct`;
      const ebayItems = await ebayScraper.getSoldListings(query, 50);
      const ebayStats = ebayScraper.calculateStats(ebayItems, post.weight_ct);
      const analysis = profitAnalyzer.analyze(post.price_value, ebayStats, post.weight_ct);
      
      opportunities.push({
        post,
        ebayStats,
        analysis
      });
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Rank by profitability
    const ranked = profitAnalyzer.rankOpportunities(opportunities);
    
    res.json({
      success: true,
      total_scanned: allPosts.length,
      opportunities: ranked.length,
      top_opportunities: ranked.slice(0, 10)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Clear cache
app.post('/api/cache/clear', (req, res) => {
  const igKeys = instagramCache.keys().length;
  const ebayKeys = ebayCache.keys().length;
  
  instagramCache.flushAll();
  ebayCache.flushAll();
  
  res.json({
    success: true,
    message: 'Cache cleared',
    cleared: {
      instagram: igKeys,
      ebay: ebayKeys
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🔍 Gem Scraper Service running on port ${PORT}`);
  console.log(`📸 Instagram API: ${RAPIDAPI_KEY ? 'Configured' : 'Using mock data'}`);
  console.log(`🛒 eBay API: ${EBAY_APP_ID ? 'Configured' : 'Using fallback scraping'}`);
  console.log(`\nEndpoints:`);
  console.log(`  GET  /health`);
  console.log(`  GET  /api/instagram/user/:username`);
  console.log(`  GET  /api/instagram/hashtag/:hashtag`);
  console.log(`  GET  /api/ebay/sold?query=...`);
  console.log(`  POST /api/analyze`);
  console.log(`  POST /api/discover`);
  console.log(`  POST /api/cache/clear\n`);
});

module.exports = app;
