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
 * File: contributor-grant-system.js
 * Declaration ID: IP-FE65EFB-MLL28ZUP
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Contributor Grant System
 * Manages donation-based contributors who can participate in government grants
 * and receive revenue sharing from successful grant funding
 * 
 * @author BarbrickDesign
 * @date 2026-01-20
 */

const ContributorGrantSystem = (function() {
    'use strict';

    // Configuration
    const CONFIG = {
        storageKey: 'barbrick_contributors',
        grantKey: 'barbrick_grant_applications',
        revenueKey: 'barbrick_revenue_sharing',
        paypalEmail: 'BarbrickDesign@gmail.com',
        tiers: {
            bronze: {
                name: 'Bronze Contributor',
                donation: 50,
                revenueShare: 10,
                features: ['Project listing', 'Basic profile', 'Grant application access'],
                badge: '🥉'
            },
            silver: {
                name: 'Silver Contributor',
                donation: 200,
                revenueShare: 12,
                features: ['All Bronze features', 'Priority listing', 'Enhanced profile', 'Proposal review access'],
                badge: '🥈'
            },
            gold: {
                name: 'Gold Contributor',
                donation: 500,
                revenueShare: 15,
                features: ['All Silver features', 'Featured profile', 'Direct collaboration', 'Monthly consultations'],
                badge: '🥇'
            },
            platinum: {
                name: 'Platinum Contributor',
                donation: 1500,
                revenueShare: 20,
                features: ['All Gold features', 'Co-lead projects', '24/7 support', 'Custom project opportunities'],
                badge: '⭐'
            },
            diamond: {
                name: 'Diamond Contributor',
                donation: 3500,
                revenueShare: 25,
                features: ['All Platinum features', 'AI-powered grant matching', 'Automated application generation', 'Multi-project lead', 'Dedicated account manager', 'Advanced analytics dashboard'],
                badge: '💎',
                automationLevel: 'advanced',
                aiFeatures: ['grant_matching', 'auto_applications', 'predictive_analytics']
            },
            enterprise: {
                name: 'Enterprise Contributor',
                donation: 7500,
                revenueShare: 30,
                features: ['All Diamond features', 'Unlimited AI automation', 'Account stacking (up to 10)', 'White-glove service', 'Custom AI models', 'Priority grant queue', 'Revenue optimization AI'],
                badge: '🏢',
                automationLevel: 'maximum',
                aiFeatures: ['grant_matching', 'auto_applications', 'predictive_analytics', 'account_stacking', 'revenue_optimization', 'custom_ai_models'],
                maxAccounts: 10
            },
            ultimate: {
                name: 'Ultimate Contributor',
                donation: 15000,
                revenueShare: 35,
                features: ['All Enterprise features', 'Unlimited account stacking', 'Full automation suite', 'AI grant writing', 'Personalized AI assistant', 'VIP networking events', 'First access to new grants', 'Revenue sharing on all projects'],
                badge: '👑',
                automationLevel: 'ultimate',
                aiFeatures: ['grant_matching', 'auto_applications', 'predictive_analytics', 'account_stacking', 'revenue_optimization', 'custom_ai_models', 'ai_grant_writing', 'personal_ai_assistant'],
                maxAccounts: -1, // unlimited
                vipAccess: true
            }
        }
    };

    /**
     * Initialize contributor profile
     */
    function initializeProfile(donorData) {
        const contributors = getContributors();
        const contributorId = generateContributorId();
        
        // Check if this is a founder
        const isFounder = checkFounderStatus(donorData.email, donorData.name);
        
        const profile = {
            id: contributorId,
            name: donorData.name || '',
            email: donorData.email || '',
            studentId: donorData.studentId || null,
            tier: isFounder ? 'founder' : determineTier(donorData.donationAmount),
            donationAmount: donorData.donationAmount || 0,
            donationDate: Date.now(),
            revenueShare: isFounder ? 100 : CONFIG.tiers[determineTier(donorData.donationAmount)].revenueShare,
            status: 'active',
            isFounder: isFounder,
            founderBadge: isFounder ? '👑' : null,
            founderTitle: isFounder ? 'Original Founder' : null,
            contributions: [],
            projects: [],
            totalEarnings: 0,
            grantApplications: [],
            skills: donorData.skills || [],
            bio: donorData.bio || '',
            githubUsername: donorData.githubUsername || '',
            portfolioUrl: donorData.portfolioUrl || '',
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        contributors[contributorId] = profile;
        saveContributors(contributors);
        
        return profile;
    }

    /**
     * Check if user is an original founder
     * Founders are permanently recognized and cannot be overridden
     */
    function checkFounderStatus(email, name) {
        const founders = [
            {
                email: 'BarbrickDesign@gmail.com',
                name: 'Ryan Barbrick',
                aliases: ['Ryan Barbrick', 'Barbrick', 'Barbrick Design']
            },
            {
                name: 'Merlin AI',
                aliases: ['Merlin AI', 'Merlin', 'Merlin Hive']
            }
        ];

        return founders.some(founder => {
            // Check email match (if provided)
            if (founder.email && email && founder.email.toLowerCase() === email.toLowerCase()) {
                return true;
            }
            // Check name match
            if (name && founder.aliases.some(alias => 
                alias.toLowerCase() === name.toLowerCase()
            )) {
                return true;
            }
            return false;
        });
    }

    /**
     * Generate unique contributor ID
     */
    function generateContributorId() {
        return 'CONTRIB-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Determine contributor tier based on donation amount
     */
    function determineTier(amount) {
        if (amount >= 15000) return 'ultimate';
        if (amount >= 7500) return 'enterprise';
        if (amount >= 3500) return 'diamond';
        if (amount >= 1500) return 'platinum';
        if (amount >= 500) return 'gold';
        if (amount >= 200) return 'silver';
        if (amount >= 50) return 'bronze';
        return null;
    }

    /**
     * Add contribution to contributor profile
     */
    function addContribution(contributorId, contributionData) {
        const contributors = getContributors();
        const contributor = contributors[contributorId];
        
        if (!contributor) {
            throw new Error('Contributor not found');
        }

        const contribution = {
            id: 'CONTRIB-' + Date.now(),
            projectId: contributionData.projectId,
            projectName: contributionData.projectName,
            type: contributionData.type, // 'development', 'research', 'documentation', 'testing'
            hours: contributionData.hours || 0,
            description: contributionData.description || '',
            timestamp: Date.now(),
            status: 'completed'
        };

        contributor.contributions.push(contribution);
        contributor.updatedAt = Date.now();
        
        // Add project to contributor's project list if not already there
        if (!contributor.projects.includes(contributionData.projectId)) {
            contributor.projects.push(contributionData.projectId);
        }

        saveContributors(contributors);
        return contribution;
    }

    /**
     * Link contributor to grant application
     */
    function linkToGrantApplication(contributorId, grantData) {
        const contributors = getContributors();
        const contributor = contributors[contributorId];
        
        if (!contributor) {
            throw new Error('Contributor not found');
        }

        const grantLink = {
            grantId: grantData.grantId,
            grantName: grantData.grantName,
            grantAgency: grantData.grantAgency,
            projectIds: grantData.projectIds || [],
            role: grantData.role || 'Team Member',
            appliedDate: Date.now(),
            status: 'pending', // 'pending', 'approved', 'rejected', 'funded'
            fundingAmount: grantData.fundingAmount || 0,
            revenueShareAmount: 0,
            paidOut: false
        };

        contributor.grantApplications.push(grantLink);
        contributor.updatedAt = Date.now();
        
        saveContributors(contributors);
        return grantLink;
    }

    /**
     * Process grant success and calculate revenue sharing
     */
    function processGrantSuccess(grantId, fundingAmount) {
        const contributors = getContributors();
        const revenueRecords = getRevenueRecords();
        
        let totalDistributed = 0;
        const distributions = [];

        // Find all contributors linked to this grant
        Object.values(contributors).forEach(contributor => {
            const grantApp = contributor.grantApplications.find(app => app.grantId === grantId);
            
            if (grantApp && grantApp.status === 'pending') {
                // Calculate revenue share
                const sharePercentage = contributor.revenueShare / 100;
                const shareAmount = fundingAmount * sharePercentage;
                
                // Update grant application
                grantApp.status = 'funded';
                grantApp.revenueShareAmount = shareAmount;
                
                // Update contributor earnings
                contributor.totalEarnings += shareAmount;
                contributor.updatedAt = Date.now();
                
                totalDistributed += shareAmount;
                
                // Create distribution record
                distributions.push({
                    contributorId: contributor.id,
                    contributorName: contributor.name,
                    grantId: grantId,
                    sharePercentage: contributor.revenueShare,
                    shareAmount: shareAmount,
                    timestamp: Date.now(),
                    paymentStatus: 'pending'
                });
            }
        });

        // Save updated data
        saveContributors(contributors);
        
        // Save revenue distribution record
        revenueRecords[grantId] = {
            grantId: grantId,
            fundingAmount: fundingAmount,
            totalDistributed: totalDistributed,
            distributions: distributions,
            processedDate: Date.now()
        };
        saveRevenueRecords(revenueRecords);
        
        return {
            success: true,
            totalDistributed: totalDistributed,
            contributorCount: distributions.length,
            distributions: distributions
        };
    }

    /**
     * Get contributor team members for grant application
     */
    function getGrantTeamMembers(projectIds) {
        const contributors = getContributors();
        const teamMembers = [];

        Object.values(contributors).forEach(contributor => {
            // Check if contributor has worked on any of the projects
            const hasWorked = projectIds.some(projectId => 
                contributor.projects.includes(projectId)
            );
            
            if (hasWorked && contributor.status === 'active') {
                teamMembers.push({
                    id: contributor.id,
                    name: contributor.name,
                    tier: contributor.tier,
                    badge: CONFIG.tiers[contributor.tier].badge,
                    skills: contributor.skills,
                    contributions: contributor.contributions.filter(c => 
                        projectIds.includes(c.projectId)
                    ),
                    revenueShare: contributor.revenueShare,
                    githubUsername: contributor.githubUsername,
                    portfolioUrl: contributor.portfolioUrl
                });
            }
        });

        // Sort by tier (platinum first)
        const tierOrder = ['platinum', 'gold', 'silver', 'bronze'];
        teamMembers.sort((a, b) => {
            return tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier);
        });

        return teamMembers;
    }

    /**
     * Generate grant application team section
     */
    function generateGrantTeamSection(projectIds) {
        const teamMembers = getGrantTeamMembers(projectIds);
        
        let teamSection = '## Team Qualifications\n\n';
        teamSection += `Our project team consists of ${teamMembers.length} qualified contributors:\n\n`;
        
        teamMembers.forEach((member, index) => {
            const tierName = CONFIG.tiers[member.tier].name;
            teamSection += `### ${index + 1}. ${member.name} (${tierName} ${member.badge})\n\n`;
            
            if (member.skills.length > 0) {
                teamSection += `**Skills:** ${member.skills.join(', ')}\n\n`;
            }
            
            if (member.contributions.length > 0) {
                const totalHours = member.contributions.reduce((sum, c) => sum + (c.hours || 0), 0);
                teamSection += `**Contributions:** ${member.contributions.length} contributions, ${totalHours} hours\n\n`;
            }
            
            if (member.githubUsername) {
                teamSection += `**GitHub:** @${member.githubUsername}\n\n`;
            }
            
            teamSection += `**Revenue Share:** ${member.revenueShare}% of grant funding\n\n`;
            teamSection += '---\n\n';
        });
        
        return teamSection;
    }

    /**
     * Get contributor statistics
     */
    function getContributorStats() {
        const contributors = getContributors();
        const contributorList = Object.values(contributors);
        
        const stats = {
            total: contributorList.length,
            active: contributorList.filter(c => c.status === 'active').length,
            byTier: {
                bronze: contributorList.filter(c => c.tier === 'bronze').length,
                silver: contributorList.filter(c => c.tier === 'silver').length,
                gold: contributorList.filter(c => c.tier === 'gold').length,
                platinum: contributorList.filter(c => c.tier === 'platinum').length
            },
            totalDonations: contributorList.reduce((sum, c) => sum + c.donationAmount, 0),
            totalEarnings: contributorList.reduce((sum, c) => sum + c.totalEarnings, 0),
            totalContributions: contributorList.reduce((sum, c) => sum + c.contributions.length, 0),
            grantApplications: contributorList.reduce((sum, c) => sum + c.grantApplications.length, 0),
            fundedGrants: contributorList.reduce((sum, c) => 
                sum + c.grantApplications.filter(g => g.status === 'funded').length, 0
            )
        };
        
        return stats;
    }

    /**
     * Get contributor leaderboard
     */
    function getLeaderboard(limit = 10) {
        const contributors = getContributors();
        const contributorList = Object.values(contributors);
        
        // Sort by total earnings
        contributorList.sort((a, b) => b.totalEarnings - a.totalEarnings);
        
        return contributorList.slice(0, limit).map((c, index) => ({
            rank: index + 1,
            id: c.id,
            name: c.name,
            tier: c.tier,
            badge: CONFIG.tiers[c.tier].badge,
            totalEarnings: c.totalEarnings,
            contributions: c.contributions.length,
            projects: c.projects.length,
            revenueShare: c.revenueShare
        }));
    }

    /**
     * Storage functions
     */
    function getContributors() {
        try {
            return JSON.parse(localStorage.getItem(CONFIG.storageKey)) || {};
        } catch (e) {
            console.error('Error loading contributors:', e);
            return {};
        }
    }

    function saveContributors(contributors) {
        try {
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(contributors));
            return true;
        } catch (e) {
            console.error('Error saving contributors:', e);
            return false;
        }
    }

    function getRevenueRecords() {
        try {
            return JSON.parse(localStorage.getItem(CONFIG.revenueKey)) || {};
        } catch (e) {
            console.error('Error loading revenue records:', e);
            return {};
        }
    }

    function saveRevenueRecords(records) {
        try {
            localStorage.setItem(CONFIG.revenueKey, JSON.stringify(records));
            return true;
        } catch (e) {
            console.error('Error saving revenue records:', e);
            return false;
        }
    }

    /**
     * Get contributor by ID
     */
    function getContributor(contributorId) {
        const contributors = getContributors();
        return contributors[contributorId] || null;
    }

    /**
     * Get contributor by email
     */
    function getContributorByEmail(email) {
        const contributors = getContributors();
        return Object.values(contributors).find(c => c.email === email) || null;
    }

    // Public API
    return {
        CONFIG,
        initializeProfile,
        addContribution,
        linkToGrantApplication,
        processGrantSuccess,
        getGrantTeamMembers,
        generateGrantTeamSection,
        getContributorStats,
        getLeaderboard,
        getContributor,
        getContributorByEmail,
        getContributors,
        determineTier
    };
})();

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.ContributorGrantSystem = ContributorGrantSystem;
}

console.log('[ContributorGrantSystem] Module loaded successfully');
