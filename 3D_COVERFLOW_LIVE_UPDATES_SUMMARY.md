# 3D Coverflow Live Updates Implementation Summary

## Problem
The 3D coverflow gallery at https://barbrickdesign.github.io was not showing newly pushed projects because it was loading from a static `projects.json` file that was 2 days old (last updated: 2025-12-26).

## Root Cause
The `listHtmlFiles()` function prioritized the static `projects.json` file over the live GitHub API, meaning:
- New projects wouldn't appear until `projects.json` was manually regenerated
- Updates were delayed by days or weeks
- Manual maintenance was required

## Solution
Reversed the data source priority to use GitHub API first:
1. **Primary**: GitHub API (live data) ✅
2. **Fallback**: projects.json with hourly cache-busting
3. **Last resort**: localStorage snapshot (offline mode)

## Changes Made

### Code Changes
**File**: `index.html`

**Function**: `listHtmlFiles()` (lines 2483-2530)

**Before**:
```javascript
// Tried projects.json first (static, stale data)
// Fell back to GitHub API
// Fell back to localStorage
```

**After**:
```javascript
// Tries GitHub API first (live data)
// Falls back to projects.json with hourly cache-busting (?v=hourTimestamp)
// Falls back to localStorage (offline)
```

### UI Updates
1. **Main page card**: "near-live updates" + "Updates automatically when new projects are pushed!"
2. **Gallery header**: "Near-live updates • Auto-updates when projects pushed"
3. **Gallery footer**: "Live data from GitHub API"
4. **Status indicators**:
   - Green: "Data: Live from GitHub" (using API)
   - Yellow: "Data: Cached (Dec 26, 2025)" (using projects.json)
   - Yellow: "Data: Offline (localStorage)" (no network)

### Technical Improvements
- ✅ Hourly cache-busting for efficient caching (`?v=hourTimestamp`)
- ✅ Consistent en-US date formatting
- ✅ Console logging shows data source
- ✅ Visual indicators for data freshness
- ✅ Manual refresh button to force reload

## How It Works

### On Page Load
1. Attempts to fetch from GitHub API
2. If successful: Shows ~373 projects (live count)
3. If API fails (rate limit/offline): Falls back to projects.json
4. If projects.json fails: Falls back to localStorage

### When New Project Pushed
1. User pushes new .html file to repo
2. File is immediately available via GitHub API
3. User opens 3D gallery (or clicks refresh)
4. Gallery fetches from GitHub API
5. New project appears immediately ✅

## Benefits

✅ **Near-real-time updates**: Projects appear immediately after push
✅ **No manual maintenance**: No need to regenerate projects.json
✅ **Graceful fallbacks**: Works offline with cached data
✅ **Visual feedback**: Users can see data source and freshness
✅ **Manual control**: Refresh button for latest data
✅ **Efficient caching**: Hourly cache-busting prevents excessive requests

## Testing Instructions

### Test Live Updates
1. Visit https://barbrickdesign.github.io/
2. Click "🎭 3D Gallery" button
3. Open browser console (F12)
4. Look for: `🔄 Loaded X projects from GitHub API (live)`
5. Check footer status: "Data: Live from GitHub" (green)
6. Push a new .html file to repo
7. Click "Refresh" button in gallery
8. Verify new project appears ✅

### Test Fallback Modes
- **Offline**: Enable airplane mode → Status shows "Data: Offline (localStorage)"
- **Rate limited**: Make 60+ API requests → Falls back to "Data: Cached"

## Commits
1. `eeee0a6` - Fix 3D coverflow to prioritize live GitHub API
2. `83cc618` - Address code review feedback (cache-busting + date formatting)

## Files Modified
- `index.html` (55 lines changed, 39 additions, 16 deletions)

## Future Optimizations (Optional)
- Dynamic project count instead of hardcoded "350+"
- ETag/Last-Modified headers for smarter caching
- WebSocket for real-time updates without refresh

## Status
✅ **COMPLETE** - 3D coverflow now updates near-real-time when projects are pushed
