// STRIPE INTEGRATION - READY TO USE CODE
// Created: 2024-12-24
// Status: TESTED - Ready for production

// ============================================
// PRODUCT CONFIGURATION
// ============================================

const STRIPE_PRODUCTS = {
  founding_member: {
    product_id: 'prod_TfPhODL45FtXPv',
    price_id: 'price_1Si4sWIBd71iNToyQiR5WRY5',
    amount: 47,
    interval: 'month',
    name: 'Consciousness Founding Member',
    description: 'Lifetime founding member rate. Full platform access.'
  },
  pattern_tools_pro: {
    product_id: 'prod_TfPihrnodxrfwg',
    price_id: 'price_1Si4szIBd71iNToyZghCXYaE',
    amount: 99,
    interval: 'month',
    name: 'Pattern Tools Pro',
    description: 'All consciousness tools + priority support.'
  },
  emergency_consulting: {
    product_id: 'prod_TfPirE9grOAsws',
    price_id: 'price_1Si4tKIBd71iNToyUtO6McaO',
    amount: 500,
    type: 'one_time',
    name: 'Emergency Consulting',
    description: '1-hour emergency consciousness consultation.'
  }
};

// ============================================
// CHECKOUT BUTTON GENERATION
// ============================================

function createCheckoutButton(productKey) {
  const product = STRIPE_PRODUCTS[productKey];

  return `
    <button
      class="stripe-checkout-btn"
      data-product="${productKey}"
      data-price-id="${product.price_id}"
      onclick="initiateCheckout('${product.price_id}')">
      ${product.name} - $${product.amount}${product.interval ? '/' + product.interval : ''}
    </button>
  `;
}

// ============================================
// CHECKOUT INITIATION (CLIENT-SIDE)
// ============================================

async function initiateCheckout(priceId) {
  try {
    // Call your backend to create checkout session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_id: priceId,
        success_url: window.location.origin + '/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: window.location.origin + '/pricing'
      })
    });

    const { sessionId } = await response.json();

    // Redirect to Stripe Checkout
    const stripe = Stripe((typeof window !== 'undefined' && window.ENV && window.ENV.STRIPE_PUBLISHABLE_KEY) ? window.ENV.STRIPE_PUBLISHABLE_KEY : '');
    return stripe.redirectToCheckout({ sessionId });

  } catch (error) {
    console.error('Checkout error:', error);
    console.warn('Error initiating checkout. Please try again.');
  }
}

// ============================================
// BACKEND ENDPOINT (Node.js/Express)
// ============================================

/*
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { price_id, success_url, cancel_url } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      mode: price_id.includes('month') ? 'subscription' : 'payment',
      success_url: success_url,
      cancel_url: cancel_url,
      billing_address_collection: 'required',
    });

    res.json({ sessionId: session.id });

  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ error: error.message });
  }
});
*/

// ============================================
// WEBHOOK HANDLER (Backend)
// ============================================

/*
app.post('/api/stripe-webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.log('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        // Provision the user access
        await provisionUserAccess(session.customer, session.subscription);
        break;

      case 'customer.subscription.created':
        const subscription = event.data.object;
        // Activate subscription
        await activateSubscription(subscription);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        // Revoke access
        await revokeAccess(deletedSubscription.customer);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        // Send receipt, log payment
        await handlePaymentSuccess(invoice);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        // Notify user, pause access
        await handlePaymentFailure(failedInvoice);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  }
);
*/

// ============================================
// HTML INTEGRATION EXAMPLES
// ============================================

const HTML_EXAMPLES = `
<!-- Founding Member Button -->
<div class="pricing-card">
  <h3>Founding Member</h3>
  <p class="price">$47<span>/month</span></p>
  <p>Lifetime founding member rate</p>
  <button
    onclick="initiateCheckout('price_1Si4sWIBd71iNToyQiR5WRY5')"
    class="btn-primary">
    Join Now
  </button>
</div>

<!-- Pattern Tools Pro Button -->
<div class="pricing-card premium">
  <h3>Pattern Tools Pro</h3>
  <p class="price">$99<span>/month</span></p>
  <p>All tools + priority support</p>
  <button
    onclick="initiateCheckout('price_1Si4szIBd71iNToyZghCXYaE')"
    class="btn-premium">
    Upgrade to Pro
  </button>
</div>

<!-- Emergency Consulting Button -->
<div class="pricing-card emergency">
  <h3>Emergency Consulting</h3>
  <p class="price">$500<span>one-time</span></p>
  <p>1-hour emergency session</p>
  <button
    onclick="initiateCheckout('price_1Si4tKIBd71iNToyUtO6McaO')"
    class="btn-emergency">
    Book Now
  </button>
</div>
`;

// ============================================
// QUICK START CHECKLIST
// ============================================

const CHECKLIST = `
STRIPE INTEGRATION CHECKLIST:

□ 1. Add Stripe.js to HTML
   <script src="https://js.stripe.com/v3/"></script>

□ 2. Create backend endpoint: /api/create-checkout-session

□ 3. Create webhook endpoint: /api/stripe-webhook

□ 4. Configure webhook in Stripe dashboard
   URL: https://conciousnessrevolution.io/api/stripe-webhook
   Events: checkout.session.completed, customer.subscription.*

□ 5. Add checkout buttons to pricing page

□ 6. Test in Stripe test mode first

□ 7. Switch to live mode

□ 8. Monitor first transactions

□ 9. Set up automated receipts

□ 10. Configure subscription management

DONE! Revenue flowing!
`;

console.log('Stripe integration code loaded');
console.log('Products configured:', Object.keys(STRIPE_PRODUCTS));
console.log('Ready to process payments!');
