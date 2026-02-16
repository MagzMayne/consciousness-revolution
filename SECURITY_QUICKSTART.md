# Security System Quick Reference

## 🚀 Quick Start

### For Users

**Access the Security Dashboard:**
```
https://barbrickdesign.github.io/security-monitoring-dashboard.html
```

**Test the Security System:**
```
https://barbrickdesign.github.io/test-intrusion-detection.html
```

### For Developers

**Include Intrusion Detection in Your Page:**
```html
<script src="src/security/intrusion-detection.js"></script>
```

**Include Security Headers:**
```html
<script src="src/security/security-headers.js"></script>
```

**Check Security Status:**
```javascript
const report = window.IntrusionDetection.getSecurityReport();
console.log(report);
```

## 🛡️ What's Protected

### Honeypots (Reverse Trojan Horses)

Fake resources that detect attackers:

- `/admin/config.json` - Fake config file
- `/api/admin/users` - Fake admin API
- `/.env` - Fake environment file
- `/backup/db.sql` - Fake database backup
- Hidden admin links in DOM
- Hidden form fields (bots fill them)

**If accessed**: Attacker is logged and flagged

### Threat Detection

Automatically detects:

- **SQL Injection**: `' OR 1=1--`, `UNION SELECT`, etc.
- **XSS Attacks**: `<script>`, `javascript:`, event handlers
- **Path Traversal**: `../`, `../../etc/passwd`
- **Command Injection**: `;`, `|`, backticks, `$`
- **Brute Force**: Multiple failed auth attempts
- **Bot Activity**: Honeypot field submissions

### Automatic Responses

When threats detected:

1. **Log Threat**: Record to local storage and server
2. **Track Fingerprint**: Identify the attacker
3. **Count Violations**: 3 strikes rule
4. **Block Access**: Automatic 60-minute block
5. **Alert User**: Display warning message
6. **Dispatch Event**: Notify monitoring dashboard

## 📊 Monitoring & Reporting

### Real-Time Dashboard

View at: `security-monitoring-dashboard.html`

Shows:
- Total access logs
- Detected threats (24h)
- Blocked IPs/fingerprints
- Threat breakdown by type
- Recent activity log
- Your device fingerprint

**Auto-refreshes every 30 seconds**

### Export Security Reports

```javascript
// In dashboard or via console
const report = window.IntrusionDetection.getSecurityReport();
console.log(JSON.stringify(report, null, 2));
```

Downloads JSON file with:
- All access logs
- Threat details
- Blocked users
- System statistics

## 🔒 Security Features

### 1. Device Fingerprinting

Unique ID for each visitor based on:
- User agent
- Screen resolution
- Timezone
- Platform
- Browser plugins
- Canvas fingerprint
- Language settings

**Used for**: Tracking repeat offenders

### 2. Rate Limiting

Limits:
- 100 API requests per hour per domain
- 5 failed auth attempts per hour
- 3 threats before block

**Blocks last**: 60 minutes (configurable)

### 3. Content Security Policy (CSP)

Restricts:
- Script sources
- Style sources
- Image sources
- API connections
- Frame sources

**Prevents**: XSS, data injection, clickjacking

### 4. Security Headers

Implements:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` for geolocation, camera, mic

## 🚨 Common Scenarios

### User Gets Blocked

**Symptoms:**
- Alert: "Suspicious activity detected"
- Redirect to home page
- Cannot access site for 60 minutes

**To Resolve:**
- Wait 60 minutes
- Contact: BarbrickDesign@gmail.com
- Provide fingerprint from dashboard

### False Positive Detected

**If legitimate activity flagged:**

1. Check security dashboard
2. Review threat details
3. Export logs
4. Contact: BarbrickDesign@gmail.com
5. Provide evidence of legitimate use

### Attacker Attempting Access

**System automatically:**

1. Logs all activity
2. Identifies attack patterns
3. Blocks after 3 threats
4. Alerts via dashboard
5. Records for analysis

**Admin should:**

1. Review security dashboard
2. Export incident report
3. Document attack patterns
4. Update threat patterns if needed
5. Report to authorities if serious

## 🔧 Configuration

### Enable/Disable Features

```javascript
// Disable honeypots
IntrusionDetection.config.honeypotEnabled = false;

// Disable auto-blocking
IntrusionDetection.config.autoBlock = false;

// Adjust block duration (in minutes)
IntrusionDetection.config.blockDurationMinutes = 120;

// Adjust max failed attempts
IntrusionDetection.config.maxFailedAttempts = 10;
```

### Add Custom Threat Patterns

```javascript
// Add SQL injection pattern
IntrusionDetection.threatPatterns.sqlInjection.push(
  /my-custom-pattern/i
);

// Add honeypot endpoint
IntrusionDetection.honeypots.files.push('/my-fake-endpoint');
```

### Custom Event Handlers

```javascript
// Listen for threats
window.addEventListener('ids-threat-detected', (e) => {
  console.log('Threat:', e.detail);
  // Your custom handling
});

// Listen for blocks
window.addEventListener('ids-access-blocked', (e) => {
  console.log('Blocked:', e.detail);
  // Your custom handling
});
```

## 🧪 Testing

### Test All Features

Visit: `test-intrusion-detection.html`

Tests available:
1. Honeypot endpoint access
2. Honeypot link click
3. Honeypot form submission
4. SQL injection detection
5. XSS detection
6. Path traversal detection
7. Command injection detection
8. Auth failure tracking
9. Multiple auth failures
10. Block status check
11. Sensitive storage access
12. Normal storage access
13. Form injection
14. Restricted area navigation

### Manual Testing

```javascript
// Test SQL injection
fetch('/api/users?id=1\' OR 1=1--');

// Test XSS
fetch('/search?q=<script>alert("xss")</script>');

// Test path traversal
fetch('/file?path=../../etc/passwd');

// Trigger auth failure
window.dispatchEvent(new CustomEvent('auth-failed', {
  detail: { username: 'test' }
}));

// Check if blocked
const blocked = IntrusionDetection.isBlocked();
console.log(blocked);
```

## 📚 Documentation

**Full Documentation:**
- [Security Architecture](SECURITY_ARCHITECTURE.md) - Complete overview
- [Security Summary](SECURITY_SUMMARY.md) - Implementation details
- [Ethical Safeguards](ethical-safeguards.js) - Usage restrictions

**Related Tools:**
- Security Monitoring Dashboard
- Enhanced Security Scan Workflow
- Dependency Security Updates
- Ethical Safeguards System

## 📞 Support

**Security Issues:**
- Email: BarbrickDesign@gmail.com
- Subject: [SECURITY] Issue description

**DO NOT** publicly disclose vulnerabilities.

**Response Time:** 24-48 hours for critical issues

## ✅ Checklist

**Before Deployment:**

- [ ] IDS initialized and active
- [ ] Security headers applied
- [ ] Honeypots deployed
- [ ] CSP configured
- [ ] Rate limiting enabled
- [ ] Dashboard accessible
- [ ] Tests passing
- [ ] Documentation updated

**Regular Maintenance:**

- [ ] Review security logs weekly
- [ ] Update threat patterns monthly
- [ ] Test system quarterly
- [ ] Audit access annually
- [ ] Update dependencies
- [ ] Review blocked users
- [ ] Export reports for compliance

## 🎯 Best Practices

1. **Monitor Daily**: Check dashboard for new threats
2. **Review Logs**: Export and analyze monthly
3. **Update Patterns**: Add new threat signatures
4. **Test Regularly**: Run test suite after changes
5. **Document Incidents**: Keep records for compliance
6. **Train Users**: Educate on security features
7. **Stay Updated**: Monitor security advisories
8. **Backup Data**: Regular security log backups

---

**Last Updated:** February 9, 2026
**Version:** 1.0.0
**Contact:** BarbrickDesign@gmail.com
