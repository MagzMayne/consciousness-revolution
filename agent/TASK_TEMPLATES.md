# 📝 Task Templates for Agents

Use these templates when planning changes to the Consciousness Revolution platform. Each template provides the standard checklist for a given task type.

---

## Template 1: Add a New HTML Tool / Page

**Use when:** Creating a new interactive tool, dashboard, or information page.

```markdown
## Task: Add [Tool Name]

### Pre-flight checklist
- [ ] Search the repo — does this tool already exist (fully or partially)?
- [ ] Identify the subsystem this belongs to (ui-layer, blockchain, government-contracts, etc.)
- [ ] Check `projects.json` to see if it should be registered there

### Implementation checklist
- [ ] Create `my-tool-name.html` in the root directory (lowercase-with-hyphens)
- [ ] Include `<!DOCTYPE html>`, viewport meta, charset, description meta
- [ ] Include navigation back to `index.html`
- [ ] Add ARIA labels to all interactive elements
- [ ] Use CSS variables from the design system
- [ ] Fetch any required secrets from `/api/*` (never hardcode)
- [ ] Sanitise user input before DOM insertion (`textContent`, not `innerHTML`)
- [ ] Handle error states gracefully with user-friendly messages
- [ ] Test on mobile viewport (≤375px wide)
- [ ] Add entry to `projects.json` if applicable

### Post-flight checklist
- [ ] No console errors in Chrome DevTools
- [ ] No secrets in the HTML source
- [ ] Keyboard navigation works for all interactive elements
```

---

## Template 2: Add a New Netlify Function (Secret Relay)

**Use when:** A new external API key needs to be accessible from the browser.

```markdown
## Task: Add [ServiceName] Token Relay

### Pre-flight checklist
- [ ] Confirm this secret relay does not already exist in `netlify/functions/`
- [ ] Check `netlify.toml` — `/api/*` routing is already configured

### Implementation checklist
- [ ] Create `netlify/functions/service-name-token.mjs` following `github-token.mjs` pattern
- [ ] Read secret from `process.env.SERVICE_NAME_KEY`
- [ ] Apply CORS restriction to approved origins
- [ ] Apply rate limiting (use existing pattern)
- [ ] Return `{ auth: Boolean(secret), token: secret || null, api_error: null }`
- [ ] Never log the secret value
- [ ] Add secret name to `semantic-index/manifest.json` `environmentVariables.required`
- [ ] Add secret name to `.env.example` with placeholder value and comment

### Post-flight checklist
- [ ] `auth: true` returned when secret is configured
- [ ] `auth: false` returned gracefully when secret is absent
- [ ] Rate limit header present in response
- [ ] No secret value in response body when `auth: false`
```

---

## Template 3: Add a New Autonomous Agent

**Use when:** Creating a new background agent for the AI agent network.

```markdown
## Task: Add [AgentName] Agent

### Pre-flight checklist
- [ ] Check `src/agents/` — does a similar agent already exist?
- [ ] Identify which Hive events / commands this agent handles

### Implementation checklist
- [ ] Create `src/agents/my-agent.js` following the agent class pattern
- [ ] Implement: `init()`, `run()`, `stop()`, `getHealth()`, `attemptSelfHeal()`
- [ ] Include structured logging (timestamp, level, agent name)
- [ ] Keep last 1000 log entries, rotate older ones
- [ ] Connect to Merlin Hive via `MerlinHive.registerAgent(...)`
- [ ] Implement graceful shutdown on `shutdown` event
- [ ] Add rate limiting for any external API calls
- [ ] Export class for use in other modules

### Post-flight checklist
- [ ] Agent initialises without errors
- [ ] `getHealth()` returns valid health object
- [ ] `stop()` clears all intervals
- [ ] `attemptSelfHeal()` handles at least 3 error scenarios
```

---

## Template 4: Fix a Security Issue

**Use when:** Resolving an exposed key, insecure endpoint, or input validation gap.

```markdown
## Task: Fix Security Issue — [Description]

### Assessment checklist
- [ ] Identify the affected file(s)
- [ ] Classify severity (critical / high / medium / low)
- [ ] Determine if the issue is in browser code, server code, or both

### Implementation checklist (choose applicable)
- [ ] If secret is hardcoded: Remove it, add to `.env.example`, update code to use `process.env.*` or `/api/*` relay
- [ ] If input is unsanitised: Add HTML escaping (`textContent` or `escapeHtml()`) and server-side validation
- [ ] If endpoint has no rate limiting: Add `checkRateLimit()` following existing Netlify Function pattern
- [ ] If dependency has CVE: Run `npm audit fix` or pin to patched version
- [ ] Rotate any exposed secret (contact repo owner)

### Post-flight checklist
- [ ] `npm audit` shows zero high/critical vulnerabilities for changed package
- [ ] Exposed secret has been rotated by repo owner
- [ ] CodeQL scan passes
```

---

## Template 5: Update CI/CD Workflow

**Use when:** Adding or modifying a GitHub Actions workflow.

```markdown
## Task: Update CI/CD — [Workflow Name]

### Pre-flight checklist
- [ ] Check `.github/workflows/` for existing similar workflows to avoid duplication
- [ ] Review `.github/instructions/workflow-files.instructions.md`

### Implementation checklist
- [ ] Use `actions/checkout@v4` (not v5, not @latest)
- [ ] Use `actions/setup-node@v4` with `cache: 'npm'`
- [ ] Set minimal `permissions:` (least-privilege)
- [ ] Add `workflow_dispatch:` for manual testing
- [ ] Store all credentials in GitHub Secrets (not workflow env vars)
- [ ] Never `echo` or `print` secret values
- [ ] Add `if: failure()` notification step for revenue-critical workflows
- [ ] Test the workflow in the feature branch before merging

### Post-flight checklist
- [ ] Workflow runs green on a manual trigger
- [ ] Failure scenarios produce useful error messages
- [ ] No secrets visible in workflow logs
```

---

## 🗓️ Recommended Evolution Roadmap

### Phase 1 — Foundation (v0.1.x, current)
- ✅ `PLATFORM_OVERVIEW.md` — architecture documentation
- ✅ `semantic-index/` — machine-ingestible subsystem manifests
- ✅ `agent/` — agent instructions and repo map
- ✅ `CHANGELOG.md` — v0.1.0 baseline
- ✅ `ci-lint-test.yml` — linting and build validation
- ✅ `release.yml` — release engineering pipeline

### Phase 2 — Quality (v0.2.x)
- [ ] Add ESLint configuration and lint step to CI
- [ ] Standardise naming conventions across all JS files
- [ ] Add unit tests for `src/utils/` and `src/systems/` modules
- [ ] Consolidate duplicate backend/frontend code paths

### Phase 3 — Observability (v0.3.x)
- [ ] Centralised structured logging across all agents
- [ ] Real-time agent health dashboard (extend `agent-management-dashboard.html`)
- [ ] Metrics collection for revenue-critical paths (payments, grants)

### Phase 4 — Plugin System (v0.4.x)
- [ ] Plugin loader for new consciousness modules
- [ ] Lab mode flag for experimental subsystems
- [ ] Simulation mode for consciousness packets

### Phase 5 — Multi-Node (v0.5.x)
- [ ] Visual dashboard for node-to-node communication
- [ ] Enhanced `.consciousness/` sync protocol with conflict resolution
- [ ] Automated multi-node health monitoring
