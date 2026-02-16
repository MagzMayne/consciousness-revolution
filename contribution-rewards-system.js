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
 * File: contribution-rewards-system.js
 * Declaration ID: IP-1915C182-MLL28ZUP
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CONTRIBUTION REWARDS SYSTEM
 * GemBot AI Control System - Ryan Barbrick / Barbrick Design
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Rewards users with GBUV tokens for contributing to the ecosystem:
 * - Scanning repositories for the Neural Dashboard
 * - Adding repos to the knowledgebase
 * - Contributing to documentation
 * - Improving AI training data
 * - Developer compensation for code contributions
 * 
 * © 2024-2025 Ryan Barbrick. All Rights Reserved.
 * Contact: BarbrickDesign@gmail.com
 * ═══════════════════════════════════════════════════════════════════════════
 */

class ContributionRewardsSystem {
    constructor() {
        // Reward configurations in GBUV tokens
        this.REWARD_RATES = {
            // Repository Scanning Rewards
            REPO_SCAN: 5,                    // Per repository scanned
            REPO_SCAN_FIRST: 50,             // First scan bonus
            REPO_SCAN_LARGE: 10,             // Bonus for repos with 50+ files
            REPO_SCAN_COMPLETE: 25,          // Full scan completion bonus
            
            // Knowledgebase Contributions
            KB_ARTICLE_ADD: 20,              // Add article to knowledgebase
            KB_ARTICLE_QUALITY: 50,          // High-quality article bonus
            KB_ARTICLE_REFERENCED: 10,       // Article gets referenced
            KB_CODE_SAMPLE: 15,              // Code sample contribution
            KB_TUTORIAL: 100,                // Full tutorial contribution
            
            // Documentation Contributions
            DOC_COMMENT_ADD: 2,              // JSDoc/comment added
            DOC_README_UPDATE: 25,           // README improvement
            DOC_GUIDE_CREATE: 75,            // New guide/documentation
            
            // AI Training Data
            AI_FEEDBACK_POSITIVE: 5,         // Mark AI response as helpful
            AI_FEEDBACK_DETAILED: 15,        // Detailed feedback for AI
            AI_TRAINING_SAMPLE: 25,          // Provide training sample
            AI_BUG_REPORT: 20,               // Report AI behavior bug
            
            // Developer Code Contributions
            DEV_BUG_FIX: 50,                 // Bug fix contribution
            DEV_FEATURE: 100,                // Feature contribution
            DEV_OPTIMIZATION: 30,            // Code optimization
            DEV_SECURITY_FIX: 200,           // Security vulnerability fix
            DEV_REVIEW: 15,                  // Code review contribution
            
            // Community & Engagement
            COMMUNITY_HELP: 10,              // Help another user
            COMMUNITY_ANSWER: 25,            // Answer question well
            COMMUNITY_SHARE: 5,              // Share project/feature
            REFERRAL_SIGNUP: 100,            // New user referral
            REFERRAL_ACTIVE: 50,             // Referred user becomes active
            
            // Streaks & Milestones
            DAILY_LOGIN_STREAK: 5,           // Per day streak bonus
            WEEKLY_ACTIVE: 50,               // Active 7 days in a row
            MONTHLY_CONTRIBUTOR: 200,        // Contributed each week in month
            
            // Special Achievements
            FIRST_CONTRIBUTION: 100,         // First ever contribution
            MILESTONE_10: 50,                // 10 contributions
            MILESTONE_50: 250,               // 50 contributions
            MILESTONE_100: 500,              // 100 contributions
            MILESTONE_500: 2500              // 500 contributions
        };
        
        // Contribution categories for tracking
        this.CATEGORIES = {
            REPO_SCAN: 'repository_scanning',
            KNOWLEDGEBASE: 'knowledgebase',
            DOCUMENTATION: 'documentation',
            AI_TRAINING: 'ai_training',
            DEVELOPMENT: 'development',
            COMMUNITY: 'community'
        };
        
        // Storage key for contribution history
        this.STORAGE_KEY = 'gbuv_contributions_v1';
        this.WALLET_KEY = 'gbuv_reward_wallet';
        
        // Load existing data
        this.contributions = this.loadContributions();
        this.rewardWallet = this.loadRewardWallet();
        
        console.log('🎁 Contribution Rewards System initialized');
        console.log('💰 Current reward balance:', this.rewardWallet.balance, 'GBUV');
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // STORAGE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════
    
    loadContributions() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : {
                history: [],
                totals: {},
                streaks: { current: 0, best: 0, lastDate: null }
            };
        } catch (e) {
            console.error('Error loading contributions:', e);
            return { history: [], totals: {}, streaks: { current: 0, best: 0, lastDate: null } };
        }
    }
    
    saveContributions() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.contributions));
    }
    
    loadRewardWallet() {
        try {
            const data = localStorage.getItem(this.WALLET_KEY);
            return data ? JSON.parse(data) : {
                balance: 0,
                totalEarned: 0,
                totalClaimed: 0,
                transactions: []
            };
        } catch (e) {
            console.error('Error loading reward wallet:', e);
            return { balance: 0, totalEarned: 0, totalClaimed: 0, transactions: [] };
        }
    }
    
    saveRewardWallet() {
        localStorage.setItem(this.WALLET_KEY, JSON.stringify(this.rewardWallet));
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // REWARD GRANTING
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Grant GBUV reward for a contribution
     * @param {string} type - Reward type from REWARD_RATES
     * @param {number} [multiplier=1] - Optional multiplier for bonus rewards
     * @param {object} [metadata={}] - Additional data about the contribution
     * @returns {object} Reward result with amount and transaction ID
     */
    grantReward(type, multiplier = 1, metadata = {}) {
        const baseReward = this.REWARD_RATES[type];
        if (!baseReward) {
            console.warn('Unknown reward type:', type);
            return { success: false, error: 'Unknown reward type' };
        }
        
        const amount = Math.round(baseReward * multiplier);
        const txId = this.generateTransactionId();
        
        // Record transaction
        const transaction = {
            id: txId,
            type: type,
            amount: amount,
            multiplier: multiplier,
            timestamp: new Date().toISOString(),
            metadata: metadata
        };
        
        this.rewardWallet.balance += amount;
        this.rewardWallet.totalEarned += amount;
        this.rewardWallet.transactions.unshift(transaction);
        
        // Keep only last 100 transactions
        if (this.rewardWallet.transactions.length > 100) {
            this.rewardWallet.transactions = this.rewardWallet.transactions.slice(0, 100);
        }
        
        // Record contribution
        const contribution = {
            id: txId,
            type: type,
            category: this.getCategoryForType(type),
            amount: amount,
            timestamp: new Date().toISOString(),
            metadata: metadata
        };
        
        this.contributions.history.unshift(contribution);
        this.updateContributionTotals(type, amount);
        this.updateStreaks();
        
        // Keep only last 500 contributions
        if (this.contributions.history.length > 500) {
            this.contributions.history = this.contributions.history.slice(0, 500);
        }
        
        this.saveContributions();
        this.saveRewardWallet();
        
        // Check for milestones
        this.checkMilestones();
        
        // Dispatch event for UI updates
        window.dispatchEvent(new CustomEvent('gbuv:reward-granted', {
            detail: { transaction, balance: this.rewardWallet.balance }
        }));
        
        console.log(`🎁 Granted ${amount} GBUV for ${type}`, metadata);
        
        return {
            success: true,
            amount: amount,
            txId: txId,
            newBalance: this.rewardWallet.balance
        };
    }
    
    generateTransactionId() {
        return 'GBUV-' + Date.now().toString(36).toUpperCase() + '-' + 
               Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    
    getCategoryForType(type) {
        if (type.startsWith('REPO_')) return this.CATEGORIES.REPO_SCAN;
        if (type.startsWith('KB_')) return this.CATEGORIES.KNOWLEDGEBASE;
        if (type.startsWith('DOC_')) return this.CATEGORIES.DOCUMENTATION;
        if (type.startsWith('AI_')) return this.CATEGORIES.AI_TRAINING;
        if (type.startsWith('DEV_')) return this.CATEGORIES.DEVELOPMENT;
        if (type.startsWith('COMMUNITY_') || type.startsWith('REFERRAL_')) return this.CATEGORIES.COMMUNITY;
        return 'other';
    }
    
    updateContributionTotals(type, amount) {
        const category = this.getCategoryForType(type);
        if (!this.contributions.totals[category]) {
            this.contributions.totals[category] = { count: 0, gbuv: 0 };
        }
        this.contributions.totals[category].count++;
        this.contributions.totals[category].gbuv += amount;
    }
    
    updateStreaks() {
        const today = new Date().toDateString();
        const lastDate = this.contributions.streaks.lastDate;
        
        if (!lastDate) {
            this.contributions.streaks.current = 1;
        } else if (lastDate === today) {
            // Same day, no streak change
        } else {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastDate === yesterday.toDateString()) {
                this.contributions.streaks.current++;
                // Grant streak bonus
                if (this.contributions.streaks.current >= 7) {
                    this.grantReward('WEEKLY_ACTIVE', 1, { streak: this.contributions.streaks.current });
                } else {
                    this.grantReward('DAILY_LOGIN_STREAK', 1, { streak: this.contributions.streaks.current });
                }
            } else {
                // Streak broken
                this.contributions.streaks.current = 1;
            }
        }
        
        // Update best streak
        if (this.contributions.streaks.current > this.contributions.streaks.best) {
            this.contributions.streaks.best = this.contributions.streaks.current;
        }
        
        this.contributions.streaks.lastDate = today;
    }
    
    checkMilestones() {
        const totalContributions = this.contributions.history.length;
        
        // Check each milestone
        const milestones = [
            { count: 1, type: 'FIRST_CONTRIBUTION' },
            { count: 10, type: 'MILESTONE_10' },
            { count: 50, type: 'MILESTONE_50' },
            { count: 100, type: 'MILESTONE_100' },
            { count: 500, type: 'MILESTONE_500' }
        ];
        
        for (const milestone of milestones) {
            const key = `milestone_${milestone.count}_granted`;
            if (totalContributions >= milestone.count && !localStorage.getItem(key)) {
                localStorage.setItem(key, 'true');
                this.grantReward(milestone.type, 1, { 
                    milestone: milestone.count,
                    totalContributions: totalContributions
                });
                this.showMilestoneNotification(milestone);
            }
        }
    }
    
    showMilestoneNotification(milestone) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #1a1f3a, #2d1f3a);
            border: 2px solid #ffd700;
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            color: white;
            z-index: 999999;
            box-shadow: 0 0 50px rgba(255, 215, 0, 0.5);
            animation: milestone-pop 0.5s ease;
        `;
        
        notification.innerHTML = `
            <div style="font-size: 64px; margin-bottom: 20px;">🏆</div>
            <h2 style="color: #ffd700; margin: 0 0 10px;">MILESTONE REACHED!</h2>
            <p style="font-size: 24px; color: #4affff;">${milestone.count} Contributions</p>
            <p style="margin-top: 20px; color: #9f7aea;">
                +${this.REWARD_RATES[milestone.type]} GBUV Bonus Awarded!
            </p>
            <button onclick="this.parentElement.remove()" style="
                margin-top: 20px;
                padding: 12px 30px;
                background: linear-gradient(135deg, #4affff, #9f7aea);
                border: none;
                border-radius: 10px;
                color: #1a1f3a;
                font-weight: bold;
                cursor: pointer;
            ">Awesome! 🎉</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 10 seconds
        setTimeout(() => notification.remove(), 10000);
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // SPECIFIC CONTRIBUTION HANDLERS
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Reward for scanning a repository
     */
    rewardRepoScan(repoName, fileCount, isFirstScan = false) {
        const results = [];
        
        // Base scan reward
        results.push(this.grantReward('REPO_SCAN', 1, { repo: repoName, files: fileCount }));
        
        // First scan bonus
        if (isFirstScan) {
            results.push(this.grantReward('REPO_SCAN_FIRST', 1, { repo: repoName }));
        }
        
        // Large repo bonus
        if (fileCount >= 50) {
            results.push(this.grantReward('REPO_SCAN_LARGE', 1, { repo: repoName, files: fileCount }));
        }
        
        return results;
    }
    
    /**
     * Reward for completing a full repository analysis
     */
    rewardRepoScanComplete(repoName, stats) {
        return this.grantReward('REPO_SCAN_COMPLETE', 1, { 
            repo: repoName,
            ...stats
        });
    }
    
    /**
     * Reward for adding to knowledgebase
     */
    rewardKnowledgebaseContribution(articleTitle, type = 'article', isHighQuality = false) {
        const results = [];
        
        switch (type) {
            case 'article':
                results.push(this.grantReward('KB_ARTICLE_ADD', 1, { title: articleTitle }));
                if (isHighQuality) {
                    results.push(this.grantReward('KB_ARTICLE_QUALITY', 1, { title: articleTitle }));
                }
                break;
            case 'code':
                results.push(this.grantReward('KB_CODE_SAMPLE', 1, { title: articleTitle }));
                break;
            case 'tutorial':
                results.push(this.grantReward('KB_TUTORIAL', 1, { title: articleTitle }));
                break;
        }
        
        return results;
    }
    
    /**
     * Reward for developer code contribution
     */
    rewardDeveloperContribution(type, description, prLink = null) {
        const typeMap = {
            'bug_fix': 'DEV_BUG_FIX',
            'feature': 'DEV_FEATURE',
            'optimization': 'DEV_OPTIMIZATION',
            'security': 'DEV_SECURITY_FIX',
            'review': 'DEV_REVIEW'
        };
        
        const rewardType = typeMap[type] || 'DEV_BUG_FIX';
        return this.grantReward(rewardType, 1, { 
            description: description,
            prLink: prLink
        });
    }
    
    /**
     * Reward for AI feedback
     */
    rewardAIFeedback(feedbackType, details) {
        const typeMap = {
            'positive': 'AI_FEEDBACK_POSITIVE',
            'detailed': 'AI_FEEDBACK_DETAILED',
            'training_sample': 'AI_TRAINING_SAMPLE',
            'bug_report': 'AI_BUG_REPORT'
        };
        
        const rewardType = typeMap[feedbackType] || 'AI_FEEDBACK_POSITIVE';
        return this.grantReward(rewardType, 1, { details: details });
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // WALLET & CLAIMING
    // ═══════════════════════════════════════════════════════════════════════════
    
    getBalance() {
        return this.rewardWallet.balance;
    }
    
    getTotalEarned() {
        return this.rewardWallet.totalEarned;
    }
    
    getTransactionHistory() {
        return this.rewardWallet.transactions;
    }
    
    getContributionStats() {
        return {
            totalContributions: this.contributions.history.length,
            categoryTotals: this.contributions.totals,
            currentStreak: this.contributions.streaks.current,
            bestStreak: this.contributions.streaks.best,
            recentContributions: this.contributions.history.slice(0, 10)
        };
    }
    
    /**
     * Claim rewards to main Solana wallet
     * @param {number} amount - Amount to claim
     * @param {string} destinationWallet - Solana wallet address
     */
    async claimRewards(amount, destinationWallet) {
        if (amount > this.rewardWallet.balance) {
            return { success: false, error: 'Insufficient balance' };
        }
        
        // In production, this would trigger a real Solana transfer
        // For now, we simulate it
        
        const claimTx = {
            id: 'CLAIM-' + Date.now().toString(36).toUpperCase(),
            type: 'CLAIM',
            amount: -amount,
            destinationWallet: destinationWallet,
            timestamp: new Date().toISOString(),
            status: 'pending'
        };
        
        this.rewardWallet.balance -= amount;
        this.rewardWallet.totalClaimed += amount;
        this.rewardWallet.transactions.unshift(claimTx);
        this.saveRewardWallet();
        
        // Dispatch event
        window.dispatchEvent(new CustomEvent('gbuv:rewards-claimed', {
            detail: { amount, destinationWallet, newBalance: this.rewardWallet.balance }
        }));
        
        console.log(`💸 Claimed ${amount} GBUV to ${destinationWallet}`);
        
        return {
            success: true,
            txId: claimTx.id,
            amount: amount,
            newBalance: this.rewardWallet.balance
        };
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // UI HELPERS
    // ═══════════════════════════════════════════════════════════════════════════
    
    showRewardNotification(type, amount) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #1a1f3a, #2d1f3a);
            border: 2px solid #4affff;
            border-radius: 12px;
            padding: 15px 25px;
            color: white;
            z-index: 99999;
            animation: slide-in 0.3s ease;
            display: flex;
            align-items: center;
            gap: 15px;
            box-shadow: 0 10px 30px rgba(74, 255, 255, 0.3);
        `;
        
        toast.innerHTML = `
            <span style="font-size: 24px;">💎</span>
            <div>
                <div style="font-weight: bold; color: #4affff;">+${amount} GBUV</div>
                <div style="font-size: 12px; color: #9f7aea;">${type.replace(/_/g, ' ')}</div>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slide-out 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

// Create global instance
window.contributionRewards = new ContributionRewardsSystem();

// Add CSS animations
const contributionRewardsStyle = document.createElement('style');
contributionRewardsStyle.textContent = `
    @keyframes slide-in {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slide-out {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes milestone-pop {
        0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
        70% { transform: translate(-50%, -50%) scale(1.1); }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    }
`;
document.head.appendChild(contributionRewardsStyle);

// Listen for reward events to show notifications
window.addEventListener('gbuv:reward-granted', (e) => {
    const { transaction } = e.detail;
    window.contributionRewards.showRewardNotification(transaction.type, transaction.amount);
});

console.log('✅ Contribution Rewards System loaded');
console.log('📖 Usage: window.contributionRewards.grantReward("REPO_SCAN", 1, {repo: "example"})');
