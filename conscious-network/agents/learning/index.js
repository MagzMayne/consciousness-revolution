/**
 * Learning Agent
 *
 * Responsibilities:
 *  - Observe tagged events (*.experience, *.result, *.feedback).
 *  - Accumulate statistics and patterns in the knowledge base.
 *  - Periodically emit `learning.insight` events.
 *  - Expose a simple /learning/query HTTP endpoint.
 */

'use strict';

const http = require('http');
const { AgentRuntime } = require('../../core/runtime');

class LearningAgent extends AgentRuntime {
  constructor(config = {}) {
    super('learning', config);

    this._httpPort = config.httpPort || parseInt(process.env.LEARNING_HTTP_PORT || '3102');
    this._insightIntervalMs = config.insightIntervalMs || 30_000; // emit insights every 30s
    this._insightTimer = null;
    this._apiServer = null;

    // Internal counters
    this._eventCounts = {};
    this._topicSeen = new Set();
  }

  async start() {
    await super.start();
    await this._startApiServer(this._httpPort);
    this._scheduleInsights();
  }

  async stop() {
    if (this._insightTimer) clearInterval(this._insightTimer);
    if (this._apiServer) await new Promise((r) => this._apiServer.close(r));
    await super.stop();
  }

  async _registerSubscriptions() {
    // Subscribe to any topic carrying experience/result/feedback
    const observedTopics = [
      'experience.event',
      'creation.output',
      'action.result',
      'communication.inbound',
      'communication.outbound',
      'reflection.summary',
    ];

    for (const topic of observedTopics) {
      this.subscribe(topic, (msg) => this._observe(msg));
    }
  }

  _observe(msg) {
    const topic = msg.topic;
    this._topicSeen.add(topic);

    // Count by topic
    this._eventCounts[topic] = (this._eventCounts[topic] || 0) + 1;

    // Count by message type
    const typeKey = `type:${msg.type}`;
    this._eventCounts[typeKey] = (this._eventCounts[typeKey] || 0) + 1;

    // Persist to knowledge base
    this.state.set_knowledge(`learning.counts`, { ...this._eventCounts });
    this.state.append_event('learning.observed', {
      topic,
      type: msg.type,
      correlationId: msg.correlationId,
    });

    this.log('debug', `observed event topic=${topic}`, { type: msg.type });
  }

  _scheduleInsights() {
    this._insightTimer = setInterval(async () => {
      await this._emitInsight();
    }, this._insightIntervalMs);
  }

  async _emitInsight() {
    const counts = { ...this._eventCounts };
    const topTopics = Object.entries(counts)
      .filter(([k]) => !k.startsWith('type:'))
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, count }));

    const insight = {
      topTopics,
      totalEventsObserved: Object.values(counts).reduce((a, b) => a + b, 0),
      uniqueTopics: this._topicSeen.size,
      generatedAt: new Date().toISOString(),
    };

    this.state.set_knowledge('learning.latestInsight', insight);
    this.state.append_event('learning.insights', insight);

    await this.publish('learning.insight', 'PeriodicInsight', insight);
    this.log('info', 'insight emitted', { totalEvents: insight.totalEventsObserved });
  }

  query(params = {}) {
    const results = this.state.query_knowledge(params);
    return results;
  }

  // ── HTTP query endpoint ──────────────────────────────────────────────────────

  _startApiServer(port) {
    return new Promise((resolve) => {
      this._apiServer = http.createServer((req, res) => {
        if (req.url.startsWith('/learning/query') && req.method === 'GET') {
          const url = new URL(req.url, `http://localhost:${port}`);
          const prefix = url.searchParams.get('prefix') || 'learning.';
          const results = this.query({ prefix });
          this._sendJSON(res, 200, results);
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

  _sendJSON(res, status, body) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
  }
}

module.exports = { LearningAgent };

if (require.main === module) {
  const agent = new LearningAgent();
  agent.start().catch((err) => {
    console.error(JSON.stringify({ level: 'error', agent: 'learning', error: err.message }));
    process.exit(1);
  });
}
