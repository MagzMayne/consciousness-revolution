# Intent Specification

> Agentic Finance — `@haven/core-intent-engine`

An **Intent** is the canonical unit of work in the Agentic Finance system.
Every financial operation — from a single machine-to-machine payment to a
multi-leg fund rebalance — is expressed as an intent object, routed through the
intent engine, evaluated against a risk envelope, and executed by an adapter.

---

## Intent Object Schema

```json
{
  "id":          "<string>  unique per-intent identifier",
  "agentId":     "<string>  agent that submitted this intent",
  "userId":      "<string|null>  optional end-user identifier",
  "intentType":  "<string>  one of the types listed below",
  "parameters":  "<object>  intent-type-specific payload",
  "context":     "<object>  arbitrary metadata (chain, session, trace IDs, …)",
  "createdAt":   "<ISO-8601 timestamp>"
}
```

All fields except `userId` and `context` are required.

---

## Intent Types

| Type | Description |
|------|-------------|
| `fund_management.rebalance` | Rebalance a portfolio across one or more chains |
| `fund_management.swap`      | Swap one asset for another within a managed fund |
| `payment.m2m`               | Machine-to-machine payment (agent to agent / address) |
| `payment.subscription`      | Recurring subscription payment |
| `trade.buy`                 | Buy an asset on a DEX or exchange |
| `trade.sell`                | Sell an asset on a DEX or exchange |
| `trade.swap`                | Atomic swap of one asset for another |
| `trade.rebalance`           | Rebalance a trading portfolio to target allocations |

---

## Parameters by Intent Type

### `trade.buy`
```json
{
  "asset":    "ETH",
  "amount":   "1.0",
  "maxSlippageBps": 50
}
```

### `trade.sell`
```json
{
  "asset":    "USDC",
  "amount":   "500.00",
  "minSlippageBps": 10
}
```

### `trade.swap`
```json
{
  "fromAsset": "ETH",
  "toAsset":   "USDC",
  "amount":    "0.5",
  "maxSlippageBps": 30
}
```

### `trade.rebalance`
```json
{
  "targets": {
    "ETH":  "0.60",
    "USDC": "0.40"
  }
}
```

### `payment.m2m`
```json
{
  "destination": "0xRecipientAddress",
  "asset":       "USDC",
  "amount":      "100.00",
  "memo":        "optional free-text"
}
```

### `payment.subscription`
```json
{
  "destination":    "0xMerchantAddress",
  "asset":          "USDC",
  "amount":         "9.99",
  "intervalDays":   30,
  "subscriptionId": "sub-abc123"
}
```

### `fund_management.rebalance`
```json
{
  "fundId": "fund-01",
  "targets": {
    "ETH":  "0.50",
    "BTC":  "0.30",
    "USDC": "0.20"
  },
  "sourceChainId": 1,
  "targetChainId": 8453
}
```

### `fund_management.swap`
```json
{
  "fundId":    "fund-01",
  "fromAsset": "ETH",
  "toAsset":   "WBTC",
  "amount":    "2.0"
}
```

---

## Validation Rules

1. `id` — must be a non-empty string (caller-generated)
2. `agentId` — must be a non-empty string
3. `intentType` — must be one of the eight types listed above
4. `parameters` — must be a non-null object (structure varies by type)
5. `context` — optional; defaults to `{}`

Use `createIntent(params)` from `@haven/core-intent-engine` to validate and
construct intent objects:

```js
const { createIntent } = require('@haven/core-intent-engine');

const intent = createIntent({
  id: 'i-' + Date.now(),
  agentId: 'my-trading-agent',
  intentType: 'trade.buy',
  parameters: { asset: 'ETH', amount: '1.0', maxSlippageBps: 50 },
  context: { sessionId: 'sess-abc' },
});
```

---

## Execution Flow

```
createIntent(params)
      │
      ▼
IntentEngine.simulate(intent)
      │  ─── getAdapter(intentType)
      │  ─── adapter.simulate(intent)  ──→  estimatedCost, slippage, …
      │  ─── evaluateRisk(intent, simResult, envelope)
      │
      ▼  (if mode !== "simulate")
IntentEngine.execute(intent)
      │  ─── adapter.execute(intent)  ──→  txHash, backendRef
      │  ─── createLineageRecord(…)
      │  ─── lineageStore.save(record)
      │
      ▼
ExecutionResult + LineageRecord
```

---

## Examples

### Simulate a trade (no on-chain action)

```js
const result = await engine.simulate(intent);
// result.simulationResult.estimatedCost  → "0.001 ETH"
// result.riskDecision.allowed            → true | false
```

### Execute a payment

```js
const result = await engine.execute(intent);
// result.executionResult.txHash          → "0xabc…"
// result.lineageRecord.id                → "m6q3u-abc12-def56"
```
