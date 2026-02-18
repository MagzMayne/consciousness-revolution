# Railway Deployment Verification Checklist

Use this checklist to verify the Railway deployment is working after the fix.

## Pre-Deployment Verification ✅

- [x] `nixpacks.toml` uses correct package names (`nodejs` and `npm`)
- [x] `railway.toml` has valid configuration (no unsupported sections)
- [x] `package.json` has `"start": "node start-banksky.js"` script
- [x] `start-banksky.js` exists and uses `process.env.PORT`
- [x] `.railwayignore` prevents Ruby file detection
- [x] All changes committed and pushed to repository

## Railway Build Verification

After pushing to Railway, check the build logs for:

### ✅ Success Indicators

- [ ] "Detected Node.js project" (not Ruby)
- [ ] "Using Nixpacks builder"
- [ ] "Installing nodejs and npm" (no errors)
- [ ] "Running npm install" completes successfully
- [ ] "Starting application with npm start"
- [ ] "Web server started on http://localhost:[PORT]"
- [ ] Build completes without errors
- [ ] Deployment succeeds

### ❌ Error Indicators (Should NOT See)

- [ ] "error: undefined variable 'npm'"
- [ ] "nix-env did not complete successfully"
- [ ] "Railpack detected Ruby"
- [ ] "No start command was found"
- [ ] "Cannot find module 'express'" (dependency issue)

## Post-Deployment Testing

Once deployed, test the following:

### Basic Functionality

- [ ] Railway provides a public URL
- [ ] URL loads without errors (200 status)
- [ ] Main page (index.html) displays correctly
- [ ] Static assets load (CSS, JS, images)
- [ ] Navigation works between pages
- [ ] No console errors in browser

### Server Functionality

- [ ] Server responds to requests
- [ ] Correct Content-Type headers
- [ ] CORS headers (if needed)
- [ ] Error pages work (404, etc.)
- [ ] Server doesn't crash under load

## Troubleshooting

If deployment fails, check:

1. **Build Logs** - Railway dashboard → Deployments → Click latest → View logs
2. **Configuration** - Verify nixpacks.toml and railway.toml are correct
3. **Dependencies** - Ensure package.json has all required packages
4. **Start Script** - Test locally with `npm start`
5. **Environment Variables** - Check Railway environment variables

## Local Testing

Test the configuration locally before deploying:

```bash
# Install dependencies
npm install

# Start server (should match Railway behavior)
PORT=8080 npm start

# Test in browser
open http://localhost:8080

# Check for errors
# Should see: ✅ Web server started on http://localhost:8080
```

## Quick Reference

### Railway Dashboard
- URL: https://railway.app/dashboard
- Project: consciousness-revolution
- Service ID: [Your service ID from Railway]

### Key Files
- `nixpacks.toml` - Nixpacks build configuration
- `railway.toml` - Railway deployment configuration
- `package.json` - Node.js project configuration
- `start-banksky.js` - Server entry point
- `.railwayignore` - Ignored files for Railway

### Support
- Documentation: See RAILWAY_DEPLOYMENT_FIX.md
- Railway Docs: https://docs.railway.app
- Nixpacks Docs: https://nixpacks.com/docs
- Contact: BarbrickDesign@gmail.com

## Expected Timeline

- Build time: ~2-5 minutes
- Deployment time: ~1-2 minutes
- Total time: ~3-7 minutes from push to live

## Success Criteria

✅ Deployment is successful when:
1. Build completes without errors
2. Application starts successfully
3. Railway provides a working public URL
4. Site loads and functions correctly
5. No errors in Railway logs
6. Server stays running (doesn't crash)

---

Last Updated: February 18, 2026
Status: Ready for deployment
