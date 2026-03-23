/**
 * mesh-engine-client.js
 * Browser-side WebSocket client for the consciousness-revolution mesh backend.
 *
 * Handles the five standard backend event types pushed by the Railway service:
 *   meshUpdate      – node registry snapshot
 *   loopUpdate      – self-healing master-loop status
 *   registryUpdate  – agent registry changes
 *   agentHealth     – per-agent health report
 *   heartbeat       – keep-alive ping from backend
 *
 * Auto-injected into all pages by the meshProjectPageAgent (master-loop step 8).
 * Also available as window.MeshEngineClient for manual control.
 *
 * @aul-enabled
 */

(function (global) {
  'use strict';

  /* ── Configuration ────────────────────────────────────────── */
  var RECONNECT_DELAY_MS = 5000;
  var MAX_RECONNECT_TRIES = 10;

  /* ── Internal state ─────────────────────────────────────────── */
  var _ws            = null;
  var _reconnectTry  = 0;
  var _handlers      = {};   // eventType → fn[]
  var _connected     = false;

  /* ── Logging ─────────────────────────────────────────────────── */
  function log(msg) {
    if (typeof console !== 'undefined') {
      console.log('[MeshEngineClient] ' + msg);
    }
  }

  /* ── Event bus ───────────────────────────────────────────────── */
  function emit(eventType, payload) {
    var fns = _handlers[eventType] || [];
    for (var i = 0; i < fns.length; i++) {
      try { fns[i](payload); } catch (err) { log('Handler error for ' + eventType + ': ' + err.message); }
    }
    // Also dispatch as a CustomEvent on document for easy listener attachment
    if (typeof document !== 'undefined' && document.dispatchEvent) {
      document.dispatchEvent(new CustomEvent('meshEngine:' + eventType, { detail: payload }));
    }
  }

  /**
   * Register a handler for a specific backend event type.
   * @param {string} eventType  One of: meshUpdate|loopUpdate|registryUpdate|agentHealth|heartbeat
   * @param {function} fn       Handler function receiving the event payload
   */
  function on(eventType, fn) {
    if (!_handlers[eventType]) _handlers[eventType] = [];
    _handlers[eventType].push(fn);
  }

  /* ── WebSocket connection ──────────────────────────────────────── */

  /**
   * Handle an incoming WebSocket message frame.
   * Expected format: JSON with { type, payload } or { type, data }.
   */
  function handleMessage(raw) {
    var msg;
    try {
      msg = JSON.parse(raw);
    } catch (_) {
      return; // ignore non-JSON frames
    }

    var type    = msg.type || msg.event || '';
    var payload = msg.payload || msg.data || msg;

    switch (type) {
      case 'meshUpdate':
        emit('meshUpdate', payload);
        break;
      case 'loopUpdate':
        emit('loopUpdate', payload);
        break;
      case 'registryUpdate':
        emit('registryUpdate', payload);
        break;
      case 'agentHealth':
        emit('agentHealth', payload);
        break;
      case 'heartbeat':
        emit('heartbeat', payload);
        break;
      default:
        // Pass through unknown event types to generic listeners
        emit(type, payload);
        break;
    }
  }

  /**
   * Connect (or reconnect) to the mesh backend WebSocket endpoint.
   * @param {string} [wsUrl]  Override URL; defaults to auto-detected backend WS URL.
   */
  function connect(wsUrl) {
    if (typeof WebSocket === 'undefined') {
      log('WebSocket not available in this environment — running in headless mode');
      return;
    }

    if (_ws && (_ws.readyState === WebSocket.OPEN || _ws.readyState === WebSocket.CONNECTING)) {
      return; // already connected / connecting
    }

    var url = wsUrl || _resolveWsUrl();
    if (!url) {
      log('No backend WebSocket URL configured — mesh events will not be received');
      return;
    }

    log('Connecting to ' + url + ' (attempt ' + (_reconnectTry + 1) + ')');

    try {
      _ws = new WebSocket(url);
    } catch (err) {
      log('WebSocket construction failed: ' + err.message);
      _scheduleReconnect(url);
      return;
    }

    _ws.onopen = function () {
      _connected   = true;
      _reconnectTry = 0;
      log('Connected');
      emit('meshUpdate', { status: 'connected', ts: new Date().toISOString() });
    };

    _ws.onmessage = function (evt) {
      handleMessage(evt.data);
    };

    _ws.onclose = function (evt) {
      _connected = false;
      log('Disconnected (code=' + evt.code + ') — scheduling reconnect');
      _scheduleReconnect(url);
    };

    _ws.onerror = function () {
      _connected = false;
      // onclose fires after onerror; reconnect is handled there
    };
  }

  function _scheduleReconnect(url) {
    if (_reconnectTry >= MAX_RECONNECT_TRIES) {
      log('Max reconnect attempts reached — giving up');
      return;
    }
    _reconnectTry++;
    setTimeout(function () { connect(url); }, RECONNECT_DELAY_MS);
  }

  function _resolveWsUrl() {
    // If running under a Railway / custom backend deployment, WS_URL may be set
    // via a <meta name="mesh-ws-url"> tag or window.MESH_WS_URL global.
    if (typeof global.MESH_WS_URL === 'string' && global.MESH_WS_URL) {
      return global.MESH_WS_URL;
    }
    if (typeof document !== 'undefined') {
      var meta = document.querySelector('meta[name="mesh-ws-url"]');
      if (meta && meta.content) return meta.content;
    }
    // Default: same host, different port used by server-main.js in dev
    if (typeof global.location !== 'undefined') {
      var proto = global.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return proto + '//' + global.location.hostname + ':3000/mesh';
    }
    return null;
  }

  /** Disconnect and stop reconnecting. */
  function disconnect() {
    _reconnectTry = MAX_RECONNECT_TRIES; // prevent auto-reconnect
    if (_ws) {
      _ws.close();
      _ws = null;
    }
    _connected = false;
    log('Disconnected by client');
  }

  /** Return current connection status. */
  function status() {
    return {
      connected:    _connected,
      readyState:   _ws ? _ws.readyState : -1,
      reconnectTry: _reconnectTry,
    };
  }

  /* ── Public API ───────────────────────────────────────────────── */
  var MeshEngineClient = {
    connect:    connect,
    disconnect: disconnect,
    on:         on,
    status:     status,
    // Expose event type constants for external code
    EVENTS: {
      MESH_UPDATE:      'meshUpdate',
      LOOP_UPDATE:      'loopUpdate',
      REGISTRY_UPDATE:  'registryUpdate',
      AGENT_HEALTH:     'agentHealth',
      HEARTBEAT:        'heartbeat',
    },
  };

  /* ── Auto-connect on DOMContentLoaded ────────────────────────── */
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { connect(); });
    } else {
      connect();
    }
  }

  /* ── Export ─────────────────────────────────────────────────── */
  global.MeshEngineClient = MeshEngineClient;

  // CommonJS / Node.js compatibility (for test environments)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MeshEngineClient;
  }

}(typeof window !== 'undefined' ? window : this));
