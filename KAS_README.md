# Key Authority Service (KAS) - Production Crypto System

## Overview

The Key Authority Service (KAS) provides production-grade authentication for the Barbrick Design platform using real cryptographic methods (HMAC-SHA256 and JWT).

## What Changed

### Before (Fake Hash Demo)
- ❌ Pseudo-random strings
- ❌ Simple hash function (demo only)
- ❌ localStorage-based (client-side only)
- ❌ No real security

### After (Real Crypto)
- ✅ **HMAC-SHA256** for API key signing
- ✅ **JWT (JSON Web Tokens)** for single-use tokens
- ✅ **Node.js/Express backend** service
- ✅ **Production-ready security**
- ✅ **SDK for agents** to easily integrate

## Architecture

```
┌─────────────────┐
│   Frontend      │
│  (autoKey.html) │
│                 │
│   Uses KAS SDK  │
└────────┬────────┘
         │ HTTP/REST
         │
┌────────▼────────┐
│  Backend KAS    │
│   (Express)     │
│                 │
│  Port: 3010     │
│                 │
│  • HMAC signing │
│  • JWT tokens   │
│  • Validation   │
└─────────────────┘
```

## Features

### 1. Long-Lived API Keys (LLAK)
- **HMAC-SHA256** signed keys
- One-way hashing for secure storage
- Bound to specific agent IDs
- Never stored in plain text

### 2. Single-Use Tokens (SUAT)
- **JWT tokens** with claims
- Cryptographically signed with secret
- Automatic expiration
- Validates endpoint, payload, and claims
- Single-use enforcement

### 3. Token Validation
- Signature verification
- Expiration checking
- Endpoint matching
- Payload hash validation
- Single-use enforcement

## Quick Start

### 1. Set up environment variables

```bash
# Copy example file
cp .env.example .env

# Edit .env and set these variables:
JWT_SECRET=your-secure-random-secret-here
HMAC_SECRET=your-secure-hmac-secret-here
KAS_PORT=3010
CORS_ORIGIN=*
```

**⚠️ IMPORTANT**: Use strong, random secrets in production!

```bash
# Generate secure secrets:
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('HMAC_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the KAS service

```bash
# Option 1: Using npm script
npm run kas

# Option 2: Direct start
node backend/services/kas-service.js

# Option 3: Using starter script
node start-kas-service.js
```

You should see:

```
╔══════════════════════════════════════════════════════════╗
║   🔐 Key Authority Service (KAS)                        ║
╠══════════════════════════════════════════════════════════╣
║   Port:        3010                                      ║
║   Status:      Running                                   ║
║   Crypto:      HMAC-SHA256 + JWT (HS256)                ║
║   Environment: development                               ║
╠══════════════════════════════════════════════════════════╣
║   Endpoints:                                             ║
║   GET  /health              - Health check               ║
║   POST /api/create-key      - Create API key            ║
║   GET  /api/list-keys       - List API keys             ║
║   POST /api/create-token    - Create single-use token   ║
║   GET  /api/list-tokens     - List tokens               ║
║   POST /api/validate-token  - Validate token            ║
║   POST /api/invalidate-token- Invalidate token          ║
║   POST /api/cleanup-tokens  - Cleanup expired tokens    ║
╚══════════════════════════════════════════════════════════╝
```

### 4. Open the frontend

Open `autoKey.html` in your browser. You should see:
- Connection status indicator (should turn green when connected)
- UI for creating API keys and tokens
- Full testing interface

## Using the SDK

### In Agents (Node.js)

```javascript
// Import the SDK
const { KASSDK } = require('./src/utils/kas-sdk.js');

// Create SDK instance
const kas = new KASSDK({
    baseUrl: 'http://localhost:3010',
    agentId: 'my-agent-001',
    debug: true
});

// Check backend health
await kas.healthCheck();

// Create an API key
const keyResponse = await kas.createApiKey('my-agent-001');
console.log('API Key:', keyResponse.apiKey);  // Store this securely!

// Create a single-use token
const token = await kas.getToken('/api/protected-endpoint', {
    ttl: 60  // 60 seconds
});

// Use the token in an authenticated request
const result = await kas.callProtectedEndpoint('/api/protected-endpoint', {
    method: 'POST',
    body: { data: 'example' }
});
```

### In Browser

```html
<script src="src/utils/kas-sdk.js"></script>
<script>
    // Create SDK instance (window.KASSDK is available)
    const kas = new KASSDK({
        baseUrl: 'http://localhost:3010',
        agentId: 'browser-agent',
        debug: true
    });

    // Use the SDK
    async function authenticate() {
        const token = await kas.getToken('/api/data');
        console.log('Token:', token);
    }
</script>
```

## API Endpoints

### Health Check
```bash
curl http://localhost:3010/health
```

### Create API Key
```bash
curl -X POST http://localhost:3010/api/create-key \
  -H "Content-Type: application/json" \
  -d '{"agentId": "my-agent-001"}'
```

### Create Single-Use Token
```bash
curl -X POST http://localhost:3010/api/create-token \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "my-agent-001",
    "endpoint": "/api/protected-resource",
    "ttlSeconds": 60
  }'
```

### Validate Token
```bash
curl -X POST http://localhost:3010/api/validate-token \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "endpoint": "/api/protected-resource"
  }'
```

### List API Keys
```bash
curl http://localhost:3010/api/list-keys
```

### List Tokens
```bash
curl http://localhost:3010/api/list-tokens
```

## SDK Features

### Automatic Token Caching
The SDK caches tokens and automatically refreshes before expiration:

```javascript
const kas = new KASSDK({
    baseUrl: 'http://localhost:3010',
    agentId: 'my-agent',
    refreshThreshold: 30  // Refresh 30s before expiry
});

// First call - creates token
const token1 = await kas.getToken('/api/endpoint');

// Second call - uses cached token (if still valid)
const token2 = await kas.getToken('/api/endpoint');
```

### Automatic Retry with Backoff
Network errors trigger automatic retries with exponential backoff:

```javascript
const kas = new KASSDK({
    baseUrl: 'http://localhost:3010',
    maxRetries: 3,
    retryDelay: 1000  // Base delay in ms
});
```

### Debug Mode
Enable debug logging to see what's happening:

```javascript
const kas = new KASSDK({
    baseUrl: 'http://localhost:3010',
    debug: true  // Logs all operations
});
```

## Agent Integration Example

Here's a complete example of an agent using KAS:

```javascript
// src/agents/example-agent.js
const { KASSDK } = require('../utils/kas-sdk.js');

class ExampleAgent {
    constructor() {
        this.kas = new KASSDK({
            baseUrl: process.env.KAS_URL || 'http://localhost:3010',
            agentId: 'example-agent-001',
            debug: process.env.NODE_ENV === 'development'
        });
    }

    async init() {
        // Check KAS connection
        await this.kas.healthCheck();
        console.log('✅ Connected to KAS');
    }

    async performSecureTask() {
        try {
            // Get token for specific endpoint
            const token = await this.kas.getToken('/api/secure-operation');

            // Make authenticated request
            const result = await this.kas.callProtectedEndpoint(
                '/api/secure-operation',
                {
                    method: 'POST',
                    body: { task: 'process data' }
                }
            );

            console.log('Task result:', result);
            return result;

        } catch (error) {
            console.error('Secure task failed:', error);
            throw error;
        }
    }
}

module.exports = ExampleAgent;
```

## Security Best Practices

### 1. Secrets Management
- ✅ Use strong random secrets (64+ bytes)
- ✅ Store secrets in `.env` file (never commit)
- ✅ Rotate secrets periodically
- ✅ Use different secrets for dev/staging/production

### 2. Token TTL
- ✅ Use short TTL (60-300 seconds) for single-use tokens
- ✅ Longer TTL only for long-running operations
- ✅ Invalidate tokens after use

### 3. CORS Configuration
- ✅ Set specific origins in production (not `*`)
- ✅ Use environment variables for CORS config

### 4. HTTPS
- ✅ Always use HTTPS in production
- ✅ Never send tokens over unencrypted connections

### 5. Rate Limiting
- ✅ Implement rate limiting on production
- ✅ Monitor for suspicious activity

## Troubleshooting

### Backend won't start
```bash
# Check if port 3010 is already in use
lsof -i :3010

# Check environment variables
node -e "require('dotenv').config(); console.log(process.env.JWT_SECRET)"
```

### Frontend shows "Backend offline"
1. Make sure KAS service is running: `npm run kas`
2. Check console for errors
3. Verify backend URL in autoKey.html matches your setup

### Token validation fails
- Check token hasn't expired
- Verify endpoint matches exactly
- Ensure backend is using same JWT_SECRET

## Files

- `backend/services/kas-service.js` - Backend service
- `src/utils/kas-sdk.js` - Client SDK
- `autoKey.html` - Frontend demo/UI
- `start-kas-service.js` - Convenience starter script
- `.env.example` - Environment configuration template

## Testing

### Comprehensive Test Suite

A complete test suite is available that validates all authentication flows:

```bash
# Run the full test suite (starts backend automatically)
./test-autokey-authentication.sh

# Or run tests manually:
# 1. Start KAS backend
npm run kas

# 2. In another terminal, run tests
node backend/test-kas-authentication.js
```

The test suite includes:
- ✅ Health check and basic functionality
- ✅ API key creation and listing
- ✅ Token creation with various parameters
- ✅ Token validation (success and failure cases)
- ✅ Single-use token enforcement
- ✅ Token expiration handling
- ✅ Endpoint mismatch detection
- ✅ Token invalidation
- ✅ Payload hash validation
- ✅ Complete agent authentication flow

**Test Results**: All 18 tests pass with 100% success rate

### Manual Testing

1. Start KAS: `npm run kas`
2. Open `autoKey.html` in browser
3. Create API key
4. Create token
5. Validate token
6. Test protected endpoint

### Quick Testing

```bash
# Test backend health
curl http://localhost:3010/health

# Test SDK in Node
node -e "
const { KASSDK } = require('./src/utils/kas-sdk.js');
const kas = new KASSDK({ baseUrl: 'http://localhost:3010' });
kas.healthCheck().then(() => console.log('✅ SDK works'));
"
```

## Migration Notes

If you were using the old fake hash system:
1. Old tokens/keys in localStorage won't work with new backend
2. Agents need to be updated to use the KAS SDK
3. Protected endpoints need to validate with backend (not client-side)

## Support

- Email: BarbrickDesign@gmail.com
- GitHub: https://github.com/barbrickdesign/barbrickdesign.github.io
- Issues: Use GitHub Issues for bugs/features

## License

MIT License - See LICENSE file for details
