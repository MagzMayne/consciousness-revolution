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
 * File: account-manager.js
 * Declaration ID: IP-2D685D36-MLL28ZWA
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * TopStep Account Manager
 * Manages multiple TopStep trading accounts from a central hub
 */

class TopStepAccountManager {
  constructor(poolSystem = null) {
    this.STORAGE_KEY = 'topstep_accounts';
    this.ACTIVE_ACCOUNT_KEY = 'topstep_active_account';
    this.poolSystem = poolSystem;
    this.accounts = this.loadAccounts();
    this.activeAccountId = this.loadActiveAccount();
  }

  /**
   * Load all accounts from localStorage
   */
  loadAccounts() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load accounts:', e);
      return [];
    }
  }

  /**
   * Save accounts to localStorage
   */
  saveAccounts() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.accounts));
    } catch (e) {
      console.error('Failed to save accounts:', e);
    }
  }

  /**
   * Load active account ID
   */
  loadActiveAccount() {
    try {
      return localStorage.getItem(this.ACTIVE_ACCOUNT_KEY) || null;
    } catch (e) {
      console.error('Failed to load active account:', e);
      return null;
    }
  }

  /**
   * Set active account
   */
  setActiveAccount(accountId) {
    this.activeAccountId = accountId;
    try {
      localStorage.setItem(this.ACTIVE_ACCOUNT_KEY, accountId);
    } catch (e) {
      console.error('Failed to set active account:', e);
    }
  }

  /**
   * Create a new TopStep account
   */
  createAccount(name, email, accountType = 'demo', initialBalance = 50000) {
    const account = {
      id: this.generateAccountId(),
      name: name,
      email: email,
      accountType: accountType, // 'demo', 'combine', 'funded'
      balance: initialBalance,
      startingBalance: initialBalance,
      points: 0,
      trades: [],
      signals: [],
      performance: {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        totalProfit: 0,
        totalLoss: 0,
        winRate: 0,
        profitFactor: 0,
        sharpeRatio: 0
      },
      settings: {
        autoTrading: false,
        copyTrading: false,
        riskPerTrade: 1, // % of balance
        maxDailyLoss: 1000,
        maxPositionSize: 5,
        preferredContracts: ['ES', 'NQ', 'GC']
      },
      createdAt: Date.now(),
      lastActive: Date.now()
    };

    this.accounts.push(account);
    this.saveAccounts();

    // Set as active if it's the first account
    if (this.accounts.length === 1) {
      this.setActiveAccount(account.id);
    }

    return account;
  }

  /**
   * Generate unique account ID
   */
  generateAccountId() {
    return 'TS_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get account by ID
   */
  getAccount(accountId) {
    return this.accounts.find(acc => acc.id === accountId);
  }

  /**
   * Get active account
   */
  getActiveAccount() {
    if (!this.activeAccountId) return null;
    return this.getAccount(this.activeAccountId);
  }

  /**
   * Get all accounts
   */
  getAllAccounts() {
    return this.accounts;
  }

  /**
   * Update account
   */
  updateAccount(accountId, updates) {
    const account = this.getAccount(accountId);
    if (!account) return false;

    Object.assign(account, updates);
    account.lastActive = Date.now();
    this.saveAccounts();
    return true;
  }

  /**
   * Delete account
   */
  deleteAccount(accountId) {
    const index = this.accounts.findIndex(acc => acc.id === accountId);
    if (index === -1) return false;

    this.accounts.splice(index, 1);
    this.saveAccounts();

    // If deleted account was active, set first account as active
    if (this.activeAccountId === accountId) {
      this.activeAccountId = this.accounts.length > 0 ? this.accounts[0].id : null;
      if (this.activeAccountId) {
        this.setActiveAccount(this.activeAccountId);
      } else {
        localStorage.removeItem(this.ACTIVE_ACCOUNT_KEY);
      }
    }

    return true;
  }

  /**
   * Record a trade for an account
   */
  recordTrade(accountId, trade) {
    const account = this.getAccount(accountId);
    if (!account) return false;

    const tradeRecord = {
      id: this.generateTradeId(),
      timestamp: Date.now(),
      contract: trade.contract,
      action: trade.action, // 'BUY' or 'SELL'
      entryPrice: trade.entryPrice,
      exitPrice: trade.exitPrice,
      quantity: trade.quantity || 1,
      profit: trade.profit,
      commission: trade.commission || 0,
      netProfit: trade.profit - (trade.commission || 0),
      signal: trade.signal,
      confidence: trade.confidence,
      copiedFrom: trade.copiedFrom || null
    };

    account.trades.push(tradeRecord);
    account.balance += tradeRecord.netProfit;

    // If trade is profitable and account is a bot, contribute to pool
    if (tradeRecord.netProfit > 0 && account.isArmyBot && this.poolSystem) {
      this.poolSystem.addBotProfitContribution(
        accountId,
        tradeRecord.netProfit,
        tradeRecord.id
      );
    }

    // Update performance metrics
    this.updatePerformanceMetrics(account);

    this.saveAccounts();
    return tradeRecord;
  }

  /**
   * Generate unique trade ID
   */
  generateTradeId() {
    return 'TRADE_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
  }

  /**
   * Update performance metrics for an account
   */
  updatePerformanceMetrics(account) {
    const MAX_PROFIT_FACTOR = 999.99; // Maximum displayable profit factor when loss is zero
    
    const trades = account.trades;
    const perf = account.performance;

    perf.totalTrades = trades.length;
    perf.winningTrades = trades.filter(t => t.netProfit > 0).length;
    perf.losingTrades = trades.filter(t => t.netProfit < 0).length;

    perf.totalProfit = trades
      .filter(t => t.netProfit > 0)
      .reduce((sum, t) => sum + t.netProfit, 0);

    perf.totalLoss = Math.abs(
      trades
        .filter(t => t.netProfit < 0)
        .reduce((sum, t) => sum + t.netProfit, 0)
    );

    perf.winRate = perf.totalTrades > 0
      ? (perf.winningTrades / perf.totalTrades) * 100
      : 0;

    perf.profitFactor = perf.totalLoss > 0
      ? perf.totalProfit / perf.totalLoss
      : perf.totalProfit > 0 ? MAX_PROFIT_FACTOR : 0;

    // Calculate Sharpe Ratio (simplified)
    if (trades.length > 1) {
      const returns = trades.map(t => t.netProfit);
      const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
      const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
      const stdDev = Math.sqrt(variance);
      perf.sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;
    }
  }

  /**
   * Get top performing accounts
   */
  getTopPerformers(limit = 5) {
    return [...this.accounts]
      .sort((a, b) => {
        const aPnL = a.balance - a.startingBalance;
        const bPnL = b.balance - b.startingBalance;
        return bPnL - aPnL;
      })
      .slice(0, limit);
  }

  /**
   * Get accounts with copy trading enabled
   */
  getCopyTradingAccounts() {
    return this.accounts.filter(acc => acc.settings.copyTrading);
  }

  /**
   * Export account data
   */
  exportAccount(accountId) {
    const account = this.getAccount(accountId);
    if (!account) return null;

    return {
      ...account,
      exportedAt: Date.now(),
      version: '1.0'
    };
  }

  /**
   * Import account data
   */
  importAccount(accountData) {
    try {
      // Generate new ID to avoid conflicts
      const newAccount = {
        ...accountData,
        id: this.generateAccountId(),
        createdAt: Date.now(),
        lastActive: Date.now()
      };

      delete newAccount.exportedAt;
      delete newAccount.version;

      this.accounts.push(newAccount);
      this.saveAccounts();

      return newAccount;
    } catch (e) {
      console.error('Failed to import account:', e);
      return null;
    }
  }

  /**
   * Get account statistics summary
   */
  getAccountStats(accountId) {
    const account = this.getAccount(accountId);
    if (!account) return null;

    const pnl = account.balance - account.startingBalance;
    const pnlPercent = (pnl / account.startingBalance) * 100;

    return {
      id: account.id,
      name: account.name,
      accountType: account.accountType,
      balance: account.balance,
      startingBalance: account.startingBalance,
      pnl: pnl,
      pnlPercent: pnlPercent,
      totalTrades: account.performance.totalTrades,
      winRate: account.performance.winRate,
      profitFactor: account.performance.profitFactor,
      sharpeRatio: account.performance.sharpeRatio,
      lastActive: account.lastActive
    };
  }

  /**
   * Get overall statistics across all accounts
   */
  getOverallStats() {
    const totalAccounts = this.accounts.length;
    const totalBalance = this.accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalStartingBalance = this.accounts.reduce((sum, acc) => sum + acc.startingBalance, 0);
    const totalPnL = totalBalance - totalStartingBalance;
    const totalTrades = this.accounts.reduce((sum, acc) => sum + acc.performance.totalTrades, 0);
    const avgWinRate = totalAccounts > 0
      ? this.accounts.reduce((sum, acc) => sum + acc.performance.winRate, 0) / totalAccounts
      : 0;

    return {
      totalAccounts,
      totalBalance,
      totalStartingBalance,
      totalPnL,
      totalPnLPercent: totalStartingBalance > 0 ? (totalPnL / totalStartingBalance) * 100 : 0,
      totalTrades,
      avgWinRate
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TopStepAccountManager;
}
