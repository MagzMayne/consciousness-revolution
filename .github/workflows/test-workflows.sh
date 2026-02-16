#!/bin/bash
# Test script to validate GitHub Actions workflows

set -e

echo "🧪 Testing GitHub Actions Workflows"
echo "===================================="
echo ""

# Check if workflows directory exists
if [ ! -d ".github/workflows" ]; then
    echo "❌ .github/workflows directory not found"
    exit 1
fi
echo "✅ .github/workflows directory exists"

# Check if workflow files exist
if [ ! -f ".github/workflows/auto-review-pr.yml" ]; then
    echo "❌ auto-review-pr.yml not found"
    exit 1
fi
echo "✅ auto-review-pr.yml exists"

if [ ! -f ".github/workflows/review-pending-prs.yml" ]; then
    echo "❌ review-pending-prs.yml not found"
    exit 1
fi
echo "✅ review-pending-prs.yml exists"

if [ ! -f ".github/workflows/conflict-detection-handler.yml" ]; then
    echo "❌ conflict-detection-handler.yml not found"
    exit 1
fi
echo "✅ conflict-detection-handler.yml exists"

# Validate YAML syntax using Python
echo ""
echo "🔍 Validating YAML syntax..."

python3 << 'PYEOF'
import yaml
import sys

files = [
    '.github/workflows/auto-review-pr.yml',
    '.github/workflows/review-pending-prs.yml',
    '.github/workflows/conflict-detection-handler.yml'
]

errors = []

for filepath in files:
    try:
        with open(filepath, 'r') as f:
            data = yaml.safe_load(f)
            
        # Check required fields
        if 'name' not in data:
            errors.append(f"{filepath}: Missing 'name' field")
        # Note: 'on' is parsed as True by YAML parser (boolean keyword)
        if True not in data and 'on' not in data:
            errors.append(f"{filepath}: Missing 'on' field")
        if 'jobs' not in data:
            errors.append(f"{filepath}: Missing 'jobs' field")
            
        print(f"✅ {filepath}: Valid YAML with required fields")
        
    except yaml.YAMLError as e:
        errors.append(f"{filepath}: YAML parsing error: {e}")
    except Exception as e:
        errors.append(f"{filepath}: Error: {e}")

if errors:
    print("\n❌ Errors found:")
    for error in errors:
        print(f"  - {error}")
    sys.exit(1)

print("\n✅ All workflow files are valid!")
PYEOF

# Check documentation files
echo ""
echo "📚 Checking documentation..."

if [ ! -f ".github/workflows/README.md" ]; then
    echo "❌ README.md not found"
    exit 1
fi
echo "✅ README.md exists"

if [ ! -f ".github/workflows/CONFLICT_RESOLUTION_GUIDE.md" ]; then
    echo "❌ CONFLICT_RESOLUTION_GUIDE.md not found"
    exit 1
fi
echo "✅ CONFLICT_RESOLUTION_GUIDE.md exists"

if [ ! -f ".github/workflows/CONFLICT_QUICK_REFERENCE.md" ]; then
    echo "❌ CONFLICT_QUICK_REFERENCE.md not found"
    exit 1
fi
echo "✅ CONFLICT_QUICK_REFERENCE.md exists"

echo ""
echo "🎉 All tests passed!"
echo ""
echo "Workflow Summary:"
echo "  - Auto Review and Merge PRs"
echo "  - Review Pending PRs"
echo "  - Conflict Detection & Error Handling (NEW)"
echo ""
echo "Next steps:"
echo "1. Push these workflows to GitHub"
echo "2. Create a test PR to verify auto-review functionality"
echo "3. Test conflict detection by creating a PR with conflicts"
echo "4. Check GitHub Actions tab to see workflow runs"
echo ""
