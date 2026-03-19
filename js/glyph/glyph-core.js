// RootIB: RB-20260319142113-58F3D121
/**
 * GLYPH CORE - Main Orchestrator
 * Version: 1.0.0
 *
 * 12D+ Recursive Coordinate Language System
 * Imports and orchestrates all GLYPH modules.
 */

const GlyphCore = (function() {
  'use strict';

  // Get dependencies
  const Base60 = typeof GlyphBase60 !== 'undefined' ? GlyphBase60 : null;
  const Symbols = typeof GlyphSymbols !== 'undefined' ? GlyphSymbols : null;
  const Patterns = typeof GlyphPatterns !== 'undefined' ? GlyphPatterns : null;

  // 6 dimensional axes (cube piercing lines)
  const AXES = ['A', 'B', 'C', 'D', 'E', 'F'];

  // Axis meanings
  const AXIS_MEANINGS = {
    A: { name: 'Vertical', positive: 'Up', negative: 'Down' },
    B: { name: 'Horizontal', positive: 'Right', negative: 'Left' },
    C: { name: 'Depth', positive: 'Front', negative: 'Back' },
    D: { name: 'Temporal', positive: 'Future', negative: 'Past' },
    E: { name: 'Energy', positive: 'Potential', negative: 'Kinetic' },
    F: { name: 'Observer', positive: 'Subject', negative: 'Object' }
  };

  /**
   * Create a GLYPH coordinate
   */
  function createCoordinate(values = {}, origin = 'O', operator = 'USER') {
    const coord = {
      A: values.A ?? 0,
      B: values.B ?? 0,
      C: values.C ?? 0,
      D: values.D ?? 0,
      E: values.E ?? 0,
      F: values.F ?? 0,
      origin,
      operator,
      depth: values.depth ?? 0,
      timestamp: Date.now()
    };

    // Add methods
    coord.toNotation = function() {
      return formatNotation(this);
    };

    coord.toBase60 = function() {
      return coordinateToBase60(this);
    };

    coord.magnitude = function() {
      return Math.sqrt(
        this.A ** 2 + this.B ** 2 + this.C ** 2 +
        this.D ** 2 + this.E ** 2 + this.F ** 2
      );
    };

    return coord;
  }

  /**
   * Format coordinate as GLYPH notation
   */
  function formatNotation(coord) {
    const S = Symbols ? Symbols.CORE : {
      CONTAINER: '\u27D0',
      RIGHT: '\u2192'
    };

    const axes = AXES.map(axis => {
      const val = coord[axis];
      if (typeof val === 'object' && val !== null && val.A !== undefined) {
        return `${axis}[${formatNotation(val)}]`;
      }
      return `${axis}:${val}`;
    }).join(':');

    return `${S.CONTAINER}${axes}${S.RIGHT}${coord.origin}${S.RIGHT}${coord.operator}${S.CONTAINER}`;
  }

  /**
   * Convert coordinate to base-60 representation
   */
  function coordinateToBase60(coord) {
    if (!Base60) {
      console.warn('GlyphBase60 not loaded');
      return null;
    }

    const result = {};
    for (const axis of AXES) {
      const val = coord[axis];
      if (typeof val === 'number') {
        result[axis] = Base60.fromDecimal(val);
      }
    }
    result.origin = coord.origin;
    result.operator = coord.operator;
    return result;
  }

  /**
   * Calculate 6D distance between coordinates
   */
  function distance(coord1, coord2) {
    let sum = 0;
    for (const axis of AXES) {
      const v1 = typeof coord1[axis] === 'number' ? coord1[axis] : 0;
      const v2 = typeof coord2[axis] === 'number' ? coord2[axis] : 0;
      sum += (v2 - v1) ** 2;
    }
    return Math.sqrt(sum);
  }

  /**
   * Interpolate between coordinates
   */
  function interpolate(coord1, coord2, t) {
    const result = {};
    for (const axis of AXES) {
      const v1 = typeof coord1[axis] === 'number' ? coord1[axis] : 0;
      const v2 = typeof coord2[axis] === 'number' ? coord2[axis] : 0;
      result[axis] = v1 + (v2 - v1) * t;
    }
    return createCoordinate(result, coord1.origin, coord1.operator);
  }

  /**
   * Create coordinate from consciousness level
   */
  function fromConsciousnessLevel(level) {
    return createCoordinate({
      A: level * 0.6,                     // Awareness
      B: Math.sin(level * 0.0314) * 50,   // Balance (wave)
      C: level > 50 ? level - 50 : 0,     // Clarity
      D: Date.now() % 60,                 // Temporal
      E: level * 0.4,                     // Energy
      F: 1                                // Observer present
    }, 'CONSCIOUSNESS', 'SYSTEM');
  }

  /**
   * Map to 6-point oscillator (quantum computing pattern)
   */
  function toOscillatorState(coord) {
    return {
      point1: Math.floor(Math.abs(coord.A)) % 60,
      point2: Math.floor(Math.abs(coord.B)) % 60,
      point3: Math.floor(Math.abs(coord.C)) % 60,
      point4: Math.floor(Math.abs(coord.D)) % 60,
      point5: Math.floor(Math.abs(coord.E)) % 60,
      point6: Math.floor(Math.abs(coord.F)) % 60,
      totalState: (Math.abs(coord.A + coord.B + coord.C + coord.D + coord.E + coord.F)) % 360
    };
  }

  /**
   * Unified API object
   */
  const GLYPH = {
    VERSION: '1.0.0',

    // Modules (available if loaded)
    base60: Base60,
    symbols: Symbols,
    patterns: Patterns,

    // Coordinate system
    coordinates: {
      AXES,
      AXIS_MEANINGS,
      create: createCoordinate,
      distance,
      interpolate,
      fromConsciousnessLevel,
      toOscillatorState,
      toNotation: formatNotation,
      toBase60: coordinateToBase60
    },

    // Quick access methods
    analyze: function(text, options) {
      if (!Patterns) {
        console.warn('GlyphPatterns not loaded');
        return null;
      }
      return Patterns.analyze(text, options);
    },

    toBase60: function(decimal) {
      if (!Base60) {
        console.warn('GlyphBase60 not loaded');
        return null;
      }
      return Base60.fromDecimal(decimal);
    },

    fromBase60: function(sexagesimal) {
      if (!Base60) {
        console.warn('GlyphBase60 not loaded');
        return null;
      }
      return Base60.toDecimal(sexagesimal);
    },

    getSymbol: function(category, name) {
      if (!Symbols) {
        console.warn('GlyphSymbols not loaded');
        return null;
      }
      return Symbols.get(category, name);
    },

    // Initialization check
    init: function() {
      const status = {
        version: this.VERSION,
        modules: {
          base60: !!Base60,
          symbols: !!Symbols,
          patterns: !!Patterns
        },
        ready: !!Base60 && !!Symbols && !!Patterns
      };

      console.log('GLYPH initialized:', status);
      return status;
    }
  };

  return GLYPH;
})();

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GlyphCore;
}
if (typeof window !== 'undefined') {
  window.GLYPH = GlyphCore;
  window.GlyphCore = GlyphCore;
}
