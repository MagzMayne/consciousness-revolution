/**
 * PayPal Payout Netlify Function
 *
 * Initiates a PayPal payout to a recipient email address using the PayPal Payouts API.
 * If the API is unavailable or not configured, it returns a pre-filled PayPal
 * "Send Money" URL that the user can open in their browser to complete payment manually.
 *
 * Endpoint: POST /.netlify/functions/paypal-payout
 * (via redirect: POST /api/paypal-payout)
 *
 * Required environment variables (Netlify dashboard → Site settings → Environment variables):
 *   PAYPAL_CLIENT_ID     — PayPal app Client ID
 *   PAYPAL_CLIENT_SECRET — PayPal app Client Secret
 *   PAYPAL_MODE          — 'live' for production, 'sandbox' for testing (default: 'sandbox')
 *
 * Request body (JSON):
 *   { recipientEmail, amount, note, memberId }
 *
 * Response (JSON):
 *   Success:  { success: true, payoutId, status, fallbackUrl }
 *   Fallback: { success: false, apiError, fallbackUrl, requiresManual: true }
 *
 * Notes:
 *   - The PayPal Payouts API requires a Business account with the Payouts feature enabled.
 *     Apply at https://developer.paypal.com/docs/payouts/ if not yet enabled.
 *   - Until enabled, the function returns fallbackUrl so the payer can send money manually.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function paypalApiBase() {
  return process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

/**
 * Build a PayPal "Send Money" URL the user can open to pay manually.
 * @param {string} recipientEmail
 * @param {string|number} amount
 * @returns {string}
 */
function buildFallbackUrl(recipientEmail, amount) {
  const encoded = encodeURIComponent(recipientEmail);
  return `https://www.paypal.com/myaccount/transfer/send?emailAddress=${encoded}&amount=${amount}&currencyCode=USD`;
}

/**
 * Obtain a short-lived PayPal OAuth2 access token.
 * @returns {Promise<string>}
 */
async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are not configured in environment variables.');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch(`${paypalApiBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PayPal auth failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data.access_token;
}

export const handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: 'Method not allowed' }),
    };
  }

  // Parse body
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: 'Invalid JSON body' }),
    };
  }

  const { recipientEmail, amount, note = 'Payroll payment — Consciousness Revolution', memberId = '' } = body;

  // Validate inputs
  if (!recipientEmail || !amount) {
    return {
      statusCode: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: 'recipientEmail and amount are required' }),
    };
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
    return {
      statusCode: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: 'Invalid recipientEmail format' }),
    };
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return {
      statusCode: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: 'amount must be a positive number' }),
    };
  }

  const amountStr = parsedAmount.toFixed(2);
  const fallbackUrl = buildFallbackUrl(recipientEmail, amountStr);

  // If credentials are not set, skip API call and return the manual link
  const hasCredentials = Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
  if (!hasCredentials) {
    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        apiError: 'PayPal credentials are not configured. Use the manual payment link.',
        fallbackUrl,
        requiresManual: true,
      }),
    };
  }

  // Attempt PayPal Payouts API call
  try {
    const accessToken = await getAccessToken();
    const senderBatchId = `payroll_${memberId}_${Date.now()}`;

    const payoutPayload = {
      sender_batch_header: {
        sender_batch_id: senderBatchId,
        email_subject: 'You have received a payment from Consciousness Revolution',
        email_message: note,
      },
      items: [
        {
          recipient_type: 'EMAIL',
          amount: { value: amountStr, currency: 'USD' },
          note,
          receiver: recipientEmail,
          sender_item_id: `item_${Date.now()}`,
        },
      ],
    };

    const response = await fetch(`${paypalApiBase()}/v1/payments/payouts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payoutPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `PayPal Payouts API error (${response.status})`);
    }

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        payoutId: data.batch_header?.payout_batch_id,
        status: data.batch_header?.batch_status,
        fallbackUrl,
      }),
    };
  } catch (err) {
    console.error('PayPal payout error:', err.message);
    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        apiError: err.message,
        fallbackUrl,
        requiresManual: true,
      }),
    };
  }
};
