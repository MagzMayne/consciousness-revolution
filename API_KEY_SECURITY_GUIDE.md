# API Key Security Guide

## 🔒 Security Overview

This repository uses a multi-layered API key management system designed for both security and ease of use.

## 📋 Key Types

### 1. Shared Community Keys
**Location**: `src/utils/centralized-api-keys.json`

These are **intentionally shared** keys for community use:
- ✅ **Safe to expose**: Free tier, rate-limited API keys
- ✅ **Purpose**: Enable immediate functionality without setup
- ✅ **Limitations**: Shared rate limits across all users
- ⚠️ **Not for production**: Should be replaced with your own keys

**Current Shared Keys**:
- **Groq API**: Free tier (14,400 requests/day shared across all users)
- **SAM.gov**: Demo key (returns demo data)

### 2. User-Provided Keys
**Location**: `.env` file (gitignored)

Your personal API keys for production use:
- 🔐 **Private**: Never committed to repository
- 🚀 **Full access**: Your own rate limits
- ✅ **Production-ready**: For real applications

### 3. Environment Variables
**Location**: System environment or hosting platform

Recommended for production deployments:
- 🔐 **Most secure**: Not stored in files
- ☁️ **Platform-specific**: Set in hosting dashboard
- 🔄 **Easily rotated**: Change without code updates

## 🛡️ Security Best Practices

### For Development

1. **Copy `.env.example` to `.env`**:
   ```bash
   cp .env.example .env
   ```

2. **Add your own API keys** to `.env`:
   ```bash
   GROQ_API_KEY=gsk_your_personal_key_here
   OPENAI_API_KEY=sk_your_openai_key_here
   GITHUB_TOKEN=ghp_your_github_token_here
   ```

3. **Never commit `.env`** - It's already in `.gitignore`

### For Production

1. **Use environment variables** instead of `.env` files
2. **Set keys in your hosting platform**:
   - Vercel: Project Settings → Environment Variables
   - Netlify: Site Settings → Environment Variables
   - Heroku: Settings → Config Vars
   - GitHub Pages: Use GitHub Secrets for Actions

3. **Rotate keys regularly**:
   - Change keys every 90 days
   - Rotate immediately if compromised
   - Use different keys for dev/staging/production

### For Contributors

1. **Use shared keys** for testing (no setup required)
2. **Get your own keys** for development:
   - [Groq Console](https://console.groq.com/keys) - Free tier available
   - [OpenAI Platform](https://platform.openai.com/api-keys) - Paid
   - [GitHub Settings](https://github.com/settings/tokens) - Free

3. **Never commit API keys** in code:
   - Use environment variables or `.env`
   - Check with `git diff` before committing
   - Use `.gitignore` to prevent accidents

## 🔄 API Key Fallback System

The repository implements a intelligent fallback chain:

```
1. User-provided key (.env or environment)
   ↓ (if not found)
2. Shared community key (centralized-api-keys.json)
   ↓ (if rate limited or unavailable)
3. Fallback/mock mode (demo data)
```

This ensures:
- ✅ Works out of the box (shared keys)
- ✅ Production-ready (use your own keys)
- ✅ Always functional (fallback mode)

## 🚨 What to Do if Keys are Compromised

### If You Exposed Your Personal Key:

1. **Rotate immediately**:
   - Generate new key from provider
   - Update `.env` file
   - Restart application

2. **Revoke old key**:
   - Delete from provider's console
   - This prevents further use

3. **Check usage**:
   - Review API usage logs
   - Look for unexpected activity

### If Shared Key is Compromised:

1. **Report to maintainers**: Email BarbrickDesign@gmail.com
2. **Continue using**: Shared keys are meant to be public
3. **Use your own key**: For better performance

## 📊 API Rate Limits

Understanding rate limits helps prevent disruptions:

| Service | Shared Key Limit | Personal Key Limit |
|---------|------------------|-------------------|
| Groq | 14,400 req/day (shared) | 14,400 req/day (yours) |
| OpenAI | N/A (use your own) | Varies by tier |
| GitHub | 60 req/hour (no auth) | 5,000 req/hour |
| SAM.gov | Demo data only | Varies by tier |
| Etherscan | 5 req/sec (default) | 5-15 req/sec |
| CoinGecko | 50 req/min (public) | Higher tiers available |

## 🎯 Recommendations

### For Quick Testing
- ✅ Use shared keys (already configured)
- ✅ Accept rate limit sharing
- ✅ Switch to fallback if limited

### For Development
- ✅ Get free-tier personal keys
- ✅ Configure in `.env` file
- ✅ Don't commit `.env`

### For Production
- ✅ Use paid-tier API keys
- ✅ Set as environment variables
- ✅ Monitor usage and costs
- ✅ Implement key rotation policy

## 📚 Additional Resources

- [API Key Configuration Guide](API_KEY_CONFIGURATION_GUIDE.md)
- [Environment Setup Guide](.env.example)
- [Security Architecture](SECURITY_ARCHITECTURE.md)
- [Groq Orchestrator Guide](GROQ_ORCHESTRATOR_GUIDE.md)

## ❓ FAQ

### Q: Is the Groq key in the repo safe?
**A**: Yes, it's intentionally shared for community use. It's a free-tier key with rate limits. For production, use your own key.

### Q: Why share API keys publicly?
**A**: To enable "works out of the box" functionality. New users can immediately test features without setup. The shared keys have rate limits and are monitored.

### Q: Should I replace shared keys?
**A**: For production use, yes. For testing and development, the shared keys are fine. They help you get started quickly.

### Q: How do I know if I'm using shared keys?
**A**: Check the console logs. The system logs which key source is being used (shared, user-provided, or fallback).

### Q: What happens when shared keys hit rate limits?
**A**: The system automatically falls back to mock/demo mode. Applications continue working with simulated data.

## 📧 Contact

Questions about API key security?
- Email: BarbrickDesign@gmail.com
- Issues: [GitHub Issues](https://github.com/barbrickdesign/barbrickdesign.github.io/issues)

---

**Last Updated**: 2026-02-17  
**Security Level**: Community Shared Keys + User-Provided Keys + Fallback
