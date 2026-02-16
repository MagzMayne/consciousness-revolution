#!/bin/bash

# Trigger Auto-Sync for All Open PRs
# This script manually triggers the auto-sync workflow to sync all open PR branches with main

set -e

echo "=========================================="
echo "  Trigger Auto-Sync for All Open PRs"
echo "=========================================="
echo ""

# Check for GitHub CLI
if ! command -v gh &> /dev/null; then
    echo "❌ Error: GitHub CLI (gh) is not installed"
    echo "   Install it from: https://cli.github.com/"
    exit 1
fi

# Check authentication
if ! gh auth status &> /dev/null; then
    echo "❌ Error: Not authenticated with GitHub CLI"
    echo "   Run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI authenticated"
echo ""

# Get repository info
REPO_OWNER=$(gh repo view --json owner -q .owner.login)
REPO_NAME=$(gh repo view --json name -q .name)
BASE_BRANCH=${BASE_BRANCH:-main}

echo "Repository: $REPO_OWNER/$REPO_NAME"
echo "Base Branch: $BASE_BRANCH"
echo ""

# Confirmation
read -p "This will trigger auto-sync for all copilot/* branches. Continue? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted"
    exit 0
fi

echo ""
echo "🔄 Triggering auto-sync-branches workflow..."
echo ""

# Trigger the workflow
gh workflow run auto-sync-branches.yml \
    --field branch_pattern="copilot/*" \
    --field base_branch="$BASE_BRANCH" \
    --field dry_run="false"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Auto-sync workflow triggered successfully!"
    echo ""
    echo "📊 Monitor progress:"
    echo "   gh run list --workflow=auto-sync-branches.yml"
    echo ""
    echo "📝 View logs:"
    echo "   gh run view --web"
    echo ""
else
    echo ""
    echo "❌ Failed to trigger workflow"
    exit 1
fi
