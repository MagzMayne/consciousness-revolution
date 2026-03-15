// auth-me.mjs - Consciousness Revolution
// ════════════════════════════════════════════════════════════════
// Verifies the current user session via the HttpOnly access_token
// cookie and returns the authenticated user's profile.
//
// GET /api/auth-me  → { success, user } or { success: false }
// ════════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js';
import {
    getSecureCORSHeaders,
    handlePreflight,
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

/**
 * Parse cookies from the Cookie request header.
 */
function parseCookies(cookieHeader) {
    if (!cookieHeader) return {};
    return Object.fromEntries(
        cookieHeader.split(';').map(cookie => {
            const [k, ...v] = cookie.trim().split('=');
            return [k.trim(), v.join('=')];
        })
    );
}

export async function handler(event, context) {
    const origin = event.headers.origin || event.headers.Origin || '';

    if (event.httpMethod === 'OPTIONS') {
        return handlePreflight(origin);
    }

    if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
        return errorResponse('Method not allowed', origin, 405);
    }

    try {
        const cookies = parseCookies(event.headers.cookie || event.headers.Cookie || '');
        const accessToken = cookies.access_token;

        if (!accessToken) {
            return {
                statusCode: 401,
                headers: getSecureCORSHeaders(origin),
                body: JSON.stringify({ success: false, error: 'No session' })
            };
        }

        const supabase = getSupabaseAdmin();

        // Verify the token with Supabase
        const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);

        if (userError || !userData?.user) {
            return {
                statusCode: 401,
                headers: getSecureCORSHeaders(origin),
                body: JSON.stringify({ success: false, error: 'Session expired or invalid' })
            };
        }

        const user = userData.user;

        // Fetch the user's foundation profile
        const { data: foundation } = await supabase
            .from('user_foundations')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

        // Fetch the builder network status
        const { data: networkStatus } = await supabase
            .from('builder_network_status')
            .select('contribution_score, contribution_tier')
            .eq('foundation_id', user.id)
            .maybeSingle();

        // Touch last_activity_at in user_sessions (non-blocking)
        supabase
            .from('user_sessions')
            .update({ last_activity_at: new Date().toISOString() })
            .eq('foundation_id', user.id)
            .eq('is_active', true)
            .then(() => {})
            .catch(() => {});

        const profile = {
            id: user.id,
            email: user.email,
            full_name:
                foundation?.full_name ||
                user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                '',
            avatar_url:
                foundation?.avatar_url ||
                user.user_metadata?.avatar_url ||
                user.user_metadata?.picture ||
                null,
            consciousness_level: foundation?.consciousness_level ?? 0.5,
            manipulation_immunity: foundation?.manipulation_immunity ?? 0.3,
            account_tier: foundation?.account_tier || 'free',
            contribution_tier: networkStatus?.contribution_tier || 'GHOST',
            contribution_score: networkStatus?.contribution_score || 0,
            is_admin: foundation?.is_admin || false,
            r3d3_access_enabled: foundation?.r3d3_access_enabled || false
        };

        secureLog('Session verified', { userId: user.id });

        return {
            statusCode: 200,
            headers: getSecureCORSHeaders(origin),
            body: JSON.stringify({ success: true, user: profile })
        };
    } catch (err) {
        secureLog('auth-me error', { error: err.message });
        return errorResponse('Server error', origin, 500);
    }
}
