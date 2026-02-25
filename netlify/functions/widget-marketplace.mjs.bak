// Widget Marketplace API - Dashboard Factory Phase 3
// Handles widget browsing, installation, and management

import fs from 'fs';
import path from 'path';

// CORS headers
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
};

// Feature Registry - embedded for speed
const FEATURES = {
    discord_round_robin: {
        id: "discord_round_robin",
        name: "Discord Round Robin",
        category: "communication",
        htmlSnippet: `<div class="widget-discord-rr" data-channels="[]" data-interval="5000"></div>`,
        jsSnippet: `// Discord Round Robin Widget
class DiscordRoundRobin {
    constructor(el) {
        this.channels = JSON.parse(el.dataset.channels || '[]');
        this.interval = parseInt(el.dataset.interval) || 5000;
    }
    start() { console.log('[DRR] Started'); }
}
new DiscordRoundRobin(document.querySelector('.widget-discord-rr'));`,
        cssSnippet: `.widget-discord-rr { padding: 10px; background: rgba(0,255,255,0.1); border-radius: 8px; }`
    },
    trinity_status: {
        id: "trinity_status",
        name: "Trinity Status Panel",
        category: "monitoring",
        htmlSnippet: `<div class="widget-trinity-status">
    <div class="terminal" data-id="T1"><span class="dot"></span> T1: <span class="state">IDLE</span></div>
    <div class="terminal" data-id="T2"><span class="dot"></span> T2: <span class="state">IDLE</span></div>
    <div class="terminal" data-id="T3"><span class="dot"></span> T3: <span class="state">IDLE</span></div>
</div>`,
        jsSnippet: `// Trinity Status Widget
async function updateTrinityStatus() {
    try {
        const r = await fetch('/.netlify/functions/trinity-status');
        const d = await r.json();
        document.querySelectorAll('.widget-trinity-status .terminal').forEach(t => {
            const id = t.dataset.id;
            const state = d[id]?.state || 'UNKNOWN';
            t.querySelector('.state').textContent = state;
            t.querySelector('.dot').style.background = state === 'WORKING' ? '#0f0' : state === 'IDLE' ? '#888' : '#ff0';
        });
    } catch(e) { console.error('[Trinity] Update failed', e); }
}
setInterval(updateTrinityStatus, 5000);
updateTrinityStatus();`,
        cssSnippet: `.widget-trinity-status { display: flex; gap: 15px; padding: 10px; }
.widget-trinity-status .terminal { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: rgba(0,0,0,0.5); border-radius: 6px; }
.widget-trinity-status .dot { width: 10px; height: 10px; border-radius: 50%; background: #888; }
.widget-trinity-status .state { color: #00ffff; font-weight: bold; }`
    },
    brain_atom_search: {
        id: "brain_atom_search",
        name: "Brain Atom Search",
        category: "ai_integration",
        htmlSnippet: `<div class="widget-brain-search">
    <input type="text" placeholder="Search 166K+ brain atoms..." class="brain-input">
    <div class="brain-results"></div>
</div>`,
        jsSnippet: `// Brain Atom Search Widget
const brainSearch = document.querySelector('.widget-brain-search');
const brainInput = brainSearch.querySelector('.brain-input');
const brainResults = brainSearch.querySelector('.brain-results');
let searchTimeout;
brainInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
        const q = brainInput.value.trim();
        if (!q) { brainResults.innerHTML = ''; return; }
        try {
            const r = await fetch('/.netlify/functions/brain-api?action=search&q=' + encodeURIComponent(q));
            const d = await r.json();
            brainResults.innerHTML = (d.results || []).slice(0, 5).map(a =>
                '<div class="atom">' + a.content.substring(0, 100) + '...</div>'
            ).join('');
        } catch(e) { brainResults.innerHTML = '<div class="error">Search failed</div>'; }
    }, 300);
});`,
        cssSnippet: `.widget-brain-search { padding: 15px; background: rgba(0,0,0,0.5); border-radius: 10px; }
.widget-brain-search .brain-input { width: 100%; padding: 10px; background: rgba(0,0,0,0.5); border: 1px solid rgba(0,255,255,0.3); border-radius: 6px; color: #fff; font-family: inherit; }
.widget-brain-search .brain-results { margin-top: 10px; }
.widget-brain-search .atom { padding: 8px; background: rgba(0,255,255,0.05); border-radius: 4px; margin-bottom: 5px; font-size: 0.9em; color: #aaa; }`
    },
    xp_level_display: {
        id: "xp_level_display",
        name: "XP Level Display",
        category: "gamification",
        htmlSnippet: `<div class="widget-xp-display">
    <div class="xp-header"><span class="level">LVL 1</span> <span class="xp-text">0 / 100 XP</span></div>
    <div class="xp-bar"><div class="xp-fill" style="width: 0%"></div></div>
</div>`,
        jsSnippet: `// XP Level Display Widget
function updateXPDisplay() {
    const xp = parseInt(localStorage.getItem('user_xp') || '0');
    const level = Math.floor(xp / 100) + 1;
    const xpInLevel = xp % 100;
    const widget = document.querySelector('.widget-xp-display');
    widget.querySelector('.level').textContent = 'LVL ' + level;
    widget.querySelector('.xp-text').textContent = xpInLevel + ' / 100 XP';
    widget.querySelector('.xp-fill').style.width = xpInLevel + '%';
}
updateXPDisplay();
window.addEventListener('storage', updateXPDisplay);`,
        cssSnippet: `.widget-xp-display { padding: 15px; background: linear-gradient(135deg, rgba(0,255,255,0.1), rgba(0,255,0,0.1)); border-radius: 10px; }
.widget-xp-display .xp-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
.widget-xp-display .level { color: #00ffff; font-weight: bold; font-size: 1.2em; }
.widget-xp-display .xp-text { color: #888; }
.widget-xp-display .xp-bar { height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; }
.widget-xp-display .xp-fill { height: 100%; background: linear-gradient(90deg, #00ffff, #00ff88); transition: width 0.3s ease; }`
    },
    quick_deploy: {
        id: "quick_deploy",
        name: "Quick Deploy Button",
        category: "automation",
        htmlSnippet: `<div class="widget-quick-deploy">
    <button class="deploy-btn">Deploy to Netlify</button>
    <div class="deploy-status">Ready</div>
</div>`,
        jsSnippet: `// Quick Deploy Widget
const deployWidget = document.querySelector('.widget-quick-deploy');
const deployBtn = deployWidget.querySelector('.deploy-btn');
const deployStatus = deployWidget.querySelector('.deploy-status');
deployBtn.addEventListener('click', async () => {
    deployBtn.disabled = true;
    deployStatus.textContent = 'Deploying...';
    deployStatus.style.color = '#ffaa00';
    try {
        const r = await fetch('/.netlify/functions/deploy-trigger', { method: 'POST' });
        const d = await r.json();
        deployStatus.textContent = d.success ? 'Deployed!' : 'Failed: ' + d.error;
        deployStatus.style.color = d.success ? '#00ff00' : '#ff0000';
    } catch(e) {
        deployStatus.textContent = 'Network error';
        deployStatus.style.color = '#ff0000';
    }
    setTimeout(() => { deployBtn.disabled = false; }, 3000);
});`,
        cssSnippet: `.widget-quick-deploy { display: flex; align-items: center; gap: 15px; padding: 15px; background: rgba(0,0,0,0.5); border-radius: 10px; }
.widget-quick-deploy .deploy-btn { padding: 12px 24px; background: linear-gradient(135deg, #00ffff, #00cccc); color: #000; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; transition: transform 0.2s; }
.widget-quick-deploy .deploy-btn:hover { transform: scale(1.05); }
.widget-quick-deploy .deploy-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.widget-quick-deploy .deploy-status { color: #888; }`
    },
    todo_sync: {
        id: "todo_sync",
        name: "TODO Sync Widget",
        category: "productivity",
        htmlSnippet: `<div class="widget-todo-sync">
    <div class="todo-header">TODO List</div>
    <div class="todo-items"></div>
</div>`,
        jsSnippet: `// TODO Sync Widget
async function loadTodos() {
    const container = document.querySelector('.widget-todo-sync .todo-items');
    try {
        const r = await fetch('/.netlify/functions/todo-api?action=list');
        const d = await r.json();
        container.innerHTML = (d.todos || []).slice(0, 5).map(t =>
            '<div class="todo-item ' + (t.done ? 'done' : '') + '">' + t.text + '</div>'
        ).join('');
    } catch(e) { container.innerHTML = '<div class="error">Failed to load</div>'; }
}
loadTodos();`,
        cssSnippet: `.widget-todo-sync { padding: 15px; background: rgba(0,0,0,0.5); border-radius: 10px; }
.widget-todo-sync .todo-header { color: #00ffff; font-weight: bold; margin-bottom: 10px; }
.widget-todo-sync .todo-item { padding: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; margin-bottom: 5px; }
.widget-todo-sync .todo-item.done { opacity: 0.5; text-decoration: line-through; }`
    },
    flight_log_viewer: {
        id: "flight_log_viewer",
        name: "Flight Log Viewer",
        category: "analytics",
        htmlSnippet: `<div class="widget-flight-log">
    <div class="log-header">Recent Sessions</div>
    <div class="log-entries"></div>
</div>`,
        jsSnippet: `// Flight Log Viewer Widget
document.querySelector('.widget-flight-log .log-entries').innerHTML =
    '<div class="entry">Session 125: Dashboard Factory Phase 3</div>' +
    '<div class="entry">Session 124: EYEBALLS MCP tuning</div>' +
    '<div class="entry">Session 123: Dashboard Factory scaling</div>';`,
        cssSnippet: `.widget-flight-log { padding: 15px; background: rgba(0,0,0,0.5); border-radius: 10px; }
.widget-flight-log .log-header { color: #00ffff; font-weight: bold; margin-bottom: 10px; }
.widget-flight-log .entry { padding: 8px; background: rgba(0,255,255,0.05); border-left: 3px solid #00ffff; margin-bottom: 5px; font-size: 0.9em; }`
    },
    ai_provider_switcher: {
        id: "ai_provider_switcher",
        name: "AI Provider Switcher",
        category: "ai_integration",
        htmlSnippet: `<div class="widget-ai-switcher">
    <select class="ai-select">
        <option value="claude">Claude (Anthropic)</option>
        <option value="groq">Groq (Fast)</option>
        <option value="openrouter">OpenRouter</option>
    </select>
    <span class="ai-status">Active</span>
</div>`,
        jsSnippet: `// AI Provider Switcher Widget
const aiSelect = document.querySelector('.widget-ai-switcher .ai-select');
aiSelect.value = localStorage.getItem('ai_provider') || 'claude';
aiSelect.addEventListener('change', () => {
    localStorage.setItem('ai_provider', aiSelect.value);
    document.querySelector('.widget-ai-switcher .ai-status').textContent = 'Switched!';
    setTimeout(() => document.querySelector('.widget-ai-switcher .ai-status').textContent = 'Active', 1500);
});`,
        cssSnippet: `.widget-ai-switcher { display: flex; align-items: center; gap: 15px; padding: 15px; background: rgba(0,0,0,0.5); border-radius: 10px; }
.widget-ai-switcher .ai-select { padding: 10px; background: rgba(0,0,0,0.5); border: 1px solid rgba(0,255,255,0.3); border-radius: 6px; color: #fff; }
.widget-ai-switcher .ai-status { color: #00ff00; }`
    },
    bug_tracker_live: {
        id: "bug_tracker_live",
        name: "Bug Tracker Live",
        category: "monitoring",
        htmlSnippet: `<div class="widget-bug-tracker">
    <div class="bug-header">Open Issues <span class="bug-count">0</span></div>
    <div class="bug-list"></div>
</div>`,
        jsSnippet: `// Bug Tracker Widget
async function loadBugs() {
    const list = document.querySelector('.widget-bug-tracker .bug-list');
    const count = document.querySelector('.widget-bug-tracker .bug-count');
    try {
        const r = await fetch('/.netlify/functions/get-all-bugs');
        const d = await r.json();
        const bugs = d.bugs || [];
        count.textContent = bugs.length;
        list.innerHTML = bugs.slice(0, 3).map(b =>
            '<div class="bug">#' + b.number + ': ' + b.title.substring(0, 40) + '</div>'
        ).join('');
    } catch(e) { list.innerHTML = '<div class="error">Failed</div>'; }
}
loadBugs();
setInterval(loadBugs, 30000);`,
        cssSnippet: `.widget-bug-tracker { padding: 15px; background: rgba(0,0,0,0.5); border-radius: 10px; }
.widget-bug-tracker .bug-header { display: flex; justify-content: space-between; color: #00ffff; font-weight: bold; margin-bottom: 10px; }
.widget-bug-tracker .bug-count { background: #ff6464; color: #fff; padding: 2px 8px; border-radius: 10px; font-size: 0.8em; }
.widget-bug-tracker .bug { padding: 8px; background: rgba(255,100,100,0.1); border-radius: 4px; margin-bottom: 5px; font-size: 0.9em; }`
    },
    notification_center: {
        id: "notification_center",
        name: "Notification Center",
        category: "productivity",
        htmlSnippet: `<div class="widget-notifications">
    <div class="notif-header">Notifications <span class="notif-count">0</span></div>
    <div class="notif-list"></div>
</div>`,
        jsSnippet: `// Notification Center Widget
document.querySelector('.widget-notifications .notif-list').innerHTML =
    '<div class="notif">No new notifications</div>';`,
        cssSnippet: `.widget-notifications { padding: 15px; background: rgba(0,0,0,0.5); border-radius: 10px; }
.widget-notifications .notif-header { display: flex; justify-content: space-between; color: #00ffff; font-weight: bold; margin-bottom: 10px; }
.widget-notifications .notif-count { background: #00ffff; color: #000; padding: 2px 8px; border-radius: 10px; font-size: 0.8em; }
.widget-notifications .notif { padding: 8px; background: rgba(0,255,255,0.05); border-radius: 4px; color: #888; }`
    },
    araya_chat_embed: {
        id: "araya_chat_embed",
        name: "Araya Chat Embed",
        category: "ai_integration",
        htmlSnippet: `<div class="widget-araya-embed">
    <iframe src="/araya-chat.html?embed=true" style="width:100%;height:400px;border:none;border-radius:10px;"></iframe>
</div>`,
        jsSnippet: `// Araya Chat Embed - iframe handles everything`,
        cssSnippet: `.widget-araya-embed { border-radius: 10px; overflow: hidden; box-shadow: 0 5px 20px rgba(0,255,255,0.2); }`
    },
    community_pulse: {
        id: "community_pulse",
        name: "Community Pulse",
        category: "community",
        htmlSnippet: `<div class="widget-community-pulse">
    <div class="pulse-header">Community Activity</div>
    <div class="pulse-meter"><div class="pulse-fill" style="width: 65%"></div></div>
    <div class="pulse-stats">65% engagement today</div>
</div>`,
        jsSnippet: `// Community Pulse Widget - placeholder
console.log('[Community Pulse] Loaded');`,
        cssSnippet: `.widget-community-pulse { padding: 15px; background: rgba(0,0,0,0.5); border-radius: 10px; }
.widget-community-pulse .pulse-header { color: #c864ff; font-weight: bold; margin-bottom: 10px; }
.widget-community-pulse .pulse-meter { height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; }
.widget-community-pulse .pulse-fill { height: 100%; background: linear-gradient(90deg, #c864ff, #ff64c8); }
.widget-community-pulse .pulse-stats { margin-top: 8px; color: #888; font-size: 0.9em; }`
    }
};

export async function handler(event) {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        // GET - List all widgets
        if (event.httpMethod === 'GET') {
            const widgets = Object.values(FEATURES).map(f => ({
                id: f.id,
                name: f.name,
                category: f.category,
                hasSnippets: true
            }));
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, widgets, count: widgets.length })
            };
        }

        // POST - Install/Uninstall/GetCode
        if (event.httpMethod === 'POST') {
            const body = JSON.parse(event.body || '{}');
            const { action, widgetId, dashboardId } = body;

            if (!action) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ success: false, error: 'Missing action parameter' })
                };
            }

            // Get widget code snippets
            if (action === 'getCode') {
                const widget = FEATURES[widgetId];
                if (!widget) {
                    return {
                        statusCode: 404,
                        headers,
                        body: JSON.stringify({ success: false, error: 'Widget not found' })
                    };
                }
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        widget: widget.id,
                        html: widget.htmlSnippet,
                        js: widget.jsSnippet,
                        css: widget.cssSnippet
                    })
                };
            }

            // Install widget
            if (action === 'install') {
                const widget = FEATURES[widgetId];
                if (!widget) {
                    return {
                        statusCode: 404,
                        headers,
                        body: JSON.stringify({ success: false, error: 'Widget not found' })
                    };
                }

                // Return install instructions and code
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        message: `Widget ${widget.name} ready to install`,
                        targetDashboard: dashboardId,
                        code: {
                            html: widget.htmlSnippet,
                            js: widget.jsSnippet,
                            css: widget.cssSnippet
                        },
                        instructions: [
                            `1. Add CSS to <style> section`,
                            `2. Add HTML where you want the widget`,
                            `3. Add JS before </body>`,
                            `Or use Dashboard Merge Tool for automatic installation`
                        ]
                    })
                };
            }

            // Uninstall widget (just returns confirmation)
            if (action === 'uninstall') {
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        message: `Widget ${widgetId} marked for removal`,
                        instructions: [
                            `1. Open the target dashboard HTML`,
                            `2. Remove the widget HTML element`,
                            `3. Remove associated CSS and JS`,
                            `Or use Dashboard Merge Tool for automatic removal`
                        ]
                    })
                };
            }

            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: 'Unknown action: ' + action })
            };
        }

        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };

    } catch (error) {
        console.error('[Widget Marketplace] Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
}
