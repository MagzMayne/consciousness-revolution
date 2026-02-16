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
 * File: api-connection-auto-inject.js
 * Declaration ID: IP-672DD2FC-MLL28ZV2
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
 * Auto-Injection Script for AI API Connection Manager
 * 
 * This script automatically loads and configures the AI API Connection Manager
 * for any page that includes it. It provides:
 * 
 * - Automatic loading of the connection manager
 * - Integration with existing ApiKeyValidator
 * - OpenAI Orchestrator integration
 * - UI notifications for connection issues
 * - Easy API key configuration prompts
 * 
 * Usage: Add this script to any HTML page after loading dependencies
 * <script src="js/api-connection-auto-inject.js"></script>
 */

(function() {
    'use strict';
    
    // Check if already loaded
    if (window.apiConnectionManagerLoaded) {
        console.log('API Connection Manager already loaded');
        return;
    }
    window.apiConnectionManagerLoaded = true;
    
    // Load dependencies in order
    const dependencies = [
        { src: 'src/utils/api-key-validator.js', global: 'ApiKeyValidator' },
        { src: 'src/ai/api-connection-manager.js', global: 'AIAPIConnectionManager' }
    ];
    
    let loadedCount = 0;
    
    function loadScript(dep) {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (window[dep.global]) {
                console.log(`✅ ${dep.global} already loaded`);
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = dep.src;
            script.async = false;
            
            script.onload = () => {
                console.log(`✅ Loaded ${dep.src}`);
                loadedCount++;
                resolve();
            };
            
            script.onerror = () => {
                console.warn(`⚠️ Failed to load ${dep.src} - continuing anyway`);
                resolve(); // Don't reject, continue with what we have
            };
            
            document.head.appendChild(script);
        });
    }
    
    // Load all dependencies
    Promise.all(dependencies.map(loadScript))
        .then(() => {
            console.log(`✅ API Connection Manager dependencies loaded (${loadedCount}/${dependencies.length})`);
            
            // Initialize connection manager if available
            if (window.apiConnectionManager) {
                setupConnectionManager();
            } else {
                console.warn('⚠️ API Connection Manager not available');
            }
        })
        .catch(error => {
            console.error('Error loading API Connection Manager:', error);
        });
    
    function setupConnectionManager() {
        const manager = window.apiConnectionManager;
        
        // Show dashboard on load (only in development)
        const isDev = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.protocol === 'file:';
        
        if (isDev) {
            // Small delay to let page settle
            setTimeout(() => {
                console.log('\n🔧 Development Mode: API Connection Status\n');
                manager.showDashboard();
            }, 1000);
        }
        
        // Integrate with OpenAI Orchestrator if present
        if (window.OpenAIOrchestrator && window.openAIOrchestrator) {
            integrateOpenAIOrchestrator(manager);
        }
        
        // Add helpful global shortcuts
        window.apiStatus = () => manager.showDashboard();
        window.apiTest = (service) => manager.testConnection(service);
        window.apiSetKey = (service, key) => manager.setApiKey(service, key);
        
        // Add UI helper for missing API keys
        checkAndPromptForMissingKeys(manager);
        
        console.log('\n💡 Quick Commands:');
        console.log('  - apiStatus()          : Show connection status');
        console.log('  - apiSetKey(svc, key) : Configure API key');
        console.log('  - apiTest(service)    : Test connection');
        console.log('');
    }
    
    function integrateOpenAIOrchestrator(manager) {
        const orchestrator = window.openAIOrchestrator;
        
        // If orchestrator doesn't have an API key, try to get one from manager
        if (!orchestrator.apiKey) {
            const openaiKey = manager.getApiKey('openai');
            if (openaiKey) {
                const result = orchestrator.setApiKey(openaiKey);
                if (result.success) {
                    console.log('✅ OpenAI Orchestrator configured from API Connection Manager');
                }
            }
        }
        
        // If orchestrator has a key but manager doesn't, sync it
        if (orchestrator.apiKey && !manager.connections.openai.apiKey) {
            manager.setApiKey('openai', orchestrator.apiKey);
            console.log('✅ API Connection Manager synced with OpenAI Orchestrator');
        }
    }
    
    function checkAndPromptForMissingKeys(manager) {
        const status = manager.getConnectionStatus();
        const discovered = manager.discoverEndpoints();
        
        // Find services that are used but not configured
        const servicesInUse = new Set(discovered.map(e => e.service));
        const missingKeys = [];
        
        for (const serviceId of servicesInUse) {
            const serviceStatus = status[serviceId];
            if (!serviceStatus.hasKey && !serviceStatus.fallbackAvailable) {
                missingKeys.push(serviceStatus.name);
            }
        }
        
        // Show friendly notification if keys are missing
        if (missingKeys.length > 0) {
            // Check if showToast is available, otherwise use console
            if (typeof window.showToast === 'function') {
                setTimeout(() => {
                    window.showToast(
                        `⚠️ API keys needed: ${missingKeys.join(', ')}. Some features may be limited.`,
                        5000,
                        'warning'
                    );
                }, 2000);
            } else {
                console.warn(`⚠️ API keys needed: ${missingKeys.join(', ')}. Some features may be limited.`);
            }
        }
    }
    
    // Helper: Create UI panel for API key configuration (optional)
    function createAPIConfigPanel() {
        // Only create if explicitly requested
        if (!window.location.search.includes('showApiConfig')) {
            return;
        }
        
        const panel = document.createElement('div');
        panel.id = 'api-config-panel';
        panel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.95);
            border: 2px solid var(--neon-blue, #00f0ff);
            border-radius: 12px;
            padding: 20px;
            max-width: 400px;
            z-index: 10000;
            color: white;
            font-family: 'Courier New', monospace;
            box-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
        `;
        
        panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: var(--neon-blue, #00f0ff);">🔌 API Configuration</h3>
                <span onclick="this.closest('#api-config-panel').remove()" 
                      style="cursor: pointer; font-size: 24px; color: var(--neon-blue, #00f0ff);">×</span>
            </div>
            <div id="api-config-content">
                <p style="font-size: 14px; margin: 10px 0;">Configure your API keys for full functionality</p>
                <div id="api-key-inputs"></div>
                <button onclick="window.apiConnectionManager.showDashboard()" 
                        style="width: 100%; margin-top: 10px; padding: 10px; background: var(--neon-blue, #00f0ff); color: black; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
                    View Connection Status
                </button>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Add input fields for each service
        const inputsContainer = panel.querySelector('#api-key-inputs');
        const manager = window.apiConnectionManager;
        const status = manager.getConnectionStatus();
        
        for (const [serviceId, info] of Object.entries(status)) {
            if (!info.hasKey) {
                const inputGroup = document.createElement('div');
                inputGroup.style.marginBottom = '10px';
                inputGroup.innerHTML = `
                    <label style="display: block; font-size: 12px; margin-bottom: 5px; color: var(--neon-blue, #00f0ff);">
                        ${info.name}
                    </label>
                    <input type="password" 
                           id="api-key-${serviceId}" 
                           placeholder="Enter API key..."
                           style="width: 100%; padding: 8px; background: rgba(255,255,255,0.1); border: 1px solid var(--neon-blue, #00f0ff); color: white; border-radius: 4px;">
                    <button onclick="apiSetKey('${serviceId}', document.getElementById('api-key-${serviceId}').value)"
                            style="width: 100%; margin-top: 5px; padding: 6px; background: rgba(0,240,255,0.2); color: var(--neon-blue, #00f0ff); border: 1px solid var(--neon-blue, #00f0ff); border-radius: 4px; cursor: pointer; font-size: 12px;">
                        Set ${info.name} Key
                    </button>
                `;
                inputsContainer.appendChild(inputGroup);
            }
        }
    }
    
})();
