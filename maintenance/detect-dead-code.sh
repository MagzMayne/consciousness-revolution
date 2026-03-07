#!/usr/bin/env bash
# maintenance/detect-dead-code.sh
#
# Purpose: Find files that are not referenced by any other file in the repository.
#          Helps identify orphaned scripts, unused HTML pages, and stale configurations
#          that can be safely archived or deleted.
#
# Usage:
#   ./maintenance/detect-dead-code.sh              # Full scan
#   ./maintenance/detect-dead-code.sh --html-only  # HTML files only
#   ./maintenance/detect-dead-code.sh --js-only    # JavaScript files only
#
# NOTE: This script produces a REPORT. It does NOT delete anything automatically.
#       Review the report and decide what to archive vs keep.
#
# Part of the Consciousness Revolution TOTALITY PROTOCOL — Section 9: Self-Healing

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPORT_DIR="${REPO_ROOT}/maintenance/reports"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="${REPORT_DIR}/dead-code-${TIMESTAMP}.txt"
MODE="${1:-}"

mkdir -p "$REPORT_DIR"

echo "========================================================"
echo "  🗑️  Consciousness Revolution — Dead Code Detection"
echo "  Mode: ${MODE:-full-scan}  |  $(date)"
echo "========================================================"
echo ""
echo "This scan identifies files with NO inbound references."
echo "Files may still be valid entry points — review before archiving."
echo ""

cd "$REPO_ROOT"

# Use ripgrep if available for faster searches; fall back to grep
if command -v rg &>/dev/null; then
  SEARCH_CMD="rg"
else
  SEARCH_CMD="grep"
fi

# Helper: check if a filename is referenced anywhere in the repo
is_referenced() {
  local filename="$1"
  local base
  base=$(basename "$filename")
  # Search in HTML, JS, JSON, MD, Python, and shell files
  if [ "$SEARCH_CMD" = "rg" ]; then
    if rg --no-heading -l --glob "*.{html,js,json,md,py,sh}" \
        --glob "!node_modules/**" --glob "!.git/**" \
        -- "$base" "$REPO_ROOT" 2>/dev/null | grep -v "$filename" | head -1 | grep -q .; then
      return 0
    fi
  else
    if grep -rl --include="*.html" --include="*.js" --include="*.json" \
        --include="*.md" --include="*.py" --include="*.sh" \
        --exclude-dir=node_modules --exclude-dir=.git \
        -- "$base" "$REPO_ROOT" 2>/dev/null | grep -v "$filename" | head -1 | grep -q .; then
      return 0
    fi
  fi
  return 1  # not referenced
}

UNREFERENCED_HTML=()
UNREFERENCED_JS=()
UNREFERENCED_PY=()

# ── 1. Scan HTML files ────────────────────────────────────────────────────────
if [ "$MODE" != "--js-only" ]; then
  echo "🌐 Scanning HTML files..."
  HTML_TOTAL=0
  HTML_ORPHAN=0

  while IFS= read -r -d '' file; do
    HTML_TOTAL=$((HTML_TOTAL + 1))
    base=$(basename "$file")

    # Skip known entry-point files (always legitimate)
    case "$base" in
      index.html|index-new.html|404.html|start.html|login.html|signup.html) continue ;;
    esac

    if ! is_referenced "$file"; then
      UNREFERENCED_HTML+=("${file#$REPO_ROOT/}")
      HTML_ORPHAN=$((HTML_ORPHAN + 1))
    fi
  done < <(find "$REPO_ROOT" -maxdepth 1 -name "*.html" -print0 2>/dev/null)

  echo "  Scanned: ${HTML_TOTAL} files | Unreferenced: ${HTML_ORPHAN}"
  echo ""
fi

# ── 2. Scan root-level JavaScript files ──────────────────────────────────────
if [ "$MODE" != "--html-only" ]; then
  echo "📜 Scanning JavaScript files..."
  JS_TOTAL=0
  JS_ORPHAN=0

  while IFS= read -r -d '' file; do
    JS_TOTAL=$((JS_TOTAL + 1))
    base=$(basename "$file")

    # Skip known infrastructure files
    case "$base" in
      server.js|service-worker.js|sw.js|script.js|main.js) continue ;;
    esac

    if ! is_referenced "$file"; then
      UNREFERENCED_JS+=("${file#$REPO_ROOT/}")
      JS_ORPHAN=$((JS_ORPHAN + 1))
    fi
  done < <(find "$REPO_ROOT" -maxdepth 1 -name "*.js" -print0 2>/dev/null)

  echo "  Scanned: ${JS_TOTAL} files | Unreferenced: ${JS_ORPHAN}"
  echo ""

  # ── 3. Scan Python scripts ────────────────────────────────────────────────
  echo "🐍 Scanning Python scripts..."
  PY_TOTAL=0
  PY_ORPHAN=0

  while IFS= read -r -d '' file; do
    PY_TOTAL=$((PY_TOTAL + 1))

    if ! is_referenced "$file"; then
      UNREFERENCED_PY+=("${file#$REPO_ROOT/}")
      PY_ORPHAN=$((PY_ORPHAN + 1))
    fi
  done < <(find "$REPO_ROOT" -maxdepth 1 -name "*.py" -print0 2>/dev/null)

  echo "  Scanned: ${PY_TOTAL} files | Unreferenced: ${PY_ORPHAN}"
  echo ""
fi

# ── 4. Write report ──────────────────────────────────────────────────────────
{
  echo "# Dead Code Detection Report"
  echo "# Generated: $(date)"
  echo "# Repository: ${REPO_ROOT}"
  echo ""

  if [ ${#UNREFERENCED_HTML[@]} -gt 0 ]; then
    echo "## Unreferenced HTML Files (${#UNREFERENCED_HTML[@]})"
    echo "# These pages have no inbound links. They may be:"
    echo "#   - Standalone entry points (valid — keep)"
    echo "#   - Abandoned experiments (archive to .archive/)"
    echo "#   - Renamed duplicates (investigate)"
    echo ""
    for f in "${UNREFERENCED_HTML[@]}"; do echo "$f"; done
    echo ""
  fi

  if [ ${#UNREFERENCED_JS[@]} -gt 0 ]; then
    echo "## Unreferenced JavaScript Files (${#UNREFERENCED_JS[@]})"
    echo ""
    for f in "${UNREFERENCED_JS[@]}"; do echo "$f"; done
    echo ""
  fi

  if [ ${#UNREFERENCED_PY[@]} -gt 0 ]; then
    echo "## Unreferenced Python Scripts (${#UNREFERENCED_PY[@]})"
    echo ""
    for f in "${UNREFERENCED_PY[@]}"; do echo "$f"; done
    echo ""
  fi
} > "$REPORT_FILE"

echo "========================================================"
TOTAL_ORPHAN=$(( ${#UNREFERENCED_HTML[@]} + ${#UNREFERENCED_JS[@]} + ${#UNREFERENCED_PY[@]} ))
echo "  📊 Summary: ${TOTAL_ORPHAN} potentially unreferenced file(s) found."
echo "  📄 Full report: ${REPORT_FILE#$REPO_ROOT/}"
echo ""
echo "  Next steps:"
echo "   1. Review the report."
echo "   2. Archive experiments: mv <file> .archive/"
echo "   3. Delete confirmed dead code: git rm <file>"
echo "   4. Keep standalone entry points as-is."
echo "========================================================"
