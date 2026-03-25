// db.mjs — Netlify DB (Neon) query endpoint
// ─────────────────────────────────────────
// Provides a secure server-side database interface powered by the Netlify DB
// (Neon PostgreSQL) provisioned for this project.  The connection string is
// read automatically from the NETLIFY_DATABASE_URL environment variable by
// the @netlify/neon package — it is never exposed to the browser.
//
// Security guarantees:
//   • Database credentials are NEVER exposed to the browser.
//   • All queries are parameterised (no SQL injection).
//   • CORS origin is restricted to the allowed list.
//   • Simple rate-limiting (10 req / minute per IP) via in-memory map.
//   • Only explicitly whitelisted query actions are accepted.
//
// Endpoint: /.netlify/functions/db  (or /api/db via redirect)
//
// Supported GET actions (via ?action=<name>):
//   status   — database connectivity check and server version
//
// Supported POST actions (JSON body { action, params }):
//   query    — run a whitelisted read-only query by name

import { neon } from '@netlify/neon';

// Allowed browser origins (matches github-token.mjs / sam-gov-token.mjs)
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

// Check whether the database URL is configured, and create a single shared
// client instance that is reused across all handler invocations within the
// same function instance lifetime (warm starts).
const DB_CONFIGURED = Boolean(process.env.NETLIFY_DATABASE_URL);
const sql = DB_CONFIGURED ? neon() : null;

// ─── GET /api/db?action=status ────────────────────────────────────────────────
async function handleStatus() {
    if (!sql) {
        return {
            connected: false,
            db_error: 'NETLIFY_DATABASE_URL is not set — check Netlify DB configuration.'
        };
    }
    try {
        const [row] = await sql`SELECT version() AS server_version, NOW() AS server_time`;
        return {
            connected: true,
            server_version: row.server_version,
            server_time: row.server_time,
            db_error: null
        };
    } catch (err) {
        return {
            connected: false,
            db_error: err.message || 'Database connection failed.'
        };
    }
}

// ─── POST /api/db — whitelisted named queries ─────────────────────────────────
// Only read-only queries may be executed via this endpoint.  Any queries that
// mutate data must be implemented as dedicated, purpose-specific functions.
const WHITELISTED_QUERIES = {
    server_info: async () => {
        const [row] = await sql`SELECT version() AS server_version, current_database() AS db_name, NOW() AS ts`;
        return row;
    },
    table_list: async () => {
        const rows = await sql`
            SELECT table_name, table_type
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        `;
        return rows;
    }
};

async function handleQuery(action) {
    if (!sql) {
        return {
            statusCode: 503,
            body: JSON.stringify({
                success: false,
                db_error: 'NETLIFY_DATABASE_URL is not set — check Netlify DB configuration.',
                data: null
            })
        };
    }

    const queryFn = WHITELISTED_QUERIES[action];
    if (!queryFn) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                success: false,
                db_error: `Unknown query action: "${action}". Allowed: ${Object.keys(WHITELISTED_QUERIES).join(', ')}`,
                data: null
            })
        };
    }

    try {
        const data = await queryFn();
        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, data, db_error: null })
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                db_error: err.message || 'Query failed.',
                data: null
            })
        };
    }
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export const handler = async (event) => {
    const origin = event.headers?.origin || event.headers?.Origin || '';
    const corsOrigin = getCorsOrigin(origin);

    const headers = {
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
    };

    // CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
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

    // ── GET ?action=status ────────────────────────────────────────────────────
    if (event.httpMethod === 'GET') {
        const action = event.queryStringParameters?.action || 'status';

        if (action === 'status') {
            const result = await handleStatus();
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    auth: DB_CONFIGURED,
                    api_error: null,
                    ...result
                })
            };
        }

        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: `Unknown GET action: "${action}". Try ?action=status` })
        };
    }

    // ── POST { action } ───────────────────────────────────────────────────────
    if (event.httpMethod === 'POST') {
        let body;
        try {
            body = JSON.parse(event.body || '{}');
        } catch {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid JSON body' })
            };
        }

        const { action } = body;
        if (!action) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required field: action' })
            };
        }

        const result = await handleQuery(action);
        return { ...result, headers };
    }

    return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
    };
};

export const config = {
    path: '/api/db'
};
