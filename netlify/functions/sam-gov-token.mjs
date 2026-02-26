// sam-gov-token.mjs — Secure SAM.gov API key relay
// ──────────────────────────────────────────────────
// Reads SAM_API_KEY from the Netlify environment (a repository secret) and
// returns it to browser clients so they can call the SAM.gov API without
// manual key entry.
//
// Security guarantees:
//   • Key is NEVER committed to the repo.
//   • Key is NEVER logged.
//   • Key is served only over HTTPS (Netlify enforces TLS).
//   • CORS origin is restricted to the allowed list.
//   • Simple rate-limiting (10 req / minute per IP) via in-memory map.
//
// Client usage:
//   const res  = await fetch('/api/sam-gov-token');
//   const data = await res.json();
//   // data → { auth: true, token: "xxxxxxxx-…" }  — store in memory, NOT localStorage
//   // data → { auth: false, token: null }          — show actionable config message

const SAM_API_KEY = process.env.SAM_API_KEY || null;

// Allowed browser origins (matches github-token.mjs pattern)
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
const RATE_LIMIT_MAX = 10;           // requests
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute

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
    const origin = event.headers?.origin || event.headers?.Origin || '';
    const corsOrigin = getCorsOrigin(origin);

    const headers = {
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
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

    const auth = Boolean(SAM_API_KEY);

    if (!auth) {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                auth: false,
                token: null,
                api_error: null,
                message: 'Server secret missing or invalid — check repository secrets configuration (SAM_API_KEY).'
            })
        };
    }

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            auth: true,
            token: SAM_API_KEY,
            api_error: null,
            message: 'Token loaded from server secret.'
        })
    };
};

// Netlify Functions v2 path alias
export const config = {
    path: '/api/sam-gov-token'
};
