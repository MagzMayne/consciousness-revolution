# RAILWAY MASTER BLUEPRINT
## Complete Infrastructure Map
## Generated: Jan 12, 2026 via CLI

---

## QUICK REFERENCE

| Project | URL | API Key | Status |
|---------|-----|---------|--------|
| philosopher-ai-backend | philosopher-ai-backend-production.up.railway.app | DATABASE_URL | ONLINE |
| cyclotron-cloud | cyclotron-cloud-production.up.railway.app | ANTHROPIC_API_KEY | ONLINE |
| consciousness-platform-api | consciousness-platform-api-production.up.railway.app | DEEPSEEK_API_KEY | ONLINE |
| zestful-rejoicing | (no public URL - Discord bot) | DISCORD_TOKEN | ONLINE |

---

## CLI COMMANDS (LOGGED IN!)

```bash
# Auth: darrick.preble@gmail.com
railway whoami                                    # Check login
railway list                                      # List all projects
railway link -p <project> -s <service>           # Switch context
railway variables                                 # Show env vars
railway logs                                      # Show logs
railway connect                                   # Connect to database
railway open                                      # Open dashboard
railway up                                        # Deploy current dir
```

---

## PROJECT 1: philosopher-ai-backend

### Overview
| Field | Value |
|-------|-------|
| Project ID | 94d6e77f-f31f-49a1-837f-c1989b88bfa1 |
| Environment | production |
| Public URL | philosopher-ai-backend-production.up.railway.app |
| Private URL | philosopher-ai-backend.railway.internal |
| Services | 4 (main app, cloud-funnel, Postgres, volume) |

### Services
| Service | URL | Purpose |
|---------|-----|---------|
| philosopher-ai-backend | philosopher-ai-backend-production.up.railway.app | Main API |
| cloud-funnel | cloud-funnel-production.up.railway.app | Backend API |
| Postgres | postgres.railway.internal:5432 | Database |
| postgres-volume | - | Storage |

### Environment Variables
```
ALLOWED_ORIGINS=*
DATABASE_URL=postgresql://postgres:[REDACTED]@postgres.railway.internal:5432/railway
JWT_SECRET=[128-char secret]
NODE_ENV=production
PORT=8080
```

### Database Tables (12)
- conversations
- knowledge
- messages
- payments
- questions
- sessions
- subscriptions
- trinity_instances
- trinity_state
- trinity_tasks
- usage_logs
- users

### CLI Access
```bash
railway link -p philosopher-ai-backend -s philosopher-ai-backend
railway variables          # Show all vars
railway connect           # Connect to Postgres shell (psql)
railway logs              # View logs
```

---

## PROJECT 2: cyclotron-cloud

### Overview
| Field | Value |
|-------|-------|
| Project ID | 88bb9e5e-1ca2-4ee7-bf29-0d495a1df23a |
| Environment | production |
| Public URL | cyclotron-cloud-production.up.railway.app |
| Private URL | cyclotron-cloud.railway.internal |
| Services | 1 |

### Environment Variables
```
ANTHROPIC_API_KEY=sk-ant-oat01-[REDACTED]
```

### Purpose
Cloud-based Cyclotron brain service powered by Claude API.

### CLI Access
```bash
railway link -p cyclotron-cloud -s cyclotron-cloud
railway variables
railway logs
```

---

## PROJECT 3: consciousness-platform-api

### Overview
| Field | Value |
|-------|-------|
| Project ID | 8c1c6451-7e1e-4d90-a165-698cddc3e111 |
| Environment | production |
| Public URL | consciousness-platform-api-production.up.railway.app |
| Private URL | consciousness-platform-api.railway.internal |
| Services | 1 |

### Environment Variables
```
DEEPSEEK_API_KEY=sk-92387bd9526946dd884b94bca1fc650c
```

### Purpose
100X Platform API - DeepSeek-powered consciousness API.

### Endpoints (DISCOVERED!)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Health check |
| GET | `/stats` | Platform statistics |
| GET | `/api/bridge/questions` | Get assessment questions |
| POST | `/api/bridge/assess` | Run consciousness assessment |
| POST | `/api/analyze` | Pattern Theory analysis |
| POST | `/api/detect` | Manipulation detection |
| POST | `/api/domains` | Seven Domains analysis |
| POST | `/api/project` | Timeline projection |

### Recent Activity
- Jan 1, 2026: /health, /api/bridge/questions
- Jan 3, 2026: /health, /stats, /api/bridge/questions

### Known Issue
```
Warning: Pattern Theory Engine not available: No module named 'PATTERN_THEORY_ENGINE'
```
Missing PATTERN_THEORY_ENGINE module - some features degraded.

### CLI Access
```bash
railway link -p consciousness-platform-api -s consciousness-platform-api
railway variables
railway logs
```

---

## PROJECT 4: zestful-rejoicing (ARAYA Discord Bot)

### Overview
| Field | Value |
|-------|-------|
| Project ID | 6506e584-6985-4812-b942-1b45cdf37323 |
| Environment | production |
| Private URL | araya-discord-bot.railway.internal |
| Services | 2 (araya-discord-bot, gleaming-tranquility) |
| GitHub | overkillkulture/araya-discord-bot |

### Environment Variables
```
ARAYA_API_URL=https://gleaming-tranquility-production-abcf.up.railway.app/chat
DISCORD_TOKEN=MTQ1NzE0NDIzNzMwMzc5MTc0Mw.[REDACTED]
SUPABASE_URL=https://lgibygzcbvrrykfaxvbg.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIs...[REDACTED]
```

### Related Service
| Service | URL |
|---------|-----|
| gleaming-tranquility | gleaming-tranquility-production-abcf.up.railway.app |

### NOTE
ARAYA_API_URL points to gleaming-tranquility service WITHIN this project.
This is the ARAYA API running on Railway (not ngrok tunnel).

### CLI Access
```bash
railway link -p zestful-rejoicing -s araya-discord-bot
railway variables
railway logs
```

---

## ARCHITECTURE DIAGRAM

```
                    ┌─────────────────────────────────────────┐
                    │           RAILWAY CLOUD                  │
                    │      (4 Projects / ~$20/month)          │
                    └─────────────────────────────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
        ▼                             ▼                             ▼
┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐
│ philosopher-ai-   │    │  cyclotron-cloud  │    │ consciousness-    │
│ backend           │    │                   │    │ platform-api      │
├───────────────────┤    ├───────────────────┤    ├───────────────────┤
│ 4 services        │    │ 1 service         │    │ 1 service         │
│ - Main API        │    │ ANTHROPIC_API_KEY │    │ DEEPSEEK_API_KEY  │
│ - cloud-funnel    │    │                   │    │                   │
│ - Postgres (12TB) │    │ Cloud Brain       │    │ 100X Platform     │
│ - Volume          │    │                   │    │                   │
└───────────────────┘    └───────────────────┘    └───────────────────┘
        │
        │ DATABASE_URL
        ▼
┌───────────────────┐
│ PostgreSQL        │
│ 12 tables         │
│ - users           │
│ - sessions        │
│ - payments        │
│ - trinity_*       │
│ - ...             │
└───────────────────┘

                    ┌───────────────────────────────────────┐
                    │      zestful-rejoicing                │
                    │      (ARAYA Discord Bot)              │
                    ├───────────────────────────────────────┤
                    │ ┌─────────────────┐ ┌───────────────┐ │
                    │ │araya-discord-bot│→│gleaming-      │ │
                    │ │ DISCORD_TOKEN   │ │tranquility    │ │
                    │ │ SUPABASE_*      │ │(ARAYA API)    │ │
                    │ └─────────────────┘ └───────────────┘ │
                    └───────────────────────────────────────┘
                              │                 │
                              ▼                 ▼
                    ┌─────────────────┐ ┌─────────────────┐
                    │ Discord Server  │ │ Supabase        │
                    │ (D-wrek's)      │ │ lgibygzcbvrry.. │
                    └─────────────────┘ └─────────────────┘
```

---

## URLS AT A GLANCE

| URL | What It Does |
|-----|--------------|
| https://philosopher-ai-backend-production.up.railway.app | Main Philosopher API |
| https://cloud-funnel-production.up.railway.app | Cloud Funnel backend |
| https://cyclotron-cloud-production.up.railway.app | Cyclotron Brain (Claude) |
| https://consciousness-platform-api-production.up.railway.app | 100X API (DeepSeek) |
| https://gleaming-tranquility-production-abcf.up.railway.app | ARAYA API |

---

## API KEYS INVENTORY

| Key | Service | Location |
|-----|---------|----------|
| ANTHROPIC_API_KEY | cyclotron-cloud | Railway env |
| DEEPSEEK_API_KEY | consciousness-platform-api | Railway env |
| DISCORD_TOKEN | zestful-rejoicing | Railway env |
| SUPABASE_SERVICE_KEY | zestful-rejoicing | Railway env |
| DATABASE_URL (Postgres) | philosopher-ai-backend | Railway env |
| JWT_SECRET | philosopher-ai-backend | Railway env |

---

## MAINTENANCE COMMANDS

```bash
# Quick status check
railway list

# View logs for any project
railway link -p <project> -s <service>
railway logs

# Connect to Postgres
railway link -p philosopher-ai-backend -s Postgres-3xM4
railway connect

# Deploy updates
cd /path/to/code
railway link -p <project> -s <service>
railway up

# Set environment variable
railway variables --set KEY=value
```

---

## COST BREAKDOWN

| Project | Est. Monthly |
|---------|--------------|
| philosopher-ai-backend | $10-15 (4 services + Postgres) |
| cyclotron-cloud | $5 (1 service) |
| consciousness-platform-api | $5 (1 service) |
| zestful-rejoicing | $5 (2 services) |
| **Total** | **~$25-30/month** |

---

## LIVE VERIFICATION (Jan 12, 2026 - TESTED!)

| Service | URL | Status | Response |
|---------|-----|--------|----------|
| consciousness-platform-api | /health | **200 OK** | API live, 0 usage |
| consciousness-platform-api | /stats | **200 OK** | `{"analyses_run":0,"assessments_completed":0}` |
| gleaming-tranquility (ARAYA) | /health | **200 OK** | API documented |
| gleaming-tranquility (ARAYA) | /status | **200 OK** | `araya: online, supabase: connected, deepseek: ready` |
| philosopher-ai-backend | / | **200** | `{"error":"Endpoint not found"}` - needs specific endpoints |
| cyclotron-cloud | / | **404** | Flask 404 - needs specific endpoints |
| cloud-funnel | / | **200** | `{"error":"Endpoint not found"}` - needs specific endpoints |

### ARAYA API LIVE STATUS (gleaming-tranquility)
```json
{
  "araya": "online",
  "supabase": "connected",
  "ai_backends": {
    "deepseek": "ready",
    "openai": "not configured"
  },
  "conversations": 0
}
```

### ARAYA API ENDPOINTS
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | API documentation |
| GET | `/health` | Health check |
| GET | `/status` | Full status with backends |
| GET | `/history` | Conversation history |
| POST | `/chat` | Chat endpoint `{"message": "your message"}` |

---

## NEXT STEPS

1. [x] Test each URL with curl to verify they respond - **DONE**
2. [ ] Connect to Postgres and inspect tables
3. [ ] Set up GitHub Actions for auto-deploy
4. [ ] Create Project Token for automated CLI access
5. [x] Document what each API endpoint does - **PARTIAL**

---

## SESSION LOG

| Date | Action | Who |
|------|--------|-----|
| Jan 12, 2026 | Railway CLI login successful | Commander |
| Jan 12, 2026 | Extracted all 4 project configs via CLI | C1 |
| Jan 12, 2026 | Created master blueprint | C1 |
| Jan 12, 2026 | Discovered gleaming-tranquility IS the ARAYA API | C1 |
| Jan 12, 2026 | Live URL verification - all 4 projects responding | C1 |
| Jan 12, 2026 | ARAYA API status: online, supabase connected, deepseek ready | C1 |

---

*Railway Master Blueprint v1.1 - Live Verified*
