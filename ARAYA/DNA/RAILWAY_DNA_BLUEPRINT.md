# RAILWAY DNA BLUEPRINT

**Status:** ACTIVE

## Complete Knowledge Capture: Past → Present → Future
## "The Cloud Infrastructure Backbone"

---

**Status:** ACTIVE
**Domain:** 2_BUILD (Infrastructure)
**Created:** Jan 12, 2026
**Last Updated:** Jan 12, 2026
**DNA Version:** 1.0
**Completeness:** 95%

---

# IDENTITY STRAND
## What Is This?

Railway is our **Production Cloud Infrastructure** - the place where all deployed services live.

## Why Does It Exist?

| Need | Railway Solution |
|------|------------------|
| Deploy APIs | One-click from GitHub |
| Run Discord bots | 24/7 container hosting |
| Host databases | Managed PostgreSQL |
| Scale globally | Multi-region deployment |
| Serverless compute | Railway Functions |

## Who Uses It?

- **100X Platform** - consciousness-platform-api (DeepSeek)
- **ARAYA** - gleaming-tranquility API + Discord bot
- **Cyclotron Cloud** - Claude-powered brain backup
- **Philosopher AI** - Main AI app + Postgres

---

# PAST STRAND (Archaeological Record)

## Failed Attempts (Dead Ends)

| Attempt | Why Failed | Lesson Learned | Date |
|---------|------------|----------------|------|
| builder-pattern-api | 0 env vars, crash loops | Don't deploy empty shells | Jan 12, 2026 |
| trinity-api | OOM errors, SIGKILL | Set resource limits first | Jan 12, 2026 |
| trinity-wake-system | Missing file paths | Test locally before deploy | Jan 12, 2026 |
| graceful-art | Redundant with other services | Consolidate before deploying | Jan 12, 2026 |
| ai-app-generator-api | Build failed, never recovered | Fix builds before scaling | Dec 2025 |
| instabot | Empty, never configured | Delete unused projects | Dec 2025 |
| 10+ other projects | Various failures | Clean up regularly | 2024-2025 |

## Successful Patterns (What Worked)

| Pattern | Why It Works | Reusable? |
|---------|--------------|-----------|
| DeepSeek backend | Cheaper than OpenAI, good quality | YES |
| GitHub auto-deploy | Push to main = live | YES |
| PostgreSQL internal | Private networking saves $ | YES |
| Supabase hybrid | Railway + Supabase = powerful | YES |
| CLI management | `railway link` + `railway logs` | YES |

## Version History

| Version | Date | Changes |
|---------|------|---------|
| v0.1 | Oct 2024 | First Railway account |
| v0.5 | Dec 2025 | 17+ projects (chaos) |
| v1.0 | Jan 12, 2026 | Cleaned to 4 projects, CLI setup |

## Key Decisions Made

| Decision | Reasoning | Status |
|----------|-----------|--------|
| Delete 10+ projects | Wasting money, not functional | DONE |
| Use private networking | Save egress fees | TODO |
| Keep Hobby tier | Good enough for now, $5 included | CURRENT |
| DeepSeek over OpenAI | Cost effective | DONE |

---

# PRESENT STRAND (Current State)

## Current Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    RAILWAY (4 Projects / ~$25-30/mo)            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │            HIGH VALUE (Keep Running 24/7)                │    │
│  │                                                          │    │
│  │  ┌───────────────────┐  ┌───────────────────┐           │    │
│  │  │ philosopher-ai-   │  │ zestful-rejoicing │           │    │
│  │  │ backend           │  │ (ARAYA Discord)   │           │    │
│  │  │ [4 services]      │  │ [2 services]      │           │    │
│  │  │ • cloud-funnel    │  │ • araya-bot       │           │    │
│  │  │ • postgres (12TB) │  │ • gleaming-tranq  │           │    │
│  │  └───────────────────┘  └───────────────────┘           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │            CAN SLEEP (Low traffic, enable serverless)    │    │
│  │                                                          │    │
│  │  ┌───────────────────┐  ┌───────────────────┐           │    │
│  │  │ cyclotron-cloud   │  │ consciousness-    │           │    │
│  │  │ (Claude brain)    │  │ platform-api      │           │    │
│  │  │ ANTHROPIC_KEY     │  │ DEEPSEEK_KEY      │           │    │
│  │  │ ~0 requests/day   │  │ ~0 requests/day   │           │    │
│  │  └───────────────────┘  └───────────────────┘           │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Active Components

| Project | Services | Status | Monthly |
|---------|----------|--------|---------|
| philosopher-ai-backend | 4 | ONLINE | $10-15 |
| cyclotron-cloud | 1 | ONLINE | $5 |
| consciousness-platform-api | 1 | ONLINE | $5 |
| zestful-rejoicing | 2 | ONLINE | $5 |

## Live Connections

| Service | URL | Verified |
|---------|-----|----------|
| consciousness-platform-api | /health → 200 | Jan 12, 2026 |
| consciousness-platform-api | /stats → 200 | Jan 12, 2026 |
| gleaming-tranquility (ARAYA) | /status → 200 | Jan 12, 2026 |
| philosopher-ai-backend | Root → JSON | Jan 12, 2026 |
| cyclotron-cloud | Root → 404 | Jan 12, 2026 |

## Current Metrics

| Metric | Value |
|--------|-------|
| Total Projects | 4 |
| Total Services | 8 |
| Monthly Spend | ~$25-30 |
| Tier | Hobby ($5 included) |
| CLI Version | 4.10.0 (latest: 4.23.0) |
| Account | darrick.preble@gmail.com |

## Known Issues

| Issue | Impact | Fix |
|-------|--------|-----|
| No private networking | Paying egress fees | Update DATABASE_URLs |
| No app sleep | Services run 24/7 | Enable serverless mode |
| No resource limits | Unbounded costs | Set RAM/CPU caps |
| No healthchecks | Manual monitoring | Add /health endpoints |
| CLI outdated | Missing features | `npm i -g @railway/cli` |

---

# FUTURE STRAND (Evolution Path)

## Immediate Next Steps (This Week)

| Step | Command | Impact |
|------|---------|--------|
| Enable private networking | Update env vars | -$5/mo |
| Enable app sleep | Dashboard toggle | -$7/mo |
| Set resource limits | Dashboard config | Predictable |
| Upgrade CLI | `npm i -g @railway/cli` | New features |

## Planned Upgrades (This Month)

| Upgrade | Benefit | Complexity |
|---------|---------|------------|
| Add Redis cache | Faster ARAYA | Medium |
| First cron job | Automated backups | Low |
| Railway Functions | Serverless webhooks | Medium |
| Preview deployments | PR testing | Low |

## Scaling Vision (When Needed)

| Scale | Trigger | Action |
|-------|---------|--------|
| 100 users | Launch | Current setup works |
| 1,000 users | Traction | Add replicas |
| 10,000 users | Growth | Multi-region |
| 100,000 users | Scale | Pro tier + regions |

## Integration Opportunities

| Integration | Benefit |
|-------------|---------|
| GitHub Actions | Auto-deploy on merge |
| OpenTelemetry | Full observability |
| Doppler | Better secrets management |
| Railway AI | Troubleshooting assistance |

---

# CONNECTIONS STRAND (Dependency Map)

## Upstream Dependencies

| Dependency | Purpose | Critical? |
|------------|---------|-----------|
| GitHub | Source code | YES |
| Supabase | Additional database | YES (for ARAYA) |
| Anthropic API | cyclotron-cloud brain | YES |
| DeepSeek API | consciousness-platform | YES |
| Discord API | ARAYA bot | YES |

## Downstream Consumers

| Consumer | Uses | Protocol |
|----------|------|----------|
| 100X Website | consciousness-platform-api | HTTPS |
| Discord | araya-discord-bot | WebSocket |
| Local ARAYA | gleaming-tranquility | HTTPS |
| Admin | All dashboards | Browser |

## Peer Connections

| Peer DNA | Connection Type | Notes |
|----------|-----------------|-------|
| PLATFORM_DNA | provides_to | Hosts 100X backend |
| ARAYA_DNA | provides_to | Hosts ARAYA API |
| CREDENTIALS_DNA | credentials_from | Stores API keys |
| AUTOMATION_DNA | peers_with | CLI automation |
| BRAIN_DNA | provides_to | Cloud backup brain |

---

# CREDENTIALS STRAND (Secrets Vault)

## API Keys Required

| Key | Service | Location |
|-----|---------|----------|
| ANTHROPIC_API_KEY | cyclotron-cloud | Railway env |
| DEEPSEEK_API_KEY | consciousness-platform-api | Railway env |
| DISCORD_TOKEN | zestful-rejoicing | Railway env |
| SUPABASE_SERVICE_KEY | zestful-rejoicing | Railway env |
| DATABASE_URL | philosopher-ai-backend | Railway env |
| JWT_SECRET | philosopher-ai-backend | Railway env |

## Tokens & Secrets

| Token | Purpose | Rotation |
|-------|---------|----------|
| Railway Session | CLI auth | Manual login |
| Project Tokens | CI/CD (future) | Never expires |

## Access Credentials

| Access | Method | Notes |
|--------|--------|-------|
| Dashboard | darrick.preble@gmail.com | Browser |
| CLI | `railway login` | Authenticated |
| Database | `railway connect` | psql shell |

---

# LOG STRAND (Timeline)

## Captain's Log

### Jan 12, 2026 - RAILWAY CLEANUP + CLI MASTERY
**Event:** Deleted 10+ broken projects, logged into CLI, extracted all configs
**Impact:** Railway now documented, CLI automation enabled
**Next:** Enable private networking, app sleep

### Dec 2025 - CHAOS STATE
**Event:** 17+ projects, most broken or unused
**Impact:** Wasting money, hard to navigate
**Lesson:** Clean up regularly

### Oct 2024 - FIRST DEPLOYMENT
**Event:** Created Railway account
**Impact:** Started cloud infrastructure journey
**Lesson:** Document as you go

## Session History

| Date | Action | Who |
|------|--------|-----|
| Jan 12, 2026 | CLI login, full extraction | C1 |
| Jan 12, 2026 | Deleted builder-pattern-api | Commander |
| Jan 12, 2026 | Deleted trinity-wake-system | Commander |
| Jan 12, 2026 | Deleted graceful-art | Commander |
| Jan 12, 2026 | Created master blueprints | C1 |

---

# QUICK COMMANDS

```bash
# === STATUS ===
railway whoami                    # Check login
railway list                      # All projects
railway status                    # Current context

# === LINK TO PROJECTS ===
railway link -p philosopher-ai-backend -s philosopher-ai-backend
railway link -p cyclotron-cloud -s cyclotron-cloud
railway link -p consciousness-platform-api -s consciousness-platform-api
railway link -p zestful-rejoicing -s araya-discord-bot

# === OPERATIONS ===
railway logs                      # View logs
railway variables                 # Show env vars
railway connect                   # Database shell
railway up                        # Deploy

# === ADVANCED ===
railway scale --us-west2 2        # Horizontal scaling
railway functions list            # Serverless functions
railway deploy -t redis           # Add Redis
```

---

# GAME THEORY DECISION MATRIX

## Move 1: Private Networking

| Option | Payoff | Risk | Recommendation |
|--------|--------|------|----------------|
| **Enable Now** | -$5/mo, better security | Low (just env var changes) | **DO THIS** |
| Wait | $0 savings | None | Don't wait |

**Cheat Code:** `railway variables --set DATABASE_URL="postgresql://...@postgres.railway.internal:5432/railway"`

## Move 2: App Sleep

| Option | Payoff | Risk | Recommendation |
|--------|--------|------|----------------|
| **Enable on idle services** | -$7/mo | Cold start latency | **DO THIS** |
| Keep running 24/7 | $0 savings | None | Wasteful |

**Cheat Code:** Dashboard → Service → Settings → Enable Serverless

## Move 3: Resource Limits

| Option | Payoff | Risk | Recommendation |
|--------|--------|------|----------------|
| **Set caps** | Predictable billing | OOM if too low | **DO THIS** |
| Unbounded | Variable costs | Surprise bills | Risky |

**Cheat Code:** Dashboard → Service → Settings → Resources → Set limits

## Move 4: Upgrade CLI

| Option | Payoff | Risk | Recommendation |
|--------|--------|------|----------------|
| **Upgrade** | New features, bug fixes | Breaking changes | **DO THIS** |
| Stay on 4.10.0 | Stability | Missing features | Fine for now |

**Cheat Code:** `npm i -g @railway/cli`

---

# OPTIMIZATION CHEAT CODES

| Cheat Code | Effect | Command |
|------------|--------|---------|
| **PRIVATE_NET** | Eliminate egress fees | Use `*.railway.internal` |
| **SLEEP_MODE** | Cut idle costs 80% | Enable serverless |
| **RESOURCE_CAP** | Predictable bills | Set RAM/CPU limits |
| **CACHE_LAYER** | Speed boost | `railway deploy -t redis` |
| **MULTI_REGION** | Global coverage | `railway scale --europe-west4 1` |
| **CRON_JOB** | Scheduled tasks | Set cron schedule in UI |
| **FUNCTION** | Serverless compute | `railway functions new` |

---

# COMPASS: WHERE WE'RE GOING

```
                           NORTH
                      MULTI-REGION
                      (Pro Tier)
                           ↑
                           |
                      ┌────┴────┐
                      │ SCALING │
                      │ PHASE   │
                      └────┬────┘
                           |
      WEST ←───────────────┼───────────────→ EAST
   FUNCTIONS               |              CRON JOBS
   (Serverless)       ┌────┴────┐         (Scheduled)
                      │ CURRENT │
                      │ (YOU)   │
                      └────┬────┘
                           |
                      ┌────┴────┐
                      │ OPTIMIZE│
                      │ PHASE   │
                      └────┬────┘
                           |
                           ↓
                         SOUTH
                    PRIVATE NETWORKING
                    + APP SLEEP
                    (Cost Savings)
```

**Current Position:** Center
**Next Move:** SOUTH (Optimize first, then scale)

---

# META

**DNA Maintainer:** C1 Mechanic
**Review Cadence:** Weekly
**Last Audit:** Jan 12, 2026
**Completeness:** 95%
**Related DNAs:** PLATFORM_DNA, ARAYA_DNA, CREDENTIALS_DNA, AUTOMATION_DNA

---

*RAILWAY DNA BLUEPRINT v1.0*
*The Cloud Infrastructure Backbone*
