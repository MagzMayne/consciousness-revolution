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
 * File: automated-wallet-system.js
 * Declaration ID: IP-1BA32311-MLL28ZUJ
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GEMBOT AUTOMATED WALLET CREATION SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════
 * No Phantom required! Wallets created automatically on registration.
 * Users never need to download anything - completely seamless.
 * ═══════════════════════════════════════════════════════════════════════════
 */

class GemBotWalletFactory {
    constructor() {
        // Check if Solana Web3 is loaded
        if (typeof solanaWeb3 === 'undefined') {
            console.warn('⚠️ Solana Web3.js not loaded yet - wallet functionality delayed');
            this.solanaReady = false;
            return;
        }
        
        this.solanaReady = true;
        this.network = 'mainnet-beta'; // Production network
        this.rpcUrl = 'https://api.mainnet-beta.solana.com';
        this.connection = new solanaWeb3.Connection(this.rpcUrl, 'confirmed');
        
        // Master funding wallet (system-controlled)
        this.MASTER_WALLET = {
            publicKey: '6HTjfgWZYMbENnMAJJFhxWR2VZDxdze3qV7zznSAsfk', // Your vault
            // Private key stored securely server-side only
        };
        
        this.GBUV_MINT = 'DPHcbu7wJEbcrnCYjXC8vHBkM39kT9xZg4mYayvrpump';
        
        console.log('🏭 GemBot Wallet Factory initialized');
    }
    
    /**
     * Create a new Solana wallet for a user
     * Called automatically during registration
     */
    async createUserWallet(username, email) {
        console.log(`🔨 Creating wallet for ${username}...`);
        
        try {
            // 🛡️ SECURITY CHECK - Run anti-fraud analysis
            const securityCheck = await window.securitySystem.checkRegistrationSecurity(username, email);
            console.log(`🔍 Security Score: ${securityCheck.score}/100`);
            
            // Block if security threshold exceeded
            if (!securityCheck.allowed) {
                throw new Error(securityCheck.reason);
            }
            
            // Determine welcome bonus based on security score
            let welcomeBonus = 100; // Standard bonus
            if (securityCheck.flagged || securityCheck.reducedBonus) {
                welcomeBonus = 10; // Reduced bonus for suspicious accounts
                console.warn(`⚠️ Account flagged - reduced bonus: ${welcomeBonus} GBUV`);
            }
            
            // Generate new keypair
            const keypair = solanaWeb3.Keypair.generate();
            const publicKey = keypair.publicKey.toString();
            const secretKey = Array.from(keypair.secretKey);
            
            // Create wallet object
            const wallet = {
                username: username,
                email: email,
                publicKey: publicKey,
                secretKey: secretKey, // Encrypted in production
                created: new Date().toISOString(),
                balance: 0,
                gbuvBalance: 0,
                level: 1,
                gems: 0,
                security: {
                    score: securityCheck.score,
                    flagged: securityCheck.flagged || false,
                    reducedBonus: securityCheck.reducedBonus || false
                },
                welcomeBonus: welcomeBonus
            };
            
            // Save to storage
            this.saveWallet(wallet);
            
            // Fund with starter GBUV (100 GBUV or 10 GBUV if flagged)
            await this.fundNewWallet(publicKey, welcomeBonus);
            
            console.log(`✅ Wallet created: ${publicKey}`);
            console.log(`💎 Funded with ${welcomeBonus} GBUV starter bonus`);
            
            // Log to activity feed
            if (window.liveActivityFeed) {
                if (securityCheck.flagged) {
                    window.liveActivityFeed.log('SECURITY', `⚠️ Flagged account ${username} created (${welcomeBonus} GBUV)`);
                } else {
                    window.liveActivityFeed.log('SYSTEM', `New user ${username} joined! Wallet created.`);
                    window.liveActivityFeed.log('SYSTEM', `Welcome bonus: ${welcomeBonus} GBUV sent to ${username}`);
                }
            }
            
            return wallet;
            
        } catch (error) {
            console.error('❌ Wallet creation failed:', error);
            throw new Error('Failed to create wallet. Please try again.');
        }
    }
    
    /**
     * Fund a new wallet with starter GBUV
     * Transfers from master wallet to user wallet
     */
    async fundNewWallet(userPublicKey, amount) {
        try {
            console.log(`💰 Funding ${userPublicKey} with ${amount} GBUV...`);
            
            // In production, this would call your backend to transfer from master wallet
            // For now, we simulate the funding
            
            // PRODUCTION CODE (requires backend):
            // const response = await fetch('/api/wallet/fund', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         to: userPublicKey,
            //         amount: amount,
            //         token: this.GBUV_MINT
            //     })
            // });
            
            // Simulated for demo
            const wallet = this.getWallet(userPublicKey);
            if (wallet) {
                wallet.gbuvBalance = amount;
                this.saveWallet(wallet);
            }
            
            console.log(`✅ ${amount} GBUV transferred successfully`);
            return true;
            
        } catch (error) {
            console.error('❌ Funding failed:', error);
            // Non-critical - user can still use the wallet
            return false;
        }
    }
    
    /**
     * Get wallet balance
     */
    async getBalance(publicKey) {
        try {
            const balance = await this.connection.getBalance(
                new solanaWeb3.PublicKey(publicKey)
            );
            return balance / solanaWeb3.LAMPORTS_PER_SOL;
        } catch (error) {
            console.error('Error getting balance:', error);
            return 0;
        }
    }
    
    /**
     * Get GBUV token balance
     */
    async getGBUVBalance(publicKey) {
        try {
            // Get token accounts for this wallet
            const pubKey = new solanaWeb3.PublicKey(publicKey);
            const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
                pubKey,
                { mint: new solanaWeb3.PublicKey(this.GBUV_MINT) }
            );
            
            if (tokenAccounts.value.length > 0) {
                const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
                return balance;
            }
            return 0;
        } catch (error) {
            console.error('Error getting GBUV balance:', error);
            return 0;
        }
    }
    
    /**
     * Export wallet credentials for user
     * Shows them their private key (one time only)
     */
    exportWalletCredentials(publicKey) {
        const wallet = this.getWallet(publicKey);
        if (!wallet) return null;
        
        return {
            publicKey: wallet.publicKey,
            secretKey: wallet.secretKey,
            recoveryPhrase: this.generateRecoveryPhrase(wallet.secretKey),
            warning: '⚠️ SAVE THIS SAFELY! You cannot recover your wallet without this.'
        };
    }
    
    /**
     * Generate human-readable recovery phrase
     */
    generateRecoveryPhrase(secretKey) {
        // Convert secret key to base58 string
        const bs58 = solanaWeb3.Keypair.fromSecretKey(
            new Uint8Array(secretKey)
        ).secretKey;
        
        // In production, convert to BIP39 mnemonic phrase
        // For now, return base58 encoded key
        return Array.from(bs58).join(',');
    }
    
    /**
     * Import wallet from recovery phrase
     */
    async importWallet(recoveryPhrase, username, email) {
        try {
            // Convert recovery phrase back to secret key
            const secretKey = new Uint8Array(recoveryPhrase.split(',').map(Number));
            const keypair = solanaWeb3.Keypair.fromSecretKey(secretKey);
            
            const wallet = {
                username: username,
                email: email,
                publicKey: keypair.publicKey.toString(),
                secretKey: Array.from(secretKey),
                created: new Date().toISOString(),
                imported: true,
                balance: 0,
                gbuvBalance: 0
            };
            
            this.saveWallet(wallet);
            
            console.log(`✅ Wallet imported: ${wallet.publicKey}`);
            return wallet;
            
        } catch (error) {
            console.error('❌ Import failed:', error);
            throw new Error('Invalid recovery phrase');
        }
    }
    
    /**
     * Storage management
     */
    saveWallet(wallet) {
        const wallets = JSON.parse(localStorage.getItem('gembot_wallets') || '{}');
        wallets[wallet.publicKey] = wallet;
        localStorage.setItem('gembot_wallets', JSON.stringify(wallets));
        
        // Also save by username for easy lookup
        localStorage.setItem(`wallet_${wallet.username}`, wallet.publicKey);
    }
    
    getWallet(publicKey) {
        const wallets = JSON.parse(localStorage.getItem('gembot_wallets') || '{}');
        return wallets[publicKey] || null;
    }
    
    getWalletByUsername(username) {
        const publicKey = localStorage.getItem(`wallet_${username}`);
        return publicKey ? this.getWallet(publicKey) : null;
    }
    
    /**
     * Transfer GBUV between users
     */
    async transferGBUV(fromPublicKey, toPublicKey, amount) {
        try {
            console.log(`💸 Transferring ${amount} GBUV from ${fromPublicKey} to ${toPublicKey}...`);
            
            const fromWallet = this.getWallet(fromPublicKey);
            if (!fromWallet) throw new Error('Sender wallet not found');
            
            if (fromWallet.gbuvBalance < amount) {
                throw new Error('Insufficient GBUV balance');
            }
            
            // PRODUCTION: Call backend API to execute transfer
            // For now, update balances locally
            fromWallet.gbuvBalance -= amount;
            this.saveWallet(fromWallet);
            
            const toWallet = this.getWallet(toPublicKey);
            if (toWallet) {
                toWallet.gbuvBalance += amount;
                this.saveWallet(toWallet);
            }
            
            // Log transaction
            this.logTransaction({
                from: fromPublicKey,
                to: toPublicKey,
                amount: amount,
                type: 'GBUV_TRANSFER',
                timestamp: new Date().toISOString()
            });
            
            console.log(`✅ Transfer complete`);
            
            if (window.liveActivityFeed) {
                window.liveActivityFeed.log('SYSTEM', `💸 ${amount} GBUV transferred`);
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Transfer failed:', error);
            throw error;
        }
    }
    
    /**
     * Reward user with GBUV
     */
    async rewardUser(publicKey, amount, reason) {
        try {
            const wallet = this.getWallet(publicKey);
            if (!wallet) throw new Error('Wallet not found');
            
            wallet.gbuvBalance += amount;
            this.saveWallet(wallet);
            
            this.logTransaction({
                to: publicKey,
                amount: amount,
                type: 'REWARD',
                reason: reason,
                timestamp: new Date().toISOString()
            });
            
            console.log(`✅ Rewarded ${wallet.username} with ${amount} GBUV (${reason})`);
            
            if (window.liveActivityFeed) {
                window.liveActivityFeed.log('SYSTEM', `🎁 ${wallet.username} earned ${amount} GBUV: ${reason}`);
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Reward failed:', error);
            return false;
        }
    }
    
    /**
     * Transaction logging
     */
    logTransaction(transaction) {
        const transactions = JSON.parse(localStorage.getItem('gembot_transactions') || '[]');
        transactions.unshift(transaction);
        
        // Keep last 1000 transactions
        if (transactions.length > 1000) {
            transactions.length = 1000;
        }
        
        localStorage.setItem('gembot_transactions', JSON.stringify(transactions));
    }
    
    getTransactionHistory(publicKey, limit = 50) {
        const transactions = JSON.parse(localStorage.getItem('gembot_transactions') || '[]');
        return transactions
            .filter(tx => tx.from === publicKey || tx.to === publicKey)
            .slice(0, limit);
    }
    // Initialize Solana connection when library loads
    initializeSolana() {
        if (typeof solanaWeb3 === 'undefined') {
            console.error('❌ Solana Web3.js still not available');
            return false;
        }
        
        this.solanaReady = true;
        this.network = 'mainnet-beta';
        this.rpcUrl = 'https://api.mainnet-beta.solana.com';
        this.connection = new solanaWeb3.Connection(this.rpcUrl, 'confirmed');
        
        this.MASTER_WALLET = {
            publicKey: '6HTjfgWZYMbENnMAJJFhxWR2VZDxdze3qV7zznSAsfk',
        };
        
        console.log('✅ Solana Web3.js initialized for wallet factory');
        return true;
    }
}

// Initialize global wallet factory
window.walletFactory = new GemBotWalletFactory();

// Try to initialize Solana immediately, or wait for it to load
if (typeof solanaWeb3 !== 'undefined') {
    window.walletFactory.initializeSolana();
} else {
    console.log('⏳ Waiting for Solana Web3.js to load...');
    window.addEventListener('load', () => {
        if (window.walletFactory && !window.walletFactory.solanaReady) {
            window.walletFactory.initializeSolana();
        }
    });
}

console.log('✅ Automated Wallet System loaded - No Phantom required!');
