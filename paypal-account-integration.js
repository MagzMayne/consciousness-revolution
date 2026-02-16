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
 * File: paypal-account-integration.js
 * Declaration ID: IP-7CFBD75D-MLL28ZVK
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * PayPal Account Integration System
 * Handles PayPal account linking, payment tracking, and webhook processing
 * 
 * @author Barbrick Design
 * @date 2026-01-20
 */

(function() {
    'use strict';

    class PayPalAccountIntegration {
        constructor() {
            this.isInitialized = false;
            this.linkedAccount = null;
            this.webhookEndpoint = '';
            this.donations = [];
            this.subscriptions = [];
        }

        /**
         * Initialize PayPal Integration
         */
        async init(config = {}) {
            if (this.isInitialized) {
                console.log('⚠️ PayPal Integration already initialized');
                return;
            }

            this.config = {
                clientId: config.clientId || this.getClientIdFromConfig(),
                email: config.email || 'BarbrickDesign@gmail.com',
                webhookEndpoint: config.webhookEndpoint || '/api/webhooks/paypal',
                environment: config.environment || 'production' // 'sandbox' or 'production'
            };

            // Load PayPal SDK
            await this.loadPayPalSDK();

            // Restore linked account if exists
            this.restoreLinkedAccount();

            this.isInitialized = true;
            console.log('✅ PayPal Integration initialized');
        }

        /**
         * Load PayPal SDK
         */
        loadPayPalSDK() {
            return new Promise((resolve, reject) => {
                // Check if already loaded
                if (window.paypal) {
                    resolve();
                    return;
                }

                const script = document.createElement('script');
                const clientId = this.config.clientId || 'sb'; // Use sandbox for demo
                script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture`;
                script.async = true;
                script.defer = true;
                script.onload = resolve;
                script.onerror = () => {
                    console.warn('⚠️ PayPal SDK load failed, using fallback mode');
                    resolve(); // Continue without SDK for now
                };
                document.head.appendChild(script);
            });
        }

        /**
         * Link PayPal account to user
         */
        async linkAccount(userEmail) {
            if (!userEmail) {
                return {
                    success: false,
                    error: 'User email required'
                };
            }

            // Create linked account record
            this.linkedAccount = {
                userEmail: userEmail,
                paypalEmail: this.config.email,
                linkedAt: new Date().toISOString(),
                status: 'pending_verification',
                tier: null,
                totalDonated: 0
            };

            // Store in localStorage
            localStorage.setItem('paypal_linked_account', JSON.stringify(this.linkedAccount));

            console.log('✅ PayPal account linked:', userEmail);

            return {
                success: true,
                account: this.linkedAccount
            };
        }

        /**
         * Unlink PayPal account
         */
        unlinkAccount() {
            if (this.linkedAccount) {
                const email = this.linkedAccount.userEmail;
                this.linkedAccount = null;
                localStorage.removeItem('paypal_linked_account');
                console.log('👋 PayPal account unlinked:', email);
                return { success: true };
            }
            return { success: false, error: 'No account linked' };
        }

        /**
         * Restore linked account from storage
         */
        restoreLinkedAccount() {
            const stored = localStorage.getItem('paypal_linked_account');
            if (stored) {
                try {
                    this.linkedAccount = JSON.parse(stored);
                    console.log('✅ Restored PayPal linked account:', this.linkedAccount.userEmail);
                } catch (error) {
                    console.error('Error restoring linked account:', error);
                }
            }
        }

        /**
         * Process donation/payment
         */
        async processDonation(donationData) {
            const donation = {
                id: 'don_' + Date.now(),
                userEmail: donationData.userEmail || this.linkedAccount?.userEmail,
                amount: donationData.amount,
                currency: donationData.currency || 'USD',
                tier: donationData.tier,
                timestamp: new Date().toISOString(),
                status: 'pending',
                paypalEmail: this.config.email,
                transactionId: donationData.transactionId || null
            };

            // Store donation
            this.donations.push(donation);
            this.saveDonations();

            // Update linked account
            if (this.linkedAccount) {
                this.linkedAccount.totalDonated += donationData.amount;
                this.linkedAccount.tier = donationData.tier;
                this.linkedAccount.status = 'active';
                localStorage.setItem('paypal_linked_account', JSON.stringify(this.linkedAccount));
            }

            console.log('✅ Donation processed:', donation.id);

            // Trigger webhook simulation
            this.simulateWebhook({
                event_type: 'PAYMENT.CAPTURE.COMPLETED',
                resource: {
                    id: donation.transactionId,
                    amount: {
                        currency_code: donation.currency,
                        value: donation.amount
                    },
                    custom_id: donation.userEmail,
                    create_time: donation.timestamp
                }
            });

            return {
                success: true,
                donation: donation
            };
        }

        /**
         * Simulate webhook for testing (replace with real webhook in production)
         */
        simulateWebhook(event) {
            console.log('📨 Webhook event:', event.event_type);

            // Handle different event types
            switch (event.event_type) {
                case 'PAYMENT.CAPTURE.COMPLETED':
                    this.handlePaymentCompleted(event);
                    break;
                case 'BILLING.SUBSCRIPTION.CREATED':
                    this.handleSubscriptionCreated(event);
                    break;
                case 'BILLING.SUBSCRIPTION.CANCELLED':
                    this.handleSubscriptionCancelled(event);
                    break;
                default:
                    console.log('Unhandled webhook event:', event.event_type);
            }

            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('paypalWebhook', {
                detail: event
            }));
        }

        /**
         * Handle payment completed webhook
         */
        handlePaymentCompleted(event) {
            const amount = parseFloat(event.resource.amount.value);
            const userEmail = event.resource.custom_id;

            console.log(`💰 Payment completed: $${amount} from ${userEmail}`);

            // Find and update donation
            const donation = this.donations.find(d => 
                d.transactionId === event.resource.id || d.userEmail === userEmail
            );

            if (donation) {
                donation.status = 'completed';
                donation.completedAt = event.resource.create_time;
                this.saveDonations();
            }

            // Update user tier based on amount
            this.updateUserTier(userEmail, amount);

            // Notify hub
            this.notifyHub({
                type: 'donation_received',
                userEmail: userEmail,
                amount: amount,
                tier: this.getTierForAmount(amount)
            });
        }

        /**
         * Handle subscription created webhook
         */
        handleSubscriptionCreated(event) {
            const subscription = {
                id: event.resource.id,
                userEmail: event.resource.custom_id || event.resource.subscriber?.email_address,
                plan: event.resource.plan_id,
                status: event.resource.status,
                createdAt: event.resource.create_time,
                amount: event.resource.billing_info?.last_payment?.amount?.value || 0
            };

            this.subscriptions.push(subscription);
            this.saveSubscriptions();

            console.log('🔄 Subscription created:', subscription.id);

            this.notifyHub({
                type: 'subscription_created',
                userEmail: subscription.userEmail,
                plan: subscription.plan
            });
        }

        /**
         * Handle subscription cancelled webhook
         */
        handleSubscriptionCancelled(event) {
            const subscriptionId = event.resource.id;
            const subscription = this.subscriptions.find(s => s.id === subscriptionId);

            if (subscription) {
                subscription.status = 'cancelled';
                subscription.cancelledAt = new Date().toISOString();
                this.saveSubscriptions();
            }

            console.log('❌ Subscription cancelled:', subscriptionId);

            this.notifyHub({
                type: 'subscription_cancelled',
                subscriptionId: subscriptionId
            });
        }

        /**
         * Get tier for amount
         */
        getTierForAmount(amount) {
            if (amount >= 1500) return 'enterprise';
            if (amount >= 500) return 'professional';
            if (amount >= 200) return 'standard';
            if (amount >= 50) return 'basic';
            return null;
        }

        /**
         * Update user tier based on total donations
         */
        updateUserTier(userEmail, amount) {
            if (!this.linkedAccount || this.linkedAccount.userEmail !== userEmail) {
                return;
            }

            const tier = this.getTierForAmount(this.linkedAccount.totalDonated);
            if (tier) {
                this.linkedAccount.tier = tier;
                localStorage.setItem('paypal_linked_account', JSON.stringify(this.linkedAccount));

                // Update grant portal access
                const access = {
                    tier: tier,
                    email: userEmail,
                    amount: this.linkedAccount.totalDonated,
                    activatedAt: Date.now(),
                    expiryDate: Date.now() + (365 * 24 * 60 * 60 * 1000) // 1 year
                };
                localStorage.setItem('grant_portal_access', JSON.stringify(access));

                console.log(`✨ User tier updated to: ${tier}`);
            }
        }

        /**
         * Notify hub of updates
         */
        notifyHub(data) {
            // Store notification in hub
            const notifications = JSON.parse(localStorage.getItem('hub_notifications') || '[]');
            notifications.push({
                ...data,
                timestamp: new Date().toISOString(),
                id: 'notif_' + Date.now()
            });
            
            // Keep last 100 notifications
            if (notifications.length > 100) {
                notifications.shift();
            }
            
            localStorage.setItem('hub_notifications', JSON.stringify(notifications));

            // Dispatch event for real-time updates
            window.dispatchEvent(new CustomEvent('hubUpdate', {
                detail: data
            }));

            console.log('📢 Hub notified:', data.type);
        }

        /**
         * Get donation history
         */
        getDonationHistory(userEmail = null) {
            if (userEmail) {
                return this.donations.filter(d => d.userEmail === userEmail);
            }
            return this.donations;
        }

        /**
         * Get total donations
         */
        getTotalDonations() {
            return this.donations
                .filter(d => d.status === 'completed')
                .reduce((sum, d) => sum + d.amount, 0);
        }

        /**
         * Get linked account info
         */
        getLinkedAccount() {
            return this.linkedAccount;
        }

        /**
         * Save donations to storage
         */
        saveDonations() {
            localStorage.setItem('paypal_donations', JSON.stringify(this.donations));
        }

        /**
         * Load donations from storage
         */
        loadDonations() {
            const stored = localStorage.getItem('paypal_donations');
            if (stored) {
                try {
                    this.donations = JSON.parse(stored);
                } catch (error) {
                    console.error('Error loading donations:', error);
                }
            }
        }

        /**
         * Save subscriptions to storage
         */
        saveSubscriptions() {
            localStorage.setItem('paypal_subscriptions', JSON.stringify(this.subscriptions));
        }

        /**
         * Load subscriptions from storage
         */
        loadSubscriptions() {
            const stored = localStorage.getItem('paypal_subscriptions');
            if (stored) {
                try {
                    this.subscriptions = JSON.parse(stored);
                } catch (error) {
                    console.error('Error loading subscriptions:', error);
                }
            }
        }

        /**
         * Get client ID from config
         */
        getClientIdFromConfig() {
            const meta = document.querySelector('meta[name="paypal-client-id"]');
            if (meta) {
                return meta.getAttribute('content');
            }
            if (window.PAYPAL_CLIENT_ID) {
                return window.PAYPAL_CLIENT_ID;
            }
            return '';
        }
    }

    // Create global instance
    window.paypalAccountIntegration = new PayPalAccountIntegration();

    // Auto-initialize on load
    window.addEventListener('load', () => {
        window.paypalAccountIntegration.init();
        window.paypalAccountIntegration.loadDonations();
        window.paypalAccountIntegration.loadSubscriptions();
    });

    console.log('✅ PayPal Account Integration module loaded');
})();
