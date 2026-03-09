// Stripe Webhook Handler V2
// Captures payment confirmation, triggers welcome email, and records contributions
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Supabase if configured (using same fallback pattern as other functions)
function getSupabase() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_SECRET ||
                process.env.SUPABASE_SERVICE_KEY ||
                process.env.SUPABASE_ANON_KEY;

    if (url && key) {
        return createClient(url, key);
    }
    console.warn('[WEBHOOK] Supabase not configured - missing URL or key');
    return null;
}

// Update ARAYA subscription status in araya_memory table (type='profile')
// Note: Using araya_memory since araya_profiles table doesn't exist
async function updateArayaSubscriptionStatus(email, status, subscriptionId = null, customerId = null) {
    const supabase = getSupabase();
    if (!supabase || !email) {
        console.log('[WEBHOOK] Cannot update ARAYA status - missing Supabase or email');
        return null;
    }

    const userId = email.toLowerCase();
    const profileContent = {
        subscription_status: status,
        subscription_updated_at: new Date().toISOString()
    };

    if (subscriptionId) {
        profileContent.stripe_subscription_id = subscriptionId;
    }
    if (customerId) {
        profileContent.stripe_customer_id = customerId;
    }

    try {
        // Check if profile record exists in araya_memory
        const { data: existingProfile } = await supabase
            .from('araya_memory')
            .select('id, content')
            .eq('user_id', userId)
            .eq('type', 'profile')
            .single();

        if (existingProfile) {
            // Merge with existing profile content
            const existingContent = typeof existingProfile.content === 'string'
                ? JSON.parse(existingProfile.content)
                : existingProfile.content || {};

            const mergedContent = { ...existingContent, ...profileContent };

            const { data, error } = await supabase
                .from('araya_memory')
                .update({
                    content: JSON.stringify(mergedContent),
                    metadata: { updated_at: new Date().toISOString(), source: 'stripe_webhook' }
                })
                .eq('id', existingProfile.id)
                .select();

            if (error) throw error;
            console.log('[WEBHOOK] Updated subscription in araya_memory:', userId, status);
            return data;
        } else {
            // Create new profile record
            const { data, error } = await supabase
                .from('araya_memory')
                .insert({
                    user_id: userId,
                    type: 'profile',
                    content: JSON.stringify(profileContent),
                    metadata: { created_at: new Date().toISOString(), source: 'stripe_webhook' }
                })
                .select();

            if (error) throw error;
            console.log('[WEBHOOK] Created subscription profile in araya_memory:', userId, status);
            return data;
        }
    } catch (error) {
        console.error('[WEBHOOK] Failed to update ARAYA subscription status:', error);
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════
// CREDIT ALLOCATION - Add credits based on purchase
// ═══════════════════════════════════════════════════════════════
const PRICE_CREDITS = {
    // Founding Member $47/mo - 500 credits/month
    'price_1Si4sWIBd71iNToyQiR5WRY5': { credits: 500, tier: 'founding' },
    // Pattern Tools Pro $99/mo - Unlimited (1000/month as buffer)
    'price_1Si4szIBd71iNToyZghCXYaE': { credits: 1000, tier: 'pro' },
    // Emergency Consulting $500 - 100 credits (one-time)
    'price_1Si4tKIBd71iNToyUtO6McaO': { credits: 100, tier: 'emergency' },
    // Beta Access $9/mo - 100 credits
    'price_beta_9': { credits: 100, tier: 'beta' },
    // Araya Beta Access $20 one-time - 50 credits
    'price_araya_beta_20': { credits: 50, tier: 'beta' }
};

async function allocateCredits(userId, priceId, sessionId) {
    const allocation = PRICE_CREDITS[priceId];
    if (!allocation || !userId) {
        console.log(`[CREDITS] No allocation for price ${priceId} or no userId`);
        return null;
    }

    try {
        const response = await fetch(
            `${process.env.URL || 'https://conciousnessrevolution.io'}/.netlify/functions/araya-credits`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'add_credits',
                    userId: userId,
                    amount: allocation.credits,
                    metadata: {
                        stripe_session_id: sessionId,
                        price_id: priceId,
                        tier: allocation.tier,
                        source: 'stripe_webhook'
                    }
                })
            }
        );
        const result = await response.json();
        console.log(`[CREDITS] Allocated ${allocation.credits} credits to ${userId}:`, result);
        return result;
    } catch (error) {
        console.error('[CREDITS] Failed to allocate credits:', error);
        return null;
    }
}


// Check if subscription is valid for ARAYA access
// Simplified: Any active subscription grants ARAYA access
function subscriptionContainsAraya(subscription) {
    // For now, treat ALL subscriptions as ARAYA subscriptions
    // This simplifies the system - any paying subscriber gets access
    return subscription && subscription.status;
}

// Get customer email from Stripe customer ID
async function getCustomerEmail(customerId) {
    if (!customerId) return null;
    try {
        const customer = await stripe.customers.retrieve(customerId);
        return customer.email;
    } catch (error) {
        console.error('Failed to retrieve customer:', error);
        return null;
    }
}

// Record contribution to network (non-blocking)
async function recordContribution(foundationId, type, metadata = {}) {
    if (!foundationId) return null;

    try {
        const response = await fetch(
            `${process.env.URL || 'https://conciousnessrevolution.io'}/.netlify/functions/update-contribution`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    foundation_id: foundationId,
                    contribution_type: type,
                    metadata
                })
            }
        );
        return await response.json();
    } catch (error) {
        console.error('Failed to record contribution:', error);
        return null;
    }
}

export async function handler(event, context) {
    // Only accept POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    const sig = event.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let stripeEvent;

    try {
        // Verify webhook signature
        stripeEvent = stripe.webhooks.constructEvent(
            event.body,
            sig,
            webhookSecret
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: `Webhook Error: ${err.message}` })
        };
    }

    // Handle the event
    switch (stripeEvent.type) {
        case 'checkout.session.completed': {
            const session = stripeEvent.data.object;
            const metadata = session.metadata || {};

            console.log('Payment successful for session:', session.id);
            console.log('Customer email:', session.customer_details?.email);
            console.log('Amount total:', session.amount_total);

            // Extract customer info
            const customerEmail = session.customer_details?.email;
            const customerName = session.customer_details?.name || 'Consciousness Revolutionary';
            const amountPaid = session.amount_total ? (session.amount_total / 100).toFixed(2) : '0.00';
            const currency = session.currency?.toUpperCase() || 'USD';

            // ═══════════════════════════════════════════════════════════════
            // SUBSCRIPTION STATUS - Mark user as active subscriber
            // ═══════════════════════════════════════════════════════════════
            // This is the KEY fix: checkout.session.completed should mark user as subscribed
            if (customerEmail) {
                const subscriptionId = session.subscription || null;
                const customerId = session.customer || null;

                console.log('[WEBHOOK] Updating subscription status for:', customerEmail);
                await updateArayaSubscriptionStatus(
                    customerEmail,
                    'active',
                    subscriptionId,
                    customerId
                );
                console.log('[WEBHOOK] Subscription status updated to active for:', customerEmail);
            }

            // ═══════════════════════════════════════════════════════════════
            // CREDIT ALLOCATION - Add credits for the purchase (optional)
            // ═══════════════════════════════════════════════════════════════
            try {
                // Retrieve session with line_items to get price ID
                const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
                    expand: ['line_items']
                });
                const priceId = fullSession.line_items?.data[0]?.price?.id;

                if (priceId && customerEmail) {
                    // Use email as userId for credit allocation
                    const creditsResult = await allocateCredits(customerEmail, priceId, session.id);
                    console.log('[CREDITS] Allocation result:', creditsResult);
                } else {
                    console.log('[CREDITS] No matching price ID or email - skipping credit allocation');
                }
            } catch (creditsError) {
                console.error('[CREDITS] Failed to allocate credits:', creditsError);
                // Don't fail webhook - subscription status is already updated
            }


            // Record marketplace sale contribution if this is a marketplace purchase
            if (metadata.seller_foundation_id) {
                console.log('Recording marketplace sale contribution for seller:', metadata.seller_foundation_id);
                const contributionResult = await recordContribution(
                    metadata.seller_foundation_id,
                    'marketplace_sale',
                    {
                        creation_id: metadata.creation_id,
                        amount_cents: session.amount_total,
                        buyer_email: customerEmail
                    }
                );
                console.log('Contribution recorded:', contributionResult);

                // Handle downstream revenue - credit original creators
                if (metadata.has_upstream === 'true') {
                    await processDownstreamContributions(metadata.creation_id, session.amount_total);
                }
            }

            if (customerEmail) {
                // Trigger welcome email via our email function
                try {
                    const emailResponse = await fetch(
                        `${process.env.URL || 'https://conciousnessrevolution.io'}/.netlify/functions/send-welcome-email`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                email: customerEmail,
                                name: customerName,
                                amount: amountPaid,
                                currency: currency,
                                sessionId: session.id,
                                productName: metadata.product_name || 'Consciousness Revolution Membership'
                            })
                        }
                    );

                    const emailResult = await emailResponse.json();
                    console.log('Email send result:', emailResult);
                } catch (emailError) {
                    console.error('Failed to send welcome email:', emailError);
                    // Don't fail the webhook - log and continue
                }
            }

            break;
        }

        case 'customer.subscription.created': {
            const subscription = stripeEvent.data.object;
            console.log('Subscription created:', subscription.id);

            // Check if this is an ARAYA subscription
            if (subscriptionContainsAraya(subscription)) {
                const email = await getCustomerEmail(subscription.customer);
                if (email) {
                    await updateArayaSubscriptionStatus(
                        email,
                        subscription.status, // 'active', 'trialing', etc.
                        subscription.id,
                        subscription.customer
                    );
                    console.log('ARAYA subscription activated for:', email);
                }
            }
            break;
        }

        case 'customer.subscription.updated': {
            const subscription = stripeEvent.data.object;
            console.log('Subscription updated:', subscription.id, 'Status:', subscription.status);

            // Sync ARAYA subscription status changes
            if (subscriptionContainsAraya(subscription)) {
                const email = await getCustomerEmail(subscription.customer);
                if (email) {
                    await updateArayaSubscriptionStatus(
                        email,
                        subscription.status, // 'active', 'past_due', 'canceled', etc.
                        subscription.id,
                        subscription.customer
                    );
                    console.log('ARAYA subscription status synced:', email, subscription.status);
                }
            }
            break;
        }

        case 'customer.subscription.deleted': {
            const subscription = stripeEvent.data.object;
            console.log('Subscription cancelled:', subscription.id);

            // Mark ARAYA subscription as canceled
            if (subscriptionContainsAraya(subscription)) {
                const email = await getCustomerEmail(subscription.customer);
                if (email) {
                    await updateArayaSubscriptionStatus(
                        email,
                        'canceled',
                        subscription.id,
                        subscription.customer
                    );
                    console.log('ARAYA subscription canceled for:', email);
                }
            }
            break;
        }

        case 'invoice.paid': {
            const invoice = stripeEvent.data.object;
            console.log('Invoice paid:', invoice.id);
            break;
        }

        case 'invoice.payment_failed': {
            const invoice = stripeEvent.data.object;
            console.log('Invoice payment failed:', invoice.id);
            break;
        }

        default:
            console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    // Return success response to Stripe
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ received: true })
    };
}

// Process downstream contributions for original creators
async function processDownstreamContributions(creationId, grossAmountCents) {
    const supabase = getSupabase();
    if (!supabase || !creationId) return;

    try {
        // Get all parent creations (lineage)
        const { data: lineage } = await supabase
            .from('creation_lineage')
            .select(`
                parent_creation_id,
                parent_foundation_id,
                builder_creations!parent_creation_id(downstream_share_pct)
            `)
            .eq('child_creation_id', creationId);

        for (const parent of lineage || []) {
            if (!parent.parent_foundation_id) continue;

            console.log('Recording downstream contribution for:', parent.parent_foundation_id);

            // Record downstream derivative contribution
            await recordContribution(
                parent.parent_foundation_id,
                'downstream_derivative',
                {
                    derived_creation_id: creationId,
                    original_creation_id: parent.parent_creation_id,
                    gross_amount_cents: grossAmountCents
                }
            );
        }
    } catch (error) {
        console.error('Failed to process downstream contributions:', error);
    }
}
