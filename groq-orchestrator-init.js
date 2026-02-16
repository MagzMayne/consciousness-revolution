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
 * File: groq-orchestrator-init.js
 * Declaration ID: IP-100E459C-MLL28ZV0
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * GroqAI Orchestrator Initialization Script
 * 
 * Automatically loads and configures GroqAI as the repo-wide AI orchestrator
 * This script should be loaded in all HTML pages that use AI features
 * 
 * Features:
 * - Automatic key loading from config
 * - Intelligent fallback to other providers
 * - Unified API interface
 * - Performance monitoring
 * - Error handling with retry logic
 * 
 * @author BarbrickDesign Platform Team
 * @version 1.0.0
 */

(async function initializeGroqOrchestrator() {
    // Configuration
    const CONFIG = {
        configUrl: '/groq-orchestrator-config.json',
        enableLogging: true,
        autoRetry: true,
        fallbackProviders: ['openai', 'huggingface'],
        healthCheckInterval: 5 * 60 * 1000, // 5 minutes
    };

    // State
    const state = {
        initialized: false,
        config: null,
        provider: null,
        healthStatus: 'unknown',
        lastHealthCheck: null,
        requestCount: 0,
        errorCount: 0
    };

    /**
     * Log with prefix
     */
    function log(message, type = 'info') {
        if (!CONFIG.enableLogging) return;
        
        const prefix = '🤖 [GroqAI Orchestrator]';
        const styles = {
            info: 'color: #10b981',
            success: 'color: #10b981; font-weight: bold',
            error: 'color: #ef4444; font-weight: bold',
            warn: 'color: #f59e0b'
        };
        
        console.log(`%c${prefix} ${message}`, styles[type] || styles.info);
    }

    /**
     * Load configuration
     */
    async function loadConfig() {
        try {
            const response = await fetch(CONFIG.configUrl);
            if (!response.ok) {
                throw new Error(`Failed to load config: ${response.status}`);
            }
            
            const config = await response.json();
            
            if (!config.enabled) {
                throw new Error('GroqAI orchestrator is disabled in config');
            }
            
            if (!config.apiKey) {
                throw new Error('No API key found in config');
            }
            
            state.config = config;
            log('Configuration loaded successfully', 'success');
            return config;
        } catch (error) {
            log(`Failed to load config: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * Initialize Multi-Provider AI Orchestrator
     */
    async function initializeMultiProvider() {
        // Check if multiAI is already loaded
        if (!window.multiAI) {
            // Load the script dynamically if not present
            log('Loading Multi-Provider AI Orchestrator...', 'info');
            await loadScript('/src/ai/multi-provider-orchestrator.js');
        }

        // Wait for multiAI to be available with setApiKey method
        let attempts = 0;
        while ((!window.multiAI || typeof window.multiAI.setApiKey !== 'function') && attempts < 10) {
            await sleep(100);
            attempts++;
        }

        if (!window.multiAI) {
            throw new Error('Failed to load Multi-Provider AI Orchestrator');
        }

        if (typeof window.multiAI.setApiKey !== 'function') {
            throw new Error('Multi-Provider AI Orchestrator loaded but setApiKey method is not available');
        }

        // Set GroqAI key
        try {
            const result = window.multiAI.setApiKey('groq', state.config.apiKey);
            if (!result.success) {
                throw new Error(result.error || 'Failed to set API key');
            }
            log('GroqAI API key configured', 'success');
        } catch (error) {
            log(`Failed to set API key: ${error.message}`, 'error');
            throw error;
        }

        state.provider = window.multiAI;
        return window.multiAI;
    }

    /**
     * Load script dynamically
     */
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Failed to load ${src}`));
            document.head.appendChild(script);
        });
    }

    /**
     * Sleep utility
     */
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Perform health check
     */
    async function performHealthCheck() {
        if (!state.provider) return;

        try {
            log('Performing health check...', 'info');
            
            const testResult = await state.provider.chatCompletion([
                {
                    role: 'user',
                    content: 'Respond with OK if you can read this message.'
                }
            ], {
                model: state.config.models.chat.fast,
                max_tokens: 10,
                temperature: 0
            });

            if (testResult && testResult.choices && testResult.choices[0]) {
                state.healthStatus = 'healthy';
                state.lastHealthCheck = Date.now();
                log('Health check passed ✓', 'success');
                return true;
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            state.healthStatus = 'unhealthy';
            state.errorCount++;
            log(`Health check failed: ${error.message}`, 'error');
            return false;
        }
    }

    /**
     * Get API wrapper with monitoring
     */
    function getAPIWrapper() {
        if (!state.provider) {
            throw new Error('GroqAI orchestrator not initialized');
        }

        return {
            /**
             * Chat completion with monitoring
             */
            async chat(messages, options = {}) {
                state.requestCount++;
                
                try {
                    const result = await state.provider.chatCompletion(messages, {
                        model: options.model || state.config.models.chat.primary,
                        ...options
                    });
                    
                    return result;
                } catch (error) {
                    state.errorCount++;
                    log(`Chat request failed: ${error.message}`, 'error');
                    throw error;
                }
            },

            /**
             * Transcribe audio
             */
            async transcribe(audioFile, options = {}) {
                state.requestCount++;
                
                try {
                    const formData = new FormData();
                    formData.append('file', audioFile);
                    formData.append('model', options.model || state.config.models.audio.transcription);
                    
                    const response = await fetch(`${state.config.endpoints.baseUrl}${state.config.endpoints.audio}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${state.config.apiKey}`
                        },
                        body: formData
                    });

                    if (!response.ok) {
                        throw new Error(`Transcription failed: ${response.status}`);
                    }

                    return await response.json();
                } catch (error) {
                    state.errorCount++;
                    log(`Transcription failed: ${error.message}`, 'error');
                    throw error;
                }
            },

            /**
             * Get status
             */
            getStatus() {
                return {
                    initialized: state.initialized,
                    healthStatus: state.healthStatus,
                    lastHealthCheck: state.lastHealthCheck,
                    requestCount: state.requestCount,
                    errorCount: state.errorCount,
                    errorRate: state.requestCount > 0 
                        ? ((state.errorCount / state.requestCount) * 100).toFixed(2) + '%'
                        : 'N/A',
                    provider: 'groq',
                    model: state.config?.models?.chat?.primary || 'unknown'
                };
            },

            /**
             * Show dashboard
             */
            showDashboard() {
                const status = this.getStatus();
                console.log('\n🤖 GroqAI Orchestrator Dashboard');
                console.log('═'.repeat(50));
                console.log(`Status: ${status.initialized ? '✅ Initialized' : '❌ Not Initialized'}`);
                console.log(`Health: ${status.healthStatus === 'healthy' ? '✅' : '⚠️'} ${status.healthStatus}`);
                console.log(`Provider: ${status.provider}`);
                console.log(`Primary Model: ${status.model}`);
                console.log(`Requests: ${status.requestCount}`);
                console.log(`Errors: ${status.errorCount}`);
                console.log(`Error Rate: ${status.errorRate}`);
                console.log('═'.repeat(50));
                console.log('\n💡 Usage:');
                console.log('  groqAI.chat([{role:"user", content:"Hello"}])');
                console.log('  groqAI.transcribe(audioFile)');
                console.log('  groqAI.getStatus()');
                console.log('  groqAI.showDashboard()');
                console.log('\n');
            }
        };
    }

    /**
     * Main initialization
     */
    async function initialize() {
        try {
            log('Initializing GroqAI orchestrator...', 'info');

            // Load configuration
            await loadConfig();

            // Initialize multi-provider orchestrator
            await initializeMultiProvider();

            // Perform initial health check
            await performHealthCheck();

            // Set up periodic health checks
            if (CONFIG.healthCheckInterval > 0) {
                setInterval(performHealthCheck, CONFIG.healthCheckInterval);
            }

            // Mark as initialized
            state.initialized = true;
            log('Initialization complete! GroqAI orchestrator ready.', 'success');

            // Expose API wrapper
            window.groqAI = getAPIWrapper();
            
            // Show welcome message
            console.log('%c🚀 GroqAI Orchestrator Ready', 'color: #10b981; font-size: 16px; font-weight: bold');
            console.log('%cType groqAI.showDashboard() to see status', 'color: #6b7280; font-size: 12px');

            return window.groqAI;
        } catch (error) {
            log(`Initialization failed: ${error.message}`, 'error');
            state.initialized = false;
            throw error;
        }
    }

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // Expose initialization function
    window.initializeGroqOrchestrator = initialize;
})();
