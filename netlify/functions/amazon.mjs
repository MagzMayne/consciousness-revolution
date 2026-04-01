/**
 * amazon.mjs — Amazon Associates Config & Click Tracking (Netlify Function)
 * ══════════════════════════════════════════════════════════════════════════
 * Provides the Amazon affiliate configuration and records affiliate link
 * click events for analytics.  Used by DIYkits.html.
 *
 * ENDPOINTS (all under /api/amazon or /.netlify/functions/amazon):
 *   GET  /config  — return the Amazon Associates tag
 *   POST /click   — record an affiliate-link click (fire-and-forget)
 *   GET  /health  — health check
 *
 * Environment variables (Netlify dashboard → Site settings → Env vars):
 *   AMAZON_ASSOCIATE_TAG  — Amazon Associates tracking tag (e.g. barbrickdesign-20)
 *
 * Author: BarbrickDesign (BarbrickDesign@gmail.com)
 */

import { getStore } from '@netlify/blobs';
import { randomBytes } from 'crypto';

// ── CORS ──────────────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

// ── Response helpers ─────────────────────────────────────────────────────────

function jsonOk(data, status = 200) {
  return {
    statusCode: status,
    headers: CORS_HEADERS,
    body: JSON.stringify({ ok: true, ...data }),
  };
}

function jsonErr(message, status = 400) {
  return {
    statusCode: status,
    headers: CORS_HEADERS,
    body: JSON.stringify({ ok: false, error: message }),
  };
}

// ── Path parsing ──────────────────────────────────────────────────────────────

function parsePath(event) {
  const raw = event.path || event.rawUrl || '';
  return raw
    .replace(/\?.*$/, '')
    .replace(/^\/.netlify\/functions\/amazon/, '')
    .replace(/^\/api\/amazon/, '')
    || '/';
}

// ── In-memory click log (ephemeral) ──────────────────────────────────────────

const _memClicks = [];
const MAX_MEM_CLICKS = 500;

// ── Handlers ─────────────────────────────────────────────────────────────────

function handleConfig() {
  const tag = process.env.AMAZON_ASSOCIATE_TAG || 'barbrickdesign-20';
  return jsonOk({ associate_tag: tag, paapi_available: false });
}

async function handleClick(body) {
  const asin         = typeof body?.asin          === 'string' ? body.asin.slice(0, 32)          : '';
  const name         = typeof body?.name          === 'string' ? body.name.slice(0, 256)         : '';
  const vendor       = typeof body?.vendor        === 'string' ? body.vendor.slice(0, 128)       : '';
  const price        = typeof body?.price         === 'string' ? body.price.slice(0, 32)         : '';
  const affiliateUrl = typeof body?.affiliate_url === 'string' ? body.affiliate_url.slice(0, 512): '';

  const record = {
    ts:            new Date().toISOString(),
    asin,
    name,
    vendor,
    price,
    affiliate_url: affiliateUrl,
  };

  // Persist to Blobs if available, else keep in memory
  try {
    const store = getStore('amazon-clicks');
    const key   = `click:${Date.now()}-${randomBytes(5).toString('hex')}`;
    await store.set(key, JSON.stringify(record));
  } catch (e) {
    console.warn('[amazon] click store unavailable:', e.message);
    _memClicks.push(record);
    if (_memClicks.length > MAX_MEM_CLICKS) _memClicks.shift();
  }

  return jsonOk({ success: true, recorded: true });
}

// ── Main handler ──────────────────────────────────────────────────────────────

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  const subPath = parsePath(event);
  const method  = event.httpMethod;

  // Parse body once
  let body = {};
  if (event.body) {
    try { body = JSON.parse(event.body); } catch (_) {
      return jsonErr('Invalid JSON in request body', 400);
    }
  }

  // ── GET /health ─────────────────────────────────────────────────────────────
  if (method === 'GET' && subPath === '/health') {
    return jsonOk({
      status:    'ready',
      service:   'amazon',
      timestamp: new Date().toISOString(),
    });
  }

  // ── GET /config ─────────────────────────────────────────────────────────────
  if (method === 'GET' && subPath === '/config') {
    return handleConfig();
  }

  // ── POST /click ─────────────────────────────────────────────────────────────
  if (method === 'POST' && subPath === '/click') {
    return handleClick(body);
  }

  return jsonErr(`Not found: ${method} ${subPath}`, 404);
};
