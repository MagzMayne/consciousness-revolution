'use strict';

/**
 * api-gateway/index.js
 *
 * Express HTTP/JSON API gateway for the Agentic Finance intent interface.
 *
 * Endpoints:
 *   POST /v1/intent           - Submit or simulate an intent
 *   GET  /v1/lineage/:id      - Retrieve a lineage record
 *   GET  /v1/health           - Health probe
 *   GET  /v1/kill-switch      - Read kill-switch status
 *   POST /v1/kill-switch      - Update kill-switch state
 */

const crypto = require('crypto');
const express = require('express');
const path = require('path');

// ---------------------------------------------------------------------------
// Core engine + adapters
// ---------------------------------------------------------------------------
const { IntentEngine, createIntent, InMemoryLineageStore } = require(
  path.resolve(__dirname, '../../packages/core-intent-engine/index')
);
const { X402BaseAdapter } = require(
  path.resolve(__dirname, '../../packages/adapters/adapter-x402-base/index')
);
const { EvmGenericAdapter } = require(
  path.resolve(__dirname, '../../packages/adapters/adapter-evm-generic/index')
);
const { BridgeAdapter } = require(
  path.resolve(__dirname, '../../packages/adapters/adapter-bridge/index')
);
const { KillSwitchManager } = require('./kill-switch');

// ---------------------------------------------------------------------------
// Singleton instances
// ---------------------------------------------------------------------------
const lineageStore = new InMemoryLineageStore();
const killSwitch = new KillSwitchManager();

const engine = new IntentEngine({
  adapters: [
    new X402BaseAdapter(),
    new EvmGenericAdapter(),
    new BridgeAdapter(),
  ],
  lineageStore,
  riskEnvelopes: {},
});

// ---------------------------------------------------------------------------
// App factory
// ---------------------------------------------------------------------------
function createApp() {
  const app = express();

  // JSON body parsing
  app.use(express.json());

  // ---------------------------------------------------------------------------
  // API key authentication middleware
  // Uses constant-time comparison to prevent timing-based key enumeration.
  // ---------------------------------------------------------------------------
  app.use((req, res, next) => {
    const configuredKeys = process.env.AGENT_FINANCE_API_KEYS;

    // If no keys are configured, allow all traffic (open dev mode)
    if (!configuredKeys) return next();

    const validKeys = configuredKeys
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    if (validKeys.length === 0) return next();

    const provided = req.headers['x-api-key'] || '';

    // Constant-time comparison against each configured key to prevent
    // timing-based enumeration attacks
    const isValid = validKeys.some((key) => {
      try {
        // Pad both to the same length so timingSafeEqual never throws
        const maxLen = Math.max(provided.length, key.length);
        const a = Buffer.from(provided.padEnd(maxLen, '\0'));
        const b = Buffer.from(key.padEnd(maxLen, '\0'));
        // Buffers must be same length for timingSafeEqual
        if (a.length !== b.length) return false;
        return crypto.timingSafeEqual(a, b);
      } catch (_) {
        return false;
      }
    });

    if (!isValid) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or missing x-api-key' });
    }

    next();
  });

  // ---------------------------------------------------------------------------
  // POST /v1/intent
  // ---------------------------------------------------------------------------
  app.post('/v1/intent', async (req, res) => {
    const { agent_id, intent_type, parameters, context, mode } = req.body || {};

    // Validate required fields
    if (!agent_id) {
      return res.status(400).json({ error: 'agent_id is required' });
    }
    if (!intent_type) {
      return res.status(400).json({ error: 'intent_type is required' });
    }
    if (!parameters) {
      return res.status(400).json({ error: 'parameters is required' });
    }

    // Kill switch checks
    if (killSwitch.isGlobalKilled()) {
      return res.status(503).json({ error: 'Service unavailable', message: 'Global kill switch is active' });
    }
    if (killSwitch.isAgentKilled(agent_id)) {
      return res.status(503).json({ error: 'Service unavailable', message: `Kill switch is active for agent "${agent_id}"` });
    }

    // Build the intent object
    let intent;
    try {
      intent = createIntent({
        id: `intent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        agentId: agent_id,
        intentType: intent_type,
        parameters,
        context: context || {},
      });
    } catch (err) {
      return res.status(400).json({ error: 'Invalid intent', message: err.message });
    }

    try {
      if (mode === 'simulate') {
        const result = await engine.simulate(intent);

        // Check backend kill switch after adapter is selected
        if (killSwitch.isBackendKilled(result.adapter)) {
          return res.status(503).json({
            error: 'Service unavailable',
            message: `Kill switch is active for backend "${result.adapter}"`,
          });
        }

        return res.json({
          status: 'simulated',
          intent: result.intent,
          adapter: result.adapter,
          simulationResult: result.simulationResult,
          riskDecision: result.riskDecision,
        });
      } else {
        // simulate_and_execute (default)
        // Simulate once, check backend kill switch, then execute reusing the result
        const simResult = await engine.simulate(intent);
        if (killSwitch.isBackendKilled(simResult.adapter)) {
          return res.status(503).json({
            error: 'Service unavailable',
            message: `Kill switch is active for backend "${simResult.adapter}"`,
          });
        }

        // Pass pre-computed simulation to execute() to avoid a second adapter.simulate() call
        const result = await engine.execute(intent, simResult.simulationResult);
        return res.json({
          status: 'executed',
          intent: result.intent,
          adapter: result.adapter,
          simulationResult: result.simulationResult,
          riskDecision: result.riskDecision,
          executionResult: result.executionResult,
          lineageId: result.lineageRecord.id,
        });
      }
    } catch (err) {
      // Risk block or adapter error
      if (err.message && err.message.includes('risk envelope blocked')) {
        return res.status(403).json({ error: 'Forbidden', message: err.message });
      }
      if (err.message && err.message.includes('no adapter supports')) {
        return res.status(400).json({ error: 'Unsupported intent type', message: err.message });
      }
      console.error('[api-gateway] intent error:', err);
      return res.status(500).json({ error: 'Internal server error', message: err.message });
    }
  });

  // ---------------------------------------------------------------------------
  // GET /v1/lineage/:id
  // ---------------------------------------------------------------------------
  app.get('/v1/lineage/:id', (req, res) => {
    const record = lineageStore.getById(req.params.id);
    if (!record) {
      return res.status(404).json({ error: 'Not found', message: `No lineage record with id "${req.params.id}"` });
    }
    return res.json(record);
  });

  // ---------------------------------------------------------------------------
  // GET /v1/health
  // ---------------------------------------------------------------------------
  app.get('/v1/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ---------------------------------------------------------------------------
  // GET /v1/kill-switch
  // ---------------------------------------------------------------------------
  app.get('/v1/kill-switch', (_req, res) => {
    res.json(killSwitch.getStatus());
  });

  // ---------------------------------------------------------------------------
  // POST /v1/kill-switch
  // ---------------------------------------------------------------------------
  app.post('/v1/kill-switch', (req, res) => {
    const { type, target, killed } = req.body || {};

    if (typeof killed !== 'boolean') {
      return res.status(400).json({ error: '"killed" must be a boolean' });
    }

    switch (type) {
      case 'global':
        killSwitch.setGlobal(killed);
        break;
      case 'agent':
        if (!target) return res.status(400).json({ error: '"target" (agentId) is required for type "agent"' });
        killSwitch.setAgent(target, killed);
        break;
      case 'backend':
        if (!target) return res.status(400).json({ error: '"target" (backend name) is required for type "backend"' });
        killSwitch.setBackend(target, killed);
        break;
      default:
        return res.status(400).json({ error: '"type" must be "global", "agent", or "backend"' });
    }

    res.json({ message: 'Kill switch updated', status: killSwitch.getStatus() });
  });

  return app;
}

// ---------------------------------------------------------------------------
// Start function
// ---------------------------------------------------------------------------
function start(port) {
  const resolvedPort = port || parseInt(process.env.PORT || '3000', 10);
  const app = createApp();
  const server = app.listen(resolvedPort, () => {
    console.log(`[api-gateway] Listening on port ${resolvedPort}`);
  });
  return server;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
const app = createApp();
module.exports = { app, start, createApp, engine, lineageStore, killSwitch };

// Auto-start when run directly
if (require.main === module) {
  start();
}
