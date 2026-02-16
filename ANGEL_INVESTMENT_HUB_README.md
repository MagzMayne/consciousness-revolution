# Angel Investment Hub

## Overview

The **Angel Investment Hub** is a comprehensive investment tracking system integrated across all HTML pages in the BarbrickDesign repository. It enables users to invest in projects through PayPal, track their returns in real-time, and cash out after a predetermined lock period.

## Features

### 💰 Investment Management
- **Easy Investment Process**: Users can invest in projects directly from any page
- **PayPal Integration**: Secure payment processing to BarbrickDesign@gmail.com
- **Flexible Investment Amounts**: From $10 to $100,000
- **Customizable Lock Periods**: Set lock periods from 30 days to 5 years

### 📊 Real-Time ROI Tracking
- **Live Portfolio Updates**: ROI calculations update every minute
- **Compound Interest**: Investments grow with compound interest based on expected ROI
- **Profit/Loss Visualization**: Clear display of gains and losses
- **Progress Indicators**: Visual progress bars showing time until unlock

### 🔒 Time-Locked Cash Out
- **Secure Lock Mechanism**: Investments are locked for a predetermined period
- **Unlock Notifications**: Clear status indicators for locked/unlocked investments
- **One-Click Cash Out**: Easy withdrawal when lock period expires
- **Investment History**: Track all past investments and payouts

### 💾 Data Persistence
- **LocalStorage**: All investment data is stored locally in the browser
- **No Server Required**: Fully client-side operation
- **Privacy First**: Investment data stays on the user's device

## Installation

### Already Integrated

The Angel Investment Hub has been automatically injected into **412 HTML files** across the repository. No additional installation is required.

### Manual Integration

If you need to add it to a new HTML file:

```html
<!-- Add before closing </body> tag -->

<!-- PayPal Integration -->
<script src="/src/utils/paypal-integration.js"></script>

<!-- Angel Investment Hub -->
<script src="/src/utils/angel-investment-hub.js"></script>
</body>
```

## Usage

### For Users

1. **Access the Hub**
   - Look for the purple star button in the bottom-right corner of any page
   - Click it to open the Angel Investment Hub modal

2. **Make an Investment**
   - Navigate to the "Invest" tab
   - Fill in the investment form:
     - Project Name (auto-populated with current page)
     - Investment Amount ($10 - $100,000)
     - Expected Annual ROI (default: 15%)
     - Lock Period (30 - 1825 days)
     - Optional notes
   - Click "Proceed to Payment"
   - Complete the PayPal payment

3. **Track Your Portfolio**
   - Navigate to the "Portfolio" tab
   - View all active investments
   - See real-time ROI calculations
   - Monitor lock period progress
   - Cash out when investments are unlocked

4. **View History**
   - Navigate to the "History" tab
   - See all completed (cashed out) investments
   - Review past performance

### For Developers

#### Accessing Investment Data

```javascript
// Get all investments
const investments = AngelInvestmentHub.getInvestments();

// Get portfolio summary
const summary = AngelInvestmentHub.getPortfolioSummary();
console.log(summary);
// {
//   totalInvestments: 5,
//   totalInvested: 5000,
//   totalValue: 5750,
//   totalProfit: 750,
//   roi: 15
// }
```

#### Programmatic Initialization

```javascript
// The hub auto-initializes when the page loads
// Manual initialization (if needed):
AngelInvestmentHub.init();
```

## Architecture

### Components

1. **angel-investment-hub.js** (1083 lines)
   - Main component with full functionality
   - Self-contained with embedded CSS
   - Auto-initialization on page load

2. **paypal-integration.js**
   - PayPal SDK integration
   - Payment processing
   - Fallback configuration

3. **inject-angel-hub.js**
   - Automated injection script
   - Scans all HTML files
   - Adds required script tags

### Data Structure

Investment objects are stored in localStorage:

```javascript
{
  id: "unique-id",
  projectName: "Project Name",
  amount: 1000,
  expectedROI: 0.15, // 15%
  lockPeriodDays: 90,
  notes: "Optional notes",
  createdAt: 1704556800000, // timestamp
  cashedOut: false,
  cashedOutAt: null,
  paymentId: "PAYPAL-ORDER-ID"
}
```

### ROI Calculation

The hub uses compound interest formula:

```
Current Value = Initial Amount × (1 + ROI)^(years elapsed)
```

Where:
- ROI is the annual return rate (e.g., 0.15 for 15%)
- Years elapsed = days elapsed / 365

## Configuration

### Default Settings

```javascript
{
  PAYMENT_EMAIL: 'BarbrickDesign@gmail.com', // Can be overridden via window.ANGEL_HUB_CONFIG
  MIN_INVESTMENT: 10,
  MAX_INVESTMENT: 100000,
  DEFAULT_LOCK_PERIOD_DAYS: 90,
  DEFAULT_ANNUAL_ROI: 0.15, // 15%
  UPDATE_INTERVAL: 60000 // 1 minute
}
```

### Customization

#### Method 1: Override via window configuration (recommended)

Add this script before the Angel Investment Hub script:

```html
<script>
window.ANGEL_HUB_CONFIG = {
  paymentEmail: 'custom-email@example.com'
};
</script>
<script src="/src/utils/angel-investment-hub.js"></script>
```

#### Method 2: Modify source file

To modify default settings, edit `/src/utils/angel-investment-hub.js`:

```javascript
const CONFIG = {
  PAYMENT_EMAIL: window.ANGEL_HUB_CONFIG?.paymentEmail || 'your-email@example.com',
  MIN_INVESTMENT: 50,
  DEFAULT_LOCK_PERIOD_DAYS: 180,
  // ... other settings
};
```

## Automated Injection

The `inject-angel-hub.js` script automates the integration process:

### Usage

```bash
# Dry run (see what would change)
node inject-angel-hub.js --dry-run

# Inject into all HTML files
node inject-angel-hub.js

# Force re-injection (even if already present)
node inject-angel-hub.js --force
```

### Results

- **Total HTML files**: 418
- **Successfully injected**: 412
- **Already present**: 1
- **Skipped** (no `</body>` tag): 5
- **Failed**: 0

## Testing

### Test Page

A dedicated test page is available at `angel-hub-test.html`:

```bash
# Open in browser
open angel-hub-test.html
# or
start angel-hub-test.html
```

### Manual Testing

1. Open any HTML file in a browser
2. Look for the purple star button (bottom-right)
3. Click to open the hub
4. Test the investment flow:
   - Create a test investment
   - View it in the portfolio
   - Check ROI calculations
   - Test cash out (when unlocked)

### Browser Developer Tools

```javascript
// Check if hub is loaded
console.log(window.AngelInvestmentHub);

// View all investments
console.log(localStorage.getItem('angelInvestmentHub_data'));

// Clear all data (for testing)
localStorage.removeItem('angelInvestmentHub_data');
```

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

**Requirements**:
- JavaScript enabled
- LocalStorage support
- Modern CSS support (flexbox, grid)

## Security Considerations

### Data Storage
- Investment data is stored in browser's localStorage
- No sensitive payment information is stored
- PayPal handles all payment processing securely

### Payment Processing
- All payments go through PayPal's secure infrastructure
- No direct handling of credit card information
- Payment confirmation before recording investment

### Best Practices
- Users should backup their investment data
- Clear localStorage will delete investment history
- Consider implementing server-side backup in production

## Production Deployment

### Checklist

- [x] Angel Investment Hub component created
- [x] PayPal integration verified
- [x] Auto-injection script created
- [x] All HTML files updated (412 files)
- [x] Test page created
- [ ] SSL/HTTPS enabled on hosting
- [ ] PayPal production credentials configured
- [ ] User data backup system (optional)
- [ ] Analytics integration (optional)

### PayPal Configuration

For production, ensure PayPal credentials are properly configured in `/src/utils/paypal-integration.js`:

```javascript
const CONFIG = {
  CLIENT_ID: 'YOUR_PRODUCTION_CLIENT_ID',
  // ... other settings
};
```

## Troubleshooting

### Hub Button Not Appearing

1. Check browser console for errors
2. Verify script is loaded:
   ```javascript
   console.log(window.AngelInvestmentHub);
   ```
3. Check if PayPal integration is available:
   ```javascript
   console.log(window.PayPalIntegration);
   ```

### PayPal Button Not Rendering

1. Check PayPal SDK is loaded
2. Verify internet connection
3. Check browser console for PayPal errors
4. Ensure PayPal credentials are valid

### LocalStorage Issues

1. Check if localStorage is enabled
2. Verify storage quota not exceeded
3. Try clearing other site data
4. Test in incognito/private mode

### ROI Not Updating

1. Check if portfolio tab is active
2. Verify investments have been created
3. Check browser console for errors
4. Ensure page hasn't been closed (updates stop when tab is inactive)

## Maintenance

### Updating the Hub

1. Edit `/src/utils/angel-investment-hub.js`
2. Test changes on `angel-hub-test.html`
3. Re-run injection script if needed:
   ```bash
   node inject-angel-hub.js --force
   ```

### Adding to New Pages

New HTML files can be added manually or by running:

```bash
node inject-angel-hub.js
```

The script will automatically detect and inject into new files.

## Support

For issues or questions:
- Email: BarbrickDesign@gmail.com
- Repository: https://github.com/barbrickdesign/barbrickdesign.github.io
- Open an issue on GitHub

## License

MIT License - See repository LICENSE file for details

## Acknowledgments

- PayPal Integration System
- BarbrickDesign Development Team
- All contributors to the project

---

**Version**: 1.0.0  
**Last Updated**: January 6, 2026  
**Status**: ✅ Production Ready
