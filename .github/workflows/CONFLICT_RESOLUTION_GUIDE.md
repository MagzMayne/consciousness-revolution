# Conflict Detection & Resolution Guide

## Overview

The **Conflict Detection & Error Handling** workflow automatically identifies and handles merge conflicts and errors when pushing code enhancements to the repository. This guide explains how the workflow operates and how to resolve persistent issues manually.

## Workflow Features

### 🔍 Automatic Detection

The workflow automatically detects:

1. **Branch Status**
   - Checks if your PR branch is behind the base branch
   - Counts the number of commits your branch is behind
   - Identifies which commits need to be merged

2. **Merge Conflicts**
   - Performs a test merge to detect conflicts
   - Identifies specific files with conflicts
   - Classifies the type of error encountered

3. **Error Classification**
   - **Conflict Errors**: Requires manual resolution
   - **Non-Conflict Errors**: Automatically retried

### 🔄 Retry Logic

For non-conflict errors, the workflow implements intelligent retry logic:

- **Max Retries**: 3 attempts
- **Retry Delay**: 5 seconds between attempts
- **Fresh Fetch**: Updates repository data before each retry
- **Automatic Resolution**: Succeeds if transient error clears

### 📊 Comprehensive Reporting

The workflow provides detailed reporting through:

1. **Job Summaries**
   - Branch synchronization status
   - Test merge results
   - Error classification
   - Retry attempt outcomes

2. **PR Comments**
   - Clear conflict notifications
   - List of conflicted files
   - Step-by-step resolution instructions
   - Links to helpful resources

3. **Artifacts**
   - Conflict reports (downloadable)
   - List of conflicted files
   - Merge output logs

4. **GitHub Issues**
   - Automatic issue creation for persistent conflicts
   - Priority classification based on severity
   - Tracking for branches far behind base

## Workflow Triggers

The workflow runs automatically on:

```yaml
pull_request:
  types: [opened, synchronize, reopened, ready_for_review]
```

Or can be triggered manually:

```yaml
workflow_dispatch:
  inputs:
    pr_number: <PR number to check>
```

## Understanding Conflict Notifications

### ❌ Merge Conflicts Detected

When you receive this notification, your PR has conflicts that must be resolved manually.

**What it means:**
- Your branch and the base branch have made different changes to the same files
- Git cannot automatically determine which changes to keep
- You must manually decide how to combine the changes

**Example Notification:**
```
## 🚨 Conflict Detection Alert

❌ Merge conflicts detected - This PR cannot be merged automatically.

### 📊 Status
- Your branch is 5 commits behind the base branch
- Conflicts must be resolved manually

### 📁 Conflicted Files
- `index.html`
- `js/main.js`
- `css/styles.css`
```

### ⚠️ Branch Behind Warning

Your branch is behind but can merge without conflicts.

**What it means:**
- Base branch has new commits not in your branch
- No conflicting changes exist
- Recommended to update for latest features/fixes

**Example Notification:**
```
## ℹ️ Branch Status Update

Your branch is 3 commits behind the base branch, but can be merged without conflicts.

### Recommendation
Consider updating your branch to include the latest changes
```

## Manual Conflict Resolution

### Step 1: Update Your Local Repository

```bash
# Fetch the latest changes from the remote repository
git fetch origin main

# Switch to your PR branch if not already on it
git checkout your-branch-name
```

### Step 2: Merge the Base Branch

```bash
# Merge the base branch into your branch
git merge origin/main
```

If conflicts exist, Git will output:
```
Auto-merging index.html
CONFLICT (content): Merge conflict in index.html
Auto-merging js/main.js
CONFLICT (content): Merge conflict in js/main.js
Automatic merge failed; fix conflicts and then commit the result.
```

### Step 3: Identify Conflicted Files

```bash
# List files with conflicts
git status
```

Output will show:
```
Unmerged paths:
  (use "git add <file>..." to mark resolution)
        both modified:   index.html
        both modified:   js/main.js
```

### Step 4: Resolve Conflicts

Open each conflicted file in your editor. Look for conflict markers:

```html
<<<<<<< HEAD
<div class="header">Your changes</div>
=======
<div class="header">Changes from base branch</div>
>>>>>>> origin/main
```

**Conflict Marker Explanation:**
- `<<<<<<< HEAD`: Start of your changes
- `=======`: Separator between versions
- `>>>>>>> origin/main`: End of base branch changes

**Resolution Options:**

1. **Keep Your Changes Only:**
   ```html
   <div class="header">Your changes</div>
   ```

2. **Keep Base Changes Only:**
   ```html
   <div class="header">Changes from base branch</div>
   ```

3. **Combine Both Changes:**
   ```html
   <div class="header">Your changes and base changes combined</div>
   ```

**Important:** Always remove the conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)

### Step 5: Mark Conflicts as Resolved

```bash
# Add resolved files to staging
git add index.html
git add js/main.js

# Or add all resolved files at once
git add .
```

### Step 6: Complete the Merge

```bash
# Commit the resolved conflicts
git commit -m "Resolve merge conflicts with main"

# Push the changes to update your PR
git push origin your-branch-name
```

### Step 7: Verify Resolution

The workflow will automatically run again when you push. Check that:

1. ✅ No conflict notifications appear
2. ✅ All status checks pass
3. ✅ PR shows "Ready to merge"

## Advanced Resolution Scenarios

### Scenario 1: Multiple Conflicted Files

When many files have conflicts:

```bash
# Use a merge tool for easier conflict resolution
git mergetool

# Or resolve one file at a time
git add resolved-file.js
git status  # Check remaining conflicts
```

### Scenario 2: Binary File Conflicts

For images, PDFs, or other binary files:

```bash
# Keep your version
git checkout --ours conflicted-image.png
git add conflicted-image.png

# Or keep base version
git checkout --theirs conflicted-image.png
git add conflicted-image.png
```

### Scenario 3: Abort Merge

If you need to start over:

```bash
# Abort the merge and return to pre-merge state
git merge --abort

# Start fresh
git fetch origin main
git merge origin/main
```

### Scenario 4: Rebase Instead of Merge

Alternative approach using rebase:

```bash
# Fetch latest changes
git fetch origin main

# Rebase your branch on top of main
git rebase origin/main

# Resolve conflicts if any
# After resolving each conflict:
git add .
git rebase --continue

# Force push (be careful with force push)
git push --force-with-lease origin your-branch-name
```

## Troubleshooting

### Issue: Workflow Shows Conflicts But Local Merge Succeeds

**Possible Causes:**
- Workflow tested against stale base branch
- Race condition between fetch and merge

**Solution:**
```bash
# Force workflow to re-run
git commit --allow-empty -m "Trigger workflow re-run"
git push
```

### Issue: Cannot Push After Resolving Conflicts

**Possible Causes:**
- Protected branch restrictions
- Force push required after rebase

**Solution:**
```bash
# For standard merge (should work)
git push origin your-branch-name

# For rebase (use with caution)
git push --force-with-lease origin your-branch-name
```

### Issue: Conflicts Keep Reappearing

**Possible Causes:**
- Not all conflicts were resolved
- Forgotten conflict markers in code

**Solution:**
```bash
# Search for remaining conflict markers
grep -r "<<<<<<< " .
grep -r "=======" .
grep -r ">>>>>>> " .

# Ensure all are resolved
git status
```

### Issue: Merge Breaks Tests

**Possible Causes:**
- Incompatible changes between branches
- Logical conflicts (no text conflicts but broken functionality)

**Solution:**
1. Run tests locally after resolving conflicts
2. Fix any broken tests before pushing
3. Consider discussing with team about integration issues

```bash
# Run tests before pushing
npm test  # or your test command

# Fix issues, then commit
git add .
git commit -m "Fix tests after merge"
git push
```

### Issue: Need Help Understanding Conflicts

**Resources:**
- View the conflict report artifact from workflow run
- Check PR comments for file-specific guidance
- Review base branch changes: `git log origin/main ^your-branch-name`
- Ask team members familiar with conflicted code

## Best Practices

### Prevent Conflicts

1. **Sync Regularly**
   ```bash
   # Update your branch frequently
   git fetch origin main
   git merge origin/main
   ```

2. **Small, Focused PRs**
   - Keep PRs small and focused on single features
   - Reduces likelihood of conflicts
   - Easier to resolve when they occur

3. **Communicate with Team**
   - Coordinate on shared files
   - Announce major refactoring in advance

4. **Rebase Before Creating PR**
   ```bash
   git fetch origin main
   git rebase origin/main
   git push --force-with-lease origin your-branch-name
   ```

### During Conflict Resolution

1. **Understand Both Changes**
   - Read your changes
   - Read base branch changes
   - Understand the intent of both

2. **Test Thoroughly**
   - Run all tests after resolution
   - Manually test affected features
   - Check for logical conflicts

3. **Commit Meaningful Messages**
   ```bash
   # Good
   git commit -m "Resolve merge conflicts in auth module - kept new validation logic"
   
   # Avoid
   git commit -m "fixed conflicts"
   ```

4. **Ask for Help When Needed**
   - Complex conflicts may need discussion
   - Tag relevant team members in PR
   - Don't guess when uncertain

## Workflow Configuration

### Customizing Retry Behavior

Edit `.github/workflows/conflict-detection-handler.yml`:

```yaml
- name: Retry non-conflict errors
  run: |
    MAX_RETRIES=3      # Change number of retries
    RETRY_DELAY=5      # Change delay in seconds
```

### Customizing Issue Creation Threshold

Change when persistent conflict issues are created:

```yaml
- name: Create issue for persistent conflicts
  if: steps.check-behind.outputs.behind_count > 10  # Change threshold
```

### Adding Custom Notifications

Add additional notification methods (Slack, email, etc.):

```yaml
- name: Notify via Slack
  if: steps.test-merge.outputs.has_conflicts == 'true'
  uses: slackapi/slack-github-action@v1
  # Add your Slack configuration
```

## Monitoring and Metrics

### View Workflow Results

1. **Navigate to Actions Tab**
   - Go to repository → Actions
   - Select "Conflict Detection & Error Handling"
   - View run history

2. **Check PR Comments**
   - Workflow posts detailed comments on PRs
   - Includes step-by-step instructions
   - Links to helpful resources

3. **Download Artifacts**
   - Each run creates a conflict report
   - Contains detailed analysis
   - Retention: 30 days

### Key Metrics to Monitor

- **Conflict Rate**: Percentage of PRs with conflicts
- **Resolution Time**: Time from detection to resolution
- **Retry Success Rate**: How often retries resolve issues
- **Behind Count Distribution**: How far branches typically lag

## Integration with Existing Workflows

This workflow integrates with:

1. **Auto Review and Merge PRs**
   - Runs before auto-merge attempts
   - Prevents merging conflicted PRs

2. **CI/CD Pipeline**
   - Runs alongside tests and builds
   - Ensures code quality before merge

3. **Code Analysis**
   - Complements security and quality checks
   - Part of comprehensive PR validation

## Support and Feedback

### Getting Help

1. **Check Workflow Logs**
   - Detailed error messages in job logs
   - Step-by-step execution details

2. **Review Documentation**
   - This guide
   - GitHub Actions documentation
   - Git conflict resolution guides

3. **Contact Maintainers**
   - Open an issue with `workflow-help` label
   - Include workflow run URL
   - Describe specific problem

### Reporting Issues

If the workflow has bugs or needs improvements:

1. Create an issue with:
   - Workflow run URL
   - Expected vs actual behavior
   - Error messages or screenshots
   - Steps to reproduce

2. Tag with appropriate labels:
   - `bug`: For workflow errors
   - `enhancement`: For feature requests
   - `documentation`: For doc improvements

## Conclusion

The Conflict Detection & Error Handling workflow automates the identification of merge conflicts and provides comprehensive guidance for resolution. By following this guide, you can efficiently resolve conflicts and maintain a smooth development workflow.

### Quick Reference

**Conflict Resolution Commands:**
```bash
git fetch origin main
git merge origin/main
# Resolve conflicts in editor
git add .
git commit -m "Resolve merge conflicts"
git push
```

**Check Conflict Status:**
```bash
git status
git diff --name-only --diff-filter=U
```

**Abort and Retry:**
```bash
git merge --abort
# Try again with fresh approach
```

---

**Last Updated:** $(date +"%Y-%m-%d")
**Workflow Version:** 1.0
**Maintained By:** Repository Automation Team
