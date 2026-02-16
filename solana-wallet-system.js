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
 * File: solana-wallet-system.js
 * Declaration ID: IP-4A2BFCFD-MLL28ZVW
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GEMBOT SOLANA WALLET & GBUV TOKEN MANAGEMENT SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════
 * OWNERSHIP: Ryan Barbrick / Barbrick Design
 * CONTACT: BarbrickDesign@gmail.com
 * COPYRIGHT: © 2024-2025 Ryan Barbrick. All Rights Reserved.
 * 
 * ⚠️ SECURITY CRITICAL: This system handles REAL cryptocurrency
 * - Never commit private keys to version control
 * - Use environment variables for production keys
 * - Enable 2FA on all admin accounts
 * - Regularly audit transactions
 * - Keep cold wallet backups
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Load Solana Web3.js from CDN (add to HTML: <script src="https://cdn.jsdelivr.net/npm/@solana/web3.js@latest/lib/index.iife.min.js"></script>)

class GemBotSolanaWallet {
    constructor(network = 'devnet') {
        this.network = network; // 'devnet' or 'mainnet-beta'
        this.rpcUrl = network === 'mainnet-beta' 
            ? 'https://api.mainnet-beta.solana.com'
            : 'https://api.devnet.solana.com';
        
        this.connection = new solanaWeb3.Connection(this.rpcUrl, 'confirmed');
        
        // GBUV Token Mint Address - $GBUV on pump.fun
        this.GBUV_MINT = 'DPHcbu7wJEbcrnCYjXC8vHBkM39kT9xZg4mYayvrpump'; // pump.fun token
        
        // Admin wallet address - DiamondBoi main vault (USER CONTROLLED)
        this.ADMIN_WALLET = '6HTjfgWZYMbENnMAJJFhxWR2VZDxdze3qV7zznSAsfk'; // Treasury/Vault
        
        // Agent wallet address - GemBot automated operations (SYSTEM CONTROLLED)
        // ⚠️ Fund this wallet from ADMIN_WALLET for automated transactions
        this.AGENT_WALLET = 'HjQWMfGqp8VzN3x4TnKmRLo2hX9sY6wD5pC1vB8aE2fU'; // GemBot Agent Operations
        
        // Wallet roles:
        // - ADMIN_WALLET: Your controlled vault (cold storage, manual transactions)
        // - AGENT_WALLET: Automated system wallet (hot wallet, AI agent operations)
        
        // Initialize storage
        this.initStorage();
        
        console.log(`🔗 GemBot Solana Wallet System initialized (${network})`);
        console.log(`📡 RPC: ${this.rpcUrl}`);
    }
    
    initStorage() {
        // Initialize localStorage keys
        if (!localStorage.getItem('gembot_wallets')) {
            localStorage.setItem('gembot_wallets', JSON.stringify({}));
        }
        if (!localStorage.getItem('gembot_transactions')) {
            localStorage.setItem('gembot_transactions', JSON.stringify([]));
        }
    }
    
    // ═════════════════════════════════════════════════════════════════════════
    // WALLET GENERATION & MANAGEMENT
    // ═════════════════════════════════════════════════════════════════════════
    
    /**
     * Generate a new Solana wallet (keypair)
     * ⚠️ SECURITY: Store private keys securely, NEVER in localStorage for production
     */
    generateWallet(label = 'unlabeled') {
        const keypair = solanaWeb3.Keypair.generate();
        const publicKey = keypair.publicKey.toString();
        const secretKey = Array.from(keypair.secretKey);
        
        const wallet = {
            label: label,
            publicKey: publicKey,
            secretKey: secretKey, // ⚠️ NEVER store in production localStorage!
            created: new Date().toISOString(),
            balance: 0,
            gbuvBalance: 0
        };
        
        // Save to storage (⚠️ DEVELOPMENT ONLY)
        this.saveWallet(wallet);
        
        console.log(`✅ Generated wallet: ${label}`);
        console.log(`📍 Public Key: ${publicKey}`);
        console.log(`⚠️ WARNING: Private key stored in localStorage (DEV ONLY)`);
        
        return wallet;
    }
    
    /**
     * Import existing wallet from private key
     * @param {Array|Uint8Array} secretKey - 64-byte secret key
     * @param {string} label - Wallet label
     */
    importWallet(secretKey, label = 'imported') {
        const keypair = solanaWeb3.Keypair.fromSecretKey(
            secretKey instanceof Uint8Array ? secretKey : new Uint8Array(secretKey)
        );
        const publicKey = keypair.publicKey.toString();
        
        const wallet = {
            label: label,
            publicKey: publicKey,
            secretKey: Array.from(keypair.secretKey),
            created: new Date().toISOString(),
            balance: 0,
            gbuvBalance: 0
        };
        
        this.saveWallet(wallet);
        
        console.log(`✅ Imported wallet: ${label}`);
        console.log(`📍 Public Key: ${publicKey}`);
        
        return wallet;
    }
    
    /**
     * Save wallet to storage
     */
    saveWallet(wallet) {
        const wallets = JSON.parse(localStorage.getItem('gembot_wallets') || '{}');
        wallets[wallet.publicKey] = wallet;
        localStorage.setItem('gembot_wallets', JSON.stringify(wallets));
    }
    
    /**
     * Get wallet by public key
     */
    getWallet(publicKey) {
        const wallets = JSON.parse(localStorage.getItem('gembot_wallets') || '{}');
        return wallets[publicKey] || null;
    }
    
    /**
     * List all wallets
     */
    listWallets() {
        const wallets = JSON.parse(localStorage.getItem('gembot_wallets') || '{}');
        return Object.values(wallets);
    }
    
    /**
     * Delete wallet
     */
    deleteWallet(publicKey) {
        const wallets = JSON.parse(localStorage.getItem('gembot_wallets') || '{}');
        delete wallets[publicKey];
        localStorage.setItem('gembot_wallets', JSON.stringify(wallets));
        console.log(`🗑️ Deleted wallet: ${publicKey}`);
    }
    
    // ═════════════════════════════════════════════════════════════════════════
    // BALANCE CHECKING
    // ═════════════════════════════════════════════════════════════════════════
    
    /**
     * Get SOL balance for a wallet
     */
    async getSOLBalance(publicKey) {
        try {
            const pubKey = new solanaWeb3.PublicKey(publicKey);
            const balance = await this.connection.getBalance(pubKey);
            const solBalance = balance / solanaWeb3.LAMPORTS_PER_SOL;
            
            console.log(`💰 SOL Balance (${publicKey}): ${solBalance} SOL`);
            return solBalance;
        } catch (error) {
            console.error(`❌ Error getting SOL balance:`, error);
            return 0;
        }
    }
    
    /**
     * Get GBUV token balance for a wallet
     * Requires SPL Token program
     */
    async getGBUVBalance(publicKey) {
        try {
            const pubKey = new solanaWeb3.PublicKey(publicKey);
            const mintPubKey = new solanaWeb3.PublicKey(this.GBUV_MINT);
            
            // Get token accounts
            const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
                pubKey,
                { mint: mintPubKey }
            );
            
            if (tokenAccounts.value.length === 0) {
                console.log(`💎 GBUV Balance (${publicKey}): 0 GBUV (no token account)`);
                return 0;
            }
            
            const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
            console.log(`💎 GBUV Balance (${publicKey}): ${balance} GBUV`);
            return balance;
        } catch (error) {
            console.error(`❌ Error getting GBUV balance:`, error);
            return 0;
        }
    }
    
    /**
     * Update all wallet balances
     */
    async updateAllBalances() {
        const wallets = this.listWallets();
        console.log(`🔄 Updating balances for ${wallets.length} wallets...`);
        
        for (const wallet of wallets) {
            wallet.balance = await this.getSOLBalance(wallet.publicKey);
            wallet.gbuvBalance = await this.getGBUVBalance(wallet.publicKey);
            this.saveWallet(wallet);
        }
        
        console.log(`✅ All balances updated`);
        return wallets;
    }
    
    // ═════════════════════════════════════════════════════════════════════════
    // TRANSACTION MANAGEMENT
    // ═════════════════════════════════════════════════════════════════════════
    
    /**
     * Send SOL from one wallet to another
     */
    async sendSOL(fromPublicKey, toPublicKey, amount) {
        try {
            const wallet = this.getWallet(fromPublicKey);
            if (!wallet) {
                throw new Error('Wallet not found');
            }
            
            const fromKeypair = solanaWeb3.Keypair.fromSecretKey(
                new Uint8Array(wallet.secretKey)
            );
            const toPubKey = new solanaWeb3.PublicKey(toPublicKey);
            
            // Create transaction
            const transaction = new solanaWeb3.Transaction().add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: fromKeypair.publicKey,
                    toPubkey: toPubKey,
                    lamports: amount * solanaWeb3.LAMPORTS_PER_SOL
                })
            );
            
            // Send transaction
            const signature = await solanaWeb3.sendAndConfirmTransaction(
                this.connection,
                transaction,
                [fromKeypair]
            );
            
            // Log transaction
            this.logTransaction({
                type: 'SOL_TRANSFER',
                from: fromPublicKey,
                to: toPublicKey,
                amount: amount,
                signature: signature,
                timestamp: new Date().toISOString(),
                status: 'confirmed'
            });
            
            console.log(`✅ Sent ${amount} SOL from ${fromPublicKey} to ${toPublicKey}`);
            console.log(`📝 Signature: ${signature}`);
            
            return signature;
        } catch (error) {
            console.error(`❌ Error sending SOL:`, error);
            
            // Log failed transaction
            this.logTransaction({
                type: 'SOL_TRANSFER',
                from: fromPublicKey,
                to: toPublicKey,
                amount: amount,
                signature: null,
                timestamp: new Date().toISOString(),
                status: 'failed',
                error: error.message
            });
            
            throw error;
        }
    }
    
    /**
     * Get or create Associated Token Account for GBUV
     * @param {solanaWeb3.PublicKey} ownerPubKey - Owner's public key
     * @returns {solanaWeb3.PublicKey} - Associated Token Account address
     */
    async getOrCreateGBUVTokenAccount(ownerPubKey, payerKeypair = null) {
        const mintPubKey = new solanaWeb3.PublicKey(this.GBUV_MINT);
        
        // SPL Token constants
        const TOKEN_PROGRAM_ID = new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
        const ASSOCIATED_TOKEN_PROGRAM_ID = new solanaWeb3.PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
        
        // Derive the associated token account address
        const [ataAddress] = await solanaWeb3.PublicKey.findProgramAddress(
            [
                ownerPubKey.toBuffer(),
                TOKEN_PROGRAM_ID.toBuffer(),
                mintPubKey.toBuffer()
            ],
            ASSOCIATED_TOKEN_PROGRAM_ID
        );
        
        // Check if account exists
        try {
            const accountInfo = await this.connection.getAccountInfo(ataAddress);
            if (accountInfo) {
                console.log(`✅ Token account exists: ${ataAddress.toString()}`);
                return ataAddress;
            }
        } catch (e) {
            // Account doesn't exist, need to create
        }
        
        // If no payer provided, can't create
        if (!payerKeypair) {
            console.log(`⚠️ Token account doesn't exist and no payer provided`);
            return ataAddress; // Return anyway, transaction will create it
        }
        
        console.log(`📝 Creating token account for ${ownerPubKey.toString()}`);
        
        // Create Associated Token Account instruction
        const createATAInstruction = new solanaWeb3.TransactionInstruction({
            keys: [
                { pubkey: payerKeypair.publicKey, isSigner: true, isWritable: true },
                { pubkey: ataAddress, isSigner: false, isWritable: true },
                { pubkey: ownerPubKey, isSigner: false, isWritable: false },
                { pubkey: mintPubKey, isSigner: false, isWritable: false },
                { pubkey: solanaWeb3.SystemProgram.programId, isSigner: false, isWritable: false },
                { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            ],
            programId: ASSOCIATED_TOKEN_PROGRAM_ID,
            data: Buffer.from([])
        });
        
        const transaction = new solanaWeb3.Transaction().add(createATAInstruction);
        
        try {
            await solanaWeb3.sendAndConfirmTransaction(
                this.connection,
                transaction,
                [payerKeypair]
            );
            console.log(`✅ Token account created: ${ataAddress.toString()}`);
        } catch (error) {
            console.warn(`⚠️ Could not create token account (may already exist):`, error.message);
        }
        
        return ataAddress;
    }
    
    /**
     * Send GBUV tokens from one wallet to another
     * REAL SPL Token transfer on Solana mainnet
     * Token: DPHcbu7wJEbcrnCYjXC8vHBkM39kT9xZg4mYayvrpump (pump.fun)
     */
    async sendGBUV(fromPublicKey, toPublicKey, amount) {
        try {
            console.log(`💎 Sending ${amount} GBUV from ${fromPublicKey} to ${toPublicKey}`);
            
            // Get sender wallet with private key
            const wallet = this.getWallet(fromPublicKey);
            if (!wallet) {
                throw new Error('Sender wallet not found in storage');
            }
            
            if (!wallet.secretKey) {
                throw new Error('Sender wallet private key not available');
            }
            
            // Create keypairs
            const fromKeypair = solanaWeb3.Keypair.fromSecretKey(new Uint8Array(wallet.secretKey));
            const toPubKey = new solanaWeb3.PublicKey(toPublicKey);
            const mintPubKey = new solanaWeb3.PublicKey(this.GBUV_MINT);
            
            // SPL Token Program ID
            const TOKEN_PROGRAM_ID = new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
            
            // Get token accounts
            const fromTokenAccount = await this.getOrCreateGBUVTokenAccount(fromKeypair.publicKey, fromKeypair);
            const toTokenAccount = await this.getOrCreateGBUVTokenAccount(toPubKey, fromKeypair);
            
            // GBUV has 6 decimals (standard for pump.fun tokens)
            const GBUV_DECIMALS = 6;
            const transferAmount = BigInt(Math.floor(amount * Math.pow(10, GBUV_DECIMALS)));
            
            console.log(`📊 Transfer details:`);
            console.log(`   From ATA: ${fromTokenAccount.toString()}`);
            console.log(`   To ATA: ${toTokenAccount.toString()}`);
            console.log(`   Amount: ${amount} GBUV (${transferAmount} raw)`);
            
            // Create transfer instruction using raw instruction data
            // Instruction 3 = Transfer, followed by u64 amount (little-endian)
            const dataBuffer = Buffer.alloc(9);
            dataBuffer.writeUInt8(3, 0); // Transfer instruction
            dataBuffer.writeBigUInt64LE(transferAmount, 1); // Amount
            
            const transferInstruction = new solanaWeb3.TransactionInstruction({
                keys: [
                    { pubkey: fromTokenAccount, isSigner: false, isWritable: true },
                    { pubkey: toTokenAccount, isSigner: false, isWritable: true },
                    { pubkey: fromKeypair.publicKey, isSigner: true, isWritable: false }
                ],
                programId: TOKEN_PROGRAM_ID,
                data: dataBuffer
            });
            
            // Build transaction
            const transaction = new solanaWeb3.Transaction().add(transferInstruction);
            
            // Get recent blockhash
            const { blockhash } = await this.connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = fromKeypair.publicKey;
            
            // Sign and send
            console.log(`📤 Sending transaction...`);
            const signature = await solanaWeb3.sendAndConfirmTransaction(
                this.connection,
                transaction,
                [fromKeypair],
                { commitment: 'confirmed' }
            );
            
            // Log successful transaction
            this.logTransaction({
                type: 'GBUV_TRANSFER',
                from: fromPublicKey,
                to: toPublicKey,
                amount: amount,
                signature: signature,
                timestamp: new Date().toISOString(),
                status: 'confirmed',
                explorer: `https://solscan.io/tx/${signature}`
            });
            
            console.log(`✅ GBUV transfer confirmed!`);
            console.log(`📝 Signature: ${signature}`);
            console.log(`🔗 Explorer: https://solscan.io/tx/${signature}`);
            
            // Update balances
            await this.updateWalletBalance(fromPublicKey);
            
            return signature;
            
        } catch (error) {
            console.error(`❌ Error sending GBUV:`, error);
            
            // Log failed transaction
            this.logTransaction({
                type: 'GBUV_TRANSFER',
                from: fromPublicKey,
                to: toPublicKey,
                amount: amount,
                signature: null,
                timestamp: new Date().toISOString(),
                status: 'failed',
                error: error.message
            });
            
            // Provide helpful error messages
            if (error.message.includes('insufficient')) {
                throw new Error(`Insufficient balance. Make sure you have enough GBUV and SOL for fees (~0.01 SOL)`);
            } else if (error.message.includes('not found')) {
                throw new Error(`Wallet not found. Ensure the wallet is registered in the system.`);
            } else {
                throw error;
            }
        }
    }
    
    /**
     * Update a single wallet's balance
     */
    async updateWalletBalance(publicKey) {
        const wallet = this.getWallet(publicKey);
        if (wallet) {
            wallet.balance = await this.getSOLBalance(publicKey);
            wallet.gbuvBalance = await this.getGBUVBalance(publicKey);
            this.saveWallet(wallet);
        }
    }
    
    /**
     * Log transaction to storage
     */
    logTransaction(transaction) {
        const transactions = JSON.parse(localStorage.getItem('gembot_transactions') || '[]');
        transactions.push(transaction);
        
        // Keep only last 1000 transactions
        if (transactions.length > 1000) {
            transactions.shift();
        }
        
        localStorage.setItem('gembot_transactions', JSON.stringify(transactions));
    }
    
    /**
     * Get transaction history
     */
    getTransactionHistory(limit = 100) {
        const transactions = JSON.parse(localStorage.getItem('gembot_transactions') || '[]');
        return transactions.slice(-limit).reverse();
    }
    
    /**
     * Get transactions for a specific wallet
     */
    getWalletTransactions(publicKey, limit = 100) {
        const transactions = JSON.parse(localStorage.getItem('gembot_transactions') || '[]');
        return transactions
            .filter(tx => tx.from === publicKey || tx.to === publicKey)
            .slice(-limit)
            .reverse();
    }
    
    // ═════════════════════════════════════════════════════════════════════════
    // BATCH OPERATIONS
    // ═════════════════════════════════════════════════════════════════════════
    
    /**
     * Distribute GBUV to multiple wallets
     */
    async distributeGBUV(fromPublicKey, recipients, amount) {
        console.log(`📤 Distributing ${amount} GBUV to ${recipients.length} recipients...`);
        
        const results = [];
        
        for (const recipient of recipients) {
            try {
                const signature = await this.sendGBUV(fromPublicKey, recipient, amount);
                results.push({ recipient, signature, status: 'success' });
                console.log(`✅ Sent to ${recipient}`);
            } catch (error) {
                results.push({ recipient, error: error.message, status: 'failed' });
                console.error(`❌ Failed to send to ${recipient}:`, error.message);
            }
            
            // Add delay between transactions to avoid rate limiting
            await this.sleep(500);
        }
        
        const successful = results.filter(r => r.status === 'success').length;
        console.log(`✅ Distribution complete: ${successful}/${recipients.length} successful`);
        
        return results;
    }
    
    /**
     * Generate wallets for AI agents
     */
    generateAgentWallets(count) {
        console.log(`🤖 Generating ${count} AI agent wallets...`);
        
        const wallets = [];
        const personalities = ['casual', 'hardcore', 'strategic', 'social'];
        
        for (let i = 0; i < count; i++) {
            const personality = personalities[i % personalities.length];
            const wallet = this.generateWallet(`agent-${personality}-${i + 1}`);
            wallets.push(wallet);
        }
        
        console.log(`✅ Generated ${count} agent wallets`);
        return wallets;
    }
    
    // ═════════════════════════════════════════════════════════════════════════
    // UTILITY FUNCTIONS
    // ═════════════════════════════════════════════════════════════════════════
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Get Solana Explorer link for transaction
     */
    getExplorerLink(signature) {
        const baseUrl = this.network === 'mainnet-beta'
            ? 'https://explorer.solana.com/tx/'
            : 'https://explorer.solana.com/tx/?cluster=devnet';
        
        return `${baseUrl}${signature}`;
    }
    
    /**
     * Get wallet info (balances + transaction count)
     */
    async getWalletInfo(publicKey) {
        const wallet = this.getWallet(publicKey);
        const solBalance = await this.getSOLBalance(publicKey);
        const gbuvBalance = await this.getGBUVBalance(publicKey);
        const transactions = this.getWalletTransactions(publicKey);
        
        return {
            ...wallet,
            balance: solBalance,
            gbuvBalance: gbuvBalance,
            transactionCount: transactions.length
        };
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// GLOBAL INSTANCE & CONVENIENCE FUNCTIONS
// ═════════════════════════════════════════════════════════════════════════════

// Initialize wallet system - MAINNET for real GBUV transactions
// GBUV Token: DPHcbu7wJEbcrnCYjXC8vHBkM39kT9xZg4mYayvrpump (pump.fun)
window.solanaWallet = new GemBotSolanaWallet('mainnet-beta');

// Convenience functions for console testing
window.generateWallet = (label) => window.solanaWallet.generateWallet(label);
window.listWallets = () => window.solanaWallet.listWallets();
window.getWalletInfo = (publicKey) => window.solanaWallet.getWalletInfo(publicKey);
window.sendSOL = (from, to, amount) => window.solanaWallet.sendSOL(from, to, amount);
window.sendGBUV = (from, to, amount) => window.solanaWallet.sendGBUV(from, to, amount);
window.getTransactionHistory = () => window.solanaWallet.getTransactionHistory();
window.generateAgentWallets = (count) => window.solanaWallet.generateAgentWallets(count);

console.log(`
═══════════════════════════════════════════════════════════════════════════
🔐 GEMBOT SOLANA WALLET SYSTEM LOADED (MAINNET)
═══════════════════════════════════════════════════════════════════════════

⚠️ IMPORTANT SETUP REQUIRED:
1. Update GBUV_MINT with your token mint address
2. Update ADMIN_WALLET with your wallet address
3. Add Solana Web3.js to HTML:
   <script src="https://cdn.jsdelivr.net/npm/@solana/web3.js@latest/lib/index.iife.min.js"></script>

📚 Quick Start Commands:
   generateWallet('my-wallet')           - Create new wallet
   listWallets()                          - List all wallets
   getWalletInfo('PUBLIC_KEY')           - Get wallet details
   sendSOL('FROM_KEY', 'TO_KEY', 0.1)    - Send 0.1 SOL
   sendGBUV('FROM_KEY', 'TO_KEY', 100)   - Send 100 GBUV
   getTransactionHistory()                - View transactions
   generateAgentWallets(10)               - Create 10 agent wallets

🌐 Network: ${window.solanaWallet.network}
📡 RPC: ${window.solanaWallet.rpcUrl}

⚠️ SECURITY WARNING:
- This development version stores private keys in localStorage
- NEVER use localStorage for production private keys
- Use hardware wallets or secure key management services
- Enable 2FA on all admin accounts
- Regularly audit all transactions

═══════════════════════════════════════════════════════════════════════════
`);
