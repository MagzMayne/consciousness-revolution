# API Reference

> Agentic Finance — `@haven/api-gateway`

The API gateway exposes the intent engine over HTTP/JSON.  All requests and
responses use `Content-Type: application/json`.

---

## Authentication

When the environment variable `AGENT_FINANCE_API_KEYS` is set to a
comma-separated list of keys, every request must include a matching key:

```
x-api-key: <your-key>
```

If `AGENT_FINANCE_API_KEYS` is not set the gateway runs in **open mode**
(suitable for local development only).

---

## Base URL

```
http://<host>:<port>   (default port 3000)
```

---

## Endpoints

---

### `GET /v1/health`

Liveness probe.

**Response 200:**
```json
{
  "status":    "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### `POST /v1/intent`

Submit an intent for simulation or execution.

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `agent_id` | string | ✓ | Agent submitting the intent |
| `intent_type` | string | ✓ | One of the declared intent types |
| `parameters` | object | ✓ | Intent-type-specific payload |
| `context` | object | — | Arbitrary metadata (tracing, session, …) |
| `mode` | string | — | `"simulate"` or `"simulate_and_execute"` (default) |

**Example request:**
```json
{
  "agent_id":    "trading-agent-01",
  "intent_type": "trade.buy",
  "parameters":  { "asset": "ETH", "amount": "1.0", "maxSlippageBps": 50 },
  "context":     { "sessionId": "sess-abc" },
  "mode":        "simulate_and_execute"
}
```

---

#### Response — simulate mode (`mode: "simulate"`)

**200 OK:**
```json
{
  "status": "simulated",
  "intent": { "id": "intent-…", "agentId": "…", "intentType": "trade.buy", "…": "…" },
  "adapter": "x402_base",
  "simulationResult": {
    "status": "simulated",
    "estimatedCost": "0.001 ETH",
    "estimatedSlippageBps": 30,
    "metadata": { "adapter": "x402_base", "network": "base" }
  },
  "riskDecision": {
    "allowed": true,
    "reason":  "all risk checks passed",
    "flags":   []
  }
}
```

---

#### Response — execute mode (`mode: "simulate_and_execute"`)

**200 OK:**
```json
{
  "status": "executed",
  "intent": { "…": "…" },
  "adapter": "x402_base",
  "simulationResult": { "…": "…" },
  "riskDecision": { "allowed": true, "reason": "…", "flags": [] },
  "executionResult": {
    "status": "executed",
    "txHash": "0xabcdef1234567890…",
    "backendRef": "x402:ts36id-abc",
    "metadata": { "…": "…" }
  },
  "lineageId": "m6q3u-abc12-def56"
}
```

---

#### Error responses

| Status | Cause |
|--------|-------|
| 400 | Missing required field (`agent_id`, `intent_type`, or `parameters`) |
| 400 | `intent_type` is not a recognised type |
| 400 | No adapter supports the given `intent_type` |
| 401 | Missing or invalid `x-api-key` |
| 403 | Risk envelope blocked the execution |
| 503 | Kill switch is active (global, agent, or backend) |
| 500 | Internal error |

**400 example:**
```json
{ "error": "Invalid intent", "message": "createIntent: invalid intentType \"bad.type\"…" }
```

**403 example:**
```json
{ "error": "Forbidden", "message": "IntentEngine: risk envelope blocked execution — intentType \"trade.buy\" is not in allowedIntentTypes" }
```

---

### `GET /v1/lineage/:id`

Retrieve a lineage record by its ID (returned as `lineageId` in execute responses).

**Path parameter:** `id` — lineage record identifier

**Response 200:**
```json
{
  "id":                 "m6q3u-abc12-def56",
  "intentId":           "intent-1705312200000-abc",
  "agentId":            "trading-agent-01",
  "userId":             null,
  "toolId":             null,
  "intentType":         "trade.buy",
  "parametersSnapshot": { "asset": "ETH", "amount": "1.0" },
  "riskDecision":       { "allowed": true, "reason": "all risk checks passed", "flags": [] },
  "backend":            "x402_base",
  "txHash":             "0xabcdef…",
  "backendRef":         "x402:ts36id-abc",
  "timestamp":          "2024-01-15T10:30:01.234Z"
}
```

**Response 404:**
```json
{ "error": "Not found", "message": "No lineage record with id \"xyz\"" }
```

---

### `GET /v1/kill-switch`

Return the current state of all kill switches.

**Response 200:**
```json
{
  "global":   false,
  "agents":   { "bad-agent": true },
  "backends": { "x402_base": false },
  "updatedAt": "2024-01-15T10:35:00.000Z"
}
```

---

### `POST /v1/kill-switch`

Enable or disable a kill switch.

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | ✓ | `"global"`, `"agent"`, or `"backend"` |
| `killed` | boolean | ✓ | `true` to kill, `false` to restore |
| `target` | string | * | Required for `type: "agent"` or `type: "backend"` |

**Examples:**

Kill all traffic globally:
```json
{ "type": "global", "killed": true }
```

Kill a specific agent:
```json
{ "type": "agent", "target": "compromised-agent", "killed": true }
```

Kill a specific backend:
```json
{ "type": "backend", "target": "x402_base", "killed": true }
```

Restore:
```json
{ "type": "global", "killed": false }
```

**Response 200:**
```json
{
  "message": "Kill switch updated",
  "status": {
    "global":   true,
    "agents":   {},
    "backends": {},
    "updatedAt": "2024-01-15T10:40:00.000Z"
  }
}
```

---

## SDK Usage

### JavaScript

```js
const { AgentFinanceClient } = require('@haven/agent-finance');

const client = new AgentFinanceClient({
  baseUrl: 'http://localhost:3000',
  apiKey:  'my-api-key',
});

// Simulate
const sim = await client.simulate({
  agentId:    'my-agent',
  intentType: 'trade.swap',
  parameters: { fromAsset: 'ETH', toAsset: 'USDC', amount: '0.5' },
});

// Execute
const result = await client.intent({
  agentId:    'my-agent',
  intentType: 'trade.swap',
  parameters: { fromAsset: 'ETH', toAsset: 'USDC', amount: '0.5' },
  mode:       'simulate_and_execute',
});

// Retrieve lineage
const lineage = await client.getLineage(result.lineageId);
```

### Python

```python
from haven_agent_finance import AgentFinanceClient

client = AgentFinanceClient(
    base_url="http://localhost:3000",
    api_key="my-api-key",
)

# Simulate
sim = client.simulate(
    agent_id="my-agent",
    intent_type="trade.swap",
    parameters={"fromAsset": "ETH", "toAsset": "USDC", "amount": "0.5"},
)

# Execute
result = client.intent(
    agent_id="my-agent",
    intent_type="trade.swap",
    parameters={"fromAsset": "ETH", "toAsset": "USDC", "amount": "0.5"},
    mode="simulate_and_execute",
)
```

---

## Starting the Gateway

```bash
# Default port 3000
node services/api-gateway/index.js

# Custom port
PORT=8080 node services/api-gateway/index.js

# With API key auth
AGENT_FINANCE_API_KEYS="key1,key2" node services/api-gateway/index.js
```

Or programmatically:

```js
const { start } = require('./services/api-gateway');
const server = start(3000);
```
