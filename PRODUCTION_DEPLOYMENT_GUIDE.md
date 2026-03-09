# RepoPilot IP Protection - Production Deployment Guide

This guide walks you through deploying the RepoPilot License Server to production and configuring all required services.

---

## Overview

The RepoPilot IP Protection system consists of:
1. **License Server** (Cloudflare Workers) - Validates licenses and processes payments
2. **License Validator** (Client-side) - Enforces protection mechanisms
3. **Security Monitor** (Backend Daemon) - Monitors for violations
4. **Email Service** - Sends license keys to customers
5. **PayPal Integration** - Processes payments

---

## Prerequisites

Before starting, ensure you have:

- [ ] Cloudflare account (free tier is sufficient)
- [ ] PayPal Business account with Developer access
- [ ] Email service account (SendGrid, Mailgun, or AWS SES)
- [ ] Node.js 18+ installed
- [ ] Git repository access
- [ ] Command line access

---

## Step 1: Setup Cloudflare Workers

### 1.1 Install Wrangler CLI

```bash
npm install -g wrangler
```

### 1.2 Login to Cloudflare

```bash
wrangler login
```

This will open a browser window for authentication.

### 1.3 Create KV Namespace

```bash
# Create production namespace
wrangler kv:namespace create "REPOPILOT_LICENSES"

# Create preview namespace (for testing)
wrangler kv:namespace create "REPOPILOT_LICENSES" --preview
```

**Output Example:**
```
🌀 Creating namespace with title "repopilot-license-server-REPOPILOT_LICENSES"
✨ Success!
Add the following to your wrangler.toml:
[[kv_namespaces]]
binding = "REPOPILOT_LICENSES"
id = "abc123xyz456"
```

### 1.4 Update wrangler.toml

Copy the namespace IDs from the output and update `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "REPOPILOT_LICENSES"
id = "abc123xyz456"  # Replace with your actual ID
preview_id = "def456ghi789"  # Replace with your preview ID
```

---

## Step 2: Configure Secrets

Set environment secrets using Wrangler:

### 2.1 PayPal Webhook Secret

```bash
wrangler secret put PAYPAL_WEBHOOK_SECRET
# Enter your PayPal webhook secret when prompted
```

To get your PayPal webhook secret:
1. Go to https://developer.paypal.com/dashboard/
2. Select your app
3. Click "Webhooks" in the sidebar
4. Create a new webhook (we'll set the URL later)
5. Copy the webhook ID - this is your secret

### 2.2 Secret Salt

```bash
wrangler secret put SECRET_SALT
# Enter a long random string (minimum 32 characters)
```

Generate a secure random string:
```bash
# On Linux/Mac:
openssl rand -hex 32

# Or use any password generator
```

### 2.3 Email Service API Key

Choose ONE email service:

**Option A: SendGrid**
```bash
wrangler secret put SENDGRID_API_KEY
# Enter your SendGrid API key
```

Get SendGrid API key:
1. Sign up at https://sendgrid.com/
2. Go to Settings > API Keys
3. Create a new API key with "Mail Send" permissions

**Option B: Mailgun**
```bash
wrangler secret put MAILGUN_API_KEY
# Enter your Mailgun API key

wrangler secret put MAILGUN_DOMAIN
# Enter your Mailgun domain
```

Get Mailgun credentials:
1. Sign up at https://www.mailgun.com/
2. Go to Sending > Domains
3. Add and verify your domain
4. Copy API key from Settings > API Keys

---

## Step 3: Deploy License Server

### 3.1 Deploy to Cloudflare Workers

```bash
# Run the deployment script
./deploy-license-server.sh

# Or manually:
wrangler deploy
```

**Expected Output:**
```
✨ Built successfully
✨ Successfully published your script to
 https://repopilot-license-server.your-subdomain.workers.dev
```

### 3.2 Test Deployment

```bash
# Test health endpoint
curl https://repopilot-license-server.your-subdomain.workers.dev/

# Expected response:
{
  "service": "RepoPilot License Server",
  "version": "1.0.0",
  "endpoints": {
    "validate": "POST /api/validate",
    "webhook": "POST /api/webhook/paypal"
  }
}
```

### 3.3 Update License Validator

Update `repopilot-license-validator.js` with your Worker URL:

```javascript
// Line 20
const LICENSE_SERVER_URL = 'https://repopilot-license-server.your-subdomain.workers.dev';
```

Replace `your-subdomain` with your actual Cloudflare Workers subdomain.

---

## Step 4: Configure PayPal Webhooks

### 4.1 Create Webhook in PayPal Dashboard

1. Go to https://developer.paypal.com/dashboard/
2. Select your app (or create one)
3. Click "Webhooks" in the left sidebar
4. Click "Add Webhook"

**Webhook Settings:**
- **Webhook URL**: `https://repopilot-license-server.your-subdomain.workers.dev/api/webhook/paypal`
- **Event types**: Select:
  - ✅ Payment capture completed (`PAYMENT.CAPTURE.COMPLETED`)
  - ✅ Payment capture denied (`PAYMENT.CAPTURE.DENIED`)
  - ✅ Payment capture refunded (`PAYMENT.CAPTURE.REFUNDED`)

5. Click "Save"
6. Copy the Webhook ID - this was already set as `PAYPAL_WEBHOOK_SECRET`

### 4.2 Test Webhook

PayPal provides a webhook simulator:

1. In the webhook details, click "Simulator"
2. Select "Payment capture completed"
3. Click "Send Test"
4. Check your Worker logs: `wrangler tail`

---

## Step 5: Configure Email Service

### 5.1 Update License Server Email Function

Edit `backend/repopilot-license-server.js` to uncomment the email service integration:

**For SendGrid (lines 266-285):**

```javascript
async function sendLicenseEmail(email, licenseKey, tier) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email }],
        subject: 'Your RepoPilot License Key'
      }],
      from: { 
        email: 'noreply@barbrickdesign.com',
        name: 'RepoPilot License System'
      },
      content: [{
        type: 'text/html',
        value: `
          <h2>Your RepoPilot ${tier.toUpperCase()} License</h2>
          <p>Thank you for your purchase!</p>
          <p><strong>Your License Key:</strong></p>
          <pre style="background:#f4f4f4;padding:15px;border-radius:5px;font-size:16px;">${licenseKey}</pre>
          <p>Add this to your GitHub repository secrets as <code>REPOPILOT_LICENSE</code></p>
          <h3>Next Steps:</h3>
          <ol>
            <li>Go to your GitHub repository</li>
            <li>Navigate to Settings > Secrets and variables > Actions</li>
            <li>Click "New repository secret"</li>
            <li>Name: <code>REPOPILOT_LICENSE</code></li>
            <li>Value: Your license key above</li>
          </ol>
          <p>Need help? Contact us at <a href="mailto:BarbrickDesign@gmail.com">BarbrickDesign@gmail.com</a></p>
          <p>© 2008-2026 Barbrick Design. All rights reserved.</p>
        `
      }]
    })
  });
  
  if (!response.ok) {
    console.error('Failed to send email:', await response.text());
  }
}
```

### 5.2 Redeploy After Email Changes

```bash
wrangler deploy
```

### 5.3 Test Email Delivery

Test by manually calling the webhook endpoint with a test payload:

```bash
curl -X POST https://repopilot-license-server.your-subdomain.workers.dev/api/webhook/paypal \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "PAYMENT.CAPTURE.COMPLETED",
    "resource": {
      "id": "TEST-PAYMENT-ID",
      "amount": {"value": "49"},
      "payer": {"email_address": "your-test-email@example.com"}
    }
  }'
```

Check your email inbox for the license key.

---

## Step 6: Start Security Monitor

### 6.1 Install Dependencies

```bash
cd backend
npm install
```

### 6.2 Create Systemd Service (Linux)

Create `/etc/systemd/system/repopilot-security-monitor.service`:

```ini
[Unit]
Description=RepoPilot Security Monitor
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/barbrickdesign.github.io/backend
ExecStart=/usr/bin/node repopilot-security-monitor.js
Restart=always
RestartSec=10
StandardOutput=append:/var/log/repopilot-security.log
StandardError=append:/var/log/repopilot-security-error.log

Environment="GITHUB_TOKEN=your_github_token_here"
Environment="SECURITY_ALERT_EMAIL=BarbrickDesign@gmail.com"

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable repopilot-security-monitor
sudo systemctl start repopilot-security-monitor
sudo systemctl status repopilot-security-monitor
```

### 6.3 Or Run with PM2 (Cross-platform)

```bash
# Install PM2 globally
npm install -g pm2

# Start security monitor
pm2 start backend/repopilot-security-monitor.js --name repopilot-security

# Enable startup on boot
pm2 startup
pm2 save

# View logs
pm2 logs repopilot-security

# Monitor
pm2 monit
```

---

## Step 7: Final Testing

### 7.1 Test License Validation

Open browser console on any page with the license validator:

```javascript
// Test invalid license (should fail)
await window.RepoPilotLicense.validateLicense('RP000-00000-00000-00000-00000', 'test@example.com');

// Expected: {success: false, error: "Invalid license key"}
```

### 7.2 Test Payment Flow

1. Create a test PayPal payment:
   - Go to PayPal Sandbox: https://developer.paypal.com/dashboard/
   - Use test buyer account
   - Complete a $49 test payment

2. Webhook should trigger automatically

3. Check your email for license key

4. Test the license key:
```javascript
await window.RepoPilotLicense.validateLicense('YOUR-LICENSE-KEY', 'your-email@example.com');

// Expected: {success: true, tier: "full", features: [...]}
```

### 7.3 Verify Security Monitor

Check security monitor is running:

```bash
# If using systemd:
sudo systemctl status repopilot-security-monitor

# If using PM2:
pm2 status repopilot-security

# Check logs:
tail -f /var/log/repopilot-security.log
# or
pm2 logs repopilot-security
```

### 7.4 Test Protection Mechanisms

On `repopilot-landing.html`:

- [ ] Right-click disabled
- [ ] Text selection blocked on protected elements
- [ ] Keyboard shortcuts (Ctrl+C, F12) blocked
- [ ] Watermark visible in bottom-right
- [ ] Console shows copyright warnings
- [ ] DevTools detection working

---

## Step 8: Production Checklist

Before going live, verify:

### Cloudflare Workers
- [ ] License server deployed to production
- [ ] KV namespace created and configured
- [ ] Secrets set (PAYPAL_WEBHOOK_SECRET, SECRET_SALT, email API key)
- [ ] Worker URL added to LICENSE_SERVER_URL in validator

### PayPal
- [ ] Webhook configured with correct URL
- [ ] Webhook events selected (PAYMENT.CAPTURE.COMPLETED)
- [ ] PayPal in LIVE mode (not sandbox)
- [ ] Test payment completed successfully

### Email Service
- [ ] Email service API key configured
- [ ] From email verified and whitelisted
- [ ] Test email sent and received
- [ ] Email template formatted correctly

### Security Monitor
- [ ] Security monitor running as daemon/service
- [ ] GitHub token configured with correct permissions
- [ ] Alert email configured (BarbrickDesign@gmail.com)
- [ ] Logs rotating properly
- [ ] File integrity monitoring active

### License Validator
- [ ] LICENSE_SERVER_URL updated to production
- [ ] Protection mechanisms tested and working
- [ ] Hardware ID binding working
- [ ] Periodic validation working (hourly checks)

### Documentation
- [ ] README updated with production URLs
- [ ] Support email configured
- [ ] License tiers documented
- [ ] Refund policy documented

---

## Step 9: Monitoring and Maintenance

### 9.1 Monitor Worker Logs

```bash
# Live tail logs
wrangler tail

# View specific requests
wrangler tail --format pretty
```

### 9.2 Monitor Security Events

```bash
# View security log
tail -f /var/log/repopilot-security.log

# Or with PM2
pm2 logs repopilot-security --lines 100
```

### 9.3 Check KV Storage

```bash
# List all license keys
wrangler kv:key list --namespace-id=YOUR_KV_ID

# Get specific license
wrangler kv:key get "LICENSE_KEY" --namespace-id=YOUR_KV_ID

# Count licenses
wrangler kv:key list --namespace-id=YOUR_KV_ID | jq 'length'
```

### 9.4 Weekly Maintenance Tasks

- [ ] Review security monitor logs
- [ ] Check license activation rate
- [ ] Verify PayPal webhooks are being received
- [ ] Test email delivery
- [ ] Review GitHub for unauthorized copies
- [ ] Update protection mechanisms if needed

---

## Troubleshooting

### Issue: License validation fails

**Check:**
1. Worker is deployed: `wrangler whoami` then `wrangler deployments list`
2. LICENSE_SERVER_URL is correct in validator
3. CORS is enabled in Worker (already configured)
4. KV namespace is accessible

**Debug:**
```bash
wrangler tail --format pretty
```

### Issue: PayPal webhook not received

**Check:**
1. Webhook URL is correct in PayPal dashboard
2. Webhook is active (not disabled)
3. PAYPAL_WEBHOOK_SECRET matches PayPal webhook ID
4. View Worker logs: `wrangler tail`

**Test webhook manually:**
```bash
curl -X POST YOUR_WORKER_URL/api/webhook/paypal \
  -H "Content-Type: application/json" \
  -d '{"event_type":"PAYMENT.CAPTURE.COMPLETED","resource":{"id":"TEST","amount":{"value":"49"},"payer":{"email_address":"test@example.com"}}}'
```

### Issue: Email not sending

**Check:**
1. Email service API key is set: `wrangler secret list`
2. From email is verified with email service
3. Check Worker logs for email errors
4. Test email service API directly

**SendGrid Debug:**
```bash
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"personalizations":[{"to":[{"email":"test@example.com"}]}],"from":{"email":"noreply@barbrickdesign.com"},"subject":"Test","content":[{"type":"text/plain","value":"Test"}]}'
```

### Issue: Security monitor not starting

**Check:**
1. Node.js version: `node --version` (must be 16+)
2. Dependencies installed: `cd backend && npm install`
3. GitHub token is valid
4. Logs directory exists and is writable

**Debug:**
```bash
# Run directly to see errors
node backend/repopilot-security-monitor.js
```

---

## Support

For issues or questions:

- **Email**: BarbrickDesign@gmail.com
- **Subject**: "RepoPilot Production Support"
- **Repository Issues**: https://github.com/barbrickdesign/barbrickdesign.github.io/issues

---

## Production URLs

After deployment, update these URLs in your documentation:

- **License Server**: `https://repopilot-license-server.YOUR-SUBDOMAIN.workers.dev`
- **PayPal Webhook**: `https://repopilot-license-server.YOUR-SUBDOMAIN.workers.dev/api/webhook/paypal`
- **License Validation**: `POST https://repopilot-license-server.YOUR-SUBDOMAIN.workers.dev/api/validate`

---

## Security Best Practices

1. **Never commit secrets** to version control
2. **Rotate secrets** every 90 days
3. **Monitor logs** daily for suspicious activity
4. **Keep dependencies updated**: `npm update` regularly
5. **Review security monitor reports** weekly
6. **Backup KV data** monthly
7. **Test disaster recovery** quarterly

---

**Last Updated**: February 17, 2026  
**Version**: 1.0  
**Author**: Ryan Barbrick (Barbrick Design)

© 2008-2026 Ryan Barbrick. All Rights Reserved.
