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
 * File: payment-processor.js
 * Declaration ID: IP-224FC774-MLL28ZWC
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * @aul-enabled
 * Payment Processor for TopStep Hub
 * Integrates with PayPal for subscription management
 * Sends payments to barbrickdesign@gmail.com
 */

class TopStepPaymentProcessor {
  constructor(authManager, tierManager, poolSystem = null) {
    this.authManager = authManager;
    this.tierManager = tierManager;
    this.poolSystem = poolSystem;
    this.paypalEmail = 'barbrickdesign@gmail.com';
    this.transactionsKey = 'topstep_hub_transactions';
    this.webhookEndpoint = '/api/webhooks/paypal'; // For production deployment
  }

  /**
   * Initialize payment for tier upgrade
   */
  async initiateTierUpgrade(tierName, containerId) {
    const user = this.authManager.getCurrentUser();
    if (!user) {
      throw new Error('User must be logged in to upgrade');
    }

    const tier = this.tierManager.getTier(tierName);
    if (!tier || tier.price === 0) {
      throw new Error('Invalid tier');
    }

    // Load PayPal integration if not already loaded
    if (!window.PayPalIntegration) {
      throw new Error('PayPal integration not loaded');
    }

    console.log(`Initiating payment for ${tier.name} tier ($${tier.price})`);

    // Render PayPal button
    return window.PayPalIntegration.renderButton(containerId, {
      amount: tier.price,
      description: `TopStep Hub - ${tier.name} Subscription (Monthly)`,
      customId: user.id, // For webhook identification
      onSuccess: (data) => this.handlePaymentSuccess(data, tierName),
      onError: (error) => this.handlePaymentError(error),
      onCancel: (data) => this.handlePaymentCancel(data)
    });
  }

  /**
   * Handle successful payment
   */
  async handlePaymentSuccess(paymentData, tierName) {
    const user = this.authManager.getCurrentUser();
    const tier = this.tierManager.getTier(tierName);

    // Calculate subscription end date (30 days from now)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    // Update user tier
    const subscriptionData = {
      startDate: new Date().toISOString(),
      endDate: endDate.toISOString(),
      paypalSubscriptionId: paymentData.orderID,
      transactionId: paymentData.orderID
    };

    this.authManager.updateUserTier(user.id, tierName, subscriptionData);

    // Record transaction
    const transaction = {
      userId: user.id,
      tierName: tierName,
      amount: tier.price,
      currency: 'USD',
      paymentProvider: 'PayPal',
      paypalOrderId: paymentData.orderID,
      paypalPayerId: paymentData.payerID,
      status: 'completed',
      timestamp: new Date().toISOString(),
      subscriptionData: subscriptionData
    };
    this.recordTransaction(transaction);

    // Add 50% of payment to profit pool
    if (this.poolSystem) {
      this.poolSystem.addPaymentContribution(
        user.id,
        tier.price,
        tierName,
        paymentData.orderID
      );
    }

    // Trigger webhook notification (simulated)
    this.triggerWebhook('subscription.created', {
      userId: user.id,
      tier: tierName,
      transaction: paymentData
    });

    // Trigger UI update callback
    if (window.handlePaymentSuccessCallback) {
      window.handlePaymentSuccessCallback(tierName);
    }

    return {
      success: true,
      message: `Successfully upgraded to ${tier.name}!`,
      tier: tierName,
      endDate: endDate
    };
  }

  /**
   * Handle payment error
   */
  handlePaymentError(error) {
    console.error('Payment error:', error);
    return {
      success: false,
      message: 'Payment failed. Please try again.',
      error: error
    };
  }

  /**
   * Handle payment cancellation
   */
  handlePaymentCancel(data) {
    console.log('Payment cancelled:', data);
    return {
      success: false,
      message: 'Payment cancelled',
      cancelled: true
    };
  }

  /**
   * Record transaction in local storage
   */
  recordTransaction(transaction) {
    try {
      const transactions = this.getTransactions();
      transactions.push(transaction);
      localStorage.setItem(this.transactionsKey, JSON.stringify(transactions));
    } catch (e) {
      console.error('Error recording transaction:', e);
    }
  }

  /**
   * Get all transactions for current user
   */
  getTransactions(userId = null) {
    try {
      const data = localStorage.getItem(this.transactionsKey);
      const allTransactions = data ? JSON.parse(data) : [];
      
      if (userId) {
        return allTransactions.filter(t => t.userId === userId);
      }
      
      return allTransactions;
    } catch (e) {
      console.error('Error loading transactions:', e);
      return [];
    }
  }

  /**
   * Check if subscription is active
   */
  isSubscriptionActive(user) {
    if (!user || !user.subscription || !user.subscription.endDate) {
      return false;
    }

    const endDate = new Date(user.subscription.endDate);
    const now = new Date();
    
    return now < endDate;
  }

  /**
   * Get days remaining in subscription
   */
  getDaysRemaining(user) {
    if (!this.isSubscriptionActive(user)) {
      return 0;
    }

    const endDate = new Date(user.subscription.endDate);
    const now = new Date();
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }

  /**
   * Simulate webhook trigger to backend
   */
  triggerWebhook(event, data) {
    // In production, this would send to: barbrickdesign@gmail.com webhook endpoint
    console.log('Webhook triggered:', {
      event: event,
      timestamp: new Date().toISOString(),
      data: data,
      recipient: this.paypalEmail
    });

    // For now, just log to console
    // In production, this would POST to a backend webhook handler
    /*
    fetch('/api/webhooks/paypal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, data, recipient: this.paypalEmail })
    });
    */
  }

  /**
   * Generate invoice/receipt
   */
  generateReceipt(transaction) {
    const tier = this.tierManager.getTier(transaction.tierName);
    
    return {
      invoiceNumber: `INV-${transaction.timestamp}-${transaction.userId.substr(0, 8)}`,
      date: new Date(transaction.timestamp).toLocaleDateString(),
      items: [{
        description: `${tier.name} Subscription - Monthly`,
        amount: transaction.amount,
        currency: transaction.currency
      }],
      total: transaction.amount,
      paymentMethod: 'PayPal',
      transactionId: transaction.paypalOrderId,
      status: transaction.status
    };
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId) {
    const user = this.authManager.getCurrentUser();
    
    if (!user || user.id !== userId) {
      throw new Error('Unauthorized');
    }

    // Downgrade to guest
    this.authManager.updateUserTier(userId, 'guest', {
      startDate: null,
      endDate: null,
      paypalSubscriptionId: null
    });

    // Trigger webhook
    this.triggerWebhook('subscription.cancelled', {
      userId: userId,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      message: 'Subscription cancelled successfully'
    };
  }
}
