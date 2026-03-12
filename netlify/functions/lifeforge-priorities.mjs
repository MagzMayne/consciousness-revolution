/**
 * LIFEFORGE PRIORITIES API
 * ═══════════════════════════════════════════════════════════════
 * Returns #1 priority action for each of 7 domains
 *
 * GET /api/lifeforge-priorities
 * GET /api/lifeforge-priorities?domain=1  (specific domain)
 *
 * Pattern: 3 → 7 → 13 → ∞
 * ═══════════════════════════════════════════════════════════════
 */

import { createClient } from '@supabase/supabase-js';

// Domain mapping (internal ID → forge slug)
const DOMAIN_MAP = {
    1: { name: 'COMMAND', forge: 'reality', verb: 'DIRECT', icon: '🎯' },
    2: { name: 'BUILD', forge: 'creation', verb: 'CREATE', icon: '🔨' },
    3: { name: 'CONNECT', forge: 'communications', verb: 'RELATE', icon: '🔗' },
    4: { name: 'PROTECT', forge: 'guardian', verb: 'DEFEND', icon: '🛡️' },
    5: { name: 'GROW', forge: 'wealth', verb: 'EXPAND', icon: '📈' },
    6: { name: 'LEARN', forge: 'character', verb: 'EVOLVE', icon: '📚' },
    7: { name: 'TRANSCEND', forge: 'infinity', verb: 'INTEGRATE', icon: '♾️' }
};

// Default priorities (fallback when no user-specific data)
const DEFAULT_PRIORITIES = {
    1: { action: "Review today's mission and set clear direction", impact: "high", time: "15m" },
    2: { action: "Complete the next item on your build queue", impact: "high", time: "2h" },
    3: { action: "Reach out to one person who matters", impact: "medium", time: "20m" },
    4: { action: "Back up important files and check security", impact: "medium", time: "15m" },
    5: { action: "Review your financial dashboard", impact: "low", time: "10m" },
    6: { action: "Learn one new thing in your focus area", impact: "medium", time: "30m" },
    7: { action: "Reflect on patterns across all 7 domains", impact: "high", time: "15m" }
};

// Daily rituals from forge-data
const DAILY_RITUALS = {
    1: "What truth did you face today?",
    2: "What did you bring into existence today?",
    3: "Who did you truly connect with today?",
    4: "What did you protect today?",
    5: "What value did you create today?",
    6: "How did you grow today?",
    7: "What pattern did you recognize today?"
};

export default async (request) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
    }

    try {
        const url = new URL(request.url);
        const domainId = url.searchParams.get('domain');
        const userId = url.searchParams.get('user_id');

        // Initialize Supabase if we have credentials
        let supabase = null;
        const supabaseUrl = process.env.SUPABASE_URL || Netlify.env.get('SUPABASE_URL');
        const supabaseKey = process.env.SUPABASE_ANON_KEY || Netlify.env.get('SUPABASE_ANON_KEY');

        if (supabaseUrl && supabaseKey) {
            supabase = createClient(supabaseUrl, supabaseKey);
        }

        // Build priorities response
        let priorities = {};

        if (domainId) {
            // Single domain requested
            const id = parseInt(domainId);
            if (id >= 1 && id <= 7) {
                priorities[id] = await getDomainPriority(id, userId, supabase);
            } else {
                return new Response(JSON.stringify({ error: 'Invalid domain ID. Must be 1-7.' }), {
                    status: 400,
                    headers
                });
            }
        } else {
            // All domains
            for (let i = 1; i <= 7; i++) {
                priorities[i] = await getDomainPriority(i, userId, supabase);
            }
        }

        return new Response(JSON.stringify({
            success: true,
            priorities,
            meta: {
                timestamp: new Date().toISOString(),
                source: supabase ? 'supabase' : 'defaults',
                pattern: '3 → 7 → 13 → ∞'
            }
        }), { status: 200, headers });

    } catch (error) {
        console.error('LIFEFORGE API Error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message,
            priorities: DEFAULT_PRIORITIES
        }), { status: 500, headers });
    }
};

async function getDomainPriority(domainId, userId, supabase) {
    const domain = DOMAIN_MAP[domainId];
    const defaultPriority = DEFAULT_PRIORITIES[domainId];
    const ritual = DAILY_RITUALS[domainId];

    // Try to get user-specific priority from Supabase
    if (supabase && userId) {
        try {
            // Check for incomplete tasks in this domain
            const { data: tasks, error } = await supabase
                .from('user_tasks')
                .select('*')
                .eq('user_id', userId)
                .eq('domain', domainId)
                .eq('completed', false)
                .order('priority', { ascending: false })
                .order('created_at', { ascending: true })
                .limit(1);

            if (!error && tasks && tasks.length > 0) {
                return {
                    action: tasks[0].title || tasks[0].description,
                    impact: tasks[0].priority || 'medium',
                    time: tasks[0].estimated_time || '30m',
                    source: 'user_tasks',
                    ritual
                };
            }

            // Check for forge progress to suggest next action
            const { data: progress } = await supabase
                .from('forge_progress')
                .select('*')
                .eq('user_id', userId)
                .eq('forge_slug', domain.forge)
                .single();

            if (progress) {
                const currentLevel = progress.current_level || 1;
                return {
                    action: `Continue ${domain.name} Phase ${currentLevel} - ${getPhaseAction(currentLevel)}`,
                    impact: 'high',
                    time: '1h',
                    source: 'forge_progress',
                    currentLevel,
                    ritual
                };
            }
        } catch (e) {
            console.log('Supabase query failed, using defaults:', e.message);
        }
    }

    // Return default priority
    return {
        ...defaultPriority,
        domain: domain.name,
        forge: domain.forge,
        verb: domain.verb,
        icon: domain.icon,
        ritual,
        source: 'default'
    };
}

function getPhaseAction(level) {
    const phases = {
        1: 'Awakening',
        2: 'Recognition',
        3: 'Choice',
        4: 'Foundation',
        5: 'Practice',
        6: 'Consistency',
        7: 'Mastery',
        8: 'Teaching',
        9: 'Leadership',
        10: 'Ecology',
        11: 'Flow',
        12: 'Transmission',
        13: 'Transcendence'
    };
    return phases[level] || 'Evolution';
}

// Netlify Functions v2 config
export const config = {
    path: "/api/lifeforge-priorities"
};
