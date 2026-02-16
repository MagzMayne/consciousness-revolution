# Gem Scraper Service - Instagram & eBay Automation

## Overview

The Gem Scraper Service is an automated backend service that scrapes Instagram for gemstone listings and compares them with eBay sold prices to identify profitable investment opportunities.

## Features

- 🔍 **Instagram Scraping**: Automatically extract gemstone listings from Instagram posts and hashtags
- 💎 **Smart Extraction**: AI-powered parsing of stone names, prices, and weights from captions
- 🛒 **eBay Integration**: Fetch sold listings from eBay for price comparison
- 📊 **Profit Analysis**: Calculate profit potential, ROI, and investment recommendations
- 💾 **Intelligent Caching**: Reduce API costs with TTL-based caching
- 🎯 **Automated Discovery**: Scan multiple sources simultaneously for opportunities

## Installation

### Prerequisites

- Node.js >= 16.0.0
- npm or yarn

### Install Dependencies

```bash
cd backend
npm install
```

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Gem Scraper Service
GEM_SCRAPER_PORT=3010

# Instagram Scraping (via RapidAPI)
RAPIDAPI_KEY=your_rapidapi_key_here

# eBay API (optional, uses fallback scraping if not provided)
EBAY_APP_ID=your_ebay_app_id_here
```

### Get API Keys

#### RapidAPI (Instagram Scraping)

1. Sign up at https://rapidapi.com/
2. Subscribe to "Instagram Scraper API" or similar service
3. Copy your API key to `.env`

**Note:** The service works without API keys by using mock data for development and fallback scraping for production.

#### eBay API (Optional)

1. Register at https://developer.ebay.com/
2. Create an application to get your App ID
3. Add to `.env`

If not provided, the service uses HTML scraping via CORS proxy.

## Running the Service

### Development Mode

```bash
# From backend directory
node services/gem-scraper-service.js
```

### Production Mode

```bash
# Add to your backend services startup
# Or use PM2 for process management
pm2 start services/gem-scraper-service.js --name gem-scraper
```

## API Endpoints

### Health Check

```http
GET /health
```

Returns service health status and cache statistics.

**Response:**
```json
{
  "status": "healthy",
  "service": "gem-scraper-service",
  "timestamp": "2026-02-05T13:00:00.000Z",
  "cache": {
    "instagram": 5,
    "ebay": 12
  }
}
```

### Scrape Instagram User

```http
GET /api/instagram/user/:username?limit=20
```

Scrapes recent posts from an Instagram user and extracts gemstone data.

**Parameters:**
- `username` (path, required): Instagram username (without @)
- `limit` (query, optional): Number of posts to fetch (default: 20)

**Response:**
```json
{
  "success": true,
  "username": "gemdealer",
  "count": 3,
  "posts": [
    {
      "id": "post_123",
      "username": "gemdealer",
      "caption": "Beautiful 2.5ct Tourmaline for sale! $150",
      "permalink": "https://instagram.com/p/abc123",
      "stone_name": "Tourmaline",
      "price_value": 150,
      "weight_ct": 2.5,
      "likes": 245,
      "comments": 12
    }
  ]
}
```

### Search Instagram Hashtag

```http
GET /api/instagram/hashtag/:hashtag?limit=30
```

Searches Instagram posts by hashtag and extracts gemstone data.

**Parameters:**
- `hashtag` (path, required): Hashtag to search (without #)
- `limit` (query, optional): Number of posts to fetch (default: 30)

**Response:** Same format as user endpoint

### Get eBay Sold Listings

```http
GET /api/ebay/sold?query=tourmaline+2.5ct&limit=50
```

Fetches sold listings from eBay for price comparison.

**Parameters:**
- `query` (query, required): Search query
- `limit` (query, optional): Number of results (default: 50)

**Response:**
```json
{
  "success": true,
  "query": "tourmaline 2.5ct",
  "count": 45,
  "items": [
    {
      "title": "Natural Tourmaline 2.5ct Gemstone",
      "price": "180.00",
      "currency": "USD",
      "end_time": "2026-02-01T10:00:00.000Z",
      "item_id": "123456",
      "link": "https://ebay.com/itm/123456"
    }
  ]
}
```

### Analyze Stone

```http
POST /api/analyze
Content-Type: application/json

{
  "stone_name": "Tourmaline",
  "price_value": 150,
  "weight_ct": 2.5,
  "source": "@gemdealer"
}
```

Analyzes a single gemstone for profit potential.

**Response:**
```json
{
  "success": true,
  "stone": {
    "stone_name": "Tourmaline",
    "price_value": 150,
    "weight_ct": 2.5,
    "source": "@gemdealer"
  },
  "ebay": {
    "count": 45,
    "median": 75.20,
    "average": 78.40,
    "min": 45.00,
    "max": 120.00,
    "perCarat": 31.36,
    "confidence": 0.82
  },
  "analysis": {
    "profitable": true,
    "profit": 46.00,
    "roi": 30.67,
    "estimatedSalePrice": 196.00,
    "ebayFees": 25.48,
    "confidence": 0.82,
    "recommendation": "buy",
    "sampleSize": 45
  }
}
```

### Automated Discovery

```http
POST /api/discover
Content-Type: application/json

{
  "usernames": ["gemdealer", "precisiongemcutters"],
  "hashtags": ["gemsforsale", "loosegems"]
}
```

Automatically discovers profitable gemstone opportunities from multiple Instagram sources.

**Response:**
```json
{
  "success": true,
  "total_scanned": 87,
  "opportunities": 12,
  "top_opportunities": [
    {
      "post": { /* Instagram post data */ },
      "ebayStats": { /* eBay statistics */ },
      "analysis": { /* Profit analysis */ }
    }
  ]
}
```

### Clear Cache

```http
POST /api/cache/clear
```

Clears all cached data (Instagram and eBay).

**Response:**
```json
{
  "success": true,
  "message": "Cache cleared",
  "cleared": {
    "instagram": 5,
    "ebay": 12
  }
}
```

## Recommendation System

The service provides investment recommendations based on ROI and confidence:

| Recommendation | Criteria | Action |
|---------------|----------|--------|
| 🔥 **STRONG BUY** | ROI ≥ 50% AND confidence ≥ 60% | High-confidence profitable investment |
| ✅ **BUY** | ROI ≥ 25% AND confidence ≥ 50% | Good investment opportunity |
| 🤔 **CONSIDER** | ROI ≥ 10% | Marginal profit, requires review |
| ⏸️ **HOLD** | ROI < 10% | Low profit potential |
| ❌ **AVOID** | ROI < 0% | Likely to lose money |

## Caching Strategy

- **Instagram Cache**: 1 hour TTL (reduces API calls)
- **eBay Cache**: 6 hours TTL (sold prices change slowly)

Cache is automatically cleaned up based on TTL. Use `/api/cache/clear` to manually clear.

## Error Handling

The service uses fallback mechanisms:

1. **Instagram**: Falls back to mock data if API key is not configured
2. **eBay**: Falls back to HTML scraping via CORS proxy if API key is not configured

This ensures the service remains functional even without API credentials.

## Integration with Frontend

The enhanced `igGems_enhanced.html` file automatically connects to this service when running on localhost. For production, update the `API_BASE_URL` in the frontend code to point to your deployed backend.

```javascript
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3010'
  : 'https://your-backend-url.com';
```

## Development Tips

### Mock Data

The service includes mock Instagram data for development/testing when API keys are not configured. This allows you to test the full workflow without API credentials.

### Rate Limiting

- Add delays between API calls to avoid rate limiting
- Current implementation uses 500ms delay between analyses
- Adjust as needed based on your API plan

### Monitoring

Check service health regularly:

```bash
curl http://localhost:3010/health
```

### Debugging

Enable detailed logging by setting environment variable:

```bash
DEBUG=* node services/gem-scraper-service.js
```

## Production Deployment

### Using PM2

```bash
pm2 start services/gem-scraper-service.js --name gem-scraper
pm2 save
pm2 startup
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3010
CMD ["node", "services/gem-scraper-service.js"]
```

### Environment Variables in Production

Use secure secret management:
- AWS Secrets Manager
- Azure Key Vault
- Kubernetes Secrets
- Environment variables in hosting platform

## Security Considerations

1. **API Keys**: Never commit API keys to version control
2. **CORS**: Configure CORS appropriately for production
3. **Rate Limiting**: Add rate limiting middleware for public endpoints
4. **Input Validation**: Service validates all inputs
5. **Error Messages**: Sanitized error messages prevent information leakage

## Troubleshooting

### Service won't start

```bash
# Check if port is already in use
lsof -i :3010

# Use different port
GEM_SCRAPER_PORT=3011 node services/gem-scraper-service.js
```

### Instagram scraping returns empty results

- Check RapidAPI key is valid
- Verify API subscription is active
- Check API rate limits
- Service falls back to mock data if API fails

### eBay scraping fails

- eBay API key may be invalid or expired
- Fallback HTML scraping may be blocked by CORS
- Check network connectivity
- Verify eBay site is accessible

## Future Enhancements

- [ ] Add support for more gemstone marketplaces (Etsy, Ruby Lane)
- [ ] Implement webhook notifications for high-ROI opportunities
- [ ] Add machine learning for price prediction
- [ ] Support for bulk analysis via job queue
- [ ] Real-time monitoring dashboard
- [ ] Historical price tracking
- [ ] Automated purchasing integration

## Support

For issues or questions:
- **Email**: BarbrickDesign@gmail.com
- **GitHub Issues**: Create an issue in the repository
- **Documentation**: See main README.md

## License

MIT License - See LICENSE file for details

## Credits

Created by Ryan Barbrick for the Barbrick Design platform
Part of the automated investment analysis suite
