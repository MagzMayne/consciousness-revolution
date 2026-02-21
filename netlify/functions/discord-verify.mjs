/**
 * DISCORD VERIFICATION WEBHOOK
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Copyright © 2024-2026 Consciousness Revolution / Overkill Kulture LLC
 * All Rights Reserved. PROPRIETARY AND CONFIDENTIAL.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * Pattern: 3 → 7 → 13 → ∞ | LFSME
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Purpose: Discord role verification → XP level assignment
 *
 * Flow:
 * 1. User joins Discord server
 * 2. Discord webhook fires → hits this endpoint
 * 3. Check user's roles (from Discord API)
 * 4. Map roles → XP levels
 * 5. Update user in Supabase with level + XP
 * 6. Return verification status + unlocked access
 *
 * Discord Role Mapping:
 * - "Lobby" → LOBBY (0 XP, level 0)
 * - "Seeker" → SEEKER (0 XP, level 1)
 * - "Builder" → BUILDER (50 XP, level 2)
 * - "Contributor" → CONTRIBUTOR (200 XP, level 3)
 * - "Architect" → ARCHITECT (500 XP, level 4)
 * - "Oracle" → ORACLE (2500 XP, level 5)
 */

import { VERIFICATION_LEVELS, getUserLevel, getAccessibleDomains } from './domain-tools.mjs';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID || '1458000070862573805';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_SECRET || process.env.SUPABASE_KEY;

// CORS
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
};

// Discord role name → XP level mapping
const ROLE_TO_LEVEL = {
    'lobby': { level: 0, xp: 0, name: 'LOBBY' },
    'seeker': { level: 1, xp: 0, name: 'SEEKER' },
    'builder': { level: 2, xp: 50, name: 'BUILDER' },
    'contributor': { level: 3, xp: 200, name: 'CONTRIBUTOR' },
    'architect': { level: 4, xp: 500, name: 'ARCHITECT' },
    'oracle': { level: 5, xp: 2500, name: 'ORACLE' }
};

export async function handler(event, context) {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }

    try {
        const { discord_user_id, action = 'verify' } = event.httpMethod === 'GET'
            ? event.queryStringParameters || {}
            : JSON.parse(event.body || '{}');

        if (!discord_user_id) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({
                    error: 'Missing discord_user_id parameter'
                })
            };
        }

        console.log(`[DISCORD-VERIFY] Checking user ${discord_user_id} in guild ${DISCORD_GUILD_ID}`);

        // Fetch user's roles from Discord
        const memberData = await getDiscordMemberRoles(discord_user_id);
        if (!memberData) {
            return {
                statusCode: 404,
                headers: CORS_HEADERS,
                body: JSON.stringify({
                    error: 'User not found in Discord server',
                    discord_user_id
                })
            };
        }

        // Determine highest level from roles
        const userLevel = calculateUserLevel(memberData.roles);

        // Update Supabase user table
        if (SUPABASE_URL && SUPABASE_KEY) {
            await updateUserInSupabase(discord_user_id, userLevel, memberData);
        }

        // Get accessible domains
        const accessibleDomains = getAccessibleDomains(userLevel.level);

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                success: true,
                discord_user_id,
                username: memberData.username,
                level: userLevel.name,
                level_number: userLevel.level,
                xp: userLevel.xp,
                verified: userLevel.level > 0,
                accessible_domains: accessibleDomains,
                roles: memberData.role_names,
                message: `Verified as ${userLevel.name} (Level ${userLevel.level})`
            })
        };

    } catch (error) {
        console.error('[DISCORD-VERIFY] Error:', error);
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
            console.error(`[DISCORD-VERIFY] Discord API error: ${response.status} ${response.statusText}`);
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
            nick: data.nick || data.user.username,
            joined_at: data.joined_at
        };

    } catch (error) {
        console.error('[DISCORD-VERIFY] Discord fetch error:', error);
        return null;
    }
}

async function getGuildRoles() {
    const url = `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/roles`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bot ${DISCORD_BOT_TOKEN}`
            }
        });

        if (!response.ok) return [];
        return await response.json();

    } catch (error) {
        console.error('[DISCORD-VERIFY] Guild roles fetch error:', error);
        return [];
    }
}

// Calculate user's level based on Discord roles
function calculateUserLevel(roleNames) {
    let highestLevel = ROLE_TO_LEVEL['lobby']; // Default: Lobby

    roleNames.forEach(roleName => {
        const normalized = roleName.toLowerCase().trim();
        const roleLevel = ROLE_TO_LEVEL[normalized];

        if (roleLevel && roleLevel.level > highestLevel.level) {
            highestLevel = roleLevel;
        }
    });

    return highestLevel;
}

// ═══════════════════════════════════════════════════════════════
// SUPABASE USER UPDATE
// ═══════════════════════════════════════════════════════════════

async function updateUserInSupabase(discordUserId, levelInfo, memberData) {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.log('[DISCORD-VERIFY] Supabase not configured - skipping user update');
        return;
    }

    try {
        // Upsert user in users table
        const response = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({
                discord_user_id: discordUserId,
                username: memberData.username,
                display_name: memberData.nick,
                level_name: levelInfo.name,
                level_number: levelInfo.level,
                xp: levelInfo.xp,
                verified: levelInfo.level > 0,
                discord_roles: memberData.role_names,
                last_verified: new Date().toISOString()
            })
        });

        if (!response.ok) {
            console.error(`[DISCORD-VERIFY] Supabase update failed: ${response.status}`);
        } else {
            console.log(`[DISCORD-VERIFY] User ${discordUserId} updated in Supabase`);
        }

    } catch (error) {
        console.error('[DISCORD-VERIFY] Supabase update error:', error);
    }
}
