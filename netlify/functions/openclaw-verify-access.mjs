/**
 * OpenClaw Hub — Access Token Verification Endpoint
 *
 * POST /.netlify/functions/openclaw-verify-access
 * Body: { "token": "<access-token>" }
 *
 * Returns:
 *   200 { valid: true,  email, name, orderId, ts, product }
 *   400 { valid: false, error: "reason" }
 *   401 { valid: false, error: "Invalid token" }
 *   405 Method not allowed
 *
 * The token is a self-verifying HMAC-signed payload created by the
 * openclaw-paywall-webhook function.  No database is required.
 *
 * Required environment variable:
 *   OPENCLAW_DASHBOARD_SECRET — same secret used when generating the token
 *
 * Author: Agent R / Barbrick Design
 */

import { createHmac, timingSafeEqual } from 'crypto';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

/**
 * Verify and decode an OpenClaw Hub access token.
 * @param {string} token
 * @returns {{ valid: boolean, payload?: object, error?: string }}
 */
function verifyToken(token) {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Token is required' };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false, error: 'Malformed token' };
  }

  const [data, sig] = parts;

  const secret = process.env.OPENCLAW_DASHBOARD_SECRET;
  if (!secret) {
    // Without the secret we cannot verify — log a warning and allow
    // the frontend to degrade gracefully (it will still accept the token
    // if the user entered their order ID on the client side).
    console.warn(
      'OPENCLAW_DASHBOARD_SECRET not set — token cannot be verified server-side'
    );
    return { valid: false, error: 'Server configuration error: secret not set' };
  }

  // Re-derive expected signature
  const expectedSig = createHmac('sha256', secret).update(data).digest('base64url');

  // Constant-time comparison using Node.js crypto.timingSafeEqual
  let match = false;
  try {
    match = timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));
  } catch {
    // Buffers differ in length — not equal
    match = false;
  }

  if (!match) {
    return { valid: false, error: 'Invalid token signature' };
  }

  // Decode payload
  let payload;
  try {
    payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
  } catch {
    return { valid: false, error: 'Token payload decode error' };
  }

  // Verify it is an OpenClaw Hub token
  if (payload.product !== 'openclaw-hub') {
    return { valid: false, error: 'Token is not valid for this product' };
  }

  return { valid: true, payload };
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function handler(event) {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  let token;
  try {
    const body = JSON.parse(event.body || '{}');
    token = (body.token || '').trim();
  } catch {
    return {
      statusCode: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ valid: false, error: 'Invalid JSON body' })
    };
  }

  if (!token) {
    return {
      statusCode: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ valid: false, error: 'Token is required' })
    };
  }

  const result = verifyToken(token);

  if (!result.valid) {
    return {
      statusCode: 401,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ valid: false, error: result.error })
    };
  }

  const { email, name, orderId, ts, amount, currency } = result.payload;

  return {
    statusCode: 200,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      valid:    true,
      email,
      name,
      orderId,
      amount,
      currency,
      purchasedAt: ts ? new Date(ts).toISOString() : null
    })
  };
}
