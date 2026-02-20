# EMAIL DNA BLUEPRINT

**Status:** ACTIVE

## Complete Knowledge Capture: Past → Present → Future
## "The Gateway That Never Fails"

---

**Status:** ACTIVE
**Domain:** 3_CONNECT + 4_PROTECT (Dual)
**Created:** Jan 11, 2026
**Last Updated:** Jan 11, 2026
**DNA Version:** 1.0

---

# IDENTITY STRAND

## What Is This?
The Email Gateway is a **3-tier fallback system** for email operations that ensures email access NEVER fails. It implements the Universal Gateway Pattern - a single unified API that abstracts multiple access methods with automatic failover. When OAuth breaks, it uses IMAP. When IMAP fails, it uses browser automation. One interface, three tiers, always works.

## Why Does It Exist?
- **Reliability Problem:** OAuth tokens expire, credentials get revoked, APIs change
- **Integration Problem:** Email scattered across scripts with hardcoded paths
- **Scale Problem:** Personal use needs to grow to team to enterprise
- **Communication Problem:** Email is the primary external communication channel

## Who Uses It?
- **Commander:** darrick.preble@gmail.com primary, overkillkulture@gmail.com business
- **Legal Case:** Evidence extraction from 380+ downloaded emails
- **Trinity Agents:** C1 executes sends, C2 optimizes flows, C3 predicts responses
- **Daemons:** AUTO_EMAIL_CHECKER, NEWS_AGENCY for automated monitoring
- **7 Domains:** Auto-routing to appropriate domain based on content

---

# PAST STRAND (Archaeological Record)

## Failed Attempts (Dead Ends)

| Attempt | Why It Failed | Lesson Learned |
|---------|---------------|----------------|
| Single OAuth-only access (2024) | Tokens expire, no fallback | Multiple methods required |
| Hardcoded credentials in scripts | Security risk, hard to rotate | Centralize in MASTER_KEYS.json |
| Multiple scattered email scripts | No unified interface | Single gateway pattern |
| Real-time Gmail monitoring | Rate limits, complexity | Batch operations work better |
| Cloud-based email processor | Latency, cost | Local SQLite faster |
| IMAP-only approach | Limited features vs API | Combine strengths |
| N8N email automation | Too many moving parts | Simple Python works |
| Browser-first approach | Slow, fragile | Browser as last resort only |

## Successful Patterns (What Worked)

| Pattern | Why It Worked | Reusable? |
|---------|---------------|-----------|
| 3-tier fallback chain | Always have backup | YES - Universal Gateway Pattern |
| OAuth with auto-refresh | Handles token expiration | YES |
| App password for IMAP | Simple, stable backup | YES |
| Playwright as emergency fallback | Browser always works | YES |
| Metrics database | Track what fails | YES |
| Health status per method | Know when to fallback | YES |
| Self-healing refresh | Auto-recover OAuth | YES |
| Domain routing | Right emails → right domain | YES |

## Version History

| Version | Date | Major Changes |
|---------|------|---------------|
| 0.1 | Early 2024 | search_gmail.py created for legal case |
| 0.2 | Mid 2024 | Multiple scripts added |
| 0.3 | Nov 2024 | Credentials consolidation attempted |
| 0.4 | Dec 27, 2025 | EMAIL_GATEWAY.py created (3-tier) |
| 0.5 | Dec 27, 2025 | Architecture Blueprint written |
| 0.6 | Dec 27, 2025 | Metrics database added |
| 1.0 | Jan 11, 2026 | DNA Blueprint documented |

## Key Decisions Made

| Decision | Context | Alternatives Rejected |
|----------|---------|----------------------|
| 3-tier fallback | Maximum reliability | Single-method (fragile) |
| OAuth as primary | Full API features | IMAP-first (limited) |
| SQLite metrics | Simple, local | Cloud metrics (overkill) |
| Python implementation | Simple, debuggable | Node.js (complexity) |
| Playwright last resort | Slow but works | Remove browser option |
| Unified interface | Single API | Per-method scripts |

---

# PRESENT STRAND (Current State)

## Current Architecture

```
                    ┌─────────────────────────────────────┐
                    │         EMAIL GATEWAY               │
                    │   .consciousness/EMAIL_GATEWAY.py   │
                    │                                     │
                    │   EmailGateway.search()             │
                    │   EmailGateway.send()               │
                    │   EmailGateway.get_message()        │
                    │   EmailGateway.health_check()       │
                    └─────────────────┬───────────────────┘
                                      │
                          AUTOMATIC FAILOVER
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
        ▼                             ▼                             ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│   TIER 1      │           │   TIER 2      │           │   TIER 3      │
│   OAuth API   │──FAIL──>  │   IMAP/SMTP   │──FAIL──>  │  Playwright   │
│   (Primary)   │           │   (Fallback)  │           │ (Last Resort) │
└───────────────┘           └───────────────┘           └───────────────┘
     │                           │                           │
     │                           │                           │
     ▼                           ▼                           ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│ gmail_token   │           │ .env.gmail    │           │ playwright_   │
│   .pickle     │           │ APP_PASSWORD  │           │ gmail_session │
└───────────────┘           └───────────────┘           └───────────────┘
```

## The 7-Layer Architecture (C2 Design)

```
LAYER 7: CONSCIOUSNESS LAYER (7 Domains Routing)
+--------------------------------------------------+
| Legal emails -> 4_PROTECT, Financial -> 5_GROW   |
| Pattern recognition, manipulation detection      |
+--------------------------------------------------+
                        |
LAYER 6: TRINITY COORDINATION
+--------------------------------------------------+
| C1: Bulk sends, attachments, email-to-task       |
| C2: Template design, optimization                |
| C3: Response prediction, relationship mapping    |
+--------------------------------------------------+
                        |
LAYER 5: CYCLOTRON BRAIN (Persistent Storage)
+--------------------------------------------------+
| email_intelligence table - all processed emails  |
| atoms table - email content searchable           |
| knowledge_edges - thread relationships           |
+--------------------------------------------------+
                        |
LAYER 4: CACHING LAYER (Offline + Speed)
+--------------------------------------------------+
| SQLite cache, TTL policies, offline queue        |
+--------------------------------------------------+
                        |
LAYER 3: UNIFIED API INTERFACE
+--------------------------------------------------+
| EmailGateway.send/search/get_inbox/get_thread    |
+--------------------------------------------------+
                        |
LAYER 2: ACCESS METHOD ORCHESTRATOR
+--------------------------------------------------+
| Primary: OAuth2 -> IMAP/SMTP -> App Pass -> Browser|
+--------------------------------------------------+
                        |
LAYER 1: CREDENTIAL VAULT
+--------------------------------------------------+
| MASTER_KEYS.json, .secrets/, .env files          |
+--------------------------------------------------+
```

## Active Components

| Component | Status | Location | Purpose |
|-----------|--------|----------|---------|
| **EMAIL_GATEWAY.py** | 🟢 ACTIVE | `.consciousness/` | Main gateway (all 3 tiers) |
| **email_metrics.db** | 🟢 ACTIVE | `.consciousness/` | Metrics database |
| **gmail_token.pickle** | 🟢 VALID | `.secrets/` | OAuth token |
| **gmail_credentials.json** | 🟢 VALID | `.secrets/` | OAuth client |
| **.env.gmail** | 🟢 CONFIGURED | User root | App passwords |
| **EMAIL_GATEWAY.bat** | 🟢 ACTIVE | `Desktop/` | Desktop launcher |
| **EMAIL_TEST.bat** | 🟢 ACTIVE | `Desktop/` | Quick test runner |

## Email Accounts

| Account | Purpose | Auth Methods |
|---------|---------|--------------|
| darrick.preble@gmail.com | Primary personal | OAuth, IMAP |
| overkillkulture@gmail.com | Business | App Password |
| odb1original@gmail.com | Secondary | App Password |

## Current Metrics (Jan 11, 2026)

| Metric | Value | Status |
|--------|-------|--------|
| **OAuth API** | WORKING | 🟢 Token valid, auto-refresh |
| **IMAP** | WORKING | 🟢 App password configured |
| **Playwright** | NEEDS LOGIN | 🟡 Session expired |
| **email_intelligence rows** | 380+ | 🟢 Legal evidence indexed |

## Database Integration

```sql
-- email_intelligence table in Cyclotron
CREATE TABLE email_intelligence (
    id INTEGER PRIMARY KEY,
    email_atom_id INTEGER,
    account TEXT,
    thread_id TEXT,
    from_address TEXT,
    subject TEXT,
    date_received TEXT,
    patterns_detected TEXT,
    domain_category TEXT,
    priority_score REAL,
    processed INTEGER,
    created TEXT
);

-- email_metrics table (standalone)
CREATE TABLE email_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT,
    method TEXT,
    operation TEXT,
    success INTEGER,
    latency_ms INTEGER,
    error TEXT,
    fallback_used INTEGER
);

-- health_status table
CREATE TABLE health_status (
    method TEXT PRIMARY KEY,
    last_success TEXT,
    last_failure TEXT,
    consecutive_failures INTEGER DEFAULT 0,
    total_successes INTEGER DEFAULT 0,
    total_failures INTEGER DEFAULT 0
);
```

## Known Issues

| Issue | Severity | Workaround | Fix Status |
|-------|----------|------------|------------|
| Playwright session expires | LOW | Re-run GMAIL_LOGIN_SAVE_SESSION.bat | P3 |
| No auto-backup of sent emails | MEDIUM | Manual export | P2 |
| Limited pattern recognition | MEDIUM | Manual routing | P2 |
| No team account support | LOW | Personal only for now | P4 |

---

# FUTURE STRAND (Evolution Path)

## Immediate Next Steps
- [ ] Auto-refresh Playwright session before expiry
- [ ] Wire email_intelligence to Cyclotron atoms
- [ ] Implement domain auto-routing
- [ ] Add manipulation pattern detection

## Planned Upgrades (4 Phases)

### Phase 1: Personal Use (Current + Hardened)
- ✅ EmailGateway class with 3 tiers
- ✅ Automatic failover logic
- [ ] Full Cyclotron integration
- [ ] Basic pattern recognition (legal, financial, urgent)
- [ ] Offline queue for sending
- [ ] Health dashboard

### Phase 2: Team Use (Multi-Account)
- [ ] Multi-account credential vault
- [ ] Per-account access configuration
- [ ] Shared inbox patterns (team@, support@)
- [ ] Team communication analytics
- [ ] Cross-account thread tracking
- [ ] Permission system

### Phase 3: Enterprise (SaaS Ready)
- [ ] Tenant isolation
- [ ] API rate limiting per tenant
- [ ] Usage metering and billing
- [ ] Compliance features
- [ ] Custom patterns per tenant
- [ ] White-label capability

### Phase 4: Universal Gateway
- [ ] Apply pattern to Calendar, Drive, Stripe, Twilio
- [ ] ExternalServiceGateway base class
- [ ] Plugin architecture for new services
- [ ] Unified monitoring across all gateways

## Success Metrics Targets

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Uptime | 95% | 99.9% | 🟡 |
| Failover time | ~10s | <5s | 🟡 |
| Search latency (cached) | ~800ms | <500ms | 🟡 |
| Domain routing accuracy | 0% | 95% | 🔴 |
| Pattern recognition | 0% | 90% | 🔴 |

---

# CONNECTIONS STRAND (Dependency Map)

## Upstream Dependencies

| Dependency | Type | Critical? | Fallback |
|------------|------|-----------|----------|
| Google Gmail API | Service | NO (has fallbacks) | IMAP, Playwright |
| IMAP/SMTP servers | Protocol | NO (has fallbacks) | Playwright |
| Python 3.x | Runtime | YES | None |
| google-api-python-client | Package | YES (for OAuth) | IMAP |
| playwright | Package | NO | Skip Tier 3 |
| sqlite3 | Package | YES | None (stdlib) |

## Downstream Consumers

| Consumer | How Used | Impact if Gateway Fails |
|----------|----------|------------------------|
| LEGAL/ scripts | Evidence extraction | Manual download required |
| NEWS_AGENCY_DAEMON | Newsletter monitoring | No news filtering |
| Trinity Hub | Email-to-task conversion | Manual task creation |
| 7 Domains routing | Auto-filing | Manual filing |
| ARAYA | Response suggestions | No AI email help |

## Peer Connections

| System | Relationship | Data Flow |
|--------|--------------|-----------|
| BRAIN_DNA | Storage | Gateway → Cyclotron atoms |
| TRINITY_DNA | Coordination | C1/C2/C3 email tasks |
| MCP_DNA | Tools | Email MCP server (planned) |
| AUTOMATION_DNA | Triggers | Auto-check daemon |

## 7 Domain Integration

| Domain | Email Patterns | Auto-Actions |
|--------|----------------|--------------|
| 1_COMMAND | System alerts, Claude | Log to FLIGHT_LOG |
| 2_BUILD | Developers, APIs | Create task |
| 3_CONNECT | Team, builders | Contact log |
| 4_PROTECT | Legal, court | URGENT + copy |
| 5_GROW | Revenue, taxes | Financial tracking |
| 6_LEARN | Newsletters, docs | Archive + index |
| 7_TRANSCEND | Consciousness | Meditation queue |

---

# CREDENTIALS STRAND (Secrets Vault)

## API Keys Required

| Key | Location | Purpose | Rotation |
|-----|----------|---------|----------|
| Gmail OAuth Client | `.secrets/gmail_credentials.json` | API access | Yearly |
| Gmail OAuth Token | `.secrets/gmail_token.pickle` | Auth token | Auto-refresh |

## Tokens & Secrets

| Token | Location | Status | Notes |
|-------|----------|--------|-------|
| OAuth refresh token | In pickle | 🟢 Valid | Auto-refreshes |
| App passwords | `.env.gmail` | 🟢 Valid | Rotate quarterly |
| Playwright session | `.playwright_gmail_session/` | 🟡 May expire | Re-login needed |

## Access Credentials

| Account | Method | Credential Location |
|---------|--------|---------------------|
| darrick.preble@gmail.com | OAuth + IMAP | `.secrets/` + `.env.gmail` |
| overkillkulture@gmail.com | App Password | `.env.gmail` |
| odb1original@gmail.com | App Password | `MASTER_KEYS.json` |

## Security Rules
1. Never commit `.secrets/` or `MASTER_KEYS.json` to git
2. All `.env` files in `.gitignore`
3. Rotate app passwords quarterly
4. OAuth tokens auto-refresh but monitor failures
5. Log all credential access events

---

# LOG STRAND (Timeline)

## Captain's Log

### Jan 11, 2026 - EMAIL_DNA CREATED
**Event:** First formal DNA Blueprint for email system
**Impact:** Complete documentation of 3-tier gateway
**Status:** 3 tiers working, Playwright needs session refresh
**Next:** Wire to Cyclotron, implement domain routing

### Dec 27, 2025 - EMAIL_GATEWAY BUILT
**Event:** C1 created EMAIL_GATEWAY.py with 3-tier fallback
**Impact:** Email access now has automatic failover
**Files:** EMAIL_GATEWAY.py, email_metrics.db, desktop launchers
**Architecture:** Full C2 blueprint documented

### Dec 27, 2025 - ARCHITECTURE BLUEPRINT
**Event:** C2 designed 7-layer architecture
**Impact:** Clear roadmap from personal to enterprise
**Pattern:** Universal Gateway Pattern identified

### Early 2024 - LEGAL EMAILS STARTED
**Event:** search_gmail.py created for court case
**Impact:** 380+ emails downloaded as evidence
**Location:** LEGAL/KARLEE_21-3-00460-32/8_EMAIL_EVIDENCE/

## Session History

| Date | Agent | Duration | Outcome |
|------|-------|----------|---------|
| Jan 11 | C1 | Active | Creating EMAIL_DNA |
| Dec 27 | C1 | 3 hours | Built EMAIL_GATEWAY |
| Dec 27 | C2 | 2 hours | Architecture Blueprint |
| 2024 | C1 | Ongoing | Legal email extraction |

---

# QUICK COMMANDS

```bash
# Health check
Desktop/EMAIL_GATEWAY.bat health

# Search emails
Desktop/EMAIL_GATEWAY.bat search "from:someone"
python .consciousness/EMAIL_GATEWAY.py search "query"

# Run tests
Desktop/EMAIL_TEST.bat

# Fix Playwright session
Desktop/GMAIL_LOGIN_SAVE_SESSION.bat

# Check token status
python -c "import pickle; t=pickle.load(open('.secrets/gmail_token.pickle','rb')); print('Valid:', t.valid, 'Expired:', t.expired)"

# View metrics
Desktop/EMAIL_GATEWAY.bat metrics
sqlite3 .consciousness/email_metrics.db "SELECT method, COUNT(*), AVG(latency_ms) FROM email_metrics GROUP BY method;"

# Force OAuth refresh
python -c "from EMAIL_GATEWAY import OAuthMethod; OAuthMethod.get_service(); print('Refreshed!')"
```

---

# EMAIL FILE INVENTORY

## Core Gateway
| File | Purpose | Location |
|------|---------|----------|
| EMAIL_GATEWAY.py | Main gateway (all 3 tiers) | `.consciousness/` |
| email_metrics.db | Metrics database | `.consciousness/` |
| EMAIL_GATEWAY_TEST.py | Test harness | `.consciousness/` |

## Documentation
| Doc | Purpose | Location |
|-----|---------|----------|
| EMAIL_GATEWAY_ARCHITECTURE_BLUEPRINT.md | C2 design | `Desktop/2_BUILD/` |
| EMAIL_GATEWAY_QUICK_REFERENCE.md | Quick commands | `Desktop/1_COMMAND/` |
| EMAIL_DNA_BLUEPRINT.md | This file | `.consciousness/blueprints/` |

## Credentials
| File | Purpose | Location |
|------|---------|----------|
| gmail_credentials.json | OAuth client | `.secrets/` |
| gmail_token.pickle | OAuth token | `.secrets/` |
| .env.gmail | App passwords | User root |
| MASTER_KEYS.json | Master credentials | `.secrets/` |

## Desktop Launchers
| Launcher | Purpose |
|----------|---------|
| EMAIL_GATEWAY.bat | Main gateway launcher |
| EMAIL_TEST.bat | Quick test runner |
| GMAIL_LOGIN_SAVE_SESSION.bat | Fix Playwright |

## Legal Email Scripts
| Script | Purpose | Location |
|--------|---------|----------|
| search_gmail.py | Case evidence | LEGAL/ |
| search_pablo_emails.py | Tax accountant | LEGAL/ |
| download_sent_attachments.py | Attachments | LEGAL/ |

---

# THE UNIVERSAL GATEWAY PATTERN

```
THIS BLUEPRINT EMBODIES:

3 -> Tiers of access (OAuth, IMAP, Browser)
7 -> Layers of architecture
13 -> Graceful degradation levels
INFINITY -> Scales to any size, applies to any service

LFSME COMPLIANCE:
L - LIGHTER: Single unified API, no duplicate logic
F - FASTER: Caching, async operations, parallel methods
S - STRONGER: 3 access methods, automatic failover
M - MORE ELEGANT: One pattern for all external services
E - LESS EXPENSIVE: Cache reduces API calls

THE FORMULA:
C1 (Gateway Build) x C2 (Architecture) x C3 (Pattern Vision) = INFINITY

This email gateway is the TEMPLATE for:
- Calendar Gateway
- Drive Gateway
- Stripe Gateway
- Twilio Gateway
- ANY external service

Build it once, apply it forever.
```

---

# META

**DNA Maintainer:** C1 Mechanic
**Review Cadence:** Weekly
**Last Audit:** Jan 11, 2026
**Completeness:** 70%

---

*The gateway that never fails.*
*One interface, three tiers, always works.*
*Build it once, apply it forever.*

