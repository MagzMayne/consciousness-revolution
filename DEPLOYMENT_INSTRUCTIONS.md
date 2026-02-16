---
layout: default
title: DEPLOYMENT INSTRUCTIONS
---

# Nexus Orion Protocol - Deployment Instructions

## File Location
- **File**: `nexusOrionProtocol.html`
- **Repository**: barbrickdesign.github.io
- **Branch**: copilot/ensure-full-functionality

## Quick Start

### Option 1: GitHub Pages (Recommended)
1. Merge the PR to main branch
2. Access via: `https://barbrickdesign.github.io/nexusOrionProtocol.html`
3. Game will load automatically

### Option 2: Local Testing
```bash
# Navigate to the repository
cd barbrickdesign.github.io

# Start a simple HTTP server
python3 -m http.server 8000

# Open in browser
open http://localhost:8000/nexusOrionProtocol.html
```

### Option 3: Direct File
Simply open `nexusOrionProtocol.html` in any modern web browser.

## System Requirements

### Minimum Requirements
- **Browser**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **RAM**: 2GB
- **GPU**: Integrated graphics with WebGL support
- **Screen**: Any size (320px to 4K)

### Recommended
- **Browser**: Latest version of Chrome/Edge
- **RAM**: 4GB+
- **GPU**: Dedicated graphics card
- **Screen**: 1920x1080 or higher
- **Connection**: Not required (runs offline)

## Controls

### Desktop
- **W/↑**: Move forward
- **S/↓**: Move backward
- **A/←**: Move left
- **D/→**: Move right
- **Mouse**: Look around
- **Click**: Lock pointer
- **Space**: Deploy agent (via UI button)

### Mobile/Tablet
- **Touch & Drag**: Rotate camera
- **Touch**: Move forward
- **Tap Buttons**: Deploy agents, change modes

## Game Features

### Core Gameplay
1. **Exploration**: Move around the 3D environment
2. **Collection**: Gather resources (orbs, crystals, data, nano)
3. **Agents**: Deploy autonomous AI agents
4. **Modes**: Switch between 4 game modes

### Resources
- **Energy Orbs** (Orange): +100 score
- **Power Crystals** (Cyan): +100 score
- **Data Fragments** (Pink): +100 score
- **Nano Materials** (Purple): +100 score

### Game Modes
1. **Exploration**: Free roam and collect
2. **Combat**: Battle with agents
3. **Building**: Construction focus
4. **Racing**: Timed challenges

## Settings

### Graphics Quality
- **Low**: Best for older devices
- **Medium**: Balanced (default)
- **High**: Best visual quality

### Display Options
- **Enable Shadows**: Toggle shadow rendering
- **Max Agents**: 1-50 (default: 10)
- **Agent Speed**: 1-10 (default: 5)

## Performance Tips

### If FPS is Low
1. Set Graphics Quality to "Low"
2. Disable Shadows
3. Reduce Max Agents to 5 or less
4. Close other browser tabs
5. Use hardware acceleration in browser settings

### For Best Experience
1. Use Chrome or Edge browser
2. Enable hardware acceleration
3. Full-screen mode (F11)
4. Close background applications
5. Use graphics quality "High"

## Troubleshooting

### Black Screen on Load
- **Cause**: WebGL not supported
- **Solution**: Update browser or try different browser

### Touch Controls Not Working
- **Cause**: Browser blocking touch events
- **Solution**: Allow touch interactions when prompted

### Low FPS
- **Cause**: Device limitations
- **Solution**: Lower graphics settings

### Agents Not Moving
- **Cause**: Game not initialized
- **Solution**: Refresh page

## Mobile-Specific Notes

### iOS Devices
- Works on iOS 13+
- May need to add to home screen for full-screen
- Touch controls optimized for iPhone/iPad

### Android Devices
- Works on Chrome Mobile 80+
- Samsung Internet supported
- Touch controls optimized for all screen sizes

## Features Overview

### What's Included
✅ Full 3D environment with WebGL
✅ Autonomous AI agents
✅ 4 collectible types with physics
✅ 4 game modes
✅ Touch and keyboard controls
✅ Responsive design (all screens)
✅ Performance settings
✅ Real-time statistics
✅ Dynamic lighting and shadows
✅ Error handling

### What's NOT Included (Future)
❌ Multiplayer networking
❌ Blockchain/crypto integration
❌ Payment processing
❌ User accounts/authentication
❌ Save/load system
❌ Audio/sound effects

## File Structure

```
nexusOrionProtocol.html (42.3 KB)
├── HTML Structure
│   ├── Header with navigation
│   ├── Game canvas container
│   ├── Multiple game sections
│   └── Toast notification system
├── CSS Styling (responsive)
│   ├── Dark theme with neon accents
│   ├── 3 media query breakpoints
│   ├── Custom properties (CSS variables)
│   └── Animations and transitions
└── JavaScript (ES6+)
    ├── Utility functions
    ├── NexusOrionGame class
    ├── UI management functions
    ├── Event handlers
    └── Initialization code
```

## Dependencies

### External (CDN)
- **Three.js r128**: `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`

### Internal
- None (all code is self-contained)

## Browser Console

### Useful Commands
```javascript
// Check game instance
console.log(game);

// Check current stats
console.log(game.stats);

// Check collectibles
console.log(game.collectibles.length);

// Check agents
console.log(game.agents.length);

// Change game mode
switchGameMode('combat');
```

## Support

### Issues or Questions
- Check browser console for errors
- Ensure WebGL is enabled
- Try different browser
- Lower graphics settings
- Clear browser cache

### Known Limitations
- Single player only
- Client-side only (no server)
- No persistence (data lost on refresh)
- No audio (can be added)

## Updates

### Version History
- **v1.0** (Dec 23, 2025): Initial release
  - Full 3D environment
  - Agent system
  - Collectibles
  - Game modes
  - Mobile support

### Future Enhancements
- Multiplayer support
- Persistence/save system
- Additional game modes
- Sound effects and music
- More collectible types
- Enhanced AI behaviors

---

**Deployment Status**: ✅ Ready  
**Last Updated**: December 23, 2025  
**File Size**: 42.3 KB  
**Lines of Code**: 1,420  
**Dependencies**: 1 (Three.js CDN)
