/**
 * R3-D3 GRANT ACCESS WEBHOOK
 * Allows administrators to grant/revoke R3-D3 access to users
 * 
 * POST /api/r3d3-grant-access
 * 
 * Request body:
 * {
 *   "admin_token": "admin_session_token",
 *   "target_email": "user@example.com",
 *   "grant_access": boolean
 * }
 * 
 * Response:
 * {
 *   "success": boolean,
 *   "message": string
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
        const {
            admin_token,
            target_email,
            grant_access
        } = JSON.parse(event.body || '{}');

        // Extract auth token from Authorization header or body
        const authHeader = event.headers.authorization || event.headers.Authorization;
        const token = authHeader?.replace('Bearer ', '') || admin_token;

        if (!token) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: 'Authentication required'
                })
            };
        }

        if (!target_email) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: 'Target email is required'
                })
            };
        }

        // Verify admin token and get admin user
        const { data: { user: adminUser }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !adminUser) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: 'Invalid or expired session'
                })
            };
        }

        // Verify admin has admin privileges
        const { data: adminFoundation, error: adminError } = await supabase
            .from('user_foundations')
            .select('id, email, is_admin')
            .eq('user_id', adminUser.id)
            .single();

        if (adminError || !adminFoundation || !adminFoundation.is_admin) {
            // Log unauthorized access attempt
            await supabase.from('r3d3_access_log').insert({
                foundation_id: adminFoundation?.id || null,
                action: 'enable_editing',
                success: false,
                error_message: 'Unauthorized: Not an admin',
                metadata: {
                    attempted_target: target_email,
                    admin_email: adminFoundation?.email || 'unknown'
                }
            });

            return {
                statusCode: 403,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: 'Access denied. Admin privileges required.'
                })
            };
        }

        // Find target user
        const { data: targetFoundation, error: targetError } = await supabase
            .from('user_foundations')
            .select('id, email, r3d3_access_enabled')
            .eq('email', target_email.toLowerCase().trim())
            .single();

        if (targetError || !targetFoundation) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: `User with email ${target_email} not found`
                })
            };
        }

        // Update target user's R3-D3 access
        const updateData = {
            r3d3_access_enabled: grant_access,
            r3d3_access_granted_at: grant_access ? new Date().toISOString() : null,
            r3d3_access_granted_by: grant_access ? adminFoundation.id : null
        };

        const { error: updateError } = await supabase
            .from('user_foundations')
            .update(updateData)
            .eq('id', targetFoundation.id);

        if (updateError) {
            console.error('Failed to update R3-D3 access:', updateError);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: 'Failed to update access. Please try again.'
                })
            };
        }

        // Log the access grant/revoke
        await supabase.from('r3d3_access_log').insert({
            foundation_id: adminFoundation.id,
            action: grant_access ? 'enable_editing' : 'disable_editing',
            success: true,
            metadata: {
                admin_email: adminFoundation.email,
                target_email: targetFoundation.email,
                grant_access
            }
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: `R3-D3 access ${grant_access ? 'granted to' : 'revoked from'} ${target_email}`,
                user: {
                    email: targetFoundation.email,
                    r3d3_access_enabled: grant_access
                }
            })
        };

    } catch (error) {
        console.error('R3-D3 grant access error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Server error. Please try again.',
                error: error.message
            })
        };
    }
}
