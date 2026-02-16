# Merge Conflict Resolution Scripts

This directory contains scripts to automatically fix merge conflicts in pull requests that are unable to merge.

## Overview

Several PRs in the repository have merge conflicts preventing them from being merged. These scripts provide automated solutions to resolve these conflicts.

## Fixed PRs

### PR #1675 - Quantum Teleportation System

**Branch**: `copilot/achieve-quantum-teleportation`  
**Conflicts**: 11 files with unrelated history conflicts  
**Resolution Strategy**: Use "ours" strategy to prefer PR branch changes (quantum features)  
**Script**: `fix-pr-1675-conflicts.sh`

#### Files with Conflicts:
- IMPLEMENTATION_COMPLETE.md
- JeZues.html
- Leah.html
- README.md
- _config.yml
- agent-management-dashboard.html
- merlin-hive-integration.js
- merlin-unified-dashboard.html
- organized-projects-hub.html
- projects.json
- zMerlinHive.html

#### Resolution Details:

The conflicts arise because the PR branch added comprehensive quantum teleportation features including:
- 4 new JavaScript modules (quantum-teleportation.js, quantum-messenger.js, quantum-blockchain.js, quantum-ai.js)
- 2 new HTML demo pages (quantum-teleportation-demo.html, quantum-entanglement-viz.html)
- 3 documentation files (QUANTUM_FEATURES_README.md, QUANTUM_INTEGRATION_GUIDE.md, QUANTUM_IMPLEMENTATION_SUMMARY.md)
- Updates to projects.json (529 → 531 projects)

**Why "ours" strategy works**:
1. The PR branch contains all the new quantum features
2. Main branch updates are mostly minor documentation changes
3. projects.json in PR branch is newer (2026-02-09T18:02) vs main (2026-02-09T03:29)
4. The PR is an enhancement that doesn't remove existing functionality

#### How to Use:

```bash
cd /path/to/repository
./.github/scripts/fix-pr-1675-conflicts.sh
```

After running the script:
1. The conflicts will be resolved automatically
2. A merge commit will be created
3. Push the changes to complete the fix

#### Manual Verification Steps:

After running the script, verify:
1. ✅ All quantum files are present in the merged result
2. ✅ projects.json shows 531 projects (or more if main has newer data)
3. ✅ No quantum features were lost
4. ✅ Main branch improvements were integrated where possible

## General Conflict Resolution Strategy

For future PRs with conflicts, follow this decision tree:

### 1. Identify Conflict Type

**Unrelated Histories** (like PR #1675):
- Use `--allow-unrelated-histories`
- Prefer branch with more complete features

**Content Conflicts**:
- Analyze each file individually
- Merge changes where possible
- Document resolution decisions

**JSON/Data Files**:
- Prefer newer timestamp
- Merge unique entries
- Validate JSON structure after merge

### 2. Choose Resolution Strategy

**Use "ours" strategy when**:
- PR branch is adding new features
- Main branch has only minor updates
- Lock files or generated files conflict
- PR branch is more recent

**Use "theirs" strategy when**:
- Main branch has critical fixes
- PR branch is outdated
- Security updates in main

**Manual merge when**:
- Both branches have important changes
- Complex logic conflicts
- Critical files (package.json, security configs)

### 3. Verification Steps

After any conflict resolution:
1. ✅ Run linters/formatters
2. ✅ Run test suite
3. ✅ Build the project
4. ✅ Verify no features were lost
5. ✅ Check all files mentioned in PR are present
6. ✅ Review the diff manually

## Creating New Fix Scripts

To create a fix script for another PR:

1. **Analyze the conflicts**:
```bash
git checkout <pr-branch>
git fetch origin main
git merge origin/main --no-commit --no-ff --allow-unrelated-histories
# Review conflict files
git merge --abort
```

2. **Determine strategy**:
   - Check timestamps in conflicting files
   - Identify which branch has critical changes
   - Choose appropriate merge strategy

3. **Create script**:
```bash
#!/bin/bash
set -e

PR_BRANCH="<branch-name>"
BASE_BRANCH="main"

echo "🔧 Fixing merge conflicts for PR #<number>..."

git fetch origin
git checkout "$PR_BRANCH" || git checkout -b "$PR_BRANCH" "origin/$PR_BRANCH"

# Choose one:
# For PR branch priority:
git merge origin/main --allow-unrelated-histories -X ours --no-edit

# For main branch priority:
# git merge origin/main --allow-unrelated-histories -X theirs --no-edit

# For manual resolution:
# git merge origin/main --allow-unrelated-histories --no-commit --no-ff
# # Add manual conflict resolution here
# git commit -m "Resolve merge conflicts"

echo "✅ Conflicts resolved!"
```

4. **Test the script**:
```bash
chmod +x .github/scripts/fix-pr-<number>-conflicts.sh
./.github/scripts/fix-pr-<number>-conflicts.sh
```

5. **Document the fix** in this README

## Troubleshooting

### Script fails with "fatal: refusing to merge unrelated histories"
**Solution**: Add `--allow-unrelated-histories` flag to merge command

### Script fails with authentication error
**Solution**: The script doesn't push automatically. Run `git push origin <branch>` manually or use GitHub CLI

### Merge strategy creates broken code
**Solution**: The strategy might be wrong. Review the conflicts manually and adjust the script

### Files are missing after merge
**Solution**: The wrong strategy was used. Use "ours" if the PR branch should be preferred

## GitHub Actions Integration

These scripts can be integrated into GitHub Actions workflows for automated conflict resolution. See `.github/workflows/auto-conflict-resolver.yml` for examples.

## Support

For questions or issues with merge conflict resolution:
1. Review the conflict detection workflow logs
2. Check the AUTO_CONFLICT_RESOLUTION_GUIDE.md
3. Contact repository maintainers
4. Create an issue with the `merge-conflict` label

## Additional Resources

- [Git Merge Strategies Documentation](https://git-scm.com/docs/merge-strategies)
- [GitHub Conflict Resolution Guide](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts)
- Repository-specific: `.github/workflows/AUTO_CONFLICT_RESOLUTION_GUIDE.md`
