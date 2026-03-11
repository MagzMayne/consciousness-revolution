/**
 * Tests for Communication Agent
 */

'use strict';

const assert = require('assert');
const { InMemoryEventBus, createMessage } = require('../../../core/event-bus');
const { StateStore } = require('../../../core/state');
const { CommunicationAgent } = require('../index');

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
  return new CommunicationAgent({ bus, state, healthPort: null, httpPort: 0, ...extra });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test('injectMessage publishes communication.inbound', async () => {
  const agent = makeAgent();
  await agent.start();

  const received = [];
  agent.bus.subscribe('communication.inbound', (m) => received.push(m));

  await agent.injectMessage('Hello network');

  assert.strictEqual(received.length, 1);
  assert.strictEqual(received[0].type, 'UserMessage');
  assert.strictEqual(received[0].payload.text, 'Hello network');
  assert.strictEqual(received[0].source, 'communication');

  await agent.stop();
});

test('injectMessage appends to state stream', async () => {
  const agent = makeAgent();
  await agent.start();

  await agent.injectMessage('Test message');

  const events = agent.state.read_stream('communication.inbound');
  assert.ok(events.length >= 1);
  assert.strictEqual(events[0].payload.text, 'Test message');

  await agent.stop();
});

test('injectMessage uses provided correlationId', async () => {
  const agent = makeAgent();
  await agent.start();

  const received = [];
  agent.bus.subscribe('communication.inbound', (m) => received.push(m));

  await agent.injectMessage('Hi', { correlationId: 'my-cid-123' });

  assert.strictEqual(received[0].correlationId, 'my-cid-123');
  await agent.stop();
});

test('outbound reply is stored in state', async () => {
  const agent = makeAgent();
  await agent.start();

  // Inject a message to get a correlationId
  const sentMsg = await agent.injectMessage('test');

  // Simulate outbound reply from another agent
  await agent.bus.publish(createMessage('communication.outbound', 'OutboundReply', { content: 'reply' }, {
    correlationId: sentMsg.correlationId,
  }));

  const events = agent.state.read_stream('communication.outbound');
  assert.ok(events.length >= 1);

  await agent.stop();
});

test('health report shows agent name and status', async () => {
  const agent = makeAgent();
  await agent.start();

  const h = agent.getHealth();
  assert.strictEqual(h.agent, 'communication');
  assert.strictEqual(h.status, 'ok');

  await agent.stop();
});

run();
