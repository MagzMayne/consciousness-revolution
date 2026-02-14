# PayPal Donation Webhook Setup Guide

## Overview
This guide explains how to set up PayPal webhooks to receive donation notifications for Agent R (Barbrick Design) at BarbrickDesign@gmail.com.

## What Are Webhooks?
Webhooks are automatic notifications sent from PayPal to your server when a payment event occurs. This allows you to:
- Confirm donations instantly
- Send thank you messages
- Track donations in a database
- Trigger other automated actions

## Setup Steps

### 1. Create a PayPal Business Account
If you haven't already:
1. Go to [PayPal Business](https://www.paypal.com/business)
2. Sign up using BarbrickDesign@gmail.com
3. Complete business account verification

### 2. Access PayPal Developer Dashboard
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Log in with your BarbrickDesign@gmail.com PayPal account
3. Navigate to **Apps & Credentials**

### 3. Create or Select a REST API App
1. Click **Create App** (or select an existing app)
2. Name it "Consciousness Revolution Donations"
3. Select **Merchant** as the app type
4. Click **Create App**
5. Copy your **Client ID** and **Secret** (keep these safe!)

### 4. Configure the Webhook
1. In your app dashboard, scroll to **Webhooks**
2. Click **Add Webhook**
3. Enter webhook URL:
   ```
   https://conciousnessrevolution.io/.netlify/functions/paypal-donation-webhook
   ```
4. Select these event types:
   - ✅ `PAYMENT.SALE.COMPLETED`
   - ✅ `PAYMENT.CAPTURE.COMPLETED`
   - ✅ `CHECKOUT.ORDER.COMPLETED`
5. Click **Save**
6. Copy the **Webhook ID** that PayPal generates

### 5. Add Environment Variables
Add these to your Netlify environment variables:
```bash
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_CLIENT_SECRET=your_client_secret_here
PAYPAL_WEBHOOK_ID=your_webhook_id_here
PAYPAL_MODE=live  # or 'sandbox' for testing
```

To add in Netlify:
1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Click **Add a variable**
4. Add each variable above

### 6. Test the Webhook

#### Using PayPal Sandbox (Testing)
1. Switch PayPal Developer Dashboard to **Sandbox** mode
2. Create test accounts (buyer and seller)
3. Use sandbox credentials in your environment variables
4. Make a test donation using the sandbox buyer account
5. Check Netlify function logs to see if webhook was received

#### Using Live PayPal
1. Switch to **Live** mode in PayPal Dashboard
2. Update environment variables to use live credentials
3. Make a real donation (can be $1 for testing)
4. Check Netlify function logs

### 7. View Webhook Logs
In Netlify:
1. Go to **Functions** tab
2. Click on `paypal-donation-webhook`
3. View real-time logs

In PayPal Developer Dashboard:
1. Go to your app's webhook settings
2. Click on the webhook URL
3. View delivery history and event details

## Donation Button Implementation

### PayPal.me Link (Simplest)
Already implemented in `/support.html`:
```html
<a href="https://www.paypal.com/paypalme/BarbrickDesign" class="donate-btn">
    Donate via PayPal
</a>
```

### PayPal Donation Button (Alternative)
You can also generate a button at [PayPal Button Generator](https://www.paypal.com/buttons):
1. Select **Donation** button type
2. Enter `BarbrickDesign@gmail.com`
3. Customize style and currency
4. Copy the HTML code
5. Paste into your website

## Webhook Event Flow

```
User clicks "Donate" → PayPal processes payment → PayPal sends webhook
    ↓
Netlify function receives webhook → Verifies signature → Logs donation
    ↓
(Optional) Send thank you email → (Optional) Update database → Return success
```

## Security Considerations

1. **Always verify webhook signatures** - The handler includes signature verification
2. **Use HTTPS only** - PayPal requires HTTPS for webhooks
3. **Keep credentials secret** - Never commit API keys to git
4. **Monitor logs** - Check for suspicious webhook activity
5. **Validate amounts** - Verify donation amounts match expectations

## Troubleshooting

### Webhook not receiving events
- Check webhook URL is correct and accessible
- Verify webhook is subscribed to correct events
- Check Netlify function is deployed
- Look for errors in Netlify function logs

### Signature verification failing
- Ensure `PAYPAL_WEBHOOK_ID` matches the ID in PayPal Dashboard
- Check that environment variables are set correctly
- Verify you're using live/sandbox credentials consistently

### Function timeout
- Netlify functions have a 10-second timeout by default
- For Pro accounts, it's 26 seconds
- Keep webhook processing fast and async

## Next Steps

After setup:
1. Test with a real donation
2. Implement email notifications (SendGrid, AWS SES, etc.)
3. Save donations to database (Supabase, Firebase, etc.)
4. Create donor dashboard
5. Set up recurring donation tracking

## Support

For issues:
- Check [PayPal Webhooks Documentation](https://developer.paypal.com/api/rest/webhooks/)
- Review [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- Contact: BarbrickDesign@gmail.com

---

**Author:** Agent R (Barbrick Design)  
**Date:** 2026-02-14  
**Version:** 1.0.0
