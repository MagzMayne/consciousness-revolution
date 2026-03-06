# Backup Strategy - Consciousness Revolution

**Last Updated:** 2026-03-06
**Status:** Active

---

## Overview

Multi-layer backup strategy covering code, database, environment, and files.

---

## Backup Layers

### 1. Code Repository (Git + GitHub)

**Primary:** `https://github.com/overkor-tek/consciousness-revolution`

**Automated:**
- All commits pushed to GitHub
- GitHub maintains full history
- Branches provide point-in-time snapshots

**Manual Backup:**
```bash
# Create local archive
git archive --format=zip HEAD > backup_$(date +%Y%m%d).zip

# Push to backup branch
git checkout -b backup/$(date +%Y%m%d_%H%M%S)
git push origin HEAD
```

**Recovery:**
```bash
# Restore from any commit
git checkout <commit-hash>

# Restore specific file
git checkout <commit-hash> -- path/to/file
```

---

### 2. GitHub Actions Backup System

**Location:** `.github/workflows/backup-rollback.yml`

**Actions:**
- `backup` - Create labeled backup of specific files
- `rollback` - Restore from labeled backup
- `list` - List available backups
- `clean` - Remove old backups

**Manual Trigger:**
1. Go to GitHub Actions
2. Select "Backup and Rollback System"
3. Click "Run workflow"
4. Choose action and parameters

**CLI Usage:**
```bash
# Create backup before risky change
gh workflow run backup-rollback.yml -f action=backup -f files="araya-chat.html,login.html" -f label="pre-update"

# Rollback if needed
gh workflow run backup-rollback.yml -f action=rollback -f label="pre-update"

# List all backups
gh workflow run backup-rollback.yml -f action=list

# Clean old backups
gh workflow run backup-rollback.yml -f action=clean -f older_than_days=30
```

**Artifacts:**
- Backups retained for 90 days
- Logs retained for 30 days

---

### 3. Database (Supabase)

**Supabase Automatic:**
- Daily automatic backups (Pro plan)
- Point-in-time recovery (PITR) available
- 7-day retention on free tier

**Manual Export:**
```bash
# Export via Supabase CLI
supabase db dump -f backup_$(date +%Y%m%d).sql

# Export specific tables
supabase db dump --schema public --data-only > data_backup.sql
```

**Access Backups:**
1. Go to Supabase Dashboard
2. Settings > Backups
3. Download or restore from point

**Critical Tables to Monitor:**
- `user_foundations` - All user data
- `araya_accounts` - Credit balances
- `builder_balances` - Financial data
- `user_certifications` - Issued certs
- `audit_log` - Security audit trail

---

### 4. Environment Variables

**Location:** Netlify Environment Variables

**Backup Process:**
```bash
# Export all env vars
netlify env:list > env_backup_$(date +%Y%m%d).txt

# Store securely (encrypted)
# NEVER commit env files to git
```

**Critical Variables:**
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_SECRET`
- `ANTHROPIC_API_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `GITHUB_TOKEN`
- `DISCORD_BOT_TOKEN`

**Recovery:**
- Re-set in Netlify Dashboard
- Or use Netlify CLI: `netlify env:set KEY value`

---

### 5. Netlify Deployments

**Automatic:**
- Every deploy creates immutable snapshot
- Instant rollback to any deploy

**Rollback:**
1. Netlify Dashboard > Deploys
2. Find desired deploy
3. Click "Publish deploy"

**CLI:**
```bash
# List recent deploys
netlify deploys --json | head -50

# Rollback to specific deploy
netlify deploy --prod --alias <deploy-id>
```

---

### 6. Local File Backups

**Archive Directory:** `.archive/`

**Naming Convention:**
```
filename.ext.backup.YYYYMMDD_HHMMSS
```

**Manual Backup Script:**
```bash
# Backup critical files
cp araya-chat.html .archive/araya-chat.html.backup.$(date +%Y%m%d_%H%M%S)
cp login.html .archive/login.html.backup.$(date +%Y%m%d_%H%M%S)
```

---

## Backup Schedule

| Component | Frequency | Retention | Method |
|-----------|-----------|-----------|--------|
| Code (Git) | Every commit | Forever | Automatic |
| Database | Daily | 7-30 days | Supabase auto |
| Env Vars | Monthly | Manual | Manual export |
| Deploys | Every deploy | 90 days | Netlify auto |
| Critical Files | Before changes | 30 days | GitHub Actions |

---

## Recovery Procedures

### Scenario 1: Bad Code Deploy
```bash
# Option A: Git revert
git revert HEAD
git push

# Option B: Netlify rollback
# Go to Netlify Dashboard > Deploys > Publish previous
```

### Scenario 2: Database Corruption
1. Go to Supabase Dashboard
2. Settings > Backups
3. Select restore point
4. Click "Restore"

### Scenario 3: Lost Environment Variables
1. Check password manager for backup
2. Regenerate keys if needed:
   - Stripe: Dashboard > Developers > API keys
   - Anthropic: Console > API Keys
   - GitHub: Settings > Developer settings > Tokens

### Scenario 4: Complete Site Down
1. Check Netlify status
2. Check Supabase status
3. Verify DNS (Cloudflare)
4. Roll back to last working deploy

---

## Monitoring

**Health Checks:**
- `/.netlify/functions/health` - Basic health
- `/.netlify/functions/trinity-status` - System status
- `/.netlify/functions/supabase-debug` - DB connectivity

**Alerts:**
- Netlify build failures → Email
- Supabase errors → Dashboard alerts
- GitHub Actions failures → Email

---

## Disaster Recovery Contacts

| Service | Contact |
|---------|---------|
| Netlify | support.netlify.com |
| Supabase | supabase.com/support |
| Stripe | stripe.com/support |
| GitHub | support.github.com |

---

## Checklist Before Major Changes

- [ ] Create labeled backup via GitHub Actions
- [ ] Export critical tables from Supabase
- [ ] Note current deploy ID in Netlify
- [ ] Save env vars backup
- [ ] Test rollback procedure

---

*Generated on 2026-03-06*
