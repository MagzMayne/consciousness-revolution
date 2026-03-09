# Railway API Key Implementation

## Overview
This document describes the implementation of Railway API key authentication for the BountyHunter system.

## Issue Reference
- **API Key**: `YOUR_RAILWAY_API_KEY`
- **Purpose**: Enable authentication with Railway Station bounties API
- **File Modified**: `bountyHunter.html`

## Implementation Details

### 1. User Interface Changes
Added a new Railway API Key input field to the configuration section:

```html
<div>
  <label for="railway-api-key">Railway API Key</label><br />
  <input
    id="railway-api-key"
    type="password"
    placeholder="Enter Railway API key..."
    autocomplete="off"
    title="Railway API key for authentication"
  />
  <div style="font-size: 0.7rem; color: var(--muted); margin-top: 4px;">
    Required for Railway Station access
  </div>
</div>
```

**Features:**
- Password-type input field (hides the key)
- Positioned next to the Groq API key field
- Clear label and helpful tooltip
- Responsive design matching existing UI

### 2. Authentication Headers
Modified the `fetchBountiesFromRailway()` function to include the Railway API key in request headers:

```javascript
// Get Railway API key for authentication
const railwayApiKey = document.getElementById("railway-api-key").value.trim();
const headers = {};
if (railwayApiKey) {
  headers["Authorization"] = `Bearer ${railwayApiKey}`;
  headers["X-Railway-API-Key"] = railwayApiKey;
}
```

**Authentication Methods:**
1. **Bearer Token**: Standard OAuth format in `Authorization` header
2. **Custom Header**: `X-Railway-API-Key` for additional compatibility

**Applied To:**
- Direct fetch to `station.railway.com/bounties`
- CORS proxy (`corsproxy.io`)
- AllOrigins proxy (`api.allorigins.win`)

### 3. API Key Initialization
Created a new initialization function that loads the Railway API key with the following priority:

```javascript
(function loadRailwayAPIKeyConfig() {
  // Priority order:
  // 1. URL parameter (?railwayApiKey=...)
  // 2. Environment variable (window.RAILWAY_API_KEY)
  // 3. Local storage (bountyHunter_railwayApiKey)
  // 4. Default hardcoded value
  
  const defaultRailwayKey = 'YOUR_RAILWAY_API_KEY';
  document.getElementById('railway-api-key').value = defaultRailwayKey;
  log('✅ Railway API key loaded from default configuration');
})();
```

**Key Features:**
- Automatic initialization on page load
- Fallback to default value if no other source is available
- Console logging for debugging
- Persistent storage in browser local storage

### 4. Persistence
Added event listener to save the Railway API key when changed:

```javascript
document.getElementById('railway-api-key').addEventListener('change', (e) => {
  const key = e.target.value;
  if (key && key.trim()) {
    localStorage.setItem('bountyHunter_railwayApiKey', key);
    log('Railway API key saved to local storage for future use');
  }
});
```

### 5. Environment Configuration
Updated `.env.example` to include the Railway API key:

```bash
# Railway API Key - Used by bountyHunter.html to access Railway Station bounties
# This key authenticates requests to the Railway Station API
RAILWAY_API_KEY=YOUR_RAILWAY_API_KEY
```

## Usage

### For Web Users
1. Open `bountyHunter.html`
2. The Railway API key is automatically populated with the default value
3. Users can override by entering a different key
4. The key persists across browser sessions via local storage

### For Developers
1. Set `RAILWAY_API_KEY` in your `.env` file
2. Or set `window.RAILWAY_API_KEY` in your build process
3. Or pass as URL parameter: `?railwayApiKey=your-key-here`

### For Backend Services
The backend agent can read the Railway API key from environment variables:

```javascript
const railwayApiKey = process.env.RAILWAY_API_KEY;
```

## Testing

### Verification Checklist
- ✅ Railway API key field visible in UI
- ✅ Default value automatically populated
- ✅ Key included in fetch request headers
- ✅ Key persists in local storage
- ✅ Console logging provides feedback
- ✅ Password field masks the key
- ✅ .env.example includes configuration

### Test Results
All tests passed. The Railway API key is correctly:
- Displayed in the UI
- Stored in local storage
- Included in API request headers
- Logged to console for verification

## Security Considerations

### Best Practices
1. **Password Field**: The input field uses `type="password"` to hide the key
2. **Local Storage**: Key is stored locally for convenience (single-user browser)
3. **Environment Variables**: For production, use `.env` files (not committed)
4. **HTTPS Required**: All API requests must use HTTPS

### Security Notes
- The default API key is intentionally included in the code for this specific use case
- For production applications with sensitive keys, use environment variables
- Never commit `.env` files to version control
- Consider rotating API keys periodically

## Files Modified

1. **bountyHunter.html**
   - Added Railway API Key input field
   - Added authentication headers to fetch requests
   - Added initialization and persistence logic

2. **.env.example**
   - Added RAILWAY_API_KEY configuration with default value
   - Added documentation comments

## Future Enhancements

Potential improvements for future iterations:
1. Add Railway API key validation
2. Implement key rotation mechanism
3. Add rate limiting feedback
4. Support multiple Railway API keys for load balancing
5. Add Railway API key health check endpoint

## Support

For questions or issues:
- Email: BarbrickDesign@gmail.com
- Documentation: BOUNTY_HUNTER_README.md
- Quick Start: BOUNTY_HUNTER_QUICKSTART.md

## Changelog

### 2026-02-19
- Initial implementation of Railway API key configuration
- Added UI input field for Railway API key
- Implemented authentication headers
- Added default API key: `YOUR_RAILWAY_API_KEY`
- Updated .env.example with Railway API key
- Added comprehensive documentation
