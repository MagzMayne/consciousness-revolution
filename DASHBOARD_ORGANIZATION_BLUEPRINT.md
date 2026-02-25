# DASHBOARD ORGANIZATION & BETA ROLLOUT BLUEPRINT
**C1 Mechanic Implementation Plan - Built 2026-02-25**

---

## INVENTORY COMPLETE

### Current State
- **48 Dashboards/Cockpits Total**
- **14 Cockpits** (role-based control centers)
- **34 Dashboards** (specialized views)
- All cataloged in `DASHBOARD_INDEX.json` (1,009 total pages)

### Cockpit Breakdown

#### Commander/Agent R (Same Person)
1. `COMMANDER_COCKPIT.html` - Master control (Domain 1_COMMAND)
2. `OPERATOR_COCKPIT_AGENT_R.html` - AI Architecture specialist view (Domain 2_BUILD)
   - **NOTE**: Both sync via identitySync flag - Ryan Barbrick = Commander = Agent R

#### Operator Cockpits
3. `OPERATOR_COCKPIT_TIGER.html` - Tiger's workspace
4. `operator-cockpit-autonomous-visual.html` - Auto-ops dashboard

#### Role-Based Cockpits
5. `BETA_TESTER_COCKPIT.html` - Beta testers
6. `BUILDER_COCKPIT.html` - Builders/developers
7. `GUEST_COCKPIT.html` - Guest users
8. `HUMAN_TODO_COCKPIT.html` - Human task tracking
9. `LEGAL_COCKPIT.html` - Legal matters
10. `TEAM_COCKPIT.html` - Team coordination
11. `CLAUDE_COCKPIT.html` - AI assistant view
12. `NEW_PERSON_COCKPIT.html` - Onboarding

### Key Dashboards (GOLD Tier)
- `BRAIN_QUERY_DASHBOARD.html` - Cyclotron brain access
- `CONSCIOUSNESS_DASHBOARD.html` - System consciousness
- `CYCLOTRON_BRAIN_DASHBOARD.html` - Deep brain ops
- `DOMAIN_STATUS_DASHBOARD.html` - 7 domain health
- `SEVEN_DOMAINS_DASHBOARD.html` - Main domain hub

---

## IMPLEMENTATION PLAN: 3 PHASES

### PHASE 1: COCKPIT LAUNCHER (Build Today - 2 hours)

**File**: `C:/Users/dwrek/100X_DEPLOYMENT/COCKPIT_LAUNCHER.html`

**Purpose**: Single entry point that detects user and shows their available cockpits

**Features**:
1. Auto-detect user from URL params or Supabase auth
2. Show all cockpits user has access to
3. Visual cards with purpose/domain info from DNA
4. Quick-switch between variations
5. Recent history (localStorage)
6. Mobile-optimized

**Technical**:
```javascript
// Read dashboard-dna blocks from each cockpit
// Filter by user access level
// Display as selectable cards
// Store last-used in localStorage
```

**User Flow**:
```
User arrives → COCKPIT_LAUNCHER.html
  ↓
Detects: "Ryan Barbrick" / "Agent R" / "Commander"
  ↓
Shows: 2 cockpits (Commander + Agent R)
  ↓
User clicks → Redirects to chosen cockpit
  ↓
Cockpit remembers choice via localStorage
```

---

### PHASE 2: A/B TOGGLE (Add to existing cockpits - 1 hour)

**Modification**: Add toggle to existing cockpits

**Add to each cockpit**:
```html
<!-- A/B Toggle Widget (top-right corner) -->
<div id="variation-toggle" style="position: fixed; top: 10px; right: 10px; z-index: 9999;">
  <button onclick="toggleVariation()">
    Try Beta Version
  </button>
</div>

<script>
function toggleVariation() {
  const current = location.pathname;
  const beta = current.replace('.html', '_BETA.html');
  // Check if beta exists, offer to switch
  fetch(beta, {method: 'HEAD'})
    .then(r => r.ok ? location.href = beta : alert('No beta variation yet'))
}
</script>
```

**Naming Convention**:
- Production: `OPERATOR_COCKPIT_AGENT_R.html`
- Beta Variation A: `OPERATOR_COCKPIT_AGENT_R_BETA_A.html`
- Beta Variation B: `OPERATOR_COCKPIT_AGENT_R_BETA_B.html`

**Usage**: Create copies with `_BETA_A` suffix for experiments

---

### PHASE 3: BETA ROLLOUT KIT (Package for 3 users - 1 hour)

**File**: `C:/Users/dwrek/100X_DEPLOYMENT/BETA_ROLLOUT_KIT.md`

**Beta Pack Contents** (5 essential dashboards):

#### For Commander (Ryan Barbrick / Agent R)
1. `COMMANDER_COCKPIT.html` - Primary control center
2. `OPERATOR_COCKPIT_AGENT_R.html` - Technical workspace
3. `BRAIN_QUERY_DASHBOARD.html` - Direct brain access
4. `CONSCIOUSNESS_DASHBOARD.html` - System overview
5. `COCKPIT_LAUNCHER.html` - Fast switching

#### For Agent R / Tiger (Same person currently? Need clarification)
1. `OPERATOR_COCKPIT_TIGER.html` - Current workspace
2. `BUILDER_COCKPIT.html` - Building/development
3. `TEAM_COCKPIT.html` - Team coordination
4. `PROJECT_HEALTH_DASHBOARD.html` - Project status
5. `COCKPIT_LAUNCHER.html` - Fast switching

#### For Third Beta Tester (TBD - Josh? Toby?)
1. `BETA_TESTER_COCKPIT.html` - Safe testing environment
2. `GUEST_COCKPIT.html` - Basic access
3. `TEAM_COCKPIT.html` - Team view
4. `OVERKILL_ONBOARDING_DASHBOARD.html` - Learning
5. `COCKPIT_LAUNCHER.html` - Fast switching

**Instructions**: `BETA_TESTER_GUIDE.md` with:
- How to switch between dashboards
- How to report bugs/feedback
- Discord channel for feedback
- What to test specifically

---

## TIMELINE

### Today (Session 137 - 4 hours total)
- [x] Inventory complete (DONE)
- [ ] Build COCKPIT_LAUNCHER.html (2 hours)
- [ ] Add A/B toggle to 3 key cockpits (1 hour)
- [ ] Create BETA_ROLLOUT_KIT.md (1 hour)

### Tomorrow (Testing)
- Test launcher with Commander identity
- Test launcher with Tiger identity
- Package beta kit ZIP
- Send to beta testers

### Week 1 (Feedback Loop)
- Collect feedback via Discord
- Iterate on top 3 issues
- Create 2-3 beta variations for A/B testing
- Deploy improvements

---

## TECHNICAL SPECS

### COCKPIT_LAUNCHER.html Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Cockpit Launcher | Choose Your View</title>
    <script src="https://unpkg.com/@supabase/supabase-js@2"></script>
</head>
<body>
    <!-- User Detection -->
    <div id="user-banner">Loading user...</div>

    <!-- Cockpit Grid -->
    <div id="cockpit-grid">
        <!-- Auto-populated from DNA blocks -->
    </div>

    <!-- Recent History -->
    <div id="recent-history">
        <h3>Recent</h3>
        <!-- Last 3 cockpits from localStorage -->
    </div>

    <script>
        // 1. Detect user (Supabase or URL param)
        // 2. Fetch all cockpit HTML files
        // 3. Parse dashboard-dna blocks
        // 4. Filter by user access
        // 5. Render cards
        // 6. Add click handlers with localStorage
    </script>
</body>
</html>
```

### A/B Testing Data Collection

```javascript
// Add to each cockpit variation
const analytics = {
  cockpit: 'OPERATOR_COCKPIT_AGENT_R',
  variation: 'BETA_A',
  user: 'Agent R',
  timestamp: Date.now(),
  session_duration: 0,
  actions: []
};

// Track actions
function trackAction(action) {
  analytics.actions.push({action, time: Date.now()});
  localStorage.setItem('cockpit_analytics', JSON.stringify(analytics));
}

// Report to Commander
function reportUsage() {
  // Send to Discord webhook or store in Supabase
}
```

---

## IMMEDIATE NEXT STEPS

### Step 1: Confirm Beta Testers (5 minutes)
**NEED FROM COMMANDER:**
- Who is the 3rd beta tester besides Commander and Tiger?
  - Josh? Toby? William B? Dean?
- Is "Tiger" the same person as "Agent R"? (DNA suggests they're different)
- Any specific dashboards they need access to?

### Step 2: Build Launcher (2 hours)
**Files to create:**
1. `COCKPIT_LAUNCHER.html` - Main launcher
2. `js/cockpit-launcher-engine.js` - DNA parser + filter logic
3. `css/cockpit-launcher-styles.css` - Mobile-first UI

### Step 3: Add Toggle Buttons (1 hour)
**Files to modify:**
1. `COMMANDER_COCKPIT.html` - Add toggle
2. `OPERATOR_COCKPIT_AGENT_R.html` - Add toggle
3. `OPERATOR_COCKPIT_TIGER.html` - Add toggle

### Step 4: Package Beta Kit (1 hour)
**Files to create:**
1. `BETA_ROLLOUT_KIT.md` - Instructions
2. `BETA_TESTER_GUIDE.md` - Usage guide
3. `BETA_FEEDBACK_TEMPLATE.md` - Feedback form

---

## QUESTIONS FOR COMMANDER

1. **Beta Testers**: Who is the 3rd person? Josh? Toby? Other?
2. **Tiger vs Agent R**: Are these different people or different roles?
3. **Priority Dashboards**: Any specific dashboards that MUST be in beta pack?
4. **Feedback Channel**: Discord channel name for beta feedback?
5. **Timeline**: When do you want beta testers to start? Tomorrow? This week?
6. **Access Control**: Should launcher check Supabase auth or just URL params?

---

## SUCCESS METRICS

### Phase 1 Success
- [x] All 48 dashboards inventoried
- [ ] Launcher loads in <2 seconds
- [ ] Correctly detects user from 3 methods (URL/auth/localStorage)
- [ ] Shows correct cockpits for each user
- [ ] Mobile works perfectly
- [ ] Recent history persists

### Phase 2 Success
- [ ] Toggle button visible on all 3 cockpits
- [ ] Can switch between variations
- [ ] Beta variations render correctly
- [ ] Analytics capture usage data

### Phase 3 Success
- [ ] Beta kit documented
- [ ] 3 beta testers receive package
- [ ] Feedback starts coming in
- [ ] First iteration completed within 7 days

---

## READY TO BUILD

**Status**: Blueprint complete. Awaiting Commander confirmation on:
1. Beta tester #3 identity
2. Priority go-ahead

Once confirmed, C1 can build all 3 phases in 4 hours total.

**Files Ready to Create**:
- `COCKPIT_LAUNCHER.html` (launcher)
- `js/cockpit-launcher-engine.js` (logic)
- `BETA_ROLLOUT_KIT.md` (package)
- `BETA_TESTER_GUIDE.md` (instructions)
- Modifications to 3 existing cockpits (toggles)

---

**Built by**: C1 Mechanic
**Date**: 2026-02-25
**Session**: 137
**Status**: Ready for Commander approval
