---
layout: default
title: Maintenance — Self-Healing Protocol
---

# 🔧 Maintenance & Self-Healing Protocol

This folder contains automation scripts and protocols for keeping the Consciousness Revolution platform healthy, secure, and up-to-date.

**Location:** `maintenance/`  
**Run as:** Repository maintainer or automated CI job  
**Frequency:** Weekly (automated) + on-demand  

---

## 📋 Contents

| Script | Purpose | When to Run |
|--------|---------|-------------|
| `update-dependencies.sh` | Audit and update npm dependencies | Weekly / before releases |
| `lint-and-format.sh` | Run linters and format checks | Before every commit / in CI |
| `detect-dead-code.sh` | Find unused files and orphaned scripts | Monthly / before major refactors |
| `detect-semantic-drift.sh` | Detect drift between semantic-index manifests and actual files | After adding/removing files |

---

## 🌱 Self-Healing Philosophy

The platform is designed to detect and resolve common failure modes autonomously:

```
Detect → Diagnose → Heal → Verify → Log
```

### Automatic Self-Healing (Runtime)
These happen in the browser or backend **automatically**:

1. **API connection failures** — Retry with exponential backoff (3 attempts, 2×, 4×, 8s)
2. **Merlin Hive agent disconnects** — Agents re-register on next heartbeat cycle
3. **Cache corruption** — localStorage/sessionStorage cleared and rebuilt on schema mismatch
4. **SAM.gov token expiry** — Token refreshed from `/api/sam-gov-token` on 401 response
5. **Missing project entries** — `projects.json` updated automatically by the build agent

### Manual Self-Healing (These Scripts)
Run these scripts when automated healing isn't enough:

```bash
# Full maintenance pass (run all scripts in order)
cd maintenance
./update-dependencies.sh
./lint-and-format.sh
./detect-dead-code.sh
./detect-semantic-drift.sh
```

---

## 🚦 Health Check Quick Reference

```bash
# Check overall backend health
npm run health

# Check API connections
npm run test:api

# Run full test suite
npm test

# Security audit
npm audit
```

---

## 🔒 Security Self-Healing

If the security scan (`.github/workflows/ci-lint-test.yml`) finds exposed secrets:

1. **Do NOT push the commit.**
2. Identify the file using `git diff HEAD` and `scripts/pre-commit-hook.js`.
3. Remove the secret from the file.
4. Add the file pattern to `.gitignore` if it should never be committed.
5. Rotate the exposed key immediately using the provider's dashboard.
6. Run `git push` once the secret is removed.

See `SECURITY.md` for full incident response procedures.

---

## 🤖 Agent-Initiated Maintenance

Agents (via Merlin Hive) can trigger maintenance tasks programmatically:

```javascript
// Trigger a maintenance task via Merlin Hive
window.MerlinHive?.sendCommand({
  type: 'maintenance',
  task: 'dependency-audit',
  priority: 'low',
  requestedBy: 'agent-management-dashboard'
});
```

Supported maintenance tasks:
- `dependency-audit` — Run `npm audit` and report results
- `semantic-drift-check` — Compare semantic-index against filesystem
- `dead-code-report` — List files not referenced by any HTML or JS
- `health-check` — Full system health pass

---

## 📅 Maintenance Schedule

| Task | Frequency | Automated? |
|------|-----------|-----------|
| Dependency security audit | Weekly (Monday 00:00 UTC) | ✅ `.github/workflows/dependency-security-updates.yml` |
| Branch cleanup | Weekly | ✅ `.github/workflows/branch-cleanup.yml` |
| Performance monitoring | Daily | ✅ `.github/workflows/performance-monitoring.yml` |
| Dead code detection | Monthly (manual) | ❌ Run `detect-dead-code.sh` |
| Semantic drift detection | On file changes | ❌ Run `detect-semantic-drift.sh` |
| Full dependency update | Before each release | ❌ Run `update-dependencies.sh` |

---

## 🆘 Escalation Path

If automated healing fails:

1. Check `.github/workflows/` logs in GitHub Actions.
2. Run `npm run health` locally to get a baseline report.
3. Check `logs/` and `COMMUNICATION_LOGS/` for recent error traces.
4. Open an issue at the [bugs tracker](https://github.com/overkor-tek/consciousness-bugs).
5. Contact: **BarbrickDesign@gmail.com**

---

*This maintenance system is part of the Consciousness Revolution TOTALITY PROTOCOL — Section 9: Self-Healing & Auto-Refactor Mode.*
