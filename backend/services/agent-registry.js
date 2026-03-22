// backend/services/agent-registry.js
// Agent registry / MeshDiscovery for consciousness-revolution backend
// Mirrors the agent registration system seen in the barbrickdesign.github.io
// Railway backend logs, ported to this repository.

'use strict';

// ── In-memory agent store ────────────────────────────────────────────────────
// Map<agentId, AgentRecord>
const agentMap = new Map();

const DEFAULT_AGENTS = [
  { id: 'openaiAgent',            role: 'AI completions / embeddings'          },
  { id: 'paypalAgent',            role: 'PayPal payment lifecycle'              },
  { id: 'protocolEnforcerAgent',  role: 'Frontend ↔ backend event-type sync'   },
  { id: 'repoCommitAgent',        role: 'Commit self-healed patches to git'     },
  { id: 'solanaAgent',            role: 'Solana wallet / SPL token ops'         },
  { id: 'walletAgent',            role: 'Multi-chain wallet gateway'            },
  { id: 'filePatchAgent',         role: 'Apply queued file patches'             },
  { id: 'frontendRebuildAgent',   role: 'Validate & refresh frontend assets'    },
  { id: 'dashboardRepairAgent',   role: 'Repair required DOM elements'          },
  { id: 'backendReloadAgent',     role: 'Safe in-process backend reload'        },
  { id: 'meshProjectPageAgent',   role: 'Inject mesh-engine-client into pages'  },
  { id: 'nodeCleanupAgent',       role: 'Evict stale mesh nodes'                },
  { id: 'codeGenAgent',           role: 'Regenerate missing heartbeat files'    },
];

// ── AgentRecord shape ────────────────────────────────────────────────────────
function makeRecord(id, role, extra = {}) {
  return {
    id,
    role,
    status:       'idle',
    registeredAt: new Date().toISOString(),
    lastHeartbeat: null,
    heartbeats:   0,
    runs:         0,
    errors:       0,
    ...extra,
  };
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Register an agent.  If already present, skips and returns false.
 * Returns { registered: boolean, agent: AgentRecord }.
 */
function registerAgent(id, role = 'unknown', extra = {}) {
  if (agentMap.has(id)) {
    console.log(`[MeshDiscovery] Agent "${id}" already registered — skipping`);
    return { registered: false, agent: agentMap.get(id) };
  }
  const record = makeRecord(id, role, extra);
  agentMap.set(id, record);
  console.log(`[MeshDiscovery] Agent "${id}" registered`);
  return { registered: true, agent: record };
}

/**
 * Record a heartbeat from an agent.
 */
function agentHeartbeat(id) {
  const agent = agentMap.get(id);
  if (!agent) return null;
  agent.lastHeartbeat = new Date().toISOString();
  agent.heartbeats   += 1;
  agent.status        = 'active';
  return agent;
}

/**
 * Update agent status after a run.
 */
function recordRun(id, { success = true } = {}) {
  const agent = agentMap.get(id);
  if (!agent) return null;
  agent.runs  += 1;
  if (!success) agent.errors += 1;
  agent.status = success ? 'idle' : 'error';
  return agent;
}

/**
 * Set transient status on an agent (e.g. 'running').
 */
function setStatus(id, status) {
  const agent = agentMap.get(id);
  if (agent) agent.status = status;
}

/** Return a snapshot of all registered agents. */
function listAgents() {
  return Array.from(agentMap.values());
}

/** Return a single agent record or null. */
function getAgent(id) {
  return agentMap.get(id) || null;
}

/**
 * Bootstrap the default agent list on first start.
 * Called once by master-loop.js at startup.
 */
function bootstrapDefaults() {
  let registered = 0;
  for (const { id, role } of DEFAULT_AGENTS) {
    const { registered: wasNew } = registerAgent(id, role);
    if (wasNew) registered++;
  }
  console.log(`[MeshDiscovery] Bootstrap complete — ${registered} new / ${DEFAULT_AGENTS.length - registered} already present`);
}

module.exports = {
  registerAgent,
  agentHeartbeat,
  recordRun,
  setStatus,
  listAgents,
  getAgent,
  bootstrapDefaults,
  DEFAULT_AGENTS,
};
