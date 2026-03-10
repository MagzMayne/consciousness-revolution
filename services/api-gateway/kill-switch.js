'use strict';

/**
 * kill-switch.js - Kill switch manager for the Agentic Finance API gateway.
 *
 * Provides granular halting controls at three levels:
 *  1. Global  — stops all intent processing immediately
 *  2. Per-agent — stops a specific agent from executing intents
 *  3. Per-backend — stops a specific adapter/backend from being used
 *
 * In production, persist the kill switch state to a fast key-value store
 * (Redis, DynamoDB, etc.) so that it survives process restarts and is
 * visible to all gateway replicas.
 */

class KillSwitchManager {
  constructor() {
    this._global = false;
    /** @type {Map<string, boolean>} */
    this._agents = new Map();
    /** @type {Map<string, boolean>} */
    this._backends = new Map();
  }

  // -------------------------------------------------------------------------
  // Global kill switch
  // -------------------------------------------------------------------------

  /** @returns {boolean} True when the global kill switch is active */
  isGlobalKilled() {
    return this._global === true;
  }

  /**
   * Enable or disable the global kill switch.
   * When enabled, ALL intent processing is halted regardless of agent or backend.
   * @param {boolean} killed
   */
  setGlobal(killed) {
    this._global = Boolean(killed);
  }

  // -------------------------------------------------------------------------
  // Per-agent kill switch
  // -------------------------------------------------------------------------

  /**
   * @param {string} agentId
   * @returns {boolean} True when the global OR per-agent kill switch is active
   */
  isAgentKilled(agentId) {
    if (this._global) return true;
    return this._agents.get(agentId) === true;
  }

  /**
   * Enable or disable the kill switch for a specific agent.
   * @param {string} agentId
   * @param {boolean} killed
   */
  setAgent(agentId, killed) {
    this._agents.set(agentId, Boolean(killed));
  }

  // -------------------------------------------------------------------------
  // Per-backend kill switch
  // -------------------------------------------------------------------------

  /**
   * @param {string} backend - Adapter name (e.g. "x402_base")
   * @returns {boolean} True when the global OR per-backend kill switch is active
   */
  isBackendKilled(backend) {
    if (this._global) return true;
    return this._backends.get(backend) === true;
  }

  /**
   * Enable or disable the kill switch for a specific backend adapter.
   * @param {string} backend
   * @param {boolean} killed
   */
  setBackend(backend, killed) {
    this._backends.set(backend, Boolean(killed));
  }

  // -------------------------------------------------------------------------
  // Status snapshot
  // -------------------------------------------------------------------------

  /**
   * Returns the full kill-switch state for monitoring / API responses.
   * @returns {{
   *   global: boolean,
   *   agents: Record<string, boolean>,
   *   backends: Record<string, boolean>,
   *   updatedAt: string
   * }}
   */
  getStatus() {
    const agents = {};
    for (const [id, val] of this._agents.entries()) agents[id] = val;

    const backends = {};
    for (const [name, val] of this._backends.entries()) backends[name] = val;

    return {
      global: this._global,
      agents,
      backends,
      updatedAt: new Date().toISOString(),
    };
  }
}

module.exports = { KillSwitchManager };
