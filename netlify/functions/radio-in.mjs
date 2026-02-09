// CYCLOTRON RADIO INBOUND API
// External systems push messages INTO the brain
// POST /api/radio-in
// Created: 2026-01-16

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Generate unique message ID
function generateMsgId(prefix = 'IN') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${timestamp}-${random}`.toUpperCase();
}

// Valid channels for incoming messages
const VALID_CHANNELS = [
    'ARAYA',      // Araya chat messages
    'DISCORD',    // Discord bot messages
    'WEB',        // Website form submissions
    'TRINITY',    // Trinity terminal messages
    'SYSTEM',     // System notifications
    'COMMANDER',  // Direct to Commander (high priority)
    'FEEDBACK',   // User feedback
    'BUG'         // Bug reports
];

export async function handler(event, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-Radio-Key',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const data = JSON.parse(event.body || '{}');

        // Required fields
        const { channel, sender, content } = data;

        if (!channel || !sender || !content) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Missing required fields',
                    required: ['channel', 'sender', 'content']
                })
            };
        }

        // Validate channel
        if (!VALID_CHANNELS.includes(channel.toUpperCase())) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Invalid channel',
                    valid_channels: VALID_CHANNELS
                })
            };
        }

        // Optional fields
        const subject = data.subject || null;
        const priority = Math.min(10, Math.max(1, data.priority || 5));
        const metadata = data.metadata || {};
        const responseToId = data.response_to || null;

        // Generate message ID
        const msgId = generateMsgId('IN');
        const timestamp = new Date().toISOString();

        // Build message object
        const message = {
            id: msgId,
            direction: 'inbound',
            channel: channel.toUpperCase(),
            sender,
            receiver: 'CYCLOTRON',
            subject,
            content,
            priority,
            status: 'pending',
            created_at: timestamp,
            response_to: responseToId,
            metadata: JSON.stringify(metadata)
        };

        // Store in Supabase if available
        if (SUPABASE_URL && SUPABASE_KEY) {
            try {
                const response = await fetch(
                    `${SUPABASE_URL}/rest/v1/radio_messages`,
                    {
                        method: 'POST',
                        headers: {
                            'apikey': SUPABASE_KEY,
                            'Authorization': `Bearer ${SUPABASE_KEY}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=minimal'
                        },
                        body: JSON.stringify(message)
                    }
                );

                if (!response.ok) {
                    console.log('Supabase insert failed:', response.status);
                }
            } catch (e) {
                console.log('Supabase error:', e.message);
            }
        }

        // Always log to console (for Netlify logs)
        console.log('📥 RADIO INBOUND:', JSON.stringify({
            id: msgId,
            channel: message.channel,
            sender,
            content: content.substring(0, 100),
            priority,
            timestamp
        }));

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message_id: msgId,
                status: 'queued',
                note: 'Message delivered to Cyclotron brain'
            })
        };

    } catch (error) {
        console.error('Radio inbound error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to receive message',
                message: error.message
            })
        };
    }
}
