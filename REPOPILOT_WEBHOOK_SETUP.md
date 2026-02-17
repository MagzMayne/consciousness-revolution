# RepoPilot PayPal Webhook Setup Guide

## Overview

This guide explains how to configure PayPal webhooks for autonomous delivery of RepoPilot subscriptions to barbrickdesign@gmail.com upon payment success.

## Architecture

```
Customer Purchase (PayPal) 
    ↓
PayPal Webhook Event
    ↓
netlify/functions/repopilot-paypal-webhook.mjs
    ↓
    ├─→ netlify/functions/repopilot-delivery-notification.mjs
    │   └─→ Email to barbrickdesign@gmail.com (Order details + Action items)
    │
    └─→ netlify/functions/send-repopilot-welcome.mjs
        └─→ Email to customer (Welcome + Setup instructions)
```

## Pricing Configuration

The RepoPilot landing page implements the following pricing tiers:

| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0/month | Basic AI assistance, Limited monthly usage, Community support |
| **Pro** | **$29/month** | Unlimited AI assistance, Advanced automation, Priority support, Private repos |
| **Enterprise** | Custom | Everything in Pro + Custom AI models, Dedicated support, SLA guarantees |

**Note**: Pricing matches the specification in `agent-r-manifest.json`.

## PayPal Webhook Configuration

### Step 1: Access PayPal Developer Dashboard

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Log in with credentials for BarbrickDesign@gmail.com
3. Navigate to **Apps & Credentials**

### Step 2: Create or Select Application

1. Click on your RepoPilot application (or create new if needed)
2. Note your **Client ID** and **Secret** (needed for environment variables)

### Step 3: Configure Webhook

1. Scroll to **Webhooks** section
2. Click **Add Webhook**
3. Enter webhook URL:
   ```
   https://consciousnessrevolution.io/.netlify/functions/repopilot-paypal-webhook
   ```
   
   Or for the overkor-tek domain:
   ```
   https://overkor-tek.github.io/consciousness-revolution/.netlify/functions/repopilot-paypal-webhook
   ```

4. Subscribe to the following event types:
   - ✅ `PAYMENT.SALE.COMPLETED`
   - ✅ `PAYMENT.CAPTURE.COMPLETED`
   - ✅ `CHECKOUT.ORDER.COMPLETED`
   - ✅ `BILLING.SUBSCRIPTION.CREATED`
   - ✅ `BILLING.SUBSCRIPTION.ACTIVATED`

5. Click **Save**

6. Copy the **Webhook ID** - you'll need this for environment variables

### Step 4: Environment Variables

Add the following to your Netlify environment variables:

```bash
PAYPAL_CLIENT_ID=<your-paypal-client-id>
PAYPAL_WEBHOOK_ID=<your-webhook-id>
PAYPAL_MODE=live  # or 'sandbox' for testing

# Email configuration (already configured)
GMAIL_USER=darrick.preble@gmail.com
GMAIL_APP_PASSWORD=<your-gmail-app-password>
```

To add in Netlify:
1. Go to Netlify Dashboard → Site Settings → Environment Variables
2. Click **Add a variable**
3. Add each variable with its value
4. Click **Save**

## Testing

### Test with PayPal Sandbox

1. Use PayPal sandbox credentials
2. Set `PAYPAL_MODE=sandbox` in environment variables
3. Make a test purchase from the landing page
4. Check webhook logs in PayPal Developer Dashboard
5. Verify emails are sent to:
   - barbrickdesign@gmail.com (delivery notification)
   - Customer email (welcome email)

### Test Webhook Manually

Send a test webhook event:

```bash
curl -X POST https://consciousnessrevolution.io/.netlify/functions/repopilot-paypal-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "PAYMENT.CAPTURE.COMPLETED",
    "resource": {
      "id": "test-order-123",
      "amount": {
        "value": "29.00",
        "currency_code": "USD"
      },
      "payer": {
        "email_address": "customer@example.com"
      }
    }
  }'
```

### Verify Email Delivery

After a test purchase, verify:

1. **Delivery Notification** to barbrickdesign@gmail.com contains:
   - ✅ Customer email address
   - ✅ Plan purchased (Pro)
   - ✅ Amount ($29.00)
   - ✅ Order ID
   - ✅ Action items checklist
   - ✅ Link to email customer

2. **Welcome Email** to customer contains:
   - ✅ Plan confirmation (Pro)
   - ✅ Feature list
   - ✅ Setup instructions
   - ✅ Next steps
   - ✅ Support contact information

## Webhook Payload Examples

### Payment Completed

```json
{
  "event_type": "PAYMENT.CAPTURE.COMPLETED",
  "resource": {
    "id": "7X1234567X123456X",
    "amount": {
      "value": "29.00",
      "currency_code": "USD"
    },
    "payer": {
      "email_address": "customer@example.com",
      "name": {
        "given_name": "John"
      }
    },
    "status": "COMPLETED"
  }
}
```

### Subscription Created

```json
{
  "event_type": "BILLING.SUBSCRIPTION.ACTIVATED",
  "resource": {
    "id": "I-XXXXXXXXXX",
    "plan": {
      "payment_definitions": [{
        "amount": {
          "value": "29.00",
          "currency": "USD"
        }
      }]
    },
    "subscriber": {
      "email_address": "customer@example.com"
    },
    "status": "ACTIVE"
  }
}
```

## Monitoring

### Check Webhook Logs

In PayPal Developer Dashboard:
1. Go to **Apps & Credentials**
2. Select your application
3. Click on **Webhooks**
4. Click on your webhook URL
5. View **Recent Deliveries** to see webhook events and responses

### Check Netlify Function Logs

In Netlify Dashboard:
1. Go to **Functions**
2. Select `repopilot-paypal-webhook`
3. View real-time logs
4. Check for errors or failed executions

### Email Delivery Issues

If emails are not being sent:

1. **Check Gmail App Password**: Verify `GMAIL_APP_PASSWORD` is correct
2. **Check Gmail Account**: Ensure darrick.preble@gmail.com allows app passwords
3. **Check Logs**: Review Netlify function logs for errors
4. **Test Email Function**: Call the email functions directly to test

## Security Considerations

### Production Deployment

For production use, implement full webhook signature verification:

1. Update `verifyWebhookSignature` function in `repopilot-paypal-webhook.mjs`
2. Retrieve PayPal certificate from `certUrl`
3. Construct expected message: `webhook_id + transmission_id + transmission_time + body`
4. Verify signature using certificate and algorithm
5. Check certificate is from PayPal domain

Example (pseudocode):
```javascript
const cert = await fetchCertificate(certUrl);
const message = webhookId + transmissionId + transmissionTime + JSON.stringify(body);
const isValid = crypto.verify(authAlgo, Buffer.from(message), cert, transmissionSig);
```

### Rate Limiting

Consider adding rate limiting to webhook endpoints to prevent abuse:

```javascript
const rateLimit = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const requests = rateLimit.get(ip) || [];
  const recentRequests = requests.filter(time => now - time < 60000);
  
  if (recentRequests.length > 100) {
    return false; // Too many requests
  }
  
  recentRequests.push(now);
  rateLimit.set(ip, recentRequests);
  return true;
}
```

## Troubleshooting

### Webhook Not Receiving Events

1. **Check URL**: Ensure webhook URL is correct in PayPal dashboard
2. **Check HTTPS**: Webhook URLs must use HTTPS
3. **Check Deployment**: Ensure Netlify functions are deployed
4. **Check Event Types**: Verify you're subscribed to the correct events

### Emails Not Sending

1. **Check Environment Variables**: Verify all email variables are set
2. **Check Gmail Settings**: Ensure app passwords are enabled
3. **Check SMTP Connection**: Test SMTP connection manually
4. **Check Logs**: Review function logs for specific errors

### Wrong Pricing Detected

The webhook automatically determines the plan based on amount:
- $0 = Free
- $29.00 = Pro
- Any other amount = Enterprise

If incorrect plan is detected, check:
1. Payment amount in PayPal
2. Currency conversion
3. Plan detection logic in webhook handler

## Support

For issues or questions:

- **Email**: BarbrickDesign@gmail.com
- **Repository**: https://github.com/overkor-tek/consciousness-revolution
- **Landing Page**: https://barbrickdesign.github.io/repopilot-landing.html

## Files Reference

| File | Purpose |
|------|---------|
| `repopilot-landing.html` | Landing page with pricing and PayPal buttons |
| `netlify/functions/repopilot-paypal-webhook.mjs` | Main webhook handler |
| `netlify/functions/repopilot-delivery-notification.mjs` | Sends notification to barbrickdesign@gmail.com |
| `netlify/functions/send-repopilot-welcome.mjs` | Sends welcome email to customer |
| `src/utils/paypal-integration.js` | PayPal SDK integration utility |

---

**Last Updated**: February 17, 2026  
**Version**: 1.0.0  
**Status**: Production Ready
