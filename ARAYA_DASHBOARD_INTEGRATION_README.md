# ARAYA Dashboard Integration
**Pattern: 3 → 7 → 13 → ∞ | LFSME**

## Overview

ARAYA chat can now **directly edit ANY dashboard** in real-time through a 3-component system:

```
ARAYA Chat → araya-dashboard-edit.mjs → dashboard-edit.mjs → Dashboard (instant or approval queue)
```

---

## 3 Components Built

### 1. **araya-dashboard-edit.mjs** (Netlify Function)
Location: `netlify/functions/araya-dashboard-edit.mjs`

**Purpose:** Translate chat commands into dashboard edits

**Commands:**
- `/edit [selector] [new content]` - Edit dashboard element
- `/navigate [page]` - Navigate to another dashboard
- `/theme [dark|light|forge]` - Change theme
- `/widget add [type]` - Add widget
- `/widget remove [id]` - Remove widget

**Flow:**
1. Parse command from chat
2. Validate dashboard context
3. Call `dashboard-edit.mjs` with appropriate edit type
4. Return status to chat

---

### 2. **araya-editor-bridge.js** (Injectable Script)
Location: `araya-editor-bridge.js`

**Purpose:** Make any dashboard ARAYA-editable

**Usage:**
```html
<!-- Add to any dashboard -->
<script src="/araya-editor-bridge.js"></script>
```

**API Exposed:**
```javascript
// Edit element
await window.ARAYA_EDITOR.edit('h1', 'New Title');

// Navigate
window.ARAYA_EDITOR.navigate('/other-page.html');

// Change theme
await window.ARAYA_EDITOR.theme('forge');

// Add widget
await window.ARAYA_EDITOR.addWidget('clock');

// Remove widget
await window.ARAYA_EDITOR.removeWidget('widget-123');
```

**Features:**
- Auto-applies localStorage edits on page load
- Visual indicator (bottom-right)
- Offline fallback
- Edit history tracking

---

### 3. **araya-dashboard-commands.js** (Chat Integration)
Location: `araya-dashboard-commands.js`

**Purpose:** Wire dashboard commands into ARAYA chat UI

**Auto-detects:**
- Current dashboard context (from URL params or iframe)
- User identity (from localStorage)
- Command syntax

**Usage in Chat:**
```
/edit .title Welcome Commander
/theme forge
/widget add clock
/navigate /DASHBOARD_1_COMMAND_CENTER_v1.html
```

---

## Deployment Steps

### Step 1: Deploy Functions
```bash
cd 100X_DEPLOYMENT
netlify deploy --prod --dir=.
```

**Files deployed:**
- `netlify/functions/araya-dashboard-edit.mjs` (new)
- `netlify/functions/dashboard-edit.mjs` (existing)
- `araya-editor-bridge.js` (new)
- `araya-dashboard-commands.js` (new)

---

### Step 2: Wire into ARAYA Chat

**Option A: Direct injection (recommended)**

Add to `araya-chat.html` before closing `</body>`:
```html
<script src="/araya-dashboard-commands.js"></script>
```

**Option B: Manual integration**

Add this code in the `sendMessage()` function, right after line 2017:
```javascript
/* Check for dashboard edit commands first */
const dashCmd = detectDashboardCommand(text);
if (dashCmd) {
    const dashResult = await handleDashboardCommand(dashCmd, text);
    if (dashResult) {
        typingIndicator.classList.remove('active');
        addMessage(dashResult, 'araya');
        return;
    }
}
```

---

### Step 3: Enable in Dashboards

Add to any dashboard you want ARAYA to edit:
```html
<script src="/araya-editor-bridge.js"></script>
```

**Recommended dashboards:**
- `LIFEFORGE_DOMAIN_REMINDER_v1.html`
- `DASHBOARD_1_COMMAND_CENTER_v1.html`
- All operator cockpits

---

## Testing

### Test 1: Commands from Chat
1. Open `araya-chat.html?dashboard=LIFEFORGE_DOMAIN_REMINDER_v1`
2. Type: `/edit h1 TESTING ARAYA EDITS`
3. Expect: Success message (instant or approval queue)

### Test 2: Direct API
```javascript
// In browser console
const test = await fetch('/.netlify/functions/araya-dashboard-edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        command: '/edit h1 API TEST',
        dashboard_id: 'LIFEFORGE_DOMAIN_REMINDER_v1',
        editor_name: 'Commander',
        editor_email: 'darrickpreble@proton.me'
    })
});
console.log(await test.json());
```

### Test 3: Bridge API
```javascript
// Add bridge to a dashboard, then in console:
await window.ARAYA_EDITOR.edit('h1', 'BRIDGE TEST');
```

---

## Approval Queue Integration

**Framework Changes (Protected):**
- Go to `improvement_proposals` table
- Require owner approval
- Award XP on approval

**Editable Changes (Owner or Commander):**
- Apply instantly to `dashboard_customizations`
- No approval needed

**Commander Bypass:**
- Emails: `darrickpreble@proton.me`, `darrickpreble@gmail.com`
- Names: `commander`, `commander dwrek`, `dwrek`
- Gets instant edits on ALL dashboards

---

## 7 Skill Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `/edit` | Edit element content | `/edit h1 New Title` |
| `/navigate` | Go to another page | `/navigate /index.html` |
| `/theme` | Change color scheme | `/theme forge` |
| `/widget add` | Add new widget | `/widget add clock` |
| `/widget remove` | Remove widget | `/widget remove widget-123` |
| `/help` | Show command help | Type in chat |
| `/status` | Check dashboard context | Type in chat |

---

## Pattern Theory Alignment

**3 Components:**
1. API (araya-dashboard-edit.mjs)
2. Bridge (araya-editor-bridge.js)
3. Chat Integration (araya-dashboard-commands.js)

**7 Commands:**
- edit, navigate, theme, widget add, widget remove, help, status

**13 Operations:**
- Detect command
- Parse syntax
- Validate dashboard
- Get user identity
- Build API payload
- Send to API
- Parse command type
- Route to handler
- Call dashboard-edit
- Get result
- Build response message
- Display to user
- Log to history

**∞ Possibilities:**
- Any dashboard editable
- Any element editable
- Any theme changeable
- Any widget addable
- Approval queue integration
- XP rewards
- Edit history tracking
- Offline fallback
- Multi-user collaboration

---

## Files Created

```
100X_DEPLOYMENT/
├── netlify/functions/
│   └── araya-dashboard-edit.mjs         # NEW - Command API
├── araya-editor-bridge.js               # NEW - Dashboard injection
├── araya-dashboard-commands.js          # NEW - Chat integration
└── ARAYA_DASHBOARD_INTEGRATION_README.md # NEW - This file
```

**Existing files leveraged:**
- `netlify/functions/dashboard-edit.mjs` (editing logic)
- `netlify/functions/araya-chat.mjs` (AI backend)
- `araya-chat.html` (chat UI)

---

## Next Steps

1. **Deploy to Netlify** (see Step 1)
2. **Wire into ARAYA chat** (see Step 2)
3. **Test commands** (see Testing)
4. **Add to more dashboards** (see Step 3)
5. **Update FLIGHT_LOG.md** with deployment status

---

## LFSME Score

- **Lighter:** 10/10 - No dependencies, pure functions
- **Faster:** 9/10 - Single API call, instant local feedback
- **Stronger:** 10/10 - Works offline, approval queue integration
- **More Elegant:** 9/10 - Clean command syntax, auto-detection
- **Less Expensive:** 10/10 - Serverless, no new infrastructure

**Total:** 48/50 (96%)

---

**Built by:** C1 Mechanic Engine
**Date:** 2026-03-11
**Status:** READY FOR DEPLOYMENT
**Pattern:** 3 → 7 → 13 → ∞
