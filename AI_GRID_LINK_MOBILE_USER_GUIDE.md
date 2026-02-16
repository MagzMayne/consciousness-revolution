# AI Grid Link - Mobile Usage Guide

## Quick Start for Mobile Devices

This guide helps you use the AI Grid Link PLC enhancement system on mobile devices (laptops, tablets, smartphones).

---

## What is Mobile Power Detection?

The system automatically detects if your device is running on battery or plugged into power, and optimizes data collection accordingly:

- **On Battery** 🔋: Uses WiFi/PC grid data (slower updates to save battery)
- **Plugged In** ⚡: Uses direct power grid connection (faster updates)

---

## Getting Started

### Step 1: Open the Console
1. Navigate to `aiGridLink.html` in your mobile browser
2. Wait 3-5 seconds for the system to initialize
3. You'll see the Grid Neural Console interface

### Step 2: Watch for Power Detection
Look for these messages in the event log:

**On Laptop (Battery API Supported):**
- `✓ Mobile Power Grid Agent initialized`
- `⚡ Plugged in - Switched to direct data` (if plugged in)
- `⚡ On battery - Switched to network data` (if unplugged)

**On Desktop (No Battery):**
- `⚠ Battery API not available - assuming desktop/plugged in`
- System will use direct power grid data by default

---

## Using on a Laptop

### Scenario 1: Unplugging Your Laptop

1. **Before unplugging**: System uses direct power grid data
   - Telemetry updates every 3 seconds
   - Event log shows: `⚡ Plugged in`

2. **Unplug power cable**
   - System automatically detects change
   - Switches to network data source
   - Event log shows: `⚡ On battery - Switched to network data`
   - Telemetry now updates every 5 seconds (saves battery)

3. **Watch your battery level**
   - If battery drops below 20%, you'll see: `🔋 Low battery: 18%`
   - Consider plugging in to continue using direct power grid data

### Scenario 2: Plugging In Your Laptop

1. **While on battery**: System uses network data
   - Telemetry updates every 5 seconds
   - Event log shows: `⚡ On battery`

2. **Plug in power cable**
   - System automatically detects change
   - Switches to direct power grid data
   - Event log shows: `⚡ Plugged in - Switched to direct data`
   - Telemetry now updates every 3 seconds (faster)

---

## Battery Status Indicators

### Event Log Messages

| Message | Meaning |
|---------|---------|
| `⚡ Plugged in - Switched to direct data` | Power cable connected, using fast updates |
| `⚡ On battery - Switched to network data` | Running on battery, using slower updates |
| `🔋 Low battery: XX%` | Battery below 20%, consider plugging in |
| `⚠ Battery API not available` | Desktop or unsupported browser |

### Status Badge (Top Right)

- **Green**: System healthy, connected to devices
- **Yellow**: Initializing or warnings
- **Red**: System errors

---

## Browser Support

### Full Support (Battery API Available)
✅ **Chrome** (Desktop & Android)
- Full battery detection
- Automatic power source switching
- All features work

✅ **Microsoft Edge** (Desktop)
- Full battery detection
- Automatic power source switching
- All features work

### Limited Support
⚠️ **Firefox** (Desktop)
- Limited battery detection
- May not support all features
- Falls back to desktop mode

❌ **Safari** (Desktop & iOS)
- No battery detection
- Assumes desktop/plugged in
- All other features work

⚠️ **Mobile Chrome** (iOS)
- Limited battery detection on iOS
- Works better on Android
- Falls back gracefully

---

## Checking Your Power Status

### Via Console

Open browser console (F12) and type:

```javascript
// Get battery status
window.mobilePowerAgent.getBatteryStatus()

// Returns:
// {
//   supported: true,
//   charging: false,
//   level: 0.75,           // 75% battery
//   source: 'battery',
//   dataSource: 'network',
//   recommendation: {...}
// }
```

### Via Dashboard

1. Open `agent-plc-dashboard.html`
2. Look at the "Mobile Power Grid Agent" card
3. Check the metrics:
   - **Battery API**: Available or N/A
   - **Current Source**: battery or charging
   - **Data Source**: network or direct
   - **Monitoring**: Active or Inactive

---

## Manual Control

### Manually Switch Data Source

If you want to override automatic switching:

```javascript
// Switch to direct power grid (fast updates)
window.mobilePowerAgent.switchDataSource('direct')

// Switch to network data (slower updates)
window.mobilePowerAgent.switchDataSource('network')
```

### Check If On Battery

```javascript
// Returns true if on battery, false if plugged in
window.mobilePowerAgent.isOnBattery()

// Returns true if plugged in, false if on battery
window.mobilePowerAgent.isPluggedIn()
```

---

## Power Saving Tips

### When on Battery

The system automatically:
- ✅ Switches to network data source
- ✅ Reduces telemetry polling (5s instead of 3s)
- ✅ Uses less bandwidth
- ✅ Conserves device battery

### To Save More Battery

1. **Close the dashboard**: `agent-plc-dashboard.html` uses more resources
2. **Use the main console**: `aiGridLink.html` is more lightweight
3. **Disable learning mode** (if enabled):
   ```javascript
   window.deviceIdentAgent.disableLearning()
   ```

---

## Troubleshooting

### "Battery API not available"

**Cause**: Your browser doesn't support the Battery Status API.

**Solution**: 
- This is normal for Safari and some browsers
- System assumes you're on desktop/plugged in
- All other features still work
- No action needed

### Battery level not updating

**Cause**: Battery API may have limited support.

**Solution**:
- Verify you're using Chrome or Edge
- Check browser version is up to date
- Battery updates may be slow (every 30 seconds)

### System always shows "plugged in"

**Cause**: Desktop computer or API not available.

**Solution**:
- Desktop computers don't have batteries
- This is expected behavior
- System will use direct power grid data

### Low battery warnings too frequent

**Cause**: Battery below 20%.

**Solution**:
- Plug in your device
- Warning will stop when battery > 20%

---

## Mobile Best Practices

### For Laptops

1. ✅ **Let auto-switching work**: System optimizes automatically
2. ✅ **Monitor event log**: Watch for power source changes
3. ✅ **Use dashboard when plugged in**: Full features without battery drain
4. ✅ **Close unnecessary tabs**: Save battery

### For Tablets/Phones

1. ✅ **Use mobile browser**: Chrome for Android recommended
2. ✅ **Landscape mode**: Better dashboard viewing
3. ⚠️ **Limited functionality**: Some features may not work on mobile
4. ✅ **Check compatibility**: Verify browser supports required features

---

## Advanced Features

### Custom Battery Thresholds

Want to change when low battery warnings appear?

Edit the agent code (for developers):
```javascript
// In mobile-power-grid-agent.js
getRecommendation(state) {
  // Change 0.2 to your preferred threshold (e.g., 0.3 for 30%)
  const batteryWarning = state.level < 0.3 ? 'Low battery' : null;
  // ...
}
```

### Custom Telemetry Intervals

Want different polling rates?

Edit the PLC system code (for developers):
```javascript
// In powerline-communication.js
switchDataSource(source, context) {
  if (source === 'direct') {
    this.config.telemetryInterval = 2000; // 2 seconds (faster)
  } else {
    this.config.telemetryInterval = 10000; // 10 seconds (slower)
  }
}
```

---

## FAQ

**Q: Will this drain my battery faster?**  
A: No! The system is designed to conserve battery. When unplugged, it automatically reduces polling frequency.

**Q: Can I use this on my phone?**  
A: Yes, but some features may be limited. Works best on Android Chrome.

**Q: Does it work without Battery API?**  
A: Yes! System assumes you're plugged in and uses direct power grid data.

**Q: Can I force it to always use fast updates?**  
A: Yes, use `window.mobilePowerAgent.switchDataSource('direct')` in console.

**Q: Why does it say "Battery API not available"?**  
A: Your browser doesn't support it (Safari, older browsers). This is normal.

**Q: How do I check my current power status?**  
A: Use `window.mobilePowerAgent.getBatteryStatus()` in console or check the dashboard.

**Q: Can I disable automatic switching?**  
A: Not currently, but you can manually override it anytime with `switchDataSource()`.

---

## Getting Help

### Console Commands

Useful commands to check status:

```javascript
// Battery status
window.mobilePowerAgent.getBatteryStatus()

// Agent health
window.mobilePowerAgent.getHealth()

// PLC data source
window.plcSystem.getDataSource()

// Full system status
window.plcSystem.getStatus()
```

### Support Resources

- **Documentation**: See `AI_GRID_LINK_PLC_DOCUMENTATION.md`
- **Testing Guide**: See `AI_GRID_LINK_PLC_TESTING_CHECKLIST.md`
- **Email**: BarbrickDesign@gmail.com
- **GitHub**: [@barbrickdesign](https://github.com/barbrickdesign)

---

## Summary

✅ **Automatic Detection**: System detects battery vs plugged in  
✅ **Smart Switching**: Optimizes data source automatically  
✅ **Battery Saving**: Slower updates when on battery  
✅ **Fast Updates**: Faster updates when plugged in  
✅ **Universal**: Works on all devices, with or without Battery API  

**Enjoy using AI Grid Link on your mobile device!**

---

**Guide Version**: 1.0  
**Last Updated**: February 2, 2026  
**© 2024-2025 Barbrick Design**
