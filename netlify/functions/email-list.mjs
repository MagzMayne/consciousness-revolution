import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export default async (req) => {
    try {
        const url = new URL(req.url);
        const source = url.searchParams.get('source');

        let query = supabase
            .from('email_signups')
            .select('*')
            .order('created_at', { ascending: false });

        if (source) {
            query = query.eq('source', source);
        }

        const { data, error } = await query.limit(100);

        if (error) {
            return new Response(JSON.stringify({ error: error.message }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Group by source for summary
        const summary = {};
        data.forEach(row => {
            summary[row.source] = (summary[row.source] || 0) + 1;
        });

        return new Response(JSON.stringify({ 
            signups: data, 
            total: data.length,
            by_source: summary
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export const config = { path: "/api/email-list" };
