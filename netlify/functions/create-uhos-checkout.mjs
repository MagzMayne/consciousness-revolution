// UHOS Tier Checkout - One-time payment mode
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const VALID_TIERS = ['seedling', 'sapling', 'tree', 'forest'];

export async function handler(event, context) {
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

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { price_id, tier, success_url, cancel_url } = JSON.parse(event.body);

        if (!price_id || !tier) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Missing price_id or tier' }) };
        }

        if (VALID_TIERS.indexOf(tier) === -1) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Invalid tier' }) };
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [{ price: price_id, quantity: 1 }],
            metadata: { tier: tier, product: 'uhos' },
            success_url: success_url || `https://conciousnessrevolution.io/ULTIMATE_HUMAN_OS/uhos-success.html?session_id={CHECKOUT_SESSION_ID}&tier=${tier}`,
            cancel_url: cancel_url || 'https://conciousnessrevolution.io/ULTIMATE_HUMAN_OS/pricing.html'
        });

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: session.id, url: session.url })
        };

    } catch (error) {
        console.error('UHOS checkout error:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: error.message || 'Failed to create checkout session' })
        };
    }
}
