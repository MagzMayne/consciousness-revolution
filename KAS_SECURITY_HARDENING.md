# KAS Security Hardening Recommendations

## Overview

This document outlines recommended security improvements for the Key Authority Service (KAS). These are future enhancements to strengthen the authentication system beyond the current production-ready implementation.

## Current Security Features ✅

The KAS already implements:
- ✅ JWT tokens with HS256 (HMAC-SHA256) signing
- ✅ HMAC-SHA256 for API key signing
- ✅ One-way hashing for API key storage
- ✅ Single-use token enforcement
- ✅ Token expiration
- ✅ Endpoint validation
- ✅ Payload hash validation
- ✅ Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, HSTS)
- ✅ CORS configuration

## Recommended Improvements

### 1. Rate Limiting

**Priority: HIGH**

Implement rate limiting to prevent brute force and DoS attacks.

#### Implementation Plan

```javascript
// Install express-rate-limit (already in dependencies)
const rateLimit = require('express-rate-limit');

// Configure rate limiters
const apiKeyCreateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: 'Too many API key creation requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

const tokenCreateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // Limit each IP to 100 tokens per minute
    message: 'Too many token creation requests, please slow down',
});

const tokenValidateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 200, // Limit validation requests
    message: 'Too many validation requests, please slow down',
});

// Apply to endpoints
app.post('/api/create-key', apiKeyCreateLimiter, (req, res) => { ... });
app.post('/api/create-token', tokenCreateLimiter, (req, res) => { ... });
app.post('/api/validate-token', tokenValidateLimiter, (req, res) => { ... });
```

#### Configuration Options

```javascript
// Rate limiting by agent ID (more sophisticated)
const agentRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    keyGenerator: (req) => {
        // Rate limit by agent ID instead of IP
        return req.body.agentId || req.ip;
    },
    skip: (req) => {
        // Skip rate limiting for trusted agents
        const trustedAgents = process.env.TRUSTED_AGENTS?.split(',') || [];
        return trustedAgents.includes(req.body.agentId);
    }
});
```

### 2. CORS Configuration

**Priority: HIGH**

Tighten CORS configuration for production environments.

#### Current Implementation
```javascript
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));
```

#### Recommended Implementation

```javascript
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
    ? process.env.CORS_ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'https://barbrickdesign.github.io'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Request-Id'],
    maxAge: 86400 // 24 hours
}));
```

#### Environment Variables

```bash
# .env
CORS_ALLOWED_ORIGINS=https://barbrickdesign.github.io,https://www.barbrickdesign.com
```

### 3. Request Validation

**Priority: MEDIUM**

Add comprehensive input validation and sanitization.

#### Implementation Plan

```javascript
// Install validator library
npm install validator

const validator = require('validator');

// Validation middleware
function validateCreateKeyRequest(req, res, next) {
    const { agentId } = req.body;
    
    // Check required fields
    if (!agentId || typeof agentId !== 'string') {
        return res.status(400).json({
            error: 'Invalid request',
            details: 'agentId is required and must be a string'
        });
    }
    
    // Sanitize
    req.body.agentId = validator.trim(agentId);
    
    // Validate format
    if (!validator.isLength(req.body.agentId, { min: 3, max: 64 })) {
        return res.status(400).json({
            error: 'Invalid request',
            details: 'agentId must be between 3 and 64 characters'
        });
    }
    
    // Check for malicious patterns
    if (!validator.isAlphanumeric(req.body.agentId, 'en-US', { ignore: '-_' })) {
        return res.status(400).json({
            error: 'Invalid request',
            details: 'agentId can only contain letters, numbers, hyphens, and underscores'
        });
    }
    
    next();
}

// Apply validation
app.post('/api/create-key', validateCreateKeyRequest, (req, res) => { ... });
```

#### Validation Rules

- **agentId**: 3-64 characters, alphanumeric with hyphens/underscores
- **endpoint**: 3-256 characters, valid URL path format
- **ttlSeconds**: Integer between 1 and 3600
- **payloadHash**: If provided, alphanumeric string, max 128 characters

### 4. Audit Logging

**Priority: MEDIUM**

Implement comprehensive audit logging for security events.

#### Implementation Plan

```javascript
const fs = require('fs');
const path = require('path');

// Audit logger
class AuditLogger {
    constructor(logPath = './logs/audit.log') {
        this.logPath = logPath;
        this.ensureLogDirectory();
    }
    
    ensureLogDirectory() {
        const dir = path.dirname(this.logPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }
    
    log(event, details = {}) {
        const entry = {
            timestamp: new Date().toISOString(),
            event,
            ...details
        };
        
        const logLine = JSON.stringify(entry) + '\n';
        
        // Write to file (async)
        fs.appendFile(this.logPath, logLine, (err) => {
            if (err) {
                console.error('Failed to write audit log:', err);
            }
        });
        
        // Also log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log('[AUDIT]', entry);
        }
    }
}

const auditLogger = new AuditLogger();

// Log security events
app.post('/api/create-key', (req, res) => {
    // ... create key logic ...
    
    auditLogger.log('API_KEY_CREATED', {
        agentId: req.body.agentId,
        keyId: keyId,
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    
    // ... response ...
});

app.post('/api/validate-token', (req, res) => {
    // ... validation logic ...
    
    if (valid) {
        auditLogger.log('TOKEN_VALIDATED', {
            tokenId: decoded.jti,
            agentId: decoded.sub,
            endpoint: decoded.aud,
            ip: req.ip
        });
    } else {
        auditLogger.log('TOKEN_VALIDATION_FAILED', {
            reason: error.message,
            endpoint: req.body.endpoint,
            ip: req.ip,
            severity: 'WARNING'
        });
    }
    
    // ... response ...
});
```

#### Events to Log

- `API_KEY_CREATED` - New API key created
- `API_KEY_DELETED` - API key deleted
- `TOKEN_CREATED` - Single-use token created
- `TOKEN_VALIDATED` - Token successfully validated
- `TOKEN_VALIDATION_FAILED` - Token validation failed
- `TOKEN_INVALIDATED` - Token manually invalidated
- `TOKEN_EXPIRED` - Token expired
- `RATE_LIMIT_EXCEEDED` - Rate limit hit
- `INVALID_REQUEST` - Malformed request
- `UNAUTHORIZED_ACCESS` - Unauthorized access attempt

### 5. Security Vulnerability Scanning

**Priority: MEDIUM**

Regularly scan for security vulnerabilities in dependencies and code.

#### Implementation Plan

```bash
# Add to package.json scripts
{
  "scripts": {
    "security:audit": "npm audit",
    "security:audit:fix": "npm audit fix",
    "security:check": "npm audit --audit-level=moderate",
    "security:snyk": "snyk test"
  }
}
```

#### GitHub Actions Workflow

```yaml
# .github/workflows/security-scan.yml
name: Security Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0' # Weekly

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd backend
          npm ci
      
      - name: Run npm audit
        run: |
          cd backend
          npm audit --audit-level=moderate
      
      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
```

#### Regular Scanning Schedule

- **Daily**: Automated npm audit in CI/CD
- **Weekly**: Full vulnerability scan with Snyk
- **Monthly**: Manual security review
- **Per Release**: Comprehensive security audit

### 6. Additional Security Headers

**Priority: LOW**

Add more security headers for defense in depth.

#### Implementation

```javascript
app.use((req, res, next) => {
    // Existing headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    // Additional headers
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    next();
});
```

### 7. Database Integration

**Priority: MEDIUM**

Replace in-memory storage with persistent database.

#### Recommended Options

1. **Redis** - Fast, in-memory with persistence
   - Good for: High-performance token cache
   - Supports: TTL, atomic operations
   - Easy to scale

2. **PostgreSQL** - Relational database
   - Good for: Long-term storage, complex queries
   - Supports: ACID transactions, encryption at rest
   - Better for: Audit trails

3. **MongoDB** - Document database
   - Good for: Flexible schema, JSON storage
   - Supports: TTL indexes, sharding
   - Easy to scale

#### Example: Redis Integration

```javascript
const redis = require('redis');
const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => console.error('Redis error:', err));

await client.connect();

// Store token with automatic expiration
await client.setEx(
    `token:${tokenId}`,
    ttl,
    JSON.stringify(tokenData)
);

// Retrieve token
const tokenData = await client.get(`token:${tokenId}`);
```

### 8. API Key Rotation

**Priority: LOW**

Implement API key rotation for enhanced security.

#### Implementation

```javascript
app.post('/api/rotate-key', async (req, res) => {
    const { oldKeyId, agentId } = req.body;
    
    // Validate old key
    const oldKey = apiKeys.get(oldKeyId);
    if (!oldKey || oldKey.agentId !== agentId) {
        return res.status(401).json({ error: 'Invalid key' });
    }
    
    // Generate new key
    const newApiKey = generateSecureId('bdk_live', 48);
    const newKeyHash = hashApiKey(newApiKey);
    const newKeyId = generateSecureId('llak', 16);
    
    // Store new key
    apiKeys.set(newKeyId, {
        keyId: newKeyId,
        agentId: agentId,
        keyHash: newKeyHash,
        createdAt: new Date().toISOString(),
        active: true,
        rotatedFrom: oldKeyId
    });
    
    // Mark old key as rotated (don't delete immediately for grace period)
    oldKey.active = false;
    oldKey.rotatedAt = new Date().toISOString();
    oldKey.rotatedTo = newKeyId;
    apiKeys.set(oldKeyId, oldKey);
    
    // Log rotation
    auditLogger.log('API_KEY_ROTATED', {
        agentId,
        oldKeyId,
        newKeyId,
        ip: req.ip
    });
    
    res.json({
        success: true,
        apiKey: newApiKey,
        keyId: newKeyId,
        message: 'Key rotated successfully. Old key will remain valid for 24 hours.'
    });
});
```

## Implementation Priority

### Phase 1: Critical Security (Immediate)
1. Rate limiting
2. CORS configuration
3. Request validation

### Phase 2: Enhanced Security (Next Sprint)
1. Audit logging
2. Security vulnerability scanning
3. Additional security headers

### Phase 3: Production Hardening (Future)
1. Database integration
2. API key rotation
3. Advanced monitoring

## Testing Security Features

### Rate Limiting Test
```bash
# Test rate limiting
for i in {1..20}; do
  curl -X POST http://localhost:3010/api/create-key \
    -H "Content-Type: application/json" \
    -d '{"agentId": "test-agent"}' &
done
```

### CORS Test
```bash
# Test CORS from unauthorized origin
curl -X POST http://localhost:3010/api/create-key \
  -H "Origin: https://evil.com" \
  -H "Content-Type: application/json" \
  -d '{"agentId": "test-agent"}'
```

### Validation Test
```bash
# Test input validation
curl -X POST http://localhost:3010/api/create-key \
  -H "Content-Type: application/json" \
  -d '{"agentId": "<script>alert(1)</script>"}'
```

## Monitoring and Alerts

### Metrics to Monitor
- Token creation rate
- Token validation failures
- Rate limit hits
- Invalid request attempts
- Token expiration patterns

### Alert Thresholds
- Token validation failure rate > 10%
- Rate limit hits > 100/hour
- Invalid requests > 50/hour
- Token creation spikes (> 1000/minute)

## Security Checklist

### Development
- [ ] Use HTTPS in development (via local proxy)
- [ ] Never commit secrets to Git
- [ ] Use environment variables for configuration
- [ ] Enable debug mode only in development
- [ ] Test with security tools (OWASP ZAP, Burp Suite)

### Staging
- [ ] Use production-like secrets
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Enable audit logging
- [ ] Run security scans

### Production
- [ ] Use strong, random secrets (64+ bytes)
- [ ] Rotate secrets regularly (quarterly)
- [ ] Enable all security headers
- [ ] Set restrictive CORS policy
- [ ] Enable audit logging
- [ ] Set up monitoring and alerts
- [ ] Regular security scans
- [ ] Incident response plan

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT Security Best Practices](https://tools.ietf.org/html/rfc8725)

## Contact

For security issues, please email: BarbrickDesign@gmail.com

**Do not report security vulnerabilities in public issues.**
