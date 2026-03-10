'use strict';

/**
 * risk.js - Risk envelope evaluation for the Agentic Finance system.
 *
 * A risk envelope is a per-agent policy object that constrains what an agent
 * is permitted to do.  The `evaluateRisk` function tests a simulated result
 * against the envelope and returns an allow/deny decision with audit flags.
 */

/**
 * Evaluate whether a simulated intent execution is permitted under a risk
 * envelope.
 *
 * @param {object} intent            - Intent object (from schema.createIntent)
 * @param {object} simulationResult  - Result returned by adapter.simulate()
 * @param {object} envelope          - Risk envelope (see createDefaultEnvelope)
 * @returns {{ allowed: boolean, reason: string, flags: string[] }}
 */
function evaluateRisk(intent, simulationResult, envelope) {
  const flags = [];

  if (!envelope) {
    return { allowed: true, reason: 'no envelope configured', flags };
  }

  // --- Intent type allowlist ------------------------------------------------
  if (
    Array.isArray(envelope.allowedIntentTypes) &&
    envelope.allowedIntentTypes.length > 0
  ) {
    if (!envelope.allowedIntentTypes.includes(intent.intentType)) {
      flags.push('intent_type_blocked');
      return {
        allowed: false,
        reason: `intentType "${intent.intentType}" is not in allowedIntentTypes`,
        flags,
      };
    }
  }

  // --- Per-transaction USD cap ----------------------------------------------
  if (
    envelope.maxPerTxUsd != null &&
    simulationResult.estimatedValueUsd != null
  ) {
    const value = Number(simulationResult.estimatedValueUsd);
    if (!isNaN(value) && value > Number(envelope.maxPerTxUsd)) {
      flags.push('per_tx_cap_exceeded');
      return {
        allowed: false,
        reason: `estimated value $${value} exceeds maxPerTxUsd $${envelope.maxPerTxUsd}`,
        flags,
      };
    }
  }

  // --- Daily USD cap --------------------------------------------------------
  if (
    envelope.maxDailyUsd != null &&
    simulationResult.projectedDailyUsd != null
  ) {
    const daily = Number(simulationResult.projectedDailyUsd);
    if (!isNaN(daily) && daily > Number(envelope.maxDailyUsd)) {
      flags.push('daily_cap_exceeded');
      return {
        allowed: false,
        reason: `projected daily spend $${daily} exceeds maxDailyUsd $${envelope.maxDailyUsd}`,
        flags,
      };
    }
  }

  // --- Allowed assets -------------------------------------------------------
  if (
    Array.isArray(envelope.allowedAssets) &&
    envelope.allowedAssets.length > 0
  ) {
    const assets = Array.isArray(intent.parameters.assets)
      ? intent.parameters.assets
      : intent.parameters.asset
      ? [intent.parameters.asset]
      : [];

    for (const asset of assets) {
      if (!envelope.allowedAssets.includes(asset)) {
        flags.push('asset_not_allowed');
        return {
          allowed: false,
          reason: `asset "${asset}" is not in allowedAssets`,
          flags,
        };
      }
    }
  }

  // --- Blocked assets -------------------------------------------------------
  if (Array.isArray(envelope.blockedAssets) && envelope.blockedAssets.length > 0) {
    const assets = Array.isArray(intent.parameters.assets)
      ? intent.parameters.assets
      : intent.parameters.asset
      ? [intent.parameters.asset]
      : [];

    for (const asset of assets) {
      if (envelope.blockedAssets.includes(asset)) {
        flags.push('asset_blocked');
        return {
          allowed: false,
          reason: `asset "${asset}" is in blockedAssets`,
          flags,
        };
      }
    }
  }

  // --- Allowed destinations -------------------------------------------------
  if (
    Array.isArray(envelope.allowedDestinations) &&
    envelope.allowedDestinations.length > 0
  ) {
    const dest = intent.parameters.destination || intent.parameters.to || null;
    if (dest && !envelope.allowedDestinations.includes(dest)) {
      flags.push('destination_not_allowed');
      return {
        allowed: false,
        reason: `destination "${dest}" is not in allowedDestinations`,
        flags,
      };
    }
  }

  // --- Blocked destinations -------------------------------------------------
  if (
    Array.isArray(envelope.blockedDestinations) &&
    envelope.blockedDestinations.length > 0
  ) {
    const dest = intent.parameters.destination || intent.parameters.to || null;
    if (dest && envelope.blockedDestinations.includes(dest)) {
      flags.push('destination_blocked');
      return {
        allowed: false,
        reason: `destination "${dest}" is in blockedDestinations`,
        flags,
      };
    }
  }

  return { allowed: true, reason: 'all risk checks passed', flags };
}

/**
 * Creates a permissive default risk envelope for an agent.
 * All caps are set to `null` (unlimited) and all lists are empty (unrestricted).
 *
 * @param {string} agentId
 * @returns {object}
 */
function createDefaultEnvelope(agentId) {
  return {
    agentId,
    allowedIntentTypes: [],     // empty = all types allowed
    maxPerTxUsd: null,           // null = unlimited
    maxDailyUsd: null,           // null = unlimited
    allowedAssets: [],           // empty = all assets allowed
    blockedAssets: [],
    allowedDestinations: [],     // empty = all destinations allowed
    blockedDestinations: [],
    createdAt: new Date().toISOString(),
  };
}

module.exports = { evaluateRisk, createDefaultEnvelope };
