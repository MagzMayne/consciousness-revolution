# AUL Dashboard - Enhanced with Message Streams

## Overview

The enhanced AUL (AI Universal Language) Dashboard provides real-time monitoring and visualization of autonomous agent communications across the Consciousness Revolution platform.

## Features

### ✨ New Enhancements

1. **Live Message Stream**
   - Real-time display of agent-to-agent communications
   - Message priority indicators (critical, high, normal, low)
   - Timestamp tracking for all messages
   - Auto-scrolling with 100-message history

2. **Sacred Theme Integration**
   - Fully themed with sacred-theme.css design system
   - Dark backgrounds with gold/yellow accents
   - Consistent with the rest of the Consciousness Revolution site
   - Smooth animations and transitions

3. **Comprehensive Agent Monitoring**
   - All autonomous agents displayed:
     - `orchestrator-main` - Master coordinator
     - `cyclotron-brain-01` - Knowledge processing
     - `system-monitor-01` - Health monitoring
     - `araya-brain-connector` - ARAYA integration bridge
     - `document-processor-01` - Document parsing
   - Real-time capability tracking
   - Uptime and message counters
   - Success rate monitoring

4. **Message Bus Statistics**
   - Total messages sent and delivered
   - Dropped message tracking
   - Queue size monitoring
   - Average latency metrics

## Architecture

```
┌─────────────────────────────────────────┐
│       AUL Dashboard (HTML/JS)           │
│  - Message Stream Visualization         │
│  - Agent Status Display                 │
│  - Real-time Metrics                    │
└─────────────────┬───────────────────────┘
                  │
                  │ REST API
                  │
┌─────────────────▼───────────────────────┐
│     Dashboard API Server (Python)       │
│  - /api/agents                          │
│  - /api/stats                           │
│  - /api/messages                        │
│  - /api/health                          │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼────────┐  ┌──────▼──────┐
│  Message Bus   │  │   Agent     │
│  (aul_message  │  │  Registry   │
│   _bus.py)     │  │  (aul_agent │
│                │  │  _registry) │
└────────────────┘  └─────────────┘
```

## Installation & Setup

### Prerequisites

- Python 3.7+
- No additional packages required (uses standard library)

### Quick Start

#### Option 1: Using the Start Script (Recommended)

```bash
./START_AUL_DASHBOARD.sh
```

This will:
1. Start the dashboard API server on port 8766
2. Start a web server on port 8080
3. Open both in the background

Access the dashboard at: `http://localhost:8080/AUL_DASHBOARD.html`

#### Option 2: Manual Start

1. Start the API backend:
```bash
python3 aul_dashboard_api.py
```

2. In a separate terminal, start a web server:
```bash
python3 -m http.server 8080
```

3. Open your browser to: `http://localhost:8080/AUL_DASHBOARD.html`

#### Option 3: With Live Agents

To see real agent communications:

```bash
# Terminal 1: Start the AUL orchestrator
./START_AUL_SYSTEM.sh

# Terminal 2: Start the dashboard
./START_AUL_DASHBOARD.sh
```

## API Endpoints

### GET /api/agents
Returns all registered agents with their current status.

**Response:**
```json
{
  "timestamp": "2024-02-14T13:26:21.123Z",
  "total": 5,
  "agents": [
    {
      "agent_id": "orchestrator-main",
      "agent_type": "orchestrator",
      "status": "active",
      "capabilities": ["monitor", "heal", "coordinate"],
      "health": {
        "uptime_seconds": 3600
      }
    }
  ]
}
```

### GET /api/stats
Returns message bus and system statistics.

**Response:**
```json
{
  "timestamp": "2024-02-14T13:26:21.123Z",
  "message_bus": {
    "agents_registered": 5,
    "queue_size": 2,
    "metrics": {
      "messages_sent": 1023,
      "messages_delivered": 1018,
      "messages_dropped": 5,
      "avg_latency_ms": 38.7
    }
  }
}
```

### GET /api/messages
Returns recent message stream (last 50 messages).

**Response:**
```json
{
  "timestamp": "2024-02-14T13:26:21.123Z",
  "total": 50,
  "messages": [
    {
      "id": "msg-uuid-123",
      "timestamp": "2024-02-14T13:26:21.123Z",
      "sender_id": "orchestrator-main",
      "sender_type": "orchestrator",
      "recipient_id": "cyclotron-brain-01",
      "message_type": "query",
      "priority": "high",
      "payload": {
        "action": "query",
        "data": "Processing query request"
      }
    }
  ]
}
```

### GET /api/health
Returns overall system health status.

**Response:**
```json
{
  "timestamp": "2024-02-14T13:26:21.123Z",
  "status": "healthy",
  "details": {
    "total_agents": 5,
    "active_agents": 5,
    "message_bus_running": true,
    "queue_size": 2
  }
}
```

## Dashboard Features

### Auto-Refresh
- Dashboard auto-refreshes every 10 seconds
- Countdown timer shows next refresh
- Smooth animations for new data

### Message Priority Indicators
- **Critical** (Red border): Urgent system events
- **High** (Orange border): Important messages
- **Normal** (Blue border): Standard communications
- **Low** (Gray border): Background tasks

### Agent Cards
Each agent card displays:
- Agent ID and type
- Status badge (Active/Degraded/Offline)
- Capability tags
- Statistics:
  - Uptime
  - Message count
  - Success rate
  - Heartbeat status

## Configuration

### Mock Data Mode
The dashboard includes a mock data mode for testing without live agents:

```javascript
// In AUL_DASHBOARD.html
const USE_MOCK_DATA = true;  // Set to false to use live API
```

### API Base URL
```javascript
const API_BASE = 'http://localhost:8766/api';
```

## Troubleshooting

### Dashboard shows "Waiting for agent messages..."
- Check if the API server is running on port 8766
- Verify agents are running and sending messages
- Check browser console for API errors

### No agents displayed
- Ensure the AUL orchestrator is running
- Check that agents are properly registered
- Verify API endpoint `/api/agents` is accessible

### Styling looks different
- Ensure `sacred-theme.css` is in the `/css` directory
- Check browser console for CSS loading errors
- Clear browser cache and reload

## Development

### Adding New Message Types
Update the message type display in `AUL_DASHBOARD.html`:

```javascript
const messageTypes = ['command', 'query', 'event', 'heartbeat', 'response', 'notification'];
```

### Customizing Refresh Interval
Change the interval in the dashboard JavaScript:

```javascript
setInterval(updateDashboard, 10000);  // 10 seconds
```

## Files

- `AUL_DASHBOARD.html` - Main dashboard interface
- `aul_dashboard_api.py` - REST API server for dashboard data
- `aul_message_bus.py` - Enhanced with message history tracking
- `START_AUL_DASHBOARD.sh` - Convenient startup script

## Related Documentation

- [AUL Protocol Documentation](AUL_PROTOCOL.md)
- [AUL README](AUL_README.md)
- [Autonomous Agents Documentation](AUTONOMOUS_AGENTS_DOCUMENTATION.md)
- [Design System](DESIGN_SYSTEM_SPECIFICATION.md)

## License

MIT License - Consciousness Revolution Project

## Credits

- Self-healing architecture by Agent R
- Enhanced dashboard design following sacred-theme.css
- Real-time message streaming for transparent agent communications
