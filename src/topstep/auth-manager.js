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
 * File: auth-manager.js
 * Declaration ID: IP-3AF5E46F-MLL28ZWB
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * @aul-enabled
 * Authentication Manager for TopStep Hub
 * Handles user authentication, registration, and session management
 */

class TopStepAuthManager {
  constructor() {
    this.currentUser = null;
    this.sessionKey = 'topstep_hub_session';
    this.usersKey = 'topstep_hub_users';
    this.loadSession();
  }

  /**
   * Register a new user
   */
  register(email, password, username) {
    const users = this.getAllUsers();
    
    // Check if email already exists
    if (users.find(u => u.email === email)) {
      throw new Error('Email already registered');
    }

    // Create new user
    const user = {
      id: this.generateUserId(),
      email: email,
      username: username || email.split('@')[0],
      passwordHash: this.hashPassword(password),
      tier: 'guest', // Start as guest
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      subscription: {
        tier: 'guest',
        startDate: null,
        endDate: null,
        paypalSubscriptionId: null
      },
      profile: {
        apiConnected: false,
        totalAccounts: 0,
        preferences: {}
      }
    };

    users.push(user);
    this.saveUsers(users);
    
    return user;
  }

  /**
   * Login user
   */
  login(email, password) {
    const users = this.getAllUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      throw new Error('User not found');
    }

    if (!this.verifyPassword(password, user.passwordHash)) {
      throw new Error('Invalid password');
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    this.saveUsers(users);

    // Create session
    this.currentUser = user;
    this.saveSession();

    return user;
  }

  /**
   * Guest login - no password required
   */
  loginAsGuest() {
    const guestUser = {
      id: 'guest_' + Date.now(),
      email: 'guest@topstep-hub.local',
      username: 'Guest User',
      tier: 'guest',
      isGuest: true,
      createdAt: new Date().toISOString(),
      subscription: {
        tier: 'guest',
        startDate: null,
        endDate: null
      },
      profile: {
        apiConnected: false,
        totalAccounts: 0,
        preferences: {}
      }
    };

    this.currentUser = guestUser;
    this.saveSession();
    return guestUser;
  }

  /**
   * Logout current user
   */
  logout() {
    this.currentUser = null;
    localStorage.removeItem(this.sessionKey);
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn() {
    return this.currentUser !== null;
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Update user tier after payment
   */
  updateUserTier(userId, tier, subscriptionData) {
    const users = this.getAllUsers();
    const user = users.find(u => u.id === userId);

    if (!user) {
      throw new Error('User not found');
    }

    user.subscription = {
      tier: tier,
      startDate: subscriptionData.startDate || new Date().toISOString(),
      endDate: subscriptionData.endDate,
      paypalSubscriptionId: subscriptionData.paypalSubscriptionId,
      transactionId: subscriptionData.transactionId
    };

    this.saveUsers(users);

    // Update current user if it's the same
    if (this.currentUser && this.currentUser.id === userId) {
      this.currentUser = user;
      this.saveSession();
    }

    return user;
  }

  /**
   * Check if user has access to a feature based on tier
   */
  hasAccess(feature) {
    if (!this.currentUser) {
      return false;
    }

    const tier = this.currentUser.subscription?.tier || 'guest';
    const tierLevel = this.getTierLevel(tier);
    const requiredLevel = this.getTierLevel(feature.requiredTier || 'guest');

    return tierLevel >= requiredLevel;
  }

  /**
   * Get tier level for comparison
   */
  getTierLevel(tier) {
    const levels = {
      'guest': 0,
      'basic': 1,
      'premium': 2,
      'enterprise': 3
    };
    return levels[tier] || 0;
  }

  /**
   * Update user profile
   */
  updateProfile(updates) {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    const users = this.getAllUsers();
    const user = users.find(u => u.id === this.currentUser.id);

    if (user) {
      user.profile = { ...user.profile, ...updates };
      this.saveUsers(users);
      this.currentUser = user;
      this.saveSession();
    }

    return this.currentUser;
  }

  // Private methods

  generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  hashPassword(password) {
    // Simple hash for demo - in production use bcrypt or similar
    // This is a basic implementation for demonstration
    let hash = 0;
    const str = password + 'topstep_salt_key_2024';
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  verifyPassword(password, hash) {
    return this.hashPassword(password) === hash;
  }

  getAllUsers() {
    try {
      const data = localStorage.getItem(this.usersKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading users:', e);
      return [];
    }
  }

  saveUsers(users) {
    try {
      localStorage.setItem(this.usersKey, JSON.stringify(users));
    } catch (e) {
      console.error('Error saving users:', e);
    }
  }

  loadSession() {
    try {
      const data = localStorage.getItem(this.sessionKey);
      if (data) {
        this.currentUser = JSON.parse(data);
      }
    } catch (e) {
      console.error('Error loading session:', e);
      this.currentUser = null;
    }
  }

  saveSession() {
    try {
      if (this.currentUser) {
        localStorage.setItem(this.sessionKey, JSON.stringify(this.currentUser));
      }
    } catch (e) {
      console.error('Error saving session:', e);
    }
  }
}
