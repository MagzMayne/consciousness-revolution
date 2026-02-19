/**
 * MARKETPLACE CHECKOUT
 * Creates checkout session with automatic revenue split
 * Updated: 2026-02-18 - Security hardening (CORS)
 *
 * POST /api/marketplace-checkout
 * Body: { creation_id, buyer_foundation_id }
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import {
    getSecureCORSHeaders,
    handlePreflight
} from './utils/security.mjs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handler = async (event, context) => {
    const origin = event.headers.origin || event.headers.Origin || '';
    const headers = getSecureCORSHeaders(origin);

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return handlePreflight(origin);
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );

        const { creation_id, buyer_foundation_id, buyer_email } = JSON.parse(event.body);

        if (!creation_id) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'creation_id required' })
            };
        }

        // Get creation details with builder's Connect account
        const { data: creation, error: creationError } = await supabase
            .from('builder_creations')
            .select(`
                *,
                builder_balances:foundation_id(stripe_connect_id, stripe_connect_status)
            `)
            .eq('id', creation_id)
            .eq('visibility', 'marketplace')
            .eq('status', 'published')
            .single();

        if (creationError || !creation) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Creation not found or not available' })
            };
        }

        // Check if builder has active Connect account
        const connectId = creation.builder_balances?.stripe_connect_id;
        const connectStatus = creation.builder_balances?.stripe_connect_status;

        if (!connectId || connectStatus !== 'active') {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Builder has not completed payout setup',
                    details: 'This creation cannot be purchased until the builder sets up their payout account'
                })
            };
        }

        // Calculate revenue split
        const totalCents = creation.base_price_cents;
        const builderSharePct = creation.revenue_share_pct || 80;
        const builderCents = Math.floor(totalCents * builderSharePct / 100);
        const networkCents = totalCents - builderCents;

        // Ensure we have a Stripe price, or create one
        let priceId = creation.stripe_price_id;

        if (!priceId) {
            // Create product and price on the fly
            const product = await stripe.products.create({
                name: creation.name,
                description: creation.description || `Marketplace creation: ${creation.type}`,
                metadata: {
                    creation_id: creation_id,
                    foundation_id: creation.foundation_id
                }
            });

            const price = await stripe.prices.create({
                product: product.id,
                unit_amount: totalCents,
                currency: 'usd'
            });

            priceId = price.id;

            // Save back to Supabase
            await supabase
                .from('builder_creations')
                .update({
                    stripe_product_id: product.id,
                    stripe_price_id: price.id
                })
                .eq('id', creation_id);
        }

        // Create checkout session with destination charge
        const sessionConfig = {
            mode: 'payment',
            line_items: [{
                price: priceId,
                quantity: 1
            }],
            payment_intent_data: {
                application_fee_amount: networkCents,
                transfer_data: {
                    destination: connectId
                }
            },
            success_url: `${process.env.SITE_URL || 'https://consciousnessrevolution.io'}/marketplace/success?creation=${creation_id}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.SITE_URL || 'https://consciousnessrevolution.io'}/marketplace/${creation.slug || creation_id}`,
            metadata: {
                creation_id: creation_id,
                creation_name: creation.name,
                creation_type: creation.type,
                buyer_foundation_id: buyer_foundation_id || 'anonymous',
                seller_foundation_id: creation.foundation_id,
                builder_amount_cents: builderCents.toString(),
                network_amount_cents: networkCents.toString(),
                builder_share_pct: builderSharePct.toString()
            }
        };

        // Add customer email if provided
        if (buyer_email) {
            sessionConfig.customer_email = buyer_email;
        }

        const session = await stripe.checkout.sessions.create(sessionConfig);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                checkout_url: session.url,
                session_id: session.id,
                pricing: {
                    total_cents: totalCents,
                    builder_gets_cents: builderCents,
                    network_fee_cents: networkCents,
                    builder_share_pct: builderSharePct
                }
            })
        };

    } catch (error) {
        console.error('Marketplace Checkout Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to create checkout session',
                details: error.message
            })
        };
    }
};
