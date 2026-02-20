// Create Checkout - Netlify Function
// Creates Stripe checkout session for course/product purchases
// Updated: 2026-02-18 - Security hardening (CORS, rate limiting)

import {
    getSecureCORSHeaders,
    handlePreflight,
    checkRateLimit,
    anonymizeIP,
    errorResponse,
    successResponse
} from './utils/security.mjs';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

export async function handler(event, context) {
    const origin = event.headers.origin || event.headers.Origin || '';

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return handlePreflight(origin);
    }

    if (event.httpMethod !== 'POST') {
        return errorResponse('Method not allowed', origin, 405);
    }

    // Rate limiting - 20 checkout attempts per hour per IP
    const clientIP = event.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    const rateLimitCheck = checkRateLimit(`checkout_${anonymizeIP(clientIP)}`, 20, 3600000);
    if (!rateLimitCheck.allowed) {
        return errorResponse('Too many requests. Please try again later.', origin, 429);
    }

    try {
        const { priceId, email, customerEmail, successUrl, cancelUrl } = JSON.parse(event.body);
        const finalEmail = customerEmail || email;

        if (!STRIPE_SECRET_KEY) {
            return errorResponse('Payment system not configured', origin, 503);
        }

        // Use default price if not provided
        const finalPriceId = priceId || process.env.STRIPE_PRICE_BUILDER_PRO || 'price_1She0KIBd71iNToy3S6IWn2I';

        // Create Stripe checkout session
        const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'mode': 'payment',
                'line_items[0][price]': finalPriceId,
                'line_items[0][quantity]': '1',
                'success_url': successUrl || 'https://conciousnessrevolution.io/success.html?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url': cancelUrl || 'https://conciousnessrevolution.io/',
                ...(finalEmail && { 'customer_email': finalEmail })
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Stripe error:', error);
            return errorResponse('Failed to create checkout session', origin, 500);
        }

        const session = await response.json();

        return successResponse({
            sessionId: session.id,
            url: session.url
        }, origin);

    } catch (error) {
        console.error('Checkout error:', error);
        return errorResponse('Failed to create checkout', origin, 500);
    }
}
