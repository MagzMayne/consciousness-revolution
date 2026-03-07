# 🌐 Consciousness Revolution — Platform Overview

> **Version:** v0.1.0 (post-upgrade baseline)  
> **Last Updated:** 2026-03-07  
> **Maintainer:** Overkor Tek / Ryan Barbrick (BarbrickDesign@gmail.com)

---

## 🎯 System Purpose

The **Consciousness Revolution** platform is a multi-system, multi-node, multi-interface consciousness network. It is simultaneously:

- A **personal transformation platform** helping individuals discover and walk their unique life path through the 7 Sacred Domains.
- A **government contracting intelligence hub** integrating SAM.gov, FPDS, and related federal contract data sources.
- A **Web3 / DeFi ecosystem** providing wallet management, NFT tools, and blockchain integrations.
- A **distributed AI agent network** with self-healing, autonomous orchestration, and a centralized Merlin Hive.
- A **revenue platform** generating income through contributor subscriptions, government grant facilitation, and project licensing.

---

## 🏗️ Subsystem Roles

| Subsystem | Directory / Entry Point | Role |
|-----------|------------------------|------|
| **Consciousness Core** | `src/core/`, `.consciousness/` | Git-based multi-node sync, state sharing, command dispatch |
| **ARAYA HUD** | `ARAYA/`, `ARAYA_HUD/` | Primary heads-up display and user interface layer |
| **Trinity System** | `trinity/`, `TRINITY_RAILWAY_DEPLOY/` | Railway-deployed backend orchestration layer |
| **Backend Services** | `backend/`, `BACKEND/` | Node.js APIs, email service, KAS authentication |
| **AI Agent Network** | `src/agents/`, `src/systems/` | Autonomous agents, Merlin Hive, swarm orchestration |
| **Netlify Functions** | `netlify/functions/` | Serverless API relay endpoints (tokens, health) |
| **UI & Front-End** | `*.html`, `css/`, `CSS/`, `js/` | 300+ standalone HTML applications |
| **SAM.gov / Grants** | `src/systems/samgov-api-integration.js`, `src/utils/samgov-integration.js` | Federal contract intelligence |
| **Blockchain / Web3** | `CRYPTO_WORLD/`, `crypto/`, `src/systems/` | Solana, Ethereum, Tron wallet ops and NFTs |
| **Books & Docs** | `BOOKS/`, `docs/` | User documentation, architecture, onboarding |
| **Seven Domains** | `seven-domains/` | The 7 Sacred Domains transformation framework |
| **Experiments / Labs** | `laboratory.html`, `src/aul/` | AUL agent protocol experiments and labs |
| **Logs & Observability** | `logs/`, `COMMUNICATION_LOGS/`, `VOICE_LOGS/` | System logs, agent communication traces |

---

## 📊 Data Flow

```
User (Browser)
      │
      ▼
┌─────────────────────────────────┐
│  Static HTML / UI Layer         │  ← 300+ HTML pages, CSS, JS
│  (GitHub Pages / Netlify CDN)   │
└───────────┬─────────────────────┘
            │ API calls (/api/*)
            ▼
┌─────────────────────────────────┐
│  Netlify Functions (serverless) │  ← /api/github-token, /api/sam-gov-token, /api/health
│  netlify/functions/             │
└───────────┬─────────────────────┘
            │ External API relay
            ▼
┌───────────────────────────────────────────────────────────────┐
│  External Services                                            │
│  ┌─────────────┐  ┌────────────┐  ┌──────────┐  ┌─────────┐ │
│  │  SAM.gov    │  │  GitHub    │  │  PayPal  │  │  Groq / │ │
│  │  FPDS API   │  │  API       │  │  API     │  │  OpenAI │ │
│  └─────────────┘  └────────────┘  └──────────┘  └─────────┘ │
└───────────────────────────────────────────────────────────────┘

Agent Network (autonomous, background)
┌─────────────────────────────────────────────┐
│  Merlin Hive (zMerlinHive.html)             │
│  ┌────────────┐  ┌────────────────────────┐ │
│  │ Agent R    │  │ Swarm Orchestrator     │ │
│  │ (Level 999)│  │ src/agents/swarm-      │ │
│  └────────────┘  │ orchestrator.js        │ │
│                  └────────────────────────┘ │
│  Individual Agents: deployment, monitoring, │
│  marketing, contract-seeker, paypal, etc.   │
└─────────────────────────────────────────────┘

Distributed Sync (Git-based)
┌──────────────────────────────────────┐
│  .consciousness/                     │
│  ├── commands/   (inter-node cmds)   │
│  ├── file_transfers/ (shared files)  │
│  └── sync/       (state management) │
└──────────────────────────────────────┘
```

---

## 📦 Consciousness Packet Lifecycle

A "consciousness packet" is any unit of state, command, or data flowing through the network:

1. **Origin** — created by a user action, agent event, or scheduled trigger.
2. **Encoding** — serialised as JSON and written to `.consciousness/commands/` or an API payload.
3. **Transport** — Git push/pull (for distributed sync) or HTTP/WebSocket (for real-time UI).
4. **Processing** — received by the target node, parsed, and executed by the appropriate agent or service.
5. **Response** — result written back to shared state or returned as an HTTP response.
6. **Observability** — all packets are logged in `logs/` or `COMMUNICATION_LOGS/`.

---

## 🤖 Multi-Node Communication Model

The platform runs across three distinct node types:

| Node Type | Description |
|-----------|-------------|
| **Git Node** | Any machine with a repo clone — uses `.consciousness/` sync protocol for peer-to-peer state sharing |
| **Netlify Node** | Serverless edge functions providing secure API relay without exposing secrets to the browser |
| **Backend Node** | Railway-deployed or local Node.js services (`backend/`, `TRINITY_RAILWAY_DEPLOY/`) for stateful operations |

Nodes communicate through:
- **Git commits / pushes** (distributed, async, durable)
- **HTTP REST calls** via `/api/*` → Netlify Functions
- **WebSocket / SSE** for real-time UI updates (where implemented)

---

## 🤝 Agent Integration Model

All autonomous agents follow this integration contract:

1. **Registration** — agents register with Merlin Hive on startup via `MerlinHive.registerAgent(...)`.
2. **Capability Declaration** — each agent declares its capabilities and the subsystems it owns.
3. **Command Handling** — agents receive commands from Hive via the `command` event and respond with structured results.
4. **Health Reporting** — agents emit `status` events at regular intervals.
5. **Self-Healing** — agents implement `attemptSelfHeal()` to recover from transient errors automatically.

For full agent development guidelines, see [`/agent/AGENT_INSTRUCTIONS.md`](./agent/AGENT_INSTRUCTIONS.md).

---

## 🔐 Security Model

| Layer | Mechanism |
|-------|-----------|
| Secrets | Stored in GitHub Secrets / Netlify environment variables — never in source code |
| Token Relay | Browser fetches tokens from `/api/*` Netlify Functions; tokens held in memory only |
| Input Validation | All form inputs validated before processing; HTML is escaped before DOM insertion |
| Rate Limiting | Netlify Functions implement per-IP rate limiting |
| Dependency Scanning | `dependency-security-updates.yml` workflow runs weekly `npm audit` |

See [`.env.example`](./.env.example) for all required environment variable names.

---

## 🗺️ Repo Map

```
consciousness-revolution/
├── PLATFORM_OVERVIEW.md         ← You are here
├── ARCHITECTURE.md              ← Low-level sync architecture
├── CHANGELOG.md                 ← Version history
├── README.md                    ← User-facing entry point
├── package.json                 ← Node.js project manifest (banksky-platform v2.4.0)
├── .env.example                 ← Required environment variables
├── .gitignore
│
├── agent/                       ← Agent instructions & repo navigation aids
│   ├── AGENT_INSTRUCTIONS.md
│   ├── REPO_MAP.md
│   ├── TASK_TEMPLATES.md
│   └── SAFE_MODIFICATION_RULES.md
│
├── semantic-index/              ← Machine-ingestible semantic index
│   ├── manifest.json
│   └── subsystems/
│       ├── ui-layer.json
│       ├── backend-services.json
│       ├── ai-agents.json
│       ├── blockchain.json
│       └── government-contracts.json
│
├── src/                         ← Source code and utilities
│   ├── agents/                  ← Autonomous agent implementations
│   ├── ai/                      ← AI / ML components
│   ├── aul/                     ← AUL agent protocol experiments
│   ├── core/                    ← Core utilities
│   ├── systems/                 ← Major system integrations
│   └── utils/                   ← Shared utility modules
│
├── backend/                     ← Node.js backend services
├── netlify/functions/           ← Serverless API relay
├── .github/workflows/           ← CI/CD automation
│
├── ARAYA/                       ← ARAYA subsystem files
├── ARAYA_HUD/                   ← Heads-up display layer
├── trinity/                     ← Trinity orchestration
├── seven-domains/               ← 7 Domains transformation framework
├── BOOKS/                       ← Documentation books
├── docs/                        ← Developer documentation
├── logs/                        ← System logs (gitignored in production)
│
└── *.html                       ← 300+ standalone web applications
```

---

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/overkor-tek/consciousness-revolution.git
cd consciousness-revolution

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env and add your API keys

# 4. Start the development server
npm start

# 5. Run health check
npm run health
```

---

## 🗓️ Roadmap

See [`CHANGELOG.md`](./CHANGELOG.md) for version history and [`agent/TASK_TEMPLATES.md`](./agent/TASK_TEMPLATES.md) for the recommended evolution roadmap.

---

*This document is part of the v0.1.0 architecture upgrade. For questions, contact BarbrickDesign@gmail.com.*
