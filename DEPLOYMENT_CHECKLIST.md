# Zero Trust Security - Deployment Checklist

## Pre-Deployment Checklist

Before deploying the zero trust security implementation, complete these steps:

---

## 1. Environment Variables

### Required Variables

Add these to your `.env` file and Netlify environment:

```bash
# Generate encryption key (32 bytes hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
DATA_ENCRYPTION_KEY=<generated_key_here>

# Generate anonymization salt
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
ANONYMIZATION_SALT=<generated_salt_here>
```

### Add to Netlify:
1. Go to Netlify Dashboard → Site Settings → Environment Variables
2. Add `DATA_ENCRYPTION_KEY`
3. Add `ANONYMIZATION_SALT`
4. Redeploy site

### Add to Supabase:
1. Go to Supabase Dashboard → Project Settings → Database Settings
2. Add custom config:
   ```
   app.encryption_key = your_encryption_key_here
   ```

**Status:** [ ] Complete

---

## 2. Database Migration

### Run Migration Script

```bash
# Connect to your Supabase database
psql -h <your-db-host> -U postgres -d postgres

# Or use Supabase SQL Editor in dashboard
```

Run the migration file:
```sql
-- Copy contents of supabase/migrations/003_zero_trust_security.sql
-- Paste into Supabase SQL Editor
-- Click "Run"
```

### Verify Migration

Check that these were created:
- [ ] `security_events` table exists
- [ ] `anonymize_ip()` function exists
- [ ] `log_security_event()` function exists
- [ ] `cleanup_old_sessions()` function exists
- [ ] `cleanup_old_audit_logs()` function exists
- [ ] RLS policy "Users access own memory" exists on `araya_memory`
- [ ] Trigger `anonymize_session_trigger` exists on `user_sessions`
- [ ] Trigger `anonymize_audit_trigger` exists on `audit_log`
- [ ] Trigger `hash_token_trigger` exists on `user_sessions`

**Status:** [ ] Complete

---

## 3. Schedule Database Cleanup Jobs

### Option A: pg_cron (Recommended)

If pg_cron is enabled on your Supabase instance:

```sql
-- Schedule weekly session cleanup (Sundays at midnight)
SELECT cron.schedule(
    'cleanup-sessions',
    '0 0 * * 0',
    'SELECT cleanup_old_sessions()'
);

-- Schedule monthly audit log cleanup (1st of month at midnight)
SELECT cron.schedule(
    'cleanup-audit-logs',
    '0 0 1 * *',
    'SELECT cleanup_old_audit_logs()'
);
```

### Option B: Netlify Scheduled Functions

Create scheduled functions to call cleanup:

```javascript
// netlify/functions/scheduled-cleanup.mjs
export async function handler(event, context) {
    const supabase = getSupabaseAdmin();
    
    // Run cleanup
    await supabase.rpc('cleanup_old_sessions');
    await supabase.rpc('cleanup_old_audit_logs');
    
    return { statusCode: 200 };
}
```

Add to `netlify.toml`:
```toml
[functions.scheduled-cleanup]
  schedule = "0 0 * * 0"  # Weekly on Sunday
```

**Status:** [ ] Complete

---

## 4. Update Serverless Functions

### Audit Current Status

Run the security audit:
```bash
./security-audit.sh
```

### Update Functions

For each function that needs updating:

1. [ ] Import security utilities
2. [ ] Replace CORS headers
3. [ ] Add rate limiting
4. [ ] Add input validation
5. [ ] Replace console.log with secureLog
6. [ ] Test the function

Use the template in `SECURITY_DEVELOPER_GUIDE.md`

### Priority Order

1. **Critical (Update First):**
   - [ ] auth-login.mjs ✅
   - [ ] auth-signup.mjs ✅
   - [ ] stripe-webhook.mjs
   - [ ] stripe-webhook-v2.mjs
   - [ ] evidence-upload.mjs

2. **High Priority:**
   - [ ] araya-chat.mjs
   - [ ] araya-memory.mjs
   - [ ] araya-file.mjs
   - [ ] create-checkout.mjs
   - [ ] create-checkout-session.mjs

3. **Medium Priority:**
   - [ ] All certification functions
   - [ ] builder-* functions
   - [ ] r3d3-* functions

4. **Low Priority:**
   - [ ] Analytics functions
   - [ ] Read-only functions

**Status:** [ ] 2/37 Complete

---

## 5. Test Security Controls

### Manual Testing

```bash
# Test rate limiting
./test-scripts/test-rate-limit.sh

# Test CORS
./test-scripts/test-cors.sh

# Test input validation
./test-scripts/test-validation.sh

# Test authentication
./test-scripts/test-auth.sh
```

### Automated Testing

Run the security test suite:
```bash
npm run test:security
```

### Checklist

- [ ] Rate limiting works on auth endpoints
- [ ] CORS rejects unauthorized origins
- [ ] Input validation rejects invalid data
- [ ] Authentication required where needed
- [ ] Sensitive data is redacted in logs
- [ ] Session tokens are hashed in database
- [ ] IP addresses are anonymized in database

**Status:** [ ] Complete

---

## 6. Monitor Security Events

### Set Up Monitoring

1. Create a dashboard to monitor `security_events` table
2. Set up alerts for critical security events
3. Review security events daily for first week

```sql
-- Query recent security events
SELECT 
    event_type,
    severity,
    COUNT(*) as count,
    MAX(created_at) as last_occurrence
FROM security_events
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY event_type, severity
ORDER BY severity DESC, count DESC;
```

### Alert Thresholds

Configure alerts for:
- [ ] More than 10 failed logins in 1 hour
- [ ] Any critical severity events
- [ ] More than 100 rate limit events in 1 hour
- [ ] Any data breach attempts

**Status:** [ ] Complete

---

## 7. Update Documentation

- [ ] Update README.md with security information
- [ ] Add security section to contributor guidelines
- [ ] Document security policies for users
- [ ] Update privacy policy if needed
- [ ] Update terms of service if needed

**Status:** [ ] Complete

---

## 8. Security Audit

### Internal Review

- [ ] Code review of all security changes
- [ ] Verify no hardcoded secrets
- [ ] Verify all environment variables set
- [ ] Check git history for accidentally committed secrets
- [ ] Review RLS policies on all tables
- [ ] Verify encryption keys are properly stored

### External Review (Recommended)

- [ ] Consider hiring security firm for penetration testing
- [ ] Have another developer review security implementation
- [ ] Test with security scanning tools (OWASP ZAP, etc.)

**Status:** [ ] Complete

---

## 9. Incident Response Plan

### Prepare for Security Incidents

1. [ ] Document incident response procedure
2. [ ] Assign security incident response team
3. [ ] Set up security contact email
4. [ ] Create runbook for common incidents
5. [ ] Test incident response procedure

### Security Contacts

- Primary: security@consciousnessrevolution.io
- Backup: [Add backup contact]
- On-Call: [Add on-call rotation]

**Status:** [ ] Complete

---

## 10. Deployment

### Pre-Deploy Final Check

- [ ] All environment variables set
- [ ] Database migration completed
- [ ] Critical functions updated
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Team notified of changes

### Deploy Steps

1. [ ] Deploy to staging environment
2. [ ] Run smoke tests on staging
3. [ ] Monitor security events on staging for 24 hours
4. [ ] Deploy to production
5. [ ] Monitor security events on production
6. [ ] Announce deployment to team

### Post-Deploy Monitoring

Monitor these metrics for first 48 hours:
- [ ] Security event frequency
- [ ] Failed authentication attempts
- [ ] Rate limit triggers
- [ ] Error rates
- [ ] Response times
- [ ] User feedback

**Status:** [ ] Complete

---

## 11. Rollback Plan

### If Issues Occur

Have a rollback plan ready:

```bash
# Revert to previous deployment
netlify rollback

# Or use git revert
git revert <commit-hash>
git push origin master
```

### Rollback Triggers

Roll back if:
- Security events spike dramatically
- Authentication stops working
- Error rate exceeds 5%
- User reports of access issues

**Status:** [ ] Plan Documented

---

## 12. Post-Deployment

### Week 1

- [ ] Daily security event review
- [ ] Monitor error logs
- [ ] Check rate limiting effectiveness
- [ ] Verify database cleanup jobs run
- [ ] Address any user issues

### Week 2-4

- [ ] Weekly security event review
- [ ] Update remaining functions with security
- [ ] Refine rate limits based on actual usage
- [ ] Document any lessons learned

### Month 2+

- [ ] Monthly security review
- [ ] Quarterly security audit
- [ ] Annual penetration testing
- [ ] Regular security training for team

**Status:** [ ] Ongoing

---

## Compliance Checklist

### GDPR

- [ ] Privacy policy updated
- [ ] Data minimization implemented
- [ ] User data retention policies set
- [ ] Right to erasure implemented
- [ ] Data portability available
- [ ] Consent management in place

### CCPA

- [ ] Privacy notice updated
- [ ] Do Not Sell implemented (if applicable)
- [ ] Right to deletion implemented
- [ ] Data access implemented

### SOC 2

- [ ] Access controls documented
- [ ] Audit logging enabled
- [ ] Encryption in place
- [ ] Incident response plan documented
- [ ] Regular security reviews scheduled

**Status:** [ ] Complete

---

## Sign-Off

### Required Approvals

- [ ] Lead Developer: _________________ Date: _______
- [ ] Security Lead: __________________ Date: _______
- [ ] Product Owner: __________________ Date: _______
- [ ] DevOps Lead: ___________________ Date: _______

### Deployment Authorization

I authorize the deployment of zero trust security implementation:

Signature: _______________________ Date: _______

---

## Emergency Contacts

**Security Issues:**
- Email: security@consciousnessrevolution.io
- Phone: [Add emergency phone]
- Slack: #security-alerts

**On-Call Rotation:**
- Week 1: [Name/Contact]
- Week 2: [Name/Contact]
- Week 3: [Name/Contact]
- Week 4: [Name/Contact]

---

**Document Version:** 1.0.0  
**Last Updated:** 2026-02-16  
**Next Review:** After deployment + 1 week
