/**
 * SPIRAL ENGINE PROGRESS API
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Copyright © 2024-2026 Consciousness Revolution / Overkill Kulture LLC
 * All Rights Reserved. PROPRIETARY AND CONFIDENTIAL.
 *
 * Created: 2026-03-11 | C1 Mechanic Build
 * Pattern: 3 → 7 → 13 → ∞ | LFSME
 *
 * 7 Forges Progression System:
 * - 13 Levels per forge (Fibonacci XP curve)
 * - Reality starts unlocked, others unlock at Reality L7
 * - Infinity L13 triggers Octave Return (Reality → L8)
 *
 * Endpoints:
 * - GET  /spiral-progress?userId=xxx - Get user's progress across all forges
 * - POST /spiral-progress - Add XP, unlock forges, check octave
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_SECRET ||
                     process.env.SUPABASE_SERVICE_KEY ||
                     process.env.SUPABASE_ANON_KEY;

const supabase = (SUPABASE_URL && SUPABASE_KEY)
    ? createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;

// ═══════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════

export async function handler(event, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (!supabase) {
        console.error('[SPIRAL ENGINE] Supabase not configured');
        return error('Database not configured', headers, 503);
    }

    try {
        if (event.httpMethod === 'GET') {
            const userId = event.queryStringParameters?.userId;
            if (!userId) {
                return error('userId required', headers);
            }
            return await getUserProgress(userId, headers);
        }

        if (event.httpMethod === 'POST') {
            const {
                action,
                userId,
                forgeSlug,
                amount,
                source,
                metadata
            } = JSON.parse(event.body || '{}');

            if (!userId) {
                return error('userId required', headers);
            }

            console.log(`[SPIRAL ENGINE] Action: ${action}, User: ${userId}`);

            switch (action) {
                case 'initialize':
                    return await initializeUser(userId, headers);
                case 'add_xp':
                    return await addXP(userId, forgeSlug, amount, source, metadata, headers);
                case 'unlock_forge':
                    return await unlockForge(userId, forgeSlug, headers);
                case 'check_octave':
                    return await checkOctave(userId, headers);
                case 'get_leaderboard':
                    return await getLeaderboard(forgeSlug, headers);
                case 'get_xp_history':
                    return await getXPHistory(userId, forgeSlug, headers);
                default:
                    return error('Invalid action', headers);
            }
        }

        return error('Method not allowed', headers, 405);
    } catch (e) {
        console.error('[SPIRAL ENGINE] Error:', e.message);
        return error(e.message, headers, 500);
    }
}

// ═══════════════════════════════════════════════════════════════
// USER PROGRESS - GET
// ═══════════════════════════════════════════════════════════════

async function getUserProgress(userId, headers) {
    // Get all progress using the dashboard view
    const { data: progress, error: err } = await supabase
        .from('spiral_user_dashboard')
        .select('*')
        .eq('user_id', userId)
        .order('forge_sequence');

    if (err) {
        console.error('[SPIRAL ENGINE] Error fetching progress:', err);
        return error(err.message, headers);
    }

    // Get octave return count
    const { data: octaves } = await supabase
        .from('spiral_octave_returns')
        .select('return_count')
        .eq('user_id', userId)
        .order('return_count', { ascending: false })
        .limit(1);

    const octaveCount = octaves && octaves.length > 0 ? octaves[0].return_count : 0;

    // Get total XP across all forges
    const totalXP = progress.reduce((sum, p) => sum + (p.total_xp || 0), 0);

    // Check if user is initialized
    const isInitialized = progress.length > 0;

    return success({
        user_id: userId,
        is_initialized: isInitialized,
        total_xp: totalXP,
        octave_count: octaveCount,
        forges: progress.map(p => ({
            slug: p.forge_slug,
            name: p.forge_name,
            color: p.forge_color,
            icon: p.forge_icon,
            sequence: p.forge_sequence,
            current_level: p.current_level,
            current_xp: p.current_xp,
            total_xp: p.total_xp,
            level_name: p.level_name,
            xp_for_next_level: p.xp_for_next_level,
            status: p.status,
            unlocked_at: p.unlocked_at,
            last_activity: p.last_activity_at
        }))
    }, headers);
}

// ═══════════════════════════════════════════════════════════════
// INITIALIZE USER
// ═══════════════════════════════════════════════════════════════

async function initializeUser(userId, headers) {
    // Check if already initialized
    const { data: existing } = await supabase
        .from('spiral_forge_progress')
        .select('user_id')
        .eq('user_id', userId)
        .limit(1);

    if (existing && existing.length > 0) {
        return success({
            message: 'User already initialized',
            already_initialized: true
        }, headers);
    }

    // Call the initialization function
    const { error: err } = await supabase
        .rpc('initialize_spiral_user', { p_user_id: userId });

    if (err) {
        console.error('[SPIRAL ENGINE] Init error:', err);
        return error(err.message, headers);
    }

    console.log(`[SPIRAL ENGINE] Initialized user: ${userId}`);

    // Return their starting progress
    return await getUserProgress(userId, headers);
}

// ═══════════════════════════════════════════════════════════════
// ADD XP
// ═══════════════════════════════════════════════════════════════

async function addXP(userId, forgeSlug, amount, source, metadata = {}, headers) {
    if (!forgeSlug) {
        return error('forgeSlug required', headers);
    }

    if (!amount || amount <= 0) {
        return error('amount must be positive', headers);
    }

    if (!source) {
        return error('source required (daily_login, mission_complete, etc)', headers);
    }

    // Check if forge is unlocked for this user
    const { data: progress } = await supabase
        .from('spiral_forge_progress')
        .select('unlocked_at')
        .eq('user_id', userId)
        .eq('forge_slug', forgeSlug)
        .single();

    if (!progress || !progress.unlocked_at) {
        return error('Forge not unlocked', headers, 403, {
            forge_slug: forgeSlug,
            hint: 'Reach Reality Level 7 to unlock other forges'
        });
    }

    // Call the add_xp_and_level_up function
    const { data: result, error: err } = await supabase
        .rpc('add_xp_and_level_up', {
            p_user_id: userId,
            p_forge_slug: forgeSlug,
            p_amount: amount,
            p_source: source,
            p_metadata: metadata
        });

    if (err) {
        console.error('[SPIRAL ENGINE] Add XP error:', err);
        return error(err.message, headers);
    }

    console.log(`[SPIRAL ENGINE] Added ${amount} XP to ${userId}/${forgeSlug}, leveled_up: ${result.leveled_up}`);

    // Get updated progress
    const updatedProgress = await getUserProgress(userId, headers);
    const responseData = JSON.parse(updatedProgress.body).data;

    return success({
        ...result,
        forge_slug: forgeSlug,
        source,
        progress: responseData
    }, headers);
}

// ═══════════════════════════════════════════════════════════════
// UNLOCK FORGE (Manual unlock - admin or special event)
// ═══════════════════════════════════════════════════════════════

async function unlockForge(userId, forgeSlug, headers) {
    if (!forgeSlug) {
        return error('forgeSlug required', headers);
    }

    // Check if already unlocked
    const { data: existing } = await supabase
        .from('spiral_forge_progress')
        .select('unlocked_at')
        .eq('user_id', userId)
        .eq('forge_slug', forgeSlug)
        .single();

    if (existing && existing.unlocked_at) {
        return success({
            message: 'Forge already unlocked',
            already_unlocked: true,
            forge_slug: forgeSlug
        }, headers);
    }

    // Create progress record
    const { error: progressErr } = await supabase
        .from('spiral_forge_progress')
        .insert({
            user_id: userId,
            forge_slug: forgeSlug,
            current_level: 1,
            unlocked_at: new Date().toISOString()
        });

    if (progressErr) {
        return error(progressErr.message, headers);
    }

    // Log unlock
    const { error: unlockErr } = await supabase
        .from('spiral_forge_unlocks')
        .insert({
            user_id: userId,
            forge_slug: forgeSlug,
            unlocked_by: 'admin_grant'
        });

    if (unlockErr) {
        console.error('[SPIRAL ENGINE] Unlock log error:', unlockErr);
    }

    console.log(`[SPIRAL ENGINE] Manually unlocked ${forgeSlug} for ${userId}`);

    return success({
        message: 'Forge unlocked',
        forge_slug: forgeSlug,
        unlocked: true
    }, headers);
}

// ═══════════════════════════════════════════════════════════════
// CHECK OCTAVE (See if user has completed Infinity L13)
// ═══════════════════════════════════════════════════════════════

async function checkOctave(userId, headers) {
    // Get Infinity progress
    const { data: infinity } = await supabase
        .from('spiral_forge_progress')
        .select('current_level, total_xp')
        .eq('user_id', userId)
        .eq('forge_slug', 'infinity')
        .single();

    // Get Reality progress
    const { data: reality } = await supabase
        .from('spiral_forge_progress')
        .select('current_level')
        .eq('user_id', userId)
        .eq('forge_slug', 'reality')
        .single();

    // Get octave history
    const { data: octaves } = await supabase
        .from('spiral_octave_returns')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    const hasReachedInfinityL13 = infinity && infinity.current_level >= 13;
    const octaveCount = octaves ? octaves.length : 0;

    return success({
        user_id: userId,
        has_reached_infinity_l13: hasReachedInfinityL13,
        infinity_level: infinity?.current_level || 0,
        reality_level: reality?.current_level || 1,
        octave_count: octaveCount,
        octave_history: octaves || []
    }, headers);
}

// ═══════════════════════════════════════════════════════════════
// LEADERBOARD
// ═══════════════════════════════════════════════════════════════

async function getLeaderboard(forgeSlug, headers, limit = 100) {
    let query = supabase
        .from('spiral_leaderboard')
        .select('*')
        .limit(limit);

    if (forgeSlug) {
        query = query.eq('forge_slug', forgeSlug);
    }

    const { data, error: err } = await query;

    if (err) {
        return error(err.message, headers);
    }

    return success({
        forge_slug: forgeSlug || 'all',
        count: data.length,
        leaderboard: data
    }, headers);
}

// ═══════════════════════════════════════════════════════════════
// XP HISTORY (Transaction log for a user/forge)
// ═══════════════════════════════════════════════════════════════

async function getXPHistory(userId, forgeSlug, headers, limit = 50) {
    let query = supabase
        .from('spiral_xp_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (forgeSlug) {
        query = query.eq('forge_slug', forgeSlug);
    }

    const { data, error: err } = await query;

    if (err) {
        return error(err.message, headers);
    }

    return success({
        user_id: userId,
        forge_slug: forgeSlug || 'all',
        count: data.length,
        transactions: data
    }, headers);
}

// ═══════════════════════════════════════════════════════════════
// RESPONSE HELPERS
// ═══════════════════════════════════════════════════════════════

function success(data, headers) {
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            success: true,
            data
        })
    };
}

function error(message, headers, statusCode = 400, details = {}) {
    return {
        statusCode,
        headers,
        body: JSON.stringify({
            success: false,
            error: message,
            details
        })
    };
}
