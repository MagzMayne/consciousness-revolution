# Risk Envelopes

> Agentic Finance — `@haven/core-intent-engine` › `risk.js`

A **risk envelope** is a per-agent policy object that constrains what an agent
is permitted to do.  Before any intent is executed, the `evaluateRisk` function
tests the simulated result against the envelope and returns an `allowed/denied`
decision with an audit trail of which checks were triggered.

---

## Envelope Schema

```json
{
  "agentId":              "<string>  the agent this envelope applies to",
  "allowedIntentTypes":   ["<intentType>", …],
  "maxPerTxUsd":          "<number | null>  max value per single transaction",
  "maxDailyUsd":          "<number | null>  max cumulative daily spend",
  "allowedAssets":        ["ETH", "USDC", …],
  "blockedAssets":        ["<symbol>", …],
  "allowedDestinations":  ["0xAddress", …],
  "blockedDestinations":  ["0xAddress", …],
  "createdAt":            "<ISO-8601>"
}
```

A value of `null` on a numeric field means **unlimited**.
An empty array on a list field means **no restriction** (allow-all / block-none).

---

## Evaluation Logic

Rules are evaluated in this order.  The first failing rule returns `denied`:

| Order | Rule | Flag |
|-------|------|------|
| 1 | `intentType` not in `allowedIntentTypes` (when list is non-empty) | `intent_type_blocked` |
| 2 | `estimatedValueUsd` > `maxPerTxUsd` (when both non-null) | `per_tx_cap_exceeded` |
| 3 | `projectedDailyUsd` > `maxDailyUsd` (when both non-null) | `daily_cap_exceeded` |
| 4 | asset not in `allowedAssets` (when list is non-empty) | `asset_not_allowed` |
| 5 | asset in `blockedAssets` | `asset_blocked` |
| 6 | destination not in `allowedDestinations` (when list is non-empty) | `destination_not_allowed` |
| 7 | destination in `blockedDestinations` | `destination_blocked` |

---

## Risk Decision Object

```json
{
  "allowed": true,
  "reason":  "all risk checks passed",
  "flags":   []
}
```

When denied:
```json
{
  "allowed": false,
  "reason":  "estimatedValueUsd 1500 exceeds maxPerTxUsd 500",
  "flags":   ["per_tx_cap_exceeded"]
}
```

---

## Creating an Envelope

```js
const { createDefaultEnvelope } = require('@haven/core-intent-engine');

// Permissive default — all intents, unlimited caps, no asset/destination restrictions
const defaultEnv = createDefaultEnvelope('my-agent');

// Conservative trading-only envelope
const conservativeEnv = {
  agentId: 'conservative-agent',
  allowedIntentTypes: ['trade.buy', 'trade.sell'],
  maxPerTxUsd:   1000,
  maxDailyUsd:   5000,
  allowedAssets: ['ETH', 'USDC', 'WBTC'],
  blockedAssets: [],
  allowedDestinations: [],
  blockedDestinations: [],
};
```

---

## Registering Envelopes with the Engine

```js
const { IntentEngine } = require('@haven/core-intent-engine');

const engine = new IntentEngine({
  adapters: [new X402BaseAdapter()],
  riskEnvelopes: {
    'trading-agent':   conservativeEnv,
    'payment-agent':   paymentEnv,
    'rebalance-agent': rebalanceEnv,
  },
});
```

Agents without a registered envelope automatically receive a permissive
default (no restrictions).

---

## Example Scenarios

### Scenario 1 — Trade value exceeds per-transaction cap

```
Intent:         trade.buy  ETH  amount ≈ $2,000
Envelope cap:   maxPerTxUsd = 500
Simulation:     estimatedValueUsd = 2000
Decision:       denied — per_tx_cap_exceeded
```

### Scenario 2 — Blocked asset

```
Intent:         trade.buy  SHIB
Envelope:       blockedAssets = ["SHIB", "DOGE"]
Decision:       denied — asset_blocked
```

### Scenario 3 — Destination not in allowlist

```
Intent:         payment.m2m  to: 0xUnknown
Envelope:       allowedDestinations = ["0xKnownPartner"]
Decision:       denied — destination_not_allowed
```

### Scenario 4 — All checks pass

```
Intent:         trade.swap  ETH → USDC  amount ≈ $300
Envelope:       allowedIntentTypes = ["trade.swap"]
                maxPerTxUsd = 1000
                allowedAssets = ["ETH", "USDC"]
Simulation:     estimatedValueUsd = 300
Decision:       allowed — all risk checks passed
```

---

## Extending the Risk Engine

The `evaluateRisk` function is pure (no side effects) and synchronous, making
it easy to compose with custom rules:

```js
const { evaluateRisk } = require('@haven/core-intent-engine');

function myEvaluateRisk(intent, simResult, envelope) {
  // Run built-in checks first
  const base = evaluateRisk(intent, simResult, envelope);
  if (!base.allowed) return base;

  // Add custom rule: require even-numbered amounts for compliance demo
  const amount = Number(intent.parameters.amount);
  if (!isNaN(amount) && amount % 2 !== 0) {
    return { allowed: false, reason: 'amount must be even (demo rule)', flags: ['custom_rule'] };
  }

  return base;
}
```
