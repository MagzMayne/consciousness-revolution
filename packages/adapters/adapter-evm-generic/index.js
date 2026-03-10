'use strict';

/**
 * adapter-evm-generic/index.js
 *
 * Generic EVM RPC execution adapter.
 *
 * Supports common intent types across any EVM-compatible chain.
 * In production, wire `rpcUrl`, `chainId`, and `routerAddress` to
 * interact with a DEX router (e.g., Uniswap V3) or payment contract.
 */

const SUPPORTED_TYPES = [
  'trade.swap',
  'trade.buy',
  'trade.sell',
  'payment.m2m',
  'fund_management.rebalance',
];

const { randomHex, randomId } = require('../common/utils');

class EvmGenericAdapter {
  /**
   * @param {object} [config]
   * @param {string} [config.rpcUrl]         - EVM node RPC endpoint
   * @param {number} [config.chainId]        - Target chain ID
   * @param {string} [config.routerAddress]  - DEX router contract address
   */
  constructor(config = {}) {
    this.name = 'evm_generic';
    this.config = {
      rpcUrl: config.rpcUrl || null,
      chainId: config.chainId || null,
      routerAddress: config.routerAddress || null,
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
   * Simulate the intent and return estimated cost/slippage.
   *
   * Production implementation would query the router for price quotes and
   * call `eth_estimateGas` to compute actual gas costs.
   *
   * @param {object} intent
   * @returns {Promise<object>} AdapterSimulationResult
   */
  async simulate(intent) {
    return {
      status: 'simulated',
      estimatedCost: '0.002 ETH',
      estimatedSlippageBps: 50,
      estimatedValueUsd: null,
      projectedDailyUsd: null,
      metadata: {
        adapter: this.name,
        chainId: this.config.chainId,
        routerAddress: this.config.routerAddress,
        intentType: intent.intentType,
      },
    };
  }

  /**
   * Execute the intent against the configured EVM chain.
   *
   * Production implementation would:
   *  - encode the calldata for the router
   *  - sign and send the transaction via ethers.js / viem
   *  - return the real transaction hash
   *
   * @param {object} intent
   * @returns {Promise<object>} AdapterExecutionResult
   */
  async execute(intent) {
    return {
      status: 'executed',
      txHash: '0x' + randomHex(64),
      backendRef: 'evm:' + randomId(),
      metadata: {
        adapter: this.name,
        chainId: this.config.chainId,
        routerAddress: this.config.routerAddress,
        intentType: intent.intentType,
      },
    };
  }
}

module.exports = { EvmGenericAdapter };
