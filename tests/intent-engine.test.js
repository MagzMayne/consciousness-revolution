'use strict';

/**
 * tests/intent-engine.test.js
 *
 * Tests for core-intent-engine: schema, risk, lineage, and IntentEngine.
 * Uses only Node.js built-in modules (assert) — no external test framework.
 */

const assert = require('assert');
const path = require('path');

const { INTENT_TYPES, isValidIntentType, createIntent } = require(
  path.resolve(__dirname, '../packages/core-intent-engine/schema')
);
const { evaluateRisk, createDefaultEnvelope } = require(
  path.resolve(__dirname, '../packages/core-intent-engine/risk')
);
const { createLineageRecord, InMemoryLineageStore } = require(
  path.resolve(__dirname, '../packages/core-intent-engine/lineage')
);
const { IntentEngine } = require(
  path.resolve(__dirname, '../packages/core-intent-engine/index')
);
const { X402BaseAdapter } = require(
  path.resolve(__dirname, '../packages/adapters/adapter-x402-base/index')
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    const result = fn();
    if (result && typeof result.then === 'function') {
      return result.then(() => {
        console.log(`  ✓ ${name}`);
        passed++;
      }).catch((err) => {
        console.error(`  ✗ ${name}`);
        console.error(`    ${err.message}`);
        failed++;
      });
    }
    console.log(`  ✓ ${name}`);
    passed++;
    return Promise.resolve();
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    failed++;
    return Promise.resolve();
  }
}

// ---------------------------------------------------------------------------
// schema tests
// ---------------------------------------------------------------------------
async function runSchemaTests() {
  console.log('\nschema.js:');

  await test('INTENT_TYPES is a non-empty array', () => {
    assert.ok(Array.isArray(INTENT_TYPES));
    assert.ok(INTENT_TYPES.length > 0);
  });

  await test('isValidIntentType returns true for known type', () => {
    assert.strictEqual(isValidIntentType('trade.buy'), true);
    assert.strictEqual(isValidIntentType('payment.m2m'), true);
  });

  await test('isValidIntentType returns false for unknown type', () => {
    assert.strictEqual(isValidIntentType('unknown.action'), false);
    assert.strictEqual(isValidIntentType(''), false);
    assert.strictEqual(isValidIntentType(null), false);
  });

  await test('createIntent returns a valid intent object', () => {
    const intent = createIntent({
      id: 'i-001',
      agentId: 'agent-1',
      intentType: 'trade.buy',
      parameters: { asset: 'ETH', amount: '1.0' },
    });
    assert.strictEqual(intent.id, 'i-001');
    assert.strictEqual(intent.agentId, 'agent-1');
    assert.strictEqual(intent.intentType, 'trade.buy');
    assert.ok(intent.createdAt);
  });

  await test('createIntent throws for invalid intentType', () => {
    assert.throws(
      () => createIntent({ id: 'i-1', agentId: 'a', intentType: 'bad.type', parameters: {} }),
      /invalid intentType/
    );
  });

  await test('createIntent throws when id is missing', () => {
    assert.throws(
      () => createIntent({ agentId: 'a', intentType: 'trade.buy', parameters: {} }),
      /missing required field "id"/
    );
  });

  await test('createIntent throws when agentId is missing', () => {
    assert.throws(
      () => createIntent({ id: 'i-1', intentType: 'trade.buy', parameters: {} }),
      /missing required field "agentId"/
    );
  });

  await test('createIntent throws when parameters is missing', () => {
    assert.throws(
      () => createIntent({ id: 'i-1', agentId: 'a', intentType: 'trade.buy' }),
      /missing required field "parameters"/
    );
  });

  await test('createIntent includes default context when omitted', () => {
    const intent = createIntent({
      id: 'i-2',
      agentId: 'a',
      intentType: 'trade.sell',
      parameters: { asset: 'ETH' },
    });
    assert.deepStrictEqual(intent.context, {});
  });
}

// ---------------------------------------------------------------------------
// risk tests
// ---------------------------------------------------------------------------
async function runRiskTests() {
  console.log('\nrisk.js:');

  const baseIntent = createIntent({
    id: 'i-r1',
    agentId: 'agent-risk',
    intentType: 'trade.buy',
    parameters: { asset: 'ETH', amount: '1.0' },
  });

  const baseSim = { estimatedValueUsd: 100, projectedDailyUsd: 100 };

  await test('createDefaultEnvelope returns a permissive envelope', () => {
    const env = createDefaultEnvelope('agent-1');
    assert.strictEqual(env.agentId, 'agent-1');
    assert.ok(Array.isArray(env.allowedIntentTypes));
    assert.strictEqual(env.allowedIntentTypes.length, 0);
    assert.strictEqual(env.maxPerTxUsd, null);
  });

  await test('evaluateRisk allows by default (no envelope)', () => {
    const result = evaluateRisk(baseIntent, baseSim, null);
    assert.strictEqual(result.allowed, true);
  });

  await test('evaluateRisk allows with permissive default envelope', () => {
    const env = createDefaultEnvelope('agent-risk');
    const result = evaluateRisk(baseIntent, baseSim, env);
    assert.strictEqual(result.allowed, true);
  });

  await test('evaluateRisk blocks when intentType not in allowedIntentTypes', () => {
    const env = createDefaultEnvelope('agent-risk');
    env.allowedIntentTypes = ['payment.m2m'];  // trade.buy is not allowed
    const result = evaluateRisk(baseIntent, baseSim, env);
    assert.strictEqual(result.allowed, false);
    assert.ok(result.flags.includes('intent_type_blocked'));
  });

  await test('evaluateRisk allows when intentType is in allowedIntentTypes', () => {
    const env = createDefaultEnvelope('agent-risk');
    env.allowedIntentTypes = ['trade.buy', 'trade.sell'];
    const result = evaluateRisk(baseIntent, baseSim, env);
    assert.strictEqual(result.allowed, true);
  });

  await test('evaluateRisk blocks when per-tx cap exceeded', () => {
    const env = createDefaultEnvelope('agent-risk');
    env.maxPerTxUsd = 50;
    const result = evaluateRisk(baseIntent, { estimatedValueUsd: 200 }, env);
    assert.strictEqual(result.allowed, false);
    assert.ok(result.flags.includes('per_tx_cap_exceeded'));
  });

  await test('evaluateRisk blocks when daily cap exceeded', () => {
    const env = createDefaultEnvelope('agent-risk');
    env.maxDailyUsd = 500;
    const result = evaluateRisk(baseIntent, { projectedDailyUsd: 1000 }, env);
    assert.strictEqual(result.allowed, false);
    assert.ok(result.flags.includes('daily_cap_exceeded'));
  });

  await test('evaluateRisk blocks asset not in allowedAssets', () => {
    const env = createDefaultEnvelope('agent-risk');
    env.allowedAssets = ['USDC'];
    const result = evaluateRisk(baseIntent, baseSim, env);
    assert.strictEqual(result.allowed, false);
    assert.ok(result.flags.includes('asset_not_allowed'));
  });

  await test('evaluateRisk blocks asset in blockedAssets', () => {
    const env = createDefaultEnvelope('agent-risk');
    env.blockedAssets = ['ETH'];
    const result = evaluateRisk(baseIntent, baseSim, env);
    assert.strictEqual(result.allowed, false);
    assert.ok(result.flags.includes('asset_blocked'));
  });

  await test('evaluateRisk blocks destination in blockedDestinations', () => {
    const env = createDefaultEnvelope('agent-risk');
    env.blockedDestinations = ['0xDEAD'];
    const intentWithDest = createIntent({
      id: 'i-r2',
      agentId: 'agent-risk',
      intentType: 'payment.m2m',
      parameters: { destination: '0xDEAD', amount: '1.0' },
    });
    const result = evaluateRisk(intentWithDest, baseSim, env);
    assert.strictEqual(result.allowed, false);
    assert.ok(result.flags.includes('destination_blocked'));
  });

  await test('evaluateRisk blocks destination not in allowedDestinations', () => {
    const env = createDefaultEnvelope('agent-risk');
    env.allowedDestinations = ['0xGOOD'];
    const intentWithDest = createIntent({
      id: 'i-r3',
      agentId: 'agent-risk',
      intentType: 'payment.m2m',
      parameters: { destination: '0xOTHER', amount: '1.0' },
    });
    const result = evaluateRisk(intentWithDest, baseSim, env);
    assert.strictEqual(result.allowed, false);
    assert.ok(result.flags.includes('destination_not_allowed'));
  });
}

// ---------------------------------------------------------------------------
// lineage tests
// ---------------------------------------------------------------------------
async function runLineageTests() {
  console.log('\nlineage.js:');

  await test('createLineageRecord creates a frozen record with expected fields', () => {
    const record = createLineageRecord({
      intentId: 'i-001',
      agentId: 'agent-1',
      intentType: 'trade.buy',
      parametersSnapshot: { asset: 'ETH' },
      riskDecision: { allowed: true, reason: 'ok', flags: [] },
      backend: 'x402_base',
      txHash: '0xabc',
      backendRef: 'x402:ref-1',
    });

    assert.ok(record.id);
    assert.strictEqual(record.intentId, 'i-001');
    assert.strictEqual(record.agentId, 'agent-1');
    assert.strictEqual(record.backend, 'x402_base');
    assert.strictEqual(record.txHash, '0xabc');
    assert.ok(record.timestamp);
  });

  await test('InMemoryLineageStore.save and getById round-trip', () => {
    const store = new InMemoryLineageStore();
    const record = createLineageRecord({
      intentId: 'i-002',
      agentId: 'agent-2',
      intentType: 'payment.m2m',
      parametersSnapshot: {},
      riskDecision: { allowed: true, reason: 'ok', flags: [] },
      backend: 'x402_base',
    });

    store.save(record);
    const retrieved = store.getById(record.id);
    assert.strictEqual(retrieved.id, record.id);
    assert.strictEqual(retrieved.agentId, 'agent-2');
  });

  await test('InMemoryLineageStore.getById returns null for missing id', () => {
    const store = new InMemoryLineageStore();
    assert.strictEqual(store.getById('nonexistent'), null);
  });

  await test('InMemoryLineageStore.listByAgent filters correctly', () => {
    const store = new InMemoryLineageStore();
    const mkRecord = (agentId) => createLineageRecord({
      intentId: 'i-' + Math.random(),
      agentId,
      intentType: 'trade.buy',
      parametersSnapshot: {},
      riskDecision: { allowed: true },
      backend: 'x402_base',
    });

    store.save(mkRecord('agent-A'));
    store.save(mkRecord('agent-A'));
    store.save(mkRecord('agent-B'));

    const forA = store.listByAgent('agent-A');
    assert.strictEqual(forA.length, 2);
    const forB = store.listByAgent('agent-B');
    assert.strictEqual(forB.length, 1);
    const forC = store.listByAgent('agent-C');
    assert.strictEqual(forC.length, 0);
  });

  await test('InMemoryLineageStore.listByTimeRange filters by timestamp', async () => {
    const store = new InMemoryLineageStore();
    const before = new Date();
    await new Promise((r) => setTimeout(r, 5));

    const rec = createLineageRecord({
      intentId: 'i-t1',
      agentId: 'agent-t',
      intentType: 'trade.buy',
      parametersSnapshot: {},
      riskDecision: { allowed: true },
      backend: 'x402_base',
    });
    store.save(rec);

    await new Promise((r) => setTimeout(r, 5));
    const after = new Date();

    const results = store.listByTimeRange(before, after);
    assert.ok(results.length >= 1);
    assert.ok(results.some((r) => r.id === rec.id));
  });
}

// ---------------------------------------------------------------------------
// IntentEngine tests
// ---------------------------------------------------------------------------
async function runIntentEngineTests() {
  console.log('\nIntentEngine:');

  const makeEngine = () =>
    new IntentEngine({
      adapters: [new X402BaseAdapter()],
      lineageStore: new InMemoryLineageStore(),
      riskEnvelopes: {},
    });

  await test('getAdapter returns adapter for supported type', () => {
    const engine = makeEngine();
    const adapter = engine.getAdapter('trade.buy');
    assert.ok(adapter);
    assert.strictEqual(adapter.name, 'x402_base');
  });

  await test('getAdapter returns null for unsupported type', () => {
    const engine = makeEngine();
    const adapter = engine.getAdapter('payment.subscription');
    assert.strictEqual(adapter, null);
  });

  await test('simulate returns simulation result for supported intent', async () => {
    const engine = makeEngine();
    const intent = createIntent({
      id: 'i-sim-1',
      agentId: 'agent-1',
      intentType: 'trade.buy',
      parameters: { asset: 'ETH', amount: '1.0' },
    });
    const result = await engine.simulate(intent);
    assert.ok(result.simulationResult);
    assert.strictEqual(result.simulationResult.status, 'simulated');
    assert.ok(result.riskDecision);
    assert.strictEqual(result.adapter, 'x402_base');
  });

  await test('simulate throws for unsupported intent type', async () => {
    const engine = makeEngine();
    const intent = createIntent({
      id: 'i-sim-2',
      agentId: 'agent-1',
      intentType: 'payment.subscription',
      parameters: {},
    });
    await assert.rejects(
      () => engine.simulate(intent),
      /no adapter supports/
    );
  });

  await test('execute returns execution result and lineage record', async () => {
    const engine = makeEngine();
    const intent = createIntent({
      id: 'i-exec-1',
      agentId: 'agent-1',
      intentType: 'trade.swap',
      parameters: { fromAsset: 'ETH', toAsset: 'USDC', amount: '0.5' },
    });
    const result = await engine.execute(intent);
    assert.ok(result.executionResult);
    assert.strictEqual(result.executionResult.status, 'executed');
    assert.ok(result.lineageRecord);
    assert.ok(result.lineageRecord.id);
    assert.strictEqual(result.lineageRecord.txHash, result.executionResult.txHash);
  });

  await test('execute saves lineage record in store', async () => {
    const store = new InMemoryLineageStore();
    const engine = new IntentEngine({
      adapters: [new X402BaseAdapter()],
      lineageStore: store,
    });
    const intent = createIntent({
      id: 'i-exec-2',
      agentId: 'agent-store',
      intentType: 'payment.m2m',
      parameters: { to: '0xABC', amount: '10' },
    });
    const result = await engine.execute(intent);
    const found = store.getById(result.lineageRecord.id);
    assert.ok(found);
    assert.strictEqual(found.agentId, 'agent-store');
  });

  await test('execute throws when risk envelope blocks', async () => {
    const engine = new IntentEngine({
      adapters: [new X402BaseAdapter()],
      lineageStore: new InMemoryLineageStore(),
      riskEnvelopes: {
        'agent-blocked': {
          agentId: 'agent-blocked',
          allowedIntentTypes: ['payment.m2m'], // trade.buy is NOT allowed
          maxPerTxUsd: null,
          maxDailyUsd: null,
          allowedAssets: [],
          blockedAssets: [],
          allowedDestinations: [],
          blockedDestinations: [],
        },
      },
    });
    const intent = createIntent({
      id: 'i-blocked',
      agentId: 'agent-blocked',
      intentType: 'trade.buy',
      parameters: { asset: 'ETH' },
    });
    await assert.rejects(
      () => engine.execute(intent),
      /risk envelope blocked/
    );
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
(async () => {
  console.log('=== core-intent-engine tests ===');

  await runSchemaTests();
  await runRiskTests();
  await runLineageTests();
  await runIntentEngineTests();

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
})();
