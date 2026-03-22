// backend/services/webhook-service.js
// Webhook dispatcher for the consciousness-revolution Railway backend.
//
// Mirrors the webhook initialization observed in the BarbrickDesign backend.
// Reads WEBHOOK_URL from environment and registers a periodic heartbeat
// dispatcher so external listeners stay in sync with backend health.

'use strict';

const https = require('https');
const http  = require('http');
const url   = require('url');

// ── Configuration ─────────────────────────────────────────────────────────
const WEBHOOK_URL           = process.env.WEBHOOK_URL  || '';
const WEBHOOK_SECRET        = process.env.WEBHOOK_SECRET || '';
const WEBHOOK_INTERVAL_MS   = parseInt(process.env.WEBHOOK_INTERVAL_MS || String(5 * 60 * 1000), 10);

let _intervalId = null;
let _lastDispatch = null;
let _dispatchCount = 0;

// ── Helper ────────────────────────────────────────────────────────────────
function log(msg) {
  console.log(`${new Date().toISOString()} [inf] [WebhookService] ${msg}`);
}

function warn(msg) {
  console.warn(`${new Date().toISOString()} [warn] [WebhookService] ${msg}`);
}

/**
 * Send a JSON payload to the configured WEBHOOK_URL.
 * Falls back silently if WEBHOOK_URL is not set.
 *
 * @param {object} payload
 * @returns {Promise<void>}
 */
function dispatch(payload) {
  if (!WEBHOOK_URL) {
    log('WEBHOOK_URL not configured — skipping dispatch');
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let parsed;
    try {
      parsed = new url.URL(WEBHOOK_URL);
    } catch (err) {
      warn(`Invalid WEBHOOK_URL: ${err.message}`);
      return resolve();
    }

    const body = JSON.stringify({
      ...payload,
      timestamp: new Date().toISOString(),
      service:   'consciousness-revolution',
    });

    const opts = {
      hostname: parsed.hostname,
      port:     parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path:     parsed.pathname + (parsed.search || ''),
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...(WEBHOOK_SECRET ? { 'X-Webhook-Secret': WEBHOOK_SECRET } : {}),
      },
    };

    const transport = parsed.protocol === 'https:' ? https : http;
    const req = transport.request(opts, (res) => {
      res.resume(); // drain response
      log(`Dispatched — status=${res.statusCode}`);
      resolve();
    });

    req.on('error', (err) => {
      warn(`Dispatch error: ${err.message}`);
      resolve(); // never crash the caller
    });

    req.setTimeout(10_000, () => {
      warn('Dispatch timed out after 10 s');
      req.destroy();
      resolve();
    });

    req.write(body);
    req.end();
  });
}

/**
 * Send a health heartbeat to WEBHOOK_URL.
 */
async function sendHeartbeat() {
  _dispatchCount++;
  _lastDispatch = new Date().toISOString();

  const memUsage = process.memoryUsage();
  await dispatch({
    event:   'heartbeat',
    uptime:  process.uptime(),
    memory:  {
      heapUsedMB: Math.round(memUsage.heapUsed  / 1024 / 1024),
      heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
    },
    dispatches: _dispatchCount,
  });
}

/**
 * Start the periodic heartbeat dispatcher.
 * Safe to call multiple times — only one interval runs.
 */
function start() {
  if (_intervalId) return;

  if (!WEBHOOK_URL) {
    log('WEBHOOK_URL not set — heartbeat dispatcher will skip sends but remain active');
  } else {
    log(`Webhook dispatcher started — target=${WEBHOOK_URL} interval=${WEBHOOK_INTERVAL_MS / 1000}s`);
  }

  // First heartbeat on next tick (after server is bound)
  setImmediate(() => sendHeartbeat().catch((err) => warn(`Heartbeat error: ${err.message}`)));

  _intervalId = setInterval(() => {
    sendHeartbeat().catch((err) => warn(`Heartbeat error: ${err.message}`));
  }, WEBHOOK_INTERVAL_MS);
}

/**
 * Stop the heartbeat dispatcher.
 */
function stop() {
  if (_intervalId) {
    clearInterval(_intervalId);
    _intervalId = null;
    log('Webhook dispatcher stopped');
  }
}

/** Return the current dispatcher status. */
function status() {
  return {
    active:       _intervalId !== null,
    webhookUrl:   WEBHOOK_URL ? '(configured)' : '(not set)',
    lastDispatch: _lastDispatch,
    dispatches:   _dispatchCount,
  };
}

module.exports = { start, stop, dispatch, sendHeartbeat, status };
