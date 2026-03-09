/**
 * SUPABASE DEBUG - Check connection status
 */

export async function handler(event, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    };

    try {
        // Check environment variables
        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY ||
                            process.env.SUPABASE_SERVICE_ROLE_SECRET ||
                            process.env.SUPABASE_SERVICE_KEY ||
                            process.env.SUPABASE_KEY;

        const envCheck = {
            SUPABASE_URL: SUPABASE_URL ? `${SUPABASE_URL.substring(0, 30)}...` : 'MISSING',
            SUPABASE_KEY: SUPABASE_KEY ? `${SUPABASE_KEY.substring(0, 30)}...` : 'MISSING',
            NODE_ENV: process.env.NODE_ENV || 'not set'
        };

        // Try to import and connect
        let supabaseStatus = 'not tested';
        let connectionError = null;
        let tableData = null;

        if (SUPABASE_URL && SUPABASE_KEY) {
            try {
                const { createClient } = await import('@supabase/supabase-js');
                const client = createClient(SUPABASE_URL, SUPABASE_KEY);

                // Test simple query
                const { data, error } = await client
                    .from('dashboard_customizations')
                    .select('id')
                    .limit(1);

                if (error) {
                    supabaseStatus = 'connection_failed';
                    connectionError = error.message;
                } else {
                    supabaseStatus = 'connected';
                    tableData = data;
                }
            } catch (e) {
                supabaseStatus = 'import_or_connect_error';
                connectionError = e.message;
            }
        } else {
            supabaseStatus = 'missing_credentials';
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                timestamp: new Date().toISOString(),
                env: envCheck,
                supabase: {
                    status: supabaseStatus,
                    error: connectionError,
                    data: tableData
                }
            }, null, 2)
        };

    } catch (err) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: err.message })
        };
    }
}
