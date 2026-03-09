# Groq API Setup Guide for BountyHunter

## Overview

This guide explains how to set up and use the Groq API with the BountyHunter application. Groq provides ultra-fast LLM inference with a generous free tier, making it ideal for automated bounty hunting.

## Why Groq?

✅ **Free Tier**: 14,400 requests per day (no credit card required)  
✅ **Ultra-Fast**: <1 second inference time  
✅ **Cost-Effective**: ~$0.01 per bounty answer  
✅ **High Quality**: Latest LLaMA models with excellent performance  
✅ **Easy Setup**: 5-minute setup process

## Quick Start (5 minutes)

### Step 1: Get Your Free Groq API Key

1. **Visit Groq Console**: https://console.groq.com/keys
2. **Sign Up**: Create a free account (no credit card required)
3. **Create API Key**: 
   - Click "Create API Key"
   - Give it a name (e.g., "bounty-hunter")
   - Copy the key (starts with `gsk_`)
   - **Save it securely** - you won't be able to see it again!

### Step 2: Configure BountyHunter Web Interface

1. **Open BountyHunter**: https://barbrickdesign.github.io/bountyHunter.html
2. **Enter API Key**: Paste your Groq API key in the "Groq API key" field
3. **Select Model**: Choose "llama-3.3-70b-versatile" (recommended)
4. **Start Using**: Click "Fetch & rank bounties" to begin!

Your API key is automatically saved in your browser's local storage for future use.

### Step 3: Configure Backend Agent (Optional - for autonomous operation)

For 24/7 autonomous operation without manual intervention:

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create .env file**:
   ```bash
   cp .env.bounty-hunter.example .env
   ```

3. **Edit .env file**:
   ```bash
   nano .env
   # OR
   code .env
   ```

4. **Add your Groq API key**:
   ```bash
   # Groq API Key (required for answer generation)
   GROQ_API_KEY=gsk_your_actual_key_here
   USE_GROQ=true
   
   # Railway API Key (optional - for automated bounty fetching)
   RAILWAY_API_KEY=your_railway_key_here
   
   # Account email (already configured)
   RAILWAY_EMAIL=barbrickdesign@gmail.com
   ```

5. **Install dependencies**:
   ```bash
   npm install
   ```

6. **Run the agent**:
   ```bash
   # Dry run (test mode)
   npm run bounty-hunter:dry-run
   
   # Production mode (autonomous operation)
   npm run bounty-hunter
   ```

## Available Groq Models

BountyHunter supports the latest Groq models:

### Recommended Models

1. **llama-3.3-70b-versatile** (Default - Best Balance)
   - Context: 8,192 tokens
   - Speed: Ultra-fast
   - Quality: Excellent
   - Use case: General bounty answering

2. **mixtral-8x7b-32768** (Large Context)
   - Context: 32,768 tokens
   - Speed: Very fast
   - Quality: Excellent
   - Use case: Complex bounties with large codebases

3. **llama-3.1-70b-versatile** (Previous Generation)
   - Context: 8,192 tokens
   - Speed: Ultra-fast
   - Quality: Very good
   - Use case: Alternative to llama-3.3

### All Available Models

- `llama-3.3-70b-versatile` - Recommended for most use cases
- `mixtral-8x7b-32768` - Best for large contexts
- `llama-3.1-70b-versatile` - Stable alternative
- `llama2-70b-4096` - Legacy model

## API Endpoints

### Groq API Endpoint

```
https://api.groq.com/openai/v1/chat/completions
```

This endpoint is OpenAI-compatible, so BountyHunter can use it with minimal changes.

### OpenAI API Endpoint (Alternative)

```
https://api.openai.com/v1/chat/completions
```

If you prefer OpenAI, you can switch by:
1. Select an OpenAI model (e.g., gpt-4o-mini)
2. Enter your OpenAI API key (starts with `sk-`)
3. The endpoint will automatically switch

## Cost Analysis

### Groq Free Tier

- **Daily Limit**: 14,400 requests/day
- **Cost**: $0.00 (completely free)
- **Perfect for**: Testing, development, and moderate production use

### Groq Paid Tier (if you exceed free tier)

- **Cost per request**: ~$0.0001 - $0.001 depending on model
- **Average bounty answer**: ~$0.01
- **ROI**: With $50 minimum bounty, that's 5000% ROI!

### OpenAI (Alternative)

- **GPT-4o-mini**: ~$0.15 per bounty
- **GPT-4o**: ~$0.75 per bounty
- **Still profitable** but higher cost

## Example Usage

### Web Interface

```javascript
// The interface automatically handles everything!
// Just enter your API key and click buttons

1. Enter Groq API key: gsk_...
2. Select model: llama-3.3-70b-versatile
3. Click "Fetch & rank bounties"
4. Select a bounty
5. Click "Generate answer"
6. Copy and paste to Railway
```

### Backend Agent

```javascript
// In backend/.env
GROQ_API_KEY=gsk_your_key_here
USE_GROQ=true
GROQ_MODEL=llama-3.3-70b-versatile

// Run the agent
// It will automatically use Groq for all answer generation
npm run bounty-hunter
```

## API Request Format

BountyHunter uses the OpenAI-compatible API format:

```javascript
const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer gsk_your_key_here'
  },
  body: JSON.stringify({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: 'You are an expert Railway engineer...' },
      { role: 'user', content: 'Bounty details: ...' }
    ],
    temperature: 0.3
  })
});

const data = await response.json();
const answer = data.choices[0].message.content;
```

## Troubleshooting

### Error: "Groq API key is required"

**Solution**: Enter your Groq API key in the "Groq API key" field.

Get one free at: https://console.groq.com/keys

### Error: "Invalid API key format"

**Solution**: Groq API keys start with `gsk_`. Make sure you copied the entire key.

Example valid format: `gsk_abc123xyz...`

### Error: "Rate limit exceeded"

**Solution**: You've exceeded the free tier limit (14,400 requests/day).

Options:
1. Wait 24 hours for the limit to reset
2. Upgrade to Groq's paid tier
3. Switch to OpenAI temporarily

### Error: "Model not found"

**Solution**: Make sure you selected a valid Groq model:
- llama-3.3-70b-versatile ✅
- mixtral-8x7b-32768 ✅
- llama-3.1-70b-versatile ✅
- llama2-70b-4096 ✅

### API Key Not Saved

**Solution**: Check your browser settings:
1. Ensure cookies/local storage is enabled
2. Not in private/incognito mode
3. Try manually entering the key each time

## Security Best Practices

### ✅ DO:

1. **Store keys securely** in `.env` files (for backend)
2. **Use local storage** in browser (for web interface)
3. **Never commit** `.env` files to git
4. **Rotate keys** regularly (every 90 days recommended)
5. **Monitor usage** on Groq dashboard

### ❌ DON'T:

1. **Don't hardcode** API keys in source code
2. **Don't share** keys in emails, screenshots, or public issues
3. **Don't commit** keys to version control
4. **Don't expose** keys in URLs or logs
5. **Don't use same key** across multiple projects

### If Your Key is Exposed

If you accidentally expose your API key:

1. **Immediately rotate** the key on https://console.groq.com/keys
2. **Delete the old key** to prevent further use
3. **Update your `.env` file** with the new key
4. **Monitor usage** for any unauthorized requests
5. **Report** to Groq if you see suspicious activity

## Advanced Configuration

### Custom Parameters

You can customize the LLM behavior by modifying the request:

```javascript
{
  model: 'llama-3.3-70b-versatile',
  messages: [...],
  temperature: 0.3,      // Lower = more focused, Higher = more creative
  max_tokens: 2048,      // Maximum response length
  top_p: 0.9,           // Nucleus sampling parameter
  frequency_penalty: 0,  // Reduce repetition
  presence_penalty: 0    // Encourage new topics
}
```

### Multiple API Keys

For high-volume operation, you can use multiple API keys:

```bash
# In backend/.env
GROQ_API_KEY_1=gsk_key1...
GROQ_API_KEY_2=gsk_key2...
GROQ_API_KEY_3=gsk_key3...

# Agent will rotate between keys to maximize throughput
```

### Fallback Configuration

Configure automatic fallback from Groq to OpenAI:

```bash
# Primary: Groq
GROQ_API_KEY=gsk_your_groq_key
USE_GROQ=true

# Fallback: OpenAI
OPENAI_API_KEY=sk_your_openai_key

# Agent will use OpenAI if Groq fails or hits rate limits
```

## Performance Optimization

### Tips for Maximum Speed

1. **Use llama-3.3-70b-versatile** - Fastest model
2. **Lower temperature** (0.2-0.3) - Faster inference
3. **Shorter prompts** - Less tokens to process
4. **Batch requests** - Process multiple bounties
5. **Cache responses** - Avoid duplicate API calls

### Tips for Cost Optimization

1. **Stay within free tier** - 14,400 requests/day
2. **Use Groq not OpenAI** - $0 vs $0.15 per bounty
3. **Optimize prompts** - Fewer tokens = lower cost
4. **Filter bounties** - Only process high-value bounties
5. **Cache common answers** - Reuse for similar bounties

## Monitoring and Analytics

### Check Your Usage

Visit Groq Console: https://console.groq.com/dashboard

Monitor:
- **Daily requests**: Current vs limit
- **Token usage**: Input/output tokens
- **Cost**: Total spend (if on paid tier)
- **Errors**: Failed requests
- **Latency**: Average response time

### BountyHunter Agent Status

```bash
# Check agent status
ps aux | grep bounty-hunter

# View recent logs
tail -f backend/data/bounty-logs/completions.jsonl

# Check earnings
cat backend/data/bounty-hunter-state.json
```

## Support and Resources

### Official Groq Documentation

- **API Docs**: https://console.groq.com/docs/quickstart
- **Models**: https://console.groq.com/docs/models
- **Pricing**: https://console.groq.com/pricing
- **Support**: https://console.groq.com/support

### BountyHunter Documentation

- **Main README**: BOUNTY_HUNTER_README.md
- **Quick Start**: BOUNTY_HUNTER_QUICKSTART.md
- **Security Guide**: SECURITY_WARNING_API_KEYS.md

### Get Help

- **Email**: barbrickdesign@gmail.com
- **GitHub Issues**: Create an issue on the repository
- **Documentation**: Check the README files

## Frequently Asked Questions

### Q: Is the Groq free tier really free?

**A**: Yes! 14,400 requests per day with no credit card required.

### Q: How do I switch from OpenAI to Groq?

**A**: Just select a Groq model (llama-3.3-70b-versatile) and enter your Groq API key. The endpoint switches automatically.

### Q: Can I use both Groq and OpenAI?

**A**: Yes! Configure both API keys, and the agent can fall back to OpenAI if Groq fails.

### Q: Which model is best for bounty hunting?

**A**: llama-3.3-70b-versatile - Best balance of speed, quality, and cost.

### Q: How fast is Groq compared to OpenAI?

**A**: Groq is typically 5-10x faster than OpenAI (< 1 second vs 5-10 seconds).

### Q: What if I exceed the free tier limit?

**A**: Either wait 24 hours for reset or upgrade to Groq's paid tier (very affordable).

### Q: Is my API key secure?

**A**: Yes, when stored in `.env` files (backend) or local storage (browser). Never commit keys to git!

### Q: Can I use Groq in production?

**A**: Absolutely! Groq is production-ready and used by many high-scale applications.

## Conclusion

Groq provides an excellent LLM solution for BountyHunter with:
- ✅ Free tier that's perfect for getting started
- ✅ Ultra-fast inference for quick bounty answers
- ✅ High-quality models that generate professional responses
- ✅ Simple setup that takes just 5 minutes
- ✅ Cost-effective pricing for scaling beyond free tier

Get started now at: https://console.groq.com/keys

---

**Last Updated**: February 19, 2026  
**Version**: 1.0  
**Contact**: barbrickdesign@gmail.com
