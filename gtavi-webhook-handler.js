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
 * File: gtavi-webhook-handler.js
 * Declaration ID: IP-345B2449-MLL28ZV1
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * GTAVI Hub - PayPal Webhook Handler
 * Handles donor verification and access management
 * 
 * This module integrates with PayPal webhooks to automatically grant
 * donor access to the GTAVI Hub based on payment tier.
 * 
 * @author Barbrick Design
 * @date 2026-01-21
 */

(function() {
  'use strict';

  class GTAVIWebhookHandler {
    constructor() {
      this.apiEndpoint = '/api/gtavi-webhook'; // Production endpoint
      this.demoMode = true; // Set to false in production
    }

    /**
     * Process webhook notification from backend
     * Called when PayPal webhook is received and processed by backend
     */
    async processWebhookNotification(notification) {
      try {
        console.log('📨 Processing webhook notification:', notification.type);

        switch (notification.type) {
          case 'donation_received':
            await this.handleDonationReceived(notification);
            break;
          
          case 'subscription_created':
            await this.handleSubscriptionCreated(notification);
            break;
          
          case 'subscription_cancelled':
            await this.handleSubscriptionCancelled(notification);
            break;
          
          case 'tier_upgraded':
            await this.handleTierUpgrade(notification);
            break;
          
          default:
            console.log('⚠️ Unhandled notification type:', notification.type);
        }

        return { success: true };
      } catch (error) {
        console.error('❌ Error processing webhook notification:', error);
        return { success: false, error: error.message };
      }
    }

    /**
     * Handle donation received notification
     */
    async handleDonationReceived(notification) {
      const { userEmail, amount, tier, transactionId } = notification;
      
      console.log(`✅ Donation received: $${amount} from ${userEmail} (Tier: ${tier})`);
      
      // Store donor information
      const donorData = {
        email: userEmail,
        tier: tier,
        amount: amount,
        transactionId: transactionId,
        timestamp: Date.now(),
        expiresAt: Date.now() + (365 * 24 * 60 * 60 * 1000), // 1 year
        status: 'active'
      };
      
      // Save to localStorage (in production, this would be saved to backend)
      localStorage.setItem(`donor_${userEmail}`, JSON.stringify(donorData));
      
      // Grant access permissions based on tier
      await this.grantAccessByTier(userEmail, tier);
      
      // Notify user
      this.notifyUser({
        title: '🎉 Donation Confirmed!',
        message: `Thank you for your ${tier} donation! Your access has been activated.`,
        tier: tier
      });
      
      // Refresh UI if user is currently authenticated
      window.dispatchEvent(new CustomEvent('donorStatusUpdated', {
        detail: { email: userEmail, tier: tier }
      }));
    }

    /**
     * Handle subscription created notification
     */
    async handleSubscriptionCreated(notification) {
      const { userEmail, tier, subscriptionId } = notification;
      
      console.log(`🔄 Subscription created for ${userEmail} (Tier: ${tier})`);
      
      // Store subscription information
      const subscriptionData = {
        email: userEmail,
        tier: tier,
        subscriptionId: subscriptionId,
        timestamp: Date.now(),
        status: 'active',
        renewsAt: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
      };
      
      localStorage.setItem(`subscription_${userEmail}`, JSON.stringify(subscriptionData));
      
      await this.grantAccessByTier(userEmail, tier);
      
      this.notifyUser({
        title: '🔄 Subscription Active!',
        message: `Your ${tier} subscription is now active. Access granted!`,
        tier: tier
      });
    }

    /**
     * Handle subscription cancelled notification
     */
    async handleSubscriptionCancelled(notification) {
      const { userEmail } = notification;
      
      console.log(`❌ Subscription cancelled for ${userEmail}`);
      
      // Update status but don't immediately revoke access (grace period)
      const subscriptionData = JSON.parse(localStorage.getItem(`subscription_${userEmail}`) || '{}');
      subscriptionData.status = 'cancelled';
      subscriptionData.gracePeriodEnds = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days grace
      
      localStorage.setItem(`subscription_${userEmail}`, JSON.stringify(subscriptionData));
      
      this.notifyUser({
        title: '⚠️ Subscription Cancelled',
        message: 'Your subscription has been cancelled. Access will continue for 7 more days.',
        tier: null
      });
    }

    /**
     * Handle tier upgrade notification
     */
    async handleTierUpgrade(notification) {
      const { userEmail, oldTier, newTier } = notification;
      
      console.log(`⬆️ Tier upgraded for ${userEmail}: ${oldTier} → ${newTier}`);
      
      // Update tier
      const donorData = JSON.parse(localStorage.getItem(`donor_${userEmail}`) || '{}');
      donorData.tier = newTier;
      donorData.previousTier = oldTier;
      donorData.upgradedAt = Date.now();
      
      localStorage.setItem(`donor_${userEmail}`, JSON.stringify(donorData));
      
      await this.grantAccessByTier(userEmail, newTier);
      
      this.notifyUser({
        title: '🎊 Tier Upgraded!',
        message: `You've been upgraded from ${oldTier} to ${newTier}! Enjoy your new features.`,
        tier: newTier
      });
      
      window.dispatchEvent(new CustomEvent('donorStatusUpdated', {
        detail: { email: userEmail, tier: newTier }
      }));
    }

    /**
     * Grant access permissions based on tier
     */
    async grantAccessByTier(email, tier) {
      const permissions = this.getTierPermissions(tier);
      
      const accessData = {
        email: email,
        tier: tier,
        permissions: permissions,
        grantedAt: Date.now()
      };
      
      localStorage.setItem(`access_${email}`, JSON.stringify(accessData));
      
      console.log(`✅ Access granted to ${email} (${tier}):`, permissions);
      
      return accessData;
    }

    /**
     * Get permissions for a specific tier
     */
    getTierPermissions(tier) {
      const tiers = {
        basic: {
          hubAccess: true,
          votingRights: true,
          prioritySupport: true,
          clanTools: false,
          advancedAnalytics: false,
          apiAccess: false,
          customFeatures: false
        },
        standard: {
          hubAccess: true,
          votingRights: true,
          prioritySupport: true,
          clanTools: true,
          advancedAnalytics: true,
          apiAccess: false,
          customFeatures: false
        },
        professional: {
          hubAccess: true,
          votingRights: true,
          prioritySupport: true,
          clanTools: true,
          advancedAnalytics: true,
          apiAccess: true,
          customFeatures: false
        },
        enterprise: {
          hubAccess: true,
          votingRights: true,
          prioritySupport: true,
          clanTools: true,
          advancedAnalytics: true,
          apiAccess: true,
          customFeatures: true
        }
      };
      
      return tiers[tier] || tiers.basic;
    }

    /**
     * Check if user has specific permission
     */
    hasPermission(email, permission) {
      const accessData = JSON.parse(localStorage.getItem(`access_${email}`) || '{}');
      return accessData.permissions?.[permission] || false;
    }

    /**
     * Get donor tier for email
     */
    getDonorTier(email) {
      const donorData = JSON.parse(localStorage.getItem(`donor_${email}`) || '{}');
      return donorData.tier || null;
    }

    /**
     * Check if donor access is expired
     */
    isAccessExpired(email) {
      const donorData = JSON.parse(localStorage.getItem(`donor_${email}`) || '{}');
      if (!donorData.expiresAt) return false;
      return Date.now() > donorData.expiresAt;
    }

    /**
     * Notify user of status change
     */
    notifyUser(notification) {
      // Show browser notification if permitted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/images/logo.png',
          badge: '/images/badge.png'
        });
      }
      
      // Also dispatch custom event for in-app notifications
      window.dispatchEvent(new CustomEvent('gtaviNotification', {
        detail: notification
      }));
    }

    /**
     * Listen for webhook events from backend
     * In production, this would use WebSockets or Server-Sent Events
     */
    async startListening() {
      if (this.demoMode) {
        console.log('📡 Webhook handler in demo mode');
        return;
      }
      
      // In production, connect to backend webhook notification stream
      // Example: EventSource, WebSocket, or polling
      console.log('📡 Listening for webhook notifications...');
    }

    /**
     * Demo: Simulate webhook notification (for testing)
     */
    simulateWebhook(type, data) {
      console.log('🧪 Simulating webhook:', type);
      
      const notification = {
        type: type,
        ...data,
        timestamp: Date.now()
      };
      
      return this.processWebhookNotification(notification);
    }
  }

  // Create global instance
  window.gtaviWebhookHandler = new GTAVIWebhookHandler();
  
  // Start listening for webhooks
  window.gtaviWebhookHandler.startListening();

  console.log('✅ GTAVI Webhook Handler loaded');
})();
