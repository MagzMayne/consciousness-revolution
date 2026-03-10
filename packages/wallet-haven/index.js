'use strict';

/**
 * wallet-haven/index.js
 *
 * Wallet and key management abstraction layer.
 *
 * Provides a common interface for fetching agent balances and signing
 * transactions.  The `LocalWalletProvider` is a safe, mock implementation
 * used in development and testing — no real private keys are ever stored
 * or logged.
 *
 * In production, replace (or extend) `WalletProvider` with implementations
 * backed by:
 *  - Coinbase MPC wallets (AgentKit)
 *  - AWS KMS / GCP Cloud HSM
 *  - Hardware wallets via WalletConnect
 */

/** Generate a random hex string of the given length (no secrets involved) */
function randomHex(len) {
  let hex = '';
  while (hex.length < len) {
    hex += Math.floor(Math.random() * 0xffffffff)
      .toString(16)
      .padStart(8, '0');
  }
  return hex.slice(0, len);
}

// ---------------------------------------------------------------------------
// Abstract base class
// ---------------------------------------------------------------------------

/**
 * WalletProvider - abstract base class.
 *
 * All concrete implementations must override `getBalances` and
 * `signTransaction`.
 */
class WalletProvider {
  /**
   * Fetch balances for a registered agent wallet.
   * @param {string} agentId
   * @returns {Promise<object>} Balance map
   */
  // eslint-disable-next-line no-unused-vars
  async getBalances(agentId) {
    throw new Error('WalletProvider.getBalances: not implemented');
  }

  /**
   * Sign a transaction on behalf of an agent.
   * @param {string} agentId
   * @param {object} tx - Unsigned transaction object
   * @returns {Promise<object>} Signed transaction
   */
  // eslint-disable-next-line no-unused-vars
  async signTransaction(agentId, tx) {
    throw new Error('WalletProvider.signTransaction: not implemented');
  }
}

// ---------------------------------------------------------------------------
// Local (mock) implementation
// ---------------------------------------------------------------------------

/**
 * LocalWalletProvider - development/testing wallet provider.
 *
 * Returns mock balances and mock-signed transactions.  Private keys are
 * never stored, logged, or returned.
 */
class LocalWalletProvider extends WalletProvider {
  /**
   * @param {object} [config]
   * @param {object} [config.wallets] - Map of agentId -> wallet config metadata
   *                                    (no private keys — use HSM/KMS in production)
   */
  constructor(config = {}) {
    super();
    // Store wallet metadata only — never store private keys here
    this._wallets = {};
    if (config.wallets && typeof config.wallets === 'object') {
      for (const [agentId, walletConfig] of Object.entries(config.wallets)) {
        this._wallets[agentId] = { ...walletConfig };
      }
    }
  }

  /**
   * Register a wallet for an agent.
   *
   * @param {string} agentId
   * @param {object} config - Wallet metadata (address, network, etc.)
   *                          Private keys / mnemonics MUST NOT be passed here;
   *                          an error is thrown if detected to make the security
   *                          contract explicit.
   * @throws {Error} When forbidden key-material fields are present in config
   */
  registerWallet(agentId, config) {
    if (!agentId) throw new Error('registerWallet: agentId is required');

    // Explicitly reject any attempt to pass key material
    const FORBIDDEN = ['privateKey', 'mnemonic', 'seed', 'secretKey', 'keystore'];
    for (const field of FORBIDDEN) {
      if (Object.prototype.hasOwnProperty.call(config || {}, field)) {
        throw new Error(
          `registerWallet: passing "${field}" is not allowed — use an HSM/MPC provider for key management`
        );
      }
    }

    this._wallets[agentId] = { ...config };
  }

  /**
   * Return mock balances for an agent.
   * Production implementation would call the chain's RPC node or indexer.
   *
   * @param {string} agentId
   * @returns {Promise<{ ETH: string, USDC: string, network: string }>}
   */
  async getBalances(agentId) {
    // Return mock balances; production queries real chain state
    return {
      ETH: '1.5',
      USDC: '500.00',
      network: 'base',
      agentId,
      fetchedAt: new Date().toISOString(),
    };
  }

  /**
   * Return a mock-signed transaction for an agent.
   * Production implementation would delegate to MPC/HSM signing.
   *
   * @param {string} agentId
   * @param {object} tx - Unsigned transaction
   * @returns {Promise<{ signed: boolean, agentId: string, tx: object, signature: string }>}
   */
  async signTransaction(agentId, tx) {
    return {
      signed: true,
      agentId,
      tx,
      // Mock signature — in production this comes from MPC or HSM
      signature: '0x' + randomHex(128),
      signedAt: new Date().toISOString(),
    };
  }
}

module.exports = { WalletProvider, LocalWalletProvider };
