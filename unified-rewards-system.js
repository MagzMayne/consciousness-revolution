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
 * File: unified-rewards-system.js
 * Declaration ID: IP-40EFBD7C-MLL28ZWL
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * UNIFIED REWARDS SYSTEM - Cross-Platform Reward Sync & Cashout
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Links together:
 * - Firebase Auth (user identity)
 * - In-Game Rewards (XP, gems, tokens)
 * - GemForge Crafting Rewards
 * - Academy Learning Rewards
 * - Neural Dashboard (repo scanning, value contributions)
 * - Contribution Rewards (knowledge base)
 * - Developer Value Platform (AI learning compensation)
 * 
 * Payout Options:
 * - Crypto (GBUV on Solana, USDC, SOL)
 * - USD via PayPal (after admin approval)
 * 
 * © 2024-2025 Ryan Barbrick / Barbrick Design
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const UnifiedRewardsSystem = {
    version: '1.0.0',
    initialized: false,
    
    // Configuration
    config: {
        adminEmail: 'barbrickdesign@gmail.com',
        paypalEmail: 'barbrickdesign@gmail.com',
        
        // Exchange rates
        GBUV_TO_USD: 0.05, // 1 GBUV = $0.05 USD
        USD_TO_GBUV: 20,   // $1 = 20 GBUV
        
        // Minimum cashout thresholds
        minCryptoWithdraw: 100,   // 100 GBUV minimum for crypto
        minPaypalWithdraw: 500,   // 500 GBUV ($25 USD) minimum for PayPal
        
        // Fees
        cryptoFeePercent: 2,  // 2% fee for crypto
        paypalFeePercent: 5,  // 5% fee for PayPal (covers processing)
        
        // Solana network
        solanaNetwork: 'mainnet-beta',
        
        // Firebase collection
        firestoreCollection: 'unified_rewards'
    },
    
    // Current user state
    currentUser: null,
    userRewards: null,
    
    // Aggregate balances from all systems
    balances: {
        inGame: {
            xp: 0,
            gems: 0,
            tokens: 0,
            gbuvEquivalent: 0
        },
        academy: {
            xp: 0,
            tokens: 0,
            gbuvEquivalent: 0
        },
        contributions: {
            gbuv: 0,
            pending: 0
        },
        developerValue: {
            totalValue: 0,
            pendingPayout: 0
        },
        neuralDashboard: {
            repoValue: 0,
            scanRewards: 0
        },
        total: {
            gbuv: 0,
            usdEquivalent: 0
        }
    },
    
    // Withdrawal history
    withdrawalHistory: [],
    pendingWithdrawals: [],
    
    /**
     * Initialize the unified rewards system
     */
    async init() {
        console.log('🔗 Initializing Unified Rewards System...');
        
        // Listen for auth changes
        this.setupAuthListener();
        
        // Connect to all reward systems
        this.connectRewardSystems();
        
        // Load saved state
        await this.loadUserRewards();
        
        // Start sync interval
        this.startAutoSync();
        
        this.initialized = true;
        console.log('✅ Unified Rewards System initialized');
        
        return this;
    },
    
    /**
     * Setup Firebase auth listener
     */
    setupAuthListener() {
        // Check for Firebase auth
        if (window.firebase && firebase.auth) {
            firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    this.currentUser = {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName || user.email?.split('@')[0],
                        isAdmin: user.email?.toLowerCase() === this.config.adminEmail.toLowerCase()
                    };
                    console.log(`👤 Unified Rewards: User authenticated - ${this.currentUser.email}`);
                    this.loadUserRewards();
                    this.syncAllBalances();
                } else {
                    this.currentUser = null;
                    this.userRewards = null;
                }
            });
        } else {
            console.warn('⚠️ Firebase auth not available, using localStorage identity');
            // Fallback to localStorage
            const savedUser = localStorage.getItem('unified_rewards_user');
            if (savedUser) {
                try {
                    this.currentUser = JSON.parse(savedUser);
                    this.loadUserRewards();
                } catch (e) {}
            }
        }
    },
    
    /**
     * Connect to all reward systems
     */
    connectRewardSystems() {
        // Listen for reward events from various systems
        
        // In-Game rewards
        window.addEventListener('gameReward', (e) => {
            this.handleInGameReward(e.detail);
        });
        
        // Academy rewards
        window.addEventListener('academyReward', (e) => {
            this.handleAcademyReward(e.detail);
        });
        
        // Contribution rewards
        window.addEventListener('contributionReward', (e) => {
            this.handleContributionReward(e.detail);
        });
        
        // Neural Dashboard rewards
        window.addEventListener('neuralReward', (e) => {
            this.handleNeuralReward(e.detail);
        });
        
        // Developer value updates
        window.addEventListener('developerValueUpdate', (e) => {
            this.handleDeveloperValue(e.detail);
        });
        
        console.log('🔌 Connected to all reward systems');
    },
    
    /**
     * Handle in-game reward events
     */
    handleInGameReward(detail) {
        const { type, amount } = detail;
        
        switch (type) {
            case 'xp':
                this.balances.inGame.xp += amount;
                break;
            case 'gems':
                this.balances.inGame.gems += amount;
                break;
            case 'tokens':
                this.balances.inGame.tokens += amount;
                break;
        }
        
        // Convert to GBUV equivalent (10 gems = 1 GBUV, 1 token = 1 GBUV, 100 XP = 1 GBUV)
        this.balances.inGame.gbuvEquivalent = 
            Math.floor(this.balances.inGame.gems / 10) +
            this.balances.inGame.tokens +
            Math.floor(this.balances.inGame.xp / 100);
        
        this.updateTotalBalance();
        this.saveUserRewards();
    },
    
    /**
     * Handle academy reward events
     */
    handleAcademyReward(detail) {
        const { xp = 0, tokens = 0 } = detail;
        
        this.balances.academy.xp += xp;
        this.balances.academy.tokens += tokens;
        
        // 100 XP = 1 GBUV, 1 token = 1 GBUV
        this.balances.academy.gbuvEquivalent = 
            Math.floor(this.balances.academy.xp / 100) + 
            this.balances.academy.tokens;
        
        this.updateTotalBalance();
        this.saveUserRewards();
    },
    
    /**
     * Handle contribution reward events
     */
    handleContributionReward(detail) {
        const { gbuv = 0 } = detail;
        
        this.balances.contributions.gbuv += gbuv;
        
        this.updateTotalBalance();
        this.saveUserRewards();
        
        console.log(`📦 Contribution reward: +${gbuv} GBUV`);
    },
    
    /**
     * Handle neural dashboard reward events
     */
    handleNeuralReward(detail) {
        const { repoValue = 0, scanReward = 0 } = detail;
        
        this.balances.neuralDashboard.repoValue += repoValue;
        this.balances.neuralDashboard.scanRewards += scanReward;
        
        this.updateTotalBalance();
        this.saveUserRewards();
    },
    
    /**
     * Handle developer value updates
     */
    handleDeveloperValue(detail) {
        const { totalValue = 0, pendingPayout = 0 } = detail;
        
        this.balances.developerValue.totalValue = totalValue;
        this.balances.developerValue.pendingPayout = pendingPayout;
        
        this.updateTotalBalance();
        this.saveUserRewards();
    },
    
    /**
     * Sync balances from all connected systems
     */
    async syncAllBalances() {
        console.log('🔄 Syncing all reward balances...');
        
        // Sync from ContributionRewardsSystem
        if (window.ContributionRewardsSystem) {
            const balance = window.ContributionRewardsSystem.getBalance();
            this.balances.contributions.gbuv = balance || 0;
        }
        
        // Sync from DeveloperValuePlatform
        if (window.DeveloperValuePlatform && this.currentUser) {
            const devId = this.currentUser.uid || this.currentUser.email;
            const developer = window.DeveloperValuePlatform.developers?.[devId];
            if (developer) {
                this.balances.developerValue.totalValue = developer.stats?.totalValue || 0;
                this.balances.developerValue.pendingPayout = 
                    window.DeveloperValuePlatform.calculatePendingPayout?.(devId) || 0;
            }
        }
        
        // Sync from GemBotAcademy
        if (window.GemBotAcademy) {
            const player = window.GemBotAcademy.player;
            if (player) {
                this.balances.academy.xp = player.totalXp || 0;
                this.balances.academy.tokens = player.tokens || 0;
                this.balances.academy.gbuvEquivalent = 
                    Math.floor((player.totalXp || 0) / 100) + (player.tokens || 0);
            }
        }
        
        // Sync from game state
        if (window.GameState || window.gameState) {
            const game = window.GameState || window.gameState;
            this.balances.inGame.xp = game.xp || 0;
            this.balances.inGame.gems = game.gems || 0;
            this.balances.inGame.tokens = game.tokens || 0;
            this.balances.inGame.gbuvEquivalent = 
                Math.floor((game.gems || 0) / 10) + 
                (game.tokens || 0) + 
                Math.floor((game.xp || 0) / 100);
        }
        
        this.updateTotalBalance();
        this.saveUserRewards();
        
        console.log('✅ Balance sync complete:', this.balances.total);
    },
    
    /**
     * Update total balance from all sources
     */
    updateTotalBalance() {
        this.balances.total.gbuv = 
            this.balances.inGame.gbuvEquivalent +
            this.balances.academy.gbuvEquivalent +
            this.balances.contributions.gbuv +
            this.balances.developerValue.totalValue +
            this.balances.neuralDashboard.repoValue +
            this.balances.neuralDashboard.scanRewards;
        
        this.balances.total.usdEquivalent = 
            this.balances.total.gbuv * this.config.GBUV_TO_USD;
        
        // Dispatch update event
        window.dispatchEvent(new CustomEvent('unifiedRewardsUpdate', {
            detail: { balances: this.balances }
        }));
    },
    
    /**
     * Get current balance summary
     */
    getBalanceSummary() {
        return {
            ...this.balances,
            formatted: {
                totalGBUV: this.balances.total.gbuv.toLocaleString(),
                totalUSD: `$${this.balances.total.usdEquivalent.toFixed(2)}`,
                availableForCrypto: this.balances.total.gbuv >= this.config.minCryptoWithdraw,
                availableForPaypal: this.balances.total.gbuv >= this.config.minPaypalWithdraw
            }
        };
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // WITHDRAWAL / CASHOUT SYSTEM
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Request crypto withdrawal (GBUV tokens on Solana)
     */
    async requestCryptoWithdrawal(amount, walletAddress) {
        if (!this.currentUser) {
            throw new Error('Must be logged in to withdraw');
        }
        
        if (amount < this.config.minCryptoWithdraw) {
            throw new Error(`Minimum withdrawal is ${this.config.minCryptoWithdraw} GBUV`);
        }
        
        if (amount > this.balances.total.gbuv) {
            throw new Error('Insufficient balance');
        }
        
        if (!walletAddress || !walletAddress.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
            throw new Error('Invalid Solana wallet address');
        }
        
        const fee = Math.ceil(amount * (this.config.cryptoFeePercent / 100));
        const netAmount = amount - fee;
        
        const withdrawal = {
            id: `W-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'crypto',
            userId: this.currentUser.uid || this.currentUser.email,
            userEmail: this.currentUser.email,
            amount: amount,
            fee: fee,
            netAmount: netAmount,
            walletAddress: walletAddress,
            network: 'solana',
            token: 'GBUV',
            status: 'pending_approval',
            requestedAt: new Date().toISOString(),
            approvedAt: null,
            processedAt: null,
            txHash: null
        };
        
        this.pendingWithdrawals.push(withdrawal);
        this.saveUserRewards();
        
        // Store in Firestore if available
        await this.storeWithdrawalRequest(withdrawal);
        
        console.log(`💰 Crypto withdrawal requested: ${netAmount} GBUV to ${walletAddress}`);
        
        this.showNotification(`💰 Withdrawal Requested`, 
            `${netAmount} GBUV will be sent to your wallet after admin approval.`);
        
        return withdrawal;
    },
    
    /**
     * Request PayPal withdrawal (USD conversion)
     */
    async requestPaypalWithdrawal(amount, paypalEmail) {
        if (!this.currentUser) {
            throw new Error('Must be logged in to withdraw');
        }
        
        if (amount < this.config.minPaypalWithdraw) {
            throw new Error(`Minimum withdrawal is ${this.config.minPaypalWithdraw} GBUV ($${(this.config.minPaypalWithdraw * this.config.GBUV_TO_USD).toFixed(2)} USD)`);
        }
        
        if (amount > this.balances.total.gbuv) {
            throw new Error('Insufficient balance');
        }
        
        if (!paypalEmail || !paypalEmail.includes('@')) {
            throw new Error('Invalid PayPal email address');
        }
        
        const usdAmount = amount * this.config.GBUV_TO_USD;
        const fee = usdAmount * (this.config.paypalFeePercent / 100);
        const netAmount = usdAmount - fee;
        
        const withdrawal = {
            id: `W-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'paypal',
            userId: this.currentUser.uid || this.currentUser.email,
            userEmail: this.currentUser.email,
            gbuvAmount: amount,
            usdAmount: usdAmount,
            fee: fee,
            netAmount: netAmount,
            paypalEmail: paypalEmail,
            status: 'pending_approval',
            requestedAt: new Date().toISOString(),
            approvedAt: null,
            processedAt: null,
            transactionId: null
        };
        
        this.pendingWithdrawals.push(withdrawal);
        this.saveUserRewards();
        
        // Store in Firestore if available
        await this.storeWithdrawalRequest(withdrawal);
        
        console.log(`💵 PayPal withdrawal requested: $${netAmount.toFixed(2)} USD to ${paypalEmail}`);
        
        this.showNotification(`💵 PayPal Withdrawal Requested`, 
            `$${netAmount.toFixed(2)} USD will be sent to ${paypalEmail} after admin approval.`);
        
        return withdrawal;
    },
    
    /**
     * Store withdrawal request in Firestore
     */
    async storeWithdrawalRequest(withdrawal) {
        if (window.firebase && firebase.firestore) {
            try {
                const db = firebase.firestore();
                await db.collection('withdrawal_requests').doc(withdrawal.id).set(withdrawal);
                console.log('📤 Withdrawal request stored in Firestore');
            } catch (e) {
                console.warn('Could not store in Firestore:', e);
            }
        }
    },
    
    /**
     * Admin: Approve withdrawal request
     */
    async approveWithdrawal(withdrawalId) {
        if (!this.currentUser?.isAdmin) {
            throw new Error('Admin access required');
        }
        
        const withdrawal = this.pendingWithdrawals.find(w => w.id === withdrawalId);
        if (!withdrawal) {
            throw new Error('Withdrawal not found');
        }
        
        withdrawal.status = 'approved';
        withdrawal.approvedAt = new Date().toISOString();
        withdrawal.approvedBy = this.currentUser.email;
        
        // Update Firestore
        if (window.firebase && firebase.firestore) {
            try {
                await firebase.firestore()
                    .collection('withdrawal_requests')
                    .doc(withdrawalId)
                    .update({
                        status: 'approved',
                        approvedAt: withdrawal.approvedAt,
                        approvedBy: withdrawal.approvedBy
                    });
            } catch (e) {
                console.warn('Could not update Firestore:', e);
            }
        }
        
        console.log(`✅ Withdrawal ${withdrawalId} approved by admin`);
        return withdrawal;
    },
    
    /**
     * Admin: Process approved withdrawal
     */
    async processWithdrawal(withdrawalId, txDetails) {
        if (!this.currentUser?.isAdmin) {
            throw new Error('Admin access required');
        }
        
        const withdrawal = this.pendingWithdrawals.find(w => w.id === withdrawalId);
        if (!withdrawal || withdrawal.status !== 'approved') {
            throw new Error('Withdrawal not approved or not found');
        }
        
        withdrawal.status = 'completed';
        withdrawal.processedAt = new Date().toISOString();
        withdrawal.processedBy = this.currentUser.email;
        
        if (txDetails) {
            withdrawal.txHash = txDetails.txHash;
            withdrawal.transactionId = txDetails.transactionId;
        }
        
        // Move to history
        this.pendingWithdrawals = this.pendingWithdrawals.filter(w => w.id !== withdrawalId);
        this.withdrawalHistory.push(withdrawal);
        
        // Deduct from user balance
        // This would normally update the user's balance in the database
        
        // Update Firestore
        if (window.firebase && firebase.firestore) {
            try {
                await firebase.firestore()
                    .collection('withdrawal_requests')
                    .doc(withdrawalId)
                    .update({
                        status: 'completed',
                        processedAt: withdrawal.processedAt,
                        processedBy: withdrawal.processedBy,
                        txHash: withdrawal.txHash || null,
                        transactionId: withdrawal.transactionId || null
                    });
            } catch (e) {
                console.warn('Could not update Firestore:', e);
            }
        }
        
        console.log(`💸 Withdrawal ${withdrawalId} processed successfully`);
        return withdrawal;
    },
    
    /**
     * Get withdrawal history for current user
     */
    getWithdrawalHistory() {
        return {
            pending: this.pendingWithdrawals.filter(w => 
                w.userId === (this.currentUser?.uid || this.currentUser?.email)
            ),
            completed: this.withdrawalHistory.filter(w => 
                w.userId === (this.currentUser?.uid || this.currentUser?.email)
            )
        };
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // WITHDRAWAL UI
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Show withdrawal modal
     */
    showWithdrawModal() {
        // Remove existing modal
        const existing = document.getElementById('unified-withdraw-modal');
        if (existing) existing.remove();
        
        const summary = this.getBalanceSummary();
        
        const modal = document.createElement('div');
        modal.id = 'unified-withdraw-modal';
        modal.className = 'unified-modal';
        modal.innerHTML = `
            <div class="unified-modal-backdrop" onclick="UnifiedRewardsSystem.closeWithdrawModal()"></div>
            <div class="unified-modal-content">
                <button class="modal-close" onclick="UnifiedRewardsSystem.closeWithdrawModal()">×</button>
                
                <div class="modal-header">
                    <h2>💰 Withdraw Rewards</h2>
                    <p>Cash out your earned GBUV tokens</p>
                </div>
                
                <div class="balance-display">
                    <div class="balance-main">
                        <span class="balance-label">Available Balance</span>
                        <span class="balance-value">${summary.formatted.totalGBUV} GBUV</span>
                        <span class="balance-usd">${summary.formatted.totalUSD} USD</span>
                    </div>
                    <div class="balance-breakdown">
                        <div class="balance-item">
                            <span>🎮 In-Game</span>
                            <span>${this.balances.inGame.gbuvEquivalent} GBUV</span>
                        </div>
                        <div class="balance-item">
                            <span>📚 Academy</span>
                            <span>${this.balances.academy.gbuvEquivalent} GBUV</span>
                        </div>
                        <div class="balance-item">
                            <span>📦 Contributions</span>
                            <span>${this.balances.contributions.gbuv} GBUV</span>
                        </div>
                        <div class="balance-item">
                            <span>💻 Developer Value</span>
                            <span>${this.balances.developerValue.totalValue} GBUV</span>
                        </div>
                    </div>
                </div>
                
                <div class="withdraw-tabs">
                    <button class="tab-btn active" onclick="UnifiedRewardsSystem.showCryptoTab()">
                        🪙 Crypto (GBUV)
                    </button>
                    <button class="tab-btn" onclick="UnifiedRewardsSystem.showPaypalTab()">
                        💳 PayPal (USD)
                    </button>
                </div>
                
                <div id="crypto-tab" class="tab-content active">
                    <div class="form-group">
                        <label>Amount to Withdraw (GBUV)</label>
                        <input type="number" id="crypto-amount" min="${this.config.minCryptoWithdraw}" 
                               max="${this.balances.total.gbuv}" value="${this.config.minCryptoWithdraw}"
                               oninput="UnifiedRewardsSystem.updateCryptoFees()">
                        <span class="form-hint">Min: ${this.config.minCryptoWithdraw} GBUV</span>
                    </div>
                    <div class="form-group">
                        <label>Solana Wallet Address</label>
                        <input type="text" id="crypto-wallet" placeholder="Your Solana wallet address">
                    </div>
                    <div class="fee-display" id="crypto-fees">
                        <div class="fee-row">
                            <span>Network Fee (${this.config.cryptoFeePercent}%)</span>
                            <span id="crypto-fee-amount">-${this.config.minCryptoWithdraw * this.config.cryptoFeePercent / 100} GBUV</span>
                        </div>
                        <div class="fee-row total">
                            <span>You'll Receive</span>
                            <span id="crypto-net-amount">${this.config.minCryptoWithdraw * (1 - this.config.cryptoFeePercent / 100)} GBUV</span>
                        </div>
                    </div>
                    <button class="withdraw-btn" onclick="UnifiedRewardsSystem.submitCryptoWithdraw()" 
                            ${!summary.formatted.availableForCrypto ? 'disabled' : ''}>
                        🚀 Withdraw to Wallet
                    </button>
                </div>
                
                <div id="paypal-tab" class="tab-content">
                    <div class="form-group">
                        <label>Amount to Withdraw (GBUV)</label>
                        <input type="number" id="paypal-amount" min="${this.config.minPaypalWithdraw}" 
                               max="${this.balances.total.gbuv}" value="${this.config.minPaypalWithdraw}"
                               oninput="UnifiedRewardsSystem.updatePaypalFees()">
                        <span class="form-hint">Min: ${this.config.minPaypalWithdraw} GBUV ($${(this.config.minPaypalWithdraw * this.config.GBUV_TO_USD).toFixed(2)} USD)</span>
                    </div>
                    <div class="form-group">
                        <label>PayPal Email</label>
                        <input type="email" id="paypal-email" placeholder="Your PayPal email address">
                    </div>
                    <div class="fee-display" id="paypal-fees">
                        <div class="fee-row">
                            <span>USD Conversion</span>
                            <span id="paypal-usd-amount">$${(this.config.minPaypalWithdraw * this.config.GBUV_TO_USD).toFixed(2)}</span>
                        </div>
                        <div class="fee-row">
                            <span>Processing Fee (${this.config.paypalFeePercent}%)</span>
                            <span id="paypal-fee-amount">-$${(this.config.minPaypalWithdraw * this.config.GBUV_TO_USD * this.config.paypalFeePercent / 100).toFixed(2)}</span>
                        </div>
                        <div class="fee-row total">
                            <span>You'll Receive</span>
                            <span id="paypal-net-amount">$${(this.config.minPaypalWithdraw * this.config.GBUV_TO_USD * (1 - this.config.paypalFeePercent / 100)).toFixed(2)}</span>
                        </div>
                    </div>
                    <button class="withdraw-btn paypal" onclick="UnifiedRewardsSystem.submitPaypalWithdraw()"
                            ${!summary.formatted.availableForPaypal ? 'disabled' : ''}>
                        💳 Withdraw via PayPal
                    </button>
                </div>
                
                <div class="withdraw-info">
                    <p>⏱️ Withdrawals require admin approval and are typically processed within 24-48 hours.</p>
                </div>
            </div>
        `;
        
        this.injectModalStyles();
        document.body.appendChild(modal);
    },
    
    closeWithdrawModal() {
        const modal = document.getElementById('unified-withdraw-modal');
        if (modal) modal.remove();
    },
    
    showCryptoTab() {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.querySelector('.tab-btn:first-child').classList.add('active');
        document.getElementById('crypto-tab').classList.add('active');
    },
    
    showPaypalTab() {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.querySelector('.tab-btn:last-child').classList.add('active');
        document.getElementById('paypal-tab').classList.add('active');
    },
    
    updateCryptoFees() {
        const amount = parseFloat(document.getElementById('crypto-amount').value) || 0;
        const fee = amount * this.config.cryptoFeePercent / 100;
        const net = amount - fee;
        
        document.getElementById('crypto-fee-amount').textContent = `-${fee.toFixed(2)} GBUV`;
        document.getElementById('crypto-net-amount').textContent = `${net.toFixed(2)} GBUV`;
    },
    
    updatePaypalFees() {
        const amount = parseFloat(document.getElementById('paypal-amount').value) || 0;
        const usd = amount * this.config.GBUV_TO_USD;
        const fee = usd * this.config.paypalFeePercent / 100;
        const net = usd - fee;
        
        document.getElementById('paypal-usd-amount').textContent = `$${usd.toFixed(2)}`;
        document.getElementById('paypal-fee-amount').textContent = `-$${fee.toFixed(2)}`;
        document.getElementById('paypal-net-amount').textContent = `$${net.toFixed(2)}`;
    },
    
    async submitCryptoWithdraw() {
        const amount = parseFloat(document.getElementById('crypto-amount').value);
        const wallet = document.getElementById('crypto-wallet').value.trim();
        
        try {
            await this.requestCryptoWithdrawal(amount, wallet);
            this.closeWithdrawModal();
        } catch (e) {
            alert(`❌ Error: ${e.message}`);
        }
    },
    
    async submitPaypalWithdraw() {
        const amount = parseFloat(document.getElementById('paypal-amount').value);
        const email = document.getElementById('paypal-email').value.trim();
        
        try {
            await this.requestPaypalWithdrawal(amount, email);
            this.closeWithdrawModal();
        } catch (e) {
            alert(`❌ Error: ${e.message}`);
        }
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // PERSISTENCE
    // ═══════════════════════════════════════════════════════════════════════════
    
    async loadUserRewards() {
        const userId = this.currentUser?.uid || this.currentUser?.email || 'guest';
        
        // Try Firestore first
        if (window.firebase && firebase.firestore && this.currentUser?.uid) {
            try {
                const doc = await firebase.firestore()
                    .collection(this.config.firestoreCollection)
                    .doc(this.currentUser.uid)
                    .get();
                
                if (doc.exists) {
                    const data = doc.data();
                    this.balances = { ...this.balances, ...data.balances };
                    this.withdrawalHistory = data.withdrawalHistory || [];
                    this.pendingWithdrawals = data.pendingWithdrawals || [];
                    console.log('📥 Loaded rewards from Firestore');
                    return;
                }
            } catch (e) {
                console.warn('Could not load from Firestore:', e);
            }
        }
        
        // Fallback to localStorage
        try {
            const saved = localStorage.getItem(`unified_rewards_${userId}`);
            if (saved) {
                const data = JSON.parse(saved);
                this.balances = { ...this.balances, ...data.balances };
                this.withdrawalHistory = data.withdrawalHistory || [];
                this.pendingWithdrawals = data.pendingWithdrawals || [];
            }
        } catch (e) {
            console.warn('Could not load from localStorage:', e);
        }
    },
    
    async saveUserRewards() {
        const userId = this.currentUser?.uid || this.currentUser?.email || 'guest';
        
        const data = {
            balances: this.balances,
            withdrawalHistory: this.withdrawalHistory,
            pendingWithdrawals: this.pendingWithdrawals,
            lastUpdated: new Date().toISOString()
        };
        
        // Save to Firestore
        if (window.firebase && firebase.firestore && this.currentUser?.uid) {
            try {
                await firebase.firestore()
                    .collection(this.config.firestoreCollection)
                    .doc(this.currentUser.uid)
                    .set(data, { merge: true });
            } catch (e) {
                console.warn('Could not save to Firestore:', e);
            }
        }
        
        // Also save to localStorage as backup
        try {
            localStorage.setItem(`unified_rewards_${userId}`, JSON.stringify(data));
        } catch (e) {
            console.warn('Could not save to localStorage:', e);
        }
    },
    
    startAutoSync() {
        // Sync every 5 minutes
        setInterval(() => {
            this.syncAllBalances();
        }, 5 * 60 * 1000);
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════════════════
    
    showNotification(title, message) {
        const notification = document.createElement('div');
        notification.className = 'unified-notification';
        notification.innerHTML = `
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #1a1f3a, #2d1f3a);
            border: 2px solid #64ffda;
            border-radius: 12px;
            padding: 16px 24px;
            color: white;
            z-index: 999999;
            max-width: 350px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    },
    
    injectModalStyles() {
        if (document.getElementById('unified-modal-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'unified-modal-styles';
        styles.textContent = `
            .unified-modal {
                position: fixed;
                inset: 0;
                z-index: 999999;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .unified-modal-backdrop {
                position: absolute;
                inset: 0;
                background: rgba(0,0,0,0.8);
                backdrop-filter: blur(5px);
            }
            
            .unified-modal-content {
                position: relative;
                background: linear-gradient(135deg, #1a1f3a 0%, #0d1117 100%);
                border: 2px solid #64ffda;
                border-radius: 20px;
                padding: 32px;
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                color: white;
                box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            }
            
            .modal-close {
                position: absolute;
                top: 16px;
                right: 16px;
                background: none;
                border: none;
                color: #64ffda;
                font-size: 24px;
                cursor: pointer;
            }
            
            .modal-header {
                text-align: center;
                margin-bottom: 24px;
            }
            
            .modal-header h2 {
                margin: 0;
                color: #64ffda;
                font-size: 24px;
            }
            
            .modal-header p {
                margin: 8px 0 0;
                color: #9ca3af;
            }
            
            .balance-display {
                background: rgba(100, 255, 218, 0.1);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 24px;
            }
            
            .balance-main {
                text-align: center;
                margin-bottom: 16px;
            }
            
            .balance-label {
                display: block;
                color: #9ca3af;
                font-size: 14px;
            }
            
            .balance-value {
                display: block;
                font-size: 32px;
                font-weight: bold;
                color: #64ffda;
            }
            
            .balance-usd {
                display: block;
                color: #fbbf24;
                font-size: 16px;
            }
            
            .balance-breakdown {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 8px;
            }
            
            .balance-item {
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                color: #9ca3af;
            }
            
            .withdraw-tabs {
                display: flex;
                gap: 8px;
                margin-bottom: 20px;
            }
            
            .tab-btn {
                flex: 1;
                padding: 12px;
                background: rgba(255,255,255,0.05);
                border: 2px solid transparent;
                border-radius: 10px;
                color: #9ca3af;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .tab-btn.active {
                background: rgba(100, 255, 218, 0.1);
                border-color: #64ffda;
                color: #64ffda;
            }
            
            .tab-content {
                display: none;
            }
            
            .tab-content.active {
                display: block;
            }
            
            .form-group {
                margin-bottom: 16px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 8px;
                color: #e6edf3;
            }
            
            .form-group input {
                width: 100%;
                padding: 12px 16px;
                background: rgba(255,255,255,0.05);
                border: 2px solid rgba(255,255,255,0.1);
                border-radius: 10px;
                color: white;
                font-size: 16px;
            }
            
            .form-group input:focus {
                outline: none;
                border-color: #64ffda;
            }
            
            .form-hint {
                display: block;
                font-size: 12px;
                color: #9ca3af;
                margin-top: 4px;
            }
            
            .fee-display {
                background: rgba(0,0,0,0.3);
                border-radius: 10px;
                padding: 16px;
                margin-bottom: 20px;
            }
            
            .fee-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                color: #9ca3af;
                font-size: 14px;
            }
            
            .fee-row.total {
                border-top: 1px solid rgba(255,255,255,0.1);
                margin-top: 8px;
                padding-top: 12px;
                color: #64ffda;
                font-weight: bold;
            }
            
            .withdraw-btn {
                width: 100%;
                padding: 16px;
                background: linear-gradient(135deg, #64ffda, #9f7aea);
                border: none;
                border-radius: 12px;
                color: #1a1f3a;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: transform 0.2s;
            }
            
            .withdraw-btn:hover:not(:disabled) {
                transform: scale(1.02);
            }
            
            .withdraw-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .withdraw-btn.paypal {
                background: linear-gradient(135deg, #003087, #009cde);
                color: white;
            }
            
            .withdraw-info {
                margin-top: 20px;
                padding: 12px;
                background: rgba(251, 191, 36, 0.1);
                border-radius: 8px;
                text-align: center;
            }
            
            .withdraw-info p {
                margin: 0;
                color: #fbbf24;
                font-size: 13px;
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
};

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => UnifiedRewardsSystem.init());
} else {
    UnifiedRewardsSystem.init();
}

// Export
window.UnifiedRewardsSystem = UnifiedRewardsSystem;

console.log('🔗 Unified Rewards System loaded');
