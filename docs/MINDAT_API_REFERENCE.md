# Mindat API Reference - From Python to JavaScript

## Overview

This document explains how the Fluorite Specimen Identifier's Mindat.org integration was adapted from the Python examples in [jolyonralph/mindat_api_test](https://github.com/jolyonralph/mindat_api_test).

## Reference Repository

**Source**: [https://github.com/jolyonralph/mindat_api_test](https://github.com/jolyonralph/mindat_api_test)

The `mindat_api_test` repository by Jolyon Ralph provides comprehensive Python examples for working with the Mindat.org API. These examples demonstrate:

- Token-based authentication
- Various API endpoints (items, localities, minerals_ima)
- Query parameters and filtering
- Expanding related data
- Fuzzy search functionality
- Best practices for API key management

## Key Adaptations

### 1. Authentication

**Python (from mindat_api_test):**
```python
MINDAT_API_URL = "https://api.mindat.org"
YOUR_API_KEY = ""

headers = {'Authorization': 'Token '+YOUR_API_KEY}
```

**JavaScript (our implementation):**
```javascript
class MindatAPIIntegration {
  constructor(apiKey = null) {
    this.apiKey = apiKey || this.getAPIKey();
    this.baseURL = 'https://api.mindat.org';
    this.token = null;
  }
  
  async apiRequest(endpoint, params = {}) {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Token ${this.token}`,
        'Accept': 'application/json'
      }
    });
  }
}
```

### 2. Localities Endpoint

**Python (from mindat_api_test):**
```python
# https://api.mindat.org/localities/?expand=items&fields=id,name,items
params = {'expand': 'items',
          'fields': 'id,name,items',
          'format': 'json'}
r = requests.get(MINDAT_API_URL+"/localities/",
                 params=params,
                 headers=headers)
```

**JavaScript (our implementation):**
```javascript
async getFluoriteLocalities(filters = {}) {
  const params = {
    geomaterial: this.fluoriteID, // Fluorite mineral ID (1576)
    page_size: 100,
    ordering: '-id',
    ...filters
  };
  
  const response = await this.apiRequest('/localities/', params);
  return (response.results || []).map(loc => this.formatLocality(loc));
}
```

### 3. Search Functionality

**Python (from mindat_api_test):**
```python
# https://api.mindat.org/items_search/?q=raelgard
params = {'q': 'raelgard',
          'format': 'json'}
r = requests.get(MINDAT_API_URL+"/items_search/",
                 params=params,
                 headers=headers)
```

**JavaScript (our implementation):**
```javascript
async searchLocalities(query, limit = 10) {
  const params = {
    q: query,
    geomaterial: this.fluoriteID,
    page_size: limit
  };
  
  const response = await this.apiRequest('/localities/', params);
  return (response.results || []).map(loc => this.formatLocality(loc));
}
```

### 4. Items/Minerals Endpoint

**Python (from mindat_api_test):**
```python
# https://api.mindat.org/items/?fields=id,name,dispformulasimple&page_size=100
params = {'fields': 'id,name,dispformulasimple',
          'page_size': '100',
          'format': 'json'}
r = requests.get(MINDAT_API_URL+"/items/",
                 params=params,
                 headers=headers)
```

**JavaScript (our implementation):**
```javascript
// We use the fluorite ID (1576) directly in locality queries
const fluoriteID = 1576;

// Filter localities by fluorite mineral
async getFluoriteLocalities(filters = {}) {
  const params = {
    geomaterial: this.fluoriteID,
    page_size: 100,
    ...filters
  };
  // ...
}
```

## API Endpoints Used

Our implementation uses these Mindat API endpoints, following the patterns from mindat_api_test:

### 1. Localities Endpoint
- **URL**: `https://api.mindat.org/v1/localities/`
- **Purpose**: Get fluorite localities worldwide
- **Parameters**:
  - `geomaterial=1576` - Filter for fluorite
  - `page_size=100` - Results per page
  - `ordering=-id` - Sort by newest first

### 2. Locality Details Endpoint
- **URL**: `https://api.mindat.org/v1/localities/{id}/`
- **Purpose**: Get detailed information about a specific locality
- **Returns**: Full locality data including coordinates, description, associated minerals

## Best Practices Adopted

From the mindat_api_test examples, we adopted these best practices:

### 1. API Key Security
```javascript
// Don't hardcode API keys
// Use environment variables or localStorage
getAPIKey() {
  if (process.env && process.env.MINDAT_API_KEY) {
    return process.env.MINDAT_API_KEY;
  }
  return localStorage.getItem('mindat_api_key');
}
```

### 2. Error Handling
```javascript
async apiRequest(endpoint, params = {}) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}
```

### 3. Caching
```javascript
// Cache results to minimize API calls
saveToCache(key, data) {
  this.cache.set(key, {
    data,
    timestamp: Date.now()
  });
}
```

### 4. Fallback Data
```javascript
// Always provide fallback when API is unavailable
async getLocalityDatabase() {
  try {
    const mindatLocalities = await this.getFluoriteLocalities();
    if (mindatLocalities.length > 0) {
      return { localities: mindatLocalities, source: 'mindat.org' };
    }
  } catch (error) {
    console.warn('Mindat API unavailable, using fallback');
  }
  
  return { localities: this.getFallbackLocalities(), source: 'fallback' };
}
```

## Key Differences: Python vs JavaScript

### 1. Async/Await Pattern
- **Python**: Uses `requests` library (synchronous)
- **JavaScript**: Uses `fetch` API with async/await

### 2. Browser vs Server
- **Python**: Runs on server, can use environment variables directly
- **JavaScript**: Runs in browser, uses localStorage for persistence

### 3. Data Format
- **Python**: Works directly with JSON dictionaries
- **JavaScript**: Uses JavaScript objects and classes

### 4. Module System
- **Python**: Uses imports (`import requests`)
- **JavaScript**: Uses ES6 classes and browser globals

## Example Usage Comparison

### Python (mindat_api_test)
```python
# Get localities with fluorite
params = {
    'geomaterial': 1576,  # Fluorite ID
    'page_size': 100,
    'format': 'json'
}
r = requests.get(MINDAT_API_URL+"/localities/",
                 params=params,
                 headers=headers)
print(r.json())
```

### JavaScript (our implementation)
```javascript
// Get localities with fluorite
const mindatAPI = new MindatAPIIntegration(apiKey);
const localities = await mindatAPI.getFluoriteLocalities();
console.log(localities);
```

## API Response Format

Both Python and JavaScript implementations receive the same JSON response:

```json
{
  "count": 150,
  "next": "https://api.mindat.org/v1/localities/?page=2",
  "previous": null,
  "results": [
    {
      "id": 123,
      "name": "Rogerley Mine, Weardale, England",
      "country": "United Kingdom",
      "state_province": "England",
      "latitude": 54.75,
      "longitude": -2.12,
      "description": "Famous for green fluorite..."
    }
  ]
}
```

## Data Transformation

Our JavaScript implementation transforms Mindat API responses into a format suitable for the Fluorite Specimen Identifier:

```javascript
formatLocality(mindatLoc) {
  return {
    id: `mindat_${mindatLoc.id}`,
    name: mindatLoc.name || 'Unknown Locality',
    country: mindatLoc.country || '',
    region: mindatLoc.state_province || '',
    description: mindatLoc.description || '',
    coordinates: {
      latitude: mindatLoc.latitude,
      longitude: mindatLoc.longitude
    },
    characteristics: {
      colors: this.extractColors(mindatLoc.description),
      habit: this.extractHabit(mindatLoc.description),
      matrix: this.extractMatrix(mindatLoc.description)
    },
    source: 'mindat.org',
    mindatID: mindatLoc.id,
    url: `https://www.mindat.org/loc-${mindatLoc.id}.html`
  };
}
```

## Testing

### Python Testing (from mindat_api_test)
```python
# Test connection
response = requests.get(MINDAT_API_URL+"/items/",
                        params=params,
                        headers=headers)
print(response)  # Expected: <Response [200]>
```

### JavaScript Testing (our implementation)
```javascript
// Test connection
async function testMindatAPI() {
  const result = await state.mindatAPI.testConnection();
  console.log(result);
  // { success: true, authenticated: true, localitiesFound: 100 }
}
```

## Additional Features

Beyond the mindat_api_test examples, our implementation adds:

1. **Color Extraction**: Analyzes descriptions to extract color information
2. **Crystal Habit Detection**: Identifies cubic, octahedral, etc. from text
3. **Matrix Detection**: Finds associated minerals in descriptions
4. **Confidence Scoring**: Adds confidence values for locality matches
5. **UI Integration**: Connects directly to the specimen identifier interface

## References

- **Source Repository**: [jolyonralph/mindat_api_test](https://github.com/jolyonralph/mindat_api_test)
- **Mindat API Docs**: [api.mindat.org/v1/schema/redoc](https://api.mindat.org/v1/schema/redoc/)
- **Our Implementation**: [src/mindat-api-integration.js](../src/mindat-api-integration.js)
- **Integration Guide**: [MINDAT_INTEGRATION_GUIDE.md](../MINDAT_INTEGRATION_GUIDE.md)

## License

The mindat_api_test repository is licensed under the Apache License 2.0. Our implementation respects this license and the Mindat.org API terms of service.

## Acknowledgments

Special thanks to:
- **Jolyon Ralph** for creating the mindat_api_test reference implementation
- **Mindat.org** for providing the comprehensive mineral database API
- **The mineralogy community** for contributing and maintaining the Mindat database

---

**Last Updated**: February 9, 2026  
**Implementation**: barbrickdesign/barbrickdesign.github.io  
**Reference**: jolyonralph/mindat_api_test
