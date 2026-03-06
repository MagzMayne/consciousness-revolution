# Logging & Monitoring - Consciousness Revolution

**Last Updated:** 2026-03-06
**Status:** Implementation Guide

---

## Current State

### Console Logging
- **446 console.log/error/warn** calls across 81 functions
- Basic logging for debugging and error tracking

### Secure Logging
- **9 functions** use `secureLog()` from security.mjs
- Auth functions: auth-login, auth-logout, auth-signup, auth-signup-new
- Security functions: verify-identity, sms-webhook
- Utility: middleware.mjs

---

## Logging Patterns

### Pattern 1: Standard Error Logging
```javascript
try {
    // Operation
} catch (error) {
    console.error('Function error:', error.message);
    // Don't log full stack in production
}
```

### Pattern 2: Secure Logging (Recommended)
```javascript
import { secureLog } from './utils/security.mjs';

// Redacts sensitive data automatically
secureLog('info', 'User action', {
    userId: 'usr_123',
    email: 'user@example.com', // Will be redacted
    action: 'login'
});
```

### Pattern 3: Audit Logging to Database
```javascript
// For security-critical events
await supabase.from('audit_log').insert({
    foundation_id: userId,
    event_type: 'user_login',
    event_category: 'auth',
    action: 'create',
    ip_address: anonymizedIP,
    metadata: { device_type, session_id }
});
```

---

## Health Check Endpoints

### Existing Health Checks

| Endpoint | Purpose | Response |
|----------|---------|----------|
| `/.netlify/functions/health` | Basic health | `{ status: "ok" }` |
| `/.netlify/functions/trinity-status` | Trinity system | `{ terminals: [...] }` |
| `/.netlify/functions/supabase-debug` | DB connectivity | `{ connected: bool }` |

### Recommended Health Check Pattern
```javascript
export async function handler(event) {
    const start = Date.now();
    const checks = {};

    // Check database
    try {
        await supabase.from('health_check').select('*').limit(1);
        checks.database = 'ok';
    } catch (e) {
        checks.database = 'error';
    }

    // Check external services
    try {
        // Quick Stripe ping
        checks.stripe = 'ok';
    } catch (e) {
        checks.stripe = 'error';
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            status: Object.values(checks).every(v => v === 'ok') ? 'healthy' : 'degraded',
            checks,
            latency_ms: Date.now() - start
        })
    };
}
```

---

## Monitoring Strategy

### Tier 1: Built-in (Current)

| Service | What It Monitors | Access |
|---------|------------------|--------|
| Netlify Analytics | Traffic, deploys | Dashboard |
| Netlify Functions | Invocations, errors | Dashboard > Functions |
| Supabase Logs | DB queries, auth | Dashboard > Logs |
| GitHub Actions | CI/CD runs | Actions tab |

### Tier 2: Enhanced (Recommended)

| Service | Purpose | Integration |
|---------|---------|-------------|
| **Sentry** | Error tracking | NPM package + DSN |
| **LogFlare** | Structured logs | Supabase native |
| **Better Uptime** | Uptime monitoring | HTTP checks |
| **PagerDuty** | Alerting | Webhook integration |

---

## Sentry Integration (Recommended)

### Installation
```bash
npm install @sentry/node
```

### Function Setup
```javascript
import * as Sentry from '@sentry/node';

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 0.1, // 10% of transactions
});

export async function handler(event) {
    try {
        // Main logic
    } catch (error) {
        Sentry.captureException(error, {
            tags: { function: 'function-name' },
            extra: { event_path: event.path }
        });
        throw error;
    }
}
```

### Environment Variable
```
SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## Log Levels

| Level | When to Use | Example |
|-------|-------------|---------|
| `error` | Operation failed | DB connection error |
| `warn` | Unexpected but handled | Rate limit triggered |
| `info` | Important events | User signup |
| `debug` | Development only | Request payload |

### In Production
- Log `error` and `warn` always
- Log `info` for key events
- Disable `debug` (use NODE_ENV check)

---

## Metrics to Track

### Business Metrics
- Active users (daily/weekly/monthly)
- Signup conversion rate
- ARAYA energy usage
- Builder revenue events
- Certification completions

### Technical Metrics
- Function invocation count
- Function error rate
- Average response time
- Database query latency
- External API failures

### Security Metrics
- Failed login attempts
- Rate limit triggers
- Unusual activity patterns
- Session anomalies

---

## Alerting Rules

### Critical (Immediate)
- Error rate > 10% for 5 minutes
- Health check failures
- Payment webhook failures
- Database connectivity loss

### Warning (Daily Review)
- Error rate > 2%
- Response time > 5s
- Rate limit triggers > 100/hour
- Unusual traffic patterns

---

## Audit Log Schema

Already implemented in `audit_log` table:

```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    foundation_id UUID REFERENCES user_foundations(id),
    event_type TEXT NOT NULL,
    event_category TEXT NOT NULL,
    action TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for queries
CREATE INDEX idx_audit_log_foundation ON audit_log(foundation_id, created_at DESC);
CREATE INDEX idx_audit_log_type ON audit_log(event_type, created_at DESC);
```

---

## Implementation Priority

### HIGH - Do Now
1. Add Sentry for error tracking (free tier available)
2. Enable Supabase log shipping to LogFlare
3. Set up uptime monitoring for critical endpoints

### MEDIUM - Next Sprint
4. Standardize logging format across functions
5. Add structured logging middleware
6. Create monitoring dashboard

### LOW - Future
7. APM (Application Performance Monitoring)
8. Custom metrics collection
9. Log aggregation and analysis

---

## Quick Start Commands

```bash
# View Netlify function logs
netlify functions:log <function-name>

# View recent Supabase logs
# Go to: supabase.com/dashboard/project/_/logs/edge

# Test health endpoint
curl https://conciousnessrevolution.io/.netlify/functions/health
```

---

## Security Considerations

- **Never log** passwords, API keys, tokens
- **Redact** email addresses, IPs in logs
- **Anonymize** IPs before storing (use `anonymizeIP()`)
- **Rotate** log data after 30-90 days
- **Encrypt** logs containing PII

---

*Generated on 2026-03-06*
