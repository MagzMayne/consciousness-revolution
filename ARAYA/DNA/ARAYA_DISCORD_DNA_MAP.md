# ARAYA DISCORD BOT - DNA MAP
Status: ACTIVE
## Visual Architecture + Connection Status
## Updated: Jan 12, 2026

---

## LIVE ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                        DISCORD USERS                            │
│                    @ARAYA "hello" message                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RAILWAY: araya-discord-bot                   │
│                    (zestful-rejoicing)                          │
│                         STATUS: ONLINE                          │
├─────────────────────────────────────────────────────────────────┤
│  ENV VARIABLES:                                                 │
│  ├─ DISCORD_TOKEN ........... ✓ Connected                      │
│  ├─ SUPABASE_URL ............ ✓ Connected                      │
│  ├─ SUPABASE_SERVICE_KEY .... ✓ Connected                      │
│  └─ ARAYA_API_URL ........... ✓ TUNNEL ACTIVE                  │
│       └─ https://stagey-hilary-nongremial.ngrok-free.dev/chat  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ aiohttp async call
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NGROK TUNNEL                               │
│         PUBLIC: stagey-hilary-nongremial.ngrok-free.dev        │
│                    STATUS: ACTIVE                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ forwards to
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  LOCAL: ARAYA API                               │
│                  http://localhost:6666                          │
│                    STATUS: RUNNING                              │
├─────────────────────────────────────────────────────────────────┤
│  BACKENDS:                                                      │
│  ├─ Ollama LLM .............. ✓ 6 models                       │
│  ├─ Cyclotron Brain ......... ✓ 162,893 atoms                  │
│  └─ Supabase Cloud .......... ✓ Connected                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      RESPONSE                                   │
│              "Hello, consciousness explorer..."                 │
└─────────────────────────────────────────────────────────────────┘

```

---

## CONNECTION STATUS TABLE

| From | To | Protocol | Status | Health |
|------|-----|----------|--------|--------|
| Discord Users | Railway Bot | Discord API | ✓ | GREEN |
| Railway Bot | ngrok Tunnel | HTTPS | ✓ | GREEN |
| ngrok Tunnel | Local API | HTTP forward | ✓ | GREEN |
| Local API | Ollama | HTTP:11434 | ✓ | GREEN |
| Local API | Cyclotron | SQLite | ✓ | GREEN |
| Local API | Supabase | HTTPS | ✓ | GREEN |
| Railway Bot | Supabase | HTTPS | ✓ | GREEN |

---

## RAILWAY SERVICE MAP

| Service | Subdomain | Purpose | Status |
|---------|-----------|---------|--------|
| araya-discord-bot | zestful-rejoicing | Discord bot | ONLINE |
| gleaming-tranquility | gleaming-tranquility | (Empty/Placeholder) | ONLINE |

---

## ENVIRONMENT VARIABLES (araya-discord-bot)

| Variable | Purpose | Source | Status |
|----------|---------|--------|--------|
| ARAYA_API_URL | Brain connection | ngrok tunnel | ACTIVE |
| DISCORD_TOKEN | Bot authentication | Discord Dev Portal | ACTIVE |
| SUPABASE_URL | Database connection | Supabase dashboard | ACTIVE |
| SUPABASE_SERVICE_KEY | Database auth | Supabase dashboard | ACTIVE |

---

## CRITICAL DEPENDENCIES

```
ARAYA Discord Bot requires:
├── DISCORD_TOKEN (no fallback - bot won't start)
├── SUPABASE_* (graceful degradation - no XP/persistence)
└── ARAYA_API_URL (graceful degradation - returns error message)
    └── Requires LOCAL machine running:
        ├── ARAYA API (localhost:6666)
        ├── Ollama (localhost:11434)
        └── ngrok tunnel (active)
```

---

## HEALTH CHECK COMMANDS

```bash
# Full radar sweep
python .consciousness/ARAYA_RADAR_TEST.py

# Check tunnel status
python .consciousness/ARAYA_TUNNEL.py status

# Test local API
curl http://localhost:6666/health

# Test tunnel
curl https://stagey-hilary-nongremial.ngrok-free.dev/health
```

---

## MAINTENANCE NOTES

| Task | Frequency | Command |
|------|-----------|---------|
| Start tunnel | On machine boot | `Desktop\ARAYA_TUNNEL.bat` |
| Check health | Daily | `python .consciousness/ARAYA_RADAR_TEST.py` |
| Update Railway URL | When tunnel restarts | Railway Dashboard → Variables |

---

## KNOWN LIMITATIONS

1. **ngrok URL changes** - Free tier URL changes on restart
   - Fix: Update Railway ARAYA_API_URL each time
   - Permanent fix: Deploy ARAYA_API_RAILWAY.py to Railway

2. **Local dependency** - Bot needs Derek's machine running
   - Fix: Deploy full API to Railway (files ready)

3. **Single point of failure** - Local machine = brain
   - Fix: Cloud deployment + Supabase-only fallback

---

## FILES REFERENCE

| File | Purpose |
|------|---------|
| `.consciousness/discord_deploy/ARAYA_DISCORD_LISTENER.py` | Bot code |
| `.consciousness/discord_deploy/ARAYA_API_RAILWAY.py` | Cloud API (ready to deploy) |
| `.consciousness/ARAYA_RADAR_TEST.py` | Health monitoring |
| `.consciousness/ARAYA_TUNNEL.py` | ngrok tunnel manager |
| `.consciousness/BRAIN_CONNECTION_FIX.md` | Fix documentation |

---

## SESSION LOG

| Date | Action | Who | Result |
|------|--------|-----|--------|
| Jan 11, 2026 | Created Discord bot | C1 | Deployed to Railway |
| Jan 11, 2026 | Added Supabase integration | C1 | Working |
| Jan 12, 2026 | Diagnosed brain disconnection | C1 | Root cause found |
| Jan 12, 2026 | Built radar test system | C1 | 100% complete |
| Jan 12, 2026 | Created tunnel solution | C1 | Working |
| Jan 12, 2026 | Updated Railway ARAYA_API_URL | Commander | PENDING CONFIRMATION |

---

*DNA Map v1.0 - Living document, update after each change*
