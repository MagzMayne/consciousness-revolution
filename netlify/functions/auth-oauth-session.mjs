// auth-oauth-session.mjs — Consciousness Revolution
// ════════════════════════════════════════════════════════════════
// Accepts an OAuth access_token + refresh_token (already validated
// by Supabase on the browser side) and sets them as secure HttpOnly
// cookies so the rest of the server-side auth middleware can
// recognise the session identically to a password-based login.
//
// POST /api/auth-oauth-session
// Body: { access_token, refresh_token, expires_at }
// ════════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js';
import {
    getSecureCORSHeaders,
    handlePreflight,
    checkRateLimit,
    anonymizeIP,
    secureLog,
    errorResponse
} from './utils/security.mjs';

function getSupabaseAdmin() {
    const url = process.env.SUPABASE_URL;
    const key =
        process.env.SUPABASE_ANON_KEY ||
        process.env.SUPABASE_SERVICE_ROLE_SECRET ||
        process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) throw new Error('Supabase configuration missing');
    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
}

export async function handler(event) {
    const origin = event.headers?.origin || event.headers?.Origin || '';

    if (event.httpMethod === 'OPTIONS') return handlePreflight(origin);

    if (event.httpMethod !== 'POST') {
        return errorResponse('Method not allowed', origin, 405);
    }

    // Rate-limit: 20 calls / hour per IP (generous for OAuth redirects)
    const clientIP = (event.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
    const rateCheck = checkRateLimit(`oauth_session_${anonymizeIP(clientIP)}`, 20, 3_600_000);
    if (!rateCheck.allowed) {
        return errorResponse('Too many requests. Please try again later.', origin, 429);
    }

    let access_token, refresh_token, expires_at;
    try {
        ({ access_token, refresh_token, expires_at } = JSON.parse(event.body || '{}'));
    } catch {
        return errorResponse('Invalid request body', origin, 400);
    }

    if (!access_token || typeof access_token !== 'string') {
        return errorResponse('access_token is required', origin, 400);
    }

    try {
        const supabase = getSupabaseAdmin();

        // Verify the token is valid by fetching the user
        const { data: userData, error: userError } = await supabase.auth.getUser(access_token);
        if (userError || !userData?.user) {
            secureLog('OAuth session: invalid token', { error: userError?.message });
            return errorResponse('Invalid or expired token', origin, 401);
        }

        const user = userData.user;

        // Ensure a foundation record exists (create if missing, e.g. first OAuth login)
        const { data: existing } = await supabase
            .from('user_foundations')
            .select('user_id')
            .eq('user_id', user.id)
            .maybeSingle();

        if (!existing) {
            const displayName =
                user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                user.user_metadata?.user_name ||
                '';

            await supabase.from('user_foundations').insert({
                user_id: user.id,
                email: user.email,
                full_name: displayName,
                consciousness_level: 0.5,
                manipulation_immunity: 0.3,
                truth_recognition: 0.3,
                pattern_recognition: 0.3,
                account_tier: 'free',
                account_status: 'active'
            }).then(() => {}).catch(() => {});

            await supabase.from('builder_network_status').insert({
                foundation_id: user.id,
                contribution_score: 10,
                contribution_tier: 'SEEDLING'
            }).then(() => {}).catch(() => {});

            await supabase.from('araya_accounts').insert({
                id: user.id,
                foundation_id: user.id,
                email: user.email,
                tier: 'flow',
                energy_balance: 100,
                monthly_allocation: 100,
                subscription_status: 'free'
            }).then(() => {}).catch(() => {});
        }

        // Audit log (non-blocking)
        supabase.from('audit_log').insert({
            foundation_id: user.id,
            event_type: 'user_login',
            event_category: 'auth',
            action: 'oauth_login',
            ip_address: clientIP,
            user_agent: event.headers['user-agent'],
            metadata: { method: 'oauth', provider: user.app_metadata?.provider || 'unknown' }
        }).then(() => {}).catch(() => {});

        secureLog('OAuth session created', { userId: user.id });

        // Set HttpOnly cookies — same pattern as auth-login.mjs
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieDomain = isProduction ? '.conciousnessrevolution.io' : '';
        const accessTokenMaxAge  = 3_600;    // 1 hour
        const refreshTokenMaxAge = 604_800;  // 7 days

        const cookies = [
            `access_token=${access_token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${accessTokenMaxAge}${cookieDomain ? `; Domain=${cookieDomain}` : ''}`,
            `refresh_token=${refresh_token || ''}; HttpOnly; Secure; SameSite=Lax; Path=/api/auth; Max-Age=${refreshTokenMaxAge}${cookieDomain ? `; Domain=${cookieDomain}` : ''}`,
            `session_expires=${expires_at || ''}; Secure; SameSite=Lax; Path=/; Max-Age=${accessTokenMaxAge}${cookieDomain ? `; Domain=${cookieDomain}` : ''}`
        ];

        const headers = getSecureCORSHeaders(origin);
        headers['Set-Cookie'] = cookies.join(', ');

        // Fetch foundation for profile
        const { data: foundation } = await supabase
            .from('user_foundations')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

        const { data: networkStatus } = await supabase
            .from('builder_network_status')
            .select('contribution_score, contribution_tier')
            .eq('foundation_id', user.id)
            .maybeSingle();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Session established',
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: foundation?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || '',
                    avatar_url: foundation?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
                    account_tier: foundation?.account_tier || 'free',
                    contribution_tier: networkStatus?.contribution_tier || 'SEEDLING',
                    contribution_score: networkStatus?.contribution_score || 10,
                    is_admin: foundation?.is_admin || false
                }
            })
        };
    } catch (err) {
        secureLog('auth-oauth-session error', { error: err.message });
        return errorResponse('Server error. Please try again.', origin, 500);
    }
}
