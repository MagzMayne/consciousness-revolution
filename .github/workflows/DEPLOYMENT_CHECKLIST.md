# Deployment Checklist for Auto-Review Workflows

## Pre-Deployment

- [x] Workflow files created in `.github/workflows/`
- [x] YAML syntax validated
- [x] Code reviewed and issues addressed
- [x] Security checks passed (CodeQL)
- [x] Documentation created

## Post-Deployment Steps

After this PR is merged, complete these steps to activate the auto-review system:

### 1. Configure Repository Settings

#### Branch Protection Rules
Navigate to: **Settings → Branches → Branch protection rules**

Configure the main branch (usually `main` or `master`):

- [ ] ✅ **Require pull request reviews before merging**
  - Require approvals: 1 (GitHub Actions bot will provide this)
  - ⚠️ **Do NOT check**: "Dismiss stale pull request approvals when new commits are pushed"
  
- [ ] ✅ **Require status checks to pass before merging**
  - Add any existing CI/CD checks
  - ⚠️ **Do NOT add** the auto-review workflows as required checks
  
- [ ] ✅ **Allow auto-merge**
  - This enables the workflows to merge PRs automatically
  
- [ ] ⚠️ **Do NOT enable**: "Require review from Code Owners"
  - This would block automatic merging

#### GitHub Actions Permissions
Navigate to: **Settings → Actions → General → Workflow permissions**

- [ ] ✅ Select: **Read and write permissions**
- [ ] ✅ Check: **Allow GitHub Actions to create and approve pull requests**

### 2. Test the Workflows

#### Create a Test PR

1. [ ] Create a new branch: `test/auto-review`
   ```bash
   git checkout -b test/auto-review
   ```

2. [ ] Make a simple change (e.g., add a comment to README)
   ```bash
   echo "# Test auto-review" >> TEST_AUTO_REVIEW.md
   git add TEST_AUTO_REVIEW.md
   git commit -m "Test auto-review workflow"
   git push origin test/auto-review
   ```

3. [ ] Create a PR from the GitHub UI

4. [ ] Watch the Actions tab
   - Should see "Auto Review and Merge PRs" workflow running
   - Should complete in ~30-60 seconds

5. [ ] Check the PR
   - Should have an approval comment from github-actions bot
   - Should merge automatically if validation passes

6. [ ] Verify merge
   - PR should be merged and closed
   - Test file should appear in main branch

#### Test Scheduled Workflow

1. [ ] Navigate to: **Actions → Review Pending PRs**
2. [ ] Click: **Run workflow**
3. [ ] Leave PR number empty (processes all open PRs)
4. [ ] Click: **Run workflow** button
5. [ ] Watch workflow execute
6. [ ] Verify it processes open PRs (if any exist)

### 3. Monitor Initial Operation

For the first week after deployment:

- [ ] Check workflow runs daily in the Actions tab
- [ ] Monitor PR comments for validation feedback
- [ ] Track success/failure rates
- [ ] Adjust validation rules if needed

### 4. Customize (Optional)

Based on your team's needs, consider customizing:

#### Validation Rules
Edit `.github/workflows/auto-review-pr.yml`:

```yaml
# Add custom validation
# Example: Require PR title format
if (!pr.title.match(/^\[[\w-]+\]/)) {
  validationResults.passed = false;
  validationResults.issues.push('PR title must start with [TAG]');
}
```

#### Schedule Frequency
Edit `.github/workflows/review-pending-prs.yml`:

```yaml
schedule:
  - cron: '0 */6 * * *'  # Change */6 to desired frequency
```

Options:
- `*/3` - Every 3 hours
- `*/12` - Every 12 hours
- `0 9 * * *` - Daily at 9 AM UTC

#### Merge Method
Current: `squash` (recommended)

Change in both workflow files if needed:

```yaml
merge_method: 'squash'  # Options: merge, rebase, squash
```

### 5. Team Communication

Inform your team about the new system:

- [ ] Share documentation links:
  - `.github/workflows/README.md` - Workflow details
  - `AUTO_REVIEW_IMPLEMENTATION.md` - Implementation guide

- [ ] Explain validation rules:
  - Must have file changes
  - No sensitive files
  - All status checks must pass
  - No merge conflicts

- [ ] Set expectations:
  - PRs will auto-approve and merge if valid
  - Clear feedback provided on validation failures
  - Manual review still available if needed

### 6. Ongoing Maintenance

Regular tasks:

- [ ] Weekly: Review workflow run logs
- [ ] Monthly: Check merge success rates
- [ ] Quarterly: Update validation rules as needed
- [ ] As needed: Adjust schedule frequency

## Troubleshooting

### Workflows not running

**Check:**
1. Workflows are not disabled (Actions → Workflows)
2. YAML syntax is correct (Actions tab shows errors)
3. Branch protection allows GitHub Actions
4. Repository is not archived

### PRs not merging

**Check:**
1. Auto-merge is enabled in branch protection
2. GitHub Actions has merge permissions
3. PR has no merge conflicts
4. All required status checks pass

### False validation failures

**Review:**
1. Workflow run logs in Actions tab
2. PR comment with validation details
3. Adjust validation rules if needed

## Success Criteria

Your auto-review system is working when:

- ✅ New PRs trigger the workflow automatically
- ✅ Valid PRs are approved within 1 minute
- ✅ Approved PRs merge automatically
- ✅ Invalid PRs receive clear feedback
- ✅ Scheduled workflow runs every 6 hours
- ✅ No manual intervention needed for routine PRs

## Rollback Plan

If issues occur, you can disable the system:

### Temporary Disable
1. Go to: **Actions → Workflows**
2. Select each workflow
3. Click **"..."** menu
4. Select **"Disable workflow"**

### Permanent Removal
1. Delete workflow files:
   ```bash
   git rm .github/workflows/auto-review-pr.yml
   git rm .github/workflows/review-pending-prs.yml
   git commit -m "Remove auto-review workflows"
   git push
   ```

2. Revert branch protection settings
3. Update team communication

## Support

For help:
1. Check workflow logs in Actions tab
2. Review documentation in `.github/workflows/README.md`
3. Check GitHub Actions documentation
4. Open an issue in the repository

---

**Deployment Status:** Ready for activation  
**Security:** ✅ Passed (CodeQL)  
**Code Review:** ✅ Passed  
**Testing:** ✅ Syntax validated  
**Documentation:** ✅ Complete
