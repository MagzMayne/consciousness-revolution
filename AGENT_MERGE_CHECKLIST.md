# Agent Merge Compatibility Checklist

## Quick Reference for Agent Developers

Use this checklist when creating or modifying agents to ensure they can always merge without conflicts.

## ✅ Pre-Development Checklist

- [ ] **Read Documentation**
  - [ ] Review [AGENT_MERGE_STRATEGY.md](AGENT_MERGE_STRATEGY.md)
  - [ ] Understand [Conflict Resolution Guide](.github/workflows/CONFLICT_RESOLUTION_GUIDE.md)
  - [ ] Check [agent-deployment-manifest.json](agent-deployment-manifest.json)

- [ ] **Branch Setup**
  - [ ] Create branch with proper naming convention:
    - `copilot/*` for Copilot operations
    - `agent/*` for general agent operations
    - `bot/*` for bot-initiated changes
    - `automated/*` for automated workflows
  - [ ] Sync with base branch before starting work
  - [ ] Verify no existing conflicts

## ✅ During Development Checklist

### 1. Agent Implementation

- [ ] **Import Merge Coordinator**
  ```javascript
  // In browser environment
  const mergeCoordinator = window.MergeCoordinatorAgent || 
                          new MergeCoordinatorAgent();
  
  // In Node.js environment
  const MergeCoordinatorAgent = require('./src/agents/merge-coordinator-agent.js');
  const mergeCoordinator = new MergeCoordinatorAgent();
  ```

- [ ] **Initialize Coordinator**
  ```javascript
  await mergeCoordinator.init();
  ```

### 2. Before File Operations

- [ ] **Request Merge Lock**
  ```javascript
  const files = ['file1.js', 'file2.html'];
  const lock = await mergeCoordinator.requestMergeLock(
    'my-agent-id',
    files,
    'agent/my-branch'
  );
  
  if (!lock.success) {
    // Handle lock failure - don't proceed
    return { skipped: true, reason: 'Files locked' };
  }
  ```

- [ ] **Check Merge Readiness**
  ```javascript
  const readiness = await mergeCoordinator.checkMergeReadiness(
    'agent/my-branch',
    'main'
  );
  
  if (!readiness.ready) {
    // Handle not ready - fix issues first
    console.log('Not ready:', readiness.recommendation);
  }
  ```

### 3. During File Operations

- [ ] **Keep Lock Active**
  - Don't release lock until operation completes
  - Hold lock for entire duration of file modifications

- [ ] **Handle Errors Gracefully**
  ```javascript
  try {
    // Perform operations
    await modifyFiles();
  } catch (error) {
    // Log error
    console.error('Operation failed:', error);
    
    // Release lock even on error
    await mergeCoordinator.releaseMergeLock(lock.lockId);
    
    // Re-throw if needed
    throw error;
  }
  ```

### 4. Before Committing

- [ ] **Validate Pre-Commit**
  ```javascript
  const validation = await mergeCoordinator.validatePreCommit(
    'my-agent-id',
    files,
    'agent/my-branch'
  );
  
  if (!validation.valid) {
    console.error('Pre-commit validation failed:');
    validation.warnings.forEach(w => console.warn(w));
    // Fix issues before committing
    return;
  }
  ```

- [ ] **Check for Conflicts**
  - Run test merge locally if possible
  - Verify no conflict markers in files
  - Ensure git status is clean

### 5. After Operations

- [ ] **Release Lock**
  ```javascript
  await mergeCoordinator.releaseMergeLock(lock.lockId);
  ```

- [ ] **Log Activities**
  ```javascript
  console.log('Operation completed successfully');
  console.log('Files modified:', files);
  console.log('Lock released:', lock.lockId);
  ```

## ✅ Using Agent Coordinator Helper

If using AgentCoordinator, use the helper method:

```javascript
const coordinator = new AgentCoordinator();
await coordinator.init();

const result = await coordinator.executeWithMergeCoordination(
  'my-agent-id',
  ['file1.js', 'file2.html'],
  'agent/my-branch',
  async () => {
    // Your operation code here
    await modifyFiles();
    return { success: true, needsCommit: true };
  }
);

if (result.success) {
  // Operation completed safely
  console.log('Success!');
} else if (result.skipped) {
  // Files were locked - retry later
  console.log('Skipped:', result.reason);
} else {
  // Operation failed
  console.error('Failed:', result.error);
}
```

## ✅ Post-Development Checklist

### 1. Code Review

- [ ] Verify all file operations use merge locks
- [ ] Confirm pre-commit validation is implemented
- [ ] Check error handling includes lock release
- [ ] Ensure logging is comprehensive

### 2. Testing

- [ ] **Test Lock Acquisition**
  - [ ] Successful lock acquisition
  - [ ] Lock denial when files are locked
  - [ ] Lock expiration handling

- [ ] **Test Conflict Detection**
  - [ ] Branch behind base detection
  - [ ] Conflict detection before commit
  - [ ] Merge readiness checks

- [ ] **Test Error Handling**
  - [ ] Lock release on error
  - [ ] Graceful degradation
  - [ ] Retry logic (if applicable)

### 3. Documentation

- [ ] Add agent to `agent-deployment-manifest.json`
- [ ] Include merge strategy in agent documentation
- [ ] Document branch naming convention used
- [ ] Add troubleshooting section

### 4. Deployment

- [ ] Update manifest with merge strategy:
  ```json
  {
    "myAgent": {
      "file": "src/agents/my-agent.js",
      "mergeStrategy": {
        "usesCoordinator": true,
        "branchPattern": "agent/my-agent/*",
        "conflictStrategy": "manual",
        "autoSync": true,
        "requiresLock": true
      }
    }
  }
  ```

- [ ] Create PR with appropriate labels
- [ ] Wait for conflict detection workflow
- [ ] Monitor daily agent conflict fixer

## ✅ Common Patterns

### Pattern 1: Simple File Modification

```javascript
async function safeModifyFiles(agentId, files, branch) {
  const lock = await mergeCoordinator.requestMergeLock(agentId, files, branch);
  
  try {
    if (!lock.success) {
      return { skipped: true };
    }
    
    // Modify files
    await Promise.all(files.map(f => modifyFile(f)));
    
    // Validate
    const validation = await mergeCoordinator.validatePreCommit(
      agentId, files, branch
    );
    
    if (!validation.valid) {
      return { success: false, validation };
    }
    
    // Commit
    await gitCommit('Update files');
    
    return { success: true };
    
  } finally {
    if (lock.success) {
      await mergeCoordinator.releaseMergeLock(lock.lockId);
    }
  }
}
```

### Pattern 2: Multiple Operations with Lock Reuse

```javascript
async function multipleOperations(agentId, branch) {
  const allFiles = ['file1.js', 'file2.js', 'file3.js'];
  const lock = await mergeCoordinator.requestMergeLock(
    agentId, allFiles, branch
  );
  
  try {
    if (!lock.success) return { skipped: true };
    
    // Operation 1
    await modifyFile('file1.js');
    
    // Operation 2
    await modifyFile('file2.js');
    
    // Operation 3
    await modifyFile('file3.js');
    
    // Single validation for all changes
    const validation = await mergeCoordinator.validatePreCommit(
      agentId, allFiles, branch
    );
    
    if (validation.valid) {
      await gitCommit('Multiple updates');
      return { success: true };
    }
    
    return { success: false };
    
  } finally {
    if (lock.success) {
      await mergeCoordinator.releaseMergeLock(lock.lockId);
    }
  }
}
```

### Pattern 3: Lock Failure Retry

```javascript
async function operationWithRetry(agentId, files, branch, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const lock = await mergeCoordinator.requestMergeLock(
      agentId, files, branch
    );
    
    if (lock.success) {
      try {
        // Perform operation
        await modifyFiles(files);
        
        const validation = await mergeCoordinator.validatePreCommit(
          agentId, files, branch
        );
        
        if (validation.valid) {
          await gitCommit('Update');
          return { success: true };
        }
        
      } finally {
        await mergeCoordinator.releaseMergeLock(lock.lockId);
      }
      
      break; // Lock acquired, don't retry
    }
    
    // Lock failed, wait and retry
    console.log(`Lock denied, retry ${i + 1}/${maxRetries}`);
    await sleep(30000); // Wait 30 seconds
  }
  
  return { success: false, reason: 'Max retries exceeded' };
}
```

## ✅ Troubleshooting

### Issue: Can't Acquire Lock

**Cause:** Another agent has files locked

**Solution:**
1. Check active locks: `mergeCoordinator.getStatus()`
2. Wait for lock to expire (5 minutes default)
3. Implement retry logic with exponential backoff
4. Work on different files if possible

### Issue: Pre-Commit Validation Failed

**Cause:** Branch not synchronized or has conflicts

**Solution:**
1. Check validation warnings
2. If `!branchSynced`: Update branch with base
3. If `!noConflicts`: Resolve conflicts manually
4. If `!hasLock`: Acquire lock before committing

### Issue: Merge Conflicts in PR

**Cause:** Branch diverged from base

**Solution:**
1. Wait for daily conflict fixer (2 AM UTC)
2. Or manually trigger: Actions → Daily Agent Conflict Fixer
3. Or resolve manually:
   ```bash
   git pull origin main
   # Resolve conflicts
   git commit
   git push
   ```

## ✅ Best Practices

1. **Always Use Locks** - Never modify files without a lock
2. **Fail Gracefully** - Handle lock failures without crashing
3. **Validate Before Commit** - Always run pre-commit validation
4. **Release Locks Promptly** - Don't hold locks longer than necessary
5. **Log Everything** - Comprehensive logging helps debugging
6. **Test Thoroughly** - Test lock acquisition, validation, and conflicts
7. **Document Clearly** - Help future developers understand your agent

## ✅ Quick Commands

```bash
# Check workflow runs
gh run list --workflow=daily-agent-conflict-fixer.yml

# Trigger conflict fixer manually
gh workflow run daily-agent-conflict-fixer.yml

# Check PR conflicts
gh pr view [PR_NUMBER] --json mergeable

# View merge coordinator status (in browser console)
mergeCoordinator.getStatus()

# Get agent coordinator status
agentCoordinator.getMergeCoordinatorStatus()
```

## ✅ Support

- **Documentation:** [AGENT_MERGE_STRATEGY.md](AGENT_MERGE_STRATEGY.md)
- **Workflows:** `.github/workflows/`
- **Email:** BarbrickDesign@gmail.com
- **Issues:** GitHub Issues with `agent-merge` label

---

**Version:** 1.0.0  
**Last Updated:** 2026-02-08  
**Status:** Active  
**Quick Reference:** Keep this checklist handy when developing agents!
