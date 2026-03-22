/**
 * Action Agent
 *
 * Responsibilities:
 *  - Subscribe to `action.request` / `action.task` events.
 *  - By default, only log the intended action (SAFE MODE).
 *  - Support human-configured action mappings:
 *      webhook → HTTP POST
 *      script  → shell exec (requires explicit opt-in env var)
 *  - All real-world executions are gated, logged, and audited.
 */

'use strict';

const https = require('https');
const http = require('http');
const { AgentRuntime } = require('@conscious-network/runtime');

const SAFE_MODE = process.env.ACTION_SAFE_MODE !== 'false'; // default: safe

class ActionAgent extends AgentRuntime {
  constructor(config = {}) {
    super('action', config);

    // Human-configured mappings: { [actionType]: { kind: 'webhook'|'log', url?, command? } }
    this._actionMappings = config.actionMappings || {};
    this._safeMode = config.safeMode !== undefined ? config.safeMode : SAFE_MODE;
  }

  async _registerSubscriptions() {
    this.subscribe('action.request', (msg) => this._handleAction(msg));
    this.subscribe('action.task', (msg) => this._handleAction(msg));
  }

  async _handleAction(msg) {
    const { actionType, parameters = {} } = msg.payload;

    this.log('info', `action received`, {
      actionType,
      safeMode: this._safeMode,
      correlationId: msg.correlationId,
    });

    // Always audit every action request
    const auditEntry = {
      actionType,
      parameters,
      correlationId: msg.correlationId,
      traceId: msg.traceId,
      receivedAt: new Date().toISOString(),
      safeMode: this._safeMode,
      executed: false,
      outcome: null,
    };

    if (this._safeMode) {
      // Safe mode: log only, no real-world side effect
      auditEntry.outcome = 'skipped (safe mode)';
      this.state.append_event('action.audit', auditEntry);

      await this.publish('action.result', 'ActionSkipped', {
        actionType,
        reason: 'safe mode active',
        correlationId: msg.correlationId,
      }, { correlationId: msg.correlationId, traceId: msg.traceId });

      return;
    }

    const mapping = this._actionMappings[actionType];
    if (!mapping) {
      auditEntry.outcome = 'no mapping configured';
      this.state.append_event('action.audit', auditEntry);
      this.log('warn', `no mapping for actionType=${actionType}`);
      return;
    }

    let outcome;
    try {
      outcome = await this._execute(mapping, actionType, parameters);
      auditEntry.executed = true;
      auditEntry.outcome = outcome;
    } catch (err) {
      auditEntry.outcome = `error: ${err.message}`;
      this.log('error', `action execution failed`, { actionType, error: err.message });
    }

    this.state.append_event('action.audit', auditEntry);

    await this.publish('action.result', 'ActionResult', {
      actionType,
      outcome: auditEntry.outcome,
      executed: auditEntry.executed,
    }, { correlationId: msg.correlationId, traceId: msg.traceId });
  }

  async _execute(mapping, actionType, parameters) {
    if (mapping.kind === 'webhook') {
      return await this._callWebhook(mapping.url, { actionType, parameters });
    }
    throw new Error(`Unknown mapping kind: ${mapping.kind}`);
  }

  _callWebhook(url, body) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(body);
      const urlObj = new URL(url);
      const lib = urlObj.protocol === 'https:' ? https : http;

      const req = lib.request(
        { hostname: urlObj.hostname, port: urlObj.port, path: urlObj.pathname, method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } },
        (res) => {
          let out = '';
          res.on('data', (c) => (out += c));
          res.on('end', () => resolve({ status: res.statusCode, body: out }));
        },
      );

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  /** Register an action mapping at runtime. */
  registerMapping(actionType, mapping) {
    this._actionMappings[actionType] = mapping;
    this.log('info', `action mapping registered`, { actionType, kind: mapping.kind });
  }

  isSafeMode() { return this._safeMode; }
}

module.exports = { ActionAgent };

if (require.main === module) {
  const agent = new ActionAgent();
  agent.start().catch((err) => {
    console.error(JSON.stringify({ level: 'error', agent: 'action', error: err.message }));
    process.exit(1);
  });
}
