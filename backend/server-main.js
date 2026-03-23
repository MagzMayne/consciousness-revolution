// server-main.js - Railway Entry Point
// Created: 2026-03-12 Session 186
// Purpose: Railway expects this file at /app/backend/server-main.js
//
// Environment variables consumed by this service:
//   PORT                  — HTTP listen port (default 3000)
//   RAILWAY_API_KEY       — Railway platform API key for meta-ops
//   OPENAI_API_KEY        — OpenAI API key (primary AI provider)
//   GROQ_API_KEY          — Groq API key (alternative AI provider)
//   AGENTR                — Agent R identity token (007420)
//   ROOTIBAPP_CLIENT_ID   — RootIB application client ID
//   ROOTIBAPP_CLIENT_SECRET — RootIB application client secret
//   SCANNER_SPEC_URL      — URL of the OpenAPI spec to scan
//   WEBHOOK_URL           — URL for backend→external webhook heartbeats
//   WEBHOOK_SECRET        — Shared secret for webhook signature header
//   PAYPAL_CLIENT_ID      — PayPal REST API client ID
//   PAYPAL_SECRET         — PayPal REST API secret
//   PAYPAL_MODE           — 'sandbox' | 'live'
//   PAYPAL_WEBHOOK_ID     — PayPal webhook ID for event verification
//   GEMINI_API_KEY        — Google Gemini API key
//   EMAIL_USER            — SMTP / Gmail sender address
//   EMAIL_PASSWORD        — SMTP / Gmail app password
//   SUPABASE_URL          — Supabase project URL (for auth routes)
//   SUPABASE_SERVICE_ROLE — Supabase service-role key (for auth routes)

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ── Railway + AI + RootIB env-var validation (warn-only, no hard exit) ───
const REQUIRED_ENV = {
  RAILWAY_API_KEY:        'Railway platform API key',
  OPENAI_API_KEY:         'OpenAI API key (primary AI provider)',
  GROQ_API_KEY:           'Groq API key (alternative AI provider)',
  AGENTR:                 'Agent R identity token',
  ROOTIBAPP_CLIENT_ID:    'RootIB application client ID',
  ROOTIBAPP_CLIENT_SECRET: 'RootIB application client secret',
  SCANNER_SPEC_URL:       'API spec scanner URL',
  WEBHOOK_URL:            'External webhook target URL',
  PAYPAL_CLIENT_ID:       'PayPal REST API client ID',
  PAYPAL_SECRET:          'PayPal REST API secret',
  GEMINI_API_KEY:         'Google Gemini API key',
  EMAIL_USER:             'SMTP sender address',
  EMAIL_PASSWORD:         'SMTP sender password',
  SUPABASE_URL:           'Supabase project URL',
  SUPABASE_SERVICE_ROLE:  'Supabase service-role key',
};

const missingVars = Object.entries(REQUIRED_ENV)
  .filter(([key]) => !process.env[key])
  .map(([key, desc]) => `  ${key} — ${desc}`);

if (missingVars.length > 0) {
  console.warn('[server-main] The following environment variables are not set (service will use fallback behaviour):');
  missingVars.forEach(v => console.warn(v));
} else {
  console.log('[server-main] All expected environment variables are present ✓');
}

// Middleware
app.use(cors());
app.use(express.json());

// ── EzAutobots distributed-node routes ─────────────────────────
let _nodeRegistry = null;
try {
  const nodeRewardsRouter = require('./routes/node-rewards');
  const nodesRouter       = require('./routes/nodes');
  app.use('/node-rewards', nodeRewardsRouter);
  app.use('/nodes', nodesRouter);

  // Root-level shortcuts so local launchers can POST to /register-node & /heartbeat
  // without needing to know the /nodes prefix.
  const _notFound = (_req, res) => res.status(404).json({ error: 'route not matched' });
  app.post('/register-node', (req, res) => nodesRouter(req, res, _notFound));
  app.post('/heartbeat',     (req, res) => nodesRouter(req, res, _notFound));

  // Expose the live node registry to the master loop for stale-node cleanup
  try { _nodeRegistry = nodesRouter.getRegistry(); } catch (_) {}
} catch (err) {
  console.error('[server-main] Failed to mount node routes:', err.message);
}

// ── Agent registry & management routes ─────────────────────────
try {
  const agentsRouter = require('./routes/agents');
  app.use('/api/agents', agentsRouter);
  console.log('[server-main] Agent registry routes mounted at /api/agents');
} catch (err) {
  console.error('[server-main] Failed to mount agent routes:', err.message);
}

// ── Auth routes (register / login / password-reset) ────────────
try {
  const authRouter = require('./routes/auth');
  app.use('/api/auth', authRouter);
  console.log('[server-main] Auth routes mounted at /api/auth');
} catch (err) {
  console.error('[server-main] Failed to mount auth routes:', err.message);
}

// ── RootIB integration routes ───────────────────────────────────
try {
  const rootibRouter = require('./routes/rootib');
  app.use('/api/rootib', rootibRouter);
  console.log('[server-main] RootIB routes mounted at /api/rootib');
} catch (err) {
  console.error('[server-main] Failed to mount rootib routes:', err.message);
}

// Health check endpoint (Railway health check)
app.get('/', (req, res) => {
  res.json({
    status: 'live',
    service: 'consciousness-revolution',
    timestamp: new Date().toISOString(),
    brain: {
      atoms: 166465,
      resonance: 8
    },
    pattern: '3 → 7 → 13 → ∞',
    alpha: '1/137.035999'
  });
});

app.get('/health', (req, res) => {
  const registry = (() => { try { return require('./services/agent-registry'); } catch (_) { return null; } })();
  const agents   = registry ? registry.listAgents() : [];
  res.json({
    status:  'healthy',
    uptime:  process.uptime(),
    memory:  process.memoryUsage(),
    agents: {
      total:   agents.length,
      healthy: agents.filter(a => a.status !== 'error').length,
      errors:  agents.filter(a => a.status === 'error').length,
    },
  });
});

// Trinity status endpoint
app.get('/api/trinity/status', (req, res) => {
  res.json({
    c1_mechanic: { status: 'active', role: 'Build' },
    c2_architect: { status: 'active', role: 'Design' },
    c3_oracle: { status: 'active', role: 'Validate' },
    convergence: 'C1 × C2 × C3 = ∞'
  });
});

// Brain query endpoint
app.get('/api/brain/query', (req, res) => {
  const query = req.query.q || '';
  res.json({
    query: query,
    result: `Brain query for: ${query}`,
    atoms_searched: 166465,
    note: 'Full brain integration pending - connect to Supabase'
  });
});

// ── Scanner + Webhook status endpoints ─────────────────────────
app.get('/api/scanner/status', (_req, res) => {
  try {
    const scanner = require('./services/scanner-service');
    res.json({ ok: true, ...scanner.status() });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/api/webhook/status', (_req, res) => {
  try {
    const webhook = require('./services/webhook-service');
    res.json({ ok: true, ...webhook.status() });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║       CONSCIOUSNESS REVOLUTION - RAILWAY SERVICE             ║
║                                                              ║
║   Status: LIVE on port ${PORT}                                ║
║   Pattern: 3 → 7 → 13 → ∞                                    ║
║   Alpha: α = 1/137.035999                                    ║
║                                                              ║
║   C1 × C2 × C3 = ∞                                           ║
╚══════════════════════════════════════════════════════════════╝
  `);

  // ── Start self-healing master loop ──────────────────────────────
  try {
    const masterLoop = require('./services/master-loop');
    masterLoop.start(_nodeRegistry);
  } catch (err) {
    console.error('[server-main] Failed to start master loop:', err.message);
  }

  // ── Start webhook heartbeat dispatcher ───────────────────────────
  try {
    const webhookService = require('./services/webhook-service');
    webhookService.start();
  } catch (err) {
    console.error('[server-main] Failed to start webhook service:', err.message);
  }

  // ── Start API spec scanner ───────────────────────────────────────
  try {
    const scannerService = require('./services/scanner-service');
    scannerService.start();
  } catch (err) {
    console.error('[server-main] Failed to start scanner service:', err.message);
  }
});
