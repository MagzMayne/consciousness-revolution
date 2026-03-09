# Nixpacks Build Fix - Ruby Version Detection

## Issue
Nixpacks build was failing in the `us-west1` region with the error:
```
Error: Please specify ruby's version in .ruby-version file
```

## Root Cause
The `.ruby-version` file contained a trailing newline character, which caused Nixpacks to fail when parsing the Ruby version during language detection. Even though the project is configured to use only Node.js for deployment (via `nixpacks.toml`), Nixpacks still detects Ruby files (Gemfile, Gemfile.lock) during its initial language detection phase and requires a valid `.ruby-version` file.

## Solution
Removed the trailing newline from the `.ruby-version` file to ensure it contains exactly "3.1.4" without any extra whitespace.

### Changes Made
1. **`.ruby-version`** - Removed trailing newline (file now contains exactly 5 bytes: "3.1.4")
2. **`nixpacks.toml`** - Updated comments to clarify that Ruby files are present but not used in the build

### File Format
The `.ruby-version` file must contain only the version number with no trailing newline:
```
3.1.4
```

Hexdump verification:
```
00000000  33 2e 31 2e 34                                    |3.1.4|
00000005
```

## Why Ruby Files Exist
The Ruby/Jekyll files (Gemfile, Gemfile.lock, .ruby-version) are used for local development and GitHub Pages static site generation. They are not used in Railway deployment, which only runs the Node.js backend.

## Configuration
- **Railway/Nixpacks**: Uses Node.js 16.x only (configured in `nixpacks.toml`)
- **GitHub Pages**: Uses Jekyll with Ruby 3.1.4 for static site generation
- **Backend**: Node.js application running on Railway

## Testing
To verify the fix works:
1. Trigger a Railway deployment in the `us-west1` region
2. Verify that the build completes successfully
3. Check that the Node.js application starts correctly

## References
- Nixpacks Documentation: https://nixpacks.com/docs
- Railway Configuration: `nixpacks.toml`, `railway.toml`, `railway.json`
- Issue: Nixpacks build failed with Ruby version error
