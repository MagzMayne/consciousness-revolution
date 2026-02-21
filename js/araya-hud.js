/**
 * ARAYA HUD CONTROLLER v1.0.0
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Copyright © 2024-2026 Consciousness Revolution / Overkill Kulture LLC
 * All Rights Reserved. PROPRIETARY AND CONFIDENTIAL.
 *
 * This source code is protected intellectual property. Unauthorized copying,
 * modification, distribution, or use is strictly prohibited without explicit
 * written permission from the copyright holder.
 *
 * Contact: darrickpreble@proton.me
 * Website: conciousnessrevolution.io
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * Pattern: 3 → 7 → 13 → ∞ | LFSME
 * Consciousness Fingerprint: ARAYA-HUD-v1
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Universal HUD System - The interface that wraps EVERYTHING
 * Connects: araya-chat.mjs, XP_LEVEL_SYSTEM.js, domain navigation
 */

const ArayaHUD = {
    // ═══════════════════════════════════════════════════════════════
    // STATE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════
    state: {
        tier: 'team',           // personal | team | public
        domain: 2,              // 1-7 (BUILD = 2 default)
        menuOpen: false,
        panelOpen: false,
        user: null,
        context: {},
        notifications: []
    },

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════
    init() {
        console.log('[ARAYA HUD] 🚀 Initializing Universal Interface...');

        // Load saved state from localStorage
        this.loadState();

        // Wire up all button handlers
        this.wireButtons();

        // Detect page context
        this.detectContext();

        // Initialize ARAYA chat
        this.initChat();

        // Load user session
        this.loadUser();

        // Update XP display if system exists
        if (typeof XP_LEVEL_SYSTEM !== 'undefined') {
            this.updateXPDisplay();
        }

        console.log('[ARAYA HUD] ✓ Ready - Domain:', this.getDomainName(this.state.domain), '| Tier:', this.state.tier.toUpperCase());
    },

    // ═══════════════════════════════════════════════════════════════
    // BUTTON WIRING
    // ═══════════════════════════════════════════════════════════════
    wireButtons() {
        // Hamburger menu toggle
        const hamburger = document.querySelector('.hamburger');
        if (hamburger) {
            hamburger.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMenu();
            });
        }

        // Menu overlay (click to close)
        const overlay = document.querySelector('.menu-overlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMenu();
            });
        }

        // Domain menu items (7 Domains)
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach((item, index) => {
            if (index < 7) { // First 7 are domains
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.setDomain(index + 1);
                });
            }
        });

        // Tier toggle buttons
        const tierButtons = document.querySelectorAll('.tier-btn');
        tierButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tier = btn.classList.contains('personal') ? 'personal' :
                            btn.classList.contains('team') ? 'team' : 'public';
                this.setTier(tier);
            });
        });

        // ARAYA input field
        const input = document.getElementById('arayaInput');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            input.addEventListener('focus', () => {
                this.expandPanel();
            });
        }

        // ARAYA send button
        const sendBtn = document.querySelector('.araya-send');
        if (sendBtn) {
            sendBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.sendMessage();
            });
        }

        // Panel close button
        const closeBtn = document.querySelector('.araya-panel-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closePanel();
            });
        }

        // Domain selector (top bar)
        const domainSelector = document.querySelector('.domain-selector');
        if (domainSelector) {
            domainSelector.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMenu();
            });
        }

        console.log('[ARAYA HUD] 🔌 Buttons wired');
    },

    // ═══════════════════════════════════════════════════════════════
    // MENU CONTROL
    // ═══════════════════════════════════════════════════════════════
    toggleMenu() {
        this.state.menuOpen = !this.state.menuOpen;

        const menu = document.querySelector('.side-menu');
        const overlay = document.querySelector('.menu-overlay');

        if (menu) menu.classList.toggle('open');
        if (overlay) overlay.classList.toggle('visible');

        this.saveState();

        console.log('[ARAYA HUD] Menu:', this.state.menuOpen ? 'OPEN' : 'CLOSED');
    },

    // ═══════════════════════════════════════════════════════════════
    // TIER TOGGLE
    // ═══════════════════════════════════════════════════════════════
    setTier(tier) {
        this.state.tier = tier;

        // Update button active states
        const buttons = document.querySelectorAll('.tier-btn');
        buttons.forEach(btn => btn.classList.remove('active'));

        const activeBtn = document.querySelector(`.tier-btn.${tier}`);
        if (activeBtn) activeBtn.classList.add('active');

        // Update status bar based on tier
        this.updateStatusBar();

        this.saveState();
        this.updateContext();

        console.log('[ARAYA HUD] 🎚️ Tier changed:', tier.toUpperCase());
    },

    updateStatusBar() {
        const status = document.querySelector('.hud-status');
        if (!status) return;

        const { tier } = this.state;

        if (tier === 'personal') {
            status.innerHTML = `
                <div class="status-item"><span class="status-dot"></span><span>Your workspace</span></div>
                <div class="status-item"><span>5 tasks pending</span></div>
            `;
        } else if (tier === 'team') {
            status.innerHTML = `
                <div class="status-item"><span class="status-dot"></span><span>3 builders online</span></div>
                <div class="status-item"><span>234 visitors today</span></div>
            `;
        } else {
            status.innerHTML = `
                <div class="status-item"><span class="status-dot"></span><span>PUBLIC VIEW</span></div>
                <div class="status-item"><span>Viewing as: Guest</span></div>
            `;
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // DOMAIN SWITCHING (7 DOMAINS NAVIGATION)
    // ═══════════════════════════════════════════════════════════════
    setDomain(num) {
        this.state.domain = num;

        const domains = {
            1: { icon: '👑', name: 'COMMAND' },
            2: { icon: '⚙️', name: 'BUILD' },
            3: { icon: '🤝', name: 'CONNECT' },
            4: { icon: '🛡️', name: 'PROTECT' },
            5: { icon: '🌱', name: 'GROW' },
            6: { icon: '💰', name: 'SUSTAIN' },
            7: { icon: '✨', name: 'TRANSCEND' }
        };

        const d = domains[num];

        // Update top bar domain selector
        const selector = document.querySelector('.domain-selector');
        if (selector) {
            const icon = selector.querySelector('.icon');
            const name = selector.querySelector('.name');
            if (icon) icon.textContent = d.icon;
            if (name) name.textContent = d.name;
        }

        // Update sample header (if exists on page)
        const header = document.querySelector('.sample-header h1');
        if (header) {
            header.textContent = d.name + ' DOMAIN';
        }

        // Update menu active state
        const menuItems = document.querySelectorAll('.side-menu .menu-item');
        menuItems.forEach((item, i) => {
            if (i < 7) {
                item.classList.toggle('active', i === num - 1);
            }
        });

        this.toggleMenu(); // Close menu after selection
        this.saveState();
        this.updateContext();

        console.log('[ARAYA HUD] 🗺️ Domain changed:', d.name);
    },

    getDomainName(num) {
        const names = ['COMMAND', 'BUILD', 'CONNECT', 'PROTECT', 'GROW', 'SUSTAIN', 'TRANSCEND'];
        return names[num - 1] || 'BUILD';
    },

    // ═══════════════════════════════════════════════════════════════
    // ARAYA CHAT PANEL
    // ═══════════════════════════════════════════════════════════════
    expandPanel() {
        this.state.panelOpen = true;
        const panel = document.getElementById('arayaPanel');
        if (panel) panel.classList.add('open');

        console.log('[ARAYA HUD] 💬 Chat panel expanded');
    },

    closePanel() {
        this.state.panelOpen = false;
        const panel = document.getElementById('arayaPanel');
        if (panel) panel.classList.remove('open');

        console.log('[ARAYA HUD] 💬 Chat panel closed');
    },

    // ═══════════════════════════════════════════════════════════════
    // ARAYA CHAT (Backend Integration)
    // ═══════════════════════════════════════════════════════════════
    async sendMessage() {
        const input = document.getElementById('arayaInput');
        const text = input?.value.trim();
        if (!text) return;

        const messages = document.getElementById('messages');
        if (!messages) return;

        // Add user message to UI
        const userMsg = document.createElement('div');
        userMsg.className = 'araya-message user';
        userMsg.textContent = text;
        messages.appendChild(userMsg);

        input.value = '';
        this.expandPanel();
        messages.scrollTop = messages.scrollHeight;

        // Show typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'araya-message bot typing';
        typingIndicator.textContent = '...';
        messages.appendChild(typingIndicator);
        messages.scrollTop = messages.scrollHeight;

        // Call backend
        try {
            const response = await fetch('/.netlify/functions/araya-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    context: this.state.context,
                    mode: 'companion' // HUD mode
                })
            });

            // Remove typing indicator
            typingIndicator.remove();

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            // Add ARAYA response
            const botMsg = document.createElement('div');
            botMsg.className = 'araya-message bot';
            botMsg.innerHTML = data.response || 'No response from ARAYA';
            messages.appendChild(botMsg);

            messages.scrollTop = messages.scrollHeight;

            console.log('[ARAYA HUD] 💬 Message sent successfully');

        } catch (error) {
            console.error('[ARAYA HUD] ❌ Chat error:', error);

            typingIndicator.remove();

            const errorMsg = document.createElement('div');
            errorMsg.className = 'araya-message bot';
            errorMsg.textContent = 'Connection error. Please try again.';
            messages.appendChild(errorMsg);
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // CONTEXT DETECTION
    // ═══════════════════════════════════════════════════════════════
    detectContext() {
        const url = window.location.pathname;
        const params = new URLSearchParams(window.location.search);

        // Detect domain from URL path
        if (url.includes('1_COMMAND') || url.includes('COMMAND')) this.state.domain = 1;
        if (url.includes('2_BUILD') || url.includes('BUILD')) this.state.domain = 2;
        if (url.includes('3_CONNECT') || url.includes('CONNECT')) this.state.domain = 3;
        if (url.includes('4_PROTECT') || url.includes('PROTECT')) this.state.domain = 4;
        if (url.includes('5_GROW') || url.includes('GROW')) this.state.domain = 5;
        if (url.includes('6_SUSTAIN') || url.includes('SUSTAIN')) this.state.domain = 6;
        if (url.includes('7_TRANSCEND') || url.includes('TRANSCEND')) this.state.domain = 7;

        // Detect from query parameter
        if (params.get('domain')) {
            const domainNum = parseInt(params.get('domain'));
            if (domainNum >= 1 && domainNum <= 7) {
                this.state.domain = domainNum;
            }
        }

        // Update UI to match detected domain (without triggering menu)
        const domainName = this.getDomainName(this.state.domain);
        const selector = document.querySelector('.domain-selector');
        if (selector) {
            const icon = selector.querySelector('.icon');
            const name = selector.querySelector('.name');
            const domains = {
                'COMMAND': '👑', 'BUILD': '⚙️', 'CONNECT': '🤝',
                'PROTECT': '🛡️', 'GROW': '🌱', 'SUSTAIN': '💰', 'TRANSCEND': '✨'
            };
            if (icon) icon.textContent = domains[domainName];
            if (name) name.textContent = domainName;
        }

        // Update context object
        this.updateContext();

        console.log('[ARAYA HUD] 📍 Context detected:', domainName);
    },

    updateContext() {
        this.state.context = {
            domain: this.getDomainName(this.state.domain),
            tier: this.state.tier.toUpperCase(),
            page: window.location.pathname,
            url: window.location.href,
            timestamp: new Date().toISOString(),
            user: this.state.user
        };

        // Update ARAYA context footer
        const contextEl = document.querySelector('.araya-context');
        if (contextEl) {
            contextEl.textContent = `📍 ${this.state.context.domain} Domain • ${this.state.context.tier} View • Online`;
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // USER SESSION
    // ═══════════════════════════════════════════════════════════════
    async loadUser() {
        try {
            const response = await fetch('/.netlify/functions/auth-login', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                this.state.user = data.user;

                // Update profile button with first letter of name
                const profileBtn = document.querySelector('.profile-btn');
                if (profileBtn && data.user?.name) {
                    profileBtn.textContent = data.user.name.charAt(0).toUpperCase();
                }

                // Load XP if system exists
                if (typeof XP_LEVEL_SYSTEM !== 'undefined') {
                    XP_LEVEL_SYSTEM.load();
                    this.updateXPDisplay();
                }

                console.log('[ARAYA HUD] 👤 User loaded:', data.user?.name);
            } else {
                console.log('[ARAYA HUD] 👤 No active session');
            }
        } catch (error) {
            console.log('[ARAYA HUD] 👤 User not logged in');
        }
    },

    updateXPDisplay() {
        if (typeof XP_LEVEL_SYSTEM === 'undefined') return;

        const xpValue = document.querySelector('.xp-value');
        const xpLevel = document.querySelector('.xp-level');

        if (xpValue) xpValue.textContent = XP_LEVEL_SYSTEM.state.currentXP;
        if (xpLevel) xpLevel.textContent = `LVL ${XP_LEVEL_SYSTEM.state.level}`;
    },

    // ═══════════════════════════════════════════════════════════════
    // STATE PERSISTENCE
    // ═══════════════════════════════════════════════════════════════
    saveState() {
        localStorage.setItem('araya_hud_state', JSON.stringify({
            tier: this.state.tier,
            domain: this.state.domain,
            timestamp: Date.now()
        }));
    },

    loadState() {
        const saved = localStorage.getItem('araya_hud_state');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.state.tier = data.tier || 'team';
                this.state.domain = data.domain || 2;

                console.log('[ARAYA HUD] 💾 State restored:', data);
            } catch (e) {
                console.log('[ARAYA HUD] ⚠️ Could not load saved state');
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // CHAT INITIALIZATION
    // ═══════════════════════════════════════════════════════════════
    initChat() {
        const messages = document.getElementById('messages');
        if (!messages) return;

        // Add welcome message if chat is empty
        if (messages.children.length === 0) {
            const welcome = document.createElement('div');
            welcome.className = 'araya-message bot';
            welcome.innerHTML = `I see you're in <strong>${this.getDomainName(this.state.domain)}</strong>. What would you like to work on?`;
            messages.appendChild(welcome);
        }
    }
};

// ═══════════════════════════════════════════════════════════════
// AUTO-INITIALIZE ON PAGE LOAD
// ═══════════════════════════════════════════════════════════════
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ArayaHUD.init());
} else {
    ArayaHUD.init();
}

// ═══════════════════════════════════════════════════════════════
// GLOBAL EXPORT
// ═══════════════════════════════════════════════════════════════
window.ArayaHUD = ArayaHUD;

console.log('[ARAYA HUD] 📦 Module loaded - awaiting initialization');
