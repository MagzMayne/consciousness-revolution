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
 * File: kas-sdk.js
 * Declaration ID: IP-92FC56D-MLL28ZWF
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * KAS SDK - Client library for Key Authority Service
 * 
 * Provides a simple API for agents to request and use authentication tokens
 * Features:
 * - Automatic token caching
 * - Token refresh before expiration
 * - Retry logic with exponential backoff
 * - Error handling
 * - Browser and Node.js compatible
 */

class KASSDK {
    constructor(options = {}) {
        this.baseUrl = options.baseUrl || 'http://localhost:3010';
        this.agentId = options.agentId || null;
        this.apiKey = options.apiKey || null;
        this.tokenCache = new Map(); // endpoint -> { token, expiresAt }
        this.refreshThreshold = options.refreshThreshold || 30; // Refresh 30s before expiry
        this.maxRetries = options.maxRetries || 3;
        this.retryDelay = options.retryDelay || 1000; // ms
        this.debug = options.debug || false;
    }

    /**
     * Log debug messages
     */
    log(...args) {
        if (this.debug) {
            console.log('[KAS SDK]', ...args);
        }
    }

    /**
     * Make HTTP request with retry logic
     */
    async request(endpoint, options = {}, retryCount = 0) {
        try {
            const url = `${this.baseUrl}${endpoint}`;
            
            const fetchOptions = {
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            };

            if (options.body) {
                fetchOptions.body = JSON.stringify(options.body);
            }

            this.log(`Request: ${options.method || 'GET'} ${url}`);

            const response = await fetch(url, fetchOptions);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || `HTTP ${response.status}`);
            }

            return data;

        } catch (error) {
            // Retry on network errors or 5xx errors
            if (retryCount < this.maxRetries && 
                (error.message.includes('fetch') || error.message.includes('network'))) {
                
                const delay = this.retryDelay * Math.pow(2, retryCount);
                this.log(`Retry ${retryCount + 1}/${this.maxRetries} after ${delay}ms`);
                
                await this.sleep(delay);
                return this.request(endpoint, options, retryCount + 1);
            }

            throw error;
        }
    }

    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Create API key for an agent
     */
    async createApiKey(agentId) {
        try {
            const response = await this.request('/api/create-key', {
                method: 'POST',
                body: { agentId }
            });

            this.log(`API key created for agent: ${agentId}`);
            return response;

        } catch (error) {
            console.error('Failed to create API key:', error);
            throw new Error(`Failed to create API key: ${error.message}`);
        }
    }

    /**
     * Create single-use token for an endpoint
     */
    async createToken(agentId, endpoint, options = {}) {
        try {
            const ttlSeconds = options.ttl || 60;
            const payloadHash = options.payloadHash || null;

            const response = await this.request('/api/create-token', {
                method: 'POST',
                body: {
                    agentId,
                    endpoint,
                    ttlSeconds,
                    payloadHash
                }
            });

            this.log(`Token created for endpoint: ${endpoint}, expires in ${ttlSeconds}s`);
            
            // Cache the token
            this.cacheToken(endpoint, response.token, response.expiresAt);

            return response;

        } catch (error) {
            console.error('Failed to create token:', error);
            throw new Error(`Failed to create token: ${error.message}`);
        }
    }

    /**
     * Get token for endpoint (with auto-refresh)
     */
    async getToken(endpoint, options = {}) {
        try {
            // Check if we have a cached valid token
            const cached = this.getCachedToken(endpoint);
            if (cached && this.isTokenValid(cached)) {
                this.log(`Using cached token for: ${endpoint}`);
                return cached.token;
            }

            // Create new token
            if (!this.agentId) {
                throw new Error('Agent ID is required. Set agentId in constructor or pass it in options.');
            }

            const agentId = options.agentId || this.agentId;
            const response = await this.createToken(agentId, endpoint, options);
            
            return response.token;

        } catch (error) {
            console.error('Failed to get token:', error);
            throw new Error(`Failed to get token: ${error.message}`);
        }
    }

    /**
     * Validate a token
     */
    async validateToken(token, endpoint, payloadHash = null) {
        try {
            const response = await this.request('/api/validate-token', {
                method: 'POST',
                body: {
                    token,
                    endpoint,
                    payloadHash
                }
            });

            this.log(`Token validated for endpoint: ${endpoint}`);
            
            // Remove from cache since it's now used
            this.tokenCache.delete(endpoint);

            return response;

        } catch (error) {
            console.error('Token validation failed:', error);
            throw new Error(`Token validation failed: ${error.message}`);
        }
    }

    /**
     * Invalidate a token
     */
    async invalidateToken(token) {
        try {
            const response = await this.request('/api/invalidate-token', {
                method: 'POST',
                body: { token }
            });

            this.log(`Token invalidated`);
            
            // Clear from cache
            for (const [endpoint, cached] of this.tokenCache.entries()) {
                if (cached.token === token) {
                    this.tokenCache.delete(endpoint);
                    break;
                }
            }

            return response;

        } catch (error) {
            console.error('Failed to invalidate token:', error);
            throw new Error(`Failed to invalidate token: ${error.message}`);
        }
    }

    /**
     * Make authenticated request to protected endpoint
     */
    async callProtectedEndpoint(endpoint, options = {}) {
        try {
            // Get token for this endpoint
            const token = await this.getToken(endpoint, options);

            // Make request with token
            const url = options.url || endpoint;
            const fetchOptions = {
                method: options.method || 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            };

            if (options.body) {
                fetchOptions.body = JSON.stringify(options.body);
            }

            this.log(`Calling protected endpoint: ${url}`);

            const response = await fetch(url, fetchOptions);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || `HTTP ${response.status}`);
            }

            return data;

        } catch (error) {
            console.error('Protected endpoint call failed:', error);
            throw new Error(`Protected endpoint call failed: ${error.message}`);
        }
    }

    /**
     * Cache token for endpoint
     */
    cacheToken(endpoint, token, expiresAt) {
        this.tokenCache.set(endpoint, {
            token,
            expiresAt,
            cachedAt: Math.floor(Date.now() / 1000)
        });
    }

    /**
     * Get cached token for endpoint
     */
    getCachedToken(endpoint) {
        return this.tokenCache.get(endpoint) || null;
    }

    /**
     * Check if cached token is still valid
     */
    isTokenValid(cached) {
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = cached.expiresAt - now;
        
        // Token is valid if it hasn't expired and has more than threshold seconds left
        return timeUntilExpiry > this.refreshThreshold;
    }

    /**
     * Clear token cache
     */
    clearCache() {
        this.tokenCache.clear();
        this.log('Token cache cleared');
    }

    /**
     * Get cache stats
     */
    getCacheStats() {
        return {
            size: this.tokenCache.size,
            tokens: Array.from(this.tokenCache.entries()).map(([endpoint, cached]) => ({
                endpoint,
                expiresAt: cached.expiresAt,
                validFor: cached.expiresAt - Math.floor(Date.now() / 1000)
            }))
        };
    }

    /**
     * Health check
     */
    async healthCheck() {
        try {
            const response = await this.request('/health');
            this.log('Health check passed');
            return response;
        } catch (error) {
            console.error('Health check failed:', error);
            throw new Error(`Health check failed: ${error.message}`);
        }
    }

    /**
     * List API keys
     */
    async listApiKeys() {
        try {
            return await this.request('/api/list-keys');
        } catch (error) {
            console.error('Failed to list API keys:', error);
            throw new Error(`Failed to list API keys: ${error.message}`);
        }
    }

    /**
     * List tokens
     */
    async listTokens() {
        try {
            return await this.request('/api/list-tokens');
        } catch (error) {
            console.error('Failed to list tokens:', error);
            throw new Error(`Failed to list tokens: ${error.message}`);
        }
    }
}

/**
 * Create a convenience singleton instance
 */
let defaultInstance = null;

function createKASSDK(options) {
    return new KASSDK(options);
}

function getDefaultKASSDK(options) {
    if (!defaultInstance) {
        defaultInstance = new KASSDK(options);
    }
    return defaultInstance;
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    // Node.js
    module.exports = {
        KASSDK,
        createKASSDK,
        getDefaultKASSDK
    };
} else if (typeof window !== 'undefined') {
    // Browser
    window.KASSDK = KASSDK;
    window.createKASSDK = createKASSDK;
    window.getDefaultKASSDK = getDefaultKASSDK;
}
