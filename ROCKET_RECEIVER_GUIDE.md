# 🚀 Rocket Launch Receiver System Guide

## Overview

The Rocket Launch Receiver System enables multiple users to collaborate on rocket launches with real-time communication, live data sharing, and enhanced trajectory accuracy through triangulation.

## Components

### 1. Launcher Interface (`pocketLaunch.html`)
The main control station for rocket launches. The launcher:
- Plans trajectories
- Executes launches
- Manages connected receivers
- Receives landing accuracy data from multiple receivers
- Uses triangulation to improve predictions

### 2. Receiver Interface (`pocketLaunchReceiver.html`)
Ground tracking stations. Each receiver can:
- Connect to a specific launcher via unique ID
- View real-time launch countdown
- See predicted landing location
- Navigate to landing site
- Record video of landing
- Log landing accuracy data
- Communicate with launcher in real-time

## How to Use

### Setting Up as a Launcher

1. Open `pocketLaunch.html`
2. Go to "Receiver Network" mission from the main menu
3. Copy your Launcher ID
4. Share this ID with your receivers (via text, email, etc.)
5. Proceed with your trajectory planning and launch as normal

### Setting Up as a Receiver

1. Open `pocketLaunchReceiver.html` on your device
2. Get the Launcher ID from the person launching the rocket
3. Enter the Launcher ID in the pairing field
4. Click "CONNECT TO LAUNCHER"
5. Once connected, you'll see all launch panels activate

### During Launch

**Launcher sees:**
- All connected receivers in the sidebar
- Real-time receiver count
- Triangulation status when multiple receivers are active

**Receivers see:**
- Live countdown (T-minus)
- Launch parameters (azimuth, elevation)
- Predicted landing location on map
- Distance to landing site from their position

### At Landing Site

**Receivers should:**
1. Navigate to predicted landing location using the built-in navigation
2. Start video recording when rocket is visible
3. Once rocket is recovered, click "RECORD LANDING ACCURACY"
4. This sends actual landing coordinates back to launcher

**Launcher receives:**
- Landing accuracy data from each receiver
- Triangulated actual landing position (when 2+ receivers report)
- Improved accuracy for future launches

## Features

### Real-Time Communication
- Live chat between launcher and all receivers
- Instant status updates
- Countdown synchronization

### Video Recording
- Receivers can record landing approach
- Automatic file download after recording
- Helps with post-launch analysis

### Data Logging
- All events timestamped and logged
- Export capability for analysis
- Tracks receiver contributions

### Triangulation
When 2 or more receivers record landing accuracy:
- System calculates weighted average of actual landing
- Weights based on each receiver's error (lower error = higher weight)
- Provides uncertainty estimate
- Improves trajectory models for future launches

### Multi-Receiver Support
- No limit on number of receivers
- Each receiver operates independently
- More receivers = better triangulation accuracy
- Live status display for all connections

## Best Practices

### For Launchers
1. Test receiver connections before launch
2. Use "TEST COUNTDOWN" to verify receivers are receiving data
3. Wait for receivers to confirm they're at landing area
4. Share predicted landing coordinates early

### For Receivers
1. Arrive at general landing area before launch
2. Enable location services for accurate positioning
3. Keep device charged (video recording uses battery)
4. Communicate via chat if you see the rocket

### For Teams
1. Position receivers in different locations around predicted landing
2. Space receivers 50-100m apart for best triangulation
3. Designate one person as "primary" recovery
4. Use chat to coordinate when rocket is spotted

## Technical Details

### Connection Method
- Uses PeerJS for WebRTC peer-to-peer connections
- Direct device-to-device communication (no server needed for data)
- Fallback to relay server if direct connection fails
- Unique IDs ensure privacy and security

### Data Shared
- Launch parameters (azimuth, elevation, predicted landing)
- Real-time countdown
- Chat messages
- Landing accuracy measurements
- Receiver locations (for triangulation)

### Privacy
- Each session gets unique random IDs
- No data stored on external servers
- All communication is peer-to-peer
- IDs expire when browser is closed

## Troubleshooting

### "Connection failed" or "Receiver not connecting"
- Check internet connection on both devices
- Verify Launcher ID was copied correctly (case-sensitive)
- Try refreshing both pages and reconnecting
- Check browser supports WebRTC (Chrome, Firefox, Safari, Edge all work)

### "No location available"
- Enable location services in browser
- Grant location permission when prompted
- Try refreshing page if permission was denied

### "Camera not available"
- Grant camera permission when prompted
- Check if another app is using camera
- Try closing other camera apps

### Triangulation not showing
- Need at least 2 receivers to record landing accuracy
- Both receivers must click "RECORD LANDING ACCURACY"
- Ensure receivers are at different positions

## System Requirements

- Modern web browser (Chrome 60+, Firefox 60+, Safari 14+, Edge 79+)
- Internet connection for initial pairing
- Location services enabled
- Camera access (for video recording)

## Future Enhancements

Potential additions:
- GPS-based trajectory tracking during flight
- Accelerometer data logging
- Photo capture at landing
- Historical data analysis
- Team leaderboards
- Weather integration
- Advanced triangulation algorithms

## Support

For issues or questions:
- Check console for error messages (F12 in browser)
- Verify all permissions are granted
- Test with simple 2-person setup first
- Document any errors for troubleshooting
