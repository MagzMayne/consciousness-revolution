// auth-request-reset.mjs - Consciousness Revolution
// Sends a Supabase password-reset email to the requested address.
//
// Endpoint: POST /.netlify/functions/auth-request-reset
//           (also reachable via /api/auth-request-reset)
//
// Request body: { "email": "user@example.com" }
// Response:     { "ok": true }  or  { "error": "..." }
//
// Environment variables required:
//   SUPABASE_URL                                — Supabase project URL
//   SUPABASE_ANON_KEY | SUPABASE_SERVICE_ROLE_SECRET | SUPABASE_SERVICE_KEY

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

    if (!url || !key) {
        throw new Error('Supabase configuration missing');
    }
    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
}

export async function handler(event, context) {
    const origin = event.headers.origin || event.headers.Origin || '';

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return handlePreflight(origin);
    }

    // Only accept POST
    if (event.httpMethod !== 'POST') {
        return errorResponse('Method not allowed', origin, 405);
    }

    // Rate limiting — 5 reset requests per hour per IP
    const clientIP = event.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    const rateLimitCheck = checkRateLimit(`reset_${anonymizeIP(clientIP)}`, 5, 3600000);

    if (!rateLimitCheck.allowed) {
        secureLog('Password reset rate limit exceeded', { ip: anonymizeIP(clientIP) });
        return errorResponse(
            'Too many password reset requests. Please try again later.',
            origin,
            429
        );
    }

    try {
        const { email } = JSON.parse(event.body || '{}');

        // Input validation
        const validation = validateInput({ email }, {
            email: { type: 'email', required: true }
        });

        if (!validation.valid) {
            return errorResponse('A valid email address is required.', origin, 400);
        }

        const supabase = getSupabaseAdmin();

        // Send the password-reset email via Supabase Auth
        const { error } = await supabase.auth.resetPasswordForEmail(
            validation.sanitized.email,
            { redirectTo: 'https://conciousnessrevolution.io/reset-password.html' }
        );

        if (error) {
            secureLog('Password reset error', { error: error.message });
            return errorResponse('Failed to send reset email. Please try again.', origin, 400);
        }

        secureLog('Password reset email sent', { email: validation.sanitized.email });

        // Always return success — do not reveal whether the email exists
        return successResponse(
            { ok: true, message: 'Check your email for reset instructions.' },
            origin,
            200
        );

    } catch (err) {
        secureLog('auth-request-reset error', { error: err.message });
        return errorResponse('Server error. Please try again.', origin, 500);
    }
}
