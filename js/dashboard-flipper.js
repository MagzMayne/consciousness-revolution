/**
 * DASHBOARD FLIPPER - Universal Dashboard Navigation
 *
 * A floating navigation menu that can be included in any dashboard to quickly
 * flip between dashboards. Shows Personal, Team, and All categories.
 *
 * Usage: Include this script on any page:
 * <script src="/js/dashboard-flipper.js"></script>
 *
 * Or call: DashboardFlipper.init() to manually initialize
 */

(function() {
    'use strict';

    // Dashboard registry - organized by category
    const DASHBOARDS = {
        personal: [
            { id: 'commander', name: 'Command Cockpit', icon: '🎖️', url: '/COMMANDER_COCKPIT.html' },
            { id: 'brain-query', name: 'Brain Query', icon: '🧠', url: '/BRAIN_QUERY_DASHBOARD.html' },
            { id: 'consciousness', name: 'Consciousness', icon: '🌀', url: '/CONSCIOUSNESS_DASHBOARD.html' },
            { id: 'health', name: 'Health Monitor', icon: '💚', url: '/health-monitor.html' },
            { id: 'araya', name: 'ARAYA Chat', icon: '🤖', url: '/araya-chat.html' }
        ],
        team: [
            { id: 'team-hub', name: 'Team Hub', icon: '👥', url: '/TEAM_DASHBOARD_HUB.html' },
            { id: 'trinity', name: 'Trinity Nexus', icon: '🔺', url: '/TRINITY_NEXUS_DASHBOARD.html' },
            { id: 'builder', name: 'Builder Cockpit', icon: '🔨', url: '/BUILDER_COCKPIT.html' },
            { id: 'beta', name: 'Beta Tester', icon: '🧪', url: '/BETA_TESTER_COCKPIT.html' },
            { id: 'domains', name: '7 Domains', icon: '🌐', url: '/DOMAIN_STATUS_DASHBOARD.html' },
            { id: 'bugs', name: 'Bug Tracker', icon: '🐛', url: '/bugs-live.html' }
        ],
        tools: [
            { id: 'project-registry', name: 'Project Registry', icon: '📋', url: '/PROJECT_REGISTRY.html' },
            { id: 'ai-protocol', name: 'AI Protocol', icon: '🤖', url: '/OPERATOR_AI_PROTOCOL.html' },
            { id: 'system-dna', name: 'System DNA', icon: '🧬', url: '/SYSTEM_DNA_BRIEFING.html' },
            { id: 'custom-dash', name: 'Custom Dashboard', icon: '🎛️', url: '/customizable-dashboard.html' },
            { id: 'keychain', name: 'Keychain', icon: '🔑', url: '/DASHBOARD_KEYCHAIN.html' },
            { id: 'admin', name: 'Admin', icon: '⚙️', url: '/admin-dashboard.html' }
        ],
        operators: [
            { id: 'op-commander-1', name: 'Commander 1', icon: '🎖️', url: '/COMMANDER_COCKPIT.html' },
            { id: 'op-commander-2', name: 'Commander 2', icon: '🎖️', url: '/COMMANDER_2.html' },
            { id: 'op-agent-r-1', name: 'Agent R 1', icon: '🦁', url: '/OPERATOR_COCKPIT_RYAN.html' },
            { id: 'op-agent-r-2', name: 'Agent R 2', icon: '🦁', url: '/AGENT_R_2.html' },
            { id: 'op-nero-1', name: 'Nero 1', icon: '🐺', url: '/OPERATOR_COCKPIT_NERO.html' },
            { id: 'op-nero-2', name: 'Nero 2', icon: '🐺', url: '/NERO_2.html' },
            { id: 'op-tiger-1', name: 'Tiger 1', icon: '🐯', url: '/OPERATOR_COCKPIT_TIGER.html' },
            { id: 'op-tiger-2', name: 'Tiger 2', icon: '🐯', url: '/TIGER_2.html' }
        ]
    };

    // State
    let isOpen = false;
    let currentCategory = 'team';
    let container = null;

    /**
     * Get current page info
     */
    function getCurrentPage() {
        const path = window.location.pathname;
        for (const category of Object.values(DASHBOARDS)) {
            for (const dash of category) {
                if (path.includes(dash.url.replace('/', ''))) {
                    return dash;
                }
            }
        }
        return null;
    }

    /**
     * Create the flipper UI
     */
    function createUI() {
        // Remove existing if present
        const existing = document.getElementById('dashboard-flipper');
        if (existing) existing.remove();

        container = document.createElement('div');
        container.id = 'dashboard-flipper';
        container.innerHTML = `
            <button class="flipper-toggle" onclick="DashboardFlipper.toggle()">
                <span class="toggle-icon">📊</span>
                <span class="toggle-label">Dashboards</span>
            </button>
            <div class="flipper-panel">
                <div class="flipper-header">
                    <span>Dashboard Flipper</span>
                    <button class="flipper-close" onclick="DashboardFlipper.close()">×</button>
                </div>
                <div class="flipper-categories">
                    <button class="cat-btn ${currentCategory === 'personal' ? 'active' : ''}" onclick="DashboardFlipper.setCategory('personal')">👤 Personal</button>
                    <button class="cat-btn ${currentCategory === 'team' ? 'active' : ''}" onclick="DashboardFlipper.setCategory('team')">👥 Team</button>
                    <button class="cat-btn ${currentCategory === 'tools' ? 'active' : ''}" onclick="DashboardFlipper.setCategory('tools')">🧰 Tools</button>
                    <button class="cat-btn ${currentCategory === 'operators' ? 'active' : ''}" onclick="DashboardFlipper.setCategory('operators')">🎭 Operators</button>
                </div>
                <div class="flipper-list" id="flipper-list">
                    <!-- Dashboards rendered here -->
                </div>
                <div class="flipper-footer">
                    <a href="/DASHBOARD_KEYCHAIN.html" class="footer-link">🔑 Full Keychain</a>
                    <a href="/START_HERE.html" class="footer-link">🏠 Home</a>
                </div>
            </div>
        `;

        // Add styles
        addStyles();

        document.body.appendChild(container);

        // Render initial list
        renderList();
    }

    /**
     * Add CSS styles
     */
    function addStyles() {
        const styleId = 'dashboard-flipper-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            #dashboard-flipper {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
                font-family: 'Segoe UI', system-ui, sans-serif;
            }

            .flipper-toggle {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px 18px;
                background: linear-gradient(135deg, rgba(0,255,170,0.2), rgba(0,200,255,0.2));
                border: 1px solid rgba(0,255,170,0.4);
                border-radius: 30px;
                color: #00ffaa;
                font-size: 0.95em;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 20px rgba(0,255,170,0.2);
            }

            .flipper-toggle:hover {
                transform: scale(1.05);
                box-shadow: 0 6px 30px rgba(0,255,170,0.3);
            }

            .toggle-icon {
                font-size: 1.3em;
            }

            #dashboard-flipper.open .flipper-toggle {
                opacity: 0;
                pointer-events: none;
            }

            .flipper-panel {
                position: absolute;
                bottom: 0;
                right: 0;
                width: 320px;
                max-height: 500px;
                background: rgba(20, 20, 35, 0.98);
                border: 1px solid rgba(0,255,170,0.3);
                border-radius: 16px;
                overflow: hidden;
                transform: scale(0.9) translateY(20px);
                opacity: 0;
                pointer-events: none;
                transition: all 0.3s ease;
                box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            }

            #dashboard-flipper.open .flipper-panel {
                transform: scale(1) translateY(0);
                opacity: 1;
                pointer-events: auto;
            }

            .flipper-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 18px;
                background: rgba(0,255,170,0.1);
                border-bottom: 1px solid rgba(255,255,255,0.1);
                color: #00ffaa;
                font-weight: 600;
            }

            .flipper-close {
                background: none;
                border: none;
                color: #888;
                font-size: 1.5em;
                cursor: pointer;
                line-height: 1;
            }

            .flipper-close:hover {
                color: #fff;
            }

            .flipper-categories {
                display: flex;
                gap: 5px;
                padding: 10px;
                background: rgba(0,0,0,0.2);
                flex-wrap: wrap;
            }

            .cat-btn {
                flex: 1;
                min-width: 70px;
                padding: 8px 10px;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 8px;
                color: #888;
                font-size: 0.75em;
                cursor: pointer;
                transition: all 0.2s;
            }

            .cat-btn:hover, .cat-btn.active {
                background: rgba(0,255,170,0.2);
                border-color: #00ffaa;
                color: #00ffaa;
            }

            .flipper-list {
                max-height: 300px;
                overflow-y: auto;
                padding: 10px;
            }

            .flipper-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 14px;
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 10px;
                margin-bottom: 8px;
                text-decoration: none;
                color: #e0e0e0;
                transition: all 0.2s;
            }

            .flipper-item:hover {
                background: rgba(0,255,170,0.1);
                border-color: rgba(0,255,170,0.3);
                transform: translateX(5px);
            }

            .flipper-item.current {
                background: rgba(0,255,170,0.15);
                border-color: #00ffaa;
            }

            .flipper-item .icon {
                font-size: 1.4em;
            }

            .flipper-item .name {
                flex: 1;
                font-weight: 500;
            }

            .flipper-item .arrow {
                color: #555;
                font-size: 0.9em;
            }

            .flipper-footer {
                display: flex;
                justify-content: center;
                gap: 20px;
                padding: 12px;
                background: rgba(0,0,0,0.3);
                border-top: 1px solid rgba(255,255,255,0.1);
            }

            .footer-link {
                color: #888;
                text-decoration: none;
                font-size: 0.85em;
                transition: color 0.2s;
            }

            .footer-link:hover {
                color: #00ffaa;
            }

            /* Scrollbar */
            .flipper-list::-webkit-scrollbar {
                width: 6px;
            }

            .flipper-list::-webkit-scrollbar-track {
                background: rgba(0,0,0,0.2);
            }

            .flipper-list::-webkit-scrollbar-thumb {
                background: rgba(0,255,170,0.3);
                border-radius: 3px;
            }

            /* Keyboard shortcut hint */
            .shortcut-hint {
                position: absolute;
                bottom: -25px;
                right: 0;
                font-size: 0.7em;
                color: #555;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Render the dashboard list
     */
    function renderList() {
        const listEl = document.getElementById('flipper-list');
        if (!listEl) return;

        const dashboards = DASHBOARDS[currentCategory] || [];
        const currentPage = getCurrentPage();

        listEl.innerHTML = dashboards.map(dash => {
            const isCurrent = currentPage && currentPage.id === dash.id;
            return `
                <a href="${dash.url}" class="flipper-item ${isCurrent ? 'current' : ''}">
                    <span class="icon">${dash.icon}</span>
                    <span class="name">${dash.name}</span>
                    <span class="arrow">→</span>
                </a>
            `;
        }).join('');
    }

    /**
     * Toggle panel open/closed
     */
    function toggle() {
        isOpen = !isOpen;
        if (container) {
            container.classList.toggle('open', isOpen);
        }
    }

    /**
     * Open panel
     */
    function open() {
        isOpen = true;
        if (container) {
            container.classList.add('open');
        }
    }

    /**
     * Close panel
     */
    function close() {
        isOpen = false;
        if (container) {
            container.classList.remove('open');
        }
    }

    /**
     * Set category
     */
    function setCategory(cat) {
        currentCategory = cat;

        // Update button states
        document.querySelectorAll('.cat-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.toLowerCase().includes(cat)) {
                btn.classList.add('active');
            }
        });

        renderList();
    }

    /**
     * Initialize
     */
    function init() {
        // Create UI when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', createUI);
        } else {
            createUI();
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+D to toggle
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                toggle();
            }
            // Escape to close
            if (e.key === 'Escape' && isOpen) {
                close();
            }
        });

        console.log('📊 Dashboard Flipper initialized (Ctrl+D to toggle)');
    }

    // Public API
    window.DashboardFlipper = {
        init,
        toggle,
        open,
        close,
        setCategory,
        getDashboards: () => DASHBOARDS
    };

    // Auto-init
    init();

})();
