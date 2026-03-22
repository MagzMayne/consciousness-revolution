# AGENT GUIDE — Consciousness Revolution Repository

> **DO NOT change workflows in `.github/workflows/` without reading this file first.**

---

## Agent Operating Agreement

All GitHub agents, Copilot agents, PR automation, and CI bots operating in this repository MUST follow the rules below.

---

### 1. Trigger Restrictions — What You MUST NOT Do

You **MUST NOT** create or modify GitHub Actions that:

- Trigger on every push to every branch (e.g., `on: push` without `branches: [ main ]`)
- Trigger on every `pull_request` from bots
- Trigger on schedules more frequent than once per day
- Trigger other workflows in a loop (e.g., via `workflow_run` chaining)

---

### 2. Permitted Triggers — What You MAY Do

You **MAY ONLY**:

- Modify workflows listed in `.github/workflows/` that already exist
- Add new workflows that use `workflow_dispatch` or run only on `push` to `main`
- Add scheduled workflows no more frequent than `cron: "0 3 * * 0"` (weekly)

---

### 3. Bot Guards — Required on All Jobs

Every job that can be triggered by a PR or push **MUST** include this guard to prevent bot-authored runs from consuming minutes:

```yaml
if: ${{ github.actor != 'github-actions[bot]' && github.actor != 'github-copilot[bot]' }}
```

---

### 4. Revenue Alignment — Expensive Jobs

Expensive jobs (CodeQL, full test matrix, large builds) **MUST** run only:

- On `main`, or
- On a weekly schedule, or
- On explicit `workflow_dispatch`

**Never** run expensive jobs on every PR from every actor.

---

### 5. Autonomy Rules

- `copilot-agent.yml` **MUST** use `workflow_dispatch` only.
- Agents **MUST NOT** create new branches or PRs without explicit human-review instructions.
- Agents **MUST NOT** auto-merge PRs.

---

## Canonical Workflow Files

| File | Trigger | Purpose |
|------|---------|---------|
| `ci.yml` | `push`/`pull_request` to `main` | Lint + test (bot-guarded) |
| `deploy-pages.yml` | `push` to `main` + `workflow_dispatch` | GitHub Pages deployment |
| `deploy-netlify.yml` | `push` to `main` + `workflow_dispatch` | Netlify production deploy |
| `codeql.yml` | Weekly Sunday 03:00 UTC + `workflow_dispatch` | Security scanning |
| `restore-point.yml` | `workflow_dispatch` + `restore-*` tags | Repo snapshots |
| `copilot-agent.yml` | `workflow_dispatch` only | Agent entry point |
| `revenue-events.yml` | `repository_dispatch: sale-recorded` | Revenue event processing |

---

## Examples

### ✅ Correct — Safe CI with bot guard

```yaml
name: CI - Lint and Test

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  ci:
    if: ${{ github.actor != 'github-actions[bot]' && github.actor != 'github-copilot[bot]' }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint --if-present
      - run: npm test --if-present
```

### ✅ Correct — Weekly CodeQL scan

```yaml
name: CodeQL

on:
  schedule:
    - cron: "0 3 * * 0"   # weekly, Sunday 03:00 UTC
  workflow_dispatch:
```

### ❌ Wrong — Triggers on every push to every branch

```yaml
on:
  push:          # ← missing branches filter
```

### ❌ Wrong — Schedule more frequent than daily

```yaml
on:
  schedule:
    - cron: "0 * * * *"   # ← hourly — NOT allowed
```

### ❌ Wrong — workflow_run chain (creates loops)

```yaml
on:
  workflow_run:
    workflows: ["Deploy to Netlify"]
    types: [completed]
```

---

## Questions?

Contact: BarbrickDesign@gmail.com
