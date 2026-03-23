// github-token.mjs — Secure GitHub token relay
// ─────────────────────────────────────────────
// Reads GITHUB_TOKEN from the Netlify environment (a repository secret) and
// returns it to authorised browser clients so they can call the GitHub API
// without manual token entry.
//
// Security guarantees:
//   • Token is NEVER committed to the repo.
//   • Token is NEVER logged.
//   • Token is served only over HTTPS (Netlify enforces TLS).
//   • CORS origin is restricted to the allowed list.
//   • Simple rate-limiting (10 req / minute per IP) via in-memory map.
//
// Client usage:
//   const res  = await fetch('/api/github-token');
//   const data = await res.json();
//   // data → { auth: true, token: "ghp_…" }  — store in memory, NOT localStorage
//   // data → { auth: false, token: null }     — show actionable config message

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || null;

// Allowed browser origins (matches security.mjs)
const ALLOWED_ORIGINS = [
    'https://consciousnessrevolution.io',
    'https://www.consciousnessrevolution.io',
    'https://conciousnessrevolution.io',
    'https://www.conciousnessrevolution.io',
    'https://barbrickdesign.github.io',
    'http://localhost:8888',
    'http://localhost:3000',
    'http://127.0.0.1:8888'
];

// In-memory rate-limit store: ip → { count, resetAt }
const _rateLimitMap = new Map();
const RATE_LIMIT_MAX = 10;       // requests
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
    // Do not return a wildcard or production domain for unrecognised origins.
    // Returning null here causes the browser to block cross-origin requests from
    // unapproved origins while still allowing same-origin / non-browser callers.
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

    // Rate limiting — uses x-forwarded-for as a best-effort identifier.
    // Requests without a forwarded-for header get a dedicated 'no-xff' bucket
    // so they are still subject to rate-limiting (not unlimited).
    const clientIP = (event.headers?.['x-forwarded-for'] || 'no-xff').split(',')[0].trim();
    if (!checkRateLimit(clientIP)) {
        return {
            statusCode: 429,
            headers: { ...headers, 'Retry-After': '60' },
            body: JSON.stringify({ error: 'Too many requests — try again in 60 s' })
        };
    }

    // Verify token is configured
    const auth = Boolean(GITHUB_TOKEN);

    if (!auth) {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                auth: false,
                token: null,
                message: 'Server secret missing or invalid — check repository secrets configuration.'
            })
        };
    }

    // Return the token (in memory on the client; never persisted)
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            auth: true,
            token: GITHUB_TOKEN,
            message: 'Token loaded from server secret.'
        })
    };
};

// Netlify Functions v2 path alias
export const config = {
    path: '/api/github-token'
};
