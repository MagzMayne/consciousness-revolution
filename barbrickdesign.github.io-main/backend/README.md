# BankSky Backend Services

Complete backend infrastructure for BankSky DeFi operations with self-healing microservices and comprehensive auto-logging.

## 🚀 Quick Start

### Local Development (Recommended for Testing)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start all services locally
npm run dev

# This will start:
# - Micro-tx service on http://localhost:3000
# - Anchor service on http://localhost:3001
# - Affiliate service on http://localhost:3002
# - Relayer service on http://localhost:3003
```

### Production Deployment

```bash
# Install dependencies
npm install

# Deploy all services (development)
npm run dev

# Deploy all services (production)
npm run deploy

# Run health checks
npm run health

# Run tests
npm run test
```

## 📋 Services

### 1. Micro-Transaction Service (`micro-tx.js`)
- **Purpose**: Handle BTC micro-payments for trust verification
- **Features**: Self-healing, transaction monitoring, auto-retry
- **Endpoint**: `POST /` - Create micro-tx request
- **Health**: Auto-monitors Bitcoin connectivity

### 2. OP_RETURN Anchor Service (`anchor.js`)
- **Purpose**: Anchor IPFS CIDs to Bitcoin blockchain
- **Features**: OP_RETURN embedding, transaction monitoring
- **Endpoint**: `POST /` - Create anchor request
- **Health**: Bitcoin node connectivity monitoring

### 3. Affiliate Tracking Service (`affiliate.js`)
- **Purpose**: Track affiliate conversions and earnings
- **Features**: Click tracking, conversion monitoring, auto-cleanup
- **Endpoint**: `GET /?wallet=<address>` - Get affiliate data
- **Health**: Data integrity validation

### 4. VaultCoin Minting Relayer (`relayer.js`)
- **Purpose**: Handle meta-transactions for VaultCoin minting
- **Features**: Gas optimization, transaction monitoring, auto-retry
- **Endpoint**: `POST /mint` - Create mint transaction
- **Health**: Ethereum connectivity and gas price monitoring

## 🔧 Configuration

Create a `.env` file in the backend directory:

```env
# API Keys
ETHERSCAN_API_KEY=your_etherscan_key
INFURA_PROJECT_ID=your_infura_project_id
INFURA_PROJECT_SECRET=your_infura_project_secret

# Bitcoin Node (optional)
BITCOIN_RPC_HOST=your_bitcoin_node
BITCOIN_RPC_PORT=8332
BITCOIN_RPC_USER=your_username
BITCOIN_RPC_PASS=your_password

# Service URLs (when deployed)
MICRO_TX_URL=https://your-micro-tx-service.vercel.app
ANCHOR_URL=https://your-anchor-service.vercel.app
AFFILIATE_URL=https://your-affiliate-service.vercel.app
RELAYER_URL=https://your-relayer-service.vercel.app

# VaultCoin Contract
VAULTCOIN_ADDRESS=0x742d35Cc6634C0532925a3b844Bc454e4438f44e
RELAYER_WALLET=your_relayer_wallet_private_key
```

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy each service
cd services
vercel micro-tx.js
vercel anchor.js
vercel affiliate.js
vercel relayer.js

# Or use the deployment script
cd ..
npm run deploy
```

### Option 2: Netlify Functions

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=services
```

### Option 3: Traditional Node.js

```bash
# Run locally
npm run dev

# Or deploy to VPS
npm run start
```

## 🔍 Self-Healing Features

- **Automatic Service Recovery**: Failed services are automatically restarted/redeployed
- **Health Monitoring**: Continuous monitoring of all service endpoints
- **Data Integrity**: Automatic cleanup and validation of stored data
- **Network Resilience**: Automatic fallback to backup providers
- **Resource Management**: Memory and connection pool monitoring

## 📊 Auto-Logging System

### System Logs (every 5 minutes)
- Service status and connectivity
- Memory usage and performance
- User activity metrics
- Error rates and recovery attempts

### Health Logs (every 10 minutes)
- Service availability status
- Response times and throughput
- Error counts and types
- Recovery success rates

### Performance Logs (every 15 minutes)
- Detailed performance metrics
- Resource utilization
- Transaction volumes
- System uptime and stability

## 🛠️ Smart Contract Deployment

### VaultCoin Contract

```bash
# Install dependencies
npm install

# Deploy to Ethereum
cd contracts
npx hardhat run scripts/deploy.js --network mainnet

# Update the deployed address in BankSky.html CONFIG
```

### Contract Features

- **Trust-Based Minting**: Mint amounts based on wallet trust scores
- **Time-Locked Rewards**: Claim rewards based on holding duration
- **Relayer Authorization**: Secure meta-transaction support
- **Emergency Controls**: Owner can pause operations if needed

## 🔒 Security

- **API Rate Limiting**: Built-in rate limiting for all endpoints
- **Signature Verification**: All requests require valid wallet signatures
- **Input Validation**: Comprehensive input sanitization
- **Error Handling**: Secure error responses without data leakage
- **HTTPS Only**: All communications encrypted

## 🧪 Testing

```bash
# Run all tests
npm test

# Test individual services
node test-services.js --service=micro-tx
node test-services.js --service=anchor
node test-services.js --service=affiliate
node test-services.js --service=relayer
```

## 📈 Monitoring

### Health Check Endpoint

```bash
curl https://your-service-url.com/health
```

Returns comprehensive health status for all services.

### Metrics Dashboard

Access detailed metrics and logs through the auto-logging system. All logs are structured for easy parsing and monitoring.

## 🔄 Updates and Maintenance

- **Automatic Updates**: Services check for updates every 24 hours
- **Rolling Deployments**: Zero-downtime updates for production
- **Backup Systems**: Automatic data backup and recovery
- **Alert System**: Email/SMS alerts for critical issues

## 📞 Support

For issues or questions:
1. Check the auto-logs for error details
2. Run health checks: `npm run health`
3. Review service-specific logs in the console
4. Check network connectivity and API keys

## 🎯 Production Checklist

- [ ] API keys configured
- [ ] Smart contract deployed
- [ ] Services deployed to cloud
- [ ] Domain SSL configured
- [ ] Monitoring alerts set up
- [ ] Backup systems tested
- [ ] Load testing completed
- [ ] Security audit passed

---

**Built with ❤️ by Agent R - Self-healing DeFi infrastructure for the modern web.**
