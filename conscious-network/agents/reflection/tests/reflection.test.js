/**
 * Tests for Reflection Agent
 */

'use strict';

const assert = require('assert');
const { InMemoryEventBus, createMessage } = require('../../../core/event-bus');
const { StateStore } = require('../../../core/state');
const { ReflectionAgent } = require('../index');

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
  // Disable timer; use manual trigger in tests
  return new ReflectionAgent({ bus, state, healthPort: null, reflectionIntervalMs: 9_999_999, ...extra });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test('triggerReflection returns summary with required fields', async () => {
  const agent = makeAgent();
  await agent.start();

  const summary = await agent.triggerReflection();

  assert.ok(summary.reflectionId, 'reflectionId required');
  assert.ok(typeof summary.reflectionIndex === 'number');
  assert.ok(summary.generatedAt);
  assert.ok(Array.isArray(summary.topTopics));
  assert.ok(typeof summary.narrative === 'string');

  await agent.stop();
});

test('reflection increments reflectionIndex', async () => {
  const agent = makeAgent();
  await agent.start();

  const r1 = await agent.triggerReflection();
  const r2 = await agent.triggerReflection();
  const r3 = await agent.triggerReflection();

  assert.strictEqual(r1.reflectionIndex, 1);
  assert.strictEqual(r2.reflectionIndex, 2);
  assert.strictEqual(r3.reflectionIndex, 3);

  await agent.stop();
});

test('reflection stores summary in knowledge base', async () => {
  const agent = makeAgent();
  await agent.start();

  await agent.triggerReflection();

  const latest = agent.state.get_knowledge('reflection.latest');
  assert.ok(latest);
  assert.ok(latest.reflectionId);

  await agent.stop();
});

test('reflection appends to reflection.summaries stream', async () => {
  const agent = makeAgent();
  await agent.start();

  await agent.triggerReflection();
  await agent.triggerReflection();

  const events = agent.state.read_stream('reflection.summaries');
  assert.strictEqual(events.length, 2);

  await agent.stop();
});

test('reflection publishes reflection.summary event', async () => {
  const agent = makeAgent();
  await agent.start();

  const received = [];
  agent.bus.subscribe('reflection.summary', (m) => received.push(m));

  await agent.triggerReflection();

  assert.strictEqual(received.length, 1);
  assert.strictEqual(received[0].type, 'SystemReflection');

  await agent.stop();
});

test('reflection.trigger subscription fires reflection', async () => {
  const agent = makeAgent();
  await agent.start();

  const received = [];
  agent.bus.subscribe('reflection.summary', (m) => received.push(m));

  await agent.bus.publish(createMessage('reflection.trigger', 'ManualTrigger', {}));
  await new Promise((r) => setTimeout(r, 50));

  assert.ok(received.length >= 1, 'reflection should have been triggered');

  await agent.stop();
});

test('narrative includes learning insight when available', async () => {
  const agent = makeAgent();
  await agent.start();

  agent.state.set_knowledge('learning.latestInsight', {
    totalEventsObserved: 42,
    uniqueTopics: 3,
    generatedAt: new Date().toISOString(),
    topTopics: [],
  });

  const summary = await agent.triggerReflection();
  assert.ok(summary.narrative.includes('42'), 'narrative should include event count');

  await agent.stop();
});

run();
