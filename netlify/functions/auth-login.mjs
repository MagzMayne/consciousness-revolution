// Auth Login Function
// Authenticates user via Supabase Auth and returns session
// Created: 2026-01-10
// Updated: 2026-02-16 - Added zero trust security controls

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
    const key = process.env.SUPABASE_SERVICE_ROLE_SECRET || process.env.SUPABASE_SERVICE_KEY;

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

    // Rate limiting - 10 login attempts per hour per IP
    const clientIP = event.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    const rateLimitCheck = checkRateLimit(`login_${anonymizeIP(clientIP)}`, 10, 3600000);
    
    if (!rateLimitCheck.allowed) {
        secureLog('Login rate limit exceeded', { ip: anonymizeIP(clientIP) });
        
        // Log security event for potential brute force
        const supabase = getSupabaseAdmin();
        await supabase.from('security_events').insert({
            event_type: 'rate_limit_exceeded',
            severity: 'medium',
            ip_address_anonymized: anonymizeIP(clientIP),
            description: 'Login rate limit exceeded',
            metadata: { endpoint: 'auth-login' }
        }).catch(() => {}); // Non-blocking
        
        return errorResponse(
            'Too many login attempts. Please try again later.',
            origin,
            429
        );
    }

    try {
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

            // Log failed login attempt
            await supabase.from('security_events').insert({
                event_type: 'failed_login',
                severity: 'low',
                ip_address_anonymized: anonymizeIP(clientIP),
                description: 'Invalid credentials',
                metadata: { email: validation.sanitized.email }
            }).catch(() => {}); // Non-blocking

            // Return generic error to prevent user enumeration
            return errorResponse('Invalid email or password', origin, 401);
        }

        if (!data?.session) {
            return errorResponse('Login failed. Please try again.', origin, 401);
        }

        // Create/update session tracking
        await supabase.from('user_sessions').insert({
            foundation_id: data.user.id,
            session_token: data.session.access_token, // Will be hashed by trigger
            device_type: event.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop',
            ip_address: clientIP, // Will be anonymized by trigger
            user_agent: event.headers['user-agent'],
            is_active: true,
            started_at: new Date().toISOString(),
            last_activity_at: new Date().toISOString()
        }).catch(() => {}); // Non-blocking

        // Log successful login in audit log
        await supabase.from('audit_log').insert({
            foundation_id: data.user.id,
            event_type: 'user_login',
            event_category: 'auth',
            action: 'login',
            ip_address: clientIP,
            user_agent: event.headers['user-agent'],
            metadata: { method: 'password' }
        }).catch(() => {}); // Non-blocking

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

        return successResponse({
            message: 'Login successful!',
            session: {
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                expires_at: data.session.expires_at
            },
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
        }, origin, 200);

    } catch (error) {
        secureLog('Login error', { error: error.message });
        return errorResponse('Server error. Please try again.', origin, 500);
    }
}
