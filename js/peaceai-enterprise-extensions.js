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
 * File: peaceai-enterprise-extensions.js
 * Declaration ID: IP-5D7D3932-MLL28ZV5
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * PeaceAI Enterprise Extensions
 * 
 * This module provides enterprise-grade enhancements for the PeaceAI Church Security System:
 * - Real Google OAuth 2.0 authentication
 * - Role-Based Access Control (RBAC)
 * - Comprehensive error handling with retry logic
 * - Audit logging and event tracking
 * - Input validation and XSS prevention
 * - CSRF protection
 * - Rate limiting
 * - Performance monitoring
 * - Offline support with IndexedDB
 * - WebSocket fallback for SSE
 * 
 * Author: Barbrick Design
 * Version: 2.0.0 Enterprise
 * License: MIT
 */

(function() {
  'use strict';

  // ============================================================================
  // CONFIGURATION
  // ============================================================================
  
  const CONFIG = {
    // Google OAuth 2.0 Configuration
    GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com', // Replace in production
    
    // API Configuration
    API_BASE_URL: window.location.origin,
    API_TIMEOUT: 30000, // 30 seconds
    MAX_RETRIES: 3,
    RETRY_DELAY_BASE: 1000, // 1 second base delay for exponential backoff
    
    // Security
    CSRF_TOKEN_HEADER: 'X-CSRF-Token',
    RATE_LIMIT_WINDOW: 60000, // 1 minute
    RATE_LIMIT_MAX_REQUESTS: 60, // 60 requests per minute
    SESSION_TIMEOUT: 3600000, // 1 hour
    
    // Features
    ENABLE_OFFLINE_MODE: true,
    ENABLE_AUDIT_LOG: true,
    ENABLE_PERFORMANCE_MONITORING: true,
    
    // Roles and Permissions
    ROLES: {
      ADMIN: 'admin',
      STEWARD: 'steward',
      GUARD: 'guard',
      VIEWER: 'viewer'
    },
    
    PERMISSIONS: {
      VIEW_FEEDS: ['admin', 'steward', 'guard', 'viewer'],
      CONTROL_MONITORING: ['admin', 'steward', 'guard'],
      CONFIGURE_ALERTS: ['admin', 'steward'],
      RUN_AUTOMATIONS: ['admin', 'steward'],
      VIEW_AUDIT_LOG: ['admin'],
      MANAGE_USERS: ['admin']
    }
  };

  // ============================================================================
  // ENTERPRISE AUTHENTICATION MANAGER
  // ============================================================================
  
  class EnterpriseAuthManager {
    constructor() {
      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;
      this.tokenExpiry = null;
      this.sessionTimeout = null;
      this.csrfToken = null;
      
      this.initCSRFProtection();
      this.loadSessionFromStorage();
      this.setupSessionTimeout();
    }

    /**
     * Initialize Google OAuth 2.0
     */
    initGoogleAuth() {
      if (typeof google === 'undefined' || !google.accounts) {
        console.warn('Google Identity Services not loaded. Using fallback auth.');
        return;
      }

      google.accounts.id.initialize({
        client_id: CONFIG.GOOGLE_CLIENT_ID,
        callback: this.handleGoogleSignIn.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true
      });

      google.accounts.id.renderButton(
        document.getElementById('g_id_signin'),
        { theme: 'filled_black', size: 'large', text: 'signin_with', shape: 'rectangular' }
      );
    }

    /**
     * Handle Google Sign-In response
     */
    async handleGoogleSignIn(response) {
      try {
        showToast('Authenticating...', 'info');
        
        // Send JWT to backend for verification
        const verifyResponse = await fetchWithRetry('/api/auth/verify-google-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            [CONFIG.CSRF_TOKEN_HEADER]: this.csrfToken
          },
          body: JSON.stringify({
            credential: response.credential
          })
        });

        if (!verifyResponse.ok) {
          throw new Error('Authentication failed');
        }

        const userData = await verifyResponse.json();
        
        this.user = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          picture: userData.picture,
          role: userData.role || CONFIG.ROLES.VIEWER,
          permissions: this.getPermissionsForRole(userData.role || CONFIG.ROLES.VIEWER)
        };

        this.accessToken = userData.accessToken;
        this.refreshToken = userData.refreshToken;
        this.tokenExpiry = Date.now() + (userData.expiresIn || 3600) * 1000;

        this.saveSessionToStorage();
        this.renderAuthStatus();
        this.setupTokenRefresh();
        
        showToast(`Welcome, ${this.user.name}!`, 'success');
        logAuditEvent('user_login', { userId: this.user.id, role: this.user.role });
        
        // Refresh data after login
        if (typeof discoverDevices === 'function') {
          discoverDevices();
        }
      } catch (error) {
        console.error('Google sign-in error:', error);
        showToast('Authentication failed. Please try again.', 'error');
        logError('auth_failed', error);
      }
    }

    /**
     * Sign out user
     */
    async signOut() {
      try {
        if (this.accessToken) {
          // Notify backend of sign-out
          await fetchWithRetry('/api/auth/signout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              [CONFIG.CSRF_TOKEN_HEADER]: this.csrfToken
            }
          });
        }

        logAuditEvent('user_logout', { userId: this.user?.id });
      } catch (error) {
        console.error('Sign-out error:', error);
      } finally {
        this.clearSession();
        this.renderAuthStatus();
        showToast('Signed out successfully', 'info');
        
        // Clear sensitive data
        if (typeof stopMonitoringBtn !== 'undefined' && stopMonitoringBtn.click) {
          stopMonitoringBtn.click();
        }
      }
    }

    /**
     * Check if user has specific permission
     */
    hasPermission(permission) {
      if (!this.user || !this.user.permissions) {
        return false;
      }
      return this.user.permissions.includes(permission);
    }

    /**
     * Get permissions for a role
     */
    getPermissionsForRole(role) {
      const permissions = [];
      for (const [perm, allowedRoles] of Object.entries(CONFIG.PERMISSIONS)) {
        if (allowedRoles.includes(role)) {
          permissions.push(perm);
        }
      }
      return permissions;
    }

    /**
     * Initialize CSRF protection
     */
    initCSRFProtection() {
      // Generate CSRF token
      const stored = sessionStorage.getItem('csrfToken');
      if (stored) {
        this.csrfToken = stored;
      } else {
        this.csrfToken = this.generateToken(32);
        sessionStorage.setItem('csrfToken', this.csrfToken);
      }
    }

    /**
     * Generate random token
     */
    generateToken(length) {
      const array = new Uint8Array(length);
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Setup automatic token refresh
     */
    setupTokenRefresh() {
      if (this.tokenRefreshInterval) {
        clearInterval(this.tokenRefreshInterval);
      }

      // Refresh token 5 minutes before expiry
      const refreshTime = Math.max(0, this.tokenExpiry - Date.now() - 300000);
      
      setTimeout(async () => {
        await this.refreshAccessToken();
        this.setupTokenRefresh(); // Setup next refresh
      }, refreshTime);
    }

    /**
     * Refresh access token
     */
    async refreshAccessToken() {
      if (!this.refreshToken) {
        console.warn('No refresh token available');
        return;
      }

      try {
        const response = await fetchWithRetry('/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            [CONFIG.CSRF_TOKEN_HEADER]: this.csrfToken
          },
          body: JSON.stringify({
            refreshToken: this.refreshToken
          })
        });

        if (!response.ok) {
          throw new Error('Token refresh failed');
        }

        const data = await response.json();
        this.accessToken = data.accessToken;
        this.tokenExpiry = Date.now() + (data.expiresIn || 3600) * 1000;
        
        this.saveSessionToStorage();
        logAuditEvent('token_refreshed', { userId: this.user?.id });
      } catch (error) {
        console.error('Token refresh error:', error);
        showToast('Session expired. Please sign in again.', 'warning');
        this.clearSession();
      }
    }

    /**
     * Setup session timeout
     */
    setupSessionTimeout() {
      if (this.sessionTimeout) {
        clearTimeout(this.sessionTimeout);
      }

      this.sessionTimeout = setTimeout(() => {
        showToast('Session timed out due to inactivity', 'warning');
        this.signOut();
      }, CONFIG.SESSION_TIMEOUT);

      // Reset timeout on user activity
      ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, () => {
          this.setupSessionTimeout();
        }, { once: true, passive: true });
      });
    }

    /**
     * Save session to storage
     */
    saveSessionToStorage() {
      try {
        const session = {
          user: this.user,
          accessToken: this.accessToken,
          refreshToken: this.refreshToken,
          tokenExpiry: this.tokenExpiry
        };
        sessionStorage.setItem('peaceai_session', JSON.stringify(session));
      } catch (error) {
        console.error('Failed to save session:', error);
      }
    }

    /**
     * Load session from storage
     */
    loadSessionFromStorage() {
      try {
        const stored = sessionStorage.getItem('peaceai_session');
        if (!stored) return;

        const session = JSON.parse(stored);
        
        // Check if token is still valid
        if (session.tokenExpiry && session.tokenExpiry > Date.now()) {
          this.user = session.user;
          this.accessToken = session.accessToken;
          this.refreshToken = session.refreshToken;
          this.tokenExpiry = session.tokenExpiry;
          
          this.renderAuthStatus();
          this.setupTokenRefresh();
          this.setupSessionTimeout();
        } else {
          this.clearSession();
        }
      } catch (error) {
        console.error('Failed to load session:', error);
        this.clearSession();
      }
    }

    /**
     * Clear session
     */
    clearSession() {
      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;
      this.tokenExpiry = null;
      
      if (this.sessionTimeout) {
        clearTimeout(this.sessionTimeout);
      }
      if (this.tokenRefreshInterval) {
        clearInterval(this.tokenRefreshInterval);
      }
      
      sessionStorage.removeItem('peaceai_session');
    }

    /**
     * Render authentication status in UI
     */
    renderAuthStatus() {
      const googleSignInBtn = document.getElementById('googleSignInBtn');
      const userInfo = document.getElementById('userInfo');
      const userName = document.getElementById('userName');
      const userRole = document.getElementById('userRole');

      if (this.user) {
        if (googleSignInBtn) googleSignInBtn.style.display = 'none';
        if (userInfo) {
          userInfo.style.display = 'block';
          if (userName) userName.textContent = this.user.name;
          if (userRole) {
            const roleDisplay = this.user.role.charAt(0).toUpperCase() + this.user.role.slice(1);
            userRole.textContent = `Role: ${roleDisplay}`;
          }
        }
      } else {
        if (googleSignInBtn) googleSignInBtn.style.display = 'block';
        if (userInfo) userInfo.style.display = 'none';
      }
    }

    /**
     * Get authorization headers for API requests
     */
    getAuthHeaders() {
      const headers = {
        [CONFIG.CSRF_TOKEN_HEADER]: this.csrfToken
      };

      if (this.accessToken) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
      }

      return headers;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
      return this.user !== null && this.accessToken !== null && this.tokenExpiry > Date.now();
    }
  }

  // ============================================================================
  // ENHANCED ERROR HANDLER
  // ============================================================================
  
  class EnhancedErrorHandler {
    constructor() {
      this.errors = [];
      this.maxErrors = 100;
    }

    /**
     * Handle error with retry logic
     */
    async handleError(error, context = {}, retryFn = null, retries = 0) {
      const errorInfo = {
        message: error.message || 'Unknown error',
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
        retries
      };

      this.errors.push(errorInfo);
      if (this.errors.length > this.maxErrors) {
        this.errors.shift();
      }

      console.error('[PeaceAI Error]', errorInfo);
      logError(context.operation || 'unknown', error);

      // Determine if error is retryable
      if (retryFn && this.isRetryable(error) && retries < CONFIG.MAX_RETRIES) {
        const delay = this.calculateBackoff(retries);
        console.log(`Retrying in ${delay}ms (attempt ${retries + 1}/${CONFIG.MAX_RETRIES})`);
        
        await this.sleep(delay);
        
        try {
          return await retryFn();
        } catch (retryError) {
          return this.handleError(retryError, context, retryFn, retries + 1);
        }
      }

      // Show user-friendly error message
      this.showUserError(error, context);
      
      return null;
    }

    /**
     * Check if error is retryable
     */
    isRetryable(error) {
      if (error.message.includes('NetworkError') || 
          error.message.includes('Failed to fetch') ||
          error.message.includes('timeout') ||
          error.message.includes('ECONNREFUSED')) {
        return true;
      }
      
      // Don't retry client errors (4xx) or 501 (Not Implemented)
      if (error.status && (error.status < 500 || error.status === 501)) {
        return false;
      }
      
      if (error.status >= 500 && error.status < 600) {
        return true;
      }
      
      if (error.status === 429) { // Rate limited
        return true;
      }

      return false;
    }

    /**
     * Calculate exponential backoff delay
     */
    calculateBackoff(retries) {
      const baseDelay = CONFIG.RETRY_DELAY_BASE;
      const maxDelay = 30000; // 30 seconds max
      const delay = Math.min(baseDelay * Math.pow(2, retries), maxDelay);
      // Add jitter
      return delay + Math.random() * 1000;
    }

    /**
     * Sleep utility
     */
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Show user-friendly error message
     */
    showUserError(error, context) {
      // Don't show errors for audit log failures (501/404) on static deployments
      if ((error.status === 501 || error.status === 404) && context.url && context.url.includes('/api/audit/log')) {
        return; // Silently ignore - backend not available is expected
      }
      
      // Don't show errors for device discovery failures on page load
      // These are expected when backend is not available and will fall back to cached data
      if (context.url && context.url.includes('/api/devices')) {
        console.log('📱 Device discovery failed - will use cached data if available');
        return; // Silently ignore - offline mode will handle this
      }
      
      let message = 'An error occurred. ';

      if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        message = 'Network connection failed. Please check your internet connection.';
      } else if (error.status === 401 || error.status === 403) {
        message = 'Authentication failed. Please sign in again.';
      } else if (error.status === 404) {
        message = 'The requested resource was not found.';
      } else if (error.status === 429) {
        message = 'Too many requests. Please wait a moment and try again.';
      } else if (error.status === 501) {
        message = 'Service not available on this deployment.';
      } else if (error.status >= 500) {
        message = 'Server error. Please try again later.';
      } else if (context.operation) {
        message += `Operation: ${context.operation}`;
      }

      showToast(message, 'error');
    }

    /**
     * Get recent errors
     */
    getRecentErrors(count = 10) {
      return this.errors.slice(-count);
    }

    /**
     * Clear error log
     */
    clearErrors() {
      this.errors = [];
    }
  }

  // ============================================================================
  // RATE LIMITER
  // ============================================================================
  
  class RateLimiter {
    constructor(maxRequests = CONFIG.RATE_LIMIT_MAX_REQUESTS, windowMs = CONFIG.RATE_LIMIT_WINDOW) {
      this.maxRequests = maxRequests;
      this.windowMs = windowMs;
      this.requests = new Map();
    }

    /**
     * Check if request is allowed
     */
    checkLimit(key) {
      const now = Date.now();
      const userRequests = this.requests.get(key) || [];
      
      // Remove old requests outside the window
      const recentRequests = userRequests.filter(time => now - time < this.windowMs);
      
      if (recentRequests.length >= this.maxRequests) {
        const oldestRequest = Math.min(...recentRequests);
        const resetTime = Math.ceil((oldestRequest + this.windowMs - now) / 1000);
        throw new Error(`Rate limit exceeded. Try again in ${resetTime} seconds.`);
      }
      
      recentRequests.push(now);
      this.requests.set(key, recentRequests);
      
      return true;
    }

    /**
     * Get remaining requests for key
     */
    getRemaining(key) {
      const now = Date.now();
      const userRequests = this.requests.get(key) || [];
      const recentRequests = userRequests.filter(time => now - time < this.windowMs);
      return Math.max(0, this.maxRequests - recentRequests.length);
    }
  }

  // ============================================================================
  // INPUT VALIDATOR
  // ============================================================================
  
  class InputValidator {
    /**
     * Sanitize HTML to prevent XSS
     */
    static sanitizeHTML(input) {
      const div = document.createElement('div');
      div.textContent = input;
      return div.innerHTML;
    }

    /**
     * Validate email
     */
    static validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }

    /**
     * Validate phone number
     */
    static validatePhone(phone) {
      const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
      return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
    }

    /**
     * Validate feed ID
     */
    static validateFeedId(feedId) {
      return typeof feedId === 'string' && feedId.length > 0 && feedId.length < 100;
    }

    /**
     * Validate and sanitize text input
     */
    static sanitizeText(text, maxLength = 1000) {
      if (typeof text !== 'string') {
        return '';
      }
      text = text.trim();
      if (text.length > maxLength) {
        text = text.substring(0, maxLength);
      }
      return this.sanitizeHTML(text);
    }
  }

  // ============================================================================
  // AUDIT LOGGER
  // ============================================================================
  
  class AuditLogger {
    constructor() {
      this.logs = [];
      this.maxLogs = 1000;
      this.db = null;
      
      if (CONFIG.ENABLE_AUDIT_LOG && CONFIG.ENABLE_OFFLINE_MODE) {
        this.initIndexedDB();
      }
    }

    /**
     * Initialize IndexedDB for offline audit logs
     */
    async initIndexedDB() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('PeaceAI_AuditLog', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          this.db = request.result;
          resolve();
        };
        
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains('logs')) {
            const store = db.createObjectStore('logs', { keyPath: 'id', autoIncrement: true });
            store.createIndex('timestamp', 'timestamp');
            store.createIndex('userId', 'userId');
            store.createIndex('action', 'action');
          }
        };
      });
    }

    /**
     * Log audit event
     */
    async log(action, details = {}) {
      if (!CONFIG.ENABLE_AUDIT_LOG) return;

      const logEntry = {
        action,
        details,
        userId: authManager.user?.id || 'anonymous',
        userName: authManager.user?.name || 'Anonymous',
        userRole: authManager.user?.role || 'unknown',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ip: await this.getClientIP()
      };

      this.logs.push(logEntry);
      if (this.logs.length > this.maxLogs) {
        this.logs.shift();
      }

      // Store in IndexedDB
      if (this.db) {
        try {
          const transaction = this.db.transaction(['logs'], 'readwrite');
          const store = transaction.objectStore('logs');
          store.add(logEntry);
        } catch (error) {
          console.error('Failed to store audit log:', error);
        }
      }

      // Send to backend (silently fail if backend not available)
      try {
        await fetchWithRetry('/api/audit/log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authManager.getAuthHeaders()
          },
          body: JSON.stringify(logEntry)
        });
      } catch (error) {
        // Silently log backend unavailability - this is expected on static hosting
        if (error.status === 501 || error.status === 404) {
          // Backend not available - this is OK for static deployments
        } else {
          console.warn('Failed to send audit log to backend:', error.message);
        }
      }

      console.log('[Audit]', logEntry);
    }

    /**
     * Get client IP (best effort)
     * Note: May be blocked by browser extensions or privacy settings
     */
    async getClientIP() {
      try {
        // Add a timeout using AbortController to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch('https://api.ipify.org?format=json', {
          signal: controller.signal,
          mode: 'cors'
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          return 'unknown';
        }
        
        const data = await response.json();
        return data.ip || 'unknown';
      } catch (error) {
        // Silently handle fetch failures (browser blocking, network issues, etc.)
        // This is expected in many environments (privacy extensions, CSP, etc.)
        return 'unknown';
      }
    }

    /**
     * Get audit logs
     */
    async getLogs(filters = {}) {
      if (!this.db) {
        return this.logs.filter(log => this.matchesFilters(log, filters));
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['logs'], 'readonly');
        const store = transaction.objectStore('logs');
        const request = store.getAll();
        
        request.onsuccess = () => {
          const logs = request.result.filter(log => this.matchesFilters(log, filters));
          resolve(logs);
        };
        request.onerror = () => reject(request.error);
      });
    }

    /**
     * Check if log matches filters
     */
    matchesFilters(log, filters) {
      if (filters.userId && log.userId !== filters.userId) return false;
      if (filters.action && log.action !== filters.action) return false;
      if (filters.startDate && new Date(log.timestamp) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(log.timestamp) > new Date(filters.endDate)) return false;
      return true;
    }

    /**
     * Export logs as CSV
     */
    exportLogsCSV() {
      const headers = ['Timestamp', 'User', 'Role', 'Action', 'Details'];
      const rows = this.logs.map(log => [
        log.timestamp,
        log.userName,
        log.userRole,
        log.action,
        JSON.stringify(log.details)
      ]);

      const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      return csv;
    }
  }

  // ============================================================================
  // PERFORMANCE MONITOR
  // ============================================================================
  
  class PerformanceMonitor {
    constructor() {
      this.metrics = {
        apiCalls: [],
        renderTimes: [],
        errors: []
      };
      this.maxMetrics = 100;
    }

    /**
     * Start measuring operation
     */
    startMeasure(name) {
      performance.mark(`${name}-start`);
      return name;
    }

    /**
     * End measuring operation
     */
    endMeasure(name) {
      performance.mark(`${name}-end`);
      try {
        performance.measure(name, `${name}-start`, `${name}-end`);
        const measure = performance.getEntriesByName(name)[0];
        
        this.metrics.renderTimes.push({
          name,
          duration: measure.duration,
          timestamp: Date.now()
        });

        if (this.metrics.renderTimes.length > this.maxMetrics) {
          this.metrics.renderTimes.shift();
        }

        performance.clearMarks(`${name}-start`);
        performance.clearMarks(`${name}-end`);
        performance.clearMeasures(name);

        return measure.duration;
      } catch (error) {
        console.error('Performance measurement error:', error);
        return 0;
      }
    }

    /**
     * Log API call metrics
     */
    logAPICall(endpoint, duration, success) {
      this.metrics.apiCalls.push({
        endpoint,
        duration,
        success,
        timestamp: Date.now()
      });

      if (this.metrics.apiCalls.length > this.maxMetrics) {
        this.metrics.apiCalls.shift();
      }
    }

    /**
     * Get performance statistics
     */
    getStats() {
      const stats = {
        avgAPICallDuration: 0,
        avgRenderTime: 0,
        apiSuccessRate: 0,
        totalAPIsCalls: this.metrics.apiCalls.length,
        totalErrors: this.metrics.errors.length
      };

      if (this.metrics.apiCalls.length > 0) {
        stats.avgAPICallDuration = this.metrics.apiCalls.reduce((sum, call) => sum + call.duration, 0) / this.metrics.apiCalls.length;
        const successfulCalls = this.metrics.apiCalls.filter(call => call.success).length;
        stats.apiSuccessRate = (successfulCalls / this.metrics.apiCalls.length * 100).toFixed(2) + '%';
      }

      if (this.metrics.renderTimes.length > 0) {
        stats.avgRenderTime = this.metrics.renderTimes.reduce((sum, render) => sum + render.duration, 0) / this.metrics.renderTimes.length;
      }

      return stats;
    }

    /**
     * Log error
     */
    logError(error, context) {
      this.metrics.errors.push({
        message: error.message,
        context,
        timestamp: Date.now()
      });

      if (this.metrics.errors.length > this.maxMetrics) {
        this.metrics.errors.shift();
      }
    }

    /**
     * Display performance dashboard
     */
    displayDashboard() {
      const stats = this.getStats();
      console.group('🚀 PeaceAI Performance Dashboard');
      console.log('Average API Call Duration:', stats.avgAPICallDuration.toFixed(2), 'ms');
      console.log('Average Render Time:', stats.avgRenderTime.toFixed(2), 'ms');
      console.log('API Success Rate:', stats.apiSuccessRate);
      console.log('Total API Calls:', stats.totalAPIsCalls);
      console.log('Total Errors:', stats.totalErrors);
      console.groupEnd();
    }
  }

  // ============================================================================
  // ENHANCED FETCH WITH RETRY
  // ============================================================================
  
  async function fetchWithRetry(url, options = {}, retries = 0) {
    const startTime = performance.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT);

    // Check rate limit
    const rateLimitKey = authManager.user?.id || 'anonymous';
    try {
      rateLimiter.checkLimit(rateLimitKey);
    } catch (error) {
      showToast(error.message, 'warning');
      throw error;
    }

    try {
      // Add auth headers
      options.headers = {
        ...options.headers,
        ...authManager.getAuthHeaders()
      };

      // Add abort signal
      options.signal = controller.signal;

      const response = await fetch(url, options);
      clearTimeout(timeout);

      const duration = performance.now() - startTime;
      performanceMonitor.logAPICall(url, duration, response.ok);

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        throw error;
      }

      return response;
    } catch (error) {
      clearTimeout(timeout);
      
      if (error.name === 'AbortError') {
        error.message = 'Request timeout';
      }

      const duration = performance.now() - startTime;
      performanceMonitor.logAPICall(url, duration, false);

      return await errorHandler.handleError(
        error,
        { operation: 'fetch', url, retries },
        () => fetchWithRetry(url, options, retries + 1),
        retries
      );
    }
  }

  // ============================================================================
  // UI HELPERS
  // ============================================================================
  
  function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 400px;
      `;
      document.body.appendChild(container);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const colors = {
      info: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    };

    toast.style.cssText = `
      background: ${colors[type] || colors.info};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-size: 0.9rem;
      animation: slideIn 0.3s ease-out;
      cursor: pointer;
    `;

    toast.textContent = message;
    container.appendChild(toast);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, 5000);

    // Remove on click
    toast.addEventListener('click', () => {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    });
  }

  // Add toast animations to document
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function logAuditEvent(action, details = {}) {
    if (auditLogger) {
      auditLogger.log(action, details);
    }
  }

  function logError(operation, error) {
    if (performanceMonitor) {
      performanceMonitor.logError(error, { operation });
    }
  }

  // ============================================================================
  // INITIALIZE ENTERPRISE FEATURES
  // ============================================================================
  
  const authManager = new EnterpriseAuthManager();
  const errorHandler = new EnhancedErrorHandler();
  const rateLimiter = new RateLimiter();
  const auditLogger = new AuditLogger();
  const performanceMonitor = new PerformanceMonitor();

  // Expose to global scope for use in main script
  window.PeaceAI = {
    authManager,
    errorHandler,
    rateLimiter,
    auditLogger,
    performanceMonitor,
    fetchWithRetry,
    showToast,
    logAuditEvent,
    logError,
    InputValidator,
    CONFIG
  };

  // Initialize on load
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 PeaceAI Enterprise Extensions loaded');
    authManager.initGoogleAuth();
    authManager.renderAuthStatus();

    // Setup sign out button
    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
      signOutBtn.addEventListener('click', () => authManager.signOut());
    }

    // Log page load
    logAuditEvent('page_loaded', {
      url: window.location.href,
      referrer: document.referrer
    });

    // Show performance dashboard in console (dev mode only)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      setTimeout(() => performanceMonitor.displayDashboard(), 5000);
    }
  });

  // Log page unload
  window.addEventListener('beforeunload', () => {
    logAuditEvent('page_unloaded', {
      url: window.location.href,
      sessionDuration: performance.now()
    });
  });

  // Global error handler
  window.addEventListener('error', (event) => {
    logError('uncaught_error', event.error);
    console.error('Uncaught error:', event.error);
  });

  window.addEventListener('unhandledrejection', (event) => {
    logError('unhandled_promise_rejection', event.reason);
    console.error('Unhandled promise rejection:', event.reason);
  });

})();
