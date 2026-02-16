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
 * File: test-kas-authentication.js
 * Declaration ID: IP-7921D94-MLL28ZUN
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * KAS Authentication Test Suite
 * 
 * Comprehensive tests for the Key Authority Service authentication system
 * Tests all flows: API keys, tokens, validation, expiration, and agent requests
 * 
 * Usage:
 *   node backend/test-kas-authentication.js
 * 
 * Requirements:
 *   - KAS backend service must be running on port 3010
 *   - npm install must be completed
 */

const http = require('http');
const https = require('https');

// Configuration
const KAS_BASE_URL = process.env.KAS_URL || 'http://localhost:3010';
const TEST_AGENT_ID = 'test-agent-kas-001';
const TEST_ENDPOINT = '/api/test-protected-endpoint';

// Test results
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const results = [];

// ANSI colors for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    dim: '\x1b[2m'
};

/**
 * Make HTTP request
 */
function request(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const client = urlObj.protocol === 'https:' ? https : http;
        
        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        const req = client.request(requestOptions, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: jsonData
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: data
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (options.body) {
            req.write(JSON.stringify(options.body));
        }

        req.end();
    });
}

/**
 * Sleep utility
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Test assertion helper
 */
function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}

/**
 * Run a test
 */
async function runTest(name, testFn) {
    totalTests++;
    process.stdout.write(`${colors.dim}[${totalTests}/${totalTests}]${colors.reset} ${name}... `);
    
    try {
        await testFn();
        passedTests++;
        console.log(`${colors.green}✓ PASS${colors.reset}`);
        results.push({ name, status: 'PASS' });
    } catch (error) {
        failedTests++;
        console.log(`${colors.red}✗ FAIL${colors.reset}`);
        console.log(`  ${colors.red}Error: ${error.message}${colors.reset}`);
        results.push({ name, status: 'FAIL', error: error.message });
    }
}

/**
 * Test: Health Check
 */
async function testHealthCheck() {
    const response = await request(`${KAS_BASE_URL}/health`);
    
    assert(response.statusCode === 200, 'Status code should be 200');
    assert(response.data.status === 'ok', 'Status should be ok');
    assert(response.data.service === 'KAS', 'Service should be KAS');
    assert(response.data.version, 'Should have version');
}

/**
 * Test: Create API Key
 */
async function testCreateApiKey() {
    const response = await request(`${KAS_BASE_URL}/api/create-key`, {
        method: 'POST',
        body: { agentId: TEST_AGENT_ID }
    });
    
    assert(response.statusCode === 201, 'Status code should be 201');
    assert(response.data.success === true, 'Success should be true');
    assert(response.data.apiKey, 'Should return API key');
    assert(response.data.keyId, 'Should return key ID');
    assert(response.data.agentId === TEST_AGENT_ID, 'Agent ID should match');
    assert(response.data.apiKey.startsWith('bdk_live_'), 'API key should have correct prefix');
}

/**
 * Test: Create API Key - Missing Agent ID
 */
async function testCreateApiKeyMissingAgentId() {
    const response = await request(`${KAS_BASE_URL}/api/create-key`, {
        method: 'POST',
        body: {}
    });
    
    assert(response.statusCode === 400, 'Status code should be 400');
    assert(response.data.error, 'Should return error message');
}

/**
 * Test: List API Keys
 */
async function testListApiKeys() {
    const response = await request(`${KAS_BASE_URL}/api/list-keys`);
    
    assert(response.statusCode === 200, 'Status code should be 200');
    assert(response.data.success === true, 'Success should be true');
    assert(Array.isArray(response.data.keys), 'Keys should be an array');
    assert(response.data.count >= 0, 'Count should be a number');
}

/**
 * Test: Create Single-Use Token
 */
async function testCreateToken() {
    const response = await request(`${KAS_BASE_URL}/api/create-token`, {
        method: 'POST',
        body: {
            agentId: TEST_AGENT_ID,
            endpoint: TEST_ENDPOINT,
            ttlSeconds: 60
        }
    });
    
    assert(response.statusCode === 201, 'Status code should be 201');
    assert(response.data.success === true, 'Success should be true');
    assert(response.data.token, 'Should return token');
    assert(response.data.tokenId, 'Should return token ID');
    assert(response.data.agentId === TEST_AGENT_ID, 'Agent ID should match');
    assert(response.data.endpoint === TEST_ENDPOINT, 'Endpoint should match');
    assert(response.data.ttl === 60, 'TTL should match');
    
    // Store token for later tests
    global.testToken = response.data.token;
    global.testTokenId = response.data.tokenId;
}

/**
 * Test: Create Token - Missing Required Fields
 */
async function testCreateTokenMissingFields() {
    const response = await request(`${KAS_BASE_URL}/api/create-token`, {
        method: 'POST',
        body: {
            agentId: TEST_AGENT_ID
            // Missing endpoint
        }
    });
    
    assert(response.statusCode === 400, 'Status code should be 400');
    assert(response.data.error, 'Should return error message');
}

/**
 * Test: Create Token - Invalid TTL
 */
async function testCreateTokenInvalidTTL() {
    const response = await request(`${KAS_BASE_URL}/api/create-token`, {
        method: 'POST',
        body: {
            agentId: TEST_AGENT_ID,
            endpoint: TEST_ENDPOINT,
            ttlSeconds: 5000  // Too long (max 3600)
        }
    });
    
    assert(response.statusCode === 400, 'Status code should be 400');
    assert(response.data.error, 'Should return error message');
}

/**
 * Test: List Tokens
 */
async function testListTokens() {
    const response = await request(`${KAS_BASE_URL}/api/list-tokens`);
    
    assert(response.statusCode === 200, 'Status code should be 200');
    assert(response.data.success === true, 'Success should be true');
    assert(Array.isArray(response.data.tokens), 'Tokens should be an array');
    assert(response.data.count >= 0, 'Count should be a number');
}

/**
 * Test: Validate Token - Success
 */
async function testValidateToken() {
    // Create a fresh token
    const createResponse = await request(`${KAS_BASE_URL}/api/create-token`, {
        method: 'POST',
        body: {
            agentId: TEST_AGENT_ID,
            endpoint: TEST_ENDPOINT,
            ttlSeconds: 60
        }
    });
    
    const token = createResponse.data.token;
    
    // Validate the token
    const response = await request(`${KAS_BASE_URL}/api/validate-token`, {
        method: 'POST',
        body: {
            token: token,
            endpoint: TEST_ENDPOINT
        }
    });
    
    assert(response.statusCode === 200, 'Status code should be 200');
    assert(response.data.success === true, 'Success should be true');
    assert(response.data.agentId === TEST_AGENT_ID, 'Agent ID should match');
    assert(response.data.endpoint === TEST_ENDPOINT, 'Endpoint should match');
}

/**
 * Test: Validate Token - Single Use Enforcement
 */
async function testValidateTokenSingleUse() {
    // Create a fresh token
    const createResponse = await request(`${KAS_BASE_URL}/api/create-token`, {
        method: 'POST',
        body: {
            agentId: TEST_AGENT_ID,
            endpoint: TEST_ENDPOINT,
            ttlSeconds: 60
        }
    });
    
    const token = createResponse.data.token;
    
    // First validation should succeed
    const firstResponse = await request(`${KAS_BASE_URL}/api/validate-token`, {
        method: 'POST',
        body: {
            token: token,
            endpoint: TEST_ENDPOINT
        }
    });
    
    assert(firstResponse.statusCode === 200, 'First validation should succeed');
    
    // Second validation should fail (already used)
    const secondResponse = await request(`${KAS_BASE_URL}/api/validate-token`, {
        method: 'POST',
        body: {
            token: token,
            endpoint: TEST_ENDPOINT
        }
    });
    
    assert(secondResponse.statusCode === 401, 'Second validation should fail');
    assert(secondResponse.data.error.includes('already been used'), 'Should indicate token was used');
}

/**
 * Test: Validate Token - Endpoint Mismatch
 */
async function testValidateTokenEndpointMismatch() {
    // Create a fresh token
    const createResponse = await request(`${KAS_BASE_URL}/api/create-token`, {
        method: 'POST',
        body: {
            agentId: TEST_AGENT_ID,
            endpoint: TEST_ENDPOINT,
            ttlSeconds: 60
        }
    });
    
    const token = createResponse.data.token;
    
    // Validate with wrong endpoint
    const response = await request(`${KAS_BASE_URL}/api/validate-token`, {
        method: 'POST',
        body: {
            token: token,
            endpoint: '/api/wrong-endpoint'
        }
    });
    
    assert(response.statusCode === 401, 'Status code should be 401');
    assert(response.data.error.includes('Endpoint mismatch'), 'Should indicate endpoint mismatch');
}

/**
 * Test: Validate Token - Expired Token
 */
async function testValidateTokenExpired() {
    // Create a token with 1 second TTL
    const createResponse = await request(`${KAS_BASE_URL}/api/create-token`, {
        method: 'POST',
        body: {
            agentId: TEST_AGENT_ID,
            endpoint: TEST_ENDPOINT,
            ttlSeconds: 1
        }
    });
    
    const token = createResponse.data.token;
    
    // Wait for token to expire
    await sleep(2000);
    
    // Validate the expired token
    const response = await request(`${KAS_BASE_URL}/api/validate-token`, {
        method: 'POST',
        body: {
            token: token,
            endpoint: TEST_ENDPOINT
        }
    });
    
    assert(response.statusCode === 401, 'Status code should be 401');
    assert(response.data.error.includes('expired'), 'Should indicate token expired');
}

/**
 * Test: Validate Token - Invalid Token Format
 */
async function testValidateTokenInvalidFormat() {
    const response = await request(`${KAS_BASE_URL}/api/validate-token`, {
        method: 'POST',
        body: {
            token: 'invalid-token-format',
            endpoint: TEST_ENDPOINT
        }
    });
    
    assert(response.statusCode === 401, 'Status code should be 401');
    assert(response.data.error, 'Should return error message');
}

/**
 * Test: Validate Token - Missing Token
 */
async function testValidateTokenMissingToken() {
    const response = await request(`${KAS_BASE_URL}/api/validate-token`, {
        method: 'POST',
        body: {
            endpoint: TEST_ENDPOINT
        }
    });
    
    assert(response.statusCode === 400, 'Status code should be 400');
    assert(response.data.error, 'Should return error message');
}

/**
 * Test: Invalidate Token
 */
async function testInvalidateToken() {
    // Create a fresh token
    const createResponse = await request(`${KAS_BASE_URL}/api/create-token`, {
        method: 'POST',
        body: {
            agentId: TEST_AGENT_ID,
            endpoint: TEST_ENDPOINT,
            ttlSeconds: 60
        }
    });
    
    const token = createResponse.data.token;
    
    // Invalidate the token
    const invalidateResponse = await request(`${KAS_BASE_URL}/api/invalidate-token`, {
        method: 'POST',
        body: { token: token }
    });
    
    assert(invalidateResponse.statusCode === 200, 'Invalidation should succeed');
    assert(invalidateResponse.data.success === true, 'Success should be true');
    
    // Try to validate the invalidated token
    const validateResponse = await request(`${KAS_BASE_URL}/api/validate-token`, {
        method: 'POST',
        body: {
            token: token,
            endpoint: TEST_ENDPOINT
        }
    });
    
    assert(validateResponse.statusCode === 401, 'Validation should fail');
    assert(validateResponse.data.error.includes('invalidated'), 'Should indicate token was invalidated');
}

/**
 * Test: Payload Hash Validation
 */
async function testPayloadHashValidation() {
    const payloadHash = 'test-hash-12345';
    
    // Create token with payload hash
    const createResponse = await request(`${KAS_BASE_URL}/api/create-token`, {
        method: 'POST',
        body: {
            agentId: TEST_AGENT_ID,
            endpoint: TEST_ENDPOINT,
            ttlSeconds: 60,
            payloadHash: payloadHash
        }
    });
    
    const token = createResponse.data.token;
    
    // Validate with correct payload hash
    const correctResponse = await request(`${KAS_BASE_URL}/api/validate-token`, {
        method: 'POST',
        body: {
            token: token,
            endpoint: TEST_ENDPOINT,
            payloadHash: payloadHash
        }
    });
    
    assert(correctResponse.statusCode === 200, 'Should succeed with correct hash');
    
    // Create another token
    const createResponse2 = await request(`${KAS_BASE_URL}/api/create-token`, {
        method: 'POST',
        body: {
            agentId: TEST_AGENT_ID,
            endpoint: TEST_ENDPOINT,
            ttlSeconds: 60,
            payloadHash: payloadHash
        }
    });
    
    const token2 = createResponse2.data.token;
    
    // Validate with wrong payload hash
    const wrongResponse = await request(`${KAS_BASE_URL}/api/validate-token`, {
        method: 'POST',
        body: {
            token: token2,
            endpoint: TEST_ENDPOINT,
            payloadHash: 'wrong-hash'
        }
    });
    
    assert(wrongResponse.statusCode === 401, 'Should fail with wrong hash');
    assert(wrongResponse.data.error.includes('hash mismatch'), 'Should indicate hash mismatch');
}

/**
 * Test: Cleanup Tokens
 */
async function testCleanupTokens() {
    const response = await request(`${KAS_BASE_URL}/api/cleanup-tokens`, {
        method: 'POST'
    });
    
    assert(response.statusCode === 200, 'Status code should be 200');
    assert(response.data.success === true, 'Success should be true');
    assert(typeof response.data.remaining === 'number', 'Should return remaining count');
}

/**
 * Test: Agent Request Flow (Complete Authentication Flow)
 */
async function testAgentRequestFlow() {
    const agentId = 'test-agent-complete-flow';
    const endpoint = '/api/agent-protected-resource';
    
    // Step 1: Agent creates API key (one-time setup)
    const keyResponse = await request(`${KAS_BASE_URL}/api/create-key`, {
        method: 'POST',
        body: { agentId: agentId }
    });
    
    assert(keyResponse.statusCode === 201, 'API key creation should succeed');
    const apiKey = keyResponse.data.apiKey;
    
    // Step 2: Agent requests single-use token for specific endpoint
    const tokenResponse = await request(`${KAS_BASE_URL}/api/create-token`, {
        method: 'POST',
        body: {
            agentId: agentId,
            endpoint: endpoint,
            ttlSeconds: 60
        }
    });
    
    assert(tokenResponse.statusCode === 201, 'Token creation should succeed');
    const token = tokenResponse.data.token;
    
    // Step 3: Agent makes request with token (validates automatically)
    const validateResponse = await request(`${KAS_BASE_URL}/api/validate-token`, {
        method: 'POST',
        body: {
            token: token,
            endpoint: endpoint
        }
    });
    
    assert(validateResponse.statusCode === 200, 'Token validation should succeed');
    assert(validateResponse.data.agentId === agentId, 'Agent ID should match');
    
    // Step 4: Verify token cannot be reused
    const reuseResponse = await request(`${KAS_BASE_URL}/api/validate-token`, {
        method: 'POST',
        body: {
            token: token,
            endpoint: endpoint
        }
    });
    
    assert(reuseResponse.statusCode === 401, 'Token reuse should fail');
}

/**
 * Main test runner
 */
async function runAllTests() {
    console.log('\n' + colors.cyan + '═══════════════════════════════════════════════════════════════' + colors.reset);
    console.log(colors.cyan + '  KAS Authentication Test Suite' + colors.reset);
    console.log(colors.cyan + '═══════════════════════════════════════════════════════════════' + colors.reset + '\n');
    
    console.log(`${colors.dim}Testing against: ${KAS_BASE_URL}${colors.reset}\n`);
    
    // Check if backend is running
    try {
        await request(`${KAS_BASE_URL}/health`);
    } catch (error) {
        console.log(`${colors.red}✗ KAS backend is not running!${colors.reset}`);
        console.log(`${colors.yellow}Please start the backend: npm run kas${colors.reset}\n`);
        process.exit(1);
    }
    
    // Health and Basic Tests
    console.log(colors.blue + 'Health & Basic Tests' + colors.reset);
    await runTest('Health check', testHealthCheck);
    
    // API Key Tests
    console.log('\n' + colors.blue + 'API Key Tests' + colors.reset);
    await runTest('Create API key', testCreateApiKey);
    await runTest('Create API key - missing agent ID', testCreateApiKeyMissingAgentId);
    await runTest('List API keys', testListApiKeys);
    
    // Token Creation Tests
    console.log('\n' + colors.blue + 'Token Creation Tests' + colors.reset);
    await runTest('Create single-use token', testCreateToken);
    await runTest('Create token - missing fields', testCreateTokenMissingFields);
    await runTest('Create token - invalid TTL', testCreateTokenInvalidTTL);
    await runTest('List tokens', testListTokens);
    
    // Token Validation Tests
    console.log('\n' + colors.blue + 'Token Validation Tests' + colors.reset);
    await runTest('Validate token - success', testValidateToken);
    await runTest('Validate token - single use enforcement', testValidateTokenSingleUse);
    await runTest('Validate token - endpoint mismatch', testValidateTokenEndpointMismatch);
    await runTest('Validate token - expired token', testValidateTokenExpired);
    await runTest('Validate token - invalid format', testValidateTokenInvalidFormat);
    await runTest('Validate token - missing token', testValidateTokenMissingToken);
    
    // Token Invalidation Tests
    console.log('\n' + colors.blue + 'Token Invalidation Tests' + colors.reset);
    await runTest('Invalidate token', testInvalidateToken);
    
    // Advanced Tests
    console.log('\n' + colors.blue + 'Advanced Tests' + colors.reset);
    await runTest('Payload hash validation', testPayloadHashValidation);
    await runTest('Cleanup tokens', testCleanupTokens);
    
    // Complete Flow Tests
    console.log('\n' + colors.blue + 'Complete Agent Flow Tests' + colors.reset);
    await runTest('Agent request flow (complete)', testAgentRequestFlow);
    
    // Print summary
    console.log('\n' + colors.cyan + '═══════════════════════════════════════════════════════════════' + colors.reset);
    console.log(colors.cyan + '  Test Summary' + colors.reset);
    console.log(colors.cyan + '═══════════════════════════════════════════════════════════════' + colors.reset + '\n');
    
    console.log(`  Total Tests:  ${totalTests}`);
    console.log(`  ${colors.green}Passed:       ${passedTests}${colors.reset}`);
    console.log(`  ${failedTests > 0 ? colors.red : colors.dim}Failed:       ${failedTests}${colors.reset}`);
    
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    console.log(`  Success Rate: ${successRate}%`);
    
    console.log('\n' + colors.cyan + '═══════════════════════════════════════════════════════════════' + colors.reset + '\n');
    
    // Exit with appropriate code
    process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch((error) => {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error);
    process.exit(1);
});
