# Known Working Keys Feature - Quick Start

## 🎯 What Problem Does This Solve?

**Before**: Developers needed personal API keys for every service to test integrations, creating barriers to quick prototyping and testing.

**After**: The system automatically discovers and uses publicly available keys and endpoints, allowing immediate testing without configuration.

## 🚀 Quick Start

### 1. Using in Browser

```html
<!-- Load the dependencies -->
<script src="src/utils/api-key-validator.js"></script>
<script src="src/utils/known-working-keys-registry.js"></script>
<script src="src/ai/api-connection-manager.js"></script>

<script>
  // The API Connection Manager is automatically initialized as a global
  // and will automatically use known working keys when user keys aren't configured
  
  // Example 1: Use SAM.gov without configuring API key
  apiConnectionManager.makeRequest('samgov', '/opportunities/v2/search?limit=5')
    .then(data => console.log('Got contracts:', data))
    .catch(err => console.error('Error:', err));
  
  // Example 2: Check what keys are available
  apiConnectionManager.showKnownKeys();
  
  // Example 3: View connection status
  apiConnectionManager.showDashboard();
</script>
```

### 2. Using in Node.js

```javascript
const KnownWorkingKeysRegistry = require('./src/utils/known-working-keys-registry.js');

// Create registry
const registry = new KnownWorkingKeysRegistry();

// Search for a known key
const samgovKey = registry.searchKnownKeys('samgov');
console.log('SAM.gov key:', samgovKey.key); // Output: DEMO_KEY

// List all services with known keys
const available = registry.getServicesWithKnownKeys();
console.log('Available services:', available);
// Output: [
//   { serviceName: 'SAM.gov', type: 'known_key', ... },
//   { serviceName: 'CoinGecko', type: 'public_endpoint', ... }
// ]
```

## 📋 Available Services

### Services with Known Working Keys

| Service | Type | Key/Endpoint | Limitations |
|---------|------|--------------|-------------|
| **SAM.gov** | Demo Key | `DEMO_KEY` | Limited rate limits, demo data only |
| **CoinGecko** | Public API | No key required | 10-50 calls/minute free tier |
| **GitHub** | Public API | No key required | 60 req/hr unauth, 5000/hr with key |
| **Etherscan** | Placeholder | `YourApiKeyToken` | Heavily rate limited (free tier available) |

### Services Requiring Personal Keys

- OpenAI (GPT models)
- Anthropic (Claude AI)
- PayPal (Payments)
- Infura (Web3 provider)

## 🎓 Common Use Cases

### Use Case 1: Testing SAM.gov Integration

```javascript
// No configuration needed - automatically uses DEMO_KEY
const response = await apiConnectionManager.makeRequest(
    'samgov',
    '/opportunities/v2/search?limit=10'
);

console.log('Found', response.data.length, 'contract opportunities');
// ℹ️ SAM.gov: Using known working key (known_key)
// ⚠️ Limitations: Limited rate limits, demo data only
```

### Use Case 2: Get Cryptocurrency Prices

```javascript
// No API key needed - uses public endpoint
const response = await apiConnectionManager.makeRequest(
    'coingecko',
    '/simple/price?ids=bitcoin,ethereum&vs_currencies=usd'
);

console.log('Prices:', response);
// ℹ️ CoinGecko: Using public endpoint (no key required)
```

### Use Case 3: Access GitHub Public Data

```javascript
// No API key needed for public repos
const response = await apiConnectionManager.makeRequest(
    'github',
    '/repos/barbrickdesign/barbrickdesign.github.io'
);

console.log('Repository:', response.name);
// ℹ️ GitHub: Using public endpoint (no key required)
// ⚠️ Limitations: 60 requests/hour without authentication
```

### Use Case 4: Check What's Available Before Coding

```javascript
// See what services you can use without configuration
const registry = new KnownWorkingKeysRegistry();
const available = registry.getServicesWithKnownKeys();

console.log('You can use these services without API keys:');
available.forEach(service => {
    console.log(`- ${service.serviceName} (${service.type})`);
});
```

## 🔍 Discovery Flow

The system searches for API keys in this order:

1. **User's Environment Variables** (e.g., `OPENAI_API_KEY`)
2. **Session Storage** (browser only, expires on close)
3. **Local Storage** (browser only, persists)
4. **Known Working Keys Registry** ⭐ NEW!
   - Searches for verified public keys
   - Checks for public endpoints
   - Returns demo/test keys if available

## 📊 Interactive Testing

Open the test page in your browser to see it in action:

```
https://barbrickdesign.github.io/test-known-working-keys.html
```

Features:
- Visual dashboard of all known keys
- Interactive buttons to test each service
- Real-time console output
- Examples for every available service

## 🧪 Running Tests

### Automated Test Suite

```bash
# Run the complete test suite
node test-known-working-keys.js

# Expected output:
# ✅ 14 tests passed
# ❌ 0 tests failed
# Pass Rate: 100%
```

### Manual Testing

```javascript
// In browser console or Node.js

// Test 1: Search for SAM.gov key
const registry = new KnownWorkingKeysRegistry();
const result = registry.searchKnownKeys('samgov');
console.log(result);
// { found: true, type: 'known_key', key: 'DEMO_KEY', ... }

// Test 2: Check service info
const info = registry.getServiceInfo('coingecko');
console.log(info);
// { found: true, name: 'CoinGecko', requiresKey: false, ... }

// Test 3: Generate report
console.log(registry.generateReport());
// (Displays formatted report of all services)
```

## 🔐 Security Best Practices

### ✅ Safe to Commit
- Demo keys from service vendors (like SAM.gov DEMO_KEY)
- Public API endpoints (like CoinGecko, GitHub)
- Documented placeholder keys (like Etherscan default)

### ❌ Never Commit
- Personal API keys
- Production credentials
- Private tokens
- Real secret keys

### How We Ensure Safety
1. Only public/demo keys are in the registry
2. Each key is documented with source URL
3. Verification dates track when keys were last checked
4. Clear warnings about limitations
5. Separate from user credential storage

## 📈 Benefits

| Benefit | Before | After |
|---------|--------|-------|
| **Time to Test** | 15-30 min (signup + config) | Immediate |
| **API Keys Needed** | 8 different services | 0 for basic testing |
| **Configuration** | Manual .env setup | Automatic fallback |
| **Documentation** | Scattered across sites | Centralized guide |
| **Prototyping** | Blocked by credentials | Start coding immediately |

## 🎯 Real-World Examples

### Example: Building a Contract Search Tool

```javascript
// Before: Need to sign up for SAM.gov, wait for approval, configure .env
// After: Just start coding!

async function searchContracts(keyword) {
    const response = await apiConnectionManager.makeRequest(
        'samgov',
        `/opportunities/v2/search?q=${keyword}&limit=10`
    );
    
    return response.data.map(contract => ({
        title: contract.title,
        value: contract.awardAmount,
        agency: contract.fullParentPathName
    }));
}

// Works immediately with DEMO_KEY!
const results = await searchContracts('software development');
console.log(`Found ${results.length} contracts`);
```

### Example: Cryptocurrency Price Tracker

```javascript
// No API key needed!

async function trackPrices(coinIds) {
    const response = await apiConnectionManager.makeRequest(
        'coingecko',
        `/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd`
    );
    
    return response;
}

// Works immediately!
const prices = await trackPrices(['bitcoin', 'ethereum', 'cardano']);
console.log('Current prices:', prices);
```

## 🆘 Troubleshooting

### Issue: Known key not working

**Solution:**
```javascript
// Check verification date
const registry = new KnownWorkingKeysRegistry();
const info = registry.getServiceInfo('samgov');
console.log('Last verified:', info.publicEndpoint?.lastVerified);

// If old, the key may have expired - check service documentation
```

### Issue: Rate limit exceeded

**Solution:**
```javascript
// Known keys have rate limits. For production:
// 1. Sign up for your own API key
// 2. Set it in your environment
process.env.SAMGOV_API_KEY = 'your-real-key';

// Or in browser
sessionStorage.setItem('samgov_api_key', 'your-real-key');

// The system will automatically use your key instead
```

### Issue: Service not in registry

**Solution:**
Check if it requires a personal key:
```javascript
const registry = new KnownWorkingKeysRegistry();
const info = registry.getServiceInfo('openai');
console.log(info.note);
// "No free tier - API key required from https://platform.openai.com/api-keys"
```

## 📚 Learn More

- [Complete Guide](KNOWN_WORKING_KEYS_GUIDE.md) - Full documentation
- [API Connection Manager Guide](AI_API_CONNECTION_MANAGER_GUIDE.md) - Integration docs
- [API Key Configuration](API_KEY_CONFIGURATION_GUIDE.md) - User key setup

## 🎉 Get Started Now!

```bash
# Clone the repo
git clone https://github.com/barbrickdesign/barbrickdesign.github.io.git

# Open the test page
open test-known-working-keys.html

# Or start coding immediately
node -e "const r = require('./src/utils/known-working-keys-registry.js'); console.log(new r().generateReport())"
```

**No configuration required. No API keys needed. Just code!** 🚀
