// RootIB: RB-20260319142113-2C0D626D
/**
 * GLYPH ENVELOPE MODULE
 * Version: 1.0.0
 *
 * Universal data wrapper for the GLYPH system.
 * Every piece of data flows through GLYPH envelopes.
 */

const GlyphEnvelope = (function() {
  'use strict';

  // Get dependencies
  const Core = typeof GLYPH !== 'undefined' ? GLYPH : (typeof GlyphCore !== 'undefined' ? GlyphCore : null);
  const Time = typeof GlyphTimestamp !== 'undefined' ? GlyphTimestamp : (typeof GlyphTime !== 'undefined' ? GlyphTime : null);
  const Patterns = typeof GlyphPatterns !== 'undefined' ? GlyphPatterns : null;

  // Version for envelope format
  const ENVELOPE_VERSION = '2.0.0';

  // Origin types
  const ORIGINS = {
    USER: 'USER',
    SYSTEM: 'SYSTEM',
    ARAYA: 'ARAYA',
    TOOL: 'TOOL',
    API: 'API',
    BRAIN: 'BRAIN',
    MERGE: 'MERGE'
  };

  // Domain mapping
  const DOMAINS = {
    COMMAND: 1,
    BUILD: 2,
    CONNECT: 3,
    PROTECT: 4,
    GROW: 5,
    LEARN: 6,
    TRANSCEND: 7,
    UNKNOWN: 0
  };

  /**
   * Create a GLYPH envelope around any data
   *
   * @param {any} data - The data to wrap
   * @param {Object} options - Envelope options
   * @returns {Object} GLYPH envelope
   */
  function wrap(data, options = {}) {
    const {
      origin = ORIGINS.SYSTEM,
      domain = DOMAINS.UNKNOWN,
      analyze = true,
      coordinates = null,
      metadata = {}
    } = options;

    // Run pattern analysis if data contains text
    let patternData = null;
    let textContent = null;

    // Extract text content for analysis
    if (typeof data === 'string') {
      textContent = data;
    } else if (data && typeof data === 'object') {
      textContent = data.text || data.message || data.content || null;
    }

    // Analyze patterns if we have text and analysis is enabled
    if (analyze && textContent && Patterns) {
      try {
        patternData = Patterns.analyze(textContent, {
          detectManipulation: true
        });
      } catch (e) {
        console.warn('Pattern analysis failed:', e);
      }
    }

    // Create coordinates from pattern or provided
    let envCoordinates = coordinates;
    if (!envCoordinates && patternData && Core && Core.coordinates) {
      envCoordinates = Core.coordinates.create({
        A: patternData.scores.truth || 0,
        B: 100 - (patternData.scores.deceit || 0),
        C: patternData.confidence || 0,
        D: Time ? parseInt(Time.micro(), 36) % 60 : 0,
        E: (patternData.frequency || 528) / 100,
        F: patternData.patterns.manipulation?.length > 0 ? -1 : 1
      }, origin, 'ENVELOPE');
    } else if (!envCoordinates && Core && Core.coordinates) {
      envCoordinates = Core.coordinates.create({}, origin, 'ENVELOPE');
    }

    // Build the envelope
    const envelope = {
      // GLYPH metadata header
      _glyph: {
        version: ENVELOPE_VERSION,
        created: Time ? Time.timestamp() : new Date().toISOString(),
        session: Time ? Time.sessionId() : null,
        eventId: Time ? Time.eventId() : `${Date.now()}`
      },

      // 6D Coordinates
      coordinates: envCoordinates,

      // GLYPH notation string
      notation: patternData ? patternData.glyphNotation : null,

      // Pattern analysis results
      pattern: patternData ? {
        type: patternData.dominant,
        score: patternData.scores.truth,
        ratio: patternData.scores.ratio,
        frequency: patternData.frequency,
        manipulation: patternData.patterns.manipulation || [],
        turns: patternData.patterns.turns || []
      } : null,

      // Origin and domain
      origin: origin,
      domain: domain,

      // Additional metadata
      metadata: {
        ...metadata,
        textLength: textContent ? textContent.length : 0,
        hasAnalysis: !!patternData
      },

      // The actual payload
      data: data
    };

    return envelope;
  }

  /**
   * Unwrap a GLYPH envelope to get raw data
   *
   * @param {Object} envelope - GLYPH envelope
   * @returns {any} Unwrapped data
   */
  function unwrap(envelope) {
    if (!isValid(envelope)) {
      return envelope; // Not a GLYPH envelope, return as-is
    }
    return envelope.data;
  }

  /**
   * Check if object is a valid GLYPH envelope
   *
   * @param {Object} envelope - Object to check
   * @returns {boolean}
   */
  function isValid(envelope) {
    return envelope &&
           typeof envelope === 'object' &&
           envelope._glyph &&
           envelope._glyph.version;
  }

  /**
   * Get envelope version
   *
   * @param {Object} envelope - GLYPH envelope
   * @returns {string|null} Version string or null
   */
  function getVersion(envelope) {
    return isValid(envelope) ? envelope._glyph.version : null;
  }

  /**
   * Update envelope metadata
   *
   * @param {Object} envelope - GLYPH envelope
   * @param {Object} updates - Metadata updates
   * @returns {Object} Updated envelope
   */
  function update(envelope, updates = {}) {
    if (!isValid(envelope)) {
      throw new Error('Invalid GLYPH envelope');
    }

    return {
      ...envelope,
      _glyph: {
        ...envelope._glyph,
        modified: Time ? Time.timestamp() : new Date().toISOString()
      },
      metadata: {
        ...envelope.metadata,
        ...updates
      }
    };
  }

  /**
   * Merge multiple envelopes
   *
   * @param {Object[]} envelopes - Array of GLYPH envelopes
   * @returns {Object} Merged envelope
   */
  function merge(envelopes) {
    if (!Array.isArray(envelopes) || envelopes.length === 0) {
      throw new Error('Must provide array of envelopes');
    }

    // Filter to valid envelopes
    const valid = envelopes.filter(isValid);
    if (valid.length === 0) {
      throw new Error('No valid envelopes to merge');
    }

    // Average coordinates
    const avgCoords = {};
    const axes = ['A', 'B', 'C', 'D', 'E', 'F'];

    for (const axis of axes) {
      const values = valid
        .filter(e => e.coordinates && typeof e.coordinates[axis] === 'number')
        .map(e => e.coordinates[axis]);

      if (values.length > 0) {
        avgCoords[axis] = values.reduce((a, b) => a + b, 0) / values.length;
      } else {
        avgCoords[axis] = 0;
      }
    }

    // Average pattern scores
    const patternScores = valid
      .filter(e => e.pattern && typeof e.pattern.score === 'number')
      .map(e => e.pattern.score);

    const avgScore = patternScores.length > 0
      ? patternScores.reduce((a, b) => a + b, 0) / patternScores.length
      : null;

    // Collect all manipulation patterns
    const allManipulation = valid
      .filter(e => e.pattern && Array.isArray(e.pattern.manipulation))
      .flatMap(e => e.pattern.manipulation);

    // Determine dominant pattern type
    const typeVotes = {};
    valid.forEach(e => {
      if (e.pattern && e.pattern.type) {
        typeVotes[e.pattern.type] = (typeVotes[e.pattern.type] || 0) + 1;
      }
    });
    const dominantType = Object.entries(typeVotes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';

    // Create merged envelope
    return wrap({
      mergedFrom: valid.length,
      sources: valid.map(e => e._glyph.eventId),
      mergedData: valid.map(e => e.data)
    }, {
      origin: ORIGINS.MERGE,
      domain: valid[0].domain,
      analyze: false,
      coordinates: Core && Core.coordinates
        ? Core.coordinates.create(avgCoords, ORIGINS.MERGE, 'MERGED')
        : avgCoords,
      metadata: {
        mergedAt: Time ? Time.timestamp() : Date.now(),
        sourceCount: valid.length,
        avgPatternScore: avgScore,
        dominantType: dominantType,
        manipulationCount: allManipulation.length
      }
    });
  }

  /**
   * Clone an envelope (deep copy)
   *
   * @param {Object} envelope - GLYPH envelope
   * @returns {Object} Cloned envelope
   */
  function clone(envelope) {
    return JSON.parse(JSON.stringify(envelope));
  }

  /**
   * Check if envelope contains manipulation patterns
   *
   * @param {Object} envelope - GLYPH envelope
   * @returns {boolean}
   */
  function hasManipulation(envelope) {
    return isValid(envelope) &&
           envelope.pattern &&
           Array.isArray(envelope.pattern.manipulation) &&
           envelope.pattern.manipulation.length > 0;
  }

  /**
   * Get pattern score from envelope
   *
   * @param {Object} envelope - GLYPH envelope
   * @returns {number|null}
   */
  function getScore(envelope) {
    return isValid(envelope) && envelope.pattern
      ? envelope.pattern.score
      : null;
  }

  /**
   * Get consciousness level description
   *
   * @param {Object} envelope - GLYPH envelope
   * @returns {Object|null}
   */
  function getConsciousnessLevel(envelope) {
    const score = getScore(envelope);
    if (score === null) return null;

    if (Patterns && Patterns.getConsciousnessLevel) {
      return Patterns.getConsciousnessLevel(score);
    }

    // Fallback if Patterns not available
    if (score >= 86) return { level: 'Elevated', range: '86-100' };
    if (score >= 76) return { level: 'Conscious', range: '76-85' };
    if (score >= 51) return { level: 'Aware', range: '51-75' };
    if (score >= 26) return { level: 'Awakening', range: '26-50' };
    return { level: 'Unconscious', range: '0-25' };
  }

  /**
   * Convert envelope to compact string representation
   *
   * @param {Object} envelope - GLYPH envelope
   * @returns {string}
   */
  function toCompact(envelope) {
    if (!isValid(envelope)) return '[INVALID]';

    const parts = [
      envelope._glyph.eventId,
      envelope.origin,
      envelope.domain,
      envelope.pattern ? envelope.pattern.score : '?',
      envelope.pattern ? envelope.pattern.type[0].toUpperCase() : '?'
    ];

    return `[${parts.join('|')}]`;
  }

  /**
   * Create envelope for error
   *
   * @param {Error} error - Error object
   * @param {Object} context - Additional context
   * @returns {Object} Error envelope
   */
  function wrapError(error, context = {}) {
    return wrap({
      type: 'ERROR',
      message: error.message,
      stack: error.stack,
      context: context
    }, {
      origin: ORIGINS.SYSTEM,
      domain: DOMAINS.UNKNOWN,
      analyze: false,
      metadata: {
        isError: true,
        errorType: error.name
      }
    });
  }

  // Public API
  return {
    VERSION: ENVELOPE_VERSION,
    ORIGINS,
    DOMAINS,

    // Core methods
    wrap,
    unwrap,
    isValid,
    getVersion,
    update,
    merge,
    clone,

    // Pattern helpers
    hasManipulation,
    getScore,
    getConsciousnessLevel,

    // Utilities
    toCompact,
    wrapError
  };
})();

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GlyphEnvelope;
}
if (typeof window !== 'undefined') {
  window.GlyphEnvelope = GlyphEnvelope;
}
