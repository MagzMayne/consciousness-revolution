#!/usr/bin/env bash
# =============================================================================
# Cross-Repo Sync Script — consciousness-revolution ↔ barbrickdesign.github.io
# =============================================================================
#
# PURPOSE
#   Bidirectional, additive-only sync between this repo and
#   barbrickdesign/barbrickdesign.github.io.
#
#   Direction A — "pull"  : barbrickdesign.github.io → consciousness-revolution
#   Direction B — "push"  : consciousness-revolution → barbrickdesign.github.io
#   Default      — "both" : runs pull then push
#
#   The `shared/` directory holds components that both repos own together.
#   If it already contains a `.git` file it is treated as a submodule;
#   otherwise this script manages a bare clone in `.git/tmp/barbrickdesign`.
#
# PHILOSOPHY
#   ADDITIVE ONLY — files are added or updated, never deleted.
#
# USAGE
#   ./scripts/sync.sh [pull|push|both] [--dry-run]
#
# REQUIREMENTS
#   • git
#   • bash 4+
#   • (push only) BARBRICKDESIGN_TOKEN env var — PAT with `contents: write`
#     on barbrickdesign/barbrickdesign.github.io
#
# DEVELOPER ONBOARDING
#   First time:
#     1. git clone https://github.com/overkor-tek/consciousness-revolution
#     2. cd consciousness-revolution
#     3. npm install
#     4. ./scripts/sync.sh pull         # bring in latest shared content
#
#   To push shared assets back to barbrickdesign:
#     export BARBRICKDESIGN_TOKEN=<your-PAT>
#     ./scripts/sync.sh push
# =============================================================================

set -eo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BD_REMOTE="https://github.com/barbrickdesign/barbrickdesign.github.io.git"
BD_CLONE_DIR="${REPO_ROOT}/.git/tmp/barbrickdesign"
SHARED_DIR="${REPO_ROOT}/shared"

# Directories that are mirrored between repos (additive, never deleted)
SYNC_DIRS=(
  "css"
  "js"
  "components"
  "shared"
)

# File extensions allowed for sync
SYNC_EXTS=".html .css .js .json .md .txt .svg .png .jpg .jpeg .gif .webp .woff .woff2 .ttf"

# Paths to skip when reading from barbrickdesign
SKIP_PREFIXES=(
  "node_modules"
  ".git"
  ".github"
  "backend"
  "netlify"
)

SKIP_FILES=(
  "package.json"
  "package-lock.json"
  "netlify.toml"
  "railway.toml"
  ".gitignore"
  "CNAME"
  "robots.txt"
)

# ── Colours ───────────────────────────────────────────────────────────────────
C_RESET='\033[0m'
C_GREEN='\033[32m'
C_YELLOW='\033[33m'
C_RED='\033[31m'
C_CYAN='\033[36m'
C_DIM='\033[2m'

info()    { echo -e "${C_CYAN}ℹ  $*${C_RESET}"; }
success() { echo -e "${C_GREEN}✅ $*${C_RESET}"; }
warn()    { echo -e "${C_YELLOW}⚠️  $*${C_RESET}"; }
err()     { echo -e "${C_RED}❌ $*${C_RESET}" >&2; }
dim()     { echo -e "${C_DIM}   $*${C_RESET}"; }

# ── Argument parsing ──────────────────────────────────────────────────────────
DIRECTION="${1:-both}"
DRY_RUN=false

for arg in "${@:-}"; do
  [[ -z "$arg" ]] && continue
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    pull|push|both) DIRECTION="$arg" ;;
  esac
done

if $DRY_RUN; then
  warn "DRY-RUN MODE — no files will be written or committed"
fi

# ── Helpers ───────────────────────────────────────────────────────────────────

# Returns true if a filename should be skipped
should_skip_file() {
  local file="$1"
  local base
  base="$(basename "$file")"

  # Skip by filename
  for skip in "${SKIP_FILES[@]}"; do
    [[ "$base" == "$skip" ]] && return 0
  done

  # Skip by prefix
  for prefix in "${SKIP_PREFIXES[@]}"; do
    [[ "$file" == ${prefix}* ]] && return 0
  done

  # Only sync allowed extensions
  local ext=""
  if [[ "$file" == *.* ]]; then
    ext=".${file##*.}"
  fi
  # shellcheck disable=SC2076
  [[ -n "$ext" ]] && [[ " ${SYNC_EXTS} " =~ " ${ext} " ]] || return 0

  return 1  # do not skip
}

# Copy $1 → $2 if $2 does not already exist (additive only)
copy_if_new() {
  local src="$1"
  local dst="$2"

  if [[ -f "$dst" ]]; then
    dim "already exists — skip: $(basename "$dst")"
    return 0
  fi

  if $DRY_RUN; then
    dim "[dry-run] would add: $dst"
    return 0
  fi

  mkdir -p "$(dirname "$dst")"
  cp "$src" "$dst"
  success "added: ${dst#"${REPO_ROOT}/"}"
}

# ── Clone / update barbrickdesign repo ───────────────────────────────────────
ensure_barbrickdesign_clone() {
  # Check if shared/ is a git submodule first
  if [[ -f "${SHARED_DIR}/.git" || -d "${SHARED_DIR}/.git" ]]; then
    info "shared/ is a git submodule — updating…"
    if ! $DRY_RUN; then
      pull_err=""
      if ! pull_err=$(git -C "${SHARED_DIR}" pull --ff-only origin main 2>&1); then
        if ! pull_err=$(git -C "${SHARED_DIR}" pull --ff-only origin master 2>&1); then
          warn "submodule pull failed — using existing content"
          warn "  reason: ${pull_err:-unknown}"
        fi
      fi
    fi
    BD_CLONE_DIR="${SHARED_DIR}"
    return
  fi

  # Otherwise use a bare working-copy in .git/tmp
  if [[ -d "${BD_CLONE_DIR}/.git" ]]; then
    info "Updating local barbrickdesign clone…"
    git -C "${BD_CLONE_DIR}" pull --ff-only origin main 2>/dev/null \
      || git -C "${BD_CLONE_DIR}" pull --ff-only origin master 2>/dev/null \
      || warn "pull failed — proceeding with cached clone"
  else
    info "Cloning barbrickdesign.github.io (shallow)…"
    mkdir -p "$(dirname "${BD_CLONE_DIR}")"
    # Use GITHUB_TOKEN or BARBRICKDESIGN_TOKEN in the URL when available (for CI / private repos)
    local clone_url="${BD_REMOTE}"
    if [[ -n "${GITHUB_TOKEN:-}" ]]; then
      clone_url="https://x-access-token:${GITHUB_TOKEN}@github.com/barbrickdesign/barbrickdesign.github.io.git"
    elif [[ -n "${BARBRICKDESIGN_TOKEN:-}" ]]; then
      clone_url="https://x-access-token:${BARBRICKDESIGN_TOKEN}@github.com/barbrickdesign/barbrickdesign.github.io.git"
    fi
    git clone --depth 1 "${clone_url}" "${BD_CLONE_DIR}"
  fi
}

# ── Setup git submodule (optional, one-time) ─────────────────────────────────
setup_submodule() {
  if [[ -f "${REPO_ROOT}/.gitmodules" ]] && grep -q "barbrickdesign" "${REPO_ROOT}/.gitmodules" 2>/dev/null; then
    info "Submodule already registered in .gitmodules"
    git -C "${REPO_ROOT}" submodule update --init --remote shared 2>/dev/null || true
    return
  fi

  warn "Submodule not initialised. To add the submodule run:"
  echo ""
  echo "  git submodule add ${BD_REMOTE} shared"
  echo "  git submodule update --init --recursive"
  echo ""
  echo "Then re-run this script. Falling back to shallow clone for now."
}

# ── PULL: barbrickdesign → consciousness-revolution ──────────────────────────
pull_from_barbrickdesign() {
  info "=== PULL: barbrickdesign.github.io → consciousness-revolution ==="

  ensure_barbrickdesign_clone

  local added=0 skipped=0

  for dir in "${SYNC_DIRS[@]}"; do
    local src_dir="${BD_CLONE_DIR}/${dir}"
    local dst_dir="${REPO_ROOT}/${dir}"

    [[ -d "$src_dir" ]] || continue

    info "Syncing ${dir}/…"

    while IFS= read -r -d '' src_file; do
      local rel="${src_file#"${src_dir}/"}"

      should_skip_file "$rel" && { (( skipped++ )) || true; continue; }

      local dst_file="${dst_dir}/${rel}"

      if [[ -f "$dst_file" ]]; then
        (( skipped++ )) || true
        dim "already exists — skip: ${dir}/${rel}"
      else
        copy_if_new "$src_file" "$dst_file"
        (( added++ )) || true
      fi
    done < <(find "$src_dir" -type f -print0)
  done

  success "Pull complete — added: ${added}, already present: ${skipped}"
}

# ── PUSH: consciousness-revolution → barbrickdesign ──────────────────────────
push_to_barbrickdesign() {
  info "=== PUSH: consciousness-revolution → barbrickdesign.github.io ==="

  if [[ -z "${BARBRICKDESIGN_TOKEN:-}" ]]; then
    err "BARBRICKDESIGN_TOKEN is not set."
    err "Export a PAT with 'contents: write' on barbrickdesign/barbrickdesign.github.io."
    err "  export BARBRICKDESIGN_TOKEN=ghp_..."
    err "Skipping push."
    return 1
  fi

  # Use the Node.js cross-repo sync for the API-based push
  if [[ -f "${REPO_ROOT}/scripts/cross-repo-sync.js" ]]; then
    info "Delegating push to scripts/cross-repo-sync.js…"
    local flags=""
    $DRY_RUN && flags="--dry-run"
    BARBRICKDESIGN_TOKEN="${BARBRICKDESIGN_TOKEN}" \
      node "${REPO_ROOT}/scripts/cross-repo-sync.js" --direction push ${flags}
  else
    err "scripts/cross-repo-sync.js not found — push skipped."
    return 1
  fi
}

# ── Main ──────────────────────────────────────────────────────────────────────
main() {
  echo ""
  echo "╔══════════════════════════════════════════════════════════╗"
  echo "║  Cross-Repo Sync — consciousness-revolution ↔ BarbrickD ║"
  echo "╚══════════════════════════════════════════════════════════╝"
  echo ""

  case "$DIRECTION" in
    pull)
      pull_from_barbrickdesign
      ;;
    push)
      push_to_barbrickdesign
      ;;
    both)
      pull_from_barbrickdesign
      echo ""
      push_to_barbrickdesign || warn "Push skipped (token missing?) — pull still succeeded."
      ;;
    *)
      err "Unknown direction: $DIRECTION  (use: pull | push | both)"
      exit 1
      ;;
  esac

  echo ""
  success "Sync finished."
}

main "$@"
