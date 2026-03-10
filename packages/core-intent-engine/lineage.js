'use strict';

/**
 * lineage.js - Lineage record management for the Agentic Finance system.
 *
 * Every intent execution produces a lineage record that provides a full audit
 * trail: who requested what, which adapter handled it, what the risk decision
 * was, and what the on-chain outcome was.
 */

/**
 * Generates a uuid-like identifier without external dependencies.
 * @returns {string}
 */
function generateId() {
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 10);
  const rnd2 = Math.random().toString(36).slice(2, 10);
  return `${ts}-${rnd}-${rnd2}`;
}

/**
 * Creates an immutable lineage record capturing the full audit trail of a
 * single intent execution.
 *
 * @param {object} params
 * @param {string} params.intentId         - ID of the originating intent
 * @param {string} params.agentId          - Agent that submitted the intent
 * @param {string} [params.userId]         - Optional end-user
 * @param {string} [params.toolId]         - Tool / workflow that called the SDK
 * @param {string} params.intentType       - Intent type string
 * @param {object} params.parametersSnapshot - Snapshot of intent.parameters at execution time
 * @param {object} params.riskDecision     - Output of evaluateRisk()
 * @param {string} params.backend          - Adapter name used
 * @param {string} [params.txHash]         - On-chain transaction hash (if executed)
 * @param {string} [params.backendRef]     - Adapter-internal reference
 * @returns {object} Immutable lineage record
 */
function createLineageRecord(params) {
  const {
    intentId,
    agentId,
    userId,
    toolId,
    intentType,
    parametersSnapshot,
    riskDecision,
    backend,
    txHash,
    backendRef,
  } = params || {};

  return Object.freeze({
    id: generateId(),
    intentId: intentId || null,
    agentId: agentId || null,
    userId: userId || null,
    toolId: toolId || null,
    intentType: intentType || null,
    parametersSnapshot: parametersSnapshot ? Object.freeze({ ...parametersSnapshot }) : null,
    riskDecision: riskDecision ? Object.freeze({ ...riskDecision }) : null,
    backend: backend || null,
    txHash: txHash || null,
    backendRef: backendRef || null,
    timestamp: new Date().toISOString(),
  });
}

/**
 * In-memory lineage store - suitable for development and testing.
 * In production, swap this for a persistent store (database, event log, etc.).
 */
class InMemoryLineageStore {
  constructor() {
    /** @type {Map<string, object>} */
    this._records = new Map();
  }

  /**
   * Persist a lineage record.
   * @param {object} record - Created by createLineageRecord()
   * @returns {object} The same record
   */
  save(record) {
    if (!record || !record.id) {
      throw new Error('InMemoryLineageStore.save: record must have an id');
    }
    this._records.set(record.id, record);
    return record;
  }

  /**
   * Retrieve a lineage record by its id.
   * @param {string} id
   * @returns {object|null}
   */
  getById(id) {
    return this._records.get(id) || null;
  }

  /**
   * List all lineage records for a given agent.
   * @param {string} agentId
   * @returns {object[]}
   */
  listByAgent(agentId) {
    const results = [];
    for (const record of this._records.values()) {
      if (record.agentId === agentId) {
        results.push(record);
      }
    }
    return results;
  }

  /**
   * List all lineage records within a timestamp range (inclusive).
   * @param {string|Date} start - ISO string or Date
   * @param {string|Date} end   - ISO string or Date
   * @returns {object[]}
   */
  listByTimeRange(start, end) {
    const startTs = new Date(start).getTime();
    const endTs = new Date(end).getTime();
    const results = [];

    for (const record of this._records.values()) {
      const ts = new Date(record.timestamp).getTime();
      if (ts >= startTs && ts <= endTs) {
        results.push(record);
      }
    }

    return results;
  }

  /** @returns {number} Total number of stored records */
  get size() {
    return this._records.size;
  }
}

module.exports = { createLineageRecord, InMemoryLineageStore, generateId };
