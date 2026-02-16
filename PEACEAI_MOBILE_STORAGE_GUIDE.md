# PeaceAI Mobile Device Local Storage Guide

## Overview

PeaceAI now includes a comprehensive local storage system that enables mobile devices to function as secondary security layers for video feed monitoring. This system allows for offline operation, automatic session restoration, and seamless reconnection when connectivity is restored.

## Key Features

### 1. Mobile Device Registration
Every device that accesses PeaceAI is automatically registered with a unique device ID:
- **Automatic Detection**: System detects mobile vs desktop devices
- **Unique ID Generation**: Each device gets a persistent unique identifier
- **Device Info Tracking**: Stores user agent, platform, screen dimensions
- **Persistent Storage**: Device ID survives browser restarts

### 2. Offline Operation
The system caches critical security data for offline access:
- **Device List Caching**: Last known camera feeds and devices
- **Alert Configuration**: Security contact information and policies
- **User Profile**: Authentication state (24-hour expiry)
- **Event History**: Last 100 security events
- **Monitoring State**: Active feed and monitoring configuration

### 3. Automatic Session Restoration
When a page is reloaded or a mobile device reconnects:
- **User Profile Restore**: Automatic sign-in from cached credentials
- **Feed Selection Restore**: Last selected camera feed is remembered
- **Monitoring Resume**: Active monitoring sessions automatically restart
- **Alert Config Restore**: Security settings are preserved

### 4. Visual Indicators
The interface provides clear status information:
- **Mobile Device Badge**: Shows when running on mobile device (📱 Active)
- **Offline Mode Indicator**: Yellow pill showing "Offline Mode - Using Cached Data"
- **Last Sync Time**: Displays when data was last synchronized
- **Connection Status**: Automatic detection and notification

## How It Works

### Storage Architecture

The `PeaceAIStorage` object manages all local storage operations:

```javascript
PeaceAIStorage.KEYS = {
  USER_PROFILE: 'peaceai_user_profile',
  DEVICE_LIST: 'peaceai_device_list',
  SELECTED_FEED: 'peaceai_selected_feed',
  MONITORING_STATE: 'peaceai_monitoring_state',
  ALERT_CONFIG: 'peaceai_alert_config',
  LAST_SYNC: 'peaceai_last_sync',
  MOBILE_DEVICE_ID: 'peaceai_mobile_device_id',
  SESSION_TOKEN: 'peaceai_session_token',
  CACHED_EVENTS: 'peaceai_cached_events',
  OFFLINE_MODE: 'peaceai_offline_mode'
}
```

### Data Expiration

Different types of data have different expiration times:
- **User Profile**: 24 hours
- **Monitoring State**: 1 hour
- **Device List**: No expiration (refreshed on each sync)
- **Alert Config**: No expiration (refreshed on each sync)
- **Cached Events**: Last 100 events retained

### Automatic Reconnection

The system checks for backend connectivity every 30 seconds:
- Pings `/api/devices` endpoint
- When connection restored, automatically:
  - Disables offline mode
  - Syncs device list
  - Updates cached data
  - Shows success notification

## Usage Scenarios

### Scenario 1: Mobile Security Guard
**Use Case**: Security guard uses phone to monitor church cameras while walking rounds

**Flow**:
1. Guard signs in on mobile device
2. Selects camera feed to monitor
3. Phone goes to sleep or loses WiFi temporarily
4. When phone wakes up, page reloads automatically
5. Local storage restores session and monitoring state
6. Guard continues monitoring without re-authenticating

### Scenario 2: Offline Church Building
**Use Case**: Church network goes down but monitoring must continue

**Flow**:
1. System detects backend unavailable
2. Switches to offline mode automatically
3. Shows cached device list with "Offline Mode" indicator
4. Previously selected feed remains accessible
5. Alert configuration still available for reference
6. System automatically reconnects when network restored

### Scenario 3: Multi-Device Monitoring
**Use Case**: Steward monitors from both desktop and mobile

**Flow**:
1. Steward configures alerts on desktop
2. Alert settings cached to local storage
3. Steward opens PeaceAI on mobile device
4. Mobile device loads its own device list
5. Steward selects mobile camera view
6. Both devices maintain independent monitoring states

## API Reference

### Storage Methods

#### `PeaceAIStorage.saveUserProfile(profile)`
Saves user profile to local storage with 24-hour expiry.

**Parameters**:
- `profile` (Object): User profile object with name, email, googleId, role

**Returns**: `true` on success, `false` on failure

**Example**:
```javascript
PeaceAIStorage.saveUserProfile({
  name: 'Church Steward',
  email: 'steward@example.com',
  googleId: 'google-id-123',
  role: 'steward'
});
```

#### `PeaceAIStorage.loadUserProfile()`
Loads user profile from local storage if not expired.

**Returns**: User profile object or `null` if not found/expired

#### `PeaceAIStorage.saveDeviceList(devices)`
Caches the device list for offline access.

**Parameters**:
- `devices` (Array): Array of device objects with id, name, zone, status

#### `PeaceAIStorage.loadDeviceList()`
Retrieves cached device list.

**Returns**: Array of device objects or `null`

#### `PeaceAIStorage.saveMonitoringState(feedId, state)`
Saves active monitoring session state (1-hour expiry).

**Parameters**:
- `feedId` (String): ID of the feed being monitored
- `state` (Object): Additional state information

#### `PeaceAIStorage.loadMonitoringState()`
Loads monitoring state if not expired.

**Returns**: Monitoring state object or `null`

#### `PeaceAIStorage.registerMobileDevice()`
Registers the current device as a mobile security device.

**Returns**: Device info object with deviceId, userAgent, platform, etc.

#### `PeaceAIStorage.cacheEvent(event)`
Caches a security event (keeps last 100).

**Parameters**:
- `event` (Object): Event object with type, details, severity, timestamp

#### `PeaceAIStorage.getStorageStats()`
Returns storage usage statistics.

**Returns**: Object with storage size information

## Console Logging

The system provides detailed console logs for debugging:

```
📱 PeaceAI Mobile Security Layer initialized
💾 Local storage available: true
✅ User profile saved to local storage
✅ Device list saved (3 devices)
✅ Monitoring state saved: camera-main-entrance
📱 Monitoring state saved for mobile device restoration
🔄 Offline mode: ENABLED
✅ Backend connection restored
```

## Storage Statistics

View storage usage in browser console:

```javascript
PeaceAIStorage.getStorageStats()
```

Example output:
```
💾 Local Storage Statistics:
   Total Size: 12.45 KB (0.01 MB)
   Items:
   - USER_PROFILE: 0.5 KB
   - DEVICE_LIST: 2.3 KB
   - CACHED_EVENTS: 8.1 KB
   - MOBILE_DEVICE_ID: 0.03 KB
   - MONITORING_STATE: 0.4 KB
```

## Browser Compatibility

The local storage system works in all modern browsers:
- ✅ Chrome/Edge (desktop and mobile)
- ✅ Firefox (desktop and mobile)
- ✅ Safari (desktop and mobile iOS)
- ✅ Opera
- ⚠️ Private/Incognito mode (limited - storage cleared on close)

## Security Considerations

### Data Security
- **No Sensitive Video Data**: Only metadata is cached, not video streams
- **Profile Expiration**: User profiles expire after 24 hours
- **Session Timeout**: Monitoring state expires after 1 hour
- **No Password Storage**: Only authentication tokens, never passwords

### Storage Limits
- Browser storage typically allows 5-10 MB per domain
- System keeps only last 100 events to manage size
- Storage stats available for monitoring usage

### Privacy
- Each device maintains its own storage
- No cross-device data sharing via local storage
- Clear all data via `PeaceAIStorage.clearAll()`

## Troubleshooting

### Storage Not Working
**Symptom**: Data not persisting across page loads

**Solutions**:
1. Check browser console for storage errors
2. Verify browser not in private/incognito mode
3. Check browser storage settings (not disabled)
4. Try clearing storage: `PeaceAIStorage.clearAll()`

### Session Not Restoring
**Symptom**: Must sign in again after page reload

**Solutions**:
1. Check if user profile expired (24-hour limit)
2. Verify local storage is enabled
3. Check console for restoration errors
4. Try manual sign-in to refresh profile

### Offline Mode Not Activating
**Symptom**: Page shows errors instead of using cached data

**Solutions**:
1. Verify device list was cached while online
2. Check that you signed in before going offline
3. Refresh page after backend disconnects
4. Check console for cache availability

### Storage Full
**Symptom**: Cannot save new data

**Solutions**:
1. Check storage stats: `PeaceAIStorage.getStorageStats()`
2. Clear old data: `PeaceAIStorage.clearAll()`
3. Clear browser cache and cookies
4. Event cache auto-limits to 100 entries

## Testing the Feature

### Test 1: Basic Storage
1. Open PeaceAI in browser
2. Sign in with demo account
3. Open browser DevTools → Console
4. Check for: `✅ User profile saved to local storage`
5. Reload page
6. Verify: `✅ User profile restored from local storage`

### Test 2: Offline Mode
1. Sign in and view device list
2. Stop backend server (simulate network failure)
3. Reload page
4. Should see: "📱 Offline Mode - Using cached data"
5. Cached device list should display
6. Restart backend server
7. After 30 seconds, should reconnect automatically

### Test 3: Session Restoration
1. Sign in and select a camera feed
2. Click "Start Monitoring"
3. Reload page (simulate mobile app restart)
4. After 1 second, monitoring should auto-resume
5. Video feed should reconnect to same camera

### Test 4: Mobile Device Detection
1. Open page on mobile device (or use browser mobile emulation)
2. Check console for: `📱 Device type: Mobile`
3. Verify mobile device badge appears in stats panel
4. Check unique device ID is generated

## Export and Backup

Export all local storage data for backup:

```javascript
const backup = PeaceAIStorage.exportData();
console.log(JSON.stringify(backup, null, 2));
```

## Clear All Data

To reset all PeaceAI local storage:

```javascript
PeaceAIStorage.clearAll();
```

## Support

For issues or questions:
- **Email**: BarbrickDesign@gmail.com
- **Repository**: https://github.com/barbrickdesign/barbrickdesign.github.io
- **Issue Tracker**: Open a GitHub issue with [PeaceAI Mobile Storage] tag

## Version History

### v1.0.0 (2025-01-25)
- Initial release
- Mobile device registration
- Offline mode support
- Automatic session restoration
- Event caching
- Visual status indicators
- Auto-reconnection system

---

**Created by**: Ryan Barbrick, BarbrickDesign  
**License**: MIT  
**Last Updated**: January 25, 2025
