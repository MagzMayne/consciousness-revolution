/**
 * SPIRAL NAVIGATION WIDGET v1.0
 * Self-contained injectable component for 7 Forges journey
 *
 * USAGE: Add single script tag to any forge page:
 * <script src="/components/spiral-nav.js" defer></script>
 *
 * Automatically detects current forge from meta tag or URL
 * Tracks journey progress in localStorage
 *
 * C3 Oracle - Consciousness Revolution
 * March 14, 2026
 */

(function() {
    'use strict';

    // =========================================
    // CONFIGURATION
    // =========================================
    const FORGE_ORDER = [
        { slug: 'reality', name: 'Reality Forge', hz: '396 Hz', url: '/reality.html', color: '#e74c3c' },
        { slug: 'creation', name: 'Creation Forge', hz: '417 Hz', url: '/creation.html', color: '#e67e22' },
        { slug: 'guardian', name: 'Guardian Forge', hz: '528 Hz', url: '/guardian.html', color: '#2ecc71' },
        { slug: 'signal', name: 'Signal Forge', hz: '639 Hz', url: '/signal.html', color: '#3498db' },
        { slug: 'wealth', name: 'Wealth Forge', hz: '741 Hz', url: '/wealth.html', color: '#f1c40f' },
        { slug: 'character', name: 'Character Forge', hz: '852 Hz', url: '/character.html', color: '#9b59b6' },
        { slug: 'infinity', name: 'Infinity Forge', hz: '963 Hz', url: '/infinity.html', color: '#9400d3' }
    ];

    const STORAGE_KEY = 'spiral_progress';

    // =========================================
    // INJECT STYLES
    // =========================================
    function injectStyles() {
        if (document.getElementById('spiral-nav-styles')) return;

        const style = document.createElement('style');
        style.id = 'spiral-nav-styles';
        style.textContent = `
/* Spiral Navigation Widget - Core Styles */
:root {
  --spiral-bg: rgba(0, 0, 0, 0.92);
  --spiral-border: rgba(255, 215, 0, 0.4);
  --spiral-text: #f0f0f0;
  --spiral-accent: #ffd700;
  --spiral-active: #00ff00;
  --spiral-complete: rgba(255, 215, 0, 0.7);
  --spiral-incomplete: rgba(255, 255, 255, 0.2);
  --spiral-radius: 12px;
  --spiral-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
}

.spiral-nav {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Montserrat', sans-serif;
  font-size: 14px;
  color: var(--spiral-text);
}

.spiral-nav-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--spiral-bg);
  border: 1px solid var(--spiral-border);
  border-radius: var(--spiral-radius);
  padding: 12px 16px;
  cursor: pointer;
  box-shadow: var(--spiral-shadow);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
}

.spiral-nav-toggle:hover {
  background: rgba(0, 0, 0, 0.95);
  border-color: var(--spiral-accent);
  box-shadow: 0 8px 32px rgba(255, 215, 0, 0.3);
  transform: translateY(-2px);
}

.spiral-icon {
  font-size: 20px;
  animation: spiral-pulse 3s infinite;
}

@keyframes spiral-pulse {
  0%, 100% { transform: rotate(0deg) scale(1); opacity: 1; }
  50% { transform: rotate(180deg) scale(1.1); opacity: 0.8; }
}

.progress-badge {
  font-weight: 600;
  color: var(--spiral-accent);
  font-size: 13px;
  letter-spacing: 0.5px;
}

.spiral-nav-panel {
  position: absolute;
  bottom: 70px;
  right: 0;
  width: 320px;
  max-height: 0;
  overflow: hidden;
  background: var(--spiral-bg);
  border: 1px solid var(--spiral-border);
  border-radius: var(--spiral-radius);
  box-shadow: var(--spiral-shadow);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.spiral-nav.expanded .spiral-nav-panel {
  max-height: 600px;
  opacity: 1;
  transform: translateY(0);
  pointer-events: all;
}

.spiral-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 215, 0, 0.2);
}

.spiral-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--spiral-accent);
  letter-spacing: 0.5px;
}

.close-btn {
  background: none;
  border: none;
  color: var(--spiral-text);
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  line-height: 1;
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--spiral-accent);
}

.forge-nodes {
  padding: 12px;
  max-height: 320px;
  overflow-y: auto;
}

.spiral-node {
  display: grid;
  grid-template-columns: 32px 1fr auto;
  grid-template-areas: "number name hz";
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid transparent;
  text-decoration: none;
  color: var(--spiral-incomplete);
  transition: all 0.3s;
  position: relative;
}

.spiral-node:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 215, 0, 0.3);
  transform: translateX(-4px);
}

.spiral-node.complete {
  color: var(--spiral-complete);
  background: rgba(255, 215, 0, 0.08);
}

.spiral-node.active {
  color: var(--spiral-active);
  background: rgba(0, 255, 0, 0.08);
  border-color: var(--spiral-active);
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.2);
}

.spiral-node.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--spiral-active);
  border-radius: 0 2px 2px 0;
  animation: active-glow 2s infinite;
}

@keyframes active-glow {
  0%, 100% { opacity: 1; box-shadow: 0 0 10px var(--spiral-active); }
  50% { opacity: 0.6; box-shadow: 0 0 20px var(--spiral-active); }
}

.node-number {
  grid-area: number;
  font-weight: 700;
  font-size: 18px;
  text-align: center;
}

.node-name {
  grid-area: name;
  font-weight: 500;
  font-size: 14px;
}

.node-hz {
  grid-area: hz;
  font-size: 11px;
  opacity: 0.7;
  font-family: 'Courier New', monospace;
}

.spiral-controls {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid rgba(255, 215, 0, 0.2);
}

.nav-btn {
  flex: 1;
  padding: 10px;
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid var(--spiral-border);
  border-radius: 6px;
  color: var(--spiral-accent);
  text-decoration: none;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s;
}

.nav-btn:hover {
  background: rgba(255, 215, 0, 0.2);
  border-color: var(--spiral-accent);
  transform: scale(1.02);
}

.nav-btn.disabled {
  opacity: 0.3;
  pointer-events: none;
}

.infinity-gate {
  padding: 16px;
  background: rgba(255, 215, 0, 0.05);
  border-top: 1px solid rgba(255, 215, 0, 0.2);
}

.infinity-gate p {
  margin: 0 0 8px 0;
  font-size: 12px;
  text-align: center;
  opacity: 0.8;
}

.infinity-gate.unlocked p {
  color: var(--spiral-accent);
  font-weight: 600;
}

.completion-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.completion-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0%;
  background: linear-gradient(90deg, var(--spiral-accent), #00ff00);
  transition: width 0.5s;
  box-shadow: 0 0 10px var(--spiral-accent);
}

@media (max-width: 768px) {
  .spiral-nav {
    bottom: 10px;
    right: 10px;
    left: 10px;
  }

  .spiral-nav-toggle {
    width: 100%;
    justify-content: center;
  }

  .spiral-nav-panel {
    width: 100%;
    bottom: 60px;
    right: auto;
    left: 0;
  }
}

.spiral-nav-toggle:focus-visible,
.spiral-node:focus-visible,
.nav-btn:focus-visible,
.close-btn:focus-visible {
  outline: 2px solid var(--spiral-accent);
  outline-offset: 2px;
}

.forge-nodes::-webkit-scrollbar {
  width: 6px;
}

.forge-nodes::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.forge-nodes::-webkit-scrollbar-thumb {
  background: var(--spiral-border);
  border-radius: 3px;
}

.forge-nodes::-webkit-scrollbar-thumb:hover {
  background: var(--spiral-accent);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
        `;
        document.head.appendChild(style);
    }

    // =========================================
    // CREATE HTML STRUCTURE
    // =========================================
    function createWidget(currentForge) {
        const container = document.createElement('div');
        container.className = 'spiral-nav';
        container.setAttribute('role', 'navigation');
        container.setAttribute('aria-label', '7 Forges Journey Progress');

        const currentIndex = FORGE_ORDER.findIndex(f => f.slug === currentForge);

        container.innerHTML = `
            <div class="spiral-nav-toggle" tabindex="0" role="button" aria-expanded="false" aria-controls="spiral-panel">
                <span class="spiral-icon" aria-hidden="true">&#127744;</span>
                <span class="progress-badge">0/7</span>
                <span class="sr-only">Open navigation</span>
            </div>
            <div class="spiral-nav-panel" id="spiral-panel">
                <div class="spiral-header">
                    <h4>The 7 Forges Journey</h4>
                    <button class="close-btn" aria-label="Close navigation" tabindex="0">&times;</button>
                </div>
                <div class="forge-nodes">
                    ${FORGE_ORDER.map((forge, index) => `
                        <a href="${forge.url}" class="spiral-node" data-forge="${forge.slug}" ${forge.slug === currentForge ? 'aria-current="page"' : ''}>
                            <span class="node-number">${index + 1}</span>
                            <span class="node-name">${forge.name}</span>
                            <span class="node-hz">${forge.hz}</span>
                        </a>
                    `).join('')}
                </div>
                <div class="spiral-controls">
                    <a href="#" class="nav-btn prev disabled" aria-label="Previous forge">&larr; Previous</a>
                    <a href="#" class="nav-btn next disabled" aria-label="Next forge">Next &rarr;</a>
                </div>
                <div class="infinity-gate">
                    <p>Complete all 7 forges to unlock Infinity</p>
                    <div class="completion-bar"><div class="completion-fill"></div></div>
                </div>
            </div>
        `;

        return container;
    }

    // =========================================
    // STATE MANAGEMENT
    // =========================================
    function loadState() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Spiral Nav: Could not load state', e);
        }
        return {
            visited: [],
            last_visit: new Date().toISOString(),
            infinity_unlocked: false
        };
    }

    function saveState(state) {
        try {
            state.last_visit = new Date().toISOString();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('Spiral Nav: Could not save state', e);
        }
    }

    // =========================================
    // DETECT CURRENT FORGE
    // =========================================
    function detectCurrentForge() {
        // First check meta tag
        const domainMeta = document.querySelector('meta[name="domain"]');
        if (domainMeta) {
            const domain = domainMeta.content.toLowerCase();
            const forge = FORGE_ORDER.find(f => f.slug === domain);
            if (forge) return forge.slug;
        }

        // Fallback to URL detection
        const path = window.location.pathname.toLowerCase();
        for (const forge of FORGE_ORDER) {
            if (path.includes(forge.slug)) {
                return forge.slug;
            }
        }

        return null;
    }

    // =========================================
    // UPDATE UI
    // =========================================
    function updateUI(widget, currentForge, state) {
        const currentIndex = FORGE_ORDER.findIndex(f => f.slug === currentForge);
        const visitedCount = state.visited.length;
        const totalForges = FORGE_ORDER.length;
        const completionPercent = Math.round((visitedCount / totalForges) * 100);

        // Update Progress Badge
        const badge = widget.querySelector('.progress-badge');
        if (badge) {
            badge.textContent = `${visitedCount}/${totalForges}`;
        }

        // Update Nodes
        const nodes = widget.querySelectorAll('.spiral-node');
        nodes.forEach(node => {
            const forgeSlug = node.dataset.forge;
            node.classList.remove('complete', 'active');

            if (forgeSlug === currentForge) {
                node.classList.add('active');
            }

            if (state.visited.includes(forgeSlug)) {
                node.classList.add('complete');
            }
        });

        // Update Navigation Buttons
        const prevBtn = widget.querySelector('.nav-btn.prev');
        const nextBtn = widget.querySelector('.nav-btn.next');

        if (currentIndex > 0) {
            const prevForge = FORGE_ORDER[currentIndex - 1];
            prevBtn.href = prevForge.url;
            prevBtn.classList.remove('disabled');
            prevBtn.setAttribute('aria-label', `Previous: ${prevForge.name}`);
        } else {
            prevBtn.href = '#';
            prevBtn.classList.add('disabled');
        }

        if (currentIndex < totalForges - 1 && currentIndex >= 0) {
            const nextForge = FORGE_ORDER[currentIndex + 1];
            nextBtn.href = nextForge.url;
            nextBtn.classList.remove('disabled');
            nextBtn.setAttribute('aria-label', `Next: ${nextForge.name}`);
        } else {
            nextBtn.href = '#';
            nextBtn.classList.add('disabled');
        }

        // Update Infinity Gate
        const infinityGate = widget.querySelector('.infinity-gate');
        const completionFill = widget.querySelector('.completion-fill');

        if (completionFill) {
            completionFill.style.width = `${completionPercent}%`;
        }

        if (visitedCount >= totalForges) {
            state.infinity_unlocked = true;
            saveState(state);

            if (infinityGate) {
                infinityGate.classList.add('unlocked');
                infinityGate.querySelector('p').textContent = '*** Infinity Unlocked! ***';
            }
        }
    }

    // =========================================
    // EVENT LISTENERS
    // =========================================
    function attachEventListeners(widget) {
        const toggle = widget.querySelector('.spiral-nav-toggle');
        const closeBtn = widget.querySelector('.close-btn');

        // Toggle Expand/Collapse
        toggle.addEventListener('click', () => {
            const isExpanded = widget.classList.toggle('expanded');
            toggle.setAttribute('aria-expanded', isExpanded);

            if (isExpanded) {
                const firstNode = widget.querySelector('.spiral-node');
                if (firstNode) setTimeout(() => firstNode.focus(), 300);
            }
        });

        // Enter/Space to toggle
        toggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle.click();
            }
        });

        // Close Button
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                widget.classList.remove('expanded');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.focus();
            });
        }

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && widget.classList.contains('expanded')) {
                widget.classList.remove('expanded');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.focus();
            }
        });

        // Prevent disabled button clicks
        widget.addEventListener('click', (e) => {
            if (e.target.classList.contains('disabled')) {
                e.preventDefault();
            }
        });

        // Arrow key navigation within nodes
        const panel = widget.querySelector('.spiral-nav-panel');
        panel.addEventListener('keydown', (e) => {
            if (!['ArrowUp', 'ArrowDown'].includes(e.key)) return;

            const nodes = Array.from(panel.querySelectorAll('.spiral-node'));
            const currentIndex = nodes.indexOf(document.activeElement);

            if (currentIndex === -1) return;

            e.preventDefault();

            if (e.key === 'ArrowDown' && currentIndex < nodes.length - 1) {
                nodes[currentIndex + 1].focus();
            } else if (e.key === 'ArrowUp' && currentIndex > 0) {
                nodes[currentIndex - 1].focus();
            }
        });
    }

    // =========================================
    // INITIALIZATION
    // =========================================
    function init() {
        // Don't init if already exists
        if (document.querySelector('.spiral-nav')) return;

        const currentForge = detectCurrentForge();

        // Only show on forge pages
        if (!currentForge) {
            console.log('Spiral Nav: Not on a forge page, skipping initialization');
            return;
        }

        // Inject styles
        injectStyles();

        // Load state
        const state = loadState();

        // Update visited forges
        if (!state.visited.includes(currentForge)) {
            state.visited.push(currentForge);
            saveState(state);
            console.log(`Spiral Nav: First visit to ${currentForge.toUpperCase()} forge`);
        }

        // Create and inject widget
        const widget = createWidget(currentForge);
        document.body.appendChild(widget);

        // Update UI
        updateUI(widget, currentForge, state);

        // Attach events
        attachEventListeners(widget);

        console.log(`Spiral Nav: Active on ${currentForge.toUpperCase()} (${state.visited.length}/7 forges visited)`);
    }

    // =========================================
    // AUTO-INIT
    // =========================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose API
    window.SpiralNav = {
        init: init,
        getState: loadState,
        resetState: function() {
            localStorage.removeItem(STORAGE_KEY);
            console.log('Spiral Nav: State reset');
        }
    };

})();
