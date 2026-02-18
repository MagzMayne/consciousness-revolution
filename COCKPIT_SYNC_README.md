# Ryan and Agent R Cockpit Synchronization

## Overview

Ryan Barbrick and Agent R are the same person. This document explains how the system keeps their two cockpits synchronized.

## Problem Solved

Previously, the system treated "Ryan", "Agent R", and "Commander" as separate entities. This caused:
- Duplicate entries in team rosters
- Disconnected cockpit experiences
- No data synchronization between workspaces
- Confusion about identity and authority levels

## Solution Implemented

### 1. Identity Normalization (`src/utils/agent-name-normalizer.js`)

All variations of the name now map to the canonical name "ryan":

```javascript
const AGENT_ALIASES = {
    'agent r': 'ryan',
    'agent-r': 'ryan',
    'agentr': 'ryan',
    'agent_r': 'ryan',
    'barbrick': 'ryan',
    'barbrickdesign': 'ryan',
    'commander': 'ryan',
    'darrick': 'ryan'
};
```

### 2. Manifest Configuration (`agent-r-manifest.json`)

The Agent R manifest now includes:

```json
{
  "identity": {
    "name": "Agent R",
    "realName": "Ryan Barbrick",
    "aliases": ["Agent R", "Agent-R", "AgentR", "Ryan", "Ryan Barbrick", "Commander", "Darrick", "Barbrick", "BarbrickDesign"],
    "cockpits": [
      "OPERATOR_COCKPIT_AGENT_R.html",
      "COMMANDER_COCKPIT.html"
    ],
    "identityNote": "Ryan Barbrick and Agent R are the same person. All systems should recognize these identities as equivalent and sync data between associated cockpits."
  }
}
```

### 3. Cockpit DNA Blocks

Both cockpits now have identity sync configuration:

**COMMANDER_COCKPIT.html:**
```json
{
  "name": "Commander Cockpit",
  "owner": "Commander (Ryan Barbrick / Agent R)",
  "realName": "Ryan Barbrick",
  "identitySync": {
    "enabled": true,
    "syncWith": "OPERATOR_COCKPIT_AGENT_R.html",
    "note": "Commander and Agent R are the same person (Ryan Barbrick)"
  }
}
```

**OPERATOR_COCKPIT_AGENT_R.html:**
```json
{
  "name": "Agent R's Cockpit",
  "owner": "Agent R (Ryan Barbrick)",
  "realName": "Ryan Barbrick",
  "identitySync": {
    "enabled": true,
    "syncWith": "COMMANDER_COCKPIT.html",
    "note": "Agent R and Commander are the same person (Ryan Barbrick)"
  }
}
```

### 4. GemBot Sync Manager (`gembot-sync-manager.js`)

Added cockpit synchronization support:

- `syncCockpitIdentity()`: Detects user identity and initiates sync
- `handleCockpitSync()`: Processes sync messages from other cockpits
- Cockpit-sync message type in WebSocket handler

### 5. Cockpit Identity Sync Script (`js/cockpit-identity-sync.js`)

Dedicated synchronization script that:

1. **Auto-detects** which cockpit is running
2. **Normalizes** user identity using agent-name-normalizer
3. **Syncs data** every 5 seconds between cockpits via localStorage
4. **Handles cross-tab sync** via localStorage events
5. **Integrates** with GemBot sync for real-time WebSocket sync
6. **Updates UI** status indicators to show sync status

## How It Works

### On Page Load

1. Cockpit detects its identity from URL/DNA block
2. Extracts user identity from DNA configuration
3. Uses agent-name-normalizer to get canonical name (always "ryan")
4. Starts sync loop that updates localStorage every 5 seconds

### During Operation

1. **Local Sync**: Updates `cockpit_data_<COCKPIT_ID>` in localStorage
2. **Cross-Tab Sync**: Listens for localStorage changes from other tabs
3. **WebSocket Sync**: If available, uses GemBot sync for real-time updates
4. **Latest-Write-Wins**: Resolves conflicts by using most recent timestamp

### Data Synchronized

```javascript
{
  cockpitId: "COMMANDER_COCKPIT",
  userId: "Commander",
  canonicalName: "ryan",
  timestamp: 1708281425000,
  url: "https://consciousnessrevolution.io/COMMANDER_COCKPIT.html",
  lastActive: 1708281425000
}
```

## Testing

Run the test suite to verify all components:

```bash
node test-cockpit-sync.js
```

Expected output:
- ✓ All alias mappings present
- ✓ Manifest configuration correct
- ✓ Both cockpits have DNA sync config
- ✓ Both cockpits load sync script
- ✓ GemBot sync has cockpit methods
- ✓ Cockpit sync script exists with all methods

## Usage

### Checking Sync Status

In browser console on either cockpit:

```javascript
// Get sync status
window.cockpitIdentitySync.getStatus();

// Returns:
// {
//   cockpitId: "COMMANDER_COCKPIT",
//   userId: "Commander",
//   canonicalName: "ryan",
//   isActive: true,
//   lastSyncTime: 1708281425000
// }
```

### Manual Sync Trigger

```javascript
// Force sync
window.cockpitIdentitySync.syncData();
```

### Check Identity Normalization

```javascript
// Test identity normalization
window.agentNameNormalizer.getCanonicalName('agent r');     // Returns: 'ryan'
window.agentNameNormalizer.getCanonicalName('commander');   // Returns: 'ryan'
window.agentNameNormalizer.getCanonicalName('barbrick');    // Returns: 'ryan'
```

## Benefits

1. **Single Identity**: System recognizes Ryan, Agent R, and Commander as one person
2. **Data Consistency**: Changes in one cockpit reflect in the other
3. **Cross-Tab Sync**: Works across multiple browser tabs
4. **Real-Time Updates**: WebSocket support for instant sync
5. **Offline Support**: LocalStorage fallback when offline
6. **No Conflicts**: Latest-write-wins strategy prevents data conflicts

## Files Modified

- `src/utils/agent-name-normalizer.js` - Added alias mappings
- `agent-r-manifest.json` - Added identity configuration
- `COMMANDER_COCKPIT.html` - Added DNA sync config and script
- `OPERATOR_COCKPIT_AGENT_R.html` - Added DNA sync config and script
- `gembot-sync-manager.js` - Added cockpit sync methods
- `js/cockpit-identity-sync.js` - NEW: Dedicated sync script
- `test-cockpit-sync.js` - NEW: Test suite

## Future Enhancements

- Bi-directional data sync (not just status)
- Sync preferences and settings
- Sync active tasks and projects
- Sync notification states
- Multi-device sync (mobile, desktop)
- Conflict resolution UI for manual override

## Support

For issues or questions, contact:
- **Email**: BarbrickDesign@gmail.com
- **GitHub**: @barbrickdesign

---

**Last Updated**: 2026-02-18
**Version**: 1.0.0
**Status**: ACTIVE
