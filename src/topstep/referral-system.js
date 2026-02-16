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
 * File: referral-system.js
 * Declaration ID: IP-69C7A338-MLL28ZWC
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * @aul-enabled
 * Referral System for TopStep Hub
 * Manages referral codes, tracking, and social linking between traders
 */

class TopStepReferralSystem {
  constructor(authManager, tierManager) {
    this.authManager = authManager;
    this.tierManager = tierManager;
    this.referralsKey = 'topstep_referrals';
    this.socialLinksKey = 'topstep_social_links';
    this.referralBonuses = {
      basic: 10, // $10 bonus for basic tier referral
      premium: 25, // $25 bonus for premium tier referral
      enterprise: 50 // $50 bonus for enterprise tier referral
    };
  }

  /**
   * Generate unique referral code for user
   */
  generateReferralCode(userId) {
    const code = `TS-${userId.substr(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    return code;
  }

  /**
   * Get or create referral code for user
   */
  getReferralCode(userId) {
    const user = this.authManager.getUserById(userId);
    if (!user) return null;

    if (!user.referralCode) {
      const code = this.generateReferralCode(userId);
      this.authManager.updateUser(userId, { referralCode: code });
      return code;
    }

    return user.referralCode;
  }

  /**
   * Validate referral code
   */
  validateReferralCode(code) {
    const allUsers = this.authManager.getAllUsers();
    const referrer = allUsers.find(u => u.referralCode === code);
    return referrer || null;
  }

  /**
   * Apply referral code during registration
   */
  applyReferralCode(newUserId, referralCode) {
    const referrer = this.validateReferralCode(referralCode);
    if (!referrer) {
      return { success: false, message: 'Invalid referral code' };
    }

    // Record referral
    const referral = {
      id: `ref_${Date.now()}`,
      referrerId: referrer.id,
      referredUserId: newUserId,
      timestamp: new Date().toISOString(),
      status: 'pending', // pending, active, rewarded
      bonusAmount: 0
    };

    this.saveReferral(referral);

    // Create social link
    this.createSocialLink(referrer.id, newUserId, 'referral');

    return {
      success: true,
      message: 'Referral code applied successfully',
      referrer: referrer.email,
      referral: referral
    };
  }

  /**
   * Save referral data
   */
  saveReferral(referral) {
    try {
      const referrals = this.getAllReferrals();
      referrals.push(referral);
      localStorage.setItem(this.referralsKey, JSON.stringify(referrals));
    } catch (e) {
      console.error('Error saving referral:', e);
    }
  }

  /**
   * Get all referrals
   */
  getAllReferrals() {
    try {
      const data = localStorage.getItem(this.referralsKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading referrals:', e);
      return [];
    }
  }

  /**
   * Get referrals for specific user
   */
  getUserReferrals(userId) {
    const allReferrals = this.getAllReferrals();
    return allReferrals.filter(r => r.referrerId === userId);
  }

  /**
   * Activate referral when referred user upgrades
   */
  activateReferral(referredUserId, tierName) {
    const allReferrals = this.getAllReferrals();
    const referral = allReferrals.find(
      r => r.referredUserId === referredUserId && r.status === 'pending'
    );

    if (!referral) return null;

    // Calculate bonus based on tier
    const bonusAmount = this.referralBonuses[tierName] || 0;

    // Update referral status
    referral.status = 'active';
    referral.tierName = tierName;
    referral.activatedAt = new Date().toISOString();
    referral.bonusAmount = bonusAmount;

    // Save updated referrals
    const updatedReferrals = allReferrals.map(r =>
      r.id === referral.id ? referral : r
    );
    localStorage.setItem(this.referralsKey, JSON.stringify(updatedReferrals));

    // Credit bonus to referrer (to be paid out from pool)
    this.creditReferralBonus(referral.referrerId, bonusAmount, referral.id);

    return referral;
  }

  /**
   * Credit referral bonus to user
   */
  creditReferralBonus(userId, amount, referralId) {
    const user = this.authManager.getUserById(userId);
    if (!user) return;

    const pendingBonuses = user.pendingBonuses || [];
    pendingBonuses.push({
      type: 'referral',
      amount: amount,
      referralId: referralId,
      timestamp: new Date().toISOString(),
      status: 'pending'
    });

    this.authManager.updateUser(userId, { pendingBonuses });
  }

  /**
   * Create social link between traders
   */
  createSocialLink(userId1, userId2, linkType = 'social') {
    const link = {
      id: `link_${Date.now()}`,
      user1: userId1,
      user2: userId2,
      type: linkType, // referral, social, copy-trading
      status: 'active',
      createdAt: new Date().toISOString(),
      metadata: {}
    };

    const links = this.getAllSocialLinks();
    links.push(link);
    localStorage.setItem(this.socialLinksKey, JSON.stringify(links));

    return link;
  }

  /**
   * Get all social links
   */
  getAllSocialLinks() {
    try {
      const data = localStorage.getItem(this.socialLinksKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading social links:', e);
      return [];
    }
  }

  /**
   * Get social links for user
   */
  getUserSocialLinks(userId) {
    const allLinks = this.getAllSocialLinks();
    return allLinks.filter(
      l => (l.user1 === userId || l.user2 === userId) && l.status === 'active'
    );
  }

  /**
   * Get referral statistics for user
   */
  getReferralStats(userId) {
    const referrals = this.getUserReferrals(userId);
    const activeReferrals = referrals.filter(r => r.status === 'active' || r.status === 'rewarded');
    const totalBonus = referrals.reduce((sum, r) => sum + (r.bonusAmount || 0), 0);

    return {
      totalReferrals: referrals.length,
      activeReferrals: activeReferrals.length,
      pendingReferrals: referrals.filter(r => r.status === 'pending').length,
      totalBonusEarned: totalBonus,
      referrals: referrals
    };
  }

  /**
   * Get referral leaderboard
   */
  getReferralLeaderboard(limit = 10) {
    const allUsers = this.authManager.getAllUsers();
    const leaderboard = allUsers.map(user => {
      const stats = this.getReferralStats(user.id);
      return {
        userId: user.id,
        email: user.email,
        totalReferrals: stats.totalReferrals,
        activeReferrals: stats.activeReferrals,
        totalBonusEarned: stats.totalBonusEarned
      };
    }).filter(entry => entry.totalReferrals > 0)
      .sort((a, b) => b.totalReferrals - a.totalReferrals)
      .slice(0, limit);

    return leaderboard;
  }

  /**
   * Generate shareable referral link
   */
  generateReferralLink(userId, baseUrl = window.location.origin) {
    const code = this.getReferralCode(userId);
    return `${baseUrl}/topstep-hub.html?ref=${code}`;
  }

  /**
   * Find connected traders (social network)
   */
  findConnectedTraders(userId, depth = 2) {
    const connected = new Set();
    const queue = [{ id: userId, level: 0 }];
    const visited = new Set([userId]);

    while (queue.length > 0) {
      const { id, level } = queue.shift();

      if (level >= depth) continue;

      const links = this.getUserSocialLinks(id);
      for (const link of links) {
        const otherId = link.user1 === id ? link.user2 : link.user1;
        
        if (!visited.has(otherId)) {
          visited.add(otherId);
          connected.add(otherId);
          queue.push({ id: otherId, level: level + 1 });
        }
      }
    }

    return Array.from(connected);
  }

  /**
   * Get network size for user
   */
  getNetworkSize(userId) {
    const directReferrals = this.getUserReferrals(userId).length;
    const socialConnections = this.getUserSocialLinks(userId).length;
    const extendedNetwork = this.findConnectedTraders(userId, 2).length;

    return {
      directReferrals,
      socialConnections,
      extendedNetwork
    };
  }
}
