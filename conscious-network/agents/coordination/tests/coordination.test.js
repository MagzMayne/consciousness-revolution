/**
 * Tests for Coordination Agent
 */

'use strict';

const assert = require('assert');
const { InMemoryEventBus, createMessage } = require('../../../core/event-bus');
const { StateStore } = require('../../../core/state');
const { CoordinationAgent } = require('../index');

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
      failed++;
    }
  }
  console.log(`\n  ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

function makeAgent(extra = {}) {
  const bus = new InMemoryEventBus();
  const state = new StateStore();
  return new CoordinationAgent({ bus, state, healthPort: null, ...extra });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test('routes communication.inbound → creation.request + experience.event', async () => {
  const agent = makeAgent();
  await agent.start();

  const downstream = [];
  agent.bus.subscribe('creation.request', (m) => downstream.push({ topic: 'creation.request', m }));
  agent.bus.subscribe('experience.event', (m) => downstream.push({ topic: 'experience.event', m }));

  await agent.bus.publish(createMessage('communication.inbound', 'UserMessage', { text: 'Hi' }));

  // Allow microtasks to settle
  await new Promise((r) => setTimeout(r, 50));

  assert.ok(downstream.some((d) => d.topic === 'creation.request'), 'creation.request expected');
  assert.ok(downstream.some((d) => d.topic === 'experience.event'), 'experience.event expected');

  await agent.stop();
});

test('routing preserves correlationId', async () => {
  const agent = makeAgent();
  await agent.start();

  const received = [];
  agent.bus.subscribe('creation.request', (m) => received.push(m));

  const inbound = createMessage('communication.inbound', 'UserMessage', { text: 'trace me' }, {
    correlationId: 'trace-cid',
  });
  await agent.bus.publish(inbound);
  await new Promise((r) => setTimeout(r, 50));

  assert.ok(received.length > 0);
  assert.strictEqual(received[0].correlationId, 'trace-cid');

  await agent.stop();
});

test('updateRoutingRule changes behaviour at runtime', async () => {
  const agent = makeAgent();
  await agent.start();

  // Override: communication.inbound → only action.request
  agent.updateRoutingRule('communication.inbound', [
    { emit: 'action.request', type: 'ActionTask', passPayload: true },
  ]);

  const actionReceived = [];
  const creationReceived = [];
  agent.bus.subscribe('action.request', (m) => actionReceived.push(m));
  agent.bus.subscribe('creation.request', (m) => creationReceived.push(m));

  await agent.bus.publish(createMessage('communication.inbound', 'UserMessage', { text: 'act' }));
  await new Promise((r) => setTimeout(r, 50));

  assert.ok(actionReceived.length > 0, 'action.request should be emitted');
  assert.strictEqual(creationReceived.length, 0, 'creation.request should NOT be emitted');

  await agent.stop();
});

test('routing appends to state stream', async () => {
  const agent = makeAgent();
  await agent.start();

  await agent.bus.publish(createMessage('communication.inbound', 'UserMessage', { text: 'log me' }));
  await new Promise((r) => setTimeout(r, 50));

  const events = agent.state.read_stream('coordination.routed');
  assert.ok(events.length >= 1);
  assert.ok(events[0].payload.from === 'communication.inbound');

  await agent.stop();
});

test('routing table is persisted in shared state', async () => {
  const bus = new InMemoryEventBus();
  const state = new StateStore();
  const agent = new CoordinationAgent({ bus, state, healthPort: null });
  await agent.start();

  const table = state.get_state('coordination.routingTable');
  assert.ok(table);
  assert.ok(table['communication.inbound']);

  await agent.stop();
});

run();
