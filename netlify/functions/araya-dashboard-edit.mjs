/**
 * ARAYA DASHBOARD EDIT API - Chat-to-Dashboard Bridge
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Copyright © 2024-2026 Consciousness Revolution / Overkill Kulture LLC
 * Pattern: 3 → 7 → 13 → ∞ | LFSME
 *
 * Purpose: Enable ARAYA chat to send editing commands to any dashboard
 * Flow: ARAYA chat → this API → dashboard-edit.mjs → approval queue (if needed)
 *
 * Commands:
 * - /edit [selector] [new content] - Edit dashboard content
 * - /navigate [page] - Navigate to another dashboard
 * - /theme [dark|light|forge] - Change theme
 * - /widget add [type] - Add widget
 * - /widget remove [id] - Remove widget
 */

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
};

export async function handler(event, context) {
    // CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Method not allowed - use POST' })
        };
    }

    try {
        const {
            command,           // Command string (e.g., "/edit .title New Title")
            dashboard_id,      // Target dashboard
            editor_name,       // Who's editing (from ARAYA session)
            editor_email,      // Email for Commander bypass
            force_proposal = false
        } = JSON.parse(event.body || '{}');

        if (!command || !dashboard_id) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({
                    error: 'Required: command, dashboard_id'
                })
            };
        }

        // Parse command
        const parsed = parseCommand(command);
        if (!parsed) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({
                    error: `Invalid command: ${command}`,
                    help: 'Valid: /edit /navigate /theme /widget'
                })
            };
        }

        // Route to appropriate handler
        let result;
        switch (parsed.action) {
            case 'edit':
                result = await handleEdit(parsed, dashboard_id, editor_name, editor_email, force_proposal);
                break;
            case 'navigate':
                result = handleNavigate(parsed);
                break;
            case 'theme':
                result = await handleTheme(parsed, dashboard_id, editor_name, editor_email);
                break;
            case 'widget':
                result = await handleWidget(parsed, dashboard_id, editor_name, editor_email);
                break;
            default:
                return {
                    statusCode: 400,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({ error: `Unknown action: ${parsed.action}` })
                };
        }

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify(result)
        };

    } catch (error) {
        console.error('[ARAYA-DASHBOARD-EDIT] Error:', error);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                error: 'Internal server error',
                details: error.message
            })
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// COMMAND PARSER
// ═══════════════════════════════════════════════════════════════

function parseCommand(cmd) {
    const parts = cmd.trim().split(/\s+/);
    const action = parts[0].replace('/', '');

    if (action === 'edit') {
        // /edit [selector] [new content]
        const selector = parts[1];
        const content = parts.slice(2).join(' ');
        if (!selector || !content) return null;
        return { action: 'edit', selector, content };
    }

    if (action === 'navigate') {
        // /navigate [page]
        const page = parts.slice(1).join(' ');
        if (!page) return null;
        return { action: 'navigate', page };
    }

    if (action === 'theme') {
        // /theme [dark|light|forge]
        const theme = parts[1];
        if (!theme) return null;
        return { action: 'theme', theme };
    }

    if (action === 'widget') {
        // /widget add [type] OR /widget remove [id]
        const subaction = parts[1];
        const target = parts[2];
        if (!subaction || !target) return null;
        return { action: 'widget', subaction, target };
    }

    return null;
}

// ═══════════════════════════════════════════════════════════════
// COMMAND HANDLERS
// ═══════════════════════════════════════════════════════════════

async function handleEdit(parsed, dashboard_id, editor_name, editor_email, force_proposal) {
    const { selector, content } = parsed;

    // Build CSS injection to update the selector
    const css = `
/* ARAYA Edit: ${selector} */
${selector} {
    /* Content updated via ::before or direct text replacement */
}
`;

    // Build JS to update content dynamically
    const js = `
(function() {
    const el = document.querySelector('${selector.replace(/'/g, "\\'")}');
    if (el) {
        el.textContent = '${content.replace(/'/g, "\\'")}';
        console.log('[ARAYA] Updated ${selector}');
    } else {
        console.warn('[ARAYA] Selector not found: ${selector}');
    }
})();
`;

    // Call dashboard-edit API
    const dashboardEditUrl = `${process.env.URL || 'https://consciousnessrevolution.io'}/.netlify/functions/dashboard-edit`;

    const response = await fetch(dashboardEditUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            dashboard_id,
            editor_name: editor_name || 'ARAYA',
            editor_email,
            editor_type: 'agent',
            edit_type: 'js',
            content: js,
            title: `ARAYA: Edit ${selector}`,
            force_proposal,
            commander_bypass: isCommander(editor_email, editor_name)
        })
    });

    const result = await response.json();

    return {
        success: result.success,
        mode: result.mode,
        message: result.message,
        selector,
        content,
        proposal_id: result.proposal_id,
        customization_id: result.customization_id
    };
}

function handleNavigate(parsed) {
    const { page } = parsed;

    // Return navigation instruction for client
    return {
        success: true,
        action: 'navigate',
        page,
        message: `Navigate to ${page}`,
        instruction: {
            type: 'redirect',
            url: page.startsWith('/') ? page : `/${page}`
        }
    };
}

async function handleTheme(parsed, dashboard_id, editor_name, editor_email) {
    const { theme } = parsed;

    // Theme presets
    const themes = {
        dark: {
            '--bg': '#0a0a0a',
            '--surface': '#111',
            '--text': '#fff',
            '--accent': '#0ff'
        },
        light: {
            '--bg': '#f5f5f5',
            '--surface': '#fff',
            '--text': '#000',
            '--accent': '#0066ff'
        },
        forge: {
            '--bg': '#1a0a0a',
            '--surface': '#220a0a',
            '--text': '#ffd700',
            '--accent': '#ff4444'
        }
    };

    const themeVars = themes[theme.toLowerCase()];
    if (!themeVars) {
        return {
            success: false,
            error: `Unknown theme: ${theme}`,
            available: Object.keys(themes)
        };
    }

    // Build CSS
    const css = `:root { ${Object.entries(themeVars).map(([k, v]) => `${k}: ${v};`).join(' ')} }`;

    // Call dashboard-edit API
    const dashboardEditUrl = `${process.env.URL || 'https://consciousnessrevolution.io'}/.netlify/functions/dashboard-edit`;

    const response = await fetch(dashboardEditUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            dashboard_id,
            editor_name: editor_name || 'ARAYA',
            editor_email,
            editor_type: 'agent',
            edit_type: 'theme',
            content: themeVars,
            title: `ARAYA: Theme change to ${theme}`,
            commander_bypass: isCommander(editor_email, editor_name)
        })
    });

    const result = await response.json();

    return {
        success: result.success,
        mode: result.mode,
        theme,
        message: `Theme changed to ${theme}`,
        customization_id: result.customization_id
    };
}

async function handleWidget(parsed, dashboard_id, editor_name, editor_email) {
    const { subaction, target } = parsed;

    let widgetConfig;
    if (subaction === 'add') {
        // Widget type to add
        widgetConfig = {
            action: 'add',
            widget: {
                type: target,
                id: `widget-${Date.now()}`,
                position: 'bottom'
            }
        };
    } else if (subaction === 'remove') {
        // Widget ID to remove
        widgetConfig = {
            action: 'remove',
            widget_id: target
        };
    } else {
        return {
            success: false,
            error: `Unknown widget action: ${subaction}`,
            help: 'Use: /widget add [type] OR /widget remove [id]'
        };
    }

    // Call dashboard-edit API
    const dashboardEditUrl = `${process.env.URL || 'https://consciousnessrevolution.io'}/.netlify/functions/dashboard-edit`;

    const response = await fetch(dashboardEditUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            dashboard_id,
            editor_name: editor_name || 'ARAYA',
            editor_email,
            editor_type: 'agent',
            edit_type: 'widget',
            content: widgetConfig,
            title: `ARAYA: Widget ${subaction} ${target}`,
            commander_bypass: isCommander(editor_email, editor_name)
        })
    });

    const result = await response.json();

    return {
        success: result.success,
        mode: result.mode,
        widget: widgetConfig,
        message: `Widget ${subaction}: ${target}`,
        customization_id: result.customization_id
    };
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function isCommander(email, name) {
    const COMMANDER_EMAILS = ['darrickpreble@proton.me', 'darrickpreble@gmail.com'];
    const COMMANDER_NAMES = ['commander', 'commander dwrek', 'dwrek'];

    return COMMANDER_EMAILS.includes((email || '').toLowerCase()) ||
           COMMANDER_NAMES.includes((name || '').toLowerCase());
}
