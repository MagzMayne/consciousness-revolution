// Stripe Webhook Handler V2
// Captures payment confirmation, triggers welcome email, and records contributions
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Supabase if configured
function getSupabase() {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
        return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    }
    return null;
}

// Update ARAYA subscription status in user profile
async function updateArayaSubscriptionStatus(email, status, subscriptionId = null, customerId = null) {
    const supabase = getSupabase();
    if (!supabase || !email) {
        console.log('Cannot update ARAYA status - missing Supabase or email');
        return null;
    }

    try {
        // First check if profile exists
        const { data: existingProfile } = await supabase
            .from('araya_profiles')
            .select('id, email')
            .eq('email', email.toLowerCase())
            .single();

        const updateData = {
            subscription_status: status,
            subscription_updated_at: new Date().toISOString()
        };

        if (subscriptionId) {
            updateData.stripe_subscription_id = subscriptionId;
        }
        if (customerId) {
            updateData.stripe_customer_id = customerId;
        }

        if (existingProfile) {
            // Update existing profile
            const { data, error } = await supabase
                .from('araya_profiles')
                .update(updateData)
                .eq('email', email.toLowerCase())
                .select();

            if (error) throw error;
            console.log('Updated ARAYA profile subscription status:', email, status);
            return data;
        } else {
            // Create new profile with subscription
            const { data, error } = await supabase
                .from('araya_profiles')
                .insert({
                    email: email.toLowerCase(),
                    ...updateData,
                    created_at: new Date().toISOString()
                })
                .select();

            if (error) throw error;
            console.log('Created ARAYA profile with subscription:', email, status);
            return data;
        }
    } catch (error) {
        console.error('Failed to update ARAYA subscription status:', error);
        return null;
    }
}

// ARAYA product ID for subscription matching
const ARAYA_PRODUCT_ID = 'prod_TjA91iP5kaKFrV';

// Check if subscription contains ARAYA product
function subscriptionContainsAraya(subscription) {
    if (!subscription.items?.data) return false;
    return subscription.items.data.some(item =>
        item.price?.product === ARAYA_PRODUCT_ID ||
        item.plan?.product === ARAYA_PRODUCT_ID
    );
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
