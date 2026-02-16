/**
 * ════════════════════════════════════════════════════════════════════════════════
 * © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * PROPRIETARY AND CONFIDENTIAL - INTELLECTUAL PROPERTY PROTECTION
 * 
 * This file contains proprietary intellectual property of Ryan Barbrick.
 * All concepts, algorithms, implementations, and innovations are protected by
 * copyright law and are considered trade secrets.
 * 
 * PROVISIONAL PATENT NOTICE:
 * The ideas, methods, systems, and code contained in this file are subject to
 * provisional patent protection. Unauthorized use, reproduction, modification,
 * or distribution is strictly prohibited.
 * 
 * LEGAL WARNING:
 * Unauthorized use of this intellectual property may result in:
 * - Civil litigation for copyright infringement
 * - Claims for actual and statutory damages ($750-$150,000 per work)
 * - Injunctive relief and cease & desist orders
 * - Criminal prosecution for willful infringement
 * - Recovery of attorney fees and legal costs
 * 
 * CREATOR INFORMATION:
 * Author: Ryan Barbrick
 * Business: Barbrick Design
 * Contact: BarbrickDesign@gmail.com
 * AI Assistant: Merlin AI
 * Repository: https://github.com/barbrickdesign/barbrickdesign.github.io
 * 
 * PATENT DECLARATION:
 * File: gtavi-webhook-api.js
 * Declaration ID: IP-7CF99D79-MLL28ZUJ
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * GTAVI PayPal Webhook API Handler
 * Backend endpoint for receiving and processing PayPal webhook events
 * for GTAVI Hub donor management
 * 
 * Deploy this to:
 * - Netlify Functions: /.netlify/functions/gtavi-webhook
 * - Vercel: /api/gtavi-webhook
 * - AWS Lambda: Function handler
 * - Express.js: POST /api/gtavi-webhook
 * 
 * @author Barbrick Design
 * @date 2026-01-21
 */

const crypto = require('crypto');

/**
 * Main webhook handler
 * Receives PayPal webhook events and processes them
 */
exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    // Only accept POST requests
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    const body = JSON.parse(event.body);
    const headers = event.headers;

    console.log('📨 Received PayPal webhook:', body.event_type);

    // Verify webhook signature (production)
    const isValid = await verifyWebhookSignature(body, headers);
    if (!isValid) {
      console.error('❌ Invalid webhook signature');
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid signature' })
      };
    }

    // Process webhook event
    const result = await processWebhookEvent(body);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

/**
 * Verify PayPal webhook signature
 */
async function verifyWebhookSignature(payload, headers) {
  // In production, implement proper PayPal signature verification
  // using PayPal SDK or manual verification with webhook ID
  
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    console.warn('⚠️ PayPal webhook ID not configured');
    return true; // Allow in development
  }

  // PayPal signature verification logic here
  // See: https://developer.paypal.com/api/rest/webhooks/
  
  return true; // Simplified for demo
}

/**
 * Process webhook event
 */
async function processWebhookEvent(event) {
  const eventType = event.event_type;
  const resource = event.resource;

  console.log(`Processing ${eventType}...`);

  switch (eventType) {
    case 'PAYMENT.CAPTURE.COMPLETED':
      return await handlePaymentCompleted(resource);

    case 'BILLING.SUBSCRIPTION.CREATED':
      return await handleSubscriptionCreated(resource);

    case 'BILLING.SUBSCRIPTION.CANCELLED':
      return await handleSubscriptionCancelled(resource);

    case 'BILLING.SUBSCRIPTION.UPDATED':
      return await handleSubscriptionUpdated(resource);

    default:
      console.log('⚠️ Unhandled event type:', eventType);
      return { status: 'unhandled', eventType };
  }
}

/**
 * Handle payment completed
 */
async function handlePaymentCompleted(resource) {
  try {
    const amount = parseFloat(resource.amount.value);
    const currency = resource.amount.currency_code;
    const transactionId = resource.id;
    const customId = resource.custom_id; // User email from PayPal form
    const payerEmail = resource.payer?.email_address || customId;

    console.log(`💰 Payment: $${amount} ${currency} from ${payerEmail}`);

    // Determine tier based on amount
    const tier = getTierFromAmount(amount);
    
    if (!tier) {
      console.warn(`⚠️ Amount $${amount} too low for any tier`);
      return { status: 'amount_too_low', amount };
    }

    // Store payment in database (Firestore, MongoDB, etc.)
    await storePayment({
      transactionId,
      userEmail: payerEmail,
      amount,
      currency,
      tier,
      timestamp: new Date().toISOString(),
      status: 'completed'
    });

    // Grant donor access
    await grantDonorAccess(payerEmail, tier, amount, transactionId);

    // Send confirmation email
    await sendConfirmationEmail(payerEmail, tier, amount);

    // Notify frontend via WebSocket or push notification
    await notifyFrontend({
      type: 'donation_received',
      userEmail: payerEmail,
      amount,
      tier,
      transactionId
    });

    return {
      status: 'success',
      tier,
      userEmail: payerEmail,
      transactionId
    };

  } catch (error) {
    console.error('❌ Error handling payment:', error);
    throw error;
  }
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(resource) {
  try {
    const subscriptionId = resource.id;
    const planId = resource.plan_id;
    const subscriberEmail = resource.subscriber?.email_address;

    // Get tier from plan ID or subscription metadata
    const tier = getTierFromPlanId(planId);

    console.log(`🔄 Subscription created: ${subscriberEmail} (${tier})`);

    await storeSubscription({
      subscriptionId,
      userEmail: subscriberEmail,
      planId,
      tier,
      status: 'active',
      createdAt: new Date().toISOString()
    });

    await grantDonorAccess(subscriberEmail, tier, null, subscriptionId);

    await notifyFrontend({
      type: 'subscription_created',
      userEmail: subscriberEmail,
      tier,
      subscriptionId
    });

    return {
      status: 'success',
      tier,
      userEmail: subscriberEmail,
      subscriptionId
    };

  } catch (error) {
    console.error('❌ Error handling subscription:', error);
    throw error;
  }
}

/**
 * Handle subscription cancelled
 */
async function handleSubscriptionCancelled(resource) {
  try {
    const subscriptionId = resource.id;
    const subscriberEmail = resource.subscriber?.email_address;

    console.log(`❌ Subscription cancelled: ${subscriberEmail}`);

    await updateSubscriptionStatus(subscriptionId, 'cancelled');

    // Don't immediately revoke access - set grace period
    await setAccessGracePeriod(subscriberEmail, 7); // 7 days

    await notifyFrontend({
      type: 'subscription_cancelled',
      userEmail: subscriberEmail,
      subscriptionId
    });

    return {
      status: 'success',
      action: 'cancelled_with_grace_period',
      gracePeriodDays: 7
    };

  } catch (error) {
    console.error('❌ Error handling cancellation:', error);
    throw error;
  }
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(resource) {
  try {
    const subscriptionId = resource.id;
    const subscriberEmail = resource.subscriber?.email_address;
    const newPlanId = resource.plan_id;

    const newTier = getTierFromPlanId(newPlanId);

    console.log(`⬆️ Subscription updated: ${subscriberEmail} → ${newTier}`);

    await updateSubscriptionTier(subscriptionId, newTier);
    await grantDonorAccess(subscriberEmail, newTier, null, subscriptionId);

    await notifyFrontend({
      type: 'tier_upgraded',
      userEmail: subscriberEmail,
      newTier,
      subscriptionId
    });

    return {
      status: 'success',
      newTier,
      userEmail: subscriberEmail
    };

  } catch (error) {
    console.error('❌ Error handling update:', error);
    throw error;
  }
}

/**
 * Determine tier from payment amount
 */
function getTierFromAmount(amount) {
  if (amount >= 1500) return 'enterprise';
  if (amount >= 500) return 'professional';
  if (amount >= 200) return 'standard';
  if (amount >= 50) return 'basic';
  return null;
}

/**
 * Determine tier from PayPal plan ID
 */
function getTierFromPlanId(planId) {
  // Map plan IDs to tiers
  const planMap = {
    'P-BASIC-GTAVI': 'basic',
    'P-STANDARD-GTAVI': 'standard',
    'P-PROFESSIONAL-GTAVI': 'professional',
    'P-ENTERPRISE-GTAVI': 'enterprise'
  };
  
  return planMap[planId] || 'basic';
}

/**
 * Store payment in database
 */
async function storePayment(paymentData) {
  // In production, store in Firestore, MongoDB, PostgreSQL, etc.
  console.log('💾 Storing payment:', paymentData);
  
  // Example: Firestore
  // const db = admin.firestore();
  // await db.collection('gtavi_payments').add(paymentData);
  
  return true;
}

/**
 * Store subscription in database
 */
async function storeSubscription(subscriptionData) {
  console.log('💾 Storing subscription:', subscriptionData);
  
  // Example: Store in database
  // await db.collection('gtavi_subscriptions').add(subscriptionData);
  
  return true;
}

/**
 * Grant donor access
 */
async function grantDonorAccess(email, tier, amount, transactionId) {
  console.log(`✅ Granting ${tier} access to ${email}`);
  
  const accessData = {
    email,
    tier,
    amount,
    transactionId,
    grantedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
    status: 'active'
  };
  
  // Store in database
  // await db.collection('gtavi_access').doc(email).set(accessData);
  
  return accessData;
}

/**
 * Update subscription status
 */
async function updateSubscriptionStatus(subscriptionId, status) {
  console.log(`📝 Updating subscription ${subscriptionId} to ${status}`);
  
  // Update in database
  // await db.collection('gtavi_subscriptions').doc(subscriptionId).update({ status });
  
  return true;
}

/**
 * Update subscription tier
 */
async function updateSubscriptionTier(subscriptionId, tier) {
  console.log(`📝 Updating subscription ${subscriptionId} to tier ${tier}`);
  
  // Update in database
  // await db.collection('gtavi_subscriptions').doc(subscriptionId).update({ tier });
  
  return true;
}

/**
 * Set access grace period
 */
async function setAccessGracePeriod(email, days) {
  console.log(`⏰ Setting ${days}-day grace period for ${email}`);
  
  const gracePeriodEnd = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  
  // Update in database
  // await db.collection('gtavi_access').doc(email).update({
  //   gracePeriodEnd: gracePeriodEnd.toISOString()
  // });
  
  return true;
}

/**
 * Send confirmation email
 */
async function sendConfirmationEmail(email, tier, amount) {
  console.log(`📧 Sending confirmation email to ${email}`);
  
  // In production, use SendGrid, AWS SES, etc.
  // const msg = {
  //   to: email,
  //   from: 'noreply@barbrickdesign.com',
  //   subject: `GTAVI Hub - ${tier} Access Confirmed`,
  //   html: generateConfirmationHTML(tier, amount)
  // };
  // await sgMail.send(msg);
  
  return true;
}

/**
 * Notify frontend of status change
 */
async function notifyFrontend(notification) {
  console.log('📤 Notifying frontend:', notification);
  
  // In production, use WebSockets, Server-Sent Events, or push notifications
  // await pusher.trigger('gtavi-channel', 'donor-update', notification);
  
  return true;
}

module.exports = { handler: exports.handler };
