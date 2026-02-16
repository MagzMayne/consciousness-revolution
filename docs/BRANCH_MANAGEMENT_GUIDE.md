# Branch Management Guide

## Repository Status

**Current State (as of February 2026)**
- **Main Branch**: `main` (commit c4c2147)
- **Total Remote Branches**: 715 branches
- **Open Pull Requests**: 54 PRs
- **Branch Naming Convention**: `copilot/*` for automated changes

## Overview

This repository has accumulated 715+ branches over time, primarily from automated Copilot workflows. This guide provides strategies for managing these branches effectively.

## Branch Categories

### 1. Active Branches
Branches with recent commits (< 90 days) that are actively being worked on or reviewed.

### 2. Stale Branches  
Branches with no activity for 90+ days that may be candidates for cleanup.

### 3. Merged Branches
Branches whose changes have been incorporated into main and can be safely deleted.

### 4. Protected Branches
- `main` - The primary production branch
- Never delete the main branch

## Recommended Workflow

### For Branch Creators

When working on a new feature or fix:

1. **Create from latest main**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b copilot/descriptive-feature-name
   ```

2. **Keep branch updated**
   ```bash
   git fetch origin main
   git merge origin/main
   ```

3. **After merge, delete your branch**
   ```bash
   # After PR is merged
   git push origin --delete copilot/your-branch-name
   ```

### For Repository Maintainers

#### Weekly Maintenance

1. **Check for merged branches**
   ```bash
   node scripts/branch-management.js merged
   ```

2. **Review and delete merged branches**
   ```bash
   # Review the merged-branches-report.json file
   # Delete branches that are confirmed merged
   git push origin --delete branch-name
   ```

#### Monthly Cleanup

1. **Identify stale branches**
   ```bash
   node scripts/branch-management.js stale
   ```

2. **Review stale branches** before deletion
   - Check if PR was abandoned
   - Verify no important work will be lost
   - Confirm with branch author if unsure

3. **Delete confirmed stale branches**
   ```bash
   git push origin --delete copilot/old-branch-name
   ```

#### Quarterly Deep Analysis

1. **Run full analysis**
   ```bash
   node scripts/branch-management.js analyze
   ```

2. **Review generated reports**
   - `branch-analysis-report.json` - Complete analysis
   - `stale-branches-report.json` - Stale branch list
   - `merged-branches-report.json` - Merged branch list

3. **Create cleanup plan**
   - Prioritize oldest branches
   - Contact authors of abandoned PRs
   - Schedule deletion of confirmed stale branches

## Automated Cleanup (Future Enhancement)

### GitHub Actions Workflow

Consider implementing automated branch cleanup:

```yaml
name: Branch Cleanup
on:
  schedule:
    - cron: '0 0 * * 0' # Weekly on Sunday
  workflow_dispatch:

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Delete merged branches
        run: |
          git fetch --all
          git branch -r --merged main | 
            grep -v main | 
            grep 'origin/copilot/' |
            sed 's/origin\///' |
            xargs -I {} git push origin --delete {}
```

## Branch Naming Conventions

### Current Conventions
- `copilot/*` - Automated changes from GitHub Copilot
- `main` - Primary production branch

### Recommended Additional Conventions
- `feature/*` - New features
- `fix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes
- `refactor/*` - Code refactoring
- `docs/*` - Documentation updates

## Best Practices

### DO ✅
- Keep branches up to date with main
- Delete branches after they're merged
- Use descriptive branch names
- Squash commits before merging when appropriate
- Review PR feedback promptly

### DON'T ❌
- Leave branches unmerged for months
- Create branches without clear purpose
- Merge branches with conflicts
- Delete branches without confirmation
- Force push to shared branches

## Troubleshooting

### Branch Has Conflicts

```bash
# Update your branch with latest main
git checkout your-branch
git fetch origin main
git merge origin/main

# Resolve conflicts
git status
# Edit conflicting files
git add .
git commit -m "Resolve merge conflicts"
git push
```

### Branch Won't Delete

```bash
# Check if branch is protected
git push origin --delete branch-name

# If protected, use GitHub UI:
# Settings → Branches → Branch protection rules
```

### Too Many Branches to Manage

```bash
# Use the branch management script
node scripts/branch-management.js analyze

# Review output files:
# - branch-analysis-report.json
# - stale-branches-report.json  
# - merged-branches-report.json

# Delete in batches
for branch in $(cat stale-branches-report.json | jq -r '.[].name' | head -20); do
  git push origin --delete $branch
done
```

## Current Cleanup Strategy

Given the current state (715 branches, 54 open PRs):

### Phase 1: Immediate Actions (This PR)
1. ✅ Ensure current working branch is up to date with main
2. ✅ Create branch management tools and documentation
3. ✅ Generate initial branch reports
4. Document cleanup process

### Phase 2: Short-term (Next 2 weeks)
1. Review all 54 open PRs
2. Merge ready PRs or request changes
3. Close abandoned PRs
4. Delete merged branches

### Phase 3: Medium-term (Next month)
1. Run stale branch analysis
2. Contact authors of stale PRs
3. Delete confirmed stale branches (target: reduce by 50%)
4. Implement automated cleanup workflow

### Phase 4: Long-term (Ongoing)
1. Maintain < 100 active branches
2. Weekly merged branch cleanup
3. Monthly stale branch review
4. Quarterly full analysis

## Tools and Scripts

### Branch Management Script
Location: `scripts/branch-management.js`

Commands:
- `node scripts/branch-management.js analyze` - Full analysis
- `node scripts/branch-management.js stale` - List stale branches
- `node scripts/branch-management.js merged` - List merged branches
- `node scripts/branch-management.js help` - Show help

### Manual Commands

```bash
# List all remote branches
git branch -r

# Count branches
git branch -r | wc -l

# Find branches by pattern
git branch -r | grep "copilot/add-"

# Check if branch is merged
git branch -r --merged main | grep "branch-name"

# Delete remote branch
git push origin --delete branch-name

# Delete multiple branches
cat branch-list.txt | xargs -I {} git push origin --delete {}
```

## Getting Help

If you need help with branch management:

1. Check this guide first
2. Run `node scripts/branch-management.js help`
3. Review generated report files
4. Contact repository maintainer: BarbrickDesign@gmail.com

## Related Documentation

- [Git Branching Best Practices](https://git-scm.com/book/en/v2/Git-Branching-Branching-Workflows)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Repository README](../README.md)
- [Contributing Guidelines](../CONTRIBUTING.md) (if exists)

---

*Last Updated: February 8, 2026*
*Maintainer: Barbrick Design Team*
