// ═══════════════════════════════════════════════════════════════
// SECURITY MIDDLEWARE
// Composable middleware for Netlify Functions
// Created: 2026-02-18 (Security Phase 4)
// ═══════════════════════════════════════════════════════════════

import {
    getSecureCORSHeaders,
    handlePreflight,
    checkRateLimit,
    checkRateLimitDistributed,
    validateInput,
    anonymizeIP,
    secureLog,
    errorResponse,
    validateAuthToken
} from './security.mjs';
import { createClient } from '@supabase/supabase-js';

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE WRAPPER
// ═══════════════════════════════════════════════════════════════

/**
 * Compose multiple middleware functions
 * @param  {...Function} middlewares - Middleware functions
 * @returns {Function} Combined middleware
 */
export function compose(...middlewares) {
    return (handler) => {
        return middlewares.reduceRight((next, middleware) => {
            return middleware(next);
        }, handler);
    };
}

// ═══════════════════════════════════════════════════════════════
// CORS MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

/**
 * CORS middleware - handles preflight and adds security headers
 */
export function withCORS(handler) {
    return async (event, context) => {
        const origin = event.headers.origin || event.headers.Origin || '';

        // Handle preflight
        if (event.httpMethod === 'OPTIONS') {
            return handlePreflight(origin);
        }

        // Add origin to context for handlers
        context.origin = origin;

        return handler(event, context);
    };
}

// ═══════════════════════════════════════════════════════════════
// METHOD VALIDATION MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

/**
 * Method validation middleware
 * @param {string[]} allowedMethods - Array of allowed HTTP methods
 */
export function withMethods(allowedMethods) {
    return (handler) => {
        return async (event, context) => {
            const origin = event.headers.origin || event.headers.Origin || '';

            if (!allowedMethods.includes(event.httpMethod)) {
                return errorResponse(
                    `Method ${event.httpMethod} not allowed. Allowed: ${allowedMethods.join(', ')}`,
                    origin,
                    405
                );
            }

            return handler(event, context);
        };
    };
}

// ═══════════════════════════════════════════════════════════════
// RATE LIMITING MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

/**
 * Rate limiting middleware
 * @param {Object} options - Rate limit options
 * @param {string} options.keyPrefix - Prefix for rate limit key (e.g., 'login', 'api')
 * @param {number} options.maxRequests - Max requests per window
 * @param {number} options.windowMs - Window in milliseconds
 * @param {boolean} options.useDistributed - Use Supabase-backed rate limiting
 */
export function withRateLimit(options = {}) {
    const {
        keyPrefix = 'api',
        maxRequests = 100,
        windowMs = 60000,
        useDistributed = false
    } = options;

    return (handler) => {
        return async (event, context) => {
            const origin = event.headers.origin || event.headers.Origin || '';
            const clientIP = event.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
            const identifier = `${keyPrefix}_${anonymizeIP(clientIP)}`;

            const check = useDistributed
                ? await checkRateLimitDistributed(identifier, maxRequests, windowMs)
                : checkRateLimit(identifier, maxRequests, windowMs);

            if (!check.allowed) {
                secureLog('Rate limit exceeded', { keyPrefix, ip: anonymizeIP(clientIP) });

                return {
                    statusCode: 429,
                    headers: {
                        ...getSecureCORSHeaders(origin),
                        'Retry-After': Math.ceil((check.resetAt - Date.now()) / 1000).toString(),
                        'X-RateLimit-Limit': maxRequests.toString(),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': check.resetAt.toString()
                    },
                    body: JSON.stringify({
                        success: false,
                        error: 'Too many requests. Please try again later.',
                        retryAfter: Math.ceil((check.resetAt - Date.now()) / 1000)
                    })
                };
            }

            // Add rate limit info to context
            context.rateLimit = check;

            return handler(event, context);
        };
    };
}

// ═══════════════════════════════════════════════════════════════
// INPUT VALIDATION MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

/**
 * Input validation middleware
 * @param {Object} schema - Validation schema for request body
 */
export function withValidation(schema) {
    return (handler) => {
        return async (event, context) => {
            const origin = event.headers.origin || event.headers.Origin || '';

            // Parse body
            let body = {};
            if (event.body) {
                try {
                    body = JSON.parse(event.body);
                } catch (e) {
                    return errorResponse('Invalid JSON in request body', origin, 400);
                }
            }

            // Validate
            const validation = validateInput(body, schema);

            if (!validation.valid) {
                secureLog('Validation failed', { errors: validation.errors });
                return errorResponse(validation.errors.join(', '), origin, 400);
            }

            // Add validated data to context
            context.validatedBody = validation.sanitized;

            return handler(event, context);
        };
    };
}

// ═══════════════════════════════════════════════════════════════
// AUTHENTICATION MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

/**
 * Parse cookies from request
 */
function parseCookies(cookieHeader) {
    if (!cookieHeader) return {};
    return Object.fromEntries(
        cookieHeader.split(';').map(cookie => {
            const [key, ...val] = cookie.trim().split('=');
            return [key, val.join('=')];
        })
    );
}

/**
 * Authentication middleware - verifies JWT token
 * @param {Object} options - Auth options
 * @param {boolean} options.required - Whether auth is required (default: true)
 * @param {string[]} options.requiredRoles - Required user roles (optional)
 */
export function withAuth(options = {}) {
    const { required = true, requiredRoles = [] } = options;

    return (handler) => {
        return async (event, context) => {
            const origin = event.headers.origin || event.headers.Origin || '';

            // Try to get token from httpOnly cookie first, then Authorization header
            const cookies = parseCookies(event.headers.cookie);
            let token = cookies.access_token;

            // Fallback to Authorization header
            if (!token) {
                const authResult = validateAuthToken(event.headers);
                if (authResult.valid) {
                    token = authResult.token;
                }
            }

            if (!token) {
                if (required) {
                    return errorResponse('Authentication required', origin, 401);
                }
                // Auth optional and not provided - continue
                context.user = null;
                return handler(event, context);
            }

            // Verify token with Supabase
            try {
                const supabase = createClient(
                    process.env.SUPABASE_URL,
                    process.env.SUPABASE_SERVICE_ROLE_SECRET || process.env.SUPABASE_SERVICE_KEY,
                    { auth: { autoRefreshToken: false, persistSession: false } }
                );

                const { data: { user }, error } = await supabase.auth.getUser(token);

                if (error || !user) {
                    if (required) {
                        return errorResponse('Invalid or expired token', origin, 401);
                    }
                    context.user = null;
                    return handler(event, context);
                }

                // Check required roles if specified
                if (requiredRoles.length > 0) {
                    const { data: foundation } = await supabase
                        .from('user_foundations')
                        .select('is_admin, account_tier')
                        .eq('user_id', user.id)
                        .single();

                    const userRoles = [];
                    if (foundation?.is_admin) userRoles.push('admin');
                    if (foundation?.account_tier) userRoles.push(foundation.account_tier);

                    const hasRole = requiredRoles.some(role => userRoles.includes(role));

                    if (!hasRole) {
                        return errorResponse('Insufficient permissions', origin, 403);
                    }

                    context.userRoles = userRoles;
                }

                // Add user to context
                context.user = user;
                context.supabase = supabase;

                return handler(event, context);

            } catch (error) {
                secureLog('Auth middleware error', { error: error.message });

                if (required) {
                    return errorResponse('Authentication error', origin, 500);
                }

                context.user = null;
                return handler(event, context);
            }
        };
    };
}

// ═══════════════════════════════════════════════════════════════
// ERROR BOUNDARY MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

/**
 * Error boundary middleware - catches all errors
 */
export function withErrorBoundary(handler) {
    return async (event, context) => {
        const origin = event.headers.origin || event.headers.Origin || '';

        try {
            return await handler(event, context);
        } catch (error) {
            secureLog('Unhandled error', {
                error: error.message,
                stack: error.stack?.split('\n').slice(0, 3).join('\n')
            });

            return errorResponse(
                'An unexpected error occurred. Please try again.',
                origin,
                500
            );
        }
    };
}

// ═══════════════════════════════════════════════════════════════
// LOGGING MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

/**
 * Request logging middleware
 */
export function withLogging(handler) {
    return async (event, context) => {
        const startTime = Date.now();
        const clientIP = event.headers['x-forwarded-for']?.split(',')[0] || 'unknown';

        secureLog('Request started', {
            method: event.httpMethod,
            path: event.path,
            ip: anonymizeIP(clientIP)
        });

        const response = await handler(event, context);

        secureLog('Request completed', {
            method: event.httpMethod,
            path: event.path,
            statusCode: response.statusCode,
            duration: Date.now() - startTime
        });

        return response;
    };
}

// ═══════════════════════════════════════════════════════════════
// PRESET MIDDLEWARE STACKS
// ═══════════════════════════════════════════════════════════════

/**
 * Standard public API middleware stack
 * - CORS, Rate Limiting, Error Boundary, Logging
 */
export function publicAPI(options = {}) {
    const {
        methods = ['GET', 'POST'],
        rateLimit = { maxRequests: 100, windowMs: 60000 }
    } = options;

    return compose(
        withErrorBoundary,
        withLogging,
        withCORS,
        withMethods(methods),
        withRateLimit(rateLimit)
    );
}

/**
 * Protected API middleware stack (requires authentication)
 * - CORS, Auth, Rate Limiting, Error Boundary, Logging
 */
export function protectedAPI(options = {}) {
    const {
        methods = ['GET', 'POST'],
        rateLimit = { maxRequests: 100, windowMs: 60000 },
        requiredRoles = []
    } = options;

    return compose(
        withErrorBoundary,
        withLogging,
        withCORS,
        withMethods(methods),
        withAuth({ required: true, requiredRoles }),
        withRateLimit(rateLimit)
    );
}

/**
 * Admin API middleware stack (requires admin role)
 */
export function adminAPI(options = {}) {
    return protectedAPI({
        ...options,
        requiredRoles: ['admin'],
        rateLimit: { maxRequests: 50, windowMs: 60000 }
    });
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default {
    compose,
    withCORS,
    withMethods,
    withRateLimit,
    withValidation,
    withAuth,
    withErrorBoundary,
    withLogging,
    publicAPI,
    protectedAPI,
    adminAPI
};
