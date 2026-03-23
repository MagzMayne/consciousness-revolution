// auth-magic-link.mjs — Consciousness Revolution
// ════════════════════════════════════════════════════════════════
// Sends a Supabase magic-link (OTP) email so users can sign in
// without a password.  The redirect URL points at auth-callback.html
// which finalises the session and sets HttpOnly cookies.
//
// POST /api/auth-magic-link
// Body: { "email": "user@example.com" }
// ════════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js';
import {
    getSecureCORSHeaders,
    handlePreflight,
    checkRateLimit,
    validateInput,
    anonymizeIP,
    secureLog,
    successResponse,
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

    // Rate-limit: 5 magic-link requests / 10 min per IP (prevents abuse)
    const clientIP = (event.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
    const rateCheck = checkRateLimit(`magic_link_${anonymizeIP(clientIP)}`, 5, 600_000);
    if (!rateCheck.allowed) {
        return errorResponse('Too many magic-link requests. Please wait before trying again.', origin, 429);
    }

    let email;
    try {
        ({ email } = JSON.parse(event.body || '{}'));
    } catch {
        return errorResponse('Invalid request body', origin, 400);
    }

    const validation = validateInput({ email }, {
        email: { type: 'email', required: true }
    });

    if (!validation.valid) {
        return errorResponse('A valid email address is required.', origin, 400);
    }

    try {
        const supabase = getSupabaseAdmin();

        // Determine the correct base URL for the redirect
        const siteUrl =
            process.env.URL ||                             // Netlify production URL
            process.env.DEPLOY_PRIME_URL ||               // Netlify deploy preview URL
            'https://conciousnessrevolution.io';

        const redirectTo = `${siteUrl}/auth-callback.html`;

        const { error } = await supabase.auth.signInWithOtp({
            email: validation.sanitized.email,
            options: {
                shouldCreateUser: true,   // create account if they don't exist
                emailRedirectTo: redirectTo
            }
        });

        if (error) {
            secureLog('Magic link error', { error: error.message });
            return errorResponse('Failed to send magic link. Please try again.', origin, 400);
        }

        secureLog('Magic link sent', { email: validation.sanitized.email });

        // Always return success — do not reveal whether the email exists
        return successResponse(
            { ok: true, message: 'Magic link sent! Check your email to sign in.' },
            origin,
            200
        );
    } catch (err) {
        secureLog('auth-magic-link error', { error: err.message });
        return errorResponse('Server error. Please try again.', origin, 500);
    }
}
