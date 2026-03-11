/**
 * Tests for core/state
 */

'use strict';

const assert = require('assert');
const { StateStore } = require('../../core/state');

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

test('get_state returns null for missing key', () => {
  const store = new StateStore();
  assert.strictEqual(store.get_state('missing'), null);
});

test('set_state / get_state round-trip', () => {
  const store = new StateStore();
  store.set_state('foo', { bar: 42 });
  assert.deepStrictEqual(store.get_state('foo'), { bar: 42 });
});

test('delete_state removes key', () => {
  const store = new StateStore();
  store.set_state('x', 1);
  store.delete_state('x');
  assert.strictEqual(store.get_state('x'), null);
});

test('get_knowledge returns null for missing key', () => {
  const store = new StateStore();
  assert.strictEqual(store.get_knowledge('nope'), null);
});

test('set_knowledge / get_knowledge round-trip', () => {
  const store = new StateStore();
  store.set_knowledge('model.v1', { accuracy: 0.9 });
  assert.deepStrictEqual(store.get_knowledge('model.v1'), { accuracy: 0.9 });
});

test('query_knowledge with prefix filter', () => {
  const store = new StateStore();
  store.set_knowledge('learning.counts', { a: 1 });
  store.set_knowledge('learning.insights', ['i1']);
  store.set_knowledge('adaptation.flag', true);

  const results = store.query_knowledge({ prefix: 'learning.' });
  assert.strictEqual(results.length, 2);
  assert.ok(results.every((r) => r.key.startsWith('learning.')));
});

test('query_knowledge with custom filter', () => {
  const store = new StateStore();
  store.set_knowledge('k1', 10);
  store.set_knowledge('k2', 5);
  store.set_knowledge('k3', 20);

  const big = store.query_knowledge({ filter: (k, v) => v > 8 });
  assert.strictEqual(big.length, 2);
});

test('append_event adds entries and increments seq', () => {
  const store = new StateStore();
  const e1 = store.append_event('my.stream', { x: 1 });
  const e2 = store.append_event('my.stream', { x: 2 });

  assert.strictEqual(e1.seq, 0);
  assert.strictEqual(e2.seq, 1);
  assert.strictEqual(e1.stream, 'my.stream');
  assert.ok(e1.timestamp);
});

test('read_stream returns requested events', () => {
  const store = new StateStore();
  for (let i = 0; i < 5; i++) store.append_event('s', { i });

  const all = store.read_stream('s');
  assert.strictEqual(all.length, 5);

  const tail = store.read_stream('s', { fromSeq: 3 });
  assert.strictEqual(tail.length, 2);

  const limited = store.read_stream('s', { limit: 2 });
  assert.strictEqual(limited.length, 2);
});

test('recent_events returns newest first across streams', () => {
  const store = new StateStore();
  store.append_event('stream.a', { n: 1 });
  store.append_event('stream.b', { n: 2 });
  store.append_event('stream.a', { n: 3 });

  const recent = store.recent_events(10);
  assert.ok(recent.length >= 3);
  // Newest first
  assert.ok(recent[0].timestamp >= recent[recent.length - 1].timestamp);
});

test('stats reports correct counts', () => {
  const store = new StateStore();
  store.set_state('a', 1);
  store.set_state('b', 2);
  store.set_knowledge('k', 3);
  store.append_event('stream.x', {});
  store.append_event('stream.x', {});

  const s = store.stats();
  assert.strictEqual(s.workingMemoryKeys, 2);
  assert.strictEqual(s.knowledgeKeys, 1);
  assert.strictEqual(s.streams['stream.x'], 2);
});

test('stream respects maxStreamEvents limit', () => {
  const store = new StateStore({ maxStreamEvents: 3 });
  for (let i = 0; i < 5; i++) store.append_event('capped.stream', { i });

  const events = store.read_stream('capped.stream');
  assert.strictEqual(events.length, 3);
});

run();
