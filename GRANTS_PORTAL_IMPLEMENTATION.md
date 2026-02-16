# Government Grants Portal - Authentication & Webhook System

## Overview

This implementation adds comprehensive authentication, payment tracking, and webhook functionality to the Government Grants Portal at https://barbrickdesign.github.io/government-grants-portal.html

## Features Implemented

### 1. **Google OAuth Authentication**

- ✅ Secure login with Google accounts
- ✅ Automatic session management
- ✅ User profile display (picture, name, email)
- ✅ Sign-in/sign-out functionality
- ✅ Token validation and refresh

**Files:**
- `google-oauth-auth.js` - Main authentication module

**Usage:**
```javascript
// Initialize
await window.googleOAuthAuth.init('YOUR_GOOGLE_CLIENT_ID');

// Render sign-in button
window.googleOAuthAuth.renderSignInButton('buttonContainerId');

// Check authentication status
if (window.googleOAuthAuth.isAuthenticated()) {
    const user = window.googleOAuthAuth.getCurrentUser();
    console.log('User:', user.email);
}

// Sign out
window.googleOAuthAuth.signOut();
```

### 2. **PayPal Account Integration**

- ✅ Link PayPal account to user profile
- ✅ Track donations and payments
- ✅ Automatic tier assignment based on donation amount
- ✅ Payment history and subscription management
- ✅ Webhook event processing

**Files:**
- `paypal-account-integration.js` - PayPal integration module

**Usage:**
```javascript
// Initialize
await window.paypalAccountIntegration.init({
    email: 'BarbrickDesign@gmail.com',
    webhookEndpoint: '/api/webhooks/paypal'
});

// Link account
const result = await window.paypalAccountIntegration.linkAccount('user@example.com');

// Process donation
await window.paypalAccountIntegration.processDonation({
    userEmail: 'user@example.com',
    amount: 500,
    tier: 'professional'
});

// Get donation history
const history = window.paypalAccountIntegration.getDonationHistory('user@example.com');
```

### 3. **Grant Tracking Hub**

- ✅ Track all grant applications
- ✅ Monitor funding approval status
- ✅ Automatic fund distribution to pools
- ✅ Real-time statistics and updates
- ✅ Contributor earnings tracking

**Files:**
- `grant-tracking-hub.js` - Grant tracking and fund management

**Usage:**
```javascript
// Initialize
window.grantTrackingHub.init();

// Submit application
const result = window.grantTrackingHub.submitApplication({
    grantName: 'SBIR Phase I',
    grantType: 'sbir',
    agency: 'NSF',
    requestedAmount: 250000,
    projectTitle: 'AI Innovation Project',
    applicantEmail: 'user@example.com',
    applicantName: 'John Doe',
    linkedProjects: ['proj_123'],
    contributors: [
        {
            id: 'user@example.com',
            name: 'John Doe',
            email: 'user@example.com',
            revenueShare: 15
        }
    ]
});

// Approve funding
await window.grantTrackingHub.approveFunding('grant_123', 250000);

// Get statistics
const stats = window.grantTrackingHub.getStatistics();
console.log('Total submitted:', stats.totalSubmitted);
console.log('Total awarded:', stats.totalAwarded);

// Get pool status
const pool = window.grantTrackingHub.getPoolStatus();
console.log('Total pool:', pool.total);
console.log('Donor share:', pool.donorShare);
```

### 4. **Webhook System**

- ✅ PayPal webhook event handling
- ✅ Real-time notification system
- ✅ Event-driven architecture
- ✅ Backend webhook handler for production

**Files:**
- `backend/paypal-webhook-handler.js` - Production webhook endpoint

**Supported Events:**
- `PAYMENT.CAPTURE.COMPLETED` - Payment received
- `BILLING.SUBSCRIPTION.CREATED` - New subscription
- `BILLING.SUBSCRIPTION.CANCELLED` - Subscription cancelled
- `BILLING.SUBSCRIPTION.UPDATED` - Subscription updated

**Event Listeners:**
```javascript
// Listen for PayPal webhooks
window.addEventListener('paypalWebhook', (event) => {
    console.log('Webhook received:', event.detail.event_type);
});

// Listen for hub updates
window.addEventListener('grantHubUpdate', (event) => {
    console.log('Hub update:', event.detail.type);
});
```

## Integration Flow

### User Journey:

1. **Authentication**
   - User visits government-grants-portal.html
   - Clicks "Sign in with Google" button
   - Authenticates via Google OAuth
   - Session created and stored

2. **PayPal Linking**
   - User links their PayPal account
   - System creates contributor profile
   - Donation tracking enabled

3. **Making a Donation**
   - User selects tier (Basic, Standard, Professional, Enterprise)
   - Redirected to PayPal.me with amount
   - Makes payment with email in notes
   - Webhook processes payment
   - Tier automatically activated

4. **Accessing the Hub**
   - User sees dashboard with stats
   - Donation amount and tier displayed
   - Revenue share calculator available
   - Grant submissions tracked

5. **Grant Application**
   - User fills out grant application
   - Application logged in hub
   - Contributors linked automatically
   - Status tracked through workflow

6. **Funding Approved**
   - Grant is approved by agency
   - Funds distributed automatically:
     - 10-20% to contributors
     - 30% to donor pool
     - 30% to project enhancement
     - 20-30% to operations
   - Contributors notified of earnings

## Setup Instructions

### 1. Google OAuth Setup

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select project
3. Enable Google Identity Services API
4. Create OAuth 2.0 Client ID
5. Add authorized origins:
   - `https://barbrickdesign.github.io`
6. Copy Client ID
7. Add to HTML:
   ```html
   <meta name="google-oauth-client-id" content="YOUR_CLIENT_ID">
   ```

### 2. PayPal API Setup

1. Visit [PayPal Developer](https://developer.paypal.com/)
2. Create REST API app
3. Get Client ID and Secret
4. Configure webhook URL
5. Subscribe to events:
   - PAYMENT.CAPTURE.COMPLETED
   - BILLING.SUBSCRIPTION.CREATED
   - BILLING.SUBSCRIPTION.CANCELLED

### 3. Webhook Deployment

Choose one of these options:

#### Option A: Firebase Functions
```bash
npm install -g firebase-tools
firebase init functions
# Deploy paypal-webhook-handler.js
firebase deploy --only functions:paypalWebhook
```

#### Option B: Netlify Functions
```bash
# Move to netlify/functions/
netlify deploy
```

#### Option C: AWS Lambda
```bash
# Package and deploy via AWS Console or CLI
```

### 4. Environment Variables

Create `.env`:
```
GOOGLE_OAUTH_CLIENT_ID=your_client_id
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_secret
PAYPAL_WEBHOOK_ID=your_webhook_id
```

## Testing

### Test Google OAuth:
1. Open government-grants-portal.html
2. Click "Sign in with Google"
3. Verify authentication
4. Check user profile display

### Test PayPal Integration:
1. Link PayPal account
2. Make test donation
3. Check tier activation
4. Verify dashboard updates

### Test Grant Tracking:
1. Submit grant application
2. Update application status
3. Approve funding
4. Verify fund distribution

## Data Storage

Currently uses `localStorage` for client-side persistence:
- `google_auth_user` - Google user data
- `google_auth_token` - OAuth token
- `paypal_linked_account` - Linked PayPal account
- `paypal_donations` - Donation history
- `grant_applications` - Grant submissions
- `grant_pool` - Pool status
- `grant_contributors` - Contributor profiles
- `hub_notifications` - System notifications

### For Production:
- Use Firestore, MongoDB, or PostgreSQL
- Implement proper backend API
- Set up Redis for caching
- Use WebSocket for real-time updates

## Security Considerations

✅ **Implemented:**
- Google OAuth for authentication
- Token validation
- Client-side data encryption
- Webhook signature verification (in backend handler)

⚠️ **For Production:**
- HTTPS only
- Rate limiting
- CORS configuration
- Input validation
- SQL injection prevention
- XSS protection

## API Documentation

### Google OAuth API
- `init(clientId)` - Initialize OAuth
- `signIn()` - Trigger sign-in
- `signOut()` - Sign out user
- `isAuthenticated()` - Check auth status
- `getCurrentUser()` - Get user data

### PayPal Integration API
- `init(config)` - Initialize PayPal
- `linkAccount(email)` - Link account
- `processDonation(data)` - Process payment
- `getDonationHistory(email)` - Get history

### Grant Tracking API
- `init()` - Initialize hub
- `submitApplication(data)` - Submit grant
- `updateApplicationStatus(id, status)` - Update status
- `approveFunding(id, amount)` - Approve funding
- `getStatistics()` - Get stats
- `getPoolStatus()` - Get pool info

## Support

For issues or questions:
- Email: BarbrickDesign@gmail.com
- GitHub: https://github.com/barbrickdesign/barbrickdesign.github.io

## License

© 2026 Barbrick Design. All rights reserved.
