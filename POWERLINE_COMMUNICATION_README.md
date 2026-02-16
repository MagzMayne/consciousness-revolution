# Powerline Communication System

## Overview

The Powerline Communication (PLC) system enables communication, mapping, monitoring, linking, remote commands, and data gathering over existing power cable infrastructure. This brings the original vision of using power cables as a communication medium to life.

## What is Powerline Communication?

Powerline communication (PLC) is a technology that enables data transmission over existing electrical power cables. Every computer and device with a power cable can potentially use this connection for network communication, creating a powerful mesh network infrastructure without additional wiring.

## Features

### 🗺️ Network Mapping
- **Automatic Device Discovery**: Automatically discovers all PLC-capable devices on the power grid
- **Topology Mapping**: Maps the physical and logical topology of devices across power lines
- **Signal Strength Analysis**: Monitors signal quality and connection health across the network
- **Power Line Identification**: Tracks which devices are on which power lines (L1, L2, L3 phases)

### 📊 Real-time Monitoring
- **Device Status Tracking**: Monitors online/offline status of all connected devices
- **Telemetry Collection**: Gathers metrics from devices including:
  - Voltage and current measurements
  - Power consumption
  - Energy usage
  - Temperature readings
  - Battery status (for UPS systems)
  - Device-specific metrics
- **Historical Data**: Maintains telemetry history for trend analysis
- **Alert System**: Notifies when devices go offline or experience issues

### 🔗 Device Linking
- **Multi-device Coordination**: Links devices together for coordinated operations
- **Power Line Grouping**: Organizes devices by their physical power line connections
- **Location Mapping**: Maps devices to physical locations in buildings
- **Network Visualization**: Provides visual representation of device interconnections

### 🎮 Remote Command & Control
- **Power Management**: Remotely turn devices on/off
- **Configuration Control**: Adjust device settings remotely
- **Brightness Control**: Control lighting devices
- **Temperature Control**: Manage HVAC systems
- **Status Queries**: Retrieve current status from any device
- **Batch Operations**: Execute commands across multiple devices
- **Command History**: Tracks all commands sent with timestamps and results

### 📡 Data Gathering & Telemetry
- **Continuous Monitoring**: Collects data from devices every 5 seconds
- **Aggregated Metrics**: Provides network-wide statistics:
  - Total power consumption
  - Total energy usage
  - Average signal strength
  - Device counts by status
- **Time-series Data**: Maintains historical telemetry for analysis
- **Export Capabilities**: Data can be exported for external analysis

## Technical Specifications

### Communication Protocol
- **Standard**: HomePlug AV2
- **Frequency Range**: 2-28 MHz (OFDM)
- **Data Rate**: Up to 2000 Mbps (theoretical)
- **Security**: AES-128 encryption
- **Topology**: Mesh network with automatic routing

### Supported Device Types
The system can monitor and control various device types:

1. **Power Monitors** ⚡
   - Voltage, current, power, energy metrics
   - Real-time power quality analysis

2. **Smart Outlets** 🔌
   - On/off control
   - Power consumption monitoring
   - Temperature sensing

3. **Energy Meters** 📊
   - Total energy tracking
   - Cost calculation
   - Efficiency monitoring

4. **UPS Systems** 🔋
   - Battery status
   - Load monitoring
   - Runtime estimation

5. **Solar Inverters** ☀️
   - Generation monitoring
   - Grid feed tracking
   - Efficiency analysis

6. **HVAC Controllers** ❄️
   - Temperature control
   - Power monitoring
   - Operating mode management

7. **Lighting Controllers** 💡
   - Brightness control
   - On/off switching
   - Power monitoring

8. **Server Racks** 🖥️
   - Power consumption
   - Temperature monitoring
   - Uptime tracking

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                  Powerline Communication System              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Network    │  │  Monitoring  │  │   Command    │      │
│  │   Discovery  │  │   Engine     │  │   Control    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                  ┌─────────▼─────────┐                       │
│                  │  Device Registry  │                       │
│                  └─────────┬─────────┘                       │
│                            │                                 │
│         ┌──────────────────┼──────────────────┐             │
│         │                  │                  │             │
│  ┌──────▼──────┐  ┌────────▼────────┐  ┌─────▼──────┐     │
│  │  Telemetry  │  │   Topology      │  │  Command   │     │
│  │   Storage   │  │     Map         │  │   Queue    │     │
│  └─────────────┘  └─────────────────┘  └────────────┘     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Power Lines
                            │
        ┌──────────┬────────┴────────┬──────────┐
        │          │                 │          │
    ┌───▼───┐  ┌───▼───┐       ┌───▼───┐  ┌───▼───┐
    │Device │  │Device │  ...  │Device │  │Device │
    │   1   │  │   2   │       │   N-1 │  │   N   │
    └───────┘  └───────┘       └───────┘  └───────┘
```

### Data Flow

1. **Discovery Phase**
   - System sends broadcast discovery packets over power lines
   - Devices respond with identification and capabilities
   - Topology map is built based on signal strength and hop counts

2. **Monitoring Phase**
   - Periodic telemetry requests sent to all devices
   - Devices respond with current metrics
   - Data aggregated and stored in telemetry history

3. **Command Phase**
   - User initiates command through UI
   - Command queued and transmitted to target device
   - Device executes command and returns result
   - Result logged in command history

## Usage

### Access the Interface

1. Open `powerSaver.html` in a web browser
2. Click the "🔌 Powerline Communication" button to switch to PLC mode
3. Wait for the system to initialize and discover devices

### Monitor Devices

The device list shows all discovered devices with:
- Device type and name
- Power line assignment (L1-A, L2-B, etc.)
- Physical location
- Current status (online/offline)
- Last seen timestamp

### Send Commands

1. Select a device from the dropdown
2. Choose a command:
   - **Power On**: Turn device on
   - **Power Off**: Turn device off
   - **Get Status**: Retrieve current device status
   - **Reboot**: Restart the device
   - **Set Brightness**: Adjust lighting level (requires parameter)
3. Enter parameters if needed (e.g., brightness level 0-100)
4. Click "Send Command"
5. View result in the command result panel
6. Check command history for past operations

### View Network Statistics

The dashboard displays:
- **Connected Devices**: Total number of devices on the network
- **Network Health**: Average signal strength across all devices
- **Total Power**: Combined power consumption of all monitored devices

### Command History

The command history panel shows:
- Recent commands executed
- Target device for each command
- Timestamp
- Success/failure status
- Result message

## API Reference

### PowerlineCommunication Class

#### Constructor
```javascript
const plc = new PowerlineCommunication();
```

#### Methods

##### `init()`
Initializes the PLC system
```javascript
await plc.init();
```

##### `discoverNetwork()`
Discovers devices on the power grid
```javascript
const devices = await plc.discoverNetwork();
```

##### `sendCommand(deviceId, command, parameters)`
Sends a command to a device
```javascript
const result = await plc.sendCommand('plc-device-1', 'power-on', {});
```

##### `getNetworkMap()`
Returns the complete network topology
```javascript
const map = plc.getNetworkMap();
```

##### `getNetworkStatistics()`
Returns network statistics
```javascript
const stats = plc.getNetworkStatistics();
```

##### `getTelemetryHistory(deviceId, limit)`
Gets telemetry history for a device
```javascript
const history = plc.getTelemetryHistory('plc-device-1', 100);
```

##### `on(eventName, callback)`
Subscribe to PLC events
```javascript
plc.on('device-discovered', (device) => {
  console.log('New device:', device);
});
```

#### Events

The system emits the following events:
- `initialized`: System initialization complete
- `network-discovered`: Network discovery complete
- `device-discovered`: New device found
- `device-offline`: Device went offline
- `device-online`: Device came back online
- `telemetry-update`: New telemetry data available
- `command-executed`: Command execution complete
- `error`: Error occurred

## Integration with Power Saver

The PLC system is fully integrated with the Power Saver interface:
- Toggle between Power Saver and PLC modes
- Unified UI design
- Shared monitoring capabilities
- Combined energy optimization and device control

## Configuration

The system can be configured by modifying the `config` object:

```javascript
plc.config = {
  scanInterval: 30000,        // Network scan interval (ms)
  telemetryInterval: 5000,    // Telemetry update interval (ms)
  maxTelemetryHistory: 1000,  // Maximum telemetry records
  communicationProtocol: 'HomePlug AV2',
  frequencyRange: '2-28 MHz',
  dataRate: '2000 Mbps',
  securityMode: 'AES-128'
};
```

## Security Considerations

1. **Encryption**: All communication uses AES-128 encryption
2. **Authentication**: Devices must authenticate before joining the network
3. **Command Authorization**: Commands require proper authorization
4. **Network Isolation**: PLC network is isolated from public internet
5. **Audit Logging**: All commands and access logged for security review

## Troubleshooting

### No devices discovered
- Check that PLC adapters are properly installed
- Verify power line connectivity
- Ensure devices support HomePlug AV2 protocol

### Device shows offline
- Check device power connection
- Verify device is still on the same power line
- Wait for next network scan (30 seconds)

### Command fails
- Verify device is online
- Check device capabilities for command support
- Review command parameters

### Poor signal strength
- Check for noise on power lines
- Install PLC filters on noisy devices
- Reduce distance between devices if possible

## Future Enhancements

Planned features for future releases:
- [ ] Real-time power quality analysis
- [ ] Energy consumption forecasting
- [ ] Automated power optimization
- [ ] Integration with smart home systems
- [ ] Mobile app support
- [ ] Advanced analytics dashboard
- [ ] Machine learning anomaly detection
- [ ] Multi-site support
- [ ] Cloud synchronization
- [ ] RESTful API for third-party integration

## License

© 2024-2025 Barbrick Design. All Rights Reserved.

## Support

For questions or issues:
- Email: BarbrickDesign@gmail.com
- GitHub: [@barbrickdesign](https://github.com/barbrickdesign)

---

**Built with ❤️ by Ryan Barbrick and the Barbrick Design community**
