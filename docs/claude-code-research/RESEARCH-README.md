# Claude Code Source Snapshot for Security Research

> This repository mirrors a **publicly exposed Claude Code source snapshot** that became accessible on **March 31, 2026** through a source map exposure in the npm distribution. It is maintained for **educational, defensive security research, and software supply-chain analysis**.

---

## Research Context

This repository is maintained by a **university student** studying:

- software supply-chain exposure and build artifact leaks
- secure software engineering practices
- agentic developer tooling architecture
- defensive analysis of real-world CLI systems

This archive is intended to support:

- educational study
- security research practice
- architecture review
- discussion of packaging and release-process failures

It does **not** claim ownership of the original code, and it should not be interpreted as an official Anthropic repository.

---

## How the Public Snapshot Became Accessible

[Chaofan Shou (@Fried_rice)](https://x.com/Fried_rice) publicly noted that Claude Code source material was reachable through a `.map` file exposed in the npm package:

> **"Claude code source code has been leaked via a map file in their npm registry!"**
>
> — [@Fried_rice, March 31, 2026](https://x.com/Fried_rice/status/2038894956459290963)

The published source map referenced unobfuscated TypeScript sources hosted in Anthropic's R2 storage bucket, which made the `src/` snapshot publicly downloadable.

---

## Repository Scope

Claude Code is Anthropic's CLI for interacting with Claude from the terminal to perform software engineering tasks such as editing files, running commands, searching codebases, and coordinating workflows.

This repository contains a mirrored `src/` snapshot for research and analysis.

- **Public exposure identified on**: 2026-03-31
- **Language**: TypeScript (strict mode)
- **Runtime**: Bun
- **Terminal UI**: React + [Ink](https://github.com/vadimdemedes/ink)
- **Scale**: 1,884 files · 512,664 lines of code · 129 external dependencies

---

## Research Documents

| Document | Description |
|---|---|
| [`docs/architecture-analysis.md`](docs/architecture-analysis.md) | In-depth walkthrough of every major subsystem: tools, permissions, query engine, bridge, multi-agent, services, memory, plugins, and feature flags |
| [`docs/security-findings.md`](docs/security-findings.md) | Security research observations: bash sandboxing, tree-sitter AST analysis, permission layers, OAuth PKCE, prompt injection mitigations |
| [`docs/codebase-metrics.md`](docs/codebase-metrics.md) | Quantitative metrics: file counts, line counts, dependency inventory, feature flag catalogue |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | How to contribute research, analysis, and documentation |
| [`SECURITY.md`](SECURITY.md) | Responsible use policy and Anthropic contact for security disclosures |

---

## Directory Structure

```text
src/
├── main.tsx                 # Entrypoint orchestration (Commander.js-based CLI path)
├── commands.ts              # Command registry
├── tools.ts                 # Tool registry
├── Tool.ts                  # Tool type definitions
├── QueryEngine.ts           # LLM query engine
├── context.ts               # System/user context collection
├── cost-tracker.ts          # Token cost tracking
│
├── commands/                # Slash command implementations (~50)
├── tools/                   # Agent tool implementations (42 tools)
├── components/              # Ink UI components (~140)
├── hooks/                   # React hooks (104 files)
├── services/                # External service integrations
├── screens/                 # Full-screen UIs (Doctor, REPL, Resume)
├── types/                   # TypeScript type definitions
├── utils/                   # Utility functions (564 files — largest directory)
│
├── bridge/                  # IDE and remote-control bridge
├── coordinator/             # Multi-agent coordinator
├── plugins/                 # Plugin system
├── skills/                  # Skill system
├── keybindings/             # Keybinding configuration
├── vim/                     # Vim mode
├── voice/                   # Voice input
├── remote/                  # Remote sessions
├── server/                  # Server mode
├── memdir/                  # Persistent memory directory
├── tasks/                   # Task management
├── state/                   # State management
├── migrations/              # Config migrations
├── schemas/                 # Config schemas (Zod)
├── entrypoints/             # Initialization logic
├── ink/                     # Ink renderer wrapper
├── buddy/                   # Companion sprite
├── native-ts/               # Native TypeScript utilities
├── outputStyles/            # Output styling
├── query/                   # Query pipeline
└── upstreamproxy/           # Proxy configuration
```

---

## Architecture Summary

### 1. Tool System (`src/tools/`)

Every tool Claude Code can invoke is implemented as a self-contained module. Each tool defines its input schema, permission model, and execution logic.

| Tool | Description |
|---|---|
| `BashTool` | Shell command execution with tree-sitter AST sandboxing |
| `FileReadTool` | File reading (images, PDFs, notebooks) |
| `FileWriteTool` | File creation / overwrite |
| `FileEditTool` | Partial file modification (string replacement) |
| `GlobTool` | File pattern matching search |
| `GrepTool` | ripgrep-based content search |
| `WebFetchTool` | Fetch URL content |
| `WebSearchTool` | Web search |
| `AgentTool` | Sub-agent spawning |
| `SkillTool` | Skill execution |
| `MCPTool` | MCP server tool invocation |
| `LSPTool` | Language Server Protocol integration |
| `NotebookEditTool` | Jupyter notebook editing |
| `TaskCreateTool` / `TaskUpdateTool` | Task creation and management |
| `SendMessageTool` | Inter-agent messaging |
| `TeamCreateTool` / `TeamDeleteTool` | Team agent management |
| `EnterPlanModeTool` / `ExitPlanModeTool` | Plan mode toggle |
| `EnterWorktreeTool` / `ExitWorktreeTool` | Git worktree isolation |
| `ToolSearchTool` | Deferred tool discovery |
| `ScheduleCronTool` | Scheduled trigger creation |
| `RemoteTriggerTool` | Remote trigger |
| `SleepTool` | Proactive mode wait |
| `SyntheticOutputTool` | Structured output generation |
| `AskUserQuestionTool` | Interactive elicitation dialogs |
| `PowerShellTool` | PowerShell execution (Windows) |
| `TodoWriteTool` | Todo list management |

### 2. Command System (`src/commands/`)

User-facing slash commands invoked with `/` prefix.

| Command | Description |
|---|---|
| `/commit` | Create a git commit |
| `/review` | Code review |
| `/compact` | Context compression |
| `/mcp` | MCP server management |
| `/config` | Settings management |
| `/doctor` | Environment diagnostics |
| `/login` / `/logout` | Authentication |
| `/memory` | Persistent memory management |
| `/skills` | Skill management |
| `/tasks` | Task management |
| `/vim` | Vim mode toggle |
| `/diff` | View changes |
| `/cost` | Check usage cost |
| `/theme` | Change theme |
| `/context` | Context visualization |
| `/pr_comments` | View PR comments |
| `/resume` | Restore previous session |
| `/share` | Share session |
| `/desktop` | Desktop app handoff |
| `/mobile` | Mobile app handoff |
| `/insights` | Analytics and reporting |

### 3. Service Layer (`src/services/`)

| Service | Description |
|---|---|
| `api/` | Anthropic API client, file API, bootstrap |
| `mcp/` | Model Context Protocol server connection and management |
| `oauth/` | OAuth 2.0 + PKCE authentication flow |
| `lsp/` | Language Server Protocol manager |
| `analytics/` | GrowthBook-based feature flags and analytics |
| `plugins/` | Plugin loader |
| `compact/` | Conversation context compression |
| `policyLimits/` | Organization policy limits |
| `remoteManagedSettings/` | Remote managed settings |
| `extractMemories/` | Automatic memory extraction |
| `tokenEstimation.ts` | Token count estimation |
| `teamMemorySync/` | Team memory synchronization |

### 4. Bridge System (`src/bridge/`)

A bidirectional communication layer connecting IDE extensions (VS Code, JetBrains) with the Claude Code CLI.

- `bridgeMain.ts` — Bridge main loop (2,999 lines)
- `bridgeMessaging.ts` — Message protocol
- `bridgePermissionCallbacks.ts` — Permission callbacks
- `replBridge.ts` — REPL session bridge
- `jwtUtils.ts` — JWT-based authentication
- `sessionRunner.ts` — Session execution management

### 5. Permission System (`src/hooks/toolPermission/`, `src/utils/permissions/`)

Checks permissions on every tool invocation. Either prompts the user for approval/denial or automatically resolves based on the configured permission mode (`default`, `plan`, `bypassPermissions`, `auto`, etc.).

A [tree-sitter](https://tree-sitter.github.io/tree-sitter/) AST parser (`src/utils/bash/ast.ts`) is used for semantic bash command analysis — fail-closed design means any unrecognised shell construct escalates to a user dialog.

See [`docs/security-findings.md`](docs/security-findings.md) for detailed analysis.

### 6. Feature Flags

Dead code elimination via Bun's `bun:bundle` feature flags:

```typescript
import { feature } from 'bun:bundle'

// Inactive code is completely stripped at build time
const voiceCommand = feature('VOICE_MODE')
  ? require('./commands/voice/index.js').default
  : null
```

Notable flags: `PROACTIVE`, `KAIROS`, `BRIDGE_MODE`, `DAEMON`, `VOICE_MODE`, `AGENT_TRIGGERS`, `MONITOR_TOOL`

---

## Key Files in Detail

### `src/main.tsx` (4,683 lines)

Commander.js-based CLI parser and React/Ink renderer initialization. At startup, it overlaps MDM settings, keychain prefetch, and GrowthBook initialization for faster boot via parallel side-effects fired before heavy module evaluation.

### `src/QueryEngine.ts` (1,295+ lines)

The core engine for LLM API calls. Handles streaming responses, tool-call loops, thinking mode, retry logic, and token counting.

### `src/Tool.ts` (792 lines)

Defines base types and interfaces for all tools — input schemas, permission models, and progress state types.

### `src/commands.ts` (754 lines)

Manages registration and execution of all slash commands. Uses conditional imports to load different command sets per environment.

### `src/cli/print.ts` (5,594 lines)

CLI output formatting — the largest file in the codebase.

### `src/utils/messages.ts` (5,512 lines)

Message construction and manipulation utilities.

---

## Tech Stack

| Category | Technology |
|---|---|
| Runtime | [Bun](https://bun.sh) |
| Language | TypeScript (strict) |
| Terminal UI | [React](https://react.dev) + [Ink](https://github.com/vadimdemedes/ink) |
| CLI Parsing | [Commander.js](https://github.com/tj/commander.js) (extra-typings) |
| Schema Validation | [Zod v4](https://zod.dev) |
| Code Search | [ripgrep](https://github.com/BurntSushi/ripgrep) |
| Shell Analysis | [tree-sitter](https://tree-sitter.github.io/tree-sitter/) |
| Protocols | [MCP SDK](https://modelcontextprotocol.io), LSP |
| API | [Anthropic SDK](https://docs.anthropic.com) |
| Telemetry | OpenTelemetry + gRPC |
| Feature Flags | GrowthBook |
| Auth | OAuth 2.0 + PKCE, JWT, macOS Keychain |
| Cloud Providers | AWS Bedrock, GCP Vertex AI |

---

## Notable Design Patterns

### Parallel Prefetch

Startup time is optimized by prefetching MDM settings, keychain reads, and API preconnect in parallel before heavy module evaluation begins.

```typescript
// main.tsx — fired as side-effects before other imports
startMdmRawRead()
startKeychainPrefetch()
```

### Lazy Loading

Heavy modules (OpenTelemetry, gRPC, analytics, and some feature-gated subsystems) are deferred via dynamic `import()` until actually needed.

### Agent Swarms

Sub-agents are spawned via `AgentTool`, with `coordinator/` handling multi-agent orchestration. `TeamCreateTool` enables team-level parallel work.

### Skill System

Reusable workflows defined in `skills/` are executed through `SkillTool`. Users can add custom skills.

### Plugin Architecture

Built-in and third-party plugins are loaded through the `plugins/` subsystem, with a marketplace manager for discovery.

### Fail-Closed Security

The bash security layer uses tree-sitter AST analysis with an explicit allowlist. Any unrecognised shell construct is classified as `too-complex` and escalates to a user permission dialog — never silently allowed.

---

## Research / Ownership Disclaimer

- This repository is an **educational and defensive security research archive** maintained by a university student.
- It exists to study source exposure, packaging failures, and the architecture of modern agentic CLI systems.
- The original Claude Code source remains the property of **Anthropic**.
- This repository is **not affiliated with, endorsed by, or maintained by Anthropic**.
- If you find security issues in Anthropic's products, report them to [security@anthropic.com](mailto:security@anthropic.com).
