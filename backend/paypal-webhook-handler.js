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
 * File: paypal-webhook-handler.js
 * Declaration ID: IP-249AC89D-MLL28ZUK
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * PayPal Webhook Handler for TopStep Hub Subscription Tiers
 * Receives and processes PayPal webhook events for tier upgrades
 * 
 * Deploy this to Firebase Functions, Netlify Functions, AWS Lambda, or similar
 * 
 * @author Barbrick Design
 * @date 2026-01-25
 */

const crypto = require('crypto');

/**
 * Verify PayPal webhook signature
 */
function verifyWebhookSignature(payload, headers, webhookId) {
    const transmissionId = headers['paypal-transmission-id'];
    const transmissionTime = headers['paypal-transmission-time'];
    const certUrl = headers['paypal-cert-url'];
    const transmissionSig = headers['paypal-transmission-sig'];
    const authAlgo = headers['paypal-auth-algo'];
    
    // In production, verify the signature using PayPal SDK
    // For now, return true for testing
    return true;
}

/**
 * Process PayPal webhook event
 */
async function processWebhookEvent(event) {
    console.log('Processing webhook event:', event.event_type);
    
    const eventType = event.event_type;
    const resource = event.resource;
    
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
            console.log('Unhandled event type:', eventType);
            return { status: 'unhandled' };
    }
}

/**
 * Handle payment completed event for TopStep Hub tiers
 */
async function handlePaymentCompleted(resource) {
    const amount = parseFloat(resource.amount.value);
    const currency = resource.amount.currency_code;
    const transactionId = resource.id;
    const customId = resource.custom_id; // User ID
    
    console.log(`Payment completed: $${amount} ${currency} from user ${customId}`);
    
    // Determine tier based on amount
    let tier = null;
    if (amount >= 299) tier = 'elite';
    else if (amount >= 149) tier = 'professional';
    else if (amount >= 49) tier = 'starter';
    
    if (tier) {
        // Store in database (Firestore, MongoDB, etc.)
        await storePayment({
            transactionId: transactionId,
            userId: customId,
            amount: amount,
            currency: currency,
            tier: tier,
            timestamp: new Date().toISOString(),
            status: 'completed',
            source: 'topstep-hub'
        });
        
        // Grant tier access
        await grantTierAccess(customId, tier, amount, transactionId);
        
        // Send confirmation email
        await sendConfirmationEmail(customId, tier, amount);
        
        // Notify hub for real-time update
        await notifyHub({
            type: 'tier_upgraded',
            userId: customId,
            tier: tier,
            amount: amount,
            transactionId: transactionId
        });
    }
    
    return {
        status: 'processed',
        tier: tier,
        amount: amount
    };
}

/**
 * Handle subscription created event
 */
async function handleSubscriptionCreated(resource) {
    const subscriptionId = resource.id;
    const planId = resource.plan_id;
    const subscriberEmail = resource.subscriber?.email_address;
    const customId = resource.custom_id;
    
    console.log(`Subscription created: ${subscriptionId} for ${subscriberEmail || customId}`);
    
    // Store subscription
    await storeSubscription({
        subscriptionId: subscriptionId,
        planId: planId,
        userId: subscriberEmail || customId,
        status: resource.status,
        createdAt: new Date().toISOString()
    });
    
    // Grant access based on plan
    const tier = getTierFromPlanId(planId);
    if (tier) {
        await grantTierAccess(subscriberEmail || customId, tier, 0);
    }
    
    return {
        status: 'processed',
        subscriptionId: subscriptionId
    };
}

/**
 * Handle subscription cancelled event
 */
async function handleSubscriptionCancelled(resource) {
    const subscriptionId = resource.id;
    
    console.log(`Subscription cancelled: ${subscriptionId}`);
    
    // Update subscription status
    await updateSubscription(subscriptionId, {
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
    });
    
    // Get user from subscription
    const subscription = await getSubscription(subscriptionId);
    if (subscription && subscription.userId) {
        // Downgrade to free tier at end of billing period
        await scheduleDowngrade(subscription.userId, 'free', subscription.nextBillingDate);
        
        // Send cancellation confirmation
        await sendCancellationEmail(subscription.userId);
    }
    
    return {
        status: 'processed',
        subscriptionId: subscriptionId
    };
}

/**
 * Handle subscription updated event
 */
async function handleSubscriptionUpdated(resource) {
    const subscriptionId = resource.id;
    
    console.log(`Subscription updated: ${subscriptionId}`);
    
    // Update subscription status
    await updateSubscription(subscriptionId, {
        status: resource.status,
        updatedAt: new Date().toISOString()
    });
    
    return {
        status: 'processed',
        subscriptionId: subscriptionId
    };
}

/**
 * Store payment in database
 */
async function storePayment(paymentData) {
    // Implement database storage
    // Example with Firestore:
    // const db = admin.firestore();
    // await db.collection('topstep_payments').add(paymentData);
    
    console.log('Payment stored:', paymentData);
}

/**
 * Store subscription in database
 */
async function storeSubscription(subscriptionData) {
    // Implement database storage
    console.log('Subscription stored:', subscriptionData);
}

/**
 * Update subscription in database
 */
async function updateSubscription(subscriptionId, updates) {
    // Implement database update
    console.log('Subscription updated:', subscriptionId, updates);
}

/**
 * Get subscription from database
 */
async function getSubscription(subscriptionId) {
    // Implement database query
    console.log('Fetching subscription:', subscriptionId);
    return null;
}

/**
 * Grant tier access to user
 */
async function grantTierAccess(userId, tier, amount, transactionId = null) {
    // Calculate subscription end date (30 days from now)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    
    const accessData = {
        userId: userId,
        tier: tier,
        amount: amount,
        transactionId: transactionId,
        grantedAt: new Date().toISOString(),
        expiresAt: endDate.toISOString(),
        status: 'active',
        source: 'topstep-hub'
    };
    
    // Store access grant in database
    console.log('Tier access granted:', accessData);
    
    // Update user tier in auth system
    // await updateUserTier(userId, tier, accessData);
    
    return accessData;
}

/**
 * Schedule downgrade for future date
 */
async function scheduleDowngrade(userId, targetTier, effectiveDate) {
    console.log(`Scheduling downgrade for ${userId} to ${targetTier} on ${effectiveDate}`);
    // Implement scheduled downgrade logic
}

/**
 * Send confirmation email
 */
async function sendConfirmationEmail(userId, tier, amount) {
    // Implement email sending (SendGrid, AWS SES, etc.)
    console.log(`Sending confirmation email to ${userId} for ${tier} tier ($${amount})`);
    
    const tierNames = {
        starter: 'Starter',
        professional: 'Professional',
        elite: 'Elite'
    };
    
    const dailyProfits = {
        starter: { min: 50, max: 150, avg: 85 },
        professional: { min: 150, max: 350, avg: 225 },
        elite: { min: 350, max: 650, avg: 475 }
    };
    
    const profit = dailyProfits[tier];
    
    const emailContent = `
    Dear Trader,
    
    Thank you for subscribing to TopStep Hub ${tierNames[tier]} Plan!
    
    Your subscription has been activated and you now have access to:
    
    💰 Daily Profit Potential: $${profit.min} - $${profit.max} (avg $${profit.avg}/day)
    🤖 Automated Trading Strategies
    📊 Advanced Analytics & Copy Trading
    🔄 Real-Time Data & API Access
    
    Payment Details:
    - Amount: $${amount}
    - Plan: ${tierNames[tier]} (Monthly)
    - Billing: Auto-renewal (cancel anytime)
    - Recipient: barbrickdesign@gmail.com
    
    Getting Started:
    1. Log in to TopStep Hub
    2. Your tier is now active
    3. Create trading accounts
    4. Enable automation
    5. Start earning!
    
    Need help? Reply to this email or contact barbrickdesign@gmail.com
    
    Happy Trading!
    TopStep Hub Team
    `;
    
    // Send email
    // await sendEmail(userId, 'TopStep Hub - Subscription Activated', emailContent);
}

/**
 * Send cancellation confirmation
 */
async function sendCancellationEmail(userId) {
    console.log(`Sending cancellation email to ${userId}`);
    // Implement cancellation email
}

/**
 * Notify hub of updates
 */
async function notifyHub(data) {
    // Implement real-time notification
    // Example with Firebase Realtime Database:
    // const db = admin.database();
    // await db.ref('hub_updates').push(data);
    
    console.log('Hub notified:', data);
}

/**
 * Get tier from plan ID
 */
function getTierFromPlanId(planId) {
    const planTiers = {
        'P-STARTER-MONTHLY': 'starter',
        'P-PROFESSIONAL-MONTHLY': 'professional',
        'P-ELITE-MONTHLY': 'elite'
    };
    return planTiers[planId] || null;
}

// ==========================================
// Export for different platforms
// ==========================================

/**
 * Firebase Functions export
 */
if (typeof exports !== 'undefined') {
    exports.paypalWebhook = async (req, res) => {
        if (req.method !== 'POST') {
            return res.status(405).send('Method Not Allowed');
        }

        try {
            const event = req.body;
            const headers = req.headers;
            
            // Verify webhook signature
            const isValid = verifyWebhookSignature(event, headers, process.env.PAYPAL_WEBHOOK_ID);
            if (!isValid) {
                return res.status(401).send('Invalid signature');
            }
            
            // Process event
            const result = await processWebhookEvent(event);
            
            return res.status(200).json(result);
        } catch (error) {
            console.error('Webhook error:', error);
            return res.status(500).json({ error: error.message });
        }
    };
}

/**
 * Netlify Functions export
 */
if (typeof exports !== 'undefined' && typeof exports.handler === 'undefined') {
    exports.handler = async (event, context) => {
        if (event.httpMethod !== 'POST') {
            return { statusCode: 405, body: 'Method Not Allowed' };
        }

        try {
            const payload = JSON.parse(event.body);
            const headers = event.headers;
            
            // Verify webhook signature
            const isValid = verifyWebhookSignature(payload, headers, process.env.PAYPAL_WEBHOOK_ID);
            if (!isValid) {
                return { statusCode: 401, body: 'Invalid signature' };
            }
            
            // Process event
            const result = await processWebhookEvent(payload);
            
            return {
                statusCode: 200,
                body: JSON.stringify(result)
            };
        } catch (error) {
            console.error('Webhook error:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: error.message })
            };
        }
    };
}

/**
 * Express.js middleware export
 */
if (typeof exports !== 'undefined' && typeof exports.expressWebhook === 'undefined') {
    exports.expressWebhook = async (req, res) => {
        try {
            const event = req.body;
            const headers = req.headers;
            
            // Verify webhook signature
            const isValid = verifyWebhookSignature(event, headers, process.env.PAYPAL_WEBHOOK_ID);
            if (!isValid) {
                return res.status(401).json({ error: 'Invalid signature' });
            }
            
            // Process event
            const result = await processWebhookEvent(event);
            
            return res.status(200).json(result);
        } catch (error) {
            console.error('Webhook error:', error);
            return res.status(500).json({ error: error.message });
        }
    };
}

/**
 * Process PayPal webhook event
 */
async function processWebhookEvent(event) {
    console.log('Processing webhook event:', event.event_type);
    
    const eventType = event.event_type;
    const resource = event.resource;
    
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
            console.log('Unhandled event type:', eventType);
            return { status: 'unhandled' };
    }
}

/**
 * Handle payment completed event
 */
async function handlePaymentCompleted(resource) {
    const amount = parseFloat(resource.amount.value);
    const currency = resource.amount.currency_code;
    const transactionId = resource.id;
    const customId = resource.custom_id; // User email or session ID
    
    console.log(`Payment completed: $${amount} ${currency} from ${customId}`);
    
    // Determine tier based on amount for Actor Agents
    let tier = null;
    if (amount >= 1000) tier = 'studio';
    else if (amount >= 200) tier = 'director';
    else if (amount >= 50) tier = 'creator';
    else if (amount >= 10) tier = 'supporter';
    
    // Also check for government grants tiers
    let grantsTier = null;
    if (amount >= 1500) grantsTier = 'enterprise';
    else if (amount >= 500) grantsTier = 'professional';
    else if (amount >= 200) grantsTier = 'standard';
    else if (amount >= 50) grantsTier = 'basic';
    
    if (tier || grantsTier) {
        // Store in database (Firestore, MongoDB, etc.)
        await storePayment({
            transactionId: transactionId,
            userEmail: customId,
            amount: amount,
            currency: currency,
            tier: tier,
            grantsTier: grantsTier,
            timestamp: new Date().toISOString(),
            status: 'completed',
            source: 'actor-agents'
        });
        
        // Grant access for Actor Agents
        if (tier) {
            await grantActorAgentsAccess(customId, tier, amount, transactionId);
        }
        
        // Grant access for Government Grants
        if (grantsTier) {
            await grantAccess(customId, grantsTier, amount);
        }
        
        // Send confirmation email
        await sendConfirmationEmail(customId, tier || grantsTier, amount);
        
        // Notify hub
        await notifyHub({
            type: 'donation_received',
            userEmail: customId,
            amount: amount,
            tier: tier,
            grantsTier: grantsTier,
            transactionId: transactionId,
            source: 'actor-agents'
        });
    }
    
    return {
        status: 'processed',
        tier: tier,
        grantsTier: grantsTier,
        amount: amount
    };
}

/**
 * Handle subscription created event
 */
async function handleSubscriptionCreated(resource) {
    const subscriptionId = resource.id;
    const planId = resource.plan_id;
    const subscriberEmail = resource.subscriber?.email_address;
    const customId = resource.custom_id;
    
    console.log(`Subscription created: ${subscriptionId} for ${subscriberEmail || customId}`);
    
    // Store subscription
    await storeSubscription({
        subscriptionId: subscriptionId,
        planId: planId,
        userEmail: subscriberEmail || customId,
        status: resource.status,
        createdAt: new Date().toISOString()
    });
    
    // Grant access
    const tier = getTierFromPlanId(planId);
    if (tier) {
        await grantAccess(subscriberEmail || customId, tier, 0);
    }
    
    return {
        status: 'processed',
        subscriptionId: subscriptionId
    };
}

/**
 * Handle subscription cancelled event
 */
async function handleSubscriptionCancelled(resource) {
    const subscriptionId = resource.id;
    
    console.log(`Subscription cancelled: ${subscriptionId}`);
    
    // Update subscription status
    await updateSubscription(subscriptionId, {
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
    });
    
    // Optionally revoke access or notify user
    
    return {
        status: 'processed',
        subscriptionId: subscriptionId
    };
}

/**
 * Handle subscription updated event
 */
async function handleSubscriptionUpdated(resource) {
    const subscriptionId = resource.id;
    
    console.log(`Subscription updated: ${subscriptionId}`);
    
    // Update subscription status
    await updateSubscription(subscriptionId, {
        status: resource.status,
        updatedAt: new Date().toISOString()
    });
    
    return {
        status: 'processed',
        subscriptionId: subscriptionId
    };
}

/**
 * Store payment in database
 */
async function storePayment(paymentData) {
    // Implement database storage
    // Example with Firestore:
    // const db = admin.firestore();
    // await db.collection('payments').add(paymentData);
    
    console.log('Payment stored:', paymentData);
}

/**
 * Store subscription in database
 */
async function storeSubscription(subscriptionData) {
    // Implement database storage
    console.log('Subscription stored:', subscriptionData);
}

/**
 * Update subscription in database
 */
async function updateSubscription(subscriptionId, updates) {
    // Implement database update
    console.log('Subscription updated:', subscriptionId, updates);
}

/**
 * Grant Actor Agents access to user
 */
async function grantActorAgentsAccess(userIdentifier, tier, amount, transactionId) {
    // Store access grant in database
    const accessData = {
        userIdentifier: userIdentifier, // Could be email or session ID
        tier: tier,
        amount: amount,
        transactionId: transactionId,
        grantedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        source: 'actor-agents'
    };
    
    // Implement database storage
    console.log('Actor Agents access granted:', accessData);
    
    // If this is a session ID, update the session conversation
    if (userIdentifier.match(/^[0-9a-f]{32}$/i)) {
        // This looks like a session ID, update via API
        try {
            await fetch('/api/update-user-tier', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: userIdentifier,
                    tier: tier,
                    transactionId: transactionId
                })
            });
        } catch (error) {
            console.error('Failed to update session tier:', error);
        }
    }
    
    return accessData;
}

/**
 * Grant access to user
 */
async function grantAccess(userEmail, tier, amount) {
    // Store access grant in database
    const accessData = {
        userEmail: userEmail,
        tier: tier,
        amount: amount,
        grantedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
    };
    
    // Implement database storage
    console.log('Access granted:', accessData);
    
    return accessData;
}

/**
 * Send confirmation email
 */
async function sendConfirmationEmail(userEmail, tier, amount) {
    // Implement email sending (SendGrid, AWS SES, etc.)
    console.log(`Sending confirmation email to ${userEmail} for ${tier} tier ($${amount})`);
    
    // Determine which system the tier is for
    const isActorAgents = ['supporter', 'creator', 'director', 'studio'].includes(tier);
    const isGrants = ['basic', 'standard', 'professional', 'enterprise'].includes(tier);
    
    let emailContent = '';
    
    if (isActorAgents) {
        emailContent = `
        Dear Valued Supporter,
        
        Thank you for your donation of $${amount} to barbrickdesign@gmail.com!
        
        Your ${tier.charAt(0).toUpperCase() + tier.slice(1)} tier access has been activated for Actor Agents.
        
        You can now access:
        ${tier === 'supporter' ? '- 5 archetype personas\n        - Limited monthly video replies\n        - Basic chat-only analytics' : ''}
        ${tier === 'creator' ? '- 20 archetype personas\n        - Upload your own custom persona\n        - Basic performance analytics' : ''}
        ${tier === 'director' ? '- Unlimited archetypes\n        - Persona builder & A/B testing\n        - Social clip export' : ''}
        ${tier === 'studio' ? '- Licensed actor personas\n        - Multi-agent orchestration\n        - Priority rendering & enterprise analytics' : ''}
        
        Access your account at: https://barbrickdesign.github.io/actorAgents.html
        
        Best regards,
        Barbrick Design Team
    `;
    } else if (isGrants) {
        emailContent = `
        Dear Contributor,
        
        Thank you for your donation of $${amount}!
        
        Your ${tier.charAt(0).toUpperCase() + tier.slice(1)} tier access has been activated.
        
        You can now access:
        - Full grants database
        - AI-powered grant matching
        - Application assistance tools
        ${tier !== 'basic' ? '- Document generation' : ''}
        ${tier === 'professional' || tier === 'enterprise' ? '- Priority support' : ''}
        ${tier === 'enterprise' ? '- Dedicated account manager' : ''}
        
        Login at: https://barbrickdesign.github.io/government-grants-portal.html
        
        Best regards,
        Barbrick Design Team
    `;
    }
    
    // Send email
}

/**
 * Notify hub of updates
 */
async function notifyHub(data) {
    // Implement real-time notification
    // Example with Firebase Realtime Database:
    // const db = admin.database();
    // await db.ref('hub_updates').push(data);
    
    console.log('Hub notified:', data);
}

/**
 * Get tier from plan ID
 */
function getTierFromPlanId(planId) {
    const planTiers = {
        'plan_basic': 'basic',
        'plan_standard': 'standard',
        'plan_professional': 'professional',
        'plan_enterprise': 'enterprise'
    };
    return planTiers[planId] || null;
}

// ==========================================
// Export for different platforms
// ==========================================

/**
 * Firebase Functions export
 */
if (typeof exports !== 'undefined') {
    exports.paypalWebhook = async (req, res) => {
        if (req.method !== 'POST') {
            return res.status(405).send('Method Not Allowed');
        }

        try {
            const event = req.body;
            const headers = req.headers;
            
            // Verify webhook signature
            const isValid = verifyWebhookSignature(event, headers, process.env.PAYPAL_WEBHOOK_ID);
            if (!isValid) {
                return res.status(401).send('Invalid signature');
            }
            
            // Process event
            const result = await processWebhookEvent(event);
            
            return res.status(200).json(result);
        } catch (error) {
            console.error('Webhook error:', error);
            return res.status(500).json({ error: error.message });
        }
    };
}

/**
 * Netlify Functions export
 */
if (typeof exports !== 'undefined' && typeof exports.handler === 'undefined') {
    exports.handler = async (event, context) => {
        if (event.httpMethod !== 'POST') {
            return { statusCode: 405, body: 'Method Not Allowed' };
        }

        try {
            const payload = JSON.parse(event.body);
            const headers = event.headers;
            
            // Verify webhook signature
            const isValid = verifyWebhookSignature(payload, headers, process.env.PAYPAL_WEBHOOK_ID);
            if (!isValid) {
                return { statusCode: 401, body: 'Invalid signature' };
            }
            
            // Process event
            const result = await processWebhookEvent(payload);
            
            return {
                statusCode: 200,
                body: JSON.stringify(result)
            };
        } catch (error) {
            console.error('Webhook error:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: error.message })
            };
        }
    };
}

/**
 * Express.js middleware export
 */
if (typeof exports !== 'undefined' && typeof exports.expressWebhook === 'undefined') {
    exports.expressWebhook = async (req, res) => {
        try {
            const event = req.body;
            const headers = req.headers;
            
            // Verify webhook signature
            const isValid = verifyWebhookSignature(event, headers, process.env.PAYPAL_WEBHOOK_ID);
            if (!isValid) {
                return res.status(401).json({ error: 'Invalid signature' });
            }
            
            // Process event
            const result = await processWebhookEvent(event);
            
            return res.status(200).json(result);
        } catch (error) {
            console.error('Webhook error:', error);
            return res.status(500).json({ error: error.message });
        }
    };
}
