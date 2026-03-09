# Railway Deployment Guide

This guide will help you deploy the Barbrick Design backend services to Railway.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Service Architecture](#service-architecture)
4. [Deployment Steps](#deployment-steps)
5. [Environment Variables](#environment-variables)
6. [Inter-Service Communication](#inter-service-communication)
7. [Monitoring & Debugging](#monitoring--debugging)
8. [Cost Optimization](#cost-optimization)

## Prerequisites

Before deploying to Railway, ensure you have:

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **Railway CLI** (optional but recommended):
   ```bash
   npm install -g @railway/cli
   railway login
   ```
3. **GitHub Account**: Railway deploys from GitHub repositories
4. **API Keys**: All required API keys from `.env.example`

## Quick Start

### Option 1: Deploy via Railway Dashboard (Recommended for beginners)

1. **Go to Railway Dashboard**: [railway.app/dashboard](https://railway.app/dashboard)
2. **Create New Project**: Click "New Project"
3. **Deploy from GitHub**: Select "Deploy from GitHub repo"
4. **Select Repository**: Choose `barbrickdesign/barbrickdesign.github.io`
5. **Configure Services**: Railway will auto-detect the `railway.json` configuration
6. **Add Environment Variables**: Go to each service → Variables → Add variables from `.env.example`
7. **Deploy**: Click "Deploy" - Railway will automatically build and deploy

### Option 2: Deploy via Railway CLI (Recommended for developers)

```bash
# 1. Clone the repository
git clone https://github.com/barbrickdesign/barbrickdesign.github.io.git
cd barbrickdesign.github.io

# 2. Login to Railway
railway login

# 3. Initialize Railway project (first time only)
railway init

# 4. Link to existing project (if already created)
railway link

# 5. Set environment variables
railway variables set NODE_ENV=production
railway variables set LOG_LEVEL=info
# ... add all other required variables

# 6. Deploy all services
railway up

# 7. Check deployment status
railway status

# 8. View logs
railway logs
```

## Service Architecture

The backend is split into multiple microservices for scalability and maintainability:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              Frontend (GitHub Pages)                │
│         https://barbrickdesign.github.io            │
│                                                     │
└─────────────────┬───────────────────────────────────┘
                  │
                  ├─── HTTPS Requests
                  │
┌─────────────────▼───────────────────────────────────┐
│                                                     │
│           Railway Services (Backend)                │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  bounty-hunter-api  (Main API Gateway)     │   │
│  │  Port: 3000                                 │   │
│  │  Public: ✓                                  │   │
│  └────────┬────────────────────────────────────┘   │
│           │ Calls                                   │
│  ┌────────▼───────────┐  ┌──────────────────┐     │
│  │  email-service     │  │  kas-service     │     │
│  │  Port: 4000        │  │  Port: 3010      │     │
│  │  Private: ✓        │  │  Private: ✓      │     │
│  └────────────────────┘  └──────────────────┘     │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  fix-it-ticket-service                      │   │
│  │  Port: 4001                                 │   │
│  │  Public: ✓ (for widget)                    │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌────────────────┐  ┌───────────────────────┐    │
│  │  micro-tx      │  │  anchor-service       │    │
│  │  Port: 3000    │  │  Port: 3001           │    │
│  └────────────────┘  └───────────────────────┘    │
│                                                     │
│  ┌────────────────┐  ┌───────────────────────┐    │
│  │  affiliate     │  │  relayer-service      │    │
│  │  Port: 3002    │  │  Port: 3003           │    │
│  └────────────────┘  └───────────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Service Descriptions

| Service | Purpose | Public/Private | Dependencies |
|---------|---------|----------------|--------------|
| **bounty-hunter-api** | Main API gateway, bounty management | Public | None |
| **email-service** | Email notifications (SMTP) | Private | None |
| **fix-it-ticket-service** | Error reporting system | Public | email-service |
| **kas-service** | Key Authority Service (API key management) | Private | None |
| **grid-control-api** | Power line communication, IoT | Private | None |
| **micro-tx** | Micro-transaction processing | Private | None |
| **anchor-service** | Blockchain anchoring (Bitcoin/Ethereum) | Private | None |
| **affiliate-service** | Affiliate tracking | Private | None |
| **relayer-service** | Meta-transaction relay | Private | None |

## Deployment Steps

### Step 1: Create Railway Project

```bash
# Via CLI
railway init

# Or via dashboard: railway.app/new
```

### Step 2: Deploy Core Services First

Deploy in this order to handle dependencies:

1. **email-service** (no dependencies)
2. **kas-service** (no dependencies)
3. **bounty-hunter-api** (no dependencies)
4. **fix-it-ticket-service** (depends on email-service)
5. Others (micro-tx, anchor, affiliate, relayer, grid-control)

```bash
# Deploy specific service
cd backend
railway up --service bounty-hunter-api
railway up --service email-service
railway up --service fix-it-ticket-service
# ... etc
```

### Step 3: Configure Environment Variables

For each service, set these variables in Railway Dashboard or CLI:

```bash
# Required for all services
railway variables set NODE_ENV=production
railway variables set LOG_LEVEL=info
railway variables set CORS_ORIGINS=https://barbrickdesign.github.io

# Service-specific URLs (use Railway-provided domains)
railway variables set EMAIL_SERVICE_URL=https://email-service-production.railway.app
railway variables set KAS_SERVICE_URL=https://kas-service-production.railway.app
# ... etc

# API Keys (from .env.example)
railway variables set OPENAI_API_KEY=sk-your-key
railway variables set PAYPAL_CLIENT_ID=your-client-id
# ... etc
```

### Step 4: Verify Deployment

```bash
# Check service status
railway status

# View logs
railway logs --service bounty-hunter-api

# Open service in browser
railway open
```

### Step 5: Update Frontend URLs

After deployment, update frontend files to use Railway URLs:

1. **Fix-It Widget**: `src/utils/fix-it-widget.js`
   ```javascript
   const API_URL = process.env.FIX_IT_SERVICE_URL || 'https://fix-it-ticket-service-production.railway.app';
   ```

2. **Management Agent**: `src/systems/management-deployment-agent.js`
   ```javascript
   const MICRO_TX_URL = process.env.MICRO_TX_URL || 'https://micro-tx-service-production.railway.app';
   ```

## Environment Variables

### Required Variables (All Services)

```bash
NODE_ENV=production
LOG_LEVEL=info
ENABLE_MONITORING=true
AUTO_HEALING_ENABLED=true
CORS_ORIGINS=https://barbrickdesign.github.io
```

### Service-Specific Variables

#### bounty-hunter-api
```bash
PORT=3000
SERVICE_NAME=bounty-hunter-api
RAILWAY_API_KEY=your-railway-api-key
```

#### email-service
```bash
PORT=4000
SERVICE_NAME=email-service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### fix-it-ticket-service
```bash
PORT=4001
SERVICE_NAME=fix-it-ticket-service
EMAIL_SERVICE_URL=https://email-service-production.railway.app
```

#### kas-service
```bash
PORT=3010
SERVICE_NAME=kas-service
JWT_SECRET=your-jwt-secret
```

### Railway Auto-Provided Variables

Railway automatically provides these - don't set them manually:

- `PORT` - The port Railway assigns (use `process.env.PORT`)
- `RAILWAY_PUBLIC_DOMAIN` - Public URL (e.g., `service-production.railway.app`)
- `RAILWAY_PRIVATE_DOMAIN` - Private URL for inter-service calls
- `RAILWAY_ENVIRONMENT` - Environment name (production/staging)
- `RAILWAY_SERVICE_NAME` - Service name

## Inter-Service Communication

### Public vs Private URLs

Railway provides two types of URLs:

1. **Public Domain** (`RAILWAY_PUBLIC_DOMAIN`):
   - Accessible from the internet
   - Use for: Frontend API calls, webhooks
   - Example: `https://bounty-hunter-api-production.railway.app`

2. **Private Domain** (`RAILWAY_PRIVATE_DOMAIN`):
   - Only accessible within Railway network
   - Use for: Service-to-service communication
   - Faster and free (no bandwidth charges)
   - Example: `http://bounty-hunter-api.railway.internal`

### Service Discovery Pattern

Use environment variables for service URLs:

```javascript
// backend/services/fix-it-ticket-service.js
const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL || 
                         process.env.RAILWAY_PRIVATE_DOMAIN_EMAIL_SERVICE ||
                         'http://localhost:4000';

async function sendNotification(ticket) {
  const response = await axios.post(`${EMAIL_SERVICE_URL}/send`, {
    to: ticket.email,
    subject: 'Fix-It Ticket Update',
    body: ticket.description
  });
  return response.data;
}
```

### Setting Inter-Service URLs

After deploying all services, update environment variables:

```bash
# In fix-it-ticket-service
railway variables set EMAIL_SERVICE_URL=$RAILWAY_PRIVATE_DOMAIN_EMAIL_SERVICE

# Or use the public domain if private domain isn't available
railway variables set EMAIL_SERVICE_URL=https://email-service-production.railway.app
```

## Monitoring & Debugging

### View Logs

```bash
# All services
railway logs

# Specific service
railway logs --service bounty-hunter-api

# Follow logs (live)
railway logs --follow

# Filter by level
railway logs --level error
```

### Health Checks

All services expose a `/health` endpoint:

```bash
curl https://bounty-hunter-api-production.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "bounty-hunter-api",
  "timestamp": "2024-02-19T04:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

### Metrics Dashboard

Railway provides built-in metrics:
- CPU usage
- Memory usage
- Request count
- Response times
- Error rates

Access at: `railway.app/project/[project-id]/metrics`

### Common Issues

#### 1. Port Binding Error

**Problem**: Service fails to start with "Port already in use"

**Solution**: Use Railway's provided `PORT` environment variable:
```javascript
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Service listening on port ${PORT}`);
});
```

#### 2. Service Not Responding

**Problem**: Requests timeout or return 502

**Solution**: 
- Check logs: `railway logs --service [service-name]`
- Verify health check: `/health` endpoint responds
- Check CORS configuration
- Ensure service binds to `0.0.0.0`, not `localhost`

#### 3. Environment Variables Not Loading

**Problem**: Service can't access env vars

**Solution**:
```bash
# Verify variables are set
railway variables

# Redeploy service
railway up
```

## Cost Optimization

### Free Tier Limits

Railway Free Tier includes:
- $5 credit per month
- Up to 500 hours of service runtime
- 100 GB bandwidth

### Cost-Saving Tips

1. **Consolidate Services**: Consider running multiple lightweight services in one container
2. **Use Private Domains**: Inter-service calls via private domain are free
3. **Optimize Logging**: Set `LOG_LEVEL=warn` in production to reduce log storage
4. **Sleep Inactive Services**: Use Railway's auto-sleep feature for low-traffic services
5. **Monitor Usage**: Check Railway dashboard for resource usage

### Estimated Monthly Costs

| Tier | Services | Cost |
|------|----------|------|
| **Hobby** (Free) | 2-3 services | $0-$5/month |
| **Developer** | 5-8 services | $20-$50/month |
| **Team** | All services | $100-$200/month |

### Priority Services for Free Tier

If on free tier, deploy these essential services first:

1. **bounty-hunter-api** - Main API (highest traffic)
2. **fix-it-ticket-service** - Error reporting (important for debugging)
3. **email-service** - Notifications (low resource usage)

Run others locally or on-demand.

## Advanced Configuration

### Custom Domains

Add custom domain in Railway dashboard:
1. Go to service → Settings → Domains
2. Add domain (e.g., `api.barbrickdesign.com`)
3. Add DNS records as instructed
4. Enable SSL (automatic)

### Automatic Deployments

Railway auto-deploys on:
- Push to `main` branch (default)
- Pull request merge

To disable: Service Settings → Deploys → Disable auto-deploy

### Rollback

```bash
# View deployment history
railway deployments

# Rollback to previous deployment
railway rollback
```

### Environment Branches

Create separate environments for staging/production:

```bash
# Create staging environment
railway environment create staging

# Switch to staging
railway environment staging

# Deploy to staging
railway up

# Switch back to production
railway environment production
```

## Testing Deployment

### Test Checklist

- [ ] All services show "Healthy" status in Railway dashboard
- [ ] Health endpoints respond: `/health` returns 200
- [ ] Frontend can connect to Railway APIs
- [ ] Inter-service communication works
- [ ] CORS allows requests from GitHub Pages
- [ ] Environment variables are set correctly
- [ ] Logs show no critical errors
- [ ] API responses are correct (test with Postman/curl)

### Test Script

```bash
#!/bin/bash
# test-railway-deployment.sh

echo "Testing Railway deployment..."

# Test bounty-hunter-api
curl -f https://bounty-hunter-api-production.railway.app/health || echo "❌ bounty-hunter-api failed"

# Test email-service
curl -f https://email-service-production.railway.app/health || echo "❌ email-service failed"

# Test fix-it-ticket-service
curl -f https://fix-it-ticket-service-production.railway.app/health || echo "❌ fix-it-ticket-service failed"

echo "✅ All tests passed!"
```

## Support

### Resources

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **Project Issues**: [GitHub Issues](https://github.com/barbrickdesign/barbrickdesign.github.io/issues)

### Contact

For deployment issues specific to this project:
- Email: BarbrickDesign@gmail.com
- Create GitHub Issue with `[Railway]` prefix

## Next Steps

After successful deployment:

1. ✅ Update frontend URLs to use Railway domains
2. ✅ Test all features end-to-end
3. ✅ Set up monitoring alerts
4. ✅ Configure custom domains (optional)
5. ✅ Document service URLs in README
6. ✅ Set up CI/CD for automatic deployments

---

**Last Updated**: February 2024
**Version**: 1.0.0
