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
 * File: pool-system.js
 * Declaration ID: IP-69709309-MLL28ZWC
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * @aul-enabled
 * Profit Pool System for TopStep Hub
 * Manages profit pool, contributions, and distributions
 */

class TopStepPoolSystem {
  constructor(authManager, tierManager) {
    this.authManager = authManager;
    this.tierManager = tierManager;
    this.poolKey = 'topstep_profit_pool';
    this.contributionsKey = 'topstep_pool_contributions';
    this.distributionsKey = 'topstep_pool_distributions';
    
    // Distribution percentages by tier
    this.tierDistributionWeights = {
      guest: 0,
      basic: 1,
      premium: 2.5,
      enterprise: 5
    };

    // Bot profit contribution percentage
    this.botProfitContributionRate = 0.15; // 15% of bot profits
  }

  /**
   * Get current pool balance
   */
  getPoolBalance() {
    try {
      const data = localStorage.getItem(this.poolKey);
      const pool = data ? JSON.parse(data) : this.initializePool();
      return pool;
    } catch (e) {
      console.error('Error loading pool:', e);
      return this.initializePool();
    }
  }

  /**
   * Initialize pool data structure
   */
  initializePool() {
    const pool = {
      totalBalance: 0,
      contributions: 0,
      distributions: 0,
      lastDistributionDate: null,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
    this.savePool(pool);
    return pool;
  }

  /**
   * Save pool data
   */
  savePool(pool) {
    try {
      pool.metadata.updatedAt = new Date().toISOString();
      localStorage.setItem(this.poolKey, JSON.stringify(pool));
    } catch (e) {
      console.error('Error saving pool:', e);
    }
  }

  /**
   * Add contribution to pool (50% of user payment)
   */
  addPaymentContribution(userId, paymentAmount, tierName, transactionId) {
    const contributionAmount = paymentAmount * 0.5; // 50% goes to pool
    
    const contribution = {
      id: `contrib_${Date.now()}`,
      userId: userId,
      type: 'payment',
      amount: contributionAmount,
      originalAmount: paymentAmount,
      tierName: tierName,
      transactionId: transactionId,
      timestamp: new Date().toISOString()
    };

    // Add to pool
    const pool = this.getPoolBalance();
    pool.totalBalance += contributionAmount;
    pool.contributions += contributionAmount;
    this.savePool(pool);

    // Record contribution
    this.saveContribution(contribution);

    return contribution;
  }

  /**
   * Add bot trading profit contribution
   */
  addBotProfitContribution(accountId, profitAmount, tradeId) {
    const contributionAmount = profitAmount * this.botProfitContributionRate;
    
    if (contributionAmount <= 0) return null;

    const contribution = {
      id: `contrib_bot_${Date.now()}`,
      accountId: accountId,
      type: 'bot_profit',
      amount: contributionAmount,
      originalProfit: profitAmount,
      tradeId: tradeId,
      timestamp: new Date().toISOString()
    };

    // Add to pool
    const pool = this.getPoolBalance();
    pool.totalBalance += contributionAmount;
    pool.contributions += contributionAmount;
    this.savePool(pool);

    // Record contribution
    this.saveContribution(contribution);

    return contribution;
  }

  /**
   * Save contribution record
   */
  saveContribution(contribution) {
    try {
      const contributions = this.getAllContributions();
      contributions.push(contribution);
      localStorage.setItem(this.contributionsKey, JSON.stringify(contributions));
    } catch (e) {
      console.error('Error saving contribution:', e);
    }
  }

  /**
   * Get all contributions
   */
  getAllContributions() {
    try {
      const data = localStorage.getItem(this.contributionsKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading contributions:', e);
      return [];
    }
  }

  /**
   * Get contributions for specific user
   */
  getUserContributions(userId) {
    const allContributions = this.getAllContributions();
    return allContributions.filter(c => c.userId === userId);
  }

  /**
   * Calculate user's pool share based on tier and contributions
   */
  calculateUserPoolShare(userId) {
    const user = this.authManager.getUserById(userId);
    if (!user || user.tier === 'guest') {
      return { share: 0, weight: 0, contributions: 0 };
    }

    // Get user's total contributions
    const userContributions = this.getUserContributions(userId);
    const totalUserContribution = userContributions.reduce((sum, c) => sum + c.amount, 0);

    // Get tier weight
    const tierWeight = this.tierDistributionWeights[user.tier] || 0;

    // Calculate all active users' weights
    const allUsers = this.authManager.getAllUsers();
    const activeUsers = allUsers.filter(u => u.tier !== 'guest');
    const totalWeight = activeUsers.reduce((sum, u) => {
      return sum + (this.tierDistributionWeights[u.tier] || 0);
    }, 0);

    // Calculate user's share percentage
    const sharePercentage = totalWeight > 0 ? (tierWeight / totalWeight) : 0;

    return {
      share: sharePercentage,
      weight: tierWeight,
      contributions: totalUserContribution
    };
  }

  /**
   * Perform monthly distribution to all users
   */
  performMonthlyDistribution() {
    const pool = this.getPoolBalance();
    
    // Don't distribute if pool is too low
    if (pool.totalBalance < 100) {
      return {
        success: false,
        message: 'Pool balance too low for distribution (minimum $100)'
      };
    }

    // Get all active users
    const allUsers = this.authManager.getAllUsers();
    const activeUsers = allUsers.filter(u => u.tier !== 'guest');

    if (activeUsers.length === 0) {
      return {
        success: false,
        message: 'No active users to distribute to'
      };
    }

    // Calculate distributions
    const distributions = [];
    const totalWeight = activeUsers.reduce((sum, u) => {
      return sum + (this.tierDistributionWeights[u.tier] || 0);
    }, 0);

    for (const user of activeUsers) {
      const userShare = this.calculateUserPoolShare(user.id);
      const distributionAmount = pool.totalBalance * userShare.share;

      if (distributionAmount > 0) {
        distributions.push({
          id: `dist_${Date.now()}_${user.id}`,
          userId: user.id,
          amount: distributionAmount,
          share: userShare.share,
          tierWeight: userShare.weight,
          contributions: userShare.contributions,
          timestamp: new Date().toISOString(),
          status: 'pending' // pending, completed
        });
      }
    }

    // Update pool balance
    const totalDistributed = distributions.reduce((sum, d) => sum + d.amount, 0);
    pool.totalBalance -= totalDistributed;
    pool.distributions += totalDistributed;
    pool.lastDistributionDate = new Date().toISOString();
    this.savePool(pool);

    // Save distributions
    this.saveDistributions(distributions);

    // Credit distributions to users
    for (const dist of distributions) {
      this.creditDistribution(dist.userId, dist.amount, dist.id);
    }

    return {
      success: true,
      message: 'Monthly distribution completed',
      totalDistributed: totalDistributed,
      distributions: distributions
    };
  }

  /**
   * Save distribution records
   */
  saveDistributions(newDistributions) {
    try {
      const distributions = this.getAllDistributions();
      distributions.push(...newDistributions);
      localStorage.setItem(this.distributionsKey, JSON.stringify(distributions));
    } catch (e) {
      console.error('Error saving distributions:', e);
    }
  }

  /**
   * Get all distributions
   */
  getAllDistributions() {
    try {
      const data = localStorage.getItem(this.distributionsKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading distributions:', e);
      return [];
    }
  }

  /**
   * Get distributions for user
   */
  getUserDistributions(userId) {
    const allDistributions = this.getAllDistributions();
    return allDistributions.filter(d => d.userId === userId);
  }

  /**
   * Credit distribution to user account
   */
  creditDistribution(userId, amount, distributionId) {
    const user = this.authManager.getUserById(userId);
    if (!user) return;

    const pendingPayouts = user.pendingPayouts || [];
    pendingPayouts.push({
      type: 'pool_distribution',
      amount: amount,
      distributionId: distributionId,
      timestamp: new Date().toISOString(),
      status: 'pending'
    });

    this.authManager.updateUser(userId, { pendingPayouts });
  }

  /**
   * Use pool funds to restart failed account
   */
  async restartFailedAccount(accountId, requiredAmount) {
    const pool = this.getPoolBalance();

    // Check if pool has sufficient funds
    if (pool.totalBalance < requiredAmount) {
      return {
        success: false,
        message: `Insufficient pool funds. Required: $${requiredAmount}, Available: $${pool.totalBalance.toFixed(2)}`
      };
    }

    // Deduct from pool
    pool.totalBalance -= requiredAmount;
    this.savePool(pool);

    // Record as special distribution
    const distribution = {
      id: `restart_${Date.now()}_${accountId}`,
      accountId: accountId,
      type: 'account_restart',
      amount: requiredAmount,
      timestamp: new Date().toISOString(),
      status: 'completed'
    };

    this.saveDistributions([distribution]);

    return {
      success: true,
      message: 'Account restart funded from pool',
      amount: requiredAmount,
      remainingPoolBalance: pool.totalBalance
    };
  }

  /**
   * Check if pool can fund new account
   */
  canFundNewAccount(requiredAmount) {
    const pool = this.getPoolBalance();
    return pool.totalBalance >= requiredAmount;
  }

  /**
   * Fund new account from pool (when profit thresholds reached)
   */
  async fundNewAccountFromPool(userId, accountType, fundingAmount) {
    const pool = this.getPoolBalance();

    if (pool.totalBalance < fundingAmount) {
      return {
        success: false,
        message: 'Insufficient pool funds for new account'
      };
    }

    // Deduct from pool
    pool.totalBalance -= fundingAmount;
    this.savePool(pool);

    // Record distribution
    const distribution = {
      id: `newaccount_${Date.now()}_${userId}`,
      userId: userId,
      accountType: accountType,
      type: 'new_account_funding',
      amount: fundingAmount,
      timestamp: new Date().toISOString(),
      status: 'completed'
    };

    this.saveDistributions([distribution]);

    return {
      success: true,
      message: 'New account funded from pool',
      amount: fundingAmount,
      remainingPoolBalance: pool.totalBalance
    };
  }

  /**
   * Get pool statistics
   */
  getPoolStats() {
    const pool = this.getPoolBalance();
    const allContributions = this.getAllContributions();
    const allDistributions = this.getAllDistributions();

    const paymentContributions = allContributions.filter(c => c.type === 'payment');
    const botContributions = allContributions.filter(c => c.type === 'bot_profit');

    return {
      currentBalance: pool.totalBalance,
      totalContributions: pool.contributions,
      totalDistributions: pool.distributions,
      lastDistributionDate: pool.lastDistributionDate,
      contributionBreakdown: {
        payments: paymentContributions.reduce((sum, c) => sum + c.amount, 0),
        botProfits: botContributions.reduce((sum, c) => sum + c.amount, 0)
      },
      contributionCount: allContributions.length,
      distributionCount: allDistributions.length
    };
  }

  /**
   * Get user's pool analytics
   */
  getUserPoolAnalytics(userId) {
    const contributions = this.getUserContributions(userId);
    const distributions = this.getUserDistributions(userId);
    const share = this.calculateUserPoolShare(userId);

    const totalContributed = contributions.reduce((sum, c) => sum + c.amount, 0);
    const totalReceived = distributions.reduce((sum, d) => sum + d.amount, 0);

    return {
      totalContributed,
      totalReceived,
      netPosition: totalReceived - totalContributed,
      currentShare: share.share,
      tierWeight: share.weight,
      contributionCount: contributions.length,
      distributionCount: distributions.length
    };
  }
}
