/**
 * ARAYA THEMES — Multi-Theme Selection & Popularity Engine
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Copyright © 2024-2026 Consciousness Revolution / Overkill Kulture LLC
 * All Rights Reserved. PROPRIETARY AND CONFIDENTIAL.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Purpose: Allow users to select from multiple themes across all pages,
 *          persist their preferences, and surface popular themes to other
 *          users. Users are not constrained to a single theme — they can
 *          mix themes per page or set a global preference.
 *
 * Endpoints:
 *   POST /api/araya-themes
 *     { action: 'list' }                            — list all available themes
 *     { action: 'save', userId, page, theme }        — save user theme for page
 *     { action: 'save_global', userId, theme }       — save global theme for user
 *     { action: 'get', userId, page }                — get user theme for page
 *     { action: 'popular', page, limit }             — get popular themes for page
 *     { action: 'vote', userId, theme, page }        — upvote a theme
 *
 * Built-in themes (CSS class + variable overrides injected at runtime):
 *   sacred   — purple/gold sacred geometry (default)
 *   dark     — deep black minimal
 *   light    — clean white
 *   cosmic   — blue/cyan space
 *   ember    — orange/red warm
 *   forest   — green/brown earth
 *   ocean    — teal/navy water
 *   neon     — bright synthwave
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

// ─── Theme definitions ────────────────────────────────────────────────────────

const THEMES = {
    sacred: {
        id: 'sacred',
        name: 'Sacred Geometry',
        description: 'Purple, gold, and deep space — the default consciousness theme',
        variables: {
            '--primary': '#C71585',
            '--accent': '#FFD700',
            '--bg': '#0a0a0a',
            '--bg-card': 'rgba(26,26,46,0.85)',
            '--text': '#e0e0e0',
            '--text-muted': '#888',
            '--border': 'rgba(199,21,133,0.3)'
        }
    },
    dark: {
        id: 'dark',
        name: 'Deep Dark',
        description: 'Minimal black and white — pure focus',
        variables: {
            '--primary': '#ffffff',
            '--accent': '#aaaaaa',
            '--bg': '#000000',
            '--bg-card': 'rgba(20,20,20,0.9)',
            '--text': '#f0f0f0',
            '--text-muted': '#666',
            '--border': 'rgba(255,255,255,0.15)'
        }
    },
    light: {
        id: 'light',
        name: 'Clean Light',
        description: 'Bright, airy, and accessible',
        variables: {
            '--primary': '#6200ea',
            '--accent': '#ff6d00',
            '--bg': '#f8f9fa',
            '--bg-card': 'rgba(255,255,255,0.95)',
            '--text': '#1a1a1a',
            '--text-muted': '#666',
            '--border': 'rgba(98,0,234,0.2)'
        }
    },
    cosmic: {
        id: 'cosmic',
        name: 'Cosmic Blue',
        description: 'Deep blue space and cyan stars',
        variables: {
            '--primary': '#00bcd4',
            '--accent': '#7c4dff',
            '--bg': '#020818',
            '--bg-card': 'rgba(0,20,60,0.85)',
            '--text': '#b3e5fc',
            '--text-muted': '#4fc3f7',
            '--border': 'rgba(0,188,212,0.3)'
        }
    },
    ember: {
        id: 'ember',
        name: 'Ember Warm',
        description: 'Orange, red, and gold warmth',
        variables: {
            '--primary': '#ff6d00',
            '--accent': '#ffd740',
            '--bg': '#1a0800',
            '--bg-card': 'rgba(40,15,0,0.9)',
            '--text': '#ffe0b2',
            '--text-muted': '#ff8a65',
            '--border': 'rgba(255,109,0,0.3)'
        }
    },
    forest: {
        id: 'forest',
        name: 'Forest Earth',
        description: 'Green, brown, and natural earth tones',
        variables: {
            '--primary': '#2e7d32',
            '--accent': '#795548',
            '--bg': '#061008',
            '--bg-card': 'rgba(10,30,12,0.9)',
            '--text': '#c8e6c9',
            '--text-muted': '#81c784',
            '--border': 'rgba(46,125,50,0.3)'
        }
    },
    ocean: {
        id: 'ocean',
        name: 'Ocean Depth',
        description: 'Teal and navy deep water',
        variables: {
            '--primary': '#00897b',
            '--accent': '#0288d1',
            '--bg': '#001820',
            '--bg-card': 'rgba(0,30,45,0.9)',
            '--text': '#b2dfdb',
            '--text-muted': '#4db6ac',
            '--border': 'rgba(0,137,123,0.3)'
        }
    },
    neon: {
        id: 'neon',
        name: 'Neon Synthwave',
        description: 'Bright neon on dark — retro futurism',
        variables: {
            '--primary': '#ff0090',
            '--accent': '#00ffff',
            '--bg': '#0d0014',
            '--bg-card': 'rgba(20,0,30,0.9)',
            '--text': '#f3e5f5',
            '--text-muted': '#ce93d8',
            '--border': 'rgba(255,0,144,0.4)'
        }
    }
};

// ─── Supabase helpers ────────────────────────────────────────────────────────

async function supabaseUpsert(table, row, conflictCols) {
    if (!SUPABASE_URL || !SUPABASE_KEY) return null;
    try {
        const url = conflictCols
            ? `${SUPABASE_URL}/rest/v1/${table}?on_conflict=${encodeURIComponent(conflictCols)}`
            : `${SUPABASE_URL}/rest/v1/${table}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'apikey': SUPABASE_KEY,
                'Prefer': 'resolution=merge-duplicates,return=representation'
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
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
            headers: { 'Authorization': `Bearer ${SUPABASE_KEY}`, 'apikey': SUPABASE_KEY }
        });
        if (!res.ok) return [];
        return await res.json();
    } catch { return []; }
}

async function supabaseRpc(fn, params = {}) {
    if (!SUPABASE_URL || !SUPABASE_KEY) return null;
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'apikey': SUPABASE_KEY
            },
            body: JSON.stringify(params)
        });
        if (!res.ok) return null;
        return await res.json();
    } catch { return null; }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export const handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: CORS_HEADERS, body: '' };
    }

    let body = {};
    try {
        body = event.httpMethod === 'POST'
            ? JSON.parse(event.body || '{}')
            : (event.queryStringParameters || {});
    } catch {
        return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    const { action = 'list', userId, page, theme, limit = 5 } = body;

    switch (action) {

        // ── LIST ALL THEMES ──────────────────────────────────────────────────
        case 'list': {
            return {
                statusCode: 200, headers: CORS_HEADERS,
                body: JSON.stringify({ themes: Object.values(THEMES), count: Object.keys(THEMES).length })
            };
        }

        // ── SAVE THEME FOR SPECIFIC PAGE ─────────────────────────────────────
        case 'save': {
            if (!userId || !page || !theme) {
                return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'userId, page, and theme required' }) };
            }
            if (!THEMES[theme]) {
                return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: `Unknown theme: ${theme}. Available: ${Object.keys(THEMES).join(', ')}` }) };
            }

            const saved = await supabaseUpsert('araya_theme_prefs', {
                user_id: userId, page, theme, updated_at: new Date().toISOString()
            }, 'user_id,page');

            return {
                statusCode: 200, headers: CORS_HEADERS,
                body: JSON.stringify({ success: true, saved: Boolean(saved), theme: THEMES[theme] })
            };
        }

        // ── SAVE GLOBAL THEME (applies to all pages unless page-specific override) ──
        case 'save_global': {
            if (!userId || !theme) {
                return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'userId and theme required' }) };
            }
            if (!THEMES[theme]) {
                return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: `Unknown theme: ${theme}` }) };
            }

            const saved = await supabaseUpsert('araya_theme_prefs', {
                user_id: userId, page: '__global__', theme, updated_at: new Date().toISOString()
            }, 'user_id,page');

            return {
                statusCode: 200, headers: CORS_HEADERS,
                body: JSON.stringify({ success: true, saved: Boolean(saved), globalTheme: theme, themeData: THEMES[theme] })
            };
        }

        // ── GET USER'S THEME FOR PAGE ────────────────────────────────────────
        case 'get': {
            if (!userId) {
                return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'userId required' }) };
            }

            // Check page-specific, then global fallback
            const pageFilter = page
                ? `user_id=eq.${encodeURIComponent(userId)}&page=in.(${encodeURIComponent(page)},__global__)&order=page.desc&limit=2`
                : `user_id=eq.${encodeURIComponent(userId)}&page=eq.__global__&limit=1`;

            const rows = await supabaseSelect('araya_theme_prefs', pageFilter);

            // Prefer page-specific over global
            const pageRow = rows.find(r => r.page === page);
            const globalRow = rows.find(r => r.page === '__global__');
            const activeRow = pageRow || globalRow;

            const activeTheme = activeRow ? THEMES[activeRow.theme] : THEMES.sacred;

            return {
                statusCode: 200, headers: CORS_HEADERS,
                body: JSON.stringify({
                    userId,
                    page,
                    theme: activeRow?.theme || 'sacred',
                    themeData: activeTheme,
                    source: pageRow ? 'page-specific' : globalRow ? 'global' : 'default'
                })
            };
        }

        // ── GET POPULAR THEMES FOR PAGE ──────────────────────────────────────
        case 'popular': {
            const pg = page || '__global__';
            const rows = await supabaseSelect(
                'araya_theme_prefs',
                `page=in.(${encodeURIComponent(pg)},__global__)&limit=500`
            );

            // Count theme popularity
            const freq = {};
            for (const row of rows) {
                freq[row.theme] = (freq[row.theme] || 0) + 1;
            }

            const popular = Object.entries(freq)
                .sort((a, b) => b[1] - a[1])
                .slice(0, Math.min(Number(limit) || 5, Object.keys(THEMES).length))
                .map(([themeId, count]) => ({
                    ...THEMES[themeId],
                    usageCount: count,
                    popularityPercent: rows.length ? Math.round((count / rows.length) * 100) : 0
                }));

            // If no data yet, return all themes sorted by natural order
            if (!popular.length) {
                return {
                    statusCode: 200, headers: CORS_HEADERS,
                    body: JSON.stringify({ page: pg, popular: Object.values(THEMES).slice(0, Number(limit) || 5), source: 'defaults' })
                };
            }

            return {
                statusCode: 200, headers: CORS_HEADERS,
                body: JSON.stringify({ page: pg, popular, totalUsers: rows.length })
            };
        }

        // ── VOTE / UPVOTE THEME ──────────────────────────────────────────────
        case 'vote': {
            if (!userId || !theme) {
                return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'userId and theme required' }) };
            }
            if (!THEMES[theme]) {
                return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: `Unknown theme: ${theme}` }) };
            }

            // Voting is implemented as saving the theme (= implicit vote)
            const pg = page || '__global__';
            const saved = await supabaseUpsert('araya_theme_votes', {
                user_id: userId, page: pg, theme, voted_at: new Date().toISOString()
            }, 'user_id,page');

            return {
                statusCode: 200, headers: CORS_HEADERS,
                body: JSON.stringify({ success: true, voted: theme, themeData: THEMES[theme] })
            };
        }

        // ── GET THEME CSS VARIABLES (for client-side injection) ──────────────
        case 'get_css': {
            const themeId = theme || 'sacred';
            const t = THEMES[themeId];
            if (!t) {
                return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: `Unknown theme: ${themeId}` }) };
            }

            const css = `:root {\n${Object.entries(t.variables).map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}`;

            return {
                statusCode: 200,
                headers: { ...CORS_HEADERS, 'Content-Type': 'text/css' },
                body: css
            };
        }

        default:
            return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: `Unknown action: ${action}` }) };
    }
};

export const config = {
    path: '/api/araya-themes'
};
