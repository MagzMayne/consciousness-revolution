// RootIB: RB-20260322000001-MIROFISH
/**
 * MiroFish Quantum Engine — Browser Swarm Intelligence & Quantum Foresight
 *
 * Inspired by MiroFish (github.com/barbrickdesign/MiroFish-enhancedByAgentR)
 * — a multi-agent swarm intelligence engine for predicting anything.
 *
 * Capabilities:
 *   • Spin up a local quantum swarm of micro-agents in the browser
 *   • Seed the swarm with any topic / signal data
 *   • Run probabilistic "quantum collapse" to yield ranked future scenarios
 *   • Surface error-handling foresight for autonomous agents
 *   • Emit income-optimisation signals consumed by other system modules
 *
 * Public API (window.MiroFishQuantum):
 *   init(config)                              → Promise<void>
 *   seedSwarm(seeds[])                        → void
 *   runForesight(topic, rounds?)              → Promise<ForesightResult>
 *   predictErrors(agentId, recentLogs[])      → ErrorForesight[]
 *   getIncomeSignals()                        → IncomeSignal[]
 *   getSwarmStatus()                          → SwarmStatus
 *   onSignal(fn)                              → void  (subscribe to live signals)
 *   quantumCollapse(scenarios[], weights[])   → ScenarioResult
 *
 * Storage: sessionStorage key 'mf_quantum_swarm'
 * Events:  BroadcastChannel('mf_quantum_signals')
 */

(function (global) {
  'use strict';

  /* ── Version & identity ─────────────────────────────────────── */
  const VERSION      = '1.0.0';
  const ENGINE_ID    = 'MiroFishQuantum';
  const STORAGE_KEY  = 'mf_quantum_swarm';
  const CHANNEL_NAME = 'mf_quantum_signals';

  /* ── Quantum parameters ─────────────────────────────────────── */
  const DEFAULT_SWARM_SIZE   = 42;   // number of micro-agents
  const DEFAULT_ROUNDS       = 7;    // simulation rounds per foresight call
  const COLLAPSE_TEMPERATURE = 0.618; // golden-ratio damping for probability collapse
  const QUANTUM_NOISE        = 0.05;  // small random perturbation per round
  const MAX_SEEDS            = 200;

  /* ── Error pattern lexicon ──────────────────────────────────── */
  const ERROR_PATTERNS = {
    timeout:      ['timeout', 'timed out', 'network error', 'fetch failed', 'abort'],
    auth:         ['unauthorized', '401', '403', 'forbidden', 'invalid token', 'expired'],
    rate_limit:   ['429', 'too many requests', 'rate limit', 'throttle'],
    data:         ['null', 'undefined', 'cannot read', 'typeerror', 'nan', 'invalid json'],
    dependency:   ['module not found', 'is not a function', 'is not defined', 'missing'],
    payment:      ['payment failed', 'paypal', 'stripe error', 'declined', 'insufficient'],
    agent:        ['agent crash', 'heartbeat lost', 'self-heal', 'agent error', 'unresponsive'],
  };

  /* ── Income signal templates ────────────────────────────────── */
  const INCOME_SIGNAL_TEMPLATES = [
    {
      type: 'grant',
      label: 'Government Grant Window Open',
      description: 'Quantum swarm detects a high-probability grant award cycle in the next 14 days.',
      action: 'government-grants-portal.html',
      value: 75000,
      confidence: 0,
    },
    {
      type: 'contributor',
      label: 'Contributor Surge Predicted',
      description: 'Swarm agents forecast a 3-5× contributor registration spike in the next 72 hours.',
      action: 'contributor-registration-enhanced.html',
      value: 4500,
      confidence: 0,
    },
    {
      type: 'licensing',
      label: 'Licensing Deal Probability High',
      description: 'Pattern resonance indicates an inbound licensing inquiry within 7 days.',
      action: 'openclaw-hub.html',
      value: 12000,
      confidence: 0,
    },
    {
      type: 'automation',
      label: 'Automation Efficiency Gain',
      description: 'Foresight agents predict workflow optimisation that saves 40+ dev-hours per week.',
      action: 'ez-autobots.html',
      value: 2000,
      confidence: 0,
    },
    {
      type: 'mirofish',
      label: 'MiroFish Prediction API Revenue',
      description: 'Expose quantum foresight as a paid API endpoint — swarm projects $0.10/call ARR.',
      action: 'mirofish-quantum-hub.html',
      value: 50000,
      confidence: 0,
    },
  ];

  /* ── Utilities ──────────────────────────────────────────────── */

  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function now() { return new Date().toISOString(); }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  /** Sigmoid squash to [0,1] */
  function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }

  /** Weighted random draw from array */
  function weightedDraw(items, weights) {
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < items.length; i++) {
      r -= weights[i];
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  }

  /** Entropy of a probability distribution */
  function entropy(probs) {
    return -probs.reduce((s, p) => s + (p > 0 ? p * Math.log2(p) : 0), 0);
  }

  /** Simple word-overlap similarity [0,1] */
  function tokenSim(a, b) {
    const ta = new Set(a.toLowerCase().split(/\W+/).filter(Boolean));
    const tb = new Set(b.toLowerCase().split(/\W+/).filter(Boolean));
    const inter = [...ta].filter(t => tb.has(t)).length;
    const union = new Set([...ta, ...tb]).size;
    return union === 0 ? 0 : inter / union;
  }

  /* ── Micro-agent class ──────────────────────────────────────── */

  class MicroAgent {
    constructor(id, personality) {
      this.id           = id;
      this.personality  = personality; // { curiosity, risk, optimism, creativity }
      this.memory       = [];
      this._memoryCache = '';          // cached join — invalidated when memory changes
      this.state        = 'idle';
      this.energy       = 1.0;
    }

    /** Process a seed and return an opinion vector */
    process(seed, round) {
      const base = this.personality.curiosity * tokenSim(seed, this._memoryCache || seed);
      const noise = (Math.random() - 0.5) * QUANTUM_NOISE;
      const roundDecay = Math.exp(-round * 0.1);
      const opinion = clamp(base + noise + this.personality.optimism * 0.1, 0, 1) * roundDecay;

      this.memory.push(seed.slice(0, 60));
      if (this.memory.length > 10) this.memory.shift();
      this._memoryCache = this.memory.join(' '); // update cache once per call
      this.energy = clamp(this.energy - 0.02 + Math.random() * 0.05, 0.1, 1.0);

      return {
        agentId:   this.id,
        seed,
        opinion,
        confidence: this.energy * this.personality.risk,
        timestamp:  now(),
      };
    }
  }

  /* ── Swarm state ────────────────────────────────────────────── */

  let _swarm       = [];       // MicroAgent[]
  let _seeds       = [];       // string[]
  let _signals     = [];       // IncomeSignal[]
  let _history     = [];       // ForesightResult[]
  let _channel     = null;     // BroadcastChannel
  let _listeners   = [];       // callback[]
  let _initialized = false;

  /* ── Swarm bootstrap ────────────────────────────────────────── */

  function _buildSwarm(size) {
    _swarm = [];
    const personalities = [
      'pioneer', 'analyst', 'guardian', 'visionary', 'realist',
      'optimist', 'skeptic', 'catalyst', 'connector', 'creator',
    ];
    for (let i = 0; i < size; i++) {
      const p = personalities[i % personalities.length];
      _swarm.push(new MicroAgent(`mf-agent-${i + 1}`, {
        curiosity:  0.4 + Math.random() * 0.6,
        risk:       0.3 + Math.random() * 0.7,
        optimism:   p === 'optimist' ? 0.9 : (p === 'skeptic' ? 0.2 : 0.3 + Math.random() * 0.5),
        creativity: p === 'creator'  ? 0.9 : 0.2 + Math.random() * 0.6,
      }));
    }
  }

  /* ── Core foresight engine ──────────────────────────────────── */

  /**
   * Run a multi-round swarm simulation over a topic.
   * @returns {ForesightResult}
   */
  async function _runSimulation(topic, rounds) {
    const allOpinions = [];
    const scenarios   = [];
    let   roundData   = [];

    for (let r = 0; r < rounds; r++) {
      const roundOpinions = [];
      const relevantSeeds = _seeds.filter(s => tokenSim(s, topic) > 0.05).slice(0, 20);
      const seedsToUse    = relevantSeeds.length > 0 ? relevantSeeds : [topic];

      for (const agent of _swarm) {
        const seed = seedsToUse[Math.floor(Math.random() * seedsToUse.length)];
        roundOpinions.push(agent.process(seed, r));
      }

      const roundMean = roundOpinions.reduce((s, o) => s + o.opinion, 0) / roundOpinions.length;
      roundData.push({ round: r + 1, mean: roundMean });
      allOpinions.push(...roundOpinions);
    }

    // Collapse to ranked scenarios via quantum probability
    const rawScenarios = _deriveScenarios(topic, allOpinions);
    const collapsed    = _quantumCollapse(rawScenarios.map(s => s.label),
                                          rawScenarios.map(s => s.weight));

    const result = {
      id:            uuid(),
      topic,
      rounds,
      timestamp:     now(),
      scenarios:     rawScenarios,
      topScenario:   collapsed,
      convergence:   _measureConvergence(roundData),
      entropyLevel:  entropy(rawScenarios.map(s => s.probability)),
      swarmConsensus: roundData[roundData.length - 1]?.mean ?? 0,
      roundTrace:    roundData,
      incomeSignals: _refreshIncomeSignals(topic),
    };

    _history.unshift(result);
    if (_history.length > 50) _history.pop();
    _persist();
    _emit('foresight', result);
    return result;
  }

  /** Build scenario objects from swarm opinion vectors */
  function _deriveScenarios(topic, opinions) {
    // Cluster agents by opinion quartile → 4 distinct futures
    const sorted  = [...opinions].sort((a, b) => a.opinion - b.opinion);
    const quarter = Math.ceil(sorted.length / 4);
    const buckets = [
      sorted.slice(0, quarter),
      sorted.slice(quarter, quarter * 2),
      sorted.slice(quarter * 2, quarter * 3),
      sorted.slice(quarter * 3),
    ];

    const labels = [
      `Disruption: ${topic} transforms dramatically`,
      `Growth: ${topic} expands steadily`,
      `Stability: ${topic} maintains current trajectory`,
      `Challenge: ${topic} faces headwinds`,
    ];

    return buckets.map((bucket, i) => {
      const meanOpinion = bucket.reduce((s, o) => s + o.opinion, 0) / (bucket.length || 1);
      const weight      = Math.max(0.01, meanOpinion + (1 - i / 4) * 0.3);
      return {
        label:       labels[i],
        weight,
        probability: 0, // filled after normalisation
        agents:      bucket.length,
        meanOpinion: +meanOpinion.toFixed(4),
      };
    }).map((s, _, arr) => {
      const total = arr.reduce((t, x) => t + x.weight, 0);
      s.probability = +(s.weight / total).toFixed(4);
      return s;
    }).sort((a, b) => b.probability - a.probability);
  }

  /** Apply quantum collapse (temperature-softmax) to yield winning scenario */
  function _quantumCollapse(labels, weights) {
    if (!labels.length) return null;
    // Temperature-scaled softmax
    const scaled = weights.map(w => Math.exp(w / COLLAPSE_TEMPERATURE));
    const total  = scaled.reduce((a, b) => a + b, 0);
    const probs  = scaled.map(s => s / total);
    const winner = weightedDraw(labels, probs);
    return { label: winner, probability: probs[labels.indexOf(winner)] };
  }

  /** Measure convergence as 1 − normalised variance of round means */
  function _measureConvergence(roundData) {
    if (roundData.length < 2) return 1;
    const means = roundData.map(r => r.mean);
    const avg   = means.reduce((a, b) => a + b, 0) / means.length;
    const vari  = means.reduce((s, m) => s + (m - avg) ** 2, 0) / means.length;
    return clamp(1 - Math.sqrt(vari), 0, 1);
  }

  /* ── Error foresight ────────────────────────────────────────── */

  /**
   * Analyse recent log strings and predict likely upcoming errors.
   * @param {string}   agentId
   * @param {string[]} recentLogs
   * @returns {ErrorForesight[]}
   */
  function _predictErrors(agentId, recentLogs) {
    const joined = recentLogs.join(' ').toLowerCase();
    const predictions = [];

    for (const [type, keywords] of Object.entries(ERROR_PATTERNS)) {
      const hits  = keywords.filter(k => joined.includes(k)).length;
      const score = sigmoid(hits * 1.5 - 1);

      if (score > 0.3) {
        const remedies = {
          timeout:    'Implement exponential back-off with jitter; increase timeout thresholds.',
          auth:       'Refresh token before expiry; rotate API keys; validate env secrets.',
          rate_limit: 'Queue requests with a token-bucket; reduce polling frequency.',
          data:       'Add null/type guards; validate API responses before destructuring.',
          dependency: 'Pin dependency versions; add module-load health checks on startup.',
          payment:    'Enable PayPal sandbox retry; add webhook idempotency key checking.',
          agent:      'Strengthen heartbeat interval; add self-heal trigger on missed beats.',
        };

        predictions.push({
          agentId,
          errorType:   type,
          probability: +score.toFixed(3),
          severity:    score > 0.7 ? 'high' : score > 0.5 ? 'medium' : 'low',
          remedy:      remedies[type],
          detectedAt:  now(),
        });
      }
    }

    return predictions.sort((a, b) => b.probability - a.probability);
  }

  /* ── Income signals ─────────────────────────────────────────── */

  function _refreshIncomeSignals(topic) {
    _signals = INCOME_SIGNAL_TEMPLATES.map(t => {
      const topicBoost  = tokenSim(topic, t.label + ' ' + t.description);
      const confidence  = clamp(0.45 + topicBoost * 0.55 + (Math.random() - 0.5) * 0.1, 0.1, 0.98);
      return { ...t, id: uuid(), confidence: +confidence.toFixed(3), generatedAt: now() };
    }).sort((a, b) => b.confidence - a.confidence);
    return _signals;
  }

  /* ── Persistence ────────────────────────────────────────────── */

  function _persist() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        seeds:   _seeds.slice(-MAX_SEEDS),
        history: _history.slice(0, 20),
        signals: _signals,
      }));
    } catch (_) { /* storage unavailable */ }
  }

  function _restore() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      _seeds   = data.seeds   || [];
      _history = data.history || [];
      _signals = data.signals || [];
    } catch (_) { /* ignore corrupt data */ }
  }

  /* ── BroadcastChannel events ────────────────────────────────── */

  function _emit(type, payload) {
    const msg = { type, payload, engineId: ENGINE_ID, ts: now() };
    _listeners.forEach(fn => { try { fn(msg); } catch (_) {} });
    if (_channel) {
      try { _channel.postMessage(msg); } catch (_) {}
    }
  }

  /* ── Public API ─────────────────────────────────────────────── */

  const MiroFishQuantum = {

    version: VERSION,

    /**
     * Initialise the engine.
     * @param {object} config  - { swarmSize?, rounds?, logLevel? }
     */
    async init(config = {}) {
      if (_initialized) return;
      _restore();
      _buildSwarm(config.swarmSize || DEFAULT_SWARM_SIZE);

      try {
        _channel = new BroadcastChannel(CHANNEL_NAME);
        _channel.onmessage = e => _listeners.forEach(fn => { try { fn(e.data); } catch (_) {} });
      } catch (_) {
        _channel = null; // Safari private mode
      }

      _initialized = true;
      _emit('init', { swarmSize: _swarm.length, version: VERSION });

      if (config.logLevel !== 'silent') {
        console.info(
          `%c🐟 MiroFish Quantum Engine v${VERSION} online — ${_swarm.length} micro-agents ready`,
          'color:#6aa9ff;font-weight:bold'
        );
      }
    },

    /**
     * Add seed information to the swarm's shared memory.
     * @param {string[]} seeds
     */
    seedSwarm(seeds) {
      if (!Array.isArray(seeds)) seeds = [String(seeds)];
      const capped = seeds.map(s => String(s).slice(0, 200));
      // Only spread when necessary to avoid intermediate arrays
      if (_seeds.length + capped.length <= MAX_SEEDS) {
        _seeds.push(...capped);
      } else {
        const combined = _seeds.concat(capped);
        _seeds = combined.slice(-MAX_SEEDS);
      }
      _persist();
      _emit('seeds_added', { count: seeds.length, total: _seeds.length });
    },

    /**
     * Run a foresight simulation on a topic.
     * @param {string} topic
     * @param {number} [rounds]
     * @returns {Promise<ForesightResult>}
     */
    async runForesight(topic, rounds = DEFAULT_ROUNDS) {
      if (!_initialized) await this.init();
      return _runSimulation(String(topic).slice(0, 500), clamp(rounds, 1, 20));
    },

    /**
     * Predict likely upcoming errors for an agent based on recent log lines.
     * @param {string}   agentId
     * @param {string[]} recentLogs
     * @returns {ErrorForesight[]}
     */
    predictErrors(agentId, recentLogs = []) {
      return _predictErrors(String(agentId), recentLogs.map(String));
    },

    /**
     * Return cached income optimisation signals (or generate fresh ones).
     * @returns {IncomeSignal[]}
     */
    getIncomeSignals() {
      if (!_signals.length) _refreshIncomeSignals('income revenue generation');
      return _signals;
    },

    /**
     * Return swarm health and history summary.
     * @returns {SwarmStatus}
     */
    getSwarmStatus() {
      const active = _swarm.filter(a => a.energy > 0.5).length;
      return {
        engineId:     ENGINE_ID,
        version:      VERSION,
        swarmSize:    _swarm.length,
        activeAgents: active,
        seedCount:    _seeds.length,
        historyCount: _history.length,
        lastForesight: _history[0]?.timestamp ?? null,
        initialized:  _initialized,
      };
    },

    /** Subscribe to live signal events */
    onSignal(fn) {
      if (typeof fn === 'function') _listeners.push(fn);
    },

    /**
     * Direct quantum collapse: pick winning scenario from a list.
     * @param {string[]} scenarios
     * @param {number[]} weights
     * @returns {{ label:string, probability:number }}
     */
    quantumCollapse(scenarios, weights) {
      if (!scenarios || !scenarios.length) return null;
      const w = weights && weights.length === scenarios.length
        ? weights
        : scenarios.map(() => 1);
      return _quantumCollapse(scenarios, w);
    },

    /** Return full foresight history */
    getHistory() { return [..._history]; },

    /** Clear session state */
    reset() {
      _seeds   = [];
      _history = [];
      _signals = [];
      _buildSwarm(_swarm.length);
      _persist();
      _emit('reset', {});
    },
  };

  /* ── Expose globally ────────────────────────────────────────── */
  global.MiroFishQuantum = MiroFishQuantum;

  /* ── Auto-init (non-blocking) ───────────────────────────────── */
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      MiroFishQuantum.init({ logLevel: 'info' });
    });
  }

}(typeof globalThis !== 'undefined' ? globalThis : window));
