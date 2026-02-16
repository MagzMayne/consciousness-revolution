# API Connection Testing and Automation Guide

## Overview

This guide describes the comprehensive API connection testing and automation system for the BarbrickDesign platform. The system ensures all API connections are properly configured, tested, and automatically healed when issues occur.

## Table of Contents

1. [Features](#features)
2. [Quick Start](#quick-start)
3. [Testing API Connections](#testing-api-connections)
4. [Automated Setup](#automated-setup)
5. [Health Monitoring](#health-monitoring)
6. [Auto-Healing](#auto-healing)
7. [Supported APIs](#supported-apis)
8. [Troubleshooting](#troubleshooting)

## Features

### ✅ Comprehensive Testing
- Tests all 8 API services (OpenAI, Anthropic, SAM.gov, GitHub, PayPal, Etherscan, CoinGecko, Infura)
- Validates API key formats
- Tests connection health
- Verifies fallback mechanisms
- Checks retry and backoff logic

### 🔧 Automated Setup
- Interactive wizard for configuring API keys
- Automatic `.env` file generation
- API key format validation
- Connection testing after setup
- `.gitignore` management

### 📊 Health Monitoring
- Continuous monitoring of all API connections
- Real-time health scores
- Connection quality metrics
- Performance tracking
- Failure detection

### 🔄 Auto-Healing
- Automatic detection of failing connections
- Intelligent healing strategies
- Exponential backoff for retries
- Integration with self-healing system
- Success/failure tracking

## Quick Start

### 1. Test Your Current API Connections

```bash
# Run the API connection test suite
npm run test:api

# Or use the full command
node test-api-connections.js
```

This will:
- Check if all required files exist
- Verify environment configuration
- Test each API connection
- Validate fallback mechanisms
- Generate recommendations

### 2. Set Up API Keys (Interactive)

```bash
# Run the interactive setup wizard
npm run setup:api

# Or use the full command
node setup-api-keys.js
```

The wizard will:
- Guide you through configuring each API service
- Validate API key formats
- Generate a `.env` file
- Add `.env` to `.gitignore`
- Optionally test connections

### 3. Enable Health Monitoring (Browser)

Add to your HTML file:

```html
<!-- Load API Connection Manager -->
<script src="js/api-connection-auto-inject.js"></script>

<!-- Load Health Monitor -->
<script src="api-health-monitor.js"></script>
```

Or load it programmatically:

```javascript
// The health monitor auto-starts on page load
// View the dashboard:
apiHealthMonitor.dashboard();
```

## Testing API Connections

### Running Tests

The test suite performs comprehensive checks on all API connections:

```bash
# Basic test
npm run test:api

# The test checks:
# 1. API Connection Manager infrastructure
# 2. Environment configuration
# 3. Individual API connections
# 4. Fallback mechanisms
# 5. Auto-healing capabilities
# 6. Setup recommendations
```

### Test Output

The test suite provides color-coded output:
- ✅ **Green**: Test passed
- ❌ **Red**: Test failed
- ⚠️ **Yellow**: Warning (non-critical issue)
- ℹ️ **Cyan**: Information

Example output:

```
🧪 API Connection Testing Suite

📋 Test 1: API Connection Manager Infrastructure
✅ src/ai/api-connection-manager.js exists
✅ src/utils/api-key-validator.js exists
✅ js/api-connection-auto-inject.js exists
✅ api-connection-test.html exists
✅ All API Connection Manager files present

📋 Test 2: Environment Configuration
✅ .env file exists
✅ OpenAI API key configured
✅ GitHub API key configured
ℹ️  SAM.gov API key not configured (optional)

📋 Test 3: API Connection Tests
✅ OpenAI: API key format valid
✅ GitHub: API key format valid
ℹ️  SAM.gov: No API key (will use fallback)
⚠️  PayPal: No API key configured

📊 Test Summary
Total Tests:    20
✅ Passed:       16
❌ Failed:       0
⚠️  Warnings:     4
Pass Rate:      80%

🎉 All critical tests passed!
```

### Understanding Test Results

- **Passed**: The test succeeded
- **Failed**: Critical issue that needs attention
- **Warning**: Optional feature not configured or minor issue

## Automated Setup

### Interactive Setup Wizard

The setup wizard guides you through configuring all API services:

```bash
npm run setup:api
```

#### Setup Process

1. **Welcome**: Introduction to the wizard
2. **Confirmation**: Checks if `.env` already exists
3. **Service Configuration**: For each service:
   - Service description
   - Link to get API key
   - Expected format
   - API key input
   - Format validation
4. **File Generation**: Creates `.env` file
5. **Git Protection**: Adds `.env` to `.gitignore`
6. **Connection Testing**: Optional test of configured services

#### Example Session

```
🔧 API Key Setup Wizard

ℹ️  This wizard will help you configure API keys for all services.
ℹ️  You can skip any service by pressing Enter without typing anything.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OpenAI
Description: GPT models, DALL-E, Whisper
Get your key: https://platform.openai.com/api-keys
Expected format: sk-...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Enter OpenAI API key (or press Enter to skip): sk-proj-...
✅ OpenAI API key validated and saved

[... continues for each service ...]

ℹ️  Generating .env file...
✅ .env file created successfully
✅ Added .env to .gitignore

Would you like to test the connections now? (Y/n): y

[... runs connection tests ...]

✨ Setup complete! Your API keys have been configured.
```

### Manual Configuration

Alternatively, you can manually edit the `.env` file:

```bash
# Copy the example
cp .env.example .env

# Edit with your favorite editor
nano .env
# or
vim .env
# or
code .env
```

Then add your API keys:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your-actual-key-here

# GitHub Configuration
GITHUB_TOKEN=ghp_your-actual-token-here

# SAM.gov Configuration
SAMGOV_API_KEY=your-actual-key-here

# ... etc
```

## Health Monitoring

### Overview

The API Health Monitor continuously checks all API connections and provides real-time status updates.

### Starting the Monitor

The monitor auto-starts when included in your page:

```html
<script src="api-health-monitor.js"></script>
```

Or start/stop manually:

```javascript
// Start monitoring
apiHealthMonitor.start();

// Stop monitoring
apiHealthMonitor.stop();

// Manual health check
apiHealthMonitor.check();
```

### Viewing the Dashboard

```javascript
// Show health dashboard in console
apiHealthMonitor.dashboard();

// Get health report (programmatic)
const report = apiHealthMonitor.report();
console.log(report);
```

### Dashboard Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 API Connection Health Dashboard
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Last Check: 2025-12-31T13:45:30.123Z
Monitoring: ✅ Active
Total Checks: 15
Healing Attempts: 2 (1 successful)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ OpenAI
   Status: HEALTHY
   Health Score: 100%
   Success/Failure: 15/0
   Avg Response: 234ms

🟡 SAM.gov
   Status: FALLBACK
   Health Score: 70%
   Success/Failure: 10/0

❌ PayPal
   Status: UNHEALTHY
   Health Score: 45%
   Success/Failure: 5/10
   🔧 Currently healing...
   Last Failure: 12/31/2025, 1:43:15 PM

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Health Metrics

Each service tracks:
- **Status**: healthy, fallback, unhealthy, disconnected, not_configured
- **Health Score**: 0-100% based on success rate
- **Success/Failure Count**: Total successes and failures
- **Average Response Time**: Performance metric
- **Last Success/Failure**: Timestamp of last event

### Monitoring Interval

Default: 60 seconds

To change:

```javascript
// Access the state
const state = apiHealthMonitor.getState();
state.checkInterval = 30000; // 30 seconds

// Restart monitoring with new interval
apiHealthMonitor.stop();
apiHealthMonitor.start();
```

## Auto-Healing

### Overview

The auto-healing system automatically detects and attempts to fix failing API connections.

### How It Works

1. **Detection**: Monitor detects service failure (3+ consecutive failures)
2. **Diagnosis**: Identifies the type of failure
3. **Strategy Selection**: Chooses appropriate healing strategy
4. **Healing Attempt**: Applies the strategy
5. **Verification**: Tests if healing was successful
6. **Backoff**: If unsuccessful, waits before retrying (exponential backoff)

### Healing Strategies

#### Strategy 1: API Key Validation
- Checks if API key format is valid
- Validates using ApiKeyValidator
- Reports specific validation errors

#### Strategy 2: Connection Refresh
- Clears and reloads the API key
- Re-initializes the connection
- Tests the connection

#### Strategy 3: Fallback Mode
- If service supports fallback, switches to fallback
- Allows service to continue with limited functionality
- Marks as "healed" since service can continue

### Backoff Algorithm

- **Initial Delay**: 1 second
- **Multiplier**: 2x
- **Max Delay**: 60 seconds
- **Formula**: `delay = min(baseDelay × 2^attempts, maxDelay)`

Example progression:
- Attempt 1: 1s
- Attempt 2: 2s
- Attempt 3: 4s
- Attempt 4: 8s
- Attempt 5: 16s
- Attempt 6: 32s
- Attempt 7+: 60s (capped)

### Healing Statistics

Track healing performance:

```javascript
const report = apiHealthMonitor.report();
console.log('Healing Stats:', report.stats);

// Output:
// {
//   totalChecks: 150,
//   failedChecks: 5,
//   healingAttempts: 8,
//   successfulHeals: 6
// }
```

### Integration with Self-Healing System

The API Health Monitor integrates with the existing self-healing infrastructure:

```javascript
// The integration happens automatically
// Self-healing system can query API health:
if (window.SelfHealing && window.SelfHealing.checkHealth) {
  const apiHealth = window.SelfHealing.checkHealth('api-connections');
  console.log('API Health:', apiHealth);
}
```

## Supported APIs

### 1. OpenAI
- **Purpose**: GPT models, DALL-E, Whisper
- **Environment Variable**: `OPENAI_API_KEY`
- **Format**: `sk-...` (40+ characters)
- **Get Key**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Fallback**: ✅ Yes (mock responses)

### 2. Anthropic Claude
- **Purpose**: Claude AI models
- **Environment Variable**: `ANTHROPIC_API_KEY`
- **Format**: `sk-ant-...` (40+ characters)
- **Get Key**: [console.anthropic.com](https://console.anthropic.com/settings/keys)
- **Fallback**: ✅ Yes (mock responses)

### 3. SAM.gov
- **Purpose**: Government contract opportunities
- **Environment Variable**: `SAMGOV_API_KEY`
- **Format**: Alphanumeric string
- **Get Key**: [open.gsa.gov](https://open.gsa.gov/api/get-opportunities-public-api/)
- **Fallback**: ✅ Yes (demo data)

### 4. GitHub
- **Purpose**: Repository and PR management
- **Environment Variable**: `GITHUB_TOKEN`
- **Format**: `ghp_...` or `github_pat_...`
- **Get Key**: [github.com/settings/tokens](https://github.com/settings/tokens)
- **Fallback**: ❌ No

### 5. Etherscan
- **Purpose**: Ethereum blockchain data
- **Environment Variable**: `ETHERSCAN_API_KEY`
- **Format**: Alphanumeric string
- **Get Key**: [etherscan.io/apis](https://etherscan.io/apis)
- **Fallback**: ✅ Yes (placeholder data)

### 6. CoinGecko
- **Purpose**: Cryptocurrency prices
- **Environment Variable**: `COINGECKO_API_KEY`
- **Format**: `CG-...`
- **Get Key**: [coingecko.com/en/api/pricing](https://www.coingecko.com/en/api/pricing)
- **Fallback**: ✅ Yes (placeholder data)

### 7. Infura
- **Purpose**: Web3 provider for Ethereum
- **Environment Variable**: `INFURA_PROJECT_ID`
- **Format**: 32-character project ID
- **Get Key**: [infura.io/dashboard](https://infura.io/dashboard)
- **Fallback**: ❌ No

### 8. PayPal
- **Purpose**: Payment processing
- **Environment Variables**: `PAYPAL_CLIENT_ID`, `PAYPAL_SECRET`, `PAYPAL_MODE`
- **Format**: Client ID (40+ characters), Secret
- **Get Key**: [developer.paypal.com/dashboard](https://developer.paypal.com/dashboard/applications)
- **Fallback**: ❌ No

## Troubleshooting

### Problem: "API key not found"

**Solution:**
1. Run setup wizard: `npm run setup:api`
2. Or manually create `.env` file from `.env.example`
3. Ensure `.env` is in the same directory as the test script
4. Verify environment variable name matches exactly

### Problem: "Invalid API key format"

**Solution:**
1. Check the expected format for your service (see [Supported APIs](#supported-apis))
2. Ensure you copied the entire key without extra spaces
3. Verify the key hasn't expired
4. Get a new key from the service provider

### Problem: "Connection test fails but key is valid"

**Solution:**
1. Check your internet connection
2. Verify the API service is operational (check status pages)
3. Check for rate limiting (wait a few minutes and retry)
4. Ensure your IP isn't blocked by the service
5. Check firewall/proxy settings

### Problem: "Health monitor not starting"

**Solution:**
1. Ensure `api-connection-manager.js` is loaded first
2. Check browser console for errors
3. Verify the page is fully loaded
4. Try manually starting: `apiHealthMonitor.start()`

### Problem: "Auto-healing keeps failing"

**Solution:**
1. Check the healing statistics: `apiHealthMonitor.report()`
2. Review the service dashboard: `apiHealthMonitor.dashboard()`
3. Verify the API key is still valid
4. Check if the service has rate limits
5. Consider using fallback mode if available

### Problem: "Tests passing but service not working in app"

**Solution:**
1. Ensure the app loads the API connection manager
2. Check if the service is initialized: `window.apiConnectionManager`
3. Verify the correct API key is being used
4. Check browser console for errors
5. Try testing the specific endpoint directly

## Best Practices

### 1. Security
- ✅ **DO**: Keep API keys in `.env` file
- ✅ **DO**: Add `.env` to `.gitignore`
- ✅ **DO**: Use different keys for development and production
- ❌ **DON'T**: Commit API keys to version control
- ❌ **DON'T**: Share API keys in public channels

### 2. Testing
- ✅ Run tests before deployment
- ✅ Test after updating API keys
- ✅ Monitor health regularly
- ✅ Review healing statistics

### 3. Monitoring
- ✅ Enable health monitoring in production
- ✅ Check dashboard periodically
- ✅ Set up alerts for critical failures
- ✅ Review performance metrics

### 4. Fallbacks
- ✅ Use services with fallback when possible
- ✅ Test fallback mode
- ✅ Inform users when using fallback
- ✅ Provide way to configure real API key

## Integration Examples

### Basic HTML Integration

```html
<!DOCTYPE html>
<html>
<head>
    <title>My App</title>
</head>
<body>
    <!-- Your app content -->
    
    <!-- Load API Connection Manager (includes auto-discovery) -->
    <script src="js/api-connection-auto-inject.js"></script>
    
    <!-- Load Health Monitor (includes auto-healing) -->
    <script src="api-health-monitor.js"></script>
    
    <script>
        // Your app code
        // API connection manager is available as window.apiConnectionManager
        // Health monitor is available as window.apiHealthMonitor
    </script>
</body>
</html>
```

### Node.js Integration

```javascript
// Load environment variables
require('dotenv').config();

// Import API Connection Manager
const AIAPIConnectionManager = require('./src/ai/api-connection-manager.js');

// Create instance
const apiManager = new AIAPIConnectionManager();

// Configure API keys
apiManager.setApiKey('openai', process.env.OPENAI_API_KEY);
apiManager.setApiKey('github', process.env.GITHUB_TOKEN);

// Make requests
const response = await apiManager.makeRequest('openai', '/chat/completions', {
    method: 'POST',
    body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello!' }]
    })
});
```

### CI/CD Integration

```yaml
# .github/workflows/api-tests.yml
name: API Connection Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: npm install
      
      - name: Test API Connections
        run: npm run test:api
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Command Reference

### NPM Scripts

```bash
# Test API connections
npm run test:api
npm run test:api-connections

# Setup API keys (interactive)
npm run setup:api
npm run setup:api-keys

# Run all tests
npm test
```

### Direct Commands

```bash
# Test connections
node test-api-connections.js

# Setup wizard
node setup-api-keys.js
```

### Browser Console Commands

```javascript
// Show API status
apiConnectionManager.showDashboard()

// Show health monitor
apiHealthMonitor.dashboard()

// Manual health check
apiHealthMonitor.check()

// Get full report
apiHealthMonitor.report()

// Start/stop monitoring
apiHealthMonitor.start()
apiHealthMonitor.stop()
```

## Additional Resources

- [API Key Configuration Guide](API_KEY_CONFIGURATION_GUIDE.md)
- [AI API Connection Manager Guide](AI_API_CONNECTION_MANAGER_GUIDE.md)
- [Self-Healing Summary](SELF-HEALING-SUMMARY.md)

## Support

For issues or questions:
1. Check this guide
2. Review the [Troubleshooting](#troubleshooting) section
3. Run the test suite: `npm run test:api`
4. Check the health monitor: `apiHealthMonitor.dashboard()`
5. Contact the development team

---

**Version**: 1.0.0  
**Created**: 2024-12-31  
**Status**: ✅ Production Ready
