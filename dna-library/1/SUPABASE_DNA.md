# SUPABASE DNA

## WHAT IS IT
PostgreSQL database backend powering the entire system. Project ID: `iqjghsofnpoadwzqxmnz`. Currently hosts 166K+ atoms in Cyclotron brain table. Designed for 15+ tables supporting all 7 domains with 3-tier privacy (Personal/Team/Public). Includes real-time subscriptions, Row Level Security, and cloud sync with local SQLite brain.

## STATUS
- Working: **PARTIAL** (atoms table works, domain tables need creation)
- Last tested: 2026-03-06
- Current issues: Only `atoms` table deployed, 14 more tables designed but not created

## LOCATION
**Primary files:**
- `~/100X_DEPLOYMENT/SUPABASE_QUICK_START.md` - 5-minute setup guide
- `~/100X_DEPLOYMENT/SUPABASE_DOMAIN_ARCHITECTURE.md` - Complete design doc (1,500 lines)
- `~/100X_DEPLOYMENT/SUPABASE_ARCHITECTURE_VISUAL.html` - Interactive blueprint

**Schema files:**
- `~/100X_DEPLOYMENT/SUPABASE_FEEDBACK_SCHEMA.sql` - Feedback tables
- `~/100X_DEPLOYMENT/SUPABASE_USER_IMAGES_SCHEMA.sql` - User image storage
- `~/100X_DEPLOYMENT/SUPABASE_DASHBOARD_INDEX_SCHEMA.sql` - Dashboard index
- `~/100X_DEPLOYMENT/SUPABASE_VERIFIED_MEMBERS_SCHEMA.sql` - Member verification

**Client code:**
- `~/100X_DEPLOYMENT/js/domain-supabase.js` - Dashboard integration
- `~/100X_DEPLOYMENT/ARAYA_SUPABASE_SYNC.py` - Python sync utility

**Connection:**
- Project URL: `https://iqjghsofnpoadwzqxmnz.supabase.co`
- Dashboard: `https://supabase.com/dashboard/project/iqjghsofnpoadwzqxmnz`

## HOW IT WORKS

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SUPABASE ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    EXISTING (WORKING)                        │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │  atoms (166K+)  │  Brain knowledge base              │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    DESIGNED (PENDING)                        │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐               │   │
│  │  │task_queue │  │node_msgs  │  │tier_states│               │   │
│  │  └───────────┘  └───────────┘  └───────────┘               │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐               │   │
│  │  │domain_    │  │revenue_   │  │project_   │               │   │
│  │  │metrics    │  │metrics    │  │progress   │               │   │
│  │  └───────────┘  └───────────┘  └───────────┘               │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐               │   │
│  │  │team_      │  │conscious_ │  │dashboard_ │               │   │
│  │  │roster     │  │metrics    │  │instances  │               │   │
│  │  └───────────┘  └───────────┘  └───────────┘               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  LOCAL ──────→ SUPABASE ──────→ DASHBOARDS                         │
│  SQLite          Cloud            Real-time                         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Core Logic:
1. Local SQLite brain (166K atoms) syncs to Supabase cloud
2. Dashboards connect via `domain-supabase.js`
3. Real-time subscriptions push updates instantly
4. Row Level Security controls access by tier
5. Each domain has domain-specific tables

## KEY FILES BREAKDOWN

### SUPABASE_DOMAIN_ARCHITECTURE.md (1,500 lines)
- **Purpose:** Complete database design specification
- **Contents:** All 15 table schemas, indexes, RLS policies

### SUPABASE_QUICK_START.md
- **Purpose:** 5-minute deployment guide
- **Contents:** SQL to create core tables, testing commands

### domain-supabase.js
- **Purpose:** Client library for dashboards
- **Features:**
  - Connection status monitoring
  - 30-second polling loop
  - Service health checks
  - Mobile swipe gestures
  - Auto-domain detection

## DEPENDENCIES

**Required:**
- Supabase account (free tier works)
- Internet connection

**Client libraries:**
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

## HOW TO RUN

**Access Dashboard:**
```bash
https://supabase.com/dashboard/project/iqjghsofnpoadwzqxmnz
```

**SQL Editor:**
1. Go to Supabase Dashboard
2. Click SQL Editor in sidebar
3. Click "New query"
4. Paste SQL, click Run

## HOW TO BUILD

**Create Core Tables:**
```sql
-- Copy from SUPABASE_QUICK_START.md
-- Creates: task_queue, node_messages, tier_states, domain_metrics
```

**Enable RLS:**
```sql
ALTER TABLE task_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated" ON task_queue FOR ALL USING (true);
```

## HOW TO DEPLOY

**Deploy tables:**
1. Open SQL Editor in Supabase Dashboard
2. Copy SQL from SUPABASE_QUICK_START.md
3. Click Run
4. Verify: "Success. No rows returned."

## CRITICAL KNOWLEDGE

### Table Inventory:

| # | Table | Purpose | Status |
|---|-------|---------|--------|
| 1 | `atoms` | Brain knowledge (166K) | DEPLOYED |
| 2 | `task_queue` | Domain tasks | DESIGNED |
| 3 | `node_messages` | Trinity comms | DESIGNED |
| 4 | `tier_states` | Privacy persistence | DESIGNED |
| 5 | `domain_metrics` | Performance | DESIGNED |
| 6 | `revenue_metrics` | GROW domain | DESIGNED |
| 7 | `project_progress` | BUILD domain | DESIGNED |
| 8 | `team_roster` | CONNECT domain | DESIGNED |
| 9 | `consciousness_metrics` | TRANSCEND | DESIGNED |
| 10-15 | Dashboard Factory | Factory tables | DESIGNED |

### Domain-Table Mapping:

| Domain | Tables Used |
|--------|------------|
| 1_COMMAND | task_queue, node_messages |
| 2_BUILD | project_progress, task_queue |
| 3_CONNECT | team_roster, node_messages |
| 4_PROTECT | (uses core tables) |
| 5_GROW | revenue_metrics |
| 6_LEARN | atoms (brain) |
| 7_TRANSCEND | consciousness_metrics |

### Connection Details:

```javascript
const SUPABASE_URL = 'https://iqjghsofnpoadwzqxmnz.supabase.co';
const SUPABASE_ANON_KEY = '...'; // See .consciousness/MASTER_BOOT_CHECKUP.py
```

### Three-Tier Privacy:

| Tier | Color | Access |
|------|-------|--------|
| Personal | Pink (#ff6b9d) | Only you |
| Team | Blue (#00aaff) | Collaborators |
| Public | Green (#00cc66) | Everyone |

### Important Quirks:
- Project ID: `iqjghsofnpoadwzqxmnz`
- 166K atoms already synced to cloud
- Real-time requires subscription setup
- RLS policies currently permissive (dev mode)

### Known Issues:
- Only `atoms` table deployed
- 14 tables designed but not created
- RLS policies need tightening for production
- No authentication implemented yet

## CONFIGURATION

**Environment Variables:**
```bash
SUPABASE_URL=https://iqjghsofnpoadwzqxmnz.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=... # For backend only
```

**Connection Health Check:**
```javascript
// In browser console on any dashboard
supabase.from('atoms').select('count', { count: 'exact' })
// Should return: { count: 166455 }
```

## API REFERENCE

**Query atoms:**
```javascript
const { data } = await supabase
    .from('atoms')
    .select('*')
    .ilike('content', '%pattern%')
    .limit(10);
```

**Insert task:**
```javascript
const { data, error } = await supabase
    .from('task_queue')
    .insert({
        domain: '1_COMMAND',
        title: 'My task',
        priority: 8
    })
    .select();
```

**Real-time subscription:**
```javascript
supabase
    .channel('task-changes')
    .on('postgres_changes',
        { event: '*', schema: 'public', table: 'task_queue' },
        payload => console.log('Change:', payload)
    )
    .subscribe();
```

## EXAMPLES

### Example 1: Check Atom Count
```javascript
const { count } = await supabase
    .from('atoms')
    .select('*', { count: 'exact', head: true });
console.log('Atoms:', count); // 166455
```

### Example 2: Query Brain
```javascript
const { data } = await supabase
    .from('atoms')
    .select('*')
    .ilike('content', '%consciousness%')
    .order('confidence', { ascending: false })
    .limit(10);
```

### Example 3: Create Task (when table exists)
```sql
INSERT INTO task_queue (domain, title, priority)
VALUES ('2_BUILD', 'Implement feature X', 8);
```

## TESTING

**How to test:**
```bash
# Test connection (browser console)
supabase.from('atoms').select('id').limit(1)

# Test table exists
supabase.from('task_queue').select('*').limit(1)
# If error: table doesn't exist yet

# Test RLS
# Log out, try query - should fail if RLS working
```

## TROUBLESHOOTING

**Problem:** "Table doesn't exist"
**Solution:** Run SQL from SUPABASE_QUICK_START.md to create tables

**Problem:** "Permission denied"
**Solution:** Check RLS policies, ensure anon key is correct

**Problem:** "Connection failed"
**Solution:** Check SUPABASE_URL, verify internet connection

**Problem:** "Dashboard shows offline"
**Solution:** Check browser console for errors, verify domain-supabase.js loaded

## NEXT STEPS

**Priority actions:**
1. Deploy 4 core tables (task_queue, node_messages, tier_states, domain_metrics)
2. Deploy domain-specific tables (revenue, project, team, consciousness)
3. Deploy Dashboard Factory tables (7 more)
4. Tighten RLS policies for production
5. Implement authentication

**Known gaps:**
- 14 tables designed but not deployed
- RLS is permissive (needs tightening)
- No authentication yet
- Real-time not tested at scale

## TECH STACK

- **Database:** PostgreSQL (via Supabase)
- **Real-time:** Supabase Realtime (WebSocket)
- **Security:** Row Level Security (RLS)
- **Client:** @supabase/supabase-js v2
- **Storage:** Supabase Storage (for files)

## TAGS
#foundation #database #supabase #postgresql #realtime #rls #cloud

## METADATA
- **Creator:** Commander (darrickpreble@proton.me)
- **Created:** 2025
- **Last Updated:** 2026-03-06
- **Version:** 1.0
- **Project ID:** iqjghsofnpoadwzqxmnz
- **Atom Count:** 166,455
- **Status:** Partial (1/15 tables deployed)

## RELATED DNAS
- [CYCLOTRON_BRAIN_DNA.md] - Local brain that syncs to Supabase
- [DASHBOARD_FACTORY_DNA.md] - Needs 7 Supabase tables
- [AGENT_R_DNA.md] - Domain dashboards use Supabase
- [BUILDER_OS_DNA.md] - Builder profiles stored here
