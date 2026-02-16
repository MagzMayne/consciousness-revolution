# Branch Management Quick Reference

Quick commands and workflows for managing branches in the Barbrick Design repository.

## Quick Stats

```bash
# Count all remote branches
git branch -r | wc -l

# Count merged branches
git branch -r --merged main | grep -v main | wc -l

# Count local branches
git branch | wc -l
```

## Common Operations

### Update Your Branch

```bash
# Switch to your branch
git checkout your-branch-name

# Fetch latest changes
git fetch origin main

# Merge main into your branch
git merge origin/main

# Or rebase (cleaner history)
git rebase origin/main

# Push updates
git push origin your-branch-name
```

### Check Merge Status

```bash
# Check if branch is already merged into main
git branch -r --merged main | grep "your-branch-name"

# See commits that are not in main
git log main..origin/your-branch-name

# See files changed
git diff main...origin/your-branch-name
```

### Delete Branches

```bash
# Delete remote branch
git push origin --delete branch-name

# Delete local branch
git branch -d branch-name

# Force delete local branch (if not merged)
git branch -D branch-name

# Delete multiple branches
for branch in branch1 branch2 branch3; do
  git push origin --delete $branch
done
```

### Bulk Operations

```bash
# List all branches matching pattern
git branch -r | grep "copilot/add-"

# Delete all branches matching pattern (CAREFUL!)
git branch -r | grep "copilot/add-" | sed 's/origin\///' | xargs -I {} git push origin --delete {}

# Count branches by prefix
git branch -r | grep "copilot/" | wc -l
```

## Using the Management Script

```bash
# Analyze all branches
node scripts/branch-management.js analyze

# List stale branches (>90 days)
node scripts/branch-management.js stale

# List merged branches
node scripts/branch-management.js merged

# Show help
node scripts/branch-management.js help
```

## GitHub Actions Workflows

### Manual Workflow Trigger

1. Go to: https://github.com/barbrickdesign/barbrickdesign.github.io/actions
2. Select "Branch Cleanup and Maintenance"
3. Click "Run workflow"
4. Choose options:
   - **analyze-only**: Just generate reports
   - **delete-merged**: Delete branches already merged
   - **full-cleanup**: Complete cleanup
5. Enable/disable dry-run

## Safety Checks

Before deleting any branch:

```bash
# 1. Check if branch has open PR
gh pr list --head branch-name

# 2. Check last commit date
git log -1 --format="%ci" origin/branch-name

# 3. Check who created it
git log -1 --format="%an <%ae>" origin/branch-name

# 4. See what changed
git diff main...origin/branch-name --stat
```

## Emergency Recovery

If you accidentally delete a branch:

```bash
# Find the commit SHA
git reflog

# Or search GitHub events
gh api /repos/barbrickdesign/barbrickdesign.github.io/events

# Recreate branch from commit
git checkout -b branch-name commit-sha
git push origin branch-name
```

## Workflow Patterns

### Daily Developer Workflow

```bash
# 1. Start your day - update main
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b copilot/my-feature

# 3. Make changes and commit
git add .
git commit -m "Add my feature"
git push origin copilot/my-feature

# 4. Keep branch updated (daily)
git fetch origin main
git merge origin/main

# 5. After PR merge - cleanup
git checkout main
git pull origin main
git push origin --delete copilot/my-feature
git branch -d copilot/my-feature
```

### Weekly Maintainer Workflow

```bash
# 1. Review merged branches
node scripts/branch-management.js merged

# 2. Delete merged branches
cat merged-branches-report.json | jq -r '.[].name' | \
  xargs -I {} git push origin --delete {}

# 3. Check branch count
git fetch --all --prune
git branch -r | wc -l

# 4. Review PRs
gh pr list --limit 20
```

### Monthly Cleanup Workflow

```bash
# 1. Generate stale branch report
node scripts/branch-management.js stale

# 2. Review stale branches
cat stale-branches-report.json | jq -r '.[] | "\(.name) - \(.ageInDays) days"'

# 3. Contact branch authors
# (Manual step - check PR status, reach out)

# 4. Delete confirmed stale branches
# After confirmation, delete in batches

# 5. Run full analysis
node scripts/branch-management.js analyze
```

## Troubleshooting

### "Branch not found" error
```bash
git fetch --all --prune
```

### "Branch is ahead of main"
```bash
git fetch origin main
git merge origin/main
```

### "Conflicts detected"
```bash
git status
# Edit conflicting files
git add .
git commit -m "Resolve conflicts"
git push
```

### "Permission denied"
```bash
# Check if branch is protected
# Go to: Settings → Branches → Branch protection rules
```

## Best Practices

✅ **DO**
- Update branches regularly with main
- Delete branches after PR merge
- Use descriptive branch names
- Review before deleting
- Run dry-run first

❌ **DON'T**
- Delete branches without checking
- Leave branches unmerged for months
- Force push to shared branches
- Delete main or protected branches
- Skip the review process

## Keyboard Shortcuts (GitHub UI)

- `g` `p` - Go to Pull Requests
- `g` `b` - Go to Branches
- `g` `a` - Go to Actions
- `/` - Search
- `?` - Show keyboard shortcuts

## Useful Aliases

Add to your `~/.gitconfig`:

```ini
[alias]
  # Branch management
  bclean = "!git branch -r --merged main | grep -v main | sed 's/origin\\///' | xargs -r git push origin --delete"
  blist = branch -r
  bcount = "!git branch -r | wc -l"
  bstats = "!echo 'Total:' && git branch -r | wc -l && echo 'Merged:' && git branch -r --merged main | grep -v main | wc -l"
  
  # Quick updates
  sync = "!git fetch origin main && git merge origin/main"
  update = "!git fetch --all --prune"
```

Usage:
```bash
git bcount      # Count branches
git bstats      # Show statistics
git sync        # Sync with main
git update      # Update all remotes
```

## Resources

- [Full Branch Management Guide](./BRANCH_MANAGEMENT_GUIDE.md)
- [GitHub CLI Docs](https://cli.github.com/manual/)
- [Git Branch Docs](https://git-scm.com/docs/git-branch)

---

*Last Updated: February 8, 2026*
