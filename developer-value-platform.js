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
 * File: developer-value-platform.js
 * Declaration ID: IP-547B5CFB-MLL28ZUQ
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DEVELOPER VALUE PLATFORM
 * GemBot AI Control System - Ryan Barbrick / Barbrick Design
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Tracks developer contributions that AI systems learn from and provides
 * a compensation mechanism for developers whose work improves AI capabilities.
 * 
 * Vision: Help all devs get the value they deserve for the time they have put
 * in and for the many ideas they have input that all AI gather knowledge from.
 * 
 * © 2024-2025 Ryan Barbrick. All Rights Reserved.
 * Contact: BarbrickDesign@gmail.com
 * ═══════════════════════════════════════════════════════════════════════════
 */

class DeveloperValuePlatform {
    constructor() {
        // Value rates per contribution type (in GBUV)
        this.VALUE_RATES = {
            // Code contributions that improve AI learning
            CODE_PATTERN: 50,           // New code pattern AI can learn from
            CODE_SAMPLE_USED: 10,       // Each time AI uses your code sample
            ALGORITHM: 200,             // Novel algorithm contribution
            BEST_PRACTICE: 75,          // Best practice documentation
            
            // Knowledge contributions
            KNOWLEDGE_ARTICLE: 100,     // Knowledge article used by AI
            TRAINING_DATA: 25,          // Training data contribution
            DOCUMENTATION: 50,          // Documentation that helps users
            TUTORIAL: 150,              // Tutorial that teaches concepts
            
            // Problem solving
            BUG_SOLUTION: 100,          // Solution to a bug
            FEATURE_IDEA: 50,           // Feature idea implemented
            OPTIMIZATION: 75,           // Performance optimization
            SECURITY_FIX: 250,          // Security vulnerability fix
            
            // Community impact
            HELP_OTHERS: 25,            // Helping other developers
            ANSWER_USED: 15,            // Your answer used by others
            REFERRAL: 100,              // Bringing new developer
            REVIEW: 35,                 // Code/content review
            
            // AI improvement
            AI_CORRECTION: 30,          // Correcting AI output
            AI_FEEDBACK: 20,            // Useful feedback about AI
            PROMPT_PATTERN: 50,         // Effective prompt pattern
            USE_CASE: 40                // New use case documentation
        };
        
        // Developer profiles storage
        this.STORAGE_KEY = 'dev_value_platform_v1';
        this.LEADERBOARD_KEY = 'dev_value_leaderboard_v1';
        
        // Load data
        this.developers = this.loadDevelopers();
        this.leaderboard = this.loadLeaderboard();
        
        // Track AI learning events
        this.aiLearningEvents = [];
        
        console.log('👨‍💻 Developer Value Platform initialized');
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // STORAGE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════
    
    loadDevelopers() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error('Error loading developer data:', e);
            return {};
        }
    }
    
    saveDevelopers() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.developers));
    }
    
    loadLeaderboard() {
        try {
            const data = localStorage.getItem(this.LEADERBOARD_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error loading leaderboard:', e);
            return [];
        }
    }
    
    saveLeaderboard() {
        localStorage.setItem(this.LEADERBOARD_KEY, JSON.stringify(this.leaderboard));
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // DEVELOPER REGISTRATION & PROFILE
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Register or get a developer profile
     */
    getOrCreateDeveloper(developerInfo) {
        const { username, email, githubProfile, solanaWallet } = developerInfo;
        const devId = this.generateDevId(username || email);
        
        if (!this.developers[devId]) {
            this.developers[devId] = {
                id: devId,
                username: username,
                email: email,
                githubProfile: githubProfile || null,
                solanaWallet: solanaWallet || null,
                registeredAt: new Date().toISOString(),
                stats: {
                    totalValue: 0,
                    totalContributions: 0,
                    aiUsageCount: 0,
                    rank: 'Apprentice'
                },
                contributions: [],
                aiLearningImpact: [],
                payouts: []
            };
            
            this.saveDevelopers();
            console.log('👨‍💻 New developer registered:', username);
            
            // Grant welcome bonus
            this.recordContribution(devId, 'WELCOME_BONUS', {
                description: 'Welcome to the Developer Value Platform!'
            }, 100);
        }
        
        return this.developers[devId];
    }
    
    generateDevId(identifier) {
        // Create a consistent hash-like ID from identifier
        let hash = 0;
        for (let i = 0; i < identifier.length; i++) {
            const char = identifier.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 'DEV-' + Math.abs(hash).toString(36).toUpperCase();
    }
    
    /**
     * Update developer's Solana wallet for payouts
     */
    setPayoutWallet(devId, solanaWallet) {
        if (this.developers[devId]) {
            this.developers[devId].solanaWallet = solanaWallet;
            this.saveDevelopers();
            return true;
        }
        return false;
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // CONTRIBUTION TRACKING
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Record a developer contribution
     */
    recordContribution(devId, type, metadata = {}, customValue = null) {
        const developer = this.developers[devId];
        if (!developer) {
            console.warn('Developer not found:', devId);
            return null;
        }
        
        const value = customValue || this.VALUE_RATES[type] || 10;
        
        const contribution = {
            id: 'CONTRIB-' + Date.now().toString(36).toUpperCase(),
            type: type,
            value: value,
            timestamp: new Date().toISOString(),
            metadata: metadata,
            aiLearned: false,
            aiUsageCount: 0
        };
        
        developer.contributions.unshift(contribution);
        developer.stats.totalValue += value;
        developer.stats.totalContributions++;
        
        // Update rank
        developer.stats.rank = this.calculateRank(developer.stats.totalValue);
        
        // Keep only last 1000 contributions per developer
        if (developer.contributions.length > 1000) {
            developer.contributions = developer.contributions.slice(0, 1000);
        }
        
        this.saveDevelopers();
        this.updateLeaderboard(devId, developer);
        
        // Integrate with contribution rewards system if available
        if (window.contributionRewards) {
            window.contributionRewards.grantReward('DEV_BUG_FIX', value / 50, {
                devId: devId,
                type: type,
                ...metadata
            });
        }
        
        // Dispatch event
        window.dispatchEvent(new CustomEvent('devvalue:contribution', {
            detail: { devId, contribution, newTotal: developer.stats.totalValue }
        }));
        
        console.log(`💰 Developer ${devId} earned ${value} GBUV for ${type}`);
        
        return contribution;
    }
    
    calculateRank(totalValue) {
        if (totalValue >= 100000) return 'Master Developer';
        if (totalValue >= 50000) return 'Senior Contributor';
        if (totalValue >= 25000) return 'Expert';
        if (totalValue >= 10000) return 'Professional';
        if (totalValue >= 5000) return 'Skilled';
        if (totalValue >= 1000) return 'Journeyman';
        if (totalValue >= 100) return 'Developer';
        return 'Apprentice';
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // AI LEARNING IMPACT TRACKING
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Track when AI learns from a developer's contribution
     */
    recordAILearning(devId, contributionId, aiSystem = 'Merlin') {
        const developer = this.developers[devId];
        if (!developer) return null;
        
        // Find the contribution
        const contribution = developer.contributions.find(c => c.id === contributionId);
        if (contribution) {
            contribution.aiLearned = true;
            
            // Grant bonus for AI learning from contribution
            const learningBonus = Math.round(contribution.value * 0.5);
            developer.stats.totalValue += learningBonus;
            
            developer.aiLearningImpact.push({
                contributionId: contributionId,
                aiSystem: aiSystem,
                timestamp: new Date().toISOString(),
                bonusValue: learningBonus
            });
            
            this.saveDevelopers();
            
            console.log(`🤖 AI (${aiSystem}) learned from ${devId}'s contribution. +${learningBonus} GBUV bonus`);
        }
        
        return contribution;
    }
    
    /**
     * Track when AI uses a developer's contribution to help users
     */
    recordAIUsage(devId, contributionId, context = {}) {
        const developer = this.developers[devId];
        if (!developer) return;
        
        const contribution = developer.contributions.find(c => c.id === contributionId);
        if (contribution) {
            contribution.aiUsageCount++;
            developer.stats.aiUsageCount++;
            
            // Grant usage royalty (10 GBUV per use)
            const royalty = this.VALUE_RATES.CODE_SAMPLE_USED || 10;
            developer.stats.totalValue += royalty;
            
            this.saveDevelopers();
            this.updateLeaderboard(devId, developer);
            
            console.log(`🔄 AI used ${devId}'s contribution. Usage #${contribution.aiUsageCount}, +${royalty} GBUV`);
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // LEADERBOARD MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════
    
    updateLeaderboard(devId, developer) {
        // Find or create entry
        let entry = this.leaderboard.find(e => e.devId === devId);
        
        if (entry) {
            entry.username = developer.username;
            entry.totalValue = developer.stats.totalValue;
            entry.rank = developer.stats.rank;
            entry.contributions = developer.stats.totalContributions;
            entry.aiUsageCount = developer.stats.aiUsageCount;
            entry.updatedAt = new Date().toISOString();
        } else {
            this.leaderboard.push({
                devId: devId,
                username: developer.username,
                totalValue: developer.stats.totalValue,
                rank: developer.stats.rank,
                contributions: developer.stats.totalContributions,
                aiUsageCount: developer.stats.aiUsageCount,
                registeredAt: developer.registeredAt,
                updatedAt: new Date().toISOString()
            });
        }
        
        // Sort by total value
        this.leaderboard.sort((a, b) => b.totalValue - a.totalValue);
        
        // Keep top 100
        if (this.leaderboard.length > 100) {
            this.leaderboard = this.leaderboard.slice(0, 100);
        }
        
        this.saveLeaderboard();
    }
    
    getLeaderboard(limit = 10) {
        return this.leaderboard.slice(0, limit);
    }
    
    getDeveloperRank(devId) {
        const index = this.leaderboard.findIndex(e => e.devId === devId);
        return index >= 0 ? index + 1 : null;
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // PAYOUT SYSTEM
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Calculate pending payout for a developer
     */
    calculatePendingPayout(devId) {
        const developer = this.developers[devId];
        if (!developer) return 0;
        
        const totalEarned = developer.stats.totalValue;
        const totalPaidOut = developer.payouts.reduce((sum, p) => sum + p.amount, 0);
        
        return totalEarned - totalPaidOut;
    }
    
    /**
     * Request a payout (simulated - in production would trigger Solana transfer)
     */
    async requestPayout(devId, amount = null) {
        const developer = this.developers[devId];
        if (!developer) {
            return { success: false, error: 'Developer not found' };
        }
        
        if (!developer.solanaWallet) {
            return { success: false, error: 'No payout wallet configured' };
        }
        
        const pendingAmount = this.calculatePendingPayout(devId);
        const payoutAmount = amount ? Math.min(amount, pendingAmount) : pendingAmount;
        
        if (payoutAmount < 100) {
            return { success: false, error: 'Minimum payout is 100 GBUV' };
        }
        
        // Create payout record
        const payout = {
            id: 'PAYOUT-' + Date.now().toString(36).toUpperCase(),
            amount: payoutAmount,
            wallet: developer.solanaWallet,
            status: 'pending',
            requestedAt: new Date().toISOString(),
            processedAt: null,
            txSignature: null
        };
        
        developer.payouts.push(payout);
        this.saveDevelopers();
        
        // In production, this would trigger an actual Solana transfer
        console.log(`💸 Payout requested: ${payoutAmount} GBUV to ${developer.solanaWallet}`);
        
        // Simulate processing
        setTimeout(() => {
            payout.status = 'completed';
            payout.processedAt = new Date().toISOString();
            payout.txSignature = 'SIM-' + Math.random().toString(36).substring(2, 15);
            this.saveDevelopers();
            
            window.dispatchEvent(new CustomEvent('devvalue:payout-completed', {
                detail: { devId, payout }
            }));
        }, 2000);
        
        return {
            success: true,
            payoutId: payout.id,
            amount: payoutAmount,
            status: 'pending'
        };
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // STATISTICS & REPORTING
    // ═══════════════════════════════════════════════════════════════════════════
    
    getDeveloperStats(devId) {
        const developer = this.developers[devId];
        if (!developer) return null;
        
        return {
            ...developer.stats,
            pendingPayout: this.calculatePendingPayout(devId),
            rank: this.getDeveloperRank(devId),
            recentContributions: developer.contributions.slice(0, 10),
            aiImpact: developer.aiLearningImpact.slice(0, 10)
        };
    }
    
    getPlatformStats() {
        const devCount = Object.keys(this.developers).length;
        const totalValue = this.leaderboard.reduce((sum, e) => sum + e.totalValue, 0);
        const totalContributions = this.leaderboard.reduce((sum, e) => sum + e.contributions, 0);
        const totalAIUsage = this.leaderboard.reduce((sum, e) => sum + (e.aiUsageCount || 0), 0);
        
        return {
            developerCount: devCount,
            totalValueDistributed: totalValue,
            totalContributions: totalContributions,
            totalAIUsageEvents: totalAIUsage,
            topContributors: this.getLeaderboard(5)
        };
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // UI HELPERS
    // ═══════════════════════════════════════════════════════════════════════════
    
    showContributionNotification(type, value, message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #1a2f1a, #1f3a1f);
            border: 2px solid #4ade80;
            border-radius: 12px;
            padding: 15px 25px;
            color: white;
            z-index: 99999;
            animation: slide-in 0.3s ease;
            display: flex;
            flex-direction: column;
            gap: 5px;
            box-shadow: 0 10px 30px rgba(74, 222, 128, 0.3);
            max-width: 350px;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 24px;">👨‍💻</span>
                <div style="font-weight: bold; color: #4ade80;">+${value} GBUV</div>
            </div>
            <div style="font-size: 12px; color: #a7f3d0;">${type.replace(/_/g, ' ')}</div>
            ${message ? `<div style="font-size: 11px; color: #86efac; margin-top: 5px;">${message}</div>` : ''}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slide-out 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
    
    showLeaderboardUI() {
        const leaderboard = this.getLeaderboard(10);
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        modal.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #1a1f3a, #2d1f3a);
                border: 2px solid #ffd700;
                border-radius: 20px;
                padding: 30px;
                max-width: 600px;
                width: 90%;
                color: white;
                max-height: 80vh;
                overflow-y: auto;
            ">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #ffd700; margin: 0;">🏆 Developer Value Leaderboard</h2>
                    <p style="color: #9f7aea; font-size: 12px;">Top contributors whose work improves AI for everyone</p>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${leaderboard.map((dev, i) => `
                        <div style="
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            padding: 15px;
                            background: rgba(255, 255, 255, 0.05);
                            border-radius: 10px;
                            border-left: 4px solid ${i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#4affff'};
                        ">
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <div style="
                                    width: 30px;
                                    height: 30px;
                                    background: ${i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#4affff'};
                                    border-radius: 50%;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    color: #1a1f3a;
                                    font-weight: bold;
                                ">${i + 1}</div>
                                <div>
                                    <div style="font-weight: bold;">${dev.username || 'Anonymous'}</div>
                                    <div style="font-size: 11px; color: #9f7aea;">${dev.rank}</div>
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <div style="color: #4ade80; font-weight: bold;">${dev.totalValue.toLocaleString()} GBUV</div>
                                <div style="font-size: 10px; color: #6b7280;">${dev.contributions} contributions</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <button onclick="this.closest('div').parentElement.remove()" style="
                    width: 100%;
                    margin-top: 20px;
                    padding: 12px;
                    background: linear-gradient(135deg, #4affff, #9f7aea);
                    border: none;
                    border-radius: 10px;
                    color: #1a1f3a;
                    font-weight: bold;
                    cursor: pointer;
                ">Close</button>
            </div>
        `;
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        document.body.appendChild(modal);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

// Create global instance
window.developerValue = new DeveloperValuePlatform();

// Listen for contribution events to show notifications
window.addEventListener('devvalue:contribution', (e) => {
    const { contribution, newTotal } = e.detail;
    window.developerValue.showContributionNotification(
        contribution.type,
        contribution.value,
        `Total earned: ${newTotal.toLocaleString()} GBUV`
    );
});

console.log('✅ Developer Value Platform loaded');
console.log('📖 Usage: window.developerValue.getOrCreateDeveloper({username: "user", email: "user@example.com"})');
console.log('📖 Record contribution: window.developerValue.recordContribution(devId, "CODE_PATTERN", {description: "..."})');
