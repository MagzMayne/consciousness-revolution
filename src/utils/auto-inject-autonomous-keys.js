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
 * File: auto-inject-autonomous-keys.js
 * Declaration ID: IP-246416BC-MLL28ZWD
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
 * AUTO-INJECT AUTONOMOUS API KEY MANAGER
 * 
 * Automatically injects the autonomous API key manager into existing API systems.
 * Provides seamless integration without requiring code changes.
 * 
 * Features:
 * - Automatic injection on page load
 * - Backward compatibility with existing code
 * - Global window object integration
 * - Wrapper functions for common use cases
 * 
 * @author BarbrickDesign Platform Team
 * @version 1.0.0
 */

(function() {
    'use strict';
    
    // Check if already loaded
    if (typeof window !== 'undefined' && window.__autonomousAPIKeyManagerLoaded) {
        console.log('AutonomousAPIKeyManager already loaded');
        return;
    }
    
    // Load dependencies in order
    const dependencies = [
        '/src/utils/api-key-validator.js',
        '/src/pool/api-key-pool-manager.js',
        '/src/utils/known-working-keys-registry.js',
        '/src/utils/autonomous-api-key-manager.js',
        '/src/ui/api-key-fallback-ui.js',
        '/src/utils/api-key-auto-patcher.js'
    ];
    
    /**
     * Load script dynamically
     */
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            const existing = document.querySelector(`script[src="${src}"]`);
            if (existing) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.async = false; // Maintain order
            script.onload = resolve;
            script.onerror = () => {
                console.warn(`Failed to load ${src}, continuing anyway`);
                resolve(); // Continue even if optional dependency fails
            };
            document.head.appendChild(script);
        });
    }
    
    /**
     * Initialize the autonomous manager
     */
    async function initialize() {
        // Load all dependencies
        for (const dep of dependencies) {
            await loadScript(dep);
        }
        
        // Create global instance
        if (typeof window !== 'undefined' && window.AutonomousAPIKeyManager) {
            window.autonomousAPIKeyManager = new window.AutonomousAPIKeyManager();
            
            // Add convenience methods to window
            window.getAPIKey = async (serviceId, options = {}) => {
                return await window.autonomousAPIKeyManager.getAPIKey(serviceId, options);
            };
            
            window.setAPIKey = (serviceId, key) => {
                return window.autonomousAPIKeyManager.setAPIKey(serviceId, key);
            };
            
            window.executeWithRetry = async (serviceId, apiCallFn, options = {}) => {
                return await window.autonomousAPIKeyManager.executeWithRetry(serviceId, apiCallFn, options);
            };
            
            // Helper to get key or prompt user
            window.getAPIKeyOrPrompt = async (serviceId, options = {}) => {
                const result = await window.getAPIKey(serviceId, options);
                
                if (result.success) {
                    return result;
                }
                
                // Show fallback UI if available
                if (window.apiKeyFallbackUI) {
                    const uiResult = await window.apiKeyFallbackUI.show(serviceId, {
                        message: result.error,
                        allowSkip: options.allowSkip !== false
                    });
                    
                    if (uiResult.success) {
                        return { success: true, key: uiResult.key, strategy: 'user_provided' };
                    }
                }
                
                return result;
            };
            
            // Helper for OpenAI-style API calls
            window.callOpenAI = async (endpoint, data, options = {}) => {
                return await window.autonomousAPIKeyManager.executeWithRetry('openai', async (apiKey) => {
                    const response = await fetch(`https://api.openai.com/v1${endpoint}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${apiKey}`
                        },
                        body: JSON.stringify(data)
                    });
                    
                    if (!response.ok) {
                        throw new Error(`OpenAI API error: ${response.status}`);
                    }
                    
                    return await response.json();
                }, options);
            };
            
            // Helper for SAM.gov API calls
            window.callSAMGov = async (endpoint, params = {}, options = {}) => {
                return await window.autonomousAPIKeyManager.executeWithRetry('samgov', async (apiKey) => {
                    const url = new URL(`https://api.sam.gov/prod${endpoint}`);
                    url.searchParams.append('api_key', apiKey);
                    
                    Object.entries(params).forEach(([key, value]) => {
                        url.searchParams.append(key, value);
                    });
                    
                    const response = await fetch(url);
                    
                    if (!response.ok) {
                        throw new Error(`SAM.gov API error: ${response.status}`);
                    }
                    
                    return await response.json();
                }, options);
            };
            
            // Helper for GitHub API calls
            window.callGitHub = async (endpoint, options = {}) => {
                const { method = 'GET', data = null, ...retryOptions } = options;
                
                return await window.autonomousAPIKeyManager.executeWithRetry('github', async (apiKey) => {
                    const headers = {
                        'Accept': 'application/vnd.github.v3+json'
                    };
                    
                    if (apiKey) {
                        headers['Authorization'] = `token ${apiKey}`;
                    }
                    
                    const fetchOptions = {
                        method,
                        headers
                    };
                    
                    if (data) {
                        fetchOptions.body = JSON.stringify(data);
                        headers['Content-Type'] = 'application/json';
                    }
                    
                    const response = await fetch(`https://api.github.com${endpoint}`, fetchOptions);
                    
                    if (!response.ok) {
                        throw new Error(`GitHub API error: ${response.status}`);
                    }
                    
                    return await response.json();
                }, retryOptions);
            };
            
            // Mark as loaded
            window.__autonomousAPIKeyManagerLoaded = true;
            
            console.log('✅ Autonomous API Key Manager initialized globally');
            console.log('Available: window.getAPIKey(), window.setAPIKey(), window.executeWithRetry()');
            console.log('Helpers: window.callOpenAI(), window.callSAMGov(), window.callGitHub()');
            console.log('UI: window.getAPIKeyOrPrompt(), window.apiKeyFallbackUI');
        }
    }
    
    // Auto-initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
})();
