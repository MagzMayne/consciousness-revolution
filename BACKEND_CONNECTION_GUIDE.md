# Backend Connection System Guide

## Overview

The Barbrick Design repository now has a comprehensive backend connection system that automatically integrates all projects with 24+ backend services running on Railway.

## Components

### 1. Backend Connector (`src/utils/backend-connector.js`)

Universal connector class that provides standardized access to all backend services.

**Features:**
- Automatic health checking
- Connection pooling and caching
- Fallback mode for offline operation
- Event-driven architecture
- 8 backend services pre-configured

**Available Services:**
- `bounty-hunter` - Bounty completion automation
- `cleardebt` - Bankruptcy assistance platform
- `email` - Email campaigns and lead management
- `grid-control` - PLC infrastructure management
- `gem-scraper` - Product intelligence
- `riogrande` - Gemstone pricing
- `gge` - Global marketplace
- `kas` - Key/token management

### 2. Backend Status Widget (`src/utils/backend-status-widget.js`)

Visual component showing real-time backend connectivity status.

**Features:**
- Compact and expandable views
- Real-time status updates
- Detailed service information
- Customizable positioning
- Auto-refresh every 60 seconds

### 3. Universal Project Enhancer (`src/utils/universal-project-enhancer.js`)

Automatically adds backend connectivity to any HTML project.

**Features:**
- Auto-detection of project type
- Automatic service selection
- Status indicator injection
- Zero-configuration setup

## Quick Start

### Option 1: Automatic Enhancement (Recommended)

Add this single line before `</body>`:

```html
<script src="src/utils/universal-project-enhancer.js"></script>
```

The enhancer will:
1. Load the backend connector
2. Detect your project type
3. Connect to appropriate services
4. Add status indicator
5. Expose `window.projectAPI` for easy access

### Option 2: Manual Integration

```html
<!-- Load backend connector -->
<script src="src/utils/backend-connector.js"></script>

<script>
    // Use the global instance
    const connector = window.backendConnector;

    // Check a service
    async function checkBackend() {
        const status = await connector.checkHealth('bounty-hunter');
        console.log('Bounty Hunter status:', status);
    }

    // Make API request
    async function getBountyStatus() {
        const result = await connector.request(
            'bounty-hunter',
            '/api/bounty-hunter/status'
        );
        
        if (result.success) {
            console.log('Data:', result.data);
        } else {
            console.error('Error:', result.error);
        }
    }

    // Listen to connection events
    connector.on('connected', (data) => {
        console.log('Service connected:', data.service);
    });

    connector.on('disconnected', (data) => {
        console.warn('Services disconnected:', data.reason);
    });

    connector.on('error', (data) => {
        console.error('Service error:', data.service, data.error);
    });
</script>
```

### Option 3: Use Project API Helper

If using the Universal Enhancer, you get a convenient API helper:

```javascript
// Available after page loads
window.addEventListener('projectEnhanced', (event) => {
    const { projectType, api } = event.detail;
    
    console.log('Project type:', projectType);
    
    // Check if backend is online
    if (api.isOnline()) {
        // Make project-specific API calls
        if (projectType === 'bounty-hunter') {
            api.getBountyStatus().then(result => {
                console.log('Bounty status:', result);
            });
        }
    } else {
        console.warn('Backend offline - using fallback mode');
    }
});

// Or use it directly after page load
window.projectAPI.call('bounty-hunter', '/api/bounty-hunter/logs')
    .then(result => {
        if (result.success) {
            console.log('Logs:', result.data);
        }
    });
```

## API Reference

### BackendConnector Class

#### Methods

##### `checkHealth(serviceName)`
Check health of a specific service.

```javascript
const health = await connector.checkHealth('bounty-hunter');
// Returns: { status: 'ok', healthy: true, service: 'bounty-hunter', timestamp: '...' }
```

##### `checkAllServices()`
Check health of all configured services.

```javascript
const allStatus = await connector.checkAllServices();
// Returns: { 'bounty-hunter': {...}, 'cleardebt': {...}, ... }
```

##### `request(serviceName, endpoint, options)`
Make API request to a service.

```javascript
const result = await connector.request('email', '/send-email', {
    method: 'POST',
    body: {
        to: 'user@example.com',
        subject: 'Test',
        message: 'Hello!'
    }
});
```

##### `getBountyHunterStatus()`
Convenience method for bounty hunter status.

```javascript
const status = await connector.getBountyHunterStatus();
```

##### `searchGems(query)`
Search for gems via gem scraper.

```javascript
const gems = await connector.searchGems('ruby');
```

##### `sendEmail(emailData)`
Send email via email service.

```javascript
const result = await connector.sendEmail({
    to: 'user@example.com',
    subject: 'Hello',
    body: 'World'
});
```

##### `getGridState(apiKey)`
Get grid control infrastructure state.

```javascript
const state = await connector.getGridState('your-api-key');
```

##### `on(event, callback)`
Register event listener.

```javascript
connector.on('connected', (data) => {
    console.log('Connected:', data);
});
```

Events: `connected`, `disconnected`, `error`

##### `isOffline()`
Check if in fallback mode.

```javascript
if (connector.isOffline()) {
    console.log('All services unavailable - using local data');
}
```

##### `getStatus()`
Get cached status for all services.

```javascript
const status = connector.getStatus();
```

### BackendStatusWidget Class

#### Constructor

```javascript
new BackendStatusWidget(container, options)
```

**Parameters:**
- `container` - CSS selector or DOM element
- `options` - Configuration object

**Options:**
```javascript
{
    position: 'bottom-right', // or 'bottom-left', 'top-right', 'top-left'
    compact: true,            // Start in compact mode
    autoHide: false,          // Auto-hide when all services are healthy
    refreshInterval: 60000,   // Refresh every 60 seconds
    showDetails: true         // Show details button
}
```

**Example:**
```html
<div id="status-widget"></div>

<script src="src/utils/backend-connector.js"></script>
<script src="src/utils/backend-status-widget.js"></script>

<script>
    new BackendStatusWidget('#status-widget', {
        position: 'bottom-right',
        compact: true,
        showDetails: true
    });
</script>
```

## Backend Services

### Bounty Hunter API
**Endpoints:**
- `GET /api/bounty-hunter/status` - Agent status
- `GET /api/bounty-hunter/logs` - Completion logs
- `GET /api/bounty-hunter/answers` - Generated answers

### ClearDebt Service
**Endpoints:**
- `POST /api/cleardebt/users/register` - User registration
- `POST /api/cleardebt/users/login` - Login
- `GET /api/cleardebt/users/:id` - Get user
- `POST /api/cleardebt/debts` - Create debt entry
- `GET /api/cleardebt/debts/:userId` - Get debts
- And 15+ more endpoints...

### Email Service
**Endpoints:**
- `POST /send-email` - Send email
- `GET /emails` - List emails
- `POST /leads` - Create lead
- `GET /leads` - List leads
- `GET /stats` - Email statistics

### Grid Control API
**Endpoints:**
- `GET /api/grid/state` - Infrastructure state
- `POST /api/plc/register` - Register PLC device
- `POST /api/modulation/pulse` - Power control
- `POST /api/emergency/shutdown` - Emergency shutdown

### Gem Scraper
**Endpoints:**
- `GET /api/gems/search?q=...` - Search gems
- `POST /api/gems/analyze` - Analyze gem data
- `GET /api/gems/trending` - Get trending gems

### Rio Grande Pricing
**Endpoints:**
- `GET /api/riogrande/pricing/:gemType` - Get gem pricing
- `GET /api/riogrande/trends` - Pricing trends
- `POST /api/riogrande/cache/clear` - Clear cache

## Integration Status

Successfully integrated into **18 projects**:

### Bounty Hunter Projects
- bountyHunter.html
- bounty-hunter-test-report.html

### Financial Projects
- clearDebt.html
- clearDebt-original.html

### Communication Projects
- emailDashboard.html
- email-template-demo.html

### Infrastructure Projects
- aiGridLink.html

### Gem/Trading Projects
- gemAuto.html
- gemLords.html
- gem-show-collection.html
- liveGemPricer.html

### Marketplace Projects
- grand-exchange.html
- ebaySwarm.html

### Trading Projects
- autonomous-trading-hub.html
- microTrader.html
- topstep-hub.html

### Admin Projects
- admin-dashboard.html
- agent-management-dashboard.html

## Testing

### Test Dashboard

Visit `/backend-connection-test.html` to run comprehensive tests on all backend services.

Features:
- Visual test results for each service
- Overall health statistics
- Export test reports
- Run individual or all tests

### Manual Testing

```javascript
// Test single service
const status = await window.backendConnector.checkHealth('bounty-hunter');
console.log('Health:', status);

// Test all services
const allStatus = await window.backendConnector.checkAllServices();
console.log('All services:', allStatus);

// Make test request
const result = await window.backendConnector.request(
    'bounty-hunter',
    '/api/bounty-hunter/status'
);
console.log('Result:', result);
```

## Troubleshooting

### Backend connector not loading

1. Check console for errors
2. Verify script path is correct
3. Ensure Railway services are deployed

### Services showing as offline

1. Check Railway deployment status
2. Verify environment variables are set
3. Check CORS configuration
4. Test endpoints directly in browser

### Connection timeout

1. Increase timeout in request options
2. Check network connectivity
3. Verify Railway service is running

### Fallback mode activated

This is normal when services are unavailable. The system will:
- Use cached data when possible
- Show offline indicators
- Automatically reconnect when services come online

## Environment Configuration

Set these environment variables for custom deployments:

```bash
BOUNTY_HUNTER_API=https://your-bounty-service.railway.app
CLEARDEBT_API=https://your-cleardebt-service.railway.app
EMAIL_API=https://your-email-service.railway.app
GRID_API=https://your-grid-service.railway.app
GEM_API=https://your-gem-service.railway.app
RIOGRANDE_API=https://your-riogrande-service.railway.app
GGE_API=https://your-gge-service.railway.app
KAS_API=https://your-kas-service.railway.app
```

Default: All point to `https://barbrickdesign-production.up.railway.app`

## Best Practices

1. **Always handle offline mode**
   ```javascript
   if (window.projectAPI.isOnline()) {
       // Use backend API
   } else {
       // Use local fallback
   }
   ```

2. **Use event listeners for status changes**
   ```javascript
   connector.on('connected', () => {
       // Update UI to show online status
   });
   
   connector.on('disconnected', () => {
       // Update UI to show offline status
   });
   ```

3. **Cache responses when possible**
   ```javascript
   let cachedData = null;
   
   async function getData() {
       if (cachedData) return cachedData;
       
       const result = await connector.request(...);
       if (result.success) {
           cachedData = result.data;
       }
       return cachedData;
   }
   ```

4. **Provide user feedback**
   ```javascript
   async function fetchData() {
       showLoading();
       
       const result = await connector.request(...);
       
       hideLoading();
       
       if (result.success) {
           showSuccess('Data loaded successfully');
       } else {
           showError('Failed to load data: ' + result.error);
       }
   }
   ```

## Support

For issues, questions, or feature requests:
- Email: BarbrickDesign@gmail.com
- Repository: https://github.com/barbrickdesign/barbrickdesign.github.io
- AI Assistant: Merlin AI

## Version History

### v1.0.0 (2026-02-19)
- Initial release
- 8 backend services integrated
- 18 projects enhanced
- Comprehensive documentation
- Test dashboard included
