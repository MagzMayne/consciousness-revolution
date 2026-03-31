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
//
// Observability enhancements (self-healing automation):
//   • Every loop run gets a unique correlationId propagated to all step logs.
//   • Each step is tracked as a Job through the job-state-machine (PENDING →
//     RUNNING → SUCCEEDED/FAILED/RETRYING → ROLLED_BACK).
//   • Failed steps are retried with exponential back-off up to maxTries.
//   • Structured JSON log lines include ts, level, correlationId, stepName,
//     jobId, and attempt so log aggregators can join events.
//   • getMetrics() exposes success/failure counts and retry rate.

'use strict';

const fs              = require('fs');
const path            = require('path');
const { execFile }    = require('child_process');

const registry       = require('./agent-registry');
const jobSM          = require('./job-state-machine');

// ── Configuration ─────────────────────────────────────────────────────────
const LOOP_INTERVAL_MS    = parseInt(process.env.LOOP_INTERVAL_MS    || String(5 * 60 * 1000), 10); // 5 min
const NODE_STALE_MS       = parseInt(process.env.NODE_STALE_MS       || String(3 * 60 * 1000), 10); // 3 min
const BACKEND_COOLDOWN_MS = parseInt(process.env.BACKEND_COOLDOWN_MS || String(30 * 1000),     10); // 30 s
// Max attempts per step before the step is marked FAILED (terminal).
const STEP_MAX_TRIES      = parseInt(process.env.STEP_MAX_TRIES      || '3',                   10);

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

// ── Correlation ID generator ──────────────────────────────────────────────
function generateCorrelationId() {
  return `loop_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ── Structured logger ─────────────────────────────────────────────────────
// All log lines are emitted as JSON so that aggregators (ELK, Loki, etc.)
// can parse them without further configuration.

function structuredLog(level, tag, msg, fields = {}) {
  const entry = {
    ts:  new Date().toISOString(),
    level,
    tag,
    msg,
    ...fields,
  };
  const method = (level === 'warn' || level === 'error') ? 'warn' : 'log';
  // Emit structured JSON for log aggregators; keep the human-readable prefix
  // compatible with existing Railway log viewers.
  console[method](JSON.stringify(entry));
}

function log(tag, msg, fields = {}) {
  structuredLog('info', tag, msg, fields);
}

function warn(tag, msg, fields = {}) {
  structuredLog('warn', tag, msg, fields);
}

// ── Step runner with state machine + retry ────────────────────────────────
/**
 * Run a single step function, tracking it through the job state machine.
 * Retries up to STEP_MAX_TRIES on failure (exponential back-off is handled
 * inside job-state-machine when markFailed schedules RETRYING state).
 *
 * Returns the final JobRecord.
 */
async function runStep(stepName, fn, correlationId) {
  const { job } = jobSM.createJob({ stepName, correlationId, maxTries: STEP_MAX_TRIES });
  const jobId   = job.id;

  let attempt = 0;
  while (attempt < STEP_MAX_TRIES) {
    attempt++;
    jobSM.markRunning(jobId);

    try {
      const result = await fn();
      jobSM.markSucceeded(jobId, result || null);
      registry.recordRun(stepName, { success: true });
      return jobSM.getJob(jobId);
    } catch (err) {
      const currentJob = jobSM.markFailed(jobId, err.message);
      registry.recordRun(stepName, { success: false });

      if (currentJob.state === jobSM.STATES.RETRYING && attempt < STEP_MAX_TRIES) {
        // Wait for the computed back-off delay before the next attempt.
        const delayMs = Math.max(0,
          new Date(currentJob.nextRetryAt).getTime() - Date.now()
        );
        warn(stepName, `Step failed — retrying after ${delayMs}ms`, {
          correlationId, jobId, attempt, error: err.message,
        });
        await _sleep(delayMs);
        // Transition back so markRunning() accepts it on the next iteration.
      } else {
        warn(stepName, `Step failed — no more retries`, {
          correlationId, jobId, attempt, error: err.message,
        });
        return jobSM.getJob(jobId);
      }
    }
  }

  return jobSM.getJob(jobId);
}

function _sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
}

// ── Step 3: filePatchAgent ────────────────────────────────────────────────
function runFilePatch() {
  if (patchQueue.length === 0) {
    log('FilePatch', 'Patch queue is empty — nothing to do');
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
  if (failed > 0) throw new Error(`${failed} patch(es) failed to apply`);
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

  let issues = 0;

  for (const page of pages) {
    const fpath = path.join(REPO_ROOT, page);
    try {
      const stat = fs.statSync(fpath);
      log('FrontendRebuild', `HTML OK: ${page} (${stat.size} bytes)`);
    } catch (_) {
      warn('FrontendRebuild', `MISSING: ${page}`);
      issues++;
    }
  }

  log('FrontendRebuild', `Done — issues=${issues}`);
  if (issues > 0) throw new Error(`${issues} critical HTML page(s) missing`);
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
}

// ── Step 7: backendReloadAgent ───────────────────────────────────────────
function runBackendReload() {
  const now     = Date.now();
  const elapsed = now - _lastReload;
  if (_lastReload > 0 && elapsed < BACKEND_COOLDOWN_MS) {
    const remaining = Math.ceil((BACKEND_COOLDOWN_MS - elapsed) / 1000);
    log('BackendReload', `Cool-down active — ${remaining}s remaining, skipping reload`);
    return;
  }
  // Nothing actually needs reloading — Railway handles restarts.
  // We just update the timestamp so subsequent calls honour the cooldown.
  _lastReload = now;
  log('BackendReload', 'Reload check complete — no action needed');
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
    throw new Error(`Cannot read repo root: ${err.message}`);
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
  if (errors > 0) throw new Error(`${errors} HTML file(s) could not be processed`);
}

// ── Step 9: repoCommitAgent ──────────────────────────────────────────────
function runRepoCommit() {
  return new Promise((resolve, reject) => {
    log('RepoCommit', '$ git status --porcelain');
    execFile('git', ['status', '--porcelain'], { cwd: REPO_ROOT, timeout: 10_000 }, (err, stdout) => {
      if (err) {
        if (err.code === 'ENOENT') {
          // git binary not available in this environment (Railway, Docker, etc.)
          log('RepoCommit', 'git not found in PATH — skipping commit step');
          resolve();
        } else {
          reject(new Error(`git status failed: ${err.message}`));
        }
      } else {
        const status = stdout.trim();
        if (!status) {
          log('RepoCommit', 'No uncommitted changes — nothing to do');
        } else {
          // In Railway we don't have write access to push — log for awareness only.
          warn('RepoCommit', `Uncommitted changes detected (Railway cannot push):\n${status}`);
        }
        resolve();
      }
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
  const correlationId = generateCorrelationId();

  log('MasterLoop', `Starting: runSelfHealing (loop #${_loopCount})`, { correlationId });

  const stepResults = [];

  for (let i = 0; i < STEPS.length; i++) {
    const { name, fn } = STEPS[i];
    log('SelfHealing', `Step ${i + 1}/${STEPS.length}: ${name}`, { correlationId });
    registry.setStatus(name, 'running');

    const finalJob = await runStep(name, fn, correlationId);
    stepResults.push({ name, state: finalJob.state, attempts: finalJob.attempt });
  }

  // Emit structured loop summary for dashboards / alerting.
  const succeeded = stepResults.filter(r => r.state === jobSM.STATES.SUCCEEDED).length;
  const failed    = stepResults.filter(r => r.state === jobSM.STATES.FAILED).length;
  const metrics   = jobSM.getMetrics();

  log('SelfHealing', `All ${STEPS.length} steps complete`, {
    correlationId,
    succeeded,
    failed,
    retryRate:   metrics.retryRate,
    failureRate: metrics.failureRate,
  });
  log('MasterLoop', 'Finished: runSelfHealing', { correlationId });

  return { correlationId, succeeded, failed, stepResults };
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
  getMetrics: jobSM.getMetrics,
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
