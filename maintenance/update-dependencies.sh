#!/usr/bin/env bash
# maintenance/update-dependencies.sh
#
# Purpose: Audit npm dependencies for security vulnerabilities and outdated packages.
#          Generates a report and optionally applies safe automatic fixes.
#
# Usage:
#   ./maintenance/update-dependencies.sh          # Audit only (safe, no changes)
#   ./maintenance/update-dependencies.sh --fix    # Apply safe automatic fixes
#   ./maintenance/update-dependencies.sh --full   # Apply all fixes including major upgrades (review required)
#
# Part of the Consciousness Revolution TOTALITY PROTOCOL — Section 9: Self-Healing

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPORT_DIR="${REPO_ROOT}/maintenance/reports"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="${REPORT_DIR}/dependency-audit-${TIMESTAMP}.json"
MODE="${1:-}"

mkdir -p "$REPORT_DIR"

echo "========================================================"
echo "  🔍 Consciousness Revolution — Dependency Audit"
echo "  Mode: ${MODE:-audit-only}  |  $(date)"
echo "========================================================"
echo ""

cd "$REPO_ROOT"

# ── 1. Verify Node.js and npm are available ───────────────────────────────────
if ! command -v node &>/dev/null; then
  echo "❌ Node.js not found. Install Node.js >= 16 before running this script."
  exit 1
fi
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
echo "✅ Node.js ${NODE_VERSION}  npm ${NPM_VERSION}"
echo ""

# ── 2. Run security audit ─────────────────────────────────────────────────────
echo "📦 Running npm security audit..."
npm audit --json > "$REPORT_FILE" 2>/dev/null || true

if command -v jq &>/dev/null; then
  _jq_int() { local v; v=$(jq "$1" "$REPORT_FILE" 2>/dev/null); echo "${v:-0}"; }
  CRITICAL=$(_jq_int '.metadata.vulnerabilities.critical // 0')
  HIGH=$(_jq_int '.metadata.vulnerabilities.high // 0')
  MODERATE=$(_jq_int '.metadata.vulnerabilities.moderate // 0')
  LOW=$(_jq_int '.metadata.vulnerabilities.low // 0')
  TOTAL=$(_jq_int '.metadata.vulnerabilities.total // 0')

  echo "  Critical : ${CRITICAL}"
  echo "  High     : ${HIGH}"
  echo "  Moderate : ${MODERATE}"
  echo "  Low      : ${LOW}"
  echo "  Total    : ${TOTAL}"
  echo ""

  if [ "$CRITICAL" -gt 0 ]; then
    echo "🚨 CRITICAL vulnerabilities found! Immediate action required."
    echo "   Run: npm audit fix --force (review changes carefully)"
    echo "   Or: manually update the affected package"
  elif [ "$HIGH" -gt 0 ]; then
    echo "⚠️  HIGH severity vulnerabilities found. Run --fix to auto-remediate."
  elif [ "$TOTAL" -eq 0 ]; then
    echo "✅ No known vulnerabilities found."
  else
    echo "ℹ️  ${TOTAL} low/moderate vulnerability(ies). Monitor and update when convenient."
  fi
else
  echo "ℹ️  jq not installed — raw audit output written to: ${REPORT_FILE}"
  npm audit || true
fi

echo ""

# ── 3. Check for outdated packages ───────────────────────────────────────────
echo "📋 Checking for outdated packages..."
OUTDATED_FILE="${REPORT_DIR}/outdated-${TIMESTAMP}.json"
npm outdated --json > "$OUTDATED_FILE" 2>/dev/null || true

if command -v jq &>/dev/null; then
  OUTDATED_COUNT=$(jq 'keys | length' "$OUTDATED_FILE" 2>/dev/null || echo 0)
  if [ "$OUTDATED_COUNT" -eq 0 ]; then
    echo "✅ All packages are up-to-date."
  else
    echo "📦 ${OUTDATED_COUNT} package(s) have available updates:"
    jq -r 'to_entries[] | "  \(.key): \(.value.current) → \(.value.latest)"' "$OUTDATED_FILE" 2>/dev/null || npm outdated
  fi
fi

echo ""

# ── 4. Apply fixes if requested ──────────────────────────────────────────────
if [ "$MODE" = "--fix" ]; then
  echo "🔧 Applying safe automatic fixes (non-breaking semver updates)..."
  npm audit fix
  echo "✅ Safe fixes applied. Run 'npm test' to verify nothing broke."
elif [ "$MODE" = "--full" ]; then
  echo "⚠️  Applying ALL fixes including major version upgrades..."
  echo "   This may introduce breaking changes. Review carefully after."
  npm audit fix --force
  npm update
  echo "✅ Full update applied. Run 'npm test' and check the app manually."
fi

# ── 5. Check backend dependencies ────────────────────────────────────────────
if [ -f "${REPO_ROOT}/backend/package.json" ]; then
  echo "📦 Checking backend dependencies..."
  cd "${REPO_ROOT}/backend"
  BACKEND_REPORT="${REPORT_DIR}/backend-audit-${TIMESTAMP}.json"
  npm audit --json > "$BACKEND_REPORT" 2>/dev/null || true
  if command -v jq &>/dev/null; then
    BACKEND_TOTAL=$(jq '.metadata.vulnerabilities.total // 0' "$BACKEND_REPORT" 2>/dev/null || echo 0)
    if [ "$BACKEND_TOTAL" -eq 0 ]; then
      echo "✅ Backend: no vulnerabilities."
    else
      echo "⚠️  Backend: ${BACKEND_TOTAL} vulnerability(ies) — see ${BACKEND_REPORT}"
    fi
  fi
  cd "$REPO_ROOT"
fi

echo ""
echo "========================================================"
echo "  ✅ Dependency audit complete"
echo "  Reports saved to: maintenance/reports/"
echo "========================================================"
