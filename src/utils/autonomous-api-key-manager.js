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
 * File: autonomous-api-key-manager.js
 * Declaration ID: IP-6B2050E8-MLL28ZWD
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
 * AUTONOMOUS API KEY MANAGER
 * 
 * Fully autonomous API key management system with intelligent sourcing,
 * automatic retry, fallback mechanisms, and self-healing capabilities.
 * 
 * Features:
 * - Multiple sourcing strategies (environment, storage, pool, known keys)
 * - Automatic validation and health checking
 * - Exponential backoff retry with jitter
 * - Smart fallback chain with automatic rotation
 * - Self-healing on failures
 * - Zero-configuration operation
 * 
 * @author BarbrickDesign Platform Team
 * @version 1.0.0
 */

class AutonomousAPIKeyManager {
    constructor() {
        // Lazy-load dependencies
        this._validator = null;
        this._poolManager = null;
        this._knownKeysRegistry = null;
        this._connectionManager = null;
        this._centralizedConfig = null;
        this._centralizedConfigLoaded = false;
        
        // Key sourcing strategies (in order of preference)
        this.sourcingStrategies = [
            'centralized_config',  // NEW: Centralized config keys (highest priority)
            'user_provided',      // Explicitly set by user
            'environment',        // Environment variables
            'session_storage',    // Session storage (temporary)
            'pool_shared',        // Shared API key pool
            'known_working',      // Known public/demo keys
            'fallback_mode'       // Degraded mode with limited functionality
        ];
        
        // Retry configuration
        this.retryConfig = {
            maxRetries: 5,
            baseDelayMs: 1000,
            maxDelayMs: 30000,
            backoffMultiplier: 2,
            jitterMs: 1000
        };
        
        // Active keys per service
        this.activeKeys = new Map(); // serviceId -> { key, strategy, lastValidated, failures }
        
        // Health tracking
        this.health = new Map(); // serviceId -> { status, lastCheck, consecutiveFailures, uptime }
        
        // Retry state
        this.retryState = new Map(); // requestId -> { attempt, nextRetryTime }
        
        // Feature flags
        this.features = {
            autoRetry: true,
            autoFallback: true,
            healthMonitoring: true,
            poolContribution: true,
            diagnostics: true
        };
        
        // Initialize centralized config and health monitoring
        this.loadCentralizedConfig();
        this.initializeHealthMonitoring();
    }
    
    /**
     * Get lazy-loaded dependencies
     */
    get validator() {
        if (!this._validator) {
            if (typeof window !== 'undefined' && window.ApiKeyValidator) {
                this._validator = new window.ApiKeyValidator();
            } else if (typeof require !== 'undefined') {
                try {
                    const ApiKeyValidator = require('./api-key-validator.js');
                    this._validator = new ApiKeyValidator();
                } catch (e) {
                    console.warn('ApiKeyValidator not available');
                }
            }
        }
        return this._validator;
    }
    
    get poolManager() {
        if (!this._poolManager) {
            if (typeof window !== 'undefined' && window.APIKeyPoolManager) {
                this._poolManager = new window.APIKeyPoolManager();
                this._poolManager.initialize().catch(e => 
                    console.warn('Failed to initialize pool manager:', e)
                );
            } else if (typeof require !== 'undefined') {
                try {
                    const APIKeyPoolManager = require('../pool/api-key-pool-manager.js');
                    this._poolManager = new APIKeyPoolManager();
                    this._poolManager.initialize().catch(e => 
                        console.warn('Failed to initialize pool manager:', e)
                    );
                } catch (e) {
                    console.warn('APIKeyPoolManager not available');
                }
            }
        }
        return this._poolManager;
    }
    
    get knownKeysRegistry() {
        if (!this._knownKeysRegistry) {
            if (typeof window !== 'undefined' && window.KnownWorkingKeysRegistry) {
                this._knownKeysRegistry = new window.KnownWorkingKeysRegistry();
            } else if (typeof require !== 'undefined') {
                try {
                    const KnownWorkingKeysRegistry = require('./known-working-keys-registry.js');
                    this._knownKeysRegistry = new KnownWorkingKeysRegistry();
                } catch (e) {
                    console.warn('KnownWorkingKeysRegistry not available');
                }
            }
        }
        return this._knownKeysRegistry;
    }
    
    /**
     * Get API key autonomously with retry and fallback
     * @param {string} serviceId - Service identifier (openai, samgov, etc.)
     * @param {object} options - Options
     * @returns {Promise<object>} - { success, key, strategy, error }
     */
    async getAPIKey(serviceId, options = {}) {
        const {
            forceRefresh = false,
            userId = null,
            requestContext = {},
            retryOnFailure = true
        } = options;
        
        // Check if we have a cached active key
        if (!forceRefresh && this.activeKeys.has(serviceId)) {
            const activeKey = this.activeKeys.get(serviceId);
            
            // Validate key hasn't expired or failed too many times
            if (this.isKeyValid(serviceId, activeKey)) {
                return {
                    success: true,
                    key: activeKey.key,
                    strategy: activeKey.strategy,
                    cached: true
                };
            } else {
                // Clear invalid key
                this.activeKeys.delete(serviceId);
            }
        }
        
        // Try each sourcing strategy in order
        for (const strategy of this.sourcingStrategies) {
            try {
                const result = await this.tryStrategy(serviceId, strategy, {
                    userId,
                    requestContext
                });
                
                if (result.success && result.key) {
                    // Validate the key
                    const validation = this.validateKey(serviceId, result.key, strategy);
                    
                    if (validation.valid) {
                        // Cache the key
                        this.cacheActiveKey(serviceId, result.key, strategy);
                        
                        // Record success
                        this.recordSuccess(serviceId);
                        
                        return {
                            success: true,
                            key: result.key,
                            strategy: strategy,
                            cached: false,
                            message: `API key sourced via ${strategy}`
                        };
                    } else {
                        console.warn(`Key from ${strategy} failed validation:`, validation.error);
                    }
                }
            } catch (error) {
                console.warn(`Strategy ${strategy} failed:`, error.message);
            }
        }
        
        // All strategies failed
        this.recordFailure(serviceId);
        
        // Return fallback mode if enabled
        if (this.features.autoFallback) {
            return {
                success: false,
                error: `No valid API key found for ${serviceId}`,
                fallbackMode: true,
                strategy: 'fallback_mode',
                guidance: this.getGuidance(serviceId)
            };
        }
        
        return {
            success: false,
            error: `Failed to source API key for ${serviceId}`,
            guidance: this.getGuidance(serviceId)
        };
    }
    
    /**
     * Try a specific sourcing strategy
     */
    async tryStrategy(serviceId, strategy, context = {}) {
        const { userId, requestContext } = context;
        
        switch (strategy) {
            case 'centralized_config':
                return await this.tryCentralizedConfigKey(serviceId);
            
            case 'user_provided':
                return this.tryUserProvidedKey(serviceId);
            
            case 'environment':
                return this.tryEnvironmentKey(serviceId);
            
            case 'session_storage':
                return this.trySessionStorageKey(serviceId);
            
            case 'pool_shared':
                return await this.tryPoolKey(serviceId, userId);
            
            case 'known_working':
                return this.tryKnownWorkingKey(serviceId);
            
            case 'fallback_mode':
                return this.tryFallbackMode(serviceId);
            
            default:
                return { success: false, error: `Unknown strategy: ${strategy}` };
        }
    }
    
    /**
     * Try centralized configuration keys
     */
    async tryCentralizedConfigKey(serviceId) {
        // Ensure config is loaded
        if (!this._centralizedConfigLoaded) {
            await this.loadCentralizedConfig();
        }
        
        if (!this._centralizedConfig || !this._centralizedConfig.services) {
            return { success: false };
        }
        
        const service = this._centralizedConfig.services[serviceId];
        if (!service || !service.enabled || !service.keys || service.keys.length === 0) {
            return { success: false };
        }
        
        // Get active keys sorted by priority
        const activeKeys = service.keys
            .filter(k => k.status === 'active' || k.status === 'limited')
            .sort((a, b) => a.priority - b.priority);
        
        if (activeKeys.length === 0) {
            return { success: false };
        }
        
        // Try the highest priority key
        const bestKey = activeKeys[0];
        if (bestKey.key && !this.isPlaceholder(bestKey.key)) {
            return {
                success: true,
                key: bestKey.key,
                keyInfo: bestKey,
                centralized: true
            };
        }
        
        return { success: false };
    }
    
    /**
     * Try user-provided key (explicit setApiKey call)
     */
    tryUserProvidedKey(serviceId) {
        const active = this.activeKeys.get(serviceId);
        if (active && active.strategy === 'user_provided') {
            return { success: true, key: active.key };
        }
        return { success: false };
    }
    
    /**
     * Try environment variable
     */
    tryEnvironmentKey(serviceId) {
        // Map service IDs to environment variable names
        const envVarMap = {
            'groq': 'GROQ_API_KEY',
            'openai': 'OPENAI_API_KEY',
            'anthropic': 'ANTHROPIC_API_KEY',
            'samgov': 'SAMGOV_API_KEY',
            'github': 'GITHUB_TOKEN',
            'etherscan': 'ETHERSCAN_API_KEY',
            'coingecko': 'COINGECKO_API_KEY',
            'infura': 'INFURA_PROJECT_ID',
            'paypal': 'PAYPAL_CLIENT_ID'
        };
        
        const envVar = envVarMap[serviceId];
        if (!envVar) {
            return { success: false };
        }
        
        // Check Node.js environment
        if (typeof process !== 'undefined' && process.env && process.env[envVar]) {
            const key = process.env[envVar];
            if (key && !this.isPlaceholder(key)) {
                return { success: true, key };
            }
        }
        
        return { success: false };
    }
    
    /**
     * Try session storage (temporary, expires with session)
     */
    trySessionStorageKey(serviceId) {
        if (typeof sessionStorage === 'undefined') {
            return { success: false };
        }
        
        const storageKey = `${serviceId}_api_key`;
        const key = sessionStorage.getItem(storageKey);
        
        if (key && !this.isPlaceholder(key)) {
            return { success: true, key };
        }
        
        return { success: false };
    }
    
    /**
     * Try shared API key pool
     */
    async tryPoolKey(serviceId, userId = null) {
        if (!this.poolManager) {
            return { success: false };
        }
        
        try {
            const result = await this.poolManager.getKey(serviceId, userId);
            if (result.success && result.key) {
                return {
                    success: true,
                    key: result.key,
                    pooled: true,
                    contributorId: result.contributorId,
                    keyId: result.keyId,
                    costPerCall: result.costPerCall
                };
            }
        } catch (error) {
            console.warn('Pool key retrieval failed:', error);
        }
        
        return { success: false };
    }
    
    /**
     * Try known working keys (public/demo keys)
     */
    tryKnownWorkingKey(serviceId) {
        if (!this.knownKeysRegistry) {
            return { success: false };
        }
        
        try {
            const result = this.knownKeysRegistry.searchKnownKeys(serviceId);
            
            if (result.found) {
                if (result.type === 'public_endpoint') {
                    // No key needed, public endpoint
                    return {
                        success: true,
                        key: null,
                        publicEndpoint: result.endpoint
                    };
                } else if (result.type === 'known_key' && result.key) {
                    return {
                        success: true,
                        key: result.key,
                        demo: true
                    };
                }
            }
        } catch (error) {
            console.warn('Known keys search failed:', error);
        }
        
        return { success: false };
    }
    
    /**
     * Fallback mode (degraded functionality)
     */
    tryFallbackMode(serviceId) {
        return {
            success: false,
            fallbackMode: true,
            message: `Service ${serviceId} operating in fallback mode with limited functionality`
        };
    }
    
    /**
     * Validate a key
     */
    validateKey(serviceId, key, strategy) {
        // Skip validation for public endpoints
        if (strategy === 'known_working' && !key) {
            return { valid: true };
        }
        
        // Use validator if available
        if (this.validator) {
            return this.validator.validate(key, serviceId);
        }
        
        // Basic validation
        if (!key || typeof key !== 'string' || key.trim().length < 10) {
            return { valid: false, error: 'Key too short or invalid' };
        }
        
        if (this.isPlaceholder(key)) {
            return { valid: false, error: 'Key appears to be a placeholder' };
        }
        
        return { valid: true };
    }
    
    /**
     * Check if key is a placeholder
     */
    isPlaceholder(key) {
        const placeholders = [
            'your_key_here', 'your-key-here', 'your_api_key', 'your-api-key',
            'placeholder', 'example', 'test', 'demo', 'fake', 'mock',
            'xxx', '000', '123', 'replace', 'insert', 'change_this'
        ];
        
        const lower = key.toLowerCase();
        return placeholders.some(p => lower.includes(p));
    }
    
    /**
     * Cache active key
     */
    cacheActiveKey(serviceId, key, strategy) {
        this.activeKeys.set(serviceId, {
            key,
            strategy,
            lastValidated: Date.now(),
            failures: 0,
            expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        });
    }
    
    /**
     * Check if cached key is still valid
     */
    isKeyValid(serviceId, activeKey) {
        if (!activeKey) return false;
        
        // Check if expired
        if (activeKey.expiresAt && Date.now() > activeKey.expiresAt) {
            return false;
        }
        
        // Check failure count
        if (activeKey.failures >= 3) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Set API key explicitly (user_provided strategy)
     */
    setAPIKey(serviceId, key) {
        const validation = this.validateKey(serviceId, key, 'user_provided');
        
        if (!validation.valid) {
            throw new Error(`Invalid API key: ${validation.error}`);
        }
        
        this.cacheActiveKey(serviceId, key, 'user_provided');
        
        return {
            success: true,
            message: 'API key set successfully'
        };
    }
    
    /**
     * Record successful API call
     */
    recordSuccess(serviceId) {
        const active = this.activeKeys.get(serviceId);
        if (active) {
            active.failures = 0;
        }
        
        const health = this.health.get(serviceId) || {
            status: 'healthy',
            lastCheck: Date.now(),
            consecutiveFailures: 0,
            uptime: 100
        };
        
        health.consecutiveFailures = 0;
        health.lastCheck = Date.now();
        
        this.health.set(serviceId, health);
    }
    
    /**
     * Record failed API call
     */
    recordFailure(serviceId) {
        const active = this.activeKeys.get(serviceId);
        if (active) {
            active.failures = (active.failures || 0) + 1;
        }
        
        const health = this.health.get(serviceId) || {
            status: 'healthy',
            lastCheck: Date.now(),
            consecutiveFailures: 0,
            uptime: 100
        };
        
        health.consecutiveFailures = (health.consecutiveFailures || 0) + 1;
        health.lastCheck = Date.now();
        
        if (health.consecutiveFailures >= 3) {
            health.status = 'unhealthy';
        }
        
        this.health.set(serviceId, health);
    }
    
    /**
     * Execute API call with automatic retry and fallback
     */
    async executeWithRetry(serviceId, apiCallFn, options = {}) {
        const {
            userId = null,
            requestContext = {},
            maxRetries = this.retryConfig.maxRetries,
            onRetry = null
        } = options;
        
        let lastError = null;
        let attempt = 0;
        
        while (attempt < maxRetries) {
            try {
                // Get API key
                const keyResult = await this.getAPIKey(serviceId, {
                    forceRefresh: attempt > 0,
                    userId,
                    requestContext
                });
                
                if (!keyResult.success) {
                    throw new Error(keyResult.error || 'Failed to get API key');
                }
                
                // Execute API call
                const result = await apiCallFn(keyResult.key, keyResult);
                
                // Record success
                this.recordSuccess(serviceId);
                
                return {
                    success: true,
                    result,
                    attempts: attempt + 1,
                    strategy: keyResult.strategy
                };
                
            } catch (error) {
                lastError = error;
                attempt++;
                
                // Record failure
                this.recordFailure(serviceId);
                
                // Check if we should retry
                if (attempt >= maxRetries) {
                    break;
                }
                
                // Calculate delay with exponential backoff and jitter
                const delay = this.calculateRetryDelay(attempt);
                
                // Call onRetry callback if provided
                if (onRetry) {
                    onRetry({
                        attempt,
                        maxRetries,
                        error,
                        nextDelay: delay
                    });
                }
                
                // Wait before retrying
                await this.sleep(delay);
            }
        }
        
        // All retries exhausted
        return {
            success: false,
            error: lastError ? lastError.message : 'All retries exhausted',
            attempts: attempt,
            fallbackMode: this.features.autoFallback
        };
    }
    
    /**
     * Calculate retry delay with exponential backoff and jitter
     */
    calculateRetryDelay(attempt) {
        const { baseDelayMs, maxDelayMs, backoffMultiplier, jitterMs } = this.retryConfig;
        
        // Exponential backoff
        const exponentialDelay = baseDelayMs * Math.pow(backoffMultiplier, attempt - 1);
        
        // Cap at max delay
        const cappedDelay = Math.min(exponentialDelay, maxDelayMs);
        
        // Add random jitter to avoid thundering herd
        const jitter = Math.random() * jitterMs;
        
        return cappedDelay + jitter;
    }
    
    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Get user guidance for missing API keys
     */
    getGuidance(serviceId) {
        const guidanceMap = {
            'groq': {
                message: 'GroqAI API key configured (repo-wide orchestrator)',
                getKeyUrl: 'https://console.groq.com/keys',
                freeTier: true,
                alternatives: ['Free tier: 14,400 requests/day']
            },
            'openai': {
                message: 'OpenAI API key required',
                getKeyUrl: 'https://platform.openai.com/api-keys',
                freeTier: false,
                alternatives: ['Use GroqAI (free, configured)', 'Try Anthropic Claude']
            },
            'anthropic': {
                message: 'Anthropic API key required',
                getKeyUrl: 'https://console.anthropic.com/settings/keys',
                freeTier: false,
                alternatives: ['Use OpenAI', 'Use local LLM']
            },
            'samgov': {
                message: 'SAM.gov API key required',
                getKeyUrl: 'https://open.gsa.gov/api/get-opportunities-public-api/',
                freeTier: true,
                alternatives: ['Use DEMO_KEY for testing']
            },
            'github': {
                message: 'GitHub Personal Access Token required',
                getKeyUrl: 'https://github.com/settings/tokens',
                freeTier: true,
                alternatives: ['Public API has rate limits without token']
            },
            'etherscan': {
                message: 'Etherscan API key required',
                getKeyUrl: 'https://etherscan.io/apis',
                freeTier: true,
                alternatives: ['Free tier available']
            },
            'coingecko': {
                message: 'CoinGecko API key optional',
                getKeyUrl: 'https://www.coingecko.com/en/api/pricing',
                freeTier: true,
                alternatives: ['Public API available without key']
            },
            'infura': {
                message: 'Infura Project ID required',
                getKeyUrl: 'https://infura.io/register',
                freeTier: true,
                alternatives: ['Free tier available']
            },
            'paypal': {
                message: 'PayPal API credentials required',
                getKeyUrl: 'https://developer.paypal.com/dashboard/applications',
                freeTier: true,
                alternatives: ['Sandbox credentials for testing']
            }
        };
        
        return guidanceMap[serviceId] || {
            message: `API key required for ${serviceId}`,
            getKeyUrl: null,
            freeTier: false,
            alternatives: []
        };
    }
    
    /**
     * Load centralized API key configuration
     */
    async loadCentralizedConfig() {
        if (this._centralizedConfigLoaded) {
            return this._centralizedConfig;
        }
        
        try {
            const response = await fetch('/src/utils/centralized-api-keys.json');
            if (response.ok) {
                this._centralizedConfig = await response.json();
                this._centralizedConfigLoaded = true;
                console.log('✅ Loaded centralized API key configuration');
                return this._centralizedConfig;
            }
        } catch (error) {
            console.warn('Could not load centralized config:', error.message);
        }
        
        this._centralizedConfigLoaded = true;
        return null;
    }
    
    /**
     * Get centralized config
     */
    get centralizedConfig() {
        return this._centralizedConfig;
    }
    
    /**
     * Initialize health monitoring
     */
    initializeHealthMonitoring() {
        if (!this.features.healthMonitoring) return;
        
        // Check health every 5 minutes
        setInterval(() => {
            this.performHealthChecks();
        }, 5 * 60 * 1000);
    }
    
    /**
     * Perform health checks on all services
     */
    async performHealthChecks() {
        for (const [serviceId, health] of this.health.entries()) {
            // Mark as needs checking if not used recently
            if (Date.now() - health.lastCheck > 30 * 60 * 1000) { // 30 minutes
                health.status = 'unchecked';
            }
        }
    }
    
    /**
     * Get diagnostic information
     */
    getDiagnostics(serviceId = null) {
        if (serviceId) {
            return {
                service: serviceId,
                activeKey: this.activeKeys.has(serviceId) ? {
                    strategy: this.activeKeys.get(serviceId).strategy,
                    failures: this.activeKeys.get(serviceId).failures,
                    lastValidated: this.activeKeys.get(serviceId).lastValidated
                } : null,
                health: this.health.get(serviceId) || null
            };
        }
        
        return {
            activeKeys: Array.from(this.activeKeys.entries()).map(([id, key]) => ({
                serviceId: id,
                strategy: key.strategy,
                failures: key.failures
            })),
            health: Array.from(this.health.entries()).map(([id, h]) => ({
                serviceId: id,
                status: h.status,
                consecutiveFailures: h.consecutiveFailures
            }))
        };
    }
    
    /**
     * Clear cached key for a service
     */
    clearCache(serviceId) {
        this.activeKeys.delete(serviceId);
        this.health.delete(serviceId);
    }
    
    /**
     * Clear all cached keys
     */
    clearAllCache() {
        this.activeKeys.clear();
        this.health.clear();
    }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutonomousAPIKeyManager;
} else if (typeof window !== 'undefined') {
    window.AutonomousAPIKeyManager = AutonomousAPIKeyManager;
}
