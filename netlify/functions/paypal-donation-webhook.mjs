/**
 * PayPal Webhook Handler for Donations
 * 
 * Receives PayPal REST API webhooks for donations to BarbrickDesign@gmail.com
 * 
 * Author: Agent R (Barbrick Design)
 * Date: 2026-02-14
 * 
 * Setup Instructions:
 * 1. Go to PayPal Developer Dashboard: https://developer.paypal.com/dashboard/
 * 2. Navigate to Apps & Credentials
 * 3. Create a REST API app or use existing one
 * 4. Configure webhook URL: https://consciousnessrevolution.io/.netlify/functions/paypal-donation-webhook
 * 5. Subscribe to these events:
 *    - PAYMENT.SALE.COMPLETED
 *    - PAYMENT.CAPTURE.COMPLETED
 * 6. Add the following to Netlify environment variables:
 *    - PAYPAL_WEBHOOK_ID  (webhook ID from PayPal dashboard)
 *    - PAYPAL_CLIENT_ID   (PayPal app client ID)
 *    - PAYPAL_CLIENT_SECRET (PayPal app client secret)
 *    - PAYPAL_MODE        (set to 'live' for production, 'sandbox' for testing)
 */

// PayPal webhook event types we care about
const RELEVANT_EVENTS = [
  'PAYMENT.SALE.COMPLETED',
  'PAYMENT.CAPTURE.COMPLETED',
  'CHECKOUT.ORDER.COMPLETED'
];

const PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'live'
  ? 'https://api.paypal.com'
  : 'https://api.sandbox.paypal.com';

/**
 * Get a PayPal access token for API calls
 */
async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be set');
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
 * Verify PayPal webhook signature using the PayPal REST API.
 * Uses https://developer.paypal.com/docs/api-basics/notifications/webhooks/notification-messages/#link-verifysignature
 */
async function verifyWebhookSignature(headers, rawBody, webhookId) {
  try {
    const transmissionId = headers['paypal-transmission-id'];
    const transmissionTime = headers['paypal-transmission-time'];
    const certUrl = headers['paypal-cert-url'];
    const authAlgo = headers['paypal-auth-algo'];
    const transmissionSig = headers['paypal-transmission-sig'];

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
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        transmission_time: transmissionTime,
        webhook_id: webhookId,
        webhook_event: JSON.parse(rawBody)  // rawBody is always event.body (raw string)
      })
    });

    if (!verifyResponse.ok) {
      console.error('PayPal verify-webhook-signature API error:', verifyResponse.statusText);
      return false;
    }

    const result = await verifyResponse.json();
    console.log('Webhook verification result:', result.verification_status);
    return result.verification_status === 'SUCCESS';
  } catch (error) {
    console.error('Webhook verification error:', error);
    return false;
  }
}

/**
 * Log donation to console and/or database
 */
async function logDonation(donationData) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    event: 'PayPal Donation Received',
    amount: donationData.amount,
    currency: donationData.currency,
    donor: donationData.donor,
    transactionId: donationData.transactionId,
    recipient: 'BarbrickDesign@gmail.com'
  };

  console.log('DONATION RECEIVED:', JSON.stringify(logEntry, null, 2));

  // Future: Save to Supabase or send notification email
  // await supabase.from('donations').insert(logEntry);
  
  return logEntry;
}

/**
 * Send thank you notification
 */
async function sendThankYou(donationData) {
  // Future: Send email via SendGrid or similar
  console.log(`Thank you email would be sent to: ${donationData.donor}`);
  
  // Could also trigger Discord notification, etc.
  return true;
}

/**
 * Main webhook handler
 */
export async function handler(event, context) {
  console.log('PayPal Webhook received');

  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const headers = event.headers;

    // Verify webhook signature (if webhook ID is configured)
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    if (webhookId) {
      const isValid = await verifyWebhookSignature(headers, event.body, webhookId);
      if (!isValid) {
        console.error('Invalid webhook signature');
        return {
          statusCode: 401,
          body: JSON.stringify({ error: 'Invalid signature' })
        };
      }
    }

    // Check if this is an event we care about
    const eventType = body.event_type;
    if (!RELEVANT_EVENTS.includes(eventType)) {
      console.log('Ignoring event type:', eventType);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Event type ignored' })
      };
    }

    // Extract donation details
    const resource = body.resource;
    const donationData = {
      transactionId: resource.id || 'unknown',
      amount: resource.amount?.value || '0',
      currency: resource.amount?.currency_code || 'USD',
      donor: resource.payer?.email_address || 'anonymous',
      donorName: resource.payer?.name?.given_name || 'Anonymous',
      status: resource.state || resource.status || 'unknown',
      eventType: eventType
    };

    // Log the donation
    await logDonation(donationData);

    // Send thank you (async, don't wait)
    sendThankYou(donationData).catch(err => 
      console.error('Thank you notification failed:', err)
    );

    // Respond to PayPal that we received the webhook
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Donation webhook processed',
        transactionId: donationData.transactionId
      })
    };

  } catch (error) {
    console.error('Webhook processing error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
}
