'use strict';

/**
 * tests/master-loop.test.js
 *
 * Unit tests for the self-healing automation system:
 *   • backend/services/job-state-machine.js  (state machine, retries, metrics)
 *   • backend/services/master-loop.js        (step runner, correlation IDs)
 *
 * Uses only Node.js built-in modules (assert) — no external test framework.
 * Run standalone: node tests/master-loop.test.js
 * Also executed by tests/run-all.js
 */

const assert     = require('assert');
const fs         = require('fs');
const os         = require('os');
const path       = require('path');

const jobSM      = require(path.resolve(__dirname, '../backend/services/job-state-machine'));
const masterLoop = require(path.resolve(__dirname, '../backend/services/master-loop'));

// ── Minimal test helpers (same pattern as other test files in this repo) ──

let passed = 0;
let failed = 0;
const failures = [];

async function it(label, fn) {
  try {
    await fn();
    console.log(`  \u2713 ${label}`);
    passed++;
  } catch (err) {
    console.error(`  \u2717 ${label}`);
    console.error(`    ${err.message}`);
    failed++;
    failures.push({ label, error: err.message });
  }
}

// Reset state machine between groups of tests
function resetSM() {
  jobSM.reset();
}

// ── Main test runner ──────────────────────────────────────────────────────
(async () => {

  // ════════════════════════════════════════════════════════════════════════
  // job-state-machine — state transitions
  // ════════════════════════════════════════════════════════════════════════
  console.log('\nJobStateMachine — state transitions:');

  await it('STATES constant exposes all 6 states', async () => {
    const { STATES } = jobSM;
    assert.strictEqual(STATES.PENDING,     'PENDING');
    assert.strictEqual(STATES.RUNNING,     'RUNNING');
    assert.strictEqual(STATES.SUCCEEDED,   'SUCCEEDED');
    assert.strictEqual(STATES.FAILED,      'FAILED');
    assert.strictEqual(STATES.RETRYING,    'RETRYING');
    assert.strictEqual(STATES.ROLLED_BACK, 'ROLLED_BACK');
  });

  await it('createJob returns a PENDING job with correct fields', async () => {
    resetSM();
    const { created, job } = jobSM.createJob({
      stepName:      'testStep',
      correlationId: 'corr-001',
    });
    assert.ok(created);
    assert.strictEqual(job.state, jobSM.STATES.PENDING);
    assert.strictEqual(job.stepName, 'testStep');
    assert.strictEqual(job.correlationId, 'corr-001');
    assert.strictEqual(job.attempt, 0);
    assert.ok(job.id.startsWith('job_'));
    assert.ok(Array.isArray(job.history));
  });

  await it('idempotent re-submit returns existing job without creating a new one', async () => {
    resetSM();
    const { job: first } = jobSM.createJob({
      stepName: 'idempotentStep', correlationId: 'corr-idem',
      idempotencyKey: 'my-stable-key',
    });
    const { created, job: second } = jobSM.createJob({
      stepName: 'idempotentStep', correlationId: 'corr-idem',
      idempotencyKey: 'my-stable-key',
    });
    assert.strictEqual(created, false);
    assert.strictEqual(first.id, second.id);
  });

  await it('PENDING → RUNNING transition increments attempt', async () => {
    resetSM();
    const { job } = jobSM.createJob({ stepName: 'step', correlationId: 'c1' });
    const running  = jobSM.markRunning(job.id);
    assert.strictEqual(running.state, jobSM.STATES.RUNNING);
    assert.strictEqual(running.attempt, 1);
    assert.ok(running.startedAt);
  });

  await it('RUNNING → SUCCEEDED records finishedAt and result', async () => {
    resetSM();
    const { job } = jobSM.createJob({ stepName: 'step', correlationId: 'c2' });
    jobSM.markRunning(job.id);
    const done = jobSM.markSucceeded(job.id, { ok: true });
    assert.strictEqual(done.state, jobSM.STATES.SUCCEEDED);
    assert.ok(done.finishedAt);
    assert.deepStrictEqual(done.result, { ok: true });
  });

  await it('RUNNING → FAILED schedules RETRYING when attempts remain', async () => {
    resetSM();
    const { job } = jobSM.createJob({ stepName: 'step', correlationId: 'c3', maxTries: 3 });
    jobSM.markRunning(job.id);
    const retrying = jobSM.markFailed(job.id, 'transient error');
    assert.strictEqual(retrying.state, jobSM.STATES.RETRYING);
    assert.ok(retrying.nextRetryAt);
    assert.strictEqual(retrying.error, 'transient error');
  });

  await it('RUNNING → FAILED goes to terminal FAILED when maxTries exhausted', async () => {
    resetSM();
    const { job } = jobSM.createJob({ stepName: 'step', correlationId: 'c4', maxTries: 1 });
    jobSM.markRunning(job.id);
    const terminal = jobSM.markFailed(job.id, 'hard error');
    assert.strictEqual(terminal.state, jobSM.STATES.FAILED);
    assert.ok(terminal.finishedAt);
  });

  await it('forceTerminal skips retry scheduling regardless of remaining attempts', async () => {
    resetSM();
    const { job } = jobSM.createJob({ stepName: 'step', correlationId: 'c5', maxTries: 5 });
    jobSM.markRunning(job.id);
    const terminal = jobSM.markFailed(job.id, 'fatal', { forceTerminal: true });
    assert.strictEqual(terminal.state, jobSM.STATES.FAILED);
  });

  await it('FAILED → ROLLED_BACK records compensating action in history', async () => {
    resetSM();
    const { job } = jobSM.createJob({ stepName: 'step', correlationId: 'c6', maxTries: 1 });
    jobSM.markRunning(job.id);
    jobSM.markFailed(job.id, 'err');
    const rolled = jobSM.markRolledBack(job.id, 'undo-payment');
    assert.strictEqual(rolled.state, jobSM.STATES.ROLLED_BACK);
    const lastEntry = rolled.history[rolled.history.length - 1];
    assert.strictEqual(lastEntry.compensatingAction, 'undo-payment');
  });

  await it('invalid transition throws an informative error', async () => {
    resetSM();
    const { job } = jobSM.createJob({ stepName: 'step', correlationId: 'c7' });
    // PENDING → SUCCEEDED is invalid (must go through RUNNING)
    assert.throws(
      () => jobSM.markSucceeded(job.id),
      /Invalid transition/
    );
  });

  await it('getJob throws for unknown ID', async () => {
    resetSM();
    assert.throws(() => jobSM.getJob('nonexistent-id'), /Job not found/);
  });

  await it('getJobsByCorrelation filters by correlationId', async () => {
    resetSM();
    jobSM.createJob({ stepName: 'a', correlationId: 'grp-A' });
    jobSM.createJob({ stepName: 'b', correlationId: 'grp-A' });
    jobSM.createJob({ stepName: 'c', correlationId: 'grp-B' });
    const groupA = jobSM.getJobsByCorrelation('grp-A');
    assert.strictEqual(groupA.length, 2);
    assert.ok(groupA.every(j => j.correlationId === 'grp-A'));
  });

  await it('getDueRetries returns only RETRYING jobs past nextRetryAt', async () => {
    resetSM();
    const { job } = jobSM.createJob({ stepName: 'step', correlationId: 'cDue', maxTries: 2 });
    jobSM.markRunning(job.id);
    jobSM.markFailed(job.id, 'err'); // → RETRYING
    // Backdate nextRetryAt so it is in the past
    jobSM._store.get(job.id).nextRetryAt = new Date(Date.now() - 1000).toISOString();

    const due = jobSM.getDueRetries();
    assert.ok(due.some(j => j.id === job.id));
  });

  await it('history is capped at 20 entries to prevent unbounded growth', async () => {
    resetSM();
    const { job } = jobSM.createJob({ stepName: 'step', correlationId: 'cHist', maxTries: 100 });

    // Drive through many transitions to generate > 20 history entries
    for (let i = 0; i < 25; i++) {
      jobSM.markRunning(job.id);
      jobSM.markFailed(job.id, 'err'); // RETRYING
    }

    const stored = jobSM._store.get(job.id);
    assert.ok(stored.history.length <= 20, `History should be capped at 20, got ${stored.history.length}`);
  });

  // ════════════════════════════════════════════════════════════════════════
  // job-state-machine — metrics
  // ════════════════════════════════════════════════════════════════════════
  console.log('\nJobStateMachine — metrics:');

  await it('getMetrics returns correct counts across states', async () => {
    resetSM();
    // 1 SUCCEEDED
    const j1 = jobSM.createJob({ stepName: 's1', correlationId: 'mCorr' }).job;
    jobSM.markRunning(j1.id);
    jobSM.markSucceeded(j1.id);
    // 1 FAILED
    const j2 = jobSM.createJob({ stepName: 's2', correlationId: 'mCorr', maxTries: 1 }).job;
    jobSM.markRunning(j2.id);
    jobSM.markFailed(j2.id, 'err');
    // 1 PENDING
    jobSM.createJob({ stepName: 's3', correlationId: 'mCorr' });

    const m = jobSM.getMetrics();
    assert.strictEqual(m.total, 3);
    assert.strictEqual(m.byState.SUCCEEDED, 1);
    assert.strictEqual(m.byState.FAILED, 1);
    assert.strictEqual(m.byState.PENDING, 1);
    assert.ok(m.failureRate >= 0 && m.failureRate <= 1);
    assert.ok(typeof m.retryRate === 'number');
  });

  await it('getMetrics stepBreakdown tracks per-step counts', async () => {
    resetSM();
    for (let i = 0; i < 3; i++) {
      const { job } = jobSM.createJob({ stepName: 'repeatStep', correlationId: `rc${i}` });
      jobSM.markRunning(job.id);
      jobSM.markSucceeded(job.id);
    }
    const m = jobSM.getMetrics();
    assert.ok(m.stepBreakdown['repeatStep']);
    assert.strictEqual(m.stepBreakdown['repeatStep'].succeeded, 3);
    assert.strictEqual(m.stepBreakdown['repeatStep'].total, 3);
  });

  await it('failureRate is 0.5 when half the finished jobs failed', async () => {
    resetSM();
    const jOk = jobSM.createJob({ stepName: 'x', correlationId: 'fr1' }).job;
    jobSM.markRunning(jOk.id);
    jobSM.markSucceeded(jOk.id);

    const jFail = jobSM.createJob({ stepName: 'x', correlationId: 'fr2', maxTries: 1 }).job;
    jobSM.markRunning(jFail.id);
    jobSM.markFailed(jFail.id, 'err');

    const m = jobSM.getMetrics();
    assert.strictEqual(m.failureRate, 0.5);
  });

  // ════════════════════════════════════════════════════════════════════════
  // master-loop — step runner integration
  // ════════════════════════════════════════════════════════════════════════
  console.log('\nMasterLoop — step runner integration:');

  await it('runSelfHealing returns a result with correlationId and step counts', async () => {
    resetSM();
    masterLoop.stop(); // ensure no interval is running

    const result = await masterLoop.runSelfHealing();
    assert.ok(result, 'result should not be null');
    assert.ok(typeof result.correlationId === 'string');
    assert.ok(result.correlationId.startsWith('loop_'));
    assert.ok(typeof result.succeeded === 'number');
    assert.ok(typeof result.failed === 'number');
    assert.ok(Array.isArray(result.stepResults));
    assert.ok(result.stepResults.length > 0);
  });

  await it('each stepResult entry has name, state, and attempts fields', async () => {
    resetSM();
    const result = await masterLoop.runSelfHealing();
    for (const sr of result.stepResults) {
      assert.ok(typeof sr.name === 'string',     `name missing in ${JSON.stringify(sr)}`);
      assert.ok(typeof sr.state === 'string',    `state missing in ${JSON.stringify(sr)}`);
      assert.ok(typeof sr.attempts === 'number', `attempts missing in ${JSON.stringify(sr)}`);
    }
  });

  await it('getMetrics exposed on masterLoop returns a structured object', async () => {
    resetSM();
    const m = masterLoop.getMetrics();
    assert.ok(typeof m === 'object');
    assert.ok(typeof m.total === 'number');
    assert.ok(typeof m.byState === 'object');
    assert.ok(typeof m.failureRate === 'number');
  });

  await it('two runSelfHealing calls produce distinct correlationIds', async () => {
    resetSM();
    const r1 = await masterLoop.runSelfHealing();
    const r2 = await masterLoop.runSelfHealing();
    assert.notStrictEqual(r1.correlationId, r2.correlationId);
  });

  await it('enqueuePatch + runFilePatch step applies a patch', async () => {
    resetSM();
    const tmpFile = path.join(os.tmpdir(), `patch-test-${Date.now()}.txt`);
    fs.writeFileSync(tmpFile, 'Hello OLD world\n', 'utf8');

    masterLoop.enqueuePatch({
      filePath:   tmpFile,
      oldContent: 'OLD',
      newContent: 'NEW',
    });

    await masterLoop.steps.runFilePatch();

    const result = fs.readFileSync(tmpFile, 'utf8');
    fs.unlinkSync(tmpFile);

    assert.ok(result.includes('NEW'), 'Patch should replace OLD with NEW');
    assert.ok(!result.includes('OLD'), 'OLD should no longer appear');
  });

  await it('runFilePatch is a no-op when queue is empty', async () => {
    resetSM();
    // Should not throw even with an empty patch queue
    await masterLoop.steps.runFilePatch();
  });

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`\nResults: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    console.error('\nFailures:');
    for (const { label, error } of failures) {
      console.error(`  \u2717 ${label}: ${error}`);
    }
    process.exit(1);
  }
})();
