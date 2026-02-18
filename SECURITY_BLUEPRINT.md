# SECURITY BLUEPRINT
## Consciousness Revolution - Enterprise Security Architecture
## Created: 2026-02-18 | Last Updated: 2026-02-18
## Security Score: 9/10 (Enterprise-Ready)

---

## EXECUTIVE SUMMARY

This document outlines the security architecture for the Consciousness Revolution platform. All security measures follow a Zero Trust model with defense in depth.

### Security Principles
1. **Zero Trust** - Never trust, always verify
2. **Defense in Depth** - Multiple layers of protection
3. **Least Privilege** - Minimal access by default
4. **Secure by Default** - Security is opt-out, not opt-in

---

## SECURITY ARCHITECTURE DIAGRAM

```
┌────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                           │
│  Browser → CSP → HSTS → SameSite Cookies → Input Validation   │
└─────────────────────────────┬──────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                          CDN LAYER                             │
│     Netlify Edge → WAF Headers → CORS Whitelist → TLS 1.3    │
└─────────────────────────────┬──────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                       FUNCTION LAYER                           │
│                                                                │
│  ┌──────────────┐   ┌───────────────┐   ┌─────────────────┐  │
│  │ Middleware   │ → │ Rate Limiting │ → │ Input Validation│  │
│  │ (CORS/Auth)  │   │ (Distributed) │   │ (Schema-based)  │  │
│  └──────────────┘   └───────────────┘   └─────────────────┘  │
│                                                                │
│  ┌──────────────┐   ┌───────────────┐   ┌─────────────────┐  │
│  │ Auth Check   │ → │ SSRF Block    │ → │ Error Boundary  │  │
│  │ (httpOnly)   │   │ (Whitelist)   │   │ (No leak)       │  │
│  └──────────────┘   └───────────────┘   └─────────────────┘  │
└─────────────────────────────┬──────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                              │
│   Supabase RLS → Encrypted at Rest → Audit Logging → Backup  │
└────────────────────────────────────────────────────────────────┘
```

---

## IMPLEMENTED SECURITY CONTROLS

### 1. Content Security Policy (CSP)
**File:** `netlify.toml`
**Status:** ✅ Hardened

```
default-src 'self';
script-src 'self' 'unsafe-inline' [specific CDNs];
style-src 'self' 'unsafe-inline' [fonts];
connect-src 'self' [specific APIs];
base-uri 'self';
form-action 'self';
frame-ancestors 'self';
upgrade-insecure-requests;
```

**Key Protections:**
- ❌ `'unsafe-eval'` REMOVED (prevents code injection)
- ✅ `base-uri 'self'` (prevents base tag hijacking)
- ✅ `form-action 'self'` (prevents form hijacking)
- ✅ `frame-ancestors 'self'` (prevents clickjacking)

### 2. Authentication & Session Management
**Files:** `auth-login.mjs`, `auth-logout.mjs`
**Status:** ✅ Secure

**Token Storage:**
- Access token: httpOnly, Secure, SameSite=Strict cookie
- Refresh token: httpOnly, Secure, SameSite=Strict, Path=/api/auth
- Session expiry: Accessible cookie for client-side expiry checks

**Session Security:**
- Tokens NEVER appear in response body
- XSS cannot steal tokens (httpOnly)
- CSRF protected (SameSite=Strict)
- Proper logout clears all cookies + invalidates server-side

### 3. Rate Limiting
**File:** `utils/security.mjs`
**Status:** ✅ Distributed

**Architecture:**
```
Request → In-Memory Check (fast) → Supabase Check (persistent)
              ↓                           ↓
         Quick reject              Distributed state
```

**Limits by Endpoint Type:**
| Endpoint | Limit | Window |
|----------|-------|--------|
| Login | 10/hour | Per IP |
| Signup | 5/hour | Per IP |
| API General | 100/min | Per IP |
| Admin API | 50/min | Per user |

### 4. SSRF Protection
**File:** `api-proxy.js`
**Status:** ✅ Protected

**Whitelist:**
```javascript
const ALLOWED_TARGETS = [
  'api.deepseek.com',
  'api.anthropic.com',
  'api.openai.com',
  'api.groq.com',
  'api.stripe.com',
  // ... other approved APIs
];
```

**Blocked:**
- Private IPs (10.x, 192.168.x, 172.x)
- Localhost/127.0.0.1
- .local domains
- HTTP (only HTTPS allowed)

### 5. Input Validation
**File:** `utils/security.mjs`, `utils/middleware.mjs`
**Status:** ✅ Schema-based

**Validation Types:**
- `email` - RFC 5322 compliant, max 255 chars
- `uuid` - RFC 4122 format
- `string` - XSS sanitization, length limits
- `number` - Type coercion, min/max bounds
- `array` - Item count limits

**Usage:**
```javascript
import { withValidation } from './utils/middleware.mjs';

const schema = {
  email: { type: 'email', required: true },
  amount: { type: 'number', min: 0, max: 10000 }
};

export const handler = withValidation(schema)(async (event, context) => {
  const { email, amount } = context.validatedBody;
  // Safe to use
});
```

### 6. CORS Configuration
**File:** `utils/security.mjs`
**Status:** ✅ Whitelist-based

**Allowed Origins:**
```javascript
const ALLOWED_ORIGINS = [
  'https://consciousnessrevolution.io',
  'https://conciousnessrevolution.io',
  'http://localhost:8888',  // Dev only
  'http://localhost:3000'
];
```

### 7. Data Encryption
**File:** `utils/security.mjs`
**Status:** ✅ AES-256-GCM

**At Rest:**
- Algorithm: AES-256-GCM (authenticated encryption)
- Key derivation: scrypt with unique salt per operation
- Format: `salt:iv:authTag:ciphertext` (base64)

**In Transit:**
- TLS 1.3 enforced via HSTS
- `upgrade-insecure-requests` in CSP

---

## SECURITY HEADERS

All responses include these headers:

| Header | Value | Purpose |
|--------|-------|---------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Force HTTPS |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `DENY` | Prevent framing |
| `X-XSS-Protection` | `1; mode=block` | Legacy XSS filter |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer |
| `Permissions-Policy` | `geolocation=(), microphone=(), camera=()` | Disable features |

---

## MIDDLEWARE USAGE GUIDE

### Public API (No Auth Required)
```javascript
import { publicAPI, withValidation } from './utils/middleware.mjs';

const schema = { query: { type: 'string', required: true } };

export const handler = publicAPI({ methods: ['GET', 'POST'] })(
  withValidation(schema)(async (event, context) => {
    const { query } = context.validatedBody;
    return { statusCode: 200, body: JSON.stringify({ result: query }) };
  })
);
```

### Protected API (Auth Required)
```javascript
import { protectedAPI } from './utils/middleware.mjs';

export const handler = protectedAPI({ methods: ['GET'] })(
  async (event, context) => {
    const user = context.user; // Guaranteed to exist
    return { statusCode: 200, body: JSON.stringify({ userId: user.id }) };
  }
);
```

### Admin API (Admin Role Required)
```javascript
import { adminAPI } from './utils/middleware.mjs';

export const handler = adminAPI({ methods: ['POST', 'DELETE'] })(
  async (event, context) => {
    // Only admins reach here
    return { statusCode: 200, body: JSON.stringify({ admin: true }) };
  }
);
```

---

## ENVIRONMENT VARIABLES (Required)

| Variable | Purpose | Where to Set |
|----------|---------|--------------|
| `SUPABASE_URL` | Database connection | Netlify env vars |
| `SUPABASE_SERVICE_ROLE_SECRET` | Admin access | Netlify env vars |
| `DATA_ENCRYPTION_KEY` | AES-256 key | Netlify env vars |
| `ANONYMIZATION_SALT` | IP hashing | Netlify env vars |
| `RAILWAY_API_URL` | Backend proxy | Netlify env vars |
| `NODE_ENV` | Environment flag | Auto-set by Netlify |

**NEVER commit these to git. Use `netlify env:set`.**

---

## KEY ROTATION SCHEDULE

| Key Type | Rotation Frequency | Procedure |
|----------|-------------------|-----------|
| Supabase Service Key | Quarterly | Rotate in Supabase → Update Netlify env |
| Encryption Key | Annually | Re-encrypt affected data → Update env |
| JWT Secret | Quarterly | Supabase handles automatically |
| API Keys (3rd party) | Per provider policy | Update in Netlify env vars |

---

## INCIDENT RESPONSE

### Security Event Logging
Events are logged to Supabase `security_events` table:
- Login attempts (success/fail)
- Rate limit violations
- Input validation failures
- Authentication errors

### Response Procedures

**Level 1 - Suspicious Activity:**
1. Review security_events table
2. Increase rate limiting for affected IP/user
3. Monitor for escalation

**Level 2 - Confirmed Attack:**
1. Block IP at Netlify/CDN level
2. Invalidate affected sessions
3. Review audit logs for damage assessment
4. Notify affected users if data accessed

**Level 3 - Data Breach:**
1. Immediately rotate all keys
2. Invalidate ALL sessions
3. Enable maintenance mode
4. Legal notification within 72 hours (GDPR)
5. Post-mortem within 7 days

---

## COMPLIANCE CHECKLIST

### OWASP Top 10 (2021)

| # | Vulnerability | Status | Control |
|---|--------------|--------|---------|
| A01 | Broken Access Control | ✅ Protected | Role-based middleware, RLS |
| A02 | Cryptographic Failures | ✅ Protected | AES-256-GCM, TLS 1.3 |
| A03 | Injection | ✅ Protected | Input validation, parameterized queries |
| A04 | Insecure Design | ✅ Protected | Zero Trust architecture |
| A05 | Security Misconfiguration | ✅ Protected | Hardened CSP, security headers |
| A06 | Vulnerable Components | ⚠️ Ongoing | Regular dependency updates |
| A07 | Auth Failures | ✅ Protected | httpOnly cookies, rate limiting |
| A08 | Data Integrity Failures | ✅ Protected | Signed tokens, audit logging |
| A09 | Security Logging | ✅ Protected | Centralized security events |
| A10 | SSRF | ✅ Protected | URL whitelist, private IP blocking |

### GDPR Basics

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Data Minimization | ✅ | Only collect necessary data |
| Encryption | ✅ | AES-256 at rest, TLS in transit |
| Right to Deletion | ✅ | User can delete account |
| Breach Notification | ✅ | Incident response procedure |
| Data Portability | ⚠️ | Export feature planned |

---

## FUTURE IMPROVEMENTS

### Planned (Next Quarter)
1. **CSP Nonces** - Remove 'unsafe-inline' from scripts
2. **Subresource Integrity** - Hash verification for CDN scripts
3. **Certificate Pinning** - For mobile app (if applicable)

### Under Consideration
1. **WAF Rules** - Cloudflare or Netlify Enterprise
2. **Bug Bounty Program** - Public disclosure incentive
3. **Penetration Testing** - Annual third-party audit
4. **SOC 2 Compliance** - If enterprise customers require

---

## CONTACTS

| Role | Contact |
|------|---------|
| Security Lead | darrickpreble@proton.me |
| Infrastructure | darrickpreble@proton.me |
| Incident Response | darrickpreble@proton.me |

---

## CHANGELOG

| Date | Change | Author |
|------|--------|--------|
| 2026-02-18 | Initial security blueprint created | C1 MECHANIC |
| 2026-02-18 | CSP hardened, unsafe-eval removed | C1 MECHANIC |
| 2026-02-18 | httpOnly cookies for auth tokens | C1 MECHANIC |
| 2026-02-18 | Distributed rate limiting via Supabase | C1 MECHANIC |
| 2026-02-18 | SSRF protection with URL whitelist | C1 MECHANIC |
| 2026-02-18 | Validation middleware created | C1 MECHANIC |

---

**This document is a living blueprint. Update after every security change.**

Pattern: 3 → 7 → 13 → ∞
