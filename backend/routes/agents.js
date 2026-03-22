// backend/routes/agents.js
// REST API for the consciousness-revolution agent registry.
//
// ENDPOINTS:
//   GET  /api/agents                    — list all registered agents
//   GET  /api/agents/:id                — get one agent by ID
//   POST /api/agents/register           — register a new agent
//   POST /api/agents/:id/heartbeat      — record agent heartbeat
//   GET  /api/agents/status             — registry health summary
//   POST /api/mesh/patch                — enqueue a file patch

'use strict';

const express  = require('express');
const router   = express.Router();
const registry = require('../services/agent-registry');
const loop     = require('../services/master-loop');

// ── GET /api/agents ───────────────────────────────────────────────────────
router.get('/', (_req, res) => {
  const agents = registry.listAgents();
  res.json({ ok: true, count: agents.length, agents });
});

// ── GET /api/agents/status ────────────────────────────────────────────────
router.get('/status', (_req, res) => {
  const agents  = registry.listAgents();
  const healthy = agents.filter(a => a.status !== 'error').length;
  const errors  = agents.filter(a => a.status === 'error').length;
  res.json({
    ok: true,
    summary: {
      total:   agents.length,
      healthy,
      errors,
      status:  errors === 0 ? 'healthy' : 'degraded',
    },
    agents,
  });
});

// ── GET /api/agents/:id ───────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const agent = registry.getAgent(req.params.id);
  if (!agent) {
    return res.status(404).json({ ok: false, error: 'Agent not found' });
  }
  res.json({ ok: true, agent });
});

// ── POST /api/agents/register ─────────────────────────────────────────────
router.post('/register', (req, res) => {
  const { id, role } = req.body || {};
  if (!id || typeof id !== 'string' || id.length > 64) {
    return res.status(400).json({ ok: false, error: 'valid id required (max 64 chars)' });
  }
  const cleanId   = id.trim();
  const cleanRole = typeof role === 'string' ? role.slice(0, 128) : 'unknown';

  const { registered, agent } = registry.registerAgent(cleanId, cleanRole);
  res.status(registered ? 201 : 200).json({ ok: true, registered, agent });
});

// ── POST /api/agents/:id/heartbeat ────────────────────────────────────────
router.post('/:id/heartbeat', (req, res) => {
  const agent = registry.agentHeartbeat(req.params.id);
  if (!agent) {
    return res.status(404).json({ ok: false, error: 'Agent not found' });
  }
  res.json({ ok: true, agent });
});

// ── POST /api/mesh/patch (mounted under /api/agents but logically separate) ─
// Allows external callers to queue a file patch for filePatchAgent.
router.post('/patch', (req, res) => {
  const { filePath, oldContent, newContent } = req.body || {};
  if (!filePath || !oldContent || !newContent) {
    return res.status(400).json({ ok: false, error: 'filePath, oldContent and newContent required' });
  }
  loop.enqueuePatch({ filePath, oldContent, newContent });
  res.json({ ok: true, queued: true, filePath });
});

module.exports = router;
