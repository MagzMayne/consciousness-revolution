/**
 * auth-login.mjs - Consciousness Revolution
 * ═══════════════════════════════════════════════════════════════════════════
 * Copyright (c) 2024-2026 Consciousness Revolution / Overkill Kulture LLC
 * All Rights Reserved. PROPRIETARY AND CONFIDENTIAL.
 *
 * This source code is protected intellectual property. Unauthorized copying,
 * modification, distribution, or use is strictly prohibited without explicit
 * written permission from the copyright holder.
 *
 * IP Classification: TIER 2 - PROTECTED
 * Contact: darrickpreble@proton.me
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Auth Login Function
// Authenticates user via Supabase Auth and returns session
// Created: 2026-01-10
// Updated: 2026-02-16 - Added zero trust security controls

import crypto from 'crypto';
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
    const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_SECRET || process.env.SUPABASE_SERVICE_KEY;

    if (!url || !key) {
        throw new Error('Supabase configuration missing');
    }
    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
}

export async function handler(event, context) {
    const origin = event.headers.origin || event.headers.Origin || '';

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return handlePreflight(origin);
    }

    // Only accept POST
    if (event.httpMethod !== 'POST') {
        return errorResponse('Method not allowed', origin, 405);
    }

    try {
        // Rate limiting - 10 login attempts per hour per IP
        const clientIP = event.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
        const rateLimitCheck = checkRateLimit(`login_${anonymizeIP(clientIP)}`, 10, 3600000);

        if (!rateLimitCheck.allowed) {
            secureLog('Login rate limit exceeded', { ip: anonymizeIP(clientIP) });

            // Log security event for potential brute force (non-blocking)
            try {
                const supabase = getSupabaseAdmin();
                await supabase.from('security_events').insert({
                    event_type: 'rate_limit_exceeded',
                    severity: 'medium',
                    ip_address_anonymized: anonymizeIP(clientIP),
                    description: 'Login rate limit exceeded',
                    metadata: { endpoint: 'auth-login' }
                });
            } catch (e) {
                // Non-blocking - don't fail if security logging fails
            }

            return errorResponse(
                'Too many login attempts. Please try again later.',
                origin,
                429
            );
        }

        const { email, password } = JSON.parse(event.body || '{}');

        // Input validation using security utility
        const validation = validateInput({ email, password }, {
            email: {
                type: 'email',
                required: true
            },
            password: {
                type: 'string',
                required: true,
                minLength: 1, // Don't reveal password requirements on login
                maxLength: 128
            }
        });

        if (!validation.valid) {
            return errorResponse('Invalid email or password', origin, 401);
        }

        const supabase = getSupabaseAdmin();

        // Attempt login via Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email: validation.sanitized.email,
            password: validation.sanitized.password
        });

        if (error) {
            secureLog('Login failed', {
                email: validation.sanitized.email,
                error: error.message
            });

            // Log failed login attempt (non-blocking)
            try {
                await supabase.from('security_events').insert({
                    event_type: 'failed_login',
                    severity: 'low',
                    ip_address_anonymized: anonymizeIP(clientIP),
                    description: 'Invalid credentials',
                    metadata: { email: validation.sanitized.email }
                });
            } catch (e) {
                // Non-blocking - don't fail if security logging fails
            }

            // Return generic error to prevent user enumeration
            return errorResponse('Invalid email or password', origin, 401);
        }

        if (!data?.session) {
            return errorResponse('Login failed. Please try again.', origin, 401);
        }

        // Create/update session tracking
        // Generate cryptographically secure session ID
        const sessionId = crypto.createHmac('sha256', process.env.ANONYMIZATION_SALT || 'session-salt')
            .update(data.session.access_token)
            .update(crypto.randomBytes(32).toString('hex'))
            .digest('hex')
            .substring(0, 32);
        
        // Session insert (non-blocking)
        try {
            await supabase.from('user_sessions').insert({
                foundation_id: data.user.id,
                session_token: sessionId,
                device_type: event.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop',
                ip_address: clientIP,
                user_agent: event.headers['user-agent'],
                is_active: true,
                started_at: new Date().toISOString(),
                last_activity_at: new Date().toISOString()
            });
        } catch (e) {
            // Non-blocking
        }

        // Log successful login in audit log (non-blocking)
        try {
            await supabase.from('audit_log').insert({
                foundation_id: data.user.id,
                event_type: 'user_login',
                event_category: 'auth',
                action: 'login',
                ip_address: clientIP,
                user_agent: event.headers['user-agent'],
                metadata: { method: 'password' }
            });
        } catch (e) {
            // Non-blocking
        }

        // Get user's foundation data
        const { data: foundation } = await supabase
            .from('user_foundations')
            .select('*')
            .eq('user_id', data.user.id)
            .single();

        // Get user's network status
        const { data: networkStatus } = await supabase
            .from('builder_network_status')
            .select('contribution_score, contribution_tier')
            .eq('foundation_id', data.user.id)
            .single();

        secureLog('Successful login', {
            userId: data.user.id,
            email: validation.sanitized.email
        });

        // Security: Set tokens as httpOnly cookies instead of response body
        // This prevents XSS attacks from stealing tokens
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieDomain = isProduction ? '.conciousnessrevolution.io' : '';
        const accessTokenMaxAge = 3600; // 1 hour
        const refreshTokenMaxAge = 604800; // 7 days

        const cookies = [
            `access_token=${data.session.access_token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${accessTokenMaxAge}${cookieDomain ? `; Domain=${cookieDomain}` : ''}`,
            `refresh_token=${data.session.refresh_token}; HttpOnly; Secure; SameSite=Strict; Path=/api/auth; Max-Age=${refreshTokenMaxAge}${cookieDomain ? `; Domain=${cookieDomain}` : ''}`,
            `session_expires=${data.session.expires_at}; Secure; SameSite=Strict; Path=/; Max-Age=${accessTokenMaxAge}${cookieDomain ? `; Domain=${cookieDomain}` : ''}`
        ];

        const headers = getSecureCORSHeaders(origin);
        // Set multiple cookies
        headers['Set-Cookie'] = cookies.join(', ');

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Login successful!',
                // NO tokens in response body - they're in httpOnly cookies
                user: {
                    id: data.user.id,
                    email: data.user.email,
                    full_name: foundation?.full_name || data.user.user_metadata?.full_name || '',
                    consciousness_level: foundation?.consciousness_level || 0.5,
                    manipulation_immunity: foundation?.manipulation_immunity || 0.3,
                    account_tier: foundation?.account_tier || 'free',
                    contribution_tier: networkStatus?.contribution_tier || 'GHOST',
                    contribution_score: networkStatus?.contribution_score || 0,
                    is_admin: foundation?.is_admin || false,
                    r3d3_access_enabled: foundation?.r3d3_access_enabled || false
                }
            })
        };

    } catch (error) {
        secureLog('Login error', { error: error.message });
        return errorResponse('Server error. Please try again.', origin, 500);
    }
}
