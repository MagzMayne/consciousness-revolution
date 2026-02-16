# PayPal Integration Deployment

## Overview

This document explains how to deploy the PayPal integration system across all HTML pages in the repository.

## Quick Start

### Prerequisites

- Node.js 14+ installed
- GitHub secrets configured:
  - `PAYPAL_CLIENT_ID` (required)
  - `PAYPAL_API` (optional)

### Deploy Locally

```bash
# Set environment variables
export PAYPAL_CLIENT_ID="your_paypal_client_id"
export PAYPAL_API="your_paypal_api_endpoint"  # Optional

# Run deployment
node deploy-paypal-integration.js
```

### Deploy via GitHub Actions

1. Go to your repository on GitHub
2. Navigate to **Actions** → **Deploy PayPal Integration**
3. Click **Run workflow**
4. Choose dry-run mode (optional)
5. Click **Run workflow** button

## Configuration

### GitHub Secrets

Set these secrets in your GitHub repository:

1. **PAYPAL_CLIENT_ID** (Required)
   - Your PayPal application client ID
   - Get from: PayPal Developer Dashboard → My Apps & Credentials
   - Example: `AeXYZ123abc...`

2. **PAYPAL_API** (Optional)
   - Your custom PayPal API endpoint
   - Only needed if using a custom backend
   - Example: `https://api.yourdomain.com/paypal`

### Environment Variables

For local deployment, set these environment variables:

```bash
export PAYPAL_CLIENT_ID="your_client_id"
export PAYPAL_API="your_api_endpoint"  # Optional
export DRY_RUN="true"  # Optional, for testing
```

## Deployment Script

### What It Does

The `deploy-paypal-integration.js` script:

1. ✅ Finds all HTML files in the repository
2. ✅ Checks if each file already has PayPal integration
3. ✅ Injects PayPal integration script tag before `</body>` or `</html>`
4. ✅ Updates the integration script with actual CLIENT_ID and API endpoint
5. ✅ Generates a comprehensive deployment log
6. ✅ Reports statistics (total, injected, skipped, failed)

### Exclusions

The script automatically excludes:

- `node_modules/` directory
- `.git/` directory
- `dist/` and `build/` directories
- `ember-terminal-main/` directory
- `deploy-paypal-integration.js` itself

### Dry Run Mode

Test deployment without making changes:

```bash
export DRY_RUN=true
export PAYPAL_CLIENT_ID="test_id"
node deploy-paypal-integration.js
```

This will:
- Show what files would be modified
- Generate deployment log
- Not make any actual changes

## Deployment Report

After deployment, check the report:

```bash
# View deployment statistics
cat paypal-deployment-log.json | jq '.statistics'

# View full log
cat paypal-deployment-log.json | jq '.'
```

### Report Structure

```json
{
  "timestamp": "2025-12-19T...",
  "config": {
    "dryRun": false,
    "clientIdConfigured": true,
    "apiEndpointConfigured": true
  },
  "statistics": {
    "total": 339,
    "processed": 339,
    "injected": 328,
    "updated": 1,
    "skipped": 8,
    "failed": 0,
    "alreadyIntegrated": 3
  },
  "log": [...]
}
```

## Integration Script

### Location

`src/utils/paypal-integration.js`

### What Gets Injected

Each HTML page gets this code before `</body>`:

```html
<!-- PayPal Integration -->
<script src="/src/utils/paypal-integration.js"></script>
<script>
  // PayPal integration is available via PayPalIntegration object
  // Example: PayPalIntegration.renderButton('paypal-button-container', {
  //   amount: 100.00,
  //   description: 'Product purchase',
  //   onSuccess: (data) => console.log('Success', data),
  //   onError: (err) => console.error('Error', err)
  // });
</script>
```

### Secret Replacement

The deployment script replaces placeholders in `src/utils/paypal-integration.js`:

- `{{PAYPAL_CLIENT_ID}}` → actual CLIENT_ID
- `{{PAYPAL_API}}` → actual API endpoint

## Verification

### Check Deployed Files

```bash
# Count files with PayPal integration
grep -l "paypal-integration.js" *.html | wc -l

# View injected code in a file
tail -20 index.html
```

### Test Integration

1. Open `paypal-integration-test.html` in a browser
2. Check configuration status
3. Try rendering a payment button
4. Verify logs show proper initialization

## Troubleshooting

### "PayPal CLIENT_ID not configured"

**Problem**: CLIENT_ID placeholder not replaced

**Solution**:
1. Verify `PAYPAL_CLIENT_ID` secret is set in GitHub
2. Re-run deployment script
3. Check `src/utils/paypal-integration.js` for placeholder

### "No suitable injection point found"

**Problem**: HTML file missing `</body>` or `</html>` tag

**Solution**: File is skipped automatically - not a valid HTML document

### Files Not Updated

**Problem**: Some files show as "already integrated"

**Solution**: This is correct - files that already have PayPal integration are skipped to avoid duplicates

### Deployment Failed

**Problem**: Script exits with error

**Solution**:
1. Check Node.js version (requires 14+)
2. Verify write permissions
3. Check deployment log for specific errors

## Maintenance

### Re-deploy

To update all pages with new configuration:

```bash
# Update secrets in GitHub
# Then re-run deployment
node deploy-paypal-integration.js
```

### Remove Integration

To remove PayPal integration (not recommended):

```bash
# Find and remove PayPal script tags
find . -name "*.html" -exec sed -i '/PayPal Integration/,+10d' {} \;
```

### Update Integration Script

To update the integration script:

1. Edit `src/utils/paypal-integration.js`
2. Test locally
3. Re-run deployment (files with integration won't be updated)
4. If needed, remove integration first, then re-deploy

## GitHub Actions Workflow

### Manual Trigger

1. Go to **Actions** tab
2. Select **Deploy PayPal Integration**
3. Click **Run workflow**
4. Select options:
   - Dry run: Yes/No
5. Click **Run workflow**

### Workflow Features

- ✅ Automatic deployment
- ✅ Dry-run support
- ✅ Automatic commit and push
- ✅ Deployment log artifact
- ✅ Summary in workflow output

### Workflow Logs

View deployment results:

1. Go to workflow run
2. Check **Summary** section for statistics
3. Download **paypal-deployment-log** artifact

## Best Practices

### Before Deployment

1. ✅ Test in dry-run mode first
2. ✅ Verify CLIENT_ID is correct
3. ✅ Backup repository (commit current state)
4. ✅ Review exclusion list

### During Deployment

1. ✅ Monitor deployment output
2. ✅ Check for errors
3. ✅ Verify statistics

### After Deployment

1. ✅ Review deployment log
2. ✅ Test integration on sample pages
3. ✅ Commit changes with descriptive message
4. ✅ Verify on live site

## Security

### Secret Management

- ❌ Never commit CLIENT_ID to repository
- ✅ Always use GitHub secrets or environment variables
- ❌ Never log CLIENT_ID in deployment logs
- ✅ Use HTTPS for all PayPal requests

### Access Control

- Restrict who can run GitHub Actions workflow
- Use repository protection rules
- Review changes before merging

## Support

### Documentation

- **User Guide**: `PAYPAL_INTEGRATION_GUIDE.md`
- **Agent Instructions**: `AGENT_PAYPAL_INSTRUCTIONS.md`
- **System Guide**: `AGENT_SYSTEM_GUIDE.md`

### Testing

- **Test Page**: `paypal-integration-test.html`
- **Browser Console**: Check for errors
- **Network Tab**: Verify SDK loads

### Getting Help

1. Check deployment log: `paypal-deployment-log.json`
2. Review error messages
3. Check PayPal Developer documentation
4. Test with `paypal-integration-test.html`

## Version History

### v1.0.0 (2025-12-19)

- Initial deployment system
- Automated GitHub Actions workflow
- Comprehensive logging
- Dry-run support
- Secret management
- 328 files deployed successfully

## License

Part of barbrickdesign.github.io repository.
