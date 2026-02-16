# Araya Chat Deployment Guide

## Overview

Araya Chat is the AI-powered consciousness interface for the Consciousness Revolution platform. It requires several API keys and services to function properly.

## Prerequisites

- Netlify account (for hosting serverless functions)
- GitHub account (for repository access)
- API keys from various AI providers (see below)

## Required Environment Variables

All environment variables must be configured in **Netlify Environment Variables** section:

1. Go to your Netlify site dashboard
2. Navigate to **Site settings > Environment variables**
3. Add each variable listed below

### Core AI Providers

#### DeepSeek AI (Primary - REQUIRED)
- **Variable:** `DEEPSEEK_API_KEY`
- **Get it from:** https://platform.deepseek.com/
- **Purpose:** Primary AI model for fast, cost-effective responses
- **Setup:**
  1. Sign up at deepseek.com
  2. Navigate to API Keys section
  3. Create a new API key
  4. Copy and save in Netlify environment variables

#### Anthropic Claude (Vision - REQUIRED for image analysis)
- **Variable:** `ANTHROPIC_API_KEY`
- **Get it from:** https://console.anthropic.com/
- **Purpose:** Image analysis and complex reasoning with Claude Vision
- **Setup:**
  1. Sign up at anthropic.com
  2. Navigate to API Keys section
  3. Create a new API key
  4. Copy and save in Netlify environment variables

#### OpenAI (Fallback - OPTIONAL)
- **Variable:** `OPENAI_API_KEY`
- **Get it from:** https://platform.openai.com/api-keys
- **Purpose:** Fallback AI provider if DeepSeek is unavailable
- **Setup:**
  1. Sign up at openai.com
  2. Create a new API key
  3. Copy and save in Netlify environment variables

### Database & Storage

#### Supabase (REQUIRED for memory and case storage)
- **Variables:** 
  - `SUPABASE_URL`
  - `SUPABASE_KEY` (anon key)
  - `SUPABASE_SERVICE_ROLE_SECRET` (service role key)
- **Get it from:** https://supabase.com/dashboard
- **Purpose:** Store conversation history, user memory, images, and case files
- **Setup:**
  1. Create a new Supabase project
  2. Go to Project Settings > API
  3. Copy **Project URL** → `SUPABASE_URL`
  4. Copy **anon/public key** → `SUPABASE_KEY`
  5. Copy **service_role key** → `SUPABASE_SERVICE_ROLE_SECRET`
  6. Save all three in Netlify environment variables

### GitHub Integration

#### GitHub Token (REQUIRED for file operations)
- **Variable:** `GITHUB_TOKEN`
- **Get it from:** https://github.com/settings/tokens
- **Purpose:** Allow Araya to read/write files in the repository
- **Setup:**
  1. Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
  2. Click "Generate new token (classic)"
  3. Select scopes: `repo` (all), `workflow`
  4. Generate token and copy immediately (shown only once)
  5. Save in Netlify environment variables

- **Additional variables:**
  - `GITHUB_OWNER=overkor-tek`
  - `GITHUB_REPO=consciousness-revolution`
  - `GITHUB_BRANCH=master`

### Railway Proxy (OPTIONAL)

#### Railway Backend (for heavy computation)
- **Variable:** `RAILWAY_API_URL`
- **Get it from:** Your Railway deployment
- **Purpose:** Bypass Netlify's 10-second timeout for complex tasks
- **Setup:**
  1. Deploy the backend to Railway (see Railway Setup section)
  2. Get the deployment URL
  3. Save as `RAILWAY_API_URL=https://your-app.up.railway.app/chat`

## Database Schema Setup

Araya Chat requires the following Supabase tables:

### 1. araya_memory table
```sql
CREATE TABLE araya_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE,
  profile JSONB DEFAULT '{}'::jsonb,
  memory_fragments JSONB DEFAULT '[]'::jsonb,
  daily_interactions INTEGER DEFAULT 0,
  last_interaction_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_araya_memory_user_id ON araya_memory(user_id);
```

### 2. araya_images table (for case building)
```sql
CREATE TABLE araya_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  image_name TEXT,
  image_data TEXT NOT NULL,
  image_type TEXT,
  analysis TEXT,
  tags TEXT[],
  case_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_araya_images_user_id ON araya_images(user_id);
CREATE INDEX idx_araya_images_case_id ON araya_images(case_id);
```

### 3. araya_cases table (for case management)
```sql
CREATE TABLE araya_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  case_type TEXT,
  status TEXT DEFAULT 'open',
  evidence JSONB DEFAULT '[]'::jsonb,
  timeline JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_araya_cases_user_id ON araya_cases(user_id);
```

## Deployment Checklist

- [ ] **Domain Configuration**
  - [ ] CNAME file contains correct domain: `consciousnessrevolution.io`
  - [ ] Netlify custom domain is configured
  - [ ] DNS records are pointing to Netlify

- [ ] **Environment Variables (Netlify)**
  - [ ] `DEEPSEEK_API_KEY` configured ✅
  - [ ] `ANTHROPIC_API_KEY` configured ✅
  - [ ] `SUPABASE_URL` configured ✅
  - [ ] `SUPABASE_KEY` configured ✅
  - [ ] `SUPABASE_SERVICE_ROLE_SECRET` configured ✅
  - [ ] `GITHUB_TOKEN` configured ✅
  - [ ] `GITHUB_OWNER` = overkor-tek
  - [ ] `GITHUB_REPO` = consciousness-revolution
  - [ ] `GITHUB_BRANCH` = master
  - [ ] `OPENAI_API_KEY` configured (optional)
  - [ ] `RAILWAY_API_URL` configured (optional)

- [ ] **Supabase Setup**
  - [ ] Project created
  - [ ] `araya_memory` table created
  - [ ] `araya_images` table created
  - [ ] `araya_cases` table created
  - [ ] Row Level Security (RLS) configured if needed

- [ ] **Netlify Functions**
  - [ ] Functions folder: `netlify/functions` configured in netlify.toml
  - [ ] `araya-chat.mjs` deployed successfully
  - [ ] Function logs show no errors

- [ ] **Testing**
  - [ ] Visit https://consciousnessrevolution.io/araya-chat
  - [ ] Send a test message
  - [ ] Verify response is received
  - [ ] Check Netlify function logs for errors
  - [ ] Test image upload (if Anthropic key configured)
  - [ ] Test file operations (if GitHub token configured)

## Troubleshooting

### Issue: "API returned 500"

**Cause:** Missing or invalid environment variables

**Solution:**
1. Check Netlify function logs: Site settings > Functions > araya-chat
2. Look for error messages about missing API keys
3. Verify all required environment variables are set
4. Redeploy the site after adding variables

### Issue: "I'm in offline mode"

**Cause:** Frontend cannot reach the Netlify function

**Solution:**
1. Check if function is deployed: Visit `https://consciousnessrevolution.io/.netlify/functions/araya-chat`
2. Should return error about missing message (not 404)
3. Check browser console for CORS or network errors
4. Verify domain is correctly configured

### Issue: "Usage limit reached"

**Cause:** Free tier limit of 20 messages/day reached

**Solution:**
1. This is expected behavior for free users
2. Configure Stripe integration for paid subscriptions
3. Or increase `FREE_DAILY_LIMIT` in araya-chat.mjs (not recommended for production)

### Issue: Railway timeout or proxy errors

**Cause:** Railway backend is down or misconfigured

**Solution:**
1. Railway proxy is optional - basic chat will still work
2. Check Railway deployment status
3. Verify `RAILWAY_API_URL` environment variable
4. Heavy tasks (file operations, complex analysis) will fallback to Netlify

## Railway Setup (Optional)

For complex tasks that exceed Netlify's 10-second timeout:

1. **Create Railway account:** https://railway.app/
2. **Deploy backend:**
   ```bash
   # Clone repository
   git clone https://github.com/overkor-tek/consciousness-revolution
   cd consciousness-revolution
   
   # Create Railway project
   railway init
   
   # Deploy
   railway up
   ```
3. **Configure environment variables in Railway:**
   - Same variables as Netlify (DeepSeek, Anthropic, Supabase, etc.)
4. **Get deployment URL:**
   - Railway provides a URL like: `https://your-app.up.railway.app`
5. **Add to Netlify:**
   - Set `RAILWAY_API_URL` in Netlify environment variables

## Support

For issues or questions:
- GitHub Issues: https://github.com/overkor-tek/consciousness-revolution/issues
- Email: support@consciousnessrevolution.io

## Security Notes

⚠️ **Never commit API keys to the repository!**

- Use Netlify environment variables for production
- Use `.env` file for local development (already in .gitignore)
- Rotate keys immediately if accidentally exposed
- Use service role keys with caution (full database access)

## Cost Estimates

Approximate monthly costs for moderate usage (1000 messages/month):

- **DeepSeek:** ~$5-10/month (very affordable)
- **Anthropic Claude:** ~$10-20/month (image analysis adds cost)
- **OpenAI:** ~$20-50/month (if used as fallback)
- **Supabase:** Free tier sufficient for most use cases
- **Netlify:** Free tier includes 125k function invocations/month
- **Railway:** Free tier or ~$5/month for always-on service

**Total:** ~$15-40/month depending on usage and configuration

## API Rate Limits

Be aware of rate limits:

- **DeepSeek:** 60 requests/minute
- **Anthropic:** 50 requests/minute (tier 1)
- **OpenAI:** 3,500 requests/minute (tier 1)
- **Supabase:** No hard limits on free tier, but connection pooling recommended
- **GitHub:** 5,000 requests/hour for authenticated requests

## Performance Optimization

To keep costs low and performance high:

1. **Use DeepSeek as primary:** It's fast and cheap
2. **Cache responses:** Consider implementing caching for common queries
3. **Limit conversation history:** Currently limited to last 10 messages
4. **Optimize images:** Compress images before sending to Claude
5. **Monitor usage:** Check API usage dashboards regularly

## Next Steps

After successful deployment:

1. Test all features thoroughly
2. Monitor Netlify function logs for errors
3. Set up monitoring/alerting for API failures
4. Configure Stripe for paid subscriptions (optional)
5. Customize Araya's personality in the system prompt (araya-chat.mjs)
6. Add custom abilities and commands as needed
