// RootIB: RB-20260319142113-4DA5D68A
/**
 * GLYPH ANALYTICS MODULE
 * Version: 1.0.0
 *
 * Usage tracking with GLYPH-encoded metrics.
 * Consciousness-aware analytics for the platform.
 */

const GlyphAnalytics = (function() {
  'use strict';

  // Get dependencies
  const Envelope = typeof GlyphEnvelope !== 'undefined' ? GlyphEnvelope : null;
  const Time = typeof GlyphTimestamp !== 'undefined' ? GlyphTimestamp : null;
  const Storage = typeof GlyphStorage !== 'undefined' ? GlyphStorage : null;
  const Events = typeof GlyphEvents !== 'undefined' ? GlyphEvents : null;
  const Patterns = typeof GlyphPatterns !== 'undefined' ? GlyphPatterns : null;

  // Analytics state
  let session = {
    id: Time ? Time.sessionId() : Date.now().toString(),
    start: Date.now(),
    events: [],
    pageViews: [],
    toolUsage: {},
    patterns: {
      truth: 0,
      deceit: 0,
      neutral: 0,
      manipulation: 0
    },
    consciousness: {
      scores: [],
      average: 50,
      trend: 'STABLE'
    }
  };

  // Metrics aggregation
  const metrics = {
    totalSessions: 0,
    totalEvents: 0,
    toolPopularity: {},
    domainUsage: {},
    patternTotals: {
      truth: 0,
      deceit: 0,
      neutral: 0
    },
    manipulationDetections: 0,
    avgConsciousness: 50
  };

  /**
   * Initialize analytics (auto-subscribes to events)
   */
  function init() {
    // Load persisted metrics
    loadMetrics();

    // Subscribe to GLYPH events
    if (Events) {
      Events.on('*', handleEvent);
      Events.on(Events.TYPES.PATTERN_DETECTED, handlePattern);
      Events.on(Events.TYPES.MANIPULATION_ALERT, handleManipulation);
      Events.on(Events.TYPES.TOOL_OPEN, handleToolOpen);
      Events.on(Events.TYPES.CONSCIOUSNESS_SHIFT, handleConsciousnessShift);
    }

    // Track session start
    metrics.totalSessions++;
    saveMetrics();

    console.log('GLYPH Analytics initialized');
    return getStatus();
  }

  /**
   * Handle any event
   */
  function handleEvent(event) {
    session.events.push({
      type: event.eventType,
      timestamp: event.timestamp,
      id: event.eventId
    });

    metrics.totalEvents++;
  }

  /**
   * Handle pattern detection
   */
  function handlePattern(event) {
    const analysis = event.data?.payload || event.data;

    if (analysis && analysis.dominant) {
      session.patterns[analysis.dominant]++;
      metrics.patternTotals[analysis.dominant]++;
    }

    if (analysis && typeof analysis.scores?.truth === 'number') {
      session.consciousness.scores.push(analysis.scores.truth);
      updateConsciousnessAverage();
    }
  }

  /**
   * Handle manipulation alert
   */
  function handleManipulation(event) {
    session.patterns.manipulation++;
    metrics.manipulationDetections++;
  }

  /**
   * Handle tool open
   */
  function handleToolOpen(event) {
    const tool = event.data?.payload?.tool || event.data?.tool || 'unknown';

    if (!session.toolUsage[tool]) {
      session.toolUsage[tool] = 0;
    }
    session.toolUsage[tool]++;

    if (!metrics.toolPopularity[tool]) {
      metrics.toolPopularity[tool] = 0;
    }
    metrics.toolPopularity[tool]++;
  }

  /**
   * Handle consciousness shift
   */
  function handleConsciousnessShift(event) {
    const data = event.data?.payload || event.data;
    if (data && typeof data.to === 'number') {
      session.consciousness.scores.push(data.to);
      updateConsciousnessAverage();
    }
  }

  /**
   * Update consciousness average
   */
  function updateConsciousnessAverage() {
    const scores = session.consciousness.scores;
    if (scores.length === 0) return;

    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    session.consciousness.average = Math.round(avg);

    // Calculate trend
    if (scores.length >= 3) {
      const recent = scores.slice(-3);
      const first = recent[0];
      const last = recent[recent.length - 1];

      if (last > first + 5) {
        session.consciousness.trend = 'ASCENDING';
      } else if (last < first - 5) {
        session.consciousness.trend = 'DESCENDING';
      } else {
        session.consciousness.trend = 'STABLE';
      }
    }

    // Update global average
    metrics.avgConsciousness = Math.round(
      (metrics.avgConsciousness + session.consciousness.average) / 2
    );
  }

  /**
   * Track page view
   *
   * @param {string} page - Page name or path
   * @param {Object} metadata - Additional metadata
   */
  function trackPage(page, metadata = {}) {
    const view = {
      page: page,
      timestamp: Time ? Time.timestamp() : new Date().toISOString(),
      duration: null, // Filled on next page or end
      ...metadata
    };

    // End previous page view
    if (session.pageViews.length > 0) {
      const prev = session.pageViews[session.pageViews.length - 1];
      if (!prev.duration) {
        prev.duration = Date.now() - (new Date(prev.timestamp)).getTime();
      }
    }

    session.pageViews.push(view);

    return view;
  }

  /**
   * Track tool usage
   *
   * @param {string} toolName - Tool identifier
   * @param {string} action - Action performed
   * @param {Object} data - Action data
   */
  function trackTool(toolName, action = 'use', data = {}) {
    const event = {
      tool: toolName,
      action: action,
      timestamp: Time ? Time.timestamp() : new Date().toISOString(),
      data: data
    };

    // Update counters
    if (!session.toolUsage[toolName]) {
      session.toolUsage[toolName] = 0;
    }
    session.toolUsage[toolName]++;

    if (!metrics.toolPopularity[toolName]) {
      metrics.toolPopularity[toolName] = 0;
    }
    metrics.toolPopularity[toolName]++;

    // Emit event if Events available
    if (Events) {
      Events.emit(Events.TYPES.TOOL_ANALYZE, event);
    }

    return event;
  }

  /**
   * Track user input with pattern analysis
   *
   * @param {string} text - User input text
   * @param {string} context - Context (tool name, etc.)
   */
  function trackInput(text, context = 'unknown') {
    // Analyze patterns if available
    let analysis = null;
    if (Patterns) {
      analysis = Patterns.analyze(text);
      handlePattern({ data: analysis });
    }

    return {
      context: context,
      length: text.length,
      analysis: analysis,
      timestamp: Time ? Time.timestamp() : new Date().toISOString()
    };
  }

  /**
   * Track domain usage
   *
   * @param {number} domain - Domain number (1-7)
   */
  function trackDomain(domain) {
    if (!metrics.domainUsage[domain]) {
      metrics.domainUsage[domain] = 0;
    }
    metrics.domainUsage[domain]++;
  }

  /**
   * Get session analytics
   *
   * @returns {Object} Session analytics
   */
  function getSession() {
    return {
      ...session,
      duration: Date.now() - session.start,
      eventCount: session.events.length,
      pageCount: session.pageViews.length,
      toolCount: Object.keys(session.toolUsage).length
    };
  }

  /**
   * Get aggregated metrics
   *
   * @returns {Object} Metrics summary
   */
  function getMetrics() {
    return {
      ...metrics,
      topTools: getTopTools(5),
      topDomains: getTopDomains(3),
      patternRatio: calculatePatternRatio(),
      healthScore: calculateHealthScore()
    };
  }

  /**
   * Get top used tools
   *
   * @param {number} limit - Number of tools
   * @returns {Object[]}
   */
  function getTopTools(limit = 5) {
    return Object.entries(metrics.toolPopularity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tool, count]) => ({ tool, count }));
  }

  /**
   * Get top domains
   *
   * @param {number} limit - Number of domains
   * @returns {Object[]}
   */
  function getTopDomains(limit = 3) {
    const domainNames = {
      1: 'COMMAND', 2: 'BUILD', 3: 'CONNECT',
      4: 'PROTECT', 5: 'GROW', 6: 'LEARN', 7: 'TRANSCEND'
    };

    return Object.entries(metrics.domainUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([domain, count]) => ({
        domain: parseInt(domain),
        name: domainNames[domain] || 'UNKNOWN',
        count
      }));
  }

  /**
   * Calculate pattern ratio (truth vs deceit)
   *
   * @returns {Object}
   */
  function calculatePatternRatio() {
    const { truth, deceit, neutral } = metrics.patternTotals;
    const total = truth + deceit + neutral;

    if (total === 0) return { truth: 0, deceit: 0, neutral: 0, ratio: 1 };

    return {
      truth: Math.round((truth / total) * 100),
      deceit: Math.round((deceit / total) * 100),
      neutral: Math.round((neutral / total) * 100),
      ratio: deceit > 0 ? (truth / deceit).toFixed(2) : truth
    };
  }

  /**
   * Calculate platform health score
   *
   * @returns {Object}
   */
  function calculateHealthScore() {
    const patternRatio = calculatePatternRatio();
    const consciousnessScore = metrics.avgConsciousness;
    const manipulationRate = metrics.totalEvents > 0
      ? (metrics.manipulationDetections / metrics.totalEvents) * 100
      : 0;

    // Health = high consciousness + high truth + low manipulation
    const health = Math.round(
      (consciousnessScore * 0.4) +
      (patternRatio.truth * 0.4) +
      ((100 - manipulationRate) * 0.2)
    );

    let status = 'HEALTHY';
    if (health < 50) status = 'DEGRADED';
    if (health < 30) status = 'CRITICAL';

    return {
      score: health,
      status: status,
      factors: {
        consciousness: consciousnessScore,
        truthRatio: patternRatio.truth,
        manipulationRate: Math.round(manipulationRate)
      }
    };
  }

  /**
   * Get current status
   *
   * @returns {Object}
   */
  function getStatus() {
    return {
      sessionId: session.id,
      sessionDuration: Date.now() - session.start,
      eventsThisSession: session.events.length,
      consciousnessAvg: session.consciousness.average,
      consciousnessTrend: session.consciousness.trend,
      healthScore: calculateHealthScore()
    };
  }

  /**
   * Save metrics to storage
   */
  function saveMetrics() {
    if (Storage) {
      Storage.set('analytics_metrics', metrics, { analyze: false });
    } else {
      try {
        localStorage.setItem('glyph_analytics', JSON.stringify(metrics));
      } catch (e) {
        console.warn('Failed to save analytics:', e);
      }
    }
  }

  /**
   * Load metrics from storage
   */
  function loadMetrics() {
    let stored = null;

    if (Storage) {
      stored = Storage.get('analytics_metrics', true);
    } else {
      try {
        const raw = localStorage.getItem('glyph_analytics');
        stored = raw ? JSON.parse(raw) : null;
      } catch (e) {
        console.warn('Failed to load analytics:', e);
      }
    }

    if (stored) {
      Object.assign(metrics, stored);
    }
  }

  /**
   * Export analytics data
   *
   * @returns {Object}
   */
  function exportData() {
    return {
      exported: new Date().toISOString(),
      session: getSession(),
      metrics: getMetrics(),
      version: '1.0.0'
    };
  }

  /**
   * Reset session (keeps metrics)
   */
  function resetSession() {
    // Save current session metrics
    saveMetrics();

    // Create new session
    session = {
      id: Time ? Time.sessionId() : Date.now().toString(),
      start: Date.now(),
      events: [],
      pageViews: [],
      toolUsage: {},
      patterns: { truth: 0, deceit: 0, neutral: 0, manipulation: 0 },
      consciousness: { scores: [], average: 50, trend: 'STABLE' }
    };
  }

  /**
   * Reset all analytics
   */
  function resetAll() {
    resetSession();

    // Reset metrics
    metrics.totalSessions = 0;
    metrics.totalEvents = 0;
    metrics.toolPopularity = {};
    metrics.domainUsage = {};
    metrics.patternTotals = { truth: 0, deceit: 0, neutral: 0 };
    metrics.manipulationDetections = 0;
    metrics.avgConsciousness = 50;

    saveMetrics();
  }

  // Auto-save on page unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', saveMetrics);
  }

  // Public API
  return {
    VERSION: '1.0.0',

    // Initialization
    init,

    // Tracking
    trackPage,
    trackTool,
    trackInput,
    trackDomain,

    // Retrieval
    getSession,
    getMetrics,
    getStatus,
    getTopTools,
    getTopDomains,

    // Analysis
    calculatePatternRatio,
    calculateHealthScore,

    // Management
    exportData,
    resetSession,
    resetAll,
    saveMetrics,
    loadMetrics
  };
})();

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GlyphAnalytics;
}
if (typeof window !== 'undefined') {
  window.GlyphAnalytics = GlyphAnalytics;
}
