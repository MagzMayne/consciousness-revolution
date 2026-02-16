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
 * File: agent-hub-integration.js
 * Declaration ID: IP-793C50BD-MLL28ZUG
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AGENT HUB INTEGRATION SYSTEM
 * BarbrickDesign AgentHub - System Integration Layer
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Integrates the vetting system with contribution and donation tracking.
 * Provides unified API for all agent-related operations.
 * 
 * © 2024-2026 Ryan Barbrick. All Rights Reserved.
 * Contact: BarbrickDesign@gmail.com
 * Creator: Agent R - The Hub Architect
 * ═══════════════════════════════════════════════════════════════════════════
 */

class AgentHubIntegration {
    constructor() {
        this.version = '1.0.0';
        this.creatorSignature = 'BarbrickDesign@gmail.com';
        this.creatorAgent = 'Agent R';
        
        // Initialize subsystems
        this.vettingSystem = null;
        this.contributionSystem = null;
        
        // Storage key
        this.STORAGE_KEY = 'agenthub_integration_v1';
        
        this.initializeSystems();
        
        console.log('🔗 AgentHub Integration System initialized');
        console.log('📧 Creator:', this.creatorSignature);
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // SYSTEM INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════
    
    initializeSystems() {
        try {
            // Initialize vetting system
            if (typeof AgentVettingSystem !== 'undefined') {
                this.vettingSystem = new AgentVettingSystem();
                console.log('✅ Vetting System loaded');
            } else {
                console.warn('⚠️ Vetting System not available');
            }
            
            // Initialize contribution system
            if (typeof ContributionRewardsSystem !== 'undefined') {
                this.contributionSystem = new ContributionRewardsSystem();
                console.log('✅ Contribution System loaded');
            } else {
                console.warn('⚠️ Contribution System not available');
            }
        } catch (error) {
            console.error('Error initializing systems:', error);
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // UNIFIED AGENT OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Register a new agent and create initial profile
     */
    registerAgent(agentData) {
        if (!this.vettingSystem) {
            throw new Error('Vetting system not available');
        }
        
        // Create agent in vetting system
        const agent = this.vettingSystem.registerAgent({
            name: agentData.name,
            email: agentData.email
        });
        
        // Track registration as first contribution
        if (this.contributionSystem) {
            try {
                this.contributionSystem.trackContribution({
                    userId: agent.agentId,
                    type: 'FIRST_CONTRIBUTION',
                    category: 'COMMUNITY',
                    description: 'Agent registration',
                    metadata: {
                        agentName: agent.name,
                        timestamp: new Date().toISOString()
                    }
                });
            } catch (error) {
                console.warn('Could not track registration contribution:', error);
            }
        }
        
        return agent;
    }
    
    /**
     * Log a contribution and update agent value
     */
    logContribution(agentId, contributionData) {
        if (!this.vettingSystem) {
            throw new Error('Vetting system not available');
        }
        
        // Determine contribution value based on type
        let value = 0;
        let rewardType = '';
        
        switch (contributionData.type) {
            case 'code':
                value = 100;
                rewardType = 'DEV_FEATURE';
                break;
            case 'bug_fix':
                value = 50;
                rewardType = 'DEV_BUG_FIX';
                break;
            case 'documentation':
                value = 25;
                rewardType = 'DOC_README_UPDATE';
                break;
            case 'security':
                value = 200;
                rewardType = 'DEV_SECURITY_FIX';
                break;
            case 'knowledgebase':
                value = 20;
                rewardType = 'KB_ARTICLE_ADD';
                break;
            default:
                value = 10;
                rewardType = 'COMMUNITY_HELP';
        }
        
        // Log in vetting system
        const contribution = this.vettingSystem.logContribution(agentId, {
            type: contributionData.type,
            description: contributionData.description,
            value: value,
            verified: contributionData.verified || false
        });
        
        // Award GBUV tokens if contribution system available
        if (this.contributionSystem && rewardType) {
            try {
                this.contributionSystem.trackContribution({
                    userId: agentId,
                    type: rewardType,
                    category: this.getCategoryFromType(contributionData.type),
                    description: contributionData.description,
                    metadata: {
                        timestamp: new Date().toISOString(),
                        contributionId: contribution.id
                    }
                });
            } catch (error) {
                console.warn('Could not award GBUV tokens:', error);
            }
        }
        
        return contribution;
    }
    
    /**
     * Log a donation and update agent value
     */
    logDonation(agentId, donationData) {
        if (!this.vettingSystem) {
            throw new Error('Vetting system not available');
        }
        
        // Log in vetting system
        const donation = this.vettingSystem.logDonation(agentId, {
            amount: donationData.amount,
            currency: donationData.currency || 'USD',
            transactionId: donationData.transactionId || '',
            verified: donationData.verified || false
        });
        
        // Track in contribution system for GBUV rewards
        if (this.contributionSystem) {
            try {
                // Award bonus GBUV tokens based on donation amount
                const bonusTokens = Math.floor(donationData.amount / 10); // 1 GBUV per $10
                
                this.contributionSystem.trackContribution({
                    userId: agentId,
                    type: 'CUSTOM',
                    category: 'COMMUNITY',
                    description: `Financial donation: $${donationData.amount}`,
                    reward: bonusTokens,
                    metadata: {
                        donationId: donation.id,
                        amount: donationData.amount,
                        currency: donationData.currency,
                        timestamp: new Date().toISOString()
                    }
                });
            } catch (error) {
                console.warn('Could not award donation bonus:', error);
            }
        }
        
        return donation;
    }
    
    /**
     * Assess agent skill
     */
    assessSkill(agentId, categoryKey, skillName, proficiencyLevel, evidence = {}) {
        if (!this.vettingSystem) {
            throw new Error('Vetting system not available');
        }
        
        const assessment = this.vettingSystem.assessSkill(
            agentId,
            categoryKey,
            skillName,
            proficiencyLevel,
            evidence
        );
        
        // If skill is verified, award bonus contribution
        if (evidence.verified && this.contributionSystem) {
            try {
                this.contributionSystem.trackContribution({
                    userId: agentId,
                    type: 'KB_CODE_SAMPLE',
                    category: 'KNOWLEDGEBASE',
                    description: `Verified skill: ${skillName}`,
                    metadata: {
                        categoryKey: categoryKey,
                        skillName: skillName,
                        proficiencyLevel: proficiencyLevel,
                        timestamp: new Date().toISOString()
                    }
                });
            } catch (error) {
                console.warn('Could not award skill verification bonus:', error);
            }
        }
        
        return assessment;
    }
    
    /**
     * Get complete agent profile with all data
     */
    getCompleteProfile(agentId) {
        if (!this.vettingSystem) {
            throw new Error('Vetting system not available');
        }
        
        const agent = this.vettingSystem.getAgent(agentId);
        if (!agent) {
            throw new Error('Agent not found');
        }
        
        // Get contribution data
        let contributionData = null;
        if (this.contributionSystem) {
            try {
                contributionData = this.contributionSystem.getUserContributions(agentId);
            } catch (error) {
                console.warn('Could not fetch contribution data:', error);
            }
        }
        
        // Get comparison to Agent R
        const comparison = this.vettingSystem.getAgentComparison(agentId);
        
        return {
            agent: agent,
            contributions: contributionData,
            comparison: comparison,
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Get Agent R's benchmark profile
     */
    getAgentRProfile() {
        if (!this.vettingSystem) {
            throw new Error('Vetting system not available');
        }
        
        return this.vettingSystem.getAgentRProfile();
    }
    
    /**
     * Get leaderboard with all agents
     */
    getLeaderboard(limit = 10) {
        if (!this.vettingSystem) {
            throw new Error('Vetting system not available');
        }
        
        return this.vettingSystem.getLeaderboard(limit);
    }
    
    /**
     * Get all skill categories
     */
    getSkillCategories() {
        if (!this.vettingSystem) {
            throw new Error('Vetting system not available');
        }
        
        return this.vettingSystem.getAllSkillCategories();
    }
    
    /**
     * Search for skills
     */
    searchSkills(query) {
        if (!this.vettingSystem) {
            throw new Error('Vetting system not available');
        }
        
        return this.vettingSystem.searchSkills(query);
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // UTILITY FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════
    
    getCategoryFromType(type) {
        const mapping = {
            'code': 'DEVELOPMENT',
            'bug_fix': 'DEVELOPMENT',
            'documentation': 'DOCUMENTATION',
            'security': 'DEVELOPMENT',
            'knowledgebase': 'KNOWLEDGEBASE',
            'repository': 'REPO_SCAN',
            'community': 'COMMUNITY',
            'ai_training': 'AI_TRAINING'
        };
        
        return mapping[type] || 'COMMUNITY';
    }
    
    /**
     * Export agent profile as JSON
     */
    exportProfile(agentId) {
        const profile = this.getCompleteProfile(agentId);
        return JSON.stringify(profile, null, 2);
    }
    
    /**
     * Get system health status
     */
    getSystemHealth() {
        return {
            vettingSystem: this.vettingSystem ? 'operational' : 'unavailable',
            contributionSystem: this.contributionSystem ? 'operational' : 'unavailable',
            version: this.version,
            creator: this.creatorAgent,
            contact: this.creatorSignature
        };
    }
    
    /**
     * Initialize Agent R's profile if not exists
     */
    ensureAgentRProfile() {
        if (!this.vettingSystem) return;
        
        const agentR = this.vettingSystem.getAgentRProfile();
        console.log('Agent R profile loaded:', agentR.name);
        console.log('Contact:', agentR.email);
        console.log('Clearance Level:', agentR.clearanceLevel);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

if (typeof window !== 'undefined') {
    window.AgentHubIntegration = AgentHubIntegration;
    
    // Auto-initialize on load
    window.addEventListener('DOMContentLoaded', () => {
        if (!window.agentHub) {
            window.agentHub = new AgentHubIntegration();
            window.agentHub.ensureAgentRProfile();
        }
    });
    
    console.log('✅ AgentHub Integration System loaded - Created by Agent R (BarbrickDesign@gmail.com)');
}
