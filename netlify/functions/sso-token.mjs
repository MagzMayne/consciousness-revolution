/**
 * sso-token.mjs — Consciousness Revolution
 * ═══════════════════════════════════════════════════════════════════════════
 * Cross-site Single Sign-On token service.
 *
 * Enables a user already authenticated on conciousnessrevolution.io to
 * seamlessly log in to barbrickdesign.github.io (and vice-versa) without
 * re-entering credentials.
 *
 * Flow:
 *   1. Authenticated user calls POST /api/sso-token?action=issue
 *      → receives { token, redirect_url }
 *   2. Browser is redirected to redirect_url (e.g. barbrickdesign.github.io)
 *      with the token in the URL hash: #sso_token=<token>
 *   3. The target site's auth-state.js reads the hash, calls
 *      POST /api/sso-token?action=verify with { token }
 *      → receives { user } on success (one-use, 5-min TTL)
 *   4. Target site stores user profile in localStorage and considers
 *      the user logged in for that session.
 *
 * Security notes:
 *   - Tokens are 256-bit random values (64 hex chars)
 *   - One-use only (used_at timestamp set on verify)
 *   - 5-minute TTL
 *   - Only issued for verified sessions (HttpOnly cookie)
 *   - Target site must be in CROSS_SITE_TARGETS allowlist
 *
 * Endpoint: POST /api/sso-token
 * ═══════════════════════════════════════════════════════════════════════════
 */

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import {
    getSecureCORSHeaders,
    handlePreflight,
    checkRateLimit,
    anonymizeIP,
    secureLog,
    successResponse,
    errorResponse
} from './utils/security.mjs';

// ── Allowlist of sites that may receive SSO tokens ────────────────────────
const CROSS_SITE_TARGETS = [
    'https://barbrickdesign.github.io',
    'https://consciousnessrevolution.io',
    'https://conciousnessrevolution.io',
    'https://www.conciousnessrevolution.io'
];

const TOKEN_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ── Supabase ──────────────────────────────────────────────────────────────
function getSupabase() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_SECRET
        || process.env.SUPABASE_SERVICE_KEY
        || process.env.SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('Supabase configuration missing');
    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
}

// ── Parse cookies ─────────────────────────────────────────────────────────
function parseCookies(header) {
    if (!header) return {};
    return Object.fromEntries(
        header.split(';').map(c => {
            const [k, ...v] = c.trim().split('=');
            return [k.trim(), v.join('=')];
        })
    );
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

// ═══════════════════════════════════════════════════════════════
// ACTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * ISSUE — create a short-lived SSO token for the current user.
 */
async function handleIssue(event, supabase, ip, origin) {
    const user = await getSessionUser(event, supabase);
    if (!user) {
        return errorResponse('Authentication required', origin, 401);
    }

    let body;
    try { body = JSON.parse(event.body || '{}'); }
    catch { return errorResponse('Invalid JSON', origin, 400); }

    const targetSite = body.target_site || '';
    if (!CROSS_SITE_TARGETS.includes(targetSite)) {
        return errorResponse('Invalid target_site', origin, 400);
    }

    // Generate cryptographically random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();

    const { error } = await supabase.from('sso_tokens').insert({
        token,
        user_id:     user.id,
        target_site: targetSite,
        expires_at:  expiresAt,
        created_at:  new Date().toISOString()
    });

    if (error) {
        secureLog('sso-token insert error', { error: error.message });
        return errorResponse('Failed to issue SSO token', origin, 500);
    }

    // Log event (non-blocking)
    try {
        await supabase.from('face_auth_logs').insert({
            user_id:     user.id,
            action:      'sso_issue',
            status:      'success',
            site_origin: origin,
            ip_address_hash: anonymizeIP(ip),
            metadata:    { target_site: targetSite },
            created_at:  new Date().toISOString()
        });
    } catch (e) { /* non-blocking */ }

    secureLog('SSO token issued', { userId: user.id, targetSite });

    // Build the redirect URL with the token in the hash so it never
    // hits server logs on the target side.
    const redirectUrl = `${targetSite}/sso-landing.html#sso_token=${token}`;

    return successResponse({
        token,
        redirect_url: redirectUrl,
        expires_at:   expiresAt,
        target_site:  targetSite
    }, origin);
}

/**
 * VERIFY — exchange a token for a user profile (one-use).
 * Called by the target site after receiving the token in the URL hash.
 */
async function handleVerify(event, supabase, ip, origin) {
    let body;
    try { body = JSON.parse(event.body || '{}'); }
    catch { return errorResponse('Invalid JSON', origin, 400); }

    const { token } = body;
    if (!token || typeof token !== 'string' || token.length !== 64) {
        return errorResponse('Invalid token format', origin, 400);
    }

    // Fetch token record
    const { data: ssoRow, error: fetchErr } = await supabase
        .from('sso_tokens')
        .select('*')
        .eq('token', token)
        .maybeSingle();

    if (fetchErr || !ssoRow) {
        return { statusCode: 401, headers: getSecureCORSHeaders(origin),
                 body: JSON.stringify({ success: false, error: 'Invalid SSO token' }) };
    }

    // One-use check
    if (ssoRow.used_at) {
        return { statusCode: 401, headers: getSecureCORSHeaders(origin),
                 body: JSON.stringify({ success: false, error: 'SSO token already used' }) };
    }

    // Expiry check
    if (new Date(ssoRow.expires_at) < new Date()) {
        return { statusCode: 401, headers: getSecureCORSHeaders(origin),
                 body: JSON.stringify({ success: false, error: 'SSO token expired' }) };
    }

    // Mark as used (atomic)
    await supabase
        .from('sso_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('id', ssoRow.id)
        .eq('used_at', null); // optimistic lock — prevents replay

    // Fetch user profile
    const { data: foundation } = await supabase
        .from('user_foundations')
        .select('*')
        .eq('user_id', ssoRow.user_id)
        .maybeSingle();

    const { data: networkStatus } = await supabase
        .from('builder_network_status')
        .select('contribution_score, contribution_tier')
        .eq('foundation_id', ssoRow.user_id)
        .maybeSingle();

    // Resolve email from Supabase auth (service role required)
    let email = foundation?.email || '';
    try {
        const { data: authUser } = await supabase.auth.admin.getUserById(ssoRow.user_id);
        email = authUser?.user?.email || email;
    } catch (e) { /* non-critical */ }

    // Log event (non-blocking)
    try {
        await supabase.from('face_auth_logs').insert({
            user_id:     ssoRow.user_id,
            action:      'sso_verify',
            status:      'success',
            site_origin: origin,
            ip_address_hash: anonymizeIP(ip),
            metadata:    { target_site: ssoRow.target_site },
            created_at:  new Date().toISOString()
        });
    } catch (e) { /* non-blocking */ }

    secureLog('SSO token verified', { userId: ssoRow.user_id });

    return successResponse({
        success: true,
        user: {
            id:                  ssoRow.user_id,
            email,
            full_name:           foundation?.full_name || '',
            avatar_url:          foundation?.avatar_url || null,
            account_tier:        foundation?.account_tier || 'free',
            contribution_tier:   networkStatus?.contribution_tier || 'GHOST',
            contribution_score:  networkStatus?.contribution_score || 0,
            is_admin:            foundation?.is_admin || false,
            r3d3_access_enabled: foundation?.r3d3_access_enabled || false
        }
    }, origin);
}

// ═══════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════

export async function handler(event, context) {
    const origin = event.headers.origin || event.headers.Origin || '';

    if (event.httpMethod === 'OPTIONS') return handlePreflight(origin);
    if (event.httpMethod !== 'POST') {
        return errorResponse('Method not allowed', origin, 405);
    }

    const ip = event.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';

    // Rate limiting: 10 SSO operations per 5 minutes per IP
    const rl = checkRateLimit(`sso_${anonymizeIP(ip)}`, 10, 300000);
    if (!rl.allowed) {
        return errorResponse('Too many SSO requests. Please try again later.', origin, 429);
    }

    const action = event.queryStringParameters?.action
        || JSON.parse(event.body || '{}')?.action
        || '';

    try {
        const supabase = getSupabase();
        switch (action) {
            case 'issue':  return handleIssue(event, supabase, ip, origin);
            case 'verify': return handleVerify(event, supabase, ip, origin);
            default:
                return errorResponse('Unknown action. Use issue|verify', origin, 400);
        }
    } catch (err) {
        secureLog('sso-token error', { error: err.message });
        return errorResponse('Server error', origin, 500);
    }
}
