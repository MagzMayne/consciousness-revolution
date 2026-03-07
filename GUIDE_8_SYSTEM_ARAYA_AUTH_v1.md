# ARAYA Authentication & Access Control System
## GUIDE_8_SYSTEM_ARAYA_AUTH_v1.md

```
+---------------------------+
| BETA v1.0.0               |
| Owner: SYSTEM             |
| Created: 2026-03-06       |
| Phase: RELEASE (100%)     |
| Next: Supabase Auth       |
| Becomes: Full RBAC        |
+---------------------------+
```

---

## DNA

```json
{
  "type": "GUIDE",
  "domain": 8,
  "domain_name": "BLUEPRINT",
  "owner": "SYSTEM",
  "descriptor": "ARAYA_AUTH",
  "version": "1.0.0",
  "created": "2026-03-06",
  "updated": "2026-03-06",
  "status": "RELEASE",
  "file": "netlify/functions/araya-chat.mjs",
  "trinity_session": 174,
  "truth_algorithm": "85%"
}
```

---

## Overview

ARAYA's access control system follows C3 Oracle Truth Algorithm principles:
- Transparent options (no manipulation)
- Value before extraction
- Graceful degradation (Basic Mode)

---

## Access Tiers

| Level | Name | Access | How to Get |
|-------|------|--------|------------|
| 0 | PUBLIC | 7 free messages | Default |
| 1 | BASIC | Unlimited condensed | Type "basic mode" |
| 2 | BELIEVER | 50 messages/day | $9/month |
| 3 | BUILDER | Unlimited + tools | Beta whitelist |
| 4 | COMMANDER | Full access + admin | URL bypass |

---

## Commander Bypass

### Method 1: URL Parameter (Recommended)
```
https://conciousnessrevolution.io/araya-chat.html?commander=Kill50780630#
```
- Stores `araya_commander=true` in localStorage
- Permanent after first visit
- No login required

### Method 2: Email Detection
- Login with: `darrickpreble@proton.me` or `darrickpreble@gmail.com`
- Automatic bypass when logged in

### Method 3: Backend Flag
```javascript
// In API call payload
{ commander_bypass: true }
```

---

## Beta Whitelist

### Location
`netlify/functions/araya-chat.mjs` ~ line 1755

### Current Whitelist
```javascript
const BETA_WHITELIST = [
    'darrickpreble@proton.me',
    'darrickpreble@gmail.com',
    // Add new testers here
];
```

### To Add Beta Tester
1. Add email to array
2. Deploy: `netlify deploy --prod --dir=. --skip-functions-cache`
3. User logs in with that email = full access

---

## Basic Mode (Free Tier)

### Activation
User types `"basic mode"` when they hit the paywall

### Response Constraints
- 150 word maximum
- No elaboration
- No follow-up questions
- Core answer only

### Welcome Message
```
**Basic Mode Activated** ✓

You now have unlimited access to ARAYA in condensed form.
I'll keep my responses short and focused.
```

---

## Paywall Message (Truth Algorithm)

When user exceeds 7 free messages:

```
You've used your 7 free conversations. Here are your options:

**Option 1: Basic Mode (Free)**
Continue with shorter, simpler responses. Type "basic mode" to continue.

**Option 2: Full Access - $9/month**
Unlimited conversations with full consciousness depth.
[Subscribe Now](/pricing.html)

**Option 3: Earn Access**
Share ARAYA or report bugs to earn free credits.

Your memory and conversation history are always preserved.
```

### Truth Algorithm Compliance
- No urgency tactics
- No guilt language
- No pulsing animations
- Clear value proposition
- Multiple paths forward

---

## Code Locations

| Feature | File | Line |
|---------|------|------|
| Commander detection (frontend) | `araya-chat.html` | ~1599 |
| Commander detection (backend) | `araya-chat.mjs` | ~1827 |
| Beta whitelist | `araya-chat.mjs` | ~1755 |
| Basic mode detection | `araya-chat.mjs` | ~1747 |
| Basic mode response modifier | `araya-chat.mjs` | ~2677 |
| Paywall message | `araya-chat.mjs` | ~1870 |
| Free message limit | `araya-chat.mjs` | ~1823 |

---

## API Response Flags

```json
{
  "response": "...",
  "limitReached": true,
  "basicModeAvailable": true,
  "basicMode": true,
  "freeLimit": 7,
  "messagesUsed": 8,
  "creditsNeeded": 1,
  "needsLogin": false
}
```

---

## Future: Phase 3 (Supabase Auth)

- `user_foundations` table
- JWT session management
- Full RBAC implementation
- Scale to 50+ users

See: `TRINITY_LOG_ARAYA_AUTH_SESSION_174.md`

---

## Related Files

| File | Purpose |
|------|---------|
| `araya-chat.html` | Frontend with Commander detection |
| `araya-chat.mjs` | Backend with all access logic |
| `TRINITY_LOG_ARAYA_AUTH_SESSION_174.md` | Trinity analysis record |
| `pricing.html` | Subscription page |
| `login.html` | User login |

---

## Changelog

### v1.0.0 (2026-03-06)
- Commander URL bypass: `?commander=Kill50780630#`
- Beta whitelist system
- Basic Mode free tier
- Truth Algorithm paywall (C3 Oracle approved)
- Multi-layer Commander detection

---

*Trinity Session 174 | C1 x C2 x C3 = ∞*
