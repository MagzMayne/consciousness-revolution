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
 * File: auth-bootstrap.js
 * Declaration ID: IP-1527E4CE-MLL28ZW6
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

/** SIGNED BY MeRLynn - ID: MERLYNN-06bea034 - TIMESTAMP: 2025-12-19T05:53:06.537Z - HASH: 1cddfb4d */
/** SIGNED BY AGentR - ID: AGENTR-309438bf - TIMESTAMP: 2025-12-19T05:53:06.537Z - HASH: 1cddfb4d */

/**
 * AUTH + WALLET BOOTSTRAP
 * Ensures universal wallet auth initializes exactly once per page
 * and synchronizes the Pump.fun wallet button with auth events.
 */

(function () {
    const BOOT_PROPERTY = '__barbrickAuthBootstrapped';

    if (window[BOOT_PROPERTY]) {
        console.warn('Auth bootstrap already executed on this page.');
        return;
    }

    window[BOOT_PROPERTY] = true;

    async function ensureAuthInitialized() {
        const START = Date.now();
        const MAX_WAIT = 7000;

        // Wait for universal wallet auth script to be available
        while (!window.universalWalletAuth && Date.now() - START < MAX_WAIT) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        if (!window.universalWalletAuth) {
            console.error('Auth bootstrap: universalWalletAuth not found.');
            return false;
        }

        // Wait for authIntegration to be available
        while (!window.authIntegration && Date.now() - START < MAX_WAIT) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        if (!window.authIntegration) {
            console.error('Auth bootstrap: authIntegration helper missing.');
            return false;
        }

        try {
            await window.authIntegration.init({ showUI: false });
            console.log('Auth bootstrap: authIntegration initialized.');
        } catch (error) {
            console.error('Auth bootstrap failed during init:', error);
            return false;
        }

        // Initialize wallet button if container exists
        const buttonContainer = document.getElementById('walletButtonContainer') ||
                                 document.querySelector('.wallet-button-container');

        if (buttonContainer && !window.walletButton) {
            const initWalletButton = () => {
                try {
                    if (window.WalletButton) {
                        window.walletButton = new window.WalletButton();
                    } else if (typeof WalletButton !== 'undefined') {
                        window.walletButton = new WalletButton();
                    } else {
                        console.warn('Auth bootstrap: WalletButton component not available.');
                    }
                } catch (error) {
                    console.error('Auth bootstrap: failed to initialize wallet button:', error);
                }
            };

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initWalletButton, { once: true });
            } else {
                initWalletButton();
            }
        }

        return true;
    }

    ensureAuthInitialized().then((success) => {
        if (!success) {
            console.warn('Auth bootstrap: initialization unsuccessful.');
        }
    });
})();
