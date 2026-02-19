// Stripe Checkout Session Creator
// Netlify Serverless Function
// Updated: 2026-02-18 - Security hardening (CORS)
import Stripe from 'stripe';
import {
    getSecureCORSHeaders,
    handlePreflight,
    errorResponse,
    successResponse
} from './utils/security.mjs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function handler(event, context) {
    const origin = event.headers.origin || event.headers.Origin || '';

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return handlePreflight(origin);
    }

    if (event.httpMethod !== 'POST') {
        return errorResponse('Method not allowed', origin, 405);
    }

    try {
        const { price_id, success_url, cancel_url } = JSON.parse(event.body);

        if (!price_id) {
            return errorResponse('Missing price_id', origin, 400);
        }

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: price_id,
                    quantity: 1
                }
            ],
            success_url: success_url || 'https://conciousnessrevolution.io/success.html?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: cancel_url || 'https://conciousnessrevolution.io/pricing-live.html'
        });

        return successResponse({ sessionId: session.id, url: session.url }, origin);

    } catch (error) {
        console.error('Stripe error:', error);
        return errorResponse(error.message || 'Failed to create checkout session', origin, 500);
    }
}
