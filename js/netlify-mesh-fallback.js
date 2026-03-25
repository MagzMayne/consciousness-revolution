// RootIB: RB-20260325000000-NODE-RELAY-FALLBACK
/**
 * netlify-mesh-fallback.js
 * ════════════════════════════════════════════════════════════════════════════
 * © 2024-2026 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Browser-side fallback shim for Netlify function calls.
 *
 * When a Netlify function call fails because of:
 *   • 429  Too Many Requests  (rate-limit / API credit exhausted)
 *   • 402  Payment Required   (API credits exhausted)
 *   • 503  Service Unavailable
 *   • Network / CORS failure
 *
 * …this module queues the failed call as a task in the
 * `node-relay` backend function and polls for a result from an idle
 * ezAutobots mesh node (https://barbrickdesign.github.io/ezAutobots.html).
 *
 * PUBLIC API (window.NetlifyMeshFallback):
 *   NetlifyMeshFallback.fetch(url, options)       → Promise<Response>
 *   NetlifyMeshFallback.submitTask(type, payload, opts) → Promise<{taskId}>
 *   NetlifyMeshFallback.pollResult(taskId, opts)  → Promise<any>
 *   NetlifyMeshFallback.getStats()                → Promise<Object>
 *   NetlifyMeshFallback.onEvent(fn)               → void   (lifecycle events)
 *   NetlifyMeshFallback.offEvent(fn)              → void
 *
 * EVENTS emitted via onEvent():
 *   { type:'fallback_triggered', url, reason, taskId }
 *   { type:'result_received',    taskId, result }
 *   { type:'fallback_failed',    taskId, error }
 *   { type:'queue_stats',        stats }
 *
 * Drop-in usage:
 *   Replace:  const res = await fetch('/api/araya-chat', opts);
 *   With:     const res = await NetlifyMeshFallback.fetch('/api/araya-chat', opts);
 */

(function (global) {
  'use strict';

  /* ── Configuration ───────────────────────────────────────────── */

  /** Base URL of the node-relay Netlify function */
  var RELAY_BASE = '/api/node-relay';

  /** HTTP status codes that trigger the mesh fallback */
  var FALLBACK_STATUS_CODES = [402, 429, 503];

  /** Polling interval when waiting for a mesh result (ms) */
  var POLL_INTERVAL_MS = 2500;

  /** Maximum time to wait for a mesh node to complete a task (ms).
   *  45 s balances reliability (nodes may take time to pick up work) with
   *  acceptable UX degradation.  Override per-call with opts.timeoutMs. */
  var POLL_TIMEOUT_MS = 45_000;

  /** Pause before first poll attempt (gives nodes a moment to pick up) */
  var POLL_INITIAL_DELAY_MS = 1500;

  /* ── Internal state ──────────────────────────────────────────── */

  var _handlers = [];   // lifecycle event listeners

  /* ── Logging ─────────────────────────────────────────────────── */

  function log(msg, level) {
    var prefix = '[NetlifyMeshFallback] ';
    if (level === 'warn')  { console.warn(prefix + msg);  return; }
    if (level === 'error') { console.error(prefix + msg); return; }
    console.log(prefix + msg);
  }

  /* ── Event bus ───────────────────────────────────────────────── */

  function emit(evt) {
    for (var i = 0; i < _handlers.length; i++) {
      try { _handlers[i](evt); } catch (_) {}
    }
    if (global.document && global.document.dispatchEvent) {
      try {
        global.document.dispatchEvent(
          new CustomEvent('netlifyMeshFallback', { detail: evt })
        );
      } catch (_) {}
    }
  }

  /* ── Core: submit a task to the relay ───────────────────────── */

  /**
   * Submit a task to the node-relay queue.
   *
   * @param {string} type     - Task type identifier (e.g. 'relay-request', 'echo')
   * @param {*}      payload  - JSON-serialisable task payload
   * @param {Object} [opts]
   * @param {'low'|'normal'|'high'} [opts.priority='normal']
   * @param {string} [opts.originUrl]   - Source Netlify function URL (diagnostics)
   * @param {string} [opts.reason]      - Why the fallback was triggered
   * @returns {Promise<{taskId: string}>}
   */
  async function submitTask(type, payload, opts) {
    opts = opts || {};
    var body = {
      type:      type,
      payload:   payload,
      priority:  opts.priority  || 'normal',
      originUrl: opts.originUrl || null,
      reason:    opts.reason    || null,
    };

    var res = await global.fetch(RELAY_BASE + '/submit', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error('node-relay /submit failed: HTTP ' + res.status);
    }

    var data = await res.json();
    if (!data.taskId) throw new Error('node-relay returned no taskId');
    return { taskId: data.taskId };
  }

  /* ── Core: poll for a task result ───────────────────────────── */

  /**
   * Poll the relay until a task completes or times out.
   *
   * @param {string} taskId
   * @param {Object} [opts]
   * @param {number} [opts.timeoutMs]  - Override poll timeout
   * @param {number} [opts.intervalMs] - Override poll interval
   * @returns {Promise<any>} Resolved with the task result
   */
  function pollResult(taskId, opts) {
    opts = opts || {};
    var timeout  = opts.timeoutMs  || POLL_TIMEOUT_MS;
    var interval = opts.intervalMs || POLL_INTERVAL_MS;
    var deadline = Date.now() + timeout;

    return new Promise(function (resolve, reject) {
      function check() {
        if (Date.now() >= deadline) {
          reject(new Error('Mesh fallback timed out waiting for task ' + taskId));
          return;
        }

        global.fetch(RELAY_BASE + '/status/' + encodeURIComponent(taskId))
          .then(function (res) { return res.json(); })
          .then(function (data) {
            if (data.status === 'complete') {
              resolve(data.result);
            } else if (data.status === 'failed') {
              reject(new Error('Mesh node failed to process task: ' + (data.errorMsg || 'unknown error')));
            } else {
              // pending or in-progress — keep polling
              setTimeout(check, interval);
            }
          })
          .catch(function (err) {
            // Transient fetch error — keep polling until deadline
            log('Poll error for ' + taskId + ': ' + err.message, 'warn');
            setTimeout(check, interval);
          });
      }

      setTimeout(check, POLL_INITIAL_DELAY_MS);
    });
  }

  /* ── Core: fetch wrapper ─────────────────────────────────────── */

  /**
   * Drop-in replacement for fetch() that automatically falls back to the
   * ezAutobots mesh when Netlify function calls fail.
   *
   * The fallback encodes the failed request as a 'relay-request' task.
   * Mesh nodes that support the 'relay-request' type re-issue the HTTP
   * request (GET only, to safe public endpoints) and return the response.
   * For non-GET or secured requests the task type is 'queued-payload',
   * meaning the mesh node can process the payload directly without
   * needing secrets.
   *
   * @param {string|URL} url
   * @param {RequestInit} [options]
   * @returns {Promise<Response>}
   */
  async function wrappedFetch(url, options) {
    var urlStr  = typeof url === 'string' ? url : url.toString();
    var method  = (options && options.method ? options.method : 'GET').toUpperCase();

    // 1️⃣  Try the primary Netlify call first
    var primaryOk   = false;
    var primaryRes  = null;
    var failReason  = null;

    try {
      primaryRes = await global.fetch(url, options);

      if (FALLBACK_STATUS_CODES.indexOf(primaryRes.status) === -1) {
        // Success or a non-retriable error — return as-is
        return primaryRes;
      }
      // Rate-limit / payment / unavailable — fall through to mesh
      failReason = 'HTTP ' + primaryRes.status;
    } catch (err) {
      // Network / CORS failure
      failReason = 'network_error: ' + err.message;
    }

    // 2️⃣  Build mesh task payload
    var requestPayload = { url: urlStr, method: method };
    if (options && options.body) {
      try {
        requestPayload.body = (typeof options.body === 'string')
          ? JSON.parse(options.body)
          : options.body;
      } catch (_) {
        // Body is not JSON-parseable.  Do not send raw body to mesh nodes
        // to avoid inadvertently exposing sensitive data (passwords, keys, PII).
        // Queue the task type as 'queued-payload' without body content.
        requestPayload.bodyParseError = true;
      }
    }
    if (options && options.headers) {
      // Use an allowlist approach — only forward safe, non-auth headers to nodes.
      var safeHeaders = {};
      var h = options.headers;
      var SAFE_HEADER_RE = /^(content-type|accept|accept-language|cache-control|x-requested-with)$/i;
      var keys = Object.keys(h);
      for (var i = 0; i < keys.length; i++) {
        if (SAFE_HEADER_RE.test(keys[i])) {
          safeHeaders[keys[i]] = h[keys[i]];
        }
      }
      requestPayload.headers = safeHeaders;
    }

    var taskType = (method === 'GET') ? 'relay-request' : 'queued-payload';

    log('Falling back to mesh for ' + urlStr + ' (reason: ' + failReason + ')');

    // 3️⃣  Submit task to node-relay
    var taskId;
    try {
      var submitted = await submitTask(taskType, requestPayload, {
        priority:  'normal',
        originUrl: urlStr,
        reason:    failReason,
      });
      taskId = submitted.taskId;
    } catch (relayErr) {
      log('Could not submit fallback task: ' + relayErr.message, 'error');
      // Re-throw or return original failed response so callers can handle it
      if (primaryRes) return primaryRes;
      throw relayErr;
    }

    emit({ type: 'fallback_triggered', url: urlStr, reason: failReason, taskId: taskId });

    // 4️⃣  Poll for result
    try {
      var result = await pollResult(taskId);
      emit({ type: 'result_received', taskId: taskId, result: result });

      // Wrap result in a synthetic Response so callers get the same interface
      var body  = typeof result === 'string' ? result : JSON.stringify(result);
      var headers = new Headers({ 'Content-Type': 'application/json', 'X-Mesh-Relay': 'true', 'X-Task-Id': taskId });
      return new Response(body, { status: 200, headers: headers });
    } catch (pollErr) {
      emit({ type: 'fallback_failed', taskId: taskId, error: pollErr.message });
      log('Mesh fallback failed for ' + taskId + ': ' + pollErr.message, 'error');

      // Return original response if we have it, otherwise re-throw
      if (primaryRes) return primaryRes;
      throw pollErr;
    }
  }

  /* ── Stats helper ────────────────────────────────────────────── */

  async function getStats() {
    var res = await global.fetch(RELAY_BASE + '/stats');
    if (!res.ok) throw new Error('Could not fetch relay stats: HTTP ' + res.status);
    return res.json();
  }

  /* ── Public API ──────────────────────────────────────────────── */

  var NetlifyMeshFallback = {
    fetch:      wrappedFetch,
    submitTask: submitTask,
    pollResult: pollResult,
    getStats:   getStats,

    onEvent: function (fn) {
      if (typeof fn === 'function') _handlers.push(fn);
    },
    offEvent: function (fn) {
      _handlers = _handlers.filter(function (h) { return h !== fn; });
    },

    /** Relay backend base URL (can be overridden for testing) */
    get relayBase()         { return RELAY_BASE; },
    set relayBase(v)        { RELAY_BASE = String(v); },

    /** Which HTTP status codes trigger the mesh fallback */
    get fallbackCodes()     { return FALLBACK_STATUS_CODES.slice(); },
    set fallbackCodes(arr)  { FALLBACK_STATUS_CODES = arr.slice(); },
  };

  global.NetlifyMeshFallback = NetlifyMeshFallback;

  log('Loaded — relay base: ' + RELAY_BASE);

}(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this));
