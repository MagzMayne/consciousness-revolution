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
 * File: project-investment-system.js
 * Declaration ID: IP-31D8BADE-MLL28ZVM
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GEMBOT PROJECT INVESTMENT SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════
 * Connects Merlin Gallery to game economy with real GBUV transactions
 * Players invest in projects using their in-game currency for:
 * - Governance voting rights
 * - ROI profit sharing
 * - NFT investor badges
 * - Achievement unlocks
 * - XP and level rewards
 * ═══════════════════════════════════════════════════════════════════════════
 */

class ProjectInvestmentSystem {
    constructor() {
        this.GOVERNANCE_TOKEN_MINT = 'DPHcbu7wJEbcrnCYjXC8vHBkM39kT9xZg4mYayvrpump';
        this.PROJECT_VAULT = '6HTjfgWZYMbENnMAJJFhxWR2VZDxdze3qV7zznSAsfk'; // Master vault
        
        // Investment tiers with rewards
        this.INVESTMENT_TIERS = {
            bronze: { min: 100, xpBonus: 50, badge: 'bronze_investor', votePower: 1 },
            silver: { min: 500, xpBonus: 300, badge: 'silver_investor', votePower: 3 },
            gold: { min: 1000, xpBonus: 750, badge: 'gold_investor', votePower: 5 },
            platinum: { min: 5000, xpBonus: 5000, badge: 'platinum_investor', votePower: 10 },
            diamond: { min: 10000, xpBonus: 15000, badge: 'diamond_investor', votePower: 20 }
        };
        
        // ROI tracking
        this.ROI_PERCENTAGE = 0.05; // 5% quarterly returns
        this.LAST_DISTRIBUTION = Date.now();
        this.DISTRIBUTION_INTERVAL = 90 * 24 * 60 * 60 * 1000; // 90 days
        
        console.log('💎 Project Investment System initialized');
    }
    
    /**
     * Get user's total investment portfolio
     */
    getPortfolio(username) {
        const investments = JSON.parse(localStorage.getItem(`investments_${username}`) || '{}');
        let total = 0;
        let projectCount = 0;
        let votingPower = 0;
        
        for (const [project, data] of Object.entries(investments)) {
            total += data.invested || 0;
            projectCount++;
            votingPower += this.calculateVotePower(data.invested);
        }
        
        return {
            totalInvested: total,
            projectCount,
            votingPower,
            tier: this.getTier(total),
            investments
        };
    }
    
    /**
     * Calculate voting power based on investment
     */
    calculateVotePower(amount) {
        for (const [tier, data] of Object.entries(this.INVESTMENT_TIERS).reverse()) {
            if (amount >= data.min) return data.votePower;
        }
        return 0;
    }
    
    /**
     * Get investor tier
     */
    getTier(totalInvested) {
        for (const [tier, data] of Object.entries(this.INVESTMENT_TIERS).reverse()) {
            if (totalInvested >= data.min) return tier;
        }
        return 'none';
    }
    
    /**
     * Invest GBUV in a project (with blockchain transaction)
     */
    async investInProject(projectPath, amount, username) {
        try {
            console.log(`💰 Investing ${amount} GBUV in ${projectPath}...`);
            
            // Validate amount
            if (amount <= 0) {
                throw new Error('Investment amount must be positive');
            }
            
            // Check user's GBUV balance
            const userWallet = await window.walletFactory.getUserWallet(username);
            if (!userWallet) {
                throw new Error('No wallet found for user');
            }
            
            const balance = await window.walletFactory.getGBUVBalance(userWallet.publicKey);
            if (balance < amount) {
                throw new Error(`Insufficient GBUV balance. Have: ${balance}, Need: ${amount}`);
            }
            
            // Execute blockchain transaction
            const txSignature = await window.walletFactory.transferGBUV(
                userWallet.publicKey,
                this.PROJECT_VAULT,
                amount
            );
            
            // Record investment locally
            const investments = JSON.parse(localStorage.getItem(`investments_${username}`) || '{}');
            if (!investments[projectPath]) {
                investments[projectPath] = {
                    invested: 0,
                    transactions: [],
                    firstInvestment: Date.now(),
                    dividendsEarned: 0
                };
            }
            
            investments[projectPath].invested += amount;
            investments[projectPath].transactions.push({
                amount,
                timestamp: Date.now(),
                txSignature,
                type: 'investment'
            });
            
            localStorage.setItem(`investments_${username}`, JSON.stringify(investments));
            
            // Award XP and achievements
            const rewards = await this.processInvestmentRewards(username, amount, projectPath);
            
            // Log to activity feed
            if (window.liveActivityFeed) {
                window.liveActivityFeed.addActivity({
                    type: 'investment',
                    message: `Invested ${amount} GBUV in ${projectPath}`,
                    timestamp: Date.now(),
                    data: { amount, projectPath, txSignature, rewards }
                });
            }
            
            return {
                success: true,
                txSignature,
                newBalance: balance - amount,
                rewards,
                portfolio: this.getPortfolio(username)
            };
            
        } catch (error) {
            console.error('❌ Investment failed:', error);
            
            if (window.liveActivityFeed) {
                window.liveActivityFeed.addActivity({
                    type: 'error',
                    message: `Investment failed: ${error.message}`,
                    timestamp: Date.now()
                });
            }
            
            throw error;
        }
    }
    
    /**
     * Process rewards for investment
     */
    async processInvestmentRewards(username, amount, projectPath) {
        const rewards = {
            xp: 0,
            badges: [],
            achievements: [],
            bonusGems: 0
        };
        
        // Calculate tier and XP bonus
        const portfolio = this.getPortfolio(username);
        const tier = portfolio.tier;
        
        if (tier !== 'none') {
            const tierData = this.INVESTMENT_TIERS[tier];
            rewards.xp = tierData.xpBonus;
            rewards.badges.push(tierData.badge);
        }
        
        // Base XP for any investment
        rewards.xp += Math.floor(amount / 10); // 1 XP per 10 GBUV
        
        // Bonus gems for large investments
        if (amount >= 1000) {
            rewards.bonusGems = Math.floor(amount / 100); // 1 gem per 100 GBUV
        }
        
        // Grant rewards to game
        if (window.gemBotGame) {
            window.gemBotGame.state.player.xp += rewards.xp;
            window.gemBotGame.state.player.gems += rewards.bonusGems;
            window.gemBotGame.checkLevelUp();
            
            // Save game state
            window.gemBotGame.saveGame();
        }
        
        // Achievement checks
        if (portfolio.projectCount >= 5) {
            rewards.achievements.push('diversified_investor');
        }
        if (portfolio.totalInvested >= 10000) {
            rewards.achievements.push('whale_investor');
        }
        if (amount >= 5000) {
            rewards.achievements.push('big_spender');
        }
        
        // Store badges
        const userBadges = JSON.parse(localStorage.getItem(`badges_${username}`) || '[]');
        for (const badge of rewards.badges) {
            if (!userBadges.includes(badge)) {
                userBadges.push(badge);
            }
        }
        localStorage.setItem(`badges_${username}`, JSON.stringify(userBadges));
        
        return rewards;
    }
    
    /**
     * Calculate and distribute ROI dividends
     */
    async distributeDividends(username) {
        const portfolio = this.getPortfolio(username);
        const timeSinceLastDist = Date.now() - this.LAST_DISTRIBUTION;
        
        // Check if distribution period elapsed
        if (timeSinceLastDist < this.DISTRIBUTION_INTERVAL) {
            return {
                success: false,
                message: 'Distribution period not reached',
                nextDistribution: new Date(this.LAST_DISTRIBUTION + this.DISTRIBUTION_INTERVAL)
            };
        }
        
        // Calculate ROI
        const dividend = Math.floor(portfolio.totalInvested * this.ROI_PERCENTAGE);
        
        if (dividend <= 0) {
            return {
                success: false,
                message: 'No investments to distribute dividends'
            };
        }
        
        // Credit dividend to user's wallet
        const userWallet = await window.walletFactory.getUserWallet(username);
        // In production, this would be a blockchain transaction from vault
        // For now, we'll credit to game balance
        if (window.gemBotGame) {
            window.gemBotGame.state.player.tokens += dividend;
            window.gemBotGame.saveGame();
        }
        
        // Update last distribution time
        this.LAST_DISTRIBUTION = Date.now();
        
        // Log to activity feed
        if (window.liveActivityFeed) {
            window.liveActivityFeed.addActivity({
                type: 'dividend',
                message: `Received ${dividend} GBUV dividend (${this.ROI_PERCENTAGE * 100}% ROI)`,
                timestamp: Date.now(),
                data: { amount: dividend, portfolioValue: portfolio.totalInvested }
            });
        }
        
        return {
            success: true,
            amount: dividend,
            nextDistribution: new Date(this.LAST_DISTRIBUTION + this.DISTRIBUTION_INTERVAL),
            portfolioValue: portfolio.totalInvested
        };
    }
    
    /**
     * Get project funding status
     */
    getProjectStatus(projectPath) {
        const allInvestments = {};
        
        // Aggregate all user investments for this project
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('investments_')) {
                const username = key.replace('investments_', '');
                const userInvestments = JSON.parse(localStorage.getItem(key) || '{}');
                if (userInvestments[projectPath]) {
                    allInvestments[username] = userInvestments[projectPath];
                }
            }
        }
        
        let totalInvested = 0;
        let investorCount = 0;
        
        for (const data of Object.values(allInvestments)) {
            totalInvested += data.invested || 0;
            investorCount++;
        }
        
        return {
            totalInvested,
            investorCount,
            investors: allInvestments
        };
    }
    
    /**
     * Create governance proposal (token-gated)
     */
    async createProposal(username, title, description, projectPath) {
        // Check if user holds governance token
        const userWallet = await window.walletFactory.getUserWallet(username);
        const hasToken = await this.checkGovernanceToken(userWallet.publicKey);
        
        if (!hasToken) {
            throw new Error('Governance token required to create proposals');
        }
        
        // Check voting power
        const portfolio = this.getPortfolio(username);
        if (portfolio.votingPower < 5) {
            throw new Error('Minimum voting power of 5 required (Gold tier)');
        }
        
        const proposals = JSON.parse(localStorage.getItem('governance_proposals') || '[]');
        const proposal = {
            id: Date.now().toString(),
            title,
            description,
            projectPath,
            creator: username,
            createdAt: Date.now(),
            votes: { yes: 0, no: 0, abstain: 0 },
            voters: {},
            status: 'active',
            expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
        };
        
        proposals.push(proposal);
        localStorage.setItem('governance_proposals', JSON.stringify(proposals));
        
        if (window.liveActivityFeed) {
            window.liveActivityFeed.addActivity({
                type: 'governance',
                message: `New proposal: ${title}`,
                timestamp: Date.now(),
                data: proposal
            });
        }
        
        return proposal;
    }
    
    /**
     * Vote on governance proposal
     */
    async voteOnProposal(username, proposalId, vote) {
        const portfolio = this.getPortfolio(username);
        if (portfolio.votingPower === 0) {
            throw new Error('No voting power - make investments to gain voting rights');
        }
        
        const proposals = JSON.parse(localStorage.getItem('governance_proposals') || '[]');
        const proposal = proposals.find(p => p.id === proposalId);
        
        if (!proposal) {
            throw new Error('Proposal not found');
        }
        
        if (proposal.status !== 'active') {
            throw new Error('Proposal is not active');
        }
        
        if (Date.now() > proposal.expiresAt) {
            proposal.status = 'expired';
            throw new Error('Proposal has expired');
        }
        
        // Record vote (weighted by voting power)
        const votePower = portfolio.votingPower;
        proposal.votes[vote] += votePower;
        proposal.voters[username] = { vote, power: votePower, timestamp: Date.now() };
        
        localStorage.setItem('governance_proposals', JSON.stringify(proposals));
        
        if (window.liveActivityFeed) {
            window.liveActivityFeed.addActivity({
                type: 'governance',
                message: `Voted ${vote} on "${proposal.title}" (${votePower} power)`,
                timestamp: Date.now()
            });
        }
        
        return proposal;
    }
    
    /**
     * Check if wallet holds governance token
     */
    async checkGovernanceToken(publicKey) {
        try {
            if (!window.walletFactory || !window.walletFactory.connection) {
                return false;
            }
            
            const tokenProgramId = new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
            const accounts = await window.walletFactory.connection.getParsedTokenAccountsByOwner(
                new solanaWeb3.PublicKey(publicKey),
                { programId: tokenProgramId }
            );
            
            for (const { account } of accounts.value) {
                const info = account.data.parsed.info;
                if (info.mint === this.GOVERNANCE_TOKEN_MINT) {
                    const amount = parseFloat(info.tokenAmount.uiAmountString || '0');
                    return amount > 0;
                }
            }
            
            return false;
        } catch (error) {
            console.error('Error checking governance token:', error);
            return false;
        }
    }
    
    /**
     * Get investment leaderboard
     */
    getLeaderboard(limit = 10) {
        const leaderboard = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('investments_')) {
                const username = key.replace('investments_', '');
                const portfolio = this.getPortfolio(username);
                
                leaderboard.push({
                    username,
                    totalInvested: portfolio.totalInvested,
                    projectCount: portfolio.projectCount,
                    tier: portfolio.tier,
                    votingPower: portfolio.votingPower
                });
            }
        }
        
        // Sort by total invested
        leaderboard.sort((a, b) => b.totalInvested - a.totalInvested);
        
        return leaderboard.slice(0, limit);
    }
    
    /**
     * Generate investment report for user
     */
    generateReport(username) {
        const portfolio = this.getPortfolio(username);
        const badges = JSON.parse(localStorage.getItem(`badges_${username}`) || '[]');
        
        const report = {
            username,
            portfolio,
            badges,
            tier: portfolio.tier,
            performance: {
                roi: this.ROI_PERCENTAGE * 100,
                estimatedQuarterlyReturn: Math.floor(portfolio.totalInvested * this.ROI_PERCENTAGE),
                projectedAnnualReturn: Math.floor(portfolio.totalInvested * this.ROI_PERCENTAGE * 4)
            },
            ranking: 0
        };
        
        // Calculate ranking
        const leaderboard = this.getLeaderboard(999);
        report.ranking = leaderboard.findIndex(entry => entry.username === username) + 1;
        
        return report;
    }
}

// Initialize globally
window.projectInvestmentSystem = new ProjectInvestmentSystem();
console.log('💎 Project Investment System ready');
