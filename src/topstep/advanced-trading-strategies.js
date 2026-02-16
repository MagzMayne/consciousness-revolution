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
 * File: advanced-trading-strategies.js
 * Declaration ID: IP-2F3D81EF-MLL28ZWA
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Advanced Trading Strategies for TopStep & Prop Firm Trading
 * 
 * This module implements proven automated trading strategies specifically
 * designed for prop firm environments with focus on consistency and risk management.
 * 
 * Strategies included:
 * 1. Mean Reversion with Bollinger Bands
 * 2. Momentum Breakout Strategy
 * 3. Market Regime Detection & Adaptive Trading
 * 4. Multiple Timeframe Confluence
 * 5. Volatility-based Position Sizing (Kelly Criterion)
 * 6. Smart Grid Trading with Dynamic Adjustments
 * 
 * @author Barbrick Design
 * @version 2.0.0
 */

class AdvancedTradingStrategies {
  constructor() {
    this.name = 'Advanced Trading Strategies';
    this.version = '2.0.0';
    
    // Strategy performance tracking
    this.strategyPerformance = {
      meanReversion: { wins: 0, losses: 0, totalPnL: 0 },
      momentumBreakout: { wins: 0, losses: 0, totalPnL: 0 },
      adaptiveRegime: { wins: 0, losses: 0, totalPnL: 0 },
      multiTimeframe: { wins: 0, losses: 0, totalPnL: 0 },
      gridTrading: { wins: 0, losses: 0, totalPnL: 0 }
    };
    
    // Risk management parameters
    this.riskParams = {
      maxDailyLoss: 1000,           // Maximum daily loss in dollars
      maxPositionSize: 5,            // Maximum contracts per trade
      maxDrawdownPercent: 5,         // Maximum drawdown percentage
      profitTarget: 500,             // Daily profit target
      trailingStopPercent: 2,        // Trailing stop percentage
      riskRewardRatio: 2.0           // Minimum risk/reward ratio
    };
    
    // Market regime detection
    this.marketRegime = {
      current: 'unknown',
      confidence: 0,
      lastUpdate: null,
      regimes: ['trending', 'ranging', 'volatile', 'quiet']
    };
  }

  /**
   * ==================================================================
   * STRATEGY 1: MEAN REVERSION WITH BOLLINGER BANDS
   * ==================================================================
   * Proven strategy for ranging markets
   * Entry: Price touches outer Bollinger Band
   * Exit: Price returns to middle band or opposite band
   * Stop: Beyond outer band
   */
  meanReversionStrategy(priceData, params = {}) {
    const {
      period = 20,
      stdDev = 2,
      rsiPeriod = 14,
      rsiOverbought = 70,
      rsiOversold = 30
    } = params;

    if (priceData.length < period + rsiPeriod) {
      return { signal: 'HOLD', confidence: 0, reason: 'Insufficient data' };
    }

    // Calculate Bollinger Bands
    const closes = priceData.map(d => d.close);
    const sma = this.calculateSMA(closes, period);
    const stdDeviation = this.calculateStdDev(closes, period);
    const upperBand = sma + (stdDev * stdDeviation);
    const lowerBand = sma - (stdDev * stdDeviation);

    // Calculate RSI for confirmation
    const rsi = this.calculateRSI(closes, rsiPeriod);

    const currentPrice = closes[closes.length - 1];
    const pricePosition = (currentPrice - lowerBand) / (upperBand - lowerBand);

    // Generate signals
    let signal = 'HOLD';
    let confidence = 0;
    let reason = '';
    let stopLoss = 0;
    let takeProfit = 0;

    // LONG signal: Price at lower band + RSI oversold
    if (pricePosition < 0.2 && rsi < rsiOversold) {
      signal = 'BUY';
      confidence = Math.min(95, 60 + (40 * (1 - pricePosition)) + (rsiOversold - rsi));
      reason = 'Mean reversion - oversold conditions';
      stopLoss = currentPrice - (currentPrice - lowerBand) * 1.5;
      takeProfit = sma; // Target middle band
    }
    // SHORT signal: Price at upper band + RSI overbought
    else if (pricePosition > 0.8 && rsi > rsiOverbought) {
      signal = 'SELL';
      confidence = Math.min(95, 60 + (40 * pricePosition) + (rsi - rsiOverbought));
      reason = 'Mean reversion - overbought conditions';
      stopLoss = currentPrice + (upperBand - currentPrice) * 1.5;
      takeProfit = sma; // Target middle band
    }
    // EXIT LONG: Price reached middle or upper band
    else if (pricePosition > 0.5) {
      signal = 'EXIT_LONG';
      confidence = 80;
      reason = 'Mean reversion target reached';
    }
    // EXIT SHORT: Price reached middle or lower band
    else if (pricePosition < 0.5) {
      signal = 'EXIT_SHORT';
      confidence = 80;
      reason = 'Mean reversion target reached';
    }

    return {
      signal,
      confidence: Math.round(confidence),
      reason,
      stopLoss: Math.round(stopLoss * 100) / 100,
      takeProfit: Math.round(takeProfit * 100) / 100,
      indicators: {
        sma: Math.round(sma * 100) / 100,
        upperBand: Math.round(upperBand * 100) / 100,
        lowerBand: Math.round(lowerBand * 100) / 100,
        rsi: Math.round(rsi * 100) / 100,
        pricePosition: Math.round(pricePosition * 100) / 100
      },
      strategy: 'Mean Reversion'
    };
  }

  /**
   * ==================================================================
   * STRATEGY 2: MOMENTUM BREAKOUT STRATEGY
   * ==================================================================
   * Captures strong trending moves
   * Entry: Price breaks above/below key levels with volume
   * Exit: Momentum exhaustion or trailing stop
   * Stop: Below/above recent swing point
   */
  momentumBreakoutStrategy(priceData, params = {}) {
    const {
      lookbackPeriod = 20,
      atrPeriod = 14,
      atrMultiplier = 2,
      volumeThreshold = 1.5,
      adxPeriod = 14,
      adxThreshold = 25
    } = params;

    if (priceData.length < Math.max(lookbackPeriod, atrPeriod, adxPeriod) + 1) {
      return { signal: 'HOLD', confidence: 0, reason: 'Insufficient data' };
    }

    const closes = priceData.map(d => d.close);
    const highs = priceData.map(d => d.high);
    const lows = priceData.map(d => d.low);
    const volumes = priceData.map(d => d.volume || 1000);

    // Calculate indicators
    const atr = this.calculateATR(priceData, atrPeriod);
    const adx = this.calculateADX(priceData, adxPeriod);
    const currentPrice = closes[closes.length - 1];
    
    // Find recent high/low
    const recentHigh = Math.max(...highs.slice(-lookbackPeriod));
    const recentLow = Math.min(...lows.slice(-lookbackPeriod));
    
    // Volume analysis
    const avgVolume = volumes.slice(-lookbackPeriod).reduce((a, b) => a + b, 0) / lookbackPeriod;
    const currentVolume = volumes[volumes.length - 1];
    const volumeRatio = currentVolume / avgVolume;

    let signal = 'HOLD';
    let confidence = 0;
    let reason = '';
    let stopLoss = 0;
    let takeProfit = 0;

    // LONG signal: Breakout above resistance with strong trend
    if (currentPrice > recentHigh && adx > adxThreshold && volumeRatio > volumeThreshold) {
      signal = 'BUY';
      confidence = Math.min(95, 50 + (adx * 0.5) + (volumeRatio * 10));
      reason = 'Momentum breakout - strong uptrend detected';
      stopLoss = currentPrice - (atr * atrMultiplier);
      takeProfit = currentPrice + (atr * atrMultiplier * this.riskParams.riskRewardRatio);
    }
    // SHORT signal: Breakdown below support with strong trend
    else if (currentPrice < recentLow && adx > adxThreshold && volumeRatio > volumeThreshold) {
      signal = 'SELL';
      confidence = Math.min(95, 50 + (adx * 0.5) + (volumeRatio * 10));
      reason = 'Momentum breakdown - strong downtrend detected';
      stopLoss = currentPrice + (atr * atrMultiplier);
      takeProfit = currentPrice - (atr * atrMultiplier * this.riskParams.riskRewardRatio);
    }
    // Weak trend - avoid trading
    else if (adx < adxThreshold) {
      signal = 'HOLD';
      confidence = 0;
      reason = 'Weak trend - waiting for stronger momentum';
    }

    return {
      signal,
      confidence: Math.round(confidence),
      reason,
      stopLoss: Math.round(stopLoss * 100) / 100,
      takeProfit: Math.round(takeProfit * 100) / 100,
      indicators: {
        atr: Math.round(atr * 100) / 100,
        adx: Math.round(adx * 100) / 100,
        recentHigh: Math.round(recentHigh * 100) / 100,
        recentLow: Math.round(recentLow * 100) / 100,
        volumeRatio: Math.round(volumeRatio * 100) / 100
      },
      strategy: 'Momentum Breakout'
    };
  }

  /**
   * ==================================================================
   * STRATEGY 3: MARKET REGIME DETECTION & ADAPTIVE TRADING
   * ==================================================================
   * Detects market conditions and adapts strategy accordingly
   * Uses multiple indicators to classify market regime
   * Automatically switches between mean reversion and momentum
   */
  detectMarketRegime(priceData, params = {}) {
    const {
      period = 50,
      volatilityThreshold = 0.02,
      trendThreshold = 0.7
    } = params;

    if (priceData.length < period) {
      return {
        regime: 'unknown',
        confidence: 0,
        recommendedStrategy: 'none'
      };
    }

    const closes = priceData.map(d => d.close);
    
    // Calculate volatility (standard deviation)
    const returns = [];
    for (let i = 1; i < closes.length; i++) {
      returns.push((closes[i] - closes[i-1]) / closes[i-1]);
    }
    const volatility = this.calculateStdDev(returns, returns.length);
    
    // Calculate trend strength using linear regression
    const trendStrength = this.calculateTrendStrength(closes.slice(-period));
    
    // Calculate range efficiency
    const priceRange = Math.max(...closes.slice(-period)) - Math.min(...closes.slice(-period));
    const priceChange = Math.abs(closes[closes.length - 1] - closes[closes.length - period]);
    const rangeEfficiency = priceChange / priceRange;

    // Detect regime
    let regime = 'unknown';
    let confidence = 0;
    let recommendedStrategy = 'none';

    if (volatility > volatilityThreshold) {
      if (trendStrength > trendThreshold) {
        regime = 'trending';
        recommendedStrategy = 'momentum';
        confidence = Math.min(95, 60 + (trendStrength * 40));
      } else {
        regime = 'volatile';
        recommendedStrategy = 'none'; // Avoid trading in volatile, directionless markets
        confidence = 70;
      }
    } else {
      if (rangeEfficiency < 0.3) {
        regime = 'ranging';
        recommendedStrategy = 'meanReversion';
        confidence = Math.min(95, 60 + ((1 - rangeEfficiency) * 40));
      } else {
        regime = 'quiet';
        recommendedStrategy = 'meanReversion';
        confidence = 65;
      }
    }

    // Update market regime
    this.marketRegime = {
      current: regime,
      confidence,
      lastUpdate: Date.now(),
      recommendedStrategy
    };

    return {
      regime,
      confidence: Math.round(confidence),
      recommendedStrategy,
      metrics: {
        volatility: Math.round(volatility * 10000) / 10000,
        trendStrength: Math.round(trendStrength * 100) / 100,
        rangeEfficiency: Math.round(rangeEfficiency * 100) / 100
      }
    };
  }

  /**
   * ==================================================================
   * STRATEGY 4: MULTIPLE TIMEFRAME CONFLUENCE
   * ==================================================================
   * Analyzes multiple timeframes for signal confirmation
   * Only trades when multiple timeframes align
   * Significantly increases win rate
   */
  multiTimeframeAnalysis(priceData1m, priceData5m, priceData15m, params = {}) {
    const { requireAllTimeframes = false } = params;

    // Analyze each timeframe
    const tf1m = this.getTrendDirection(priceData1m);
    const tf5m = this.getTrendDirection(priceData5m);
    const tf15m = this.getTrendDirection(priceData15m);

    // Count bullish and bearish signals
    const bullishCount = [tf1m, tf5m, tf15m].filter(t => t === 'bullish').length;
    const bearishCount = [tf1m, tf5m, tf15m].filter(t => t === 'bearish').length;

    let signal = 'HOLD';
    let confidence = 0;
    let reason = '';

    // All timeframes must agree for highest confidence
    if (bullishCount === 3) {
      signal = 'BUY';
      confidence = 95;
      reason = 'All timeframes bullish - strong uptrend';
    } else if (bearishCount === 3) {
      signal = 'SELL';
      confidence = 95;
      reason = 'All timeframes bearish - strong downtrend';
    }
    // Majority agreement for medium confidence
    else if (!requireAllTimeframes) {
      if (bullishCount >= 2) {
        signal = 'BUY';
        confidence = 60 + (bullishCount * 10);
        reason = 'Majority timeframes bullish';
      } else if (bearishCount >= 2) {
        signal = 'SELL';
        confidence = 60 + (bearishCount * 10);
        reason = 'Majority timeframes bearish';
      }
    }

    return {
      signal,
      confidence: Math.round(confidence),
      reason,
      timeframes: {
        '1m': tf1m,
        '5m': tf5m,
        '15m': tf15m
      },
      alignment: {
        bullish: bullishCount,
        bearish: bearishCount,
        neutral: 3 - bullishCount - bearishCount
      },
      strategy: 'Multi-Timeframe Confluence'
    };
  }

  /**
   * ==================================================================
   * STRATEGY 5: KELLY CRITERION POSITION SIZING
   * ==================================================================
   * Calculates optimal position size based on win rate and risk/reward
   * Maximizes long-term growth while managing risk
   */
  calculateKellyPositionSize(account, signal, params = {}) {
    const {
      winRate = 0.55,              // Historical win rate
      avgWin = 150,                // Average winning trade
      avgLoss = 100,               // Average losing trade
      kellyFraction = 0.25,        // Use quarter Kelly for safety
      minPosition = 1,
      maxPosition = this.riskParams.maxPositionSize
    } = params;

    if (!signal || signal === 'HOLD') {
      return { contracts: 0, reason: 'No signal' };
    }

    // Kelly formula: f = (p * b - q) / b
    // where p = win probability, q = loss probability, b = win/loss ratio
    const p = winRate;
    const q = 1 - winRate;
    const b = avgWin / avgLoss;
    
    const fullKelly = (p * b - q) / b;
    const kellyPercent = Math.max(0, Math.min(1, fullKelly * kellyFraction));

    // Calculate position size based on account
    const accountBalance = account.balance || 25000;
    const riskAmount = accountBalance * kellyPercent;
    const contractValue = 50; // Approximate per-contract value
    
    let contracts = Math.floor(riskAmount / (avgLoss * contractValue));
    contracts = Math.max(minPosition, Math.min(maxPosition, contracts));

    // Additional safety checks
    const maxRiskPercent = 0.02; // Never risk more than 2% per trade
    const maxRisk = accountBalance * maxRiskPercent;
    const safeContracts = Math.floor(maxRisk / avgLoss);
    contracts = Math.min(contracts, safeContracts);

    return {
      contracts,
      kellyPercent: Math.round(kellyPercent * 10000) / 100,
      riskAmount: Math.round(riskAmount),
      reason: `Kelly criterion suggests ${contracts} contracts (${Math.round(kellyPercent * 100)}% Kelly)`
    };
  }

  /**
   * ==================================================================
   * STRATEGY 6: SMART GRID TRADING
   * ==================================================================
   * Advanced grid trading with dynamic adjustments
   * Adapts grid spacing based on volatility
   * Includes profit-taking and loss-limiting mechanisms
   */
  smartGridStrategy(priceData, account, params = {}) {
    const {
      gridLevels = 5,
      baseSpacing = 10,          // Base grid spacing in points
      volatilityMultiplier = 1.5,
      maxGridPositions = 10,
      takeProfitPercent = 0.5,   // Take profit at 50% of grid spacing
      stopLossPercent = 2.0      // Stop loss at 200% of grid spacing
    } = params;

    if (priceData.length < 20) {
      return { signal: 'HOLD', confidence: 0, reason: 'Insufficient data' };
    }

    const closes = priceData.map(d => d.close);
    const currentPrice = closes[closes.length - 1];
    
    // Calculate dynamic grid spacing based on ATR
    const atr = this.calculateATR(priceData, 14);
    const gridSpacing = baseSpacing * volatilityMultiplier * (atr / currentPrice);

    // Initialize grid if not exists
    if (!account.gridPositions) {
      account.gridPositions = [];
    }

    // Calculate grid levels
    const gridLevelsArray = [];
    for (let i = -gridLevels; i <= gridLevels; i++) {
      gridLevelsArray.push({
        price: currentPrice + (i * gridSpacing),
        level: i,
        hasPosition: false
      });
    }

    // Check for grid opportunities
    let signal = 'HOLD';
    let confidence = 0;
    let reason = '';
    let contracts = 1;

    // Find nearest grid level below current price (buy opportunity)
    const buyLevel = gridLevelsArray
      .filter(l => l.price < currentPrice && !l.hasPosition)
      .sort((a, b) => b.price - a.price)[0];

    // Find nearest grid level above current price (sell opportunity)  
    const sellLevel = gridLevelsArray
      .filter(l => l.price > currentPrice && !l.hasPosition)
      .sort((a, b) => a.price - b.price)[0];

    // Determine if we should open new grid position
    if (account.gridPositions.length < maxGridPositions) {
      if (buyLevel && Math.abs(currentPrice - buyLevel.price) < gridSpacing * 0.1) {
        signal = 'BUY';
        confidence = 75;
        reason = 'Grid buy level reached';
      } else if (sellLevel && Math.abs(currentPrice - sellLevel.price) < gridSpacing * 0.1) {
        signal = 'SELL';
        confidence = 75;
        reason = 'Grid sell level reached';
      }
    }

    // Check existing positions for profit-taking
    for (const position of account.gridPositions) {
      const pnl = (currentPrice - position.entryPrice) * position.direction * position.contracts;
      const targetProfit = gridSpacing * takeProfitPercent * position.contracts;
      const maxLoss = gridSpacing * stopLossPercent * position.contracts;

      if (pnl >= targetProfit) {
        signal = position.direction > 0 ? 'EXIT_LONG' : 'EXIT_SHORT';
        confidence = 90;
        reason = 'Grid profit target reached';
        break;
      } else if (pnl <= -maxLoss) {
        signal = position.direction > 0 ? 'EXIT_LONG' : 'EXIT_SHORT';
        confidence = 95;
        reason = 'Grid stop loss triggered';
        break;
      }
    }

    return {
      signal,
      confidence,
      reason,
      gridSpacing: Math.round(gridSpacing * 100) / 100,
      gridLevels: gridLevelsArray.length,
      activePositions: account.gridPositions.length,
      maxPositions: maxGridPositions,
      strategy: 'Smart Grid Trading'
    };
  }

  /**
   * ==================================================================
   * ADVANCED RISK MANAGEMENT
   * ==================================================================
   * Comprehensive risk management system
   */
  checkRiskLimits(account, signal) {
    const checks = {
      passed: true,
      violations: [],
      warnings: []
    };

    // Check daily loss limit
    const dailyPnL = account.todayPnL || 0;
    if (dailyPnL <= -this.riskParams.maxDailyLoss) {
      checks.passed = false;
      checks.violations.push(`Daily loss limit reached: $${Math.abs(dailyPnL)}`);
    }

    // Check if profit target reached
    if (dailyPnL >= this.riskParams.profitTarget) {
      checks.warnings.push(`Daily profit target reached: $${dailyPnL}. Consider reducing risk.`);
    }

    // Check position size
    const openPositions = account.positions?.length || 0;
    if (openPositions >= this.riskParams.maxPositionSize) {
      checks.passed = false;
      checks.violations.push(`Maximum position size reached: ${openPositions} contracts`);
    }

    // Check drawdown
    const accountBalance = account.balance || 25000;
    const peakBalance = account.peakBalance || accountBalance;
    const drawdown = ((peakBalance - accountBalance) / peakBalance) * 100;
    
    if (drawdown > this.riskParams.maxDrawdownPercent) {
      checks.passed = false;
      checks.violations.push(`Maximum drawdown exceeded: ${drawdown.toFixed(2)}%`);
    }

    return checks;
  }

  /**
   * ==================================================================
   * AUTOMATED EXECUTION LOGIC
   * ==================================================================
   * Combines all strategies with intelligent selection
   */
  generateAutomatedSignal(priceData, account, params = {}) {
    const {
      enableMeanReversion = true,
      enableMomentum = true,
      enableGrid = false,
      useAdaptiveStrategy = true,
      minimumConfidence = 70
    } = params;

    // First, check risk limits
    const riskCheck = this.checkRiskLimits(account);
    if (!riskCheck.passed) {
      return {
        signal: 'HOLD',
        confidence: 0,
        reason: 'Risk limits violated: ' + riskCheck.violations.join(', '),
        violations: riskCheck.violations
      };
    }

    // Detect market regime
    const regime = this.detectMarketRegime(priceData);
    
    let bestSignal = { signal: 'HOLD', confidence: 0, strategy: 'none' };

    // Use adaptive strategy selection based on market regime
    if (useAdaptiveStrategy) {
      if (regime.recommendedStrategy === 'meanReversion' && enableMeanReversion) {
        bestSignal = this.meanReversionStrategy(priceData);
      } else if (regime.recommendedStrategy === 'momentum' && enableMomentum) {
        bestSignal = this.momentumBreakoutStrategy(priceData);
      }
    } else {
      // Run all enabled strategies and pick the best
      const signals = [];
      
      if (enableMeanReversion) {
        signals.push(this.meanReversionStrategy(priceData));
      }
      
      if (enableMomentum) {
        signals.push(this.momentumBreakoutStrategy(priceData));
      }
      
      if (enableGrid) {
        signals.push(this.smartGridStrategy(priceData, account));
      }

      // Select signal with highest confidence
      bestSignal = signals.reduce((best, current) => 
        current.confidence > best.confidence ? current : best,
        { signal: 'HOLD', confidence: 0 }
      );
    }

    // Apply minimum confidence filter
    if (bestSignal.confidence < minimumConfidence) {
      return {
        signal: 'HOLD',
        confidence: bestSignal.confidence,
        reason: `Signal confidence ${bestSignal.confidence}% below minimum ${minimumConfidence}%`,
        originalSignal: bestSignal
      };
    }

    // Calculate optimal position size using Kelly Criterion
    const positionSize = this.calculateKellyPositionSize(account, bestSignal);

    return {
      ...bestSignal,
      positionSize: positionSize.contracts,
      marketRegime: regime.regime,
      regimeConfidence: regime.confidence,
      riskCheck,
      timestamp: Date.now()
    };
  }

  /**
   * ==================================================================
   * HELPER FUNCTIONS - Technical Indicators
   * ==================================================================
   */

  calculateSMA(data, period) {
    if (data.length < period) return 0;
    const slice = data.slice(-period);
    return slice.reduce((sum, val) => sum + val, 0) / period;
  }

  calculateStdDev(data, period) {
    if (data.length < period) return 0;
    const slice = data.slice(-period);
    const mean = this.calculateSMA(slice, period);
    const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
    return Math.sqrt(variance);
  }

  calculateRSI(closes, period = 14) {
    if (closes.length < period + 1) return 50;

    let gains = 0;
    let losses = 0;

    for (let i = closes.length - period; i < closes.length; i++) {
      const change = closes[i] - closes[i - 1];
      if (change > 0) gains += change;
      else losses += Math.abs(change);
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  calculateATR(priceData, period = 14) {
    if (priceData.length < period + 1) return 0;

    const trueRanges = [];
    for (let i = 1; i < priceData.length; i++) {
      const high = priceData[i].high;
      const low = priceData[i].low;
      const prevClose = priceData[i - 1].close;
      
      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );
      trueRanges.push(tr);
    }

    return this.calculateSMA(trueRanges, period);
  }

  calculateADX(priceData, period = 14) {
    if (priceData.length < period + 1) return 0;

    // Simplified ADX calculation
    let dmPlus = 0;
    let dmMinus = 0;
    let tr = 0;

    for (let i = 1; i < priceData.length; i++) {
      const highDiff = priceData[i].high - priceData[i - 1].high;
      const lowDiff = priceData[i - 1].low - priceData[i].low;

      dmPlus += highDiff > 0 && highDiff > lowDiff ? highDiff : 0;
      dmMinus += lowDiff > 0 && lowDiff > highDiff ? lowDiff : 0;
      
      const high = priceData[i].high;
      const low = priceData[i].low;
      const prevClose = priceData[i - 1].close;
      tr += Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
    }

    const diPlus = (dmPlus / tr) * 100;
    const diMinus = (dmMinus / tr) * 100;
    const dx = Math.abs(diPlus - diMinus) / (diPlus + diMinus) * 100;

    return dx;
  }

  calculateTrendStrength(data) {
    if (data.length < 10) return 0;

    // Linear regression slope
    const n = data.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += data[i];
      sumXY += i * data[i];
      sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const avgPrice = sumY / n;
    
    // Normalize slope
    return Math.min(1, Math.abs(slope / avgPrice) * 100);
  }

  getTrendDirection(priceData) {
    if (priceData.length < 20) return 'neutral';
    
    const closes = priceData.map(d => d.close);
    const smaShort = this.calculateSMA(closes, 10);
    const smaLong = this.calculateSMA(closes, 20);
    
    if (smaShort > smaLong * 1.01) return 'bullish';
    if (smaShort < smaLong * 0.99) return 'bearish';
    return 'neutral';
  }

  /**
   * ==================================================================
   * PERFORMANCE TRACKING
   * ==================================================================
   */
  updateStrategyPerformance(strategyName, result) {
    if (!this.strategyPerformance[strategyName]) {
      this.strategyPerformance[strategyName] = { wins: 0, losses: 0, totalPnL: 0 };
    }

    const perf = this.strategyPerformance[strategyName];
    if (result.pnl > 0) {
      perf.wins++;
    } else if (result.pnl < 0) {
      perf.losses++;
    }
    perf.totalPnL += result.pnl;
  }

  getStrategyPerformanceReport() {
    const report = {};
    
    for (const [strategy, perf] of Object.entries(this.strategyPerformance)) {
      const total = perf.wins + perf.losses;
      const winRate = total > 0 ? (perf.wins / total) * 100 : 0;
      
      report[strategy] = {
        ...perf,
        winRate: Math.round(winRate * 100) / 100,
        avgPnL: total > 0 ? Math.round((perf.totalPnL / total) * 100) / 100 : 0
      };
    }
    
    return report;
  }
}

// Export for use in TopStep Hub
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdvancedTradingStrategies;
}
