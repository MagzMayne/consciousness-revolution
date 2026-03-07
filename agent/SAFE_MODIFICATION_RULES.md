# 🔒 Safe Modification Rules

This document defines what AI agents and contributors MUST NOT change or delete without explicit written approval from the repository owner (BarbrickDesign@gmail.com).

---

## 🚨 CRITICAL — Do Not Touch Without Approval

These files and systems are **revenue-generating** or **architecturally foundational**. Breaking them causes direct financial harm or cascading system failures.

### Payment & Revenue Systems

| File / Path | Risk if broken |
|-------------|---------------|
| `src/utils/paypal-integration.js` | Breaks all PayPal payments |
| `src/systems/paypal-payment-integration.js` | Breaks payment processing |
| `contributor-registration-enhanced.html` | Stops contributor revenue |
| `government-grants-portal.html` | Stops grant portal revenue |
| `deploy-paypal-integration.yml` | Breaks payment deployment |
| `contribution-rewards-system.js` | Corrupts revenue share calculations |
| `unified-rewards-system.js` | Corrupts payout calculations |

**Required before changing any of the above:**
- [ ] Written approval from BarbrickDesign@gmail.com
- [ ] Full sandbox testing (PayPal sandbox mode)
- [ ] Test all 4 tiers (Bronze, Silver, Gold, Platinum)
- [ ] Test student discount (50% off)
- [ ] Verify revenue share calculations remain accurate
- [ ] Rollback plan documented

### Secret Relay Infrastructure

| File / Path | Risk if broken |
|-------------|---------------|
| `netlify/functions/github-token.mjs` | All GitHub API calls fail |
| `netlify/functions/sam-gov-token.mjs` | SAM.gov integration fails |
| `netlify/functions/health.js` | Health monitoring blind |
| `netlify.toml` | All `/api/*` routing breaks |

**Rule:** Never delete or rename these files. Never change their response schema (`{ auth, token, api_error }`). Only add new relay endpoints alongside these.

### Core Agent Infrastructure

| File / Path | Risk if broken |
|-------------|---------------|
| `zMerlinHive.html` | Central agent orchestration offline |
| `merlin-hive-integration.js` | All agents lose Hive connection |
| `agent-r-manifest.json` | Agent R (Level 999) loses authority config |
| `src/agents/swarm-orchestrator.js` | Multi-agent coordination breaks |
| `anti-nuke-safety.js` | Safety system disabled |

### Authentication Systems

| File / Path | Risk if broken |
|-------------|---------------|
| `universal-wallet-auth.js` | SSO breaks across all pages |
| `src/auth.js` | Core authentication fails |
| `src/security/` | Security layer compromised |

---

## ⚠️ HIGH CAUTION — Requires Careful Testing

These may be changed but require thorough testing before merging:

- Any file in `ARAYA/` or `ARAYA_HUD/` — primary UI layer
- Any file in `trinity/` — backend orchestration
- `backend/services/` — email and KAS service
- `.github/workflows/` — CI/CD pipeline changes
- `netlify.toml` — routing configuration
- `package.json` — dependency changes

---

## ✅ Safe to Modify Freely

These areas are low-risk and can be changed with standard PR review:

- `docs/` — documentation
- `BOOKS/` — documentation books
- `agent/` — agent instructions (this folder)
- `semantic-index/` — semantic manifests
- `PLATFORM_OVERVIEW.md`, `CHANGELOG.md`, `README.md`
- New `*.html` pages that don't touch existing payment or auth flows
- New `src/agents/` implementations that follow the agent contract
- New `netlify/functions/` files (never replace existing ones)
- CSS/styling changes that don't break mobile responsiveness

---

## 📋 Change Request Process

For CRITICAL changes:

1. Open a GitHub Issue describing the change and business justification.
2. Tag the issue `revenue-critical` or `security`.
3. Wait for written approval in the issue from BarbrickDesign@gmail.com.
4. Create a feature branch and implement the change with a rollback plan.
5. Test thoroughly in sandbox/development environment.
6. Submit a PR referencing the approved issue.
7. Deploy to production only after PR approval.

---

## 🔄 Rollback Procedures

For any deployment that breaks a revenue-critical system:

```bash
# Quick rollback via git
git revert HEAD --no-edit
git push origin main

# Or revert to a specific known-good commit
git revert <commit-sha> --no-edit
git push origin main
```

Netlify and GitHub Pages will auto-deploy the reverted version within ~2 minutes.

---

*Last updated: 2026-03-07 — Part of v0.1.0 architecture upgrade*
