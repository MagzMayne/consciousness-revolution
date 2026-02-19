// Verify Beta Access - Server-side password validation
// Security: Password is checked server-side, not exposed in client
// Created: 2026-02-18

import crypto from 'crypto';
import {
    getSecureCORSHeaders,
    handlePreflight,
    checkRateLimit,
    anonymizeIP,
    errorResponse,
    successResponse
} from './utils/security.mjs';

// Hash the expected password for comparison
// The actual password is in BETA_ACCESS_CODE env var
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

export async function handler(event, context) {
    const origin = event.headers.origin || event.headers.Origin || '';

    if (event.httpMethod === 'OPTIONS') {
        return handlePreflight(origin);
    }

    if (event.httpMethod !== 'POST') {
        return errorResponse('Method not allowed', origin, 405);
    }

    // Rate limiting - 5 attempts per 15 minutes per IP
    const clientIP = event.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    const rateLimitCheck = checkRateLimit(`beta_${anonymizeIP(clientIP)}`, 5, 900000);
    if (!rateLimitCheck.allowed) {
        return errorResponse('Too many attempts. Please try again later.', origin, 429);
    }

    try {
        const { password } = JSON.parse(event.body || '{}');

        if (!password || typeof password !== 'string') {
            return errorResponse('Access code required', origin, 400);
        }

        // Get expected password from environment variable
        const expectedPassword = process.env.BETA_ACCESS_CODE || 'consciousness2025';

        // Constant-time comparison to prevent timing attacks
        const providedHash = hashPassword(password);
        const expectedHash = hashPassword(expectedPassword);

        if (crypto.timingSafeEqual(Buffer.from(providedHash), Buffer.from(expectedHash))) {
            // Generate a temporary access token
            const accessToken = crypto.randomBytes(32).toString('hex');
            const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

            return successResponse({
                valid: true,
                accessToken,
                expiresAt,
                redirectUrl: '/100x-work-area.html'
            }, origin);
        } else {
            return errorResponse('Invalid access code', origin, 401);
        }

    } catch (error) {
        console.error('Beta access error:', error);
        return errorResponse('Server error', origin, 500);
    }
}
