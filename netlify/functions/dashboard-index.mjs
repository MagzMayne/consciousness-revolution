/**
 * DASHBOARD INDEX API
 * Query dashboards by date, owner, domain, purpose
 * 
 * GET /api/dashboard-index?date=2026-02-24
 * GET /api/dashboard-index?owner=Commander
 * GET /api/dashboard-index?domain=7_TRANSCEND
 * GET /api/dashboard-index?yesterday=true
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const params = event.queryStringParameters || {};

    try {
        let query = supabase
            .from('dashboard_index')
            .select('*')
            .order('updated_at', { ascending: false });

        // Filter by date
        if (params.date) {
            query = query.gte('created_at', params.date + 'T00:00:00')
                        .lt('created_at', params.date + 'T23:59:59');
        }

        // Yesterday shortcut
        if (params.yesterday === 'true') {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const dateStr = yesterday.toISOString().split('T')[0];
            query = query.gte('created_at', dateStr + 'T00:00:00')
                        .lt('created_at', dateStr + 'T23:59:59');
        }

        // Filter by owner
        if (params.owner) {
            query = query.ilike('owner', '%' + params.owner + '%');
        }

        // Filter by domain
        if (params.domain) {
            query = query.eq('domain', params.domain);
        }

        // Filter by type (cockpit, dashboard, hub)
        if (params.type) {
            query = query.eq('type', params.type);
        }

        // Filter by status
        if (params.status) {
            query = query.eq('status', params.status);
        }

        const { data, error } = await query.limit(100);

        if (error) throw error;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                count: data.length,
                filters: params,
                dashboards: data
            })
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};
