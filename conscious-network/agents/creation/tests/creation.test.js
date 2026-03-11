/**
 * Tests for Creation Agent
 */

'use strict';

const assert = require('assert');
const { InMemoryEventBus, createMessage } = require('../../../core/event-bus');
const { StateStore } = require('../../../core/state');
const { CreationAgent } = require('../index');

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
  return new CreationAgent({ bus, state, healthPort: null, ...extra });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test('creation.request → publishes creation.output', async () => {
  const agent = makeAgent();
  await agent.start();

  const outputs = [];
  agent.bus.subscribe('creation.output', (m) => outputs.push(m));

  await agent.bus.publish(createMessage('creation.request', 'GenerateReply', {
    text: 'What is the meaning of life?',
    requestType: 'reply',
  }));
  await new Promise((r) => setTimeout(r, 50));

  assert.strictEqual(outputs.length, 1);
  assert.strictEqual(outputs[0].type, 'GeneratedContent');
  assert.ok(outputs[0].payload.output.content.includes('Acknowledged'));

  await agent.stop();
});

test('creation output preserves correlationId', async () => {
  const agent = makeAgent();
  await agent.start();

  const outputs = [];
  agent.bus.subscribe('creation.output', (m) => outputs.push(m));

  await agent.bus.publish(createMessage('creation.request', 'GenerateReply', { text: 'trace me' }, {
    correlationId: 'cid-xyz',
  }));
  await new Promise((r) => setTimeout(r, 50));

  assert.strictEqual(outputs[0].correlationId, 'cid-xyz');

  await agent.stop();
});

test('default generator returns plan for requestType=plan', async () => {
  const agent = makeAgent();
  await agent.start();

  const outputs = [];
  agent.bus.subscribe('creation.output', (m) => outputs.push(m));

  await agent.bus.publish(createMessage('creation.request', 'GeneratePlan', {
    text: 'Build a system',
    requestType: 'plan',
  }));
  await new Promise((r) => setTimeout(r, 50));

  const output = outputs[0].payload.output;
  assert.strictEqual(output.type, 'plan');
  assert.ok(Array.isArray(output.steps));

  await agent.stop();
});

test('custom generator is used when injected', async () => {
  const agent = makeAgent();
  await agent.start();

  agent.setGenerator(async ({ text }) => ({
    type: 'custom',
    content: `CUSTOM: ${text}`,
  }));

  const outputs = [];
  agent.bus.subscribe('creation.output', (m) => outputs.push(m));

  await agent.bus.publish(createMessage('creation.request', 'GenerateReply', {
    text: 'test input',
    requestType: 'reply',
  }));
  await new Promise((r) => setTimeout(r, 50));

  assert.strictEqual(outputs[0].payload.output.content, 'CUSTOM: test input');

  await agent.stop();
});

test('failed generator publishes error output', async () => {
  const agent = makeAgent();
  await agent.start();

  agent.setGenerator(async () => { throw new Error('Generator exploded'); });

  const outputs = [];
  agent.bus.subscribe('creation.output', (m) => outputs.push(m));

  await agent.bus.publish(createMessage('creation.request', 'GenerateReply', { text: 'oops' }));
  await new Promise((r) => setTimeout(r, 50));

  assert.strictEqual(outputs[0].payload.output.type, 'error');
  assert.ok(outputs[0].payload.output.content.includes('Generation failed'));

  await agent.stop();
});

test('creation.output is appended to state stream', async () => {
  const agent = makeAgent();
  await agent.start();

  await agent.bus.publish(createMessage('creation.request', 'GenerateReply', { text: 'hi' }));
  await new Promise((r) => setTimeout(r, 50));

  const events = agent.state.read_stream('creation.outputs');
  assert.ok(events.length >= 1);

  await agent.stop();
});

run();
