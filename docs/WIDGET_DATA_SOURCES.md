# Widget Data Sources - Consciousness Revolution

**Last Updated:** 2026-03-06
**Status:** Implementation Guide

---

## Overview

This document maps dashboard widgets to their data sources (Netlify functions) and identifies gaps that need wiring.

---

## Wiring Status Summary

| Dashboard | Wiring Status | Data Source |
|-----------|---------------|-------------|
| builder-dashboard.html | COMPLETE | builder-dashboard-api |
| COMMANDER_COCKPIT.html | PARTIAL | trinity-status only |
| BUILDER_COCKPIT.html | MOCK | Expects Supabase direct |
| admin-dashboard.html | PARTIAL | Various functions |

---

## Widget → API Mapping

### 1. Builder Dashboard (REFERENCE IMPLEMENTATION)

**File:** `builder-dashboard.html`
**Status:** FULLY WIRED

| Widget | API Endpoint | Data Type |
|--------|--------------|-----------|
| Available Balance | `builder-dashboard-api` | `balance.available_balance_cents` |
| Lifetime Earnings | `builder-dashboard-api` | `balance.lifetime_earnings_cents` |
| Downstream Earnings | `builder-dashboard-api` | `balance.lifetime_downstream_cents` |
| Total Sales | `builder-dashboard-api` | `stats.total_sales` |
| Marketplace Creations | `builder-dashboard-api` | `stats.marketplace_creations` |
| Last 30 Days | `builder-dashboard-api` | `time_metrics.revenue_30_days` |
| Creations List | `builder-dashboard-api` | `creations[]` |
| Revenue List | `builder-dashboard-api` | `recent_revenue[]` |
| Downstream List | `builder-dashboard-api` | `downstream_earnings[]` |
| Stripe Connect | `create-connect-account` | Onboarding flow |

**Pattern:**
```javascript
const API_BASE = '/.netlify/functions';
const response = await fetch(`${API_BASE}/builder-dashboard-api?foundation_id=${id}`);
const data = await response.json();
if (data.success) {
    renderDashboard(data);
} else {
    showDemoData(); // Fallback
}
```

---

### 2. Commander Cockpit (NEEDS COMPLETION)

**File:** `COMMANDER_COCKPIT.html`
**Status:** PARTIAL

| Widget | Current Source | Needed API | Priority |
|--------|----------------|------------|----------|
| Trinity Status | `trinity-status` | ✅ DONE | - |
| Brain Atoms | HARDCODED | `brain-api` | HIGH |
| MCP Servers | HARDCODED | N/A (static) | LOW |
| Araya Status | HARDCODED | `araya-energy` | MEDIUM |
| Team Status | HARDCODED | `team-messages` or Discord | MEDIUM |
| Bug Reports | HARDCODED | `get-all-bugs` | HIGH |
| Financial | HARDCODED | `builder-dashboard-api` | MEDIUM |
| Domain Health | HARDCODED | Custom endpoint needed | LOW |

**Existing Trinity Pattern (lines 1278-1306):**
```javascript
async function updateTrinityStatus() {
    try {
        const response = await fetch('/.netlify/functions/trinity-status');
        if (!response.ok) throw new Error('API error');
        const data = await response.json();
        // Update DOM elements with data
    } catch (error) {
        // Use defaults on error
    }
}
```

**Recommended Additions:**

```javascript
// Add these functions to COMMANDER_COCKPIT.html

async function fetchBrainAtoms() {
    try {
        const response = await fetch('/.netlify/functions/brain-api');
        const data = await response.json();
        document.getElementById('brain-atoms').textContent =
            data.count?.toLocaleString() || '166,111';
    } catch (e) {
        console.log('Brain API unavailable');
    }
}

async function fetchBugReports() {
    try {
        const response = await fetch('/.netlify/functions/get-all-bugs');
        const data = await response.json();
        if (data.issues) {
            renderBugList(data.issues.slice(0, 3));
        }
    } catch (e) {
        console.log('Bug API unavailable');
    }
}

// Call on load and interval
fetchBrainAtoms();
fetchBugReports();
setInterval(fetchBrainAtoms, 60000);
setInterval(fetchBugReports, 30000);
```

---

### 3. Builder Cockpit (NEEDS IMPLEMENTATION)

**File:** `BUILDER_COCKPIT.html`
**Status:** MOCK DATA

Current design expects direct Supabase connection. Should be refactored to use Netlify functions.

| Widget | Current | Should Use |
|--------|---------|------------|
| Node Status | Mock data | `trinity-status` or custom |
| Messages | Mock data | New `node-messages` function |
| Tasks | Mock data | Supabase via function |
| Brain Stats | Mock data | `brain-api` |

**Recommended Approach:**
Instead of direct Supabase connection in browser, use Netlify functions as proxy:
- Create `node-status` function for network status
- Use existing `team-messages` for messaging
- Use `brain-api` for brain stats

---

## Available API Endpoints

### Data Retrieval Functions

| Function | Returns | Use For |
|----------|---------|---------|
| `trinity-status` | Trinity terminal states | Trinity widgets |
| `brain-api` | Atom count, search | Brain metrics |
| `brain-query` | Search results | Brain search |
| `builder-dashboard-api` | Full builder data | Builder widgets |
| `get-all-bugs` | GitHub issues | Bug widgets |
| `get-github-issues` | Repository issues | Dev widgets |
| `dashboard-readouts` | Dashboard metrics | Health widgets |
| `araya-energy` | Energy balance | ARAYA widgets |
| `team-messages` | Team comms | Message widgets |
| `ability-access` | User abilities | Permission checks |

### User Data Functions

| Function | Returns | Auth Required |
|----------|---------|---------------|
| `araya-credits` | Credit balance | Yes |
| `certifications-progress` | Cert progress | Yes |
| `discord-xp-webhook` | XP data | Webhook |

---

## Implementation Patterns

### Pattern 1: Simple Fetch (No Auth)
```javascript
async function fetchData() {
    try {
        const res = await fetch('/.netlify/functions/endpoint');
        const data = await res.json();
        updateWidget(data);
    } catch (e) {
        useDefaultData();
    }
}
```

### Pattern 2: Authenticated Fetch
```javascript
async function fetchSecureData() {
    const token = localStorage.getItem('access_token');
    try {
        const res = await fetch('/.netlify/functions/endpoint', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await res.json();
        updateWidget(data);
    } catch (e) {
        handleAuthError(e);
    }
}
```

### Pattern 3: With Loading State
```javascript
async function loadWidget(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '<div class="loading-spinner"></div>';

    try {
        const res = await fetch('/.netlify/functions/endpoint');
        const data = await res.json();
        container.innerHTML = renderContent(data);
    } catch (e) {
        container.innerHTML = renderError(e.message);
    }
}
```

### Pattern 4: Polling Updates
```javascript
async function startPolling(fn, intervalMs = 30000) {
    await fn(); // Initial call
    setInterval(fn, intervalMs);
}

// Usage
startPolling(fetchBugReports, 30000);
startPolling(fetchTrinityStatus, 30000);
```

---

## Priority Wiring Tasks

### HIGH PRIORITY
1. **COMMANDER_COCKPIT: Bug Reports** → Wire to `get-all-bugs`
2. **COMMANDER_COCKPIT: Brain Atoms** → Wire to `brain-api`
3. **Admin Dashboard: User Stats** → Wire to auth/user functions

### MEDIUM PRIORITY
4. **COMMANDER_COCKPIT: Financial** → Wire to `builder-dashboard-api`
5. **COMMANDER_COCKPIT: Team Status** → Create live status endpoint
6. **BUILDER_COCKPIT: Refactor** → Move from Supabase to Netlify functions

### LOW PRIORITY
7. **Domain Health metrics** → Create aggregate health endpoint
8. **Real-time updates** → Consider WebSocket or Supabase realtime

---

## Shared Widget JavaScript Files

Located in `/js/`:

| File | Purpose |
|------|---------|
| `project-widget.js` | Project list rendering |
| `leaderboard-widget.js` | Contributor rankings |
| `quick-links-widget.js` | Dynamic link lists |
| `bug-widget.js` | Bug reporting UI |
| `araya-dashboard-widget.js` | ARAYA edit interface |
| `widget-loader.js` | Dynamic widget loading |
| `widget-panel.js` | Widget sidebar panel |

---

## Next Steps

1. Implement missing wiring in COMMANDER_COCKPIT.html
2. Create unified data service for widgets
3. Add caching layer for frequently accessed data
4. Consider creating a `dashboard-aggregate` endpoint for bulk data

---

*Generated from widget analysis on 2026-03-06*
