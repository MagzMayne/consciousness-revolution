// RootIB: RB-20260319142113-BADCBD6B
/**
 * BUILDER PANEL - 1/4 Page Development Tracker
 * Pattern: 3 → 7 → 13 → ∞
 *
 * Usage:
 *   <script src="/js/builder-panel.js"></script>
 *   <script>
 *     BUILDER.init({
 *       product: 'araya-chat',
 *       forge: 'reality',
 *       seed: 75,
 *       sprint: ['Voice input integration'],
 *       blockers: [],
 *       dnaPath: '/DNA_LIBRARY/2/ARAYA_DNA.md'
 *     });
 *   </script>
 */

const BUILDER = {
    config: {
        product: 'unknown',
        forge: 'unknown',
        seed: 0,
        sprint: [],
        blockers: [],
        dnaPath: '',
        lfsme: { L: 5, F: 5, S: 5, M: 5, E: 5 },
        collapsed: false,
        position: 'right' // 'right' or 'bottom'
    },

    SEED_LEVELS: {
        sprout: { min: 0, max: 19, icon: '🌱', color: '#ff6b6b', label: 'SPROUT' },
        seedling: { min: 20, max: 39, icon: '🌿', color: '#ffd93d', label: 'SEEDLING' },
        growing: { min: 40, max: 59, icon: '🌳', color: '#6bcb77', label: 'GROWING' },
        blooming: { min: 60, max: 79, icon: '🌸', color: '#4d96ff', label: 'BLOOMING' },
        harvest: { min: 80, max: 100, icon: '🍎', color: '#00ff88', label: 'HARVEST' }
    },

    FORGES: {
        reality: { color: '#00ff88', icon: '🔮' },
        creation: { color: '#ffd93d', icon: '🛠️' },
        comms: { color: '#00ccff', icon: '📡' },
        guardian: { color: '#ff6b6b', icon: '🛡️' },
        wealth: { color: '#ffaa00', icon: '💰' },
        character: { color: '#ff00ff', icon: '🧠' },
        infinity: { color: '#aa00ff', icon: '∞' },
        all: { color: '#ffffff', icon: '⚡' }
    },

    init(options = {}) {
        this.config = { ...this.config, ...options };

        // Check if we're in production mode
        if (document.body.classList.contains('production')) {
            console.log('[BUILDER] Production mode - panel hidden');
            return;
        }

        this.injectStyles();
        this.render();
        this.bindEvents();

        console.log(`[BUILDER] Panel initialized for ${this.config.product}`);
    },

    getSeedLevel(seed) {
        for (const [key, level] of Object.entries(this.SEED_LEVELS)) {
            if (seed >= level.min && seed <= level.max) {
                return { key, ...level };
            }
        }
        return this.SEED_LEVELS.sprout;
    },

    getLFSMETotal() {
        const { L, F, S, M, E } = this.config.lfsme;
        return Math.round(((L + F + S + M + E) / 50) * 100);
    },

    injectStyles() {
        if (document.getElementById('builder-panel-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'builder-panel-styles';
        styles.textContent = `
            .builder-panel {
                position: fixed;
                right: 0;
                top: 0;
                width: 25%;
                min-width: 300px;
                max-width: 400px;
                height: 100vh;
                background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
                border-left: 2px solid #00ff88;
                padding: 20px;
                font-family: 'JetBrains Mono', 'Fira Code', monospace;
                color: #e0e0e0;
                overflow-y: auto;
                z-index: 9999;
                transition: all 0.3s ease;
                box-shadow: -5px 0 20px rgba(0, 0, 0, 0.5);
            }

            .builder-panel.collapsed {
                width: 50px;
                min-width: 50px;
                padding: 10px;
            }

            .builder-panel.collapsed .builder-content {
                display: none;
            }

            .builder-panel.bottom {
                top: auto;
                bottom: 0;
                left: 0;
                right: 0;
                width: 100%;
                max-width: 100%;
                height: 25%;
                min-height: 200px;
                border-left: none;
                border-top: 2px solid #00ff88;
            }

            .builder-toggle {
                position: absolute;
                top: 10px;
                left: 10px;
                background: rgba(0, 255, 136, 0.2);
                border: 1px solid #00ff88;
                color: #00ff88;
                padding: 5px 10px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
            }

            .builder-toggle:hover {
                background: rgba(0, 255, 136, 0.3);
            }

            .builder-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 15px;
                padding-top: 30px;
            }

            .builder-product-name {
                font-size: 1.1rem;
                font-weight: bold;
                color: #fff;
            }

            .builder-forge-badge {
                padding: 3px 8px;
                border-radius: 12px;
                font-size: 0.75rem;
                text-transform: uppercase;
            }

            .builder-seed-section {
                background: rgba(0, 0, 0, 0.2);
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 15px;
            }

            .builder-seed-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }

            .builder-seed-level {
                font-size: 1.5rem;
            }

            .builder-seed-label {
                font-size: 0.9rem;
                font-weight: bold;
            }

            .builder-seed-percent {
                font-size: 1.2rem;
                font-weight: bold;
            }

            .builder-seed-bar-container {
                width: 100%;
                height: 20px;
                background: #333;
                border-radius: 10px;
                overflow: hidden;
            }

            .builder-seed-bar {
                height: 100%;
                border-radius: 10px;
                transition: width 0.5s ease;
            }

            .builder-lfsme {
                display: flex;
                gap: 8px;
                margin: 15px 0;
                flex-wrap: wrap;
            }

            .builder-lfsme-item {
                background: rgba(255, 255, 255, 0.05);
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 0.8rem;
            }

            .builder-lfsme-total {
                background: rgba(0, 255, 136, 0.1);
                color: #00ff88;
                font-weight: bold;
            }

            .builder-section {
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }

            .builder-section h4 {
                font-size: 0.85rem;
                color: #888;
                margin-bottom: 8px;
            }

            .builder-sprint-item {
                background: rgba(0, 255, 136, 0.1);
                color: #00ff88;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 0.85rem;
                margin-top: 5px;
            }

            .builder-blocker-item {
                background: rgba(255, 107, 107, 0.1);
                color: #ff6b6b;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 0.85rem;
                margin-top: 5px;
            }

            .builder-actions {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 8px;
                margin-top: 15px;
            }

            .builder-action-btn {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: #e0e0e0;
                padding: 8px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.8rem;
                transition: all 0.2s ease;
            }

            .builder-action-btn:hover {
                background: rgba(0, 255, 136, 0.1);
                border-color: #00ff88;
                color: #00ff88;
            }

            .builder-meta {
                margin-top: 15px;
                font-size: 0.75rem;
                color: #666;
            }

            .builder-meta-item {
                display: flex;
                justify-content: space-between;
                padding: 3px 0;
            }

            /* Adjust main content when panel is visible */
            body.builder-active:not(.builder-collapsed) {
                margin-right: 25%;
            }

            body.builder-active.builder-bottom:not(.builder-collapsed) {
                margin-right: 0;
                margin-bottom: 25%;
            }

            @media (max-width: 768px) {
                .builder-panel {
                    width: 100%;
                    max-width: 100%;
                    height: 40%;
                    top: auto;
                    bottom: 0;
                    border-left: none;
                    border-top: 2px solid #00ff88;
                }

                body.builder-active:not(.builder-collapsed) {
                    margin-right: 0;
                    margin-bottom: 40%;
                }
            }
        `;
        document.head.appendChild(styles);
    },

    render() {
        const panel = document.createElement('div');
        panel.id = 'builder-panel';
        panel.className = `builder-panel ${this.config.collapsed ? 'collapsed' : ''} ${this.config.position === 'bottom' ? 'bottom' : ''}`;

        const seedLevel = this.getSeedLevel(this.config.seed);
        const forge = this.FORGES[this.config.forge.toLowerCase()] || this.FORGES.all;
        const lfsmeTotal = this.getLFSMETotal();

        panel.innerHTML = `
            <button class="builder-toggle" onclick="BUILDER.toggle()">
                ${this.config.collapsed ? '◀' : '▶'}
            </button>

            <div class="builder-content">
                <div class="builder-header">
                    <span class="builder-product-name">${forge.icon} ${this.config.product}</span>
                    <span class="builder-forge-badge" style="background: ${forge.color}20; color: ${forge.color}; border: 1px solid ${forge.color};">
                        ${this.config.forge}
                    </span>
                </div>

                <div class="builder-seed-section">
                    <div class="builder-seed-header">
                        <div>
                            <span class="builder-seed-level">${seedLevel.icon}</span>
                            <span class="builder-seed-label" style="color: ${seedLevel.color};">${seedLevel.label}</span>
                        </div>
                        <span class="builder-seed-percent" style="color: ${seedLevel.color};">${this.config.seed}%</span>
                    </div>
                    <div class="builder-seed-bar-container">
                        <div class="builder-seed-bar" style="width: ${this.config.seed}%; background: ${seedLevel.color};"></div>
                    </div>
                </div>

                <div class="builder-lfsme">
                    <span class="builder-lfsme-item" title="Lighter">L:${this.config.lfsme.L}</span>
                    <span class="builder-lfsme-item" title="Faster">F:${this.config.lfsme.F}</span>
                    <span class="builder-lfsme-item" title="Stronger">S:${this.config.lfsme.S}</span>
                    <span class="builder-lfsme-item" title="More Elegant">M:${this.config.lfsme.M}</span>
                    <span class="builder-lfsme-item" title="Less Expensive">E:${this.config.lfsme.E}</span>
                    <span class="builder-lfsme-item builder-lfsme-total">${lfsmeTotal}%</span>
                </div>

                ${this.config.sprint.length ? `
                    <div class="builder-section">
                        <h4>Sprint</h4>
                        ${this.config.sprint.map(s => `<div class="builder-sprint-item">→ ${s}</div>`).join('')}
                    </div>
                ` : ''}

                ${this.config.blockers.length ? `
                    <div class="builder-section">
                        <h4>Blockers</h4>
                        ${this.config.blockers.map(b => `<div class="builder-blocker-item">⚠️ ${b}</div>`).join('')}
                    </div>
                ` : ''}

                <div class="builder-actions">
                    <button class="builder-action-btn" onclick="BUILDER.reportBug()">🐛 Bug</button>
                    <button class="builder-action-btn" onclick="BUILDER.suggest()">💡 Idea</button>
                    <button class="builder-action-btn" onclick="BUILDER.viewDNA()">🧬 DNA</button>
                    <button class="builder-action-btn" onclick="BUILDER.viewTracker()">📊 Tracker</button>
                </div>

                <div class="builder-meta">
                    <div class="builder-meta-item">
                        <span>Build Guild Beta</span>
                        <span>v1.0</span>
                    </div>
                    <div class="builder-meta-item">
                        <span>Pattern</span>
                        <span>3 → 7 → 13 → ∞</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(panel);
        document.body.classList.add('builder-active');

        if (this.config.position === 'bottom') {
            document.body.classList.add('builder-bottom');
        }
    },

    toggle() {
        this.config.collapsed = !this.config.collapsed;
        const panel = document.getElementById('builder-panel');
        panel.classList.toggle('collapsed');
        document.body.classList.toggle('builder-collapsed');

        const toggle = panel.querySelector('.builder-toggle');
        toggle.textContent = this.config.collapsed ? '◀' : '▶';
    },

    reportBug() {
        const url = `https://conciousnessrevolution.io/bugs.html?product=${encodeURIComponent(this.config.product)}&seed=${this.config.seed}`;
        window.open(url, '_blank');
    },

    suggest() {
        const url = `https://conciousnessrevolution.io/bugs.html?type=feature&product=${encodeURIComponent(this.config.product)}`;
        window.open(url, '_blank');
    },

    viewDNA() {
        if (this.config.dnaPath) {
            window.open(this.config.dnaPath, '_blank');
        } else {
            alert('DNA path not configured');
        }
    },

    viewTracker() {
        window.open('https://conciousnessrevolution.io/SEED_TRACKER_DASHBOARD.html', '_blank');
    },

    updateSeed(newSeed) {
        this.config.seed = newSeed;
        const seedLevel = this.getSeedLevel(newSeed);

        const panel = document.getElementById('builder-panel');
        if (panel) {
            panel.querySelector('.builder-seed-bar').style.width = `${newSeed}%`;
            panel.querySelector('.builder-seed-bar').style.background = seedLevel.color;
            panel.querySelector('.builder-seed-percent').textContent = `${newSeed}%`;
            panel.querySelector('.builder-seed-percent').style.color = seedLevel.color;
            panel.querySelector('.builder-seed-level').textContent = seedLevel.icon;
            panel.querySelector('.builder-seed-label').textContent = seedLevel.label;
            panel.querySelector('.builder-seed-label').style.color = seedLevel.color;
        }
    },

    destroy() {
        const panel = document.getElementById('builder-panel');
        if (panel) {
            panel.remove();
        }
        document.body.classList.remove('builder-active', 'builder-collapsed', 'builder-bottom');
    },

    bindEvents() {
        // Keyboard shortcut: B to toggle panel
        document.addEventListener('keydown', (e) => {
            if (e.key === 'b' && e.ctrlKey && e.shiftKey) {
                this.toggle();
            }
        });
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BUILDER;
}
