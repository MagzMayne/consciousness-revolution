// supabase-roles.mjs — Supabase database roles proxy
// ────────────────────────────────────────────────────
// Calls the Supabase Management API to list all database roles for the
// configured project and returns them to browser clients, following the
// same security pattern as github-token.mjs and sam-gov-token.mjs.
//
// Required environment variables:
//   SUPABASE_URL          — e.g. https://<project-ref>.supabase.co
//   SUPABASE_ACCESS_TOKEN — personal access token from app.supabase.com/account/tokens
//
// Security guarantees:
//   • Credentials are NEVER committed to the repo.
//   • Credentials are NEVER logged.
//   • Served only over HTTPS (Netlify enforces TLS).
//   • CORS origin is restricted to the allowed-origins list.
//   • Simple rate-limiting (10 req / minute per IP) via in-memory map.
//
// Client usage:
//   const res  = await fetch('/api/supabase-roles');
//   const data = await res.json();
//   // data → { auth: true,  roles: [...], api_error: null }
//   // data → { auth: false, roles: null,  api_error: null }  — creds not configured
//   // data → { auth: true,  roles: null,  api_error: "..." } — Management API error

const SUPABASE_URL          = process.env.SUPABASE_URL          || null;
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || null;

// Allowed browser origins (matches github-token.mjs / sam-gov-token.mjs)
const ALLOWED_ORIGINS = [
    'https://consciousnessrevolution.io',
    'https://www.consciousnessrevolution.io',
    'https://conciousnessrevolution.io',
    'https://www.conciousnessrevolution.io',
    'http://localhost:8888',
    'http://localhost:3000',
    'http://127.0.0.1:8888'
];

// In-memory rate-limit store: ip → { count, resetAt }
const _rateLimitMap = new Map();
const RATE_LIMIT_MAX       = 10;         // requests
const RATE_LIMIT_WINDOW_MS = 60_000;     // 1 minute

function checkRateLimit(ip) {
    const now   = Date.now();
    const entry = _rateLimitMap.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    if (now > entry.resetAt) {
        entry.count  = 0;
        entry.resetAt = now + RATE_LIMIT_WINDOW_MS;
    }
    entry.count += 1;
    _rateLimitMap.set(ip, entry);
    return entry.count <= RATE_LIMIT_MAX;
}

function getCorsOrigin(origin) {
    if (ALLOWED_ORIGINS.includes(origin)) return origin;
    return 'null';
}

/**
 * Extract the Supabase project reference from SUPABASE_URL.
 * e.g. "https://abcdefgh.supabase.co"  →  "abcdefgh"
 */
function extractProjectRef(supabaseUrl) {
    try {
        const hostname = new URL(supabaseUrl).hostname; // "abcdefgh.supabase.co"
        return hostname.split('.')[0];
    } catch {
        return null;
    }
}

export const handler = async (event) => {
    const origin     = event.headers?.origin || event.headers?.Origin || '';
    const corsOrigin = getCorsOrigin(origin);

    const headers = {
        'Access-Control-Allow-Origin':  corsOrigin,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type':                 'application/json',
        'Cache-Control':                'no-store',
        'X-Content-Type-Options':       'nosniff'
    };

    // CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }

    // Only GET allowed
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    // Rate limiting
    const clientIP = (event.headers?.['x-forwarded-for'] || 'no-xff').split(',')[0].trim();
    if (!checkRateLimit(clientIP)) {
        return {
            statusCode: 429,
            headers: { ...headers, 'Retry-After': '60' },
            body: JSON.stringify({ error: 'Too many requests — try again in 60 s' })
        };
    }

    // Verify credentials are configured
    const auth = Boolean(SUPABASE_URL && SUPABASE_ACCESS_TOKEN);

    if (!auth) {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                auth:      false,
                roles:     null,
                api_error: null,
                message:   'Server secrets missing — set SUPABASE_URL and SUPABASE_ACCESS_TOKEN in Netlify environment variables.'
            })
        };
    }

    // Extract project ref from the URL
    const projectRef = extractProjectRef(SUPABASE_URL);
    if (!projectRef) {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                auth:      true,
                roles:     null,
                api_error: 'Could not extract project reference from SUPABASE_URL.',
                message:   'Check that SUPABASE_URL is a valid Supabase project URL (e.g. https://<ref>.supabase.co).'
            })
        };
    }

    // Fetch roles from the Supabase Management API
    try {
        const apiUrl   = `https://api.supabase.com/v1/projects/${projectRef}/database/roles`;
        const response = await fetch(apiUrl, {
            method:  'GET',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
                'Content-Type':  'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    auth:      true,
                    roles:     null,
                    api_error: `Management API returned ${response.status}: ${errorText}`,
                    message:   'Failed to fetch roles from Supabase Management API.'
                })
            };
        }

        const roles = await response.json();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                auth:        true,
                roles:       roles,
                api_error:   null,
                project_ref: projectRef,
                message:     `Loaded ${Array.isArray(roles) ? roles.length : 0} database roles.`
            })
        };

    } catch (err) {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                auth:      true,
                roles:     null,
                api_error: err.message,
                message:   'Unexpected error calling the Supabase Management API.'
            })
        };
    }
};

// Netlify Functions v2 path alias
export const config = {
    path: '/api/supabase-roles'
};
