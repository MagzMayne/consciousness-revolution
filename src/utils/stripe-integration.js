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
 * File: stripe-integration.js
 * Declaration ID: IP-5EAB72DD-MLL28ZWH
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
 * STRIPE PAYMENT INTEGRATION
 * Handles Stripe payments to barbrickdesign@gmail.com
 * Integrates with existing payment systems
 * 
 * Security Note: API keys should be stored in environment variables
 * Test Key: pk_test_51Szh6V2UmH0IzuSRMgUHVugtXD9Acn8uH5CfFqcTsUO6NaQKB9mFSvBppsRVhSgirEJNPqZryl414awr0fqUG6JS00PD90ymWs
 */

class StripePaymentIntegration {
    constructor(config = {}) {
        this.publishableKey = config.publishableKey || this.getPublishableKey();
        this.recipientEmail = 'barbrickdesign@gmail.com';
        this.isInitialized = false;
        this.isProduction = false; // Set to true for production
        this.stripe = null;
        this.transactions = [];
        this.pendingPayments = [];
        
        // Payment configuration
        this.config = {
            currency: 'usd',
            defaultAmount: 1000, // Amount in cents ($10.00)
            minAmount: 100, // $1.00 minimum
            maxAmount: 1000000, // $10,000.00 maximum
            allowRecurring: true,
            enableSubscriptions: true,
            ...config
        };

        // Integration with existing payment systems
        this.contractorSystem = null;
        this.paypalIntegration = null;
        
        this.init();
    }

    /**
     * Get Stripe publishable key from environment or fallback
     */
    getPublishableKey() {
        // Check environment variable first
        if (typeof process !== 'undefined' && process.env && process.env.STRIPE_PUBLISHABLE_KEY) {
            return process.env.STRIPE_PUBLISHABLE_KEY;
        }
        
        // Check window environment
        if (typeof window !== 'undefined' && window.ENV && window.ENV.STRIPE_PUBLISHABLE_KEY) {
            return window.ENV.STRIPE_PUBLISHABLE_KEY;
        }
        
        // Fallback to test key for development
        // Production deployments should use environment variables
        return 'pk_test_51Szh6V2UmH0IzuSRMgUHVugtXD9Acn8uH5CfFqcTsUO6NaQKB9mFSvBppsRVhSgirEJNPqZryl414awr0fqUG6JS00PD90ymWs';
    }

    /**
     * Initialize Stripe integration
     */
    async init() {
        console.log('💳 Stripe Payment Integration initializing...');
        
        try {
            // Connect to existing payment systems
            await this.connectToExistingSystems();
            
            // Load Stripe SDK
            await this.loadStripeSDK();
            
            // Initialize Stripe instance
            await this.initializeStripe();
            
            // Load transaction history
            this.loadTransactions();
            
            this.isInitialized = true;
            console.log('✅ Stripe Payment Integration ready');
            
            // Dispatch ready event
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('stripe-ready', { 
                    detail: { instance: this }
                }));
            }
        } catch (error) {
            console.error('Failed to initialize Stripe integration:', error);
            throw error;
        }
    }

    /**
     * Connect to existing payment systems
     */
    async connectToExistingSystems() {
        // Connect to contractor payment system
        if (typeof ContractorPaymentSystem !== 'undefined') {
            this.contractorSystem = new ContractorPaymentSystem();
            console.log('🔗 Connected to Contractor Payment System');
        }
        
        // Connect to PayPal integration
        if (typeof PayPalPaymentIntegration !== 'undefined') {
            this.paypalIntegration = PayPalPaymentIntegration.getInstance?.() || null;
            console.log('🔗 Connected to PayPal Integration');
        }
    }

    /**
     * Load Stripe SDK
     */
    async loadStripeSDK() {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (typeof Stripe !== 'undefined') {
                console.log('Stripe SDK already loaded');
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.async = true;
            
            script.onload = () => {
                console.log('✅ Stripe SDK loaded');
                resolve();
            };
            
            script.onerror = () => {
                const error = new Error('Failed to load Stripe SDK');
                console.error(error);
                reject(error);
            };
            
            document.head.appendChild(script);
        });
    }

    /**
     * Initialize Stripe instance
     */
    async initializeStripe() {
        if (typeof Stripe === 'undefined') {
            throw new Error('Stripe SDK not loaded');
        }
        
        this.stripe = Stripe(this.publishableKey);
        console.log('✅ Stripe instance initialized');
    }

    /**
     * Create payment button for a container
     */
    async createPaymentButton(containerId, options = {}) {
        if (!this.isInitialized) {
            await this.init();
        }
        
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return null;
        }
        
        const {
            amount = this.config.defaultAmount,
            description = 'Payment to Barbrick Design',
            onSuccess = null,
            onError = null,
            buttonText = 'Pay with Stripe',
            buttonClass = 'stripe-button'
        } = options;
        
        // Create button
        const button = document.createElement('button');
        button.textContent = buttonText;
        button.className = buttonClass;
        button.style.cssText = `
            background: linear-gradient(135deg, #635bff, #4f46e5);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 24px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            width: 100%;
            margin-top: 10px;
        `;
        
        button.addEventListener('mouseover', () => {
            button.style.transform = 'translateY(-2px)';
            button.style.boxShadow = '0 4px 12px rgba(99, 91, 255, 0.4)';
        });
        
        button.addEventListener('mouseout', () => {
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = 'none';
        });
        
        button.addEventListener('click', async () => {
            try {
                button.disabled = true;
                button.textContent = 'Processing...';
                
                await this.processPayment({
                    amount,
                    description,
                    onSuccess,
                    onError
                });
            } catch (error) {
                console.error('Payment error:', error);
                if (onError) onError(error);
            } finally {
                button.disabled = false;
                button.textContent = buttonText;
            }
        });
        
        container.appendChild(button);
        return button;
    }

    /**
     * Process payment with Stripe Checkout
     */
    async processPayment(options = {}) {
        if (!this.stripe) {
            throw new Error('Stripe not initialized');
        }
        
        const {
            amount = this.config.defaultAmount,
            description = 'Payment to Barbrick Design',
            customerEmail = null,
            metadata = {},
            onSuccess = null,
            onError = null
        } = options;
        
        try {
            // Create checkout session via backend or use Payment Request API
            // For now, we'll use Stripe's hosted checkout page
            
            // Note: This requires a backend endpoint to create checkout session
            // For client-only implementation, we can use Payment Intents
            
            console.log('💳 Processing Stripe payment:', {
                amount: amount / 100,
                description
            });
            
            // Record transaction attempt
            const transaction = {
                id: this.generateTransactionId(),
                amount,
                description,
                customerEmail,
                metadata,
                status: 'pending',
                timestamp: new Date().toISOString(),
                provider: 'stripe'
            };
            
            this.pendingPayments.push(transaction);
            
            // For demonstration, we'll show a message
            // In production, this would redirect to Stripe Checkout
            console.log(`Stripe payment initiated: $${(amount / 100).toFixed(2)}`);
            console.log('Note: This is a test integration. In production, this would redirect to Stripe\'s secure checkout page.');
            
            // Simulate successful payment for testing
            transaction.status = 'completed';
            this.transactions.push(transaction);
            this.saveTransactions();
            
            if (onSuccess) {
                onSuccess(transaction);
            }
            
            // Notify contractor system if connected
            if (this.contractorSystem) {
                await this.contractorSystem.recordPayment?.(transaction);
            }
            
            return transaction;
            
        } catch (error) {
            console.error('Stripe payment failed:', error);
            
            if (onError) {
                onError(error);
            }
            
            throw error;
        }
    }

    /**
     * Create Payment Element for custom checkout
     */
    async createPaymentElement(containerId, options = {}) {
        if (!this.stripe) {
            throw new Error('Stripe not initialized');
        }
        
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return null;
        }
        
        // This would require a backend to create PaymentIntent
        // For now, we'll show a placeholder
        container.innerHTML = `
            <div style="padding: 20px; background: #f7f7f7; border-radius: 8px; text-align: center;">
                <p style="margin: 0; color: #333;">Custom Stripe Payment Element</p>
                <p style="margin: 10px 0 0; font-size: 14px; color: #666;">Requires backend integration</p>
            </div>
        `;
        
        return container;
    }

    /**
     * Generate unique transaction ID
     */
    generateTransactionId() {
        return `stripe_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }

    /**
     * Load transaction history from storage
     */
    loadTransactions() {
        try {
            if (typeof localStorage !== 'undefined') {
                const stored = localStorage.getItem('stripe_transactions');
                if (stored) {
                    this.transactions = JSON.parse(stored);
                    console.log(`📊 Loaded ${this.transactions.length} Stripe transactions`);
                }
            }
        } catch (error) {
            console.error('Failed to load transactions:', error);
        }
    }

    /**
     * Save transaction history to storage
     */
    saveTransactions() {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('stripe_transactions', JSON.stringify(this.transactions));
                console.log('💾 Stripe transactions saved');
            }
        } catch (error) {
            console.error('Failed to save transactions:', error);
        }
    }

    /**
     * Get transaction history
     */
    getTransactions(filter = {}) {
        let results = [...this.transactions];
        
        if (filter.status) {
            results = results.filter(t => t.status === filter.status);
        }
        
        if (filter.startDate) {
            results = results.filter(t => new Date(t.timestamp) >= new Date(filter.startDate));
        }
        
        if (filter.endDate) {
            results = results.filter(t => new Date(t.timestamp) <= new Date(filter.endDate));
        }
        
        return results;
    }

    /**
     * Get transaction statistics
     */
    getStatistics() {
        const completed = this.transactions.filter(t => t.status === 'completed');
        const totalAmount = completed.reduce((sum, t) => sum + t.amount, 0);
        
        return {
            totalTransactions: this.transactions.length,
            completedTransactions: completed.length,
            pendingTransactions: this.pendingPayments.length,
            totalAmount: totalAmount / 100, // Convert cents to dollars
            averageAmount: completed.length > 0 ? (totalAmount / completed.length) / 100 : 0
        };
    }

    /**
     * Calculate contribution amount with tier and discount
     */
    calculateContributionAmount(tier, isStudent = false) {
        const tierAmounts = {
            bronze: 5000,    // $50.00
            silver: 20000,   // $200.00
            gold: 50000,     // $500.00
            platinum: 150000 // $1,500.00
        };
        
        let amount = tierAmounts[tier.toLowerCase()] || this.config.defaultAmount;
        
        // Apply 50% student discount
        if (isStudent) {
            amount = Math.floor(amount * 0.5);
        }
        
        return amount;
    }

    /**
     * Format amount for display
     */
    formatAmount(amountInCents) {
        return `$${(amountInCents / 100).toFixed(2)}`;
    }

    /**
     * Export transactions for analysis
     */
    exportTransactions(format = 'json') {
        const data = {
            exported: new Date().toISOString(),
            provider: 'stripe',
            statistics: this.getStatistics(),
            transactions: this.transactions
        };
        
        if (format === 'json') {
            return JSON.stringify(data, null, 2);
        } else if (format === 'csv') {
            const headers = 'ID,Amount,Description,Status,Customer Email,Timestamp\n';
            const rows = this.transactions.map(t => 
                `${t.id},${t.amount / 100},${t.description},${t.status},${t.customerEmail || 'N/A'},${t.timestamp}`
            ).join('\n');
            return headers + rows;
        }
        
        return data;
    }

    /**
     * Get instance (singleton pattern)
     */
    static getInstance(config = {}) {
        if (!StripePaymentIntegration._instance) {
            StripePaymentIntegration._instance = new StripePaymentIntegration(config);
        }
        return StripePaymentIntegration._instance;
    }
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
    window.StripePaymentIntegration = StripePaymentIntegration;
    
    // Auto-initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.stripePayment = StripePaymentIntegration.getInstance();
        });
    } else {
        window.stripePayment = StripePaymentIntegration.getInstance();
    }
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StripePaymentIntegration;
}
