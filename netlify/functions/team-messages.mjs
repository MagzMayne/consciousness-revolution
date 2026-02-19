// ═══════════════════════════════════════════════════════════════
// TEAM MESSAGES - Internal Dashboard Messaging System
// Commander can send messages that appear on team dashboards
// Created: 2026-02-18
// ═══════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js';
import {
    getSecureCORSHeaders,
    handlePreflight,
    successResponse,
    errorResponse,
    sanitizeString,
    checkRateLimitDistributed
} from './utils/security.mjs';

// ═══════════════════════════════════════════════════════════════
// SUPABASE CLIENT
// ═══════════════════════════════════════════════════════════════

function getSupabase() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_SECRET || process.env.SUPABASE_SERVICE_KEY;

    if (!url || !key) {
        return null;
    }

    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
}

// ═══════════════════════════════════════════════════════════════
// VALID RECIPIENTS (Team Members)
// ═══════════════════════════════════════════════════════════════

const TEAM_MEMBERS = [
    'commander',
    'tiger',
    'agent_r',
    'frances',
    'nero',
    'alex',
    'ryan',
    'josh_serrano',
    'toby',      // New operator
    'patrick',   // New operator
    'all'        // Broadcast to everyone
];

// Commander password for sending (simple auth)
const COMMANDER_KEY = process.env.COMMANDER_MESSAGE_KEY || 'consciousness137';

// ═══════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════

export async function handler(event) {
    const origin = event.headers.origin || event.headers.Origin || '';

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return handlePreflight(origin);
    }

    const supabase = getSupabase();

    // Fallback to in-memory if no Supabase
    if (!supabase) {
        return handleInMemory(event, origin);
    }

    try {
        // Rate limit
        const clientIP = event.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
        const rateCheck = await checkRateLimitDistributed(clientIP, 60, 60000);
        if (!rateCheck.allowed) {
            return errorResponse('Rate limit exceeded', origin, 429);
        }

        if (event.httpMethod === 'POST') {
            return await sendMessage(event, supabase, origin);
        } else if (event.httpMethod === 'GET') {
            return await getMessages(event, supabase, origin);
        } else {
            return errorResponse('Method not allowed', origin, 405);
        }

    } catch (error) {
        console.error('Team messages error:', error);
        return errorResponse('Internal server error', origin, 500);
    }
}

// ═══════════════════════════════════════════════════════════════
// SEND MESSAGE (POST)
// ═══════════════════════════════════════════════════════════════

async function sendMessage(event, supabase, origin) {
    let body;
    try {
        body = JSON.parse(event.body || '{}');
    } catch {
        return errorResponse('Invalid JSON', origin, 400);
    }

    const { key, to, message, priority, from } = body;

    // Validate commander key
    if (key !== COMMANDER_KEY) {
        return errorResponse('Unauthorized', origin, 401);
    }

    // Validate recipient
    if (!to || !TEAM_MEMBERS.includes(to.toLowerCase())) {
        return errorResponse(`Invalid recipient. Valid: ${TEAM_MEMBERS.join(', ')}`, origin, 400);
    }

    // Validate message
    if (!message || message.trim().length === 0) {
        return errorResponse('Message is required', origin, 400);
    }

    const sanitizedMessage = sanitizeString(message, 2000);
    const sanitizedFrom = sanitizeString(from || 'Commander', 50);
    const priorityLevel = ['low', 'normal', 'high', 'urgent'].includes(priority) ? priority : 'normal';

    // Determine recipients
    const recipients = to.toLowerCase() === 'all'
        ? TEAM_MEMBERS.filter(m => m !== 'all' && m !== 'commander')
        : [to.toLowerCase()];

    // Insert messages for each recipient
    const messages = recipients.map(recipient => ({
        recipient,
        sender: sanitizedFrom,
        message: sanitizedMessage,
        priority: priorityLevel,
        read: false,
        created_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
        .from('team_messages')
        .insert(messages)
        .select();

    if (error) {
        // Table might not exist - create it
        if (error.code === '42P01') {
            return errorResponse('Messages table not set up. Run setup first.', origin, 500);
        }
        console.error('Supabase error:', error);
        return errorResponse('Failed to send message', origin, 500);
    }

    return successResponse({
        sent: true,
        recipients: recipients.length,
        messageId: data?.[0]?.id
    }, origin);
}

// ═══════════════════════════════════════════════════════════════
// GET MESSAGES (GET)
// ═══════════════════════════════════════════════════════════════

async function getMessages(event, supabase, origin) {
    const params = event.queryStringParameters || {};
    const userId = params.user?.toLowerCase();
    const unreadOnly = params.unread === 'true';
    const markRead = params.mark_read === 'true';

    if (!userId || !TEAM_MEMBERS.includes(userId)) {
        return errorResponse('Valid user parameter required', origin, 400);
    }

    // Get messages for this user
    let query = supabase
        .from('team_messages')
        .select('*')
        .eq('recipient', userId)
        .order('created_at', { ascending: false })
        .limit(50);

    if (unreadOnly) {
        query = query.eq('read', false);
    }

    const { data, error } = await query;

    if (error) {
        if (error.code === '42P01') {
            // Table doesn't exist - return empty
            return successResponse({ messages: [], count: 0 }, origin);
        }
        console.error('Supabase error:', error);
        return errorResponse('Failed to get messages', origin, 500);
    }

    // Mark as read if requested
    if (markRead && data && data.length > 0) {
        const unreadIds = data.filter(m => !m.read).map(m => m.id);
        if (unreadIds.length > 0) {
            await supabase
                .from('team_messages')
                .update({ read: true })
                .in('id', unreadIds);
        }
    }

    return successResponse({
        messages: data || [],
        count: data?.length || 0,
        unread: data?.filter(m => !m.read).length || 0
    }, origin);
}

// ═══════════════════════════════════════════════════════════════
// IN-MEMORY FALLBACK (if no Supabase)
// ═══════════════════════════════════════════════════════════════

const memoryMessages = new Map();

function handleInMemory(event, origin) {
    if (event.httpMethod === 'POST') {
        let body;
        try {
            body = JSON.parse(event.body || '{}');
        } catch {
            return errorResponse('Invalid JSON', origin, 400);
        }

        const { key, to, message, from } = body;

        if (key !== COMMANDER_KEY) {
            return errorResponse('Unauthorized', origin, 401);
        }

        const recipients = to === 'all'
            ? TEAM_MEMBERS.filter(m => m !== 'all' && m !== 'commander')
            : [to.toLowerCase()];

        recipients.forEach(r => {
            if (!memoryMessages.has(r)) {
                memoryMessages.set(r, []);
            }
            memoryMessages.get(r).push({
                id: Date.now(),
                message: sanitizeString(message, 2000),
                sender: from || 'Commander',
                created_at: new Date().toISOString(),
                read: false
            });
        });

        return successResponse({ sent: true, recipients: recipients.length, note: 'Using in-memory storage' }, origin);

    } else if (event.httpMethod === 'GET') {
        const params = event.queryStringParameters || {};
        const userId = params.user?.toLowerCase();

        if (!userId) {
            return errorResponse('User parameter required', origin, 400);
        }

        const messages = memoryMessages.get(userId) || [];

        return successResponse({
            messages,
            count: messages.length,
            unread: messages.filter(m => !m.read).length,
            note: 'Using in-memory storage'
        }, origin);
    }

    return errorResponse('Method not allowed', origin, 405);
}

export default { handler };
