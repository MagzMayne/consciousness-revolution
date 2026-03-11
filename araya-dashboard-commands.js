/**
 * ARAYA DASHBOARD COMMANDS - Chat Integration
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Inject into araya-chat.html to enable dashboard editing commands
 * Pattern: 3 → 7 → 13 → ∞ | LFSME
 *
 * Add to araya-chat.html BEFORE closing </script> tag in main script block:
 * <script src="/araya-dashboard-commands.js"></script>
 */

(function() {
    'use strict';

    console.log('[ARAYA-DASH-CMD] Loading dashboard commands...');

    // ═══════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════

    const DASHBOARD_EDIT_API = 'https://consciousnessrevolution.io/.netlify/functions/araya-dashboard-edit';

    // Get current dashboard context (if embedded in a dashboard)
    function getCurrentDashboard() {
        // Check if we're in an iframe
        if (window.parent !== window) {
            try {
                const parentUrl = window.parent.location.pathname;
                return parentUrl.replace(/\.html$/, '').replace(/\//g, '_');
            } catch (e) {
                // Cross-origin, can't access parent
            }
        }

        // Check URL params
        const params = new URLSearchParams(window.location.search);
        if (params.get('dashboard')) {
            return params.get('dashboard');
        }

        return null;
    }

    // ═══════════════════════════════════════════════════════════════
    // COMMAND DETECTOR
    // ═══════════════════════════════════════════════════════════════

    window.detectDashboardCommand = function(msg) {
        const m = msg.trim();

        // /edit [selector] [content]
        if (m.startsWith('/edit ')) {
            const parts = m.slice(6).trim().split(/\s+/);
            const selector = parts[0];
            const content = parts.slice(1).join(' ');
            if (selector && content) {
                return { type: 'edit', selector, content };
            }
        }

        // /navigate [page]
        if (m.startsWith('/navigate ')) {
            const page = m.slice(10).trim();
            if (page) {
                return { type: 'navigate', page };
            }
        }

        // /theme [dark|light|forge]
        if (m.startsWith('/theme ')) {
            const theme = m.slice(7).trim();
            if (theme) {
                return { type: 'theme', theme };
            }
        }

        // /widget add [type]
        if (m.startsWith('/widget add ')) {
            const widgetType = m.slice(12).trim();
            if (widgetType) {
                return { type: 'widget', action: 'add', target: widgetType };
            }
        }

        // /widget remove [id]
        if (m.startsWith('/widget remove ')) {
            const widgetId = m.slice(15).trim();
            if (widgetId) {
                return { type: 'widget', action: 'remove', target: widgetId };
            }
        }

        return null;
    };

    // ═══════════════════════════════════════════════════════════════
    // COMMAND HANDLER
    // ═══════════════════════════════════════════════════════════════

    window.handleDashboardCommand = async function(cmd, originalMsg) {
        console.log('[ARAYA-DASH-CMD] Handling:', cmd);

        // Get dashboard context
        const dashboardId = getCurrentDashboard();
        if (!dashboardId && cmd.type !== 'navigate') {
            return '⚠️ <strong>No Dashboard Context</strong><br>Dashboard commands work when ARAYA is embedded in a dashboard, or when you specify <code>?dashboard=NAME</code> in the URL.';
        }

        // Get user identity
        const editorName = localStorage.getItem('araya_editor_name') || 'Operator';
        const editorEmail = localStorage.getItem('araya_editor_email') || null;

        // Build command string
        let commandStr;
        if (cmd.type === 'edit') {
            commandStr = `/edit ${cmd.selector} ${cmd.content}`;
        } else if (cmd.type === 'navigate') {
            commandStr = `/navigate ${cmd.page}`;
        } else if (cmd.type === 'theme') {
            commandStr = `/theme ${cmd.theme}`;
        } else if (cmd.type === 'widget') {
            commandStr = `/widget ${cmd.action} ${cmd.target}`;
        }

        // Handle navigate locally (no API call needed)
        if (cmd.type === 'navigate') {
            const url = cmd.page.startsWith('/') ? cmd.page : `/${cmd.page}`;
            return `🔄 <strong>Navigating to ${cmd.page}...</strong><br><a href="${url}" target="_parent" style="color:#00f0ff;">Click here if navigation doesn't work</a><script>setTimeout(() => window.parent.location.href='${url}', 1000);</script>`;
        }

        // Send to API
        try {
            const response = await fetch(DASHBOARD_EDIT_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    command: commandStr,
                    dashboard_id: dashboardId,
                    editor_name: editorName,
                    editor_email: editorEmail
                })
            });

            const result = await response.json();

            if (!result.success) {
                return `❌ <strong>Command Failed</strong><br>${escapeHtml(result.error || 'Unknown error')}<br><code>${escapeHtml(commandStr)}</code>`;
            }

            // Build success message based on mode
            let message = '';

            if (result.mode === 'instant') {
                message = `✅ <strong>Edit Applied Instantly</strong><br>`;
                if (cmd.type === 'edit') {
                    message += `Updated <code>${cmd.selector}</code> on dashboard <code>${dashboardId}</code>`;
                } else if (cmd.type === 'theme') {
                    message += `Theme changed to <strong>${cmd.theme}</strong>`;
                } else if (cmd.type === 'widget') {
                    message += `Widget ${cmd.action}: <code>${cmd.target}</code>`;
                }
                message += `<br><small style="opacity:0.6">Reload the dashboard to see changes.</small>`;
            } else if (result.mode === 'proposal') {
                message = `📋 <strong>Edit Queued for Approval</strong><br>`;
                if (cmd.type === 'edit') {
                    message += `Proposed edit to <code>${cmd.selector}</code> on dashboard <code>${dashboardId}</code>`;
                } else if (cmd.type === 'theme') {
                    message += `Proposed theme change to <strong>${cmd.theme}</strong>`;
                } else if (cmd.type === 'widget') {
                    message += `Proposed widget ${cmd.action}: <code>${cmd.target}</code>`;
                }
                message += `<br>XP Reward: <strong>${result.xp_reward || 0}</strong> | Change Type: <code>${result.change_type}</code>`;
                message += `<br><small style="opacity:0.6">Dashboard owner will review this change.</small>`;
            } else if (result.mode === 'local-only') {
                message = `💾 <strong>Saved Locally</strong><br>`;
                message += `Changes stored in browser localStorage (database not configured)`;
            }

            return message;

        } catch (error) {
            console.error('[ARAYA-DASH-CMD] API error:', error);
            return `⚠️ <strong>Connection Error</strong><br>${escapeHtml(error.message)}<br><code>${escapeHtml(commandStr)}</code>`;
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // HELPER COMMANDS - Add to quick prompts
    // ═══════════════════════════════════════════════════════════════

    function addDashboardQuickPrompts() {
        // Find quick prompts container
        const quickPromptsDiv = document.querySelector('.quick-prompts');
        if (!quickPromptsDiv) return;

        // Add dashboard commands button
        const dashBtn = document.createElement('button');
        dashBtn.textContent = '📊 Dashboard Commands';
        dashBtn.onclick = showDashboardHelp;
        quickPromptsDiv.appendChild(dashBtn);
    }

    window.showDashboardHelp = function() {
        const helpMsg = `
<strong>🎛️ Dashboard Edit Commands</strong>

Use these commands to edit dashboards in real-time:

<div style="background:rgba(0,255,100,0.05);border:1px solid rgba(0,255,100,0.2);border-radius:8px;padding:12px;margin:8px 0;font-family:monospace;font-size:0.85rem;">
<code>/edit [selector] [new content]</code><br>
<small>Edit any element on the dashboard</small><br>
Example: <code>/edit h1 NEW TITLE</code>
</div>

<div style="background:rgba(0,255,100,0.05);border:1px solid rgba(0,255,100,0.2);border-radius:8px;padding:12px;margin:8px 0;font-family:monospace;font-size:0.85rem;">
<code>/navigate [page]</code><br>
<small>Navigate to another dashboard</small><br>
Example: <code>/navigate /DASHBOARD_1_COMMAND_CENTER_v1.html</code>
</div>

<div style="background:rgba(0,255,100,0.05);border:1px solid rgba(0,255,100,0.2);border-radius:8px;padding:12px;margin:8px 0;font-family:monospace;font-size:0.85rem;">
<code>/theme [dark|light|forge]</code><br>
<small>Change dashboard theme</small><br>
Example: <code>/theme forge</code>
</div>

<div style="background:rgba(0,255,100,0.05);border:1px solid rgba(0,255,100,0.2);border-radius:8px;padding:12px;margin:8px 0;font-family:monospace;font-size:0.85rem;">
<code>/widget add [type]</code><br>
<small>Add a widget to the dashboard</small><br>
Example: <code>/widget add clock</code>
</div>

<div style="background:rgba(0,255,100,0.05);border:1px solid rgba(0,255,100,0.2);border-radius:8px;padding:12px;margin:8px 0;font-family:monospace;font-size:0.85rem;">
<code>/widget remove [id]</code><br>
<small>Remove a widget from the dashboard</small><br>
Example: <code>/widget remove widget-123</code>
</div>

<strong>📍 Current Dashboard:</strong> <code>${getCurrentDashboard() || 'None (standalone mode)'}</code>
        `;

        if (typeof addMessage === 'function') {
            addMessage(helpMsg, 'araya');
        } else {
            console.log(helpMsg);
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addDashboardQuickPrompts);
    } else {
        addDashboardQuickPrompts();
    }

    console.log('[ARAYA-DASH-CMD] Dashboard commands loaded. Current dashboard:', getCurrentDashboard());
    console.log('[ARAYA-DASH-CMD] Type /edit /navigate /theme /widget to use');

})();
