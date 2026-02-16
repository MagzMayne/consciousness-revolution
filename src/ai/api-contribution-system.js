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
 * File: api-contribution-system.js
 * Declaration ID: IP-20E32F02-MLL28ZW1
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
 * API Key Contribution & Reward System
 * Allows users to contribute their API keys to a shared pool and earn rewards
 * Implements fair usage tracking, reward calculation, and contribution management
 * 
 * Features:
 * - Secure API key pooling with user consent
 * - Usage tracking and attribution
 * - Reward calculation based on contribution and usage
 * - Points system with leaderboard
 * - Transparent audit logging
 * - Automatic reward distribution
 * 
 * @version 1.0.0
 * @author BarbrickDesign Platform Team
 */

class APIKeyContributionSystem {
    constructor() {
        this.contributions = new Map(); // Map of contributionId -> contribution details
        this.userContributions = new Map(); // Map of userId -> Set of contributionIds
        this.usageLog = []; // Array of usage records
        this.rewardRates = {
            openai: {
                basePointsPerCall: 1,
                bonusForHighTier: 1.5,
                bonusForPremium: 2.0
            },
            anthropic: {
                basePointsPerCall: 1.2,
                bonusForHighTier: 1.5,
                bonusForPremium: 2.0
            },
            other: {
                basePointsPerCall: 0.5,
                bonusForHighTier: 1.3,
                bonusForPremium: 1.8
            }
        };
        this.initialized = false;
        this.storageKey = 'bcert_api_contributions';
        this.usageLogKey = 'bcert_api_usage_log';
    }

    /**
     * Initialize the system and load saved data
     */
    async initialize() {
        if (this.initialized) return true;

        try {
            // Load contributions from localStorage
            const contributionsData = localStorage.getItem(this.storageKey);
            if (contributionsData) {
                const parsed = JSON.parse(contributionsData);
                this.contributions = new Map(Object.entries(parsed.contributions || {}));
                this.userContributions = new Map(
                    Object.entries(parsed.userContributions || {}).map(([k, v]) => [k, new Set(v)])
                );
            }

            // Load usage log
            const usageData = localStorage.getItem(this.usageLogKey);
            if (usageData) {
                this.usageLog = JSON.parse(usageData);
            }

            this.initialized = true;
            console.log('✅ API Key Contribution System initialized');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize API Key Contribution System:', error);
            return false;
        }
    }

    /**
     * Contribute an API key to the shared pool
     */
    async contributeAPIKey(userId, service, apiKey, options = {}) {
        if (!this.initialized) await this.initialize();

        // Validate inputs
        if (!userId || !service || !apiKey) {
            throw new Error('Missing required parameters: userId, service, apiKey');
        }

        // Create contribution record
        const contributionId = this.generateContributionId();
        const contribution = {
            id: contributionId,
            userId: userId,
            service: service,
            apiKeyHash: this.hashAPIKey(apiKey), // For verification purposes only
            // SECURITY WARNING: In production, API keys MUST be encrypted using proper encryption
            // This demo stores keys for functionality, but real implementation should:
            // 1. Use Web Crypto API (AES-GCM) for encryption
            // 2. Store encrypted keys server-side, not in localStorage
            // 3. Use secure key management service (AWS KMS, Azure Key Vault, etc.)
            // 4. Never expose keys in client-side code
            apiKey: apiKey, // INSECURE - For demo only!
            status: 'active',
            contributedAt: new Date().toISOString(),
            usageCount: 0,
            totalPointsEarned: 0,
            settings: {
                shareWithCommunity: options.shareWithCommunity !== false, // Default true
                maxDailyUsage: options.maxDailyUsage || 1000,
                allowedUsers: options.allowedUsers || 'all', // 'all', 'students', 'premium'
                autoRenew: options.autoRenew !== false
            },
            metadata: {
                tier: options.tier || 'standard', // standard, premium
                rateLimit: options.rateLimit || 60, // requests per minute
                expiresAt: options.expiresAt || null
            }
        };

        // Save contribution
        this.contributions.set(contributionId, contribution);

        // Update user contributions
        if (!this.userContributions.has(userId)) {
            this.userContributions.set(userId, new Set());
        }
        this.userContributions.get(userId).add(contributionId);

        // Persist to storage
        this.saveToStorage();

        // Log the contribution
        this.logEvent({
            type: 'contribution',
            contributionId: contributionId,
            userId: userId,
            service: service,
            timestamp: new Date().toISOString()
        });

        console.log(`✅ API key contributed successfully (ID: ${contributionId})`);
        
        return {
            success: true,
            contributionId: contributionId,
            message: 'API key contributed successfully! You will earn points when others use it.'
        };
    }

    /**
     * Get an API key from the pool for usage
     */
    async getAPIKeyFromPool(service, requesterId, requestContext = {}) {
        if (!this.initialized) await this.initialize();

        // Find available contributions for this service
        const availableContributions = Array.from(this.contributions.values()).filter(c => 
            c.service === service &&
            c.status === 'active' &&
            this.canUseContribution(c, requesterId, requestContext)
        );

        if (availableContributions.length === 0) {
            return {
                success: false,
                message: 'No available API keys in the pool for this service'
            };
        }

        // Select contribution using load balancing
        const selectedContribution = this.selectContribution(availableContributions);

        return {
            success: true,
            contributionId: selectedContribution.id,
            apiKey: selectedContribution.apiKey,
            contributorId: selectedContribution.userId,
            metadata: selectedContribution.metadata
        };
    }

    /**
     * Track API usage and award points
     */
    async trackUsage(contributionId, usageDetails = {}) {
        if (!this.initialized) await this.initialize();

        const contribution = this.contributions.get(contributionId);
        if (!contribution) {
            console.warn('Contribution not found:', contributionId);
            return;
        }

        // Calculate points for this usage
        const points = this.calculatePoints(contribution, usageDetails);

        // Update contribution
        contribution.usageCount++;
        contribution.totalPointsEarned += points;
        this.contributions.set(contributionId, contribution);

        // Log usage
        const usageRecord = {
            id: this.generateUsageId(),
            contributionId: contributionId,
            contributorId: contribution.userId,
            timestamp: new Date().toISOString(),
            pointsAwarded: points,
            details: usageDetails
        };
        this.usageLog.push(usageRecord);

        // Keep usage log manageable (last 10000 records)
        if (this.usageLog.length > 10000) {
            this.usageLog = this.usageLog.slice(-10000);
        }

        // Persist changes
        this.saveToStorage();

        console.log(`💰 ${points} points awarded to contributor ${contribution.userId}`);

        return {
            success: true,
            pointsAwarded: points,
            totalPoints: contribution.totalPointsEarned
        };
    }

    /**
     * Get user's contribution statistics
     */
    getUserStats(userId) {
        if (!this.initialized) {
            console.warn('System not initialized');
            return null;
        }

        const userContributionIds = this.userContributions.get(userId);
        if (!userContributionIds || userContributionIds.size === 0) {
            return {
                totalContributions: 0,
                activeContributions: 0,
                totalUsageCount: 0,
                totalPointsEarned: 0,
                contributionsByService: {},
                recentUsage: []
            };
        }

        const contributions = Array.from(userContributionIds).map(id => 
            this.contributions.get(id)
        ).filter(c => c !== undefined);

        const stats = {
            totalContributions: contributions.length,
            activeContributions: contributions.filter(c => c.status === 'active').length,
            totalUsageCount: contributions.reduce((sum, c) => sum + c.usageCount, 0),
            totalPointsEarned: contributions.reduce((sum, c) => sum + c.totalPointsEarned, 0),
            contributionsByService: {},
            recentUsage: []
        };

        // Group by service
        for (const contribution of contributions) {
            if (!stats.contributionsByService[contribution.service]) {
                stats.contributionsByService[contribution.service] = {
                    count: 0,
                    usageCount: 0,
                    points: 0
                };
            }
            stats.contributionsByService[contribution.service].count++;
            stats.contributionsByService[contribution.service].usageCount += contribution.usageCount;
            stats.contributionsByService[contribution.service].points += contribution.totalPointsEarned;
        }

        // Get recent usage for this user's contributions
        stats.recentUsage = this.usageLog
            .filter(log => log.contributorId === userId)
            .slice(-20)
            .reverse();

        return stats;
    }

    /**
     * Get leaderboard of top contributors
     */
    getLeaderboard(limit = 10) {
        if (!this.initialized) {
            console.warn('System not initialized');
            return [];
        }

        // Aggregate points by user
        const userPoints = new Map();
        
        for (const [userId, contributionIds] of this.userContributions.entries()) {
            let totalPoints = 0;
            let totalUsage = 0;
            let activeCount = 0;

            for (const contributionId of contributionIds) {
                const contribution = this.contributions.get(contributionId);
                if (contribution) {
                    totalPoints += contribution.totalPointsEarned;
                    totalUsage += contribution.usageCount;
                    if (contribution.status === 'active') activeCount++;
                }
            }

            userPoints.set(userId, {
                userId: userId,
                totalPoints: totalPoints,
                totalUsage: totalUsage,
                activeContributions: activeCount
            });
        }

        // Sort by points and return top N
        return Array.from(userPoints.values())
            .sort((a, b) => b.totalPoints - a.totalPoints)
            .slice(0, limit);
    }

    /**
     * Withdraw/deactivate a contribution
     */
    async withdrawContribution(contributionId, userId) {
        if (!this.initialized) await this.initialize();

        const contribution = this.contributions.get(contributionId);
        
        if (!contribution) {
            throw new Error('Contribution not found');
        }

        if (contribution.userId !== userId) {
            throw new Error('Unauthorized: You can only withdraw your own contributions');
        }

        contribution.status = 'withdrawn';
        contribution.withdrawnAt = new Date().toISOString();
        this.contributions.set(contributionId, contribution);

        this.saveToStorage();

        this.logEvent({
            type: 'withdrawal',
            contributionId: contributionId,
            userId: userId,
            timestamp: new Date().toISOString()
        });

        return {
            success: true,
            message: 'Contribution withdrawn successfully',
            finalStats: {
                usageCount: contribution.usageCount,
                totalPointsEarned: contribution.totalPointsEarned
            }
        };
    }

    /**
     * Helper: Check if a contribution can be used
     */
    canUseContribution(contribution, requesterId, context) {
        // Check if contribution is active
        if (contribution.status !== 'active') return false;

        // Check if expired
        if (contribution.metadata.expiresAt) {
            if (new Date(contribution.metadata.expiresAt) < new Date()) {
                return false;
            }
        }

        // Check user access level
        const allowedUsers = contribution.settings.allowedUsers;
        if (allowedUsers === 'students' && !context.isStudent) return false;
        if (allowedUsers === 'premium' && !context.isPremium) return false;

        // Check daily usage limit
        const today = new Date().toISOString().split('T')[0];
        const todayUsage = this.usageLog.filter(log => 
            log.contributionId === contribution.id &&
            log.timestamp.startsWith(today)
        ).length;

        if (todayUsage >= contribution.settings.maxDailyUsage) {
            return false;
        }

        return true;
    }

    /**
     * Helper: Select best contribution using load balancing
     */
    selectContribution(contributions) {
        // Simple round-robin based on usage count
        // Less used contributions get priority
        return contributions.reduce((prev, curr) => 
            (prev.usageCount < curr.usageCount) ? prev : curr
        );
    }

    /**
     * Helper: Calculate points for usage
     */
    calculatePoints(contribution, usageDetails) {
        const rateConfig = this.rewardRates[contribution.service] || this.rewardRates.other;
        let points = rateConfig.basePointsPerCall;

        // Apply tier bonus
        if (contribution.metadata.tier === 'premium') {
            points *= rateConfig.bonusForPremium;
        }

        // Apply usage complexity bonus
        if (usageDetails.complexity === 'high') {
            points *= 1.5;
        }

        // Apply success bonus
        if (usageDetails.success !== false) {
            points *= 1.1;
        }

        return Math.round(points * 100) / 100; // Round to 2 decimals
    }

    /**
     * Helper: Generate unique contribution ID
     */
    generateContributionId() {
        return 'contrib_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
    }

    /**
     * Helper: Generate unique usage ID
     */
    generateUsageId() {
        return 'usage_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    }

    /**
     * Helper: Hash API key for verification (simple demo hash - NOT cryptographically secure)
     * In production, use proper crypto hashing like SHA-256 via Web Crypto API
     */
    hashAPIKey(apiKey) {
        // WARNING: This is a simple demo hash, NOT suitable for security purposes
        // In production, use: crypto.subtle.digest('SHA-256', new TextEncoder().encode(apiKey))
        let hash = 0;
        for (let i = 0; i < apiKey.length; i++) {
            const char = apiKey.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return 'hash_' + Math.abs(hash).toString(36);
    }

    /**
     * Helper: Save to localStorage
     */
    saveToStorage() {
        try {
            const contributionsData = {
                contributions: Object.fromEntries(this.contributions),
                userContributions: Object.fromEntries(
                    Array.from(this.userContributions.entries()).map(([k, v]) => [k, Array.from(v)])
                )
            };
            localStorage.setItem(this.storageKey, JSON.stringify(contributionsData));
            localStorage.setItem(this.usageLogKey, JSON.stringify(this.usageLog.slice(-1000)));
        } catch (error) {
            console.error('Failed to save to storage:', error);
        }
    }

    /**
     * Helper: Log events
     */
    logEvent(event) {
        const auditLog = JSON.parse(localStorage.getItem('bcert_contribution_audit_log') || '[]');
        auditLog.push(event);
        
        // Keep last 1000 events
        if (auditLog.length > 1000) {
            auditLog.splice(0, auditLog.length - 1000);
        }
        
        localStorage.setItem('bcert_contribution_audit_log', JSON.stringify(auditLog));
    }

    /**
     * Get system statistics
     */
    getSystemStats() {
        return {
            totalContributions: this.contributions.size,
            activeContributions: Array.from(this.contributions.values()).filter(c => c.status === 'active').length,
            totalContributors: this.userContributions.size,
            totalUsageRecords: this.usageLog.length,
            totalPointsDistributed: Array.from(this.contributions.values()).reduce(
                (sum, c) => sum + c.totalPointsEarned, 0
            ),
            serviceBreakdown: this.getServiceBreakdown()
        };
    }

    /**
     * Get breakdown by service
     */
    getServiceBreakdown() {
        const breakdown = {};
        
        for (const contribution of this.contributions.values()) {
            if (!breakdown[contribution.service]) {
                breakdown[contribution.service] = {
                    contributions: 0,
                    usageCount: 0,
                    pointsEarned: 0
                };
            }
            breakdown[contribution.service].contributions++;
            breakdown[contribution.service].usageCount += contribution.usageCount;
            breakdown[contribution.service].pointsEarned += contribution.totalPointsEarned;
        }

        return breakdown;
    }
}

// Create and export global instance
if (typeof window !== 'undefined') {
    window.APIKeyContributionSystem = APIKeyContributionSystem;
    window.apiContributionSystem = new APIKeyContributionSystem();
    
    // Auto-initialize on load
    if (document.readyState === 'complete') {
        window.apiContributionSystem.initialize();
    } else {
        window.addEventListener('load', () => {
            window.apiContributionSystem.initialize();
        });
    }
    
    console.log('💰 API Key Contribution System loaded');
    console.log('💡 Type apiContributionSystem.getSystemStats() to see contribution statistics');
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIKeyContributionSystem;
}
