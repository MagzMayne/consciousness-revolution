# Wake on Lab - Enhanced Wake on LAN System

## Overview

The Wake on Lab system is an enhanced Wake on LAN (WOL) implementation that adds advanced capabilities for remote device management, AI script injection, power line communication, and device monitoring.

## Features

### 1. Traditional Wake on LAN
- Send magic packets to wake devices on the network
- Support for custom broadcast IP addresses and ports
- MAC address validation

### 2. AI Script Injection
- Automatically inject AI scripts into devices upon wake-up
- AI scripts provide:
  - Heartbeat/status reporting
  - Command reception capabilities
  - System monitoring

### 3. Device Acknowledgment
- Devices send acknowledgment signals after successful wake-up
- Confirmation that the device is online and responsive
- Status tracking (waking → online)

### 4. Power Line Communication (PLC)
- Simulate command transmission over power lines
- Modulation frequency: 125kHz (typical PLC frequency)
- Signal strength monitoring
- Bidirectional communication between devices

### 5. Device Heartbeat Monitoring
- Real-time device status checking
- Last heartbeat timestamp tracking
- Online/offline status detection
- AI script activity monitoring

## Architecture

```
┌─────────────────┐
│  Frontend UI    │
│  (aiGridLink)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  WOL Client     │
│ (wake-on-lan.js)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend API    │
│ (wake-on-lan.js)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  UDP Broadcast  │
│  (Magic Packet) │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Target Device  │
│  (Computer)     │
└─────────────────┘
```

## API Endpoints

### POST /wake
Wake a device and optionally inject AI script.

**Request:**
```json
{
  "macAddress": "AA:BB:CC:DD:EE:FF",
  "ipAddress": "255.255.255.255",
  "port": 9,
  "injectAI": true,
  "waitForAck": true,
  "deviceId": "device-123"
}
```

**Response:**
```json
{
  "success": true,
  "macAddress": "AA:BB:CC:DD:EE:FF",
  "ipAddress": "255.255.255.255",
  "port": 9,
  "timestamp": "2026-01-21T06:08:14.057Z",
  "aiInjected": true,
  "acknowledged": false,
  "acknowledgmentPending": true,
  "aiScript": {
    "deployed": true,
    "scriptVersion": "1.0.0",
    "capabilities": ["heartbeat", "command-receiver", "status-reporter"]
  }
}
```

### POST /plc-command
Send command to device via power line communication.

**Request:**
```json
{
  "deviceId": "device-123",
  "macAddress": "AA:BB:CC:DD:EE:FF",
  "command": {
    "type": "status",
    "data": {}
  }
}
```

**Response:**
```json
{
  "success": true,
  "deviceId": "device-123",
  "macAddress": "AA:BB:CC:DD:EE:FF",
  "command": "status",
  "transmitted": true,
  "modulationFrequency": "125kHz",
  "signalStrength": "strong",
  "timestamp": "2026-01-21T06:08:14.057Z"
}
```

### GET /device-heartbeat/:deviceId
Check device heartbeat and status.

**Response:**
```json
{
  "online": true,
  "deviceId": "device-123",
  "macAddress": "AA:BB:CC:DD:EE:FF",
  "lastHeartbeat": "2026-01-21T06:08:14.057Z",
  "status": "online",
  "aiScriptActive": true,
  "secondsSinceLastHeartbeat": 5
}
```

### POST /device-checkin
Device check-in endpoint (for devices to report status).

**Request:**
```json
{
  "deviceId": "device-123",
  "macAddress": "AA:BB:CC:DD:EE:FF",
  "status": "online",
  "aiScriptVersion": "1.0.0"
}
```

**Response:**
```json
{
  "success": true,
  "deviceId": "device-123",
  "timestamp": "2026-01-21T06:08:14.057Z",
  "pendingCommands": []
}
```

## Client Usage

### Basic Wake on LAN

```javascript
const wolClient = new WakeOnLANClient('http://localhost:3010');

// Add a device
wolClient.addDevice({
  name: 'My Computer',
  macAddress: 'AA:BB:CC:DD:EE:FF',
  ipAddress: '255.255.255.255',
  port: 9
});

// Wake the device
const result = await wolClient.wakeDevice(deviceId);
```

### Wake with AI Injection

```javascript
// Wake device with AI script injection and wait for acknowledgment
const result = await wolClient.wakeDevice(deviceId, {
  injectAI: true,
  waitForAck: true
});

if (result.success && result.aiInjected) {
  console.log('AI script deployed to device');
}
```

### Check Device Heartbeat

```javascript
const heartbeat = await wolClient.getDeviceHeartbeat(deviceId);

if (heartbeat.online) {
  console.log(`Device is online, last heartbeat: ${heartbeat.lastHeartbeat}`);
} else {
  console.log('Device is offline');
}
```

### Send Power Line Command

```javascript
const command = {
  type: 'status',
  data: { requestDetails: true }
};

const result = await wolClient.sendPowerLineCommand(deviceId, command);

if (result.success) {
  console.log(`Command sent via PLC at ${result.modulationFrequency}`);
}
```

## UI Features

The Wake on Lab UI (in aiGridLink.html) provides:

1. **Device Management**
   - Add/remove devices
   - Store devices in localStorage
   - MAC address validation

2. **Wake Controls**
   - Wake button with visual feedback
   - AI injection status indicators
   - Acknowledgment confirmation

3. **Status Monitoring**
   - Real-time device status (⚪ unknown, 🟡 waking, 🟢 online)
   - AI script status (🤖 icon when injected)
   - Acknowledgment status (✓ icon when confirmed)
   - Heartbeat check button (💓)

4. **Event Logging**
   - All wake operations logged to event stream
   - Success/failure notifications
   - Acknowledgment confirmations

## Power Line Communication

The PLC system simulates communication over power lines using modulation signals. In production, this would use actual PLC hardware and protocols like:

- **HomePlug**: 2-30 MHz frequency range
- **G3-PLC**: Narrowband PLC for smart grid
- **PRIME**: PoweRline Intelligent Metering Evolution

The current implementation uses a 125kHz modulation frequency, which is typical for narrowband PLC applications.

## Device AI Script

The AI script injected into devices provides:

1. **Heartbeat System**: Regular check-ins to confirm online status
2. **Command Receiver**: Accepts and processes commands from the grid
3. **Status Reporter**: Reports device status and metrics
4. **Self-Healing**: Automatic recovery and error handling

## Security Considerations

⚠️ **Important Security Notes:**

1. Wake on LAN operates at Layer 2 (Data Link) and typically requires devices to be on the same network segment
2. Magic packets are not encrypted by default
3. In production, implement:
   - Authentication for wake requests
   - Encrypted communication channels
   - Rate limiting to prevent abuse
   - Access control lists (ACLs)
   - Audit logging

## Testing

To test the Wake on Lab system:

1. Start the backend service:
   ```bash
   cd backend/services
   node wake-on-lan.js
   ```

2. Open aiGridLink.html in a browser

3. Add a test device:
   - Name: Test Computer
   - MAC: AA:BB:CC:DD:EE:FF
   - IP: 255.255.255.255

4. Click "⚡ Wake" button

5. Observe event stream for:
   - Magic packet sent
   - AI script deployment
   - Acknowledgment confirmation

6. Click "💓 Status" button to check heartbeat

## Production Deployment

For production use:

1. **Backend Service**:
   - Deploy to a server with network access to target devices
   - Configure firewall rules for UDP port 9 (or custom port)
   - Enable HTTPS for API endpoints
   - Implement authentication and authorization
   - Set up monitoring and alerting

2. **Network Configuration**:
   - Ensure devices support Wake on LAN in BIOS/UEFI
   - Configure network switches to forward broadcast packets
   - Set up VLANs if needed for isolation
   - Document MAC addresses and broadcast IPs

3. **AI Script Deployment**:
   - Develop actual AI script for target platforms
   - Implement secure script delivery mechanism
   - Add script signature verification
   - Monitor script execution and health

## Troubleshooting

### Device won't wake up
- Verify Wake on LAN is enabled in device BIOS/UEFI
- Check that device is connected to power
- Confirm MAC address is correct
- Ensure broadcast IP is correct for network
- Check firewall rules allow UDP port 9

### No acknowledgment received
- Backend service may be offline
- Device may not have received AI script
- Network connectivity issues
- Firewall blocking response

### Heartbeat shows offline
- Device may be sleeping or powered off
- AI script may not be running
- Network issues preventing communication
- Heartbeat timeout (60 seconds) may have elapsed

## Future Enhancements

Potential improvements for the Wake on Lab system:

1. **Multi-Network Support**: Wake devices across different network segments using VPN or relay servers
2. **Scheduled Wake**: Schedule wake operations for specific times
3. **Group Operations**: Wake multiple devices simultaneously
4. **Power Monitoring**: Track device power consumption via PLC
5. **Advanced Commands**: Shutdown, restart, sleep commands
6. **Mobile App**: Native mobile app for device management
7. **Integration**: Connect with home automation systems (Home Assistant, etc.)

## License

This implementation is part of the barbrickdesign.github.io repository.

## Support

For issues or questions, please open an issue on the GitHub repository.
