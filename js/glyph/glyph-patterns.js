// RootIB: RB-20260319142113-525564C4
/**
 * GLYPH PATTERN THEORY ENGINE
 * Version: 1.0.0
 *
 * Detects Builder vs Destroyer patterns.
 * Maps patterns to GLYPH symbols.
 * Scores consciousness levels.
 */

const GlyphPatterns = (function() {
  'use strict';

  // Get dependencies if available
  const Symbols = typeof GlyphSymbols !== 'undefined' ? GlyphSymbols : null;
  const Base60 = typeof GlyphBase60 !== 'undefined' ? GlyphBase60 : null;

  /**
   * Pattern catalogs
   */
  const TRUTH_MARKERS = [
    { text: 'because', weight: 1.2 },
    { text: 'therefore', weight: 1.2 },
    { text: 'evidence', weight: 1.5 },
    { text: 'research', weight: 1.3 },
    { text: 'data', weight: 1.3 },
    { text: 'permanent', weight: 1.4 },
    { text: 'foundation', weight: 1.4 },
    { text: 'long-term', weight: 1.5 },
    { text: 'quality', weight: 1.3 },
    { text: 'let me explain', weight: 1.2 },
    { text: 'in my experience', weight: 1.1 },
    { text: 'here\'s why', weight: 1.2 },
    { text: 'the reason is', weight: 1.2 },
    { text: 'consider this', weight: 1.1 },
    { text: 'it seems', weight: 1.0 },
    { text: 'from my perspective', weight: 1.0 }
  ];

  const DECEIT_MARKERS = [
    { text: 'but', weight: 1.5 },
    { text: 'however', weight: 1.4 },
    { text: 'actually', weight: 1.2 },
    { text: 'trust me', weight: 2.0 },
    { text: 'believe me', weight: 2.0 },
    { text: 'obviously', weight: 1.3 },
    { text: 'clearly', weight: 1.2 },
    { text: 'everyone knows', weight: 1.8 },
    { text: 'you should', weight: 1.3 },
    { text: 'you must', weight: 1.5 },
    { text: 'you need to', weight: 1.4 },
    { text: 'just', weight: 1.0 },
    { text: 'only', weight: 1.0 },
    { text: 'simple', weight: 1.1 },
    { text: 'easy', weight: 1.0 },
    { text: 'quick', weight: 1.2 },
    { text: 'free', weight: 1.3 },
    { text: 'guaranteed', weight: 1.8 },
    { text: 'limited time', weight: 2.0 },
    { text: 'act now', weight: 2.0 },
    { text: 'don\'t miss', weight: 1.5 },
    { text: 'exclusive', weight: 1.4 },
    { text: 'secret', weight: 1.5 }
  ];

  const MANIPULATION_PATTERNS = {
    gaslighting: {
      markers: ['you\'re crazy', 'that never happened', 'you\'re imagining', 'you\'re too sensitive', 'you\'re overreacting'],
      weight: 2.5,
      description: 'Reality denial to undermine confidence'
    },
    love_bombing: {
      markers: ['you\'re perfect', 'soul mate', 'never felt this way', 'meant to be', 'destiny'],
      weight: 2.0,
      description: 'Excessive flattery to create dependency'
    },
    triangulation: {
      markers: ['my ex', 'other people think', 'everyone says', 'compared to'],
      weight: 1.8,
      description: 'Using third party to manipulate'
    },
    future_faking: {
      markers: ['someday', 'when things calm down', 'i promise', 'we\'ll see', 'eventually'],
      weight: 1.7,
      description: 'False promises to maintain control'
    },
    silent_treatment: {
      markers: ['won\'t respond', 'ignoring', 'not talking', 'shutting down'],
      weight: 1.6,
      description: 'Withdrawal as punishment'
    },
    word_salad: {
      markers: ['circular logic', 'doesn\'t make sense', 'contradictory', 'confusing'],
      weight: 1.5,
      description: 'Confusing language to deflect'
    },
    hoovering: {
      markers: ['i\'ve changed', 'give me another chance', 'i can\'t live without', 'just one more'],
      weight: 1.8,
      description: 'Sucking back into relationship'
    },
    emotional_blackmail: {
      markers: ['if you loved me', 'after all i\'ve done', 'you owe me', 'i\'ll hurt myself'],
      weight: 2.2,
      description: 'Using fear/obligation/guilt'
    }
  };

  const FIFTEEN_DEGREE_TURNS = [
    { text: 'but', symbol: '\u21B1', description: 'Pivot after agreement' },
    { text: 'however', symbol: '\u21B1', description: 'Contradiction follows' },
    { text: 'although', symbol: '\u21B3', description: 'Qualification incoming' },
    { text: 'yes, but', symbol: '\u21BA', description: 'Agreement negation' },
    { text: 'i agree, however', symbol: '\u21BA', description: 'False agreement' }
  ];

  /**
   * Analyze text for patterns
   * @param {string} text - Text to analyze
   * @param {Object} options - Analysis options
   * @returns {Object} Analysis result
   */
  function analyze(text, options = {}) {
    const lower = text.toLowerCase();
    const result = {
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      timestamp: Date.now(),
      patterns: {
        truth: [],
        deceit: [],
        turns: [],
        manipulation: []
      },
      scores: {
        truth: 0,
        deceit: 0,
        ratio: '0:0'
      },
      dominant: 'neutral',
      confidence: 0,
      glyphNotation: '',
      frequency: 528 // Default to DNA repair frequency
    };

    let truthWeight = 0;
    let deceitWeight = 0;

    // Scan for truth markers
    for (const marker of TRUTH_MARKERS) {
      if (lower.includes(marker.text)) {
        truthWeight += marker.weight;
        result.patterns.truth.push({
          marker: marker.text,
          weight: marker.weight
        });
      }
    }

    // Scan for deceit markers
    for (const marker of DECEIT_MARKERS) {
      if (lower.includes(marker.text)) {
        deceitWeight += marker.weight;
        result.patterns.deceit.push({
          marker: marker.text,
          weight: marker.weight
        });
      }
    }

    // Detect 15-degree turns
    for (const turn of FIFTEEN_DEGREE_TURNS) {
      if (lower.includes(turn.text)) {
        deceitWeight += 0.5; // Small penalty for turns
        result.patterns.turns.push({
          marker: turn.text,
          symbol: turn.symbol,
          description: turn.description
        });
      }
    }

    // Detect manipulation patterns if requested
    if (options.detectManipulation !== false) {
      for (const [name, pattern] of Object.entries(MANIPULATION_PATTERNS)) {
        const found = pattern.markers.filter(m => lower.includes(m));
        if (found.length > 0) {
          deceitWeight += pattern.weight * found.length;
          result.patterns.manipulation.push({
            type: name,
            markers: found,
            weight: pattern.weight,
            description: pattern.description
          });
        }
      }
    }

    // Calculate scores
    const total = truthWeight + deceitWeight;
    if (total > 0) {
      result.scores.truth = Math.round((truthWeight / total) * 100);
      result.scores.deceit = Math.round((deceitWeight / total) * 100);
    } else {
      result.scores.truth = 50;
      result.scores.deceit = 50;
    }

    // Determine dominant pattern
    if (result.scores.truth > result.scores.deceit + 10) {
      result.dominant = 'truth';
      result.frequency = 528; // DNA Repair
    } else if (result.scores.deceit > result.scores.truth + 10) {
      result.dominant = 'deceit';
      result.frequency = 396; // Liberation from fear
    } else {
      result.dominant = 'neutral';
      result.frequency = 417; // Change
    }

    // Calculate confidence
    result.confidence = Math.abs(result.scores.truth - result.scores.deceit);

    // Generate ratio
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(result.scores.truth, result.scores.deceit) || 1;
    result.scores.ratio = `${Math.round(result.scores.truth / divisor)}:${Math.round(result.scores.deceit / divisor)}`;

    // Generate GLYPH notation
    result.glyphNotation = generateNotation(result);

    return result;
  }

  /**
   * Generate GLYPH notation from analysis
   */
  function generateNotation(analysis) {
    const S = Symbols ? Symbols.PATTERNS : {
      TRUTH: '\u2713',
      DECEIT: '\u2717',
      CONSCIOUSNESS: '\u2609'
    };
    const C = Symbols ? Symbols.CORE : {
      CONTAINER: '\u27D0',
      RIGHT: '\u2192'
    };

    const mainSymbol = analysis.dominant === 'truth' ? S.TRUTH :
                       analysis.dominant === 'deceit' ? S.DECEIT :
                       S.CONSCIOUSNESS;

    const turnSymbols = analysis.patterns.turns.map(t => t.symbol).join('');
    const manipCount = analysis.patterns.manipulation.length;

    let notation = `${C.CONTAINER}${mainSymbol}:${analysis.scores.truth}`;

    if (turnSymbols) {
      notation += `:${turnSymbols}`;
    }

    if (manipCount > 0) {
      notation += `:M${manipCount}`;
    }

    notation += `${C.RIGHT}${analysis.frequency}Hz${C.CONTAINER}`;

    return notation;
  }

  /**
   * Quick check for manipulation
   */
  function isManipulation(text) {
    const lower = text.toLowerCase();
    for (const pattern of Object.values(MANIPULATION_PATTERNS)) {
      if (pattern.markers.some(m => lower.includes(m))) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get consciousness level from score
   */
  function getConsciousnessLevel(truthScore) {
    if (truthScore >= 86) return { level: 'Elevated', range: '86-100', description: 'Full pattern mastery' };
    if (truthScore >= 76) return { level: 'Conscious', range: '76-85', description: 'Pattern immunity developing' };
    if (truthScore >= 51) return { level: 'Aware', range: '51-75', description: 'Seeing patterns' };
    if (truthScore >= 26) return { level: 'Awakening', range: '26-50', description: 'Starting to question' };
    return { level: 'Unconscious', range: '0-25', description: 'Reactive, manipulable' };
  }

  /**
   * Score text for specific domain
   */
  function scoreDomain(text, domainNumber) {
    const analysis = analyze(text);
    return {
      domain: domainNumber,
      consciousness: analysis.scores.truth,
      pattern: analysis.dominant,
      notation: analysis.glyphNotation
    };
  }

  // Public API
  return {
    VERSION: '1.0.0',

    // Catalogs
    TRUTH_MARKERS,
    DECEIT_MARKERS,
    MANIPULATION_PATTERNS,
    FIFTEEN_DEGREE_TURNS,

    // Methods
    analyze,
    isManipulation,
    getConsciousnessLevel,
    scoreDomain,
    generateNotation
  };
})();

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GlyphPatterns;
}
if (typeof window !== 'undefined') {
  window.GlyphPatterns = GlyphPatterns;
}
