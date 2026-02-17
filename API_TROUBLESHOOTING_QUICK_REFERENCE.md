# API & Server Troubleshooting Quick Reference

Quick solutions for common API and server integration issues.

---

## 🔴 Critical Issues

### All AI Providers Returning Mock Responses

**Symptom**: Every API call returns mock data  
**Cause**: No API keys configured

**Solution**:
```bash
# Check current configuration
node -e "console.log(process.env.OPENAI_API_KEY ? 'OpenAI: Set' : 'OpenAI: Missing')"
node -e "console.log(process.env.GROQ_API_KEY ? 'Groq: Set' : 'Groq: Missing')"

# Set API keys
export OPENAI_API_KEY="sk-..."
export GROQ_API_KEY="gsk_..."

# Or add to .env file
echo "OPENAI_API_KEY=sk-..." >> .env
echo "GROQ_API_KEY=gsk_..." >> .env
```

### Payment Webhooks Not Working

**Symptom**: Payments succeed but not recorded in system  
**Cause**: Webhook signature validation failing

**Solution**:
```javascript
// Check webhook configuration
console.log('PayPal Webhook Secret:', process.env.PAYPAL_WEBHOOK_SECRET ? 'Set' : 'Missing');
console.log('Stripe Webhook Secret:', process.env.STRIPE_WEBHOOK_SECRET ? 'Set' : 'Missing');

// Test webhook endpoint
curl -X POST https://your-site/.netlify/functions/paypal-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### Backend Service Not Starting

**Symptom**: `ECONNREFUSED` or service timeout  
**Cause**: Service not running or wrong port

**Solution**:
```bash
# Check if service is running
ps aux | grep node

# Check port availability
lsof -i :3000

# Restart service
npm run backend

# Check logs
tail -f backend/logs/service.log
```

---

## ⚠️ Common Warnings

### "Mock response not implemented for this task type"

**Old Error** (Before Fix):
```json
{
  "error": "Mock response not implemented for this task type",
  "provider": "mock"
}
```

**Fixed Response** (After Fix):
```json
{
  "success": false,
  "message": "Mock response for task type: unknown_type",
  "error": "No mock implementation available for 'unknown_type'...",
  "provider": "mock",
  "supportedTypes": ["chat", "image", "embeddings", "audio"]
}
```

**What Changed**: Added better error handling with list of supported types

### "Design file needed for full implementation"

**Cause**: AFactory Printful integration requires file uploads  
**Status**: Pending implementation

**Workaround**: Use dry-run mode for now
```javascript
const integrations = new AFactoryIntegrations({ dryRun: true });
```

**Full Solution**: See `AFACTORY_INTEGRATION_COMPLETION_GUIDE.md`

### "Video file and OAuth2 needed for full implementation"

**Cause**: YouTube integration requires OAuth setup  
**Status**: Pending implementation

**Workaround**: Use dry-run mode
**Full Solution**: Follow YouTube OAuth setup in completion guide

---

## 🔧 Quick Fixes

### Provider Fallback Not Working

**Issue**: When OpenAI fails, no fallback to Groq

**Check**:
```javascript
// Verify fallback is enabled
const orchestrator = new MultiProviderAIOrchestrator({
    preferFree: true  // Should try free providers first
});

// Check provider order
console.log(orchestrator.getProviderPriority('chat'));
```

**Fix**: Ensure multiple providers have API keys configured

### Rate Limit Errors

**Issue**: `429 Too Many Requests`

**Solutions**:
```javascript
// 1. Enable rate limiting
const orchestrator = new MultiProviderAIOrchestrator({
    rateLimit: {
        enabled: true,
        maxRequests: 100,
        windowMs: 60000  // 1 minute
    }
});

// 2. Add retry with exponential backoff
async function callWithRetry(fn, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (error.status === 429 && i < maxRetries - 1) {
                await new Promise(r => setTimeout(r, 2 ** i * 1000));
                continue;
            }
            throw error;
        }
    }
}
```

### CORS Errors in Browser

**Issue**: `Access-Control-Allow-Origin` error

**Fix for Netlify Functions**:
```javascript
// Add CORS headers to function response
exports.handler = async (event) => {
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        },
        body: JSON.stringify(data)
    };
};
```

### Environment Variables Not Loading

**Issue**: `undefined` when accessing `process.env.API_KEY`

**Causes & Solutions**:

1. **Missing .env file**
   ```bash
   cp .env.example .env
   # Edit .env with real values
   ```

2. **Not loading dotenv**
   ```javascript
   require('dotenv').config();
   ```

3. **Netlify function needs env vars in dashboard**
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Add each variable

### File Upload Failing

**Issue**: Upload timeout or `413 Payload Too Large`

**Solutions**:

1. **Increase size limit** (Netlify)
   ```toml
   # netlify.toml
   [functions]
     included_files = ["uploads/**"]
     
   [[functions]]
     function = "upload-design"
     included_files = ["*.png", "*.jpg"]
     node_bundler = "esbuild"
     
   [build]
     functions = "netlify/functions"
     
   [functions."upload-design"]
     timeout = 30
   ```

2. **Use chunked upload**
   ```javascript
   async function uploadLargeFile(file) {
       const chunkSize = 1024 * 1024; // 1MB chunks
       const chunks = Math.ceil(file.size / chunkSize);
       
       for (let i = 0; i < chunks; i++) {
           const chunk = file.slice(i * chunkSize, (i + 1) * chunkSize);
           await uploadChunk(chunk, i);
       }
   }
   ```

---

## 📊 Diagnostic Commands

### Check System Configuration

```bash
# Run validation
node scripts/validate-api-config.js

# Expected output: 85%+ validation score
```

### Test Multi-Provider AI

```javascript
// test-ai.js
const MultiProviderAIOrchestrator = require('./src/ai/multi-provider-orchestrator');

async function test() {
    const orchestrator = new MultiProviderAIOrchestrator();
    await orchestrator.init();
    
    console.log('Available providers:', orchestrator.getAvailableProviders());
    
    // Test chat
    const chatResult = await orchestrator.generateChatCompletion([
        { role: 'user', content: 'Hello, test message' }
    ]);
    console.log('Chat result:', chatResult.choices[0].message.content);
    
    // Test image (will use mock if no providers)
    const imageResult = await orchestrator.generateImage('test sunset');
    console.log('Image result:', imageResult.data[0].url);
}

test().catch(console.error);
```

```bash
node test-ai.js
```

### Test Backend Services

```bash
# Test service health
curl http://localhost:3000/health

# Test specific service
curl http://localhost:3000/api/kas/balance/KASPA_ADDRESS

# Test with authentication
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/protected-endpoint
```

### Check Netlify Functions

```bash
# List all functions
netlify functions:list

# View function logs
netlify functions:log paypal-webhook

# Invoke function locally
netlify functions:invoke paypal-webhook --payload '{"test": true}'
```

---

## 🐛 Debug Mode

### Enable Debug Logging

```javascript
// For multi-provider AI
const orchestrator = new MultiProviderAIOrchestrator({
    logLevel: 'debug',
    enableMetrics: true,
    verbose: true
});

// For backend services
process.env.LOG_LEVEL = 'debug';
process.env.DEBUG = '*';
```

### View Debug Output

```javascript
// Will show:
// - Provider selection logic
// - API request/response details
// - Fallback triggers
// - Error stack traces
// - Performance metrics
```

---

## 📞 Get Help

### Self-Help Resources

1. **Validation Script**: `node scripts/validate-api-config.js`
2. **Integration Guide**: `API_SERVER_INTEGRATION_GUIDE.md`
3. **AFactory Guide**: `AFACTORY_INTEGRATION_COMPLETION_GUIDE.md`
4. **Example Tests**: `test-multi-provider-ai.html`

### Contact Support

- **Email**: BarbrickDesign@gmail.com
- **Subject Line**: "API Integration Issue: [Brief Description]"
- **Include**:
  - Validation script output
  - Error messages/logs
  - Steps to reproduce
  - Environment (development/production)

### Common Issues Database

Check existing issues: https://github.com/overkor-tek/consciousness-revolution/issues

---

## ✅ Prevention Checklist

Before deploying changes:

- [ ] Run `node scripts/validate-api-config.js`
- [ ] Test with mock responses (no API keys)
- [ ] Test with real providers (with API keys)
- [ ] Test provider fallback (disable primary provider)
- [ ] Check error handling (invalid inputs)
- [ ] Verify logs are helpful
- [ ] Test in production-like environment
- [ ] Document any new environment variables

---

**Last Updated**: 2026-02-17  
**Version**: 1.0.0
