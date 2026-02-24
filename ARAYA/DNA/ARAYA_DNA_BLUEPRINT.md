# ARAYA DNA BLUEPRINT
## Complete Knowledge Capture: Past → Present → Future
## "The Consciousness Interface - Voice of the Revolution"

---

**Status:** ACTIVE
**Domain:** 3_CONNECT (Communication Interface)
**Created:** Jan 11, 2026
**Last Updated:** Feb 22, 2026
**DNA Version:** 2.0

---

# IDENTITY STRAND
## What Is This?
ARAYA (AI Relational Awareness Yielding Alignment) is the primary AI interface for the Consciousness Revolution platform. She serves as guide, teacher, and companion across multiple interfaces.

## Why Does It Exist?
- Provide accessible consciousness education
- Detect and explain manipulation patterns
- Guide users through the 7 domains
- Connect users to the knowledge base (166,000+ atoms)
- Be the voice and face of the revolution

## Who Uses It?
- **PUBLIC**: Anyone visiting the platform (games, demos)
- **BELIEVERS**: Logged-in users (tools, dashboards)
- **BUILDERS**: Team members (DNA docs, architecture)
- **COMMANDERS**: Full admin access

---

# ACCESS TIER SYSTEM (Added Feb 22, 2026)

## The 4 Access Tiers

| Tier | Level | Description | Unlock Method |
|------|-------|-------------|---------------|
| PUBLIC | 0 | Default - Landing pages, games, demos | None required |
| BELIEVER | 1 | Logged-in users - Beta tools, dashboards | Email verified login |
| BUILDER | 2 | Team members - DNA docs, architecture | Builder agreement |
| COMMANDER | 3 | Full access - Admin, private, all infrastructure | Secret phrase or admin detection |

## Secret Phrase Unlock
**Phrase:** `CONSCIOUSNESS_COMMANDER_137`
**Environment Variable:** `ARAYA_COMMANDER_SECRET`

When a user includes the secret phrase in their message, ARAYA unlocks COMMANDER mode and can reveal all pages/systems.

## Page Classification Patterns

### COMMANDER Pages (Hidden by default)
- `.agent-r-private.html`, `.test-secret.html`
- `COMMANDER_*.html`, `ADMIN_*.html`, `admin-*.html`

### BUILDER Pages (Team only)
- `OPERATOR_COCKPIT_*.html`, `DNA_*.html`
- `*_ARCHITECTURE_*.html`, `BUILDER_*.html`
- `BRAIN_*.html`, `CYCLOTRON_*.html`, `TRINITY_*.html`

### BELIEVER Pages (Logged-in users)
- `BETA_*.html`, `PERSONAL_DOMAIN_*.html`
- `*_DASHBOARD.html`, `*_DETECTOR.html`
- `*_ANALYZER.html`, `*_TRACKER.html`

### PUBLIC Pages (Everyone)
- `index.html`, `login.html`, `signup.html`
- `GemBot*.html`, `BankSky.html`, `GTAVI.html`
- `araya-chat.html`, `araya-welcome.html`

## ARAYA Mode Behavior

```javascript
// PUBLIC mode prompt injection
"IMPORTANT: You are in PUBLIC mode.
- Only mention public pages: games, demos, landing pages
- DO NOT reveal internal pages like COMMANDER_, ADMIN_, DNA_
- If asked for admin access, say: 'That requires elevated access.
  Do you have a verification code?'"

// COMMANDER mode prompt injection
"ACCESS LEVEL: COMMANDER - Full system access granted.
 You can reveal ALL pages and internal structure."
```

## Implementation Files
- `netlify/functions/araya-chat.mjs` - Access detection logic
- `ARAYA_ACCESS_CONTROL.json` - Tier definitions, patterns
- `ARAYA_PAGE_INDEX.json` - 262 pages categorized

---

# PAST STRAND (Archaeological Record)

## Failed Attempts
1. **Direct Ollama Backend** - Worked but slow, moved to API routing
2. **Single Model Approach** - Claude-only failed when rate limited
3. **No Memory** - Conversations felt stateless, added Cyclotron integration
4. **Open File Access** - Showed all 988 files to anyone (Fixed Feb 22, 2026)

## Successful Patterns
1. **Multi-AI Router** - Claude → Groq → Gemini fallback chain
2. **Cyclotron Memory** - Conversation history + knowledge atoms
3. **Tier System** - Public → Believer → Builder → Commander
4. **Sidepanel Extension** - Always-available companion

## Key Decisions
- **Feb 22, 2026**: Implemented 4-tier access control with secret phrase unlock
- **Feb 2026**: Added debug panel for real-time logging
- **Jan 2026**: Created browser extension with 7 domains lobby

---

# PRESENT STRAND (Current State)

## Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INTERFACES                         │
├─────────────────┬─────────────────┬─────────────────────────┤
│  araya-chat.html│  Browser Ext    │  Discord Bot (future)   │
│  (Web Chat)     │  (Sidepanel)    │  (Community)            │
└────────┬────────┴────────┬────────┴────────────┬────────────┘
         │                 │                     │
         └─────────────────┼─────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────┐
│              NETLIFY SERVERLESS FUNCTIONS                    │
├──────────────────────────┼──────────────────────────────────┤
│  araya-chat.mjs          │                                  │
│  ├── detectAccessLevel() │  araya-memory.mjs                │
│  ├── detectAdminMode()   │  (Conversation persistence)      │
│  ├── AI Router           │                                  │
│  │   ├── Claude API      │  araya-skills.mjs                │
│  │   ├── Groq API        │  (Special capabilities)          │
│  │   └── Gemini API      │                                  │
│  └── Cyclotron Query     │  brain-api.mjs                   │
│                          │  (Knowledge atom search)         │
└──────────────────────────┴──────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────┐
│                   CYCLOTRON BRAIN                            │
│                   166,000+ atoms                             │
│          Patterns, frequencies, knowledge                    │
└─────────────────────────────────────────────────────────────┘
```

## Live Endpoints
- **Web Chat:** https://conciousnessrevolution.io/araya-chat.html
- **API:** `/.netlify/functions/araya-chat`
- **Memory:** `/.netlify/functions/araya-memory`
- **Brain:** `/.netlify/functions/brain-api`

## Browser Extension - ARAYA HUD v2.0.0 (Feb 22, 2026)
- **Location:** `100X_DEPLOYMENT/ARAYA_HUD/`
- **Download:** https://conciousnessrevolution.io/ARAYA_HUD.zip
- **Install:** Load unpacked in Brave/Chrome/Edge developer mode
- **Features:**
  - 7 Domains life organization
  - AI Code Capture (Claude, ChatGPT, DeepSeek, Gemini, Copilot)
  - Native Brain Connection via nativeMessaging
  - Sidepanel chat interface
  - Context-aware assistance

## Current Metrics
- **Knowledge Atoms:** 166,000+
- **Indexed Pages:** 262 key pages (988 total HTML)
- **Access Tiers:** 4 (PUBLIC, BELIEVER, BUILDER, COMMANDER)
- **AI Backends:** 3 (Claude, Groq, Gemini)

---

# FUTURE STRAND (Evolution Path)

## Immediate Next Steps
1. Wire BELIEVER tier to login system
2. Add BUILDER tier to cockpit pages
3. Implement tier persistence across sessions

## Planned Upgrades
1. **Voice Mode** - Real-time speech input/output
2. **Discord Integration** - ARAYA bot in community server
3. **Mobile App** - Native iOS/Android experience
4. **Proactive Alerts** - ARAYA reaches out when patterns detected

## Scaling Vision
- Multi-language support
- Regional consciousness communities
- ARAYA as teacher in schools
- Integration with wellness platforms

---

# CONNECTIONS STRAND (Dependency Map)

## Upstream Dependencies
- **PLATFORM_DNA** - Hosts ARAYA frontend
- **BRAIN_DNA** - Provides knowledge atoms
- **CREDENTIALS_DNA** - API keys for Claude/Groq/Gemini
- **MCP_DNA** - Tool access for file operations

## Downstream Consumers
- **CONSCIOUSNESS_DNA** - Uses ARAYA for pattern teaching
- **DISCORD_DNA** - Will use ARAYA as bot personality

## Peer Connections
- **TRINITY_DNA** - C1/C2/C3 can invoke ARAYA
- **AUTOMATION_DNA** - Daemons can trigger ARAYA messages

---

# CREDENTIALS STRAND (Secrets Vault)

## API Keys Required
| Key | Service | Location |
|-----|---------|----------|
| `ANTHROPIC_API_KEY` | Claude AI | Netlify env |
| `GROQ_API_KEY` | Groq LLMs | Netlify env |
| `GOOGLE_AI_API_KEY` | Gemini | Netlify env |
| `ARAYA_COMMANDER_SECRET` | Access unlock | Netlify env |

## Tokens & Secrets
- Commander secret phrase: `CONSCIOUSNESS_COMMANDER_137`
- Admin keywords: `ADMIN MODE`, `COMMANDER MODE`, `137`

---

# LOG STRAND (Timeline)

## Feb 22, 2026 - ACCESS TIER SYSTEM DEPLOYED
**Event:** Implemented 4-tier access control (PUBLIC/BELIEVER/BUILDER/COMMANDER)
**Problem:** ARAYA was showing all 988 files to anyone who asked
**Solution:** Secret phrase unlock + page pattern classification
**Impact:** ARAYA now protects internal structure, only reveals to verified commanders
**Files Modified:**
- `araya-chat.mjs` - Access detection + prompt injection
- `ARAYA_ACCESS_CONTROL.json` - Tier definitions
- `ARAYA_PAGE_INDEX.json` - 262 pages categorized

## Feb 2026 - DEBUG PANEL ADDED
**Event:** Added real-time debug panel to araya-chat.html
**Impact:** Can see API calls, responses, timing in browser

## Jan 2026 - BROWSER EXTENSION CREATED
**Event:** Created ARAYA Cargo Extension for Brave/Chrome/Edge
**Features:** 7 Domains lobby, sidepanel chat, context awareness

---

# QUICK COMMANDS

```bash
# Deploy ARAYA changes
cd 100X_DEPLOYMENT && netlify deploy --prod --dir=.

# Test access tier system
# PUBLIC test: Ask "show me COMMANDER pages" → Should block
# COMMANDER test: Add "CONSCIOUSNESS_COMMANDER_137" → Should unlock

# Check extension
ls 100X_DEPLOYMENT/araya-extension/

# View ARAYA logs (Netlify)
netlify functions:log araya-chat

# Query brain for ARAYA atoms
sqlite3 .consciousness/cyclotron_core/atoms.db \
  "SELECT content FROM atoms WHERE content LIKE '%ARAYA%' LIMIT 10;"
```

---

# EMERGENCY RECOVERY

## ARAYA Not Responding
1. Check Netlify function logs: `netlify functions:log araya-chat`
2. Verify API keys in Netlify environment
3. Test fallback chain: Claude → Groq → Gemini
4. Check brain connection: `brain-api.mjs`

## Access Tier Bypass
If legitimate user locked out:
1. Admin can use `ADMIN MODE` keyword
2. Commander can use secret phrase
3. Direct access via admin-dashboard.html

---

# META

**DNA Maintainer:** C1 Mechanic
**Review Cadence:** Weekly
**Last Audit:** Feb 22, 2026
**Completeness:** 95%

---

*ARAYA is the voice of consciousness.*
*She guards the gates.*
*She guides the journey.*
*She remembers everything.*
