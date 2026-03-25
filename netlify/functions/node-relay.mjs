/**
 * node-relay.mjs — EzAutobots Mesh Node Task Relay
 * ════════════════════════════════════════════════════════════════
 * © 2024-2026 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 * ════════════════════════════════════════════════════════════════
 *
 * Fallback coordinator: when a Netlify function fails due to exhausted
 * API credits, rate-limits (429), or service unavailability (402/503),
 * clients submit tasks here.  Idle mesh nodes running at
 * https://barbrickdesign.github.io/ezAutobots.html poll this endpoint,
 * claim tasks, process them locally, and post results back.
 *
 * Persistence: Netlify Blobs store 'relay-tasks'
 * (falls back to an in-memory Map in local dev)
 *
 * ENDPOINTS  (all under /api/node-relay  or  /.netlify/functions/node-relay):
 *   POST /submit            — client submits a task for the mesh
 *   GET  /pending-tasks     — mesh node polls for claimable tasks
 *   POST /claim             — mesh node claims a task (marks in-progress)
 *   POST /complete          — mesh node posts a completed result
 *   GET  /status/:taskId    — client polls for task completion / result
 *   GET  /stats             — relay queue statistics
 *   GET  /health            — health check
 */

import { getStore } from '@netlify/blobs';

// ── Constants ────────────────────────────────────────────────────────────────

/** Tasks older than this without a result are considered failed */
const TASK_TTL_MS       = 5 * 60 * 1000;   // 5 minutes

/** Tasks claimed but not completed within this window are re-queued */
const CLAIM_TIMEOUT_MS  = 60 * 1000;       // 60 seconds

/** Maximum tasks returned in one /pending-tasks response */
const BATCH_SIZE        = 5;

/** Maximum payload size a task may carry (bytes, after JSON serialisation) */
const MAX_PAYLOAD_BYTES = 64 * 1024;       // 64 KB

/** Allowlisted task types that mesh nodes can process */
const ALLOWED_TASK_TYPES = new Set(['echo', 'relay-request', 'queued-payload', 'compute']);

/** Maximum lengths for free-text fields */
const MAX_ORIGIN_URL_LEN = 256;
const MAX_REASON_LEN     = 256;

const CORS_HEADERS = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Node-Id',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function jsonOk(data, status = 200) {
    return { statusCode: status, headers: CORS_HEADERS, body: JSON.stringify({ ok: true, ...data }) };
}

function jsonErr(message, status = 400) {
    return { statusCode: status, headers: CORS_HEADERS, body: JSON.stringify({ ok: false, error: message }) };
}

function parsePath(event) {
    const raw = event.path || event.rawUrl || '';
    return raw
        .replace(/\?.*$/, '')
        .replace(/^\/.netlify\/functions\/node-relay/, '')
        .replace(/^\/api\/node-relay/, '')
        || '/';
}

function nowIso() { return new Date().toISOString(); }

// ── Netlify Blobs store ──────────────────────────────────────────────────────

const _memTasks = new Map();   // in-memory fallback for local dev

function getTaskStore() {
    try { return getStore('relay-tasks'); } catch (_) { return null; }
}

async function readBlob(store, key) {
    try {
        const raw = await store.get(key);
        return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
}

async function writeBlob(store, key, value) {
    try { await store.set(key, JSON.stringify(value)); return true; } catch (_) { return false; }
}

async function getTask(store, taskId) {
    if (!store) return _memTasks.get(taskId) || null;
    return readBlob(store, `task:${taskId}`);
}

async function saveTask(store, taskId, data) {
    if (!store) { _memTasks.set(taskId, data); return; }
    await writeBlob(store, `task:${taskId}`, data);
}

async function deleteTask(store, taskId) {
    if (!store) { _memTasks.delete(taskId); return; }
    try { await store.delete(`task:${taskId}`); } catch (_) {}
}

async function listTasks(store) {
    if (!store) return [..._memTasks.values()];
    try {
        const { blobs } = await store.list({ prefix: 'task:' });
        const tasks = await Promise.all(blobs.map(b => readBlob(store, b.key)));
        return tasks.filter(Boolean);
    } catch (_) { return []; }
}

// ── GC: expire old / timed-out tasks ────────────────────────────────────────

async function gcTasks(store) {
    const all  = await listTasks(store);
    const now  = Date.now();
    for (const task of all) {
        const age  = now - new Date(task.submittedAt).getTime();
        const claimAge = task.claimedAt ? now - new Date(task.claimedAt).getTime() : 0;

        if (task.status === 'complete' && age > TASK_TTL_MS) {
            await deleteTask(store, task.taskId);
        } else if (task.status === 'failed' && age > TASK_TTL_MS) {
            await deleteTask(store, task.taskId);
        } else if (task.status === 'in-progress' && claimAge > CLAIM_TIMEOUT_MS) {
            // Re-queue timed-out claimed tasks
            task.status    = 'pending';
            task.claimedBy = null;
            task.claimedAt = null;
            task.retries   = (task.retries || 0) + 1;
            await saveTask(store, task.taskId, task);
        }
    }
}

// ── Unique task ID ───────────────────────────────────────────────────────────

function makeTaskId() {
    const arr = new Uint8Array(12);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        crypto.getRandomValues(arr);
    } else {
        for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
    }
    return 'rtask_' + Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Endpoint handlers ────────────────────────────────────────────────────────

/**
 * POST /submit
 * Client (or failing Netlify function) submits a task.
 *
 * Body: {
 *   type: string,          // task type, e.g. 'echo', 'compute', 'prompt'
 *   payload: any,          // task-specific data (must be JSON-serialisable)
 *   priority?: 'low'|'normal'|'high',
 *   originUrl?: string,    // which Netlify function fell back (for diagnostics)
 *   reason?: string,       // why the fallback was triggered (e.g. '429 rate_limit')
 *   ttlMs?: number,        // optional custom TTL (capped at TASK_TTL_MS)
 * }
 */
async function handleSubmit(body, store) {
    const type = (typeof body.type === 'string') ? body.type.slice(0, 64) : null;
    if (!type) return jsonErr('task type required');
    if (!ALLOWED_TASK_TYPES.has(type)) {
        return jsonErr(`unsupported task type: "${type}". Allowed: ${[...ALLOWED_TASK_TYPES].join(', ')}`);
    }

    const payloadStr = JSON.stringify(body.payload ?? null);
    if (payloadStr.length > MAX_PAYLOAD_BYTES) {
        return jsonErr(`payload too large (max ${MAX_PAYLOAD_BYTES} bytes)`);
    }

    const taskId = makeTaskId();
    const task = {
        taskId,
        type,
        payload:     body.payload ?? null,
        priority:    ['low', 'normal', 'high'].includes(body.priority) ? body.priority : 'normal',
        originUrl:   typeof body.originUrl === 'string' ? body.originUrl.slice(0, MAX_ORIGIN_URL_LEN) : null,
        reason:      typeof body.reason    === 'string' ? body.reason.slice(0, MAX_REASON_LEN)        : null,
        status:      'pending',
        submittedAt: nowIso(),
        claimedBy:   null,
        claimedAt:   null,
        completedAt: null,
        result:      null,
        retries:     0,
    };

    await saveTask(store, taskId, task);
    return jsonOk({ taskId, status: 'pending', message: 'Task queued for mesh nodes' }, 202);
}

/**
 * GET /pending-tasks
 * Mesh node polls for available work.
 * Query: ?nodeId=<nodeId>&capabilities[]=echo&capabilities[]=compute
 */
async function handlePendingTasks(query, store) {
    await gcTasks(store);

    const all      = await listTasks(store);
    const nodeId   = query?.nodeId || 'unknown';
    const caps     = [].concat(query?.['capabilities[]'] || query?.capabilities || []);

    const pending  = all
        .filter(t => t.status === 'pending')
        .filter(t => caps.length === 0 || caps.includes(t.type) || caps.includes('*'))
        .sort((a, b) => {
            // High priority first, then FIFO
            const pri = { high: 0, normal: 1, low: 2 };
            const pd  = (pri[a.priority] ?? 1) - (pri[b.priority] ?? 1);
            return pd !== 0 ? pd : new Date(a.submittedAt) - new Date(b.submittedAt);
        })
        .slice(0, BATCH_SIZE)
        .map(t => ({
            taskId:      t.taskId,
            type:        t.type,
            payload:     t.payload,
            priority:    t.priority,
            submittedAt: t.submittedAt,
        }));

    return jsonOk({ tasks: pending, count: pending.length, nodeId });
}

/**
 * POST /claim
 * Mesh node claims a specific task to prevent duplicate processing.
 *
 * Body: { taskId: string, nodeId: string }
 */
async function handleClaim(body, store) {
    const { taskId, nodeId } = body || {};
    if (!taskId || !nodeId) return jsonErr('taskId and nodeId required');

    const task = await getTask(store, taskId);
    if (!task)                        return jsonErr('task not found', 404);
    if (task.status !== 'pending')    return jsonErr(`task already ${task.status}`, 409);

    task.status    = 'in-progress';
    task.claimedBy = String(nodeId).slice(0, 128);
    task.claimedAt = nowIso();
    await saveTask(store, taskId, task);

    return jsonOk({ taskId, status: 'in-progress', message: 'Task claimed' });
}

/**
 * POST /complete
 * Mesh node posts the result of a completed task.
 *
 * Body: {
 *   taskId: string,
 *   nodeId: string,
 *   result: any,         // task output (must be JSON-serialisable)
 *   error?: string|null, // set to a string if the task failed
 * }
 */
async function handleComplete(body, store) {
    const { taskId, nodeId } = body || {};
    if (!taskId || !nodeId) return jsonErr('taskId and nodeId required');

    const task = await getTask(store, taskId);
    if (!task) return jsonErr('task not found', 404);

    // Verify ownership before modifying any state
    if (task.claimedBy && task.claimedBy !== String(nodeId).slice(0, 128)) {
        return jsonErr('task claimed by a different node', 403);
    }

    const hasError = typeof body.error === 'string' && body.error.length > 0;

    task.status      = hasError ? 'failed' : 'complete';
    task.completedAt = nowIso();
    task.result      = body.result ?? null;
    task.errorMsg    = hasError ? body.error.slice(0, 512) : null;
    await saveTask(store, taskId, task);

    return jsonOk({ taskId, status: task.status });
}

/**
 * GET /status/:taskId
 * Client polls for task completion.
 */
async function handleStatus(taskId, store) {
    const task = await getTask(store, taskId);
    if (!task) return jsonErr('task not found', 404);

    const out = {
        taskId:      task.taskId,
        status:      task.status,
        type:        task.type,
        priority:    task.priority,
        submittedAt: task.submittedAt,
        claimedBy:   task.claimedBy,
        completedAt: task.completedAt,
    };
    if (task.status === 'complete') out.result   = task.result;
    if (task.status === 'failed')   out.errorMsg = task.errorMsg;
    return jsonOk(out);
}

/**
 * GET /stats
 * Returns aggregate statistics about the relay queue.
 */
async function handleStats(store) {
    await gcTasks(store);
    const all = await listTasks(store);
    const counts = { pending: 0, 'in-progress': 0, complete: 0, failed: 0 };
    for (const t of all) counts[t.status] = (counts[t.status] || 0) + 1;
    return jsonOk({ total: all.length, ...counts });
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function handler(event) {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: CORS_HEADERS, body: '' };
    }

    const path   = parsePath(event);
    const method = event.httpMethod || 'GET';
    const query  = event.queryStringParameters || {};

    let body = {};
    try { if (event.body) body = JSON.parse(event.body); } catch (_) {}

    // Health — no store needed
    if (path === '/health' && method === 'GET') {
        return jsonOk({ status: 'healthy', service: 'node-relay', timestamp: nowIso() });
    }

    const store = getTaskStore();

    if (path === '/submit' && method === 'POST') {
        return handleSubmit(body, store);
    }

    if (path === '/pending-tasks' && method === 'GET') {
        return handlePendingTasks(query, store);
    }

    if (path === '/claim' && method === 'POST') {
        return handleClaim(body, store);
    }

    if (path === '/complete' && method === 'POST') {
        return handleComplete(body, store);
    }

    const statusMatch = path.match(/^\/status\/(.+)$/);
    if (statusMatch && method === 'GET') {
        return handleStatus(decodeURIComponent(statusMatch[1]), store);
    }

    if (path === '/stats' && method === 'GET') {
        return handleStats(store);
    }

    return jsonErr(`Unknown endpoint: ${method} ${path}`, 404);
}
