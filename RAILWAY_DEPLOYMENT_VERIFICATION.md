# Railway Deployment Verification Checklist

## Pre-Deployment Checklist
- [x] `railway.toml` created in repository root
- [x] Configuration specifies NIXPACKS builder
- [x] Start command uses `npx serve`
- [x] PORT environment variable configured
- [x] Gemfile preserved (needed for GitHub Pages)
- [x] Documentation created (RAILWAY_DEPLOYMENT_FIX.md)
- [x] Changes committed and pushed to repository

## Deployment Steps
1. [ ] Push changes to GitHub repository
2. [ ] Go to Railway dashboard (https://railway.app)
3. [ ] Navigate to your project
4. [ ] Trigger new deployment (or wait for auto-deploy)
5. [ ] Monitor build logs

## Expected Build Log Output
```
✓ Building with NIXPACKS
✓ Installing Node.js
✓ Installing dependencies
✓ Starting service with: npx serve . -p ${PORT}
✓ Deployment successful
```

## What You Should NOT See
```
✗ Detected Ruby (Railpack)
✗ Pruning node dependencies
✗ No start command was found
```

## Post-Deployment Verification

### 1. Check Service Status
- [ ] Service shows as "Active" in Railway dashboard
- [ ] No error messages in logs
- [ ] Build completed successfully

### 2. Test Homepage
- [ ] Visit Railway-provided URL
- [ ] Homepage (index.html) loads correctly
- [ ] No 404 or 500 errors
- [ ] Static assets (CSS, JS, images) load

### 3. Test Multiple Pages
- [ ] Test several HTML pages from the repository
- [ ] Verify navigation works
- [ ] Check that all static resources load
- [ ] Confirm no broken links

### 4. Check Console Logs
- [ ] Open browser developer tools
- [ ] Check console for JavaScript errors
- [ ] Verify no 404 errors for resources
- [ ] Confirm no CORS issues

## Common Issues & Solutions

### Issue: Still seeing Ruby detection
**Solution**: 
- Verify railway.toml is in repository root
- Check file is committed and pushed
- Try triggering a new deployment

### Issue: Port binding error
**Solution**:
- Railway automatically sets PORT environment variable
- The ${PORT:-8080} syntax uses Railway's PORT
- No changes needed - this should work automatically

### Issue: 404 errors for static files
**Solution**:
- Verify files are committed to repository
- Check that files aren't in .gitignore
- Confirm paths are correct (case-sensitive)

### Issue: Build succeeds but site doesn't load
**Solution**:
- Check Railway logs for runtime errors
- Verify serve command is running
- Check network settings in Railway dashboard
- Ensure domain is properly configured

## Success Indicators
✅ Build logs show NIXPACKS (not Railpack)
✅ Service starts without errors
✅ Railway URL is accessible
✅ Homepage loads correctly
✅ All static files are served
✅ No console errors in browser
✅ Navigation between pages works

## Troubleshooting Commands

### Check Railway Logs
```bash
# Install Railway CLI (if not installed)
npm install -g @railway/cli

# Login to Railway
railway login

# View logs
railway logs
```

### Test Locally
```bash
# Test the exact command Railway will use
PORT=8080 npx serve . -p ${PORT}

# Visit http://localhost:8080
```

### Verify Configuration
```bash
# Check railway.toml exists
ls -la railway.toml

# View contents
cat railway.toml

# Verify git status
git status
git log --oneline -3
```

## Need Help?
- **Documentation**: See RAILWAY_DEPLOYMENT_FIX.md
- **Railway Docs**: https://docs.railway.app
- **Contact**: BarbrickDesign@gmail.com

## Rollback Plan
If something goes wrong:

1. **Immediate Fix**: In Railway dashboard, redeploy previous version
2. **Local Fix**: 
   ```bash
   git revert HEAD~2..HEAD
   git push
   ```
3. **Alternative**: Remove railway.toml and Railway will auto-detect Node.js

## Final Notes
- This configuration serves static files only
- No server-side code execution
- All HTML/CSS/JS files are served as-is
- Backend services (if needed) should be separate Railway services
- GitHub Pages deployment is independent and unaffected

---

**Deployment Date**: ___________
**Railway URL**: ___________
**Verified By**: ___________
**Status**: ⬜ Pending | ⬜ Success | ⬜ Issues
