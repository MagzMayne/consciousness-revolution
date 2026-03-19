// RootIB: RB-20260319142113-2E42935E
/**
 * GLYPH BASE-60 MATHEMATICS LIBRARY
 * Version: 1.0.0
 *
 * Clean geometry calculations without decimal approximation errors.
 * 60 divides by: 1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, 60
 * Superior for circles, waves, frequencies, sacred geometry.
 *
 * Historical: Babylonians used this 3800 years ago.
 * Modern: Still used in time (60 sec/min) and angles (360 degrees).
 */

const GlyphBase60 = (function() {
  'use strict';

  // 60-character alphabet: 0-9, A-Z (10-35), Greek (36-59)
  const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZαβγδεζηθικλμνξοπρστυφχψω';

  // Reverse lookup table (initialized lazily)
  let CHAR_VALUES = null;

  /**
   * Initialize character value lookup
   */
  function initCharValues() {
    if (CHAR_VALUES) return;
    CHAR_VALUES = {};
    for (let i = 0; i < ALPHABET.length; i++) {
      CHAR_VALUES[ALPHABET[i]] = i;
    }
  }

  /**
   * Convert decimal number to base-60 string
   * @param {number} decimal - The decimal number to convert
   * @param {number} precision - Fractional digit precision (default: 6)
   * @returns {string} Base-60 representation
   */
  function fromDecimal(decimal, precision = 6) {
    if (decimal === 0) return '0';
    if (!Number.isFinite(decimal)) return 'NaN';

    const negative = decimal < 0;
    decimal = Math.abs(decimal);

    // Split into integer and fractional parts
    let intPart = Math.floor(decimal);
    let fracPart = decimal - intPart;

    // Convert integer part
    let intResult = '';
    if (intPart === 0) {
      intResult = '0';
    } else {
      while (intPart > 0) {
        intResult = ALPHABET[intPart % 60] + intResult;
        intPart = Math.floor(intPart / 60);
      }
    }

    // Convert fractional part
    let fracResult = '';
    if (fracPart > 0 && precision > 0) {
      for (let i = 0; i < precision && fracPart > 1e-10; i++) {
        fracPart *= 60;
        const digit = Math.floor(fracPart);
        fracResult += ALPHABET[digit];
        fracPart -= digit;
      }
      // Remove trailing zeros
      fracResult = fracResult.replace(/0+$/, '');
    }

    let result = intResult;
    if (fracResult) {
      result += '.' + fracResult;
    }

    return negative ? '-' + result : result;
  }

  /**
   * Convert base-60 string to decimal number
   * @param {string} sexagesimal - Base-60 string
   * @returns {number} Decimal value
   */
  function toDecimal(sexagesimal) {
    initCharValues();

    if (!sexagesimal || sexagesimal === 'NaN') return NaN;

    const negative = sexagesimal.startsWith('-');
    if (negative) sexagesimal = sexagesimal.slice(1);

    const [intPart, fracPart] = sexagesimal.split('.');

    // Convert integer part
    let result = 0;
    for (let i = 0; i < intPart.length; i++) {
      const charVal = CHAR_VALUES[intPart[i]];
      if (charVal === undefined) return NaN;
      result = result * 60 + charVal;
    }

    // Convert fractional part
    if (fracPart) {
      let divisor = 60;
      for (let i = 0; i < fracPart.length; i++) {
        const charVal = CHAR_VALUES[fracPart[i]];
        if (charVal === undefined) return NaN;
        result += charVal / divisor;
        divisor *= 60;
      }
    }

    return negative ? -result : result;
  }

  /**
   * Clean fractions in base-60 (no infinite decimals)
   */
  const CLEAN_FRACTIONS = {
    '1/2': { base60: '30', decimal: 30 },
    '1/3': { base60: '20', decimal: 20 },
    '2/3': { base60: '40', decimal: 40 },
    '1/4': { base60: 'F', decimal: 15 },
    '3/4': { base60: '2D', decimal: 45 },
    '1/5': { base60: 'C', decimal: 12 },
    '1/6': { base60: 'A', decimal: 10 },
    '5/6': { base60: '32', decimal: 50 },
    '1/10': { base60: '6', decimal: 6 },
    '1/12': { base60: '5', decimal: 5 },
    '1/15': { base60: '4', decimal: 4 },
    '1/20': { base60: '3', decimal: 3 },
    '1/30': { base60: '2', decimal: 2 }
  };

  /**
   * Check if fraction divides cleanly in base-60
   * @param {number} numerator
   * @param {number} denominator
   * @returns {boolean}
   */
  function isCleanDivision(numerator, denominator) {
    return 60 % denominator === 0;
  }

  /**
   * Base-60 arithmetic operations
   */
  function add(a, b) {
    return fromDecimal(toDecimal(a) + toDecimal(b));
  }

  function subtract(a, b) {
    return fromDecimal(toDecimal(a) - toDecimal(b));
  }

  function multiply(a, b) {
    return fromDecimal(toDecimal(a) * toDecimal(b));
  }

  function divide(a, b) {
    return fromDecimal(toDecimal(a) / toDecimal(b));
  }

  /**
   * Circle/Angle operations (native to base-60)
   */
  const circle = {
    FULL_ROTATION: 360,

    /**
     * Convert degrees to DMS (Degrees, Minutes, Seconds)
     * This IS base-60 representation
     */
    toDMS(degrees) {
      const d = Math.floor(degrees);
      const mFloat = (degrees - d) * 60;
      const m = Math.floor(mFloat);
      const s = (mFloat - m) * 60;

      return {
        degrees: d,
        minutes: m,
        seconds: Math.round(s * 1000) / 1000,
        notation: `${d}°${m}'${s.toFixed(2)}"`
      };
    },

    /**
     * Convert DMS to decimal degrees
     */
    fromDMS(d, m = 0, s = 0) {
      return d + m / 60 + s / 3600;
    },

    /**
     * Divide circle into n parts
     */
    divide(n) {
      return 360 / n;
    }
  };

  /**
   * Frequency/Wave operations
   */
  const frequency = {
    /**
     * Solfeggio frequencies with base-60 representation
     */
    SOLFEGGIO: {
      396: { name: 'Liberation', base60: '6.36', ratio: 6.6 },
      417: { name: 'Change', base60: '6.57', ratio: 6.95 },
      528: { name: 'DNA Repair', base60: '8.48', ratio: 8.8 },
      639: { name: 'Connection', base60: 'A.39', ratio: 10.65 },
      741: { name: 'Expression', base60: 'C.21', ratio: 12.35 },
      852: { name: 'Intuition', base60: 'E.12', ratio: 14.2 },
      963: { name: 'Unity', base60: 'G.03', ratio: 16.05 }
    },

    /**
     * Convert Hz to base-60 (relative to 60Hz base)
     */
    toBase60(hz) {
      return fromDecimal(hz / 60);
    },

    /**
     * Convert base-60 to Hz
     */
    toHz(base60) {
      return toDecimal(base60) * 60;
    },

    /**
     * Get nearest Solfeggio frequency
     */
    nearestSolfeggio(hz) {
      const freqs = Object.keys(this.SOLFEGGIO).map(Number);
      let nearest = freqs[0];
      let minDiff = Math.abs(hz - nearest);

      for (const f of freqs) {
        const diff = Math.abs(hz - f);
        if (diff < minDiff) {
          minDiff = diff;
          nearest = f;
        }
      }

      return { frequency: nearest, ...this.SOLFEGGIO[nearest] };
    }
  };

  /**
   * Tesla 3-6-9 pattern operations
   */
  const tesla = {
    // 3, 6, 9 are key divisors of 60
    pattern: [3, 6, 9],

    /**
     * Check if number aligns with 3-6-9 pattern
     */
    isAligned(n) {
      const sum = this.digitSum(n);
      return sum === 3 || sum === 6 || sum === 9;
    },

    /**
     * Calculate digit sum (recursive until single digit)
     */
    digitSum(n) {
      n = Math.abs(Math.floor(n));
      while (n > 9) {
        n = n.toString().split('').reduce((a, b) => a + parseInt(b), 0);
      }
      return n;
    },

    /**
     * Generate Tesla sequence
     */
    sequence(length = 9) {
      const seq = [];
      for (let i = 1; i <= length; i++) {
        seq.push(i * 3);
        seq.push(i * 6);
        seq.push(i * 9);
      }
      return seq;
    }
  };

  // Public API
  return {
    VERSION: '1.0.0',
    ALPHABET,

    // Core conversion
    fromDecimal,
    toDecimal,

    // Arithmetic
    add,
    subtract,
    multiply,
    divide,

    // Clean fractions
    CLEAN_FRACTIONS,
    isCleanDivision,

    // Specialized
    circle,
    frequency,
    tesla
  };
})();

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GlyphBase60;
}
if (typeof window !== 'undefined') {
  window.GlyphBase60 = GlyphBase60;
}
