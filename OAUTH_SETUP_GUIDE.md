# Government Grants Portal Configuration

## OAuth Configuration

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable Google Identity Services API
4. Go to "Credentials" and create OAuth 2.0 Client ID
5. Add authorized JavaScript origins:
   - https://barbrickdesign.github.io
   - http://localhost (for testing)
6. Add authorized redirect URIs:
   - https://barbrickdesign.github.io/government-grants-portal.html
7. Copy the Client ID and paste it in the `googleClientId` variable in government-grants-portal.html

### PayPal Configuration

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Create a REST API app
3. Get your Client ID and Secret
4. Configure webhook endpoints:
   - Production: Your backend webhook URL (e.g., https://your-backend.com/api/webhooks/paypal)
   - For GitHub Pages, you can use services like Firebase Functions, AWS Lambda, or Netlify Functions
5. Subscribe to these webhook events:
   - PAYMENT.CAPTURE.COMPLETED
   - BILLING.SUBSCRIPTION.CREATED
   - BILLING.SUBSCRIPTION.CANCELLED
   - BILLING.SUBSCRIPTION.UPDATED

### Webhook Backend Setup (Optional but Recommended)

For production use with real webhooks, you'll need a backend service:

#### Option 1: Firebase Functions

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.paypalWebhook = functions.https.onRequest(async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    const event = req.body;
    console.log('PayPal webhook received:', event.event_type);

    // Verify webhook signature
    // Process event
    // Update Firestore database
    // Send notifications

    res.status(200).send('OK');
});
```

#### Option 2: Netlify Functions

Create `/netlify/functions/paypal-webhook.js`:

```javascript
exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const payload = JSON.parse(event.body);
    console.log('PayPal webhook received:', payload.event_type);

    // Process webhook
    // Update database
    // Send notifications

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Webhook processed' })
    };
};
```

#### Option 3: AWS Lambda

Similar setup through AWS Lambda with API Gateway.

### Environment Variables

Create a `.env` file (not committed to repo):

```
GOOGLE_OAUTH_CLIENT_ID=your_client_id_here
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
WEBHOOK_SECRET=your_webhook_secret_here
```

### HTML Meta Tags

Add these to the `<head>` section of government-grants-portal.html:

```html
<meta name="google-oauth-client-id" content="YOUR_GOOGLE_CLIENT_ID">
<meta name="paypal-client-id" content="YOUR_PAYPAL_CLIENT_ID">
```

### Testing

For local testing:
1. Use localhost in OAuth redirect URIs
2. Use PayPal Sandbox for testing payments
3. Use webhook simulators or ngrok to test webhooks locally

### Security Notes

1. **Never commit credentials to the repository**
2. Use environment variables for sensitive data
3. Validate webhook signatures
4. Use HTTPS for all OAuth redirects
5. Implement rate limiting on webhook endpoints
6. Log all webhook events for auditing

### Current Implementation

The current implementation uses:
- localStorage for data persistence (client-side)
- Simulated webhooks for testing
- Manual PayPal.me links for payments

For production:
- Set up proper backend webhook endpoints
- Use Firestore or similar database
- Implement real-time updates via WebSocket or Firebase Realtime Database
- Set up proper OAuth credentials
