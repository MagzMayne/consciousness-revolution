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
 * File: multi-ai-auto-inject.js
 * Declaration ID: IP-3EF70F27-MLL28ZV5
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Multi-Provider AI Auto-Inject Script
 * 
 * One-line integration for all projects:
 * <script src="js/multi-ai-auto-inject.js"></script>
 * 
 * Provides:
 * - Automatic loading of multi-provider AI orchestrator
 * - Backward compatibility with existing OpenAI code
 * - Global shortcuts for easy access
 * - Automatic provider detection and setup
 * 
 * @author BarbrickDesign AI Team
 * @version 1.0.0
 */

(function() {
    'use strict';

    console.log('🔄 Loading Multi-Provider AI Orchestrator...');

    // Load the multi-provider orchestrator
    const script = document.createElement('script');
    script.src = '/src/ai/multi-provider-orchestrator.js';
    script.type = 'module';
    
    script.onload = function() {
        console.log('✅ Multi-Provider AI Orchestrator loaded');
        
        // Initialize backward compatibility
        initializeBackwardCompatibility();
        
        // Try to load API keys from environment or storage
        autoLoadApiKeys();
        
        // Show quick start message
        showQuickStart();
    };
    
    script.onerror = function() {
        console.error('❌ Failed to load Multi-Provider AI Orchestrator');
        console.log('   Make sure /src/ai/multi-provider-orchestrator.js exists');
    };
    
    document.head.appendChild(script);

    /**
     * Initialize backward compatibility with existing OpenAI code
     */
    function initializeBackwardCompatibility() {
        // Wait for multiAI to be available with all required methods
        const checkInterval = setInterval(() => {
            if (typeof window.multiAI !== 'undefined' && typeof window.multiAI.setApiKey === 'function') {
                clearInterval(checkInterval);
                
                // Create OpenAI-compatible wrapper
                if (!window.openAIOrchestrator) {
                    window.openAIOrchestrator = {
                        setApiKey: (key) => {
                            // Detect provider based on key format
                            if (key.startsWith('sk-')) {
                                return window.multiAI.setApiKey('openai', key);
                            } else if (key.startsWith('gsk_')) {
                                return window.multiAI.setApiKey('groq', key);
                            } else if (key.startsWith('hf_')) {
                                return window.multiAI.setApiKey('huggingface', key);
                            }
                            return { success: false, error: 'Unknown key format' };
                        },
                        
                        chatCompletion: async (model, messages, options = {}) => {
                            return await window.multiAI.chatCompletion(messages, options);
                        },
                        
                        generateImage: async (prompt, options = {}) => {
                            return await window.multiAI.generateImage(prompt, options);
                        },
                        
                        generateEmbeddings: async (input, model = null) => {
                            return await window.multiAI.generateEmbeddings(input);
                        }
                    };
                    
                    console.log('✅ OpenAI backward compatibility layer initialized');
                }
            }
        }, 100);
        
        // Stop checking after 5 seconds
        setTimeout(() => clearInterval(checkInterval), 5000);
    }

    /**
     * Auto-load API keys from various sources
     */
    function autoLoadApiKeys() {
        setTimeout(() => {
            if (typeof window.multiAI === 'undefined' || typeof window.multiAI.setApiKey !== 'function') return;
            
            let keysLoaded = 0;
            
            // Try to load from localStorage (already done by constructor)
            // Check if any keys were loaded
            const providers = window.multiAI.providers;
            if (providers) {
                Object.keys(providers).forEach(provider => {
                    if (providers[provider].enabled) {
                        keysLoaded++;
                    }
                });
            }
            
            // Try to load from environment variables (if available)
            if (typeof process !== 'undefined' && process.env) {
                if (process.env.OPENAI_API_KEY) {
                    window.multiAI.setApiKey('openai', process.env.OPENAI_API_KEY);
                    keysLoaded++;
                }
                if (process.env.GROQ_API_KEY) {
                    window.multiAI.setApiKey('groq', process.env.GROQ_API_KEY);
                    keysLoaded++;
                }
                if (process.env.HUGGINGFACE_API_KEY) {
                    window.multiAI.setApiKey('huggingface', process.env.HUGGINGFACE_API_KEY);
                    keysLoaded++;
                }
            }
            
            if (keysLoaded > 0) {
                console.log(`✅ Loaded ${keysLoaded} API key(s) from storage`);
            } else {
                console.log('ℹ️  No API keys configured. Using mock responses.');
                console.log('   Set keys with: aiSetKey("groq", "gsk_...") or aiSetKey("huggingface", "hf_...")');
            }
        }, 200);
    }

    /**
     * Show quick start message
     */
    function showQuickStart() {
        setTimeout(() => {
            if (typeof window.multiAI === 'undefined') return;
            
            console.log('\n🎯 Multi-Provider AI Quick Start:');
            console.log('');
            console.log('   📊 Check status:');
            console.log('      aiStatus()');
            console.log('');
            console.log('   🔑 Set API keys (FREE tiers available):');
            console.log('      aiSetKey("groq", "gsk_...")        // Free: 14,400 req/day');
            console.log('      aiSetKey("huggingface", "hf_...")  // Free: Rate limited');
            console.log('      aiSetKey("openai", "sk-...")       // Paid: Best quality');
            console.log('');
            console.log('   💬 Chat:');
            console.log('      await multiAI.chatCompletion([{role:"user", content:"Hello!"}])');
            console.log('');
            console.log('   🎨 Generate Images:');
            console.log('      await multiAI.generateImage("A beautiful sunset")');
            console.log('');
            console.log('   🔄 Auto-fallback enabled: Groq → HuggingFace → Mock');
            console.log('');
        }, 300);
    }

    /**
     * Add provider setup helpers to window
     */
    window.setupFreeAI = function() {
        console.log('\n🆓 Setting up FREE AI providers:\n');
        
        console.log('1️⃣  Groq (Fast, Free, Recommended)');
        console.log('   • Get free API key: https://console.groq.com/keys');
        console.log('   • Free tier: 14,400 requests per day');
        console.log('   • Models: Llama 3.3 70B, Mixtral 8x7B, Gemma 2 9B');
        console.log('   • Setup: aiSetKey("groq", "gsk_YOUR_KEY_HERE")');
        console.log('');
        
        console.log('2️⃣  HuggingFace (Free, Open Models)');
        console.log('   • Get free API key: https://huggingface.co/settings/tokens');
        console.log('   • Free tier: Rate limited (usually sufficient)');
        console.log('   • Models: Llama, Mistral, Stable Diffusion');
        console.log('   • Setup: aiSetKey("huggingface", "hf_YOUR_KEY_HERE")');
        console.log('');
        
        console.log('3️⃣  OpenAI (Paid, Best Quality)');
        console.log('   • Get API key: https://platform.openai.com/api-keys');
        console.log('   • Paid: $0.001 - $0.06 per 1K tokens');
        console.log('   • Models: GPT-4, DALL-E 3, Whisper');
        console.log('   • Setup: aiSetKey("openai", "sk-YOUR_KEY_HERE")');
        console.log('');
        
        console.log('💡 Pro Tip: Set up Groq for fast, free AI! 🚀');
    };

    // Add UI helper for API key configuration
    window.showAIConfig = function() {
        const configHTML = `
            <div id="ai-config-modal" style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 30px;
                border-radius: 15px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                z-index: 10000;
                max-width: 500px;
                color: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            ">
                <h2 style="margin-top: 0; font-size: 24px;">🤖 AI Provider Setup</h2>
                <p style="opacity: 0.9; margin-bottom: 20px;">Configure free AI providers for this project</p>
                
                <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                    <h3 style="margin-top: 0; font-size: 16px;">🆓 Groq (Recommended)</h3>
                    <p style="font-size: 13px; opacity: 0.9; margin: 5px 0;">Free: 14,400 requests/day</p>
                    <input type="text" id="groq-key" placeholder="gsk_..." style="
                        width: 100%;
                        padding: 10px;
                        border-radius: 5px;
                        border: none;
                        margin-top: 10px;
                        font-family: monospace;
                    ">
                    <a href="https://console.groq.com/keys" target="_blank" style="
                        color: #fff;
                        font-size: 12px;
                        text-decoration: underline;
                        display: block;
                        margin-top: 5px;
                    ">Get free Groq API key →</a>
                </div>
                
                <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                    <h3 style="margin-top: 0; font-size: 16px;">🤗 HuggingFace</h3>
                    <p style="font-size: 13px; opacity: 0.9; margin: 5px 0;">Free: Rate limited</p>
                    <input type="text" id="hf-key" placeholder="hf_..." style="
                        width: 100%;
                        padding: 10px;
                        border-radius: 5px;
                        border: none;
                        margin-top: 10px;
                        font-family: monospace;
                    ">
                    <a href="https://huggingface.co/settings/tokens" target="_blank" style="
                        color: #fff;
                        font-size: 12px;
                        text-decoration: underline;
                        display: block;
                        margin-top: 5px;
                    ">Get free HuggingFace token →</a>
                </div>
                
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button onclick="window.saveAIConfig()" style="
                        flex: 1;
                        background: #10b981;
                        color: white;
                        border: none;
                        padding: 12px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: bold;
                        font-size: 14px;
                    ">💾 Save & Activate</button>
                    <button onclick="document.getElementById('ai-config-modal').remove()" style="
                        background: rgba(255,255,255,0.2);
                        color: white;
                        border: none;
                        padding: 12px 20px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                    ">Cancel</button>
                </div>
                
                <div id="ai-config-status" style="margin-top: 15px; font-size: 13px;"></div>
            </div>
            
            <div id="ai-config-overlay" onclick="document.getElementById('ai-config-modal').remove(); this.remove();" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                z-index: 9999;
            "></div>
        `;
        
        const existing = document.getElementById('ai-config-modal');
        if (existing) existing.remove();
        
        document.body.insertAdjacentHTML('beforeend', configHTML);
    };

    window.saveAIConfig = function() {
        const groqKey = document.getElementById('groq-key').value.trim();
        const hfKey = document.getElementById('hf-key').value.trim();
        const status = document.getElementById('ai-config-status');
        
        // Check if multiAI is available
        if (!window.multiAI || typeof window.multiAI.setApiKey !== 'function') {
            status.innerHTML = `❌ Error: Multi-Provider AI not loaded yet. Please wait and try again.`;
            status.style.color = '#ef4444';
            return;
        }
        
        let saved = 0;
        let errors = [];
        
        if (groqKey) {
            try {
                window.multiAI.setApiKey('groq', groqKey);
                saved++;
            } catch (e) {
                errors.push('Groq: ' + e.message);
            }
        }
        
        if (hfKey) {
            try {
                window.multiAI.setApiKey('huggingface', hfKey);
                saved++;
            } catch (e) {
                errors.push('HuggingFace: ' + e.message);
            }
        }
        
        if (saved > 0) {
            status.innerHTML = `✅ Saved ${saved} API key(s)! You can now use AI features.`;
            status.style.color = '#10b981';
            
            setTimeout(() => {
                document.getElementById('ai-config-modal').remove();
                document.getElementById('ai-config-overlay').remove();
            }, 2000);
        } else if (errors.length > 0) {
            status.innerHTML = `❌ Errors: ${errors.join(', ')}`;
            status.style.color = '#ef4444';
        } else {
            status.innerHTML = `ℹ️  Please enter at least one API key`;
            status.style.color = '#f59e0b';
        }
    };

})();
