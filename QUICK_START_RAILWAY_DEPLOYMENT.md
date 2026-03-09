# Quick Start: Railway Deployment

> **⚠️ IMPORTANT**: If Railway UI shows `npm run start` for build/start commands, see [RAILWAY_CONFIG_FIX.md](RAILWAY_CONFIG_FIX.md) for the fix!

## ✅ Prerequisites Fixed
- ✅ Ruby files removed (no longer triggers Ruby detection)
- ✅ `railway.toml` configured for Node.js
- ✅ Backend service ready at `backend/services/bounty-hunter-api.js`
- ✅ Correct build/start commands configured in railway.toml and nixpacks.toml

## 🚀 Deploy to Railway

### Option 1: Automatic Deployment (Recommended)
1. Push changes to GitHub (already done)
2. Railway will auto-detect the push
3. Build will start automatically using Node.js
4. Check Railway dashboard for deployment status

### Option 2: Manual Deployment
```bash
# If you have Railway CLI installed
railway up
```

## 📊 Monitor Deployment

### Check Build Logs
1. Go to Railway dashboard: https://railway.app/dashboard
2. Select your project
3. Click on "Deployments"
4. View build logs - should see:
   - ✅ "Detected Node.js"
   - ✅ "Installing dependencies"
   - ✅ "Starting: cd backend && node services/bounty-hunter-api.js"

### Expected Build Output
```
==> Detecting provider
==> Node.js detected
==> Installing dependencies
npm ci
cd backend && npm ci
==> Starting application
cd backend && node services/bounty-hunter-api.js

🎯 Bounty Hunter API Server
🚀 Server running on port 3000
```

## ✅ Verify Deployment

### Check API Endpoints
Once deployed, test these endpoints (replace with your Railway URL):

```bash
# Health check
curl https://your-app.railway.app/health

# Get bounty hunter status
curl https://your-app.railway.app/api/bounty-hunter/status

# Get logs
curl https://your-app.railway.app/api/bounty-hunter/logs
```

### Expected Response (Health)
```json
{
  "status": "healthy",
  "service": "bounty-hunter-api",
  "timestamp": "2026-02-19T05:41:31.249Z"
}
```

## 🔧 Configuration Details

### Railway Environment Variables
Set these in Railway dashboard → Variables:

```env
NODE_ENV=production
PORT=3000  # Railway provides this automatically
```

### Start Command (from railway.toml)
```bash
cd backend && node services/bounty-hunter-api.js
```

## 🐛 Troubleshooting

### "Ruby detected" Error
**Should NOT happen anymore** - All Ruby files removed.
If you still see this:
1. Verify no `Gemfile`, `.ruby-version`, or `Procfile` exist
2. Check Railway logs for exact error
3. See `RAILWAY_RUBY_REMOVAL_FIX.md` for detailed troubleshooting

### Build Fails
```bash
# Check logs in Railway dashboard
# Common fixes:

# 1. Dependencies issue
npm install
cd backend && npm install

# 2. Start command issue
# Verify in railway.toml:
startCommand = "cd backend && node services/bounty-hunter-api.js"

# 3. Port issue
# Railway provides PORT env variable automatically
```

### API Returns 404
- Check Railway deployment logs
- Verify service started successfully
- Check Railway-provided domain in dashboard

## 📞 Need Help?

- **Documentation**: See `RAILWAY_RUBY_REMOVAL_FIX.md` for detailed guide
- **Contact**: BarbrickDesign@gmail.com
- **Repository**: https://github.com/barbrickdesign/barbrickdesign.github.io

---

**Status**: ✅ Ready to deploy
**Last Updated**: February 19, 2026
