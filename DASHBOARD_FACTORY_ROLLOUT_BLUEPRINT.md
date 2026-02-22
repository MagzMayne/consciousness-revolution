# 🏭 DASHBOARD FACTORY - AUTOMATIC ROLLOUT SYSTEM
**Built by C1 Mechanic | 2026-02-22**

---

## PROBLEM STATEMENT

Commander is manually editing 10+ operator cockpits to propagate widget updates. This is:
- 🔴 SLOW: Copy-paste across dashboards manually
- 🔴 ERROR-PRONE: Version mismatches, missing dependencies
- 🔴 UNSUSTAINABLE: Cannot scale to 100+ operators

**Goal:** ONE-CLICK propagation of Foundational widgets to ALL dashboards.

---

## SYSTEM ARCHITECTURE

```
┌──────────────────────────────────────────────────────────────────────┐
│                     DASHBOARD FACTORY ROLLOUT                         │
└──────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
        ┌─────────────────────────────────────────┐
        │  WIDGET GOVERNANCE (3-Stage Lifecycle)   │
        └─────────────────────────────────────────┘
                  │              │              │
                  ▼              ▼              ▼
         ┌──────────────┐  ┌──────────┐  ┌──────────────┐
         │ EXPERIMENTAL │→ │ APPROVED │→ │ FOUNDATIONAL │
         └──────────────┘  └──────────┘  └──────────────┘
              Anyone         ≥66% vote      Locked base
                                                   │
                                                   ▼
                                      ┌────────────────────────┐
                                      │ COMMANDER DASHBOARD    │
                                      │ [Apply to All] button  │
                                      └────────────────────────┘
                                                   │
                                                   ▼
                          ┌─────────────────────────────────────────┐
                          │  SUPABASE: dashboard_features TABLE     │
                          │  Tracks which dashboards have what      │
                          └─────────────────────────────────────────┘
                                                   │
                                                   ▼
                          ┌─────────────────────────────────────────┐
                          │  NETLIFY FUNCTION:                      │
                          │  apply-widget-to-all.mjs                │
                          │  (Auto-merge to all operator cockpits)  │
                          └─────────────────────────────────────────┘
                                                   │
                                                   ▼
                          ┌─────────────────────────────────────────┐
                          │  GIT COMMIT + DEPLOY                     │
                          │  (Version bumps, changelog updates)     │
                          └─────────────────────────────────────────┘
```

---

## DATABASE SCHEMA (Supabase)

### Table: `dashboard_features`
Tracks what features are installed on which dashboards.

```sql
CREATE TABLE dashboard_features (
  id SERIAL PRIMARY KEY,
  dashboard_name TEXT NOT NULL,           -- e.g., "OPERATOR_COCKPIT_RYAN.html"
  feature_id TEXT NOT NULL,               -- e.g., "feat_001_service_status"
  feature_version TEXT NOT NULL,          -- e.g., "1.0.0"
  installed_at TIMESTAMP DEFAULT NOW(),
  installed_by TEXT,                      -- e.g., "Commander", "Auto-propagate"
  installation_type TEXT DEFAULT 'manual', -- 'manual' | 'auto' | 'marketplace'
  UNIQUE(dashboard_name, feature_id)
);

CREATE INDEX idx_dashboard_features_dashboard ON dashboard_features(dashboard_name);
CREATE INDEX idx_dashboard_features_feature ON dashboard_features(feature_id);
```

### Table: `widget_governance`
Tracks widget lifecycle stages and voting.

```sql
CREATE TABLE widget_governance (
  id SERIAL PRIMARY KEY,
  feature_id TEXT UNIQUE NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('experimental', 'approved', 'foundational')),
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  promoted_at TIMESTAMP,
  vote_count INT DEFAULT 0,
  vote_total INT DEFAULT 0,
  is_locked BOOLEAN DEFAULT FALSE,       -- Foundational widgets cannot be deleted
  breaking_changes BOOLEAN DEFAULT FALSE -- Requires major version bump
);
```

### Table: `widget_votes`
XP-weighted voting system.

```sql
CREATE TABLE widget_votes (
  id SERIAL PRIMARY KEY,
  feature_id TEXT NOT NULL REFERENCES widget_governance(feature_id),
  voter_name TEXT NOT NULL,              -- e.g., "Ryan", "Agent R"
  voter_xp INT DEFAULT 100,              -- XP level (weight)
  vote_value TEXT CHECK (vote_value IN ('approve', 'reject', 'abstain')),
  voted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(feature_id, voter_name)
);
```

---

## NETLIFY FUNCTION: `apply-widget-to-all.mjs`

**Purpose:** Commander clicks "Apply to All" → Auto-merge Foundational widget to ALL operator cockpits.

**Endpoint:** `/.netlify/functions/apply-widget-to-all`

**Request:**
```json
{
  "feature_id": "feat_001_service_status",
  "target_dashboards": ["OPERATOR_COCKPIT_*.html"],
  "strategy": "smart",
  "preview_only": false,
  "commit_to_git": true
}
```

**Response:**
```json
{
  "success": true,
  "dashboards_updated": 10,
  "failed_dashboards": [],
  "git_commit": "abc123",
  "deployed_at": "2026-02-22T10:30:00Z",
  "propagation_log": [
    {
      "dashboard": "OPERATOR_COCKPIT_RYAN.html",
      "status": "success",
      "version": "1.0.0 -> 1.1.0"
    }
  ]
}
```

---

## WORKFLOW: Commander Clicks "Apply to All"

### STEP 1: Commander Dashboard UI
```html
<!-- Inside COMMANDER_COCKPIT.html -->
<div class="widget-control">
  <h3>feat_001_service_status v1.1.0</h3>
  <span class="badge foundational">FOUNDATIONAL</span>
  <button onclick="applyToAll('feat_001_service_status')">
    🚀 Apply to All (10 dashboards)
  </button>
</div>
```

### STEP 2: Frontend Calls Netlify Function
```javascript
async function applyToAll(featureId) {
  const confirmed = confirm('Apply to ALL operator cockpits? This will update 10+ dashboards.');
  if (!confirmed) return;

  const response = await fetch('/.netlify/functions/apply-widget-to-all', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      feature_id: featureId,
      target_dashboards: ['OPERATOR_COCKPIT_*.html'],
      strategy: 'smart',
      preview_only: false,
      commit_to_git: true
    })
  });

  const result = await response.json();
  alert(`Updated ${result.dashboards_updated} dashboards! Commit: ${result.git_commit}`);
}
```

### STEP 3: Netlify Function Logic (Pseudocode)
```javascript
// apply-widget-to-all.mjs
export const handler = async (event) => {
  const { feature_id, target_dashboards, strategy, commit_to_git } = JSON.parse(event.body);

  // 1. VERIFY: Is this widget Foundational?
  const widget = await supabase
    .from('widget_governance')
    .select('*')
    .eq('feature_id', feature_id)
    .single();

  if (widget.stage !== 'foundational') {
    return { statusCode: 403, body: 'Only Foundational widgets can be auto-applied' };
  }

  // 2. GET: All target dashboards (glob matching)
  const dashboards = glob.sync(target_dashboards.join(','), { cwd: process.cwd() });

  // 3. EXTRACT: Feature code from registry source
  const registry = JSON.parse(fs.readFileSync('DASHBOARD_FEATURES_REGISTRY.json'));
  const feature = registry.features.find(f => f.id === feature_id);
  const sourceHTML = fs.readFileSync(feature.installations[0].dashboard);
  const featureCode = extractFeatureCode(sourceHTML, feature);

  // 4. MERGE: Into each target dashboard
  const results = [];
  for (const dashboard of dashboards) {
    const targetHTML = fs.readFileSync(dashboard);

    // Check if already installed
    const installed = await supabase
      .from('dashboard_features')
      .select('*')
      .eq('dashboard_name', dashboard)
      .eq('feature_id', feature_id)
      .maybeSingle();

    if (installed && installed.feature_version === feature.version) {
      results.push({ dashboard, status: 'skipped', reason: 'already_latest' });
      continue;
    }

    // Merge feature
    const merged = injectFeature(targetHTML, featureCode, strategy);
    fs.writeFileSync(dashboard, merged.html);

    // Update database
    await supabase.from('dashboard_features').upsert({
      dashboard_name: dashboard,
      feature_id: feature_id,
      feature_version: feature.version,
      installed_by: 'Commander',
      installation_type: 'auto'
    });

    results.push({ dashboard, status: 'success', version: feature.version });
  }

  // 5. GIT COMMIT (if enabled)
  if (commit_to_git) {
    execSync('git add .');
    const commitMsg = `Dashboard Factory: Applied ${feature_id} v${feature.version} to ${results.length} dashboards`;
    execSync(`git commit -m "${commitMsg}"`);
    const commitHash = execSync('git rev-parse HEAD').toString().trim();
    results.git_commit = commitHash;
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      dashboards_updated: results.filter(r => r.status === 'success').length,
      propagation_log: results
    })
  };
};
```

---

## VERSION CONFLICT HANDLING

### Scenario: Dashboard has v1.0.0, Commander wants to apply v1.1.0

**DETECTION:**
```javascript
if (installed && installed.feature_version !== feature.version) {
  // Version mismatch detected
}
```

**RESOLUTION STRATEGIES:**

1. **SAFE UPGRADE (Minor/Patch bump):**
   - CSS changes, bug fixes, additive features
   - **AUTO-APPLY:** Replace old version with new version
   - No user intervention required

2. **REVIEWED UPGRADE (API changes):**
   - New fields, new dependencies, breaking layout
   - **COMMANDER APPROVAL:** Show diff, get confirmation
   - Apply only after review

3. **BREAKING UPGRADE (Major version):**
   - Schema changes, data migration required
   - **DEPRECATION PATH:** Mark old version as deprecated
   - Allow 30-day migration window before auto-upgrade

**Implementation:**
```javascript
const versionDiff = compareVersions(installed.feature_version, feature.version);

if (versionDiff === 'patch' || versionDiff === 'minor') {
  // Auto-apply safe upgrade
  applyUpgrade(dashboard, feature);
} else if (versionDiff === 'major') {
  // Mark for manual review
  await supabase.from('upgrade_queue').insert({
    dashboard_name: dashboard,
    feature_id: feature_id,
    current_version: installed.feature_version,
    target_version: feature.version,
    requires_review: true
  });
}
```

---

## ROLLBACK MECHANISM

### Scenario: Applied widget breaks 3 dashboards

**IMMEDIATE ROLLBACK:**
```javascript
async function rollbackFeature(featureId, targetVersion) {
  // 1. Find all dashboards with this feature
  const { data: dashboards } = await supabase
    .from('dashboard_features')
    .select('*')
    .eq('feature_id', featureId)
    .eq('feature_version', targetVersion);

  // 2. Revert git commit
  execSync('git revert HEAD');

  // 3. Update database records
  for (const db of dashboards) {
    await supabase
      .from('dashboard_features')
      .update({ feature_version: 'ROLLED_BACK' })
      .eq('id', db.id);
  }

  // 4. Redeploy
  execSync('netlify deploy --prod');

  return { rolled_back: dashboards.length };
}
```

**ROLLBACK BUTTON (Commander Dashboard):**
```html
<button onclick="rollbackFeature('feat_001_service_status', '1.1.0')">
  ⏪ ROLLBACK v1.1.0 (Emergency)
</button>
```

---

## TESTING CHECKLIST

### Phase 1: Single Dashboard
- [ ] Extract feature from Ryan's cockpit
- [ ] Merge into Agent R's cockpit
- [ ] Verify no data loss
- [ ] Check version in DNA block

### Phase 2: Multi-Dashboard (3 targets)
- [ ] Apply feat_001 to Ryan, Agent R, Tiger
- [ ] Verify all 3 dashboards updated
- [ ] Check Supabase `dashboard_features` table
- [ ] Confirm git commit created

### Phase 3: Full Rollout (10+ dashboards)
- [ ] Apply Foundational widget to ALL cockpits
- [ ] Monitor for errors
- [ ] Test rollback if needed
- [ ] Verify Netlify deploy success

### Phase 4: Conflict Resolution
- [ ] Install v1.0.0 on Dashboard A
- [ ] Install v1.1.0 on Dashboard B
- [ ] Apply v1.2.0 to both
- [ ] Verify both upgraded to v1.2.0

---

## COMMANDER CONTROL PANEL

**What Commander Sees:**
```
┌─────────────────────────────────────────────────────┐
│         WIDGET GOVERNANCE - FOUNDATIONAL             │
└─────────────────────────────────────────────────────┘

feat_001_service_status v1.1.0      [FOUNDATIONAL]
  Installed on: 7/10 dashboards
  Missing: TOBY, PATRICK, FRANCES

  [🚀 Apply to Missing (3)]  [📊 View Diff]  [⏪ Rollback]

feat_002_araya_chat v2.1.0          [FOUNDATIONAL]
  Installed on: 10/10 dashboards ✓

  [✅ All Updated]  [📊 View Installs]

feat_018_xp_tracker v1.0.0          [APPROVED]
  Vote: 8/10 (80%)  [Needs 1 more vote for Foundational]

  [👍 Vote Approve]  [🚀 Apply to All] (disabled)
```

---

## CLICK SEQUENCE: Commander's Experience

1. **Open COMMANDER_COCKPIT.html**
2. **Navigate to "Widget Governance" section**
3. **See list of Foundational widgets**
4. **Click "Apply to Missing" on feat_001_service_status**
5. **Confirm dialog: "Apply to 3 dashboards?"**
6. **Click "Yes"**
7. **Progress bar: "Merging into TOBY... PATRICK... FRANCES..."**
8. **Success: "Updated 3 dashboards. Git commit: abc123"**
9. **Auto-deploy to Netlify (2 minutes)**
10. **Done! All 10 cockpits now have feat_001_service_status v1.1.0**

---

## FILES TO CREATE

### 1. Netlify Function
**File:** `C:/Users/dwrek/100X_DEPLOYMENT/netlify/functions/apply-widget-to-all.mjs`

### 2. Commander UI
**File:** `C:/Users/dwrek/100X_DEPLOYMENT/WIDGET_GOVERNANCE_PANEL.html`

### 3. Supabase Migrations
**File:** `C:/Users/dwrek/100X_DEPLOYMENT/supabase/migrations/003_dashboard_factory.sql`

### 4. Testing Script
**File:** `C:/Users/dwrek/100X_DEPLOYMENT/test-widget-propagation.js`

---

## BENEFITS

✅ **Commander saves 90% of time** - No manual copy-paste
✅ **Zero version conflicts** - Database tracks everything
✅ **Instant rollback** - Git + Supabase backup
✅ **Scales to 1000+ operators** - Automated propagation
✅ **XP-weighted voting** - Team decides what's Foundational
✅ **Consciousness-aligned** - Pattern Theory: Individual improvements → Collective evolution

---

## NEXT STEPS (Commander Decision Points)

1. **Build Supabase tables?** → Run migration SQL
2. **Build Netlify function?** → Create `apply-widget-to-all.mjs`
3. **Build Commander UI?** → Add governance panel to COMMANDER_COCKPIT.html
4. **Test on 3 dashboards?** → Ryan, Agent R, Tiger
5. **Full rollout?** → Apply to all 10+ cockpits

---

**Built by C1 Mechanic | Pattern Theory in Action**
**3 → 7 → 13 → ∞**
