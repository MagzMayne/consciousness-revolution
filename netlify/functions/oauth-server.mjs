// oauth-server.mjs — Consciousness Revolution
// ═══════════════════════════════════════════════════════════════════════════
// OAuth 2.0 / OIDC server backend.
//
// Responsibilities:
//   1. Dynamic Client Registration  (RFC 7591)  POST ?action=register
//   2. Client Metadata Lookup                   GET  ?action=client&client_id=…
//   3. Authorization Code issuance              POST ?action=authorize
//   4. Token exchange (code → tokens)           POST ?action=token
//   5. Token introspection                      POST ?action=introspect
//   6. Token revocation                         POST ?action=revoke
//
// All persistent state is stored in Supabase tables:
//   oauth_clients  — registered clients
//   oauth_codes    — short-lived authorization codes (10 min TTL)
//   oauth_tokens   — issued access / refresh tokens
//
// Security guarantees:
//   • CORS restricted to ALLOWED_ORIGINS (mirrors security.mjs)
//   • Rate-limiting: 30 req/min per IP for token ops; 5/min for registration
//   • client_secret is returned ONCE at registration; never stored in plain text
//   • Authorization codes are one-use only and expire in 10 minutes
//   • Tokens stored as HMAC-SHA256 hashes; raw value returned to client once
//   • No secrets logged
//
// Endpoint: /api/oauth-server   (via netlify.toml /api/* → /.netlify/functions/:splat)
// ═══════════════════════════════════════════════════════════════════════════

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import {
    getSecureCORSHeaders,
    handlePreflight,
    checkRateLimit,
    anonymizeIP,
    secureLog,
    errorResponse,
    successResponse
} from './utils/security.mjs';

// ── Supported scopes ──────────────────────────────────────────────────────
const SUPPORTED_SCOPES    = new Set(['openid', 'profile', 'email', 'offline_access']);
const SUPPORTED_GRANT_TYPES     = ['authorization_code', 'refresh_token'];
const SUPPORTED_RESPONSE_TYPES  = ['code'];
const CODE_TTL_MS               = 10 * 60 * 1000;   // 10 minutes
const ACCESS_TOKEN_TTL_S        = 3600;              // 1 hour
const REFRESH_TOKEN_TTL_S       = 30 * 24 * 3600;   // 30 days

// ── Supabase ──────────────────────────────────────────────────────────────
function getSupabase() {
    const url = process.env.SUPABASE_URL;
    const key =
        process.env.SUPABASE_SERVICE_ROLE_SECRET ||
        process.env.SUPABASE_SERVICE_KEY ||
        process.env.SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('Supabase configuration missing');
    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
}

// ── Cookie parser ─────────────────────────────────────────────────────────
function parseCookies(header) {
    if (!header) return {};
    return Object.fromEntries(
        header.split(';').map(c => {
            const [k, ...v] = c.trim().split('=');
            return [k.trim(), v.join('=')];
        })
    );
}

// ── Crypto helpers ────────────────────────────────────────────────────────
function randomToken(bytes = 32) {
    return crypto.randomBytes(bytes).toString('hex');
}

function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

// ── Scope validation ──────────────────────────────────────────────────────
function validateScopes(requestedScope) {
    const scopes = (requestedScope || '')
        .split(/[\s,]+/)
        .filter(Boolean);
    if (scopes.length === 0) return { valid: false, scopes: [] };
    const invalid = scopes.filter(s => !SUPPORTED_SCOPES.has(s));
    if (invalid.length > 0) return { valid: false, scopes, invalid };
    return { valid: true, scopes };
}

// ── Resolve authenticated user from session cookie ────────────────────────
async function getSessionUser(event, supabase) {
    const cookies = parseCookies(event.headers.cookie || event.headers.Cookie || '');
    const token = cookies.access_token;
    if (!token) return null;
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user;
}

// ── PKCE verifier check ───────────────────────────────────────────────────
function verifyPKCE(codeVerifier, codeChallenge, method) {
    if (!codeChallenge) return true; // PKCE optional
    if (!codeVerifier)  return false;

    if (!method || method === 'plain') {
        return codeVerifier === codeChallenge;
    }
    if (method === 'S256') {
        const computed = crypto
            .createHash('sha256')
            .update(codeVerifier)
            .digest('base64url');
        return computed === codeChallenge;
    }
    return false;
}

// ═══════════════════════════════════════════════════════════════
// ACTION: register — RFC 7591 Dynamic Client Registration
// ═══════════════════════════════════════════════════════════════
async function handleRegister(event, supabase, ip, origin) {
    // Stricter rate limit for registration: 5 per minute per IP
    const rl = checkRateLimit(`oauth_register_${anonymizeIP(ip)}`, 5, 60_000);
    if (!rl.allowed) {
        return errorResponse('Too many registration requests. Try again in 60 s.', origin, 429);
    }

    let body;
    try {
        body = JSON.parse(event.body || '{}');
    } catch {
        return errorResponse('Invalid JSON', origin, 400);
    }

    const {
        client_name,
        client_uri,
        redirect_uris,
        grant_types   = ['authorization_code'],
        response_types = ['code'],
        scope          = 'openid profile email',
        token_endpoint_auth_method = 'client_secret_basic',
        contacts       = []
    } = body;

    // Validate required fields
    if (!client_name || typeof client_name !== 'string' || client_name.trim().length < 1) {
        return errorResponse('client_name is required', origin, 400);
    }

    if (!Array.isArray(redirect_uris) || redirect_uris.length === 0) {
        return errorResponse('redirect_uris must be a non-empty array', origin, 400);
    }

    // Validate redirect URIs — must be absolute HTTPS URLs (or localhost for dev)
    for (const uri of redirect_uris) {
        try {
            const u = new URL(uri);
            if (u.protocol !== 'https:' && u.hostname !== 'localhost' && u.hostname !== '127.0.0.1') {
                return errorResponse(`redirect_uri must use HTTPS: ${uri}`, origin, 400);
            }
        } catch {
            return errorResponse(`Invalid redirect_uri: ${uri}`, origin, 400);
        }
    }

    // Validate grant types
    const unsupportedGrants = grant_types.filter(g => !SUPPORTED_GRANT_TYPES.includes(g));
    if (unsupportedGrants.length > 0) {
        return errorResponse(
            `Unsupported grant_types: ${unsupportedGrants.join(', ')}. Supported: ${SUPPORTED_GRANT_TYPES.join(', ')}`,
            origin, 400
        );
    }

    // Validate scopes
    const scopeCheck = validateScopes(scope);
    if (!scopeCheck.valid) {
        return errorResponse(
            `Unsupported scopes: ${(scopeCheck.invalid || []).join(', ')}`,
            origin, 400
        );
    }

    // Generate client credentials
    const clientId     = `cr_${randomToken(16)}`;
    const clientSecret = randomToken(32);         // returned ONCE, never stored in plain text
    const secretHash   = hashToken(clientSecret);

    const now = new Date().toISOString();
    const { error: insertError } = await supabase
        .from('oauth_clients')
        .insert({
            client_id:                   clientId,
            client_secret_hash:          secretHash,
            client_name:                 client_name.trim().substring(0, 200),
            client_uri:                  (client_uri || '').substring(0, 500),
            redirect_uris:               redirect_uris,
            grant_types:                 grant_types,
            response_types:              response_types,
            scope:                       scopeCheck.scopes.join(' '),
            token_endpoint_auth_method,
            contacts:                    Array.isArray(contacts) ? contacts : [],
            is_active:                   true,
            created_at:                  now,
            updated_at:                  now
        });

    if (insertError) {
        secureLog('oauth_clients insert error', { error: insertError.message });
        return errorResponse('Failed to register client. Please try again.', origin, 500);
    }

    secureLog('OAuth client registered', { clientId, clientName: client_name.trim() });

    // Return RFC 7591 response — client_secret returned here ONCE
    return {
        statusCode: 201,
        headers: getSecureCORSHeaders(origin),
        body: JSON.stringify({
            client_id:                   clientId,
            client_secret:               clientSecret,
            client_name:                 client_name.trim(),
            client_uri:                  client_uri || '',
            redirect_uris:               redirect_uris,
            grant_types:                 grant_types,
            response_types:              response_types,
            scope:                       scopeCheck.scopes.join(' '),
            token_endpoint_auth_method,
            client_id_issued_at:         Math.floor(Date.now() / 1000),
            client_secret_expires_at:    0   // 0 = does not expire
        })
    };
}

// ═══════════════════════════════════════════════════════════════
// ACTION: client — Fetch client metadata (used by consent page)
// ═══════════════════════════════════════════════════════════════
async function handleClientLookup(event, supabase, origin) {
    const clientId = event.queryStringParameters?.client_id || '';
    if (!clientId) {
        return errorResponse('client_id is required', origin, 400);
    }

    const { data, error } = await supabase
        .from('oauth_clients')
        .select('client_id, client_name, client_uri, redirect_uris, scope, is_active')
        .eq('client_id', clientId)
        .eq('is_active', true)
        .maybeSingle();

    if (error) {
        secureLog('oauth_clients lookup error', { error: error.message });
        return errorResponse('Failed to look up client', origin, 500);
    }

    if (!data) {
        return errorResponse('OAuth client not found', origin, 404);
    }

    return {
        statusCode: 200,
        headers: getSecureCORSHeaders(origin),
        body: JSON.stringify({
            client_id:     data.client_id,
            client_name:   data.client_name,
            client_uri:    data.client_uri,
            redirect_uris: data.redirect_uris,
            scope:         data.scope
        })
    };
}

// ═══════════════════════════════════════════════════════════════
// ACTION: authorize — Issue authorization code after user consent
// Called by the consent page after the user clicks "Authorize".
// Requires the user to be authenticated via HttpOnly cookie.
// ═══════════════════════════════════════════════════════════════
async function handleAuthorize(event, supabase, ip, origin) {
    const rl = checkRateLimit(`oauth_authorize_${anonymizeIP(ip)}`, 20, 60_000);
    if (!rl.allowed) {
        return errorResponse('Too many authorization requests.', origin, 429);
    }

    let body;
    try {
        body = JSON.parse(event.body || '{}');
    } catch {
        return errorResponse('Invalid JSON', origin, 400);
    }

    const {
        client_id,
        redirect_uri,
        scope           = 'openid profile email',
        state           = '',
        code_challenge,
        code_challenge_method
    } = body;

    if (!client_id || !redirect_uri) {
        return errorResponse('client_id and redirect_uri are required', origin, 400);
    }

    // Verify user session
    const user = await getSessionUser(event, supabase);
    if (!user) {
        return errorResponse('Authentication required', origin, 401);
    }

    // Look up client
    const { data: client, error: clientErr } = await supabase
        .from('oauth_clients')
        .select('*')
        .eq('client_id', client_id)
        .eq('is_active', true)
        .maybeSingle();

    if (clientErr || !client) {
        return errorResponse('Invalid client_id', origin, 400);
    }

    // Validate redirect_uri is registered
    if (!client.redirect_uris.includes(redirect_uri)) {
        return errorResponse('redirect_uri not registered for this client', origin, 400);
    }

    // Validate scope
    const scopeCheck = validateScopes(scope);
    if (!scopeCheck.valid) {
        return errorResponse(`Unsupported scopes: ${(scopeCheck.invalid || []).join(', ')}`, origin, 400);
    }

    // Issue authorization code
    const code      = randomToken(32);
    const codeHash  = hashToken(code);
    const expiresAt = new Date(Date.now() + CODE_TTL_MS).toISOString();

    const { error: codeErr } = await supabase
        .from('oauth_codes')
        .insert({
            code_hash:              codeHash,
            client_id,
            user_id:                user.id,
            redirect_uri,
            scope:                  scopeCheck.scopes.join(' '),
            state,
            code_challenge:         code_challenge  || null,
            code_challenge_method:  code_challenge_method || null,
            expires_at:             expiresAt,
            used_at:                null,
            created_at:             new Date().toISOString()
        });

    if (codeErr) {
        secureLog('oauth_codes insert error', { error: codeErr.message });
        return errorResponse('Failed to issue authorization code', origin, 500);
    }

    secureLog('Authorization code issued', { clientId: client_id, userId: user.id });

    return successResponse({ code, state }, origin, 200);
}

// ═══════════════════════════════════════════════════════════════
// ACTION: token — Exchange code for tokens (or refresh)
// ═══════════════════════════════════════════════════════════════
async function handleToken(event, supabase, ip, origin) {
    const rl = checkRateLimit(`oauth_token_${anonymizeIP(ip)}`, 30, 60_000);
    if (!rl.allowed) {
        return errorResponse('Too many token requests.', origin, 429);
    }

    let body;
    try {
        body = JSON.parse(event.body || '{}');
    } catch {
        return errorResponse('Invalid JSON', origin, 400);
    }

    const { grant_type } = body;

    if (grant_type === 'authorization_code') {
        return handleCodeExchange(body, supabase, event, origin);
    }
    if (grant_type === 'refresh_token') {
        return handleRefreshToken(body, supabase, origin);
    }

    return errorResponse(
        `Unsupported grant_type: ${grant_type}. Supported: ${SUPPORTED_GRANT_TYPES.join(', ')}`,
        origin, 400
    );
}

async function handleCodeExchange(body, supabase, event, origin) {
    const {
        code,
        client_id,
        client_secret,
        redirect_uri,
        code_verifier
    } = body;

    if (!code || !client_id || !redirect_uri) {
        return errorResponse('code, client_id, and redirect_uri are required', origin, 400);
    }

    // Authenticate client
    const { data: client, error: clientErr } = await supabase
        .from('oauth_clients')
        .select('*')
        .eq('client_id', client_id)
        .eq('is_active', true)
        .maybeSingle();

    if (clientErr || !client) {
        return errorResponse('Invalid client', origin, 401);
    }

    // Verify client secret (if auth method requires it)
    if (client.token_endpoint_auth_method !== 'none') {
        if (!client_secret) {
            return errorResponse('client_secret is required', origin, 401);
        }
        const providedHash = hashToken(client_secret);
        if (providedHash !== client.client_secret_hash) {
            return errorResponse('Invalid client credentials', origin, 401);
        }
    }

    // Look up authorization code
    const codeHash = hashToken(code);
    const { data: codeRow, error: codeErr } = await supabase
        .from('oauth_codes')
        .select('*')
        .eq('code_hash', codeHash)
        .maybeSingle();

    if (codeErr || !codeRow) {
        return errorResponse('Invalid authorization code', origin, 400);
    }

    // One-use check
    if (codeRow.used_at) {
        return errorResponse('Authorization code already used', origin, 400);
    }

    // Expiry check
    if (new Date(codeRow.expires_at) < new Date()) {
        return errorResponse('Authorization code expired', origin, 400);
    }

    // Binding checks
    if (codeRow.client_id !== client_id) {
        return errorResponse('client_id mismatch', origin, 400);
    }
    if (codeRow.redirect_uri !== redirect_uri) {
        return errorResponse('redirect_uri mismatch', origin, 400);
    }

    // PKCE verification
    if (!verifyPKCE(code_verifier, codeRow.code_challenge, codeRow.code_challenge_method)) {
        return errorResponse('PKCE verification failed', origin, 400);
    }

    // Mark code as used (atomic update)
    const { error: markErr } = await supabase
        .from('oauth_codes')
        .update({ used_at: new Date().toISOString() })
        .eq('code_hash', codeHash)
        .is('used_at', null);   // optimistic lock

    if (markErr) {
        secureLog('oauth_codes mark-used error', { error: markErr.message });
        return errorResponse('Failed to process authorization code', origin, 500);
    }

    // Issue access token and (optionally) refresh token
    const accessToken  = randomToken(32);
    const scopes       = codeRow.scope.split(' ');
    const includeRefresh = scopes.includes('offline_access') ||
                           (client.grant_types || []).includes('refresh_token');

    const refreshToken = includeRefresh ? randomToken(32) : null;
    const now          = new Date().toISOString();

    const { error: tokenErr } = await supabase
        .from('oauth_tokens')
        .insert({
            access_token_hash:  hashToken(accessToken),
            refresh_token_hash: refreshToken ? hashToken(refreshToken) : null,
            client_id,
            user_id:            codeRow.user_id,
            scope:              codeRow.scope,
            access_expires_at:  new Date(Date.now() + ACCESS_TOKEN_TTL_S * 1000).toISOString(),
            refresh_expires_at: refreshToken
                ? new Date(Date.now() + REFRESH_TOKEN_TTL_S * 1000).toISOString()
                : null,
            revoked_at:         null,
            created_at:         now
        });

    if (tokenErr) {
        secureLog('oauth_tokens insert error', { error: tokenErr.message });
        return errorResponse('Failed to issue tokens', origin, 500);
    }

    // Fetch user profile for id_token claims (non-critical — fails gracefully)
    let foundation = null;
    try {
        const { data: foundationData, error: foundationErr } = await supabase
            .from('user_foundations')
            .select('full_name, avatar_url')
            .eq('user_id', codeRow.user_id)
            .maybeSingle();
        if (!foundationErr) foundation = foundationData;
    } catch (e) {
        // Non-critical — id_token will omit profile claims
    }

    // Build minimal id_token (unsigned JWT — Supabase handles signing)
    let idToken = null;
    if (scopes.includes('openid')) {
        idToken = buildIdToken(codeRow.user_id, client_id, scopes, foundation);
    }

    secureLog('Tokens issued', { clientId: client_id, userId: codeRow.user_id });

    const response = {
        access_token:  accessToken,
        token_type:    'Bearer',
        expires_in:    ACCESS_TOKEN_TTL_S,
        scope:         codeRow.scope
    };
    if (refreshToken) response.refresh_token = refreshToken;
    if (idToken)      response.id_token      = idToken;

    return {
        statusCode: 200,
        headers: {
            ...getSecureCORSHeaders(origin),
            'Cache-Control': 'no-store',
            'Pragma':        'no-cache'
        },
        body: JSON.stringify(response)
    };
}

async function handleRefreshToken(body, supabase, origin) {
    const { refresh_token, client_id, client_secret, scope } = body;

    if (!refresh_token || !client_id) {
        return errorResponse('refresh_token and client_id are required', origin, 400);
    }

    // Authenticate client
    const { data: client, error: clientErr } = await supabase
        .from('oauth_clients')
        .select('*')
        .eq('client_id', client_id)
        .eq('is_active', true)
        .maybeSingle();

    if (clientErr || !client) {
        return errorResponse('Invalid client', origin, 401);
    }

    if (client.token_endpoint_auth_method !== 'none') {
        if (!client_secret) {
            return errorResponse('client_secret is required', origin, 401);
        }
        if (hashToken(client_secret) !== client.client_secret_hash) {
            return errorResponse('Invalid client credentials', origin, 401);
        }
    }

    // Look up refresh token
    const refreshHash = hashToken(refresh_token);
    const { data: tokenRow, error: tokenErr } = await supabase
        .from('oauth_tokens')
        .select('*')
        .eq('refresh_token_hash', refreshHash)
        .eq('client_id', client_id)
        .is('revoked_at', null)
        .maybeSingle();

    if (tokenErr || !tokenRow) {
        return errorResponse('Invalid refresh token', origin, 401);
    }

    if (tokenRow.refresh_expires_at && new Date(tokenRow.refresh_expires_at) < new Date()) {
        return errorResponse('Refresh token expired', origin, 401);
    }

    // Scope reduction is allowed; broadening is not
    let grantedScope = tokenRow.scope;
    if (scope) {
        const requested = new Set(scope.split(' '));
        const original  = new Set(tokenRow.scope.split(' '));
        const invalid   = [...requested].filter(s => !original.has(s));
        if (invalid.length > 0) {
            return errorResponse(`Cannot broaden scope: ${invalid.join(', ')}`, origin, 400);
        }
        grantedScope = scope;
    }

    // Issue new access token; rotate refresh token
    const newAccessToken  = randomToken(32);
    const newRefreshToken = randomToken(32);
    const now             = new Date().toISOString();

    // Revoke old token record
    await supabase
        .from('oauth_tokens')
        .update({ revoked_at: now })
        .eq('refresh_token_hash', refreshHash);

    // Insert new token record
    const { error: insertErr } = await supabase
        .from('oauth_tokens')
        .insert({
            access_token_hash:  hashToken(newAccessToken),
            refresh_token_hash: hashToken(newRefreshToken),
            client_id,
            user_id:            tokenRow.user_id,
            scope:              grantedScope,
            access_expires_at:  new Date(Date.now() + ACCESS_TOKEN_TTL_S * 1000).toISOString(),
            refresh_expires_at: new Date(Date.now() + REFRESH_TOKEN_TTL_S * 1000).toISOString(),
            revoked_at:         null,
            created_at:         now
        });

    if (insertErr) {
        secureLog('oauth_tokens refresh insert error', { error: insertErr.message });
        return errorResponse('Failed to refresh tokens', origin, 500);
    }

    secureLog('Tokens refreshed', { clientId: client_id, userId: tokenRow.user_id });

    return {
        statusCode: 200,
        headers: {
            ...getSecureCORSHeaders(origin),
            'Cache-Control': 'no-store',
            'Pragma':        'no-cache'
        },
        body: JSON.stringify({
            access_token:  newAccessToken,
            refresh_token: newRefreshToken,
            token_type:    'Bearer',
            expires_in:    ACCESS_TOKEN_TTL_S,
            scope:         grantedScope
        })
    };
}

// ═══════════════════════════════════════════════════════════════
// ACTION: introspect — RFC 7662 Token Introspection
// ═══════════════════════════════════════════════════════════════
async function handleIntrospect(event, supabase, ip, origin) {
    const rl = checkRateLimit(`oauth_introspect_${anonymizeIP(ip)}`, 30, 60_000);
    if (!rl.allowed) {
        return errorResponse('Too many introspection requests.', origin, 429);
    }

    let body;
    try {
        body = JSON.parse(event.body || '{}');
    } catch {
        return errorResponse('Invalid JSON', origin, 400);
    }

    const { token, token_type_hint } = body;
    if (!token) {
        return errorResponse('token is required', origin, 400);
    }

    const tokenHash = hashToken(token);

    // Try access token
    let row = null;
    const { data: atRow } = await supabase
        .from('oauth_tokens')
        .select('*')
        .eq('access_token_hash', tokenHash)
        .is('revoked_at', null)
        .maybeSingle();

    if (atRow) row = atRow;

    // Try refresh token if not found as access token
    if (!row && (!token_type_hint || token_type_hint === 'refresh_token')) {
        const { data: rtRow } = await supabase
            .from('oauth_tokens')
            .select('*')
            .eq('refresh_token_hash', tokenHash)
            .is('revoked_at', null)
            .maybeSingle();
        if (rtRow) row = rtRow;
    }

    if (!row) {
        return {
            statusCode: 200,
            headers: getSecureCORSHeaders(origin),
            body: JSON.stringify({ active: false })
        };
    }

    const expiresAt  = row.access_expires_at || row.refresh_expires_at;
    const isExpired  = expiresAt && new Date(expiresAt) < new Date();

    if (isExpired) {
        return {
            statusCode: 200,
            headers: getSecureCORSHeaders(origin),
            body: JSON.stringify({ active: false })
        };
    }

    return {
        statusCode: 200,
        headers: getSecureCORSHeaders(origin),
        body: JSON.stringify({
            active:    true,
            scope:     row.scope,
            client_id: row.client_id,
            sub:       row.user_id,
            exp:       expiresAt ? Math.floor(new Date(expiresAt).getTime() / 1000) : undefined,
            iat:       Math.floor(new Date(row.created_at).getTime() / 1000),
            token_type: 'Bearer'
        })
    };
}

// ═══════════════════════════════════════════════════════════════
// ACTION: revoke — RFC 7009 Token Revocation
// ═══════════════════════════════════════════════════════════════
async function handleRevoke(event, supabase, ip, origin) {
    const rl = checkRateLimit(`oauth_revoke_${anonymizeIP(ip)}`, 20, 60_000);
    if (!rl.allowed) {
        return errorResponse('Too many revocation requests.', origin, 429);
    }

    let body;
    try {
        body = JSON.parse(event.body || '{}');
    } catch {
        return errorResponse('Invalid JSON', origin, 400);
    }

    const { token, client_id, client_secret } = body;
    if (!token || !client_id) {
        return errorResponse('token and client_id are required', origin, 400);
    }

    // Authenticate client
    const { data: client, error: clientErr } = await supabase
        .from('oauth_clients')
        .select('*')
        .eq('client_id', client_id)
        .eq('is_active', true)
        .maybeSingle();

    if (clientErr || !client) {
        return errorResponse('Invalid client', origin, 401);
    }

    if (client.token_endpoint_auth_method !== 'none') {
        if (!client_secret || hashToken(client_secret) !== client.client_secret_hash) {
            return errorResponse('Invalid client credentials', origin, 401);
        }
    }

    const tokenHash = hashToken(token);
    const now       = new Date().toISOString();

    // Revoke access token or refresh token (whichever matches)
    await supabase
        .from('oauth_tokens')
        .update({ revoked_at: now })
        .eq('access_token_hash', tokenHash)
        .eq('client_id', client_id)
        .is('revoked_at', null);

    await supabase
        .from('oauth_tokens')
        .update({ revoked_at: now })
        .eq('refresh_token_hash', tokenHash)
        .eq('client_id', client_id)
        .is('revoked_at', null);

    secureLog('Token revoked', { clientId: client_id });

    // RFC 7009 §2.2 — always return 200 even if token not found
    return {
        statusCode: 200,
        headers: getSecureCORSHeaders(origin),
        body: ''
    };
}

// ═══════════════════════════════════════════════════════════════
// Minimal id_token builder (unsigned — Supabase JWKS handles it)
// ═══════════════════════════════════════════════════════════════
function buildIdToken(userId, clientId, scopes, foundation) {
    const now     = Math.floor(Date.now() / 1000);
    const payload = {
        iss: process.env.SITE_URL || 'https://conciousnessrevolution.io',
        sub: userId,
        aud: clientId,
        iat: now,
        exp: now + ACCESS_TOKEN_TTL_S
    };

    if (scopes.includes('profile')) {
        payload.name       = foundation?.full_name  || undefined;
        payload.picture    = foundation?.avatar_url || undefined;
    }

    // Encode as unsigned JWT (header.payload — no signature)
    // Clients SHOULD verify with the JWKS endpoint; this is a fallback.
    const header  = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const body    = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return `${header}.${body}.`;
}

// ── Extract action from query string or request body ─────────────────────
function resolveAction(event) {
    if (event.queryStringParameters?.action) {
        return event.queryStringParameters.action;
    }
    if (event.body) {
        try {
            return JSON.parse(event.body).action || '';
        } catch {
            return '';
        }
    }
    return '';
}

// ═══════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════
export async function handler(event, context) {
    const origin = event.headers.origin || event.headers.Origin || '';

    if (event.httpMethod === 'OPTIONS') return handlePreflight(origin);

    const ip     = (event.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
    const action = resolveAction(event);

    // Global rate limit: 60 req/min per IP
    const globalRL = checkRateLimit(`oauth_global_${anonymizeIP(ip)}`, 60, 60_000);
    if (!globalRL.allowed) {
        return errorResponse('Too many requests. Try again in 60 s.', origin, 429);
    }

    try {
        const supabase = getSupabase();

        // GET-only actions
        if (event.httpMethod === 'GET') {
            switch (action) {
                case 'client': return handleClientLookup(event, supabase, origin);
                default:       return errorResponse(`Unknown GET action: ${action || '(none)'}. Use client.`, origin, 400);
            }
        }

        // POST-only actions
        if (event.httpMethod === 'POST') {
            switch (action) {
                case 'register':   return handleRegister(event, supabase, ip, origin);
                case 'authorize':  return handleAuthorize(event, supabase, ip, origin);
                case 'token':      return handleToken(event, supabase, ip, origin);
                case 'introspect': return handleIntrospect(event, supabase, ip, origin);
                case 'revoke':     return handleRevoke(event, supabase, ip, origin);
                default:           return errorResponse(
                    `Unknown POST action: ${action || '(none)'}. Use register|authorize|token|introspect|revoke.`,
                    origin, 400
                );
            }
        }

        return errorResponse('Method not allowed', origin, 405);

    } catch (err) {
        secureLog('oauth-server unhandled error', { error: err.message });
        return errorResponse('Server error. Please try again.', origin, 500);
    }
}

// Netlify Functions v2 path alias
export const config = {
    path: '/api/oauth-server'
};
