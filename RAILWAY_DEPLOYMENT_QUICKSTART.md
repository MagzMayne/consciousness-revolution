# Railway Deployment Quick Start

## Prerequisites

- Railway account and CLI installed
- Repository pushed to GitHub
- Railway project created

## Quick Verification

Run the verification script to ensure everything is configured correctly:

```bash
./verify-railway-config.sh
```

Expected output: `✓ All checks passed!`

## Local Testing

Test the build process locally before deploying:

```bash
# Install dependencies
npm install
cd backend && npm install && cd ..

# Build the project
npm run build

# Test start command (will start all services)
npm run start

# Or test individual service
cd backend && node services/bounty-hunter-api.js
```

## Deploy to Railway

### Option 1: Railway CLI

```bash
# Login to Railway
railway login

# Link to your project (first time only)
railway link

# Deploy
railway up

# Check status
railway status

# View logs
railway logs

# View environment variables
railway variables
```

### Option 2: GitHub Integration

1. Go to Railway dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose `barbrickdesign/barbrickdesign.github.io`
5. Railway will automatically detect configuration and deploy

## Configuration Files

The following files configure the Railway build:

- **nixpacks.toml**: Main configuration - forces Node.js only
- **.nixpacks/plan.json**: Explicit build plan - skips language detection
- **railway.json**: Railway service configuration
- **railway.toml**: Railway deployment configuration
- **Procfile**: Process definition (web service)

## How It Works

1. Railway reads `nixpacks.toml` and `.nixpacks/plan.json`
2. Build system uses Node.js 16.x ONLY (Ruby is skipped)
3. Runs `npm ci` to install dependencies
4. Runs `npm run build` to build the project
5. Starts service with `npm run start`

## Expected Build Log

```
↳ Detected Node.js (from nixpacks.toml)
↳ Using Node.js 16.x

Packages
──────────
node  │  16.20.2  │  package.json > engines > node (>=16.0.0)

Steps
──────────
▸ install
$ npm ci
$ cd backend && npm ci

▸ build
$ npm run build

Deploy
──────────
$ npm run start
```

Note: Ruby should NOT appear in the build log.

## Troubleshooting

### Ruby Still Detected

If Railway still detects Ruby:
1. Verify nixpacks.toml is at repository root
2. Verify .nixpacks/plan.json exists
3. Check Railway dashboard settings
4. Try clearing Railway cache: `railway down && railway up`

### Build Fails

```bash
# Check build logs
railway logs --deployment

# Check service status
railway status

# Verify configuration locally
./verify-railway-config.sh
```

### Service Won't Start

Check the start command in package.json:
```json
"scripts": {
  "start": "node start-banksky.js"
}
```

Verify the service is configured to use PORT environment variable:
```javascript
const PORT = process.env.PORT || 3000;
```

## Environment Variables

Railway will automatically set:
- `PORT`: Port to listen on
- `NODE_ENV`: Set to "production"

You can add custom variables in Railway dashboard:
- Settings → Variables

## Health Check

Railway will check `/health` endpoint:
- URL: `https://your-service.railway.app/health`
- Interval: 300 seconds
- Timeout: 100 seconds

Ensure your service responds to `/health`:
```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

## Multiple Services

This repository has multiple backend services. To deploy multiple services:

1. Create separate Railway services for each
2. Update railway.json with service-specific configuration
3. Each service gets its own URL

Example services:
- bounty-hunter-api
- email-service
- kas-service
- grid-control-api

## Useful Commands

```bash
# Check Railway CLI version
railway version

# Update Railway CLI
npm install -g @railway/cli

# View all projects
railway list

# Switch project
railway link [project-id]

# Open in browser
railway open

# Delete deployment
railway down

# Environment info
railway environment

# Service info
railway service
```

## Support

- **Documentation**: This file and RAILWAY_BUILD_FIX_COMPLETE.md
- **Railway Docs**: https://docs.railway.app
- **Nixpacks Docs**: https://nixpacks.com
- **Contact**: BarbrickDesign@gmail.com

## Success Indicators

Your deployment succeeded if you see:

1. ✅ Build completes without errors
2. ✅ "Ruby" does not appear in build logs
3. ✅ Service starts and listens on PORT
4. ✅ Health check endpoint responds
5. ✅ Railway dashboard shows "Active" status

## Next Steps

After successful deployment:
1. Test the deployed service URL
2. Verify API endpoints work
3. Check logs for any runtime errors
4. Monitor performance metrics
5. Set up custom domain (optional)
