# aFactory Payment Automation - Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will help you set up the real payment automation system for aFactory.html.

## Prerequisites

- Node.js 18 or higher
- PayPal Business Account
- Terminal/Command line access

## Step-by-Step Setup

### 1. Get PayPal Credentials

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Log in with your PayPal account
3. Click **"Apps & Credentials"**
4. Select **"Sandbox"** tab (for testing) or **"Live"** (for production)
5. Click **"Create App"**
6. Give your app a name (e.g., "aFactory Payments")
7. Copy your **Client ID** and **Secret**

### 2. Configure Backend

```bash
# Navigate to backend directory
cd backend

# Copy environment template
cp .env.example .env

# Edit .env file
nano .env  # or use your preferred editor
```

Add these settings to `.env`:

```bash
# PayPal Configuration
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_SECRET=your_secret_here
PAYPAL_MODE=sandbox  # Use 'sandbox' for testing, 'live' for production

# Payment Settings
MIN_PAYOUT=10.00
MAX_PAYOUT=10000.00
PAYOUT_SCHEDULE=threshold
```

### 3. Install Dependencies

```bash
# Make sure you're in the backend directory
npm install
```

### 4. Start the Backend Service

```bash
# Start the payment automation service
node services/afactory-payment-automation.js
```

You should see:
```
🚀 Initializing aFactory Payment Automation Service...
   Mode: sandbox
   Recipient: BarbrickDesign@gmail.com
   Min Payout: $10
   Schedule: threshold
✅ aFactory Payment Automation Service initialized
🚀 aFactory Payment Automation Service running on port 3001
```

### 5. Open aFactory.html

Open `aFactory.html` in your web browser. The page will automatically connect to the backend service.

You should see in the console:
```
✅ Real payment automation initialized
💰 Revenue will be automatically synced to backend for real PayPal payouts
```

### 6. Test the System

1. **Let agents generate revenue**: The agents will automatically start working and generating revenue
2. **Watch the balance**: Check the "Backend Balance" pill in the footer
3. **Monitor the backend**: Watch the terminal where the backend is running for sync messages
4. **Trigger a payout**: Once balance reaches $10, a payout will automatically be triggered (or trigger manually via API)

## Testing with PayPal Sandbox

### Create Test Accounts

1. Go to [PayPal Sandbox Accounts](https://developer.paypal.com/dashboard/accounts)
2. Create a **Business Account** (for receiving payouts)
3. Use `BarbrickDesign@gmail.com` or create a test email
4. Note the account credentials

### Test Payout Flow

```bash
# Make a test API call to record revenue
curl -X POST http://localhost:3001/api/payments/revenue \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: YOUR_API_KEY" \
  -d '{"amount": 10.50, "source": "test_revenue"}'

# Check stats
curl http://localhost:3001/api/payments/stats \
  -H "X-Api-Key: YOUR_API_KEY"

# Trigger manual payout
curl -X POST http://localhost:3001/api/payments/payout \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: YOUR_API_KEY" \
  -d '{}'
```

### Verify in PayPal Sandbox

1. Go to [PayPal Sandbox](https://www.sandbox.paypal.com/)
2. Log in with your test business account
3. Check **Activity** for the payout
4. Verify amount and recipient

## Production Deployment

### 1. Get Live Credentials

1. Switch to **"Live"** tab in PayPal Developer Dashboard
2. Get your live Client ID and Secret
3. **Important**: Make sure your PayPal account is verified and approved for Payouts

### 2. Update Configuration

```bash
# Edit .env
PAYPAL_MODE=live
PAYPAL_CLIENT_ID=your_live_client_id
PAYPAL_SECRET=your_live_secret
```

### 3. Deploy Backend

Deploy to a production server:

**Option A: Vercel**
```bash
vercel --prod
```

**Option B: Heroku**
```bash
heroku create afactory-payments
git push heroku main
```

**Option C: AWS, DigitalOcean, etc.**
- Upload backend code
- Set environment variables
- Start the service with PM2 or similar

### 4. Update Frontend

Edit `aFactory.html` or set environment variable:

```javascript
// Add this near the top of aFactory.html <script> section
window.AFACTORY_PAYMENT_API = 'https://your-backend-url.com/api/payments';
```

## Monitoring

### Check Backend Health

```bash
curl http://localhost:3001/api/payments/health
```

### View Statistics

```bash
curl http://localhost:3001/api/payments/stats \
  -H "X-Api-Key: YOUR_API_KEY"
```

### Monitor Logs

The backend logs all activities:
- Revenue recording
- Payment syncing
- Payout attempts
- Errors

## Troubleshooting

### Backend won't start
- Check Node.js version: `node --version` (need 18+)
- Verify PayPal credentials in `.env`
- Check port 3001 is not in use

### "Authentication failed"
- Verify `PAYPAL_CLIENT_ID` and `PAYPAL_SECRET` are correct
- Check you're using correct mode (sandbox vs live)
- Ensure Payouts API is enabled in PayPal app

### Frontend not connecting
- Verify backend is running
- Check API URL is correct
- Check browser console for errors
- Verify API key is set

### Payout failed
- Check minimum balance ($10 default)
- Verify recipient email exists
- Check PayPal account status
- Review backend logs for details

## Security Checklist

- [ ] Never commit `.env` file
- [ ] Use HTTPS in production
- [ ] Keep API keys secure
- [ ] Use strong API key (auto-generated recommended)
- [ ] Test with sandbox before going live
- [ ] Monitor transaction logs
- [ ] Set reasonable payout limits

## Need Help?

- **Documentation**: See [AFACTORY_PAYMENT_AUTOMATION.md](AFACTORY_PAYMENT_AUTOMATION.md)
- **PayPal Docs**: https://developer.paypal.com/docs/payouts/
- **Email**: BarbrickDesign@gmail.com
- **Repository**: https://github.com/barbrickdesign/barbrickdesign.github.io

## What's Next?

Once your system is running:

1. **Monitor Revenue**: Watch agents generate and sync revenue
2. **Track Payouts**: Check PayPal dashboard for actual transfers
3. **Optimize**: Adjust payout schedule and thresholds
4. **Scale**: Add more revenue streams
5. **Automate**: Set up monitoring and alerts

---

**Happy Automating! 💰🤖**
