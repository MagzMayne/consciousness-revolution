# Issue Automation - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Run Initial Cleanup (Required)

The repository currently has 195 open issues. Run the bulk cleanup to get things under control:

1. Go to **Actions** tab in GitHub
2. Select **"Bulk Issue Cleanup"** workflow
3. Click **"Run workflow"**
4. **First time:** Set `dry_run: true` to preview
5. Review the dry run results
6. **Run again** with `dry_run: false` to apply changes

**Expected result:** ~90% of stale issues will be closed automatically.

### Step 2: Verify Automation is Running

Check that these workflows are enabled:

- ✅ **Issue Lifecycle Manager** - Runs every 6 hours
- ✅ **Issue Health Dashboard** - Runs daily at 9 AM UTC  
- ✅ **Daily Agent Conflict Fixer** - Runs daily at 2 AM UTC

### Step 3: Monitor Health

**Daily Check:**
- View the **Issue Health Dashboard** in Actions tab
- Look for 🟢 healthy, 🟡 warning, or 🔴 critical status

**Weekly Check:**
- Open issues count should be < 50 automated issues
- Daily reports should be ≤ 3

## 📋 Common Tasks

### Close All Stale Branch Issues

```bash
# Via GitHub CLI
gh workflow run bulk-issue-cleanup.yml \
  -f dry_run=false \
  -f close_all_stale_branches=true
```

### Keep Only Latest 3 Daily Reports

```bash
# Via GitHub CLI
gh workflow run bulk-issue-cleanup.yml \
  -f dry_run=false \
  -f close_old_daily_reports=true
```

### Check Current Health

```bash
# Via GitHub CLI
gh workflow run issue-health-dashboard.yml

# Or locally
GITHUB_TOKEN=your_token node .github/scripts/issue-health-dashboard.js
```

### Force Lifecycle Cleanup

```bash
# Via GitHub CLI
gh workflow run issue-lifecycle-manager.yml
```

## 🎯 What Gets Closed Automatically

| Issue Type | Auto-Close Condition | When Checked |
|-----------|---------------------|--------------|
| Stale Branch Issues | Branch deleted or merged | Every 6 hours |
| Daily Reports | Older than latest 3 | Every 6 hours |
| Security Issues | Verified fixed after 7 days | Every 6 hours |
| Health Alerts | Metrics return to healthy | Daily |

## ⚙️ Configuration

### Change Cleanup Frequency

Edit `.github/workflows/issue-lifecycle-manager.yml`:

```yaml
on:
  schedule:
    # Every 6 hours (default)
    - cron: '0 */6 * * *'
    
    # Change to every 3 hours:
    # - cron: '0 */3 * * *'
    
    # Change to daily:
    # - cron: '0 2 * * *'
```

### Keep More/Fewer Daily Reports

When running workflows manually:

```bash
gh workflow run issue-lifecycle-manager.yml \
  -f max_daily_reports=5  # Keep latest 5 instead of 3
```

### Adjust Health Thresholds

Edit `.github/scripts/issue-health-dashboard.js`:

```javascript
const THRESHOLDS = {
  totalIssues: { warning: 150, critical: 200 },
  automatedIssues: { warning: 50, critical: 100 },
  // Adjust these values
};
```

## 📊 Understanding the Dashboard

### Health Status Icons

- 🟢 **Healthy** - No action needed
- 🟡 **Warning** - Monitor the situation
- 🔴 **Critical** - Immediate action required

### Sample Output

```
╔════════════════════════════════════════════════════════════════╗
║              ISSUE AUTOMATION HEALTH DASHBOARD                 ║
╚════════════════════════════════════════════════════════════════╝

🟢 Overall Health: HEALTHY
🟢 Automation Health: HEALTHY

┌─────────────────────────────────────────────────────────────┐
│ ISSUE COUNTS                                                │
├─────────────────────────────────────────────────────────────┤
│ Total Open Issues:          45 🟢                            │
│ Automated Issues:           32 🟢                            │
│   - Stale Branch:           28 🟢                            │
│   - Daily Reports:           3 🟢                            │
│   - Security:                1 🟢                            │
│ Manual Issues:              13                              │
└─────────────────────────────────────────────────────────────┘
```

## 🐛 Troubleshooting

### Issue: Workflows not running

**Solution:**
1. Check Actions tab → Enable workflows if disabled
2. Verify repository permissions allow Actions
3. Check workflow logs for errors

### Issue: Issues not being closed

**Cause:** Branch might still exist or workflow hasn't run yet

**Solution:**
```bash
# Check if branch exists
git branch -r | grep copilot/branch-name

# Manually trigger cleanup
gh workflow run issue-lifecycle-manager.yml
```

### Issue: Too many security issues

**Cause:** Code hasn't been fixed yet

**Solution:**
1. Review the security issues
2. Fix the vulnerabilities
3. Commit changes
4. Wait for next security scan (or trigger manually)

### Issue: Dashboard shows critical status

**Cause:** Too many automated issues open

**Solution:**
```bash
# Run bulk cleanup immediately
gh workflow run bulk-issue-cleanup.yml -f dry_run=false
```

## 🔄 Daily Workflow

### For Repository Maintainers

**Morning:**
1. Check Issue Health Dashboard (runs automatically at 9 AM UTC)
2. If 🟢: No action needed
3. If 🟡: Monitor throughout the day
4. If 🔴: Run bulk cleanup

**When closing PRs/merging:**
- Stale branch issues close automatically within 6 hours
- Or manually trigger cleanup if you want immediate results

**Before end of day:**
- Verify any critical security issues are addressed
- Check that automated issue count is stable

## 📚 Additional Resources

- **Full Documentation:** [ISSUE_AUTOMATION_README.md](./ISSUE_AUTOMATION_README.md)
- **Workflow Files:** `.github/workflows/`
- **Scripts:** `.github/scripts/`

## 💡 Pro Tips

1. **Set up notifications:** Watch the Actions tab to get notified of critical health alerts
2. **Schedule manual reviews:** Weekly review of all open issues
3. **Clean branches regularly:** Delete merged/abandoned branches promptly
4. **Fix security issues quickly:** The faster you fix, the faster issues close
5. **Use dry_run first:** Always preview cleanup actions before applying

## 🆘 Need Help?

1. Check workflow logs in Actions tab
2. Review [ISSUE_AUTOMATION_README.md](./ISSUE_AUTOMATION_README.md)
3. Run dashboard locally to debug: `node .github/scripts/issue-health-dashboard.js`

## ✅ Success Criteria

After setup, you should see:

- ✅ Automated issues: < 50
- ✅ Daily reports: ≤ 3
- ✅ Stale branch issues only for existing branches
- ✅ Security issues close within 1 week of fix
- ✅ Dashboard shows 🟢 healthy status

---

**Remember:** The automation is self-maintaining. Once set up, it runs automatically and keeps your repository clean!
