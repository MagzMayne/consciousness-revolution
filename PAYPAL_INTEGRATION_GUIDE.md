---
layout: default
title: PAYPAL INTEGRATION GUIDE
---

# PayPal Integration System Guide

## Overview

This repository includes a comprehensive PayPal integration system that automatically deploys payment processing capabilities across all HTML pages. The system uses GitHub secrets for secure configuration and provides a centralized, consistent payment experience.

**New Feature:** The system now includes a **fallback PayPal configuration** that allows the integration to work even when the primary CLIENT_ID is not configured. This ensures payments can be processed using a backup configuration while the primary credentials are being set up.

## Architecture

### Components

1. **PayPal Integration Script** (`src/utils/paypal-integration.js`)
   - Centralized PayPal SDK wrapper
   - Automatic initialization with fallback support
   - Easy-to-use API for payment buttons
   - Configuration via GitHub secrets with automatic fallback

2. **Deployment Agent** (`src/agents/paypal-deployment-agent.js`)
   - Browser-based deployment simulation
   - Tracking and reporting
   - Status monitoring

3. **Deployment Script** (`deploy-paypal-integration.js`)
   - Node.js command-line tool
   - Automated injection into HTML files
   - Secret replacement
   - Comprehensive logging

## GitHub Secrets Configuration

### Required Secrets

Add the following secrets to your GitHub repository:

1. **PAYPAL_CLIENT_ID** (Optional with fallback)
   - Your PayPal application client ID
   - Get this from PayPal Developer Dashboard
   - Example: `AeXYZ123...`
   - **Note:** If not configured, the system will automatically use a fallback configuration

2. **PAYPAL_API** (Optional)
   - Your PayPal API endpoint (if using custom backend)
   - Example: `https://api.yourdomain.com/paypal`

### Fallback Configuration

The PayPal integration includes a built-in fallback configuration that activates automatically when `PAYPAL_CLIENT_ID` is not set. This fallback uses:
- Fallback Client ID: Pre-configured for hosted buttons
- Components: `hosted-buttons`
- Enable Funding: `venmo`
- Currency: `USD`

This ensures the payment system remains functional even during initial setup or configuration issues.

### Setting Up Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add `PAYPAL_CLIENT_ID` with your PayPal client ID
5. (Optional) Add `PAYPAL_API` with your API endpoint

## Deployment

### Automatic Deployment

The system can be deployed automatically via GitHub Actions or manually via command line.

#### GitHub Actions (Recommended)

Create `.github/workflows/deploy-paypal.yml`:

```yaml
name: Deploy PayPal Integration

on:
  workflow_dispatch:  # Manual trigger
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Deploy PayPal Integration
        env:
          PAYPAL_CLIENT_ID: ${{ secrets.PAYPAL_CLIENT_ID }}
          PAYPAL_API: ${{ secrets.PAYPAL_API }}
        run: node deploy-paypal-integration.js
      
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add .
          git commit -m "Deploy PayPal integration" || echo "No changes to commit"
          git push
```

### Manual Deployment

#### Using Node.js

```bash
# Set environment variables
export PAYPAL_CLIENT_ID="your_client_id_here"
export PAYPAL_API="your_api_endpoint_here"  # Optional

# Run deployment script
node deploy-paypal-integration.js
```

#### Dry Run (Preview Changes)

```bash
# Preview what would be changed without making actual changes
export DRY_RUN=true
export PAYPAL_CLIENT_ID="your_client_id_here"
node deploy-paypal-integration.js
```

## Usage in HTML Pages

### Automatic Integration

After deployment, all HTML pages will automatically include the PayPal integration script.

### Using PayPal Integration

#### Basic Payment Button

```html
<!-- Add a container for the PayPal button -->
<div id="paypal-button-container"></div>

<script>
  // Render PayPal button when page loads
  PayPalIntegration.renderButton('paypal-button-container', {
    amount: 99.99,
    description: 'Product purchase',
    onSuccess: function(data) {
      console.log('Payment successful!', data);
      alert('Payment completed! Order ID: ' + data.orderID);
    },
    onError: function(err) {
      console.error('Payment error:', err);
      alert('Payment failed. Please try again.');
    },
    onCancel: function(data) {
      console.log('Payment cancelled', data);
      alert('Payment cancelled');
    }
  });
</script>
```

#### Dynamic Amount

```html
<div>
  <label>Amount: $<input type="number" id="amount" value="50" min="1"></label>
  <button onclick="updatePayPalButton()">Update</button>
</div>
<div id="paypal-button-container"></div>

<script>
  function updatePayPalButton() {
    const amount = parseFloat(document.getElementById('amount').value);
    
    PayPalIntegration.renderButton('paypal-button-container', {
      amount: amount,
      description: 'Custom amount payment',
      onSuccess: (data) => console.log('Success', data),
      onError: (err) => console.error('Error', err)
    });
  }
  
  // Initial render
  updatePayPalButton();
</script>
```

#### Checking Configuration

```javascript
// Check if PayPal is available
if (PayPalIntegration.isAvailable()) {
  console.log('PayPal is configured and ready');
} else {
  console.log('PayPal is not configured');
}

// Get configuration info
const config = PayPalIntegration.getConfig();
console.log('PayPal config:', config);

// Check if using fallback configuration
if (config.usingFallback) {
  console.log('Using fallback PayPal configuration');
  // You may want to display a message to admins
} else {
  console.log('Using primary PayPal configuration');
}
```

## API Reference

### PayPalIntegration.init()

Initialize PayPal SDK. Called automatically on page load.

**Returns:** `Promise` - Resolves when SDK is loaded

```javascript
await PayPalIntegration.init();
```

### PayPalIntegration.renderButton(containerId, options)

Render a PayPal payment button.

**Parameters:**
- `containerId` (string) - ID of container element
- `options` (object):
  - `amount` (number) - Payment amount
  - `description` (string) - Payment description
  - `onSuccess` (function) - Success callback
  - `onError` (function) - Error callback
  - `onCancel` (function) - Cancel callback

**Returns:** `Promise`

```javascript
PayPalIntegration.renderButton('container-id', {
  amount: 100.00,
  description: 'Product purchase',
  onSuccess: (data) => { /* handle success */ },
  onError: (err) => { /* handle error */ },
  onCancel: (data) => { /* handle cancel */ }
});
```

### PayPalIntegration.createOrder(orderData)

Create a PayPal order via API (requires PAYPAL_API configuration).

**Parameters:**
- `orderData` (object) - Order data

**Returns:** `Promise<object>` - Order response

```javascript
const order = await PayPalIntegration.createOrder({
  amount: 100.00,
  description: 'Product purchase'
});
```

### PayPalIntegration.captureOrder(orderId)

Capture a PayPal order via API (requires PAYPAL_API configuration).

**Parameters:**
- `orderId` (string) - Order ID

**Returns:** `Promise<object>` - Capture response

```javascript
const result = await PayPalIntegration.captureOrder('ORDER-123');
```

### PayPalIntegration.isAvailable()

Check if PayPal is configured and available.

**Returns:** `boolean`

```javascript
if (PayPalIntegration.isAvailable()) {
  // PayPal is ready
}
```

### PayPalIntegration.getConfig()

Get current configuration (without sensitive data).

**Returns:** `object`

```javascript
const config = PayPalIntegration.getConfig();
// { currency: 'USD', intent: 'capture', isAvailable: true, ... }
```

## Deployment Agent

For programmatic deployment and monitoring:

```javascript
// Create deployment agent
const agent = new PayPalDeploymentAgent(clientId, apiEndpoint);

// Simulate deployment
const { report, results } = await agent.simulateDeployment(htmlFiles);

// Get status
const status = agent.getStatus();

// Export log
const log = agent.exportLog();
```

## Troubleshooting

### PayPal button not appearing

1. Check browser console for errors
2. Verify CLIENT_ID is configured: `PayPalIntegration.getConfig()`
3. Ensure container element exists before calling `renderButton()`
4. Check if fallback is being used: Look for "Using fallback PayPal configuration" in console

### Using Fallback Configuration

If you see "Using fallback PayPal configuration" in the console:

1. This is normal if `PAYPAL_CLIENT_ID` is not set in GitHub secrets
2. The system will work with the fallback configuration for hosted buttons
3. For production use, set up your own `PAYPAL_CLIENT_ID`:
   - Go to GitHub repository settings
   - Navigate to Secrets and variables → Actions
   - Add `PAYPAL_CLIENT_ID` secret
   - Re-run deployment script
4. The fallback provides basic functionality but your own CLIENT_ID is recommended for production

### "PayPal CLIENT_ID not configured" error (Legacy)

1. Verify GitHub secret `PAYPAL_CLIENT_ID` is set
2. Re-run deployment script
3. Check that secret replacement occurred in `src/utils/paypal-integration.js`

### Payment not capturing

1. Verify PayPal account is set up correctly
2. Check that CLIENT_ID is for the correct environment (sandbox vs. live)
3. Ensure `onApprove` callback is properly handling the capture

## Security Best Practices

1. **Never commit secrets** to the repository
2. **Use environment variables** or GitHub secrets for all sensitive data
3. **Validate all payments server-side** if using PAYPAL_API
4. **Use HTTPS** for all pages with PayPal integration
5. **Keep PayPal SDK updated** by monitoring PayPal's documentation

## Agent Instructions

All agents working on this repository should:

1. **Preserve PayPal integration** - Do not remove or modify PayPal script tags
2. **Use PayPalIntegration API** - For any payment features, use the centralized API
3. **Update documentation** - If adding payment features, document usage here
4. **Test thoroughly** - Verify PayPal integration after making changes
5. **Check configuration** - Ensure secrets are properly configured before deployment

## Maintenance

### Updating Integration

To update the PayPal integration:

1. Modify `src/utils/paypal-integration.js`
2. Test changes locally
3. Re-run deployment script
4. Verify all pages work correctly

### Adding New Features

1. Add features to `src/utils/paypal-integration.js`
2. Update this documentation
3. Test on sample pages
4. Deploy to all pages

## Support

For issues or questions:

1. Check this documentation
2. Review PayPal Developer Documentation: https://developer.paypal.com/
3. Check deployment logs: `paypal-deployment-log.json`
4. Review browser console for client-side errors

## Version History

- **v1.0.0** (2025-12-19) - Initial PayPal integration system
  - Centralized integration script
  - Automated deployment
  - GitHub secrets support
  - Comprehensive documentation
