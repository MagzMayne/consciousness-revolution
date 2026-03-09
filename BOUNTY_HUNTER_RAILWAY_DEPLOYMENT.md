# Bounty Hunter Railway Deployment Guide

## Overview

This guide explains how to deploy the Bounty Hunter API backend service to Railway, connecting it with the bountyHunter.html frontend hosted on GitHub Pages.

## Architecture

```
GitHub Pages (Frontend)
  bountyHunter.html
        ↓
  (HTTPS/CORS)
        ↓
Railway.app (Backend)
  bounty-hunter-api.js
```

## Prerequisites

1. Railway account (https://railway.app)
2. Railway CLI installed (optional but recommended)
3. GitHub repository access
4. Node.js 16+ installed locally for testing

## Quick Start - Railway Web UI

### Step 1: Create New Project

1. Log in to Railway: https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose `barbrickdesign/barbrickdesign.github.io`
5. Click "Deploy Now"

### Step 2: Configure Service

Railway will automatically detect the `railway.json` configuration file, which includes:

- **Build Command**: `npm install && cd backend && npm install`
- **Start Command**: `cd backend && node services/bounty-hunter-api.js`
- **Health Check**: `/health`
- **Watch Patterns**: Auto-redeploys on changes to `backend/**/*.js`, `src/**/*.js`, `package.json`

### Step 3: Verify Deployment

1. Wait for deployment to complete (2-5 minutes)
2. Railway will provide a public URL like: `https://your-app.up.railway.app`
3. Test the health endpoint: `https://your-app.up.railway.app/health`
4. Expected response:
   ```json
   {
     "status": "ok",
     "service": "bounty-hunter-api",
     "timestamp": "2026-02-19T05:24:23.258Z"
   }
   ```

### Step 4: Configure Frontend

1. Open https://barbrickdesign.github.io/bountyHunter.html
2. In the "Backend URL" field, enter your Railway URL
3. Example: `https://your-app.up.railway.app`
4. Click "Check Backend Status" to verify connection

## Railway CLI Deployment (Alternative)

### Install Railway CLI

```bash
npm install -g @railway/cli
railway login
```

### Deploy from Command Line

```bash
# From repository root
railway init
railway up
railway open
```

### View Logs

```bash
railway logs
```

### Check Status

```bash
railway status
```

## Configuration Files

### railway.json

Main configuration file for Railway deployment:

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && cd backend && npm install",
    "watchPatterns": [
      "backend/**/*.js",
      "src/**/*.js",
      "package.json"
    ]
  },
  "deploy": {
    "runtime": "V2",
    "numReplicas": 1,
    "startCommand": "cd backend && node services/bounty-hunter-api.js",
    "healthcheckPath": "/health",
    "sleepApplication": false,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

### railway.toml (Alternative)

Advanced configuration with environment-specific settings:

```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm install && cd backend && npm install"

[deploy]
startCommand = "cd backend && node services/bounty-hunter-api.js"
healthcheckPath = "/health"
restartPolicyType = "ON_FAILURE"
```

## API Endpoints

The deployed backend provides these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check endpoint |
| `/api/bounty-hunter/status` | GET | Get agent status and stats |
| `/api/bounty-hunter/logs` | GET | Get recent completion logs |
| `/api/bounty-hunter/answers` | GET | Get generated answers |
| `/` | GET | API documentation |

## Local Testing

Before deploying, test the backend locally:

```bash
# Install dependencies
npm install
cd backend && npm install

# Create required directories
mkdir -p backend/data/bounty-logs
mkdir -p backend/data/bounty-answers

# Start the API server
cd backend
node services/bounty-hunter-api.js
```

Test the endpoints:

```bash
# Health check
curl http://localhost:3000/health

# Status check
curl http://localhost:3000/api/bounty-hunter/status

# API documentation
curl http://localhost:3000/
```

## Frontend Configuration

The bountyHunter.html frontend automatically connects to the configured backend URL:

1. **Backend URL Field**: Enter your Railway deployment URL
2. **Auto-Detection**: Frontend tries localhost:3000 as fallback
3. **CORS Support**: Backend configured to accept requests from all origins
4. **Status Monitoring**: Real-time backend status display

## Environment Variables

Railway automatically provides:

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (production/staging)

Optional variables you can add in Railway dashboard:

- `LOG_LEVEL`: Logging verbosity (info/debug/error)
- `ENABLE_MONITORING`: Enable monitoring features (true/false)
- `CORS_ORIGINS`: Restrict CORS origins (default: all allowed)

## Troubleshooting

### Deployment Fails

1. Check Railway build logs
2. Verify Node.js version (must be 16+)
3. Ensure all dependencies are in package.json
4. Test locally first

### Health Check Fails

1. Verify `/health` endpoint responds
2. Check Railway logs for errors
3. Ensure server starts within timeout (100s)
4. Verify PORT environment variable is used

### Frontend Can't Connect

1. Check Railway URL is correct
2. Verify CORS is enabled in backend
3. Check browser console for errors
4. Test API endpoints directly with curl

### Backend Not Starting

1. Review Railway logs: `railway logs`
2. Check backend/package.json scripts
3. Verify required directories exist
4. Test startup command locally

## Security Considerations

1. **CORS**: Currently allows all origins for ease of use
2. **API Keys**: No authentication required for public endpoints
3. **Rate Limiting**: Not currently implemented
4. **HTTPS**: Automatically provided by Railway

For production use, consider adding:
- Authentication/API keys
- Rate limiting
- Restricted CORS origins
- Request validation

## Monitoring

Railway provides built-in monitoring:

1. **Metrics**: CPU, memory, network usage
2. **Logs**: Real-time application logs
3. **Health Checks**: Automatic restart on failure
4. **Alerts**: Configure notifications

Access monitoring from Railway dashboard or CLI:

```bash
railway logs --follow
railway status
```

## Cost

Railway offers:
- **Free Tier**: $5 worth of usage per month
- **Hobby Plan**: $5/month for more resources
- **Pro Plan**: $20/month for production apps

Bounty Hunter API is lightweight and should fit within free tier limits.

## Support

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Repository Issues**: https://github.com/barbrickdesign/barbrickdesign.github.io/issues
- **Email**: BarbrickDesign@gmail.com

## Related Documentation

- [BOUNTY_HUNTER_README.md](./BOUNTY_HUNTER_README.md) - Main documentation
- [BOUNTY_HUNTER_QUICKSTART.md](./BOUNTY_HUNTER_QUICKSTART.md) - Quick start guide
- [backend/services/README.md](./backend/services/README.md) - Backend services overview

## Version History

- **v1.0.0** (2026-02-19): Initial Railway deployment configuration
  - Basic API endpoints
  - Health check monitoring
  - Auto-restart on failure
  - Multi-region support (us-west2)
