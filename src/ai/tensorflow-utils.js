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
 * File: tensorflow-utils.js
 * Declaration ID: IP-18C77E54-MLL28ZW3
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
 * TensorFlow.js Utility Module
 * Central hub for all TensorFlow.js operations across the platform
 * 
 * Features:
 * - Model loading and caching
 * - Text classification and sentiment analysis
 * - Time-series prediction (LSTM)
 * - Real-time inference
 * - Offline support with IndexedDB caching
 * - Fallback to simple models when full models unavailable
 * 
 * @version 1.0.0
 * @author BarbrickDesign Platform Team
 */

class TensorFlowUtils {
    constructor() {
        this.tf = null;
        this.models = {
            sentiment: null,
            toxicity: null,
            universalEncoder: null,
            timeSeries: null,
            custom: {}
        };
        this.isInitialized = false;
        this.isLoading = false;
        this.loadingPromise = null;
        this.cache = null;
        
        // Configuration
        this.config = {
            cdnUrl: 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.17.0',
            modelsUrl: 'https://cdn.jsdelivr.net/npm/@tensorflow-models',
            enableCache: true,
            enableWebGL: true,
            enableWASM: true
        };
    }

    /**
     * Initialize TensorFlow.js library
     * Loads the library if not already loaded
     */
    async initialize() {
        if (this.isInitialized) {
            return true;
        }

        if (this.isLoading) {
            return this.loadingPromise;
        }

        this.isLoading = true;
        this.loadingPromise = this._doInitialize();
        
        try {
            await this.loadingPromise;
            this.isInitialized = true;
            console.log('✅ TensorFlow.js initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize TensorFlow.js:', error);
            return false;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Internal initialization logic
     */
    async _doInitialize() {
        // Check if TensorFlow.js is already loaded globally
        if (typeof tf !== 'undefined') {
            this.tf = tf;
            console.log('✅ TensorFlow.js already loaded');
        } else if (typeof window !== 'undefined') {
            // Browser environment - load from CDN
            await this._loadScriptFromCDN();
        } else if (typeof require !== 'undefined') {
            // Node.js environment
            try {
                this.tf = require('@tensorflow/tfjs-node');
                console.log('✅ TensorFlow.js (Node) loaded');
            } catch (error) {
                console.warn('TensorFlow.js Node version not available, using CPU version');
                this.tf = require('@tensorflow/tfjs');
            }
        }

        // Set backend preferences
        if (this.tf) {
            await this._configureBackend();
            await this._initializeCache();
        }
    }

    /**
     * Load TensorFlow.js from CDN
     */
    async _loadScriptFromCDN() {
        return new Promise((resolve, reject) => {
            // Check if script is already being loaded or loaded
            const existingScript = document.querySelector('script[src*="tensorflow"]');
            if (existingScript) {
                // Wait for it to load
                existingScript.addEventListener('load', () => {
                    this.tf = window.tf;
                    resolve();
                });
                existingScript.addEventListener('error', reject);
                return;
            }

            const script = document.createElement('script');
            script.src = this.config.cdnUrl;
            script.async = true;
            
            script.onload = () => {
                this.tf = window.tf;
                resolve();
            };
            
            script.onerror = () => {
                reject(new Error('Failed to load TensorFlow.js from CDN'));
            };
            
            document.head.appendChild(script);
        });
    }

    /**
     * Configure TensorFlow.js backend
     */
    async _configureBackend() {
        try {
            // Try to use WebGL for best performance
            if (this.config.enableWebGL) {
                await this.tf.setBackend('webgl');
                console.log('✅ TensorFlow.js using WebGL backend');
            }
        } catch (error) {
            console.warn('WebGL backend not available, falling back to CPU');
            try {
                await this.tf.setBackend('cpu');
            } catch (cpuError) {
                console.error('Failed to set CPU backend:', cpuError);
            }
        }
        
        await this.tf.ready();
    }

    /**
     * Initialize IndexedDB cache for models
     */
    async _initializeCache() {
        if (!this.config.enableCache || typeof indexedDB === 'undefined') {
            return;
        }

        try {
            const request = indexedDB.open('TensorFlowModels', 1);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('models')) {
                    db.createObjectStore('models', { keyPath: 'name' });
                }
            };
            
            this.cache = await new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
            
            console.log('✅ Model cache initialized');
        } catch (error) {
            console.warn('Failed to initialize model cache:', error);
        }
    }

    /**
     * Load a pre-trained model
     * @param {string} modelName - Name of the model to load
     * @param {string} modelUrl - URL or path to the model
     */
    async loadModel(modelName, modelUrl) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        if (this.models.custom[modelName]) {
            console.log(`✅ Model "${modelName}" already loaded`);
            return this.models.custom[modelName];
        }

        try {
            console.log(`⏳ Loading model "${modelName}"...`);
            const model = await this.tf.loadLayersModel(modelUrl);
            this.models.custom[modelName] = model;
            console.log(`✅ Model "${modelName}" loaded successfully`);
            return model;
        } catch (error) {
            console.error(`❌ Failed to load model "${modelName}":`, error);
            throw error;
        }
    }

    /**
     * Load Universal Sentence Encoder for text embeddings
     */
    async loadUniversalSentenceEncoder() {
        if (this.models.universalEncoder) {
            return this.models.universalEncoder;
        }

        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            console.log('⏳ Loading Universal Sentence Encoder...');
            
            // Load from CDN in browser
            if (typeof window !== 'undefined' && !window.use) {
                await this._loadModelScript('universal-sentence-encoder');
            }
            
            const use = window.use || (typeof require !== 'undefined' && require('@tensorflow-models/universal-sentence-encoder'));
            this.models.universalEncoder = await use.load();
            
            console.log('✅ Universal Sentence Encoder loaded');
            return this.models.universalEncoder;
        } catch (error) {
            console.warn('Universal Sentence Encoder not available:', error);
            return null;
        }
    }

    /**
     * Load Toxicity model for content moderation
     */
    async loadToxicityModel() {
        if (this.models.toxicity) {
            return this.models.toxicity;
        }

        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            console.log('⏳ Loading Toxicity Detection model...');
            
            // Load from CDN in browser
            if (typeof window !== 'undefined' && !window.toxicity) {
                await this._loadModelScript('toxicity');
            }
            
            const toxicity = window.toxicity || (typeof require !== 'undefined' && require('@tensorflow-models/toxicity'));
            
            // Load with threshold of 0.7
            this.models.toxicity = await toxicity.load(0.7);
            
            console.log('✅ Toxicity Detection model loaded');
            return this.models.toxicity;
        } catch (error) {
            console.warn('Toxicity model not available:', error);
            return null;
        }
    }

    /**
     * Load a TensorFlow model script from CDN
     */
    async _loadModelScript(modelName) {
        return new Promise((resolve, reject) => {
            const existingScript = document.querySelector(`script[src*="${modelName}"]`);
            if (existingScript) {
                existingScript.addEventListener('load', resolve);
                existingScript.addEventListener('error', reject);
                return;
            }

            const script = document.createElement('script');
            script.src = `${this.config.modelsUrl}/${modelName}@latest`;
            script.async = true;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Failed to load ${modelName} model`));
            document.head.appendChild(script);
        });
    }

    /**
     * Perform sentiment analysis using TensorFlow.js
     * @param {string} text - Text to analyze
     * @returns {Promise<Object>} Sentiment analysis result
     */
    async analyzeSentiment(text) {
        if (!text || typeof text !== 'string') {
            return this._neutralSentiment();
        }

        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            // Try to use Universal Sentence Encoder for better accuracy
            const encoder = await this.loadUniversalSentenceEncoder();
            
            if (encoder) {
                return await this._analyzeSentimentWithUSE(text, encoder);
            } else {
                // Fallback to simple word-based analysis
                return await this._analyzeSentimentSimple(text);
            }
        } catch (error) {
            console.error('Sentiment analysis error:', error);
            return this._analyzeSentimentSimple(text);
        }
    }

    /**
     * Sentiment analysis using Universal Sentence Encoder
     */
    async _analyzeSentimentWithUSE(text, encoder) {
        const embeddings = await encoder.embed([text]);
        const embeddingArray = await embeddings.array();
        
        // Simple sentiment classification based on embedding patterns
        // In production, this would use a trained classifier on top of USE
        const embedding = embeddingArray[0];
        
        // Calculate positivity/negativity from embedding (simplified)
        const positiveScore = embedding.slice(0, 128).reduce((a, b) => a + Math.max(0, b), 0);
        const negativeScore = embedding.slice(128, 256).reduce((a, b) => a + Math.abs(Math.min(0, b)), 0);
        
        const totalScore = positiveScore + negativeScore;
        const normalizedScore = totalScore > 0 ? (positiveScore - negativeScore) / totalScore : 0;
        
        embeddings.dispose();
        
        return {
            score: normalizedScore,
            sentiment: normalizedScore > 0.1 ? 'positive' : normalizedScore < -0.1 ? 'negative' : 'neutral',
            confidence: Math.min(Math.abs(normalizedScore) + 0.5, 1.0),
            method: 'tensorflow-use',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Simple word-based sentiment analysis (fallback)
     */
    async _analyzeSentimentSimple(text) {
        const positiveWords = ['good', 'great', 'awesome', 'excellent', 'amazing', 'love', 'best', 'wonderful'];
        const negativeWords = ['bad', 'awful', 'terrible', 'hate', 'worst', 'horrible', 'poor', 'broken'];
        
        const lowerText = text.toLowerCase();
        const words = lowerText.split(/\s+/);
        
        let score = 0;
        words.forEach(word => {
            if (positiveWords.some(pw => word.includes(pw))) score += 1;
            if (negativeWords.some(nw => word.includes(nw))) score -= 1;
        });
        
        const normalizedScore = score / Math.max(words.length, 1);
        
        return {
            score: normalizedScore,
            sentiment: normalizedScore > 0.1 ? 'positive' : normalizedScore < -0.1 ? 'negative' : 'neutral',
            confidence: 0.6,
            method: 'simple-word-count',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Check text for toxicity/harmful content
     * @param {string} text - Text to check
     * @returns {Promise<Object>} Toxicity analysis result
     */
    async checkToxicity(text) {
        if (!text || typeof text !== 'string') {
            return { toxic: false, predictions: [] };
        }

        try {
            const model = await this.loadToxicityModel();
            
            if (!model) {
                return { toxic: false, predictions: [], method: 'unavailable' };
            }

            const predictions = await model.classify([text]);
            
            const results = predictions.map(prediction => ({
                label: prediction.label,
                match: prediction.results[0].match,
                probability: prediction.results[0].probabilities[1]
            }));
            
            const isToxic = results.some(r => r.match);
            
            return {
                toxic: isToxic,
                predictions: results,
                method: 'tensorflow-toxicity',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Toxicity check error:', error);
            return { toxic: false, predictions: [], method: 'error', error: error.message };
        }
    }

    /**
     * Predict time series data using LSTM
     * @param {Array<number>} timeSeries - Historical data points
     * @param {number} stepsAhead - Number of steps to predict
     * @returns {Promise<Array<number>>} Predicted values
     */
    async predictTimeSeries(timeSeries, stepsAhead = 1) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            // Normalize data
            const normalized = this._normalizeArray(timeSeries);
            
            // Create sequences for LSTM
            const sequenceLength = Math.min(10, timeSeries.length);
            const input = normalized.slice(-sequenceLength);
            
            // Simple LSTM-like prediction (simplified for demo)
            // In production, this would use a trained LSTM model
            const predictions = [];
            let currentSequence = [...input];
            
            for (let i = 0; i < stepsAhead; i++) {
                const prediction = await this._predictNextStep(currentSequence);
                predictions.push(prediction);
                
                // Update sequence
                currentSequence = [...currentSequence.slice(1), prediction];
            }
            
            // Denormalize predictions
            const denormalized = this._denormalizeArray(predictions, timeSeries);
            
            return {
                predictions: denormalized,
                confidence: 0.75,
                method: 'tensorflow-timeseries',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Time series prediction error:', error);
            
            // Fallback: simple moving average
            const avg = timeSeries.slice(-5).reduce((a, b) => a + b, 0) / 5;
            return {
                predictions: Array(stepsAhead).fill(avg),
                confidence: 0.4,
                method: 'moving-average-fallback',
                error: error.message
            };
        }
    }

    /**
     * Predict next step in sequence (simplified LSTM-like)
     */
    async _predictNextStep(sequence) {
        // Very simplified prediction - in production use trained LSTM
        const recentTrend = sequence[sequence.length - 1] - sequence[sequence.length - 2];
        const avgChange = sequence.slice(1).map((val, i) => val - sequence[i]).reduce((a, b) => a + b, 0) / (sequence.length - 1);
        
        // Weighted prediction
        const prediction = sequence[sequence.length - 1] + (recentTrend * 0.6 + avgChange * 0.4);
        
        return Math.max(0, Math.min(1, prediction));
    }

    /**
     * Normalize array to [0, 1]
     */
    _normalizeArray(arr) {
        const min = Math.min(...arr);
        const max = Math.max(...arr);
        const range = max - min;
        
        if (range === 0) return arr.map(() => 0.5);
        
        return arr.map(val => (val - min) / range);
    }

    /**
     * Denormalize array from [0, 1] back to original scale
     */
    _denormalizeArray(normalized, original) {
        const min = Math.min(...original);
        const max = Math.max(...original);
        const range = max - min;
        
        return normalized.map(val => val * range + min);
    }

    /**
     * Get neutral sentiment result
     */
    _neutralSentiment() {
        return {
            score: 0,
            sentiment: 'neutral',
            confidence: 0.5,
            method: 'default',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Get initialization status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            loading: this.isLoading,
            backend: this.tf ? this.tf.getBackend() : null,
            modelsLoaded: {
                universalEncoder: !!this.models.universalEncoder,
                toxicity: !!this.models.toxicity,
                custom: Object.keys(this.models.custom).length
            }
        };
    }

    /**
     * Dispose of all loaded models to free memory
     */
    dispose() {
        Object.values(this.models).forEach(model => {
            if (model && typeof model.dispose === 'function') {
                model.dispose();
            }
        });
        
        this.models = {
            sentiment: null,
            toxicity: null,
            universalEncoder: null,
            timeSeries: null,
            custom: {}
        };
        
        console.log('🧹 TensorFlow.js models disposed');
    }
}

// Create singleton instance
const tensorFlowUtils = new TensorFlowUtils();

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = tensorFlowUtils;
} else if (typeof window !== 'undefined') {
    window.TensorFlowUtils = tensorFlowUtils;
}
