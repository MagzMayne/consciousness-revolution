'use strict';

/**
 * backend/services/job-state-machine.js
 *
 * Persistent-enough, in-process job state machine for the self-healing
 * automation system.  Each automation step is modelled as a "Job" that moves
 * through well-defined states:
 *
 *   PENDING → RUNNING → SUCCEEDED
 *                     → FAILED → RETRYING → RUNNING (retry loop)
 *                              → ROLLED_BACK
 *
 * Key design decisions
 * ────────────────────
 *  • Idempotency:  every job carries an idempotencyKey derived from the
 *    step name + correlation ID.  Submitting the same key twice is a no-op
 *    that returns the existing record.
 *  • Correlation IDs:  every operation accepts / propagates a correlationId
 *    so that logs across the master-loop run can be joined by a single key.
 *  • Retry with exponential back-off:  callers drive retry by calling
 *    markRetrying(jobId).  The machine computes nextRetryAt automatically.
 *  • Structured metrics:  getMetrics() returns counts usable by dashboards
 *    or Prometheus exporters.
 *  • No external dependencies:  runs purely in Node.js built-ins.  Swap the
 *    in-memory store for a DB by replacing the _store Map.
 */

// ── Constants ──────────────────────────────────────────────────────────────

const STATES = Object.freeze({
  PENDING:      'PENDING',
  RUNNING:      'RUNNING',
  SUCCEEDED:    'SUCCEEDED',
  FAILED:       'FAILED',
  RETRYING:     'RETRYING',
  ROLLED_BACK:  'ROLLED_BACK',
});

// Base delay for exponential back-off (ms).  Overridable via env.
const BASE_BACKOFF_MS   = parseInt(process.env.JOB_BASE_BACKOFF_MS   || '1000',  10);
const MAX_BACKOFF_MS    = parseInt(process.env.JOB_MAX_BACKOFF_MS    || '60000', 10);
const DEFAULT_MAX_TRIES = parseInt(process.env.JOB_DEFAULT_MAX_TRIES || '3',     10);

// ── In-memory store ────────────────────────────────────────────────────────
// Map<jobId, JobRecord>
const _store = new Map();
// Map<idempotencyKey, jobId>
const _idempotencyIndex = new Map();

// ── Helpers ────────────────────────────────────────────────────────────────

function _now() {
  return new Date().toISOString();
}

function _computeBackoff(attempt) {
  // Exponential back-off with jitter: base * 2^attempt  ± 10%
  const raw    = BASE_BACKOFF_MS * Math.pow(2, attempt);
  const jitter = raw * 0.1 * (Math.random() - 0.5);
  return Math.min(Math.floor(raw + jitter), MAX_BACKOFF_MS);
}

function _log(correlationId, level, tag, message, extra = {}) {
  const entry = {
    ts:            _now(),
    level,
    tag,
    correlationId: correlationId || null,
    message,
    ...extra,
  };
  const method = level === 'warn' || level === 'error' ? 'warn' : 'log';
  console[method](JSON.stringify(entry));
}

// ── Core operations ────────────────────────────────────────────────────────

/**
 * Create a new job in PENDING state.
 *
 * @param {object} opts
 * @param {string}  opts.stepName       – Human-readable step identifier.
 * @param {string}  opts.correlationId  – Shared ID for the parent loop run.
 * @param {string} [opts.idempotencyKey] – Stable key; re-submitting returns existing record.
 * @param {number} [opts.maxTries]       – Max total attempts (default 3).
 * @returns {{ created: boolean, job: JobRecord }}
 */
function createJob({ stepName, correlationId, idempotencyKey, maxTries = DEFAULT_MAX_TRIES }) {
  if (!stepName)      throw new Error('stepName is required');
  if (!correlationId) throw new Error('correlationId is required');

  const iKey = idempotencyKey || `${stepName}:${correlationId}`;

  if (_idempotencyIndex.has(iKey)) {
    const existing = _store.get(_idempotencyIndex.get(iKey));
    _log(correlationId, 'info', 'JobStateMachine',
      `Idempotent re-submit — returning existing job`, { jobId: existing.id, iKey });
    return { created: false, job: existing };
  }

  const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const job = {
    id:             jobId,
    stepName,
    correlationId,
    idempotencyKey: iKey,
    state:          STATES.PENDING,
    attempt:        0,
    maxTries,
    createdAt:      _now(),
    updatedAt:      _now(),
    startedAt:      null,
    finishedAt:     null,
    nextRetryAt:    null,
    error:          null,
    result:         null,
    history:        [],
  };

  _store.set(jobId, job);
  _idempotencyIndex.set(iKey, jobId);

  _log(correlationId, 'info', 'JobStateMachine', 'Job created', {
    jobId, stepName, state: STATES.PENDING,
  });

  return { created: true, job };
}

/**
 * Transition a job from PENDING or RETRYING → RUNNING.
 */
function markRunning(jobId) {
  const job = _get(jobId);
  _assertState(job, [STATES.PENDING, STATES.RETRYING]);

  job.attempt   += 1;
  job.state      = STATES.RUNNING;
  job.startedAt  = _now();
  job.updatedAt  = _now();
  job.error      = null;
  _pushHistory(job, STATES.RUNNING);

  _log(job.correlationId, 'info', 'JobStateMachine', 'Job running', {
    jobId, stepName: job.stepName, attempt: job.attempt,
  });
  return job;
}

/**
 * Transition a RUNNING job → SUCCEEDED.
 */
function markSucceeded(jobId, result = null) {
  const job = _get(jobId);
  _assertState(job, [STATES.RUNNING]);

  job.state      = STATES.SUCCEEDED;
  job.finishedAt = _now();
  job.updatedAt  = _now();
  job.result     = result;
  _pushHistory(job, STATES.SUCCEEDED);

  _log(job.correlationId, 'info', 'JobStateMachine', 'Job succeeded', {
    jobId, stepName: job.stepName, attempt: job.attempt,
  });
  return job;
}

/**
 * Transition a RUNNING job → FAILED (terminal) or schedule retry.
 * If job.attempt < job.maxTries the state is set to RETRYING automatically;
 * otherwise it is set to FAILED.
 *
 * @param {string}  jobId
 * @param {string}  errorMessage
 * @param {object} [opts]
 * @param {boolean} [opts.forceTerminal] – Skip retry scheduling; go straight to FAILED.
 */
function markFailed(jobId, errorMessage, { forceTerminal = false } = {}) {
  const job = _get(jobId);
  _assertState(job, [STATES.RUNNING, STATES.RETRYING]);

  const canRetry = !forceTerminal && job.attempt < job.maxTries;

  job.error     = errorMessage || 'Unknown error';
  job.updatedAt = _now();

  if (canRetry) {
    const delayMs      = _computeBackoff(job.attempt);
    job.state          = STATES.RETRYING;
    job.nextRetryAt    = new Date(Date.now() + delayMs).toISOString();
    _pushHistory(job, STATES.RETRYING, { delayMs });

    _log(job.correlationId, 'warn', 'JobStateMachine', 'Job failed — scheduling retry', {
      jobId, stepName: job.stepName, attempt: job.attempt, maxTries: job.maxTries, delayMs,
    });
  } else {
    job.state      = STATES.FAILED;
    job.finishedAt = _now();
    _pushHistory(job, STATES.FAILED);

    _log(job.correlationId, 'error', 'JobStateMachine', 'Job failed — no more retries', {
      jobId, stepName: job.stepName, attempt: job.attempt, error: job.error,
    });
  }

  return job;
}

/**
 * Transition a FAILED job → ROLLED_BACK.
 * Call when a compensating action has been performed.
 */
function markRolledBack(jobId, compensatingAction = null) {
  const job = _get(jobId);
  _assertState(job, [STATES.FAILED]);

  job.state      = STATES.ROLLED_BACK;
  job.updatedAt  = _now();
  _pushHistory(job, STATES.ROLLED_BACK, { compensatingAction });

  _log(job.correlationId, 'info', 'JobStateMachine', 'Job rolled back', {
    jobId, stepName: job.stepName, compensatingAction,
  });
  return job;
}

// ── Queries ────────────────────────────────────────────────────────────────

/** Return a single job by ID or throw. */
function getJob(jobId) {
  return _get(jobId);
}

/** Return all jobs for a given correlationId. */
function getJobsByCorrelation(correlationId) {
  return Array.from(_store.values()).filter(j => j.correlationId === correlationId);
}

/** Return all jobs in RETRYING state whose nextRetryAt is in the past. */
function getDueRetries() {
  const now = Date.now();
  return Array.from(_store.values()).filter(j =>
    j.state === STATES.RETRYING && new Date(j.nextRetryAt).getTime() <= now
  );
}

/**
 * Structured metrics for dashboards / Prometheus.
 *
 * @returns {{ total, byState, stepBreakdown, retryRate, failureRate }}
 */
function getMetrics() {
  const all    = Array.from(_store.values());
  const total  = all.length;
  const byState = {
    [STATES.PENDING]:     0,
    [STATES.RUNNING]:     0,
    [STATES.SUCCEEDED]:   0,
    [STATES.FAILED]:      0,
    [STATES.RETRYING]:    0,
    [STATES.ROLLED_BACK]: 0,
  };
  const stepBreakdown = {};

  for (const job of all) {
    byState[job.state] = (byState[job.state] || 0) + 1;
    if (!stepBreakdown[job.stepName]) {
      stepBreakdown[job.stepName] = {
        total: 0, succeeded: 0, failed: 0, retrying: 0, avgAttempts: 0,
      };
    }
    const sb = stepBreakdown[job.stepName];
    sb.total += 1;
    if (job.state === STATES.SUCCEEDED)  sb.succeeded += 1;
    if (job.state === STATES.FAILED)     sb.failed    += 1;
    if (job.state === STATES.RETRYING)   sb.retrying  += 1;
    sb.avgAttempts = (sb.avgAttempts * (sb.total - 1) + job.attempt) / sb.total;
  }

  const finished    = byState[STATES.SUCCEEDED] + byState[STATES.FAILED];
  const retryRate   = finished > 0
    ? all.filter(j => j.attempt > 1).length / finished
    : 0;
  const failureRate = finished > 0
    ? byState[STATES.FAILED] / finished
    : 0;

  return {
    total,
    byState,
    stepBreakdown,
    retryRate:   parseFloat(retryRate.toFixed(4)),
    failureRate: parseFloat(failureRate.toFixed(4)),
  };
}

/** Flush all jobs (for tests / graceful restart). */
function reset() {
  _store.clear();
  _idempotencyIndex.clear();
}

// ── Internal helpers ───────────────────────────────────────────────────────

function _get(jobId) {
  const job = _store.get(jobId);
  if (!job) throw new Error(`Job not found: ${jobId}`);
  return job;
}

function _assertState(job, allowed) {
  if (!allowed.includes(job.state)) {
    throw new Error(
      `Invalid transition for job ${job.id} (${job.stepName}): ` +
      `state=${job.state}, allowed=${allowed.join('|')}`
    );
  }
}

function _pushHistory(job, state, extra = {}) {
  job.history.push({ state, ts: _now(), attempt: job.attempt, ...extra });
  // Cap history to last 20 entries to prevent unbounded growth.
  if (job.history.length > 20) job.history = job.history.slice(-20);
}

// ── Exports ────────────────────────────────────────────────────────────────

module.exports = {
  STATES,
  createJob,
  markRunning,
  markSucceeded,
  markFailed,
  markRolledBack,
  getJob,
  getJobsByCorrelation,
  getDueRetries,
  getMetrics,
  reset,
  // Expose for testing
  _store,
  _idempotencyIndex,
};
