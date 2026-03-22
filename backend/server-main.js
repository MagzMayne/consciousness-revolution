// server-main.js - Railway Entry Point
// Created: 2026-03-12 Session 186
// Purpose: Railway expects this file at /app/backend/server-main.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

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
});
