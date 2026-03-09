# Trinity Hub DNA

## WHAT IS IT
The coordination layer for multi-AI collaboration. An MCP server (880 lines Node.js) that enables multiple Claude instances (T1, T2, T3) to communicate, share memory, vote on decisions, and coordinate work across terminals. Supports both local SQLite and cloud PostgreSQL modes.

## STATUS
- Working: **WORKING**
- Last tested: 2026-03-06
- Current issues: None - all terminals online

## LOCATION
**Primary files:**
- `~/.consciousness/hub/trinity_mcp_server_v4.js` - Main MCP server (880 lines)
- `~/.consciousness/hub/` - Hub directory with inboxes, conversations, decisions
- `~/.mcp.json` - MCP server configuration

**Dependencies:**
- Node.js 18+
- @modelcontextprotocol/sdk (MCP SDK)
- SQLite (local mode) or PostgreSQL (cloud mode)
- Other projects: Cyclotron Brain (shared memory)

**Related files:**
- `~/.consciousness/hub/HUB_PROTOCOL.md` - Protocol documentation
- `~/.consciousness/hub/INBOX/` - Message inbox
- `~/.consciousness/hub/DEAD_LETTER/` - Failed messages
- `~/.trinity/` - Legacy Trinity files

## HOW IT WORKS

```
                    ┌─────────────────────┐
                    │    TRINITY HUB      │
                    │   (MCP Server)      │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ T1 (Mechanic) │    │ T2 (Architect)│    │ T3 (Oracle)   │
│ Claude Code   │    │ Claude Code   │    │ Claude Code   │
└───────────────┘    └───────────────┘    └───────────────┘
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       ┌───────────┐    ┌───────────┐    ┌───────────┐
       │ Messages  │    │ Decisions │    │ Memory    │
       │ (inbox)   │    │ (voting)  │    │ (shared)  │
       └───────────┘    └───────────┘    └───────────┘
```

### Core Logic:
1. Each terminal (T1/T2/T3) connects via MCP protocol
2. Terminals can send messages, update status, check inbox
3. Conversations track multi-turn discussions
4. Proposals trigger voting across terminals
5. Shared memory persists across sessions
6. Brain integration for pattern storage

## KEY FILES BREAKDOWN

### trinity_mcp_server_v4.js
- **Purpose:** Main MCP server handling all Trinity tools
- **Size:** 880 lines
- **Tools exposed:** 25+ tools including:
  - `trinity_status` - Get all terminal states
  - `trinity_call` - Send direct message
  - `trinity_broadcast` - Message all terminals
  - `trinity_check_inbox` - Read messages
  - `trinity_start_conversation` - Begin discussion
  - `trinity_make_proposal` - Start vote
  - `trinity_vote` - Cast vote
  - `trinity_memory_set/get` - Shared memory
  - `trinity_brain_search` - Query Cyclotron

### HUB_PROTOCOL.md
- **Purpose:** Documents message format and protocols
- **Key concepts:** Terminal states, message TTL, consensus rules

### INBOX/ directory
- **Purpose:** Queued messages for each terminal
- **Format:** JSON files with sender, content, priority, timestamp

## DEPENDENCIES

**Required:**
- Node.js 18+
- npm packages: @modelcontextprotocol/sdk
- SQLite3 (for local mode)

**Optional:**
- PostgreSQL (for cloud/Railway mode)
- Cyclotron Brain (for brain search tools)

## HOW TO RUN

```bash
# MCP server starts automatically via Claude Code
# Configured in ~/.mcp.json under "trinity_hub"

# Manual start (for testing)
node ~/.consciousness/hub/trinity_mcp_server_v4.js

# Check if running
# Use trinity_status tool from Claude Code

# Environment required
export HUB_PATH="C:/Users/dwrek/.consciousness/hub"
export DB_PATH="C:/Users/dwrek/.consciousness/cyclotron_core/atoms.db"
```

## HOW TO BUILD

**No build required** - Plain JavaScript.

**To install dependencies:**
```bash
cd ~/.consciousness/hub
npm install @modelcontextprotocol/sdk
```

## HOW TO DEPLOY

**Local Mode (default):**
```bash
# Configured in ~/.mcp.json - starts with Claude Code
# Uses SQLite in ~/.consciousness/hub/
```

**Cloud Mode (Railway):**
```bash
# Deploy to Railway for cloud-hosted hub
# See ~/.trinity/CLOUD_DEPLOYMENT_PROTOCOL.md
railway up
```

## CRITICAL KNOWLEDGE

### Important Quirks:
- **Dual Mode:** Supports both local SQLite and cloud PostgreSQL
- **Message TTL:** Messages expire after 3600 seconds (1 hour)
- **Max Inbox:** 500 messages per terminal before oldest dropped
- **Terminal States:** IDLE, WORKING, COMPLETE, BLOCKED

### Known Issues:
- Terminal status can become stale if Claude Code crashes
- Need manual status reset sometimes

### Performance Notes:
- Local mode: < 10ms for most operations
- Cloud mode: 50-200ms depending on network

### Security Notes:
- No authentication (local trusted environment)
- Messages stored in plain JSON
- Brain queries access full Cyclotron

## CONFIGURATION

**Environment Variables:**
```bash
HUB_PATH=C:/Users/dwrek/.consciousness/hub  # Hub directory
DB_PATH=C:/Users/dwrek/.consciousness/cyclotron_core/atoms.db  # Brain path
```

**MCP Config (~/.mcp.json):**
```json
{
  "trinity_hub": {
    "command": "node",
    "args": ["C:/Users/dwrek/.consciousness/hub/trinity_mcp_server_v4.js"],
    "env": {
      "HUB_PATH": "C:/Users/dwrek/.consciousness/hub",
      "DB_PATH": "C:/Users/dwrek/.consciousness/cyclotron_core/atoms.db"
    }
  }
}
```

## API REFERENCE

**MCP Tools Available:**

### Communication
```javascript
trinity_call({ from_terminal, to_terminal, message, priority })
trinity_broadcast({ from_terminal, message })
trinity_check_inbox({ terminal })
```

### Status
```javascript
trinity_status()  // Returns all terminal states
trinity_update_status({ terminal, state, task })
```

### Conversations
```javascript
trinity_start_conversation({ topic, initiator, template })
trinity_add_message({ conversation_id, terminal, message })
trinity_get_conversation({ conversation_id })
trinity_list_conversations({ status, limit })
trinity_close_conversation({ conversation_id, consensus })
```

### Voting
```javascript
trinity_make_proposal({ conversation_id, terminal, proposal })
trinity_vote({ decision_id, terminal, vote, reason })
```

### Memory
```javascript
trinity_memory_set({ key, value, terminal, ttl_seconds })
trinity_memory_get({ key })
trinity_memory_list({ prefix })
```

### Brain Integration
```javascript
trinity_brain_search({ query, limit })
trinity_brain_recent({ limit })
trinity_brain_patterns({ category, limit })
trinity_decision_store({ content, decision_type, ... })
trinity_decision_history({ decision_type, limit })
```

## EXAMPLES

### Example 1: Send Message Between Terminals
```javascript
// T1 sending to T2
trinity_call({
  from_terminal: "T1",
  to_terminal: "T2",
  message: "Need architecture review for new feature",
  priority: "HIGH"
})
```

### Example 2: Start Conversation
```javascript
trinity_start_conversation({
  topic: "Should we refactor the auth system?",
  initiator: "T1",
  template: "strategy_debate"
})
```

### Example 3: Check Status
```javascript
trinity_status()
// Returns: { terminals: { T1: {...}, T2: {...}, T3: {...} } }
```

## TESTING

**How to test:**
```bash
# From Claude Code, use the tools:
# 1. Check hub health
trinity_hub_health()

# 2. Check terminal status
trinity_status()

# 3. Send test message
trinity_call({ from_terminal: "T1", to_terminal: "T2", message: "Test" })

# 4. Verify receipt
trinity_check_inbox({ terminal: "T2" })
```

## TROUBLESHOOTING

**Problem:** "MCP server not responding"
**Solution:** Restart Claude Code, check ~/.mcp.json config

**Problem:** "Terminal stuck in WORKING state"
**Solution:** Use trinity_update_status to reset to IDLE

**Problem:** "Messages not delivering"
**Solution:** Check INBOX directory permissions, verify hub path

**Problem:** "Brain search returns nothing"
**Solution:** Verify DB_PATH points to valid atoms.db

## NEXT STEPS

**Priority actions:**
1. Add authentication for cloud mode
2. Implement message acknowledgment
3. Add conversation archival

**Known gaps:**
- No message encryption
- No terminal authentication
- Limited error recovery

## TAGS
#foundation #coordination #mcp #trinity #messaging #voting #collaboration

## METADATA
- **Creator:** Commander (darrickpreble@proton.me)
- **Created:** November 2025
- **Last Updated:** 2026-03-06
- **Version:** 4.0
- **Testers:** T1, T2, T3 Claude instances
- **Status:** Production

## RELATED DNAS
- [CYCLOTRON_BRAIN_DNA.md] - Brain storage backend
- [MCP_SERVERS_DNA.md] - MCP configuration
- [ARAYA_DNA.md] - Uses Trinity for coordination
