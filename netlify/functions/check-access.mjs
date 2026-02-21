/**
 * check-access.mjs - 3-Layer Access Control Middleware
 * ═══════════════════════════════════════════════════════════════════════════
 * Copyright © 2024-2026 Consciousness Revolution / Overkill Kulture LLC
 * All Rights Reserved. PROPRIETARY AND CONFIDENTIAL.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Pattern: PERSONAL → TEAM → PUBLIC | 3 → 7 → 13 → ∞
 *
 * Verifies user can access a resource based on:
 * 1. Discord verification status (from discord-verify.mjs)
 * 2. XP level (from Supabase users table)
 * 3. Resource access tier (PERSONAL/TEAM/PUBLIC)
 *
 * Flow:
 * 1. Client calls with user_id, resource_path, resource_tier
 * 2. Look up user in Supabase users table
 * 3. Check if user's level meets tier requirement
 * 4. For PERSONAL tier, verify user owns the resource
 * 5. Return allowed: true/false + redirect if denied
 */

import { ACCESS_TIERS, BUILDER_COCKPITS } from './domain-tools.mjs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_SECRET || process.env.SUPABASE_KEY;

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

export async function handler(event, context) {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }

    // Only POST allowed
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Method not allowed - use POST' })
        };
    }

    try {
        const { user_id, resource_path, resource_tier } = JSON.parse(event.body || '{}');

        // Validate input
        if (!user_id || !resource_path || !resource_tier) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({
                    error: 'Missing required fields: user_id, resource_path, resource_tier'
                })
            };
        }

        // Get user from Supabase
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        const { data: user, error } = await supabase
            .from('users')
            .select('discord_user_id, level_number, level_name, xp, verified, username')
            .eq('discord_user_id', user_id)
            .single();

        if (error || !user) {
            console.log(`[CHECK-ACCESS] User not found: ${user_id}`);
            return {
                statusCode: 403,
                headers: CORS_HEADERS,
                body: JSON.stringify({
                    allowed: false,
                    reason: 'User not found or not verified',
                    redirect: '/verify.html',
                    action: 'Complete Discord verification to unlock access'
                })
            };
        }

        // Get access tier definition
        const tier = ACCESS_TIERS[resource_tier];
        if (!tier) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({
                    error: `Invalid resource_tier: ${resource_tier}. Must be PERSONAL, TEAM, or PUBLIC`
                })
            };
        }

        console.log(`[CHECK-ACCESS] Checking ${user.username} (level ${user.level_number}) for ${tier.name} resource`);

        // ═══════════════════════════════════════════════════════════════
        // LAYER 3: PUBLIC - Requires SEEKER (level 1+)
        // ═══════════════════════════════════════════════════════════════
        if (tier.level === 2) {
            if (!user.verified || user.level_number < 1) {
                return {
                    statusCode: 403,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({
                        allowed: false,
                        reason: 'Complete Discord verification to access public tools',
                        redirect: 'https://discord.gg/consciousnessrevolution',
                        current_level: user.level_name || 'LOBBY',
                        required_level: 'SEEKER',
                        action: 'Join Discord and complete verification'
                    })
                };
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // LAYER 2: TEAM - Requires BUILDER (level 2+)
        // ═══════════════════════════════════════════════════════════════
        if (tier.level === 1) {
            if (user.level_number < 2) {
                return {
                    statusCode: 403,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({
                        allowed: false,
                        reason: 'Need BUILDER level (50 XP) to access team tools',
                        current_xp: user.xp || 0,
                        needed_xp: 50,
                        current_level: user.level_name || 'SEEKER',
                        required_level: 'BUILDER',
                        action: 'Earn XP by completing quests and using tools',
                        redirect: '/XP_TRACKER.html'
                    })
                };
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // LAYER 1: PERSONAL - Check if user owns this cockpit
        // ═══════════════════════════════════════════════════════════════
        if (tier.level === 0) {
            const builder = getBuilderByDiscordId(user_id);

            if (!builder) {
                return {
                    statusCode: 403,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({
                        allowed: false,
                        reason: 'Not a registered builder',
                        action: 'Contact Commander to join the Builder program',
                        redirect: '/DNA_BUILDER_AGREEMENT.html'
                    })
                };
            }

            // Check if resource_path matches their cockpit
            const cockpitFile = builder.cockpit.split('/').pop(); // Get filename
            const requestedFile = resource_path.split('/').pop();

            if (cockpitFile !== requestedFile) {
                return {
                    statusCode: 403,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({
                        allowed: false,
                        reason: 'Can only access your own cockpit',
                        your_cockpit: builder.cockpit,
                        requested_cockpit: resource_path,
                        action: 'You can only view and edit your personal workspace',
                        redirect: builder.cockpit
                    })
                };
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // ACCESS GRANTED ✅
        // ═══════════════════════════════════════════════════════════════
        console.log(`[CHECK-ACCESS] ✅ Access granted for ${user.username} to ${tier.name} tier`);

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                allowed: true,
                user: {
                    username: user.username,
                    level: user.level_name,
                    level_number: user.level_number,
                    xp: user.xp
                },
                resource_tier: tier.name,
                resource_path: resource_path,
                message: `Welcome ${user.username}! You have access to ${tier.name} tier.`
            })
        };

    } catch (error) {
        console.error('[CHECK-ACCESS] Error:', error);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                error: 'Internal server error',
                details: error.message
            })
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER: Find builder by Discord ID
// ═══════════════════════════════════════════════════════════════════════════
function getBuilderByDiscordId(discordId) {
    return Object.values(BUILDER_COCKPITS).find(b => b.discord_id === discordId);
}
