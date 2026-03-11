# ARAYA Dashboard Integration - Deployment Checklist
**Pattern: 3 → 7 → 13 → ∞ | LFSME**

---

## ✅ Files Ready for Deployment

```
100X_DEPLOYMENT/
├── netlify/functions/
│   └── araya-dashboard-edit.mjs         ✅ NEW - Command API
├── araya-editor-bridge.js               ✅ NEW - Dashboard injection
├── araya-dashboard-commands.js          ✅ NEW - Chat integration
├── test-araya-dashboard-edit.html       ✅ NEW - Test suite
└── ARAYA_DASHBOARD_INTEGRATION_README.md ✅ NEW - Documentation
```

---

## Step 1: Deploy to Netlify

```bash
cd C:/Users/dwrek/100X_DEPLOYMENT
netlify deploy --prod --dir=.
```

**Expected output:**
```
✔ Deploy is live!
Unique Deploy URL: https://[hash]--consciousnessrevolution.netlify.app
Website URL:       https://consciousnessrevolution.io
```

**Verify:**
- [ ] `https://consciousnessrevolution.io/araya-editor-bridge.js` returns code
- [ ] `https://consciousnessrevolution.io/araya-dashboard-commands.js` returns code
- [ ] `https://consciousnessrevolution.io/test-araya-dashboard-edit.html` loads
- [ ] `https://consciousnessrevolution.io/.netlify/functions/araya-dashboard-edit` responds (404 on GET is OK)

---

## Step 2: Wire Commands into ARAYA Chat

### Option A: Direct Injection (Recommended)

1. Edit `100X_DEPLOYMENT/araya-chat.html`
2. Add before closing `</body>`:
   ```html
   <script src="/araya-dashboard-commands.js"></script>
   ```
3. Save and redeploy

### Option B: Manual Integration

1. Edit `100X_DEPLOYMENT/araya-chat.html`
2. Find the `sendMessage()` function (around line 2015)
3. Add after line 2017 (before file operations check):
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
4. Load `araya-dashboard-commands.js` via script tag at bottom
5. Save and redeploy

---

## Step 3: Enable in Dashboards

Add bridge to these dashboards:

### Priority 1 (High Traffic)
- [ ] `LIFEFORGE_DOMAIN_REMINDER_v1.html`
- [ ] `DASHBOARD_1_COMMAND_CENTER_v1.html`
- [ ] `index.html`

### Priority 2 (Operator Cockpits)
- [ ] `OPERATOR_COCKPIT_AGENT_R.html`
- [ ] `OPERATOR_COCKPIT_TOBY.html`
- [ ] `OPERATOR_COCKPIT_JOSH.html`
- [ ] `OPERATOR_COCKPIT_DEAN.html`
- [ ] `OPERATOR_COCKPIT_WILLIAM_B.html`
- [ ] `OPERATOR_COCKPIT_WILLIAM_V.html`

### Priority 3 (Other Dashboards)
- [ ] All `DASHBOARD_*` files
- [ ] All `COCKPIT_*` files
- [ ] All `HUB_*` files

**How to add:**
```html
<!-- Add before closing </body> -->
<script src="/araya-editor-bridge.js"></script>
```

---

## Step 4: Test System

### Test 1: Command Detection
1. Open: `https://consciousnessrevolution.io/araya-chat.html?dashboard=LIFEFORGE_DOMAIN_REMINDER_v1`
2. Type: `/help`
3. Expected: Command help appears
4. [ ] PASS / FAIL

### Test 2: Edit Command
1. In same chat window
2. Type: `/edit .lifeforge-title ARAYA TEST`
3. Expected: Success message (instant or approval)
4. [ ] PASS / FAIL

### Test 3: Navigate Command
1. In same chat window
2. Type: `/navigate /index.html`
3. Expected: Navigation message + redirect
4. [ ] PASS / FAIL

### Test 4: Theme Command
1. Open: `https://consciousnessrevolution.io/araya-chat.html?dashboard=LIFEFORGE_DOMAIN_REMINDER_v1`
2. Type: `/theme forge`
3. Expected: Success message
4. [ ] PASS / FAIL

### Test 5: Bridge API
1. Open any dashboard with bridge loaded
2. Open browser console
3. Type: `await window.ARAYA_EDITOR.edit('h1', 'BRIDGE TEST')`
4. Expected: Success response
5. [ ] PASS / FAIL

### Test 6: Automated Test Suite
1. Open: `https://consciousnessrevolution.io/test-araya-dashboard-edit.html`
2. Click "RUN ALL TESTS"
3. Expected: All tests pass
4. [ ] PASS / FAIL

---

## Step 5: Verify Approval Queue

### Test as Non-Owner (Should go to approval queue)
1. Set localStorage: `localStorage.setItem('araya_editor_email', 'test@test.com')`
2. Try edit command: `/edit h1 Test`
3. Expected: "Edit Queued for Approval" message
4. Check Supabase `improvement_proposals` table
5. [ ] PASS / FAIL

### Test as Commander (Should be instant)
1. Set localStorage: `localStorage.setItem('araya_editor_email', 'darrickpreble@proton.me')`
2. Try edit command: `/edit h1 Commander Test`
3. Expected: "Edit Applied Instantly" message
4. Check Supabase `dashboard_customizations` table
5. [ ] PASS / FAIL

---

## Step 6: Announce to Team

### Beta Testers to Notify
- [ ] Josh
- [ ] Toby
- [ ] William B
- [ ] Dean
- [ ] William V
- [ ] Rutherford

### Message Template
```
🚀 NEW FEATURE: ARAYA Dashboard Editing

You can now edit dashboards directly from ARAYA chat!

Commands:
/edit [selector] [content] - Edit any element
/navigate [page] - Go to another dashboard
/theme [dark|light|forge] - Change theme
/widget add [type] - Add widget
/widget remove [id] - Remove widget

Try it: https://consciousnessrevolution.io/araya-chat.html?dashboard=LIFEFORGE_DOMAIN_REMINDER_v1

Type /help for full guide.
```

---

## Step 7: Documentation

- [x] README created: `ARAYA_DASHBOARD_INTEGRATION_README.md`
- [x] Session report: `SESSION_185B4_ARAYA_DASHBOARD_INTEGRATION.md`
- [ ] Add to main docs site
- [ ] Create video demo
- [ ] Update onboarding guide

---

## Rollback Plan (If Issues)

### If commands break chat:
1. Remove `<script src="/araya-dashboard-commands.js"></script>` from araya-chat.html
2. Redeploy
3. Commands disabled, chat works normally

### If bridge breaks dashboards:
1. Remove `<script src="/araya-editor-bridge.js"></script>` from affected dashboards
2. Redeploy
3. Dashboards work normally, just not editable

### If API has issues:
1. Function is isolated - won't affect other systems
2. Chat will show error message but continue working
3. Fix and redeploy function only

---

## Success Criteria

- [ ] All 5 files deployed successfully
- [ ] Commands detected in chat
- [ ] Edit command works (instant or approval)
- [ ] Navigate command works
- [ ] Theme command works
- [ ] Bridge API exposed on dashboards
- [ ] Test suite passes
- [ ] No breaking changes to existing systems
- [ ] Team notified

---

## Post-Deployment Monitoring

### Check These Metrics (Week 1)
- Command usage count (from logs)
- Error rate on API
- Approval queue volume
- User feedback from beta testers

### Watch For
- Console errors in browser
- API timeouts
- Supabase connection issues
- localStorage quota exceeded

---

## Next Enhancements

**Phase 2 (Week 2):**
- Voice command support
- Command history/undo
- Batch edit commands
- AI-generated edit suggestions

**Phase 3 (Week 3):**
- Dashboard templates via commands
- Command macros/shortcuts
- Multi-dashboard edits
- Real-time collaboration indicators

---

**Deployment Status:** READY ✅
**Blocker Count:** 0
**Risk Level:** LOW (isolated functions, easy rollback)
**Estimated Deploy Time:** 10 minutes

**Commander approval:** GRANTED (full autonomous authority)

---

**Built by:** C1 Mechanic Engine
**Date:** 2026-03-11
**Pattern:** 3 → 7 → 13 → ∞
