#!/usr/bin/env node
// =============================================================================
// Cross-Repo Sync — consciousness-revolution ↔ barbrickdesign.github.io
// =============================================================================
//
// PURPOSE
//   Bidirectional, additive-only sync via the GitHub REST API.
//   No local checkout of the remote repo is needed — ideal for GitHub Actions.
//
//   Direction "pull" : barbrickdesign.github.io → consciousness-revolution
//   Direction "push" : consciousness-revolution → barbrickdesign.github.io
//   Direction "both" : pull first, then push  (default)
//
// PHILOSOPHY
//   ADDITIVE ONLY — files are added or updated, never deleted from either repo.
//
// USAGE (local)
//   BARBRICKDESIGN_TOKEN=<PAT> node scripts/cross-repo-sync.js [--direction pull|push|both] [--dry-run]
//
// USAGE (GitHub Actions — set secrets BARBRICKDESIGN_TOKEN and GITHUB_TOKEN)
//   The workflow passes env vars automatically.
//
// REQUIRED ENV VARS
//   GITHUB_TOKEN          — read access to both repos (always available in Actions)
//   BARBRICKDESIGN_TOKEN  — PAT with `contents:write` on barbrickdesign.github.io
//                           Required only for push / both directions.
//
// OUTPUT
//   Writes .github/scripts/cross-repo-sync-report.json with a run summary.
//
// =============================================================================

'use strict';

const fs   = require('fs');
const path = require('path');
const https = require('https');

// ── Config ───────────────────────────────────────────────────────────────────

const REPO_ROOT = path.resolve(__dirname, '..');

const CR_OWNER  = 'overkor-tek';
const CR_REPO   = 'consciousness-revolution';
const BD_OWNER  = 'barbrickdesign';
const BD_REPO   = 'barbrickdesign.github.io';

// Directories that are synced between repos
const SYNC_DIRS = ['css', 'js', 'components', 'shared'];

// Extensions allowed for cross-repo sync
const SYNC_EXTS = new Set([
  '.html', '.css', '.js', '.json', '.md', '.txt',
  '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp',
  '.woff', '.woff2', '.ttf',
]);

// Paths / prefixes to NEVER sync
const SKIP_PREFIXES = [
  'node_modules/', '.git/', '.github/', 'backend/', 'netlify/',
];

// Filenames that are always repo-specific — skip them
const SKIP_FILES = new Set([
  'package.json', 'package-lock.json', 'netlify.toml', 'railway.toml',
  '.gitignore', 'CNAME', 'robots.txt', 'sitemap.xml', 'manifest.json',
  'service-worker.js', 'sw.js', '_config.yml',
]);

const REPORT_PATH = path.join(REPO_ROOT, '.github', 'scripts', 'cross-repo-sync-report.json');

// ── Argument parsing ─────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const DRY_RUN   = args.includes('--dry-run');
const DIRECTION = (() => {
  const idx = args.indexOf('--direction');
  return idx !== -1 ? args[idx + 1] : 'both';
})();

// ── GitHub API helpers ────────────────────────────────────────────────────────

function githubRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8');
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(raw) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: raw });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

function makeHeaders(token) {
  return {
    'User-Agent':    'consciousness-revolution-sync/2.0',
    'Accept':        'application/vnd.github.v3+json',
    'Content-Type':  'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * GET /repos/:owner/:repo/contents/:path
 * Returns file metadata (including SHA) or directory listing.
 */
async function getContents(owner, repo, filePath, token) {
  const encoded = filePath.split('/').map(encodeURIComponent).join('/');
  const res = await githubRequest({
    hostname: 'api.github.com',
    path:     `/repos/${owner}/${repo}/contents/${encoded}`,
    method:   'GET',
    headers:  makeHeaders(token),
  });
  return res;
}

/**
 * Fetch raw file content as a string.
 */
function fetchRaw(url, token) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request(
      {
        hostname: parsed.hostname,
        path:     parsed.pathname + parsed.search,
        method:   'GET',
        headers:  {
          'User-Agent':  'consciousness-revolution-sync/2.0',
          Accept:        'application/vnd.github.v3.raw',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
      (res) => {
        if (res.statusCode === 302 || res.statusCode === 301) {
          resolve(fetchRaw(res.headers.location, token));
          return;
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end',  () => resolve(Buffer.concat(chunks)));
      }
    );
    req.on('error', reject);
    req.end();
  });
}

/**
 * Create or update a file in a remote repo.
 * Returns true if a change was made, false if content was identical.
 */
async function createOrUpdate(owner, repo, filePath, content, token, message) {
  // Get current SHA (if file exists)
  let sha;
  const existing = await getContents(owner, repo, filePath, token);
  if (existing.status === 200 && !Array.isArray(existing.body)) {
    sha = existing.body.sha;
    // Compare base64 content — normalize newlines from both sides before comparing
    const existingContent = (existing.body.content ?? '').replace(/\n/g, '');
    const newContent = (
      Buffer.isBuffer(content)
        ? content.toString('base64')
        : Buffer.from(content).toString('base64')
    ).replace(/\n/g, '');
    if (existingContent === newContent) return false;
  }

  const encoded = filePath.split('/').map(encodeURIComponent).join('/');
  const bodyPayload = {
    message,
    content: Buffer.isBuffer(content)
      ? content.toString('base64')
      : Buffer.from(content).toString('base64'),
    committer: {
      name:  'github-actions[bot]',
      email: 'github-actions[bot]@users.noreply.github.com',
    },
    ...(sha ? { sha } : {}),
  };

  const res = await githubRequest(
    {
      hostname: 'api.github.com',
      path:     `/repos/${owner}/${repo}/contents/${encoded}`,
      method:   'PUT',
      headers:  {
        ...makeHeaders(token),
        'Content-Length': Buffer.byteLength(JSON.stringify(bodyPayload)),
      },
    },
    bodyPayload
  );

  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`GitHub API error ${res.status} for ${filePath}: ${JSON.stringify(res.body)}`);
  }
  return true;
}

// ── File helpers ─────────────────────────────────────────────────────────────

function shouldSkip(filePath) {
  const base = path.basename(filePath);
  if (SKIP_FILES.has(base)) return true;
  for (const prefix of SKIP_PREFIXES) {
    if (filePath.startsWith(prefix)) return true;
  }
  const ext = path.extname(filePath).toLowerCase();
  if (!SYNC_EXTS.has(ext)) return true;
  return false;
}

/**
 * Recursively list all files under a directory path in a remote GitHub repo.
 * Returns array of { path, download_url } objects.
 */
async function listRemoteFiles(owner, repo, dirPath, token) {
  const res = await getContents(owner, repo, dirPath, token);
  if (res.status === 404) return [];
  if (res.status !== 200) {
    console.warn(`⚠  Could not list ${owner}/${repo}/${dirPath} (${res.status})`);
    return [];
  }

  const items = Array.isArray(res.body) ? res.body : [res.body];
  const files = [];

  for (const item of items) {
    if (item.type === 'file') {
      files.push({ path: item.path, download_url: item.download_url, sha: item.sha });
    } else if (item.type === 'dir') {
      const sub = await listRemoteFiles(owner, repo, item.path, token);
      files.push(...sub);
    }
  }

  return files;
}

// ── PULL — barbrickdesign → consciousness-revolution ─────────────────────────

async function pullFromBarbrickdesign(report) {
  const readToken  = process.env.GITHUB_TOKEN || process.env.BARBRICKDESIGN_TOKEN;
  const writeToken = process.env.GITHUB_TOKEN;

  console.log('\n=== PULL: barbrickdesign.github.io → consciousness-revolution ===');

  for (const dir of SYNC_DIRS) {
    console.log(`\nScanning barbrickdesign/${dir}/ …`);

    const remoteFiles = await listRemoteFiles(BD_OWNER, BD_REPO, dir, readToken);

    for (const file of remoteFiles) {
      if (shouldSkip(file.path)) {
        console.log(`  ⏭  skip: ${file.path}`);
        continue;
      }

      // Check if file already exists in CR
      const existingRes = await getContents(CR_OWNER, CR_REPO, file.path, writeToken);
      if (existingRes.status === 200) {
        console.log(`  ⏭  exists: ${file.path}`);
        report.pull.skipped.push(file.path);
        continue;
      }

      // Fetch content
      let content;
      try {
        content = await fetchRaw(file.download_url, readToken);
      } catch (e) {
        console.error(`  ❌ fetch failed: ${file.path} — ${e.message}`);
        report.pull.errors.push({ path: file.path, error: e.message });
        continue;
      }

      if (DRY_RUN) {
        console.log(`  [dry-run] would add: ${file.path}`);
        report.pull.would_add.push(file.path);
        continue;
      }

      try {
        const changed = await createOrUpdate(
          CR_OWNER, CR_REPO, file.path, content, writeToken,
          `🔄 Sync from barbrickdesign: ${file.path} [skip ci]`
        );
        if (changed) {
          console.log(`  ✅ added: ${file.path}`);
          report.pull.added.push(file.path);
        } else {
          console.log(`  ⏭  identical: ${file.path}`);
          report.pull.skipped.push(file.path);
        }
      } catch (e) {
        console.error(`  ❌ write failed: ${file.path} — ${e.message}`);
        report.pull.errors.push({ path: file.path, error: e.message });
      }
    }
  }
}

// ── PUSH — consciousness-revolution → barbrickdesign ─────────────────────────

async function pushToBarbrickdesign(report) {
  const bdToken   = process.env.BARBRICKDESIGN_TOKEN;
  const readToken = process.env.GITHUB_TOKEN || bdToken;

  if (!bdToken) {
    console.warn('\n⚠  BARBRICKDESIGN_TOKEN not set — skipping push direction.');
    report.push.skipped_reason = 'BARBRICKDESIGN_TOKEN not configured';
    return;
  }

  console.log('\n=== PUSH: consciousness-revolution → barbrickdesign.github.io ===');

  // Walk local SYNC_DIRS and push new/changed files
  for (const dir of SYNC_DIRS) {
    const localDir = path.join(REPO_ROOT, dir);
    if (!fs.existsSync(localDir)) {
      console.log(`  ⏭  local ${dir}/ does not exist — skip`);
      continue;
    }

    console.log(`\nScanning local ${dir}/ …`);

    const files = walkLocal(localDir, localDir);

    for (const relPath of files) {
      const fullPath  = path.join(localDir, relPath);
      const repoPath  = `${dir}/${relPath}`;

      if (shouldSkip(repoPath)) {
        console.log(`  ⏭  skip: ${repoPath}`);
        continue;
      }

      let content;
      try {
        content = fs.readFileSync(fullPath);
      } catch (e) {
        console.error(`  ❌ read failed: ${repoPath} — ${e.message}`);
        report.push.errors.push({ path: repoPath, error: e.message });
        continue;
      }

      if (DRY_RUN) {
        console.log(`  [dry-run] would push: ${repoPath}`);
        report.push.would_push.push(repoPath);
        continue;
      }

      try {
        const changed = await createOrUpdate(
          BD_OWNER, BD_REPO, repoPath, content, bdToken,
          `🔄 Sync from consciousness-revolution: ${repoPath} [skip ci]`
        );
        if (changed) {
          console.log(`  ✅ pushed: ${repoPath}`);
          report.push.pushed.push(repoPath);
        } else {
          console.log(`  ⏭  identical: ${repoPath}`);
          report.push.skipped.push(repoPath);
        }
      } catch (e) {
        console.error(`  ❌ push failed: ${repoPath} — ${e.message}`);
        report.push.errors.push({ path: repoPath, error: e.message });
      }
    }
  }
}

/** Recursively list files relative to baseDir. */
function walkLocal(baseDir, currentDir) {
  const results = [];
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      // Recurse; results are already relative to baseDir
      results.push(...walkLocal(baseDir, fullPath));
    } else {
      results.push(path.relative(baseDir, fullPath));
    }
  }
  return results;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  Cross-Repo Sync  consciousness-revolution ↔ barbrickdesign  ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  if (DRY_RUN) console.log('\n⚠  DRY-RUN MODE — no files will be written\n');

  const report = {
    timestamp: new Date().toISOString(),
    direction: DIRECTION,
    dry_run:   DRY_RUN,
    pull: { added: [], skipped: [], errors: [], would_add: [] },
    push: { pushed: [], skipped: [], errors: [], would_push: [], skipped_reason: null },
  };

  try {
    if (DIRECTION === 'pull' || DIRECTION === 'both') {
      await pullFromBarbrickdesign(report);
    }
    if (DIRECTION === 'push' || DIRECTION === 'both') {
      await pushToBarbrickdesign(report);
    }
  } catch (err) {
    console.error(`\n❌ Fatal error: ${err.message}`);
    report.fatal_error = err.message;
  }

  // Write report
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  // Summary
  console.log('\n── Summary ──────────────────────────────────────────────────────');
  if (DIRECTION !== 'push') {
    console.log(`Pull — added: ${report.pull.added.length}, skipped: ${report.pull.skipped.length}, errors: ${report.pull.errors.length}`);
  }
  if (DIRECTION !== 'pull') {
    console.log(`Push — pushed: ${report.push.pushed.length}, skipped: ${report.push.skipped.length}, errors: ${report.push.errors.length}`);
    if (report.push.skipped_reason) console.log(`       (reason: ${report.push.skipped_reason})`);
  }

  const totalErrors = report.pull.errors.length + report.push.errors.length;
  if (totalErrors > 0) {
    console.error(`\n❌ Completed with ${totalErrors} error(s).`);
    process.exit(1);
  } else {
    console.log('\n✅ Sync complete.');
  }
}

main();
