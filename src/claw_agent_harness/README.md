# Claw Agent Harness

A Python agent harness framework integrated from
[`barbrickdesign/claw-code-enhancedByAgentR`](https://github.com/barbrickdesign/claw-code-enhancedByAgentR)
(enhanced by Agent R).

This is a clean-room Python rewrite that captures the architectural patterns of a modern
AI agent harness — tool/command routing, permission gating, session management, and
plugin/skill systems — without copying any proprietary source.

---

## Quick Start

```bash
# From the repo root
python3 -m src.claw_agent_harness.main summary
python3 -m src.claw_agent_harness.main manifest
python3 -m src.claw_agent_harness.main commands --limit 10
python3 -m src.claw_agent_harness.main tools --limit 10
python3 -m src.claw_agent_harness.main route "review MCP tool" --limit 5
python3 -m src.claw_agent_harness.main bootstrap "review MCP tool"
python3 -m src.claw_agent_harness.main repl-banner
python3 -m src.claw_agent_harness.main skills
python3 -m src.claw_agent_harness.main plugins
```

---

## Key Modules

| Module | Description |
|---|---|
| `main.py` | CLI entrypoint (argparse-based) |
| `models.py` | Shared dataclasses (Subsystem, PortingModule, UsageSummary) |
| `tools.py` | Tool registry with permission filtering |
| `commands.py` | Command registry with plugin/skill filtering |
| `permissions.py` | `ToolPermissionContext` — deny-name + deny-prefix gating |
| `query_engine.py` | Turn-based query engine with streaming support |
| `runtime.py` | `PortRuntime` — bootstrap sessions, route prompts |
| `session_store.py` | Persistent session storage (JSON files) |
| `transcript.py` | `TranscriptStore` — message history and flush |
| `tool_runners.py` | Real tool runners: bash, file I/O, grep, glob |
| `repl.py` | `REPLSession` — interactive REPL with slash commands |
| `replLauncher.py` | REPL banner and launch utilities |
| `plugins/loader.py` | Dynamic plugin discovery and registry |
| `skills/runner.py` | Skill registry with built-in skills |
| `bootstrap_graph.py` | Bootstrap/startup graph stages |
| `command_graph.py` | Command graph segmentation |
| `execution_registry.py` | Unified command + tool execution registry |
| `ink.py` | Terminal output formatting (panels, tables, colour) |
| `port_manifest.py` | Workspace manifest generation |
| `parity_audit.py` | Archive parity audit tooling |

---

## Running Tests

```bash
# From the repo root
python3 -m unittest tests/test_porting_workspace.py tests/test_enhancements.py -v
```

72 tests covering: CLI subcommands, tool runners, plugin loader, skill runner,
REPL session, routing, bootstrap graph, session persistence, remote modes, and more.

---

## Architecture

The harness follows a loop-based agentic pattern:

```
User Input → Route Prompt → Match Commands/Tools → Permission Check → Execute → Output
```

Sub-systems:
- **Tools** — 42 tool modules (bash, file I/O, web, agents, tasks, etc.)
- **Commands** — 50+ slash commands
- **Plugins** — dynamically discovered Python plugins
- **Skills** — reusable skill definitions with step tracking
- **Sessions** — persistent JSON-backed session store
- **REPL** — interactive session with `/help`, `/route`, `/cmd`, `/tool`, `/bash`

---

## Python API

```python
from src.claw_agent_harness import PortRuntime, QueryEnginePort, REPLSession

# Route a prompt
matches = PortRuntime().route_prompt("review MCP tool", limit=5)

# Run a bootstrap session
session = PortRuntime().bootstrap_session("fix the failing test", limit=5)
print(session.turn_result.output)

# Interactive REPL
repl = REPLSession()
response = repl.handle_line("/route bash file read")

# Query engine
engine = QueryEnginePort.from_workspace()
result = engine.submit_message("list all tools", matched_tools=("BashTool",))
print(result.output)
```
