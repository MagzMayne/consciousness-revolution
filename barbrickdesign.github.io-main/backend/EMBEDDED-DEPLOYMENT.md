# 🎯 BankSky Automated Deployment System

**Complete Node.js deployment and self-healing system embedded in BankSky.html**

## 🚀 How It Works

BankSky.html now contains a fully automated deployment system that can:

1. ✅ **Auto-detect Node.js** installation at `V:\node-v22.21.0-win-x64\node-v22.21.0-win-x64`
2. ✅ **Download and install Node.js** if not found
3. ✅ **Bootstrap backend services** automatically
4. ✅ **Monitor service health** and auto-repair failures
5. ✅ **Execute system commands** securely through command executor service

## 🎮 Using the Deployment System

### Step 1: Open BankSky.html
- Open `BankSky.html` in your browser
- You'll see a new **🚀 Deploy Backend** button

### Step 2: Click Deploy Backend
```javascript
// The system will automatically:
1. Detect Node.js at V:\node-v22.21.0-win-x64\node-v22.21.0-win-x64
2. If not found, download and install Node.js v22.21.0
3. Create backend directory structure
4. Install npm dependencies
5. Start all backend services (micro-tx, anchor, affiliate, relayer)
6. Begin monitoring service health
```

### Step 3: Monitor Status
- A **service status panel** appears in bottom-right corner
- Shows real-time health of all services:
  - 🟢 micro-tx: Healthy
  - 🟢 anchor: Healthy
  - 🟢 affiliate: Healthy
  - 🟢 relayer: Healthy

### Step 4: Auto-Repair (If Needed)
- If any service fails, the system automatically:
  - Stops all services
  - Cleans node_modules
  - Reinstalls dependencies
  - Restarts all services
  - Continues monitoring

## 🔧 Technical Details

### Embedded Systems

#### 1. NodeJS Deployer
```javascript
const NodeJSDeployer = (() => {
  // Auto-detects Node.js
  // Downloads installer if needed
  // Bootstraps entire backend
  // Monitors and repairs services
})();
```

#### 2. Command Executor Service
- Runs on `http://localhost:3005`
- Securely executes system commands
- Validates allowed commands only
- Provides REST API for deployment operations

#### 3. Service Health Monitor
- Checks all services every 30 seconds
- Updates UI status panel
- Triggers auto-repair on failures
- Logs all activities

### Security Features

- **Command Validation**: Only allows safe system commands
- **Path Restrictions**: Limited to backend directory operations
- **Timeout Protection**: All operations have timeouts
- **Error Containment**: Failures don't crash the main system

## 📊 What Gets Deployed

### Backend Services (4 total)
1. **Micro-tx Service** (port 3000) - BTC payment verification
2. **Anchor Service** (port 3001) - IPFS-to-Bitcoin anchoring
3. **Affiliate Service** (port 3002) - Performance tracking
4. **Relayer Service** (port 3003) - VaultCoin meta-transactions

### Command Executor (port 3005)
- Handles deployment commands
- System administration
- Health monitoring

### Dependencies Auto-Installed
- express, cors, dotenv
- ethers, ipfs-http-client
- @openzeppelin/contracts
- bitcoin-core, axios, node-cron

## 🔄 Auto-Healing Scenarios

### Scenario 1: Node.js Not Found
```
1. System detects missing Node.js
2. Downloads installer from nodejs.org
3. Runs silent installation
4. Updates paths and retries
```

### Scenario 2: Service Crash
```
1. Health monitor detects unhealthy service
2. Logs warning to console and UI
3. Attempts individual service restart
4. If failed, triggers full system repair
```

### Scenario 3: Dependency Issues
```
1. Detects npm install failure
2. Clears npm cache
3. Deletes node_modules
4. Reinstalls with --force flag
5. Restarts all services
```

## 📈 Monitoring & Logs

### Real-time Status Panel
```
Backend Services Status:
🟢 micro-tx: Healthy
🟢 anchor: Healthy
🟢 affiliate: Healthy
🟢 relayer: Healthy
```

### Console Logging (every 5 minutes)
```
📊 System Status: {
  "services": {"microTx":"healthy","anchor":"healthy",...},
  "memory": "45MB used",
  "uptime": "2.5 hours"
}
```

### Health Reports (every 10 minutes)
```
🏥 Service Health: 4/4 services healthy
Response times: micro-tx 23ms, anchor 45ms, affiliate 12ms, relayer 67ms
```

### Performance Metrics (every 15 minutes)
```
📈 Performance: 156 transactions processed, 2 errors, 98% success rate
```

## 🎯 Production Deployment

For production deployment to cloud platforms:

1. **Use the existing deployment scripts**:
   ```bash
   npm run deploy  # Deploys to Vercel/Netlify
   ```

2. **Update BankSky.html URLs**:
   ```javascript
   MICRO_TX: 'https://your-micro-tx.vercel.app'
   // etc.
   ```

3. **The embedded system handles development/local deployment**

## 🚨 Troubleshooting

### Button Shows "Deploying..." Forever
- Check browser console for errors
- Verify internet connection for Node.js download
- Try refreshing the page and clicking again

### Services Start But Show Unhealthy
- Check if ports 3000-3005 are available
- Look at service-specific error logs
- The system will auto-repair within 30 seconds

### Node.js Download Fails
- Manual download from https://nodejs.org
- Install to `V:\node-v22.21.0-win-x64\node-v22.21.0-win-x64`
- Refresh BankSky.html

## 🎉 Success Indicators

When deployment succeeds, you'll see:
- ✅ Button turns green with "Deployed!"
- ✅ Status panel shows all services healthy
- ✅ Console logs show successful startup
- ✅ BankSky can now connect to real backend services

---

**🎯 BankSky now has a complete self-deploying, self-healing backend system embedded directly in the HTML file.**
