/**
 * Communication Agent
 *
 * Responsibilities:
 *  - Expose an HTTP API for external message injection.
 *  - Normalize inbound payloads → publish `communication.inbound`.
 *  - Subscribe to `communication.outbound` → relay replies to waiting clients.
 */

'use strict';

const http = require('http');
const { AgentRuntime } = require('../../core/runtime');

class CommunicationAgent extends AgentRuntime {
  constructor(config = {}) {
    super('communication', config);

    this._httpPort = config.httpPort || parseInt(process.env.COMMUNICATION_HTTP_PORT || '3100');
    this._pendingReplies = new Map(); // correlationId → {resolve, reject, timer}
    this._apiServer = null;
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  async start() {
    await super.start();
    await this._startApiServer(this._httpPort);
  }

  async stop() {
    if (this._apiServer) {
      await new Promise((r) => this._apiServer.close(r));
    }
    await super.stop();
  }

  // ── Subscriptions ────────────────────────────────────────────────────────────

  async _registerSubscriptions() {
    this.subscribe('communication.outbound', (msg) => this._handleOutbound(msg));
  }

  // ── Inbound (external → bus) ─────────────────────────────────────────────────

  async injectMessage(text, opts = {}) {
    const msg = await this.publish(
      'communication.inbound',
      'UserMessage',
      { text, interface: opts.interface || 'http' },
      { correlationId: opts.correlationId },
    );

    this.state.append_event('communication.inbound', { text, correlationId: msg.correlationId });

    return msg;
  }

  // ── Outbound (bus → external) ────────────────────────────────────────────────

  _handleOutbound(busMsg) {
    const cid = busMsg.correlationId;
    const pending = this._pendingReplies.get(cid);
    if (pending) {
      clearTimeout(pending.timer);
      this._pendingReplies.delete(cid);
      pending.resolve(busMsg.payload);
    }
    this.state.append_event('communication.outbound', {
      correlationId: cid,
      reply: busMsg.payload,
    });
  }

  // ── HTTP API ─────────────────────────────────────────────────────────────────

  _startApiServer(port) {
    return new Promise((resolve) => {
      this._apiServer = http.createServer(async (req, res) => {
        if (req.url === '/api/message' && req.method === 'POST') {
          await this._handleHttpMessage(req, res);
        } else if (req.url === '/health' && req.method === 'GET') {
          this._sendJSON(res, 200, this.getHealth());
        } else {
          res.writeHead(404);
          res.end('Not found');
        }
      });

      this._apiServer.listen(port, () => {
        this.log('info', `HTTP API listening on :${port}`);
        resolve();
      });
    });
  }

  async _handleHttpMessage(req, res) {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', async () => {
      try {
        const { text, correlationId, waitForReply = false, timeoutMs = 10_000 } = JSON.parse(body || '{}');

        if (!text) {
          return this._sendJSON(res, 400, { error: '"text" is required' });
        }

        const msg = await this.injectMessage(text, { correlationId, interface: 'http' });

        if (!waitForReply) {
          return this._sendJSON(res, 202, { accepted: true, correlationId: msg.correlationId, messageId: msg.id });
        }

        // Wait for a matching outbound reply
        const reply = await new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
            this._pendingReplies.delete(msg.correlationId);
            reject(new Error('Timeout waiting for reply'));
          }, timeoutMs);

          this._pendingReplies.set(msg.correlationId, { resolve, reject, timer });
        }).catch((err) => ({ error: err.message }));

        this._sendJSON(res, 200, { correlationId: msg.correlationId, reply });
      } catch (err) {
        this.log('error', 'HTTP message handler error', { error: err.message });
        this._sendJSON(res, 500, { error: err.message });
      }
    });
  }

  _sendJSON(res, status, body) {
    const data = JSON.stringify(body);
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(data);
  }
}

module.exports = { CommunicationAgent };

// ── Standalone entrypoint ────────────────────────────────────────────────────
if (require.main === module) {
  const agent = new CommunicationAgent();
  agent.start().catch((err) => {
    console.error(JSON.stringify({ level: 'error', agent: 'communication', error: err.message }));
    process.exit(1);
  });
}
