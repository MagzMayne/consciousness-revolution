# 🚀 Developer Launch Guide — Consciousness Revolution

> **Pattern**: 3 → 7 → 13 → ∞  
> **Site**: <https://barbrickdesign.github.io/>  
> **Repo**: <https://github.com/overkor-tek/consciousness-revolution>  
> **Contact**: BarbrickDesign@gmail.com

---

## Quick Start (5 minutes)

```bash
# 1. Clone the repo
git clone https://github.com/overkor-tek/consciousness-revolution
cd consciousness-revolution

# 2. Install Node dependencies
npm install

# 3. Start local dev server
npm start

# 4. Open the developer hub in your browser
open http://localhost:3000/dev-launch.html

# 5. Run tests to confirm everything is healthy
npm test
```

---

## 7 Forges Overview

The platform is organized into 7 Forges — each a sovereign domain of human capability.
Every tool in the repo belongs to exactly one forge.

| # | Forge | Domain | Hz | Archetype | Tools |
|---|-------|--------|----|-----------|-------|
| 1 | **Reality Forge** | Foundation & Systems | 396 Hz | The Warrior | ~64 |
| 2 | **Creation Forge** | Building & Making | 417 Hz | The Creator | ~741 |
| 3 | **Wealth Forge** | Abundance & Power | 528 Hz | The Sovereign | ~84 |
| 4 | **Guardian Forge** | Protection & Justice | 639 Hz | The Guardian | ~117 |
| 5 | **Signal Forge** | Communication & Truth | 741 Hz | The Messenger | ~223 |
| 6 | **Character Forge** | Pattern Recognition | 852 Hz | The Sage | ~198 |
| 7 | **Infinity Forge** | Consciousness | 963 Hz | The Mystic | ~24 |

**Total: 1450+ tools** — all standalone HTML files, no build step required. Run `node scripts/sync-forges.js --stats` for exact current counts.

---

## Key Entry Points

| Purpose | URL |
|---------|-----|
| Developer hub | `/dev-launch.html` |
| 7 Forges navigation | `/lobby.html` |
| Forge command center | `/forge-hub.html` |
| Main project gallery | `/index.html` |
| Merlin Hive AI | `/zMerlinHive.html` |
| LLM context file | `/llm-context.json` |
| Tools catalog | `/tools-catalog.json` |
| Platform manifest | `/semantic-index/manifest.json` |

---

## For LLM Integration

### Option 1: Use the pre-built context file

```js
const response = await fetch('/llm-context.json');
const context = await response.json();
// context.sevenForges — all 7 forges with tool counts and sample tools
// context.platform   — tech stack, entry points, author
// context.llmInstructions — how to work with the platform
```

### Option 2: Use the full tools catalog

```js
const response = await fetch('/tools-catalog.json');
const catalog = await response.json();
// catalog.meta         — generated date, total tools
// catalog.forges       — { 'reality-forge': { tools: [...] }, ... }
// catalog.quickIndex   — { 'filename.html': 'forge-id', ... }
```

### Option 3: Reference semantic-index

```js
const manifest = await fetch('/semantic-index/manifest.json').then(r => r.json());
// manifest.subsystems  — all subsystems including tools-catalog
// manifest.apiSurfaces — all Netlify function endpoints
// manifest.platform    — deployment targets, languages
```

---

## Adding New Tools

1. Drop your HTML file into the repo root
2. Run the sync script to catalog it:
   ```bash
   node scripts/sync-forges.js
   ```
3. Commit `tools-catalog.json` and `llm-context.json`
4. Your tool is now searchable in `dev-launch.html`

The sync script automatically assigns each tool to a forge based on keywords
in the filename. To override, add a meta tag to your HTML:

```html
<meta name="forge" content="wealth-forge">
```

---

## NPM Scripts Reference

```bash
npm start              # Start local dev server
npm test               # Run test suite (intent-engine, adapters, SDK)
npm run build          # Build for production
npm run sync:forges    # Regenerate tools-catalog.json + llm-context.json
npm run sync:forges:verify  # Verify catalog is up-to-date (CI-safe)
npm run health         # Backend health check
npm run backend        # Start backend services
npm run test:api       # Test API connections
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
# Required for payment flows
PAYPAL_CLIENT_ID=...
PAYPAL_API=...

# Required for GitHub API operations
GITHUB_TOKEN=...

# Required for contract/grant search
SAM_API_KEY=...

# Optional — enable AI features
OPENAI_API_KEY=...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

All secrets are relayed server-side through Netlify Functions. **Never hardcode
secrets in HTML or JS files.**

---

## Architecture

```
consciousness-revolution/
├── index.html              ← Main project gallery (GitHub Pages)
├── lobby.html              ← 7 Forges navigation hub
├── dev-launch.html         ← Developer launch hub (this guide's companion)
├── forge-hub.html          ← Forge command center
├── tools-catalog.json      ← Machine-readable tool registry
├── llm-context.json        ← Compact LLM context
├── config/
│   └── forge-config.json   ← 7 Forges metadata
├── scripts/
│   └── sync-forges.js      ← Tool catalog generator
├── semantic-index/
│   ├── manifest.json       ← Platform subsystem index
│   └── subsystems/         ← Per-subsystem manifests
│       └── tools-catalog.json
├── src/agents/             ← 34 autonomous agents
├── netlify/functions/      ← Serverless API endpoints
├── backend/                ← Node.js backend services
├── packages/               ← Shared SDK packages
│   ├── core-intent-engine/
│   ├── adapters/
│   └── sdk-js/
└── tests/                  ← Test suite
```

---

## CI/CD

All pull requests run automatically:

1. **Security & Quality Lint** — secret scanning, npm audit, JSON validation
2. **Test Suite** — intent-engine, adapters, SDK tests
3. **Build Validation** — confirms `npm run build` succeeds

The CI validates `semantic-index/manifest.json` and all subsystem JSONs on
every PR. Run `npm run sync:forges:verify` locally before pushing to ensure
`tools-catalog.json` is current.

---

## Agent System

The platform includes 34 autonomous agents orchestrated by **Merlin Hive**:

- Open `zMerlinHive.html` to activate the agent network
- Agent R (authority level 999) oversees all agents — see `agent-r-manifest.json`
- Agents self-heal, monitor health, and can autonomously fix common issues
- All agents follow the base class pattern in `src/agents/management-agent.js`

---

## Revenue Systems (Handle with Care)

These files are revenue-critical — test thoroughly before changing:

| File | Purpose |
|------|---------|
| `contributor-registration-enhanced.html` | PayPal contributor registration |
| `payroll-hub.html` | Payroll management |
| `government-grants-portal.html` | Grant matching & applications |
| `src/utils/paypal-integration.js` | PayPal SDK integration |
| `netlify/functions/paypal-payout.mjs` | PayPal payout endpoint |

Contact BarbrickDesign@gmail.com before deploying changes to payment flows.

---

*Maintained by Ryan Barbrick (Barbrick Design) · AI Assisted by Merlin AI*
