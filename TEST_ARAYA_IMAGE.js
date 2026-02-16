/**
 * ARAYA IMAGE FIX - TEST SCRIPT
 *
 * Tests image vision API with both working and broken scenarios
 * Run: node TEST_ARAYA_IMAGE.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Test configuration
const ENDPOINT = 'https://conciousnessrevolution.io/.netlify/functions/araya-chat';
const TEST_USER_ID = 'test_user_vision_fix';

// Simple test image (1x1 red pixel PNG in base64)
const TEST_IMAGE_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

// Test messages
const TEST_MESSAGES = [
    {
        role: 'user',
        content: 'What color is this pixel?',
        image: TEST_IMAGE_BASE64
    }
];

console.log('🧪 ARAYA IMAGE VISION TEST\n');
console.log(`Endpoint: ${ENDPOINT}`);
console.log(`User ID: ${TEST_USER_ID}\n`);

/**
 * Send test request to Araya chat endpoint
 */
async function testImageVision() {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({
            messages: TEST_MESSAGES,
            user_id: TEST_USER_ID
        });

        const url = new URL(ENDPOINT);
        const options = {
            hostname: url.hostname,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        console.log('📤 Sending test request...\n');

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve({ statusCode: res.statusCode, headers: res.headers, body: response });
                } catch (err) {
                    reject(new Error(`Failed to parse response: ${err.message}\n\nRaw response: ${data}`));
                }
            });
        });

        req.on('error', (err) => {
            reject(new Error(`Request failed: ${err.message}`));
        });

        req.write(payload);
        req.end();
    });
}

/**
 * Test using curl command (alternative test method)
 */
function generateCurlCommand() {
    const payload = {
        messages: TEST_MESSAGES,
        user_id: TEST_USER_ID
    };

    const curlCmd = `curl -X POST ${ENDPOINT} \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(payload, null, 2).replace(/'/g, "'\\''")}' \\
  | jq .`;

    return curlCmd;
}

/**
 * Analyze test results
 */
function analyzeResults(result) {
    console.log('📊 TEST RESULTS:\n');

    console.log(`Status Code: ${result.statusCode}`);

    if (result.statusCode === 200) {
        console.log('✅ Request successful\n');

        const { response, apiMode, conversation_id } = result.body;

        console.log('API Mode:', apiMode);
        console.log('Conversation ID:', conversation_id);
        console.log('\nResponse:', response, '\n');

        // Check which API was used
        if (apiMode === 'claude') {
            console.log('✅ Claude Vision PRIMARY path worked');
        } else if (apiMode === 'openai_vision_fallback') {
            console.log('🔄 OpenAI Vision FALLBACK path worked (Claude failed)');
            console.log('   → This is expected behavior when Claude Vision has issues');
        } else if (apiMode === 'vision_failure') {
            console.log('❌ BOTH vision APIs failed');
            console.log('   → Check Supabase bugs table for logged error');
            console.log('   → Response should contain error details');
        } else {
            console.log('⚠️  Unexpected API mode:', apiMode);
        }

        // Check for error indicators in response
        if (response.includes('🔴 Error details:')) {
            console.log('\n⚠️  Error message detected in response');
            console.log('   → Both APIs failed (expected for testing)');
        } else if (response.toLowerCase().includes('red') || response.toLowerCase().includes('pixel')) {
            console.log('\n✅ Vision API successfully analyzed the image');
        } else {
            console.log('\n⚠️  Response may not be vision-related');
        }

    } else {
        console.log(`❌ Request failed with status ${result.statusCode}\n`);
        console.log('Response:', JSON.stringify(result.body, null, 2));
    }
}

/**
 * Main test execution
 */
async function runTests() {
    console.log('════════════════════════════════════════════════════════════\n');

    try {
        const result = await testImageVision();
        analyzeResults(result);

        console.log('\n════════════════════════════════════════════════════════════\n');
        console.log('📋 ALTERNATIVE TEST METHOD (CURL):\n');
        console.log(generateCurlCommand());
        console.log('\n════════════════════════════════════════════════════════════\n');

        console.log('✅ TEST COMPLETE\n');
        console.log('Expected behaviors:');
        console.log('  1. apiMode="claude" → Claude Vision worked (primary)');
        console.log('  2. apiMode="openai_vision_fallback" → OpenAI Vision worked (fallback)');
        console.log('  3. apiMode="vision_failure" → Both failed (error logged to Supabase)\n');

        console.log('Logs to check:');
        console.log('  - Netlify function logs for emoji indicators (🔄 ✅ ❌)');
        console.log('  - Supabase bugs table for auto-logged failures\n');

    } catch (err) {
        console.error('❌ TEST FAILED:', err.message);
        console.error('\nPossible issues:');
        console.error('  - Endpoint not deployed or unreachable');
        console.error('  - Network connectivity issues');
        console.error('  - API keys missing or invalid\n');

        console.log('Try the curl command manually:');
        console.log(generateCurlCommand());
        process.exit(1);
    }
}

// Run the tests
runTests();
