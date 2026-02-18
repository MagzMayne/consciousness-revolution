# Trinity Communications Hub

## The 4 Operators

| Operator | Role | Cockpit |
|----------|------|---------|
| **Commander** | Darrick - Oversees all | `OPERATOR_COCKPIT_COMMANDER.html` |
| **Agent R** | Ryan Barbaric - Builder | `OPERATOR_COCKPIT_RYAN.html` |
| **Tiger** | Tiger - Operations | `OPERATOR_COCKPIT_TIGER.html` |
| **Nero** | Nero - Support | `OPERATOR_COCKPIT_NERO.html` |

---

## Communication Flow

```
Commander
    │
    ├── Agent R (Ryan)
    │       │
    │       └── Builds & Deploys
    │
    ├── Tiger
    │       │
    │       └── Operations & Testing
    │
    └── Nero
            │
            └── Support & Docs
```

---

## START HERE

**Master Checklist:** [ONBOARDING_CHECKLIST.md](./ONBOARDING_CHECKLIST.md)
- Print this or view on phone while onboarding
- Walks through each step with checkboxes
- Aligns with dashboard buttons in order

---

## Service Onboarding Guides

| Service | Guide | Status Check |
|---------|-------|--------------|
| **GitHub** | [GITHUB_ONBOARDING.md](./GITHUB_ONBOARDING.md) | Green light = org member |
| **Netlify** | [NETLIFY_ONBOARDING.md](./NETLIFY_ONBOARDING.md) | Green light = deploy access |
| **Railway** | [RAILWAY_ONBOARDING.md](./RAILWAY_ONBOARDING.md) | Green light = API token valid |

---

## Quick Status URLs (Mobile Friendly)

**GitHub:** https://github.com/orgs/overkillkulture/people
**Netlify:** https://app.netlify.com/teams/verdant-tulumba/sites
**Railway:** https://railway.app/dashboard

---

## The Onboarding Flow

```
1. EMAIL ARRIVES
   ↓
2. CLICK ACCEPT
   ↓
3. RETURN TO DASHBOARD
   ↓
4. ENTER CREDENTIALS/VERIFY
   ↓
5. GREEN LIGHT ✓
```

---

## Emergency Contacts

- **Commander (Darrick):** darrick.preble@gmail.com
- **Discord:** consciousness-revolution server
- **Site:** conciousnessrevolution.io

---

## Deploy Without Seat Purchase

To avoid $20/person Netlify charges:

1. **Use Deploy Hooks** - Trigger deploys via URL
2. **GitHub Auto-Deploy** - Push to main = auto deploy
3. **Shared CLI Token** - One login, many users

Ask Commander for the shared deploy hook URL.

---

*Last Updated: February 2026*
