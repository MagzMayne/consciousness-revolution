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
 * File: tensorflow-integration.js
 * Declaration ID: IP-76E0C929-MLL28ZW2
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * @aul-enabled
 * TensorFlow.js Integration Script
 * 
 * Add this script to HTML pages that need TensorFlow.js functionality.
 * It provides:
 * - Automatic TensorFlow.js loading
 * - Unified API for ML operations
 * - Status indicators
 * - Error handling and fallbacks
 * 
 * Usage:
 * 1. Include this script in your HTML: <script src="/src/ai/tensorflow-integration.js"></script>
 * 2. Include TensorFlowUtils: <script src="/src/ai/tensorflow-utils.js"></script>
 * 3. Use window.TensorFlowIntegration object to access ML features
 * 
 * @version 1.0.0
 */

(function() {
    'use strict';

    // Main integration object
    const TensorFlowIntegration = {
        initialized: false,
        loading: false,
        utils: null,
        statusElement: null,

        /**
         * Initialize TensorFlow.js integration
         * @param {Object} options - Configuration options
         */
        async init(options = {}) {
            if (this.initialized) {
                console.log('✅ TensorFlow.js already initialized');
                return true;
            }

            if (this.loading) {
                console.log('⏳ TensorFlow.js initialization in progress...');
                return false;
            }

            this.loading = true;
            this.updateStatus('loading', 'Initializing TensorFlow.js...');

            try {
                // Wait for TensorFlowUtils to be available
                await this.waitForUtils();

                // Initialize TensorFlowUtils
                this.utils = window.TensorFlowUtils || TensorFlowUtils;
                await this.utils.initialize();

                this.initialized = true;
                this.loading = false;
                this.updateStatus('ready', 'TensorFlow.js Ready');
                
                console.log('✅ TensorFlow.js Integration initialized');
                
                // Fire custom event
                window.dispatchEvent(new CustomEvent('tensorflow-ready', {
                    detail: { status: this.utils.getStatus() }
                }));

                return true;
            } catch (error) {
                console.error('❌ Failed to initialize TensorFlow.js:', error);
                this.loading = false;
                this.updateStatus('error', 'TensorFlow.js unavailable (using fallback)');
                return false;
            }
        },

        /**
         * Wait for TensorFlowUtils to be loaded
         */
        async waitForUtils(timeout = 10000) {
            const startTime = Date.now();
            
            while (!window.TensorFlowUtils && !window.TensorFlowUtils) {
                if (Date.now() - startTime > timeout) {
                    throw new Error('TensorFlowUtils script not loaded');
                }
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        },

        /**
         * Update status indicator
         */
        updateStatus(status, message) {
            if (!this.statusElement) {
                // Try to find or create status element
                this.statusElement = document.getElementById('tensorflow-status');
                
                if (!this.statusElement && document.body) {
                    this.statusElement = document.createElement('div');
                    this.statusElement.id = 'tensorflow-status';
                    this.statusElement.className = 'tensorflow-status';
                    this.statusElement.style.cssText = `
                        position: fixed;
                        bottom: 20px;
                        right: 20px;
                        padding: 12px 16px;
                        border-radius: 8px;
                        background: rgba(0, 0, 0, 0.8);
                        color: white;
                        font-size: 14px;
                        font-family: system-ui, -apple-system, sans-serif;
                        z-index: 10000;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                        transition: all 0.3s ease;
                    `;
                    document.body.appendChild(this.statusElement);
                }
            }

            if (this.statusElement) {
                let icon = '';
                let color = '';

                switch (status) {
                    case 'loading':
                        icon = '⏳';
                        color = '#ffa500';
                        break;
                    case 'ready':
                        icon = '✅';
                        color = '#4caf50';
                        // Hide after 3 seconds
                        setTimeout(() => {
                            if (this.statusElement) {
                                this.statusElement.style.opacity = '0';
                                setTimeout(() => {
                                    if (this.statusElement && this.statusElement.parentNode) {
                                        this.statusElement.parentNode.removeChild(this.statusElement);
                                        this.statusElement = null;
                                    }
                                }, 300);
                            }
                        }, 3000);
                        break;
                    case 'error':
                        icon = '⚠️';
                        color = '#ff9800';
                        break;
                    default:
                        icon = 'ℹ️';
                        color = '#2196f3';
                }

                this.statusElement.innerHTML = `
                    <span style="font-size: 18px;">${icon}</span>
                    <span>${message}</span>
                `;
                this.statusElement.style.borderLeft = `4px solid ${color}`;
                this.statusElement.style.opacity = '1';
            }
        },

        /**
         * Analyze sentiment of text
         * @param {string} text - Text to analyze
         * @returns {Promise<Object>} Sentiment analysis result
         */
        async analyzeSentiment(text) {
            if (!this.initialized) {
                await this.init();
            }

            try {
                return await this.utils.analyzeSentiment(text);
            } catch (error) {
                console.error('Sentiment analysis error:', error);
                return {
                    score: 0,
                    sentiment: 'neutral',
                    confidence: 0.5,
                    error: error.message
                };
            }
        },

        /**
         * Check text for toxicity
         * @param {string} text - Text to check
         * @returns {Promise<Object>} Toxicity check result
         */
        async checkToxicity(text) {
            if (!this.initialized) {
                await this.init();
            }

            try {
                return await this.utils.checkToxicity(text);
            } catch (error) {
                console.error('Toxicity check error:', error);
                return {
                    toxic: false,
                    predictions: [],
                    error: error.message
                };
            }
        },

        /**
         * Predict time series data
         * @param {Array<number>} data - Historical data points
         * @param {number} steps - Number of steps to predict
         * @returns {Promise<Object>} Prediction result
         */
        async predictTimeSeries(data, steps = 1) {
            if (!this.initialized) {
                await this.init();
            }

            try {
                return await this.utils.predictTimeSeries(data, steps);
            } catch (error) {
                console.error('Time series prediction error:', error);
                return {
                    predictions: [],
                    confidence: 0,
                    error: error.message
                };
            }
        },

        /**
         * Load a custom model
         * @param {string} modelName - Name of the model
         * @param {string} modelUrl - URL to model JSON
         * @returns {Promise<Object>} Loaded model
         */
        async loadModel(modelName, modelUrl) {
            if (!this.initialized) {
                await this.init();
            }

            try {
                return await this.utils.loadModel(modelName, modelUrl);
            } catch (error) {
                console.error('Model loading error:', error);
                throw error;
            }
        },

        /**
         * Get current status of TensorFlow.js
         * @returns {Object} Status object
         */
        getStatus() {
            if (!this.initialized || !this.utils) {
                return {
                    initialized: false,
                    available: false
                };
            }

            return this.utils.getStatus();
        },

        /**
         * Add a demo panel to showcase ML features
         */
        addDemoPanel() {
            if (document.getElementById('tensorflow-demo-panel')) {
                return; // Already exists
            }

            const panel = document.createElement('div');
            panel.id = 'tensorflow-demo-panel';
            panel.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                width: 320px;
                max-height: 400px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
                padding: 16px;
                z-index: 9999;
                font-family: system-ui, -apple-system, sans-serif;
                overflow-y: auto;
            `;

            panel.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h3 style="margin: 0; font-size: 16px; color: #333;">TensorFlow.js ML Demo</h3>
                    <button id="close-demo-panel" style="border: none; background: none; font-size: 20px; cursor: pointer;">×</button>
                </div>
                
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 4px; font-size: 14px; color: #666;">Test Sentiment Analysis:</label>
                    <textarea id="sentiment-input" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; resize: vertical;" rows="3" placeholder="Enter text to analyze..."></textarea>
                    <button id="analyze-btn" style="margin-top: 8px; padding: 8px 16px; background: #4caf50; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">Analyze</button>
                    <div id="sentiment-result" style="margin-top: 8px; font-size: 13px; color: #333;"></div>
                </div>

                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 4px; font-size: 14px; color: #666;">Time Series Prediction:</label>
                    <input id="timeseries-input" type="text" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;" placeholder="Enter numbers: 1,2,3,4,5" />
                    <button id="predict-btn" style="margin-top: 8px; padding: 8px 16px; background: #2196f3; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">Predict Next</button>
                    <div id="prediction-result" style="margin-top: 8px; font-size: 13px; color: #333;"></div>
                </div>

                <div>
                    <div id="ml-status" style="font-size: 12px; color: #999; padding: 8px; background: #f5f5f5; border-radius: 6px;">
                        Initializing...
                    </div>
                </div>
            `;

            document.body.appendChild(panel);

            // Event listeners
            document.getElementById('close-demo-panel').onclick = () => {
                panel.remove();
            };

            document.getElementById('analyze-btn').onclick = async () => {
                const text = document.getElementById('sentiment-input').value;
                const resultEl = document.getElementById('sentiment-result');
                
                if (!text) {
                    resultEl.innerHTML = '<em>Please enter some text</em>';
                    return;
                }

                resultEl.innerHTML = '<em>Analyzing...</em>';
                
                try {
                    const result = await this.analyzeSentiment(text);
                    const emoji = result.sentiment === 'positive' ? '😊' : result.sentiment === 'negative' ? '😞' : '😐';
                    resultEl.innerHTML = `
                        <strong>${emoji} ${result.sentiment.toUpperCase()}</strong><br>
                        Score: ${result.score.toFixed(3)}<br>
                        Confidence: ${(result.confidence * 100).toFixed(1)}%<br>
                        <small>Method: ${result.method || 'unknown'}</small>
                    `;
                } catch (error) {
                    resultEl.innerHTML = `<span style="color: #f44336;">Error: ${error.message}</span>`;
                }
            };

            document.getElementById('predict-btn').onclick = async () => {
                const input = document.getElementById('timeseries-input').value;
                const resultEl = document.getElementById('prediction-result');
                
                if (!input) {
                    resultEl.innerHTML = '<em>Please enter numbers</em>';
                    return;
                }

                try {
                    const data = input.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n));
                    
                    if (data.length < 3) {
                        resultEl.innerHTML = '<em>Please enter at least 3 numbers</em>';
                        return;
                    }

                    resultEl.innerHTML = '<em>Predicting...</em>';
                    
                    const result = await this.predictTimeSeries(data, 3);
                    resultEl.innerHTML = `
                        <strong>Next 3 predictions:</strong><br>
                        ${result.predictions.map(p => p.toFixed(2)).join(', ')}<br>
                        Confidence: ${(result.confidence * 100).toFixed(1)}%<br>
                        <small>Method: ${result.method || 'unknown'}</small>
                    `;
                } catch (error) {
                    resultEl.innerHTML = `<span style="color: #f44336;">Error: ${error.message}</span>`;
                }
            };

            // Update status
            const updateStatus = async () => {
                const status = this.getStatus();
                const statusEl = document.getElementById('ml-status');
                
                if (statusEl) {
                    if (status.initialized) {
                        statusEl.innerHTML = `
                            ✅ <strong>TensorFlow.js Active</strong><br>
                            Backend: ${status.backend || 'unknown'}<br>
                            Models: USE ${status.modelsLoaded.universalEncoder ? '✅' : '❌'}, 
                            Toxicity ${status.modelsLoaded.toxicity ? '✅' : '❌'}
                        `;
                    } else {
                        statusEl.innerHTML = '⏳ Initializing TensorFlow.js...';
                    }
                }
            };

            updateStatus();
            setInterval(updateStatus, 2000);
        }
    };

    // Auto-initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            TensorFlowIntegration.init().catch(console.error);
        });
    } else {
        TensorFlowIntegration.init().catch(console.error);
    }

    // Expose to global scope
    window.TensorFlowIntegration = TensorFlowIntegration;

    console.log('📦 TensorFlow.js Integration script loaded');
})();
