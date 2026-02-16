---
layout: default
title: TUCSON2026 README
---

# Tucson 2026 Gem & Mineral Marketplace

## Overview

The Tucson 2026 marketplace is a live inventory tracking system for the annual Tucson Gem and Mineral Shows. It allows vendors to register their booths, add real-time listings, and enables buyers to browse inventory across all show venues.

## Features

### 🔐 Dual Authentication System

#### Vendor Authentication
- **Email-based Registration**: Vendors register with email and business name
- **Booth Assignment**: Each vendor is assigned to a specific show venue and booth number
- **Persistent Login**: Credentials saved in browser localStorage
- **Secure Logout**: One-click logout functionality
- **Sales Tracking**: View total sales and revenue in dashboard

#### Visitor Authentication (NEW!)
- **Simple Registration**: Visitors register with email and name
- **Collection Tracking**: Track all purchased items in personal collection
- **Location Sharing**: Share location with other visitors on the map
- **Purchase History**: Complete history of all purchases with price trail
- **Public Profile**: Visible to other visitors on interactive map

### 📍 Accurate Show Information (2026)

| Show | Dates | Venue | Address |
|------|-------|-------|---------|
| JOGS | Jan 28 – Feb 8, 2026 | Tucson Expo Center | 3750 E. Irvington Road |
| TGMS | Feb 12 – 15, 2026 | Convention Center | 260 S. Church Avenue |
| 22nd Street | Jan 29 – Feb 15, 2026 | 22nd Street Showgrounds | 600 W. 22nd Street |
| Gem Mall | Jan 31 – Feb 8, 2026 | Gem Mall | 4475 S. Country Club Road |

*All dates and venues verified from official Tucson Gem Show sources*

### 📦 Real-Time Vendor Listings
- **Add Listings**: Vendors can add items from their authenticated booth
- **Edit Listings**: Update title, price, description, category, and access level
- **Delete Listings**: Remove listings with confirmation
- **Vendor Attribution**: All listings show the vendor's business name
- **Automatic Booth Info**: Listings automatically use vendor's venue and booth

### 🗺️ Interactive Live Map (ENHANCED!)
- **Real Map Integration**: Powered by Leaflet.js with OpenStreetMap tiles
- **Accurate Venue Coordinates**: Precise GPS coordinates for all 4 show locations
  - JOGS Tucson Expo Center: 32.1626°N, 110.9109°W
  - TGMS Convention Center: 32.2178°N, 110.9740°W
  - 22nd Street Showgrounds: 32.2087°N, 110.9809°W
  - Gem Mall: 32.1668°N, 110.9241°W
- **Live User Location**: Real-time GPS tracking of your current position
- **Distance Calculations**: See how far you are from each venue
- **Enhanced Venue Markers**: Click to see venue details, address, dates, listing count, AND featured inventory (up to 3 items per venue)
- **Visitor Markers** (NEW!): See other visitors' locations on the map with their collection stats
- **Interactive Popups**: Click visitor markers to see their collection count, total value, and recent purchases
- **Venue Filtering**: Filter marketplace and map by show venue
- **Center on Location**: Quick button to center map on your current position
- **Auto-Positioning**: Map automatically centers on you if you're in the Tucson area
- **Interactive Controls**: Zoom, pan, and explore the Tucson gem show venues
- **Real-Time Updates**: Marker counts update as listings are added/removed

### 💼 Vendor Dashboard (ENHANCED!)
- **Statistics Overview**: View active listings, total sales, and revenue at a glance
- **Active Listings Table**: Shows all vendor's current listings
- **Booth Information**: Displays venue, booth number, and business name
- **Quick Actions**: Edit and delete listings directly from dashboard
- **Sales History**: Track completed sales and revenue

### 👤 Visitor Dashboard (NEW!)
- **Collection Statistics**: View items collected, total investment, and average price
- **Collection Table**: Complete list of purchased items with details
- **Purchase History**: Date, vendor, venue, and price for each item
- **Remove Items**: Manage your collection tracking
- **Public Profile**: Collection visible to other visitors on the map

### 📊 Public Transaction Log (ENHANCED!)
- **Transparent Records**: All completed transactions publicly logged
- **Transaction Details**: Date, item, vendor, **buyer name**, venue, price, and status
- **Ownership Trail**: Complete history of who owns what items
- **Price History**: Track price data for each item over time
- **Escrow Notice**: Clearly states BarbrickDesign@gmail.com as escrow holder
- **Buyer/Seller Validation**: Allows public verification of marketplace integrity

### 🛒 Marketplace Features (ENHANCED!)
- **Browse All Shows**: View listings from all vendors across all venues
- **Search Functionality**: Search by item name, type, description, or booth
- **Wholesale Filter**: Toggle between public and wholesale-only listings
- **Price Sorting**: Sort listings by price (ascending/descending)
- **Vendor Contact**: Contact information for each listing
- **Purchase Functionality** (NEW!): Authenticated visitors can purchase items directly
- **Real-Time Updates**: Inventory updates instantly when items are sold
- **Owner Tracking**: Track who owns each item after purchase

## Getting Started

### For Vendors

1. **Register Your Booth**
   - Click "Vendor Login" button in the top right
   - Enter your email address
   - Enter your business name
   - Select your show venue (JOGS, TGMS, 22nd Street, or Gem Mall)
   - Enter your booth number

2. **Add Your First Listing**
   - Click "+ Add listing" button
   - Fill in item details:
     - Title (e.g., "Arizona Turquoise Rough - 5lb lot")
     - Price in USD
     - Category (Gemstones, Minerals, Fossils, Jewelry, etc.)
     - Access level (Public or Wholesale only)
     - Description
     - Contact information (optional)
   - Click "Save listing"

3. **Manage Your Listings**
   - Scroll to "Vendor Dashboard" section
   - View all your active listings
   - Click "Edit" to update a listing
   - Click "Delete" to remove a listing

4. **View Your Information**
   - Your business name appears in the top right when logged in
   - Dashboard shows your booth location and total listing count

### For Buyers

1. **Browse Listings**
   - Scroll to the "Marketplace" section
   - All active listings are shown by default

2. **Filter by Venue**
   - Click venue filter buttons (JOGS, TGMS, etc.) to see listings from specific shows
   - Click "All shows" to see everything

3. **Search for Items**
   - Use the search bar to find specific items, minerals, or vendors
   - Search matches title, description, type, and booth information

4. **Filter Wholesale**
   - Click "Wholesale only" to show only wholesale listings
   - Click again to show all listings

5. **Contact Vendors**
   - Click "Contact / visit" button on any listing
   - Contact information or booth visit details will be displayed

6. **Use the Interactive Map**
   - View real-time locations of all 4 venue locations on an interactive map
   - Click venue markers to see venue details, address, dates, and listing count
   - Click "Center on my location" to see where you are relative to venues
   - Allow location access to see:
     - Your current position on the map (animated marker)
     - Distance to each venue in kilometers
     - Automatic map centering if you're in the Tucson area
   - Click venue filter buttons to zoom to specific venues
   - Use zoom controls (+/-) to explore the area

### For Visitors (NEW!)

1. **Create Visitor Account**
   - Click "Visitor Login" button in the top right
   - Enter your email address
   - Enter your name
   - Your account is created and you can now track purchases

2. **Browse and Purchase Items**
   - Browse the marketplace as usual
   - When you find an item you want, click the "💎 Purchase" button
   - Confirm the purchase details
   - The item is added to your collection and removed from marketplace

3. **Track Your Collection**
   - Scroll down to "My Collection" dashboard
   - View statistics:
     - Total items collected
     - Total investment amount
     - Average price per item
   - See complete purchase history with dates, vendors, and prices

4. **Share Your Location**
   - Allow location access when prompted
   - Your location will appear on the map with a visitor marker
   - Other visitors can see your collection stats by clicking your marker

5. **View Other Visitors**
   - Click on yellow visitor markers on the map
   - See their collection count, total value, and recent purchases
   - Connect with other collectors at the show

6. **Manage Your Collection**
   - Click "Remove" on any item to stop tracking it
   - Your purchase history remains in the public transaction log
   - Only your collection display is affected

## Map Features

### Viewing Your Location

When you first visit the page, you may be prompted to allow location access. This enables:

1. **Real-Time Position**: Your location appears as an animated cyan marker
2. **Distance Info**: Click your marker to see distances to all venues
3. **Auto-Centering**: Map centers on you if you're near Tucson
4. **Live Tracking**: Your position updates as you move

### Venue Markers

Each of the 4 show venues has a marker on the map:
- **Purple gradient markers** indicate venue locations
- **Click any marker** to see:
  - Venue name and address
  - Show dates
  - Number of active vendor listings
  - Distance from your location (if enabled)

### Map Controls

- **Zoom In/Out**: Use + and - buttons or scroll wheel
- **Pan**: Click and drag to explore
- **Center on Location**: Quick button to return to your position
- **Venue Filters**: Click venue chips to highlight and zoom to specific shows

## Data Storage

All data is stored locally in your browser using `localStorage`:

- **Vendor Accounts**: `tucson2026_vendorData`
  - Vendor email, business name, venue, booth number
  - All vendor listings with details
  
- **Visitor Accounts**: `tucson2026_visitorData` (NEW!)
  - Visitor email, name, location
  - Complete collection of purchased items
  - Purchase history and tracking
  
- **Transactions**: `tucson2026_transactions`
  - Transaction history for transparency
  - Date, item, vendor, buyer, price, status
  - Complete ownership trail

**Note**: Clearing browser data will erase all saved information. For production use, implement server-side storage.

## Technical Details

### Technologies Used
- **HTML5**: Semantic markup and modern elements
- **CSS3**: Custom properties, flexbox, grid, animations
- **Vanilla JavaScript**: No frameworks or dependencies
- **localStorage API**: Client-side data persistence
- **Leaflet.js 1.9.4**: Open-source interactive maps
- **OpenStreetMap**: Free map tiles (no API key required)
- **Geolocation API**: Real-time user location tracking
- **PayPal SDK**: Payment integration (script included, configuration needed)

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance
- Lightweight: ~57KB HTML+CSS+JS (uncompressed)
- External dependencies: Leaflet.js (~150KB from CDN)
- Instant load times on modern connections
- Efficient filtering and sorting algorithms
- Real-time location updates with minimal battery impact

## Security Considerations

⚠️ **This is a demonstration/MVP implementation**

For production deployment, implement:

1. **Server-Side Authentication**
   - Replace localStorage with secure session tokens
   - Implement OAuth2 or JWT authentication
   - Add email verification and password requirements

2. **Database Storage**
   - Store vendor accounts in secure database
   - Store listings with proper indexing
   - Store transactions with audit trails

3. **API Integration**
   - RESTful API for all data operations
   - Server-side validation of all inputs
   - Rate limiting and CSRF protection

4. **PayPal Integration**
   - Configure PayPal SDK with live credentials
   - Implement webhook handlers for payment events
   - Add proper error handling and retries
   - Implement escrow workflow with BarbrickDesign@gmail.com

5. **Security Measures**
   - Use HTTPS for all communications
   - Sanitize all user inputs (XSS prevention)
   - Implement SQL injection prevention
   - Add reCAPTCHA for registration
   - Regular security audits and penetration testing

6. **Data Protection**
   - GDPR compliance for EU visitors
   - Privacy policy and terms of service
   - Data encryption at rest and in transit
   - Regular backups and disaster recovery

## Future Enhancements

### Phase 1: Payment Integration
- [ ] Configure PayPal live credentials
- [ ] Add PayPal buy buttons to all listings
- [ ] Implement escrow workflow
- [x] Add buyer purchase dashboard ✓
- [ ] Implement delivery confirmation system

### Phase 2: Enhanced Features
- [x] Real map integration (Leaflet with OpenStreetMap) ✓
- [x] Live user location tracking ✓
- [x] Visitor authentication and collection tracking ✓
- [x] Visitor-to-visitor interactions via map ✓
- [x] Enhanced venue popups with inventory preview ✓
- [x] Ownership tracking with price history ✓
- [ ] Photo uploads for listings
- [ ] Vendor ratings and reviews
- [ ] Wishlist/favorites for buyers
- [ ] Email notifications for new listings
- [ ] Advanced search with filters (price range, date listed, etc.)
- [ ] Directions/navigation to venues from user's location
- [ ] In-app messaging between visitors and vendors

### Phase 3: Mobile Experience
- [ ] Progressive Web App (PWA) support
- [ ] Offline functionality
- [ ] Push notifications
- [ ] Mobile-optimized layout enhancements
- [ ] QR codes for booth visits

### Phase 4: Analytics & Insights
- [ ] Vendor analytics dashboard
- [ ] Popular item categories
- [ ] Price trends and recommendations
- [ ] Traffic and conversion metrics
- [ ] Sales reporting

## Broker Escrow System

All transactions are protected by a broker escrow system:

- **Broker**: BarbrickDesign (BarbrickDesign@gmail.com)
- **Process**:
  1. Buyer pays through PayPal
  2. Funds held in escrow by BarbrickDesign
  3. Vendor ships item to buyer
  4. Buyer confirms delivery
  5. Funds released to vendor's PayPal account

This ensures:
- Buyer protection: Don't pay until you receive the item
- Vendor protection: Confirmed delivery before payment release
- Transparency: All transactions publicly logged

## Support

For questions or issues:
- Email: BarbrickDesign@gmail.com
- Review the documentation in this README
- Check the browser console for error messages
- Verify localStorage is enabled in your browser

## License

Copyright © 2026 BarbrickDesign. All rights reserved.

This marketplace is provided for use during the Tucson 2026 Gem and Mineral Shows. By using this system, you agree to:
- Provide accurate information in your listings
- Honor all sales and commitments
- Follow the escrow process for all transactions
- Treat all users with respect and professionalism

---

**Last Updated**: January 14, 2026  
**Version**: 1.0.0  
**Status**: Live for Tucson 2026 Shows
