# Railway Configuration Fix - Quick Reference

> **🚨 IMPORTANT**: If Railway UI shows `npm run start` for build/start commands, see below for the fix!

## The Problem

Railway deployment fails because UI shows incorrect commands:
- ❌ Build Command: `npm run start`
- ❌ Start Command: `npm run start`

## The Fix (2 Steps)

### Step 1: Clear Custom Commands in Railway UI

1. Go to **Railway Dashboard** → Your Service → **Settings**
2. Under **Build** section:
   - Find "Custom Build Command"
   - **Delete/Clear** the field (remove `npm run start`)
3. Under **Deploy** section:
   - Find "Custom Start Command"
   - **Delete/Clear** the field (remove `npm run start`)
4. Click **Save Changes**

### Step 2: Redeploy

Click **Deploy** or push to GitHub to trigger new deployment.

Railway will now use the correct configuration from config files.

## Expected Result

After fix, Railway should use:
- ✅ Build: `npm install && cd backend && npm install`
- ✅ Start: `cd backend && node services/bounty-hunter-api.js`

## Verify It Works

```bash
# Test health endpoint (replace with your Railway URL)
curl https://your-app.railway.app/health

# Should return:
{
  "status": "ok",
  "service": "bounty-hunter-api",
  "timestamp": "2026-02-19T06:00:00.000Z"
}
```

## Why This Happened

- `npm run start` runs `start-banksky.js` → Local dev server with multiple services
- Railway needs single production service → `bounty-hunter-api.js`
- Someone manually set custom commands in Railway UI (overrides config files)
- Clearing custom commands lets Railway use correct config from files

## Configuration Files (All Correct ✅)

The repository already has correct configuration:

| File | Build Command | Start Command | Status |
|------|--------------|---------------|--------|
| `railway.toml` | `npm install && cd backend && npm install` | `cd backend && node services/bounty-hunter-api.js` | ✅ Correct |
| `railway.json` | `npm install && cd backend && npm install` | `cd backend && node services/bounty-hunter-api.js` | ✅ Correct |
| `nixpacks.toml` | Auto (in install phase) | `cd backend && node services/bounty-hunter-api.js` | ✅ Correct |

## Verification

Run automated verification:
```bash
./verify-railway-config-detailed.sh
```

Expected output:
```
✓ railway.toml build command correct
✓ railway.toml start command correct
✓ railway.json build command correct
✓ railway.json start command correct
✓ nixpacks.toml start command correct
✓ Health endpoint exists
✓ Uses Railway PORT variable
✓ No Procfile
✓ No Ruby files
✓ package.json scripts correct

All checks passed: 10/10 ✅
```

## Documentation

| Document | Purpose | Size |
|----------|---------|------|
| **[RAILWAY_CONFIG_FIX.md](RAILWAY_CONFIG_FIX.md)** | Detailed troubleshooting guide | 8.3KB |
| **[RAILWAY_CONFIG_IMPLEMENTATION_SUMMARY.md](RAILWAY_CONFIG_IMPLEMENTATION_SUMMARY.md)** | Complete implementation details | 9.1KB |
| **[QUICK_START_RAILWAY_DEPLOYMENT.md](QUICK_START_RAILWAY_DEPLOYMENT.md)** | Quick start guide | 4.7KB |
| **[RAILWAY_DEPLOYMENT_GUIDE.md](RAILWAY_DEPLOYMENT_GUIDE.md)** | Full deployment manual | 18.5KB |

## Need Help?

1. **Quick Fix**: See [RAILWAY_CONFIG_FIX.md](RAILWAY_CONFIG_FIX.md)
2. **Implementation Details**: See [RAILWAY_CONFIG_IMPLEMENTATION_SUMMARY.md](RAILWAY_CONFIG_IMPLEMENTATION_SUMMARY.md)
3. **Full Guide**: See [RAILWAY_DEPLOYMENT_GUIDE.md](RAILWAY_DEPLOYMENT_GUIDE.md)
4. **Contact**: BarbrickDesign@gmail.com

## Common Issues

### Still shows `npm run start` after clearing
- Clear browser cache
- Hard refresh (Ctrl+F5)
- Log out and log back into Railway
- Redeploy service

### Build fails
- Check Railway build logs
- Verify Node.js detected (not Ruby)
- Check environment variables set

### Service crashes
- Check Railway deployment logs
- Verify health endpoint responds
- Check service binds to `0.0.0.0`

## Status

✅ Configuration files: Correct and verified  
✅ Documentation: Complete (4 files, 22.6KB)  
✅ Verification script: All checks passing  
✅ Ready for deployment

---

**Last Updated**: February 19, 2026  
**Version**: 1.0.0  
**Status**: Complete ✅
