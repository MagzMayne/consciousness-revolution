'use strict';

/**
 * schema.js - Intent schema constants and validator for the Agentic Finance system.
 *
 * Defines all valid intent types and provides factory/validation helpers.
 */

/** All valid intent type strings recognised by the engine. */
const INTENT_TYPES = [
  'fund_management.rebalance',
  'fund_management.swap',
  'payment.m2m',
  'payment.subscription',
  'trade.buy',
  'trade.sell',
  'trade.swap',
  'trade.rebalance',
];

/**
 * Returns true when `type` is one of the declared INTENT_TYPES.
 * @param {string} type
 * @returns {boolean}
 */
function isValidIntentType(type) {
  return INTENT_TYPES.includes(type);
}

/**
 * Creates and validates a new Intent object.
 *
 * @param {object} params
 * @param {string} params.id           - Unique intent identifier (required)
 * @param {string} params.agentId      - Originating agent identifier (required)
 * @param {string} [params.userId]     - Optional end-user identifier
 * @param {string} params.intentType   - One of INTENT_TYPES (required)
 * @param {object} params.parameters   - Intent-specific parameters (required)
 * @param {object} [params.context]    - Additional context metadata
 * @returns {{ id, agentId, userId, intentType, parameters, context, createdAt }}
 * @throws {Error} When required fields are missing or intentType is invalid
 */
function createIntent(params) {
  const { id, agentId, userId, intentType, parameters, context } = params || {};

  if (!id) throw new Error('createIntent: missing required field "id"');
  if (!agentId) throw new Error('createIntent: missing required field "agentId"');
  if (!intentType) throw new Error('createIntent: missing required field "intentType"');
  if (!parameters) throw new Error('createIntent: missing required field "parameters"');

  if (!isValidIntentType(intentType)) {
    throw new Error(
      `createIntent: invalid intentType "${intentType}". Must be one of: ${INTENT_TYPES.join(', ')}`
    );
  }

  return {
    id,
    agentId,
    userId: userId || null,
    intentType,
    parameters,
    context: context || {},
    createdAt: new Date().toISOString(),
  };
}

module.exports = { INTENT_TYPES, isValidIntentType, createIntent };
