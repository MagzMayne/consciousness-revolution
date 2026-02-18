/**
 * ONBOARDING WIDGET - Service Connection Status
 *
 * Shows GitHub, Netlify, Railway connection status for team onboarding.
 * Part of the widget library system - dashboards pick widgets from the library.
 */

(function() {
    'use strict';

    const SERVICES = [
        {
            id: 'github',
            name: 'GitHub',
            icon: '🐙',
            checkEndpoint: '/.netlify/functions/health-check?service=github',
            connectUrl: 'https://github.com/overkillkulture/100X_DEPLOYMENT',
            description: 'Code repository'
        },
        {
            id: 'netlify',
            name: 'Netlify',
            icon: '🚀',
            checkEndpoint: '/.netlify/functions/health-check?service=netlify',
            connectUrl: 'https://app.netlify.com/sites/verdant-tulumba-fa2a5a/overview',
            description: 'Hosting & functions'
        },
        {
            id: 'railway',
            name: 'Railway',
            icon: '🚂',
            checkEndpoint: '/.netlify/functions/health-check?service=railway',
            connectUrl: 'https://railway.app/dashboard',
            description: 'Backend services'
        }
    ];

    // Connection state
    let connectionState = {
        github: { status: 'unknown', lastCheck: null },
        netlify: { status: 'unknown', lastCheck: null },
        railway: { status: 'unknown', lastCheck: null }
    };

    /**
     * Check service connection status
     */
    async function checkService(service) {
        try {
            // Quick local check - if we're on the site, Netlify is working
            if (service.id === 'netlify') {
                connectionState.netlify = { status: 'connected', lastCheck: Date.now() };
                return 'connected';
            }

            // For GitHub, check if we can reach the API through our function
            const response = await fetch(service.checkEndpoint, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                const data = await response.json();
                connectionState[service.id] = {
                    status: data.connected ? 'connected' : 'disconnected',
                    lastCheck: Date.now()
                };
                return connectionState[service.id].status;
            }
        } catch (e) {
            // If health check fails, assume service is available (function might not exist yet)
            connectionState[service.id] = { status: 'unknown', lastCheck: Date.now() };
        }
        return 'unknown';
    }

    /**
     * Check all services
     */
    async function checkAllServices() {
        // Netlify is always connected if we're on the site
        connectionState.netlify = { status: 'connected', lastCheck: Date.now() };

        // Check others in parallel
        await Promise.all(SERVICES.filter(s => s.id !== 'netlify').map(checkService));

        return connectionState;
    }

    /**
     * Get status color
     */
    function getStatusColor(status) {
        switch(status) {
            case 'connected': return '#00ff00';
            case 'disconnected': return '#ff4444';
            default: return '#ffaa00';
        }
    }

    /**
     * Get status text
     */
    function getStatusText(status) {
        switch(status) {
            case 'connected': return 'Connected';
            case 'disconnected': return 'Disconnected';
            default: return 'Checking...';
        }
    }

    /**
     * Render the widget into a container
     */
    function render(container) {
        if (!container) return;

        container.innerHTML = `
            <div class="onboarding-widget" style="padding: 12px;">
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${SERVICES.map(service => {
                        const state = connectionState[service.id] || { status: 'unknown' };
                        const color = getStatusColor(state.status);
                        return `
                            <div class="service-row" style="
                                display: flex;
                                align-items: center;
                                justify-content: space-between;
                                padding: 8px 12px;
                                background: rgba(0,0,0,0.3);
                                border-radius: 8px;
                                border-left: 3px solid ${color};
                            ">
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <span style="font-size: 1.2em;">${service.icon}</span>
                                    <div>
                                        <div style="color: #fff; font-weight: 500;">${service.name}</div>
                                        <div style="color: #888; font-size: 0.75em;">${service.description}</div>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="
                                        width: 10px;
                                        height: 10px;
                                        border-radius: 50%;
                                        background: ${color};
                                        box-shadow: 0 0 6px ${color};
                                    "></span>
                                    <a href="${service.connectUrl}" target="_blank" style="
                                        color: #0ff;
                                        text-decoration: none;
                                        font-size: 0.8em;
                                        opacity: 0.7;
                                    " title="Open ${service.name}">↗</a>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <button onclick="window.OnboardingWidget.refresh()" style="
                    width: 100%;
                    margin-top: 12px;
                    padding: 8px;
                    background: rgba(0, 255, 255, 0.1);
                    border: 1px solid rgba(0, 255, 255, 0.3);
                    border-radius: 6px;
                    color: #0ff;
                    cursor: pointer;
                    font-size: 0.85em;
                ">🔄 Refresh Status</button>
            </div>
        `;

        // Store container reference for refresh
        window.OnboardingWidget._container = container;
    }

    /**
     * Refresh the widget
     */
    async function refresh() {
        await checkAllServices();
        if (window.OnboardingWidget._container) {
            render(window.OnboardingWidget._container);
        }
    }

    /**
     * Initialize on load
     */
    async function init() {
        await checkAllServices();
        console.log('🔗 Onboarding Widget ready:', connectionState);
    }

    // Public API
    window.OnboardingWidget = {
        render,
        refresh,
        checkAllServices,
        getState: () => ({ ...connectionState }),
        _container: null
    };

    // Auto-init
    init();

})();
