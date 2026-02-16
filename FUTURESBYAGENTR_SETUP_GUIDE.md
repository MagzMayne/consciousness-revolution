# FuturesByAgentR - Complete Setup Guide

## 🚀 Automated Trading Platform with TopStepX API Integration

FuturesByAgentR is a professional-grade futures trading platform with full TopStepX API integration, enabling both demo trading and real automated trading through your TopStepX accounts.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [TopStepX API Setup](#topstepx-api-setup)
5. [Platform Features](#platform-features)
6. [Trading Modes](#trading-modes)
7. [Order Execution](#order-execution)
8. [Risk Management](#risk-management)
9. [Troubleshooting](#troubleshooting)
10. [API Reference](#api-reference)

---

## Overview

### What is FuturesByAgentR?

FuturesByAgentR is a comprehensive futures trading platform that provides:

- ✅ **Real-time market data** via TopStepX API WebSocket connection
- ✅ **Automated order execution** through TopStepX accounts
- ✅ **Demo mode** for risk-free testing and strategy development
- ✅ **Live trading mode** for real money trading
- ✅ **Multi-account management** for trading across multiple TopStepX accounts
- ✅ **Advanced charting** with technical indicators
- ✅ **Position tracking** with P&L calculations
- ✅ **Order history** and trade analytics

### Key Features

1. **Dual Trading Modes**
   - 🟢 **Demo Mode**: Simulated trading with no real money risk
   - 🔴 **Live Mode**: Real trading through TopStepX API

2. **Real-Time Data**
   - WebSocket connection for live price updates
   - Sub-second data refresh rates
   - Support for all major futures contracts (ES, NQ, YM, CL, GC, etc.)

3. **Professional Order Management**
   - Market and limit orders
   - Order status tracking
   - Automatic position management
   - FIFO position closing

4. **Account Integration**
   - Connect multiple TopStepX accounts
   - Real-time balance and equity updates
   - Buying power tracking
   - Automated sync with broker

---

## Prerequisites

### Required Software

1. **Web Browser**
   - Chrome, Firefox, Safari, or Edge (latest version)
   - JavaScript enabled
   - WebSocket support

2. **Python 3.7+** (for TopStepX API bridge)
   - Required only if using TopStepX live data
   - Download: https://www.python.org/downloads/

3. **TopStepX Account** (for live trading)
   - Active TopStepX subscription
   - API access enabled
   - API credentials (username + API key)

### Optional Requirements

- Git (for repository cloning)
- Code editor (VS Code, Sublime Text, etc.)

---

## Quick Start

### Option 1: Demo Mode (No Setup Required)

1. Open `FuturesByAgentR.html` in your web browser
2. The platform starts in **Demo Mode** by default
3. Start trading with simulated data immediately
4. All features work without API connection

### Option 2: Live Data with TopStepX API

Follow the complete setup process below.

---

## TopStepX API Setup

### Step 1: Enable API Access

1. **Log in to TopStepX Platform**
   - Visit: https://www.topstepx.com
   - Log in with your credentials

2. **Navigate to API Settings**
   - Go to **Settings** → **API**
   - Click **Subscribe to API Access**
   - Enter payment information or promo code

3. **Generate API Key**
   - Click **Generate API Key**
   - Save your **API Key** securely
   - Note your **Username** (usually your email)

### Step 2: Install Python Bridge Dependencies

The Python bridge connects the web platform to TopStepX API.

```bash
# Navigate to the repository directory
cd /path/to/barbrickdesign.github.io

# Run the setup script
python setup_tsx_api.py --setup
```

This will:
- Install required Python packages (websockets, tsxapi4py)
- Create a `.env` file for your credentials
- Verify all dependencies

### Step 3: Configure API Credentials

Edit the `.env` file created in your project directory:

```env
# TopStepX API Configuration
API_KEY=your_actual_api_key_here
USERNAME=your_actual_username_here
ENVIRONMENT=DEMO  # or LIVE for live trading
```

**Security Note**: Never commit the `.env` file to version control!

### Step 4: Start the API Bridge

Launch the WebSocket bridge server:

```bash
python setup_tsx_api.py --launch
```

You should see:
```
=== Launching TopStepX API Bridge ===
Authenticating with TopStepX API...
Successfully authenticated with TopStepX API
Starting WebSocket server on 127.0.0.1:8765
WebSocket server running at ws://127.0.0.1:8765
```

**Keep this terminal window open** - the bridge must run continuously.

### Step 5: Configure the Trading Platform

1. **Open FuturesByAgentR.html** in your browser

2. **Click the ⚙️ API Settings button** in the header

3. **Configure API Settings**:
   - **Data Provider**: Select "TopStepX API"
   - **API Key**: Enter your TopStepX API key
   - **Username**: Enter your TopStepX username
   - **Bridge URL**: `ws://localhost:8765` (default)

4. **Test Connection**:
   - Click **🧪 Test Bridge Connection**
   - Wait for confirmation message
   - Status indicator should turn green

5. **Select Trading Account**:
   - Your TopStepX accounts will appear in the dropdown
   - Select the account you want to trade with

6. **Save Settings**:
   - Click **Save**
   - Settings are stored in browser localStorage

---

## Platform Features

### Main Interface

#### Header Bar
- **Logo**: Platform branding
- **API Settings Button**: Configure API and accounts
- **Connection Indicator**: Shows connection status (Live/Demo)

#### Market Selection
- Tabs for different futures contracts (ES, NQ, YM, etc.)
- Click to switch markets
- Automatically resubscribes to live data

#### Chart Display
- Real-time candlestick chart
- Technical indicators (coming soon)
- Volume profile
- Support/resistance levels

#### Order Entry
- **Market Order**: Execute at current price
- **Limit Order**: Set specific price
- **Quantity**: Number of contracts (1-50)
- **Buy/Sell Buttons**: Quick order execution

#### Position Tracking
- Open positions list
- Net position display
- Unrealized P&L
- Position-specific close buttons

#### Performance Stats
- Current equity
- Realized P&L
- Win rate
- Total trades
- Max drawdown

---

## Trading Modes

### Demo Mode (Default)

**Status**: 🟢 **DEMO**

- All orders execute locally (simulated)
- No connection to TopStepX required
- No real money at risk
- Perfect for strategy testing
- Starting capital: $50,000 (configurable)

**How to Use**:
1. Platform starts in Demo mode automatically
2. Trade normally using Buy/Sell buttons
3. Orders execute instantly at current price
4. P&L calculated and tracked

### Live Trading Mode

**Status**: 🔴 **LIVE**

- Orders route through TopStepX API
- Real money trading
- Requires active API connection
- Requires selected account

**How to Enable**:

1. **Connect to TopStepX API** (see setup above)
2. **Open API Settings** (⚙️ button)
3. **Select an account** from the dropdown
4. **Click "Enable Live Trading"** button
5. **Confirm the warning**:
   ```
   ⚠️ WARNING: Switching to LIVE TRADING MODE
   
   You are about to enable real trading through your TopStepX account.
   All orders will be executed with real money.
   
   Are you sure you want to continue?
   ```
6. **Status changes** to 🔴 LIVE

**Important Notes**:
- ⚠️ Live mode trades with **real money**
- Orders cannot be undone
- You are responsible for all trades
- Test thoroughly in Demo mode first
- Monitor your account closely

### Switching Between Modes

1. Open **API Settings**
2. Locate **Trading Mode** section
3. Click the toggle button
4. Confirm the change
5. Mode indicator updates immediately

---

## Order Execution

### Demo Mode Execution

1. **Order Entry**:
   - Set quantity (1-50 contracts)
   - Choose order type (Market/Limit)
   - Click Buy or Sell

2. **Execution**:
   - Instant execution at current price
   - Position opens immediately
   - P&L calculations begin

3. **Confirmation**:
   - Visual feedback (button highlight)
   - Audio feedback (optional)
   - Trade log updated

### Live Mode Execution

1. **Order Entry**:
   - Same as Demo mode

2. **API Submission**:
   - Order sent to TopStepX API via WebSocket
   - Unique order ID generated
   - Added to pending orders queue

3. **Order Processing**:
   ```
   📤 Order submitted to TopStepX API
   ⏳ Waiting for confirmation...
   ✅ Order filled: 2 @ $5,234.50
   ```

4. **Status Updates**:
   - `PENDING` - Order submitted
   - `SUBMITTED` - Exchange received order
   - `FILLED` - Order executed
   - `REJECTED` - Order rejected by exchange
   - `CANCELLED` - Order cancelled

5. **Position Sync**:
   - Automatic sync with TopStepX account
   - Real-time position updates
   - Account balance refresh

### Order Types

#### Market Order
- Executes immediately at current price
- No price specification needed
- Guaranteed fill (in normal conditions)
- Subject to slippage

#### Limit Order
- Executes only at specified price or better
- May not fill if price not reached
- No slippage guarantee
- Better price control

### Position Management

#### Opening Positions
- Click **Buy** to open long position
- Click **Sell** to open short position
- Position tracked automatically
- P&L calculated in real-time

#### Closing Positions
- Click opposite side button (Sell for long, Buy for short)
- Positions close in FIFO order
- P&L realized on close
- Commission deducted ($2.50/contract)

#### Partial Closes
- Enter quantity less than position size
- Remaining position stays open
- P&L calculated on closed portion

---

## Risk Management

### Built-in Protections

1. **Position Limits**
   - Maximum ±50 contracts
   - Prevents over-leverage
   - Configurable (future update)

2. **Buying Power Validation** (Live Mode)
   - Checks available funds before order
   - Prevents insufficient funds orders
   - Real-time balance updates

3. **Risk Warnings**
   - Consecutive loss alerts
   - Drawdown warnings
   - Daily loss limit notifications

### Best Practices

1. **Start in Demo Mode**
   - Test strategies thoroughly
   - Understand platform mechanics
   - Practice order execution

2. **Use Small Positions**
   - Start with 1-2 contracts
   - Increase size gradually
   - Never risk more than 2% per trade

3. **Set Stop Losses**
   - Define maximum loss per trade
   - Exit losing positions quickly
   - Protect capital

4. **Monitor Account**
   - Check balance regularly
   - Review P&L daily
   - Track performance metrics

5. **Keep Bridge Running**
   - Ensure Python bridge is active
   - Monitor for connection drops
   - Have reconnection plan

---

## Troubleshooting

### Connection Issues

**Problem**: Cannot connect to TopStepX API Bridge

**Solutions**:
1. Verify Python bridge is running
   ```bash
   python setup_tsx_api.py --launch
   ```

2. Check bridge URL in settings
   - Default: `ws://localhost:8765`
   - Must match bridge server address

3. Check firewall settings
   - Allow port 8765
   - Check for blocking software

4. Verify credentials in `.env`
   - Correct API key
   - Correct username
   - Valid ENVIRONMENT setting

**Problem**: "Not Connected" status in platform

**Solutions**:
1. Click **Test Bridge Connection**
2. Check browser console for errors (F12)
3. Restart Python bridge
4. Refresh browser page

### Authentication Issues

**Problem**: "Authentication failed" error

**Solutions**:
1. Verify API key is correct
2. Check TopStepX subscription is active
3. Ensure API access is enabled in TopStepX
4. Try regenerating API key

### Data Issues

**Problem**: No live data appearing

**Solutions**:
1. Check market is open for selected contract
2. Verify subscription to contract
3. Check browser console for messages
4. Restart bridge and reconnect

**Problem**: Delayed or missing price updates

**Solutions**:
1. Check internet connection
2. Verify WebSocket connection is stable
3. Look for reconnection messages in console
4. Restart bridge if needed

### Order Execution Issues

**Problem**: Orders not executing in Live Mode

**Solutions**:
1. Verify Live Mode is enabled (🔴 LIVE indicator)
2. Check account is selected
3. Ensure sufficient buying power
4. Check order quantity is valid (1-50)
5. Review browser console for error messages

**Problem**: Order rejected by exchange

**Solutions**:
1. Check buying power is sufficient
2. Verify order quantity is valid
3. Ensure market is open
4. Check limit price is reasonable (if limit order)
5. Review rejection reason in notification

### Account Sync Issues

**Problem**: Account balance not updating

**Solutions**:
1. Click **🔄 Sync Account Data** button
2. Verify API connection is active
3. Check for errors in browser console
4. Refresh browser page

---

## API Reference

### JavaScript API

#### Global Variables

```javascript
// API Connection
wsConnection          // WebSocket connection object
wsConnected          // Boolean: connection status
apiActiveAccount     // Currently selected account object
apiUseRealTrading    // Boolean: live mode enabled

// Account Data
apiAccountData       // Account balance, equity, buying power
apiConnectedAccounts // Array of available accounts
pendingOrders        // Map of pending orders by ID
apiOrderHistory      // Array of completed orders
```

#### Key Functions

##### placeAPIOrder()
```javascript
async function placeAPIOrder(symbol, side, quantity, price, orderType = 'MARKET')
```
**Parameters**:
- `symbol`: Contract symbol (e.g., 'ES', 'NQ')
- `side`: 'BUY' or 'SELL'
- `quantity`: Number of contracts (1-50)
- `price`: Limit price (null for market orders)
- `orderType`: 'MARKET' or 'LIMIT'

**Returns**: `{success: boolean, orderId: string, ...}`

##### cancelAPIOrder()
```javascript
async function cancelAPIOrder(orderId)
```
**Parameters**:
- `orderId`: Order ID to cancel

**Returns**: `{success: boolean}`

##### getAPIAccountInfo()
```javascript
async function getAPIAccountInfo()
```
Gets current account balance and equity.

##### getAPIPositions()
```javascript
async function getAPIPositions()
```
Gets current open positions from TopStepX.

##### syncWithAPI()
```javascript
async function syncWithAPI()
```
Syncs all account data, positions, and order history.

##### toggleTradingMode()
```javascript
function toggleTradingMode()
```
Switches between Demo and Live trading modes.

### WebSocket Message Types

#### Outgoing Messages

**Subscribe to Contract**:
```json
{
  "action": "subscribe",
  "contract": "ES"
}
```

**Place Order**:
```json
{
  "action": "place_order",
  "orderId": "ORDER_123",
  "accountId": "account-id",
  "contract": "ES",
  "side": "BUY",
  "quantity": 1,
  "price": null,
  "orderType": "MARKET"
}
```

**Get Accounts**:
```json
{
  "action": "get_accounts"
}
```

#### Incoming Messages

**Quote Update**:
```json
{
  "type": "quote",
  "contract": "ES",
  "data": {
    "price": 5234.50,
    "bid": 5234.25,
    "ask": 5234.75,
    "volume": 12500
  }
}
```

**Order Filled**:
```json
{
  "type": "order_filled",
  "orderId": "ORDER_123",
  "fillPrice": 5234.50,
  "fillQuantity": 1,
  "partial": false
}
```

**Account Info**:
```json
{
  "type": "account_info",
  "data": {
    "balance": 52350.00,
    "equity": 52500.00,
    "buyingPower": 50000.00,
    "realizedPnl": 2500.00
  }
}
```

---

## Support

### Resources

- **TopStepX API Documentation**: https://api.topstepx.com/swagger/index.html
- **TopStepX Help Center**: https://help.topstep.com/
- **Repository Issues**: https://github.com/barbrickdesign/barbrickdesign.github.io/issues
- **Email Support**: BarbrickDesign@gmail.com

### Common Questions

**Q: Is this platform free to use?**  
A: Yes, the platform is free and open source. TopStepX API access requires a paid subscription.

**Q: Can I use other brokers besides TopStepX?**  
A: Currently only TopStepX is supported. Other broker integrations may be added in the future.

**Q: Is my data secure?**  
A: API credentials are stored in browser localStorage. The Python bridge runs locally on your machine. Never share your API keys.

**Q: Can I run this on a server?**  
A: Yes, you can run the Python bridge on a remote server. Update the bridge URL in settings to point to your server's IP address.

**Q: What markets are supported?**  
A: All major futures contracts including:
- Equity Indices: ES, NQ, YM, RTY
- Energy: CL, NG
- Metals: GC, SI
- Treasuries: ZB, ZN
- Currencies: 6E, 6J, 6A
- Agricultural: ZC, ZS, ZW

---

## Version History

### v1.0.0 (2026-02-04)
- Initial release with full TopStepX API integration
- Demo and Live trading modes
- Real-time market data via WebSocket
- Multi-account management
- Order execution and tracking
- Position management
- P&L calculations
- Comprehensive UI and documentation

---

## License

Copyright © 2024-2026 Barbrick Design. All rights reserved.

This software is provided for educational and trading purposes. Use at your own risk. The authors are not responsible for any financial losses incurred through use of this platform.

---

## Disclaimer

**IMPORTANT**: Trading futures involves substantial risk of loss and is not suitable for all investors. Past performance is not indicative of future results. This platform is provided "as is" without any warranties. Always test thoroughly in demo mode before live trading.
