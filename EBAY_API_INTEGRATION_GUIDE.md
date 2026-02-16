# eBay API Integration Guide

## Overview

This guide covers the eBay API integration for mineral identification, marketplace pricing, and autonomous marketing capabilities in the Barbrick Design repository.

## Purpose

The eBay API integration enhances three key areas:

1. **Mineral Identification** (`fluoriteId.html`) - Real-time marketplace pricing for identified specimens
2. **Mineral Marketplace** (`mineralMarket.html`) - Listing creation and competitive analysis
3. **Marketing Automation** (`src/agents/marketing-agent.js`) - Autonomous product listing and optimization

## Getting Started

### 1. Get eBay API Credentials

1. Visit [eBay Developer Program](https://developer.ebay.com/my/keys)
2. Sign in or create a developer account
3. Create a new application:
   - Go to "My Account" → "Application Keys"
   - Click "Create an App"
   - Fill in application details
   - Select appropriate scopes (Browse, Buy, Sell, Marketing)
4. Copy your credentials:
   - **Client ID** (App ID)
   - **Client Secret** (Cert ID)

### 2. Configure Environment

Add your credentials to `.env` file:

```bash
# eBay API Configuration
EBAY_CLIENT_ID=YourAppID-Here-PRD-xxxxx
EBAY_CLIENT_SECRET=PRD-xxxxx-your-cert-id
EBAY_ENVIRONMENT=production
EBAY_MARKETPLACE=EBAY_US
```

**For testing**, use sandbox environment:
```bash
EBAY_ENVIRONMENT=sandbox
```

### 3. API Scopes Required

The integration uses these eBay API scopes:

- **Browse API** - Search items, get item details
- **Buy API** - Get pricing insights
- **Sell API** - Create and manage listings (requires user OAuth)
- **Marketing API** - Promotions and analytics

## Features

### Mineral Identification (fluoriteId.html)

After identifying a fluorite specimen, the system automatically:

1. **Searches eBay** for similar specimens based on:
   - Mineral name
   - Color characteristics
   - Locality information
   - Fluorescence properties

2. **Displays Price Insights**:
   - Market price (median)
   - Competitive price (40th percentile)
   - Premium price (75th percentile)
   - Price range (min-max)

3. **Shows Top Listings**:
   - 5 most relevant current listings
   - Click to view on eBay
   - Condition and pricing comparison

4. **Generates Listing Suggestions**:
   - Optimized title with SEO keywords
   - Comprehensive description template
   - Pricing recommendations
   - Market competition analysis

### Mineral Marketplace (mineralMarket.html)

Enhanced marketplace features:

- **Browse eBay listings** directly from the interface
- **Compare prices** with internal marketplace
- **Create listings** with AI-optimized content
- **Track market trends** for different mineral types

### Marketing Automation (marketing-agent.js)

Autonomous eBay marketing capabilities:

1. **Automated Listing Creation**:
```javascript
const agent = new MarketingAgent();
const listing = await agent.createEbayListing({
  name: 'Fluorite',
  characteristics: {
    color: 'Green',
    locality: 'Rogerley Mine, England',
    fluorescent: true,
    weight: '45g'
  }
});
```

2. **Listing Optimization**:
```javascript
const recommendations = await agent.optimizeEbayListing('item-id-123');
// Returns: title improvements, pricing strategy, keyword suggestions
```

3. **Competitive Analysis**:
```javascript
const analysis = await agent.ebayAPI.getCompetitiveAnalysis('Fluorite specimen');
// Returns: competitor count, price ranges, market gaps
```

## API Usage Examples

### Search for Items

```javascript
const ebayAPI = new EbayApiIntegration();

const results = await ebayAPI.searchItems('Fluorite specimen', {
  limit: 50,
  categoryId: '3213', // Rocks, Fossils & Minerals
  filter: 'conditionIds:{1000|3000}', // New or Very Good
  sort: 'price'
});

console.log(`Found ${results.total} items`);
results.items.forEach(item => {
  console.log(`${item.title}: $${item.price.value}`);
});
```

### Get Price Insights

```javascript
const insights = await ebayAPI.getPriceInsights('Green Fluorite', '3213');

console.log('Price Analysis:');
console.log(`Market Price: $${insights.prices.median}`);
console.log(`Average: $${insights.prices.average}`);
console.log(`Range: $${insights.prices.min} - $${insights.prices.max}`);
console.log(`Sample Size: ${insights.sampleSize} listings`);
```

### Search Minerals

```javascript
const mineralResults = await ebayAPI.searchMinerals('Fluorite', {
  type: 'crystal',
  limit: 30
});

console.log(`Found ${mineralResults.total} fluorite specimens`);
```

### Generate Listing Details

```javascript
const suggestions = await ebayAPI.getSuggestedListingDetails('Fluorite', {
  color: 'Green',
  locality: 'Rogerley Mine, England',
  fluorescent: true,
  weight: '45g',
  dimensions: '5cm x 3cm'
});

console.log('Suggested Title:', suggestions.title.suggested);
console.log('Recommended Price:', suggestions.pricing.recommended);
console.log('Description Template:', suggestions.description.template);
```

## UI Integration

### fluoriteId.html

After analysis completes:
- **eBay pricing section** automatically appears below results
- **"View on eBay" button** searches for similar specimens
- **"Generate Listing" button** creates optimized listing suggestions
- **Modal dialog** displays full listing details with copy buttons

### mineralMarket.html

Enhanced with:
- **eBay price comparison** in listing cards
- **"List on eBay" button** for internal items
- **Market insights** dashboard showing eBay trends

### marketing-agent-dashboard.html

New eBay controls:
- Enable/disable eBay integration
- Configure automation settings
- View listing performance metrics
- Monitor competitive analysis

## Best Practices

### 1. Rate Limiting

eBay has rate limits:
- **Production**: 5,000 calls per day
- **Sandbox**: 5,000 calls per day

The integration includes automatic rate limiting and caching:

```javascript
const ebayAPI = new EbayApiIntegration({
  cacheEnabled: true,      // Enable caching
  cacheDuration: 3600000   // 1 hour cache
});
```

### 2. Error Handling

Always handle API errors gracefully:

```javascript
try {
  const results = await ebayAPI.searchItems('query');
} catch (error) {
  console.error('eBay search failed:', error);
  // Fallback to alternative data source
}
```

### 3. Authentication

OAuth tokens expire after 2 hours. The integration automatically:
- Refreshes tokens before expiration
- Re-authenticates on 401 errors
- Caches valid tokens

### 4. Search Optimization

For best results:
- Use specific keywords (e.g., "Green Fluorite Rogerley" vs "Fluorite")
- Include relevant category IDs
- Filter by condition when appropriate
- Sort by relevance for pricing analysis

### 5. Listing Creation

When generating listings:
- Use high-quality specimen images
- Include detailed locality information
- Highlight unique features (UV fluorescence, rare colors)
- Price competitively based on market insights
- Use all 13 item specifics for better visibility

## Troubleshooting

### "eBay API not initialized"

**Solution**: Check API credentials in `.env` file:
```bash
EBAY_CLIENT_ID=your-app-id
EBAY_CLIENT_SECRET=your-cert-id
```

### "Authentication failed: 401"

**Causes**:
- Invalid credentials
- Expired OAuth token
- Wrong environment (sandbox vs production)

**Solution**: Verify credentials and environment setting.

### "No items found"

**Causes**:
- Too specific search query
- Wrong category ID
- Restrictive filters

**Solution**: Broaden search parameters:
```javascript
// Instead of:
searchItems('Rogerley Green Fluorite UV reactive specimen', {...})

// Try:
searchItems('Fluorite specimen', {...})
```

### "Rate limit exceeded"

**Solution**: Enable caching and reduce API calls:
```javascript
const ebayAPI = new EbayApiIntegration({
  cacheEnabled: true,
  cacheDuration: 7200000  // 2 hours
});
```

## Advanced Features

### Custom Search Filters

```javascript
const results = await ebayAPI.searchItems('Fluorite', {
  filter: [
    'conditionIds:{1000|3000}',           // New or Very Good
    'price:[10..500],priceCurrency:USD',   // $10-$500
    'buyingOptions:{FIXED_PRICE}',         // Buy It Now only
    'itemLocationCountry:US'               // US sellers only
  ].join('|')
});
```

### Category Hierarchy

Common mineral categories:
- `3213` - Rocks, Fossils & Minerals (top level)
- `158747` - Crystals & Mineral Specimens
- `158748` - Minerals
- `3214` - Fossils

### Market Trend Analysis

```javascript
// Compare prices over time
const current = await ebayAPI.getPriceInsights('Fluorite');
// Save to database with timestamp
// Compare with historical data
```

## Security Considerations

### Never Commit Secrets

**DO NOT** commit these to git:
- `.env` file
- eBay API credentials
- OAuth tokens
- User session data

### Use Environment Variables

```javascript
// Good ✓
const clientId = process.env.EBAY_CLIENT_ID;

// Bad ✗
const clientId = 'YourAppID-Here-PRD-xxxxx';
```

### Validate User Input

```javascript
function sanitizeSearchQuery(query) {
  // Remove special characters that could break API calls
  return query.replace(/[<>]/g, '').trim();
}
```

## Revenue Generation

### Mineral ID Sales Funnel

1. User identifies mineral (free)
2. See eBay pricing (engagement)
3. Generate listing (value-add)
4. List on eBay (transaction)
5. Share success (referral)

### Marketing Agent Revenue

1. Automated listing creation
2. Bulk listing optimization
3. Market trend reports
4. Competitor monitoring
5. Performance analytics

### Affiliate Opportunities

- eBay Partner Network (4-8% commission)
- Mineral marketplace fees
- Premium features (advanced analytics)
- API access tiers

## Support

### eBay Developer Resources

- **Developer Portal**: https://developer.ebay.com
- **API Documentation**: https://developer.ebay.com/api-docs
- **Forums**: https://community.ebay.com/t5/Developer-Forum/bd-p/Developer_API
- **Support**: https://developer.ebay.com/support

### Repository Contact

- **Creator**: Ryan Barbrick
- **Email**: BarbrickDesign@gmail.com
- **Issues**: https://github.com/barbrickdesign/barbrickdesign.github.io/issues

## Future Enhancements

### Planned Features

- [ ] Real-time listing monitoring
- [ ] Automated price adjustments
- [ ] Bulk listing management
- [ ] Advanced analytics dashboard
- [ ] Integration with other marketplaces (Etsy, Amazon)
- [ ] AI-powered image enhancement
- [ ] Automated customer messaging
- [ ] Shipping label generation
- [ ] Inventory synchronization

### Community Contributions

Want to enhance the eBay integration? Areas for contribution:

1. Additional marketplace support
2. Advanced pricing algorithms
3. Machine learning for listing optimization
4. Mobile app integration
5. Multilingual support
6. Enhanced analytics
7. Better error handling
8. Performance optimizations

## License

This integration follows the repository's ethical use guidelines:
- Revenue generation focused
- Educational purposes
- No misuse of eBay platform
- Compliance with eBay policies
- User data protection

## Changelog

### Version 1.0.0 (2026-02-09)

**Initial Release**
- eBay API integration utility (`src/utils/ebay-api-integration.js`)
- fluoriteId.html enhancements (pricing, listings)
- mineralMarket.html integration
- marketing-agent.js eBay capabilities
- Comprehensive documentation
- Environment configuration
- Error handling and caching
- Rate limiting implementation

---

**Remember**: This integration is designed to enhance user experience and generate revenue ethically. Always comply with eBay's terms of service and API usage policies.

For questions or support, contact BarbrickDesign@gmail.com
