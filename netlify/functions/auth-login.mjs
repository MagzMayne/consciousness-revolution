// Auth Login Function
// Authenticates user via Supabase Auth and returns session
// Created: 2026-01-10

import { createClient } from '@supabase/supabase-js';

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
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers };
    }

    // Only accept POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { email, password } = JSON.parse(event.body || '{}');

        // Validate required fields
        if (!email || !password) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Email and password required' })
            };
        }

        const supabase = getSupabaseAdmin();

        // Attempt login via Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.toLowerCase().trim(),
            password
        });

        if (error) {
            console.error('Login error:', error.message);

            // Return generic error to prevent user enumeration
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Invalid email or password' })
            };
        }

        if (!data?.session) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Login failed. Please try again.' })
            };
        }

        // Update last login timestamp
        const { error: updateError } = await supabase
            .from('user_foundations')
            .update({
                last_login: new Date().toISOString(),
                login_count: supabase.rpc ? undefined : 1 // Will be incremented separately
            })
            .eq('user_id', data.user.id);

        if (updateError) {
            console.warn('Failed to update last login:', updateError.message);
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

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
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
            })
        };

    } catch (error) {
        console.error('Login error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Server error. Please try again.' })
        };
    }
}
