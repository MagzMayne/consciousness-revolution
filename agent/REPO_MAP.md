# 🗺️ Repository Map — Consciousness Revolution

This document provides a navigable map of the repository for AI agents and developers.

---

## Top-Level Structure

```
consciousness-revolution/
│
├── 📄 Key Entry Points
│   ├── index.html                   Main hub — all projects listed here
│   ├── BankSky.html                 BankSky DeFi bank entry point
│   ├── zMerlinHive.html             Merlin Hive AI orchestration UI
│   ├── PLATFORM_OVERVIEW.md         ← Architecture overview (START HERE)
│   ├── ARCHITECTURE.md              Low-level sync architecture
│   ├── CHANGELOG.md                 Version history
│   └── README.md                    User-facing documentation
│
├── 📦 Source Code (src/)
│   ├── agents/                      Autonomous agent implementations
│   │   ├── swarm-orchestrator.js    Multi-agent coordination
│   │   ├── management-agent.js      System health and management
│   │   ├── deployment-agent.js      Automated deployments
│   │   ├── contract-seeker-agent.js SAM.gov contract discovery
│   │   └── paypal-deployment-agent.js PayPal integration agent
│   ├── systems/                     Major system integrations
│   │   ├── samgov-api-integration.js SAM.gov API (reuse this)
│   │   └── paypal-payment-integration.js PayPal integration
│   ├── utils/                       Shared utilities
│   │   ├── samgov-integration.js    SAM.gov utility (reuse this)
│   │   └── paypal-integration.js    PayPal utility
│   ├── ai/                          AI / ML components
│   ├── aul/                         AUL agent protocol experiments
│   ├── core/                        Core platform utilities
│   └── security/                    Security utilities
│
├── 🌐 Backend Services
│   ├── backend/                     Node.js Express server
│   │   ├── server.js                Main server
│   │   └── services/
│   │       ├── email-service.js     SMTP email delivery
│   │       └── kas-service.js       Key Authentication Service
│   └── netlify/functions/           Netlify serverless functions
│       ├── github-token.mjs         ← GitHub token relay (DO NOT DUPLICATE)
│       ├── sam-gov-token.mjs        ← SAM.gov key relay (DO NOT DUPLICATE)
│       └── health.js                Health check endpoint
│
├── 🔄 CI/CD (.github/)
│   ├── workflows/
│   │   ├── ci-lint-test.yml         Lint and test on every PR
│   │   ├── deploy-github-pages.yml  Deploy to GitHub Pages
│   │   ├── deploy-netlify.yml       Deploy to Netlify
│   │   ├── deploy-paypal-integration.yml PayPal deployment
│   │   ├── dependency-security-updates.yml Weekly security audit
│   │   ├── health-check.yml         Scheduled health checks
│   │   └── validate-html-consistency.yml HTML validation
│   └── instructions/                Copilot coding instructions
│
├── 🎨 Frontend Assets
│   ├── css/ / CSS/                  Shared stylesheets
│   ├── js/                          Shared JavaScript libraries
│   └── images/ / icons/             Image and icon assets
│
├── 🤖 AI Agent Systems
│   ├── agent-r-manifest.json        Agent R (system architect)
│   ├── agent-management-dashboard.html Agent control panel
│   └── merlin-hive-integration.js   Merlin Hive integration
│
├── 📚 Documentation
│   ├── docs/                        136 documentation files
│   ├── BOOKS/                       Documentation books
│   └── agent/                       Agent-specific docs (this folder)
│
├── 🌍 Platform Subsystems
│   ├── ARAYA/ ARAYA_HUD/            ARAYA heads-up display
│   ├── trinity/                     Trinity orchestration
│   ├── TRINITY_RAILWAY_DEPLOY/      Railway deployment package
│   ├── seven-domains/               7 Sacred Domains framework
│   ├── CRYPTO_WORLD/ / crypto/      Blockchain tools
│   └── CONSCIOUSNESS_PLATFORM/      Core consciousness platform
│
├── 📊 Data & State
│   ├── .consciousness/              Git-based distributed sync
│   │   ├── commands/                Inter-node command queue
│   │   ├── file_transfers/          File sharing mechanism
│   │   └── sync/                    Core sync state
│   ├── logs/                        System logs (gitignored in prod)
│   ├── COMMUNICATION_LOGS/          Agent communication traces
│   └── VOICE_LOGS/                  Voice system logs
│
├── 🧪 Experiments & Labs
│   ├── laboratory.html              Lab mode entry
│   └── src/aul/                     AUL protocol experiments
│
└── 🔧 Configuration
    ├── package.json                 Node.js manifest (banksky-platform v2.4.0)
    ├── netlify.toml                 Netlify routing config
    ├── .env.example                 Required environment variables
    └── .gitignore                   Ignored files
```

---

## Finding Things Quickly

| I need to... | Go to... |
|-------------|---------|
| Understand the whole system | `PLATFORM_OVERVIEW.md` |
| Find API endpoints | `semantic-index/manifest.json` |
| Add a new agent | `src/agents/` — copy an existing agent pattern |
| Add a new HTML tool | Create `my-tool.html` in root, follow `html-tools.instructions.md` |
| Add a backend function | `netlify/functions/` or `backend/services/` |
| Get a secret to the browser | Use `/api/github-token` or `/api/sam-gov-token` relay |
| Add a new secret relay | Follow `netlify/functions/github-token.mjs` pattern |
| Update CI/CD | `.github/workflows/` |
| View agent contract | `semantic-index/subsystems/ai-agents.json` |
| Find payment code | `src/utils/paypal-integration.js`, `src/systems/paypal-payment-integration.js` |
| Find SAM.gov code | `src/systems/samgov-api-integration.js` |

---

## Subsystem Manifests

For machine-readable details on each subsystem, see:

- `semantic-index/subsystems/ui-layer.json`
- `semantic-index/subsystems/backend-services.json`
- `semantic-index/subsystems/ai-agents.json`
- `semantic-index/subsystems/blockchain.json`
- `semantic-index/subsystems/government-contracts.json`
