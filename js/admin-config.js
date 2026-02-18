/**
 * ADMIN CONFIG - Core Founders and Widget Controls
 *
 * This file defines admin access and widget toggle states.
 * Core founders can enable/disable site-wide features.
 */

(function() {
    'use strict';

    // Core Founders - Full admin access
    const CORE_FOUNDERS = [
        'darrickpreble@proton.me',      // Commander - Darrick
        'barbrickdesign@gmail.com',     // Agent R / Ryan
        'teddy@example.com',            // Teddy (update with real email)
        'nero@example.com'              // Nero (update with real email)
    ];

    // Widget/Feature toggle states (persisted to localStorage)
    const STORAGE_KEY = 'admin_widget_config';

    // Default widget states
    const DEFAULT_WIDGET_CONFIG = {
        robotAssistant: true,       // The robot assistant bubbles
        dashboardFlipper: true,     // Ctrl+D dashboard navigation
        bugWidget: true,            // Bug report button
        betaBanner: true,           // Beta tester banner
        trinityComms: true,         // Trinity communication panel
        serviceStatus: true,        // Service status lights
        arayaChat: true,            // ARAYA chat integration
        documentViewer: true        // Document viewer area
    };

    /**
     * Check if email is a core founder
     */
    function isCoreFounder(email) {
        if (!email) return false;
        return CORE_FOUNDERS.includes(email.toLowerCase());
    }

    /**
     * Get current widget config
     */
    function getWidgetConfig() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                return { ...DEFAULT_WIDGET_CONFIG, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('Error loading widget config:', e);
        }
        return { ...DEFAULT_WIDGET_CONFIG };
    }

    /**
     * Save widget config (admin only)
     */
    function saveWidgetConfig(config) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
            console.log('Widget config saved:', config);
            return true;
        } catch (e) {
            console.error('Error saving widget config:', e);
            return false;
        }
    }

    /**
     * Toggle a specific widget
     */
    function toggleWidget(widgetId, enabled) {
        const config = getWidgetConfig();
        config[widgetId] = enabled;
        saveWidgetConfig(config);

        // Trigger event for listeners
        window.dispatchEvent(new CustomEvent('widget-toggle', {
            detail: { widgetId, enabled, config }
        }));

        return config;
    }

    /**
     * Check if a widget is enabled
     */
    function isWidgetEnabled(widgetId) {
        const config = getWidgetConfig();
        return config[widgetId] !== false; // Default to true if not set
    }

    /**
     * Get all core founders
     */
    function getCoreFounders() {
        return [...CORE_FOUNDERS];
    }

    // Public API
    window.AdminConfig = {
        isCoreFounder,
        getCoreFounders,
        getWidgetConfig,
        saveWidgetConfig,
        toggleWidget,
        isWidgetEnabled,
        CORE_FOUNDERS: [...CORE_FOUNDERS],
        DEFAULT_WIDGET_CONFIG: { ...DEFAULT_WIDGET_CONFIG }
    };

    console.log('⚙️ Admin Config loaded. Core founders:', CORE_FOUNDERS.length);
})();
