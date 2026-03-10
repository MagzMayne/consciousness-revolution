'use strict';

/**
 * index.js - IntentEngine: core orchestrator for the Agentic Finance system.
 *
 * The engine receives validated Intent objects, selects the appropriate
 * adapter, evaluates the risk envelope, and returns rich result objects that
 * include a full lineage record for every execution.
 */

const { evaluateRisk, createDefaultEnvelope } = require('./risk');
const { createLineageRecord, InMemoryLineageStore } = require('./lineage');

/**
 * IntentEngine - routes intents to adapters with risk gating and lineage.
 *
 * @example
 * const engine = new IntentEngine({
 *   adapters: [new X402BaseAdapter()],
 *   lineageStore: new InMemoryLineageStore(),
 *   riskEnvelopes: { 'my-agent': myEnvelope },
 * });
 */
class IntentEngine {
  /**
   * @param {object} options
   * @param {object[]} options.adapters        - Array of adapter instances
   * @param {object}   [options.lineageStore]  - Lineage store instance
   * @param {object}   [options.riskEnvelopes] - Map of agentId -> envelope
   */
  constructor({ adapters = [], lineageStore, riskEnvelopes = {} } = {}) {
    this.adapters = adapters;
    this.lineageStore = lineageStore || new InMemoryLineageStore();
    this.riskEnvelopes = riskEnvelopes;
  }

  /**
   * Find the first registered adapter that supports the given intentType.
   *
   * @param {string} intentType
   * @returns {object|null} Adapter instance or null
   */
  getAdapter(intentType) {
    for (const adapter of this.adapters) {
      if (typeof adapter.supports === 'function' && adapter.supports(intentType)) {
        return adapter;
      }
    }
    return null;
  }

  /**
   * Retrieve the risk envelope for an agent, falling back to a permissive
   * default when none is registered.
   *
   * @param {string} agentId
   * @returns {object}
   */
  _getEnvelope(agentId) {
    return this.riskEnvelopes[agentId] || createDefaultEnvelope(agentId);
  }

  /**
   * Simulate an intent: select adapter → simulate → evaluate risk.
   * Does NOT produce a lineage record (simulation is read-only).
   *
   * @param {object} intent - Created by schema.createIntent()
   * @returns {Promise<{
   *   intent: object,
   *   adapter: string,
   *   simulationResult: object,
   *   riskDecision: object,
   * }>}
   * @throws {Error} When no adapter supports the intent type
   */
  async simulate(intent) {
    const adapter = this.getAdapter(intent.intentType);
    if (!adapter) {
      throw new Error(
        `IntentEngine: no adapter supports intentType "${intent.intentType}"`
      );
    }

    const simulationResult = await adapter.simulate(intent);
    const envelope = this._getEnvelope(intent.agentId);
    const riskDecision = evaluateRisk(intent, simulationResult, envelope);

    return {
      intent,
      adapter: adapter.name,
      simulationResult,
      riskDecision,
    };
  }

  /**
   * Execute an intent: simulate → risk gate → adapter.execute → lineage.
   *
   * @param {object} intent - Created by schema.createIntent()
   * @param {object} [precomputedSim] - Optional pre-computed simulation result
   *   (pass this when you have already called simulate() to avoid a second
   *   adapter.simulate() call)
   * @returns {Promise<{
   *   intent: object,
   *   adapter: string,
   *   simulationResult: object,
   *   riskDecision: object,
   *   executionResult: object|null,
   *   lineageRecord: object,
   * }>}
   * @throws {Error} When no adapter supports the intent type or risk blocks it
   */
  async execute(intent, precomputedSim) {
    const adapter = this.getAdapter(intent.intentType);
    if (!adapter) {
      throw new Error(
        `IntentEngine: no adapter supports intentType "${intent.intentType}"`
      );
    }

    // Use pre-computed simulation if provided, otherwise simulate now
    const simulationResult = precomputedSim || await adapter.simulate(intent);

    // Evaluate risk against the agent's envelope
    const envelope = this._getEnvelope(intent.agentId);
    const riskDecision = evaluateRisk(intent, simulationResult, envelope);

    if (!riskDecision.allowed) {
      // Persist a denied lineage record for audit purposes
      const deniedRecord = this._buildLineageRecord(intent, riskDecision, adapter.name, null);
      this.lineageStore.save(deniedRecord);

      throw new Error(
        `IntentEngine: risk envelope blocked execution — ${riskDecision.reason}`
      );
    }

    // Execute through the adapter
    const executionResult = await adapter.execute(intent);

    // Persist a successful lineage record
    const lineageRecord = this._buildLineageRecord(intent, riskDecision, adapter.name, executionResult);
    this.lineageStore.save(lineageRecord);

    return {
      intent,
      adapter: adapter.name,
      simulationResult,
      riskDecision,
      executionResult,
      lineageRecord,
    };
  }

  /**
   * Internal helper: build a lineage record from the current execution context.
   * @private
   */
  _buildLineageRecord(intent, riskDecision, adapterName, executionResult) {
    return createLineageRecord({
      intentId: intent.id,
      agentId: intent.agentId,
      userId: intent.userId,
      intentType: intent.intentType,
      parametersSnapshot: intent.parameters,
      riskDecision,
      backend: adapterName,
      txHash: executionResult ? executionResult.txHash || null : null,
      backendRef: executionResult ? executionResult.backendRef || null : null,
    });
  }
}

module.exports = {
  IntentEngine,
  // Re-export commonly needed helpers so callers only need one import
  ...require('./schema'),
  ...require('./risk'),
  ...require('./lineage'),
};
