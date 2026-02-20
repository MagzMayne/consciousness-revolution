/**
 * security.mjs - Consciousness Revolution
 * ═══════════════════════════════════════════════════════════════════════════
 * Copyright (c) 2024-2026 Consciousness Revolution / Overkill Kulture LLC
 * All Rights Reserved. PROPRIETARY AND CONFIDENTIAL.
 *
 * This source code is protected intellectual property. Unauthorized copying,
 * modification, distribution, or use is strictly prohibited without explicit
 * written permission from the copyright holder.
 *
 * IP Classification: TIER 1 - TRADE SECRET
 * Contact: darrickpreble@proton.me
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════
// ZERO TRUST SECURITY UTILITIES
// Centralized security functions for all Netlify functions
// Created: 2026-02-16
// Updated: 2026-02-18 (Security Phase 3 - Distributed Rate Limiting)
// ═══════════════════════════════════════════════════════════════

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// ═══════════════════════════════════════════════════════════════
// CORS CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const ALLOWED_ORIGINS = [
    'https://consciousnessrevolution.io',
    'https://www.consciousnessrevolution.io',
    'https://conciousnessrevolution.io',
    'https://www.conciousnessrevolution.io',
    'http://localhost:8888',
    'http://localhost:3000',
    'http://127.0.0.1:8888'
];

/**
 * Get secure CORS headers with origin validation
 * @param {string} origin - Request origin
 * @returns {Object} CORS headers
 */
export function getSecureCORSHeaders(origin) {
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    
    return {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Max-Age': '86400', // 24 hours
        'Content-Type': 'application/json',
        // Security headers
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    };
}

// ═══════════════════════════════════════════════════════════════
// RATE LIMITING (Distributed via Supabase + In-Memory Fallback)
// ═══════════════════════════════════════════════════════════════

const rateLimitStore = new Map();

// Supabase client for distributed rate limiting
let supabaseClient = null;

function getSupabaseForRateLimit() {
    if (supabaseClient) return supabaseClient;

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_SECRET || process.env.SUPABASE_SERVICE_KEY;

    if (url && key) {
        supabaseClient = createClient(url, key, {
            auth: { autoRefreshToken: false, persistSession: false }
        });
    }
    return supabaseClient;
}

/**
 * Distributed rate limiter using Supabase with in-memory fallback
 * Persists across cold starts and works across all function instances
 * @param {string} identifier - IP or user ID
 * @param {number} maxRequests - Max requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Object} { allowed: boolean, resetAt: number }
 */
export async function checkRateLimitDistributed(identifier, maxRequests = 100, windowMs = 60000) {
    const supabase = getSupabaseForRateLimit();

    // If Supabase not configured, fall back to in-memory
    if (!supabase) {
        return checkRateLimit(identifier, maxRequests, windowMs);
    }

    const now = Date.now();
    const windowStart = now - windowMs;
    const key = `rate_${identifier}`;

    try {
        // Use a single upsert operation for atomic rate limit check
        const { data, error } = await supabase.rpc('check_rate_limit', {
            p_identifier: key,
            p_max_requests: maxRequests,
            p_window_ms: windowMs
        });

        // If RPC function exists and works, use it
        if (!error && data !== null) {
            return {
                allowed: data.allowed,
                resetAt: data.reset_at,
                count: data.count
            };
        }

        // Fallback: Direct table operations if RPC not available
        // Get current record
        const { data: existing } = await supabase
            .from('rate_limits')
            .select('count, window_start')
            .eq('identifier', key)
            .single();

        if (!existing || existing.window_start < windowStart) {
            // Create or reset window
            await supabase
                .from('rate_limits')
                .upsert({
                    identifier: key,
                    count: 1,
                    window_start: now,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'identifier' });

            return { allowed: true, resetAt: now + windowMs, count: 1 };
        }

        if (existing.count >= maxRequests) {
            return {
                allowed: false,
                resetAt: existing.window_start + windowMs,
                count: existing.count
            };
        }

        // Increment count
        await supabase
            .from('rate_limits')
            .update({
                count: existing.count + 1,
                updated_at: new Date().toISOString()
            })
            .eq('identifier', key);

        return {
            allowed: true,
            resetAt: existing.window_start + windowMs,
            count: existing.count + 1
        };

    } catch (err) {
        // On any error, fall back to in-memory
        console.warn('Distributed rate limit failed, using in-memory:', err.message);
        return checkRateLimit(identifier, maxRequests, windowMs);
    }
}

/**
 * Simple in-memory rate limiter (fallback when Supabase unavailable)
 * @param {string} identifier - IP or user ID
 * @param {number} maxRequests - Max requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Object} { allowed: boolean, resetAt: number }
 */
export function checkRateLimit(identifier, maxRequests = 100, windowMs = 60000) {
    const now = Date.now();
    const key = `rate_${identifier}`;

    if (!rateLimitStore.has(key)) {
        rateLimitStore.set(key, {
            count: 1,
            resetAt: now + windowMs
        });
        return { allowed: true, resetAt: now + windowMs };
    }

    const record = rateLimitStore.get(key);

    if (now > record.resetAt) {
        // Reset window
        rateLimitStore.set(key, {
            count: 1,
            resetAt: now + windowMs
        });
        return { allowed: true, resetAt: now + windowMs };
    }

    if (record.count >= maxRequests) {
        return { allowed: false, resetAt: record.resetAt };
    }

    record.count++;
    rateLimitStore.set(key, record);
    return { allowed: true, resetAt: record.resetAt };
}

/**
 * Clean up old rate limit records (in-memory)
 */
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
        if (now > record.resetAt + 60000) { // 1 minute grace period
            rateLimitStore.delete(key);
        }
    }
}, 300000); // Clean every 5 minutes

// ═══════════════════════════════════════════════════════════════
// INPUT VALIDATION & SANITIZATION
// ═══════════════════════════════════════════════════════════════

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid
 */
export function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 255;
}

/**
 * Validate UUID format
 * @param {string} uuid - UUID to validate
 * @returns {boolean} Is valid UUID
 */
export function isValidUUID(uuid) {
    if (!uuid || typeof uuid !== 'string') return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}

/**
 * Sanitize string input (prevent XSS)
 * @param {string} input - Input to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} Sanitized string
 */
export function sanitizeString(input, maxLength = 1000) {
    if (!input || typeof input !== 'string') return '';
    
    // Remove null bytes
    let sanitized = input.replace(/\0/g, '');
    
    // Trim whitespace
    sanitized = sanitized.trim();
    
    // Limit length
    if (sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
    }
    
    return sanitized;
}

/**
 * Validate and sanitize user input object
 * @param {Object} data - Input data
 * @param {Object} schema - Validation schema
 * @returns {Object} { valid: boolean, errors: string[], sanitized: Object }
 */
export function validateInput(data, schema) {
    const errors = [];
    const sanitized = {};
    
    for (const [field, rules] of Object.entries(schema)) {
        const value = data[field];
        
        // Check required
        if (rules.required && (value === undefined || value === null || value === '')) {
            errors.push(`${field} is required`);
            continue;
        }
        
        // Skip if not required and empty
        if (!rules.required && (value === undefined || value === null || value === '')) {
            continue;
        }
        
        // Type validation
        if (rules.type === 'email') {
            if (!isValidEmail(value)) {
                errors.push(`${field} must be a valid email`);
                continue;
            }
            sanitized[field] = sanitizeString(value, 255).toLowerCase();
        } else if (rules.type === 'uuid') {
            if (!isValidUUID(value)) {
                errors.push(`${field} must be a valid UUID`);
                continue;
            }
            sanitized[field] = value;
        } else if (rules.type === 'string') {
            sanitized[field] = sanitizeString(value, rules.maxLength || 1000);
            
            if (rules.minLength && sanitized[field].length < rules.minLength) {
                errors.push(`${field} must be at least ${rules.minLength} characters`);
            }
        } else if (rules.type === 'number') {
            const num = Number(value);
            if (isNaN(num)) {
                errors.push(`${field} must be a number`);
                continue;
            }
            if (rules.min !== undefined && num < rules.min) {
                errors.push(`${field} must be at least ${rules.min}`);
            }
            if (rules.max !== undefined && num > rules.max) {
                errors.push(`${field} must be at most ${rules.max}`);
            }
            sanitized[field] = num;
        } else if (rules.type === 'boolean') {
            sanitized[field] = Boolean(value);
        } else if (rules.type === 'array') {
            if (!Array.isArray(value)) {
                errors.push(`${field} must be an array`);
                continue;
            }
            if (rules.maxItems && value.length > rules.maxItems) {
                errors.push(`${field} can have at most ${rules.maxItems} items`);
            }
            sanitized[field] = value;
        }
        
        // Custom validator
        if (rules.validator && typeof rules.validator === 'function') {
            const customError = rules.validator(sanitized[field]);
            if (customError) {
                errors.push(customError);
            }
        }
    }
    
    return {
        valid: errors.length === 0,
        errors,
        sanitized
    };
}

// ═══════════════════════════════════════════════════════════════
// DATA ANONYMIZATION
// ═══════════════════════════════════════════════════════════════

/**
 * Anonymize IP address (remove last octet for IPv4, last 80 bits for IPv6)
 * @param {string} ip - IP address
 * @returns {string} Anonymized IP
 */
export function anonymizeIP(ip) {
    if (!ip) return null;
    
    // IPv4
    if (ip.includes('.')) {
        const parts = ip.split('.');
        if (parts.length === 4) {
            return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
        }
    }
    
    // IPv6
    if (ip.includes(':')) {
        const parts = ip.split(':');
        if (parts.length >= 4) {
            return `${parts[0]}:${parts[1]}:${parts[2]}:${parts[3]}::`;
        }
    }
    
    return null;
}

/**
 * Anonymize user agent (keep browser and OS, remove specific version details)
 * @param {string} userAgent - User agent string
 * @returns {string} Anonymized user agent
 */
export function anonymizeUserAgent(userAgent) {
    if (!userAgent) return null;
    
    // Extract major browser
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    
    // Extract OS
    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'Mac';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';
    
    return `${browser}/${os}`;
}

/**
 * Generate pseudonymous identifier (one-way hash)
 * @param {string} identifier - Original identifier
 * @param {string} salt - Salt for hashing
 * @returns {string} Pseudonymous ID
 */
export function pseudonymize(identifier, salt = process.env.ANONYMIZATION_SALT || 'default-salt') {
    if (!identifier) return null;
    return crypto.createHmac('sha256', salt)
        .update(identifier)
        .digest('hex')
        .substring(0, 16);
}

// ═══════════════════════════════════════════════════════════════
// ENCRYPTION (for sensitive data at rest)
// ═══════════════════════════════════════════════════════════════

const ENCRYPTION_KEY = process.env.DATA_ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypt sensitive data
 * @param {string} data - Data to encrypt
 * @returns {string} Encrypted data (base64) with IV and auth tag
 */
export function encrypt(data) {
    if (!ENCRYPTION_KEY || !data) {
        throw new Error('Encryption key not configured or no data provided');
    }
    
    try {
        const iv = crypto.randomBytes(16);
        // Use random salt per encryption operation for better security
        const salt = crypto.randomBytes(32);
        const key = crypto.scryptSync(ENCRYPTION_KEY, salt, 32);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        
        let encrypted = cipher.update(data, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        
        const authTag = cipher.getAuthTag();
        
        // Return salt:iv:authTag:encrypted
        return `${salt.toString('base64')}:${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
    } catch (error) {
        console.error('Encryption error:', error.message);
        // Don't fall back to unencrypted - throw error to prevent data leak
        throw new Error('Encryption failed');
    }
}

/**
 * Decrypt sensitive data
 * @param {string} encryptedData - Encrypted data
 * @returns {string} Decrypted data
 */
export function decrypt(encryptedData) {
    if (!ENCRYPTION_KEY || !encryptedData) {
        throw new Error('Encryption key not configured or no data provided');
    }
    
    try {
        const parts = encryptedData.split(':');
        if (parts.length !== 4) {
            throw new Error('Invalid encrypted data format');
        }
        
        const salt = Buffer.from(parts[0], 'base64');
        const iv = Buffer.from(parts[1], 'base64');
        const authTag = Buffer.from(parts[2], 'base64');
        const encrypted = parts[3];
        
        const key = crypto.scryptSync(ENCRYPTION_KEY, salt, 32);
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(encrypted, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error.message);
        // Don't fall back to returning encrypted data - throw error
        throw new Error('Decryption failed');
    }
}

// ═══════════════════════════════════════════════════════════════
// SECURE RESPONSE HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Create secure success response
 * @param {Object} data - Response data
 * @param {string} origin - Request origin
 * @param {number} statusCode - HTTP status code
 * @returns {Object} Response object
 */
export function successResponse(data, origin, statusCode = 200) {
    return {
        statusCode,
        headers: getSecureCORSHeaders(origin),
        body: JSON.stringify({
            success: true,
            data,
            timestamp: new Date().toISOString()
        })
    };
}

/**
 * Create secure error response
 * @param {string} message - Error message
 * @param {string} origin - Request origin
 * @param {number} statusCode - HTTP status code
 * @param {string} code - Error code
 * @returns {Object} Response object
 */
export function errorResponse(message, origin, statusCode = 400, code = null) {
    return {
        statusCode,
        headers: getSecureCORSHeaders(origin),
        body: JSON.stringify({
            success: false,
            error: message,
            ...(code && { code }),
            timestamp: new Date().toISOString()
        })
    };
}

/**
 * Handle CORS preflight request
 * @param {string} origin - Request origin
 * @returns {Object} Response object
 */
export function handlePreflight(origin) {
    return {
        statusCode: 204,
        headers: getSecureCORSHeaders(origin),
        body: ''
    };
}

// ═══════════════════════════════════════════════════════════════
// SECURE LOGGING (redact sensitive data)
// ═══════════════════════════════════════════════════════════════

const SENSITIVE_FIELDS = ['password', 'token', 'secret', 'key', 'authorization', 'cookie'];

/**
 * Redact sensitive fields from log data
 * @param {Object} data - Data to log
 * @returns {Object} Redacted data
 */
export function redactSensitiveData(data) {
    if (!data || typeof data !== 'object') return data;
    
    const redacted = Array.isArray(data) ? [...data] : { ...data };
    
    for (const key in redacted) {
        const lowerKey = key.toLowerCase();
        
        if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
            redacted[key] = '[REDACTED]';
        } else if (typeof redacted[key] === 'object' && redacted[key] !== null) {
            redacted[key] = redactSensitiveData(redacted[key]);
        }
    }
    
    return redacted;
}

/**
 * Secure console log
 * @param {string} message - Log message
 * @param {Object} data - Data to log
 */
export function secureLog(message, data = {}) {
    console.log(message, redactSensitiveData(data));
}

// ═══════════════════════════════════════════════════════════════
// JWT TOKEN VALIDATION
// ═══════════════════════════════════════════════════════════════

/**
 * Extract and validate JWT token from Authorization header
 * @param {Object} headers - Request headers
 * @returns {Object} { valid: boolean, token: string|null, error: string|null }
 */
export function validateAuthToken(headers) {
    const authHeader = headers.authorization || headers.Authorization;
    
    if (!authHeader) {
        return { valid: false, token: null, error: 'Missing authorization header' };
    }
    
    if (!authHeader.startsWith('Bearer ')) {
        return { valid: false, token: null, error: 'Invalid authorization format' };
    }
    
    const token = authHeader.substring(7).trim();
    
    if (!token || token.length < 20) {
        return { valid: false, token: null, error: 'Invalid token format' };
    }
    
    return { valid: true, token, error: null };
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default {
    getSecureCORSHeaders,
    checkRateLimit,
    checkRateLimitDistributed,
    isValidEmail,
    isValidUUID,
    sanitizeString,
    validateInput,
    anonymizeIP,
    anonymizeUserAgent,
    pseudonymize,
    encrypt,
    decrypt,
    successResponse,
    errorResponse,
    handlePreflight,
    redactSensitiveData,
    secureLog,
    validateAuthToken
};
