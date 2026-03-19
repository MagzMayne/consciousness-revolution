// RootIB: RB-20260319142113-21C0A91D
/**
 * WIDGET PANEL - Dashboard Factory Phase 3
 * Adds a collapsible widget sidebar + manage button to any dashboard
 *
 * Usage:
 *   <script src="/js/widget-loader.js"></script>
 *   <script src="/js/widget-panel.js"></script>
 *   <script>WidgetPanel.init();</script>
 */

const WidgetPanel = {
    initialized: false,

    // Inject the panel HTML and CSS
    init(position = 'right') {
        if (this.initialized) return;
        this.initialized = true;

        // Inject CSS
        const css = `
            .widget-panel {
                position: fixed;
                top: 60px;
                ${position}: 0;
                width: 320px;
                height: calc(100vh - 60px);
                background: rgba(10, 10, 20, 0.95);
                border-${position === 'right' ? 'left' : 'right'}: 1px solid rgba(0, 255, 255, 0.3);
                transform: translateX(${position === 'right' ? '100%' : '-100%'});
                transition: transform 0.3s ease;
                z-index: 9999;
                overflow-y: auto;
                padding: 15px;
                font-family: 'Courier New', monospace;
            }
            .widget-panel.open {
                transform: translateX(0);
            }
            .widget-panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid rgba(0, 255, 255, 0.2);
            }
            .widget-panel-header h3 {
                margin: 0;
                color: #00ffff;
                font-size: 14px;
            }
            .widget-panel-close {
                background: none;
                border: none;
                color: #888;
                font-size: 20px;
                cursor: pointer;
            }
            .widget-panel-close:hover { color: #fff; }
            .widget-panel-actions {
                display: flex;
                gap: 10px;
                margin-bottom: 15px;
            }
            .widget-panel-actions a, .widget-panel-actions button {
                flex: 1;
                padding: 8px;
                font-size: 11px;
                text-align: center;
                text-decoration: none;
                border-radius: 4px;
                cursor: pointer;
                font-family: inherit;
            }
            .widget-panel-browse {
                background: rgba(0, 255, 255, 0.2);
                border: 1px solid #00ffff;
                color: #00ffff;
            }
            .widget-panel-reload {
                background: rgba(100, 100, 100, 0.2);
                border: 1px solid #666;
                color: #aaa;
            }
            #widget-container {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            .loaded-widget {
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 6px;
                padding: 12px;
            }
            .widget-empty-state {
                text-align: center;
                padding: 30px 15px;
                color: #666;
            }
            .widget-empty-state a {
                color: #00ffff;
                display: inline-block;
                margin-top: 10px;
            }
            .widget-loading {
                text-align: center;
                padding: 20px;
                color: #00ffff;
            }
            .widget-toggle-btn {
                position: fixed;
                top: 70px;
                ${position}: 10px;
                width: 40px;
                height: 40px;
                background: rgba(0, 255, 255, 0.2);
                border: 1px solid #00ffff;
                border-radius: 8px;
                color: #00ffff;
                font-size: 18px;
                cursor: pointer;
                z-index: 9998;
                transition: all 0.3s ease;
            }
            .widget-toggle-btn:hover {
                background: rgba(0, 255, 255, 0.4);
            }
            .widget-toggle-btn.panel-open {
                opacity: 0;
                pointer-events: none;
            }
            .widget-count-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #00ffff;
                color: #000;
                font-size: 10px;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        `;
        const style = document.createElement('style');
        style.id = 'widget-panel-styles';
        style.textContent = css;
        document.head.appendChild(style);

        // Get installed count
        const installed = WidgetLoader ? WidgetLoader.getInstalled() : [];
        const count = installed.length;

        // Inject HTML
        const panel = document.createElement('div');
        panel.className = 'widget-panel';
        panel.id = 'widget-panel';
        panel.innerHTML = `
            <div class="widget-panel-header">
                <h3>📦 Widgets (${count})</h3>
                <button class="widget-panel-close" onclick="WidgetPanel.close()">×</button>
            </div>
            <div class="widget-panel-actions">
                <a href="/WIDGET_MARKETPLACE.html" class="widget-panel-browse">+ Browse More</a>
                <button class="widget-panel-reload" onclick="WidgetPanel.reload()">↻ Reload</button>
            </div>
            <div id="widget-container" data-widget-loader></div>
        `;
        document.body.appendChild(panel);

        // Inject toggle button
        const btn = document.createElement('button');
        btn.className = 'widget-toggle-btn';
        btn.id = 'widget-toggle-btn';
        btn.innerHTML = `⚡${count > 0 ? `<span class="widget-count-badge">${count}</span>` : ''}`;
        btn.onclick = () => this.toggle();
        document.body.appendChild(btn);

        // Load widgets
        if (typeof WidgetLoader !== 'undefined') {
            WidgetLoader.init('widget-container', { showEmpty: true });
        }

        // Update count after load
        window.addEventListener('widgetsLoaded', (e) => {
            this.updateCount(e.detail.loaded);
        });

        console.log('[WidgetPanel] Initialized');
    },

    toggle() {
        const panel = document.getElementById('widget-panel');
        const btn = document.getElementById('widget-toggle-btn');
        if (panel) {
            panel.classList.toggle('open');
            btn?.classList.toggle('panel-open');
        }
    },

    open() {
        document.getElementById('widget-panel')?.classList.add('open');
        document.getElementById('widget-toggle-btn')?.classList.add('panel-open');
    },

    close() {
        document.getElementById('widget-panel')?.classList.remove('open');
        document.getElementById('widget-toggle-btn')?.classList.remove('panel-open');
    },

    async reload() {
        if (typeof WidgetLoader !== 'undefined') {
            await WidgetLoader.reload('widget-container');
        }
    },

    updateCount(count) {
        const header = document.querySelector('.widget-panel-header h3');
        if (header) header.textContent = `📦 Widgets (${count})`;

        const badge = document.querySelector('.widget-count-badge');
        if (badge) badge.textContent = count;
        else if (count > 0) {
            const btn = document.getElementById('widget-toggle-btn');
            if (btn) btn.innerHTML = `⚡<span class="widget-count-badge">${count}</span>`;
        }
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WidgetPanel;
}
