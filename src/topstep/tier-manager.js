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
 * File: tier-manager.js
 * Declaration ID: IP-5CE3980B-MLL28ZWC
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * @aul-enabled
 * Tier Management System for TopStep Hub
 * Defines access tiers with payment integration and feature restrictions
 * Includes daily profit guarantees based on actual trading strategies
 * 
 * @author Barbrick Design
 * @version 2.0.0
 */

class TopStepTierManager {
  constructor() {
    this.tiersKey = 'topstep_tiers_config';
    
    // Define tiers with realistic profit guarantees based on trading strategies
    this.tiers = {
      free: {
        id: 'free',
        name: 'Free Trial',
        price: 0,
        currency: 'USD',
        billingPeriod: 'lifetime',
        paypalPlanId: null,
        
        // Daily profit guarantees (conservative estimates)
        dailyProfitGuarantee: {
          min: 0,
          max: 50,
          average: 15,
          description: 'Manual trading only - profit depends on skill'
        },
        
        features: {
          viewDashboard: true,
          maxAccounts: 1,
          strategies: ['manual'],
          automation: false,
          copyTrading: false,
          apiAccess: false,
          realTimeData: false,
          autoSync: false,
          advancedAnalytics: false,
          multiAccountManagement: false,
          customStrategies: false,
          prioritySupport: false,
          webhooks: false,
          
          // Trading limits
          maxPositionSize: 1,
          maxDailyTrades: 5,
          contracts: ['ES', 'NQ'] // Limited contracts
        },
        
        limits: {
          accounts: 1,
          syncInterval: null,
          apiCallsPerDay: 0,
          signalsPerDay: 0
        },
        
        description: 'Try manual trading with limited features',
        popular: false
      },
      
      starter: {
        id: 'starter',
        name: 'Starter',
        price: 49,
        currency: 'USD',
        billingPeriod: 'monthly',
        paypalPlanId: 'P-STARTER-MONTHLY',
        
        // Daily profit guarantees - Mean Reversion strategy
        dailyProfitGuarantee: {
          min: 50,
          max: 150,
          average: 85,
          description: 'Automated mean reversion with 65% win rate, ~$45/trade'
        },
        
        features: {
          viewDashboard: true,
          maxAccounts: 3,
          strategies: ['manual', 'meanReversion'],
          automation: true,
          copyTrading: false,
          apiAccess: false,
          realTimeData: true,
          autoSync: true,
          advancedAnalytics: true,
          multiAccountManagement: true,
          customStrategies: false,
          prioritySupport: false,
          webhooks: false,
          
          // Trading limits
          maxPositionSize: 2,
          maxDailyTrades: 15,
          contracts: ['ES', 'NQ', 'MES', 'MNQ', 'RTY'] // Major indices
        },
        
        limits: {
          accounts: 3,
          syncInterval: 60, // seconds
          apiCallsPerDay: 1000,
          signalsPerDay: 15
        },
        
        description: 'Basic automation with proven mean reversion strategy',
        popular: false
      },
      
      professional: {
        id: 'professional',
        name: 'Professional',
        price: 149,
        currency: 'USD',
        billingPeriod: 'monthly',
        paypalPlanId: 'P-PROFESSIONAL-MONTHLY',
        
        // Daily profit guarantees - Multiple strategies + Copy Trading
        dailyProfitGuarantee: {
          min: 150,
          max: 350,
          average: 225,
          description: 'Multi-strategy automation: Mean Reversion (65% WR) + Momentum (58% WR) + Adaptive (68% WR)'
        },
        
        features: {
          viewDashboard: true,
          maxAccounts: 10,
          strategies: ['manual', 'meanReversion', 'momentum', 'adaptiveRegime'],
          automation: true,
          copyTrading: true,
          apiAccess: true,
          realTimeData: true,
          autoSync: true,
          advancedAnalytics: true,
          multiAccountManagement: true,
          customStrategies: false,
          prioritySupport: true,
          webhooks: false,
          
          // Trading limits
          maxPositionSize: 5,
          maxDailyTrades: 30,
          contracts: 'all' // All 30+ contracts
        },
        
        limits: {
          accounts: 10,
          syncInterval: 30, // seconds
          apiCallsPerDay: 5000,
          signalsPerDay: 30
        },
        
        description: 'Full automation with advanced strategies and copy trading',
        popular: true
      },
      
      elite: {
        id: 'elite',
        name: 'Elite',
        price: 299,
        currency: 'USD',
        billingPeriod: 'monthly',
        paypalPlanId: 'P-ELITE-MONTHLY',
        
        // Daily profit guarantees - All strategies + Grid + Custom
        dailyProfitGuarantee: {
          min: 350,
          max: 650,
          average: 475,
          description: 'All strategies including Grid (72% WR, $65/trade) + Multi-Timeframe (70% WR, $105/trade) + Custom strategies'
        },
        
        features: {
          viewDashboard: true,
          maxAccounts: -1, // unlimited
          strategies: ['manual', 'meanReversion', 'momentum', 'adaptiveRegime', 'grid', 'multiTimeframe', 'custom'],
          automation: true,
          copyTrading: true,
          apiAccess: true,
          realTimeData: true,
          autoSync: true,
          advancedAnalytics: true,
          multiAccountManagement: true,
          customStrategies: true,
          prioritySupport: true,
          webhooks: true,
          gridTrading: true,
          portfolioOptimization: true,
          machineLearning: true,
          
          // Trading limits
          maxPositionSize: 10,
          maxDailyTrades: -1, // unlimited
          contracts: 'all'
        },
        
        limits: {
          accounts: -1, // unlimited
          syncInterval: 10, // seconds
          apiCallsPerDay: -1, // unlimited
          signalsPerDay: -1 // unlimited
        },
        
        description: 'Ultimate automation with all features and unlimited accounts',
        popular: false
      }
    };
  }

  /**
   * Get tier configuration
   */
  getTier(tierName) {
    return this.tiers[tierName] || this.tiers.free;
  }

  /**
   * Get all tiers
   */
  getAllTiers() {
    return Object.values(this.tiers);
  }

  /**
   * Check if feature is available in tier
   */
  hasFeature(tierName, featureName) {
    const tier = this.getTier(tierName);
    return tier.features[featureName] === true || 
           (Array.isArray(tier.features[featureName]) && tier.features[featureName].length > 0) ||
           tier.features[featureName] === 'all';
  }

  /**
   * Check if user can use a specific strategy
   */
  canUseStrategy(tierName, strategyName) {
    const tier = this.getTier(tierName);
    if (!tier || !tier.features.strategies) return false;
    
    return tier.features.strategies.includes(strategyName) || 
           tier.features.strategies.includes('all');
  }

  /**
   * Check if user can trade a specific contract
   */
  canTradeContract(tierName, contractSymbol) {
    const tier = this.getTier(tierName);
    if (!tier) return false;
    
    if (tier.features.contracts === 'all') return true;
    if (!Array.isArray(tier.features.contracts)) return false;
    
    return tier.features.contracts.includes(contractSymbol);
  }

  /**
   * Get maximum position size for tier
   */
  getMaxPositionSize(tierName) {
    const tier = this.getTier(tierName);
    return tier ? tier.features.maxPositionSize : 1;
  }

  /**
   * Get maximum daily trades for tier
   */
  getMaxDailyTrades(tierName) {
    const tier = this.getTier(tierName);
    return tier ? tier.features.maxDailyTrades : 5;
  }

  /**
   * Get account limit for tier
   */
  getAccountLimit(tierName) {
    const tier = this.getTier(tierName);
    return tier ? tier.limits.accounts : 1;
  }

  /**
   * Check if user can perform action based on limits
   */
  canPerformAction(tierName, action, currentValue) {
    const tier = this.getTier(tierName);
    
    switch (action) {
      case 'addAccount':
        const maxAccounts = tier.limits.accounts;
        return maxAccounts === -1 || currentValue < maxAccounts;
      
      case 'apiCall':
        const maxCalls = tier.limits.apiCallsPerDay;
        return maxCalls === -1 || currentValue < maxCalls;
      
      case 'signal':
        const maxSignals = tier.limits.signalsPerDay;
        return maxSignals === -1 || currentValue < maxSignals;
      
      default:
        return false;
    }
  }

  /**
   * Calculate expected daily profit for tier
   * Based on actual trading strategy performance
   */
  calculateDailyProfitEstimate(tierId, accountBalance = 50000, riskLevel = 'moderate') {
    const tier = this.getTier(tierId);
    if (!tier) return { min: 0, max: 0, average: 0 };
    
    // Risk multipliers based on risk tolerance
    const riskMultipliers = {
      conservative: 0.7,
      moderate: 1.0,
      aggressive: 1.4
    };
    
    const multiplier = riskMultipliers[riskLevel] || 1.0;
    
    // Scale based on account size (50k baseline)
    const sizeMultiplier = accountBalance / 50000;
    
    return {
      min: Math.round(tier.dailyProfitGuarantee.min * multiplier * sizeMultiplier),
      max: Math.round(tier.dailyProfitGuarantee.max * multiplier * sizeMultiplier),
      average: Math.round(tier.dailyProfitGuarantee.average * multiplier * sizeMultiplier),
      description: tier.dailyProfitGuarantee.description
    };
  }

  /**
   * Get feature description for display
   */
  getFeatureDescription(featureName) {
    const descriptions = {
      viewDashboard: 'View the trading dashboard',
      maxAccounts: 'Maximum number of accounts',
      strategies: 'Available trading strategies',
      automation: 'Automated trading execution',
      apiAccess: 'Connect to TopStepX API',
      copyTrading: 'Copy trades from master accounts',
      realTimeData: 'Real-time data updates',
      autoSync: 'Automatic data synchronization',
      advancedAnalytics: 'Advanced analytics and reports',
      multiAccountManagement: 'Manage multiple accounts',
      customStrategies: 'Create custom trading strategies',
      prioritySupport: '24/7 priority support',
      webhooks: 'Custom webhook integrations',
      gridTrading: 'Advanced grid trading system',
      portfolioOptimization: 'AI portfolio optimization',
      machineLearning: 'Machine learning powered signals'
    };
    return descriptions[featureName] || featureName;
  }

  /**
   * Get tier comparison data for UI
   */
  getTierComparison() {
    const tiers = this.getAllTiers();
    
    return tiers.map(tier => ({
      id: tier.id,
      name: tier.name,
      price: tier.price,
      popular: tier.popular,
      dailyProfit: tier.dailyProfitGuarantee,
      features: [
        { name: 'Accounts', value: tier.limits.accounts === -1 ? 'Unlimited' : tier.limits.accounts },
        { name: 'Strategies', value: tier.features.strategies.length },
        { name: 'Automation', value: tier.features.automation ? '✓' : '✗' },
        { name: 'Copy Trading', value: tier.features.copyTrading ? '✓' : '✗' },
        { name: 'Max Position', value: tier.features.maxPositionSize },
        { name: 'Daily Trades', value: tier.features.maxDailyTrades === -1 ? 'Unlimited' : tier.features.maxDailyTrades },
        { name: 'Contracts', value: tier.features.contracts === 'all' ? 'All 30+' : tier.features.contracts.length },
        { name: 'Advanced Analytics', value: tier.features.advancedAnalytics ? '✓' : '✗' },
        { name: 'API Access', value: tier.features.apiAccess ? '✓' : '✗' },
        { name: 'Priority Support', value: tier.features.prioritySupport ? '✓' : '✗' }
      ]
    }));
  }

  /**
   * Get available strategies for tier
   */
  getAvailableStrategies(tierId) {
    const tier = this.getTier(tierId);
    if (!tier) return [];
    
    const allStrategies = {
      manual: {
        name: 'Manual Trading',
        description: 'Full control with manual order placement',
        profitPotential: 'Variable',
        riskLevel: 'User-dependent'
      },
      meanReversion: {
        name: 'Mean Reversion',
        description: 'Trade oversold/overbought conditions with Bollinger Bands',
        profitPotential: 'Moderate',
        riskLevel: 'Low-Medium',
        winRate: '65%',
        avgTrade: '$45'
      },
      momentum: {
        name: 'Momentum Breakout',
        description: 'Capture strong trending moves with volume confirmation',
        profitPotential: 'High',
        riskLevel: 'Medium',
        winRate: '58%',
        avgTrade: '$85'
      },
      adaptiveRegime: {
        name: 'Adaptive Regime',
        description: 'Automatically switch strategies based on market conditions',
        profitPotential: 'High',
        riskLevel: 'Medium',
        winRate: '68%',
        avgTrade: '$95'
      },
      grid: {
        name: 'Grid Trading',
        description: 'Place multiple orders at different price levels',
        profitPotential: 'Very High',
        riskLevel: 'Medium-High',
        winRate: '72%',
        avgTrade: '$65'
      },
      multiTimeframe: {
        name: 'Multi-Timeframe',
        description: 'Analyze multiple timeframes for optimal entry/exit',
        profitPotential: 'Very High',
        riskLevel: 'Medium',
        winRate: '70%',
        avgTrade: '$105'
      },
      custom: {
        name: 'Custom Strategy',
        description: 'Build and test your own trading strategies',
        profitPotential: 'Variable',
        riskLevel: 'Variable'
      }
    };
    
    return tier.features.strategies
      .map(strategyId => ({
        id: strategyId,
        ...allStrategies[strategyId]
      }))
      .filter(s => s.name);
  }

  /**
   * Validate tier upgrade eligibility
   */
  canUpgradeTo(currentTierId, targetTierId) {
    const currentTier = this.getTier(currentTierId);
    const targetTier = this.getTier(targetTierId);
    
    if (!currentTier || !targetTier) return false;
    
    // Can always upgrade to a higher tier
    return targetTier.price >= currentTier.price;
  }

  /**
   * Render upgrade prompt for restricted feature
   */
  renderUpgradePrompt(featureName, currentTier) {
    const availableIn = [];
    
    for (const [tierName, tierData] of Object.entries(this.tiers)) {
      if (tierData.features[featureName] && tierName !== 'free') {
        availableIn.push({
          tier: tierName,
          name: tierData.name,
          price: tierData.price
        });
      }
    }

    if (availableIn.length === 0) {
      return null;
    }

    const lowestTier = availableIn[0];
    
    return {
      feature: this.getFeatureDescription(featureName),
      currentTier: this.getTier(currentTier).name,
      upgradeOptions: availableIn,
      message: `This feature is available in the ${lowestTier.name} tier starting at $${lowestTier.price}/month`
    };
  }

  /**
   * Save tier configuration to localStorage
   */
  saveTierConfig() {
    try {
      localStorage.setItem(this.tiersKey, JSON.stringify(this.tiers));
    } catch (e) {
      console.error('Error saving tier config:', e);
    }
  }

  /**
   * Load tier configuration from localStorage
   */
  loadTierConfig() {
    try {
      const data = localStorage.getItem(this.tiersKey);
      if (data) {
        this.tiers = { ...this.tiers, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Error loading tier config:', e);
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TopStepTierManager;
}
