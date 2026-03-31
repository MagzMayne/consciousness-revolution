/**
 * PayPal Checkout Netlify Function — BarbrickDesign Product Sales
 *
 * Implements the full PayPal order lifecycle for direct product sales:
 *   POST /api/paypal-checkout/create-order   — create a PayPal order
 *   POST /api/paypal-checkout/capture-order  — capture an approved order
 *   GET  /api/paypal-checkout/health         — confirm credentials are present
 *
 * Environment variables (Netlify dashboard → Site settings → Environment variables):
 *   PAYPAL_CLIENT_ID      — PayPal REST app client ID
 *   PAYPAL_CLIENT_SECRET  — PayPal REST app client secret
 *   PAYPAL_MODE           — 'live' or 'sandbox' (default: 'sandbox')
 *   PAYPAL_WEBHOOK_ID     — (optional) Webhook ID for signature verification
 *
 * Flows:
 *   Browser                           Netlify function              PayPal API
 *   ──────────────────────────────────────────────────────────────────────────
 *   1. POST /create-order  →  getAccessToken() → orders.create()  → orderID
 *   2. PayPal SDK approves the order in the browser (no server round-trip)
 *   3. POST /capture-order →  getAccessToken() → orders.capture() → receipt
 *
 * Author: BarbrickDesign (BarbrickDesign@gmail.com)
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function paypalBase() {
  return process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    body: JSON.stringify(body),
  };
}

/**
 * Obtain a short-lived OAuth2 access token from PayPal.
 * @returns {Promise<string>} access_token
 */
async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !secret) {
    throw new Error(
      'PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are not configured in environment variables.'
    );
  }

  const credentials = Buffer.from(`${clientId}:${secret}`).toString('base64');
  const res = await fetch(`${paypalBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal auth failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

/**
 * POST /api/paypal-checkout/create-order
 *
 * Body: { amount: string, currency?: string, description?: string, items?: Array }
 * Returns: { orderID: string }
 */
async function handleCreateOrder(body) {
  let parsed;
  try {
    parsed = typeof body === 'string' ? JSON.parse(body || '{}') : body || {};
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON in request body' });
  }

  const { amount, currency = 'USD', description = 'BarbrickDesign Purchase', items = [] } = parsed;

  if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
    return jsonResponse(400, { error: 'amount must be a positive number' });
  }

  const numericAmount = parseFloat(amount).toFixed(2);

  const orderPayload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: currency,
          value: numericAmount,
          ...(items.length > 0 && {
            breakdown: {
              item_total: { currency_code: currency, value: numericAmount },
            },
          }),
        },
        description,
        ...(items.length > 0 && {
          items: items.map((item) => {
            const rawName = String(item.name || 'Item');
            if (rawName.length > 127) {
              console.warn(`[paypal-checkout] Item name truncated from ${rawName.length} to 127 chars: "${rawName.slice(0, 40)}…"`);
            }
            return {
              name: rawName.slice(0, 127),
              unit_amount: {
                currency_code: currency,
                value: parseFloat(item.price || 0).toFixed(2),
              },
              quantity: String(item.quantity || 1),
              category: 'DIGITAL_GOODS',
            };
          }),
        }),
      },
    ],
    application_context: {
      brand_name: 'BarbrickDesign',
      landing_page: 'NO_PREFERENCE',
      user_action: 'PAY_NOW',
      return_url: `${process.env.SITE_URL || 'https://consciousnessrevolution.io'}/barbrick-design-store.html?status=success`,
      cancel_url: `${process.env.SITE_URL || 'https://consciousnessrevolution.io'}/barbrick-design-store.html?status=cancelled`,
    },
  };

  const accessToken = await getAccessToken();
  const res = await fetch(`${paypalBase()}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderPayload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal create-order failed (${res.status}): ${text}`);
  }

  const order = await res.json();
  return jsonResponse(201, { orderID: order.id, status: order.status });
}

/**
 * POST /api/paypal-checkout/capture-order
 *
 * Body: { orderID: string }
 * Returns: { success: true, orderID, payerEmail, amount, currency, captureID }
 */
async function handleCaptureOrder(body) {
  let parsed;
  try {
    parsed = typeof body === 'string' ? JSON.parse(body || '{}') : body || {};
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON in request body' });
  }

  const { orderID } = parsed;
  if (!orderID || typeof orderID !== 'string' || orderID.length > 64) {
    return jsonResponse(400, { error: 'orderID is required and must be a valid string' });
  }

  const accessToken = await getAccessToken();
  const res = await fetch(`${paypalBase()}/v2/checkout/orders/${orderID}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal capture failed (${res.status}): ${text}`);
  }

  const capture = await res.json();

  // Extract useful fields from the PayPal response
  const unit = capture.purchase_units?.[0];
  const captureDetails = unit?.payments?.captures?.[0] || {};
  const payer = capture.payer || {};

  const result = {
    success: capture.status === 'COMPLETED',
    orderID: capture.id,
    status: capture.status,
    captureID: captureDetails.id || null,
    amount: captureDetails.amount?.value || unit?.amount?.value || null,
    currency: captureDetails.amount?.currency_code || 'USD',
    payerEmail: payer.email_address || null,
    payerName: payer.name
      ? `${payer.name.given_name || ''} ${payer.name.surname || ''}`.trim()
      : null,
    timestamp: new Date().toISOString(),
  };

  return jsonResponse(capture.status === 'COMPLETED' ? 200 : 202, result);
}

/**
 * GET /api/paypal-checkout/health
 * Returns readiness status so dashboards can check credentials are present.
 */
function handleHealth() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  const mode = process.env.PAYPAL_MODE || 'sandbox';
  const configured = Boolean(clientId && secret);

  return jsonResponse(200, {
    status: configured ? 'ready' : 'unconfigured',
    mode,
    configured,
    message: configured
      ? `PayPal checkout ready (${mode})`
      : 'PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET not set — set them in Netlify environment variables',
    timestamp: new Date().toISOString(),
  });
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

export const handler = async (event) => {
  // CORS pre-flight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  const path = (event.path || '').replace(/\/+$/, '');
  const action = path.split('/').pop(); // create-order | capture-order | health

  try {
    if (event.httpMethod === 'GET' && action === 'health') {
      return handleHealth();
    }

    if (event.httpMethod === 'POST' && action === 'create-order') {
      return await handleCreateOrder(event.body);
    }

    if (event.httpMethod === 'POST' && action === 'capture-order') {
      return await handleCaptureOrder(event.body);
    }

    return jsonResponse(404, {
      error: 'Unknown action',
      availableRoutes: [
        'GET  /api/paypal-checkout/health',
        'POST /api/paypal-checkout/create-order',
        'POST /api/paypal-checkout/capture-order',
      ],
    });
  } catch (err) {
    console.error('[paypal-checkout] Error:', err.message);
    return jsonResponse(500, {
      error: 'Internal server error',
      message: err.message,
    });
  }
};
