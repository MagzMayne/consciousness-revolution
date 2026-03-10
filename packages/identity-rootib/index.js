'use strict';

/**
 * identity-rootib/index.js
 *
 * Agent and tool identity management with lineage tracking.
 *
 * Provides an in-memory registry for agent identities, including
 * revocation support.  Re-exports the lineage primitives from
 * core-intent-engine so callers can use a single import for both
 * identity and audit concerns.
 */

const { InMemoryLineageStore, createLineageRecord } = require('../core-intent-engine/lineage');

// ---------------------------------------------------------------------------
// AgentIdentity value object
// ---------------------------------------------------------------------------

/**
 * Represents a registered agent's identity.
 * Immutable once constructed.
 */
class AgentIdentity {
  /**
   * @param {object} params
   * @param {string}  params.agentId
   * @param {string}  [params.name]
   * @param {string}  [params.type]         - e.g. "trading", "payment", "rebalance"
   * @param {object}  [params.riskEnvelope] - Associated risk envelope (from core-intent-engine)
   * @param {object}  [params.metadata]     - Arbitrary metadata
   */
  constructor({ agentId, name, type, riskEnvelope, metadata } = {}) {
    if (!agentId) throw new Error('AgentIdentity: agentId is required');

    this.agentId = agentId;
    this.name = name || agentId;
    this.type = type || 'generic';
    this.riskEnvelope = riskEnvelope || null;
    this.metadata = metadata ? { ...metadata } : {};
    this.createdAt = new Date().toISOString();
    this.revoked = false;
  }
}

// ---------------------------------------------------------------------------
// IdentityRegistry
// ---------------------------------------------------------------------------

/**
 * In-memory registry for agent identities.
 *
 * In production, persist registrations to a database and enforce
 * access controls on the register/revoke operations.
 */
class IdentityRegistry {
  constructor() {
    /** @type {Map<string, AgentIdentity>} */
    this._agents = new Map();
  }

  /**
   * Register a new agent.
   *
   * @param {string} agentId
   * @param {object} [options]           - Passed to AgentIdentity constructor
   * @param {string} [options.name]
   * @param {string} [options.type]
   * @param {object} [options.riskEnvelope]
   * @param {object} [options.metadata]
   * @returns {AgentIdentity}
   */
  register(agentId, options = {}) {
    const identity = new AgentIdentity({ agentId, ...options });
    this._agents.set(agentId, identity);
    return identity;
  }

  /**
   * Resolve an agent identity by ID.
   * Returns null (not throws) when the agent is not found.
   *
   * @param {string} agentId
   * @returns {AgentIdentity|null}
   */
  resolve(agentId) {
    return this._agents.get(agentId) || null;
  }

  /**
   * List all registered agents (including revoked ones).
   * @returns {AgentIdentity[]}
   */
  list() {
    return Array.from(this._agents.values());
  }

  /**
   * Revoke an agent.  Sets the `revoked` flag to true on the stored identity.
   * Revoked agents should be prevented from submitting new intents.
   *
   * @param {string} agentId
   * @returns {boolean} True if the agent was found and revoked
   */
  revoke(agentId) {
    const identity = this._agents.get(agentId);
    if (!identity) return false;
    // AgentIdentity is not sealed, allow revocation mutation
    identity.revoked = true;
    identity.revokedAt = new Date().toISOString();
    return true;
  }

  /**
   * Returns true when an agent exists and has been revoked.
   * @param {string} agentId
   * @returns {boolean}
   */
  isRevoked(agentId) {
    const identity = this._agents.get(agentId);
    return identity ? identity.revoked === true : false;
  }
}

module.exports = {
  AgentIdentity,
  IdentityRegistry,
  // Re-export lineage primitives for convenience
  InMemoryLineageStore,
  createLineageRecord,
};
