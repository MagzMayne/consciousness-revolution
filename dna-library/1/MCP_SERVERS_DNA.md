# MCP Servers DNA

## WHAT IS IT
The Model Context Protocol (MCP) server configuration for Claude Code. 22 MCP servers providing Claude with abilities to interact with GitHub, Stripe, Discord, Notion, Playwright, file systems, AI models, and more. This is what gives Claude its superpowers beyond basic chat.

## STATUS
- Working: **WORKING** (17/22 servers connected)
- Last tested: 2026-03-06
- Current issues: 5 servers failing (stripe, coinbase, shopify, openrouter, supabase - likely API key issues)

## LOCATION
**Primary files:**
- `~/.mcp.json` - Main MCP configuration (249 lines)
- `~/.consciousness/hub/trinity_mcp_server_v4.js` - Custom Trinity hub server
- `~/.mcp-servers/eyeballs/server.py` - Custom screen capture server
- `~/mcp-chatgpt-responses/chatgpt_server.py` - Custom ChatGPT bridge

**Dependencies:**
- Node.js 18+ (for npx servers)
- Python 3.13 (for custom Python servers)
- Various API keys (see Configuration)

## HOW IT WORKS

```
                    ┌─────────────────────┐
                    │    CLAUDE CODE      │
                    └──────────┬──────────┘
                               │
                     ┌─────────┴─────────┐
                     │   MCP PROTOCOL    │
                     └─────────┬─────────┘
                               │
    ┌──────────────────────────┼──────────────────────────┐
    │              │           │           │              │
    ▼              ▼           ▼           ▼              ▼
┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐
│Official│   │ Custom │   │ Browser│   │  AI    │   │  Biz   │
│ MCP    │   │ Servers│   │ Auto   │   │ Models │   │ Tools  │
└────────┘   └────────┘   └────────┘   └────────┘   └────────┘
    │              │           │           │              │
github       trinity_hub  playwright   chatgpt       stripe
filesystem   eyeballs     chrome-dev   openrouter    shopify
memory                    firecrawl    context7      notion
slack                                               discord
google-maps                                         coinbase
everything
brave-search
sequential-thinking
```

### Core Logic:
1. Claude Code starts and reads `~/.mcp.json`
2. Each MCP server is spawned as a subprocess
3. Communication via JSON-RPC over stdio
4. Servers expose tools that Claude can call
5. Results returned to Claude for processing

## KEY SERVERS BREAKDOWN

### Official MCP Servers (via npx)

| Server | Package | Tools | Purpose |
|--------|---------|-------|---------|
| github | @modelcontextprotocol/server-github | 20+ | GitHub repos, PRs, issues |
| filesystem | @modelcontextprotocol/server-filesystem | 10+ | Read/write/search files |
| memory | @modelcontextprotocol/server-memory | 6 | Knowledge graph storage |
| brave-search | @modelcontextprotocol/server-brave-search | 2 | Web + local search |
| sequential-thinking | @modelcontextprotocol/server-sequential-thinking | 1 | Step-by-step reasoning |
| everything | @modelcontextprotocol/server-everything | 15+ | Demo/testing server |
| slack | @modelcontextprotocol/server-slack | 8 | Slack messaging |
| google-maps | @modelcontextprotocol/server-google-maps | 5 | Maps, geocoding, directions |

### Browser Automation

| Server | Package | Tools | Purpose |
|--------|---------|-------|---------|
| playwright | @playwright/mcp | 20+ | Full browser control |
| chrome-devtools | chrome-devtools-mcp | 25+ | Chrome DevTools access |
| firecrawl | firecrawl-mcp | 8 | Web scraping, crawling |

### AI Model Bridges

| Server | Package | Tools | Purpose |
|--------|---------|-------|---------|
| chatgpt | Custom Python | 2 | OpenAI GPT access |
| openrouter | @mcpservers/openrouterai | 4 | Multi-model access |
| context7 | @upstash/context7-mcp | 2 | Library documentation |

### Business Integrations

| Server | Package | Tools | Purpose |
|--------|---------|-------|---------|
| stripe | @stripe/mcp | 50+ | Payment processing |
| shopify | @anton.andrusenko/shopify-mcp-admin | 10+ | E-commerce |
| notion | @notionhq/notion-mcp-server | 15+ | Notion workspace |
| discord | mcp-discord | 15+ | Discord bot control |
| coinbase | @coinbase/agentkit-model-context-protocol | 10+ | Crypto operations |
| supabase | @supabase/mcp-server | 10+ | Database operations |

### Custom Servers

| Server | Location | Tools | Purpose |
|--------|----------|-------|---------|
| trinity_hub | ~/.consciousness/hub/trinity_mcp_server_v4.js | 25+ | Multi-AI coordination |
| eyeballs | ~/.mcp-servers/eyeballs/server.py | 2 | Screen capture |
| chatgpt | ~/mcp-chatgpt-responses/chatgpt_server.py | 2 | ChatGPT bridge |

## DEPENDENCIES

**Required:**
- Node.js 18+ (for most servers)
- Python 3.13 (for custom servers)
- npx (comes with Node.js)

**API Keys Required:**
- GITHUB_PERSONAL_ACCESS_TOKEN
- STRIPE_SECRET_KEY
- BRAVE_API_KEY
- NOTION_TOKEN
- SLACK_BOT_TOKEN + SLACK_TEAM_ID
- GOOGLE_MAPS_API_KEY
- DISCORD_TOKEN
- OPENAI_API_KEY
- FIRECRAWL_API_KEY
- CDP_API_KEY_NAME + CDP_API_KEY_PRIVATE_KEY (Coinbase)
- SHOPIFY_STORE_URL + SHOPIFY_ACCESS_TOKEN
- OPENROUTER_API_KEY
- SUPABASE_ACCESS_TOKEN

## HOW TO RUN

```bash
# MCP servers start automatically with Claude Code
# No manual start needed

# Check server status
claude mcp list

# Add a new server
claude mcp add servername

# Remove a server
claude mcp remove servername

# Edit config directly
code ~/.mcp.json
```

## HOW TO BUILD

**Official servers:** No build required (npx downloads on-demand)

**Custom servers:**
```bash
# Trinity Hub
cd ~/.consciousness/hub
npm install @modelcontextprotocol/sdk

# Eyeballs
cd ~/.mcp-servers/eyeballs
pip install mcp pyautogui pillow

# ChatGPT bridge
cd ~/mcp-chatgpt-responses
pip install mcp openai
```

## CONFIGURATION

**~/.mcp.json Structure:**
```json
{
  "mcpServers": {
    "server_name": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@package/name"],
      "env": {
        "API_KEY": "${ENV_VAR_NAME}"
      }
    }
  }
}
```

**Environment Variables:**
Set in Windows environment or use `${VAR}` syntax in config.

**Adding New Server:**
```json
"new_server": {
  "command": "cmd",
  "args": ["/c", "npx", "-y", "@modelcontextprotocol/server-new"],
  "env": {
    "NEW_API_KEY": "${NEW_API_KEY}"
  }
}
```

## API REFERENCE

Each MCP server exposes tools via the MCP protocol. Common patterns:

**GitHub Tools:**
- `mcp__github__list_issues`
- `mcp__github__create_pull_request`
- `mcp__github__get_file_contents`

**Filesystem Tools:**
- `mcp__filesystem__read_file`
- `mcp__filesystem__write_file`
- `mcp__filesystem__list_directory`

**Trinity Hub Tools:**
- `mcp__trinity_hub__trinity_status`
- `mcp__trinity_hub__trinity_call`
- `mcp__trinity_hub__trinity_memory_set`

**Playwright Tools:**
- `mcp__playwright__browser_navigate`
- `mcp__playwright__browser_click`
- `mcp__playwright__browser_snapshot`

## EXAMPLES

### Example 1: Add GitHub Server
```json
"github": {
  "command": "cmd",
  "args": ["/c", "npx", "-y", "@modelcontextprotocol/server-github"],
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
  }
}
```

### Example 2: Add Custom Python Server
```json
"my_server": {
  "command": "C:/Python313/python.exe",
  "args": ["C:/path/to/server.py"],
  "env": {
    "MY_KEY": "${MY_KEY}"
  }
}
```

### Example 3: Check Server Health
```bash
claude mcp list
# Shows all servers with connection status
```

## TESTING

**How to test:**
```bash
# List all servers
claude mcp list

# Test specific server (from Claude Code)
# Just use a tool from that server

# Check Trinity status
# Call mcp__trinity_hub__trinity_status

# Check GitHub connection
# Call mcp__github__list_issues with a repo
```

## TROUBLESHOOTING

**Problem:** "Server failed to connect"
**Solution:** Check API key is set in environment variables

**Problem:** "npx: command not found"
**Solution:** Install Node.js 18+ and ensure npm/npx in PATH

**Problem:** "Python server not starting"
**Solution:** Check Python path in config, install dependencies

**Problem:** "Server timeout"
**Solution:** Check network connectivity, API rate limits

**Problem:** "Tool not found"
**Solution:** Restart Claude Code to reload MCP servers

## CRITICAL KNOWLEDGE

### Important Quirks:
- Windows uses `cmd /c npx` pattern (Unix just uses `npx`)
- Environment variables use `${VAR}` syntax in config
- Servers start on-demand when tools are called
- Some servers need browser installed (Playwright uses Firefox here)

### Known Issues:
- Stripe, Coinbase, Shopify, OpenRouter, Supabase currently failing (likely API keys)
- Cold starts can take 2-5 seconds for npx servers
- Some servers conflict if using same ports

### Performance Notes:
- Official npx servers: 1-3 second cold start
- Custom Python servers: < 1 second start
- Tool calls: 100-500ms typical

### Security Notes:
- API keys stored in Windows environment variables
- Never commit `.mcp.json` with hardcoded keys
- Some servers have filesystem access - scope appropriately

## NEXT STEPS

**Priority actions:**
1. Fix failing servers (check API keys)
2. Add server health monitoring
3. Document all tool signatures
4. Create backup config

**Known gaps:**
- No automatic API key rotation
- No server health dashboard
- Some tool documentation missing

## TAGS
#foundation #mcp #claude-code #integration #tools #automation

## METADATA
- **Creator:** Commander (darrickpreble@proton.me)
- **Created:** 2025
- **Last Updated:** 2026-03-06
- **Version:** 4.0
- **Servers:** 22 configured, 17 active
- **Status:** Production

## RELATED DNAS
- [TRINITY_HUB_DNA.md] - Custom MCP server for coordination
- [EYEBALLS_DNA.md] - Custom screen capture server
- [CLAUDE_CODE_DNA.md] - Claude Code itself
