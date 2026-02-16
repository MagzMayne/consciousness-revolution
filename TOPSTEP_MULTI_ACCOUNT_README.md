# TopStep Multi-Account Manager & Copy Trading System

## Overview

This system enhances the TopStep automated trading signals tool to support multiple accounts and copy trading functionality. It allows traders to manage multiple TopStep accounts from a centralized hub and automatically replicate successful trading strategies across accounts.

## Features

### 🏢 Multi-Account Management
- Create and manage unlimited TopStep trading accounts
- Support for different account types (Demo, Combine, Funded)
- Centralized dashboard with real-time statistics
- Individual account performance tracking
- Easy account switching and management

### 🔄 Copy Trading Engine
- Designate accounts as "Master Traders" (signal sources)
- Automatic signal distribution to follower accounts
- Customizable copy ratios per relationship
- Contract and signal type filters
- Performance tracking per relationship
- Stop-loss protection for copy trading

### 📊 Performance Analytics
- Win rate calculation
- Profit factor tracking
- Sharpe ratio computation
- Real-time P&L monitoring
- Trade history and statistics
- Top performers leaderboard

### 🎯 Advanced Signal System
- ML-powered trading signals (RSI, MA Crossover, Momentum)
- Real-time price predictions
- Confidence scoring for each signal
- Automatic signal recording and distribution
- 30+ tradable futures contracts support

## Architecture

### Core Components

#### 1. Account Manager (`src/topstep/account-manager.js`)
- Manages account lifecycle (CRUD operations)
- Stores account data in localStorage
- Tracks performance metrics
- Handles trade recording
- Calculates statistics

#### 2. Copy Trading Engine (`src/topstep/copy-trading.js`)
- Manages master trader registration
- Handles copy trading relationships
- Distributes signals to followers
- Applies filters and copy ratios
- Tracks copy trading performance

#### 3. Hub Integration (`src/topstep/hub-integration.js`)
- Bridges trading interface with hub
- Syncs data between components
- Handles signal recording
- Manages URL parameters
- Provides unified API for futures.html

#### 4. Hub Interface (`topstep-hub.html`)
- Central dashboard for account management
- Visual account cards with statistics
- Copy trading setup interface
- Top performers leaderboard
- Account creation/deletion

#### 5. Trading Interface (`futures.html`)
- Enhanced with hub integration
- Account info panel
- Automatic signal distribution
- Real-time balance updates
- Hub access badge

## Usage

### Getting Started

1. **Open the Hub**
   - Navigate to `topstep-hub.html`
   - Or click the "🎯 Hub" badge in `futures.html`

2. **Create Your First Account**
   - Click "➕ Add Account"
   - Enter account details
   - Choose account type (Demo/Combine/Funded)
   - Set initial balance

3. **Set Up Copy Trading** (Optional)
   - Click "👤 Make Master" on an account to enable signal sharing
   - Click "📊 Manage" in Copy Trading section
   - Select a master trader to follow
   - Configure copy settings

4. **Start Trading**
   - Click "📈 Trade" on any account
   - Trading interface opens with account loaded
   - Signals automatically generated and distributed

### Copy Trading Setup

#### Master Trader Configuration
```javascript
// Register an account as a master trader
copyTradingEngine.registerMasterTrader(accountId, {
  allowCopying: true,
  minCopyBalance: 10000,
  maxCopiers: 10,
  shareSignals: true,
  requireApproval: false
});
```

#### Follower Configuration
```javascript
// Create a copy trading relationship
copyTradingEngine.createCopyRelationship(followerAccountId, masterAccountId, {
  copyRatio: 1.0,              // 100% of signal size
  maxTradeSize: 5,              // Maximum position size
  stopOnLoss: 1000,             // Stop copying after $1000 loss
  contractsFilter: ['ES', 'NQ'], // Only copy these contracts
  onlySignalType: 'all'         // 'all', 'buy', or 'sell'
});
```

### Account Management API

#### Create Account
```javascript
const account = accountManager.createAccount(
  name,           // Account name
  email,          // Email address
  accountType,    // 'demo', 'combine', or 'funded'
  initialBalance  // Starting balance
);
```

#### Record Trade
```javascript
const trade = accountManager.recordTrade(accountId, {
  contract: 'ES',
  action: 'BUY',
  entryPrice: 4750,
  exitPrice: 4755,
  quantity: 1,
  profit: 250,
  commission: 4.80,
  signal: 'BUY',
  confidence: 87.5
});
```

#### Get Performance Stats
```javascript
const stats = accountManager.getAccountStats(accountId);
// Returns: {
//   balance, pnl, pnlPercent, totalTrades,
//   winRate, profitFactor, sharpeRatio
// }
```

## Data Storage

All data is stored in browser localStorage with the following keys:

- `topstep_accounts` - Account data
- `topstep_active_account` - Active account ID
- `topstep_master_traders` - Master trader registry
- `topstep_copy_relationships` - Copy trading relationships

## Signal Distribution Flow

1. **Signal Generation**: Trading algorithm generates signal in `futures.html`
2. **Recording**: Hub integration records signal for active account
3. **Master Check**: System checks if account is a master trader
4. **Distribution**: Signal distributed to all active followers
5. **Filtering**: Filters applied based on relationship settings
6. **Copy Ratio**: Position size adjusted per follower
7. **Recording**: Copied signals stored in follower accounts
8. **Tracking**: Performance tracked for master and followers

## Supported Futures Contracts

### Metals (COMEX/NYMEX)
- SI - Silver
- GC - Gold
- HG - Copper

### Equity Indices (CME)
- ES - E-mini S&P 500
- MES - Micro E-mini S&P 500
- NQ - E-mini Nasdaq 100
- MNQ - Micro E-mini Nasdaq 100
- RTY - E-mini Russell 2000
- M2K - Micro E-mini Russell 2000
- NKD - Nikkei 225

### Energy (NYMEX)
- CL - Crude Oil
- QM - E-mini Crude Oil
- NG - Natural Gas
- QG - E-mini Natural Gas

### Agriculture (CBOT)
- ZW - Wheat
- ZC - Corn
- ZS - Soybeans
- ZM - Soybean Meal
- ZL - Soybean Oil
- HE - Lean Hogs
- LE - Live Cattle

### Currency (CME Forex)
- 6E - Euro FX
- 6A - Australian Dollar
- 6B - British Pound
- 6C - Canadian Dollar
- 6J - Japanese Yen
- 6S - Swiss Franc
- 6M - Mexican Peso
- 6N - New Zealand Dollar
- E7 - E-mini Euro FX
- M6E - Micro Euro FX
- M6A - Micro AUD/USD
- M6B - Micro GBP/USD

### Financials (CBOT)
- ZN - 10-Year Treasury Note

### Crypto (CME)
- MBT - Micro Bitcoin
- MET - Micro Ether

## Performance Metrics

### Win Rate
Percentage of profitable trades: `(winning trades / total trades) × 100`

### Profit Factor
Ratio of gross profit to gross loss: `total profit / total loss`

### Sharpe Ratio
Risk-adjusted return metric: `average return / standard deviation of returns`

## Technical Indicators

The signal generation system uses multiple technical indicators:

### RSI (Relative Strength Index)
- Oversold: < 30 (bullish signal)
- Overbought: > 70 (bearish signal)
- Neutral: 30-70

### Moving Averages
- MA5: 5-period simple moving average
- MA20: 20-period simple moving average
- Crossover signals (MA5 > MA20 = bullish)

### Momentum
- 10-period momentum indicator
- Positive momentum = bullish
- Negative momentum = bearish

### Confidence Score
Composite score (40-95%) based on:
- Indicator alignment
- Momentum strength
- Historical accuracy

## Security Considerations

⚠️ **Important**: This is a demonstration system using simulated data.

For production use with real TopStep accounts:

1. **Implement proper authentication**
   - Use OAuth or JWT for user sessions
   - Secure API endpoints

2. **Encrypt sensitive data**
   - Use encryption for stored account data
   - Implement HTTPS for all communications

3. **Add rate limiting**
   - Prevent abuse of signal distribution
   - Throttle API requests

4. **Audit logging**
   - Track all account operations
   - Monitor copy trading activity

5. **Data validation**
   - Validate all inputs
   - Sanitize user data

6. **Backup and recovery**
   - Regular backups of account data
   - Implement data recovery procedures

## Future Enhancements

### Planned Features
- [ ] Real-time WebSocket integration for instant signal distribution
- [ ] Advanced risk management tools
- [ ] Strategy backtesting system
- [ ] Social trading features (public master traders)
- [ ] Mobile app support
- [ ] Multi-broker integration
- [ ] Advanced analytics dashboard
- [ ] Automated trade execution
- [ ] Paper trading mode
- [ ] Performance reporting and exports

### Integration Opportunities
- TopStep API integration for live account data
- Broker API connections for automated execution
- Real-time market data feeds
- Cloud storage for account data
- Advanced charting libraries
- Machine learning model improvements

## Support

For questions or issues:
1. Check the demo page: `topstep-demo.html`
2. Review the code comments in source files
3. Test with demo accounts first
4. Contact: BarbrickDesign@gmail.com

## License

Part of barbrickdesign.github.io repository.

## Credits

Developed by BarbrickDesign
Enhanced TopStep automation system with multi-account and copy trading capabilities.
