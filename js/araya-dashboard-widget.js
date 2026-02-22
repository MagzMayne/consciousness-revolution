/**
 * ARAYA Dashboard Widget - Universal Edit Interface
 * Embeds on every dashboard in "Second Tier" mode
 * Top band: 7 Domains Navigation
 * Bottom band: ARAYA Quick Edit Bar
 *
 * Usage: <script src="/js/araya-dashboard-widget.js"></script>
 */

(function() {
    'use strict';

    const ARAYA_WIDGET_VERSION = '1.0.0';

    // Domain configuration with colors
    const DOMAINS = [
        { name: 'COMMAND', icon: '🎯', color: '#ff6b35', key: '1' },
        { name: 'BUILD', icon: '🔨', color: '#00d4ff', key: '2' },
        { name: 'CONNECT', icon: '🤝', color: '#22c55e', key: '3' },
        { name: 'PROTECT', icon: '⚖️', color: '#a855f7', key: '4' },
        { name: 'GROW', icon: '💰', color: '#ef4444', key: '5' },
        { name: 'LEARN', icon: '📚', color: '#3b82f6', key: '6' },
        { name: 'TRANSCEND', icon: '✨', color: '#f472b6', key: '7' }
    ];

    // Domain to dashboard mapping
    const DOMAIN_PAGES = {
        'COMMAND': 'SEVEN_DOMAINS_HUB.html#command',
        'BUILD': 'SEVEN_DOMAINS_HUB.html#build',
        'CONNECT': 'SEVEN_DOMAINS_HUB.html#connect',
        'PROTECT': 'SEVEN_DOMAINS_HUB.html#protect',
        'GROW': 'SEVEN_DOMAINS_HUB.html#grow',
        'LEARN': 'SEVEN_DOMAINS_HUB.html#learn',
        'TRANSCEND': 'SEVEN_DOMAINS_HUB.html#transcend'
    };

    // Inject styles
    function injectStyles() {
        const style = document.createElement('style');
        style.id = 'araya-widget-styles';
        style.textContent = `
            /* ====== TOP BAND - 7 Domains Navigation ====== */
            .araya-top-band {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 50px;
                background: linear-gradient(180deg, #1a1a2e 0%, #16162a 100%);
                border-bottom: 2px solid #333;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0;
                z-index: 10000;
                font-family: 'Segoe UI', system-ui, sans-serif;
            }

            .araya-domain-tab {
                flex: 1;
                max-width: 120px;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 2px;
                cursor: pointer;
                border: none;
                background: transparent;
                color: #666;
                font-size: 10px;
                font-weight: 600;
                text-transform: uppercase;
                transition: all 0.2s;
                border-right: 1px solid #333;
                text-decoration: none;
            }

            .araya-domain-tab:last-child {
                border-right: none;
            }

            .araya-domain-tab:hover {
                background: rgba(255,255,255,0.05);
                color: #fff;
            }

            .araya-domain-tab.active {
                background: rgba(255,255,255,0.1);
                color: var(--domain-color, #fff);
            }

            .araya-domain-tab .icon {
                font-size: 18px;
            }

            .araya-domain-tab .label {
                font-size: 9px;
                letter-spacing: 0.5px;
            }

            /* ====== BOTTOM BAND - ARAYA Edit Interface ====== */
            .araya-bottom-band {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                height: 60px;
                background: linear-gradient(0deg, #0a0a12 0%, #12121a 100%);
                border-top: 2px solid #333;
                display: flex;
                align-items: center;
                padding: 0 15px;
                gap: 10px;
                z-index: 10000;
                font-family: 'Segoe UI', system-ui, sans-serif;
            }

            .araya-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: linear-gradient(135deg, #00d4ff 0%, #a855f7 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                flex-shrink: 0;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
            }

            .araya-avatar:hover {
                transform: scale(1.1);
                box-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
            }

            .araya-input-container {
                flex: 1;
                position: relative;
            }

            .araya-input {
                width: 100%;
                padding: 12px 15px;
                padding-right: 80px;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 25px;
                color: #fff;
                font-size: 14px;
                outline: none;
                transition: all 0.2s;
            }

            .araya-input:focus {
                background: rgba(255,255,255,0.1);
                border-color: #00d4ff;
                box-shadow: 0 0 10px rgba(0, 212, 255, 0.2);
            }

            .araya-input::placeholder {
                color: #666;
            }

            .araya-send-btn {
                position: absolute;
                right: 5px;
                top: 50%;
                transform: translateY(-50%);
                padding: 8px 15px;
                background: linear-gradient(135deg, #00d4ff 0%, #a855f7 100%);
                border: none;
                border-radius: 20px;
                color: #fff;
                font-size: 12px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s;
            }

            .araya-send-btn:hover {
                transform: translateY(-50%) scale(1.05);
                box-shadow: 0 4px 15px rgba(0, 212, 255, 0.4);
            }

            .araya-quick-actions {
                display: flex;
                gap: 8px;
                flex-shrink: 0;
            }

            .araya-quick-btn {
                padding: 8px 12px;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 8px;
                color: #888;
                font-size: 11px;
                cursor: pointer;
                transition: all 0.2s;
                white-space: nowrap;
            }

            .araya-quick-btn:hover {
                background: rgba(0, 212, 255, 0.2);
                border-color: #00d4ff;
                color: #00d4ff;
            }

            /* ====== RESPONSE POPUP ====== */
            .araya-response-popup {
                position: fixed;
                bottom: 70px;
                left: 50%;
                transform: translateX(-50%);
                max-width: 500px;
                width: 90%;
                background: #1a1a2e;
                border: 1px solid #00d4ff;
                border-radius: 12px;
                padding: 15px;
                z-index: 10001;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                display: none;
            }

            .araya-response-popup.visible {
                display: block;
                animation: slideUp 0.3s ease;
            }

            @keyframes slideUp {
                from { opacity: 0; transform: translateX(-50%) translateY(20px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }

            .araya-response-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }

            .araya-response-title {
                color: #00d4ff;
                font-weight: bold;
                font-size: 12px;
            }

            .araya-response-close {
                background: none;
                border: none;
                color: #666;
                font-size: 18px;
                cursor: pointer;
            }

            .araya-response-content {
                color: #ccc;
                font-size: 14px;
                line-height: 1.5;
                max-height: 200px;
                overflow-y: auto;
            }

            .araya-response-loading {
                display: flex;
                align-items: center;
                gap: 10px;
                color: #666;
            }

            .araya-spinner {
                width: 20px;
                height: 20px;
                border: 2px solid #333;
                border-top-color: #00d4ff;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            /* ====== BODY PADDING ====== */
            body.araya-widget-active {
                padding-top: 50px !important;
                padding-bottom: 60px !important;
            }

            /* ====== MOBILE RESPONSIVE ====== */
            @media (max-width: 600px) {
                .araya-domain-tab .label {
                    display: none;
                }

                .araya-domain-tab {
                    max-width: none;
                }

                .araya-domain-tab .icon {
                    font-size: 22px;
                }

                .araya-quick-actions {
                    display: none;
                }

                .araya-bottom-band {
                    padding: 0 10px;
                }
            }

            /* ====== TIER 2 MODE INDICATOR ====== */
            .araya-tier-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #a855f7;
                color: #fff;
                font-size: 8px;
                padding: 2px 5px;
                border-radius: 3px;
                font-weight: bold;
            }
        `;
        document.head.appendChild(style);
    }

    // Detect current domain from page URL
    function detectCurrentDomain() {
        const path = window.location.pathname.toLowerCase();
        const hash = window.location.hash.replace('#', '').toLowerCase();

        // Check hash first
        for (const domain of DOMAINS) {
            if (hash === domain.name.toLowerCase()) {
                return domain.name;
            }
        }

        // Check path for domain keywords
        for (const domain of DOMAINS) {
            if (path.includes(domain.name.toLowerCase())) {
                return domain.name;
            }
        }

        // Default based on page patterns
        if (path.includes('commander') || path.includes('command')) return 'COMMAND';
        if (path.includes('builder') || path.includes('build')) return 'BUILD';
        if (path.includes('team') || path.includes('connect')) return 'CONNECT';
        if (path.includes('legal') || path.includes('protect')) return 'PROTECT';
        if (path.includes('growth') || path.includes('money') || path.includes('finance')) return 'GROW';
        if (path.includes('brain') || path.includes('learn')) return 'LEARN';
        if (path.includes('consciousness') || path.includes('transcend')) return 'TRANSCEND';

        return 'COMMAND'; // Default
    }

    // Create top navigation band
    function createTopBand() {
        const currentDomain = detectCurrentDomain();

        const topBand = document.createElement('nav');
        topBand.className = 'araya-top-band';
        topBand.id = 'araya-top-band';

        DOMAINS.forEach(domain => {
            const tab = document.createElement('a');
            tab.className = 'araya-domain-tab';
            tab.href = DOMAIN_PAGES[domain.name];
            tab.style.setProperty('--domain-color', domain.color);

            if (domain.name === currentDomain) {
                tab.classList.add('active');
            }

            tab.innerHTML = `
                <span class="icon">${domain.icon}</span>
                <span class="label">${domain.name}</span>
            `;

            // Keyboard shortcut hint
            tab.title = `${domain.name} (Press ${domain.key})`;

            topBand.appendChild(tab);
        });

        document.body.prepend(topBand);

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            const domain = DOMAINS.find(d => d.key === e.key);
            if (domain) {
                window.location.href = DOMAIN_PAGES[domain.name];
            }
        });
    }

    // Create bottom ARAYA edit band
    function createBottomBand() {
        const bottomBand = document.createElement('div');
        bottomBand.className = 'araya-bottom-band';
        bottomBand.id = 'araya-bottom-band';

        bottomBand.innerHTML = `
            <div class="araya-avatar" onclick="ArayaWidget.openFullChat()" title="Open full ARAYA chat">
                🤖
                <span class="araya-tier-badge">T2</span>
            </div>
            <div class="araya-input-container">
                <input type="text" class="araya-input" id="araya-widget-input"
                       placeholder="Ask ARAYA to edit this page... (Tier 2 Mode)"
                       autocomplete="off">
                <button class="araya-send-btn" onclick="ArayaWidget.send()">SEND</button>
            </div>
            <div class="araya-quick-actions">
                <button class="araya-quick-btn" onclick="ArayaWidget.quickAction('refresh')">↻ Refresh</button>
                <button class="araya-quick-btn" onclick="ArayaWidget.quickAction('bug')">🐛 Bug</button>
                <button class="araya-quick-btn" onclick="ArayaWidget.quickAction('help')">? Help</button>
            </div>
        `;

        document.body.appendChild(bottomBand);

        // Create response popup
        const popup = document.createElement('div');
        popup.className = 'araya-response-popup';
        popup.id = 'araya-response-popup';
        popup.innerHTML = `
            <div class="araya-response-header">
                <span class="araya-response-title">🤖 ARAYA (Tier 2)</span>
                <button class="araya-response-close" onclick="ArayaWidget.closePopup()">×</button>
            </div>
            <div class="araya-response-content" id="araya-response-content">
                <!-- Response appears here -->
            </div>
        `;
        document.body.appendChild(popup);

        // Enter key handler
        document.getElementById('araya-widget-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                ArayaWidget.send();
            }
        });
    }

    // Widget API
    window.ArayaWidget = {
        version: ARAYA_WIDGET_VERSION,

        // Send message to ARAYA
        async send() {
            const input = document.getElementById('araya-widget-input');
            const message = input.value.trim();
            if (!message) return;

            const popup = document.getElementById('araya-response-popup');
            const content = document.getElementById('araya-response-content');

            // Show loading
            popup.classList.add('visible');
            content.innerHTML = `
                <div class="araya-response-loading">
                    <div class="araya-spinner"></div>
                    <span>ARAYA is thinking...</span>
                </div>
            `;

            try {
                // Get current page context
                const pageContext = {
                    url: window.location.href,
                    title: document.title,
                    domain: detectCurrentDomain()
                };

                // Call ARAYA API (Tier 2 = simplified edit mode)
                const response = await fetch('/.netlify/functions/araya-chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: `[TIER 2 EDIT MODE] Page: ${pageContext.title}\n\n${message}`,
                        mode: 'tier2_edit',
                        context: pageContext
                    })
                });

                const data = await response.json();

                if (data.reply) {
                    content.innerHTML = data.reply;
                } else if (data.response) {
                    content.innerHTML = data.response;
                } else {
                    content.innerHTML = 'ARAYA received your request. Check the page for changes.';
                }

                input.value = '';

            } catch (error) {
                console.error('ARAYA Widget error:', error);
                content.innerHTML = `<span style="color:#ff4444">Connection error. Try again.</span>`;
            }
        },

        // Quick action buttons
        quickAction(action) {
            const input = document.getElementById('araya-widget-input');

            switch(action) {
                case 'refresh':
                    window.location.reload();
                    break;
                case 'bug':
                    input.value = 'Report bug on this page: ';
                    input.focus();
                    break;
                case 'help':
                    const popup = document.getElementById('araya-response-popup');
                    const content = document.getElementById('araya-response-content');
                    popup.classList.add('visible');
                    content.innerHTML = `
                        <strong>ARAYA Tier 2 Mode</strong><br><br>
                        Quick commands:<br>
                        • "Update [item] to [value]"<br>
                        • "Add [new item] to this page"<br>
                        • "Change color of [element]"<br>
                        • "Report bug: [description]"<br><br>
                        <em>For full conversation, click the 🤖 avatar.</em>
                    `;
                    break;
            }
        },

        // Open full ARAYA chat
        openFullChat() {
            window.open('/araya-chat.html', '_blank');
        },

        // Close response popup
        closePopup() {
            document.getElementById('araya-response-popup').classList.remove('visible');
        },

        // Hide widget (for pages that don't need it)
        hide() {
            document.getElementById('araya-top-band')?.remove();
            document.getElementById('araya-bottom-band')?.remove();
            document.getElementById('araya-response-popup')?.remove();
            document.body.classList.remove('araya-widget-active');
        },

        // Show widget
        show() {
            if (!document.getElementById('araya-top-band')) {
                createTopBand();
            }
            if (!document.getElementById('araya-bottom-band')) {
                createBottomBand();
            }
            document.body.classList.add('araya-widget-active');
        }
    };

    // Initialize on DOM ready
    function init() {
        // Skip if inside iframe
        if (window !== window.top) {
            console.log('ARAYA Widget: Skipping (inside iframe)');
            return;
        }

        // Skip specific pages
        const skipPages = ['araya-chat.html', 'login.html', 'signup.html'];
        if (skipPages.some(page => window.location.pathname.includes(page))) {
            console.log('ARAYA Widget: Skipping (excluded page)');
            return;
        }

        injectStyles();
        createTopBand();
        createBottomBand();
        document.body.classList.add('araya-widget-active');

        console.log(`🤖 ARAYA Dashboard Widget v${ARAYA_WIDGET_VERSION} loaded (Tier 2 Mode)`);
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
