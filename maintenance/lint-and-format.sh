#!/usr/bin/env bash
# maintenance/lint-and-format.sh
#
# Purpose: Run available linters and format checks across the codebase.
#          Checks JavaScript files for common issues, validates JSON files,
#          and reports problems without auto-fixing (unless --fix is passed).
#
# Usage:
#   ./maintenance/lint-and-format.sh          # Check only (safe, no changes)
#   ./maintenance/lint-and-format.sh --fix    # Auto-fix where possible
#
# Part of the Consciousness Revolution TOTALITY PROTOCOL — Section 9: Self-Healing

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPORT_DIR="${REPO_ROOT}/maintenance/reports"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
MODE="${1:-}"
ISSUES=0

mkdir -p "$REPORT_DIR"

echo "========================================================"
echo "  🧹 Consciousness Revolution — Lint & Format Check"
echo "  Mode: ${MODE:-check-only}  |  $(date)"
echo "========================================================"
echo ""

cd "$REPO_ROOT"

# ── 1. Validate JSON files ────────────────────────────────────────────────────
echo "📋 Validating JSON files..."
JSON_ERRORS=0
while IFS= read -r -d '' file; do
  # Skip node_modules, .git, dist
  if echo "$file" | grep -qE '(node_modules|\.git/|dist/)'; then
    continue
  fi
  if ! python3 -m json.tool "$file" > /dev/null 2>&1; then
    echo "  ❌ Invalid JSON: ${file#$REPO_ROOT/}"
    JSON_ERRORS=$((JSON_ERRORS + 1))
    ISSUES=$((ISSUES + 1))
  fi
done < <(find "$REPO_ROOT" -name "*.json" -not -path "*/node_modules/*" -not -path "*/.git/*" -print0 2>/dev/null)

if [ "$JSON_ERRORS" -eq 0 ]; then
  echo "  ✅ All JSON files are valid."
else
  echo "  ⚠️  ${JSON_ERRORS} JSON file(s) have syntax errors. Fix them before committing."
fi
echo ""

# ── 2. Check for exposed secrets patterns ────────────────────────────────────
echo "🔒 Scanning for potential exposed secrets..."
SECRET_PATTERNS=(
  'sk_live_[A-Za-z0-9]+'         # Stripe live secret key
  'sk-[A-Za-z0-9]{20,}'          # OpenAI API key style
  'gsk_[A-Za-z0-9]+'             # Groq API key
  'ghp_[A-Za-z0-9]+'             # GitHub personal access token
  'AAAA[A-Za-z0-9+/]{300,}'      # Firebase service account
  'AIzaSy[A-Za-z0-9-_]{33}'      # Google API key
  'PRIVATE KEY'                    # Any private key block
)

SECRET_HITS=0
for pattern in "${SECRET_PATTERNS[@]}"; do
  while IFS= read -r hit; do
    if [ -n "$hit" ]; then
      echo "  🚨 Possible secret found: ${hit}"
      SECRET_HITS=$((SECRET_HITS + 1))
      ISSUES=$((ISSUES + 1))
    fi
  done < <(grep -rn --include="*.js" --include="*.html" --include="*.py" \
    --exclude-dir=node_modules --exclude-dir=.git \
    -E "$pattern" "$REPO_ROOT" 2>/dev/null | grep -v "\.env\.example" | head -5 || true)
done

if [ "$SECRET_HITS" -eq 0 ]; then
  echo "  ✅ No obvious secret patterns detected."
else
  echo "  🚨 ${SECRET_HITS} potential secret(s) found! Remove them immediately."
  echo "  See SECURITY.md for the incident response procedure."
fi
echo ""

# ── 3. Check for console.log of token/key/secret variables ───────────────────
echo "🔍 Checking for insecure secret logging..."
LOG_HITS=0
while IFS= read -r hit; do
  if [ -n "$hit" ]; then
    echo "  ⚠️  Possible secret in log: ${hit}"
    LOG_HITS=$((LOG_HITS + 1))
    ISSUES=$((ISSUES + 1))
  fi
done < <(grep -rn --include="*.js" \
  --exclude-dir=node_modules --exclude-dir=.git \
  -E "console\.log\(.*\b(token|secret|key|password|apiKey)\b" "$REPO_ROOT" 2>/dev/null | head -10 || true)

if [ "$LOG_HITS" -eq 0 ]; then
  echo "  ✅ No secret logging patterns detected."
fi
echo ""

# ── 4. Run ESLint if available ────────────────────────────────────────────────
echo "📝 Checking JavaScript (ESLint)..."
if command -v npx &>/dev/null && npx --no-install eslint --version &>/dev/null 2>&1; then
  ESLINT_REPORT="${REPORT_DIR}/eslint-${TIMESTAMP}.txt"
  if [ "$MODE" = "--fix" ]; then
    npx eslint --ext .js . --ignore-path .gitignore --fix 2>&1 | tee "$ESLINT_REPORT" || true
  else
    npx eslint --ext .js . --ignore-path .gitignore 2>&1 | tee "$ESLINT_REPORT" || true
  fi
  # Count lines matching ESLint's error format: "  N:N  error  <message>"
  ESLINT_ERRORS=$(grep -cE "^\s+[0-9]+:[0-9]+\s+error\s" "$ESLINT_REPORT" 2>/dev/null || echo 0)
  if [ "$ESLINT_ERRORS" -gt 0 ]; then
    ISSUES=$((ISSUES + ESLINT_ERRORS))
  fi
else
  echo "  ℹ️  ESLint not installed. Skipping JS linting."
  echo "     Install with: npm install --save-dev eslint"
fi
echo ""

# ── 5. Check HTML files for critical missing elements ────────────────────────
echo "🌐 Spot-checking HTML files for critical attributes..."
HTML_ISSUES=0
CHECKED=0

while IFS= read -r -d '' file; do
  CHECKED=$((CHECKED + 1))
  basename=$(basename "$file")

  # Check viewport meta tag
  if ! grep -q 'name="viewport"' "$file" 2>/dev/null; then
    echo "  ⚠️  Missing viewport meta: ${basename}"
    HTML_ISSUES=$((HTML_ISSUES + 1))
    ISSUES=$((ISSUES + 1))
  fi

  # Check charset
  if ! grep -qi 'charset' "$file" 2>/dev/null; then
    echo "  ⚠️  Missing charset declaration: ${basename}"
    HTML_ISSUES=$((HTML_ISSUES + 1))
    ISSUES=$((ISSUES + 1))
  fi
done < <(find "$REPO_ROOT" -maxdepth 1 -name "*.html" -print0 2>/dev/null)

if [ "$HTML_ISSUES" -eq 0 ]; then
  echo "  ✅ ${CHECKED} HTML files checked — all have viewport and charset."
else
  echo "  ⚠️  ${HTML_ISSUES} HTML issue(s) found across ${CHECKED} files."
fi
echo ""

# ── 6. Summary ───────────────────────────────────────────────────────────────
echo "========================================================"
if [ "$ISSUES" -eq 0 ]; then
  echo "  ✅ All checks passed — no issues found!"
else
  echo "  ⚠️  ${ISSUES} total issue(s) found across all checks."
  echo "     Review the output above and fix before committing."
fi
echo "  Reports saved to: maintenance/reports/"
echo "========================================================"

# Exit with non-zero if issues found (useful for CI)
[ "$ISSUES" -eq 0 ]
