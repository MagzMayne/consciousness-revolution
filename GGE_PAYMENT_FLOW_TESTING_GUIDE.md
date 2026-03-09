# Global Gem Exchange (GGE) - Payment Flow Testing Guide

## Overview

This document describes the comprehensive mock test suite for the Global Gem Exchange platform. The tests simulate real-world scenarios of users from around the world buying and selling gemstones through the GGE platform.

## Test Coverage

### 1. Health Check
- Verifies the API server is running
- Checks service status and availability

### 2. User Authentication from Worldwide Locations
Tests user signup and login from:
- **Afghanistan** (Kabul) - Local gem seller
- **Brazil** (São Paulo) - Emerald dealer
- **Myanmar** (Yangon) - Jade merchant
- **USA** (New York) - International buyer
- **Australia** (Sydney) - Gem collector
- **India** (Mumbai) - Wholesale buyer

### 3. Listing Creation from Different Locations
Tests sellers creating listings for:
- Lapis Lazuli from Afghanistan
- Aquamarine from Brazil
- Imperial Jade from Myanmar
- And more gemstones from various origins

### 4. Browse and Filter Listings
Tests the marketplace browsing functionality:
- Get all available listings
- Filter by stone type (emerald, ruby, etc.)
- Filter by country of origin
- Filter by price range

### 5. Purchase Flow
Complete buyer journey:
- Browse listings
- Select a gemstone
- Create an order
- Initialize payment

### 6. Payment Integration Tests
Tests all three payment methods:
- **PayPal** - Traditional online payment
- **Stripe** - Credit card processing
- **Solana** - Blockchain escrow system

### 7. Multi-Currency Support
Verifies support for multiple currencies:
- USD (United States Dollar)
- EUR (Euro)
- GBP (British Pound)
- BRL (Brazilian Real)
- INR (Indian Rupee)
- AUD (Australian Dollar)

### 8. Geolocation Features
Tests location-based functionality:
- Verifies all listings have valid coordinates
- Validates latitude/longitude ranges
- Supports global 3D visualization

### 9. User Profile Management
Tests user account features:
- Update payment settings
- Set preferred currency
- Configure payment methods

### 10. Error Handling
Tests system robustness:
- Invalid login credentials
- Missing required fields
- Invalid listing references

## Running the Tests

### Prerequisites

1. **Install dependencies:**
   ```bash
   npm install
   cd backend && npm install
   ```

2. **Start the GGE API server:**
   ```bash
   node backend/services/gge-api.js
   ```
   
   Or use the startup script:
   ```bash
   ./start-gge-api.sh
   ```

   The server should start on `http://localhost:3002`

### Running the Full Test Suite

```bash
node test-gge-payment-flow.js
```

### Expected Output

The test suite will output colorized results:
- ✓ Green checkmarks for passed tests
- ✗ Red X marks for failed tests
- Yellow warnings for additional information

Example output:
```
╔════════════════════════════════════════════════════════════════╗
║  Global Gem Exchange - Comprehensive Payment Flow Tests       ║
║  Testing API: http://localhost:3002                           ║
╚════════════════════════════════════════════════════════════════╝

=== Testing Health Check ===

✓ Health check endpoint responds
✓ Health check returns valid data

=== Testing Authentication from Worldwide Locations ===

Testing from Afghanistan...
✓ Signup from Afghanistan
✓ Login from Afghanistan

Testing from Brazil...
✓ Signup from Brazil
✓ Login from Brazil

[... more tests ...]

═══════════════════════════════════════════════════════════════
                    TEST SUMMARY                        
═══════════════════════════════════════════════════════════════

Total Tests:  45
Passed:       44
Failed:       1
Success Rate: 97.8%
```

## Test Data

### Sample Users

The test suite creates users from various countries with realistic data:

| Country     | Email                       | Location      | Currency |
|-------------|----------------------------|---------------|----------|
| Afghanistan | test.afghan@example.com    | Kabul         | USD      |
| Brazil      | test.brazil@example.com    | São Paulo     | BRL      |
| Myanmar     | test.myanmar@example.com   | Yangon        | USD      |
| USA         | test.usa@example.com       | New York      | USD      |
| Australia   | test.australia@example.com | Sydney        | AUD      |
| India       | test.india@example.com     | Mumbai        | INR      |

### Sample Listings

Pre-populated listings in the system:

1. **Afghan Tourmaline** - Kabul, Afghanistan
   - Weight: 125.5 carats
   - Price: $439.25
   
2. **Brazilian Emerald** - Minas Gerais, Brazil
   - Weight: 45.75 carats
   - Price: R$5,718.75

3. **Mogok Ruby** - Mogok, Myanmar
   - Weight: 3.2 carats
   - Price: $8,000.00

4. **Colombian Emerald** - Muzo, Colombia
   - Weight: 12.5 carats
   - Price: COP$3,750.00

5. **Tanzanite** - Merelani, Tanzania
   - Weight: 8.75 carats
   - Price: TZS$2,187.50

6. **Madagascar Sapphire** - Ilakaka, Madagascar
   - Weight: 15.3 carats
   - Price: $1,836.00

## API Endpoints Tested

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login

### Listings
- `GET /listings` - Get all listings
- `GET /listings?stone_type=emerald` - Filter by stone type
- `GET /listings?country=brazil` - Filter by country
- `GET /listings?min_price=100&max_price=1000` - Filter by price
- `POST /listings` - Create new listing

### Orders
- `POST /orders` - Create new order

### Payments
- `POST /payments/paypal/create` - Initialize PayPal payment
- `POST /payments/stripe/create` - Initialize Stripe payment
- `POST /payments/solana/escrow/init` - Initialize Solana escrow

### User Management
- `PATCH /users/:id` - Update user profile

### System
- `GET /health` - Health check

## Integration with Frontend

The GGE.html frontend has been updated to use the live backend:

```javascript
// Demo mode is now disabled
const DEMO_MODE = false; // Backend is ready - using live API
```

The demo badge has been removed from the UI, and all API calls now go through the backend service.

## Troubleshooting

### Server not starting?

1. Check if port 3002 is already in use:
   ```bash
   lsof -i :3002
   ```

2. Check backend dependencies are installed:
   ```bash
   cd backend && npm install
   ```

### Tests failing?

1. Verify the server is running:
   ```bash
   curl http://localhost:3002/health
   ```

2. Check server logs for errors

3. Ensure the data file exists:
   ```bash
   ls -la backend/data/gge-listings.json
   ```

### Payment tests not working?

The payment endpoints return mock URLs in development. For production:
1. Configure PayPal SDK credentials
2. Set up Stripe API keys
3. Configure Solana wallet integration

## Contributing

When adding new tests:

1. Follow the existing test structure
2. Use descriptive test names
3. Add appropriate success/failure messages
4. Update this README with new test descriptions

## Production Deployment

Before deploying to production:

1. **Configure real payment credentials:**
   - PayPal Client ID and Secret
   - Stripe API keys
   - Solana wallet addresses

2. **Enable HTTPS:**
   - All payment APIs require secure connections

3. **Set up monitoring:**
   - Log all transactions
   - Monitor payment success rates
   - Alert on failures

4. **Update CORS settings:**
   - Restrict to production domain
   - Remove localhost from allowed origins

5. **Database migration:**
   - Move from JSON file to proper database (PostgreSQL, MongoDB, etc.)
   - Set up backups and replication

## Security Considerations

- All test data uses example.com emails
- Test passwords are simple (test123) - never use in production
- Payment credentials should be stored in environment variables
- Real user data must be encrypted
- PCI compliance required for credit card processing

## License

© 2008-2026 Ryan Barbrick (Barbrick Design). All Rights Reserved.

For licensing inquiries, contact: BarbrickDesign@gmail.com
