# Quick Reference: Enabling PR Merges

## 🚀 Quick Actions

### 1. Check Current PR Status

```bash
# View merge readiness report (automated issue)
gh issue list --label "merge-readiness-report"

# Or run manually
export GITHUB_TOKEN="your_github_token"
node .github/scripts/check-pr-merge-readiness.js
```

### 2. Sync All Open PRs

```bash
# Interactive (recommended)
./.github/scripts/trigger-auto-sync.sh

# Or via GitHub Actions
gh workflow run auto-sync-branches.yml \
  --field branch_pattern="copilot/*" \
  --field dry_run="false"
```

### 3. View Workflow Status

```bash
# List recent auto-sync runs
gh run list --workflow=auto-sync-branches.yml --limit 10

# View specific run
gh run view --web
```

### 4. Merge Ready PRs

```bash
# List ready PRs (look for mergeable: true)
gh pr list --state open --json number,title,mergeable | \
  jq '.[] | select(.mergeable == true)'

# Merge a PR
gh pr merge <pr-number> --merge --delete-branch
```

## 📊 Understanding the System

### Automated Workflows

| Workflow | Frequency | Purpose |
|----------|-----------|---------|
| **Auto-Sync** | Every 4 hours | Syncs PR branches with main |
| **Readiness Check** | Every 6 hours | Categorizes PRs by merge status |
| **Conflict Resolver** | On-demand | Auto-resolves simple conflicts |

### PR Categories

| Status | Meaning | Action Needed |
|--------|---------|---------------|
| ✅ **Ready to Merge** | No conflicts, tests pass | Merge immediately |
| 🔄 **Needs Sync** | Behind base branch | Auto-sync will handle |
| ⚠️ **Has Conflicts** | Merge conflicts exist | Manual or auto-resolution |
| ❌ **Failing Checks** | Tests/builds failing | PR author must fix |
| 📝 **Draft** | Work in progress | Wait for author |

## 🔧 Common Issues & Solutions

### Issue: "Too many PRs need manual attention"

**Solution:**
```bash
# 1. Trigger auto-sync to update all branches
./.github/scripts/trigger-auto-sync.sh

# 2. Wait 10-15 minutes for sync to complete

# 3. Check readiness report
gh issue list --label "merge-readiness-report" --limit 1
```

### Issue: "Auto-sync failed for some PRs"

**Solution:**
```bash
# Check which PRs failed
gh run view --log | grep "conflict"

# Trigger auto-conflict-resolver for specific PR
gh workflow run auto-conflict-resolver.yml --field pr_number=123
```

### Issue: "PR shows conflicts but files look OK"

**Solution:**
```bash
# Refresh the PR
gh pr comment <pr-number> --body "@github-actions re-sync"

# Or manually trigger sync for that PR's branch
git fetch origin main
git checkout <branch-name>
git merge origin/main
git push
```

## 📈 Monitoring Progress

### Check Overall Status

```bash
# View latest readiness report
gh issue view $(gh issue list -L 1 --label merge-readiness-report --json number -q '.[0].number')
```

### Track Improvements

```bash
# Count PRs by category (requires jq)
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/barbrickdesign/barbrickdesign.github.io/pulls?state=open" | \
  jq '[.[] | select(.mergeable != null)] | group_by(.mergeable) | 
      map({status: .[0].mergeable, count: length})'
```

## 🎯 Best Practices

### For Maintainers

1. **Review readiness reports weekly** - Check the automated issues
2. **Merge ready PRs promptly** - Prevents stale branches
3. **Run manual sync when needed** - Before major reviews
4. **Communicate with authors** - On conflicted or failing PRs

### For PR Authors

1. **Keep PRs small** - Easier to merge, less conflicts
2. **Sync regularly** - At least weekly with main
3. **Fix failures quickly** - Don't let tests stay red
4. **Respond to bot comments** - They provide helpful guidance

## 📚 Learn More

- **Full Documentation**: [PR_MERGE_READINESS_GUIDE.md](.github/workflows/PR_MERGE_READINESS_GUIDE.md)
- **Conflict Resolution**: [CONFLICT_RESOLUTION_GUIDE.md](.github/workflows/CONFLICT_RESOLUTION_GUIDE.md)
- **Auto-Sync Workflow**: [auto-sync-branches.yml](.github/workflows/auto-sync-branches.yml)

## 🆘 Need Help?

1. Check the [PR Merge Readiness Guide](.github/workflows/PR_MERGE_READINESS_GUIDE.md)
2. Review recent workflow run logs
3. Check merge readiness report issues
4. Contact repository maintainers

---

**Quick Commands Cheat Sheet:**

```bash
# Status
gh issue list --label merge-readiness-report -L 1

# Sync all
./.github/scripts/trigger-auto-sync.sh

# Check workflows
gh run list --workflow=auto-sync-branches.yml -L 5

# Merge ready PR
gh pr merge <number> --merge --delete-branch
```
