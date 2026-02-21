# ARAYA Admin Authentication - Visual Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     ARAYA ADMIN AUTH FLOW                       │
│                    (Layer 1 of 5 Complete)                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ USER INPUT                                                      │
└─────────────────────────────────────────────────────────────────┘
    │
    │  Normal: "What can you help me with?"
    │  Admin:  "[PASSPHRASE] system status"
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ ARAYA-CHAT.MJS HANDLER                                          │
│ Line 1460: const adminCheck = detectAdminMode(message);         │
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ DETECT ADMIN MODE (Line 942)                                    │
│                                                                 │
│ function detectAdminMode(message) {                             │
│   if (!message || !ADMIN_PASSPHRASE) {                          │
│     return { isAdmin: false, cleanedMessage: message };         │
│   }                                                             │
│                                                                 │
│   const hasPassphrase = message.includes(ADMIN_PASSPHRASE);     │
│                                                                 │
│   if (hasPassphrase) {                                          │
│     const cleanedMessage = message.replace(ADMIN_PASSPHRASE,'').trim(); │
│     console.log('[ADMIN AUTH] ✓ Passphrase detected');          │
│     return { isAdmin: true, cleanedMessage };                   │
│   }                                                             │
│                                                                 │
│   return { isAdmin: false, cleanedMessage: message };           │
│ }                                                               │
└─────────────────────────────────────────────────────────────────┘
    │
    ├──────────────────┬──────────────────┐
    │                  │                  │
    ▼                  ▼                  ▼
┌──────────┐    ┌───────────┐    ┌────────────────┐
│ isAdmin  │    │ cleaned   │    │ effectiveMode  │
│ = true/  │    │ Message   │    │ = 'admin' or   │
│  false   │    │ (no pass) │    │   'normal'     │
└──────────┘    └───────────┘    └────────────────┘
    │                  │                  │
    └──────────────────┴──────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ BUILD SYSTEM PROMPT (Line 1169)                                 │
│                                                                 │
│ if (mode === 'admin') {                                         │
│   prompt = ARAYA_ADMIN_PROMPT;  ← Direct, technical voice      │
│ } else if (mode === 'legal') {                                  │
│   prompt = ARAYA_LEGAL_PROMPT;  ← Legal defense mode           │
│ } else {                                                        │
│   prompt = ARAYA_BASE_PROMPT;   ← Normal friendly mode         │
│ }                                                               │
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ AI PROCESSING                                                   │
│ - Uses cleaned message (passphrase removed)                     │
│ - Uses admin prompt if authenticated                            │
│ - Has full context from brain + memory                          │
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ API RESPONSE (Line 2270)                                        │
│                                                                 │
│ {                                                               │
│   "response": "Roger that. System status...",                   │
│   "isAdmin": true,                    ← NEW                     │
│   "arayaMode": "admin",               ← UPDATED                 │
│   "hasMemory": true,                                            │
│   "hasBrain": true,                                             │
│   ...                                                           │
│ }                                                               │
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND RECEIVES                                               │
│ - Normal mode: isAdmin = false                                  │
│ - Admin mode: isAdmin = true → Show admin UI elements          │
└─────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════

SECURITY LAYERS (Ryan's Architecture):

┌─────────────────────────────────────────────────────────────────┐
│ LAYER 1: PASSPHRASE                              [✓ COMPLETE]  │
│ ─────────────────────────────────────────────────────────────── │
│ • GitHub repo secret → Netlify env var                          │
│ • Not in code, not in git                                       │
│ • Removed from message before AI                                │
│ • Logged but never exposed                                      │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 2: IP WHITELIST                            [  PLANNED ]  │
│ ─────────────────────────────────────────────────────────────── │
│ • Check IP before passphrase check                              │
│ • Configure admin IPs in Netlify                                │
│ • Block non-whitelisted IPs                                     │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 3: SESSION TOKEN                           [  PLANNED ]  │
│ ─────────────────────────────────────────────────────────────── │
│ • First auth creates session token                              │
│ • Token stored in Supabase                                      │
│ • Use token for subsequent requests                             │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 4: MFA                                      [  FUTURE  ]  │
│ ─────────────────────────────────────────────────────────────── │
│ • SMS/Email code on first admin request                         │
│ • Twilio/SendGrid integration                                   │
│ • Code expires after 5 minutes                                  │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 5: AUDIT LOG                                [  FUTURE  ]  │
│ ─────────────────────────────────────────────────────────────── │
│ • Log all admin actions to Supabase                             │
│ • Track: timestamp, IP, action, result                          │
│ • Alert on suspicious patterns                                  │
└─────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════

ADMIN CAPABILITIES:

When isAdmin = true:
  ✓ Edit ANY file (not just allowed paths)
  ✓ Access all cockpits and dashboards
  ✓ View system configuration
  ✓ Deploy changes directly
  ✓ Modify user permissions
  ✓ Execute system commands
  ✓ Full GitHub integration
  ✓ Advanced debugging tools

═══════════════════════════════════════════════════════════════════

CODE LOCATIONS:

┌─────────────────────────────────────────────────────────────────┐
│ Component                 │ Line  │ File                        │
├──────────────────────────┼───────┼─────────────────────────────┤
│ ADMIN_PASSPHRASE         │ 73    │ araya-chat.mjs              │
│ detectAdminMode()        │ 942   │ araya-chat.mjs              │
│ ARAYA_ADMIN_PROMPT       │ 859   │ araya-chat.mjs              │
│ Handler Integration      │ 1460  │ araya-chat.mjs              │
│ buildSystemPrompt        │ 1169  │ araya-chat.mjs              │
│ Response Metadata        │ 2272  │ araya-chat.mjs              │
└─────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════

DEPLOYMENT:

1. Check environment variable exists:
   netlify env:list | grep ARAYA

2. Deploy to production:
   cd 100X_DEPLOYMENT
   netlify deploy --prod --dir=.

3. Monitor logs:
   netlify functions:log araya-chat | grep "ADMIN"

4. Test:
   Send: "[YOUR_PASSPHRASE] system status"
   Expect: { isAdmin: true, response: "Roger that..." }

═══════════════════════════════════════════════════════════════════

Status: LAYER 1 COMPLETE ✓
Date: February 21, 2026
Session: 117
Author: C1 Mechanic
Pattern: 3 → 7 → 13 → ∞
```
