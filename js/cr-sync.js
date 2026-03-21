/**
 * cr-sync.js — Cross-Site Sync Module
 * Bridges barbrickdesign.github.io ↔ consciousnessrevolution.io
 *
 * Provides:
 *  - CRSync.init()          — bootstraps the sync channel
 *  - CRSync.getState()      — returns merged state from both origins
 *  - CRSync.broadcast()     — posts a message to the paired origin
 *  - CRSync.onMessage()     — register a cross-origin message handler
 *  - CRSync.syncUser()      — persists auth identity across both domains
 *  - CRSync.listDevs()      — returns cached dev roster
 */

(function (global) {
  'use strict';

  /* ── Known paired origins ──────────────────────────────────── */
  const ORIGINS = {
    barbrick: 'https://barbrickdesign.github.io',
    cr:       'https://consciousnessrevolution.io',
  };

  /* ── Internal state ────────────────────────────────────────── */
  const _state = {
    currentOrigin: null,
    pairedOrigin:  null,
    handlers:      [],
    devRoster:     [],
    user:          null,
    channel:       null, // BroadcastChannel when same-origin, null for cross-origin
    ready:         false,
  };

  /* ── Helpers ───────────────────────────────────────────────── */
  function _resolveOrigins() {
    const host = global.location ? global.location.origin : '';
    if (host.includes('barbrickdesign.github.io')) {
      _state.currentOrigin = ORIGINS.barbrick;
      _state.pairedOrigin  = ORIGINS.cr;
    } else if (host.includes('consciousnessrevolution.io') || host.includes('conciousnessrevolution.io')) {
      _state.currentOrigin = ORIGINS.cr;
      _state.pairedOrigin  = ORIGINS.barbrick;
    } else {
      // local dev / unknown — treat as barbrick
      _state.currentOrigin = host || ORIGINS.barbrick;
      _state.pairedOrigin  = ORIGINS.cr;
    }
  }

  function _log(msg, data) {
    if (global.console) {
      console.log('[CR-Sync] ' + msg, data !== undefined ? data : '');
    }
  }

  function _storageKey(key) {
    return 'cr_sync__' + key;
  }

  function _saveLocal(key, value) {
    try {
      sessionStorage.setItem(_storageKey(key), JSON.stringify(value));
    } catch (_) {}
  }

  function _loadLocal(key) {
    try {
      const raw = sessionStorage.getItem(_storageKey(key));
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  /* ── Message handler ───────────────────────────────────────── */
  function _handleMessage(event) {
    // Only accept messages from our paired domains
    const allowed = [ORIGINS.barbrick, ORIGINS.cr];
    if (!allowed.includes(event.origin) && !event.origin.includes('localhost')) {
      return;
    }

    let payload;
    try {
      payload = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
    } catch (_) {
      return;
    }

    if (!payload || payload.__crSync !== true) return;

    _log('Received cross-origin message', payload);

    // Merge dev roster if provided
    if (Array.isArray(payload.devRoster)) {
      _mergeDevRoster(payload.devRoster);
    }

    // Merge user session if provided
    if (payload.user) {
      _state.user = Object.assign({}, _state.user || {}, payload.user);
      _saveLocal('user', _state.user);
    }

    // Dispatch to registered handlers
    _state.handlers.forEach(function (fn) {
      try { fn(payload, event.origin); } catch (_) {}
    });
  }

  /* ── Dev roster ────────────────────────────────────────────── */
  function _mergeDevRoster(incoming) {
    const existingIds = _state.devRoster.map(function (d) { return d.id; });
    incoming.forEach(function (dev) {
      if (!existingIds.includes(dev.id)) {
        _state.devRoster.push(dev);
      } else {
        // Update existing entry
        const idx = _state.devRoster.findIndex(function (d) { return d.id === dev.id; });
        if (idx !== -1) _state.devRoster[idx] = Object.assign({}, _state.devRoster[idx], dev);
      }
    });
    _saveLocal('devRoster', _state.devRoster);
  }

  /* ── BroadcastChannel (same-tab reload / same-domain sub-pages) ── */
  function _initBroadcast() {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        _state.channel = new BroadcastChannel('cr_sync_channel');
        _state.channel.onmessage = function (e) { _handleMessage(e); };
        _log('BroadcastChannel active');
      } catch (_) {}
    }
  }

  /* ── Public API ────────────────────────────────────────────── */
  const CRSync = {

    /**
     * Bootstrap the sync module.
     * Call once on page load.
     */
    init: function () {
      if (_state.ready) return this;

      _resolveOrigins();
      _log('Initialising', { current: _state.currentOrigin, paired: _state.pairedOrigin });

      // Restore cached state
      const cachedRoster = _loadLocal('devRoster');
      if (Array.isArray(cachedRoster)) _state.devRoster = cachedRoster;

      const cachedUser = _loadLocal('user');
      if (cachedUser) _state.user = cachedUser;

      // Listen for postMessage events
      if (global.addEventListener) {
        global.addEventListener('message', _handleMessage, false);
      }

      _initBroadcast();

      _state.ready = true;
      _log('Ready');
      return this;
    },

    /**
     * Broadcast a payload to the paired origin (via cross-origin postMessage).
     * Also echoes through the BroadcastChannel for same-domain pages.
     *
     * @param {Object} data - arbitrary payload (will be stamped with __crSync flag)
     * @param {Window} [targetWindow] - optional window reference (e.g. an embedded iframe)
     */
    broadcast: function (data, targetWindow) {
      const payload = Object.assign({}, data, {
        __crSync:      true,
        _fromOrigin:   _state.currentOrigin,
        _ts:           Date.now(),
      });

      // postMessage to explicit target or parent/opener
      const targets = [];
      if (targetWindow) {
        targets.push(targetWindow);
      } else {
        if (global.parent && global.parent !== global) targets.push(global.parent);
        if (global.opener) targets.push(global.opener);
      }

      targets.forEach(function (win) {
        try {
          win.postMessage(JSON.stringify(payload), _state.pairedOrigin);
          _log('postMessage sent to', _state.pairedOrigin);
        } catch (_) {}
      });

      // BroadcastChannel echo
      if (_state.channel) {
        try { _state.channel.postMessage(payload); } catch (_) {}
      }

      return this;
    },

    /**
     * Register a handler for incoming cross-origin messages.
     *
     * @param {Function} fn - called with (payload, senderOrigin)
     */
    onMessage: function (fn) {
      if (typeof fn === 'function') _state.handlers.push(fn);
      return this;
    },

    /**
     * Persist the current user's identity so both domains share it.
     *
     * @param {Object} userObj - { id, email, username, tier, … }
     */
    syncUser: function (userObj) {
      _state.user = Object.assign({}, _state.user || {}, userObj);
      _saveLocal('user', _state.user);
      this.broadcast({ user: _state.user });
      _log('User synced', _state.user);
      return this;
    },

    /**
     * Return the cached developer roster (merged from both origins).
     *
     * @returns {Array}
     */
    listDevs: function () {
      return [].concat(_state.devRoster);
    },

    /**
     * Add or update a developer in the local roster and broadcast.
     *
     * @param {Object} dev - { id, name, role, origin, … }
     */
    registerDev: function (dev) {
      if (!dev || !dev.id) { _log('registerDev: missing id'); return this; }
      _mergeDevRoster([dev]);
      this.broadcast({ devRoster: [dev] });
      _log('Dev registered', dev);
      return this;
    },

    /**
     * Returns a snapshot of the internal sync state.
     */
    getState: function () {
      return {
        currentOrigin: _state.currentOrigin,
        pairedOrigin:  _state.pairedOrigin,
        ready:         _state.ready,
        user:          _state.user,
        devCount:      _state.devRoster.length,
      };
    },

    /**
     * Open the paired site in a new tab with a handshake token.
     * Useful for seamless cross-site navigation.
     *
     * NOTE: The handshake token is base64-encoded, not encrypted.
     * Only include non-sensitive user metadata (id, username, tier) —
     * never include passwords, raw auth tokens, or private keys.
     *
     * @param {string} [path] - path on the paired origin (default: '/')
     */
    openPaired: function (path) {
      const target = _state.pairedOrigin + (path || '/');
      // Only encode non-sensitive profile metadata
      const safeUser = _state.user ? {
        id:       _state.user.id,
        username: _state.user.username,
        tier:     _state.user.tier,
      } : null;
      const token = btoa(JSON.stringify({
        user:   safeUser,
        ts:     Date.now(),
        origin: _state.currentOrigin,
      }));
      const url = target + (target.includes('?') ? '&' : '?') + 'cr_handshake=' + encodeURIComponent(token);
      global.open(url, '_blank');
      return this;
    },

    /**
     * If the page was opened via openPaired(), consume the handshake token
     * and hydrate the user session automatically.
     */
    consumeHandshake: function () {
      if (!global.location) return this;
      const params = new URLSearchParams(global.location.search);
      const raw = params.get('cr_handshake');
      if (!raw) return this;

      try {
        const data = JSON.parse(atob(decodeURIComponent(raw)));
        if (data && data.user) {
          _state.user = Object.assign({}, _state.user || {}, data.user);
          _saveLocal('user', _state.user);
          _log('Handshake consumed, user restored', _state.user);
        }
      } catch (err) {
        _log('Handshake parse failed (token may be malformed or expired)', err && err.message);
      }

      return this;
    },
  };

  /* ── Expose globally ───────────────────────────────────────── */
  global.CRSync = CRSync;

  /* ── Auto-init if DOM is ready ─────────────────────────────── */
  if (document && (document.readyState === 'complete' || document.readyState === 'interactive')) {
    CRSync.init().consumeHandshake();
  } else if (document) {
    document.addEventListener('DOMContentLoaded', function () {
      CRSync.init().consumeHandshake();
    });
  }

}(typeof window !== 'undefined' ? window : this));
