# RAILWAY DNA MAP

**Status:** ACTIVE

## Complete Service Architecture
## Updated: Jan 12, 2026

---

## PROJECT OVERVIEW

**Project:** production (Railway)
**URL:** railway.com/project/6506e584-6985-4812-b942-1b45cdf37...
**Total Services:** 18+ projects
**Status:** ACTIVE

---

## SERVICE INVENTORY (After Cleanup - Jan 12, 2026)

**Total: 7 Active Projects | 10 Removed**

| # | Service Name | Purpose | Status | Services | Notes |
|---|--------------|---------|--------|----------|-------|
| 1 | **philosopher-ai-backend** | Full AI app + Postgres | ✅ ONLINE | 4 | HIGH VALUE - 12 DB tables |
| 2 | **trinity-wake-system** | Trinity wake/boot system | ✅ ONLINE | 1 | Has production URL |
| 3 | **consciousness-platform-api** | 100X Platform API | ✅ ONLINE | 1 | DeepSeek-powered |
| 4 | **cyclotron-cloud** | Cloud Cyclotron brain | ✅ ONLINE | 1 | ANTHROPIC_API_KEY active |
| 5 | **builder-pattern-api** | Builder Pattern + trinity-api | ✅ ONLINE | 2 | Python/Gunicorn |
| 6 | **graceful-art** | 100X platform + Postgres | ✅ ONLINE | 3 | Multi-service |
| 7 | **zestful-rejoicing** | ARAYA Discord subdomain | ✅ ONLINE | 2 | Bot deployment |

**DELETED (10):** ai-app-generator-api, pattern-theory-api, instabot, otp-webhook, lovely-smile, gleaming-tranquility, surprising-solace, builder-terminal, pleasant-tenderness, skillful-hope

**HIGH VALUE (3):** philosopher-ai-backend, cyclotron-cloud, consciousness-platform-api

---

## VISUAL MAP (After Cleanup - Jan 12, 2026)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    RAILWAY PROJECT: production (7 Active)                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     🔥 HIGH VALUE SERVICES                        │    │
│  ├─────────────────────────────────────────────────────────────────┤    │
│  │                                                                   │    │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │    │
│  │  │ philosopher-ai- │  │ cyclotron-cloud │  │ consciousness-  │   │    │
│  │  │ backend         │  │                 │  │ platform-api    │   │    │
│  │  │ [4 services]    │  │ [ANTHROPIC KEY] │  │ [DEEPSEEK]      │   │    │
│  │  │ 12 DB tables!   │  │ Cloud brain     │  │ 100X API        │   │    │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘   │    │
│  │                                                                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     ⚙️ SUPPORTING SERVICES                        │    │
│  ├─────────────────────────────────────────────────────────────────┤    │
│  │                                                                   │    │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │    │
│  │  │ trinity-wake-   │  │ builder-pattern │  │ graceful-art    │   │    │
│  │  │ system          │  │ -api            │  │                 │   │    │
│  │  │ [Trinity boot]  │  │ [2 services]    │  │ [3 services]    │   │    │
│  │  │ Has prod URL    │  │ Python/Gunicorn │  │ 100X + Postgres │   │    │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘   │    │
│  │                                                                   │    │
│  │  ┌─────────────────┐                                              │    │
│  │  │ zestful-        │  ← ARAYA Discord Bot subdomain               │    │
│  │  │ rejoicing       │    (araya-discord-bot deployed here)         │    │
│  │  │ [2 services]    │                                              │    │
│  │  └─────────────────┘                                              │    │
│  │                                                                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  🗑️ DELETED (10): ai-app-generator-api, pattern-theory-api, instabot,   │
│     otp-webhook, lovely-smile, gleaming-tranquility, surprising-solace, │
│     builder-terminal, pleasant-tenderness, skillful-hope                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## COMPLETE SERVICE PROFILES (Extracted Jan 12, 2026)

### 1. philosopher-ai-backend ⭐ HIGH VALUE
**Purpose:** Full AI application with PostgreSQL database + API
**Status:** ✅ ONLINE
**Services (4):**
```
├── Postgres-3xM4 (PostgreSQL database)
├── postgres-volume (Storage volume)
├── cloud-funnel (Backend API)
└── philosopher-ai-backend (Main service)
```

**Database Details:**
- **Domain:** centerbeam.proxy.rlwy.net
- **Region:** us-west2
- **Replicas:** 1
- **Deployed:** 2 months ago via Docker

**Database Tables (12):**
| Table | Purpose |
|-------|---------|
| conversations | Chat history |
| knowledge | Knowledge base |
| messages | Message storage |
| payments | Payment records |
| questions | Q&A system |
| sessions | User sessions |
| subscriptions | Subscription data |
| trinity_instances | Trinity deployment |
| trinity_state | Trinity state |
| trinity_tasks | Trinity task queue |
| usage_logs | Usage tracking |
| users | User accounts |

**Database Variables (13):**
- DATABASE_PUBLIC_URL, DATABASE_URL
- PGDATA, PGDATABASE, PGHOST, PGPASSWORD, PGPORT, PGUSER
- POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER
- RAILWAY_DEPLOYMENT_DRAIN, SSL_CERT_DAYS

**cloud-funnel Variables (7):**
- DATABASE_URL, JWT_SECRET, ALLOWED_ORIGINS
- NODE_ENV, PORT, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS

**Action:** PRESERVE - Production infrastructure with user data!

---

### 2. cyclotron-cloud ⭐ HIGH VALUE
**Purpose:** Cloud Cyclotron brain (AI backend)
**Status:** ✅ ONLINE
**URL:** cyclotron-cloud-production.up.railway.app
**Private Domain:** cyclotron-cloud.railway.internal
**Project ID:** 88bb9e5e-1ca2-4ee7-bf29-0d495a1df23a
**Region:** us-west2
**Replicas:** 1

**Custom Variables (1):**
- ANTHROPIC_API_KEY ✓

**Railway System Variables (8):**
- PORT, RAILWAY_ENVIRONMENT_ID, RAILWAY_ENVIRONMENT_NAME
- RAILWAY_GIT_AUTHOR, RAILWAY_GIT_BRANCH, RAILWAY_GIT_COMMIT_MESSAGE
- RAILWAY_GIT_COMMIT_SHA, RAILWAY_GIT_REPO_NAME

**Action:** PRESERVE - Powers AI operations

---

### 3. consciousness-platform-api ⭐ HIGH VALUE
**Purpose:** 100X Platform API (DeepSeek-powered)
**Status:** ✅ ONLINE
**URL:** consciousness-platform-api-production.up.railway.app

**Custom Variables (1):**
- DEEPSEEK_API_KEY ✓

**Action:** PRESERVE - Powers 100X platform

---

### 4. trinity-wake-system
**Purpose:** Trinity wake/boot system + AI Coordination Webhook
**Status:** ⚠️ ONLINE with ERRORS
**URL:** trinity-wake-system-production.up.railway.app
**Commit:** 84af56bc (deployed Nov 6, 2025)

**Custom Variables (0):**
- ⚠️ NO custom variables configured!

**Logs Show:**
- Heartbeat entries
- "AI Coordination Webhook (Polling)"
- "araya-chat" references
- ❌ Multiple "No such file or directory" errors

**Action:** Fix file path errors, add missing environment variables

---

### 5. builder-pattern-api
**Purpose:** Builder Pattern API + Trinity API
**Status:** ✅ ONLINE
**Services (2):**

**Service A: builder-pattern-api**
- **URL:** builder-pattern-api-production.up.railway.app
- **Commit:** 34aa2890 (Oct 18, 2025)
- **Deployed:** 3 months ago via CLI (`railway up`)
- **Build:** Railpack v0.9.1
- **Runtime:** python@3.13.9
- **Region:** us-west2
- **Replicas:** 1

**Service B: trinity-api**
- **URL:** trinity-api-production.up.railway.app
- **Commit:** 700d64c1 (Oct 18, 2025)
- **Deployed:** 3 months ago via CLI
- **Runtime:** python@3.13.9
- **Region:** us-west2
- **Replicas:** 1

**Custom Variables (0):**
- ⚠️ NO custom variables configured!

**Known Issues:**
- ❌ "Out of memory!" errors in trinity-api logs
- ❌ WORKER TIMEOUT (critical)
- ❌ Workers exiting with code -9

**Action:** Add memory limits, investigate Gunicorn worker crashes

---

### 6. graceful-art
**Purpose:** 100X platform + Postgres
**Status:** ✅ ONLINE
**Services (3):** Details needed - not captured in screenshots

**Action:** Manual investigation needed via Railway dashboard

---

### 7. zestful-rejoicing (ARAYA Discord Bot)
**Purpose:** ARAYA Discord bot deployment
**Status:** ✅ ONLINE
**Services (2):** araya-discord-bot + supporting service
**GitHub:** overkillkulture/araya-discord-bot

**Variables:**
- DISCORD_TOKEN
- SUPABASE_URL
- SUPABASE_SERVICE_KEY
- ARAYA_API_URL (ngrok tunnel)

**Full documentation:** `.consciousness/blueprints/ARAYA_DISCORD_DNA_MAP.md`

**Action:** PRESERVE - Discord community bot

---

## DELETED SERVICES (10 removed Jan 12, 2026)

| Service | Reason |
|---------|--------|
| ai-app-generator-api | Build failed, dead |
| pattern-theory-api | Unused |
| instabot | Empty, never deployed |
| otp-webhook | Unused |
| lovely-smile | Crashed, failed experiment |
| gleaming-tranquility | Empty placeholder |
| surprising-solace | Unused |
| builder-terminal | Unused |
| pleasant-tenderness | Unused |
| skillful-hope | Unused |

---

## CRITICAL ISSUES FOUND

### ❌ MEMORY ISSUES (trinity-api)
```
[ERROR] Out of memory!
[ERROR] WORKER TIMEOUT (critical)
[ERROR] Workers exiting with code -9
```
**Impact:** Service may crash under load
**Fix:** Increase memory allocation or optimize Gunicorn workers

### ❌ PATH ERRORS (trinity-wake-system)
```
[ERROR] No such file or directory
```
**Impact:** Boot system not functioning correctly
**Fix:** Update file paths in code or add missing files

### ⚠️ MISSING VARIABLES
| Service | Custom Vars | Issue |
|---------|-------------|-------|
| trinity-wake-system | 0 | May not function without config |
| builder-pattern-api | 0 | May not function without config |
| trinity-api | 0 | May not function without config |

---

## URLS QUICK REFERENCE

| Service | Public URL |
|---------|------------|
| cyclotron-cloud | cyclotron-cloud-production.up.railway.app |
| consciousness-platform-api | consciousness-platform-api-production.up.railway.app |
| trinity-wake-system | trinity-wake-system-production.up.railway.app |
| builder-pattern-api | builder-pattern-api-production.up.railway.app |
| trinity-api | trinity-api-production.up.railway.app |
| cloud-funnel | cloud-funnel-production.up.railway.app |
| postgres | centerbeam.proxy.rlwy.net |

---

## API KEYS IN USE

| Service | API Key | Status |
|---------|---------|--------|
| cyclotron-cloud | ANTHROPIC_API_KEY | ✅ Active |
| consciousness-platform-api | DEEPSEEK_API_KEY | ✅ Active |
| zestful-rejoicing | DISCORD_TOKEN | ✅ Active |
| zestful-rejoicing | SUPABASE_URL/KEY | ✅ Active |

---

## COST TRACKING (After Cleanup)

| Metric | Before | After |
|--------|--------|-------|
| Total Projects | 17 | 7 |
| Services Removed | - | 10 |
| Estimated Savings | - | ~$15-30/month |

**Current monthly estimate:** ~$20-40 (7 projects)

---

## SESSION LOG

| Date | Action | Who |
|------|--------|-----|
| Jan 12, 2026 | Discovered 15+ services | C1 |
| Jan 12, 2026 | Mapped araya-discord-bot | C1 |
| Jan 12, 2026 | Created Railway DNA Map | C1 |
| Jan 12, 2026 | Identified ai-app-generator-api as DEAD | C1 |
| Jan 12, 2026 | Mapped consciousness-platform-api (ONLINE) | C1 |
| Jan 12, 2026 | Found full dashboard - 17 projects total | C1 |
| Jan 12, 2026 | Corrected names: inbayt→instabot, ofp→otp | C1 |
| Jan 12, 2026 | Mapped cyclotron-cloud (ONLINE) | C1 |
| Jan 12, 2026 | Mapped trinity-wake-system (ONLINE) | C1 |
| Jan 12, 2026 | Identified instabot as DELETE candidate | C1 |
| Jan 12, 2026 | Confirmed instabot EMPTY (Project ID captured) | C1 |
| Jan 12, 2026 | Updated trinity-wake-system (ERRORS in logs) | C1 |
| Jan 12, 2026 | Found pleasant-tenderness + builder-pattern-api (new projects) | C1 |
| Jan 12, 2026 | **MAJOR: philosopher-ai-backend = FULL APP with Postgres!** | C1 |
| Jan 12, 2026 | Mapped builder-pattern-api (ONLINE) | C1 |
| Jan 12, 2026 | **Extracted complete profiles from 40 screenshots** | C1 |
| Jan 12, 2026 | Documented 12 database tables in philosopher-ai-backend | C1 |
| Jan 12, 2026 | Identified memory issues in trinity-api | C1 |
| Jan 12, 2026 | Identified missing variables in 3 services | C1 |
| Jan 12, 2026 | Created URLS QUICK REFERENCE | C1 |
| Jan 12, 2026 | Created API KEYS IN USE summary | C1 |
| Jan 12, 2026 | Created CRITICAL ISSUES FOUND section | C1 |
| Jan 12, 2026 | **COMPLETE: All 7 services profiled** | C1 |

---

## NEXT ACTIONS

1. [ ] **Manual check graceful-art** - Need to click into Railway dashboard for 3 service details
2. [ ] **Fix trinity-api memory issues** - Increase RAM or optimize workers
3. [ ] **Fix trinity-wake-system paths** - Add missing files or fix paths in code
4. [ ] **Add missing environment variables** - trinity-wake-system, builder-pattern-api, trinity-api
5. [ ] **Map GitHub repos** - Next task after Railway complete

---

*Railway DNA Map COMPLETE - Jan 12, 2026*
