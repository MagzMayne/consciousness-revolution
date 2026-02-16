# Agent Merge Strategy Guide

## Overview

This guide ensures that when any agents (autonomous systems) run and make changes to the repository, they can **always merge successfully** without conflicts. This is critical for maintaining a healthy automated workflow.

## Problem Statement

Multiple agents may run simultaneously or sequentially, making changes to the repository. Without proper coordination:
- ❌ Merge conflicts occur between agent branches
- ❌ Agents get stuck waiting for manual conflict resolution
- ❌ Automation breaks down
- ❌ Repository becomes blocked

**Solution:** Implement comprehensive merge coordination and conflict prevention mechanisms.

## System Architecture

### 1. Conflict Prevention Workflows

Three automated GitHub Actions workflows work together:

#### A. Daily Agent Conflict Fixer
**File:** `.github/workflows/daily-agent-conflict-fixer.yml`

**Purpose:** Proactively detect and fix agent branches that are stuck

**Features:**
- Runs daily at 2 AM UTC (or manual trigger)
- Scans all agent branches (`copilot/*`, `agent/*`, `bot/*`, `automated/*`)
- Detects:
  - Branches with merge conflicts
  - Branches significantly behind base (>10 commits)
  - Stale branches without PRs (>20 commits behind)
- Automatic fixes:
  - Triggers auto-conflict-resolver for conflicted PRs
  - Adds update suggestions to PRs
  - Creates tracking issues for stale branches
- Daily summary reports

**Manual Trigger:**
```bash
# Via GitHub Actions UI:
# Actions → Daily Agent Conflict Fixer → Run workflow
# Options:
#   - branch_pattern: Pattern to match (default: copilot/*)
#   - dry_run: true for detection only, false to fix
```

#### B. Auto Conflict Resolver
**File:** `.github/workflows/auto-conflict-resolver.yml`

**Purpose:** Intelligently resolve merge conflicts automatically

**Strategies:**
- `ours` - Use agent branch version (for lock files)
- `theirs` - Use base branch version (for config files)
- `both-merge` - Merge both changes (for docs, CSS)
- `intelligent-merge` - Smart merge for HTML files
- `manual` - Flag for manual resolution (for JS, workflows)

**Configuration:** `.github/workflows/conflict-resolution-config.json`

**File Patterns:**
```json
{
  "pattern": "package-lock.json",
  "strategy": "ours",
  "autoResolve": true,
  "postResolution": "npm install --package-lock-only"
}
```

#### C. Conflict Detection Handler
**File:** `.github/workflows/conflict-detection-handler.yml`

**Purpose:** Real-time conflict detection on PR operations

**Triggers:**
- PR opened, updated, or reopened
- Manual trigger with PR number

**Actions:**
- Detects merge conflicts
- Classifies error types
- Implements retry logic (max 3 attempts)
- Posts detailed PR comments
- Creates GitHub issues for persistent conflicts
- Provides step-by-step resolution instructions

### 2. Merge Coordinator Agent

**File:** `src/agents/merge-coordinator-agent.js`

**Purpose:** Runtime coordination of agent operations to prevent conflicts

**Key Features:**

#### A. Merge Locking System
Prevents concurrent modifications to the same files:

```javascript
// Agent requests lock before modifying files
const lockResult = await mergeCoordinator.requestMergeLock(
    'my-agent-id',
    ['file1.js', 'file2.html'],
    'agent/my-branch'
);

if (lockResult.success) {
    // Perform operations
    await modifyFiles();
    
    // Release lock
    await mergeCoordinator.releaseMergeLock(lockResult.lockId);
} else {
    // Wait or skip - files are locked by another agent
    console.log('Files locked by:', lockResult.conflictingLocks);
}
```

#### B. Pre-Commit Validation
Ensures it's safe to commit before doing so:

```javascript
// Before committing, validate
const validation = await mergeCoordinator.validatePreCommit(
    'my-agent-id',
    ['file1.js', 'file2.html'],
    'agent/my-branch'
);

if (validation.valid) {
    // Safe to commit
    await gitCommit();
} else {
    // Not safe - handle warnings
    console.warn('Validation failed:', validation.warnings);
}
```

#### C. Merge Readiness Check
Check if branch is ready to merge:

```javascript
const readiness = await mergeCoordinator.checkMergeReadiness(
    'agent/my-branch',
    'main'
);

if (readiness.ready) {
    // Safe to merge
    await mergeBranch();
} else {
    // Not ready - follow recommendation
    console.log('Not ready:', readiness.recommendation);
}
```

#### D. Branch Synchronization
Keep agent branches up to date:

```javascript
const syncStatus = await mergeCoordinator.syncBranchBeforeCommit(
    'agent/my-branch',
    'main'
);

if (syncStatus.needsSync) {
    // Branch is behind, needs update
    console.log(`${syncStatus.commitsBehind} commits behind`);
    console.log(`Run: ${syncStatus.gitCommand}`);
}
```

## Best Practices for Agent Developers

### 1. Always Use Merge Locks

**Good:**
```javascript
class MyAgent {
    async performOperation(files) {
        const lock = await mergeCoordinator.requestMergeLock(
            this.id,
            files,
            this.branch
        );
        
        try {
            if (!lock.success) {
                // Files are locked, retry later
                return { skipped: true, reason: 'Files locked' };
            }
            
            // Perform operations
            await this.modifyFiles(files);
            
            // Validate before commit
            const validation = await mergeCoordinator.validatePreCommit(
                this.id, files, this.branch
            );
            
            if (validation.valid) {
                await this.commit();
            }
            
        } finally {
            // Always release lock
            if (lock.success) {
                await mergeCoordinator.releaseMergeLock(lock.lockId);
            }
        }
    }
}
```

**Bad:**
```javascript
class MyAgent {
    async performOperation(files) {
        // No locking - concurrent operations can conflict!
        await this.modifyFiles(files);
        await this.commit(); // Might conflict with other agents
    }
}
```

### 2. Check Branch Status Before Operations

```javascript
// Always check merge readiness before major operations
const readiness = await mergeCoordinator.checkMergeReadiness(
    this.branch,
    'main'
);

if (!readiness.ready) {
    if (readiness.checks.hasConflicts) {
        // Wait for conflict resolution
        return { delayed: true, reason: 'Conflicts detected' };
    }
    
    if (readiness.checks.isBehind) {
        // Sync with base first
        await this.syncWithBase();
    }
}
```

### 3. Handle Lock Failures Gracefully

```javascript
const lock = await mergeCoordinator.requestMergeLock(id, files, branch);

if (!lock.success) {
    // Don't fail - handle gracefully
    
    // Option 1: Retry after delay
    await sleep(30000); // Wait 30 seconds
    return await this.performOperation(files);
    
    // Option 2: Skip and log
    this.log('Files locked, skipping operation');
    return { skipped: true };
    
    // Option 3: Work on different files
    const alternativeFiles = this.findUnlockedFiles();
    return await this.performOperation(alternativeFiles);
}
```

### 4. Validate Before Every Commit

```javascript
// Never commit without validation
async function safeCommit(agent, files, message) {
    const validation = await mergeCoordinator.validatePreCommit(
        agent.id,
        files,
        agent.branch
    );
    
    if (!validation.valid) {
        console.error('Pre-commit validation failed:');
        validation.warnings.forEach(w => console.warn('  -', w));
        
        // Fix issues before committing
        if (!validation.validations.branchSynced) {
            await syncBranch();
        }
        
        if (!validation.validations.noConflicts) {
            throw new Error('Conflicts detected - cannot commit');
        }
    }
    
    // Now safe to commit
    await git.commit(message);
}
```

### 5. Use Appropriate Branch Naming

Follow these patterns so workflows can detect agent branches:

- `copilot/*` - GitHub Copilot operations
- `agent/*` - General agent operations  
- `bot/*` - Bot-initiated changes
- `automated/*` - Automated workflows

**Examples:**
- `copilot/fix-payment-integration`
- `agent/update-documentation`
- `bot/dependency-update`
- `automated/daily-maintenance`

## Agent Integration Checklist

When creating or updating an agent, ensure:

- [ ] Agent uses `MergeCoordinatorAgent` for all file operations
- [ ] Agent requests merge locks before modifying files
- [ ] Agent releases locks after operations (even on error)
- [ ] Agent validates pre-commit before committing
- [ ] Agent checks merge readiness before pushing
- [ ] Agent handles lock failures gracefully
- [ ] Agent uses appropriate branch naming convention
- [ ] Agent logs all merge coordination activities
- [ ] Agent has retry logic for transient failures
- [ ] Agent documents its merge strategy

## Configuration Files

### 1. Conflict Resolution Config

**File:** `.github/workflows/conflict-resolution-config.json`

Add custom resolution strategies:

```json
{
  "strategies": {
    "filePatterns": [
      {
        "pattern": "src/agents/*.js",
        "strategy": "manual",
        "autoResolve": false,
        "requiresReview": true,
        "description": "Agent files require careful review"
      }
    ]
  }
}
```

### 2. Agent Deployment Manifest

**File:** `agent-deployment-manifest.json`

Update with merge strategy information:

```json
{
  "systems": {
    "myAgent": {
      "file": "src/agents/my-agent.js",
      "mergeStrategy": {
        "usesCoordinator": true,
        "branchPattern": "agent/my-agent/*",
        "conflictStrategy": "manual",
        "autoSync": true
      }
    }
  }
}
```

## Monitoring and Debugging

### Check Active Locks

```javascript
const status = mergeCoordinator.getStatus();
console.log('Active locks:', status.activeLocks);
console.log('Metrics:', status.metrics);
```

### View Workflow Runs

```bash
# List recent conflict fixer runs
gh run list --workflow=daily-agent-conflict-fixer.yml

# View specific run
gh run view <run-id>

# Download artifacts
gh run download <run-id>
```

### Check Branch Status

```bash
# Check if branch has conflicts
git merge --no-commit --no-ff origin/main

# Check commits behind
git rev-list --count origin/main..HEAD

# Check for active operations
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/owner/repo/actions/runs?status=in_progress
```

## Troubleshooting

### Issue: Agent Branch Has Conflicts

**Symptoms:** PR shows merge conflicts, agent stuck

**Solution:**
1. Wait for daily conflict fixer (runs at 2 AM UTC)
2. Or manually trigger: Actions → Daily Agent Conflict Fixer → Run
3. Or manually resolve:
   ```bash
   git checkout agent/branch-name
   git pull origin main
   # Resolve conflicts
   git commit
   git push
   ```

### Issue: Agent Can't Acquire Lock

**Symptoms:** Agent keeps retrying, no progress

**Solution:**
1. Check active locks: `mergeCoordinator.getStatus()`
2. Wait for lock to expire (5 minutes default)
3. Or manually release stuck locks:
   ```javascript
   // In browser console or Node
   mergeCoordinator.cleanupExpiredLocks();
   ```

### Issue: Workflow Not Running

**Symptoms:** Daily fixer doesn't run, no conflict resolution

**Solution:**
1. Check workflows are enabled in `.github/workflows/`
2. Check workflow permissions in repo settings
3. Manually trigger: Actions → Select workflow → Run workflow
4. Check workflow logs for errors

### Issue: Automatic Resolution Failed

**Symptoms:** Conflicts still present after auto-resolution

**Solution:**
1. Download resolution report from workflow artifacts
2. Check which files couldn't be auto-resolved
3. Add custom strategy in `conflict-resolution-config.json`
4. Or resolve manually and update strategy

## Testing

### Test Merge Coordinator

```javascript
// Create test instance
const coordinator = new MergeCoordinatorAgent({
    lockTimeout: 60000, // 1 minute for testing
    maxRetries: 2
});

await coordinator.init();

// Test lock acquisition
const lock1 = await coordinator.requestMergeLock(
    'test-agent-1',
    ['test-file.js'],
    'agent/test-branch'
);
console.assert(lock1.success, 'Lock should succeed');

// Test concurrent lock (should fail)
const lock2 = await coordinator.requestMergeLock(
    'test-agent-2',
    ['test-file.js'],
    'agent/test-branch'
);
console.assert(!lock2.success, 'Concurrent lock should fail');

// Test release
await coordinator.releaseMergeLock(lock1.lockId);

// Now second agent can acquire lock
const lock3 = await coordinator.requestMergeLock(
    'test-agent-2',
    ['test-file.js'],
    'agent/test-branch'
);
console.assert(lock3.success, 'Lock should succeed after release');

await coordinator.stop();
```

### Test Workflow Integration

1. Create test PR from agent branch
2. Introduce conflicts manually
3. Trigger conflict detection workflow
4. Verify workflow detects conflicts
5. Trigger auto-resolver
6. Verify conflicts are resolved

## Metrics and Reporting

The system tracks:

- **Locks Acquired/Released:** Monitor coordination activity
- **Conflicts Prevented:** Successful pre-commit validations
- **Merges Completed/Failed:** Overall success rate
- **Average Lock Duration:** Identify bottlenecks
- **Resolution Success Rate:** Auto-resolver effectiveness

View metrics:

```javascript
const metrics = mergeCoordinator.metrics;
console.log('Conflicts prevented:', metrics.conflictsPrevented);
console.log('Merges completed:', metrics.mergesCompleted);
console.log('Success rate:', 
    (metrics.mergesCompleted / 
     (metrics.mergesCompleted + metrics.mergesFailed) * 100) + '%'
);
```

## Future Enhancements

Planned improvements:

- [ ] Distributed lock management (Redis/database)
- [ ] Priority queuing for critical agents
- [ ] Predictive conflict detection (ML-based)
- [ ] Automatic branch cleanup for merged PRs
- [ ] Real-time dashboard for lock visualization
- [ ] Slack/email notifications for stuck branches
- [ ] Integration with Merlin Hive for orchestration

## Support

### Getting Help

- **Documentation:** This guide and related workflow guides
- **Workflow Logs:** Check GitHub Actions tab for detailed logs
- **Agent Logs:** Check browser console or server logs
- **Issues:** Create GitHub issue with `agent-merge` label

### Contact

- **Email:** BarbrickDesign@gmail.com
- **Subject:** "Agent Merge Strategy - [Brief Description]"
- **Include:** Workflow run URLs, error messages, steps to reproduce

## Related Documentation

- [Conflict Resolution Guide](/.github/workflows/CONFLICT_RESOLUTION_GUIDE.md)
- [Auto Conflict Resolution Guide](/.github/workflows/AUTO_CONFLICT_RESOLUTION_GUIDE.md)
- [Conflict Quick Reference](/.github/workflows/CONFLICT_QUICK_REFERENCE.md)
- [Agent System Guide](/AGENT_SYSTEM_GUIDE.md)
- [Workflows README](/.github/workflows/README.md)

---

**Version:** 1.0.0  
**Last Updated:** 2026-02-08  
**Status:** Active  
**Maintained By:** Repository Automation Team
