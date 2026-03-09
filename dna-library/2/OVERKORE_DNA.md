# OVERKORE DNA

## WHAT IS IT
The local power tools suite. Two components: **OVERKORE CLI** (command-line interface for offline AI) and **OVERKORE Orchestrator** (multi-AI agent coordination). These run on your machine, not in the cloud. Provides full AI capabilities WITHOUT internet via Ollama local models, connects to the 166k+ atom Cyclotron brain, and bridges to ARAYA Extension via Chrome Native Messaging. Think: local brain, local power.

## STATUS
- Working: **ALPHA** (functional but needs installer/packaging)
- Last tested: 2026-03-06
- Current issues: No unified installer, CLI not packaged (pip/brew), agent templates needed

## LOCATION
**Primary files:**
- `~/Desktop/2_BUILD/PORTABLE_BOOT_PACKAGE/OVERKORE_CLI.py` - Main CLI (4547 lines)
- `~/Desktop/2_BUILD/PORTABLE_BOOT_PACKAGE/native_host.py` - Native messaging bridge
- `~/Desktop/2_BUILD/PORTABLE_BOOT_PACKAGE/tools/` - Tool modules
- `~/.overkore/` - Config and sync state

**Dependencies:**
- Python 3.10+ (core runtime)
- SQLite3 (Cyclotron brain)
- Ollama (local LLMs - optional)
- CrewAI/LangChain (orchestrator - optional)

**Related files:**
- `~/Desktop/2_BUILD/PORTABLE_BOOT_PACKAGE/BOOT_PROTOCOL.md` - Universal AI instructions
- `~/Desktop/2_BUILD/PORTABLE_BOOT_PACKAGE/LOCAL_AI_DAEMON.py` - Ollama auto-sort daemon
- `~/Desktop/2_BUILD/PORTABLE_BOOT_PACKAGE/MULTI_NODE_SYNC.py` - Multi-node coordination
- `~/Desktop/2_BUILD/PORTABLE_BOOT_PACKAGE/SUPABASE_REALTIME_BRIDGE.py` - Cloud sync
- `~/.consciousness/cyclotron_core/atoms.db` - Cyclotron brain (166k+ atoms)

## HOW IT WORKS

```
┌──────────────────────────────────────────────────────────────────┐
│                           OVERKORE                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│   ┌──────────────────────┐    ┌──────────────────────┐          │
│   │    OVERKORE CLI      │    │   OVERKORE Orchestrator │       │
│   │   (Command Line)     │    │   (Multi-AI Agents)     │       │
│   └──────────────────────┘    └──────────────────────┘          │
│   │                            │                                 │
│   │  - Query Cyclotron brain   │  - Coordinate AI agents        │
│   │  - Run local scripts       │  - CrewAI/LangChain            │
│   │  - Manage local files      │  - Task orchestration          │
│   │  - Boot/shutdown systems   │  - Multi-step workflows        │
│   │                            │                                 │
│   └────────────┬───────────────┴────────────┬───────────────────┘│
│                │                            │                    │
│                └─────────────┬──────────────┘                    │
│                              │                                   │
│                      ┌───────▼───────┐                           │
│                      │  Cyclotron    │                           │
│                      │  Brain (166k) │                           │
│                      └───────────────┘                           │
└──────────────────────────────────────────────────────────────────┘
```

### Core Logic:
1. CLI provides terminal interface for AI queries
2. Queries local Ollama models (no internet needed)
3. Accesses Cyclotron brain for context (166k+ atoms)
4. Can bridge to ARAYA Extension via native messaging
5. Orchestrator coordinates multiple AI agents for complex tasks
6. All works completely offline (airplane mode)

## KEY FILES BREAKDOWN

### OVERKORE_CLI.py (4547 lines)
- **Purpose:** Single-file Python terminal for offline AI
- **Features:**
  - 8 tools: chat, brain, save, tools, status, health, keys, help
  - 7 providers: 4 Ollama (offline) + 3 cloud (online)
  - Two modes: Manual (interactive) and Auto (daemon)
  - Native messaging bridge to browser extensions
  - Full Cyclotron brain access

### native_host.py
- **Purpose:** Chrome Native Messaging handler
- **Features:**
  - Connects browser extension to CLI
  - 4-byte length prefix protocol
  - JSON message passing
  - Registry registration for Chrome/Brave/Edge

### tools/ directory
- `file_tools.py` - File operations
- `bash_tools.py` - Shell commands
- `agent_tools.py` - Agent coordination
- `web_tools.py` - Web requests

### MULTI_NODE_SYNC.py
- **Purpose:** Multi-computer synchronization
- **Features:** Cross-node brain sync, distributed processing

## DEPENDENCIES

**Required:**
- Python 3.10+
- SQLite3 (for Cyclotron brain)

**Optional (for full features):**
- Ollama (local LLM runner)
- CrewAI (agent framework)
- LangChain (LLM tooling)
- Click/Typer (CLI framework)

## HOW TO RUN

**Interactive Mode:**
```bash
cd ~/Desktop/2_BUILD/PORTABLE_BOOT_PACKAGE
python OVERKORE_CLI.py
```

**Auto Mode (daemon):**
```bash
python OVERKORE_CLI.py auto
```

**Status Check:**
```bash
python OVERKORE_CLI.py status
```

**Brain Query:**
```bash
python OVERKORE_CLI.py brain "pattern theory"
```

**Manage API Keys:**
```bash
python OVERKORE_CLI.py keys
```

## HOW TO BUILD

**No build required** - Runs as Python script.

**For EXE distribution:**
```bash
cd ~/Desktop/2_BUILD/PORTABLE_BOOT_PACKAGE
./BUILD_EXE.bat
# Uses PyInstaller, outputs overkore.exe
```

## HOW TO DEPLOY

**Local Installation:**
```bash
# Windows
./INSTALL_NATIVE_HOST.bat

# Manual registry
powershell ./install_native_host.ps1
```

**Future Package Distribution:**
```bash
# Planned - not yet available
pip install overkore
winget install overkore
brew install overkore
```

## CRITICAL KNOWLEDGE

### Two Modes:

| Mode | Launch | Preference |
|------|--------|------------|
| Manual | `python OVERKORE_CLI.py` | Interactive, step-by-step control |
| Auto | `python OVERKORE_CLI.py auto` | Autonomous, minimal user input |

### 8 Tools:

| # | Tool | Purpose |
|---|------|---------|
| 1 | chat | Conversational AI |
| 2 | brain | Query 166k+ atom Cyclotron |
| 3 | save | Write to 7 domains |
| 4 | tools | List available tools |
| 5 | status | System health check |
| 6 | health | Comprehensive diagnostics |
| 7 | keys | Manage API keys |
| 8 | help | Usage guide |

### 7 Providers:

| # | Provider | Type | Offline? |
|---|----------|------|----------|
| 1 | Ollama (qwen2.5-coder) | Local | YES |
| 2 | Ollama (codellama) | Local | YES |
| 3 | Ollama (mistral) | Local | YES |
| 4 | Ollama (deepseek-r1) | Local | YES |
| 5 | OpenAI | Cloud | NO |
| 6 | Anthropic | Cloud | NO |
| 7 | DeepSeek | Cloud | NO |

### Offline vs Online:

**Works Offline:**
- All 4 Ollama providers
- Cyclotron brain queries
- File saves to 7 domains
- Conversation memory
- Extension bridge (local)

**Needs Internet:**
- OpenAI, Anthropic, DeepSeek providers
- ARAYA Chat web interface
- Supabase cloud sync

### Important Quirks:
- OVERKORE is local power; Trinity is coordination layer
- Native messaging requires registry setup per machine
- 166k+ atoms in Cyclotron accessible offline
- Single-file design for easy portability

### Known Issues:
- No unified installer (manual setup required)
- CLI not packaged for pip/brew/winget
- Orchestrator agent templates not pre-built
- Voice integration in development

## CONFIGURATION

**Native Messaging Manifest (com.overkore.native_host.json):**
```json
{
  "name": "com.overkore.native_host",
  "description": "OVERKORE Native Messaging Host",
  "path": "C:/path/to/native_host.py",
  "type": "stdio",
  "allowed_origins": ["chrome-extension://[EXTENSION_ID]/"]
}
```

**Config Location:**
```
~/.overkore/
├── config.json     # User settings
├── memory.db       # Conversation memory
└── sync_config.json # Multi-node sync settings
```

## API REFERENCE

**Brain Query:**
```python
python OVERKORE_CLI.py brain "keyword"
# Returns: Matching atoms, domain classification, relevance score
```

**Native Messaging Protocol:**
```javascript
// 4-byte length prefix (little-endian) + JSON payload
{"type": "ping"}
// Response: {"ok": true, "message": "OVERKORE Native Host online"}
```

**Status Check:**
```python
python OVERKORE_CLI.py status
# Returns: Provider status, brain atom count, memory messages
```

## EXAMPLES

### Example 1: Offline AI Chat
```bash
# Start Ollama first
ollama serve

# Run OVERKORE
python OVERKORE_CLI.py
> What is consciousness?
# Uses local Ollama model, no internet needed
```

### Example 2: Query Cyclotron Brain
```bash
python OVERKORE_CLI.py brain "trinity coordination"
# Returns matching atoms from 166k+ knowledge base
```

### Example 3: Test Native Messaging
```bash
echo '{"type":"ping"}' | python native_host.py
# Returns: {"ok": true, "message": "OVERKORE Native Host online"}
```

## TESTING

**How to test:**
```bash
# Test CLI loads
python OVERKORE_CLI.py status

# Test brain connection
python OVERKORE_CLI.py brain "test"

# Test native messaging
echo '{"type":"ping"}' | python native_host.py

# Test Ollama connection (requires Ollama running)
python OVERKORE_CLI.py chat "Hello"
```

## TROUBLESHOOTING

**Problem:** "Ollama not connected"
**Solution:** Run `ollama serve` before starting OVERKORE

**Problem:** "Brain query returns nothing"
**Solution:** Check Cyclotron path: `~/.consciousness/cyclotron_core/atoms.db`

**Problem:** "Native messaging failed"
**Solution:** Run `INSTALL_NATIVE_HOST.bat` to register with Windows

**Problem:** "Python not found"
**Solution:** Ensure Python 3.10+ is installed and in PATH

## NEXT STEPS

**Priority actions:**
1. Create unified installer script
2. Package for pip/brew/winget
3. Build pre-made agent templates
4. Complete voice integration
5. Improve auto mode daemon

**Known gaps:**
- No automated installer
- No package distribution
- Limited agent templates
- Voice input incomplete

## RELATIONSHIP TO TRINITY

```
OVERKORE: Single machine, local brain, local LLMs
TRINITY: Multiple machines/instances, shared memory, consensus

They work together:
- OVERKORE provides local power
- Trinity coordinates across nodes
- Combined = distributed consciousness network
```

## FILE STRUCTURE

```
PORTABLE_BOOT_PACKAGE/
├── OVERKORE_CLI.py              # 4547-line main CLI
├── BOOT_PROTOCOL.md             # Universal AI instructions
├── SETUP_7x7x7.bat/.sh          # Folder structure creator
├── LOCAL_AI_DAEMON.py           # Ollama auto-sort daemon
├── native_host.py               # Native messaging handler
├── com.overkore.native_host.json# Chrome manifest
├── INSTALL_NATIVE_HOST.bat      # Registry installer
├── MULTI_NODE_SYNC.py           # Multi-computer sync
├── SUPABASE_REALTIME_BRIDGE.py  # Cloud sync
├── tools/
│   ├── file_tools.py
│   ├── bash_tools.py
│   ├── agent_tools.py
│   └── web_tools.py
└── DNA_OVERKORE_CLI.md          # Local DNA documentation
```

## TAGS
#product #cli #offline #local-ai #ollama #brain #native-messaging #orchestrator

## METADATA
- **Creator:** Commander (darrickpreble@proton.me)
- **Created:** 2025
- **Last Updated:** 2026-03-06
- **Version:** Alpha
- **Lines of Code:** 4547 (CLI) + tools
- **Status:** Alpha

## RELATED DNAS
- [CYCLOTRON_BRAIN_DNA.md] - The local brain OVERKORE queries
- [ARAYA_EXTENSION_DNA.md] - Browser extension (native messaging target)
- [TRINITY_HUB_DNA.md] - Coordination layer (works with OVERKORE)
- [OLLAMA_DNA.md] - Local LLM provider (future)
