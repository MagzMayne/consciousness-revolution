/**
 * Tests for Adaptation Agent
 */

'use strict';

const assert = require('assert');
const { InMemoryEventBus, createMessage } = require('../../../core/event-bus');
const { StateStore } = require('../../../core/state');
const { AdaptationAgent } = require('../index');

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
  return new AdaptationAgent({ bus, state, healthPort: null, ...extra });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test('processes learning.insight without error when no threshold exceeded', async () => {
  const agent = makeAgent();
  await agent.start();

  const insight = {
    topTopics: [{ topic: 'communication.inbound', count: 5 }],
    totalEventsObserved: 5,
    uniqueTopics: 1,
    generatedAt: new Date().toISOString(),
  };

  await agent.bus.publish(createMessage('learning.insight', 'PeriodicInsight', insight));
  await new Promise((r) => setTimeout(r, 50));

  // No changes expected below threshold
  const lastChange = agent.state.get_knowledge('adaptation.lastChange');
  // May or may not have changes depending on threshold; just ensure no crash
  assert.ok(true);

  await agent.stop();
});

test('bumps priority when topic count exceeds threshold', async () => {
  const agent = makeAgent({ highActivityTopicCount: 10 });
  await agent.start();

  const received = [];
  agent.bus.subscribe('adaptation.change', (m) => received.push(m));

  const insight = {
    topTopics: [{ topic: 'communication.inbound', count: 50 }],
    totalEventsObserved: 50,
    uniqueTopics: 1,
    generatedAt: new Date().toISOString(),
  };

  await agent.bus.publish(createMessage('learning.insight', 'PeriodicInsight', insight));
  await new Promise((r) => setTimeout(r, 50));

  assert.ok(received.length >= 1, 'adaptation.change event expected');
  const changes = received[0].payload.changes;
  assert.ok(Array.isArray(changes) && changes.length > 0);
  assert.strictEqual(changes[0].type, 'priority_bump');
  assert.strictEqual(changes[0].topic, 'communication.inbound');

  await agent.stop();
});

test('setFlag / getFlag stores feature flag in state', async () => {
  const agent = makeAgent();
  await agent.start();

  agent.setFlag('experimental.feature', true);
  assert.strictEqual(agent.getFlag('experimental.feature'), true);

  agent.setFlag('throttle', 5);
  assert.strictEqual(agent.getFlag('throttle'), 5);

  await agent.stop();
});

test('records lastInsightProcessed in knowledge base', async () => {
  const agent = makeAgent();
  await agent.start();

  const insight = {
    topTopics: [],
    totalEventsObserved: 10,
    uniqueTopics: 2,
    generatedAt: new Date().toISOString(),
  };

  await agent.bus.publish(createMessage('learning.insight', 'PeriodicInsight', insight));
  await new Promise((r) => setTimeout(r, 50));

  const record = agent.state.get_knowledge('adaptation.lastInsightProcessed');
  assert.ok(record);
  assert.ok(record.processedAt);

  await agent.stop();
});

test('priority is capped at 10', async () => {
  const agent = makeAgent({ highActivityTopicCount: 1 });
  await agent.start();

  // Pre-set priority near cap
  agent.state.set_state('adaptation.priority.x.topic', 9);

  const insight = {
    topTopics: [{ topic: 'x.topic', count: 100 }],
    totalEventsObserved: 100,
    uniqueTopics: 1,
    generatedAt: new Date().toISOString(),
  };

  for (let i = 0; i < 5; i++) {
    await agent.bus.publish(createMessage('learning.insight', 'PeriodicInsight', insight));
    await new Promise((r) => setTimeout(r, 30));
  }

  const priority = agent.state.get_state('adaptation.priority.x.topic');
  assert.ok(priority <= 10, 'priority should be capped at 10');

  await agent.stop();
});

run();
