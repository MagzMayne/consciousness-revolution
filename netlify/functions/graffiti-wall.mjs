// GRAFFITI WALL - Signal Forge Community Message Board
// Underground communication - no algorithms, no censorship

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

const TABLE_NAME = 'graffiti_wall';

// CORS headers
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
};

export async function handler(event) {
    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers };
    }

    try {
        // GET - Fetch messages
        if (event.httpMethod === 'GET') {
            const { data, error } = await supabase
                .from(TABLE_NAME)
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(50);

            if (error) {
                console.error('Supabase error:', error);
                // Return empty array if table doesn't exist yet
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ messages: [] })
                };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ messages: data || [] })
            };
        }

        // POST - Add new message
        if (event.httpMethod === 'POST') {
            const body = JSON.parse(event.body || '{}');
            const { tag, content } = body;

            // Validate
            if (!content || content.trim().length === 0) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Message content required' })
                };
            }

            // Sanitize
            const sanitizedTag = (tag || 'ANON').slice(0, 15).replace(/[<>]/g, '');
            const sanitizedContent = content.slice(0, 280).replace(/[<>]/g, '');

            // Basic spam check - no repeated messages
            const { data: recent } = await supabase
                .from(TABLE_NAME)
                .select('content')
                .eq('content', sanitizedContent)
                .limit(1);

            if (recent && recent.length > 0) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Duplicate message' })
                };
            }

            // Insert
            const { data, error } = await supabase
                .from(TABLE_NAME)
                .insert([{
                    tag: sanitizedTag,
                    content: sanitizedContent,
                    timestamp: new Date().toISOString(),
                    ip_hash: hashIP(event.headers['x-forwarded-for'] || 'unknown')
                }])
                .select();

            if (error) {
                console.error('Insert error:', error);
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ error: 'Failed to save message' })
                };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, message: data[0] })
            };
        }

        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };

    } catch (err) {
        console.error('Graffiti wall error:', err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal error' })
        };
    }
}

// Simple hash for rate limiting (not for security)
function hashIP(ip) {
    let hash = 0;
    for (let i = 0; i < ip.length; i++) {
        const char = ip.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(16);
}
