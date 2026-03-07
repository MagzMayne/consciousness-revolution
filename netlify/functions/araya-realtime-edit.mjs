/**
 * ARAYA REAL-TIME PAGE EDITOR
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Copyright © 2024-2026 Consciousness Revolution / Overkill Kulture LLC
 * All Rights Reserved. PROPRIETARY AND CONFIDENTIAL.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Purpose: Real-time page editing with session ID tracking and edit logs.
 *          Edits are committed to GitHub so they auto-deploy via Netlify.
 *          Logs feed the araya-optimize reasoning protocol.
 *
 * Endpoints:
 *   POST /api/araya-realtime-edit
 *     { action: 'edit', sessionId, page, selector, property, value, userId }
 *     { action: 'get_logs', sessionId }
 *     { action: 'get_page_edits', page }
 *     { action: 'undo', sessionId, editId }
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = 'overkor-tek';
const GITHUB_REPO = 'consciousness-revolution';
const GITHUB_BRANCH = 'master';

// Supabase for persisting session logs
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_SECRET
    || process.env.SUPABASE_SERVICE_KEY
    || process.env.SUPABASE_ANON_KEY;

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

// In-memory edit log for current session (cleared on cold start)
// Persistent logs go to Supabase
const _sessionLogs = new Map();

// ─── Supabase helpers ────────────────────────────────────────────────────────

async function supabaseInsert(table, row) {
    if (!SUPABASE_URL || !SUPABASE_KEY) return null;
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'apikey': SUPABASE_KEY,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(row)
        });
        if (!res.ok) return null;
        const data = await res.json();
        return Array.isArray(data) ? data[0] : data;
    } catch { return null; }
}

async function supabaseSelect(table, filter = '') {
    if (!SUPABASE_URL || !SUPABASE_KEY) return [];
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}&order=created_at.desc&limit=100`, {
            headers: {
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'apikey': SUPABASE_KEY
            }
        });
        if (!res.ok) return [];
        return await res.json();
    } catch { return []; }
}

// ─── GitHub file fetch + commit ──────────────────────────────────────────────

async function getFileSha(path) {
    if (!GITHUB_TOKEN) return null;
    try {
        const res = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`,
            { headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' } }
        );
        if (!res.ok) return null;
        const data = await res.json();
        if (!data.content || !data.sha) return null;
        let content;
        try {
            content = Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf8');
        } catch (decodeErr) {
            console.error('[EDIT] Base64 decode failed for', path, decodeErr.message);
            return null;
        }
        return { sha: data.sha, content };
    } catch { return null; }
}

async function commitFileEdit(path, newContent, sha, message) {
    if (!GITHUB_TOKEN) return false;
    try {
        const res = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
            {
                method: 'PUT',
                headers: {
                    Authorization: `token ${GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message,
                    content: Buffer.from(newContent, 'utf8').toString('base64'),
                    sha,
                    branch: GITHUB_BRANCH
                })
            }
        );
        return res.ok;
    } catch { return false; }
}

// ─── Apply a CSS/attribute edit to HTML content ──────────────────────────────

function applyEditToHtml(html, selector, property, value) {
    // Inject or update a <style> override for the selector+property
    const overrideComment = `/* araya-edit: ${selector} */`;
    const newRule = `\n${overrideComment}\n${selector} { ${property}: ${value} !important; }\n`;

    if (html.includes(overrideComment)) {
        // Replace existing override
        return html.replace(
            new RegExp(`\\/\\* araya-edit: ${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\*\\/[\\s\\S]*?\\}`),
            newRule.trim()
        );
    }

    // Insert before </style> or before </head>
    if (html.includes('</style>')) {
        return html.replace('</style>', `${newRule}</style>`);
    }
    return html.replace('</head>', `<style>${newRule}</style>\n</head>`);
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export const handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: CORS_HEADERS, body: '' };
    }

    if (!['GET', 'POST'].includes(event.httpMethod)) {
        return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    let body = {};
    try {
        body = event.httpMethod === 'POST' ? JSON.parse(event.body || '{}') : {};
    } catch {
        return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    const { action = 'edit', sessionId, page, selector, property, value, userId, editId } = body;
    const qp = event.queryStringParameters || {};

    switch (action) {

        // ── APPLY A REAL-TIME EDIT ──────────────────────────────────────────
        case 'edit': {
            if (!sessionId || !page || !selector || !property || value === undefined) {
                return { statusCode: 400, headers: CORS_HEADERS,
                    body: JSON.stringify({ error: 'Missing required fields: sessionId, page, selector, property, value' }) };
            }

            const timestamp = new Date().toISOString();
            const editRecord = { sessionId, page, selector, property, value, userId: userId || 'anonymous', timestamp, status: 'pending' };

            // Persist log entry
            const saved = await supabaseInsert('araya_edit_logs', editRecord);
            const localId = saved?.id || `local-${Date.now()}`;

            // Track in memory
            if (!_sessionLogs.has(sessionId)) _sessionLogs.set(sessionId, []);
            _sessionLogs.get(sessionId).push({ ...editRecord, id: localId });

            // Apply edit to GitHub file (non-blocking attempt)
            let committed = false;
            const filePath = page.replace(/^\//, '');
            const fileData = await getFileSha(filePath);
            if (fileData) {
                const newHtml = applyEditToHtml(fileData.content, selector, property, value);
                const commitMsg = `✏️ [ARAYA Edit] ${page}: ${selector} { ${property}: ${value} } — session ${sessionId}`;
                committed = await commitFileEdit(filePath, newHtml, fileData.sha, commitMsg);
            }

            return {
                statusCode: 200,
                headers: CORS_HEADERS,
                body: JSON.stringify({
                    success: true,
                    editId: localId,
                    committed,
                    message: committed ? 'Edit saved and deployed' : 'Edit logged (deploy pending — GitHub token may be needed)'
                })
            };
        }

        // ── GET SESSION LOGS ────────────────────────────────────────────────
        case 'get_logs': {
            const sid = sessionId || qp.sessionId;
            if (!sid) return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'sessionId required' }) };

            const memLogs = _sessionLogs.get(sid) || [];
            const dbLogs = await supabaseSelect('araya_edit_logs', `session_id=eq.${sid}`);
            const logs = dbLogs.length ? dbLogs : memLogs;

            return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ sessionId: sid, logs, count: logs.length }) };
        }

        // ── GET ALL EDITS FOR A PAGE ─────────────────────────────────────────
        case 'get_page_edits': {
            const pg = page || qp.page;
            if (!pg) return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'page required' }) };

            const edits = await supabaseSelect('araya_edit_logs', `page=eq.${encodeURIComponent(pg)}`);
            return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ page: pg, edits, count: edits.length }) };
        }

        default:
            return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: `Unknown action: ${action}` }) };
    }
};

export const config = {
    path: '/api/araya-realtime-edit'
};
