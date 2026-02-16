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
 * File: universal-wallet-auth.js
 * Declaration ID: IP-11B2C6C3-MLL28ZWL
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
 * Universal Wallet Authentication System
 * Provides wallet connection and authentication functionality
 */

(function() {
    'use strict';

    // Create universal wallet auth object
    window.universalWalletAuth = {
        // State
        _isAuthenticated: false,
        _address: null,
        _shortAddress: null,
        _walletType: null,

        // Check if authenticated
        isAuthenticated() {
            return this._isAuthenticated;
        },

        // Get wallet address
        getAddress() {
            return this._address;
        },

        // Get short wallet address
        getShortAddress() {
            return this._shortAddress;
        },

        // Connect wallet
        async connect() {
            console.log('🔗 Wallet connection requested...');
            
            // Check for MetaMask/Web3 wallets
            if (typeof window.ethereum !== 'undefined') {
                try {
                    const accounts = await window.ethereum.request({ 
                        method: 'eth_requestAccounts' 
                    });
                    
                    if (accounts && accounts.length > 0) {
                        this._address = accounts[0];
                        this._shortAddress = `${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`;
                        this._isAuthenticated = true;
                        this._walletType = 'metamask';
                        
                        console.log('✅ Wallet connected:', this._shortAddress);
                        return {
                            success: true,
                            address: this._address,
                            shortAddress: this._shortAddress
                        };
                    }
                } catch (error) {
                    console.error('❌ Wallet connection failed:', error);
                    return { success: false, error: error.message };
                }
            }
            
            // No wallet detected - don't use fake demo addresses
            console.log('⚠️ No wallet detected');
            this._address = null;
            this._shortAddress = null;
            this._isAuthenticated = false;
            
            return { 
                success: false, 
                error: 'No wallet detected. Please install MetaMask or another Web3 wallet.' 
            };
        },

        // Disconnect wallet
        disconnect() {
            this._isAuthenticated = false;
            this._address = null;
            this._shortAddress = null;
            this._walletType = null;
            console.log('👋 Wallet disconnected');
        }
    };

    console.log('✅ Universal Wallet Auth loaded');
})();
