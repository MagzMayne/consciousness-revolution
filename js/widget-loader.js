// RootIB: RB-20260319142113-7739E492
/**
 * WIDGET LOADER - Dashboard Factory Phase 3
 * Include this script in any dashboard to load installed widgets
 *
 * Usage:
 *   <script src="/js/widget-loader.js"></script>
 *   <div id="widget-container"></div>
 *   <script>WidgetLoader.init('widget-container');</script>
 */

const WidgetLoader = {
    API_URL: '/.netlify/functions/widget-marketplace',
    STORAGE_KEY: 'installed_widgets',

    // Get installed widgets from localStorage
    getInstalled() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
        } catch (e) {
            console.warn('[WidgetLoader] Failed to parse installed widgets:', e);
            return [];
        }
    },

    // Fetch widget code from API
    async fetchWidgetCode(widgetId) {
        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'getCode', widgetId })
            });
            const data = await response.json();
            if (data.success) {
                return { html: data.html, js: data.js, css: data.css };
            }
            console.warn(`[WidgetLoader] Failed to fetch ${widgetId}:`, data.error);
            return null;
        } catch (e) {
            console.error(`[WidgetLoader] API error for ${widgetId}:`, e);
            return null;
        }
    },

    // Inject CSS into head
    injectCSS(widgetId, css) {
        if (!css) return;
        const styleId = `widget-style-${widgetId}`;
        if (document.getElementById(styleId)) return; // Already injected

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = css;
        document.head.appendChild(style);
    },

    // Inject JS (safely)
    injectJS(widgetId, js) {
        if (!js) return;
        const scriptId = `widget-script-${widgetId}`;
        if (document.getElementById(scriptId)) return; // Already injected

        const script = document.createElement('script');
        script.id = scriptId;
        script.textContent = js;
        document.body.appendChild(script);
    },

    // Render a single widget
    async renderWidget(widgetId, container) {
        const code = await this.fetchWidgetCode(widgetId);
        if (!code) return false;

        // Create widget wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'loaded-widget';
        wrapper.dataset.widgetId = widgetId;
        wrapper.innerHTML = code.html || '';

        // Inject CSS first
        this.injectCSS(widgetId, code.css);

        // Add to container
        container.appendChild(wrapper);

        // Inject JS last (after HTML is in DOM)
        this.injectJS(widgetId, code.js);

        console.log(`[WidgetLoader] Loaded: ${widgetId}`);
        return true;
    },

    // Initialize - load all installed widgets
    async init(containerId = 'widget-container', options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`[WidgetLoader] Container #${containerId} not found`);
            return;
        }

        const installed = this.getInstalled();
        if (installed.length === 0) {
            console.log('[WidgetLoader] No widgets installed');
            if (options.showEmpty) {
                container.innerHTML = `
                    <div class="widget-empty-state">
                        <p>No widgets installed</p>
                        <a href="/WIDGET_MARKETPLACE.html">Browse Marketplace</a>
                    </div>
                `;
            }
            return;
        }

        console.log(`[WidgetLoader] Loading ${installed.length} widgets:`, installed);

        // Add loading indicator
        container.innerHTML = '<div class="widget-loading">Loading widgets...</div>';

        // Load all widgets in parallel
        const results = await Promise.all(
            installed.map(id => this.renderWidget(id, container))
        );

        // Remove loading indicator
        const loader = container.querySelector('.widget-loading');
        if (loader) loader.remove();

        const loaded = results.filter(r => r).length;
        console.log(`[WidgetLoader] Loaded ${loaded}/${installed.length} widgets`);

        // Dispatch event for dashboard to hook into
        window.dispatchEvent(new CustomEvent('widgetsLoaded', {
            detail: { loaded, total: installed.length, ids: installed }
        }));
    },

    // Load a specific widget on demand
    async loadWidget(widgetId, containerId = 'widget-container') {
        const container = document.getElementById(containerId);
        if (!container) return false;
        return this.renderWidget(widgetId, container);
    },

    // Unload a widget from DOM
    unloadWidget(widgetId) {
        const wrapper = document.querySelector(`.loaded-widget[data-widget-id="${widgetId}"]`);
        if (wrapper) wrapper.remove();

        const style = document.getElementById(`widget-style-${widgetId}`);
        if (style) style.remove();

        const script = document.getElementById(`widget-script-${widgetId}`);
        if (script) script.remove();

        console.log(`[WidgetLoader] Unloaded: ${widgetId}`);
    },

    // Reload all widgets (useful after install/uninstall)
    async reload(containerId = 'widget-container') {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Clear existing widgets
        container.innerHTML = '';

        // Reload
        await this.init(containerId);
    }
};

// Auto-init if data attribute present
document.addEventListener('DOMContentLoaded', () => {
    const autoContainers = document.querySelectorAll('[data-widget-loader]');
    autoContainers.forEach(container => {
        WidgetLoader.init(container.id || 'widget-container');
    });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WidgetLoader;
}
