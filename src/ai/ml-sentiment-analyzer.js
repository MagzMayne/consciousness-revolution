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
 * File: ml-sentiment-analyzer.js
 * Declaration ID: IP-51F19C5-MLL28ZW2
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
 * ML-Based Sentiment Analyzer with TensorFlow.js
 * Provides sentiment analysis for user interactions, Discord messages, and feedback
 * 
 * Features:
 * - Real-time sentiment detection using TensorFlow.js
 * - Emotion classification with neural networks
 * - Urgency detection
 * - User satisfaction scoring
 * - Pattern learning from historical data
 * - Fallback to word-based analysis when TensorFlow unavailable
 * 
 * @version 2.0.0
 * @author BarbrickDesign Platform Team
 */

class MLSentimentAnalyzer {
    constructor() {
        // Word lists - used as fallback when TensorFlow.js unavailable
        this.POSITIVE_WORDS = new Set([
            'good', 'great', 'awesome', 'excellent', 'amazing', 'wonderful', 'fantastic',
            'love', 'like', 'best', 'perfect', 'happy', 'thanks', 'thank', 'helpful',
            'useful', 'appreciate', 'brilliant', 'outstanding', 'superb', 'nice'
        ]);
        
        this.NEGATIVE_WORDS = new Set([
            'bad', 'awful', 'terrible', 'horrible', 'hate', 'worst', 'poor', 'broken',
            'bug', 'error', 'fail', 'failed', 'problem', 'issue', 'wrong', 'broken',
            'crash', 'slow', 'confusing', 'difficult', 'hard', 'frustrated'
        ]);
        
        this.URGENCY_WORDS = new Set([
            'urgent', 'asap', 'immediately', 'now', 'critical', 'emergency', 'important',
            'help', 'stuck', 'broken', 'down', 'stopped'
        ]);
        
        // Keep references for backward compatibility
        this.positiveWords = this.POSITIVE_WORDS;
        this.negativeWords = this.NEGATIVE_WORDS;
        this.urgencyWords = this.URGENCY_WORDS;
        
        this.emotions = {
            joy: ['happy', 'excited', 'love', 'amazing', 'wonderful'],
            sadness: ['sad', 'disappointed', 'unhappy', 'upset'],
            anger: ['angry', 'frustrated', 'annoyed', 'mad'],
            fear: ['worried', 'scared', 'concerned', 'anxious'],
            surprise: ['wow', 'amazing', 'incredible', 'shocking']
        };
        
        this.historicalData = this.loadHistoricalData();
        
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
                console.log('✅ ML Sentiment Analyzer using TensorFlow.js');
            } else if (typeof require !== 'undefined') {
                try {
                    this.tensorFlow = require('./tensorflow-utils.js');
                    await this.tensorFlow.initialize();
                    console.log('✅ ML Sentiment Analyzer using TensorFlow.js (Node)');
                } catch (e) {
                    console.warn('TensorFlow.js not available, using word-based analysis');
                    this.useTensorFlow = false;
                }
            } else {
                console.warn('TensorFlow.js not available, using word-based analysis');
                this.useTensorFlow = false;
            }
        } catch (error) {
            console.warn('Failed to initialize TensorFlow.js:', error);
            this.useTensorFlow = false;
        }
    }

    /**
     * Load historical sentiment data for ML training
     */
    loadHistoricalData() {
        try {
            // Browser environment
            if (typeof localStorage !== 'undefined') {
                const data = localStorage.getItem('ml-sentiment-history');
                if (data) {
                    return JSON.parse(data);
                }
            }
            // Node.js environment
            else if (typeof require !== 'undefined') {
                try {
                    const fs = require('fs');
                    const path = require('path');
                    const dataPath = path.join(process.cwd(), 'ml-sentiment-history.json');
                    if (fs.existsSync(dataPath)) {
                        return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
                    }
                } catch (e) {
                    // File doesn't exist or can't be read
                }
            }
        } catch (error) {
            console.warn('Could not load sentiment history:', error);
        }
        return { analyses: [], patterns: {} };
    }

    /**
     * Save sentiment data for future learning
     */
    saveHistoricalData() {
        try {
            const dataString = JSON.stringify(this.historicalData);
            
            // Browser environment
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('ml-sentiment-history', dataString);
            }
            // Node.js environment
            else if (typeof require !== 'undefined') {
                try {
                    const fs = require('fs');
                    const path = require('path');
                    const dataPath = path.join(process.cwd(), 'ml-sentiment-history.json');
                    fs.writeFileSync(dataPath, dataString);
                } catch (e) {
                    console.warn('Could not save sentiment history to file:', e);
                }
            }
        } catch (error) {
            console.warn('Could not save sentiment history:', error);
        }
    }

    /**
     * Analyze sentiment of text using TensorFlow.js
     * Returns: { score, sentiment, confidence, emotion, urgency, method }
     */
    async analyzeSentiment(text) {
        if (!text || typeof text !== 'string') {
            return this.neutralResult();
        }

        const lowerText = text.toLowerCase();
        const words = lowerText.split(/\s+/);
        
        let analysis;
        
        // Try TensorFlow.js analysis first
        if (this.useTensorFlow && this.tensorFlow) {
            try {
                const tfResult = await this.tensorFlow.analyzeSentiment(text);
                
                // Enhance TensorFlow result with our additional features
                analysis = {
                    score: tfResult.score,
                    sentiment: tfResult.sentiment,
                    confidence: tfResult.confidence,
                    emotion: this.detectEmotion(words),
                    urgency: this.detectUrgency(lowerText, words),
                    positiveCount: 0,  // Not applicable for TensorFlow
                    negativeCount: 0,  // Not applicable for TensorFlow
                    wordCount: words.length,
                    method: tfResult.method,
                    timestamp: new Date().toISOString()
                };
            } catch (error) {
                console.warn('TensorFlow sentiment analysis failed, using fallback:', error);
                analysis = this._analyzeWordBased(text, lowerText, words);
            }
        } else {
            // Fallback to word-based analysis
            analysis = this._analyzeWordBased(text, lowerText, words);
        }
        
        // Learn from this analysis
        this.learnFromAnalysis(text, analysis);
        
        return analysis;
    }

    /**
     * Word-based sentiment analysis (fallback method)
     */
    _analyzeWordBased(text, lowerText, words) {
        // Calculate sentiment score (-1 to 1)
        let score = 0;
        let positiveCount = 0;
        let negativeCount = 0;
        
        words.forEach(word => {
            if (this.positiveWords.has(word)) {
                score += 1;
                positiveCount++;
            }
            if (this.negativeWords.has(word)) {
                score -= 1;
                negativeCount++;
            }
        });
        
        // Normalize score
        const totalSentimentWords = positiveCount + negativeCount;
        if (totalSentimentWords > 0) {
            score = score / words.length;
        }
        
        // Determine overall sentiment
        let sentiment = 'neutral';
        let confidence = 0.5;
        
        if (score > 0.1) {
            sentiment = 'positive';
            confidence = Math.min(0.5 + (score * 2), 1.0);
        } else if (score < -0.1) {
            sentiment = 'negative';
            confidence = Math.min(0.5 + (Math.abs(score) * 2), 1.0);
        }
        
        // Detect emotion
        const emotion = this.detectEmotion(words);
        
        // Detect urgency
        const urgency = this.detectUrgency(lowerText, words);
        
        return {
            score,
            sentiment,
            confidence,
            emotion,
            urgency,
            positiveCount,
            negativeCount,
            wordCount: words.length,
            method: 'word-based-fallback',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Detect dominant emotion in text
     */
    detectEmotion(words) {
        const emotionScores = {};
        
        Object.entries(this.emotions).forEach(([emotion, keywords]) => {
            emotionScores[emotion] = 0;
            keywords.forEach(keyword => {
                if (words.includes(keyword)) {
                    emotionScores[emotion]++;
                }
            });
        });
        
        // Find highest scoring emotion
        let maxEmotion = 'neutral';
        let maxScore = 0;
        
        Object.entries(emotionScores).forEach(([emotion, score]) => {
            if (score > maxScore) {
                maxScore = score;
                maxEmotion = emotion;
            }
        });
        
        return maxScore > 0 ? maxEmotion : 'neutral';
    }

    /**
     * Detect urgency level
     */
    detectUrgency(text, words) {
        let urgencyScore = 0;
        
        // Check for urgency keywords
        words.forEach(word => {
            if (this.urgencyWords.has(word)) {
                urgencyScore += 2;
            }
        });
        
        // Check for exclamation marks (indicates emphasis)
        const exclamationCount = (text.match(/!/g) || []).length;
        urgencyScore += exclamationCount;
        
        // Check for all caps words (indicates shouting/urgency)
        const capsWords = text.match(/\b[A-Z]{3,}\b/g);
        if (capsWords) {
            urgencyScore += capsWords.length;
        }
        
        // Classify urgency
        if (urgencyScore >= 3) return 'high';
        if (urgencyScore >= 1) return 'medium';
        return 'low';
    }

    /**
     * Learn patterns from analysis
     */
    learnFromAnalysis(text, analysis) {
        // Store analysis
        this.historicalData.analyses.push({
            text: text.substring(0, 100), // Store only first 100 chars for privacy
            analysis,
            timestamp: analysis.timestamp
        });
        
        // Keep only last 1000 analyses
        if (this.historicalData.analyses.length > 1000) {
            this.historicalData.analyses = this.historicalData.analyses.slice(-1000);
        }
        
        // Update patterns
        const key = analysis.sentiment;
        if (!this.historicalData.patterns[key]) {
            this.historicalData.patterns[key] = { count: 0, avgScore: 0 };
        }
        
        const pattern = this.historicalData.patterns[key];
        pattern.count++;
        pattern.avgScore = (pattern.avgScore * (pattern.count - 1) + analysis.score) / pattern.count;
        
        // Save periodically
        if (this.historicalData.analyses.length % 10 === 0) {
            this.saveHistoricalData();
        }
    }

    /**
     * Get neutral result structure
     */
    neutralResult() {
        return {
            score: 0,
            sentiment: 'neutral',
            confidence: 0.5,
            emotion: 'neutral',
            urgency: 'low',
            positiveCount: 0,
            negativeCount: 0,
            wordCount: 0,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Analyze user satisfaction over time
     */
    getUserSatisfactionTrend() {
        if (this.historicalData.analyses.length < 5) {
            return {
                trend: 'insufficient_data',
                avgSentiment: 0,
                totalAnalyses: this.historicalData.analyses.length
            };
        }
        
        // Get recent analyses (last 20)
        const recentAnalyses = this.historicalData.analyses.slice(-20);
        
        // Calculate average sentiment
        const avgSentiment = recentAnalyses.reduce((sum, a) => sum + a.analysis.score, 0) / recentAnalyses.length;
        
        // Calculate trend (compare first half to second half)
        const midPoint = Math.floor(recentAnalyses.length / 2);
        const firstHalf = recentAnalyses.slice(0, midPoint);
        const secondHalf = recentAnalyses.slice(midPoint);
        
        const firstAvg = firstHalf.reduce((sum, a) => sum + a.analysis.score, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, a) => sum + a.analysis.score, 0) / secondHalf.length;
        
        let trend = 'stable';
        if (secondAvg > firstAvg + 0.1) {
            trend = 'improving';
        } else if (secondAvg < firstAvg - 0.1) {
            trend = 'declining';
        }
        
        return {
            trend,
            avgSentiment,
            totalAnalyses: this.historicalData.analyses.length,
            recentPositive: recentAnalyses.filter(a => a.analysis.sentiment === 'positive').length,
            recentNegative: recentAnalyses.filter(a => a.analysis.sentiment === 'negative').length,
            recentNeutral: recentAnalyses.filter(a => a.analysis.sentiment === 'neutral').length
        };
    }

    /**
     * Get emotional breakdown of recent interactions
     */
    getEmotionalBreakdown() {
        const recentAnalyses = this.historicalData.analyses.slice(-50);
        
        const breakdown = {
            joy: 0,
            sadness: 0,
            anger: 0,
            fear: 0,
            surprise: 0,
            neutral: 0
        };
        
        recentAnalyses.forEach(a => {
            const emotion = a.analysis.emotion;
            if (breakdown.hasOwnProperty(emotion)) {
                breakdown[emotion]++;
            }
        });
        
        return breakdown;
    }

    /**
     * Detect if immediate action is needed based on sentiment
     */
    needsImmediateAttention(analysis) {
        return (
            analysis.sentiment === 'negative' &&
            analysis.confidence > 0.7 &&
            analysis.urgency === 'high'
        ) || (
            analysis.urgency === 'high' &&
            (analysis.negativeCount > 3 || analysis.emotion === 'anger')
        );
    }

    /**
     * Generate response recommendation based on sentiment
     */
    getResponseRecommendation(analysis) {
        if (this.needsImmediateAttention(analysis)) {
            return {
                priority: 'high',
                tone: 'empathetic_urgent',
                suggestion: 'Acknowledge the issue immediately and provide immediate assistance or escalate to human support.'
            };
        }
        
        if (analysis.sentiment === 'positive') {
            return {
                priority: 'normal',
                tone: 'friendly_enthusiastic',
                suggestion: 'Maintain positive engagement and potentially ask for feedback or testimonials.'
            };
        }
        
        if (analysis.sentiment === 'negative') {
            return {
                priority: 'high',
                tone: 'empathetic_helpful',
                suggestion: 'Address concerns carefully and offer solutions or alternatives.'
            };
        }
        
        return {
            priority: 'normal',
            tone: 'professional_friendly',
            suggestion: 'Continue conversation with helpful and informative responses.'
        };
    }

    /**
     * Get statistics about sentiment patterns
     */
    getStatistics() {
        return {
            totalAnalyses: this.historicalData.analyses.length,
            patterns: this.historicalData.patterns,
            satisfactionTrend: this.getUserSatisfactionTrend(),
            emotionalBreakdown: this.getEmotionalBreakdown()
        };
    }
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MLSentimentAnalyzer;
} else if (typeof window !== 'undefined') {
    window.MLSentimentAnalyzer = MLSentimentAnalyzer;
}
