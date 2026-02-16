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
 * File: namus-api-service.js
 * Declaration ID: IP-8F35EA-MLL28ZVJ
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
 * NamUs API Integration Service
 * 
 * Integrates with National Missing and Unidentified Persons System (NamUs)
 * Provides periodic data synchronization with donation-based frequency tiers
 * 
 * Features:
 * - API Key Pool Management: Use community-contributed NamUs API keys
 * - Donation-Based Sync Tiers: Faster sync for contributors
 * - Reward System: Earn points for contributing API keys and resources
 * - Backend Proxy Support: Rate limiting and security
 * - Mock Data Fallback: Demo mode when API keys unavailable
 * 
 * API Key Contribution:
 * Contributors can share their NamUs API keys through the contribution portal
 * and earn points whenever their keys are used for searches.
 * 
 * Sync Frequency Tiers (Donation-Based):
 * - Free:      5 minutes (300,000ms)
 * - Bronze:    2 minutes (120,000ms) - $25+ or contributed API key
 * - Silver:    1 minute  (60,000ms)  - $75+ or 2 contributed API keys
 * - Gold:      30 seconds (30,000ms) - $150+ or 5 contributed API keys
 * - Platinum:  10 seconds (10,000ms) - $350+ or 10 contributed API keys
 * 
 * For setup instructions, see: NAMUS_API_SETUP_GUIDE.md
 */

class NamUsAPIService {
  constructor() {
    // Sync frequency tiers (in milliseconds)
    this.syncTiers = {
      free: { interval: 300000, name: 'Free', minDonation: 0 },
      bronze: { interval: 120000, name: 'Bronze', minDonation: 25 },
      silver: { interval: 60000, name: 'Silver', minDonation: 75 },
      gold: { interval: 30000, name: 'Gold', minDonation: 150 },
      platinum: { interval: 10000, name: 'Platinum', minDonation: 350 }
    };

    // Current state
    this.currentTier = 'free';
    this.totalDonations = 0;
    this.syncIntervalId = null;
    this.lastSyncTime = null;
    this.syncCallbacks = [];
    this.statusCallbacks = [];
    this.errorCallbacks = [];
    
    // Storage keys
    this.STORAGE_KEYS = {
      CASES: 'namus_cases',
      LAST_SYNC: 'namus_last_sync',
      DONATIONS: 'namus_donations',
      TIER: 'namus_tier',
      HISTORY: 'namus_history',
      API_KEYS: 'namus_contributed_api_keys',
      KEY_USAGE: 'namus_key_usage_stats',
      USER_CONTRIBUTIONS: 'namus_user_contributions'
    };

    // API endpoints
    this.API_BASE = 'https://www.namus.gov/api/CaseSets/NamUs';
    this.FALLBACK_API = 'https://api.rapidapi.com/missing_person';
    this.PROXY_ENDPOINT = '/api/namus'; // Backend proxy for production
    
    // Use backend proxy in production for security and rate limiting
    this.USE_PROXY = window.location.hostname !== 'localhost' && 
                     window.location.hostname !== '127.0.0.1';
    
    // API Key Pool Management
    this.apiKeyPool = [];
    this.currentKeyIndex = 0;
    this.keyUsageStats = new Map();
    
    // Load saved state
    this.loadState();
    this.loadAPIKeyPool();
  }

  /**
   * Load saved state from localStorage
   */
  loadState() {
    try {
      const savedDonations = localStorage.getItem(this.STORAGE_KEYS.DONATIONS);
      if (savedDonations) {
        this.totalDonations = parseFloat(savedDonations);
      }

      const savedTier = localStorage.getItem(this.STORAGE_KEYS.TIER);
      if (savedTier && this.syncTiers[savedTier]) {
        this.currentTier = savedTier;
      } else {
        this.updateTierBasedOnDonations();
      }

      const lastSync = localStorage.getItem(this.STORAGE_KEYS.LAST_SYNC);
      if (lastSync) {
        this.lastSyncTime = new Date(lastSync);
      }
    } catch (error) {
      console.error('Error loading NamUs service state:', error);
    }
  }

  /**
   * Save current state to localStorage
   */
  saveState() {
    try {
      localStorage.setItem(this.STORAGE_KEYS.DONATIONS, this.totalDonations.toString());
      localStorage.setItem(this.STORAGE_KEYS.TIER, this.currentTier);
      if (this.lastSyncTime) {
        localStorage.setItem(this.STORAGE_KEYS.LAST_SYNC, this.lastSyncTime.toISOString());
      }
    } catch (error) {
      console.error('Error saving NamUs service state:', error);
    }
  }

  /**
   * Load API key pool from localStorage
   */
  loadAPIKeyPool() {
    try {
      const savedKeys = localStorage.getItem(this.STORAGE_KEYS.API_KEYS);
      if (savedKeys) {
        this.apiKeyPool = JSON.parse(savedKeys);
      }

      const savedStats = localStorage.getItem(this.STORAGE_KEYS.KEY_USAGE);
      if (savedStats) {
        const statsArray = JSON.parse(savedStats);
        this.keyUsageStats = new Map(statsArray);
      }

      console.log(`Loaded ${this.apiKeyPool.length} NamUs API keys from pool`);
    } catch (error) {
      console.error('Error loading API key pool:', error);
    }
  }

  /**
   * Save API key pool to localStorage
   */
  saveAPIKeyPool() {
    try {
      localStorage.setItem(this.STORAGE_KEYS.API_KEYS, JSON.stringify(this.apiKeyPool));
      
      const statsArray = Array.from(this.keyUsageStats.entries());
      localStorage.setItem(this.STORAGE_KEYS.KEY_USAGE, JSON.stringify(statsArray));
    } catch (error) {
      console.error('Error saving API key pool:', error);
    }
  }

  /**
   * Contribute an API key to the pool
   * @param {string} apiKey - The NamUs API key
   * @param {string} contributorId - Identifier for the contributor
   * @param {Object} options - Configuration options
   * @returns {Object} Contribution confirmation
   */
  contributeAPIKey(apiKey, contributorId, options = {}) {
    try {
      // Validate API key format
      if (!apiKey || typeof apiKey !== 'string' || apiKey.length < 20) {
        throw new Error('Invalid API key format');
      }

      // Check if key already exists (by hashing to protect actual key)
      const keyHash = this.hashAPIKey(apiKey);
      const existingKey = this.apiKeyPool.find(k => k.keyHash === keyHash);
      
      if (existingKey) {
        console.warn('API key already contributed');
        return {
          success: false,
          message: 'This API key is already in the pool',
          keyId: existingKey.id
        };
      }

      // Create key entry
      const keyEntry = {
        id: `namus_key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        keyHash: keyHash,
        key: apiKey, // In production, encrypt this
        contributorId: contributorId,
        pointsPerUse: options.pointsPerUse || 5,
        dailyLimit: options.dailyLimit || 100,
        status: 'active',
        addedAt: new Date().toISOString(),
        lastUsed: null,
        totalUses: 0,
        totalPointsGenerated: 0,
        successRate: 100
      };

      // Add to pool
      this.apiKeyPool.push(keyEntry);
      
      // Initialize usage stats
      this.keyUsageStats.set(keyEntry.id, {
        dailyUses: 0,
        lastReset: new Date().toISOString(),
        errors: 0,
        successes: 0
      });

      // Save pool
      this.saveAPIKeyPool();

      // Award contribution points
      this.awardContributionPoints(contributorId, 'api_key_contribution', 200);

      // Check if contribution qualifies for tier upgrade
      const contributions = this.getUserContributions(contributorId);
      if (contributions.apiKeysContributed >= 1) {
        this.updateTierBasedOnContributions(contributorId, contributions);
      }

      console.log(`API key contributed by ${contributorId}:`, keyEntry.id);

      return {
        success: true,
        message: 'API key successfully added to pool',
        keyId: keyEntry.id,
        pointsAwarded: 200,
        tierStatus: this.getTierInfo()
      };

    } catch (error) {
      console.error('Error contributing API key:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Hash API key for identification without exposing the actual key
   */
  hashAPIKey(apiKey) {
    // Simple hash for demo - use proper cryptographic hash in production
    let hash = 0;
    for (let i = 0; i < apiKey.length; i++) {
      const char = apiKey.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  /**
   * Get next available API key from pool
   */
  getNextAPIKey() {
    if (this.apiKeyPool.length === 0) {
      return null;
    }

    // Filter active keys with capacity
    const availableKeys = this.apiKeyPool.filter(keyEntry => {
      if (keyEntry.status !== 'active') return false;

      const stats = this.keyUsageStats.get(keyEntry.id);
      if (!stats) return true;

      // Reset daily counter if needed
      const lastReset = new Date(stats.lastReset);
      const now = new Date();
      if (now.getDate() !== lastReset.getDate()) {
        stats.dailyUses = 0;
        stats.lastReset = now.toISOString();
        this.keyUsageStats.set(keyEntry.id, stats);
      }

      // Check daily limit
      return stats.dailyUses < keyEntry.dailyLimit;
    });

    if (availableKeys.length === 0) {
      console.warn('No available API keys in pool');
      return null;
    }

    // Round-robin selection with preference for least-used keys
    availableKeys.sort((a, b) => {
      const statsA = this.keyUsageStats.get(a.id) || { dailyUses: 0 };
      const statsB = this.keyUsageStats.get(b.id) || { dailyUses: 0 };
      return statsA.dailyUses - statsB.dailyUses;
    });

    return availableKeys[0];
  }

  /**
   * Record API key usage and award points to contributor
   */
  recordAPIKeyUsage(keyEntry, success = true) {
    try {
      // Update key entry
      keyEntry.totalUses++;
      keyEntry.lastUsed = new Date().toISOString();
      
      if (success) {
        keyEntry.successRate = ((keyEntry.successRate * (keyEntry.totalUses - 1)) + 100) / keyEntry.totalUses;
      } else {
        keyEntry.successRate = ((keyEntry.successRate * (keyEntry.totalUses - 1)) + 0) / keyEntry.totalUses;
      }

      // Update usage stats
      const stats = this.keyUsageStats.get(keyEntry.id) || {
        dailyUses: 0,
        lastReset: new Date().toISOString(),
        errors: 0,
        successes: 0
      };

      stats.dailyUses++;
      if (success) {
        stats.successes++;
      } else {
        stats.errors++;
      }

      this.keyUsageStats.set(keyEntry.id, stats);

      // Award points to contributor
      if (success) {
        const pointsAwarded = keyEntry.pointsPerUse;
        keyEntry.totalPointsGenerated += pointsAwarded;
        this.awardContributionPoints(keyEntry.contributorId, 'api_key_usage', pointsAwarded);
      }

      // Save updated pool
      this.saveAPIKeyPool();

      // Deactivate key if success rate drops too low
      if (keyEntry.totalUses > 10 && keyEntry.successRate < 50) {
        keyEntry.status = 'inactive';
        console.warn(`Deactivated API key ${keyEntry.id} due to low success rate`);
      }

    } catch (error) {
      console.error('Error recording API key usage:', error);
    }
  }

  /**
   * Award points to contributor
   */
  awardContributionPoints(contributorId, action, points) {
    try {
      // Load user contributions
      const contributionsJson = localStorage.getItem(this.STORAGE_KEYS.USER_CONTRIBUTIONS);
      const contributions = contributionsJson ? JSON.parse(contributionsJson) : {};

      // Initialize user if needed
      if (!contributions[contributorId]) {
        contributions[contributorId] = {
          totalPoints: 0,
          apiKeysContributed: 0,
          apiKeyUsages: 0,
          donations: 0,
          history: []
        };
      }

      // Award points
      contributions[contributorId].totalPoints += points;

      // Track action
      if (action === 'api_key_contribution') {
        contributions[contributorId].apiKeysContributed++;
      } else if (action === 'api_key_usage') {
        contributions[contributorId].apiKeyUsages++;
      } else if (action === 'donation') {
        contributions[contributorId].donations += points;
      }

      // Record in history
      contributions[contributorId].history.push({
        action: action,
        points: points,
        timestamp: new Date().toISOString()
      });

      // Keep only last 100 history entries
      if (contributions[contributorId].history.length > 100) {
        contributions[contributorId].history = contributions[contributorId].history.slice(-100);
      }

      // Save contributions
      localStorage.setItem(this.STORAGE_KEYS.USER_CONTRIBUTIONS, JSON.stringify(contributions));

      console.log(`Awarded ${points} points to ${contributorId} for ${action}`);

    } catch (error) {
      console.error('Error awarding contribution points:', error);
    }
  }

  /**
   * Get user contributions
   */
  getUserContributions(contributorId) {
    try {
      const contributionsJson = localStorage.getItem(this.STORAGE_KEYS.USER_CONTRIBUTIONS);
      const contributions = contributionsJson ? JSON.parse(contributionsJson) : {};
      
      return contributions[contributorId] || {
        totalPoints: 0,
        apiKeysContributed: 0,
        apiKeyUsages: 0,
        donations: 0,
        history: []
      };
    } catch (error) {
      console.error('Error getting user contributions:', error);
      return {
        totalPoints: 0,
        apiKeysContributed: 0,
        apiKeyUsages: 0,
        donations: 0,
        history: []
      };
    }
  }

  /**
   * Update tier based on contributions
   */
  updateTierBasedOnContributions(contributorId, contributions) {
    const apiKeysContributed = contributions.apiKeysContributed || 0;
    
    if (apiKeysContributed >= 10) {
      this.currentTier = 'platinum';
    } else if (apiKeysContributed >= 5) {
      this.currentTier = 'gold';
    } else if (apiKeysContributed >= 2) {
      this.currentTier = 'silver';
    } else if (apiKeysContributed >= 1) {
      this.currentTier = 'bronze';
    }

    this.saveState();
  }

  /**
   * Add donation and update sync tier
   */
  addDonation(amount) {
    this.totalDonations += amount;
    const previousTier = this.currentTier;
    this.updateTierBasedOnDonations();
    this.saveState();

    const tierChanged = previousTier !== this.currentTier;
    if (tierChanged) {
      this.notifyStatusChange({
        type: 'tier_upgrade',
        oldTier: previousTier,
        newTier: this.currentTier,
        totalDonations: this.totalDonations
      });

      // Restart sync with new interval
      if (this.syncIntervalId) {
        this.stopSync();
        this.startSync();
      }
    }

    return {
      totalDonations: this.totalDonations,
      tier: this.currentTier,
      tierChanged: tierChanged,
      syncInterval: this.getCurrentSyncInterval()
    };
  }

  /**
   * Update tier based on total donations
   */
  updateTierBasedOnDonations() {
    if (this.totalDonations >= this.syncTiers.platinum.minDonation) {
      this.currentTier = 'platinum';
    } else if (this.totalDonations >= this.syncTiers.gold.minDonation) {
      this.currentTier = 'gold';
    } else if (this.totalDonations >= this.syncTiers.silver.minDonation) {
      this.currentTier = 'silver';
    } else if (this.totalDonations >= this.syncTiers.bronze.minDonation) {
      this.currentTier = 'bronze';
    } else {
      this.currentTier = 'free';
    }
  }

  /**
   * Get current sync interval in milliseconds
   */
  getCurrentSyncInterval() {
    return this.syncTiers[this.currentTier].interval;
  }

  /**
   * Get tier information
   */
  getTierInfo() {
    return {
      current: this.currentTier,
      name: this.syncTiers[this.currentTier].name,
      interval: this.getCurrentSyncInterval(),
      intervalSeconds: this.getCurrentSyncInterval() / 1000,
      totalDonations: this.totalDonations,
      nextTier: this.getNextTier(),
      allTiers: this.syncTiers
    };
  }

  /**
   * Get next tier information
   */
  getNextTier() {
    const tiers = ['free', 'bronze', 'silver', 'gold', 'platinum'];
    const currentIndex = tiers.indexOf(this.currentTier);
    
    if (currentIndex >= tiers.length - 1) {
      return null; // Already at max tier
    }

    const nextTierKey = tiers[currentIndex + 1];
    const nextTier = this.syncTiers[nextTierKey];
    
    return {
      key: nextTierKey,
      name: nextTier.name,
      minDonation: nextTier.minDonation,
      amountNeeded: Math.max(0, nextTier.minDonation - this.totalDonations),
      interval: nextTier.interval,
      intervalSeconds: nextTier.interval / 1000
    };
  }

  /**
   * Fetch missing persons cases from NamUs
   */
  async fetchCases(filters = {}) {
    try {
      // Try to use API key from pool first
      const keyEntry = this.getNextAPIKey();
      
      if (keyEntry && !this.USE_PROXY) {
        // Direct API call with pooled key
        try {
          const response = await fetch(`${this.API_BASE}/MissingPersons`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${keyEntry.key}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            
            // Record successful usage
            this.recordAPIKeyUsage(keyEntry, true);
            
            // Store cases in localStorage
            localStorage.setItem(this.STORAGE_KEYS.CASES, JSON.stringify(data));
            
            this.lastSyncTime = new Date();
            this.saveState();
            
            return {
              success: true,
              cases: data,
              timestamp: this.lastSyncTime,
              source: 'namus_api_pool'
            };
          } else {
            // Record failed usage
            this.recordAPIKeyUsage(keyEntry, false);
            console.warn(`API key ${keyEntry.id} failed with status ${response.status}`);
          }
        } catch (error) {
          // Record failed usage
          this.recordAPIKeyUsage(keyEntry, false);
          console.error('Error using pooled API key:', error);
        }
      } else if (this.USE_PROXY) {
        // Use backend proxy for production
        try {
          const response = await fetch(`${this.PROXY_ENDPOINT}/search`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ filters })
          });

          if (response.ok) {
            const data = await response.json();
            
            // Store cases in localStorage
            localStorage.setItem(this.STORAGE_KEYS.CASES, JSON.stringify(data.cases || data));
            
            this.lastSyncTime = new Date();
            this.saveState();
            
            return {
              success: true,
              cases: data.cases || data,
              timestamp: this.lastSyncTime,
              source: data.cached ? 'proxy_cache' : 'proxy_api'
            };
          }
        } catch (error) {
          console.error('Error using proxy endpoint:', error);
        }
      }
      
      // Fallback to mock data for demonstration
      console.log('Using mock data (no API keys or proxy available)');
      const mockCases = await this.fetchMockCases(filters);
      
      // Store cases in localStorage
      localStorage.setItem(this.STORAGE_KEYS.CASES, JSON.stringify(mockCases));
      
      this.lastSyncTime = new Date();
      this.saveState();
      
      return {
        success: true,
        cases: mockCases,
        timestamp: this.lastSyncTime,
        source: 'mock'
      };
    } catch (error) {
      console.error('Error fetching NamUs cases:', error);
      this.notifyError({
        type: 'fetch_error',
        message: error.message,
        timestamp: new Date()
      });
      
      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Fetch mock cases for demonstration
   */
  async fetchMockCases(filters = {}) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockCases = [
      {
        id: 'MP-001234',
        source: 'NamUs',
        name: 'Jane Doe',
        age: 28,
        race: 'White',
        sex: 'Female',
        lastSeenDate: new Date(Date.now() - 86400000 * 5).toISOString(),
        lastSeenLocation: {
          city: 'Indianapolis',
          state: 'Indiana',
          county: 'Marion'
        },
        circumstances: 'Last seen leaving work. Family reported missing after missed contact.',
        physicalDescription: {
          height: '5\'6"',
          weight: '135 lbs',
          hairColor: 'Brown',
          eyeColor: 'Blue'
        },
        images: [],
        status: 'open',
        caseNumber: 'MP-001234',
        reportedDate: new Date(Date.now() - 86400000 * 5).toISOString(),
        timeline: [
          {
            date: new Date(Date.now() - 86400000 * 5).toISOString(),
            event: 'Case reported',
            type: 'reported'
          },
          {
            date: new Date(Date.now() - 86400000 * 4).toISOString(),
            event: 'Media coverage initiated',
            type: 'media'
          },
          {
            date: new Date(Date.now() - 86400000 * 2).toISOString(),
            event: 'New tip received',
            type: 'tip'
          }
        ],
        proximity: 'cold', // cold, warm, hot based on leads
        lastUpdated: new Date(Date.now() - 86400000 * 1).toISOString()
      },
      {
        id: 'MP-005678',
        source: 'NamUs',
        name: 'John Smith',
        age: 45,
        race: 'Black',
        sex: 'Male',
        lastSeenDate: new Date(Date.now() - 86400000 * 12).toISOString(),
        lastSeenLocation: {
          city: 'Fort Wayne',
          state: 'Indiana',
          county: 'Allen'
        },
        circumstances: 'Left home for work but never arrived. Vehicle found abandoned.',
        physicalDescription: {
          height: '6\'0"',
          weight: '180 lbs',
          hairColor: 'Black',
          eyeColor: 'Brown'
        },
        images: [],
        status: 'open',
        caseNumber: 'MP-005678',
        reportedDate: new Date(Date.now() - 86400000 * 12).toISOString(),
        timeline: [
          {
            date: new Date(Date.now() - 86400000 * 12).toISOString(),
            event: 'Case reported',
            type: 'reported'
          },
          {
            date: new Date(Date.now() - 86400000 * 10).toISOString(),
            event: 'Vehicle located',
            type: 'evidence'
          },
          {
            date: new Date(Date.now() - 86400000 * 7).toISOString(),
            event: 'Witness interview completed',
            type: 'investigation'
          },
          {
            date: new Date(Date.now() - 86400000 * 3).toISOString(),
            event: 'Search area expanded',
            type: 'search'
          }
        ],
        proximity: 'warm', // cold, warm, hot based on leads
        lastUpdated: new Date(Date.now() - 86400000 * 3).toISOString()
      }
    ];

    // Apply filters
    let filtered = mockCases;
    
    if (filters.state) {
      filtered = filtered.filter(c => 
        c.lastSeenLocation.state.toLowerCase() === filters.state.toLowerCase()
      );
    }
    
    if (filters.city) {
      filtered = filtered.filter(c => 
        c.lastSeenLocation.city.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    return filtered;
  }

  /**
   * Start periodic sync
   */
  startSync() {
    if (this.syncIntervalId) {
      console.warn('Sync already running');
      return;
    }

    const interval = this.getCurrentSyncInterval();
    console.log(`Starting NamUs sync with ${this.currentTier} tier (${interval}ms interval)`);

    // Perform initial sync
    this.performSync();

    // Set up periodic sync
    this.syncIntervalId = setInterval(() => {
      this.performSync();
    }, interval);

    this.notifyStatusChange({
      type: 'sync_started',
      tier: this.currentTier,
      interval: interval
    });
  }

  /**
   * Stop periodic sync
   */
  stopSync() {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
      
      this.notifyStatusChange({
        type: 'sync_stopped',
        tier: this.currentTier
      });
    }
  }

  /**
   * Perform a single sync operation
   */
  async performSync() {
    console.log('Performing NamUs data sync...');
    
    try {
      const result = await this.fetchCases();
      
      if (result.success) {
        const changes = await this.detectChanges(result.cases);
        
        this.notifySyncComplete({
          timestamp: result.timestamp,
          casesCount: result.cases.length,
          changes: changes,
          tier: this.currentTier
        });

        // Notify about specific changes
        if (changes.statusUpdates.length > 0 || changes.newCases.length > 0) {
          this.notifyStatusChange({
            type: 'cases_updated',
            changes: changes
          });
        }
      }
    } catch (error) {
      console.error('Sync error:', error);
      this.notifyError({
        type: 'sync_error',
        message: error.message,
        timestamp: new Date()
      });
    }
  }

  /**
   * Detect changes in cases
   */
  async detectChanges(newCases) {
    const changes = {
      statusUpdates: [],
      newCases: [],
      proximityChanges: [],
      timelineUpdates: []
    };

    try {
      const storedCasesJson = localStorage.getItem(this.STORAGE_KEYS.CASES);
      if (!storedCasesJson) {
        // First sync - all cases are new
        changes.newCases = newCases.map(c => ({ id: c.id, name: c.name }));
        return changes;
      }

      const storedCases = JSON.parse(storedCasesJson);
      const storedCasesMap = new Map(storedCases.map(c => [c.id, c]));

      newCases.forEach(newCase => {
        const oldCase = storedCasesMap.get(newCase.id);
        
        if (!oldCase) {
          // New case
          changes.newCases.push({
            id: newCase.id,
            name: newCase.name,
            location: newCase.lastSeenLocation
          });
        } else {
          // Check for status updates
          if (oldCase.status !== newCase.status) {
            changes.statusUpdates.push({
              id: newCase.id,
              name: newCase.name,
              oldStatus: oldCase.status,
              newStatus: newCase.status
            });
          }

          // Check for proximity changes
          if (oldCase.proximity !== newCase.proximity) {
            changes.proximityChanges.push({
              id: newCase.id,
              name: newCase.name,
              oldProximity: oldCase.proximity,
              newProximity: newCase.proximity
            });
          }

          // Check for timeline updates
          if (newCase.timeline && oldCase.timeline && 
              newCase.timeline.length > oldCase.timeline.length) {
            changes.timelineUpdates.push({
              id: newCase.id,
              name: newCase.name,
              newEvents: newCase.timeline.length - oldCase.timeline.length
            });
          }
        }
      });

      // Store history
      this.storeChangeHistory(changes);
    } catch (error) {
      console.error('Error detecting changes:', error);
    }

    return changes;
  }

  /**
   * Store change history
   */
  storeChangeHistory(changes) {
    try {
      const historyJson = localStorage.getItem(this.STORAGE_KEYS.HISTORY);
      const history = historyJson ? JSON.parse(historyJson) : [];
      
      history.unshift({
        timestamp: new Date().toISOString(),
        changes: changes
      });

      // Keep only last 100 history entries
      const trimmedHistory = history.slice(0, 100);
      
      localStorage.setItem(this.STORAGE_KEYS.HISTORY, JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error('Error storing change history:', error);
    }
  }

  /**
   * Get change history
   */
  getChangeHistory(limit = 50) {
    try {
      const historyJson = localStorage.getItem(this.STORAGE_KEYS.HISTORY);
      if (!historyJson) {
        return [];
      }
      
      const history = JSON.parse(historyJson);
      return history.slice(0, limit);
    } catch (error) {
      console.error('Error loading change history:', error);
      return [];
    }
  }

  /**
   * Get stored cases
   */
  getCases() {
    try {
      const casesJson = localStorage.getItem(this.STORAGE_KEYS.CASES);
      return casesJson ? JSON.parse(casesJson) : [];
    } catch (error) {
      console.error('Error loading cases:', error);
      return [];
    }
  }

  /**
   * Subscribe to sync completion events
   */
  onSyncComplete(callback) {
    this.syncCallbacks.push(callback);
  }

  /**
   * Subscribe to status change events
   */
  onStatusChange(callback) {
    this.statusCallbacks.push(callback);
  }

  /**
   * Subscribe to error events
   */
  onError(callback) {
    this.errorCallbacks.push(callback);
  }

  /**
   * Notify sync completion
   */
  notifySyncComplete(data) {
    this.syncCallbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in sync callback:', error);
      }
    });
  }

  /**
   * Notify status change
   */
  notifyStatusChange(data) {
    this.statusCallbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in status callback:', error);
      }
    });
  }

  /**
   * Notify error
   */
  notifyError(data) {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in error callback:', error);
      }
    });
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    return {
      isRunning: this.syncIntervalId !== null,
      lastSyncTime: this.lastSyncTime,
      tier: this.getTierInfo(),
      casesCount: this.getCases().length
    };
  }
}

// Create singleton instance
const namusService = new NamUsAPIService();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NamUsAPIService;
}
