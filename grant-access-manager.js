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
 * File: grant-access-manager.js
 * Declaration ID: IP-2F70EF3E-MLL28ZV0
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Government Grant Access Management System
 * Manages user access tiers, PayPal donations, and credential provisioning
 * 
 * © 2026 Barbrick Design
 * Contact: BarbrickDesign@gmail.com
 */

class GrantAccessManager {
    constructor() {
        this.accessTiers = {
            basic: {
                name: 'Basic',
                price: 50,
                duration: 365, // days
                features: [
                    'full_database_access',
                    'basic_ai_matching',
                    'grant_search',
                    'deadline_calendar',
                    'email_support_72hr',
                    'monthly_updates'
                ]
            },
            standard: {
                name: 'Standard',
                price: 200,
                duration: 365,
                features: [
                    'all_basic_features',
                    'ai_application_assistance',
                    'document_templates',
                    'budget_optimization',
                    'proposal_generation',
                    'email_support_48hr',
                    'weekly_updates'
                ]
            },
            professional: {
                name: 'Professional',
                price: 500,
                duration: 365,
                features: [
                    'all_standard_features',
                    'full_ai_automation',
                    'application_optimization',
                    'success_rate_analytics',
                    'priority_matching',
                    'monthly_consultation',
                    'priority_support_24hr',
                    'daily_updates'
                ],
                maxUsers: 3
            },
            enterprise: {
                name: 'Enterprise',
                price: 1500,
                duration: 365,
                features: [
                    'all_professional_features',
                    'unlimited_team_members',
                    'custom_ai_training',
                    'dedicated_account_manager',
                    'phone_support_24_7',
                    'white_glove_service',
                    'revenue_sharing_program',
                    'custom_integrations'
                ],
                maxUsers: 999
            }
        };

        this.initializeSystem();
    }

    /**
     * Initialize access management system
     */
    initializeSystem() {
        console.log('🔐 Initializing Grant Access Management System...');
        this.loadAccessRecords();
        this.checkExpiredAccess();
        console.log('✅ Access Management Ready');
    }

    /**
     * Create new access grant
     */
    grantAccess(email, tier, paymentDetails) {
        const tierInfo = this.accessTiers[tier.toLowerCase()];
        if (!tierInfo) {
            return { error: 'Invalid tier specified' };
        }

        const accessKey = this.generateAccessKey();
        const now = Date.now();
        const expiryDate = now + (tierInfo.duration * 24 * 60 * 60 * 1000);

        const accessGrant = {
            accessKey: accessKey,
            email: email,
            tier: tier.toLowerCase(),
            tierName: tierInfo.name,
            price: tierInfo.price,
            features: tierInfo.features,
            maxUsers: tierInfo.maxUsers || 1,
            grantedDate: new Date(now).toISOString(),
            expiryDate: expiryDate,
            expiryDateReadable: new Date(expiryDate).toISOString(),
            status: 'active',
            paymentDetails: {
                ...paymentDetails,
                recordedDate: new Date(now).toISOString()
            },
            usage: {
                grantsViewed: 0,
                applicationsGenerated: 0,
                proposalsOptimized: 0,
                lastAccess: null
            }
        };

        // Save access grant
        this.saveAccessGrant(accessGrant);

        // Generate welcome email content
        const welcomeEmail = this.generateWelcomeEmail(accessGrant);

        return {
            success: true,
            accessGrant: accessGrant,
            welcomeEmail: welcomeEmail,
            loginUrl: this.getLoginUrl(accessKey)
        };
    }

    /**
     * Generate unique access key
     */
    generateAccessKey() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 15);
        return `GGA_${timestamp}_${random}`.toUpperCase();
    }

    /**
     * Verify access key
     */
    verifyAccess(accessKey) {
        const grants = this.loadAccessRecords();
        const grant = grants[accessKey];

        if (!grant) {
            return { valid: false, error: 'Invalid access key' };
        }

        if (grant.status !== 'active') {
            return { valid: false, error: 'Access key is not active' };
        }

        if (Date.now() > grant.expiryDate) {
            return { valid: false, error: 'Access key has expired' };
        }

        // Update last access time
        grant.usage.lastAccess = new Date().toISOString();
        this.saveAccessGrant(grant);

        return {
            valid: true,
            tier: grant.tier,
            tierName: grant.tierName,
            features: grant.features,
            expiryDate: grant.expiryDateReadable,
            email: grant.email
        };
    }

    /**
     * Load access records
     */
    loadAccessRecords() {
        const records = localStorage.getItem('grant_access_records');
        return records ? JSON.parse(records) : {};
    }

    /**
     * Save access grant
     */
    saveAccessGrant(grant) {
        const records = this.loadAccessRecords();
        records[grant.accessKey] = grant;
        localStorage.setItem('grant_access_records', JSON.stringify(records));
    }

    /**
     * Check for expired access
     */
    checkExpiredAccess() {
        const records = this.loadAccessRecords();
        const now = Date.now();
        let expiredCount = 0;

        Object.keys(records).forEach(key => {
            const grant = records[key];
            if (grant.status === 'active' && grant.expiryDate < now) {
                grant.status = 'expired';
                grant.expiredDate = new Date(now).toISOString();
                expiredCount++;
            }
        });

        if (expiredCount > 0) {
            localStorage.setItem('grant_access_records', JSON.stringify(records));
            console.log(`🔒 Marked ${expiredCount} access grants as expired`);
        }
    }

    /**
     * Get login URL
     */
    getLoginUrl(accessKey) {
        const baseUrl = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
        return `${baseUrl}government-grants-portal.html?access=${accessKey}`;
    }

    /**
     * Generate welcome email
     */
    generateWelcomeEmail(grant) {
        return {
            subject: `Welcome to Government Grants AI Portal - ${grant.tierName} Tier Access`,
            body: `
Dear Valued User,

Welcome to the Government Grants AI Portal!

Your ${grant.tierName} tier access has been activated. Here are your account details:

═══════════════════════════════════════════════
ACCESS INFORMATION
═══════════════════════════════════════════════

Access Key: ${grant.accessKey}
Tier: ${grant.tierName}
Email: ${grant.email}
Activated: ${grant.grantedDate}
Expires: ${grant.expiryDateReadable}

═══════════════════════════════════════════════
LOGIN INSTRUCTIONS
═══════════════════════════════════════════════

1. Visit: ${this.getLoginUrl(grant.accessKey)}
2. Your access will be automatically verified
3. Complete your profile to get started
4. Begin matching grants immediately!

═══════════════════════════════════════════════
YOUR FEATURES (${grant.tierName} TIER)
═══════════════════════════════════════════════

${grant.features.map(f => `✓ ${f.replace(/_/g, ' ').toUpperCase()}`).join('\n')}

Maximum Users: ${grant.maxUsers}

═══════════════════════════════════════════════
QUICK START
═══════════════════════════════════════════════

1. Complete Your Profile
   - Organization type
   - Focus areas
   - Funding needs
   - Team info

2. Explore Grants Database
   - 500+ federal and state grants
   - AI-powered search
   - Filter by category, amount, deadline

3. Get Matched
   - AI analyzes your profile
   - Matches suitable grants
   - Ranks by success probability

4. Generate Applications
   - Auto-create proposals
   - Budget optimization
   - Document templates
   - Success analytics

═══════════════════════════════════════════════
RESOURCES
═══════════════════════════════════════════════

• User Guide: GOVERNMENT_GRANTS_USER_GUIDE.md
• Grants Database: GOVERNMENT_GRANTS_DATABASE.md
• Video Tutorials: Coming soon
• Support Email: BarbrickDesign@gmail.com

═══════════════════════════════════════════════
NEED HELP?
═══════════════════════════════════════════════

Email: BarbrickDesign@gmail.com
Response Time: ${this.getResponseTime(grant.tier)}
GitHub: https://github.com/barbrickdesign/barbrickdesign.github.io

═══════════════════════════════════════════════
SUCCESS TIPS
═══════════════════════════════════════════════

1. Complete your profile thoroughly
2. Apply to multiple grants
3. Use AI optimization features
4. Start early (3-6 months before deadline)
5. Follow AI recommendations

Our users achieve 3x higher success rates!

═══════════════════════════════════════════════

Thank you for choosing Government Grants AI Portal!

We're here to help you secure funding for your projects.

Best regards,
Ryan Barbrick
Barbrick Design
BarbrickDesign@gmail.com

© 2026 Barbrick Design. All rights reserved.
            `.trim()
        };
    }

    /**
     * Get response time based on tier
     */
    getResponseTime(tier) {
        const times = {
            basic: '48-72 hours',
            standard: '24-48 hours',
            professional: '12-24 hours',
            enterprise: '4-12 hours'
        };
        return times[tier] || '48-72 hours';
    }

    /**
     * Upgrade access tier
     */
    upgradeAccess(accessKey, newTier) {
        const grant = this.loadAccessRecords()[accessKey];
        if (!grant) {
            return { error: 'Access key not found' };
        }

        const currentTierLevel = this.getTierLevel(grant.tier);
        const newTierLevel = this.getTierLevel(newTier);

        if (newTierLevel <= currentTierLevel) {
            return { error: 'New tier must be higher than current tier' };
        }

        const newTierInfo = this.accessTiers[newTier];
        const priceDifference = newTierInfo.price - this.accessTiers[grant.tier].price;

        grant.tier = newTier;
        grant.tierName = newTierInfo.name;
        grant.features = newTierInfo.features;
        grant.maxUsers = newTierInfo.maxUsers || 1;
        grant.upgradeHistory = grant.upgradeHistory || [];
        grant.upgradeHistory.push({
            date: new Date().toISOString(),
            fromTier: grant.tier,
            toTier: newTier,
            priceDifference: priceDifference
        });

        this.saveAccessGrant(grant);

        return {
            success: true,
            message: `Upgraded from ${grant.tier} to ${newTier}`,
            priceDifference: priceDifference,
            newFeatures: newTierInfo.features
        };
    }

    /**
     * Get tier level (for comparison)
     */
    getTierLevel(tier) {
        const levels = { basic: 1, standard: 2, professional: 3, enterprise: 4 };
        return levels[tier.toLowerCase()] || 0;
    }

    /**
     * Get access statistics
     */
    getStatistics() {
        const records = this.loadAccessRecords();
        const grants = Object.values(records);

        const stats = {
            total: grants.length,
            active: grants.filter(g => g.status === 'active').length,
            expired: grants.filter(g => g.status === 'expired').length,
            byTier: {
                basic: grants.filter(g => g.tier === 'basic').length,
                standard: grants.filter(g => g.tier === 'standard').length,
                professional: grants.filter(g => g.tier === 'professional').length,
                enterprise: grants.filter(g => g.tier === 'enterprise').length
            },
            totalRevenue: grants.reduce((sum, g) => sum + g.price, 0),
            averageUsage: {
                grantsViewed: this.average(grants, g => g.usage.grantsViewed),
                applicationsGenerated: this.average(grants, g => g.usage.applicationsGenerated),
                proposalsOptimized: this.average(grants, g => g.usage.proposalsOptimized)
            }
        };

        return stats;
    }

    /**
     * Calculate average
     */
    average(array, selector) {
        if (array.length === 0) return 0;
        const sum = array.reduce((acc, item) => acc + selector(item), 0);
        return Math.round(sum / array.length);
    }

    /**
     * Track usage
     */
    trackUsage(accessKey, action, details = {}) {
        const records = this.loadAccessRecords();
        const grant = records[accessKey];

        if (!grant) return;

        switch (action) {
            case 'grant_viewed':
                grant.usage.grantsViewed++;
                break;
            case 'application_generated':
                grant.usage.applicationsGenerated++;
                break;
            case 'proposal_optimized':
                grant.usage.proposalsOptimized++;
                break;
        }

        grant.usage.lastAccess = new Date().toISOString();
        this.saveAccessGrant(grant);
    }

    /**
     * Revoke access
     */
    revokeAccess(accessKey, reason) {
        const records = this.loadAccessRecords();
        const grant = records[accessKey];

        if (!grant) {
            return { error: 'Access key not found' };
        }

        grant.status = 'revoked';
        grant.revokedDate = new Date().toISOString();
        grant.revokedReason = reason;

        this.saveAccessGrant(grant);

        return {
            success: true,
            message: `Access revoked for ${grant.email}`,
            reason: reason
        };
    }

    /**
     * Extend access
     */
    extendAccess(accessKey, additionalDays) {
        const records = this.loadAccessRecords();
        const grant = records[accessKey];

        if (!grant) {
            return { error: 'Access key not found' };
        }

        const additionalMs = additionalDays * 24 * 60 * 60 * 1000;
        grant.expiryDate += additionalMs;
        grant.expiryDateReadable = new Date(grant.expiryDate).toISOString();

        grant.extensions = grant.extensions || [];
        grant.extensions.push({
            date: new Date().toISOString(),
            days: additionalDays
        });

        this.saveAccessGrant(grant);

        return {
            success: true,
            message: `Extended access by ${additionalDays} days`,
            newExpiryDate: grant.expiryDateReadable
        };
    }
}

// Initialize global instance
if (typeof window !== 'undefined') {
    window.grantAccessManager = new GrantAccessManager();
    console.log('🔐 Grant Access Management System loaded successfully');
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GrantAccessManager;
}
