/**
 * DASHBOARD SELF-EDIT MODULE
 * ═══════════════════════════════════════════════════════════════════════════
 * Drop-in self-editing for any dashboard
 *
 * Usage: Add to any dashboard HTML:
 *   <script src="/js/dashboard-self-edit.js"></script>
 *   <script>DashboardEdit.init({ dashboardId: 'MY_DASHBOARD' });</script>
 *
 * Pattern: 3 → 7 → 13 → ∞ | LFSME
 * ═══════════════════════════════════════════════════════════════════════════
 */

const DashboardEdit = {
    config: {
        dashboardId: null,
        editorId: null,
        editorName: 'Anonymous',
        apiEndpoint: '/.netlify/functions/dashboard-edit'
    },

    // Initialize the self-edit system
    init(options = {}) {
        this.config = { ...this.config, ...options };

        // Auto-detect dashboard ID from filename if not provided
        if (!this.config.dashboardId) {
            const path = window.location.pathname;
            const filename = path.split('/').pop().replace('.html', '');
            this.config.dashboardId = filename || 'UNKNOWN_DASHBOARD';
        }

        // Try to get user info from localStorage
        const userData = JSON.parse(localStorage.getItem('consciousness_user') || '{}');
        if (userData.id) this.config.editorId = userData.id;
        if (userData.name) this.config.editorName = userData.name;
        if (userData.discord) this.config.editorName = userData.discord;

        this.injectUI();
        this.loadCustomizations();
        console.log(`[DashboardEdit] Initialized for ${this.config.dashboardId}`);
    },

    // Inject the edit button and panel
    injectUI() {
        // Edit button (bottom-right corner)
        const editBtn = document.createElement('button');
        editBtn.id = 'dashboard-edit-btn';
        editBtn.innerHTML = '✏️ Edit';
        editBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 99999;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 25px;
            cursor: pointer;
            font-family: system-ui, sans-serif;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            transition: all 0.3s ease;
        `;
        editBtn.onmouseover = () => editBtn.style.transform = 'scale(1.05)';
        editBtn.onmouseout = () => editBtn.style.transform = 'scale(1)';
        editBtn.onclick = () => this.togglePanel();
        document.body.appendChild(editBtn);

        // Edit panel (slides in from right)
        const panel = document.createElement('div');
        panel.id = 'dashboard-edit-panel';
        panel.style.cssText = `
            position: fixed;
            top: 0;
            right: -400px;
            width: 400px;
            height: 100vh;
            background: #1a1a2e;
            z-index: 99998;
            transition: right 0.3s ease;
            display: flex;
            flex-direction: column;
            font-family: system-ui, sans-serif;
            box-shadow: -5px 0 30px rgba(0,0,0,0.5);
        `;
        panel.innerHTML = `
            <div style="padding: 20px; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; color: #fff; font-size: 16px;">🎨 Edit Dashboard</h3>
                <button id="close-edit-panel" style="background: none; border: none; color: #888; font-size: 24px; cursor: pointer;">&times;</button>
            </div>
            <div style="padding: 15px; border-bottom: 1px solid #333;">
                <div style="color: #888; font-size: 12px; margin-bottom: 5px;">Dashboard ID</div>
                <div style="color: #fff; font-size: 14px;">${this.config.dashboardId}</div>
            </div>
            <div style="padding: 15px; flex: 1; overflow-y: auto;">
                <!-- Edit Type Tabs -->
                <div style="display: flex; gap: 5px; margin-bottom: 15px;">
                    <button class="edit-tab active" data-type="css" style="flex: 1; padding: 8px; background: #667eea; border: none; color: white; border-radius: 5px; cursor: pointer;">CSS</button>
                    <button class="edit-tab" data-type="js" style="flex: 1; padding: 8px; background: #333; border: none; color: #888; border-radius: 5px; cursor: pointer;">JS</button>
                    <button class="edit-tab" data-type="theme" style="flex: 1; padding: 8px; background: #333; border: none; color: #888; border-radius: 5px; cursor: pointer;">Theme</button>
                </div>

                <!-- Title -->
                <div style="margin-bottom: 15px;">
                    <label style="color: #888; font-size: 12px; display: block; margin-bottom: 5px;">Change Description</label>
                    <input type="text" id="edit-title" placeholder="What are you changing?" style="width: 100%; padding: 10px; background: #2a2a3e; border: 1px solid #444; border-radius: 5px; color: white; box-sizing: border-box;">
                </div>

                <!-- Code Editor -->
                <div style="margin-bottom: 15px;">
                    <label style="color: #888; font-size: 12px; display: block; margin-bottom: 5px;">Code</label>
                    <textarea id="edit-content" placeholder="/* Your CSS here */" style="width: 100%; height: 200px; padding: 10px; background: #2a2a3e; border: 1px solid #444; border-radius: 5px; color: #0f0; font-family: 'Monaco', 'Consolas', monospace; font-size: 13px; resize: vertical; box-sizing: border-box;"></textarea>
                </div>

                <!-- Quick Theme Presets -->
                <div id="theme-presets" style="display: none; margin-bottom: 15px;">
                    <label style="color: #888; font-size: 12px; display: block; margin-bottom: 8px;">Quick Presets</label>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                        <button class="theme-preset" data-theme="dark" style="padding: 10px; background: #1a1a2e; border: 1px solid #444; color: white; border-radius: 5px; cursor: pointer;">🌙 Dark</button>
                        <button class="theme-preset" data-theme="light" style="padding: 10px; background: #f0f0f0; border: 1px solid #ddd; color: #333; border-radius: 5px; cursor: pointer;">☀️ Light</button>
                        <button class="theme-preset" data-theme="cyber" style="padding: 10px; background: #0a0a1a; border: 1px solid #0ff; color: #0ff; border-radius: 5px; cursor: pointer;">💠 Cyber</button>
                        <button class="theme-preset" data-theme="nature" style="padding: 10px; background: #1a2f1a; border: 1px solid #4a4; color: #8f8; border-radius: 5px; cursor: pointer;">🌿 Nature</button>
                    </div>
                </div>

                <!-- Preview Toggle -->
                <div style="margin-bottom: 15px;">
                    <label style="display: flex; align-items: center; gap: 10px; color: #888; font-size: 13px; cursor: pointer;">
                        <input type="checkbox" id="live-preview" checked style="width: 18px; height: 18px;">
                        Live Preview
                    </label>
                </div>
            </div>
            <div style="padding: 15px; border-top: 1px solid #333; display: flex; gap: 10px;">
                <button id="apply-edit" style="flex: 1; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; color: white; border-radius: 5px; cursor: pointer; font-weight: 600;">Apply Changes</button>
                <button id="reset-edit" style="padding: 12px 20px; background: #333; border: none; color: #888; border-radius: 5px; cursor: pointer;">Reset</button>
            </div>
            <div id="edit-status" style="padding: 10px 15px; font-size: 12px; color: #888; text-align: center;"></div>
        `;
        document.body.appendChild(panel);

        // Wire up panel events
        document.getElementById('close-edit-panel').onclick = () => this.togglePanel();
        document.getElementById('apply-edit').onclick = () => this.applyEdit();
        document.getElementById('reset-edit').onclick = () => this.resetEdit();

        // Tab switching
        panel.querySelectorAll('.edit-tab').forEach(tab => {
            tab.onclick = () => this.switchTab(tab.dataset.type);
        });

        // Theme presets
        panel.querySelectorAll('.theme-preset').forEach(btn => {
            btn.onclick = () => this.applyThemePreset(btn.dataset.theme);
        });

        // Live preview
        document.getElementById('edit-content').oninput = () => {
            if (document.getElementById('live-preview').checked) {
                this.previewEdit();
            }
        };
    },

    // Toggle panel visibility
    togglePanel() {
        const panel = document.getElementById('dashboard-edit-panel');
        const isOpen = panel.style.right === '0px';
        panel.style.right = isOpen ? '-400px' : '0px';
    },

    // Switch between edit tabs
    switchTab(type) {
        const tabs = document.querySelectorAll('.edit-tab');
        tabs.forEach(t => {
            t.style.background = t.dataset.type === type ? '#667eea' : '#333';
            t.style.color = t.dataset.type === type ? 'white' : '#888';
            t.classList.toggle('active', t.dataset.type === type);
        });

        const content = document.getElementById('edit-content');
        const themePresets = document.getElementById('theme-presets');

        if (type === 'css') {
            content.placeholder = '/* Your CSS here */\nbody { background: #1a1a2e; }';
            themePresets.style.display = 'none';
        } else if (type === 'js') {
            content.placeholder = '// Your JavaScript here\nconsole.log("Dashboard enhanced!");';
            themePresets.style.display = 'none';
        } else if (type === 'theme') {
            content.placeholder = '// Theme JSON\n{\n  "primaryColor": "#667eea",\n  "backgroundColor": "#1a1a2e"\n}';
            themePresets.style.display = 'block';
        }
    },

    // Apply theme preset
    applyThemePreset(theme) {
        const themes = {
            dark: { primaryColor: '#667eea', backgroundColor: '#1a1a2e', textColor: '#ffffff' },
            light: { primaryColor: '#4a90d9', backgroundColor: '#f5f5f5', textColor: '#333333' },
            cyber: { primaryColor: '#00ffff', backgroundColor: '#0a0a1a', textColor: '#00ff00' },
            nature: { primaryColor: '#4caf50', backgroundColor: '#1a2f1a', textColor: '#a5d6a7' }
        };
        document.getElementById('edit-content').value = JSON.stringify(themes[theme], null, 2);
        document.getElementById('edit-title').value = `Apply ${theme} theme`;
        this.previewEdit();
    },

    // Preview edit without saving
    previewEdit() {
        const type = document.querySelector('.edit-tab.active').dataset.type;
        const content = document.getElementById('edit-content').value;

        if (type === 'css') {
            let previewStyle = document.getElementById('preview-style');
            if (!previewStyle) {
                previewStyle = document.createElement('style');
                previewStyle.id = 'preview-style';
                document.head.appendChild(previewStyle);
            }
            previewStyle.textContent = content;
        } else if (type === 'theme') {
            try {
                const theme = JSON.parse(content);
                let previewStyle = document.getElementById('preview-style');
                if (!previewStyle) {
                    previewStyle = document.createElement('style');
                    previewStyle.id = 'preview-style';
                    document.head.appendChild(previewStyle);
                }
                previewStyle.textContent = `
                    :root {
                        --primary-color: ${theme.primaryColor || '#667eea'};
                        --bg-color: ${theme.backgroundColor || '#1a1a2e'};
                        --text-color: ${theme.textColor || '#ffffff'};
                    }
                    body { background: var(--bg-color) !important; color: var(--text-color) !important; }
                `;
            } catch (e) {
                // Invalid JSON, ignore
            }
        }
    },

    // Reset preview
    resetEdit() {
        const previewStyle = document.getElementById('preview-style');
        if (previewStyle) previewStyle.remove();
        document.getElementById('edit-content').value = '';
        document.getElementById('edit-title').value = '';
        this.setStatus('Reset complete', 'info');
    },

    // Apply edit (save to backend)
    async applyEdit() {
        const type = document.querySelector('.edit-tab.active').dataset.type;
        const content = document.getElementById('edit-content').value;
        const title = document.getElementById('edit-title').value;

        if (!content.trim()) {
            this.setStatus('Please enter some content', 'error');
            return;
        }

        this.setStatus('Saving...', 'info');

        try {
            // Check for Commander bypass (localStorage flag or URL parameter)
            const isCommander = localStorage.getItem('araya_commander') === 'true' ||
                new URLSearchParams(window.location.search).get('commander') === 'Kill50780630';

            const response = await fetch(this.config.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dashboard_id: this.config.dashboardId,
                    editor_id: this.config.editorId,
                    editor_name: isCommander ? 'Commander' : this.config.editorName,
                    editor_type: 'operator',
                    edit_type: type,
                    content: type === 'theme' ? JSON.parse(content) : content,
                    title: title || `${type.toUpperCase()} edit`,
                    commander_bypass: isCommander
                })
            });

            const result = await response.json();

            if (result.success) {
                this.setStatus(`✅ ${result.message}`, 'success');
                // Store locally for persistence
                this.saveLocalCustomization(type, content);
            } else {
                this.setStatus(`❌ ${result.error || 'Save failed'}`, 'error');
            }
        } catch (error) {
            this.setStatus(`❌ ${error.message}`, 'error');
        }
    },

    // Load saved customizations
    async loadCustomizations() {
        // First load from localStorage for instant display
        const local = JSON.parse(localStorage.getItem(`dashboard_custom_${this.config.dashboardId}`) || '{}');
        if (local.css) this.applyCSS(local.css);
        if (local.js) this.applyJS(local.js);

        // Then try to load from backend
        try {
            const response = await fetch(`${this.config.apiEndpoint}?dashboard_id=${this.config.dashboardId}`);
            const data = await response.json();

            if (data.customizations && data.customizations.length > 0) {
                data.customizations.forEach(c => {
                    if (c.custom_css) this.applyCSS(c.custom_css);
                    if (c.custom_js) this.applyJS(c.custom_js);
                    if (c.theme_overrides) this.applyTheme(c.theme_overrides);
                });
            }
        } catch (e) {
            console.log('[DashboardEdit] Could not load remote customizations:', e.message);
        }
    },

    // Apply CSS customization
    applyCSS(css) {
        let style = document.getElementById('custom-dashboard-css');
        if (!style) {
            style = document.createElement('style');
            style.id = 'custom-dashboard-css';
            document.head.appendChild(style);
        }
        style.textContent = css;
    },

    // Apply JS customization
    applyJS(js) {
        try {
            eval(js);
        } catch (e) {
            console.error('[DashboardEdit] JS error:', e);
        }
    },

    // Apply theme customization
    applyTheme(theme) {
        const css = `
            :root {
                --primary-color: ${theme.primaryColor || '#667eea'};
                --bg-color: ${theme.backgroundColor || '#1a1a2e'};
                --text-color: ${theme.textColor || '#ffffff'};
            }
        `;
        this.applyCSS(css);
    },

    // Save to localStorage
    saveLocalCustomization(type, content) {
        const key = `dashboard_custom_${this.config.dashboardId}`;
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        data[type] = content;
        localStorage.setItem(key, JSON.stringify(data));
    },

    // Set status message
    setStatus(message, type = 'info') {
        const status = document.getElementById('edit-status');
        status.textContent = message;
        status.style.color = type === 'error' ? '#ff6b6b' : type === 'success' ? '#6bff6b' : '#888';
    }
};

// Auto-init if data attribute present
document.addEventListener('DOMContentLoaded', () => {
    const autoInit = document.querySelector('[data-dashboard-edit]');
    if (autoInit) {
        DashboardEdit.init({
            dashboardId: autoInit.dataset.dashboardEdit
        });
    }
});
