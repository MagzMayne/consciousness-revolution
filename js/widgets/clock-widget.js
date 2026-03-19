// RootIB: RB-20260319142113-A2AF0DF3
/**
 * CLOCK WIDGET - Live Time Display
 * Shows current time with date, auto-updates every second.
 */

(function() {
    'use strict';

    let intervalId = null;
    let container = null;

    /**
     * Render the clock widget
     */
    function render(targetContainer) {
        container = targetContainer;
        if (!container) return;

        updateDisplay();

        // Update every second
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(updateDisplay, 1000);

        // Store for cleanup
        window.ClockWidget._interval = intervalId;
    }

    /**
     * Update the time display
     */
    function updateDisplay() {
        if (!container) return;

        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        const dateStr = now.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });

        container.innerHTML = `
            <div style="text-align: center; padding: 10px 0;">
                <div style="font-size: 1.8em; font-weight: 300; color: #0ff; letter-spacing: 2px; text-shadow: 0 0 10px rgba(0,255,255,0.5);">
                    ${timeStr}
                </div>
                <div style="font-size: 0.85em; color: #888; margin-top: 5px;">
                    ${dateStr}
                </div>
            </div>
        `;
    }

    /**
     * Cleanup
     */
    function destroy() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
        container = null;
    }

    // Public API
    window.ClockWidget = {
        render,
        destroy,
        _interval: null
    };

    // Register with widget library if available
    if (window.WidgetLibrary) {
        window.WidgetLibrary.register({
            id: 'live-clock',
            name: 'Live Clock',
            icon: '🕐',
            size: 'SMALL',
            category: 'STATUS',
            description: 'Current time and date',
            render: function(container) {
                window.ClockWidget.render(container);
            }
        });
    }

    console.log('🕐 Clock Widget loaded');
})();
