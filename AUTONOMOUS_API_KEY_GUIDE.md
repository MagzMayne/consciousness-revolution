# Autonomous API Key Management - Complete Guide

## 🎯 Overview

The Autonomous API Key Management System eliminates the need for users to manually input API keys for most services. The system automatically provides shared community keys, falling back to user-provided keys only when necessary.

## ✨ Key Features

- **🤖 Fully Autonomous**: Works without user interaction for most services
- **🔄 Intelligent Fallback**: Automatically falls back to user input when needed
- **🎨 Beautiful UI**: User-friendly modal interface for key input
- **🔐 Secure**: Keys stored in session storage (temporary, browser-only)
- **🚀 Zero Config**: Applications work immediately without code changes
- **⚡ Auto-Patching**: Existing apps automatically use the system
- **📊 Monitoring**: Built-in diagnostics and health tracking

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Code                         │
│                  (No changes required!)                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  API Key Auto-Patcher                        │
│  • Intercepts localStorage/sessionStorage calls              │
│  • Preloads common keys automatically                        │
│  • Patches window.prompt() for API key requests             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Autonomous API Key Manager                      │
│                                                              │
│  Strategy Chain (tries in order):                          │
│  1. Centralized Config (shared keys)                       │
│  2. User Provided (explicit setAPIKey calls)              │
│  3. Environment Variables (server-side)                    │
│  4. Session Storage (browser, temporary)                   │
│  5. Shared Pool (community contributions)                  │
│  6. Known Working Keys Registry                            │
│  7. Fallback Mode (limited functionality)                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              API Key Fallback UI (when needed)               │
│  • Beautiful modal interface                                │
│  • Service-specific help text                               │
│  • Direct signup links                                      │
│  • Skip option available                                    │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Installation

### Automatic (Recommended)

Simply include the auto-inject script in your HTML:

```html
<!-- This is all you need! -->
<script src="/src/utils/auto-inject-autonomous-keys.js"></script>
```

This automatically loads:
1. API Key Validator
2. Pool Manager
3. Known Working Keys Registry
4. Autonomous API Key Manager
5. Fallback UI Component
6. Auto-Patcher

### Manual (For advanced use)

Load components individually:

```html
<script src="/src/utils/api-key-validator.js"></script>
<script src="/src/pool/api-key-pool-manager.js"></script>
<script src="/src/utils/known-working-keys-registry.js"></script>
<script src="/src/utils/autonomous-api-key-manager.js"></script>
<script src="/src/ui/api-key-fallback-ui.js"></script>
<script src="/src/utils/api-key-auto-patcher.js"></script>
```

## 🚀 Quick Start

### For Users

**You don't need to do anything!** The system automatically provides API keys for supported services. Just use the application normally.

If a service needs your personal API key, you'll see a friendly prompt:

1. A modal appears asking for your API key
2. Click "Get API Key" to visit the signup page
3. Enter your key or click "Skip"
4. Your key is stored securely for this session only

### For Developers

#### Basic Usage

```javascript
// Get API key automatically
const result = await window.getAPIKey('groq');
console.log(result); 
// { success: true, key: "gsk_...", strategy: "centralized_config" }

// With UI fallback if no key found
const result = await window.getAPIKeyOrPrompt('openai');
// Shows modal if needed, returns user input

// Make API call with automatic retry
const response = await window.executeWithRetry('groq', async (apiKey) => {
    return await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [{ role: 'user', content: 'Hello!' }]
        })
    });
});
```

#### Helper Functions

```javascript
// Set API key manually (highest priority)
window.setAPIKey('openai', 'sk-your-key-here');

// Call OpenAI directly
const result = await window.callOpenAI('/chat/completions', {
    model: 'gpt-4',
    messages: [{ role: 'user', content: 'Hello!' }]
});

// Call GitHub API
const repos = await window.callGitHub('/users/octocat/repos');

// Call SAM.gov API
const contracts = await window.callSAMGov('/opportunities/v2/search', {
    limit: 10
});

// Auto-initialize multiAI provider
await window.autoInitMultiAI();
// Sets up Groq, OpenAI, HuggingFace automatically
```

## 🔑 Available Services

### Services with Shared Keys

These services work **immediately** without user input:

| Service | Key Available | Rate Limit | Status |
|---------|---------------|------------|--------|
| **Groq** | ✅ Yes | 14,400 req/day (shared) | Active |
| **SAM.gov** | ✅ Demo Key | 1,000 req/day | Active |
| **CoinGecko** | ✅ Public API | 50 req/min | Active |
| **GitHub** | ✅ Public API | 60 req/hour (5000 with key) | Active |

### Services Requiring User Keys

These services prompt users for keys when needed:

| Service | Signup URL | Free Tier | Notes |
|---------|-----------|-----------|-------|
| **OpenAI** | platform.openai.com | ❌ No | Paid only |
| **Anthropic** | console.anthropic.com | ❌ No | Paid only |
| **HuggingFace** | huggingface.co | ✅ Yes | Free with limits |
| **Etherscan** | etherscan.io/apis | ✅ Yes | 5 req/sec |
| **Infura** | infura.io | ✅ Yes | 100k req/day |

## 🔧 Configuration

### Centralized Config

Edit `/src/utils/centralized-api-keys.json` to add/update keys:

```json
{
  "services": {
    "groq": {
      "enabled": true,
      "provider": "Groq",
      "keys": [
        {
          "id": "groq_primary_2026",
          "key": "gsk_...",
          "type": "shared",
          "priority": 1,
          "rateLimit": {
            "requests": 14400,
            "period": "day"
          },
          "status": "active"
        }
      ],
      "fallbackEnabled": true,
      "userInputPrompt": "Enter your Groq API key..."
    }
  }
}
```

### Adding a New Service

1. Add to `centralized-api-keys.json`:
```json
"myservice": {
  "enabled": true,
  "provider": "My Service",
  "keys": [
    {
      "key": "shared-key-here",
      "type": "shared",
      "priority": 1,
      "status": "active"
    }
  ],
  "fallbackEnabled": true,
  "userInputPrompt": "Enter your My Service API key"
}
```

2. Add to `known-working-keys-registry.js`:
```javascript
'myservice': {
    name: 'My Service',
    keys: [
        {
            key: 'shared-key-here',
            type: 'shared',
            verified: true
        }
    ],
    requiresKey: false
}
```

3. Add environment mapping in `autonomous-api-key-manager.js`:
```javascript
const envVarMap = {
    // ...
    'myservice': 'MYSERVICE_API_KEY'
};
```

## 📊 Monitoring & Diagnostics

### System Status

```javascript
// Get diagnostics
const diagnostics = window.autonomousAPIKeyManager.getDiagnostics();
console.log(diagnostics);

// Output:
{
  activeKeys: 3,
  health: { groq: { status: 'healthy', ... } },
  retryState: {},
  features: { autoRetry: true, ... }
}
```

### Health Monitoring

The system automatically monitors API health:

```javascript
// Check service health
const health = window.autonomousAPIKeyManager.health.get('groq');
console.log(health);
// { status: 'healthy', lastCheck: 1234567890, consecutiveFailures: 0 }
```

### Cache Management

```javascript
// Clear cache for a service (force refresh)
window.autonomousAPIKeyManager.clearCache('groq');

// Clear all cached keys
window.autonomousAPIKeyManager.clearAllCache();
```

## 🧪 Testing

Open `test-autonomous-api-system.html` in your browser to test:

1. **System Status** - View loaded components and configuration
2. **Service Grid** - See which services have keys available
3. **Key Retrieval** - Test autonomous key sourcing
4. **Fallback UI** - Test user key input interface
5. **Manual Management** - Set/clear keys manually
6. **Real API Tests** - Make actual API calls
7. **Diagnostics** - System health and performance

## 🎨 Customizing the Fallback UI

### Change Appearance

```javascript
const ui = new APIKeyFallbackUI({
    theme: 'dark',  // or 'light'
    position: 'center', // or 'top', 'bottom'
    autoShow: false
});
```

### Custom Messages

```javascript
await ui.show('openai', {
    message: 'This feature requires an OpenAI API key',
    allowSkip: true,
    onSubmit: (key) => {
        console.log('User provided key:', key);
    },
    onSkip: () => {
        console.log('User skipped');
    }
});
```

## 🔐 Security Best Practices

### ✅ DO:

- Use the centralized config for shared/public keys only
- Store user keys in sessionStorage (temporary)
- Validate keys before using
- Monitor rate limits
- Rotate shared keys regularly
- Use environment variables for server-side keys

### ❌ DON'T:

- Commit private API keys to the repo
- Store keys in localStorage (persistent)
- Share production keys in centralized config
- Disable validation in production
- Log API keys to console
- Expose keys in URLs or error messages

## 🐛 Troubleshooting

### No Key Found

**Problem**: `getAPIKey()` returns `success: false`

**Solutions**:
1. Check if service is in centralized config
2. Try `getAPIKeyOrPrompt()` to prompt user
3. Set key manually: `setAPIKey('service', 'key')`
4. Check browser console for errors

### Validation Errors

**Problem**: Key rejected as invalid

**Solutions**:
1. Check key format (e.g., OpenAI starts with `sk-`)
2. Ensure key is not a placeholder
3. Verify key is active on provider's dashboard
4. Check key length (minimum 10 characters)

### Rate Limit Exceeded

**Problem**: API calls failing with 429 errors

**Solutions**:
1. Shared keys may be exhausted - provide your own
2. Check rate limits in diagnostics
3. Implement request throttling
4. Wait for rate limit reset
5. Upgrade to paid tier for higher limits

### Auto-Patcher Not Working

**Problem**: Applications still prompting for keys

**Solutions**:
1. Ensure auto-inject script is loaded first
2. Check browser console for errors
3. Wait for 'api-key-patcher-ready' event
4. Try calling `window.apiKeyPatcher.initialize()` manually
5. Check that manager is loaded: `window.autonomousAPIKeyManager`

## 📚 API Reference

### Global Functions

#### `getAPIKey(serviceId, options)`

Get API key autonomously.

```javascript
const result = await window.getAPIKey('groq', {
    forceRefresh: false,  // Skip cache
    userId: null,         // User ID for pool
    retryOnFailure: true  // Retry on failure
});
```

Returns:
```javascript
{
    success: true,
    key: "gsk_...",
    strategy: "centralized_config",
    cached: false
}
```

#### `setAPIKey(serviceId, key)`

Set API key manually (highest priority).

```javascript
const result = window.setAPIKey('openai', 'sk-...');
// { success: true, strategy: 'user_provided' }
```

#### `getAPIKeyOrPrompt(serviceId, options)`

Get key or show UI prompt.

```javascript
const result = await window.getAPIKeyOrPrompt('openai', {
    allowSkip: true,
    message: 'Custom message'
});
```

#### `executeWithRetry(serviceId, apiCallFn, options)`

Execute API call with automatic retry.

```javascript
const result = await window.executeWithRetry('groq', 
    async (apiKey) => {
        return await fetch('...', {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
    },
    {
        onRetry: (info) => {
            console.log(`Retry ${info.attempt}/${info.maxRetries}`);
        }
    }
);
```

### Classes

#### `AutonomousAPIKeyManager`

Main manager class.

Methods:
- `getAPIKey(serviceId, options)` - Get key autonomously
- `setAPIKey(serviceId, key)` - Set key manually
- `executeWithRetry(serviceId, fn, options)` - Execute with retry
- `getDiagnostics(serviceId?)` - Get system diagnostics
- `clearCache(serviceId)` - Clear cached key
- `clearAllCache()` - Clear all caches

#### `APIKeyFallbackUI`

Fallback UI component.

Methods:
- `show(serviceId, options)` - Show UI modal
- `hide()` - Hide UI modal
- `getServiceInfo(serviceId)` - Get service info

## 💡 Best Practices

### For Application Developers

1. **Use auto-inject** - One line includes everything
2. **Use helpers** - `callOpenAI()`, `callGitHub()`, etc.
3. **Handle fallback** - Use `getAPIKeyOrPrompt()` for user input
4. **Monitor health** - Check diagnostics periodically
5. **Clear cache** - On logout or context switch

### For API Key Providers

1. **Contribute keys** - Share unused quota with community
2. **Monitor usage** - Track your key's usage
3. **Rotate regularly** - Change keys periodically
4. **Report issues** - If keys are abused

### For System Administrators

1. **Monitor rate limits** - Watch shared key usage
2. **Rotate keys** - Update centralized config regularly
3. **Review logs** - Check for abuse or errors
4. **Update documentation** - Keep guides current

## 📝 Examples

### Example 1: Simple Chat Application

```html
<!DOCTYPE html>
<html>
<head>
    <script src="/src/utils/auto-inject-autonomous-keys.js"></script>
</head>
<body>
    <input type="text" id="message" placeholder="Type a message...">
    <button onclick="sendMessage()">Send</button>
    <div id="response"></div>
    
    <script>
    async function sendMessage() {
        const message = document.getElementById('message').value;
        
        const result = await window.executeWithRetry('groq', async (apiKey) => {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages: [{ role: 'user', content: message }]
                })
            });
            return await response.json();
        });
        
        if (result.success) {
            document.getElementById('response').textContent = 
                result.result.choices[0].message.content;
        }
    }
    </script>
</body>
</html>
```

### Example 2: GitHub Repository Viewer

```html
<script src="/src/utils/auto-inject-autonomous-keys.js"></script>

<script>
async function showRepos(username) {
    try {
        const repos = await window.callGitHub(`/users/${username}/repos`);
        
        repos.forEach(repo => {
            console.log(`${repo.name}: ${repo.description}`);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

showRepos('octocat');
</script>
```

### Example 3: Multi-Provider AI

```html
<script src="/src/utils/auto-inject-autonomous-keys.js"></script>
<script src="/src/ai/multi-provider-orchestrator.js"></script>

<script>
async function initAI() {
    // Auto-initialize all providers
    await window.autoInitMultiAI();
    
    // Now use multiAI normally
    const response = await window.multiAI.chatCompletion([
        { role: 'user', content: 'Hello!' }
    ], {
        provider: 'groq',
        model: 'llama-3.1-8b-instant'
    });
    
    console.log(response.choices[0].message.content);
}

initAI();
</script>
```

## 🤝 Contributing

To contribute API keys to the community pool:

1. Generate an API key from the service
2. Contribute via the pool manager
3. Monitor your usage through diagnostics
4. Earn contribution credits (coming soon)

## 📄 License

Part of the Barbrick Design Platform

## 📧 Support

- **Email**: BarbrickDesign@gmail.com
- **Issues**: GitHub Issues
- **Documentation**: This file

---

**Last Updated**: 2026-02-09
**Version**: 1.0.0
