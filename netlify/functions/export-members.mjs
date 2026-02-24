/**
 * EXPORT MEMBERS TO CSV
 * =====================
 * Downloads all Discord members as CSV spreadsheet
 *
 * Endpoint: /.netlify/functions/export-members
 * Auth: Requires admin key
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// CSV escape helper
function escapeCSV(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

// Convert data to CSV
function toCSV(data, columns) {
    const header = columns.map(col => escapeCSV(col.label || col.key)).join(',');
    const rows = data.map(row =>
        columns.map(col => escapeCSV(row[col.key])).join(',')
    );
    return [header, ...rows].join('\n');
}

export default async (request, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
    }

    try {
        // Check admin authorization (simple key check)
        const url = new URL(request.url);
        const adminKey = url.searchParams.get('key');
        const format = url.searchParams.get('format') || 'csv';
        const filter = url.searchParams.get('filter') || 'all';

        // Simple admin key validation (should match env var)
        const validKey = process.env.ADMIN_EXPORT_KEY || 'consciousness137';
        if (adminKey !== validKey) {
            return new Response(JSON.stringify({
                error: 'Unauthorized',
                hint: 'Add ?key=YOUR_ADMIN_KEY to URL'
            }), {
                status: 401,
                headers: { ...headers, 'Content-Type': 'application/json' }
            });
        }

        // Build query
        let query = supabase
            .from('discord_users')
            .select('*')
            .order('created_at', { ascending: false });

        // Apply filters
        if (filter === 'verified') {
            query = query.eq('verified', true);
        } else if (filter === 'pending') {
            query = query.eq('verification_status', 'pending');
        } else if (filter === 'flagged') {
            query = query.eq('verification_status', 'flagged');
        }

        const { data: members, error } = await query;

        if (error) {
            throw new Error(`Database error: ${error.message}`);
        }

        // Define columns for export
        const columns = [
            { key: 'username', label: 'Username' },
            { key: 'discord_id', label: 'Discord ID' },
            { key: 'verification_status', label: 'Status' },
            { key: 'trust_tier', label: 'Trust Tier' },
            { key: 'total_xp', label: 'XP' },
            { key: 'current_level', label: 'Level' },
            { key: 'builder_score', label: 'Builder Score' },
            { key: 'verified', label: 'Verified' },
            { key: 'social_link', label: 'Social Link' },
            { key: 'intro_message', label: 'Intro Message' },
            { key: 'messages_count', label: 'Messages' },
            { key: 'tasks_completed', label: 'Tasks' },
            { key: 'joined_at', label: 'Joined At' },
            { key: 'verified_at', label: 'Verified At' },
            { key: 'last_active', label: 'Last Active' },
            { key: 'is_blocked', label: 'Blocked' },
            { key: 'review_notes', label: 'Review Notes' },
            { key: 'reviewed_by', label: 'Reviewed By' }
        ];

        if (format === 'json') {
            return new Response(JSON.stringify({
                success: true,
                count: members.length,
                exported_at: new Date().toISOString(),
                members: members
            }, null, 2), {
                status: 200,
                headers: {
                    ...headers,
                    'Content-Type': 'application/json'
                }
            });
        }

        // Default: CSV format
        const csv = toCSV(members, columns);
        const filename = `100x_members_${new Date().toISOString().split('T')[0]}.csv`;

        return new Response(csv, {
            status: 200,
            headers: {
                ...headers,
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        });

    } catch (error) {
        console.error('Export error:', error);
        return new Response(JSON.stringify({
            error: 'Export failed',
            message: error.message
        }), {
            status: 500,
            headers: { ...headers, 'Content-Type': 'application/json' }
        });
    }
};

export const config = {
    path: "/api/export-members"
};
