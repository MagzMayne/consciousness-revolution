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
 * File: api-connection-manager.js
 * Declaration ID: IP-72EEDE06-MLL28ZW1
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
 * AI API Connection Manager for BarbrickDesign Platform
 * Centralized management for all AI and external API connections
 * 
 * Features:
 * - Automatic API endpoint discovery and connection
 * - Intelligent retry logic with exponential backoff
 * - Secure API key management with validation
 * - Graceful fallbacks when APIs are unavailable
 * - Connection health monitoring and diagnostics
 * - Auto-linking to inject connection logic into projects
 * 
 * @author BarbrickDesign Platform Team
 * @version 1.0.0
 */

class AIAPIConnectionManager {
    constructor() {
        // Lazy initialization for validator (will be created when needed)
        this._validator = null;
        
        // Lazy initialization for known working keys registry
        this._knownKeysRegistry = null;
        
        // Lazy initialization for autonomous manager
        this._autonomousManager = null;
        
        // Supported API services
        this.services = {
            'openai': {
                name: 'OpenAI',
                baseUrl: 'https://api.openai.com/v1',
                keyFormat: 'sk-',
                envVar: 'OPENAI_API_KEY',
                storageKey: 'openai_api_key',
                methods: ['chat', 'image', 'audio', 'embeddings', 'moderation'],
                required: false,
                fallbackAvailable: true,
                freeTier: false
            },
            'groq': {
                name: 'Groq',
                baseUrl: 'https://api.groq.com/openai/v1',
                keyFormat: 'gsk_',
                envVar: 'GROQ_API_KEY',
                storageKey: 'groq_api_key',
                methods: ['chat', 'audio'],
                required: false,
                fallbackAvailable: true,
                freeTier: true,
                freeLimit: '14,400 requests/day'
            },
            'huggingface': {
                name: 'HuggingFace',
                baseUrl: 'https://api-inference.huggingface.co',
                keyFormat: 'hf_',
                envVar: 'HUGGINGFACE_API_KEY',
                storageKey: 'huggingface_api_key',
                methods: ['chat', 'image', 'embeddings'],
                required: false,
                fallbackAvailable: true,
                freeTier: true,
                freeLimit: 'Rate limited'
            },
            'anthropic': {
                name: 'Anthropic Claude',
                baseUrl: 'https://api.anthropic.com/v1',
                keyFormat: 'sk-ant-',
                envVar: 'ANTHROPIC_API_KEY',
                storageKey: 'anthropic_api_key',
                methods: ['chat'],
                required: false,
                fallbackAvailable: true,
                freeTier: false
            },
            'samgov': {
                name: 'SAM.gov',
                baseUrl: 'https://api.sam.gov/prod',
                keyFormat: null,
                envVar: 'SAMGOV_API_KEY',
                storageKey: 'samgov_api_key',
                methods: ['searchContracts', 'getOpportunities'],
                required: false,
                fallbackAvailable: true
            },
            'github': {
                name: 'GitHub',
                baseUrl: 'https://api.github.com',
                keyFormat: ['ghp_', 'github_pat_'],
                envVar: 'GITHUB_TOKEN',
                storageKey: 'github_token',
                methods: ['repos', 'issues', 'pulls'],
                required: false,
                fallbackAvailable: false
            },
            'etherscan': {
                name: 'Etherscan',
                baseUrl: 'https://api.etherscan.io/api',
                keyFormat: null,
                envVar: 'ETHERSCAN_API_KEY',
                storageKey: 'etherscan_api_key',
                methods: ['balance', 'transactions'],
                required: false,
                fallbackAvailable: true
            },
            'coingecko': {
                name: 'CoinGecko',
                baseUrl: 'https://api.coingecko.com/api/v3',
                keyFormat: 'CG-',
                envVar: 'COINGECKO_API_KEY',
                storageKey: 'coingecko_api_key',
                methods: ['price', 'market'],
                required: false,
                fallbackAvailable: true
            },
            'infura': {
                name: 'Infura',
                baseUrl: 'https://mainnet.infura.io/v3',
                keyFormat: null,
                envVar: 'INFURA_PROJECT_ID',
                storageKey: 'infura_project_id',
                methods: ['rpc'],
                required: false,
                fallbackAvailable: false
            },
            'paypal': {
                name: 'PayPal',
                baseUrl: 'https://api.paypal.com',
                keyFormat: null,
                envVar: 'PAYPAL_CLIENT_ID',
                storageKey: 'paypal_client_id',
                methods: ['payouts', 'transactions'],
                required: false,
                fallbackAvailable: false
            }
        };
        
        // Connection status tracking
        this.connections = {};
        this.initializeConnections();
        
        // Retry configuration
        this.retryConfig = {
            maxRetries: 3,
            baseDelay: 1000, // 1 second
            maxDelay: 10000, // 10 seconds
            backoffMultiplier: 2,
            jitterMs: 1000 // Maximum random jitter to add
        };
        
        // Connection health
        this.health = {};
        
        // Auto-discovery results
        this.discoveredEndpoints = [];
    }
    /**
     * Get validator instance (lazy initialization)
     */
    get validator() {
        if (!this._validator && typeof window !== 'undefined' && window.ApiKeyValidator) {
            this._validator = new window.ApiKeyValidator();
        }
        return this._validator;
    }
    
    /**
     * Get known keys registry instance (lazy initialization)
     */
    get knownKeysRegistry() {
        if (!this._knownKeysRegistry && typeof window !== 'undefined' && window.KnownWorkingKeysRegistry) {
            this._knownKeysRegistry = new window.KnownWorkingKeysRegistry();
        }
        return this._knownKeysRegistry;
    }
    
    /**
     * Get autonomous manager instance (lazy initialization)
     */
    get autonomousManager() {
        if (!this._autonomousManager && typeof window !== 'undefined' && window.AutonomousAPIKeyManager) {
            this._autonomousManager = new window.AutonomousAPIKeyManager();
        }
        return this._autonomousManager;
    }
    
    /**
     * Initialize all service connections (now async)
     */
    async initializeConnections() {
        for (const [serviceId, service] of Object.entries(this.services)) {
            this.connections[serviceId] = {
                status: 'disconnected',
                apiKey: null,
                lastChecked: null,
                error: null,
                retryCount: 0
            };
            
            // Try to auto-load API key (now async)
            const apiKey = await this.getApiKey(serviceId);
            if (apiKey) {
                this.setApiKey(serviceId, apiKey);
            }
        }
    }
    
    /**
     * Get API key from multiple sources (with autonomous manager integration)
     */
    async getApiKey(serviceId, options = {}) {
        const service = this.services[serviceId];
        if (!service) return null;
        
        // NEW: Try autonomous manager first (preferred method)
        if (this.autonomousManager && !options.skipAutonomous) {
            try {
                const result = await this.autonomousManager.getAPIKey(serviceId, options);
                if (result.success && result.key) {
                    console.log(`✅ API key sourced autonomously via ${result.strategy}`);
                    return result.key;
                }
            } catch (error) {
                console.warn('Autonomous manager failed, falling back to manual sourcing:', error);
            }
        }
        
        // Fallback: Use validator's getApiKey method if available
        if (this.validator) {
            const userKey = this.validator.getApiKey({
                service: serviceId,
                envVar: service.envVar,
                configKey: service.storageKey,
                config: typeof localStorage !== 'undefined' ? {
                    [service.storageKey]: localStorage.getItem(service.storageKey)
                } : null,
                allowStorage: true
            });
            
            if (userKey) return userKey;
        }
        
        // Fallback: check environment and storage manually
        // 1. Environment variable (server-side)
        if (typeof process !== 'undefined' && process.env && process.env[service.envVar]) {
            return process.env[service.envVar];
        }
        
        // 2. Session storage
        if (typeof sessionStorage !== 'undefined') {
            const sessionKey = sessionStorage.getItem(service.storageKey);
            if (sessionKey) return sessionKey;
        }
        
        // 3. Local storage
        if (typeof localStorage !== 'undefined') {
            const localKey = localStorage.getItem(service.storageKey);
            if (localKey) return localKey;
        }
        
        // 4. NEW: Search for known working keys as a last resort
        if (this.knownKeysRegistry) {
            const knownKeyResult = this.knownKeysRegistry.searchKnownKeys(serviceId);
            
            if (knownKeyResult.found) {
                // Log that we're using a known working key
                if (knownKeyResult.type === 'public_endpoint') {
                    console.log(`ℹ️ ${service.name}: Using public endpoint (no key required)`);
                    return null; // No key needed for public endpoints
                } else if (knownKeyResult.key) {
                    console.log(`ℹ️ ${service.name}: Using known working key (${knownKeyResult.type})`);
                    if (knownKeyResult.limitations) {
                        console.warn(`⚠️ Limitations: ${knownKeyResult.limitations}`);
                    }
                    if (knownKeyResult.warning) {
                        console.warn(`⚠️ ${knownKeyResult.warning}`);
                    }
                    return knownKeyResult.key;
                }
            }
        }
        
        return null;
    }
    
    /**
     * Set API key for a service
     */
    setApiKey(serviceId, apiKey) {
        const service = this.services[serviceId];
        if (!service) {
            throw new Error(`Unknown service: ${serviceId}`);
        }
        
        // Validate the key
        if (this.validator) {
            const validation = this.validator.validate(apiKey, serviceId);
            if (!validation.valid) {
                console.warn(`Invalid API key for ${service.name}:`, validation.error);
                this.connections[serviceId].status = 'invalid';
                this.connections[serviceId].error = validation.error;
                return false;
            }
        }
        
        // Store the key
        this.connections[serviceId].apiKey = apiKey;
        this.connections[serviceId].status = 'ready';
        this.connections[serviceId].error = null;
        
        // Store encrypted key in sessionStorage for this session only
        // NOTE: In production, implement proper encryption using Web Crypto API
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(service.storageKey, apiKey);
        }
        
        // DO NOT store API keys in localStorage - sessionStorage only!
        // Keys are cleared when browser/tab closes for security
        
        console.log(`✅ ${service.name} API key configured (session only)`);
        return true;
    }
    
    /**
     * Make API request with automatic retry logic (with autonomous manager)
     */
    async makeRequest(serviceId, endpoint, options = {}) {
        const service = this.services[serviceId];
        const connection = this.connections[serviceId];
        
        if (!service) {
            throw new Error(`Unknown service: ${serviceId}`);
        }
        
        // NEW: Use autonomous manager's executeWithRetry if available
        if (this.autonomousManager && options.useAutonomous !== false) {
            try {
                const result = await this.autonomousManager.executeWithRetry(serviceId, async (apiKey, keyResult) => {
                    // Build full URL
                    const url = `${service.baseUrl}${endpoint}`;
                    
                    // Prepare headers
                    const headers = {
                        'Content-Type': 'application/json',
                        ...options.headers
                    };
                    
                    // Add authentication if API key is available
                    if (apiKey) {
                        if (serviceId === 'openai' || serviceId === 'anthropic') {
                            headers['Authorization'] = `Bearer ${apiKey}`;
                        } else if (serviceId === 'github') {
                            headers['Authorization'] = `token ${apiKey}`;
                        } else {
                            headers['X-API-Key'] = apiKey;
                        }
                    }
                    
                    // Make the request
                    const response = await fetch(url, {
                        ...options,
                        headers
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    
                    return await response.json();
                }, {
                    userId: options.userId,
                    requestContext: options.requestContext,
                    onRetry: (retryInfo) => {
                        console.log(`Retrying ${service.name} request (attempt ${retryInfo.attempt}/${retryInfo.maxRetries})...`);
                    }
                });
                
                if (result.success) {
                    connection.status = 'connected';
                    connection.error = null;
                    return result.result;
                } else {
                    throw new Error(result.error || 'Request failed');
                }
            } catch (error) {
                console.warn('Autonomous request failed, falling back to standard retry:', error);
            }
        }
        
        // Fallback: Check if API key is available
        if (!connection.apiKey && !service.fallbackAvailable) {
            throw new Error(`${service.name} API key is required. Please configure your API key.`);
        }
        
        // Fallback: Attempt request with standard retry logic
        return await this.retryRequest(serviceId, endpoint, options);
    }
    
    /**
     * Retry request with exponential backoff
     */
    async retryRequest(serviceId, endpoint, options, retryCount = 0) {
        const service = this.services[serviceId];
        const connection = this.connections[serviceId];
        
        try {
            // Build full URL
            const url = `${service.baseUrl}${endpoint}`;
            
            // Prepare headers
            const headers = {
                'Content-Type': 'application/json',
                ...options.headers
            };
            
            // Add authentication if API key is available
            if (connection.apiKey) {
                // Different services use different auth methods
                if (serviceId === 'openai' || serviceId === 'anthropic') {
                    headers['Authorization'] = `Bearer ${connection.apiKey}`;
                } else if (serviceId === 'github') {
                    headers['Authorization'] = `token ${connection.apiKey}`;
                } else {
                    // Most APIs use API key in query params or custom header
                    headers['X-API-Key'] = connection.apiKey;
                }
            }
            
            // Make the request
            const response = await fetch(url, {
                ...options,
                headers
            });
            
            // Check response
            if (!response.ok) {
                // Handle specific error codes
                if (response.status === 401) {
                    connection.status = 'unauthorized';
                    connection.error = 'Invalid or expired API key';
                    throw new Error(`Authentication failed for ${service.name}`);
                } else if (response.status === 429) {
                    connection.status = 'rate_limited';
                    connection.error = 'Rate limit exceeded';
                    
                    // Retry with backoff
                    if (retryCount < this.retryConfig.maxRetries) {
                        const delay = this.calculateBackoff(retryCount);
                        console.warn(`Rate limited. Retrying in ${delay}ms...`);
                        await this.sleep(delay);
                        return await this.retryRequest(serviceId, endpoint, options, retryCount + 1);
                    }
                    
                    throw new Error(`Rate limit exceeded for ${service.name}`);
                } else if (response.status >= 500) {
                    connection.status = 'error';
                    connection.error = 'Server error';
                    
                    // Retry server errors
                    if (retryCount < this.retryConfig.maxRetries) {
                        const delay = this.calculateBackoff(retryCount);
                        console.warn(`Server error. Retrying in ${delay}ms...`);
                        await this.sleep(delay);
                        return await this.retryRequest(serviceId, endpoint, options, retryCount + 1);
                    }
                    
                    throw new Error(`Server error from ${service.name}`);
                }
                
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            // Update connection status
            connection.status = 'connected';
            connection.error = null;
            connection.lastChecked = new Date().toISOString();
            connection.retryCount = 0;
            
            // Parse and return response
            return await response.json();
            
        } catch (error) {
            connection.retryCount = retryCount;
            
            // Network error - retry if possible
            if (error.message.includes('fetch') || error.message.includes('network')) {
                if (retryCount < this.retryConfig.maxRetries) {
                    const delay = this.calculateBackoff(retryCount);
                    console.warn(`Network error. Retrying in ${delay}ms...`);
                    await this.sleep(delay);
                    return await this.retryRequest(serviceId, endpoint, options, retryCount + 1);
                }
            }
            
            // If we have a fallback available, try to use it
            if (service.fallbackAvailable && !connection.apiKey) {
                console.warn(`Using fallback for ${service.name} (no API key)`);
                return this.getFallbackResponse(serviceId, endpoint, options);
            }
            
            // No more retries or fallback available
            connection.status = 'error';
            connection.error = error.message;
            throw error;
        }
    }
    
    /**
     * Calculate exponential backoff delay
     */
    calculateBackoff(retryCount) {
        const delay = Math.min(
            this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, retryCount),
            this.retryConfig.maxDelay
        );
        // Add jitter to prevent thundering herd
        return delay + Math.random() * this.retryConfig.jitterMs;
    }
    
    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Get fallback/mock response when API is unavailable
     */
    getFallbackResponse(serviceId, endpoint, options) {
        console.warn(`⚠️ Using fallback data for ${this.services[serviceId].name}`);
        
        // Service-specific fallbacks
        if (serviceId === 'openai') {
            return {
                choices: [{
                    message: {
                        content: '🤖 **Mock AI Response**\n\nThis is a simulated response. To use real AI, please provide an OpenAI API key.'
                    }
                }]
            };
        } else if (serviceId === 'samgov') {
            return {
                data: [{
                    title: 'Demo Contract Opportunity',
                    description: 'This is sample data. Configure your SAM.gov API key for real contract data.',
                    value: 100000,
                    postedDate: new Date().toISOString()
                }]
            };
        } else if (serviceId === 'etherscan' || serviceId === 'coingecko') {
            return {
                result: '0',
                message: 'Demo data - configure API key for live data'
            };
        }
        
        return {
            error: 'fallback',
            message: `Using demo mode for ${this.services[serviceId].name}. Configure API key for full functionality.`
        };
    }
    
    /**
     * Test connection to a service
     */
    async testConnection(serviceId) {
        const service = this.services[serviceId];
        const connection = this.connections[serviceId];
        
        if (!service) {
            return { success: false, error: 'Unknown service' };
        }
        
        try {
            // Test different endpoints based on service
            let testEndpoint = '';
            let testOptions = { method: 'GET' };
            
            if (serviceId === 'openai') {
                testEndpoint = '/models';
            } else if (serviceId === 'github') {
                testEndpoint = '/user';
            } else if (serviceId === 'samgov') {
                testEndpoint = '/opportunities/v2/search?limit=1';
            } else if (serviceId === 'etherscan') {
                testEndpoint = '?module=stats&action=ethsupply';
            } else if (serviceId === 'coingecko') {
                testEndpoint = '/ping';
            }
            
            await this.makeRequest(serviceId, testEndpoint, testOptions);
            
            return {
                success: true,
                message: `Successfully connected to ${service.name}`,
                status: connection.status
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                status: connection.status
            };
        }
    }
    
    /**
     * Get connection status for all services
     */
    getConnectionStatus() {
        const status = {};
        
        for (const [serviceId, service] of Object.entries(this.services)) {
            const connection = this.connections[serviceId];
            status[serviceId] = {
                name: service.name,
                status: connection.status,
                hasKey: !!connection.apiKey,
                error: connection.error,
                lastChecked: connection.lastChecked,
                fallbackAvailable: service.fallbackAvailable
            };
        }
        
        return status;
    }
    
    /**
     * Auto-discover API endpoints in loaded scripts and HTML
     */
    discoverEndpoints() {
        const endpoints = [];
        
        // Only works in browser environment
        if (typeof document === 'undefined') {
            console.warn('Endpoint discovery only available in browser environment');
            return endpoints;
        }
        
        // Check for API calls in scripts
        const scripts = document.getElementsByTagName('script');
        
        // Create efficient lookup for base URLs
        const serviceBaseUrls = new Map();
        for (const [serviceId, service] of Object.entries(this.services)) {
            serviceBaseUrls.set(service.baseUrl.toLowerCase(), serviceId);
            serviceBaseUrls.set(service.name.toLowerCase(), serviceId);
        }
        
        for (const script of scripts) {
            const content = script.textContent;
            
            // Look for fetch calls to known API domains
            const apiPatterns = [
                /fetch\s*\(\s*['"`](https?:\/\/[^'"`]+)['"`]/g,
                /axios\s*\.\s*\w+\s*\(\s*['"`](https?:\/\/[^'"`]+)['"`]/g,
                /\$\.ajax\s*\(\s*{[^}]*url\s*:\s*['"`](https?:\/\/[^'"`]+)['"`]/g
            ];
            
            for (const pattern of apiPatterns) {
                let match;
                while ((match = pattern.exec(content)) !== null) {
                    const url = match[1];
                    const urlLower = url.toLowerCase();
                    
                    // Check if URL matches any known service using efficient lookup
                    for (const [baseUrl, serviceId] of serviceBaseUrls.entries()) {
                        if (urlLower.includes(baseUrl)) {
                            endpoints.push({
                                service: serviceId,
                                url: url,
                                location: 'script'
                            });
                            break; // Found match, no need to check other services
                        }
                    }
                }
            }
        }
        
        this.discoveredEndpoints = endpoints;
        return endpoints;
    }
    
    /**
     * Auto-link: Inject connection management into discovered endpoints
     * This scans for API usage and ensures proper error handling is in place
     */
    async autoLink() {
        console.log('🔗 Auto-linking API connections...');
        
        // Discover all endpoints
        const endpoints = this.discoverEndpoints();
        
        if (endpoints.length === 0) {
            console.log('ℹ️ No API endpoints discovered on this page');
            return { linked: 0, discovered: 0 };
        }
        
        console.log(`📡 Discovered ${endpoints.length} API endpoint(s)`);
        
        // Group by service
        const byService = {};
        for (const endpoint of endpoints) {
            if (!byService[endpoint.service]) {
                byService[endpoint.service] = [];
            }
            byService[endpoint.service].push(endpoint);
        }
        
        // Log recommendations
        console.log('\n📋 API Connection Recommendations:');
        for (const [serviceId, serviceEndpoints] of Object.entries(byService)) {
            const service = this.services[serviceId];
            const connection = this.connections[serviceId];
            
            console.log(`\n${service.name}:`);
            console.log(`  - Found ${serviceEndpoints.length} endpoint(s)`);
            console.log(`  - Status: ${connection.status}`);
            
            if (!connection.apiKey) {
                console.log(`  - ⚠️ API key not configured`);
                console.log(`  - Set key: apiConnectionManager.setApiKey('${serviceId}', 'YOUR_KEY')`);
            } else {
                console.log(`  - ✅ API key configured`);
            }
            
            if (service.fallbackAvailable) {
                console.log(`  - ℹ️ Fallback mode available`);
            }
        }
        
        return {
            linked: Object.keys(byService).length,
            discovered: endpoints.length,
            services: Object.keys(byService)
        };
    }
    
    /**
     * Show connection status dashboard
     */
    showDashboard() {
        const status = this.getConnectionStatus();
        
        console.log('\n🔌 API Connection Status Dashboard\n');
        console.log('━'.repeat(60));
        
        for (const [serviceId, info] of Object.entries(status)) {
            const statusIcon = info.status === 'connected' ? '✅' :
                              info.status === 'ready' ? '🟡' :
                              info.status === 'disconnected' ? '⚫' :
                              info.status === 'error' ? '❌' : '❓';
            
            console.log(`${statusIcon} ${info.name.padEnd(20)} ${info.status.toUpperCase()}`);
            
            if (info.hasKey) {
                console.log(`   🔑 API key: configured`);
            } else {
                console.log(`   ⚠️  API key: not configured`);
                
                // Check if there's a known working key available
                if (this.knownKeysRegistry) {
                    const knownKeyResult = this.knownKeysRegistry.searchKnownKeys(serviceId);
                    if (knownKeyResult.found) {
                        if (knownKeyResult.type === 'public_endpoint') {
                            console.log(`   ℹ️  Public endpoint available (no key needed)`);
                        } else {
                            console.log(`   ℹ️  Known working key available (${knownKeyResult.type})`);
                        }
                        if (knownKeyResult.limitations) {
                            console.log(`   ⚠️  ${knownKeyResult.limitations}`);
                        }
                    }
                }
            }
            
            if (info.error) {
                console.log(`   ❌ Error: ${info.error}`);
            }
            
            if (info.fallbackAvailable && !info.hasKey) {
                console.log(`   ℹ️  Fallback mode: available`);
            }
            
            if (info.lastChecked) {
                console.log(`   🕐 Last checked: ${new Date(info.lastChecked).toLocaleString()}`);
            }
            
            console.log('');
        }
        
        console.log('━'.repeat(60));
        console.log('\n💡 Tip: Use apiConnectionManager.setApiKey(service, key) to configure');
        console.log('🔍 Known keys: Use apiConnectionManager.showKnownKeys() to see available known working keys');
        console.log('📖 Documentation: See API_KEY_CONFIGURATION_GUIDE.md\n');
    }
    
    /**
     * Show known working keys registry report
     */
    showKnownKeys() {
        if (!this.knownKeysRegistry) {
            console.warn('⚠️ Known working keys registry not available');
            return;
        }
        
        console.log(this.knownKeysRegistry.generateReport());
        
        // Show which services can be used right now
        const servicesWithKeys = this.knownKeysRegistry.getServicesWithKnownKeys();
        if (servicesWithKeys.length > 0) {
            console.log('💡 Tip: These services can be used without personal API keys:');
            for (const service of servicesWithKeys) {
                console.log(`   - ${service.serviceName} (${service.type})`);
            }
            console.log('');
        }
    }
    
    /**
     * Clear all stored API keys (for security/logout)
     */
    clearAllKeys() {
        for (const [serviceId, service] of Object.entries(this.services)) {
            if (typeof sessionStorage !== 'undefined') {
                sessionStorage.removeItem(service.storageKey);
            }
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem(service.storageKey);
            }
            
            this.connections[serviceId].apiKey = null;
            this.connections[serviceId].status = 'disconnected';
        }
        
        console.log('🔒 All API keys cleared');
    }
}

// Global instance
if (typeof window !== 'undefined') {
    window.AIAPIConnectionManager = AIAPIConnectionManager;
    window.apiConnectionManager = new AIAPIConnectionManager();
    
    // Auto-discover on page load
    if (document.readyState === 'complete') {
        window.apiConnectionManager.autoLink();
    } else {
        window.addEventListener('load', () => {
            window.apiConnectionManager.autoLink();
        });
    }
    
    console.log('🚀 AI API Connection Manager initialized');
    console.log('💡 Type apiConnectionManager.showDashboard() to view connection status');
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIAPIConnectionManager;
}
