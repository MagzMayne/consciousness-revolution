/**
 * DASHBOARD COMMIT API - Selective Merge System
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Copyright © 2024-2026 Consciousness Revolution / Overkill Kulture LLC
 * All Rights Reserved. PROPRIETARY AND CONFIDENTIAL.
 *
 * Pattern: 3 → 7 → 13 → ∞ | LFSME
 * Consciousness Fingerprint: SELECTIVE-MERGE-v1
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Purpose: Accept dashboard improvement proposals from ARAYA/operators
 * Each improvement = 1 atomic, selectable unit that can be:
 * - SELECTED (cherry-picked by owner)
 * - REJECTED (with reason)
 * - MERGED (applied to dashboard)
 * - ROLLED_BACK (if problems occur)
 *
 * Endpoints:
 * POST /dashboard-commit - Submit new improvement proposal
 * GET  /dashboard-commit?dashboard_id=X - List pending proposals for dashboard
 * PUT  /dashboard-commit - Update proposal status (select/reject/merge)
 */

// Lazy-load Supabase
let _supabaseClient = null;
let _supabaseLoaded = false;

async function loadSupabase() {
    if (_supabaseLoaded) return _supabaseClient;
    _supabaseLoaded = true;
    try {
        const { createClient } = await import('@supabase/supabase-js');
        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_SECRET || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;
        if (SUPABASE_URL && SUPABASE_KEY) {
            _supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log('[DASHBOARD-COMMIT] Supabase client initialized');
        }
    } catch (e) {
        console.log('[DASHBOARD-COMMIT] Supabase module not available');
    }
    return _supabaseClient;
}

// CORS headers
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Content-Type': 'application/json'
};

// Golden Rule check - basic ethical screening
function checkGoldenRule(changes) {
    const redFlags = [
        'delete all', 'drop table', 'rm -rf', 'format c:',
        'steal', 'hack', 'exploit', 'malware', 'virus',
        'password', 'credit card', 'ssn', 'social security'
    ];

    const content = JSON.stringify(changes).toLowerCase();
    for (const flag of redFlags) {
        if (content.includes(flag)) {
            return { passed: false, reason: `Blocked: contains "${flag}"` };
        }
    }
    return { passed: true, reason: null };
}

// Determine change type based on content
function classifyChangeType(html_diff, css_diff, js_diff) {
    // BREAKING: Data model changes, auth changes, API changes
    if (js_diff && (
        js_diff.includes('supabase') ||
        js_diff.includes('auth.') ||
        js_diff.includes('fetch(') ||
        js_diff.includes('localStorage') ||
        js_diff.includes('sessionStorage')
    )) {
        return 'BREAKING';
    }

    // REVIEWED: Any JavaScript changes
    if (js_diff && js_diff.trim().length > 0) {
        return 'REVIEWED';
    }

    // SAFE: CSS-only or HTML text-only changes
    return 'SAFE';
}

// Calculate XP reward based on change complexity
function calculateXpReward(html_diff, css_diff, js_diff, change_type) {
    let base = 50;

    // Size bonus
    const totalSize = (html_diff?.length || 0) + (css_diff?.length || 0) + (js_diff?.length || 0);
    if (totalSize > 1000) base += 50;
    if (totalSize > 5000) base += 100;

    // Complexity bonus
    if (change_type === 'REVIEWED') base += 75;
    if (change_type === 'BREAKING') base += 150;

    // Cap at 500
    return Math.min(base, 500);
}

export async function handler(event, context) {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const supabase = await loadSupabase();
    if (!supabase) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Database not configured' })
        };
    }

    try {
        // ═══════════════════════════════════════════════════════════════
        // GET: List pending proposals for a dashboard
        // ═══════════════════════════════════════════════════════════════
        if (event.httpMethod === 'GET') {
            const params = event.queryStringParameters || {};
            const dashboard_id = params.dashboard_id;
            const status = params.status || 'pending';

            if (!dashboard_id) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'dashboard_id required' })
                };
            }

            const { data, error } = await supabase
                .from('improvement_proposals')
                .select('*')
                .eq('dashboard_id', dashboard_id)
                .eq('status', status)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    dashboard_id,
                    status,
                    count: data.length,
                    proposals: data
                })
            };
        }

        // ═══════════════════════════════════════════════════════════════
        // POST: Submit new improvement proposal
        // ═══════════════════════════════════════════════════════════════
        if (event.httpMethod === 'POST') {
            const body = JSON.parse(event.body || '{}');

            // Required fields
            const { dashboard_id, creator_name, title } = body;
            if (!dashboard_id || !creator_name || !title) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        error: 'Required: dashboard_id, creator_name, title'
                    })
                };
            }

            // Optional fields
            const {
                creator_id,
                creator_type = 'operator',
                description,
                domain,
                html_diff,
                css_diff,
                js_diff,
                full_patch
            } = body;

            // Golden Rule check
            const goldenCheck = checkGoldenRule({ html_diff, css_diff, js_diff, full_patch });
            if (!goldenCheck.passed) {
                return {
                    statusCode: 403,
                    headers,
                    body: JSON.stringify({
                        error: 'Golden Rule violation',
                        reason: goldenCheck.reason
                    })
                };
            }

            // Auto-classify change type
            const change_type = body.change_type || classifyChangeType(html_diff, css_diff, js_diff);

            // Calculate XP reward
            const xp_reward = calculateXpReward(html_diff, css_diff, js_diff, change_type);

            // Insert proposal
            const { data, error } = await supabase
                .from('improvement_proposals')
                .insert({
                    dashboard_id,
                    creator_id,
                    creator_type,
                    creator_name,
                    title,
                    description,
                    domain,
                    change_type,
                    html_diff,
                    css_diff,
                    js_diff,
                    full_patch,
                    xp_reward,
                    golden_rule_passed: true,
                    status: 'pending',
                    canary_status: 'pending'
                })
                .select()
                .single();

            if (error) throw error;

            return {
                statusCode: 201,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: `Improvement "${title}" submitted for review`,
                    proposal_id: data.id,
                    change_type,
                    xp_reward,
                    status: 'pending'
                })
            };
        }

        // ═══════════════════════════════════════════════════════════════
        // PUT: Update proposal status (select/reject/merge/rollback)
        // ═══════════════════════════════════════════════════════════════
        if (event.httpMethod === 'PUT') {
            const body = JSON.parse(event.body || '{}');
            const { proposal_id, action, user_id, reason } = body;

            if (!proposal_id || !action) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Required: proposal_id, action' })
                };
            }

            let updateData = { updated_at: new Date().toISOString() };

            switch (action) {
                case 'select':
                    updateData.status = 'selected';
                    updateData.selected_at = new Date().toISOString();
                    updateData.selected_by = user_id;
                    break;

                case 'reject':
                    updateData.status = 'rejected';
                    updateData.rejection_reason = reason || 'No reason provided';
                    break;

                case 'merge':
                    updateData.status = 'merged';
                    updateData.merged_at = new Date().toISOString();
                    break;

                case 'rollback':
                    updateData.status = 'rolled_back';
                    break;

                default:
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({
                            error: 'Invalid action. Use: select, reject, merge, rollback'
                        })
                    };
            }

            const { data, error } = await supabase
                .from('improvement_proposals')
                .update(updateData)
                .eq('id', proposal_id)
                .select()
                .single();

            if (error) throw error;

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: `Proposal ${action}ed successfully`,
                    proposal: data
                })
            };
        }

        // Method not allowed
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };

    } catch (error) {
        console.error('[DASHBOARD-COMMIT] Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Internal server error',
                details: error.message
            })
        };
    }
}
