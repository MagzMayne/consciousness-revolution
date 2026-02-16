# Automatic Conflict Resolution Guide

## Overview

The **Automatic Conflict Resolution** workflow is an advanced feature that intelligently resolves merge conflicts in pull requests using predefined strategies. This guide explains how the system works and how to configure it for your needs.

## How It Works

### 1. Conflict Detection
When a pull request has merge conflicts, the system:
- Detects which files are conflicted
- Analyzes the type and complexity of conflicts
- Classifies conflicts by file type and pattern

### 2. Strategy Selection
For each conflicted file, the system selects a resolution strategy based on:
- File extension and pattern (e.g., `*.md`, `package-lock.json`)
- Conflict complexity (number of conflict markers)
- File size
- Safety rules defined in configuration

### 3. Automatic Resolution
The system attempts to resolve conflicts using:
- **Pattern-based strategies**: Different approaches for different file types
- **Intelligent merging**: Combining non-overlapping changes
- **Safe defaults**: Conservative approach for critical files

### 4. Verification and Commit
After resolution:
- Changes are committed to the PR branch
- PR is updated automatically
- Status report is generated
- Labels are applied based on outcome

## Resolution Strategies

### Strategy Types

#### 1. `ours`
**Use Case**: Lock files, generated files  
**Action**: Keep the PR branch version  
**Example Files**: `package-lock.json`, `yarn.lock`

```json
{
  "pattern": "package-lock.json",
  "strategy": "ours",
  "autoResolve": true,
  "postResolution": "npm install --package-lock-only"
}
```

#### 2. `theirs`
**Use Case**: Base branch takes precedence  
**Action**: Accept changes from base branch  
**Example**: Configuration files updated in base

#### 3. `both-merge`
**Use Case**: Documentation, CSS, non-overlapping changes  
**Action**: Intelligently merge both sides  
**Example Files**: `README.md`, `*.css`, `*.html`

```json
{
  "pattern": "*.md",
  "strategy": "both-merge",
  "autoResolve": true,
  "safetyCheck": true
}
```

#### 4. `intelligent-merge`
**Use Case**: HTML/CSS files with simple conflicts  
**Action**: Merge non-overlapping sections automatically  
**Safety**: Limited to small files with few conflicts

#### 5. `manual`
**Use Case**: Critical files, complex logic  
**Action**: Flag for manual resolution  
**Example Files**: `*.js`, `.github/workflows/*.yml`

### Strategy Decision Tree

```
File Type?
├─ package-lock.json → "ours" + regenerate
├─ *.md → Can auto-merge? → "both-merge" : "manual"
├─ *.css/*.html → Simple conflict? → "intelligent-merge" : "manual"
├─ *.js → "manual" (always)
├─ .github/workflows/* → "manual-critical"
└─ default → Analyze complexity → "attempt-merge" or "manual"
```

## Configuration

### Resolution Config File

Location: `.github/workflows/conflict-resolution-config.json`

#### Basic Structure

```json
{
  "strategies": {
    "filePatterns": [
      {
        "pattern": "*.md",
        "strategy": "both-merge",
        "autoResolve": true,
        "safetyCheck": true
      }
    ],
    "safetyRules": {
      "maxFileSize": 102400,
      "maxConflictMarkers": 10,
      "requireTestsPass": true
    }
  }
}
```

#### Adding Custom Patterns

To add a new file pattern:

```json
{
  "pattern": "src/config/*.json",
  "strategy": "theirs-with-backup",
  "autoResolve": false,
  "requiresReview": true,
  "description": "Config files should use base branch version"
}
```

#### Safety Rules

Configure safety limits:

```json
"safetyRules": {
  "maxFileSize": 102400,           // Max file size for auto-resolution (bytes)
  "maxConflictMarkers": 10,        // Max number of conflicts per file
  "requireTestsPass": true,        // Run tests before accepting resolution
  "createBackup": true,            // Backup before auto-resolution
  "allowForcePush": false,         // Never force push
  "requireManualReviewFor": [      // Always require manual review
    "security",
    "authentication", 
    "payment",
    "database"
  ]
}
```

## Workflow Triggers

### Automatic Trigger

The workflow runs automatically when:
- A PR is opened with conflicts
- A PR is synchronized and has conflicts
- Conflict detection workflow identifies conflicts

### Manual Trigger

Trigger manually from GitHub Actions UI:

1. Go to **Actions** → **Automatic Conflict Resolution**
2. Click **Run workflow**
3. Enter:
   - **PR number**: The PR to resolve
   - **Strategy**: `auto`, `ours`, `theirs`, or `manual`

```bash
# Via GitHub CLI
gh workflow run auto-conflict-resolver.yml \
  -f pr_number=123 \
  -f strategy=auto
```

## Understanding Resolution Reports

### Resolution Status

#### ✅ Fully Resolved
```
✅ All conflicts have been automatically resolved!

Resolution Summary:
- Total conflicts: 5
- Auto-resolved: 5 files
- Manual required: 0 files
- Status: Complete
```

**Next Steps:**
1. Review the resolution commit
2. Run tests to verify
3. Merge the PR

#### ⚠️ Partially Resolved
```
⚠️ Partial conflict resolution completed

Resolution Summary:
- Total conflicts: 8
- Auto-resolved: 5 files
- Manual required: 3 files
- Changes pushed: Yes
```

**Next Steps:**
1. Pull the updated branch
2. Resolve remaining conflicts manually
3. Commit and push

#### ❌ Manual Resolution Required
```
⚠️ Automatic resolution not possible

Analysis Summary:
- Total conflicts: 4
- Auto-resolvable: 0 files
- Manual required: 4 files
```

**Next Steps:**
1. Follow manual resolution guide
2. Use conflict resolution tools
3. Request help if needed

### File-by-File Report

Each resolution includes detailed file analysis:

| File | Strategy | Auto-Resolve | Status |
|------|----------|--------------|--------|
| `README.md` | both-merge | true | ✅ Resolved |
| `package-lock.json` | ours-regenerate | true | ✅ Resolved |
| `src/auth.js` | manual | false | ⚠️ Manual Required |

## Safety Features

### Pre-Resolution Checks

Before attempting resolution:
- ✅ File size validation
- ✅ Conflict complexity analysis
- ✅ Pattern matching verification
- ✅ Critical file detection

### Post-Resolution Validation

After resolution:
- ✅ Syntax validation (where applicable)
- ✅ No remaining conflict markers
- ✅ Git status verification
- ✅ Commit integrity check

### Backup and Rollback

The system:
- Creates backup branches before resolution
- Preserves original conflict state in artifacts
- Allows easy rollback if needed

To rollback:
```bash
# Reset to before auto-resolution
git reset --hard origin/${{ steps.pr-details.outputs.head_ref }}@{1}

# Or use the backup artifact
# Download from workflow run and restore
```

## Best Practices

### For Repository Maintainers

#### 1. Configure Patterns Carefully
```json
// Good: Specific and safe
{
  "pattern": "docs/*.md",
  "strategy": "both-merge",
  "autoResolve": true
}

// Bad: Too broad, risky
{
  "pattern": "*",
  "strategy": "ours",
  "autoResolve": true
}
```

#### 2. Start Conservative
- Begin with few auto-resolve patterns
- Test with non-critical files first
- Gradually expand as confidence grows

#### 3. Monitor Resolution Success
- Review auto-resolution commits regularly
- Track success/failure rates
- Adjust strategies based on outcomes

#### 4. Document Custom Strategies
Add comments in config file:
```json
{
  "pattern": "src/types/*.ts",
  "strategy": "manual",
  "autoResolve": false,
  "description": "Type definitions are critical and complex",
  "reason": "Auto-merge could break type safety"
}
```

### For Contributors

#### 1. Review Auto-Resolutions
Always review what was auto-resolved:
```bash
# View the auto-resolution commit
git log --oneline | grep "Auto-resolve"
git show <commit-hash>
```

#### 2. Test After Auto-Resolution
```bash
# Pull the auto-resolved changes
git pull origin your-branch

# Run tests
npm test

# Manual verification
npm start
```

#### 3. Report Issues
If auto-resolution seems incorrect:
1. Comment on the PR with specific concerns
2. Tag maintainers
3. Provide expected vs actual behavior

#### 4. Override When Needed
You can always override auto-resolution:
```bash
# Reset the auto-resolution
git reset --hard HEAD~1

# Resolve manually
git merge origin/main
# ... manual resolution ...
git commit -m "Manual conflict resolution"
git push --force-with-lease
```

## Advanced Usage

### Custom Resolution Scripts

For complex patterns, add custom resolution logic:

```yaml
- name: Custom resolution for API files
  if: contains(github.event.file, 'api/')
  run: |
    # Custom merge logic
    python scripts/merge-api-changes.py
```

### Integration with Tests

Ensure tests run after auto-resolution:

```yaml
- name: Run tests after resolution
  if: steps.auto-resolve.outputs.resolved_count > 0
  run: |
    npm install
    npm test
```

### Notifications

Configure additional notifications:

```yaml
- name: Notify team
  if: steps.commit-resolution.outputs.all_resolved == 'true'
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "PR #${{ github.event.number }} conflicts auto-resolved!"
      }
```

## Troubleshooting

### Issue: Auto-Resolution Failed

**Symptoms:**
- Workflow shows "Failed to resolve"
- Conflicts still present after workflow runs

**Causes & Solutions:**

1. **Complex conflicts**
   - Solution: Manual resolution required
   - Check artifact for detailed analysis

2. **File too large**
   - Solution: Increase `maxFileSize` in config
   - Or resolve manually

3. **Permission issues**
   - Solution: Check workflow permissions
   - Ensure `contents: write` is enabled

### Issue: Auto-Resolution Broke Tests

**Symptoms:**
- Tests pass before auto-resolution
- Tests fail after auto-resolution

**Solution:**
1. Review the auto-resolution commit
2. Identify incorrect merges
3. Reset and resolve manually
4. Report issue to improve strategy

### Issue: Wrong Strategy Applied

**Symptoms:**
- File resolved with unexpected strategy
- Pattern not matching as expected

**Solution:**
1. Check pattern order in config (first match wins)
2. Make patterns more specific
3. Use regex patterns for complex matching

### Issue: Push Failed After Resolution

**Symptoms:**
- Resolution successful
- Unable to push to PR branch

**Causes:**
1. **Fork PR**: Cannot push to fork
   - Solution: Contributor must pull and push
   
2. **Protected branch**: Additional restrictions
   - Solution: Adjust branch protection rules

3. **Authentication**: Token permissions
   - Solution: Verify `GITHUB_TOKEN` permissions

## Metrics and Monitoring

### Key Metrics to Track

1. **Auto-Resolution Success Rate**
   - % of conflicts fully auto-resolved
   - Target: >70% for simple conflicts

2. **Partial Resolution Rate**
   - % of conflicts partially resolved
   - Indicates strategy effectiveness

3. **False Positive Rate**
   - Auto-resolutions that broke functionality
   - Target: <5%

4. **Time Savings**
   - Manual resolution time avoided
   - Average time from conflict to resolution

### Viewing Metrics

Check workflow runs:
```bash
# List recent runs
gh run list --workflow=auto-conflict-resolver.yml

# View specific run details
gh run view <run-id>
```

Review artifacts:
- Download resolution reports
- Analyze strategy effectiveness
- Identify improvement opportunities

## Examples

### Example 1: Simple Documentation Conflict

**Scenario**: Two branches update README.md in different sections

**Before:**
```markdown
<<<<<<< HEAD
## New Feature A
Description of feature A
=======
## New Feature B  
Description of feature B
>>>>>>> main
```

**Strategy**: `both-merge`

**After:**
```markdown
## New Feature A
Description of feature A

## New Feature B
Description of feature B
```

**Outcome**: ✅ Automatically resolved

### Example 2: Lock File Conflict

**Scenario**: package-lock.json conflicts due to different dependency versions

**Before:**
```json
<<<<<<< HEAD
"package-a": "1.2.0"
=======
"package-a": "1.3.0"
>>>>>>> main
```

**Strategy**: `ours` + regenerate

**After:**
- Uses PR branch version
- Runs `npm install --package-lock-only`
- Generates clean lock file

**Outcome**: ✅ Automatically resolved

### Example 3: Complex JavaScript Conflict

**Scenario**: Both branches modify the same function

**Strategy**: `manual`

**Outcome**: ⚠️ Manual resolution required

**Reason**: Logic conflicts require human judgment

## FAQ

### Q: Will auto-resolution break my code?

A: The system is designed with safety first:
- Only attempts resolution on known-safe patterns
- Performs validation checks
- Creates backups
- Requires manual review for critical files

### Q: Can I disable auto-resolution?

A: Yes, several ways:
1. Set `autoResolve: false` in config for specific patterns
2. Disable the workflow entirely
3. Use `strategy: manual` for all patterns

### Q: What happens if auto-resolution creates bugs?

A: You can:
1. Revert the auto-resolution commit
2. Resolve manually
3. Report the issue to improve strategies
4. Update config to prevent future similar cases

### Q: Can I customize resolution strategies?

A: Yes! Edit `.github/workflows/conflict-resolution-config.json` to:
- Add new file patterns
- Change strategy per pattern
- Adjust safety rules
- Define custom post-resolution steps

### Q: Does this work with forks?

A: Partially:
- Detection works for all PRs
- Auto-resolution works for same-repo branches
- Fork PRs require contributor to pull and push
- Notifications work for all PRs

## Support

### Getting Help

1. **Check workflow logs**: Detailed execution information
2. **Review artifacts**: Resolution reports and analysis
3. **Consult guides**: This guide and quick reference
4. **Ask maintainers**: Comment on PR or create issue

### Reporting Issues

Create an issue with:
- Workflow run URL
- PR number
- Expected vs actual behavior
- Resolution report (from artifacts)

### Contributing

Help improve auto-resolution:
- Share successful strategies
- Report edge cases
- Suggest new patterns
- Contribute code improvements

## Related Documentation

- [Conflict Detection Guide](./CONFLICT_RESOLUTION_GUIDE.md)
- [Quick Reference](./CONFLICT_QUICK_REFERENCE.md)
- [Workflows README](./README.md)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

**Version:** 1.0.0  
**Last Updated:** 2026-01-06  
**Maintained By:** Repository Automation Team
