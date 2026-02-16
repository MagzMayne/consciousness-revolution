---
layout: default
title: STRIPE INTEGRATION GUIDE
---

# Stripe Payment Integration Guide

## Overview

This repository now includes comprehensive Stripe payment integration alongside the existing PayPal system, providing users with flexible payment options. The Stripe integration uses modern best practices and is designed to work seamlessly with the existing payment infrastructure.

## 🎯 Key Features

- **Dual Payment System**: Users can choose between Stripe and PayPal
- **Secure Integration**: Uses Stripe.js v3 for PCI compliance
- **Test Mode Ready**: Pre-configured with test API key for development
- **Auto-initialization**: Loads and initializes automatically
- **Transaction Tracking**: Local storage of payment history
- **Revenue Sharing**: Integrated with contributor tier system
- **Student Discounts**: 50% discount support built-in
- **Mobile Optimized**: Responsive design for all devices

## 📋 Architecture

### Components

1. **Stripe Integration Script** (`src/utils/stripe-integration.js`)
   - Centralized Stripe SDK wrapper
   - Automatic initialization with test key
   - Transaction management and history
   - Integration with existing payment systems

2. **Payment Button Components**
   - Pre-styled Stripe buttons
   - Customizable appearance
   - Event handlers for success/error

3. **Checkout Flow**
   - Simple one-click payments
   - Support for custom amounts
   - Metadata and description support

## 🔑 API Key Configuration

### Test Key (Current)

The repository is pre-configured with a Stripe test key:

```
pk_test_51Szh6V2UmH0IzuSRMgUHVugtXD9Acn8uH5CfFqcTsUO6NaQKB9mFSvBppsRVhSgirEJNPqZryl414awr0fqUG6JS00PD90ymWs
```

This key is safe for development and testing. It will:
- ✅ Process test payments
- ✅ Not charge real cards
- ✅ Work with Stripe test card numbers
- ✅ Show up in Stripe Dashboard (test mode)

### Production Key (Future)

For production deployment, replace the test key with your live publishable key:

1. **Via Environment Variables** (Recommended):
   ```javascript
   window.ENV = {
       STRIPE_PUBLISHABLE_KEY: 'pk_live_YOUR_LIVE_KEY'
   };
   ```

2. **Via Configuration**:
   ```javascript
   const stripe = new StripePaymentIntegration({
       publishableKey: 'pk_live_YOUR_LIVE_KEY',
       isProduction: true
   });
   ```

3. **Via GitHub Secrets** (for CI/CD):
   - Navigate to repository Settings → Secrets → Actions
   - Add `STRIPE_PUBLISHABLE_KEY` with your live key
   - Update deployment scripts to inject the key

## 🚀 Usage

### Basic Integration

Add Stripe payment button to any page:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Payment Page</title>
    <!-- Load Stripe Integration -->
    <script src="/src/utils/stripe-integration.js"></script>
</head>
<body>
    <h1>Make a Payment</h1>
    
    <!-- Payment button container -->
    <div id="stripe-payment-button"></div>
    
    <script>
        // Wait for Stripe to initialize
        window.addEventListener('stripe-ready', () => {
            // Create payment button
            window.stripePayment.createPaymentButton('stripe-payment-button', {
                amount: 5000, // $50.00 in cents
                description: 'Bronze Tier Contribution',
                onSuccess: (transaction) => {
                    alert('Payment successful! Transaction ID: ' + transaction.id);
                },
                onError: (error) => {
                    alert('Payment failed: ' + error.message);
                }
            });
        });
    </script>
</body>
</html>
```

### Contributor Registration Integration

For tier-based contributions with student discounts:

```javascript
// Get form values
const tier = document.getElementById('tier-select').value; // bronze, silver, gold, platinum
const isStudent = document.getElementById('student-discount').checked;
const email = document.getElementById('email').value;

// Calculate amount with discount
const amount = window.stripePayment.calculateContributionAmount(tier, isStudent);

// Create payment
window.stripePayment.processPayment({
    amount: amount,
    description: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Tier Contribution`,
    customerEmail: email,
    metadata: {
        tier: tier,
        isStudent: isStudent,
        contributorType: 'grant-partner'
    },
    onSuccess: (transaction) => {
        // Redirect to dashboard
        window.location.href = 'contributor-dashboard-hub.html';
    },
    onError: (error) => {
        console.error('Payment error:', error);
        alert('Payment failed. Please try again.');
    }
});
```

### Dual Payment System (Stripe + PayPal)

Offer both payment methods:

```html
<div class="payment-options">
    <h3>Choose Payment Method</h3>
    
    <!-- Stripe Option -->
    <div class="payment-method">
        <h4>💳 Pay with Stripe</h4>
        <p>Credit card, debit card, or digital wallet</p>
        <div id="stripe-payment-button"></div>
    </div>
    
    <!-- PayPal Option -->
    <div class="payment-method">
        <h4>🅿️ Pay with PayPal</h4>
        <p>PayPal account or guest checkout</p>
        <div id="paypal-button-container"></div>
    </div>
</div>

<style>
    .payment-options {
        max-width: 800px;
        margin: 20px auto;
    }
    
    .payment-method {
        background: rgba(255, 255, 255, 0.1);
        padding: 20px;
        margin: 15px 0;
        border-radius: 12px;
        border: 2px solid rgba(255, 255, 255, 0.2);
    }
    
    .payment-method h4 {
        margin: 0 0 10px 0;
        font-size: 1.3em;
    }
</style>

<script>
    // Initialize both payment systems
    window.addEventListener('stripe-ready', () => {
        window.stripePayment.createPaymentButton('stripe-payment-button', {
            amount: 5000,
            description: 'Contribution Payment'
        });
    });
    
    // PayPal initialization (if available)
    if (typeof paypal !== 'undefined') {
        paypal.Buttons({
            createOrder: (data, actions) => {
                return actions.order.create({
                    purchase_units: [{
                        amount: { value: '50.00' }
                    }]
                });
            },
            onApprove: async (data, actions) => {
                const order = await actions.order.capture();
                alert('PayPal payment successful!');
            }
        }).render('#paypal-button-container');
    }
</script>
```

## 💰 Contribution Tiers

The Stripe integration supports all contribution tiers with automatic calculation:

| Tier | Standard Price | Student Price (50% off) | Revenue Share |
|------|---------------|------------------------|---------------|
| Bronze | $50.00 | $25.00 | 10% |
| Silver | $200.00 | $100.00 | 12% |
| Gold | $500.00 | $250.00 | 15% |
| Platinum | $1,500.00 | $750.00 | 20% |

Example usage:

```javascript
// Calculate amount for Gold tier with student discount
const amount = window.stripePayment.calculateContributionAmount('gold', true);
console.log(amount); // 25000 (cents) = $250.00

// Format for display
const formatted = window.stripePayment.formatAmount(amount);
console.log(formatted); // "$250.00"
```

## 📊 Transaction Management

### Get Transaction History

```javascript
// Get all transactions
const allTransactions = window.stripePayment.getTransactions();

// Get completed transactions only
const completed = window.stripePayment.getTransactions({ status: 'completed' });

// Get transactions in date range
const recent = window.stripePayment.getTransactions({
    startDate: '2025-01-01',
    endDate: '2025-12-31'
});
```

### Get Statistics

```javascript
const stats = window.stripePayment.getStatistics();
console.log(stats);
// {
//     totalTransactions: 42,
//     completedTransactions: 38,
//     pendingTransactions: 2,
//     totalAmount: 8450.00,
//     averageAmount: 222.37
// }
```

### Export Transactions

```javascript
// Export as JSON
const jsonData = window.stripePayment.exportTransactions('json');
console.log(jsonData);

// Export as CSV
const csvData = window.stripePayment.exportTransactions('csv');
// Download or send to server
```

## 🧪 Testing

### Test Card Numbers

Use these card numbers in test mode:

| Card Number | Description |
|-------------|-------------|
| 4242 4242 4242 4242 | Visa - Successful payment |
| 4000 0025 0000 3155 | Visa - Requires authentication |
| 4000 0000 0000 9995 | Visa - Always fails |
| 5555 5555 5555 4444 | Mastercard - Successful payment |
| 3782 822463 10005 | American Express - Successful payment |

**For all test cards:**
- Use any future expiration date (e.g., 12/34)
- Use any 3-digit CVC (e.g., 123)
- Use any ZIP code (e.g., 12345)

### Test Page

A dedicated test page is available at:
- [test-stripe-integration.html](test-stripe-integration.html)

This page includes:
- Payment button testing
- Amount calculation verification
- Transaction history display
- Statistics dashboard
- Export functionality

## 🔒 Security Best Practices

### ✅ What We Do

1. **PCI Compliance**: Use Stripe.js to avoid handling card data
2. **HTTPS Only**: All Stripe API calls use HTTPS
3. **Test/Live Separation**: Test keys clearly marked
4. **No Secrets in Code**: Keys loaded from environment
5. **Client-Side Only**: No secret keys exposed

### ⚠️ Important Notes

1. **Never commit secret keys**: Only publishable keys are safe in code
2. **Backend Required for Production**: Current implementation is client-only
   - For production, implement a backend to create checkout sessions
   - This protects against amount tampering
   - Enables webhooks for reliable payment confirmation

3. **Environment Variables**: Use GitHub Secrets or .env files for keys

### Backend Integration (Future Enhancement)

For production deployment, implement these backend endpoints:

```javascript
// Example: Create Checkout Session endpoint
app.post('/create-checkout-session', async (req, res) => {
    const { amount, description, metadata } = req.body;
    
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
                currency: 'usd',
                product_data: {
                    name: description,
                },
                unit_amount: amount,
            },
            quantity: 1,
        }],
        mode: 'payment',
        success_url: `${YOUR_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${YOUR_DOMAIN}/cancel`,
        metadata: metadata
    });
    
    res.json({ id: session.id });
});
```

## 🎨 Styling

### Custom Button Styles

Override default button styles:

```javascript
window.stripePayment.createPaymentButton('container-id', {
    buttonText: 'Subscribe Now',
    buttonClass: 'my-custom-button',
    amount: 10000
});
```

```css
.my-custom-button {
    background: linear-gradient(135deg, #667eea, #764ba2) !important;
    padding: 15px 30px !important;
    font-size: 18px !important;
    border-radius: 25px !important;
}

.my-custom-button:hover {
    transform: scale(1.05) !important;
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.5) !important;
}
```

### Payment Options Container

```css
.payment-options-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin: 30px 0;
}

.payment-option-card {
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(99, 91, 255, 0.3);
    border-radius: 15px;
    padding: 25px;
    transition: all 0.3s ease;
}

.payment-option-card:hover {
    border-color: #635bff;
    box-shadow: 0 8px 24px rgba(99, 91, 255, 0.2);
    transform: translateY(-5px);
}
```

## 📱 Mobile Optimization

The Stripe integration is fully mobile-responsive:

- Touch-friendly button sizes (minimum 44x44px)
- Responsive grid layouts
- Mobile-optimized checkout flow
- Support for Apple Pay and Google Pay (via Stripe)

## 🔗 Integration with Existing Systems

### Contractor Payment System

Stripe automatically integrates with the contractor payment system:

```javascript
// Payments are automatically recorded in contractor system
window.stripePayment.processPayment({
    amount: 50000,
    metadata: {
        contractorId: 'CONT-12345',
        projectId: 'PROJ-67890'
    }
});
```

### Government Grants System

Track grant-related contributions:

```javascript
window.stripePayment.processPayment({
    amount: 150000,
    description: 'Platinum Tier - Government Grants Partnership',
    metadata: {
        tier: 'platinum',
        grantProgram: 'federal-sbir-2025',
        contributorType: 'grant-partner'
    }
});
```

## 📞 Support & Resources

### Stripe Documentation
- [Stripe.js Reference](https://stripe.com/docs/js)
- [Payment Intents API](https://stripe.com/docs/payments/payment-intents)
- [Checkout Sessions](https://stripe.com/docs/payments/checkout)
- [Testing Cards](https://stripe.com/docs/testing)

### Repository Resources
- **Test Page**: [test-stripe-integration.html](test-stripe-integration.html)
- **Integration Code**: [src/utils/stripe-integration.js](src/utils/stripe-integration.js)
- **PayPal Guide**: [PAYPAL_INTEGRATION_GUIDE.md](PAYPAL_INTEGRATION_GUIDE.md)
- **Payment Portal**: [contribution-portal.html](contribution-portal.html)

### Contact
- **Email**: BarbrickDesign@gmail.com
- **Repository**: [barbrickdesign.github.io](https://github.com/barbrickdesign/barbrickdesign.github.io)

## 🚦 Quick Start Checklist

- [x] ✅ Stripe SDK loaded automatically
- [x] ✅ Test key pre-configured
- [x] ✅ Integration script created
- [ ] 🔧 Add Stripe buttons to payment pages
- [ ] 🔧 Test with Stripe test cards
- [ ] 🔧 Configure live key for production
- [ ] 🔧 Implement backend for checkout sessions
- [ ] 🔧 Set up webhooks for payment confirmation

## 🎯 Next Steps

1. **Add to Key Pages**:
   - contributor-registration-enhanced.html
   - contribution-portal.html
   - government-grants-portal.html

2. **Backend Development**:
   - Create checkout session endpoint
   - Implement webhook handler
   - Add payment verification

3. **Testing**:
   - Test all contribution tiers
   - Verify student discounts
   - Test dual payment system (Stripe + PayPal)

4. **Production**:
   - Replace test key with live key
   - Enable production mode
   - Monitor transactions

---

**Ready to accept payments with Stripe! 🎉**

Questions? Contact BarbrickDesign@gmail.com
