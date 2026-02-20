# RAILWAY CLI CHEATSHEET
## Copy-Paste Commands
## Jan 12, 2026

---

## QUICK STATUS
```bash
railway whoami                    # Who am I?
railway list                      # All projects
railway status                    # Current context
```

---

## LINK TO PROJECTS (Copy-Paste Ready)

```bash
# philosopher-ai-backend
railway link -p philosopher-ai-backend -s philosopher-ai-backend
railway link -p philosopher-ai-backend -s cloud-funnel
railway link -p philosopher-ai-backend -s Postgres-3xM4

# cyclotron-cloud
railway link -p cyclotron-cloud -s cyclotron-cloud

# consciousness-platform-api
railway link -p consciousness-platform-api -s consciousness-platform-api

# zestful-rejoicing (ARAYA)
railway link -p zestful-rejoicing -s araya-discord-bot
railway link -p zestful-rejoicing -s gleaming-tranquility
```

---

## COMMON OPERATIONS

```bash
# View logs
railway logs                      # All logs
railway logs 2>&1 | tail -50      # Last 50 lines
railway logs --build              # Build only
railway logs --deploy             # Deploy only

# View/set variables
railway variables                 # Show all
railway variables --set KEY=value # Set one

# Database shell
railway link -p philosopher-ai-backend -s Postgres-3xM4
railway connect                   # Opens psql

# Deploy
railway up                        # Deploy current dir
railway up --ci                   # CI mode (exits after)
railway redeploy                  # Redeploy latest
```

---

## ADVANCED FEATURES

```bash
# Scaling (Hobby+ tier)
railway scale --us-west2 2        # 2 instances US West
railway scale --europe-west4 1    # Add Europe

# Functions (Serverless)
railway functions list
railway functions new --name my-func
railway functions push

# Environments
railway environment new staging
railway environment new pr-123 --duplicate production

# Run local with Railway vars
railway run npm start
railway shell                     # Subshell with vars
```

---

## TEMPLATES (One-Click Deploy)

```bash
# Deploy templates
railway deploy -t postgres        # PostgreSQL
railway deploy -t redis           # Redis
railway deploy -t mysql           # MySQL
railway deploy -t mongodb         # MongoDB

# With variables
railway deploy -t mytemplate -v "API_KEY=xxx" -v "PORT=3000"
```

---

## COST OPTIMIZATION

```bash
# Check usage (in dashboard)
railway open

# Private networking (update DATABASE_URL)
# Change: centerbeam.proxy.rlwy.net
# To: postgres.railway.internal

# Set resource limits in dashboard
# Settings → Resources → Memory/CPU caps
```

---

## PROJECT IDs (For Scripting)

| Project | ID |
|---------|-----|
| philosopher-ai-backend | 94d6e77f-f31f-49a1-837f-c1989b88bfa1 |
| cyclotron-cloud | 88bb9e5e-1ca2-4ee7-bf29-0d495a1df23a |
| consciousness-platform-api | 8c1c6451-7e1e-4d90-a165-698cddc3e111 |
| zestful-rejoicing | 6506e584-6985-4812-b942-1b45cdf37323 |

---

## DAILY HEALTH CHECK SCRIPT

```bash
#!/bin/bash
# Save as: railway_health.sh

echo "=== Railway Health Check $(date) ==="

for proj in philosopher-ai-backend cyclotron-cloud consciousness-platform-api zestful-rejoicing; do
  echo "--- $proj ---"
  railway link -p $proj 2>/dev/null
  railway status 2>&1 | head -5
done
```

---

*CLI v4.10.0 | Latest: v4.23.0*
*Upgrade: `npm i -g @railway/cli`*
