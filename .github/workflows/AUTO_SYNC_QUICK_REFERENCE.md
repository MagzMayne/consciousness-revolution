# Auto-Sync Quick Reference

## What is Auto-Sync?

Auto-Sync automatically performs `git fetch origin main`, `git merge origin/main`, and `git push` on your branches daily to prevent merge conflicts.

## Quick Commands

### View Auto-Sync Status

Check the latest auto-sync report:
- Go to **Issues** tab
- Look for "🔄 Auto-Sync Report - [date]"

### Manually Trigger Auto-Sync

1. Go to **Actions** tab
2. Select **Auto-Sync Branches with Main**
3. Click **Run workflow**
4. Choose options and click **Run workflow**

### Pull Synced Changes Locally

After your branch is auto-synced:

```bash
git pull origin <your-branch-name>
```

## Understanding Notifications

### ✅ Success: "Branch Auto-Synced"

**What happened:** Your branch was successfully merged with main.

**What to do:**
```bash
git pull origin <your-branch-name>
# Review changes and continue working
```

### ⚠️ Conflict: "Auto-Sync Failed"

**What happened:** Your branch has merge conflicts.

**What to do:**
```bash
git fetch origin main
git merge origin/main
# Resolve conflicts in your editor
git add .
git commit -m "Resolve merge conflicts"
git push
```

### ℹ️ Info: "Branch Up to Date"

**What happened:** Your branch already has all changes from main.

**What to do:** Nothing! Keep working.

## Common Scenarios

### Scenario 1: My branch was auto-synced, now what?

1. Pull the changes: `git pull origin <branch-name>`
2. Review what was merged
3. Run tests to ensure nothing broke
4. Continue your work

### Scenario 2: Auto-sync failed with conflicts

1. Read the PR comment for conflict details
2. Follow the resolution steps provided
3. Check if auto-conflict-resolver fixed it
4. If not, resolve manually

### Scenario 3: I don't want my branch auto-synced

Options:
- Use a branch name that doesn't match the pattern (not `copilot/*`)
- Accept the sync and pull changes when ready
- Contact maintainers to adjust the workflow settings

### Scenario 4: How do I know if my branch will be synced?

Check these conditions:
- ✅ Branch matches pattern (e.g., `copilot/*`)
- ✅ Branch is not protected
- ✅ Branch is behind main
- ✅ Branch is not the base branch (main)

## Benefits

### Before Auto-Sync
```
Your Branch: A → B → C
Main Branch: A → X → Y → Z
Result: Merge conflicts when creating PR
```

### After Auto-Sync
```
Your Branch: A → B → C → (merge X, Y, Z) → D
Main Branch: A → X → Y → Z
Result: Clean merge when creating PR ✅
```

## Timing

- **Scheduled:** Daily at 1 AM UTC
- **Manual:** Anytime via Actions tab
- **Next Run:** Check Actions tab for schedule

## Pattern Matching

| Your Branch Name | Will Sync? |
|------------------|------------|
| `copilot/feature-1` | ✅ Yes (default pattern) |
| `feature/new-ui` | ❌ No (doesn't match `copilot/*`) |
| `main` | ❌ No (base branch) |
| `copilot/bug-fix` | ✅ Yes |

## Dry Run Mode

Test without making changes:

1. Actions → Auto-Sync Branches → Run workflow
2. Set **dry_run: true**
3. Check the report to see what **would** happen
4. Run again with **dry_run: false** to actually sync

## Troubleshooting

### My branch wasn't synced

**Check:**
1. Does branch name match pattern? (default: `copilot/*`)
2. Is branch already up to date?
3. Check workflow logs for errors

### Sync failed

**Common causes:**
- Merge conflicts (requires manual resolution)
- Branch permissions issues
- Branch was deleted

**Fix:** Check PR comment for specific instructions

### I want to sync a different base branch

Manual trigger with custom settings:
1. Actions → Auto-Sync → Run workflow
2. Set **base_branch: development** (or your branch)
3. Run workflow

## Related Workflows

- **Auto-Conflict-Resolver** - Fixes simple conflicts automatically
- **Daily Agent Conflict Fixer** - Cleanup for stuck branches
- **Conflict Detection** - Catches conflicts in PRs

## Support

For help:
1. Check [AUTO_SYNC_GUIDE.md](./AUTO_SYNC_GUIDE.md) for detailed docs
2. Review workflow logs in Actions tab
3. Check summary issues for details
4. Contact repository maintainers

---

*🤖 Auto-Sync Branches Workflow*
*Preventing merge conflicts since 2026*
