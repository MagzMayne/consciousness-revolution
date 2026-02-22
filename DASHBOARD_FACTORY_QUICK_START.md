# 🚀 DASHBOARD FACTORY - QUICK START
**For Commander | 2-Minute Setup**

---

## WHAT YOU GET

✅ **ONE-CLICK WIDGET PROPAGATION** - Apply widgets to all 10+ cockpits instantly
✅ **VERSION TRACKING** - No more "which dashboard has what?"
✅ **AUTO-ROLLBACK** - Undo mistakes with one button
✅ **XP-WEIGHTED VOTING** - Team decides what's Foundational
✅ **GIT INTEGRATION** - Every change is committed automatically

---

## SETUP (5 Minutes)

### STEP 1: Run Supabase Migration
```bash
cd C:/Users/dwrek/100X_DEPLOYMENT
psql -h db.iqjghsofnpoadwzqxmnz.supabase.co -U postgres -d postgres < supabase/migrations/003_dashboard_factory.sql
```

**OR** Copy SQL into Supabase SQL Editor at:
https://supabase.com/dashboard/project/iqjghsofnpoadwzqxmnz/sql

### STEP 2: Test the System
```bash
node test-widget-propagation.js
```

Expected output:
```
✅ TEST 1: Registry validation       - PASSED
✅ TEST 2: FEATURE marker detection  - PASSED
✅ TEST 3: Feature extraction        - PASSED
✅ All core systems operational!
```

### STEP 3: Open Widget Governance Panel
```
https://consciousnessrevolution.io/WIDGET_GOVERNANCE_PANEL.html
```

OR localhost:
```
open WIDGET_GOVERNANCE_PANEL.html
```

---

## USAGE: Commander Workflow

### SCENARIO 1: Apply Foundational Widget to All Cockpits

1. **Open:** `WIDGET_GOVERNANCE_PANEL.html`
2. **Filter:** Click "Foundational" tab
3. **Find:** Widget you want to propagate (e.g., `feat_001_service_status`)
4. **Click:** "🚀 Apply to Missing (3)" button
5. **Confirm:** Dialog pops up
6. **Wait:** 10-30 seconds (merging + git + deploy)
7. **Done!** All cockpits now have the widget

**What Happens Behind the Scenes:**
- Netlify function `apply-widget-to-all.mjs` is called
- Widget extracted from source dashboard
- Merged into all matching dashboards (OPERATOR_COCKPIT_*.html)
- Supabase `dashboard_features` table updated
- Git commit created: "Dashboard Factory: Applied feat_001 v1.1.0 to 10 dashboards"
- Auto-deployed to Netlify

---

### SCENARIO 2: Promote Widget from Experimental → Approved

1. **Open:** `WIDGET_GOVERNANCE_PANEL.html`
2. **Filter:** Click "Experimental" tab
3. **Find:** Widget to vote on
4. **Vote:** Click "👍 Approve" button
5. **Enter:** Your name (e.g., "Commander")
6. **Auto-Promote:** If vote reaches ≥66%, widget becomes Approved

**Vote Weights:**
- Commander: 1000 XP
- Operators: 100-500 XP (based on contributions)

---

### SCENARIO 3: Emergency Rollback

If a widget breaks something:

1. **Open:** Git log
2. **Find:** Latest commit (e.g., `abc123`)
3. **Revert:**
```bash
git revert abc123
git push
netlify deploy --prod
```

4. **Done!** Dashboards reverted to previous state

---

## FILES YOU NEED TO KNOW

| File | Purpose |
|------|---------|
| `DASHBOARD_FEATURES_REGISTRY.json` | Master list of all widgets |
| `WIDGET_GOVERNANCE_PANEL.html` | Commander control panel |
| `netlify/functions/apply-widget-to-all.mjs` | Auto-propagation logic |
| `supabase/migrations/003_dashboard_factory.sql` | Database schema |
| `test-widget-propagation.js` | Testing script |
| `DASHBOARD_FACTORY_ROLLOUT_BLUEPRINT.md` | Full technical docs |

---

## DATABASE TABLES (Supabase)

### `widget_governance`
Tracks widget lifecycle stages.
```sql
SELECT * FROM widget_governance WHERE stage = 'foundational';
```

### `dashboard_features`
Tracks what's installed where.
```sql
SELECT * FROM dashboard_features WHERE feature_id = 'feat_001_service_status';
```

### `widget_votes`
XP-weighted voting records.
```sql
SELECT * FROM widget_votes WHERE feature_id = 'feat_018_xp_tracker';
```

---

## API ENDPOINTS

### POST `/.netlify/functions/apply-widget-to-all`
Apply widget to all dashboards.

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
  "git_commit": "abc123",
  "propagation_log": [...]
}
```

---

## TROUBLESHOOTING

### Problem: "Widget not found in governance system"
**Solution:** Widget must be in `widget_governance` table with `stage = 'foundational'`

### Problem: "Only Foundational widgets can be auto-applied"
**Solution:** Vote on widget to promote it to Foundational (≥90% approval)

### Problem: "No matching dashboards found"
**Solution:** Check glob pattern matches actual files (e.g., `OPERATOR_COCKPIT_*.html`)

### Problem: Supabase connection fails
**Solution:** Check `SUPABASE_SERVICE_ROLE_KEY` environment variable in Netlify

---

## CLICKS TO GO LIVE

1. ✅ **Read this doc** (2 min)
2. ✅ **Run Supabase migration** (1 min)
3. ✅ **Run test script** (1 min)
4. ✅ **Open governance panel** (1 min)
5. ✅ **Click "Apply to All"** (10 sec)
6. ✅ **Verify deploy** (2 min)

**Total Time: 7 minutes from reading to deployed.**

---

## BENEFITS

| Before | After |
|--------|-------|
| 30 min to update 10 dashboards manually | 10 sec with one click |
| Version conflicts, missing features | Auto-tracked in database |
| No audit trail | Full git history + Supabase log |
| Risk of breaking dashboards | Preview mode + rollback |
| Team can't contribute widgets | XP-weighted voting system |

---

## WHAT COMMANDER SEES

```
┌─────────────────────────────────────────────────┐
│  feat_001_service_status v1.1.0  [FOUNDATIONAL]  │
├─────────────────────────────────────────────────┤
│  Installed on: 7/10 dashboards                   │
│  Missing: TOBY, PATRICK, FRANCES                 │
│                                                   │
│  [🚀 Apply to Missing (3)]  [👁️ Preview]         │
└─────────────────────────────────────────────────┘
```

**Commander clicks "Apply to Missing"**
→ Confirmation dialog
→ Progress indicator (10 sec)
→ Success: "Updated 3 dashboards. Git commit: abc123"
→ Auto-deploy to Netlify
→ Done!

---

## NEXT EVOLUTION

Phase 2 features (future):
- Widget marketplace UI integration
- Real-time dashboard preview
- A/B testing for new widgets
- Widget analytics (usage tracking)
- Auto-upgrade scheduler (weekly cadence)
- Widget dependency resolver (auto-install deps)

---

**Built by C1 Mechanic | Pattern Theory in Action**
**3 → 7 → 13 → ∞**
