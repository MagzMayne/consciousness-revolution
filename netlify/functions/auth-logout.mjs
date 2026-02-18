// Auth Logout Function
// Securely clears httpOnly cookies and invalidates session
// Created: 2026-02-18 (Security Phase 3)

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
    const key = process.env.SUPABASE_SERVICE_ROLE_SECRET || process.env.SUPABASE_SERVICE_KEY;

    if (!url || !key) {
        throw new Error('Supabase configuration missing');
    }
    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
}

/**
 * Parse cookies from request headers
 */
function parseCookies(cookieHeader) {
    if (!cookieHeader) return {};
    return Object.fromEntries(
        cookieHeader.split(';').map(cookie => {
            const [key, ...val] = cookie.trim().split('=');
            return [key, val.join('=')];
        })
    );
}

export async function handler(event, context) {
    const origin = event.headers.origin || event.headers.Origin || '';

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return handlePreflight(origin);
    }

    // Accept both POST and DELETE for logout
    if (event.httpMethod !== 'POST' && event.httpMethod !== 'DELETE') {
        return errorResponse('Method not allowed', origin, 405);
    }

    try {
        const clientIP = event.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
        const cookies = parseCookies(event.headers.cookie);
        const accessToken = cookies.access_token;

        // If we have a token, try to invalidate the session in Supabase
        if (accessToken) {
            const supabase = getSupabaseAdmin();

            // Get user from token to log the logout
            const { data: userData } = await supabase.auth.getUser(accessToken);

            if (userData?.user) {
                // Mark all sessions for this user as inactive
                await supabase
                    .from('user_sessions')
                    .update({
                        is_active: false,
                        ended_at: new Date().toISOString()
                    })
                    .eq('foundation_id', userData.user.id)
                    .catch(() => {}); // Non-blocking

                // Log the logout event
                await supabase.from('audit_log').insert({
                    foundation_id: userData.user.id,
                    event_type: 'user_logout',
                    event_category: 'auth',
                    action: 'logout',
                    ip_address: clientIP,
                    user_agent: event.headers['user-agent'],
                    metadata: { method: 'explicit' }
                }).catch(() => {}); // Non-blocking

                // Sign out from Supabase Auth
                await supabase.auth.admin.signOut(accessToken).catch(() => {});

                secureLog('User logout', {
                    userId: userData.user.id,
                    ip: anonymizeIP(clientIP)
                });
            }
        }

        // Clear all auth cookies with proper security settings
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieDomain = isProduction ? '.conciousnessrevolution.io' : '';

        // Set cookies to empty with immediate expiration
        const clearCookies = [
            `access_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0${cookieDomain ? `; Domain=${cookieDomain}` : ''}`,
            `refresh_token=; HttpOnly; Secure; SameSite=Strict; Path=/api/auth; Max-Age=0${cookieDomain ? `; Domain=${cookieDomain}` : ''}`,
            `session_expires=; Secure; SameSite=Strict; Path=/; Max-Age=0${cookieDomain ? `; Domain=${cookieDomain}` : ''}`
        ];

        const headers = getSecureCORSHeaders(origin);
        headers['Set-Cookie'] = clearCookies.join(', ');
        // Also set Clear-Site-Data for complete cleanup
        headers['Clear-Site-Data'] = '"cookies"';

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Logged out successfully'
            })
        };

    } catch (error) {
        secureLog('Logout error', { error: error.message });

        // Even on error, clear cookies
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieDomain = isProduction ? '.conciousnessrevolution.io' : '';

        const clearCookies = [
            `access_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0${cookieDomain ? `; Domain=${cookieDomain}` : ''}`,
            `refresh_token=; HttpOnly; Secure; SameSite=Strict; Path=/api/auth; Max-Age=0${cookieDomain ? `; Domain=${cookieDomain}` : ''}`,
            `session_expires=; Secure; SameSite=Strict; Path=/; Max-Age=0${cookieDomain ? `; Domain=${cookieDomain}` : ''}`
        ];

        const headers = getSecureCORSHeaders(origin);
        headers['Set-Cookie'] = clearCookies.join(', ');

        return {
            statusCode: 200, // Return 200 even on error - logout should "succeed"
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Logged out successfully'
            })
        };
    }
}
