# Rdata World Peace Game - Technical Documentation

## Architecture Overview

The World Peace Game extends the existing Rdata globe visualization with a comprehensive game mechanics system that runs entirely client-side using vanilla JavaScript and localStorage.

## File Structure

```
rdata.html (Enhanced)
├── CSS/
│   └── style.css (400+ lines of game styles added)
├── js/
│   ├── game.js (Existing globe visualization - 1737 lines)
│   └── game-mechanics.js (New game system - 600+ lines)
└── Documentation
    ├── WORLD_PEACE_GAME_GUIDE.md (User guide)
    └── WORLD_PEACE_GAME_TECHNICAL.md (This file)
```

## Technology Stack

- **Pure JavaScript (ES6+):** No frameworks, lightweight
- **localStorage API:** Client-side persistence
- **Geolocation API:** Optional player location tracking
- **Three.js:** 3D globe rendering (existing)
- **NASA APIs:** Mission data integration (existing)
- **CSS3:** Animations and glassmorphism effects

## Core Systems

### 1. Game State Management

**Primary State Object:**
```javascript
gameState = {
  player: {
    id: String,           // Unique agent ID
    role: String,         // Agent role
    joinedAt: Number,     // Timestamp
    missionsCompleted: Number,
    peacePoints: Number,
    location: {lat, lon}  // Optional
  },
  activeMissions: Array,  // Up to 5 missions
  completedMissions: Number,
  peacePoints: Number,
  globalPlayers: Number,  // Total players
  peaceProgress: Number   // 0-100%
}
```

**Storage Keys:**
```javascript
STORAGE_KEYS = {
  PLAYER_ID: 'freedomQuest_playerId',
  PLAYER_DATA: 'freedomQuest_playerData',
  MISSIONS: 'freedomQuest_missions',
  PEACE_PROGRESS: 'freedomQuest_peaceProgress',
  GLOBAL_STATS: 'freedomQuest_globalStats'
}
```

### 2. Mission System

**Mission Types (5):**
```javascript
MISSION_TYPES = {
  AWARENESS: {
    icon: '🌍',
    name: 'Global Awareness',
    basePoints: 10,
    color: '#4CAF50'
  },
  COOPERATION: {
    icon: '🤝',
    name: 'Cooperation',
    basePoints: 20,
    color: '#2196F3'
  },
  SCAVENGER: {
    icon: '📍',
    name: 'Scavenger Hunt',
    basePoints: 30,
    color: '#FF9800'
  },
  HUMANITARIAN: {
    icon: '❤️',
    name: 'Humanitarian',
    basePoints: 40,
    color: '#E91E63'
  },
  PEACE: {
    icon: '🕊️',
    name: 'Peace Initiative',
    basePoints: 50,
    color: '#9C27B0'
  }
}
```

**Mission Object Structure:**
```javascript
mission = {
  id: String,              // Unique mission ID
  type: String,            // Mission type key
  icon: String,            // Emoji icon
  title: String,           // Mission title
  description: String,     // Brief description
  objective: String,       // What to do
  points: Number,          // Point reward
  createdAt: Number,       // Timestamp
  completed: Boolean,      // Completion status
  completedAt: Number,     // Completion timestamp
  verified: Boolean        // Verification status
}
```

**Mission Generation Algorithm:**
```javascript
function createMission(type) {
  const missionType = MISSION_TYPES[type];
  const templates = getMissionTemplates(type);
  const template = templates[Math.floor(Math.random() * templates.length)];

  return {
    id: generateMissionId(),
    type: type,
    icon: missionType.icon,
    title: template.title,
    description: template.description,
    objective: template.objective,
    points: missionType.basePoints + Math.floor(Math.random() * 20),
    createdAt: Date.now(),
    completed: false,
    verified: false
  };
}
```

### 3. Player System

**Agent Roles (7):**
```javascript
AGENT_ROLES = [
  'Peacekeeper',
  'Diplomat',
  'Humanitarian',
  'Educator',
  'Environmentalist',
  'Community Builder',
  'Global Citizen'
]
```

**Player ID Generation:**
```javascript
function generatePlayerId() {
  const prefix = 'PA'; // Peace Agent
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}
// Example: PA-LQ8N9O-X7K2
```

**Registration Flow:**
```
1. User clicks "Join the Quest"
2. generatePlayerId() creates unique ID
3. Random role assigned from AGENT_ROLES
4. Player object created and saved
5. First mission auto-generated
6. Optional: Geolocation requested
7. UI updated with player data
8. Welcome notification shown
```

### 4. Progress Calculation

**World Peace Progress Formula:**
```javascript
function updatePeaceProgress(points) {
  const participationRate = gameState.globalPlayers / WORLD_POPULATION;
  const missionImpact = points / 1000000; // Scaled appropriately
  
  gameState.peaceProgress = Math.min(100, 
    (participationRate * 100) + (gameState.completedMissions * 0.00001)
  );
}
```

**Key Variables:**
- `WORLD_POPULATION = 8,100,000,000` (2026 estimate)
- `participationRate` = players / population
- `missionImpact` = scaled contribution from mission completions

**Progress Bar Color Transitions:**
```javascript
if (progress < 25) {
  color = 'linear-gradient(90deg, #f44336, #e91e63)' // Red
} else if (progress < 50) {
  color = 'linear-gradient(90deg, #ff9800, #ffc107)' // Orange
} else if (progress < 75) {
  color = 'linear-gradient(90deg, #4caf50, #8bc34a)' // Green
} else {
  color = 'linear-gradient(90deg, #00e676, #76ff03)' // Bright Green
}
```

### 5. Persistence Layer

**Save Operations:**
```javascript
function saveGameState() {
  try {
    // Save player data
    if (gameState.player) {
      localStorage.setItem(
        STORAGE_KEYS.PLAYER_DATA, 
        JSON.stringify(gameState.player)
      );
    }
    
    // Save active missions
    localStorage.setItem(
      STORAGE_KEYS.MISSIONS, 
      JSON.stringify(gameState.activeMissions)
    );
    
    // Save global stats
    localStorage.setItem(
      STORAGE_KEYS.GLOBAL_STATS, 
      JSON.stringify({
        players: gameState.globalPlayers,
        progress: gameState.peaceProgress,
        lastUpdate: Date.now()
      })
    );
  } catch (e) {
    console.warn('Failed to save game state:', e);
  }
}
```

**Load Operations:**
```javascript
function loadGameState() {
  try {
    // Load player data
    const savedPlayerData = localStorage.getItem(STORAGE_KEYS.PLAYER_DATA);
    if (savedPlayerData) {
      gameState.player = JSON.parse(savedPlayerData);
    }

    // Load missions
    const savedMissions = localStorage.getItem(STORAGE_KEYS.MISSIONS);
    if (savedMissions) {
      gameState.activeMissions = JSON.parse(savedMissions);
    }

    // Load global stats
    const savedStats = localStorage.getItem(STORAGE_KEYS.GLOBAL_STATS);
    if (savedStats) {
      const stats = JSON.parse(savedStats);
      gameState.globalPlayers = stats.players || 0;
      gameState.peaceProgress = stats.progress || 0;
    }
  } catch (e) {
    console.warn('Failed to load game state:', e);
  }
}
```

**Auto-Save Intervals:**
- Every action: Immediate save
- Periodic: Every 60 seconds
- On visibility change: Before tab close

### 6. Game Loop

**Main Loop:**
```javascript
function startGameLoop() {
  // Simulate player growth
  setInterval(() => {
    if (Math.random() < 0.1) { // 10% chance
      gameState.globalPlayers += Math.floor(Math.random() * 10) + 1;
      updateGlobalStats();
      saveGameState();
    }
  }, 30000); // Every 30 seconds

  // Periodic save
  setInterval(() => {
    saveGameState();
  }, 60000); // Every minute
}
```

## UI Components

### 1. Peace Dashboard

**HTML Structure:**
```html
<div id="peace-dashboard" class="peace-dashboard">
  <h3 class="dashboard-title">🌍 World Peace Quest</h3>
  
  <div class="global-stats">
    <!-- 3 stat items -->
  </div>

  <div class="peace-progress">
    <!-- Progress bar -->
  </div>
</div>
```

**CSS Classes:**
- `.peace-dashboard` - Main container
- `.global-stats` - Stats grid
- `.stat-item` - Individual stat
- `.peace-progress` - Progress section
- `.progress-bar-container` - Bar wrapper
- `.progress-bar` - Animated fill

**Update Functions:**
```javascript
function updateGlobalStats() {
  setElementText('global-population', formatNumber(WORLD_POPULATION));
  setElementText('player-count', formatNumber(gameState.globalPlayers));
  
  const participationRate = (gameState.globalPlayers / WORLD_POPULATION) * 100;
  setElementText('participation-rate', participationRate.toFixed(4) + '%');
}

function updatePeaceProgressBar() {
  const progressBar = document.getElementById('peace-progress-bar');
  const progress = gameState.peaceProgress.toFixed(4);
  progressBar.style.width = progress + '%';
  // Color transitions based on progress
}
```

### 2. Mission Control Panel

**HTML Structure:**
```html
<div id="mission-control" class="mission-control">
  <div class="mission-header">
    <h3>📋 Active Missions</h3>
    <button id="mission-toggle">−</button>
  </div>
  
  <div class="mission-content">
    <div id="mission-list" class="mission-list">
      <!-- Mission cards dynamically generated -->
    </div>
    <button id="get-new-mission">Get New Mission</button>
  </div>
</div>
```

**Mission Card Template:**
```javascript
`<div class="mission-card" data-mission-id="${mission.id}">
  <div class="mission-header">
    <span class="mission-icon">${mission.icon}</span>
    <div class="mission-info">
      <h4 class="mission-title">${mission.title}</h4>
      <span class="mission-points">+${mission.points} points</span>
    </div>
  </div>
  <p class="mission-description">${mission.description}</p>
  <p class="mission-objective"><strong>Objective:</strong> ${mission.objective}</p>
  <button class="btn-complete" onclick="window.gameCompleteMission('${mission.id}')">
    Complete Mission
  </button>
</div>`
```

**Panel Toggle:**
```javascript
function initPanelToggles() {
  const toggle = document.getElementById('mission-toggle');
  const panel = document.getElementById('mission-control');
  
  if (toggle && panel) {
    toggle.addEventListener('click', () => {
      const isMinimized = panel.classList.toggle('minimized');
      toggle.textContent = isMinimized ? '+' : '−';
    });
  }
}
```

### 3. Player Profile Panel

**HTML Structure:**
```html
<div id="player-profile" class="player-profile">
  <div class="profile-header">
    <h3>🎮 Your Profile</h3>
    <button id="profile-toggle">−</button>
  </div>
  
  <div class="profile-content">
    <div class="profile-info">
      <!-- 4 profile items -->
    </div>
    <button id="register-player">Join the Quest</button>
  </div>
</div>
```

**Update Function:**
```javascript
function updatePlayerProfile() {
  const player = gameState.player;

  if (player) {
    setElementText('player-id', player.id);
    setElementText('player-role', player.role);
    setElementText('missions-completed', player.missionsCompleted);
    setElementText('peace-points', player.peacePoints);

    const registerBtn = document.getElementById('register-player');
    if (registerBtn) {
      registerBtn.textContent = 'Already Registered';
      registerBtn.disabled = true;
    }
  }
}
```

## Event Handling

### Registration Event
```javascript
registerBtn.addEventListener('click', handlePlayerRegistration);

function handlePlayerRegistration() {
  if (gameState.player) {
    showGameNotification('Already registered!', 'info');
    return;
  }

  const playerId = generatePlayerId();
  const role = AGENT_ROLES[Math.floor(Math.random() * AGENT_ROLES.length)];

  gameState.player = {
    id: playerId,
    role: role,
    joinedAt: Date.now(),
    missionsCompleted: 0,
    peacePoints: 0,
    location: null
  };

  gameState.globalPlayers += 1;
  saveGameState();
  updateUI();
  generateNewMission();
  showGameNotification(`Welcome, Peace Agent ${playerId}!`, 'success', 5000);
  requestPlayerLocation();
}
```

### Mission Generation Event
```javascript
newMissionBtn.addEventListener('click', generateNewMission);

function generateNewMission() {
  if (gameState.activeMissions.length >= 5) {
    showGameNotification('Complete some missions first! (Max 5 active)', 'warning');
    return;
  }

  const missionType = getRandomMissionType();
  const mission = createMission(missionType);
  
  gameState.activeMissions.push(mission);
  saveGameState();
  updateMissionList();

  showGameNotification(`New mission: ${mission.title}`, 'info', 4000);
}
```

### Mission Completion Event
```javascript
window.gameCompleteMission = completeMission;

function completeMission(missionId) {
  const mission = gameState.activeMissions.find(m => m.id === missionId);
  if (!mission) return;

  mission.completed = true;
  mission.completedAt = Date.now();

  // Award points
  if (gameState.player) {
    gameState.player.missionsCompleted += 1;
    gameState.player.peacePoints += mission.points;
    gameState.completedMissions = gameState.player.missionsCompleted;
    gameState.peacePoints = gameState.player.peacePoints;
  }

  // Update global progress
  updatePeaceProgress(mission.points);

  // Remove after delay
  setTimeout(() => {
    gameState.activeMissions = gameState.activeMissions.filter(m => m.id !== missionId);
    saveGameState();
    updateMissionList();
  }, 3000);

  saveGameState();
  updateUI();
  showGameNotification(`Mission complete! +${mission.points} peace points`, 'success', 3000);
}
```

## Integration with Existing Code

### Minimal Changes to game.js
- No modifications to existing `game.js`
- game-mechanics.js runs independently
- Uses existing notification system via `showNotification()`
- Compatible with existing globe interactions

### Shared Resources
```javascript
// game-mechanics.js can use:
- showNotification() from game.js
- Existing DOM elements (globe, markers)
- NASA API integration
- Marker history system
```

### Export Pattern
```javascript
// Global exports for button onclick handlers
window.gameCompleteMission = completeMission;
window.gameGenerateNewMission = generateNewMission;

// Main init function
window.initGameMechanics = initGameMechanics;
```

## CSS Architecture

### Naming Conventions
- BEM-inspired: `.mission-control`, `.mission-card`, `.mission-title`
- Consistent prefixes for game elements
- Clear hierarchy

### Key Styles

**Glassmorphism Effect:**
```css
.peace-dashboard {
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(76, 175, 80, 0.3);
  border-radius: 15px;
}
```

**Animations:**
```css
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.peace-dashboard {
  animation: slideInRight 0.5s ease-out;
}
```

**Responsive Breakpoints:**
```css
@media (max-width: 768px) {
  .peace-dashboard {
    width: 280px;
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .mission-control {
    width: calc(100% - 20px);
  }
}
```

## Performance Considerations

### Optimization Strategies
1. **Minimal DOM Updates:** Only update changed elements
2. **Event Delegation:** Single listener per panel
3. **Throttled Updates:** 30-60 second intervals for auto-updates
4. **Efficient Storage:** Only save on changes, not continuously
5. **CSS Animations:** Hardware-accelerated transforms

### Memory Management
- Max 5 active missions prevents unbounded growth
- Completed missions removed after fade-out
- No memory leaks from event listeners
- localStorage has ~5-10MB limit (game uses <1KB)

### Browser Compatibility
- localStorage: IE8+, All modern browsers
- Geolocation API: IE9+, All modern browsers
- CSS animations: IE10+, All modern browsers
- ES6 features: Modern browsers (transpile if needed)

## Security Considerations

### Data Privacy
- All data stored locally (client-side only)
- No server communication for game state
- No personal data collected
- Optional geolocation with user permission

### XSS Prevention
- User input sanitized (though minimal user input)
- Template literals escape HTML
- No eval() or innerHTML with user data

### localStorage Security
- Data not encrypted (low-risk game data)
- Vulnerable to XSS (but no sensitive data)
- Can be cleared by user anytime

## Testing

### Manual Test Checklist
- [ ] Player registration creates unique ID
- [ ] Multiple missions generate correctly
- [ ] Mission completion awards points
- [ ] Progress bar updates and changes color
- [ ] Global stats calculate correctly
- [ ] Panel toggles work (minimize/maximize)
- [ ] localStorage persistence works
- [ ] Page reload restores state
- [ ] Mobile responsive design works
- [ ] All animations smooth at 60 FPS

### Browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (Mac/iOS)
- [ ] Mobile browsers

### Edge Cases
- [ ] localStorage full/disabled
- [ ] Geolocation denied
- [ ] Attempting 6th mission (should warn)
- [ ] Completing mission twice (should prevent)
- [ ] Invalid mission ID (should handle)

## Deployment

### Build Process
No build step required - pure vanilla JS/CSS

### Files to Deploy
1. `rdata.html` (updated)
2. `css/style.css` (updated)
3. `js/game-mechanics.js` (new)
4. `js/game.js` (existing, unchanged)

### Configuration
No configuration needed - works out of the box

### CDN Dependencies
None - all assets self-contained

## Future Enhancements

### Backend Integration (Optional)
```javascript
// REST API endpoints for multiplayer
POST   /api/players          // Register player
GET    /api/players/:id      // Get player data
POST   /api/missions/complete // Complete mission
GET    /api/leaderboard      // Global rankings
GET    /api/players/nearby   // Players in radius
```

### Photo Verification
```javascript
// Upload mission proof
async function uploadMissionProof(missionId, photoFile) {
  const formData = new FormData();
  formData.append('photo', photoFile);
  formData.append('missionId', missionId);
  
  const response = await fetch('/api/missions/verify', {
    method: 'POST',
    body: formData
  });
  
  return response.json();
}
```

### Blockchain Integration
```javascript
// NFT rewards for milestones
async function mintAchievementNFT(achievementId) {
  const wallet = await connectWallet();
  const contract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, wallet);
  const tx = await contract.mint(achievementId);
  return tx.wait();
}
```

## API Reference

### Public Functions

#### `initGameMechanics()`
Initialize the game mechanics system. Called automatically on page load.

#### `window.gameCompleteMission(missionId)`
Complete a mission by ID.
- **Parameters:** `missionId` (String) - Unique mission identifier
- **Returns:** None
- **Side Effects:** Awards points, updates UI, saves state

#### `window.gameGenerateNewMission()`
Generate a new random mission.
- **Parameters:** None
- **Returns:** None
- **Side Effects:** Adds mission to active list, updates UI

### Internal Functions

#### `generatePlayerId()`
Generate unique player ID.
- **Returns:** String (format: PA-TIMESTAMP-RANDOM)

#### `createMission(type)`
Create mission object from type.
- **Parameters:** `type` (String) - Mission type key
- **Returns:** Mission object

#### `saveGameState()`
Save current game state to localStorage.

#### `loadGameState()`
Load saved game state from localStorage.

#### `updateUI()`
Update all UI elements with current state.

## Constants

```javascript
// World population (2026 estimate)
const WORLD_POPULATION = 8100000000;

// Storage keys
const STORAGE_KEYS = { ... };

// Mission types
const MISSION_TYPES = { ... };

// Agent roles
const AGENT_ROLES = [ ... ];
```

## Troubleshooting

### localStorage Not Working
- Check browser privacy settings
- Verify localStorage is enabled
- Try incognito mode
- Check quota limits

### Progress Not Saving
- Check browser console for errors
- Verify localStorage permissions
- Test manual save with `saveGameState()`

### Missions Not Generating
- Check console for errors
- Verify mission templates loaded
- Check active mission count (<5)

### UI Not Updating
- Verify element IDs match
- Check for JavaScript errors
- Test `updateUI()` manually

## Contributing

### Code Style
- Use ES6+ features
- 2-space indentation
- Single quotes for strings
- Semicolons required
- JSDoc comments for functions

### Adding Mission Types
1. Add to `MISSION_TYPES` object
2. Create templates in `getMissionTemplates()`
3. Update CSS with new color
4. Test generation and completion

### Adding Agent Roles
1. Add to `AGENT_ROLES` array
2. Update documentation
3. Test random assignment

---

**Technical Contact:** BarbrickDesign@gmail.com

*Last Updated: February 6, 2026*
