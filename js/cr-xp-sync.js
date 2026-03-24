// RootIB: RB-20260324-CRXPSYNC
/**
 * cr-xp-sync.js — Cross-site XP & Rewards Sync Module
 *
 * Shared by: project-status-all.html, ezAutobots.html,
 *            consciousness-revolution-hub.html
 *
 * Features:
 *  - Persistent anonymous user ID (localStorage: cr_uid)
 *  - Read XP from all localStorage sources (XP_LEVEL_SYSTEM,
 *    XPRewardSystem, SpiralRewards)
 *  - Sync local XP snapshot to backend (/api/sync-user-xp)
 *  - Fetch Discord XP (get_profile) from backend
 *  - Log page visits to backend (log_visit)
 *  - Award XP for actions (mesh heartbeat, node register, daily login, etc.)
 *  - Broadcast XP totals to window via CustomEvent 'cr:xp-updated'
 *
 * Public API (window.CRXPSync):
 *  .getUserId()             → string
 *  .readLocalXP()           → { total, src: { lvl, reward, spiral } }
 *  .syncToBackend()         → Promise<{ success, xp, level_name, discord_xp }>
 *  .fetchDiscordXP(userId)  → Promise<number>
 *  .logVisit(page, domain)  → Promise<void>
 *  .awardXP(action, amount) → number  (updates localStorage, returns new total)
 *  .getLevel(xp)            → { name, color, range }
 *  .onXPUpdate(fn)          → void
 */

(function (global) {
  'use strict';

  var STORAGE_UID     = 'cr_uid';
  var STORAGE_XP_RAW  = 'cr_xp_raw';   // lightweight local XP store
  var API_BASE        = '/api/sync-user-xp';

  // XP Level ladder (matches project-status-all.html display)
  var LEVELS = [
    { name: 'VISITOR',    minXP: 0,      color: '#888888',  range: '0 XP — Pre-Registration' },
    { name: 'APPRENTICE', minXP: 0,      color: '#00ff88',  range: '0 – 1,000 XP' },
    { name: 'BUILDER',    minXP: 1000,   color: '#00ffff',  range: '1,000 – 5,000 XP' },
    { name: 'ARCHITECT',  minXP: 5000,   color: '#ff6b00',  range: '5,000 – 15,000 XP' },
    { name: 'ORACLE',     minXP: 15000,  color: '#DDA0DD',  range: '15,000 – 50,000 XP' },
    { name: 'COMMANDER',  minXP: 50000,  color: '#FFD700',  range: '50,000+ XP' }
  ];

  // XP values for common actions
  var XP_ACTIONS = {
    daily_login:       50,
    page_visit:        10,
    node_register:     100,
    node_heartbeat:    5,
    task_completed:    50,
    bug_reported:      25,
    first_time:        150,
    discord_join:      200
  };

  // ── User ID ──────────────────────────────────────────────────
  function getUserId() {
    try {
      var uid = localStorage.getItem(STORAGE_UID);
      if (!uid) {
        uid = 'cr_' + Date.now().toString(36) + '_' +
              Math.random().toString(36).slice(2, 8);
        localStorage.setItem(STORAGE_UID, uid);
      }
      return uid;
    } catch (e) {
      return 'cr_anon_' + Math.random().toString(36).slice(2, 8);
    }
  }

  // ── Read all local XP sources ────────────────────────────────
  function readLocalXP() {
    var total = 0;
    var src   = { lvl: 0, reward: 0, spiral: 0, raw: 0 };

    try {
      var raw = localStorage.getItem('cr_game_progress');
      if (raw) {
        var st = JSON.parse(raw);
        var v  = st.totalXPEarned || (st.state && st.state.totalXPEarned) || 0;
        src.lvl = v; total += v;
      }
    } catch (e) { console.warn('[CRXPSync] XP_LEVEL_SYSTEM read error:', e); }

    try {
      var raw2 = localStorage.getItem('xp-reward-system');
      if (raw2) {
        var data = JSON.parse(raw2);
        var v2 = 0;
        if (data.userXP && Array.isArray(data.userXP)) {
          data.userXP.forEach(function (u) {
            var entry = u && u[1];
            if (entry && typeof entry === 'object') v2 += (entry.totalXP || entry.xp || 0);
            else if (typeof u === 'object' && u !== null) v2 += (u.totalXP || u.xp || 0);
          });
        } else if (data.userXP && typeof data.userXP === 'object') {
          Object.values(data.userXP).forEach(function (u) { v2 += (u.totalXP || u.xp || 0); });
        } else if (typeof data.totalXP === 'number') {
          v2 = data.totalXP;
        }
        src.reward = v2; total += v2;
      }
    } catch (e) { console.warn('[CRXPSync] XPRewardSystem read error:', e); }

    try {
      Object.keys(localStorage).forEach(function (k) {
        if (k.startsWith('spiral_xp_')) {
          var v3 = parseInt(localStorage.getItem(k), 10) || 0;
          src.spiral += v3; total += v3;
        }
      });
    } catch (e) { console.warn('[CRXPSync] SpiralRewards read error:', e); }

    // cr_xp_raw — lightweight XP earned via CRXPSync.awardXP()
    try {
      var rawXP = parseInt(localStorage.getItem(STORAGE_XP_RAW), 10) || 0;
      src.raw = rawXP; total += rawXP;
    } catch (e) { /* ignore */ }

    return { total: total, src: src };
  }

  // ── Level lookup ─────────────────────────────────────────────
  function getLevel(xp) {
    for (var i = LEVELS.length - 1; i >= 0; i--) {
      if (xp >= LEVELS[i].minXP) return LEVELS[i];
    }
    return LEVELS[0];
  }

  // ── Sync local XP to backend ─────────────────────────────────
  function syncToBackend() {
    try {
      var userId   = getUserId();
      var xpResult = readLocalXP();
      var level    = getLevel(xpResult.total);

      return fetch(API_BASE, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action:  'sync_frontend',
          user_id: userId,
          xp_data: {
            currentXP:    xpResult.total,
            totalXPEarned: xpResult.total,
            level:        LEVELS.indexOf(level),
            domainMastery: {},
            toolsUsed:    []
          }
        })
      })
      .then(function (res) { return res.ok ? res.json() : Promise.resolve({ success: false }); })
      .then(function (data) {
        // After syncing, try to get Discord XP
        return fetchDiscordXP(userId).then(function (rawDiscordXP) {
          var discordXP = (typeof rawDiscordXP === 'number' && !isNaN(rawDiscordXP)) ? rawDiscordXP : 0;
          var result = Object.assign({}, data, { discord_xp: discordXP });
          _emit(xpResult.total + discordXP, discordXP);
          return result;
        });
      })
      .catch(function () {
        _emit(xpResult.total, 0);
        return { success: false, discord_xp: 0 };
      });
    } catch (e) {
      return Promise.resolve({ success: false, discord_xp: 0 });
    }
  }

  // ── Fetch Discord XP from backend ────────────────────────────
  function fetchDiscordXP(userId) {
    return fetch(API_BASE + '?action=get_profile&user_id=' + encodeURIComponent(userId || getUserId()))
      .then(function (res) { return res.ok ? res.json() : Promise.resolve({}); })
      .then(function (data) {
        if (data.success && data.profile) {
          return data.profile.xp || 0;
        }
        return 0;
      })
      .catch(function () { return 0; });
  }

  // ── Log page visit to backend ────────────────────────────────
  function logVisit(page, domain) {
    try {
      var userId   = getUserId();
      var xpResult = readLocalXP();

      return fetch(API_BASE, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action:      'log_visit',
          user_id:     userId,
          page:        page || (global.location && global.location.pathname) || 'unknown',
          domain:      domain || (global.location && global.location.hostname) || 'unknown',
          referrer:    global.document && global.document.referrer || null,
          xp_snapshot: { currentXP: xpResult.total, totalXPEarned: xpResult.total }
        })
      })
      .then(function () { /* fire and forget */ })
      .catch(function () { /* silently ignore */ });
    } catch (e) {
      return Promise.resolve();
    }
  }

  // ── Award XP for an action ───────────────────────────────────
  function awardXP(action, customAmount) {
    var amount = customAmount || XP_ACTIONS[action] || 0;
    if (amount <= 0) return readLocalXP().total;

    try {
      var current = parseInt(localStorage.getItem(STORAGE_XP_RAW), 10) || 0;
      var updated = current + amount;
      localStorage.setItem(STORAGE_XP_RAW, String(updated));

      // Re-read total
      var xpResult = readLocalXP();
      _emit(xpResult.total, 0);

      // Show a brief floating notification if supported
      _showXPToast('+' + amount + ' XP — ' + (action || 'action'));

      return xpResult.total;
    } catch (e) {
      return 0;
    }
  }

  // ── Floating XP toast ────────────────────────────────────────
  function _showXPToast(msg) {
    if (!global.document) return;
    try {
      var toast = global.document.createElement('div');
      toast.textContent = '⚡ ' + msg;
      toast.style.cssText = [
        'position:fixed', 'bottom:24px', 'right:24px', 'z-index:99999',
        'background:rgba(0,0,0,0.85)', 'color:#ffd700',
        'font-family:Orbitron,monospace', 'font-size:13px',
        'font-weight:700', 'padding:10px 18px', 'border-radius:8px',
        'border:1px solid rgba(255,215,0,0.35)', 'pointer-events:none',
        'transition:opacity 0.4s', 'opacity:1'
      ].join(';');
      global.document.body.appendChild(toast);
      setTimeout(function () {
        toast.style.opacity = '0';
        setTimeout(function () {
          if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 450);
      }, 2200);
    } catch (e) { /* ignore */ }
  }

  // ── Event broadcasting ───────────────────────────────────────
  var _listeners = [];

  function _emit(totalXP, discordXP) {
    var detail = { totalXP: totalXP, discordXP: discordXP, level: getLevel(totalXP) };
    _listeners.forEach(function (fn) {
      try { fn(detail); } catch (e) { /* ignore */ }
    });
    if (global.document && typeof global.CustomEvent !== 'undefined') {
      try {
        global.document.dispatchEvent(new CustomEvent('cr:xp-updated', { detail: detail }));
      } catch (e) { /* ignore */ }
    }
  }

  function onXPUpdate(fn) {
    if (typeof fn === 'function') _listeners.push(fn);
  }

  // ── Auto-log daily login XP (once per day) ───────────────────
  function _maybeAwardDailyLogin() {
    try {
      var key  = 'cr_last_daily_login';
      var last = localStorage.getItem(key);
      var now  = Date.now();
      var lastNum = last ? parseInt(last, 10) : NaN;
      if (!last || isNaN(lastNum) || now - lastNum > 86400000) {
        localStorage.setItem(key, String(now));
        awardXP('daily_login');
      }
    } catch (e) { /* ignore */ }
  }

  // ── Format XP for display ────────────────────────────────────
  function formatXP(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000)    return (n / 1000).toFixed(1) + 'k';
    return String(n);
  }

  // ── Expose public API ────────────────────────────────────────
  global.CRXPSync = {
    getUserId:      getUserId,
    readLocalXP:    readLocalXP,
    syncToBackend:  syncToBackend,
    fetchDiscordXP: fetchDiscordXP,
    logVisit:       logVisit,
    awardXP:        awardXP,
    getLevel:       getLevel,
    formatXP:       formatXP,
    onXPUpdate:     onXPUpdate,
    LEVELS:         LEVELS,
    XP_ACTIONS:     XP_ACTIONS
  };

  // Auto-run: award daily login XP
  _maybeAwardDailyLogin();

})(typeof window !== 'undefined' ? window : this);
