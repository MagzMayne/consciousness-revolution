// RootIB: RB-20260319142113-356E6DC5
/**
 * GLYPH SYMBOL REGISTRY
 * Version: 1.0.0
 *
 * Unicode symbol mappings for GLYPH notation.
 * Full symbol space for consciousness/pattern representation.
 */

const GlyphSymbols = (function() {
  'use strict';

  /**
   * Core GLYPH notation symbols
   */
  const CORE = {
    // Structural
    CONTAINER: '\u27D0',      // ⟐ - Boundary/Container (start/end of notation)
    INFINITY: '\u221E',       // ∞ - Recursion/Infinite depth
    OMEGA: '\u03A9',          // Ω - Completion/Termination
    ALPHA: '\u0391',          // Α - Beginning/Origin

    // Flow/Junction
    JUNCTION: '\u29EB',       // ⧫ - Decision point (lozenge)
    TEMPORAL: '\u29D7',       // ⧗ - Time-dependent
    CYCLE: '\u21BB',          // ↻ - Feedback loop/Return
    ADAPTIVE: '\u2646',       // ♆ - Fluid/Variable element

    // Logic
    THEREFORE: '\u2234',      // ∴ - Consequence/Therefore
    BECAUSE: '\u2235',        // ∵ - Because/Since
    AND: '\u2227',            // ∧ - Logical AND
    OR: '\u2228',             // ∨ - Logical OR
    NOT: '\u00AC',            // ¬ - Negation
    IMPLIES: '\u21D2',        // ⇒ - Implies
    IFF: '\u21D4',            // ⇔ - If and only if
    EQUIVALENT: '\u2261',     // ≡ - Equivalent

    // Arrows
    RIGHT: '\u2192',          // →
    LEFT: '\u2190',           // ←
    UP: '\u2191',             // ↑
    DOWN: '\u2193',           // ↓
    BIDIRECTIONAL: '\u2194',  // ↔
    TURN: '\u21B1'            // ↱ - 15-degree turn marker
  };

  /**
   * Mathematical symbols
   */
  const MATH = {
    INTEGRAL: '\u222B',       // ∫
    PARTIAL: '\u2202',        // ∂
    NABLA: '\u2207',          // ∇ - Gradient
    SUM: '\u2211',            // Σ
    PRODUCT: '\u220F',        // Π
    SQRT: '\u221A',           // √
    PROPORTIONAL: '\u221D',   // ∝
    APPROX: '\u2248',         // ≈
    NOTEQUAL: '\u2260',       // ≠
    LESSTHAN: '\u003C',       // <
    GREATERTHAN: '\u003E',    // >
    PLUSMINUS: '\u00B1'       // ±
  };

  /**
   * Geometric symbols
   */
  const GEOMETRY = {
    TRIANGLE: '\u25B3',       // △
    TRIANGLE_FILLED: '\u25B2',// ▲
    SQUARE: '\u25A1',         // □
    SQUARE_FILLED: '\u25A0',  // ■
    CIRCLE: '\u25CB',         // ○
    CIRCLE_FILLED: '\u25CF',  // ●
    DIAMOND: '\u25C7',        // ◇
    DIAMOND_FILLED: '\u25C6', // ◆
    HEXAGON: '\u2B21',        // ⬡
    STAR: '\u2605',           // ★
    STAR_OPEN: '\u2606'       // ☆
  };

  /**
   * Pattern Theory symbols
   */
  const PATTERNS = {
    // Truth/Deceit
    TRUTH: '\u2713',          // ✓ - Checkmark
    DECEIT: '\u2717',         // ✗ - X mark
    QUESTION: '\u2047',       // ⁇ - Double question

    // Builder/Destroyer
    BUILDER: '\u2302',        // ⌂ - House/Build
    DESTROYER: '\u2620',      // ☠ - Skull/Destroy

    // Consciousness
    CONSCIOUSNESS: '\u2609',  // ☉ - Sun
    AWARENESS: '\u263C',      // ☼ - Sun with rays
    AWAKENING: '\u2600',      // ☀ - Black sun

    // Emotional
    POSITIVE: '\u263A',       // ☺ - Smile
    NEGATIVE: '\u2639',       // ☹ - Frown
    NEUTRAL: '\u25CB',        // ○ - Circle

    // Warning
    WARNING: '\u26A0',        // ⚠
    DANGER: '\u2620',         // ☠
    ALERT: '\u26A1'           // ⚡
  };

  /**
   * Domain symbols (7 Domains)
   */
  const DOMAINS = {
    COMMAND: { symbol: '\u2318', number: 1, color: '#FFD700' },    // ⌘
    BUILD: { symbol: '\u2692', number: 2, color: '#00FF00' },      // ⚒
    CONNECT: { symbol: '\u260E', number: 3, color: '#00FFFF' },    // ☎
    PROTECT: { symbol: '\u2694', number: 4, color: '#FF0000' },    // ⚔
    GROW: { symbol: '\u2697', number: 5, color: '#00AA00' },       // ⚗
    LEARN: { symbol: '\u270F', number: 6, color: '#AA00FF' },      // ✏
    TRANSCEND: { symbol: '\u2609', number: 7, color: '#FFFF00' }   // ☉
  };

  /**
   * Frequency symbols (Solfeggio)
   */
  const FREQUENCIES = {
    396: { symbol: '\u266D', name: 'Liberation' },   // ♭
    417: { symbol: '\u266E', name: 'Change' },       // ♮
    528: { symbol: '\u266F', name: 'DNA Repair' },   // ♯
    639: { symbol: '\u2669', name: 'Connection' },   // ♩
    741: { symbol: '\u266A', name: 'Expression' },   // ♪
    852: { symbol: '\u266B', name: 'Intuition' },    // ♫
    963: { symbol: '\u266C', name: 'Unity' }         // ♬
  };

  /**
   * Greek letters for coordinate notation
   */
  const GREEK = {
    alpha: '\u03B1',   // α
    beta: '\u03B2',    // β
    gamma: '\u03B3',   // γ
    delta: '\u03B4',   // δ
    epsilon: '\u03B5', // ε
    zeta: '\u03B6',    // ζ
    eta: '\u03B7',     // η
    theta: '\u03B8',   // θ
    iota: '\u03B9',    // ι
    kappa: '\u03BA',   // κ
    lambda: '\u03BB',  // λ
    mu: '\u03BC',      // μ
    nu: '\u03BD',      // ν
    xi: '\u03BE',      // ξ
    omicron: '\u03BF', // ο
    pi: '\u03C0',      // π
    rho: '\u03C1',     // ρ
    sigma: '\u03C3',   // σ
    tau: '\u03C4',     // τ
    upsilon: '\u03C5', // υ
    phi: '\u03C6',     // φ
    chi: '\u03C7',     // χ
    psi: '\u03C8',     // ψ
    omega: '\u03C9'    // ω
  };

  /**
   * Get symbol by category and name
   */
  function get(category, name) {
    const categories = { CORE, MATH, GEOMETRY, PATTERNS, DOMAINS, FREQUENCIES, GREEK };
    const cat = categories[category.toUpperCase()];
    if (!cat) return null;
    return cat[name.toUpperCase()] || cat[name.toLowerCase()] || null;
  }

  /**
   * Render symbol with optional styling
   */
  function render(symbol, options = {}) {
    const {
      color = 'inherit',
      size = '1em',
      className = ''
    } = options;

    const span = document.createElement('span');
    span.textContent = symbol;
    span.style.color = color;
    span.style.fontSize = size;
    if (className) span.className = className;

    return span;
  }

  /**
   * Get HTML string for symbol
   */
  function toHTML(symbol, options = {}) {
    const { color = 'inherit', size = '1em', className = '' } = options;
    const classAttr = className ? ` class="${className}"` : '';
    return `<span style="color:${color};font-size:${size}"${classAttr}>${symbol}</span>`;
  }

  /**
   * Get all symbols as flat object
   */
  function getAll() {
    return { ...CORE, ...MATH, ...GEOMETRY, ...PATTERNS };
  }

  // Public API
  return {
    VERSION: '1.0.0',

    // Symbol categories
    CORE,
    MATH,
    GEOMETRY,
    PATTERNS,
    DOMAINS,
    FREQUENCIES,
    GREEK,

    // Methods
    get,
    render,
    toHTML,
    getAll
  };
})();

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GlyphSymbols;
}
if (typeof window !== 'undefined') {
  window.GlyphSymbols = GlyphSymbols;
}
