// CYCLOTRON RADIO OUTBOUND API
// External systems poll for messages FROM the brain
// GET /api/radio-out?channel=ARAYA&receiver=user123
// Created: 2026-01-16

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Channels that require authentication to read
const PROTECTED_CHANNELS = ['COMMANDER', 'SYSTEM', 'TRINITY'];

export async function handler(event, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-Radio-Key',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Parse query params
    const params = event.queryStringParameters || {};
    const channel = params.channel?.toUpperCase();
    const receiver = params.receiver;
    const limit = Math.min(50, parseInt(params.limit) || 10);
    const markProcessed = params.mark_processed === 'true';

    // SECURITY: Protected channels and mark_processed require X-Radio-Key
    const requiresAuth = PROTECTED_CHANNELS.includes(channel) || markProcessed;
    if (requiresAuth) {
        const authKey = event.headers['x-radio-key'] || event.headers['X-Radio-Key'];
        if (authKey !== process.env.RADIO_API_KEY) {
            console.log(`⚠️ UNAUTHORIZED RADIO-OUT ATTEMPT: ${channel} mark=${markProcessed}`);
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({
                    error: 'Unauthorized - X-Radio-Key required for protected channels or mark_processed',
                    protected_channels: PROTECTED_CHANNELS
                })
            };
        }
    }

    if (!channel) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
                error: 'Channel required',
                usage: '/api/radio-out?channel=ARAYA&receiver=user123'
            })
        };
    }

    try {
        // If no Supabase, return empty (messages stay in local Cyclotron)
        if (!SUPABASE_URL || !SUPABASE_KEY) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    messages: [],
                    count: 0,
                    note: 'Radio operating in local-only mode (no Supabase)'
                })
            };
        }

        // Build query for pending outbound messages
        let url = `${SUPABASE_URL}/rest/v1/radio_messages?direction=eq.outbound&status=eq.pending&channel=eq.${channel}&order=priority.desc,created_at.asc&limit=${limit}`;

        if (receiver) {
            url += `&receiver=eq.${encodeURIComponent(receiver)}`;
        }

        const response = await fetch(url, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`Supabase query failed: ${response.status}`);
        }

        const messages = await response.json();

        // Mark as processed if requested
        if (markProcessed && messages.length > 0) {
            const ids = messages.map(m => m.id);
            const now = new Date().toISOString();

            // Batch update
            for (const id of ids) {
                await fetch(
                    `${SUPABASE_URL}/rest/v1/radio_messages?id=eq.${id}`,
                    {
                        method: 'PATCH',
                        headers: {
                            'apikey': SUPABASE_KEY,
                            'Authorization': `Bearer ${SUPABASE_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            status: 'delivered',
                            processed_at: now
                        })
                    }
                );
            }
        }

        // Clean response (remove internal fields)
        const cleaned = messages.map(m => ({
            id: m.id,
            subject: m.subject,
            content: m.content,
            priority: m.priority,
            created_at: m.created_at,
            response_to: m.response_to,
            metadata: m.metadata ? JSON.parse(m.metadata) : null
        }));

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                messages: cleaned,
                count: cleaned.length,
                channel,
                receiver: receiver || 'ALL'
            })
        };

    } catch (error) {
        console.error('Radio outbound error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to fetch messages',
                message: error.message
            })
        };
    }
}
