# AutoRips Free API Setup Guide

## Overview

The `autoRips.html` file now supports **completely FREE** AI API providers! You no longer need a paid OpenAI account to use the autonomous marketing agents.

## Quick Start

1. Open [autoRips.html](https://barbrickdesign.github.io/autoRips.html)
2. Scroll to the "🎁 Free API Keys Available!" section
3. Choose a free provider (HuggingFace or Groq recommended)
4. Get your free API key from the provider's website
5. Enter the key in the control panel
6. Start the autonomous agents!

## Free API Provider Options

### Option 1: HuggingFace (Recommended)

**Cost:** 100% FREE forever

**Why Choose HuggingFace:**
- No credit card required
- Generous rate limits
- High-quality open-source models (Mistral-7B-Instruct)
- Well-documented API

**Setup Steps:**
1. Sign up: [https://huggingface.co/join](https://huggingface.co/join)
2. Go to [Settings → Access Tokens](https://huggingface.co/settings/tokens)
3. Click "New token"
4. Give it a name (e.g., "AutoRips Agent")
5. Set role to "Read"
6. Copy your token (starts with `hf_...`)
7. Enter in the autoRips control panel

**Models Used:**
- Mistral-7B-Instruct-v0.2 (primary)
- Llama models (fallback)

**Rate Limits:**
- Very generous free tier
- Suitable for regular automated marketing

---

### Option 2: Groq (Very Fast)

**Cost:** FREE with generous limits

**Why Choose Groq:**
- Extremely fast inference (fastest free option)
- 30 requests/minute on free tier
- No credit card required
- Great for real-time applications

**Setup Steps:**
1. Sign up: [https://console.groq.com](https://console.groq.com)
2. Go to [API Keys section](https://console.groq.com/keys)
3. Click "Create API Key"
4. Copy your key (starts with `gsk_...`)
5. Enter in the autoRips control panel

**Models Used:**
- Llama 3.1 8B Instant
- Mixtral models

**Rate Limits:**
- 30 requests/minute (free tier)
- 14,400 requests/day
- Perfect for moderate automation

---

### Option 3: OpenAI (Paid)

**Cost:** Pay-as-you-go (~$0.01-0.02 per agent run)

**Why Choose OpenAI:**
- Highest quality responses
- Most advanced models
- Best for professional/commercial use

**Setup Steps:**
1. Sign up: [https://platform.openai.com/signup](https://platform.openai.com/signup)
2. Add payment method (required)
3. Go to [API Keys](https://platform.openai.com/api-keys)
4. Create new key
5. Copy key (starts with `sk-...`)
6. Enter in the autoRips control panel

**Models Used:**
- GPT-4o-mini (most cost-effective)

**Note:** Requires payment method on file

---

## Using the Control Panel

### Step 1: Select Provider

In the control panel, use the "AI Provider" dropdown to select:
- **HuggingFace (Free - Recommended)** - Best for most users
- **Groq (Free - Fast)** - Best for speed
- **OpenAI (Paid)** - Best for quality

### Step 2: Enter API Key

1. The help text below will show you where to get the key
2. Paste your API key in the "API Key" field
3. Click "Save Configuration"

### Step 3: Run Agents

Once configured, you can:
- Click individual agent buttons to test
- Click "Start All Agents" for autonomous operation
- Watch the logs for real-time activity

## Agent Types

The system includes 5 autonomous marketing agents:

1. **SocialBlastAgent** - Creates social media posts (every 2 hours)
2. **DMOutreachAgent** - Generates personalized DM messages (every 1 hour)
3. **CommunityHypeAgent** - Creates community discussion posts (every 3 hours)
4. **ContentRemixAgent** - Remixes content for different formats (every 4 hours)
5. **AnalyticsTunerAgent** - Analyzes performance and optimizes (every 3 days)

## API Comparison

| Feature | HuggingFace | Groq | OpenAI |
|---------|-------------|------|--------|
| Cost | FREE | FREE | Paid |
| Speed | Medium | Fast | Fast |
| Quality | High | High | Highest |
| Rate Limit | Generous | 30/min | High |
| Setup Time | 2 min | 2 min | 5 min |
| Credit Card | No | No | Yes |
| Best For | Most users | Speed needs | Professionals |

## Troubleshooting

### "API key not configured" error
- Make sure you clicked "Save Configuration" after entering your key
- Refresh the page and check if the key is still there
- Try entering the key again

### "API Error: 401" or "Unauthorized"
- Your API key may be invalid
- Check that you copied the entire key
- Generate a new key from the provider's website

### "API Error: 429" or "Rate limit exceeded"
- You've hit the free tier limit
- Wait a few minutes and try again
- Consider switching to a different provider

### Agent not generating good content
- Free models (HuggingFace, Groq) may produce slightly different output than GPT-4
- Try running the agent multiple times
- Consider using OpenAI for highest quality (paid)

### Page not loading
- Clear your browser cache
- Make sure JavaScript is enabled
- Try a different browser (Chrome/Firefox recommended)

## Advanced: Using in Your Own Code

The autoRips.html file includes example implementations for:
- **JavaScript/Node.js** - See section 5 in the file
- **Python/FastAPI** - See section 9 in the file
- **Zapier Integration** - See section 4 in the file

All examples now support all three providers!

### Environment Variables

When using the backend examples, set:

```bash
# For HuggingFace
export API_PROVIDER=huggingface
export API_KEY=hf_your_token_here

# For Groq
export API_PROVIDER=groq
export API_KEY=gsk_your_key_here

# For OpenAI
export API_PROVIDER=openai
export API_KEY=sk-your_key_here
```

## Security Best Practices

1. **Never share your API keys** - They're like passwords
2. **Never commit keys to git** - Use environment variables
3. **Rotate keys regularly** - Generate new keys every few months
4. **Use separate keys** - One for development, one for production
5. **Monitor usage** - Check your provider dashboard regularly

## Getting Help

- **Issues with autoRips:** Open an issue on GitHub
- **Provider-specific issues:** Check the provider's documentation
- **General questions:** Contact BarbrickDesign@gmail.com

## FAQ

**Q: Which provider should I choose?**
A: Start with HuggingFace (free, reliable). If you need faster responses, try Groq.

**Q: Can I switch providers later?**
A: Yes! Just select a different provider and enter its API key.

**Q: How much does it cost to run continuously?**
A: With HuggingFace or Groq: $0 (completely free!)
   With OpenAI: ~$1-2 per day for continuous operation

**Q: Will free providers work as well as OpenAI?**
A: For this use case (marketing content generation), free providers work excellently. The quality difference is minimal.

**Q: Can I use multiple providers?**
A: Currently, you select one provider at a time, but you can switch anytime.

**Q: Are there usage limits?**
A: Yes, but they're generous:
- HuggingFace: Very high limits, rarely hit
- Groq: 30 requests/minute (plenty for automation)
- OpenAI: Depends on your payment plan

## Changelog

### 2026-02-08 - Free API Support Added
- Added support for HuggingFace Inference API (free)
- Added support for Groq API (free)
- Updated UI with provider selector dropdown
- Added comprehensive setup instructions
- Updated all code examples (JavaScript, Node.js, Python)
- Added dynamic help text based on selected provider

## Resources

- [HuggingFace Inference API Docs](https://huggingface.co/docs/api-inference/index)
- [Groq API Documentation](https://console.groq.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Triumph Rips Official Site](https://www.triumphrips.com/)

---

**Ready to start?** Open [autoRips.html](https://barbrickdesign.github.io/autoRips.html) and get your free API key!
