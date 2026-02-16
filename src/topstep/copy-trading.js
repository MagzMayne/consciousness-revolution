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
 * File: copy-trading.js
 * Declaration ID: IP-4EEE468E-MLL28ZWB
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * TopStep Copy Trading Engine
 * Enables replication of successful trading signals across multiple accounts
 */

class CopyTradingEngine {
  constructor(accountManager) {
    this.accountManager = accountManager;
    this.MASTER_TRADERS_KEY = 'topstep_master_traders';
    this.COPY_RELATIONSHIPS_KEY = 'topstep_copy_relationships';
    this.masterTraders = this.loadMasterTraders();
    this.copyRelationships = this.loadCopyRelationships();
  }

  /**
   * Load master traders from localStorage
   */
  loadMasterTraders() {
    try {
      const data = localStorage.getItem(this.MASTER_TRADERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load master traders:', e);
      return [];
    }
  }

  /**
   * Save master traders to localStorage
   */
  saveMasterTraders() {
    try {
      localStorage.setItem(this.MASTER_TRADERS_KEY, JSON.stringify(this.masterTraders));
    } catch (e) {
      console.error('Failed to save master traders:', e);
    }
  }

  /**
   * Load copy relationships from localStorage
   */
  loadCopyRelationships() {
    try {
      const data = localStorage.getItem(this.COPY_RELATIONSHIPS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load copy relationships:', e);
      return [];
    }
  }

  /**
   * Save copy relationships to localStorage
   */
  saveCopyRelationships() {
    try {
      localStorage.setItem(this.COPY_RELATIONSHIPS_KEY, JSON.stringify(this.copyRelationships));
    } catch (e) {
      console.error('Failed to save copy relationships:', e);
    }
  }

  /**
   * Register an account as a master trader (signal source)
   */
  registerMasterTrader(accountId, settings = {}) {
    const account = this.accountManager.getAccount(accountId);
    if (!account) return false;

    const masterTrader = {
      id: accountId,
      name: account.name,
      registeredAt: Date.now(),
      settings: {
        allowCopying: settings.allowCopying !== undefined ? settings.allowCopying : true,
        minCopyBalance: settings.minCopyBalance || 10000,
        maxCopiers: settings.maxCopiers || 10,
        shareSignals: settings.shareSignals !== undefined ? settings.shareSignals : true,
        requireApproval: settings.requireApproval !== undefined ? settings.requireApproval : false
      },
      stats: {
        totalCopiers: 0,
        totalSignalsGenerated: 0,
        totalSignalsCopied: 0,
        successRate: 0
      }
    };

    // Remove existing entry if present
    this.masterTraders = this.masterTraders.filter(mt => mt.id !== accountId);
    this.masterTraders.push(masterTrader);
    this.saveMasterTraders();

    return masterTrader;
  }

  /**
   * Unregister a master trader
   */
  unregisterMasterTrader(accountId) {
    this.masterTraders = this.masterTraders.filter(mt => mt.id !== accountId);
    this.saveMasterTraders();

    // Remove all copy relationships for this master
    this.copyRelationships = this.copyRelationships.filter(cr => cr.masterId !== accountId);
    this.saveCopyRelationships();

    return true;
  }

  /**
   * Get master trader by ID
   */
  getMasterTrader(accountId) {
    return this.masterTraders.find(mt => mt.id === accountId);
  }

  /**
   * Get all master traders
   */
  getAllMasterTraders() {
    return this.masterTraders;
  }

  /**
   * Get top performing master traders
   */
  getTopMasterTraders(limit = 5) {
    const traders = this.masterTraders.map(mt => {
      const account = this.accountManager.getAccount(mt.id);
      if (!account) return null;

      const pnl = account.balance - account.startingBalance;
      const pnlPercent = (pnl / account.startingBalance) * 100;

      return {
        ...mt,
        performance: {
          pnl,
          pnlPercent,
          winRate: account.performance.winRate,
          profitFactor: account.performance.profitFactor,
          totalTrades: account.performance.totalTrades
        }
      };
    }).filter(Boolean);

    return traders
      .sort((a, b) => b.performance.pnlPercent - a.performance.pnlPercent)
      .slice(0, limit);
  }

  /**
   * Create a copy trading relationship
   */
  createCopyRelationship(followerAccountId, masterAccountId, settings = {}) {
    const followerAccount = this.accountManager.getAccount(followerAccountId);
    const masterTrader = this.getMasterTrader(masterAccountId);

    if (!followerAccount || !masterTrader) {
      return { success: false, error: 'Invalid follower or master account' };
    }

    // Check if relationship already exists
    const existing = this.copyRelationships.find(
      cr => cr.followerId === followerAccountId && cr.masterId === masterAccountId
    );
    if (existing) {
      return { success: false, error: 'Relationship already exists' };
    }

    // Check master trader limits
    if (masterTrader.stats.totalCopiers >= masterTrader.settings.maxCopiers) {
      return { success: false, error: 'Master trader has reached maximum copiers limit' };
    }

    const relationship = {
      id: this.generateRelationshipId(),
      followerId: followerAccountId,
      masterId: masterAccountId,
      createdAt: Date.now(),
      status: masterTrader.settings.requireApproval ? 'pending' : 'active',
      settings: {
        copyRatio: settings.copyRatio || 1.0, // 1.0 = 100% of signal size
        maxTradeSize: settings.maxTradeSize || followerAccount.settings.maxPositionSize,
        stopOnLoss: settings.stopOnLoss || followerAccount.settings.maxDailyLoss,
        contractsFilter: settings.contractsFilter || [], // Empty = copy all
        onlySignalType: settings.onlySignalType || 'all' // 'all', 'buy', 'sell'
      },
      stats: {
        totalSignalsCopied: 0,
        successfulTrades: 0,
        failedTrades: 0,
        totalProfit: 0
      }
    };

    this.copyRelationships.push(relationship);
    this.saveCopyRelationships();

    // Update master trader stats
    masterTrader.stats.totalCopiers++;
    this.saveMasterTraders();

    return { success: true, error: null, relationship };
  }

  /**
   * Generate unique relationship ID
   */
  generateRelationshipId() {
    return 'REL_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
  }

  /**
   * Remove a copy trading relationship
   */
  removeCopyRelationship(relationshipId) {
    const relationship = this.copyRelationships.find(cr => cr.id === relationshipId);
    if (!relationship) return false;

    // Update master trader stats
    const masterTrader = this.getMasterTrader(relationship.masterId);
    if (masterTrader) {
      masterTrader.stats.totalCopiers--;
      this.saveMasterTraders();
    }

    this.copyRelationships = this.copyRelationships.filter(cr => cr.id !== relationshipId);
    this.saveCopyRelationships();

    return true;
  }

  /**
   * Get copy relationships for a follower account
   */
  getFollowerRelationships(followerAccountId) {
    return this.copyRelationships.filter(cr => cr.followerId === followerAccountId);
  }

  /**
   * Get copy relationships for a master account
   */
  getMasterRelationships(masterAccountId) {
    return this.copyRelationships.filter(cr => cr.masterId === masterAccountId);
  }

  /**
   * Distribute a signal to copy traders
   */
  distributeSignal(masterAccountId, signal) {
    const masterTrader = this.getMasterTrader(masterAccountId);
    if (!masterTrader || !masterTrader.settings.shareSignals) {
      return { copied: 0, failed: 0 };
    }

    // Get active copy relationships for this master
    const relationships = this.copyRelationships.filter(
      cr => cr.masterId === masterAccountId && cr.status === 'active'
    );

    let copied = 0;
    let failed = 0;

    relationships.forEach(relationship => {
      try {
        // Check if signal should be copied based on filters
        if (!this.shouldCopySignal(relationship, signal)) {
          return;
        }

        const followerAccount = this.accountManager.getAccount(relationship.followerId);
        if (!followerAccount) {
          failed++;
          return;
        }

        // Calculate position size based on copy ratio
        const positionSize = Math.min(
          (signal.quantity || 1) * relationship.settings.copyRatio,
          relationship.settings.maxTradeSize
        );

        // Create copied signal
        const copiedSignal = {
          ...signal,
          quantity: positionSize,
          copiedFrom: masterAccountId,
          copiedAt: Date.now(),
          originalSignalId: signal.id
        };

        // Store signal in follower account
        if (!followerAccount.signals) {
          followerAccount.signals = [];
        }
        followerAccount.signals.push(copiedSignal);

        // Update relationship stats
        relationship.stats.totalSignalsCopied++;

        // Update account
        this.accountManager.updateAccount(relationship.followerId, {
          signals: followerAccount.signals
        });

        copied++;

      } catch (e) {
        console.error('Failed to copy signal to follower:', e);
        failed++;
      }
    });

    // Update master trader stats
    masterTrader.stats.totalSignalsGenerated++;
    masterTrader.stats.totalSignalsCopied += copied;
    this.saveMasterTraders();
    this.saveCopyRelationships();

    return { copied, failed };
  }

  /**
   * Check if a signal should be copied based on relationship filters
   */
  shouldCopySignal(relationship, signal) {
    // Check contract filter
    if (relationship.settings.contractsFilter.length > 0) {
      if (!relationship.settings.contractsFilter.includes(signal.contract)) {
        return false;
      }
    }

    // Check signal type filter
    if (relationship.settings.onlySignalType !== 'all') {
      const signalType = signal.action.toLowerCase();
      if (signalType !== relationship.settings.onlySignalType) {
        return false;
      }
    }

    return true;
  }

  /**
   * Execute a copied trade (called when trade completes)
   */
  executeCopiedTrade(followerAccountId, trade) {
    const relationships = this.getFollowerRelationships(followerAccountId);
    
    relationships.forEach(relationship => {
      if (trade.copiedFrom === relationship.masterId) {
        // Update relationship stats
        relationship.stats.totalProfit += trade.netProfit;
        if (trade.netProfit > 0) {
          relationship.stats.successfulTrades++;
        } else {
          relationship.stats.failedTrades++;
        }

        // Check stop loss threshold
        if (relationship.stats.totalProfit < -relationship.settings.stopOnLoss) {
          relationship.status = 'paused';
          console.log(`Copy trading paused for ${followerAccountId} due to loss threshold`);
        }
      }
    });

    this.saveCopyRelationships();
  }

  /**
   * Get copy trading performance for an account
   */
  getCopyTradingPerformance(accountId) {
    const relationships = this.getFollowerRelationships(accountId);
    
    const performance = relationships.map(rel => {
      const masterTrader = this.getMasterTrader(rel.masterId);
      const masterAccount = this.accountManager.getAccount(rel.masterId);

      return {
        relationshipId: rel.id,
        masterName: masterAccount ? masterAccount.name : 'Unknown',
        masterId: rel.masterId,
        status: rel.status,
        totalSignalsCopied: rel.stats.totalSignalsCopied,
        successfulTrades: rel.stats.successfulTrades,
        failedTrades: rel.stats.failedTrades,
        totalProfit: rel.stats.totalProfit,
        successRate: rel.stats.totalSignalsCopied > 0
          ? (rel.stats.successfulTrades / rel.stats.totalSignalsCopied) * 100
          : 0
      };
    });

    return performance;
  }

  /**
   * Update copy relationship settings
   */
  updateRelationshipSettings(relationshipId, settings) {
    const relationship = this.copyRelationships.find(cr => cr.id === relationshipId);
    if (!relationship) return false;

    Object.assign(relationship.settings, settings);
    this.saveCopyRelationships();

    return true;
  }

  /**
   * Approve or reject a pending copy relationship
   */
  updateRelationshipStatus(relationshipId, status) {
    const relationship = this.copyRelationships.find(cr => cr.id === relationshipId);
    if (!relationship) return false;

    relationship.status = status;
    this.saveCopyRelationships();

    return true;
  }

  /**
   * Get statistics for all copy trading activity
   */
  getOverallCopyTradingStats() {
    const totalMasters = this.masterTraders.length;
    const totalRelationships = this.copyRelationships.length;
    const activeRelationships = this.copyRelationships.filter(cr => cr.status === 'active').length;
    
    const totalSignalsCopied = this.copyRelationships.reduce(
      (sum, cr) => sum + cr.stats.totalSignalsCopied, 0
    );
    
    const totalProfit = this.copyRelationships.reduce(
      (sum, cr) => sum + cr.stats.totalProfit, 0
    );

    return {
      totalMasters,
      totalRelationships,
      activeRelationships,
      totalSignalsCopied,
      totalProfit
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CopyTradingEngine;
}
