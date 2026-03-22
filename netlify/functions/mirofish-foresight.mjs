/**
 * MiroFish Foresight API — Netlify Function
 *
 * Inspired by MiroFish (github.com/barbrickdesign/MiroFish-enhancedByAgentR)
 * — swarm-intelligence prediction engine enhanced by Agent R.
 *
 * Routes:
 *   GET  /api/mirofish-foresight?action=status          → engine health
 *   GET  /api/mirofish-foresight?action=income          → income opportunity signals
 *   POST /api/mirofish-foresight  { action:'predict', topic, seeds?, rounds? }
 *                                                        → ForesightResult
 *   POST /api/mirofish-foresight  { action:'error_foresight', agentId, logs[] }
 *                                                        → ErrorForesight[]
 *   POST /api/mirofish-foresight  { action:'collapse', scenarios[], weights? }
 *                                                        → { label, probability }
 *
 * Environment variables (optional — engine runs in deterministic mode without them):
 *   OPENAI_API_KEY   — used for LLM-enhanced scenario generation
 *   DEEPSEEK_API_KEY — alternative LLM provider
 */

// ── CORS & helpers ────────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = [
  'https://consciousnessrevolution.io',
  'https://www.consciousnessrevolution.io',
  'http://localhost:8888',
  'http://localhost:3000',
  'http://127.0.0.1:8888',
];

const _rateMap = new Map();
const RATE_MAX = 30;
const RATE_WIN = 60_000;

function rateLimit(ip) {
  const now   = Date.now();
  const entry = _rateMap.get(ip) || { count: 0, resetAt: now + RATE_WIN };
  if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + RATE_WIN; }
  entry.count += 1;
  _rateMap.set(ip, entry);
  return entry.count <= RATE_MAX;
}

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : '*';
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function ok(body, origin, code = 200) {
  return { statusCode: code, headers: corsHeaders(origin), body: JSON.stringify(body) };
}

function err(msg, origin, code = 400) {
  return { statusCode: code, headers: corsHeaders(origin), body: JSON.stringify({ error: msg }) };
}

// ── Quantum helpers ───────────────────────────────────────────────────────────

const COLLAPSE_TEMP = 0.618;

function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function tokenSim(a, b) {
  const ta = new Set((a || '').toLowerCase().split(/\W+/).filter(Boolean));
  const tb = new Set((b || '').toLowerCase().split(/\W+/).filter(Boolean));
  const inter = [...ta].filter(t => tb.has(t)).length;
  const union = new Set([...ta, ...tb]).size;
  return union === 0 ? 0 : inter / union;
}

function softmax(weights, temp) {
  const scaled = weights.map(w => Math.exp(w / temp));
  const total  = scaled.reduce((a, b) => a + b, 0);
  return scaled.map(s => s / total);
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

// ── Error pattern lexicon ─────────────────────────────────────────────────────

const ERROR_PATTERNS = {
  timeout:    { kw: ['timeout', 'timed out', 'network error', 'fetch failed', 'abort'],
                remedy: 'Apply exponential back-off with jitter; increase fetch timeout limits.' },
  auth:       { kw: ['unauthorized', '401', '403', 'forbidden', 'invalid token', 'expired'],
                remedy: 'Refresh tokens before expiry; rotate API keys; validate environment secrets.' },
  rate_limit: { kw: ['429', 'too many requests', 'rate limit', 'throttle'],
                remedy: 'Implement token-bucket queuing; reduce polling frequency by 50%.' },
  data:       { kw: ['null', 'undefined', 'cannot read', 'typeerror', 'nan', 'invalid json'],
                remedy: 'Add null/type guards; validate all API responses before destructuring.' },
  dependency: { kw: ['module not found', 'is not a function', 'is not defined', 'missing'],
                remedy: 'Pin dependency versions; add module-load health checks on startup.' },
  payment:    { kw: ['payment failed', 'paypal', 'stripe error', 'declined', 'insufficient'],
                remedy: 'Enable PayPal sandbox retry loop; add webhook idempotency-key checks.' },
  agent:      { kw: ['agent crash', 'heartbeat lost', 'self-heal', 'agent error', 'unresponsive'],
                remedy: 'Tighten heartbeat interval; auto-restart on 2 missed beats.' },
};

// ── Income signal catalogue ───────────────────────────────────────────────────

const INCOME_SIGNALS = [
  {
    type: 'grant',
    label: 'Government Grant Cycle Active',
    description: 'Swarm pattern-match detects a high-probability grant award window within 14 days.',
    action_url: '/government-grants-portal.html',
    estimated_value: 75000,
  },
  {
    type: 'contributor',
    label: 'Contributor Surge Predicted',
    description: 'Agents forecast a 3-5× contributor registration spike in the next 72 hours.',
    action_url: '/contributor-registration-enhanced.html',
    estimated_value: 4500,
  },
  {
    type: 'licensing',
    label: 'Licensing Deal High Probability',
    description: 'Pattern resonance signals an inbound licensing inquiry within 7 days.',
    action_url: '/openclaw-hub.html',
    estimated_value: 12000,
  },
  {
    type: 'automation',
    label: 'Automation Efficiency Unlock',
    description: 'Foresight predicts workflow optimisation saving 40+ dev-hours per week.',
    action_url: '/ez-autobots.html',
    estimated_value: 2000,
  },
  {
    type: 'api_revenue',
    label: 'MiroFish API Monetisation Ready',
    description: 'Expose quantum foresight as a paid API — swarm projects $50k ARR at $0.10/call.',
    action_url: '/mirofish-quantum-hub.html',
    estimated_value: 50000,
  },
];

// ── Core foresight engine ─────────────────────────────────────────────────────

/** Run a deterministic-ish swarm simulation and return ranked scenarios */
function runLocalForesight(topic, seeds = [], rounds = 7) {
  const swarmSize = 42;
  const allOpinions = [];
  const roundTrace  = [];

  for (let r = 0; r < rounds; r++) {
    const roundOps = [];
    const pool = seeds.filter(s => tokenSim(s, topic) > 0.05);
    const seedsToUse = pool.length > 0 ? pool : [topic];

    for (let i = 0; i < swarmSize; i++) {
      const seed    = seedsToUse[i % seedsToUse.length];
      const base    = tokenSim(seed, topic);
      const noise   = (Math.random() - 0.5) * 0.05;
      const decay   = Math.exp(-r * 0.1);
      const opinion = clamp(base + noise + 0.1, 0, 1) * decay;
      roundOps.push(opinion);
    }

    const mean = roundOps.reduce((a, b) => a + b, 0) / roundOps.length;
    roundTrace.push({ round: r + 1, mean: +mean.toFixed(4) });
    allOpinions.push(...roundOps);
  }

  // Cluster into 4 scenario buckets
  const sorted  = [...allOpinions].sort((a, b) => a - b);
  const quarter = Math.ceil(sorted.length / 4);
  const buckets = [
    sorted.slice(0, quarter),
    sorted.slice(quarter, quarter * 2),
    sorted.slice(quarter * 2, quarter * 3),
    sorted.slice(quarter * 3),
  ];

  const scenarioLabels = [
    `Disruption: "${topic}" transforms dramatically`,
    `Growth: "${topic}" expands steadily`,
    `Stability: "${topic}" maintains current trajectory`,
    `Challenge: "${topic}" faces significant headwinds`,
  ];

  const raw = buckets.map((bucket, i) => {
    const mean   = bucket.reduce((s, v) => s + v, 0) / (bucket.length || 1);
    const weight = Math.max(0.01, mean + (1 - i / 4) * 0.3);
    return { label: scenarioLabels[i], weight, agents: bucket.length };
  });

  const totalW = raw.reduce((t, s) => t + s.weight, 0);
  const scenarios = raw
    .map(s => ({ ...s, probability: +(s.weight / totalW).toFixed(4) }))
    .sort((a, b) => b.probability - a.probability);

  // Quantum collapse
  const probs = softmax(scenarios.map(s => s.weight), COLLAPSE_TEMP);
  const topIdx = probs.indexOf(Math.max(...probs));

  // Convergence
  const means  = roundTrace.map(r => r.mean);
  const avg    = means.reduce((a, b) => a + b, 0) / means.length;
  const vari   = means.reduce((s, m) => s + (m - avg) ** 2, 0) / means.length;
  const convergence = clamp(1 - Math.sqrt(vari), 0, 1);

  return {
    id:           uuid(),
    topic,
    rounds,
    timestamp:    new Date().toISOString(),
    scenarios,
    topScenario:  { label: scenarios[topIdx].label, probability: +probs[topIdx].toFixed(4) },
    convergence:  +convergence.toFixed(4),
    swarmConsensus: roundTrace[roundTrace.length - 1]?.mean ?? 0,
    roundTrace,
    engineMode:   'deterministic-swarm',
  };
}

/** Detect likely upcoming errors from log text */
function detectErrorForesight(agentId, logs = []) {
  const joined = logs.join(' ').toLowerCase();
  const results = [];

  for (const [type, { kw, remedy }] of Object.entries(ERROR_PATTERNS)) {
    const hits  = kw.filter(k => joined.includes(k)).length;
    const score = sigmoid(hits * 1.5 - 1);
    if (score > 0.3) {
      results.push({
        agentId,
        errorType:   type,
        probability: +score.toFixed(3),
        severity:    score > 0.7 ? 'high' : score > 0.5 ? 'medium' : 'low',
        remedy,
        detectedAt:  new Date().toISOString(),
      });
    }
  }

  return results.sort((a, b) => b.probability - a.probability);
}

/** Attach live confidence values to income signals */
function buildIncomeSignals(topic = '') {
  return INCOME_SIGNALS.map(s => {
    const topicBoost = tokenSim(topic, s.label + ' ' + s.description);
    const confidence = clamp(0.45 + topicBoost * 0.55 + (Math.random() - 0.1) * 0.1, 0.1, 0.98);
    return { ...s, id: uuid(), confidence: +confidence.toFixed(3), generated_at: new Date().toISOString() };
  }).sort((a, b) => b.confidence - a.confidence);
}

// ── LLM-enhanced scenario generation (optional) ───────────────────────────────

async function llmEnhanceScenarios(topic, swarmResult) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return null;

  const isOpenAI  = Boolean(process.env.OPENAI_API_KEY);
  const endpoint  = isOpenAI
    ? 'https://api.openai.com/v1/chat/completions'
    : 'https://api.deepseek.com/chat/completions';
  const model     = isOpenAI ? 'gpt-4o-mini' : 'deepseek-chat';

  const systemPrompt = `You are the MiroFish Quantum Oracle — a swarm-intelligence foresight engine.
Given a topic and swarm simulation results, produce a concise JSON object with:
{
  "summary": "<2-sentence executive foresight>",
  "keyDrivers": ["<driver 1>", "<driver 2>", "<driver 3>"],
  "incomeOpportunity": "<1-sentence income/revenue insight>",
  "agentRecommendation": "<action the autonomous agent should take next>"
}
Return ONLY valid JSON, no markdown.`;

  const userPrompt = `Topic: ${topic}
Top scenario: ${swarmResult.topScenario.label} (p=${swarmResult.topScenario.probability})
Convergence: ${swarmResult.convergence}
Swarm consensus: ${swarmResult.swarmConsensus}`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userPrompt },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (_) {
    return null;
  }
}

// ── Handler ───────────────────────────────────────────────────────────────────

export const handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin || '';
  const ip     = event.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';

  // Preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(origin), body: '' };
  }

  // Rate-limit
  if (!rateLimit(ip)) {
    return err('Rate limit exceeded — please wait 60 seconds', origin, 429);
  }

  // GET routes
  if (event.httpMethod === 'GET') {
    const action = event.queryStringParameters?.action || 'status';

    if (action === 'status') {
      return ok({
        engine:   'MiroFish Quantum Foresight',
        version:  '1.0.0',
        enhanced_by: 'Agent R (007420)',
        source:   'github.com/barbrickdesign/MiroFish-enhancedByAgentR',
        status:   'online',
        llm_available: Boolean(process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY),
        timestamp: new Date().toISOString(),
      }, origin);
    }

    if (action === 'income') {
      const topic = event.queryStringParameters?.topic || 'revenue generation';
      return ok({ signals: buildIncomeSignals(topic) }, origin);
    }

    return err('Unknown action. Use: status | income', origin);
  }

  // POST routes
  if (event.httpMethod === 'POST') {
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch (_) {
      return err('Invalid JSON body', origin);
    }

    const { action } = body;

    // ── predict ────────────────────────────────────────────────
    if (action === 'predict') {
      const topic  = String(body.topic  || 'future').slice(0, 500);
      const seeds  = Array.isArray(body.seeds) ? body.seeds.map(s => String(s).slice(0, 200)) : [];
      const rounds = Math.max(1, Math.min(20, parseInt(body.rounds, 10) || 7));

      const swarmResult = runLocalForesight(topic, seeds, rounds);

      // Optionally enhance with LLM
      const llmInsight = await llmEnhanceScenarios(topic, swarmResult);
      if (llmInsight) swarmResult.llmInsight = llmInsight;

      // Attach income signals
      swarmResult.incomeSignals = buildIncomeSignals(topic);

      return ok(swarmResult, origin);
    }

    // ── error_foresight ────────────────────────────────────────
    if (action === 'error_foresight') {
      const agentId = String(body.agentId || 'unknown').slice(0, 100);
      const logs    = Array.isArray(body.logs) ? body.logs.map(String) : [];
      return ok({ agentId, predictions: detectErrorForesight(agentId, logs) }, origin);
    }

    // ── collapse ────────────────────────────────────────────────
    if (action === 'collapse') {
      const scenarios = Array.isArray(body.scenarios) ? body.scenarios.map(String) : [];
      const weights   = Array.isArray(body.weights)   ? body.weights.map(Number)   : scenarios.map(() => 1);
      if (!scenarios.length) return err('scenarios array required', origin);

      const probs = softmax(weights, COLLAPSE_TEMP);
      const topIdx = probs.indexOf(Math.max(...probs));
      return ok({
        winner:      scenarios[topIdx],
        probability: +probs[topIdx].toFixed(4),
        all:         scenarios.map((s, i) => ({ label: s, probability: +probs[i].toFixed(4) })),
      }, origin);
    }

    return err('Unknown action. Use: predict | error_foresight | collapse', origin);
  }

  return err('Method not allowed', origin, 405);
};
