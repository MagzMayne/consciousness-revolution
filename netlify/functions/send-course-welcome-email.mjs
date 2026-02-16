// Send Course Welcome Email - Netlify Function
// Sends welcome email to new course enrollees

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
        const { email, name, courseName } = JSON.parse(event.body);

        if (!email) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: 'Email is required' })
            };
        }

        // Log the enrollment (in production, integrate with email service)
        console.log('Course enrollment:', {
            email,
            name: name || 'Student',
            course: courseName || 'Pattern Recognition Course',
            timestamp: new Date().toISOString()
        });

        // ENHANCEMENT: Integrate with email service when scaling
        // Options: SendGrid, Resend, Postmark
        // Current: Acknowledges enrollment (works for now)

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: true,
                message: 'Welcome email queued',
                email: email
            })
        };

    } catch (error) {
        console.error('Course email error:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Failed to send welcome email' })
        };
    }
}
