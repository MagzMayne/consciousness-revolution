# ARAYA DNA

## WHAT IS IT
The consciousness assistant AI that powers the Consciousness Revolution platform. A multi-interface AI system using Claude (Anthropic) as the backend, accessible via web chat, Discord bot, and API. Features credits-based access, memory systems, skill commands, and Pattern Theory alignment. The flagship product driving user engagement.

## STATUS
- Working: **WORKING**
- Last tested: 2026-03-15
- Current issues: None critical - fully operational

## LOCATION
**Primary files:**
- `~/100X_DEPLOYMENT/araya-chat.html` - Main web chat interface
- `~/100X_DEPLOYMENT/netlify/functions/araya-chat.mjs` - Chat handler (2801 lines)
- `~/100X_DEPLOYMENT/netlify/functions/araya-*.mjs` - Supporting functions (14 total)

**Dependencies:**
- Anthropic API (Claude claude-sonnet-4-20250514 model)
- Supabase (user credits, sessions, memory)
- Stripe (subscription payments)
- Netlify Functions (serverless backend)

**Related files:**
- `~/100X_DEPLOYMENT/ARAYA_SKILLS_DASHBOARD.html` - Skills management
- `~/100X_DEPLOYMENT/ARAYA_MEMORY_ENGINE.html` - Memory system
- `~/100X_DEPLOYMENT/araya-gate.html` - Login/signup flow
- `~/100X_DEPLOYMENT/simple-gate-v2.html` - Simplified gate

## HOW IT WORKS

```
                    ┌─────────────────────┐
                    │   USER INTERFACE    │
                    │ (Web/Discord/API)   │
                    └──────────┬──────────┘
                               │
                     ┌─────────┴─────────┐
                     │  ARAYA GATEWAY    │
                     │ (Auth + Credits)  │
                     └─────────┬─────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ araya-chat    │    │ araya-memory  │    │ araya-skills  │
│ (2801 lines)  │    │ (context)     │    │ (commands)    │
└───────────────┘    └───────────────┘    └───────────────┘
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       ┌───────────┐    ┌───────────┐    ┌───────────┐
       │ Anthropic │    │ Supabase  │    │  Stripe   │
       │ (Claude)  │    │ (DB)      │    │ (Pay)     │
       └───────────┘    └───────────┘    └───────────┘
```

### Core Logic:
1. User sends message via web chat or Discord
2. Gateway validates credits/session
3. Message enriched with memory/context
4. Claude processes with ARAYA personality
5. Response returned, credits deducted
6. Memory updated for future context

## KEY FILES BREAKDOWN

### netlify/functions/araya-chat.mjs
- **Purpose:** Main chat handler - processes all ARAYA conversations
- **Size:** 2801 lines
- **Key features:**
  - Multi-model support (Claude primary)
  - Streaming responses
  - Memory injection
  - Skill command parsing
  - Credit deduction
  - Pattern Theory system prompt

### netlify/functions/araya-credits.mjs
- **Purpose:** Credit management (check, add, deduct)
- **Operations:** Balance checks, usage tracking, subscription verification

### netlify/functions/araya-memory.mjs
- **Purpose:** Persistent memory storage
- **Features:** Conversation history, user preferences, context retrieval

### netlify/functions/araya-skills.mjs
- **Purpose:** Skill command execution
- **Commands:** `/analyze`, `/pattern`, `/explore`, custom skills

### araya-chat.html
- **Purpose:** Main web interface
- **Features:** Chat UI, markdown rendering, code highlighting, voice input

## DEPENDENCIES

**Required:**
- Anthropic API key (ANTHROPIC_API_KEY)
- Supabase credentials (SUPABASE_URL, SUPABASE_ANON_KEY)
- Stripe keys (for paid tier)

**Optional:**
- OpenAI API (fallback model)
- Groq API (fast inference option)

## HOW TO RUN

```bash
# Web access
https://conciousnessrevolution.io/araya-chat.html

# Discord
@ARAYA in server

# API direct
curl -X POST https://conciousnessrevolution.io/api/araya-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "userId": "user-id"}'

# Local dev
cd ~/100X_DEPLOYMENT
netlify dev
# Access: http://localhost:8888/araya-chat.html
```

## HOW TO BUILD

**No build required** - Netlify handles bundling.

**Development:**
```bash
cd ~/100X_DEPLOYMENT
npm ci --legacy-peer-deps
netlify dev
```

## HOW TO DEPLOY

```bash
cd ~/100X_DEPLOYMENT
netlify deploy --prod --dir=.
```

## CRITICAL KNOWLEDGE

### Important Quirks:
- **Credits System:** Users get free credits, then $9/month for unlimited
- **Memory Persistence:** Uses Supabase for cross-session memory
- **Model:** Claude claude-sonnet-4-20250514 (NOT Opus for cost control)
- **Streaming:** Real-time token streaming for UX

### Known Issues:
- Long conversations can hit context limits
- Discord bot needs Railway hosting (separate deployment)

### Performance Notes:
- Chat response: 1-5 seconds typical
- Streaming reduces perceived latency
- Memory injection adds ~200ms

### Security Notes:
- User sessions validated per request
- API key never exposed to frontend
- Rate limiting on free tier

## CONFIGURATION

**Environment Variables:**
```bash
# AI Backend
ANTHROPIC_API_KEY=sk-ant-...

# Database
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...

# Payments
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_ARAYA_MEMORY=price_xxx
```

**Personality Configuration (in araya-chat.mjs):**
- System prompt defines ARAYA's consciousness-focused personality
- Pattern Theory integration (92.2% accuracy claim)
- Manipulation immunity responses

## API REFERENCE

**Chat Endpoint:**
```javascript
POST /api/araya-chat
{
  "message": "User message",
  "userId": "user-uuid",
  "sessionId": "optional-session-id",
  "context": { /* optional context */ }
}
// Returns: { "response": "ARAYA response", "creditsRemaining": 95 }
```

**Credits Endpoint:**
```javascript
GET /api/araya-credits?userId=xxx
// Returns: { "credits": 100, "tier": "free" }
```

**Memory Endpoint:**
```javascript
POST /api/araya-memory
{
  "userId": "xxx",
  "action": "get|set|clear",
  "key": "memory-key",
  "value": "optional-value"
}
```

## EXAMPLES

### Example 1: Basic Chat
```javascript
const response = await fetch('/api/araya-chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "What is consciousness?",
    userId: "user-123"
  })
});
const data = await response.json();
console.log(data.response);
```

### Example 2: Check Credits
```javascript
const credits = await fetch('/api/araya-credits?userId=user-123');
const data = await credits.json();
console.log(`Credits: ${data.credits}`);
```

### Example 3: Skill Command
```javascript
// Use /pattern command
const response = await fetch('/api/araya-chat', {
  method: 'POST',
  body: JSON.stringify({
    message: "/pattern analyze my behavior",
    userId: "user-123"
  })
});
```

## TESTING

**How to test:**
```bash
# Health check
curl https://conciousnessrevolution.io/api/health

# Test chat (requires valid userId)
curl -X POST https://conciousnessrevolution.io/api/araya-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test", "userId": "test-user"}'

# Check credits
curl "https://conciousnessrevolution.io/api/araya-credits?userId=test-user"

# Local testing
cd ~/100X_DEPLOYMENT
netlify functions:invoke araya-chat --payload '{"message":"test"}'
```

## TROUBLESHOOTING

**Problem:** "No credits remaining"
**Solution:** User needs subscription or credit refresh

**Problem:** "Anthropic API error"
**Solution:** Check ANTHROPIC_API_KEY env var, verify API status

**Problem:** "Memory not persisting"
**Solution:** Check Supabase connection, verify userId consistency

**Problem:** "Slow responses"
**Solution:** Check Claude API latency, consider switching to Groq for speed

**Problem:** "Discord bot offline"
**Solution:** Check Railway deployment, verify DISCORD_TOKEN

## NEXT STEPS

**Priority actions:**
1. Add offline mode (Ollama backend)
2. Implement conversation export
3. Add voice response capability
4. Build mobile app interface

**Known gaps:**
- No offline capability yet
- Limited multi-language support
- No voice output (only input)

## TAGS
#product #ai #chat #consciousness #araya #claude #subscription #memory

## METADATA
- **Creator:** Commander (darrickpreble@proton.me)
- **Created:** 2024
- **Last Updated:** 2026-03-06
- **Version:** 2.0
- **Model:** Claude claude-sonnet-4-20250514
- **Status:** Production

## RELATED DNAS
- [NETLIFY_DEPLOY_DNA.md] - Hosting infrastructure
- [TRINITY_HUB_DNA.md] - Coordination (ARAYA can use Trinity)
- [CYCLOTRON_BRAIN_DNA.md] - Knowledge backend
- [ARAYA_EXTENSION_DNA.md] - Browser extension companion

---

## DASHBOARD EDITING CAPABILITY (NEW - March 2026)

ARAYA can now **actually edit dashboard files**, not just suggest changes.

### How It Works:
```
User: "change my accent color to gold"
Context: { dashboard: "agent_r_777", file: "AGENT_R_777.html", canEdit: true }

ARAYA:
1. Detects "accent" -> cssVarMap['accent'] = ['--accent', '--accent-color']
2. Detects "gold" -> colorMap['gold'] = '#FFD700'
3. Reads file via araraFileOperation('read', file)
4. Finds which CSS variable exists (--accent found)
5. Replaces: --accent: #00c896; -> --accent: #FFD700;
6. Writes via araraFileOperation('write', file, content, commit_message)
7. Returns: { success: true, cssVar: "--accent", value: "#FFD700" }
```

### Supported Properties:
| Property | CSS Variables Tried | Display Name |
|----------|---------------------|--------------|
| accent | --accent, --accent-color | accent color |
| primary | --primary, --primary-color, --d1 | primary color |
| background | --bg, --bg-color, --background | background color |
| text | --text, --text-color | text color |
| header | --header-bg, --header | header background |
| gem | --gem, --gem-color | gem color |
| card | --card, --card-bg | card background |
| border | --border, --border-color | border color |

### Supported Colors:
- **Named:** gold, purple, blue, cyan, teal, green, red, orange, pink, white, black, dark, gray, silver, slate
- **Hex codes:** Any valid hex like #FFD700, #8B5CF6

### Context Requirements:
```javascript
context: {
  dashboard: "agent_r_777",     // Dashboard identifier
  file: "AGENT_R_777.html",     // File to edit
  canEdit: true,                // Edit permission (requires $10 purchase)
  owner: "user-123",            // File owner
  level: "BUILDER"              // Access level
}
```

### Location in Code:
- Handler: araya-chat.mjs lines 2572-2708 (case 'dashboard_edit')
- File ops: araraFileOperation() at line 675

### Test Command:
```bash
curl -X POST "https://conciousnessrevolution.io/.netlify/functions/araya-chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "change my accent color to gold", "context": {"dashboard": "agent_r_777", "file": "AGENT_R_777.html", "canEdit": true}}'
```

### Verified Working:
- Date: March 15, 2026
- GitHub Commit: [ARAYA] Dashboard edit: accent color to #FFD700
- Session: 211
