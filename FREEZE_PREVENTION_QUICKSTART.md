# Freeze Prevention System - Quick Start Guide

## What This System Does

The Freeze Prevention System automatically protects power lines from ice buildup during winter weather by:
1. **Monitoring** temperature at 12 key locations across the power grid
2. **Detecting** freezing conditions (0°C and below)
3. **Activating** pulse modulation through power lines to prevent ice formation
4. **Protecting** infrastructure before damage occurs

## Quick Start

### 1. Start the System

```bash
cd backend
npm install
node start-grid-system.js
```

You'll see:
```
✓ Grid Control API Server: Running
✓ PLC Modulation System: Active
✓ AI Grid Agents: Deployed
✓ Freeze Prevention Agent: Monitoring
```

### 2. Monitor Status

Check freeze prevention status:
```bash
curl -H "X-API-Key: CHANGE_THIS_IN_PRODUCTION" \
  http://localhost:3100/api/freeze-prevention/status
```

Get temperature report:
```bash
curl -H "X-API-Key: CHANGE_THIS_IN_PRODUCTION" \
  http://localhost:3100/api/freeze-prevention/temperature
```

### 3. Watch the Logs

The system will automatically log when it detects freezing conditions:
```
[Freeze Prevention] ⚠️  FREEZE RISK DETECTED at tower-01: -1.8°C
[Freeze Prevention] 🔥 Activating anti-freeze pulse modulation for tower-01
[Freeze Prevention] 📡 Anti-freeze pulse transmitted (Intensity: 0.60, Severity: medium)
```

Critical alerts:
```
[Freeze Prevention] 🚨 CRITICAL: Severe ice conditions at substation-west: -6.5°C
```

## How It Works

### Temperature Monitoring
- Checks 12 locations every 30 seconds
- Monitors: substations, line segments, towers
- Factors in wind chill and precipitation

### Pulse Modulation
When temperature drops below 0°C, sends specialized pulse patterns:
- **60 Hz base frequency** (50 Hz for Europe)
- **±0.3 Hz modulation** for vibration
- **500ms pulse duration**
- **60 second intervals** between pulses

### Severity Levels
- **Low** (0°C to 2°C): Light protection, low intensity
- **Medium** (-2°C to 0°C): Moderate protection
- **High** (-5°C to -2°C): Strong protection
- **Critical** (< -5°C): Maximum protection, emergency pulses

## API Endpoints

All endpoints require API key in header: `X-API-Key: your-key`

### Check System Health
```bash
GET /api/health
```

### Get Freeze Prevention Status
```bash
GET /api/freeze-prevention/status
```

Returns:
- Agent status (active/inactive)
- Metrics (pulses activated, freeze events detected)
- Active protection locations
- Configuration

### Get Temperature Report
```bash
GET /api/freeze-prevention/temperature
```

Returns:
- Temperature readings for all 12 locations
- Summary statistics
- Protection status per location

### Manual Activation (Admin Only)
```bash
POST /api/freeze-prevention/activate
Content-Type: application/json

{
  "location": "tower-01"
}
```

## Configuration

Edit thresholds in `backend/start-grid-system.js`:

```javascript
const freezeAgent = new FreezePreventionAgent({
  freezeThreshold: 2,         // °C - Start monitoring
  criticalThreshold: -5,      // °C - Critical conditions
  activationThreshold: 0,     // °C - Activate protection
  monitoringInterval: 30000,  // 30 seconds
  pulseInterval: 60000        // 60 seconds between pulses
});
```

## Safety Features

✓ **Rate Limiting**: Max 100 continuous pulses before cooldown  
✓ **Cooldown Period**: 5 minutes mandatory cooldown  
✓ **Frequency Bounds**: Stays within 59.7-60.3 Hz (safe range)  
✓ **Emergency Shutdown**: Manual stop capability  
✓ **Alert System**: Critical condition notifications  

## Testing

Run the test suite:
```bash
cd backend
node test-freeze-prevention.js
```

Expected output:
```
✓ Health check passed
✓ Freeze prevention status retrieved
✓ Temperature report retrieved
✓ Grid state retrieved
✓ System metrics retrieved
✓ Alerts retrieved
✓ PLC devices retrieved

🎉 All tests passed!
```

## Monitoring Dashboard

Access the Grid Control Dashboard at:
```
http://localhost:3100/aiGridLink.html
```

## Troubleshooting

### Agent Not Activating
- Check temperature thresholds in config
- Verify PLC modulation system is running
- Check logs for errors

### No Pulses Sent
- Confirm PLC modulation system is active
- Check pulse interval settings
- Verify no safety lockout engaged

### High Memory Usage
- Check monitoring interval (default 30s)
- Review temperature data history size
- Restart system if needed

## Production Deployment

Before deploying to production:

1. **Change API Keys**
   ```bash
   export GRID_API_KEY="your-secure-key"
   export GRID_ADMIN_KEY="your-admin-key"
   ```

2. **Enable HTTPS**
   - Set up SSL certificates
   - Configure reverse proxy (nginx/Apache)

3. **Configure Firewall**
   - Restrict API access
   - Whitelist authorized IPs

4. **Set Up Monitoring**
   - Configure alerting system
   - Set up log aggregation
   - Monitor system health

5. **Test Thoroughly**
   - Run test suite
   - Verify all endpoints
   - Test emergency shutdown

## Support

- **Email**: BarbrickDesign@gmail.com
- **Documentation**: FREEZE_PREVENTION_README.md
- **API Docs**: README-GRID-CONTROL.md

## Key Commands

```bash
# Start system
node backend/start-grid-system.js

# Run tests
node backend/test-freeze-prevention.js

# Check status
curl -H "X-API-Key: key" http://localhost:3100/api/freeze-prevention/status

# Get temperature report
curl -H "X-API-Key: key" http://localhost:3100/api/freeze-prevention/temperature

# System health
curl http://localhost:3100/api/health

# Stop system
Ctrl+C or kill <PID>
```

## Success Indicators

✓ System shows "OPERATIONAL" status  
✓ Freeze prevention agent shows "Monitoring"  
✓ Temperature readings updating every 30 seconds  
✓ Pulses activated when temp drops below 0°C  
✓ Critical alerts for severe conditions (< -5°C)  
✓ All API endpoints responding  

---

**The power lines are now protected! 🎉**

For detailed technical information, see `FREEZE_PREVENTION_README.md`
