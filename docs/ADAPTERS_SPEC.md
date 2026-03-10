# Adapters Specification

> Agentic Finance — `packages/adapters/`

An **adapter** is a backend driver that knows how to simulate and execute a
specific subset of intent types on a specific network or protocol.  The
`IntentEngine` selects the first registered adapter that returns `true` from
`supports(intentType)`.

---

## Adapter Interface

Every adapter must implement the following interface:

```js
class MyAdapter {
  /** Unique adapter name (used in lineage records) */
  get name() { return 'my_adapter'; }

  /**
   * Returns true if this adapter can handle the given intentType.
   * @param {string} intentType
   * @returns {boolean}
   */
  supports(intentType) { … }

  /**
   * Simulate the intent. Must NOT write to any chain or external service.
   * @param {object} intent
   * @returns {Promise<AdapterSimulationResult>}
   */
  async simulate(intent) { … }

  /**
   * Execute the intent.  Called only after risk evaluation passes.
   * @param {object} intent
   * @returns {Promise<AdapterExecutionResult>}
   */
  async execute(intent) { … }
}
```

---

## AdapterSimulationResult

```json
{
  "status":                 "simulated",
  "estimatedCost":          "0.001 ETH",
  "estimatedSlippageBps":   30,
  "estimatedValueUsd":      null,
  "projectedDailyUsd":      null,
  "metadata": {
    "adapter":   "x402_base",
    "network":   "base",
    "chainId":   8453,
    "intentType": "trade.buy"
  }
}
```

> `estimatedValueUsd` and `projectedDailyUsd` are used by the risk engine to
> enforce USD caps.  Set them to `null` when they are not available (caps are
> then ignored for this adapter/intent combination).

---

## AdapterExecutionResult

```json
{
  "status":     "executed",
  "txHash":     "0xabcdef…",
  "backendRef": "x402:ts36id-xyz",
  "metadata": {
    "adapter":    "x402_base",
    "network":    "base",
    "chainId":    8453,
    "intentType": "trade.buy"
  }
}
```

---

## Available Adapters

### `X402BaseAdapter` — `@haven/adapter-x402-base`

| Field | Value |
|-------|-------|
| `name` | `x402_base` |
| Package | `packages/adapters/adapter-x402-base` |
| Network | Base (chainId 8453) |
| Protocol | Coinbase AgentKit / x402 payment protocol |

**Supported intent types:**
- `payment.m2m`
- `trade.swap`
- `trade.buy`
- `trade.sell`
- `trade.rebalance`
- `fund_management.rebalance`
- `fund_management.swap`

**Configuration:**
```js
new X402BaseAdapter({
  rpcUrl:  'https://mainnet.base.org',  // default
  chainId: 8453,                        // default (Base mainnet)
})
```

**Production integration:**
Wire `simulate()` to AgentKit's price-quote API and `execute()` to the x402
payment flow + AgentKit transaction broadcast.

---

### `EvmGenericAdapter` — `@haven/adapter-evm-generic`

| Field | Value |
|-------|-------|
| `name` | `evm_generic` |
| Package | `packages/adapters/adapter-evm-generic` |
| Network | Any EVM-compatible chain |

**Supported intent types:**
- `trade.swap`
- `trade.buy`
- `trade.sell`
- `payment.m2m`
- `fund_management.rebalance`

**Configuration:**
```js
new EvmGenericAdapter({
  rpcUrl:        'https://mainnet.infura.io/v3/<KEY>',
  chainId:       1,
  routerAddress: '0xE592427A0AEce92De3Edee1F18E0157C05861564', // Uniswap V3
})
```

**Production integration:**
Use `ethers.js` or `viem` to encode calldata for the router contract, estimate
gas with `eth_estimateGas`, and broadcast the signed transaction.

---

### `BridgeAdapter` — `@haven/adapter-bridge`

| Field | Value |
|-------|-------|
| `name` | `bridge` |
| Package | `packages/adapters/adapter-bridge` |
| Protocol | Any cross-chain bridge (Stargate, Across, Hop, LayerZero, …) |

**Supported intent types:**
- `fund_management.rebalance`

**Configuration:**
```js
new BridgeAdapter({
  sourceChainId:         1,          // Ethereum mainnet
  targetChainId:         8453,       // Base
  bridgeContractAddress: '0xStargate…',
})
```

**Production integration:**
1. Approve token spend on source chain
2. Call `bridge.send()` on the source contract
3. Poll destination chain for receipt
4. Return both source and (when available) destination `txHash`

---

## Registering Adapters with the Engine

```js
const { IntentEngine } = require('@haven/core-intent-engine');
const { X402BaseAdapter }  = require('@haven/adapter-x402-base');
const { EvmGenericAdapter } = require('@haven/adapter-evm-generic');
const { BridgeAdapter }    = require('@haven/adapter-bridge');

const engine = new IntentEngine({
  adapters: [
    new X402BaseAdapter(),               // tried first
    new EvmGenericAdapter({ chainId: 1 }),
    new BridgeAdapter({ sourceChainId: 1, targetChainId: 8453 }),
  ],
});
```

Adapters are evaluated in registration order; the **first match wins**.

---

## Writing a Custom Adapter

```js
'use strict';

class MyCustomAdapter {
  constructor(config = {}) {
    this.name = 'my_custom';
    this.config = config;
  }

  supports(intentType) {
    return ['trade.buy', 'trade.sell'].includes(intentType);
  }

  async simulate(intent) {
    // Query your protocol for price/fee estimates
    return {
      status: 'simulated',
      estimatedCost: '…',
      estimatedSlippageBps: 0,
      estimatedValueUsd: null,
      projectedDailyUsd: null,
      metadata: { adapter: this.name, intentType: intent.intentType },
    };
  }

  async execute(intent) {
    // Build, sign, and broadcast the transaction
    return {
      status: 'executed',
      txHash: '0x…',
      backendRef: 'my_custom:…',
      metadata: { adapter: this.name, intentType: intent.intentType },
    };
  }
}

module.exports = { MyCustomAdapter };
```
