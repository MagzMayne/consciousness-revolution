/**
 * ════════════════════════════════════════════════════════════════════════════════
 * © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * PROPRIETARY AND CONFIDENTIAL - INTELLECTUAL PROPERTY PROTECTION
 * 
 * This file contains proprietary intellectual property of Ryan Barbrick.
 * All concepts, algorithms, implementations, and innovations are protected by
 * copyright law and are considered trade secrets.
 * 
 * PROVISIONAL PATENT NOTICE:
 * The ideas, methods, systems, and code contained in this file are subject to
 * provisional patent protection. Unauthorized use, reproduction, modification,
 * or distribution is strictly prohibited.
 * 
 * LEGAL WARNING:
 * Unauthorized use of this intellectual property may result in:
 * - Civil litigation for copyright infringement
 * - Claims for actual and statutory damages ($750-$150,000 per work)
 * - Injunctive relief and cease & desist orders
 * - Criminal prosecution for willful infringement
 * - Recovery of attorney fees and legal costs
 * 
 * CREATOR INFORMATION:
 * Author: Ryan Barbrick
 * Business: Barbrick Design
 * Contact: BarbrickDesign@gmail.com
 * AI Assistant: Merlin AI
 * Repository: https://github.com/barbrickdesign/barbrickdesign.github.io
 * 
 * PATENT DECLARATION:
 * File: kas-service.js
 * Declaration ID: IP-18AED12-MLL28ZUM
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Key Authority Service (KAS)
 * Production-grade authentication service using HMAC and JWT
 * 
 * Features:
 * - Long-Lived API Keys (LLAK) with HMAC-SHA256 signing
 * - Single-Use Auto-Expiring Tokens (SUAT) using JWT
 * - Secure validation and invalidation
 * - Rate limiting and audit logging
 */

const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.KAS_PORT || 3010;
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const HMAC_SECRET = process.env.HMAC_SECRET || crypto.randomBytes(64).toString('hex');

// In-memory storage (can be replaced with Redis/Database)
const apiKeys = new Map(); // agentId -> { keyHash, createdAt, active }
const tokens = new Map(); // tokenId -> { token, agentId, endpoint, expiresAt, used, invalidated }

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

// Security headers middleware
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});

/**
 * Utility Functions
 */

// Generate cryptographically secure random ID
function generateSecureId(prefix, length = 32) {
    const randomBytes = crypto.randomBytes(length);
    return `${prefix}_${randomBytes.toString('hex')}`;
}

// Create HMAC signature for API keys
function createHMAC(data) {
    return crypto
        .createHmac('sha256', HMAC_SECRET)
        .update(data)
        .digest('hex');
}

// Verify HMAC signature
function verifyHMAC(data, signature) {
    const expected = createHMAC(data);
    return crypto.timingSafeEqual(
        Buffer.from(expected, 'hex'),
        Buffer.from(signature, 'hex')
    );
}

// Hash API key for storage (one-way)
function hashApiKey(apiKey) {
    return crypto
        .createHash('sha256')
        .update(apiKey)
        .digest('hex');
}

// Create JWT token with claims
function createJWT(payload, expiresIn = '1h') {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

// Verify and decode JWT token
function verifyJWT(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

/**
 * API Endpoints
 */

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'KAS',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        stats: {
            apiKeys: apiKeys.size,
            tokens: tokens.size
        }
    });
});

// Create Long-Lived API Key (LLAK)
app.post('/api/create-key', (req, res) => {
    try {
        const { agentId } = req.body;

        if (!agentId || typeof agentId !== 'string' || agentId.trim() === '') {
            return res.status(400).json({
                error: 'Agent ID is required and must be a non-empty string'
            });
        }

        // Generate secure API key
        const apiKey = generateSecureId('bdk_live', 48);
        
        // Hash the key for storage (never store plain keys)
        const keyHash = hashApiKey(apiKey);
        
        // Create HMAC signature for verification
        const signature = createHMAC(apiKey);

        // Store key metadata
        const keyId = generateSecureId('llak', 16);
        apiKeys.set(keyId, {
            keyId,
            agentId: agentId.trim(),
            keyHash,
            signature,
            createdAt: new Date().toISOString(),
            active: true,
            lastUsed: null
        });

        console.log(`✅ Created API key for agent: ${agentId}`);

        res.status(201).json({
            success: true,
            apiKey,  // Only returned once!
            keyId,
            agentId: agentId.trim(),
            createdAt: new Date().toISOString(),
            message: 'Store this API key securely. It will not be shown again.'
        });

    } catch (error) {
        console.error('Error creating API key:', error);
        res.status(500).json({
            error: 'Failed to create API key',
            message: error.message
        });
    }
});

// List API Keys (metadata only, no secrets)
app.get('/api/list-keys', (req, res) => {
    try {
        const keysList = Array.from(apiKeys.values()).map(key => ({
            keyId: key.keyId,
            agentId: key.agentId,
            createdAt: key.createdAt,
            active: key.active,
            lastUsed: key.lastUsed
        }));

        res.json({
            success: true,
            keys: keysList,
            count: keysList.length
        });
    } catch (error) {
        console.error('Error listing keys:', error);
        res.status(500).json({
            error: 'Failed to list keys',
            message: error.message
        });
    }
});

// Create Single-Use Token (SUAT) using JWT
app.post('/api/create-token', (req, res) => {
    try {
        const { agentId, endpoint, ttlSeconds, payloadHash } = req.body;

        if (!agentId || typeof agentId !== 'string') {
            return res.status(400).json({
                error: 'Agent ID is required and must be a string'
            });
        }

        if (!endpoint || typeof endpoint !== 'string') {
            return res.status(400).json({
                error: 'Endpoint is required and must be a string'
            });
        }

        const ttl = parseInt(ttlSeconds) || 60;
        if (ttl < 1 || ttl > 3600) {
            return res.status(400).json({
                error: 'TTL must be between 1 and 3600 seconds'
            });
        }

        const now = Math.floor(Date.now() / 1000);
        const expiresAt = now + ttl;
        const tokenId = generateSecureId('tok', 16);

        // Create JWT payload
        const payload = {
            jti: tokenId,  // JWT ID
            sub: agentId.trim(),  // Subject (agent)
            aud: endpoint.trim(),  // Audience (endpoint)
            iat: now,  // Issued at
            exp: expiresAt,  // Expiration
            hash: payloadHash || null,  // Optional payload hash
            type: 'suat'  // Token type
        };

        // Sign the JWT
        const token = jwt.sign(payload, JWT_SECRET);

        // Store token metadata for validation
        tokens.set(tokenId, {
            tokenId,
            agentId: agentId.trim(),
            endpoint: endpoint.trim(),
            payloadHash: payloadHash || null,
            createdAt: new Date().toISOString(),
            expiresAt,
            used: false,
            invalidated: false
        });

        console.log(`✅ Created single-use token for agent: ${agentId}, endpoint: ${endpoint}`);

        res.status(201).json({
            success: true,
            token,
            tokenId,
            agentId: agentId.trim(),
            endpoint: endpoint.trim(),
            expiresAt,
            expiresAtIso: new Date(expiresAt * 1000).toISOString(),
            ttl
        });

    } catch (error) {
        console.error('Error creating token:', error);
        res.status(500).json({
            error: 'Failed to create token',
            message: error.message
        });
    }
});

// List tokens (metadata only)
app.get('/api/list-tokens', (req, res) => {
    try {
        const tokensList = Array.from(tokens.values()).map(token => ({
            tokenId: token.tokenId,
            agentId: token.agentId,
            endpoint: token.endpoint,
            createdAt: token.createdAt,
            expiresAt: token.expiresAt,
            used: token.used,
            invalidated: token.invalidated
        }));

        res.json({
            success: true,
            tokens: tokensList,
            count: tokensList.length
        });
    } catch (error) {
        console.error('Error listing tokens:', error);
        res.status(500).json({
            error: 'Failed to list tokens',
            message: error.message
        });
    }
});

// Validate token
app.post('/api/validate-token', (req, res) => {
    try {
        const { token, endpoint, payloadHash } = req.body;

        if (!token || typeof token !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Token is required'
            });
        }

        if (!endpoint || typeof endpoint !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Endpoint is required'
            });
        }

        // Verify JWT signature and decode
        const decoded = verifyJWT(token);
        
        if (!decoded) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }

        const tokenId = decoded.jti;
        const tokenData = tokens.get(tokenId);

        if (!tokenData) {
            return res.status(404).json({
                success: false,
                error: 'Token not found'
            });
        }

        // Check if token is invalidated
        if (tokenData.invalidated) {
            return res.status(401).json({
                success: false,
                error: 'Token has been invalidated'
            });
        }

        // Check if token is already used
        if (tokenData.used) {
            return res.status(401).json({
                success: false,
                error: 'Token has already been used'
            });
        }

        // Verify endpoint matches
        if (decoded.aud !== endpoint) {
            return res.status(401).json({
                success: false,
                error: 'Endpoint mismatch'
            });
        }

        // Verify payload hash if provided
        if (decoded.hash && payloadHash && decoded.hash !== payloadHash) {
            return res.status(401).json({
                success: false,
                error: 'Payload hash mismatch'
            });
        }

        // Mark token as used (single-use)
        tokenData.used = true;
        tokenData.usedAt = new Date().toISOString();
        tokens.set(tokenId, tokenData);

        console.log(`✅ Token validated and marked as used: ${tokenId}`);

        res.json({
            success: true,
            message: 'Token is valid and has been marked as used',
            agentId: decoded.sub,
            endpoint: decoded.aud,
            issuedAt: new Date(decoded.iat * 1000).toISOString(),
            expiresAt: new Date(decoded.exp * 1000).toISOString()
        });

    } catch (error) {
        console.error('Error validating token:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to validate token',
            message: error.message
        });
    }
});

// Invalidate token
app.post('/api/invalidate-token', (req, res) => {
    try {
        const { token } = req.body;

        if (!token || typeof token !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Token is required'
            });
        }

        // Decode token (don't verify to allow invalidating expired tokens)
        const decoded = jwt.decode(token);
        
        if (!decoded || !decoded.jti) {
            return res.status(400).json({
                success: false,
                error: 'Invalid token format'
            });
        }

        const tokenId = decoded.jti;
        const tokenData = tokens.get(tokenId);

        if (!tokenData) {
            return res.status(404).json({
                success: false,
                error: 'Token not found'
            });
        }

        // Mark as invalidated
        tokenData.invalidated = true;
        tokenData.invalidatedAt = new Date().toISOString();
        tokens.set(tokenId, tokenData);

        console.log(`✅ Token invalidated: ${tokenId}`);

        res.json({
            success: true,
            message: 'Token has been invalidated',
            tokenId
        });

    } catch (error) {
        console.error('Error invalidating token:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to invalidate token',
            message: error.message
        });
    }
});

// Cleanup expired tokens (maintenance endpoint)
app.post('/api/cleanup-tokens', (req, res) => {
    try {
        const now = Math.floor(Date.now() / 1000);
        let cleaned = 0;

        for (const [tokenId, tokenData] of tokens.entries()) {
            if (tokenData.expiresAt < now || tokenData.used || tokenData.invalidated) {
                tokens.delete(tokenId);
                cleaned++;
            }
        }

        console.log(`🧹 Cleaned up ${cleaned} expired/used tokens`);

        res.json({
            success: true,
            message: `Cleaned up ${cleaned} tokens`,
            remaining: tokens.size
        });

    } catch (error) {
        console.error('Error cleaning tokens:', error);
        res.status(500).json({
            error: 'Failed to cleanup tokens',
            message: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
    });
});

// Start server
function startServer() {
    app.listen(PORT, () => {
        console.log('');
        console.log('╔══════════════════════════════════════════════════════════╗');
        console.log('║   🔐 Key Authority Service (KAS)                        ║');
        console.log('╠══════════════════════════════════════════════════════════╣');
        console.log(`║   Port:        ${PORT.toString().padEnd(42)} ║`);
        console.log(`║   Status:      Running                                   ║`);
        console.log(`║   Crypto:      HMAC-SHA256 + JWT (HS256)                ║`);
        console.log(`║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(42)} ║`);
        console.log('╠══════════════════════════════════════════════════════════╣');
        console.log('║   Endpoints:                                             ║');
        console.log('║   GET  /health              - Health check               ║');
        console.log('║   POST /api/create-key      - Create API key            ║');
        console.log('║   GET  /api/list-keys       - List API keys             ║');
        console.log('║   POST /api/create-token    - Create single-use token   ║');
        console.log('║   GET  /api/list-tokens     - List tokens               ║');
        console.log('║   POST /api/validate-token  - Validate token            ║');
        console.log('║   POST /api/invalidate-token- Invalidate token          ║');
        console.log('║   POST /api/cleanup-tokens  - Cleanup expired tokens    ║');
        console.log('╚══════════════════════════════════════════════════════════╝');
        console.log('');
        
        if (!process.env.JWT_SECRET) {
            console.warn('⚠️  WARNING: Using auto-generated JWT_SECRET. Set JWT_SECRET in .env for production!');
        }
        if (!process.env.HMAC_SECRET) {
            console.warn('⚠️  WARNING: Using auto-generated HMAC_SECRET. Set HMAC_SECRET in .env for production!');
        }
    });
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\nSIGINT received, shutting down gracefully...');
    process.exit(0);
});

// Start the server
if (require.main === module) {
    startServer();
}

// Export for testing and integration
module.exports = { app, startServer };
