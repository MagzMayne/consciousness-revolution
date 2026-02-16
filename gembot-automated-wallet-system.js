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
 * File: gembot-automated-wallet-system.js
 * Declaration ID: IP-42B4B21A-MLL28ZUW
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GEMBOT AUTOMATED WALLET SYSTEM - NO APP REQUIRED
 * ═══════════════════════════════════════════════════════════════════════════
 * Creates and manages wallets for users and agents automatically
 * All crypto operations handled in-browser without external wallet apps
 * Based on Solana Web3.js official documentation
 * 
 * OWNERSHIP: Ryan Barbrick / Barbrick Design
 * REFERENCE: https://solana.com/developers
 * ═══════════════════════════════════════════════════════════════════════════
 */

class GemBotAutomatedWalletSystem {
    constructor() {
        this.connection = new solanaWeb3.Connection(
            'https://api.mainnet-beta.solana.com',
            'confirmed'
        );
        
        // VAULT POOL - Main treasury wallet (read-only monitoring)
        this.VAULT_POOL_ADDRESS = '6HTjfgWZYMbENnMAJJFhxWR2VZDxdze3qV7zznSAsfk';
        
        // Core system wallet (hot wallet for operations)
        this.coreWallet = null;
        this.GBUV_MINT = 'DPHcbu7wJEbcrnCYjXC8vHBkM39kT9xZg4mYayvrpump';
        
        // Bubble map for fund flow visualization
        this.BUBBLE_MAP_URL = 'https://app.insightx.network/bubblemaps/solana/DPHcbu7wJEbcrnCYjXC8vHBkM39kT9xZg4mYayvrpump/1765937152';
        
        // Storage keys
        this.STORAGE = {
            CORE_WALLET: 'gembot_core_wallet',
            USER_WALLETS: 'gembot_user_wallets',
            AGENT_WALLETS: 'gembot_agent_wallets',
            TRANSACTIONS: 'gembot_transactions',
            VAULT_BALANCE: 'gembot_vault_balance'
        };
        
        console.log('🤖 GemBot Automated Wallet System initialized');
        this.initialize();
    }
    
    // ═════════════════════════════════════════════════════════════════════════
    // SYSTEM INITIALIZATION
    // ═════════════════════════════════════════════════════════════════════════
    
    async initialize() {
        // Load or create core wallet
        const stored = localStorage.getItem(this.STORAGE.CORE_WALLET);
        
        if (stored) {
            const data = JSON.parse(stored);
            this.coreWallet = solanaWeb3.Keypair.fromSecretKey(
                new Uint8Array(data.secretKey)
            );
            console.log('✅ Core wallet loaded:', this.coreWallet.publicKey.toString());
        } else {
            await this.createCoreWallet();
        }
        
        // Initialize storage
        if (!localStorage.getItem(this.STORAGE.USER_WALLETS)) {
            localStorage.setItem(this.STORAGE.USER_WALLETS, JSON.stringify({}));
        }
        if (!localStorage.getItem(this.STORAGE.AGENT_WALLETS)) {
            localStorage.setItem(this.STORAGE.AGENT_WALLETS, JSON.stringify({}));
        }
        if (!localStorage.getItem(this.STORAGE.TRANSACTIONS)) {
            localStorage.setItem(this.STORAGE.TRANSACTIONS, JSON.stringify([]));
        }
        
        // Check core wallet balance
        await this.checkCoreBalance();
        
        // Log to activity feed
        if (window.liveActivityFeed) {
            window.liveActivityFeed.log('SYSTEM', 
                `Core Wallet: ${this.coreWallet.publicKey.toString().substring(0, 8)}...`
            );
        }
    }
    
    async createCoreWallet() {
        console.log('🔧 Creating new core wallet...');
        
        // Generate new keypair using Solana Web3.js
        this.coreWallet = solanaWeb3.Keypair.generate();
        
        // Store encrypted (in production, use proper encryption)
        const walletData = {
            publicKey: this.coreWallet.publicKey.toString(),
            secretKey: Array.from(this.coreWallet.secretKey),
            created: new Date().toISOString(),
            type: 'CORE_OPERATIONS'
        };
        
        localStorage.setItem(this.STORAGE.CORE_WALLET, JSON.stringify(walletData));
        
        console.log('✅ Core wallet created!');
        console.log('📍 Address:', this.coreWallet.publicKey.toString());
        console.log('⚠️ FUND THIS WALLET WITH GBUV FOR OPERATIONS');
        
        // Display funding instructions
        this.showFundingInstructions();
        
        return this.coreWallet;
    }
    
    showFundingInstructions() {
        const address = this.coreWallet.publicKey.toString();
        
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                    FUND YOUR GEMBOT CORE WALLET                           ║
╚═══════════════════════════════════════════════════════════════════════════╝

📍 Send GBUV to this address:
   ${address}

💰 Recommended amounts:
   - Testing: 1,000 GBUV
   - Pilot (3 domains): 10,000 GBUV
   - Full launch (15 domains): 100,000 GBUV

🔗 Token: ${this.GBUV_MINT}

📝 How to fund:
   1. Open your Phantom/Solflare wallet
   2. Select GBUV token
   3. Send to address above
   4. System will automatically detect and start operations

⚠️ This wallet handles automated distributions. Keep it funded!
        `);
        
        if (window.liveActivityFeed) {
            window.liveActivityFeed.log('SYSTEM', 
                `🔴 CORE WALLET NEEDS FUNDING: ${address.substring(0, 20)}...`
            );
        }
    }
    
    async checkCoreBalance() {
        try {
            // Get SOL balance
            const solBalance = await this.connection.getBalance(this.coreWallet.publicKey);
            const solAmount = solBalance / solanaWeb3.LAMPORTS_PER_SOL;
            
            // Get GBUV balance from token account
            let gbuvBalance = 0;
            try {
                const tokenAccount = await this.getAssociatedTokenAddress(this.coreWallet.publicKey);
                const accountInfo = await this.connection.getAccountInfo(tokenAccount);
                
                if (accountInfo) {
                    // Parse token account data - balance is at bytes 64-72
                    const data = accountInfo.data;
                    const amountBuffer = data.slice(64, 72);
                    const rawBalance = new DataView(amountBuffer.buffer, amountBuffer.byteOffset, 8).getBigUint64(0, true);
                    gbuvBalance = Number(rawBalance) / Math.pow(10, this.GBUV_DECIMALS);
                }
            } catch (tokenError) {
                console.log('📝 No GBUV token account yet (will be created on first transfer)');
            }
            
            console.log(`💰 Core Wallet Balance:`);
            console.log(`   SOL: ${solAmount.toFixed(4)}`);
            console.log(`   GBUV: ${gbuvBalance.toLocaleString()}`);
            
            if (gbuvBalance < 1000) {
                console.warn('⚠️ Low GBUV balance! Please fund core wallet.');
                if (window.liveActivityFeed) {
                    window.liveActivityFeed.logError(
                        'Core wallet low on GBUV. Fund needed for operations.'
                    );
                }
            }
            
            if (solAmount < 0.01) {
                console.warn('⚠️ Low SOL balance! Need ~0.01 SOL for transaction fees.');
                if (window.liveActivityFeed) {
                    window.liveActivityFeed.logError(
                        'Core wallet needs SOL for transaction fees.'
                    );
                }
            }
            
            return { sol: solAmount, gbuv: gbuvBalance };
        } catch (error) {
            console.error('❌ Error checking balance:', error);
            return { sol: 0, gbuv: 0 };
        }
    }
    
    // ═════════════════════════════════════════════════════════════════════════
    // VAULT POOL MONITORING
    // ═════════════════════════════════════════════════════════════════════════
    
    async getVaultPoolBalance() {
        try {
            const vaultPubkey = new solanaWeb3.PublicKey(this.VAULT_POOL_ADDRESS);
            
            // Get SOL balance
            const solBalance = await this.connection.getBalance(vaultPubkey);
            const solAmount = solBalance / solanaWeb3.LAMPORTS_PER_SOL;
            
            // Get GBUV balance
            let gbuvBalance = 0;
            try {
                const tokenAccount = await this.getAssociatedTokenAddress(vaultPubkey);
                const accountInfo = await this.connection.getAccountInfo(tokenAccount);
                
                if (accountInfo) {
                    const data = accountInfo.data;
                    const amountBuffer = data.slice(64, 72);
                    const rawBalance = new DataView(amountBuffer.buffer, amountBuffer.byteOffset, 8).getBigUint64(0, true);
                    gbuvBalance = Number(rawBalance) / Math.pow(10, this.GBUV_DECIMALS);
                }
            } catch (e) {
                console.log('📝 Vault pool token account not found');
            }
            
            const vaultData = {
                address: this.VAULT_POOL_ADDRESS,
                sol: solAmount,
                gbuv: gbuvBalance,
                lastUpdated: new Date().toISOString()
            };
            
            localStorage.setItem(this.STORAGE.VAULT_BALANCE, JSON.stringify(vaultData));
            
            console.log(`🏦 Vault Pool Balance:`);
            console.log(`   Address: ${this.VAULT_POOL_ADDRESS}`);
            console.log(`   SOL: ${solAmount.toFixed(4)}`);
            console.log(`   GBUV: ${gbuvBalance.toLocaleString()}`);
            
            return vaultData;
        } catch (error) {
            console.error('❌ Error checking vault pool:', error);
            return { address: this.VAULT_POOL_ADDRESS, sol: 0, gbuv: 0 };
        }
    }
    
    getBubbleMapUrl() {
        return this.BUBBLE_MAP_URL;
    }
    
    openBubbleMap() {
        window.open(this.BUBBLE_MAP_URL, '_blank');
    }
    
    createBubbleMapEmbed(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Container not found:', containerId);
            return;
        }
        
        container.innerHTML = `
            <div style="position: relative; width: 100%; height: 100%; min-height: 400px;">
                <iframe 
                    src="${this.BUBBLE_MAP_URL}" 
                    style="width: 100%; height: 100%; border: none; border-radius: 12px;"
                    title="GBUV Token Bubble Map"
                    loading="lazy"
                ></iframe>
                <div style="position: absolute; bottom: 10px; right: 10px;">
                    <button onclick="window.gemBotWalletSystem.openBubbleMap()" 
                            style="padding: 8px 16px; background: linear-gradient(135deg, #00ffff, #ff00ff); 
                                   border: none; border-radius: 8px; color: #000; font-weight: bold; cursor: pointer;">
                        🔗 Open Full Map
                    </button>
                </div>
            </div>
        `;
        
        console.log('📊 Bubble map embedded in:', containerId);
    }
    
    // ═════════════════════════════════════════════════════════════════════════
    // USER WALLET CREATION (AUTOMATIC - NO APP REQUIRED)
    // ═════════════════════════════════════════════════════════════════════════
    
    async createUserWallet(userId, username) {
        console.log(`🔧 Creating wallet for user: ${username}...`);
        
        // Generate new keypair
        const keypair = solanaWeb3.Keypair.generate();
        const publicKey = keypair.publicKey.toString();
        
        // Create wallet object
        const wallet = {
            userId: userId,
            username: username,
            publicKey: publicKey,
            secretKey: Array.from(keypair.secretKey), // Encrypted in production
            created: new Date().toISOString(),
            balance: {
                sol: 0,
                gbuv: 0
            },
            transactions: [],
            type: 'USER'
        };
        
        // Store wallet
        const wallets = JSON.parse(localStorage.getItem(this.STORAGE.USER_WALLETS));
        wallets[userId] = wallet;
        localStorage.setItem(this.STORAGE.USER_WALLETS, JSON.stringify(wallets));
        
        console.log(`✅ Wallet created for ${username}`);
        console.log(`📍 Address: ${publicKey}`);
        
        // Give welcome bonus
        await this.sendWelcomeBonus(publicKey, username);
        
        if (window.liveActivityFeed) {
            window.liveActivityFeed.log('USER', 
                `${username} joined! Wallet created: ${publicKey.substring(0, 8)}...`
            );
        }
        
        return wallet;
    }
    
    async sendWelcomeBonus(userPublicKey, username) {
        const welcomeAmount = 100; // 100 GBUV welcome bonus
        
        console.log(`🎁 Sending ${welcomeAmount} GBUV welcome bonus to ${username}...`);
        
        try {
            // Use real transfer with the core wallet
            const tx = await this.executeTransfer(
                this.coreWallet,
                userPublicKey,
                welcomeAmount,
                'WELCOME_BONUS'
            );
            
            if (window.liveActivityFeed) {
                window.liveActivityFeed.log('SYSTEM', 
                    `🎁 ${username} received ${welcomeAmount} GBUV welcome bonus!`
                );
            }
            
            return tx;
        } catch (error) {
            console.error(`❌ Failed to send welcome bonus to ${username}:`, error);
            if (window.liveActivityFeed) {
                window.liveActivityFeed.logError(
                    `Failed to send welcome bonus to ${username}`
                );
            }
        }
    }
    
    // ═════════════════════════════════════════════════════════════════════════
    // AGENT WALLET CREATION
    // ═════════════════════════════════════════════════════════════════════════
    
    async createAgentWallet(agentId, agentName, domain) {
        console.log(`🤖 Creating wallet for agent: ${agentName}...`);
        
        // Generate new keypair
        const keypair = solanaWeb3.Keypair.generate();
        const publicKey = keypair.publicKey.toString();
        
        // Create wallet object
        const wallet = {
            agentId: agentId,
            agentName: agentName,
            domain: domain,
            publicKey: publicKey,
            secretKey: Array.from(keypair.secretKey),
            created: new Date().toISOString(),
            balance: {
                sol: 0,
                gbuv: 0
            },
            earnings: 0,
            transactions: [],
            type: 'AGENT'
        };
        
        // Store wallet
        const wallets = JSON.parse(localStorage.getItem(this.STORAGE.AGENT_WALLETS));
        wallets[agentId] = wallet;
        localStorage.setItem(this.STORAGE.AGENT_WALLETS, JSON.stringify(wallets));
        
        console.log(`✅ Agent wallet created: ${agentName}`);
        console.log(`📍 Address: ${publicKey}`);
        
        // Give starting funds
        await this.fundAgent(publicKey, agentName, 50); // 50 GBUV to start
        
        if (window.liveActivityFeed) {
            window.liveActivityFeed.logAgentAction(agentName, 
                'Wallet created and funded with 50 GBUV'
            );
        }
        
        return wallet;
    }
    
    async fundAgent(agentPublicKey, agentName, amount) {
        console.log(`💰 Funding agent ${agentName} with ${amount} GBUV...`);
        
        try {
            const tx = await this.executeTransfer(
                this.coreWallet,
                agentPublicKey,
                amount,
                'AGENT_FUNDING'
            );
            
            console.log(`✅ Agent ${agentName} funded with ${amount} GBUV`);
            return tx;
        } catch (error) {
            console.error(`❌ Failed to fund agent ${agentName}:`, error);
            throw error;
        }
    }
    
    // ═════════════════════════════════════════════════════════════════════════
    // AUTOMATED DISTRIBUTION SYSTEM
    // ═════════════════════════════════════════════════════════════════════════
    
    async distributeReward(recipientPublicKey, amount, reason, recipientName) {
        console.log(`💎 Distributing ${amount} GBUV to ${recipientName} (${reason})`);
        
        try {
            const tx = await this.executeTransfer(
                this.coreWallet,
                recipientPublicKey,
                amount,
                'REWARD'
            );
            
            // Add metadata
            tx.reason = reason;
            tx.recipient = recipientName;
            
            if (window.liveActivityFeed) {
                window.liveActivityFeed.log('SYSTEM', 
                    `💎 ${recipientName} earned ${amount} GBUV: ${reason}`
                );
            }
            
            return tx;
        } catch (error) {
            console.error(`❌ Failed to distribute reward to ${recipientName}:`, error);
            if (window.liveActivityFeed) {
                window.liveActivityFeed.logError(
                    `Failed to distribute ${amount} GBUV to ${recipientName}`
                );
            }
            throw error;
        }
    }
    
    async payAgentSalary(agentId) {
        const wallets = JSON.parse(localStorage.getItem(this.STORAGE.AGENT_WALLETS));
        const agent = wallets[agentId];
        
        if (!agent) {
            console.error(`Agent ${agentId} not found`);
            return;
        }
        
        const salary = 10; // 10 GBUV per payment cycle
        
        await this.distributeReward(
            agent.publicKey,
            salary,
            'Daily salary',
            agent.agentName
        );
        
        // Update earnings
        agent.earnings += salary;
        wallets[agentId] = agent;
        localStorage.setItem(this.STORAGE.AGENT_WALLETS, JSON.stringify(wallets));
    }
    
    async rewardLevelUp(userId, newLevel) {
        const wallets = JSON.parse(localStorage.getItem(this.STORAGE.USER_WALLETS));
        const user = wallets[userId];
        
        if (!user) {
            console.error(`User ${userId} not found`);
            return;
        }
        
        const reward = newLevel * 50; // 50 GBUV per level
        
        await this.distributeReward(
            user.publicKey,
            reward,
            `Level ${newLevel} achieved!`,
            user.username
        );
    }
    
    async rewardAchievement(userId, achievementName, value) {
        const wallets = JSON.parse(localStorage.getItem(this.STORAGE.USER_WALLETS));
        const user = wallets[userId];
        
        if (!user) return;
        
        await this.distributeReward(
            user.publicKey,
            value,
            `Achievement: ${achievementName}`,
            user.username
        );
    }
    
    // ═════════════════════════════════════════════════════════════════════════
    // SPL TOKEN CONSTANTS
    // ═════════════════════════════════════════════════════════════════════════
    
    get TOKEN_PROGRAM_ID() {
        return new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
    }
    
    get ASSOCIATED_TOKEN_PROGRAM_ID() {
        return new solanaWeb3.PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
    }
    
    get GBUV_DECIMALS() {
        return 6; // pump.fun tokens use 6 decimals
    }
    
    // ═════════════════════════════════════════════════════════════════════════
    // ASSOCIATED TOKEN ACCOUNT MANAGEMENT
    // ═════════════════════════════════════════════════════════════════════════
    
    async getAssociatedTokenAddress(ownerPublicKey) {
        // Derive the Associated Token Account address
        const owner = typeof ownerPublicKey === 'string' 
            ? new solanaWeb3.PublicKey(ownerPublicKey) 
            : ownerPublicKey;
        const mint = new solanaWeb3.PublicKey(this.GBUV_MINT);
        
        const [associatedToken] = await solanaWeb3.PublicKey.findProgramAddress(
            [
                owner.toBuffer(),
                this.TOKEN_PROGRAM_ID.toBuffer(),
                mint.toBuffer()
            ],
            this.ASSOCIATED_TOKEN_PROGRAM_ID
        );
        
        return associatedToken;
    }
    
    async getOrCreateTokenAccount(ownerPublicKey, payerKeypair) {
        const owner = typeof ownerPublicKey === 'string' 
            ? new solanaWeb3.PublicKey(ownerPublicKey) 
            : ownerPublicKey;
        
        const tokenAccountAddress = await this.getAssociatedTokenAddress(owner);
        
        // Check if account exists
        const accountInfo = await this.connection.getAccountInfo(tokenAccountAddress);
        
        if (accountInfo === null) {
            console.log(`📝 Creating token account for ${owner.toString().substring(0, 8)}...`);
            
            // Create the Associated Token Account
            const mint = new solanaWeb3.PublicKey(this.GBUV_MINT);
            
            const createATAInstruction = new solanaWeb3.TransactionInstruction({
                keys: [
                    { pubkey: payerKeypair.publicKey, isSigner: true, isWritable: true },
                    { pubkey: tokenAccountAddress, isSigner: false, isWritable: true },
                    { pubkey: owner, isSigner: false, isWritable: false },
                    { pubkey: mint, isSigner: false, isWritable: false },
                    { pubkey: solanaWeb3.SystemProgram.programId, isSigner: false, isWritable: false },
                    { pubkey: this.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
                ],
                programId: this.ASSOCIATED_TOKEN_PROGRAM_ID,
                data: Buffer.from([]) // No data needed for create ATA
            });
            
            const transaction = new solanaWeb3.Transaction().add(createATAInstruction);
            transaction.feePayer = payerKeypair.publicKey;
            transaction.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
            
            const signature = await solanaWeb3.sendAndConfirmTransaction(
                this.connection,
                transaction,
                [payerKeypair]
            );
            
            console.log(`✅ Token account created: ${signature}`);
        }
        
        return tokenAccountAddress;
    }
    
    // ═════════════════════════════════════════════════════════════════════════
    // REAL SPL TOKEN TRANSFER
    // ═════════════════════════════════════════════════════════════════════════
    
    async realSPLTransfer(fromKeypair, toPublicKey, amount) {
        console.log(`📤 Real SPL Transfer: ${amount} GBUV`);
        console.log(`   From: ${fromKeypair.publicKey.toString().substring(0, 8)}...`);
        console.log(`   To: ${toPublicKey.substring(0, 8)}...`);
        
        try {
            // Get or create token accounts
            const fromTokenAccount = await this.getOrCreateTokenAccount(
                fromKeypair.publicKey, 
                fromKeypair
            );
            const toTokenAccount = await this.getOrCreateTokenAccount(
                toPublicKey, 
                fromKeypair // Payer creates recipient's account if needed
            );
            
            // Convert amount to token units (6 decimals)
            const transferAmount = BigInt(Math.floor(amount * Math.pow(10, this.GBUV_DECIMALS)));
            
            // Create transfer instruction
            const dataBuffer = Buffer.alloc(9);
            dataBuffer.writeUInt8(3, 0); // Transfer instruction = 3
            dataBuffer.writeBigUInt64LE(transferAmount, 1);
            
            const transferInstruction = new solanaWeb3.TransactionInstruction({
                keys: [
                    { pubkey: fromTokenAccount, isSigner: false, isWritable: true },
                    { pubkey: toTokenAccount, isSigner: false, isWritable: true },
                    { pubkey: fromKeypair.publicKey, isSigner: true, isWritable: false }
                ],
                programId: this.TOKEN_PROGRAM_ID,
                data: dataBuffer
            });
            
            // Build and send transaction
            const transaction = new solanaWeb3.Transaction().add(transferInstruction);
            transaction.feePayer = fromKeypair.publicKey;
            transaction.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
            
            const signature = await solanaWeb3.sendAndConfirmTransaction(
                this.connection,
                transaction,
                [fromKeypair],
                { commitment: 'confirmed' }
            );
            
            console.log(`✅ Transfer complete!`);
            console.log(`🔗 Solscan: https://solscan.io/tx/${signature}`);
            
            // Store transaction record
            const tx = {
                from: fromKeypair.publicKey.toString(),
                to: toPublicKey,
                amount: amount,
                token: 'GBUV',
                type: 'REAL_TRANSFER',
                timestamp: new Date().toISOString(),
                status: 'CONFIRMED',
                signature: signature,
                explorer: `https://solscan.io/tx/${signature}`
            };
            
            const transactions = JSON.parse(localStorage.getItem(this.STORAGE.TRANSACTIONS));
            transactions.push(tx);
            localStorage.setItem(this.STORAGE.TRANSACTIONS, JSON.stringify(transactions));
            
            return tx;
            
        } catch (error) {
            console.error('❌ Transfer failed:', error);
            
            // Provide helpful error messages
            if (error.message.includes('insufficient funds')) {
                console.error('💡 Need SOL for transaction fees (~0.01 SOL)');
            } else if (error.message.includes('0x1')) {
                console.error('💡 Insufficient GBUV balance');
            }
            
            throw error;
        }
    }
    
    // ═════════════════════════════════════════════════════════════════════════
    // TRANSFER WRAPPER (Uses real or simulated based on funds)
    // ═════════════════════════════════════════════════════════════════════════
    
    async executeTransfer(fromKeypair, toPublicKey, amount, txType = 'TRANSFER') {
        // Check if we have SOL for fees
        const balance = await this.connection.getBalance(fromKeypair.publicKey);
        const solBalance = balance / solanaWeb3.LAMPORTS_PER_SOL;
        
        if (solBalance < 0.001) {
            console.warn('⚠️ No SOL for fees. Recording transfer for later execution.');
            // Record pending transfer
            const tx = {
                from: fromKeypair.publicKey.toString(),
                to: toPublicKey,
                amount: amount,
                token: 'GBUV',
                type: txType,
                timestamp: new Date().toISOString(),
                status: 'PENDING_FUNDS',
                signature: 'PENDING_' + Date.now()
            };
            
            const transactions = JSON.parse(localStorage.getItem(this.STORAGE.TRANSACTIONS));
            transactions.push(tx);
            localStorage.setItem(this.STORAGE.TRANSACTIONS, JSON.stringify(transactions));
            
            return tx;
        }
        
        // Execute real transfer
        return await this.realSPLTransfer(fromKeypair, toPublicKey, amount);
    }
    
    // Legacy simulation method (for testing/offline mode)
    async simulateTransfer(tx) {
        console.log(`📤 [SIMULATION] Transfer:`);
        console.log(`   From: ${tx.from.substring(0, 8)}...`);
        console.log(`   To: ${tx.to.substring(0, 8)}...`);
        console.log(`   Amount: ${tx.amount} ${tx.token}`);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        tx.status = 'SIMULATED';
        tx.signature = 'SIM_' + Date.now() + '_' + Math.random().toString(36).substring(7);
        
        const transactions = JSON.parse(localStorage.getItem(this.STORAGE.TRANSACTIONS));
        transactions.push(tx);
        localStorage.setItem(this.STORAGE.TRANSACTIONS, JSON.stringify(transactions));
        
        console.log(`✅ [SIMULATION] Complete: ${tx.signature}`);
        return tx;
    }
    
    // ═════════════════════════════════════════════════════════════════════════
    // WALLET MANAGEMENT
    // ═════════════════════════════════════════════════════════════════════════
    
    getUserWallet(userId) {
        const wallets = JSON.parse(localStorage.getItem(this.STORAGE.USER_WALLETS));
        return wallets[userId] || null;
    }
    
    getAgentWallet(agentId) {
        const wallets = JSON.parse(localStorage.getItem(this.STORAGE.AGENT_WALLETS));
        return wallets[agentId] || null;
    }
    
    getAllUserWallets() {
        return JSON.parse(localStorage.getItem(this.STORAGE.USER_WALLETS));
    }
    
    getAllAgentWallets() {
        return JSON.parse(localStorage.getItem(this.STORAGE.AGENT_WALLETS));
    }
    
    getTransactionHistory() {
        return JSON.parse(localStorage.getItem(this.STORAGE.TRANSACTIONS));
    }
    
    getCoreWalletAddress() {
        return this.coreWallet ? this.coreWallet.publicKey.toString() : null;
    }
}

// ═════════════════════════════════════════════════════════════════════════
// INITIALIZE SYSTEM
// ═════════════════════════════════════════════════════════════════════════

// Wait for Solana Web3.js to load
if (typeof solanaWeb3 !== 'undefined') {
    window.gemBotWalletSystem = new GemBotAutomatedWalletSystem();
    console.log('✅ GemBot Automated Wallet System ready!');
} else {
    console.error('❌ Solana Web3.js not loaded. Add CDN script to HTML.');
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GemBotAutomatedWalletSystem;
}
