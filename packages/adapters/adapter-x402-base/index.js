'use strict';

/**
 * adapter-x402-base/index.js
 *
 * Coinbase Agentic Wallets / x402 adapter for the Base network.
 *
 * This is a configurable stub.  In production the simulate() and execute()
 * methods would integrate with Coinbase AgentKit and the x402 payment
 * protocol to build, sign, and broadcast real transactions on Base.
 */

const BASE_CHAIN_ID = 8453;

/** Supported intent types for this adapter */
const SUPPORTED_TYPES = [
  'payment.m2m',
  'trade.swap',
  'trade.buy',
  'trade.sell',
  'trade.rebalance',
  'fund_management.rebalance',
  'fund_management.swap',
];

const { randomHex, randomId } = require('../common/utils');

class X402BaseAdapter {
  /**
   * @param {object} [config]
   * @param {string} [config.rpcUrl]  - Base RPC URL (production use)
   * @param {number} [config.chainId] - Override chain ID (defaults to Base 8453)
   */
  constructor(config = {}) {
    this.name = 'x402_base';
    this.config = {
      rpcUrl: config.rpcUrl || 'https://mainnet.base.org',
      chainId: config.chainId != null ? config.chainId : BASE_CHAIN_ID,
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
   * Simulate the intent and return cost/slippage estimates.
   *
   * Production implementation would:
   *  - call AgentKit to price the route
   *  - query x402 for fee estimates
   *  - return real estimatedCost / slippage
   *
   * @param {object} intent
   * @returns {Promise<object>} AdapterSimulationResult
   */
  async simulate(intent) {
    return {
      status: 'simulated',
      estimatedCost: '0.001 ETH',
      estimatedSlippageBps: 30,
      estimatedValueUsd: null,   // production would populate
      projectedDailyUsd: null,
      metadata: {
        adapter: this.name,
        network: 'base',
        chainId: this.config.chainId,
        intentType: intent.intentType,
      },
    };
  }

  /**
   * Execute the intent on Base via the x402/AgentKit integration.
   *
   * Production implementation would:
   *  - build the transaction with AgentKit
   *  - sign via the agent's MPC/smart wallet
   *  - broadcast and return the real txHash
   *
   * @param {object} intent
   * @returns {Promise<object>} AdapterExecutionResult
   */
  async execute(intent) {
    return {
      status: 'executed',
      txHash: '0x' + randomHex(64),
      backendRef: 'x402:' + randomId(),
      metadata: {
        adapter: this.name,
        network: 'base',
        chainId: this.config.chainId,
        intentType: intent.intentType,
      },
    };
  }
}

module.exports = { X402BaseAdapter };
