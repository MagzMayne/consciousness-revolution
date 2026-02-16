# AI Grid Link - Production System Documentation

## Overview

The AI Grid Link system is a production-ready grid control platform with real PLC (Programmable Logic Controller) integration, AI-powered monitoring, and power line communication capabilities. This system transforms the conceptual UI shell into a fully functional tool for managing electrical grid infrastructure.

## System Architecture

### Components

1. **Frontend (aiGridLink.html)**
   - Real-time grid visualization
   - Control interface for grid operations
   - Always-online capability via service worker
   - Connects to backend API for real data

2. **Backend Services**
   - **Grid Control API** (`backend/services/grid-control-api.js`)
     - RESTful API for grid management
     - Device registration and data reporting
     - Security and authentication
     - Safety interlocks and compliance
   
   - **PLC Modulation System** (`backend/services/plc-modulation.js`)
     - Power line communication
     - Pulse modulation for device discovery
     - Data encoding/decoding for transmission
     - Adaptive modulation based on conditions
   
   - **AI Grid Agents** (`backend/services/ai-grid-agents.js`)
     - Autonomous monitoring agents
     - Anomaly detection
     - Load optimization
     - Predictive analytics
     - Self-healing responses
     - Security threat detection

3. **Service Worker** (`grid-control-sw.js`)
   - Offline caching
   - Always-online capability
   - Background sync
   - Push notifications for alerts

## Key Features

### 1. Real PLC Integration
- Direct communication with PLC devices
- Device registration via MAC address
- Real-time data collection and reporting
- Support for various PLC device types (sensors, actuators, meters, controllers)

### 2. Power Line Communication (PLC)
- Pulse modulation at base frequency (50/60 Hz)
- Carrier frequency communication (125 kHz)
- Device discovery through modulation patterns
- Data transfer over existing power lines
- Adaptive modulation based on line conditions

### 3. AI-Powered Grid Management
- **Monitor Agent**: Real-time anomaly detection using statistical analysis
- **Optimizer Agent**: Load balancing and distribution optimization
- **Predictor Agent**: Demand forecasting and trend analysis
- **Healer Agent**: Autonomous self-healing responses to issues
- **Security Agent**: Cybersecurity threat detection and prevention

### 4. Always Online
- Service worker ensures availability even offline
- Background sync when connection restored
- Local caching of critical data
- Automatic reconnection to backend

### 5. Security & Safety
- API key authentication
- Rate limiting for control operations
- Safety lockout mechanisms
- Emergency shutdown capability
- Compliance logging and audit trails

## Installation

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn package manager

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and set:
```
GRID_API_KEY=your-secure-api-key
GRID_ADMIN_KEY=your-admin-key
GRID_API_PORT=3100
ALLOWED_ORIGINS=http://localhost:3100,https://yourdomain.com
```

4. Start the system:
```bash
npm run start
```

Or use the startup script:
```bash
node start-grid-system.js
```

### Frontend Setup

The frontend is served as a static HTML file. To use it:

1. Open `aiGridLink.html` in a web browser, OR
2. Serve it via a web server (recommended for service worker functionality)

For local development with service worker:
```bash
npx http-server -p 3100
```

Then navigate to `http://localhost:3100/aiGridLink.html`

## API Reference

### Authentication
All API endpoints require authentication via API key in header:
```
X-API-Key: your-api-key
```

Or as query parameter:
```
?apiKey=your-api-key
```

### Endpoints

#### Health Check
```
GET /api/health
```
Returns system status and health information.

#### Get Grid State
```
GET /api/grid/state
```
Returns current grid state including nodes, devices, agents, and alerts.

#### Register PLC Device
```
POST /api/plc/register
Body: {
  "deviceId": "device-001",
  "macAddress": "AA:BB:CC:DD:EE:FF",
  "ipAddress": "192.168.1.100",
  "deviceType": "sensor",
  "capabilities": ["measure", "report"]
}
```
Registers a new PLC device on the grid.

#### Report Device Data
```
POST /api/plc/report
Body: {
  "deviceId": "device-001",
  "data": {
    "voltage": 120.5,
    "current": 15.2,
    "temperature": 25.3
  },
  "timestamp": 1706543210000
}
```
Reports data from a PLC device.

#### Send Pulse Modulation
```
POST /api/modulation/pulse
Body: {
  "frequency": 60,
  "duration": 100,
  "pattern": "discovery",
  "data": {}
}
```
Sends a pulse modulation signal through power lines.

#### Deploy AI Agent
```
POST /api/agents/deploy (Admin only)
Body: {
  "agentType": "monitor",
  "config": {}
}
```
Deploys a new AI agent to the grid.

#### Emergency Shutdown
```
POST /api/emergency/shutdown (Admin only)
```
Activates emergency shutdown and safety lockout.

#### Get Alerts
```
GET /api/alerts?limit=100&severity=high
```
Retrieves system alerts.

#### System Metrics
```
GET /api/metrics
```
Returns system performance metrics.

## Usage

### Starting the System

1. Start the backend services:
```bash
cd backend
node start-grid-system.js
```

You should see:
```
╔══════════════════════════════════════════════════════════╗
║   AI Grid Link - Production System Startup              ║
║   Real PLC Integration & Grid Control                   ║
╚══════════════════════════════════════════════════════════╝

✓ Grid Control API Server: Running
✓ PLC Modulation System: Active
✓ AI Grid Agents: Deployed

═══════════════════════════════════════════════════════════
 System Status: OPERATIONAL
 Always Online: ✓
 Pulse Modulation: ✓ Active
 AI Agents: ✓ Monitoring Grid
 Security: ✓ Enabled
═══════════════════════════════════════════════════════════
```

2. Open the frontend in a browser:
```
http://localhost:3100/aiGridLink.html
```

3. The system will automatically:
   - Register the service worker for always-online capability
   - Connect to the backend API
   - Deploy autonomous AI agents
   - Start pulse modulation for device discovery
   - Begin real-time monitoring

### Registering a Device

Devices can self-register by calling the API:
```javascript
fetch('http://localhost:3100/api/plc/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key'
  },
  body: JSON.stringify({
    deviceId: 'sensor-123',
    macAddress: 'AA:BB:CC:DD:EE:FF',
    deviceType: 'sensor',
    capabilities: ['temperature', 'voltage', 'current']
  })
});
```

### Reporting Data

Devices report data periodically:
```javascript
fetch('http://localhost:3100/api/plc/report', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key'
  },
  body: JSON.stringify({
    deviceId: 'sensor-123',
    data: {
      temperature: 25.5,
      voltage: 120.2,
      current: 15.3
    },
    timestamp: Date.now()
  })
});
```

## Power Line Communication

### How It Works

1. **Discovery Phase**
   - System sends periodic discovery pulses at base frequency (60 Hz) with modulation
   - Devices listening on the power line detect the pattern
   - Devices respond with their identification

2. **Data Transfer Phase**
   - System uses carrier frequency (125 kHz) for data transmission
   - Data is encoded using amplitude shift keying (ASK)
   - Error correction and checksums ensure data integrity
   - Adaptive modulation adjusts based on line noise

3. **Device Communication**
   - Devices encode data and transmit back through power lines
   - System decodes received signals
   - Data is processed and stored in the backend

### Modulation Parameters

- **Base Frequency**: 60 Hz (50 Hz for Europe)
- **Modulation Range**: ±0.5 Hz
- **Carrier Frequency**: 125 kHz
- **Bit Rate**: 9600 bps
- **Discovery Interval**: 30 seconds

## Security Considerations

### Production Deployment

⚠️ **IMPORTANT**: Before deploying to production:

1. Change all default API keys in `.env`
2. Enable HTTPS/TLS for all communications
3. Implement proper certificate management
4. Set up firewall rules to restrict API access
5. Enable audit logging
6. Implement regular security updates
7. Follow industry standards (IEC 62351, NERC CIP)

### Authentication

- API keys should be rotated regularly
- Admin keys should be different from regular keys
- Use environment variables, never hardcode keys
- Implement multi-factor authentication for admin access

### Safety Interlocks

The system includes multiple safety mechanisms:
- Rate limiting on control operations
- Safety lockout for emergency situations
- Frequency bounds checking (45-65 Hz safe range)
- Emergency shutdown capability
- Audit trails for all operations

## Monitoring & Maintenance

### System Health

Check system health:
```bash
curl -H "X-API-Key: your-key" http://localhost:3100/api/health
```

### Metrics

View system metrics:
```bash
curl -H "X-API-Key: your-key" http://localhost:3100/api/metrics
```

### Logs

Backend logs show:
- Agent deployments and actions
- Device discoveries and registrations
- Anomaly detections
- Security events
- System errors

Monitor logs:
```bash
tail -f backend.log
```

### Alerts

The system generates alerts for:
- Anomalies detected by AI agents
- Security threats
- Device failures
- System errors
- Safety violations

View alerts:
```bash
curl -H "X-API-Key: your-key" http://localhost:3100/api/alerts
```

## Troubleshooting

### Backend Not Starting

1. Check Node.js version: `node --version` (should be >= 18.0.0)
2. Verify dependencies: `npm install`
3. Check port availability: `lsof -i :3100`
4. Review error logs

### Frontend Not Connecting

1. Verify backend is running
2. Check CORS settings in backend
3. Verify API key is correct
4. Check browser console for errors
5. Ensure GRID_API_URL is correct in frontend

### Service Worker Not Registering

1. Serve over HTTPS or localhost
2. Check browser compatibility
3. Clear browser cache
4. Check browser console for errors

### No Devices Discovered

1. Verify PLC modulation system is active
2. Check device configuration
3. Ensure devices are on the same power line segment
4. Verify frequency settings match region (50/60 Hz)

## Performance Tuning

### API Server

- Adjust rate limits based on traffic
- Increase cache TTL for static data
- Use connection pooling for database
- Enable compression for responses

### PLC Modulation

- Adjust discovery interval based on network size
- Tune modulation parameters for line conditions
- Implement adaptive bit rate
- Use error correction codes

### AI Agents

- Adjust monitoring interval based on data rate
- Tune anomaly thresholds for false positive rate
- Configure prediction window based on use case
- Enable/disable agents based on needs

## Support & Contributing

For issues, questions, or contributions, please refer to the main repository documentation.

## License

MIT License - See LICENSE file for details

---

**WARNING**: This system interfaces with electrical grid infrastructure. Improper configuration or operation can cause safety hazards. Always follow local electrical codes, safety regulations, and utility requirements. Consult with qualified electrical engineers before deployment.
