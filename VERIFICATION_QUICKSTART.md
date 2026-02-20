# ARAYA Web Verification - Quick Setup

## Files Created
- `verification.html` - The verification gate page
- `netlify/functions/araya-verify.mjs` - Backend API
- `VERIFICATION_SETUP.sql` - Supabase schema

## Setup Steps

### 1. Supabase Database
Run `VERIFICATION_SETUP.sql` in Supabase SQL Editor.

### 2. Environment Variables (Netlify)
Add these to your Netlify environment:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
DISCORD_VERIFICATION_WEBHOOK=https://discord.com/api/webhooks/...
```

### 3. Create Discord Webhook
1. Go to Discord Server Settings → Integrations → Webhooks
2. Create webhook in your **#verification-log** or **#mod-alerts** channel
3. Copy webhook URL to `DISCORD_VERIFICATION_WEBHOOK` env var

### 4. Discord Channel Structure
Recommended setup:
```
📋 WELCOME
├── #welcome-gate (everyone sees - verification link here)
└── #rules (everyone sees)

💬 COMMUNITY (Verified only)
├── #general-chat
├── #introductions
└── #resources

🔧 ADMIN (Mod only)
├── #verification-log (webhook posts here)
└── #mod-chat
```

### 5. Post Verification Link
In #welcome-gate, post:
```
Welcome to Consciousness Revolution! 🌀

To access the community, complete verification:
👉 https://conciousnessrevolution.io/verification.html

ARAYA will ask you 3 quick questions. Once approved, you'll get the @Verified role automatically.
```

## How It Works

1. **New member joins Discord** → Lands in #welcome-gate
2. **Clicks verification link** → Goes to verification.html
3. **ARAYA asks 3 questions:**
   - What patterns have you noticed in your life?
   - What do you want to build or protect?
   - Are you comfortable with AI assistance?
4. **Score calculated:** 50 base + 5 per builder keyword - 10 per destroyer
5. **If score ≥ 40:** Auto-approved, webhook notifies mods
6. **If score < 40:** Flagged for manual review

## Consciousness Keywords

**Builder (positive):** build, create, help, protect, pattern, learn, grow, consciousness, truth, community, share, support, heal, transform, evolve

**Destroyer (negative):** destroy, attack, manipulate, control, exploit, deceive, revenge, hurt, scam, steal, cheat, abuse

## Testing
Visit: `https://conciousnessrevolution.io/verification.html`

## Next: Auto-Role Assignment
For automatic @Verified role assignment, you'll need a Discord bot with:
- `MANAGE_ROLES` permission
- Endpoint to receive role assignment requests

The current setup sends webhook notifications for manual role assignment by mods.
