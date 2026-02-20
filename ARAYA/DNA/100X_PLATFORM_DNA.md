# 100X_PLATFORM_DNA.md

**Status:** ACTIVE

## PROJECT DNA - The Consciousness Revolution Platform

**Location:** `C:/Users/dwrek/100X_DEPLOYMENT/`
**Live URL:** https://consciousnessrevolution.io
**Status:** SHIP (Almost Ready)
**Last DNA Update:** 2026-01-11

---

## IDENTITY STRAND
### What Is This?
100X_DEPLOYMENT is the main platform - a static site deployed on Netlify that serves the Consciousness Revolution. It contains Pattern Theory tools, manipulation detectors, ARAYA chat, beta tester dashboards, and the revenue infrastructure.

### Why Does It Exist?
To deliver Pattern Theory to the world. The platform:
- Teaches manipulation pattern recognition
- Provides consciousness analysis tools
- Hosts ARAYA conversational AI
- Manages beta tester community
- Processes Stripe payments

### Core Philosophy
- **Static-first** - HTML/CSS/JS, no server required
- **Netlify deploy** - One command deployment
- **Pattern Theory native** - 7 domains, consciousness scoring
- **LFSME** - Lighter, Faster, Stronger, More Elegant

---

## PAST STRAND
### Version History
| Version | Date | Major Change |
|---------|------|--------------|
| v0.1 | Nov 2024 | First landing page |
| v1.0 | Dec 2024 | 50+ HTML tools |
| v2.0 | Dec 2025 | ARAYA integration |
| v2.5 | Dec 2025 | Stripe payment links |
| v3.0 | Jan 2026 | 7 Domains architecture |

### Failed Attempts
1. **React SPA** - Overkill for static content
2. **WordPress** - Too slow, too complex
3. **Self-hosted server** - Unnecessary ops burden

### Successful Patterns
1. **Static HTML** - Fast, cacheable, simple
2. **Netlify** - Free tier, auto-deploy, CDN
3. **Single repo** - All platform in one place
4. **Component CSS** - Reusable sacred-theme.css

---

## PRESENT STRAND
### Current Architecture
```
100X_DEPLOYMENT/
    |
    +-- index.html              # Main landing
    +-- landing.html            # Marketing page
    +-- login.html              # Auth gate
    +-- pricing.html            # Subscription tiers
    |
    +-- seven-domains/          # 7 Domain tools
    |   +-- business/
    |   +-- family/
    |   +-- government/
    |   +-- healthcare/
    |   +-- law-enforcement/
    |   +-- legal/
    |   +-- social-media/
    |
    +-- araya-chat.html         # ARAYA conversational AI
    +-- araya-light.html        # Lightweight ARAYA
    +-- ARAYA_UNIFIED_API.py    # Backend API
    |
    +-- GASLIGHTING_DETECTOR.html
    +-- MANIPULATION_DETECTOR.html
    +-- LOVE_BOMBING_DETECTOR.html
    +-- [50+ detector tools]
    |
    +-- BETA_TESTER_COCKPIT.html
    +-- TEAM_COCKPIT.html
    +-- OPERATOR_COCKPIT_*.html
    |
    +-- netlify/functions/      # Serverless backend
    +-- css/                    # Stylesheets
    +-- js/                     # JavaScript
```

### Key Pages
| Page | Purpose | Status |
|------|---------|--------|
| index.html | Main entry | Live |
| pricing.html | Subscription tiers | Live |
| araya-chat.html | AI chat | Needs backend |
| seven-domains/ | Domain tools | Live |
| BETA_TESTER_COCKPIT.html | Tester dashboard | Live |
| GASLIGHTING_DETECTOR.html | Pattern tool | Live |

### File Counts
- HTML files: 150+
- Python backends: 20+
- CSS files: 5
- JS files: 10+

### Deployment
```bash
# Deploy to production
cd 100X_DEPLOYMENT && netlify deploy --prod --dir=.

# Preview deploy
cd 100X_DEPLOYMENT && netlify deploy --dir=.
```

### Known Issues
1. **ARAYA backend not auto-start** - Requires manual `python ARAYA_UNIFIED_API.py`
2. **Some broken links** - 7 domains incomplete
3. **Mobile responsiveness** - Some pages need work

---

## FUTURE STRAND
### Next Steps (Q1 2026)
1. **Launch ARAYA** - Connect file writing capability
2. **Complete 7 Domains** - All domain pages populated
3. **Mobile-first redesign** - Responsive everything
4. **Stripe webhooks** - Automated tier upgrades

### Planned Upgrades
- Supabase user auth
- Builder tier progression
- Community features
- AI-generated content

### Scaling Vision
- 1000+ beta testers
- Self-sustaining revenue
- 7x7x7 tool library (343 tools)
- Multi-language support

---

## CONNECTIONS STRAND
### Dependencies
| System | Purpose | Status |
|--------|---------|--------|
| Netlify | Hosting | Active |
| Stripe | Payments | Active |
| Supabase | Database | Planned |
| ARAYA_UNIFIED_API | AI backend | Manual start |

### Consumers (Who Uses Platform)
| Consumer | Pages | Frequency |
|----------|-------|-----------|
| Public visitors | landing, pricing | Daily |
| Beta testers | cockpit, tools | Weekly |
| Team | operator cockpits | Daily |
| ARAYA | chat pages | On demand |

### Peer Connections
- **ARAYA_SYSTEM** - Provides AI chat backend
- **STRIPE** - Payment processing
- **CYCLOTRON_BRAIN** - Tool configs stored
- **CREDENTIAL_VAULT** - Stripe keys

---

## CREDENTIALS STRAND
### Required Credentials
| Credential | Location | Purpose |
|------------|----------|---------|
| Netlify site | .secrets/MASTER_KEYS.json | Deployment |
| Stripe keys | .mcp.json | Payments |
| Supabase | .env.supabase | User data |

### Netlify Info
- **Site ID:** verdant-tulumba-fa2a5a
- **Site URL:** https://consciousnessrevolution.io
- **Deploy Command:** `netlify deploy --prod --dir=.`

### Quick Commands
```bash
# Deploy to production
cd C:/Users/dwrek/100X_DEPLOYMENT && netlify deploy --prod --dir=.

# Preview deploy
cd C:/Users/dwrek/100X_DEPLOYMENT && netlify deploy --dir=.

# Start ARAYA backend
cd C:/Users/dwrek/100X_DEPLOYMENT && python ARAYA_UNIFIED_API.py

# Check site status
curl -I https://consciousnessrevolution.io
```

---

## EMERGENCY PROCEDURES
### If Site Down
```bash
# Check Netlify status
netlify status

# Redeploy
cd 100X_DEPLOYMENT && netlify deploy --prod --dir=.
```

### If ARAYA Not Working
```bash
# Start backend manually
cd C:/Users/dwrek/100X_DEPLOYMENT
python ARAYA_UNIFIED_API.py

# Check Ollama
curl http://localhost:11434/api/tags
```

### If Payment Broken
1. Check Stripe dashboard
2. Verify keys in `.mcp.json`
3. Test with `mcp__stripe__retrieve_balance`

---

**THE PLATFORM DELIVERS CONSCIOUSNESS. ONE CLICK TO AWAKENING.**
