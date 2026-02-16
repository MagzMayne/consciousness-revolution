# PocketLaunch Connection Error Fix

## Issue
The pocketLaunch.html page was displaying a "Connection error" pop-up on load.

## Root Cause
The application was configured to use `peerjs-server.herokuapp.com` as the PeerJS signaling server. This server is no longer available because Heroku discontinued their free tier hosting service.

## Solution
Updated both `pocketLaunch.html` and `pocketLaunchReceiver.html` to use the official PeerJS cloud server:
- **Old server:** `peerjs-server.herokuapp.com`
- **New server:** `0.peerjs.com`

## Technical Details
The PeerJS library is used for WebRTC peer-to-peer connections between the launcher and receiver stations. The signaling server (PeerJS server) is required to establish the initial connection between peers, but the actual data transfer happens peer-to-peer.

### Files Modified
1. `pocketLaunch.html` - Line 1170: Changed PeerJS host configuration
2. `pocketLaunchReceiver.html` - Line 594: Changed PeerJS host configuration

## Testing
After this fix:
- The page should load without connection errors
- The launcher should be able to generate a Launcher ID successfully
- Receivers should be able to connect to the launcher using the Launcher ID
- Rocket launch data should be transmitted between launcher and receiver stations

## Notes
- The official PeerJS cloud server (`0.peerjs.com`) is maintained by the PeerJS project and is the recommended server for production use
- No other functionality was affected by this change
- The fix is backward compatible with existing receiver stations once they are updated
