# PR Merge Readiness System

## Overview

This document describes the improvements made to enable smooth merging of the 57+ open pull requests in this repository.

## Problem Statement

The repository had 57 open PRs that couldn't merge due to:

1. **Shared file conflicts**: `projects.json` (532 projects) - every PR touches this file
2. **Manual resolution requirements**: JavaScript and JSON files require manual conflict review
3. **Insufficient sync frequency**: Auto-sync ran only once daily - inadequate for 57 concurrent PRs
4. **Workflow bottlenecks**: Critical files required manual intervention, blocking auto-merge

## Solutions Implemented

### 1. Increased Auto-Sync Frequency ✅

**Changed:** Auto-sync workflow now runs every 4 hours (previously daily)

**File:** `.github/workflows/auto-sync-branches.yml`

**Impact:**
- Branches stay synchronized with `main` more frequently
- Reduces accumulation of merge conflicts
- Proactive conflict prevention vs reactive resolution

**Schedule:**
```yaml
schedule:
  # Every 4 hours
  - cron: '0 */4 * * *'
```

### 2. PR Merge Readiness Checker ✅

**New Tool:** `.github/scripts/check-pr-merge-readiness.js`

**New Workflow:** `.github/workflows/pr-merge-readiness-check.yml`

**Features:**
- Checks all open PRs every 6 hours
- Categorizes PRs into:
  - ✅ Ready to merge (no conflicts, tests pass)
  - 🔄 Needs sync (behind base branch)
  - ⚠️ Has conflicts (requires resolution)
  - ❌ Failing checks (tests/builds failing)
  - 📝 Draft (work in progress)
- Creates automated tracking issues
- Generates JSON reports for analysis

**Usage:**
```bash
# Run manually
node .github/scripts/check-pr-merge-readiness.js

# Via GitHub Actions
gh workflow run pr-merge-readiness-check.yml
```

### 3. Auto-Sync Trigger Script ✅

**New Script:** `.github/scripts/trigger-auto-sync.sh`

**Purpose:** Manually trigger auto-sync for all open PRs

**Usage:**
```bash
# Trigger sync for all copilot/* branches
./.github/scripts/trigger-auto-sync.sh

# Or via GitHub Actions
gh workflow run auto-sync-branches.yml \
  --field branch_pattern="copilot/*" \
  --field dry_run="false"
```

## How It Works

### Automated Workflow

```
┌─────────────────────────────────────────┐
│  Every 4 hours: Auto-Sync Workflow      │
│  - Fetches main branch updates          │
│  - Syncs all copilot/* branches         │
│  - Resolves simple conflicts            │
│  - Notifies PRs of sync status          │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Every 6 hours: Merge Readiness Check   │
│  - Scans all open PRs                   │
│  - Categorizes by merge status          │
│  - Creates tracking issue               │
│  - Provides actionable insights         │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Manual Actions (as needed)             │
│  - Merge ready PRs                      │
│  - Resolve remaining conflicts          │
│  - Fix failing tests                    │
└─────────────────────────────────────────┘
```

### Conflict Resolution Strategy

Based on `.github/workflows/conflict-resolution-config.json`:

| File Type | Strategy | Auto-Resolve | Notes |
|-----------|----------|--------------|-------|
| `package-lock.json` | `ours` | ✅ | Regenerate after merge |
| `yarn.lock` | `ours` | ✅ | Regenerate after merge |
| `*.md` | `both` | ✅ | Merge both changes |
| `CHANGELOG.md` | `both-prepend` | ✅ | Chronological merge |
| `*.json` | `theirs-with-backup` | ❌ | Requires review |
| `.github/workflows/*.yml` | `manual` | ❌ | Critical files |
| `*.html` | `intelligent-merge` | ✅ | Non-overlapping sections |
| `*.css` | `both` | ✅ | If not overlapping |
| `*.js` | `manual` | ❌ | Requires careful review |

## Usage Guide

### For Repository Maintainers

#### Check Current PR Status

```bash
# Install dependencies (one time)
npm install @octokit/rest

# Run readiness check
export GITHUB_TOKEN="your_token"
node .github/scripts/check-pr-merge-readiness.js
```

#### Trigger Auto-Sync

```bash
# Using helper script
./.github/scripts/trigger-auto-sync.sh

# Or via GitHub Actions UI
# Navigate to: Actions → Auto-Sync Branches → Run workflow
```

#### Merge Ready PRs

1. Check the latest merge readiness report issue
2. Review PRs in "Ready to Merge" category
3. Merge them using GitHub UI or CLI:

```bash
# Merge a ready PR
gh pr merge 123 --merge --delete-branch
```

### For PR Authors

#### If Your PR Needs Sync

Your PR will receive an automated comment when synced. To pull the changes:

```bash
git fetch origin
git pull origin your-branch-name
```

#### If Your PR Has Conflicts

1. Fetch and merge the base branch:
```bash
git fetch origin main
git merge origin/main
```

2. Resolve conflicts in your editor
3. Commit and push:
```bash
git add .
git commit -m "Resolve merge conflicts with main"
git push origin your-branch-name
```

## Monitoring and Reporting

### Automated Reports

- **Auto-Sync Report**: Created after each sync run
  - Shows which branches were synced
  - Lists branches with conflicts
  - Provides resolution guidance

- **Merge Readiness Report**: Created every 6 hours
  - Categorizes all open PRs
  - Provides actionable recommendations
  - Tracks progress over time

### Manual Checks

```bash
# List recent workflow runs
gh run list --workflow=auto-sync-branches.yml --limit 5

# View specific run logs
gh run view <run-id> --web

# Check PR merge status
gh pr list --state open --json number,title,mergeable
```

## Best Practices

### For Maintainers

1. **Regular Monitoring**
   - Review merge readiness reports weekly
   - Merge ready PRs promptly to reduce backlog
   - Address conflicts before they accumulate

2. **Batch Processing**
   - Group similar PRs for review
   - Merge in order of importance/impact
   - Use auto-sync to prepare multiple PRs at once

3. **Conflict Prevention**
   - Keep `main` branch stable
   - Encourage PR authors to sync regularly
   - Break large features into smaller PRs

### For PR Authors

1. **Stay Updated**
   - Sync with `main` regularly (at least weekly)
   - Respond to automated sync notifications
   - Fix conflicts promptly when notified

2. **Small, Focused PRs**
   - Keep changes minimal and focused
   - Avoid touching shared files unnecessarily
   - Split large features into multiple PRs

3. **Test Before Requesting Review**
   - Ensure all tests pass locally
   - Verify no merge conflicts exist
   - Check that status checks succeed

## Troubleshooting

### Problem: Auto-Sync Fails with Conflicts

**Solution:**
1. Check the auto-sync report issue for details
2. Run auto-conflict-resolver workflow:
```bash
gh workflow run auto-conflict-resolver.yml --field pr_number=123
```
3. If auto-resolution fails, manually resolve conflicts

### Problem: PR Shows as Conflicted but No Conflicts Found

**Solution:**
1. Re-sync the branch:
```bash
git fetch origin main
git merge origin/main
git push
```
2. GitHub will recalculate merge status

### Problem: Readiness Check Script Fails

**Common causes:**
- Missing `GITHUB_TOKEN` environment variable
- Insufficient token permissions
- Rate limiting

**Solution:**
```bash
# Verify token
echo $GITHUB_TOKEN

# Check permissions
gh auth status

# Wait if rate limited (1 hour)
```

## Metrics and Success Criteria

### Success Indicators

- ✅ Auto-sync success rate > 80%
- ✅ Average PR age < 30 days
- ✅ Conflict resolution time < 24 hours
- ✅ Ready-to-merge PRs merged within 1 week

### Tracking

Monitor these metrics via:
- Merge readiness report issues
- Auto-sync workflow summaries
- GitHub Insights (if available)

## Future Improvements

Potential enhancements:

1. **Smart Conflict Resolution**
   - AI-powered conflict resolution for common patterns
   - Automatic conflict prevention detection

2. **Priority Queue**
   - Automatic prioritization based on:
     - PR age
     - Impact/importance
     - Conflict complexity

3. **Batch Merge Tool**
   - CLI tool to merge multiple ready PRs at once
   - Dry-run mode for safety

4. **Enhanced Notifications**
   - Slack/Discord integration
   - Email digests for maintainers
   - PR author notifications

## Support

For questions or issues:

1. Check this documentation first
2. Review existing workflow logs
3. Check merge readiness report issues
4. Contact repository maintainers

## Related Documentation

- [Auto-Sync Branches Workflow](.github/workflows/auto-sync-branches.yml)
- [Conflict Resolution Guide](.github/workflows/CONFLICT_RESOLUTION_GUIDE.md)
- [Auto Conflict Resolver](.github/workflows/auto-conflict-resolver.yml)
- [Conflict Resolution Config](.github/workflows/conflict-resolution-config.json)

---

**Last Updated:** 2026-02-11
**Version:** 1.0.0
**Status:** Active
