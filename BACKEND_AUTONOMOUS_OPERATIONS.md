# Backend Autonomous Operations & Error Handling System

## Overview

This system provides comprehensive autonomous backend functionality for the BarbrickDesign repository. It ensures all files work properly with backend connections, handles API keys securely, and provides self-healing capabilities.

## 🚀 Quick Start

### 1. Check Backend Health

```bash
npm run health
```

This will scan your entire repository and report:
- ✅ API key configuration status
- ✅ Backend service health
- ✅ Files with backend calls
- ✅ Error handling coverage
- ⚠️ Issues and recommendations

### 2. Setup API Keys

```bash
npm run setup:api
```

Interactive wizard to configure all API keys:
- OpenAI API Key
- GitHub Personal Access Token
- PayPal Client ID & Secret
- SAM.gov API Key
- And more...

### 3. Monitor Backend Services

```bash
npm run monitor
```

Starts autonomous monitoring with:
- 🔄 Automatic service restart on failure
- 📊 Real-time health metrics
- 🔧 Self-healing capabilities
- 📝 Comprehensive logging

### 4. Fix Error Handling

```bash
npm run fix:errors
```

Automatically adds error handling to files that:
- Make fetch/axios calls without try-catch
- Use API keys without validation
- Have async functions without error handling

## 📋 System Components

### 1. Backend Health Checker (`backend-health-checker.js`)

**Purpose**: Comprehensive health analysis of all backend operations

**Features**:
- ✓ Environment variable validation
- ✓ Backend service availability checks
- ✓ File-by-file API call scanning
- ✓ Error handling coverage analysis
- ✓ Security issue detection (hardcoded keys)
- ✓ JSON report generation

**Usage**:
```bash
node backend-health-checker.js
```

**Output**:
- Console report with color-coded status
- `backend-health-report.json` for detailed analysis
- Prioritized recommendations for fixes

**Example Output**:
```
🔑 API KEYS:
  ✓ OPENAI_API_KEY: Properly configured
  ✗ GITHUB_TOKEN: Required but not configured
  ⚠ DISCORD_BOT_TOKEN: Optional, not configured

🔧 BACKEND SERVICES:
  ✓ micro-tx: Service properly configured
  ⚠ anchor: Missing comprehensive error handling

📁 FILE SCAN SUMMARY:
  Total files scanned: 847
  Files with backend calls: 124
  Files with error handling: 98
  Error handling coverage: 79.0%
```

### 2. API Key Manager (`backend-api-key-manager.js`)

**Purpose**: Interactive setup and validation of all API keys

**Features**:
- ✓ Interactive CLI wizard
- ✓ Format validation for each key type
- ✓ Connection testing
- ✓ Secure .env file management
- ✓ Preserves comments and structure

**Usage**:
```bash
node backend-api-key-manager.js
```

**Interactive Flow**:
1. Checks if .env exists (creates from .env.example if needed)
2. Shows current configuration status
3. Guides through each API key setup
4. Validates format before saving
5. Tests connections to APIs
6. Provides next steps

**Supported APIs**:
- OpenAI (GPT-4, embeddings, video generation)
- GitHub (PR reviews, automation)
- PayPal (payment processing)
- SAM.gov (government grants)
- Discord (bot integration)
- NamUs (missing persons database)
- Firebase (authentication, storage)
- Blockchain APIs (Etherscan, Infura, Alchemy)

### 3. Autonomous Backend Monitor (`backend-monitor.js`)

**Purpose**: Continuous monitoring and self-healing of backend services

**Features**:
- ✓ Real-time service health monitoring
- ✓ Automatic service restart on failure
- ✓ Intelligent restart throttling (prevents restart loops)
- ✓ Critical service prioritization
- ✓ Performance metrics tracking
- ✓ Event-driven architecture
- ✓ Graceful shutdown handling

**Usage**:
```bash
# Start monitoring
npm run monitor

# Check status
npm run monitor:status
```

**Monitored Services**:
1. **micro-tx** (Port 3000) - Micro-transaction processing ⚠️ CRITICAL
2. **anchor** (Port 3001) - Blockchain anchoring ⚠️ CRITICAL
3. **affiliate** (Port 3002) - Affiliate tracking
4. **relayer** (Port 3003) - Ethereum relayer ⚠️ CRITICAL
5. **grid-control-api** (Port 3004) - Grid infrastructure ⚠️ CRITICAL

**Self-Healing Behavior**:
- Detects service crashes within 30 seconds
- Waits 5 seconds before restart attempt
- Maximum 3 restarts within 5-minute window
- Critical services get priority
- Emits events for external monitoring

**Metrics Tracked**:
```json
{
  "checks": 1247,
  "failures": 3,
  "restarts": 2,
  "healingAttempts": 3,
  "successfulHealings": 2,
  "uptime": 7200000
}
```

### 4. Error Handling Injector (`backend-error-injector.js`)

**Purpose**: Automatically add comprehensive error handling to files

**Features**:
- ✓ Scans for fetch/axios calls without error handling
- ✓ Detects async functions without try-catch
- ✓ Identifies API key usage without validation
- ✓ Creates backups before modification
- ✓ Injects user-friendly error messages
- ✓ Adds global error handlers

**Usage**:
```bash
# Dry run (shows what would be fixed)
npm run fix:errors:dry-run

# Apply fixes
npm run fix:errors
```

**Injected Error Handling**:

1. **Fetch Wrapper**:
```javascript
// Wraps all fetch calls with automatic error handling
fetch('/api/endpoint')
  .then(response => response.json())
  .catch(error => {
    // Automatically handled:
    // - Network errors
    // - HTTP errors
    // - User-friendly messages
  });
```

2. **Axios Interceptor**:
```javascript
// Global error interceptor for all axios calls
axios.interceptors.response.use(
  response => response,
  error => {
    handleBackendError(error);
    return Promise.reject(error);
  }
);
```

3. **API Key Validation**:
```javascript
// Validates API keys on startup
function validateApiKeys() {
  // Checks for missing/invalid keys
  // Warns user if not configured
}
```

**Backup Files**:
- All modified files get `.backup` extension
- Restore with: `cp file.backup file`
- Or remove injected code manually (marked with comments)

## 🔧 Configuration

### Environment Variables

All API keys and configuration are stored in `.env` file:

```bash
# Required API Keys
OPENAI_API_KEY=sk-your-key-here
GITHUB_TOKEN=ghp_your-token-here
PAYPAL_CLIENT_ID=your-client-id
SAMGOV_API_KEY=your-sam-key

# Optional Services
DISCORD_BOT_TOKEN=your-discord-token
NAMUS_API_KEY=your-namus-key
FIREBASE_API_KEY=your-firebase-key

# Backend Configuration
MICRO_TX_PORT=3000
ANCHOR_PORT=3001
AFFILIATE_PORT=3002
RELAYER_PORT=3003
GRID_CONTROL_PORT=3004

# Feature Flags
ENABLE_AUTO_HEALING=true
ENABLE_MONITORING=true
```

**Security Best Practices**:
1. ✅ Never commit `.env` to version control (already in `.gitignore`)
2. ✅ Use `.env.example` as template
3. ✅ Rotate keys regularly
4. ✅ Use different keys for development and production
5. ✅ Store production keys in GitHub Secrets

### Monitor Configuration

Customize monitoring behavior:

```javascript
const monitor = new AutonomousBackendMonitor({
  checkInterval: 30000,     // Check every 30 seconds
  restartDelay: 5000,       // Wait 5 seconds before restart
  maxRestarts: 3,           // Max 3 restarts
  restartWindow: 300000,    // Within 5 minutes
  enableAutoHealing: true   // Enable self-healing
});
```

## 📊 Reports and Logs

### Health Report (`backend-health-report.json`)

Complete health analysis in JSON format:

```json
{
  "timestamp": "2026-01-25T06:16:26.081Z",
  "overall": "healthy",
  "services": [...],
  "apiKeys": [...],
  "fileChecks": [...],
  "recommendations": [...]
}
```

### Monitor Metrics (`backend-metrics.json`)

Real-time monitoring metrics:

```json
{
  "isRunning": true,
  "uptime": 7200000,
  "metrics": {
    "checks": 240,
    "failures": 2,
    "restarts": 1,
    "successfulHealings": 1
  },
  "services": [...]
}
```

### Monitor Logs (`backend-monitor.log`)

Timestamped log file for debugging:

```
[2026-01-25T06:16:26.081Z] [INFO] Starting Autonomous Backend Monitor...
[2026-01-25T06:16:28.123Z] [SUCCESS] Service micro-tx started on port 3000
[2026-01-25T06:16:45.234Z] [WARNING] Service anchor exited (code: 1)
[2026-01-25T06:16:50.345Z] [INFO] Attempting to restart service: anchor
[2026-01-25T06:16:52.456Z] [SUCCESS] Service anchor restarted successfully
```

## 🔥 Common Use Cases

### Use Case 1: New Developer Onboarding

```bash
# 1. Clone repository
git clone https://github.com/barbrickdesign/barbrickdesign.github.io.git
cd barbrickdesign.github.io

# 2. Install dependencies
npm install

# 3. Setup API keys
npm run setup:api

# 4. Check health
npm run health

# 5. Start backend
npm run backend

# 6. Start monitoring
npm run monitor
```

### Use Case 2: Production Deployment

```bash
# 1. Check health before deployment
npm run health

# 2. Fix any error handling issues
npm run fix:errors

# 3. Start monitoring daemon
npm run monitor &

# 4. Deploy services
npm run deploy
```

### Use Case 3: Debugging Backend Issues

```bash
# 1. Check current health
npm run health

# 2. View monitor status
npm run monitor:status

# 3. Check logs
tail -f backend-monitor.log

# 4. Test specific API connections
npm run test:api
```

### Use Case 4: Adding New Backend Service

1. Create service file in `backend/services/`
2. Add to monitor configuration in `backend-monitor.js`:

```javascript
{
  name: 'my-service',
  script: 'backend/services/my-service.js',
  port: 3010,
  critical: false,
  healthEndpoint: '/health'
}
```

3. Restart monitor:
```bash
# Stop current monitor (Ctrl+C)
npm run monitor
```

## 🛡️ Error Handling Patterns

### Pattern 1: Fetch with Fallback

```javascript
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch failed:', error);
    // Return fallback data
    return { items: [], error: true };
  }
}
```

### Pattern 2: API Key Validation

```javascript
function validateAndGetApiKey(keyName) {
  const key = process.env[keyName];
  
  if (!key || key.includes('placeholder')) {
    console.warn(`${keyName} not configured`);
    return null;
  }
  
  return key;
}

// Usage
const apiKey = validateAndGetApiKey('OPENAI_API_KEY');
if (!apiKey) {
  // Use fallback or show error to user
  return showConfigurationError();
}
```

### Pattern 3: Retry with Exponential Backoff

```javascript
async function fetchWithRetry(url, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetch(url);
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      
      const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### Pattern 4: Circuit Breaker

```javascript
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.failureCount = 0;
    this.threshold = threshold;
    this.timeout = timeout;
    this.state = 'closed'; // closed, open, half-open
  }
  
  async call(fn) {
    if (this.state === 'open') {
      throw new Error('Circuit breaker is open');
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onSuccess() {
    this.failureCount = 0;
    this.state = 'closed';
  }
  
  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.threshold) {
      this.state = 'open';
      setTimeout(() => {
        this.state = 'half-open';
        this.failureCount = 0;
      }, this.timeout);
    }
  }
}
```

## 🚨 Troubleshooting

### Issue: Health Check Reports Missing API Keys

**Solution**:
```bash
# Run interactive setup
npm run setup:api

# Or manually edit .env file
cp .env.example .env
nano .env
```

### Issue: Service Won't Start

**Causes**:
1. Port already in use
2. Missing dependencies
3. Invalid configuration

**Solutions**:
```bash
# Check if port is in use
lsof -i :3000

# Install dependencies
npm run backend-setup

# Check configuration
npm run health
```

### Issue: Monitor Not Restarting Service

**Possible Reasons**:
1. Max restart limit reached
2. Service file missing
3. Auto-healing disabled

**Solutions**:
```bash
# Check monitor status
npm run monitor:status

# View logs
tail -f backend-monitor.log

# Manually restart service
cd backend && node services/micro-tx.js
```

### Issue: Error Injector Not Working

**Causes**:
1. File permissions
2. Syntax errors in file
3. Already has error handling

**Solutions**:
```bash
# Try dry run first
npm run fix:errors:dry-run

# Check file permissions
ls -la

# Restore from backup
cp file.backup file
```

## 📚 API Reference

### BackendHealthChecker

```javascript
const checker = new BackendHealthChecker();
await checker.run();

// Results
checker.results.overall // 'healthy' | 'unhealthy' | 'critical'
checker.results.services // Array of service checks
checker.results.apiKeys // Array of API key status
```

### AutonomousBackendMonitor

```javascript
const monitor = new AutonomousBackendMonitor(options);

// Start monitoring
await monitor.start();

// Get status
const status = monitor.getStatus();

// Stop monitoring
await monitor.shutdown();

// Events
monitor.on('critical-failure', (data) => {
  console.log(`Critical: ${data.service}`);
});

monitor.on('service-healed', (data) => {
  console.log(`Healed: ${data.service}`);
});
```

### ErrorHandlingInjector

```javascript
const injector = new ErrorHandlingInjector();

// Run analysis and fixes
await injector.run({
  dryRun: false,
  targetDir: '/path/to/dir',
  extensions: ['.html', '.js']
});

// Results
injector.results.filesScanned
injector.results.filesFixed
injector.results.backupsCreated
```

## 🔄 Continuous Integration

### GitHub Actions Workflow

Add to `.github/workflows/backend-health.yml`:

```yaml
name: Backend Health Check

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 */6 * * *' # Every 6 hours

jobs:
  health-check:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run health check
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          PAYPAL_CLIENT_ID: ${{ secrets.PAYPAL_CLIENT_ID }}
        run: npm run health
      
      - name: Upload health report
        uses: actions/upload-artifact@v4
        with:
          name: health-report
          path: backend-health-report.json
```

## 📞 Support

- **Email**: BarbrickDesign@gmail.com
- **GitHub Issues**: https://github.com/barbrickdesign/barbrickdesign.github.io/issues
- **Documentation**: See README files in each backend service

## 📝 License

MIT License - See LICENSE file for details

## 🙏 Credits

Created by the BankSky Team for the BarbrickDesign repository.
Special thanks to all contributors and the open-source community.

---

**Last Updated**: January 25, 2026
**Version**: 1.0.0
