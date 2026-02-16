/**
 * Copyright (c) 2024-2025 Ryan Barbrick (Barbrick Design)
 * All Rights Reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * FuturesByAgentR Access Control System
 * Implements timestamp-based access control with tiered licensing
 * 
 * For licensing inquiries: BarbrickDesign@gmail.com
 * AI Assistant: Merlin AI
 * 
 * @license Proprietary
 * @copyright 2024-2025 Ryan Barbrick. All Rights Reserved.
 */

const FuturesAccessControl = (function() {
    'use strict';

    // Storage key for access data
    const STORAGE_KEY = 'futures_access_license';

    // Access tier configuration
    // Pricing structured based on potential earnings vs cost
    // Assumes average profit of $100-500 per day for active traders
    const ACCESS_TIERS = {
        hourly: {
            name: 'Hourly Access',
            price: 5,
            duration: 60 * 60 * 1000, // 1 hour in milliseconds
            description: 'Perfect for testing the platform',
            features: ['1 hour of full access', 'Trading signals', 'Basic automation'],
            icon: '⏱️'
        },
        daily: {
            name: 'Daily Pass',
            price: 20,
            duration: 24 * 60 * 60 * 1000, // 24 hours
            description: 'Best for day traders',
            features: ['24 hours of access', 'All trading signals', 'Full automation', 'Priority support'],
            icon: '📅',
            popular: true
        },
        weekly: {
            name: 'Weekly License',
            price: 100,
            duration: 7 * 24 * 60 * 60 * 1000, // 7 days
            description: 'Save 30% vs daily',
            features: ['7 days of access', 'Advanced signals', 'Premium automation', 'Email alerts'],
            icon: '📆',
            savings: 40 // vs 7 daily passes
        },
        monthly: {
            name: 'Monthly Subscription',
            price: 300,
            duration: 30 * 24 * 60 * 60 * 1000, // 30 days
            description: 'Best value for serious traders',
            features: ['30 days of access', 'All premium features', 'API access', 'Dedicated support'],
            icon: '📊',
            savings: 300 // vs 30 daily passes
        },
        lifetime: {
            name: 'Lifetime License',
            price: 1500,
            duration: Infinity,
            description: 'One-time payment, forever access',
            features: ['Unlimited access', 'All future updates', 'VIP support', 'Custom strategies'],
            icon: '♾️',
            premium: true
        }
    };

    /**
     * Get current access status
     * @returns {Object} Access status information
     */
    function getAccessStatus() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) {
                return {
                    hasAccess: false,
                    tier: null,
                    expiresAt: null,
                    isExpired: true,
                    timeRemaining: 0
                };
            }

            const accessData = JSON.parse(stored);
            const now = Date.now();
            const expiresAt = accessData.expiresAt;
            
            // Lifetime access never expires
            if (expiresAt === Infinity || expiresAt === 'Infinity') {
                return {
                    hasAccess: true,
                    tier: accessData.tier,
                    expiresAt: Infinity,
                    isExpired: false,
                    timeRemaining: Infinity,
                    purchaseDate: accessData.purchaseDate,
                    orderId: accessData.orderId
                };
            }

            const isExpired = now >= expiresAt;
            const timeRemaining = isExpired ? 0 : expiresAt - now;

            return {
                hasAccess: !isExpired,
                tier: accessData.tier,
                expiresAt: expiresAt,
                isExpired: isExpired,
                timeRemaining: timeRemaining,
                purchaseDate: accessData.purchaseDate,
                orderId: accessData.orderId
            };
        } catch (error) {
            console.error('Error reading access status:', error);
            return {
                hasAccess: false,
                tier: null,
                expiresAt: null,
                isExpired: true,
                timeRemaining: 0
            };
        }
    }

    /**
     * Grant access to user after successful payment
     * @param {string} tier - Access tier (hourly, daily, weekly, monthly, lifetime)
     * @param {string} orderId - PayPal order ID
     * @returns {Object} Updated access status
     */
    function grantAccess(tier, orderId) {
        if (!ACCESS_TIERS[tier]) {
            throw new Error(`Invalid tier: ${tier}`);
        }

        const now = Date.now();
        const duration = ACCESS_TIERS[tier].duration;
        const expiresAt = duration === Infinity ? Infinity : now + duration;

        const accessData = {
            tier: tier,
            purchaseDate: now,
            expiresAt: expiresAt,
            orderId: orderId,
            version: '1.0'
        };

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(accessData));
            console.log(`Access granted: ${tier} until ${expiresAt === Infinity ? 'forever' : new Date(expiresAt).toISOString()}`);
            return getAccessStatus();
        } catch (error) {
            console.error('Error granting access:', error);
            throw error;
        }
    }

    /**
     * Revoke access (for testing or refunds)
     */
    function revokeAccess() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            console.log('Access revoked');
        } catch (error) {
            console.error('Error revoking access:', error);
        }
    }

    /**
     * Format time remaining in human-readable format
     * @param {number} milliseconds - Time in milliseconds
     * @returns {string} Formatted time string
     */
    function formatTimeRemaining(milliseconds) {
        if (milliseconds === Infinity) {
            return 'Lifetime Access';
        }

        if (milliseconds <= 0) {
            return 'Expired';
        }

        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            const remainingHours = hours % 24;
            return `${days} day${days > 1 ? 's' : ''}, ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
        } else if (hours > 0) {
            const remainingMinutes = minutes % 60;
            return `${hours} hour${hours > 1 ? 's' : ''}, ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
        } else if (minutes > 0) {
            return `${minutes} minute${minutes > 1 ? 's' : ''}`;
        } else {
            return `${seconds} second${seconds !== 1 ? 's' : ''}`;
        }
    }

    /**
     * Get tier information
     * @param {string} tier - Tier name
     * @returns {Object} Tier configuration
     */
    function getTierInfo(tier) {
        return ACCESS_TIERS[tier] || null;
    }

    /**
     * Get all available tiers
     * @returns {Object} All tier configurations
     */
    function getAllTiers() {
        return { ...ACCESS_TIERS };
    }

    /**
     * Check if specific feature is accessible
     * @param {string} feature - Feature name (e.g., 'signals', 'automation')
     * @returns {boolean} Whether feature is accessible
     */
    function canAccessFeature(feature) {
        const status = getAccessStatus();
        
        // No access = no features
        if (!status.hasAccess) {
            return false;
        }

        // All paid tiers get all features for now
        // Could be expanded to restrict features by tier
        return true;
    }

    /**
     * Get access expiration warning
     * @returns {Object|null} Warning object if access is expiring soon
     */
    function getExpirationWarning() {
        const status = getAccessStatus();
        
        if (!status.hasAccess || status.timeRemaining === Infinity) {
            return null;
        }

        const oneHour = 60 * 60 * 1000;
        const oneDay = 24 * oneHour;

        if (status.timeRemaining < oneHour) {
            return {
                level: 'critical',
                message: 'Your access expires in less than 1 hour!',
                timeRemaining: status.timeRemaining
            };
        } else if (status.timeRemaining < oneDay) {
            return {
                level: 'warning',
                message: 'Your access expires in less than 24 hours',
                timeRemaining: status.timeRemaining
            };
        }

        return null;
    }

    /**
     * Extend existing access (for upgrades)
     * @param {string} newTier - New tier to add
     * @param {string} orderId - PayPal order ID
     * @returns {Object} Updated access status
     */
    function extendAccess(newTier, orderId) {
        const currentStatus = getAccessStatus();
        const newTierInfo = ACCESS_TIERS[newTier];

        if (!newTierInfo) {
            throw new Error(`Invalid tier: ${newTier}`);
        }

        let newExpiresAt;
        
        if (newTierInfo.duration === Infinity) {
            // Upgrading to lifetime
            newExpiresAt = Infinity;
        } else if (currentStatus.hasAccess && currentStatus.timeRemaining > 0) {
            // Add new duration to existing time
            newExpiresAt = currentStatus.expiresAt + newTierInfo.duration;
        } else {
            // Start fresh
            newExpiresAt = Date.now() + newTierInfo.duration;
        }

        const accessData = {
            tier: newTier,
            purchaseDate: Date.now(),
            expiresAt: newExpiresAt,
            orderId: orderId,
            previousOrder: currentStatus.orderId,
            version: '1.0'
        };

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(accessData));
            console.log(`Access extended with ${newTier}`);
            return getAccessStatus();
        } catch (error) {
            console.error('Error extending access:', error);
            throw error;
        }
    }

    // Public API
    return {
        getAccessStatus,
        grantAccess,
        revokeAccess,
        formatTimeRemaining,
        getTierInfo,
        getAllTiers,
        canAccessFeature,
        getExpirationWarning,
        extendAccess,
        STORAGE_KEY
    };
})();

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FuturesAccessControl;
}
