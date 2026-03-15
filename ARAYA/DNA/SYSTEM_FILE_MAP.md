# SYSTEM FILE MAP FOR AI
## The Complete Repository Structure for ARAYA & Agent AI
## Updated: 2026-03-13

---

## WHERE EVERYTHING LIVES

### Primary Repository
```
GitHub: overkillkulture/consciousness-revolution
Local:  C:/Users/dwrek/100X_DEPLOYMENT/
Deploy: https://conciousnessrevolution.io/
```

### Canonical Dashboard Locations

| Dashboard | File Path | Live URL | Owner |
|-----------|-----------|----------|-------|
| Commander 777 | `COMMANDER_7_DOMAINS_UNIFIED.html` | /COMMANDER_7_DOMAINS_UNIFIED.html | Commander |
| Agent R 777 | `AGENT_R_7_DOMAINS_UNIFIED.html` | /AGENT_R_7_DOMAINS_UNIFIED.html | Agent R |
| Francis Cockpit | `FRANCIS_COCKPIT.html` | /FRANCIS_COCKPIT.html | Francis |
| ARAYA Chat | `araya-chat.html` | /araya-chat.html | System |
| Team Command | `TEAM_COMMAND_CENTER.html` | /TEAM_COMMAND_CENTER.html | Team |
| Dashboard Factory | `DASHBOARD_FACTORY_COMMAND_CENTER.html` | /DASHBOARD_FACTORY_COMMAND_CENTER.html | System |

---

## DASHBOARD DNA METADATA STANDARD

Every dashboard MUST include this in the DNA block:

```json
{
  "name": "Dashboard Name",
  "version": "2.1.0",
  "file": {
    "path": "COMMANDER_7_DOMAINS_UNIFIED.html",
    "repo": "overkillkulture/consciousness-revolution",
    "branch": "main",
    "local": "C:/Users/dwrek/100X_DEPLOYMENT/COMMANDER_7_DOMAINS_UNIFIED.html"
  },
  "url": "https://conciousnessrevolution.io/COMMANDER_7_DOMAINS_UNIFIED.html",
  "owner": "Commander",
  "domain": "ALL_DOMAINS",
  "status": "LIVE",
  "araya": {
    "editable": true,
    "registry": "ARAYA_EDITABLE",
    "commands": ["theme", "color", "title", "reset"]
  }
}
```

---

## API ENDPOINTS (For AI to call)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/.netlify/functions/araya-chat` | POST | Main ARAYA conversation |
| `/.netlify/functions/araya-dna` | GET | DNA library access |
| `/.netlify/functions/araya-dashboard-edit` | POST | Dashboard editing via chat |
| `/.netlify/functions/araya-realtime-edit` | POST | Real-time live edits |
| `/.netlify/functions/araya-file` | POST | Read/write files |
| `/.netlify/functions/araya-themes` | GET/POST | Theme management |
| `/.netlify/functions/dashboard-config` | GET | Dashboard configuration |
| `/.netlify/functions/brain-query` | POST | Query Cyclotron brain |

---

## FILE STRUCTURE

```
100X_DEPLOYMENT/
├── index.html                 # Landing page
├── araya-chat.html            # Main ARAYA chat interface
├── domains-simple.html        # Simple 7 domains view
├── build.html                 # Build Guild products
│
├── COMMANDER_*.html           # Commander's dashboards (OWNER)
├── AGENT_R_*.html             # Agent R's dashboards
├── FRANCIS_*.html             # Francis's dashboards
│
├── netlify/functions/         # 105 serverless functions
│   ├── araya-*.mjs            # ARAYA backend services
│   ├── dashboard-*.mjs        # Dashboard management
│   └── *.mjs                  # Other APIs
│
├── ARAYA/DNA/                 # DNA blueprint documents
├── docs/                      # Documentation
├── js/                        # Shared JavaScript
└── css/                       # Shared CSS
```

---

## CLONING A DASHBOARD FOR NEW USER

To create a new dashboard for someone:

1. **Copy the template:**
```bash
cp COMMANDER_7_DOMAINS_UNIFIED.html NEWUSER_7_DOMAINS_UNIFIED.html
```

2. **Update the DNA block:**
   - Change `"owner"` to new user name
   - Change `"name"` to reflect owner
   - Update `"file.path"` to new filename
   - Update `"url"` to new URL

3. **Search and replace:**
```bash
# Replace Commander references
sed -i 's/Commander/NewUser/g' NEWUSER_7_DOMAINS_UNIFIED.html
```

4. **Deploy:**
```bash
netlify deploy --prod --dir=.
```

---

## BETA TESTING WORKFLOW

### Phase 1: Download & Test
1. Agent R downloads dashboard from production
2. Tests all ARAYA commands (`/theme`, `/color`, `/help`)
3. Documents what works, what's broken
4. Reports via TEAM_COMMS_HUB

### Phase 2: Upgrade & Return
1. Agent R makes improvements locally
2. Creates pull request or sends updated file
3. Commander reviews changes
4. Merge to production

### Phase 3: Builder Standard
1. Document what makes a "good" dashboard
2. Create LFSME scorecard for each
3. Best patterns become the standard
4. Copy standard to new users

---

## DEPLOYMENT COMMANDS

```bash
# Full deploy
cd /c/Users/dwrek/100X_DEPLOYMENT
netlify deploy --prod --dir=.

# Check what will deploy
netlify deploy --dir=.

# Quick status
netlify status
```

---

## BRAIN QUERY (For AI context)

```sql
-- Find all dashboard atoms
SELECT * FROM atoms WHERE content LIKE '%dashboard%' LIMIT 10;

-- Find ARAYA-related learning
SELECT * FROM atoms WHERE content LIKE '%araya%edit%' LIMIT 10;

-- Find file locations
SELECT * FROM file_addresses WHERE owner = 'Commander';
```

---

## CONTACT

**Repository Owner:** Commander (Darrick Preble)
**Email:** darrickpreble@proton.me
**Pattern:** 3 → 7 → 13 → ∞
**Trinity:** C1 × C2 × C3 = ∞

---

*This file is indexed by ARAYA and available at:*
*`/.netlify/functions/araya-dna?action=fetch&file=SYSTEM_FILE_MAP.md`*
