# Demos Guide - BarbrickDesign Portfolio

This guide explains how to use the demo files in this repository.

## 🚀 Quick Start

All demos work out-of-the-box! Simply open any HTML file in a modern browser.

### Featured Demos:

1. **OASIS Game** (`oasis.html`, `oasis-demo-ui.html`)
   - Full 3D browser game with mobile support
   - No installation required
   - Works offline after first load

2. **Merlin Value Tracker** (`merlin-value-demo.html`)
   - Development value tracking system
   - Real-time calculation of code value
   - Enhancement logging and export

3. **BankSky** (`BankSky.html`)
   - Blockchain vault launcher
   - Wallet integration (MetaMask, WalletConnect)
   - Demo mode available without any setup

4. **MandemOS** (`mandem.os/Mandemos-v2-main/index.html`)
   - Myth-based quest system
   - 50+ quests across 5 phases
   - AI Scrollbot chat integration

## 📋 Requirements

### Minimum Requirements:
- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Internet connection (for CDN resources)

### Optional for Enhanced Features:
- MetaMask extension (for wallet features)
- Personal API keys (for production use)

## 🎮 How to Use Each Demo

### OASIS Game Demo

**File**: `oasis-demo-ui.html`

1. Open the file in your browser
2. View the mobile UI demonstration
3. Click "Play OASIS Now" to launch the full game

**Full Game**: `oasis.html`

1. Open in browser
2. Use WASD keys to move (desktop)
3. Click to attack
4. On mobile, use touch controls automatically displayed

### Merlin Value Tracker

**File**: `merlin-value-demo.html`

1. Open in browser - scripts auto-initialize
2. Click "Refresh Statistics" to see current page value
3. Use "Start Enhancement Tracking" before making changes
4. Click "Complete Tracking" after changes to log value added
5. Export data with "Export Data" button

**Features**:
- Automatic code value calculation
- Real-time statistics
- Enhancement history
- Export to JSON

### BankSky Launcher

**File**: `BankSky.html`

**Demo Mode** (No Setup Required):
1. Open file in browser
2. Click "Demo Mode" button
3. Explore features with sample data

**Full Mode** (Requires API Keys):
1. Obtain free API keys:
   - Etherscan: https://etherscan.io/apis
   - CoinGecko: https://www.coingecko.com/en/api
2. Enter keys in the form
3. Click "Validate API Keys"
4. Connect wallet (MetaMask/WalletConnect)
5. Use full blockchain features

### MandemOS Quest System

**File**: `mandem.os/Mandemos-v2-main/index.html`

1. Open in browser
2. View the loading animation
3. Click on quests to start
4. Open Scrollbot chat to interact with AI
5. Complete quests to earn XP
6. Progress through 5 phases

## 🔧 Configuration

### Optional Configuration

**File**: `demo-data-config.json`

This file provides sample configuration but is NOT required. All demos work without it.

To customize:
1. Copy `demo-data-config.json`
2. Modify values as needed
3. Reference in your own projects

### API Keys

Several demos accept API keys for enhanced functionality:

**BankSky.html**:
- Etherscan API (blockchain data)
- CoinGecko API (price data)
- BlockCypher API (Bitcoin data)
- Pinata JWT (IPFS storage)

**Where to Get Keys**:
- Etherscan: https://etherscan.io/apis (free tier available)
- CoinGecko: https://www.coingecko.com/en/api (free tier available)
- BlockCypher: https://www.blockcypher.com/ (free tier available)
- Pinata: https://pinata.cloud/ (free tier available)

**Important**: Never commit API keys to version control. Use:
- Environment variables
- User input forms
- Secure key management systems

## 🧪 Testing Demos

### Browser Console

All demos include console logging. Open Developer Tools (F12) to see:
- Initialization messages
- Feature confirmations
- Error messages (if any)
- Performance metrics

### Mobile Testing

Many demos are mobile-optimized:

1. **Desktop Browser**: 
   - Open DevTools (F12)
   - Toggle device toolbar
   - Select mobile device

2. **Real Device**:
   - Serve files via local server
   - Access from mobile browser
   - Test touch controls

### Running Local Server

For development/testing:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (with http-server)
npx http-server -p 8000
```

Then visit: http://localhost:8000

## 📦 Dependencies

All dependencies are loaded via CDN or included inline:

### External CDN Resources:
- Three.js (3D graphics)
- Ethers.js (blockchain)
- WalletConnect (wallet integration)
- IPFS HTTP Client
- QRCode.js
- Google Fonts

### Local Scripts:
- `/js/merlin-value-tracker.js` ✅
- `/js/merlin-enhancement-tracker.js` ✅
- `/js/mobile-enhancer.js` ✅
- `/src/utils/paypal-integration.js` ✅
- `/self-healing.js` ✅

All local scripts are included in the repository.

## ❓ Troubleshooting

### Demo Won't Load

**Problem**: Blank page or errors
**Solutions**:
1. Check browser console (F12) for errors
2. Ensure JavaScript is enabled
3. Try different browser
4. Check internet connection (for CDN resources)

### API Features Not Working

**Problem**: Blockchain/API features failing
**Solutions**:
1. Use Demo Mode (if available)
2. Verify API keys are valid
3. Check API rate limits
4. Ensure wallet extension installed

### Mobile Controls Not Showing

**Problem**: Touch controls missing on mobile
**Solutions**:
1. Refresh page
2. Ensure viewport meta tag present
3. Check mobile detection in console
4. Try different mobile browser

## 🎯 Feature Status

| Demo | Status | Dependencies | API Keys |
|------|--------|-------------|----------|
| oasis-demo-ui.html | ✅ Working | None | None |
| oasis.html | ✅ Working | Three.js (CDN) | None |
| merlin-value-demo.html | ✅ Working | Local JS files | None |
| BankSky.html | ✅ Working | CDN + MetaMask | Optional |
| MandemOS v2 | ✅ Working | Google Fonts | None |
| MandemOS v3 | ✅ Working | Google Fonts | None |

## 📚 Additional Resources

- **Demo Status Report**: `DEMO_FUNCTIONALITY_STATUS.md`
- **Sample Config**: `demo-data-config.json`
- **Main README**: `README.md`

## 💡 Tips

1. **Performance**: Demos are optimized but may vary by device
2. **Browser**: Chrome/Edge recommended for best compatibility
3. **Mobile**: iOS Safari and Android Chrome fully supported
4. **Offline**: Most demos work offline after first load
5. **Extensions**: Disable ad blockers if features fail

## 🤝 Contributing

To add your own demo:
1. Follow existing file structure
2. Include all dependencies (inline or CDN)
3. Add fallback/demo modes
4. Document API requirements
5. Test on multiple browsers
6. Update this guide

## 📄 License

See repository LICENSE file for terms.

---

**Last Updated**: 2025-12-28  
**Status**: All demos verified working  
**Support**: Check console logs for troubleshooting
