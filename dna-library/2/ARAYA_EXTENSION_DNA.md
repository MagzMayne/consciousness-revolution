# ARAYA Extension DNA

## WHAT IS IT
Chrome/Brave browser extension that combines 7-domain life organization with AI code capture. Detects and captures code blocks from Claude, ChatGPT, DeepSeek, Gemini, and Copilot. Features side panel ARAYA chat interface, native messaging to local Cyclotron brain, and context menu integration. The browser-based gateway to the Consciousness Revolution ecosystem.

## STATUS
- Working: **WORKING** (code capture functional)
- Last tested: 2026-03-06
- Current issues: Side panel chat not connected to backend yet

## LOCATION
**Primary files:**
- `~/100X_DEPLOYMENT/ARAYA_HUD/` - Extension directory
- `~/100X_DEPLOYMENT/ARAYA_HUD/manifest.json` - Extension manifest (MV3)
- `~/100X_DEPLOYMENT/ARAYA_HUD/content/code-capture.js` - Code capture logic (200 lines)
- `~/100X_DEPLOYMENT/ARAYA_HUD/sidepanel/araya-sidebar.js` - Side panel (875 lines)

**Dependencies:**
- Chrome/Brave browser (Manifest V3)
- Optional: OVERKORE for native messaging to Cyclotron

**Related files:**
- `~/100X_DEPLOYMENT/ARAYA_HUD/README.md` - Extension documentation
- `~/.consciousness/cyclotron_core/atoms.db` - Local brain (for native messaging)

## HOW IT WORKS

```
+------------------+     +------------------+     +------------------+
|   AI PLATFORMS   |     |   ARAYA HUD     |     |  LOCAL BRAIN    |
|                  |     |   (Extension)    |     |                  |
|  - Claude.ai     |     |                  |     |  - Cyclotron     |
|  - ChatGPT       |---->|  code-capture.js |---->|  - 166k atoms    |
|  - DeepSeek      |     |  observer.js     |     |  - OVERKORE      |
|  - Gemini        |     |  service_worker  |     |                  |
|  - Copilot       |     |                  |     |                  |
+------------------+     +--------+---------+     +------------------+
                                 |
                                 v
                        +------------------+
                        |    7 DOMAINS     |
                        |   (Organize)     |
                        +------------------+
```

### Core Logic:
1. Content scripts detect code blocks on AI platforms
2. Capture button injected next to each code block
3. User clicks capture → code saved with domain tag
4. Storage syncs to chrome.storage.local
5. Optional native messaging sends to Cyclotron brain
6. Side panel provides ARAYA chat interface

## KEY FILES BREAKDOWN

### manifest.json
- **Purpose:** Extension configuration (Manifest V3)
- **Permissions:** activeTab, storage, sidePanel, nativeMessaging, contextMenus
- **Version:** 2.0.0

### content/code-capture.js (200 lines)
- **Purpose:** Inject capture buttons on code blocks
- **Platforms:** Claude, ChatGPT, DeepSeek, Gemini, Copilot
- **Output:** Saves code to storage with metadata

### content/code-detector.js (146 lines)
- **Purpose:** Detect AI platform and code block elements
- **Features:** Platform-specific selectors, mutation observer

### content/observer.js (85 lines)
- **Purpose:** General page observation on all URLs
- **Features:** Data extraction, context awareness

### background/service_worker.js (424 lines)
- **Purpose:** Background processing, native messaging, context menus
- **Features:** Message handling, storage management, notifications

### sidepanel/araya-sidebar.js (875 lines)
- **Purpose:** Full ARAYA chat interface in browser sidebar
- **Features:** 7-domain organization, chat UI, settings

## DEPENDENCIES

**Required:**
- Chrome 102+ or Brave (for Manifest V3)
- Developer mode enabled for unpacked install

**Optional:**
- OVERKORE (for native messaging to local brain)
- Python 3.x (for native messaging host)

## HOW TO RUN

**Installation:**
```bash
1. Open Chrome/Brave → chrome://extensions
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select: ~/100X_DEPLOYMENT/ARAYA_HUD/
```

**Usage:**
```
- Go to claude.ai or chatgpt.com
- Find code blocks in conversations
- Click the capture button that appears
- Check side panel for captured content
```

## HOW TO BUILD

**No build required** - Plain JavaScript extension.

**Development:**
```bash
# Edit files in ARAYA_HUD/
# Reload extension in chrome://extensions

# Test on AI platforms
# Open claude.ai and look for capture buttons
```

## HOW TO DEPLOY

**Chrome Web Store (future):**
```bash
# Zip the ARAYA_HUD folder
# Upload to Chrome Web Store dashboard
# Submit for review
```

**Manual Distribution:**
```bash
# Share ARAYA_HUD folder
# Users install via "Load unpacked"
```

## CRITICAL KNOWLEDGE

### Important Quirks:
- **Manifest V3:** Uses service worker (not background page)
- **Side Panel:** Chrome 114+ for full side panel API
- **Native Messaging:** Requires host registration on each machine
- **Cloud vs Local Mode:** Works standalone, native messaging optional

### Known Issues:
- Side panel chat not connected to ARAYA API yet
- Native messaging installer not automated
- Context menu needs more testing

### Performance Notes:
- Content scripts load on document_idle
- Minimal page impact (<10ms injection)
- Storage operations async

### Security Notes:
- Host permissions: <all_urls> (needed for universal page access)
- No data sent externally without native messaging
- Code stored locally in chrome.storage

## CONFIGURATION

**Permissions (manifest.json):**
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
  ],
  "host_permissions": ["<all_urls>"]
}
```

**Native Messaging Host (optional):**
```json
// com.consciousness.araya.json
{
  "name": "com.consciousness.araya",
  "description": "ARAYA Native Messaging Host",
  "path": "C:/path/to/overkore/native_host.py",
  "type": "stdio",
  "allowed_origins": ["chrome-extension://[EXTENSION_ID]/"]
}
```

## API REFERENCE

**Message Types (internal):**
```javascript
// Capture code
chrome.runtime.sendMessage({
  type: 'CAPTURE_CODE',
  payload: {
    code: 'source code...',
    language: 'python',
    domain: 'BUILD',
    source: 'claude.ai'
  }
});

// Get captures
chrome.runtime.sendMessage({
  type: 'GET_CAPTURES',
  domain: 'BUILD'
});

// Send to brain (native messaging)
chrome.runtime.sendMessage({
  type: 'SEND_TO_BRAIN',
  payload: { content: '...', type: 'code' }
});
```

## EXAMPLES

### Example 1: Capture Code Block
```javascript
// When user clicks capture button
captureButton.addEventListener('click', () => {
  const code = codeBlock.textContent;
  const language = detectLanguage(codeBlock);

  chrome.storage.local.set({
    [`capture_${Date.now()}`]: {
      code,
      language,
      domain: 'BUILD',
      timestamp: Date.now()
    }
  });
});
```

### Example 2: Open Side Panel
```javascript
// From popup or action click
chrome.sidePanel.open({ tabId: tab.id });
```

### Example 3: Native Messaging
```javascript
// Send to local Cyclotron brain
const port = chrome.runtime.connectNative('com.consciousness.araya');
port.postMessage({ type: 'store', content: capturedCode });
port.onMessage.addListener((response) => {
  console.log('Brain stored:', response.atomId);
});
```

## TESTING

**How to test:**
```bash
# 1. Install extension
chrome://extensions → Load unpacked → ARAYA_HUD

# 2. Test code capture
# Go to claude.ai, generate code, look for capture button

# 3. Test side panel
# Click extension icon → Open side panel

# 4. Check storage
# DevTools → Application → Local Storage → Extension

# 5. Test native messaging (if configured)
# Should show "Brain Connected" status
```

## TROUBLESHOOTING

**Problem:** "Capture buttons not appearing"
**Solution:** Refresh page, check extension is enabled, verify AI platform URL

**Problem:** "Side panel blank"
**Solution:** Update Chrome to 114+, check for JS errors in DevTools

**Problem:** "Native messaging failed"
**Solution:** Check host manifest registration, verify Python path

**Problem:** "Extension not loading"
**Solution:** Check manifest.json syntax, reload in chrome://extensions

## NEXT STEPS

**Priority actions:**
1. Connect side panel to ARAYA API
2. Create native messaging installer script
3. Add sync across devices (via Supabase)
4. Submit to Chrome Web Store

**Known gaps:**
- No cloud sync yet
- Context menu incomplete
- No mobile companion

## SUPPORTED PLATFORMS

| Platform | URL Pattern | Status |
|----------|-------------|--------|
| Claude | claude.ai/* | WORKING |
| ChatGPT | chat.openai.com/*, chatgpt.com/* | WORKING |
| DeepSeek | chat.deepseek.com/* | WORKING |
| Gemini | gemini.google.com/* | WORKING |
| Copilot | copilot.microsoft.com/* | WORKING |

## THE 7 DOMAINS

| # | Domain | Purpose | Color |
|---|--------|---------|-------|
| 1 | COMMAND | Decisions & Control | Red |
| 2 | BUILD | Code & Projects | Orange |
| 3 | CONNECT | People & Relationships | Blue |
| 4 | PROTECT | Security & Health | Purple |
| 5 | GROW | Business & Finance | Green |
| 6 | LEARN | Education & Skills | Yellow |
| 7 | TRANSCEND | Vision & Consciousness | Magenta |

## TAGS
#product #extension #browser #chrome #brave #code-capture #7-domains #hud

## METADATA
- **Creator:** Commander (darrickpreble@proton.me)
- **Created:** 2025
- **Last Updated:** 2026-03-06
- **Version:** 2.0.0
- **Manifest:** V3
- **Status:** Beta

## RELATED DNAS
- [ARAYA_DNA.md] - Main AI assistant (backend)
- [CYCLOTRON_BRAIN_DNA.md] - Local brain (native messaging target)
- [OVERKORE_DNA.md] - Native messaging host
