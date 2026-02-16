# Pickem PayPal Setup Guide

## Overview

This guide explains how to configure PayPal for the Pickem lottery pick system. The system accepts payments of $0.25 per pick and automatically issues credits for generating unique lottery numbers.

## Prerequisites

1. A PayPal Business or Developer account
2. Access to GitHub repository secrets
3. Basic understanding of PayPal API

## Step 1: Get PayPal Client ID

### Option A: Using PayPal Developer Dashboard (Sandbox - Testing)

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Log in with your PayPal account
3. Navigate to **Apps & Credentials**
4. Select **Sandbox** tab for testing
5. Click **Create App**
6. Enter app name (e.g., "Pickem Lottery")
7. Copy the **Client ID** (starts with something like `AXXxxXxXxXxXx...`)

### Option B: Using PayPal Business Account (Live - Production)

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Log in with your PayPal Business account
3. Navigate to **Apps & Credentials**
4. Select **Live** tab for production
5. Create or select an existing app
6. Copy the **Live Client ID**

**Important**: Start with Sandbox for testing, then switch to Live when ready for production.

## Step 2: Configure GitHub Repository Secrets

1. Go to your GitHub repository: `barbrickdesign/barbrickdesign.github.io`
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secret:
   - **Name**: `PAYPAL_CLIENT_ID`
   - **Value**: Your PayPal Client ID from Step 1
5. Click **Add secret**

### Optional: Custom API Endpoint

If you have a backend API for payment processing:

1. Add another secret:
   - **Name**: `PAYPAL_API`
   - **Value**: Your API endpoint URL (e.g., `https://api.yourdomain.com/paypal`)

## Step 3: Deploy PayPal Integration

### Option A: Automatic Deployment via GitHub Actions

The system will automatically deploy when you push changes. The PayPal integration is already set up.

### Option B: Manual Deployment (if deployment script is available)

Run the deployment script locally:

```bash
# Set environment variables
export PAYPAL_CLIENT_ID="your_client_id_from_step_1"
export PAYPAL_API="your_api_endpoint"  # Optional

# Run deployment
node deploy-paypal-integration.js
```

### Option C: Manual Configuration (Alternative)

If the deployment script is not available, manually update the PayPal integration:

1. Open `/src/utils/paypal-integration.js`
2. Find the line: `CLIENT_ID: '{{PAYPAL_CLIENT_ID}}'`
3. Replace with: `CLIENT_ID: 'your_actual_client_id_here'`
4. If using custom API, also replace: `API_ENDPOINT: '{{PAYPAL_API}}'`
5. Commit and push changes
6. GitHub Pages will automatically redeploy

### Option D: Dry Run (Preview Changes)

To preview what will be changed without actually making changes (requires deployment script):

```bash
export DRY_RUN=true
export PAYPAL_CLIENT_ID="your_client_id_here"
node deploy-paypal-integration.js
```

## Step 4: Verify Configuration

After deployment, verify the integration:

1. Navigate to: `https://barbrickdesign.github.io/pickEm.html`
2. You should see a PayPal button (not the warning message)
3. The status should show "PayPal payment system active"

You can also test the configuration at: `https://barbrickdesign.github.io/test-paypal-config.html`

## Step 5: Test Payment Flow

### Sandbox Testing (Recommended First)

1. Use Sandbox Client ID in GitHub secrets
2. Go to [PayPal Sandbox Accounts](https://developer.paypal.com/dashboard/accounts)
3. Create test buyer account (or use existing)
4. Test payment with sandbox credentials
5. Verify credits are added after successful payment

### Live Testing

1. Use Live Client ID in GitHub secrets
2. Redeploy the integration
3. Make a real $0.25 payment
4. Verify credits are added
5. Generate picks to test full flow

## How It Works

### Payment Flow

```
User selects quantity → PayPal button appears → User clicks PayPal button →
PayPal checkout opens → User approves payment → Payment captured →
Credits added to user account → User can generate picks
```

### Credit System

- **Cost**: $0.25 per pick
- **Payment**: Processed through PayPal
- **Credits**: Issued immediately upon successful payment
- **Usage**: 1 credit = 1 unique lottery pick

### Payment Details

- **Merchant**: barbrickdesign@gmail.com
- **Currency**: USD
- **Intent**: Capture (immediate)
- **Security**: All payments processed securely through PayPal

## Troubleshooting

### PayPal Button Not Showing

**Problem**: Warning message "⚠️ PayPal not configured" appears

**Solutions**:
1. Verify `PAYPAL_CLIENT_ID` is set in GitHub secrets
2. Re-run deployment script: `node deploy-paypal-integration.js`
3. Check browser console for errors
4. Verify the secret is correct (no extra spaces)

### Payment Not Working

**Problem**: Payment fails or doesn't complete

**Solutions**:
1. Check if using correct environment (Sandbox vs Live)
2. Verify Client ID matches the environment
3. Check browser console for PayPal errors
4. Ensure JavaScript is enabled
5. Try different browser

### Credits Not Added

**Problem**: Payment successful but no credits added

**Solutions**:
1. Check browser console for errors
2. Verify the `onApprove` callback is executing
3. Check activity log on the page
4. Refresh the page and check credit count

### Integration Not Available

**Problem**: `PayPalIntegration is not defined` error

**Solutions**:
1. Verify `/src/utils/paypal-integration.js` exists
2. Check that script tag is present in HTML
3. Re-run deployment script
4. Clear browser cache

## Security Best Practices

1. **Never commit secrets** to the repository
2. **Use Sandbox first** for all testing
3. **Validate payments server-side** (if using custom API)
4. **Use HTTPS** for all pages with PayPal
5. **Monitor transactions** regularly
6. **Keep Client ID secure** - it's public but treat it carefully
7. **Never expose Client Secret** - this is not needed for client-side integration

## File Structure

```
barbrickdesign.github.io/
├── pickEm.html                          # Main page with PayPal integration
├── src/
│   └── utils/
│       └── paypal-integration.js        # Centralized PayPal integration
├── deploy-paypal-integration.js         # Deployment script
├── PAYPAL_INTEGRATION_GUIDE.md          # User guide
├── AGENT_PAYPAL_INSTRUCTIONS.md         # Agent instructions
└── PICKEM_PAYPAL_SETUP.md              # This file
```

## Configuration Files

### Environment Variables

- `PAYPAL_CLIENT_ID`: Your PayPal Client ID (required)
- `PAYPAL_API`: Your custom API endpoint (optional)
- `DRY_RUN`: Set to `true` for dry run mode (optional)

### GitHub Secrets

- `PAYPAL_CLIENT_ID`: Set in repository settings

## Support Resources

- **PayPal Developer Docs**: https://developer.paypal.com/docs/
- **PayPal Button Integration**: https://developer.paypal.com/docs/checkout/
- **Repository Guide**: See `PAYPAL_INTEGRATION_GUIDE.md`
- **Agent Instructions**: See `AGENT_PAYPAL_INSTRUCTIONS.md`

## Production Checklist

Before going live:

- [ ] Tested thoroughly in Sandbox environment
- [ ] Obtained Live PayPal Client ID
- [ ] Updated GitHub secret with Live Client ID
- [ ] Re-deployed integration with Live credentials
- [ ] Tested end-to-end payment flow
- [ ] Verified credits are added correctly
- [ ] Tested pick generation with credits
- [ ] Monitored for any errors
- [ ] Verified HTTPS is enabled
- [ ] Set up transaction monitoring
- [ ] Documented any custom configurations

## Maintenance

### Updating Client ID

If you need to change the Client ID:

1. Update the GitHub secret `PAYPAL_CLIENT_ID`
2. Re-run deployment: `node deploy-paypal-integration.js`
3. Verify configuration at test page
4. Test payment flow

### Monitoring

Regularly check:
- PayPal transaction history
- Browser console for errors
- User feedback on payment issues
- Credit issuance accuracy

### Updates

The PayPal SDK is loaded dynamically from PayPal's CDN and is always up to date. No manual updates needed.

## Contact

For issues or questions:
- Check documentation in this repository
- Review PayPal Developer documentation
- Check browser console for detailed errors
- Review deployment logs: `paypal-deployment-log.json`

---

**Last Updated**: December 20, 2025
**Version**: 1.0.0
