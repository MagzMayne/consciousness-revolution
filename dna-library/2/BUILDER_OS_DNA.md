# BUILDER OS DNA

## WHAT IS IT
Operating system for creators and entrepreneurs. Personal cockpit replacing 12+ scattered apps, project management organized by 7 consciousness domains, AI assistance, and marketplace for tools/templates. Each builder gets their own customized dashboard to manage projects, creations, earnings, and contributions to the network.

## STATUS
- Working: **WORKING** (core features)
- Last tested: 2026-03-06
- Current issues: Marketplace not built, cockpit shows demo data, agreement flow needs testing

## LOCATION
**Primary files:**
- `~/100X_DEPLOYMENT/BUILDER_COCKPIT.html` - Personal control center (782 lines)
- `~/100X_DEPLOYMENT/BUILDER_AGREEMENT_FORM.html` - Digital signature (620 lines)
- `~/100X_DEPLOYMENT/BUILDER_ONBOARDING.html` - Onboarding flow (359 lines)

**Dependencies:**
- Supabase (builder_profiles, creations tables)
- Netlify Functions (backend APIs)
- Stripe (marketplace payments - future)

**Related files:**
- `~/100X_DEPLOYMENT/BUILDER_HUB_LOBBY.html` - Hub lobby
- `~/100X_DEPLOYMENT/BUILDER_SYSTEM_ARCHITECTURE.html` - Architecture docs
- `~/100X_DEPLOYMENT/BUILDER_MISSION_STATEMENT.html` - Mission statement
- `~/100X_DEPLOYMENT/BUILDER_CONTRIBUTION_AGREEMENT.html` - Contribution terms
- `~/100X_DEPLOYMENT/BUILDER_AGREEMENT_DNA.html` - Visual DNA
- `~/100X_DEPLOYMENT/BUILDER_OS_ARCHITECTURE_VISUAL.html` - Architecture visual
- `~/100X_DEPLOYMENT/LANDING_BUILDER_OS.html` - Public landing page
- `~/100X_DEPLOYMENT/PITCH_DECK_BUILDER_OS.html` - Pitch deck
- `~/100X_DEPLOYMENT/builder-creed.html` - Builder creed

## HOW IT WORKS

```
┌────────────────────────────────────────────────────────┐
│                    BUILDER OS                          │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   COCKPIT    │  │  AGREEMENT   │  │  MARKETPLACE │ │
│  │  (Personal)  │  │   (Legal)    │  │   (Tools)    │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                 │                 │         │
│         └─────────────────┼─────────────────┘         │
│                           │                           │
│                    ┌──────▼──────┐                    │
│                    │   PROFILE   │                    │
│                    │ (Supabase)  │                    │
│                    └──────┬──────┘                    │
│                           │                           │
│              ┌────────────┼────────────┐              │
│              │            │            │              │
│         ┌────▼───┐  ┌─────▼────┐  ┌────▼────┐        │
│         │Projects│  │Creations │  │Earnings │        │
│         └────────┘  └──────────┘  └─────────┘        │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Core Logic:
1. Builder signs up → fills agreement form
2. Agreement signed digitally → stored in Supabase
3. Profile created with Foundation ID
4. Builder accesses personal Cockpit
5. Creates tools/templates/tutorials
6. Sells on Marketplace (revenue tracked)
7. Downstream derivatives share revenue upstream

## KEY FILES BREAKDOWN

### BUILDER_COCKPIT.html (782 lines)
- **Purpose:** Personal control center for each builder
- **Features:**
  - Project overview
  - Creations listing
  - Earnings dashboard
  - Quick actions
- **Status:** Shows demo data (needs Supabase connection)

### BUILDER_AGREEMENT_FORM.html (620 lines)
- **Purpose:** Digital signature for builder agreements
- **Features:**
  - Form fields for builder info
  - Digital signature capture
  - PDF generation (planned)
  - Supabase submission

### BUILDER_ONBOARDING.html (359 lines)
- **Purpose:** Welcome flow for new builders
- **Features:**
  - Step-by-step intro
  - Domain selection
  - First project setup

### netlify/functions/builder-*.mjs (3 files)
- `builder-dashboard-api.mjs` - Cockpit data API
- `builder-webhook.mjs` - External integrations
- `builder-document-submit.mjs` - Document handling

## DEPENDENCIES

**Required:**
- Supabase (database for profiles, creations)
- Netlify Functions (backend)

**Optional:**
- Stripe (marketplace payments - future)
- PDF generation library (agreements)

## HOW TO RUN

**Web Access:**
```bash
# Cockpit
https://conciousnessrevolution.io/BUILDER_COCKPIT.html

# Agreement form
https://conciousnessrevolution.io/BUILDER_AGREEMENT_FORM.html

# Onboarding
https://conciousnessrevolution.io/BUILDER_ONBOARDING.html

# Landing page
https://conciousnessrevolution.io/LANDING_BUILDER_OS.html
```

**Local Development:**
```bash
cd ~/100X_DEPLOYMENT
netlify dev
# Access: http://localhost:8888/BUILDER_COCKPIT.html
```

## HOW TO BUILD

**No build required** - Plain HTML/CSS/JavaScript.

## HOW TO DEPLOY

```bash
cd ~/100X_DEPLOYMENT
netlify deploy --prod --dir=.
```

## CRITICAL KNOWLEDGE

### Key Concepts:

| Term | Meaning |
|------|---------|
| Builder | Anyone who creates on the platform |
| Cockpit | Personal dashboard for one builder |
| Creation | Something a builder makes (tool, template, etc.) |
| Foundation ID | Unique identifier for each builder |
| Contribution | Value added to the network (tracked for revenue) |
| Downstream | Revenue from derivatives of your creation |

### Builder Agreement Summary:
- Builders own their creations
- Platform takes % of sales (sustainable model)
- Derivative works share revenue upstream
- All work is transparent and tracked

### Important Quirks:
- Cockpit currently shows demo/placeholder data
- Agreement flow needs backend integration testing
- Marketplace UI exists only as concept

### Known Issues:
- No marketplace implementation yet
- Cockpit not personalized (shows generic data)
- Agreement → Profile automation incomplete
- PDF generation not implemented

## CONFIGURATION

**Supabase Tables (expected):**
```sql
-- builder_profiles
id, user_id, foundation_id, name, email, signed_agreement_at, created_at

-- creations
id, builder_id, title, type, description, price, downloads, created_at

-- contributions
id, builder_id, creation_id, amount, downstream_revenue, created_at
```

**Environment Variables:**
```bash
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...
STRIPE_SECRET_KEY=... (future)
```

## API REFERENCE

**GET /api/builder-dashboard-api**
```javascript
// Query params: userId
// Returns builder profile, projects, creations, earnings
```

**POST /api/builder-document-submit**
```javascript
// Body: { userId, documentType, documentData }
// Stores signed agreements
```

## EXAMPLES

### Example 1: Access Cockpit
```bash
https://conciousnessrevolution.io/BUILDER_COCKPIT.html
# Will show demo data until connected to real backend
```

### Example 2: Sign Builder Agreement
```bash
# Go to Agreement Form
https://conciousnessrevolution.io/BUILDER_AGREEMENT_FORM.html
# Fill form, sign digitally, submit
```

## TESTING

**How to test:**
```bash
# Test cockpit loads
curl https://conciousnessrevolution.io/BUILDER_COCKPIT.html

# Test agreement form
# Fill with test data, submit, check Supabase

# Test onboarding flow
# Walk through each step, verify no JS errors
```

## TROUBLESHOOTING

**Problem:** "Cockpit shows generic data"
**Solution:** Expected - needs Supabase integration to show real builder data

**Problem:** "Agreement form not submitting"
**Solution:** Check Supabase connection, verify API endpoint exists

**Problem:** "Can't find my creations"
**Solution:** Creations feature not fully implemented yet

## NEXT STEPS

**Priority actions:**
1. Connect Cockpit to real Supabase data
2. Complete agreement → profile automation
3. Build marketplace UI
4. Implement PDF generation for agreements
5. Add Stripe for marketplace payments

**Known gaps:**
- No marketplace (tools/templates store)
- No real-time earnings tracking
- No derivative revenue sharing system

## TECH STACK

- **Frontend:** HTML/CSS/JS (no framework)
- **Backend:** Netlify Functions
- **Database:** Supabase (builder_profiles, creations)
- **Payments:** Stripe (planned for marketplace)
- **Documents:** PDF generation (planned)

## TAGS
#product #builder #creator #cockpit #marketplace #agreement #onboarding

## METADATA
- **Creator:** Commander (darrickpreble@proton.me)
- **Created:** 2025
- **Last Updated:** 2026-03-06
- **Version:** 1.0
- **HTML Files:** 9 core files
- **Backend Functions:** 3 files
- **Status:** Beta

## RELATED DNAS
- [NETLIFY_DEPLOY_DNA.md] - Hosting infrastructure
- [SUPABASE_DNA.md] - Database backend
- [STRIPE_DNA.md] - Payment processing (future)
- [ARAYA_DNA.md] - AI assistance for builders
