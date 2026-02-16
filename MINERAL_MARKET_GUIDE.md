# Mineral Market - User Guide

## Overview

The Mineral Market is a fully functional marketplace for buying and selling minerals and crystals with integrated PayPal payment processing and broker escrow protection. All transactions are handled through PayPal, with **BarbrickDesign@gmail.com** acting as the trusted broker to hold funds until delivery is confirmed.

## Features

### 🔐 User Account Management
- **Email-based Authentication**: Users create accounts with their email address
- **PayPal Integration**: Link your PayPal account to receive payments from sales
- **Display Name**: Choose how you want to appear to other users
- **Data Persistence**: All your inventory, orders, and account info is saved locally in your browser

### 📦 Inventory Management
- **Add Specimens**: Add mineral and crystal specimens to your collection
  - Enter mineral name, weight, classification
  - Add descriptions and photos (placeholder for 3D models)
  - Set suggested prices or use AI valuation
- **NFT Minting**: Mint items as NFTs before listing them for sale
- **Track Status**: See which items are Draft, NFT-minted, Listed, or Sold
- **Classifications**: 
  - **Cut Gemstones** – Faceted, jewelry-ready finished products
  - **Facet Clean Rough** – High clarity rough material suitable for faceting
  - **Carving Rough** – Raw material suitable for carving/sculpture work
  - **Specimen Grade** – Display quality specimens with aesthetic value
  - **Museum Grade** – Highest quality specimens suitable for museum collections
  - **Collector Grade** – High quality specimens for serious collectors
  - **Industrial/Practical Use** – Materials that can be processed further for industrial applications

### 🛒 Marketplace
- **Global Listings**: View all available items from all sellers
- **Real PayPal Payments**: Buy items directly with PayPal buttons
- **Detailed Listings**: See mineral type, weight, grade, price, and seller info
- **Buy Orders**: Create buy orders for minerals you're looking for
- **Automated Matching**: System tracks open buy and sell orders
- **Delivery Confirmation**: Buyers can confirm receipt of items

### 💰 Payment Processing with Broker Escrow
- **Direct PayPal Integration**: All payments processed through PayPal
- **Broker Escrow Service**: **BarbrickDesign@gmail.com** acts as the trusted broker
- **Funds Held in Escrow**: Payments are held securely until delivery is confirmed
- **Seller Payouts**: Sellers receive payments after buyer confirms delivery
- **Transaction Tracking**: All completed transactions are logged with transaction IDs
- **Payment Protection**: Secured by PayPal's buyer and seller protection plus escrow service
- **Real Money Transactions**: This is a fully functional payment system with escrow protection

### 📊 Price Tracking
- **Historical Data**: Track price trends for different minerals
- **Market Statistics**: View 24h price changes, volume, and trends
- **Price Charts**: Visual representation of price history (requires Chart.js)
- **Multiple Minerals**: Track Amethyst, Quartz, Azurite, Gold, and more

## How to Use

### Getting Started

1. **Connect Your Account**
   - Click "Connect Account" in the top right
   - Enter your email address
   - Enter your PayPal account email (where you'll receive payments)
   - Choose a display name

2. **Add Items to Your Inventory**
   - Fill out the "Add specimen" form
   - Enter mineral name, weight, classification, description
   - Optionally set a price or use "💡 Estimate value"
   - Click "+ Add to inventory"

3. **Mint NFT**
   - Click on an item in your inventory to select it
   - Click "Mint NFT (simulated)" button
   - Your item is now ready to be listed

4. **List on Marketplace**
   - With an NFT-minted item selected
   - Click "List on market"
   - Confirm the price
   - Your item appears in the marketplace with a PayPal buy button

### Buying Items

1. **Browse Marketplace**
   - View the "Grand Exchange marketplace" section
   - See all available listings from all sellers

2. **Purchase with PayPal**
   - Click the PayPal button on any listing (except your own)
   - Complete payment through PayPal's secure checkout
   - Payment is held in escrow by **BarbrickDesign@gmail.com**

3. **Receive Your Item**
   - Seller ships the item to you
   - Track the shipment (if tracking provided)
   - Wait for delivery

4. **Confirm Delivery**
   - Once you receive the item, return to the marketplace
   - Click the "✓ Confirm Delivery" button next to your purchase
   - This releases the funds from escrow to the seller

5. **Transaction Completion**
   - After confirmation, funds are released to seller's PayPal account
   - Item is marked as "Delivered & Paid"
   - Transaction is complete

### Creating Buy Orders

1. Click "+ Create buy order (simulated)"
2. Enter the mineral type you're looking for
3. Enter maximum price you're willing to pay
4. Order is added to marketplace
5. Sellers can see your buy order and may list matching items

## Technical Details

### Data Storage
- All user data is stored locally using `localStorage`
- Data includes: user profile, inventory, orders, transaction history
- Data persists between sessions in the same browser
- Clear browser data to reset the marketplace

### PayPal Integration
- Uses centralized PayPal integration from `/src/utils/paypal-integration.js`
- Supports both primary and fallback PayPal configurations
- Automatic initialization on page load
- Handles payment creation, approval, and capture

### Security
- PayPal handles all payment processing securely
- No credit card data is stored in the application
- Seller PayPal accounts are protected
- All transactions use PayPal's security features

## Features in Detail

### AI Valuation
The "AI: Suggest value" button provides basic price estimation based on:
- Mineral type (different base rates for different minerals)
- Weight in grams
- Classification multiplier (Cut Gemstones have highest multiplier, Industrial/Practical Use has lowest)
- Random market variance

Classification multipliers:
- Cut Gemstones: 3.0x (highest value - finished product)
- Museum Grade: 2.5x (exceptional quality)
- Collector Grade: 2.0x (high quality)
- Facet Clean Rough: 1.8x (excellent rough for faceting)
- Specimen Grade: 1.5x (display quality)
- Carving Rough: 1.4x (good for carving)
- Industrial/Practical Use: 0.8x (practical applications)

This is a heuristic calculator - real AI model integration would enhance accuracy.

### NFT System
Items must be "minted" as NFTs before listing. This:
- Creates a unique token ID for the item
- Timestamps the minting process
- Prepares the item for blockchain integration (future enhancement)
- Ensures item authenticity

### Order Matching
The system tracks:
- **SELL orders**: Items listed for sale with prices
- **BUY orders**: Requests to purchase specific minerals at max price
- **Order status**: OPEN, FILLED (payment in escrow), DELIVERED & PAID

Currently, order matching is manual (buyers click PayPal buttons). Future enhancements could automate matching when buy and sell orders overlap.

### Price History
- Automatically updated when new orders are created
- Tracks last 10 data points per mineral
- Shows 24h change percentage
- Displays trading volume

## Seller Information

### How Sellers Get Paid with Broker Escrow
1. Buyer completes PayPal purchase through the marketplace
2. PayPal processes the payment transaction
3. **Funds are held in escrow by BarbrickDesign@gmail.com** (the trusted broker)
4. Seller ships the item to the buyer
5. Buyer receives the item and clicks "Confirm Delivery" in the marketplace
6. **BarbrickDesign@gmail.com releases the funds** to the seller's registered PayPal account
7. Seller receives payment according to PayPal's standard processing timeline

**Note**: The marketplace uses a broker escrow system for buyer and seller protection. **BarbrickDesign@gmail.com** holds funds until delivery is confirmed, ensuring both parties are protected. Sellers must have a valid PayPal account to receive payments.

### Seller Fees
- Platform does not charge fees (currently)
- Standard PayPal fees apply to all transactions
- Sellers can factor fees into their pricing

### Managing Your Listings
- View all your items in the inventory section
- Items show status: Draft, NFT, Listed, or Sold
- Cannot re-list sold items
- Can track sold items and prices

## Buyer Information

### Payment Process with Escrow Protection
1. Click PayPal button on desired item
2. PayPal window opens for secure payment
3. Log in to PayPal or pay as guest
4. Review and confirm payment
5. Payment is held in escrow by **BarbrickDesign@gmail.com**
6. Receive confirmation with transaction details and escrow information
7. Wait for seller to ship the item
8. Receive and inspect the item
9. Click "✓ Confirm Delivery" in the marketplace
10. Broker releases funds to the seller

### Buyer Protection
- All purchases protected by PayPal's buyer protection
- **Additional escrow protection**: Funds held by broker until you confirm delivery
- Can open disputes through PayPal if needed
- Secure payment processing
- No need to share payment info with sellers
- Don't confirm delivery until you've received and inspected the item

## Tips & Best Practices

### For Sellers
- Take clear photos of your specimens
- Write detailed, accurate descriptions
- Research fair market prices before listing
- Select the correct classification category for your item
- Be honest about quality and classification
- Ship items promptly after receiving purchase notification
- Provide tracking information when available
- Understand that payment is held in escrow until buyer confirms delivery
- Respond to buyer inquiries promptly
- Ship items securely with tracking

### For Buyers
- Review item details carefully before purchasing
- Check seller ratings (future feature)
- Compare prices across listings
- Save contact info in case of issues
- Request tracking information
- **Important**: Only confirm delivery after you receive and inspect the item
- If there are issues with the item, contact the seller before confirming delivery
- Remember that confirming delivery releases funds from escrow to the seller

### Pricing Guidelines
- **Cut Gemstones**: Premium pricing for finished, faceted stones ready for jewelry
- **Facet Clean Rough**: High pricing for clean rough with excellent faceting potential
- **Carving Rough**: Good pricing for material suitable for carving and sculpture
- **Specimen Grade**: Standard pricing for display-quality specimens
- **Museum Grade**: Very high pricing for exceptional museum-quality specimens
- **Collector Grade**: High pricing for quality collector pieces
- **Industrial/Practical Use**: Lower pricing for materials with industrial applications

## Troubleshooting

### PayPal Button Not Showing
- Ensure you're logged in to your account
- Check that PayPal integration is configured
- Verify you're not viewing your own listing
- Try refreshing the page

### Can't List Item
- Make sure item is NFT-minted first
- Check that you're logged in
- Verify item isn't already listed
- Ensure you own the item

### Payment Issues
- Contact PayPal support for payment problems
- Check your PayPal account status
- Verify sufficient funds/payment method
- Try different browser if issues persist

### Data Not Saving
- Check browser localStorage is enabled
- Don't use private/incognito mode
- Clear and reconfigure if corrupted
- Export important data periodically (future feature)

## Future Enhancements

Potential features for future versions:
- Automated order matching system
- Integrated shipping calculator
- Seller ratings and reviews
- Advanced search and filters
- Bulk listing tools
- Export/import functionality
- Mobile app version
- Real AI valuation model
- 3D model viewer integration
- Blockchain NFT integration
- Auction system
- Escrow service

## Support

For questions or issues:
- Review this guide thoroughly
- Check PayPal documentation for payment issues
- Verify browser compatibility (modern browsers required)
- Clear browser data if experiencing persistent issues

## Technical Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- localStorage enabled
- Internet connection for PayPal processing
- PayPal account for selling (buyers can pay as guest)

---

**Version**: 1.0  
**Last Updated**: December 2024  
**Status**: Fully Functional with Real PayPal Integration
