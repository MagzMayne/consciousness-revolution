# CREDENTIAL_VAULT_DNA.md

**Status:** ACTIVE

## PROJECT DNA - The Single Source of Truth

**Location:** `C:/Users/dwrek/.secrets/MASTER_KEYS.json`
**Status:** GOLD (All Services Active)
**Last DNA Update:** 2026-01-11

---

## IDENTITY STRAND
### What Is This?
The Credential Vault is the single source of truth for all API keys, tokens, and authentication credentials. One JSON file that all systems read from, with a propagation script to update dependent configs.

### Why Does It Exist?
To solve the "where is that key?" problem. Before the vault:
- Keys scattered across .env files
- Different keys in different places
- No sync between systems
- Lost credentials, security issues

Now, one file rules them all.

### Core Philosophy
- **Single source** - One file, all keys
- **Propagation** - Script updates dependents
- **Versioned** - Track when keys change
- **Secure** - Not in git, encrypted backup

---

## PAST STRAND
### Version History
| Version | Date | Major Change |
|---------|------|--------------|
| v1.0 | Dec 2025 | Initial vault creation |
| v1.5 | Dec 25 2025 | Added anthropic keys |
| v2.0 | Dec 31 2025 | Added railway, airtable |
| v2.5 | Jan 2026 | Added supabase, shopify |

### Failed Attempts
1. **Multiple .env files** - Desync constantly
2. **Environment variables only** - Hard to track
3. **Hardcoded in scripts** - Security nightmare

### Successful Patterns
1. **Single JSON file** - Easy to read, parse
2. **Propagate script** - One command updates all
3. **Status notes** - Track what's active/broken
4. **Date annotations** - Know when updated

---

## PRESENT STRAND
### Current Architecture
```
Credential Vault
    |
    +-- MASTER_KEYS.json (Source of Truth)
    |   |
    |   +-- stripe (live keys)
    |   +-- github (token)
    |   +-- anthropic (admin, oat, backup)
    |   +-- openai (api keys)
    |   +-- deepseek (api key)
    |   +-- gmail (app password)
    |   +-- twilio (active)
    |   +-- ngrok (auth token)
    |   +-- railway (token)
    |   +-- netlify (site info)
    |   +-- airtable (api key)
    |   +-- bitwarden (session)
    |   +-- coinbase (api key/secret)
    |   +-- exodus (wallet addresses)
    |   +-- brave_wallet (seed phrase)
    |   +-- supabase (project keys)
    |   +-- shopify (access token)
    |
    +-- propagate_keys.py
    |   +-- Updates .mcp.json
    |   +-- Updates .env files
    |   +-- Updates config files
    |
    +-- Dependent Configs
        +-- .mcp.json (MCP servers)
        +-- .env.gmail
        +-- .env.twilio
        +-- .env.openai
        +-- etc.
```

### Services Configured
| Service | Keys | Status | Purpose |
|---------|------|--------|---------|
| Stripe | publishable, secret, webhook | ACTIVE | Payments |
| GitHub | token | ACTIVE | Repo access |
| Anthropic | admin, oat, backup | ACTIVE | Claude API |
| OpenAI | api_key, api_key_alt | ACTIVE | GPT API |
| DeepSeek | api_key | ACTIVE | DeepSeek API |
| Gmail | app_password | ACTIVE | Email |
| Twilio | account_sid, auth_token | ACTIVE | SMS |
| Ngrok | auth_token | ACTIVE | Tunneling |
| Railway | token | ACTIVE | Hosting |
| Netlify | site_id | ACTIVE | Deployment |
| Airtable | api_key | ACTIVE | Database |
| Bitwarden | session | ACTIVE | Passwords |
| Coinbase | api_key, api_secret | HOLD | Crypto |
| Exodus | btc_address, eth_address | ACTIVE | Wallets |
| Brave Wallet | seed_phrase | ACTIVE | Browser wallet |
| Supabase | project_url, service_role | ACTIVE | Database |
| Shopify | access_token | ACTIVE | Store |

### Key Statistics
- Total services: 17
- Active services: 16
- On hold: 1 (Coinbase security hold)
- Total key entries: 40+

### JSON Structure
```json
{
  "_README": "SINGLE SOURCE OF TRUTH",
  "_UPDATED": "2025-12-31",
  "_PROTOCOL": "When you update a key here, run: python propagate_keys.py",
  "service_name": {
    "_status": "ACTIVE/HOLD/DEPRECATED",
    "api_key": "...",
    "secret": "...",
    "_note": "Context about this credential"
  }
}
```

### Known Issues
1. **Coinbase on security hold** - Deadline passed Jan 4
2. **No auto-rotation** - Manual key updates
3. **No encryption at rest** - Plain JSON (filesystem protected)

---

## FUTURE STRAND
### Next Steps (Q1 2026)
1. **Key rotation alerts** - Warn before expiration
2. **Encryption at rest** - GPG encrypt vault
3. **Audit log** - Track who accessed what
4. **Auto-propagation** - Watch file, auto-update

### Planned Upgrades
- HashiCorp Vault integration
- Key expiration tracking
- Usage monitoring per key
- Cross-computer sync

### Scaling Vision
- Team vault with access control
- Secrets-as-a-service
- Automated key rotation
- Multi-environment (dev/staging/prod)

---

## CONNECTIONS STRAND
### Dependencies
| System | Purpose | Status |
|--------|---------|--------|
| .secrets/ folder | Storage location | Active |
| propagate_keys.py | Sync script | Active |
| Filesystem | File access | Active |

### Consumers (Who Uses Vault)
| Consumer | Keys Used | Frequency |
|----------|-----------|-----------|
| MCP servers | stripe, github, openai | Every session |
| Email Gateway | gmail | On email |
| ARAYA | openai, deepseek | On chat |
| Stripe integration | stripe keys | On payment |
| GitHub actions | github token | On commit |

### Peer Connections
- **MCP_NETWORK** - Gets keys from vault
- **EMAIL_GATEWAY** - Uses gmail credentials
- **100X_PLATFORM** - Stripe, Netlify keys
- **ARAYA_SYSTEM** - AI API keys

---

## CREDENTIALS STRAND
### Vault Location
- **Primary:** `C:/Users/dwrek/.secrets/MASTER_KEYS.json`
- **Backup:** Bitwarden secure note
- **NOT in git** - .gitignore protected

### Propagation Script
```bash
# Update all dependent configs
python C:/Users/dwrek/.secrets/propagate_keys.py

# Preview changes
python C:/Users/dwrek/.secrets/propagate_keys.py --dry-run
```

### Quick Commands
```bash
# View all services
python -c "import json; d=json.load(open('.secrets/MASTER_KEYS.json')); print([k for k in d.keys() if not k.startswith('_')])"

# Check specific key
python -c "import json; d=json.load(open('.secrets/MASTER_KEYS.json')); print(d['stripe'])"

# Get Stripe secret (for MCP)
python -c "import json; d=json.load(open('.secrets/MASTER_KEYS.json')); print(d['stripe']['secret_key'])"

# Verify all active
python -c "import json; d=json.load(open('.secrets/MASTER_KEYS.json')); print([k for k,v in d.items() if isinstance(v,dict) and v.get('_status','').startswith('ACTIVE')])"
```

### Security Protocols
1. **Never commit to git** - .gitignore entry mandatory
2. **No screenshots** - Sensitive data
3. **Bitwarden backup** - Encrypted copy
4. **Propagate after edit** - Keep systems in sync

---

## EMERGENCY PROCEDURES
### If Key Compromised
```bash
# 1. Regenerate at service provider
# 2. Update MASTER_KEYS.json
# 3. Propagate
python .secrets/propagate_keys.py

# 4. Verify
python -c "import json; print(json.load(open('.secrets/MASTER_KEYS.json'))['service_name'])"
```

### If Vault File Missing
```bash
# Restore from Bitwarden
bw get item "MASTER_KEYS" | jq -r '.notes' > .secrets/MASTER_KEYS.json

# Or from backup
copy .secrets/MASTER_KEYS.json.backup .secrets/MASTER_KEYS.json
```

### If MCP Not Getting Keys
```bash
# Check .mcp.json has correct values
cat C:/Users/dwrek/.mcp.json | findstr secret_key

# Re-propagate
python .secrets/propagate_keys.py

# Restart Claude CLI
claude
```

---

**ONE VAULT. ALL KEYS. SINGLE SOURCE OF TRUTH.**

