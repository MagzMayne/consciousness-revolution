/**
 * Tests for core/event-bus
 */

'use strict';

const assert = require('assert');
const { InMemoryEventBus, createMessage, getDefaultBus, setDefaultBus } = require('../../core/event-bus');

// Simple pass/fail test runner (no external deps)
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

// ─── Tests ────────────────────────────────────────────────────────────────────

test('createMessage produces required fields', () => {
  const msg = createMessage('test.topic', 'TestType', { data: 1 });
  assert.ok(msg.id, 'id required');
  assert.strictEqual(msg.topic, 'test.topic');
  assert.strictEqual(msg.type, 'TestType');
  assert.deepStrictEqual(msg.payload, { data: 1 });
  assert.ok(msg.correlationId, 'correlationId required');
  assert.ok(msg.traceId, 'traceId required');
  assert.ok(msg.timestamp, 'timestamp required');
  assert.strictEqual(msg.retryCount, 0);
});

test('createMessage respects opts.correlationId', () => {
  const msg = createMessage('t', 'T', {}, { correlationId: 'my-cid' });
  assert.strictEqual(msg.correlationId, 'my-cid');
});

test('subscribe + publish delivers message', async () => {
  const bus = new InMemoryEventBus();
  const received = [];
  bus.subscribe('hello.world', (m) => received.push(m));

  const msg = createMessage('hello.world', 'Greeting', { text: 'hi' });
  await bus.publish(msg);

  assert.strictEqual(received.length, 1);
  assert.strictEqual(received[0].payload.text, 'hi');
});

test('unsubscribe stops delivery', async () => {
  const bus = new InMemoryEventBus();
  const received = [];
  const handler = (m) => received.push(m);
  const unsub = bus.subscribe('test.topic', handler);

  await bus.publish(createMessage('test.topic', 'T', {}));
  assert.strictEqual(received.length, 1);

  unsub();
  await bus.publish(createMessage('test.topic', 'T', {}));
  assert.strictEqual(received.length, 1, 'should not receive after unsubscribe');
});

test('wildcard subscriber receives all topics', async () => {
  const bus = new InMemoryEventBus();
  const received = [];
  bus.subscribe('*', (m) => received.push(m.topic));

  await bus.publish(createMessage('foo.bar', 'T', {}));
  await bus.publish(createMessage('baz.qux', 'T', {}));

  assert.ok(received.includes('foo.bar'));
  assert.ok(received.includes('baz.qux'));
});

test('failed handler sends message to dead-letter queue', async () => {
  const bus = new InMemoryEventBus({ maxRetries: 1, retryDelayMs: 10 });
  bus.subscribe('bad.topic', () => { throw new Error('boom'); });

  await bus.publish(createMessage('bad.topic', 'T', {}));

  const dlq = bus.getDeadLetterQueue();
  assert.strictEqual(dlq.length, 1);
  assert.ok(dlq[0].failures.length > 0);
});

test('drainDeadLetterQueue empties the queue', async () => {
  const bus = new InMemoryEventBus({ maxRetries: 0, retryDelayMs: 10 });
  bus.subscribe('bad.topic', () => { throw new Error('x'); });
  await bus.publish(createMessage('bad.topic', 'T', {}));

  const items = bus.drainDeadLetterQueue();
  assert.strictEqual(items.length, 1);
  assert.strictEqual(bus.getDeadLetterQueue().length, 0);
});

test('getDefaultBus returns singleton', () => {
  const a = getDefaultBus();
  const b = getDefaultBus();
  assert.strictEqual(a, b);
});

test('setDefaultBus replaces singleton', () => {
  const original = getDefaultBus();
  const custom = new InMemoryEventBus();
  setDefaultBus(custom);
  assert.strictEqual(getDefaultBus(), custom);
  // Restore
  setDefaultBus(original);
});

test('multiple subscribers on same topic all receive message', async () => {
  const bus = new InMemoryEventBus();
  const counts = [0, 0, 0];
  bus.subscribe('multi.topic', () => counts[0]++);
  bus.subscribe('multi.topic', () => counts[1]++);
  bus.subscribe('multi.topic', () => counts[2]++);

  await bus.publish(createMessage('multi.topic', 'T', {}));
  assert.deepStrictEqual(counts, [1, 1, 1]);
});

run();
