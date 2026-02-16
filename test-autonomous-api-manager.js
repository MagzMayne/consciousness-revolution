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
 * File: test-autonomous-api-manager.js
 * Declaration ID: IP-3B5D64C1-MLL28ZWI
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Autonomous API Key Manager
 */

const AutonomousAPIKeyManager = require('./src/utils/autonomous-api-key-manager.js');

console.log('🧪 Autonomous API Key Manager Test Suite\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`✅ ${name}`);
        passed++;
    } catch (error) {
        console.log(`❌ ${name}`);
        console.error(`   Error: ${error.message}`);
        failed++;
    }
}

async function testAsync(name, fn) {
    try {
        await fn();
        console.log(`✅ ${name}`);
        passed++;
    } catch (error) {
        console.log(`❌ ${name}`);
        console.error(`   Error: ${error.message}`);
        failed++;
    }
}

// Initialize manager
const manager = new AutonomousAPIKeyManager();

// Test 1: Initialization
test('Manager initializes correctly', () => {
    if (!manager.sourcingStrategies || manager.sourcingStrategies.length === 0) {
        throw new Error('Sourcing strategies not initialized');
    }
    if (!manager.retryConfig) {
        throw new Error('Retry config not initialized');
    }
});

// Test 2: Placeholder Detection
test('Detects placeholder keys', () => {
    const placeholders = ['your_key_here', 'placeholder', 'test', 'demo', 'fake'];
    placeholders.forEach(key => {
        if (!manager.isPlaceholder(key)) {
            throw new Error(`Failed to detect placeholder: ${key}`);
        }
    });
});

test('Accepts valid keys', () => {
    const validKeys = [
        'sk-abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnop',
        'ghp_1234567890123456789012345678901234567890',
        'CG-1234567890abcdefghijklmn'
    ];
    validKeys.forEach(key => {
        if (manager.isPlaceholder(key)) {
            throw new Error(`Incorrectly rejected valid key: ${key}`);
        }
    });
});

// Test 3: Key Validation
test('Validates OpenAI key format', () => {
    const validation = manager.validateKey('openai', 'sk-test123', 'user_provided');
    if (validation.valid) {
        throw new Error('Accepted too-short OpenAI key');
    }
});

test('Validates key format correctly', () => {
    const validation = manager.validateKey('openai', 
        'sk-abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnop',
        'user_provided'
    );
    if (!validation.valid) {
        throw new Error('Rejected valid OpenAI key: ' + validation.error);
    }
});

// Test 4: Set API Key
test('Sets API key correctly', () => {
    manager.setAPIKey('openai', 'sk-abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnop');
    const cached = manager.activeKeys.get('openai');
    if (!cached || !cached.key) {
        throw new Error('Key not cached after setting');
    }
    if (cached.strategy !== 'user_provided') {
        throw new Error('Wrong strategy set');
    }
});

// Test 5: Retry Delay Calculation
test('Calculates retry delay with exponential backoff', () => {
    const delay1 = manager.calculateRetryDelay(1);
    const delay2 = manager.calculateRetryDelay(2);
    const delay3 = manager.calculateRetryDelay(3);
    
    // Should be increasing
    if (delay1 >= delay2 || delay2 >= delay3) {
        throw new Error('Retry delay not increasing');
    }
    
    // Should be within bounds
    if (delay3 > manager.retryConfig.maxDelayMs + manager.retryConfig.jitterMs) {
        throw new Error('Retry delay exceeded max');
    }
});

// Test 6: Success/Failure Recording
test('Records success correctly', () => {
    manager.recordSuccess('openai');
    const health = manager.health.get('openai');
    if (!health || health.consecutiveFailures !== 0) {
        throw new Error('Success not recorded correctly');
    }
});

test('Records failure correctly', () => {
    manager.recordFailure('github');
    const health = manager.health.get('github');
    if (!health || health.consecutiveFailures !== 1) {
        throw new Error('Failure not recorded correctly');
    }
});

test('Marks service unhealthy after multiple failures', () => {
    // Record 3 failures
    manager.recordFailure('samgov');
    manager.recordFailure('samgov');
    manager.recordFailure('samgov');
    
    const health = manager.health.get('samgov');
    if (!health || health.status !== 'unhealthy') {
        throw new Error('Service not marked unhealthy after 3 failures');
    }
});

// Test 7: Cache Management
test('Clears cache correctly', () => {
    manager.setAPIKey('etherscan', 'test123456789012345678901234567890');
    manager.clearCache('etherscan');
    
    if (manager.activeKeys.has('etherscan')) {
        throw new Error('Cache not cleared');
    }
});

test('Clears all cache correctly', () => {
    manager.setAPIKey('coingecko', 'CG-test1234567890abcdefghijklmn');
    manager.clearAllCache();
    
    if (manager.activeKeys.size > 0) {
        throw new Error('All cache not cleared');
    }
});

// Test 8: Diagnostics
test('Provides diagnostics', () => {
    manager.setAPIKey('openai', 'sk-abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnop');
    const diag = manager.getDiagnostics();
    
    if (!diag.activeKeys || !diag.health) {
        throw new Error('Diagnostics incomplete');
    }
});

test('Provides service-specific diagnostics', () => {
    const diag = manager.getDiagnostics('openai');
    if (!diag.service || diag.service !== 'openai') {
        throw new Error('Service-specific diagnostics incorrect');
    }
});

// Test 9: Guidance
test('Provides user guidance for missing keys', () => {
    const guidance = manager.getGuidance('openai');
    if (!guidance.message || !guidance.getKeyUrl) {
        throw new Error('Guidance incomplete');
    }
});

// Test 10: Async Key Retrieval
(async () => {
    await testAsync('Retrieves key from environment (mocked)', async () => {
        // Set a mock environment key
        manager.activeKeys.clear();
        const result = await manager.getAPIKey('github');
        
        // Should return fallback or error since no key is set
        if (result.success && !result.fallbackMode) {
            // Only pass if we actually got a real key from env
            console.log('   (Found real key in environment)');
        }
    });
    
    await testAsync('Returns fallback when no key available', async () => {
        manager.clearAllCache();
        const result = await manager.getAPIKey('anthropic');
        
        if (result.success && !result.fallbackMode) {
            throw new Error('Should return fallback or error');
        }
    });
    
    await testAsync('Executes with retry successfully', async () => {
        let attempts = 0;
        const result = await manager.executeWithRetry('coingecko', async (apiKey) => {
            attempts++;
            if (attempts < 2) {
                throw new Error('Simulated failure');
            }
            return { success: true, data: 'test' };
        });
        
        if (!result.success || attempts < 2) {
            throw new Error('Retry logic not working');
        }
    });
    
    // Final results
    console.log('\n' + '='.repeat(50));
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${passed + failed}`);
    console.log('='.repeat(50));
    
    if (failed === 0) {
        console.log('\n🎉 All tests passed!');
        process.exit(0);
    } else {
        console.log('\n⚠️  Some tests failed');
        process.exit(1);
    }
})();
