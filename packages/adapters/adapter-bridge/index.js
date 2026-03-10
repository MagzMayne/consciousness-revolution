'use strict';

/**
 * adapter-bridge/index.js
 *
 * Cross-chain bridge adapter (extensible stub).
 *
 * Handles `fund_management.rebalance` intents that require moving assets
 * between chains.  In production, wire `sourceChainId`, `targetChainId`,
 * and `bridgeContractAddress` to the chosen bridge protocol (e.g., Stargate,
 * Across, Hop, LayerZero).
 */

const SUPPORTED_TYPES = ['fund_management.rebalance'];

const { randomHex, randomId } = require('../common/utils');

class BridgeAdapter {
  /**
   * @param {object} [config]
   * @param {number} [config.sourceChainId]         - Origin chain ID
   * @param {number} [config.targetChainId]         - Destination chain ID
   * @param {string} [config.bridgeContractAddress] - Bridge contract on source chain
   */
  constructor(config = {}) {
    this.name = 'bridge';
    this.config = {
      sourceChainId: config.sourceChainId || null,
      targetChainId: config.targetChainId || null,
      bridgeContractAddress: config.bridgeContractAddress || null,
    };
  }

  /**
   * Returns true when this adapter handles the given intentType.
   * @param {string} intentType
   * @returns {boolean}
   */
  supports(intentType) {
    return SUPPORTED_TYPES.includes(intentType);
  }

  /**
   * Simulate a cross-chain bridge transfer.
   *
   * Production implementation would query the bridge contract for fee
   * estimates, liquidity availability, and estimated confirmation time.
   *
   * @param {object} intent
   * @returns {Promise<object>} AdapterSimulationResult
   */
  async simulate(intent) {
    return {
      status: 'simulated',
      estimatedCost: '0.005 ETH',
      estimatedSlippageBps: 10,
      estimatedBridgeFee: '0.001 ETH',
      estimatedConfirmationTimeSeconds: 300,
      estimatedValueUsd: null,
      projectedDailyUsd: null,
      metadata: {
        adapter: this.name,
        sourceChainId: this.config.sourceChainId,
        targetChainId: this.config.targetChainId,
        bridgeContract: this.config.bridgeContractAddress,
        intentType: intent.intentType,
      },
    };
  }

  /**
   * Execute the cross-chain bridge transfer.
   *
   * Production implementation would:
   *  - approve assets on source chain
   *  - call the bridge contract's deposit/send function
   *  - monitor destination chain for confirmation
   *  - return source tx hash (and optionally destination tx hash once available)
   *
   * @param {object} intent
   * @returns {Promise<object>} AdapterExecutionResult
   */
  async execute(intent) {
    return {
      status: 'executed',
      txHash: '0x' + randomHex(64),
      backendRef: 'bridge:' + randomId(),
      metadata: {
        adapter: this.name,
        sourceChainId: this.config.sourceChainId,
        targetChainId: this.config.targetChainId,
        bridgeContract: this.config.bridgeContractAddress,
        intentType: intent.intentType,
      },
    };
  }
}

module.exports = { BridgeAdapter };
