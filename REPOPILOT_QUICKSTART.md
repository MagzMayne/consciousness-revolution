# RepoPilot Quick Start Guide

## For Customers

### How to Purchase RepoPilot

1. **Visit the Landing Page**
   ```
   https://barbrickdesign.github.io/repopilot-landing.html
   ```

2. **Choose Your Plan**
   - **Free**: $0/month - Try basic features
   - **Pro**: $29/month - Full access with priority support
   - **Enterprise**: Custom - For large teams

3. **Click Subscribe**
   - For Pro: Click "Subscribe to Pro" button
   - Enter your email when prompted
   - Complete PayPal payment

4. **Check Your Email**
   - Welcome email arrives within minutes
   - Contains setup instructions
   - Includes GitHub App installation link

5. **Start Using RepoPilot**
   - Install RepoPilot GitHub App
   - Connect your repositories
   - Start getting AI-powered assistance

## For Admin (barbrickdesign@gmail.com)

### When a Purchase is Made

You'll receive an email with:

```
Subject: 🚀 RepoPilot Pro Purchase - Immediate Action Required

Order Details:
- Plan: Pro
- Customer Email: customer@example.com
- Amount: $29.00
- Order ID: 7X1234567X123456X
- Timestamp: 2026-02-17 10:30:45

Required Actions:
1. Send Access Credentials
2. Provide Setup Guide
3. Activate Subscription
4. Schedule Onboarding (for Pro/Enterprise)
5. Add to CRM
```

### Action Checklist

#### Immediate (Within 1 hour)

- [ ] Send API keys and GitHub App installation link
- [ ] Send quick-start documentation
- [ ] Enable Pro plan features in admin dashboard

#### Within 24 hours (Pro/Enterprise only)

- [ ] Schedule onboarding call
- [ ] Add customer to CRM
- [ ] Set up billing cycle

#### Optional

- [ ] Send welcome video
- [ ] Add to Discord/Slack community
- [ ] Schedule follow-up check-in

### Quick Links

**Email Customer**:
```
mailto:customer@example.com?subject=Welcome%20to%20RepoPilot%20Pro
```

**Admin Dashboard** (TODO - create if needed):
```
https://barbrickdesign.github.io/repopilot-admin.html
```

**Support Email**:
```
BarbrickDesign@gmail.com
```

## Testing Guide

### Test with PayPal Sandbox

1. **Set Environment Variable**
   ```bash
   PAYPAL_MODE=sandbox
   ```

2. **Use Test Credentials**
   - Buyer: sb-buyer@personal.example.com
   - Password: (from PayPal sandbox)

3. **Make Test Purchase**
   - Visit landing page
   - Click "Subscribe to Pro"
   - Enter sandbox buyer email
   - Complete payment with sandbox account

4. **Verify Emails**
   - Check barbrickdesign@gmail.com for delivery notification
   - Check sandbox buyer email for welcome message

### Test Webhook Manually

```bash
curl -X POST http://localhost:8888/.netlify/functions/repopilot-paypal-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "PAYMENT.CAPTURE.COMPLETED",
    "resource": {
      "id": "test-123",
      "amount": {"value": "29.00", "currency_code": "USD"},
      "payer": {"email_address": "test@example.com"}
    }
  }'
```

## Troubleshooting

### Customer Didn't Receive Welcome Email

1. Check spam/junk folder
2. Verify email in Netlify function logs
3. Check Gmail SMTP credentials
4. Resend manually if needed

### Admin Didn't Receive Notification

1. Check Netlify function logs
2. Verify BarbrickDesign@gmail.com in delivery function
3. Check Gmail app password
4. Verify PayPal webhook is firing

### PayPal Button Not Showing

1. Check browser console for errors
2. Verify PayPal SDK loaded
3. Check client ID configuration
4. Try fallback button

### Wrong Price Detected

1. Check PayPal payment amount
2. Verify currency conversion
3. Check plan detection logic in webhook
4. Contact PayPal support if recurring

## FAQ

**Q: How long does delivery take?**  
A: Automated emails send within 1-2 minutes of payment. Manual setup (API keys, etc.) within 1 hour.

**Q: Can customers upgrade/downgrade?**  
A: Yes, via PayPal subscription management or contact support.

**Q: Is there a refund policy?**  
A: Contact BarbrickDesign@gmail.com within 30 days.

**Q: How are subscriptions managed?**  
A: Through PayPal's subscription management system.

**Q: What if the webhook fails?**  
A: PayPal will retry. Also check Netlify function logs and manually process if needed.

## Support

- **Email**: BarbrickDesign@gmail.com
- **Landing Page**: https://barbrickdesign.github.io/repopilot-landing.html
- **Documentation**: REPOPILOT_WEBHOOK_SETUP.md
- **GitHub**: https://github.com/overkor-tek/consciousness-revolution

---

**Last Updated**: February 17, 2026  
**Version**: 1.0.0
