# Instructions for All Agents - PayPal Integration

## CRITICAL: Read This Before Making Changes

This repository has a **centralized PayPal integration system** that must be preserved and respected by all agents.

## PayPal Integration Overview

- **Location**: `src/utils/paypal-integration.js`
- **Configuration**: Uses GitHub secrets `PAYPAL_CLIENT_ID` and `PAYPAL_API`
- **Deployment**: All HTML pages include PayPal integration automatically
- **Script Tags**: Present in all HTML files before `</body>` or `</html>`

## Rules for All Agents

### ✅ DO

1. **Preserve PayPal Integration**
   - Keep all PayPal script tags intact
   - Do not remove or modify the PayPal integration script inclusion
   - Maintain references to `/src/utils/paypal-integration.js`

2. **Use the Centralized API**
   ```javascript
   // CORRECT: Use PayPalIntegration API
   PayPalIntegration.renderButton('container-id', {
     amount: 100.00,
     description: 'Payment',
     onSuccess: (data) => { /* handle */ },
     onError: (err) => { /* handle */ }
   });
   ```

3. **Check Configuration**
   ```javascript
   // CORRECT: Check if PayPal is available
   if (PayPalIntegration.isAvailable()) {
     // Render payment UI
   }
   ```

4. **Update Documentation**
   - If you add payment features, document them in `PAYPAL_INTEGRATION_GUIDE.md`
   - Update this file if you change how agents should interact with PayPal

### ❌ DON'T

1. **Don't Remove PayPal Script Tags**
   ```html
   <!-- DON'T REMOVE THIS -->
   <script src="/src/utils/paypal-integration.js"></script>
   ```

2. **Don't Add Duplicate PayPal SDK**
   ```html
   <!-- DON'T DO THIS - SDK is already included -->
   <script src="https://www.paypal.com/sdk/js?client-id=..."></script>
   ```

3. **Don't Hardcode Client IDs**
   ```javascript
   // DON'T DO THIS
   const CLIENT_ID = "ABC123..."; // Hardcoded secret
   
   // DO THIS INSTEAD
   // Use PayPalIntegration.init() which reads from configuration
   ```

4. **Don't Create Alternative Payment Systems**
   - Use the centralized PayPalIntegration API
   - Don't create separate PayPal implementations
   - Don't add competing payment systems without approval

## Common Tasks

### Adding Payment to a New Page

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Page</title>
</head>
<body>
  <h1>Product Page</h1>
  
  <!-- Add payment button container -->
  <div id="paypal-button-container"></div>
  
  <!-- PayPal integration is automatically included -->
  <script>
    // Use PayPalIntegration API
    PayPalIntegration.renderButton('paypal-button-container', {
      amount: 99.99,
      description: 'Product purchase',
      onSuccess: function(data) {
        console.log('Payment successful', data);
      }
    });
  </script>
</body>
</html>
```

### Checking If PayPal Is Configured

```javascript
// Before rendering payment UI
if (PayPalIntegration.isAvailable()) {
  // PayPal is configured - show payment options
  document.getElementById('payment-section').style.display = 'block';
} else {
  // PayPal not configured - show alternative or message
  console.warn('PayPal not configured');
}
```

### Getting Payment Configuration

```javascript
const config = PayPalIntegration.getConfig();
console.log('Currency:', config.currency);
console.log('Available:', config.isAvailable);
console.log('Initialized:', config.isInitialized);
```

## Deployment Agent Tasks

If you're a deployment agent:

1. **After deploying changes**, verify PayPal integration:
   ```bash
   grep -r "paypal-integration.js" --include="*.html" | wc -l
   ```

2. **Check configuration**:
   ```bash
   grep "PAYPAL_CLIENT_ID" src/utils/paypal-integration.js
   ```

3. **Run deployment** (if needed):
   ```bash
   export PAYPAL_CLIENT_ID="from_github_secrets"
   node deploy-paypal-integration.js
   ```

## Documentation Agent Tasks

If you're a documentation agent:

1. **Keep docs updated**:
   - `PAYPAL_INTEGRATION_GUIDE.md` - User-facing guide
   - `AGENT_PAYPAL_INSTRUCTIONS.md` - This file (agent instructions)
   - `AGENT_SYSTEM_GUIDE.md` - System overview

2. **Document new features**:
   - Add examples to `PAYPAL_INTEGRATION_GUIDE.md`
   - Update API reference if methods change
   - Include troubleshooting tips

## Testing Agent Tasks

If you're a testing agent:

1. **Test PayPal availability**:
   ```javascript
   console.assert(typeof PayPalIntegration !== 'undefined', 'PayPalIntegration not loaded');
   console.assert(PayPalIntegration.isAvailable(), 'PayPal not configured');
   ```

2. **Test button rendering** (in test environment):
   ```javascript
   const container = document.createElement('div');
   container.id = 'test-paypal-button';
   document.body.appendChild(container);
   
   await PayPalIntegration.renderButton('test-paypal-button', {
     amount: 1.00,
     description: 'Test payment',
     onSuccess: () => console.log('Test success'),
     onError: () => console.log('Test error')
   });
   ```

3. **Verify integration across pages**:
   - Check that script is included in all HTML files
   - Verify no duplicate PayPal SDK loads
   - Test that configuration is consistent

## Security Agent Tasks

If you're a security agent:

1. **Verify secrets are not exposed**:
   ```bash
   # Should NOT find hardcoded client IDs
   grep -r "client-id=\"[A-Za-z0-9]" --include="*.html" --include="*.js"
   ```

2. **Check for secure connections**:
   - All PayPal requests use HTTPS
   - Secrets are loaded from environment variables
   - No sensitive data in logs

3. **Audit PayPal integration**:
   - Verify CLIENT_ID comes from GitHub secrets
   - Check that API endpoints are secure
   - Ensure no client-side secret exposure

## Monitoring Agent Tasks

If you're a monitoring agent:

1. **Track PayPal errors**:
   ```javascript
   // Monitor console for PayPal errors
   const originalError = console.error;
   console.error = function(...args) {
     if (args.some(arg => String(arg).includes('PayPal'))) {
       // Log PayPal-related errors
     }
     originalError.apply(console, args);
   };
   ```

2. **Monitor integration health**:
   - Check if PayPalIntegration loads successfully
   - Track button rendering success rate
   - Monitor payment completion rate

## GitHub Secrets

All agents must respect that PayPal configuration comes from GitHub secrets:

- **PAYPAL_CLIENT_ID**: Set in GitHub repository secrets
- **PAYPAL_API**: Optional, set in GitHub repository secrets

**Never**:
- Hardcode these values
- Log these values
- Expose these in client-side code
- Commit these to the repository

## Troubleshooting

### PayPal Integration Not Working

1. Check if script is loaded:
   ```javascript
   console.log(typeof PayPalIntegration);  // Should be 'object'
   ```

2. Check configuration:
   ```javascript
   console.log(PayPalIntegration.getConfig());
   ```

3. Check for errors:
   ```javascript
   // Open browser console and look for errors
   ```

4. Verify deployment:
   ```bash
   node deploy-paypal-integration.js
   ```

### Duplicate PayPal SDK Loads

If you see multiple PayPal SDK loads:

1. Search for duplicate script tags:
   ```bash
   grep -n "paypal.com/sdk/js" file.html
   ```

2. Remove duplicates, keep only:
   ```html
   <script src="/src/utils/paypal-integration.js"></script>
   ```

## Questions?

- **User Guide**: See `PAYPAL_INTEGRATION_GUIDE.md`
- **System Architecture**: See `AGENT_SYSTEM_GUIDE.md`
- **Deployment**: See `deploy-paypal-integration.js`
- **API Reference**: See `PAYPAL_INTEGRATION_GUIDE.md` API section

## Summary

**As an agent, your primary responsibilities are:**

1. ✅ **PRESERVE** the PayPal integration in all files
2. ✅ **USE** the centralized `PayPalIntegration` API
3. ✅ **RESPECT** GitHub secrets for configuration
4. ✅ **DOCUMENT** any changes you make
5. ✅ **TEST** that PayPal still works after your changes

**Never:**
- ❌ Remove PayPal script tags
- ❌ Hardcode secrets
- ❌ Create duplicate integrations
- ❌ Expose sensitive configuration

---

**Last Updated**: December 19, 2025  
**Version**: 1.0.0
