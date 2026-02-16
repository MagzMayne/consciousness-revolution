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
 * File: gbuv-token-economy.js
 * Declaration ID: IP-11BD2BC2-MLL28ZUU
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * GBUV TOKEN ECONOMY - Comprehensive Web3 Integration
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Core token economy system integrating:
 * - PayPal top-up for GBUV purchases
 * - Game mechanics (rewards, purchases, upgrades)
 * - Academy mechanics (courses, certifications, learning rewards)
 * - Physical machine mechanics (robot operations, mining rewards)
 * - Merlin AI mechanics (valuations, premium AI services)
 * 
 * Token: GBUV (GemBot Universe Value)
 * Network: Solana Mainnet
 * Contract: DPHcbu7wJEbcrnCYjXC8vHBkM39kT9xZg4mYayvrpump
 * 
 * © 2024-2025 Ryan Barbrick / Barbrick Design
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const GBUVTokenEconomy = {
    version: '2.0.0',
    initialized: false,
    
    // ═══════════════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════════
    
    config: {
        // Admin & Payment
        adminEmail: 'barbrickdesign@gmail.com',
        paypalEmail: 'barbrickdesign@gmail.com',
        paypalMeLink: 'https://paypal.me/barbrickdesign',
        
        // Token Details
        tokenMint: 'DPHcbu7wJEbcrnCYjXC8vHBkM39kT9xZg4mYayvrpump',
        tokenName: 'GBUV',
        tokenDecimals: 6,
        network: 'mainnet-beta',
        
        // Exchange Rates
        USD_TO_GBUV: 20,      // $1 USD = 20 GBUV (base rate)
        GBUV_TO_USD: 0.05,    // 1 GBUV = $0.05 USD
        
        // Bulk Purchase Bonuses
        purchaseTiers: [
            { minUSD: 5, bonus: 0, rate: 20 },      // $5 = 100 GBUV
            { minUSD: 10, bonus: 10, rate: 22 },    // $10 = 220 GBUV (+10%)
            { minUSD: 25, bonus: 15, rate: 23 },    // $25 = 575 GBUV (+15%)
            { minUSD: 50, bonus: 20, rate: 24 },    // $50 = 1,200 GBUV (+20%)
            { minUSD: 100, bonus: 25, rate: 25 },   // $100 = 2,500 GBUV (+25%)
            { minUSD: 250, bonus: 30, rate: 26 },   // $250 = 6,500 GBUV (+30%)
            { minUSD: 500, bonus: 40, rate: 28 },   // $500 = 14,000 GBUV (+40%)
            { minUSD: 1000, bonus: 50, rate: 30 }   // $1000 = 30,000 GBUV (+50%)
        ],
        
        // Minimum transaction
        minPurchaseUSD: 5,
        minWithdrawGBUV: 100,
        
        // Fees
        withdrawFeePercent: 2,
        
        // Firebase
        firestoreCollection: 'gbuv_transactions'
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // PRICING STRUCTURE
    // ═══════════════════════════════════════════════════════════════════════════
    
    pricing: {
        // Game Mechanics
        game: {
            // In-game purchases
            speedBoost: { gbuv: 10, duration: '1 hour' },
            xpBooster: { gbuv: 25, multiplier: 2, duration: '24 hours' },
            premiumGem: { gbuv: 50, type: 'random rare' },
            legendaryGem: { gbuv: 200, type: 'guaranteed legendary' },
            machineUpgrade: { gbuv: 100, level: '+1' },
            cosmeticPack: { gbuv: 75, items: 5 },
            
            // Earning rates
            rewards: {
                dailyLogin: 10,
                weeklyStreak: 50,
                perfectCut: 5,
                goodCut: 2,
                standardCut: 1,
                levelUp: { base: 25, perLevel: 5 },
                achievement: { bronze: 10, silver: 25, gold: 50, platinum: 100 },
                referral: 100
            }
        },
        
        // Academy Mechanics
        academy: {
            // Course prices
            courses: {
                beginner: { gbuv: 0, name: 'Fundamentals (Free)' },
                intermediate: { gbuv: 50, name: 'Intermediate Skills' },
                advanced: { gbuv: 100, name: 'Advanced Techniques' },
                masterclass: { gbuv: 250, name: 'Masterclass Series' },
                certification: { gbuv: 500, name: 'Professional Certification' }
            },
            
            // Learning rewards
            rewards: {
                lessonComplete: 5,
                quizPassed: 10,
                courseComplete: 50,
                certificationEarned: 200,
                perfectScore: 25,
                helpOthers: 15
            }
        },
        
        // Machine Mechanics (Physical & Virtual)
        machine: {
            // Machine operations cost
            operations: {
                basicCut: { gbuv: 1, description: 'Standard gem cut' },
                precisionCut: { gbuv: 3, description: 'High precision cut' },
                masterCut: { gbuv: 5, description: 'Master-level cut' },
                calibration: { gbuv: 10, description: 'Machine calibration' },
                maintenance: { gbuv: 25, description: 'Preventive maintenance' }
            },
            
            // Mining rewards
            rewards: {
                perHour: 5,
                qualityBonus: { A: 3, B: 2, C: 1, D: 0 },
                rarityBonus: { common: 1, uncommon: 3, rare: 10, epic: 25, legendary: 100 },
                consecutiveBonus: { perHour: 0.5, max: 50 }
            },
            
            // Machine ownership tiers
            ownership: {
                starter: { cost: 1000, dailyBonus: 10, maxMachines: 1 },
                professional: { cost: 5000, dailyBonus: 30, maxMachines: 3 },
                enterprise: { cost: 20000, dailyBonus: 100, maxMachines: 10 },
                unlimited: { cost: 50000, dailyBonus: 250, maxMachines: -1 }
            }
        },
        
        // Merlin AI Mechanics
        merlin: {
            // AI Services
            services: {
                basicAnalysis: { gbuv: 5, description: 'Basic code/gem analysis' },
                detailedReport: { gbuv: 25, description: 'Detailed AI report' },
                repoValuation: { gbuv: 50, description: 'Full repository valuation' },
                customTraining: { gbuv: 100, description: 'Custom AI training session' },
                premiumSupport: { gbuv: 200, description: '24/7 premium AI support (month)' }
            },
            
            // AI Subscription tiers
            subscriptions: {
                free: { gbuv: 0, queries: 10, features: ['basic'] },
                starter: { gbuv: 50, queries: 100, features: ['basic', 'analysis'] },
                pro: { gbuv: 200, queries: 500, features: ['basic', 'analysis', 'valuation'] },
                enterprise: { gbuv: 500, queries: -1, features: ['all'] }
            },
            
            // AI rewards for contributions
            rewards: {
                feedbackProvided: 5,
                bugReported: 25,
                featureSuggested: 10,
                codeContribution: 100,
                knowledgeShared: 50
            }
        }
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // USER STATE
    // ═══════════════════════════════════════════════════════════════════════════
    
    user: null,
    balance: 0,
    transactions: [],
    pendingPurchases: [],
    subscriptions: {},
    
    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════
    
    async init() {
        console.log('🪙 GBUV Token Economy initializing...');
        
        // Load user data
        this.loadUserData();
        
        // Connect to wallet system
        this.connectWalletSystem();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Create UI
        this.createUI();
        
        this.initialized = true;
        console.log('✅ GBUV Token Economy ready!');
        console.log(`💰 Current balance: ${this.balance} GBUV`);
        
        // Dispatch ready event
        window.dispatchEvent(new CustomEvent('gbuvEconomyReady', {
            detail: { balance: this.balance }
        }));
        
        return this;
    },
    
    loadUserData() {
        const saved = localStorage.getItem('gbuv_economy_user');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.user = data.user;
                this.balance = data.balance || 0;
                this.transactions = data.transactions || [];
                this.subscriptions = data.subscriptions || {};
            } catch (e) {
                console.warn('Could not load saved data:', e);
            }
        }
        
        // Check for Firebase user
        if (window.firebase && firebase.auth) {
            firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    this.user = {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName,
                        isAdmin: user.email === this.config.adminEmail
                    };
                    this.syncFromFirebase();
                }
            });
        }
    },
    
    saveUserData() {
        localStorage.setItem('gbuv_economy_user', JSON.stringify({
            user: this.user,
            balance: this.balance,
            transactions: this.transactions.slice(-100), // Keep last 100
            subscriptions: this.subscriptions
        }));
    },
    
    async syncFromFirebase() {
        if (window.firebase && firebase.firestore && this.user) {
            try {
                const doc = await firebase.firestore()
                    .collection('users')
                    .doc(this.user.uid)
                    .get();
                
                if (doc.exists) {
                    const data = doc.data();
                    this.balance = data.gbuvBalance || this.balance;
                    this.subscriptions = data.subscriptions || {};
                }
            } catch (e) {
                console.warn('Could not sync from Firebase:', e);
            }
        }
    },
    
    connectWalletSystem() {
        // Connect to the wallet system if available
        if (window.gemBotWalletSystem) {
            console.log('🔗 Connected to GemBot Wallet System');
        }
        if (window.solanaWallet) {
            console.log('🔗 Connected to Solana Wallet System');
        }
    },
    
    setupEventListeners() {
        // Listen for game events
        window.addEventListener('gameReward', (e) => this.handleGameReward(e.detail));
        window.addEventListener('gamePurchase', (e) => this.handleGamePurchase(e.detail));
        
        // Listen for academy events
        window.addEventListener('academyReward', (e) => this.handleAcademyReward(e.detail));
        window.addEventListener('academyPurchase', (e) => this.handleAcademyPurchase(e.detail));
        
        // Listen for machine events
        window.addEventListener('machineReward', (e) => this.handleMachineReward(e.detail));
        window.addEventListener('machineOperation', (e) => this.handleMachineOperation(e.detail));
        
        // Listen for Merlin AI events
        window.addEventListener('merlinService', (e) => this.handleMerlinService(e.detail));
        window.addEventListener('merlinReward', (e) => this.handleMerlinReward(e.detail));
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // PAYPAL TOP-UP SYSTEM
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Calculate GBUV amount for USD purchase
     */
    calculatePurchase(usdAmount) {
        if (usdAmount < this.config.minPurchaseUSD) {
            return { 
                error: true, 
                message: `Minimum purchase is $${this.config.minPurchaseUSD}` 
            };
        }
        
        // Find applicable tier
        let tier = this.config.purchaseTiers[0];
        for (const t of this.config.purchaseTiers) {
            if (usdAmount >= t.minUSD) tier = t;
        }
        
        const baseGBUV = usdAmount * this.config.USD_TO_GBUV;
        const bonusGBUV = Math.floor(baseGBUV * (tier.bonus / 100));
        const totalGBUV = baseGBUV + bonusGBUV;
        
        return {
            usdAmount,
            baseGBUV,
            bonusPercent: tier.bonus,
            bonusGBUV,
            totalGBUV,
            effectiveRate: totalGBUV / usdAmount
        };
    },
    
    /**
     * Initiate PayPal purchase
     */
    async initiatePurchase(usdAmount, paymentMethod = 'paypal') {
        const calculation = this.calculatePurchase(usdAmount);
        
        if (calculation.error) {
            this.showNotification('❌ Error', calculation.message, 'error');
            return null;
        }
        
        const purchase = {
            id: `PUR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            userId: this.user?.uid || this.user?.email || 'guest',
            userEmail: this.user?.email || 'unknown',
            usdAmount: calculation.usdAmount,
            gbuvAmount: calculation.totalGBUV,
            bonusPercent: calculation.bonusPercent,
            paymentMethod,
            status: 'pending',
            createdAt: new Date().toISOString(),
            verifiedAt: null,
            completedAt: null
        };
        
        this.pendingPurchases.push(purchase);
        this.saveUserData();
        
        // Store in Firebase
        await this.storePurchaseRequest(purchase);
        
        // Generate PayPal payment link
        const paypalNote = `GBUV-${purchase.id}`;
        const paypalLink = `${this.config.paypalMeLink}/${usdAmount}USD?note=${encodeURIComponent(paypalNote)}`;
        
        // Show payment instructions
        this.showPaymentModal(purchase, paypalLink);
        
        return purchase;
    },
    
    async storePurchaseRequest(purchase) {
        if (window.firebase && firebase.firestore) {
            try {
                await firebase.firestore()
                    .collection('gbuv_purchases')
                    .doc(purchase.id)
                    .set(purchase);
            } catch (e) {
                console.warn('Could not store purchase:', e);
            }
        }
    },
    
    /**
     * Admin: Verify and complete purchase
     */
    async verifyPurchase(purchaseId, paypalTransactionId) {
        if (!this.user?.isAdmin) {
            throw new Error('Admin access required');
        }
        
        const purchase = this.pendingPurchases.find(p => p.id === purchaseId);
        if (!purchase) {
            // Try to find in Firebase
            if (window.firebase && firebase.firestore) {
                const doc = await firebase.firestore()
                    .collection('gbuv_purchases')
                    .doc(purchaseId)
                    .get();
                if (doc.exists) {
                    purchase = doc.data();
                }
            }
        }
        
        if (!purchase) {
            throw new Error('Purchase not found');
        }
        
        purchase.status = 'verified';
        purchase.verifiedAt = new Date().toISOString();
        purchase.verifiedBy = this.config.adminEmail;
        purchase.paypalTransactionId = paypalTransactionId;
        
        // Update Firebase
        if (window.firebase && firebase.firestore) {
            await firebase.firestore()
                .collection('gbuv_purchases')
                .doc(purchaseId)
                .update(purchase);
        }
        
        // Credit GBUV to user
        await this.creditGBUV(purchase.userId, purchase.gbuvAmount, 'PayPal Purchase', purchase.id);
        
        purchase.status = 'completed';
        purchase.completedAt = new Date().toISOString();
        
        // Final update
        if (window.firebase && firebase.firestore) {
            await firebase.firestore()
                .collection('gbuv_purchases')
                .doc(purchaseId)
                .update(purchase);
        }
        
        console.log(`✅ Purchase ${purchaseId} completed: ${purchase.gbuvAmount} GBUV credited`);
        
        return purchase;
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // BALANCE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Credit GBUV to account
     */
    async creditGBUV(userId, amount, reason, referenceId = null) {
        const tx = {
            id: `TX-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            type: 'credit',
            userId,
            amount,
            reason,
            referenceId,
            timestamp: new Date().toISOString(),
            balanceBefore: this.balance,
            balanceAfter: this.balance + amount
        };
        
        this.balance += amount;
        this.transactions.push(tx);
        this.saveUserData();
        
        // Update Firebase
        if (window.firebase && firebase.firestore && this.user) {
            try {
                await firebase.firestore()
                    .collection('users')
                    .doc(this.user.uid)
                    .update({
                        gbuvBalance: firebase.firestore.FieldValue.increment(amount)
                    });
            } catch (e) {
                console.warn('Could not update Firebase balance:', e);
            }
        }
        
        // Dispatch event
        window.dispatchEvent(new CustomEvent('gbuvBalanceChange', {
            detail: { balance: this.balance, change: amount, type: 'credit', reason }
        }));
        
        this.updateBalanceDisplay();
        console.log(`💰 +${amount} GBUV: ${reason}`);
        
        return tx;
    },
    
    /**
     * Debit GBUV from account
     */
    async debitGBUV(amount, reason, referenceId = null) {
        if (amount > this.balance) {
            this.showNotification('❌ Insufficient Balance', 
                `Need ${amount} GBUV, you have ${this.balance} GBUV`, 'error');
            return null;
        }
        
        const tx = {
            id: `TX-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            type: 'debit',
            userId: this.user?.uid,
            amount,
            reason,
            referenceId,
            timestamp: new Date().toISOString(),
            balanceBefore: this.balance,
            balanceAfter: this.balance - amount
        };
        
        this.balance -= amount;
        this.transactions.push(tx);
        this.saveUserData();
        
        // Update Firebase
        if (window.firebase && firebase.firestore && this.user) {
            try {
                await firebase.firestore()
                    .collection('users')
                    .doc(this.user.uid)
                    .update({
                        gbuvBalance: firebase.firestore.FieldValue.increment(-amount)
                    });
            } catch (e) {
                console.warn('Could not update Firebase balance:', e);
            }
        }
        
        // Dispatch event
        window.dispatchEvent(new CustomEvent('gbuvBalanceChange', {
            detail: { balance: this.balance, change: -amount, type: 'debit', reason }
        }));
        
        this.updateBalanceDisplay();
        console.log(`💸 -${amount} GBUV: ${reason}`);
        
        return tx;
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // GAME MECHANICS INTEGRATION
    // ═══════════════════════════════════════════════════════════════════════════
    
    handleGameReward(detail) {
        const { type, amount, source } = detail;
        const rewards = this.pricing.game.rewards;
        
        let gbuvReward = 0;
        let reason = '';
        
        switch (type) {
            case 'dailyLogin':
                gbuvReward = rewards.dailyLogin;
                reason = 'Daily login bonus';
                break;
            case 'weeklyStreak':
                gbuvReward = rewards.weeklyStreak;
                reason = 'Weekly streak bonus';
                break;
            case 'perfectCut':
                gbuvReward = rewards.perfectCut;
                reason = 'Perfect cut bonus';
                break;
            case 'goodCut':
                gbuvReward = rewards.goodCut;
                reason = 'Good cut bonus';
                break;
            case 'standardCut':
                gbuvReward = rewards.standardCut;
                reason = 'Standard cut completion';
                break;
            case 'levelUp':
                const level = amount || 1;
                gbuvReward = rewards.levelUp.base + (rewards.levelUp.perLevel * level);
                reason = `Level ${level} achieved`;
                break;
            case 'achievement':
                gbuvReward = rewards.achievement[source] || 10;
                reason = `Achievement: ${source}`;
                break;
            case 'referral':
                gbuvReward = rewards.referral;
                reason = 'Referral bonus';
                break;
            default:
                gbuvReward = amount || 0;
                reason = source || 'Game reward';
        }
        
        if (gbuvReward > 0) {
            this.creditGBUV(this.user?.uid, gbuvReward, reason);
        }
    },
    
    async handleGamePurchase(detail) {
        const { item, quantity = 1 } = detail;
        const purchases = this.pricing.game;
        
        const itemData = purchases[item];
        if (!itemData) {
            console.warn(`Unknown game item: ${item}`);
            return null;
        }
        
        const totalCost = itemData.gbuv * quantity;
        const tx = await this.debitGBUV(totalCost, `Game purchase: ${item} x${quantity}`);
        
        if (tx) {
            // Dispatch purchase complete event
            window.dispatchEvent(new CustomEvent('gamePurchaseComplete', {
                detail: { item, quantity, cost: totalCost }
            }));
        }
        
        return tx;
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // ACADEMY MECHANICS INTEGRATION
    // ═══════════════════════════════════════════════════════════════════════════
    
    handleAcademyReward(detail) {
        const { type, courseName, score } = detail;
        const rewards = this.pricing.academy.rewards;
        
        let gbuvReward = 0;
        let reason = '';
        
        switch (type) {
            case 'lessonComplete':
                gbuvReward = rewards.lessonComplete;
                reason = `Lesson completed: ${courseName}`;
                break;
            case 'quizPassed':
                gbuvReward = rewards.quizPassed;
                if (score === 100) gbuvReward += rewards.perfectScore;
                reason = `Quiz passed: ${courseName} (${score}%)`;
                break;
            case 'courseComplete':
                gbuvReward = rewards.courseComplete;
                reason = `Course completed: ${courseName}`;
                break;
            case 'certificationEarned':
                gbuvReward = rewards.certificationEarned;
                reason = `Certification earned: ${courseName}`;
                break;
            case 'helpOthers':
                gbuvReward = rewards.helpOthers;
                reason = 'Helped community member';
                break;
        }
        
        if (gbuvReward > 0) {
            this.creditGBUV(this.user?.uid, gbuvReward, reason);
        }
    },
    
    async handleAcademyPurchase(detail) {
        const { courseType, courseName } = detail;
        const courses = this.pricing.academy.courses;
        
        const courseData = courses[courseType];
        if (!courseData) {
            console.warn(`Unknown course type: ${courseType}`);
            return null;
        }
        
        if (courseData.gbuv === 0) {
            // Free course
            return { free: true, courseName };
        }
        
        const tx = await this.debitGBUV(courseData.gbuv, `Academy: ${courseName || courseData.name}`);
        
        if (tx) {
            window.dispatchEvent(new CustomEvent('academyPurchaseComplete', {
                detail: { courseType, courseName, cost: courseData.gbuv }
            }));
        }
        
        return tx;
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // MACHINE MECHANICS INTEGRATION
    // ═══════════════════════════════════════════════════════════════════════════
    
    handleMachineReward(detail) {
        const { type, hours, quality, rarity } = detail;
        const rewards = this.pricing.machine.rewards;
        
        let gbuvReward = 0;
        let reason = '';
        
        if (type === 'mining') {
            gbuvReward = (hours || 1) * rewards.perHour;
            
            // Quality bonus
            if (quality && rewards.qualityBonus[quality]) {
                gbuvReward += rewards.qualityBonus[quality];
            }
            
            // Rarity bonus
            if (rarity && rewards.rarityBonus[rarity]) {
                gbuvReward += rewards.rarityBonus[rarity];
            }
            
            reason = `Machine mining: ${hours}h (${quality || 'standard'}, ${rarity || 'common'})`;
        }
        
        if (gbuvReward > 0) {
            this.creditGBUV(this.user?.uid, gbuvReward, reason);
        }
    },
    
    async handleMachineOperation(detail) {
        const { operation, machineId } = detail;
        const operations = this.pricing.machine.operations;
        
        const opData = operations[operation];
        if (!opData) {
            console.warn(`Unknown operation: ${operation}`);
            return null;
        }
        
        const tx = await this.debitGBUV(opData.gbuv, `Machine op: ${opData.description}`);
        
        if (tx) {
            window.dispatchEvent(new CustomEvent('machineOperationComplete', {
                detail: { operation, machineId, cost: opData.gbuv }
            }));
        }
        
        return tx;
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // MERLIN AI MECHANICS INTEGRATION
    // ═══════════════════════════════════════════════════════════════════════════
    
    async handleMerlinService(detail) {
        const { service, data } = detail;
        const services = this.pricing.merlin.services;
        
        const serviceData = services[service];
        if (!serviceData) {
            console.warn(`Unknown Merlin service: ${service}`);
            return null;
        }
        
        // Check subscription
        if (this.hasActiveSubscription('merlin')) {
            const sub = this.subscriptions.merlin;
            if (sub.features.includes('all') || sub.features.includes(service)) {
                // Free with subscription
                window.dispatchEvent(new CustomEvent('merlinServiceComplete', {
                    detail: { service, cost: 0, subscription: true }
                }));
                return { subscription: true };
            }
        }
        
        const tx = await this.debitGBUV(serviceData.gbuv, `Merlin AI: ${serviceData.description}`);
        
        if (tx) {
            window.dispatchEvent(new CustomEvent('merlinServiceComplete', {
                detail: { service, cost: serviceData.gbuv }
            }));
        }
        
        return tx;
    },
    
    handleMerlinReward(detail) {
        const { type, contribution } = detail;
        const rewards = this.pricing.merlin.rewards;
        
        let gbuvReward = rewards[type] || 0;
        let reason = `Merlin contribution: ${type}`;
        
        if (gbuvReward > 0) {
            this.creditGBUV(this.user?.uid, gbuvReward, reason);
        }
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // SUBSCRIPTION MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════
    
    async purchaseSubscription(type, tier) {
        const tiers = this.pricing[type]?.subscriptions;
        if (!tiers || !tiers[tier]) {
            throw new Error(`Unknown subscription: ${type}/${tier}`);
        }
        
        const tierData = tiers[tier];
        
        if (tierData.gbuv === 0) {
            // Free tier
            this.subscriptions[type] = {
                tier,
                ...tierData,
                startDate: new Date().toISOString(),
                endDate: null // Free = forever
            };
            this.saveUserData();
            return { free: true };
        }
        
        const tx = await this.debitGBUV(tierData.gbuv, `${type} subscription: ${tier}`);
        
        if (tx) {
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1);
            
            this.subscriptions[type] = {
                tier,
                ...tierData,
                startDate: new Date().toISOString(),
                endDate: endDate.toISOString()
            };
            this.saveUserData();
            
            window.dispatchEvent(new CustomEvent('subscriptionPurchased', {
                detail: { type, tier, cost: tierData.gbuv }
            }));
        }
        
        return tx;
    },
    
    hasActiveSubscription(type) {
        const sub = this.subscriptions[type];
        if (!sub) return false;
        if (!sub.endDate) return true; // Free tier
        return new Date(sub.endDate) > new Date();
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // UI COMPONENTS
    // ═══════════════════════════════════════════════════════════════════════════
    
    createUI() {
        this.createStyles();
        this.createBalanceWidget();
    },
    
    createStyles() {
        if (document.getElementById('gbuv-economy-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'gbuv-economy-styles';
        style.textContent = `
            /* GBUV Balance Widget */
            .gbuv-balance-widget {
                position: fixed;
                top: 10px;
                right: 10px;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 2px solid #0f3460;
                border-radius: 12px;
                padding: 12px 16px;
                color: #fff;
                font-family: 'Segoe UI', system-ui, sans-serif;
                z-index: 10000;
                min-width: 180px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            
            .gbuv-balance-widget:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 25px rgba(0, 0, 0, 0.4);
            }
            
            .gbuv-balance-widget .token-icon {
                font-size: 24px;
                margin-right: 8px;
            }
            
            .gbuv-balance-widget .balance-amount {
                font-size: 20px;
                font-weight: bold;
                color: #ffd700;
            }
            
            .gbuv-balance-widget .balance-usd {
                font-size: 12px;
                color: #888;
                margin-left: 4px;
            }
            
            .gbuv-balance-widget .top-up-btn {
                display: block;
                margin-top: 8px;
                padding: 6px 12px;
                background: linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%);
                border: none;
                border-radius: 6px;
                color: #fff;
                font-weight: bold;
                cursor: pointer;
                transition: opacity 0.2s;
                width: 100%;
            }
            
            .gbuv-balance-widget .top-up-btn:hover {
                opacity: 0.9;
            }
            
            /* Payment Modal */
            .gbuv-modal-backdrop {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .gbuv-modal {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 2px solid #0f3460;
                border-radius: 16px;
                padding: 24px;
                max-width: 500px;
                width: 90%;
                color: #fff;
                max-height: 80vh;
                overflow-y: auto;
            }
            
            .gbuv-modal h2 {
                margin: 0 0 16px;
                color: #ffd700;
            }
            
            .gbuv-modal .pricing-tiers {
                display: grid;
                gap: 8px;
                margin: 16px 0;
            }
            
            .gbuv-modal .tier {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                cursor: pointer;
                transition: background 0.2s;
            }
            
            .gbuv-modal .tier:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .gbuv-modal .tier.selected {
                border: 2px solid #ffd700;
            }
            
            .gbuv-modal .tier .bonus {
                color: #4caf50;
                font-size: 12px;
            }
            
            .gbuv-modal .paypal-btn {
                display: block;
                width: 100%;
                padding: 14px;
                background: #0070ba;
                border: none;
                border-radius: 8px;
                color: #fff;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                margin-top: 16px;
            }
            
            .gbuv-modal .paypal-btn:hover {
                background: #005ea6;
            }
            
            .gbuv-modal .close-btn {
                position: absolute;
                top: 12px;
                right: 12px;
                background: none;
                border: none;
                color: #888;
                font-size: 24px;
                cursor: pointer;
            }
            
            .gbuv-modal .payment-info {
                background: rgba(255, 215, 0, 0.1);
                border: 1px solid rgba(255, 215, 0, 0.3);
                border-radius: 8px;
                padding: 12px;
                margin: 16px 0;
                font-size: 14px;
            }
            
            .gbuv-notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #1a1a2e;
                border: 2px solid #0f3460;
                border-radius: 12px;
                padding: 16px 20px;
                color: #fff;
                z-index: 10002;
                animation: slideIn 0.3s ease;
            }
            
            .gbuv-notification.error {
                border-color: #f44336;
            }
            
            .gbuv-notification.success {
                border-color: #4caf50;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    },
    
    createBalanceWidget() {
        if (document.getElementById('gbuv-balance-widget')) return;
        
        const widget = document.createElement('div');
        widget.id = 'gbuv-balance-widget';
        widget.className = 'gbuv-balance-widget';
        widget.onclick = () => this.showTopUpModal();
        
        this.updateBalanceWidget(widget);
        document.body.appendChild(widget);
    },
    
    updateBalanceWidget(widget = null) {
        widget = widget || document.getElementById('gbuv-balance-widget');
        if (!widget) return;
        
        const usdValue = (this.balance * this.config.GBUV_TO_USD).toFixed(2);
        
        widget.innerHTML = `
            <div style="display: flex; align-items: center;">
                <span class="token-icon">🪙</span>
                <div>
                    <div class="balance-amount">${this.balance.toLocaleString()} GBUV</div>
                    <span class="balance-usd">≈ $${usdValue} USD</span>
                </div>
            </div>
            <button class="top-up-btn" onclick="event.stopPropagation(); GBUVTokenEconomy.showTopUpModal();">
                💳 Top Up
            </button>
        `;
    },
    
    updateBalanceDisplay() {
        this.updateBalanceWidget();
    },
    
    showTopUpModal() {
        const existing = document.getElementById('gbuv-topup-modal');
        if (existing) existing.remove();
        
        const modal = document.createElement('div');
        modal.id = 'gbuv-topup-modal';
        modal.className = 'gbuv-modal-backdrop';
        
        const tierOptions = this.config.purchaseTiers.map((tier, index) => {
            const gbuv = tier.minUSD * tier.rate;
            return `
                <div class="tier" data-amount="${tier.minUSD}" onclick="GBUVTokenEconomy.selectTier(${tier.minUSD})">
                    <div>
                        <strong>$${tier.minUSD} USD</strong>
                        ${tier.bonus > 0 ? `<span class="bonus">+${tier.bonus}% bonus!</span>` : ''}
                    </div>
                    <div style="text-align: right;">
                        <strong style="color: #ffd700;">${gbuv.toLocaleString()} GBUV</strong>
                    </div>
                </div>
            `;
        }).join('');
        
        modal.innerHTML = `
            <div class="gbuv-modal" style="position: relative;">
                <button class="close-btn" onclick="GBUVTokenEconomy.closeTopUpModal()">×</button>
                
                <h2>🪙 Top Up GBUV</h2>
                <p>Purchase GBUV tokens via PayPal to barbrickdesign@gmail.com</p>
                
                <div class="pricing-tiers">
                    ${tierOptions}
                </div>
                
                <div class="payment-info">
                    <strong>📧 PayPal Email:</strong> ${this.config.paypalEmail}<br>
                    <strong>💳 PayPal.me:</strong> <a href="${this.config.paypalMeLink}" target="_blank" style="color: #00d2ff;">${this.config.paypalMeLink}</a>
                </div>
                
                <div style="margin: 16px 0;">
                    <label style="display: block; margin-bottom: 8px;">Or enter custom amount:</label>
                    <input type="number" id="custom-amount" min="5" step="1" placeholder="$5 minimum"
                           style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #0f3460; background: #16213e; color: #fff;">
                </div>
                
                <div id="purchase-summary" style="margin: 16px 0; padding: 12px; background: rgba(0,0,0,0.3); border-radius: 8px;">
                    <p>Select an amount to see your GBUV total</p>
                </div>
                
                <button class="paypal-btn" onclick="GBUVTokenEconomy.proceedToPayPal()">
                    <img src="https://www.paypalobjects.com/webstatic/icon/pp258.png" 
                         style="height: 20px; vertical-align: middle; margin-right: 8px;">
                    Pay with PayPal
                </button>
                
                <p style="font-size: 12px; color: #888; margin-top: 16px; text-align: center;">
                    After payment, your GBUV will be credited within 24 hours.<br>
                    Include your email in the PayPal note for faster processing.
                </p>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.selectedAmount = this.config.minPurchaseUSD;
        
        // Setup custom amount listener
        document.getElementById('custom-amount').addEventListener('input', (e) => {
            const amount = parseFloat(e.target.value);
            if (amount >= this.config.minPurchaseUSD) {
                this.selectTier(amount);
            }
        });
    },
    
    selectTier(amount) {
        this.selectedAmount = amount;
        
        // Update UI
        document.querySelectorAll('.gbuv-modal .tier').forEach(el => {
            el.classList.remove('selected');
            if (parseInt(el.dataset.amount) === amount) {
                el.classList.add('selected');
            }
        });
        
        // Update summary
        const calc = this.calculatePurchase(amount);
        const summary = document.getElementById('purchase-summary');
        if (summary && !calc.error) {
            summary.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Base GBUV:</span>
                    <span>${calc.baseGBUV.toLocaleString()} GBUV</span>
                </div>
                ${calc.bonusGBUV > 0 ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #4caf50;">
                    <span>Bonus (+${calc.bonusPercent}%):</span>
                    <span>+${calc.bonusGBUV.toLocaleString()} GBUV</span>
                </div>
                ` : ''}
                <div style="display: flex; justify-content: space-between; font-weight: bold; border-top: 1px solid #333; padding-top: 8px;">
                    <span>Total:</span>
                    <span style="color: #ffd700;">${calc.totalGBUV.toLocaleString()} GBUV</span>
                </div>
            `;
        }
    },
    
    closeTopUpModal() {
        const modal = document.getElementById('gbuv-topup-modal');
        if (modal) modal.remove();
    },
    
    async proceedToPayPal() {
        const amount = this.selectedAmount || this.config.minPurchaseUSD;
        const purchase = await this.initiatePurchase(amount);
        
        if (purchase) {
            this.closeTopUpModal();
        }
    },
    
    showPaymentModal(purchase, paypalLink) {
        const modal = document.createElement('div');
        modal.id = 'payment-instructions-modal';
        modal.className = 'gbuv-modal-backdrop';
        
        modal.innerHTML = `
            <div class="gbuv-modal" style="position: relative;">
                <button class="close-btn" onclick="document.getElementById('payment-instructions-modal').remove()">×</button>
                
                <h2>💳 Complete Your Purchase</h2>
                
                <div class="payment-info">
                    <p><strong>Amount:</strong> $${purchase.usdAmount} USD</p>
                    <p><strong>You'll receive:</strong> ${purchase.gbuvAmount.toLocaleString()} GBUV</p>
                    <p><strong>Order ID:</strong> ${purchase.id}</p>
                </div>
                
                <ol style="margin: 16px 0; padding-left: 20px;">
                    <li style="margin-bottom: 8px;">Click the PayPal button below</li>
                    <li style="margin-bottom: 8px;">Send $${purchase.usdAmount} to ${this.config.paypalEmail}</li>
                    <li style="margin-bottom: 8px;"><strong>IMPORTANT:</strong> Include this in the note: <code style="background: #333; padding: 2px 6px; border-radius: 4px;">GBUV-${purchase.id}</code></li>
                    <li style="margin-bottom: 8px;">Your GBUV will be credited within 24 hours</li>
                </ol>
                
                <a href="${paypalLink}" target="_blank" class="paypal-btn" style="display: block; text-align: center; text-decoration: none;">
                    <img src="https://www.paypalobjects.com/webstatic/icon/pp258.png" 
                         style="height: 20px; vertical-align: middle; margin-right: 8px;">
                    Pay $${purchase.usdAmount} with PayPal
                </a>
                
                <p style="font-size: 12px; color: #888; margin-top: 16px; text-align: center;">
                    Questions? Contact ${this.config.adminEmail}
                </p>
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    showNotification(title, message, type = 'info') {
        const existing = document.querySelectorAll('.gbuv-notification');
        existing.forEach(el => el.remove());
        
        const notification = document.createElement('div');
        notification.className = `gbuv-notification ${type}`;
        notification.innerHTML = `
            <strong>${title}</strong>
            <p style="margin: 4px 0 0; font-size: 14px;">${message}</p>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 5000);
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // API METHODS FOR EXTERNAL INTEGRATION
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Get current balance
     */
    getBalance() {
        return this.balance;
    },
    
    /**
     * Get pricing for a category
     */
    getPricing(category) {
        return this.pricing[category] || null;
    },
    
    /**
     * Check if user can afford something
     */
    canAfford(amount) {
        return this.balance >= amount;
    },
    
    /**
     * Process a purchase directly
     */
    async purchase(category, item, quantity = 1) {
        const categoryPricing = this.pricing[category];
        if (!categoryPricing) throw new Error(`Unknown category: ${category}`);
        
        const itemData = categoryPricing[item] || categoryPricing.services?.[item] || categoryPricing.courses?.[item];
        if (!itemData) throw new Error(`Unknown item: ${item}`);
        
        const cost = (itemData.gbuv || 0) * quantity;
        return await this.debitGBUV(cost, `${category}: ${item} x${quantity}`);
    },
    
    /**
     * Award reward directly
     */
    async reward(category, type, multiplier = 1) {
        const categoryPricing = this.pricing[category];
        if (!categoryPricing?.rewards) throw new Error(`Unknown category: ${category}`);
        
        const amount = (categoryPricing.rewards[type] || 0) * multiplier;
        return await this.creditGBUV(this.user?.uid, amount, `${category} reward: ${type}`);
    },
    
    /**
     * Get transaction history
     */
    getTransactions(limit = 50) {
        return this.transactions.slice(-limit).reverse();
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// AUTO-INITIALIZE
// ═══════════════════════════════════════════════════════════════════════════════

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.GBUVTokenEconomy = GBUVTokenEconomy;
        GBUVTokenEconomy.init();
    });
} else {
    window.GBUVTokenEconomy = GBUVTokenEconomy;
    GBUVTokenEconomy.init();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GBUVTokenEconomy;
}
