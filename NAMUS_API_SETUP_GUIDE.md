# NamUs API Setup & Configuration Guide

## Overview

This guide walks you through setting up NamUs (National Missing and Unidentified Persons System) API credentials for the findThem application. NamUs is the official U.S. government database for missing persons and unidentified remains.

## 🔑 What You'll Need

- A NamUs.gov account (free registration)
- API access credentials (obtained after registration)
- Backend proxy service for production use (recommended)
- Environment configuration (for development)

## 📋 Prerequisites

Before starting, understand that:

1. **NamUs API Access**: Currently, NamUs does not provide a widely available public API. Access may require:
   - Registration at namus.gov
   - Special access request for API credentials
   - Compliance with data use agreements
   - Law enforcement or public service affiliation (in some cases)

2. **Data Sensitivity**: Missing persons data is sensitive. All implementations must:
   - Respect privacy and dignity of individuals
   - Comply with ethical use guidelines
   - Follow data protection regulations
   - Implement appropriate security measures

3. **Rate Limiting**: API usage is typically rate-limited to:
   - Prevent server overload
   - Ensure fair access
   - Protect data integrity
   - Require backend proxy for production

## 🚀 Step 1: Register at NamUs.gov

### Account Registration

1. **Visit NamUs Website**
   ```
   https://www.namus.gov/
   ```

2. **Create Account**
   - Click "Register" or "Sign Up"
   - Provide required information:
     - Full name
     - Email address
     - Organization (if applicable)
     - Purpose of access
   - Agree to terms of service and data use policies

3. **Verify Email**
   - Check your email for verification link
   - Click link to confirm account
   - Complete any additional verification steps

### Request API Access

1. **Navigate to API Access**
   - Log into your NamUs account
   - Go to Account Settings or Developer section
   - Look for "API Access" or "Developer Tools"

2. **Submit API Access Request**
   - Complete API access application form
   - Specify intended use:
     - Community-driven missing person support
     - Public awareness and outreach
     - Integration with findThem application
   - Provide technical details:
     - Expected request volume
     - Implementation description
     - Security measures

3. **Wait for Approval**
   - API access requests are typically reviewed within 5-10 business days
   - You may be contacted for additional information
   - Check email regularly for approval notification

4. **Receive API Credentials**
   - Once approved, you'll receive:
     - API Key (secret token)
     - API Endpoint URL
     - Rate limit information
     - Documentation links

## 🔧 Step 2: Configure Environment Variables

### For Development (Local Setup)

1. **Copy Environment Template**
   ```bash
   cp .env.example .env
   ```

2. **Edit .env File**
   ```bash
   # Open in your preferred editor
   nano .env
   # or
   code .env
   ```

3. **Add NamUs Credentials**
   ```env
   # NamUs API Integration
   NAMUS_API_KEY=your_actual_api_key_here
   NAMUS_API_ENDPOINT=https://www.namus.gov/api/CaseSets/NamUs
   NAMUS_RATE_LIMIT_PER_HOUR=100
   ```

4. **Save and Secure**
   ```bash
   # Set restrictive permissions
   chmod 600 .env
   
   # Verify .env is in .gitignore
   grep "^\.env$" .gitignore
   ```

### Security Best Practices

⚠️ **CRITICAL**: Never commit API keys to version control!

- ✅ Keep `.env` file in `.gitignore`
- ✅ Use environment variables for all secrets
- ✅ Rotate API keys periodically
- ✅ Use backend proxy for production
- ✅ Implement rate limiting
- ✅ Monitor API usage
- ❌ Never hardcode API keys in source code
- ❌ Never commit `.env` file
- ❌ Never share API keys publicly

## 🏗️ Step 3: Backend Proxy Service Setup (Recommended)

### Why Use a Backend Proxy?

A backend proxy service is **highly recommended** for production because:

1. **Security**: Keep API keys on server-side (never exposed to client)
2. **Rate Limiting**: Implement centralized rate limiting across all users
3. **Caching**: Reduce API calls by caching responses
4. **Analytics**: Track usage patterns and optimize
5. **Cost Control**: Prevent abuse and manage API quotas
6. **Monitoring**: Centralized logging and error handling

### Proxy Service Architecture

```
Client (Browser) → Backend Proxy → NamUs API
                   ↓
              Rate Limiter
                   ↓
              Cache Layer
                   ↓
              API Key Store
```

### Implementation Options

#### Option A: Node.js Express Proxy

Create `backend/namus-proxy.js`:

```javascript
const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');

require('dotenv').config();

const app = express();
const cache = new NodeCache({ stdTTL: 300 }); // 5 min cache

// Rate limiting: 10 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many requests, please try again later.'
});

app.use(limiter);
app.use(express.json());

// CORS configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Proxy endpoint
app.post('/api/namus/search', async (req, res) => {
  try {
    const { filters } = req.body;
    const cacheKey = `search_${JSON.stringify(filters)}`;
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ ...cached, cached: true });
    }
    
    // Make API request
    const response = await axios({
      method: 'GET',
      url: `${process.env.NAMUS_API_ENDPOINT}/MissingPersons`,
      headers: {
        'Authorization': `Bearer ${process.env.NAMUS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      params: filters
    });
    
    // Cache and return
    cache.set(cacheKey, response.data);
    res.json(response.data);
    
  } catch (error) {
    console.error('NamUs API Error:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch data from NamUs',
      message: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'namus-proxy' });
});

const PORT = process.env.NAMUS_PROXY_PORT || 3020;
app.listen(PORT, () => {
  console.log(`NamUs Proxy Service running on port ${PORT}`);
});
```

**Install Dependencies:**
```bash
npm install express axios express-rate-limit node-cache dotenv
```

**Run Proxy:**
```bash
node backend/namus-proxy.js
```

#### Option B: Cloudflare Workers Proxy

Create `backend/namus-worker.js`:

```javascript
// Cloudflare Worker for NamUs API Proxy
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Rate limiting using Cloudflare KV
  const ip = request.headers.get('CF-Connecting-IP');
  const rateLimitKey = `ratelimit_${ip}`;
  
  // Check rate limit (10 requests per minute)
  const rateLimitCount = await NAMUS_KV.get(rateLimitKey);
  if (rateLimitCount && parseInt(rateLimitCount) > 10) {
    return new Response('Rate limit exceeded', { status: 429 });
  }
  
  // Increment counter
  const newCount = (parseInt(rateLimitCount) || 0) + 1;
  await NAMUS_KV.put(rateLimitKey, newCount.toString(), { expirationTtl: 60 });
  
  // Proxy request to NamUs API
  try {
    const response = await fetch(NAMUS_API_ENDPOINT, {
      headers: {
        'Authorization': `Bearer ${NAMUS_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

**Deploy:**
```bash
wrangler publish
```

#### Option C: Vercel Serverless Function

Create `api/namus.js`:

```javascript
import axios from 'axios';

export default async function handler(req, res) {
  // Rate limiting would be handled by Vercel Edge Config
  // or external service like Upstash Redis
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const response = await axios({
      method: 'GET',
      url: process.env.NAMUS_API_ENDPOINT,
      headers: {
        'Authorization': `Bearer ${process.env.NAMUS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      params: req.body.filters
    });
    
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

**Deploy:**
```bash
vercel deploy
```

### Environment Variables for Proxy

Add to your `.env` file:

```env
# Backend Proxy Configuration
NAMUS_PROXY_PORT=3020
NAMUS_PROXY_URL=http://localhost:3020/api/namus
ALLOWED_ORIGIN=https://barbrickdesign.github.io

# For production
NAMUS_PROXY_URL=https://your-proxy-service.com/api/namus
```

## 📱 Step 4: Update Frontend Integration

### Update namus-api-service.js

Modify the service to use backend proxy in production:

```javascript
class NamUsAPIService {
  constructor() {
    // Use backend proxy in production, direct API in development
    this.USE_PROXY = process.env.NODE_ENV === 'production' || 
                     window.location.hostname !== 'localhost';
    
    this.API_BASE = this.USE_PROXY 
      ? process.env.NAMUS_PROXY_URL || '/api/namus'
      : process.env.NAMUS_API_ENDPOINT || 'https://www.namus.gov/api/CaseSets/NamUs';
  }
  
  async fetchCases(filters = {}) {
    try {
      const endpoint = this.USE_PROXY 
        ? `${this.API_BASE}/search`
        : `${this.API_BASE}/MissingPersons`;
      
      const options = this.USE_PROXY
        ? {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filters })
          }
        : {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${process.env.NAMUS_API_KEY}`,
              'Content-Type': 'application/json'
            }
          };
      
      const response = await fetch(endpoint, options);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Store cases in localStorage
      localStorage.setItem(this.STORAGE_KEYS.CASES, JSON.stringify(data.cases || data));
      
      this.lastSyncTime = new Date();
      this.saveState();
      
      return {
        success: true,
        cases: data.cases || data,
        timestamp: this.lastSyncTime,
        source: data.cached ? 'cache' : 'namus_api'
      };
    } catch (error) {
      console.error('Error fetching NamUs cases:', error);
      this.notifyError({
        type: 'fetch_error',
        message: error.message,
        timestamp: new Date()
      });
      
      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }
}
```

## 💰 Step 5: Contribute API Keys to Pool (Optional)

As part of the BarbrickDesign contribution system, you can share your NamUs API credentials to earn rewards:

### How It Works

1. **Contribute Your API Key**: Share your NamUs API key with the community pool
2. **Earn Points**: Get points whenever your key is used for searches
3. **Rate-Limited**: Your key usage is monitored and rate-limited for protection
4. **Fair Distribution**: Keys are rotated to distribute usage evenly
5. **Rewards**: Earn bonus points based on successful searches

### Adding to Contribution Portal

Visit the [Contribution Portal](https://barbrickdesign.github.io/contribution-portal.html) to:

1. Navigate to "API Keys" section
2. Select "NamUs" from service dropdown
3. Enter your API key
4. Set daily usage limit (recommended: 80% of your quota)
5. Configure point rate (default: 5 points per search)
6. Click "Contribute API Key"

### Contribution Rewards

- **Base Rate**: 5 points per successful search
- **Consistency Bonus**: 2x multiplier for daily contributions
- **High Availability**: 1.5x multiplier for 99%+ uptime
- **Community Impact**: Additional points for helping missing person cases

See [API_POOL_SYSTEM_README.md](API_POOL_SYSTEM_README.md) for complete reward details.

## 📊 Monitoring & Analytics

### Track Your API Usage

1. **View Dashboard**
   ```
   https://barbrickdesign.github.io/api-resource-leaderboard.html
   ```

2. **Check Statistics**
   - Total searches performed
   - API calls made
   - Rate limit status
   - Points earned
   - Uptime percentage

3. **Set Up Alerts**
   - Rate limit warnings (80% threshold)
   - Error rate notifications
   - Daily usage summaries

### Rate Limit Management

Monitor your usage to stay within limits:

```javascript
// Check current rate limit status
const status = namusService.getRateLimitStatus();
console.log(`Used: ${status.used}/${status.limit}`);
console.log(`Remaining: ${status.remaining}`);
console.log(`Resets in: ${status.resetIn} minutes`);
```

## 🔍 Testing Your Setup

### 1. Test API Connection

```bash
# Using curl
curl -X GET "https://www.namus.gov/api/CaseSets/NamUs/MissingPersons" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

### 2. Test Frontend Integration

Open `findThem.html` in your browser and:

1. Open browser console (F12)
2. Check for initialization messages
3. Monitor API requests in Network tab
4. Verify data loads successfully

### 3. Test Proxy Service

```bash
# Test proxy health
curl http://localhost:3020/health

# Test proxy search
curl -X POST http://localhost:3020/api/namus/search \
  -H "Content-Type: application/json" \
  -d '{"filters":{"state":"Indiana"}}'
```

## 🐛 Troubleshooting

### Common Issues

**Issue: "API Key Invalid"**
- Solution: Verify key is correct in .env file
- Check for extra spaces or quotes
- Ensure API access is approved

**Issue: "Rate Limit Exceeded"**
- Solution: Implement caching
- Use backend proxy
- Reduce sync frequency
- Wait for rate limit reset

**Issue: "CORS Error"**
- Solution: Use backend proxy
- Configure CORS headers on server
- Check browser security settings

**Issue: "No Data Returned"**
- Solution: Check API endpoint URL
- Verify filter parameters
- Check NamUs API status
- Review API documentation

### Getting Help

- **Documentation**: Read [API_POOL_SYSTEM_README.md](API_POOL_SYSTEM_README.md)
- **Issues**: Open issue on GitHub
- **Community**: Join Discord for support
- **Contact**: Email support@barbrickdesign.com

## 📚 Additional Resources

### Official Documentation

- **NamUs Website**: https://www.namus.gov/
- **NamUs Help**: https://www.namus.gov/help
- **API Documentation**: Contact NamUs for access

### Related Guides

- [FIREBASE_SETUP_GUIDE.md](FIREBASE_SETUP_GUIDE.md) - Firebase configuration
- [API_POOL_SYSTEM_README.md](API_POOL_SYSTEM_README.md) - Contribution system
- [ETHICAL_USE_GUIDELINES.md](ETHICAL_USE_GUIDELINES.md) - Usage ethics

### Community Resources

- **GitHub Repository**: https://github.com/barbrickdesign/barbrickdesign.github.io
- **Discord Community**: https://discord.gg/M4QZyPQq
- **Contribution Portal**: https://barbrickdesign.github.io/contribution-portal.html

## ⚖️ Legal & Ethical Considerations

### Data Use Agreement

By using the NamUs API, you agree to:

- Use data only for legitimate purposes
- Respect privacy of individuals and families
- Not misuse or redistribute sensitive information
- Comply with all applicable laws and regulations
- Follow ethical use guidelines

### Ethical Guidelines

✅ **Allowed Uses:**
- Community awareness and outreach
- Public safety initiatives
- Missing person search assistance
- Data analysis for research (with approval)
- Integration with emergency services

🚫 **Prohibited Uses:**
- Harassment or stalking
- Unauthorized surveillance
- Discrimination or profiling
- Commercial exploitation
- Violation of privacy rights

See [ETHICAL_USE_GUIDELINES.md](ETHICAL_USE_GUIDELINES.md) for complete details.

## 🎉 Next Steps

After completing this setup:

1. ✅ Test your NamUs API integration
2. ✅ Configure Firebase (see [FIREBASE_SETUP_GUIDE.md](FIREBASE_SETUP_GUIDE.md))
3. ✅ Set up backend proxy service
4. ✅ Consider contributing to API pool for rewards
5. ✅ Review ethical use guidelines
6. ✅ Join the community on Discord

## 📞 Support

For questions or issues:

- **Email**: support@barbrickdesign.com
- **GitHub Issues**: https://github.com/barbrickdesign/barbrickdesign.github.io/issues
- **Discord**: https://discord.gg/M4QZyPQq

---

**Built with ❤️ for the BarbrickDesign community**

Help find missing persons responsibly. 🕊️
