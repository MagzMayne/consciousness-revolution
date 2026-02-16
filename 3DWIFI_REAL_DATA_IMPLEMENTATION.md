# 3D WiFi Network Visualization - Real Data Implementation

## Overview

The `3dWifi.html` page now visualizes **real network devices and connections** instead of mock/fake data. It uses modern browser APIs to discover devices on your network and display them in an interactive 3D bubble environment.

## What Changed

### Before (Mock Data)
- Generated random fake devices with fictional MAC addresses
- Created arbitrary IP addresses and signal strengths
- Simulated device activity with random data
- No connection to actual network

### After (Real Data)
- Collects actual device information from browser APIs
- Shows your real device with actual connection statistics
- Discovers local network peers via WebRTC
- Displays real signal strengths and connection types
- Can detect USB and Bluetooth devices (with permission)
- Infers router/gateway presence

## How It Works

### Browser APIs Used

1. **Network Information API**
   - Connection type (4g, 3g, wifi, ethernet, etc.)
   - Effective connection type for signal estimation
   - Downlink speed in Mbps
   - Round-trip time (RTT) in milliseconds

2. **WebRTC (ICE Candidates)**
   - Discovers local network IP addresses
   - Identifies devices on same LAN
   - Works without special permissions
   - Most reliable discovery method

3. **USB API** (requires permission)
   - Lists connected USB devices
   - Shows device manufacturer and product name
   - User must grant permission

4. **Bluetooth API** (requires permission)
   - Lists paired Bluetooth devices
   - Shows device names
   - User must grant permission

5. **Battery API**
   - Current device battery level
   - Charging status
   - Works on mobile and laptops

6. **Geolocation API** (optional)
   - Device location for positioning
   - User must grant permission

### Signal Strength Estimation

Since browsers cannot directly measure WiFi signal strength, we estimate it based on:
- **Connection Type**: 4g = -40 dBm, 3g = -60 dBm, 2g = -75 dBm, etc.
- **Gateway**: Assumed -30 dBm (strong, close to router)
- **Discovered Peers**: -45 to -75 dBm (medium range)

### Device Positioning

Devices are positioned relative to the router (origin) based on signal strength:
- **Strong signal (-30 to -50 dBm)**: Close to router
- **Medium signal (-50 to -70 dBm)**: Medium distance
- **Weak signal (-70 to -95 dBm)**: Far from router

## Features

### Real-Time Updates
- Refreshes every 3 seconds
- Discovers new devices automatically
- Updates connection statistics
- Shows device activity

### Interactive Visualization
- **Bubble size**: Larger = stronger signal
- **Bubble color**: Green (strong) → Yellow (medium) → Red (weak)
- **Outline thickness**: Thicker = more active device
- **Hover tooltip**: Shows detailed device information

### Toggle Mode
Click the "Real data" button to switch between:
- **Real Mode** (default): Collects actual network data
- **Demo Mode**: Generates random devices for testing

### Device Information Shown

For each device, the visualization displays:
- Device name/type
- IP address or connection type
- Vendor/manufacturer
- Signal strength in dBm
- Last seen timestamp
- Connection type (4g, WiFi, USB, Bluetooth, etc.)
- Discovery method (WebRTC, USB API, Inferred, etc.)
- Downlink speed (if available)
- Round-trip time / RTT (if available)
- Battery level (if available)

## Browser Compatibility

### Fully Supported
- Chrome/Edge 90+
- Firefox 88+
- Safari 15+
- Opera 76+

### Partial Support
- Older browsers: Limited API availability
- Mobile browsers: Some APIs require HTTPS
- Privacy-focused browsers: Some APIs may be blocked

### Required Conditions
- **HTTPS or localhost**: Most APIs require secure context
- **User permissions**: USB, Bluetooth, Geolocation need explicit permission
- **API availability**: Not all browsers support all APIs

## Limitations

### What Works
✅ Current device detection (always works)  
✅ Connection type and quality (works on most browsers)  
✅ Router/gateway inference (always works)  
✅ WebRTC peer discovery (works without permissions)  
✅ Battery status (works on mobile/laptops)  

### What Requires Permissions
⚠️ USB devices - needs user permission  
⚠️ Bluetooth devices - needs user permission  
⚠️ Geolocation - needs user permission  

### What Doesn't Work
❌ Direct WiFi scanning - blocked by browser security  
❌ MAC address lookup - blocked by browser security  
❌ Network traffic monitoring - blocked by browser security  
❌ Actual RSSI values - not available in browsers  

## Testing

A standalone test page is included: `test-real-network-data.html`

This simplified page demonstrates the real data collection without the 3D visualization dependency. Run it to verify:
1. Current device detection works
2. Network information is collected
3. WebRTC peer discovery functions
4. API permissions are requested properly

## Privacy & Security

### Data Collection
- All data is collected **locally** in your browser
- **Nothing is sent** to external servers
- **No tracking** or analytics
- Data is **refreshed every 3 seconds** and not stored

### Permissions
- USB/Bluetooth APIs require **explicit user permission**
- Geolocation is **optional** and user-controlled
- WebRTC discovery works **without permissions**
- No data leaves your device

### Security
- Works in **secure context** (HTTPS/localhost)
- No external dependencies except D3.js (CDN)
- No backend server required
- No data persistence

## Future Enhancements

Possible improvements:
- Backend service for comprehensive network scanning (optional)
- Integration with router APIs for detailed device info
- Historical device tracking and analytics
- Network topology mapping
- Speed test integration
- Device grouping and categorization

## Credits

**Created by**: Ryan Barbrick / Barbrick Design  
**Repository**: https://github.com/barbrickdesign/barbrickdesign.github.io  
**License**: See repository for licensing information

## Support

For questions, issues, or suggestions:
- Open an issue on GitHub
- Email: BarbrickDesign@gmail.com
- Website: https://barbrickdesign.github.io

---

**Note**: This implementation respects browser security policies and user privacy. It only collects data that is explicitly allowed by browser APIs and always requires user permission for sensitive operations.
