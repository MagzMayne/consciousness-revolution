# Railway Configuration Fix Guide

## Problem

The Railway UI is showing **incorrect** build and start commands:
- ❌ **Build Command**: `npm run start`
- ❌ **Start Command**: `npm run start`

This causes deployment failures because `npm run start` runs the local development server (`start-banksky.js`), which is not suitable for Railway production deployment.

## Solution

Railway should use the configuration from `railway.toml` and `nixpacks.toml` files, which have the **correct** commands.

### Correct Commands

✅ **Build Command**: `npm install && cd backend && npm install`
- Installs dependencies for both root and backend directories
- Prepares the application for deployment

✅ **Start Command**: `cd backend && node services/bounty-hunter-api.js`
- Starts the Bounty Hunter API service
- Runs on port provided by Railway (process.env.PORT)
- Exposes /health endpoint for health checks

## How to Fix in Railway UI

### Option 1: Let Railway Auto-Detect (Recommended)

1. **Remove Custom Commands** in Railway UI:
   - Go to Railway Dashboard → Your Service → Settings
   - Under "Build", find "Custom Build Command"
   - **Clear/Delete** the custom build command field (remove `npm run start`)
   - Under "Deploy", find "Custom Start Command"  
   - **Clear/Delete** the custom start command field (remove `npm run start`)

2. **Save Changes**

3. **Redeploy**:
   - Railway will now use the configuration from `railway.toml` and `nixpacks.toml`
   - Build command: `npm install && cd backend && npm install`
   - Start command: `cd backend && node services/bounty-hunter-api.js`

### Option 2: Set Correct Commands Manually

If you need to set custom commands in the Railway UI:

1. **Set Build Command**:
   ```bash
   npm install && cd backend && npm install
   ```

2. **Set Start Command**:
   ```bash
   cd backend && node services/bounty-hunter-api.js
   ```

3. **Set Builder** (if asked):
   - Builder: `NIXPACKS`

4. **Set Watch Paths** (optional):
   ```
   backend/**/*.js
   src/**/*.js
   package.json
   ```

## Configuration Files

The repository already has the correct configuration in these files:

### railway.toml

```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm install && cd backend && npm install"
watchPatterns = ["backend/**/*.js", "src/**/*.js", "package.json"]

[deploy]
startCommand = "cd backend && node services/bounty-hunter-api.js"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
healthcheckPath = "/health"
healthcheckTimeout = 100
```

### nixpacks.toml

```toml
[variables]
NODE_ENV = "production"
NPM_CONFIG_PRODUCTION = "false"

[providers]
node = "16.x"

[phases.setup]
nixPkgs = ["nodejs-16_x"]

[phases.install]
cmds = [
    "npm ci",
    "cd backend && npm ci"
]

[phases.build]
cmds = [
    "echo 'Build phase - installing dependencies'"
]

[start]
cmd = "cd backend && node services/bounty-hunter-api.js"
```

## Verification

After fixing the configuration, verify the deployment:

1. **Check Build Logs** in Railway Dashboard:
   - Should show: "Detected Node.js"
   - Should show: "Installing dependencies"
   - Should NOT show errors about Ruby or Jekyll

2. **Check Deployment Logs**:
   - Should show: "🎯 Bounty Hunter API Server"
   - Should show: "🚀 Server running on port [PORT]"

3. **Test Health Endpoint**:
   ```bash
   curl https://your-app.railway.app/health
   ```
   
   Expected response:
   ```json
   {
     "status": "ok",
     "service": "bounty-hunter-api",
     "timestamp": "2026-02-19T06:00:00.000Z"
   }
   ```

4. **Test API Endpoints**:
   ```bash
   # Get bounty hunter status
   curl https://your-app.railway.app/api/bounty-hunter/status
   
   # Get logs
   curl https://your-app.railway.app/api/bounty-hunter/logs
   ```

## Environment Variables

Ensure these environment variables are set in Railway:

### Required Variables

```env
NODE_ENV=production
PORT=3000  # Railway provides this automatically
LOG_LEVEL=info
ENABLE_MONITORING=true
AUTO_HEALING_ENABLED=true
```

### Optional (if needed)

```env
CORS_ORIGINS=https://barbrickdesign.github.io
RAILWAY_API_KEY=your-railway-api-key
```

## Common Issues

### Issue 1: "npm run start" Still Showing

**Problem**: Railway UI still shows `npm run start` after fixing

**Solution**: 
1. Clear browser cache
2. Hard refresh the page (Ctrl+F5)
3. Log out and log back into Railway
4. Redeploy the service

### Issue 2: Build Fails with Ruby/Jekyll Errors

**Problem**: Railway tries to detect Ruby/Jekyll

**Solution**: 
- All Ruby files have been removed
- `nixpacks.toml` explicitly sets Node.js as the only provider
- If issue persists, check Railway build logs for any remaining Ruby files

### Issue 3: Service Crashes on Start

**Problem**: Service starts but immediately crashes

**Solution**:
1. Check logs: `railway logs --service bounty-hunter-api`
2. Verify backend directory exists and has correct structure
3. Verify node_modules are installed
4. Check if PORT environment variable is being used correctly

### Issue 4: Health Check Fails

**Problem**: Railway shows "Health check failed"

**Solution**:
1. Verify `/health` endpoint exists in bounty-hunter-api.js (it does)
2. Verify healthcheckTimeout is sufficient (100s should be enough)
3. Check if service binds to `0.0.0.0` not just `localhost`

## Scripts Reference

### Root package.json Scripts

```json
{
  "start": "node start-banksky.js",           // Local dev only
  "dev": "node start-banksky.js --dev",       // Local dev only
  "backend": "cd backend && npm run dev",     // Local dev only
  "deploy:railway": "node deploy-railway.js", // Deploy helper
  "test": "node test-banksky.js"              // Tests
}
```

### Backend package.json Scripts

```json
{
  "start": "node deploy-services.js",         // Local deploy
  "dev": "node start-local.js",               // Local dev
  "bounty-hunter:api": "node services/bounty-hunter-api.js"  // Production service
}
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              Railway Production Environment             │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │                                                   │ │
│  │  Build Phase:                                     │ │
│  │  1. npm install (root)                            │ │
│  │  2. cd backend && npm install                     │ │
│  │  3. Prepare application                           │ │
│  │                                                   │ │
│  └───────────────┬───────────────────────────────────┘ │
│                  │                                       │
│                  ▼                                       │
│  ┌───────────────────────────────────────────────────┐ │
│  │                                                   │ │
│  │  Start Phase:                                     │ │
│  │  cd backend && node services/bounty-hunter-api.js│ │
│  │                                                   │ │
│  │  Starts:                                          │ │
│  │  - Express server on process.env.PORT            │ │
│  │  - /health endpoint                              │ │
│  │  - /api/bounty-hunter/* endpoints                │ │
│  │                                                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Support

For Railway deployment issues:

- **Railway Documentation**: https://docs.railway.app
- **Project Issues**: https://github.com/barbrickdesign/barbrickdesign.github.io/issues
- **Contact**: BarbrickDesign@gmail.com

## Summary

✅ **Do**: Use railway.toml and nixpacks.toml configuration (auto-detected)
✅ **Do**: Clear custom build/start commands in Railway UI
✅ **Do**: Set environment variables in Railway dashboard
✅ **Do**: Monitor build and deployment logs

❌ **Don't**: Set build command to `npm run start`
❌ **Don't**: Set start command to `npm run start`
❌ **Don't**: Use `node start-banksky.js` for production
❌ **Don't**: Add Ruby/Jekyll files to repository

---

**Status**: ✅ Configuration files updated and ready
**Last Updated**: February 19, 2026
**Version**: 1.0.0
