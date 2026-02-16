# How to Fix PR #1675 Merge Conflicts

## Quick Fix (Recommended)

Use the GitHub Actions workflow to automatically fix the conflicts:

1. Go to the [Actions tab](../../actions/workflows/fix-pr-conflicts.yml)
2. Click "Run workflow"
3. Enter:
   - **PR number**: `1675`
   - **Strategy**: `ours` (prefer PR branch changes)
4. Click "Run workflow"
5. Wait for completion (usually 1-2 minutes)
6. The PR will be automatically updated and ready to merge!

## Manual Fix (If workflow is unavailable)

### Option 1: Using the Shell Script

```bash
cd /path/to/barbrickdesign.github.io
./.github/scripts/fix-pr-1675-conflicts.sh
git push origin copilot/achieve-quantum-teleportation
```

### Option 2: Manual Git Commands

```bash
# Clone and navigate to repository
cd /path/to/barbrickdesign.github.io

# Fetch latest changes
git fetch origin

# Checkout the PR branch
git checkout copilot/achieve-quantum-teleportation

# Merge main with "ours" strategy (prefer PR branch)
git merge origin/main --allow-unrelated-histories -X ours --no-edit

# Push the resolution
git push origin copilot/achieve-quantum-teleportation
```

## Why "ours" Strategy?

The `ours` strategy is correct for this PR because:

1. **New Features**: The PR adds quantum teleportation features (4 new JS files, 2 HTML demos, 3 docs)
2. **Project Count**: PR has 531 projects vs main's 529 (2 new quantum projects)
3. **Timestamp**: PR files are newer (2026-02-09T18:02 vs 2026-02-09T03:29)
4. **No Removals**: The PR doesn't remove any existing functionality
5. **Enhancement Only**: All changes are additive

## Files That Will Be Resolved

11 files have conflicts that will be resolved:

- ✅ IMPLEMENTATION_COMPLETE.md
- ✅ JeZues.html
- ✅ Leah.html
- ✅ README.md
- ✅ _config.yml
- ✅ agent-management-dashboard.html
- ✅ merlin-hive-integration.js
- ✅ merlin-unified-dashboard.html
- ✅ organized-projects-hub.html
- ✅ projects.json (529 → 531 projects)
- ✅ zMerlinHive.html

## Verification After Fix

After the conflicts are resolved, verify:

```bash
# Check that quantum files exist
ls -la src/utils/quantum-*.js
ls -la quantum-*.html

# Verify projects.json has correct count
cat projects.json | jq '.meta.total_projects'
# Should be 531 or higher

# Check no errors in git status
git status
# Should show "nothing to commit, working tree clean"
```

## Expected Outcome

After running the fix:
- ✅ All 11 conflicts resolved
- ✅ Quantum teleportation features preserved
- ✅ Main branch updates integrated where compatible
- ✅ PR becomes mergeable on GitHub
- ✅ No features lost from either branch

## Next Steps After Fix

1. **Review the PR**: Check that all quantum files are present
2. **Test locally**: Run any tests or linters
3. **Merge PR**: The PR can now be merged via GitHub UI

## Troubleshooting

### "Authentication failed" error
**Solution**: You need push permissions to the repository. Use the GitHub Actions workflow instead.

### "refusing to merge unrelated histories"
**Solution**: The `--allow-unrelated-histories` flag is required and should be in the commands above.

### Files are missing after merge
**Solution**: Wrong strategy was used. The PR branch must be preferred (use "ours").

### Other PRs need fixing too
**Solution**: Use the same workflow with different PR numbers. See [README_MERGE_CONFLICT_FIXES.md](./README_MERGE_CONFLICT_FIXES.md) for details.

## Documentation

- [Complete Fix Guide](./README_MERGE_CONFLICT_FIXES.md)
- [Auto Conflict Resolution Guide](../workflows/AUTO_CONFLICT_RESOLUTION_GUIDE.md)
- [GitHub Actions Workflow](../workflows/fix-pr-conflicts.yml)

## Support

Questions? Check:
1. Repository maintainers
2. [GitHub Discussions](../../discussions)
3. Create an issue with `merge-conflict` label
