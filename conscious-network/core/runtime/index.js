/**
 * Agent Runtime Base
 *
 * All 7 agents extend this class.  Provides:
 *  - Shared event-bus + state-store injection
 *  - Structured JSON logging
 *  - Config loading (env vars + optional config file)
 *  - Graceful shutdown (SIGINT / SIGTERM)
 *  - Simple HTTP health-check endpoint
 */

'use strict';

const http = require('http');
const { getDefaultBus } = require('../event-bus');
const { getDefaultStore } = require('../state');

class AgentRuntime {
  /**
   * @param {string}  name        Agent identifier, e.g. "communication"
   * @param {object}  [config]    Optional overrides (merged with env defaults)
   */
  constructor(name, config = {}) {
    this.name = name;
    this.config = this._loadConfig(config);
    this.bus = config.bus || getDefaultBus();
    this.state = config.state || getDefaultStore();

    this._subscriptions = []; // unsubscribe fns
    this._running = false;
    this._healthServer = null;
    this._startedAt = null;
    this._messageCount = 0;
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  /**
   * Start the agent:
   *  1. Register subscriptions (implemented by subclass).
   *  2. Start health-check HTTP server if configured.
   *  3. Register SIGINT/SIGTERM handlers.
   */
  async start() {
    this._startedAt = new Date().toISOString();
    this._running = true;

    this.log('info', 'starting');

    await this._registerSubscriptions();

    if (this.config.healthPort) {
      await this._startHealthServer(this.config.healthPort);
    }

    this._registerShutdownHandlers();

    this.log('info', 'ready');
  }

  /** Stop the agent gracefully. */
  async stop() {
    this.log('info', 'stopping');
    this._running = false;

    // Unsubscribe from all topics
    for (const unsub of this._subscriptions) {
      try { unsub(); } catch (_) { /* ignore */ }
    }
    this._subscriptions = [];

    if (this._healthServer) {
      await new Promise((resolve) => this._healthServer.close(resolve));
      this._healthServer = null;
    }

    this.log('info', 'stopped');
  }

  // ── To be implemented by each agent ─────────────────────────────────────────

  /**
   * Override this method to subscribe to topics on `this.bus`.
   * Store unsubscribe functions in `this._subscriptions`.
   */
  async _registerSubscriptions() {
    // subclasses override
  }

  // ── Event bus helpers ────────────────────────────────────────────────────────

  /**
   * Publish a message to the event bus.
   * @param {string} topic
   * @param {string} type
   * @param {object} payload
   * @param {object} [opts]   correlationId, traceId
   */
  async publish(topic, type, payload, opts = {}) {
    const { createMessage } = require('../event-bus');
    const msg = createMessage(topic, type, payload, { ...opts, source: this.name });
    this._messageCount++;
    this.log('debug', `publish → ${topic}`, { type, msgId: msg.id });
    await this.bus.publish(msg);
    return msg;
  }

  /**
   * Subscribe to a topic and automatically track unsubscribe.
   * @param {string}   topic
   * @param {Function} handler
   */
  subscribe(topic, handler) {
    const unsub = this.bus.subscribe(topic, async (msg) => {
      this.log('debug', `received ← ${topic}`, { type: msg.type, msgId: msg.id });
      try {
        await handler(msg);
      } catch (err) {
        this.log('error', `handler error on ${topic}`, { error: err.message, stack: err.stack });
      }
    });
    this._subscriptions.push(unsub);
    return unsub;
  }

  // ── Logging ──────────────────────────────────────────────────────────────────

  /**
   * Emit a structured JSON log line.
   * @param {'debug'|'info'|'warn'|'error'} level
   * @param {string} message
   * @param {object} [extra]
   */
  log(level, message, extra = {}) {
    const entry = {
      ts: new Date().toISOString(),
      level,
      agent: this.name,
      message,
      ...extra,
    };
    const line = JSON.stringify(entry);

    if (level === 'error') {
      process.stderr.write(line + '\n');
    } else {
      process.stdout.write(line + '\n');
    }
  }

  // ── Health check ─────────────────────────────────────────────────────────────

  getHealth() {
    return {
      agent: this.name,
      status: this._running ? 'ok' : 'stopped',
      startedAt: this._startedAt,
      messagesProcessed: this._messageCount,
      uptime: this._startedAt
        ? Math.floor((Date.now() - new Date(this._startedAt).getTime()) / 1000)
        : 0,
      stateStats: this.state.stats(),
    };
  }

  async _startHealthServer(port) {
    return new Promise((resolve) => {
      this._healthServer = http.createServer((req, res) => {
        if (req.url === '/health' && req.method === 'GET') {
          const body = JSON.stringify(this.getHealth(), null, 2);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(body);
        } else {
          res.writeHead(404);
          res.end('Not found');
        }
      });

      this._healthServer.listen(port, () => {
        this.log('info', `health endpoint listening on :${port}/health`);
        resolve();
      });
    });
  }

  // ── Config ───────────────────────────────────────────────────────────────────

  _loadConfig(overrides) {
    const name = (this.name || 'agent').toUpperCase().replace(/-/g, '_');
    return {
      healthPort: parseInt(process.env[`${name}_HEALTH_PORT`] || '0') || overrides.healthPort || null,
      logLevel: process.env.LOG_LEVEL || overrides.logLevel || 'info',
      ...overrides,
    };
  }

  // ── Shutdown ─────────────────────────────────────────────────────────────────

  _registerShutdownHandlers() {
    const handler = async (signal) => {
      this.log('info', `received ${signal}, shutting down`);
      await this.stop();
      process.exit(0);
    };
    process.once('SIGINT', () => handler('SIGINT'));
    process.once('SIGTERM', () => handler('SIGTERM'));
  }
}

module.exports = { AgentRuntime };
