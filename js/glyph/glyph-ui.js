// RootIB: RB-20260319142113-8B8A5BC3
/**
 * GLYPH UI MODULE
 * Version: 1.0.0
 *
 * Reusable UI components with GLYPH integration.
 * Pattern-aware displays, consciousness meters, coordinate visualizers.
 */

const GlyphUI = (function() {
  'use strict';

  // Get dependencies
  const Core = typeof GLYPH !== 'undefined' ? GLYPH : (typeof GlyphCore !== 'undefined' ? GlyphCore : null);
  const Patterns = typeof GlyphPatterns !== 'undefined' ? GlyphPatterns : null;
  const Symbols = typeof GlyphSymbols !== 'undefined' ? GlyphSymbols : null;
  const Base60 = typeof GlyphBase60 !== 'undefined' ? GlyphBase60 : null;

  // Color schemes aligned with consciousness levels
  const COLORS = {
    truth: '#4CAF50',        // Green
    deceit: '#f44336',       // Red
    neutral: '#9E9E9E',      // Gray
    elevated: '#9C27B0',     // Purple
    conscious: '#2196F3',    // Blue
    aware: '#00BCD4',        // Cyan
    awakening: '#FF9800',    // Orange
    unconscious: '#795548',  // Brown

    // Domain colors
    domains: {
      1: '#E91E63', // COMMAND - Pink
      2: '#FF5722', // BUILD - Deep Orange
      3: '#4CAF50', // CONNECT - Green
      4: '#2196F3', // PROTECT - Blue
      5: '#FFEB3B', // GROW - Yellow
      6: '#9C27B0', // LEARN - Purple
      7: '#E040FB'  // TRANSCEND - Purple accent
    },

    // Frequency colors (Solfeggio)
    frequencies: {
      396: '#8B0000', // Liberation - Dark Red
      417: '#FF4500', // Change - Orange Red
      528: '#00FF00', // Love - Green
      639: '#00CED1', // Connection - Cyan
      741: '#4169E1', // Expression - Royal Blue
      852: '#8A2BE2', // Intuition - Blue Violet
      963: '#FFD700'  // Unity - Gold
    }
  };

  /**
   * Create a pattern score badge
   *
   * @param {number} score - Pattern score (0-100)
   * @param {Object} options - Display options
   * @returns {HTMLElement}
   */
  function createScoreBadge(score, options = {}) {
    const {
      size = 'medium',
      showLabel = true,
      animated = true
    } = options;

    const badge = document.createElement('div');
    badge.className = `glyph-score-badge glyph-score-${size}`;

    // Determine color based on score
    let color = COLORS.neutral;
    let label = 'NEUTRAL';

    if (score >= 86) {
      color = COLORS.elevated;
      label = 'ELEVATED';
    } else if (score >= 76) {
      color = COLORS.conscious;
      label = 'CONSCIOUS';
    } else if (score >= 51) {
      color = COLORS.aware;
      label = 'AWARE';
    } else if (score >= 26) {
      color = COLORS.awakening;
      label = 'AWAKENING';
    } else {
      color = COLORS.unconscious;
      label = 'UNCONSCIOUS';
    }

    badge.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: ${size === 'small' ? '4px 8px' : '8px 16px'};
      border-radius: 20px;
      background: ${color}22;
      border: 2px solid ${color};
      color: ${color};
      font-weight: bold;
      font-size: ${size === 'small' ? '12px' : '14px'};
      ${animated ? 'transition: all 0.3s ease;' : ''}
    `;

    badge.innerHTML = `
      <span class="glyph-score-value">${score}%</span>
      ${showLabel ? `<span class="glyph-score-label">${label}</span>` : ''}
    `;

    return badge;
  }

  /**
   * Create a consciousness meter (gauge visualization)
   *
   * @param {number} score - Consciousness score (0-100)
   * @param {Object} options - Display options
   * @returns {HTMLElement}
   */
  function createConsciousnessMeter(score, options = {}) {
    const {
      width = 200,
      height = 20,
      showTicks = true,
      animated = true
    } = options;

    const container = document.createElement('div');
    container.className = 'glyph-consciousness-meter';
    container.style.cssText = `
      width: ${width}px;
      position: relative;
    `;

    // Create gradient bar
    const bar = document.createElement('div');
    bar.className = 'glyph-meter-bar';
    bar.style.cssText = `
      width: 100%;
      height: ${height}px;
      border-radius: ${height / 2}px;
      background: linear-gradient(to right,
        ${COLORS.unconscious} 0%,
        ${COLORS.awakening} 25%,
        ${COLORS.aware} 50%,
        ${COLORS.conscious} 75%,
        ${COLORS.elevated} 100%
      );
      position: relative;
      overflow: hidden;
    `;

    // Create indicator
    const indicator = document.createElement('div');
    indicator.className = 'glyph-meter-indicator';
    indicator.style.cssText = `
      position: absolute;
      top: 50%;
      left: ${score}%;
      transform: translate(-50%, -50%);
      width: ${height + 4}px;
      height: ${height + 4}px;
      border-radius: 50%;
      background: white;
      border: 3px solid #333;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ${animated ? 'transition: left 0.5s ease;' : ''}
    `;

    bar.appendChild(indicator);
    container.appendChild(bar);

    // Add ticks if requested
    if (showTicks) {
      const ticks = document.createElement('div');
      ticks.style.cssText = `
        display: flex;
        justify-content: space-between;
        margin-top: 4px;
        font-size: 10px;
        color: #666;
      `;
      ticks.innerHTML = `
        <span>0</span>
        <span>25</span>
        <span>50</span>
        <span>75</span>
        <span>100</span>
      `;
      container.appendChild(ticks);
    }

    // Add method to update
    container.update = function(newScore) {
      indicator.style.left = `${newScore}%`;
    };

    return container;
  }

  /**
   * Create a pattern analysis display
   *
   * @param {Object} analysis - Pattern analysis result
   * @param {Object} options - Display options
   * @returns {HTMLElement}
   */
  function createPatternDisplay(analysis, options = {}) {
    const {
      compact = false,
      showManipulation = true,
      showFrequency = true
    } = options;

    const container = document.createElement('div');
    container.className = 'glyph-pattern-display';
    container.style.cssText = `
      padding: 16px;
      border-radius: 8px;
      background: #f5f5f5;
      font-family: system-ui, sans-serif;
    `;

    if (!analysis) {
      container.innerHTML = '<p style="color:#666;">No analysis available</p>';
      return container;
    }

    // Header with dominant pattern
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    `;

    const dominantColor = analysis.dominant === 'truth' ? COLORS.truth :
                          analysis.dominant === 'deceit' ? COLORS.deceit : COLORS.neutral;

    header.innerHTML = `
      <span style="
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: ${dominantColor};
      "></span>
      <span style="font-weight: bold; text-transform: uppercase;">${analysis.dominant}</span>
      ${!compact ? `<span style="color: #666;">${analysis.scores.truth}% truth signal</span>` : ''}
    `;

    container.appendChild(header);

    // Score bars (if not compact)
    if (!compact && analysis.scores) {
      const scores = document.createElement('div');
      scores.style.marginBottom = '12px';

      ['truth', 'deceit'].forEach(type => {
        const score = analysis.scores[type] || 0;
        const color = type === 'truth' ? COLORS.truth : COLORS.deceit;

        scores.innerHTML += `
          <div style="margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 2px;">
              <span>${type.toUpperCase()}</span>
              <span>${score}%</span>
            </div>
            <div style="
              width: 100%;
              height: 6px;
              background: #ddd;
              border-radius: 3px;
              overflow: hidden;
            ">
              <div style="
                width: ${score}%;
                height: 100%;
                background: ${color};
                transition: width 0.3s ease;
              "></div>
            </div>
          </div>
        `;
      });

      container.appendChild(scores);
    }

    // Frequency display
    if (showFrequency && analysis.frequency) {
      const freq = document.createElement('div');
      const freqColor = COLORS.frequencies[analysis.frequency] || '#666';

      freq.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        background: ${freqColor}22;
        border-radius: 4px;
        margin-bottom: 12px;
      `;

      const freqNames = {
        396: 'Liberation', 417: 'Change', 528: 'Love/DNA Repair',
        639: 'Connection', 741: 'Expression', 852: 'Intuition', 963: 'Unity'
      };

      freq.innerHTML = `
        <span style="font-size: 18px;">${Symbols ? Symbols.get('FREQUENCY') : '~'}</span>
        <span><strong>${analysis.frequency}Hz</strong> - ${freqNames[analysis.frequency] || 'Custom'}</span>
      `;

      container.appendChild(freq);
    }

    // Manipulation warning
    if (showManipulation &&
        analysis.patterns?.manipulation &&
        analysis.patterns.manipulation.length > 0) {

      const warning = document.createElement('div');
      warning.style.cssText = `
        padding: 12px;
        background: ${COLORS.deceit}22;
        border-left: 4px solid ${COLORS.deceit};
        border-radius: 4px;
      `;

      const patterns = analysis.patterns.manipulation.map(m =>
        `<span style="
          display: inline-block;
          padding: 2px 8px;
          background: ${COLORS.deceit}44;
          border-radius: 12px;
          font-size: 12px;
          margin: 2px;
        ">${m.type}</span>`
      ).join('');

      warning.innerHTML = `
        <div style="font-weight: bold; color: ${COLORS.deceit}; margin-bottom: 8px;">
          ${Symbols ? Symbols.get('WARNING') : '!'} Manipulation Detected
        </div>
        <div>${patterns}</div>
      `;

      container.appendChild(warning);
    }

    // GLYPH notation
    if (analysis.glyphNotation) {
      const notation = document.createElement('div');
      notation.style.cssText = `
        font-family: monospace;
        font-size: 12px;
        color: #666;
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid #ddd;
      `;
      notation.textContent = analysis.glyphNotation;
      container.appendChild(notation);
    }

    return container;
  }

  /**
   * Create a 6D coordinate visualizer
   *
   * @param {Object} coordinate - GLYPH coordinate object
   * @param {Object} options - Display options
   * @returns {HTMLElement}
   */
  function createCoordinateVisualizer(coordinate, options = {}) {
    const {
      size = 200,
      showLabels = true,
      showValues = true
    } = options;

    const container = document.createElement('div');
    container.className = 'glyph-coordinate-viz';
    container.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      position: relative;
    `;

    // Create SVG radar chart
    const svg = document.createElementNS('https://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.style.cssText = 'width: 100%; height: 100%;';

    const center = 100;
    const radius = 80;
    const axes = ['A', 'B', 'C', 'D', 'E', 'F'];
    const axisLabels = ['Vertical', 'Horizontal', 'Depth', 'Temporal', 'Energy', 'Observer'];

    // Draw background circles
    [0.25, 0.5, 0.75, 1].forEach(scale => {
      const circle = document.createElementNS('https://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', center);
      circle.setAttribute('cy', center);
      circle.setAttribute('r', radius * scale);
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', '#ddd');
      circle.setAttribute('stroke-width', '1');
      svg.appendChild(circle);
    });

    // Draw axis lines and labels
    axes.forEach((axis, i) => {
      const angle = (Math.PI * 2 * i / 6) - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);

      // Axis line
      const line = document.createElementNS('https://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', center);
      line.setAttribute('y1', center);
      line.setAttribute('x2', x);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', '#ccc');
      line.setAttribute('stroke-width', '1');
      svg.appendChild(line);

      // Label
      if (showLabels) {
        const labelX = center + (radius + 15) * Math.cos(angle);
        const labelY = center + (radius + 15) * Math.sin(angle);

        const text = document.createElementNS('https://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', labelX);
        text.setAttribute('y', labelY);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('font-size', '10');
        text.setAttribute('fill', '#666');
        text.textContent = axis;
        svg.appendChild(text);
      }
    });

    // Draw coordinate polygon
    if (coordinate) {
      const points = axes.map((axis, i) => {
        const value = Math.min(100, Math.max(0, coordinate[axis] || 0)) / 100;
        const angle = (Math.PI * 2 * i / 6) - Math.PI / 2;
        const x = center + radius * value * Math.cos(angle);
        const y = center + radius * value * Math.sin(angle);
        return `${x},${y}`;
      }).join(' ');

      const polygon = document.createElementNS('https://www.w3.org/2000/svg', 'polygon');
      polygon.setAttribute('points', points);
      polygon.setAttribute('fill', 'rgba(156, 39, 176, 0.3)');
      polygon.setAttribute('stroke', '#9C27B0');
      polygon.setAttribute('stroke-width', '2');
      svg.appendChild(polygon);

      // Draw value points
      axes.forEach((axis, i) => {
        const value = Math.min(100, Math.max(0, coordinate[axis] || 0)) / 100;
        const angle = (Math.PI * 2 * i / 6) - Math.PI / 2;
        const x = center + radius * value * Math.cos(angle);
        const y = center + radius * value * Math.sin(angle);

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', '4');
        circle.setAttribute('fill', '#9C27B0');
        svg.appendChild(circle);
      });
    }

    container.appendChild(svg);

    // Add values display
    if (showValues && coordinate) {
      const values = document.createElement('div');
      values.style.cssText = `
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 4px;
        margin-top: 8px;
        font-size: 11px;
      `;

      axes.forEach((axis, i) => {
        values.innerHTML += `
          <div style="text-align: center;">
            <div style="color: #666;">${axis}</div>
            <div style="font-weight: bold;">${(coordinate[axis] || 0).toFixed(1)}</div>
          </div>
        `;
      });

      container.appendChild(values);
    }

    return container;
  }

  /**
   * Create a domain selector
   *
   * @param {number} currentDomain - Currently selected domain (1-7)
   * @param {Function} onChange - Callback when domain changes
   * @returns {HTMLElement}
   */
  function createDomainSelector(currentDomain = 7, onChange = null) {
    const container = document.createElement('div');
    container.className = 'glyph-domain-selector';
    container.style.cssText = `
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    `;

    const domains = [
      { num: 1, name: 'COMMAND', icon: '1' },
      { num: 2, name: 'BUILD', icon: '2' },
      { num: 3, name: 'CONNECT', icon: '3' },
      { num: 4, name: 'PROTECT', icon: '4' },
      { num: 5, name: 'GROW', icon: '5' },
      { num: 6, name: 'LEARN', icon: '6' },
      { num: 7, name: 'TRANSCEND', icon: '7' }
    ];

    domains.forEach(domain => {
      const btn = document.createElement('button');
      btn.className = 'glyph-domain-btn';
      btn.dataset.domain = domain.num;

      const isActive = domain.num === currentDomain;
      const color = COLORS.domains[domain.num];

      btn.style.cssText = `
        padding: 8px 16px;
        border: 2px solid ${color};
        border-radius: 20px;
        background: ${isActive ? color : 'transparent'};
        color: ${isActive ? 'white' : color};
        font-weight: bold;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
      `;

      btn.textContent = domain.name;

      btn.addEventListener('click', () => {
        // Update active states
        container.querySelectorAll('.glyph-domain-btn').forEach(b => {
          const d = parseInt(b.dataset.domain);
          const c = COLORS.domains[d];
          b.style.background = 'transparent';
          b.style.color = c;
        });

        btn.style.background = color;
        btn.style.color = 'white';

        if (onChange) {
          onChange(domain.num, domain.name);
        }
      });

      container.appendChild(btn);
    });

    return container;
  }

  /**
   * Create a GLYPH notation display
   *
   * @param {string} notation - GLYPH notation string
   * @param {Object} options - Display options
   * @returns {HTMLElement}
   */
  function createNotationDisplay(notation, options = {}) {
    const {
      size = 'medium',
      copyable = true
    } = options;

    const container = document.createElement('div');
    container.className = 'glyph-notation-display';
    container.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: ${size === 'small' ? '4px 8px' : '8px 12px'};
      background: #1a1a2e;
      border-radius: 4px;
      font-family: 'Fira Code', monospace;
      font-size: ${size === 'small' ? '12px' : '14px'};
      color: #E040FB;
    `;

    const text = document.createElement('span');
    text.textContent = notation || 'No notation';
    container.appendChild(text);

    if (copyable && notation) {
      const copyBtn = document.createElement('button');
      copyBtn.style.cssText = `
        background: none;
        border: none;
        color: #666;
        cursor: pointer;
        padding: 2px;
        font-size: ${size === 'small' ? '10px' : '12px'};
      `;
      copyBtn.textContent = 'Copy';
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(notation).then(() => {
          copyBtn.textContent = 'Copied!';
          setTimeout(() => copyBtn.textContent = 'Copy', 2000);
        });
      });
      container.appendChild(copyBtn);
    }

    return container;
  }

  /**
   * Inject global GLYPH styles
   */
  function injectStyles() {
    if (document.getElementById('glyph-ui-styles')) return;

    const style = document.createElement('style');
    style.id = 'glyph-ui-styles';
    style.textContent = `
      .glyph-score-badge { font-family: system-ui, sans-serif; }
      .glyph-score-badge:hover { transform: scale(1.05); }

      .glyph-pattern-display { max-width: 400px; }

      .glyph-domain-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }

      .glyph-meter-indicator:hover {
        transform: translate(-50%, -50%) scale(1.2);
      }

      .glyph-notation-display:hover {
        background: #2a2a3e;
      }

      @keyframes glyph-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }

      .glyph-animate-pulse {
        animation: glyph-pulse 2s ease-in-out infinite;
      }
    `;

    document.head.appendChild(style);
  }

  // Auto-inject styles when loaded
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectStyles);
    } else {
      injectStyles();
    }
  }

  // Public API
  return {
    VERSION: '1.0.0',
    COLORS,

    // Components
    createScoreBadge,
    createConsciousnessMeter,
    createPatternDisplay,
    createCoordinateVisualizer,
    createDomainSelector,
    createNotationDisplay,

    // Utilities
    injectStyles
  };
})();

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GlyphUI;
}
if (typeof window !== 'undefined') {
  window.GlyphUI = GlyphUI;
}
