/**
 * R3-D3 ACTION LOGGER
 * Logs all R3-D3 Robot Assistant actions for audit trail
 * 
 * POST /api/r3d3-log-action
 * 
 * Request body:
 * {
 *   "session_token": "user_session_token",
 *   "action": "enable_editing" | "disable_editing" | "edit_page" | "fix_error",
 *   "target_file": "path/to/file.html",
 *   "change_description": "Description of the change",
 *   "success": boolean,
 *   "error_message": "optional error message",
 *   "metadata": { ... optional metadata ... }
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
            session_token,
            action,
            target_file,
            change_description,
            success,
            error_message,
            metadata = {}
        } = JSON.parse(event.body || '{}');

        // Extract auth token from Authorization header or body
        const authHeader = event.headers.authorization || event.headers.Authorization;
        const token = authHeader?.replace('Bearer ', '') || session_token;

        let foundation_id = null;
        let user_email = null;

        // Try to get user (may not be logged in for error fixes)
        if (token) {
            const { data: { user }, error: authError } = await supabase.auth.getUser(token);

            if (!authError && user) {
                // Get user's foundation
                const { data: foundation } = await supabase
                    .from('user_foundations')
                    .select('id, email')
                    .eq('user_id', user.id)
                    .single();

                if (foundation) {
                    foundation_id = foundation.id;
                    user_email = foundation.email;
                }
            }
        }

        // Get client info
        const clientIP = event.headers['x-forwarded-for']?.split(',')[0] || 
                        event.headers['x-real-ip'] || 
                        'unknown';
        const userAgent = event.headers['user-agent'] || 'unknown';

        // Log the action
        const { data: logEntry, error: logError } = await supabase
            .from('r3d3_access_log')
            .insert({
                foundation_id,
                action,
                target_file,
                change_description,
                success,
                error_message,
                ip_address: clientIP,
                user_agent: userAgent,
                session_id: metadata.session_id || null,
                metadata: {
                    ...metadata,
                    user_email: user_email || 'anonymous'
                }
            })
            .select()
            .single();

        if (logError) {
            console.error('Failed to log R3-D3 action:', logError);
            // Don't fail the request if logging fails
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    logged: false,
                    message: 'Action completed but logging failed'
                })
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                logged: true,
                log_id: logEntry.id,
                message: 'Action logged successfully'
            })
        };

    } catch (error) {
        console.error('R3-D3 log action error:', error);
        // Don't fail the request if logging fails
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                logged: false,
                message: 'Action completed but logging failed',
                error: error.message
            })
        };
    }
}
