/**
 * Tests for Learning Agent
 */

'use strict';

const assert = require('assert');
const { InMemoryEventBus, createMessage } = require('../../../core/event-bus');
const { StateStore } = require('../../../core/state');
const { LearningAgent } = require('../index');

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
  // Disable automatic insight scheduling (long interval) for unit tests
  return new LearningAgent({ bus, state, healthPort: null, httpPort: 0, insightIntervalMs: 9_999_999, ...extra });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test('observes experience.event and updates knowledge counts', async () => {
  const agent = makeAgent();
  await agent.start();

  await agent.bus.publish(createMessage('experience.event', 'InteractionExperience', { text: 'hi' }));
  await new Promise((r) => setTimeout(r, 30));

  const counts = agent.state.get_knowledge('learning.counts');
  assert.ok(counts);
  assert.ok(counts['experience.event'] >= 1, 'should count experience.event');

  await agent.stop();
});

test('observes multiple topics and counts them separately', async () => {
  const agent = makeAgent();
  await agent.start();

  await agent.bus.publish(createMessage('experience.event', 'T', {}));
  await agent.bus.publish(createMessage('communication.inbound', 'T', {}));
  await agent.bus.publish(createMessage('communication.inbound', 'T', {}));
  await new Promise((r) => setTimeout(r, 30));

  const counts = agent.state.get_knowledge('learning.counts');
  assert.strictEqual(counts['communication.inbound'], 2);
  assert.strictEqual(counts['experience.event'], 1);

  await agent.stop();
});

test('insight emission stores latestInsight in knowledge base', async () => {
  const agent = makeAgent();
  await agent.start();

  // Trigger insight manually (bypassing timer)
  await agent._emitInsight();

  const insight = agent.state.get_knowledge('learning.latestInsight');
  assert.ok(insight);
  assert.ok(Array.isArray(insight.topTopics));
  assert.ok(typeof insight.totalEventsObserved === 'number');

  await agent.stop();
});

test('insight emission publishes learning.insight event', async () => {
  const agent = makeAgent();
  await agent.start();

  const received = [];
  agent.bus.subscribe('learning.insight', (m) => received.push(m));

  await agent._emitInsight();

  assert.strictEqual(received.length, 1);
  assert.strictEqual(received[0].type, 'PeriodicInsight');

  await agent.stop();
});

test('query returns knowledge base entries by prefix', async () => {
  const agent = makeAgent();
  await agent.start();

  agent.state.set_knowledge('learning.test1', { v: 1 });
  agent.state.set_knowledge('learning.test2', { v: 2 });
  agent.state.set_knowledge('other.thing', { v: 3 });

  const results = agent.query({ prefix: 'learning.' });
  assert.ok(results.every((r) => r.key.startsWith('learning.')));

  await agent.stop();
});

test('observed events are appended to learning.observed stream', async () => {
  const agent = makeAgent();
  await agent.start();

  await agent.bus.publish(createMessage('creation.output', 'GeneratedContent', {}));
  await new Promise((r) => setTimeout(r, 30));

  const events = agent.state.read_stream('learning.observed');
  assert.ok(events.length >= 1);

  await agent.stop();
});

run();
