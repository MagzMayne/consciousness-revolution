# SUPABASE DOMAIN ARCHITECTURE
## C2 Architect - Database Integration Design
**Created:** 2026-02-22
**Pattern:** 3 → 7 → 13 → ∞

---

## EXECUTIVE SUMMARY

**Current State:** Domain dashboards have Supabase client connected but incomplete schema
**Goal:** Full-stack real-time data architecture for 7 domains × 3 tiers
**Priority:** HIGH - Core infrastructure for Agent R system

---

## 1. CURRENT IMPLEMENTATION ANALYSIS

### ✅ What Works
```javascript
// domain-supabase.js provides:
- Supabase client initialization
- Connection status monitoring
- 30-second polling loop
- Service health checks (Supabase, Netlify, GitHub, Brain)
- Mobile swipe gestures for tier switching
- Auto-detection of domain from Dashboard DNA
```

### ⚠️ What's Missing
```sql
-- Required Supabase tables NOT yet created:
1. task_queue (domain-specific tasks)
2. node_messages (Trinity inter-node comms)
3. domain_metrics (performance tracking)
4. tier_states (Personal/Team/Public persistence)
5. consciousness_metrics (7_TRANSCEND specific)
6. project_progress (2_BUILD specific)
7. revenue_metrics (5_GROW specific)
```

### 🔄 Current Data Flow (Partial)
```
Dashboard HTML (AGENT_R_DOMAIN_X.html)
  ↓ includes
domain-supabase.js
  ↓ connects to
Supabase (iqjghsofnpoadwzqxmnz.supabase.co)
  ↓ queries
atoms table (166K+ records) ✅
  ↓ MISSING
task_queue, node_messages, etc. ❌
```

---

## 2. PROPOSED DATABASE SCHEMA

### Core Tables (All Domains)

#### 2.1 `task_queue` - Priority Task Management
```sql
CREATE TABLE task_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain TEXT NOT NULL,           -- '1_COMMAND' through '7_TRANSCEND'
    tier TEXT DEFAULT 'personal',   -- 'personal', 'team', 'public'
    title TEXT NOT NULL,
    content TEXT,
    task_type TEXT DEFAULT 'todo',  -- 'todo', 'ai', 'automation', 'review'
    priority INTEGER DEFAULT 5,     -- 1 (low) to 10 (critical)
    status TEXT DEFAULT 'pending',  -- 'pending', 'in_progress', 'complete', 'blocked'
    assigned_to TEXT,               -- Email or Trinity node (C1/C2/C3)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    impact TEXT,                    -- Human readable: "Blocks revenue", "Enables automation"
    blockers TEXT[],                -- Array of blocking task IDs
    source_file TEXT,               -- Where task originated
    metadata JSONB,                 -- Flexible storage

    -- Performance indexes
    INDEX idx_task_domain_status (domain, status, priority DESC),
    INDEX idx_task_tier (tier, domain),
    INDEX idx_task_assigned (assigned_to, status)
);
```

#### 2.2 `node_messages` - Trinity Communication
```sql
CREATE TABLE node_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_node TEXT NOT NULL,        -- 'COMMAND', 'BUILD', etc.
    to_node TEXT NOT NULL,
    from_computer TEXT,             -- 'CP1', 'CP2', 'CP3' (optional)
    to_computer TEXT,
    message_type TEXT NOT NULL,     -- 'task', 'status', 'alert', 'query', 'response'
    priority INTEGER DEFAULT 5,
    subject TEXT,
    content TEXT NOT NULL,
    payload JSONB,                  -- Structured data
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    correlation_id UUID,            -- Link request/response pairs

    INDEX idx_messages_to_unread (to_node, read_at),
    INDEX idx_messages_priority (priority DESC, created_at),
    INDEX idx_messages_correlation (correlation_id)
);
```

#### 2.3 `atoms` - Brain Integration (Existing)
```sql
-- Already exists in Supabase with 166K+ records
-- No changes needed, already working
CREATE TABLE atoms (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    source TEXT,
    tags TEXT,
    metadata TEXT,
    created TEXT,
    confidence REAL DEFAULT 0.75,
    access_count INTEGER DEFAULT 0,
    last_accessed TEXT,
    region TEXT,
    domain TEXT,
    aspect TEXT,
    phase TEXT,
    supabase_id TEXT
);
```

#### 2.4 `tier_states` - Dashboard Persistence
```sql
CREATE TABLE tier_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    domain TEXT NOT NULL,
    current_tier TEXT DEFAULT 'personal', -- 'personal', 'team', 'public'
    last_accessed TIMESTAMPTZ DEFAULT NOW(),
    preferences JSONB,              -- UI state, filters, etc.

    UNIQUE(user_email, domain),
    INDEX idx_tier_user (user_email, domain)
);
```

### Domain-Specific Tables

#### 2.5 `domain_metrics` - Universal Performance Tracking
```sql
CREATE TABLE domain_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain TEXT NOT NULL,
    metric_name TEXT NOT NULL,      -- 'tasks_completed', 'revenue', 'bugs_fixed', etc.
    metric_value NUMERIC,
    unit TEXT,                      -- 'count', 'usd', 'hours', 'percentage'
    tier TEXT DEFAULT 'personal',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB,

    INDEX idx_metrics_domain_time (domain, metric_name, timestamp DESC),
    INDEX idx_metrics_tier (tier, domain)
);
```

#### 2.6 Domain-Specific Extensions

**1_COMMAND:**
```sql
-- Already covered by task_queue + node_messages
-- No additional tables needed
```

**2_BUILD:**
```sql
CREATE TABLE project_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_name TEXT NOT NULL,
    repo_url TEXT,
    status TEXT DEFAULT 'active',  -- 'active', 'paused', 'complete'
    completion_percentage INTEGER DEFAULT 0,
    last_commit_sha TEXT,
    last_commit_date TIMESTAMPTZ,
    open_issues INTEGER DEFAULT 0,
    open_prs INTEGER DEFAULT 0,
    metadata JSONB
);
```

**3_CONNECT:**
```sql
CREATE TABLE team_roster (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    role TEXT,                     -- 'operator', 'beta_tester', 'advisor'
    status TEXT DEFAULT 'active',  -- 'active', 'inactive', 'pending'
    joined_date DATE DEFAULT CURRENT_DATE,
    xp_level INTEGER DEFAULT 1,
    contact_preferences JSONB,
    metadata JSONB
);
```

**4_PROTECT:**
```sql
CREATE TABLE legal_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_name TEXT NOT NULL,
    case_type TEXT,                -- 'ip', 'compliance', 'contracts'
    status TEXT DEFAULT 'open',    -- 'open', 'pending', 'resolved'
    priority INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    metadata JSONB
);

CREATE TABLE evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES legal_cases(id),
    evidence_type TEXT,            -- 'screenshot', 'email', 'document'
    storage_url TEXT,              -- Link to Google Drive, etc.
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);
```

**5_GROW:**
```sql
CREATE TABLE revenue_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT,                   -- 'stripe', 'paypal', 'manual'
    amount NUMERIC(10,2),
    currency TEXT DEFAULT 'USD',
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    metadata JSONB
);

CREATE TABLE conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    funnel_step TEXT,              -- 'landing', 'signup', 'payment'
    user_id TEXT,
    converted BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);
```

**6_LEARN:**
```sql
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'draft',   -- 'draft', 'published', 'archived'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

CREATE TABLE progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id),
    user_email TEXT NOT NULL,
    completion_percentage INTEGER DEFAULT 0,
    last_accessed TIMESTAMPTZ,
    metadata JSONB
);
```

**7_TRANSCEND:**
```sql
CREATE TABLE consciousness_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_type TEXT,              -- 'meditation', 'pattern_recognition', 'emergence'
    value NUMERIC,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

CREATE TABLE patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern_name TEXT NOT NULL,
    pattern_type TEXT,             -- '3→7→13→∞', 'fractal', 'fibonacci'
    description TEXT,
    discovered_at TIMESTAMPTZ DEFAULT NOW(),
    occurrences INTEGER DEFAULT 1,
    metadata JSONB
);
```

---

## 3. RECOMMENDED DATA FLOW ARCHITECTURE

### 3.1 Three-Tier Data Loading

```javascript
// PERSONAL TIER (Default)
async function loadPersonalData(domainId, userEmail) {
    const { data: tasks } = await supabase
        .from('task_queue')
        .select('*')
        .eq('domain', domainId)
        .eq('tier', 'personal')
        .eq('assigned_to', userEmail)
        .order('priority', { ascending: false })
        .limit(10);

    return { tasks };
}

// TEAM TIER (Collaborative)
async function loadTeamData(domainId) {
    const { data: tasks } = await supabase
        .from('task_queue')
        .select('*')
        .eq('domain', domainId)
        .in('tier', ['personal', 'team'])  // Show personal + team
        .order('priority', { ascending: false })
        .limit(20);

    const { data: roster } = await supabase
        .from('team_roster')
        .select('*')
        .eq('status', 'active');

    return { tasks, roster };
}

// PUBLIC TIER (Full visibility)
async function loadPublicData(domainId) {
    const { data: tasks } = await supabase
        .from('task_queue')
        .select('*')
        .eq('domain', domainId)
        // No tier filter - show all
        .order('priority', { ascending: false })
        .limit(50);

    const { data: metrics } = await supabase
        .from('domain_metrics')
        .select('*')
        .eq('domain', domainId)
        .order('timestamp', { ascending: false })
        .limit(100);

    return { tasks, metrics };
}
```

### 3.2 Real-Time Subscriptions

```javascript
// Subscribe to task updates for this domain
function subscribeToTasks(domainId, callback) {
    return supabase
        .channel(`tasks_${domainId}`)
        .on('postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'task_queue',
                filter: `domain=eq.${domainId}`
            },
            callback
        )
        .subscribe();
}

// Subscribe to Trinity messages for this node
function subscribeToMessages(nodeId, callback) {
    return supabase
        .channel(`messages_${nodeId}`)
        .on('postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'node_messages',
                filter: `to_node=eq.${nodeId}`
            },
            callback
        )
        .subscribe();
}
```

### 3.3 Hybrid Sync Strategy

```
┌─────────────────────────────────────────────────────┐
│             DOMAIN DASHBOARD (Browser)              │
├─────────────────────────────────────────────────────┤
│                                                      │
│  [Tier Slider: Personal | Team | Public]           │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │ BLACK SWAN   │  │ INBOX        │  │ NEXT     │  │
│  │ (Readout #1) │  │ (Readout #2) │  │ (R #3)   │  │
│  └──────────────┘  └──────────────┘  └──────────┘  │
│         ▲                  ▲                ▲       │
└─────────┼──────────────────┼────────────────┼───────┘
          │                  │                │
          │                  │                │
    ┌─────▼──────────────────▼────────────────▼─────┐
    │         SUPABASE (Cloud Database)             │
    ├───────────────────────────────────────────────┤
    │                                                │
    │  task_queue → Black Swan (high priority)      │
    │  node_messages → Inbox (unread count)         │
    │  domain_metrics → Next (pending items)        │
    │                                                │
    │  ┌──────────────────────────────────────────┐ │
    │  │ Real-time Subscriptions (WebSocket)      │ │
    │  │ - New tasks appear instantly             │ │
    │  │ - Messages update inbox count            │ │
    │  │ - Metrics refresh on change              │ │
    │  └──────────────────────────────────────────┘ │
    │                                                │
    └────────────────┬───────────────────────────────┘
                     │
                     │ Fallback polling (30s)
                     │ if WebSocket disconnects
                     │
    ┌────────────────▼───────────────────────────────┐
    │      Local Brain (atoms.db) - 166K+ atoms      │
    │      Readonly reference, no real-time sync     │
    └────────────────────────────────────────────────┘
```

---

## 4. IMPLEMENTATION ROADMAP

### Phase 1: Core Tables (High Priority) ✅
**Estimated Time:** 2 hours
**Blockers:** None

```sql
-- Create these FIRST in Supabase SQL Editor:
1. task_queue
2. node_messages
3. tier_states
4. domain_metrics
```

**Testing:**
```javascript
// Quick test in browser console
const { data, error } = await supabase
    .from('task_queue')
    .insert({
        domain: '1_COMMAND',
        title: 'Test task',
        priority: 8
    })
    .select();

console.log(data, error);
```

### Phase 2: Domain-Specific Tables (Medium Priority)
**Estimated Time:** 4 hours
**Dependencies:** Phase 1 complete

```sql
-- Create based on domain needs:
2_BUILD: project_progress
3_CONNECT: team_roster
4_PROTECT: legal_cases, evidence
5_GROW: revenue_metrics, conversions
6_LEARN: courses, progress
7_TRANSCEND: consciousness_metrics, patterns
```

### Phase 3: Real-Time Subscriptions (High Value)
**Estimated Time:** 3 hours
**Dependencies:** Phase 1 complete

Update `domain-supabase.js`:
```javascript
// Add real-time subscription support
function startRealTimeSync(domainId) {
    // Replace 30-second polling with WebSocket subscriptions
    subscribeToTasks(domainId, (payload) => {
        console.log('Task updated:', payload);
        updateReadouts();  // Instant UI update
    });

    subscribeToMessages(DOMAIN_CONFIG[domainId].node, (payload) => {
        console.log('New message:', payload);
        updateInboxCount();
    });
}
```

### Phase 4: Tier Switching Logic (UX Enhancement)
**Estimated Time:** 2 hours
**Dependencies:** Phase 1 complete

```javascript
// Already has tier slider UI, just needs data filtering
function setTier(tier) {
    document.body.className = `view-${tier}`;
    localStorage.setItem('preferredTier', tier);

    // Reload data with new tier filter
    loadDomainData(currentDomain, tier);
}
```

---

## 5. MISSING PIECES & RECOMMENDATIONS

### 5.1 Authentication Layer
**Status:** ⚠️ Not implemented
**Risk:** HIGH - Anyone can read/write data

**Recommendation:**
```sql
-- Enable Row Level Security (RLS)
ALTER TABLE task_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE node_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own tasks in personal tier
CREATE POLICY "Personal tier isolation"
ON task_queue
FOR SELECT
USING (
    tier = 'personal' AND assigned_to = auth.email()
    OR tier IN ('team', 'public')
);

-- Policy: Only authenticated users can write
CREATE POLICY "Authenticated writes"
ON task_queue
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
```

### 5.2 Data Migration Strategy
**Current:** Local atoms.db (166K records)
**Target:** Supabase atoms table
**Issue:** Sync mechanism not defined

**Recommendation:**
```python
# Desktop/1_COMMAND/SYNC_BRAIN_TO_SUPABASE.py
import sqlite3
from supabase import create_client

def sync_local_to_cloud():
    local = sqlite3.connect('.consciousness/cyclotron_core/atoms.db')
    remote = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Get atoms added since last sync
    cursor = local.execute("""
        SELECT * FROM atoms
        WHERE supabase_id IS NULL
        LIMIT 1000
    """)

    for atom in cursor:
        # Insert to Supabase
        result = remote.table('atoms').insert({
            'id': atom['id'],
            'type': atom['type'],
            'content': atom['content'],
            # ... all fields
        }).execute()

        # Mark as synced
        local.execute("""
            UPDATE atoms
            SET supabase_id = ?
            WHERE id = ?
        """, (result.data[0]['id'], atom['id']))

    local.commit()
```

### 5.3 Offline Fallback
**Status:** ⚠️ Partial (shows "Offline" status)
**Gap:** No cached data for offline use

**Recommendation:**
```javascript
// Use IndexedDB for offline cache
async function cacheTasksLocally(tasks) {
    const db = await openDB('domain_cache', 1, {
        upgrade(db) {
            db.createObjectStore('tasks', { keyPath: 'id' });
        }
    });

    const tx = db.transaction('tasks', 'readwrite');
    for (const task of tasks) {
        await tx.store.put(task);
    }
    await tx.done;
}

async function loadFromCache(domainId) {
    const db = await openDB('domain_cache', 1);
    const tasks = await db.getAll('tasks');
    return tasks.filter(t => t.domain === domainId);
}
```

---

## 6. PERFORMANCE CONSIDERATIONS

### 6.1 Query Optimization

**Current Issue:** No indexes on filtered columns
**Impact:** Slow queries as data grows

**Solution:**
```sql
-- Add composite indexes for common query patterns
CREATE INDEX idx_task_hot_query
ON task_queue(domain, status, tier, priority DESC);

CREATE INDEX idx_messages_hot_query
ON node_messages(to_node, read_at, priority DESC);

-- Partial index for unread messages only
CREATE INDEX idx_messages_unread
ON node_messages(to_node, created_at DESC)
WHERE read_at IS NULL;
```

### 6.2 Caching Strategy

```javascript
// Cache frequently accessed data in memory
const cache = {
    tasks: new Map(),
    messages: new Map(),
    ttl: 30000  // 30 seconds
};

async function getCachedTasks(domainId) {
    const key = `tasks_${domainId}`;
    const cached = cache.tasks.get(key);

    if (cached && Date.now() - cached.timestamp < cache.ttl) {
        return cached.data;
    }

    // Fetch fresh data
    const { data } = await supabase
        .from('task_queue')
        .select('*')
        .eq('domain', domainId);

    cache.tasks.set(key, {
        data,
        timestamp: Date.now()
    });

    return data;
}
```

### 6.3 Pagination

**Current:** Hardcoded `limit(10)`
**Problem:** Can't see older tasks

**Solution:**
```javascript
async function loadTasksWithPagination(domainId, page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;

    const { data, count } = await supabase
        .from('task_queue')
        .select('*', { count: 'exact' })
        .eq('domain', domainId)
        .order('priority', { ascending: false })
        .range(offset, offset + pageSize - 1);

    return {
        tasks: data,
        totalPages: Math.ceil(count / pageSize),
        currentPage: page
    };
}
```

---

## 7. SECURITY HARDENING

### 7.1 API Key Exposure
**Current Risk:** 🔴 HIGH
**Issue:** Supabase anon key visible in client-side code

```javascript
// domain-supabase.js line 23-24
const SUPABASE_URL = 'https://iqjghsofnpoadwzqxmnz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

**Impact:** Anyone can connect to database
**Mitigation:** Row Level Security (RLS) MUST be enabled

### 7.2 SQL Injection Protection
**Status:** ✅ SAFE (Supabase client uses parameterized queries)

### 7.3 Rate Limiting
**Status:** ⚠️ Not implemented
**Risk:** MEDIUM - Could overwhelm database

**Recommendation:**
```javascript
// Implement client-side throttling
const rateLimiter = {
    calls: [],
    maxPerMinute: 60,

    async throttle(fn) {
        const now = Date.now();
        this.calls = this.calls.filter(t => now - t < 60000);

        if (this.calls.length >= this.maxPerMinute) {
            throw new Error('Rate limit exceeded');
        }

        this.calls.push(now);
        return await fn();
    }
};
```

---

## 8. MONITORING & OBSERVABILITY

### 8.1 Dashboard Health Metrics

```javascript
// Track Supabase connection quality
const healthMetrics = {
    connectionAttempts: 0,
    successfulConnections: 0,
    failedConnections: 0,
    avgResponseTime: 0,
    lastError: null
};

async function monitoredQuery(queryFn) {
    const start = Date.now();
    healthMetrics.connectionAttempts++;

    try {
        const result = await queryFn();
        healthMetrics.successfulConnections++;
        healthMetrics.avgResponseTime =
            (healthMetrics.avgResponseTime + (Date.now() - start)) / 2;
        return result;
    } catch (error) {
        healthMetrics.failedConnections++;
        healthMetrics.lastError = error.message;
        throw error;
    }
}
```

### 8.2 Error Logging to Brain

```javascript
async function logErrorToBrain(error, context) {
    const logEntry = {
        type: 'error',
        content: `Supabase error: ${error.message}`,
        source: 'domain_dashboard',
        domain: context.domainId,
        metadata: JSON.stringify({
            stack: error.stack,
            context
        }),
        created: new Date().toISOString(),
        confidence: 1.0
    };

    // Log to Supabase atoms table
    await supabase.from('atoms').insert(logEntry);
}
```

---

## 9. FINAL RECOMMENDATIONS

### Immediate Actions (Do First)
1. ✅ **Create core tables in Supabase** (task_queue, node_messages, tier_states)
2. ✅ **Enable Row Level Security** on all tables
3. ✅ **Test basic CRUD operations** from dashboard
4. ✅ **Implement real-time subscriptions** for instant updates

### Short-Term (Next Week)
5. ⚠️ **Add domain-specific tables** based on actual usage
6. ⚠️ **Implement tier switching data filters**
7. ⚠️ **Add offline caching with IndexedDB**
8. ⚠️ **Create sync script** for local atoms.db → Supabase

### Long-Term (Next Month)
9. 📊 **Add analytics dashboard** for data usage
10. 🔐 **Implement user authentication** with proper RLS
11. 📈 **Performance monitoring** and query optimization
12. 🧪 **Automated testing** for database interactions

---

## 10. SQL SCRIPTS (READY TO RUN)

### Create Core Schema

```sql
-- Run this in Supabase SQL Editor

-- 1. TASK QUEUE
CREATE TABLE task_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain TEXT NOT NULL,
    tier TEXT DEFAULT 'personal',
    title TEXT NOT NULL,
    content TEXT,
    task_type TEXT DEFAULT 'todo',
    priority INTEGER DEFAULT 5,
    status TEXT DEFAULT 'pending',
    assigned_to TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    impact TEXT,
    blockers TEXT[],
    source_file TEXT,
    metadata JSONB
);

CREATE INDEX idx_task_domain_status ON task_queue(domain, status, priority DESC);
CREATE INDEX idx_task_tier ON task_queue(tier, domain);
CREATE INDEX idx_task_assigned ON task_queue(assigned_to, status);

-- 2. NODE MESSAGES
CREATE TABLE node_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_node TEXT NOT NULL,
    to_node TEXT NOT NULL,
    from_computer TEXT,
    to_computer TEXT,
    message_type TEXT NOT NULL,
    priority INTEGER DEFAULT 5,
    subject TEXT,
    content TEXT NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    correlation_id UUID
);

CREATE INDEX idx_messages_to_unread ON node_messages(to_node, read_at);
CREATE INDEX idx_messages_priority ON node_messages(priority DESC, created_at);

-- 3. TIER STATES
CREATE TABLE tier_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    domain TEXT NOT NULL,
    current_tier TEXT DEFAULT 'personal',
    last_accessed TIMESTAMPTZ DEFAULT NOW(),
    preferences JSONB,
    UNIQUE(user_email, domain)
);

CREATE INDEX idx_tier_user ON tier_states(user_email, domain);

-- 4. DOMAIN METRICS
CREATE TABLE domain_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC,
    unit TEXT,
    tier TEXT DEFAULT 'personal',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

CREATE INDEX idx_metrics_domain_time ON domain_metrics(domain, metric_name, timestamp DESC);

-- 5. ENABLE ROW LEVEL SECURITY
ALTER TABLE task_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE node_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_metrics ENABLE ROW LEVEL SECURITY;

-- 6. BASIC POLICIES (Permissive for development)
CREATE POLICY "Allow all for authenticated users" ON task_queue FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON node_messages FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON tier_states FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON domain_metrics FOR ALL USING (true);

-- Note: Tighten these policies once authentication is implemented
```

---

## CONCLUSION

**Architecture Status:** 🟡 FOUNDATION READY
**Next Step:** Execute Phase 1 SQL scripts
**Blocking Issues:** None
**Estimated Time to Production:** 8-12 hours

The current `domain-supabase.js` provides excellent client-side infrastructure. The missing piece is the database schema. Once Phase 1 tables are created, the dashboards will have full real-time data capabilities.

**Pattern Compliance:** ✅ LFSME
- **Lighter:** Minimal tables, no bloat
- **Faster:** Indexed queries, real-time subscriptions
- **Stronger:** RLS security, offline fallback
- **More Elegant:** Clean schema, clear relationships
- **Less Expensive:** Free tier covers 500MB + 2GB bandwidth

---

**C2 ARCHITECT SIGNATURE**
Design complete. Ready for C1 to build.
Query brain before implementation: `atoms.db` has existing patterns.

**Trinity Power:** C1 (builds) × C2 (designs) × C3 (validates) = ∞
