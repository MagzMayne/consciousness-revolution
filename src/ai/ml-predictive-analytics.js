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
 * File: ml-predictive-analytics.js
 * Declaration ID: IP-5CA1B431-MLL28ZW2
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * @aul-enabled
 * This file is compatible with AI Universal Language (AUL)
 * Learn more: https://barbrickdesign.github.io/ai-universal-language.html
 */

/**
 * ML-Based Predictive Analytics System with TensorFlow.js
 * Provides predictive insights for various platform operations
 * 
 * Features:
 * - API usage prediction with TensorFlow.js LSTM
 * - User behavior forecasting with neural networks
 * - Resource demand prediction
 * - Performance anomaly detection
 * - Cost optimization recommendations
 * - Fallback to moving average when TensorFlow unavailable
 * 
 * @version 2.0.0
 * @author BarbrickDesign Platform Team
 */

class MLPredictiveAnalytics {
    constructor() {
        this.historicalData = this.loadHistoricalData();
        this.predictions = {
            apiUsage: {},
            userBehavior: {},
            resourceDemand: {},
            costs: {}
        };
        
        // Simple moving average window size
        this.windowSize = 10;
        
        // Anomaly detection threshold (standard deviations)
        this.anomalyThreshold = 2;
        
        // TensorFlow.js integration
        this.tensorFlow = null;
        this.useTensorFlow = true;
        this._initTensorFlow();
    }

    /**
     * Initialize TensorFlow.js integration
     */
    async _initTensorFlow() {
        try {
            // Load TensorFlow utilities if available
            if (typeof TensorFlowUtils !== 'undefined') {
                this.tensorFlow = TensorFlowUtils;
                await this.tensorFlow.initialize();
                console.log('✅ ML Predictive Analytics using TensorFlow.js');
            } else if (typeof require !== 'undefined') {
                try {
                    this.tensorFlow = require('./tensorflow-utils.js');
                    await this.tensorFlow.initialize();
                    console.log('✅ ML Predictive Analytics using TensorFlow.js (Node)');
                } catch (e) {
                    console.warn('TensorFlow.js not available, using statistical methods');
                    this.useTensorFlow = false;
                }
            } else {
                console.warn('TensorFlow.js not available, using statistical methods');
                this.useTensorFlow = false;
            }
        } catch (error) {
            console.warn('Failed to initialize TensorFlow.js:', error);
            this.useTensorFlow = false;
        }
    }

    /**
     * Load historical data for predictions
     */
    loadHistoricalData() {
        try {
            // Browser environment
            if (typeof localStorage !== 'undefined') {
                const data = localStorage.getItem('ml-predictive-data');
                if (data) {
                    return JSON.parse(data);
                }
            }
            // Node.js environment
            else if (typeof require !== 'undefined') {
                try {
                    const fs = require('fs');
                    const path = require('path');
                    const dataPath = path.join(process.cwd(), 'ml-predictive-data.json');
                    if (fs.existsSync(dataPath)) {
                        return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
                    }
                } catch (e) {
                    // File doesn't exist or can't be read
                }
            }
        } catch (error) {
            console.warn('Could not load predictive data:', error);
        }
        
        return {
            apiCalls: [],
            userActivity: [],
            resourceUsage: [],
            costs: [],
            lastUpdate: null
        };
    }

    /**
     * Save historical data
     */
    saveHistoricalData() {
        try {
            this.historicalData.lastUpdate = new Date().toISOString();
            const dataString = JSON.stringify(this.historicalData);
            
            // Browser environment
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('ml-predictive-data', dataString);
            }
            // Node.js environment
            else if (typeof require !== 'undefined') {
                try {
                    const fs = require('fs');
                    const path = require('path');
                    const dataPath = path.join(process.cwd(), 'ml-predictive-data.json');
                    fs.writeFileSync(dataPath, dataString);
                } catch (e) {
                    console.warn('Could not save predictive data to file:', e);
                }
            }
        } catch (error) {
            console.warn('Could not save predictive data:', error);
        }
    }

    /**
     * Record API call for prediction
     */
    recordAPICall(service, endpoint, duration, success) {
        this.historicalData.apiCalls.push({
            service,
            endpoint,
            duration,
            success,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 1000 calls
        if (this.historicalData.apiCalls.length > 1000) {
            this.historicalData.apiCalls = this.historicalData.apiCalls.slice(-1000);
        }
        
        this.saveHistoricalData();
    }

    /**
     * Record user activity
     */
    recordUserActivity(action, userId = 'anonymous') {
        this.historicalData.userActivity.push({
            action,
            userId,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 1000 activities
        if (this.historicalData.userActivity.length > 1000) {
            this.historicalData.userActivity = this.historicalData.userActivity.slice(-1000);
        }
        
        this.saveHistoricalData();
    }

    /**
     * Record resource usage
     */
    recordResourceUsage(type, amount) {
        this.historicalData.resourceUsage.push({
            type,
            amount,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 1000 records
        if (this.historicalData.resourceUsage.length > 1000) {
            this.historicalData.resourceUsage = this.historicalData.resourceUsage.slice(-1000);
        }
        
        this.saveHistoricalData();
    }

    /**
     * Record cost data
     */
    recordCost(service, amount, currency = 'USD') {
        this.historicalData.costs.push({
            service,
            amount,
            currency,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 1000 cost records
        if (this.historicalData.costs.length > 1000) {
            this.historicalData.costs = this.historicalData.costs.slice(-1000);
        }
        
        this.saveHistoricalData();
    }

    /**
     * Predict API usage for next period using TensorFlow.js LSTM
     */
    async predictAPIUsage(service, hoursAhead = 24) {
        const serviceCalls = this.historicalData.apiCalls.filter(
            call => call.service === service
        );
        
        if (serviceCalls.length < this.windowSize) {
            return {
                prediction: 'insufficient_data',
                confidence: 'low',
                estimatedCalls: 0,
                method: 'insufficient-data'
            };
        }
        
        // Try TensorFlow.js prediction first
        if (this.useTensorFlow && this.tensorFlow) {
            try {
                return await this._predictWithTensorFlow(serviceCalls, hoursAhead);
            } catch (error) {
                console.warn('TensorFlow prediction failed, using statistical fallback:', error);
                return this._predictWithStatistics(serviceCalls, hoursAhead);
            }
        } else {
            // Fallback to statistical methods
            return this._predictWithStatistics(serviceCalls, hoursAhead);
        }
    }

    /**
     * Predict using TensorFlow.js time-series models
     */
    async _predictWithTensorFlow(serviceCalls, hoursAhead) {
        // Extract time series data (calls per hour)
        const timeSeries = this._extractTimeSeries(serviceCalls);
        
        // Use TensorFlow.js for prediction
        const tfResult = await this.tensorFlow.predictTimeSeries(timeSeries, hoursAhead);
        
        // Convert predictions to call counts
        const estimatedCalls = Math.round(tfResult.predictions.reduce((a, b) => a + b, 0));
        const avgCallsPerHour = (estimatedCalls / hoursAhead).toFixed(2);
        
        // Calculate hourly distribution
        const hourlyDistribution = this.getHourlyDistribution(serviceCalls.slice(-100));
        
        return {
            service: serviceCalls[0].service,
            hoursAhead,
            estimatedCalls,
            confidence: tfResult.confidence > 0.7 ? 'high' : tfResult.confidence > 0.5 ? 'medium' : 'low',
            avgCallsPerHour,
            peakHours: this.findPeakHours(hourlyDistribution),
            prediction: 'success',
            method: tfResult.method
        };
    }

    /**
     * Extract time series from service calls
     */
    _extractTimeSeries(serviceCalls) {
        // Group calls by hour and count
        const hourlyCount = {};
        serviceCalls.forEach(call => {
            const hour = new Date(call.timestamp).getHours();
            hourlyCount[hour] = (hourlyCount[hour] || 0) + 1;
        });
        
        // Convert to array (fill missing hours with 0)
        const timeSeries = [];
        for (let i = 0; i < 24; i++) {
            timeSeries.push(hourlyCount[i] || 0);
        }
        
        return timeSeries;
    }

    /**
     * Predict using statistical methods (fallback)
     */
    _predictWithStatistics(serviceCalls, hoursAhead) {
        // Calculate hourly averages from recent data
        const recentCalls = serviceCalls.slice(-100);
        const hourlyDistribution = this.getHourlyDistribution(recentCalls);
        
        // Use simple moving average for prediction
        const avgCallsPerHour = this.calculateMovingAverage(
            recentCalls.map(c => 1), // Count each call as 1
            this.windowSize
        );
        
        const estimatedCalls = Math.round(avgCallsPerHour * hoursAhead);
        
        // Calculate confidence based on data consistency
        const variance = this.calculateVariance(recentCalls.map(c => 1));
        const confidence = variance < 0.5 ? 'high' : variance < 1.5 ? 'medium' : 'low';
        
        return {
            service: serviceCalls[0].service,
            hoursAhead,
            estimatedCalls,
            confidence,
            avgCallsPerHour: avgCallsPerHour.toFixed(2),
            peakHours: this.findPeakHours(hourlyDistribution),
            prediction: 'success',
            method: 'moving-average-fallback'
        };
    }

    /**
     * Get hourly distribution of calls
     */
    getHourlyDistribution(calls) {
        const distribution = {};
        
        calls.forEach(call => {
            const hour = new Date(call.timestamp).getHours();
            if (!distribution[hour]) {
                distribution[hour] = 0;
            }
            distribution[hour]++;
        });
        
        return distribution;
    }

    /**
     * Find peak usage hours
     */
    findPeakHours(distribution) {
        const hours = Object.entries(distribution)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([hour, count]) => ({ hour: parseInt(hour), count }));
        
        return hours;
    }

    /**
     * Calculate moving average
     */
    calculateMovingAverage(data, windowSize) {
        if (data.length < windowSize) {
            windowSize = data.length;
        }
        
        const recent = data.slice(-windowSize);
        const sum = recent.reduce((acc, val) => acc + val, 0);
        return sum / windowSize;
    }

    /**
     * Calculate variance
     */
    calculateVariance(data) {
        if (data.length === 0) return 0;
        
        const mean = data.reduce((acc, val) => acc + val, 0) / data.length;
        const squaredDiffs = data.map(val => Math.pow(val - mean, 2));
        return squaredDiffs.reduce((acc, val) => acc + val, 0) / data.length;
    }

    /**
     * Calculate standard deviation
     */
    calculateStdDev(data) {
        return Math.sqrt(this.calculateVariance(data));
    }

    /**
     * Detect anomalies in API performance
     */
    detectAPIAnomalies(service) {
        const serviceCalls = this.historicalData.apiCalls.filter(
            call => call.service === service && call.duration
        );
        
        if (serviceCalls.length < this.windowSize) {
            return {
                anomaliesDetected: false,
                reason: 'insufficient_data'
            };
        }
        
        const durations = serviceCalls.map(call => call.duration);
        const mean = durations.reduce((acc, val) => acc + val, 0) / durations.length;
        const stdDev = this.calculateStdDev(durations);
        
        // Find recent anomalies (last 10 calls)
        const recentCalls = serviceCalls.slice(-10);
        const anomalies = recentCalls.filter(call => {
            const zScore = Math.abs((call.duration - mean) / stdDev);
            return zScore > this.anomalyThreshold;
        });
        
        return {
            anomaliesDetected: anomalies.length > 0,
            count: anomalies.length,
            avgDuration: mean.toFixed(2),
            stdDev: stdDev.toFixed(2),
            threshold: this.anomalyThreshold,
            recentAnomalies: anomalies.map(a => ({
                duration: a.duration,
                timestamp: a.timestamp,
                zScore: ((a.duration - mean) / stdDev).toFixed(2)
            }))
        };
    }

    /**
     * Predict user behavior patterns
     */
    predictUserBehavior() {
        if (this.historicalData.userActivity.length < this.windowSize) {
            return {
                prediction: 'insufficient_data',
                confidence: 'low'
            };
        }
        
        // Analyze action patterns
        const actionCounts = {};
        this.historicalData.userActivity.forEach(activity => {
            if (!actionCounts[activity.action]) {
                actionCounts[activity.action] = 0;
            }
            actionCounts[activity.action]++;
        });
        
        // Find most common actions
        const topActions = Object.entries(actionCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([action, count]) => ({
                action,
                count,
                percentage: ((count / this.historicalData.userActivity.length) * 100).toFixed(1) + '%'
            }));
        
        // Analyze time-based patterns
        const timePatterns = this.analyzeTimePatterns(this.historicalData.userActivity);
        
        return {
            prediction: 'success',
            topActions,
            timePatterns,
            totalActivities: this.historicalData.userActivity.length,
            confidence: this.historicalData.userActivity.length > 50 ? 'high' : 'medium'
        };
    }

    /**
     * Analyze time-based patterns in activity
     */
    analyzeTimePatterns(activities) {
        const hourlyActivity = {};
        const dailyActivity = {};
        
        activities.forEach(activity => {
            const date = new Date(activity.timestamp);
            const hour = date.getHours();
            const day = date.getDay(); // 0 = Sunday, 6 = Saturday
            
            if (!hourlyActivity[hour]) hourlyActivity[hour] = 0;
            if (!dailyActivity[day]) dailyActivity[day] = 0;
            
            hourlyActivity[hour]++;
            dailyActivity[day]++;
        });
        
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        return {
            peakHour: this.findPeak(hourlyActivity),
            peakDay: {
                day: daysOfWeek[this.findPeak(dailyActivity).key],
                count: this.findPeak(dailyActivity).value
            },
            hourlyDistribution: hourlyActivity,
            dailyDistribution: dailyActivity
        };
    }

    /**
     * Find peak value in object
     */
    findPeak(obj) {
        let maxKey = null;
        let maxValue = 0;
        
        Object.entries(obj).forEach(([key, value]) => {
            if (value > maxValue) {
                maxValue = value;
                maxKey = key;
            }
        });
        
        return { key: parseInt(maxKey), value: maxValue };
    }

    /**
     * Predict resource demand using TensorFlow.js
     */
    async predictResourceDemand(type, hoursAhead = 24) {
        const resourceData = this.historicalData.resourceUsage.filter(
            r => r.type === type
        );
        
        if (resourceData.length < this.windowSize) {
            return {
                prediction: 'insufficient_data',
                confidence: 'low',
                method: 'insufficient-data'
            };
        }
        
        const amounts = resourceData.map(r => r.amount);
        
        // Try TensorFlow.js prediction
        if (this.useTensorFlow && this.tensorFlow) {
            try {
                const tfResult = await this.tensorFlow.predictTimeSeries(amounts, hoursAhead);
                
                return {
                    type,
                    currentAverage: amounts.slice(-10).reduce((a, b) => a + b, 0) / 10,
                    trend: tfResult.predictions[hoursAhead - 1] > amounts[amounts.length - 1] ? 'increasing' : 'decreasing',
                    trendRate: ((tfResult.predictions[hoursAhead - 1] - amounts[amounts.length - 1]) / hoursAhead).toFixed(4),
                    predictedAmount: tfResult.predictions[hoursAhead - 1].toFixed(2),
                    hoursAhead,
                    confidence: tfResult.confidence > 0.7 ? 'high' : 'medium',
                    prediction: 'success',
                    method: tfResult.method
                };
            } catch (error) {
                console.warn('TensorFlow resource prediction failed, using statistical fallback:', error);
            }
        }
        
        // Fallback to statistical methods
        const avgAmount = this.calculateMovingAverage(amounts, this.windowSize);
        const trend = this.calculateTrend(amounts.slice(-20));
        const predictedAmount = avgAmount + (trend * hoursAhead);
        
        return {
            type,
            currentAverage: avgAmount.toFixed(2),
            trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
            trendRate: trend.toFixed(4),
            predictedAmount: Math.max(0, predictedAmount).toFixed(2),
            hoursAhead,
            confidence: amounts.length > 50 ? 'high' : 'medium',
            prediction: 'success',
            method: 'linear-regression-fallback'
        };
    }

    /**
     * Calculate simple linear trend
     */
    calculateTrend(data) {
        if (data.length < 2) return 0;
        
        // Simple slope calculation using first and last points
        const n = data.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        
        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += data[i];
            sumXY += i * data[i];
            sumX2 += i * i;
        }
        
        // Calculate slope (trend)
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        return slope;
    }

    /**
     * Predict costs for next period
     */
    predictCosts(service, hoursAhead = 24) {
        const serviceCosts = this.historicalData.costs.filter(
            c => c.service === service
        );
        
        if (serviceCosts.length < 3) {
            return {
                prediction: 'insufficient_data',
                confidence: 'low'
            };
        }
        
        const amounts = serviceCosts.map(c => c.amount);
        const avgCost = amounts.reduce((acc, val) => acc + val, 0) / amounts.length;
        const trend = this.calculateTrend(amounts);
        
        // Predict based on average and trend
        const predictedCost = Math.max(0, avgCost + (trend * hoursAhead));
        
        return {
            service,
            currentAverage: avgCost.toFixed(2),
            predictedCost: predictedCost.toFixed(2),
            trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
            currency: serviceCosts[0].currency || 'USD',
            hoursAhead,
            confidence: amounts.length > 10 ? 'high' : 'medium',
            prediction: 'success'
        };
    }

    /**
     * Get optimization recommendations
     */
    getOptimizationRecommendations() {
        const recommendations = [];
        
        // Analyze API usage patterns
        const apiServices = [...new Set(this.historicalData.apiCalls.map(c => c.service))];
        apiServices.forEach(service => {
            const prediction = this.predictAPIUsage(service);
            if (prediction.prediction === 'success' && prediction.estimatedCalls > 1000) {
                recommendations.push({
                    type: 'api_optimization',
                    service,
                    priority: 'medium',
                    suggestion: `High API usage predicted for ${service}. Consider implementing caching or rate limiting.`,
                    estimatedSavings: 'Potential 20-40% reduction in API calls'
                });
            }
        });
        
        // Analyze cost patterns
        const costServices = [...new Set(this.historicalData.costs.map(c => c.service))];
        costServices.forEach(service => {
            const costPrediction = this.predictCosts(service);
            if (costPrediction.trend === 'increasing') {
                recommendations.push({
                    type: 'cost_optimization',
                    service,
                    priority: 'high',
                    suggestion: `Costs for ${service} are trending upward. Review usage patterns and consider alternatives.`,
                    currentCost: costPrediction.currentAverage,
                    predictedCost: costPrediction.predictedCost
                });
            }
        });
        
        // Check for anomalies
        apiServices.forEach(service => {
            const anomalies = this.detectAPIAnomalies(service);
            if (anomalies.anomaliesDetected) {
                recommendations.push({
                    type: 'performance_issue',
                    service,
                    priority: 'high',
                    suggestion: `Performance anomalies detected for ${service}. ${anomalies.count} recent slow responses.`,
                    details: anomalies
                });
            }
        });
        
        return recommendations;
    }

    /**
     * Generate comprehensive analytics report
     */
    generateReport() {
        const report = {
            generatedAt: new Date().toISOString(),
            dataPoints: {
                apiCalls: this.historicalData.apiCalls.length,
                userActivity: this.historicalData.userActivity.length,
                resourceUsage: this.historicalData.resourceUsage.length,
                costs: this.historicalData.costs.length
            },
            predictions: {
                apiUsage: {},
                userBehavior: this.predictUserBehavior(),
                costs: {}
            },
            anomalies: {},
            recommendations: this.getOptimizationRecommendations()
        };
        
        // Add predictions for each service
        const services = [...new Set(this.historicalData.apiCalls.map(c => c.service))];
        services.forEach(service => {
            report.predictions.apiUsage[service] = this.predictAPIUsage(service);
            report.anomalies[service] = this.detectAPIAnomalies(service);
            report.predictions.costs[service] = this.predictCosts(service);
        });
        
        return report;
    }
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MLPredictiveAnalytics;
} else if (typeof window !== 'undefined') {
    window.MLPredictiveAnalytics = MLPredictiveAnalytics;
}
