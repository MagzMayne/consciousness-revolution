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
 * File: automation-controller.js
 * Declaration ID: IP-278B2A5-MLL28ZWB
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * TopStep Automation Controller
 * 
 * Manages automated trading execution for prop firm accounts
 * Handles strategy selection, risk management, and trade execution
 * 
 * Features:
 * - Fully automated trading with multiple strategies
 * - Real-time risk monitoring and enforcement
 * - Performance tracking and optimization
 * - Auto-scaling position sizes
 * - Emergency stop functionality
 * - Trade logging and analytics
 * 
 * @author Barbrick Design
 * @version 2.0.0
 */

class AutomationController {
  constructor(accountManager, copyTradingEngine) {
    this.accountManager = accountManager;
    this.copyTradingEngine = copyTradingEngine;
    
    // Import strategies (will be set externally)
    this.strategies = null;
    
    // Automation state
    this.isRunning = false;
    this.isPaused = false;
    this.automatedAccounts = new Map(); // accountId -> automation config
    
    // Execution tracking
    this.executionLog = [];
    this.maxLogSize = 1000;
    
    // Performance metrics
    this.performanceMetrics = {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      totalPnL: 0,
      maxDrawdown: 0,
      currentDrawdown: 0,
      peakBalance: 0,
      avgWinSize: 0,
      avgLossSize: 0,
      largestWin: 0,
      largestLoss: 0,
      consecutiveWins: 0,
      consecutiveLosses: 0,
      profitFactor: 0
    };
    
    // Timers
    this.mainLoopInterval = null;
    this.monitoringInterval = null;
    
    // Settings
    this.settings = {
      executionInterval: 30000,      // Check for signals every 30 seconds
      monitoringInterval: 5000,      // Monitor risk every 5 seconds
      enableMeanReversion: true,
      enableMomentum: true,
      enableGrid: false,
      useAdaptiveStrategy: true,
      minimumConfidence: 75,
      maxDailyTrades: 20,
      autoScalePositions: true,
      emergencyStopEnabled: true,
      emergencyStopDrawdown: 10     // Stop all if 10% drawdown
    };
  }

  /**
   * Initialize automation controller with strategies
   */
  initializeStrategies(advancedStrategies) {
    this.strategies = advancedStrategies;
    console.log('✅ Automation Controller initialized with Advanced Trading Strategies');
  }

  /**
   * Enable automation for a specific account
   */
  enableAutomation(accountId, config = {}) {
    const account = this.accountManager.getAccount(accountId);
    if (!account) {
      console.error('Account not found:', accountId);
      return false;
    }

    const automationConfig = {
      accountId,
      accountName: account.name,
      enabled: true,
      enabledAt: Date.now(),
      strategies: {
        meanReversion: config.meanReversion !== undefined ? config.meanReversion : true,
        momentum: config.momentum !== undefined ? config.momentum : true,
        grid: config.grid !== undefined ? config.grid : false
      },
      riskLimits: {
        maxDailyLoss: config.maxDailyLoss || 1000,
        maxPositionSize: config.maxPositionSize || 5,
        maxDrawdown: config.maxDrawdown || 5,
        profitTarget: config.profitTarget || 500
      },
      minimumConfidence: config.minimumConfidence || 75,
      autoScalePositions: config.autoScalePositions !== undefined ? config.autoScalePositions : true,
      stats: {
        tradesExecuted: 0,
        wins: 0,
        losses: 0,
        totalPnL: 0,
        lastSignalTime: null
      }
    };

    this.automatedAccounts.set(accountId, automationConfig);
    
    // Initialize account tracking data if not exists
    if (!account.todayPnL) account.todayPnL = 0;
    if (!account.peakBalance) account.peakBalance = account.balance;
    if (!account.positions) account.positions = [];
    
    console.log(`✅ Automation enabled for ${account.name}`);
    return true;
  }

  /**
   * Disable automation for an account
   */
  disableAutomation(accountId) {
    const config = this.automatedAccounts.get(accountId);
    if (config) {
      config.enabled = false;
      console.log(`⏸️ Automation disabled for ${config.accountName}`);
      return true;
    }
    return false;
  }

  /**
   * Start the automation engine
   */
  start() {
    if (this.isRunning) {
      console.warn('Automation already running');
      return false;
    }

    if (!this.strategies) {
      console.error('Strategies not initialized. Call initializeStrategies() first');
      return false;
    }

    this.isRunning = true;
    this.isPaused = false;
    
    console.log('🚀 Starting Automated Trading System...');
    
    // Start main execution loop
    this.mainLoopInterval = setInterval(() => {
      if (!this.isPaused) {
        this.executeMainLoop();
      }
    }, this.settings.executionInterval);
    
    // Start risk monitoring
    this.monitoringInterval = setInterval(() => {
      if (!this.isPaused) {
        this.monitorRiskLimits();
      }
    }, this.settings.monitoringInterval);
    
    console.log('✅ Automated Trading System started');
    return true;
  }

  /**
   * Stop the automation engine
   */
  stop() {
    if (!this.isRunning) {
      return false;
    }

    this.isRunning = false;
    this.isPaused = false;
    
    if (this.mainLoopInterval) {
      clearInterval(this.mainLoopInterval);
      this.mainLoopInterval = null;
    }
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    console.log('⏹️ Automated Trading System stopped');
    return true;
  }

  /**
   * Pause automation (keeps monitoring active)
   */
  pause() {
    this.isPaused = true;
    console.log('⏸️ Automated Trading paused');
  }

  /**
   * Resume automation
   */
  resume() {
    this.isPaused = false;
    console.log('▶️ Automated Trading resumed');
  }

  /**
   * Main execution loop - runs periodically
   */
  async executeMainLoop() {
    try {
      console.log('🔄 Executing trading loop...');
      
      // Get all automated accounts
      const automatedAccounts = Array.from(this.automatedAccounts.values())
        .filter(config => config.enabled);
      
      if (automatedAccounts.length === 0) {
        console.log('ℹ️ No accounts with automation enabled');
        return;
      }

      // Process each account
      for (const config of automatedAccounts) {
        await this.processAccount(config);
      }
      
      // Update overall performance metrics
      this.updatePerformanceMetrics();
      
    } catch (error) {
      console.error('Error in main loop:', error);
      this.logExecution('ERROR', 'Main loop error: ' + error.message);
    }
  }

  /**
   * Process a single account for trading signals
   */
  async processAccount(config) {
    try {
      const account = this.accountManager.getAccount(config.accountId);
      if (!account) {
        console.warn('Account not found:', config.accountId);
        return;
      }

      // Check if account has exceeded daily trade limit
      if (config.stats.tradesExecuted >= this.settings.maxDailyTrades) {
        this.logExecution('INFO', `${account.name}: Daily trade limit reached`, config.accountId);
        return;
      }

      // Get simulated price data (in production, this would be real market data)
      const priceData = this.generateSimulatedPriceData();
      
      // Generate trading signal using advanced strategies
      const signal = this.strategies.generateAutomatedSignal(priceData, account, {
        enableMeanReversion: config.strategies.meanReversion,
        enableMomentum: config.strategies.momentum,
        enableGrid: config.strategies.grid,
        useAdaptiveStrategy: this.settings.useAdaptiveStrategy,
        minimumConfidence: config.minimumConfidence
      });

      // Log signal
      this.logExecution('SIGNAL', JSON.stringify(signal), config.accountId);
      
      // Execute if signal is actionable
      if (signal.signal !== 'HOLD' && signal.confidence >= config.minimumConfidence) {
        await this.executeSignal(account, signal, config);
      }

    } catch (error) {
      console.error(`Error processing account ${config.accountName}:`, error);
      this.logExecution('ERROR', `Account processing error: ${error.message}`, config.accountId);
    }
  }

  /**
   * Execute a trading signal
   */
  async executeSignal(account, signal, config) {
    try {
      const trade = {
        accountId: account.id,
        accountName: account.name,
        timestamp: Date.now(),
        signal: signal.signal,
        strategy: signal.strategy,
        confidence: signal.confidence,
        reason: signal.reason,
        entryPrice: this.getCurrentPrice(),
        stopLoss: signal.stopLoss,
        takeProfit: signal.takeProfit,
        positionSize: signal.positionSize || 1,
        status: 'open'
      };

      // Simulate trade execution
      console.log(`📈 Executing ${signal.signal} for ${account.name}`);
      console.log(`   Strategy: ${signal.strategy}`);
      console.log(`   Confidence: ${signal.confidence}%`);
      console.log(`   Position Size: ${trade.positionSize} contracts`);
      console.log(`   Entry: ${trade.entryPrice}, SL: ${signal.stopLoss}, TP: ${signal.takeProfit}`);

      // Add to account positions
      if (!account.positions) account.positions = [];
      account.positions.push(trade);

      // Update stats
      config.stats.tradesExecuted++;
      config.stats.lastSignalTime = Date.now();

      // Log execution
      this.logExecution('EXECUTE', `${signal.signal} @ ${trade.entryPrice} | ${signal.strategy}`, account.id);

      // Simulate position management (in production, this would be handled by broker API)
      setTimeout(() => {
        this.closePosition(account, trade, config);
      }, 60000); // Close after 1 minute for simulation

      // If this account is a master trader, distribute signal
      if (this.copyTradingEngine) {
        const isMaster = this.copyTradingEngine.getMasterTrader(account.id);
        if (isMaster) {
          this.copyTradingEngine.distributeSignal(account.id, {
            contract: 'ES',
            action: signal.signal,
            price: trade.entryPrice,
            confidence: signal.confidence,
            strategy: signal.strategy,
            timestamp: Date.now()
          });
          console.log(`📡 Signal distributed to followers`);
        }
      }

    } catch (error) {
      console.error('Error executing signal:', error);
      this.logExecution('ERROR', `Execution error: ${error.message}`, account.id);
    }
  }

  /**
   * Close a position (simulated)
   */
  closePosition(account, trade, config) {
    try {
      const currentPrice = this.getCurrentPrice();
      const exitPrice = currentPrice;
      
      // Calculate P&L
      const direction = trade.signal === 'BUY' || trade.signal === 'EXIT_SHORT' ? 1 : -1;
      const pnl = (exitPrice - trade.entryPrice) * direction * trade.positionSize * 50; // $50 per point
      
      trade.exitPrice = exitPrice;
      trade.pnl = pnl;
      trade.status = 'closed';
      trade.closedAt = Date.now();

      // Update account
      account.balance += pnl;
      account.todayPnL = (account.todayPnL || 0) + pnl;
      
      // Update peak balance
      if (account.balance > account.peakBalance) {
        account.peakBalance = account.balance;
      }

      // Record trade
      if (!account.trades) account.trades = [];
      account.trades.push(trade);
      this.accountManager.saveAccounts();

      // Update config stats
      if (pnl > 0) {
        config.stats.wins++;
      } else {
        config.stats.losses++;
      }
      config.stats.totalPnL += pnl;

      // Update performance metrics
      this.performanceMetrics.totalTrades++;
      if (pnl > 0) {
        this.performanceMetrics.winningTrades++;
        this.performanceMetrics.consecutiveWins++;
        this.performanceMetrics.consecutiveLosses = 0;
        if (pnl > this.performanceMetrics.largestWin) {
          this.performanceMetrics.largestWin = pnl;
        }
      } else {
        this.performanceMetrics.losingTrades++;
        this.performanceMetrics.consecutiveLosses++;
        this.performanceMetrics.consecutiveWins = 0;
        if (pnl < this.performanceMetrics.largestLoss) {
          this.performanceMetrics.largestLoss = pnl;
        }
      }
      this.performanceMetrics.totalPnL += pnl;

      console.log(`💰 Position closed for ${account.name}: ${pnl > 0 ? '+' : ''}$${pnl.toFixed(2)}`);
      this.logExecution('CLOSE', `Exit @ ${exitPrice} | P&L: $${pnl.toFixed(2)}`, account.id);

      // Remove from open positions
      const index = account.positions.findIndex(p => p === trade);
      if (index > -1) {
        account.positions.splice(index, 1);
      }

    } catch (error) {
      console.error('Error closing position:', error);
      this.logExecution('ERROR', `Close position error: ${error.message}`, account.id);
    }
  }

  /**
   * Monitor risk limits across all accounts
   */
  monitorRiskLimits() {
    const automatedAccounts = Array.from(this.automatedAccounts.values())
      .filter(config => config.enabled);

    for (const config of automatedAccounts) {
      const account = this.accountManager.getAccount(config.accountId);
      if (!account) continue;

      // Check daily loss limit
      if (account.todayPnL && account.todayPnL <= -config.riskLimits.maxDailyLoss) {
        this.disableAutomation(config.accountId);
        console.warn(`⚠️ ${account.name}: Daily loss limit reached. Automation disabled.`);
        this.logExecution('WARNING', 'Daily loss limit reached - automation disabled', config.accountId);
      }

      // Check drawdown limit
      const drawdown = ((account.peakBalance - account.balance) / account.peakBalance) * 100;
      if (drawdown > config.riskLimits.maxDrawdown) {
        this.disableAutomation(config.accountId);
        console.warn(`⚠️ ${account.name}: Drawdown limit exceeded (${drawdown.toFixed(2)}%). Automation disabled.`);
        this.logExecution('WARNING', `Drawdown limit exceeded - automation disabled`, config.accountId);
      }

      // Emergency stop check
      if (this.settings.emergencyStopEnabled) {
        if (drawdown > this.settings.emergencyStopDrawdown) {
          this.emergencyStop();
          console.error(`🚨 EMERGENCY STOP: System-wide drawdown threshold breached!`);
        }
      }

      // Profit target check (optional - pause instead of stop)
      if (account.todayPnL && account.todayPnL >= config.riskLimits.profitTarget) {
        console.log(`✅ ${account.name}: Daily profit target reached! ($${account.todayPnL})`);
        // Optionally pause automation to lock in profits
        // this.disableAutomation(config.accountId);
      }
    }
  }

  /**
   * Emergency stop - halt all trading immediately
   */
  emergencyStop() {
    console.error('🚨 EMERGENCY STOP ACTIVATED');
    
    // Stop all automation
    this.stop();
    
    // Disable all automated accounts
    for (const [accountId, config] of this.automatedAccounts) {
      config.enabled = false;
    }
    
    // Close all open positions (in production, this would close real positions)
    for (const [accountId, config] of this.automatedAccounts) {
      const account = this.accountManager.getAccount(accountId);
      if (account && account.positions && account.positions.length > 0) {
        console.log(`Closing ${account.positions.length} open positions for ${account.name}`);
        account.positions = [];
      }
    }
    
    this.logExecution('EMERGENCY', 'Emergency stop activated - all trading halted');
    
    // Trigger notification (in production, send email/SMS)
    if (typeof showNotification === 'function') {
      showNotification('🚨 EMERGENCY STOP: All trading halted due to excessive drawdown', 10000);
    }
  }

  /**
   * Update overall performance metrics
   */
  updatePerformanceMetrics() {
    const allAccounts = Array.from(this.automatedAccounts.keys())
      .map(id => this.accountManager.getAccount(id))
      .filter(acc => acc);

    // Calculate aggregate stats
    let totalBalance = 0;
    let totalPeakBalance = 0;

    for (const account of allAccounts) {
      totalBalance += account.balance || 0;
      totalPeakBalance += account.peakBalance || account.balance || 0;
    }

    // Calculate drawdown
    this.performanceMetrics.currentDrawdown = totalPeakBalance > 0
      ? ((totalPeakBalance - totalBalance) / totalPeakBalance) * 100
      : 0;

    if (this.performanceMetrics.currentDrawdown > this.performanceMetrics.maxDrawdown) {
      this.performanceMetrics.maxDrawdown = this.performanceMetrics.currentDrawdown;
    }

    // Calculate profit factor
    const totalWins = this.performanceMetrics.winningTrades * this.performanceMetrics.avgWinSize;
    const totalLosses = Math.abs(this.performanceMetrics.losingTrades * this.performanceMetrics.avgLossSize);
    this.performanceMetrics.profitFactor = totalLosses > 0 ? totalWins / totalLosses : 0;
  }

  /**
   * Log execution events
   */
  logExecution(type, message, accountId = null) {
    const logEntry = {
      timestamp: Date.now(),
      type,
      message,
      accountId
    };

    this.executionLog.push(logEntry);

    // Trim log if too large
    if (this.executionLog.length > this.maxLogSize) {
      this.executionLog = this.executionLog.slice(-this.maxLogSize);
    }

    // Persist to localStorage
    try {
      localStorage.setItem('automation_log', JSON.stringify(this.executionLog.slice(-100)));
    } catch (e) {
      console.warn('Failed to save log to localStorage');
    }
  }

  /**
   * Get execution log
   */
  getExecutionLog(limit = 50) {
    return this.executionLog.slice(-limit).reverse();
  }

  /**
   * Get automation status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      automatedAccountsCount: Array.from(this.automatedAccounts.values()).filter(c => c.enabled).length,
      totalAccounts: this.automatedAccounts.size,
      performanceMetrics: this.performanceMetrics,
      settings: this.settings
    };
  }

  /**
   * Get detailed report for specific account
   */
  getAccountAutomationReport(accountId) {
    const config = this.automatedAccounts.get(accountId);
    if (!config) return null;

    const account = this.accountManager.getAccount(accountId);
    if (!account) return null;

    const winRate = config.stats.wins + config.stats.losses > 0
      ? (config.stats.wins / (config.stats.wins + config.stats.losses)) * 100
      : 0;

    return {
      accountName: config.accountName,
      enabled: config.enabled,
      enabledAt: config.enabledAt,
      strategies: config.strategies,
      riskLimits: config.riskLimits,
      stats: {
        ...config.stats,
        winRate: winRate.toFixed(2) + '%',
        avgPnL: config.stats.tradesExecuted > 0
          ? (config.stats.totalPnL / config.stats.tradesExecuted).toFixed(2)
          : '0.00'
      },
      currentBalance: account.balance,
      todayPnL: account.todayPnL || 0,
      openPositions: account.positions?.length || 0
    };
  }

  /**
   * Helper: Generate simulated price data
   * In production, this would fetch real market data from broker API
   */
  generateSimulatedPriceData() {
    const basePrice = 4500;
    const data = [];
    let price = basePrice;

    for (let i = 0; i < 100; i++) {
      const change = (Math.random() - 0.5) * 10;
      price += change;
      
      data.push({
        timestamp: Date.now() - (100 - i) * 60000,
        open: price - Math.random() * 2,
        high: price + Math.random() * 5,
        low: price - Math.random() * 5,
        close: price,
        volume: 1000 + Math.random() * 5000
      });
    }

    return data;
  }

  /**
   * Helper: Get current price (simulated)
   */
  getCurrentPrice() {
    return 4500 + (Math.random() - 0.5) * 50;
  }

  /**
   * Reset daily statistics (call at start of trading day)
   */
  resetDailyStats() {
    for (const [accountId, config] of this.automatedAccounts) {
      const account = this.accountManager.getAccount(accountId);
      if (account) {
        account.todayPnL = 0;
        config.stats.tradesExecuted = 0;
      }
    }
    console.log('📊 Daily statistics reset');
  }

  /**
   * Export automation configuration
   */
  exportConfiguration() {
    const config = {
      settings: this.settings,
      accounts: Array.from(this.automatedAccounts.entries()).map(([id, cfg]) => ({
        accountId: id,
        config: cfg
      }))
    };
    return JSON.stringify(config, null, 2);
  }

  /**
   * Import automation configuration
   */
  importConfiguration(jsonString) {
    try {
      const config = JSON.parse(jsonString);
      
      if (config.settings) {
        this.settings = { ...this.settings, ...config.settings };
      }
      
      if (config.accounts) {
        for (const acc of config.accounts) {
          this.automatedAccounts.set(acc.accountId, acc.config);
        }
      }
      
      console.log('✅ Configuration imported successfully');
      return true;
    } catch (error) {
      console.error('Failed to import configuration:', error);
      return false;
    }
  }
}

// Export for use in TopStep Hub
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AutomationController;
}
