# DASHBOARD ARCHITECTURE STANDARD
## Trinity-Made Dashboard DNA Specification
**Reference:** COMMANDER_COCKPIT.html (the gold standard)

---

## THE PROBLEM

We have 3 levels of dashboard quality:

| Level | Example | DNA Quality |
|-------|---------|-------------|
| **GOLD** | COMMANDER_COCKPIT.html | Full Trinity DNA, validated |
| **SILVER** | COMMANDER_DOMAIN_*.html | Basic DNA, missing fields |
| **BRONZE** | COMMANDER_2.html | NO DNA at all |

---

## GOLD STANDARD: Full Dashboard DNA

Copy this structure for ALL new dashboards:

```html
<script type="application/json" id="dashboard-dna">
{
  "name": "Dashboard Name",
  "version": "1.0.0",
  "purpose": "What this dashboard does - be specific",

  "owner": "Who owns this dashboard",
  "realName": "Human name if applicable",
  "aliases": ["Alternative names", "Nicknames"],

  "domain": "1_COMMAND",
  "sphere": "COMMAND | BUILD | CONNECT | PROTECT | GROW | LEARN | TRANSCEND | BLUEPRINT",

  "created": "2026-MM-DD",
  "updated": "2026-MM-DD",
  "status": "LIVE | DRAFT | DEPRECATED",
  "url": "https://consciousnessrevolution.io/FILENAME.html",

  "access": "Who can access (Commander Only | Team | Public | Operators)",

  "identitySync": {
    "enabled": true,
    "syncWith": "RELATED_DASHBOARD.html",
    "note": "Explanation of the sync relationship"
  },

  "features": [
    "supabase",
    "araya-embed",
    "polling",
    "3-tier-slider",
    "widget-dock"
  ],

  "changelog": [
    {"version": "1.0.0", "date": "2026-MM-DD", "changes": "Initial creation"}
  ],

  "trinity": {
    "c1_built": "2026-MM-DD",
    "c2_reviewed": "2026-MM-DD or null",
    "c3_validated": "2026-MM-DD or null"
  },

  "challenge": {
    "passed": true,
    "date": "2026-MM-DD",
    "holes_found": 0,
    "holes_fixed": 0
  },

  "lfsme": {
    "lighter": 8,
    "faster": 8,
    "stronger": 8,
    "elegant": 8,
    "less_expensive": 10,
    "average": 8.4
  },

  "connects_to": [
    "RELATED_DASHBOARD_1.html",
    "RELATED_DASHBOARD_2.html"
  ]
}
</script>
```

---

## REQUIRED FIELDS (Minimum Viable DNA)

These MUST be present in every dashboard:

```json
{
  "name": "Required",
  "version": "Required (semver)",
  "purpose": "Required",
  "domain": "Required (1_COMMAND through 8_BLUEPRINT)",
  "sphere": "Required",
  "created": "Required",
  "status": "Required",
  "trinity": {
    "c1_built": "Required (date C1 built it)"
  },
  "lfsme": {
    "average": "Required (score 1-10)"
  }
}
```

---

## CSS VARIABLES STANDARD

Use consistent CSS variables (from COMMANDER_COCKPIT):

```css
:root {
  --bg: #0a0a0a;
  --surface: #111;
  --border: #222;
  --text: #fff;
  --text-dim: #888;
  --accent: #ffd700;       /* Gold for commander */
  --accent-dim: rgba(255, 215, 0, 0.1);
  --success: #00ff88;
  --warning: #ffaa00;
  --danger: #ff4444;
  --info: #00aaff;
}
```

### Domain Colors
| Domain | Accent Color |
|--------|--------------|
| 1_COMMAND | #ff4444 (Red) |
| 2_BUILD | #00aaff (Blue) |
| 3_CONNECT | #aa44ff (Purple) |
| 4_PROTECT | #44ff44 (Green) |
| 5_GROW | #ffaa00 (Orange) |
| 6_LEARN | #00ffaa (Cyan) |
| 7_TRANSCEND | #ff44aa (Pink) |
| 8_BLUEPRINT | #00ffcc (Teal) |

---

## TRINITY WORKFLOW

1. **C1 Mechanic BUILDS** → Sets `c1_built` date
2. **C2 Architect REVIEWS** → Sets `c2_reviewed` date, scores LFSME
3. **C3 Oracle VALIDATES** → Sets `c3_validated` date, runs challenge

Only dashboards with all 3 dates filled are **GOLD STANDARD**.

---

## UPGRADE CHECKLIST

To upgrade a SILVER dashboard to GOLD:

- [ ] Add `owner`, `realName`, `aliases`
- [ ] Add `access` control description
- [ ] Add `identitySync` if relates to other dashboards
- [ ] Add `changelog` array with version history
- [ ] Fill `c2_reviewed` and `c3_validated` dates
- [ ] Add `challenge` block after validation
- [ ] Add `connects_to` array

---

## FILES TO UPGRADE

**Currently GOLD:**
- COMMANDER_COCKPIT.html

**Currently SILVER (need upgrade):**
- COMMANDER_DOMAIN_1-8.html (all 8)
- AGENT_R_DOMAIN_1-8.html (all 8)

**Currently BRONZE (need DNA added):**
- COMMANDER_2.html
- COMMANDER_7DOMAINS.html
- Many others...

---

*Architecture documented by C2 Architect | 2026-02-24*
*Reference: COMMANDER_COCKPIT.html - The Gold Standard*
