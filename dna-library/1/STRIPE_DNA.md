# STRIPE DNA

## WHAT IS IT
Payment infrastructure for subscriptions, one-time purchases, and marketplace transactions. Handles Bronze/Silver/Gold/Platinum tiers with 50% student discounts. Features webhook-driven subscription management, credit allocation (500-1000 credits per tier), ARAYA subscription tracking, downstream revenue sharing for creator marketplace, and PCI-compliant checkout. Integrates with Supabase for profile storage.

## STATUS
- Working: **WORKING** (checkout, webhooks, credit allocation all functional)
- Last tested: 2026-03-06
- Current issues: Marketplace downstream revenue not fully tested at scale

## LOCATION
**Backend (Netlify Functions):**
- `~/100X_DEPLOYMENT/netlify/functions/stripe-webhook-v2.mjs` - Webhook handler (451 lines)
- `~/100X_DEPLOYMENT/netlify/functions/create-checkout.mjs` - Checkout session (81 lines)
- `~/100X_DEPLOYMENT/netlify/functions/marketplace-checkout.mjs` - Marketplace purchases

**Client-side:**
- `~/100X_DEPLOYMENT/src/utils/stripe-integration.js` - Payment class (530 lines)
- `~/100X_DEPLOYMENT/stripe-demo.html` - Demo page with test cards

**Integration files:**
- `~/100X_DEPLOYMENT/contributor-registration-enhanced.html` - Uses Stripe
- `~/100X_DEPLOYMENT/contribution-portal.html` - Uses Stripe

**Dependencies:**
- Stripe SDK (js.stripe.com/v3/)
- Supabase (subscription status storage)
- Netlify Functions (serverless backend)

## HOW IT WORKS

```
┌─────────────────────────────────────────────────────────────────────┐
│                        STRIPE PAYMENT FLOW                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐              │
│  │   CLIENT    │───→│   STRIPE    │───→│  WEBHOOK    │              │
│  │ (checkout)  │    │  (hosted)   │    │  (netlify)  │              │
│  └─────────────┘    └─────────────┘    └──────┬──────┘              │
│                                               │                      │
│       ┌───────────────────────────────────────┼──────────────────┐  │
│       │                                       ↓                  │  │
│  ┌────┴────┐    ┌─────────────┐    ┌─────────────┐               │  │
│  │ CREDITS │    │  SUPABASE   │    │   EMAIL     │               │  │
│  │ +500    │    │ (profiles)  │    │ (welcome)   │               │  │
│  └─────────┘    └─────────────┘    └─────────────┘               │  │
│                                                                      │
│  TIERS:  Bronze $50  │  Silver $200  │  Gold $500  │  Platinum $1500│
│  CREDITS:   500      │     500       │    1000     │      1000      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Core Logic:
1. User clicks payment button or checkout link
2. create-checkout.mjs creates Stripe Checkout session
3. User completes payment on Stripe's hosted page
4. Stripe sends webhook to stripe-webhook-v2.mjs
5. Webhook: Updates subscription status in Supabase araya_memory
6. Webhook: Allocates credits via araya-credits function
7. Webhook: Sends welcome email
8. Webhook: Records marketplace contributions (if applicable)

## KEY FILES BREAKDOWN

### stripe-webhook-v2.mjs (451 lines)
- **Purpose:** Handle all Stripe events
- **Events Handled:**
  - `checkout.session.completed` - Payment success, allocate credits
  - `customer.subscription.created` - New subscription
  - `customer.subscription.updated` - Status change
  - `customer.subscription.deleted` - Cancellation
  - `invoice.paid` / `invoice.payment_failed` - Billing
- **Credit Allocation:**
  - Founding Member ($47/mo): 500 credits
  - Pattern Tools Pro ($99/mo): 1000 credits
  - Emergency Consulting ($500): 100 credits
  - Beta Access ($9/mo): 100 credits

### stripe-integration.js (530 lines)
- **Purpose:** Client-side payment class
- **Features:**
  - `createPaymentButton()` - Adds payment button to container
  - `processPayment()` - Processes payment flow
  - `calculateContributionAmount()` - Tier + discount calculation
  - `getStatistics()` - Transaction history stats
  - `exportTransactions()` - JSON/CSV export
- **Tier Amounts:**
  - Bronze: $50
  - Silver: $200
  - Gold: $500
  - Platinum: $1,500
- **Student Discount:** 50% off all tiers

### create-checkout.mjs (81 lines)
- **Purpose:** Create Stripe Checkout session
- **Security:**
  - CORS headers
  - Rate limiting: 20 attempts/hour/IP
  - IP anonymization
- **Returns:** Session ID + checkout URL

## DEPENDENCIES

**Required:**
- Stripe account
- Netlify Functions
- Environment variables

**Environment Variables:**
```bash
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_...  # Client-side
STRIPE_PRICE_BUILDER_PRO=price_...  # Default price ID
```

**Client Libraries:**
```html
<script src="https://js.stripe.com/v3/"></script>
<script src="/src/utils/stripe-integration.js"></script>
```

## HOW TO RUN

**Test Demo Page:**
```bash
https://conciousnessrevolution.io/stripe-demo.html
```

**Test Cards:**
```
4242 4242 4242 4242 - Visa (Success)
5555 5555 5555 4444 - Mastercard (Success)
3782 822463 10005 - Amex (Success)
4000 0000 0000 9995 - Always Fails
```
Use any future expiry, any 3-digit CVC, any ZIP.

## HOW TO BUILD

**No build required** - Plain JavaScript + Netlify Functions.

## HOW TO DEPLOY

```bash
cd ~/100X_DEPLOYMENT
netlify deploy --prod --dir=.
```

**Set Environment Variables:**
```bash
netlify env:set STRIPE_SECRET_KEY "sk_..."
netlify env:set STRIPE_WEBHOOK_SECRET "whsec_..."
```

## CRITICAL KNOWLEDGE

### Price IDs (Production):

| Price ID | Product | Credits |
|----------|---------|---------|
| `price_1Si4sWIBd71iNToyQiR5WRY5` | Founding Member $47/mo | 500 |
| `price_1Si4szIBd71iNToyZghCXYaE` | Pattern Tools Pro $99/mo | 1000 |
| `price_1Si4tKIBd71iNToyUtO6McaO` | Emergency Consulting $500 | 100 |

### Subscription Status Flow:

```
checkout.session.completed → status: 'active'
customer.subscription.updated → status: 'active' | 'past_due' | 'canceled'
customer.subscription.deleted → status: 'canceled'
```

### ARAYA Integration:

Subscriptions are stored in `araya_memory` table (type='profile'):
```javascript
{
  subscription_status: 'active',
  stripe_subscription_id: 'sub_...',
  stripe_customer_id: 'cus_...',
  subscription_updated_at: '2026-03-06T...'
}
```

### Marketplace Revenue Sharing:

When a derivative creation sells:
1. Webhook detects `seller_foundation_id` in metadata
2. Records contribution via update-contribution function
3. If `has_upstream=true`, credits all parent creators

### Important Quirks:
- Uses Supabase `araya_memory` table (not `araya_profiles`)
- All subscriptions grant ARAYA access (simplified)
- Rate limiting: 20 checkout attempts/hour/IP
- Student discount: 50% (calculated client-side)

### Known Issues:
- Downstream revenue sharing not fully tested at scale
- No admin dashboard for viewing all subscriptions
- Credit allocation requires araya-credits function running

## CONFIGURATION

**Webhook Endpoint (Stripe Dashboard):**
```
https://conciousnessrevolution.io/.netlify/functions/stripe-webhook-v2
```

**Success/Cancel URLs:**
```javascript
success_url: 'https://conciousnessrevolution.io/success.html?session_id={CHECKOUT_SESSION_ID}'
cancel_url: 'https://conciousnessrevolution.io/'
```

## API REFERENCE

**Create Checkout Session:**
```javascript
POST /.netlify/functions/create-checkout
{
  "priceId": "price_...",
  "email": "user@example.com",
  "successUrl": "https://...",
  "cancelUrl": "https://..."
}
// Returns: { sessionId, url }
```

**Client-side Payment:**
```javascript
// Create payment button
window.stripePayment.createPaymentButton('container-id', {
    amount: 5000, // $50 in cents
    description: 'Bronze Tier',
    onSuccess: (tx) => console.log('Paid!', tx),
    onError: (err) => console.error(err)
});

// Calculate with discount
const amount = window.stripePayment.calculateContributionAmount('gold', true);
// Returns: 25000 (cents) = $250 with 50% student discount
```

## EXAMPLES

### Example 1: Create Checkout Session
```bash
curl -X POST https://conciousnessrevolution.io/.netlify/functions/create-checkout \
  -H "Content-Type: application/json" \
  -d '{"priceId": "price_1Si4sWIBd71iNToyQiR5WRY5", "email": "user@example.com"}'
# Returns: { "sessionId": "cs_...", "url": "https://checkout.stripe.com/..." }
```

### Example 2: Handle Subscription in Frontend
```javascript
// Check subscription status
const response = await fetch('/.netlify/functions/check-subscription?email=' + userEmail);
const { status } = await response.json();
if (status === 'active') {
    // User has access
}
```

### Example 3: Transaction Export
```javascript
const stats = window.stripePayment.getStatistics();
console.log('Total revenue:', stats.totalAmount);

const csv = window.stripePayment.exportTransactions('csv');
// Download CSV
```

## TESTING

**How to test:**
```bash
# Test webhook locally with Stripe CLI
stripe listen --forward-to localhost:8888/.netlify/functions/stripe-webhook-v2

# Test checkout session
curl -X POST http://localhost:8888/.netlify/functions/create-checkout \
  -d '{"priceId":"price_test","email":"test@example.com"}'

# Test webhook signature
stripe trigger checkout.session.completed
```

## TROUBLESHOOTING

**Problem:** "Webhook signature verification failed"
**Solution:** Check STRIPE_WEBHOOK_SECRET matches Stripe Dashboard endpoint secret

**Problem:** "Credits not allocated after payment"
**Solution:** Check araya-credits function is deployed, verify price ID in PRICE_CREDITS map

**Problem:** "Subscription status not updating"
**Solution:** Check Supabase connection, verify araya_memory table exists

**Problem:** "Rate limit exceeded"
**Solution:** Wait 1 hour, or check for bots/abuse

## NEXT STEPS

**Priority actions:**
1. Build admin dashboard for subscription management
2. Add refund handling webhook
3. Test marketplace downstream revenue at scale
4. Add prorated upgrade/downgrade handling
5. Implement subscription pause feature

**Known gaps:**
- No admin UI for subscriptions
- No refund automation
- Downstream revenue untested at scale

## TECH STACK

- **Payment:** Stripe Checkout + Webhooks
- **Backend:** Netlify Functions (serverless)
- **Database:** Supabase (subscription status)
- **Client:** Stripe.js v3 + custom integration class
- **Security:** Webhook signature verification, CORS, rate limiting

## TAGS
#foundation #payments #stripe #subscriptions #credits #checkout #webhooks

## METADATA
- **Creator:** Commander (darrickpreble@proton.me)
- **Created:** 2025
- **Last Updated:** 2026-03-06
- **Version:** 2.0
- **Backend Files:** 3 Netlify Functions
- **Client Files:** 2 (integration + demo)
- **Status:** Working

## RELATED DNAS
- [SUPABASE_DNA.md] - Stores subscription profiles
- [ARAYA_DNA.md] - Uses subscription status for access control
- [NETLIFY_DEPLOY_DNA.md] - Hosts webhook functions
- [BUILDER_OS_DNA.md] - Marketplace payments
