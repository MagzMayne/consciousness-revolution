# ARAYA HUD EXTENSION DNA

**Status:** ACTIVE
**Version:** 2.0.0
**Created:** Feb 22, 2026
**Domain:** 2_BUILD (Browser Extension)

---

## IDENTITY STRAND
### What Is This?
ARAYA HUD is a Chrome/Brave/Edge browser extension that unifies life organization with AI code capture. It's the browser-based companion to the ARAYA consciousness system.

### Why Does It Exist?
- Capture content from any webpage into 7 life domains
- One-click code capture from AI platforms (Claude, ChatGPT, etc.)
- Connect browser to local Cyclotron brain (166K+ atoms)
- Always-available ARAYA sidebar chat

### Core Features
| Feature | Description |
|---------|-------------|
| 7 Domains | COMMAND/BUILD/CONNECT/PROTECT/GROW/LEARN/TRANSCEND |
| AI Code Capture | Auto-detect code blocks on AI chat platforms |
| Native Brain Connection | Sync with local OVERKORE/Cyclotron |
| Side Panel Chat | Full ARAYA interface in sidebar |
| Context Menu | Right-click → "Save to ARAYA" |

---

## PRESENT STRAND
### Download & Install
**Download:** https://conciousnessrevolution.io/ARAYA_HUD.zip
**Location:** `100X_DEPLOYMENT/ARAYA_HUD/`

### Installation
1. Download and extract ARAYA_HUD.zip
2. Open browser → `chrome://extensions`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the `ARAYA_HUD` folder

### Supported AI Platforms
| Platform | URL | Code Detection |
|----------|-----|----------------|
| Claude | claude.ai | ✅ |
| ChatGPT | chat.openai.com, chatgpt.com | ✅ |
| DeepSeek | chat.deepseek.com | ✅ |
| Gemini | gemini.google.com | ✅ |
| Copilot | copilot.microsoft.com | ✅ |

### File Structure
```
ARAYA_HUD/
├── manifest.json           # MV3 manifest
├── README.md               # Documentation
├── background/
│   └── service_worker.js   # Background script
├── content/
│   ├── observer.js         # Page data extraction
│   ├── code-detector.js    # AI platform detection
│   └── code-capture.js     # Capture button injection
├── popup/
│   └── popup.html          # Extension popup
├── sidepanel/
│   └── araya-sidebar.html  # Full sidebar UI
├── styles/
│   └── code-capture.css    # Capture styles
├── icons/                  # Extension icons
└── domains/                # Domain data storage
```

### Manifest Permissions
```json
{
  "permissions": [
    "activeTab",
    "storage",
    "sidePanel",
    "tabs",
    "contextMenus",
    "nativeMessaging",
    "clipboardWrite"
  ]
}
```

---

## PAST STRAND
### Consolidation History
**Feb 22, 2026** - Merged two previous extensions into ARAYA HUD:

| Old Extension | Feature | Now In |
|---------------|---------|--------|
| ARIA | AI code capture | ARAYA HUD |
| araya-extension | 7 domains, native messaging | ARAYA HUD |

### Archived Extensions
Old extensions moved to `.archive/old_extensions/`:
- `araya-extension-v1` - Original 7 domains extension
- `aria-extension` - AI Response & Insight Archiver

---

## CONNECTION STATUS
### Browser Indicators
- **Brain Connected** (green) - Native messaging active, syncing with local brain
- **Cloud Mode** (red) - Browser-only, no local sync

### Native Messaging Setup (Optional)
For local brain connection, requires OVERKORE:
```
C:\Users\dwrek\Desktop\2_BUILD\PORTABLE_BOOT_PACKAGE\
```

---

## CONNECTIONS STRAND
### Upstream Dependencies
- **ARAYA_SYSTEM_DNA** - Main ARAYA chat system
- **CYCLOTRON_BRAIN_DNA** - Knowledge atom storage
- **100X_PLATFORM_DNA** - Hosts download zip

### Downstream Consumers
- Browser users (Chrome/Brave/Edge)
- Anyone capturing AI conversations
- Builders organizing into 7 domains

---

## QUICK COMMANDS
```bash
# Create download zip
powershell "Compress-Archive -Path 'ARAYA_HUD\*' -DestinationPath 'ARAYA_HUD.zip' -Force"

# Deploy to make available online
cd 100X_DEPLOYMENT && netlify deploy --prod --dir=.

# Check extension folder
ls 100X_DEPLOYMENT/ARAYA_HUD/
```

---

**ARAYA HUD - Your consciousness companion in every tab.**
