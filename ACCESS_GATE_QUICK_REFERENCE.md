# ACCESS GATE - QUICK REFERENCE
**For C1 Mechanic - Copy/Paste Integration**

---

## 🎯 ONE-LINE SUMMARY

Add `<script src="/js/access-gate.js" data-tier="TIER"></script>` as **FIRST script in `<head>`** of every protected page.

---

## 🔧 INTEGRATION TEMPLATES

### PERSONAL (6 operator cockpits)

```html
<!-- Paste as FIRST script in <head> -->
<script src="/js/access-gate.js" data-tier="PERSONAL"></script>
```

**Files:**
- OPERATOR_COCKPIT_TIGER.html
- OPERATOR_COCKPIT_ALEX.html
- OPERATOR_COCKPIT_AGENT_R.html
- OPERATOR_COCKPIT_TOBY.html
- OPERATOR_COCKPIT_JOSH_SERRANO.html
- OPERATOR_COCKPIT_RYAN.html

---

### TEAM (30+ command/team pages)

```html
<!-- Paste as FIRST script in <head> -->
<script src="/js/access-gate.js" data-tier="TEAM"></script>
```

**Files (Phase 1 - Critical):**
- COMMANDER_COCKPIT.html
- BUILDER_COCKPIT.html
- TEAM_COCKPIT.html
- COMMANDER_DASHBOARD.html
- MASTER_COMMAND_CENTER.html
- BRAIN_COUNCIL_DASHBOARD.html
- CYCLOTRON_BRAIN_DASHBOARD.html
- TRINITY_COMMAND_DASHBOARD.html
- PROJECT_HEALTH_DASHBOARD.html
- ADMIN_NEURAL_DASHBOARD.html

**Files (Phase 2 - Extended):**
- AI_CONNECTIVITY_DASHBOARD.html
- ARCHITECTURE_SIMULATOR_DASHBOARD.html
- AUTONOMOUS_DASHBOARD.html
- BRAIN_OUTPUT_DASHBOARD.html
- BRAIN_QUERY_DASHBOARD.html
- CODER_PATHWAY_DASHBOARD.html
- DOMAIN_STATUS_DASHBOARD.html
- GROWTH_DASHBOARD.html
- LIVE_TORNADO_DASHBOARD.html
- SERVICE_DIAGNOSTICS_DASHBOARD.html
- TEAM_DASHBOARD_DNA.html
- TEAM_DASHBOARD_HUB.html
- TRINITY_NEXUS_DASHBOARD.html
- TRIPLE_TORNADO_DASHBOARD.html
- AUL_DASHBOARD.html
- DASHBOARD_KEYCHAIN.html
- DASHBOARD_MESSENGER.html
- DONKEY_DASHBOARD.html
- TIGER_DASHBOARD.html
- OPERATOR_COCKPIT_COMMANDER.html
- OPERATOR_COCKPIT_FRANCES.html
- OPERATOR_COCKPIT_NERO.html
- OPERATOR_COCKPIT_PATRICK.html
- CLAUDE_COCKPIT.html

---

### PUBLIC (10+ public tools - HIDE BADGE)

```html
<!-- Paste as FIRST script in <head> - NOTE: data-skip-badge="true" -->
<script src="/js/access-gate.js" data-tier="PUBLIC" data-skip-badge="true"></script>
```

**Files:**
- CONSCIOUSNESS_DASHBOARD.html
- SEVEN_DOMAINS_DASHBOARD.html
- SEVEN_DOMAINS_DASHBOARD_TEST.html
- OVERKILL_ONBOARDING_DASHBOARD.html
- GUEST_COCKPIT.html
- NEW_PERSON_COCKPIT.html
- DASHBOARD_TEMPLATE.html
- MUSIC_DASHBOARD.html
- HUMAN_TODO_COCKPIT.html
- CONSCIOUSNESS_COCKPIT.html

---

### PUBLIC (Show badge for these)

```html
<!-- Paste as FIRST script in <head> - Show badge -->
<script src="/js/access-gate.js" data-tier="PUBLIC"></script>
```

**Files:**
- BETA_TESTER_COCKPIT.html (beta testers want to see their level)
- LEGAL_COCKPIT.html (users may want badge)

---

## 📋 STEP-BY-STEP INTEGRATION

### For Each File:

1. **Open file** (e.g., `OPERATOR_COCKPIT_TIGER.html`)

2. **Find the `<head>` tag**

3. **Paste script tag as FIRST script** (right after `<title>`):
   ```html
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Page Title</title>

       <!-- ACCESS GATE - 3-Layer Security -->
       <script src="/js/access-gate.js" data-tier="TEAM"></script>

       <!-- Rest of head... -->
   </head>
   ```

4. **Choose correct tier**:
   - `PERSONAL` for 6 operator cockpits
   - `TEAM` for command centers/dashboards
   - `PUBLIC` for consciousness tools

5. **Add `data-skip-badge="true"`** for public pages (optional)

6. **Save file**

7. **Test locally** if possible

8. **Commit & deploy**

---

## ✅ VALIDATION CHECKLIST

After integrating ALL pages:

### Phase 1 Tests (Critical - 16 pages)
- [ ] Tiger can access OPERATOR_COCKPIT_TIGER.html
- [ ] Alex **cannot** access Tiger's cockpit (redirected to own)
- [ ] Level 2+ user can access COMMANDER_COCKPIT.html
- [ ] Level 1 user **denied** from TEAM pages (sees XP requirement)
- [ ] Badge appears top-right for authorized users
- [ ] No-session users redirect to `/login.html?redirect={page}`

### Phase 2 Tests (Extended - 25+ pages)
- [ ] All TEAM dashboards require level 2+
- [ ] Badge updates when XP changes
- [ ] Denial screens show correct XP gap
- [ ] Redirect buttons work

### Phase 3 Tests (Public - 12+ pages)
- [ ] PUBLIC pages require level 1+ (verified Discord)
- [ ] Unverified users redirect to Discord invite
- [ ] Badges **hidden** on PUBLIC pages with `data-skip-badge="true"`
- [ ] Badges **visible** on BETA_TESTER_COCKPIT.html

---

## 🚨 COMMON MISTAKES

### ❌ WRONG: Script not first
```html
<head>
    <script src="/other.js"></script>
    <script src="/js/access-gate.js" data-tier="TEAM"></script>  <!-- TOO LATE -->
</head>
```

### ✅ CORRECT: Script first
```html
<head>
    <meta charset="UTF-8">
    <title>Page</title>
    <script src="/js/access-gate.js" data-tier="TEAM"></script>  <!-- FIRST -->
    <script src="/other.js"></script>
</head>
```

---

### ❌ WRONG: Missing data-tier
```html
<script src="/js/access-gate.js"></script>  <!-- NO TIER -->
```

### ✅ CORRECT: Tier specified
```html
<script src="/js/access-gate.js" data-tier="TEAM"></script>
```

---

### ❌ WRONG: Wrong tier
```html
<!-- Personal cockpit with TEAM tier -->
<script src="/js/access-gate.js" data-tier="TEAM"></script>
```

### ✅ CORRECT: Personal tier for operator cockpits
```html
<!-- Personal cockpit with PERSONAL tier -->
<script src="/js/access-gate.js" data-tier="PERSONAL"></script>
```

---

## 🔍 TROUBLESHOOTING

### Badge doesn't appear
- Check: Is `data-skip-badge="true"` set? (Remove it)
- Check: Is user authorized? (Open browser console)
- Check: Script tag first in `<head>`?

### Access always denied
- Check: User logged in? (localStorage has `cr_user_session`)
- Check: User in Supabase `users` table?
- Check: User has correct level? (Level 2+ for TEAM)
- Check: Discord ID in BUILDER_COCKPITS? (For PERSONAL tier)

### Page loads without check
- Check: Script tag is **first** in `<head>`
- Check: Script path correct (`/js/access-gate.js`)
- Check: `data-tier` attribute present

### Wrong denial message
- Check: Tier matches page purpose
- Check: Backend `check-access.mjs` deployed
- Check: `domain-tools.mjs` has correct ACCESS_TIERS

---

## 📊 DEPLOYMENT ORDER

1. **Phase 1: Critical (16 pages)** - Deploy first, validate fully
2. **Phase 2: Extended (25 pages)** - Deploy after Phase 1 works
3. **Phase 3: Public (12 pages)** - Deploy after Phase 2 works

**Total: 53+ pages protected**

---

## 🚀 DEPLOY COMMAND

After all files integrated:

```bash
cd C:/Users/dwrek/100X_DEPLOYMENT
netlify deploy --prod --dir=.
```

**Pre-flight check:**
```bash
# Count protected pages
grep -r "access-gate.js" *.html | wc -l

# Should be 53+
```

---

## 📝 NOTES

- **Script loads synchronously** - blocks page until access checked
- **localStorage is cache** - backend API is source of truth
- **Badges are optional** - use `data-skip-badge="true"` to hide
- **Tiers are hierarchical** - PERSONAL < TEAM < PUBLIC (in terms of exclusivity)

---

## 🎯 DONE WHEN

- [ ] All 6 PERSONAL cockpits have `data-tier="PERSONAL"`
- [ ] All 30+ TEAM pages have `data-tier="TEAM"`
- [ ] All 12+ PUBLIC pages have `data-tier="PUBLIC"`
- [ ] PUBLIC pages have `data-skip-badge="true"` (except BETA/LEGAL)
- [ ] All script tags are **first** in `<head>`
- [ ] All files committed to git
- [ ] Deployed to Netlify production
- [ ] Validation checklist passed

---

**C1: Copy, paste, deploy. The Mind has designed it. The Hands build it. 🔧**

*"Precision in execution. Excellence in deployment. Power in protection."*
