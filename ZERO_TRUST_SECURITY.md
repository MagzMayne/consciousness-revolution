# Zero Trust Security Implementation

## Overview

This document describes the zero trust security protocols implemented across the Consciousness Revolution platform to ensure no personal data is ever leaked.

**Implementation Date:** 2026-02-16  
**Security Standard:** Zero Trust Architecture (ZTA)  
**Compliance:** GDPR, CCPA, SOC 2 Type II compatible

---

## Zero Trust Principles Implemented

### 1. Never Trust, Always Verify
- ✅ All API endpoints require explicit authentication
- ✅ JWT token validation on every request
- ✅ Origin validation for CORS requests
- ✅ Input validation on all user-supplied data

### 2. Least Privilege Access
- ✅ Row-Level Security (RLS) on all database tables
- ✅ Users can only access their own data
- ✅ Service role has minimal necessary permissions
- ✅ Scope-based API key permissions

### 3. Assume Breach
- ✅ Data anonymization at collection point
- ✅ Encryption at rest for sensitive fields
- ✅ Encryption in transit (HTTPS only)
- ✅ Session tokens hashed before storage
- ✅ IP addresses anonymized automatically

### 4. Verify Explicitly
- ✅ Comprehensive input validation and sanitization
- ✅ Type checking on all inputs
- ✅ Email format validation
- ✅ Password strength requirements
- ✅ Rate limiting on all sensitive endpoints

### 5. Minimize Blast Radius
- ✅ Rate limiting prevents abuse
- ✅ Failed login attempts logged and monitored
- ✅ Automatic data retention policies
- ✅ Security event monitoring and alerting
- ✅ Isolated database access per user

---

## Data Protection Measures

### Personal Data Minimization

**What We Collect:**
- Email (required for authentication)
- Name (optional, user-provided)
- Anonymized IP address (for security monitoring)
- Device type (browser/OS only, not specific versions)

**What We DON'T Store:**
- Full IP addresses (anonymized to /24 subnet)
- Detailed user agent strings (only browser/OS type)
- Session tokens in plaintext (hashed with SHA-256)
- Passwords in plaintext (handled by Supabase Auth)
- API keys in plaintext (hashed before storage)

### Automatic Anonymization

All personally identifiable information (PII) is automatically anonymized before storage:

```sql
-- IP addresses: 192.168.1.123 → 192.168.1.0
-- User agents: "Mozilla/5.0 ..." → "Chrome/Windows"
-- Phone numbers: Kept for routing but protected by RLS
-- Emails: Never logged in audit trails
```

### Data Encryption

**At Rest:**
- Sensitive fields encrypted using AES-256-GCM
- Encryption keys stored in environment variables, never in code
- Database-level encryption via Supabase
- Application-level encryption for extra-sensitive data

**In Transit:**
- All communication over HTTPS/TLS 1.3
- Strict Transport Security (HSTS) enforced
- Certificate pinning where applicable

### Data Retention

**Automatic Cleanup:**
- User sessions: 90 days after end
- Audit logs: 2 years (compliance requirement)
- Security events: Indefinite for critical events, 1 year for others
- Inactive accounts: Flagged after 365 days of inactivity

**User Control:**
- Users can delete their account at any time
- All user data is purged within 30 days of deletion request
- Right to data portability (export your data)
- Right to be forgotten (GDPR compliance)

---

## Security Features by Layer

### 1. Network Layer

**CORS Protection:**
```javascript
// Only allow requests from trusted origins
const ALLOWED_ORIGINS = [
    'https://consciousnessrevolution.io',
    'https://www.consciousnessrevolution.io',
    'https://conciousnessrevolution.io', // Typo domain redirect
    'http://localhost:8888', // Development only
];
```

**Security Headers:**
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

**Rate Limiting:**
- Authentication endpoints: 5 attempts per hour per IP
- API endpoints: 100 requests per minute per user
- Signup endpoint: 5 signups per hour per IP
- File upload: 10 uploads per hour per user

### 2. Application Layer

**Input Validation:**
```javascript
// All inputs validated with schema
const schema = {
    email: { type: 'email', required: true },
    password: { type: 'string', minLength: 8, required: true },
    name: { type: 'string', maxLength: 100, required: false }
};

const validation = validateInput(data, schema);
```

**Output Encoding:**
- HTML entities escaped before rendering
- JSON responses properly encoded
- SQL parameters always bound (no string concatenation)
- No eval() or similar unsafe functions

**Session Management:**
- Session tokens rotated on authentication
- Sessions invalidated after 30 days of inactivity
- Secure, HttpOnly cookies where applicable
- Tokens hashed before storage

### 3. Database Layer

**Row-Level Security (RLS):**
```sql
-- Users can only see their own data
CREATE POLICY "Users access own data" ON table_name
    FOR ALL 
    USING (user_id = auth.uid());

-- Service role has controlled access
CREATE POLICY "Service role controlled access" ON table_name
    FOR ALL 
    USING (auth.role() = 'service_role' AND current_setting('app.purpose') = 'legitimate');
```

**Encryption at Rest:**
```sql
-- Sensitive fields encrypted before storage
CREATE OR REPLACE FUNCTION encrypt_sensitive_text(plaintext TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(
        pgp_sym_encrypt(plaintext, current_setting('app.encryption_key')),
        'base64'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Audit Logging:**
```sql
-- All data changes logged with anonymized metadata
INSERT INTO audit_log (
    foundation_id, event_type, event_category, action,
    ip_address, metadata
) VALUES (
    $1, $2, $3, $4,
    anonymize_ip($5), $6
);
```

---

## Security Monitoring

### Real-Time Monitoring

**Security Events Table:**
Tracks suspicious activity and security incidents:
- Failed login attempts
- Rate limit violations
- Invalid token usage
- Unauthorized access attempts
- Data breach attempts

**Alerting:**
- Critical events trigger immediate alerts
- High severity events reviewed within 1 hour
- Medium severity events reviewed within 24 hours
- Low severity events reviewed weekly

### Automated Response

**Rate Limiting:**
- Automatic temporary IP blocks after excessive failures
- Graduated response (warning → throttle → block)
- Whitelist for known good actors

**Anomaly Detection:**
- Unusual access patterns flagged
- Sudden spike in requests investigated
- Geographic anomalies noted
- Time-based anomalies logged

---

## Security Utilities

### Core Security Module

Location: `netlify/functions/utils/security.mjs`

**Functions Available:**
- `getSecureCORSHeaders(origin)` - Validate origin and return secure headers
- `checkRateLimit(identifier, max, window)` - Rate limiting
- `validateInput(data, schema)` - Input validation
- `sanitizeString(input, maxLength)` - XSS prevention
- `anonymizeIP(ip)` - IP anonymization
- `anonymizeUserAgent(ua)` - User agent anonymization
- `pseudonymize(id, salt)` - One-way pseudonymization
- `encrypt(data)` - AES-256-GCM encryption
- `decrypt(data)` - Decryption
- `secureLog(message, data)` - Redacted logging
- `successResponse(data, origin)` - Secure API response
- `errorResponse(message, origin, code)` - Secure error response

### Database Functions

Location: `supabase/migrations/003_zero_trust_security.sql`

**Functions Available:**
- `anonymize_ip(ip)` - Anonymize IP to /24 subnet
- `anonymize_email(email)` - Hash username, keep domain
- `encrypt_sensitive_text(text)` - Database-level encryption
- `decrypt_sensitive_text(text)` - Database-level decryption
- `log_security_event(...)` - Log security incidents
- `cleanup_old_sessions()` - Remove expired sessions
- `cleanup_old_audit_logs()` - Remove old audit logs

---

## Developer Guidelines

### Secure Coding Practices

**DO:**
- ✅ Always use the security utility functions
- ✅ Validate all inputs before processing
- ✅ Sanitize all outputs before rendering
- ✅ Use parameterized queries for database
- ✅ Log security events appropriately
- ✅ Handle errors without exposing internals
- ✅ Use HTTPS for all external requests
- ✅ Rotate secrets regularly

**DON'T:**
- ❌ Store secrets in code or git
- ❌ Use `Access-Control-Allow-Origin: *`
- ❌ Log sensitive data (passwords, tokens, etc.)
- ❌ Trust user input without validation
- ❌ Expose stack traces to users
- ❌ Use weak cryptographic algorithms
- ❌ Hardcode database URLs or credentials
- ❌ Store tokens or passwords in plaintext

### Adding a New Endpoint

```javascript
import {
    getSecureCORSHeaders,
    handlePreflight,
    checkRateLimit,
    validateInput,
    secureLog,
    successResponse,
    errorResponse
} from './utils/security.mjs';

export async function handler(event, context) {
    const origin = event.headers.origin || '';
    
    // 1. Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return handlePreflight(origin);
    }
    
    // 2. Check rate limit
    const clientIP = event.headers['x-forwarded-for']?.split(',')[0];
    const rateCheck = checkRateLimit(clientIP, 100, 60000);
    if (!rateCheck.allowed) {
        return errorResponse('Rate limit exceeded', origin, 429);
    }
    
    // 3. Validate authentication (if required)
    const auth = validateAuthToken(event.headers);
    if (!auth.valid) {
        return errorResponse(auth.error, origin, 401);
    }
    
    // 4. Validate input
    const data = JSON.parse(event.body || '{}');
    const validation = validateInput(data, schema);
    if (!validation.valid) {
        return errorResponse(validation.errors.join(', '), origin, 400);
    }
    
    // 5. Process request with validated data
    try {
        const result = await processData(validation.sanitized);
        secureLog('Operation successful', { userId: auth.userId });
        return successResponse(result, origin);
    } catch (error) {
        secureLog('Operation failed', { error: error.message });
        return errorResponse('Server error', origin, 500);
    }
}
```

---

## Compliance & Auditing

### GDPR Compliance

- ✅ Data minimization
- ✅ Purpose limitation
- ✅ Storage limitation
- ✅ Accuracy
- ✅ Integrity and confidentiality
- ✅ Accountability
- ✅ Right to access
- ✅ Right to rectification
- ✅ Right to erasure
- ✅ Right to data portability
- ✅ Right to object

### CCPA Compliance

- ✅ Right to know what personal information is collected
- ✅ Right to know if personal information is sold or shared
- ✅ Right to opt-out of sale of personal information
- ✅ Right to deletion
- ✅ Right to non-discrimination

### Security Audits

**Regular Audits:**
- Weekly: Security event review
- Monthly: Access control review
- Quarterly: Penetration testing
- Annually: Full security audit

**Audit Logs:**
- All authentication events logged
- All data access logged
- All data modifications logged
- All security events logged

---

## Incident Response

### Security Incident Procedure

1. **Detection:** Security monitoring alerts on suspicious activity
2. **Analysis:** Determine scope and severity of incident
3. **Containment:** Isolate affected systems/users
4. **Eradication:** Remove threat and close vulnerability
5. **Recovery:** Restore systems to normal operation
6. **Post-Incident:** Review and improve security measures

### Contact Information

**Security Issues:**
- Email: security@consciousnessrevolution.io
- Report vulnerabilities responsibly
- Response within 24 hours for critical issues

---

## Environment Setup

### Required Environment Variables

```bash
# Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate anonymization salt
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Add to `.env`:
```
DATA_ENCRYPTION_KEY=your_32_byte_hex_key_here
ANONYMIZATION_SALT=your_base64_salt_here
```

Add to Supabase settings:
```
app.encryption_key = your_encryption_key_here
```

### Database Setup

Run migrations in order:
```bash
# 1. Foundation schema (user tables)
psql < supabase/migrations/FOUNDATION_SCHEMA.sql

# 2. User images with RLS
psql < supabase/migrations/001_user_images.sql

# 3. Zero trust security enhancements
psql < supabase/migrations/003_zero_trust_security.sql
```

Schedule cleanup jobs:
```sql
-- Run weekly
SELECT cron.schedule('cleanup-sessions', '0 0 * * 0', 'SELECT cleanup_old_sessions()');

-- Run monthly
SELECT cron.schedule('cleanup-audit', '0 0 1 * *', 'SELECT cleanup_old_audit_logs()');
```

---

## Testing Security

### Manual Testing

```bash
# Test rate limiting
for i in {1..10}; do
  curl -X POST https://your-domain/.netlify/functions/auth-signup \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password123"}'
done

# Test CORS
curl -X POST https://your-domain/.netlify/functions/auth-signup \
  -H "Origin: https://evil-site.com" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -v
```

### Automated Testing

```javascript
// Test input validation
const testCases = [
    { email: '', password: '', expectError: true },
    { email: 'invalid', password: 'short', expectError: true },
    { email: 'valid@example.com', password: 'Valid123!', expectError: false }
];

for (const test of testCases) {
    const result = await signup(test);
    assert(result.error === test.expectError);
}
```

---

## Changelog

### Version 1.0.0 (2026-02-16)

**Added:**
- Zero trust security utilities module
- Comprehensive input validation
- Automatic data anonymization
- Encryption at rest support
- Rate limiting middleware
- Security event monitoring
- Enhanced RLS policies
- Secure logging functions

**Changed:**
- Updated all authentication endpoints
- Removed wildcard CORS policies
- Replaced hardcoded credentials
- Strengthened password requirements

**Fixed:**
- Hardcoded Supabase URL in sms-webhook
- Overly permissive RLS policies
- Plaintext session token storage
- Missing input validation

---

## Future Enhancements

**Planned:**
- [ ] Multi-factor authentication (MFA)
- [ ] Biometric authentication support
- [ ] Advanced anomaly detection with ML
- [ ] Real-time security dashboard
- [ ] Automated threat response
- [ ] Zero-knowledge encryption for user content
- [ ] Decentralized identity (DID) support
- [ ] Hardware security key support

---

## References

- [NIST Zero Trust Architecture](https://csrc.nist.gov/publications/detail/sp/800-207/final)
- [OWASP Security Guidelines](https://owasp.org/)
- [GDPR Compliance](https://gdpr.eu/)
- [CCPA Compliance](https://oag.ca.gov/privacy/ccpa)
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**Document Version:** 1.0.0  
**Last Updated:** 2026-02-16  
**Next Review:** 2026-05-16
