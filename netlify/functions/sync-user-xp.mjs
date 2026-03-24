/**
 * SYNC USER XP - Unified XP System Middleware
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Copyright © 2024-2026 Consciousness Revolution / Overkill Kulture LLC
 * All Rights Reserved. PROPRIETARY AND CONFIDENTIAL.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * Pattern: 3 → 7 → 13 → ∞ | LFSME
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Purpose: Bridge all XP systems together
 *
 * Flow:
 * Frontend XP (localStorage) ↔ Supabase users ↔ Supabase foundations ↔ Discord roles
 *
 * Actions:
 * - sync_frontend: Frontend localStorage → Supabase
 * - sync_discord: Discord roles → Supabase
 * - sync_foundations: users table → user_foundations table
 * - get_profile: Retrieve unified XP profile
 * - update_discord: Supabase XP → Discord role update
 */

import { createClient } from '@supabase/supabase-js';
import { VERIFICATION_LEVELS, getUserLevel, getLevelFromDiscordRole } from './domain-tools.mjs';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID || '1458000070862573805';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_SECRET || process.env.SUPABASE_KEY;

// CORS
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
};

// Discord role IDs (from server)
const DISCORD_ROLE_IDS = {
    'LOBBY': null,      // No role for lobby
    'SEEKER': null,     // TODO: Get from Discord server
    'BUILDER': null,    // TODO: Get from Discord server
    'CONTRIBUTOR': null,
    'ARCHITECT': null,
    'ORACLE': null
};

function getSupabaseAdmin() {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        throw new Error('Supabase configuration missing');
    }
    return createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
}

export async function handler(event, context) {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }

    try {
        let payload;
        try {
            payload = event.httpMethod === 'GET'
                ? event.queryStringParameters || {}
                : JSON.parse(event.body || '{}');
        } catch (parseError) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Invalid JSON in request body' })
            };
        }

        const { action, user_id, discord_user_id, xp_data } = payload;

        if (!action) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Missing action parameter' })
            };
        }

        const supabase = getSupabaseAdmin();

        switch (action) {
            case 'sync_frontend':
                return await syncFrontendXP(supabase, user_id, xp_data);

            case 'sync_discord':
                return await syncDiscordToSupabase(supabase, discord_user_id);

            case 'sync_foundations':
                return await syncUsersToFoundations(supabase, user_id);

            case 'get_profile':
                return await getUserXPProfile(supabase, user_id, discord_user_id);

            case 'update_discord':
                return await updateDiscordRolesFromXP(supabase, discord_user_id);

            case 'log_visit':
                return await logPageVisit(supabase, payload);

            default:
                return {
                    statusCode: 400,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({ error: `Unknown action: ${action}` })
                };
        }

    } catch (error) {
        console.error('[SYNC-USER-XP] Error:', error);
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

// ═══════════════════════════════════════════════════════════════
// SYNC FRONTEND → SUPABASE
// ═══════════════════════════════════════════════════════════════

async function syncFrontendXP(supabase, user_id, xp_data) {
    if (!user_id || !xp_data) {
        return {
            statusCode: 400,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Missing user_id or xp_data' })
        };
    }

    const { currentXP, level, totalXPEarned, domainMastery, toolsUsed } = xp_data;

    // Get current level info from XP
    const isVerified = level > 0;
    const levelInfo = getUserLevel(currentXP, isVerified);

    // Update users table
    const { error: usersError } = await supabase
        .from('users')
        .upsert({
            id: user_id,
            xp: currentXP,
            level_number: levelInfo.level,
            level_name: levelInfo.name,
            verified: isVerified,
            total_xp_earned: totalXPEarned,
            tools_used: toolsUsed,
            last_synced: new Date().toISOString()
        }, {
            onConflict: 'id'
        });

    if (usersError) {
        console.error('[SYNC-USER-XP] Users table update failed:', usersError);
    }

    // Update user_foundations table
    const { error: foundationsError } = await supabase
        .from('user_foundations')
        .upsert({
            user_id: user_id,
            xp: currentXP,
            level: levelInfo.level,
            level_name: levelInfo.name,
            domain_mastery: domainMastery,
            last_synced: new Date().toISOString()
        }, {
            onConflict: 'user_id'
        });

    if (foundationsError) {
        console.error('[SYNC-USER-XP] Foundations table update failed:', foundationsError);
    }

    // Check if Discord role needs updating
    const { data: userData } = await supabase
        .from('users')
        .select('discord_user_id, level_name')
        .eq('id', user_id)
        .single();

    let discord_role_updated = false;
    if (userData?.discord_user_id && userData.level_name !== levelInfo.name) {
        const roleUpdate = await updateDiscordRole(userData.discord_user_id, levelInfo.name);
        discord_role_updated = roleUpdate.success;
    }

    return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
            success: true,
            message: 'XP synced to server',
            level: levelInfo.name,
            level_number: levelInfo.level,
            xp: currentXP,
            discord_role_updated
        })
    };
}

// ═══════════════════════════════════════════════════════════════
// SYNC DISCORD → SUPABASE
// ═══════════════════════════════════════════════════════════════

async function syncDiscordToSupabase(supabase, discord_user_id) {
    if (!discord_user_id) {
        return {
            statusCode: 400,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Missing discord_user_id' })
        };
    }

    // Fetch Discord member data
    const memberData = await getDiscordMemberRoles(discord_user_id);
    if (!memberData) {
        return {
            statusCode: 404,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Discord user not found' })
        };
    }

    // Calculate level from roles
    let highestLevel = { level: 0, xp: 0, name: 'LOBBY' };
    memberData.role_names.forEach(roleName => {
        const roleLevel = getLevelFromDiscordRole(roleName);
        if (roleLevel.level > highestLevel.level) {
            highestLevel = roleLevel;
        }
    });

    // Update users table
    const { error } = await supabase
        .from('users')
        .upsert({
            discord_user_id: discord_user_id,
            username: memberData.username,
            display_name: memberData.nick,
            level_name: highestLevel.name,
            level_number: highestLevel.level,
            xp: highestLevel.xp,
            verified: highestLevel.level > 0,
            discord_roles: memberData.role_names,
            last_verified: new Date().toISOString()
        }, {
            onConflict: 'discord_user_id'
        });

    if (error) {
        console.error('[SYNC-USER-XP] Discord sync failed:', error);
    }

    return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
            success: true,
            message: 'Discord roles synced',
            level: highestLevel.name,
            level_number: highestLevel.level,
            xp: highestLevel.xp
        })
    };
}

// ═══════════════════════════════════════════════════════════════
// SYNC USERS → USER_FOUNDATIONS
// ═══════════════════════════════════════════════════════════════

async function syncUsersToFoundations(supabase, user_id) {
    if (!user_id) {
        return {
            statusCode: 400,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Missing user_id' })
        };
    }

    // Get data from users table
    const { data: userData, error: usersError } = await supabase
        .from('users')
        .select('xp, level_number, level_name, verified, discord_user_id')
        .eq('id', user_id)
        .single();

    if (usersError || !userData) {
        return {
            statusCode: 404,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'User not found' })
        };
    }

    // Update user_foundations
    const { error: foundationsError } = await supabase
        .from('user_foundations')
        .upsert({
            user_id: user_id,
            xp: userData.xp,
            level: userData.level_number,
            level_name: userData.level_name,
            verified: userData.verified,
            last_synced: new Date().toISOString()
        }, {
            onConflict: 'user_id'
        });

    if (foundationsError) {
        console.error('[SYNC-USER-XP] Foundations sync failed:', foundationsError);
    }

    return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
            success: true,
            message: 'Foundations synced',
            xp: userData.xp,
            level: userData.level_name
        })
    };
}

// ═══════════════════════════════════════════════════════════════
// GET UNIFIED XP PROFILE
// ═══════════════════════════════════════════════════════════════

async function getUserXPProfile(supabase, user_id, discord_user_id) {
    if (!user_id && !discord_user_id) {
        return {
            statusCode: 400,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Missing user_id or discord_user_id' })
        };
    }

    // Get from users table
    const query = supabase
        .from('users')
        .select('*');

    if (user_id) {
        query.eq('id', user_id);
    } else {
        query.eq('discord_user_id', discord_user_id);
    }

    const { data: userData, error: usersError } = await query.single();

    if (usersError || !userData) {
        return {
            statusCode: 404,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'User not found' })
        };
    }

    // Get from user_foundations
    const { data: foundationData } = await supabase
        .from('user_foundations')
        .select('*')
        .eq('user_id', userData.id)
        .single();

    return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
            success: true,
            profile: {
                user_id: userData.id,
                discord_user_id: userData.discord_user_id,
                username: userData.username,
                display_name: userData.display_name,
                level: userData.level_number,
                level_name: userData.level_name,
                xp: userData.xp,
                total_xp_earned: userData.total_xp_earned,
                verified: userData.verified,
                discord_roles: userData.discord_roles,
                domain_mastery: foundationData?.domain_mastery || {},
                consciousness_level: foundationData?.consciousness_level || 0.5,
                last_synced: userData.last_synced,
                last_verified: userData.last_verified
            }
        })
    };
}

// ═══════════════════════════════════════════════════════════════
// UPDATE DISCORD ROLE FROM XP
// ═══════════════════════════════════════════════════════════════

async function updateDiscordRolesFromXP(supabase, discord_user_id) {
    if (!discord_user_id) {
        return {
            statusCode: 400,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Missing discord_user_id' })
        };
    }

    // Get user's current XP and level from Supabase
    const { data: userData, error } = await supabase
        .from('users')
        .select('xp, level_name')
        .eq('discord_user_id', discord_user_id)
        .single();

    if (error || !userData) {
        return {
            statusCode: 404,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'User not found' })
        };
    }

    // Update Discord role
    const result = await updateDiscordRole(discord_user_id, userData.level_name);

    return {
        statusCode: result.success ? 200 : 500,
        headers: CORS_HEADERS,
        body: JSON.stringify(result)
    };
}

// ═══════════════════════════════════════════════════════════════
// DISCORD API HELPERS
// ═══════════════════════════════════════════════════════════════

async function getDiscordMemberRoles(userId) {
    const url = `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${userId}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`[SYNC-USER-XP] Discord API error: ${response.status}`);
            return null;
        }

        const data = await response.json();

        // Fetch role names
        const guildRoles = await getGuildRoles();
        const roleNames = data.roles.map(roleId => {
            const role = guildRoles.find(r => r.id === roleId);
            return role ? role.name : null;
        }).filter(Boolean);

        return {
            user_id: data.user.id,
            username: data.user.username,
            roles: data.roles,
            role_names: roleNames,
            nick: data.nick || data.user.username
        };

    } catch (error) {
        console.error('[SYNC-USER-XP] Discord fetch error:', error);
        return null;
    }
}

async function getGuildRoles() {
    const url = `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/roles`;

    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bot ${DISCORD_BOT_TOKEN}` }
        });

        if (!response.ok) return [];
        return await response.json();

    } catch (error) {
        console.error('[SYNC-USER-XP] Guild roles fetch error:', error);
        return [];
    }
}

async function updateDiscordRole(userId, levelName) {
    if (!DISCORD_BOT_TOKEN || !DISCORD_ROLE_IDS[levelName]) {
        return {
            success: false,
            message: 'Discord role update not configured'
        };
    }

    const url = `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${userId}/roles/${DISCORD_ROLE_IDS[levelName]}`;

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`[SYNC-USER-XP] Discord role update failed: ${response.status}`);
            return {
                success: false,
                message: 'Discord API error'
            };
        }

        return {
            success: true,
            message: `Discord role updated to ${levelName}`
        };

    } catch (error) {
        console.error('[SYNC-USER-XP] Discord role update error:', error);
        return {
            success: false,
            message: error.message
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// LOG PAGE VISIT (lightweight backend logging for consciousnessrevolution.io)
// ═══════════════════════════════════════════════════════════════

async function logPageVisit(supabase, payload) {
    const { user_id, page, domain, referrer, xp_snapshot } = payload;

    if (!user_id || !page) {
        return {
            statusCode: 400,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Missing user_id or page' })
        };
    }

    // Upsert a lightweight visit record into the users table
    const updateData = {
        id: user_id,
        last_synced: new Date().toISOString()
    };

    // Carry XP snapshot if provided (keeps Supabase in sync without a full sync call)
    if (xp_snapshot && typeof xp_snapshot.currentXP === 'number') {
        updateData.xp = xp_snapshot.currentXP;
        if (typeof xp_snapshot.totalXPEarned === 'number') {
            updateData.total_xp_earned = xp_snapshot.totalXPEarned;
        }
    }

    const { error } = await supabase
        .from('users')
        .upsert(updateData, { onConflict: 'id' });

    if (error) {
        console.warn('[SYNC-USER-XP] log_visit upsert failed:', error.message);
    }

    // Log the visit event to discord_xp_ledger as a lightweight audit trail
    const { error: ledgerError } = await supabase
        .from('discord_xp_ledger')
        .insert({
            user_id,
            action: 'page_visit',
            xp_earned: 0,
            notes: JSON.stringify({ page, domain: domain || 'unknown', referrer: referrer || null })
        });

    if (ledgerError) {
        console.warn('[SYNC-USER-XP] log_visit ledger insert failed:', ledgerError.message);
    }

    return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, logged: true, page, user_id })
    };
}
