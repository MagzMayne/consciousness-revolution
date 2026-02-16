# Conflict Detection & Auto-Resolution - Quick Reference

## For Developers

### When Auto-Resolution Succeeds ✅

**What happened:**
- Workflow automatically resolved all conflicts
- Changes committed to your PR branch
- PR is ready for review

**What you should do:**
1. **Review the auto-resolution commit:**
   ```bash
   git pull origin your-branch
   git log --oneline | head -5
   git show HEAD  # Review the resolution
   ```

2. **Run tests locally:**
   ```bash
   npm test  # or your test command
   ```

3. **If resolution looks good:**
   - Approve and merge the PR
   - Or request review if needed

4. **If resolution looks wrong:**
   ```bash
   git reset --hard HEAD~1  # Undo auto-resolution
   # Resolve manually
   git add .
   git commit -m "Manual conflict resolution"
   git push --force-with-lease
   ```

### When Partial Auto-Resolution Occurs ⚠️

**What happened:**
- Some conflicts were auto-resolved
- Others still need manual attention

**What you should do:**

### When Partial Auto-Resolution Occurs ⚠️

**What happened:**
- Some conflicts were auto-resolved
- Others still need manual attention

**What you should do:**
1. **Pull the partially resolved changes:**
   ```bash
   git pull origin your-branch
   ```

2. **Continue manual resolution:**
   ```bash
   git merge origin/main  # or base branch
   # Resolve remaining conflicts in editor
   git add .
   git commit -m "Resolve remaining conflicts"
   git push
   ```

### When Manual Resolution is Required ❌

1. **Fetch latest changes:**
   ```bash
   git fetch origin main
   ```

2. **Merge base branch:**
   ```bash
   git merge origin/main
   ```

3. **Resolve conflicts in each file:**
   - Open file in editor
   - Find conflict markers: `<<<<<<<`, `=======`, `>>>>>>>`
   - Keep desired changes
   - Remove all markers

4. **Complete the merge:**
   ```bash
   git add .
   git commit -m "Resolve merge conflicts with main"
   git push
   ```

### Quick Commands

**Check conflict status:**
```bash
git status
```

**List conflicted files:**
```bash
git diff --name-only --diff-filter=U
```

**Abort merge and start over:**
```bash
git merge --abort
```

**Keep your version of a file:**
```bash
git checkout --ours <file>
git add <file>
```

**Keep base version of a file:**
```bash
git checkout --theirs <file>
git add <file>
```

## Workflow Behavior

### Automatic Actions

| Situation | Detection Workflow | Auto-Resolution Workflow |
|-----------|-------------------|--------------------------|
| Branch behind, no conflicts | ℹ️ Posts informational comment | ⏭️ Skipped |
| Branch behind, has conflicts | ❌ Posts conflict details | 🤖 Attempts auto-resolution |
| Simple conflicts (docs, CSS) | 📋 Analyzes complexity | ✅ Usually resolves automatically |
| Complex conflicts (JS, logic) | 🔍 Identifies manual needs | ⚠️ Flags for manual resolution |
| Lock file conflicts | 📋 Detects pattern | ✅ Auto-resolves using "ours" |
| Critical files (workflows) | 🚨 High priority flag | ❌ Always requires manual review |
| Branch >10 commits behind | 🚨 Creates tracking issue | 🤖 Attempts resolution if possible |

### Auto-Resolution Strategies

| File Pattern | Strategy | Auto-Resolve? | Description |
|--------------|----------|---------------|-------------|
| `package-lock.json` | `ours` | ✅ Yes | Use PR version, regenerate |
| `*.md` | `both-merge` | ✅ Yes (if simple) | Merge both changes |
| `*.css`, `*.html` | `intelligent-merge` | ✅ Yes (if small) | Smart merge non-overlapping |
| `*.js` | `manual` | ❌ No | Requires human review |
| `.github/workflows/*` | `manual-critical` | ❌ No | Critical - always manual |

### What Gets Reported

**In PR Comments:**
- Auto-resolution success/failure status
- List of resolved files and strategies used
- Remaining conflicts (if any)
- Step-by-step next actions
- Branch sync status
- List of conflicted files
- Step-by-step resolution instructions
- Links to documentation

**In Workflow Artifacts:**
- `conflict-report.md` - Detailed analysis
- `conflicted-files.txt` - List of files
- `merge-output.txt` - Raw merge output

**In GitHub Issues:**
- Created for persistent conflicts
- Includes priority level
- Links to related PR

## Common Scenarios

### Scenario 1: Simple Conflict
```bash
# Fetch and merge
git fetch origin main && git merge origin/main

# Edit conflicted file(s) to resolve
# Then:
git add .
git commit -m "Resolve conflicts"
git push
```

### Scenario 2: Multiple Files
```bash
# Use a merge tool
git mergetool

# Or resolve one by one
git add file1.js
git status  # Check what's left
git add file2.html
# Continue until all resolved
git commit -m "Resolve all conflicts"
git push
```

### Scenario 3: Take All Base Changes
```bash
git fetch origin main
git merge origin/main -X theirs
git push
```

### Scenario 4: Take All Your Changes
```bash
git fetch origin main
git merge origin/main -X ours
git push
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't push after resolving | Check for remaining conflicts: `git status` |
| Conflicts reappear | Search for markers: `grep -r "<<<<<<" .` |
| Merge breaks tests | Run tests locally before push: `npm test` |
| Need to start over | `git merge --abort` then retry |
| Complex conflicts | Ask team for help, tag in PR |

## Prevention Tips

✅ **Sync your branch regularly:**
```bash
git fetch origin main && git merge origin/main
```

✅ **Small, focused PRs** reduce conflict likelihood

✅ **Communicate** with team about shared files

✅ **Rebase before creating PR:**
```bash
git fetch origin main && git rebase origin/main
```

## Getting Help

1. **Check the workflow logs** in Actions tab
2. **Download the conflict report** artifact
3. **Read the full guide**: [CONFLICT_RESOLUTION_GUIDE.md](./CONFLICT_RESOLUTION_GUIDE.md)
4. **Ask in PR comments** and tag maintainers
5. **Create an issue** with `workflow-help` label

## Links

- 📖 [Full Resolution Guide](./CONFLICT_RESOLUTION_GUIDE.md)
- 📖 [Workflows README](./README.md)
- 🔗 [GitHub Docs: Resolving Conflicts](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts)
- 🔗 [Git Docs: Merge Conflicts](https://git-scm.com/docs/git-merge#_how_conflicts_are_presented)

---

**Need more help?** Open an issue or contact repository maintainers.
