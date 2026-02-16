# Autonomous API Key Management System

## Overview

The Autonomous API Key Management System provides a fully automated, self-healing solution for managing API keys across all services in the Barbrick Design platform. It handles key sourcing, validation, retry logic, fallback mechanisms, and health monitoring automatically.

## Features

✅ **Autonomous Key Sourcing** - Automatically finds API keys from multiple sources
✅ **Intelligent Retry Logic** - Exponential backoff with jitter for failed requests
✅ **Smart Fallback Chain** - Multiple fallback strategies when primary keys fail
✅ **Self-Healing** - Automatically recovers from failures and rotates keys
✅ **Health Monitoring** - Tracks key health and automatically disables unhealthy keys
✅ **Zero Configuration** - Works out of the box with sensible defaults
✅ **Pool Integration** - Supports shared API key pools for community contribution
✅ **Security First** - Validates keys, detects placeholders, prevents exposure

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Application Code                              │
│                                                                   │
│   await manager.getAPIKey('openai')                             │
│   await manager.executeWithRetry('github', apiCallFn)           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Autonomous API Key Manager                          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Key Sourcing │  │ Validation   │  │ Health Check │         │
│  │  Strategies  │  │   & Retry    │  │  Monitoring  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ User         │    │ Environment  │    │ Shared Pool  │
│ Provided     │    │ Variables    │    │ Manager      │
└──────────────┘    └──────────────┘    └──────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
                    ┌──────────────────┐
                    │ Known Working    │
                    │ Keys Registry    │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Fallback Mode    │
                    │ (Limited Func)   │
                    └──────────────────┘
```

## Key Sourcing Strategies

The system tries strategies in this order until a valid key is found:

1. **user_provided** - Explicitly set by user via `setAPIKey()`
2. **environment** - Environment variables (server-side)
3. **session_storage** - Temporary session storage (browser-side)
4. **pool_shared** - Shared community API key pool
5. **known_working** - Public/demo keys from known working keys registry
6. **fallback_mode** - Degraded operation with limited functionality

## Quick Start

### Installation

Include the autonomous manager in your HTML:

```html
<!-- Auto-inject (recommended) -->
<script src="src/utils/auto-inject-autonomous-keys.js"></script>

<!-- Or load manually -->
<script src="src/utils/api-key-validator.js"></script>
<script src="src/pool/api-key-pool-manager.js"></script>
<script src="src/utils/known-working-keys-registry.js"></script>
<script src="src/utils/autonomous-api-key-manager.js"></script>
```

### Basic Usage

```javascript
// Create manager instance (or use global window.autonomousAPIKeyManager)
const manager = new AutonomousAPIKeyManager();

// Get API key autonomously
const keyResult = await manager.getAPIKey('openai');
if (keyResult.success) {
    console.log(`Key sourced via ${keyResult.strategy}`);
    // Use keyResult.key
}

// Execute API call with automatic retry
const result = await manager.executeWithRetry('github', async (apiKey) => {
    const response = await fetch('https://api.github.com/user', {
        headers: {
            'Authorization': `token ${apiKey}`
        }
    });
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
});

if (result.success) {
    console.log('User data:', result.result);
}
```

### Using Global Convenience Methods

When using auto-inject, these global methods are available:

```javascript
// Get API key
const keyResult = await window.getAPIKey('openai');

// Set API key
window.setAPIKey('openai', 'sk-...');

// Execute with retry
const result = await window.executeWithRetry('samgov', apiCallFn);

// Helper for OpenAI
const chatResult = await window.callOpenAI('/chat/completions', {
    model: 'gpt-4',
    messages: [{ role: 'user', content: 'Hello!' }]
});

// Helper for GitHub
const repos = await window.callGitHub('/users/octocat/repos');

// Helper for SAM.gov
const contracts = await window.callSAMGov('/opportunities/v2/search', {
    limit: 10,
    postedFrom: '2024-01-01'
});
```

## Integration with Existing Code

### With AI API Connection Manager

```javascript
// AIAPIConnectionManager now automatically uses AutonomousAPIKeyManager
const connectionManager = new AIAPIConnectionManager();

// This will use autonomous key sourcing automatically
const response = await connectionManager.makeRequest('openai', '/chat/completions', {
    method: 'POST',
    body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello!' }]
    })
});
```

### Manual Integration

```javascript
// In your existing code, replace manual key management:

// OLD WAY:
const apiKey = process.env.OPENAI_API_KEY || localStorage.getItem('openai_key');
if (!apiKey) {
    throw new Error('API key required');
}

// NEW WAY:
const keyResult = await autonomousAPIKeyManager.getAPIKey('openai');
if (!keyResult.success) {
    // Graceful degradation or user guidance
    console.warn(keyResult.guidance);
    return;
}
const apiKey = keyResult.key;
```

## Advanced Features

### Custom Retry Configuration

```javascript
const manager = new AutonomousAPIKeyManager();

// Customize retry behavior
manager.retryConfig = {
    maxRetries: 3,
    baseDelayMs: 500,
    maxDelayMs: 10000,
    backoffMultiplier: 2,
    jitterMs: 500
};
```

### Retry Callbacks

```javascript
const result = await manager.executeWithRetry('openai', apiCallFn, {
    onRetry: (info) => {
        console.log(`Retry ${info.attempt}/${info.maxRetries}`);
        console.log(`Next retry in ${info.nextDelay}ms`);
        console.log(`Error: ${info.error.message}`);
        
        // Update UI to show retry status
        updateRetryIndicator(info);
    }
});
```

### Health Monitoring

```javascript
// Get diagnostics for all services
const diagnostics = manager.getDiagnostics();
console.log('Active keys:', diagnostics.activeKeys);
console.log('Health status:', diagnostics.health);

// Get diagnostics for specific service
const openaiDiag = manager.getDiagnostics('openai');
console.log('OpenAI health:', openaiDiag.health);
```

### Cache Management

```javascript
// Clear cached key for a service (force refresh)
manager.clearCache('openai');

// Clear all cached keys
manager.clearAllCache();

// Force refresh on next request
const keyResult = await manager.getAPIKey('openai', {
    forceRefresh: true
});
```

## Supported Services

| Service | ID | Environment Variable | Free Tier | Public API |
|---------|-------|---------------------|-----------|------------|
| OpenAI | `openai` | `OPENAI_API_KEY` | ❌ | ❌ |
| Anthropic Claude | `anthropic` | `ANTHROPIC_API_KEY` | ❌ | ❌ |
| SAM.gov | `samgov` | `SAMGOV_API_KEY` | ✅ | ⚠️ Demo |
| GitHub | `github` | `GITHUB_TOKEN` | ✅ | ✅ Limited |
| Etherscan | `etherscan` | `ETHERSCAN_API_KEY` | ✅ | ⚠️ Limited |
| CoinGecko | `coingecko` | `COINGECKO_API_KEY` | ✅ | ✅ Full |
| Infura | `infura` | `INFURA_PROJECT_ID` | ✅ | ❌ |
| PayPal | `paypal` | `PAYPAL_CLIENT_ID` | ✅ Sandbox | ❌ |

## Error Handling

The system provides graceful error handling with user guidance:

```javascript
const keyResult = await manager.getAPIKey('openai');

if (!keyResult.success) {
    console.error('Failed to get API key:', keyResult.error);
    
    // Get user guidance
    if (keyResult.guidance) {
        console.log('Get your key:', keyResult.guidance.getKeyUrl);
        console.log('Free tier available:', keyResult.guidance.freeTier);
        console.log('Alternatives:', keyResult.guidance.alternatives);
    }
    
    // Check if fallback mode is available
    if (keyResult.fallbackMode) {
        console.log('Operating in fallback mode with limited functionality');
    }
}
```

## Security Best Practices

### ✅ DO:
- Use environment variables for server-side code
- Use session storage for browser-side (expires with session)
- Validate keys before storing
- Clear keys on logout
- Use the autonomous manager's built-in validation

### ❌ DON'T:
- Hard-code API keys in source code
- Store keys in localStorage (use sessionStorage)
- Commit `.env` files to version control
- Share production keys publicly
- Disable validation in production

## Testing

### Test Suite

Open `test-autonomous-api-keys.html` in your browser to:
- Test key retrieval from different strategies
- Set user API keys
- Test retry logic and fallback
- Execute real API calls
- View system diagnostics
- Manage cached keys

### Unit Testing

```javascript
// Test key retrieval
const keyResult = await manager.getAPIKey('github');
assert(keyResult.success || keyResult.fallbackMode);

// Test key validation
const validation = manager.validateKey('openai', 'sk-test123', 'user_provided');
assert(!validation.valid); // Should fail (too short)

// Test retry calculation
const delay = manager.calculateRetryDelay(3);
assert(delay >= 1000 && delay <= 10000);
```

## Troubleshooting

### No API Key Found

**Symptom**: `getAPIKey()` returns `success: false`

**Solutions**:
1. Set key explicitly: `manager.setAPIKey('service', 'key')`
2. Set environment variable (server-side)
3. Store in session storage (browser-side)
4. Check known working keys registry
5. Use fallback mode if available

### Validation Errors

**Symptom**: Key rejected as invalid

**Solutions**:
1. Check key format (e.g., OpenAI keys start with `sk-`)
2. Ensure key is not a placeholder (`your_key_here`, etc.)
3. Verify key length (minimum 10 characters)
4. Check for spaces or special characters

### Retry Exhausted

**Symptom**: `executeWithRetry()` fails after max retries

**Solutions**:
1. Check API service status
2. Verify API key is valid and active
3. Check rate limits
4. Increase max retries if needed
5. Try different key strategy

### Health Status Unhealthy

**Symptom**: Service marked as unhealthy

**Solutions**:
1. Check recent error logs
2. Clear cache and retry: `manager.clearCache('service')`
3. Set new API key
4. Wait for automatic recovery (health checks run every 5 minutes)

## Contributing

To add support for a new service:

1. Update `services` in `AutonomousAPIKeyManager`
2. Add environment variable mapping
3. Add validation rules in `ApiKeyValidator`
4. Add known keys in `KnownWorkingKeysRegistry`
5. Update documentation

## API Reference

See inline JSDoc comments in source files for detailed API documentation.

## License

Part of the Barbrick Design Platform
Contact: BarbrickDesign@gmail.com

## Related Documentation

- [API Key Validator](src/utils/api-key-validator.js)
- [API Key Pool Manager](src/pool/api-key-pool-manager.js)
- [Known Working Keys Registry](src/utils/known-working-keys-registry.js)
- [AI API Connection Manager](src/ai/api-connection-manager.js)
