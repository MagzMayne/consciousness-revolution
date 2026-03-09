# Privy Wallet & Pump.fun Integration Guide

## 🎯 Overview

This guide explains how to set up and use the Privy wallet and pump.fun integration for automated coin creation and autonomous trading across all Barbrick Design projects.

## 📋 Prerequisites

1. **Privy Account**: Sign up at [https://dashboard.privy.io](https://dashboard.privy.io)
2. **Solana Wallet**: Phantom, Solflare, or any Solana-compatible wallet
3. **SOL Balance**: Minimum 1 SOL for transactions and fees
4. **API Access**: Privy API key from your dashboard

## 🔧 Configuration

### Step 1: Get Privy Credentials

1. Visit [Privy Dashboard](https://dashboard.privy.io)
2. Create a new app
3. Copy your **App ID** and **API Key**
4. Note your app's configuration settings

### Step 2: Set Environment Variables

Create a `.env` file in the repository root:

```bash
# Privy Configuration
PRIVY_APP_ID=your_privy_app_id_here
PRIVY_API_KEY=your_privy_api_key_here

# Network Configuration
NODE_ENV=production  # or 'development' for devnet

# Optional: WalletConnect
WALLETCONNECT_PROJECT_ID=your_walletconnect_id
```

### Step 3: Update Configuration File

Edit `src/privy/privy-config.js`:

```javascript
const PRIVY_CONFIG = {
    appId: 'YOUR_PRIVY_APP_ID',
    defaultNetwork: 'solana-mainnet', // or 'solana-devnet'
    
    // Customize these settings
    walletConfig: {
        autoConnect: true,
        enableEmbeddedWallet: true
    },
    
    trading: {
        enabled: true,
        autoTrade: false, // Set true to enable auto-trading
        maxTradeAmount: 100,
        minBalanceThreshold: 0.1
    }
};
```

## 🚀 Usage

### Launch the Dashboard

1. Open `autonomous-trading-dashboard.html` in your browser
2. Click **"Connect Wallet"**
3. Choose your preferred connection method:
   - External wallet (Phantom, Solflare, etc.)
   - Privy embedded wallet (email/social login)
   - Social login (Google, Twitter, Discord)

### Create Coins for Projects

1. After connecting your wallet, click **"Create Coins"**
2. The system will:
   - Load all projects from `projects.json`
   - Generate unique token metadata for each project
   - Create coins on pump.fun in batches
   - Track creation status and results

**Note**: Coin creation requires:
- Connected wallet with sufficient SOL
- Transaction approval for each batch
- Network fees (typically ~0.01 SOL per coin)

### Start Autonomous Trading

1. Click **"Start Trading"** after coins are created
2. The trading agent will:
   - Monitor all created tokens
   - Analyze market conditions
   - Execute buy/sell orders based on signals
   - Manage risk with stop-loss and take-profit
   - Track positions and P/L

**Trading Strategies**:
- **Swing Trading**: Hold positions for 1-7 days
- **Scalping**: Quick in/out trades (disabled by default)
- **HODL**: Long-term holding for appreciation

### Monitor Performance

The dashboard shows:
- **Wallet Status**: Connection, balance, address
- **Trading Agent**: Active positions, total trades, P/L
- **Coin Creator**: Created coins, pending, failed
- **Risk Management**: Daily loss limits, position sizes
- **Activity Log**: Real-time event tracking

## 💰 Income Generation Strategies

The system implements multiple strategies to maximize returns:

### 1. Staking (30% allocation)
- Stake SOL on Solana validators
- Expected APY: 8%
- Risk: Low

### 2. Liquidity Provision (40% allocation)
- Provide liquidity to pump.fun pools
- Expected APY: 15%
- Risk: Medium

### 3. Automated Trading (30% allocation)
- Active trading of project tokens
- Expected APY: 25%
- Risk: High

## ⚠️ Risk Management

Built-in safety features:

### Stop-Loss & Take-Profit
- **Stop-Loss**: Auto-sell at 5% loss
- **Take-Profit**: Auto-sell at 10% gain
- **Trailing Stop**: Optional (configurable)

### Position Limits
- **Max Position Size**: $100 USD per trade
- **Max Daily Loss**: $20 USD
- **Min Balance Threshold**: 0.1 SOL

### Daily Circuit Breakers
- Trading pauses if daily loss limit reached
- Resets at midnight UTC
- Manual override available

## 🛠️ Advanced Configuration

### Custom Trading Strategies

Edit `src/agents/autonomous-trading-agent.js`:

```javascript
calculateTradingSignals(marketData) {
    const signals = {
        trend: 'neutral',
        recommendation: 'hold'
    };
    
    // Add your custom logic here
    if (marketData.priceChange24h > 10) {
        signals.trend = 'bullish';
        signals.recommendation = 'buy';
    }
    
    return signals;
}
```

### Adjust Risk Parameters

Edit `src/privy/privy-config.js`:

```javascript
trading: {
    maxTradeAmount: 200,        // Increase max trade size
    minBalanceThreshold: 0.5,   // Higher safety margin
    slippageTolerance: 0.02,    // 2% slippage
    tradingStrategies: {
        scalping: true,         // Enable scalping
        swing: true,
        hodl: false             // Disable HODL
    }
}
```

### Coin Creation Filters

Edit `src/pumpfun/coin-creator.js`:

```javascript
shouldCreateCoin(project) {
    // Only create for high-value projects
    if (project.value < 10000) return false;
    
    // Only create for specific categories
    const allowedCategories = ['Blockchain & Crypto', 'AI & Machine Learning'];
    if (!allowedCategories.includes(project.category)) return false;
    
    return true;
}
```

## 📊 API Endpoints

The system uses these pump.fun API endpoints:

- `POST /api/create-coin` - Create new token
- `POST /api/trade` - Execute trade
- `GET /api/market/:address` - Get market data
- `GET /api/balance/:wallet/:token` - Get token balance
- `GET /api/coins/:symbol` - Check if coin exists

## 🧪 Testing

### Development/Testnet Mode

1. Set environment to development:
```javascript
defaultNetwork: 'solana-devnet'
```

2. Use devnet SOL (free from faucet)
3. Test all features without risk
4. Monitor console for detailed logs

### Testing Checklist

- [ ] Wallet connection (all types)
- [ ] Coin creation (single & batch)
- [ ] Trading signals generation
- [ ] Position opening/closing
- [ ] Risk management triggers
- [ ] Balance updates
- [ ] Error handling

## 🔐 Security Best Practices

1. **Never commit private keys**
   - Use environment variables
   - Add `.env` to `.gitignore`

2. **Use secure connections**
   - HTTPS only for API calls
   - WSS for WebSocket connections

3. **Validate transactions**
   - Review before signing
   - Check recipient addresses
   - Verify amounts

4. **Monitor activity**
   - Check dashboard regularly
   - Review activity logs
   - Set up alerts for large trades

5. **Backup wallet**
   - Export private keys securely
   - Store in offline location
   - Test recovery process

## 📞 Support

For issues or questions:

- **Email**: BarbrickDesign@gmail.com
- **GitHub Issues**: [Create an issue](https://github.com/barbrickdesign/barbrickdesign.github.io/issues)
- **Documentation**: Check README files in `docs/`

## 🎓 Learning Resources

- [Privy Documentation](https://docs.privy.io)
- [Pump.fun API Docs](https://docs.pump.fun)
- [Solana Development](https://docs.solana.com)
- [Web3.js Guide](https://solana-labs.github.io/solana-web3.js)

## 📝 License

© 2008-2026 Ryan Barbrick (Barbrick Design). All Rights Reserved.

For licensing inquiries: BarbrickDesign@gmail.com
