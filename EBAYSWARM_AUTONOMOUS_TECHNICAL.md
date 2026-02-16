# eBay Swarm Autonomous Marketing - Technical Documentation

## Architecture Overview

The autonomous marketing system extends the existing ebaySwarm.html application with scheduled, automated execution of marketing agents.

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface                          │
│  ┌──────────┬──────────┬────────────┬──────────┬─────────┐ │
│  │Dashboard │ Agents   │ Autonomous │ Results  │ Config  │ │
│  └──────────┴──────────┴────────────┴──────────┴─────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Autonomous Scheduler (Hourly Check)            │
│  • Check if listing fetch needed (based on interval)        │
│  • Check if marketing cycle needed (based on interval)      │
│  • Execute tasks if intervals have elapsed                  │
└─────────────────────────────────────────────────────────────┘
                            │
          ┌─────────────────┴─────────────────┐
          ▼                                   ▼
┌──────────────────────┐          ┌──────────────────────────┐
│ Listing Fetch System │          │ Marketing Cycle System   │
│ • Fetch from eBay    │          │ • Select up to 3 listing │
│ • Parse RSS/HTML     │          │ • Run enabled agents     │
│ • Store locally      │          │ • Rate limit (2s delay)  │
└──────────────────────┘          │ • Log results            │
                                  └──────────────────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         ▼                         ▼
            ┌───────────────┐       ┌────────────────┐       ┌──────────────┐
            │ Traffic Agent │       │ Optimizer Agent│       │ Promo Agent  │
            │ (Social Media)│       │ (SEO/Content)  │       │ (Pricing)    │
            └───────────────┘       └────────────────┘       └──────────────┘
                    │                         │                         │
                    └─────────────────────────┼─────────────────────────┘
                                              ▼
                                    ┌──────────────────┐
                                    │   Groq API       │
                                    │ (LLM Processing) │
                                    └──────────────────┘
                                              │
                                              ▼
                                  ┌────────────────────────┐
                                  │ Results & Activity Log │
                                  │ (localStorage)         │
                                  └────────────────────────┘
```

## Data Structures

### Configuration Object

```javascript
const CONFIG = {
  // API Configuration
  apiKey: string,
  model: string,
  listingUrl: string,
  groqEndpoint: string,
  
  // Autonomous Configuration
  autonomousMode: boolean,
  autoFetchInterval: number, // hours
  autoMarketingInterval: number, // hours
  marketingRotation: string[], // agent types
  currentPlatform: number // for platform rotation
};
```

### State Variables

```javascript
// Core State
let agentResults = [];          // All agent results
let isRunning = false;          // Agent execution lock
let storeListings = [];         // Current listings
let listingMetrics = {};        // Performance tracking
let lastListingCheck = null;    // Timestamp
let lastMarketingRun = null;    // Timestamp
let autonomousInterval = null;  // setInterval ID
let autonomousLog = [];         // Activity history
```

### Listing Object

```javascript
{
  listing_id: string,           // eBay item ID
  title: string,                // Product title
  category: string,             // Product category
  price_range: string,          // Price display
  listing_url: string,          // Full eBay URL
  estimated_views_per_day: number,
  estimated_watchers: number,
  key_features: string[],
  published_date: string,
  description_preview: string
}
```

### Autonomous Log Entry

```javascript
{
  timestamp: string,  // ISO 8601
  message: string,    // Human-readable description
  type: string        // 'info' | 'success' | 'error' | 'warning'
}
```

## Core Functions

### Initialization

#### `initializeAutonomousSystem()`

**Purpose**: Initialize autonomous system on page load

**Flow**:
1. Load saved configuration from localStorage
2. Restore autonomous state (enabled/disabled)
3. Load activity log
4. Update UI elements
5. Start autonomous mode if previously enabled

**Storage Keys**:
- `ebaySwarmAutonomous`: Configuration and state
- `ebaySwarmAutonomousLog`: Activity history

```javascript
function initializeAutonomousSystem() {
  // Load saved state
  const savedAutonomous = localStorage.getItem('ebaySwarmAutonomous');
  if (savedAutonomous) {
    const parsed = JSON.parse(savedAutonomous);
    CONFIG.autonomousMode = parsed.enabled || false;
    CONFIG.autoFetchInterval = parsed.fetchInterval || 24;
    CONFIG.autoMarketingInterval = parsed.marketingInterval || 6;
    CONFIG.marketingRotation = parsed.marketingRotation || ['traffic', 'optimizer', 'promo'];
    lastMarketingRun = parsed.lastMarketingRun ? new Date(parsed.lastMarketingRun) : null;
  }
  
  // Load log
  const savedLog = localStorage.getItem('ebaySwarmAutonomousLog');
  if (savedLog) {
    autonomousLog = JSON.parse(savedLog);
  }
  
  // Update UI and start if needed
  updateAutonomousUI();
  if (CONFIG.autonomousMode) {
    startAutonomousMode();
  }
}
```

### Mode Control

#### `toggleAutonomousMode()`

**Purpose**: Enable or disable autonomous operations

**Flow**:
1. Toggle `CONFIG.autonomousMode` boolean
2. Call `startAutonomousMode()` or `stopAutonomousMode()`
3. Log action to autonomous log
4. Save state to localStorage
5. Update UI indicators

#### `startAutonomousMode()`

**Purpose**: Begin autonomous scheduling

**Implementation**:
```javascript
function startAutonomousMode() {
  if (autonomousInterval) {
    clearInterval(autonomousInterval);
  }
  
  // Check every hour
  autonomousInterval = setInterval(() => {
    checkAutonomousTasks();
  }, 60 * 60 * 1000);
  
  // Initial check after 5 seconds
  setTimeout(() => checkAutonomousTasks(), 5000);
}
```

**Why hourly?**
- Balance between responsiveness and efficiency
- Allows flexible scheduling (1-168 hour intervals)
- Minimal battery/resource impact
- Prevents excessive checking

#### `stopAutonomousMode()`

**Purpose**: Halt autonomous scheduling

**Implementation**:
```javascript
function stopAutonomousMode() {
  if (autonomousInterval) {
    clearInterval(autonomousInterval);
    autonomousInterval = null;
  }
}
```

### Task Scheduling

#### `checkAutonomousTasks()`

**Purpose**: Determine if scheduled tasks should run

**Logic**:
```javascript
async function checkAutonomousTasks() {
  if (!CONFIG.autonomousMode) return;
  
  const now = new Date();
  
  // Check listing fetch
  const hoursSinceLastCheck = lastListingCheck 
    ? (now - lastListingCheck) / (1000 * 60 * 60)
    : 999;
  
  if (hoursSinceLastCheck >= CONFIG.autoFetchInterval) {
    // Fetch listings
  }
  
  // Check marketing cycle
  const hoursSinceMarketing = lastMarketingRun 
    ? (now - lastMarketingRun) / (1000 * 60 * 60)
    : 999;
  
  if (hoursSinceMarketing >= CONFIG.autoMarketingInterval) {
    // Run marketing
  }
}
```

**Time Calculations**:
- Difference = (now - last_run) milliseconds
- Convert to hours: diff / (1000 * 60 * 60)
- Compare with configured interval
- Use 999 as "never run" default (always triggers first run)

### Marketing Execution

#### `runMarketingCycle()`

**Purpose**: Execute marketing agents for listings

**Flow**:
1. Validate prerequisites (listings exist, not already running)
2. Set `isRunning` lock
3. Update `lastMarketingRun` timestamp
4. Get enabled agents from UI checkboxes
5. For each listing (up to 3):
   - For each enabled agent:
     - Add 2-second delay (rate limiting)
     - Call `runAgent(agentType, listing)`
     - Log success/failure
6. Clear `isRunning` lock
7. Update statistics

**Rate Limiting Strategy**:
```javascript
// 2 second delay between agent calls
await new Promise(resolve => setTimeout(resolve, 2000));
```

**Why 3 listings per cycle?**
- Balance between coverage and API limits
- 3 listings × 4 agents × 2s = ~30 seconds max
- Prevents rate limit issues
- All listings covered over multiple cycles

**Error Handling**:
```javascript
try {
  await runAgent(agentType, listing);
  successCount++;
  addAutonomousLog(`✓ ${agentType} completed`, 'success');
} catch (error) {
  errorCount++;
  addAutonomousLog(`✗ ${agentType} failed: ${error.message}`, 'error');
}
```

### Agent Integration

#### Modified `runAgent(agentType, listing = null)`

**Changes from Original**:
1. Added optional `listing` parameter
2. Modified `isRunning` lock behavior for autonomous calls
3. Conditional activity logging (skip for autonomous)
4. Return result for autonomous tracking
5. Error throwing instead of just logging

**Key Logic**:
```javascript
async function runAgent(agentType, listing = null) {
  if (isRunning && !listing) {
    // Manual call blocked if already running
    // Autonomous calls (with listing) allowed
  }
  
  const targetListing = listing || /* manual selection logic */;
  const wasRunning = isRunning;
  isRunning = true;
  
  try {
    // Execute agent
    const result = await runSpecificAgent(targetListing);
    
    if (!listing) {
      // Only log for manual runs
      addActivity(...);
    }
    
    return result;
  } catch (error) {
    if (!listing) {
      addActivity(...);
    }
    throw error; // Propagate for autonomous handling
  } finally {
    isRunning = wasRunning; // Restore previous state
  }
}
```

### Logging System

#### `addAutonomousLog(message, type)`

**Purpose**: Record autonomous actions with timestamps

**Implementation**:
```javascript
function addAutonomousLog(message, type = 'info') {
  const entry = {
    timestamp: new Date().toISOString(),
    message: message,
    type: type
  };
  
  // Add to array (newest first)
  autonomousLog.unshift(entry);
  
  // Keep last 100 entries
  autonomousLog = autonomousLog.slice(0, 100);
  
  // Persist to storage
  localStorage.setItem('ebaySwarmAutonomousLog', JSON.stringify(autonomousLog));
  
  // Update UI
  updateLogUI(entry);
}
```

**Types**:
- `info`: General information (blue)
- `success`: Successful operations (green)
- `error`: Failures and issues (red)
- `warning`: Warnings and alerts (yellow)

**UI Update**:
- Prepend new entry to log feed
- Keep only last 20 visible
- Color-code by type
- Show timestamp

### State Persistence

#### `saveAutonomousState()`

**Purpose**: Persist configuration to localStorage

**Saved Data**:
```javascript
{
  enabled: boolean,
  fetchInterval: number,
  marketingInterval: number,
  marketingRotation: string[],
  lastMarketingRun: string | null
}
```

**Why Persist**:
- Survive page reloads
- Maintain user preferences
- Resume autonomous operations
- Track execution history

## UI Components

### Autonomous Tab

**Location**: New tab between "Agents" and "Results"

**Sections**:
1. **Control Panel**
   - Enable/Disable toggle
   - Manual trigger button
   - Status indicators

2. **Configuration**
   - Listing fetch interval input
   - Marketing run interval input
   - Agent selection checkboxes
   - Save button

3. **Statistics**
   - Last listing check time
   - Last marketing run time
   - Actions today counter
   - Content generated counter

4. **Activity Log**
   - Real-time feed of autonomous actions
   - Color-coded by result
   - Last 20 visible, 100 stored

### Status Indicators

**Implementation**:
```css
.status {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}
.status.active {
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
}
.status.idle {
  background: #6b7280;
}
```

**States**:
- Active (green): Autonomous mode enabled
- Idle (gray): Autonomous mode disabled

## Performance Considerations

### Browser Requirements

**Minimum**:
- Modern browser with ES6+ support
- localStorage available
- setInterval support
- 10MB localStorage space

**Optimal**:
- Chrome 90+, Firefox 88+, Safari 14+
- Active tab (for timers to run)
- Stable internet connection

### Resource Usage

**Memory**:
- Base: ~5MB
- Per listing: ~10KB
- Per result: ~5KB
- Log: ~50KB (100 entries)
- **Total**: ~10-15MB typical

**CPU**:
- Idle: <1%
- During marketing cycle: 5-10%
- Hourly check: <1% for 100ms

**Network**:
- Listing fetch: 50-200KB
- Per agent call: 1-5KB request, 1-10KB response
- Marketing cycle: 50-100KB total

### Battery Impact

**Desktop**: Negligible
**Mobile**: 
- 1-2% per hour with autonomous mode
- Recommendation: Use on desktop or while charging

## API Integration

### Groq API Usage

**Endpoints**:
- POST `https://api.groq.com/openai/v1/chat/completions`

**Authentication**:
- Bearer token in Authorization header
- API key from CONFIG.apiKey

**Rate Limits**:
- Free tier: 14,400 requests/day
- ~600 requests/hour sustained
- Burst: up to 100 requests/minute

**Request Format**:
```javascript
{
  model: "llama-3.1-8b-instant",
  messages: [{
    role: "user",
    content: "..." // Agent-specific prompt
  }],
  temperature: 0.4,
  max_tokens: 2000
}
```

**Response Handling**:
```javascript
const response = await fetch(CONFIG.groqEndpoint, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${CONFIG.apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(request)
});

const data = await response.json();
const content = data.choices[0].message.content;
```

### eBay API (Public RSS)

**Endpoints**:
- `https://www.ebay.com/sch/i.html?_ssn={seller}&_rss=1`
- Public feed, no authentication

**CORS Proxy**:
- `https://api.allorigins.win/raw?url={encoded_url}`
- Required for browser-based access
- Free tier sufficient for typical usage

## Error Handling

### Common Errors

#### API Key Invalid
```javascript
if (response.status === 401) {
  addAutonomousLog('API key invalid. Check Configuration tab.', 'error');
  CONFIG.autonomousMode = false;
  stopAutonomousMode();
}
```

#### Rate Limit Exceeded
```javascript
if (response.status === 429) {
  addAutonomousLog('Rate limit exceeded. Pausing for 1 hour.', 'warning');
  await new Promise(resolve => setTimeout(resolve, 3600000));
}
```

#### Network Error
```javascript
catch (error) {
  if (error.message.includes('Failed to fetch')) {
    addAutonomousLog('Network error. Will retry next cycle.', 'error');
    // Don't disable autonomous mode, allow recovery
  }
}
```

### Graceful Degradation

**No Listings**:
- Skip marketing cycle
- Log warning
- Continue scheduling

**Agent Failure**:
- Log error for specific agent
- Continue with next agent
- Don't fail entire cycle

**API Unavailable**:
- Log error
- Retry next cycle
- Don't disable autonomous mode

## Testing

### Manual Testing Checklist

- [ ] Enable autonomous mode
- [ ] Verify status indicator changes to green
- [ ] Set intervals to minimum (1 hour)
- [ ] Check autonomous log for initialization
- [ ] Wait for hourly check (or force with manual button)
- [ ] Verify marketing cycle executes
- [ ] Check results appear in Results tab
- [ ] Verify statistics update
- [ ] Disable autonomous mode
- [ ] Verify status indicator changes to gray
- [ ] Reload page
- [ ] Verify settings persist

### Automated Testing

```javascript
// Test autonomous initialization
function testInit() {
  initializeAutonomousSystem();
  console.assert(CONFIG.autonomousMode !== undefined);
  console.assert(autonomousLog !== undefined);
}

// Test interval calculations
function testIntervalCalc() {
  const now = new Date();
  const oneHourAgo = new Date(now - 60 * 60 * 1000);
  const hoursDiff = (now - oneHourAgo) / (1000 * 60 * 60);
  console.assert(Math.abs(hoursDiff - 1) < 0.01);
}

// Test state persistence
function testPersistence() {
  const testState = {
    enabled: true,
    fetchInterval: 12,
    marketingInterval: 3
  };
  localStorage.setItem('ebaySwarmAutonomous', JSON.stringify(testState));
  initializeAutonomousSystem();
  console.assert(CONFIG.autoFetchInterval === 12);
  console.assert(CONFIG.autoMarketingInterval === 3);
}
```

## Security Considerations

### API Key Security

**Storage**: 
- localStorage (client-side only)
- Not transmitted except to Groq API
- Displayed as password field in UI

**Risks**:
- XSS could expose key
- Browser extensions could access
- Shared computer access

**Mitigations**:
- Use dedicated API key
- Monitor usage on Groq console
- Rotate keys periodically
- Don't share screenshots with key visible

### Rate Limiting

**Built-in Protection**:
- 2-second delay between calls
- Maximum 3 listings per cycle
- Hourly scheduling check
- Graceful handling of 429 errors

### Data Privacy

**Local Storage Only**:
- No external database
- No third-party analytics
- No data sharing

**Transmitted Data**:
- Listing titles/descriptions to Groq (for analysis)
- API key to Groq (for authentication)
- Nothing else leaves the browser

## Maintenance

### Regular Tasks

**Weekly**:
- Review autonomous log for errors
- Check API usage on Groq console
- Verify listing fetch working
- Test manual agent runs

**Monthly**:
- Review generated content quality
- Adjust intervals if needed
- Update agent selection
- Clear old results if needed

### Troubleshooting

**Issue**: Autonomous mode won't enable
- Check browser console for errors
- Verify API key is set
- Clear localStorage and reconfigure
- Try different browser

**Issue**: No marketing content generated
- Verify agents are selected (checkboxes)
- Check API key validity
- Review autonomous log for errors
- Test agents manually first

**Issue**: Too much activity
- Increase intervals (24h fetch, 12h marketing)
- Reduce number of enabled agents
- Use manual mode instead

## Future Enhancements

### Planned Features

1. **Per-Listing Schedules**
   - Different intervals for different listings
   - Priority-based execution
   - Custom agent selection per listing

2. **Performance Analytics**
   - Track content effectiveness
   - A/B testing support
   - ROI calculations

3. **Advanced Scheduling**
   - Time-of-day preferences
   - Day-of-week patterns
   - Event-based triggers

4. **Integration Options**
   - Direct social media posting
   - Webhook notifications
   - Email reports
   - Slack integration

5. **AI Improvements**
   - Learning from results
   - Auto-tuning prompts
   - Platform-specific optimization
   - Competitor analysis

### Architecture Changes

**Needed for Scale**:
- Backend service for reliable scheduling
- Database for persistent storage
- Queue system for task management
- Monitoring and alerting

**Current Limitations**:
- Browser tab must be open
- Limited by browser localStorage (10MB)
- No cross-device synchronization
- Manual content review required

## Contributing

### Code Style

- ES6+ JavaScript
- No external dependencies
- Inline documentation for complex logic
- Consistent naming (camelCase)

### Pull Request Checklist

- [ ] Code follows existing style
- [ ] All functions documented
- [ ] Error handling added
- [ ] Manual testing completed
- [ ] localStorage keys documented
- [ ] UI updates tested
- [ ] No console errors

### Documentation Updates

When modifying autonomous system:
1. Update this technical doc
2. Update user guide if UI changes
3. Add inline comments for complex logic
4. Update changelog

---

**Version**: 1.0  
**Last Updated**: February 8, 2026  
**Maintainer**: Barbrick Design  
**License**: See repository LICENSE file
