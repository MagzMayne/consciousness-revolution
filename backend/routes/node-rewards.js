// backend/routes/node-rewards.js
// EzAutobots node-reward ledger
// Tracks USD-denominated rewards for distributed compute contributors.
//
// Reward formula:
//   effectiveWatts   = NODE_WATT_ESTIMATE * cpuFraction
//   wattHours        = effectiveWatts * intervalHours
//   energyCostUSD    = (wattHours / 1000) * KWH_PRICE_USD
//   taskBonusUSD     = tasksCompleted * PER_TASK_USD * complexityMultiplier
//   systemCostUSD    = SYSTEM_COST_PER_HOUR * intervalHours
//   fairnessMultiplier = clamp(nodeShare / avgShare, 0.5, 3.0)
//   netRewardUSD     = max(0, (energyCostUSD + taskBonusUSD + systemCostUSD) * fairnessMultiplier)
//
// All tunable via env vars.

'use strict';

const express = require('express');
const router  = express.Router();

// ── Tunable constants (override via env) ────────────────────────
const KWH_PRICE_USD        = parseFloat(process.env.KWH_PRICE_USD        || '0.12');   // $/kWh
const NODE_WATT_ESTIMATE   = parseFloat(process.env.NODE_WATT_ESTIMATE   || '150');    // Watts at full load
const PER_TASK_USD         = parseFloat(process.env.PER_TASK_USD         || '0.002');  // $ per task
const SYSTEM_COST_PER_HOUR = parseFloat(process.env.SYSTEM_COST_PER_HOUR || '0.01');  // $ overhead/hr
const MAX_NODES            = parseInt( process.env.MAX_NODES             || '5000', 10);
const MAX_ENTRIES_PER_NODE = parseInt( process.env.MAX_ENTRIES_PER_NODE  || '500',  10);

// ── In-memory ledger ────────────────────────────────────────────
// Map<nodeId, { entries: RewardEntry[], totalUSD: number, totalTasks: number, totalSeconds: number }>
const ledger = new Map();

// Global mesh stats (for fairness calculation)
let meshStats = {
  totalNodes:  0,
  totalTasks:  0,
  totalUSD:    0.0,
  lastUpdated: Date.now()
};

// ── Helpers ─────────────────────────────────────────────────────

function getOrCreate(nodeId) {
  if (!ledger.has(nodeId)) {
    if (ledger.size >= MAX_NODES) {
      // Evict the oldest-inserted node (FIFO — Map preserves insertion order)
      ledger.delete(ledger.keys().next().value);
    }
    ledger.set(nodeId, { entries: [], totalUSD: 0, totalTasks: 0, totalSeconds: 0 });
  }
  return ledger.get(nodeId);
}

function computeReward({ intervalSeconds = 30, cpuFraction = 0.5, tasksCompleted = 0, complexityMultiplier = 1.0, nodeId }) {
  const intervalHours = intervalSeconds / 3600;

  const effectiveWatts = NODE_WATT_ESTIMATE * Math.min(1, Math.max(0, cpuFraction));
  const wattHours      = effectiveWatts * intervalHours;
  const energyCostUSD  = (wattHours / 1000) * KWH_PRICE_USD;
  const taskBonusUSD   = tasksCompleted * PER_TASK_USD * Math.max(0.1, complexityMultiplier);
  const systemCostUSD  = SYSTEM_COST_PER_HOUR * intervalHours;

  // Fairness: compare this node's historical tasks to the current mesh average
  // Using only historical totals (pre-call) to keep the calculation consistent.
  const record      = nodeId ? getOrCreate(nodeId) : null;
  const avgShare    = meshStats.totalNodes > 0 ? meshStats.totalTasks / meshStats.totalNodes : 1;
  const nodeShare   = record ? record.totalTasks : 0;
  const fairness    = avgShare > 0 ? Math.min(3.0, Math.max(0.5, nodeShare / avgShare)) : 1.0;

  const gross    = energyCostUSD + taskBonusUSD + systemCostUSD;
  const netReward = Math.max(0, gross * fairness);

  return {
    intervalSeconds,
    cpuFraction,
    tasksCompleted,
    complexityMultiplier,
    energyCostUSD:   +energyCostUSD.toFixed(6),
    taskBonusUSD:    +taskBonusUSD.toFixed(6),
    systemCostUSD:   +systemCostUSD.toFixed(6),
    fairnessMultiplier: +fairness.toFixed(4),
    netRewardUSD:    +netReward.toFixed(6)
  };
}

function addEntry(nodeId, breakdown) {
  const record = getOrCreate(nodeId);

  const entry = {
    ts:                new Date().toISOString(),
    ...breakdown
  };

  // Ring-buffer: keep last MAX_ENTRIES_PER_NODE
  record.entries.push(entry);
  if (record.entries.length > MAX_ENTRIES_PER_NODE) record.entries.shift();

  record.totalUSD     += breakdown.netRewardUSD;
  record.totalTasks   += breakdown.tasksCompleted || 0;
  record.totalSeconds += breakdown.intervalSeconds || 0;

  // Update mesh stats
  meshStats.totalNodes  = ledger.size;
  meshStats.totalTasks += breakdown.tasksCompleted || 0;
  meshStats.totalUSD   += breakdown.netRewardUSD;
  meshStats.lastUpdated = Date.now();

  return entry;
}

// ── Routes ──────────────────────────────────────────────────────

// POST /node-rewards/log — manually log a reward interval
// Body: { nodeId, intervalSeconds?, cpuFraction?, tasksCompleted?, complexityMultiplier? }
router.post('/log', (req, res) => {
  const { nodeId, intervalSeconds, cpuFraction, tasksCompleted, complexityMultiplier } = req.body || {};
  if (!nodeId) return res.status(400).json({ error: 'nodeId required' });

  const breakdown = computeReward({
    intervalSeconds:     intervalSeconds     !== undefined ? Number(intervalSeconds)     : 30,
    cpuFraction:         cpuFraction         !== undefined ? Number(cpuFraction)         : 0.5,
    tasksCompleted:      tasksCompleted      !== undefined ? Number(tasksCompleted)      : 0,
    complexityMultiplier: complexityMultiplier !== undefined ? Number(complexityMultiplier) : 1.0,
    nodeId
  });

  const entry = addEntry(nodeId, breakdown);
  res.json({ success: true, entry });
});

// GET /node-rewards/:nodeId — full entry history
router.get('/:nodeId', (req, res) => {
  const { nodeId } = req.params;
  const record = ledger.get(nodeId);
  if (!record) return res.status(404).json({ error: 'Node not found' });
  res.json({ nodeId, ...record });
});

// GET /node-rewards/:nodeId/summary — aggregated USD / task counts
router.get('/:nodeId/summary', (req, res) => {
  const { nodeId } = req.params;
  const record = ledger.get(nodeId);
  if (!record) {
    return res.json({
      nodeId,
      totalUSD: 0,
      totalTasks: 0,
      totalSeconds: 0,
      uptimeHours: 0,
      estMonthlyUSD: 0,
      entryCount: 0
    });
  }

  const uptimeHours  = record.totalSeconds / 3600;
  const rate         = uptimeHours > 0 ? record.totalUSD / uptimeHours : 0;
  const estMonthlyUSD = +(rate * 24 * 30).toFixed(4);

  res.json({
    nodeId,
    totalUSD:       +record.totalUSD.toFixed(6),
    totalTasks:     record.totalTasks,
    totalSeconds:   record.totalSeconds,
    uptimeHours:    +uptimeHours.toFixed(4),
    estMonthlyUSD,
    entryCount:     record.entries.length
  });
});

// GET /node-rewards — mesh-level overview + top nodes
router.get('/', (req, res) => {
  const limit = Math.min(50, parseInt(req.query.limit || '20', 10));

  const nodes = [...ledger.entries()]
    .map(([nodeId, r]) => ({ nodeId, totalUSD: +r.totalUSD.toFixed(6), totalTasks: r.totalTasks, totalSeconds: r.totalSeconds }))
    .sort((a, b) => b.totalUSD - a.totalUSD)
    .slice(0, limit);

  res.json({
    mesh: {
      totalNodes:  meshStats.totalNodes,
      totalTasks:  meshStats.totalTasks,
      totalUSD:    +meshStats.totalUSD.toFixed(6),
      lastUpdated: new Date(meshStats.lastUpdated).toISOString()
    },
    nodes
  });
});

module.exports = router;
module.exports.computeReward = computeReward;
module.exports.addEntry      = addEntry;
