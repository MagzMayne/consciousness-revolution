# API Connection Testing & Automation System

## 🎯 Problem Solved

This system addresses the requirement to **test all API connections and automate the process for making proper connections** across the BarbrickDesign platform.

## 🚀 What's Included

### 1. **Comprehensive Test Suite** (`test-api-connections.js`)
Automated testing for all 8 API services with detailed reporting.

### 2. **Interactive Setup Wizard** (`setup-api-keys.js`)
Step-by-step guide to configure API keys with validation.

### 3. **Health Monitoring System** (`api-health-monitor.js`)
Continuous monitoring with auto-healing capabilities.

### 4. **Visual Dashboard** (`api-connection-testing-dashboard.html`)
Browser-based interface for testing and monitoring.

### 5. **Complete Documentation** (`API_CONNECTION_TESTING_GUIDE.md`)
Comprehensive guide with examples and troubleshooting.

## ⚡ Quick Start

### Test API Connections
```bash
npm run test:api
```

### Setup API Keys (Interactive Wizard)
```bash
npm run setup:api
```

### View Visual Dashboard
Open `api-connection-testing-dashboard.html` in your browser

## 📊 Supported APIs

| Service | Environment Variable | Fallback Available | Auto-Healing |
|---------|---------------------|-------------------|--------------|
| OpenAI | `OPENAI_API_KEY` | ✅ Yes | ✅ Yes |
| Anthropic | `ANTHROPIC_API_KEY` | ✅ Yes | ✅ Yes |
| SAM.gov | `SAMGOV_API_KEY` | ✅ Yes | ✅ Yes |
| GitHub | `GITHUB_TOKEN` | ❌ No | ✅ Yes |
| Etherscan | `ETHERSCAN_API_KEY` | ✅ Yes | ✅ Yes |
| CoinGecko | `COINGECKO_API_KEY` | ✅ Yes | ✅ Yes |
| Infura | `INFURA_PROJECT_ID` | ❌ No | ✅ Yes |
| PayPal | `PAYPAL_CLIENT_ID` | ❌ No | ✅ Yes |

## 🔧 Features

### Automated Testing
- ✅ API key format validation
- ✅ Connection health checks
- ✅ Fallback mechanism testing
- ✅ Retry logic verification
- ✅ Environment configuration checks

### Automated Setup
- ✅ Interactive CLI wizard
- ✅ API key validation during input
- ✅ Automatic `.env` file generation
- ✅ `.gitignore` management
- ✅ Post-setup testing

### Health Monitoring
- ✅ Continuous monitoring (60-second intervals)
- ✅ Real-time health scores
- ✅ Performance metrics
- ✅ Failure detection
- ✅ Auto-healing with exponential backoff

### Auto-Healing Strategies
1. **API Key Validation** - Verifies key format and validity
2. **Connection Refresh** - Clears and reloads connections
3. **Fallback Mode** - Switches to fallback for services that support it

## 📖 Usage Examples

### Command Line

```bash
# Test all API connections
npm run test:api

# Setup API keys interactively
npm run setup:api

# Alternative commands
node test-api-connections.js
node setup-api-keys.js
```

### Browser Integration

```html
<!-- Load API Connection Manager -->
<script src="js/api-connection-auto-inject.js"></script>

<!-- Load Health Monitor -->
<script src="api-health-monitor.js"></script>

<script>
    // View connection status
    apiConnectionManager.showDashboard();
    
    // View health monitor
    apiHealthMonitor.dashboard();
    
    // Test a specific connection
    await apiConnectionManager.testConnection('openai');
    
    // Manual health check
    await apiHealthMonitor.check();
</script>
```

### Node.js Integration

```javascript
// Run tests programmatically
const APIConnectionTester = require('./test-api-connections.js');
const tester = new APIConnectionTester();
const results = await tester.runTests();

// Setup wizard programmatically
const APIKeySetupWizard = require('./setup-api-keys.js');
const wizard = new APIKeySetupWizard();
await wizard.run();
```

## 🎨 Visual Dashboard Features

The browser-based dashboard (`api-connection-testing-dashboard.html`) provides:

- **Real-time Service Status**: Visual cards for each API service
- **Health Bars**: Visual representation of connection health (0-100%)
- **Test Statistics**: Total tests, passed, failed, and warnings
- **Interactive Testing**: Test individual services or all at once
- **Live Logs**: Real-time log updates with color-coded entries
- **Auto-Refresh**: Updates every 5 seconds
- **One-Click Actions**: Run tests, check connections, view dashboard, test healing

## 🔍 Test Output Example

```
🧪 API Connection Testing Suite

✅ src/ai/api-connection-manager.js exists
✅ src/utils/api-key-validator.js exists
✅ js/api-connection-auto-inject.js exists
✅ api-connection-test.html exists

ℹ️  OpenAI: No API key (will use fallback)
✅ GitHub: API key format valid
⚠️  PayPal: No API key configured

📊 Test Summary
Total Tests:    21
✅ Passed:       12
❌ Failed:       0
⚠️  Warnings:     4
Pass Rate:      57%

🎉 All critical tests passed!
```

## 🛠️ Configuration

### Environment Variables (.env)

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your-key-here

# SAM.gov Configuration  
SAMGOV_API_KEY=your-key-here

# GitHub Configuration
GITHUB_TOKEN=ghp_your-token-here

# PayPal Configuration
PAYPAL_CLIENT_ID=your-client-id-here
PAYPAL_SECRET=your-secret-here
PAYPAL_MODE=sandbox

# Blockchain APIs
ETHERSCAN_API_KEY=your-key-here
INFURA_PROJECT_ID=your-project-id-here
COINGECKO_API_KEY=CG-your-key-here
```

### Health Monitoring Settings

```javascript
// Adjust monitoring interval (default: 60000ms)
const state = apiHealthMonitor.getState();
state.checkInterval = 30000; // 30 seconds

// Restart with new interval
apiHealthMonitor.stop();
apiHealthMonitor.start();
```

## 📚 Documentation

- **Main Guide**: [API_CONNECTION_TESTING_GUIDE.md](API_CONNECTION_TESTING_GUIDE.md) - Complete documentation
- **API Keys**: [API_KEY_CONFIGURATION_GUIDE.md](API_KEY_CONFIGURATION_GUIDE.md) - Security and configuration
- **API Manager**: [AI_API_CONNECTION_MANAGER_GUIDE.md](AI_API_CONNECTION_MANAGER_GUIDE.md) - Usage and examples

## 🔒 Security Best Practices

✅ **DO:**
- Keep API keys in `.env` file
- Add `.env` to `.gitignore`
- Use different keys for dev/prod
- Rotate keys regularly

❌ **DON'T:**
- Commit API keys to git
- Share keys publicly
- Use production keys in development
- Hardcode keys in source files

## 🐛 Troubleshooting

### "API key not found"
Run the setup wizard: `npm run setup:api`

### "Invalid API key format"
Check the expected format in the documentation or run tests

### "Connection test fails"
1. Verify internet connection
2. Check API service status
3. Ensure API key is valid
4. Check for rate limiting

### "Health monitor not starting"
1. Ensure `api-connection-manager.js` is loaded first
2. Check browser console for errors
3. Try manually starting: `apiHealthMonitor.start()`

## 🔄 Integration with Self-Healing

The health monitor automatically integrates with the existing self-healing system (`self-healing.js`):

```javascript
// Self-healing system can query API health
if (window.SelfHealing && window.SelfHealing.checkHealth) {
    const apiHealth = window.SelfHealing.checkHealth('api-connections');
    console.log('API Health:', apiHealth);
}
```

## 📈 Metrics & Monitoring

The system tracks:
- Total health checks performed
- Failed check count
- Healing attempts
- Successful heals
- Per-service success/failure counts
- Average response times
- Health scores (0-100%)

Access metrics:
```javascript
const report = apiHealthMonitor.report();
console.log('Stats:', report.stats);
console.log('Services:', report.services);
```

## 🎯 NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run test:api` | Run API connection tests |
| `npm run setup:api` | Interactive setup wizard |
| `npm test` | Run all tests (includes API tests) |

## 🤝 Contributing

When adding new API services:

1. Update `services` object in `api-connection-manager.js`
2. Add to test suite in `test-api-connections.js`
3. Add to setup wizard in `setup-api-keys.js`
4. Update documentation

## 📝 License

MIT - See repository LICENSE file

## 👥 Authors

BarbrickDesign Platform Team

## 🔗 Related Systems

- **API Connection Manager** - Core connection handling
- **API Key Validator** - Key format validation
- **Self-Healing System** - Automatic error recovery
- **Health Monitoring** - Continuous status tracking

---

**Version**: 1.0.0  
**Created**: 2024-12-31  
**Status**: ✅ Production Ready
