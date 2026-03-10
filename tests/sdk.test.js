'use strict';

/**
 * tests/sdk.test.js
 *
 * Tests for the AgentFinanceClient JS SDK.
 * Uses only Node.js built-in modules (assert, http) — no external framework.
 *
 * The HTTP layer is tested with a real local HTTP server so we don't need
 * to monkey-patch globals.
 */

const assert = require('assert');
const http = require('http');
const path = require('path');

const { AgentFinanceClient } = require(
  path.resolve(__dirname, '../packages/sdk-js/index')
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

// ---------------------------------------------------------------------------
// Minimal mock HTTP server
// ---------------------------------------------------------------------------
function createMockServer(handler) {
  return new Promise((resolve) => {
    const server = http.createServer(handler);
    server.listen(0, '127.0.0.1', () => {
      resolve(server);
    });
  });
}

// ---------------------------------------------------------------------------
// Instantiation and method presence tests
// ---------------------------------------------------------------------------
async function runInstantiationTests() {
  console.log('\nAgentFinanceClient instantiation:');

  await test('can be instantiated with baseUrl', () => {
    const client = new AgentFinanceClient({ baseUrl: 'http://localhost:9999' });
    assert.ok(client);
  });

  await test('throws when baseUrl is missing', () => {
    assert.throws(() => new AgentFinanceClient({}), /baseUrl is required/);
  });

  await test('has intent() method', () => {
    const client = new AgentFinanceClient({ baseUrl: 'http://localhost:9999' });
    assert.strictEqual(typeof client.intent, 'function');
  });

  await test('has simulate() method', () => {
    const client = new AgentFinanceClient({ baseUrl: 'http://localhost:9999' });
    assert.strictEqual(typeof client.simulate, 'function');
  });

  await test('has getLineage() method', () => {
    const client = new AgentFinanceClient({ baseUrl: 'http://localhost:9999' });
    assert.strictEqual(typeof client.getLineage, 'function');
  });

  await test('strips trailing slash from baseUrl', () => {
    const client = new AgentFinanceClient({ baseUrl: 'http://localhost:9999/' });
    assert.strictEqual(client.baseUrl, 'http://localhost:9999');
  });

  await test('stores apiKey', () => {
    const client = new AgentFinanceClient({ baseUrl: 'http://localhost:9999', apiKey: 'test-key' });
    assert.strictEqual(client.apiKey, 'test-key');
  });

  await test('apiKey defaults to null when not provided', () => {
    const client = new AgentFinanceClient({ baseUrl: 'http://localhost:9999' });
    assert.strictEqual(client.apiKey, null);
  });

  // Named export
  await test('AgentFinanceClient is accessible as named export', () => {
    const mod = require(path.resolve(__dirname, '../packages/sdk-js/index'));
    assert.strictEqual(typeof mod.AgentFinanceClient, 'function');
  });

  // Default export
  await test('AgentFinanceClient is accessible as default export', () => {
    const mod = require(path.resolve(__dirname, '../packages/sdk-js/index'));
    assert.strictEqual(typeof mod.default, 'function');
  });
}

// ---------------------------------------------------------------------------
// HTTP integration tests (mock server)
// ---------------------------------------------------------------------------
async function runHttpTests() {
  console.log('\nAgentFinanceClient HTTP:');

  // --- intent() ---
  await test('intent() sends POST /v1/intent with correct body and headers', async () => {
    let capturedBody = null;
    let capturedHeaders = null;
    let capturedPath = null;
    let capturedMethod = null;

    const server = await createMockServer((req, res) => {
      capturedPath = req.url;
      capturedMethod = req.method;
      capturedHeaders = req.headers;
      let raw = '';
      req.on('data', (c) => { raw += c; });
      req.on('end', () => {
        capturedBody = JSON.parse(raw);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'simulated', ok: true }));
      });
    });

    const { port } = server.address();
    const client = new AgentFinanceClient({
      baseUrl: `http://127.0.0.1:${port}`,
      apiKey: 'my-key',
    });

    const result = await client.intent({
      agentId: 'agent-1',
      intentType: 'trade.buy',
      parameters: { asset: 'ETH', amount: '1.0' },
      context: { source: 'test' },
      mode: 'simulate',
    });

    server.close();

    assert.strictEqual(capturedMethod, 'POST');
    assert.strictEqual(capturedPath, '/v1/intent');
    assert.strictEqual(capturedHeaders['x-api-key'], 'my-key');
    assert.strictEqual(capturedHeaders['content-type'], 'application/json');
    assert.strictEqual(capturedBody.agent_id, 'agent-1');
    assert.strictEqual(capturedBody.intent_type, 'trade.buy');
    assert.deepStrictEqual(capturedBody.parameters, { asset: 'ETH', amount: '1.0' });
    assert.strictEqual(capturedBody.mode, 'simulate');
    assert.strictEqual(result.status, 'simulated');
  });

  // --- simulate() ---
  await test('simulate() forces mode to "simulate"', async () => {
    let capturedBody = null;

    const server = await createMockServer((req, res) => {
      let raw = '';
      req.on('data', (c) => { raw += c; });
      req.on('end', () => {
        capturedBody = JSON.parse(raw);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'simulated' }));
      });
    });

    const { port } = server.address();
    const client = new AgentFinanceClient({ baseUrl: `http://127.0.0.1:${port}` });

    await client.simulate({
      agentId: 'agent-2',
      intentType: 'trade.sell',
      parameters: { asset: 'USDC', amount: '100' },
    });

    server.close();

    assert.strictEqual(capturedBody.mode, 'simulate');
  });

  // --- intent() default mode ---
  await test('intent() uses "simulate_and_execute" as default mode', async () => {
    let capturedBody = null;

    const server = await createMockServer((req, res) => {
      let raw = '';
      req.on('data', (c) => { raw += c; });
      req.on('end', () => {
        capturedBody = JSON.parse(raw);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'executed' }));
      });
    });

    const { port } = server.address();
    const client = new AgentFinanceClient({ baseUrl: `http://127.0.0.1:${port}` });

    await client.intent({
      agentId: 'agent-3',
      intentType: 'payment.m2m',
      parameters: { to: '0xABC', amount: '5' },
    });

    server.close();

    assert.strictEqual(capturedBody.mode, 'simulate_and_execute');
  });

  // --- getLineage() ---
  await test('getLineage() sends GET /v1/lineage/:id', async () => {
    let capturedPath = null;
    let capturedMethod = null;
    let capturedHeaders = null;

    const server = await createMockServer((req, res) => {
      capturedPath = req.url;
      capturedMethod = req.method;
      capturedHeaders = req.headers;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ id: 'lin-001', intentType: 'trade.buy' }));
    });

    const { port } = server.address();
    const client = new AgentFinanceClient({
      baseUrl: `http://127.0.0.1:${port}`,
      apiKey: 'lineage-key',
    });

    const record = await client.getLineage('lin-001');
    server.close();

    assert.strictEqual(capturedMethod, 'GET');
    assert.strictEqual(capturedPath, '/v1/lineage/lin-001');
    assert.strictEqual(capturedHeaders['x-api-key'], 'lineage-key');
    assert.strictEqual(record.id, 'lin-001');
  });

  // --- HTTP error handling ---
  await test('intent() rejects on HTTP 4xx response', async () => {
    const server = await createMockServer((req, res) => {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Bad Request' }));
    });

    const { port } = server.address();
    const client = new AgentFinanceClient({ baseUrl: `http://127.0.0.1:${port}` });

    await assert.rejects(
      () => client.intent({ agentId: 'a', intentType: 'trade.buy', parameters: {} }),
      /HTTP 400/
    );

    server.close();
  });

  // --- No API key ---
  await test('no x-api-key header sent when apiKey is omitted', async () => {
    let capturedHeaders = null;

    const server = await createMockServer((req, res) => {
      capturedHeaders = req.headers;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    });

    const { port } = server.address();
    const client = new AgentFinanceClient({ baseUrl: `http://127.0.0.1:${port}` });

    await client.intent({ agentId: 'a', intentType: 'trade.buy', parameters: {} });
    server.close();

    assert.strictEqual(capturedHeaders['x-api-key'], undefined);
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
(async () => {
  console.log('=== sdk.test.js ===');

  await runInstantiationTests();
  await runHttpTests();

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
})();
