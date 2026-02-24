// Discord XP Webhook - Awards XP via HTTP API
// Pattern: 3 → 7 → 13 → ∞

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 7-tier thresholds
const TIERS = [
    { tier: 0, name: 'SEED', xp: 0 },
    { tier: 1, name: 'SEEDLING', xp: 50 },
    { tier: 2, name: 'SAPLING', xp: 200 },
    { tier: 3, name: 'TREE', xp: 500 },
    { tier: 4, name: 'FOREST', xp: 1000 },
    { tier: 5, name: 'ORACLE', xp: 2500 },
    { tier: 6, name: 'GUARDIAN', xp: 5000 }
];

// XP values by action
const XP_VALUES = {
    'intro_post': 10,
    'araya_chat': 5,
    'task_claimed': 5,
    'task_completed': 50,
    'bug_reported': 25,
    'bug_fixed': 100,
    'win_shared': 15,
    'builder_recruited': 200,
    'daily_challenge': 20,
    'manual_award': null
};

function calculateTier(xp) {
    for (let i = TIERS.length - 1; i >= 0; i--) {
        if (xp >= TIERS[i].xp) return TIERS[i];
    }
    return TIERS[0];
}

export default async function handler(req, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'POST only' }), {
            status: 405, headers
        });
    }

    try {
        const body = await req.json();
        const { user_id, username, action, xp_amount, verified_by, notes } = body;

        if (!user_id || !username || !action) {
            return new Response(JSON.stringify({
                error: 'Missing required fields: user_id, username, action'
            }), { status: 400, headers });
        }

        const xp = xp_amount || XP_VALUES[action] || 0;
        if (xp === 0) {
            return new Response(JSON.stringify({
                error: 'Unknown action: ' + action
            }), { status: 400, headers });
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

        let { data: user, error: fetchError } = await supabase
            .from('discord_users_v2')
            .select('*')
            .eq('user_id', user_id)
            .single();

        if (fetchError && fetchError.code === 'PGRST116') {
            const { data: newUser, error: createError } = await supabase
                .from('discord_users_v2')
                .insert({
                    user_id,
                    username,
                    xp: 0,
                    tier: 0,
                    tier_name: 'SEED'
                })
                .select()
                .single();

            if (createError) throw createError;
            user = newUser;
        } else if (fetchError) {
            throw fetchError;
        }

        const newXp = user.xp + xp;
        const newTierData = calculateTier(newXp);
        const tierChanged = newTierData.tier > user.tier;

        const { error: updateError } = await supabase
            .from('discord_users_v2')
            .update({
                xp: newXp,
                tier: newTierData.tier,
                tier_name: newTierData.name,
                lifetime_xp: (user.lifetime_xp || 0) + xp,
                weekly_xp: (user.weekly_xp || 0) + xp,
                monthly_xp: (user.monthly_xp || 0) + xp,
                last_active: new Date().toISOString()
            })
            .eq('user_id', user_id);

        if (updateError) throw updateError;

        await supabase
            .from('discord_xp_ledger')
            .insert({
                user_id,
                action,
                xp_earned: xp,
                verified_by: verified_by || null,
                notes: notes || null
            });

        if (tierChanged) {
            await supabase
                .from('discord_tier_milestones')
                .insert({
                    user_id,
                    from_tier: user.tier,
                    to_tier: newTierData.tier,
                    tier_name: newTierData.name
                });
        }

        return new Response(JSON.stringify({
            success: true,
            user_id,
            username,
            action,
            xp_awarded: xp,
            new_xp: newXp,
            tier: newTierData.name,
            tier_up: tierChanged,
            message: tierChanged
                ? 'Congratulations! You reached ' + newTierData.name + '!'
                : '+' + xp + ' XP! Total: ' + newXp
        }), { status: 200, headers });

    } catch (error) {
        console.error('XP Webhook Error:', error);
        return new Response(JSON.stringify({
            error: 'Internal server error',
            details: error.message
        }), { status: 500, headers });
    }
}
