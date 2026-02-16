# Mindat.org Integration Guide

## Overview

The Fluorite Specimen Identifier now integrates with **mindat.org**, the world's largest database of minerals and their localities. This integration provides access to **100+ real fluorite localities** instead of the previous 6 hardcoded localities.

**Reference Implementation**: This integration follows the patterns demonstrated in [jolyonralph's mindat_api_test repository](https://github.com/jolyonralph/mindat_api_test), which provides comprehensive examples of working with the Mindat API in Python. Our implementation adapts these patterns for browser-based JavaScript usage.

## Why Mindat.org?

- ✅ **Comprehensive Data**: Access to thousands of documented fluorite localities worldwide
- ✅ **Real Locality Information**: Actual geological data, coordinates, and mineral associations
- ✅ **Regular Updates**: Database continuously updated by the mineralogical community
- ✅ **Authoritative Source**: Trusted by mineralogists, museums, and collectors globally

## Getting Started

### 1. Get Your Mindat API Key

1. Visit [mindat.org](https://www.mindat.org/)
2. Create a free account (if you don't have one)
3. Your account must be **Level 1 or higher** to access the API
4. Follow the guide: [How to Get My Mindat API Key](https://www.mindat.org/a/how_to_get_my_mindat_api_key)
5. Copy your API key/token

### 2. Configure the API Key

#### Option A: Via Web Interface

1. Open the **Fluorite Specimen Identifier** ([fluoriteId.html](./fluoriteId.html))
2. Scroll to the **Advanced Settings** section (collapsed by default)
3. Click to expand "⚙️ Advanced Settings"
4. Paste your API key into the input field
5. Click **Save Key** to store it
6. Click **Test** to verify the connection

#### Option B: Via Environment Variable

Add to your `.env` file:

```bash
MINDAT_API_KEY=your_mindat_api_key_here
```

#### Option C: Via JavaScript Configuration

If you're running the app in a custom environment:

```javascript
// Set API key programmatically
if (window.ENV) {
  window.ENV.MINDAT_API_KEY = 'your_api_key_here';
}
```

### 3. Verify Integration

Once configured, you'll see:

- **Green tag** in results: "🔷 Using 100 localities from mindat.org"
- **Console log**: "✅ Loaded X fluorite localities from Mindat.org"
- **Toast notification**: "✨ Using 100 real fluorite localities from mindat.org!"

## How It Works

### Data Flow

1. **On Page Load**:
   - System initializes `MindatAPIIntegration` class
   - Checks for API key in environment, localStorage, or config
   - Tests connection if key is available

2. **On Specimen Analysis**:
   - Loads fluorite localities from mindat.org (if API key configured)
   - Falls back to 6 hardcoded localities if API unavailable
   - Caches results for 24 hours to minimize API calls

3. **Locality Matching**:
   - AI analyzes specimen colors, habits, and features
   - Compares against real mindat.org localities
   - Returns top matches with confidence scores

### API Caching

- Results are cached for **24 hours** to avoid excessive API calls
- Cache is stored in memory (cleared on page refresh)
- Future versions may add persistent caching

## Features

### Automatic Fallback

If mindat.org API is unavailable:
- System automatically falls back to 6 hardcoded localities
- Orange warning tag displayed: "⚠️ Fallback data (6 localities)"
- All functionality continues to work normally

### Enhanced Locality Data

Each mindat.org locality includes:

- **Name**: Full locality name (e.g., "Rogerley Mine, Weardale, England")
- **Country**: Geographic location
- **Region**: State/province information
- **Coordinates**: Latitude and longitude
- **Description**: Geological and mineralogical details
- **Color Information**: Extracted from descriptions
- **Crystal Habit**: Common crystal forms
- **Associated Minerals**: Matrix and companion minerals
- **Mindat URL**: Direct link to locality page

### Intelligent Color Extraction

The system analyzes mindat descriptions to extract:

- **Purple/Violet**: purple, violet, mauve, lavender
- **Green**: green, emerald, lime
- **Blue**: blue, azure, cyan, turquoise
- **Yellow**: yellow, golden, amber, honey
- **Pink**: pink, rose, salmon
- **Colorless**: colorless, clear, transparent, white

## API Limits

- **Free Tier**: Limited requests per day (check mindat.org for current limits)
- **Caching**: Reduces API usage by caching results for 24 hours
- **Batch Requests**: System fetches up to 100 localities per request

## Troubleshooting

### "No Mindat API key configured"

**Solution**: Follow the configuration steps above to add your API key.

### "Authentication required"

**Possible causes**:
- Invalid API key
- API key not properly formatted
- Account level too low (must be Level 1+)

**Solution**: Verify your API key and account level on mindat.org

### "Mindat API connection failed"

**Possible causes**:
- Network connectivity issues
- Mindat.org API temporarily unavailable
- Rate limit exceeded

**Solution**: 
- Check your internet connection
- Wait a few minutes and try again
- System will automatically use fallback data

### "Using fallback data"

This is normal if:
- No API key is configured
- API connection fails
- You're testing without internet access

**Solution**: Add API key for full functionality

## Data Source Indicators

The system clearly indicates which data source is being used:

| Indicator | Meaning |
|-----------|---------|
| 🔷 Green tag "Using X localities from mindat.org" | Real mindat.org data active |
| ⚠️ Orange tag "Fallback data (6 localities)" | Using hardcoded default localities |
| Console: "✅ Loaded X fluorite localities from Mindat.org" | Successful mindat fetch |
| Console: "⚠️ Using fallback fluorite localities" | Fallback mode active |

## Code Examples

### Testing API Connection

```javascript
// Test if mindat API is working
if (state.mindatAPI) {
  const result = await state.mindatAPI.testConnection();
  console.log(result);
  // { success: true, authenticated: true, message: "...", localitiesFound: 100 }
}
```

### Fetching Specific Localities

```javascript
// Search for localities by name
const localities = await state.mindatAPI.searchLocalities('Rogerley', 10);
console.log(localities);

// Get all fluorite localities
const allLocalities = await state.mindatAPI.getFluoriteLocalities();
console.log(`Found ${allLocalities.length} fluorite localities`);
```

### Manual Database Reload

```javascript
// Force reload of fluorite database
fluoriteDatabase.localities = [];
fluoriteDatabase.source = 'loading';
await loadFluoriteDatabase();
```

## Privacy & Data Usage

- ✅ **No personal data sent** to mindat.org (only API requests)
- ✅ **API key stored locally** in browser localStorage
- ✅ **No image uploads** to mindat.org (analysis is local)
- ✅ **Caching reduces** API calls and improves privacy

## Future Enhancements

Planned features:

- [ ] Persistent caching (IndexedDB)
- [ ] Filter localities by country/region
- [ ] Display locality coordinates on map
- [ ] Link to mindat.org locality pages in results
- [ ] Custom locality collections
- [ ] Offline mode with pre-downloaded database

## Support

For issues related to:

- **Mindat API**: Contact [mindat.org support](https://www.mindat.org/contact.php)
- **Integration bugs**: Open an issue on GitHub
- **Feature requests**: Email BarbrickDesign@gmail.com

## Resources

- [Mindat.org Official Website](https://www.mindat.org/)
- [Mindat API Documentation](https://api.mindat.org/v1/schema/redoc/)
- [How to Get Mindat API Key](https://www.mindat.org/a/how_to_get_my_mindat_api_key)
- [Reference: jolyonralph/mindat_api_test](https://github.com/jolyonralph/mindat_api_test) - Python examples for Mindat API
- [OpenMindat Python Library](https://github.com/ChuBL/OpenMindat)
- [Mindat API Examples](https://github.com/ChuBL/How-to-Use-Mindat-API)

## Acknowledgments

This integration was inspired by and follows the patterns demonstrated in [jolyonralph's mindat_api_test repository](https://github.com/jolyonralph/mindat_api_test), which provides excellent reference implementations for working with the Mindat.org API.

## License

This integration respects mindat.org's terms of service and API usage policies. Please review their terms before extensive use.

---

© 2024-2025 Ryan Barbrick / Barbrick Design
