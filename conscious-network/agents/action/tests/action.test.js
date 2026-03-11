/**
 * Tests for Action Agent
 */

'use strict';

const assert = require('assert');
const { InMemoryEventBus, createMessage } = require('../../../core/event-bus');
const { StateStore } = require('../../../core/state');
const { ActionAgent } = require('../index');

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
  return new ActionAgent({ bus, state, healthPort: null, safeMode: true, ...extra });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test('safe mode is true by default', () => {
  const agent = makeAgent();
  assert.strictEqual(agent.isSafeMode(), true);
});

test('action in safe mode publishes action.result with skipped reason', async () => {
  const agent = makeAgent({ safeMode: true });
  await agent.start();

  const results = [];
  agent.bus.subscribe('action.result', (m) => results.push(m));

  await agent.bus.publish(createMessage('action.request', 'ActionRequest', {
    actionType: 'sendEmail',
    parameters: { to: 'test@example.com' },
  }));

  await new Promise((r) => setTimeout(r, 50));

  assert.ok(results.length >= 1);
  assert.strictEqual(results[0].type, 'ActionSkipped');
  assert.ok(results[0].payload.reason.includes('safe mode'));

  await agent.stop();
});

test('action in safe mode is audited in state stream', async () => {
  const agent = makeAgent({ safeMode: true });
  await agent.start();

  await agent.bus.publish(createMessage('action.request', 'ActionRequest', {
    actionType: 'doSomething',
    parameters: {},
  }));
  await new Promise((r) => setTimeout(r, 50));

  const auditEvents = agent.state.read_stream('action.audit');
  assert.ok(auditEvents.length >= 1);
  assert.strictEqual(auditEvents[0].payload.actionType, 'doSomething');
  assert.strictEqual(auditEvents[0].payload.executed, false);

  await agent.stop();
});

test('without safe mode, unmapped action is ignored but audited', async () => {
  const agent = makeAgent({ safeMode: false });
  await agent.start();

  await agent.bus.publish(createMessage('action.request', 'ActionRequest', {
    actionType: 'unknownAction',
    parameters: {},
  }));
  await new Promise((r) => setTimeout(r, 50));

  const auditEvents = agent.state.read_stream('action.audit');
  assert.ok(auditEvents.length >= 1);
  assert.ok(auditEvents[0].payload.outcome.includes('no mapping'));

  await agent.stop();
});

test('registerMapping stores a new action mapping', () => {
  const agent = makeAgent({ safeMode: false });
  agent.registerMapping('doThing', { kind: 'webhook', url: 'https://example.com/hook' });
  assert.ok(agent._actionMappings['doThing']);
  assert.strictEqual(agent._actionMappings['doThing'].kind, 'webhook');
});

test('action.task topic is also handled', async () => {
  const agent = makeAgent({ safeMode: true });
  await agent.start();

  const results = [];
  agent.bus.subscribe('action.result', (m) => results.push(m));

  // Publish via action.task instead of action.request
  await agent.bus.publish(createMessage('action.task', 'ActionTask', {
    actionType: 'taskAction',
    parameters: {},
  }));
  await new Promise((r) => setTimeout(r, 50));

  assert.ok(results.length >= 1, 'action.task should also trigger handler');

  await agent.stop();
});

run();
