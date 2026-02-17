# API and Server Integration Guide

## Overview

This guide documents the multi-provider API server integrations throughout the Consciousness Revolution repository, ensuring proper functionality and integration.

---

## Multi-Provider AI Orchestrator

### Location
- **Primary File**: `src/ai/multi-provider-orchestrator.js`
- **Related**: `src/ai/openai-orchestrator.js`, `src/ai/api-connection-manager.js`

### Supported Task Types

| Task Type | Providers | Mock Support | Description |
|-----------|-----------|--------------|-------------|
| `chat` | OpenAI, Groq, HuggingFace | ✅ Yes | Text generation and conversation |
| `image` | OpenAI, HuggingFace | ✅ Yes | Image generation from prompts |
| `embeddings` | OpenAI, HuggingFace | ✅ Yes | Vector embeddings for semantic search |
| `audio` | Groq (Whisper) | ✅ Yes | Audio transcription |

### Provider Configuration

```javascript
// Initialize multi-provider orchestrator
const orchestrator = new MultiProviderAIOrchestrator({
    providers: {
        openai: {
            apiKey: 'your-openai-key',  // Paid, best quality
            enabled: true
        },
        groq: {
            apiKey: 'your-groq-key',    // Free, 14,400 requests/day
            enabled: true
        },
        huggingface: {
            apiKey: 'your-hf-key',      // Free, rate limited
            enabled: true
        }
    },
    preferFree: true  // Prioritize free providers
});

await orchestrator.init();
```

### Fallback Behavior

1. **Primary Provider Fails** → Automatically tries next available provider
2. **All Providers Fail** → Returns mock response with helpful error message
3. **No API Keys** → Returns mock response indicating configuration needed

### Mock Response Format

**Chat Mock:**
```json
{
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "🤖 **Mock AI Response** (No API keys configured)..."
    }
  }],
  "model": "mock",
  "provider": "mock"
}
```

**Image Mock:**
```json
{
  "data": [{
    "url": "https://via.placeholder.com/512x512/3b82f6/ffffff?text=Mock+AI+Image"
  }],
  "model": "mock",
  "provider": "mock"
}
```

**Audio Mock:**
```json
{
  "text": "[Mock transcription] No API keys configured...",
  "model": "mock",
  "provider": "mock"
}
```

**Unknown Task Type:**
```json
{
  "success": false,
  "message": "Mock response for task type: {type}",
  "error": "No mock implementation available...",
  "provider": "mock",
  "supportedTypes": ["chat", "image", "embeddings", "audio"]
}
```

---

## Backend Services

### Location
- **Directory**: `/backend/services/`
- **Count**: 15+ microservices

### Service List

#### Payment Services
- **PayPal Integration** (`paypal-webhook-handler.js`)
  - Handles payment confirmations
  - Validates webhook signatures
  - Processes contributor payments

- **Stripe Integration** (`stripe-webhook-handler.js`)
  - Credit card processing
  - Subscription management
  - Webhook event handling

#### Blockchain Services
- **KAS Service** (`kas-service.js`)
  - Kaspa blockchain integration
  - Transaction monitoring
  - Balance tracking

- **Grid Control** (`grid-control-api.js`)
  - AI Grid network control
  - Power line communication
  - Device orchestration

#### Business Services
- **Rio Grande** (`riogrande-api-service.js`)
  - Business automation
  - Workflow orchestration

- **Email Service** (`email-service.js`)
  - SMTP integration
  - Template rendering
  - Delivery tracking

- **Affiliate Service** (`affiliate.js`)
  - Partner tracking
  - Commission calculation
  - Payout management

### Environment Variables Required

```env
# Payment Systems
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET=your_paypal_secret
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# AI Providers
OPENAI_API_KEY=your_openai_key
GROQ_API_KEY=your_groq_key
HUGGINGFACE_API_KEY=your_hf_key

# Blockchain
KAS_RPC_URL=https://api.kaspa.org
KAS_NETWORK=mainnet

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
```

---

## Netlify Functions

### Location
- **Directory**: `/netlify/functions/`
- **Format**: Pre-built ZIP files
- **Count**: 50+ serverless endpoints

### Key Functions

#### Payment Processing
- `paypal-create-order.js` - Create PayPal payment orders
- `stripe-create-checkout.js` - Create Stripe checkout sessions
- `handle-payment-webhook.js` - Process payment webhooks

#### ARAYA Brain API
- `araya-chat.js` - Chat interface
- `araya-memory.js` - Memory storage/retrieval
- `araya-analytics.js` - Usage analytics
- `araya-file-operations.js` - File management

#### Discord Integration
- `discord-webhook.js` - Discord notifications
- `discord-bot-handler.js` - Bot command processing

### Function Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy functions
netlify deploy --prod
```

---

## AFactory Integrations

### Location
- **File**: `src/systems/afactory-integrations.js`

### Integration Status

| Integration | Status | Requirements | Notes |
|-------------|--------|--------------|-------|
| **Gumroad** (Digital Products) | ✅ Working | API Key | Product creation enabled |
| **Medium** (Content) | ✅ Working | API Key | Article publishing enabled |
| **Printful** (Merchandise) | ⚠️ Pending | API Key + Design Files | Needs design file uploads |
| **YouTube** (Video) | ⚠️ Pending | OAuth2 + Video Files | Needs OAuth2 flow |
| **SaaS Platform** | ⚠️ Pending | Code Gen Infrastructure | Needs deployment pipeline |
| **Stock Photography** | ⚠️ Pending | Media Files | Needs file upload system |
| **Email Marketing** | ⚠️ Pending | Campaign Templates | Needs template system |

### Completing Pending Integrations

#### Printful (Merchandise)
**Requirements:**
1. Design file upload system
2. Product mockup generation
3. Order fulfillment webhook

**Implementation Steps:**
```javascript
// 1. Add file upload handler
async uploadDesignFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    // Upload to storage service
    return await uploadToStorage(formData);
}

// 2. Connect design to Printful
async createPrintfulProduct(designUrl) {
    return await fetch('https://api.printful.com/products', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${this.config.printfulApiKey}`
        },
        body: JSON.stringify({
            design_url: designUrl,
            product_type: 't-shirt'
        })
    });
}
```

#### YouTube (Video Content)
**Requirements:**
1. Google OAuth2 setup
2. Video file upload system
3. YouTube Data API v3 integration

**Implementation Steps:**
```javascript
// 1. Set up OAuth2
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/oauth2callback'
);

// 2. Upload video
async uploadVideo(videoFile, metadata) {
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    
    return await youtube.videos.insert({
        part: 'snippet,status',
        requestBody: {
            snippet: {
                title: metadata.title,
                description: metadata.description
            },
            status: {
                privacyStatus: 'public'
            }
        },
        media: {
            body: fs.createReadStream(videoFile)
        }
    });
}
```

---

## Health Monitoring

### Health Check Endpoints

```bash
# Backend services health
curl http://localhost:3000/health

# Netlify functions health
curl https://your-site.netlify.app/.netlify/functions/health

# Multi-provider AI health
curl http://localhost:3000/api/ai/health
```

### Health Check Response Format

```json
{
  "status": "healthy",
  "timestamp": "2026-02-17T18:47:37.872Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "paypal": "configured",
    "stripe": "configured",
    "ai_providers": {
      "openai": "available",
      "groq": "available",
      "huggingface": "rate_limited"
    }
  },
  "uptime": 86400
}
```

---

## Troubleshooting

### Common Issues

#### 1. API Keys Not Working
**Problem**: All providers returning mock responses
**Solution**:
```bash
# Check environment variables
echo $OPENAI_API_KEY
echo $GROQ_API_KEY

# Set keys if missing
export OPENAI_API_KEY="your-key"
export GROQ_API_KEY="your-key"
```

#### 2. Backend Service Not Responding
**Problem**: Service timeout or connection refused
**Solution**:
```bash
# Check if service is running
ps aux | grep node

# Restart service
npm run backend

# Check logs
tail -f backend/logs/service.log
```

#### 3. Netlify Function Errors
**Problem**: Function returns 500 error
**Solution**:
```bash
# View function logs
netlify functions:log

# Test locally
netlify dev

# Check environment variables in Netlify dashboard
```

#### 4. Payment Webhook Failures
**Problem**: Payments not confirming
**Solution**:
```bash
# Verify webhook URL is correct
# Check webhook signature validation
# Review payment provider dashboard for errors
```

### Debug Mode

Enable debug logging:

```javascript
// Multi-provider orchestrator
const orchestrator = new MultiProviderAIOrchestrator({
    logLevel: 'debug',
    enableMetrics: true
});

// Backend services
process.env.LOG_LEVEL = 'debug';
```

---

## Testing

### Unit Tests

```bash
# Test multi-provider AI
npm run test:ai

# Test backend services
npm run test:backend

# Test netlify functions
npm run test:functions
```

### Integration Tests

```bash
# Test full API integration
npm run test:integration

# Test payment flows
npm run test:payments

# Test AI provider fallback
npm run test:ai-fallback
```

### Manual Testing

```bash
# Test chat completion
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello"}]}'

# Test image generation
curl -X POST http://localhost:3000/api/ai/image \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A sunset over mountains"}'
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] API keys validated and tested
- [ ] Database migrations applied
- [ ] Health checks passing
- [ ] Integration tests passing
- [ ] Error handling tested
- [ ] Logging configured
- [ ] Rate limiting configured

### Post-Deployment

- [ ] Monitor error rates
- [ ] Verify webhook delivery
- [ ] Check API response times
- [ ] Validate payment processing
- [ ] Review logs for errors
- [ ] Test fallback behavior
- [ ] Confirm mock responses work

---

## Security Best Practices

### API Keys
- ✅ Store in environment variables, never commit to repository
- ✅ Use different keys for development/production
- ✅ Rotate keys regularly
- ✅ Use least-privilege access

### Webhooks
- ✅ Validate signatures
- ✅ Use HTTPS only
- ✅ Implement replay protection
- ✅ Log all webhook events

### Rate Limiting
- ✅ Implement per-user rate limits
- ✅ Use exponential backoff
- ✅ Cache responses when possible
- ✅ Monitor for abuse

---

## Support

### Contact
- **Email**: BarbrickDesign@gmail.com
- **Repository**: https://github.com/overkor-tek/consciousness-revolution

### Documentation
- [Multi-Provider AI Guide](MULTI_PROVIDER_AI_GUIDE.md)
- [Backend Services Guide](BACKEND_SERVICES_GUIDE.md)
- [Payment Integration Guide](PAYPAL_INTEGRATION_GUIDE.md)
- [AFactory Integration Guide](AFACTORY_INTEGRATION_GUIDE.md)

---

**Last Updated**: 2026-02-17
**Version**: 1.0.0
