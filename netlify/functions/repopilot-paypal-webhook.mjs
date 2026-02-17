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
 * 6. Add webhook ID to environment variables as PAYPAL_WEBHOOK_ID
 */

import crypto from 'crypto';

// PayPal webhook event types we care about
const RELEVANT_EVENTS = [
  'PAYMENT.SALE.COMPLETED',
  'PAYMENT.CAPTURE.COMPLETED',
  'CHECKOUT.ORDER.COMPLETED',
  'BILLING.SUBSCRIPTION.CREATED',
  'BILLING.SUBSCRIPTION.ACTIVATED'
];

/**
 * Verify PayPal webhook signature
 */
function verifyWebhookSignature(headers, body, webhookId) {
  try {
    const transmissionId = headers['paypal-transmission-id'];
    const transmissionTime = headers['paypal-transmission-time'];
    const certUrl = headers['paypal-cert-url'];
    const authAlgo = headers['paypal-auth-algo'];
    const transmissionSig = headers['paypal-transmission-sig'];

    if (!transmissionId || !transmissionTime || !transmissionSig) {
      console.warn('Missing required PayPal webhook headers');
      return false;
    }

    console.log('Webhook verification attempted:', {
      transmissionId,
      transmissionTime,
      authAlgo,
      certUrl
    });

    // In production: Implement full signature verification
    // For now, accept if headers are present in development
    const isProduction = process.env.PAYPAL_MODE === 'live';
    if (isProduction) {
      console.error('Production mode requires full signature verification - rejecting webhook');
      return false;
    }

    return true; // Only for development/testing
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
      const isValid = verifyWebhookSignature(headers, body, webhookId);
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
