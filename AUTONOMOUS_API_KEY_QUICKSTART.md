# Autonomous API Keys - Quick Start Guide

## 🚀 For Users (2 Minutes)

### What Changed?

**Before**: You had to enter API keys manually for every service.

**Now**: API keys are automatically provided! Just use the apps - they work immediately.

### What If I Need to Add My Key?

If an app needs your personal API key, you'll see a friendly popup:

1. **Click "Get API Key"** → Opens signup page in new tab
2. **Copy your key** from the provider's website
3. **Paste into the modal** and click Submit
4. **Done!** Your key is saved for this browsing session only

Your key is:
- ✅ Stored locally (never sent to our servers)
- ✅ Temporary (cleared when you close the browser)
- ✅ Secure (stored in session storage only)

## 💻 For Developers (5 Minutes)

### Install (One Line!)

Add this to any HTML page:

```html
<script src="/src/utils/auto-inject-autonomous-keys.js"></script>
```

That's it! Your app now has:
- ✅ Automatic API keys for Groq, SAM.gov, GitHub, CoinGecko
- ✅ Automatic fallback to user input when needed
- ✅ Beautiful UI modal for key input
- ✅ Automatic retry and error handling
- ✅ Rate limit monitoring

### Use It

**Option 1: Automatic (No code changes)**

Your existing code that uses `localStorage.getItem('openai_api_key')` now works automatically!

**Option 2: New API (Recommended)**

```javascript
// Get a key
const result = await window.getAPIKey('groq');
// { success: true, key: "gsk_...", strategy: "centralized_config" }

// Make an API call with retry
const response = await window.executeWithRetry('groq', async (apiKey) => {
    return await fetch('https://api.groq.com/...', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
    });
});
```

**Option 3: Helper Functions**

```javascript
// OpenAI
const chat = await window.callOpenAI('/chat/completions', {
    model: 'gpt-4',
    messages: [{ role: 'user', content: 'Hi!' }]
});

// GitHub  
const repos = await window.callGitHub('/users/octocat/repos');

// SAM.gov
const contracts = await window.callSAMGov('/opportunities/v2/search');
```

### Test It

Open `test-autonomous-api-system.html` in your browser to:
- See system status
- Test key retrieval
- Try the fallback UI
- Make real API calls
- View diagnostics

## 📚 Common Scenarios

### Scenario 1: AI Chat App

```html
<script src="/src/utils/auto-inject-autonomous-keys.js"></script>

<script>
async function chat(message) {
    // Automatically uses Groq shared key!
    const result = await window.callOpenAI('/chat/completions', {
        model: 'llama-3.1-8b-instant',  // Note: Groq endpoint is OpenAI-compatible
        messages: [{ role: 'user', content: message }]
    });
    
    return result.choices[0].message.content;
}
</script>
```

### Scenario 2: Prompt User If No Key

```javascript
// Will show UI modal if no key available
const result = await window.getAPIKeyOrPrompt('openai');

if (result.success) {
    // User provided key, proceed
    makeAPICall(result.key);
}
```

### Scenario 3: Manual Key Management

```javascript
// Set a key manually (highest priority)
window.setAPIKey('openai', 'sk-your-key');

// Clear a key
window.autonomousAPIKeyManager.clearCache('openai');
```

## 🔑 Available Services

### Work Immediately (No user input needed)

| Service | Daily Limit | Use Case |
|---------|-------------|----------|
| **Groq** | 14,400 requests | Fast AI chat (Llama, Mixtral) |
| **SAM.gov** | 1,000 requests | Government contracts data |
| **GitHub** | 60/hour | Public repo access |
| **CoinGecko** | Unlimited | Crypto prices |

### Need User Key (Prompt shown when needed)

- **OpenAI** - GPT models (paid)
- **Anthropic** - Claude models (paid)
- **HuggingFace** - Various models (free tier)

## ⚡ Performance Tips

1. **Preload Keys**: Keys are automatically preloaded on page load
2. **Cache Keys**: Keys are cached after first retrieval
3. **Use Helpers**: Helper functions include retry logic
4. **Monitor Health**: Check `window.autonomousAPIKeyManager.getDiagnostics()`

## 🐛 Troubleshooting

### "API Key Not Found"

**Solution**: Use `getAPIKeyOrPrompt()` instead of `getAPIKey()` to prompt the user.

### "Rate Limit Exceeded"

**Solution**: Shared keys may be exhausted. The UI will prompt for your personal key.

### "Manager Not Loaded"

**Solution**: Wait for the manager to load:

```javascript
window.addEventListener('api-key-patcher-ready', () => {
    // Manager is ready, make API calls now
});
```

## 📖 Full Documentation

For complete documentation, see: `AUTONOMOUS_API_KEY_GUIDE.md`

## 🆘 Support

- **Test Page**: `test-autonomous-api-system.html`
- **Full Guide**: `AUTONOMOUS_API_KEY_GUIDE.md`
- **Email**: BarbrickDesign@gmail.com
- **Issues**: GitHub Issues

---

**🎉 That's it! Your app now has autonomous API key management!**
