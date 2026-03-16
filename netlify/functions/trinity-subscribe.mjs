/**
 * TRINITY SUBSCRIPTION API
 * Creates Stripe subscription for Trinity AI Boardroom ($299/mo)
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Trinity pricing
const TRINITY_PRODUCT = {
  name: 'Trinity AI Boardroom',
  description: 'C1 × C2 × C3 = ∞ - Replace your boardroom with three AI perspectives',
  price: 29900, // $299/mo in cents
  features: [
    'Unlimited Trinity sessions',
    'C1 Mechanic + C2 Architect + C3 Oracle perspectives',
    'Monthly autonomous research reports',
    'Cyclotron Brain access (query 167K+ atoms)',
    'Export to JSON/MD/PDF',
    'Priority support'
  ]
};

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { email, success_url, cancel_url, user_id } = body;

    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email required' })
      };
    }

    // Get or create Stripe price ID
    const priceId = process.env.STRIPE_TRINITY_PRICE_ID;

    if (!priceId) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Trinity price not configured in Stripe',
          message: 'Admin: Create product in Stripe and set STRIPE_TRINITY_PRICE_ID'
        })
      };
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      metadata: {
        product: 'trinity',
        user_id: user_id || '',
        tier: 'trinity_pro'
      },
      subscription_data: {
        metadata: {
          product: 'trinity',
          user_id: user_id || '',
          tier: 'trinity_pro'
        }
      },
      success_url: success_url || `${process.env.URL}/TRINITY_CONSOLE.html?success=true`,
      cancel_url: cancel_url || `${process.env.URL}/LANDING_TRINITY.html`
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        checkout_url: session.url,
        session_id: session.id,
        product: TRINITY_PRODUCT
      })
    };

  } catch (error) {
    console.error('[TRINITY SUBSCRIBE ERROR]', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to create subscription',
        message: error.message
      })
    };
  }
};

export const config = {
  path: "/api/trinity-subscribe"
};
