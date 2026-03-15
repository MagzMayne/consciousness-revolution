import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export default async (req) => {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const body = await req.json();
        const email = body.email;

        if (!email) {
            return new Response(JSON.stringify({ error: 'Email required' }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Save to Supabase
        const { error } = await supabase
            .from('guild_signups')
            .insert({ email, created_at: new Date().toISOString() });

        if (error) {
            console.error('Supabase error:', error);
            return new Response(JSON.stringify({ error: 'Failed to save' }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        console.error('Error:', err);
        return new Response(JSON.stringify({ error: 'Server error' }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export const config = { path: "/api/guild-signup" };
