// Auth Signup Function
// Creates new user via Supabase Auth with optional foundation record
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
    const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_SECRET || process.env.SUPABASE_SERVICE_KEY;

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

    // Rate limiting - 5 signup attempts per hour per IP
    const clientIP = event.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    const rateLimitCheck = checkRateLimit(`signup_${anonymizeIP(clientIP)}`, 5, 3600000);
    
    if (!rateLimitCheck.allowed) {
        secureLog('Signup rate limit exceeded', { ip: anonymizeIP(clientIP) });
        return errorResponse(
            'Too many signup attempts. Please try again later.',
            origin,
            429
        );
    }

    try {
        const { email, password, full_name } = JSON.parse(event.body || '{}');

        // Input validation using security utility
        const validation = validateInput({ email, password, full_name }, {
            email: {
                type: 'email',
                required: true
            },
            password: {
                type: 'string',
                required: true,
                minLength: 8,
                maxLength: 128,
                validator: (pwd) => {
                    // Require at least one number and one letter
                    if (!/\d/.test(pwd) || !/[a-zA-Z]/.test(pwd)) {
                        return 'Password must contain at least one letter and one number';
                    }
                    return null;
                }
            },
            full_name: {
                type: 'string',
                required: false,
                maxLength: 100
            }
        });

        if (!validation.valid) {
            return errorResponse(validation.errors.join(', '), origin, 400);
        }

        const supabase = getSupabaseAdmin();

        // Create user via Supabase Auth (using standard signUp - works with anon key)
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: validation.sanitized.email,
            password: validation.sanitized.password,
            options: {
                data: {
                    full_name: validation.sanitized.full_name || '',
                    signup_source: 'beta_form',
                    signup_date: new Date().toISOString()
                }
            }
        });

        if (authError) {
            secureLog('Auth error during signup', { 
                error: authError.message,
                email: validation.sanitized.email 
            });

            // Handle specific errors
            if (authError.message.includes('already registered')) {
                return errorResponse(
                    'Email already registered. Please login instead.',
                    origin,
                    409
                );
            }

            return errorResponse(
                authError.message || 'Signup failed',
                origin,
                400
            );
        }

        // Create foundation record for the user
        if (authData?.user) {
            const { error: foundationError } = await supabase
                .from('user_foundations')
                .insert({
                    user_id: authData.user.id,
                    email: validation.sanitized.email,
                    full_name: validation.sanitized.full_name || '',
                    consciousness_level: 0.5,
                    manipulation_immunity: 0.3,
                    truth_recognition: 0.3,
                    pattern_recognition: 0.3,
                    account_tier: 'beta',
                    account_status: 'active'
                });

            if (foundationError) {
                secureLog('Foundation creation warning', { error: foundationError.message });
                // Non-blocking - foundation can be created later
            }

            // Create network status record
            const { error: networkError } = await supabase
                .from('builder_network_status')
                .insert({
                    foundation_id: authData.user.id,
                    contribution_score: 10, // Welcome bonus
                    contribution_tier: 'SEEDLING'
                });

            if (networkError) {
                secureLog('Network status creation warning', { error: networkError.message });
            }

            // Create ARAYA Energy account (Flow tier - free with 100 Energy)
            const { error: energyError } = await supabase
                .from('araya_accounts')
                .insert({
                    id: authData.user.id,
                    foundation_id: authData.user.id,
                    email: validation.sanitized.email,
                    tier: 'flow',
                    energy_balance: 100,
                    monthly_allocation: 100,
                    subscription_status: 'free'
                });

            if (energyError) {
                secureLog('Energy account creation warning', { error: energyError.message });
            } else {
                try {
                    await supabase.from('araya_transactions').insert({
                        account_id: authData.user.id,
                        transaction_type: 'signup_bonus',
                        amount: 100,
                        balance_after: 100,
                        description: 'Welcome to ARAYA! 100 Energy to get started.',
                        metadata: { source: 'signup' }
                    });
                } catch (e) {
                    // Non-blocking
                }
            }

            // Log successful signup in audit log (non-blocking)
            try {
                await supabase.from('audit_log').insert({
                    foundation_id: authData.user.id,
                    event_type: 'user_signup',
                    event_category: 'auth',
                    action: 'create',
                    ip_address: clientIP,
                    metadata: {
                        signup_source: 'beta_form',
                        tier: 'beta'
                    }
                });
            } catch (err) {
                secureLog('Audit log warning', { error: err.message });
            }
        }

        // Handle the signup response - check if email confirmation is required
        if (authData?.user) {
            // Check if email is confirmed (Supabase returns user even when confirmation required)
            const needsConfirmation = !authData.user.email_confirmed_at;

            if (needsConfirmation) {
                secureLog('Signup needs confirmation', {
                    userId: authData.user.id,
                    email: validation.sanitized.email
                });

                return successResponse({
                    message: 'Check your email to confirm your account!',
                    needs_confirmation: true,
                    user: {
                        id: authData.user.id,
                        email: authData.user.email
                    }
                }, origin, 200);
            }

            secureLog('Successful signup', {
                userId: authData.user.id,
                email: validation.sanitized.email
            });

            return successResponse({
                message: 'Account created successfully!',
                user: {
                    id: authData.user.id,
                    email: authData.user.email
                }
            }, origin, 200);
        } else {
            // No user returned - edge case
            secureLog('Signup returned no user', {
                email: validation.sanitized.email
            });

            return successResponse({
                message: 'Check your email to confirm your account!',
                needs_confirmation: true
            }, origin, 200);
        }

    } catch (error) {
        secureLog('Signup error', { error: error.message });
        return errorResponse('Server error. Please try again.', origin, 500);
    }
}
