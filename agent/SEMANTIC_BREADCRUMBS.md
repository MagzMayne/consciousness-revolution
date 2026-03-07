# 🧭 Semantic Breadcrumbs — Agent Navigation Guide

This document provides **semantic entry points** and **navigation paths** for AI agents (GitHub Copilot, Claude, Cursor, etc.) operating on the Consciousness Revolution repository.

Use this as your compass. Before making any change, identify which breadcrumb trail applies to your task.

---

## 📍 Top-Level Breadcrumbs

| I want to... | Start here |
|-------------|-----------|
| Understand the whole system | [`PLATFORM_OVERVIEW.md`](../PLATFORM_OVERVIEW.md) |
| Know what already exists | [`agent/REPO_MAP.md`](REPO_MAP.md) |
| Know what NOT to touch | [`agent/SAFE_MODIFICATION_RULES.md`](SAFE_MODIFICATION_RULES.md) |
| Find a task template | [`agent/TASK_TEMPLATES.md`](TASK_TEMPLATES.md) |
| Understand a specific subsystem | [`semantic-index/subsystems/`](../semantic-index/subsystems/) |
| Read the full machine index | [`semantic-index/manifest.json`](../semantic-index/manifest.json) |
| Check what changed recently | [`CHANGELOG.md`](../CHANGELOG.md) |
| Understand the security model | [`SECURITY.md`](../SECURITY.md) |
| Understand architecture | [`ARCHITECTURE.md`](../ARCHITECTURE.md) |
| Plan future evolution | [`ROADMAP.md`](../ROADMAP.md) |
| Run maintenance scripts | [`maintenance/README.md`](../maintenance/README.md) |

---

## 🗺️ Task-Oriented Breadcrumb Trails

### Trail 1: "I need to add or modify a UI page"

```
agent/TASK_TEMPLATES.md (Template 1)
  → semantic-index/subsystems/ui-layer.json      (understand the layer)
  → agent/SAFE_MODIFICATION_RULES.md             (check restrictions)
  → index.html                                   (main hub to link from)
  → projects.json                                (register the new project)
```

**Key constraints:** viewport meta, charset, ARIA labels, no hardcoded secrets, sanitise innerHTML.

---

### Trail 2: "I need to add a backend API or Netlify Function"

```
agent/TASK_TEMPLATES.md (Template 2)
  → semantic-index/subsystems/backend-services.json
  → netlify/functions/github-token.mjs           (DO NOT duplicate — reuse pattern)
  → netlify/functions/sam-gov-token.mjs          (DO NOT duplicate — reuse pattern)
  → netlify.toml                                 (/api/* routing already configured)
```

**Key constraint:** ALL new secret relays must follow the `{ auth, token, api_error }` response schema.

---

### Trail 3: "I need to work on the AI agent system"

```
agent/TASK_TEMPLATES.md (Template 3)
  → semantic-index/subsystems/ai-agents.json
  → zMerlinHive.html                             (Central orchestration UI)
  → merlin-hive-integration.js                   (Hive JS integration)
  → src/agents/                                  (Existing agents to reuse)
  → agent-r-manifest.json                        (Authority hierarchy)
```

**Agent contract:** Register via `MerlinHive.registerAgent()`. Emit status via `hiveConnection.emit('status', ...)`. Implement `getHealth()` and `attemptSelfHeal()`.

---

### Trail 4: "I need to work on payment / revenue systems"

```
agent/SAFE_MODIFICATION_RULES.md               (STOP — read this first)
  → semantic-index/subsystems/government-contracts.json
  → src/utils/paypal-integration.js             (DO NOT duplicate)
  → contributor-registration-enhanced.html
  → government-grants-portal.html
```

**⚠️ CRITICAL:** Written approval required from BarbrickDesign@gmail.com before any changes.

---

### Trail 5: "I need to work on blockchain / Web3"

```
semantic-index/subsystems/blockchain.json
  → src/systems/                                 (Existing wallet integrations)
  → universal-wallet-system.js                  (Universal wallet — reuse)
  → SECURITY.md                                 (Wallet security rules)
```

**Key rule:** NEVER expose private keys or seed phrases. Use sessionStorage (not localStorage) for temporary wallet state.

---

### Trail 6: "I need to fix a security issue"

```
SECURITY.md                                    (Incident response)
  → .env.example                               (Expected environment variables)
  → netlify/functions/health.js                (Health check with auth status)
  → maintenance/lint-and-format.sh             (Automated secret scan)
  → semantic-index/manifest.json               (Environment variable catalogue)
```

---

### Trail 7: "I need to update documentation"

```
PLATFORM_OVERVIEW.md                           (Architecture overview)
  → CHANGELOG.md                              (Update version history)
  → semantic-index/manifest.json              (Update if architecture changes)
  → agent/REPO_MAP.md                         (Update if directory structure changes)
  → ROADMAP.md                                (Update future evolution plan)
```

---

### Trail 8: "I need to run maintenance"

```
maintenance/README.md                          (Self-healing protocol)
  → maintenance/update-dependencies.sh        (Dependency audit)
  → maintenance/lint-and-format.sh            (Linting and security scan)
  → maintenance/detect-dead-code.sh           (Orphaned files)
  → maintenance/detect-semantic-drift.sh      (Manifest vs filesystem sync)
```

---

## 🧬 Subsystem Quick Reference

| Subsystem | ID | Manifest | Primary Entry |
|-----------|-----|---------|--------------|
| UI & Front-End | `ui-layer` | `semantic-index/subsystems/ui-layer.json` | `index.html` |
| Backend Services | `backend-services` | `semantic-index/subsystems/backend-services.json` | `backend/start-local.js` |
| AI Agents | `ai-agents` | `semantic-index/subsystems/ai-agents.json` | `zMerlinHive.html` |
| Blockchain / Web3 | `blockchain` | `semantic-index/subsystems/blockchain.json` | `universal-wallet-system.js` |
| Government Contracts | `government-contracts` | `semantic-index/subsystems/government-contracts.json` | `government-grants-portal.html` |
| Consciousness Core | `consciousness-core` | `semantic-index/subsystems/consciousness-core.json` | `.consciousness/` |
| Seven Domains | `seven-domains` | `semantic-index/subsystems/seven-domains.json` | `seven-domains/index.html` |

---

## 🔑 Environment Variable Quick Reference

All secrets live in environment variables — never in code. See `.env.example` for the full list.

| Variable | Used By | Source |
|----------|---------|--------|
| `GITHUB_TOKEN` | Team Launchpad, PR automation | GitHub Settings → PAT |
| `SAMGOV_API_KEY` | Government grants, SAM.gov | open.gsa.gov |
| `GROQ_API_KEY` | AI features, orchestrator | console.groq.com |
| `OPENAI_API_KEY` | KERNEL prompts, AI tools | platform.openai.com |
| `PAYPAL_CLIENT_ID` | Payment integration | PayPal Developer |
| `SUPABASE_URL` | Database operations | Supabase dashboard |
| `SUPABASE_ANON_KEY` | Database operations | Supabase dashboard |

**Browser pattern for accessing secrets:**
```javascript
// ✅ ALWAYS — fetch from relay, use in memory only
const { auth, token } = await fetch('/api/github-token').then(r => r.json());
if (!auth) { showError('Secret missing — check repository secrets'); return; }
```

---

## 🚫 Anti-Patterns (What NOT to Do)

| Anti-pattern | Correct alternative |
|-------------|---------------------|
| `localStorage.setItem('token', token)` | Keep token in memory (JS variable) |
| Creating a new token relay endpoint | Reuse `netlify/functions/github-token.mjs` |
| Duplicating `samgov-api-integration.js` | `import` the existing utility |
| `console.log(apiKey)` | Never log secrets |
| Hard-coded `sk_live_*` in JS | Read from `process.env` or fetch from relay |
| `eval(userInput)` | Parse safely with JSON.parse or DOM APIs |

---

## 🤖 Agent Affordances Summary

What agents are **permitted** to do without approval:
- ✅ Add new HTML pages following the template
- ✅ Add new Netlify Functions following the relay pattern
- ✅ Add new entries to `projects.json`
- ✅ Update documentation files (README, CHANGELOG, etc.)
- ✅ Add new CSS classes to the design system
- ✅ Update semantic-index manifests to reflect new files
- ✅ Add new maintenance scripts

What agents **require explicit approval** to do:
- ❌ Modify payment processing code (PayPal/Stripe)
- ❌ Change the `netlify.toml` routing rules
- ❌ Delete files from `netlify/functions/`
- ❌ Modify `agent-r-manifest.json` authority levels
- ❌ Change the `.env.example` schema for existing variables
- ❌ Modify `zMerlinHive.html` or `merlin-hive-integration.js`

---

*This document is part of the Consciousness Revolution TOTALITY PROTOCOL — Section 7: Agent-Compatibility Layer.*
