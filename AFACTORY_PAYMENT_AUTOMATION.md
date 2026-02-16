# aFactory Payment Automation System

## Overview

The aFactory Payment Automation System provides **real-world payment processing** for the Autonomous Agent Factory. This is NOT a simulation - it handles actual PayPal Payouts to BarbrickDesign@gmail.com.

## Architecture

### Components

1. **Backend Service** (`backend/services/afactory-payment-automation.js`)
   - Node.js/Express service
   - PayPal Payouts API integration
   - Secure payment processing
   - Automated payout scheduling
   - Transaction logging and verification

2. **Client Script** (`src/systems/afactory-payment-client.js`)
   - Browser-based client
   - Communicates with backend service
   - Automatic revenue syncing
   - Real-time balance tracking

3. **Frontend Integration** (`aFactory.html`)
   - Connected to payment client
   - Real-time payment status display
   - Manual payout triggers

## How It Works

### Revenue Flow

```
Agent Completes Task
    ↓
recordRevenue() called
    ↓
Local ledger updated
    ↓
Revenue sent to backend via API
    ↓
Backend accumulates balance
    ↓
Automatic payout triggered (based on schedule/threshold)
    ↓
PayPal Payouts API called
    ↓
Real money transferred to BarbrickDesign@gmail.com
    ↓
Transaction logged and verified
```

### Payment Triggers

The system supports multiple payout triggers:

1. **Threshold-based**: Automatic payout when balance reaches minimum (default: $10)
2. **Daily**: Automatic payout every 24 hours
3. **Weekly**: Automatic payout every 7 days
4. **Monthly**: Automatic payout every 30 days
5. **Manual**: On-demand payouts via API or UI

## Setup Instructions

### 1. Backend Service Setup

#### Prerequisites
- Node.js 18 or higher
- PayPal Business Account
- PayPal API credentials (Client ID and Secret)

#### Get PayPal Credentials

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Create a new app or use existing app
3. Get Client ID and Secret
4. Enable Payouts API for your app

#### Configuration

Create or update `.env` file in `backend/` directory:

```bash
# PayPal Configuration
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_SECRET=your_secret_here
PAYPAL_MODE=sandbox  # Use 'live' for production

# Payment Configuration
MIN_PAYOUT=10.00
MAX_PAYOUT=10000.00

# Security
AFACTORY_API_KEY=your_generated_api_key_here
WEBHOOK_SECRET=your_webhook_secret_here

# Optional: Scheduling
PAYOUT_SCHEDULE=threshold  # Options: threshold, daily, weekly, monthly
```

#### Install Dependencies

```bash
cd backend
npm install
```

#### Start the Service

```bash
# Development mode
npm run dev

# Production mode
npm start

# Or run directly
node backend/services/afactory-payment-automation.js
```

The service will start on port 3001 by default.

### 2. Frontend Configuration

Update `aFactory.html` to point to your backend service:

```javascript
// Set the API endpoint before loading the page
window.AFACTORY_PAYMENT_API = 'https://your-backend-url.com/api/payments';

// Or set in environment
// For local development, defaults to http://localhost:3001/api/payments
```

### 3. API Key Configuration

The backend generates an API key on first run. You need to configure this in the frontend:

```javascript
// In browser console or localStorage
localStorage.setItem('afactory_api_key', 'your_api_key_here');
```

Or pass it directly to the client:

```javascript
window.aFactoryPaymentClient = new AFactoryPaymentClient({
    apiKey: 'your_api_key_here',
    apiBaseUrl: 'https://your-backend-url.com/api/payments'
});
```

## API Reference

### Backend API Endpoints

#### POST `/api/payments/revenue`
Record revenue from agent activities.

**Headers:**
- `X-Api-Key`: Your API key
- `Content-Type`: application/json

**Body:**
```json
{
  "amount": 10.50,
  "source": "affiliate_article_completed",
  "metadata": {
    "taskId": "T-123",
    "agentName": "W2_Writing"
  }
}
```

**Response:**
```json
{
  "success": true,
  "record": {
    "id": "TXN_...",
    "amount": 10.50,
    "timestamp": "2025-12-30T..."
  },
  "stats": {
    "currentBalance": 85.50,
    "totalPaidOut": 120.00,
    ...
  }
}
```

#### POST `/api/payments/payout`
Trigger a manual payout.

**Headers:**
- `X-Api-Key`: Your API key
- `Content-Type`: application/json

**Body:**
```json
{
  "amount": 50.00  // Optional, defaults to full balance
}
```

**Response:**
```json
{
  "success": true,
  "payout": {
    "id": "BATCH_...",
    "paypalBatchId": "...",
    "amount": 50.00,
    "recipient": "BarbrickDesign@gmail.com",
    "status": "PENDING",
    "timestamp": "2025-12-30T..."
  }
}
```

#### GET `/api/payments/payout/:batchId`
Check payout status.

**Response:**
```json
{
  "success": true,
  "status": {
    "batchId": "...",
    "status": "SUCCESS",
    "amount": {...},
    "items": [...]
  }
}
```

#### GET `/api/payments/stats`
Get current payment statistics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "currentBalance": 85.50,
    "lastPayout": "2025-12-29T...",
    "totalRevenue": 205.50,
    "totalPaidOut": 120.00,
    "pendingPayments": 5,
    "completedPayments": 12,
    "recipientEmail": "BarbrickDesign@gmail.com",
    "autoPayoutEnabled": true,
    "nextAutoPayoutReady": false
  }
}
```

#### GET `/api/payments/health`
Health check endpoint (no authentication required).

**Response:**
```json
{
  "status": "healthy",
  "service": "afactory-payment-automation",
  "timestamp": "2025-12-30T...",
  "hasToken": true,
  "balance": 85.50
}
```

## Security

### Important Security Measures

1. **API Key Protection**
   - Never commit API keys to repository
   - Use environment variables
   - Rotate keys regularly

2. **PayPal Credentials**
   - Store in `.env` file (never commit)
   - Use different credentials for sandbox vs live
   - Restrict app permissions to Payouts only

3. **HTTPS Required**
   - All API calls must use HTTPS in production
   - Never send credentials over HTTP

4. **Rate Limiting**
   - Backend implements rate limiting
   - Prevents abuse and DoS attacks

5. **Webhook Verification**
   - Webhook secret verifies PayPal callbacks
   - Prevents unauthorized transaction confirmations

## Deployment

### Production Deployment

1. **Backend Deployment** (Recommended: Vercel, Heroku, or AWS Lambda)

```bash
# Example: Vercel deployment
vercel --prod

# Set environment variables in hosting platform
```

2. **Environment Variables** (Set in hosting platform):
```
PAYPAL_CLIENT_ID=<production_client_id>
PAYPAL_SECRET=<production_secret>
PAYPAL_MODE=live
AFACTORY_API_KEY=<secure_random_key>
MIN_PAYOUT=10.00
```

3. **Update Frontend**:
```javascript
window.AFACTORY_PAYMENT_API = 'https://your-production-api.com/api/payments';
```

### Testing

#### Sandbox Testing

1. Use PayPal sandbox credentials
2. Set `PAYPAL_MODE=sandbox`
3. Test with sandbox accounts
4. Verify payouts in PayPal sandbox dashboard

#### Test Flow

```bash
# 1. Start backend in sandbox mode
PAYPAL_MODE=sandbox node backend/services/afactory-payment-automation.js

# 2. Open aFactory.html in browser

# 3. Let agents generate revenue

# 4. Verify revenue syncing to backend

# 5. Trigger manual payout or wait for auto-payout

# 6. Check PayPal sandbox for payout
```

## Monitoring

### Backend Logs

The service logs all activities:
- Revenue recording
- Payout attempts
- API authentication
- Errors and failures

### Payment History

Access via API:
```bash
curl -H "X-Api-Key: your_key" \
  https://your-backend/api/payments/stats
```

### PayPal Dashboard

Monitor actual transactions:
- [PayPal Sandbox Dashboard](https://www.sandbox.paypal.com/)
- [PayPal Live Dashboard](https://www.paypal.com/)

## Troubleshooting

### Common Issues

#### "PayPal authentication failed"
- Check `PAYPAL_CLIENT_ID` and `PAYPAL_SECRET`
- Verify credentials are for correct environment (sandbox/live)
- Ensure Payouts API is enabled for your app

#### "Insufficient balance"
- Check current balance via `/stats` endpoint
- Verify minimum payout threshold
- Ensure revenue is syncing from frontend

#### "API Key unauthorized"
- Verify API key matches backend configuration
- Check `localStorage.getItem('afactory_api_key')`
- Regenerate key if necessary

#### "Backend not responding"
- Check if backend service is running
- Verify API URL is correct
- Check CORS configuration
- Review backend logs

### Debug Mode

Enable detailed logging:
```javascript
// In backend
const paymentService = new AFactoryPaymentAutomation({
    logLevel: 'debug'
});

// In frontend console
localStorage.setItem('debug', 'afactory:*');
```

## Revenue Sources

The following agent activities generate real revenue:

| Activity | Amount Range | Source ID |
|----------|-------------|-----------|
| Affiliate Articles | $5-$25 | `affiliate_article_completed` |
| Course Outlines | $30-$80 | `course_outline_completed` |
| Digital Products | $5-$20 | `digital_product_idea_validation` |
| YouTube Videos | $2-$12 | `youtube_video_completed` |
| POD Designs | $3-$11 | `pod_design_sold` |
| SaaS Features | $10-$50 | `saas_feature_implemented` |
| Newsletter Issues | $10-$35 | `newsletter_issue_sent` |
| Stock Media | $5-$17 | `stock_media_uploaded` |
| Direct Support | Variable | `direct_support` |

## FAQ

### Q: Is this real money?
**A:** Yes! When configured with live PayPal credentials, this system processes actual payments via PayPal Payouts API to BarbrickDesign@gmail.com.

### Q: How often do payouts occur?
**A:** Configurable: threshold-based (default when balance ≥ $10), daily, weekly, or monthly.

### Q: Can I test without real money?
**A:** Yes! Use PayPal sandbox mode for testing with fake money.

### Q: What are the fees?
**A:** PayPal charges fees for payouts (typically $0.25-$1 per payout). Check PayPal's current rates.

### Q: Is it secure?
**A:** Yes, when properly configured:
- API keys protect endpoints
- HTTPS encrypts all communication
- PayPal handles payment security
- No credit card data stored

### Q: Can I change the recipient?
**A:** Yes, modify `recipientEmail` in backend configuration. Default is BarbrickDesign@gmail.com.

### Q: What happens if payout fails?
**A:** Failed payouts are logged and balance is preserved for retry. Check logs for details.

## Support

For issues or questions:
- Email: BarbrickDesign@gmail.com
- Repository: https://github.com/barbrickdesign/barbrickdesign.github.io
- Documentation: This file

## License

MIT License - See repository LICENSE file

---

**Last Updated:** December 30, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready - Real Payment Processing
