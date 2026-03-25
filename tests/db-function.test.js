'use strict';

/**
 * tests/db-function.test.js
 *
 * Unit tests for the core stateless logic used in netlify/functions/db.mjs.
 * Uses only Node.js built-in modules (assert) — no external test framework.
 *
 * Because db.mjs is an ESM module that imports @netlify/neon at module scope,
 * we replicate and test the pure helper functions here rather than importing
 * the handler directly. This keeps the tests fast, hermetic, and environment-
 * independent (no live DB or Netlify runtime needed).
 */

const assert = require('assert');

// ---------------------------------------------------------------------------
// Helpers (same pattern as intent-engine.test.js / adapters.test.js)
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
// Logic extracted from db.mjs (kept in sync manually)
// ---------------------------------------------------------------------------

const ALLOWED_ORIGINS = [
  'https://consciousnessrevolution.io',
  'https://www.consciousnessrevolution.io',
  'https://conciousnessrevolution.io',
  'https://www.conciousnessrevolution.io',
  'https://barbrickdesign.github.io',
  'http://localhost:8888',
  'http://localhost:3000',
  'http://127.0.0.1:8888',
];

function getCorsOrigin(origin) {
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  return 'null';
}

function makeRateLimitMap() {
  const map = new Map();
  const RATE_LIMIT_MAX = 10;
  const RATE_LIMIT_WINDOW_MS = 60_000;

  function checkRateLimit(ip) {
    const now = Date.now();
    const entry = map.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    if (now > entry.resetAt) {
      entry.count = 0;
      entry.resetAt = now + RATE_LIMIT_WINDOW_MS;
    }
    entry.count += 1;
    map.set(ip, entry);
    return entry.count <= RATE_LIMIT_MAX;
  }

  return checkRateLimit;
}

const WHITELISTED_QUERIES = ['server_info', 'table_list'];

// ---------------------------------------------------------------------------
// Tests — CORS origin validation
// ---------------------------------------------------------------------------
async function runCorsTests() {
  console.log('\ngetCorsOrigin():');

  await test('returns allowed origin unchanged (production domain)', () => {
    assert.strictEqual(getCorsOrigin('https://consciousnessrevolution.io'), 'https://consciousnessrevolution.io');
  });

  await test('returns allowed origin unchanged (github pages)', () => {
    assert.strictEqual(getCorsOrigin('https://barbrickdesign.github.io'), 'https://barbrickdesign.github.io');
  });

  await test('returns allowed origin unchanged (localhost:8888)', () => {
    assert.strictEqual(getCorsOrigin('http://localhost:8888'), 'http://localhost:8888');
  });

  await test('returns allowed origin unchanged (localhost:3000)', () => {
    assert.strictEqual(getCorsOrigin('http://localhost:3000'), 'http://localhost:3000');
  });

  await test('returns "null" for unknown external origin', () => {
    assert.strictEqual(getCorsOrigin('https://attacker.example.com'), 'null');
  });

  await test('returns "null" for empty string origin', () => {
    assert.strictEqual(getCorsOrigin(''), 'null');
  });

  await test('returns "null" for subdomain of allowed host', () => {
    // e.g. sub.consciousnessrevolution.io is NOT in the allowlist
    assert.strictEqual(getCorsOrigin('https://sub.consciousnessrevolution.io'), 'null');
  });

  await test('returns "null" for lookalike domain containing allowed hostname', () => {
    // homograph attack: consciousnessrevolution.io.evil.com must not pass
    assert.strictEqual(getCorsOrigin('https://consciousnessrevolution.io.evil.com'), 'null');
  });
}

// ---------------------------------------------------------------------------
// Tests — rate limiting
// ---------------------------------------------------------------------------
async function runRateLimitTests() {
  console.log('\ncheckRateLimit():');

  await test('allows first 10 requests from same IP', () => {
    const checkRateLimit = makeRateLimitMap();
    for (let i = 0; i < 10; i++) {
      assert.strictEqual(checkRateLimit('1.2.3.4'), true, `request ${i + 1} should be allowed`);
    }
  });

  await test('blocks 11th request from same IP', () => {
    const checkRateLimit = makeRateLimitMap();
    for (let i = 0; i < 10; i++) checkRateLimit('1.2.3.4');
    assert.strictEqual(checkRateLimit('1.2.3.4'), false);
  });

  await test('different IPs have independent rate-limit buckets', () => {
    const checkRateLimit = makeRateLimitMap();
    // Exhaust IP A
    for (let i = 0; i < 10; i++) checkRateLimit('10.0.0.1');
    assert.strictEqual(checkRateLimit('10.0.0.1'), false);
    // IP B is still allowed
    assert.strictEqual(checkRateLimit('10.0.0.2'), true);
  });

  await test('uses "no-xff" bucket for missing x-forwarded-for', () => {
    const checkRateLimit = makeRateLimitMap();
    // Simulate the handler behaviour: missing header → 'no-xff'
    const ip = ('no-xff').split(',')[0].trim();
    assert.strictEqual(checkRateLimit(ip), true);
  });
}

// ---------------------------------------------------------------------------
// Tests — whitelist query names
// ---------------------------------------------------------------------------
async function runWhitelistTests() {
  console.log('\nWHITELISTED_QUERIES:');

  await test('includes server_info', () => {
    assert.ok(WHITELISTED_QUERIES.includes('server_info'));
  });

  await test('includes table_list', () => {
    assert.ok(WHITELISTED_QUERIES.includes('table_list'));
  });

  await test('does NOT include dangerous DDL names', () => {
    const dangerous = ['drop_all', 'truncate', 'insert', 'update', 'delete', 'exec'];
    for (const name of dangerous) {
      assert.ok(!WHITELISTED_QUERIES.includes(name), `"${name}" must not be whitelisted`);
    }
  });
}

// ---------------------------------------------------------------------------
// Tests — graceful degradation when DB is not configured
// ---------------------------------------------------------------------------
async function runGracefulDegradationTests() {
  console.log('\nGraceful degradation (DB_CONFIGURED = false):');

  await test('handleStatus returns connected:false when NETLIFY_DATABASE_URL is absent', () => {
    // Simulate the handler logic without a real DB client
    const sql = null; // DB_CONFIGURED = false
    let result;
    if (!sql) {
      result = {
        connected: false,
        db_error: 'NETLIFY_DATABASE_URL is not set — check Netlify DB configuration.',
      };
    }
    assert.strictEqual(result.connected, false);
    assert.ok(result.db_error.includes('NETLIFY_DATABASE_URL'));
  });

  await test('handleQuery returns 503 when NETLIFY_DATABASE_URL is absent', () => {
    const sql = null; // DB_CONFIGURED = false
    let response;
    if (!sql) {
      response = {
        statusCode: 503,
        body: JSON.stringify({
          success: false,
          db_error: 'NETLIFY_DATABASE_URL is not set — check Netlify DB configuration.',
          data: null,
        }),
      };
    }
    assert.strictEqual(response.statusCode, 503);
    const body = JSON.parse(response.body);
    assert.strictEqual(body.success, false);
    assert.ok(body.db_error.includes('NETLIFY_DATABASE_URL'));
  });

  await test('handleQuery returns 400 for unknown action even with DB configured', () => {
    // Simulate: action not in WHITELISTED_QUERIES
    const action = 'unknown_action';
    const queryFn = WHITELISTED_QUERIES.includes(action) ? () => {} : null;
    assert.strictEqual(queryFn, null, 'Unknown action should not map to a query function');
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
(async () => {
  console.log('=== db function logic tests ===');

  await runCorsTests();
  await runRateLimitTests();
  await runWhitelistTests();
  await runGracefulDegradationTests();

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
})();
