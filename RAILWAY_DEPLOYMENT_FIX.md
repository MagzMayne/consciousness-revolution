# Railway Deployment Fix - Summary

## Latest Update (February 2026)
⚠️ **New Issue**: Nixpacks build was failing with "derivationStrict" error due to multi-language detection.

**✅ Fixed**: See [NIXPACKS_BUILD_FAILURE_FIX.md](./NIXPACKS_BUILD_FAILURE_FIX.md) for complete details.

**Quick Summary**:
- Added Python files to `.railwayignore`
- Optimized `nixpacks.toml` for Node.js-only builds
- Created `.dockerignore` to reduce build context
- Build now succeeds with clean Node.js environment

---

## Original Problem (Ruby Detection)
Railway was detecting this project as a Ruby application due to the presence of `Gemfile` (which is required for GitHub Pages Jekyll rendering). This caused deployment failures with the error:
```
No start command was found
```

## Root Cause
- Railway's Railpack detected Ruby files (Gemfile)
- Railpack expected Ruby server files (Rails, Rack, etc.)
- Project is actually a static frontend site
- No Ruby server exists to run

## Solution
Created `railway.toml` configuration file that explicitly tells Railway:
1. Use NIXPACKS builder (not Railpack)
2. Serve static files using `npx serve`
3. Listen on Railway's PORT environment variable

## Configuration Details

### railway.toml
```toml
[build]
builder = "NIXPACKS"

[start]
cmd = "npx serve . -p ${PORT:-8080}"

[deploy]
numReplicas = 1
sleepApplication = false
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

### Why Gemfile Is Preserved
- Required for GitHub Pages to render Markdown files with Jekyll
- GitHub Pages automatically builds Jekyll sites
- Railway deployment doesn't need Jekyll (serves pre-rendered HTML)
- railway.toml configuration overrides auto-detection

## How It Works
1. Railway reads `railway.toml` first (highest priority)
2. NIXPACKS builder is explicitly selected
3. Node.js environment is configured
4. `npx serve` serves all static files from project root
5. Railway PORT variable is used (defaults to 8080 locally)

## Testing the Fix

### Local Testing
```bash
# Install serve globally (optional)
npm install -g serve

# Test the command locally
npx serve . -p 8080

# Visit http://localhost:8080
```

### Railway Deployment
1. Push changes to repository
2. Railway will detect railway.toml
3. Build process will use NIXPACKS
4. Start command will run `npx serve`
5. Site will be accessible on Railway's provided URL

## Expected Results
✅ Railway uses NIXPACKS (not Railpack)
✅ No Ruby detection errors
✅ Static files served correctly
✅ All HTML pages accessible
✅ No build failures

## Alternative Solutions (Not Implemented)
1. **Remove Gemfile** - Would break GitHub Pages deployment
2. **Add Ruby server** - Unnecessary for static site
3. **Modify package.json** - Would affect local development setup

## Files Changed
- ✅ Created: `railway.toml`
- ⚠️ Not changed: `Gemfile` (required for GitHub Pages)
- ⚠️ Not changed: `package.json` (start script for local dev)

## Contact
For issues or questions:
- Email: BarbrickDesign@gmail.com
- Repository: https://github.com/overkor-tek/consciousness-revolution

## References
- Railway Documentation: https://docs.railway.app/deploy/config-as-code
- NIXPACKS: https://nixpacks.com/
- npx serve: https://www.npmjs.com/package/serve
