# R3-D3 Enhanced Gemini API - Quick Start

## 🚀 Get Started in 3 Minutes

### Step 1: Get Your API Key

1. Visit https://ai.google.dev/
2. Sign in with your Google account
3. Create a new API key
4. Copy the key (starts with `AIza...`)

### Step 2: Test the Enhanced Features

Open the test page in your browser:
```
https://your-site.com/test-r3d3-gemini-enhanced.html
```

Or locally:
```
open test-r3d3-gemini-enhanced.html
```

### Step 3: Enter Your API Key

1. Paste your API key in the input field
2. Click "🧪 Test API Key"
3. Wait for "✅ API key is valid and working!"
4. Click "💾 Save API Key" (optional, for future use)

### Step 4: Try the Features

**Real-Time Editing:**
1. Type in the text area
2. Click "🎯 Start Real-Time Suggestions"
3. Continue typing - AI suggestions appear automatically
4. Try "✨ Improve Text" for instant improvements

**Streaming Content:**
1. Enter a prompt (e.g., "Write a poem about AI")
2. Click "▶️ Start Streaming"
3. Watch content appear word-by-word
4. Click "⏹️ Stop Streaming" to cancel

**Enhanced Vision:**
1. Click "🔍 Analyze Page" for accessibility check
2. Click "🎯 Detect Components" to find UI elements
3. Click "🎨 Get Suggestions" for design feedback

## 📚 Quick API Reference

### Initialize Enhanced Features

```javascript
// Get enhanced Gemini API
const { client, editor, analyzer } = window.RobotAI.initEnhancedGemini();
```

### Real-Time Editing

```javascript
// Start editing session
const sessionId = await editor.startEditingSession('#my-textarea', {
    mode: 'suggest',
    onUpdate: (suggestion) => console.log(suggestion)
});

// Get edit suggestions
const improved = await editor.getEditSuggestions(text, 'improve');
const fixed = await editor.getEditSuggestions(text, 'grammar');
```

### Streaming Content

```javascript
// Stream generation
for await (const chunk of client.streamContent({ text: 'Write...' })) {
    console.log(chunk);
}

// Stop streaming
client.stopStreaming();
```

### Enhanced Vision

```javascript
// Capture screenshot
const canvas = await html2canvas(document.body);
const screenshot = canvas.toDataURL('image/png');

// Analyze
const report = await analyzer.analyzeAccessibility(screenshot);
const components = await analyzer.detectComponents(screenshot);
const suggestions = await analyzer.suggestDesignImprovements(screenshot);
```

## 🎯 Common Use Cases

### 1. Blog Post Editor with AI

```javascript
const { editor } = window.RobotAI.initEnhancedGemini();

// Start real-time suggestions
const sessionId = await editor.startEditingSession('#blog-textarea', {
    mode: 'suggest'
});

// Quick improvements
document.getElementById('improve-btn').onclick = async () => {
    const text = document.getElementById('blog-textarea').value;
    const improved = await editor.getEditSuggestions(text, 'improve');
    document.getElementById('blog-textarea').value = improved;
};
```

### 2. Interactive Chat with Streaming

```javascript
const { client } = window.RobotAI.initEnhancedGemini();

async function sendMessage(userMsg) {
    let response = '';
    for await (const chunk of client.streamContent({ 
        text: `User: ${userMsg}\nAI:`,
        temperature: 0.8 
    })) {
        response += chunk;
        chatOutput.textContent = response;
    }
}
```

### 3. Automated Accessibility Audit

```javascript
const { analyzer } = window.RobotAI.initEnhancedGemini();

async function auditPage() {
    const canvas = await html2canvas(document.body);
    const screenshot = canvas.toDataURL('image/png');
    
    const report = await analyzer.analyzeAccessibility(screenshot);
    
    // Display issues
    report.issues.forEach(issue => {
        console.log(`[${issue.severity}] ${issue.description}`);
    });
}
```

## 🛠️ Loading the Enhanced API

### Option 1: Add to Your Page

```html
<!-- Load html2canvas for screenshots -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>

<!-- Load enhanced Gemini API -->
<script src="/js/robot-gemini-enhanced.js"></script>

<!-- Load R3-D3 AI brain (includes integration) -->
<script src="/js/robot-ai-brain.js"></script>
```

### Option 2: Add to robot-assistant-loader.js

```javascript
// Add to loadScript list
loadScript('/js/robot-gemini-enhanced.js');
```

## ⚙️ Configuration

### Edit Configuration (Optional)

```javascript
// Access config
const config = window.GeminiEnhanced.config;

// Default settings
config.apiVersion = 'v1beta';
config.visionModel = 'gemini-2.0-flash-exp';
config.defaultTemperature = 0.7;
config.defaultMaxTokens = 2048;
```

### Custom Client

```javascript
// Create custom client
const client = window.GeminiEnhanced.createClient(apiKey);

// Generate with custom settings
const result = await client.generateContent({
    text: 'Write...',
    temperature: 0.9,
    maxTokens: 500,
    topK: 50,
    topP: 0.95
});
```

## 🐛 Troubleshooting

### API Key Not Working

**Check:**
- Key starts with "AIza"
- Key is at least 30 characters
- Key is valid at ai.google.dev
- No typos or extra spaces

**Fix:**
```javascript
// Test key
const validation = window.GeminiEnhanced.validateApiKey(apiKey);
console.log(validation); // Shows error if invalid

// Test connection
const client = window.GeminiEnhanced.createClient(apiKey);
const result = await client.testApiKey();
console.log(result); // Shows if key works
```

### Real-Time Editing Not Starting

**Check:**
- API key is valid and tested
- Element selector is correct
- No JavaScript errors in console

**Fix:**
```javascript
// Check status
const status = window.RobotAI.getEnhancedFeaturesStatus();
console.log(status);

// Should show:
// {
//   available: true,
//   hasApiKey: true,
//   features: { realtimeEditing: true, ... }
// }
```

### Streaming Not Working

**Check:**
- API key is valid
- Internet connection is stable
- No ad blockers interfering

**Fix:**
```javascript
// Check if streaming is supported
const { client } = window.RobotAI.initEnhancedGemini();

try {
    for await (const chunk of client.streamContent({ text: 'test' })) {
        console.log('Streaming works:', chunk);
        break;
    }
} catch (error) {
    console.error('Streaming error:', error);
}
```

### Vision Analysis Failing

**Check:**
- html2canvas is loaded
- Page is fully loaded before capture
- Screenshot size is reasonable

**Fix:**
```javascript
// Load html2canvas if not loaded
if (typeof html2canvas === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    document.head.appendChild(script);
}

// Wait for page to load
if (document.readyState !== 'complete') {
    await new Promise(resolve => window.addEventListener('load', resolve));
}
```

## 📊 Rate Limits (Free Tier)

| Resource | Limit |
|----------|-------|
| Requests per minute | 15 |
| Tokens per minute | 1,000,000 |
| Requests per day | 1,500 |

**Tips:**
- Use debouncing for real-time features
- Cache results when possible
- Stop streaming when not needed
- Consider upgrading for production

## 🔐 Security Tips

1. **Don't share your API key** - Keep it secret
2. **Use environment variables** - For production apps
3. **Rotate keys regularly** - Every 90 days recommended
4. **Monitor usage** - Check Google Cloud Console
5. **Clear stored keys** - On shared computers

## 📖 Learn More

- **Full Documentation**: [R3D3_GEMINI_ENHANCED_GUIDE.md](R3D3_GEMINI_ENHANCED_GUIDE.md)
- **Test Page**: [test-r3d3-gemini-enhanced.html](test-r3d3-gemini-enhanced.html)
- **Gemini API Docs**: https://ai.google.dev/gemini-api/docs
- **API Reference**: https://ai.google.dev/api

## ✅ Quick Checklist

Before going live:

- [ ] API key is valid and tested
- [ ] All features tested in browser
- [ ] Error handling verified
- [ ] Rate limits understood
- [ ] Security best practices followed
- [ ] Documentation reviewed
- [ ] Test page works correctly

## 🎉 You're Ready!

You now have:
- ✅ Enhanced API key management
- ✅ Real-time editing capabilities
- ✅ Streaming content generation
- ✅ Advanced vision analysis

Start building amazing AI-powered experiences with R3-D3! 🤖✨
