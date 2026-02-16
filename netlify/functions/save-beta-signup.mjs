// Save Beta Signup - Netlify Function
// Stores beta tester signups

export async function handler(event, context) {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { email, name, interest } = JSON.parse(event.body);

        if (!email) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: 'Email is required' })
            };
        }

        // For now, log the signup (in production, store in database)
        console.log('Beta signup:', { email, name, interest, timestamp: new Date().toISOString() });

        // ENHANCEMENT: Add to database/email list when scaling
        // Options: Airtable, Supabase, or simple JSON file
        // Current: Logs to Netlify function logs (works for now)

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: true,
                message: 'Welcome to the beta program!',
                email: email
            })
        };

    } catch (error) {
        console.error('Beta signup error:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Failed to process signup' })
        };
    }
}
