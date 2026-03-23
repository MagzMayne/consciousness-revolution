// supabase-config.mjs — Secure Supabase public-config relay
// ──────────────────────────────────────────────────────────
// Reads SUPABASE_URL and SUPABASE_ANON_KEY from the Netlify environment
// and returns them to browser clients so they can initialise the Supabase
// client without having credentials hard-coded in source.
//
// Security guarantees:
//   • Credentials are NEVER committed to the repo.
//   • Credentials are NEVER logged.
//   • Served only over HTTPS (Netlify enforces TLS).
//   • CORS origin is restricted to the allowed-origins list.
//   • Simple rate-limiting (20 req / minute per IP) via in-memory map.
//
// Client usage:
//   const res  = await fetch('/api/supabase-config');
//   const data = await res.json();
//   // data → { auth: true, url: "https://…", anonKey: "eyJ…", api_error: null }
//   // data → { auth: false, url: null, anonKey: null, api_error: null }
//   // Use url + anonKey to call supabase.createClient() — store in memory only.

const SUPABASE_URL     = process.env.SUPABASE_URL      || null;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || null;

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
const RATE_LIMIT_MAX       = 20;         // requests (higher than token relays — this is a public config)
const RATE_LIMIT_WINDOW_MS = 60_000;     // 1 minute

function checkRateLimit(ip) {
    const now = Date.now();
    const entry = _rateLimitMap.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    if (now > entry.resetAt) {
        entry.count = 0;
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

    const auth = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

    if (!auth) {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                auth:      false,
                url:       null,
                anonKey:   null,
                api_error: null,
                message:   'Supabase credentials missing — set SUPABASE_URL and SUPABASE_ANON_KEY in Netlify environment variables.'
            })
        };
    }

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            auth:      true,
            url:       SUPABASE_URL,
            anonKey:   SUPABASE_ANON_KEY,
            api_error: null,
            message:   'Supabase config loaded from server environment.'
        })
    };
};

// Netlify Functions v2 path alias
export const config = {
    path: '/api/supabase-config'
};
