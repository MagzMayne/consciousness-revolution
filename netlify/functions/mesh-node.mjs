/**
 * mesh-node.mjs — EzAutobots Mesh Node Registry (Netlify Function)
 * ════════════════════════════════════════════════════════════════
 * Replaces the Railway backend for the ezAutobots mesh network.
 * Persists the node registry using Netlify Blobs so data survives
 * across function invocations.
 *
 * ENDPOINTS (all under /api/mesh-node or /.netlify/functions/mesh-node):
 *   POST /register-node             — register / update a node
 *   POST /heartbeat                 — node heartbeat + reward logging
 *   GET  /nodes                     — list all registered nodes
 *   POST /deregister-node           — remove a node from the registry
 *   GET  /node-rewards/:nodeId/summary — reward summary for one node
 *   GET  /node-rewards              — mesh-wide reward overview
 *   GET  /user-profiles/:uid/nodes  — nodes owned by a user
 *   GET  /user-profiles/:uid/rewards— rewards for a user's nodes
 *   GET  /health                    — health check
 */

import { getStore } from '@netlify/blobs';

// ── Constants ────────────────────────────────────────────────────────────────

// A node is considered online if it sent a heartbeat in the last 45 s
// (4.5× the client heartbeat interval of 10 s, giving ample grace time)
const ONLINE_THRESHOLD_MS = 45_000;

// Reward formula constants (mirrors backend/routes/node-rewards.js)
const KWH_PRICE_USD        = 0.12;   // $/kWh
const NODE_WATT_ESTIMATE   = 150;    // Watts at full load
const PER_TASK_USD         = 0.002;  // $ per task
const SYSTEM_COST_PER_HOUR = 0.01;   // $ overhead / hr

// CORS headers — open to same-origin fetches from the Netlify site
const CORS_HEADERS = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function jsonOk(data, status = 200) {
    return {
        statusCode: status,
        headers: CORS_HEADERS,
        body: JSON.stringify({ ok: true, ...data }),
    };
}

function jsonErr(message, status = 400) {
    return {
        statusCode: status,
        headers: CORS_HEADERS,
        body: JSON.stringify({ ok: false, error: message }),
    };
}

/** Strip the function/api prefix to get a clean sub-path like /register-node */
function parsePath(event) {
    const raw = event.path || event.rawUrl || '';
    return raw
        .replace(/\?.*$/, '')
        .replace(/^\/.netlify\/functions\/mesh-node/, '')
        .replace(/^\/api\/mesh-node/, '')
        || '/';
}

/** Compute a USD reward for one heartbeat interval */
function computeReward({ intervalSeconds = 30, cpuFraction = 0.5, tasksCompleted = 0 }) {
    const intervalHours  = intervalSeconds / 3600;
    const effectiveWatts = NODE_WATT_ESTIMATE * Math.min(1, Math.max(0, cpuFraction));
    const wattHours      = effectiveWatts * intervalHours;
    const energyCostUSD  = (wattHours / 1000) * KWH_PRICE_USD;
    const taskBonusUSD   = tasksCompleted * PER_TASK_USD;
    const systemCostUSD  = SYSTEM_COST_PER_HOUR * intervalHours;
    const wattHoursTotal = wattHours;
    const netRewardUSD   = Math.max(0, energyCostUSD + taskBonusUSD + systemCostUSD);
    return { netRewardUSD: +netRewardUSD.toFixed(8), wattHours: +wattHoursTotal.toFixed(6) };
}

/** Safely read a JSON blob; returns null on miss or parse error */
async function readBlob(store, key) {
    try {
        const raw = await store.get(key);
        return raw ? JSON.parse(raw) : null;
    } catch (_) {
        return null;
    }
}

/** Safely write a JSON blob */
async function writeBlob(store, key, value) {
    try {
        await store.set(key, JSON.stringify(value));
        return true;
    } catch (_) {
        return false;
    }
}

// ── Netlify Blobs stores ─────────────────────────────────────────────────────
// Returns null if Blobs are unavailable (local dev without netlify-cli context).

function getNodeStore() {
    try { return getStore('mesh-nodes'); } catch (_) { return null; }
}

function getRewardStore() {
    try { return getStore('mesh-rewards'); } catch (_) { return null; }
}

// ── In-memory fallback (used when Blobs are unavailable in local dev) ────────
const _memNodes   = new Map();
const _memRewards = new Map();

// ── Generic node CRUD using whichever store is available ─────────────────────

async function getNode(store, nodeId) {
    if (!store) return _memNodes.get(nodeId) || null;
    return readBlob(store, `node:${nodeId}`);
}

async function saveNode(store, nodeId, data) {
    if (!store) { _memNodes.set(nodeId, data); return; }
    await writeBlob(store, `node:${nodeId}`, data);
}

async function deleteNode(store, nodeId) {
    if (!store) { _memNodes.delete(nodeId); return; }
    try { await store.delete(`node:${nodeId}`); } catch (_) {}
}

async function listNodes(store) {
    if (!store) return [..._memNodes.values()];
    try {
        const { blobs } = await store.list({ prefix: 'node:' });
        const nodes = await Promise.all(
            blobs.map(b => readBlob(store, b.key))
        );
        return nodes.filter(Boolean);
    } catch (_) {
        return [];
    }
}

async function getReward(rStore, nodeId) {
    if (!rStore) return _memRewards.get(nodeId) || null;
    return readBlob(rStore, `reward:${nodeId}`);
}

async function saveReward(rStore, nodeId, data) {
    if (!rStore) { _memRewards.set(nodeId, data); return; }
    await writeBlob(rStore, `reward:${nodeId}`, data);
}

async function listRewards(rStore) {
    if (!rStore) return [..._memRewards.values()];
    try {
        const { blobs } = await rStore.list({ prefix: 'reward:' });
        const rewards = await Promise.all(
            blobs.map(b => readBlob(rStore, b.key))
        );
        return rewards.filter(Boolean);
    } catch (_) {
        return [];
    }
}

// ── Endpoint handlers ─────────────────────────────────────────────────────────

async function handleRegisterNode(body, nStore) {
    const { nodeId } = body || {};
    if (!nodeId || typeof nodeId !== 'string' || nodeId.length > 128) {
        return jsonErr('valid nodeId required (max 128 chars)', 400);
    }

    const nodeType     = (typeof body.nodeType     === 'string') ? body.nodeType.slice(0, 32)     : 'browser';
    const machineName  = (typeof body.machineName  === 'string') ? body.machineName.slice(0, 64)  : 'unknown';
    const capabilities = (body.capabilities && typeof body.capabilities === 'object') ? body.capabilities : {};
    const ownerId      = (typeof body.ownerId      === 'string') ? body.ownerId                   : null;
    const version      = (typeof body.version      === 'string') ? body.version.slice(0, 32)      : null;

    const existing = await getNode(nStore, nodeId);
    const node = {
        nodeId,
        nodeType,
        machineName,
        capabilities,
        ownerId,
        version,
        firstSeen:   existing?.firstSeen || new Date().toISOString(),
        lastSeen:    new Date().toISOString(),
        heartbeats:  existing?.heartbeats || 0,
        status:      'online',
    };

    await saveNode(nStore, nodeId, node);
    return jsonOk({ node, registered: true, success: true });
}

async function handleHeartbeat(body, nStore, rStore) {
    const { nodeId } = body || {};
    if (!nodeId || typeof nodeId !== 'string') {
        return jsonErr('nodeId required', 400);
    }

    const rawCpu      = Number(body.cpu      ?? body.cpuFraction ?? 0.5);
    const rawInterval = Number(body.intervalSeconds ?? 10);
    const cpu         = (!Number.isFinite(rawCpu)      || rawCpu < 0      || rawCpu > 100)    ? 0.5  : rawCpu;
    const interval    = (!Number.isFinite(rawInterval) || rawInterval <= 0)                    ? 10   : rawInterval;
    const cpuFraction = cpu > 1 ? cpu / 100 : cpu; // accept 0-100 or 0-1

    const existing = await getNode(nStore, nodeId);
    const node = {
        nodeId,
        nodeType:     existing?.nodeType     || 'browser',
        machineName:  existing?.machineName  || 'unknown',
        capabilities: existing?.capabilities || {},
        ownerId:      existing?.ownerId      || null,
        version:      existing?.version      || null,
        firstSeen:    existing?.firstSeen    || new Date().toISOString(),
        lastSeen:     new Date().toISOString(),
        heartbeats:   (existing?.heartbeats || 0) + 1,
        cpu:          cpu,
        memory:       body.memory ?? existing?.memory ?? 0,
        realMetrics:  body.realMetrics === true,
        status:       'online',
    };

    await saveNode(nStore, nodeId, node);

    // Log reward
    let rewardEntry = null;
    if (rStore) {
        const reward = computeReward({ intervalSeconds: interval, cpuFraction, tasksCompleted: 0 });
        const existing_r = await getReward(rStore, nodeId) || {
            nodeId,
            totalRewardUSD: 0,
            totalTasks:     0,
            totalSeconds:   0,
            totalWattHours: 0,
            entries:        [],
        };
        existing_r.totalRewardUSD  = +(existing_r.totalRewardUSD + reward.netRewardUSD).toFixed(8);
        existing_r.totalSeconds   += interval;
        existing_r.totalWattHours  = +(existing_r.totalWattHours + reward.wattHours).toFixed(6);

        // Keep last 200 entries as a ring buffer
        existing_r.entries.push({ ts: new Date().toISOString(), ...reward });
        if (existing_r.entries.length > 200) existing_r.entries.shift();

        await saveReward(rStore, nodeId, existing_r);
        rewardEntry = { ...reward, ts: new Date().toISOString() };
    }

    return jsonOk({ node, rewardEntry, success: true });
}

async function handleListNodes(nStore) {
    const allNodes = await listNodes(nStore);
    const now = Date.now();
    const nodes = allNodes.map(n => ({
        ...n,
        status: (now - new Date(n.lastSeen).getTime()) <= ONLINE_THRESHOLD_MS ? 'online' : 'offline',
    }));
    const onlineCount = nodes.filter(n => n.status === 'online').length;
    return jsonOk({ nodes, count: nodes.length, onlineCount });
}

async function handleDeregisterNode(body, nStore) {
    const { nodeId } = body || {};
    if (!nodeId) return jsonErr('nodeId required', 400);

    const existing = await getNode(nStore, nodeId);
    if (existing) {
        existing.status  = 'offline';
        existing.lastSeen = new Date().toISOString();
        await saveNode(nStore, nodeId, existing);
    }

    await deleteNode(nStore, nodeId);
    return jsonOk({ success: true });
}

async function handleRewardSummary(nodeId, rStore) {
    const record = await getReward(rStore, nodeId);
    if (!record) {
        return jsonOk({
            nodeId,
            totalRewardUSD:      0,
            totalTasks:          0,
            totalSeconds:        0,
            totalWattHours:      0,
            estimatedMonthlyUSD: 0,
        });
    }

    const uptimeHours        = record.totalSeconds / 3600;
    const hourlyRate         = uptimeHours > 0 ? record.totalRewardUSD / uptimeHours : 0;
    const estimatedMonthlyUSD = +(hourlyRate * 24 * 30).toFixed(6);

    return jsonOk({
        nodeId,
        totalRewardUSD:       +record.totalRewardUSD.toFixed(8),
        totalTasks:            record.totalTasks,
        totalSeconds:          record.totalSeconds,
        totalWattHours:       +record.totalWattHours.toFixed(6),
        estimatedMonthlyUSD,
    });
}

async function handleRewardLeaderboard(rStore, query) {
    const limit = Math.min(50, parseInt(query?.limit || '20', 10));
    const allRewards = await listRewards(rStore);

    const poolTotalUSD = allRewards.reduce((s, r) => s + (r.totalRewardUSD || 0), 0);

    const nodes = allRewards
        .map(r => ({
            nodeId:        r.nodeId,
            totalRewardUSD: +r.totalRewardUSD.toFixed(8),
            totalTasks:     r.totalTasks || 0,
            totalSeconds:   r.totalSeconds || 0,
        }))
        .sort((a, b) => b.totalRewardUSD - a.totalRewardUSD)
        .slice(0, limit);

    return jsonOk({ count: allRewards.length, poolTotalUSD: +poolTotalUSD.toFixed(8), nodes });
}

async function handleUserNodes(userId, nStore) {
    const allNodes = await listNodes(nStore);
    const now = Date.now();

    // Admin gets all nodes
    if (userId === 'admin') {
        const nodes = allNodes.map(n => ({
            ...n,
            status: (now - new Date(n.lastSeen).getTime()) <= ONLINE_THRESHOLD_MS ? 'online' : 'offline',
        }));
        return jsonOk({ nodeCount: nodes.length, totalNodes: nodes.length, nodes });
    }

    const userNodes = allNodes
        .filter(n => n.ownerId === userId)
        .map(n => ({
            ...n,
            status: (now - new Date(n.lastSeen).getTime()) <= ONLINE_THRESHOLD_MS ? 'online' : 'offline',
        }));
    return jsonOk({ nodeCount: userNodes.length, nodes: userNodes });
}

async function handleUserRewards(userId, rStore, nStore) {
    const allNodes = await listNodes(nStore);

    // Admin gets aggregate across ALL nodes
    const targetNodeIds = userId === 'admin'
        ? allNodes.map(n => n.nodeId)
        : allNodes.filter(n => n.ownerId === userId).map(n => n.nodeId);

    let totalRewardUSD = 0;
    let totalTasks     = 0;
    let totalWattHours = 0;
    let totalSeconds   = 0;

    for (const nid of targetNodeIds) {
        const r = await getReward(rStore, nid);
        if (r) {
            totalRewardUSD  += r.totalRewardUSD  || 0;
            totalTasks      += r.totalTasks      || 0;
            totalWattHours  += r.totalWattHours  || 0;
            totalSeconds    += r.totalSeconds    || 0;
        }
    }

    const uptimeHours         = totalSeconds / 3600;
    const hourlyRate          = uptimeHours > 0 ? totalRewardUSD / uptimeHours : 0;
    const estimatedMonthlyUSD = +(hourlyRate * 24 * 30).toFixed(6);

    return jsonOk({
        userId,
        totalRewardUSD:        +totalRewardUSD.toFixed(8),
        totalTasks,
        totalWattHours:        +totalWattHours.toFixed(6),
        estimatedMonthlyUSD,
        // Admin-friendly aliases
        grandTotalRewardUSD:   +totalRewardUSD.toFixed(8),
        grandTotalTasks:       totalTasks,
        grandTotalWattHours:   +totalWattHours.toFixed(6),
        totalNodes:            targetNodeIds.length,
        totalUsers:            userId === 'admin' ? new Set(allNodes.map(n => n.ownerId).filter(Boolean)).size : 1,
    });
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function handler(event) {
    // CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: CORS_HEADERS, body: '' };
    }

    const path   = parsePath(event);
    const method = event.httpMethod || 'GET';
    const query  = event.queryStringParameters || {};

    let body = {};
    try { if (event.body) body = JSON.parse(event.body); } catch (_) {}

    // Health check — no storage required
    if (path === '/health' && method === 'GET') {
        return jsonOk({ status: 'healthy', service: 'mesh-node', timestamp: new Date().toISOString() });
    }

    // Open stores (gracefully degrade to in-memory if Blobs unavailable)
    const nStore = getNodeStore();
    const rStore = getRewardStore();

    // ── Route dispatch ───────────────────────────────────────────────────────

    if (path === '/register-node' && method === 'POST') {
        return handleRegisterNode(body, nStore);
    }

    if (path === '/heartbeat' && method === 'POST') {
        return handleHeartbeat(body, nStore, rStore);
    }

    if (path === '/nodes' && method === 'GET') {
        return handleListNodes(nStore);
    }

    if (path === '/deregister-node' && method === 'POST') {
        return handleDeregisterNode(body, nStore);
    }

    // GET /node-rewards/:nodeId/summary
    const rewardSummaryMatch = path.match(/^\/node-rewards\/([^/]+)\/summary$/);
    if (rewardSummaryMatch && method === 'GET') {
        const nodeId = decodeURIComponent(rewardSummaryMatch[1]);
        return handleRewardSummary(nodeId, rStore);
    }

    // GET /node-rewards (leaderboard)
    if (path === '/node-rewards' && method === 'GET') {
        return handleRewardLeaderboard(rStore, query);
    }

    // GET /user-profiles/:userId/nodes
    const userNodesMatch = path.match(/^\/user-profiles\/([^/]+)\/nodes$/);
    if (userNodesMatch && method === 'GET') {
        const userId = decodeURIComponent(userNodesMatch[1]);
        return handleUserNodes(userId, nStore);
    }

    // GET /user-profiles/:userId/rewards
    const userRewardsMatch = path.match(/^\/user-profiles\/([^/]+)\/rewards$/);
    if (userRewardsMatch && method === 'GET') {
        const userId = decodeURIComponent(userRewardsMatch[1]);
        return handleUserRewards(userId, rStore, nStore);
    }

    return jsonErr(`Unknown endpoint: ${method} ${path}`, 404);
}
