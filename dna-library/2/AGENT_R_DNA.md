# AGENT R DNA

## WHAT IS IT
The 8-domain personal operating system framework that every builder gets. Each person gets their own "Agent R" dashboard with tabs for each of the 8 consciousness domains (COMMAND, BUILD, CONNECT, PROTECT, GROW, LEARN, TRANSCEND, BLUEPRINT). Features Personal/Team/Public view modes so users control what's private, shared with team, or visible to everyone. Think: your entire life organized into 8 color-coded areas with privacy control.

## STATUS
- Working: **WORKING** (UI functional, backend placeholder)
- Last tested: 2026-03-06
- Current issues: No user customization (generic data), view toggle doesn't persist, domains not connected to backend

## LOCATION
**Primary files:**
- `~/100X_DEPLOYMENT/AGENT_R_8_DOMAINS_UNIFIED.html` - Main unified dashboard (all 8 tabs)
- `~/100X_DEPLOYMENT/AGENT_R_DOMAIN_1_COMMAND.html` - COMMAND domain
- `~/100X_DEPLOYMENT/AGENT_R_DOMAIN_2_BUILD.html` - BUILD domain
- `~/100X_DEPLOYMENT/AGENT_R_DOMAIN_3_CONNECT.html` - CONNECT domain
- `~/100X_DEPLOYMENT/AGENT_R_DOMAIN_4_PROTECT.html` - PROTECT domain
- `~/100X_DEPLOYMENT/AGENT_R_DOMAIN_5_GROW.html` - GROW domain
- `~/100X_DEPLOYMENT/AGENT_R_DOMAIN_6_LEARN.html` - LEARN domain
- `~/100X_DEPLOYMENT/AGENT_R_DOMAIN_7_TRANSCEND.html` - TRANSCEND domain
- `~/100X_DEPLOYMENT/AGENT_R_DOMAIN_8_BLUEPRINT.html` - BLUEPRINT domain
- `~/100X_DEPLOYMENT/agent-r-mobile-messaging.html` - Mobile messaging interface
- `~/100X_DEPLOYMENT/HELP_AGENT_R_v1.html` - Help documentation

**Dependencies:**
- Supabase (user profiles - planned)
- Netlify Functions (backend APIs - planned)
- localStorage (current state storage)

## HOW IT WORKS

```
┌────────────────────────────────────────────────────────────────────┐
│                        AGENT R FRAMEWORK                           │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐              │
│  │ COMMAND │  │  BUILD  │  │ CONNECT │  │ PROTECT │              │
│  │   (1)   │  │   (2)   │  │   (3)   │  │   (4)   │              │
│  │   Red   │  │ Orange  │  │  Blue   │  │ Purple  │              │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘              │
│       │            │            │            │                    │
│       └────────────┴─────┬──────┴────────────┘                    │
│                          │                                         │
│                    ┌─────▼─────┐                                   │
│                    │   YOUR    │                                   │
│                    │  PROFILE  │                                   │
│                    └─────┬─────┘                                   │
│                          │                                         │
│       ┌──────────────────┼──────────────────┐                     │
│       │                  │                  │                     │
│  ┌────┴────┐  ┌─────┴────┐  ┌────┴────┐  ┌─────────┐              │
│  │  GROW   │  │  LEARN  │  │TRANSCEND│  │BLUEPRINT│              │
│  │   (5)   │  │   (6)   │  │   (7)   │  │   (8)   │              │
│  │  Green  │  │ Yellow  │  │ Magenta │  │  Teal   │              │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘              │
│                                                                    │
│  VIEW MODES: [Personal/Pink] [Team/Blue] [Public/Green]          │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Core Logic:
1. User opens unified dashboard or individual domain
2. Sees all 8 domains as color-coded tabs
3. Can toggle between Personal/Team/Public views
4. Each domain shows relevant cards/content
5. Personal = private, Team = shared with collaborators, Public = visible to everyone
6. Uses 7×7×7 fractal pattern (7 domains × 7 sub-domains × 7 aspects = 343 nodes)

## KEY FILES BREAKDOWN

### AGENT_R_8_DOMAINS_UNIFIED.html
- **Purpose:** Main unified dashboard with all 8 domain tabs
- **Features:**
  - Tabbed navigation for all 8 domains
  - Personal/Team/Public view toggle
  - LFSME score: 9.8 average
  - Persistent ARAYA chat integration
  - Spreadsheet-style flow

### AGENT_R_DOMAIN_[1-8]_*.html (8 files)
- **Purpose:** Individual domain pages for deep focus
- **Features:**
  - Supabase integration (planned)
  - 3-tier slider (Personal/Team/Public)
  - Service status indicators
  - ARAYA editable fields

### agent-r-mobile-messaging.html
- **Purpose:** Mobile-optimized messaging interface
- **Features:** Touch-friendly, responsive design

## DEPENDENCIES

**Required:**
- Modern web browser
- Internet connection (for live site)

**Optional (for full features):**
- Supabase (user data storage - planned)
- Netlify Functions (backend APIs - planned)

## HOW TO RUN

**Web Access:**
```bash
# Unified dashboard
https://conciousnessrevolution.io/AGENT_R_8_DOMAINS_UNIFIED.html

# Individual domains
https://conciousnessrevolution.io/AGENT_R_DOMAIN_1_COMMAND.html
https://conciousnessrevolution.io/AGENT_R_DOMAIN_2_BUILD.html
# ... through DOMAIN_8_BLUEPRINT

# Mobile messaging
https://conciousnessrevolution.io/agent-r-mobile-messaging.html
```

**Local Development:**
```bash
cd ~/100X_DEPLOYMENT
netlify dev
# Access: http://localhost:8888/AGENT_R_8_DOMAINS_UNIFIED.html
```

## HOW TO BUILD

**No build required** - Plain HTML/CSS/JavaScript.

## HOW TO DEPLOY

```bash
cd ~/100X_DEPLOYMENT
netlify deploy --prod --dir=.
```

## CRITICAL KNOWLEDGE

### The 8 Domains:

| # | Domain | Color | Purpose |
|---|--------|-------|---------|
| 1 | COMMAND | Red | Leadership, Decision-Making, Mission Control |
| 2 | BUILD | Orange | Creation, Engineering, Projects |
| 3 | CONNECT | Blue | Relationships, Network, Communication |
| 4 | PROTECT | Purple | Security, Legal, Safety |
| 5 | GROW | Green | Marketing, Expansion, Revenue |
| 6 | LEARN | Yellow | Education, Research, Knowledge |
| 7 | TRANSCEND | Magenta | Philosophy, Higher Purpose, Consciousness |
| 8 | BLUEPRINT | Teal | Planning, Architecture, Systems Design |

### View Modes:

| Mode | Color | What You See |
|------|-------|--------------|
| Personal | Pink (#ff6b9d) | Private data - only you |
| Team | Blue (#00aaff) | Shared with collaborators |
| Public | Green (#00cc66) | Visible to everyone |

### The 7×7×7 Pattern:
```
7 Domains (+ 1 Blueprint = 8 total)
  └── 7 Sub-domains each
        └── 7 Aspects each
              └── = 343 unique nodes per builder
```

### Important Quirks:
- Agent R is the personal instance; Framework is reusable
- Each builder gets their own Agent R dashboard
- Dashboard DNA embedded in each HTML file
- LFSME scoring built into DNA metadata
- Originally designed for Ryan Barbrick ("Agent R")

### Known Issues:
- No user customization (shows generic content)
- View mode toggle doesn't persist across sessions
- Domains not connected to Supabase backend
- No actual data filtering by visibility level

## CONFIGURATION

**Dashboard DNA (embedded in each HTML):**
```json
{
  "name": "7 Domains Unified Dashboard",
  "version": "1.0.0",
  "domain": "ALL_DOMAINS",
  "sphere": "AGENT_R_DOMAINS",
  "features": ["tabbed-navigation", "personal-team-public-toggle"],
  "owner": "Agent R",
  "lfsme": {
    "lighter": 10,
    "faster": 10,
    "stronger": 9,
    "elegant": 10,
    "less_expensive": 10,
    "average": 9.8
  }
}
```

**Color Variables:**
```css
--d1: #ff4444; /* COMMAND - Red */
--d2: #ff8800; /* BUILD - Orange */
--d3: #00aaff; /* CONNECT - Blue */
--d4: #aa44ff; /* PROTECT - Purple */
--d5: #00cc66; /* GROW - Green */
--d6: #ffcc00; /* LEARN - Yellow */
--d7: #ff00ff; /* TRANSCEND - Magenta */
--blueprint: #00ffaa; /* Blueprint - Teal */
--personal: #ff6b9d; /* Personal - Pink */
--team: #00aaff; /* Team - Blue */
--public: #00cc66; /* Public - Green */
```

## API REFERENCE

**Planned Backend (not yet implemented):**
```javascript
// Get user's domain data
GET /api/agent-r/domain/:domainId?view=personal|team|public

// Update domain data
POST /api/agent-r/domain/:domainId
{ "view": "personal", "data": {...} }

// Get all domains summary
GET /api/agent-r/summary
```

## EXAMPLES

### Example 1: Access Unified Dashboard
```bash
https://conciousnessrevolution.io/AGENT_R_8_DOMAINS_UNIFIED.html
# Click tabs to switch domains, toggle Personal/Team/Public
```

### Example 2: Open Specific Domain
```bash
# Open BUILD domain for creation/engineering focus
https://conciousnessrevolution.io/AGENT_R_DOMAIN_2_BUILD.html
```

### Example 3: Mobile Access
```bash
# Mobile-optimized messaging
https://conciousnessrevolution.io/agent-r-mobile-messaging.html
```

## TESTING

**How to test:**
```bash
# Test unified dashboard loads
curl -I https://conciousnessrevolution.io/AGENT_R_8_DOMAINS_UNIFIED.html

# Test each domain loads (8 tests)
for i in {1..8}; do
  curl -I https://conciousnessrevolution.io/AGENT_R_DOMAIN_${i}_*.html
done

# Manual test checklist:
# - All 8 domain tabs clickable
# - Personal/Team/Public toggle works visually
# - Content cards display
# - Mobile responsive
```

## TROUBLESHOOTING

**Problem:** "Dashboard shows generic data"
**Solution:** Expected - needs Supabase integration to show personalized data

**Problem:** "View mode resets when I refresh"
**Solution:** Add localStorage persistence (TODO)

**Problem:** "Domain page 404s"
**Solution:** Check exact filename - use AGENT_R_DOMAIN_[1-8]_[NAME].html format

**Problem:** "Colors don't match domain"
**Solution:** Verify CSS variables match domain numbers

## NEXT STEPS

**Priority actions:**
1. Connect all domains to Supabase backend
2. Make view toggle persist in localStorage
3. Load actual user data based on profile
4. Filter content by visibility level (Personal/Team/Public)
5. Design Supabase schema for 8 domains

**Known gaps:**
- No real user data (all placeholder)
- No backend API endpoints
- View mode is cosmetic only (no data filtering)
- No cross-domain data syncing

## TECH STACK

- **Frontend:** HTML/CSS/JS (vanilla)
- **UI Pattern:** Tabbed interface with color-coded domains
- **State:** Currently localStorage, should be database
- **Backend (planned):** Netlify Functions + Supabase
- **Styling:** CSS variables for domain colors

## TAGS
#product #personal-os #domains #dashboard #7x7x7 #agent-r #privacy-modes

## METADATA
- **Creator:** Commander (darrickpreble@proton.me)
- **Created:** 2026
- **Last Updated:** 2026-03-06
- **Version:** 1.0
- **HTML Files:** 10 (unified + 8 domains + mobile)
- **Status:** Working (UI), Incomplete (backend)

## RELATED DNAS
- [DASHBOARDS_DNA.md] - Dashboard ecosystem (includes Agent R)
- [BUILDER_OS_DNA.md] - Builder platform (uses Agent R framework)
- [SUPABASE_DNA.md] - Database backend (planned)
- [ARAYA_DNA.md] - AI assistant integration
