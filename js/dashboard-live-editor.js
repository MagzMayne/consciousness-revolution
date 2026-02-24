/**
 * DASHBOARD LIVE EDITOR - Real-time customization system
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Include this script in any dashboard to enable:
 * 1. Real-time customizations from Supabase
 * 2. Self-edit mode (instant changes, no approval)
 * 3. ARAYA edit integration
 *
 * Usage: <script src="/js/dashboard-live-editor.js"></script>
 *
 * Pattern: 3 → 7 → 13 → ∞ | LFSME
 */

(function() {
    'use strict';

    const SUPABASE_URL = 'https://lgibyvqynhshkcdmglbe.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnaWJ5dnF5bmhzaGtjZG1nbGJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwMjg5MTcsImV4cCI6MjA0OTYwNDkxN30.LGT_BBIA1AqFDhgB4QQB5dB_hYs7lhPPjm4_EJJmCl0';

    // Get dashboard ID from DNA or URL
    function getDashboardId() {
        // Try to get from DNA block
        const dnaEl = document.getElementById('dashboard-dna');
        if (dnaEl) {
            try {
                const dna = JSON.parse(dnaEl.textContent);
                return dna.name || dna.dashboard_id;
            } catch (e) {}
        }
        // Fallback to filename
        const path = window.location.pathname;
        return path.split('/').pop().replace('.html', '');
    }

    // Get current user from localStorage or session
    function getCurrentUser() {
        try {
            const session = localStorage.getItem('sb-lgibyvqynhshkcdmglbe-auth-token');
            if (session) {
                const parsed = JSON.parse(session);
                return {
                    id: parsed.user?.id,
                    name: parsed.user?.user_metadata?.name || parsed.user?.email?.split('@')[0] || 'Anonymous'
                };
            }
        } catch (e) {}
        return { id: null, name: 'Anonymous' };
    }

    // Load customizations from Supabase
    async function loadCustomizations(dashboardId, userId) {
        try {
            const url = `${SUPABASE_URL}/rest/v1/dashboard_customizations?dashboard_id=eq.${encodeURIComponent(dashboardId)}&is_active=eq.true&select=*`;

            const response = await fetch(url, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            });

            if (!response.ok) return null;

            const data = await response.json();

            // Find user's customization or return first (for shared dashboards)
            if (userId) {
                return data.find(c => c.owner_id === userId) || data[0];
            }
            return data[0];

        } catch (error) {
            console.log('[LiveEditor] Could not load customizations:', error.message);
            return null;
        }
    }

    // Apply customizations to the page
    function applyCustomizations(customizations) {
        if (!customizations) return;

        console.log('[LiveEditor] Applying customizations:', customizations.id);

        // 1. Apply custom CSS
        if (customizations.custom_css) {
            const style = document.createElement('style');
            style.id = 'dashboard-custom-css';
            style.textContent = customizations.custom_css;
            document.head.appendChild(style);
        }

        // 2. Apply theme overrides
        if (customizations.theme_overrides) {
            const theme = customizations.theme_overrides;
            const root = document.documentElement;

            if (theme.primaryColor) root.style.setProperty('--accent-gold', theme.primaryColor);
            if (theme.backgroundColor) root.style.setProperty('--bg-primary', theme.backgroundColor);
            if (theme.textColor) root.style.setProperty('--text-primary', theme.textColor);
            if (theme.fontFamily) root.style.setProperty('--font-family', theme.fontFamily);
        }

        // 3. Apply HTML inserts
        if (customizations.custom_html_inserts && Array.isArray(customizations.custom_html_inserts)) {
            customizations.custom_html_inserts.forEach(insert => {
                const target = document.querySelector(insert.selector);
                if (target) {
                    if (insert.position === 'replace') {
                        target.innerHTML = insert.html;
                    } else if (insert.position === 'before') {
                        target.insertAdjacentHTML('beforebegin', insert.html);
                    } else if (insert.position === 'after') {
                        target.insertAdjacentHTML('afterend', insert.html);
                    } else if (insert.position === 'prepend') {
                        target.insertAdjacentHTML('afterbegin', insert.html);
                    } else {
                        target.insertAdjacentHTML('beforeend', insert.html);
                    }
                }
            });
        }

        // 4. Apply widget overrides
        if (customizations.widget_overrides && window.DashboardWidgets) {
            window.DashboardWidgets.applyOverrides(customizations.widget_overrides);
        }

        // 5. Apply layout config
        if (customizations.layout_config) {
            const layout = customizations.layout_config;

            // Collapse sections
            if (layout.collapsedSections) {
                layout.collapsedSections.forEach(selector => {
                    const el = document.querySelector(selector);
                    if (el) el.style.display = 'none';
                });
            }

            // Reorder elements
            if (layout.elementOrder) {
                // TODO: Implement grid reordering
            }
        }

        // 6. Custom JavaScript (executed in try-catch for safety)
        if (customizations.custom_js) {
            try {
                const fn = new Function(customizations.custom_js);
                fn();
            } catch (e) {
                console.error('[LiveEditor] Custom JS error:', e);
            }
        }

        // Mark as customized
        document.body.dataset.customized = 'true';
    }

    // Save customization to Supabase
    async function saveCustomization(dashboardId, userId, userName, updates) {
        try {
            // Check if customization exists
            const checkUrl = `${SUPABASE_URL}/rest/v1/dashboard_customizations?dashboard_id=eq.${encodeURIComponent(dashboardId)}&owner_id=eq.${userId}&select=id`;
            const checkResponse = await fetch(checkUrl, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            });
            const existing = await checkResponse.json();

            const payload = {
                dashboard_id: dashboardId,
                owner_id: userId,
                owner_name: userName,
                updated_at: new Date().toISOString(),
                ...updates
            };

            let response;
            if (existing && existing.length > 0) {
                // Update existing
                response = await fetch(`${SUPABASE_URL}/rest/v1/dashboard_customizations?id=eq.${existing[0].id}`, {
                    method: 'PATCH',
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(payload)
                });
            } else {
                // Insert new
                payload.created_at = new Date().toISOString();
                response = await fetch(`${SUPABASE_URL}/rest/v1/dashboard_customizations`, {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(payload)
                });
            }

            return response.ok;

        } catch (error) {
            console.error('[LiveEditor] Save error:', error);
            return false;
        }
    }

    // Edit Mode UI
    function enableEditMode() {
        if (document.getElementById('live-editor-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'live-editor-panel';
        panel.innerHTML = `
            <style>
                #live-editor-panel {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 350px;
                    background: #1a1a25;
                    border: 1px solid #333;
                    border-radius: 12px;
                    padding: 15px;
                    z-index: 10000;
                    font-family: 'Inter', sans-serif;
                    color: #fff;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                }
                #live-editor-panel h3 {
                    margin: 0 0 15px 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                #live-editor-panel .close-btn {
                    background: none;
                    border: none;
                    color: #888;
                    cursor: pointer;
                    font-size: 1.2rem;
                }
                #live-editor-panel textarea {
                    width: 100%;
                    background: #0a0a0f;
                    border: 1px solid #333;
                    color: #fff;
                    padding: 10px;
                    border-radius: 8px;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 12px;
                    resize: vertical;
                    margin-bottom: 10px;
                }
                #live-editor-panel label {
                    display: block;
                    margin-bottom: 5px;
                    color: #888;
                    font-size: 12px;
                }
                #live-editor-panel button {
                    background: linear-gradient(135deg, #ffd700, #ffaa00);
                    color: #000;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    width: 100%;
                    margin-top: 10px;
                }
                #live-editor-panel button:hover {
                    transform: translateY(-2px);
                }
                #live-editor-panel .status {
                    text-align: center;
                    padding: 10px;
                    margin-top: 10px;
                    border-radius: 8px;
                    display: none;
                }
                #live-editor-panel .status.success {
                    display: block;
                    background: rgba(0,255,136,0.2);
                    color: #00ff88;
                }
                #live-editor-panel .status.error {
                    display: block;
                    background: rgba(255,68,68,0.2);
                    color: #ff4444;
                }
                #live-editor-panel .tabs {
                    display: flex;
                    gap: 5px;
                    margin-bottom: 15px;
                }
                #live-editor-panel .tab {
                    flex: 1;
                    padding: 8px;
                    background: #0a0a0f;
                    border: 1px solid #333;
                    color: #888;
                    border-radius: 6px;
                    cursor: pointer;
                    text-align: center;
                    font-size: 12px;
                }
                #live-editor-panel .tab.active {
                    background: #333;
                    color: #ffd700;
                    border-color: #ffd700;
                }
                #live-editor-panel .tab-content {
                    display: none;
                }
                #live-editor-panel .tab-content.active {
                    display: block;
                }
            </style>
            <h3>
                <span>⚡ Live Editor</span>
                <button class="close-btn" onclick="window.DashboardLiveEditor.disableEditMode()">×</button>
            </h3>
            <div class="tabs">
                <div class="tab active" data-tab="css">CSS</div>
                <div class="tab" data-tab="js">JS</div>
                <div class="tab" data-tab="theme">Theme</div>
            </div>
            <div class="tab-content active" data-content="css">
                <label>Custom CSS (instant preview)</label>
                <textarea id="editor-css" rows="8" placeholder="/* Your custom styles */\n.my-class { color: gold; }"></textarea>
            </div>
            <div class="tab-content" data-content="js">
                <label>Custom JavaScript</label>
                <textarea id="editor-js" rows="8" placeholder="// Your custom code\nconsole.log('Hello!');"></textarea>
            </div>
            <div class="tab-content" data-content="theme">
                <label>Primary Color</label>
                <input type="color" id="theme-primary" value="#ffd700" style="width:100%;height:40px;margin-bottom:10px;">
                <label>Background Color</label>
                <input type="color" id="theme-bg" value="#0a0a0f" style="width:100%;height:40px;">
            </div>
            <button onclick="window.DashboardLiveEditor.saveEdits()">💾 Save Changes (Instant)</button>
            <div class="status" id="editor-status"></div>
        `;
        document.body.appendChild(panel);

        // Tab switching
        panel.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                panel.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                panel.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                panel.querySelector(`[data-content="${tab.dataset.tab}"]`).classList.add('active');
            });
        });

        // Live CSS preview
        const cssEditor = document.getElementById('editor-css');
        cssEditor.addEventListener('input', () => {
            let previewStyle = document.getElementById('editor-preview-css');
            if (!previewStyle) {
                previewStyle = document.createElement('style');
                previewStyle.id = 'editor-preview-css';
                document.head.appendChild(previewStyle);
            }
            previewStyle.textContent = cssEditor.value;
        });

        // Live theme preview
        document.getElementById('theme-primary').addEventListener('input', (e) => {
            document.documentElement.style.setProperty('--accent-gold', e.target.value);
        });
        document.getElementById('theme-bg').addEventListener('input', (e) => {
            document.documentElement.style.setProperty('--bg-primary', e.target.value);
        });
    }

    function disableEditMode() {
        const panel = document.getElementById('live-editor-panel');
        if (panel) panel.remove();
    }

    async function saveEdits() {
        const dashboardId = getDashboardId();
        const user = getCurrentUser();

        if (!user.id) {
            showStatus('Please log in to save customizations', true);
            return;
        }

        const updates = {
            custom_css: document.getElementById('editor-css')?.value || null,
            custom_js: document.getElementById('editor-js')?.value || null,
            theme_overrides: {
                primaryColor: document.getElementById('theme-primary')?.value,
                backgroundColor: document.getElementById('theme-bg')?.value
            }
        };

        showStatus('Saving...', false);
        const success = await saveCustomization(dashboardId, user.id, user.name, updates);

        if (success) {
            showStatus('✓ Saved! Changes are live.', false);
        } else {
            showStatus('Failed to save. Try again.', true);
        }
    }

    function showStatus(message, isError) {
        const status = document.getElementById('editor-status');
        if (status) {
            status.textContent = message;
            status.className = 'status ' + (isError ? 'error' : 'success');
        }
    }

    // Initialize on page load
    async function init() {
        const dashboardId = getDashboardId();
        const user = getCurrentUser();

        console.log('[LiveEditor] Initializing for:', dashboardId);

        // Load and apply customizations
        const customizations = await loadCustomizations(dashboardId, user.id);
        if (customizations) {
            applyCustomizations(customizations);
        }

        // Add keyboard shortcut to open editor (Ctrl+Shift+E)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'E') {
                e.preventDefault();
                enableEditMode();
            }
        });
    }

    // Expose API
    window.DashboardLiveEditor = {
        init,
        getDashboardId,
        getCurrentUser,
        loadCustomizations,
        applyCustomizations,
        saveCustomization,
        enableEditMode,
        disableEditMode,
        saveEdits
    };

    // Auto-initialize when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
