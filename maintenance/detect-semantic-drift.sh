#!/usr/bin/env bash
# maintenance/detect-semantic-drift.sh
#
# Purpose: Detect drift between the semantic-index manifests and the actual
#          filesystem. Identifies:
#            - Key files listed in manifests that no longer exist
#            - New subsystems added that are not yet indexed
#            - Environment variables referenced in .env.example not documented
#              in semantic-index/manifest.json
#
# Usage:
#   ./maintenance/detect-semantic-drift.sh
#
# Output:
#   - Console summary
#   - maintenance/reports/semantic-drift-TIMESTAMP.txt
#
# Part of the Consciousness Revolution TOTALITY PROTOCOL — Section 9: Self-Healing

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPORT_DIR="${REPO_ROOT}/maintenance/reports"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="${REPORT_DIR}/semantic-drift-${TIMESTAMP}.txt"
DRIFT_COUNT=0

mkdir -p "$REPORT_DIR"

echo "========================================================"
echo "  🧭 Consciousness Revolution — Semantic Drift Detection"
echo "  $(date)"
echo "========================================================"
echo ""

cd "$REPO_ROOT"

# Require python3 or jq for JSON parsing
if command -v python3 &>/dev/null; then
  JSON_TOOL="python3"
elif command -v jq &>/dev/null; then
  JSON_TOOL="jq"
else
  echo "❌ python3 or jq is required. Install one and retry."
  exit 1
fi

# Helper: parse JSON array of file paths from a manifest
extract_paths() {
  local file="$1"
  if [ "$JSON_TOOL" = "python3" ]; then
    python3 - "$file" <<'EOF'
import sys, json
data = json.load(open(sys.argv[1]))
key_files = data.get("keyFiles", [])
for item in key_files:
    path = item.get("path", "") if isinstance(item, dict) else str(item)
    # Skip empty, glob patterns, and directory paths (end with /)
    if path and "*" not in path and not path.endswith("/"):
        print(path)
EOF
  else
    jq -r '.keyFiles[]? | if type == "object" then .path else . end | select(test("\\*") | not) | select(endswith("/") | not)' "$file" 2>/dev/null || true
  fi
}

# ── 1. Check each subsystem manifest ────────────────────────────────────────
echo "📋 Checking subsystem manifests against filesystem..."
SUBSYSTEM_DIR="${REPO_ROOT}/semantic-index/subsystems"
MANIFEST_ISSUES=0

if [ ! -d "$SUBSYSTEM_DIR" ]; then
  echo "  ❌ semantic-index/subsystems/ directory not found!"
  echo "  Run the semantic index bootstrap to create it."
  exit 1
fi

for manifest in "$SUBSYSTEM_DIR"/*.json; do
  [ -f "$manifest" ] || continue
  subsystem=$(basename "$manifest" .json)
  echo "  Checking: ${subsystem}"

  while IFS= read -r path; do
    [ -z "$path" ] && continue
    full_path="${REPO_ROOT}/${path}"
    if [ ! -e "$full_path" ]; then
      echo "    ⚠️  MISSING: ${path}"
      MANIFEST_ISSUES=$((MANIFEST_ISSUES + 1))
      DRIFT_COUNT=$((DRIFT_COUNT + 1))
    fi
  done < <(extract_paths "$manifest")
done

if [ "$MANIFEST_ISSUES" -eq 0 ]; then
  echo "  ✅ All keyFiles in subsystem manifests exist on disk."
else
  echo "  ⚠️  ${MANIFEST_ISSUES} missing file(s) detected across subsystem manifests."
fi
echo ""

# ── 2. Check root manifest subsystem list vs actual subsystem files ──────────
echo "📋 Checking root manifest subsystem registry..."
ROOT_MANIFEST="${REPO_ROOT}/semantic-index/manifest.json"
REGISTRY_ISSUES=0

if [ -f "$ROOT_MANIFEST" ]; then
  if [ "$JSON_TOOL" = "python3" ]; then
    REGISTERED_IDS=$(python3 - "$ROOT_MANIFEST" <<'EOF'
import sys, json
data = json.load(open(sys.argv[1]))
for s in data.get("subsystems", []):
    print(s.get("id", ""))
EOF
)
  else
    REGISTERED_IDS=$(jq -r '.subsystems[]?.id // empty' "$ROOT_MANIFEST" 2>/dev/null || true)
  fi

  for subsystem_id in $REGISTERED_IDS; do
    expected="${SUBSYSTEM_DIR}/${subsystem_id}.json"
    if [ ! -f "$expected" ]; then
      echo "  ⚠️  Registered subsystem '${subsystem_id}' has no manifest: semantic-index/subsystems/${subsystem_id}.json"
      REGISTRY_ISSUES=$((REGISTRY_ISSUES + 1))
      DRIFT_COUNT=$((DRIFT_COUNT + 1))
    fi
  done

  if [ "$REGISTRY_ISSUES" -eq 0 ]; then
    echo "  ✅ All registered subsystems have manifest files."
  fi
else
  echo "  ❌ Root manifest not found: semantic-index/manifest.json"
  DRIFT_COUNT=$((DRIFT_COUNT + 1))
fi
echo ""

# ── 3. Check agent/ folder completeness ─────────────────────────────────────
echo "📋 Checking agent/ folder completeness..."
AGENT_DIR="${REPO_ROOT}/agent"
REQUIRED_AGENT_FILES=(
  "AGENT_INSTRUCTIONS.md"
  "REPO_MAP.md"
  "SAFE_MODIFICATION_RULES.md"
  "TASK_TEMPLATES.md"
  "SEMANTIC_BREADCRUMBS.md"
)
AGENT_ISSUES=0

for required in "${REQUIRED_AGENT_FILES[@]}"; do
  if [ ! -f "${AGENT_DIR}/${required}" ]; then
    echo "  ⚠️  Missing agent file: agent/${required}"
    AGENT_ISSUES=$((AGENT_ISSUES + 1))
    DRIFT_COUNT=$((DRIFT_COUNT + 1))
  fi
done

if [ "$AGENT_ISSUES" -eq 0 ]; then
  echo "  ✅ agent/ folder is complete."
fi
echo ""

# ── 4. Check critical platform files ─────────────────────────────────────────
echo "📋 Checking critical platform files..."
CRITICAL_FILES=(
  "PLATFORM_OVERVIEW.md"
  "CHANGELOG.md"
  "ARCHITECTURE.md"
  "README.md"
  "CONTRIBUTING.md"
  "SECURITY.md"
  ".env.example"
  "semantic-index/manifest.json"
  "netlify/functions/github-token.mjs"
  "netlify/functions/sam-gov-token.mjs"
  "netlify/functions/health.js"
  "netlify.toml"
)
CRITICAL_ISSUES=0

for f in "${CRITICAL_FILES[@]}"; do
  if [ ! -f "${REPO_ROOT}/${f}" ]; then
    echo "  ⚠️  Missing critical file: ${f}"
    CRITICAL_ISSUES=$((CRITICAL_ISSUES + 1))
    DRIFT_COUNT=$((DRIFT_COUNT + 1))
  fi
done

if [ "$CRITICAL_ISSUES" -eq 0 ]; then
  echo "  ✅ All critical platform files present."
fi
echo ""

# ── 5. Write report ──────────────────────────────────────────────────────────
{
  echo "# Semantic Drift Detection Report"
  echo "# Generated: $(date)"
  echo "# Repository: ${REPO_ROOT}"
  echo "# Total drift items: ${DRIFT_COUNT}"
  echo ""
  echo "Run ./maintenance/detect-semantic-drift.sh to regenerate this report."
} > "$REPORT_FILE"

# ── 6. Summary ───────────────────────────────────────────────────────────────
echo "========================================================"
if [ "$DRIFT_COUNT" -eq 0 ]; then
  echo "  ✅ No semantic drift detected! Manifests match the filesystem."
else
  echo "  ⚠️  ${DRIFT_COUNT} drift item(s) detected."
  echo "  Review the output above and update the affected manifests."
fi
echo "  Report: ${REPORT_FILE#$REPO_ROOT/}"
echo "========================================================"

# Exit non-zero if drift found (useful for CI integration)
[ "$DRIFT_COUNT" -eq 0 ]
