# Architecture Analysis — Claude Code Source Snapshot

> Research notes based on the March 2026 source map exposure. All observations are based on static analysis of the `src/` snapshot.

---

## Table of Contents

1. [High-Level Overview](#high-level-overview)
2. [Entry Point — `main.tsx`](#entry-point--maintsx)
3. [Tool System](#tool-system)
4. [Permission System](#permission-system)
5. [Query Engine](#query-engine)
6. [Command System](#command-system)
7. [Bridge System](#bridge-system)
8. [Multi-Agent Coordination](#multi-agent-coordination)
9. [Service Layer](#service-layer)
10. [State Management](#state-management)
11. [Memory System](#memory-system)
12. [Plugin System](#plugin-system)
13. [Feature Flag System](#feature-flag-system)
14. [External Dependencies](#external-dependencies)

---

## High-Level Overview

Claude Code is an agentic CLI written in TypeScript, targeting the [Bun](https://bun.sh) runtime. Its terminal UI is built with [React](https://react.dev) and [Ink](https://github.com/vadimdemedes/ink). The system follows a loop-based agentic pattern:

```
User Input → Query Engine → LLM API → Tool Calls → Permission Check → Tool Execution → Output
```

The architecture is modular:

- **Tools** do work (bash, file I/O, web, etc.)
- **Commands** handle `/slash-command` user interactions
- **Services** integrate external systems (Anthropic API, MCP servers, LSP, OAuth)
- **Hooks** manage React-based UI state
- **Bridges** connect IDE extensions and remote controllers

---

## Entry Point — `main.tsx`

**File:** `src/main.tsx` (4,683 lines)

The CLI entry point uses [Commander.js](https://github.com/tj/commander.js) for argument parsing. At startup, three side-effects fire before heavy module evaluation:

```typescript
profileCheckpoint('main_tsx_entry')   // startup profiler
startMdmRawRead()                     // MDM policy (macOS plutil / Windows reg query)
startKeychainPrefetch()               // macOS Keychain reads (OAuth + API key)
```

This parallel prefetch pattern reduces boot latency by ~65ms on macOS. The `GrowthBook` feature flag client and Anthropic API preconnect are also initialized before the first user interaction.

After parsing CLI flags, `main.tsx` launches the React/Ink REPL renderer via `launchRepl()` in `src/replLauncher.tsx`.

---

## Tool System

**Directory:** `src/tools/` (42 tool modules)

Every capability Claude can invoke is a self-contained tool module. Each tool implements:

- **Input schema** — Zod v4 schema defining the tool's parameters
- **Permission model** — whether the tool requires user approval
- **Execute function** — the actual implementation

### Tool Interface (`src/Tool.ts`, 792 lines)

```typescript
interface Tool<TInput, TOutput> {
  name: string
  description: string
  inputSchema: ToolInputJSONSchema
  execute(input: TInput, context: ToolUseContext): Promise<TOutput>
  isPermissionRequired(input: TInput, context: ToolPermissionContext): PermissionResult
}
```

### Tool Inventory

| Tool | Key File | Description |
|---|---|---|
| `BashTool` | `BashTool/` | Shell command execution with sandboxing |
| `FileReadTool` | `FileReadTool/` | File reading (text, images, PDFs, notebooks) |
| `FileWriteTool` | `FileWriteTool/` | File creation and overwrite |
| `FileEditTool` | `FileEditTool/` | Partial file modification (string replacement) |
| `GlobTool` | `GlobTool/` | File pattern matching |
| `GrepTool` | `GrepTool/` | ripgrep-powered content search |
| `WebFetchTool` | `WebFetchTool/` | HTTP content fetching |
| `WebSearchTool` | `WebSearchTool/` | Web search |
| `AgentTool` | `AgentTool/` | Sub-agent spawning |
| `SkillTool` | `SkillTool/` | Reusable skill execution |
| `MCPTool` | `MCPTool/` | MCP server tool invocation |
| `LSPTool` | `LSPTool/` | Language Server Protocol integration |
| `NotebookEditTool` | `NotebookEditTool/` | Jupyter notebook editing |
| `TaskCreateTool` | `TaskCreateTool/` | Task creation |
| `TaskUpdateTool` | `TaskUpdateTool/` | Task state update |
| `TaskGetTool` | `TaskGetTool/` | Task retrieval |
| `TaskListTool` | `TaskListTool/` | Task listing |
| `TaskOutputTool` | `TaskOutputTool/` | Task output streaming |
| `TaskStopTool` | `TaskStopTool/` | Task cancellation |
| `SendMessageTool` | `SendMessageTool/` | Inter-agent messaging |
| `TeamCreateTool` | `TeamCreateTool/` | Team agent management |
| `TeamDeleteTool` | `TeamDeleteTool/` | Team agent teardown |
| `EnterPlanModeTool` | `EnterPlanModeTool/` | Plan mode activation |
| `ExitPlanModeTool` | `ExitPlanModeTool/` | Plan mode deactivation |
| `EnterWorktreeTool` | `EnterWorktreeTool/` | Git worktree isolation |
| `ExitWorktreeTool` | `ExitWorktreeTool/` | Git worktree cleanup |
| `ToolSearchTool` | `ToolSearchTool/` | Deferred tool discovery |
| `ScheduleCronTool` | `ScheduleCronTool/` | Scheduled trigger creation |
| `RemoteTriggerTool` | `RemoteTriggerTool/` | Remote trigger handling |
| `SleepTool` | `SleepTool/` | Proactive mode wait |
| `SyntheticOutputTool` | `SyntheticOutputTool/` | Structured output generation |
| `AskUserQuestionTool` | `AskUserQuestionTool/` | Elicitation dialogs |
| `BriefTool` | `BriefTool/` | Context briefing |
| `ConfigTool` | `ConfigTool/` | Runtime config mutations |
| `PowerShellTool` | `PowerShellTool/` | PowerShell execution (Windows) |
| `REPLTool` | `REPLTool/` | Interactive REPL sessions |
| `ReadMcpResourceTool` | `ReadMcpResourceTool/` | MCP resource reading |
| `ListMcpResourcesTool` | `ListMcpResourcesTool/` | MCP resource listing |
| `McpAuthTool` | `McpAuthTool/` | MCP server authentication |
| `TodoWriteTool` | `TodoWriteTool/` | Todo list management |

---

## Permission System

**Directory:** `src/hooks/toolPermission/`, `src/utils/permissions/`

Permissions are evaluated on every tool invocation through a multi-layer check:

1. **`PermissionMode`** — The current mode determines the baseline behavior:
   - `default` — interactive prompts
   - `plan` — read-only, no execution
   - `bypassPermissions` — skip all prompts (CI/enterprise)
   - `auto` — autonomous execution with policy limits

2. **`bashClassifier.ts`** — Bash commands are analysed against user-defined `allow`/`deny`/`ask` rules. Uses a tree-sitter AST parser (`src/utils/bash/ast.ts`) for semantic analysis — not just regex matching.

3. **Denial Tracking** (`src/utils/permissions/denialTracking.ts`) — Tracks denied operations per session to inform future decisions and generate appropriate explanations.

4. **`PermissionRule` / `PermissionUpdate`** — User-configured rules are stored as structured `PermissionRule` objects and evaluated against each tool invocation.

### Permission Decision Flow

```
Tool invocation
  → isPermissionRequired(input, context)
    → PermissionMode check
    → bashClassifier (for BashTool)
    → User rule matching
    → PolicyLimits (organization policies)
  → if required: show permission dialog
  → user approves / denies / always-allows
  → tool executes or is blocked
```

---

## Query Engine

**File:** `src/QueryEngine.ts` (1,295 lines visible; full internal version is larger)

The core LLM interaction engine. Handles:

- **Streaming** — Uses the Anthropic SDK's streaming API
- **Tool call loop** — Processes `tool_use` blocks and re-enters the loop with results
- **Thinking mode** — Extended thinking via `thinking` content blocks
- **Token accounting** — Tracks usage per turn and accumulates totals
- **Retry logic** — Retries transient API errors with exponential back-off
- **Compact boundaries** — Handles context compression signals (`SDKCompactBoundaryMessage`)
- **Synthetic output** — Special handling for `SyntheticOutputTool` to produce structured responses

The `query.ts` module (`src/query.ts`) wraps the raw API call and adds observability instrumentation.

---

## Command System

**Files:** `src/commands.ts` (754 lines), `src/commands/` (~50 commands)

Slash commands are registered in `commands.ts` and dispatched when the user types `/command-name`. Each command is an object with:

```typescript
interface Command {
  name: string
  description: string
  execute(args: string[], context: CommandContext): Promise<void>
}
```

Notable commands include:

| Command | File | Notes |
|---|---|---|
| `/commit` | `commit.ts` | Creates a git commit via BashTool |
| `/compact` | `compact/` | Compresses conversation context |
| `/mcp` | `mcp` | Manages MCP server connections |
| `/memory` | (memdir) | Persistent memory management |
| `/skills` | (skills) | Skill management |
| `/doctor` | `doctor/` | Runs environment diagnostics |
| `/insights` | `insights.ts` | Advanced analytics and reporting (3,200 lines) |

---

## Bridge System

**Directory:** `src/bridge/`

A bidirectional IPC layer connecting IDE extensions to the CLI process:

- **`bridgeMain.ts`** (2,999 lines) — Main bridge loop, handles incoming IDE messages
- **`bridgeMessaging.ts`** — Message protocol definitions
- **`bridgePermissionCallbacks.ts`** — Pipes permission prompts to the IDE UI
- **`replBridge.ts`** — Bridges the REPL session to IDE-owned renderers
- **`jwtUtils.ts`** — JWT-based authentication for bridge connections
- **`sessionRunner.ts`** — Manages sessions triggered from IDE

IDEs (VS Code, JetBrains) connect via a local socket. The bridge authenticates using a session JWT and forwards messages bidirectionally.

---

## Multi-Agent Coordination

**Directories:** `src/coordinator/`, `src/tools/AgentTool/`, `src/tools/TeamCreateTool/`, `src/tasks/`

Claude Code supports spawning sub-agents and teams:

1. **`AgentTool`** — Spawns a single sub-agent with its own context window, system prompt, and tool set. The parent agent receives the result when the sub-agent completes.

2. **`TeamCreateTool` / `TeamDeleteTool`** — Creates a named team of agents that work in parallel. Teams have a shared mailbox for inter-agent communication via `SendMessageTool`.

3. **`coordinator/coordinatorMode.ts`** — Manages the multi-agent mode state, including swarm initialization (`src/hooks/useSwarmInitialization.ts`).

4. **Task System** (`src/tasks/`) — Structured task management with creation, listing, status updates, and output streaming. Tasks persist across sessions.

---

## Service Layer

**Directory:** `src/services/`

| Service | Description |
|---|---|
| `api/claude.ts` (3,419 lines) | Anthropic API client, rate limiting, usage tracking |
| `api/bootstrap.ts` | Bootstrap data prefetch for fast startup |
| `api/filesApi.ts` | File upload/download API |
| `mcp/client.ts` (3,348 lines) | MCP server connection management |
| `mcp/auth.ts` (2,465 lines) | MCP OAuth and authentication |
| `oauth/` | OAuth 2.0 + PKCE authentication flow |
| `lsp/` | Language Server Protocol manager |
| `analytics/growthbook.ts` | GrowthBook feature flag client |
| `compact/` | Conversation context compression |
| `policyLimits/` | Organization policy enforcement |
| `remoteManagedSettings/` | MDM/remote settings |
| `extractMemories/` | Automatic memory extraction from conversations |
| `teamMemorySync/` | Team memory synchronization |

### OAuth Flow (`src/services/oauth/`)

Implements RFC 7636 (PKCE) OAuth 2.0:

1. Generates PKCE code verifier + challenge
2. Launches browser to Anthropic's auth endpoint
3. Starts a local HTTP listener on a random port for the redirect
4. Supports both automatic (browser redirect) and manual (copy-paste code) flows
5. Exchanges authorization code for tokens
6. Fetches profile info (subscription type, rate-limit tier)

---

## State Management

**Directory:** `src/state/`

Application state is managed through React context and custom hooks. The central state object is `AppState` (`src/state/AppState.ts`), which contains:

- Current conversation messages
- Permission mode
- Active tools and MCP connections
- UI state (vim mode, sidebar, etc.)
- Session metadata

State updates flow through React's rendering cycle via hooks in `src/hooks/`.

---

## Memory System

**Directory:** `src/memdir/`

Claude Code implements persistent memory across sessions:

- **`memdir.ts`** — Core memory directory operations (read/write/delete)
- **`paths.ts`** — Memory file paths (global and per-project)
- **`findRelevantMemories.ts`** — Semantic search over stored memories
- **`memoryScan.ts`** — Scans for relevant memories at session start
- **`memoryTypes.ts`** — Type definitions for memory entries

Memories are stored as structured Markdown files. The `extractMemories/` service can automatically extract and store memorable facts from conversations.

---

## Plugin System

**Directories:** `src/plugins/`, `src/services/plugins/`, `src/utils/plugins/`

- **`pluginLoader.ts`** (3,302 lines) — Loads built-in and third-party plugins
- **`marketplaceManager.ts`** (2,643 lines) — Manages the official plugin marketplace
- Plugins can extend commands, tools, and UI components

---

## Feature Flag System

**Files:** `src/services/analytics/growthbook.ts`, `bun:bundle` feature flags

Two-layer feature flag system:

1. **Build-time flags** (`bun:bundle`) — Dead code is stripped at build time:
   ```typescript
   import { feature } from 'bun:bundle'
   const voiceCommand = feature('VOICE_MODE') ? require('./voice').default : null
   ```
   Notable flags: `PROACTIVE`, `KAIROS`, `BRIDGE_MODE`, `DAEMON`, `VOICE_MODE`, `AGENT_TRIGGERS`, `MONITOR_TOOL`

2. **Runtime flags** (`GrowthBook`) — A/B testing and gradual rollout of features. Evaluated via `getFeatureValue_CACHED_MAY_BE_STALE()`.

---

## External Dependencies

The snapshot references 129 unique external packages, including:

| Category | Key Packages |
|---|---|
| Anthropic | `@anthropic-ai/sdk`, `@anthropic-ai/claude-agent-sdk`, `@anthropic-ai/mcpb` |
| Internal | `@ant/claude-for-chrome-mcp`, `@ant/computer-use-mcp`, `@ant/computer-use-swift` |
| Terminal UI | `react`, `chalk`, `ink` (via `src/ink/`) |
| CLI | `@commander-js/extra-typings` |
| Schema | `zod`, `zod/v4`, `ajv` |
| Protocols | `@modelcontextprotocol/sdk`, `vscode-languageserver-protocol` |
| Telemetry | `@opentelemetry/api`, `@opentelemetry/sdk-trace-base`, `@opentelemetry/sdk-metrics` |
| Feature Flags | `@growthbook/growthbook` |
| Auth | `google-auth-library` (GCP), `@aws-sdk/client-bedrock-runtime` |
| Utilities | `lodash-es`, `semver`, `diff`, `fuse.js`, `lru-cache`, `axios`, `ws` |
| Bun-specific | `bun:bundle` (build-time feature flags) |

The presence of `@ant/computer-use-swift` and `@ant/computer-use-mcp` indicates macOS-native computer use capabilities (screen capture, accessibility API) compiled to a Swift binary.
