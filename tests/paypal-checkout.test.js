'use strict';

/**
 * tests/paypal-checkout.test.js
 *
 * Unit tests for netlify/functions/paypal-checkout.mjs
 *
 * Uses only Node.js built-in modules — no external test framework.
 * PayPal REST API is mocked via globalThis.fetch so no network calls are made.
 *
 * Run standalone: node tests/paypal-checkout.test.js
 * Also executed by tests/run-all.js
 */

const path = require('path');

// ── Minimal assertion helpers ─────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(
      message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
    );
  }
}

async function it(label, fn) {
  try {
    await fn();
    console.log(`  \u2713 ${label}`);
    passed++;
  } catch (err) {
    console.error(`  \u2717 ${label}`);
    console.error(`    ${err.message}`);
    failed++;
    failures.push({ label, error: err.message });
  }
}

// ── Event builder ─────────────────────────────────────────────────────────────

function makeEvent(method, endpointPath, body) {
  return {
    httpMethod: method,
    path: endpointPath,
    body: body !== undefined ? JSON.stringify(body) : null,
    headers: {},
  };
}

// ── Fetch mock factory ────────────────────────────────────────────────────────

function makeFetch(responses) {
  const queue = Array.isArray(responses) ? [...responses] : [responses];
  return async () => {
    const spec = queue.length > 1 ? queue.shift() : queue[0];
    return {
      ok: spec.ok !== false,
      status: spec.status || 200,
      statusText: spec.statusText || 'OK',
      text: async () => JSON.stringify(spec.body || {}),
      json: async () => spec.body || {},
    };
  };
}

// ── Standard PayPal mock responses ────────────────────────────────────────────

const TOKEN_RESP = { ok: true, body: { access_token: 'test-access-token' } };

function orderResp(id, status) {
  return { ok: true, status: 201, body: { id: id || 'ORDER-123', status: status || 'CREATED' } };
}

function captureResp(status) {
  return {
    ok: true,
    body: {
      id: 'ORDER-789',
      status: status || 'COMPLETED',
      payer: { email_address: 'buyer@test.com', name: { given_name: 'John', surname: 'Doe' } },
      purchase_units: [{
        amount: { currency_code: 'USD', value: '97.00' },
        payments: {
          captures: [{ id: 'CAP-001', amount: { currency_code: 'USD', value: '97.00' } }],
        },
      }],
    },
  };
}

// ── Main runner ───────────────────────────────────────────────────────────────

(async () => {
  console.log('=== paypal-checkout.mjs tests ===');

  // Import the module under test — env vars are read at call-time, not load-time
  const moduleUrl = 'file://' + path.resolve(__dirname, '../netlify/functions/paypal-checkout.mjs');
  const mod = await import(moduleUrl);
  const handler = mod.handler;

  assert(typeof handler === 'function', 'handler export must be a function');

  // Set credentials once; tests that need different behaviour adjust env inline
  process.env.PAYPAL_CLIENT_ID = 'test-client-id';
  process.env.PAYPAL_CLIENT_SECRET = 'test-client-secret';
  process.env.PAYPAL_MODE = 'sandbox';

  // ── Health endpoint ─────────────────────────────────────────────────────────
  console.log('\nGET /health:');

  await it('returns status:ready when credentials are configured', async () => {
    const res = await handler(makeEvent('GET', '/api/paypal-checkout/health'));
    assertEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assertEqual(body.status, 'ready');
    assertEqual(body.configured, true);
    assertEqual(body.mode, 'sandbox');
    assert(body.timestamp, 'timestamp must be present');
  });

  await it('returns status:unconfigured when credentials are absent', async () => {
    const savedId = process.env.PAYPAL_CLIENT_ID;
    const savedSecret = process.env.PAYPAL_CLIENT_SECRET;
    delete process.env.PAYPAL_CLIENT_ID;
    delete process.env.PAYPAL_CLIENT_SECRET;
    try {
      const res = await handler(makeEvent('GET', '/api/paypal-checkout/health'));
      assertEqual(res.statusCode, 200);
      const body = JSON.parse(res.body);
      assertEqual(body.configured, false);
      assertEqual(body.status, 'unconfigured');
    } finally {
      process.env.PAYPAL_CLIENT_ID = savedId;
      process.env.PAYPAL_CLIENT_SECRET = savedSecret;
    }
  });

  await it('returns 404 for unknown action path', async () => {
    const res = await handler(makeEvent('GET', '/api/paypal-checkout/not-a-thing'));
    assertEqual(res.statusCode, 404);
    const body = JSON.parse(res.body);
    assert(body.error, 'Should include error field');
    assert(Array.isArray(body.availableRoutes), 'Should list availableRoutes');
  });

  // ── CORS ────────────────────────────────────────────────────────────────────
  console.log('\nCORS:');

  await it('returns 204 for OPTIONS pre-flight', async () => {
    const res = await handler(makeEvent('OPTIONS', '/api/paypal-checkout/create-order'));
    assertEqual(res.statusCode, 204);
    assert(res.headers['Access-Control-Allow-Origin'], 'Missing CORS origin header');
  });

  await it('includes CORS headers on every response', async () => {
    const res = await handler(makeEvent('GET', '/api/paypal-checkout/health'));
    assert(res.headers['Access-Control-Allow-Origin'], 'CORS Access-Control-Allow-Origin missing');
    assert(res.headers['Access-Control-Allow-Methods'], 'CORS Access-Control-Allow-Methods missing');
  });

  // ── POST /create-order — validation ──────────────────────────────────────────
  console.log('\nPOST /create-order - validation:');

  await it('returns 400 when amount is missing', async () => {
    const res = await handler(makeEvent('POST', '/api/paypal-checkout/create-order', {}));
    assertEqual(res.statusCode, 400);
    assert(JSON.parse(res.body).error, 'Should return error message');
  });

  await it('returns 400 when amount is zero', async () => {
    const res = await handler(makeEvent('POST', '/api/paypal-checkout/create-order', { amount: 0 }));
    assertEqual(res.statusCode, 400);
  });

  await it('returns 400 when amount is negative', async () => {
    const res = await handler(makeEvent('POST', '/api/paypal-checkout/create-order', { amount: -5 }));
    assertEqual(res.statusCode, 400);
  });

  await it('returns 400 when amount is non-numeric string', async () => {
    const res = await handler(makeEvent('POST', '/api/paypal-checkout/create-order', { amount: 'free' }));
    assertEqual(res.statusCode, 400);
  });

  await it('returns 400 for malformed JSON body', async () => {
    const event = { httpMethod: 'POST', path: '/api/paypal-checkout/create-order', body: '{bad json', headers: {} };
    const res = await handler(event);
    assertEqual(res.statusCode, 400);
  });

  // ── POST /create-order — success ─────────────────────────────────────────────
  console.log('\nPOST /create-order - success:');

  await it('returns orderID and 201 on successful order creation', async () => {
    const origFetch = globalThis.fetch;
    globalThis.fetch = makeFetch([TOKEN_RESP, orderResp('ORD-GOOD', 'CREATED')]);
    try {
      const res = await handler(makeEvent('POST', '/api/paypal-checkout/create-order', {
        amount: '97.00',
        description: 'Merlin AI Starter Pack',
      }));
      assertEqual(res.statusCode, 201);
      const body = JSON.parse(res.body);
      assertEqual(body.orderID, 'ORD-GOOD');
      assertEqual(body.status, 'CREATED');
    } finally {
      globalThis.fetch = origFetch;
    }
  });

  await it('sends item details to PayPal when items array is provided', async () => {
    let capturedPayload = null;
    const capturingFetch = async (url, opts) => {
      if (url && url.includes('/v2/checkout/orders')) {
        capturedPayload = JSON.parse(opts.body);
        return { ok: true, status: 201, json: async () => ({ id: 'ORD-IT', status: 'CREATED' }), text: async () => '' };
      }
      return { ok: true, json: async () => ({ access_token: 'tok' }), text: async () => '' };
    };
    const origFetch = globalThis.fetch;
    globalThis.fetch = capturingFetch;
    try {
      await handler(makeEvent('POST', '/api/paypal-checkout/create-order', {
        amount: '29.00',
        items: [{ name: 'KERNEL Framework', price: 29, quantity: 1 }],
      }));
      assert(capturedPayload !== null, 'PayPal API should have been called');
      const items = capturedPayload.purchase_units?.[0]?.items;
      assert(Array.isArray(items) && items.length === 1, 'Items should be forwarded');
      assertEqual(items[0].name, 'KERNEL Framework');
      assertEqual(items[0].category, 'DIGITAL_GOODS');
    } finally {
      globalThis.fetch = origFetch;
    }
  });

  await it('truncates item names longer than 127 characters', async () => {
    let capturedPayload = null;
    const capturingFetch = async (url, opts) => {
      if (url && url.includes('/v2/checkout/orders')) {
        capturedPayload = JSON.parse(opts.body);
        return { ok: true, status: 201, json: async () => ({ id: 'O', status: 'CREATED' }), text: async () => '' };
      }
      return { ok: true, json: async () => ({ access_token: 'tok' }), text: async () => '' };
    };
    const origFetch = globalThis.fetch;
    globalThis.fetch = capturingFetch;
    try {
      await handler(makeEvent('POST', '/api/paypal-checkout/create-order', {
        amount: '10.00',
        items: [{ name: 'A'.repeat(200), price: 10, quantity: 1 }],
      }));
      const name = capturedPayload?.purchase_units?.[0]?.items?.[0]?.name || '';
      assert(name.length <= 127, `Item name should be ≤127 chars, got ${name.length}`);
    } finally {
      globalThis.fetch = origFetch;
    }
  });

  await it('returns 500 when PayPal auth request fails', async () => {
    const origFetch = globalThis.fetch;
    globalThis.fetch = makeFetch([{ ok: false, status: 401, statusText: 'Unauthorized', body: {} }]);
    try {
      const res = await handler(makeEvent('POST', '/api/paypal-checkout/create-order', { amount: '10' }));
      assertEqual(res.statusCode, 500);
    } finally {
      globalThis.fetch = origFetch;
    }
  });

  // ── POST /capture-order — validation ─────────────────────────────────────────
  console.log('\nPOST /capture-order - validation:');

  await it('returns 400 when orderID is absent', async () => {
    const res = await handler(makeEvent('POST', '/api/paypal-checkout/capture-order', {}));
    assertEqual(res.statusCode, 400);
  });

  await it('returns 400 when orderID exceeds 64 characters', async () => {
    const res = await handler(makeEvent('POST', '/api/paypal-checkout/capture-order', {
      orderID: 'x'.repeat(65),
    }));
    assertEqual(res.statusCode, 400);
  });

  await it('returns 400 when orderID is a number (not string)', async () => {
    const res = await handler(makeEvent('POST', '/api/paypal-checkout/capture-order', {
      orderID: 12345,
    }));
    assertEqual(res.statusCode, 400);
  });

  await it('returns 400 for malformed JSON body', async () => {
    const event = { httpMethod: 'POST', path: '/api/paypal-checkout/capture-order', body: 'not-json', headers: {} };
    const res = await handler(event);
    assertEqual(res.statusCode, 400);
  });

  // ── POST /capture-order — success ────────────────────────────────────────────
  console.log('\nPOST /capture-order - success:');

  await it('returns 200 with payerEmail, amount and captureID for COMPLETED orders', async () => {
    const origFetch = globalThis.fetch;
    globalThis.fetch = makeFetch([TOKEN_RESP, captureResp('COMPLETED')]);
    try {
      const res = await handler(makeEvent('POST', '/api/paypal-checkout/capture-order', {
        orderID: 'ORDER-789',
      }));
      assertEqual(res.statusCode, 200);
      const body = JSON.parse(res.body);
      assertEqual(body.success, true);
      assertEqual(body.orderID, 'ORDER-789');
      assertEqual(body.payerEmail, 'buyer@test.com');
      assertEqual(body.payerName, 'John Doe');
      assertEqual(body.amount, '97.00');
      assertEqual(body.captureID, 'CAP-001');
      assert(body.timestamp, 'timestamp should be present');
    } finally {
      globalThis.fetch = origFetch;
    }
  });

  await it('returns success:false and 202 for PENDING captures', async () => {
    const origFetch = globalThis.fetch;
    globalThis.fetch = makeFetch([TOKEN_RESP, captureResp('PENDING')]);
    try {
      const res = await handler(makeEvent('POST', '/api/paypal-checkout/capture-order', {
        orderID: 'ORDER-789',
      }));
      assertEqual(res.statusCode, 202);
      const body = JSON.parse(res.body);
      assertEqual(body.success, false);
      assertEqual(body.status, 'PENDING');
    } finally {
      globalThis.fetch = origFetch;
    }
  });

  await it('returns 500 when PayPal capture request fails', async () => {
    const origFetch = globalThis.fetch;
    globalThis.fetch = makeFetch([
      TOKEN_RESP,
      { ok: false, status: 422, statusText: 'Unprocessable Entity', body: {} },
    ]);
    try {
      const res = await handler(makeEvent('POST', '/api/paypal-checkout/capture-order', {
        orderID: 'BAD-ORDER',
      }));
      assertEqual(res.statusCode, 500);
    } finally {
      globalThis.fetch = origFetch;
    }
  });

  // ── Summary ───────────────────────────────────────────────────────────────────
  console.log(`\nResults: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    console.error('\nFailures:');
    for (const f of failures) {
      console.error(`  \u2717 ${f.label}: ${f.error}`);
    }
    process.exit(1);
  }
})();
