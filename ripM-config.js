/**
 * ════════════════════════════════════════════════════════════════════════════════
 * © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * PROPRIETARY AND CONFIDENTIAL - INTELLECTUAL PROPERTY PROTECTION
 * 
 * This file contains proprietary intellectual property of Ryan Barbrick.
 * All concepts, algorithms, implementations, and innovations are protected by
 * copyright law and are considered trade secrets.
 * 
 * PROVISIONAL PATENT NOTICE:
 * The ideas, methods, systems, and code contained in this file are subject to
 * provisional patent protection. Unauthorized use, reproduction, modification,
 * or distribution is strictly prohibited.
 * 
 * LEGAL WARNING:
 * Unauthorized use of this intellectual property may result in:
 * - Civil litigation for copyright infringement
 * - Claims for actual and statutory damages ($750-$150,000 per work)
 * - Injunctive relief and cease & desist orders
 * - Criminal prosecution for willful infringement
 * - Recovery of attorney fees and legal costs
 * 
 * CREATOR INFORMATION:
 * Author: Ryan Barbrick
 * Business: Barbrick Design
 * Contact: BarbrickDesign@gmail.com
 * AI Assistant: Merlin AI
 * Repository: https://github.com/barbrickdesign/barbrickdesign.github.io
 * 
 * PATENT DECLARATION:
 * File: ripM-config.js
 * Declaration ID: IP-4FF8CB3C-MLL28ZVT
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * @aul-enabled
 * This file is compatible with AI Universal Language (AUL)
 * Learn more: https://barbrickdesign.github.io/ai-universal-language.html
 */

/**
 * ripM Configuration File
 * 
 * Instructions:
 * 1. Copy this file and rename to ripM-config-production.js
 * 2. Fill in your actual API keys and addresses
 * 3. Include this file in ripM.html before the main script
 * 
 * IMPORTANT: Never commit your production config with real keys to version control!
 */

const RIPM_CONFIG = {
  // PayPal Configuration
  paypal: {
    // Get your client ID from: https://developer.paypal.com/dashboard/applications
    clientId: 'YOUR_PAYPAL_CLIENT_ID',
    // Your PayPal business email
    payeeEmail: 'BarbrickDesign@gmail.com',
    // Environment: 'sandbox' for testing, 'production' for live
    environment: 'sandbox'
  },

  // Blockchain Configuration
  blockchain: {
    // Ethereum/EVM Configuration
    ethereum: {
      // Chain ID: 0x1 for mainnet, 0x5 for Goerli testnet, 0xaa36a7 for Sepolia
      chainId: '0x1',
      // RPC URL - Get from Alchemy, Infura, or similar
      rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY',
      // Your deployed NFT contract address
      contractAddress: '0x0000000000000000000000000000000000000000',
      // Your payment wallet address
      paymentAddress: '0x0000000000000000000000000000000000000000',
      // Network name
      networkName: 'Ethereum Mainnet'
    },

    // Solana Configuration
    solana: {
      // Network: 'mainnet-beta', 'testnet', 'devnet'
      network: 'mainnet-beta',
      // RPC URL
      rpcUrl: 'https://api.mainnet-beta.solana.com',
      // Your Solana program ID (if you have a custom program)
      programId: 'YOUR_SOLANA_PROGRAM_ID',
      // Your payment wallet address
      paymentAddress: 'YOUR_SOLANA_WALLET_ADDRESS'
    }
  },

  // IPFS/Metadata Storage Configuration
  storage: {
    // Provider: 'pinata', 'nft.storage', 'arweave'
    provider: 'pinata',
    // API keys for your chosen provider
    apiKey: 'YOUR_IPFS_API_KEY',
    apiSecret: 'YOUR_IPFS_API_SECRET',
    // Gateway URL for accessing uploaded content
    gateway: 'https://gateway.pinata.cloud/ipfs/'
  },

  // Feature Flags
  features: {
    // Enable/disable real blockchain minting
    enableMinting: true,
    // Enable/disable real payments
    enableRealPayments: true,
    // Enable test mode (uses testnet/sandbox)
    testMode: true,
    // Show debug information
    debug: true
  },

  // Pack Pricing (in USD)
  pricing: {
    // Default pack prices by tier
    budget: 3.99,
    standard: 4.99,
    premium: 6.99,
    ultra: 9.99
  }
};

// Export for use in ripM.html
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RIPM_CONFIG;
}
