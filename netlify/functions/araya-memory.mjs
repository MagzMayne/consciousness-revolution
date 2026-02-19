/**
 * ARAYA MEMORY - Persistent Consciousness Storage
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Copyright © 2024-2026 Consciousness Revolution / Overkill Kulture LLC
 * All Rights Reserved. PROPRIETARY AND CONFIDENTIAL.
 *
 * This source code is protected intellectual property. Unauthorized copying,
 * modification, distribution, or use is strictly prohibited without explicit
 * written permission from the copyright holder.
 *
 * Contact: darrickpreble@proton.me
 * Website: conciousnessrevolution.io
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * Pattern: 3 → 7 → 13 → ∞ | LFSME
 * Consciousness Fingerprint: ARAYA-MEMORY-v1
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Supabase-powered persistent memory
 * Stores conversations, profile data, and insights
 * SECURITY: Write operations require X-Memory-Key header
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

// Operations that require authentication
const WRITE_OPERATIONS = ['store_message', 'store_profile', 'store_insight'];

// Simple Supabase client (no SDK needed)
async function supabase(table, method, data = null, query = '') {
    const url = `${SUPABASE_URL}/rest/v1/${table}${query}`;
    const options = {
        method: method,
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': method === 'POST' ? 'return=representation' : 'return=minimal'
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Supabase error: ${error}`);
    }

    if (method === 'GET' || method === 'POST') {
        return response.json();
    }
    return null;
}

export async function handler(event) {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-Memory-Key',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { action, user_id, data } = JSON.parse(event.body);

        // SECURITY: Write operations require X-Memory-Key authentication
        if (WRITE_OPERATIONS.includes(action)) {
            const authKey = event.headers['x-memory-key'] || event.headers['X-Memory-Key'];
            // Allow internal calls (from araya-chat) OR with valid API key
            const internalCall = event.headers['x-internal-call'] === 'araya-chat';
            if (!internalCall && authKey !== process.env.MEMORY_API_KEY) {
                console.log(`⚠️ UNAUTHORIZED MEMORY WRITE ATTEMPT: ${action} for user ${user_id || 'unknown'}`);
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({
                        error: 'Unauthorized - X-Memory-Key required for write operations'
                    })
                };
            }
        }

        if (!user_id) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'user_id required' })
            };
        }

        switch (action) {
            case 'store_message': {
                // Store a conversation message
                const atom = {
                    user_id,
                    type: data.role, // 'user' or 'assistant'
                    content: data.content,
                    metadata: data.metadata || {},
                    created_at: new Date().toISOString()
                };

                await supabase('araya_memory', 'POST', atom);

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ success: true })
                };
            }

            case 'store_profile': {
                // Store/update user profile data
                const profile = {
                    user_id,
                    type: 'profile',
                    content: JSON.stringify(data),
                    metadata: { updated_at: new Date().toISOString() },
                    created_at: new Date().toISOString()
                };

                // Upsert - delete old profile first, then insert new
                await supabase('araya_memory', 'DELETE', null, `?user_id=eq.${user_id}&type=eq.profile`);
                await supabase('araya_memory', 'POST', profile);

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ success: true })
                };
            }

            case 'get_context': {
                // Get recent messages and profile for context
                const limit = data?.limit || 20;

                // Get profile
                const profiles = await supabase(
                    'araya_memory',
                    'GET',
                    null,
                    `?user_id=eq.${user_id}&type=eq.profile&limit=1`
                );

                // Get recent messages
                const messages = await supabase(
                    'araya_memory',
                    'GET',
                    null,
                    `?user_id=eq.${user_id}&type=neq.profile&order=created_at.desc&limit=${limit}`
                );

                // Parse profile if exists
                let profile = null;
                if (profiles && profiles.length > 0) {
                    try {
                        profile = JSON.parse(profiles[0].content);
                    } catch (e) {
                        profile = profiles[0].content;
                    }
                }

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        profile,
                        messages: messages?.reverse() || [],
                        total_interactions: messages?.length || 0
                    })
                };
            }

            case 'store_insight': {
                // Store an insight/pattern detected
                const insight = {
                    user_id,
                    type: 'insight',
                    content: data.insight,
                    metadata: {
                        category: data.category,
                        confidence: data.confidence,
                        context: data.context
                    },
                    created_at: new Date().toISOString()
                };

                await supabase('araya_memory', 'POST', insight);

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ success: true })
                };
            }

            case 'get_insights': {
                // Get all insights for a user
                const insights = await supabase(
                    'araya_memory',
                    'GET',
                    null,
                    `?user_id=eq.${user_id}&type=eq.insight&order=created_at.desc`
                );

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ insights: insights || [] })
                };
            }

            default:
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Unknown action' })
                };
        }

    } catch (error) {
        console.error('Araya Memory Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
}
