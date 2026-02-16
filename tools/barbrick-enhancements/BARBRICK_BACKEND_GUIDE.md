# Using Barbrick Backend Services

## Overview

The barbrickdesign.github.io integration includes production-ready backend microservices that can be deployed to support Web3 and DeFi applications.

## Directory Structure

```
barbrickdesign.github.io-main/backend/
├── README.md                   # Main backend documentation
├── package.json                # Dependencies and scripts
├── deploy-services.js          # Automated deployment
├── micro-tx-service/           # Transaction processing
├── anchor-service/             # Solana program interactions
├── affiliate-service/          # Referral tracking
├── relayer-service/            # Gas-less transactions
└── contracts/                  # Smart contracts
    ├── VaultCoin.sol           # ERC20 token
    ├── DripProtocol.sol        # Dividend distribution
    └── deploy.js               # Contract deployment
```

## Quick Start

### 1. Install Dependencies

```bash
cd barbrickdesign.github.io-main/backend
npm install
```

### 2. Configure Environment

Create a `.env` file based on `.env.example`:

```bash
# Blockchain RPCs
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY

# Wallet Keys (NEVER commit these!)
SOLANA_PRIVATE_KEY=your_base58_private_key
ETHEREUM_PRIVATE_KEY=0x_your_private_key

# Service Configuration
MICRO_TX_PORT=3001
ANCHOR_PORT=3002
AFFILIATE_PORT=3003
RELAYER_PORT=3004

# API Keys
SAMGOV_API_KEY=your_samgov_key
PUMPFUN_API_KEY=your_pumpfun_key
```

### 3. Start Services

#### Option A: Start All Services

```bash
npm run start-all
```

This starts all 4 microservices:
- micro-tx-service on port 3001
- anchor-service on port 3002
- affiliate-service on port 3003
- relayer-service on port 3004

#### Option B: Start Individual Services

```bash
# Transaction service only
npm run micro-tx

# Anchor service only
npm run anchor

# Affiliate service only
npm run affiliate

# Relayer service only
npm run relayer
```

## Service Descriptions

### 1. Micro-TX Service (Port 3001)

Handles transaction processing for multiple blockchains.

**Endpoints:**
```
POST /api/tx/submit
POST /api/tx/status
GET /api/tx/history/:address
```

**Example:**
```javascript
const response = await fetch('http://localhost:3001/api/tx/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chain: 'solana',
    from: 'sender_address',
    to: 'recipient_address',
    amount: 1.5,
    token: 'SOL'
  })
});
```

### 2. Anchor Service (Port 3002)

Solana program (smart contract) interactions using Anchor framework.

**Endpoints:**
```
POST /api/anchor/call
GET /api/anchor/programs
GET /api/anchor/accounts/:program
```

**Example:**
```javascript
const response = await fetch('http://localhost:3002/api/anchor/call', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    program: 'your_program_id',
    instruction: 'initialize',
    accounts: [...],
    args: {...}
  })
});
```

### 3. Affiliate Service (Port 3003)

Referral tracking and commission management.

**Endpoints:**
```
POST /api/affiliate/register
POST /api/affiliate/track
GET /api/affiliate/stats/:code
GET /api/affiliate/payouts/:code
```

**Example:**
```javascript
// Register new affiliate
const response = await fetch('http://localhost:3003/api/affiliate/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'affiliate@example.com',
    referralCode: 'MYCODE123'
  })
});

// Track referral
await fetch('http://localhost:3003/api/affiliate/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    referralCode: 'MYCODE123',
    action: 'signup',
    value: 100
  })
});
```

### 4. Relayer Service (Port 3004)

Gas-less transaction relayer for improved UX.

**Endpoints:**
```
POST /api/relay/submit
GET /api/relay/status/:txid
GET /api/relay/balance
```

**Example:**
```javascript
// Submit transaction without gas
const response = await fetch('http://localhost:3004/api/relay/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chain: 'ethereum',
    transaction: {
      to: 'recipient',
      data: '0x...',
      value: '0'
    },
    signature: 'user_signature'
  })
});
```

## Smart Contracts

### VaultCoin (ERC20 Token)

Standard ERC20 token implementation.

```bash
cd contracts
npm install
npx hardhat compile

# Deploy to testnet
npx hardhat run deploy.js --network goerli

# Deploy to mainnet (careful!)
npx hardhat run deploy.js --network mainnet
```

**Contract Features:**
- Standard ERC20 functionality
- Minting/burning capabilities
- Pausable
- Access control

### DripProtocol (Dividend Distribution)

Automatic dividend distribution to token holders.

**Features:**
- Automated dividend payments
- Proportional distribution based on holdings
- Claim mechanism
- Emergency pause

## API Integration Examples

### Using SAM.GOV Integration

```javascript
import { SAMGovAPI } from '../src/systems/samgov-api-integration.js';

const samgov = new SAMGovAPI(process.env.SAMGOV_API_KEY);

// Search contracts
const contracts = await samgov.searchContracts({
  keywords: 'software development',
  state: 'CA',
  limit: 100
});

// Get award details
const award = await samgov.getAwardDetails('AWARD_ID');
```

### Using Pumpfun Integration

```javascript
import { PumpfunIntegration } from '../src/systems/pumpfun-integration.js';

const pumpfun = new PumpfunIntegration();

// Create new token
const token = await pumpfun.createToken({
  name: 'My Token',
  symbol: 'MTK',
  supply: 1000000,
  decimals: 9
});

// Get token info
const info = await pumpfun.getTokenInfo(token.address);
```

## Deployment

### Local Development

Services run on localhost with default ports. Use for testing and development.

### Production Deployment

#### Option 1: Traditional Server

1. Set up Ubuntu/Debian server
2. Install Node.js 16+
3. Clone repository
4. Install dependencies
5. Configure environment
6. Use PM2 for process management:

```bash
npm install -g pm2

# Start all services
pm2 start deploy-services.js

# Monitor
pm2 monit

# Logs
pm2 logs

# Restart
pm2 restart all
```

#### Option 2: Docker

```bash
# Build
docker build -t barbrick-backend .

# Run
docker run -p 3001-3004:3001-3004 \
  -e SOLANA_RPC_URL=$SOLANA_RPC_URL \
  -e ETHEREUM_RPC_URL=$ETHEREUM_RPC_URL \
  barbrick-backend
```

#### Option 3: Cloud Services

**Heroku:**
```bash
heroku create barbrick-backend
git push heroku main
```

**Railway:**
- Connect GitHub repository
- Set environment variables
- Deploy automatically

**Render:**
- Connect GitHub repository
- Configure build command: `npm install`
- Configure start command: `npm run start-all`

## Monitoring

### Health Checks

```bash
# Check all services
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3004/health
```

### Logging

Logs are written to:
- Console (development)
- `logs/` directory (production)
- Cloud logging service (if configured)

### Performance Metrics

Services expose metrics at `/metrics` endpoint:

```bash
curl http://localhost:3001/metrics
```

## Security

### Best Practices

1. **Never commit private keys** - Use environment variables
2. **Rate limiting** - Enabled by default (100 req/min per IP)
3. **CORS** - Configure allowed origins
4. **HTTPS** - Always use HTTPS in production
5. **API keys** - Rotate regularly
6. **Input validation** - All inputs are validated
7. **SQL injection** - Parameterized queries only

### Environment Security

```bash
# Encrypt .env file (never commit plain .env)
gpg --symmetric --cipher-algo AES256 .env

# Decrypt when needed
gpg --decrypt .env.gpg > .env
```

## Troubleshooting

### Common Issues

**Services won't start:**
- Check port availability: `lsof -i :3001`
- Verify environment variables are set
- Check logs for errors

**Connection errors:**
- Verify RPC URLs are correct
- Check network connectivity
- Verify API keys are valid

**Transaction failures:**
- Check wallet has sufficient balance
- Verify transaction parameters
- Check network congestion

### Debug Mode

Enable debug logging:

```bash
DEBUG=* npm run start-all
```

## Support

### Documentation
- Backend README: `backend/README.md`
- Service-specific READMEs in each service directory
- Smart contract docs: `contracts/README.md`

### Contact
- **Email**: BarbrickDesign@gmail.com
- **GitHub**: Issues in repository
- **Discord**: (if available)

## Updates

### Checking for Updates

```bash
cd barbrickdesign.github.io-main/backend
git pull origin main
npm install
npm run restart
```

### Version History

See `CHANGELOG.md` for version history and breaking changes.

## Contributing

To contribute improvements:

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

See `LICENSE` file in repository root.

---

**Created by**: Ryan Barbrick (Barbrick Design)  
**AI Assistant**: Merlin AI  
**Contact**: BarbrickDesign@gmail.com
