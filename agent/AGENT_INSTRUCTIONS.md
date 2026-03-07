# 🤖 Agent Instructions for Consciousness Revolution

This folder contains instructions, maps, and templates for AI agents (GitHub Copilot, Claude, Cursor, etc.) operating on this repository.

---

## Contents

| File | Purpose |
|------|---------|
| `AGENT_INSTRUCTIONS.md` | This file — rules and conventions for agents |
| `REPO_MAP.md` | Human and machine-readable map of the repository |
| `TASK_TEMPLATES.md` | Reusable templates for common task types |
| `SAFE_MODIFICATION_RULES.md` | What agents MUST NOT change without explicit approval |

---

## 🧠 Before Making ANY Change

1. **Read `REPO_MAP.md`** — understand where things live.
2. **Read `SAFE_MODIFICATION_RULES.md`** — know what is off-limits.
3. **Check `semantic-index/manifest.json`** — understand the system architecture.
4. **Search for existing implementations** before adding new files — duplication is a critical anti-pattern in this codebase.

---

## 🔑 Key Architecture Rules

### Secret Relay Pattern (CRITICAL)
Browser JavaScript **cannot** access secrets directly. Always use the existing relay endpoints:

```javascript
// ✅ CORRECT
const res = await fetch('/api/github-token');
const { auth, token } = await res.json();
if (!auth) { showError('Server secret missing'); return; }
// Use token in memory — never store in localStorage

// ❌ WRONG
const token = document.getElementById('tokenInput').value;
localStorage.setItem('github_token', token);
```

**Existing relay endpoints (DO NOT duplicate):**
- `/api/github-token` → `netlify/functions/github-token.mjs`
- `/api/sam-gov-token` → `netlify/functions/sam-gov-token.mjs`
- `/api/health` → `netlify/functions/health.js`

### Existing Infrastructure (MUST REUSE, NOT DUPLICATE)
- `netlify/functions/github-token.mjs` — GitHub token server relay
- `netlify/functions/sam-gov-token.mjs` — SAM.gov API key relay
- `netlify/functions/health.js` — Health check endpoint
- `netlify.toml` — `/api/*` → `/.netlify/functions/:splat` is already configured
- `src/systems/samgov-api-integration.js` — SAM.gov API class
- `src/utils/samgov-integration.js` — SAM.gov utility class

---

## 📋 Coding Conventions

### JavaScript
- ES6+ syntax (arrow functions, async/await, destructuring, template literals)
- Always use `const` / `let`, never `var`
- Always use try-catch for async operations
- User-facing error messages must be human-readable (no stack traces)
- Debounce expensive event handlers

### HTML
- Standalone, self-contained — no build step required
- `<!DOCTYPE html>`, `<meta charset="UTF-8">`, `<meta name="viewport" ...>` required
- Navigation back to `index.html` required
- ARIA labels on all interactive elements
- Minimum 44×44px touch targets
- Never store secrets in HTML or inline scripts

### CSS
- Mobile-first: base styles for mobile, media queries for larger screens
- Use CSS custom properties for theming
- Maintain WCAG AA color contrast (4.5:1 for normal text)

### Workflow Files
- Use `actions/checkout@v4` (NOT v5)
- Use `actions/setup-node@v4`
- Use `actions/upload-artifact@v4`
- Pin all action versions
- Set minimal permissions (least-privilege)
- Never print secrets in logs

---

## 🚫 What NOT to Do

- Do NOT commit `.env` files or any file containing secrets
- Do NOT store secrets in `localStorage`
- Do NOT log secret values with `console.log`
- Do NOT create a second GitHub token relay (use the existing one)
- Do NOT create a second SAM.gov relay (use the existing one)
- Do NOT break existing payment flows without replacing them completely
- Do NOT remove tests without replacing them with better ones
- Do NOT use `@latest` for GitHub Actions (pin to `@v4`)
- Do NOT use `var` in new JavaScript code

---

## ✅ PR Delivery Requirements

Every PR from an agent MUST:
- [ ] Resolve the entire task end-to-end (no partial changes)
- [ ] Include all client, server, and config file updates
- [ ] Pass existing CI checks
- [ ] Show `auth: true` for any secret-dependent feature when the secret is configured
- [ ] Show a clear, actionable message when a required secret is absent
- [ ] Be validated with `npm test` if tests exist for the changed area

---

## 📬 Contact

For questions or approval on sensitive changes: BarbrickDesign@gmail.com
