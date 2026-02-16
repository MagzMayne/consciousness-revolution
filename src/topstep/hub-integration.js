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
 * File: hub-integration.js
 * Declaration ID: IP-688C8C85-MLL28ZWC
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * TopStep Hub Integration
 * Connects futures.html trading interface with the account manager hub
 */

class TopStepHubIntegration {
  constructor() {
    this.accountManager = new TopStepAccountManager();
    this.copyTradingEngine = new CopyTradingEngine(this.accountManager);
    this.currentAccount = null;
    this.signalListeners = [];
    
    // Check for account parameter in URL
    this.initializeFromURL();
  }

  /**
   * Initialize from URL parameters
   */
  initializeFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const accountId = urlParams.get('account');
    
    if (accountId) {
      this.currentAccount = this.accountManager.getAccount(accountId);
      if (this.currentAccount) {
        this.accountManager.setActiveAccount(accountId);
      }
    }
    
    // Fall back to active account if no URL parameter
    if (!this.currentAccount) {
      this.currentAccount = this.accountManager.getActiveAccount();
    }
  }

  /**
   * Get current account
   */
  getCurrentAccount() {
    return this.currentAccount;
  }

  /**
   * Check if account system is active
   */
  isActive() {
    return this.currentAccount !== null;
  }

  /**
   * Record a trading signal
   */
  recordSignal(signal) {
    if (!this.currentAccount) return null;

    const signalRecord = {
      id: this.generateSignalId(),
      timestamp: Date.now(),
      contract: signal.contract,
      action: signal.action,
      confidence: signal.confidence,
      prediction: signal.prediction,
      currentPrice: signal.currentPrice,
      indicators: signal.indicators || {}
    };

    // Add signal to account
    if (!this.currentAccount.signals) {
      this.currentAccount.signals = [];
    }
    this.currentAccount.signals.push(signalRecord);

    // Save account
    this.accountManager.updateAccount(this.currentAccount.id, {
      signals: this.currentAccount.signals
    });

    // Distribute signal to copy traders if this is a master trader
    const masterTrader = this.copyTradingEngine.getMasterTrader(this.currentAccount.id);
    if (masterTrader && masterTrader.settings.shareSignals) {
      const distribution = this.copyTradingEngine.distributeSignal(this.currentAccount.id, signalRecord);
      console.log(`Signal distributed to ${distribution.copied} followers`);
    }

    // Notify listeners
    this.signalListeners.forEach(listener => {
      try {
        listener(signalRecord);
      } catch (e) {
        console.error('Signal listener error:', e);
      }
    });

    return signalRecord;
  }

  /**
   * Generate unique signal ID
   */
  generateSignalId() {
    return 'SIG_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
  }

  /**
   * Record a completed trade
   */
  recordTrade(trade) {
    if (!this.currentAccount) return null;

    // Record trade in account manager
    const tradeRecord = this.accountManager.recordTrade(this.currentAccount.id, trade);

    // Update copy trading stats if this was a copied trade
    if (trade.copiedFrom) {
      this.copyTradingEngine.executeCopiedTrade(this.currentAccount.id, tradeRecord);
    }

    // Refresh current account reference
    this.currentAccount = this.accountManager.getAccount(this.currentAccount.id);

    return tradeRecord;
  }

  /**
   * Get account balance
   */
  getBalance() {
    if (!this.currentAccount) return 0;
    return this.currentAccount.balance;
  }

  /**
   * Get account points
   */
  getPoints() {
    if (!this.currentAccount) return 0;
    return this.currentAccount.points || 0;
  }

  /**
   * Update account points
   */
  updatePoints(points) {
    if (!this.currentAccount) return false;
    
    this.currentAccount.points = points;
    this.accountManager.updateAccount(this.currentAccount.id, {
      points: points
    });
    
    return true;
  }

  /**
   * Get account performance stats
   */
  getPerformanceStats() {
    if (!this.currentAccount) return null;
    return this.accountManager.getAccountStats(this.currentAccount.id);
  }

  /**
   * Get pending copy trading signals
   */
  getPendingCopySignals() {
    if (!this.currentAccount) return [];
    return this.currentAccount.signals || [];
  }

  /**
   * Clear pending signals
   */
  clearPendingSignals() {
    if (!this.currentAccount) return false;
    
    this.currentAccount.signals = [];
    this.accountManager.updateAccount(this.currentAccount.id, {
      signals: []
    });
    
    return true;
  }

  /**
   * Add signal listener
   */
  onSignal(callback) {
    this.signalListeners.push(callback);
  }

  /**
   * Remove signal listener
   */
  offSignal(callback) {
    this.signalListeners = this.signalListeners.filter(l => l !== callback);
  }

  /**
   * Get account display info for UI
   */
  getAccountDisplayInfo() {
    if (!this.currentAccount) {
      return {
        name: 'No Account',
        balance: 0,
        points: 0,
        accountType: 'demo',
        isMaster: false,
        copyFollowing: 0
      };
    }

    const masterTrader = this.copyTradingEngine.getMasterTrader(this.currentAccount.id);
    const followingRelationships = this.copyTradingEngine.getFollowerRelationships(this.currentAccount.id);

    return {
      name: this.currentAccount.name,
      balance: this.currentAccount.balance,
      points: this.currentAccount.points || 0,
      accountType: this.currentAccount.accountType,
      isMaster: !!masterTrader,
      copyFollowing: followingRelationships.length,
      performance: this.currentAccount.performance
    };
  }

  /**
   * Open hub in new window
   */
  openHub() {
    window.open('/topstep-hub.html', '_blank');
  }

  /**
   * Sync with hub (check for new copied signals)
   */
  syncWithHub() {
    if (!this.currentAccount) return { newSignals: 0 };

    // Refresh account data
    this.currentAccount = this.accountManager.getAccount(this.currentAccount.id);

    // Check for new signals
    const pendingSignals = this.getPendingCopySignals();
    
    return {
      newSignals: pendingSignals.length,
      signals: pendingSignals
    };
  }

  /**
   * Get copy trading performance summary
   */
  getCopyTradingPerformance() {
    if (!this.currentAccount) return [];
    return this.copyTradingEngine.getCopyTradingPerformance(this.currentAccount.id);
  }

  /**
   * Check if auto-trading is enabled
   */
  isAutoTradingEnabled() {
    if (!this.currentAccount) return false;
    return this.currentAccount.settings && this.currentAccount.settings.autoTrading;
  }

  /**
   * Toggle auto-trading
   */
  toggleAutoTrading() {
    if (!this.currentAccount) return false;
    
    if (!this.currentAccount.settings) {
      this.currentAccount.settings = {};
    }
    
    this.currentAccount.settings.autoTrading = !this.currentAccount.settings.autoTrading;
    this.accountManager.updateAccount(this.currentAccount.id, {
      settings: this.currentAccount.settings
    });
    
    return this.currentAccount.settings.autoTrading;
  }

  /**
   * Get risk management settings
   */
  getRiskSettings() {
    if (!this.currentAccount) return null;
    return this.currentAccount.settings;
  }

  /**
   * Update risk management settings
   */
  updateRiskSettings(settings) {
    if (!this.currentAccount) return false;
    
    Object.assign(this.currentAccount.settings, settings);
    this.accountManager.updateAccount(this.currentAccount.id, {
      settings: this.currentAccount.settings
    });
    
    return true;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TopStepHubIntegration;
}
