---
layout: default
title: Multi-Provider AI System Guide
---

# Multi-Provider AI System - Complete Guide

## 🎯 Overview

The BarbrickDesign platform now supports **multiple AI providers** with automatic fallback, allowing you to use:

- **OpenAI** (Paid, Best Quality) - GPT-4, DALL-E 3, Whisper
- **Groq** (Free, Fast) - Llama 3.3, Mixtral, Gemma 2 - **14,400 requests/day FREE**
- **HuggingFace** (Free, Open Models) - Llama, Mistral, Stable Diffusion - **Rate limited FREE**

### Key Benefits

✅ **Free Alternatives** - Use Groq or HuggingFace without paying
✅ **Automatic Fallback** - If one provider fails, try the next automatically
✅ **Unified API** - Same code works with all providers
✅ **Smart Selection** - Automatically picks the best available provider
✅ **Backward Compatible** - Works with existing OpenAI code

## 🚀 Quick Start

### Option 1: One-Line Integration (Recommended)

Add this single line to any HTML file:

```html
<script src="/js/multi-ai-auto-inject.js"></script>
```

This automatically:
- Loads the multi-provider orchestrator
- Sets up backward compatibility
- Provides global shortcuts
- Shows helpful console messages

### Option 2: Manual Loading

```html
<script src="/src/ai/multi-provider-orchestrator.js" type="module"></script>
```

## 🔑 Getting Free API Keys

### Groq (Recommended - Fast & Free)

1. Visit [Groq Console](https://console.groq.com/keys)
2. Sign up for free account
3. Create an API key (starts with `gsk_`)
4. **Free tier: 14,400 requests per day**
5. Models: Llama 3.3 70B, Mixtral 8x7B, Gemma 2 9B

**Setup:**
```javascript
aiSetKey("groq", "gsk_YOUR_KEY_HERE");
```

### HuggingFace (Free, Open Models)

1. Visit [HuggingFace Tokens](https://huggingface.co/settings/tokens)
2. Sign up for free account
3. Create a new token (starts with `hf_`)
4. **Free tier: Rate limited but usually sufficient**
5. Models: Llama 3.2, Mistral 7B, Stable Diffusion

**Setup:**
```javascript
aiSetKey("huggingface", "hf_YOUR_KEY_HERE");
```

### OpenAI (Paid, Best Quality)

1. Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create account and add payment method
3. Create an API key (starts with `sk-`)
4. **Paid: $0.001 - $0.06 per 1K tokens**
5. Models: GPT-4, GPT-4o, DALL-E 3, Whisper

**Setup:**
```javascript
aiSetKey("openai", "sk-YOUR_KEY_HERE");
```

## 💡 Usage Examples

### Chat Completion

```javascript
// Simple chat
const response = await multiAI.chatCompletion([
    { role: "user", content: "What is JavaScript?" }
]);

console.log(response.choices[0].message.content);

// With system message
const response = await multiAI.chatCompletion([
    { role: "system", content: "You are a helpful coding assistant" },
    { role: "user", content: "Explain async/await" }
], {
    temperature: 0.7,
    max_tokens: 500
});

// Force specific provider
const response = await multiAI.chatCompletion([
    { role: "user", content: "Hello!" }
], {
    provider: "groq"  // Use Groq specifically
});
```

### Image Generation

```javascript
// Generate image (tries providers that support it)
const result = await multiAI.generateImage("A futuristic city at sunset");
const imageUrl = result.data[0].url;

// Display in HTML
document.getElementById('myImage').src = imageUrl;

// With options
const result = await multiAI.generateImage("Abstract art", {
    size: "1024x1024",
    provider: "huggingface"  // Use Stable Diffusion
});
```

### Text Embeddings

```javascript
// Generate embeddings for semantic search
const result = await multiAI.generateEmbeddings("Hello world");
const embedding = result.data[0].embedding;  // Array of numbers

// Batch processing
const result = await multiAI.generateEmbeddings([
    "First sentence",
    "Second sentence",
    "Third sentence"
]);
```

## 🔄 Automatic Fallback

The system automatically tries providers in order:

1. **Groq** (if API key set and task supported)
2. **HuggingFace** (if API key set and task supported)
3. **OpenAI** (if API key set)
4. **Mock Response** (if no keys set)

Example:
```javascript
// Let's say you have Groq and HuggingFace keys set
// This will try Groq first, then HuggingFace if Groq fails

const response = await multiAI.chatCompletion([
    { role: "user", content: "Hello!" }
]);

// Console shows which provider was used:
// "✅ Using Groq for chat completion"
// or
// "⚠️ Groq failed, falling back to HuggingFace..."
```

## 🎛️ UI Integration

### Quick Config Modal

Show a user-friendly config dialog:

```javascript
showAIConfig();
```

This displays a modal where users can:
- Enter Groq API key
- Enter HuggingFace API key
- Click links to get free keys
- Save keys to localStorage

### Status Dashboard

Check which providers are configured:

```javascript
aiStatus();
```

Output:
```
🤖 Multi-Provider AI Orchestrator Dashboard
════════════════════════════════════════════

✅ Groq 🆓
   Enabled: true
   Free Tier: true
   Requests: 45 (43 ✓, 2 ✗)
   Success Rate: 95.6%

❌ HuggingFace 🆓
   Enabled: false
   Free Tier: true
   Requests: 0 (0 ✓, 0 ✗)
   Success Rate: N/A

✅ OpenAI 💰
   Enabled: true
   Free Tier: false
   Requests: 12 (12 ✓, 0 ✗)
   Success Rate: 100.0%
```

### Provider Setup Helper

Show setup instructions:

```javascript
setupFreeAI();
```

## 🔧 Advanced Features

### Provider Selection

```javascript
// Prefer free providers
const response = await multiAI.chatCompletion(messages, {
    preferFree: true  // Default behavior
});

// Prefer quality (paid providers first)
const response = await multiAI.chatCompletion(messages, {
    preferFree: false
});

// Force specific provider
const response = await multiAI.chatCompletion(messages, {
    provider: "openai"
});
```

### Provider Information

```javascript
// Get available providers for a task
const providers = multiAI.getAvailableProviders('chat');
console.log(providers);
// [
//   { id: 'groq', name: 'Groq', freeTier: true, priority: 2 },
//   { id: 'huggingface', name: 'HuggingFace', freeTier: true, priority: 3 },
//   { id: 'openai', name: 'OpenAI', freeTier: false, priority: 1 }
// ]

// Get best provider for a task
const best = multiAI.selectProvider('chat', true);  // Prefer free
console.log(best);  // "groq"
```

### Provider Statistics

```javascript
const stats = multiAI.getProviderStats();
console.log(stats);
// {
//   groq: {
//     name: "Groq",
//     enabled: true,
//     freeTier: true,
//     totalRequests: 45,
//     successful: 43,
//     failed: 2,
//     successRate: "95.6%"
//   },
//   ...
// }
```

## 🔌 Backward Compatibility

The system maintains full backward compatibility with existing OpenAI code:

### Old Code (Still Works)
```javascript
// This still works!
window.openAIOrchestrator.chatCompletion('gpt-4', [
    { role: 'user', content: 'Hello' }
]);
```

### How It Works
The auto-inject script creates a compatibility layer that:
1. Detects OpenAI API calls
2. Routes them through the multi-provider system
3. Automatically tries free alternatives if OpenAI fails
4. Returns responses in OpenAI format

## 📊 Supported Features by Provider

| Feature | OpenAI | Groq | HuggingFace |
|---------|--------|------|-------------|
| Chat Completion | ✅ | ✅ | ✅ |
| Image Generation | ✅ DALL-E | ❌ | ✅ SD |
| Audio Transcription | ✅ Whisper | ✅ Whisper | ✅ Whisper |
| Text-to-Speech | ✅ | ❌ | ✅ |
| Embeddings | ✅ | ❌ | ✅ |
| Cost | 💰 Paid | 🆓 Free | 🆓 Free |
| Speed | Fast | Very Fast | Slow |
| Quality | Excellent | Good | Good |

## 🎨 Model Selection

### Groq Models

```javascript
// Llama 3.3 70B (best quality, slower)
const response = await multiAI.chatCompletion(messages, {
    provider: "groq",
    model: "llama-3.3-70b-versatile"
});

// Llama 3.1 8B (faster, good quality)
const response = await multiAI.chatCompletion(messages, {
    provider: "groq",
    model: "llama-3.1-8b-instant"
});

// Mixtral 8x7B (good for coding)
const response = await multiAI.chatCompletion(messages, {
    provider: "groq",
    model: "mixtral-8x7b-32768"
});
```

### HuggingFace Models

```javascript
// Llama 3.2 3B (small, fast)
const response = await multiAI.chatCompletion(messages, {
    provider: "huggingface",
    model: "meta-llama/Llama-3.2-3B-Instruct"
});

// Mistral 7B (good general purpose)
const response = await multiAI.chatCompletion(messages, {
    provider: "huggingface",
    model: "mistralai/Mistral-7B-Instruct-v0.3"
});

// Stable Diffusion XL (image generation)
const result = await multiAI.generateImage(prompt, {
    provider: "huggingface",
    model: "stabilityai/stable-diffusion-xl-base-1.0"
});
```

## 🔒 Security Best Practices

### DO ✅
- Store API keys in localStorage (cleared on session end)
- Use environment variables for server-side keys
- Validate keys before setting them
- Use HTTPS for all API calls
- Monitor usage and costs

### DON'T ❌
- Hardcode API keys in source code
- Commit API keys to git repositories
- Share API keys in public channels
- Use production keys in development
- Expose keys in client-side code in production

### Recommended Setup

For production:
```javascript
// Server-side API endpoint
// Your backend validates user, then calls AI API
fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer YOUR_USER_TOKEN' },
    body: JSON.stringify({ messages })
});

// Server handles API keys securely
// Never sends keys to client
```

## 🐛 Troubleshooting

### No Providers Configured

**Problem:** All requests return mock responses

**Solution:**
```javascript
// Check status
aiStatus();

// Set at least one free key
aiSetKey("groq", "gsk_...");
// or
aiSetKey("huggingface", "hf_...");
```

### Provider Fails Consistently

**Problem:** One provider always fails

**Solution:**
```javascript
// Check provider stats
const stats = multiAI.getProviderStats();
console.log(stats.groq);

// Check if API key is valid
aiSetKey("groq", "gsk_NEW_KEY");

// Force a different provider
const response = await multiAI.chatCompletion(messages, {
    provider: "huggingface"
});
```

### Rate Limit Errors

**Problem:** "Rate limit exceeded" errors

**Solution:**
```javascript
// Groq: 14,400 requests/day
// Wait or use multiple keys

// HuggingFace: Rate limited
// Wait a few seconds between requests

// Add delay between requests
await new Promise(resolve => setTimeout(resolve, 1000));
const response = await multiAI.chatCompletion(messages);
```

### CORS Errors

**Problem:** Browser blocks API requests

**Solution:**
```javascript
// Use a proxy for HuggingFace (sometimes needed)
// Or set up your own backend endpoint

// For Groq and OpenAI, CORS should work fine
```

## 📚 API Reference

### MultiProviderAIOrchestrator

#### Constructor
```javascript
const orchestrator = new MultiProviderAIOrchestrator();
```

#### Methods

##### setApiKey(provider, key)
```javascript
multiAI.setApiKey('groq', 'gsk_...');
// Returns: { success: true, message: "..." }
```

##### chatCompletion(messages, options)
```javascript
await multiAI.chatCompletion(
    [{ role: 'user', content: 'Hello' }],
    { provider: 'groq', temperature: 0.7 }
);
```

##### generateImage(prompt, options)
```javascript
await multiAI.generateImage(
    'A beautiful landscape',
    { size: '1024x1024', provider: 'huggingface' }
);
```

##### generateEmbeddings(input, options)
```javascript
await multiAI.generateEmbeddings(
    'Text to embed',
    { provider: 'huggingface' }
);
```

##### getAvailableProviders(taskType)
```javascript
const providers = multiAI.getAvailableProviders('chat');
```

##### selectProvider(taskType, preferFree)
```javascript
const best = multiAI.selectProvider('chat', true);
```

##### getProviderStats()
```javascript
const stats = multiAI.getProviderStats();
```

##### showDashboard()
```javascript
multiAI.showDashboard();
```

### Global Shortcuts

When using auto-inject, these shortcuts are available:

```javascript
aiStatus()                      // Show dashboard
aiSetKey(provider, key)         // Set API key
setupFreeAI()                   // Show setup guide
showAIConfig()                  // Show config modal
```

## 🎓 Best Practices

### 1. Start with Free Tiers

```javascript
// Set up Groq first (fastest free option)
aiSetKey("groq", "gsk_...");

// Add HuggingFace as backup
aiSetKey("huggingface", "hf_...");

// Only add OpenAI if you need premium quality
aiSetKey("openai", "sk-...");
```

### 2. Let Auto-Fallback Work

```javascript
// Don't force providers unless necessary
// Let the system choose the best available
const response = await multiAI.chatCompletion(messages);

// System will try: Groq → HuggingFace → OpenAI → Mock
```

### 3. Handle Errors Gracefully

```javascript
try {
    const response = await multiAI.chatCompletion(messages);
    console.log(response.choices[0].message.content);
} catch (error) {
    console.error('AI request failed:', error);
    // Show user-friendly message
    alert('AI service temporarily unavailable');
}
```

### 4. Monitor Usage

```javascript
// Check stats regularly
const stats = multiAI.getProviderStats();

// If success rate drops, investigate
if (parseFloat(stats.groq.successRate) < 90) {
    console.warn('Groq success rate low!');
}
```

### 5. Optimize for Cost

```javascript
// For high-volume applications, prefer free tiers
const response = await multiAI.chatCompletion(messages, {
    preferFree: true  // Will use Groq or HuggingFace
});

// Only use OpenAI for critical tasks
const criticalResponse = await multiAI.chatCompletion(messages, {
    provider: "openai"
});
```

## 🚦 Migration from OpenAI-Only

### Step 1: Add Multi-Provider Script

```html
<!-- Add this line -->
<script src="/js/multi-ai-auto-inject.js"></script>

<!-- Your existing code works unchanged -->
```

### Step 2: Add Free API Keys

```javascript
// Add free keys for cost savings
aiSetKey("groq", "gsk_...");
aiSetKey("huggingface", "hf_...");
```

### Step 3: Test Fallback

```javascript
// Remove OpenAI key temporarily
localStorage.removeItem('openai_api_key');

// Reload page and test
// Should automatically use Groq or HuggingFace
```

### Step 4: Update Code (Optional)

```javascript
// Old way (still works)
window.openAIOrchestrator.chatCompletion('gpt-4', messages);

// New way (recommended)
await multiAI.chatCompletion(messages);
```

## 📈 Future Enhancements

Coming soon:
- **Anthropic Claude** integration
- **Cohere** API support
- **Local models** (Ollama, LM Studio)
- **Cost tracking** and analytics
- **Usage quotas** and alerts
- **Provider health monitoring**
- **Smart caching** to reduce API calls

## 💬 Support

Need help?
- Check the [API Connection Testing Guide](API_CONNECTION_TESTING_GUIDE)
- View [API Key Configuration Guide](API_KEY_CONFIGURATION_GUIDE)
- Open an issue on GitHub
- Join our Discord community

## 📄 License

MIT License - Free to use and modify

---

**Built with ❤️ for the BarbrickDesign community**

Start using free AI today! 🚀
