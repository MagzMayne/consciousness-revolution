/**
 * Coordination Agent
 *
 * Responsibilities:
 *  - Orchestrate which agents respond to which events.
 *  - Maintain a routing table in shared state.
 *  - Route tasks to appropriate agents via *.task events.
 */

'use strict';

const { AgentRuntime } = require('@conscious-network/runtime');

// Default routing rules: topic pattern → list of downstream task events to emit
const DEFAULT_ROUTING = {
  'communication.inbound': [
    { emit: 'creation.request', type: 'GenerateReply', passPayload: true },
    { emit: 'experience.event', type: 'InteractionExperience', passPayload: true },
  ],
  'creation.output': [
    { emit: 'communication.outbound', type: 'OutboundReply', passPayload: true },
    { emit: 'experience.event', type: 'CreationExperience', passPayload: true },
  ],
  'action.request': [
    { emit: 'action.task', type: 'ActionTask', passPayload: true },
  ],
};

class CoordinationAgent extends AgentRuntime {
  constructor(config = {}) {
    super('coordination', config);
    // Load routing table from shared state or use defaults (deep clone to prevent cross-instance mutation)
    this._routingTable = config.routingTable || JSON.parse(JSON.stringify(DEFAULT_ROUTING));
    // Persist to shared state so Adaptation can modify it
    this.state.set_state('coordination.routingTable', this._routingTable);
  }

  async _registerSubscriptions() {
    // Subscribe to all inbound topics that need routing
    const topics = [
      'communication.inbound',
      'creation.output',
      'action.request',
      'learning.insight',
    ];

    for (const topic of topics) {
      this.subscribe(topic, (msg) => this._route(msg));
    }
  }

  async _route(msg) {
    // Reload routing table from shared state (Adaptation may have updated it)
    this._routingTable = this.state.get_state('coordination.routingTable') || this._routingTable;

    const rules = this._routingTable[msg.topic];
    if (!rules || rules.length === 0) {
      this.log('debug', `no routing rules for topic=${msg.topic}`);
      return;
    }

    this.log('info', `routing topic=${msg.topic} → ${rules.length} downstream(s)`, {
      correlationId: msg.correlationId,
    });

    for (const rule of rules) {
      const payload = rule.passPayload
        ? { ...msg.payload, _sourceMsg: { id: msg.id, topic: msg.topic, type: msg.type } }
        : rule.staticPayload || {};

      await this.publish(rule.emit, rule.type, payload, {
        correlationId: msg.correlationId,
        traceId: msg.traceId,
      });
    }

    this.state.append_event('coordination.routed', {
      from: msg.topic,
      correlationId: msg.correlationId,
      rules: rules.map((r) => r.emit),
    });
  }

  /** Update routing rules at runtime (used by Adaptation). */
  updateRoutingRule(topic, rules) {
    this._routingTable[topic] = rules;
    this.state.set_state('coordination.routingTable', this._routingTable);
    this.log('info', `routing table updated for topic=${topic}`);
  }
}

module.exports = { CoordinationAgent };

if (require.main === module) {
  const agent = new CoordinationAgent();
  agent.start().catch((err) => {
    console.error(JSON.stringify({ level: 'error', agent: 'coordination', error: err.message }));
    process.exit(1);
  });
}
