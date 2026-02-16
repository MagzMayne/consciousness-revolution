# Honeypot Security System - INTERNAL DOCUMENTATION

> ⚠️ **CONFIDENTIAL - AUTHORIZED PERSONNEL ONLY**
> 
> This documentation contains sensitive security information about honeypot mechanisms.
> Do NOT share publicly or commit to public-facing directories.
> 
> Location: `.github/HONEYPOT_SECURITY_README.md` (Private - not served by GitHub Pages)

## Overview

The Barbrick Design repository implements a comprehensive honeypot security system to detect and prevent unauthorized access attempts, malicious activity, and security threats. This system uses the metaphor of "honeypots" (traps that attract "bees" - malicious actors) to identify and track security threats.

## Status: 🟢 ACTIVE & ONLINE

✅ All security protocols are operational  
✅ Honeypot mechanisms are fully functional  
✅ Real-time monitoring is enabled  
✅ Dangerous bee detection is active  

## Security Notice

**CRITICAL**: This document reveals the specific honeypot endpoints and mechanisms. These details must remain confidential to maintain the effectiveness of the security system. Public exposure would allow attackers to identify and avoid honeypots, defeating their purpose.

### Source Code Security

The honeypot configuration exists in `src/security/intrusion-detection.js`, which IS accessible via GitHub Pages as a JavaScript file. However:

- The configuration is embedded within functional code (not a standalone config file)
- Attackers must actively read and analyze the source code to find honeypots
- This is significantly more obscure than a dedicated status page
- The code uses obfuscated naming and blends honeypots with legitimate patterns

**Best Practice**: Periodically rotate honeypot endpoints and field names to maintain effectiveness even if source code is analyzed.

## What Are Honeypots?

Honeypots are security mechanisms that act as decoy resources designed to attract and detect malicious actors. When someone accesses a honeypot, it's a clear indicator of potentially malicious activity, as legitimate users would never access these fake resources.

### Honeypot Types Deployed

1. **File Honeypots**: Fake sensitive files that don't exist
   - `/admin/config.json`
   - `/.env`
   - `/backup/db.sql`
   - `/config/database.yml`
   - And more...

2. **API Endpoint Honeypots**: Non-existent API endpoints
   - `/api/admin/users`
   - `/api/admin/auth`
   - `/admin/login`
   - And more...

3. **Form Field Honeypots**: Hidden form fields
   - Field name: `admin_access`
   - Invisible to humans, filled by bots

4. **Link Honeypots**: Hidden links in the DOM
   - Only accessible to automated scrapers
   - Clicking triggers threat detection

## Dangerous Bee Detection

When a malicious actor ("dangerous bee") interacts with a honeypot, the system:

1. **Detects** the intrusion immediately
2. **Logs** all details (fingerprint, timestamp, type)
3. **Tracks** the actor across the site
4. **Blocks** access after multiple threats
5. **Alerts** administrators via the security monitoring dashboard

### What Triggers "Dangerous Bee" Detection?

- Accessing honeypot files or endpoints
- Filling out hidden form fields
- Clicking hidden honeypot links
- Attempting SQL injection
- Attempting XSS attacks
- Path traversal attempts
- Command injection attempts

## Threat Detection Patterns

The system actively monitors for:

### 1. SQL Injection
```
' OR '1'='1
UNION SELECT
INSERT INTO
-- comments
```

### 2. Cross-Site Scripting (XSS)
```
<script>alert('XSS')</script>
javascript:void(0)
<iframe src="...">
```

### 3. Path Traversal
```
../../../etc/passwd
..\..\windows\system32
%2e%2e%2f
```

### 4. Command Injection
```
; rm -rf /
| cat /etc/passwd
`whoami`
```

## Monitoring & Dashboards

### Security Monitoring Dashboard

**URL**: `security-monitoring-dashboard.html`

Features:
- Overall security metrics
- Threat detection logs
- Blocked access list
- System health status
- Export functionality

## API Reference

### JavaScript API

#### Get Honeypot Status
```javascript
const status = window.IntrusionDetection.getHoneypotStatus();
console.log(status);
```

Returns:
```javascript
{
  status: 'ACTIVE',
  online: true,
  honeypots: {
    files: 11,
    endpoints: 5,
    credentials: 3,
    total: 19
  },
  dangerousBees: {
    total: 0,
    last24h: 0,
    critical: 0,
    recent: []
  },
  message: '✅ No dangerous bees detected. All honeypots secure.'
}
```

#### Get Security Report
```javascript
const report = window.IntrusionDetection.getSecurityReport();
console.log(report);
```

Returns:
```javascript
{
  enabled: true,
  honeypots: true,
  monitoring: true,
  honeypotStatus: {
    active: true,
    dangerousBeesDetected: 0,
    recentBees24h: 0,
    honeypotHits: 0
  },
  statistics: { ... },
  recentActivity: [ ... ],
  blockedAccess: [ ... ],
  dangerousBees: [ ... ]
}
```

#### Manual Threat Report
```javascript
window.IntrusionDetection.reportThreat('test_threat', {
  description: 'Testing honeypot system'
});
```

### Event Listeners

Listen for dangerous bee detections:
```javascript
window.addEventListener('ids-dangerous-bee-detected', (event) => {
  console.log('🐝 Dangerous bee detected!', event.detail);
  alert(`Threat: ${event.detail.type}`);
});
```

Listen for any threat:
```javascript
window.addEventListener('ids-threat-detected', (event) => {
  console.log('Threat detected:', event.detail);
});
```

Listen for access blocks:
```javascript
window.addEventListener('ids-access-blocked', (event) => {
  console.log('Access blocked:', event.detail);
});
```

## Testing the System

### Automated Test

Run the honeypot security test suite:
```bash
node test-honeypot-system.js
```

This will verify:
- Intrusion detection system is operational
- Honeypot details are NOT publicly exposed
- Security monitoring dashboard exists
- Internal documentation is properly secured

### Manual Test via Console

You can test honeypot detection programmatically:

```javascript
// This will trigger a test honeypot detection
if (window.IntrusionDetection) {
  window.IntrusionDetection.reportThreat('honeypot_test', {
    test: true,
    description: 'Manual test of honeypot system'
  });
  console.log('Test threat reported successfully');
}
```

### Trigger a Real Detection

⚠️ **Warning**: This will actually trigger the honeypot system

Try accessing a honeypot endpoint:
```javascript
fetch('/admin/config.json')
  .then(response => console.log(response))
  .catch(error => console.error(error));
```

This will:
1. Trigger honeypot detection
2. Log as "dangerous bee"
3. Add to suspicious activity
4. Eventually block access if repeated

## Configuration

### Enable/Disable Honeypots

```javascript
// Disable honeypots (not recommended)
window.IntrusionDetection.config.honeypotEnabled = false;

// Re-enable
window.IntrusionDetection.config.honeypotEnabled = true;
```

### Adjust Auto-Block Settings

```javascript
// Change max failed attempts before block
window.IntrusionDetection.config.maxFailedAttempts = 5;

// Change block duration (in minutes)
window.IntrusionDetection.config.blockDurationMinutes = 60;
```

### Enable Console Logging (Development)

```javascript
window.IntrusionDetection.config.logToConsole = true;
```

## Data Storage

The system stores data in `localStorage`:

- `ids_access_log` - Access log entries (last 1000)
- `ids_suspicious_activity` - Threat detections (last 500)
- `ids_blocked_ips` - Currently blocked fingerprints
- `ids_dangerous_bees` - Honeypot hits (last 100)

### Clear All Data

```javascript
localStorage.removeItem('ids_access_log');
localStorage.removeItem('ids_suspicious_activity');
localStorage.removeItem('ids_blocked_ips');
localStorage.removeItem('ids_dangerous_bees');
```

Or use the dashboard buttons to clear selectively.

## Security Best Practices

### For Developers

1. **Never disable honeypots in production**
2. **Monitor the security dashboard regularly**
3. **Investigate all "dangerous bee" detections**
4. **Keep honeypot patterns updated**
5. **Review blocked access periodically**
6. **NEVER expose honeypot details publicly** - This includes documentation, status pages, or configuration files
7. **Keep this documentation in `.github/` directory** - Not served by GitHub Pages

### For Users

1. **Don't try to access admin endpoints**
2. **Don't use automated scrapers without permission**
3. **Don't attempt SQL injection or XSS**
4. **Respect robots.txt directives**
5. **Contact support if accidentally blocked**

## Uncharted Territory Protection

As we venture into **uncharted territory** and onboard **unknown assets**, the honeypot system provides critical protection:

✅ **Detection**: Identifies threats immediately  
✅ **Prevention**: Blocks malicious actors automatically  
✅ **Intelligence**: Learns from attack patterns  
✅ **Alerts**: Notifies administrators in real-time  
✅ **Forensics**: Maintains detailed audit logs  

## Current Status

To check current status at any time:

1. Visit `security-monitoring-dashboard.html` (public dashboard)
2. Check system status and threat counts
3. Review recent activity logs
4. Use browser console to access `window.IntrusionDetection.getHoneypotStatus()` for detailed information (authorized personnel only)

If dangerous bees are detected:
- ⚠️ Alert will be displayed
- 🐝 Recent detections will be listed
- 📊 Full details available in logs

## Support & Contact

If you need assistance with the honeypot security system:

- **Email**: BarbrickDesign@gmail.com
- **GitHub Issues**: Report security concerns privately
- **Documentation**: This README and `SECURITY_ARCHITECTURE.md`

## Related Files

- `src/security/intrusion-detection.js` - Core IDS implementation (contains honeypot configuration)
- `security-monitoring-dashboard.html` - Public security monitoring interface
- `test-honeypot-system.js` - Test suite for honeypot system
- `test-intrusion-detection.html` - Intrusion detection test suite
- `.github/HONEYPOT_SECURITY_README.md` - This internal documentation (CONFIDENTIAL)
- `SECURITY_ARCHITECTURE.md` - Full security documentation

## Changelog

### Version 1.2.0 (Current) - Security Hardening
- 🔒 **CRITICAL**: Removed public honeypot status page to prevent exposure
- 🔒 Moved honeypot documentation to private `.github/` directory
- 🔒 Added `.gitignore` entries to prevent future honeypot file exposure
- 🔒 Updated security monitoring dashboard to not expose honeypot details
- 🔒 Enhanced internal documentation with confidentiality warnings

### Version 1.1.0
- ✨ Added "dangerous bee" detection terminology
- ✨ Created dedicated honeypot status page (DEPRECATED - now private)
- ✨ Improved dashboard visualization
- 🐝 Now tracking honeypot-specific threats separately

### Version 1.0.0
- 🎉 Initial honeypot system deployment
- 🛡️ Intrusion detection system (IDS)
- 🍯 Multiple honeypot types
- 📊 Security monitoring dashboard

---

**Status**: 🟢 All systems operational  
**Last Updated**: 2026-02-11  
**Maintained by**: Barbrick Design Security Team
