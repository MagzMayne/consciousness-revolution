/**
 * ARAYA FORGE COMPANION WIDGET
 * Version: 1.0.0
 * Created: 2026-03-14
 *
 * Embeddable widget that provides contextual ARAYA access on every forge page.
 * Auto-detects forge context from page meta tags and adapts appearance.
 *
 * Usage: Add to any page:
 * <script src="/components/araya-companion.js" defer></script>
 *
 * The widget reads these meta tags:
 * - <meta name="domain" content="REALITY">
 * - <meta name="forge" content="reality">
 */

(function() {
  'use strict';

  // Forge configuration with chakra mappings
  const FORGE_DATA = {
    reality: {
      chakra: 'Root',
      color: '#FF0000',
      rgb: '255, 0, 0',
      tooltip: 'Ask ARAYA',
      desc: 'Ground your foundations',
      frequency: '396 Hz'
    },
    creation: {
      chakra: 'Sacral',
      color: '#FF6600',
      rgb: '255, 102, 0',
      tooltip: 'Ask ARAYA',
      desc: 'Unlock creative flow',
      frequency: '417 Hz'
    },
    wealth: {
      chakra: 'Solar Plexus',
      color: '#FFDD00',
      rgb: '255, 221, 0',
      tooltip: 'Ask ARAYA',
      desc: 'Build abundance',
      frequency: '528 Hz'
    },
    guardian: {
      chakra: 'Heart',
      color: '#00FF00',
      rgb: '0, 255, 0',
      tooltip: 'Ask ARAYA',
      desc: 'Protect what matters',
      frequency: '639 Hz'
    },
    signal: {
      chakra: 'Throat',
      color: '#0088FF',
      rgb: '0, 136, 255',
      tooltip: 'Ask ARAYA',
      desc: 'Speak your truth',
      frequency: '741 Hz'
    },
    character: {
      chakra: 'Third Eye',
      color: '#4B0082',
      rgb: '75, 0, 130',
      tooltip: 'Ask ARAYA',
      desc: 'See the patterns',
      frequency: '852 Hz'
    },
    infinity: {
      chakra: 'Crown',
      color: '#9400D3',
      rgb: '148, 0, 211',
      tooltip: 'Ask ARAYA',
      desc: 'Connect to infinity',
      frequency: '963 Hz'
    }
  };

  // Detect current forge from page meta tags
  function detectForge() {
    // Try various meta tag formats
    const forgeMeta = document.querySelector('meta[name="forge"]');
    const domainMeta = document.querySelector('meta[name="domain"]');

    if (forgeMeta) {
      return forgeMeta.content.toLowerCase();
    }

    if (domainMeta) {
      const domain = domainMeta.content.toLowerCase();
      // Map domain names to forge slugs
      const domainMap = {
        'reality': 'reality',
        'creation': 'creation',
        'wealth': 'wealth',
        'guardian': 'guardian',
        'signal': 'signal',
        'character': 'character',
        'infinity': 'infinity',
        // Also support numbered domains
        '1': 'reality',
        '2': 'creation',
        '3': 'wealth',
        '4': 'guardian',
        '5': 'signal',
        '6': 'character',
        '7': 'infinity'
      };
      return domainMap[domain] || null;
    }

    // Try to detect from URL path
    const path = window.location.pathname.toLowerCase();
    for (const forge of Object.keys(FORGE_DATA)) {
      if (path.includes(forge)) {
        return forge;
      }
    }

    return null;
  }

  // Inject widget styles
  function injectStyles(forge) {
    const data = FORGE_DATA[forge] || FORGE_DATA.infinity;

    const styles = `
      .araya-companion {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 99999;
        font-family: -apple-system, BlinkMacSystemFont, 'Rajdhani', sans-serif;
      }

      .araya-companion-btn {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        border: 2px solid ${data.color};
        background: rgba(10, 10, 12, 0.95);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        box-shadow:
          0 0 20px rgba(${data.rgb}, 0.3),
          inset 0 0 15px rgba(${data.rgb}, 0.1);
        animation: araya-breathe 4s ease-in-out infinite;
      }

      .araya-companion-btn:hover {
        transform: scale(1.1);
        box-shadow:
          0 0 30px rgba(${data.rgb}, 0.5),
          inset 0 0 20px rgba(${data.rgb}, 0.2);
      }

      .araya-companion-btn svg {
        width: 28px;
        height: 28px;
        fill: none;
        stroke: ${data.color};
        stroke-width: 2;
      }

      @keyframes araya-breathe {
        0%, 100% {
          box-shadow:
            0 0 15px rgba(${data.rgb}, 0.2),
            inset 0 0 10px rgba(${data.rgb}, 0.05);
        }
        50% {
          box-shadow:
            0 0 25px rgba(${data.rgb}, 0.4),
            inset 0 0 20px rgba(${data.rgb}, 0.15);
        }
      }

      .araya-companion-tooltip {
        position: absolute;
        bottom: 100%;
        right: 0;
        background: rgba(10, 10, 12, 0.95);
        border: 1px solid ${data.color};
        border-radius: 8px;
        padding: 0.75rem 1rem;
        margin-bottom: 8px;
        white-space: nowrap;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.3s;
        pointer-events: none;
      }

      .araya-companion:hover .araya-companion-tooltip {
        opacity: 1;
        transform: translateY(0);
      }

      .araya-companion-tooltip-title {
        color: ${data.color};
        font-weight: 700;
        font-size: 0.95rem;
        margin-bottom: 2px;
      }

      .araya-companion-tooltip-desc {
        color: rgba(200, 200, 200, 0.7);
        font-size: 0.8rem;
      }

      .araya-companion-tooltip-chakra {
        color: rgba(200, 200, 200, 0.5);
        font-size: 0.7rem;
        margin-top: 4px;
      }

      /* Mobile adjustments */
      @media (max-width: 480px) {
        .araya-companion {
          bottom: 16px;
          right: 16px;
        }

        .araya-companion-btn {
          width: 48px;
          height: 48px;
        }

        .araya-companion-btn svg {
          width: 24px;
          height: 24px;
        }
      }
    `;

    const styleEl = document.createElement('style');
    styleEl.id = 'araya-companion-styles';
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }

  // Create and inject widget HTML
  function createWidget(forge) {
    const data = FORGE_DATA[forge] || FORGE_DATA.infinity;

    const widget = document.createElement('div');
    widget.className = 'araya-companion';
    widget.id = 'arayanCompanion';
    widget.setAttribute('data-forge', forge);

    widget.innerHTML = `
      <button class="araya-companion-btn" id="arayanCompanionBtn" aria-label="Open ARAYA assistant">
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="2" x2="12" y2="6" />
          <line x1="12" y1="18" x2="12" y2="22" />
          <line x1="2" y1="12" x2="6" y2="12" />
          <line x1="18" y1="12" x2="22" y2="12" />
        </svg>
      </button>
      <div class="araya-companion-tooltip">
        <div class="araya-companion-tooltip-title">${data.tooltip}</div>
        <div class="araya-companion-tooltip-desc">${data.desc}</div>
        <div class="araya-companion-tooltip-chakra">${data.chakra} Chakra | ${data.frequency}</div>
      </div>
    `;

    document.body.appendChild(widget);

    // Add click handler
    document.getElementById('arayanCompanionBtn').addEventListener('click', function() {
      openAraya(forge, data);
    });
  }

  // Open ARAYA with forge context
  function openAraya(forge, data) {
    const params = new URLSearchParams({
      context: forge,
      chakra: data.chakra,
      color: data.color,
      frequency: data.frequency
    });

    const url = `/araya-chat.html?${params.toString()}`;
    window.location.href = url;
  }

  // Initialize widget
  function init() {
    // Don't initialize if we're already on the ARAYA chat page
    if (window.location.pathname.includes('araya-chat')) {
      return;
    }

    // Detect current forge
    const forge = detectForge();

    if (!forge) {
      // No forge detected - could add default behavior here
      console.log('[ARAYA Companion] No forge context detected');
      return;
    }

    console.log(`[ARAYA Companion] Initializing for ${forge} forge`);

    // Inject styles and create widget
    injectStyles(forge);
    createWidget(forge);
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export for manual control if needed
  window.ArayaCompanion = {
    init: init,
    detectForge: detectForge,
    openAraya: openAraya,
    FORGE_DATA: FORGE_DATA
  };

})();
