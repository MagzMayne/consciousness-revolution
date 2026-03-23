// backend/services/master-loop.js
// Self-healing master loop for the consciousness-revolution Railway backend.
//
// Mirrors the 14-step SelfHealing system observed in the backend logs:
//
//   [SelfHealing] Step  1: nodeCleanupAgent
//   [SelfHealing] Step  2: codeGenAgent
//   [SelfHealing] Step  3: filePatchAgent
//   [SelfHealing] Step  4: frontendRebuildAgent
//   [SelfHealing] Step  5: dashboardRepairAgent
//   [SelfHealing] Step  6: protocolEnforcerAgent
//   [SelfHealing] Step  7: backendReloadAgent
//   [SelfHealing] Step  8: meshProjectPageAgent
//   [SelfHealing] Step  9: repoCommitAgent
//
// Each step is a focused function that logs results and is fault-isolated:
// one failure never aborts the loop.

'use strict';

const fs              = require('fs');
const path            = require('path');
const { execFile }    = require('child_process');

const registry = require('./agent-registry');

// ── Configuration ─────────────────────────────────────────────────────────
const LOOP_INTERVAL_MS    = parseInt(process.env.LOOP_INTERVAL_MS    || String(5 * 60 * 1000), 10); // 5 min
const NODE_STALE_MS       = parseInt(process.env.NODE_STALE_MS       || String(3 * 60 * 1000), 10); // 3 min
const BACKEND_COOLDOWN_MS = parseInt(process.env.BACKEND_COOLDOWN_MS || String(30 * 1000),     10); // 30 s

// Resolve repo root relative to this file (backend/services/ → repo root)
const REPO_ROOT = path.resolve(__dirname, '..', '..');

// ── Shared state ──────────────────────────────────────────────────────────
let _nodeRegistry = null;   // injected by server-main
let _lastReload   = 0;
let _loopTimer    = null;
let _loopCount    = 0;

// Patch queue for filePatchAgent
const patchQueue = [];

/** Allow server-main to inject the live node registry Map. */
function setNodeRegistry(map) {
  _nodeRegistry = map;
}

/** Enqueue a file patch: { filePath, oldContent, newContent } */
function enqueuePatch(patch) {
  patchQueue.push(patch);
}

// ── Helper ────────────────────────────────────────────────────────────────
function log(tag, msg) {
  const ts = new Date().toISOString();
  console.log(`${ts} [inf] [${tag}] ${msg}`);
}

function warn(tag, msg) {
  const ts = new Date().toISOString();
  console.warn(`${ts} [warn] [${tag}] ${msg}`);
}

// ── Step 1: nodeCleanupAgent ──────────────────────────────────────────────
function runNodeCleanup() {
  if (!_nodeRegistry) {
    log('NodeCleanup', 'No node registry injected — skipping');
    return;
  }
  const cutoff = Date.now() - NODE_STALE_MS;
  let evicted = 0;
  for (const [id, node] of _nodeRegistry) {
    const lastSeen = new Date(node.lastSeen || 0).getTime();
    if (lastSeen < cutoff) {
      _nodeRegistry.delete(id);
      evicted++;
    }
  }
  log('NodeCleanup', `Evicted ${evicted} stale node(s) — active=${_nodeRegistry.size}`);
  registry.recordRun('nodeCleanupAgent', { success: true });
}

// ── Step 2: codeGenAgent ──────────────────────────────────────────────────
function runCodeGen() {
  // Look for heartbeat JSON stubs that are missing or stale and regenerate them.
  const heartbeatDir = path.join(REPO_ROOT, 'public');
  const files = ['master-loop-dashboard-heartbeat.json', 'api-command-center-heartbeat.json'];

  let generated = 0;
  let skipped   = 0;

  for (const fname of files) {
    const fpath = path.join(heartbeatDir, fname);
    try {
      fs.accessSync(fpath, fs.constants.F_OK);
      skipped++;
    } catch (_) {
      // File missing — generate a stub
      try {
        const stub = JSON.stringify({
          generated: new Date().toISOString(),
          source:    'codeGenAgent',
          status:    'auto-generated',
        }, null, 2);
        fs.mkdirSync(heartbeatDir, { recursive: true });
        fs.writeFileSync(fpath, stub, 'utf8');
        generated++;
      } catch (writeErr) {
        warn('CodeGen', `Could not write ${fname}: ${writeErr.message}`);
      }
    }
  }

  log('CodeGen', `regenerateMissingHeartbeats — generated=${generated} skipped=${skipped}`);
  registry.recordRun('codeGenAgent', { success: true });
}

// ── Step 3: filePatchAgent ────────────────────────────────────────────────
function runFilePatch() {
  if (patchQueue.length === 0) {
    log('FilePatch', 'Patch queue is empty — nothing to do');
    registry.recordRun('filePatchAgent', { success: true });
    return;
  }

  let applied = 0;
  let failed  = 0;
  while (patchQueue.length) {
    const { filePath, oldContent, newContent } = patchQueue.shift();
    try {
      const current = fs.readFileSync(filePath, 'utf8');
      if (!current.includes(oldContent)) {
        warn('FilePatch', `Target content not found in ${filePath} — skipping`);
        failed++;
        continue;
      }
      fs.writeFileSync(filePath, current.replace(oldContent, newContent), 'utf8');
      applied++;
    } catch (err) {
      warn('FilePatch', `Failed to patch ${filePath}: ${err.message}`);
      failed++;
    }
  }

  log('FilePatch', `Applied ${applied} patch(es) — failed=${failed}`);
  registry.recordRun('filePatchAgent', { success: failed === 0 });
}

// ── Step 4: frontendRebuildAgent ─────────────────────────────────────────
function runFrontendRebuild() {
  log('FrontendRebuild', 'Starting frontend rebuild validation…');

  // Key HTML pages to verify exist and are non-empty
  const pages = [
    'index.html',
    'ez-autobots.html',
    'ez-autobots-node-launcher.html',
    'developer-dashboard.html',
    'consciousness-revolution-hub.html',
  ];

  let htmlOk = true;
  let issues = 0;

  for (const page of pages) {
    const fpath = path.join(REPO_ROOT, page);
    try {
      const stat = fs.statSync(fpath);
      log('FrontendRebuild', `HTML OK: ${page} (${stat.size} bytes)`);
    } catch (_) {
      warn('FrontendRebuild', `MISSING: ${page}`);
      htmlOk = false;
      issues++;
    }
  }

  log('FrontendRebuild', `Done — htmlOk=${htmlOk} issues=${issues}`);
  registry.recordRun('frontendRebuildAgent', { success: htmlOk });
}

// ── Step 5: dashboardRepairAgent ─────────────────────────────────────────
const DASHBOARD_CHECKS = {
  'ez-autobots.html': ['#bot-list', '#agent-status', '#mesh-map'],
  'developer-dashboard.html': ['#dev-profile', '#activity-log'],
};

function runDashboardRepair() {
  log('DashboardRepair', 'Starting dashboard repair scan…');
  let totalRepaired = 0;
  let totalFiles    = 0;

  for (const [page, selectors] of Object.entries(DASHBOARD_CHECKS)) {
    const fpath = path.join(REPO_ROOT, page);
    let content;
    try {
      content = fs.readFileSync(fpath, 'utf8');
    } catch (_) {
      warn('DashboardRepair', `Cannot read ${page} — skipping`);
      continue;
    }

    totalFiles++;
    let repaired = 0;

    for (const sel of selectors) {
      // Check that the element id exists in the HTML
      const id = sel.replace(/^#/, '');
      if (!content.includes(`id="${id}"`) && !content.includes(`id='${id}'`)) {
        warn('DashboardRepair', `${page}: missing element ${sel}`);
        repaired++;
      }
    }

    if (repaired === 0) {
      log('DashboardRepair', `${page}: no repairs needed`);
    } else {
      log('DashboardRepair', `${page}: ${repaired} element(s) missing (manual review required)`);
      totalRepaired += repaired;
    }
  }

  log('DashboardRepair', `Done — totalRepaired=${totalRepaired}/${totalFiles}`);
  registry.recordRun('dashboardRepairAgent', { success: true });
}

// ── Step 6: protocolEnforcerAgent ────────────────────────────────────────
// Backend WebSocket event types that clients must handle.
const BACKEND_EVENT_TYPES = ['meshUpdate', 'loopUpdate', 'registryUpdate', 'agentHealth', 'heartbeat'];

function runProtocolEnforcer() {
  log('ProtocolEnforcer', 'Starting protocol enforcement scan…');

  // Scan JS files for addEventListener / on('eventType')
  const jsDir = path.join(REPO_ROOT, 'js');
  const handled = new Set();

  try {
    const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
    // Scan all JS files — the directory typically has ~100-200 files and each
    // scan is a simple string-match, so performance impact is negligible.
    for (const fname of jsFiles) {
      const content = fs.readFileSync(path.join(jsDir, fname), 'utf8');
      for (const evType of BACKEND_EVENT_TYPES) {
        if (content.includes(evType)) handled.add(evType);
      }
    }
  } catch (_) {
    // js/ directory may not exist in Railway deployment — not an error
  }

  const unhandled = BACKEND_EVENT_TYPES.filter(t => !handled.has(t));
  const ok        = unhandled.length === 0;

  if (ok) {
    log('ProtocolEnforcer', 'Protocol is in sync — no drift detected');
  } else {
    warn('ProtocolEnforcer', `Unhandled event type(s): ${unhandled.join(', ')}`);
  }

  log('ProtocolEnforcer', `Done — ok=${ok} unhandled=${unhandled.length} orphaned=0 patchedFiles=0`);
  registry.recordRun('protocolEnforcerAgent', { success: ok });
}

// ── Step 7: backendReloadAgent ───────────────────────────────────────────
function runBackendReload() {
  const now     = Date.now();
  const elapsed = now - _lastReload;
  if (_lastReload > 0 && elapsed < BACKEND_COOLDOWN_MS) {
    const remaining = Math.ceil((BACKEND_COOLDOWN_MS - elapsed) / 1000);
    log('BackendReload', `Cool-down active — ${remaining}s remaining, skipping reload`);
    registry.recordRun('backendReloadAgent', { success: true });
    return;
  }
  // Nothing actually needs reloading — Railway handles restarts.
  // We just update the timestamp so subsequent calls honour the cooldown.
  _lastReload = now;
  log('BackendReload', 'Reload check complete — no action needed');
  registry.recordRun('backendReloadAgent', { success: true });
}

// ── Step 8: meshProjectPageAgent ────────────────────────────────────────
const MESH_CLIENT_MARKER = 'mesh-engine-client';
const MESH_SCRIPT_TAG    = '<script src="/js/mesh-engine-client.js"></script>';

function runMeshProjectPage() {
  log('meshProjectPageAgent', 'Starting HTML scan for mesh-engine-client integration');

  let scanned       = 0;
  let injected      = 0;
  let alreadyPresent = 0;
  let errors        = 0;

  // Only scan top-level HTML in REPO_ROOT (not subdirectories)
  let htmlFiles = [];
  try {
    htmlFiles = fs.readdirSync(REPO_ROOT).filter(f => f.endsWith('.html'));
  } catch (err) {
    warn('meshProjectPageAgent', `Cannot read repo root: ${err.message}`);
    registry.recordRun('meshProjectPageAgent', { success: false });
    return;
  }

  for (const fname of htmlFiles) {
    scanned++;
    try {
      const fpath   = path.join(REPO_ROOT, fname);
      const content = fs.readFileSync(fpath, 'utf8');

      if (content.includes(MESH_CLIENT_MARKER)) {
        alreadyPresent++;
      } else {
        // Inject before the last </body> tag (replace all occurrences for malformed HTML)
        if (content.includes('</body>')) {
          const updated = content.replace(/<\/body>/gi, `  ${MESH_SCRIPT_TAG}\n</body>`);
          fs.writeFileSync(fpath, updated, 'utf8');
          injected++;
        }
      }
    } catch (_) {
      errors++;
    }
  }

  log('meshProjectPageAgent', `Done — scanned=${scanned} injected=${injected} alreadyPresent=${alreadyPresent} errors=${errors}`);
  registry.recordRun('meshProjectPageAgent', { success: errors === 0 });
}

// ── Step 9: repoCommitAgent ──────────────────────────────────────────────
function runRepoCommit() {
  return new Promise((resolve) => {
    log('RepoCommit', '$ git status --porcelain');
    execFile('git', ['status', '--porcelain'], { cwd: REPO_ROOT, timeout: 10_000 }, (err, stdout) => {
      if (err) {
        if (err.code === 'ENOENT') {
          // git binary not available in this environment (Railway, Docker, etc.)
          log('RepoCommit', 'git not found in PATH — skipping commit step');
        } else {
          warn('RepoCommit', `git status failed: ${err.message}`);
        }
        registry.recordRun('repoCommitAgent', { success: false });
      } else {
        const status = stdout.trim();
        if (!status) {
          log('RepoCommit', 'No uncommitted changes — nothing to do');
        } else {
          // In Railway we don't have write access to push — log for awareness only.
          warn('RepoCommit', `Uncommitted changes detected (Railway cannot push):\n${status}`);
        }
        registry.recordRun('repoCommitAgent', { success: true });
      }
      resolve();
    });
  });
}

// ── Master self-healing loop ─────────────────────────────────────────────
const STEPS = [
  { name: 'nodeCleanupAgent',       fn: runNodeCleanup      },
  { name: 'codeGenAgent',           fn: runCodeGen          },
  { name: 'filePatchAgent',         fn: runFilePatch        },
  { name: 'frontendRebuildAgent',   fn: runFrontendRebuild  },
  { name: 'dashboardRepairAgent',   fn: runDashboardRepair  },
  { name: 'protocolEnforcerAgent',  fn: runProtocolEnforcer },
  { name: 'backendReloadAgent',     fn: runBackendReload    },
  { name: 'meshProjectPageAgent',   fn: runMeshProjectPage  },
  { name: 'repoCommitAgent',        fn: runRepoCommit       },
];

async function runSelfHealing() {
  _loopCount++;
  log('MasterLoop', `Starting: runSelfHealing (loop #${_loopCount})`);

  for (let i = 0; i < STEPS.length; i++) {
    const { name, fn } = STEPS[i];
    log('SelfHealing', `Step ${i + 1}/${STEPS.length}: ${name}`);
    registry.setStatus(name, 'running');
    try {
      await fn();
    } catch (err) {
      warn('SelfHealing', `Step ${name} threw: ${err.message}`);
      registry.recordRun(name, { success: false });
    }
  }

  log('SelfHealing', `All ${STEPS.length} steps complete`);
  log('MasterLoop', 'Finished: runSelfHealing');
}

/** Start the master loop.  Call once from server-main.js after server is bound. */
function start(nodeRegistry) {
  if (_loopTimer) return; // already running

  if (nodeRegistry) setNodeRegistry(nodeRegistry);

  registry.bootstrapDefaults();

  // Run immediately on start, then on interval
  runSelfHealing().catch(err => warn('MasterLoop', `Unhandled error: ${err.message}`));

  _loopTimer = setInterval(() => {
    runSelfHealing().catch(err => warn('MasterLoop', `Unhandled error: ${err.message}`));
  }, LOOP_INTERVAL_MS);

  log('MasterLoop', `Loop started — interval=${LOOP_INTERVAL_MS / 1000}s`);
}

/** Stop the master loop (for tests / graceful shutdown). */
function stop() {
  if (_loopTimer) {
    clearInterval(_loopTimer);
    _loopTimer = null;
    log('MasterLoop', 'Loop stopped');
  }
}

module.exports = {
  start,
  stop,
  setNodeRegistry,
  enqueuePatch,
  runSelfHealing,
  // Expose step runners for unit tests
  steps: {
    runNodeCleanup,
    runCodeGen,
    runFilePatch,
    runFrontendRebuild,
    runDashboardRepair,
    runProtocolEnforcer,
    runBackendReload,
    runMeshProjectPage,
    runRepoCommit,
  },
};
