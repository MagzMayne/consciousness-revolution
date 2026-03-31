# Security Findings — Claude Code Source Snapshot

> Static analysis observations from the March 2026 source map exposure. These notes document how Claude Code defends against prompt injection, command injection, and other security threats. They are published for educational and defensive research purposes.

---

## Table of Contents

1. [Bash Command Security Layer](#bash-command-security-layer)
2. [Tree-Sitter AST Analysis](#tree-sitter-ast-analysis)
3. [Permission System Design](#permission-system-design)
4. [OAuth 2.0 + PKCE Implementation](#oauth-20--pkce-implementation)
5. [Prompt Injection Mitigations](#prompt-injection-mitigations)
6. [XSS and Output Safety](#xss-and-output-safety)
7. [Network Security](#network-security)
8. [Interesting Security Patterns](#interesting-security-patterns)
9. [Limitations and Observations](#limitations-and-observations)

---

## Bash Command Security Layer

**Files:** `src/tools/BashTool/bashSecurity.ts` (2,592 lines), `src/tools/BashTool/bashPermissions.ts` (2,621 lines)

The `BashTool` applies a multi-layer security analysis before executing any shell command.

### Shell Metacharacter Blocking

Commands are scanned against an explicit list of dangerous patterns before execution. Key blocked constructs include:

| Pattern | Reason |
|---|---|
| `$()` | Command substitution — can bypass permission rules by wrapping a blocked command |
| `${}` | Parameter substitution — potential injection vector |
| `<()` / `>()` | Process substitution — spawns subprocesses invisibly |
| `=cmd` (Zsh) | Zsh equals expansion: `=curl` expands to `/usr/bin/curl`, bypassing `Bash(curl:*)` deny rules |
| `` `cmd` `` | Backtick command substitution |
| `<<` inside `$()` | Here-document inside command substitution — complex nesting exploits |
| `<#` | PowerShell comment syntax (defense-in-depth) |

### Zsh-Specific Dangerous Commands

A hardcoded blocklist (`ZSH_DANGEROUS_COMMANDS`) prevents Zsh module-based attacks:

| Command | Attack Vector |
|---|---|
| `zmodload` | Gateway to all Zsh module attacks |
| `emulate` | Eval-equivalent; executes arbitrary code |
| `zpty` | Pseudo-terminal execution (bypasses binary checks) |
| `ztcp` | TCP exfiltration via `zsh/net/tcp` |
| `sysopen/syswrite` | File I/O via `zsh/system` bypassing binary deny rules |
| `zf_rm/zf_mv/zf_ln` | Builtin filesystem operations bypassing binary-level restrictions |

### Numeric Security Check IDs

Rather than logging command strings (which could leak user data), security checks are identified by numeric IDs:

```typescript
const BASH_SECURITY_CHECK_IDS = {
  INCOMPLETE_COMMANDS: 1,
  JQ_SYSTEM_FUNCTION: 2,
  OBFUSCATED_FLAGS: 4,
  DANGEROUS_PATTERNS_COMMAND_SUBSTITUTION: 8,
  IFS_INJECTION: 11,
  MALFORMED_TOKEN_INJECTION: 14,
  CONTROL_CHARACTERS: 17,
  UNICODE_WHITESPACE: 18,
  // ... 23 total checks
}
```

Notable checks:
- **`IFS_INJECTION` (11)** — Detects `IFS` variable manipulation that could reinterpret word boundaries
- **`MALFORMED_TOKEN_INJECTION` (14)** — Detects deliberately malformed shell tokens designed to confuse parsers
- **`UNICODE_WHITESPACE` (18)** — Catches Unicode whitespace characters used to hide commands
- **`COMMENT_QUOTE_DESYNC` (22)** — Detects quote/comment desynchronization attacks
- **`QUOTED_NEWLINE` (23)** — Detects newlines embedded in quoted strings

---

## Tree-Sitter AST Analysis

**File:** `src/utils/bash/ast.ts` (2,679 lines)

A key security design decision: rather than using regex-based command parsing, Claude Code uses [tree-sitter](https://tree-sitter.github.io/tree-sitter/) to build a proper AST of bash commands.

### Fail-Closed Design

The AST parser is explicitly **fail-closed**:

> "Any node type not in the allowlist causes the entire command to be classified as `too-complex`, which means it goes through the normal permission prompt flow."

This means unknown shell constructs are never silently allowed — they escalate to a user permission dialog.

### Result Types

```typescript
type ParseForSecurityResult =
  | { kind: 'simple'; commands: SimpleCommand[] }      // parseable, can apply rules
  | { kind: 'too-complex'; reason: string }            // escalate to user
  | { kind: 'parse-unavailable' }                      // tree-sitter not loaded
```

### What the AST Extracts

For each simple command, the AST produces:
- **`argv[]`** — Fully resolved argument vector (quotes stripped, no substitution)
- **`envVars`** — Leading `VAR=val` assignments
- **`redirects`** — I/O redirections with operator and target

This structured argv is what gets matched against permission rules (`Bash(cmd:*)`, `Bash(path:*)`, etc.).

---

## Permission System Design

**Directory:** `src/utils/permissions/`

### Layered Permission Modes

| Mode | Behavior |
|---|---|
| `default` | Interactive — prompts user for approval |
| `plan` | Read-only — no tool execution allowed |
| `bypassPermissions` | Bypass all prompts (CI/enterprise managed) |
| `auto` | Autonomous with policy limits |

### Rule Matching

User-configured rules take the form:

```
Bash(curl:*) → allow
Bash(rm -rf:*) → deny
FileEdit(/etc/*) → ask
```

Rules are stored as structured `PermissionRule` objects in `src/utils/permissions/PermissionRule.ts` and matched against the tree-sitter-derived argv.

### Denial Tracking

`denialTracking.ts` tracks denied operations per session. This enables:
- Coherent explanations ("You previously denied this")
- Prevention of repeated identical prompts

### Shadow Rule Detection

`shadowedRuleDetection.ts` detects when a new permission rule would be shadowed by an existing broader rule — preventing accidental policy gaps.

### Bypass Killswitch

`bypassPermissionsKillswitch.ts` provides an emergency kill switch that can re-enable permission prompts even in `bypassPermissions` mode, used by organizational policy enforcement.

---

## OAuth 2.0 + PKCE Implementation

**File:** `src/services/oauth/index.ts`

Implements RFC 7636 PKCE correctly:

1. Generates a cryptographically random `code_verifier`
2. Computes `code_challenge = BASE64URL(SHA256(code_verifier))`
3. Sends `code_challenge` in the authorization request
4. Sends `code_verifier` in the token exchange request

Both automatic (browser redirect to `localhost`) and manual (copy-paste) flows are supported for environments without a browser.

State parameter is validated to prevent CSRF on the OAuth callback.

---

## Prompt Injection Mitigations

Based on static analysis, Claude Code employs several anti-prompt-injection strategies:

1. **Tool input schemas** — Zod-validated schemas constrain what values tools accept, making it harder to inject unexpected structure
2. **Bash security layer** — Commands generated by the model are checked before execution
3. **Permission dialogs** — Suspicious or unanticipated commands surface to the user
4. **Web fetch sanitization** — `xss` package is in the dependency list, suggesting fetched HTML/text is sanitized before display
5. **`cyberRiskInstruction.ts`** (`src/constants/cyberRiskInstruction.ts`) — A dedicated system prompt section explicitly instructs the model to resist prompt injection from external content

---

## XSS and Output Safety

The `xss` npm package is imported in the dependency graph, indicating that user-facing content rendered from external sources (web fetch results, MCP tool outputs) is sanitized before display.

The `ansiToPng.ts` and `ansiToSvg.ts` utilities (`src/utils/`) convert ANSI-colored terminal output to image formats for sharing, avoiding direct injection of escape sequences into external formats.

---

## Network Security

- **`upstreamproxy/`** — Handles HTTP proxy configuration for enterprise environments
- **HTTPS enforced** — All Anthropic API calls use the official SDK which enforces TLS
- **MCP authentication** (`src/services/mcp/auth.ts`, 2,465 lines) — Comprehensive OAuth flow for MCP server authentication
- **JWT bridge authentication** (`src/bridge/jwtUtils.ts`) — Local IDE bridge connections are authenticated with JWTs
- **`https-proxy-agent`** — Proxy support for corporate networks

---

## Interesting Security Patterns

### `dangerousPatterns.ts`

`src/utils/permissions/dangerousPatterns.ts` contains patterns used across multiple permission checks. Centralizing dangerous patterns in one place means they can be updated consistently.

### `pathValidation.ts`

`src/utils/permissions/pathValidation.ts` validates file paths before allowing file operations. This prevents path traversal attacks (e.g., `../../etc/passwd`).

### `shellRuleMatching.ts`

`src/utils/permissions/shellRuleMatching.ts` implements the shell permission rule matching engine. Uses the tree-sitter argv to match against glob-style rule patterns.

### `yoloClassifier.ts`

`src/utils/permissions/yoloClassifier.ts` — **[UNCERTAIN]** The name suggests a permissive classifier used in YOLO/auto mode that still maintains some basic safety checks even when running autonomously.

### Analytics Privacy

Analytics events use:
- Numeric IDs instead of strings for security check results
- A type annotation `AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS` in `src/services/analytics/index.ts` — indicating a developer annotation requiring explicit review before logging any string that might contain user code or file paths.

---

## Limitations and Observations

1. **This is not a sandbox.** The AST analysis answers only "can we trust the argv?" — it does not prevent dangerous commands from running once approved.

2. **Classifier stub.** `src/utils/permissions/bashClassifier.ts` in this snapshot is a stub (`isClassifierPermissionsEnabled() → false`). The actual LLM-based classifier that matches natural-language permission descriptions is **Anthropic-internal only** (`ANT-ONLY` comment in the stub).

3. **`bypassPermissions` mode.** When enabled (e.g., via `--dangerously-skip-permissions`), all permission prompts are bypassed. This is clearly documented but creates a vector if the flag is set inappropriately in automated workflows.

4. **MDM raw reads.** The startup MDM read (`startMdmRawRead()`) forks subprocess calls to `plutil` on macOS and `reg query` on Windows. These run before any user interaction, before the trust dialog, meaning MDM policy is always loaded.

5. **Keychain prefetch.** OAuth tokens and API keys are prefetched from the macOS Keychain at startup using asynchronous reads. A compromised process at startup could potentially intercept these reads — though this is a general macOS security concern rather than specific to Claude Code.
