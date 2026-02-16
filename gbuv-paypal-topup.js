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
 * File: gbuv-paypal-topup.js
 * Declaration ID: IP-17143430-MLL28ZUT
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * GBUV PAYPAL WALLET TOP-UP SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════
 * Allows users to purchase GBUV tokens using PayPal (credit cards, Apple Pay, etc.)
 * Payment goes to: barbrickdesign@gmail.com
 * 
 * OWNER: Ryan Barbrick / Barbrick Design
 * CONTACT: BarbrickDesign@gmail.com
 * SIGNATURE: GBOT-RB-2025-7X9K2M4P-BARBRICK
 * COPYRIGHT: © 2024-2025 Ryan Barbrick. All Rights Reserved.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

window.GBUVPayPalTopup = {
    // Configuration
    config: {
        paypalEmail: 'barbrickdesign@gmail.com',
        paypalBusinessId: 'BARBRICKDESIGN',
        
        // Exchange rates - USD to GBUV
        // Low fees: 5% platform fee + 2.9% PayPal fee = ~8% total
        exchangeRate: {
            usd_to_gbuv: 100,  // 1 USD = 100 GBUV
            min_purchase: 1,   // $1 minimum
            max_purchase: 1000 // $1000 maximum
        },
        
        // Package options for easy purchasing
        packages: [
            { id: 'starter', usd: 5, gbuv: 500, bonus: 0, label: 'Starter Pack' },
            { id: 'basic', usd: 10, gbuv: 1050, bonus: 50, label: 'Basic Pack (+5% bonus)' },
            { id: 'standard', usd: 25, gbuv: 2750, bonus: 250, label: 'Standard Pack (+10% bonus)' },
            { id: 'premium', usd: 50, gbuv: 5750, bonus: 750, label: 'Premium Pack (+15% bonus)' },
            { id: 'elite', usd: 100, gbuv: 12000, bonus: 2000, label: 'Elite Pack (+20% bonus)' },
            { id: 'whale', usd: 500, gbuv: 65000, bonus: 15000, label: 'Whale Pack (+30% bonus)' }
        ],
        
        // Treasury wallet for GBUV token tracking
        treasuryWallet: '6HTjfgWZYMbENnMAJJFhxWR2VZDxdze3qV7zznSAsfk',
        
        // Vault pool allocation (% of revenue)
        vaultAllocation: 0.20  // 20% goes to vault pool for other projects
    },
    
    // User wallet state
    userWallet: {
        balance: 0,
        publicKey: null,
        transactions: []
    },
    
    /**
     * Initialize the PayPal top-up system
     */
    init() {
        console.log('💰 GBUV PayPal Top-up System initializing...');
        
        // Load user wallet from localStorage
        this.loadUserWallet();
        
        // Create top-up modal
        this.createTopupModal();
        
        // Listen for PayPal callbacks
        this.setupPayPalListeners();
        
        console.log('✅ GBUV PayPal Top-up System ready');
        console.log(`📊 Current balance: ${this.userWallet.balance} GBUV`);
        
        return this;
    },
    
    /**
     * Load user wallet from localStorage
     */
    loadUserWallet() {
        const saved = localStorage.getItem('gbuv_wallet');
        if (saved) {
            try {
                const wallet = JSON.parse(saved);
                this.userWallet = { ...this.userWallet, ...wallet };
            } catch (e) {
                console.warn('Failed to load wallet:', e);
            }
        }
        
        // Also check for connected Solana wallet
        if (window.solana && window.solana.publicKey) {
            this.userWallet.publicKey = window.solana.publicKey.toString();
        }
    },
    
    /**
     * Save user wallet to localStorage
     */
    saveUserWallet() {
        localStorage.setItem('gbuv_wallet', JSON.stringify(this.userWallet));
    },
    
    /**
     * Create the top-up modal UI
     */
    createTopupModal() {
        // Check if modal already exists
        if (document.getElementById('gbuv-topup-modal')) return;
        
        const modal = document.createElement('div');
        modal.id = 'gbuv-topup-modal';
        modal.className = 'gbuv-modal hidden';
        
        modal.innerHTML = `
            <div class="gbuv-modal-backdrop"></div>
            <div class="gbuv-modal-content">
                <div class="gbuv-modal-header">
                    <h2>💎 Top Up GBUV Wallet</h2>
                    <button class="gbuv-modal-close" onclick="window.GBUVPayPalTopup.closeModal()">×</button>
                </div>
                
                <div class="gbuv-modal-body">
                    <!-- Current Balance -->
                    <div class="gbuv-balance-display">
                        <span class="gbuv-balance-label">Current Balance</span>
                        <span class="gbuv-balance-amount" id="gbuv-current-balance">${this.userWallet.balance.toLocaleString()} GBUV</span>
                    </div>
                    
                    <!-- Package Selection -->
                    <div class="gbuv-packages">
                        <h3>Select a Package</h3>
                        <div class="gbuv-package-grid" id="gbuv-package-grid">
                            ${this.config.packages.map(pkg => `
                                <div class="gbuv-package-card" data-package="${pkg.id}" onclick="window.GBUVPayPalTopup.selectPackage('${pkg.id}')">
                                    <div class="gbuv-package-label">${pkg.label}</div>
                                    <div class="gbuv-package-price">$${pkg.usd} USD</div>
                                    <div class="gbuv-package-gbuv">${pkg.gbuv.toLocaleString()} GBUV</div>
                                    ${pkg.bonus > 0 ? `<div class="gbuv-package-bonus">+${pkg.bonus} bonus!</div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Custom Amount -->
                    <div class="gbuv-custom-amount">
                        <h3>Or Enter Custom Amount</h3>
                        <div class="gbuv-custom-input-row">
                            <span class="gbuv-currency">$</span>
                            <input type="number" id="gbuv-custom-usd" min="${this.config.exchangeRate.min_purchase}" max="${this.config.exchangeRate.max_purchase}" placeholder="Amount in USD" oninput="window.GBUVPayPalTopup.updateCustomCalculation()">
                            <span class="gbuv-equals">=</span>
                            <span class="gbuv-custom-gbuv" id="gbuv-custom-gbuv-display">0 GBUV</span>
                        </div>
                    </div>
                    
                    <!-- Selected Package Display -->
                    <div class="gbuv-selected-display" id="gbuv-selected-display">
                        <div class="gbuv-selected-info">
                            <span>You'll receive:</span>
                            <span id="gbuv-selected-amount">Select a package</span>
                        </div>
                    </div>
                    
                    <!-- Payment Methods Info -->
                    <div class="gbuv-payment-methods">
                        <h4>Accepted Payment Methods</h4>
                        <div class="gbuv-payment-icons">
                            <span class="payment-icon" title="Credit/Debit Cards">💳</span>
                            <span class="payment-icon" title="PayPal">🅿️</span>
                            <span class="payment-icon" title="Apple Pay">🍎</span>
                            <span class="payment-icon" title="Google Pay">📱</span>
                            <span class="payment-icon" title="Bank Transfer">🏦</span>
                        </div>
                        <p class="gbuv-fee-notice">Low fees: ~8% total (includes PayPal processing)</p>
                    </div>
                    
                    <!-- PayPal Button -->
                    <div class="gbuv-paypal-container">
                        <button class="gbuv-paypal-button" id="gbuv-paypal-btn" onclick="window.GBUVPayPalTopup.initiatePayPal()" disabled>
                            <span class="paypal-logo">Pay with PayPal</span>
                        </button>
                    </div>
                    
                    <!-- Transaction History -->
                    <div class="gbuv-transaction-history">
                        <h4>Recent Transactions</h4>
                        <div class="gbuv-transactions-list" id="gbuv-transactions-list">
                            ${this.renderTransactionHistory()}
                        </div>
                    </div>
                </div>
                
                <div class="gbuv-modal-footer">
                    <p>Payments processed securely via PayPal</p>
                    <p>Funds support the GemBot ecosystem & vault pool</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.injectStyles();
    },
    
    /**
     * Inject modal styles
     */
    injectStyles() {
        if (document.getElementById('gbuv-topup-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'gbuv-topup-styles';
        styles.textContent = `
            .gbuv-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .gbuv-modal.hidden { display: none; }
            .gbuv-modal-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(5px);
            }
            .gbuv-modal-content {
                position: relative;
                background: linear-gradient(145deg, #1a1a2e, #16213e);
                border: 2px solid #00d4ff;
                border-radius: 20px;
                max-width: 600px;
                width: 95%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 0 50px rgba(0, 212, 255, 0.3);
            }
            .gbuv-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid rgba(0, 212, 255, 0.3);
            }
            .gbuv-modal-header h2 {
                color: #00d4ff;
                font-size: 1.5em;
                margin: 0;
            }
            .gbuv-modal-close {
                background: none;
                border: none;
                color: #fff;
                font-size: 2em;
                cursor: pointer;
                opacity: 0.7;
                transition: opacity 0.2s;
            }
            .gbuv-modal-close:hover { opacity: 1; }
            .gbuv-modal-body {
                padding: 20px;
            }
            .gbuv-balance-display {
                background: linear-gradient(90deg, #00d4ff22, #9b59b622);
                border-radius: 15px;
                padding: 20px;
                text-align: center;
                margin-bottom: 20px;
            }
            .gbuv-balance-label {
                display: block;
                color: #888;
                font-size: 0.9em;
                margin-bottom: 5px;
            }
            .gbuv-balance-amount {
                display: block;
                color: #00d4ff;
                font-size: 2em;
                font-weight: bold;
            }
            .gbuv-packages h3, .gbuv-custom-amount h3 {
                color: #fff;
                font-size: 1.1em;
                margin-bottom: 15px;
            }
            .gbuv-package-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 10px;
                margin-bottom: 20px;
            }
            .gbuv-package-card {
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                padding: 15px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s;
            }
            .gbuv-package-card:hover {
                border-color: #00d4ff;
                transform: translateY(-2px);
            }
            .gbuv-package-card.selected {
                border-color: #00d4ff;
                background: rgba(0, 212, 255, 0.1);
                box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
            }
            .gbuv-package-label {
                color: #fff;
                font-size: 0.9em;
                margin-bottom: 5px;
            }
            .gbuv-package-price {
                color: #00d4ff;
                font-size: 1.3em;
                font-weight: bold;
            }
            .gbuv-package-gbuv {
                color: #9b59b6;
                font-size: 1em;
            }
            .gbuv-package-bonus {
                color: #2ecc71;
                font-size: 0.85em;
                margin-top: 5px;
            }
            .gbuv-custom-input-row {
                display: flex;
                align-items: center;
                gap: 10px;
                background: rgba(0, 0, 0, 0.3);
                padding: 15px;
                border-radius: 10px;
                margin-bottom: 20px;
            }
            .gbuv-currency {
                color: #00d4ff;
                font-size: 1.5em;
            }
            .gbuv-custom-input-row input {
                flex: 1;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 5px;
                padding: 10px;
                color: #fff;
                font-size: 1.2em;
            }
            .gbuv-equals {
                color: #888;
                font-size: 1.5em;
            }
            .gbuv-custom-gbuv {
                color: #9b59b6;
                font-size: 1.2em;
                font-weight: bold;
                min-width: 100px;
            }
            .gbuv-selected-display {
                background: linear-gradient(90deg, #2ecc7133, #00d4ff33);
                border-radius: 10px;
                padding: 15px;
                margin-bottom: 20px;
                text-align: center;
            }
            .gbuv-selected-info {
                color: #fff;
                font-size: 1.1em;
            }
            #gbuv-selected-amount {
                color: #2ecc71;
                font-weight: bold;
                margin-left: 10px;
            }
            .gbuv-payment-methods {
                text-align: center;
                margin-bottom: 20px;
            }
            .gbuv-payment-methods h4 {
                color: #888;
                font-size: 0.9em;
                margin-bottom: 10px;
            }
            .gbuv-payment-icons {
                display: flex;
                justify-content: center;
                gap: 15px;
                font-size: 2em;
                margin-bottom: 10px;
            }
            .gbuv-fee-notice {
                color: #2ecc71;
                font-size: 0.85em;
            }
            .gbuv-paypal-container {
                text-align: center;
                margin-bottom: 20px;
            }
            .gbuv-paypal-button {
                background: linear-gradient(90deg, #003087, #009cde);
                border: none;
                border-radius: 25px;
                padding: 15px 50px;
                color: #fff;
                font-size: 1.2em;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s;
            }
            .gbuv-paypal-button:hover:not(:disabled) {
                transform: scale(1.05);
                box-shadow: 0 0 20px rgba(0, 156, 222, 0.5);
            }
            .gbuv-paypal-button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            .gbuv-transaction-history h4 {
                color: #888;
                font-size: 0.9em;
                margin-bottom: 10px;
            }
            .gbuv-transactions-list {
                background: rgba(0, 0, 0, 0.3);
                border-radius: 10px;
                padding: 10px;
                max-height: 150px;
                overflow-y: auto;
            }
            .gbuv-transaction-item {
                display: flex;
                justify-content: space-between;
                padding: 8px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            .gbuv-transaction-item:last-child {
                border-bottom: none;
            }
            .gbuv-tx-date { color: #888; font-size: 0.85em; }
            .gbuv-tx-amount { color: #2ecc71; font-weight: bold; }
            .gbuv-modal-footer {
                padding: 15px 20px;
                border-top: 1px solid rgba(0, 212, 255, 0.3);
                text-align: center;
            }
            .gbuv-modal-footer p {
                color: #666;
                font-size: 0.8em;
                margin: 5px 0;
            }
        `;
        
        document.head.appendChild(styles);
    },
    
    /**
     * Render transaction history
     */
    renderTransactionHistory() {
        if (this.userWallet.transactions.length === 0) {
            return '<p style="color:#666;text-align:center;padding:20px;">No transactions yet</p>';
        }
        
        return this.userWallet.transactions.slice(-10).reverse().map(tx => `
            <div class="gbuv-transaction-item">
                <span class="gbuv-tx-date">${new Date(tx.timestamp).toLocaleDateString()}</span>
                <span class="gbuv-tx-amount">+${tx.gbuv.toLocaleString()} GBUV</span>
            </div>
        `).join('');
    },
    
    /**
     * Show the top-up modal
     */
    showModal() {
        const modal = document.getElementById('gbuv-topup-modal');
        if (modal) {
            modal.classList.remove('hidden');
            this.updateBalanceDisplay();
        }
    },
    
    /**
     * Close the modal
     */
    closeModal() {
        const modal = document.getElementById('gbuv-topup-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },
    
    /**
     * Update balance display
     */
    updateBalanceDisplay() {
        const display = document.getElementById('gbuv-current-balance');
        if (display) {
            display.textContent = `${this.userWallet.balance.toLocaleString()} GBUV`;
        }
    },
    
    /**
     * Select a package
     */
    selectPackage(packageId) {
        // Remove previous selection
        document.querySelectorAll('.gbuv-package-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Select new package
        const card = document.querySelector(`[data-package="${packageId}"]`);
        if (card) {
            card.classList.add('selected');
        }
        
        // Find package and update display
        const pkg = this.config.packages.find(p => p.id === packageId);
        if (pkg) {
            this.selectedPackage = pkg;
            document.getElementById('gbuv-selected-amount').textContent = 
                `${pkg.gbuv.toLocaleString()} GBUV for $${pkg.usd} USD`;
            document.getElementById('gbuv-paypal-btn').disabled = false;
            
            // Clear custom amount
            document.getElementById('gbuv-custom-usd').value = '';
        }
    },
    
    /**
     * Update custom calculation
     */
    updateCustomCalculation() {
        const input = document.getElementById('gbuv-custom-usd');
        const display = document.getElementById('gbuv-custom-gbuv-display');
        const selectedDisplay = document.getElementById('gbuv-selected-amount');
        const paypalBtn = document.getElementById('gbuv-paypal-btn');
        
        const usd = parseFloat(input.value) || 0;
        
        if (usd >= this.config.exchangeRate.min_purchase && usd <= this.config.exchangeRate.max_purchase) {
            const gbuv = Math.floor(usd * this.config.exchangeRate.usd_to_gbuv);
            display.textContent = `${gbuv.toLocaleString()} GBUV`;
            selectedDisplay.textContent = `${gbuv.toLocaleString()} GBUV for $${usd.toFixed(2)} USD`;
            paypalBtn.disabled = false;
            
            // Clear package selection
            document.querySelectorAll('.gbuv-package-card').forEach(card => {
                card.classList.remove('selected');
            });
            this.selectedPackage = null;
            this.customAmount = { usd, gbuv };
        } else {
            display.textContent = '0 GBUV';
            if (usd > 0) {
                selectedDisplay.textContent = `Min: $${this.config.exchangeRate.min_purchase}, Max: $${this.config.exchangeRate.max_purchase}`;
            }
            paypalBtn.disabled = true;
        }
    },
    
    /**
     * Setup PayPal listeners
     */
    setupPayPalListeners() {
        // Listen for PayPal return/callback
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'PAYPAL_SUCCESS') {
                this.handlePayPalSuccess(event.data);
            }
        });
    },
    
    /**
     * Initiate PayPal payment
     */
    initiatePayPal() {
        let usd, gbuv, description;
        
        if (this.selectedPackage) {
            usd = this.selectedPackage.usd;
            gbuv = this.selectedPackage.gbuv;
            description = this.selectedPackage.label;
        } else if (this.customAmount) {
            usd = this.customAmount.usd;
            gbuv = this.customAmount.gbuv;
            description = `Custom GBUV Purchase (${gbuv} GBUV)`;
        } else {
            alert('Please select a package or enter a custom amount');
            return;
        }
        
        // Create PayPal.me link or PayPal payment URL
        const paypalUrl = this.createPayPalUrl(usd, description);
        
        // Store pending transaction
        const pendingTx = {
            id: 'pending_' + Date.now(),
            usd: usd,
            gbuv: gbuv,
            timestamp: new Date().toISOString(),
            status: 'pending',
            description: description
        };
        
        localStorage.setItem('gbuv_pending_tx', JSON.stringify(pendingTx));
        
        // Open PayPal in new window
        const paypalWindow = window.open(paypalUrl, 'PayPal', 'width=600,height=700');
        
        // Show confirmation dialog
        this.showPaymentConfirmation(pendingTx, paypalWindow);
    },
    
    /**
     * Create PayPal payment URL
     */
    createPayPalUrl(amount, description) {
        // Using PayPal.me link for simple payments
        // This supports all payment methods (cards, PayPal balance, Apple Pay via PayPal)
        const paypalMeUrl = `https://paypal.me/barbrickdesign/${amount}USD`;
        
        // Alternative: PayPal checkout button (requires more setup)
        // For now, using PayPal.me which supports all methods through PayPal
        
        return paypalMeUrl;
    },
    
    /**
     * Show payment confirmation dialog
     */
    showPaymentConfirmation(pendingTx, paypalWindow) {
        const confirmHtml = `
            <div id="gbuv-payment-confirm" style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(145deg, #1a1a2e, #16213e);
                border: 2px solid #2ecc71;
                border-radius: 20px;
                padding: 30px;
                z-index: 10001;
                text-align: center;
                max-width: 400px;
            ">
                <h3 style="color: #2ecc71; margin-bottom: 15px;">💳 Complete Payment in PayPal</h3>
                <p style="color: #fff; margin-bottom: 15px;">
                    Amount: <strong>$${pendingTx.usd} USD</strong><br>
                    You'll receive: <strong style="color:#00d4ff;">${pendingTx.gbuv.toLocaleString()} GBUV</strong>
                </p>
                <p style="color: #888; font-size: 0.9em; margin-bottom: 20px;">
                    After completing payment in PayPal, click "I Paid" below.
                </p>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button onclick="window.GBUVPayPalTopup.confirmPayment()" style="
                        background: #2ecc71;
                        border: none;
                        border-radius: 10px;
                        padding: 12px 25px;
                        color: #fff;
                        font-weight: bold;
                        cursor: pointer;
                    ">✓ I Paid</button>
                    <button onclick="window.GBUVPayPalTopup.cancelPayment()" style="
                        background: #e74c3c;
                        border: none;
                        border-radius: 10px;
                        padding: 12px 25px;
                        color: #fff;
                        font-weight: bold;
                        cursor: pointer;
                    ">✕ Cancel</button>
                </div>
            </div>
        `;
        
        const overlay = document.createElement('div');
        overlay.id = 'gbuv-confirm-overlay';
        overlay.innerHTML = confirmHtml;
        document.body.appendChild(overlay);
    },
    
    /**
     * Confirm payment was made
     */
    async confirmPayment() {
        const pendingTxStr = localStorage.getItem('gbuv_pending_tx');
        if (!pendingTxStr) {
            alert('No pending transaction found');
            return;
        }
        
        const pendingTx = JSON.parse(pendingTxStr);
        
        // In production, this would verify with PayPal API
        // For now, we trust the user and log for manual verification
        
        // Add GBUV to wallet
        this.userWallet.balance += pendingTx.gbuv;
        
        // Record transaction
        const completedTx = {
            ...pendingTx,
            id: 'tx_' + Date.now(),
            status: 'completed',
            completedAt: new Date().toISOString()
        };
        
        this.userWallet.transactions.push(completedTx);
        this.saveUserWallet();
        
        // Log to Firebase if available
        await this.logTransactionToFirebase(completedTx);
        
        // Update UI
        this.updateBalanceDisplay();
        
        // Update transaction list
        const txList = document.getElementById('gbuv-transactions-list');
        if (txList) {
            txList.innerHTML = this.renderTransactionHistory();
        }
        
        // Remove confirmation dialog
        const overlay = document.getElementById('gbuv-confirm-overlay');
        if (overlay) overlay.remove();
        
        // Clear pending transaction
        localStorage.removeItem('gbuv_pending_tx');
        
        // Show success message
        this.showSuccessMessage(completedTx);
        
        console.log(`✅ Payment confirmed: +${pendingTx.gbuv} GBUV`);
        console.log(`📊 New balance: ${this.userWallet.balance} GBUV`);
    },
    
    /**
     * Cancel payment
     */
    cancelPayment() {
        localStorage.removeItem('gbuv_pending_tx');
        
        const overlay = document.getElementById('gbuv-confirm-overlay');
        if (overlay) overlay.remove();
        
        console.log('❌ Payment cancelled');
    },
    
    /**
     * Log transaction to Firebase
     */
    async logTransactionToFirebase(transaction) {
        try {
            if (window.firebaseDb && window.firestoreUtils) {
                const { doc, collection, setDoc, serverTimestamp } = window.firestoreUtils;
                const txDoc = doc(collection(window.firebaseDb, 'gbuv_topups'), transaction.id);
                await setDoc(txDoc, {
                    ...transaction,
                    serverTimestamp: serverTimestamp(),
                    userAgent: navigator.userAgent,
                    vaultAllocation: transaction.usd * this.config.vaultAllocation
                });
                console.log('📊 Transaction logged to Firebase:', transaction.id);
            }
        } catch (error) {
            console.warn('Failed to log to Firebase:', error);
        }
    },
    
    /**
     * Show success message
     */
    showSuccessMessage(transaction) {
        const successHtml = `
            <div id="gbuv-success-msg" style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(145deg, #1a3a1a, #0a2a0a);
                border: 2px solid #2ecc71;
                border-radius: 20px;
                padding: 40px;
                z-index: 10001;
                text-align: center;
                animation: fadeIn 0.3s ease;
            ">
                <div style="font-size: 4em; margin-bottom: 15px;">🎉</div>
                <h2 style="color: #2ecc71; margin-bottom: 15px;">Payment Successful!</h2>
                <p style="color: #fff; font-size: 1.5em; margin-bottom: 10px;">
                    +${transaction.gbuv.toLocaleString()} GBUV
                </p>
                <p style="color: #888; margin-bottom: 20px;">
                    New Balance: <strong style="color:#00d4ff;">${this.userWallet.balance.toLocaleString()} GBUV</strong>
                </p>
                <button onclick="document.getElementById('gbuv-success-msg').remove()" style="
                    background: #2ecc71;
                    border: none;
                    border-radius: 10px;
                    padding: 12px 30px;
                    color: #fff;
                    font-weight: bold;
                    cursor: pointer;
                ">Awesome! 🚀</button>
            </div>
        `;
        
        const el = document.createElement('div');
        el.innerHTML = successHtml;
        document.body.appendChild(el.firstElementChild);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            const msg = document.getElementById('gbuv-success-msg');
            if (msg) msg.remove();
        }, 5000);
    },
    
    /**
     * Get current balance
     */
    getBalance() {
        return this.userWallet.balance;
    },
    
    /**
     * Spend GBUV (called by other systems like Merlin AI)
     */
    spend(amount, description = 'Service') {
        if (this.userWallet.balance < amount) {
            return {
                success: false,
                message: `Insufficient balance. Need ${amount} GBUV, have ${this.userWallet.balance} GBUV`,
                needTopup: true
            };
        }
        
        this.userWallet.balance -= amount;
        
        const spendTx = {
            id: 'spend_' + Date.now(),
            type: 'spend',
            gbuv: -amount,
            description: description,
            timestamp: new Date().toISOString()
        };
        
        this.userWallet.transactions.push(spendTx);
        this.saveUserWallet();
        
        console.log(`💸 Spent ${amount} GBUV on ${description}`);
        console.log(`📊 Remaining balance: ${this.userWallet.balance} GBUV`);
        
        return {
            success: true,
            message: `Spent ${amount} GBUV`,
            newBalance: this.userWallet.balance
        };
    },
    
    /**
     * Quick top-up button for navbar/header
     */
    createQuickTopupButton() {
        const btn = document.createElement('button');
        btn.id = 'gbuv-quick-topup';
        btn.className = 'gbuv-quick-topup-btn';
        btn.innerHTML = `💎 <span id="gbuv-quick-balance">${this.userWallet.balance}</span> GBUV`;
        btn.onclick = () => this.showModal();
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .gbuv-quick-topup-btn {
                background: linear-gradient(90deg, #00d4ff22, #9b59b622);
                border: 1px solid #00d4ff;
                border-radius: 20px;
                padding: 8px 15px;
                color: #00d4ff;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s;
            }
            .gbuv-quick-topup-btn:hover {
                background: linear-gradient(90deg, #00d4ff44, #9b59b644);
                transform: scale(1.05);
            }
        `;
        document.head.appendChild(style);
        
        return btn;
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.GBUVPayPalTopup.init());
} else {
    window.GBUVPayPalTopup.init();
}

console.log('💰 GBUV PayPal Top-up module loaded');
