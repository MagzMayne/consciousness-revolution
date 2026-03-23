# Cross-Repo Sync Guide

> **consciousness-revolution ↔ barbrickdesign.github.io**
>
> Both repos share a pool of CSS, JS, and component files that enhance each other.
> This guide explains how the sync works, how to run it locally, and what new
> developers need to do on day one.

---

## Contents

1. [Philosophy](#philosophy)
2. [What gets synced](#what-gets-synced)
3. [Developer Quick-Start](#developer-quick-start)
4. [Running the sync locally](#running-the-sync-locally)
5. [GitHub Actions automation](#github-actions-automation)
6. [Secret configuration](#secret-configuration)
7. [Submodule option](#submodule-option-advanced)
8. [Troubleshooting](#troubleshooting)
9. [Architecture decisions](#architecture-decisions)

---

## Philosophy

> **ADDITIVE ONLY** — files flow *in* from both repos, nothing is ever deleted.

The two repos are sibling projects that share a common pool of design primitives
and utility components (`css/`, `js/`, `components/`, `shared/`).  The sync
mechanism ensures:

- A new file added to **barbrickdesign.github.io** automatically appears in
  **consciousness-revolution** within 24 hours.
- A new shared file added to **consciousness-revolution** can be pushed to
  **barbrickdesign.github.io** on demand (or automatically on push).
- Repo-specific files (`package.json`, `netlify.toml`, backend code, etc.) are
  **never** synced between repos.

---

## What gets synced

| Directory | What lives here |
|-----------|-----------------|
| `css/` | Shared stylesheets (themes, utilities, responsive helpers) |
| `js/` | Shared JavaScript modules and components |
| `components/` | Reusable HTML fragments and UI widgets |
| `shared/` | Cross-repo primitives (777 theme, dashboard core, widgets) |

**Files never synced** (repo-specific):

```
package.json  package-lock.json  netlify.toml  railway.toml
.gitignore  CNAME  robots.txt  sitemap.xml  service-worker.js
node_modules/  .git/  .github/  backend/  netlify/
```

---

## Developer Quick-Start

### First time clone

```bash
# 1. Clone consciousness-revolution
git clone https://github.com/overkor-tek/consciousness-revolution
cd consciousness-revolution

# 2. Install Node dependencies
npm install

# 3. Pull shared content from barbrickdesign.github.io
./scripts/sync.sh pull

# 4. Start the dev server
npm start
```

### Day-to-day workflow

```bash
# Pull latest shared content from barbrickdesign
./scripts/sync.sh pull

# (After adding/editing shared files)
# Push shared content back to barbrickdesign
export BARBRICKDESIGN_TOKEN=ghp_yourPAThere
./scripts/sync.sh push

# Or do both in one command
./scripts/sync.sh both
```

---

## Running the sync locally

### `scripts/sync.sh` — Shell script (git-based pull)

This script does a **shallow git clone** of `barbrickdesign/barbrickdesign.github.io`
into `.git/tmp/barbrickdesign` (hidden from git tracking) and copies any new
files into the matching local directories.

```bash
# Usage
./scripts/sync.sh [pull|push|both] [--dry-run]

# Examples
./scripts/sync.sh pull                # bring in new files from barbrickdesign
./scripts/sync.sh push                # push local shared files to barbrickdesign
./scripts/sync.sh both                # pull then push
./scripts/sync.sh pull --dry-run      # preview only, no writes
```

**Requirements:**  
- `git` and `bash 4+`
- `BARBRICKDESIGN_TOKEN` env var for the `push` direction

### `scripts/cross-repo-sync.js` — Node.js script (GitHub API)

Used by GitHub Actions. Can also be run locally without a local clone of
barbrickdesign.

```bash
# Pull only
GITHUB_TOKEN=ghp_... node scripts/cross-repo-sync.js --direction pull

# Push only
BARBRICKDESIGN_TOKEN=ghp_... node scripts/cross-repo-sync.js --direction push

# Both directions
GITHUB_TOKEN=ghp_... BARBRICKDESIGN_TOKEN=ghp_... node scripts/cross-repo-sync.js --direction both

# Dry run
node scripts/cross-repo-sync.js --direction pull --dry-run
```

A machine-readable report is written to:
`.github/scripts/cross-repo-sync-report.json`

### npm scripts

```bash
npm run sync:from-barbrickdesign   # pull direction
npm run sync:to-barbrickdesign     # push direction
npm run sync:both                  # both directions
npm run sync:dry-run               # pull dry-run preview
```

---

## GitHub Actions automation

### Workflows

| Workflow | File | Trigger | Direction |
|----------|------|---------|-----------|
| Daily pull sync | `daily-barbrickdesign-sync.yml` | 02:00 UTC daily + manual | ← pull only |
| Push shared pages | `sync-to-barbrickdesign.yml` | push to main (dashboard.html) + manual | → push (dashboard.html only) |
| **Bidirectional sync** _(new)_ | `bidirectional-sync.yml` | push to main (css/js/components/shared) + 03:00 UTC + manual | ↔ both |

The three workflows complement each other:
- `daily-barbrickdesign-sync.yml` does a broad pull of all new files from barbrickdesign
- `sync-to-barbrickdesign.yml` keeps `dashboard.html` in sync outbound
- `bidirectional-sync.yml` handles the shared component directories bidirectionally

### Bidirectional sync workflow

The new `bidirectional-sync.yml` workflow is the authoritative sync mechanism.
It triggers automatically when shared directories change on `main` and runs on a
daily schedule.

**Manual trigger options** (via GitHub Actions UI or API):

| Input | Options | Default |
|-------|---------|---------|
| `direction` | `both`, `pull`, `push` | `both` |
| `dry_run` | `true`, `false` | `false` |

---

## Secret configuration

The push direction requires a **Personal Access Token (PAT)** with write access
to `barbrickdesign/barbrickdesign.github.io`.

### Creating the PAT

1. Go to <https://github.com/settings/tokens/new> (classic token) or
   <https://github.com/settings/personal-access-tokens/new> (fine-grained)
2. Select scope: `repo` → `contents: write` (or just `contents:write` for
   fine-grained, scoped to `barbrickdesign/barbrickdesign.github.io`)
3. Copy the generated token

### Adding to consciousness-revolution

1. Go to the repo settings:
   `https://github.com/overkor-tek/consciousness-revolution/settings/secrets/actions`
2. Click **New repository secret**
3. Name: `BARBRICKDESIGN_TOKEN`
4. Value: the PAT you created above
5. Save

> **Note:** Without this secret, all workflows gracefully degrade to pull-only.
> No errors are thrown — the push direction is simply skipped.

### For local use

```bash
# Add to your shell profile (~/.zshrc or ~/.bashrc)
export BARBRICKDESIGN_TOKEN=ghp_yourPAThere

# Or prefix per-command
BARBRICKDESIGN_TOKEN=ghp_... ./scripts/sync.sh push
```

---

## Submodule option (advanced)

If you want `shared/` to be a live git submodule (pinned to a specific commit
of barbrickdesign.github.io), run this **once** after cloning:

> ⚠️  **Warning:** The commands below permanently replace the `shared/` directory
> with the submodule checkout. **Commit or back up any local changes in `shared/`
> before proceeding** — uncommitted changes will be lost.

```bash
# Back up any local changes first
cp -r shared/ /tmp/shared-backup/

# Remove the existing shared/ directory from git tracking
git rm -r --cached shared/
rm -rf shared/

# Add the submodule
git submodule add https://github.com/barbrickdesign/barbrickdesign.github.io.git shared

# Initialise
git submodule update --init --recursive

# Commit
git commit -m "feat: add barbrickdesign.github.io as shared/ submodule"

# Restore any repo-specific files you need back (they won't overwrite BD files)
# cp /tmp/shared-backup/your-local-file.js shared/
```

After that, `scripts/sync.sh` auto-detects the submodule and uses
`git -C shared pull` instead of the temp-clone approach.

> **Team note:** Submodule commits pin to a specific revision of barbrickdesign.
> Run `git submodule update --remote shared` + commit to advance the pin.
> New team members will need `git submodule update --init` after cloning.

---

## Troubleshooting

### Pull fails with 403 / rate limit

```
GitHub API rate limit exceeded
```

**Fix:** Set `GITHUB_TOKEN` in your environment. Unauthenticated requests are
capped at 60/hour; authenticated ones at 5,000/hour.

```bash
export GITHUB_TOKEN=ghp_yourTokenHere
```

### Push skipped with "BARBRICKDESIGN_TOKEN not set"

```
⚠  BARBRICKDESIGN_TOKEN not set — skipping push direction.
```

**Fix:** Create a PAT (see [Secret configuration](#secret-configuration)) and
export it or add it to repo secrets.

### File I expected to sync did not appear

Check the skip list:
- Is the file in `node_modules/`, `.github/`, or `backend/`? → skipped
- Does the file have an allowed extension (`.html`, `.css`, `.js`, `.json`, `.md`,
  `.txt`, `.svg`, image formats, font formats)? → if not, add the extension
  to `SYNC_EXTS` in `scripts/cross-repo-sync.js`
- Does the file already exist in the destination repo? → the sync is
  **additive only**; it will not overwrite existing files

### Submodule shows "detached HEAD"

This is normal. Run `git -C shared checkout main` to attach to the branch.

---

## Architecture decisions

| Decision | Rationale |
|----------|-----------|
| Additive-only sync | Prevents accidental deletion of either repo's files |
| GitHub API for CI direction | No credential-bearing clone of remote repo needed in Actions |
| Shallow clone for local dev | Faster first-run; full history not needed for asset copy |
| Optional submodule | Gives teams who want pinned versions a path without forcing it on everyone |
| Graceful degradation without token | Push direction silently skips; CI never fails due to missing secret |
| Separate `bidirectional-sync.yml` | Clean separation of concerns from the older pull-only workflow |
