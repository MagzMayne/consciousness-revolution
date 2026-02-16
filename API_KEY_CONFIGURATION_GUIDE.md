# API Key Configuration Guide

## Overview

This guide provides comprehensive instructions for securely configuring API keys across all BarbrickDesign services.

## Table of Contents

1. [Security Best Practices](#security-best-practices)
2. [Environment Setup](#environment-setup)
3. [Service-Specific Configuration](#service-specific-configuration)
4. [API Key Validation](#api-key-validation)
5. [Troubleshooting](#troubleshooting)

## Security Best Practices

### ✅ DO

- **Use Environment Variables**: Store API keys in `.env` files (never commit to version control)
- **Validate Before Use**: Always validate API keys before making requests
- **Use HTTPS**: Only transmit API keys over secure connections
- **Rotate Regularly**: Change API keys periodically
- **Minimal Permissions**: Use keys with the least privileges necessary
- **Monitor Usage**: Track API key usage for suspicious activity

### ❌ DON'T

- **Never Hardcode**: Don't put API keys directly in source code
- **Don't Commit**: Never commit `.env` files or keys to git
- **Don't Log**: Don't log API keys in console or error messages
- **Don't Share**: Don't share API keys in public channels
- **Don't Use in URLs**: Avoid passing keys in URL parameters

## Environment Setup

### Step 1: Copy Environment Template

```bash
cp .env.example .env
```

### Step 2: Configure Your Keys

Edit `.env` with your actual API keys:

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# SAM.gov Configuration
SAMGOV_API_KEY=your-samgov-api-key-here

# GitHub Configuration
GITHUB_TOKEN=ghp_your-github-token-here

# PayPal Configuration
PAYPAL_CLIENT_ID=your-paypal-client-id-here
PAYPAL_SECRET=your-paypal-secret-here
PAYPAL_MODE=sandbox  # or 'live' for production

# Blockchain APIs
ETHERSCAN_API_KEY=your-etherscan-api-key-here
INFURA_PROJECT_ID=your-infura-project-id-here
ALCHEMY_API_KEY=your-alchemy-api-key-here

# Additional Services
COINGECKO_API_KEY=CG-your-coingecko-api-key-here
BLOCKCYPHER_TOKEN=your-blockcypher-token-here
```

### Step 3: Verify Configuration

Use the validation utility to verify your keys:

```javascript
const validator = new ApiKeyValidator();

// Validate OpenAI key
const openaiResult = validator.validate(process.env.OPENAI_API_KEY, 'openai');
if (!openaiResult.valid) {
    console.error('Invalid OpenAI key:', openaiResult.error);
}

// Validate SAM.gov key
const samgovResult = validator.validate(process.env.SAMGOV_API_KEY, 'samgov');
if (!samgovResult.valid) {
    console.error('Invalid SAM.gov key:', samgovResult.error);
}
```

## Service-Specific Configuration

### OpenAI API

**Where to Get**: https://platform.openai.com/api-keys

**Format**: `sk-` followed by 40+ alphanumeric characters

**Example Usage**:
```javascript
const orchestrator = new OpenAIOrchestrator();
const result = orchestrator.setApiKey(process.env.OPENAI_API_KEY);

if (!result.success) {
    console.error('Failed to set OpenAI key:', result.error);
}
```

**Features**:
- GPT models (text generation)
- DALL-E (image generation)
- Sora (video generation - when available)
- Embeddings
- Whisper (audio transcription)

### SAM.gov API

**Where to Get**: https://open.gsa.gov/api/get-opportunities-public-api/

**Requirements**: Free registration required

**Example Usage**:
```javascript
const samgov = new SAMGovIntegration({ 
    apiKey: process.env.SAMGOV_API_KEY 
});

// Search for contracts
const contracts = await samgov.searchContracts('cybersecurity');
```

**Features**:
- Government contract opportunities
- Historical contract data
- Contract valuation
- NAICS code mapping

### GitHub Personal Access Token

**Where to Get**: https://github.com/settings/tokens

**Required Scopes**:
- `repo` - Full control of private repositories
- `workflow` - Update GitHub Action workflows
- `notifications` - Access notifications

**Example Usage**:
```javascript
const prAgent = new GitHubPRReviewAgent(logger, {
    githubToken: process.env.GITHUB_TOKEN,
    owner: 'barbrickdesign',
    repo: 'barbrickdesign.github.io'
});
```

**Features**:
- Auto PR review
- Workflow monitoring
- Issue management

### PayPal Payout API

**Where to Get**: 
- Sandbox: https://developer.paypal.com/dashboard/applications/sandbox
- Live: https://developer.paypal.com/dashboard/applications/live

**Requirements**: Business account required for payouts

**Example Usage**:
```javascript
const paymentService = new AFactoryPaymentAutomation({
    paypalClientId: process.env.PAYPAL_CLIENT_ID,
    paypalSecret: process.env.PAYPAL_SECRET,
    paypalMode: process.env.PAYPAL_MODE || 'sandbox'
});
```

**Features**:
- Automated payouts
- Revenue tracking
- Transaction logging
- Webhook handling

### Etherscan API

**Where to Get**: https://etherscan.io/apis

**Free Tier**: 5 calls/second

**Example Usage**:
```javascript
const etherscanKey = process.env.ETHERSCAN_API_KEY;
const url = `https://api.etherscan.io/api?module=account&action=balance&address=${address}&apikey=${etherscanKey}`;
```

**Features**:
- Wallet balance lookup
- Transaction history
- Smart contract verification
- Gas price estimation

### Infura Project ID

**Where to Get**: https://infura.io/dashboard

**Free Tier**: 100,000 requests/day

**Example Usage**:
```javascript
const provider = new ethers.JsonRpcProvider(
    `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
);
```

**Features**:
- Ethereum JSON-RPC access
- IPFS gateway
- Multi-chain support

## API Key Validation

### Using the Centralized Validator

The `ApiKeyValidator` utility provides validation for all supported services:

```javascript
// Import the validator
const validator = new ApiKeyValidator();

// Validate any API key
const result = validator.validate(apiKey, 'openai');

if (result.valid) {
    console.log('✅ API key is valid');
    if (result.warnings) {
        console.warn('Warnings:', result.warnings);
    }
} else {
    console.error('❌ Invalid API key:', result.error);
}
```

### Supported Services

- `openai` - OpenAI API keys
- `samgov` - SAM.gov API keys
- `github` - GitHub Personal Access Tokens
- `paypal` - PayPal API credentials
- `etherscan` - Etherscan API keys
- `infura` - Infura Project IDs
- `coingecko` - CoinGecko API keys
- `generic` - Generic API key validation

### Secure Storage

```javascript
// Store API key securely (session only)
validator.storeApiKey('openai', apiKey, false);

// Retrieve API key
const key = validator.getApiKey({
    service: 'openai',
    envVar: 'OPENAI_API_KEY',
    allowStorage: true
});

// Clear stored key
validator.clearApiKey('openai');
```

### Masking Keys

```javascript
// Mask key for display
const masked = validator.maskApiKey(apiKey);
console.log('Using key:', masked); // Output: sk-****...xyz
```

## Fallback Mechanisms

All services are designed to work with graceful degradation when API keys are not available:

### OpenAI Orchestrator
```javascript
// Returns mock responses when no API key is set
const orchestrator = new OpenAIOrchestrator();
// Mock responses will include clear indication that they're simulated
```

### SAM.gov Integration
```javascript
// Falls back to demo data when no API key
const samgov = new SAMGovIntegration();
const contracts = await samgov.searchContracts('software');
// Console will warn: "⚠️ Using demo contract data"
```

### BankSky
```javascript
// Provides demo mode with limited functionality
// User can enter their own API keys via UI
```

## Troubleshooting

### Problem: "API key is required" Error

**Solution**: 
1. Check that `.env` file exists and has the correct key
2. Verify environment variable is loaded: `console.log(process.env.OPENAI_API_KEY)`
3. Restart your application after adding environment variables

### Problem: "Invalid API key format" Error

**Solution**:
1. Verify the key is copied correctly (no extra spaces)
2. Check that the key hasn't expired
3. Use the validator to get specific format requirements:
   ```javascript
   const result = validator.validate(yourKey, 'openai');
   console.log(result.error); // Shows specific format issue
   ```

### Problem: "Authentication failed" Error

**Solution**:
1. Verify the API key is active on the provider's dashboard
2. Check that your account has required permissions
3. For GitHub: Ensure token has correct scopes
4. For PayPal: Verify you're using the right mode (sandbox/live)

### Problem: Rate Limit Exceeded

**Solution**:
1. Implement request throttling
2. Upgrade to a paid tier for higher limits
3. Cache responses when possible
4. Use batch requests where supported

### Problem: API Key Exposed in Code

**Solution**:
1. Run the exposure detector:
   ```javascript
   const result = validator.detectExposedKeys(yourCodeString);
   if (result.exposed) {
       console.error('⚠️ Exposed keys found:', result.locations);
   }
   ```
2. Immediately revoke exposed keys
3. Generate new keys
4. Review git history for accidental commits

## Testing

### Demo Mode

Most services support demo mode for testing without API keys:

```javascript
// OpenAI - returns mock responses
const orchestrator = new OpenAIOrchestrator();

// SAM.gov - returns sample contract data
const samgov = new SAMGovIntegration();

// BankSky - has dedicated demo mode button
```

### Development vs Production

```javascript
// Use different keys for development and production
const apiKey = process.env.NODE_ENV === 'production'
    ? process.env.OPENAI_API_KEY_PROD
    : process.env.OPENAI_API_KEY_DEV;
```

## Security Checklist

Before deploying to production:

- [ ] All API keys are in environment variables
- [ ] `.env` file is in `.gitignore`
- [ ] No API keys in source code
- [ ] All API keys are validated before use
- [ ] Error messages don't expose keys
- [ ] Keys have minimal required permissions
- [ ] Rate limiting is implemented
- [ ] Monitoring is set up for unusual activity
- [ ] Keys are rotated regularly
- [ ] Team members have unique keys (no sharing)

## Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [SAM.gov API Documentation](https://open.gsa.gov/api/get-opportunities-public-api/)
- [GitHub API Documentation](https://docs.github.com/en/rest)
- [PayPal API Documentation](https://developer.paypal.com/docs/api/overview/)
- [Etherscan API Documentation](https://docs.etherscan.io/)

## Support

For issues or questions about API key configuration:
1. Check this guide
2. Review `API_KEY_SECURITY_AUDIT.md`
3. Check service-specific documentation
4. Contact the development team

---

**Last Updated**: 2025-12-30
**Version**: 1.0.0
