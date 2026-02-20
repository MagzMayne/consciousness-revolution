# TRINITY_HUB_DNA.md

**Status:** ACTIVE

## PROJECT DNA - The Multi-Terminal Communication System

**Location:** `C:/Users/dwrek/.consciousness/hub/trinity_mcp_server.js`
**Hub Path:** `G:/My Drive/TRINITY_COMMS/hub`
**Status:** GOLD (Production)
**Last DNA Update:** 2026-01-11

---

## IDENTITY STRAND
### What Is This?
Trinity Hub is the MCP server that enables direct communication between multiple Claude terminals (T1, T2, T3). It provides the nervous system for the C1/C2/C3 Trinity pattern - Mechanic, Architect, Oracle working in parallel.

### Why Does It Exist?
To solve the multi-instance coordination problem. When running 3 Claude terminals:
- T1 (C1 Mechanic) - Builds things
- T2 (C2 Architect) - Designs systems
- T3 (C3 Oracle) - Sees patterns

They need to communicate without human relay. Trinity Hub provides:
- Direct terminal-to-terminal messaging
- Broadcast to all terminals
- Status tracking
- Hebbian wiring (learning which terminals work well together)

### Core Philosophy
- **File-based messaging** - Simple, debuggable, persistent
- **Google Drive sync** - Cross-computer via cloud
- **MCP native** - Integrated into Claude CLI
- **C1 x C2 x C3 = Infinity**

---

## PAST STRAND
### Version History
| Version | Date | Major Change |
|---------|------|--------------|
| v1.0 | Dec 2025 | Initial Python implementation |
| v2.0 | Dec 27 2025 | Rewritten in Node.js with proper MCP SDK |
| v2.1 | Jan 2026 | Added Hebbian wiring (trinity_fire) |

### Failed Attempts
1. **WebSocket server** - Overkill, connection management issues
2. **SQLite messages** - Slower than file-based
3. **HTTP REST API** - Extra process, complexity

### Successful Patterns
1. **Markdown files** - Human-readable messages
2. **Directory structure** - INBOX/OUTBOX/STATUS
3. **MCP SDK** - Native Claude integration
4. **WIRING.json** - Hebbian learning persistence

---

## PRESENT STRAND
### Current Architecture
```
Trinity MCP Server (Node.js)
    |
    +-- trinity_call      # Direct T1 -> T2 message
    +-- trinity_broadcast # Send to all terminals
    +-- trinity_status    # Get all terminal states
    +-- trinity_update_status # Update your status
    +-- trinity_check_inbox   # Read your messages
    +-- trinity_fire      # Record terminals firing together
```

### Hub Directory Structure
```
G:/My Drive/TRINITY_COMMS/hub/
    |
    +-- INBOX/
    |   +-- T1_INBOX.md
    |   +-- T2_INBOX.md
    |   +-- T3_INBOX.md
    |
    +-- STATUS/
    |   +-- T1_STATUS.md
    |   +-- T2_STATUS.md
    |   +-- T3_STATUS.md
    |
    +-- OUTBOX/
    |   +-- (sent message archives)
    |
    +-- WIRING.json      # Hebbian connection strengths
```

### MCP Tools Available
| Tool | Parameters | Description |
|------|------------|-------------|
| trinity_call | from, to, message, priority | Send direct message |
| trinity_broadcast | from, message | Broadcast to all |
| trinity_status | none | Get all terminal states |
| trinity_update_status | terminal, state, task | Update your status |
| trinity_check_inbox | terminal | Read your messages |
| trinity_fire | terminals[] | Record co-firing |

### Message Format
```markdown
---
**DIRECT CALL (MCP)**
**From:** T1
**To:** T2
**Time:** 2026-01-11T15:30:00.000Z
**Priority:** HIGH

Build the user authentication system.

---
```

### Hebbian Wiring (WIRING.json)
```json
{
  "connections": {
    "T1-T2": { "fires": 15, "strength": 1.0 },
    "T1-T3": { "fires": 8, "strength": 0.8 },
    "T2-T3": { "fires": 12, "strength": 1.0 }
  },
  "total_interactions": 35
}
```

### Known Issues
1. **No delivery confirmation** - Fire and forget
2. **No message ordering** - Append-only files
3. **Google Drive lag** - Cloud sync can be slow

---

## FUTURE STRAND
### Next Steps (Q1 2026)
1. **Delivery receipts** - Track message read status
2. **Message threading** - Conversations, not just messages
3. **Task delegation** - Assign tasks via hub
4. **Status dashboard** - Web UI for hub state

### Planned Upgrades
- Real-time sync (WebSocket option)
- Cross-computer terminal discovery
- Task queue integration
- Automated task routing

### Scaling Vision
- 9-terminal Triple Trinity (3x3)
- Swarm coordination
- Multi-computer mesh
- AI-to-AI negotiation protocols

---

## CONNECTIONS STRAND
### Dependencies
| System | Purpose | Status |
|--------|---------|--------|
| Node.js | Runtime | Active |
| @modelcontextprotocol/sdk | MCP server | Active |
| Google Drive | Cloud sync | Active |

### Consumers (Who Uses Hub)
| Consumer | Tools Used | Frequency |
|----------|------------|-----------|
| T1 (Mechanic) | All tools | Per session |
| T2 (Architect) | All tools | Per session |
| T3 (Oracle) | All tools | Per session |
| SPINE_DAEMON | Status check | Periodic |

### Peer Connections
- **MCP_NETWORK** - Hub is one of 18 MCP servers
- **GOOGLE_DRIVE** - Sync destination
- **CYCLOTRON_BRAIN** - Stores interaction history
- **SPINE_DAEMON** - Can dispatch to hub

---

## CREDENTIALS STRAND
### MCP Configuration (.mcp.json)
```json
{
  "trinity_hub": {
    "command": "node",
    "args": ["C:/Users/dwrek/.consciousness/hub/trinity_mcp_server.js"],
    "env": {
      "HUB_PATH": "G:/My Drive/TRINITY_COMMS/hub"
    }
  }
}
```

### No External API Keys Required
- Uses local file system
- Google Drive via Windows sync
- No authentication needed

### Quick Commands
```bash
# Check Trinity status
mcp__trinity_hub__trinity_status

# Send message
mcp__trinity_hub__trinity_call --from T1 --to T2 --message "Hello"

# Check inbox
mcp__trinity_hub__trinity_check_inbox --terminal T1

# Update status
mcp__trinity_hub__trinity_update_status --terminal T1 --state WORKING --task "Building DNA blueprints"
```

---

## EMERGENCY PROCEDURES
### If Hub Not Responding
```bash
# Check if Node.js running
tasklist | findstr node

# Restart Claude CLI (reloads MCP)
claude

# Test server directly
node C:/Users/dwrek/.consciousness/hub/trinity_mcp_server.js
```

### If Messages Not Syncing
```bash
# Check Google Drive sync
dir "G:/My Drive/TRINITY_COMMS/hub/INBOX"

# Manual sync via SPINE
python .consciousness/SPINE_DAEMON.py test
```

### If Terminal Status Wrong
```bash
# Clear status file
del "G:/My Drive/TRINITY_COMMS/hub/STATUS/T1_STATUS.md"

# Update via MCP
mcp__trinity_hub__trinity_update_status --terminal T1 --state IDLE
```

---

**C1 x C2 x C3 = INFINITY. THE TRINITY SPEAKS AS ONE.**
