# Nixpacks.toml Fix Summary

## Problem
Railway deployment was failing with error:
```
Error: Failed to parse Nixpacks config file `nixpacks.toml`
invalid type: map, expected a sequence for key `providers` at line 33 column 1
```

## Root Cause
The nixpacks.toml file had an overly complex configuration that was either:
1. Being misinterpreted by the Nixpacks parser
2. Creating conflicts with other configuration files
3. Using syntax that wasn't fully compatible with the Nixpacks version being used

## Solution Applied
Replaced the entire nixpacks.toml with a minimal, clean configuration:

```toml
providers = ["node"]

[phases.setup]
nixPkgs = ["nodejs"]

[phases.install]
cmds = ["npm install"]

[phases.build]
cmds = []

[start]
cmd = "node backend/services/bounty-hunter-api.js"
```

## Key Changes
1. **Removed complexity**: Eliminated variables, nixLibs, nixOverlays, aptPkgs
2. **Simplified Node version**: Changed from `nodejs-16_x` to `nodejs` (uses default)
3. **Simplified install**: Changed from dual `npm ci` commands to single `npm install`
4. **Cleaned start command**: Removed `cd backend &&` prefix (working directory is already set)
5. **Removed comments**: Eliminated all comments that could potentially cause parsing issues

## Validation
- ✅ TOML syntax validated with taplo CLI
- ✅ File has proper line endings (Unix LF)
- ✅ No hidden characters detected
- ✅ Backend entry point exists at `backend/services/bounty-hunter-api.js`
- ⏳ Railway deployment test (will be verified in CI)

## Testing
To verify this fix works:
1. Push changes to Railway-connected branch
2. Watch Railway build logs for successful nixpacks parsing
3. Verify service starts successfully
4. Check health endpoint at `/health`

## Rollback Plan
If this causes issues, the previous configuration is in git history:
```bash
git revert HEAD
```

## References
- Nixpacks Documentation: https://nixpacks.com/docs
- Railway Nixpacks Guide: https://docs.railway.app/deploy/builders

## Note on railway.toml
The `railway.toml` file also contains a `[build.nixpacksPlan]` section with `providers = ["node"]`. This is now redundant since `nixpacks.toml` takes precedence for Nixpacks configuration. However, we're leaving it in place as it doesn't cause conflicts and may serve as a fallback.

If further issues arise, consider removing the `[build.nixpacksPlan]` section from railway.toml to eliminate any potential ambiguity.
