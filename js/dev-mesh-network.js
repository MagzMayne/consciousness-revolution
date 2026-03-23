// RootIB: RB-20260319142113-B448565E
/**
 * dev-mesh-network.js — Collective Developer Platform Module
 *
 * Browser-only. No backend required.
 *
 * State persisted in localStorage:
 *   cr_dev_mesh    — developer registry, enhancements, compute pool, knowledge base
 *   cr_tool_vault  — per-developer cloned tool lists
 *
 * Cross-tab sync: BroadcastChannel('cr_mesh_network')
 * Cross-site sync: CRSync (when available on the page)
 *
 * Public API (exposed as window.DevMeshNetwork):
 *   registerDev(handle, tier, skills)        → dev object
 *   updateDevActivity(handle)                → void
 *   getDevs()                                → dev[]
 *   getActiveDev(handle)                     → dev | null
 *   scoreEnhancement({title, description, code}) → 0-100
 *   submitEnhancement(handle, projectId, title, description, code) → result
 *   getEnhancements()                        → enhancement[]
 *   donateCompute(handle, units?)            → pool total
 *   getComputePool()                         → { total, donors }
 *   addKnowledge(handle, text)               → knowledge item
 *   voteKnowledge(id, handle)               → knowledge item
 *   getKnowledge()                           → knowledge[]
 *   getToolVault(handle)                     → tool[]  (tier-gated catalog)
 *   cloneTool(handle, toolId)               → boolean
 *   removeTool(handle, toolId)              → boolean
 *   getCoreVersion()                         → semver string
 *   onMeshEvent(fn)                          → void
 */

(function (global) {
  'use strict';

  /* ── Constants ──────────────────────────────────────────────── */
  var STORAGE_MESH  = 'cr_dev_mesh';
  var STORAGE_VAULT = 'cr_tool_vault';
  var CHANNEL_NAME  = 'cr_mesh_network';
  var ACTIVE_WINDOW_MS = 30 * 60 * 1000; // 30 minutes
  var AUTO_MERGE_THRESHOLD = 75;

  /* ── Tier map: name → numeric index ─────────────────────────── */
  var TIER_INDEX = {
    explorer:  0,
    free:      0,
    builder:   1,
    bronze:    1,
    automator: 2,
    silver:    2,
    engineer:  3,
    gold:      3,
    coredev:   4,
    'core dev': 4,
    'core-dev': 4,
    platinum:  4,
  };

  /* ── Tool catalog ────────────────────────────────────────────── */
  var TOOL_CATALOG = [
    { id: 'ezautobots',   name: 'EzAutobots',          emoji: '⚡', url: '/ez-autobots.html',               minTier: 0, tags: ['Automation', 'Bots']       },
    { id: 'araya-chat',   name: 'ARAYA AI',             emoji: '🤖', url: '/araya-chat.html',                minTier: 0, tags: ['AI', 'NLP']                 },
    { id: 'dev-launch',   name: 'Dev Launch Hub',       emoji: '🚀', url: '/dev-launch.html',                minTier: 0, tags: ['Tooling', 'Discovery']      },
    { id: 'dev-dash',     name: 'Developer Dashboard',  emoji: '📊', url: '/developer-dashboard.html',       minTier: 1, tags: ['Dev', 'Dashboard']          },
    { id: 'openclaw',     name: 'OpenClaw Hub',         emoji: '🦅', url: '/openclaw-hub.html',              minTier: 1, tags: ['Agents', 'WebSocket']       },
    { id: 'grants',       name: 'Grants Portal',        emoji: '🏛️', url: '/government-grants-portal.html', minTier: 1, tags: ['Civic', 'APIs']             },
    { id: 'payroll',      name: 'Payroll Hub',          emoji: '💸', url: '/payroll-hub.html',               minTier: 2, tags: ['FinTech', 'PayPal']         },
    { id: 'agent-mgmt',   name: 'Agent Management',     emoji: '🧠', url: '/agent-management-dashboard.html',minTier: 2, tags: ['Agents', 'Dashboard']      },
    { id: 'mission-hub',  name: 'Mission Hub',          emoji: '🎯', url: '/mission-hub.html',               minTier: 2, tags: ['Missions', 'Rewards']      },
    { id: 'profit-mesh',  name: 'Profit Mesh',          emoji: '💹', url: '/profit-mesh-dashboard.html',     minTier: 3, tags: ['Finance', 'Analytics']     },
    { id: 'loan-swarm',   name: 'Loan Swarm',           emoji: '🐝', url: '/loan-swarm.html',                minTier: 3, tags: ['FinTech', 'AI']            },
    { id: 'casino-ai',    name: 'Casino AI',            emoji: '🎰', url: '/casino-ai-dashboard.html',       minTier: 4, tags: ['AI', 'Gaming']             },
    { id: 'admin-panel',  name: 'Admin Panel',          emoji: '⚙️', url: '/admin-panel.html',              minTier: 4, tags: ['Admin', 'Core']             },
  ];

  /* ── Internal state ─────────────────────────────────────────── */
  var _channel  = null;
  var _handlers = [];

  /* ── Default mesh state ─────────────────────────────────────── */
  function _defaultMesh() {
    return {
      devs:         {},    // keyed by handle
      enhancements: [],    // { id, handle, projectId, title, description, code, score, status, ts }
      compute:      {},    // keyed by handle → units donated
      knowledge:    [],    // { id, handle, text, votes, voters[], ts }
      coreVersion:  '1.0.0',
    };
  }

  function _defaultVault() {
    return {};             // keyed by handle → string[] of toolIds
  }

  /* ── Storage helpers ────────────────────────────────────────── */
  function _loadMesh() {
    try {
      var raw = localStorage.getItem(STORAGE_MESH);
      if (!raw) return _defaultMesh();
      var parsed = JSON.parse(raw);
      // Ensure all required keys exist (upgrade guard)
      var def = _defaultMesh();
      if (!parsed.devs)         parsed.devs         = def.devs;
      if (!parsed.enhancements) parsed.enhancements = def.enhancements;
      if (!parsed.compute)      parsed.compute      = def.compute;
      if (!parsed.knowledge)    parsed.knowledge    = def.knowledge;
      if (!parsed.coreVersion)  parsed.coreVersion  = def.coreVersion;
      return parsed;
    } catch (_) {
      return _defaultMesh();
    }
  }

  function _saveMesh(mesh) {
    try { localStorage.setItem(STORAGE_MESH, JSON.stringify(mesh)); } catch (_) {}
  }

  function _loadVault() {
    try {
      var raw = localStorage.getItem(STORAGE_VAULT);
      if (!raw) return _defaultVault();
      return JSON.parse(raw) || _defaultVault();
    } catch (_) {
      return _defaultVault();
    }
  }

  function _saveVault(vault) {
    try { localStorage.setItem(STORAGE_VAULT, JSON.stringify(vault)); } catch (_) {}
  }

  /* ── UUID helper ─────────────────────────────────────────────── */
  function _uid() {
    return (
      Date.now().toString(36) +
      Math.random().toString(36).slice(2, 8)
    );
  }

  /* ── Semver bump (patch) ─────────────────────────────────────── */
  function _bumpPatch(version) {
    var parts = String(version).split('.').map(Number);
    if (parts.length < 3 || parts.some(function (p) { return isNaN(p); })) return '1.0.1';
    parts[2] += 1;
    return parts.join('.');
  }

  /* ── BroadcastChannel setup ─────────────────────────────────── */
  function _initChannel() {
    if (typeof BroadcastChannel === 'undefined') return;
    try {
      _channel = new BroadcastChannel(CHANNEL_NAME);
      _channel.onmessage = function (e) {
        var msg = e.data;
        if (!msg || msg.__devMesh !== true) return;
        // Merge incoming state
        if (msg.mesh) {
          var local = _loadMesh();
          _mergeMesh(local, msg.mesh);
          _saveMesh(local);
        }
        // Notify registered handlers
        _handlers.forEach(function (fn) {
          try { fn(msg); } catch (_) {}
        });
      };
    } catch (_) {}
  }

  function _broadcast(payload) {
    if (!_channel) return;
    try {
      _channel.postMessage(Object.assign({}, payload, { __devMesh: true }));
    } catch (_) {}
    // Also relay via CRSync for cross-site sync
    if (global.CRSync && typeof global.CRSync.broadcast === 'function') {
      try {
        global.CRSync.broadcast({ devMesh: payload });
      } catch (_) {}
    }
  }

  /* ── Mesh merge helper ─────────────────────────────────────────
   * Merges incoming mesh data into the local copy, preferring the
   * most recently updated entry for devs/enhancements/knowledge.
   */
  function _mergeMesh(local, incoming) {
    // Devs
    if (incoming.devs) {
      Object.keys(incoming.devs).forEach(function (h) {
        var inc = incoming.devs[h];
        var loc = local.devs[h];
        if (!loc || inc.lastSeen > loc.lastSeen) {
          local.devs[h] = inc;
        }
      });
    }
    // Enhancements (deduplicate by id)
    if (Array.isArray(incoming.enhancements)) {
      var existingIds = local.enhancements.map(function (e) { return e.id; });
      incoming.enhancements.forEach(function (inc) {
        if (!existingIds.includes(inc.id)) {
          local.enhancements.push(inc);
        }
      });
    }
    // Compute pool
    if (incoming.compute) {
      Object.keys(incoming.compute).forEach(function (h) {
        local.compute[h] = Math.max(local.compute[h] || 0, incoming.compute[h] || 0);
      });
    }
    // Knowledge (deduplicate by id, prefer higher vote count)
    if (Array.isArray(incoming.knowledge)) {
      incoming.knowledge.forEach(function (inc) {
        var idx = local.knowledge.findIndex(function (k) { return k.id === inc.id; });
        if (idx === -1) {
          local.knowledge.push(inc);
        } else if (inc.votes > local.knowledge[idx].votes) {
          local.knowledge[idx] = inc;
        }
      });
    }
    // Core version (take highest patch)
    if (incoming.coreVersion) {
      var a = String(local.coreVersion).split('.').map(Number);
      var b = String(incoming.coreVersion).split('.').map(Number);
      for (var i = 0; i < 3; i++) {
        if ((b[i] || 0) > (a[i] || 0)) {
          local.coreVersion = incoming.coreVersion;
          break;
        }
      }
    }
  }

  /* ── Tier resolution ─────────────────────────────────────────── */
  function _tierIndex(tierName) {
    var key = String(tierName || 'explorer').toLowerCase().trim();
    return TIER_INDEX[key] !== undefined ? TIER_INDEX[key] : 0;
  }

  /* ── Enhancement quality scorer ──────────────────────────────── *
   * Objective 0–100 score across seven dimensions:
   *   Title completeness   (max 20)
   *   Description depth    (max 20)
   *   Code length          (max 15)
   *   Function definitions (max 15)
   *   Error handling       (max 10)
   *   Inline comments      (max 10)
   *   No placeholder text  (max 10)
   */
  function _score(opts) {
    var title       = String(opts.title       || '').trim();
    var description = String(opts.description || '').trim();
    var code        = String(opts.code        || '').trim();
    var points      = 0;

    // Title completeness (max 20)
    if (title.length >= 30) {
      points += 20;
    } else if (title.length >= 20) {
      points += 15;
    } else if (title.length >= 10) {
      points += 10;
    } else if (title.length > 0) {
      points += 5;
    }

    // Description depth (max 20)
    if (description.length >= 300) {
      points += 20;
    } else if (description.length >= 200) {
      points += 15;
    } else if (description.length >= 100) {
      points += 10;
    } else if (description.length >= 50) {
      points += 5;
    }

    // Code length (max 15)
    if (code.length >= 1000) {
      points += 15;
    } else if (code.length >= 500) {
      points += 10;
    } else if (code.length >= 200) {
      points += 5;
    }

    // Function definitions (max 15): named fns, assigned functions/arrows
    var fnMatches =
      (code.match(/function\s+\w+\s*\(/g)  || []).length +
      (code.match(/(?:const|let|var)\s+\w+\s*=\s*(?:async\s*)?(?:function\s*\*?\s*)?\(/g) || []).length +
      (code.match(/=>\s*[\{\(A-Za-z_$0-9"'`]/g) || []).length;
    if (fnMatches >= 5) {
      points += 15;
    } else if (fnMatches >= 3) {
      points += 10;
    } else if (fnMatches >= 1) {
      points += 5;
    }

    // Error handling (max 10): try/catch or .catch
    var hasErrorHandling =
      /try\s*\{/.test(code) ||
      /\.catch\s*\(/.test(code) ||
      /catch\s*\(/.test(code);
    if (hasErrorHandling) points += 10;

    // Inline comments (max 10): // or /* ... */
    var hasComments =
      /\/\//.test(code) ||
      /\/\*[\s\S]*?\*\//.test(code);
    if (hasComments) points += 10;

    // No placeholder text (max 10): penalise TODO/FIXME/lorem/placeholder
    var hasPlaceholder =
      /\bTODO\b/i.test(code + description) ||
      /\bFIXME\b/i.test(code + description) ||
      /\blorem ipsum\b/i.test(code + description) ||
      /\bplaceholder\b/i.test(code + description) ||
      /\byour code here\b/i.test(code + description);
    if (!hasPlaceholder) points += 10;

    return Math.min(100, points);
  }

  /* ── Public API ──────────────────────────────────────────────── */
  var DevMeshNetwork = {

    /**
     * Register or update a developer in the mesh.
     * @param {string} handle   — unique developer handle
     * @param {string} tier     — tier name (explorer/builder/automator/engineer/coredev)
     * @param {string[]} skills — list of skill strings
     * @returns {object} dev entry
     */
    registerDev: function (handle, tier, skills) {
      handle = String(handle || '').trim();
      if (!handle) return null;

      var mesh = _loadMesh();
      var existing = mesh.devs[handle] || {};
      var dev = {
        handle:       handle,
        tier:         String(tier || 'explorer').toLowerCase().trim(),
        tierIndex:    _tierIndex(tier),
        skills:       Array.isArray(skills) ? skills : String(skills || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean),
        computeUnits: existing.computeUnits || 0,
        joinedAt:     existing.joinedAt     || Date.now(),
        lastSeen:     Date.now(),
      };
      mesh.devs[handle] = dev;
      _saveMesh(mesh);
      _broadcast({ type: 'dev_registered', mesh: { devs: mesh.devs } });
      return dev;
    },

    /**
     * Touch a developer's lastSeen timestamp (keeps them in the active window).
     */
    updateDevActivity: function (handle) {
      handle = String(handle || '').trim();
      if (!handle) return;
      var mesh = _loadMesh();
      if (mesh.devs[handle]) {
        mesh.devs[handle].lastSeen = Date.now();
        _saveMesh(mesh);
      }
    },

    /**
     * Returns all registered developers.
     */
    getDevs: function () {
      var mesh = _loadMesh();
      return Object.values(mesh.devs);
    },

    /**
     * Returns the dev entry for a handle if they are within the active window.
     */
    getActiveDev: function (handle) {
      handle = String(handle || '').trim();
      if (!handle) return null;
      var mesh = _loadMesh();
      var dev  = mesh.devs[handle];
      if (!dev) return null;
      return (Date.now() - dev.lastSeen < ACTIVE_WINDOW_MS) ? dev : null;
    },

    /**
     * Score an enhancement without submitting it (used for live preview).
     * @param {{title:string, description:string, code:string}} opts
     * @returns {number} 0–100
     */
    scoreEnhancement: function (opts) {
      return _score(opts);
    },

    /**
     * Submit an enhancement to the pipeline.
     * If score ≥ AUTO_MERGE_THRESHOLD (75), auto-merges and bumps core version.
     *
     * @param {string} handle      — submitter handle
     * @param {string} projectId   — target project id (e.g. 'ezautobots')
     * @param {string} title
     * @param {string} description
     * @param {string} code
     * @returns {{ ok:boolean, score:number, status:string, id:string }}
     */
    submitEnhancement: function (handle, projectId, title, description, code) {
      handle    = String(handle    || '').trim();
      projectId = String(projectId || '').trim();
      title       = String(title       || '').trim();
      description = String(description || '').trim();
      code        = String(code        || '').trim();

      if (!handle || !projectId || !title) {
        return { ok: false, score: 0, status: 'invalid', id: '' };
      }

      var score  = _score({ title: title, description: description, code: code });
      var status = score >= AUTO_MERGE_THRESHOLD ? 'merged' : 'pending';
      var id     = _uid();

      var enhancement = {
        id:          id,
        handle:      handle,
        projectId:   projectId,
        title:       title,
        description: description,
        code:        code,
        score:       score,
        status:      status,
        ts:          Date.now(),
      };

      var mesh = _loadMesh();
      mesh.enhancements.push(enhancement);

      if (status === 'merged') {
        mesh.coreVersion = _bumpPatch(mesh.coreVersion);
      }

      _saveMesh(mesh);
      _broadcast({
        type:        status === 'merged' ? 'enhancement_merged' : 'enhancement_submitted',
        mesh:        { enhancements: mesh.enhancements, coreVersion: mesh.coreVersion },
        enhancement: enhancement,
      });

      // Update dev activity
      this.updateDevActivity(handle);

      return { ok: true, score: score, status: status, id: id };
    },

    /**
     * Returns all enhancements, newest first.
     */
    getEnhancements: function () {
      var mesh = _loadMesh();
      return mesh.enhancements.slice().sort(function (a, b) { return b.ts - a.ts; });
    },

    /**
     * Donate compute units to the shared pool.
     * @param {string} handle
     * @param {number} [units=1]
     * @returns {number} donor's running total
     */
    donateCompute: function (handle, units) {
      handle = String(handle || '').trim();
      if (!handle) return 0;
      var amount = Math.max(1, parseInt(units, 10) || 0);
      var mesh   = _loadMesh();
      mesh.compute[handle] = (mesh.compute[handle] || 0) + amount;
      _saveMesh(mesh);
      _broadcast({ type: 'compute_donated', mesh: { compute: mesh.compute } });
      this.updateDevActivity(handle);
      return mesh.compute[handle];
    },

    /**
     * Returns the shared compute pool totals.
     * @returns {{ total:number, donors:{ handle:string, units:number }[] }}
     */
    getComputePool: function () {
      var mesh   = _loadMesh();
      var donors = Object.keys(mesh.compute).map(function (h) {
        return { handle: h, units: mesh.compute[h] };
      }).sort(function (a, b) { return b.units - a.units; });
      var total  = donors.reduce(function (s, d) { return s + d.units; }, 0);
      return { total: total, donors: donors };
    },

    /**
     * Add a knowledge item to the shared base.
     * @param {string} handle
     * @param {string} text
     * @returns {object} knowledge item
     */
    addKnowledge: function (handle, text) {
      handle = String(handle || '').trim();
      text   = String(text   || '').trim();
      if (!handle || !text) return null;

      var item = {
        id:     _uid(),
        handle: handle,
        text:   text,
        votes:  0,
        voters: [],
        ts:     Date.now(),
      };

      var mesh = _loadMesh();
      mesh.knowledge.push(item);
      _saveMesh(mesh);
      _broadcast({ type: 'knowledge_added', mesh: { knowledge: mesh.knowledge } });
      this.updateDevActivity(handle);
      return item;
    },

    /**
     * Cast a helpful vote on a knowledge item.
     * Each handle can vote once per item.
     * @param {string} id      — knowledge item id
     * @param {string} handle  — voter handle
     * @returns {object|null} updated item or null if not found / already voted
     */
    voteKnowledge: function (id, handle) {
      id     = String(id     || '').trim();
      handle = String(handle || '').trim();
      if (!id || !handle) return null;

      var mesh = _loadMesh();
      var item = mesh.knowledge.find(function (k) { return k.id === id; });
      if (!item) return null;
      if (!item.voters) item.voters = [];
      if (item.voters.includes(handle)) return item; // already voted

      item.votes  += 1;
      item.voters.push(handle);
      _saveMesh(mesh);
      _broadcast({ type: 'knowledge_voted', mesh: { knowledge: mesh.knowledge } });
      return item;
    },

    /**
     * Returns all knowledge items, highest-voted first.
     */
    getKnowledge: function () {
      var mesh = _loadMesh();
      return mesh.knowledge.slice().sort(function (a, b) { return b.votes - a.votes; });
    },

    /**
     * Returns the tool catalog filtered to tools the handle's tier can access.
     * Already-cloned tools are flagged with { cloned: true }.
     * @param {string} handle
     * @returns {object[]}
     */
    getToolVault: function (handle) {
      handle = String(handle || '').trim();
      var mesh    = _loadMesh();
      var dev     = handle ? mesh.devs[handle] : null;
      var tier    = dev ? dev.tierIndex : 0;
      var vault   = _loadVault();
      var cloned  = handle ? (vault[handle] || []) : [];

      return TOOL_CATALOG.map(function (tool) {
        return Object.assign({}, tool, {
          unlocked: tool.minTier <= tier,
          cloned:   cloned.includes(tool.id),
        });
      });
    },

    /**
     * Clone a tool into the developer's personal vault.
     * Respects tier gating.
     * @returns {boolean} success
     */
    cloneTool: function (handle, toolId) {
      handle = String(handle || '').trim();
      toolId = String(toolId || '').trim();
      if (!handle || !toolId) return false;

      var mesh  = _loadMesh();
      var dev   = mesh.devs[handle];
      if (!dev) return false;

      var tool  = TOOL_CATALOG.find(function (t) { return t.id === toolId; });
      if (!tool) return false;
      if (tool.minTier > dev.tierIndex) return false;

      var vault = _loadVault();
      if (!vault[handle]) vault[handle] = [];
      if (!vault[handle].includes(toolId)) {
        vault[handle].push(toolId);
        _saveVault(vault);
      }
      return true;
    },

    /**
     * Remove a tool from the developer's vault.
     * @returns {boolean} success
     */
    removeTool: function (handle, toolId) {
      handle = String(handle || '').trim();
      toolId = String(toolId || '').trim();
      if (!handle || !toolId) return false;

      var vault = _loadVault();
      if (!vault[handle]) return false;
      var idx = vault[handle].indexOf(toolId);
      if (idx === -1) return false;
      vault[handle].splice(idx, 1);
      _saveVault(vault);
      return true;
    },

    /**
     * Returns the quality score threshold for auto-merge (75).
     */
    getMergeThreshold: function () {
      return AUTO_MERGE_THRESHOLD;
    },

    /**
     * Returns the active developer window in milliseconds (30 min).
     */
    getActiveWindowMs: function () {
      return ACTIVE_WINDOW_MS;
    },

    /**
     * Returns the current core version string.
     */
    getCoreVersion: function () {
      return _loadMesh().coreVersion;
    },

    /**
     * Register a handler called whenever a mesh broadcast event arrives.
     * @param {Function} fn — called with the broadcast message object
     */
    onMeshEvent: function (fn) {
      if (typeof fn === 'function') _handlers.push(fn);
    },
  };

  /* ── Bootstrap BroadcastChannel ─────────────────────────────── */
  _initChannel();

  /* ── Expose globally ─────────────────────────────────────────── */
  global.DevMeshNetwork = DevMeshNetwork;

}(typeof window !== 'undefined' ? window : this));
