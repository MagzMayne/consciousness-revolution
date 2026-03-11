# Autonomous Business Engine

A modular, observable, and human-overridable system that automates creation, deployment, and optimization of online businesses.

---

## Modes

| Mode | Description |
|------|-------------|
| **Simulation (default)** | All actions generate draft payloads. No real API calls, no real money moved. |
| **Live** | Enables real publishing to marketplaces and content platforms. Requires manual API key configuration. |
| **Draft-only** | Marketing/content outputs are queued in the outbox for manual review and approval. |
| **Real Transactions Enabled** | Requires `allow_real_transactions: true` AND `allow_real_spend: true` in config. Off by default. |

---

## Architecture

```
/core/
  agents/registry.js        ← Central agent registry (window.Agents)
  scheduler/scheduler.js    ← Probabilistic task scheduler (window.Scheduler)
  state/
    integrations.config.json ← Integration config (mode flags, API key placeholders)
    outbox/                  ← Marketing draft queue
    snapshots/               ← System state snapshots
    evolution/               ← Evolution cycle records
  revenue/
    businessFactory.js      ← Business pipeline (window.BusinessFactory)
    marketingSwarm.js        ← Marketing content generator (window.MarketingSwarm)
    evolutionEngine.js       ← Genetic algorithm engine (window.EvolutionEngine)
    financeController.js     ← Financial controller with safety guards (window.FinanceController)
  infra/infra.js             ← Health checks, circuit breakers, rollback (window.Infra)
  security/governance.js     ← Safety rules, rate limits, human-approval gates (window.Governance)

/integrations/
  marketplaces/index.js     ← Etsy, Gumroad, Shopify adapters (window.Marketplaces)
  content/index.js          ← Blog, social, email content adapters (window.ContentAdapters)
  payments/index.js         ← PayPal, Stripe, crypto wallet stubs (window.Payments)
  data/index.js             ← Free API data layer: Google Trends, Reddit, HackerNews (window.DataAPI)

/ui/
  modes/mission-control.js  ← Mission Control dashboard (window.MissionControl)
```

---

## Configuring Integrations

Edit `/core/state/integrations.config.json`:

```json
{
  "mode": "simulation",
  "allow_real_transactions": false,
  "allow_real_spend": false,
  "integrations": {
    "etsy": {
      "enabled": false,
      "mode": "simulation",
      "api_key": "${ETSY_API_KEY}"
    }
  }
}
```

**NEVER hardcode API keys.** Use environment variables (e.g., `process.env.ETSY_API_KEY`).

---

## Enabling Real Transactions

1. Set the following in your config or via `FinanceController.configure()`:
   ```js
   window.FinanceController.configure({
     allow_real_transactions: true,
     allow_real_spend: true,
     max_daily_spend_usd: 50,
   });
   ```
2. Provide API keys via environment variables — **never commit them**.
3. Set `"mode": "live"` in `integrations.config.json`.
4. Toggle off `require_manual_approval_for_outbound` if desired.

---

## Human Override Controls

From the **Mission Control** tab in `dashboard.html`:

- **⛔ Pause All Automation** — instantly stops all agent runs
- **✋ Toggle Manual Approval** — requires human sign-off for all outbound actions
- **📸 Capture Snapshot** — save current system state
- **Restore** button in Timeline — roll back to any snapshot

Or via JavaScript:
```js
window.Governance.pause();                    // Pause
window.Governance.resume();                   // Resume
window.Governance.setRequireManualApproval(true); // Enable approval gate
window.Governance.approveAction(approvalId);  // Approve pending action
window.Governance.rejectAction(approvalId);   // Reject pending action
```

---

## Running the Business Engine

```js
// Run one full business generation cycle
const result = await window.BusinessFactory.runCycle({ topN: 3, query: 'trending niches 2026' });

// Generate marketing content for a concept
window.MarketingSwarm.runSwarm(result.concepts[0]);

// Run evolution cycle
window.EvolutionEngine.runEvolutionCycle(10);

// View generated drafts (outbox)
const drafts = window.MarketingSwarm.getOutbox({ status: 'draft' });
```

---

## Testing

```bash
# Run business engine tests
node tests/business-engine.test.js

# Run existing tests
node tests/agentic-finance.test.js
node test-canonical-fields.js
```

---

## Safety Checklist

- [ ] `allow_real_transactions` is `false` (default)
- [ ] `allow_real_spend` is `false` (default)
- [ ] `simulation_mode` is `true` (default)
- [ ] No API keys committed to repo (use `${ENV_VAR}` placeholders)
- [ ] `require_manual_approval_for_outbound` is `true` (default)
- [ ] Spend caps configured per provider before going live
