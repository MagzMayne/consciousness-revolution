/**
 * R3-D3 ACCESS CHECK
 * Validates if a user has permission to use R3-D3 Robot Assistant editing features
 * 
 * POST /api/r3d3-access-check
 * 
 * Request body:
 * {
 *   "session_token": "user_session_token",
 *   "action": "enable_editing" | "edit_page" | "fix_error"
 * }
 * 
 * Response:
 * {
 *   "allowed": boolean,
 *   "reason": string,
 *   "user": {
 *     "email": string,
 *     "is_admin": boolean,
 *     "r3d3_access_enabled": boolean
 *   }
 * }
 */

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
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
        const supabase = getSupabaseAdmin();
        const { session_token, action = 'edit_page' } = JSON.parse(event.body || '{}');

        // Extract auth token from Authorization header or body
        const authHeader = event.headers.authorization || event.headers.Authorization;
        const token = authHeader?.replace('Bearer ', '') || session_token;

        if (!token) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({
                    allowed: false,
                    reason: 'Authentication required. Please log in to use R3-D3 editing features.'
                })
            };
        }

        // Verify token and get user
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            console.error('Auth error:', authError?.message);
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({
                    allowed: false,
                    reason: 'Invalid or expired session. Please log in again.'
                })
            };
        }

        // Get user's foundation data
        const { data: foundation, error: foundationError } = await supabase
            .from('user_foundations')
            .select('email, is_admin, r3d3_access_enabled, r3d3_access_granted_at')
            .eq('user_id', user.id)
            .single();

        if (foundationError || !foundation) {
            console.error('Foundation lookup error:', foundationError?.message);
            return {
                statusCode: 403,
                headers,
                body: JSON.stringify({
                    allowed: false,
                    reason: 'User account not found. Please contact support.'
                })
            };
        }

        // Check access permissions
        const isAdmin = foundation.is_admin === true;
        const hasR3D3Access = foundation.r3d3_access_enabled === true;

        // Admin check: Only admins can enable/disable editing
        if (action === 'enable_editing' && !isAdmin) {
            return {
                statusCode: 403,
                headers,
                body: JSON.stringify({
                    allowed: false,
                    reason: 'Only administrators can enable R3-D3 editing features.',
                    user: {
                        email: foundation.email,
                        is_admin: isAdmin,
                        r3d3_access_enabled: hasR3D3Access
                    }
                })
            };
        }

        // Edit page check: Must have R3-D3 access enabled
        if (action === 'edit_page' && !hasR3D3Access) {
            return {
                statusCode: 403,
                headers,
                body: JSON.stringify({
                    allowed: false,
                    reason: 'R3-D3 editing access not enabled for your account. Contact an administrator.',
                    user: {
                        email: foundation.email,
                        is_admin: isAdmin,
                        r3d3_access_enabled: hasR3D3Access
                    }
                })
            };
        }

        // Error fix check: Anyone can request error fixes (they'll be reviewed)
        if (action === 'fix_error') {
            // Allow error fix requests from anyone
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    allowed: true,
                    reason: 'Error fix request allowed. Changes will be reviewed before applying.',
                    user: {
                        email: foundation.email,
                        is_admin: isAdmin,
                        r3d3_access_enabled: hasR3D3Access
                    }
                })
            };
        }

        // If we get here, access is granted
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                allowed: true,
                reason: 'Access granted',
                user: {
                    email: foundation.email,
                    is_admin: isAdmin,
                    r3d3_access_enabled: hasR3D3Access
                }
            })
        };

    } catch (error) {
        console.error('R3-D3 access check error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                allowed: false,
                reason: 'Server error. Please try again.',
                error: error.message
            })
        };
    }
}
