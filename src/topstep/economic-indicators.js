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
 * File: economic-indicators.js
 * Declaration ID: IP-3913BF5B-MLL28ZWB
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Economic Indicators Module
 * 
 * Tracks and analyzes key economic indicators that impact futures markets.
 * Provides real-time alerts and market impact analysis.
 * 
 * Features:
 * - GDP, employment, inflation tracking
 * - Federal Reserve policy monitoring
 * - Market correlation analysis
 * - Trading impact scoring
 * 
 * @author Barbrick Design
 * @version 1.0.0
 */

class EconomicIndicatorsEngine {
  constructor() {
    this.name = 'Economic Indicators Engine';
    this.version = '1.0.0';
    
    // Economic calendar
    this.calendar = [];
    
    // Current indicators
    this.indicators = {
      gdp: {
        current: 2.5,
        previous: 2.3,
        forecast: 2.6,
        lastUpdate: null,
        impact: 'HIGH'
      },
      unemployment: {
        current: 3.8,
        previous: 3.9,
        forecast: 3.7,
        lastUpdate: null,
        impact: 'HIGH'
      },
      inflation: {
        current: 3.2,
        previous: 3.4,
        forecast: 3.1,
        lastUpdate: null,
        impact: 'CRITICAL'
      },
      interestRate: {
        current: 5.25,
        previous: 5.00,
        forecast: 5.50,
        lastUpdate: null,
        impact: 'CRITICAL'
      },
      consumerConfidence: {
        current: 102.5,
        previous: 101.8,
        forecast: 103.0,
        lastUpdate: null,
        impact: 'MEDIUM'
      },
      retailSales: {
        current: 0.7,
        previous: 0.4,
        forecast: 0.6,
        lastUpdate: null,
        impact: 'MEDIUM'
      }
    };
    
    // Upcoming events
    this.upcomingEvents = this.generateUpcomingEvents();
  }
  
  /**
   * Get all current indicators
   */
  getAllIndicators() {
    return this.indicators;
  }
  
  /**
   * Get specific indicator
   */
  getIndicator(name) {
    return this.indicators[name] || null;
  }
  
  /**
   * Update indicator value
   */
  updateIndicator(name, data) {
    if (!this.indicators[name]) {
      console.warn(`[Economic Indicators] Unknown indicator: ${name}`);
      return false;
    }
    
    this.indicators[name] = {
      ...this.indicators[name],
      ...data,
      lastUpdate: Date.now()
    };
    
    return true;
  }
  
  /**
   * Analyze market impact of current economic conditions
   */
  analyzeMarketImpact() {
    const analysis = {
      overall: 'NEUTRAL',
      score: 0,
      factors: [],
      recommendations: []
    };
    
    // Analyze GDP
    if (this.indicators.gdp.current > this.indicators.gdp.previous) {
      analysis.score += 2;
      analysis.factors.push({
        indicator: 'GDP',
        impact: 'POSITIVE',
        reason: 'GDP growth accelerating',
        weight: 2
      });
    } else {
      analysis.score -= 2;
      analysis.factors.push({
        indicator: 'GDP',
        impact: 'NEGATIVE',
        reason: 'GDP growth slowing',
        weight: 2
      });
    }
    
    // Analyze unemployment
    if (this.indicators.unemployment.current < this.indicators.unemployment.previous) {
      analysis.score += 2;
      analysis.factors.push({
        indicator: 'Unemployment',
        impact: 'POSITIVE',
        reason: 'Unemployment declining',
        weight: 2
      });
    } else {
      analysis.score -= 2;
      analysis.factors.push({
        indicator: 'Unemployment',
        impact: 'NEGATIVE',
        reason: 'Unemployment rising',
        weight: 2
      });
    }
    
    // Analyze inflation (complex relationship)
    const inflationDiff = this.indicators.inflation.current - this.indicators.inflation.previous;
    if (Math.abs(inflationDiff) > 0.5) {
      analysis.score -= 3;
      analysis.factors.push({
        indicator: 'Inflation',
        impact: 'NEGATIVE',
        reason: 'High inflation volatility',
        weight: 3
      });
    } else if (this.indicators.inflation.current > 3.0) {
      analysis.score -= 1;
      analysis.factors.push({
        indicator: 'Inflation',
        impact: 'CAUTIONARY',
        reason: 'Elevated inflation levels',
        weight: 1
      });
    }
    
    // Analyze interest rates
    if (this.indicators.interestRate.current > this.indicators.interestRate.previous) {
      analysis.score -= 2;
      analysis.factors.push({
        indicator: 'Interest Rate',
        impact: 'NEGATIVE',
        reason: 'Rising interest rates',
        weight: 2
      });
    }
    
    // Analyze consumer confidence
    if (this.indicators.consumerConfidence.current > this.indicators.consumerConfidence.previous) {
      analysis.score += 1;
      analysis.factors.push({
        indicator: 'Consumer Confidence',
        impact: 'POSITIVE',
        reason: 'Consumer confidence improving',
        weight: 1
      });
    }
    
    // Determine overall market sentiment
    if (analysis.score >= 3) {
      analysis.overall = 'BULLISH';
      analysis.recommendations.push('Favorable economic conditions for long positions');
      analysis.recommendations.push('Consider increasing position sizes moderately');
    } else if (analysis.score <= -3) {
      analysis.overall = 'BEARISH';
      analysis.recommendations.push('Challenging economic conditions');
      analysis.recommendations.push('Consider defensive positions or reduced exposure');
    } else {
      analysis.overall = 'NEUTRAL';
      analysis.recommendations.push('Mixed economic signals');
      analysis.recommendations.push('Maintain balanced approach with tight risk management');
    }
    
    // Add specific risk warnings
    if (this.indicators.inflation.current > 4.0) {
      analysis.recommendations.push('⚠️ High inflation may increase market volatility');
    }
    
    if (this.indicators.interestRate.current > 5.5) {
      analysis.recommendations.push('⚠️ Elevated interest rates may pressure equity valuations');
    }
    
    return analysis;
  }
  
  /**
   * Generate upcoming economic events
   */
  generateUpcomingEvents() {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    
    return [
      {
        name: 'FOMC Meeting',
        date: now + 7 * day,
        impact: 'CRITICAL',
        description: 'Federal Reserve monetary policy decision',
        expectedVolatility: 'EXTREME',
        tradingAdvice: 'Avoid new positions 2 hours before and after'
      },
      {
        name: 'Non-Farm Payrolls',
        date: now + 2 * day,
        impact: 'CRITICAL',
        description: 'Monthly employment report',
        expectedVolatility: 'EXTREME',
        tradingAdvice: 'Close or hedge positions before release'
      },
      {
        name: 'CPI Report',
        date: now + 5 * day,
        impact: 'HIGH',
        description: 'Consumer Price Index - inflation data',
        expectedVolatility: 'HIGH',
        tradingAdvice: 'Reduce position sizes by 50%'
      },
      {
        name: 'GDP Release',
        date: now + 14 * day,
        impact: 'HIGH',
        description: 'Quarterly GDP growth rate',
        expectedVolatility: 'MEDIUM',
        tradingAdvice: 'Monitor closely, adjust stops'
      },
      {
        name: 'Retail Sales',
        date: now + 4 * day,
        impact: 'MEDIUM',
        description: 'Monthly retail sales data',
        expectedVolatility: 'MEDIUM',
        tradingAdvice: 'Normal trading with caution'
      }
    ];
  }
  
  /**
   * Get upcoming events (next 30 days)
   */
  getUpcomingEvents(daysAhead = 30) {
    const cutoff = Date.now() + (daysAhead * 24 * 60 * 60 * 1000);
    
    return this.upcomingEvents
      .filter(event => event.date <= cutoff)
      .sort((a, b) => a.date - b.date);
  }
  
  /**
   * Check for critical events in next N hours
   */
  checkCriticalEventsAhead(hoursAhead = 24) {
    const cutoff = Date.now() + (hoursAhead * 60 * 60 * 1000);
    
    const criticalEvents = this.upcomingEvents.filter(event => 
      event.date <= cutoff && 
      (event.impact === 'CRITICAL' || event.impact === 'HIGH')
    );
    
    return {
      hasCriticalEvents: criticalEvents.length > 0,
      events: criticalEvents,
      recommendation: criticalEvents.length > 0 
        ? 'AVOID_NEW_POSITIONS' 
        : 'NORMAL_TRADING'
    };
  }
  
  /**
   * Get trading recommendations based on economic calendar
   */
  getTradingRecommendations() {
    const upcomingEvents = this.getUpcomingEvents(7);
    const criticalCheck = this.checkCriticalEventsAhead(24);
    const marketImpact = this.analyzeMarketImpact();
    
    const recommendations = {
      overall: marketImpact.overall,
      riskLevel: 'MEDIUM',
      positionSizing: 'NORMAL',
      stopLossAdjustment: 1.0,
      avoidTrading: false,
      reasons: []
    };
    
    // Check for critical events
    if (criticalCheck.hasCriticalEvents) {
      recommendations.riskLevel = 'CRITICAL';
      recommendations.positionSizing = 'MINIMAL';
      recommendations.stopLossAdjustment = 0.5;
      recommendations.avoidTrading = true;
      recommendations.reasons.push('Critical economic event within 24 hours');
      
      criticalCheck.events.forEach(event => {
        recommendations.reasons.push(`⚠️ ${event.name}: ${event.tradingAdvice}`);
      });
    }
    
    // Check upcoming high-impact events
    const highImpactEvents = upcomingEvents.filter(e => 
      e.impact === 'HIGH' || e.impact === 'CRITICAL'
    );
    
    if (highImpactEvents.length > 2) {
      recommendations.riskLevel = 'HIGH';
      recommendations.positionSizing = 'REDUCED';
      recommendations.stopLossAdjustment = 0.75;
      recommendations.reasons.push('Multiple high-impact events this week');
    }
    
    // Economic conditions
    if (marketImpact.overall === 'BEARISH') {
      recommendations.reasons.push('Challenging economic environment');
      recommendations.stopLossAdjustment = Math.min(recommendations.stopLossAdjustment, 0.8);
    }
    
    // Volatility from inflation
    if (this.indicators.inflation.current > 4.0) {
      recommendations.riskLevel = 'HIGH';
      recommendations.reasons.push('High inflation increasing market volatility');
    }
    
    return recommendations;
  }
  
  /**
   * Calculate adjusted position size based on economic conditions
   */
  getAdjustedPositionSize(baseSize) {
    const recommendations = this.getTradingRecommendations();
    
    switch (recommendations.positionSizing) {
      case 'MINIMAL':
        return baseSize * 0.25;
      case 'REDUCED':
        return baseSize * 0.5;
      case 'NORMAL':
        return baseSize;
      case 'INCREASED':
        return baseSize * 1.5;
      default:
        return baseSize;
    }
  }
  
  /**
   * Get adjusted stop loss based on economic conditions
   */
  getAdjustedStopLoss(baseStopLoss) {
    const recommendations = this.getTradingRecommendations();
    return baseStopLoss * recommendations.stopLossAdjustment;
  }
  
  /**
   * Check if it's safe to trade based on economic calendar
   */
  isSafeToTrade() {
    const recommendations = this.getTradingRecommendations();
    return !recommendations.avoidTrading;
  }
  
  /**
   * Get economic summary for display
   */
  getEconomicSummary() {
    const marketImpact = this.analyzeMarketImpact();
    const upcomingEvents = this.getUpcomingEvents(7);
    const criticalCheck = this.checkCriticalEventsAhead(24);
    
    return {
      marketSentiment: marketImpact.overall,
      sentimentScore: marketImpact.score,
      keyFactors: marketImpact.factors.slice(0, 3),
      upcomingEvents: upcomingEvents.length,
      criticalEventsAhead: criticalCheck.hasCriticalEvents,
      nextCriticalEvent: criticalCheck.events[0] || null,
      recommendations: marketImpact.recommendations,
      indicators: {
        gdp: {
          value: this.indicators.gdp.current,
          trend: this.indicators.gdp.current > this.indicators.gdp.previous ? 'UP' : 'DOWN',
          impact: this.indicators.gdp.impact
        },
        unemployment: {
          value: this.indicators.unemployment.current,
          trend: this.indicators.unemployment.current < this.indicators.unemployment.previous ? 'DOWN' : 'UP',
          impact: this.indicators.unemployment.impact
        },
        inflation: {
          value: this.indicators.inflation.current,
          trend: this.indicators.inflation.current > this.indicators.inflation.previous ? 'UP' : 'DOWN',
          impact: this.indicators.inflation.impact
        },
        interestRate: {
          value: this.indicators.interestRate.current,
          trend: this.indicators.interestRate.current > this.indicators.interestRate.previous ? 'UP' : 'DOWN',
          impact: this.indicators.interestRate.impact
        }
      }
    };
  }
  
  /**
   * Format date for display
   */
  formatDate(timestamp) {
    const date = new Date(timestamp);
    const today = new Date();
    const diffDays = Math.floor((date - today) / (24 * 60 * 60 * 1000));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    
    return date.toLocaleDateString();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EconomicIndicatorsEngine;
}
