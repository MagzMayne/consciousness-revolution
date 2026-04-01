/**
 * diykits.mjs — DIY Kits Mesh Backend (Netlify Function)
 * ═══════════════════════════════════════════════════════
 * Serves as the backend for DIYkits.html (DIY Kits Mesh subscription
 * and distribution dashboard).  Persists data using Netlify Blobs so
 * records survive across function invocations.
 *
 * ENDPOINTS (all under /api/diykits or /.netlify/functions/diykits):
 *   GET  /health                      — health check
 *   GET  /config                      — PayPal client ID + subscription plan IDs
 *   GET  /subscriptions[?status=active] — list subscriptions
 *   POST /subscriptions               — create a new subscription
 *   GET  /team                        — list team members
 *   POST /team                        — add a team member
 *   GET  /jobs                        — list assembly jobs
 *   POST /jobs/:id/claim              — claim a job (set status → claimed)
 *   POST /jobs/:id/complete           — complete a job (set status → done)
 *   GET  /bom                         — computed bill-of-materials
 *
 * Environment variables (Netlify dashboard → Site settings → Env vars):
 *   PAYPAL_CLIENT_ID              — PayPal REST app client ID
 *   DIYKITS_PAYPAL_PLAN_STARTER   — PayPal subscription plan ID for Starter tier
 *   DIYKITS_PAYPAL_PLAN_MAKER     — PayPal subscription plan ID for Maker tier
 *   DIYKITS_PAYPAL_PLAN_PRO       — PayPal subscription plan ID for Pro tier
 *   DIYKITS_PAYPAL_PLAN_ROTATION  — PayPal subscription plan ID for Rotation tier
 *
 * Author: BarbrickDesign (BarbrickDesign@gmail.com)
 */

import { getStore } from '@netlify/blobs';
import { randomBytes } from 'crypto';

// ── Constants ─────────────────────────────────────────────────────────────────

const VALID_TIERS   = new Set(['starter', 'maker', 'pro', 'rotation', 'classroom', 'campus']);
const VALID_STATUSES = new Set(['open', 'claimed', 'done']);

/** Parts required per kit tier (mirrors the frontend partsPerTier constant) */
const PARTS_PER_TIER = {
  starter:   [{ part: 'Basic sensor/module', qtyPerKit: 1 }, { part: 'Jumper wires set', qtyPerKit: 1 }],
  maker:     [{ part: 'Peripherals (2–3)', qtyPerKit: 3 }, { part: 'Jumper wires set', qtyPerKit: 1 }, { part: 'Mounting hardware pack', qtyPerKit: 1 }],
  pro:       [{ part: 'Advanced module (AI/GPS/etc.)', qtyPerKit: 2 }, { part: 'Motor/actuator', qtyPerKit: 1 }, { part: 'Power accessories', qtyPerKit: 1 }],
  rotation:  [{ part: 'Board (Arduino/RPi)', qtyPerKit: 1 }, { part: 'Peripherals bundle', qtyPerKit: 3 }, { part: 'Cables & adapters', qtyPerKit: 1 }],
  classroom: [{ part: 'Student kit (sensor + module)', qtyPerKit: 1 }, { part: 'Jumper wires set', qtyPerKit: 1 }, { part: 'Classroom guide booklet', qtyPerKit: 1 }],
  campus:    [{ part: 'Student kit (sensor + module)', qtyPerKit: 1 }, { part: 'Jumper wires set', qtyPerKit: 1 }, { part: 'Curriculum coordinator pack', qtyPerKit: 1 }],
};

const TIER_LABELS = {
  starter:   'Starter Kit Club',
  maker:     'Maker Kit Club',
  pro:       'Pro Lab Club',
  rotation:  'Board Rotation Club',
  classroom: 'Classroom Lab',
  campus:    'Campus Lab',
};

// ── CORS ──────────────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

// ── Response helpers ─────────────────────────────────────────────────────────

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

// ── Path parsing ──────────────────────────────────────────────────────────────

function parsePath(event) {
  const raw = event.path || event.rawUrl || '';
  return raw
    .replace(/\?.*$/, '')
    .replace(/^\/.netlify\/functions\/diykits/, '')
    .replace(/^\/api\/diykits/, '')
    || '/';
}

// ── Netlify Blobs store helpers ───────────────────────────────────────────────

// In-memory fallback maps for local development (when Blobs are unavailable)
const _memSubscriptions = new Map();
const _memTeam          = new Map();
const _memJobs          = new Map();

function getSubStore()  { try { return getStore('diykits-subscriptions'); } catch (e) { console.warn('[diykits] Blobs unavailable (subscriptions):', e.message); return null; } }
function getTeamStore() { try { return getStore('diykits-team');          } catch (e) { console.warn('[diykits] Blobs unavailable (team):', e.message);          return null; } }
function getJobStore()  { try { return getStore('diykits-jobs');          } catch (e) { console.warn('[diykits] Blobs unavailable (jobs):', e.message);           return null; } }

async function readBlob(store, key) {
  try {
    const raw = await store.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn(`[diykits] readBlob error (key=${key}):`, e.message);
    return null;
  }
}

async function writeBlob(store, key, value) {
  try {
    await store.set(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn(`[diykits] writeBlob error (key=${key}):`, e.message);
    return false;
  }
}

async function listBlobs(store, prefix) {
  try {
    const { blobs } = await store.list({ prefix });
    const items = await Promise.all(blobs.map(b => readBlob(store, b.key)));
    return items.filter(Boolean);
  } catch (_) {
    return [];
  }
}

// ── Generic CRUD wrappers (Blobs + mem fallback) ──────────────────────────────

async function listAll(store, memMap, prefix) {
  if (!store) return [...memMap.values()];
  return listBlobs(store, prefix);
}

async function readOne(store, memMap, key) {
  if (!store) return memMap.get(key) || null;
  return readBlob(store, key);
}

async function saveOne(store, memMap, key, value) {
  if (!store) { memMap.set(key, value); return; }
  await writeBlob(store, key, value);
}

// ── Subscription handlers ─────────────────────────────────────────────────────

async function handleListSubscriptions(store, query) {
  const all = await listAll(store, _memSubscriptions, 'sub:');
  const statusFilter = query?.status;
  const subs = statusFilter
    ? all.filter(s => (s.status || 'active') === statusFilter)
    : all;
  subs.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  return jsonOk({ subscriptions: subs, count: subs.length });
}

async function handleCreateSubscription(body, store) {
  const name  = typeof body?.name  === 'string' ? body.name.trim().slice(0, 128)  : '';
  const email = typeof body?.email === 'string' ? body.email.trim().slice(0, 256) : '';
  const tier  = typeof body?.tier  === 'string' ? body.tier.toLowerCase()          : '';

  if (!name)               return jsonErr('name is required');
  if (!VALID_TIERS.has(tier)) return jsonErr(`tier must be one of: ${[...VALID_TIERS].join(', ')}`);

  const ppSubId = typeof body?.paypal_subscription_id === 'string'
    ? body.paypal_subscription_id.slice(0, 128)
    : null;

  const id = `sub-${Date.now()}-${randomBytes(6).toString('hex')}`;
  const record = {
    id,
    name,
    email,
    tier,
    paypal_subscription_id: ppSubId,
    status:     'active',
    created_at: new Date().toISOString(),
  };

  await saveOne(store, _memSubscriptions, `sub:${id}`, record);
  return jsonOk({ success: true, subscription: record }, 201);
}

// ── Team handlers ─────────────────────────────────────────────────────────────

async function handleListTeam(store) {
  const team = await listAll(store, _memTeam, 'member:');
  team.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
  return jsonOk({ team, count: team.length });
}

async function handleAddTeamMember(body, store) {
  const name  = typeof body?.name  === 'string' ? body.name.trim().slice(0, 128) : '';
  const role  = typeof body?.role  === 'string' ? body.role.trim().slice(0, 64)  : 'Assembler';
  const email = typeof body?.email === 'string' ? body.email.trim().slice(0, 256) : '';

  if (!name) return jsonErr('name is required');

  const id = `m-${Date.now()}-${randomBytes(6).toString('hex')}`;
  const member = {
    id,
    name,
    role: role || 'Assembler',
    email,
    jobs_claimed_count: 0,
    jobs_done_count:    0,
    created_at: new Date().toISOString(),
  };

  await saveOne(store, _memTeam, `member:${id}`, member);
  return jsonOk({ success: true, member }, 201);
}

// ── Job helpers ───────────────────────────────────────────────────────────────

/** Build/merge the job list from current subscriptions and existing job records */
async function buildJobs(subStore, jobStore) {
  const subs = await listAll(subStore, _memSubscriptions, 'sub:');
  const activeSubs = subs.filter(s => (s.status || 'active') === 'active');

  // Count by tier
  const counts = {};
  for (const s of activeSubs) {
    const t = s.tier;
    if (VALID_TIERS.has(t)) counts[t] = (counts[t] || 0) + 1;
  }

  // Load existing job records
  const existingJobs = await listAll(jobStore, _memJobs, 'job:');
  const byId = Object.fromEntries(existingJobs.map(j => [j.id, j]));

  const jobs = [];
  for (const [tier, qty] of Object.entries(counts)) {
    const id = `job-${tier}`;
    const existing = byId[id];
    const label = `Assemble ${TIER_LABELS[tier] || tier} kits`;
    jobs.push(existing
      ? { ...existing, qty, label }
      : { id, label, tier, qty, status: 'open', assigned_to: '', created_at: new Date().toISOString() });
  }

  return jobs;
}

async function handleListJobs(subStore, jobStore) {
  const jobs = await buildJobs(subStore, jobStore);
  return jsonOk({ jobs, count: jobs.length });
}

async function handleClaimJob(jobId, body, subStore, jobStore) {
  const memberId = typeof body?.team_member_id === 'string' ? body.team_member_id.trim() : '';
  if (!memberId) return jsonErr('team_member_id is required');

  const jobs = await buildJobs(subStore, jobStore);
  const job  = jobs.find(j => j.id === jobId);
  if (!job) return jsonErr(`job '${jobId}' not found`, 404);
  if (job.status !== 'open') return jsonErr(`job '${jobId}' is not open (status: ${job.status})`);

  const updated = { ...job, status: 'claimed', assigned_to: memberId, claimed_at: new Date().toISOString() };
  await saveOne(jobStore, _memJobs, `job:${jobId}`, updated);

  return jsonOk({ success: true, job: updated });
}

async function handleCompleteJob(jobId, body, subStore, jobStore, teamStore) {
  const memberId = typeof body?.team_member_id === 'string' ? body.team_member_id.trim() : '';

  const jobs = await buildJobs(subStore, jobStore);
  const job  = jobs.find(j => j.id === jobId);
  if (!job) return jsonErr(`job '${jobId}' not found`, 404);
  if (job.status === 'done') return jsonErr(`job '${jobId}' is already done`);

  const updated = {
    ...job,
    status:      'done',
    assigned_to: memberId || job.assigned_to,
    completed_at: new Date().toISOString(),
  };
  await saveOne(jobStore, _memJobs, `job:${jobId}`, updated);

  // Increment team member stats
  if (memberId) {
    const member = await readOne(teamStore, _memTeam, `member:${memberId}`);
    if (member) {
      member.jobs_done_count = (member.jobs_done_count || 0) + 1;
      await saveOne(teamStore, _memTeam, `member:${memberId}`, member);
    }
  }

  return jsonOk({ success: true, job: updated });
}

// ── BOM handler ───────────────────────────────────────────────────────────────

async function handleBom(subStore) {
  const subs = await listAll(subStore, _memSubscriptions, 'sub:');
  const activeSubs = subs.filter(s => (s.status || 'active') === 'active');

  // Aggregate parts
  const counts = {};
  for (const s of activeSubs) {
    if (VALID_TIERS.has(s.tier)) counts[s.tier] = (counts[s.tier] || 0) + 1;
  }

  const aggregate = new Map();
  for (const [tier, count] of Object.entries(counts)) {
    for (const { part, qtyPerKit } of (PARTS_PER_TIER[tier] || [])) {
      const existing = aggregate.get(part) || { qty: 0, tiers: [] };
      existing.qty += qtyPerKit * count;
      if (!existing.tiers.includes(tier)) existing.tiers.push(tier);
      aggregate.set(part, existing);
    }
  }

  const items = [...aggregate.entries()].map(([name, { qty, tiers }]) => ({
    name,
    tiers,
    total_qty_required: qty,
  }));

  return jsonOk({ bom: { items, generated_at: new Date().toISOString() } });
}

// ── Config handler ────────────────────────────────────────────────────────────

function handleConfig() {
  const clientId = process.env.PAYPAL_CLIENT_ID || '';
  const planIds = {
    starter:  process.env.DIYKITS_PAYPAL_PLAN_STARTER  || '',
    maker:    process.env.DIYKITS_PAYPAL_PLAN_MAKER    || '',
    pro:      process.env.DIYKITS_PAYPAL_PLAN_PRO      || '',
    rotation: process.env.DIYKITS_PAYPAL_PLAN_ROTATION || '',
  };
  return jsonOk({ paypal_client_id: clientId, plan_ids: planIds });
}

// ── Main handler ──────────────────────────────────────────────────────────────

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  const subPath = parsePath(event);
  const method  = event.httpMethod;
  const qs      = event.queryStringParameters || {};

  // Parse body once
  let body = {};
  if (event.body) {
    try { body = JSON.parse(event.body); } catch (_) {
      return jsonErr('Invalid JSON in request body', 400);
    }
  }

  // Lazy-initialise stores
  const subStore  = getSubStore();
  const teamStore = getTeamStore();
  const jobStore  = getJobStore();

  // ── GET /health ─────────────────────────────────────────────────────────────
  if (method === 'GET' && subPath === '/health') {
    return jsonOk({
      status:    'ready',
      service:   'diykits',
      timestamp: new Date().toISOString(),
    });
  }

  // ── GET /config ─────────────────────────────────────────────────────────────
  if (method === 'GET' && subPath === '/config') {
    return handleConfig();
  }

  // ── GET /subscriptions ──────────────────────────────────────────────────────
  if (method === 'GET' && subPath === '/subscriptions') {
    return handleListSubscriptions(subStore, qs);
  }

  // ── POST /subscriptions ─────────────────────────────────────────────────────
  if (method === 'POST' && subPath === '/subscriptions') {
    return handleCreateSubscription(body, subStore);
  }

  // ── GET /team ───────────────────────────────────────────────────────────────
  if (method === 'GET' && subPath === '/team') {
    return handleListTeam(teamStore);
  }

  // ── POST /team ──────────────────────────────────────────────────────────────
  if (method === 'POST' && subPath === '/team') {
    return handleAddTeamMember(body, teamStore);
  }

  // ── GET /jobs ───────────────────────────────────────────────────────────────
  if (method === 'GET' && subPath === '/jobs') {
    return handleListJobs(subStore, jobStore);
  }

  // ── POST /jobs/:id/claim ────────────────────────────────────────────────────
  const claimMatch = subPath.match(/^\/jobs\/([^/]+)\/claim$/);
  if (method === 'POST' && claimMatch) {
    return handleClaimJob(claimMatch[1], body, subStore, jobStore);
  }

  // ── POST /jobs/:id/complete ─────────────────────────────────────────────────
  const completeMatch = subPath.match(/^\/jobs\/([^/]+)\/complete$/);
  if (method === 'POST' && completeMatch) {
    return handleCompleteJob(completeMatch[1], body, subStore, jobStore, teamStore);
  }

  // ── GET /bom ────────────────────────────────────────────────────────────────
  if (method === 'GET' && subPath === '/bom') {
    return handleBom(subStore);
  }

  return jsonErr(`Not found: ${method} ${subPath}`, 404);
};
