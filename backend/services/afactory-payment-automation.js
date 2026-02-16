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
 * File: afactory-payment-automation.js
 * Declaration ID: IP-86FDCB5-MLL28ZUK
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
 * AFACTORY PAYMENT AUTOMATION SERVICE
 * 
 * Handles real-world payment automation for aFactory.html
 * Processes actual PayPal Payouts to BarbrickDesign@gmail.com
 * 
 * This is NOT a simulation - this handles real money transfers
 */

const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

class AFactoryPaymentAutomation {
    constructor(config = {}) {
        this.config = {
            // PayPal Configuration
            paypalClientId: config.paypalClientId || process.env.PAYPAL_CLIENT_ID,
            paypalSecret: config.paypalSecret || process.env.PAYPAL_SECRET,
            paypalMode: config.paypalMode || process.env.PAYPAL_MODE || 'sandbox', // 'sandbox' or 'live'
            
            // Payment Destination
            recipientEmail: 'BarbrickDesign@gmail.com',
            
            // Payout Thresholds
            minimumPayout: parseFloat(config.minimumPayout || process.env.MIN_PAYOUT || '10.00'),
            maximumPayout: parseFloat(config.maximumPayout || process.env.MAX_PAYOUT || '10000.00'),
            
            // Scheduling
            autoPayoutEnabled: config.autoPayoutEnabled !== false,
            payoutSchedule: config.payoutSchedule || 'daily', // 'daily', 'weekly', 'monthly', 'threshold'
            
            // Security
            apiKey: config.apiKey || process.env.AFACTORY_API_KEY || this.generateApiKey(),
            webhookSecret: config.webhookSecret || process.env.WEBHOOK_SECRET || this.generateApiKey(),
            
            // Logging
            logLevel: config.logLevel || 'info',
            enableAuditLog: config.enableAuditLog !== false,
        };

        // State Management
        this.pendingPayments = [];
        this.completedPayments = [];
        this.failedPayments = [];
        this.revenueBalance = 0;
        this.lastPayout = null;
        
        // PayPal Access Token
        this.accessToken = null;
        this.tokenExpiry = null;

        // Initialize
        this.init();
    }

    /**
     * Initialize the payment automation service
     */
    async init() {
        console.log('🚀 Initializing aFactory Payment Automation Service...');
        console.log(`   Mode: ${this.config.paypalMode}`);
        console.log(`   Recipient: ${this.config.recipientEmail}`);
        console.log(`   Min Payout: $${this.config.minimumPayout}`);
        console.log(`   Schedule: ${this.config.payoutSchedule}`);
        
        // Load persisted state if available
        this.loadState();
        
        // Authenticate with PayPal
        await this.authenticatePayPal();
        
        console.log('✅ aFactory Payment Automation Service initialized');
    }

    /**
     * Generate API Key
     */
    generateApiKey() {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Get PayPal API Base URL
     */
    getPayPalBaseUrl() {
        return this.config.paypalMode === 'live' 
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';
    }

    /**
     * Authenticate with PayPal and get access token
     */
    async authenticatePayPal() {
        try {
            // Check if we have a valid token
            if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
                return this.accessToken;
            }

            console.log('🔐 Authenticating with PayPal...');

            const auth = Buffer.from(
                `${this.config.paypalClientId}:${this.config.paypalSecret}`
            ).toString('base64');

            const response = await axios({
                method: 'POST',
                url: `${this.getPayPalBaseUrl()}/v1/oauth2/token`,
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                data: 'grant_type=client_credentials'
            });

            this.accessToken = response.data.access_token;
            // Token expires in seconds, convert to timestamp and subtract 5 minutes for safety
            this.tokenExpiry = Date.now() + ((response.data.expires_in - 300) * 1000);

            console.log('✅ PayPal authentication successful');
            return this.accessToken;

        } catch (error) {
            console.error('❌ PayPal authentication failed:', error.response?.data || error.message);
            throw new Error('Failed to authenticate with PayPal');
        }
    }

    /**
     * Record revenue from agent activities
     */
    recordRevenue(amount, source, metadata = {}) {
        const record = {
            id: this.generateTransactionId(),
            timestamp: new Date().toISOString(),
            amount: parseFloat(amount),
            source,
            metadata,
            status: 'pending'
        };

        this.revenueBalance += record.amount;
        this.pendingPayments.push(record);

        this.log('info', `💰 Revenue recorded: $${amount} from ${source}`);
        this.saveState();

        // Check if we should trigger automatic payout
        if (this.config.autoPayoutEnabled && this.shouldTriggerPayout()) {
            this.processPayout().catch(err => {
                this.log('error', 'Auto-payout failed:', err);
            });
        }

        return record;
    }

    /**
     * Check if automatic payout should be triggered
     */
    shouldTriggerPayout() {
        // Check threshold
        if (this.config.payoutSchedule === 'threshold') {
            return this.revenueBalance >= this.config.minimumPayout;
        }

        // Check schedule-based triggers
        if (!this.lastPayout) {
            return this.revenueBalance >= this.config.minimumPayout;
        }

        const lastPayoutDate = new Date(this.lastPayout);
        const now = new Date();
        const daysSinceLastPayout = (now - lastPayoutDate) / (1000 * 60 * 60 * 24);

        switch (this.config.payoutSchedule) {
            case 'daily':
                return daysSinceLastPayout >= 1 && this.revenueBalance >= this.config.minimumPayout;
            case 'weekly':
                return daysSinceLastPayout >= 7 && this.revenueBalance >= this.config.minimumPayout;
            case 'monthly':
                return daysSinceLastPayout >= 30 && this.revenueBalance >= this.config.minimumPayout;
            default:
                return false;
        }
    }

    /**
     * Process payout to BarbrickDesign@gmail.com via PayPal Payouts API
     */
    async processPayout(amount = null) {
        try {
            // Use specified amount or entire balance
            const payoutAmount = amount || this.revenueBalance;

            // Validate payout amount
            if (payoutAmount < this.config.minimumPayout) {
                throw new Error(`Payout amount $${payoutAmount} is below minimum $${this.config.minimumPayout}`);
            }

            if (payoutAmount > this.config.maximumPayout) {
                throw new Error(`Payout amount $${payoutAmount} exceeds maximum $${this.config.maximumPayout}`);
            }

            if (payoutAmount > this.revenueBalance) {
                throw new Error(`Insufficient balance. Available: $${this.revenueBalance}, Requested: $${payoutAmount}`);
            }

            this.log('info', `💸 Processing payout of $${payoutAmount} to ${this.config.recipientEmail}...`);

            // Ensure we have a valid access token
            await this.authenticatePayPal();

            // Create payout batch
            const payoutBatchId = this.generateBatchId();
            const senderBatchId = `afactory_${payoutBatchId}`;

            const payoutData = {
                sender_batch_header: {
                    sender_batch_id: senderBatchId,
                    email_subject: 'aFactory Autonomous Agent Revenue Payment',
                    email_message: 'You have received a payment from aFactory Autonomous Agent System for revenue generated by automated agent activities.',
                    recipient_type: 'EMAIL'
                },
                items: [
                    {
                        recipient_type: 'EMAIL',
                        amount: {
                            value: payoutAmount.toFixed(2),
                            currency: 'USD'
                        },
                        receiver: this.config.recipientEmail,
                        note: `aFactory revenue payout - Batch ${senderBatchId}`,
                        sender_item_id: this.generateTransactionId(),
                        recipient_wallet: 'PAYPAL'
                    }
                ]
            };

            // Execute PayPal Payout
            const response = await axios({
                method: 'POST',
                url: `${this.getPayPalBaseUrl()}/v1/payments/payouts`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.accessToken}`
                },
                data: payoutData
            });

            const payoutResult = {
                id: payoutBatchId,
                paypalBatchId: response.data.batch_header.payout_batch_id,
                senderBatchId: senderBatchId,
                amount: payoutAmount,
                recipient: this.config.recipientEmail,
                status: response.data.batch_header.batch_status,
                timestamp: new Date().toISOString(),
                links: response.data.links,
                items: response.data.items || []
            };

            // Update state
            this.revenueBalance -= payoutAmount;
            this.lastPayout = payoutResult.timestamp;
            this.completedPayments.push(payoutResult);

            // Move pending payments to completed
            this.pendingPayments = this.pendingPayments.map(payment => ({
                ...payment,
                status: 'completed',
                payoutBatchId: payoutBatchId
            }));

            this.saveState();

            this.log('info', `✅ Payout successful! Batch ID: ${response.data.batch_header.payout_batch_id}`);
            
            return payoutResult;

        } catch (error) {
            const errorRecord = {
                timestamp: new Date().toISOString(),
                amount: amount || this.revenueBalance,
                error: error.response?.data || error.message,
                stack: error.stack
            };

            this.failedPayments.push(errorRecord);
            this.saveState();

            this.log('error', '❌ Payout failed:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get payout status from PayPal
     */
    async getPayoutStatus(payoutBatchId) {
        try {
            await this.authenticatePayPal();

            const response = await axios({
                method: 'GET',
                url: `${this.getPayPalBaseUrl()}/v1/payments/payouts/${payoutBatchId}`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            return {
                batchId: response.data.batch_header.payout_batch_id,
                status: response.data.batch_header.batch_status,
                timeCreated: response.data.batch_header.time_created,
                amount: response.data.batch_header.amount,
                items: response.data.items || []
            };

        } catch (error) {
            this.log('error', 'Failed to get payout status:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get current balance and statistics
     */
    getStats() {
        return {
            currentBalance: this.revenueBalance,
            lastPayout: this.lastPayout,
            pendingPayments: this.pendingPayments.length,
            completedPayments: this.completedPayments.length,
            failedPayments: this.failedPayments.length,
            totalRevenue: this.completedPayments.reduce((sum, p) => sum + p.amount, 0) + this.revenueBalance,
            totalPaidOut: this.completedPayments.reduce((sum, p) => sum + p.amount, 0),
            recipientEmail: this.config.recipientEmail,
            autoPayoutEnabled: this.config.autoPayoutEnabled,
            minimumPayout: this.config.minimumPayout,
            nextAutoPayoutReady: this.shouldTriggerPayout()
        };
    }

    /**
     * Generate transaction ID
     */
    generateTransactionId() {
        return `TXN_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    }

    /**
     * Generate batch ID
     */
    generateBatchId() {
        return `BATCH_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    }

    /**
     * Save state to persistent storage
     */
    saveState() {
        if (typeof localStorage !== 'undefined') {
            const state = {
                revenueBalance: this.revenueBalance,
                lastPayout: this.lastPayout,
                pendingPayments: this.pendingPayments,
                completedPayments: this.completedPayments.slice(-50), // Keep last 50
                failedPayments: this.failedPayments.slice(-20) // Keep last 20
            };
            localStorage.setItem('afactory_payment_state', JSON.stringify(state));
        }
    }

    /**
     * Load state from persistent storage
     */
    loadState() {
        if (typeof localStorage !== 'undefined') {
            try {
                const state = JSON.parse(localStorage.getItem('afactory_payment_state') || '{}');
                this.revenueBalance = state.revenueBalance || 0;
                this.lastPayout = state.lastPayout || null;
                this.pendingPayments = state.pendingPayments || [];
                this.completedPayments = state.completedPayments || [];
                this.failedPayments = state.failedPayments || [];
                
                this.log('info', `Loaded state: Balance $${this.revenueBalance}, ${this.completedPayments.length} completed payouts`);
            } catch (error) {
                this.log('error', 'Failed to load state:', error.message);
            }
        }
    }

    /**
     * Logging utility
     */
    log(level, ...args) {
        const levels = ['error', 'warn', 'info', 'debug'];
        const configLevel = levels.indexOf(this.config.logLevel);
        const messageLevel = levels.indexOf(level);

        if (messageLevel <= configLevel) {
            console[level]('[aFactory Payment Automation]', ...args);
        }
    }

    /**
     * Create Express router for API endpoints
     */
    createRouter() {
        const router = express.Router();

        // Middleware to verify API key
        const verifyApiKey = (req, res, next) => {
            const apiKey = req.headers['x-api-key'];
            if (!apiKey || apiKey !== this.config.apiKey) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            next();
        };

        // Record revenue endpoint
        router.post('/revenue', verifyApiKey, (req, res) => {
            try {
                const { amount, source, metadata } = req.body;
                
                if (!amount || isNaN(amount) || amount <= 0) {
                    return res.status(400).json({ error: 'Invalid amount' });
                }

                const record = this.recordRevenue(amount, source || 'unknown', metadata || {});
                res.json({ success: true, record, stats: this.getStats() });

            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Trigger payout endpoint
        router.post('/payout', verifyApiKey, async (req, res) => {
            try {
                const { amount } = req.body;
                const result = await this.processPayout(amount);
                res.json({ success: true, payout: result, stats: this.getStats() });

            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Get payout status endpoint
        router.get('/payout/:batchId', verifyApiKey, async (req, res) => {
            try {
                const status = await this.getPayoutStatus(req.params.batchId);
                res.json({ success: true, status });

            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Get stats endpoint
        router.get('/stats', verifyApiKey, (req, res) => {
            res.json({ success: true, stats: this.getStats() });
        });

        // Health check endpoint (no auth required)
        router.get('/health', (req, res) => {
            res.json({ 
                status: 'healthy',
                service: 'afactory-payment-automation',
                timestamp: new Date().toISOString(),
                hasToken: !!this.accessToken,
                balance: this.revenueBalance
            });
        });

        return router;
    }
}

// Export for use in backend service
module.exports = AFactoryPaymentAutomation;

// If running as standalone service
if (require.main === module) {
    const app = express();
    app.use(express.json());

    const paymentService = new AFactoryPaymentAutomation();
    app.use('/api/payments', paymentService.createRouter());

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`🚀 aFactory Payment Automation Service running on port ${PORT}`);
        console.log(`   API Key: ${paymentService.config.apiKey}`);
        console.log(`   Recipient: ${paymentService.config.recipientEmail}`);
    });
}
