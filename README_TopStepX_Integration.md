# TopStepX Live Data Integration

This guide explains how to integrate live market data from the TopStepX API into your trading platform.

## Overview

The integration consists of:
1. **TopStepX API Bridge** - A Python WebSocket server that connects to the TopStepX API
2. **Updated Trading Platform** - Enhanced HTML/JavaScript application that connects to the bridge
3. **Real-time Data Flow** - Live quotes, trades, and market data streaming to your browser

## Setup Instructions

### Prerequisites

- Python 3.7 or higher
- TopStepX API credentials (API key and username)
- Modern web browser with WebSocket support

### Step 1: Install Dependencies

Run the setup script to install all required Python packages:

```bash
python setup_tsx_api.py --setup
```

This will:
- Install the TopStepX API Python library dependencies
- Install WebSocket server dependencies
- Create a `.env` file template

### Step 2: Configure API Credentials

Edit the `.env` file created in your project directory with your TopStepX credentials:

```env
# TopStepX API Configuration
API_KEY=your_actual_api_key_here
USERNAME=your_actual_username_here
ENVIRONMENT=DEMO  # or LIVE for live trading
```

### Step 3: Start the API Bridge

Launch the TopStepX API bridge server:

```bash
python setup_tsx_api.py --launch
```

The bridge will start on `ws://localhost:8765` by default. You should see output like:

```
=== Launching TopStepX API Bridge ===
Authenticating with TopStepX API...
Successfully authenticated with TopStepX API
Starting WebSocket server on 127.0.0.1:8765
WebSocket server running at ws://127.0.0.1:8765
```

### Step 4: Configure the Trading Platform

1. Open `FuturesByAgentR.html` in your web browser
2. Click the "API Settings" button (gear icon) in the header
3. Select "TopStepX API" from the Data Provider dropdown
4. Verify the API Bridge URL is set to `ws://localhost:8765`
5. Click "Test Connection" to verify the connection
6. Save the settings

## Usage

### Market Data

Once connected, the platform will automatically:
- Subscribe to live quotes for the selected market
- Update price displays in real-time
- Generate new price bars from live data
- Show trade markers on the chart

### Supported Markets

The integration supports major futures contracts including:
- **Equity Indices**: ES, NQ, YM, RTY
- **Energy**: CL, NG
- **Metals**: GC, SI
- **Treasuries**: ZB, ZN
- **Currencies**: 6E, 6J, 6A
- **Agricultural**: ZC, ZS, ZW

### Switching Markets

Use the market tabs in the trading platform to switch between different contracts. The bridge will automatically:
- Unsubscribe from the previous market
- Subscribe to the new market
- Update the display with new market data

## Troubleshooting

### Connection Issues

If you see "Not Connected" in the API settings:

1. **Check the bridge server** - Make sure it's running without errors
2. **Verify credentials** - Ensure your `.env` file has valid TopStepX credentials
3. **Check firewall** - Make sure port 8765 is not blocked
4. **Browser console** - Check for WebSocket connection errors

### Authentication Issues

If authentication fails:

1. **Verify API key** - Check that your TopStepX API key is correct
2. **Check username** - Ensure your username matches your TopStepX account
3. **Environment setting** - Make sure ENVIRONMENT is set to "DEMO" or "LIVE" as appropriate

### Data Issues

If you're not receiving live data:

1. **Market hours** - Ensure the market is open for the selected contract
2. **Subscription status** - Check the browser console for subscription confirmations
3. **Network connectivity** - Verify your internet connection is stable

## API Bridge Options

You can customize the bridge server startup:

```bash
# Custom host and port
python setup_tsx_api.py --launch --host 0.0.0.0 --port 9000

# This would make the bridge accessible at ws://0.0.0.0:9000
```

## Files Overview

- `tsx_live_data_bridge.py` - Main bridge server script
- `setup_tsx_api.py` - Setup and launcher utility
- `bridge_requirements.txt` - Python dependencies for the bridge
- `.env` - API credentials configuration (you create this)
- `FuturesByAgentR.html` - Updated trading platform with live data support

## Security Notes

- Keep your API credentials secure
- The `.env` file should not be shared or committed to version control
- Consider using DEMO environment for testing
- The bridge server should only be accessible from trusted networks

## Next Steps

Once live data is working:

1. **Test trading functionality** - Verify that trade execution works with live data
2. **Monitor performance** - Check that the platform handles real-time data smoothly
3. **Customize markets** - Add or remove market contracts as needed
4. **Set up monitoring** - Consider logging and monitoring for production use

For support or questions about the TopStepX API, refer to the TopStepX documentation or contact their support team.
