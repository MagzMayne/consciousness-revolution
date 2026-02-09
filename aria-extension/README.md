# ARIA - AI Response & Insight Archiver

**Version:** 1.0.0
**Status:** Beta
**Created:** 2026-02-07

A Chrome browser extension for capturing, organizing, and exporting code blocks from AI platforms.

## Features

- **Auto-Detection:** Works on Claude, ChatGPT, DeepSeek, Gemini, and Copilot
- **One-Click Capture:** ARIA button appears on every code block
- **Smart Parsing:** Auto-detects language and suggests filenames
- **Batch Export:** Export all captured blocks as JSON or ZIP
- **Chi Aesthetic:** Beautiful cyan/magenta dark theme

## Supported Platforms

| Platform | URL | Status |
|----------|-----|--------|
| Claude | claude.ai | Full Support |
| ChatGPT | chat.openai.com, chatgpt.com | Full Support |
| DeepSeek | chat.deepseek.com | Full Support |
| Gemini | gemini.google.com | Full Support |
| Copilot | copilot.microsoft.com | Full Support |

## Installation

### From Source (Developer Mode)

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right)
4. Click "Load unpacked"
5. Select the `aria-extension` folder
6. The ARIA icon appears in your toolbar

### From ZIP

1. Download `aria-extension.zip`
2. Extract to a folder
3. Follow steps 2-6 above

## Usage

### Capturing Code

1. Visit any supported AI platform
2. Generate a response with code blocks
3. Click the **ARIA** button on any code block
4. Block is saved to your capture queue

### Viewing Captured Blocks

1. Click the ARIA icon in your toolbar
2. See stats and recent captures
3. Click items to view details

### Exporting

- **JSON:** Complete export with metadata
- **ZIP:** Individual files named by detected language

### Clearing Data

Click "Clear All" in the popup to remove all captured blocks.

## File Structure

```
aria-extension/
├── manifest.json          # Extension config
├── README.md              # This file
├── background/
│   └── service-worker.js  # Background script
├── content/
│   ├── detector.js        # Platform detection
│   ├── parser.js          # Code parsing
│   └── injector.js        # UI injection
├── popup/
│   ├── popup.html         # Popup UI
│   ├── popup.css          # Popup styles
│   └── popup.js           # Popup logic
├── styles/
│   └── injected.css       # Page styles
└── icons/
    ├── aria-16.png
    ├── aria-48.png
    └── aria-128.png
```

## Architecture

```
[AI Platform Page]
       ↓
[Content Scripts]
  detector.js → Finds code blocks
  parser.js   → Extracts metadata
  injector.js → Adds ARIA buttons
       ↓
[Service Worker]
  Stores blocks in chrome.storage
       ↓
[Popup UI]
  View, export, manage captures
```

## Pattern Theory Alignment

- **Builder Pattern:** 94%
- **Consciousness Impact:** Reduces friction in knowledge transfer
- **Mission Fit:** Completes the loop (AI generates → ARIA captures → Cyclotron stores)

## Contributing

Report bugs and feature requests at:
https://conciousnessrevolution.io/bugs.html

## License

MIT License - Part of the Consciousness Revolution

---

Built with consciousness by the 100X team.
*C1 × C2 × C3 = ∞*
