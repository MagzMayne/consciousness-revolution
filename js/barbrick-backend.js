/**
 * BarbrickDesign Backend Configuration
 * Routes API calls to the correct backend endpoints:
 *   - Development: localhost:3000 (Node.js server)
 *   - Production:  /api/* (Netlify Functions via netlify.toml redirect)
 *
 * Usage (in any BarbrickDesign HTML tool):
 *   <script src="/js/barbrick-backend.js"></script>
 *   const url = BarbrickBackend.url('/scrollbot/chat');
 *   const resp = await fetch(url, { method: 'POST', ... });
 */

(function (global) {
  'use strict';

  var isDev =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.endsWith('.local') ||
    window.location.port === '8888' ||    // Netlify Dev default
    window.location.port === '3000' ||    // Local dev server
    window.location.port === '4000' ||    // Jekyll / misc dev
    window.location.port === '5000' ||    // Python / misc dev
    window.location.port === '8080' ||    // Common dev port
    (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development');

  var DEV_BASE  = 'http://localhost:3000/api';
  var PROD_BASE = '/api';

  var BarbrickBackend = {
    /** Base URL for all API calls (no trailing slash) */
    base: isDev ? DEV_BASE : PROD_BASE,

    /**
     * Build a full API URL for a given path.
     * @param {string} path - API path, e.g. '/scrollbot/chat'
     * @returns {string} Full URL appropriate for the current environment
     */
    url: function (path) {
      var p = path.startsWith('/') ? path : '/' + path;
      return this.base + p;
    },

    /**
     * Convenience wrapper: fetch from the backend API.
     * @param {string} path  - API path
     * @param {object} opts  - standard fetch options (method, headers, body, …)
     * @returns {Promise<Response>}
     */
    fetch: function (path, opts) {
      return fetch(this.url(path), opts || {});
    },

    /** Service-specific helpers */
    services: {
      /** Micro-TX transaction processing */
      tx: {
        submit:  function (data) { return BarbrickBackend.fetch('/tx/submit',  { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); },
        status:  function (data) { return BarbrickBackend.fetch('/tx/status',  { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); },
        history: function (addr) { return BarbrickBackend.fetch('/tx/history/' + addr); },
      },

      /** Affiliate / referral tracking */
      affiliate: {
        register: function (data) { return BarbrickBackend.fetch('/affiliate/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); },
        track:    function (data) { return BarbrickBackend.fetch('/affiliate/track',    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); },
        stats:    function (code) { return BarbrickBackend.fetch('/affiliate/stats/'   + code); },
        payouts:  function (code) { return BarbrickBackend.fetch('/affiliate/payouts/' + code); },
      },

      /** Gas-less relayer */
      relay: {
        submit: function (data) { return BarbrickBackend.fetch('/relay/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); },
        status: function (id)   { return BarbrickBackend.fetch('/relay/status/' + id); },
        balance:function ()     { return BarbrickBackend.fetch('/relay/balance'); },
      },

      /** General health check */
      health: function () { return BarbrickBackend.fetch('/health'); },
    },
  };

  global.BarbrickBackend = BarbrickBackend;
}(window));
