/**
 * Contributor Registration PayPal Webhook Handler
 *
 * Handles PayPal payment webhooks for contributor tier registrations on
 * https://conciousnessrevolution.io/contributor-registration-enhanced
 *
 * On a successful payment this handler:
 *  1. Verifies the PayPal webhook signature via the PayPal REST API
 *  2. Determines the contributor tier from the payment amount
 *  3. Sends a welcome / activation email to the contributor
 *  4. Notifies BarbrickDesign@gmail.com about the new registration
 *
 * Setup Instructions:
 * 1. Go to PayPal Developer Dashboard: https://developer.paypal.com/dashboard/
 * 2. Navigate to Apps & Credentials → your app → Webhooks
 * 3. Add webhook URL:
 *      https://consciousnessrevolution.io/.netlify/functions/contributor-paypal-webhook
 * 4. Subscribe to these events:
 *      - PAYMENT.CAPTURE.COMPLETED
 *      - CHECKOUT.ORDER.COMPLETED
 * 5. Copy the Webhook ID and add the following Netlify environment variables:
 *      - CONTRIBUTOR_PAYPAL_WEBHOOK_ID  (webhook ID from step 5)
 *      - PAYPAL_CLIENT_ID               (PayPal app client ID)
 *      - PAYPAL_CLIENT_SECRET           (PayPal app client secret)
 *      - PAYPAL_MODE                    ('live' for production, 'sandbox' for testing)
 *      - GMAIL_USER / GMAIL_APP_PASSWORD (or other SMTP credentials for email)
 *
 * Author: Barbrick Design
 */

// PayPal webhook event types that signal a completed payment
const RELEVANT_EVENTS = [
  'PAYMENT.CAPTURE.COMPLETED',
  'CHECKOUT.ORDER.COMPLETED'
];

const PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'live'
  ? 'https://api.paypal.com'
  : 'https://api.sandbox.paypal.com';

// Contributor tier definitions keyed by price in USD.
// A tolerance window handles minor rounding differences from international payments.
const CONTRIBUTOR_TIERS = [
  { name: 'Bronze',         price: 50,     discountedPrice: 25,    revenueShare: '10%' },
  { name: 'Silver',         price: 200,    discountedPrice: 100,   revenueShare: '12%' },
  { name: 'Gold',           price: 500,    discountedPrice: 250,   revenueShare: '15%' },
  { name: 'Platinum',       price: 1500,   discountedPrice: 750,   revenueShare: '20%' },
  { name: 'Diamond',        price: 3500,   discountedPrice: 1750,  revenueShare: '25%' },
  { name: 'Enterprise',     price: 7500,   discountedPrice: 3750,  revenueShare: '30%' },
  { name: 'Ultimate',       price: 15000,  discountedPrice: 7500,  revenueShare: '35%' }
];

/**
 * Determine the contributor tier from the payment amount.
 * Accepts amounts within ±$1 of a defined tier price (handles rounding).
 * @param {number} amount - Payment amount in USD
 * @returns {{ name: string, price: number, revenueShare: string, isStudentDiscount: boolean } | null}
 */
function determineTierFromAmount(amount) {
  const TOLERANCE = 1.00;
  for (const tier of CONTRIBUTOR_TIERS) {
    if (Math.abs(amount - tier.price) <= TOLERANCE) {
      return { ...tier, isStudentDiscount: false };
    }
    if (Math.abs(amount - tier.discountedPrice) <= TOLERANCE) {
      return { ...tier, isStudentDiscount: true };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// PayPal helpers
// ---------------------------------------------------------------------------

/**
 * Obtain a short-lived PayPal access token using client credentials.
 */
async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be set in environment variables');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
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

/**
 * Verify the PayPal webhook signature via the PayPal REST API.
 * Reference: https://developer.paypal.com/docs/api-basics/notifications/webhooks/notification-messages/#link-verifysignature
 *
 * @param {object} headers   - Netlify event headers (lowercase keys)
 * @param {string} rawBody   - Raw (unparsed) request body string from event.body
 * @param {string} webhookId - PayPal webhook ID from the developer dashboard
 * @returns {Promise<boolean>}
 */
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

    const verifyResponse = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        auth_algo:         authAlgo,
        cert_url:          certUrl,
        transmission_id:   transmissionId,
        transmission_sig:  transmissionSig,
        transmission_time: transmissionTime,
        webhook_id:        webhookId,
        webhook_event:     JSON.parse(rawBody)  // rawBody is always event.body (raw string)
      })
    });

    if (!verifyResponse.ok) {
      console.error('PayPal verify-webhook-signature API error:', verifyResponse.statusText);
      return false;
    }

    const result = await verifyResponse.json();
    console.log('Webhook verification status:', result.verification_status);
    return result.verification_status === 'SUCCESS';
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Email helpers
// ---------------------------------------------------------------------------

const SITE_URL = process.env.URL || 'https://consciousnessrevolution.io';

/**
 * Send a welcome / activation email to the new contributor.
 * Returns false (without throwing) if no valid email is available.
 */
async function sendContributorWelcomeEmail(contributorData) {
  if (!contributorData.email) {
    console.warn('No contributor email available — skipping welcome email');
    return false;
  }

  try {
    const response = await fetch(`${SITE_URL}/.netlify/functions/send-welcome-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email:       contributorData.email,
        name:        contributorData.name,
        amount:      contributorData.amount.toFixed(2),
        currency:    contributorData.currency,
        sessionId:   contributorData.transactionId,
        productName: `${contributorData.tierName} Contributor Tier${contributorData.isStudentDiscount ? ' (Student Discount)' : ''}`
      })
    });

    if (!response.ok) {
      console.error('Failed to send contributor welcome email:', response.statusText);
      return false;
    }

    console.log('Contributor welcome email sent to:', contributorData.email);
    return true;
  } catch (error) {
    console.error('Contributor welcome email error:', error);
    return false;
  }
}

/**
 * Notify the platform owner (BarbrickDesign@gmail.com) about the new registration.
 */
async function sendOwnerNotification(contributorData) {
  try {
    const response = await fetch(`${SITE_URL}/.netlify/functions/send-welcome-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email:       'BarbrickDesign@gmail.com',
        name:        'Ryan Barbrick',
        amount:      contributorData.amount.toFixed(2),
        currency:    contributorData.currency,
        sessionId:   contributorData.transactionId,
        productName: `New Contributor Registration — ${contributorData.tierName} Tier (${contributorData.email || 'email unknown'})${contributorData.isStudentDiscount ? ' [Student Discount]' : ''}`
      })
    });

    if (!response.ok) {
      console.error('Failed to send owner notification:', response.statusText);
      return false;
    }

    console.log('Owner notification sent for new contributor:', contributorData.email);
    return true;
  } catch (error) {
    console.error('Owner notification error:', error);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

export async function handler(event) {
  console.log('Contributor PayPal Webhook received');

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const rawBody = event.body;
    const body    = JSON.parse(rawBody);
    const headers = event.headers;

    console.log('Webhook event type:', body.event_type);

    // Verify webhook signature when the webhook ID is configured
    const webhookId = process.env.CONTRIBUTOR_PAYPAL_WEBHOOK_ID;
    if (webhookId) {
      const isValid = await verifyWebhookSignature(headers, rawBody, webhookId);
      if (!isValid) {
        console.error('Invalid webhook signature — rejecting request');
        return { statusCode: 401, body: JSON.stringify({ error: 'Invalid signature' }) };
      }
    } else {
      console.warn('CONTRIBUTOR_PAYPAL_WEBHOOK_ID not set — skipping signature verification');
    }

    // Only process payment completion events
    const eventType = body.event_type;
    if (!RELEVANT_EVENTS.includes(eventType)) {
      console.log('Ignoring event type:', eventType);
      return { statusCode: 200, body: JSON.stringify({ message: 'Event type ignored' }) };
    }

    // Extract payment details from the PayPal resource object
    const resource        = body.resource;
    const transactionId   = resource.id || body.id || 'unknown';
    const rawAmount       = resource.amount?.value ||
                            resource.purchase_units?.[0]?.amount?.value ||
                            '0';
    const currency        = resource.amount?.currency_code ||
                            resource.purchase_units?.[0]?.amount?.currency_code ||
                            'USD';
    const amount          = parseFloat(rawAmount);

    // Extract contributor email — skip emails if no valid address is found
    const contributorEmail = resource.payer?.email_address ||
                             resource.purchase_units?.[0]?.custom_id || // can be set during order creation
                             null;
    if (!contributorEmail) {
      console.warn(`Webhook ${transactionId}: no contributor email found in payer data — skipping welcome email`);
    }

    const contributorName  = resource.payer?.name
      ? `${resource.payer.name.given_name || ''} ${resource.payer.name.surname || ''}`.trim()
      : 'Contributor';

    // Determine the tier
    const tier = determineTierFromAmount(amount);
    const tierName = tier ? tier.name : 'Custom';

    const contributorData = {
      email:             contributorEmail,
      name:              contributorName,
      amount,
      currency,
      transactionId,
      tierName,
      revenueShare:      tier ? tier.revenueShare : 'N/A',
      isStudentDiscount: tier ? tier.isStudentDiscount : false,
      eventType,
      timestamp:         new Date().toISOString()
    };

    console.log('New contributor payment processed:', {
      tier:           tierName,
      amount,
      currency,
      email:          contributorEmail || '(none)',
      transactionId,
      isStudentDiscount: contributorData.isStudentDiscount
    });

    // Fire both emails concurrently; don't let email failures break the 200 response
    const emailPromises = [
      contributorEmail
        ? sendContributorWelcomeEmail(contributorData)
        : Promise.resolve(false),
      sendOwnerNotification(contributorData)
    ];

    const [welcomeResult, ownerResult] = await Promise.allSettled(emailPromises);

    const welcomeSent = welcomeResult.status === 'fulfilled' && welcomeResult.value === true;
    const ownerNotified = ownerResult.status === 'fulfilled' && ownerResult.value === true;

    if (welcomeResult.status === 'rejected') {
      console.error('Welcome email failed:', welcomeResult.reason);
    }
    if (ownerResult.status === 'rejected') {
      console.error('Owner notification failed:', ownerResult.reason);
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success:           true,
        message:           'Contributor payment webhook processed',
        transactionId,
        tier:              tierName,
        welcomeEmailSent:  welcomeSent,
        ownerNotified
      })
    };

  } catch (error) {
    console.error('Webhook processing error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error', message: error.message })
    };
  }
}
