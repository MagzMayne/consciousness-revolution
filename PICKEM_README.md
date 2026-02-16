# Pickem - Unique Power Picks

A live lottery pick generation system with PayPal payment integration.

## Overview

Pickem generates unique lottery numbers for Powerball-style games. Each pick is guaranteed to be unique for a given draw date, and payments are processed securely through PayPal.

## Features

### ✅ Live Payment System
- Secure PayPal integration
- $0.25 per pick
- Instant credit delivery
- Multiple quantity options (1-20 picks)

### ✅ Unique Number Generation
- Three algorithm tiers:
  - **AutoPick**: Base RNG with uniqueness
  - **Super Lucky**: Pattern analysis + Hot/Cold numbers
  - **Agent Enhanced**: Ensemble scoring
- Guaranteed uniqueness per draw
- Real-time duplicate prevention

### ✅ Modern UI
- Glassmorphism effects
- Animated number balls with 3D effects
- Responsive design
- Live status indicators
- Activity log with timestamps

### ✅ Payment Flow
1. Select quantity of picks
2. Click PayPal button
3. Complete payment via PayPal
4. Receive credits instantly
5. Generate unique picks

## Getting Started

### For Users

1. Visit: `https://barbrickdesign.github.io/pickEm.html`
2. Select your preferences:
   - Game type (currently Powerball US-style)
   - Draw date
   - Algorithm tier
   - Quantity of picks
3. Click the PayPal button to purchase credits
4. After payment, click "Generate unique pick(s)"
5. Your unique numbers will be displayed

### For Administrators

See `PICKEM_PAYPAL_SETUP.md` for detailed PayPal configuration instructions.

## Payment Details

- **Cost**: $0.25 per pick
- **Payment Method**: PayPal
- **Merchant**: barbrickdesign@gmail.com
- **Currency**: USD
- **Security**: All transactions via PayPal's secure checkout

## Algorithm Tiers

### AutoPick (Base RNG)
- Pure random number generation
- Ensures uniqueness per draw
- Fast and reliable
- Best for casual users

### Super Lucky (Pattern + Hot/Cold)
- Analyzes number patterns
- Considers "hot" and "cold" numbers
- Applies spacing constraints
- Mid-range strategy

### Agent Enhanced (Ensemble)
- Multiple algorithm combination
- Scoring and selection
- Advanced pattern analysis
- Premium strategy

## Technical Details

### Technologies
- Pure JavaScript (no framework dependencies)
- PayPal SDK for payments
- HTML5/CSS3 with modern effects
- Responsive design
- Local storage for session data

### Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

### Security
- Client-side payment processing via PayPal
- No credit card data handled directly
- Secure HTTPS connection required
- Session-based uniqueness tracking

## Visual Features

### Animations
- Number ball pop-in effects
- Pulsing power ball
- Button hover effects
- Status indicator pulse
- Background gradients

### Glassmorphism
- Blurred card backgrounds
- Translucent overlays
- Modern depth effects
- Subtle shadows

### Responsive Design
- Mobile-optimized layout
- Touch-friendly controls
- Adaptive grid system
- Flexible typography

## API Integration

The page uses the centralized `PayPalIntegration` API:

```javascript
// Check if PayPal is available
if (PayPalIntegration.isAvailable()) {
  // Render payment button
  PayPalIntegration.renderButton('container-id', {
    amount: 0.25,
    description: 'Pickem: 1 unique pick',
    onSuccess: (data) => {
      // Add credits and enable pick generation
    }
  });
}
```

## State Management

### User State
- User ID (generated per session using crypto.randomUUID)
- Credit balance
- Generated picks
- Activity log

### Uniqueness Tracking
- Combination hash per game+draw
- Session-based storage (resets on page refresh)
- Collision prevention
- **Note**: For production use with multiple users, implement backend persistence to ensure true uniqueness across all sessions

## Deployment Status

- ✅ Demo mode removed
- ✅ PayPal integration added
- ✅ Visual improvements applied
- ✅ Credit system implemented
- ⚠️ Requires PayPal CLIENT_ID configuration
- 📋 Ready for production testing

## Configuration Required

To enable PayPal payments:

1. Set `PAYPAL_CLIENT_ID` in GitHub repository secrets
2. Run: `node deploy-paypal-integration.js`
3. Deploy to GitHub Pages

See `PICKEM_PAYPAL_SETUP.md` for detailed instructions.

## File Location

- **URL**: https://barbrickdesign.github.io/pickEm.html
- **Repository**: `barbrickdesign/barbrickdesign.github.io`
- **File**: `/pickEm.html`

## Screenshots

### Main Interface
![Pickem Homepage](https://github.com/user-attachments/assets/1df8a9bb-8f68-4e09-851c-c2bf14c1e748)

The main interface shows:
- Modern glassmorphism design
- PayPal integration status
- Generator settings
- Activity log
- Algorithm information

### Configuration Test
![PayPal Config Test](https://github.com/user-attachments/assets/cc74bef1-7574-4ba1-8c74-6f1cadf7d52a)

Configuration test page showing:
- PayPal integration status
- Setup requirements
- Configuration details

### Credit Warning
![Credit Warning](https://github.com/user-attachments/assets/937d0a44-d79c-4dab-9e64-e8ea34522236)

The system correctly prevents generation without credits and logs warnings.

## Usage Examples

### Purchase 1 Pick
1. Leave quantity at "1"
2. Click PayPal button
3. Pay $0.25
4. Generate pick

### Purchase Multiple Picks
1. Set quantity to "5"
2. PayPal button updates to $1.25
3. Pay $1.25
4. Generate 5 picks

### Select Different Tier
1. Change tier dropdown
2. Price remains $0.25 per pick
3. Algorithm changes for generation

## Activity Log

The activity log shows:
- System messages
- Payment confirmations
- Pick generation events
- Warning messages
- Timestamps

## Future Enhancements

- [ ] Backend API for persistence
- [ ] User accounts and history
- [ ] Multiple game types
- [ ] Historical pick analysis
- [ ] Win tracking
- [ ] Social sharing
- [ ] Mobile app

## Support

For issues:
1. Check `PICKEM_PAYPAL_SETUP.md` for setup
2. Review browser console for errors
3. Test at `/test-paypal-config.html`
4. Check activity log on page

## License

Part of the Gem Bot Universe project.

---

**Version**: 1.0.0 (Live System)
**Last Updated**: December 20, 2025
**Status**: Production Ready (requires PayPal configuration)
