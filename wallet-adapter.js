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
 * File: wallet-adapter.js
 * Declaration ID: IP-4CEDCD64-MLL28ZWM
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Wallet Adapter
 * Provides wallet connection utilities for GemBot applications
 * 
 * This is a compatibility layer that redirects to the main wallet system
 */

// Check if universal wallet system is already loaded
if (typeof window.universalWalletSystem === 'undefined') {
    console.log('⚠️ Universal wallet system not loaded, loading from js/universal-wallet-system.js');
    
    // Create script element to load the main wallet system
    const script = document.createElement('script');
    script.src = 'js/universal-wallet-system.js';
    script.defer = true;
    document.head.appendChild(script);
    
    // Also load from src/utils if available
    const script2 = document.createElement('script');
    script2.src = 'src/utils/shared-wallet-system.js';
    script2.defer = true;
    script2.onerror = () => console.log('ℹ️ Shared wallet system not available (optional)');
    document.head.appendChild(script2);
} else {
    console.log('✅ Wallet adapter: Universal wallet system already loaded');
}

// Export wallet adapter namespace
window.walletAdapter = {
    initialized: true,
    version: '1.0.0'
};

console.log('💰 Wallet adapter initialized (v' + window.walletAdapter.version + ')');
