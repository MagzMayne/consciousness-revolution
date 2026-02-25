# UNIVERSAL FILE NAMING SYSTEM
## Quick Reference Card for Indexing Everything We Make

**Version:** 1.0.0 | **Created:** 2026-02-24 | **Phase:** BETA

---

## THE PATTERN

```
[TYPE]_[DOMAIN]_[OWNER]_[DESCRIPTOR]_v[VERSION].[ext]
```

### Examples:
```
DASHBOARD_1_COMMANDER_TRINITY_v2.html
COCKPIT_3_FRANCIS_DISCORD_MANAGER_v0.1.html
HUB_7_TEAM_TRANSCENDENCE_PORTAL_v1.html
TOOL_2_SYSTEM_DASHBOARD_FACTORY_v2.py
```

---

## INDEX 1: BY TYPE

| Type | Purpose | Example |
|------|---------|---------|
| `DASHBOARD` | View & monitor data | DASHBOARD_1_COMMANDER_*.html |
| `COCKPIT` | Personal control center | COCKPIT_3_FRANCIS_*.html |
| `HUB` | Multi-user collaboration | HUB_3_TEAM_COMMS_*.html |
| `TOOL` | Utility / helper | TOOL_2_MERGER_*.html |
| `ENGINE` | Backend service | ENGINE_ARAYA_CHAT_*.mjs |
| `PORTAL` | Entry point / gateway | PORTAL_7_TRANSCEND_*.html |
| `API` | Endpoint function | API_BRAIN_QUERY_*.mjs |
| `SCHEMA` | Data structure def | SCHEMA_BETA_DNA_*.json |
| `GUIDE` | Documentation | GUIDE_QUICKSTART_*.md |
| `SLIDER` | 7x7 single-page | SLIDER_7x7_FRANCIS_*.html |

---

## INDEX 2: BY DOMAIN

| # | Domain | Color | Purpose |
|---|--------|-------|---------|
| 1 | COMMAND | Red | Leadership, decisions |
| 2 | BUILD | Blue | Creation, construction |
| 3 | CONNECT | Purple | Communication, integration |
| 4 | PROTECT | Green | Security, safety |
| 5 | GROW | Orange | Expansion, scaling |
| 6 | LEARN | Cyan | Education, knowledge |
| 7 | TRANSCEND | Pink | Innovation, emergence |
| 8 | BLUEPRINT | Teal | Meta-architecture |
| MULTI | Multiple | - | Spans multiple domains |

---

## INDEX 3: BY OWNER

| Owner | Description | Example |
|-------|-------------|---------|
| `COMMANDER` | Darrick's dashboards | COCKPIT_COMMANDER_*.html |
| `AGENT_R` | AI Agent views | DASHBOARD_AGENT_R_*.html |
| `FRANCIS` | Francis's workspace | SLIDER_7x7_FRANCIS_*.html |
| `TIGER` | Tiger's workspace | COCKPIT_TIGER_*.html |
| `TEAM` | Shared team tools | HUB_TEAM_*.html |
| `SYSTEM` | Automated/backend | ENGINE_SYSTEM_*.mjs |
| `PUBLIC` | Public-facing | PORTAL_PUBLIC_*.html |
| `BETA` | Beta testers | DASHBOARD_BETA_*.html |

---

## INDEX 4: BY PHASE

| Phase | Prefix | Meaning |
|-------|--------|---------|
| CONCEPT | `CONCEPT_` | Design only, no code |
| ALPHA | `ALPHA_` or `_v0.x` | Early testing, expect breaks |
| BETA | `BETA_` or `_vX.0-beta` | Feature complete, stabilizing |
| RELEASE | (none) | Production ready |
| GOLD | `GOLD_` or documented | Reference implementation |
| DEPRECATED | `_DEPRECATED` suffix | Being phased out |

---

## THE 7x7 SLIDER PATTERN (NEW)

**Old Way:** 8 separate HTML files per person
```
COMMANDER_DOMAIN_1_COMMAND.html
COMMANDER_DOMAIN_2_BUILD.html
COMMANDER_DOMAIN_3_CONNECT.html
... (8 files total)
```

**New Way:** 1 file with horizontal slider
```
SLIDER_7x7_COMMANDER_v1.html  (1 file, 7 domains)
SLIDER_7x7_FRANCIS_DISCORD_v0.1.html
SLIDER_7x7_AGENT_R_v1.html
```

**Naming:**
```
SLIDER_7x7_[OWNER]_[DESCRIPTOR]_v[VERSION].html
```

---

## BETA DNA CORNER (Required on all BETA files)

Every BETA file must display in the corner:

```
+---------------------------+
| BETA v0.1.0              |
| Owner: Francis            |
| Created: 2026-02-24       |
| Phase: BETA (35%)         |
| Next: Connect Discord API |
| Becomes: Discord Hub      |
+---------------------------+
```

### Required DNA Fields:
- `identity.version`
- `identity.created_by`
- `identity.created_date`
- `phase.current_phase`
- `phase.completion_percentage`
- `blueprint.next_steps[0].action`
- `blueprint.target_phase`

---

## QUICK VALIDATION CHECKLIST

Before committing ANY artifact:

- [ ] Filename follows: `TYPE_DOMAIN_OWNER_DESC_vVER.ext`
- [ ] Beta DNA embedded in file
- [ ] DNA corner visible if BETA phase
- [ ] `identity.filename` matches actual filename
- [ ] Version is semver: `X.Y.Z` or `X.Y.Z-beta`
- [ ] Next steps defined
- [ ] Related documents linked

---

## EXAMPLE: COMPLETE NAMING

### Francis Discord Manager (NEW)
```
Filename: SLIDER_7x7_FRANCIS_DISCORD_v0.1_BETA.html
Type:     SLIDER
Domain:   7x7 (all 7)
Owner:    FRANCIS
Desc:     DISCORD
Version:  0.1
Phase:    BETA
```

### Commander Trinity Dashboard
```
Filename: DASHBOARD_1_COMMANDER_TRINITY_v2.html
Type:     DASHBOARD
Domain:   1 (COMMAND)
Owner:    COMMANDER
Desc:     TRINITY
Version:  2.0.0
Phase:    GOLD
```

### Brain Query API
```
Filename: API_8_SYSTEM_BRAIN_QUERY_v1.mjs
Type:     API
Domain:   8 (BLUEPRINT)
Owner:    SYSTEM
Desc:     BRAIN_QUERY
Version:  1.0.0
Phase:    RELEASE
```

---

## MULTIPLE INDEXING METHODS

The same file can be found by:

**SLIDER_7x7_FRANCIS_DISCORD_v0.1_BETA.html**

1. **By Type:** `ls SLIDER_*` → finds all sliders
2. **By Owner:** `ls *_FRANCIS_*` → finds Francis's files
3. **By Phase:** `ls *_BETA.html` → finds all beta files
4. **By Version:** `ls *_v0.*` → finds early versions
5. **By Domain:** In DNA: `lineage.domain: [1,2,3,4,5,6,7]`

---

## FILE LOCATION STRUCTURE (Future)

```
100X_DEPLOYMENT/
├── SLIDERS/
│   ├── SLIDER_7x7_COMMANDER_v1.html
│   ├── SLIDER_7x7_FRANCIS_DISCORD_v0.1_BETA.html
│   └── SLIDER_7x7_AGENT_R_v1.html
├── DASHBOARDS/
│   └── by-domain/
│       ├── 1_COMMAND/
│       ├── 2_BUILD/
│       └── ...
├── COCKPITS/
│   ├── COCKPIT_COMMANDER_v3.html
│   └── COCKPIT_TIGER_v1.html
├── TOOLS/
├── ENGINES/
└── BETA/
    └── (all beta phase files symlinked here)
```

---

## REMEMBER

1. **If it's BETA, show it's BETA** - Corner badge visible
2. **Name it so you can find it** - Multiple index methods
3. **DNA tells the story** - Created, by whom, next steps
4. **One file = one purpose** - 7x7 slider, not 8 files
5. **Version everything** - v0.1, v1.0, v2.3.1

---

**Schema:** `BETA_DNA_SCHEMA.json`
**Full Guide:** `BETA_DNA_GUIDE.md`
**Vision Doc:** `VISION_7x7_SLIDER_PATTERN.md`
