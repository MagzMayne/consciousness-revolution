# aFactory Real API Integrations Guide

## Overview

The Autonomous Agent Factory (aFactory.html) now uses **real API integrations** instead of simulations. The system can connect to actual external platforms to create and publish products, articles, videos, and other content that generate real revenue.

## Live URL

**Access the Agent Factory:** https://barbrickdesign.github.io/aFactory.html

## Current Mode: Dry-Run by Default

By default, the system runs in **dry-run mode** which:
- ✅ Logs what actions would be taken
- ✅ Shows realistic mock responses
- ✅ Demonstrates the full workflow
- ❌ Does NOT make actual API calls
- ❌ Does NOT create real content
- ❌ Does NOT generate real revenue

This is intentional for safety - it prevents accidental API usage or costs.

## Enabling Live Integrations

To enable **live mode** with real API calls:

1. Open the browser console (F12 or right-click → Inspect → Console)
2. Set your API keys in localStorage
3. Reload the page

### API Key Configuration

```javascript
// Digital Products & Courses (Gumroad)
localStorage.setItem('gumroad_api_key', 'your_gumroad_api_key');

// Affiliate Content Publishing (Medium)
localStorage.setItem('medium_api_key', 'your_medium_integration_token');

// YouTube Video Automation
localStorage.setItem('youtube_api_key', 'your_youtube_api_key');

// Print-on-Demand Products (Printful)
localStorage.setItem('printful_api_key', 'your_printful_api_key');

// Newsletter Campaigns (Mailchimp)
localStorage.setItem('mailchimp_api_key', 'your_mailchimp_api_key');

// Then reload the page
location.reload();
```

## Supported Integrations

### 1. Digital Products (Gumroad)

**What it does:** Creates and publishes digital products like templates, ebooks, and tools.

**Setup:**
1. Create a Gumroad account at https://gumroad.com
2. Go to Settings → Advanced → Applications
3. Generate an API access token
4. Set in localStorage: `localStorage.setItem('gumroad_api_key', 'your_token')`

**Revenue:** Automatic via Gumroad sales + PayPal integration

### 2. Affiliate Content (Medium)

**What it does:** Publishes affiliate marketing articles to Medium.

**Setup:**
1. Create a Medium account at https://medium.com
2. Go to Settings → Security and apps → Integration tokens
3. Generate a new integration token
4. Set in localStorage: `localStorage.setItem('medium_api_key', 'your_token')`

**Revenue:** Partner Program earnings + affiliate commissions

### 3. Courses (Gumroad)

**What it does:** Creates and sells online courses (as digital products on Gumroad).

**Setup:** Same as Digital Products integration above.

**Revenue:** Course sales via Gumroad + PayPal integration

### 4. Print-on-Demand (Printful)

**What it does:** Creates POD products like t-shirts, mugs, and posters.

**Setup:**
1. Create a Printful account at https://www.printful.com
2. Go to Settings → Stores → API
3. Generate an API key
4. Set in localStorage: `localStorage.setItem('printful_api_key', 'your_key')`

**Note:** Requires design files to be uploaded. Current implementation creates concepts that need manual design completion.

**Revenue:** Automatic fulfillment + profit margins

### 5. YouTube Automation

**What it does:** Manages YouTube video creation and upload workflow.

**Setup:**
1. Create a project in Google Cloud Console
2. Enable YouTube Data API v3
3. Create OAuth 2.0 credentials
4. Set in localStorage: `localStorage.setItem('youtube_api_key', 'your_key')`

**Note:** Requires video files and OAuth2 authentication for uploads. Current implementation creates video scripts and concepts.

**Revenue:** YouTube ad revenue + affiliate links in descriptions

### 6. Micro SaaS Features

**What it does:** Implements and deploys SaaS features to hosting platforms.

**Setup:** Currently creates feature specifications. Full implementation would require:
- Code generation tools
- Hosting platform API (Vercel, Netlify, etc.)
- Automated deployment pipeline

**Revenue:** Subscription fees from SaaS users

### 7. Stock Media (Shutterstock/Adobe Stock)

**What it does:** Uploads media to stock photography platforms.

**Setup:** Requires:
- Stock platform API credentials
- Actual media files (photos/videos)
- Metadata and keywords

**Revenue:** Per-download earnings from stock platforms

### 8. Newsletter (Mailchimp)

**What it does:** Sends newsletter campaigns to subscribers.

**Setup:**
1. Create a Mailchimp account at https://mailchimp.com
2. Go to Profile → Extras → API keys
3. Generate a new API key
4. Set in localStorage: `localStorage.setItem('mailchimp_api_key', 'your_key')`

**Note:** Requires an existing email list and campaign templates.

**Revenue:** Sponsorships + affiliate commissions

## How It Works

### Architecture

```
Manager Agents → Create Tasks
     ↓
Worker Agents → Execute Tasks
     ↓
Integration Layer (afactory-integrations.js)
     ↓
External Platform APIs (Gumroad, Medium, etc.)
     ↓
Real Products/Content Created
     ↓
Revenue Generated → PayPal → BarbrickDesign@gmail.com
```

### Task Flow

1. **Manager Agent** identifies need for content/product
2. **Creates Task** with specifications
3. **Worker Agent** picks up task
4. **Calls Integration** with task payload
5. **Integration Layer** checks if API key exists
   - If yes: Makes real API call to external platform
   - If no: Returns dry-run mock response
6. **Task Completed** with result logged in ledger
7. **Follow-up Tasks** created as needed

### Dry-Run vs Live Mode

| Feature | Dry-Run Mode | Live Mode |
|---------|--------------|-----------|
| API Calls | ❌ None | ✅ Real |
| Content Created | ❌ Simulated | ✅ Actual |
| Revenue Generated | ❌ $0.00 | ✅ Real |
| Costs Incurred | ❌ None | ⚠️ API usage fees |
| Safe for Testing | ✅ Yes | ⚠️ Use carefully |

## Safety & Best Practices

### Before Enabling Live Mode

1. **Test in Dry-Run First** - Verify the system works as expected
2. **Review Task Queue** - Understand what tasks will be executed
3. **Set Reasonable Limits** - Monitor API usage to avoid unexpected costs
4. **Check Credentials** - Ensure API keys are valid and have appropriate permissions

### API Usage Considerations

- **Gumroad**: Free to use, takes percentage of sales
- **Medium**: Free API, but requires Partner Program for revenue
- **YouTube**: Free API with quota limits (10,000 units/day typical)
- **Printful**: No API fees, pay per product + shipping
- **Mailchimp**: Free tier available (up to 500 contacts)

### Security

⚠️ **Important Security Notes:**

- API keys are stored in browser localStorage (unencrypted)
- Only use on trusted computers
- Never share your API keys
- Rotate keys regularly
- Use minimum required permissions
- Monitor API usage regularly

### Cost Management

1. **Start Small** - Test with one integration at a time
2. **Monitor Usage** - Check platform dashboards for API usage
3. **Set Budget Alerts** - Configure alerts in platform settings
4. **Review Regularly** - Check what content is being created
5. **Disable if Needed** - Remove API keys to stop live mode

## Monitoring & Debugging

### Check Integration Status

Open browser console and run:

```javascript
// Check current mode
console.log('Mode:', integrations.getStatus());

// Check which integrations are configured
console.log('Configured APIs:', integrations.getStatus().integrations);
```

### View Task Results

Tasks completed with real integrations include:
- `success: true/false`
- `platform: 'gumroad'/'medium'/etc.`
- `mode: 'live'/'dry_run'/'pending'`
- `url: [actual URL to created content]`
- `error: [error message if failed]`

Check the Public Ledger section for detailed task results.

### Common Issues

**Issue:** "API key not configured"
- **Solution:** Set the API key in localStorage and reload

**Issue:** "API authentication failed"
- **Solution:** Verify API key is valid and has correct permissions

**Issue:** Integration shows "pending" status
- **Solution:** Some integrations require additional resources (design files, video files, etc.)

**Issue:** No revenue being generated
- **Solution:** 
  - Verify live mode is enabled (check console logs)
  - Ensure payment automation backend is running
  - Check that API keys have full permissions

## Revenue Flow

When live integrations are enabled and content is created:

1. **Content Published** to external platform (Gumroad, Medium, etc.)
2. **Sales/Revenue Generated** on that platform
3. **Platform Processes Payment** (typically to platform account)
4. **PayPal Integration** transfers to BarbrickDesign@gmail.com
5. **Backend Tracks** total revenue and payouts
6. **Dashboard Updates** to show real revenue figures

## Troubleshooting

### Page loads but integrations not working

```javascript
// Check if integration script loaded
console.log(window.AFactoryIntegrations);

// Check if integrations initialized
console.log(integrations);
```

### API calls failing

```javascript
// Enable debug logging
localStorage.setItem('debug', 'afactory:*');
location.reload();
```

### Need to reset everything

```javascript
// Clear all localStorage data
localStorage.clear();
location.reload();
```

## Support & Documentation

- **General Questions:** BarbrickDesign@gmail.com
- **API Documentation:**
  - Gumroad: https://gumroad.com/api
  - Medium: https://github.com/Medium/medium-api-docs
  - YouTube: https://developers.google.com/youtube/v3
  - Printful: https://developers.printful.com/
  - Mailchimp: https://mailchimp.com/developer/

## Future Enhancements

Planned improvements:
- [ ] Shopify integration for e-commerce
- [ ] Stripe integration for direct payments
- [ ] AI content generation (GPT-4, Claude, etc.)
- [ ] Image generation (DALL-E, Midjourney API)
- [ ] Video generation (automated editing)
- [ ] SEO optimization tools
- [ ] Analytics dashboard
- [ ] Multi-platform publishing
- [ ] Automated A/B testing
- [ ] Revenue optimization algorithms

---

**Last Updated:** December 30, 2024  
**Version:** 2.0.0  
**Status:** ✅ Production Ready - Real API Integrations Active
