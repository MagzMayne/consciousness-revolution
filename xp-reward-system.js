/**
 * XP Reward System - Core calculation engine for project contributions
 * Tracks developer contributions, calculates XP points, and manages rewards
 * 
 * @author Ryan Barbrick (BarbrickDesign)
 * @version 1.0.0
 */

class XPRewardSystem {
    constructor() {
        this.xpRates = {
            // Project completion contributions
            projectCreation: 500,
            projectComplete: 1000,
            projectEnhancement: 300,
            bugFix: 100,
            featureAdd: 250,
            documentation: 50,
            codeReview: 75,
            
            // Multipliers based on project complexity
            complexityMultipliers: {
                simple: 1.0,
                medium: 1.5,
                complex: 2.0,
                advanced: 3.0
            },
            
            // Completion percentage bonuses
            completionBonuses: {
                25: 1.1,   // 10% bonus at 25%
                50: 1.25,  // 25% bonus at 50%
                75: 1.5,   // 50% bonus at 75%
                100: 2.0   // 100% bonus at completion
            },
            
            // Functionality quality multipliers
            functionalityMultipliers: {
                working: 1.5,
                partial: 1.0,
                broken: 0.5,
                untested: 0.7
            }
        };
        
        // Token conversion rates (XP to crypto)
        this.tokenRates = {
            xpPerToken: 100,  // 100 XP = 1 governance token
            usdPerToken: 0.01 // Starting token value in USD
        };
        
        // User XP records
        this.userXP = new Map();
        this.contributionHistory = new Map();
    }
    
    /**
     * Calculate XP for a project contribution
     * @param {string} contributionType - Type of contribution
     * @param {Object} projectData - Project metadata
     * @returns {number} Calculated XP points
     */
    calculateXP(contributionType, projectData = {}) {
        let baseXP = this.xpRates[contributionType] || 0;
        
        // Apply complexity multiplier
        if (projectData.complexity) {
            const multiplier = this.xpRates.complexityMultipliers[projectData.complexity] || 1.0;
            baseXP *= multiplier;
        }
        
        // Apply completion bonus
        if (projectData.completion) {
            const bonusThreshold = Object.keys(this.xpRates.completionBonuses)
                .reverse()
                .find(threshold => projectData.completion >= parseInt(threshold));
            
            if (bonusThreshold) {
                baseXP *= this.xpRates.completionBonuses[bonusThreshold];
            }
        }
        
        // Apply functionality multiplier
        if (projectData.functionality) {
            const multiplier = this.xpRates.functionalityMultipliers[projectData.functionality] || 1.0;
            baseXP *= multiplier;
        }
        
        return Math.round(baseXP);
    }
    
    /**
     * Award XP to a user for a contribution
     * @param {string} userId - User identifier (GitHub username, wallet address, etc.)
     * @param {string} contributionType - Type of contribution
     * @param {Object} projectData - Project metadata
     * @param {string} description - Contribution description
     * @returns {Object} Updated user XP data
     */
    awardXP(userId, contributionType, projectData = {}, description = '') {
        const xpAmount = this.calculateXP(contributionType, projectData);
        
        // Get or initialize user data
        const currentXP = this.userXP.get(userId) || 0;
        const newXP = currentXP + xpAmount;
        this.userXP.set(userId, newXP);
        
        // Record contribution
        const userHistory = this.contributionHistory.get(userId) || [];
        userHistory.push({
            timestamp: new Date().toISOString(),
            type: contributionType,
            xpAwarded: xpAmount,
            projectId: projectData.id || projectData.filename,
            projectTitle: projectData.title,
            description,
            totalXP: newXP
        });
        this.contributionHistory.set(userId, userHistory);
        
        return {
            userId,
            xpAwarded: xpAmount,
            totalXP: newXP,
            tokens: this.xpToTokens(newXP),
            usdValue: this.xpToUSD(newXP),
            level: this.calculateLevel(newXP),
            nextLevelXP: this.getNextLevelXP(newXP)
        };
    }
    
    /**
     * Convert XP to governance tokens
     * @param {number} xp - XP amount
     * @returns {number} Token amount
     */
    xpToTokens(xp) {
        return (xp / this.tokenRates.xpPerToken).toFixed(4);
    }
    
    /**
     * Convert XP to USD value
     * @param {number} xp - XP amount
     * @returns {number} USD value
     */
    xpToUSD(xp) {
        const tokens = xp / this.tokenRates.xpPerToken;
        return (tokens * this.tokenRates.usdPerToken).toFixed(2);
    }
    
    /**
     * Calculate user level based on XP
     * @param {number} xp - Total XP
     * @returns {number} User level
     */
    calculateLevel(xp) {
        // Level formula: Level = floor(sqrt(XP / 100))
        return Math.floor(Math.sqrt(xp / 100));
    }
    
    /**
     * Get XP needed for next level
     * @param {number} currentXP - Current XP
     * @returns {number} XP needed for next level
     */
    getNextLevelXP(currentXP) {
        const currentLevel = this.calculateLevel(currentXP);
        const nextLevel = currentLevel + 1;
        const nextLevelXP = Math.pow(nextLevel, 2) * 100;
        return nextLevelXP - currentXP;
    }
    
    /**
     * Get user XP data
     * @param {string} userId - User identifier
     * @returns {Object} User XP data
     */
    getUserData(userId) {
        const totalXP = this.userXP.get(userId) || 0;
        const history = this.contributionHistory.get(userId) || [];
        
        return {
            userId,
            totalXP,
            tokens: this.xpToTokens(totalXP),
            usdValue: this.xpToUSD(totalXP),
            level: this.calculateLevel(totalXP),
            nextLevelXP: this.getNextLevelXP(totalXP),
            contributionCount: history.length,
            history: history.slice(-10) // Last 10 contributions
        };
    }
    
    /**
     * Get leaderboard of top XP earners
     * @param {number} limit - Number of users to return
     * @returns {Array} Leaderboard data
     */
    getLeaderboard(limit = 10) {
        const leaderboard = Array.from(this.userXP.entries())
            .map(([userId, xp]) => ({
                userId,
                totalXP: xp,
                tokens: this.xpToTokens(xp),
                usdValue: this.xpToUSD(xp),
                level: this.calculateLevel(xp)
            }))
            .sort((a, b) => b.totalXP - a.totalXP)
            .slice(0, limit);
        
        return leaderboard;
    }
    
    /**
     * Save XP data to localStorage
     */
    save() {
        try {
            const data = {
                userXP: Array.from(this.userXP.entries()),
                contributionHistory: Array.from(this.contributionHistory.entries()),
                savedAt: new Date().toISOString()
            };
            localStorage.setItem('xp-reward-system', JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to save XP data:', error);
            return false;
        }
    }
    
    /**
     * Load XP data from localStorage
     */
    load() {
        try {
            const saved = localStorage.getItem('xp-reward-system');
            if (saved) {
                const data = JSON.parse(saved);
                this.userXP = new Map(data.userXP);
                this.contributionHistory = new Map(data.contributionHistory);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to load XP data:', error);
            return false;
        }
    }
    
    /**
     * Export user data for payment processing
     * @param {string} userId - User identifier
     * @returns {Object} Payout data
     */
    generatePayoutData(userId) {
        const userData = this.getUserData(userId);
        
        return {
            userId,
            totalXP: userData.totalXP,
            tokensEarned: parseFloat(userData.tokens),
            usdValue: parseFloat(userData.usdValue),
            level: userData.level,
            contributions: userData.contributionCount,
            generatedAt: new Date().toISOString(),
            payoutReady: userData.totalXP >= 1000 // Minimum 1000 XP to cash out
        };
    }
}

// Create global instance
if (typeof window !== 'undefined') {
    window.XPRewardSystem = XPRewardSystem;
    window.xpRewardSystem = new XPRewardSystem();
    
    // Load existing data
    window.xpRewardSystem.load();
}

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = XPRewardSystem;
}
