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
 * File: api-key-auto-patcher.js
 * Declaration ID: IP-4CA5321F-MLL28ZWD
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Application Patcher for Autonomous API Keys
 * 
 * This script patches existing applications to use the autonomous API key manager
 * without requiring changes to each individual application.
 * 
 * Usage: Include this script after loading the autonomous manager
 * 
 * @author BarbrickDesign Platform Team
 * @version 1.0.0
 */

(function() {
    'use strict';
    
    console.log('🔧 Initializing API Key Auto-Patcher...');
    
    /**
     * Wait for autonomous manager to be available
     */
    async function waitForManager() {
        let attempts = 0;
        while (!window.autonomousAPIKeyManager && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        return window.autonomousAPIKeyManager;
    }
    
    /**
     * Patch localStorage.getItem to use autonomous manager
     */
    function patchLocalStorage() {
        const originalGetItem = Storage.prototype.getItem;
        
        Storage.prototype.getItem = function(key) {
            // Check if this is an API key request
            const apiKeyPatterns = [
                'openai_api_key',
                'groq_api_key',
                'anthropic_api_key',
                'github_token',
                'githubToken',
                'samgov_api_key',
                'etherscan_api_key'
            ];
            
            const isAPIKey = apiKeyPatterns.some(pattern => key.includes(pattern));
            
            if (isAPIKey && window.autonomousAPIKeyManager) {
                // Extract service ID from key name
                let serviceId = key.replace('_api_key', '')
                                  .replace('api_key', '')
                                  .replace('_token', '')
                                  .replace('Token', '')
                                  .toLowerCase();
                
                // Normalize github variations
                if (key.toLowerCase().includes('github')) {
                    serviceId = 'github';
                }
                
                // Try to get from autonomous manager synchronously
                // Check if we have a cached key
                const activeKey = window.autonomousAPIKeyManager.activeKeys.get(serviceId);
                if (activeKey && activeKey.key) {
                    console.log(`✅ Auto-patched ${key} -> using autonomous key (${activeKey.strategy})`);
                    return activeKey.key;
                }
            }
            
            // Fall back to original behavior
            return originalGetItem.call(this, key);
        };
        
        console.log('✅ Patched localStorage.getItem()');
    }
    
    /**
     * Patch sessionStorage.getItem similarly
     */
    function patchSessionStorage() {
        const originalGetItem = sessionStorage.getItem.bind(sessionStorage);
        
        sessionStorage.getItem = function(key) {
            // Same logic as localStorage
            const apiKeyPatterns = [
                'openai_api_key',
                'groq_api_key',
                'anthropic_api_key',
                'github_token',
                'samgov_api_key'
            ];
            
            const isAPIKey = apiKeyPatterns.some(pattern => key.includes(pattern));
            
            if (isAPIKey && window.autonomousAPIKeyManager) {
                let serviceId = key.replace('_api_key', '').replace('_token', '').toLowerCase();
                const activeKey = window.autonomousAPIKeyManager.activeKeys.get(serviceId);
                
                if (activeKey && activeKey.key) {
                    console.log(`✅ Auto-patched sessionStorage ${key} -> autonomous key`);
                    return activeKey.key;
                }
            }
            
            return originalGetItem(key);
        };
        
        console.log('✅ Patched sessionStorage.getItem()');
    }
    
    /**
     * Auto-load keys on page load
     */
    async function autoLoadKeys() {
        const manager = await waitForManager();
        
        if (!manager) {
            console.warn('⚠️ Autonomous manager not available for auto-loading');
            return;
        }
        
        console.log('🔄 Auto-loading API keys...');
        
        // Common services to preload
        const servicesToPreload = ['groq', 'samgov', 'github', 'coingecko'];
        
        for (const serviceId of servicesToPreload) {
            try {
                const result = await manager.getAPIKey(serviceId);
                if (result.success) {
                    console.log(`✅ Preloaded ${serviceId} key via ${result.strategy}`);
                    
                    // Also store in sessionStorage for compatibility
                    const storageKey = `${serviceId}_api_key`;
                    sessionStorage.setItem(storageKey, result.key);
                }
            } catch (error) {
                console.warn(`⚠️ Could not preload ${serviceId}:`, error.message);
            }
        }
        
        console.log('✅ Key preloading complete');
    }
    
    /**
     * Intercept window.prompt for API key requests
     */
    function patchWindowPrompt() {
        const originalPrompt = window.prompt;
        
        window.prompt = function(message, defaultValue) {
            // Check if this is an API key prompt
            const apiKeyIndicators = [
                'api key',
                'api-key',
                'apikey',
                'token',
                'access token',
                'personal access'
            ];
            
            const isAPIKeyPrompt = apiKeyIndicators.some(indicator => 
                message && message.toLowerCase().includes(indicator)
            );
            
            if (isAPIKeyPrompt && window.apiKeyFallbackUI) {
                console.log('🔄 Intercepted API key prompt, showing fallback UI');
                
                // Try to determine service from message
                let serviceId = 'openai'; // default
                if (message.toLowerCase().includes('groq')) serviceId = 'groq';
                else if (message.toLowerCase().includes('github')) serviceId = 'github';
                else if (message.toLowerCase().includes('sam.gov')) serviceId = 'samgov';
                else if (message.toLowerCase().includes('anthropic')) serviceId = 'anthropic';
                
                // Show UI asynchronously (can't wait in prompt)
                setTimeout(async () => {
                    const result = await window.apiKeyFallbackUI.show(serviceId, {
                        message: message,
                        allowSkip: true
                    });
                    
                    if (result.success) {
                        // Trigger a custom event with the key
                        window.dispatchEvent(new CustomEvent('api-key-provided', {
                            detail: { serviceId, key: result.key }
                        }));
                    }
                }, 0);
                
                // Return empty for now - app should listen for event
                return null;
            }
            
            // Fall back to original prompt
            return originalPrompt.call(this, message, defaultValue);
        };
        
        console.log('✅ Patched window.prompt()');
    }
    
    /**
     * Add helper method to auto-initialize AI providers
     */
    function addProviderHelpers() {
        if (typeof window !== 'undefined') {
            /**
             * Auto-initialize multiAI with autonomous keys
             */
            window.autoInitMultiAI = async function() {
                if (!window.multiAI) {
                    console.warn('⚠️ multiAI not available');
                    return false;
                }
                
                const manager = window.autonomousAPIKeyManager;
                if (!manager) {
                    console.warn('⚠️ Autonomous manager not available');
                    return false;
                }
                
                // Try to set keys for supported providers
                const providers = ['groq', 'openai', 'huggingface'];
                let successCount = 0;
                
                for (const provider of providers) {
                    try {
                        const result = await manager.getAPIKey(provider);
                        if (result.success && result.key) {
                            const setResult = window.multiAI.setApiKey(provider, result.key);
                            if (setResult.success) {
                                console.log(`✅ Auto-initialized ${provider} in multiAI`);
                                successCount++;
                            }
                        }
                    } catch (error) {
                        console.warn(`⚠️ Could not auto-init ${provider}:`, error.message);
                    }
                }
                
                console.log(`✅ Auto-initialized ${successCount}/${providers.length} providers`);
                return successCount > 0;
            };
            
            console.log('✅ Added window.autoInitMultiAI()');
        }
    }
    
    /**
     * Main initialization
     */
    async function initialize() {
        console.log('🚀 API Key Auto-Patcher starting...');
        
        // Wait for DOM and manager
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }
        
        await waitForManager();
        
        // Apply patches
        patchLocalStorage();
        patchSessionStorage();
        patchWindowPrompt();
        addProviderHelpers();
        
        // Auto-load keys
        await autoLoadKeys();
        
        console.log('✅ API Key Auto-Patcher ready');
        
        // Notify that patching is complete
        window.dispatchEvent(new CustomEvent('api-key-patcher-ready'));
    }
    
    // Auto-initialize
    initialize();
    
    // Export for manual use
    if (typeof window !== 'undefined') {
        window.apiKeyPatcher = {
            initialize,
            autoLoadKeys,
            patchLocalStorage,
            patchSessionStorage,
            patchWindowPrompt,
            addProviderHelpers
        };
    }
    
})();
