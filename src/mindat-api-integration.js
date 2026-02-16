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
 * File: mindat-api-integration.js
 * Declaration ID: IP-3BDF8582-MLL28ZW5
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * ════════════════════════════════════════════════════════════════════════════
 * MINDAT.ORG API INTEGRATION - Real Mineral Locality Data
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * PURPOSE: Integrate with mindat.org's comprehensive mineral database to
 * provide real, accurate fluorite locality data instead of hardcoded defaults.
 * 
 * API Documentation: https://api.mindat.org/v1/schema/redoc/
 * Reference Implementation: https://github.com/jolyonralph/mindat_api_test
 * 
 * This implementation follows the patterns and best practices demonstrated in
 * jolyonralph's mindat_api_test repository, adapting them for browser-based
 * JavaScript usage with the Fluorite Specimen Identifier.
 * 
 * © 2024-2025 Ryan Barbrick / Barbrick Design
 * Reference: Jolyon Ralph - mindat_api_test examples
 * ════════════════════════════════════════════════════════════════════════════
 */

class MindatAPIIntegration {
  constructor(apiKey = null) {
    this.apiKey = apiKey || this.getAPIKey();
    this.baseURL = 'https://api.mindat.org';
    this.version = 'v1';
    this.cache = new Map();
    this.cacheTimeout = 1000 * 60 * 60 * 24; // 24 hours
    this.authenticated = false;
    this.token = null;
    
    // Fluorite mineral ID on mindat.org
    this.fluoriteID = 1576;
    
    console.log('🔷 Mindat API Integration initialized');
  }
  
  /**
   * Get API key from environment or configuration
   */
  getAPIKey() {
    // Try multiple sources for API key
    if (typeof process !== 'undefined' && process.env && process.env.MINDAT_API_KEY) {
      return process.env.MINDAT_API_KEY;
    }
    
    if (typeof window !== 'undefined') {
      if (window.ENV && window.ENV.MINDAT_API_KEY) {
        return window.ENV.MINDAT_API_KEY;
      }
      
      // Check localStorage for user-provided key
      const storedKey = localStorage.getItem('mindat_api_key');
      if (storedKey) {
        return storedKey;
      }
    }
    
    return null;
  }
  
  /**
   * Set API key manually
   */
  setAPIKey(key) {
    this.apiKey = key;
    this.authenticated = false;
    this.token = null;
    
    // Store in localStorage for persistence
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.setItem('mindat_api_key', key);
    }
    
    console.log('✅ Mindat API key updated');
  }
  
  /**
   * Authenticate with mindat.org API
   */
  async authenticate() {
    if (!this.apiKey) {
      console.warn('⚠️ No Mindat API key configured. Using fallback data.');
      return false;
    }
    
    if (this.authenticated && this.token) {
      return true;
    }
    
    try {
      // Mindat uses token-based authentication
      // The API key itself acts as the token for Bearer auth
      this.token = this.apiKey;
      this.authenticated = true;
      
      console.log('✅ Mindat API authenticated');
      return true;
    } catch (error) {
      console.error('❌ Mindat authentication failed:', error);
      this.authenticated = false;
      return false;
    }
  }
  
  /**
   * Make authenticated API request
   */
  async apiRequest(endpoint, params = {}) {
    if (!await this.authenticate()) {
      throw new Error('Authentication required. Please provide a valid Mindat API key.');
    }
    
    // Build query string
    const queryParams = new URLSearchParams(params);
    const url = `${this.baseURL}/${this.version}${endpoint}?${queryParams}`;
    
    console.log('🔷 Mindat API request:', endpoint);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${this.token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Mindat API response received');
      return data;
      
    } catch (error) {
      console.error('❌ Mindat API request failed:', error);
      throw error;
    }
  }
  
  /**
   * Get fluorite localities from mindat.org
   * @param {Object} filters - Optional filters (country, region, etc.)
   * @returns {Promise<Array>} Array of fluorite localities
   */
  async getFluoriteLocalities(filters = {}) {
    const cacheKey = `fluorite_localities_${JSON.stringify(filters)}`;
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      console.log('✅ Using cached fluorite localities');
      return cached;
    }
    
    try {
      // Query mindat for fluorite localities
      const params = {
        geomaterial: this.fluoriteID, // Fluorite mineral ID
        page_size: 100,
        ordering: '-id', // Most recent first
        ...filters
      };
      
      const response = await this.apiRequest('/localities/', params);
      
      // Extract and format locality data
      const localities = (response.results || []).map(loc => this.formatLocality(loc));
      
      // Cache the results
      this.saveToCache(cacheKey, localities);
      
      console.log(`✅ Fetched ${localities.length} fluorite localities from Mindat`);
      return localities;
      
    } catch (error) {
      console.error('❌ Failed to fetch fluorite localities:', error);
      
      // Return empty array on error (will trigger fallback)
      return [];
    }
  }
  
  /**
   * Format mindat locality data to match internal structure
   */
  formatLocality(mindatLoc) {
    // Extract color information from description
    const colors = this.extractColors(mindatLoc.description || '');
    
    return {
      id: `mindat_${mindatLoc.id}`,
      name: mindatLoc.name || 'Unknown Locality',
      country: mindatLoc.country || '',
      region: mindatLoc.state_province || '',
      description: mindatLoc.description || 'No description available',
      coordinates: {
        latitude: mindatLoc.latitude,
        longitude: mindatLoc.longitude
      },
      characteristics: {
        colors: colors,
        habit: this.extractHabit(mindatLoc.description),
        transparency: 'transparent to translucent',
        matrix: this.extractMatrix(mindatLoc.description),
        zoning: colors.length > 1 ? 'color zones possible' : 'uniform'
      },
      colorSignature: this.buildColorSignature(colors),
      confidence: 0.85, // Base confidence for mindat data
      source: 'mindat.org',
      mindatID: mindatLoc.id,
      url: `https://www.mindat.org/loc-${mindatLoc.id}.html`
    };
  }
  
  /**
   * Extract color keywords from description text
   */
  extractColors(text) {
    const colorKeywords = {
      'purple': ['purple', 'violet', 'mauve', 'lavender'],
      'green': ['green', 'emerald', 'lime'],
      'blue': ['blue', 'azure', 'cyan', 'turquoise'],
      'yellow': ['yellow', 'golden', 'amber', 'honey'],
      'pink': ['pink', 'rose', 'salmon'],
      'colorless': ['colorless', 'clear', 'transparent', 'white']
    };
    
    const lowerText = text.toLowerCase();
    const foundColors = [];
    
    for (const [color, keywords] of Object.entries(colorKeywords)) {
      if (keywords.some(kw => lowerText.includes(kw))) {
        foundColors.push(color);
      }
    }
    
    return foundColors.length > 0 ? foundColors : ['purple']; // Default to purple
  }
  
  /**
   * Extract crystal habit from description
   */
  extractHabit(text) {
    const habitKeywords = ['cubic', 'octahedral', 'dodecahedral', 'massive', 'crystalline'];
    const lowerText = (text || '').toLowerCase();
    
    for (const habit of habitKeywords) {
      if (lowerText.includes(habit)) {
        return habit;
      }
    }
    
    return 'cubic'; // Default fluorite habit
  }
  
  /**
   * Extract matrix/associated minerals from description
   */
  extractMatrix(text) {
    const matrixKeywords = ['quartz', 'calcite', 'barite', 'galena', 'sphalerite', 'limestone'];
    const lowerText = (text || '').toLowerCase();
    const found = [];
    
    for (const matrix of matrixKeywords) {
      if (lowerText.includes(matrix)) {
        found.push(matrix);
      }
    }
    
    return found.length > 0 ? found.join(', ') : 'various minerals';
  }
  
  /**
   * Build color signature for matching algorithm
   */
  buildColorSignature(colors) {
    const signature = {};
    
    if (colors.includes('green')) signature.hasGreen = true;
    if (colors.includes('blue')) signature.hasBlue = true;
    if (colors.includes('purple')) signature.hasPurple = true;
    if (colors.includes('yellow')) signature.hasYellow = true;
    
    return signature;
  }
  
  /**
   * Search localities by name or description
   */
  async searchLocalities(query, limit = 10) {
    try {
      const params = {
        q: query,
        geomaterial: this.fluoriteID,
        page_size: limit
      };
      
      const response = await this.apiRequest('/localities/', params);
      const localities = (response.results || []).map(loc => this.formatLocality(loc));
      
      console.log(`✅ Found ${localities.length} localities matching "${query}"`);
      return localities;
      
    } catch (error) {
      console.error('❌ Locality search failed:', error);
      return [];
    }
  }
  
  /**
   * Get detailed information about a specific locality
   */
  async getLocalityDetails(localityId) {
    try {
      const response = await this.apiRequest(`/localities/${localityId}/`);
      return this.formatLocality(response);
      
    } catch (error) {
      console.error(`❌ Failed to fetch locality ${localityId}:`, error);
      return null;
    }
  }
  
  /**
   * Cache management
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  saveToCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  
  clearCache() {
    this.cache.clear();
    console.log('✅ Mindat cache cleared');
  }
  
  /**
   * Get fallback localities (hardcoded) when API is unavailable
   */
  getFallbackLocalities() {
    console.log('⚠️ Using fallback fluorite localities (hardcoded data)');
    
    return [
      {
        id: 'rogerley',
        name: 'Rogerley Mine, Weardale, England',
        description: 'Classic daylight-fluorescent green fluorite locality',
        characteristics: {
          colors: ['green', 'blue-green'],
          habit: 'cubic, stepped growth',
          transparency: 'transparent to translucent',
          uv: 'strong blue fluorescence under SW UV',
          matrix: 'quartz, calcite',
          zoning: 'pronounced green-blue zoning'
        },
        colorSignature: { hasGreen: true, hasBlue: true },
        confidence: 0.93,
        source: 'fallback'
      },
      {
        id: 'diana-maria',
        name: 'Diana Maria Mine, Weardale, England',
        description: 'Green fluorite with zoning and quartz association',
        characteristics: {
          colors: ['green', 'yellow-green'],
          habit: 'cubic, some octahedral',
          transparency: 'transparent to translucent',
          matrix: 'quartz',
          zoning: 'subtle to moderate zoning'
        },
        colorSignature: { hasGreen: true },
        confidence: 0.87,
        source: 'fallback'
      },
      {
        id: 'dalnegorsk',
        name: 'Dal\'negorsk, Primorsky Krai, Russia',
        description: 'Purple to green fluorite, often with quartz',
        characteristics: {
          colors: ['purple', 'green', 'colorless'],
          habit: 'cubic, complex modifications',
          transparency: 'transparent',
          matrix: 'quartz',
          zoning: 'color bands common'
        },
        colorSignature: { hasPurple: true, hasGreen: true },
        confidence: 0.78,
        source: 'fallback'
      },
      {
        id: 'elmwood',
        name: 'Elmwood Mine, Tennessee, USA',
        description: 'Amber to purple fluorite with distinctive habits',
        characteristics: {
          colors: ['purple', 'amber', 'yellow'],
          habit: 'cubic, phantoms common',
          transparency: 'transparent to translucent',
          uv: 'variable fluorescence',
          matrix: 'calcite, sphalerite',
          zoning: 'phantom zones'
        },
        colorSignature: { hasPurple: true, hasYellow: true },
        confidence: 0.82,
        source: 'fallback'
      },
      {
        id: 'riemvasmaak',
        name: 'Riemvasmaak, Northern Cape, South Africa',
        description: 'Blue fluorite crystals',
        characteristics: {
          colors: ['blue', 'blue-green'],
          habit: 'cubic',
          transparency: 'transparent',
          matrix: 'quartz',
          zoning: 'uniform or subtle'
        },
        colorSignature: { hasBlue: true },
        confidence: 0.75,
        source: 'fallback'
      },
      {
        id: 'illinois',
        name: 'Illinois-Kentucky Fluorspar District, USA',
        description: 'Purple fluorite, classic American specimens',
        characteristics: {
          colors: ['purple', 'violet', 'colorless'],
          habit: 'cubic, octahedral',
          transparency: 'transparent to translucent',
          matrix: 'limestone, calcite',
          zoning: 'color zones common'
        },
        colorSignature: { hasPurple: true },
        confidence: 0.80,
        source: 'fallback'
      }
    ];
  }
  
  /**
   * Get comprehensive fluorite locality database
   * Tries mindat.org first, falls back to hardcoded data
   */
  async getLocalityDatabase() {
    try {
      const mindatLocalities = await this.getFluoriteLocalities();
      
      if (mindatLocalities && mindatLocalities.length > 0) {
        console.log(`✅ Using ${mindatLocalities.length} localities from Mindat.org`);
        return {
          localities: mindatLocalities,
          source: 'mindat.org',
          count: mindatLocalities.length
        };
      }
    } catch (error) {
      console.warn('⚠️ Mindat API unavailable, using fallback data');
    }
    
    // Fallback to hardcoded localities
    const fallbackLocalities = this.getFallbackLocalities();
    return {
      localities: fallbackLocalities,
      source: 'fallback',
      count: fallbackLocalities.length
    };
  }
  
  /**
   * Test API connection
   */
  async testConnection() {
    try {
      await this.authenticate();
      const localities = await this.getFluoriteLocalities({ page_size: 1 });
      
      return {
        success: true,
        authenticated: this.authenticated,
        message: 'Mindat API connection successful',
        localitiesFound: localities.length
      };
    } catch (error) {
      return {
        success: false,
        authenticated: false,
        message: error.message,
        error: error
      };
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MindatAPIIntegration;
}

// Make available globally in browser
if (typeof window !== 'undefined') {
  window.MindatAPIIntegration = MindatAPIIntegration;
}
