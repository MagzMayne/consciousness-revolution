# Codebase Metrics — Claude Code Source Snapshot

> Quantitative analysis of the March 2026 Claude Code source snapshot obtained via source map exposure.

---

## Summary

| Metric | Value |
|---|---|
| **Total TypeScript files** | 1,884 |
| **Total source directories** | 301 |
| **Total lines of code** | 512,664 |
| **External dependencies** | 129 unique packages |
| **Tool modules** | 42 |
| **Command modules** | ~50 |
| **UI components** | ~140 |
| **React hooks** | 104 files |

---

## Lines of Code by Directory

| Directory | Files | Description |
|---|---|---|
| `src/utils/` | 564 | Utility functions (largest single directory) |
| `src/components/` | 389 | Ink/React UI components |
| `src/commands/` | 189 | Slash command implementations |
| `src/tools/` | 184 | Agent tool implementations |
| `src/services/` | 130 | External service integrations |
| `src/hooks/` | 104 | React hooks |
| `src/bridge/` | 31 | IDE bridge |
| `src/types/` | 11 | TypeScript type definitions |
| `src/screens/` | 3 | Full-screen UI (REPL, Doctor, Resume) |
| `src/coordinator/` | 1 | Multi-agent coordinator |
| `src/state/` | 6 | Application state |

### Directory Line Counts

| Directory | Total Lines |
|---|---|
| `src/utils/` | 180,472 |
| `src/components/` | 81,546 |
| `src/services/` | 53,680 |
| `src/tools/` | 50,828 |
| `src/commands/` | 26,428 |
| `src/hooks/` | ~20,000 (est.) |
| `src/bridge/` | ~8,000 (est.) |

---

## Largest Files

| File | Lines | Notes |
|---|---|---|
| `src/cli/print.ts` | 5,594 | CLI output formatting |
| `src/utils/messages.ts` | 5,512 | Message construction utilities |
| `src/utils/sessionStorage.ts` | 5,105 | Session persistence |
| `src/utils/hooks.ts` | 5,022 | Core React hooks |
| `src/screens/REPL.tsx` | 5,005 | Main REPL screen |
| `src/main.tsx` | 4,683 | CLI entry point |
| `src/utils/bash/bashParser.ts` | 4,436 | Bash command parser |
| `src/utils/attachments.ts` | 3,997 | File attachment handling |
| `src/services/api/claude.ts` | 3,419 | Anthropic API client |
| `src/services/mcp/client.ts` | 3,348 | MCP server client |
| `src/utils/plugins/pluginLoader.ts` | 3,302 | Plugin loader |
| `src/commands/insights.ts` | 3,200 | Analytics/insights command |
| `src/bridge/bridgeMain.ts` | 2,999 | IDE bridge main loop |
| `src/utils/bash/ast.ts` | 2,679 | Tree-sitter AST analysis |
| `src/utils/plugins/marketplaceManager.ts` | 2,643 | Plugin marketplace |
| `src/tools/BashTool/bashPermissions.ts` | 2,621 | Bash permission checks |
| `src/tools/BashTool/bashSecurity.ts` | 2,592 | Bash security checks |
| `src/services/mcp/auth.ts` | 2,465 | MCP OAuth |
| `src/native-ts/yoga-layout/index.ts` | 2,578 | Yoga layout engine |

---

## External Dependencies by Category

129 unique external package paths. Categorized below:

### Anthropic / Internal

| Package | Purpose |
|---|---|
| `@anthropic-ai/sdk` | Main Anthropic API SDK |
| `@anthropic-ai/claude-agent-sdk` | Agent SDK (inter-agent communication) |
| `@anthropic-ai/mcpb` | MCP bridge (internal) |
| `@ant/claude-for-chrome-mcp` | Chrome extension MCP integration |
| `@ant/computer-use-mcp` | Computer Use MCP server |
| `@ant/computer-use-swift` | macOS native computer use binary |

### Terminal UI

| Package | Purpose |
|---|---|
| `react` | UI framework |
| `chalk` | Terminal colors |
| `figures` | Unicode figures for terminals |
| `wrap-ansi` | ANSI string word wrapping |
| `strip-ansi` | Strip ANSI codes |
| `cli-boxes` | Terminal box drawing |
| `asciichart` | ASCII charts |
| `bidi-js` | Bidirectional text support |
| `get-east-asian-width` | CJK character width calculation |
| `emoji-regex` | Emoji detection |

### CLI Framework

| Package | Purpose |
|---|---|
| `@commander-js/extra-typings` | CLI argument parsing |

### Schema / Validation

| Package | Purpose |
|---|---|
| `zod` / `zod/v4` | Schema validation |
| `ajv` | JSON Schema validator |

### Protocols

| Package | Purpose |
|---|---|
| `@modelcontextprotocol/sdk` | MCP client/server |
| `vscode-languageserver-protocol` | LSP types |
| `ws` | WebSocket client |

### Telemetry

| Package | Purpose |
|---|---|
| `@opentelemetry/api` | OpenTelemetry API |
| `@opentelemetry/sdk-trace-base` | Tracing |
| `@opentelemetry/sdk-metrics` | Metrics |
| `@opentelemetry/sdk-logs` | Logs |

### Feature Flags

| Package | Purpose |
|---|---|
| `@growthbook/growthbook` | A/B testing and feature flags |

### Cloud / Auth

| Package | Purpose |
|---|---|
| `@aws-sdk/client-bedrock-runtime` | AWS Bedrock (Claude via AWS) |
| `google-auth-library` | GCP authentication |

### Utilities

| Package | Purpose |
|---|---|
| `lodash-es` | Utility functions (tree-shakeable) |
| `semver` | Version comparison |
| `diff` | Text diff generation |
| `fuse.js` | Fuzzy search |
| `lru-cache` | LRU caching |
| `axios` | HTTP client |
| `execa` | Subprocess execution |
| `chokidar` | File system watching |
| `proper-lockfile` | File locking |
| `p-map` | Parallel async map |
| `ignore` | `.gitignore`-style filtering |
| `shell-quote` | Shell argument quoting |
| `qrcode` | QR code generation |
| `marked` | Markdown parsing |
| `highlight.js` | Syntax highlighting |
| `xss` | XSS sanitization |
| `signal-exit` | Clean process exit |
| `tree-kill` | Kill process trees |
| `https-proxy-agent` | HTTP proxy support |

### Bun-specific

| Package | Purpose |
|---|---|
| `bun:bundle` | Build-time feature flags (code elimination) |

---

## Feature Flag Inventory

Build-time feature flags controlled via `bun:bundle`:

| Flag | Purpose |
|---|---|
| `PROACTIVE` | Proactive mode (autonomous action without prompting) |
| `KAIROS` | Kairos scheduling/trigger system |
| `BRIDGE_MODE` | IDE bridge mode |
| `DAEMON` | Daemon/background service mode |
| `VOICE_MODE` | Voice input |
| `AGENT_TRIGGERS` | Agent trigger system |
| `MONITOR_TOOL` | Monitoring tool |

---

## Snapshot Completeness

The README described this snapshot as ~1,900 files and 512,000+ lines. The actual count is **1,884 files / 512,664 lines**, confirming the snapshot is very complete — within rounding of the stated numbers.

**Snapshot date:** March 31, 2026  
**Language:** TypeScript (strict mode)  
**Runtime target:** Bun  
**UI framework:** React + Ink
