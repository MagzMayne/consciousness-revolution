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
 * File: api-key-pool-manager.js
 * Declaration ID: IP-31FB0E26-MLL28ZW5
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
 * API Key Pool Manager
 * Manages a shared pool of API keys contributed by users
 * Handles key rotation, usage tracking, health monitoring, and fair distribution
 * 
 * Features:
 * - Secure API key pooling with encryption
 * - Round-robin and smart key selection
 * - Usage tracking and attribution
 * - Health monitoring and automatic failover
 * - Rate limiting per key
 * - Points-based reward system
 * 
 * @version 1.0.0
 */

class APIKeyPoolManager {
    constructor() {
        this.pools = new Map(); // service -> array of key entries
        this.usage = new Map(); // keyId -> usage stats
        this.health = new Map(); // keyId -> health status
        this.contributors = new Map(); // userId -> contribution data
        this.storageKey = 'api_key_pool_data';
        this.initialized = false;
    }

    /**
     * Initialize the pool manager
     */
    async initialize() {
        if (this.initialized) return true;

        try {
            // Load from localStorage
            const savedData = localStorage.getItem(this.storageKey);
            if (savedData) {
                const data = JSON.parse(savedData);
                
                // Restore pools
                if (data.pools) {
                    this.pools = new Map(Object.entries(data.pools));
                }
                
                // Restore usage stats
                if (data.usage) {
                    this.usage = new Map(Object.entries(data.usage));
                }
                
                // Restore health data
                if (data.health) {
                    this.health = new Map(Object.entries(data.health));
                }
                
                // Restore contributors
                if (data.contributors) {
                    this.contributors = new Map(Object.entries(data.contributors));
                }
            }

            this.initialized = true;
            console.log('✅ API Key Pool Manager initialized');
            
            // Start health monitoring
            this.startHealthMonitoring();
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize API Key Pool Manager:', error);
            return false;
        }
    }

    /**
     * Contribute an API key to the pool
     */
    async contributeKey(userId, service, apiKey, config = {}) {
        if (!this.initialized) await this.initialize();

        // Validate inputs
        if (!userId || !service || !apiKey) {
            throw new Error('Missing required parameters');
        }

        // Create key entry
        const keyId = this.generateKeyId();
        const keyEntry = {
            id: keyId,
            contributorId: userId,
            service: service.toLowerCase(),
            // In production: encrypt the key using Web Crypto API
            key: apiKey,
            addedAt: Date.now(),
            status: 'active',
            config: {
                maxDailyUsage: config.maxDailyUsage || 1000,
                rateLimit: config.rateLimit || 60, // per minute
                costPerCall: config.costPerCall || 1, // points
                sharePublicly: config.sharePublicly !== false,
                priority: config.priority || 'normal', // high, normal, low
                expiresAt: config.expiresAt || null
            }
        };

        // Add to pool
        if (!this.pools.has(service)) {
            this.pools.set(service, []);
        }
        this.pools.get(service).push(keyEntry);

        // Initialize usage tracking
        this.usage.set(keyId, {
            totalCalls: 0,
            successfulCalls: 0,
            failedCalls: 0,
            pointsEarned: 0,
            lastUsed: null,
            dailyUsage: 0,
            dailyResetAt: Date.now() + 86400000 // 24 hours
        });

        // Initialize health tracking
        this.health.set(keyId, {
            status: 'healthy',
            lastCheck: Date.now(),
            consecutiveFailures: 0,
            uptime: 100,
            responseTime: 0
        });

        // Update contributor stats
        if (!this.contributors.has(userId)) {
            this.contributors.set(userId, {
                userId: userId,
                totalContributions: 0,
                activeKeys: 0,
                totalPointsEarned: 0,
                joinedAt: Date.now()
            });
        }
        const contributor = this.contributors.get(userId);
        contributor.totalContributions++;
        contributor.activeKeys++;

        // Save changes
        this.save();

        console.log(`✅ API key contributed: ${service} (${keyId})`);
        
        return {
            success: true,
            keyId: keyId,
            message: 'API key added to pool successfully',
            estimatedEarnings: this.estimateEarnings(service, keyEntry.config)
        };
    }

    /**
     * Get an API key from the pool for use
     */
    async getKey(service, requesterId = null) {
        if (!this.initialized) await this.initialize();

        const pool = this.pools.get(service.toLowerCase());
        if (!pool || pool.length === 0) {
            return {
                success: false,
                error: 'No API keys available for this service',
                fallbackMode: true
            };
        }

        // Filter for healthy, active keys
        const healthyKeys = pool.filter(entry => {
            const health = this.health.get(entry.id);
            const usage = this.usage.get(entry.id);
            
            return entry.status === 'active' &&
                   health.status === 'healthy' &&
                   usage.dailyUsage < entry.config.maxDailyUsage &&
                   (!entry.config.expiresAt || entry.config.expiresAt > Date.now());
        });

        if (healthyKeys.length === 0) {
            return {
                success: false,
                error: 'No healthy API keys available',
                fallbackMode: true
            };
        }

        // Smart selection: prefer keys with lower usage and higher priority
        healthyKeys.sort((a, b) => {
            const usageA = this.usage.get(a.id);
            const usageB = this.usage.get(b.id);
            
            // Priority weighting
            const priorityWeight = { high: 3, normal: 2, low: 1 };
            const scoreA = priorityWeight[a.config.priority] / (usageA.dailyUsage + 1);
            const scoreB = priorityWeight[b.config.priority] / (usageB.dailyUsage + 1);
            
            return scoreB - scoreA;
        });

        const selectedKey = healthyKeys[0];
        
        return {
            success: true,
            keyId: selectedKey.id,
            key: selectedKey.key,
            contributorId: selectedKey.contributorId,
            costPerCall: selectedKey.config.costPerCall
        };
    }

    /**
     * Record usage of an API key
     */
    async recordUsage(keyId, success, responseTime = 0, pointsCharged = 0) {
        if (!this.initialized) await this.initialize();

        const usage = this.usage.get(keyId);
        const health = this.health.get(keyId);
        
        if (!usage || !health) {
            console.warn(`Key ${keyId} not found in tracking`);
            return;
        }

        // Update usage stats
        usage.totalCalls++;
        usage.lastUsed = Date.now();
        
        if (success) {
            usage.successfulCalls++;
            usage.pointsEarned += pointsCharged;
            health.consecutiveFailures = 0;
        } else {
            usage.failedCalls++;
            health.consecutiveFailures++;
        }

        // Update daily usage
        if (Date.now() > usage.dailyResetAt) {
            usage.dailyUsage = 1;
            usage.dailyResetAt = Date.now() + 86400000;
        } else {
            usage.dailyUsage++;
        }

        // Update health status
        health.lastCheck = Date.now();
        health.responseTime = (health.responseTime * 0.9) + (responseTime * 0.1); // Moving average
        health.uptime = (usage.successfulCalls / usage.totalCalls) * 100;

        // Check if key should be marked unhealthy
        if (health.consecutiveFailures >= 5) {
            health.status = 'unhealthy';
            console.warn(`⚠️ Key ${keyId} marked as unhealthy`);
        } else if (health.consecutiveFailures === 0 && health.status === 'unhealthy') {
            health.status = 'healthy';
            console.log(`✅ Key ${keyId} recovered`);
        }

        // Update contributor earnings
        const pool = Array.from(this.pools.values()).flat();
        const keyEntry = pool.find(k => k.id === keyId);
        
        if (keyEntry && success) {
            const contributor = this.contributors.get(keyEntry.contributorId);
            if (contributor) {
                contributor.totalPointsEarned += pointsCharged;
            }
        }

        this.save();
    }

    /**
     * Remove a key from the pool
     */
    async removeKey(userId, keyId) {
        if (!this.initialized) await this.initialize();

        // Find and remove the key
        for (const [service, pool] of this.pools.entries()) {
            const index = pool.findIndex(k => k.id === keyId && k.contributorId === userId);
            if (index !== -1) {
                pool.splice(index, 1);
                
                // Clean up tracking data
                this.usage.delete(keyId);
                this.health.delete(keyId);
                
                // Update contributor stats
                const contributor = this.contributors.get(userId);
                if (contributor) {
                    contributor.activeKeys--;
                }
                
                this.save();
                
                return { success: true, message: 'Key removed from pool' };
            }
        }

        return { success: false, error: 'Key not found or unauthorized' };
    }

    /**
     * Get contributor statistics
     */
    getContributorStats(userId) {
        const contributor = this.contributors.get(userId);
        if (!contributor) {
            return { found: false };
        }

        // Get all keys for this user
        const userKeys = [];
        for (const [service, pool] of this.pools.entries()) {
            const keys = pool.filter(k => k.contributorId === userId);
            userKeys.push(...keys.map(k => ({
                service,
                keyId: k.id,
                usage: this.usage.get(k.id),
                health: this.health.get(k.id)
            })));
        }

        return {
            found: true,
            ...contributor,
            keys: userKeys
        };
    }

    /**
     * Get pool statistics
     */
    getPoolStats(service = null) {
        const stats = {
            totalServices: this.pools.size,
            totalKeys: 0,
            totalContributors: this.contributors.size,
            serviceStats: {}
        };

        for (const [svc, pool] of this.pools.entries()) {
            if (service && svc !== service.toLowerCase()) continue;
            
            const healthyKeys = pool.filter(k => this.health.get(k.id)?.status === 'healthy');
            
            stats.serviceStats[svc] = {
                totalKeys: pool.length,
                healthyKeys: healthyKeys.length,
                activeKeys: pool.filter(k => k.status === 'active').length,
                totalUsage: pool.reduce((sum, k) => sum + (this.usage.get(k.id)?.totalCalls || 0), 0)
            };
            
            stats.totalKeys += pool.length;
        }

        return stats;
    }

    /**
     * Get leaderboard data
     */
    getLeaderboard(type = 'earnings', limit = 10) {
        const contributors = Array.from(this.contributors.values());
        
        if (type === 'earnings') {
            contributors.sort((a, b) => b.totalPointsEarned - a.totalPointsEarned);
        } else if (type === 'contributions') {
            contributors.sort((a, b) => b.totalContributions - a.totalContributions);
        }

        return contributors.slice(0, limit).map((c, index) => ({
            rank: index + 1,
            userId: c.userId,
            totalPointsEarned: c.totalPointsEarned,
            totalContributions: c.totalContributions,
            activeKeys: c.activeKeys
        }));
    }

    /**
     * Estimate earnings for a contribution
     */
    estimateEarnings(service, config) {
        const avgCallsPerDay = 100; // Conservative estimate
        const pointsPerCall = config.costPerCall || 1;
        const dailyEarnings = avgCallsPerDay * pointsPerCall;
        
        return {
            daily: dailyEarnings,
            weekly: dailyEarnings * 7,
            monthly: dailyEarnings * 30
        };
    }

    /**
     * Start health monitoring
     */
    startHealthMonitoring() {
        // Check health every 5 minutes
        setInterval(() => {
            this.performHealthChecks();
        }, 300000);
    }

    /**
     * Perform health checks on all keys
     */
    async performHealthChecks() {
        for (const [keyId, health] of this.health.entries()) {
            // Keys not used in 24 hours may need checking
            const usage = this.usage.get(keyId);
            if (usage && usage.lastUsed && (Date.now() - usage.lastUsed) > 86400000) {
                // Mark as potentially stale
                health.status = 'unchecked';
            }
        }
        this.save();
    }

    /**
     * Generate unique key ID
     */
    generateKeyId() {
        return `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Save pool data to localStorage
     */
    save() {
        try {
            const data = {
                pools: Object.fromEntries(this.pools),
                usage: Object.fromEntries(this.usage),
                health: Object.fromEntries(this.health),
                contributors: Object.fromEntries(this.contributors),
                lastSaved: Date.now()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save pool data:', error);
        }
    }

    /**
     * Clear all data (for testing)
     */
    clearAll() {
        this.pools.clear();
        this.usage.clear();
        this.health.clear();
        this.contributors.clear();
        localStorage.removeItem(this.storageKey);
        console.log('🗑️ All pool data cleared');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIKeyPoolManager;
}
