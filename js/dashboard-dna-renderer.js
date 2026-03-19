// RootIB: RB-20260319142113-35622BB5
/**
 * DASHBOARD DNA RENDERER - Client-side Customization Engine
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Copyright © 2024-2026 Consciousness Revolution / Overkill Kulture LLC
 * Pattern: 3 → 7 → 13 → ∞ | LFSME
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Purpose: Load user's dashboard config from Supabase and apply customizations
 * Include this script in any dashboard to enable personalization
 *
 * Usage:
 * <script src="/js/dashboard-dna-renderer.js"></script>
 * <script>
 *   DashboardDNA.init({
 *     userId: 'user-123',           // From auth or localStorage
 *     dashboard: 'COMMANDER_DOMAIN_1',
 *     onLoad: (config) => console.log('Config loaded:', config)
 *   });
 * </script>
 */

(function(global) {
    'use strict';

    const DashboardDNA = {
        config: null,
        userId: null,
        dashboard: null,
        isLoaded: false,
        editMode: false,

        // ═══════════════════════════════════════════════════════════════
        // INITIALIZATION
        // ═══════════════════════════════════════════════════════════════

        async init(options = {}) {
            this.userId = options.userId || this.getUserId();
            this.dashboard = options.dashboard || this.detectDashboard();
            this.onLoad = options.onLoad || (() => {});
            this.onError = options.onError || console.error;

            console.log(`🧬 DashboardDNA: Initializing for ${this.dashboard} (user: ${this.userId})`);

            try {
                await this.loadConfig();
                this.applyConfig();
                this.setupEditListener();
                this.isLoaded = true;
                this.onLoad(this.config);
            } catch (error) {
                console.error('🧬 DashboardDNA: Init failed:', error);
                this.onError(error);
            }
        },

        // Get user ID from various sources
        getUserId() {
            // Check localStorage for logged-in user
            const stored = localStorage.getItem('consciousness_user_id') ||
                          localStorage.getItem('user_id') ||
                          sessionStorage.getItem('user_id');
            if (stored) return stored;

            // Check URL params
            const params = new URLSearchParams(window.location.search);
            if (params.get('user_id')) return params.get('user_id');

            // Generate anonymous ID
            let anonId = localStorage.getItem('anon_dashboard_id');
            if (!anonId) {
                anonId = 'anon_' + Math.random().toString(36).substring(2, 15);
                localStorage.setItem('anon_dashboard_id', anonId);
            }
            return anonId;
        },

        // Detect dashboard from page name or DNA
        detectDashboard() {
            // Try to get from embedded DNA
            const dnaScript = document.getElementById('dashboard-dna');
            if (dnaScript) {
                try {
                    const dna = JSON.parse(dnaScript.textContent);
                    return dna.name || dna.dashboard || dna.domain;
                } catch (e) {}
            }

            // Fall back to page path
            const path = window.location.pathname;
            const filename = path.split('/').pop().replace('.html', '');
            return filename || 'unknown';
        },

        // ═══════════════════════════════════════════════════════════════
        // CONFIG LOADING
        // ═══════════════════════════════════════════════════════════════

        async loadConfig() {
            const url = `/.netlify/functions/dashboard-config?action=get&user_id=${encodeURIComponent(this.userId)}&dashboard=${encodeURIComponent(this.dashboard)}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load config: ${response.status}`);
            }

            const data = await response.json();
            this.config = data.config;
            this.isDefault = data.is_default;

            console.log(`🧬 DashboardDNA: Loaded config (default: ${this.isDefault})`);
            return this.config;
        },

        // ═══════════════════════════════════════════════════════════════
        // CONFIG APPLICATION - The magic happens here
        // ═══════════════════════════════════════════════════════════════

        applyConfig() {
            if (!this.config) return;

            // Apply colors via CSS variables
            this.applyColors(this.config.colors);

            // Apply text overrides
            this.applyText(this.config.text);

            // Apply layout settings
            this.applyLayout(this.config.layout);

            // Apply feature toggles
            this.applyFeatures(this.config.features);

            // Apply branding
            this.applyBranding(this.config.branding);

            // Apply custom CSS last
            if (this.config.features?.customCSS) {
                this.injectCustomCSS(this.config.features.customCSS);
            }

            console.log('🧬 DashboardDNA: Config applied');
        },

        applyColors(colors) {
            if (!colors) return;

            const root = document.documentElement;

            // Map config colors to CSS variables
            const colorMap = {
                header: ['--header-color', '--header-bg', '--domain-color'],
                accent: ['--accent-color', '--accent', '--neon-green'],
                background: ['--bg-color', '--background', '--dark-bg'],
                text: ['--text-color', '--text-primary'],
                cardBg: ['--card-bg', '--panel-bg']
            };

            for (const [key, cssVars] of Object.entries(colorMap)) {
                if (colors[key]) {
                    cssVars.forEach(cssVar => {
                        root.style.setProperty(cssVar, colors[key]);
                    });
                }
            }

            // Direct element styling for headers
            if (colors.header) {
                const headers = document.querySelectorAll('.header h1, .header-title, h1');
                headers.forEach(el => {
                    if (el.closest('.header') || el.classList.contains('header-title')) {
                        el.style.background = `linear-gradient(90deg, ${colors.header}, ${this.lightenColor(colors.header, 20)})`;
                        el.style.webkitBackgroundClip = 'text';
                        el.style.webkitTextFillColor = 'transparent';
                    }
                });

                // Update domain badge
                const badges = document.querySelectorAll('.domain-badge');
                badges.forEach(badge => {
                    badge.style.background = `linear-gradient(135deg, ${colors.header}, ${this.darkenColor(colors.header, 20)})`;
                });
            }
        },

        applyText(text) {
            if (!text) return;

            if (text.headerText) {
                const headers = document.querySelectorAll('.header h1, .header-title');
                headers.forEach(el => el.textContent = text.headerText);
            }

            if (text.welcomeMessage) {
                const welcome = document.querySelector('.welcome-message, .intro-text');
                if (welcome) welcome.textContent = text.welcomeMessage;
            }

            if (text.footerText) {
                const footer = document.querySelector('footer, .footer');
                if (footer) footer.textContent = text.footerText;
            }
        },

        applyLayout(layout) {
            if (!layout) return;

            const body = document.body;

            if (layout.compactMode) {
                body.classList.add('compact-mode');
            }

            if (layout.sidebarPosition === 'right') {
                body.classList.add('sidebar-right');
            }

            if (layout.showDomainNav === false) {
                const nav = document.querySelector('.nav-domains-container, .domain-nav');
                if (nav) nav.style.display = 'none';
            }

            if (layout.showViewSlider === false) {
                const slider = document.querySelector('.view-slider-container');
                if (slider) slider.style.display = 'none';
            }
        },

        applyFeatures(features) {
            if (!features) return;

            // Hide specific sections
            if (features.hiddenSections?.length) {
                features.hiddenSections.forEach(selector => {
                    const el = document.querySelector(selector);
                    if (el) el.style.display = 'none';
                });
            }

            // Widget toggles could be implemented here
        },

        applyBranding(branding) {
            if (!branding) return;

            if (branding.logoUrl) {
                const logos = document.querySelectorAll('.logo, .brand-logo');
                logos.forEach(logo => {
                    if (logo.tagName === 'IMG') {
                        logo.src = branding.logoUrl;
                    } else {
                        logo.style.backgroundImage = `url(${branding.logoUrl})`;
                    }
                });
            }

            if (branding.companyName) {
                const companyEls = document.querySelectorAll('.company-name, .brand-name');
                companyEls.forEach(el => el.textContent = branding.companyName);
            }

            if (branding.faviconUrl) {
                let link = document.querySelector("link[rel*='icon']");
                if (!link) {
                    link = document.createElement('link');
                    link.rel = 'icon';
                    document.head.appendChild(link);
                }
                link.href = branding.faviconUrl;
            }
        },

        injectCustomCSS(css) {
            const style = document.createElement('style');
            style.id = 'dashboard-dna-custom-css';
            style.textContent = css;
            document.head.appendChild(style);
        },

        // ═══════════════════════════════════════════════════════════════
        // EDIT MODE - Live editing via Araya
        // ═══════════════════════════════════════════════════════════════

        setupEditListener() {
            // Listen for edit commands from Araya
            window.addEventListener('dashboard-dna-edit', async (event) => {
                const { property, value } = event.detail;
                await this.applyEdit(property, value);
            });

            // Listen for Araya messages that might be edits
            window.addEventListener('araya-response', (event) => {
                if (event.detail?.edit) {
                    this.applyEdit(event.detail.edit.property, event.detail.edit.value);
                }
            });
        },

        async applyEdit(property, value) {
            console.log(`🧬 DashboardDNA: Applying edit - ${property} = ${value}`);

            // Save to backend
            const response = await fetch('/.netlify/functions/dashboard-config?action=set', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: this.userId,
                    dashboard: this.dashboard,
                    property,
                    value
                })
            });

            if (response.ok) {
                // Reload and reapply
                await this.loadConfig();
                this.applyConfig();

                // Visual feedback
                this.showEditFeedback(`Updated ${property} to ${value}`);
            }
        },

        showEditFeedback(message) {
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #00ff88, #00cc6a);
                color: #000;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: bold;
                z-index: 10000;
                animation: slideIn 0.3s ease;
            `;
            toast.textContent = '🧬 ' + message;
            document.body.appendChild(toast);

            setTimeout(() => toast.remove(), 3000);
        },

        // ═══════════════════════════════════════════════════════════════
        // UTILITY FUNCTIONS
        // ═══════════════════════════════════════════════════════════════

        lightenColor(hex, percent) {
            const num = parseInt(hex.replace('#', ''), 16);
            const amt = Math.round(2.55 * percent);
            const R = Math.min(255, (num >> 16) + amt);
            const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
            const B = Math.min(255, (num & 0x0000FF) + amt);
            return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
        },

        darkenColor(hex, percent) {
            const num = parseInt(hex.replace('#', ''), 16);
            const amt = Math.round(2.55 * percent);
            const R = Math.max(0, (num >> 16) - amt);
            const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
            const B = Math.max(0, (num & 0x0000FF) - amt);
            return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
        },

        // Public API for Araya to call
        setProperty(property, value) {
            return this.applyEdit(property, value);
        },

        getConfig() {
            return this.config;
        },

        reset() {
            return fetch('/.netlify/functions/dashboard-config?action=reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: this.userId,
                    dashboard: this.dashboard
                })
            }).then(() => {
                location.reload();
            });
        }
    };

    // Export globally
    global.DashboardDNA = DashboardDNA;

    // Auto-init if data attribute present
    document.addEventListener('DOMContentLoaded', () => {
        const autoInit = document.querySelector('[data-dashboard-dna]');
        if (autoInit) {
            DashboardDNA.init({
                dashboard: autoInit.dataset.dashboardDna
            });
        }
    });

    console.log('🧬 Dashboard DNA Renderer loaded - Ready for customization');

})(typeof window !== 'undefined' ? window : this);
