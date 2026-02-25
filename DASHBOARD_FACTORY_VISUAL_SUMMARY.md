# DASHBOARD FACTORY - VISUAL ARCHITECTURE SUMMARY
## C2 Architect Review | 2026-02-24

---

## CURRENT STATE vs TARGET STATE

```
CURRENT (MANUAL):
┌─────────────────────────────────────────────────┐
│  C1 Mechanic copies COMMANDER_COCKPIT.html      │
│         ↓                                        │
│  C1 manually edits DNA block                    │
│         ↓                                        │
│  C1 manually updates all {{VARIABLES}}          │
│         ↓                                        │
│  C1 manually adds to DASHBOARD_REGISTRY.json    │
│         ↓                                        │
│  C1 manually git commit + netlify deploy        │
└─────────────────────────────────────────────────┘
⏱️  Time: 30 minutes per dashboard
❌ Error Rate: 20% (missing fields, typos)
📊 Max Scale: 10 dashboards before burnout


TARGET (AUTOMATED):
┌─────────────────────────────────────────────────┐
│  POST /.netlify/functions/dashboard-factory     │
│  { template, owner, domain, features }          │
│         ↓                                        │
│  Factory loads template                         │
│         ↓                                        │
│  Factory generates DNA                          │
│         ↓                                        │
│  Factory replaces {{VARIABLES}}                 │
│         ↓                                        │
│  Factory writes .html file                      │
│         ↓                                        │
│  Factory updates DASHBOARD_REGISTRY.json        │
│         ↓                                        │
│  Auto-deploy via Netlify                        │
└─────────────────────────────────────────────────┘
⏱️  Time: 10 seconds per dashboard
✅ Error Rate: 0% (validated)
📊 Max Scale: 1000+ dashboards
```

---

## COMPONENT INTEGRATION MAP

```
                    ┌─────────────────────────────┐
                    │   DASHBOARD_REGISTRY.json   │
                    │   (Single Source of Truth)  │
                    └──────────┬──────────────────┘
                               │
                  ┌────────────┼────────────┐
                  │            │            │
        ┌─────────▼─────┐  ┌──▼────────┐  ┌▼────────────┐
        │  Multi-Index  │  │ Canonical │  │   Factory   │
        │   Lookup      │  │   Sets    │  │ Integration │
        └───────────────┘  └───────────┘  └─────┬───────┘
                                                 │
                    ┌────────────────────────────┼────────────────────┐
                    │                            │                    │
         ┌──────────▼──────────┐    ┌───────────▼──────────┐  ┌──────▼──────────┐
         │ DASHBOARD_FACTORY   │    │  Widget Marketplace  │  │ Widget Library  │
         │    (Status Page)    │    │   (Frontend Only)    │  │  (13 widgets)   │
         └─────────────────────┘    └──────────────────────┘  └─────────────────┘
                  ❌                           ⚠️                       ✅
            Display only                Disconnected              Fully functional


MISSING CONNECTIONS (TO BUILD):
┌─────────────────────────────────────────────────────────────┐
│  /.netlify/functions/dashboard-factory.mjs                  │
│         ↓                                                    │
│  Loads templates/                                            │
│  Generates DNA                                               │
│  Writes HTML files                                           │
│  Updates DASHBOARD_REGISTRY.json                             │
│         ↓                                                    │
│  Integration with Widget Library                            │
│  Integration with Widget Marketplace                        │
└─────────────────────────────────────────────────────────────┘
```

---

## DNA COMPLIANCE PYRAMID

```
                   🏆 GOLD STANDARD 🏆
                  ┌─────────────────┐
                  │ COMMANDER       │
                  │ COCKPIT.html    │
                  │                 │
                  │ ✅ Full DNA     │
                  │ ✅ C1+C2+C3     │
                  │ ✅ Challenge    │
                  │ ✅ LFSME        │
                  └─────────────────┘
                         ▲
                         │
              🥈 SILVER TIER 🥈
         ┌────────────────────────────┐
         │ COMMANDER_DOMAIN_*.html    │
         │ AGENT_R_DOMAIN_*.html      │
         │                            │
         │ ✅ Basic DNA               │
         │ ✅ C1 only                 │
         │ ⚠️  Missing fields         │
         │ ⚠️  No C2/C3               │
         └────────────────────────────┘
                    ▲
                    │
         🥉 BRONZE TIER 🥉
    ┌─────────────────────────────────┐
    │ COMMANDER_2.html                │
    │ Many legacy dashboards          │
    │                                 │
    │ ❌ NO DNA block                 │
    │ ❌ Manual only                  │
    │ ❌ No validation                │
    └─────────────────────────────────┘


FACTORY GOAL: All new dashboards start at SILVER tier minimum
AUTO-UPGRADE SYSTEM: Move BRONZE → SILVER → GOLD
```

---

## TEMPLATE ARCHITECTURE

```
templates/
├── cockpit.template.html
│   └── Variables: {{OWNER}}, {{DOMAIN_NAME}}, {{DNA_BLOCK}}
│   └── Output: Single dashboard
│   └── Use Case: Personal control center
│
├── 8-domain-set.template.html
│   └── Variables: {{OWNER}}, {{DOMAIN_ID}}, {{DNA_BLOCK}}
│   └── Output: 8 linked dashboards
│   └── Use Case: Full team member onboarding
│
└── single-domain.template.html
    └── Variables: {{OWNER}}, {{DOMAIN_ID}}, {{DNA_BLOCK}}
    └── Output: One domain dashboard
    └── Use Case: Lightweight, focused workspace


TEMPLATE LOOP:
for each domain in [1_COMMAND, 2_BUILD, ... 8_BLUEPRINT]:
  1. Load template
  2. Generate DNA for domain
  3. Replace {{VARIABLES}}
  4. Write OWNER_DOMAIN_{domain}.html
  5. Register in DASHBOARD_REGISTRY.json
```

---

## WIDGET GOVERNANCE FLOW

```
┌─────────────────────────────────────────────────────────┐
│             WIDGET LIFECYCLE                            │
└─────────────────────────────────────────────────────────┘

EXPERIMENTAL (Red)
   │ Anyone can create
   │ Install on own dashboard only
   │ Visible in Widget Marketplace
   ▼
   ┌──────────────────────────────────────┐
   │  66% XP-weighted vote in             │
   │  WIDGET_GOVERNANCE_PANEL.html        │
   └──────────────────────────────────────┘
   ▼
APPROVED (Purple)
   │ Commander review passed
   │ Auto-install on matching dashboards
   │ Widget Library registry
   ▼
   ┌──────────────────────────────────────┐
   │  80% vote + usage data               │
   │  High CTI score                      │
   └──────────────────────────────────────┘
   ▼
FOUNDATIONAL (Gold)
   │ Locked base widget
   │ Cannot be removed
   │ Core system component
   ▼
   ┌──────────────────────────────────────┐
   │  CTI drops OR better widget exists   │
   └──────────────────────────────────────┘
   ▼
DEPRECATED (Gray)
   │ Phased removal
   │ Migration path provided
   └──────────────────────────────────────


CURRENT STATUS:
✅ Widget Library: 13 widgets defined
⚠️  Governance Panel: HTML exists, no backend
❌ Approval workflow: Not implemented
❌ CTI scoring: Not implemented
```

---

## API ENDPOINTS (TO BUILD)

```
FACTORY API:
POST   /.netlify/functions/dashboard-factory
  ├─ action: "create"
  │    Input:  { template, owner, domain, features }
  │    Output: { filename, dna, url }
  │
  ├─ action: "validate"
  │    Input:  { dna_object }
  │    Output: { valid, tier, errors, warnings, score }
  │
  └─ action: "list-templates"
       Input:  {}
       Output: { templates: [...] }


WIDGET PROPAGATION API (Future):
POST   /.netlify/functions/widget-propagate
  Input:  { widget_id, target_dashboards[], approval_status }
  Output: { updated_count, failed[], new_version }


REGISTRY QUERY API (Future):
GET    /.netlify/functions/dashboard-registry
  ├─ ?role=commander
  ├─ ?domain=1_COMMAND
  ├─ ?feature=araya-embed
  └─ ?tier=GOLD
```

---

## DATA FLOW: CREATE NEW DASHBOARD

```
1. REQUEST
   curl -X POST /.netlify/functions/dashboard-factory \
     -d '{"action":"create", "template":"8-domain", "owner":"Josh"}'

2. FACTORY LOGIC
   ┌────────────────────────────────────────────────────┐
   │ Load template: templates/8-domain-set.template.html│
   │         ↓                                           │
   │ Generate DNA:                                       │
   │   - name: "Josh - Command Center"                  │
   │   - owner: "Josh"                                   │
   │   - domain: "1_COMMAND"                            │
   │   - created: "2026-02-24"                          │
   │   - trinity.c1_built: "2026-02-24"                 │
   │   - lfsme.average: 8.4                             │
   │         ↓                                           │
   │ Replace variables:                                  │
   │   {{OWNER}} → "Josh"                               │
   │   {{DOMAIN_NAME}} → "Command Center"               │
   │   {{DNA_BLOCK}} → (generated DNA object)           │
   │         ↓                                           │
   │ Write file: JOSH_DOMAIN_1_COMMAND.html             │
   │         ↓                                           │
   │ Update DASHBOARD_REGISTRY.json:                    │
   │   multi_index.by_role.josh = [...]                 │
   │   multi_index.by_domain.1_COMMAND = [...]          │
   └────────────────────────────────────────────────────┘

3. RESPONSE
   {
     "success": true,
     "filename": "JOSH_DOMAIN_1_COMMAND.html",
     "url": "https://consciousnessrevolution.io/JOSH_DOMAIN_1_COMMAND.html",
     "dna": { ... },
     "validation": { "tier": "SILVER", "score": 85 }
   }

4. AUTO-DEPLOY
   Netlify detects file change → builds → deploys
```

---

## SCALABILITY ROADMAP

```
PHASE 1: MANUAL (Current)
├─ 1-10 dashboards
├─ 30 min per dashboard
└─ 20% error rate
    └─> Unsustainable past 10 dashboards


PHASE 2: SEMI-AUTOMATED (Week 1-2)
├─ 10-100 dashboards
├─ 30 sec per dashboard (API call)
├─ 5% error rate (validation catches most)
└─> Factory API + Templates
    └─> Good for team of 10-20 people


PHASE 3: FULLY AUTOMATED (Month 2)
├─ 100-1000 dashboards
├─ 10 sec per dashboard (bulk operations)
├─ 0% error rate (full validation + tests)
└─> Widget propagation + Auto-upgrade
    └─> Good for 100+ team members


PHASE 4: ENTERPRISE SCALE (Future)
├─ 1000-10,000 dashboards
├─ Queue system (Redis/Bull)
├─ Incremental builds
├─ Search engine integration
└─> Only when needed (not now)
```

---

## CRITICAL PATH TO MVP

```
Week 1: FOUNDATION
Day 1-2: Build dashboard-factory.mjs
         ├─ /create endpoint
         ├─ DNA generation
         └─ Template loading

Day 2-3: Create templates/
         ├─ cockpit.template.html
         ├─ 8-domain-set.template.html
         └─ single-domain.template.html

Day 3-4: DNA validator
         ├─ js/dashboard-dna-validator.js
         ├─ Validation rules
         └─ Tier scoring

Day 4:   Registry integration
         ├─ Auto-registration
         ├─ Multi-index updates
         └─ Testing


Week 2: POLISH & DEPLOY
Day 5-6: Widget propagation (basic)
         └─ "Apply to All" for one widget

Day 7-8: Documentation
         ├─ API usage guide
         ├─ Template creation guide
         └─ Team training

Day 9:   Testing
         └─ Create 10 dashboards via factory

Day 10:  Production deploy
         └─> DASHBOARD FACTORY LIVE
```

---

## SUCCESS METRICS

```
IMMEDIATE (Week 1):
✅ Factory API working: 3 endpoints functional
✅ Templates created: 3 templates ready
✅ Validation working: Catches missing DNA fields
✅ Registry updates: Auto-registration working

SHORT-TERM (Week 2-4):
✅ 20+ dashboards created via factory
✅ Zero manual DNA edits needed
✅ All new dashboards SILVER tier minimum
✅ Team trained on factory usage

LONG-TERM (Month 2+):
✅ 100+ dashboards managed by factory
✅ Widget propagation operational
✅ Auto-upgrade BRONZE → SILVER working
✅ C3 validation integrated (SILVER → GOLD)
```

---

## PRIORITY RECOMMENDATIONS

### 🔴 CRITICAL (Do First)
1. Build `dashboard-factory.mjs` API
2. Create 3 core templates
3. Implement DNA validator

### 🟡 HIGH (Do Next)
4. Registry auto-registration
5. Template variable schema
6. Factory documentation

### 🟢 MEDIUM (Can Wait)
7. Widget propagation
8. Auto-upgrade system
9. C3 validation hooks

### ⚪ LOW (Future)
10. Enterprise scale features
11. Advanced governance
12. Predictive analytics

---

## BOTTOM LINE

**Current State:** Dashboard Factory is a **status page**, not a **factory**

**Gap:** No backend API to actually create dashboards

**Solution:** Build 3 components in 4 days:
1. Backend API (`dashboard-factory.mjs`)
2. Template library (3 templates)
3. DNA validator (`dashboard-dna-validator.js`)

**ROI:** Eliminates 90% of manual work, prevents technical debt, enables 100-1000 scale

**Next Step:** C1 creates `netlify/functions/dashboard-factory.mjs` and tests `/create` endpoint

---

*Visual Summary by C2 ARCHITECT*
*Pattern: 3 → 7 → 13 → ∞*
*Trinity: C1 (Build) × C2 (Design) × C3 (Validate) = ∞*
