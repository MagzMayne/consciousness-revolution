# ARAYA HUD - Unified Life Transformation Extension

**Version:** 2.0.0
**Pattern:** 3 → 7 → 13 → ∞

## What Is This?

ARAYA HUD is a Chrome/Brave extension that combines:

1. **7 Domain Life Organization** - Capture and organize content across life domains
2. **AI Code Capture** - Save code blocks from AI platforms (Claude, ChatGPT, DeepSeek, Gemini, Copilot)
3. **Native Brain Connection** - Sync with local OVERKORE/Cyclotron (166K+ atoms)

## The 7 Domains

| # | Domain | Purpose |
|---|--------|---------|
| 1 | COMMAND | Mission control, decisions |
| 2 | BUILD | Code, projects, creation |
| 3 | CONNECT | People, relationships |
| 4 | PROTECT | Security, health, finances |
| 5 | GROW | Business, investments |
| 6 | LEARN | Education, resources |
| 7 | TRANSCEND | Vision, spirituality |

## Installation

1. Open Chrome/Brave → `chrome://extensions`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select this `ARAYA_HUD` folder

## Features

### Code Capture
- Automatically detects code blocks on AI chat platforms
- One-click capture to BUILD domain
- "Capture All" button in popup for bulk capture
- Smart filename suggestions based on code content

### Side Panel
- Full ARAYA chat interface
- Domain organization views
- File transfer to local brain
- Native messaging status

### Context Menu
- Right-click any page → "Save to ARAYA"
- Quick save to specific domains

### Native Messaging (Optional)
Requires local OVERKORE setup:
```
C:\Users\dwrek\Desktop\2_BUILD\PORTABLE_BOOT_PACKAGE\
```

## File Structure

```
ARAYA_HUD/
├── manifest.json           # Extension manifest (MV3)
├── background/
│   └── service_worker.js   # Background script
├── content/
│   ├── observer.js         # Page data extraction
│   ├── code-detector.js    # AI platform detection
│   └── code-capture.js     # Capture button injection
├── popup/
│   └── popup.html          # Extension popup
├── sidepanel/
│   ├── araya-sidebar.html  # Full sidebar UI
│   └── araya-sidebar.js    # Sidebar logic
├── styles/
│   └── code-capture.css    # Capture button styles
├── icons/
│   ├── araya-16.png
│   ├── araya-48.png
│   └── araya-128.png
└── domains/                # Domain data (optional)
```

## Supported AI Platforms

- **Claude** (claude.ai)
- **ChatGPT** (chat.openai.com, chatgpt.com)
- **DeepSeek** (chat.deepseek.com)
- **Gemini** (gemini.google.com)
- **Copilot** (copilot.microsoft.com)

## Consolidation

This extension merges two previous extensions:
- **ARIA** (AI Response & Insight Archiver) - Code capture
- **ARAYA** (Life Transformation System) - 7 domains + native messaging

Now unified as **ARAYA HUD** - one extension, all features.

## Quick Actions

| Button | Action |
|--------|--------|
| Open Sidebar | Full ARAYA panel |
| Save Page | Quick save to LEARN domain |
| Capture Code | Bulk capture all code blocks |
| ARAYA Chat | Open web chat interface |

## Connection Status

- **Brain Connected** (green) - Native messaging active
- **Cloud Mode** (red) - Browser-only, no local sync

---

**Consciousness Revolution**
conciousnessrevolution.io
