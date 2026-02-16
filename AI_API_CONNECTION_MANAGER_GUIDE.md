# AI API Connection Manager - Complete Guide

## Overview

The AI API Connection Manager is a centralized system for handling all external API connections across the BarbrickDesign platform. It provides automatic endpoint discovery, intelligent retry logic, secure key management, and graceful fallbacks.

## Features

### 🔌 Automatic Connection Management
- Auto-discovers API endpoints in your code
- Manages connections to all supported services
- Provides connection health monitoring

### 🔄 Intelligent Retry Logic
- Exponential backoff for failed requests
- Automatic retries for network errors
- Rate limit handling with smart delays

### 🔐 Secure API Key Management
- Integration with ApiKeyValidator for validation
- Support for environment variables
- Session-based storage (secure)
- Never exposes keys in error messages

### 🛡️ Graceful Fallbacks
- Mock responses when APIs unavailable
- Demo mode for development/testing
- Clear user messaging about limitations

### 🔍 Connection Diagnostics
- Real-time connection status dashboard
- Endpoint discovery and mapping
- Service health monitoring

## Supported Services

### AI Services
- **OpenAI** - GPT models, DALL-E, Sora, Whisper
- **Anthropic** - Claude models

### Government/Contract Data
- **SAM.gov** - Government contract opportunities

### Blockchain APIs
- **Etherscan** - Ethereum blockchain data
- **Infura** - Web3 provider
- **CoinGecko** - Cryptocurrency prices

### Development Tools
- **GitHub** - Repository and workflow management

### Payment Processing
- **PayPal** - Payment automation

## Installation

### Method 1: Auto-Inject (Recommended)

Add this single line to your HTML file:

```html
<script src="js/api-connection-auto-inject.js"></script>
```

This automatically loads and configures the connection manager with all dependencies.

### Method 2: Manual Loading

Load dependencies in order:

```html
<script src="src/utils/api-key-validator.js"></script>
<script src="src/ai/api-connection-manager.js"></script>
```

## Quick Start

### 1. Basic Usage

```javascript
// The manager is automatically initialized as window.apiConnectionManager
const manager = window.apiConnectionManager;

// Set an API key
manager.setApiKey('openai', 'sk-your-api-key-here');

// Make a request
const response = await manager.makeRequest('openai', '/chat/completions', {
    method: 'POST',
    body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello!' }]
    })
});
```

### 2. Check Connection Status

```javascript
// Show dashboard in console
apiConnectionManager.showDashboard();

// Get status programmatically
const status = apiConnectionManager.getConnectionStatus();
console.log(status);

// Quick shortcuts
apiStatus();           // Show dashboard
apiTest('openai');     // Test specific service
apiSetKey('openai', 'key'); // Set API key
```

### 3. Discover Endpoints

```javascript
// Auto-discover API usage on current page
const result = await apiConnectionManager.autoLink();
console.log(`Found ${result.discovered} endpoints across ${result.linked} services`);
```

## Configuration Methods

### Environment Variables (Server-side)

Create `.env` file:
```bash
OPENAI_API_KEY=sk-your-key-here
SAMGOV_API_KEY=your-key-here
GITHUB_TOKEN=ghp_your-token-here
```

### Session Storage (Browser)

```javascript
// Preferred - cleared when browser closes
sessionStorage.setItem('openai_api_key', 'sk-your-key');
```

### Direct Configuration

```javascript
// Using the manager
apiConnectionManager.setApiKey('openai', 'sk-your-key');

// Or with validation
const manager = apiConnectionManager;
const isValid = manager.setApiKey('openai', 'sk-your-key');
if (!isValid) {
    console.error('Invalid API key format');
}
```

## Advanced Usage

### Making Requests with Retry Logic

```javascript
// The manager automatically handles retries, rate limits, and errors
try {
    const data = await manager.makeRequest('samgov', '/opportunities/v2/search', {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    });
    
    console.log('Data:', data);
} catch (error) {
    console.error('Request failed after retries:', error.message);
}
```

### Testing Connections

```javascript
// Test a specific service
const result = await apiConnectionManager.testConnection('openai');
if (result.success) {
    console.log('✅ OpenAI connected successfully');
} else {
    console.error('❌ Connection failed:', result.error);
}

// Test all configured services
const services = ['openai', 'samgov', 'github'];
for (const service of services) {
    const result = await apiConnectionManager.testConnection(service);
    console.log(`${service}: ${result.success ? '✅' : '❌'}`);
}
```

### Using Fallback Mode

Services with `fallbackAvailable: true` provide mock data when no API key is configured:

```javascript
// Works even without API key (returns demo data)
const manager = apiConnectionManager;
const result = await manager.makeRequest('samgov', '/opportunities/v2/search');

// Result will be mock data with clear indication
console.log(result); // { data: [...demo contracts...] }
```

### Integration with OpenAI Orchestrator

The manager automatically syncs with the existing OpenAI Orchestrator:

```javascript
// If OpenAI Orchestrator has a key, it's automatically synced
// If manager has a key, it's automatically provided to orchestrator

// Verify sync
if (window.openAIOrchestrator && window.apiConnectionManager) {
    console.log('OpenAI Orchestrator:', window.openAIOrchestrator.apiKey ? 'configured' : 'not configured');
    console.log('Connection Manager:', window.apiConnectionManager.connections.openai.apiKey ? 'configured' : 'not configured');
}
```

## Error Handling

### Automatic Retry for Common Errors

```javascript
// These are handled automatically:
// - Network errors → retry with backoff
// - Rate limits (429) → wait and retry
// - Server errors (5xx) → retry with backoff
// - Timeout errors → retry

// No special code needed - just catch final failure
try {
    const result = await manager.makeRequest('openai', '/chat/completions', options);
} catch (error) {
    // Only thrown after all retries exhausted
    console.error('Request failed permanently:', error);
}
```

### Handling Different Error Types

```javascript
try {
    const result = await manager.makeRequest('openai', '/chat/completions', options);
} catch (error) {
    if (error.message.includes('Authentication failed')) {
        // Invalid API key
        alert('Please check your API key');
    } else if (error.message.includes('Rate limit')) {
        // Rate limited even after retries
        alert('Too many requests. Please try again later.');
    } else if (error.message.includes('Server error')) {
        // Service is down
        alert('Service temporarily unavailable');
    } else {
        // Other errors
        alert('An error occurred: ' + error.message);
    }
}
```

## Service-Specific Examples

### OpenAI

```javascript
// Chat completion
const response = await manager.makeRequest('openai', '/chat/completions', {
    method: 'POST',
    body: JSON.stringify({
        model: 'gpt-4',
        messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'What is AI?' }
        ]
    })
});

console.log(response.choices[0].message.content);
```

### SAM.gov

```javascript
// Search for contracts
const contracts = await manager.makeRequest('samgov', '/opportunities/v2/search', {
    method: 'GET',
    headers: {
        'Accept': 'application/json'
    }
});

contracts.data.forEach(contract => {
    console.log(contract.title, contract.value);
});
```

### GitHub

```javascript
// Get user information
const user = await manager.makeRequest('github', '/user', {
    method: 'GET'
});

console.log('GitHub user:', user.login);

// List repositories
const repos = await manager.makeRequest('github', '/user/repos', {
    method: 'GET'
});

console.log(`Found ${repos.length} repositories`);
```

### Etherscan

```javascript
// Get wallet balance
const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
const balance = await manager.makeRequest('etherscan', 
    `?module=account&action=balance&address=${address}`
);

console.log('Balance:', balance.result);
```

## Dashboard & Monitoring

### Console Dashboard

```javascript
// Show full status dashboard
apiConnectionManager.showDashboard();

// Output:
// 🔌 API Connection Status Dashboard
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ OpenAI              CONNECTED
//    🔑 API key: configured
//    🕐 Last checked: 12/31/2025, 1:39:00 PM
//
// 🟡 SAM.gov             READY
//    🔑 API key: configured
//    ℹ️  Fallback mode: available
// ...
```

### Programmatic Status Check

```javascript
const status = apiConnectionManager.getConnectionStatus();

for (const [serviceId, info] of Object.entries(status)) {
    console.log(`${info.name}:`);
    console.log(`  Status: ${info.status}`);
    console.log(`  Has Key: ${info.hasKey}`);
    console.log(`  Fallback: ${info.fallbackAvailable}`);
}
```

### Connection Health

```javascript
// Get connection object for specific service
const openaiConnection = apiConnectionManager.connections.openai;

console.log('Status:', openaiConnection.status);
console.log('Last Error:', openaiConnection.error);
console.log('Last Checked:', openaiConnection.lastChecked);
console.log('Retry Count:', openaiConnection.retryCount);
```

## Best Practices

### 1. API Key Security

```javascript
// ✅ DO: Use environment variables
const key = process.env.OPENAI_API_KEY;
manager.setApiKey('openai', key);

// ✅ DO: Use sessionStorage (cleared on browser close)
manager.setApiKey('openai', sessionStorage.getItem('openai_api_key'));

// ❌ DON'T: Hardcode keys
// manager.setApiKey('openai', 'sk-hardcoded-key-here'); // BAD!

// ❌ DON'T: Store in localStorage (persists forever)
// localStorage.setItem('openai_api_key', key); // AVOID
```

### 2. Error Handling

```javascript
// ✅ DO: Handle errors gracefully with user-friendly messages
try {
    const result = await manager.makeRequest('openai', endpoint, options);
} catch (error) {
    showToast('Unable to connect to AI service. Please try again later.', 5000, 'error');
    console.error('OpenAI error:', error);
}

// ❌ DON'T: Expose technical errors to users
// alert(error.message); // BAD - exposes technical details
```

### 3. Use Fallbacks When Available

```javascript
// ✅ DO: Take advantage of fallback mode for non-critical features
const manager = apiConnectionManager;

// This works even without API key for services with fallbacks
const result = await manager.makeRequest('samgov', '/opportunities');

// Check if using fallback
if (result.error === 'fallback') {
    console.log('Using demo data - configure API key for live data');
}
```

### 4. Test Connections Before Critical Operations

```javascript
// ✅ DO: Test connection before starting important workflow
async function processWithAI() {
    const test = await manager.testConnection('openai');
    
    if (!test.success) {
        alert('AI service unavailable. Please configure your API key.');
        return;
    }
    
    // Proceed with AI operations
    const result = await manager.makeRequest('openai', ...);
}
```

### 5. Monitor Connection Health

```javascript
// ✅ DO: Check health periodically for long-running apps
setInterval(() => {
    const status = manager.getConnectionStatus();
    
    // Alert if critical services are down
    if (status.openai.status === 'error') {
        console.warn('OpenAI service experiencing issues');
    }
}, 60000); // Check every minute
```

## Troubleshooting

### Problem: "API key is required" error

**Solution:**
```javascript
// Check if key is configured
const status = apiConnectionManager.getConnectionStatus();
console.log('OpenAI has key:', status.openai.hasKey);

// Set the key
apiSetKey('openai', 'sk-your-key-here');

// Verify
apiStatus();
```

### Problem: Connection always fails

**Solution:**
```javascript
// Test the connection
const result = await apiConnectionManager.testConnection('openai');
console.log('Test result:', result);

// Check for specific errors
if (result.error.includes('Authentication')) {
    console.log('Invalid API key - get new key from provider');
} else if (result.error.includes('network')) {
    console.log('Network issue - check internet connection');
}
```

### Problem: Rate limited

**Solution:**
```javascript
// The manager automatically retries with backoff
// If still rate limited, wait longer before retrying

// Check retry status
const connection = apiConnectionManager.connections.openai;
console.log('Current retry count:', connection.retryCount);
console.log('Status:', connection.status);

// Wait and try again later
setTimeout(async () => {
    const result = await apiConnectionManager.makeRequest(...);
}, 60000); // Wait 1 minute
```

### Problem: Fallback data not showing

**Solution:**
```javascript
// Check if fallback is available
const service = apiConnectionManager.services.openai;
console.log('Fallback available:', service.fallbackAvailable);

// Some services don't have fallbacks (GitHub, Infura, PayPal)
// For these, you must provide a valid API key
```

## Integration with Existing Systems

### With OpenAI Orchestrator

```javascript
// Automatic sync - no code needed
// If you set key in one, it's available in both

// Manual sync if needed
const orchestrator = window.openAIOrchestrator;
const manager = window.apiConnectionManager;

// Copy from orchestrator to manager
if (orchestrator.apiKey) {
    manager.setApiKey('openai', orchestrator.apiKey);
}

// Copy from manager to orchestrator
const openaiKey = manager.getApiKey('openai');
if (openaiKey) {
    orchestrator.setApiKey(openaiKey);
}
```

### With ApiKeyValidator

```javascript
// The manager uses ApiKeyValidator automatically
// All keys are validated before being stored

// Manual validation
const validator = window.ApiKeyValidator ? new window.ApiKeyValidator() : null;
const validation = validator.validate('sk-test-key', 'openai');

if (!validation.valid) {
    console.error('Invalid key:', validation.error);
}
```

## API Reference

### Methods

#### `setApiKey(serviceId, apiKey)`
Configure API key for a service
- Returns: `boolean` - true if valid and stored

#### `getApiKey(serviceId)`
Retrieve API key from storage
- Returns: `string|null` - API key or null

#### `makeRequest(serviceId, endpoint, options)`
Make API request with automatic retry
- Returns: `Promise<any>` - API response

#### `testConnection(serviceId)`
Test connection to a service
- Returns: `Promise<{success, error, status}>` - Test result

#### `getConnectionStatus()`
Get status of all services
- Returns: `Object` - Status map

#### `discoverEndpoints()`
Find API endpoints in current page
- Returns: `Array<{service, url, location}>` - Discovered endpoints

#### `autoLink()`
Auto-discover and report on API usage
- Returns: `Promise<{linked, discovered, services}>` - Discovery results

#### `showDashboard()`
Display connection status in console
- Returns: `void`

#### `clearAllKeys()`
Clear all stored API keys
- Returns: `void`

### Properties

#### `services`
Map of all supported services and their configuration

#### `connections`
Current connection status for each service

#### `retryConfig`
Configuration for retry logic

## Support

For issues or questions:

1. Check this guide
2. Run `apiConnectionManager.showDashboard()` to diagnose
3. Review `API_KEY_CONFIGURATION_GUIDE.md`
4. Check console for detailed error messages
5. Contact the development team

---

**Version:** 1.0.0  
**Last Updated:** 2025-12-31
