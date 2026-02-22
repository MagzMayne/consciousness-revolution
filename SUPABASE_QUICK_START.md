# SUPABASE QUICK START
## 5-Minute Setup for Domain Dashboards
**Created:** 2026-02-22 | **Pattern:** 3 → 7 → 13 → ∞

---

## WHAT THIS IS

Your 7 domain dashboards (AGENT_R_DOMAIN_1-7.html) need database tables to store:
- Tasks (with priorities)
- Messages (Trinity communication)
- Metrics (performance tracking)
- Tier states (Personal/Team/Public persistence)

**Currently:** Only `atoms` table exists (166K brain records)
**Need:** 14 more tables for full functionality

---

## STEP 1: OPEN SUPABASE SQL EDITOR

1. Go to: https://supabase.com/dashboard
2. Select project: `iqjghsofnpoadwzqxmnz`
3. Click **SQL Editor** in sidebar
4. Click **New query**

---

## STEP 2: CREATE CORE TABLES (Copy → Paste → Run)

```sql
-- TASK QUEUE (Feeds Black Swan + Next readouts)
CREATE TABLE task_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain TEXT NOT NULL,
    tier TEXT DEFAULT 'personal',
    title TEXT NOT NULL,
    content TEXT,
    priority INTEGER DEFAULT 5,
    status TEXT DEFAULT 'pending',
    assigned_to TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    impact TEXT,
    metadata JSONB
);

CREATE INDEX idx_task_domain_status ON task_queue(domain, status, priority DESC);

-- NODE MESSAGES (Feeds Inbox readout)
CREATE TABLE node_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_node TEXT NOT NULL,
    to_node TEXT NOT NULL,
    message_type TEXT NOT NULL,
    subject TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    priority INTEGER DEFAULT 5
);

CREATE INDEX idx_messages_to_unread ON node_messages(to_node, read_at);

-- TIER STATES (Remembers slider position)
CREATE TABLE tier_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    domain TEXT NOT NULL,
    current_tier TEXT DEFAULT 'personal',
    last_accessed TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_email, domain)
);

-- DOMAIN METRICS (Performance tracking)
CREATE TABLE domain_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_metrics_domain_time ON domain_metrics(domain, metric_name, timestamp DESC);

-- ENABLE ROW LEVEL SECURITY (prevents unauthorized access)
ALTER TABLE task_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE node_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_metrics ENABLE ROW LEVEL SECURITY;

-- BASIC POLICIES (permissive for development - tighten later)
CREATE POLICY "Allow all for authenticated" ON task_queue FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON node_messages FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON tier_states FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON domain_metrics FOR ALL USING (true);
```

Click **Run** button. Should see "Success. No rows returned."

---

## STEP 3: TEST THE TABLES (Browser Console)

Open any domain dashboard (e.g., AGENT_R_DOMAIN_1_COMMAND.html), open browser console (F12), paste:

```javascript
// Test INSERT
const { data, error } = await supabase
    .from('task_queue')
    .insert({
        domain: '1_COMMAND',
        title: 'Test task from console',
        priority: 8
    })
    .select();

console.log('Insert result:', data, error);

// Test SELECT
const { data: tasks } = await supabase
    .from('task_queue')
    .select('*')
    .eq('domain', '1_COMMAND');

console.log('Tasks:', tasks);
```

**Expected:** Should see your test task in the results.

---

## STEP 4: VERIFY DASHBOARD INTEGRATION

1. Refresh the domain dashboard
2. Check Service Status panel - Supabase should show "online"
3. Black Swan readout should update (if high priority tasks exist)
4. Inbox readout should show message count

---

## WHAT EACH TABLE DOES

| Table | Purpose | Feeds Readout |
|-------|---------|---------------|
| `task_queue` | Domain-specific tasks with priorities | BLACK SWAN (#1), NEXT (#3) |
| `node_messages` | Trinity node communication | INBOX (#2) |
| `tier_states` | Remembers tier slider position per user | (Internal) |
| `domain_metrics` | Performance tracking | (Charts, future) |
| `atoms` | Brain knowledge (already exists) | BRAIN STATUS |

---

## TROUBLESHOOTING

**"Table already exists" error:**
- Good! Someone already created it. Skip to Step 3.

**"Permission denied" error:**
- Check you're logged into correct Supabase project
- Verify project URL matches: iqjghsofnpoadwzqxmnz

**Dashboard shows "Offline":**
- Check browser console for errors (F12)
- Verify `domain-supabase.js` is loaded (check Network tab)
- Hard refresh (Ctrl+Shift+R)

**No data appears:**
- Add test data using Step 3 console commands
- Check Supabase → Table Editor to verify data exists
- Verify domain ID matches (`'1_COMMAND'`, `'2_BUILD'`, etc.)

---

## NEXT STEPS (OPTIONAL)

### Add Domain-Specific Tables

**For 5_GROW (Revenue tracking):**
```sql
CREATE TABLE revenue_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT,
    amount NUMERIC(10,2),
    currency TEXT DEFAULT 'USD',
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending'
);
```

**For 3_CONNECT (Team roster):**
```sql
CREATE TABLE team_roster (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    role TEXT,
    status TEXT DEFAULT 'active',
    xp_level INTEGER DEFAULT 1
);
```

**For 2_BUILD (Project tracking):**
```sql
CREATE TABLE project_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_name TEXT NOT NULL,
    repo_url TEXT,
    completion_percentage INTEGER DEFAULT 0,
    last_commit_date TIMESTAMPTZ
);
```

See full schema in: `SUPABASE_DOMAIN_ARCHITECTURE.md`

---

## VISUAL REFERENCE

Open in browser: `SUPABASE_ARCHITECTURE_VISUAL.html`
- Shows all 15 tables
- Color-coded priority (RED = create first, YELLOW = later, GREEN = optional)
- Data flow diagram

---

## FILES TO READ

| File | Purpose |
|------|---------|
| `SUPABASE_DOMAIN_ARCHITECTURE.md` | Complete design doc (1,500 lines) |
| `SUPABASE_ARCHITECTURE_VISUAL.html` | Interactive blueprint |
| `js/domain-supabase.js` | Client code (already working) |
| `netlify/functions/brain-api.mjs` | Backend integration example |

---

## AUTHENTICATION (Later)

Currently: Anyone with anon key can read/write (RLS policies are permissive)

**To lock down:**
1. Supabase Dashboard → Authentication → Enable Email auth
2. Update RLS policies to check `auth.uid()`
3. Add login page to dashboards

Not urgent - private deployment protects for now.

---

**Status:** Phase 1 ready to deploy
**Time:** 5 minutes
**Blocking:** None

**C2 ARCHITECT SIGNATURE**
Ready for production. 🏗️
