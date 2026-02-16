# Known Working Keys Feature

## Overview

The **Known Working Keys** feature provides automatic discovery and usage of publicly available API keys and endpoints. This allows developers to test and use API integrations without requiring personal API credentials.

## What are Known Working Keys?

Known working keys are:
- **Demo/Test API keys** provided by service providers for testing
- **Public API endpoints** that don't require authentication
- **Free tier services** with documented access methods
- **Community-verified working keys** that are safe to use

## Supported Services

### ✅ Services with Known Working Keys

1. **SAM.gov** - Government Contract Opportunities
   - Known Key: `DEMO_KEY` (Official demo key)
   - Limitations: Limited rate limits, demo data only
   - Type: Demo key
   - Verified: Yes

2. **CoinGecko** - Cryptocurrency Prices
   - Public API: `https://api.coingecko.com/api/v3`
   - Limitations: 10-50 calls/minute on free tier
   - Type: Public endpoint (no key required)
   - Verified: Yes

3. **GitHub** - Repository Management
   - Public API: `https://api.github.com`
   - Limitations: 60 requests/hour without auth, 5000/hour with key
   - Type: Public endpoint (optional auth)
   - Verified: Yes

4. **Etherscan** - Ethereum Blockchain Data
   - Default Placeholder: `YourApiKeyToken`
   - Limitations: Heavily rate limited
   - Type: Placeholder (free tier available)
   - Note: Free API keys available at https://etherscan.io/apis

### ⚠️ Services Requiring Personal API Keys

- **OpenAI** - GPT models require paid API key
- **Anthropic** - Claude AI requires API key
- **PayPal** - Payment processing requires credentials
- **Infura** - Web3 provider requires project ID

## Usage

### Basic Usage

```javascript
// The API Connection Manager automatically searches for known working keys
const apiKey = apiConnectionManager.getApiKey('samgov');
// Returns: 'DEMO_KEY' if no user key is configured

// For public endpoints, no key is needed
const apiKey = apiConnectionManager.getApiKey('coingecko');
// Returns: null (public endpoint doesn't need a key)
```

### Show Dashboard with Known Keys

```javascript
// Display connection status including known working keys
apiConnectionManager.showDashboard();

// Output will show:
// ⚫ SAM.gov              DISCONNECTED
//    ⚠️  API key: not configured
//    ℹ️  Known working key available (known_key)
//    ⚠️  Limited rate limits, demo data only
```

### Show Known Keys Report

```javascript
// Display full report of all available known working keys
apiConnectionManager.showKnownKeys();
```

### Direct Registry Access

```javascript
// Create registry instance
const registry = new KnownWorkingKeysRegistry();

// Search for a specific service
const result = registry.searchKnownKeys('samgov');
console.log(result);
// {
//   found: true,
//   type: 'known_key',
//   key: 'DEMO_KEY',
//   service: 'SAM.gov',
//   limitations: 'Limited rate limits, demo data only'
// }

// Get all services with known keys
const available = registry.getServicesWithKnownKeys();
// Returns array of services with available keys/endpoints
```

## API Reference

### KnownWorkingKeysRegistry

#### `searchKnownKeys(serviceId)`
Search for known working keys for a service.

**Parameters:**
- `serviceId` (string): Service identifier (e.g., 'samgov', 'coingecko')

**Returns:** Object with:
- `found` (boolean): Whether a key/endpoint was found
- `type` (string): 'known_key', 'public_endpoint', or 'unverified_key'
- `key` (string|null): The API key (if applicable)
- `service` (string): Service name
- `limitations` (string): Usage limitations
- `message` (string): Informational message

#### `getServicesWithKnownKeys()`
Get list of all services with available known keys.

**Returns:** Array of service objects

#### `getServiceInfo(serviceId)`
Get detailed information about a service.

**Parameters:**
- `serviceId` (string): Service identifier

**Returns:** Object with service details

#### `generateReport()`
Generate a formatted report of all known working keys.

**Returns:** String containing the formatted report

### AIAPIConnectionManager Integration

The API Connection Manager automatically integrates with the Known Working Keys Registry:

1. When `getApiKey()` is called, it searches for user-provided keys first
2. If no user key is found, it searches the Known Working Keys Registry
3. If a known key or public endpoint is found, it's used automatically
4. Appropriate logging informs the user about which key source is being used

## Testing

### Run the Test Suite

```bash
# Run automated tests
node test-known-working-keys.js
```

### Interactive Testing

Open the test page in your browser:
```
https://barbrickdesign.github.io/test-known-working-keys.html
```

Features:
- Visual dashboard showing all known keys
- Interactive buttons to test each service
- Real-time console output
- Examples for each available service

## Security Considerations

### ✅ Safe to Commit
- Demo keys provided by service vendors
- Public API endpoints
- Placeholder keys that are publicly documented

### ❌ Never Commit
- Personal API keys
- Production credentials
- Private tokens
- Secret keys

### Best Practices
1. **Always use environment variables** for personal API keys
2. **Never commit `.env` files** to version control
3. **Known working keys should only be demo/public keys**
4. **Document limitations** of each known working key
5. **Verify keys regularly** to ensure they still work

## Adding New Known Working Keys

To add a new known working key to the registry:

1. **Verify it's publicly available** - Ensure the key is meant for public use
2. **Document limitations** - Note any rate limits or restrictions
3. **Add to registry** in `src/utils/known-working-keys-registry.js`:

```javascript
'service-name': {
    name: 'Service Name',
    keys: [
        {
            key: 'PUBLIC_KEY',
            type: 'demo',
            description: 'Official demo key',
            limitations: 'Rate limited to X calls/minute',
            verified: true,
            lastVerified: '2024-01-15',
            source: 'https://service-docs.example.com'
        }
    ],
    publicEndpoint: null,
    requiresKey: true
}
```

For public endpoints (no key required):

```javascript
'service-name': {
    name: 'Service Name',
    keys: [],
    publicEndpoint: {
        url: 'https://api.example.com/v1',
        description: 'Free public API',
        limitations: 'X calls/minute on free tier',
        verified: true,
        lastVerified: '2024-01-15'
    },
    requiresKey: false
}
```

## Troubleshooting

### Known Key Not Working?

1. **Check verification date** - Key may have expired
2. **Check rate limits** - You may have exceeded free tier limits
3. **Check service status** - Service may be down
4. **Verify key format** - Ensure key matches expected format

### Service Not in Registry?

1. Check if service requires personal API key
2. Look for official demo/test credentials
3. Check if service has a free public API
4. Add to registry if publicly available

### Integration Issues?

1. Ensure `known-working-keys-registry.js` is loaded before `api-connection-manager.js`
2. Check browser console for initialization messages
3. Verify `window.KnownWorkingKeysRegistry` is available
4. Test with `apiConnectionManager.showKnownKeys()`

## Examples

### Example 1: Using SAM.gov DEMO_KEY

```javascript
// Automatically uses DEMO_KEY if no user key configured
const response = await apiConnectionManager.makeRequest(
    'samgov',
    '/opportunities/v2/search?limit=5'
);

console.log('Government contract opportunities:', response);
```

### Example 2: Using CoinGecko Public API

```javascript
// No key needed - uses public endpoint
const response = await apiConnectionManager.makeRequest(
    'coingecko',
    '/simple/price?ids=bitcoin&vs_currencies=usd'
);

console.log('Bitcoin price:', response);
```

### Example 3: Checking Available Keys

```javascript
// Check what's available before making requests
const services = knownKeysRegistry.getServicesWithKnownKeys();

services.forEach(service => {
    console.log(`${service.serviceName}: ${service.type}`);
});

// Output:
// SAM.gov: known_key
// CoinGecko: public_endpoint
// GitHub: public_endpoint
```

## Future Enhancements

Planned improvements:
- Automatic key verification and health checks
- Community-contributed key registry
- Dynamic key rotation for demo keys
- Usage analytics and recommendations
- Integration with more public APIs

## Related Documentation

- [API Connection Manager Guide](AI_API_CONNECTION_MANAGER_GUIDE.md)
- [API Key Configuration Guide](API_KEY_CONFIGURATION_GUIDE.md)
- [API Connection Testing Guide](API_CONNECTION_TESTING_GUIDE.md)

## Support

For issues or questions:
- Check the test suite output
- Review browser console logs
- Open the interactive test page
- Contact the development team
