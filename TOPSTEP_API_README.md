# TopStepX API Integration

Complete integration with the TopStepX API for automated trading, real-time data, and account management.

## 🚀 Features

### Core API Capabilities
- ✅ **Authentication & Session Management** - Secure API authentication with 24-hour token handling and automatic refresh
- ✅ **Account Management** - Retrieve and manage multiple TopStepX accounts
- ✅ **Order Management** - Place, modify, and cancel orders programmatically
- ✅ **Position Management** - Open, close, and manage trading positions
- ✅ **Trade History** - Access complete trade execution history
- ✅ **Contract Search** - Search and retrieve contract information
- ✅ **Historical Data** - Access historical bar data for analysis
- ✅ **Real-Time Data** - WebSocket integration for live market updates

### Enhanced Features
- 🔄 **Auto-Sync** - Automatic synchronization with TopStepX platform
- 📊 **Multi-Account Support** - Manage multiple accounts from one interface
- 📈 **Copy Trading** - Replicate signals across multiple accounts
- 🎯 **Risk Management** - Built-in risk controls and position limits
- 📱 **Real-Time Updates** - Live account, position, and order updates
- 🔔 **Notifications** - Real-time alerts for important events
- 📉 **Performance Tracking** - Detailed statistics and analytics

## 📋 Getting Started

### 1. Enable API Access in TopStepX

1. Log in to your TopStepX platform
2. Navigate to **Settings → API**
3. Subscribe to API access (credit card or promo code required)
4. Generate your API key
5. Save your username and API key securely

### 2. Configure API in TopStep Hub

1. Open [TopStep Hub](https://barbrickdesign.github.io/topstep-hub.html)
2. Click the **⚙️ API Settings** button
3. Enter your TopStepX username and API key
4. Enable API integration
5. Configure sync settings:
   - **Auto-sync**: Automatically sync data at intervals
   - **Real-time data**: Enable WebSocket for live updates
   - **Sync interval**: How often to sync (default: 30 seconds)
6. Click **💾 Save Configuration**
7. Click **🔌 Test Connection** to verify

### 3. Start Trading

Once configured, the hub will:
- Automatically sync your TopStepX accounts
- Display real-time positions and orders
- Enable live trading through the API
- Copy trading signals to linked accounts

## 🔧 API Components

### API Client (`api-client.js`)
Main interface to TopStepX REST API and WebSocket endpoints.

```javascript
const apiClient = new TopStepXAPIClient();

// Authenticate
await apiClient.authenticate();

// Get accounts
const accounts = await apiClient.getAccounts();

// Place an order
const order = await apiClient.placeOrder({
  accountId: 'account-id',
  contractId: 'ES',
  action: 'BUY',
  orderType: 'MARKET',
  quantity: 1
});

// Connect to WebSocket for real-time data
await apiClient.connectWebSocket();
await apiClient.subscribeToMarketData('ES');
```

### API Configuration (`api-config.js`)
Manages API credentials and configuration settings.

```javascript
const apiConfig = new TopStepAPIConfig(apiClient);

// Save credentials
apiConfig.apiClient.saveCredentials('username', 'api-key');

// Enable/disable API
apiConfig.enable();
apiConfig.disable();

// Update settings
apiConfig.updateConfig({
  autoSync: true,
  syncInterval: 30000,
  realTimeData: true
});
```

### API Sync Manager (`api-sync.js`)
Handles synchronization between local data and TopStepX API.

```javascript
const syncManager = new TopStepAPISyncManager(apiClient, accountManager);

// Start auto-sync
syncManager.startAutoSync(30000); // Sync every 30 seconds

// Manual sync
await syncManager.syncAll();

// Sync specific data
await syncManager.syncAccounts();
await syncManager.syncPositions();
await syncManager.syncOrders();
await syncManager.syncTrades();

// Stop auto-sync
syncManager.stopAutoSync();
```

### API Dashboard (`api-dashboard.js`)
Visual monitoring dashboard for API integration status.

```javascript
const dashboard = new TopStepAPIDashboard(apiClient, syncManager);

// Render dashboard
const html = dashboard.renderDashboard();

// Manual sync from dashboard
await dashboard.manualSync();

// Toggle auto-sync
dashboard.toggleAutoSync();
```

## 📊 Supported Endpoints

### Account Management
- `GET /api/accounts` - Get all accounts
- `GET /api/accounts/{id}` - Get account details

### Contracts
- `GET /api/contracts/search?q={query}` - Search contracts
- `GET /api/contracts/{id}` - Get contract details

### Orders
- `GET /api/orders?accountId={id}` - Get orders for account
- `POST /api/orders` - Place new order
- `PUT /api/orders/{id}` - Modify existing order
- `DELETE /api/orders/{id}` - Cancel order

### Positions
- `GET /api/positions?accountId={id}` - Get positions
- `POST /api/positions/{id}/close` - Close position (full or partial)

### Trades
- `GET /api/trades?accountId={id}` - Get trade history

### Historical Data
- `GET /api/data/bars` - Get historical bar data

### Real-Time Data (WebSocket/SignalR)
- Account updates
- Position updates
- Order updates
- Trade executions
- Market data streams

## 🔐 Security Features

- **Secure Storage**: Credentials stored in localStorage (encrypted recommended)
- **Token Management**: Automatic token refresh before expiry
- **Session Handling**: 24-hour token lifetime with auto-renewal
- **Error Handling**: Graceful error handling with reconnection logic
- **Rate Limiting**: Built-in rate limit awareness (coming soon)

## 🛠️ Configuration Options

```javascript
{
  enabled: true,              // Enable/disable API integration
  autoSync: true,            // Auto-sync account data
  syncInterval: 30000,       // Sync interval in milliseconds (30s)
  realTimeData: true,        // Enable WebSocket real-time updates
  notifications: true        // Enable push notifications
}
```

## 📈 Advanced Features

### Copy Trading with API
When an account is designated as a master trader and API is enabled:
1. Signals generated locally are synced to API
2. API orders are executed across follower accounts
3. Trade results are synced back to local storage
4. Performance metrics updated in real-time

### Multi-Account Management
- Sync multiple TopStepX accounts
- Aggregate statistics across all accounts
- Unified order and position management
- Cross-account copy trading

### Risk Management Integration
- Max position size enforcement via API
- Daily loss limits tracked in real-time
- Automatic position closure on breach
- Risk metrics calculated from API data

## 🔗 Resources

- **API Documentation**: [https://api.topstepx.com/swagger/index.html](https://api.topstepx.com/swagger/index.html)
- **TopStep Help Center**: [https://help.topstep.com/en/articles/11187768-topstepx-api-access](https://help.topstep.com/en/articles/11187768-topstepx-api-access)
- **Python SDK**: [https://project-x-py.readthedocs.io/](https://project-x-py.readthedocs.io/)
- **TypeScript Client**: [https://hunter547.github.io/TopstepX-API/](https://hunter547.github.io/TopstepX-API/)

## ⚠️ Important Notes

1. **API Subscription Required**: TopStepX API access requires an active subscription
2. **Rate Limits**: Be aware of API rate limits to avoid throttling
3. **Real Money**: When using funded accounts, real money is at risk
4. **Testing**: Always test with demo accounts first
5. **Security**: Never share your API key publicly
6. **Token Expiry**: Tokens expire after 24 hours and require re-authentication

## 🐛 Troubleshooting

### Connection Issues
- Verify username and API key are correct
- Check that API subscription is active in TopStepX platform
- Ensure no firewall blocking API requests
- Check browser console for detailed error messages

### Sync Issues
- Verify API credentials are valid
- Check internet connectivity
- Ensure token hasn't expired
- Review sync statistics in API dashboard

### WebSocket Issues
- Check if real-time data is enabled in settings
- Verify WebSocket URL is correct
- Check for firewall blocking WebSocket connections
- Review browser console for connection errors

## 📞 Support

For API-related issues:
1. Check the [Swagger documentation](https://api.topstepx.com/swagger/index.html)
2. Review the [Help Center](https://help.topstep.com/)
3. Contact TopStep support for API subscription issues
4. Check the browser console for error messages

## 🔄 Version History

### v1.0.0 (2026-01-22)
- Initial TopStepX API integration
- Authentication and session management
- Account, order, position, and trade sync
- WebSocket support for real-time data
- API configuration UI
- Sync management and monitoring
- API dashboard with statistics

## 📝 License

This integration is provided as part of the TopStep Hub project. Use in accordance with TopStepX API Terms of Service.
