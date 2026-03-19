// RootIB: RB-20260319142113-B7F7E775
/**
 * Beta Maturity Tracking Banner
 * Drop-in component: <script src="/js/beta-banner.js" data-level="1" data-page="Page Name"></script>
 *
 * Levels:
 * 1: 🥚 Concept - Just hatched, needs testing
 * 2: 🐣 Developing - Growing but fragile
 * 3: 🐥 Young - Learning to walk
 * 4: 🦅 Mature - Flying strong
 * 5: ⭐ Stable - Battle-tested
 * 6: 💎 Production - Gem quality
 */

(function() {
    'use strict';

    const LEVELS = {
        1: { emoji: '🥚', label: 'Concept', color: '#ff6b6b', desc: 'Just hatched - needs testing' },
        2: { emoji: '🐣', label: 'Developing', color: '#ffa94d', desc: 'Growing but fragile' },
        3: { emoji: '🐥', label: 'Young', color: '#ffd43b', desc: 'Learning to walk' },
        4: { emoji: '🦅', label: 'Mature', color: '#69db7c', desc: 'Flying strong' },
        5: { emoji: '⭐', label: 'Stable', color: '#4dabf7', desc: 'Battle-tested' },
        6: { emoji: '💎', label: 'Production', color: '#da77f2', desc: 'Gem quality' }
    };

    // Get config from script tag
    const script = document.currentScript;
    const level = parseInt(script?.dataset.level) || 1;
    const pageName = script?.dataset.page || document.title;

    const config = LEVELS[level] || LEVELS[1];

    // Create banner
    const banner = document.createElement('div');
    banner.id = 'beta-maturity-banner';
    banner.innerHTML = `
        <span class="beta-emoji">${config.emoji}</span>
        <span class="beta-info">
            <strong>Beta Level ${level}</strong>: ${config.label}
            <span class="beta-desc"> - ${config.desc}</span>
        </span>
        <button class="beta-feedback" title="Report issue or give feedback">📝 Feedback</button>
        <button class="beta-close" title="Hide banner">×</button>
    `;

    // Styles
    const style = document.createElement('style');
    style.textContent = `
        #beta-maturity-banner {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%);
            border-top: 3px solid ${config.color};
            padding: 10px 20px;
            display: flex;
            align-items: center;
            gap: 12px;
            font-family: 'Segoe UI', system-ui, sans-serif;
            color: #e0e0e0;
            font-size: 14px;
            z-index: 9999;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
        }
        #beta-maturity-banner .beta-emoji {
            font-size: 24px;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        #beta-maturity-banner .beta-info {
            flex: 1;
        }
        #beta-maturity-banner .beta-info strong {
            color: ${config.color};
        }
        #beta-maturity-banner .beta-desc {
            opacity: 0.7;
        }
        #beta-maturity-banner .beta-feedback {
            background: ${config.color};
            color: #000;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            font-size: 13px;
            transition: transform 0.2s, opacity 0.2s;
        }
        #beta-maturity-banner .beta-feedback:hover {
            transform: scale(1.05);
            opacity: 0.9;
        }
        #beta-maturity-banner .beta-close {
            background: transparent;
            border: none;
            color: #888;
            font-size: 20px;
            cursor: pointer;
            padding: 0 5px;
        }
        #beta-maturity-banner .beta-close:hover {
            color: #fff;
        }
        #beta-maturity-banner.hidden {
            display: none;
        }
        @media (max-width: 600px) {
            #beta-maturity-banner .beta-desc {
                display: none;
            }
            #beta-maturity-banner {
                padding: 8px 12px;
                font-size: 12px;
            }
        }
    `;

    // Add to page
    document.head.appendChild(style);
    document.body.appendChild(banner);

    // Feedback button - opens bug report
    banner.querySelector('.beta-feedback').addEventListener('click', function() {
        const bugUrl = `https://conciousnessrevolution.io/bugs.html?page=${encodeURIComponent(pageName)}&level=${level}`;
        window.open(bugUrl, '_blank');
    });

    // Close button
    banner.querySelector('.beta-close').addEventListener('click', function() {
        banner.classList.add('hidden');
        sessionStorage.setItem('beta-banner-hidden', 'true');
    });

    // Check if previously hidden
    if (sessionStorage.getItem('beta-banner-hidden') === 'true') {
        banner.classList.add('hidden');
    }

    // Log for tracking
    console.log(`[Beta] ${pageName} - Level ${level} (${config.label})`);
})();
