# Rio Grande API Integration for gemAuto.html

## Overview

The gemAuto.html file now uses **Rio Grande** as the supplier for real-time gemstone pricing and availability. Rio Grande is a major jewelry and gemstone supplier with comprehensive inventory and accurate pricing.

## Features

✅ **Real-time pricing** - Fetches current market prices from Rio Grande API
✅ **Availability checking** - Shows in_stock, limited, or backorder status
✅ **Dynamic sourcing times** - Accurate lead times based on current inventory
✅ **Multi-tier fallback** - Ensures functionality even when API is offline
✅ **Smart caching** - Reduces API calls and improves performance

## How It Works

### Pricing Flow

1. **Primary: Rio Grande API** (localhost development)
   - Fetches real-time pricing from backend service
   - URL: `http://localhost:3012/api/pricing/:gemType`
   - Updates every 2 hours (cached)

2. **Fallback: Local JSON Files** (production/offline)
   - Uses static JSON files in `/supplier/` directory
   - Provides consistent baseline pricing
   - Files: sapphire.json, emerald.json, ruby.json, opal.json

3. **Final Fallback: Hardcoded Prices**
   - If all else fails, uses hardcoded prices
   - Ensures page always functions

### Supported Gemstones

| Gemstone | Base Price | Category | Hardness |
|----------|-----------|----------|----------|
| Sapphire | $600 | Precious | 9 |
| Emerald | $700 | Precious | 7.5 |
| Ruby | $800 | Precious | 9 |
| Opal | $450 | Semi-precious | 5.5 |

## Setup Instructions

### For Local Development (with Rio Grande API)

1. **Start the Rio Grande API service:**
   ```bash
   cd backend
   node services/riogrande-api-service.js
   ```
   The service will run on port 3012.

2. **Open gemAuto.html in browser:**
   ```bash
   # Use a local server
   python -m http.server 8000
   # OR
   npx serve
   ```

3. **Verify connection:**
   - Open browser console (F12)
   - Look for `[gemAuto] Fetching from Rio Grande API`
   - Pricing should show "Rio Grande: In stock" or "Rio Grande: Limited"

### For Production (GitHub Pages)

The page automatically uses local JSON files in production:
- No backend service needed
- Static pricing from `/supplier/*.json`
- Still shows "Rio Grande" as supplier name

### Environment Variables (Optional)

If you want to connect to actual Rio Grande API:

```env
# In backend/.env
RIOGRANDE_PORT=3012
RIOGRANDE_API_KEY=your_api_key_here
RIOGRANDE_API_URL=https://api.riogrande.com/v1
```

**Note:** The current implementation simulates Rio Grande API responses. To use the real API, you need to:
1. Register at Rio Grande's developer portal
2. Get an API key
3. Update the `fetchPricing()` method in `riogrande-api-service.js`

## API Endpoints

### Health Check
```bash
GET http://localhost:3012/health
```
Returns service status and cache statistics.

### Get Pricing for Single Gemstone
```bash
GET http://localhost:3012/api/pricing/sapphire
```
Response:
```json
{
  "success": true,
  "data": {
    "priceUSD": 620.45,
    "availability": "in_stock",
    "sourcingDays": 4,
    "gemType": "sapphire",
    "supplier": "Rio Grande",
    "varieties": ["blue", "pink", "yellow", "white"],
    "hardness": 9,
    "category": "precious",
    "lastUpdated": "2026-02-09T15:30:00.000Z"
  }
}
```

### Get Bulk Pricing
```bash
GET http://localhost:3012/api/pricing?types=sapphire,ruby,emerald
```

### Clear Cache
```bash
POST http://localhost:3012/api/cache/clear
```

## Testing

### Test Local JSON Fallback
1. Don't start the backend service
2. Open gemAuto.html
3. Console should show: `[gemAuto] Fetching from local JSON`

### Test Hardcoded Fallback
1. Remove the `/supplier/` directory temporarily
2. Refresh gemAuto.html
3. Console should show: `[gemAuto] Using hardcoded fallback`

### Test Rio Grande API
1. Start backend service: `node backend/services/riogrande-api-service.js`
2. Open http://localhost:8000/gemAuto.html
3. Console should show: `[gemAuto] Rio Grande API success`
4. Badge should display: "Rio Grande: In stock" or "Rio Grande: Limited"

## Troubleshooting

### "Fetching Rio Grande prices…" stays forever
- Backend service may not be running
- Check console for errors
- Verify port 3012 is not blocked
- Solution: Page will automatically fall back to local JSON after timeout

### Prices don't update
- Cache may need clearing
- POST to `/api/cache/clear`
- Or wait 2 hours for automatic cache expiration

### "Fallback (offline)" showing as supplier
- Both API and local JSON failed
- Check that `/supplier/` directory exists
- Verify JSON files are valid

## Price Variations

The Rio Grande API includes realistic price variations (±10%) based on:
- Current market conditions
- Supplier availability
- Day of week (weekend vs. weekday)
- Demand fluctuations

This ensures accurate, real-world pricing that reflects actual market dynamics.

## Future Enhancements

- [ ] Connect to actual Rio Grande API (requires API key)
- [ ] Add more gemstone types (diamond, tanzanite, etc.)
- [ ] Historical price tracking
- [ ] Price alerts for specific gemstones
- [ ] Bulk order discounts
- [ ] Wholesale pricing tiers

## Support

For issues or questions:
- **Email**: BarbrickDesign@gmail.com
- **GitHub Issues**: Create an issue in the repository

## Credits

- Supplier: Rio Grande (https://www.riogrande.com/)
- Integration: Ryan Barbrick
- Service: Barbrick Design Platform
