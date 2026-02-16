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
 * File: api-key-fallback-ui.js
 * Declaration ID: IP-3B5C6407-MLL28ZWC
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * API Key Fallback UI Component
 * 
 * Provides a user-friendly interface for entering API keys when
 * autonomous sourcing fails or rate limits are exhausted.
 * 
 * @author BarbrickDesign Platform Team
 * @version 1.0.0
 */

class APIKeyFallbackUI {
    constructor(options = {}) {
        this.options = {
            containerId: options.containerId || null,
            autoShow: options.autoShow !== false,
            theme: options.theme || 'dark',
            position: options.position || 'center',
            ...options
        };
        
        this.manager = window.autonomousAPIKeyManager || options.manager;
        this.visible = false;
        this.container = null;
    }
    
    /**
     * Show the API key input UI for a specific service
     * @param {string} serviceId - Service identifier
     * @param {object} options - Display options
     */
    async show(serviceId, options = {}) {
        const {
            message = null,
            allowSkip = false,
            onSubmit = null,
            onSkip = null
        } = options;
        
        // Get service info
        const serviceInfo = await this.getServiceInfo(serviceId);
        
        // Create UI if not exists
        if (!this.container) {
            this.createUI();
        }
        
        // Populate with service-specific info
        this.populateServiceInfo(serviceId, serviceInfo, message);
        
        // Setup handlers
        this.setupHandlers(serviceId, { allowSkip, onSubmit, onSkip });
        
        // Show the UI
        this.container.style.display = 'flex';
        this.visible = true;
        
        return new Promise((resolve) => {
            this._resolveCallback = resolve;
        });
    }
    
    /**
     * Hide the UI
     */
    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
        this.visible = false;
    }
    
    /**
     * Get service information for display
     */
    async getServiceInfo(serviceId) {
        // Try to get from centralized config
        if (this.manager && this.manager.centralizedConfig) {
            const config = this.manager.centralizedConfig;
            if (config.services && config.services[serviceId]) {
                return config.services[serviceId];
            }
        }
        
        // Fallback to basic info
        const serviceMap = {
            'openai': {
                provider: 'OpenAI',
                signupUrl: 'https://platform.openai.com/api-keys',
                userInputPrompt: 'Enter your OpenAI API key (starts with sk-)',
                help: 'Sign up for OpenAI and generate an API key'
            },
            'groq': {
                provider: 'Groq',
                signupUrl: 'https://console.groq.com/keys',
                userInputPrompt: 'Enter your Groq API key (starts with gsk_)',
                help: 'Free tier: 14,400 requests/day'
            },
            'samgov': {
                provider: 'SAM.gov',
                signupUrl: 'https://open.gsa.gov/api/',
                userInputPrompt: 'Enter your SAM.gov API key',
                help: 'Free API key for government contract data'
            },
            'github': {
                provider: 'GitHub',
                signupUrl: 'https://github.com/settings/tokens',
                userInputPrompt: 'Enter your GitHub Personal Access Token',
                help: 'Increase rate limit from 60 to 5000 requests/hour'
            },
            'anthropic': {
                provider: 'Anthropic Claude',
                signupUrl: 'https://console.anthropic.com/',
                userInputPrompt: 'Enter your Anthropic API key',
                help: 'API key required for Claude AI models'
            }
        };
        
        return serviceMap[serviceId] || {
            provider: serviceId,
            signupUrl: null,
            userInputPrompt: `Enter your ${serviceId} API key`,
            help: 'API key required for this service'
        };
    }
    
    /**
     * Create the UI elements
     */
    createUI() {
        const overlay = document.createElement('div');
        overlay.id = 'api-key-fallback-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        `;
        
        const modal = document.createElement('div');
        modal.id = 'api-key-fallback-modal';
        modal.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
            padding: 30px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            color: white;
        `;
        
        modal.innerHTML = `
            <div id="api-key-fallback-content">
                <h2 style="margin-top: 0; text-align: center;">🔑 API Key Required</h2>
                <div id="api-key-service-info" style="margin: 20px 0;"></div>
                <div id="api-key-message" style="margin: 15px 0; padding: 15px; background: rgba(255, 255, 255, 0.1); border-radius: 8px;"></div>
                
                <div style="margin: 20px 0;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold;">
                        <span id="api-key-prompt-text"></span>
                    </label>
                    <input 
                        type="password" 
                        id="api-key-input" 
                        placeholder="Enter your API key..."
                        style="
                            width: 100%;
                            padding: 12px;
                            border: none;
                            border-radius: 8px;
                            font-size: 16px;
                            background: rgba(255, 255, 255, 0.9);
                            color: #333;
                            box-sizing: border-box;
                        "
                    />
                    <div style="margin-top: 8px; font-size: 12px; opacity: 0.8;">
                        🔒 Your key is stored locally and never sent to our servers
                    </div>
                </div>
                
                <div id="api-key-help" style="margin: 15px 0; font-size: 14px; opacity: 0.9;"></div>
                
                <div style="display: flex; gap: 10px; margin-top: 25px;">
                    <button 
                        id="api-key-submit-btn"
                        style="
                            flex: 1;
                            padding: 12px;
                            background: #4ade80;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-size: 16px;
                            font-weight: bold;
                            cursor: pointer;
                            transition: all 0.2s;
                        "
                    >
                        ✓ Submit
                    </button>
                    <button 
                        id="api-key-signup-btn"
                        style="
                            flex: 1;
                            padding: 12px;
                            background: rgba(255, 255, 255, 0.2);
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-size: 16px;
                            cursor: pointer;
                            transition: all 0.2s;
                        "
                    >
                        Get API Key
                    </button>
                    <button 
                        id="api-key-skip-btn"
                        style="
                            padding: 12px 20px;
                            background: rgba(255, 255, 255, 0.1);
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-size: 16px;
                            cursor: pointer;
                            transition: all 0.2s;
                            display: none;
                        "
                    >
                        Skip
                    </button>
                </div>
            </div>
        `;
        
        overlay.appendChild(modal);
        
        // Insert into document
        if (this.options.containerId) {
            const container = document.getElementById(this.options.containerId);
            if (container) {
                container.appendChild(overlay);
            } else {
                document.body.appendChild(overlay);
            }
        } else {
            document.body.appendChild(overlay);
        }
        
        this.container = overlay;
        
        // Initially hide
        overlay.style.display = 'none';
        
        // Add hover effects
        this.addHoverEffects();
    }
    
    /**
     * Add hover effects to buttons
     */
    addHoverEffects() {
        const buttons = this.container.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-2px)';
                btn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0)';
                btn.style.boxShadow = 'none';
            });
        });
    }
    
    /**
     * Populate service-specific information
     */
    populateServiceInfo(serviceId, serviceInfo, customMessage) {
        const serviceInfoDiv = this.container.querySelector('#api-key-service-info');
        const messageDiv = this.container.querySelector('#api-key-message');
        const promptText = this.container.querySelector('#api-key-prompt-text');
        const helpDiv = this.container.querySelector('#api-key-help');
        
        // Service name
        serviceInfoDiv.innerHTML = `
            <div style="text-align: center; font-size: 18px; font-weight: bold;">
                ${serviceInfo.provider || serviceId}
            </div>
        `;
        
        // Custom message or default
        if (customMessage) {
            messageDiv.innerHTML = customMessage;
        } else {
            messageDiv.innerHTML = `
                <strong>Shared API keys exhausted</strong><br>
                Please provide your own API key to continue using this feature.
            `;
        }
        
        // Prompt text
        promptText.textContent = serviceInfo.userInputPrompt || `Enter your ${serviceId} API key`;
        
        // Help text
        if (serviceInfo.help) {
            helpDiv.innerHTML = `ℹ️ ${serviceInfo.help}`;
        }
        
        // Store signup URL
        this._signupUrl = serviceInfo.signupUrl;
    }
    
    /**
     * Setup event handlers
     */
    setupHandlers(serviceId, options) {
        const submitBtn = this.container.querySelector('#api-key-submit-btn');
        const signupBtn = this.container.querySelector('#api-key-signup-btn');
        const skipBtn = this.container.querySelector('#api-key-skip-btn');
        const input = this.container.querySelector('#api-key-input');
        
        // Remove old listeners
        const newSubmitBtn = submitBtn.cloneNode(true);
        const newSignupBtn = signupBtn.cloneNode(true);
        const newSkipBtn = skipBtn.cloneNode(true);
        submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
        signupBtn.parentNode.replaceChild(newSignupBtn, signupBtn);
        skipBtn.parentNode.replaceChild(newSkipBtn, skipBtn);
        
        // Submit handler
        newSubmitBtn.addEventListener('click', async () => {
            const apiKey = input.value.trim();
            
            if (!apiKey) {
                this.showError('Please enter an API key');
                return;
            }
            
            // Set the API key
            if (this.manager) {
                const result = this.manager.setAPIKey(serviceId, apiKey);
                if (result.success) {
                    this.hide();
                    if (options.onSubmit) {
                        options.onSubmit(apiKey);
                    }
                    if (this._resolveCallback) {
                        this._resolveCallback({ success: true, key: apiKey });
                    }
                } else {
                    this.showError(result.error || 'Invalid API key');
                }
            }
        });
        
        // Signup button handler
        newSignupBtn.addEventListener('click', () => {
            if (this._signupUrl) {
                window.open(this._signupUrl, '_blank');
            }
        });
        
        // Skip button handler
        if (options.allowSkip) {
            newSkipBtn.style.display = 'block';
            newSkipBtn.addEventListener('click', () => {
                this.hide();
                if (options.onSkip) {
                    options.onSkip();
                }
                if (this._resolveCallback) {
                    this._resolveCallback({ success: false, skipped: true });
                }
            });
        } else {
            newSkipBtn.style.display = 'none';
        }
        
        // Enter key handler
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                newSubmitBtn.click();
            }
        });
        
        // Focus input
        setTimeout(() => input.focus(), 100);
    }
    
    /**
     * Show error message
     */
    showError(message) {
        const messageDiv = this.container.querySelector('#api-key-message');
        messageDiv.innerHTML = `
            <strong style="color: #fca5a5;">❌ ${message}</strong>
        `;
        
        // Shake animation
        const modal = this.container.querySelector('#api-key-fallback-modal');
        modal.style.animation = 'shake 0.5s';
        setTimeout(() => {
            modal.style.animation = '';
        }, 500);
    }
}

// Add shake animation (only once)
if (!document.getElementById('api-key-fallback-animation')) {
    const style = document.createElement('style');
    style.id = 'api-key-fallback-animation';
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
    `;
    document.head.appendChild(style);
}

// Export for use
if (typeof window !== 'undefined') {
    window.APIKeyFallbackUI = APIKeyFallbackUI;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIKeyFallbackUI;
}
