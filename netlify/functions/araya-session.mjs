// ARAYA Session Management
// JWT-based authentication with cookie + localStorage fallback
// Built: March 6, 2026 by C1 Mechanic

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_ME_IN_PRODUCTION';
const JWT_EXPIRY = '30d'; // 30 days

export async function handler(event) {
    // CORS
    const corsOrigin = event.headers.origin || 'https://conciousnessrevolution.io';

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': corsOrigin,
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Credentials': 'true'
            }
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: { 'Access-Control-Allow-Origin': corsOrigin },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    const { action, email, token } = JSON.parse(event.body || '{}');

    switch (action) {
        case 'create_session': {
            // User just logged in - create JWT
            if (!email) {
                return {
                    statusCode: 400,
                    headers: { 'Access-Control-Allow-Origin': corsOrigin },
                    body: JSON.stringify({ error: 'Email required' })
                };
            }

            const sessionToken = jwt.sign(
                {
                    email: email.toLowerCase(),
                    created: Date.now(),
                    type: 'araya_session'
                },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRY }
            );

            console.log('[SESSION] Created for:', email);

            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': corsOrigin,
                    'Access-Control-Allow-Credentials': 'true',
                    'Set-Cookie': `araya_session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`
                },
                body: JSON.stringify({
                    success: true,
                    token: sessionToken,
                    email: email.toLowerCase()
                })
            };
        }

        case 'verify_session': {
            // Backend validates JWT
            if (!token) {
                return {
                    statusCode: 200,
                    headers: { 'Access-Control-Allow-Origin': corsOrigin },
                    body: JSON.stringify({ valid: false })
                };
            }

            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                console.log('[SESSION] Verified for:', decoded.email);

                return {
                    statusCode: 200,
                    headers: { 'Access-Control-Allow-Origin': corsOrigin },
                    body: JSON.stringify({
                        valid: true,
                        email: decoded.email,
                        created: decoded.created
                    })
                };
            } catch (err) {
                console.log('[SESSION] Verification failed:', err.message);
                return {
                    statusCode: 200,
                    headers: { 'Access-Control-Allow-Origin': corsOrigin },
                    body: JSON.stringify({ valid: false, error: err.message })
                };
            }
        }

        case 'destroy_session': {
            console.log('[SESSION] Destroyed');
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': corsOrigin,
                    'Set-Cookie': 'araya_session=; Path=/; Max-Age=0'
                },
                body: JSON.stringify({ success: true })
            };
        }

        default:
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': corsOrigin },
                body: JSON.stringify({ error: 'Invalid action' })
            };
    }
}
