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
 * File: kas-example-agent.js
 * Declaration ID: IP-709783C5-MLL28ZVZ
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Example Agent using KAS SDK
 * 
 * This demonstrates how agents can use the KAS SDK to:
 * - Authenticate with the backend
 * - Request and cache tokens automatically
 * - Make authenticated API calls
 */

const { KASSDK } = require('../utils/kas-sdk.js');

class KASExampleAgent {
    constructor(options = {}) {
        this.agentId = options.agentId || 'kas-example-agent-001';
        this.kasUrl = options.kasUrl || process.env.KAS_URL || 'http://localhost:3010';
        
        // Initialize KAS SDK
        this.kas = new KASSDK({
            baseUrl: this.kasUrl,
            agentId: this.agentId,
            debug: options.debug || process.env.NODE_ENV === 'development'
        });

        this.isInitialized = false;
        this.apiKey = null;
    }

    /**
     * Initialize the agent
     */
    async init() {
        console.log(`🤖 Initializing ${this.agentId}...`);

        try {
            // Check KAS backend connection
            const health = await this.kas.healthCheck();
            console.log(`✅ Connected to KAS: ${health.status}`);

            this.isInitialized = true;
            return true;

        } catch (error) {
            console.error('❌ Failed to initialize agent:', error.message);
            console.error('   Make sure KAS service is running: npm run kas');
            throw error;
        }
    }

    /**
     * Register the agent (create API key)
     */
    async register() {
        if (!this.isInitialized) {
            await this.init();
        }

        console.log(`📝 Registering agent: ${this.agentId}...`);

        try {
            const response = await this.kas.createApiKey(this.agentId);
            this.apiKey = response.apiKey;

            console.log(`✅ Agent registered successfully`);
            console.log(`   API Key: ${this.apiKey.substring(0, 20)}...`);
            console.log(`   Key ID: ${response.keyId}`);
            console.log(`   ⚠️  Store this API key securely!`);

            return response;

        } catch (error) {
            console.error('❌ Registration failed:', error.message);
            throw error;
        }
    }

    /**
     * Example: Call a protected endpoint
     */
    async callProtectedEndpoint(endpoint, data = {}) {
        if (!this.isInitialized) {
            await this.init();
        }

        console.log(`🔒 Calling protected endpoint: ${endpoint}`);

        try {
            // SDK automatically handles token creation, caching, and refresh
            const result = await this.kas.callProtectedEndpoint(endpoint, {
                method: 'POST',
                body: data
            });

            console.log(`✅ Protected call succeeded`);
            return result;

        } catch (error) {
            console.error('❌ Protected call failed:', error.message);
            throw error;
        }
    }

    /**
     * Example: Manual token management
     */
    async manualTokenFlow(endpoint) {
        if (!this.isInitialized) {
            await this.init();
        }

        console.log(`\n🔑 Manual Token Flow Demo`);
        console.log(`──────────────────────────`);

        try {
            // Step 1: Create token
            console.log('1. Creating token...');
            const tokenResponse = await this.kas.createToken(
                this.agentId,
                endpoint,
                { ttl: 60 }
            );
            console.log(`   ✅ Token created: ${tokenResponse.token.substring(0, 30)}...`);
            console.log(`   Expires: ${tokenResponse.expiresAtIso}`);

            // Step 2: Validate token
            console.log('\n2. Validating token...');
            const validation = await this.kas.validateToken(
                tokenResponse.token,
                endpoint
            );
            console.log(`   ✅ Token validated`);
            console.log(`   Agent ID: ${validation.agentId}`);

            // Step 3: Try to use again (should fail - single use)
            console.log('\n3. Attempting to reuse token...');
            try {
                await this.kas.validateToken(tokenResponse.token, endpoint);
                console.log('   ❌ This should have failed!');
            } catch (error) {
                console.log(`   ✅ Correctly rejected: ${error.message}`);
            }

            return true;

        } catch (error) {
            console.error('❌ Manual flow failed:', error.message);
            throw error;
        }
    }

    /**
     * Example: Token caching demonstration
     */
    async demonstrateTokenCaching() {
        if (!this.isInitialized) {
            await this.init();
        }

        console.log(`\n💾 Token Caching Demo`);
        console.log(`──────────────────────────`);

        const endpoint = '/api/cached-endpoint';

        try {
            // First call - creates token
            console.log('1. First call (creates token)...');
            const start1 = Date.now();
            const token1 = await this.kas.getToken(endpoint);
            const time1 = Date.now() - start1;
            console.log(`   ✅ Got token in ${time1}ms`);
            console.log(`   Token: ${token1.substring(0, 30)}...`);

            // Second call - uses cache
            console.log('\n2. Second call (uses cache)...');
            const start2 = Date.now();
            const token2 = await this.kas.getToken(endpoint);
            const time2 = Date.now() - start2;
            console.log(`   ✅ Got token in ${time2}ms (from cache)`);
            console.log(`   Same token: ${token1 === token2}`);

            // Check cache stats
            const stats = this.kas.getCacheStats();
            console.log(`\n📊 Cache Stats:`);
            console.log(`   Cached tokens: ${stats.size}`);
            console.log(`   Endpoints: ${stats.tokens.map(t => t.endpoint).join(', ')}`);

            return true;

        } catch (error) {
            console.error('❌ Caching demo failed:', error.message);
            throw error;
        }
    }

    /**
     * Get agent status
     */
    getStatus() {
        return {
            agentId: this.agentId,
            kasUrl: this.kasUrl,
            initialized: this.isInitialized,
            hasApiKey: !!this.apiKey,
            cacheStats: this.kas.getCacheStats()
        };
    }
}

/**
 * Demo runner
 */
async function runDemo() {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║   KAS SDK Example Agent                                  ║
║   Demonstrates real crypto authentication                ║
╚══════════════════════════════════════════════════════════╝
`);

    const agent = new KASExampleAgent({
        agentId: 'demo-agent-' + Date.now(),
        debug: true
    });

    try {
        // Initialize
        await agent.init();

        // Register (create API key)
        await agent.register();

        // Demo manual token flow
        await agent.manualTokenFlow('/api/test-endpoint');

        // Demo token caching
        await agent.demonstrateTokenCaching();

        // Show final status
        console.log(`\n📊 Final Agent Status:`);
        console.log(JSON.stringify(agent.getStatus(), null, 2));

        console.log(`\n✅ Demo completed successfully!`);
        console.log(`\n📝 Next steps:`);
        console.log(`   1. Check autoKey.html for web UI`);
        console.log(`   2. Read KAS_README.md for full documentation`);
        console.log(`   3. Integrate KAS SDK into your agents`);

    } catch (error) {
        console.error(`\n❌ Demo failed:`, error.message);
        console.error(`\nTroubleshooting:`);
        console.error(`   1. Make sure KAS service is running: npm run kas`);
        console.error(`   2. Check .env file has JWT_SECRET and HMAC_SECRET`);
        console.error(`   3. Verify port 3010 is not in use`);
        process.exit(1);
    }
}

// Export for use in other modules
module.exports = KASExampleAgent;

// Run demo if executed directly
if (require.main === module) {
    runDemo().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}
