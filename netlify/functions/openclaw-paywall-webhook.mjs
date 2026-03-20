/**
 * OpenClaw Hub Paywall — PayPal Webhook Handler
 *
 * Receives PayPal payment webhooks for OpenClaw Hub dashboard purchases
 * (payment to BarbrickDesign@gmail.com).
 *
 * On a successful payment this handler:
 *  1. Verifies the PayPal webhook signature
 *  2. Generates a unique HMAC-signed access token for the buyer
 *  3. Sends the buyer a personalised email with their token + dashboard link
 *  4. Notifies BarbrickDesign@gmail.com about the new purchase
 *
 * Setup Instructions:
 * 1. Go to PayPal Developer Dashboard: https://developer.paypal.com/dashboard/
 * 2. Navigate to Apps & Credentials → your app → Webhooks
 * 3. Add webhook URL:
 *      https://consciousnessrevolution.io/.netlify/functions/openclaw-paywall-webhook
 * 4. Subscribe to:
 *      PAYMENT.CAPTURE.COMPLETED
 *      CHECKOUT.ORDER.COMPLETED
 * 5. Add these Netlify environment variables:
 *      OPENCLAW_PAYPAL_WEBHOOK_ID   — webhook ID from step 4
 *      OPENCLAW_DASHBOARD_SECRET    — random 32-char secret for token signing
 *      PAYPAL_CLIENT_ID             — PayPal app client ID
 *      PAYPAL_CLIENT_SECRET         — PayPal app client secret
 *      PAYPAL_MODE                  — 'live' | 'sandbox'
 *      GMAIL_USER                   — sender Gmail address
 *      GMAIL_APP_PASSWORD           — Gmail app password
 *
 * Author: Agent R / Barbrick Design
 */

import { createHmac } from 'crypto';
import nodemailer from 'nodemailer';

const RELEVANT_EVENTS = ['PAYMENT.CAPTURE.COMPLETED', 'CHECKOUT.ORDER.COMPLETED'];

const PAYPAL_API_BASE =
  process.env.PAYPAL_MODE === 'live'
    ? 'https://api.paypal.com'
    : 'https://api.sandbox.paypal.com';

const SITE_URL = process.env.URL || 'https://consciousnessrevolution.io';

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------

/**
 * Generate a signed access token that encodes the buyer's identity.
 * Format: base64url(payload) + '.' + base64url(hmac)
 *
 * The token is self-verifying — no database required.
 * The OPENCLAW_DASHBOARD_SECRET env var must be set for real deployments.
 */
function generateAccessToken(payload) {
  const secret = process.env.OPENCLAW_DASHBOARD_SECRET;
  if (!secret) {
    throw new Error(
      'OPENCLAW_DASHBOARD_SECRET environment variable is not set. ' +
      'Set this variable in Netlify to enable secure token generation.'
    );
  }

  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig  = createHmac('sha256', secret).update(data).digest('base64url');
  return `${data}.${sig}`;
}

// ---------------------------------------------------------------------------
// PayPal helpers
// ---------------------------------------------------------------------------

async function getPayPalAccessToken() {
  const clientId     = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be set');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response    = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method:  'POST',
    headers: {
      Authorization:  `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    throw new Error(`Failed to get PayPal access token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function verifyWebhookSignature(headers, rawBody, webhookId) {
  try {
    const transmissionId   = headers['paypal-transmission-id'];
    const transmissionTime = headers['paypal-transmission-time'];
    const certUrl          = headers['paypal-cert-url'];
    const authAlgo         = headers['paypal-auth-algo'];
    const transmissionSig  = headers['paypal-transmission-sig'];

    if (!transmissionId || !transmissionTime || !transmissionSig || !certUrl || !authAlgo) {
      console.warn('Missing required PayPal webhook headers');
      return false;
    }

    const accessToken = await getPayPalAccessToken();

    const verifyResponse = await fetch(
      `${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`,
      {
        method:  'POST',
        headers: {
          Authorization:  `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          auth_algo:         authAlgo,
          cert_url:          certUrl,
          transmission_id:   transmissionId,
          transmission_sig:  transmissionSig,
          transmission_time: transmissionTime,
          webhook_id:        webhookId,
          webhook_event:     JSON.parse(rawBody)
        })
      }
    );

    if (!verifyResponse.ok) {
      console.error('PayPal signature verification error:', verifyResponse.statusText);
      return false;
    }

    const result = await verifyResponse.json();
    console.log('Webhook verification status:', result.verification_status);
    return result.verification_status === 'SUCCESS';
  } catch (error) {
    console.error('Webhook signature verification threw:', error);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Email helpers
// ---------------------------------------------------------------------------

function createMailTransporter() {
  return nodemailer.createTransport({
    host:   'smtp.gmail.com',
    port:   587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });
}

/**
 * Send the buyer their unique access token and a direct dashboard link.
 */
async function sendBuyerEmail({ email, name, orderId, token }) {
  if (!email) {
    console.warn('No buyer email found — skipping buyer notification');
    return false;
  }

  const dashboardUrl = `${SITE_URL}/openclaw-hub.html#token=${encodeURIComponent(token)}`;
  const transporter  = createMailTransporter();

  const mailOptions = {
    from:    `"OpenClaw Hub — Barbrick Design" <${process.env.GMAIL_USER}>`,
    to:      email,
    subject: '🦞 Your OpenClaw Hub Access is Ready',
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0d1117; color: #e6edf3; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 24px; }
    .header { background: linear-gradient(135deg, #1f2937, #111827); border-radius: 12px 12px 0 0; padding: 32px 24px; text-align: center; border-bottom: 2px solid #ff5c5c; }
    .header h1 { margin: 0; font-size: 28px; color: #fff; }
    .header p  { margin: 8px 0 0; color: #9ca3af; }
    .body { background: #161b22; border-radius: 0 0 12px 12px; padding: 32px 24px; }
    .token-box { background: #0d1117; border: 1px solid #30363d; border-radius: 8px; padding: 16px; font-family: monospace; font-size: 13px; word-break: break-all; color: #ff5c5c; margin: 16px 0; }
    .cta { display: block; text-align: center; margin: 24px 0; padding: 14px 28px; background: #ff5c5c; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; }
    .steps { padding-left: 20px; }
    .steps li { margin: 10px 0; color: #c9d1d9; }
    .footer { text-align: center; color: #6e7681; font-size: 13px; margin-top: 32px; }
    .footer a { color: #58a6ff; }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div style="font-size:48px">🦞</div>
    <h1>OpenClaw Enhanced Hub</h1>
    <p>Your personal dashboard is ready, ${name || 'there'}!</p>
  </div>
  <div class="body">
    <p>Thank you for your purchase (Order: <code>${orderId}</code>). Your unique dashboard access token is below:</p>

    <div class="token-box">${token}</div>

    <p><strong>Two ways to access your dashboard:</strong></p>
    <ol class="steps">
      <li><strong>One-click link</strong> — click the button below (auto-fills your token):</li>
    </ol>

    <a class="cta" href="${dashboardUrl}">🚀 Open My OpenClaw Hub Dashboard</a>

    <ol class="steps" start="2">
      <li><strong>Manual entry</strong> — visit <a href="${SITE_URL}/openclaw-hub.html" style="color:#58a6ff">${SITE_URL}/openclaw-hub.html</a>, click <em>"I Already Paid"</em>, and paste your token above.</li>
    </ol>

    <p><strong>What's included in your dashboard:</strong></p>
    <ul class="steps">
      <li>🤖 AI Agent Layer — autonomous agent orchestration</li>
      <li>📊 Predictive Diagnostics</li>
      <li>💰 Revenue Intelligence AI</li>
      <li>🔧 Self-Healing System</li>
      <li>⚡ Quantum Scheduler</li>
      <li>🔌 Plugins Engine</li>
      <li>🎯 Mission Control</li>
      <li>🛒 Shop &amp; All future advanced tabs</li>
    </ul>

    <p style="color:#6e7681;font-size:13px;margin-top:24px">Keep this email — your token is your permanent key. There are no subscriptions or renewals.</p>
  </div>
  <div class="footer">
    <p>Questions? <a href="mailto:BarbrickDesign@gmail.com">BarbrickDesign@gmail.com</a></p>
    <p>© 2024-2026 Barbrick Design · Ryan Barbrick</p>
  </div>
</div>
</body>
</html>`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Buyer email sent to:', email);
    return true;
  } catch (error) {
    console.error('Failed to send buyer email:', error);
    return false;
  }
}

/**
 * Notify the owner (BarbrickDesign@gmail.com) about the new purchase.
 */
async function sendOwnerNotification({ email, name, orderId, amount, currency }) {
  const transporter = createMailTransporter();

  const mailOptions = {
    from:    `"OpenClaw Hub Webhook" <${process.env.GMAIL_USER}>`,
    to:      'BarbrickDesign@gmail.com',
    subject: `🦞 New OpenClaw Hub Purchase — ${name || email || orderId}`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /></head>
<body style="font-family:sans-serif;padding:24px;background:#f9f9f9;color:#333">
  <h2>🦞 New OpenClaw Hub Purchase</h2>
  <table style="border-collapse:collapse;width:100%">
    <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#fff"><strong>Name</strong></td>
        <td style="padding:8px 12px;border:1px solid #ddd">${name || '(unknown)'}</td></tr>
    <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#fff"><strong>Email</strong></td>
        <td style="padding:8px 12px;border:1px solid #ddd">${email || '(unknown)'}</td></tr>
    <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#fff"><strong>PayPal Order ID</strong></td>
        <td style="padding:8px 12px;border:1px solid #ddd">${orderId}</td></tr>
    <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#fff"><strong>Amount</strong></td>
        <td style="padding:8px 12px;border:1px solid #ddd">${amount} ${currency}</td></tr>
    <tr><td style="padding:8px 12px;border:1px solid #ddd;background:#fff"><strong>Timestamp</strong></td>
        <td style="padding:8px 12px;border:1px solid #ddd">${new Date().toUTCString()}</td></tr>
  </table>
  <p style="color:#666;font-size:13px;margin-top:16px">Access token was automatically generated and sent to the buyer.</p>
</body>
</html>`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Owner notification sent for order:', orderId);
    return true;
  } catch (error) {
    console.error('Failed to send owner notification:', error);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

export async function handler(event) {
  console.log('OpenClaw Paywall Webhook received');

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const rawBody = event.body;
    if (!rawBody) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Empty request body' }) };
    }

    const body    = JSON.parse(rawBody);
    const headers = event.headers;

    console.log('Event type:', body.event_type);

    // ── Verify webhook signature ──────────────────────────────────────────
    const webhookId = process.env.OPENCLAW_PAYPAL_WEBHOOK_ID;
    if (!webhookId) {
      console.error('OPENCLAW_PAYPAL_WEBHOOK_ID is not set — rejecting unverifiable webhook');
      return {
        statusCode: 503,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Webhook verification not configured' })
      };
    }

    const isValid = await verifyWebhookSignature(headers, rawBody, webhookId);
    if (!isValid) {
      console.error('Invalid webhook signature — rejecting');
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid signature' }) };
    }

    // ── Only act on payment completion events ─────────────────────────────
    if (!RELEVANT_EVENTS.includes(body.event_type)) {
      console.log('Ignoring event:', body.event_type);
      return { statusCode: 200, body: JSON.stringify({ message: 'Event type ignored' }) };
    }

    // ── Extract payment details ───────────────────────────────────────────
    const resource = body.resource || {};
    const orderId  = resource.id || body.id || 'unknown';
    const amount   = parseFloat(
      resource.amount?.value ||
      resource.purchase_units?.[0]?.amount?.value ||
      '0'
    );
    const currency = (
      resource.amount?.currency_code ||
      resource.purchase_units?.[0]?.amount?.currency_code ||
      'USD'
    ).toUpperCase();

    // ── Validate expected purchase amount ($49 USD) ───────────────────────
    const EXPECTED_AMOUNT_USD = 49;
    const AMOUNT_TOLERANCE    = 1.00; // allow minor rounding/fx differences
    if (currency !== 'USD' || Math.abs(amount - EXPECTED_AMOUNT_USD) > AMOUNT_TOLERANCE) {
      console.warn(`Unexpected payment: ${amount} ${currency} for order ${orderId} — ignoring`);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Payment amount does not match expected price — ignored' })
      };
    }

    const buyerEmail = resource.payer?.email_address || null;
    const buyerName = resource.payer?.name
      ? `${resource.payer.name.given_name || ''} ${resource.payer.name.surname || ''}`.trim()
      : (buyerEmail ? buyerEmail.split('@')[0] : `User-${String(orderId).slice(-6)}`);

    console.log('Purchase details:', { orderId, amount, currency, buyerEmail });

    // ── Generate unique access token ──────────────────────────────────────
    const tokenPayload = {
      email:   buyerEmail,
      name:    buyerName,
      orderId,
      amount,
      currency,
      ts:      Date.now(),
      product: 'openclaw-hub'
    };
    const accessToken = generateAccessToken(tokenPayload);
    console.log('Access token generated for order:', orderId);

    // ── Send emails concurrently ──────────────────────────────────────────
    const [buyerResult, ownerResult] = await Promise.allSettled([
      buyerEmail
        ? sendBuyerEmail({ email: buyerEmail, name: buyerName, orderId, token: accessToken })
        : Promise.resolve(false),
      sendOwnerNotification({ email: buyerEmail, name: buyerName, orderId, amount, currency })
    ]);

    const buyerEmailSent = buyerResult.status === 'fulfilled' && buyerResult.value === true;
    const ownerNotified  = ownerResult.status  === 'fulfilled' && ownerResult.value  === true;

    if (buyerResult.status  === 'rejected') console.error('Buyer email failed:', buyerResult.reason);
    if (ownerResult.status  === 'rejected') console.error('Owner notification failed:', ownerResult.reason);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success:        true,
        message:        'OpenClaw Hub payment processed — unique dashboard generated',
        orderId,
        buyerEmailSent,
        ownerNotified
      })
    };

  } catch (error) {
    console.error('OpenClaw paywall webhook error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error', message: error.message })
    };
  }
}
