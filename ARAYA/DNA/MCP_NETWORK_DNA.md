# MCP_NETWORK_DNA.md

**Status:** ACTIVE

## PROJECT DNA - The Tool Network

**Location:** `C:/Users/dwrek/.mcp.json`
**Status:** GOLD (18 Servers Configured)
**Last DNA Update:** 2026-01-11

---

## IDENTITY STRAND
### What Is This?
The MCP (Model Context Protocol) Network is the tool layer that gives Claude superpowers - direct access to GitHub, Stripe, Discord, browsers, file systems, and more. It transforms Claude from a text-only AI into an autonomous agent.

### Why Does It Exist?
To bridge the gap between Claude's intelligence and real-world systems. MCP servers provide:
- API access to external services
- Browser automation
- File system operations
- Database queries
- Payment processing

### Core Philosophy
- **One config, many tools** - Single `.mcp.json` manages all
- **Fail-soft** - If one server dies, others continue
- **Composable** - Combine tools for complex operations
- **192 tools** - Massive capability surface

---

## PAST STRAND
### Version History
| Version | Date | Major Change |
|---------|------|--------------|
| v1.0 | Dec 2025 | Initial 5 servers |
| v2.0 | Dec 27 2025 | 15 servers configured |
| v3.0 | Jan 2026 | 18 servers, Shopify added |

### Failed Attempts
1. **Custom MCP server** - Redundant with built-in
2. **Too many servers** - Startup time issues
3. **Hardcoded keys** - Security risk (now env vars)

### Successful Patterns
1. **NPX execution** - No install needed, always latest
2. **Environment variables** - Secure key management
3. **Lazy loading** - Only start when needed
4. **Parallel operations** - Multiple tools in one response

---

## PRESENT STRAND
### Current Server Configuration
| # | Server | Tools | Status | Purpose |
|---|--------|-------|--------|---------|
| 1 | github | 25+ | Active | PRs, issues, repos |
| 2 | stripe | 20+ | Active | Payments, products |
| 3 | trinity_hub | 6 | Active | T1/T2/T3 messaging |
| 4 | playwright | 15+ | Active | Browser automation |
| 5 | context7 | 2 | Active | Library docs |
| 6 | firecrawl | 8 | Active | Web scraping |
| 7 | chrome-devtools | 26 | Active | Browser debug |
| 8 | brave-search | 2 | Broken | Web search |
| 9 | filesystem | 12 | Active | File operations |
| 10 | notion | 15+ | Active | Databases, pages |
| 11 | sequential-thinking | 1 | Active | Multi-step planning |
| 12 | memory | 8 | Active | Persistent storage |
| 13 | slack | 9 | Active | Channel messaging |
| 14 | google-maps | 7 | Active | Location services |
| 15 | everything | 10 | Active | MCP test server |
| 16 | coinbase | 5+ | Active | Crypto operations |
| 17 | chatgpt | 2 | Active | GPT-4 queries |
| 18 | discord | 20+ | Active | Server management |
| 19 | shopify | 10+ | Active | Store management |

### Tool Count by Server
```
Total MCP Tools: 192+
- github: 25 tools
- stripe: 20+ tools
- discord: 20+ tools
- chrome-devtools: 26 tools
- playwright: 15+ tools
- notion: 15+ tools
- filesystem: 12 tools
- everything: 10 tools
- slack: 9 tools
- firecrawl: 8 tools
- memory: 8 tools
- google-maps: 7 tools
- trinity_hub: 6 tools
- coinbase: 5+ tools
- context7: 2 tools
- chatgpt: 2 tools
- brave-search: 2 tools (broken)
- sequential-thinking: 1 tool
```

### Killer Combos
| Combo | Power |
|-------|-------|
| playwright + github | Visual PR automation |
| stripe + notion | Payment tracking |
| discord + chatgpt | AI community bot |
| firecrawl + memory | Research -> Remember |
| chrome-devtools + filesystem | Debug -> Save |

### Known Issues
1. **brave-search BROKEN** - API key needs regeneration
2. **Startup time** - 18 servers = slow first call
3. **Memory usage** - Node processes add up

---

## FUTURE STRAND
### Next Steps (Q1 2026)
1. **Fix brave-search** - Regenerate API key
2. **Add Supabase MCP** - Direct DB access
3. **Add Twilio MCP** - SMS automation
4. **Custom MCP servers** - Domain-specific tools

### Planned Upgrades
- MCP server health dashboard
- Auto-restart failed servers
- Usage analytics
- Cost tracking per server

### Scaling Vision
- 50+ MCP servers
- Custom servers for each domain
- Self-healing server mesh
- Cross-computer MCP routing

---

## CONNECTIONS STRAND
### Dependencies
| System | Purpose | Status |
|--------|---------|--------|
| Node.js | NPX execution | Active |
| Python | Custom servers | Active |
| Claude CLI | MCP host | Active |

### Consumers (Who Uses MCP)
| Consumer | Servers Used | Frequency |
|----------|--------------|-----------|
| Claude sessions | All | Every query |
| ARAYA | chatgpt | On chat |
| SPINE | trinity_hub | Periodic |
| Automation | github, stripe | On trigger |

### Peer Connections
- **CYCLOTRON_BRAIN** - memory server persists
- **CREDENTIAL_VAULT** - Provides API keys
- **TRINITY_HUB** - trinity_hub MCP server
- **100X_PLATFORM** - stripe, shopify servers

---

## CREDENTIALS STRAND
### API Keys Required
| Server | Key Location | Status |
|--------|--------------|--------|
| github | GITHUB_TOKEN env | Active |
| stripe | .mcp.json inline | Active |
| firecrawl | FIRECRAWL_API_KEY env | Active |
| brave-search | BRAVE_API_KEY env | NEEDS REGEN |
| notion | NOTION_TOKEN env | Active |
| google-maps | GOOGLE_MAPS_API_KEY env | Active |
| slack | .mcp.json inline | Active |
| coinbase | .mcp.json inline | Active |
| openai | .mcp.json inline | Active |
| discord | DISCORD_TOKEN env | Active |
| shopify | .mcp.json inline | Active |

### Quick Commands
```bash
# List MCP servers
claude mcp list

# Check server status
npx -y @modelcontextprotocol/server-github --version

# View config
cat C:/Users/dwrek/.mcp.json
```

---

## EMERGENCY PROCEDURES
### If Server Not Responding
```bash
# Kill Node processes
taskkill /F /IM node.exe

# Restart Claude CLI
claude

# Test specific server
npx -y @modelcontextprotocol/server-github
```

### If API Key Expired
1. Check `.secrets/MASTER_KEYS.json`
2. Update `.mcp.json` or environment variable
3. Restart Claude CLI

### If All Servers Down
```bash
# Check Node.js
node --version

# Clear NPX cache
npx clear-npx-cache

# Restart everything
claude
```

---

**192 TOOLS. INFINITE POSSIBILITIES. MCP IS THE MULTIPLIER.**
