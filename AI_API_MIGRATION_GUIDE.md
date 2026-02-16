# Migration Guide - Integrating AI API Connection Manager

## For Existing Projects

This guide helps you integrate the AI API Connection Manager into existing projects that already use various APIs.

## Quick Integration (Recommended)

### Step 1: Add the Auto-Inject Script

Add this single line to your HTML file(s), preferably near the end of the `<body>` tag:

```html
<script src="js/api-connection-auto-inject.js"></script>
```

That's it! The manager will:
- Auto-load all dependencies
- Discover API endpoints in your code
- Integrate with existing OpenAI Orchestrator
- Provide helpful console commands

### Step 2: Test Integration

Open the browser console (F12) and type:
```javascript
apiStatus()
```

You should see a connection dashboard showing all detected services.

## Manual Integration (For Custom Setups)

If you need more control, follow these steps:

### Step 1: Load Dependencies

```html
<!-- Load ApiKeyValidator first -->
<script src="src/utils/api-key-validator.js"></script>

<!-- Then load Connection Manager -->
<script src="src/ai/api-connection-manager.js"></script>
```

### Step 2: Initialize (Optional)

The manager auto-initializes as `window.apiConnectionManager`. If you need custom initialization:

```javascript
const customManager = new AIAPIConnectionManager();
// Configure as needed
```

### Step 3: Configure API Keys

```javascript
// Set keys programmatically
apiConnectionManager.setApiKey('openai', 'sk-...');
apiConnectionManager.setApiKey('samgov', 'your-key');

// Or let users configure via UI
// (see examples in api-connection-test.html)
```

## Migrating Existing API Calls

### Before (Direct Fetch)

```javascript
// Old way - manual fetch with no retry logic
try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ /* ... */ })
    });
    
    if (!response.ok) {
        throw new Error('Request failed');
    }
    
    const data = await response.json();
} catch (error) {
    console.error('Error:', error);
}
```

### After (Using Connection Manager)

```javascript
// New way - automatic retry, better error handling
try {
    const data = await apiConnectionManager.makeRequest('openai', '/chat/completions', {
        method: 'POST',
        body: JSON.stringify({ /* ... */ })
    });
    // Success! Data is ready to use
} catch (error) {
    // Only thrown after all retries exhausted
    console.error('Request failed after retries:', error);
}
```

## Service-Specific Migration

### OpenAI

**If you're using OpenAI Orchestrator:**
```javascript
// No changes needed! Auto-syncs with Connection Manager
const orchestrator = window.openAIOrchestrator;
// Set key in either place:
orchestrator.setApiKey('sk-...');
// OR
apiConnectionManager.setApiKey('openai', 'sk-...');
// Both will be synced automatically
```

**If you're using direct fetch:**
```javascript
// Replace this:
const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
});

// With this:
const response = await apiConnectionManager.makeRequest('openai', '/chat/completions', {
    method: 'POST',
    body: JSON.stringify(payload)
});
```

### SAM.gov

```javascript
// Replace this:
const url = `https://api.sam.gov/prod/opportunities/v2/search?api_key=${SAMGOV_KEY}&keyword=${keyword}`;
const response = await fetch(url);

// With this:
const response = await apiConnectionManager.makeRequest('samgov', 
    `/opportunities/v2/search?keyword=${keyword}`
);
// API key is automatically added from session storage
```

### GitHub

```javascript
// Replace this:
const response = await fetch('https://api.github.com/user/repos', {
    headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
    }
});

// With this:
const response = await apiConnectionManager.makeRequest('github', '/user/repos', {
    method: 'GET'
});
// Authorization header is automatically added
```

### Etherscan

```javascript
// Replace this:
const url = `https://api.etherscan.io/api?module=account&action=balance&address=${address}&apikey=${ETHERSCAN_KEY}`;
const response = await fetch(url);

// With this:
const response = await apiConnectionManager.makeRequest('etherscan',
    `?module=account&action=balance&address=${address}`
);
```

## Handling API Keys

### Migration from LocalStorage

If you're currently storing keys in localStorage, migrate to sessionStorage for better security:

```javascript
// OLD: localStorage (persists forever - less secure)
localStorage.setItem('openai_api_key', key);

// NEW: Use Connection Manager (uses sessionStorage)
apiConnectionManager.setApiKey('openai', key);

// Or directly use sessionStorage if needed
sessionStorage.setItem('openai_api_key', key);
```

### Migration from Environment Variables

Environment variables still work - the Connection Manager checks them automatically:

```javascript
// In your .env file:
OPENAI_API_KEY=sk-...
SAMGOV_API_KEY=...

// In your code:
// No changes needed! Manager auto-detects environment variables
// But you can explicitly set if needed:
if (process.env.OPENAI_API_KEY) {
    apiConnectionManager.setApiKey('openai', process.env.OPENAI_API_KEY);
}
```

## Error Handling Migration

### Before

```javascript
try {
    const response = await fetch(url);
    if (response.status === 401) {
        alert('Invalid API key');
    } else if (response.status === 429) {
        alert('Rate limited - wait and retry');
    } else if (!response.ok) {
        alert('Request failed');
    }
    return await response.json();
} catch (error) {
    alert('Network error');
}
```

### After

```javascript
try {
    // Automatic retry for rate limits, network errors, server errors
    const data = await apiConnectionManager.makeRequest('openai', endpoint, options);
    return data;
} catch (error) {
    // Only thrown after all retries exhausted
    if (error.message.includes('Authentication')) {
        alert('Please check your API key');
    } else if (error.message.includes('Rate limit')) {
        alert('Too many requests - please try again in a few minutes');
    } else {
        alert('Service unavailable - please try again later');
    }
}
```

## Using Fallback Mode

For non-critical features, leverage fallback mode:

```javascript
// This works even without an API key (for supported services)
try {
    const data = await apiConnectionManager.makeRequest('samgov', '/opportunities');
    
    if (data.error === 'fallback') {
        // Using demo data
        console.log('Demo mode - configure API key for live data');
    }
    
    // Use the data (real or demo)
    displayContracts(data);
} catch (error) {
    console.error('Error:', error);
}
```

## Testing Your Migration

### 1. Check Connection Status

```javascript
apiConnectionManager.showDashboard();
```

### 2. Discover Existing API Usage

```javascript
const endpoints = apiConnectionManager.discoverEndpoints();
console.log('Found endpoints:', endpoints);
```

### 3. Test Each Service

```javascript
// Test OpenAI
await apiConnectionManager.testConnection('openai');

// Test SAM.gov
await apiConnectionManager.testConnection('samgov');

// Test all configured services
const services = ['openai', 'samgov', 'github'];
for (const service of services) {
    const result = await apiConnectionManager.testConnection(service);
    console.log(`${service}: ${result.success ? '✅' : '❌'}`);
}
```

## Common Migration Issues

### Issue: "Manager not defined"

**Problem:** Connection Manager not loaded before your code runs

**Solution:** 
```javascript
// Wait for manager to load
function waitForManager(callback) {
    if (window.apiConnectionManager) {
        callback();
    } else {
        setTimeout(() => waitForManager(callback), 100);
    }
}

waitForManager(() => {
    // Your code here
    apiConnectionManager.setApiKey('openai', key);
});
```

### Issue: API key not persisting

**Problem:** Using session storage means keys are cleared when browser closes

**Solution:** This is intentional for security. Users need to re-enter keys each session, or you can:
```javascript
// Prompt user once per session
if (!apiConnectionManager.connections.openai.apiKey) {
    const key = prompt('Enter your OpenAI API key:');
    if (key) {
        apiConnectionManager.setApiKey('openai', key);
    }
}
```

### Issue: Existing code breaks after migration

**Problem:** Expecting specific response format

**Solution:** The manager passes through responses unchanged, but check:
```javascript
// If you expect response.data:
const result = await apiConnectionManager.makeRequest(...);
if (result.data) {
    // Use result.data
} else if (result.error === 'fallback') {
    // Using fallback data
} else {
    // Direct response
}
```

## Backward Compatibility

The Connection Manager is designed to work alongside existing code:

- ✅ Doesn't break existing fetch calls
- ✅ Works with existing OpenAI Orchestrator
- ✅ Integrates with existing ApiKeyValidator
- ✅ Can be gradually adopted (no need to migrate everything at once)

## Gradual Migration Strategy

You don't have to migrate everything at once:

1. **Phase 1:** Add auto-inject script to enable discovery
   ```html
   <script src="js/api-connection-auto-inject.js"></script>
   ```

2. **Phase 2:** View discovered endpoints
   ```javascript
   apiConnectionManager.discoverEndpoints();
   ```

3. **Phase 3:** Migrate critical API calls first (those that need retry logic)

4. **Phase 4:** Migrate remaining API calls as time permits

5. **Phase 5:** Remove old API handling code once fully migrated

## Example: Full Page Migration

**Before:**
```html
<script>
    const OPENAI_KEY = localStorage.getItem('openai_key');
    
    async function askAI(question) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENAI_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [{ role: 'user', content: question }]
                })
            });
            
            if (!response.ok) throw new Error('Failed');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    }
</script>
```

**After:**
```html
<!-- Add Connection Manager -->
<script src="js/api-connection-auto-inject.js"></script>

<script>
    async function askAI(question) {
        try {
            return await apiConnectionManager.makeRequest('openai', '/chat/completions', {
                method: 'POST',
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [{ role: 'user', content: question }]
                })
            });
        } catch (error) {
            console.error('AI request failed:', error);
            return null;
        }
    }
    
    // Set API key once (if not already set)
    if (!apiConnectionManager.connections.openai.apiKey) {
        const key = sessionStorage.getItem('openai_key');
        if (key) {
            apiConnectionManager.setApiKey('openai', key);
        }
    }
</script>
```

## Need Help?

- Check the main guide: `AI_API_CONNECTION_MANAGER_GUIDE.md`
- Test page: `api-connection-test.html`
- API configuration: `API_KEY_CONFIGURATION_GUIDE.md`
- Run diagnostics: `apiConnectionManager.showDashboard()`

---

**Version:** 1.0.0  
**Last Updated:** 2025-12-31
