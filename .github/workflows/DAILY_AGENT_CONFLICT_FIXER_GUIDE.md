# Daily Agent Conflict Fixer

## Overview

The Daily Agent Conflict Fixer is an automated GitHub Actions workflow that runs daily to detect and fix agent branches (like `copilot/*`, `agent/*`, `bot/*`) that may be stuck due to merge conflicts or are significantly behind the base branch.

## Purpose

Automated agents (like GitHub Copilot agents) create branches to work on issues. Sometimes these branches can become stuck because:
- They have merge conflicts with the base branch
- They are too far behind the base branch (missing recent commits)
- They don't have an associated PR and are stale
- The agent cannot push changes due to conflicts

This workflow proactively identifies and attempts to resolve these issues automatically.

## Features

### 1. **Automatic Detection**
- Scans all agent-related branches (patterns: `copilot/*`, `agent/*`, `bot/*`, `automated/*`)
- Identifies branches with merge conflicts
- Detects branches significantly behind the base branch
- Finds stale branches without PRs

### 2. **Intelligent Fix Strategies**

#### For Branches with PRs and Conflicts:
- Automatically triggers the `auto-conflict-resolver.yml` workflow
- Attempts pattern-based automatic conflict resolution
- Updates PR with resolution status

#### For Branches Behind Base (No Conflicts):
- Adds a helpful comment to the PR
- Provides git commands to update the branch
- Suggests preventive measures

#### For Stale Branches Without PRs:
- Creates a tracking issue with branch details
- Suggests next steps (create PR, update, or delete)
- Provides cleanup commands

### 3. **Daily Reporting**
- Creates a daily summary issue with all findings
- Auto-closes previous day's reports
- Tracks success/failure of fix attempts
- Provides actionable next steps

## Schedule

The workflow runs automatically:
- **Daily at 2 AM UTC**
- Can also be triggered manually via GitHub Actions UI

## Manual Trigger

You can manually trigger the workflow with custom options:

1. Go to **Actions** tab in GitHub
2. Select **"Daily Agent Conflict Fixer"**
3. Click **"Run workflow"**
4. Configure options:
   - **branch_pattern**: Pattern to match (default: `copilot/*`)
   - **dry_run**: Set to `true` to only detect without fixing

### Example Manual Runs

**Check all agent branches:**
```
branch_pattern: copilot/*
dry_run: false
```

**Dry run to see what would be fixed:**
```
branch_pattern: copilot/*
dry_run: true
```

**Check specific pattern:**
```
branch_pattern: agent/fix-*
dry_run: false
```

## Workflow Steps

### Step 1: Find Agent Branches
- Queries GitHub API for all branches
- Filters for agent-related patterns
- Logs all found agent branches

### Step 2: Check for Conflicts
- For each agent branch:
  - Compares with default branch
  - Checks how many commits behind/ahead
  - Looks for associated open PRs
  - Determines if PR is mergeable
  - Classifies issue type (conflicts, behind, stale)

### Step 3: Generate Report
- Creates detailed markdown report
- Lists all problematic branches
- Documents branch status and issues

### Step 4: Attempt Fixes (unless dry_run)
- **For conflicted PRs:**
  - Triggers auto-conflict-resolver workflow
  - Logs trigger status
  
- **For behind PRs:**
  - Posts update suggestion comment
  - Provides git commands
  
- **For stale branches:**
  - Creates tracking issue
  - Suggests actions (PR, update, delete)

### Step 5: Create Summary Issue
- Creates/updates daily report issue
- Closes previous day's report
- Tags with appropriate labels
- Includes actionable items

### Step 6: Upload Artifacts
- Saves detailed reports
- Available for 30 days
- Accessible from workflow run

## Permissions Required

The workflow needs:
- ✅ `contents: write` - To read branch information
- ✅ `pull-requests: write` - To comment on PRs
- ✅ `issues: write` - To create tracking issues
- ✅ `actions: write` - To trigger auto-resolver workflow

## Configuration

### Branch Patterns

Default patterns checked:
```javascript
/^copilot\//    // GitHub Copilot agent branches
/^agent\//      // Generic agent branches
/^bot\//        // Bot branches
/^automated\//  // Automated task branches
```

### Thresholds

- **Significantly behind:** > 10 commits
- **Stale without PR:** > 20 commits behind

These can be adjusted in the workflow file.

## Integration with Existing Workflows

This workflow integrates with:

1. **auto-conflict-resolver.yml**
   - Triggered automatically for conflicted PRs
   - Applies resolution strategies
   - Updates PR branch

2. **conflict-detection-handler.yml**
   - Provides conflict detection logic
   - Analyzes conflict types
   - Suggests resolution strategies

3. **review-pending-prs.yml**
   - Complements daily checks
   - Focuses on PR review/merge
   - Runs every 6 hours

## Output

### Issues Created

1. **Daily Summary Issue:**
   - Title: `🤖 Daily Agent Conflict Report - YYYY-MM-DD`
   - Labels: `daily-agent-report`, `automated`, `needs-attention` or `all-clear`
   - Contains: Statistics, branch details, actions taken

2. **Stale Branch Issues:**
   - Title: `🚨 Stale Agent Branch: branch-name`
   - Labels: `stale-branch`, `automated`, `needs-attention`
   - Contains: Branch details, cleanup commands

### PR Comments

For branches behind base:
```markdown
## 🤖 Daily Agent Branch Check

This branch is **X commits behind** the base branch.

### Recommendation

Update your branch to include the latest changes...
```

### Artifacts

- `daily-agent-conflict-report-{run_number}.md`
- Retained for 30 days
- Detailed branch analysis

## Monitoring

### View Workflow Runs

1. Go to **Actions** tab
2. Select **"Daily Agent Conflict Fixer"**
3. View run history

### Check Daily Reports

Look for issues labeled:
- `daily-agent-report`
- `automated`

### Metrics to Track

- **Detection Rate:** How many stuck branches found per day
- **Auto-Fix Success Rate:** Fixed vs. Failed counts
- **Manual Intervention Required:** Branches needing human attention

## Troubleshooting

### Workflow Doesn't Run

**Possible Causes:**
1. Repository is inactive → GitHub may disable scheduled workflows
2. Workflow file has syntax errors → Validate YAML
3. Workflow is manually disabled → Check Actions settings

**Solution:**
- Manually trigger once to reactivate
- Check workflow logs for errors

### No Branches Detected

**Possible Causes:**
1. No agent branches exist in repository
2. Pattern doesn't match branch names
3. Permissions issue reading branches

**Solution:**
- Verify agent branches exist: `git branch -r | grep copilot`
- Try custom pattern in manual trigger
- Check workflow permissions

### Auto-Resolver Not Triggered

**Possible Causes:**
1. `auto-conflict-resolver.yml` workflow doesn't exist
2. Workflow dispatch failed
3. Permissions issue

**Solution:**
- Verify workflow file exists
- Check workflow logs for dispatch errors
- Ensure `actions: write` permission is granted

### Issues Not Created

**Possible Causes:**
1. No conflicted branches found (this is good!)
2. Issue creation failed
3. Permissions issue

**Solution:**
- Check workflow logs for errors
- Ensure `issues: write` permission is granted
- Verify no rate limiting issues

## Best Practices

### For Repository Maintainers

1. **Review daily reports regularly**
   - Check the daily summary issue
   - Address failed fixes promptly
   - Clean up stale branches

2. **Monitor agent activity**
   - Track agent branch creation rate
   - Identify patterns in conflicts
   - Adjust branch protection rules if needed

3. **Customize thresholds**
   - Adjust "behind by" thresholds based on repo activity
   - Modify stale branch criteria
   - Add custom branch patterns

### For Contributors

1. **Keep branches updated**
   - Merge base branch regularly
   - Respond to update suggestions
   - Clean up finished branches

2. **Monitor your PRs**
   - Check for auto-resolver comments
   - Verify automatic fixes
   - Manually resolve complex conflicts

3. **Communicate blockers**
   - Comment on PRs if stuck
   - Request help for complex conflicts
   - Close PRs that are no longer needed

## Examples

### Example 1: Successful Daily Run

```
📊 Results:
- Total Agent Branches: 5
- Conflicted/Stuck: 2
- Healthy: 3
- Fixed: 2
- Failed: 0

✅ All issues successfully handled!
```

### Example 2: Mixed Results

```
📊 Results:
- Total Agent Branches: 8
- Conflicted/Stuck: 4
- Healthy: 4
- Fixed: 3
- Failed: 1

⚠️ 1 branch requires manual intervention
```

### Example 3: All Clear

```
📊 Results:
- Total Agent Branches: 3
- Conflicted/Stuck: 0
- Healthy: 3

✅ All agent branches are healthy!
```

## Security Considerations

1. **Automatic Fixes:**
   - Only applies safe resolution strategies
   - Respects file patterns and safety rules
   - Creates backups before resolution

2. **Branch Access:**
   - Only reads branch information
   - Does not directly modify branches
   - Triggers separate workflows for fixes

3. **Issue Creation:**
   - Issues are public (be cautious with sensitive info)
   - Labels clearly mark as automated
   - Previous reports are auto-closed

## Future Enhancements

Potential improvements:

1. **Notification System:**
   - Email/Slack notifications for critical issues
   - Alert on repeated fix failures
   - Summary digest for maintainers

2. **Advanced Analytics:**
   - Track conflict patterns over time
   - Identify problematic files/patterns
   - Generate health metrics dashboard

3. **Custom Strategies:**
   - Per-branch resolution strategies
   - Project-specific conflict rules
   - Learning from manual resolutions

4. **Auto-Cleanup:**
   - Automatically delete abandoned branches
   - Archive old agent branches
   - Merge stale but completed work

## Related Documentation

- [Automatic Conflict Resolution Guide](./AUTO_CONFLICT_RESOLUTION_GUIDE.md)
- [Conflict Detection Guide](./CONFLICT_RESOLUTION_GUIDE.md)
- [GitHub Actions Workflows README](./README.md)

## Support

For issues with this workflow:
1. Check workflow run logs in Actions tab
2. Review daily summary issues
3. Consult this documentation
4. Contact repository maintainers

---

**Note:** This workflow is designed to reduce manual maintenance overhead while ensuring agent branches remain healthy and conflict-free. Regular monitoring ensures optimal performance.
