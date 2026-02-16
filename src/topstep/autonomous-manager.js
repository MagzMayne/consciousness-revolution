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
 * File: autonomous-manager.js
 * Declaration ID: IP-1030CA59-MLL28ZWB
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * @aul-enabled
 * Autonomous Account Manager for TopStep Hub
 * Handles automatic account restart, scaling, and army building
 */

class TopStepAutonomousManager {
  constructor(accountManager, poolSystem, tierManager) {
    this.accountManager = accountManager;
    this.poolSystem = poolSystem;
    this.tierManager = tierManager;
    this.automationKey = 'topstep_automation_rules';
    
    // Default thresholds
    this.defaults = {
      profitThresholdForNewAccount: 5000, // $5000 profit triggers new account
      minAccountBalanceForRestart: 500,   // Minimum $500 to restart
      failedAccountRestartDelay: 86400000, // 24 hours in ms
      maxAutoAccounts: 10                  // Maximum automatic accounts
    };
  }

  /**
   * Check for failed accounts that need restart
   */
  async checkAndRestartFailedAccounts() {
    const allAccounts = this.accountManager.getAllAccounts();
    const failedAccounts = allAccounts.filter(account => this.isAccountFailed(account));

    const results = [];

    for (const account of failedAccounts) {
      // Check if account is eligible for restart
      if (this.canRestartAccount(account)) {
        const result = await this.restartAccount(account);
        results.push(result);
      }
    }

    return {
      checked: failedAccounts.length,
      restarted: results.filter(r => r.success).length,
      results: results
    };
  }

  /**
   * Determine if account is failed
   */
  isAccountFailed(account) {
    const stats = this.accountManager.getAccountStats(account.id);
    
    // Account is failed if:
    // 1. Balance is below minimum threshold
    // 2. Recent losing streak
    // 3. Blown account (balance <= 0)
    
    const minBalance = 100;
    const recentTrades = account.trades?.slice(-10) || [];
    const recentLosses = recentTrades.filter(t => t.profit < 0).length;

    return (
      stats.balance <= 0 || // Blown account
      (stats.balance < minBalance && recentLosses >= 7) || // Low balance with losses
      (account.status === 'failed')
    );
  }

  /**
   * Check if account can be restarted
   */
  canRestartAccount(account) {
    // Check if enough time has passed since last restart attempt
    const lastRestartAttempt = account.lastRestartAttempt;
    if (lastRestartAttempt) {
      const timeSinceRestart = Date.now() - new Date(lastRestartAttempt).getTime();
      if (timeSinceRestart < this.defaults.failedAccountRestartDelay) {
        return false;
      }
    }

    // Check if max restart attempts reached
    const restartCount = account.restartCount || 0;
    if (restartCount >= 3) {
      return false; // Max 3 restart attempts
    }

    // Check pool funds
    const requiredAmount = this.defaults.minAccountBalanceForRestart;
    return this.poolSystem.canFundNewAccount(requiredAmount);
  }

  /**
   * Restart a failed account using pool funds
   */
  async restartAccount(account) {
    const requiredAmount = this.defaults.minAccountBalanceForRestart;

    // Request funding from pool
    const fundingResult = await this.poolSystem.restartFailedAccount(
      account.id,
      requiredAmount
    );

    if (!fundingResult.success) {
      return {
        success: false,
        accountId: account.id,
        message: fundingResult.message
      };
    }

    // Reset account balance and status
    const updatedAccount = {
      ...account,
      balance: requiredAmount,
      initialBalance: requiredAmount,
      status: 'active',
      restartCount: (account.restartCount || 0) + 1,
      lastRestartAttempt: new Date().toISOString(),
      lastRestart: new Date().toISOString(),
      restartHistory: [
        ...(account.restartHistory || []),
        {
          timestamp: new Date().toISOString(),
          amount: requiredAmount,
          previousBalance: account.balance
        }
      ]
    };

    // Update account
    this.accountManager.updateAccount(account.id, updatedAccount);

    return {
      success: true,
      accountId: account.id,
      message: `Account restarted with $${requiredAmount} from pool`,
      restartCount: updatedAccount.restartCount
    };
  }

  /**
   * Check profit thresholds and create new accounts
   */
  async checkProfitThresholdsAndScale(userId) {
    const userAccounts = this.accountManager.getUserAccounts(userId);
    const rules = this.getAutomationRules(userId);

    if (!rules.autoScaling) {
      return { scaling: false, message: 'Auto-scaling disabled' };
    }

    // Calculate total profit across all accounts
    let totalProfit = 0;
    for (const account of userAccounts) {
      const stats = this.accountManager.getAccountStats(account.id);
      totalProfit += stats.pnl;
    }

    const profitThreshold = rules.profitThresholdForNewAccount || this.defaults.profitThresholdForNewAccount;
    const maxAccounts = rules.maxAutoAccounts || this.defaults.maxAutoAccounts;

    // Check if we should create new account
    if (totalProfit >= profitThreshold && userAccounts.length < maxAccounts) {
      // Calculate funding amount (use a portion of profits)
      const fundingAmount = Math.min(totalProfit * 0.5, 5000);

      // Check if pool can fund
      if (this.poolSystem.canFundNewAccount(fundingAmount)) {
        return await this.createScaledAccount(userId, fundingAmount, 'combine');
      }
    }

    return {
      scaling: false,
      totalProfit: totalProfit,
      threshold: profitThreshold,
      currentAccounts: userAccounts.length,
      maxAccounts: maxAccounts
    };
  }

  /**
   * Create new account from profit scaling
   */
  async createScaledAccount(userId, fundingAmount, accountType) {
    // Fund from pool
    const fundingResult = await this.poolSystem.fundNewAccountFromPool(
      userId,
      accountType,
      fundingAmount
    );

    if (!fundingResult.success) {
      return {
        success: false,
        message: fundingResult.message
      };
    }

    // Create new account
    const accountName = `Auto-Scaled ${accountType} ${Date.now()}`;
    const newAccount = this.accountManager.createAccount(
      accountName,
      userId,
      accountType,
      fundingAmount
    );

    // Mark as auto-created
    this.accountManager.updateAccount(newAccount.id, {
      autoCreated: true,
      createdFrom: 'profit_scaling',
      fundingSource: 'pool'
    });

    return {
      success: true,
      account: newAccount,
      fundingAmount: fundingAmount,
      message: `New ${accountType} account created with $${fundingAmount} from pool`
    };
  }

  /**
   * Get automation rules for user
   */
  getAutomationRules(userId) {
    try {
      const data = localStorage.getItem(this.automationKey);
      const allRules = data ? JSON.parse(data) : {};
      return allRules[userId] || this.getDefaultRules();
    } catch (e) {
      console.error('Error loading automation rules:', e);
      return this.getDefaultRules();
    }
  }

  /**
   * Get default automation rules
   */
  getDefaultRules() {
    return {
      autoScaling: false,
      autoRestart: true,
      profitThresholdForNewAccount: this.defaults.profitThresholdForNewAccount,
      maxAutoAccounts: this.defaults.maxAutoAccounts,
      minAccountBalanceForRestart: this.defaults.minAccountBalanceForRestart,
      notificationsEnabled: true
    };
  }

  /**
   * Set automation rules for user
   */
  setAutomationRules(userId, rules) {
    try {
      const data = localStorage.getItem(this.automationKey);
      const allRules = data ? JSON.parse(data) : {};
      allRules[userId] = { ...this.getDefaultRules(), ...rules };
      localStorage.setItem(this.automationKey, JSON.stringify(allRules));
      return allRules[userId];
    } catch (e) {
      console.error('Error saving automation rules:', e);
      return null;
    }
  }

  /**
   * Deploy army of automated traders for user
   */
  async deployTradingArmy(userId, armyConfig) {
    const {
      numberOfAccounts = 5,
      accountType = 'demo',
      initialBalance = 1000,
      copyFromMaster = null
    } = armyConfig;

    // Check tier limits
    const user = this.accountManager.authManager?.getUserById(userId);
    const tier = user ? this.tierManager.getTier(user.tier) : null;
    
    if (tier && tier.limits.accounts !== -1 && numberOfAccounts > tier.limits.accounts) {
      return {
        success: false,
        message: `Tier limit: Maximum ${tier.limits.accounts} accounts`
      };
    }

    // Calculate total funding needed
    const totalFunding = numberOfAccounts * initialBalance;

    // Check if pool can fund (if using pool)
    if (armyConfig.usePool && !this.poolSystem.canFundNewAccount(totalFunding)) {
      return {
        success: false,
        message: 'Insufficient pool funds for army deployment'
      };
    }

    // Create accounts
    const deployedAccounts = [];
    for (let i = 0; i < numberOfAccounts; i++) {
      const accountName = `Army Bot ${i + 1} - ${accountType}`;
      
      let account;
      if (armyConfig.usePool) {
        const fundResult = await this.poolSystem.fundNewAccountFromPool(
          userId,
          accountType,
          initialBalance
        );
        
        if (fundResult.success) {
          account = this.accountManager.createAccount(
            accountName,
            userId,
            accountType,
            initialBalance
          );
        }
      } else {
        account = this.accountManager.createAccount(
          accountName,
          userId,
          accountType,
          initialBalance
        );
      }

      if (account) {
        // Mark as army bot
        this.accountManager.updateAccount(account.id, {
          isArmyBot: true,
          armyDeploymentId: `army_${Date.now()}`,
          automatedTrading: true
        });

        // Set up copy trading if master specified
        if (copyFromMaster && window.copyTradingEngine) {
          window.copyTradingEngine.createCopyRelationship(
            account.id,
            copyFromMaster,
            {
              copyRatio: 1.0,
              maxTradeSize: 5,
              contractsFilter: [],
              onlySignalType: 'all'
            }
          );
        }

        deployedAccounts.push(account);
      }
    }

    return {
      success: true,
      deployed: deployedAccounts.length,
      accounts: deployedAccounts,
      totalFunding: deployedAccounts.length * initialBalance,
      message: `Successfully deployed ${deployedAccounts.length} automated trading accounts`
    };
  }

  /**
   * Run automation cycle (should be called periodically)
   */
  async runAutomationCycle(userId) {
    const results = {
      timestamp: new Date().toISOString(),
      restarts: { checked: 0, restarted: 0 },
      scaling: { checked: false, created: 0 }
    };

    const rules = this.getAutomationRules(userId);

    // Check and restart failed accounts
    if (rules.autoRestart) {
      results.restarts = await this.checkAndRestartFailedAccounts();
    }

    // Check profit thresholds for scaling
    if (rules.autoScaling) {
      const scalingResult = await this.checkProfitThresholdsAndScale(userId);
      results.scaling = scalingResult;
      if (scalingResult.success) {
        results.scaling.created = 1;
      }
    }

    return results;
  }

  /**
   * Get automation status for user
   */
  getAutomationStatus(userId) {
    const rules = this.getAutomationRules(userId);
    const userAccounts = this.accountManager.getUserAccounts(userId);
    const armyBots = userAccounts.filter(a => a.isArmyBot);
    const failedAccounts = userAccounts.filter(a => this.isAccountFailed(a));

    return {
      rules: rules,
      totalAccounts: userAccounts.length,
      armyBots: armyBots.length,
      failedAccounts: failedAccounts.length,
      eligibleForRestart: failedAccounts.filter(a => this.canRestartAccount(a)).length
    };
  }
}
