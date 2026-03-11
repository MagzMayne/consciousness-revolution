/**
 * Reflection Agent
 *
 * Responsibilities:
 *  - Periodically review recent events and state.
 *  - Emit `reflection.summary` events describing what the system has been doing.
 *  - Store reflections in the knowledge base for long-term context.
 */

'use strict';

const { AgentRuntime } = require('../../core/runtime');

class ReflectionAgent extends AgentRuntime {
  constructor(config = {}) {
    super('reflection', config);
    this._reflectionIntervalMs = config.reflectionIntervalMs || 60_000; // default: 1 min
    this._timer = null;
    this._reflectionCount = 0;
  }

  async start() {
    await super.start();
    this._scheduleReflection();
  }

  async stop() {
    if (this._timer) clearInterval(this._timer);
    await super.stop();
  }

  async _registerSubscriptions() {
    // Reflection agent primarily works on schedule, but may react to explicit triggers
    this.subscribe('reflection.trigger', () => this._reflect());
  }

  _scheduleReflection() {
    this._timer = setInterval(() => this._reflect(), this._reflectionIntervalMs);
    this.log('info', `reflection scheduled every ${this._reflectionIntervalMs}ms`);
  }

  async _reflect() {
    this._reflectionCount++;
    const reflectionId = `reflection-${this._reflectionCount}`;

    // Gather recent events from all streams
    const recentEvents = this.state.recent_events(20);

    // Gather learning insights
    const latestInsight = this.state.get_knowledge('learning.latestInsight');
    const lastChange = this.state.get_knowledge('adaptation.lastChange');

    // Gather state stats
    const stateStats = this.state.stats();

    // Build summary
    const summary = {
      reflectionId,
      reflectionIndex: this._reflectionCount,
      generatedAt: new Date().toISOString(),
      recentEventCount: recentEvents.length,
      topTopics: this._topTopics(recentEvents),
      systemStats: stateStats,
      latestLearningInsight: latestInsight,
      lastAdaptationChange: lastChange,
      narrative: this._buildNarrative(recentEvents, latestInsight, lastChange),
    };

    // Persist to knowledge base
    this.state.set_knowledge(`reflection.${reflectionId}`, summary);
    this.state.set_knowledge('reflection.latest', summary);
    this.state.append_event('reflection.summaries', summary);

    // Emit to bus
    await this.publish('reflection.summary', 'SystemReflection', summary);

    this.log('info', `reflection #${this._reflectionCount} emitted`, {
      recentEventCount: recentEvents.length,
    });

    return summary;
  }

  _topTopics(events) {
    const counts = {};
    for (const e of events) {
      if (e.stream) {
        counts[e.stream] = (counts[e.stream] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, count }));
  }

  _buildNarrative(events, insight, lastChange) {
    const lines = [
      `The network has processed ${events.length} recent events.`,
    ];
    if (insight) {
      lines.push(
        `Learning has observed ${insight.totalEventsObserved || 0} total events across ${insight.uniqueTopics || 0} unique topics.`,
      );
    }
    if (lastChange && lastChange.changes && lastChange.changes.length > 0) {
      lines.push(
        `The Adaptation agent applied ${lastChange.changes.length} behavioral change(s) most recently at ${lastChange.appliedAt}.`,
      );
    } else {
      lines.push('No behavioral adaptations have been applied yet.');
    }
    return lines.join(' ');
  }

  /** Trigger a reflection immediately (useful for tests / admin). */
  async triggerReflection() {
    return this._reflect();
  }
}

module.exports = { ReflectionAgent };

if (require.main === module) {
  const agent = new ReflectionAgent();
  agent.start().catch((err) => {
    console.error(JSON.stringify({ level: 'error', agent: 'reflection', error: err.message }));
    process.exit(1);
  });
}
