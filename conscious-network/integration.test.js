/**
 * End-to-end integration test
 *
 * Spins up all 7 agents on a shared in-memory bus and validates the full
 * message flow described in the architecture:
 *
 *   User → Communication → Coordination → Creation → Communication (reply)
 *                             ↓                          ↓
 *                         Learning ← ← ← ← ← ← ← ← ← ←┘
 *                             ↓
 *                          Adaptation
 *
 * Reflection is triggered manually at the end.
 */

'use strict';

const assert = require('assert');
const { InMemoryEventBus } = require('./core/event-bus');
const { StateStore } = require('./core/state');

const { CommunicationAgent } = require('./agents/communication');
const { CoordinationAgent } = require('./agents/coordination');
const { LearningAgent } = require('./agents/learning');
const { AdaptationAgent } = require('./agents/adaptation');
const { ActionAgent } = require('./agents/action');
const { ReflectionAgent } = require('./agents/reflection');
const { CreationAgent } = require('./agents/creation');

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }

async function run() {
  let passed = 0, failed = 0;
  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`  ✓  ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗  ${name}`);
      console.error(`     ${err.message}`);
      if (process.env.VERBOSE) console.error(err.stack);
      failed++;
    }
  }
  console.log(`\n  ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildNetwork(overrides = {}) {
  const bus = new InMemoryEventBus();
  const state = new StateStore();
  const shared = { bus, state, healthPort: null };

  const comm = new CommunicationAgent({ ...shared, httpPort: 0 });
  const coord = new CoordinationAgent(shared);
  const learn = new LearningAgent({ ...shared, httpPort: 0, insightIntervalMs: 9_999_999 });
  const adapt = new AdaptationAgent(shared);
  const action = new ActionAgent({ ...shared, safeMode: true });
  const reflect = new ReflectionAgent({ ...shared, reflectionIntervalMs: 9_999_999 });
  const create = new CreationAgent(shared);

  return { bus, state, comm, coord, learn, adapt, action, reflect, create };
}

async function startAll(network) {
  await Promise.all(Object.values(network)
    .filter((v) => v && typeof v.start === 'function')
    .map((a) => a.start()));
}

async function stopAll(network) {
  await Promise.all(Object.values(network)
    .filter((v) => v && typeof v.stop === 'function')
    .map((a) => a.stop()));
}

function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

// ─── Tests ────────────────────────────────────────────────────────────────────

test('full inbound → creation → outbound flow', async () => {
  const net = buildNetwork();
  await startAll(net);

  const outboundEvents = [];
  net.bus.subscribe('communication.outbound', (m) => outboundEvents.push(m));

  await net.comm.injectMessage('Hello conscious network!');
  await wait(300); // allow all async handlers to settle

  assert.ok(outboundEvents.length >= 1, 'communication.outbound should have been emitted');
  const reply = outboundEvents[0].payload;
  assert.ok(reply.output || reply.content || reply.originalText || JSON.stringify(reply).length > 0,
    'outbound payload should be non-empty');

  await stopAll(net);
});

test('learning agent records the interaction', async () => {
  const net = buildNetwork();
  await startAll(net);

  await net.comm.injectMessage('Learn from me');
  await wait(200);

  const counts = net.state.get_knowledge('learning.counts');
  assert.ok(counts, 'learning.counts should be in knowledge base');
  assert.ok(counts['communication.inbound'] >= 1, 'communication.inbound should be counted');

  await stopAll(net);
});

test('coordination routing table is in shared state', async () => {
  const net = buildNetwork();
  await startAll(net);

  const table = net.state.get_state('coordination.routingTable');
  assert.ok(table, 'routing table should be in shared state');
  assert.ok(table['communication.inbound'], 'should have rules for communication.inbound');

  await stopAll(net);
});

test('creation.output is routed to communication.outbound', async () => {
  const net = buildNetwork();
  await startAll(net);

  const outbound = [];
  net.bus.subscribe('communication.outbound', (m) => outbound.push(m));

  await net.comm.injectMessage('route me');
  await wait(200);

  assert.ok(outbound.length >= 1, 'creation output should be routed to communication.outbound');
  // The correlationId should be preserved end-to-end
  const inboundEvents = net.state.read_stream('communication.inbound');
  assert.ok(inboundEvents.length >= 1);
  const origCid = inboundEvents[0].payload.correlationId;
  if (origCid) {
    // correlationId should flow through
    const matchingOutbound = outbound.find((m) => m.correlationId === origCid);
    assert.ok(matchingOutbound, 'outbound should carry same correlationId as inbound');
  }

  await stopAll(net);
});

test('reflection summarises recent events', async () => {
  const net = buildNetwork();
  await startAll(net);

  await net.comm.injectMessage('test for reflection');
  await wait(200);

  const summary = await net.reflect.triggerReflection();

  assert.ok(summary.reflectionId);
  assert.ok(summary.narrative);
  assert.ok(typeof summary.recentEventCount === 'number');

  await stopAll(net);
});

test('action agent in safe mode does not execute but publishes result', async () => {
  const net = buildNetwork();
  await startAll(net);

  const results = [];
  net.bus.subscribe('action.result', (m) => results.push(m));

  // Manually publish an action.request
  const { createMessage } = require('./core/event-bus');
  await net.bus.publish(createMessage('action.request', 'ActionRequest', {
    actionType: 'sendNotification',
    parameters: { message: 'test' },
  }));
  await wait(100);

  assert.ok(results.length >= 1);
  assert.strictEqual(results[0].type, 'ActionSkipped');

  await stopAll(net);
});

test('multiple messages maintain independent correlationIds', async () => {
  const net = buildNetwork();
  await startAll(net);

  const outbound = [];
  net.bus.subscribe('communication.outbound', (m) => outbound.push(m));

  await net.comm.injectMessage('Message 1', { correlationId: 'cid-1' });
  await net.comm.injectMessage('Message 2', { correlationId: 'cid-2' });
  await wait(300);

  const cids = outbound.map((m) => m.correlationId);
  assert.ok(cids.includes('cid-1'), 'cid-1 should appear in outbound');
  assert.ok(cids.includes('cid-2'), 'cid-2 should appear in outbound');

  await stopAll(net);
});

test('adaptation processes learning insights without crashing', async () => {
  const net = buildNetwork();
  await startAll(net);

  // Trigger insight manually
  await net.learn._emitInsight();
  await wait(100);

  // Should have processed without error
  const record = net.state.get_knowledge('adaptation.lastInsightProcessed');
  assert.ok(record, 'adaptation should have processed the insight');

  await stopAll(net);
});

run();
