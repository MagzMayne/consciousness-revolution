# Railway Deployment Quick Start

Quick reference guide for deploying backend services to Railway.

## Prerequisites

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login
```

## Quick Deploy (All Services)

```bash
# 1. Initialize Railway project (first time only)
railway init

# 2. Deploy all services
railway up

# 3. Check deployment status
railway status

# 4. View logs
railway logs
```

## Deploy Specific Services

```bash
# Deploy essential services first
railway up --service bounty-hunter-api
railway up --service email-service
railway up --service fix-it-ticket-service

# Then deploy others as needed
railway up --service kas-service
railway up --service micro-tx-service
railway up --service anchor-service
railway up --service affiliate-service
railway up --service relayer-service
```

## Using Helper Script

```bash
# Run deployment helper
npm run deploy:railway

# Or directly
node deploy-railway.js
```

## Set Environment Variables

### Via Railway CLI

```bash
# Set individual variables
railway variables set NODE_ENV=production
railway variables set LOG_LEVEL=info
railway variables set CORS_ORIGINS=https://barbrickdesign.github.io

# Set API keys
railway variables set OPENAI_API_KEY=sk-your-key
railway variables set PAYPAL_CLIENT_ID=your-client-id

# View all variables
railway variables
```

### Via Railway Dashboard

1. Go to [railway.app/dashboard](https://railway.app/dashboard)
2. Select your project
3. Click on a service
4. Go to "Variables" tab
5. Add/edit variables
6. Deploy to apply changes

## Essential Environment Variables

```bash
# Required for all services
NODE_ENV=production
LOG_LEVEL=info
ENABLE_MONITORING=true
AUTO_HEALING_ENABLED=true
CORS_ORIGINS=https://barbrickdesign.github.io

# Service URLs (Railway auto-populates these)
# You can also manually set them for inter-service communication
EMAIL_SERVICE_URL=https://email-service-production.railway.app
FIX_IT_SERVICE_URL=https://fix-it-ticket-service-production.railway.app
KAS_SERVICE_URL=https://kas-service-production.railway.app
```

## Update Frontend URLs

After deploying services, update these files:

### 1. Fix-It Widget
File: `src/utils/fix-it-widget.js`

The service discovery helper should automatically use Railway URLs, but you can also set:
```javascript
window.FIX_IT_SERVICE_URL = 'https://fix-it-ticket-service-production.railway.app';
```

### 2. Create a config file
Create `config.js` in your project root:

```javascript
// config.js - Railway Service URLs
window.RAILWAY_SERVICES = {
  BOUNTY_HUNTER_API: 'https://bounty-hunter-api-production.railway.app',
  EMAIL_SERVICE: 'https://email-service-production.railway.app',
  FIX_IT_SERVICE: 'https://fix-it-ticket-service-production.railway.app',
  KAS_SERVICE: 'https://kas-service-production.railway.app',
  GRID_CONTROL_API: 'https://grid-control-api-production.railway.app',
  MICRO_TX_SERVICE: 'https://micro-tx-service-production.railway.app',
  ANCHOR_SERVICE: 'https://anchor-service-production.railway.app',
  AFFILIATE_SERVICE: 'https://affiliate-service-production.railway.app',
  RELAYER_SERVICE: 'https://relayer-service-production.railway.app'
};
```

Then include it in your HTML:
```html
<script src="config.js"></script>
```

## Test Deployment

```bash
# Test health endpoints
curl https://bounty-hunter-api-production.railway.app/health
curl https://email-service-production.railway.app/health
curl https://fix-it-ticket-service-production.railway.app/health

# Or use the test script (create this):
# test-railway-endpoints.sh
```

## Monitor Services

```bash
# View all logs
railway logs

# View logs for specific service
railway logs --service bounty-hunter-api

# Follow logs (live)
railway logs --follow

# View metrics in dashboard
open https://railway.app/project/[project-id]/metrics
```

## Common Commands

```bash
# Check status
railway status

# View current environment
railway environment

# Switch environment
railway environment production
railway environment staging

# Redeploy a service
railway up --service [service-name]

# Restart a service
railway restart --service [service-name]

# View service URL
railway domain

# Open Railway dashboard
railway open
```

## Troubleshooting

### Service won't start
```bash
# Check logs
railway logs --service [service-name]

# Common issues:
# - Missing environment variables
# - Port binding (use process.env.PORT)
# - Dependencies not installed (check package.json)
```

### Service crashes on startup
```bash
# Check logs for errors
railway logs --service [service-name] --level error

# Verify health endpoint
curl https://[service-name]-production.railway.app/health
```

### Can't access service
```bash
# Check if service is running
railway status

# Check domain
railway domain

# Verify CORS settings
# Make sure CORS_ORIGINS includes your GitHub Pages URL
```

## Priority Services (Free Tier)

If using Railway's free tier, deploy these essential services first:

1. **bounty-hunter-api** - Main API gateway (highest priority)
2. **fix-it-ticket-service** - Error reporting (important for debugging)
3. **email-service** - Notifications (low resource usage)

Others can run locally or on-demand.

## Cost Monitoring

```bash
# Check usage
railway usage

# View billing
open https://railway.app/account/billing
```

Free tier includes:
- $5 credit per month
- 500 hours of service runtime
- 100 GB bandwidth

## Next Steps

1. ✅ Deploy essential services
2. ✅ Set environment variables
3. ✅ Update frontend URLs
4. ✅ Test all endpoints
5. ✅ Monitor logs for errors
6. ✅ Set up custom domains (optional)
7. ✅ Configure auto-deployments

## Resources

- **Full Guide**: [RAILWAY_DEPLOYMENT_GUIDE.md](./RAILWAY_DEPLOYMENT_GUIDE.md)
- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Service Discovery**: [src/utils/service-discovery.js](./src/utils/service-discovery.js)
- **Environment Variables**: [.env.example](./.env.example)

## Support

For issues:
- Check logs: `railway logs`
- View status: `railway status`
- Contact: BarbrickDesign@gmail.com
- Create issue with `[Railway]` prefix

---

**Last Updated**: February 2024
