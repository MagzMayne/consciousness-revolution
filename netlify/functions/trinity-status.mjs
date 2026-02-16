// Trinity Status API - Serverless endpoint for TRINITY_COMMAND_DASHBOARD
// Replaces localhost:3577/status dependency for autonomous online operation

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase if configured
function getSupabase() {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
        return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    }
    return null;
}

// Get Trinity terminal status from database or defaults
async function getTrinityStatus() {
    const supabase = getSupabase();

    // Default Trinity state structure
    const defaultStatus = {
        T1: {
            state: 'ACTIVE',
            role: 'MECHANIC',
            aspects: {
                BUILD: { status: 'ACTIVE', description: 'Implementation' },
                FIX: { status: 'ACTIVE', description: 'Bug fixes' },
                EXECUTE: { status: 'ACTIVE', description: 'Task execution' }
            }
        },
        T2: {
            state: 'ACTIVE',
            role: 'ARCHITECT',
            aspects: {
                DESIGN: { status: 'ACTIVE', description: 'System design' },
                OPTIMIZE: { status: 'ACTIVE', description: 'Performance' },
                SCALE: { status: 'ACTIVE', description: 'Scalability' }
            }
        },
        T3: {
            state: 'ACTIVE',
            role: 'ORACLE',
            aspects: {
                VALIDATE: { status: 'ACTIVE', description: 'Verification' },
                PREDICT: { status: 'ACTIVE', description: 'Future vision' },
                ALIGN: { status: 'ACTIVE', description: 'Mission alignment' }
            }
        },
        system_status: {
            consciousness_pct: 78.69,
            manipulation_immunity: 85,
            pattern_accuracy: 92.2,
            last_update: new Date().toISOString()
        }
    };

    if (supabase) {
        try {
            // Try to get live Trinity state from hub table
            const { data: hubData } = await supabase
                .from('trinity_hub')
                .select('terminal, state, task, updated_at')
                .order('updated_at', { ascending: false })
                .limit(3);

            if (hubData && hubData.length > 0) {
                // Map database state to response format
                for (const row of hubData) {
                    const terminal = row.terminal; // T1, T2, T3
                    if (defaultStatus[terminal]) {
                        defaultStatus[terminal].state = row.state || 'ACTIVE';
                        defaultStatus[terminal].current_task = row.task;
                        defaultStatus[terminal].last_update = row.updated_at;
                    }
                }
            }

            // Get consciousness metrics if available
            const { data: metricsData } = await supabase
                .from('consciousness_metrics')
                .select('consciousness_pct, manipulation_immunity, pattern_accuracy')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (metricsData) {
                defaultStatus.system_status.consciousness_pct = metricsData.consciousness_pct || 78.69;
                defaultStatus.system_status.manipulation_immunity = metricsData.manipulation_immunity || 85;
                defaultStatus.system_status.pattern_accuracy = metricsData.pattern_accuracy || 92.2;
            }
        } catch (error) {
            console.log('Supabase query failed, using defaults:', error.message);
        }
    }

    return defaultStatus;
}

// Get brain statistics
async function getBrainStats() {
    const supabase = getSupabase();

    const defaultBrain = {
        total_atoms: 166110,
        recent_24h: 0,
        sessions_today: 0,
        last_sync: new Date().toISOString()
    };

    if (supabase) {
        try {
            // Try to get atom counts from cloud sync
            const { data: atomData, count } = await supabase
                .from('atoms')
                .select('*', { count: 'exact', head: true });

            if (count !== null) {
                defaultBrain.total_atoms = count;
            }

            // Get recent activity
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            const { count: recentCount } = await supabase
                .from('atoms')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', yesterday.toISOString());

            if (recentCount !== null) {
                defaultBrain.recent_24h = recentCount;
            }
        } catch (error) {
            console.log('Brain stats query failed, using defaults:', error.message);
        }
    }

    return defaultBrain;
}

export async function handler(event, context) {
    // Handle CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }

    // Only allow GET
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Fetch Trinity and Brain status in parallel
        const [trinity, brain] = await Promise.all([
            getTrinityStatus(),
            getBrainStats()
        ]);

        const response = {
            trinity,
            brain,
            timestamp: new Date().toISOString(),
            source: 'netlify-serverless'
        };

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(response)
        };
    } catch (error) {
        console.error('Trinity status error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        };
    }
}
