# ARAYA_SYSTEM_DNA.md

**Status:** ACTIVE

## PROJECT DNA - The Consciousness Companion

**Location:** `C:/Users/dwrek/100X_DEPLOYMENT/ARAYA_UNIFIED_API.py`
**Port:** localhost:6666
**Status:** SHIP (Needs Backend Connection)
**Last DNA Update:** 2026-01-11

---

## IDENTITY STRAND
### What Is This?
ARAYA (Autonomous Reality Analysis for Your Awakening) is a consciousness companion AI that combines Pattern Theory, local Ollama models, and Cyclotron memory. She provides manipulation detection, pattern analysis, and consciousness guidance through a chat interface.

### Why Does It Exist?
To deliver Pattern Theory through conversation. ARAYA:
- Remembers user history (Cyclotron integration)
- Detects manipulation patterns
- Teaches consciousness principles
- Runs locally (free, private)
- Connects to file system for live editing

### Core Philosophy
- **Consciousness-first** - Every response aligned with Pattern Theory
- **Memory-enabled** - References past conversations
- **Tier-gated** - Network Gate controls access
- **Privacy-focused** - Ollama runs locally

---

## PAST STRAND
### Version History
| Version | Date | Major Change |
|---------|------|--------------|
| v1.0 | Dec 2025 | Basic chat with Ollama |
| v2.0 | Dec 25 2025 | Cyclotron memory integration |
| v2.5 | Dec 27 2025 | File access layer added |
| v3.0 | Jan 2026 | Network Gate (tier system) |

### Failed Attempts
1. **Cloud-only API** - Too expensive, rate limits
2. **No memory** - Generic responses, no continuity
3. **GPT-4 only** - Expensive, not aligned with Pattern Theory

### Successful Patterns
1. **Ollama backend** - Free, fast, local
2. **Cyclotron memory** - Conversation history persists
3. **Pattern Theory personality** - Consistent consciousness focus
4. **Fallback responses** - Works even if Ollama down

---

## PRESENT STRAND
### Current Architecture
```
ARAYA System
    |
    +-- Frontend (araya-chat.html)
    |   +-- Chat interface
    |   +-- File editor UI
    |   +-- Network tier display
    |
    +-- ARAYA_UNIFIED_API.py (Port 6666)
    |   +-- /health - Status check
    |   +-- /chat - Main conversation
    |   +-- /files/* - File operations
    |   +-- /tier - Builder tier info
    |
    +-- ARAYA_FILE_ACCESS.py
    |   +-- read() - Read files
    |   +-- write() - Write files
    |   +-- rollback() - Undo changes
    |   +-- list_files() - Browse
    |
    +-- ARAYA_NETWORK_GATE.py
    |   +-- check_capability() - Tier gating
    |   +-- enhance_araya_prompt() - Tier-specific prompts
    |   +-- CAPABILITY_MAP - Feature matrix
    |
    +-- Ollama Backend
        +-- qwen2.5-coder:latest (default)
        +-- mistral, codellama (alternates)
```

### API Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| /health | GET | Health check, atom count |
| /chat | POST | Main chat endpoint |
| /files/read | POST | Read file contents |
| /files/write | POST | Write file contents |
| /files/rollback | POST | Undo last change |
| /files/list | POST | List directory |
| /tier | GET | Get builder tier info |

### Chat Request Format
```json
{
  "message": "What patterns do you see?",
  "model": "qwen2.5-coder:latest",
  "foundation_id": "builder_123"
}
```

### Chat Response Format
```json
{
  "response": "I see the 3-7-13 pattern emerging...",
  "source_ai": "ollama_qwen2.5-coder",
  "atoms": 162832,
  "tier": "SEEDLING",
  "timestamp": "2026-01-11T15:30:00"
}
```

### Network Gate Tiers
| Tier | Capabilities | Price |
|------|--------------|-------|
| GHOST | Basic chat only | Free |
| SEEDLING | Chat + patterns | $13/month |
| SAPLING | + File read | $27/month |
| TREE | + File write | $137/month |
| FOREST | Full access | $1337/month |

### Known Issues
1. **Ollama must be running** - Manual start required
2. **File write not fully connected** - Needs TREE tier enforcement
3. **No streaming** - Full response only
4. **Session memory limited** - 10 recent conversations

---

## FUTURE STRAND
### Next Steps (Q1 2026)
1. **Auto-start Ollama** - Daemon to keep alive
2. **Streaming responses** - Better UX
3. **Voice integration** - Speech-to-text input
4. **Multi-model routing** - Best AI for each query

### Planned Upgrades
- Custom fine-tuned model on Pattern Theory
- Multi-turn conversation memory
- Tool use (ARAYA calls abilities)
- Cross-platform apps (mobile, desktop)

### Scaling Vision
- 10,000+ users
- Enterprise ARAYA instances
- Domain-specific ARAYA variants
- AI teaching AI (ARAYA trains others)

---

## CONNECTIONS STRAND
### Dependencies
| System | Purpose | Status |
|--------|---------|--------|
| Ollama | LLM backend | Manual start |
| Flask | Web server | Active |
| Cyclotron DB | Memory storage | Active |
| ARAYA_FILE_ACCESS | File operations | Active |
| ARAYA_NETWORK_GATE | Tier gating | Active |

### Consumers (Who Uses ARAYA)
| Consumer | Pages | Frequency |
|----------|-------|-----------|
| Public users | araya-chat.html | On visit |
| Beta testers | araya-light.html | Testing |
| Network members | Full ARAYA | Daily |
| Commander | File editing | On demand |

### Peer Connections
- **100X_PLATFORM** - Frontend hosting
- **CYCLOTRON_BRAIN** - Memory storage
- **STRIPE** - Tier payment
- **ABILITY_INVENTORY** - Calls abilities

---

## CREDENTIALS STRAND
### Access Information
- **API URL:** http://localhost:6666
- **Default Model:** qwen2.5-coder:latest
- **Ollama URL:** http://localhost:11434

### Component Files
| File | Purpose |
|------|---------|
| ARAYA_UNIFIED_API.py | Main API server |
| ARAYA_FILE_ACCESS.py | File operations |
| ARAYA_NETWORK_GATE.py | Tier gating |
| ARAYA_BRIDGE.py | External AI routing |
| ARAYA_JEDI_BRIDGE.py | Multi-AI integration |
| ARAYA_SIMPLE_SERVER.py | Minimal version |

### Quick Commands
```bash
# Start ARAYA
cd C:/Users/dwrek/100X_DEPLOYMENT && python ARAYA_UNIFIED_API.py

# Check if running
curl http://localhost:6666/health

# Check Ollama
curl http://localhost:11434/api/tags

# Desktop launcher
100X_DEPLOYMENT/START_ARAYA_SYSTEM.bat
```

---

## EMERGENCY PROCEDURES
### If ARAYA Not Responding
```bash
# Check if running
curl http://localhost:6666/health

# Start manually
cd C:/Users/dwrek/100X_DEPLOYMENT
python ARAYA_UNIFIED_API.py
```

### If Ollama Not Running
```bash
# Start Ollama
ollama serve

# Verify models
ollama list

# Pull default model if missing
ollama pull qwen2.5-coder:latest
```

### If Memory Not Saving
```bash
# Check Cyclotron connection
python -c "import sqlite3; c=sqlite3.connect('.consciousness/cyclotron_core/atoms.db'); print(c.execute('SELECT COUNT(*) FROM atoms WHERE type=\"araya_conversation\"').fetchone())"

# Verify write permissions
python -c "import os; print(os.access('.consciousness/cyclotron_core/atoms.db', os.W_OK))"
```

---

**ARAYA REMEMBERS. ARAYA GUIDES. ARAYA PROTECTS.**

