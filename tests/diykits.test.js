'use strict';

/**
 * tests/diykits.test.js
 *
 * Unit tests for netlify/functions/diykits.mjs
 *
 * Uses only Node.js built-in modules — no external test framework.
 * Netlify Blobs are not available in this environment; the function falls
 * back to its in-memory store, which is sufficient for unit testing.
 *
 * Run standalone: node tests/diykits.test.js
 * Also executed by tests/run-all.js
 */

const path = require('path');
const { pathToFileURL } = require('url');

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

function makeEvent(method, eventPath, body) {
  return {
    httpMethod: method,
    path: eventPath,
    body: body !== undefined ? JSON.stringify(body) : null,
    headers: {},
    queryStringParameters: {},
  };
}

function makeGetEvent(eventPath, qs = {}) {
  return {
    httpMethod: 'GET',
    path: eventPath,
    body: null,
    headers: {},
    queryStringParameters: qs,
  };
}

// ── Main runner ───────────────────────────────────────────────────────────────

(async () => {
  console.log('=== diykits.mjs tests ===');

  const moduleUrl = pathToFileURL(
    path.resolve(__dirname, '../netlify/functions/diykits.mjs')
  ).href;
  const mod     = await import(moduleUrl);
  const handler = mod.handler;

  assert(typeof handler === 'function', 'handler export must be a function');

  // ── CORS ─────────────────────────────────────────────────────────────────────
  console.log('\nCORS:');

  await it('returns 204 for OPTIONS pre-flight', async () => {
    const res = await handler({ httpMethod: 'OPTIONS', path: '/api/diykits/health', body: null, headers: {} });
    assertEqual(res.statusCode, 204);
    assert(res.headers['Access-Control-Allow-Origin'], 'Missing CORS origin header');
  });

  await it('includes CORS headers on every response', async () => {
    const res = await handler(makeGetEvent('/api/diykits/health'));
    assert(res.headers['Access-Control-Allow-Origin'], 'Missing CORS header');
  });

  // ── GET /health ───────────────────────────────────────────────────────────────
  console.log('\nGET /health:');

  await it('returns status:ready', async () => {
    const res = await handler(makeGetEvent('/api/diykits/health'));
    assertEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assertEqual(body.status, 'ready');
    assertEqual(body.service, 'diykits');
    assert(body.timestamp, 'timestamp should be present');
  });

  // ── GET /config ───────────────────────────────────────────────────────────────
  console.log('\nGET /config:');

  await it('returns paypal_client_id and plan_ids shape', async () => {
    const savedId       = process.env.PAYPAL_CLIENT_ID;
    const savedStarter  = process.env.DIYKITS_PAYPAL_PLAN_STARTER;
    const savedMaker    = process.env.DIYKITS_PAYPAL_PLAN_MAKER;
    const savedPro      = process.env.DIYKITS_PAYPAL_PLAN_PRO;
    const savedRotation = process.env.DIYKITS_PAYPAL_PLAN_ROTATION;
    try {
      process.env.PAYPAL_CLIENT_ID              = 'test-client-id';
      process.env.DIYKITS_PAYPAL_PLAN_STARTER   = 'P-STARTER';
      process.env.DIYKITS_PAYPAL_PLAN_MAKER     = 'P-MAKER';
      process.env.DIYKITS_PAYPAL_PLAN_PRO       = 'P-PRO';
      process.env.DIYKITS_PAYPAL_PLAN_ROTATION  = 'P-ROTATION';
      const res  = await handler(makeGetEvent('/api/diykits/config'));
      assertEqual(res.statusCode, 200);
      const body = JSON.parse(res.body);
      assertEqual(body.paypal_client_id, 'test-client-id');
      assert(typeof body.plan_ids === 'object', 'plan_ids must be an object');
      assertEqual(body.plan_ids.starter,  'P-STARTER');
      assertEqual(body.plan_ids.maker,    'P-MAKER');
      assertEqual(body.plan_ids.pro,      'P-PRO');
      assertEqual(body.plan_ids.rotation, 'P-ROTATION');
    } finally {
      if (savedId !== undefined)       process.env.PAYPAL_CLIENT_ID             = savedId;       else delete process.env.PAYPAL_CLIENT_ID;
      if (savedStarter !== undefined)  process.env.DIYKITS_PAYPAL_PLAN_STARTER  = savedStarter;  else delete process.env.DIYKITS_PAYPAL_PLAN_STARTER;
      if (savedMaker !== undefined)    process.env.DIYKITS_PAYPAL_PLAN_MAKER    = savedMaker;    else delete process.env.DIYKITS_PAYPAL_PLAN_MAKER;
      if (savedPro !== undefined)      process.env.DIYKITS_PAYPAL_PLAN_PRO      = savedPro;      else delete process.env.DIYKITS_PAYPAL_PLAN_PRO;
      if (savedRotation !== undefined) process.env.DIYKITS_PAYPAL_PLAN_ROTATION = savedRotation; else delete process.env.DIYKITS_PAYPAL_PLAN_ROTATION;
    }
  });

  await it('returns empty strings when env vars are absent', async () => {
    const savedId      = process.env.PAYPAL_CLIENT_ID;
    const savedStarter = process.env.DIYKITS_PAYPAL_PLAN_STARTER;
    try {
      delete process.env.PAYPAL_CLIENT_ID;
      delete process.env.DIYKITS_PAYPAL_PLAN_STARTER;
      const res  = await handler(makeGetEvent('/api/diykits/config'));
      const body = JSON.parse(res.body);
      assertEqual(body.paypal_client_id, '');
      assertEqual(body.plan_ids.starter, '');
    } finally {
      if (savedId !== undefined)      process.env.PAYPAL_CLIENT_ID             = savedId;      else delete process.env.PAYPAL_CLIENT_ID;
      if (savedStarter !== undefined) process.env.DIYKITS_PAYPAL_PLAN_STARTER  = savedStarter; else delete process.env.DIYKITS_PAYPAL_PLAN_STARTER;
    }
  });

  // ── Subscriptions ─────────────────────────────────────────────────────────────
  console.log('\nSubscriptions:');

  await it('POST /subscriptions creates a subscription (201)', async () => {
    const res  = await handler(makeEvent('POST', '/api/diykits/subscriptions', {
      name: 'Alice', email: 'alice@test.com', tier: 'starter',
    }));
    assertEqual(res.statusCode, 201);
    const body = JSON.parse(res.body);
    assertEqual(body.success, true);
    assert(body.subscription.id,         'subscription.id must be present');
    assertEqual(body.subscription.name,  'Alice');
    assertEqual(body.subscription.tier,  'starter');
    assertEqual(body.subscription.status, 'active');
  });

  await it('POST /subscriptions returns 400 when name is missing', async () => {
    const res = await handler(makeEvent('POST', '/api/diykits/subscriptions', { tier: 'maker' }));
    assertEqual(res.statusCode, 400);
    const body = JSON.parse(res.body);
    assert(body.error, 'Should return error field');
  });

  await it('POST /subscriptions returns 400 for invalid tier', async () => {
    const res = await handler(makeEvent('POST', '/api/diykits/subscriptions', {
      name: 'Bob', tier: 'ultra-premium',
    }));
    assertEqual(res.statusCode, 400);
  });

  await it('GET /subscriptions lists created subscriptions', async () => {
    // Create another one first
    await handler(makeEvent('POST', '/api/diykits/subscriptions', {
      name: 'Carol', email: 'carol@test.com', tier: 'pro',
    }));
    const res  = await handler(makeGetEvent('/api/diykits/subscriptions'));
    assertEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert(Array.isArray(body.subscriptions), 'subscriptions must be an array');
    assert(body.count >= 2, 'Should have at least 2 subscriptions');
  });

  await it('GET /subscriptions?status=active filters by status', async () => {
    const res  = await handler(makeGetEvent('/api/diykits/subscriptions', { status: 'active' }));
    const body = JSON.parse(res.body);
    assert(
      body.subscriptions.every(s => s.status === 'active'),
      'All returned subscriptions should be active'
    );
  });

  // ── Team ──────────────────────────────────────────────────────────────────────
  console.log('\nTeam:');

  await it('POST /team adds a team member (201)', async () => {
    const res  = await handler(makeEvent('POST', '/api/diykits/team', {
      name: 'Dave', role: 'Assembler', email: 'dave@test.com',
    }));
    assertEqual(res.statusCode, 201);
    const body = JSON.parse(res.body);
    assertEqual(body.success, true);
    assert(body.member.id, 'member.id must be present');
    assertEqual(body.member.name, 'Dave');
    assertEqual(body.member.role, 'Assembler');
  });

  await it('POST /team returns 400 when name is missing', async () => {
    const res = await handler(makeEvent('POST', '/api/diykits/team', { role: 'Shipping' }));
    assertEqual(res.statusCode, 400);
  });

  await it('GET /team returns the team list', async () => {
    const res  = await handler(makeGetEvent('/api/diykits/team'));
    assertEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert(Array.isArray(body.team), 'team must be an array');
    assert(body.count >= 1, 'Should have at least 1 member');
  });

  // ── Jobs ──────────────────────────────────────────────────────────────────────
  console.log('\nJobs:');

  await it('GET /jobs returns jobs derived from active subscriptions', async () => {
    const res  = await handler(makeGetEvent('/api/diykits/jobs'));
    assertEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert(Array.isArray(body.jobs), 'jobs must be an array');
    // We already created subscriptions for 'starter' and 'pro', so there should be >= 1 job
    assert(body.jobs.length >= 1, 'Should have at least 1 job from active subscriptions');
  });

  let jobId = null;

  await it('GET /jobs returns a job with id, tier, qty, status', async () => {
    const res  = await handler(makeGetEvent('/api/diykits/jobs'));
    const body = JSON.parse(res.body);
    const job  = body.jobs[0];
    assert(job.id,     'job.id must be present');
    assert(job.tier,   'job.tier must be present');
    assert(job.qty >= 1, 'job.qty must be >= 1');
    assertEqual(job.status, 'open');
    jobId = job.id;
  });

  await it('POST /jobs/:id/claim returns 400 when team_member_id is missing', async () => {
    if (!jobId) { console.log('    (skipped — no jobId)'); return; }
    const res = await handler(makeEvent('POST', `/api/diykits/jobs/${jobId}/claim`, {}));
    assertEqual(res.statusCode, 400);
  });

  await it('POST /jobs/:id/claim claims an open job', async () => {
    if (!jobId) { console.log('    (skipped — no jobId)'); return; }
    const res  = await handler(makeEvent('POST', `/api/diykits/jobs/${jobId}/claim`, {
      team_member_id: 'm-test-001',
    }));
    assertEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assertEqual(body.success, true);
    assertEqual(body.job.status, 'claimed');
    assertEqual(body.job.assigned_to, 'm-test-001');
  });

  await it('POST /jobs/:id/complete completes a claimed job', async () => {
    if (!jobId) { console.log('    (skipped — no jobId)'); return; }
    const res  = await handler(makeEvent('POST', `/api/diykits/jobs/${jobId}/complete`, {
      team_member_id: 'm-test-001',
    }));
    assertEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assertEqual(body.success, true);
    assertEqual(body.job.status, 'done');
  });

  await it('POST /jobs/:id/claim returns 404 for unknown job', async () => {
    const res = await handler(makeEvent('POST', '/api/diykits/jobs/job-nonexistent/claim', {
      team_member_id: 'm-test-001',
    }));
    assertEqual(res.statusCode, 404);
  });

  // ── BOM ───────────────────────────────────────────────────────────────────────
  console.log('\nGET /bom:');

  await it('returns bom with items array', async () => {
    const res  = await handler(makeGetEvent('/api/diykits/bom'));
    assertEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert(body.bom, 'bom object must be present');
    assert(Array.isArray(body.bom.items), 'bom.items must be an array');
    assert(body.bom.generated_at, 'bom.generated_at must be present');
  });

  await it('BOM items have name, tiers and total_qty_required fields', async () => {
    const res  = await handler(makeGetEvent('/api/diykits/bom'));
    const body = JSON.parse(res.body);
    if (body.bom.items.length > 0) {
      const item = body.bom.items[0];
      assert(typeof item.name === 'string',        'item.name must be a string');
      assert(Array.isArray(item.tiers),            'item.tiers must be an array');
      assert(typeof item.total_qty_required === 'number', 'item.total_qty_required must be a number');
    }
  });

  // ── 404 ───────────────────────────────────────────────────────────────────────
  console.log('\nUnknown routes:');

  await it('returns 404 for unknown path', async () => {
    const res  = await handler(makeGetEvent('/api/diykits/not-a-thing'));
    assertEqual(res.statusCode, 404);
    const body = JSON.parse(res.body);
    assert(body.error, 'Should include error field');
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
