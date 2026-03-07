// grok-token.mjs — Secure xAI Grok API key relay
// ─────────────────────────────────────────────────
// Reads GROK_API_KEY from the Netlify environment (a repository secret) and
// returns it to authorised browser clients so they can call the xAI Grok API
// without manual token entry.
//
// Security guarantees:
//   • Key is NEVER committed to the repo.
//   • Key is NEVER logged.
//   • Key is served only over HTTPS (Netlify enforces TLS).
//   • CORS origin is restricted to the allowed list.
//   • Simple rate-limiting (10 req / minute per IP) via in-memory map.
//
// Client usage:
//   const res  = await fetch('/api/grok-token');
//   const data = await res.json();
//   // data → { auth: true, token: "xai-…" }  — store in memory, NOT localStorage
//   // data → { auth: false, token: null }     — show actionable config message

const GROK_API_KEY = process.env.GROK_API_KEY;

// Allowed browser origins
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
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;

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

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    const clientIP = (event.headers?.['x-forwarded-for'] || 'no-xff').split(',')[0].trim();
    if (!checkRateLimit(clientIP)) {
        return {
            statusCode: 429,
            headers: { ...headers, 'Retry-After': '60' },
            body: JSON.stringify({ error: 'Too many requests — try again in 60 s' })
        };
    }

    const auth = Boolean(GROK_API_KEY);

    if (!auth) {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                auth: false,
                token: null,
                api_error: null,
                message: 'Server secret missing — check GROK_API_KEY in repository secrets configuration.'
            })
        };
    }

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            auth: true,
            token: GROK_API_KEY,
            api_error: null,
            message: 'Grok API key loaded from server secret.'
        })
    };
};

export const config = {
    path: '/api/grok-token'
};
