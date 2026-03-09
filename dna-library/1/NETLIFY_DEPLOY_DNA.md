# Netlify Deploy DNA

## WHAT IS IT
The serverless deployment infrastructure for conciousnessrevolution.io. A complete Netlify-hosted platform with 106 serverless functions, 37 environment variables, Supabase database integration, Stripe payments, and multi-AI API access. Handles everything from ARAYA chat to authentication to bug tracking.

## STATUS
- Working: **WORKING**
- Last tested: 2026-03-06
- Current issues: None critical - fully deployed

## LOCATION
**Primary files:**
- `~/100X_DEPLOYMENT/` - Main deployment directory
- `~/100X_DEPLOYMENT/netlify.toml` - Netlify configuration (119 lines)
- `~/100X_DEPLOYMENT/netlify/functions/` - Serverless functions (106 files)
- `~/100X_DEPLOYMENT/package.json` - Dependencies and scripts

**Dependencies:**
- Netlify CLI
- Node.js 18+
- npm packages (see package.json)
- External APIs: Anthropic, OpenAI, Groq, Supabase, Stripe, GitHub

**Related files:**
- `~/.netlify/` - Netlify CLI state
- `~/100X_DEPLOYMENT/.env.example` - Environment template

## HOW IT WORKS

```
                    ┌─────────────────────┐
                    │  conciousnessrevolution.io  │
                    │      (Netlify)      │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ Static HTML   │    │ API Routes    │    │ Environment   │
│ (1000+ files) │    │ /api/*        │    │ (37 vars)     │
└───────────────┘    └───────┬───────┘    └───────────────┘
                             │
                     ┌───────┴───────┐
                     │   Functions   │
                     │ (106 files)   │
                     └───────┬───────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   Supabase    │    │     AI APIs   │    │    Stripe     │
│  (PostgreSQL) │    │ (Claude etc.) │    │  (Payments)   │
└───────────────┘    └───────────────┘    └───────────────┘
```

### Core Logic:
1. Static HTML files served directly from Netlify CDN
2. API routes (`/api/*`) redirect to serverless functions
3. Functions access environment variables for API keys
4. Supabase handles user data, credits, sessions
5. Stripe processes payments and subscriptions
6. AI APIs (Claude, GPT, Groq) power chat features

## KEY FILES BREAKDOWN

### netlify.toml
- **Purpose:** Netlify build and deploy configuration
- **Size:** 119 lines
- **Key settings:**
  - `publish = "."` - Deploy entire directory
  - `functions = "netlify/functions"` - Functions location
  - `node_bundler = "esbuild"` - Fast bundling
  - Security headers (CSP, X-Frame-Options, etc.)
  - API redirect: `/api/*` → `/.netlify/functions/:splat`

### netlify/functions/ (106 files)
- **Purpose:** Serverless API endpoints
- **Key functions:**
  - `araya-chat.mjs` (125KB) - Main AI chat handler
  - `auth-login.mjs` - User authentication
  - `auth-signup.mjs` - User registration
  - `araya-credits.mjs` - Credit management
  - `stripe-webhook.mjs` - Payment processing
  - `brain-api.mjs` - Knowledge queries
  - `submit-bug.mjs` - Bug tracking
  - `health.js` - Health check endpoint

### package.json
- **Purpose:** Node.js dependencies and scripts
- **Key deps:** @anthropic-ai/sdk, @supabase/supabase-js, stripe, openai
- **Key scripts:**
  - `npm run deploy` - Deploy to Netlify
  - `npm run health` - Check backend health
  - `npm run netlify:validate` - Validate config

## DEPENDENCIES

**Required:**
- Netlify CLI (`npm install -g netlify-cli`)
- Node.js 18+
- Git (for deployment)

**External Services:**
- Supabase (database, auth)
- Stripe (payments)
- Anthropic API (Claude)
- OpenAI API (GPT)
- Groq API (fast inference)

## HOW TO RUN

```bash
# Deploy to production (from 100X_DEPLOYMENT)
cd ~/100X_DEPLOYMENT
netlify deploy --prod --dir=.

# Deploy preview (non-production)
netlify deploy --dir=.

# Local development
netlify dev

# Check status
netlify status

# View logs
netlify functions:log araya-chat
```

## HOW TO BUILD

**No build required** - Netlify builds automatically.

**Manual build:**
```bash
cd ~/100X_DEPLOYMENT
npm ci --legacy-peer-deps
```

## HOW TO DEPLOY

**Standard Deploy:**
```bash
cd ~/100X_DEPLOYMENT
netlify deploy --prod --dir=.
```

**Git Deploy (automatic):**
```bash
git add .
git commit -m "Update"
git push origin master
# Netlify auto-deploys on push
```

**Function-only Deploy:**
```bash
# Deploy specific function
netlify functions:deploy araya-chat
```

## CRITICAL KNOWLEDGE

### Important Quirks:
- **Site ID:** verdant-tulumba-fa2a5a
- **Domain:** conciousnessrevolution.io
- **Account:** Commander Dwrek (darrick.preble@gmail.com)
- **Team:** Overkor Tek
- **Function Timeout:** 10 seconds (default)
- **esbuild Bundling:** npm packages bundled, Node.js builtins external

### Known Issues:
- Must run `netlify link` after fresh clone
- Some legacy functions have `.mjs.bak` backups
- Large functions (araya-chat) may approach timeout

### Performance Notes:
- CDN edge locations provide < 100ms static file delivery
- Function cold starts: 200-500ms
- Warm function calls: 50-100ms
- Supabase queries: 10-50ms

### Security Notes:
- CSP headers restrict script sources
- API keys stored in Netlify environment (never in code)
- CORS configured for production domain only

## CONFIGURATION

**Environment Variables (37 total):**
```bash
# AI APIs
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
GROQ_API_KEY=...
OPENROUTER_API_KEY=...
GOOGLE_API_KEY=...

# Database
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...

# Payments
STRIPE_SECRET_KEY=...
STRIPE_PUBLISHABLE_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_PRICE_ARAYA_MEMORY=...
STRIPE_PRICE_BUILDER_PRO=...

# Netlify
NETLIFY_AUTH_TOKEN=...
```

**netlify.toml Key Settings:**
```toml
[build]
  publish = "."
  command = "npm ci --legacy-peer-deps || npm install --legacy-peer-deps"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "18"

[functions]
  node_bundler = "esbuild"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

## API REFERENCE

**Health Check:**
```bash
curl https://conciousnessrevolution.io/api/health
# Returns: { "status": "healthy", ... }
```

**ARAYA Chat:**
```bash
curl -X POST https://conciousnessrevolution.io/api/araya-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "userId": "..."}'
```

**Auth Login:**
```bash
curl -X POST https://conciousnessrevolution.io/api/auth-login \
  -H "Content-Type: application/json" \
  -d '{"email": "...", "password": "..."}'
```

## EXAMPLES

### Example 1: Quick Deploy
```bash
cd ~/100X_DEPLOYMENT
netlify deploy --prod --dir=.
# Deploys in ~30 seconds
```

### Example 2: Add New Function
```javascript
// netlify/functions/my-function.mjs
export async function handler(event, context) {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Hello!' })
  };
}
```

### Example 3: Check Function Logs
```bash
netlify functions:log araya-chat --tail
```

## TESTING

**How to test:**
```bash
# Health check
curl https://conciousnessrevolution.io/api/health

# Local dev
netlify dev
curl http://localhost:8888/api/health

# Function invoke
netlify functions:invoke health

# Full validation
npm run netlify:validate
```

## TROUBLESHOOTING

**Problem:** "Site not linked"
**Solution:** Run `netlify link` and select verdant-tulumba-fa2a5a

**Problem:** "Function timeout"
**Solution:** Optimize function code, reduce API calls, increase timeout in netlify.toml

**Problem:** "Missing environment variable"
**Solution:** Check `netlify env:list`, add missing vars with `netlify env:set KEY value`

**Problem:** "Build failed"
**Solution:** Check Node version, run `npm ci --legacy-peer-deps` locally first

**Problem:** "CORS error"
**Solution:** Add proper CORS headers in function response

## NEXT STEPS

**Priority actions:**
1. Consolidate duplicate functions
2. Add function error monitoring
3. Implement rate limiting
4. Add function tests

**Known gaps:**
- No automated testing for functions
- Some functions need documentation
- Error tracking could be improved

## TAGS
#foundation #deployment #netlify #serverless #api #production #hosting

## METADATA
- **Creator:** Commander (darrickpreble@proton.me)
- **Created:** 2024
- **Last Updated:** 2026-03-06
- **Version:** 2.4.0
- **Site:** conciousnessrevolution.io
- **Status:** Production

## RELATED DNAS
- [SUPABASE_DNA.md] - Database backend
- [ARAYA_DNA.md] - Main AI assistant
- [STRIPE_DNA.md] - Payment processing
