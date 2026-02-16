# AI Grid Link PLC Enhancement System - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Phase 1: Mobile Power Detection API](#phase-1-mobile-power-detection-api)
4. [Phase 2: Device Identification System](#phase-2-device-identification-system)
5. [Phase 3: Echo Script Protocol](#phase-3-echo-script-protocol)
6. [Phase 4: PLC System Enhancement](#phase-4-plc-system-enhancement)
7. [Phase 5: Integration](#phase-5-integration)
8. [Phase 6: Agent Dashboard](#phase-6-agent-dashboard)
9. [User Guide](#user-guide)
10. [API Reference](#api-reference)

---

## Overview

The AI Grid Link PLC (Powerline Communication) Enhancement System adds intelligent mobile power detection, device identification, and script injection capabilities to the existing powerline communication infrastructure.

### Key Features
- **Mobile Battery Detection**: Automatically detects if device is on battery or charging
- **Data Source Switching**: Switches between WiFi/PC grid data and direct power grid connection
- **Device Identification**: Identifies connected devices by power signature (12 device types)
- **Echo Script Injection**: Secure script injection system for device control (15 command types)
- **Visual Dashboard**: Real-time monitoring and control interface

### System Requirements
- Modern web browser (Chrome, Firefox, Edge, Safari)
- JavaScript enabled
- Battery API support (optional, for mobile detection)
- Local or remote PLC backend (optional, falls back to simulation)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Grid Link Console                      │
│                     (aiGridLink.html)                        │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
    │ Mobile  │    │ Device  │    │  Echo   │
    │  Power  │    │  Ident  │    │ Script  │
    │  Agent  │    │  Agent  │    │  Agent  │
    └────┬────┘    └────┬────┘    └────┬────┘
         │               │               │
         └───────────────┼───────────────┘
                         │
                    ┌────▼────┐
                    │   PLC   │
                    │ System  │
                    └────┬────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
    │ Device  │    │ Device  │    │ Device  │
    │    1    │    │    2    │    │   ...   │
    └─────────┘    └─────────┘    └─────────┘
```

### Component Interaction Flow

1. **Initialization**: All agents initialize when page loads
2. **Power Detection**: Mobile Power Agent monitors battery status
3. **Data Source**: Automatically switches between network/direct based on power
4. **Device Discovery**: PLC system discovers devices on power grid
5. **Identification**: Device Ident Agent analyzes power signatures
6. **Control**: Echo Script Agent enables device control via scripts

---

## Phase 1: Mobile Power Detection API

### Overview
The Mobile Power Grid Agent uses the Battery Status API to detect whether a device is running on battery or plugged into a power source, and automatically switches data sources accordingly.

### API Reference

#### Class: `MobilePowerGridAgent`

##### Constructor
```javascript
const agent = new MobilePowerGridAgent();
```

##### Methods

**`getBatteryStatus()`**
```javascript
const status = agent.getBatteryStatus();
// Returns:
// {
//   supported: true/false,
//   charging: true/false,
//   level: 0.0 - 1.0,
//   source: 'battery' | 'charging',
//   dataSource: 'network' | 'direct',
//   recommendation: {...}
// }
```

**`isOnBattery()`**
```javascript
const onBattery = agent.isOnBattery();
// Returns: true if device is on battery power
```

**`isPluggedIn()`**
```javascript
const pluggedIn = agent.isPluggedIn();
// Returns: true if device is plugged in
```

**`switchDataSource(source)`**
```javascript
agent.switchDataSource('direct');
// Manually switch to 'direct' or 'network'
// Returns: true if successful
```

**`getHealth()`**
```javascript
const health = agent.getHealth();
// Returns agent health status
```

##### Events

**`initialized`** - Fires when agent initializes
```javascript
agent.on('initialized', (data) => {
  console.log('Battery API:', data.batterySupported);
  console.log('Initial source:', data.initialSource);
});
```

**`source-changed`** - Fires when power source changes
```javascript
agent.on('source-changed', (data) => {
  console.log('Old source:', data.oldSource);
  console.log('New source:', data.newSource);
  console.log('Data source:', data.dataSource);
  console.log('Charging:', data.charging);
  console.log('Battery level:', data.batteryLevel);
});
```

**`battery-update`** - Fires on battery state changes
```javascript
agent.on('battery-update', (state) => {
  console.log('Charging:', state.charging);
  console.log('Level:', state.level);
  console.log('Time:', state.chargingTime);
});
```

### Usage Example

```javascript
// Access the global agent
const agent = window.mobilePowerAgent;

// Check battery status
const status = agent.getBatteryStatus();
console.log('Battery level:', (status.level * 100).toFixed(0) + '%');
console.log('Charging:', status.charging);

// Listen for power changes
agent.on('source-changed', (data) => {
  if (data.newSource === 'battery') {
    console.log('Switched to battery - using network data');
  } else {
    console.log('Plugged in - using direct power grid data');
  }
});

// Manually switch data source
agent.switchDataSource('direct');
```

### Data Source Behavior

| Power State | Data Source | Telemetry Interval | Description |
|------------|-------------|-------------------|-------------|
| **On Battery** | `network` | 5 seconds | Uses WiFi/PC grid data to conserve battery |
| **Plugged In** | `direct` | 3 seconds | Uses direct power grid connection for faster updates |

### Browser Compatibility

| Browser | Battery API Support | Fallback Behavior |
|---------|-------------------|-------------------|
| Chrome | ✅ Full support | N/A |
| Edge | ✅ Full support | N/A |
| Firefox | ⚠️ Limited | Assumes desktop/plugged in |
| Safari | ❌ Not supported | Assumes desktop/plugged in |

---

## Phase 2: Device Identification System

### Overview
The Device Identification Agent analyzes power draw patterns to identify connected devices. It includes a database of 12 common device types and supports learning mode for unknown devices.

### API Reference

#### Class: `DeviceIdentificationAgent`

##### Constructor
```javascript
const agent = new DeviceIdentificationAgent();
```

##### Methods

**`getDeviceDatabase()`**
```javascript
const database = agent.getDeviceDatabase();
// Returns array of device signatures (12 types)
```

**`getIdentificationResults()`**
```javascript
const results = agent.getIdentificationResults();
// Returns:
// {
//   identified: [...],  // Successfully identified devices
//   unknown: [...],     // Unknown devices
//   databaseSize: 12,
//   confidenceThreshold: 0.85
// }
```

**`identifyDevice(device)`**
```javascript
const identification = agent.identifyDevice(device);
// Returns:
// {
//   type: {...},        // Matched device type
//   confidence: 0.0-1.0,
//   power: 123.45,
//   reason: "..."
// }
```

**`enableLearning()`** / **`disableLearning()`**
```javascript
agent.enableLearning();  // Enable learning mode
agent.disableLearning(); // Disable learning mode
```

**`addDeviceSignature(id, name, icon, signature)`**
```javascript
agent.addDeviceSignature('new-device', 'Smart Bulb', '💡', {
  basePower: 8,
  variance: 2,
  pattern: 'constant',
  // ... other signature properties
});
```

##### Events

**`device-identified`** - Fires when device is identified
```javascript
agent.on('device-identified', (data) => {
  console.log('Device:', data.deviceName);
  console.log('Type:', data.identification.type.name);
  console.log('Confidence:', data.identification.confidence);
});
```

**`unknown-device`** - Fires when unknown device detected
```javascript
agent.on('unknown-device', (data) => {
  console.log('Unknown device:', data.deviceName);
  console.log('Best guess:', data.bestGuess.type?.name);
});
```

### Device Signature Database

The system includes signatures for 12 device types:

| ID | Name | Icon | Base Power | Pattern | Confidence |
|----|------|------|------------|---------|-----------|
| `laptop` | Laptop Computer | 💻 | 45W | Variable | 85%+ |
| `desktop` | Desktop Computer | 🖥️ | 120W | Variable | 85%+ |
| `monitor` | LCD Monitor | 🖥️ | 30W | Steady | 90%+ |
| `led-light` | LED Light Bulb | 💡 | 10W | Constant | 95%+ |
| `refrigerator` | Refrigerator | 🧊 | 150W | Cyclic | 80%+ |
| `microwave` | Microwave Oven | 📡 | 1200W | Constant-High | 90%+ |
| `tv` | Television | 📺 | 80W | Variable | 85%+ |
| `router` | WiFi Router | 📡 | 12W | Steady-Variable | 90%+ |
| `hvac` | HVAC System | ❄️ | 3500W | Cyclic-Heavy | 85%+ |
| `washing-machine` | Washing Machine | 🧺 | 500W | Multi-Phase | 80%+ |
| `printer` | Laser Printer | 🖨️ | 50W | Burst | 85%+ |
| `phone-charger` | Phone Charger | 📱 | 5W | Declining | 90%+ |

### Power Signature Analysis

The identification algorithm uses 4 factors:

1. **Base Power Match (40% weight)**: Compares actual power to signature base power
2. **Power Range (30% weight)**: Checks if power is within idle-peak range
3. **Device Type Hints (20% weight)**: Uses device metadata if available
4. **Name Matching (10% weight)**: Matches device name to signature name

**Confidence Threshold**: 85% (configurable)

### Usage Example

```javascript
// Access the global agent
const agent = window.deviceIdentAgent;

// Get identified devices
const results = agent.getIdentificationResults();
console.log('Identified:', results.identified.length);
console.log('Unknown:', results.unknown.length);

// Listen for identifications
agent.on('device-identified', (data) => {
  const confidence = (data.identification.confidence * 100).toFixed(1);
  console.log(`${data.deviceName} identified as ${data.identification.type.name} (${confidence}%)`);
});

// Enable learning mode
agent.enableLearning();

// Get device database
const database = agent.getDeviceDatabase();
database.forEach(sig => {
  console.log(`${sig.icon} ${sig.name}: ${sig.signature.basePower}W`);
});
```

---

## Phase 3: Echo Script Protocol

### Overview
The Echo Script Injection Agent provides a secure system for injecting and executing scripts on connected devices. It includes safety validation, command queuing, and execution tracking.

### API Reference

#### Class: `EchoScriptInjectionAgent`

##### Constructor
```javascript
const agent = new EchoScriptInjectionAgent();
```

##### Methods

**`injectScript(deviceId, commandType, script, options)`**
```javascript
const scriptId = await agent.injectScript(
  'plc-device-1',
  'power',
  'power-on level=100',
  { force: false, acknowledgeWarnings: false }
);
// Returns: script ID (e.g., 'script-1234567890-abc123')
```

**`getQueueStatus()`**
```javascript
const status = agent.getQueueStatus();
// Returns:
// {
//   queueLength: 5,
//   maxQueueSize: 100,
//   processing: 1,
//   queued: 4
// }
```

**`getExecutionHistory(limit)`**
```javascript
const history = agent.getExecutionHistory(50);
// Returns array of script execution records
```

**`getCommandTypes()`**
```javascript
const types = agent.getCommandTypes();
// Returns array of 15 command types
```

**`clearQueue()` / `clearHistory()`**
```javascript
agent.clearQueue();    // Clear pending scripts
agent.clearHistory();  // Clear execution history
```

##### Events

**`script-injected`** - Fires when script is added to queue
```javascript
agent.on('script-injected', (data) => {
  console.log('Script ID:', data.scriptId);
  console.log('Queue position:', data.queuePosition);
});
```

**`script-executing`** - Fires when script starts executing
```javascript
agent.on('script-executing', (data) => {
  console.log('Executing:', data.scriptId);
  console.log('Device:', data.deviceId);
});
```

**`script-completed`** - Fires when script completes successfully
```javascript
agent.on('script-completed', (data) => {
  console.log('Completed:', data.scriptId);
  console.log('Time:', data.executionTime + 'ms');
  console.log('Result:', data.result);
});
```

**`script-failed`** - Fires when script fails
```javascript
agent.on('script-failed', (data) => {
  console.log('Failed:', data.scriptId);
  console.log('Error:', data.error);
  console.log('Retries:', data.retries);
});
```

**`script-rejected`** - Fires when script fails safety validation
```javascript
agent.on('script-rejected', (data) => {
  console.log('Rejected:', data.script);
  console.log('Errors:', data.errors);
});
```

**`script-warnings`** - Fires when script has warnings
```javascript
agent.on('script-warnings', (data) => {
  console.log('Warnings:', data.warnings);
});
```

### Command Types

The system supports 15 command types:

| Type | Description | Example |
|------|-------------|---------|
| `power` | Power control | `power-on`, `power-off` |
| `telemetry` | Read telemetry data | `get-voltage`, `get-current` |
| `config` | Configuration | `set-brightness level=50` |
| `automation` | Automation scripts | `schedule power-on 08:00` |
| `echo` | Echo/ping | `echo hello` |
| `network` | Network operations | `reconnect`, `get-ip` |
| `status` | Status queries | `get-status` |
| `reboot` | Restart commands | `reboot`, `restart` |
| `update` | Firmware updates | `update-firmware` |
| `security` | Security ops | `change-password` |
| `diagnostic` | Diagnostics | `run-diagnostic` |
| `logging` | Logging control | `enable-logging` |
| `alert` | Alert config | `set-alert temp>80` |
| `schedule` | Scheduling | `schedule reboot 02:00` |
| `batch` | Batch operations | `batch power-off device1,device2` |

### Safety Validation

The safety validator blocks dangerous patterns:

**Blacklist** (automatically rejected):
- File system destruction: `rm -rf`, `format c:`, `del /f /q`
- Fork bombs: `:(){:|:&};:`
- Disk operations: `dd if=`, `mkfs`
- Code execution: `eval(`, `exec(`
- XSS attempts: `<script>`, `document.cookie`
- Storage access: `localStorage.`, `sessionStorage.`

**Warnings** (require `force: true`):
- Power operations: `power-off`, `reboot`
- Configuration changes: `config-`
- Batch operations: `batch`

### Usage Example

```javascript
// Access the global agent
const agent = window.echoScriptAgent;

// Inject a script
try {
  const scriptId = await agent.injectScript(
    'plc-device-1',
    'power',
    'power-on',
    {}
  );
  console.log('Script injected:', scriptId);
} catch (error) {
  console.error('Injection failed:', error.message);
}

// Monitor queue
const status = agent.getQueueStatus();
console.log('Queue length:', status.queueLength);
console.log('Processing:', status.processing);

// View history
const history = agent.getExecutionHistory(10);
history.forEach(script => {
  console.log(`${script.id}: ${script.status} (${script.executionTime}ms)`);
});

// Listen for completions
agent.on('script-completed', (data) => {
  console.log('✓ Script', data.scriptId, 'completed in', data.executionTime, 'ms');
});

// Listen for failures
agent.on('script-failed', (data) => {
  console.log('✗ Script', data.scriptId, 'failed:', data.error);
});
```

### Script Queue Processing

- **Queue Capacity**: 100 scripts maximum
- **Processing Rate**: 1 script per second
- **Timeout**: 30 seconds per script
- **Max Retries**: 3 attempts on failure
- **History Size**: 500 most recent executions

---

## Phase 4: PLC System Enhancement

### Data Source Switching

The PLC system now supports switching between two data sources:

**`switchDataSource(source, context)`**
```javascript
window.plcSystem.switchDataSource('direct', {
  reason: 'battery-state-change',
  charging: true
});
```

**`getDataSource()`**
```javascript
const source = window.plcSystem.getDataSource();
// Returns:
// {
//   source: 'direct' | 'network',
//   telemetryInterval: 3000 | 5000,
//   description: "..."
// }
```

### Telemetry Intervals

| Source | Interval | Use Case |
|--------|----------|----------|
| `direct` | 3 seconds | Plugged in - faster updates |
| `network` | 5 seconds | On battery - power saving |

---

## Phase 5: Integration

All agents are integrated into `aiGridLink.html` and auto-initialize on page load.

### Initialization Sequence

1. PLC system initializes
2. Mobile Power Agent initializes
3. Device Identification Agent initializes
4. Echo Script Injection Agent initializes
5. Event `agents-initialized` fires

### Global Access

All agents are available globally:
```javascript
window.mobilePowerAgent     // Mobile Power Grid Agent
window.deviceIdentAgent     // Device Identification Agent
window.echoScriptAgent      // Echo Script Injection Agent
window.plcSystem            // PLC System
```

---

## Phase 6: Agent Dashboard

### Access

Open `agent-plc-dashboard.html` to access the visual dashboard.

### Features

1. **Agent Health Cards**: Real-time status of all 3 agents
2. **Device Identification**: List of identified devices with confidence
3. **Script History**: Recent script executions
4. **Manual Injection**: Form for injecting scripts manually

### Auto-refresh

Dashboard automatically refreshes every 5 seconds.

---

## User Guide

### Getting Started

1. **Open Console**: Open `aiGridLink.html` in a modern browser
2. **Wait for Initialization**: Wait ~5 seconds for all agents to initialize
3. **Monitor Events**: Watch the event log for system activity
4. **Open Dashboard**: Navigate to `agent-plc-dashboard.html` for visual monitoring

### Mobile Usage

**On a Laptop:**
1. Open `aiGridLink.html`
2. Unplug power cable
3. Watch event log: `⚡ On battery - Switched to network data`
4. Plug in power cable
5. Watch event log: `⚡ Plugged in - Switched to direct data`

**Low Battery Warning:**
- When battery drops below 20%, you'll see: `🔋 Low battery: XX%`

### Device Identification

**Automatic:**
- Devices are automatically identified every 10 seconds
- Identified devices appear in dashboard with confidence percentage
- Unknown devices appear in separate list

**Manual Learning:**
```javascript
// Enable learning mode
window.deviceIdentAgent.enableLearning();

// Add new device signature
window.deviceIdentAgent.addDeviceSignature(
  'smart-bulb',
  'Smart Bulb',
  '💡',
  {
    basePower: 8,
    variance: 2,
    pattern: 'constant',
    frequency: 'none',
    startup: 10,
    idle: 8,
    peakPower: 12
  }
);
```

### Script Injection

**Via Dashboard:**
1. Open `agent-plc-dashboard.html`
2. Scroll to "Manual Script Injection"
3. Select device
4. Choose command type
5. Enter script
6. Click "Inject Script"

**Via Console:**
```javascript
// Simple power command
await window.echoScriptAgent.injectScript(
  'plc-device-1',
  'power',
  'power-on',
  {}
);

// Configuration command
await window.echoScriptAgent.injectScript(
  'plc-device-2',
  'config',
  'set-brightness level=75',
  {}
);

// With warnings (requires force)
await window.echoScriptAgent.injectScript(
  'plc-device-3',
  'power',
  'power-off',
  { force: true, acknowledgeWarnings: true }
);
```

---

## API Reference

### Quick Reference

#### Mobile Power Agent
```javascript
window.mobilePowerAgent.getBatteryStatus()
window.mobilePowerAgent.isOnBattery()
window.mobilePowerAgent.isPluggedIn()
window.mobilePowerAgent.switchDataSource(source)
window.mobilePowerAgent.getHealth()
```

#### Device Identification Agent
```javascript
window.deviceIdentAgent.getDeviceDatabase()
window.deviceIdentAgent.getIdentificationResults()
window.deviceIdentAgent.identifyDevice(device)
window.deviceIdentAgent.enableLearning()
window.deviceIdentAgent.disableLearning()
window.deviceIdentAgent.addDeviceSignature(id, name, icon, signature)
window.deviceIdentAgent.getHealth()
```

#### Echo Script Agent
```javascript
await window.echoScriptAgent.injectScript(deviceId, type, script, options)
window.echoScriptAgent.getQueueStatus()
window.echoScriptAgent.getExecutionHistory(limit)
window.echoScriptAgent.getCommandTypes()
window.echoScriptAgent.clearQueue()
window.echoScriptAgent.clearHistory()
window.echoScriptAgent.getHealth()
```

#### PLC System
```javascript
window.plcSystem.switchDataSource(source, context)
window.plcSystem.getDataSource()
window.plcSystem.getStatus()
```

---

## Troubleshooting

### Battery API Not Available
**Symptom**: Console shows `⚠ Battery API not available`  
**Solution**: This is normal for desktop browsers and Safari. System falls back to assuming desktop/plugged in.

### Devices Not Identified
**Symptom**: No devices in identification results  
**Solution**: 
1. Wait 30 seconds for device discovery
2. Check PLC system is running
3. Verify devices have telemetry data

### Script Injection Fails
**Symptom**: Script rejected or fails to execute  
**Solution**:
1. Check safety validation errors
2. Use `force: true` for scripts with warnings
3. Verify device exists and is online
4. Check command type is valid

### Dashboard Not Updating
**Symptom**: Dashboard shows stale data  
**Solution**:
1. Check browser console for errors
2. Verify agents initialized
3. Click "Refresh" button
4. Hard refresh browser (Ctrl+F5)

---

## Support

For questions or issues:
- **Email**: BarbrickDesign@gmail.com
- **GitHub**: [@barbrickdesign](https://github.com/barbrickdesign)
- **Repository**: barbrickdesign/barbrickdesign.github.io

---

**Document Version**: 1.0  
**Last Updated**: February 2, 2026  
**© 2024-2025 Barbrick Design. All Rights Reserved.**
