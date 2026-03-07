# NEMO Conductor

**Source:** [overkillkulture/nemo-conductor](https://github.com/overkillkulture/nemo-conductor)

## What This Is

A visual dashboard for the 5-Key AI Council system. Five AI "council members" each with different personalities/roles answer queries in parallel, displayed in a 5-panel workspace.

### The 5 Council Members

| Key | Role | Personality |
|-----|------|-------------|
| **GHOST** | Predictive Intent | Pattern analysis, anticipates follow-ups |
| **ARCHITECT** | System Design | Architecture decisions, toolbox |
| **MONK** | Deep Reasoning | Logic chains, loop prevention |
| **SHADOW** | Chi Aesthetic | UI/UX consciousness, beauty |
| **OBSERVER** | Monitoring | Watchdog, edge cases, blind spots |

## Quick Access

- **[Council Workspace](council-workspace.html)** — 5-panel AI interface (works standalone in demo mode)

## How to Use

1. Open `council-workspace.html` in any browser
2. Type your question in the query bar
3. Click **ASK COUNCIL** — all 5 members respond simultaneously
4. To use live AI (vs demo mode): enter an OpenRouter API key (`sk-or-v1-...`)

## API Modes

### Demo Mode (default)
Works without any API key. Responses are locally generated with each council member's characteristic perspective.

### Live Mode
Enter an OpenRouter API key in the input field. Keys stay in memory only — never stored to localStorage or committed.

**Model:** `moonshotai/kimi-k2.5` (default)

## Architecture

- **Frontend:** Standalone HTML — works as a GitHub Pages static site
- **Backend (optional):** Express.js server at `https://nemo-conductor-production.up.railway.app`
- **API:** OpenRouter for 200+ LLM options

## Original Repository Structure

```
nemo-conductor/
├── gui/
│   ├── backend/
│   │   ├── server.js          ← Express API (Railway)
│   │   ├── package.json
│   │   └── council-keys.json
│   └── public/
│       ├── council-workspace.html  ← Main UI
│       ├── nemo-gui.js
│       └── index.html
├── manufacturing/
├── scripts/
└── DNA_BLUEPRINT.md
```

## Part of Consciousness Revolution
[← Back to Ingested Repos Hub](../../ingested-repos-hub.html)
