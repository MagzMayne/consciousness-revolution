# AI Grid Link PLC Enhancement - Phase 7: Testing & Todo Checklist

## Overview
This document provides a comprehensive testing checklist and todo list for the AI Grid Link PLC (Powerline Communication) enhancement system.

**Implementation Date**: February 2, 2026  
**Repository**: barbrickdesign/barbrickdesign.github.io  
**Branch**: copilot/add-mobile-battery-detection

## System Components

### Phase 1: Mobile Power Grid Agent ✅
**File**: `src/agents/mobile-power-grid-agent.js`  
**Status**: Implemented

### Phase 2: Device Identification Agent ✅
**File**: `src/agents/device-identification-agent.js`  
**Status**: Implemented

### Phase 3: Echo Script Injection Agent ✅
**File**: `src/agents/echo-script-injection-agent.js`  
**Status**: Implemented

### Phase 4: PLC System Enhancement ✅
**File**: `powerline-communication.js`  
**Status**: Enhanced with data source switching

### Phase 5: Integration ✅
**File**: `aiGridLink.html`  
**Status**: All agents integrated

### Phase 6: Agent Deployment Dashboard ✅
**File**: `agent-plc-dashboard.html`  
**Status**: Complete visual dashboard created

---

## Testing Checklist

### 1. Mobile Battery Detection Testing

#### Test 1.1: Battery API Availability
- [ ] Open `aiGridLink.html` in Chrome (supports Battery API)
- [ ] Check console for: `[MobilePowerGridAgent] ✓ Battery API available`
- [ ] Verify agent initialization message appears

#### Test 1.2: Desktop Detection (No Battery)
- [ ] Open `aiGridLink.html` in desktop browser
- [ ] Verify console shows: `⚠ Battery API not available - assuming desktop/plugged in`
- [ ] Check that `currentSource` is set to `'network'`

#### Test 1.3: Battery Status Detection
- [ ] On a laptop, open `aiGridLink.html`
- [ ] Unplug the laptop
- [ ] Verify console shows: `[MobilePowerGridAgent] Source changed: charging → battery`
- [ ] Check UI for event: `⚡ On battery - Switched to network data`

#### Test 1.4: Charging State Detection
- [ ] On a laptop with battery, plug in power cable
- [ ] Verify console shows: `[MobilePowerGridAgent] Source changed: battery → charging`
- [ ] Check UI for event: `⚡ Plugged in - Switched to direct data`

#### Test 1.5: Low Battery Warning
- [ ] Let battery drain below 20%
- [ ] Verify low battery warning appears: `🔋 Low battery: XX%`
- [ ] Confirm warning appears in event log

#### Test 1.6: Manual Source Switch
- [ ] Open browser console
- [ ] Execute: `window.mobilePowerAgent.switchDataSource('direct')`
- [ ] Verify source switches manually
- [ ] Execute: `window.mobilePowerAgent.switchDataSource('network')`
- [ ] Verify source switches back

---

### 2. Power Grid Data Switching Testing

#### Test 2.1: Data Source Configuration
- [ ] Verify `powerline-communication.js` has `dataSource` config
- [ ] Check default is `'network'`
- [ ] Verify `switchDataSource()` method exists

#### Test 2.2: Automatic Source Switching
- [ ] Unplug laptop (switch to battery)
- [ ] Verify PLC system switches to `'network'` source
- [ ] Check telemetry interval adjusted to 5 seconds
- [ ] Plug in laptop (switch to charging)
- [ ] Verify PLC system switches to `'direct'` source
- [ ] Check telemetry interval adjusted to 3 seconds

#### Test 2.3: Telemetry Interval Adjustment
- [ ] Monitor console for telemetry updates
- [ ] On battery: Count updates (should be ~every 5 seconds)
- [ ] Plugged in: Count updates (should be ~every 3 seconds)
- [ ] Verify faster polling when plugged in

#### Test 2.4: Source Change Events
- [ ] Listen for `plc:source-changed` events
- [ ] Switch between battery and charging
- [ ] Verify events fire correctly with proper data:
  - `oldSource`
  - `newSource`
  - `telemetryInterval`
  - `context`

#### Test 2.5: PLC System Status
- [ ] Execute: `window.plcSystem.getDataSource()`
- [ ] Verify returns correct source and description
- [ ] Execute: `window.plcSystem.getStatus()`
- [ ] Verify `dataSource` field is present and correct

---

### 3. Device Identification Testing

#### Test 3.1: Agent Initialization
- [ ] Open `aiGridLink.html`
- [ ] Check console for: `[DeviceIdentificationAgent] Loaded 12 device signatures`
- [ ] Verify: `[DeviceIdentificationAgent] ✓ Initialized successfully`

#### Test 3.2: Device Database
- [ ] Execute: `window.deviceIdentAgent.getDeviceDatabase()`
- [ ] Verify 12 device types are present:
  - [ ] Laptop Computer
  - [ ] Desktop Computer
  - [ ] LCD Monitor
  - [ ] LED Light Bulb
  - [ ] Refrigerator
  - [ ] Microwave Oven
  - [ ] Television
  - [ ] WiFi Router
  - [ ] HVAC System
  - [ ] Washing Machine
  - [ ] Laser Printer
  - [ ] Phone Charger

#### Test 3.3: Device Identification by Power Draw
- [ ] Wait for device discovery (30 seconds)
- [ ] Check console for identification messages:
  - `✓ Identified: [device] → [type] (XX%)`
- [ ] Verify confidence percentage is displayed
- [ ] Check only devices with ≥85% confidence are identified

#### Test 3.4: Unknown Device Detection
- [ ] Add a device with unusual power signature
- [ ] Verify console shows: `? Unknown device: [name]`
- [ ] Check device appears in unknown devices list
- [ ] Verify learning mode captures the device

#### Test 3.5: Identification Results
- [ ] Execute: `window.deviceIdentAgent.getIdentificationResults()`
- [ ] Verify returns object with:
  - `identified` array
  - `unknown` array
  - `databaseSize`
  - `confidenceThreshold` (0.85)

#### Test 3.6: Learning Mode
- [ ] Execute: `window.deviceIdentAgent.enableLearning()`
- [ ] Verify console shows: `Learning mode enabled`
- [ ] Check unknown devices are tracked
- [ ] Execute: `window.deviceIdentAgent.disableLearning()`
- [ ] Verify learning mode turns off

#### Test 3.7: Real-time Monitoring
- [ ] Monitor console output every 10 seconds
- [ ] Verify device analysis runs periodically
- [ ] Check that already-identified devices aren't re-analyzed

---

### 4. Echo Script Injection Testing

#### Test 4.1: Agent Initialization
- [ ] Open `aiGridLink.html`
- [ ] Check console for: `[EchoScriptInjectionAgent] ✓ Initialized successfully`
- [ ] Verify queue processing starts

#### Test 4.2: Command Types
- [ ] Execute: `window.echoScriptAgent.getCommandTypes()`
- [ ] Verify 15 command types returned:
  - [ ] power
  - [ ] telemetry
  - [ ] config
  - [ ] automation
  - [ ] echo
  - [ ] network
  - [ ] status
  - [ ] reboot
  - [ ] update
  - [ ] security
  - [ ] diagnostic
  - [ ] logging
  - [ ] alert
  - [ ] schedule
  - [ ] batch

#### Test 4.3: Script Safety Validation - Dangerous Patterns
- [ ] Try injecting: `rm -rf /`
  - [ ] Verify rejected with error
- [ ] Try injecting: `eval(malicious_code)`
  - [ ] Verify rejected with error
- [ ] Try injecting: `<script>alert('xss')</script>`
  - [ ] Verify rejected with error

#### Test 4.4: Script Injection Success
- [ ] Execute valid script:
  ```javascript
  window.echoScriptAgent.injectScript(
    'plc-device-1',
    'power',
    'power-on',
    {}
  )
  ```
- [ ] Verify script ID returned
- [ ] Check console: `Script injected: script-XXX (power)`

#### Test 4.5: Script Queue Processing
- [ ] Inject multiple scripts rapidly
- [ ] Execute: `window.echoScriptAgent.getQueueStatus()`
- [ ] Verify queue length increases
- [ ] Watch console for execution messages
- [ ] Verify scripts execute sequentially

#### Test 4.6: Script Execution Confirmation
- [ ] Wait for script to execute
- [ ] Check console: `✓ Script completed: script-XXX (XXXms)`
- [ ] Verify execution time is logged
- [ ] Check UI event log for completion message

#### Test 4.7: Script Execution History
- [ ] Execute: `window.echoScriptAgent.getExecutionHistory()`
- [ ] Verify completed scripts appear
- [ ] Check each entry has:
  - `id`
  - `deviceId`
  - `commandType`
  - `status`
  - `executionTime`
  - `result`

#### Test 4.8: Script Failure & Retry
- [ ] Inject script to non-existent device
- [ ] Verify failure logged
- [ ] Check retry attempts (max 3)
- [ ] Verify final failure status after retries

#### Test 4.9: Script Warnings
- [ ] Inject script with warning trigger (e.g., `power-off`)
- [ ] Verify warning logged: `⚠ Script warnings: ...`
- [ ] Try without `force: true` - should require confirmation
- [ ] Try with `force: true` - should execute

---

### 5. Agent Deployment Dashboard Testing

#### Test 5.1: Dashboard Access
- [ ] Open `agent-plc-dashboard.html`
- [ ] Verify page loads without errors
- [ ] Check all sections render:
  - [ ] Agent Health Cards (3 cards)
  - [ ] Device Identification Results
  - [ ] Echo Script Execution History
  - [ ] Manual Script Injection Form

#### Test 5.2: Agent Health Cards
- [ ] Verify 3 agent cards display:
  - [ ] 🔋 Mobile Power Grid Agent
  - [ ] 🔍 Device Identification Agent
  - [ ] 💉 Echo Script Injection Agent
- [ ] Check each card shows:
  - [ ] Status (healthy/initializing/error)
  - [ ] 4 metrics
  - [ ] Action buttons (Details, Restart)

#### Test 5.3: Real-time Updates
- [ ] Watch agent cards for 10 seconds
- [ ] Verify metrics update automatically
- [ ] Change power source (battery/charging)
- [ ] Check mobile power card updates

#### Test 5.4: Device Identification Display
- [ ] Wait for devices to be identified
- [ ] Verify they appear in the list
- [ ] Check each device shows:
  - [ ] Icon
  - [ ] Device name
  - [ ] Identified type
  - [ ] Confidence percentage

#### Test 5.5: Script History Display
- [ ] Execute some scripts
- [ ] Verify they appear in history
- [ ] Check each entry shows:
  - [ ] Script ID
  - [ ] Status badge (completed/failed)
  - [ ] Device ID
  - [ ] Command type
  - [ ] Execution time

#### Test 5.6: Manual Script Injection Form
- [ ] Check device dropdown is populated
- [ ] Check command type dropdown has 15 types
- [ ] Enter a script
- [ ] Submit form
- [ ] Verify script injects successfully
- [ ] Check form clears after submission

#### Test 5.7: Dashboard Auto-refresh
- [ ] Watch dashboard for 30 seconds
- [ ] Verify it updates every 5 seconds
- [ ] Check no console errors during refresh

---

### 6. End-to-End Integration Testing

#### Test 6.1: Full System Startup
- [ ] Clear browser cache
- [ ] Open `aiGridLink.html`
- [ ] Verify initialization sequence:
  1. [ ] PLC system initializes
  2. [ ] Mobile Power Agent initializes
  3. [ ] Device Identification Agent initializes
  4. [ ] Echo Script Agent initializes
  5. [ ] Event: `agents-initialized` fires
- [ ] Check no console errors

#### Test 6.2: Mobile to Desktop Scenario
- [ ] Start on laptop (battery)
- [ ] Verify network data source active
- [ ] Plug in laptop
- [ ] Verify switch to direct power grid data
- [ ] Check telemetry interval changes
- [ ] Verify device identification continues

#### Test 6.3: Device Discovery & Identification Flow
- [ ] Start system
- [ ] Wait for PLC device discovery (30 seconds)
- [ ] Watch device identification process
- [ ] Verify identified devices logged
- [ ] Check dashboard shows results
- [ ] Verify confidence thresholds enforced

#### Test 6.4: Script Injection Flow
- [ ] Open dashboard
- [ ] Select a device
- [ ] Choose command type
- [ ] Enter script
- [ ] Submit
- [ ] Verify script queues
- [ ] Watch execution
- [ ] Check result appears in history

#### Test 6.5: Multi-Agent Coordination
- [ ] Change power source (battery/charging)
- [ ] Verify mobile power agent detects change
- [ ] Check PLC system switches data source
- [ ] Verify device identification continues
- [ ] Inject a script
- [ ] Verify script execution unaffected by source change

#### Test 6.6: Error Recovery
- [ ] Simulate network error
- [ ] Verify agents continue running
- [ ] Check retry mechanisms work
- [ ] Verify error messages logged
- [ ] Confirm system recovers gracefully

---

## Performance Testing

### 7.1 Load Testing
- [ ] Add 50+ simulated devices
- [ ] Verify identification agent handles load
- [ ] Check memory usage stays reasonable (<100MB)
- [ ] Monitor CPU usage (<20% average)

### 7.2 Script Queue Stress Test
- [ ] Inject 100 scripts rapidly
- [ ] Verify queue processes without errors
- [ ] Check max queue size enforced (100)
- [ ] Verify no memory leaks

### 7.3 Battery Monitoring Performance
- [ ] Run for 1 hour
- [ ] Verify continuous monitoring
- [ ] Check event handlers don't accumulate
- [ ] Verify memory stable

---

## Browser Compatibility Testing

### 8.1 Chrome
- [ ] Test all features
- [ ] Verify Battery API works
- [ ] Check console output
- [ ] Test dashboard

### 8.2 Firefox
- [ ] Test all features
- [ ] Note: Battery API may not be available
- [ ] Verify fallback works
- [ ] Test dashboard

### 8.3 Safari
- [ ] Test all features
- [ ] Note: Battery API not supported
- [ ] Verify desktop assumption works
- [ ] Test dashboard

### 8.4 Edge
- [ ] Test all features
- [ ] Verify Battery API works
- [ ] Test dashboard

### 8.5 Mobile Chrome (Android)
- [ ] Test on mobile device
- [ ] Verify battery detection works
- [ ] Test power source switching
- [ ] Check responsive layout

---

## Security Testing

### 9.1 Script Safety Validation
- [ ] Test all blacklist patterns
- [ ] Verify dangerous commands blocked
- [ ] Test XSS attempts blocked
- [ ] Verify script length limit (10,000 chars)

### 9.2 Input Sanitization
- [ ] Test special characters in scripts
- [ ] Test unicode control characters
- [ ] Verify all inputs validated

---

## Documentation Testing

### 10.1 Code Comments
- [ ] Verify all agents have JSDoc comments
- [ ] Check method documentation
- [ ] Verify parameter descriptions

### 10.2 README Documentation
- [ ] Verify Phase 8 documentation exists
- [ ] Check API references complete
- [ ] Verify usage examples work

---

## Known Issues & Limitations

### Current Limitations
1. **Battery API Support**
   - Not available in Safari
   - Limited support in Firefox
   - Desktop fallback assumes "plugged in"

2. **Simulated Data**
   - Device identification uses simulated power data
   - Real power monitoring requires hardware integration

3. **Script Execution**
   - Currently simulated for devices without real PLC connection
   - Production requires actual device communication

### Future Enhancements
- [ ] Real hardware PLC adapter integration
- [ ] Cloud backend for data synchronization
- [ ] Mobile app for remote monitoring
- [ ] Advanced ML for device identification
- [ ] Automated script templates
- [ ] Multi-user dashboard support

---

## Testing Summary Template

### Test Run Information
- **Date**: _____________
- **Tester**: _____________
- **Browser**: _____________
- **Device**: _____________

### Results
- **Tests Passed**: ____ / ____
- **Tests Failed**: ____ / ____
- **Critical Issues**: ____ 
- **Minor Issues**: ____

### Notes
_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________

---

## Conclusion

This comprehensive testing checklist ensures all components of the AI Grid Link PLC enhancement system work correctly. All tests should pass before considering the system production-ready.

**Next Steps**:
1. Complete all testing scenarios
2. Document any failures
3. Fix identified issues
4. Re-test after fixes
5. Deploy to production

---

**Document Version**: 1.0  
**Last Updated**: February 2, 2026  
**Maintained By**: Barbrick Design Team
