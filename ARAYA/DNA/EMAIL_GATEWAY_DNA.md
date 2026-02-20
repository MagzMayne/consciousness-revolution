# EMAIL_GATEWAY_DNA.md

**Status:** ACTIVE

## PROJECT DNA - The Bulletproof Email System

**Location:** `C:/Users/dwrek/.consciousness/EMAIL_GATEWAY.py`
**Status:** GOLD (3-Tier Resilience)
**Last DNA Update:** 2026-01-11

---

## IDENTITY STRAND
### What Is This?
The Email Gateway is a unified email access layer with 3-tier fallback chain. It provides bulletproof email operations that automatically failover between OAuth API, IMAP, and Playwright browser automation.

### Why Does It Exist?
To solve the "Gmail is broken" problem forever. Before this gateway:
- OAuth tokens expired randomly
- IMAP configs broke
- No fallback when primary failed

Now, one interface handles all email with automatic recovery.

### Core Philosophy
- **3-tier fallback** - OAuth -> IMAP -> Playwright
- **Self-healing** - Auto-refresh tokens
- **Metrics collection** - Track what works
- **Single entry point** - One API for all email

---

## PAST STRAND
### Version History
| Version | Date | Major Change |
|---------|------|--------------|
| v1.0 | Dec 27 2025 | Initial 3-tier architecture |
| v1.1 | Dec 28 2025 | Added metrics database |
| v1.2 | Jan 2026 | Self-healing OAuth refresh |

### Failed Attempts
1. **Direct IMAP only** - Breaks when password changes
2. **OAuth only** - Token refresh failures
3. **Playwright only** - Slow, fragile
4. **Multiple scripts** - Fragmented, hard to maintain

### Successful Patterns
1. **Fallback chain** - Try each method in order
2. **Metrics tracking** - Know what's healthy
3. **Unified interface** - `EmailGateway.search(query)`
4. **CLI and API** - Both access patterns

---

## PRESENT STRAND
### Current Architecture
```
EmailGateway (Unified Interface)
    |
    +-- Tier 1: OAuthMethod
    |   +-- Gmail API (google-api-python-client)
    |   +-- Auto-refresh tokens
    |   +-- Full functionality (labels, send, etc)
    |
    +-- Tier 2: IMAPMethod
    |   +-- App password auth
    |   +-- Basic IMAP operations
    |   +-- SMTP for sending
    |
    +-- Tier 3: PlaywrightMethod
    |   +-- Browser automation
    |   +-- Saved session login
    |   +-- Last resort fallback
```

### Method Capabilities
| Operation | OAuth | IMAP | Playwright |
|-----------|-------|------|------------|
| Search | Full | Basic | Basic |
| Read | Full | Full | Limited |
| Send | Full | Full | No |
| Labels | Yes | No | No |
| Attachments | Yes | Yes | No |

### Credentials Used
| Tier | Credential | Location |
|------|------------|----------|
| OAuth | gmail_token.pickle | .secrets/ |
| OAuth | gmail_credentials.json | .secrets/ |
| IMAP | GMAIL_APP_PASSWORD | .env.gmail |
| Playwright | Browser session | .playwright_gmail_session/ |

### Metrics Database
```
email_metrics.db
    |
    +-- email_metrics
    |   +-- timestamp
    |   +-- method (oauth_api/imap/playwright)
    |   +-- operation (search/send/get_message)
    |   +-- success (0/1)
    |   +-- latency_ms
    |   +-- error
    |   +-- fallback_used
    |
    +-- health_status
        +-- method
        +-- last_success
        +-- last_failure
        +-- consecutive_failures
        +-- total_successes/failures
```

### Known Issues
1. **OAuth refresh can fail** - Requires re-auth occasionally
2. **Playwright session expires** - Need manual login
3. **IMAP query conversion** - Not all Gmail syntax supported

---

## FUTURE STRAND
### Next Steps (Q1 2026)
1. **ProtonMail integration** - Add secure email tier
2. **Email templates** - Common message patterns
3. **Auto-response** - Rule-based auto-reply
4. **Dashboard** - Web UI for email health

### Planned Upgrades
- Scheduled email sending
- Attachment processing pipeline
- Email-to-Cyclotron ingestion
- Multi-account support

### Scaling Vision
- Multiple email accounts
- Team email routing
- Email-triggered automation
- AI email triage

---

## CONNECTIONS STRAND
### Dependencies
| System | Purpose | Status |
|--------|---------|--------|
| google-api-python-client | OAuth API | Active |
| imaplib | IMAP access | Built-in |
| playwright | Browser automation | Active |
| SQLite | Metrics storage | Active |

### Consumers (Who Uses Gateway)
| Consumer | Operations | Frequency |
|----------|------------|-----------|
| Claude sessions | Search, send | On demand |
| SPINE_DAEMON | Health check | Periodic |
| Legal searches | Archive retrieval | As needed |
| Beta outreach | Bulk send | Weekly |

### Peer Connections
- **CREDENTIAL_VAULT** - OAuth tokens, app password
- **CYCLOTRON_BRAIN** - Metrics stored
- **100X_PLATFORM** - Beta tester emails
- **LEGAL** - Pablo/tax email searches

---

## CREDENTIALS STRAND
### Required Credentials
| Credential | File | Status |
|------------|------|--------|
| OAuth credentials | .secrets/gmail_credentials.json | Active |
| OAuth token | .secrets/gmail_token.pickle | Active |
| App password | .env.gmail (GMAIL_APP_PASSWORD) | Active |
| Playwright session | .playwright_gmail_session/ | Needs refresh |

### Account Info
- **Primary:** darrick.preble@gmail.com
- **Business:** overkillkulture@gmail.com
- **IMAP Server:** imap.gmail.com:993
- **SMTP Server:** smtp.gmail.com:587

### Quick Commands
```bash
# Health check
python C:/Users/dwrek/.consciousness/EMAIL_GATEWAY.py health

# Search emails
python C:/Users/dwrek/.consciousness/EMAIL_GATEWAY.py search "from:pablo tax"

# Send email
python C:/Users/dwrek/.consciousness/EMAIL_GATEWAY.py send "to@email.com" "Subject" "Body"

# View metrics
python C:/Users/dwrek/.consciousness/EMAIL_GATEWAY.py metrics

# Self-heal
python C:/Users/dwrek/.consciousness/EMAIL_GATEWAY.py heal

# Desktop launcher
Desktop/EMAIL_GATEWAY.bat health
```

---

## EMERGENCY PROCEDURES
### If All Tiers Failing
```bash
# Run self-heal
python .consciousness/EMAIL_GATEWAY.py heal

# Check metrics
python .consciousness/EMAIL_GATEWAY.py metrics

# Manual OAuth refresh
python -c "from EMAIL_GATEWAY import OAuthMethod; OAuthMethod.get_service()"
```

### If OAuth Broken
```bash
# Delete token and re-auth
del C:/Users/dwrek/.secrets/gmail_token.pickle
python .consciousness/EMAIL_GATEWAY.py health
# Follow browser auth flow
```

### If IMAP Broken
```bash
# Check app password in .env.gmail
cat C:/Users/dwrek/.env.gmail

# Test IMAP directly
python -c "from EMAIL_GATEWAY import IMAPMethod; print(IMAPMethod.health_check())"
```

### If Playwright Broken
```bash
# Re-login to Gmail in browser
python Desktop/GMAIL_LOGIN_SAVE_SESSION.bat

# Or manually login via Playwright
python -c "from playwright.sync_api import sync_playwright; p=sync_playwright().start(); b=p.chromium.launch_persistent_context('.playwright_gmail_session', headless=False); b.pages[0].goto('https://mail.google.com')"
```

---

**3 TIERS. ZERO EXCUSES. EMAIL ALWAYS WORKS.**
