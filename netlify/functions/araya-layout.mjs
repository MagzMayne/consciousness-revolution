/**
 * ARAYA LAYOUT PERSISTENCE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Copyright © 2024-2026 Consciousness Revolution / Overkill Kulture LLC
 * All Rights Reserved. PROPRIETARY AND CONFIDENTIAL.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Purpose: Save and retrieve user custom layouts, orientations, and page
 *          preferences so they are automatically restored on next visit.
 *
 * Endpoints:
 *   POST /api/araya-layout
 *     { action: 'save', userId, page, layout }
 *     { action: 'get', userId, page }
 *     { action: 'list', userId }
 *     { action: 'delete', userId, page }
 *     { action: 'get_popular', page, limit }
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_SECRET
    || process.env.SUPABASE_SERVICE_KEY
    || process.env.SUPABASE_ANON_KEY;

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

// ─── Supabase helpers ────────────────────────────────────────────────────────

async function supabaseUpsert(table, row, conflictCols = 'user_id,page') {
    if (!SUPABASE_URL || !SUPABASE_KEY) return null;
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?on_conflict=${encodeURIComponent(conflictCols)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'apikey': SUPABASE_KEY,
                'Prefer': 'resolution=merge-duplicates,return=representation'
            },
            body: JSON.stringify(row)
        });
        if (!res.ok) {
            const err = await res.text();
            console.error('[LAYOUT] Supabase upsert error:', err);
            return null;
        }
        const data = await res.json();
        return Array.isArray(data) ? data[0] : data;
    } catch (e) {
        console.error('[LAYOUT] Supabase upsert exception:', e.message);
        return null;
    }
}

async function supabaseSelect(table, filter = '') {
    if (!SUPABASE_URL || !SUPABASE_KEY) return [];
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
            headers: {
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'apikey': SUPABASE_KEY
            }
        });
        if (!res.ok) return [];
        return await res.json();
    } catch { return []; }
}

async function supabaseDelete(table, filter) {
    if (!SUPABASE_URL || !SUPABASE_KEY) return false;
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'apikey': SUPABASE_KEY
            }
        });
        return res.ok;
    } catch { return false; }
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
        body = event.httpMethod === 'POST'
            ? JSON.parse(event.body || '{}')
            : event.queryStringParameters || {};
    } catch {
        return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    const { action = 'get', userId, page, layout, limit = 10 } = body;

    switch (action) {

        // ── SAVE LAYOUT ──────────────────────────────────────────────────────
        case 'save': {
            if (!userId || !page || !layout) {
                return { statusCode: 400, headers: CORS_HEADERS,
                    body: JSON.stringify({ error: 'Missing required fields: userId, page, layout' }) };
            }

            const row = {
                user_id: userId,
                page,
                layout: typeof layout === 'object' ? layout : (() => { try { return JSON.parse(layout); } catch { return layout; } })(),
                updated_at: new Date().toISOString()
            };

            const saved = await supabaseUpsert('araya_layouts', row);

            return {
                statusCode: 200,
                headers: CORS_HEADERS,
                body: JSON.stringify({
                    success: Boolean(saved),
                    message: saved ? 'Layout saved successfully' : 'Layout saved locally (Supabase unavailable)',
                    data: saved
                })
            };
        }

        // ── GET USER LAYOUT FOR PAGE ─────────────────────────────────────────
        case 'get': {
            if (!userId || !page) {
                return { statusCode: 400, headers: CORS_HEADERS,
                    body: JSON.stringify({ error: 'Missing required fields: userId, page' }) };
            }

            const rows = await supabaseSelect(
                'araya_layouts',
                `user_id=eq.${encodeURIComponent(userId)}&page=eq.${encodeURIComponent(page)}&limit=1`
            );

            if (!rows.length) {
                return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ found: false, layout: null }) };
            }

            const row = rows[0];
            let layoutData = row.layout;
            try { layoutData = JSON.parse(row.layout); } catch { /* keep as string */ }

            return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ found: true, layout: layoutData, updatedAt: row.updated_at }) };
        }

        // ── LIST ALL LAYOUTS FOR USER ────────────────────────────────────────
        case 'list': {
            if (!userId) {
                return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'userId required' }) };
            }

            const rows = await supabaseSelect('araya_layouts', `user_id=eq.${encodeURIComponent(userId)}&order=updated_at.desc`);

            return {
                statusCode: 200,
                headers: CORS_HEADERS,
                body: JSON.stringify({ userId, layouts: rows, count: rows.length })
            };
        }

        // ── DELETE LAYOUT ────────────────────────────────────────────────────
        case 'delete': {
            if (!userId || !page) {
                return { statusCode: 400, headers: CORS_HEADERS,
                    body: JSON.stringify({ error: 'Missing required fields: userId, page' }) };
            }

            const ok = await supabaseDelete(
                'araya_layouts',
                `user_id=eq.${encodeURIComponent(userId)}&page=eq.${encodeURIComponent(page)}`
            );

            return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ success: ok, message: ok ? 'Layout deleted' : 'Delete failed' }) };
        }

        // ── GET POPULAR LAYOUTS FOR PAGE ─────────────────────────────────────
        case 'get_popular': {
            if (!page) {
                return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'page required' }) };
            }

            const rows = await supabaseSelect(
                'araya_layouts',
                `page=eq.${encodeURIComponent(page)}&order=updated_at.desc&limit=${Math.min(Number(limit) || 10, 50)}`
            );

            // Simple frequency aggregation: which layouts appear most often
            const freq = {};
            for (const row of rows) {
                const key = row.layout;
                freq[key] = (freq[key] || 0) + 1;
            }
            const popular = Object.entries(freq)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([layoutStr, count]) => {
                    let layout = layoutStr;
                    try { layout = JSON.parse(layoutStr); } catch { /* keep string */ }
                    return { layout, popularityCount: count };
                });

            return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ page, popular }) };
        }

        default:
            return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: `Unknown action: ${action}` }) };
    }
};

export const config = {
    path: '/api/araya-layout'
};
