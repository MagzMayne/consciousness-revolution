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
 * File: paypal-payment-integration.js
 * Declaration ID: IP-49156264-MLL28ZW9
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
 * PAYPAL PAYMENT INTEGRATION
 * Handles PayPal payments to barbrickdesign@gmail.com
 * Integrates with contractor payment system
 */

class PayPalPaymentIntegration {
    constructor() {
        this.paypalEmail = 'barbrickdesign@gmail.com';
        this.clientId = null; // Set via configuration
        this.isInitialized = false;
        this.isProduction = false; // Set to true for production
        this.transactions = [];
        this.pendingPayments = [];
        
        // Payment configuration
        this.config = {
            currency: 'USD',
            defaultAmount: 10.00,
            minAmount: 1.00,
            maxAmount: 10000.00,
            allowRecurring: true,
            enableSubscriptions: true
        };

        // Integration with contractor system
        this.contractorSystem = null;
        
        this.init();
    }

    /**
     * Initialize PayPal integration
     */
    async init() {
        console.log('💰 PayPal Payment Integration initializing...');
        
        try {
            // Connect to contractor payment system
            await this.connectToContractorSystem();
            
            // Load PayPal SDK
            await this.loadPayPalSDK();
            
            // Load transaction history
            this.loadTransactions();
            
            this.isInitialized = true;
            console.log('✅ PayPal Payment Integration ready');
        } catch (error) {
            console.error('Failed to initialize PayPal integration:', error);
        }
    }

    /**
     * Connect to contractor payment system
     */
    async connectToContractorSystem() {
        if (typeof ContractorPaymentSystem !== 'undefined') {
            this.contractorSystem = new ContractorPaymentSystem();
            console.log('🔗 Connected to Contractor Payment System');
        }
    }

    /**
     * Load PayPal SDK
     */
    async loadPayPalSDK() {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (typeof paypal !== 'undefined') {
                console.log('PayPal SDK already loaded');
                resolve();
                return;
            }

            // For now, we'll use a placeholder
            // In production, you'd load the actual PayPal SDK with your client ID
            const script = document.createElement('script');
            
            // Use sandbox for testing, production for live
            const clientId = this.isProduction 
                ? 'YOUR_PRODUCTION_CLIENT_ID' 
                : 'YOUR_SANDBOX_CLIENT_ID';
            
            script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${this.config.currency}`;
            script.async = true;
            
            script.onload = () => {
                console.log('✅ PayPal SDK loaded');
                resolve();
            };
            
            script.onerror = () => {
                console.warn('PayPal SDK not loaded - using fallback methods');
                resolve(); // Don't reject, fall back to direct links
            };
            
            document.head.appendChild(script);
        });
    }

    /**
     * Create a payment button
     */
    createPaymentButton(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return;
        }

        const amount = options.amount || this.config.defaultAmount;
        const description = options.description || 'Payment to BarbrickDesign';
        const itemName = options.itemName || 'Service Payment';

        // If PayPal SDK is available, use it
        if (typeof paypal !== 'undefined' && paypal.Buttons) {
            paypal.Buttons({
                createOrder: (data, actions) => {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: amount.toFixed(2)
                            },
                            description: description,
                            payee: {
                                email_address: this.paypalEmail
                            }
                        }]
                    });
                },
                onApprove: async (data, actions) => {
                    const order = await actions.order.capture();
                    this.handleSuccessfulPayment(order);
                },
                onError: (err) => {
                    this.handlePaymentError(err);
                }
            }).render(`#${containerId}`);
        } else {
            // Fallback: Create direct PayPal link
            this.createDirectPayPalLink(container, amount, description, itemName);
        }
    }

    /**
     * Create direct PayPal payment link (fallback method)
     */
    createDirectPayPalLink(container, amount, description, itemName) {
        container.innerHTML = '';
        
        const button = document.createElement('a');
        button.href = this.generatePayPalLink(amount, description, itemName);
        button.target = '_blank';
        button.className = 'paypal-button';
        button.innerHTML = `
            <div style="
                background: #0070ba;
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                text-align: center;
                font-weight: bold;
                text-decoration: none;
                display: inline-block;
                cursor: pointer;
                transition: all 0.3s ease;
            " onmouseover="this.style.background='#005ea6'" onmouseout="this.style.background='#0070ba'">
                <span style="font-size: 16px;">💳 Pay with PayPal</span>
                <div style="font-size: 12px; margin-top: 4px;">$${amount.toFixed(2)}</div>
            </div>
        `;
        
        container.appendChild(button);
    }

    /**
     * Generate PayPal payment link
     */
    generatePayPalLink(amount, description, itemName) {
        const params = new URLSearchParams({
            cmd: '_xclick',
            business: this.paypalEmail,
            item_name: itemName,
            amount: amount.toFixed(2),
            currency_code: this.config.currency,
            return: window.location.href + '?payment=success',
            cancel_return: window.location.href + '?payment=cancel',
            notify_url: window.location.origin + '/paypal-ipn'
        });

        return `https://www.paypal.com/cgi-bin/webscr?${params.toString()}`;
    }

    /**
     * Create donation button
     */
    createDonationButton(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return;
        }

        container.innerHTML = '';
        
        const button = document.createElement('a');
        button.href = this.generateDonationLink(options);
        button.target = '_blank';
        button.className = 'paypal-donation-button';
        button.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #ffd700, #ffaa00);
                color: #000;
                padding: 15px 30px;
                border-radius: 10px;
                text-align: center;
                font-weight: bold;
                text-decoration: none;
                display: inline-block;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(255,215,0,0.3);
                transition: all 0.3s ease;
            " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                <span style="font-size: 18px;">💝 Support via PayPal</span>
                <div style="font-size: 12px; margin-top: 4px; opacity: 0.8;">Secure donation</div>
            </div>
        `;
        
        container.appendChild(button);
    }

    /**
     * Generate PayPal donation link
     */
    generateDonationLink(options = {}) {
        const params = new URLSearchParams({
            cmd: '_donations',
            business: this.paypalEmail,
            item_name: options.itemName || 'Support BarbrickDesign Development',
            currency_code: this.config.currency,
            return: window.location.href + '?donation=success',
            cancel_return: window.location.href + '?donation=cancel'
        });

        if (options.amount) {
            params.append('amount', options.amount.toFixed(2));
        }

        return `https://www.paypal.com/cgi-bin/webscr?${params.toString()}`;
    }

    /**
     * Create subscription button
     */
    createSubscriptionButton(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return;
        }

        const amount = options.amount || 10.00;
        const period = options.period || 'M'; // M = monthly, Y = yearly
        const description = options.description || 'Monthly Subscription';

        container.innerHTML = '';
        
        const button = document.createElement('a');
        button.href = this.generateSubscriptionLink(amount, period, description);
        button.target = '_blank';
        button.className = 'paypal-subscription-button';
        button.innerHTML = `
            <div style="
                background: #0070ba;
                color: white;
                padding: 15px 30px;
                border-radius: 10px;
                text-align: center;
                font-weight: bold;
                text-decoration: none;
                display: inline-block;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(0,112,186,0.3);
                transition: all 0.3s ease;
            " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                <span style="font-size: 18px;">🔄 Subscribe</span>
                <div style="font-size: 14px; margin-top: 4px;">$${amount.toFixed(2)}/${period === 'M' ? 'month' : 'year'}</div>
            </div>
        `;
        
        container.appendChild(button);
    }

    /**
     * Generate PayPal subscription link
     */
    generateSubscriptionLink(amount, period, description) {
        const params = new URLSearchParams({
            cmd: '_xclick-subscriptions',
            business: this.paypalEmail,
            item_name: description,
            currency_code: this.config.currency,
            a3: amount.toFixed(2), // Amount for each billing cycle
            p3: '1', // Duration of each billing cycle
            t3: period, // M for monthly, Y for yearly
            src: '1', // Make recurring
            return: window.location.href + '?subscription=success',
            cancel_return: window.location.href + '?subscription=cancel'
        });

        return `https://www.paypal.com/cgi-bin/webscr?${params.toString()}`;
    }

    /**
     * Process contractor payment
     */
    async processContractorPayment(contractorAddress, amount, reason) {
        console.log(`💰 Processing payment: $${amount} to ${contractorAddress}`);
        
        const payment = {
            id: this.generatePaymentId(),
            contractorAddress: contractorAddress,
            amount: amount,
            reason: reason,
            status: 'pending',
            timestamp: new Date().toISOString(),
            paypalEmail: this.paypalEmail
        };

        this.pendingPayments.push(payment);
        this.saveTransactions();

        // If contractor system is available, record the payment
        if (this.contractorSystem) {
            try {
                // This would integrate with the contractor system
                console.log('📝 Recording payment in contractor system');
            } catch (error) {
                console.error('Failed to record payment in contractor system:', error);
            }
        }

        return payment;
    }

    /**
     * Handle successful payment
     */
    handleSuccessfulPayment(order) {
        console.log('✅ Payment successful:', order);
        
        const transaction = {
            id: order.id,
            status: 'completed',
            amount: order.purchase_units[0].amount.value,
            timestamp: new Date().toISOString(),
            details: order
        };

        this.transactions.push(transaction);
        this.saveTransactions();

        // Remove from pending if it exists
        this.pendingPayments = this.pendingPayments.filter(p => p.id !== order.id);

        // Emit event for UI updates
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('paypal-payment-success', { 
                detail: transaction 
            }));
        }

        // Show success message
        this.showNotification('Payment successful! Thank you for your support.', 'success');
    }

    /**
     * Handle payment error
     */
    handlePaymentError(error) {
        console.error('❌ Payment error:', error);
        
        // Emit event for UI updates
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('paypal-payment-error', { 
                detail: { error: error } 
            }));
        }

        // Show error message
        this.showNotification('Payment failed. Please try again.', 'error');
    }

    /**
     * Check URL for payment status
     */
    checkPaymentStatus() {
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.get('payment') === 'success') {
            this.showNotification('Payment completed successfully!', 'success');
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (urlParams.get('payment') === 'cancel') {
            this.showNotification('Payment was cancelled.', 'info');
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (urlParams.get('donation') === 'success') {
            this.showNotification('Thank you for your generous donation!', 'success');
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (urlParams.get('subscription') === 'success') {
            this.showNotification('Subscription activated successfully!', 'success');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    /**
     * Generate payment ID
     */
    generatePaymentId() {
        return `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }

    /**
     * Load transactions from localStorage
     */
    loadTransactions() {
        try {
            const stored = localStorage.getItem('paypal_transactions');
            if (stored) {
                const data = JSON.parse(stored);
                this.transactions = data.transactions || [];
                this.pendingPayments = data.pendingPayments || [];
            }
        } catch (error) {
            console.error('Failed to load transactions:', error);
        }
    }

    /**
     * Save transactions to localStorage
     */
    saveTransactions() {
        try {
            const data = {
                transactions: this.transactions,
                pendingPayments: this.pendingPayments,
                lastSaved: new Date().toISOString()
            };
            localStorage.setItem('paypal_transactions', JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save transactions:', error);
        }
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'paypal-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        `;

        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8',
            warning: '#ffc107'
        };

        notification.style.background = colors[type] || colors.info;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }

    /**
     * Get transaction history
     */
    getTransactionHistory() {
        return {
            transactions: this.transactions,
            pendingPayments: this.pendingPayments,
            totalTransactions: this.transactions.length,
            totalAmount: this.transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
        };
    }

    /**
     * Export transactions
     */
    exportTransactions() {
        const exportData = {
            paypalEmail: this.paypalEmail,
            timestamp: new Date().toISOString(),
            transactions: this.transactions,
            pendingPayments: this.pendingPayments,
            summary: {
                totalTransactions: this.transactions.length,
                totalAmount: this.transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
            }
        };

        return JSON.stringify(exportData, null, 2);
    }
}

// Add animation styles
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize globally if in browser
if (typeof window !== 'undefined') {
    window.PayPalPaymentIntegration = PayPalPaymentIntegration;
    
    // Auto-initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.paypalIntegration = new PayPalPaymentIntegration();
            window.paypalIntegration.checkPaymentStatus();
        });
    } else {
        window.paypalIntegration = new PayPalPaymentIntegration();
        window.paypalIntegration.checkPaymentStatus();
    }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PayPalPaymentIntegration;
}
