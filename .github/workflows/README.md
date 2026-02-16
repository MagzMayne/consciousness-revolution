# GitHub Actions Workflows

This directory contains automated workflows for managing pull requests and ensuring code quality in the repository.

## Workflows

### 0. Auto-Sync Branches with Main (`auto-sync-branches.yml`) ⭐ NEW

**Trigger:** 
- Scheduled: Runs daily at 1 AM UTC
- Manual: Can be triggered via GitHub Actions UI with custom options

**Purpose:** Proactively prevents merge conflicts by automatically syncing branches with the main branch.

**What it does:**
1. **Finds Eligible Branches:**
   - Identifies branches matching the pattern (default: `copilot/*`)
   - Skips protected branches automatically
   - Checks which branches are behind main

2. **Automatic Synchronization:**
   - Performs `git fetch origin main`
   - Performs `git merge origin/main`
   - Performs `git push origin <branch-name>`
   - Only syncs branches with clean merges (no conflicts)

3. **Intelligent Handling:**
   - **For clean merges:** Syncs branch and comments on PR with success message
   - **For conflicts:** Notifies PR, adds labels, and triggers auto-conflict-resolver
   - **For up-to-date branches:** Skips sync, no action needed

4. **Comprehensive Reporting:**
   - Creates daily summary issue with all sync results
   - Comments on each affected PR explaining what happened
   - Provides manual resolution steps for conflicted branches
   - Uploads detailed CSV report as artifact

**Key Features:**
- ✅ Prevents conflicts before they occur (proactive approach)
- ✅ Automatic daily execution keeps branches current
- ✅ Dry-run mode for testing without changes
- ✅ Customizable branch patterns and base branch
- ✅ Integration with auto-conflict-resolver workflow
- ✅ Safe - only syncs non-protected branches with clean merges
- ✅ Detailed reporting and transparency

**Permissions Required:**
- `contents: write` - To push synced branches
- `pull-requests: write` - To comment on PRs
- `issues: write` - To create summary issues

**Manual Trigger:**
```bash
# Via GitHub Actions UI:
# 1. Go to Actions tab
# 2. Select "Auto-Sync Branches with Main"
# 3. Click "Run workflow"
# 4. Configure:
#    - branch_pattern: Pattern to match (default: copilot/*)
#    - dry_run: true for detection only, false to sync
#    - base_branch: Branch to sync with (default: main)
```

**Related Documentation:**
- See [AUTO_SYNC_GUIDE.md](./AUTO_SYNC_GUIDE.md) for complete guide

**Integration:**
- Triggers `auto-conflict-resolver.yml` for conflicted branches
- Runs 1 hour before `daily-agent-conflict-fixer.yml` for optimal workflow
- Complements conflict detection and resolution workflows

---

### 1. Daily Agent Conflict Fixer (`daily-agent-conflict-fixer.yml`) ⭐

**Trigger:** 
- Scheduled: Runs daily at 2 AM UTC
- Manual: Can be triggered via GitHub Actions UI with custom options

**Purpose:** Proactively detects and fixes agent branches (like `copilot/*`, `agent/*`, `bot/*`) that are stuck due to merge conflicts or are significantly behind the base branch.

**What it does:**
1. **Scans Agent Branches:**
   - Finds all agent-related branches (copilot/*, agent/*, bot/*, automated/*)
   - Compares each branch with the default branch
   - Identifies conflicts and stale branches

2. **Automatic Detection:**
   - Branches with merge conflicts and open PRs
   - Branches significantly behind base (>10 commits)
   - Stale branches without PRs (>20 commits behind)

3. **Intelligent Fixes:**
   - **For conflicted PRs:** Triggers auto-conflict-resolver workflow
   - **For behind PRs:** Adds update suggestion comment with git commands
   - **For stale branches:** Creates tracking issue with cleanup instructions

4. **Daily Reporting:**
   - Creates daily summary issue with all findings
   - Auto-closes previous day's report
   - Tracks fix success/failure rates
   - Provides actionable next steps

**Key Features:**
- ✅ Daily proactive health checks for agent branches
- ✅ Automatic trigger of conflict resolution workflows
- ✅ Smart detection of stuck/stale branches
- ✅ Daily summary issues with complete status
- ✅ Dry-run mode for testing
- ✅ Customizable branch patterns
- ✅ Integration with existing conflict workflows

**Permissions Required:**
- `contents: write` - To read branch information
- `pull-requests: write` - To comment on PRs
- `issues: write` - To create tracking issues
- `actions: write` - To trigger auto-resolver

**Manual Trigger:**
```bash
# Via GitHub Actions UI:
# 1. Go to Actions tab
# 2. Select "Daily Agent Conflict Fixer"
# 3. Click "Run workflow"
# 4. Configure:
#    - branch_pattern: Pattern to match (default: copilot/*)
#    - dry_run: true for detection only, false to fix
```

**Related Documentation:**
- See [DAILY_AGENT_CONFLICT_FIXER_GUIDE.md](./DAILY_AGENT_CONFLICT_FIXER_GUIDE.md) for complete guide

**Integration:**
- Triggers `auto-conflict-resolver.yml` for conflicted PRs
- Creates issues tracked by repository maintainers
- Complements `review-pending-prs.yml` for complete automation

### 1. Conflict Detection & Error Handling (`conflict-detection-handler.yml`)

**Trigger:** 
- Automatically runs when a PR is opened, updated, or reopened
- Can be triggered manually with a specific PR number

**Purpose:** Identifies and handles merge conflicts and errors preventing code enhancements from being pushed to the repository.

**What it does:**
1. **Detects Conflicts:**
   - Checks if PR branch is behind the base branch
   - Performs test merge to identify conflicts
   - Lists specific files with conflicts
   - Determines how many commits behind the branch is

2. **Error Classification:**
   - Distinguishes between merge conflicts and other errors
   - Identifies retryable vs non-retryable errors
   - Provides specific error context

3. **Retry Logic:**
   - Automatically retries non-conflict errors (max 3 attempts)
   - Uses exponential backoff between retries
   - Fetches latest changes before each retry

4. **Comprehensive Notifications:**
   - Posts detailed PR comments with conflict information
   - Creates GitHub issues for persistent conflicts
   - Provides step-by-step resolution instructions
   - Generates downloadable conflict reports

5. **Documentation:**
   - Includes complete resolution guide
   - Provides manual resolution commands
   - Links to helpful resources

**Key Features:**
- ✅ Automatic conflict detection on every PR event
- ✅ Test merge without affecting branches
- ✅ Detailed file-level conflict identification
- ✅ Intelligent retry for transient errors
- ✅ Priority classification for conflicts
- ✅ Artifact generation for debugging
- ✅ Issue creation for long-running conflicts

**Permissions Required:**
- `contents: write` - To perform test merges
- `pull-requests: write` - To comment on PRs
- `issues: write` - To create tracking issues

**Manual Trigger:**
```bash
# Via GitHub Actions UI:
# 1. Go to Actions tab
# 2. Select "Conflict Detection & Error Handling"
# 3. Click "Run workflow"
# 4. Enter PR number to check specific PR
```

**Related Documentation:**
- See [CONFLICT_RESOLUTION_GUIDE.md](./CONFLICT_RESOLUTION_GUIDE.md) for detailed resolution instructions

**Integration with Auto-Resolution:**
- When conflicts are detected, automatically triggers the Automatic Conflict Resolution workflow
- Works seamlessly with auto-resolution to provide end-to-end conflict handling

### 1.5. Automatic Conflict Resolution (`auto-conflict-resolver.yml`)

**Trigger:** 
- Automatically triggered by Conflict Detection workflow when conflicts are found
- Can be manually triggered for specific PRs
- Runs on PR synchronization events

**Purpose:** Automatically resolves merge conflicts using predefined strategies, reducing manual intervention and speeding up the PR merge process.

**What it does:**
1. **Analyzes Conflicts:**
   - Identifies conflict types and complexity
   - Classifies files by pattern and importance
   - Determines which conflicts can be auto-resolved
   - Evaluates file size and conflict marker count

2. **Strategy-Based Resolution:**
   - Uses pattern-based strategies (e.g., `*.md` → both-merge)
   - Applies file-specific rules (e.g., `package-lock.json` → ours)
   - Implements intelligent merging for compatible changes
   - Respects safety rules for critical files

3. **Automatic Resolution Execution:**
   - Merges base branch into PR branch
   - Applies resolution strategies to conflicted files
   - Validates resolved content
   - Creates backup of original state

4. **Branch Update:**
   - Commits resolved changes automatically
   - Pushes to PR branch (for same-repo PRs)
   - Updates PR status and labels
   - Provides detailed commit message

5. **Comprehensive Reporting:**
   - File-by-file resolution status
   - Strategy used for each file
   - Success/failure breakdown
   - Next steps for manual intervention if needed

**Resolution Strategies:**
- ✅ `ours`: Use PR branch version (lock files, generated files)
- ✅ `theirs`: Use base branch version (config updates)
- ✅ `both-merge`: Intelligently merge both sides (docs, CSS)
- ✅ `intelligent-merge`: Auto-merge non-overlapping changes (HTML, simple conflicts)
- ⚠️ `manual`: Flag for human review (JS, critical files)

**Safety Features:**
- ✅ File size limits for auto-resolution
- ✅ Conflict marker count limits
- ✅ Pattern-based safe file identification
- ✅ Critical file protection (workflows, security)
- ✅ Backup creation before resolution
- ✅ Validation after resolution

**Configuration:**
- Resolution strategies defined in `.github/workflows/conflict-resolution-config.json`
- Customizable patterns and rules
- Adjustable safety thresholds
- Per-file strategy override

**Permissions Required:**
- `contents: write` - To commit and push resolutions
- `pull-requests: write` - To update PR and add labels
- `issues: write` - To create tracking issues if needed

**Manual Trigger:**
```bash
# Via GitHub Actions UI:
# 1. Go to Actions tab
# 2. Select "Automatic Conflict Resolution"
# 3. Click "Run workflow"
# 4. Enter PR number and strategy (auto/ours/theirs/manual)
```

**Outcomes:**

1. **Full Auto-Resolution** (✅):
   - All conflicts resolved automatically
   - Changes committed and pushed to PR
   - PR ready for review/merge
   - Label: `conflicts-auto-resolved`

2. **Partial Resolution** (⚠️):
   - Some conflicts resolved, others remain
   - Partial changes committed
   - Manual resolution needed for remaining
   - Label: `conflicts-partially-resolved`

3. **Manual Required** (❌):
   - No auto-resolution possible
   - All conflicts need human review
   - Detailed guidance provided
   - Label: `has-conflicts`, `needs-manual-resolution`

**Related Documentation:**
- See [AUTO_CONFLICT_RESOLUTION_GUIDE.md](./AUTO_CONFLICT_RESOLUTION_GUIDE.md) for detailed usage
- See [conflict-resolution-config.json](./conflict-resolution-config.json) for configuration options

### 2. Auto Review and Merge PRs (`auto-review-pr.yml`)

**Trigger:** Automatically runs when a PR is opened, updated, or marked ready for review.

**Purpose:** Automatically reviews, validates, and merges pull requests that meet quality standards.

**What it does:**
1. **Validates PR** against quality checks:
   - Ensures PR has file changes
   - Checks for sensitive files (passwords, tokens, secrets)
   - Verifies all status checks pass
   - Confirms PR is mergeable

2. **Approves PR** if validation passes:
   - Posts approval review with validation details
   - Enables auto-merge if available
   - Merges PR automatically

3. **Comments on failures**:
   - Posts detailed information about validation issues
   - Allows re-review when issues are fixed

**Validation Checks:**
- ✅ Has file changes
- ✅ No sensitive files detected
- ✅ All status checks passed
- ✅ No merge conflicts

**Permissions Required:**
- `contents: write` - To merge PRs
- `pull-requests: write` - To approve PRs
- `issues: write` - To comment on PRs

### 3. Review Pending PRs (`review-pending-prs.yml`)

**Trigger:** 
- Scheduled: Runs every 6 hours automatically
- Manual: Can be triggered via GitHub Actions UI with optional PR number

**Purpose:** Processes any open PRs that haven't been reviewed yet, ensuring no PRs are missed.

**What it does:**
1. **Lists all open PRs** (or specific PR if provided)
2. **Filters out draft PRs**
3. **For each PR:**
   - Checks if already approved/merged
   - Validates PR against quality standards
   - Approves and merges if validation passes
   - Comments with issues if validation fails

**Use Cases:**
- Catch PRs that were opened when the main workflow wasn't active
- Re-process PRs that had temporary issues
- Manually trigger review for specific PRs
- Regular maintenance to keep PR queue clean

**Manual Trigger:**
```bash
# Via GitHub Actions UI:
# 1. Go to Actions tab
# 2. Select "Review Pending PRs"
# 3. Click "Run workflow"
# 4. (Optional) Enter PR number to review specific PR
```

## Configuration

### Branch Protection Rules

For best results, configure branch protection rules:

1. **Go to:** Settings → Branches → Branch protection rules
2. **Configure:**
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass
   - ✅ Allow auto-merge
   - ⚠️ Do NOT require approval from code owners (for auto-merge)
   - ⚠️ Allow GitHub Actions bot to approve and merge

### Workflow Permissions

Workflows use `GITHUB_TOKEN` which has these permissions:
- Read/write access to pull requests
- Read/write access to repository contents
- Read/write access to issues (for comments)

## Security

### What the workflows check:

1. **Sensitive Files:**
   - Blocks files with: `.env`, `secret`, `password`, `token`, `key` in filename
   - Prevents accidental secret commits

2. **Status Checks:**
   - Ensures all CI/CD checks pass before merge
   - Respects existing quality gates

3. **Merge Conflicts:**
   - Only merges if PR is mergeable
   - Prevents breaking changes

### What the workflows do NOT check:

- Code quality (relies on other CI checks)
- Security vulnerabilities (should use separate security scanning)
- License compliance (should use separate tools)
- Performance impact (should use performance testing)

## Troubleshooting

### Workflow doesn't approve PR

**Possible causes:**
1. PR is a draft → Solution: Mark as ready for review
2. PR has merge conflicts → Solution: Resolve conflicts
3. Status checks failing → Solution: Fix failing checks
4. Contains sensitive files → Solution: Remove sensitive files

### Workflow approves but doesn't merge

**Possible causes:**
1. Branch protection requires multiple approvals → Solution: Adjust branch protection or get manual approval
2. PR is not mergeable → Solution: Check for conflicts or rebase
3. Missing permissions → Solution: Check workflow permissions

### Scheduled workflow not running

**Possible causes:**
1. Workflow file has syntax errors → Solution: Validate YAML syntax
2. Repository is inactive → Solution: GitHub may disable workflows on inactive repos
3. Workflow is disabled → Solution: Enable workflow in Actions settings

## Customization

### Adjusting validation rules

Edit the validation logic in either workflow file:

```javascript
// Example: Add custom validation
if (pr.title.includes('[WIP]')) {
  validationResults.passed = false;
  validationResults.issues.push('PR marked as work in progress');
}
```

### Changing merge method

Current: `squash` merge

Options: `merge`, `rebase`, `squash`

```javascript
merge_method: 'squash'  // Change to 'merge' or 'rebase'
```

### Adjusting schedule

Current: Every 6 hours

```yaml
schedule:
  - cron: '0 */6 * * *'  # Change */6 to desired frequency
```

## Monitoring

### View workflow runs

1. Go to **Actions** tab
2. Select workflow from left sidebar
3. View run history and logs

### Key metrics to monitor

- **Success rate**: How many PRs auto-merge successfully
- **Failure reasons**: What validation checks fail most often
- **Processing time**: How long reviews take
- **Queue depth**: How many pending PRs exist

## Integration with Existing Code

This repository already has a `GitHubPRReviewAgent` class in:
- `src/agents/github-pr-review-agent.js`

The GitHub Actions workflows provide the **automation layer** that:
- Triggers automatically on PR events
- Runs in GitHub's infrastructure
- Uses GitHub's API directly
- Provides reliable, consistent reviews

The existing agent code provides the **business logic** that:
- Can be used in custom scripts
- Provides detailed validation
- Can be extended with custom rules
- Useful for testing and development

## Future Enhancements

Potential improvements:

1. **Advanced Security Scanning:**
   - Integrate CodeQL for vulnerability detection
   - Check for license compliance
   - Validate dependency updates

2. **Intelligent Routing:**
   - Assign reviewers based on file changes
   - Notify specific teams for certain areas
   - Escalate complex PRs to humans

3. **Custom Validation Rules:**
   - Check PR title format
   - Validate commit message conventions
   - Ensure tests are included

4. **Metrics and Reporting:**
   - Track PR merge times
   - Report on automation effectiveness
   - Alert on unusual patterns

## Support

For issues or questions about these workflows:
1. Check workflow run logs in Actions tab
2. Review this documentation
3. Check GitHub Actions documentation
4. Contact repository maintainers

---

**Note:** These workflows are designed to automate routine PR reviews while maintaining quality standards. Always review complex or sensitive changes manually.
