/**
 * ARAYA EDITOR BRIDGE - Injectable Dashboard Editor
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Copyright © 2024-2026 Consciousness Revolution / Overkill Kulture LLC
 * Pattern: 3 → 7 → 13 → ∞ | LFSME
 *
 * Purpose: Makes ANY dashboard ARAYA-editable by injecting editor API
 * Usage: Add <script src="/araya-editor-bridge.js"></script> to dashboard
 */

(function() {
    'use strict';

    // Prevent double-injection
    if (window.ARAYA_EDITOR) {
        console.log('[ARAYA-EDITOR] Already loaded');
        return;
    }

    console.log('[ARAYA-EDITOR] Initializing dashboard editor bridge...');

    // ═══════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════

    const CONFIG = {
        apiBase: 'https://consciousnessrevolution.io/.netlify/functions',
        dashboardId: extractDashboardId(),
        editorName: localStorage.getItem('araya_editor_name') || 'Operator',
        editorEmail: localStorage.getItem('araya_editor_email') || null,
        autoSave: true,
        localStorageKey: 'araya_dashboard_edits'
    };

    // ═══════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════

    window.ARAYA_EDITOR = {
        version: '1.0.0',
        config: CONFIG,

        // Edit element content
        edit: async function(selector, newContent) {
            const element = document.querySelector(selector);
            if (!element) {
                console.warn(`[ARAYA-EDITOR] Selector not found: ${selector}`);
                return { success: false, error: 'Selector not found' };
            }

            // Apply edit locally (instant feedback)
            const oldContent = element.textContent;
            element.textContent = newContent;

            // Log to console
            console.log(`[ARAYA-EDITOR] Edit: ${selector}`, { oldContent, newContent });

            // Send to API
            try {
                const result = await this.sendEdit({
                    action: 'edit',
                    selector,
                    oldContent,
                    newContent
                });

                if (!result.success) {
                    // Rollback if API fails
                    element.textContent = oldContent;
                }

                return result;
            } catch (error) {
                // Rollback on error
                element.textContent = oldContent;
                console.error('[ARAYA-EDITOR] Edit failed:', error);
                return { success: false, error: error.message };
            }
        },

        // Navigate to another page
        navigate: function(page) {
            const url = page.startsWith('/') ? page : `/${page}`;
            console.log(`[ARAYA-EDITOR] Navigate: ${url}`);
            window.location.href = url;
        },

        // Change theme
        theme: async function(themeName) {
            console.log(`[ARAYA-EDITOR] Theme change: ${themeName}`);

            const result = await this.sendEdit({
                action: 'theme',
                theme: themeName
            });

            if (result.success && result.themeVars) {
                // Apply theme variables
                Object.entries(result.themeVars).forEach(([key, value]) => {
                    document.documentElement.style.setProperty(key, value);
                });
            }

            return result;
        },

        // Add widget
        addWidget: async function(widgetType) {
            console.log(`[ARAYA-EDITOR] Add widget: ${widgetType}`);

            const result = await this.sendEdit({
                action: 'widget',
                subaction: 'add',
                target: widgetType
            });

            if (result.success) {
                // Reload page to show new widget
                setTimeout(() => window.location.reload(), 1000);
            }

            return result;
        },

        // Remove widget
        removeWidget: async function(widgetId) {
            console.log(`[ARAYA-EDITOR] Remove widget: ${widgetId}`);

            const result = await this.sendEdit({
                action: 'widget',
                subaction: 'remove',
                target: widgetId
            });

            if (result.success) {
                // Remove element from DOM
                const element = document.getElementById(widgetId);
                if (element) element.remove();
            }

            return result;
        },

        // Send edit to API
        sendEdit: async function(editData) {
            const payload = {
                command: buildCommand(editData),
                dashboard_id: CONFIG.dashboardId,
                editor_name: CONFIG.editorName,
                editor_email: CONFIG.editorEmail
            };

            try {
                const response = await fetch(`${CONFIG.apiBase}/araya-dashboard-edit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                // Store edit in localStorage for offline persistence
                if (CONFIG.autoSave && result.success) {
                    saveEditLocally(editData);
                }

                // Dispatch event for listeners
                window.dispatchEvent(new CustomEvent('araya-edit', {
                    detail: { editData, result }
                }));

                return result;

            } catch (error) {
                console.error('[ARAYA-EDITOR] API error:', error);

                // Fallback: save locally
                if (CONFIG.autoSave) {
                    saveEditLocally(editData);
                    return {
                        success: true,
                        mode: 'local-only',
                        message: 'Edit saved locally (API unavailable)'
                    };
                }

                return { success: false, error: error.message };
            }
        },

        // Get edit history
        getHistory: function() {
            const history = localStorage.getItem(CONFIG.localStorageKey);
            return history ? JSON.parse(history) : [];
        },

        // Clear edit history
        clearHistory: function() {
            localStorage.removeItem(CONFIG.localStorageKey);
            console.log('[ARAYA-EDITOR] History cleared');
        },

        // Set editor identity
        setIdentity: function(name, email) {
            CONFIG.editorName = name;
            CONFIG.editorEmail = email;
            localStorage.setItem('araya_editor_name', name);
            localStorage.setItem('araya_editor_email', email);
            console.log('[ARAYA-EDITOR] Identity set:', { name, email });
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════

    function extractDashboardId() {
        // Try to get from DNA
        const dnaEl = document.querySelector('#dashboard-dna');
        if (dnaEl) {
            try {
                const dna = JSON.parse(dnaEl.textContent);
                if (dna.name) return dna.name;
            } catch (e) {
                // Ignore
            }
        }

        // Fallback: use page title or URL
        const title = document.title.replace(/[^a-zA-Z0-9_]/g, '_');
        const path = window.location.pathname.replace(/\.html$/, '').replace(/\//g, '_');
        return title || path || 'UNKNOWN_DASHBOARD';
    }

    function buildCommand(editData) {
        const { action, selector, content, theme, subaction, target } = editData;

        if (action === 'edit') {
            return `/edit ${selector} ${content}`;
        }
        if (action === 'navigate') {
            return `/navigate ${editData.page}`;
        }
        if (action === 'theme') {
            return `/theme ${theme}`;
        }
        if (action === 'widget') {
            return `/widget ${subaction} ${target}`;
        }

        return '';
    }

    function saveEditLocally(editData) {
        const history = window.ARAYA_EDITOR.getHistory();
        history.push({
            ...editData,
            timestamp: new Date().toISOString(),
            dashboard_id: CONFIG.dashboardId
        });

        // Keep last 50 edits
        const recent = history.slice(-50);
        localStorage.setItem(CONFIG.localStorageKey, JSON.stringify(recent));
    }

    // ═══════════════════════════════════════════════════════════════
    // AUTO-APPLY STORED EDITS
    // ═══════════════════════════════════════════════════════════════

    function applyStoredEdits() {
        const history = window.ARAYA_EDITOR.getHistory();
        const dashboardEdits = history.filter(e => e.dashboard_id === CONFIG.dashboardId);

        console.log(`[ARAYA-EDITOR] Applying ${dashboardEdits.length} stored edits...`);

        dashboardEdits.forEach(edit => {
            if (edit.action === 'edit' && edit.selector && edit.newContent) {
                const element = document.querySelector(edit.selector);
                if (element) {
                    element.textContent = edit.newContent;
                    console.log(`[ARAYA-EDITOR] Applied: ${edit.selector}`);
                }
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // VISUAL INDICATOR
    // ═══════════════════════════════════════════════════════════════

    function showIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'araya-editor-indicator';
        indicator.innerHTML = `
            <div style="
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(0, 255, 100, 0.1);
                border: 1px solid rgba(0, 255, 100, 0.3);
                border-radius: 8px;
                padding: 8px 12px;
                font-size: 0.75rem;
                font-family: monospace;
                color: #0f0;
                z-index: 999999;
                backdrop-filter: blur(10px);
                cursor: pointer;
            " onclick="console.log(window.ARAYA_EDITOR.getHistory())">
                ⚡ ARAYA EDITOR ACTIVE
            </div>
        `;
        document.body.appendChild(indicator);

        // Auto-hide after 3 seconds
        setTimeout(() => {
            indicator.style.opacity = '0.3';
            indicator.style.transition = 'opacity 0.3s';
        }, 3000);
    }

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════

    // Apply stored edits on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyStoredEdits);
    } else {
        applyStoredEdits();
    }

    // Show indicator
    showIndicator();

    console.log('[ARAYA-EDITOR] Bridge loaded successfully', CONFIG);

    // Expose to global for debugging
    window._arayaEditorDebug = {
        config: CONFIG,
        history: window.ARAYA_EDITOR.getHistory(),
        test: async () => {
            console.log('Testing ARAYA_EDITOR.edit()...');
            return await window.ARAYA_EDITOR.edit('h1', 'ARAYA WAS HERE');
        }
    };

})();
