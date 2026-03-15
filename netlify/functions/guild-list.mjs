import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export default async (req) => {
    try {
        const { data, error } = await supabase
            .from('guild_signups')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            return new Response(JSON.stringify({ error: error.message }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ signups: data, count: data.length }), {
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

export const config = { path: "/api/guild-list" };
