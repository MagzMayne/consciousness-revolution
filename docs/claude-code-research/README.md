# Claude Code Architecture Research

This directory contains **original research documentation** sourced from
[`barbrickdesign/claude-code-enhancedByAgentR`](https://github.com/barbrickdesign/claude-code-enhancedByAgentR),
which contains defensive security research and architectural analysis based on
a publicly-disclosed source map exposure from the Claude Code npm package
(March 31, 2026).

> **Note:** Only the research documentation is included here. The TypeScript
> source snapshot itself is NOT included, as it remains the intellectual
> property of Anthropic.

---

## Documents

| File | Description |
|---|---|
| [`architecture-analysis.md`](architecture-analysis.md) | In-depth walkthrough of every major subsystem: tools, permissions, query engine, bridge, multi-agent, services, memory, plugins, and feature flags |
| [`security-findings.md`](security-findings.md) | Security research observations: bash sandboxing, tree-sitter AST analysis, permission layers, OAuth PKCE, prompt injection mitigations |
| [`codebase-metrics.md`](codebase-metrics.md) | Quantitative metrics: file counts, line counts, dependency inventory, feature flag catalogue |

---

## Research Value for This Repository

The architecture and security findings documented here directly inform the design
of the agent systems in this repository:

- **Bash security layer** (`security-findings.md`) — patterns applicable to
  `ARAYA/5_BACKEND/` and other Python execution contexts
- **Permission system design** — informs `src/claw_agent_harness/permissions.py`
  and the existing `src/security/` modules
- **Multi-agent coordination** (`architecture-analysis.md`) — informs the design
  of `backend/services/agent-registry.js` and `src/agents/`
- **Tool system** — mirrors the architecture implemented in
  `src/claw_agent_harness/tools.py`
- **Feature flag system** — applicable to the Netlify function layer

---

## Responsible Use

All material here is used exclusively for:
- Defensive security research and education
- Understanding architectural patterns for the consciousness-revolution platform
- Improving the security posture of existing agent systems

See [`SECURITY.md`](SECURITY.md) for the responsible use policy and Anthropic
contact information for security disclosures.
