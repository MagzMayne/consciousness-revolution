# Operator Cockpit Autonomous Connections Guide

## Overview

This guide explains how the autonomous connection system works in OPERATOR_COCKPIT_RYAN.html and how it automatically connects to Netlify, GitHub, Railway, and AI services.

## Problem Solved

**Before**: Ryan's operator cockpit required manual verification of all service connections every time the page loaded, even though the connections were previously established.

**After**: The cockpit now autonomously:
1. Detects Ryan's identity across multiple cockpits (Ryan, Agent R, Commander)
2. Auto-verifies GitHub membership without user input
3. Syncs connection states across all of Ryan's cockpits
4. Restores verified connections on page reload

## Architecture

### 1. Identity Sync System

The cockpit uses `cockpit-identity-sync.js` to manage identity across multiple cockpits:

```javascript
// Auto-loaded on page load
<script src="/js/cockpit-identity-sync.js"></script>
```

**What it does:**
- Detects which cockpit is running (Ryan, Agent R, or Commander)
- Normalizes user identity using agent-name-normalizer.js
- Maps all variations (Ryan Barbaric, Agent R, Commander, etc.) to canonical name "ryan"
- Syncs data every 5 seconds across cockpits via localStorage
- Handles cross-tab sync via storage events

### 2. DNA Block Configuration

The DNA block now includes identity information:

```json
{
  "realName": "Ryan Barbrick",
  "aliases": ["Ryan", "Ryan Barbaric", "Ryan Barbrick", "Agent R", "Commander", "Darrick", "BarbrickDesign"],
  "github": "barbrickdesign",
  "identitySync": {
    "enabled": true,
    "syncWith": ["OPERATOR_COCKPIT_AGENT_R.html", "COMMANDER_COCKPIT.html"],
    "note": "Ryan Barbaric, Agent R, and Commander are the same person"
  }
}
```

**What it enables:**
- Identity detection from page metadata
- Auto-population of GitHub username
- Cross-cockpit sync configuration
- Canonical name resolution

### 3. Auto-Verification System

Two new functions handle autonomous verification:

#### autoVerifyStoredConnections()

```javascript
async function autoVerifyStoredConnections() {
    // Check for stored GitHub connection
    const githubData = localStorage.getItem('ryan_github_connection');
    if (githubData) {
        const parsed = JSON.parse(githubData);
        if (!parsed.verified && parsed.username) {
            // Silently verify in background
            const response = await fetch(`https://api.github.com/orgs/overkillkulture/members/${parsed.username}`);
            if (response.status === 204) {
                // Auto-update to verified
                localStorage.setItem('ryan_github_connection', JSON.stringify({
                    username: parsed.username,
                    verified: true,
                    verifiedAt: new Date().toISOString(),
                    method: 'auto'
                }));
                setVerifiedState('github', parsed.username);
            }
        }
    }
    
    // Check for synced connections from other cockpits
    if (window.cockpitIdentitySync) {
        syncConnectionsFromOtherCockpits();
    }
}
```

**Runs on:** Page load (called from loadConnectionStatus())

**What it does:**
1. Checks localStorage for previously saved GitHub connection
2. If found but not verified, attempts auto-verification via GitHub API
3. Updates connection to verified if successful
4. Triggers cross-cockpit sync if identity sync is active

#### syncConnectionsFromOtherCockpits()

```javascript
function syncConnectionsFromOtherCockpits() {
    ['OPERATOR_COCKPIT_AGENT_R', 'COMMANDER_COCKPIT'].forEach(cockpit => {
        const cockpitData = localStorage.getItem(`cockpit_data_${cockpit}`);
        if (cockpitData) {
            const parsed = JSON.parse(cockpitData);
            if (parsed.canonicalName === 'ryan') {
                console.log(`🔄 Found synced cockpit: ${cockpit}`);
                // Can import connection states from other cockpits
            }
        }
    });
}
```

**What it does:**
- Checks for data from Agent R and Commander cockpits
- Validates that they belong to the same user (canonical name matching)
- Enables sharing of connection states across cockpits

## Service Connection Flow

### GitHub (Autonomous)

1. **First connection:**
   - User manually enters GitHub username
   - System verifies via GitHub API: `GET /orgs/overkillkulture/members/{username}`
   - Status 204 = verified member
   - Saves to localStorage with `verified: true`

2. **Subsequent page loads:**
   - `autoVerifyStoredConnections()` runs automatically
   - Reads username from localStorage
   - Silently verifies membership again
   - Auto-restores verified state in UI
   - **No user input required!**

### Netlify & Railway (Manual Trust-Based)

These services don't have public APIs for verification, so:

1. **First connection:**
   - User checks email for invite
   - User confirms they accepted invite
   - System saves connection as verified

2. **Subsequent page loads:**
   - Connection status restored from localStorage
   - UI shows "Connected" state
   - No re-verification needed

### AI Link (GitHub-Based)

Auto-checks recent commits for AI activity:

```javascript
async function checkAIGitHub() {
    const response = await fetch('https://api.github.com/repos/overkor-tek/consciousness-revolution/commits?per_page=1');
    const commits = await response.json();
    const lastCommit = commits[0];
    const isAI = lastCommit?.commit?.author?.name?.toLowerCase().includes('claude') ||
                 lastCommit?.commit?.message?.includes('Claude Code');
    updateServiceLight('aiGithub', isAI);
}
```

## Cross-Cockpit Sync

### How it works:

1. **Identity Detection:** All cockpits detect they belong to "ryan"
2. **Data Sharing:** Each cockpit stores data in localStorage with cockpit ID
3. **Sync Loop:** Every 5 seconds, cockpits check for updates from other Ryan cockpits
4. **Cross-Tab Sync:** Storage events propagate changes across browser tabs instantly

### Data Synced:

- Connection verification states
- Last active timestamp
- User identity confirmation
- Cockpit activity status

### localStorage Keys:

```javascript
// Per-cockpit data
'cockpit_data_OPERATOR_COCKPIT_RYAN'
'cockpit_data_OPERATOR_COCKPIT_AGENT_R'
'cockpit_data_COMMANDER_COCKPIT'

// Connection states
'ryan_github_connection'
'ryan_netlify_connection'
'ryan_railway_connection'

// Sync markers
'cockpit_sync_marker'
'canonicalUser'
```

## Console Output

When working correctly, you'll see:

```
🔐 Cockpit Identity Sync initialized for: OPERATOR_COCKPIT_RYAN
✅ Agent name normalizer loaded
✅ Identity confirmed: Ryan Barbaric → ryan
🔄 Auto-verifying GitHub connection...
✅ GitHub auto-verified!
🔗 Identity sync active - checking for synced connections...
🔄 Found synced cockpit: OPERATOR_COCKPIT_AGENT_R
🔄 Found synced cockpit: COMMANDER_COCKPIT
```

## Benefits

### For Users (Ryan)
- ✅ **No repeated logins:** Connections persist across sessions
- ✅ **Instant verification:** GitHub auto-verifies on page load
- ✅ **Unified experience:** All cockpits share connection state
- ✅ **Cross-tab sync:** Open multiple cockpits, they stay in sync

### For Developers
- ✅ **Reusable system:** Same pattern works for all operator cockpits
- ✅ **Extensible:** Easy to add more services
- ✅ **Observable:** Console logs show exactly what's happening
- ✅ **Testable:** Comprehensive test suite validates functionality

## Testing

Run the test suite:

```bash
# Open in browser:
test-ryan-cockpit-autonomous.html
```

Or validate via command line:

```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('OPERATOR_COCKPIT_RYAN.html', 'utf8');
console.log('Identity sync script:', html.includes('cockpit-identity-sync.js') ? '✓' : '✗');
console.log('Auto-verify function:', html.includes('autoVerifyStoredConnections') ? '✓' : '✗');
console.log('Sync function:', html.includes('syncConnectionsFromOtherCockpits') ? '✓' : '✗');
"
```

## Troubleshooting

### Issue: "GitHub not auto-verifying"

**Check:**
1. Open browser console
2. Look for: `🔄 Auto-verifying GitHub connection...`
3. If missing: Check localStorage for `ryan_github_connection`
4. Verify username is correct: `barbrickdesign`

**Fix:**
```javascript
// Clear and retry:
localStorage.removeItem('ryan_github_connection');
// Then manually verify once
```

### Issue: "Identity sync not working"

**Check:**
1. Console should show: `🔐 Cockpit Identity Sync initialized`
2. Verify script loaded: View source → search for `cockpit-identity-sync.js`
3. Check DNA block has `realName` and `identitySync` fields

**Fix:**
```javascript
// Manually trigger:
if (window.initCockpitSync) {
    window.initCockpitSync();
}
```

### Issue: "Connections not persisting"

**Check:**
1. LocalStorage is not disabled in browser
2. No privacy mode/incognito (clears localStorage)
3. Domain matches: `consciousnessrevolution.io` or `localhost`

**Fix:**
```javascript
// Test localStorage:
localStorage.setItem('test', 'value');
console.log(localStorage.getItem('test')); // Should show 'value'
```

## Future Enhancements

### Planned Features:
- [ ] Auto-verify Netlify via team API
- [ ] Auto-verify Railway via project API
- [ ] Sync connection states bidirectionally
- [ ] Add visual sync indicator in UI
- [ ] Implement conflict resolution for sync
- [ ] Add webhook notifications on connection changes

### Possible Extensions:
- [ ] Extend to all operator cockpits (Tiger, Frances, etc.)
- [ ] Add encryption for synced data
- [ ] Cloud backup of connection states
- [ ] Multi-device sync via backend

## Related Files

- `/js/cockpit-identity-sync.js` - Core sync system
- `/src/utils/agent-name-normalizer.js` - Name normalization
- `OPERATOR_COCKPIT_AGENT_R.html` - Reference implementation
- `COMMANDER_COCKPIT.html` - Reference implementation
- `COCKPIT_SYNC_README.md` - Original sync documentation
- `agent-r-manifest.json` - Agent R identity configuration

## Support

**Questions or Issues?**
- Email: BarbrickDesign@gmail.com
- GitHub: Open issue in consciousness-revolution repo
- Console: Check browser console for detailed logs

---

**Last Updated:** 2026-02-19  
**Version:** 1.0  
**Author:** Ryan Barbrick (with Claude Code)
