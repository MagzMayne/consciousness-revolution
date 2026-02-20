# RAILWAY WORLD-CLASS BLUEPRINT
## Complete Capability Map + Optimization Guide
## Generated: Jan 12, 2026

---

## EXECUTIVE SUMMARY

**Account:** darrick.preble@gmail.com
**Current Tier:** Hobby (~$5/month included credits)
**Active Projects:** 4
**Monthly Spend:** ~$25-30

**VERDICT:** We're using **KINDERGARTEN Railway** (20% of capabilities).
Railway has multi-region scaling, serverless functions, cron jobs, private networking, and more.

---

## PART 1: WHAT WE'RE USING (Current State)

### Active Projects (4)

| Project | Services | Purpose | Monthly Est. |
|---------|----------|---------|--------------|
| philosopher-ai-backend | 4 | AI App + Postgres | $10-15 |
| cyclotron-cloud | 1 | Claude Brain | $5 |
| consciousness-platform-api | 1 | 100X API (DeepSeek) | $5 |
| zestful-rejoicing | 2 | ARAYA Discord Bot | $5 |

### Features Currently In Use

| Feature | Using? | Notes |
|---------|--------|-------|
| Basic Deployment | YES | GitHub → Railway |
| PostgreSQL | YES | philosopher-ai-backend |
| Environment Variables | YES | API keys stored |
| Public Domains | YES | *.up.railway.app |
| CLI Access | YES | Just set up today! |
| Private Networking | NO | Could save $ |
| Cron Jobs | NO | Not configured |
| Serverless/App Sleep | NO | Services run 24/7 |
| Multi-Region | NO | Single region |
| Functions | NO | Not using |
| Healthchecks | NO | Not configured |
| Resource Limits | NO | Unbounded |
| Templates | NO | Manual setup |

### Current Architecture
```
                    INTERNET
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌───────────────┐ ┌───────────┐ ┌───────────────┐
│ philosopher-  │ │ cyclotron │ │consciousness- │
│ ai-backend    │ │ -cloud    │ │platform-api   │
│ (PUBLIC)      │ │ (PUBLIC)  │ │ (PUBLIC)      │
└───────────────┘ └───────────┘ └───────────────┘
        │
        │ PUBLIC connection (egress $$$)
        ▼
┌───────────────┐
│  PostgreSQL   │
│  (PUBLIC)     │
└───────────────┘

     ┌─────────────────────────────────┐
     │       zestful-rejoicing         │
     │  ┌─────────────┐ ┌───────────┐  │
     │  │ Discord Bot │→│ ARAYA API │  │
     │  │ (PUBLIC)    │ │ (PUBLIC)  │  │
     │  └─────────────┘ └───────────┘  │
     └─────────────────────────────────┘
                 │
                 ▼
            Discord + Supabase
```

**PROBLEM:** Everything is public, paying egress fees, no optimization.

---

## PART 2: WHAT RAILWAY OFFERS (Full Capability Map)

### Tier Comparison

| Feature | Free | Hobby (US) | Pro | Enterprise |
|---------|------|------------|-----|------------|
| Projects | 1 | 50 | 100 | Unlimited |
| RAM/Service | 0.5 GB | **8 GB** | 32 GB | 64 GB |
| CPU/Service | 1 vCPU | **8 vCPU** | 32 vCPU | 32+ vCPU |
| Volume Storage | 0.5 GB | **5 GB** | 250 GB | 2 TB |
| Log Retention | 3 days | **7 days** | 30 days | 90 days |
| Replicas/Scaling | NO | **YES** | YES | YES |
| Custom Domains | NO | **YES** | YES | YES |
| Multi-Region | NO | **YES** | YES | YES |
| Functions | NO | **YES** | YES | YES |

**We're on Hobby tier - we have access to scaling, functions, multi-region!**

### Full Feature Matrix

| Category | Feature | Available? | We Use? | Gap |
|----------|---------|------------|---------|-----|
| **Deployment** | GitHub Deploy | YES | YES | - |
| | Docker Deploy | YES | NO | Could use |
| | CLI Deploy (`railway up`) | YES | YES | - |
| | Template Deploy | YES | NO | **BIG GAP** |
| **Scaling** | Horizontal (Replicas) | YES | NO | **BIG GAP** |
| | Multi-Region | YES | NO | **BIG GAP** |
| | Auto-scaling | NO | - | Not available |
| **Compute** | Functions (Serverless) | YES | NO | **BIG GAP** |
| | Cron Jobs | YES | NO | **BIG GAP** |
| | App Sleep | YES | NO | **COST SAVER** |
| **Database** | PostgreSQL | YES | YES | - |
| | MySQL | YES | NO | - |
| | Redis | YES | NO | Could cache |
| | MongoDB | YES | NO | - |
| **Networking** | Private Networking | YES | NO | **COST SAVER** |
| | Custom Domains | YES | NO | Could use |
| | SSL/TLS | YES | YES | Auto |
| **DevOps** | Healthchecks | YES | NO | Should add |
| | Restart Policies | YES | NO | Should add |
| | Resource Limits | YES | NO | Should add |
| | Preview Deploys | YES | NO | Could use |
| **Observability** | Logs | YES | YES | 7 day limit |
| | Metrics (CPU/RAM) | YES | NO | Should use |
| | OpenTelemetry | YES | NO | Advanced |

---

## PART 3: GAP ANALYSIS (University vs Kindergarten)

### CRITICAL GAPS (High Impact)

#### 1. NO PRIVATE NETWORKING
**Current:** All services communicate via public internet = egress fees
**Fix:** Use `*.railway.internal` for internal communication
**Savings:** $0.05/GB eliminated for internal traffic

```
# BEFORE (paying egress)
DATABASE_URL=postgresql://postgres:xxx@centerbeam.proxy.rlwy.net:5432/railway

# AFTER (free internal)
DATABASE_URL=postgresql://postgres:xxx@postgres.railway.internal:5432/railway
```

#### 2. NO APP SLEEP (Services run 24/7)
**Current:** Services run continuously even when unused
**Fix:** Enable serverless mode on low-traffic services
**Savings:** 50-80% on idle services

```bash
# consciousness-platform-api gets ~0 requests/day
# Should be sleeping, not running 24/7
```

#### 3. NO CRON JOBS
**Current:** No scheduled tasks on Railway
**Fix:** Set up cron services for:
- Database backups
- Cache cleanup
- Health monitoring
- Report generation

```bash
# Example: Daily backup at 3 AM UTC
railway deploy --template cron
# Set schedule: 0 3 * * *
```

#### 4. NO FUNCTIONS (Serverless)
**Current:** Full services for small tasks
**Fix:** Use Railway Functions for:
- Webhook handlers
- Small API endpoints
- Event processors

```bash
railway functions new --name webhook-handler
railway functions push
```

#### 5. NO MULTI-REGION SCALING
**Current:** Single region (us-west2)
**Potential:** Scale to 8 regions worldwide:
- us-west1, us-west2, us-east4
- europe-west4
- asia-southeast1
- Plus metal regions (drams3a, eqsg3a, eqdc4a)

```bash
railway scale --us-west2 2 --us-east4 1 --europe-west4 1
```

### MODERATE GAPS

#### 6. NO HEALTHCHECKS
**Current:** Railway doesn't know if services are healthy
**Fix:** Add `/health` endpoints + configure Railway healthchecks
**Benefit:** Auto-restart unhealthy services

#### 7. NO RESOURCE LIMITS
**Current:** Services can consume unlimited resources
**Fix:** Set RAM/CPU caps per service
**Benefit:** Prevent runaway costs, predictable billing

#### 8. NO TEMPLATES
**Current:** Manual setup for everything
**Fix:** Use pre-built templates:
- [Discord AI Bot](https://railway.com/deploy/discord-ai)
- [Chat-GPT Discord Bot](https://railway.com/template/1cSU5t)
- [PostgreSQL](https://railway.com/deploy/postgres)

---

## PART 4: OPTIMIZATION OPPORTUNITIES

### Immediate Cost Savings

| Optimization | Current Cost | After | Savings |
|--------------|--------------|-------|---------|
| Private Networking | ~$5/mo egress | $0 | $5/mo |
| App Sleep (consciousness-api) | $5/mo | ~$1/mo | $4/mo |
| App Sleep (cyclotron-cloud) | $5/mo | ~$2/mo | $3/mo |
| Resource Limits | Variable | Capped | Predictable |
| **TOTAL** | ~$30/mo | ~$18/mo | **$12/mo (40%)** |

### Implementation Commands

```bash
# 1. Enable private networking (update env vars)
railway link -p philosopher-ai-backend -s cloud-funnel
railway variables --set DATABASE_URL="postgresql://postgres:xxx@postgres.railway.internal:5432/railway"

# 2. Check current usage
railway status

# 3. Set resource limits (in Railway dashboard)
# Memory: 512MB cap for low-traffic services
# CPU: 0.5 vCPU cap for background services

# 4. Enable app sleep (in Railway dashboard)
# Settings → Serverless → Enable
```

---

## PART 5: ADVANCED FEATURES TO IMPLEMENT

### 1. Preview Deployments (PR Previews)
Every pull request gets its own Railway environment for testing.
**Benefit:** Test changes before production

### 2. AI-Assisted DevOps
Railway's AI can troubleshoot builds, recommend configs.
**Access:** Dashboard → AI Assistant

### 3. Horizontal Scaling
```bash
# Scale ARAYA API to 3 instances
railway link -p zestful-rejoicing -s gleaming-tranquility
railway scale --us-west2 3
```

### 4. Cron Job Services
```bash
# Create backup service
railway init
# Configure cron schedule in service settings
# Set: 0 */6 * * * (every 6 hours)
```

### 5. Redis Cache
```bash
railway deploy --template redis
# Connect services to Redis for caching
# Reduces database load, speeds responses
```

---

## PART 6: WHAT OTHERS ARE DOING (Best Practices)

### Discord Bot Pattern (University Grade)
```
┌─────────────────────────────────────────────────┐
│                Railway Project                   │
├─────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────┐  │
│  │ Discord Bot │→→│ Redis Cache │→→│ AI API  │  │
│  │  (Always On)│  │ (Internal)  │  │ (Sleep) │  │
│  └─────────────┘  └─────────────┘  └─────────┘  │
│         │                               │        │
│         └──────────┬───────────────────┘        │
│                    ▼                             │
│              ┌───────────┐                       │
│              │ PostgreSQL │ (Internal only)      │
│              └───────────┘                       │
│                                                  │
│  All communication via railway.internal (FREE)  │
└─────────────────────────────────────────────────┘
```

### AI Platform Pattern
```
┌──────────────────────────────────────────────────┐
│  Incoming Request                                 │
│        │                                          │
│        ▼                                          │
│  ┌───────────────┐                                │
│  │ Load Balancer │ (Railway handles this)         │
│  └───────────────┘                                │
│        │                                          │
│  ┌─────┴─────┬─────────┬─────────┐               │
│  ▼           ▼         ▼         ▼               │
│ ┌───┐      ┌───┐     ┌───┐     ┌───┐             │
│ │US │      │US │     │EU │     │AS │             │
│ │W1 │      │E4 │     │W4 │     │SE1│             │
│ └───┘      └───┘     └───┘     └───┘             │
│  Multi-region replicas (Pro tier)                │
└──────────────────────────────────────────────────┘
```

### Templates Worth Exploring

| Template | URL | Use Case |
|----------|-----|----------|
| Discord AI Bot | railway.com/deploy/discord-ai | ARAYA replacement |
| Chat-GPT Discord | railway.com/template/1cSU5t | GPT + Postgres |
| Letta Discord | railway.com/deploy/C__ceE | Stateful AI agent |
| OpenTelemetry | railway.com/template/otel | Full observability |

---

## PART 7: RECOMMENDED ARCHITECTURE (University Grade)

### Target State
```
┌─────────────────────────────────────────────────────────────────┐
│                    RAILWAY PROJECT (Optimized)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    PUBLIC LAYER                          │    │
│  │  ┌──────────────┐        ┌──────────────────────────┐   │    │
│  │  │ Discord Bot  │        │ Public API Gateway       │   │    │
│  │  │ (Always On)  │        │ (with healthcheck)       │   │    │
│  │  └──────────────┘        └──────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                          │                    │                  │
│                          ▼                    ▼                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │           PRIVATE LAYER (railway.internal)              │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │    │
│  │  │ ARAYA API│  │ Cyclotron│  │ 100X API │  │ Redis  │  │    │
│  │  │ (Sleep)  │  │ (Sleep)  │  │ (Sleep)  │  │ Cache  │  │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              DATA LAYER (Internal Only)                  │    │
│  │  ┌──────────────────┐                                   │    │
│  │  │    PostgreSQL    │ → postgres.railway.internal       │    │
│  │  │  (Always On)     │                                   │    │
│  │  └──────────────────┘                                   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              SCHEDULED LAYER (Cron)                      │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐               │    │
│  │  │ Backup   │  │ Cleanup  │  │ Reports  │               │    │
│  │  │ 0 3 * * *│  │ 0 * * * *│  │ 0 9 * * 1│               │    │
│  │  └──────────┘  └──────────┘  └──────────┘               │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

COST: ~$15-20/month (down from $30)
FEATURES: Private networking, app sleep, cron, healthchecks
```

---

## PART 8: CLI AUTOMATION GUIDE

### Full Command Reference

```bash
# === AUTHENTICATION ===
railway login --browserless     # Headless login
railway whoami                  # Check logged in user
railway logout                  # Logout

# === PROJECT MANAGEMENT ===
railway list                    # List all projects
railway link -p <project>       # Link to project
railway unlink                  # Unlink current
railway status                  # Current project status
railway open                    # Open dashboard

# === DEPLOYMENT ===
railway up                      # Deploy from current dir
railway up --ci                 # CI mode (exit after build)
railway deploy -t <template>    # Deploy a template
railway redeploy                # Redeploy latest
railway down                    # Remove latest deployment

# === SERVICES ===
railway service                 # Link to service
railway add                     # Add new service
railway connect                 # Shell into database

# === ENVIRONMENT ===
railway environment new <name>  # Create environment
railway environment --duplicate # Clone environment
railway variables               # Show all vars
railway variables --set K=V     # Set variable
railway run <command>           # Run with vars

# === SCALING ===
railway scale --us-west2 <N>    # Scale to N instances
railway scale --europe-west4 <N> # Add Europe region

# === FUNCTIONS ===
railway functions list          # List functions
railway functions new           # Create function
railway functions push          # Deploy function

# === MONITORING ===
railway logs                    # View logs
railway logs --build            # Build logs only
railway logs --deploy           # Deploy logs only

# === VOLUMES ===
railway volume add              # Add storage
railway volume list             # List volumes
```

### Automation Scripts

```bash
# daily_health_check.sh
#!/bin/bash
railway link -p philosopher-ai-backend -s philosopher-ai-backend
railway logs 2>&1 | tail -20 > /tmp/philosopher_logs.txt
railway link -p zestful-rejoicing -s araya-discord-bot
railway logs 2>&1 | tail -20 > /tmp/araya_logs.txt
echo "Health check complete: $(date)"
```

```bash
# quick_deploy.sh
#!/bin/bash
PROJECT=$1
SERVICE=$2
railway link -p $PROJECT -s $SERVICE
railway up --ci
echo "Deployed $SERVICE to $PROJECT"
```

---

## PART 9: ACTION PLAN

### Phase 1: Quick Wins (This Week)
- [ ] Enable private networking on philosopher-ai-backend
- [ ] Set resource limits on all services
- [ ] Add healthcheck endpoints to all APIs
- [ ] Configure healthchecks in Railway

### Phase 2: Cost Optimization (Next Week)
- [ ] Enable app sleep on consciousness-platform-api
- [ ] Enable app sleep on cyclotron-cloud
- [ ] Switch all internal connections to railway.internal
- [ ] Set up usage alerts

### Phase 3: Advanced Features (This Month)
- [ ] Set up first cron job (database backup)
- [ ] Add Redis cache for ARAYA
- [ ] Create Railway Function for webhooks
- [ ] Test preview deployments

### Phase 4: Scale Prep (When Needed)
- [ ] Document scaling procedures
- [ ] Test multi-region deployment
- [ ] Set up monitoring dashboards
- [ ] Create incident response playbook

---

## PART 10: RESOURCES

### Official Documentation
- [Railway Docs](https://docs.railway.com)
- [CLI Reference](https://docs.railway.com/reference/cli-api)
- [Private Networking](https://docs.railway.com/guides/private-networking)
- [Healthchecks](https://docs.railway.com/guides/healthchecks-and-restarts)
- [Optimize Usage](https://docs.railway.com/guides/optimize-usage)

### Templates
- [All Templates](https://railway.com/templates)
- [Discord AI](https://railway.com/deploy/discord-ai)
- [PostgreSQL](https://railway.com/deploy/postgres)

### Pricing
- [Pricing Page](https://railway.com/pricing)
- Memory: $0.00000386/GB/sec
- CPU: $0.00000772/vCPU/sec
- Egress: $0.05/GB

### Community
- [Railway Discord](https://discord.gg/railway)
- [Railway Blog](https://blog.railway.app)

---

## SESSION LOG

| Date | Action | Who |
|------|--------|-----|
| Jan 12, 2026 | Created world-class blueprint | C1 |
| Jan 12, 2026 | Researched all Railway capabilities | C1 |
| Jan 12, 2026 | Identified 40% cost savings opportunity | C1 |
| Jan 12, 2026 | Mapped kindergarten → university upgrade path | C1 |

---

*RAILWAY WORLD-CLASS BLUEPRINT v1.0*
*From Kindergarten to University Grade*
