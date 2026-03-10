'use strict';

/**
 * tests/adapters.test.js
 *
 * Tests for all adapter implementations.
 * Uses only Node.js built-in modules (assert) — no external test framework.
 */

const assert = require('assert');
const path = require('path');

const { X402BaseAdapter } = require(
  path.resolve(__dirname, '../packages/adapters/adapter-x402-base/index')
);
const { EvmGenericAdapter } = require(
  path.resolve(__dirname, '../packages/adapters/adapter-evm-generic/index')
);
const { BridgeAdapter } = require(
  path.resolve(__dirname, '../packages/adapters/adapter-bridge/index')
);
const { createIntent } = require(
  path.resolve(__dirname, '../packages/core-intent-engine/schema')
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

function makeIntent(intentType, params = {}) {
  return createIntent({
    id: `i-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    agentId: 'test-agent',
    intentType,
    parameters: params,
  });
}

// ---------------------------------------------------------------------------
// X402BaseAdapter
// ---------------------------------------------------------------------------
async function runX402Tests() {
  console.log('\nX402BaseAdapter:');

  await test('instantiates with defaults', () => {
    const adapter = new X402BaseAdapter();
    assert.strictEqual(adapter.name, 'x402_base');
    assert.strictEqual(adapter.config.chainId, 8453);
  });

  await test('instantiates with custom config', () => {
    const adapter = new X402BaseAdapter({ rpcUrl: 'https://my-rpc.example', chainId: 1 });
    assert.strictEqual(adapter.config.rpcUrl, 'https://my-rpc.example');
    assert.strictEqual(adapter.config.chainId, 1);
  });

  await test('supports payment.m2m', () => {
    assert.strictEqual(new X402BaseAdapter().supports('payment.m2m'), true);
  });

  await test('supports trade.swap', () => {
    assert.strictEqual(new X402BaseAdapter().supports('trade.swap'), true);
  });

  await test('supports trade.buy', () => {
    assert.strictEqual(new X402BaseAdapter().supports('trade.buy'), true);
  });

  await test('supports trade.sell', () => {
    assert.strictEqual(new X402BaseAdapter().supports('trade.sell'), true);
  });

  await test('supports trade.rebalance', () => {
    assert.strictEqual(new X402BaseAdapter().supports('trade.rebalance'), true);
  });

  await test('supports fund_management.rebalance', () => {
    assert.strictEqual(new X402BaseAdapter().supports('fund_management.rebalance'), true);
  });

  await test('supports fund_management.swap', () => {
    assert.strictEqual(new X402BaseAdapter().supports('fund_management.swap'), true);
  });

  await test('does NOT support payment.subscription', () => {
    assert.strictEqual(new X402BaseAdapter().supports('payment.subscription'), false);
  });

  await test('simulate returns correct shape', async () => {
    const adapter = new X402BaseAdapter();
    const intent = makeIntent('trade.buy', { asset: 'ETH', amount: '1' });
    const result = await adapter.simulate(intent);
    assert.strictEqual(result.status, 'simulated');
    assert.ok(result.estimatedCost);
    assert.ok(typeof result.estimatedSlippageBps === 'number');
    assert.strictEqual(result.metadata.adapter, 'x402_base');
    assert.strictEqual(result.metadata.network, 'base');
  });

  await test('execute returns correct shape with txHash', async () => {
    const adapter = new X402BaseAdapter();
    const intent = makeIntent('trade.swap', { fromAsset: 'ETH', toAsset: 'USDC' });
    const result = await adapter.execute(intent);
    assert.strictEqual(result.status, 'executed');
    assert.ok(result.txHash.startsWith('0x'));
    assert.strictEqual(result.txHash.length, 66); // 0x + 64 hex chars
    assert.ok(result.backendRef.startsWith('x402:'));
    assert.strictEqual(result.metadata.adapter, 'x402_base');
  });

  await test('execute produces unique txHash on each call', async () => {
    const adapter = new X402BaseAdapter();
    const intent = makeIntent('trade.buy', { asset: 'ETH' });
    const r1 = await adapter.execute(intent);
    const r2 = await adapter.execute(intent);
    assert.notStrictEqual(r1.txHash, r2.txHash);
  });
}

// ---------------------------------------------------------------------------
// EvmGenericAdapter
// ---------------------------------------------------------------------------
async function runEvmGenericTests() {
  console.log('\nEvmGenericAdapter:');

  await test('instantiates with defaults', () => {
    const adapter = new EvmGenericAdapter();
    assert.strictEqual(adapter.name, 'evm_generic');
    assert.strictEqual(adapter.config.rpcUrl, null);
  });

  await test('instantiates with custom config', () => {
    const adapter = new EvmGenericAdapter({
      rpcUrl: 'https://eth-rpc.example',
      chainId: 1,
      routerAddress: '0xRouter',
    });
    assert.strictEqual(adapter.config.rpcUrl, 'https://eth-rpc.example');
    assert.strictEqual(adapter.config.chainId, 1);
    assert.strictEqual(adapter.config.routerAddress, '0xRouter');
  });

  await test('supports trade.swap', () => {
    assert.strictEqual(new EvmGenericAdapter().supports('trade.swap'), true);
  });

  await test('supports trade.buy', () => {
    assert.strictEqual(new EvmGenericAdapter().supports('trade.buy'), true);
  });

  await test('supports trade.sell', () => {
    assert.strictEqual(new EvmGenericAdapter().supports('trade.sell'), true);
  });

  await test('supports payment.m2m', () => {
    assert.strictEqual(new EvmGenericAdapter().supports('payment.m2m'), true);
  });

  await test('supports fund_management.rebalance', () => {
    assert.strictEqual(new EvmGenericAdapter().supports('fund_management.rebalance'), true);
  });

  await test('does NOT support fund_management.swap', () => {
    assert.strictEqual(new EvmGenericAdapter().supports('fund_management.swap'), false);
  });

  await test('does NOT support payment.subscription', () => {
    assert.strictEqual(new EvmGenericAdapter().supports('payment.subscription'), false);
  });

  await test('simulate returns correct shape', async () => {
    const adapter = new EvmGenericAdapter();
    const intent = makeIntent('trade.buy', { asset: 'ETH', amount: '1' });
    const result = await adapter.simulate(intent);
    assert.strictEqual(result.status, 'simulated');
    assert.ok(result.estimatedCost);
    assert.ok(typeof result.estimatedSlippageBps === 'number');
    assert.strictEqual(result.metadata.adapter, 'evm_generic');
  });

  await test('execute returns correct shape with txHash', async () => {
    const adapter = new EvmGenericAdapter();
    const intent = makeIntent('trade.sell', { asset: 'ETH', amount: '0.5' });
    const result = await adapter.execute(intent);
    assert.strictEqual(result.status, 'executed');
    assert.ok(result.txHash.startsWith('0x'));
    assert.ok(result.backendRef.startsWith('evm:'));
    assert.strictEqual(result.metadata.adapter, 'evm_generic');
  });
}

// ---------------------------------------------------------------------------
// BridgeAdapter
// ---------------------------------------------------------------------------
async function runBridgeTests() {
  console.log('\nBridgeAdapter:');

  await test('instantiates with defaults', () => {
    const adapter = new BridgeAdapter();
    assert.strictEqual(adapter.name, 'bridge');
    assert.strictEqual(adapter.config.sourceChainId, null);
    assert.strictEqual(adapter.config.targetChainId, null);
  });

  await test('instantiates with custom config', () => {
    const adapter = new BridgeAdapter({
      sourceChainId: 1,
      targetChainId: 8453,
      bridgeContractAddress: '0xBridge',
    });
    assert.strictEqual(adapter.config.sourceChainId, 1);
    assert.strictEqual(adapter.config.targetChainId, 8453);
    assert.strictEqual(adapter.config.bridgeContractAddress, '0xBridge');
  });

  await test('supports fund_management.rebalance', () => {
    assert.strictEqual(new BridgeAdapter().supports('fund_management.rebalance'), true);
  });

  await test('does NOT support trade.swap', () => {
    assert.strictEqual(new BridgeAdapter().supports('trade.swap'), false);
  });

  await test('does NOT support payment.m2m', () => {
    assert.strictEqual(new BridgeAdapter().supports('payment.m2m'), false);
  });

  await test('simulate returns correct shape with bridge-specific fields', async () => {
    const adapter = new BridgeAdapter({ sourceChainId: 1, targetChainId: 8453 });
    const intent = makeIntent('fund_management.rebalance', { asset: 'USDC', amount: '1000' });
    const result = await adapter.simulate(intent);
    assert.strictEqual(result.status, 'simulated');
    assert.ok(result.estimatedBridgeFee);
    assert.ok(typeof result.estimatedConfirmationTimeSeconds === 'number');
    assert.strictEqual(result.metadata.adapter, 'bridge');
    assert.strictEqual(result.metadata.sourceChainId, 1);
    assert.strictEqual(result.metadata.targetChainId, 8453);
  });

  await test('execute returns correct shape with txHash', async () => {
    const adapter = new BridgeAdapter({ sourceChainId: 1, targetChainId: 8453 });
    const intent = makeIntent('fund_management.rebalance', { asset: 'USDC', amount: '500' });
    const result = await adapter.execute(intent);
    assert.strictEqual(result.status, 'executed');
    assert.ok(result.txHash.startsWith('0x'));
    assert.ok(result.backendRef.startsWith('bridge:'));
    assert.strictEqual(result.metadata.adapter, 'bridge');
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
(async () => {
  console.log('=== adapter tests ===');

  await runX402Tests();
  await runEvmGenericTests();
  await runBridgeTests();

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
})();
