# DASHBOARD SETS MAP
## Complete Organization for Builder Teams
## 4 Dashboard Sets - Which to Work On

---

## THE 4 SETS AT A GLANCE

```
SET 1: ORIGINAL DASHBOARDS ──────────────────────────── "Ego Silos" (Legacy)
SET 2: consciousness-dashboards REPO ────────────────── ARAYA-Editable Cockpits
SET 3: 7×7×7 ARCHITECTURE ───────────────────────────── System Infrastructure
SET 4: PERSONAL_DOMAIN_1-7 ──────────────────────────── NEWEST (a4ec918d6)
                                                        Filing Cabinet + 3-Tier

BUILDER PRIORITY: Work on SET 2, SET 3, SET 4
                  SET 1 is legacy (archived versions in .archive/)
```

---

## SET 1: ORIGINAL DASHBOARDS (Legacy - "Ego Silos")

**Location:** `100X_DEPLOYMENT/` (scattered)
**Status:** LEGACY - Trinity identified as "ego silos"
**ARAYA Can Edit:** NO (in main repo)

| File | Purpose |
|------|---------|
| COMMANDER_DASHBOARD.html | Commander overview (old style) |
| CONSCIOUSNESS_DASHBOARD.html | System consciousness |
| TIGER_DASHBOARD.html | Tiger's dashboard (old) |
| GROWTH_DASHBOARD.html | Growth metrics |
| MUSIC_DASHBOARD.html | Music system |
| DONKEY_DASHBOARD.html | Donkey project |
| AUL_DASHBOARD.html | AUL system |
| BRAIN_COUNCIL_DASHBOARD.html | Brain council |
| BRAIN_OUTPUT_DASHBOARD.html | Brain output |
| BRAIN_QUERY_DASHBOARD.html | Brain queries |
| CYCLOTRON_BRAIN_DASHBOARD.html | Cyclotron system |
| PROJECT_HEALTH_DASHBOARD.html | Project health |
| SERVICE_DIAGNOSTICS_DASHBOARD.html | Service status |

**Archived Cockpits:** `.archive/old_cockpits/`
- OPERATOR_COCKPIT_AGENT_R.html
- OPERATOR_COCKPIT_ALEX.html
- OPERATOR_COCKPIT_ERICA.html
- OPERATOR_COCKPIT_JOSH.html
- OPERATOR_COCKPIT_MAGGIE.html
- OPERATOR_COCKPIT_TEDDY.html

---

## SET 2: consciousness-dashboards REPO (ARAYA-Editable)

**Location:** GitHub `overkillkulture/consciousness-dashboards`
**Status:** ACTIVE - Trinity-built, better wired
**ARAYA Can Edit:** YES (isolated repo)
**Deploy URL:** https://consciousnessrevolution.io/OPERATOR_COCKPIT_[NAME].html

| File | Builder | ARAYA Edit |
|------|---------|------------|
| OPERATOR_COCKPIT_TIGER.html | Tiger | YES |
| OPERATOR_COCKPIT_ALEX.html | Alex | YES |
| OPERATOR_COCKPIT_AGENT_R.html | Agent R | YES |
| OPERATOR_COCKPIT_TOBY.html | Toby | YES |
| OPERATOR_COCKPIT_JOSH_SERRANO.html | Josh Serrano | YES |
| OPERATOR_COCKPIT_RYAN.html | Ryan | YES |
| OPERATOR_COCKPIT_FRANCES.html | Frances | YES |
| OPERATOR_COCKPIT_NERO.html | Nero | YES |
| OPERATOR_COCKPIT_COMMANDER.html | Commander | YES |
| OPERATOR_COCKPIT_PATRICK.html | Patrick | YES |

**API for ARAYA edits:** `/.netlify/functions/araya-edit-cockpit`
**Edit types:** add_task, update_status, add_note, update_xp

### Trinity Architecture Features (Wire into SET 4):
- Supabase integration (task_queue, node_messages, atoms, operator_progress)
- GitHub REST API for service status
- Netlify/Railway status checks
- ARAYA chat widget with context
- Document viewer with markdown rendering
- Checklist with localStorage + Supabase sync
- Real-time polling (30-second refresh)
- Task state management (pending → completed)
- Message routing (from_node → to_node)

---

## SET 3: 7×7×7 ARCHITECTURE (System Infrastructure)

**Location:** `100X_DEPLOYMENT/`
**Status:** ACTIVE - System-level architecture
**ARAYA Can Edit:** NO (main repo)
**Purpose:** 7 domains × 7 tools × 7 levels fractal structure

### Hub/Navigation Files:
| File | Purpose |
|------|---------|
| SEVEN_DOMAINS_DASHBOARD.html | Main 7-domain hub |
| SEVEN_DOMAINS_HUB.html | Alternative hub |
| SEVEN_DOMAINS_COMMAND.html | Command domain hub |
| COMMANDER_7DOMAINS.html | Commander's 7-domain view |
| C2_7_DOMAINS_ARCHITECTURE_VISUAL.html | Architecture visualization |

### Templates & Tools:
| File | Purpose |
|------|---------|
| DOMAIN_TEMPLATE.html | Base template |
| DOMAIN_INTERFACE_TEMPLATE.html | Interface template |
| DOMAIN_BLUEPRINTS.html | Domain blueprints |
| DOMAIN_STATUS_DASHBOARD.html | Domain status |
| GLYPH_DOMAIN_SCANNER.html | Glyph scanner |

---

## SET 4: PERSONAL DOMAINS (NEWEST - a4ec918d6)

**Location:** `100X_DEPLOYMENT/`
**Status:** BRAND NEW - Just committed
**ARAYA Can Edit:** YES (via araya-file.mjs - allows .html at root)
**Features:** Filing cabinet widgets, 3-tier slider, localStorage persistence

| Domain | Color | URL |
|--------|-------|-----|
| 1 COMMAND | Red #ff4444 | /PERSONAL_DOMAIN_1_COMMAND.html |
| 2 BUILD | Orange #ff8800 | /PERSONAL_DOMAIN_2_BUILD.html |
| 3 CONNECT | Yellow #ffdd00 | /PERSONAL_DOMAIN_3_CONNECT.html |
| 4 PROTECT | Green #00ff88 | /PERSONAL_DOMAIN_4_PROTECT.html |
| 5 GROW | Blue #00aaff | /PERSONAL_DOMAIN_5_GROW.html |
| 6 LEARN | Purple #8844ff | /PERSONAL_DOMAIN_6_LEARN.html |
| 7 TRANSCEND | Magenta #ff44ff | /PERSONAL_DOMAIN_7_TRANSCEND.html (infinity animation) |

**Features:**
- Filing cabinet widgets with domain-specific files
- 3-tier view slider (Personal/Team/Public) with localStorage persistence
- Cross-domain navigation bar on each dashboard
- Domain 7 has special infinity animation
- BLACK SWAN (#1) card - "the one thing that could change everything"
- 6 readout cards (#2-7) with domain metrics

### 3-Tier System:
| Tier | Purpose | Data Visibility |
|------|---------|-----------------|
| **Personal** | Individual metrics + tasks | Only your data |
| **Team** | Shared analytics with builders | Team aggregate |
| **Public** | Free/paid offerings to world | Public-facing |

---

## BUILDER WORK GUIDE

### For Tiger, Alex, Toby, Josh, Ryan:
**Work on:** SET 2 (Your cockpit in consciousness-dashboards)
**Benefits:** ARAYA can update your cockpit automatically

### For System Architecture Work:
**Work on:** SET 3 (7×7×7 infrastructure)
**Purpose:** Domain templates, navigation, architecture

### For Personal Dashboard Experience:
**Work on:** SET 4 (PERSONAL_DOMAIN_1-7)
**Purpose:** Filing cabinet, 3-tier slider, per-domain organization

### Leave Alone:
**SET 1** - Legacy "ego silos" - being phased out

---

## INTEGRATION ROADMAP: Wire SET 2 → SET 4

### Phase 1: ARAYA Chat Widget ✅
`js/araya-dashboard-widget.js` already deployed to domain dashboards

### Phase 2: Supabase Data Connections
Wire each domain dashboard to pull real data:
- Domain 1 (COMMAND): task_queue, node_messages
- Domain 2 (BUILD): project_progress, commits
- Domain 3 (CONNECT): team_roster, messages
- Domain 4 (PROTECT): legal_cases, evidence
- Domain 5 (GROW): revenue_metrics, conversions
- Domain 6 (LEARN): courses, progress
- Domain 7 (TRANSCEND): consciousness_metrics, patterns

### Phase 3: Real-time Polling
Add 30-second refresh cycle for connected state

### Phase 4: Document Viewer
Tab-based markdown rendering from GitHub docs

---

## QUICK LINKS

```
SET 2 - Operator Cockpits:
https://conciousnessrevolution.io/OPERATOR_COCKPIT_TIGER.html
https://conciousnessrevolution.io/OPERATOR_COCKPIT_ALEX.html
https://conciousnessrevolution.io/OPERATOR_COCKPIT_AGENT_R.html

SET 3 - 7×7×7 Architecture:
https://conciousnessrevolution.io/SEVEN_DOMAINS_DASHBOARD.html
https://conciousnessrevolution.io/COMMANDER_7DOMAINS.html

SET 4 - Personal Domains:
https://conciousnessrevolution.io/PERSONAL_DOMAIN_1_COMMAND.html
https://conciousnessrevolution.io/PERSONAL_DOMAIN_2_BUILD.html
https://conciousnessrevolution.io/PERSONAL_DOMAIN_3_CONNECT.html
https://conciousnessrevolution.io/PERSONAL_DOMAIN_4_PROTECT.html
https://conciousnessrevolution.io/PERSONAL_DOMAIN_5_GROW.html
https://conciousnessrevolution.io/PERSONAL_DOMAIN_6_LEARN.html
https://conciousnessrevolution.io/PERSONAL_DOMAIN_7_TRANSCEND.html
```

---

## SUMMARY

| Set | Count | Status | ARAYA | Builder Priority |
|-----|-------|--------|-------|------------------|
| 1 - Original | 13+ | Legacy | NO | SKIP |
| 2 - consciousness-dashboards | 10 | Active | YES | HIGH |
| 3 - 7×7×7 Architecture | 10 | Active | NO | MEDIUM |
| 4 - Personal Domains | 7 | NEWEST | YES | HIGH |

**Pattern:** 3 → 7 → 13 → ∞

---

*Created: February 21, 2026*
*Updated: February 22, 2026*
*Session 121: Unified template complete + ARAYA edit confirmed*
