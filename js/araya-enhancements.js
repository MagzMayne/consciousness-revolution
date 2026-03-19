// RootIB: RB-20260319142113-7ECF1501
/**
 * ARAYA ENHANCEMENTS CLIENT SDK
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Copyright © 2024-2026 Consciousness Revolution / Overkill Kulture LLC
 * All Rights Reserved. PROPRIETARY AND CONFIDENTIAL.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Capabilities:
 *   1. Grok API — enhanced AI responses via xAI Grok
 *   2. User API keys — bring your own key for any supported provider
 *   3. Real-time page editing — live CSS/attribute edits with session tracking
 *   4. Layout persistence — save & auto-restore custom layouts
 *   5. Reasoning protocol — ingest behavior for AI optimization
 *   6. Multi-theme selection — switch themes per-page or globally
 *
 * Usage (include in any HTML page):
 *   <script src="/js/araya-enhancements.js"></script>
 *   <script>
 *     // Auto-initialises; reads userId from araya_session cookie or generates one
 *     ArayaEnhancements.init();
 *   </script>
 */

(function (global) {
    'use strict';

    // ─── Configuration ──────────────────────────────────────────────────────
    const API = {
        grokToken:    '/api/grok-token',
        chat:         '/api/araya-chat',
        realtimeEdit: '/api/araya-realtime-edit',
        layout:       '/api/araya-layout',
        optimize:     '/api/araya-optimize',
        themes:       '/api/araya-themes'
    };

    // ─── Internal state (memory only — nothing sensitive in localStorage) ───
    const _state = {
        userId:      null,
        sessionId:   null,
        grokToken:   null,       // server-side key; loaded once per session
        userApiKey:  null,       // user-supplied key (NOT persisted to localStorage)
        userProvider: null,
        activeTheme: 'sacred',
        initialized: false
    };

    // ─── Utility ─────────────────────────────────────────────────────────────

    function _uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    function _getUserId() {
        // Try session cookie first, then sessionStorage, then generate
        const cookieMatch = document.cookie.match(/araya_session=([^;]+)/);
        if (cookieMatch) return cookieMatch[1].split('.')[0]; // JWT subject
        const stored = sessionStorage.getItem('araya_uid');
        if (stored) return stored;
        const newId = _uuid();
        sessionStorage.setItem('araya_uid', newId);
        return newId;
    }

    async function _post(url, body) {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        return res.json();
    }

    async function _get(url) {
        const res = await fetch(url);
        return res.json();
    }

    // ─── 1. Grok API Key ─────────────────────────────────────────────────────

    async function loadGrokToken() {
        try {
            const data = await _get(API.grokToken);
            if (data.auth) {
                _state.grokToken = data.token;
                console.log('[ArayaEnhancements] Grok API key loaded from server');
            } else {
                console.info('[ArayaEnhancements] Grok not configured on server:', data.message);
            }
        } catch (e) {
            console.warn('[ArayaEnhancements] Could not load Grok token:', e.message);
        }
    }

    /**
     * Set a user-supplied API key.
     * The key is kept in memory only — never stored in localStorage.
     * @param {string} apiKey
     * @param {string} provider  'grok' | 'groq' | 'openai'
     */
    function setUserApiKey(apiKey, provider = 'grok') {
        _state.userApiKey = apiKey;
        _state.userProvider = provider;
        console.log(`[ArayaEnhancements] User-supplied ${provider} key accepted (in memory)`);
    }

    function clearUserApiKey() {
        _state.userApiKey = null;
        _state.userProvider = null;
    }

    // ─── 2. Real-time page editing ────────────────────────────────────────────

    /**
     * Apply a CSS property edit to an element selector on the current page.
     * @param {string} selector  CSS selector, e.g. 'body', '.header', '#hero'
     * @param {string} property  CSS property, e.g. 'background-color'
     * @param {string} value     CSS value, e.g. '#ff0090'
     */
    async function editElement(selector, property, value) {
        // Sanitize selector and property to prevent attribute-selector injection
        const safeKey = (selector + '-' + property).replace(/["\\]/g, '_');
        // Apply immediately in-browser
        const style = document.createElement('style');
        style.setAttribute('data-araya-edit', safeKey);
        // Remove previous edit for same selector+property
        document.querySelectorAll(`[data-araya-edit="${CSS.escape(safeKey)}"]`).forEach(el => el.remove());
        style.textContent = `${selector} { ${property}: ${value} !important; }`;
        document.head.appendChild(style);

        // Persist + deploy via API
        try {
            const result = await _post(API.realtimeEdit, {
                action: 'edit',
                sessionId: _state.sessionId,
                page: window.location.pathname,
                selector,
                property,
                value,
                userId: _state.userId
            });
            console.log('[ArayaEnhancements] Edit persisted:', result);
            return result;
        } catch (e) {
            console.warn('[ArayaEnhancements] Edit API unavailable, applied locally only:', e.message);
            return { success: false, local: true };
        }
    }

    // ─── 3. Layout persistence ────────────────────────────────────────────────

    /**
     * Save current layout state for this page.
     * @param {object} layout  Serialisable layout/orientation data
     */
    async function saveLayout(layout) {
        return _post(API.layout, {
            action: 'save',
            userId: _state.userId,
            page: window.location.pathname,
            layout
        });
    }

    /**
     * Restore the saved layout for this page (if one exists).
     * Returns the layout data or null.
     */
    async function restoreLayout() {
        try {
            const data = await _post(API.layout, {
                action: 'get',
                userId: _state.userId,
                page: window.location.pathname
            });
            if (data.found) {
                console.log('[ArayaEnhancements] Layout restored for', window.location.pathname);
                return data.layout;
            }
        } catch (e) {
            console.warn('[ArayaEnhancements] Layout restore failed:', e.message);
        }
        return null;
    }

    // ─── 4. Behavior ingest (feeds reasoning protocol) ────────────────────────

    /**
     * Log a user behavior event to the optimization protocol.
     * @param {string} eventType  e.g. 'scroll', 'click', 'theme_change', 'edit'
     * @param {object} data       Arbitrary context data
     */
    async function logBehavior(eventType, data = {}) {
        try {
            await _post(API.optimize, {
                action: 'ingest',
                event: eventType,
                page: window.location.pathname,
                userId: _state.userId,
                data
            });
        } catch { /* non-critical — silently ignore */ }
    }

    // ─── 5. Multi-theme selection ─────────────────────────────────────────────

    const _themeStyleId = 'araya-active-theme';

    /**
     * Apply theme CSS variables to the document.
     * @param {object} themeData  Theme object from /api/araya-themes
     */
    function _applyThemeVariables(themeData) {
        if (!themeData?.variables) return;
        let styleEl = document.getElementById(_themeStyleId);
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = _themeStyleId;
            document.head.appendChild(styleEl);
        }
        const css = `:root {\n${Object.entries(themeData.variables).map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}`;
        styleEl.textContent = css;
        document.documentElement.setAttribute('data-araya-theme', themeData.id);
    }

    /**
     * Switch to a named theme.
     * @param {string} themeId  e.g. 'sacred', 'dark', 'neon', 'cosmic'
     * @param {boolean} saveGlobally  If true, save as global default for this user
     */
    async function setTheme(themeId, saveGlobally = false) {
        try {
            const action = saveGlobally ? 'save_global' : 'save';
            const body = saveGlobally
                ? { action, userId: _state.userId, theme: themeId }
                : { action, userId: _state.userId, page: window.location.pathname, theme: themeId };

            const result = await _post(API.themes, body);

            if (result.themeData || result.theme) {
                const themeData = result.themeData || result.theme;
                const previousTheme = _state.activeTheme;
                _applyThemeVariables(themeData);
                _state.activeTheme = themeId;
                logBehavior('theme_change', { from: previousTheme, to: themeId });
                console.log(`[ArayaEnhancements] Theme set to: ${themeId}`);
            }

            return result;
        } catch (e) {
            console.warn('[ArayaEnhancements] Theme API unavailable:', e.message);
            return { success: false };
        }
    }

    /**
     * Fetch and apply the user's saved theme for this page (or their global default).
     */
    async function restoreTheme() {
        try {
            const data = await _post(API.themes, {
                action: 'get',
                userId: _state.userId,
                page: window.location.pathname
            });
            if (data.themeData) {
                _applyThemeVariables(data.themeData);
                _state.activeTheme = data.theme;
                console.log(`[ArayaEnhancements] Theme restored: ${data.theme} (${data.source})`);
            }
        } catch (e) {
            console.warn('[ArayaEnhancements] Theme restore failed:', e.message);
        }
    }

    /**
     * Get popular themes for the current page.
     * @param {number} limit  Max themes to return
     */
    async function getPopularThemes(limit = 5) {
        try {
            const data = await _post(API.themes, {
                action: 'popular',
                page: window.location.pathname,
                limit
            });
            return data.popular || [];
        } catch { return []; }
    }

    /**
     * Get all available themes.
     */
    async function listThemes() {
        try {
            const data = await _get(API.themes + '?action=list');
            return data.themes || [];
        } catch { return []; }
    }

    // ─── 6. Theme picker UI (optional, inject into page) ────────────────────

    /**
     * Inject a floating theme picker widget into the page.
     * Users can switch themes without writing any code.
     */
    async function injectThemePicker() {
        if (document.getElementById('araya-theme-picker')) return; // already injected

        const themes = await listThemes();
        if (!themes.length) return;

        const picker = document.createElement('div');
        picker.id = 'araya-theme-picker';
        picker.setAttribute('role', 'navigation');
        picker.setAttribute('aria-label', 'ARAYA Theme Picker');
        picker.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            background: var(--bg-card, rgba(10,10,30,0.95));
            border: 1px solid var(--border, rgba(199,21,133,0.3));
            border-radius: 12px;
            padding: 12px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            min-width: 160px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.4);
        `;

        const title = document.createElement('div');
        title.textContent = '🎨 ARAYA Theme';
        title.style.cssText = 'color: var(--primary, #C71585); font-weight: bold; margin-bottom: 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;';
        picker.appendChild(title);

        themes.forEach(t => {
            const btn = document.createElement('button');
            btn.textContent = t.name;
            btn.title = t.description;
            btn.setAttribute('aria-label', `Switch to ${t.name} theme`);
            btn.style.cssText = `
                display: block; width: 100%; text-align: left;
                background: none; border: none; border-radius: 6px;
                color: var(--text, #e0e0e0); cursor: pointer;
                padding: 5px 8px; font-size: 12px; font-family: inherit;
                transition: background 0.15s;
            `;
            btn.addEventListener('mouseover', () => { btn.style.background = 'var(--bg, rgba(199,21,133,0.15))'; });
            btn.addEventListener('mouseout', () => { btn.style.background = 'none'; });
            btn.addEventListener('click', () => {
                setTheme(t.id, false);
                // Highlight active
                picker.querySelectorAll('button').forEach(b => b.style.fontWeight = 'normal');
                btn.style.fontWeight = 'bold';
            });
            picker.appendChild(btn);
        });

        // Global save button
        const saveGlobal = document.createElement('button');
        saveGlobal.textContent = '💾 Save as default';
        saveGlobal.setAttribute('aria-label', 'Save current theme as global default');
        saveGlobal.style.cssText = `
            display: block; width: 100%; text-align: center;
            margin-top: 8px; padding: 5px 8px; border-radius: 6px;
            background: var(--primary, #C71585); color: #fff;
            border: none; cursor: pointer; font-size: 11px; font-family: inherit;
        `;
        saveGlobal.addEventListener('click', () => setTheme(_state.activeTheme, true));
        picker.appendChild(saveGlobal);

        document.body.appendChild(picker);
    }

    // ─── Initialisation ──────────────────────────────────────────────────────

    async function init(options = {}) {
        if (_state.initialized) return;
        _state.initialized = true;

        _state.userId = _getUserId();
        _state.sessionId = _uuid();

        console.log('[ArayaEnhancements] Initialising for user', _state.userId, 'session', _state.sessionId);

        // Load Grok server token
        await loadGrokToken();

        // Restore saved theme
        await restoreTheme();

        // Restore layout
        if (options.autoRestoreLayout !== false) {
            const layout = await restoreLayout();
            if (layout && options.onLayoutRestored) {
                options.onLayoutRestored(layout);
            }
        }

        // Inject theme picker if requested
        if (options.themePicker) {
            await injectThemePicker();
        }

        // Log page view behavior
        logBehavior('page_view', {
            referrer: document.referrer,
            viewport: `${window.innerWidth}x${window.innerHeight}`
        });
    }

    // ─── Public API ──────────────────────────────────────────────────────────

    global.ArayaEnhancements = {
        init,
        // Grok / API keys
        loadGrokToken,
        setUserApiKey,
        clearUserApiKey,
        // Real-time editing
        editElement,
        // Layouts
        saveLayout,
        restoreLayout,
        // Reasoning/optimization
        logBehavior,
        // Themes
        setTheme,
        restoreTheme,
        getPopularThemes,
        listThemes,
        injectThemePicker,
        // State (read-only)
        get userId() { return _state.userId; },
        get sessionId() { return _state.sessionId; },
        get activeTheme() { return _state.activeTheme; },
        get hasGrok() { return Boolean(_state.grokToken || _state.userApiKey); }
    };

})(typeof window !== 'undefined' ? window : global);
