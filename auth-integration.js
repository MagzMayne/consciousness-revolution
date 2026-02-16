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
 * File: auth-integration.js
 * Declaration ID: IP-792C4E68-MLL28ZUI
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
 * Authentication Integration System
 * Unified authentication handler
 */

(function() {
    'use strict';

    window.authIntegration = {
        initialized: false,
        config: {},
        
        async init(options = {}) {
            if (this.initialized) {
                console.log('⚠️ Auth already initialized');
                return;
            }

            this.config = {
                showUI: options.showUI !== false,
                onAuthSuccess: options.onAuthSuccess || (() => {}),
                onAuthFail: options.onAuthFail || (() => {})
            };

            console.log('🔐 Initializing auth integration...');

            // Check if wallet is available
            if (window.universalWalletAuth) {
                // Try auto-connect if previously connected
                const savedAddress = localStorage.getItem('wallet_address');
                if (savedAddress) {
                    const result = await window.universalWalletAuth.connect();
                    if (result.success) {
                        this.config.onAuthSuccess({
                            address: result.address,
                            shortAddress: result.shortAddress
                        });
                    } else {
                        this.config.onAuthFail();
                    }
                } else {
                    this.config.onAuthFail();
                }
            } else {
                console.warn('⚠️ Wallet auth not available');
                this.config.onAuthFail();
            }

            this.initialized = true;
            console.log('✅ Auth integration initialized');
        },

        async connect() {
            if (!window.universalWalletAuth) {
                console.error('❌ Wallet auth not available');
                return { success: false };
            }

            const result = await window.universalWalletAuth.connect();
            if (result.success) {
                localStorage.setItem('wallet_address', result.address);
                this.config.onAuthSuccess({
                    address: result.address,
                    shortAddress: result.shortAddress
                });
            }
            return result;
        },

        disconnect() {
            if (window.universalWalletAuth) {
                window.universalWalletAuth.disconnect();
            }
            localStorage.removeItem('wallet_address');
            console.log('👋 Disconnected');
        }
    };

    console.log('✅ Auth Integration loaded');
})();
