// backend/routes/nodes.js
// EzAutobots distributed node management
// Handles registration, heartbeats, and task-result reports from local compute nodes.
// Automatically logs reward entries via node-rewards.js.

'use strict';

const express = require('express');
const router  = express.Router();

// Lazy-load node-rewards so a missing file never breaks node endpoints.
let rewardsModule = null;
function getRewards() {
  if (rewardsModule) return rewardsModule;
  try {
    rewardsModule = require('./node-rewards');
  } catch (err) {
    console.error('[nodes] node-rewards not available:', err.message);
    rewardsModule = false; // don't retry
  }
  return rewardsModule || null;
}

// ── In-memory node registry ─────────────────────────────────────
// Map<nodeId, { lastSeen, uptimeSeconds, heartbeats, tasks, capabilities, ... }>
const nodeRegistry = new Map();

function upsertNode(nodeId, patch = {}) {
  if (!nodeRegistry.has(nodeId)) {
    nodeRegistry.set(nodeId, {
      nodeId,
      firstSeen:    new Date().toISOString(),
      lastSeen:     new Date().toISOString(),
      heartbeats:   0,
      tasks:        0,
      uptimeSeconds: 0,
      cpuFraction:  0.5,
      type:         'unknown',
      os:           'unknown',
      label:        null,
      capabilities: {}
    });
  }
  const n = nodeRegistry.get(nodeId);
  Object.assign(n, patch, { lastSeen: new Date().toISOString() });
  return n;
}

// ── POST /nodes/register-node ───────────────────────────────────
// Body: { nodeId, type?, os?, label?, capabilities?, publicKey? }
// Creates or updates the node's registration with capability metadata.
function handleRegisterNode(req, res) {
  const { nodeId } = req.body || {};
  if (!nodeId || typeof nodeId !== 'string' || nodeId.length > 128) {
    return res.status(400).json({ error: 'valid nodeId required (max 128 chars)' });
  }

  const type         = (typeof req.body.type  === 'string') ? req.body.type.slice(0, 32)  : 'browser';
  const os           = (typeof req.body.os    === 'string') ? req.body.os.slice(0, 32)    : 'unknown';
  const label        = (typeof req.body.label === 'string') ? req.body.label.slice(0, 64) : null;
  const capabilities = (req.body.capabilities && typeof req.body.capabilities === 'object')
    ? req.body.capabilities : {};

  const node = upsertNode(nodeId, { type, os, label, capabilities });
  res.json({ success: true, node, registered: true });
}

router.post('/register-node', handleRegisterNode);

// ── POST /nodes/heartbeat ───────────────────────────────────────
// Body: { nodeId, cpuFraction?, intervalSeconds? }
// Side-effect: auto-logs a compute reward for the interval.
function handleHeartbeat(req, res) {
  const { nodeId } = req.body || {};
  if (!nodeId) return res.status(400).json({ error: 'nodeId required' });

  const rawInterval = Number(req.body.intervalSeconds);
  const rawCpu      = Number(req.body.cpuFraction);
  const interval    = (!Number.isFinite(rawInterval) || rawInterval <= 0) ? 30 : rawInterval;
  const cpu         = (!Number.isFinite(rawCpu) || rawCpu < 0 || rawCpu > 1) ? 0.5 : rawCpu;

  const node = upsertNode(nodeId, {
    heartbeats:   (nodeRegistry.get(nodeId)?.heartbeats || 0) + 1,
    uptimeSeconds:(nodeRegistry.get(nodeId)?.uptimeSeconds || 0) + interval,
    cpuFraction:  cpu
  });

  // Auto-log reward
  let rewardEntry = null;
  const rw = getRewards();
  if (rw) {
    try {
      const breakdown = rw.computeReward({ intervalSeconds: interval, cpuFraction: cpu, tasksCompleted: 0, nodeId });
      rewardEntry = rw.addEntry(nodeId, breakdown);
    } catch (err) {
      console.error('[nodes] heartbeat reward error:', err.message);
    }
  }

  res.json({ success: true, node, rewardEntry });
}

router.post('/heartbeat', handleHeartbeat);

// ── POST /nodes/task-result ─────────────────────────────────────
// Body: { nodeId, taskId, success?, intervalSeconds?, complexityMultiplier? }
// Side-effect: auto-logs a task-completion reward.
router.post('/task-result', (req, res) => {
  const { nodeId, taskId } = req.body || {};
  const taskSuccess = req.body.success !== false;
  if (!nodeId) return res.status(400).json({ error: 'nodeId required' });
  if (!taskId) return res.status(400).json({ error: 'taskId required' });

  const rawInterval    = Number(req.body.intervalSeconds);
  const rawComplexity  = Number(req.body.complexityMultiplier);
  const intervalSeconds   = (!Number.isFinite(rawInterval)   || rawInterval   < 0) ? 0   : rawInterval;
  const complexityMultiplier = (!Number.isFinite(rawComplexity) || rawComplexity < 0) ? 1.0 : rawComplexity;

  const node = upsertNode(nodeId, {
    tasks: (nodeRegistry.get(nodeId)?.tasks || 0) + (taskSuccess ? 1 : 0)
  });

  // Auto-log reward for task completion
  let rewardEntry = null;
  const rw = getRewards();
  if (rw && taskSuccess) {
    try {
      const breakdown = rw.computeReward({
        intervalSeconds,
        cpuFraction:         node.cpuFraction || 0.5,
        tasksCompleted:      1,
        complexityMultiplier,
        nodeId
      });
      rewardEntry = rw.addEntry(nodeId, breakdown);
    } catch (err) {
      console.error('[nodes] task-result reward error:', err.message);
    }
  }

  res.json({ success: true, node, rewardEntry });
});

// ── GET /nodes ─────────────────────────────────────────────────
// List all registered nodes (basic info).
router.get('/', (req, res) => {
  const limit = Math.min(100, parseInt(req.query.limit || '50', 10));
  const nodes = [...nodeRegistry.values()]
    .sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen))
    .slice(0, limit);
  res.json({ count: nodes.length, nodes });
});

// ── GET /nodes/:nodeId ─────────────────────────────────────────
router.get('/:nodeId', (req, res) => {
  const node = nodeRegistry.get(req.params.nodeId);
  if (!node) return res.status(404).json({ error: 'Node not found' });
  res.json(node);
});

module.exports = router;
