/**
 * RepoPilot PayPal Webhook Handler
 * 
 * Receives PayPal webhooks for RepoPilot subscription purchases
 * Automatically triggers delivery notifications and welcome emails
 * 
 * Author: Agent R (Barbrick Design)
 * Date: 2026-02-17
 * 
 * Setup Instructions:
 * 1. Go to PayPal Developer Dashboard: https://developer.paypal.com/dashboard/
 * 2. Navigate to Apps & Credentials
 * 3. Select your RepoPilot app
 * 4. Add webhook URL: https://consciousnessrevolution.io/.netlify/functions/repopilot-paypal-webhook
 * 5. Subscribe to these events:
 *    - PAYMENT.SALE.COMPLETED
 *    - PAYMENT.CAPTURE.COMPLETED
 *    - CHECKOUT.ORDER.COMPLETED
 *    - BILLING.SUBSCRIPTION.CREATED
 *    - BILLING.SUBSCRIPTION.ACTIVATED
 * 6. Add the following to Netlify environment variables:
 *    - PAYPAL_WEBHOOK_ID      (webhook ID from PayPal dashboard)
 *    - PAYPAL_CLIENT_ID       (PayPal app client ID)
 *    - PAYPAL_CLIENT_SECRET   (PayPal app client secret)
 *    - PAYPAL_MODE            (set to 'live' for production, 'sandbox' for testing)
 */

// PayPal webhook event types we care about
const RELEVANT_EVENTS = [
  'PAYMENT.SALE.COMPLETED',
  'PAYMENT.CAPTURE.COMPLETED',
  'CHECKOUT.ORDER.COMPLETED',
  'BILLING.SUBSCRIPTION.CREATED',
  'BILLING.SUBSCRIPTION.ACTIVATED'
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
 * Extract customer email from PayPal webhook data
 */
function extractCustomerEmail(resource) {
  // Try multiple possible locations for email
  return resource.payer?.email_address ||
         resource.payer?.payer_info?.email ||
         resource.subscriber?.email_address ||
         resource.subscriber?.payer?.email_address ||
         'unknown@example.com';
}

/**
 * Determine RepoPilot plan from amount
 */
function determinePlan(amount) {
  const value = parseFloat(amount);
  
  if (value === 0) return 'Free';
  if (value === 29 || value === 29.00) return 'Pro';
  
  // Any other amount is considered custom/enterprise
  return 'Enterprise';
}

/**
 * Send delivery notification to barbrickdesign@gmail.com
 */
async function sendDeliveryNotification(orderData) {
  try {
    const response = await fetch(`${process.env.URL || 'https://consciousnessrevolution.io'}/.netlify/functions/repopilot-delivery-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      console.error('Failed to send delivery notification:', response.statusText);
      return false;
    }

    console.log('Delivery notification sent successfully');
    return true;
  } catch (error) {
    console.error('Delivery notification error:', error);
    return false;
  }
}

/**
 * Send welcome email to customer
 */
async function sendWelcomeEmail(orderData) {
  try {
    const response = await fetch(`${process.env.URL || 'https://consciousnessrevolution.io'}/.netlify/functions/send-repopilot-welcome`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      console.error('Failed to send welcome email:', response.statusText);
      return false;
    }

    console.log('Welcome email sent successfully');
    return true;
  } catch (error) {
    console.error('Welcome email error:', error);
    return false;
  }
}

/**
 * Main webhook handler
 */
export async function handler(event, context) {
  console.log('RepoPilot PayPal Webhook received');

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

    console.log('Webhook event type:', body.event_type);
    console.log('Webhook body:', JSON.stringify(body, null, 2));

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

    // Extract payment/subscription details
    const resource = body.resource;
    const customerEmail = extractCustomerEmail(resource);
    const amount = resource.amount?.value || 
                   resource.amount?.total || 
                   resource.plan?.payment_definitions?.[0]?.amount?.value || 
                   '29.00';
    const currency = resource.amount?.currency_code || 'USD';
    const transactionId = resource.id || body.id || 'unknown';
    const plan = determinePlan(amount);

    // Create order data
    const orderData = {
      plan: plan,
      email: customerEmail,
      amount: parseFloat(amount),
      currency: currency,
      orderId: transactionId,
      timestamp: new Date().toISOString(),
      eventType: eventType
    };

    console.log('Processing order:', orderData);

    // Send delivery notification to barbrickdesign@gmail.com
    const deliveryNotificationSent = await sendDeliveryNotification(orderData);

    // Send welcome email to customer
    const welcomeEmailSent = await sendWelcomeEmail(orderData);

    // Log the results
    console.log('Autonomous delivery results:', {
      deliveryNotificationSent,
      welcomeEmailSent,
      orderData
    });

    // Respond to PayPal that we received the webhook
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'RepoPilot webhook processed',
        transactionId: transactionId,
        deliveryNotificationSent,
        welcomeEmailSent
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
