# FuturesByAgentR - Quick Reference Card

## 🚀 Quick Start (3 Steps)

### Demo Mode (No Setup)
1. Open `FuturesByAgentR.html` in browser
2. Start trading immediately with simulated data
3. Status shows 🟢 **DEMO**

### Live Mode (TopStepX)
1. Run: `python setup_tsx_api.py --setup && python setup_tsx_api.py --launch`
2. Click ⚙️ → Enter API Key & Username → Test Connection
3. Select Account → Enable Live Trading → Status shows 🔴 **LIVE**

---

## 🎯 Trading Basics

### Place Orders

**Market Order** (instant execution):
1. Select quantity (1-50)
2. Click **BUY** (long) or **SELL** (short)

**Limit Order** (specific price):
1. Select quantity
2. Enter limit price
3. Click **BUY** or **SELL**

### Close Positions

**Full Close**: Click opposite side button (SELL for long, BUY for short)  
**Partial Close**: Enter quantity less than position size

---

## 📊 Market Selection

Click tabs to switch markets:
- **ES** - E-mini S&P 500
- **NQ** - E-mini Nasdaq
- **YM** - E-mini Dow
- **CL** - Crude Oil
- **GC** - Gold
- **And many more...**

---

## 🎨 Visual Indicators

### Connection Status
- 🟢 **Live** - Connected to TopStepX API
- 🟠 **Demo** - Using simulated data
- 🔴 **Disconnected** - No API connection

### Trading Mode
- 🟢 **DEMO** - Simulated trading (safe)
- 🔴 **LIVE** - Real money trading (⚠️ caution!)

### Order Status
- 🟡 **PENDING** - Order submitted
- 🟢 **FILLED** - Order executed
- 🔴 **REJECTED** - Order failed
- ⚪ **CANCELLED** - Order cancelled

---

## ⚙️ API Settings

### Configure TopStepX API

1. Click **⚙️ API Settings** button
2. Select **"TopStepX API"** from dropdown
3. Enter credentials:
   - **API Key**: From TopStepX dashboard
   - **Username**: Your TopStepX username
   - **Bridge URL**: `ws://localhost:8765` (default)
4. Click **Test Connection**
5. Select your trading account
6. Click **Save**

### Python Bridge Commands

**Setup** (one-time):
```bash
python setup_tsx_api.py --setup
```

**Start Bridge** (before trading):
```bash
python setup_tsx_api.py --launch
```

**Custom Port**:
```bash
python setup_tsx_api.py --launch --port 9000
```

---

## 🛡️ Risk Management

### Position Limits
- Maximum: ±50 contracts
- Start small: 1-2 contracts
- Increase gradually

### Best Practices
- ✅ Test in Demo mode first
- ✅ Use stop losses
- ✅ Never risk >2% per trade
- ✅ Monitor account regularly
- ✅ Keep bridge running
- ❌ Don't over-leverage
- ❌ Don't chase losses

---

## 🔧 Troubleshooting

### Can't Connect to API

**Check**:
1. Python bridge is running
2. Bridge URL is correct: `ws://localhost:8765`
3. Firewall allows port 8765
4. API credentials are correct

**Fix**:
```bash
# Restart bridge
python setup_tsx_api.py --launch
```

### No Live Data

**Check**:
1. Market is open
2. WebSocket connected (green indicator)
3. Subscribed to contract

**Fix**: Refresh page and reconnect

### Orders Not Executing

**Demo Mode**:
- Should work instantly - check browser console (F12)

**Live Mode**:
- Verify Live Mode enabled (🔴 indicator)
- Check account selected
- Ensure sufficient buying power
- Check order quantity valid (1-50)

### Account Not Syncing

**Fix**:
1. Click **🔄 Sync Account Data**
2. Check API connection
3. Refresh browser

---

## 🔐 Security Checklist

- [ ] Never share API keys
- [ ] Store `.env` file securely
- [ ] Don't commit `.env` to git
- [ ] Test in Demo mode first
- [ ] Understand all features before Live mode
- [ ] Monitor account actively
- [ ] Use strong passwords
- [ ] Keep software updated

---

## 📞 Support

### Documentation
- **Full Guide**: `FUTURESBYAGENTR_SETUP_GUIDE.md`
- **TopStepX API**: https://api.topstepx.com/swagger/index.html
- **Help Center**: https://help.topstep.com/

### Contact
- **Email**: BarbrickDesign@gmail.com
- **Issues**: https://github.com/barbrickdesign/barbrickdesign.github.io/issues

---

## 🎓 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `B` | Buy Market |
| `S` | Sell Market |
| `C` | Close Position |
| `↑` | Increase Quantity |
| `↓` | Decrease Quantity |
| `ESC` | Close Modal |
| `F12` | Open Console (debugging) |

---

## 📈 Performance Metrics

### Account Stats
- **Equity**: Current account value
- **P&L**: Profit/Loss (realized)
- **Positions**: Number of open contracts
- **Win Rate**: % winning trades
- **Drawdown**: Largest equity decline

### Position Info
- **Entry Price**: Position opening price
- **Current Price**: Latest market price
- **Unrealized P&L**: Open position profit/loss
- **Size**: Number of contracts
- **Hold Time**: Duration of position

---

## ⚡ Pro Tips

1. **Always start in Demo mode** - Master the platform first
2. **Keep bridge running** - Connection drops = missed opportunities
3. **Use limit orders** - Better price control, less slippage
4. **Set alerts** - Know when to pay attention
5. **Review trades daily** - Learn from wins and losses
6. **Scale in/out** - Add to winners, exit losers quickly
7. **Respect the market** - Don't force trades
8. **Take breaks** - Avoid emotional trading
9. **Journal your trades** - Track what works
10. **Risk management first** - Protect capital above all

---

## 📱 Mobile Usage

Platform is responsive and works on mobile:
- Touch-friendly buttons
- Adaptive layout
- Full feature set

**Note**: Python bridge must run on desktop/server.

---

## 🎉 Quick Win: First Trade

1. Open `FuturesByAgentR.html`
2. Platform starts in Demo mode (🟢)
3. Select **ES** market (E-mini S&P)
4. Set quantity to **1**
5. Click **BUY** (go long)
6. Watch position appear
7. Click **SELL** to close
8. View your P&L!

Congratulations! You've completed your first trade! 🎊

---

## ⚠️ Important Disclaimers

1. **Demo Mode**: Simulated trading, not representative of live conditions
2. **Live Mode**: Real money at risk, you are responsible for all trades
3. **Market Risk**: Trading involves substantial risk of loss
4. **No Guarantees**: Past performance doesn't indicate future results
5. **Education**: This platform is for educational and trading purposes
6. **Your Responsibility**: Always do your own research and due diligence

---

## 📋 Version Info

**Version**: 1.0.0  
**Release Date**: 2026-02-04  
**Platform**: FuturesByAgentR  
**API**: TopStepX Integration  
**Status**: Production Ready ✅

---

**Print this card and keep it handy while trading!**

---

© 2024-2026 Barbrick Design | BarbrickDesign@gmail.com
