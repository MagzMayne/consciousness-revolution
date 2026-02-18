# User Identification and Hub Visit Tracking System

## Overview

This system provides automatic user identification and tracking of developer hub visits, enabling users to easily find and return to their previously visited hubs.

## Features

### 1. **Automatic User Identification**
- Detects users across multiple authentication methods:
  - Wallet authentication (Ethereum, Solana)
  - Google OAuth
  - GitHub authentication
  - Anonymous users (assigned unique ID)
- Persistent user profiles stored in localStorage
- Cross-session recognition

### 2. **Hub Visit Tracking**
- Automatically tracks visits to all developer hubs
- Records:
  - Visit timestamps
  - Visit frequency
  - Visit duration
  - First and last visit dates
- Maintains up to 50 visit records per hub

### 3. **Recent Hubs Widget**
- Beautiful UI component showing recently visited hubs
- Displays:
  - Welcome message with user name
  - Recent hubs (up to 5)
  - Hub recommendations based on visit patterns
  - Visit statistics and exploration rate
- Auto-updates on new visits

### 4. **Smart Recommendations**
- Suggests hubs based on:
  - Previously visited hub categories
  - User interests
  - Unvisited hubs in same categories

### 5. **Visit Statistics**
- Total visits across all hubs
- Unique hubs visited
- Exploration rate (% of hubs visited)
- Per-hub visit counts

## Installation

### On the Main Index Page

Add these scripts before the closing `</body>` tag:

```html
<!-- User Identity and Hub Tracking System -->
<script src="/src/core/user-identity-manager.js"></script>
<script src="/src/core/hub-visit-tracker.js"></script>
<script src="/src/core/recent-hubs-widget.js"></script>
```

Add a container for the widget where you want it to appear:

```html
<!-- Recent Hubs Widget Container -->
<div id="recent-hubs-widget"></div>
```

### On Individual Hub Pages

Simply add the tracking enabler script:

```html
<!-- Hub Tracking System -->
<script src="/src/core/hub-tracking-enabler.js"></script>
```

This will:
- Load the required tracking modules
- Automatically track the visit
- Show a welcome message for returning users

## Components

### 1. User Identity Manager (`src/core/user-identity-manager.js`)

**Purpose**: Central system for user identification across all authentication methods.

**Key Methods**:
```javascript
// Get current user identity
const identity = window.userIdentityManager.getIdentity();

// Get user ID
const userId = window.userIdentityManager.getUserId();

// Check if user is identified
const isIdentified = window.userIdentityManager.isIdentified();

// Get display name
const name = window.userIdentityManager.getDisplayName();

// Listen for identity changes
window.userIdentityManager.onIdentityChange((identity) => {
    console.log('User identity changed:', identity);
});
```

**User Identity Object**:
```javascript
{
    userId: "wallet_0x1234...",  // Unique user ID
    authMethod: "wallet",         // Authentication method
    name: "0x1234...5678",       // Display name
    email: null,                 // Email (if available)
    picture: null,               // Profile picture URL
    verified: true,              // Verification status
    timestamp: 1708261234567,    // First seen timestamp
    lastSeen: 1708261234567      // Last activity timestamp
}
```

### 2. Hub Visit Tracker (`src/core/hub-visit-tracker.js`)

**Purpose**: Tracks visits to developer hubs and provides analytics.

**Key Methods**:
```javascript
// Get recently visited hubs
const recentHubs = window.hubVisitTracker.getRecentHubs(5);

// Get most visited hubs
const mostVisited = window.hubVisitTracker.getMostVisitedHubs(5);

// Get recommendations
const recommended = window.hubVisitTracker.getRecommendations(3);

// Get statistics
const stats = window.hubVisitTracker.getStatistics();

// Get hubs by category
const byCategory = window.hubVisitTracker.getHubsByCategory();

// Manually track a visit
window.hubVisitTracker.trackVisit('devValueHub.html');
```

**Hub Data Object**:
```javascript
{
    hubId: "devValueHub.html",
    name: "Dev Value Hub",
    category: "Development",
    description: "Track GitHub repository valuations",
    icon: "💎",
    visitData: {
        firstVisit: 1708261234567,
        lastVisit: 1708261234567,
        visitCount: 5,
        visits: [
            { timestamp: 1708261234567, duration: 45000 }
        ]
    }
}
```

### 3. Recent Hubs Widget (`src/core/recent-hubs-widget.js`)

**Purpose**: UI component for displaying recent hubs and recommendations.

**Auto-Initialization**: The widget automatically initializes when the DOM is loaded.

**Manual Control**:
```javascript
// Manually render the widget
window.recentHubsWidget.render();

// The widget listens for:
// - User identity changes
// - Hub visit events
// And auto-updates accordingly
```

### 4. Hub Tracking Enabler (`src/core/hub-tracking-enabler.js`)

**Purpose**: Easy integration script for hub pages.

**Features**:
- Loads required dependencies
- Shows welcome toast for returning users
- Automatically tracks the current hub visit

## Hub Registry

The system includes metadata for these hubs:

| Hub | Category | Description |
|-----|----------|-------------|
| devValueHub.html | Development | GitHub repository valuations |
| agentHub.html | AI Agents | MIB Special Agent Portal |
| team-launchpad-hub.html | Collaboration | Team project management |
| topstep-hub.html | Trading | Trading account management |
| devPortal.html | Development | Idea Forge - Submit ideas |
| bloom-hub.html | Growth | Personal & professional growth |
| project-hub.html | Projects | Central project management |
| (and more...) | | |

## Data Storage

All data is stored in the browser's localStorage:

- `barbrick_user_identity` - Current user identity
- `barbrick_anonymous_user` - Anonymous user data
- `hub_visits_{userId}` - Visit data per user
- `barbrick_auth_session` - Wallet authentication session
- `google_auth_user` - Google OAuth user data

## Privacy

- All data is stored locally in the browser
- No data is sent to external servers
- Users can clear all data anytime
- Anonymous users are automatically assigned unique IDs
- No personally identifiable information is stored for anonymous users

## Testing

Open `test-hub-tracking-system.html` in your browser to:

1. Verify module loading
2. Test user identity detection
3. Simulate hub visits
4. Test the widget rendering
5. View statistics and recommendations
6. Export/clear visit data

## Events

The system dispatches these events:

```javascript
// User identity changed
window.addEventListener('userIdentityChanged', (e) => {
    console.log('Identity:', e.detail.identity);
});

// Hub visited
window.addEventListener('hubVisited', (e) => {
    console.log('Hub:', e.detail.hubId);
    console.log('Info:', e.detail.hubInfo);
    console.log('Data:', e.detail.visitData);
});

// Wallet connected
window.addEventListener('walletConnected', (e) => {
    // User identity will be updated automatically
});

// Google auth state changed
window.addEventListener('googleAuthStateChanged', (e) => {
    // User identity will be updated automatically
});

// User signed out
window.addEventListener('userSignedOut', () => {
    // User will be converted to anonymous
});
```

## API Reference

### User Identity Manager

```javascript
// Properties
userIdentityManager.userId          // Current user ID
userIdentityManager.authMethod      // Authentication method
userIdentityManager.userProfile     // Full user profile

// Methods
userIdentityManager.getIdentity()           // Get identity object
userIdentityManager.getUserId()             // Get user ID
userIdentityManager.isIdentified()          // Check if identified
userIdentityManager.isVerified()            // Check if verified
userIdentityManager.getDisplayName()        // Get display name
userIdentityManager.getUserMetadata()       // Get metadata for analytics
userIdentityManager.updateProfile(updates)  // Update profile
userIdentityManager.onIdentityChange(fn)    // Register callback
```

### Hub Visit Tracker

```javascript
// Properties
hubVisitTracker.currentHub          // Current hub being visited
hubVisitTracker.visitData           // All visit data

// Methods
hubVisitTracker.trackVisit(hubId)                    // Track a visit
hubVisitTracker.getRecentHubs(limit)                 // Get recent hubs
hubVisitTracker.getMostVisitedHubs(limit)            // Get most visited
hubVisitTracker.getRecommendations(limit)            // Get recommendations
hubVisitTracker.getHubsByCategory()                  // Get hubs by category
hubVisitTracker.getStatistics()                      // Get statistics
hubVisitTracker.exportVisitData()                    // Export data
hubVisitTracker.clearVisitData()                     // Clear all data
```

## Customization

### Adding New Hubs

Edit the hub registry in `hub-visit-tracker.js`:

```javascript
'your-hub.html': {
    name: 'Your Hub Name',
    category: 'Category',
    description: 'Hub description',
    icon: '🎯'
}
```

### Styling the Widget

The widget includes inline styles that can be customized. Add your own styles to override:

```css
.recent-hubs-widget-container {
    /* Your custom styles */
}
```

## Troubleshooting

### Widget not showing
- Check that the container element exists: `<div id="recent-hubs-widget"></div>`
- Check browser console for JavaScript errors
- Verify scripts are loaded in the correct order

### Visits not being tracked
- Ensure the hub is registered in the hub registry
- Check that hub-tracking-enabler.js is loaded on the page
- Verify localStorage is enabled in the browser

### User identity not detected
- Check that authentication systems are working
- Verify localStorage has the authentication data
- Check browser console for errors

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support

Requires:
- localStorage support
- ES6+ JavaScript support

## Future Enhancements

- [ ] Add hub categories and filtering
- [ ] Implement hub search functionality
- [ ] Add hub favorites/bookmarks
- [ ] Track time spent per hub
- [ ] Add hub visit heatmap
- [ ] Export visit data to CSV
- [ ] Add hub visit streaks
- [ ] Implement achievements system

## License

© 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.

## Contact

- Creator: Ryan Barbrick
- Email: BarbrickDesign@gmail.com
- Repository: https://github.com/barbrickdesign/barbrickdesign.github.io
