/**
 * Adaptation Agent
 *
 * Responsibilities:
 *  - Subscribe to `learning.insight` events.
 *  - Adjust Coordination routing rules, thresholds, and feature flags.
 *  - Emit `adaptation.change` events when behavior is modified.
 */

'use strict';

const { AgentRuntime } = require('@conscious-network/runtime');

class AdaptationAgent extends AgentRuntime {
  constructor(config = {}) {
    super('adaptation', config);

    // Simple thresholds — can be tuned by insights
    this._thresholds = {
      highActivityTopicCount: config.highActivityTopicCount || 100,
    };
  }

  async _registerSubscriptions() {
    this.subscribe('learning.insight', (msg) => this._adapt(msg));
  }

  async _adapt(msg) {
    const insight = msg.payload;
    const changes = [];

    // ── Rule 1: If a topic is very active, increase its routing priority ──────
    for (const { topic, count } of insight.topTopics || []) {
      if (count >= this._thresholds.highActivityTopicCount) {
        const flagKey = `adaptation.priority.${topic}`;
        const current = this.state.get_state(flagKey) || 1;
        const next = Math.min(current + 1, 10);
        this.state.set_state(flagKey, next);
        changes.push({ type: 'priority_bump', topic, from: current, to: next });
      }
    }

    // ── Rule 2: Track adaptation history in knowledge base ────────────────────
    this.state.set_knowledge('adaptation.lastInsightProcessed', {
      processedAt: new Date().toISOString(),
      insightGeneratedAt: insight.generatedAt,
      totalEventsObserved: insight.totalEventsObserved,
    });

    if (changes.length > 0) {
      const changeRecord = {
        changes,
        basedOnInsight: insight.generatedAt,
        appliedAt: new Date().toISOString(),
      };

      this.state.append_event('adaptation.changes', changeRecord);
      this.state.set_knowledge('adaptation.lastChange', changeRecord);

      await this.publish('adaptation.change', 'BehaviorChange', changeRecord, {
        correlationId: msg.correlationId,
        traceId: msg.traceId,
      });

      this.log('info', `applied ${changes.length} adaptation change(s)`, { changes });
    } else {
      this.log('debug', 'insight processed; no adaptation changes needed');
    }
  }

  /** Manually set a feature flag (also usable by tests / admin). */
  setFlag(key, value) {
    this.state.set_state(`adaptation.flag.${key}`, value);
    this.log('info', `feature flag set`, { key, value });
  }

  getFlag(key) {
    return this.state.get_state(`adaptation.flag.${key}`);
  }
}

module.exports = { AdaptationAgent };

if (require.main === module) {
  const agent = new AdaptationAgent();
  agent.start().catch((err) => {
    console.error(JSON.stringify({ level: 'error', agent: 'adaptation', error: err.message }));
    process.exit(1);
  });
}
