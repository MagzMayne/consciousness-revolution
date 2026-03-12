// Stripe Checkout Session Creator
// Creates Stripe checkout sessions for Forge Store products
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Product pricing (matches forge-store.html)
const PRODUCTS = {
  // Starter Packs - $47, +500 XP
  'reality-starter': {
    name: 'Reality Forge - Starter Pack',
    price: 4700, // cents
    xp: 500,
    description: 'Fast-track your Reality Forge journey with +500 XP boost'
  },
  'creation-starter': {
    name: 'Creation Forge - Starter Pack',
    price: 4700,
    xp: 500,
    description: 'Fast-track your Creation Forge journey with +500 XP boost'
  },
  'communications-starter': {
    name: 'Communications Forge - Starter Pack',
    price: 4700,
    xp: 500,
    description: 'Fast-track your Communications Forge journey with +500 XP boost'
  },
  'guardian-starter': {
    name: 'Guardian Forge - Starter Pack',
    price: 4700,
    xp: 500,
    description: 'Fast-track your Guardian Forge journey with +500 XP boost'
  },
  'wealth-starter': {
    name: 'Wealth Forge - Starter Pack',
    price: 4700,
    xp: 500,
    description: 'Fast-track your Wealth Forge journey with +500 XP boost'
  },
  'character-starter': {
    name: 'Character Forge - Starter Pack',
    price: 4700,
    xp: 500,
    description: 'Fast-track your Character Forge journey with +500 XP boost'
  },
  'infinity-starter': {
    name: 'Infinity Forge - Starter Pack',
    price: 4700,
    xp: 500,
    description: 'Fast-track your Infinity Forge journey with +500 XP boost'
  },

  // Mastery Courses - $197, +2,500 XP
  'reality-mastery': {
    name: 'Reality Forge - Mastery Course',
    price: 19700,
    xp: 2500,
    description: 'Complete Reality Forge mastery program with +2,500 XP boost'
  },
  'creation-mastery': {
    name: 'Creation Forge - Mastery Course',
    price: 19700,
    xp: 2500,
    description: 'Complete Creation Forge mastery program with +2,500 XP boost'
  },
  'communications-mastery': {
    name: 'Communications Forge - Mastery Course',
    price: 19700,
    xp: 2500,
    description: 'Complete Communications Forge mastery program with +2,500 XP boost'
  },
  'guardian-mastery': {
    name: 'Guardian Forge - Mastery Course',
    price: 19700,
    xp: 2500,
    description: 'Complete Guardian Forge mastery program with +2,500 XP boost'
  },
  'wealth-mastery': {
    name: 'Wealth Forge - Mastery Course',
    price: 19700,
    xp: 2500,
    description: 'Complete Wealth Forge mastery program with +2,500 XP boost'
  },
  'character-mastery': {
    name: 'Character Forge - Mastery Course',
    price: 19700,
    xp: 2500,
    description: 'Complete Character Forge mastery program with +2,500 XP boost'
  },
  'infinity-mastery': {
    name: 'Infinity Forge - Mastery Course',
    price: 19700,
    xp: 2500,
    description: 'Complete Infinity Forge mastery program with +2,500 XP boost'
  },

  // Master Bundle - $997, +20,000 XP
  'master-bundle': {
    name: '7 Forges Master Bundle',
    price: 99700,
    xp: 20000,
    description: 'Unlock all 7 Forge mastery courses with +20,000 XP distributed across all Forges'
  }
};

export const handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body);
    const { product_id, email, success_url, cancel_url } = body;

    // Validate required fields
    if (!product_id || !email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing product_id or email' })
      };
    }

    // Get product info
    const product = PRODUCTS[product_id];
    if (!product) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid product_id: ' + product_id })
      };
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.description,
              metadata: {
                product_id: product_id,
                xp_award: product.xp.toString()
              }
            },
            unit_amount: product.price
          },
          quantity: 1
        }
      ],
      metadata: {
        product_id: product_id,
        xp_award: product.xp.toString(),
        user_email: email
      },
      success_url: success_url || `${process.env.URL}/forge-store.html?success=true&xp=${product.xp}`,
      cancel_url: cancel_url || `${process.env.URL}/forge-store.html`
    });

    // Return checkout URL
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        checkout_url: session.url,
        session_id: session.id
      })
    };

  } catch (error) {
    console.error('[STRIPE CHECKOUT ERROR]', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to create checkout session',
        message: error.message
      })
    };
  }
};
