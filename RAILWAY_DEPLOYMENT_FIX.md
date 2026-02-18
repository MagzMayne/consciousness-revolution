# Railway Deployment Fix - February 18, 2026

## Problem Summary

Railway deployment was failing with the error:
```
error: undefined variable 'npm' in nixpacks…  
nix-env did not complete successfully
```

This was caused by:
1. Invalid package names in `nixpacks.toml` (`nodejs-18_x` instead of `nodejs`)
2. Unsupported configuration sections in both config files
3. Railway/Nixpacks generating broken Nix expressions due to incorrect syntax

## Solution Implemented

### 1. Fixed `nixpacks.toml`

**Before (BROKEN):**
```toml
[phases.setup]
nixPkgs = ["nodejs-18_x", "npm"]  # ❌ INVALID package names

[phases.build]
cmds = ["npm run build || echo 'No build step required'"]

[variables]
NODE_ENV = "production"  # ❌ NOT SUPPORTED by Nixpacks
```

**After (FIXED):**
```toml
[phases.setup]
nixPkgs = ["nodejs", "npm"]  # ✅ Correct nixpkgs names

[phases.install]
cmds = ["npm ci --legacy-peer-deps || npm install --legacy-peer-deps"]

[start]
cmd = "npm start"
```

### 2. Fixed `railway.toml`

**Before (BROKEN):**
```toml
[build.nixpacksPlan]  # ❌ NOT SUPPORTED by Railway
providers = ["node"]
```

**After (FIXED):**
```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm ci --legacy-peer-deps || npm install --legacy-peer-deps"

[start]
cmd = "npm start"
```

## Key Changes

1. **nixpacks.toml**:
   - Changed `nodejs-18_x` → `nodejs` (correct nixpkgs name)
   - Removed unsupported `[variables]` section
   - Removed unnecessary `[phases.build]` section
   - Kept essential `[phases.install]` for dependencies

2. **railway.toml**:
   - Removed unsupported `[build.nixpacksPlan]` section
   - Added explicit `buildCommand` for clarity
   - Simplified configuration to essential settings only

## Why This Fixes The Issue

1. **Correct Package Names**: Nixpacks uses standard `nodejs` and `npm` packages from nixpkgs
2. **Minimal Configuration**: Only includes essential phases (setup, install, start)
3. **Explicit Build Command**: Railway knows exactly how to install dependencies
4. **Valid Nixpacks Syntax**: All configuration follows Nixpacks documentation

## What Railway Will Do Now

1. **Detection**: Detects Node.js project (via `package.json`)
2. **Builder**: Uses Nixpacks as specified in `railway.toml`
3. **Setup Phase**: Installs `nodejs` and `npm` from nixpkgs
4. **Install Phase**: Runs `npm ci --legacy-peer-deps || npm install --legacy-peer-deps`
5. **Start Phase**: Runs `npm start` which executes `node start-banksky.js`
6. **Server**: Serves the site on the PORT environment variable (set by Railway)

## Verification Steps

### Check Railway Build Logs

Should now see:
- ✅ Detected Node.js project
- ✅ Using Nixpacks builder
- ✅ Installing nodejs and npm
- ✅ Running npm install
- ✅ Starting application with npm start

Should NOT see:
- ❌ error: undefined variable 'npm'
- ❌ nix-env did not complete successfully
- ❌ Railpack detected Ruby

## Summary

The fix was simple but critical:
1. Use correct nixpkgs names: `nodejs` and `npm` (not `nodejs-18_x`)
2. Remove unsupported configuration sections
3. Use minimal, explicit configuration
4. Ensure Railway knows this is a Node.js project, not Ruby
