# Auto-Sync Branches Workflow Guide

## Overview

The **Auto-Sync Branches** workflow automatically keeps branches synchronized with the main branch by performing `git fetch origin main`, `git merge origin/main`, and `git push` operations. This proactive approach prevents merge conflicts before they occur.

## Purpose

**Problem:** Branches that fall behind the main branch often encounter merge conflicts when it's time to merge.

**Solution:** Automatically sync branches with main on a daily basis, merging the latest changes before conflicts become complex.

## How It Works

### Daily Automation (Scheduled)

The workflow runs automatically every day at 1 AM UTC:

1. **Find Eligible Branches**
   - Identifies branches matching the pattern (default: `copilot/*`)
   - Skips protected branches (like `main`)
   - Skips the base branch itself

2. **Check Branch Status**
   - Compares each branch with the main branch
   - Identifies how many commits behind each branch is
   - Determines if the branch has an open PR

3. **Perform Automatic Sync**
   - Executes `git fetch origin main`
   - Executes `git merge origin/main` (with no-edit commit)
   - Executes `git push origin <branch-name>`
   - Handles merge conflicts gracefully

4. **Report Results**
   - Creates a summary issue with all sync results
   - Comments on PRs for synced branches
   - Notifies about branches with conflicts
   - Triggers auto-conflict-resolver for problematic branches

### Manual Trigger (On-Demand)

You can also run the workflow manually for immediate syncing:

1. Go to **Actions** tab in GitHub
2. Select **Auto-Sync Branches with Main**
3. Click **Run workflow**
4. Configure options:
   - **branch_pattern**: Pattern to match (e.g., `feature/*`, `copilot/*`, `*`)
   - **dry_run**: Set to `true` to preview without making changes
   - **base_branch**: Branch to sync with (default: `main`)

## Features

### ✅ Proactive Conflict Prevention

- Syncs branches **before** conflicts become complex
- Reduces manual merge conflict resolution time
- Keeps all branches up to date with the latest main branch changes

### 🔄 Automatic Execution

- Runs daily without manual intervention
- Processes multiple branches in one run
- Handles both PR and non-PR branches

### 🛡️ Safe Operations

- Only syncs branches with clean merges (no conflicts)
- Skips protected branches automatically
- Creates detailed reports for all operations
- Dry-run mode for testing

### 📊 Comprehensive Reporting

- Daily summary issues with complete statistics
- PR comments explaining what was synced
- Conflict notifications with resolution steps
- Detailed logs for troubleshooting

### 🔧 Intelligent Conflict Handling

- Detects branches with merge conflicts
- Triggers auto-conflict-resolver workflow automatically
- Provides manual resolution instructions
- Labels PRs appropriately

## Usage Examples

### Example 1: Sync All Copilot Branches

```yaml
# Automatically runs daily at 1 AM UTC
# Syncs all branches matching "copilot/*"
```

Manual trigger:
1. Actions → Auto-Sync Branches with Main → Run workflow
2. Leave defaults (branch_pattern: `copilot/*`, dry_run: `false`, base_branch: `main`)
3. Click Run workflow

### Example 2: Preview Sync for Feature Branches

1. Actions → Auto-Sync Branches with Main → Run workflow
2. Set options:
   - branch_pattern: `feature/*`
   - dry_run: `true`
   - base_branch: `main`
3. Click Run workflow
4. Check the summary issue to see what **would** be synced

### Example 3: Sync All Branches with Development

1. Actions → Auto-Sync Branches with Main → Run workflow
2. Set options:
   - branch_pattern: `*`
   - dry_run: `false`
   - base_branch: `development`
3. Click Run workflow

## Branch Selection Patterns

The workflow supports flexible branch patterns:

| Pattern | Description | Example Branches |
|---------|-------------|------------------|
| `copilot/*` | All Copilot branches | `copilot/feature-1`, `copilot/fix-bug` |
| `feature/*` | All feature branches | `feature/new-ui`, `feature/api-update` |
| `*` | All branches (except protected) | Any non-protected branch |
| `fix/*` | All fix branches | `fix/typo`, `fix/security` |
| `agent/*,bot/*` | Multiple patterns | `agent/task-1`, `bot/automation` |

## Understanding the Results

### Successfully Synced

When a branch is successfully synced:

✅ **What happened:**
- Latest changes from main were merged into the branch
- Changes were pushed to GitHub
- No conflicts were encountered

✅ **What you should do:**
1. Pull the latest changes: `git pull origin <branch-name>`
2. Review any merged changes
3. Ensure tests still pass
4. Continue your work

### Conflicts Detected

When conflicts are detected:

⚠️ **What happened:**
- The branch cannot be merged cleanly with main
- Automatic sync was aborted
- Auto-conflict-resolver workflow was triggered

⚠️ **What you should do:**
1. Follow the resolution steps in the PR comment
2. Manually resolve conflicts:
   ```bash
   git fetch origin main
   git merge origin/main
   # Resolve conflicts in your editor
   git add .
   git commit -m "Resolve merge conflicts with main"
   git push origin <branch-name>
   ```
3. Check if auto-conflict-resolver fixed simple conflicts

### Already Up to Date

When a branch is already up to date:

ℹ️ **What happened:**
- Branch already has all changes from main
- No sync needed

ℹ️ **What you should do:**
- Nothing! Your branch is current.

## Integration with Other Workflows

### Works With: Auto-Conflict-Resolver

When a branch has conflicts:
1. **Auto-Sync** detects the conflict
2. **Auto-Sync** triggers **Auto-Conflict-Resolver**
3. **Auto-Conflict-Resolver** attempts to resolve simple conflicts
4. If successful, the PR is ready for review
5. If not, manual resolution is required

### Works With: Daily Agent Conflict Fixer

- **Auto-Sync** runs at 1 AM UTC (proactive)
- **Daily Agent Conflict Fixer** runs at 2 AM UTC (cleanup)
- Together, they ensure branches stay healthy

### Works With: Conflict Detection Handler

- **Auto-Sync** prevents conflicts proactively
- **Conflict Detection Handler** catches conflicts in PRs
- Together, they minimize conflict resolution effort

## Configuration

### Scheduled Time

To change when the workflow runs daily:

Edit `.github/workflows/auto-sync-branches.yml`:

```yaml
on:
  schedule:
    # Change this cron expression
    - cron: '0 1 * * *'  # Currently: 1 AM UTC daily
```

Cron examples:
- `'0 0 * * *'` - Midnight UTC daily
- `'0 */6 * * *'` - Every 6 hours
- `'0 9 * * 1-5'` - 9 AM UTC on weekdays only

### Default Branch Pattern

To change which branches are synced by default:

Edit `.github/workflows/auto-sync-branches.yml`:

```yaml
inputs:
  branch_pattern:
    default: 'copilot/*'  # Change this default
```

### Permissions

The workflow requires:

```yaml
permissions:
  contents: write       # To push synced branches
  pull-requests: write  # To comment on PRs
  issues: write         # To create summary issues
```

## Troubleshooting

### Branch Not Syncing

**Check:**
1. Does the branch match the pattern?
2. Is the branch protected?
3. Is the branch already up to date?
4. Check workflow logs for errors

### Sync Failed

**Common causes:**
1. **Merge conflicts** - Requires manual resolution
2. **Push errors** - Check branch permissions
3. **Checkout errors** - Branch may have been deleted

**Resolution:**
- Check the workflow logs for specific error messages
- Review the sync report CSV artifact
- Look for PR comments explaining the failure

### Too Many Branches Being Synced

**Solution:**
- Use a more specific branch pattern
- Example: Instead of `*`, use `copilot/*` or `feature/active-*`

### Workflow Not Running

**Check:**
1. Is the workflow file in `.github/workflows/`?
2. Is the cron schedule correct?
3. Are workflow permissions enabled in repository settings?
4. Check Actions tab for workflow status

## Best Practices

### 1. Use Specific Branch Patterns

✅ **Good:**
```yaml
branch_pattern: 'copilot/*,feature/*'
```

❌ **Avoid:**
```yaml
branch_pattern: '*'  # May sync too many branches
```

### 2. Test with Dry Run First

Before syncing all branches:
1. Run with `dry_run: true`
2. Review the summary issue
3. Run with `dry_run: false` if results look good

### 3. Monitor Summary Issues

- Check daily summary issues for sync status
- Address conflicted branches promptly
- Close resolved summary issues

### 4. Keep PRs Small and Frequent

- Smaller PRs are less likely to have conflicts
- Merge PRs quickly to reduce drift
- Auto-sync helps keep long-lived branches current

### 5. Review Auto-Synced Changes

After a branch is synced:
1. Pull the changes locally
2. Review what was merged
3. Run tests to ensure nothing broke
4. Address any issues before requesting review

## Security Considerations

### Branch Protection

- Protected branches (like `main`, `production`) are **automatically skipped**
- The workflow cannot modify protected branches
- This prevents accidental changes to critical branches

### Permissions

- Workflow uses `GITHUB_TOKEN` with limited permissions
- Cannot access secrets or sensitive data
- Only performs git operations on non-protected branches

### Audit Trail

- All sync operations are logged
- Summary issues track what was changed
- PR comments provide transparency
- Git history shows merge commits

## FAQs

### Q: Will this sync my local branches?

**A:** No, this only syncs remote branches in GitHub. You still need to `git pull` to get the changes locally.

### Q: Can I exclude specific branches?

**A:** Yes, use negative patterns in manual triggers. For protected branches, they're automatically excluded.

### Q: What if I don't want my branch synced?

**A:** Either:
1. Use a branch name that doesn't match the pattern
2. Make the branch protected (if appropriate)
3. Accept the sync and pull changes when ready

### Q: Will this overwrite my commits?

**A:** No, it only merges changes from main into your branch. Your commits are preserved. It's equivalent to running `git merge origin/main` yourself.

### Q: What happens if multiple branches have the same conflicts?

**A:** Each branch is processed independently. If multiple branches have conflicts, they'll all be marked and the auto-conflict-resolver will be triggered for each.

### Q: Can I disable this workflow?

**A:** Yes, delete or rename the workflow file, or disable it in the Actions settings.

## Related Documentation

- [Auto-Conflict-Resolver Guide](./AUTO_CONFLICT_RESOLUTION_GUIDE.md)
- [Daily Agent Conflict Fixer Guide](./DAILY_AGENT_CONFLICT_FIXER_GUIDE.md)
- [Conflict Resolution Guide](./CONFLICT_RESOLUTION_GUIDE.md)
- [Workflow Implementation Summary](./IMPLEMENTATION_SUMMARY.md)

## Support

For issues or questions:
1. Check workflow logs in Actions tab
2. Review summary issues for details
3. Consult this guide
4. Contact repository maintainers

---

*🤖 Part of the Automated Workflow System*
*Last Updated: 2026-02-09*
