// RootIB: RB-20260319142113-23784F0A
/**
 * WIDGET LIBRARY - Central Registry of All Available Widgets
 *
 * Dashboards are canvases. Widgets are picked from this library.
 * Each widget is self-contained with its own logic and rendering.
 *
 * To add a new widget:
 * 1. Create js/widgets/your-widget.js
 * 2. Add entry to WIDGET_LIBRARY below
 * 3. Widget auto-appears in WidgetPicker
 */

// Widget Library Registry
const WIDGET_LIBRARY = {

    // ═══════════════════════════════════════════════════════════════════
    // STATUS WIDGETS - Show connection/health status
    // ═══════════════════════════════════════════════════════════════════

    'onboarding-status': {
        id: 'onboarding-status',
        name: 'Service Connections',
        icon: '🔗',
        size: 'MEDIUM',
        category: 'STATUS',
        description: 'Shows GitHub, Netlify, Railway connection status',
        script: 'js/widgets/onboarding-widget.js',
        render: function(container) {
            if (window.OnboardingWidget) {
                window.OnboardingWidget.render(container);
            }
        }
    },

    'trinity-status': {
        id: 'trinity-status',
        name: 'Trinity Status',
        icon: '🔺',
        size: 'SMALL',
        category: 'STATUS',
        description: 'C1/C2/C3 instance status',
        dataSource: '/.netlify/functions/trinity-status',
        render: function(data) {
            const instances = data?.instances || [];
            return `
                <div style="display:flex; gap:8px; justify-content:center;">
                    ${['C1', 'C2', 'C3'].map(id => {
                        const inst = instances.find(i => i.id === id);
                        const active = inst?.active;
                        return `<div style="text-align:center;">
                            <div style="font-size:1.5em; opacity:${active ? 1 : 0.3};">${id === 'C1' ? '🔨' : id === 'C2' ? '🧠' : '👁️'}</div>
                            <div style="font-size:0.7em; color:${active ? '#0f0' : '#666'};">${id}</div>
                        </div>`;
                    }).join('')}
                </div>
            `;
        }
    },

    'araya-status': {
        id: 'araya-status',
        name: 'ARAYA Online',
        icon: '🤖',
        size: 'TINY',
        category: 'STATUS',
        description: 'ARAYA chat availability',
        refreshRate: 30,
        dataSource: '/.netlify/functions/araya-chat?ping=true',
        render: function(data) {
            const online = data?.status === 'ok' || data?.success;
            return `<div style="text-align:center; font-size:2em; color:${online ? '#0f0' : '#f00'};">●</div>`;
        }
    },

    // ═══════════════════════════════════════════════════════════════════
    // METRICS WIDGETS - Show numbers and stats
    // ═══════════════════════════════════════════════════════════════════

    'brain-atoms': {
        id: 'brain-atoms',
        name: 'Brain Atoms',
        icon: '🧠',
        size: 'SMALL',
        category: 'METRICS',
        description: 'Cyclotron atom count',
        content: '<div style="text-align:center; font-size:2em; color:#0ff;">166K</div><div style="text-align:center; color:#666;">atoms</div>'
    },

    'xp-level': {
        id: 'xp-level',
        name: 'XP Level',
        icon: '⭐',
        size: 'SMALL',
        category: 'METRICS',
        description: 'User XP and level',
        script: 'js/XP_LEVEL_SYSTEM.js',
        render: function(container) {
            // XP system renders itself
            const userId = localStorage.getItem('araya_user_id');
            if (window.XPSystem) {
                const xp = window.XPSystem.getXP(userId);
                container.innerHTML = `
                    <div style="text-align:center;">
                        <div style="font-size:2em; color:gold;">${xp.level}</div>
                        <div style="color:#666; font-size:0.8em;">${xp.current}/${xp.next} XP</div>
                        <div style="background:#333; height:4px; border-radius:2px; margin-top:8px;">
                            <div style="background:gold; height:100%; width:${(xp.current/xp.next)*100}%; border-radius:2px;"></div>
                        </div>
                    </div>
                `;
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════════
    // ACTION WIDGETS - Buttons that do things
    // ═══════════════════════════════════════════════════════════════════

    'quick-actions': {
        id: 'quick-actions',
        name: 'Quick Actions',
        icon: '⚡',
        size: 'MEDIUM',
        category: 'ACTIONS',
        description: '4 customizable action buttons',
        content: `
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                <button onclick="window.open('/araya-chat.html')" style="padding:12px; background:rgba(0,255,255,0.1); border:1px solid #0ff; border-radius:8px; color:#fff; cursor:pointer;">💬 Chat</button>
                <button onclick="window.open('/bugs.html')" style="padding:12px; background:rgba(255,200,0,0.1); border:1px solid gold; border-radius:8px; color:#fff; cursor:pointer;">🐛 Bugs</button>
                <button onclick="window.open('/dashboard.html')" style="padding:12px; background:rgba(0,255,0,0.1); border:1px solid #0f0; border-radius:8px; color:#fff; cursor:pointer;">📊 Dash</button>
                <button onclick="window.open('/store.html')" style="padding:12px; background:rgba(255,100,100,0.1); border:1px solid #f66; border-radius:8px; color:#fff; cursor:pointer;">🛒 Store</button>
            </div>
        `
    },

    'feedback-button': {
        id: 'feedback-button',
        name: 'Send Feedback',
        icon: '💡',
        size: 'TINY',
        category: 'ACTIONS',
        description: 'Quick feedback submission',
        content: `<button onclick="document.getElementById('arayaBugModal')?.style.setProperty('display','flex')" style="width:100%; height:100%; background:rgba(100,200,255,0.2); border:none; border-radius:8px; font-size:1.5em; cursor:pointer;">💡</button>`
    },

    // ═══════════════════════════════════════════════════════════════════
    // FEED WIDGETS - Show live data streams
    // ═══════════════════════════════════════════════════════════════════

    'discord-feed': {
        id: 'discord-feed',
        name: 'Discord Activity',
        icon: '💬',
        size: 'LARGE',
        category: 'FEEDS',
        description: 'Latest Discord messages',
        refreshRate: 60,
        dataSource: '/.netlify/functions/discord-feed',
        render: function(data) {
            const msgs = data?.messages || [];
            return msgs.slice(0, 5).map(m => `
                <div style="padding:8px; border-bottom:1px solid #333;">
                    <span style="color:#0ff;">${m.author || 'User'}</span>:
                    <span style="color:#999;">${m.content?.substring(0, 50) || '...'}</span>
                </div>
            `).join('') || '<div style="color:#666; text-align:center;">No messages</div>';
        }
    },

    'bug-feed': {
        id: 'bug-feed',
        name: 'Recent Bugs',
        icon: '🐛',
        size: 'MEDIUM',
        category: 'FEEDS',
        description: 'Latest bug reports',
        refreshRate: 120,
        dataSource: '/.netlify/functions/get-all-bugs',
        render: function(data) {
            const bugs = data?.bugs || [];
            return bugs.slice(0, 3).map(b => `
                <div style="padding:6px; border-left:3px solid ${b.status === 'open' ? '#f00' : '#0f0'}; margin-bottom:8px; background:rgba(0,0,0,0.3);">
                    <div style="font-size:0.9em; color:#fff;">#${b.number}: ${b.title?.substring(0, 30) || 'Bug'}</div>
                </div>
            `).join('') || '<div style="color:#666; text-align:center;">No bugs!</div>';
        }
    }
};

// ═══════════════════════════════════════════════════════════════════════
// WIDGET LIBRARY API
// ═══════════════════════════════════════════════════════════════════════

window.WidgetLibrary = {
    // Get all widgets as array (for WidgetPicker)
    getAll: function() {
        return Object.values(WIDGET_LIBRARY);
    },

    // Get widgets by category
    getByCategory: function(category) {
        return Object.values(WIDGET_LIBRARY).filter(w =>
            w.category.toLowerCase() === category.toLowerCase()
        );
    },

    // Get single widget config
    get: function(id) {
        return WIDGET_LIBRARY[id] || null;
    },

    // Register a new widget dynamically
    register: function(config) {
        if (!config.id) {
            console.error('Widget must have an id');
            return false;
        }
        WIDGET_LIBRARY[config.id] = config;
        console.log(`Widget registered: ${config.id}`);
        return true;
    },

    // Load widget script if needed
    loadScript: async function(widgetId) {
        const widget = WIDGET_LIBRARY[widgetId];
        if (!widget?.script) return;

        // Check if already loaded
        if (document.querySelector(`script[src="${widget.script}"]`)) return;

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = widget.script;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },

    // Get categories
    getCategories: function() {
        const cats = new Set();
        Object.values(WIDGET_LIBRARY).forEach(w => cats.add(w.category));
        return Array.from(cats);
    }
};

console.log('Widget Library loaded:', Object.keys(WIDGET_LIBRARY).length, 'widgets available');
