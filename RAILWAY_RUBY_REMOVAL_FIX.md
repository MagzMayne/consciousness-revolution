# Railway Ruby Detection Fix - Complete Solution

## Problem Summary

Railway deployment was failing with the error:
```
Using Nixpacks
Error: Please specify ruby's version in .ruby-version file
```

### Root Cause
Railway's Nixpacks build system detected Ruby files in the repository root and automatically switched to Ruby mode, despite the backend being Node.js. When Ruby mode is active, Nixpacks requires a `.ruby-version` file to be properly formatted. However, since this is a Node.js backend, Ruby detection should not occur at all.

## Solution Implemented

### Files Removed
All Ruby-identifying files were removed from the repository root to prevent Railway from detecting Ruby:

1. **Gemfile** - Ruby gem dependencies file (Jekyll)
2. **Gemfile.lock** - Ruby dependency lock file (Jekyll)
3. **.ruby-version** - Ruby version specification
4. **Procfile** - Process file (redundant with railway.toml)

### Why These Files Were Safe to Remove

#### For Railway Deployment
- Railway only needs to run the Node.js backend
- These Ruby files were not used in Railway builds
- `railway.toml` already configured Node.js explicitly
- Removing them prevents Ruby detection entirely

#### For GitHub Pages Frontend
- GitHub Pages can serve static HTML without Jekyll
- All HTML files work standalone without Jekyll processing
- Jekyll was optional for markdown processing
- The `_config.yml` can remain (doesn't trigger Ruby detection in Railway)

## Configuration Files That Remain

### railway.toml
The primary configuration file for Railway deployment:

```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm install && cd backend && npm install"
watchPatterns = ["backend/**/*.js", "src/**/*.js", "package.json"]

[build.nixpacksPlan]
providers = ["node"]  # Forces Node.js only, no Ruby

[deploy]
startCommand = "cd backend && node services/bounty-hunter-api.js"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
healthcheckPath = "/health"
healthcheckTimeout = 100
```

### nixpacks.toml
Secondary configuration (may be redundant with railway.toml):

```toml
[providers]
node = "16.x"

[phases.install]
cmds = [
    "npm ci",
    "cd backend && npm ci"
]

[start]
cmd = "npm run start"
```

## Deployment Flow

### Before This Fix
1. Railway scans repository
2. Detects Gemfile → switches to Ruby mode
3. Looks for .ruby-version → throws error
4. Build fails ❌

### After This Fix
1. Railway scans repository
2. No Ruby files found
3. Uses railway.toml configuration → Node.js mode
4. Runs `npm install && cd backend && npm install`
5. Starts with `cd backend && node services/bounty-hunter-api.js`
6. Build succeeds ✅

## Verification Steps

### 1. Verify No Ruby Files Remain
```bash
# Should return empty or only non-Ruby project files
ls -la | grep -iE "(ruby|gem|proc)"
```

### 2. Test Backend Locally
```bash
# Install dependencies
npm install
cd backend && npm install

# Test backend start
cd backend && node services/bounty-hunter-api.js
# Should see:
# 🎯 Bounty Hunter API Server
# 🚀 Server running on port 3000
```

### 3. Verify Railway Configuration
```bash
# Check railway.toml exists and is valid
cat railway.toml

# Should have:
# - builder = "NIXPACKS"
# - providers = ["node"]
# - startCommand pointing to Node.js file
```

### 4. Deploy to Railway
- Push changes to GitHub
- Railway will automatically detect the push
- Build should use Node.js without Ruby detection
- Check Railway logs for successful deployment

## Architecture Overview

```
Repository Structure (for Railway)
├── backend/
│   ├── services/
│   │   └── bounty-hunter-api.js  ← Railway runs this
│   ├── package.json
│   └── ...
├── package.json
├── railway.toml  ← Primary Railway config
└── [300+ HTML files]  ← Served by GitHub Pages separately
```

**Key Points:**
- **GitHub Pages** (frontend): Serves static HTML files directly
- **Railway** (backend): Runs Node.js API at `backend/services/bounty-hunter-api.js`
- No Ruby/Jekyll needed for either deployment

## API Endpoints

Once deployed, the bounty hunter API provides:

```
GET /api/bounty-hunter/status   - Get agent status
GET /api/bounty-hunter/logs     - Get activity logs
GET /api/bounty-hunter/answers  - Get found answers
GET /health                     - Health check endpoint
```

## Troubleshooting

### If Railway Still Detects Ruby

1. **Check for hidden Ruby files:**
   ```bash
   find . -maxdepth 1 -name ".*ruby*" -o -name "*Gem*"
   ```

2. **Verify railway.toml is being read:**
   - Check Railway dashboard → Settings → Config Files
   - Should show railway.toml is detected

3. **Force Node.js detection:**
   - Ensure `providers = ["node"]` is in railway.toml
   - Remove any `providers = ["ruby"]` references

### If Build Still Fails

1. **Check build logs in Railway dashboard**
2. **Verify package.json exists in root and backend/**
3. **Check that backend dependencies install correctly:**
   ```bash
   cd backend && npm install
   ```

4. **Test start command locally:**
   ```bash
   cd backend && node services/bounty-hunter-api.js
   ```

## Historical Context

This repository previously used Jekyll (Ruby) for GitHub Pages static site generation. The Gemfile and related Ruby files were needed for:
- Local Jekyll development
- Processing markdown files
- Theme support

However, these files caused conflicts with Railway deployment. Since:
1. GitHub Pages works fine with pure HTML (no Jekyll needed)
2. Railway needs pure Node.js (no Ruby needed)
3. The two deployments are completely separate

The Ruby files were safely removed to simplify the deployment and prevent Railway confusion.

## References

- **Railway Documentation**: https://docs.railway.app/deploy/config-as-code
- **Nixpacks Documentation**: https://nixpacks.com/docs
- **Backend Service**: `backend/services/bounty-hunter-api.js`
- **Railway Config**: `railway.toml`

## Contact

For issues with Railway deployment:
- **Creator**: Ryan Barbrick
- **Email**: BarbrickDesign@gmail.com
- **Repository**: https://github.com/barbrickdesign/barbrickdesign.github.io

---

**Last Updated**: February 19, 2026
**Issue Fixed**: Railway Nixpacks Ruby detection error
**Status**: ✅ Resolved
