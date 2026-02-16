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
 * File: intrusion-detection.js
 * Declaration ID: IP-77D7C538-MLL28ZW5
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
 * Intrusion Detection System (IDS)
 * 
 * Reverse Trojan Horse Mechanism - Detects unauthorized access attempts
 * across all systems and platforms. Implements honeypots, access logging,
 * and real-time threat detection.
 * 
 * @author BarbrickDesign
 * @version 1.0.0
 * @license Proprietary - Barbrick Design
 */

(function(window) {
  'use strict';

  const IntrusionDetection = {
    version: '1.0.0',
    initialized: false,
    
    // Configuration
    config: {
      enabled: true,
      honeypotEnabled: true,
      realTimeMonitoring: true,
      autoBlock: true,
      logToConsole: false, // Set to false in production
      logToServer: true,
      maxFailedAttempts: 5,
      blockDurationMinutes: 60,
      trackFingerprints: true,
      anomalyDetection: true
    },

    // Storage keys
    storageKeys: {
      accessLog: 'ids_access_log',
      blockedIPs: 'ids_blocked_ips',
      suspiciousActivity: 'ids_suspicious_activity',
      fingerprints: 'ids_fingerprints',
      honeypotHits: 'ids_honeypot_hits'
    },

    // Honeypot endpoints (fake resources that shouldn't be accessed)
    // These act as "honey traps" to catch "dangerous bees" (malicious actors)
    honeypots: {
      files: [
        '/admin/config.json',
        '/api/admin/users',
        '/.env',
        '/config/database.yml',
        '/backup/db.sql',
        '/.git/config',
        '/wp-admin/',
        '/administrator/',
        '/admin.php',
        '/api/v1/admin',
        '/private/keys.json'
      ],
      endpoints: [
        'GET /admin/login',
        'POST /api/admin/auth',
        'GET /secret/data',
        'POST /admin/execute',
        'GET /.env'
      ],
      credentials: [
        { user: 'admin', pass: 'admin' },
        { user: 'root', pass: 'root' },
        { user: 'admin', pass: 'password' }
      ]
    },

    // Bee tracking (dangerous actors detected in honeypots)
    dangerousBees: [],

    // Threat patterns
    threatPatterns: {
      sqlInjection: [
        /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
        /(\b(select|union|insert|update|delete|drop|create|alter)\b)/i,
        /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i
      ],
      xss: [
        /(<script[^>]*>.*?<\/script>)/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe/gi
      ],
      pathTraversal: [
        /\.\.\//g,
        /\.\.\\/g,
        /%2e%2e%2f/gi,
        /%2e%2e%5c/gi
      ],
      commandInjection: [
        /[;&|`$()]/g,
        /(wget|curl|nc|bash|sh|cmd)/i
      ]
    },

    // Access log
    accessLog: [],
    suspiciousActivity: [],
    blockedIPs: new Set(),
    fingerprintCache: new Map(),

    /**
     * Initialize the Intrusion Detection System
     */
    async init() {
      if (this.initialized) {
        this.log('IDS already initialized', 'warn');
        return;
      }

      try {
        // Load existing data from storage
        this.loadFromStorage();

        // Set up event listeners
        this.setupEventListeners();

        // Deploy honeypots
        if (this.config.honeypotEnabled) {
          this.deployHoneypots();
        }

        // Start monitoring
        if (this.config.realTimeMonitoring) {
          this.startMonitoring();
        }

        // Generate device fingerprint
        if (this.config.trackFingerprints) {
          await this.generateFingerprint();
        }

        this.initialized = true;
        this.log('Intrusion Detection System initialized', 'success');

        // Log system start
        this.logAccess('system', 'IDS_INIT', { success: true });

      } catch (error) {
        this.log('Failed to initialize IDS: ' + error.message, 'error');
        console.error(error);
      }
    },

    /**
     * Set up event listeners for detecting suspicious activity
     */
    setupEventListeners() {
      // Monitor failed authentication attempts
      window.addEventListener('auth-failed', (e) => {
        this.handleAuthFailure(e.detail);
      });

      // Monitor suspicious form submissions
      document.addEventListener('submit', (e) => {
        this.analyzeFormSubmission(e);
      }, true);

      // Monitor navigation to restricted areas
      window.addEventListener('hashchange', (e) => {
        this.checkRestrictedAccess(e);
      });

      // Monitor console access (dev tools detection)
      this.detectDevTools();

      // Monitor XHR/Fetch requests
      this.interceptNetworkRequests();

      // Monitor localStorage/sessionStorage access
      this.monitorStorageAccess();
    },

    /**
     * Deploy honeypot mechanisms
     */
    deployHoneypots() {
      // Create hidden form fields (honeypots)
      this.createHoneypotFields();

      // Set up honeypot endpoints
      this.setupHoneypotEndpoints();

      // Create fake admin links (hidden)
      this.createHoneypotLinks();

      this.log('Honeypots deployed', 'info');
    },

    /**
     * Create honeypot form fields
     */
    createHoneypotFields() {
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        // Skip if honeypot already exists
        if (form.querySelector('[name="admin_access"]')) return;

        // Create hidden honeypot field
        const honeypot = document.createElement('input');
        honeypot.type = 'text';
        honeypot.name = 'admin_access';
        honeypot.style.display = 'none';
        honeypot.tabIndex = -1;
        honeypot.autocomplete = 'off';

        // If this field is filled, it's a bot
        honeypot.addEventListener('change', () => {
          this.reportThreat('honeypot_field_filled', {
            form: form.id || form.action,
            field: 'admin_access',
            value: honeypot.value
          });
        });

        form.appendChild(honeypot);
      });
    },

    /**
     * Set up honeypot API endpoints
     */
    setupHoneypotEndpoints() {
      // Intercept fetch calls to honeypot endpoints
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const url = args[0];
        
        // Check if URL matches honeypot
        if (this.isHoneypotEndpoint(url)) {
          this.reportThreat('honeypot_endpoint_accessed', {
            url: url,
            method: args[1]?.method || 'GET'
          });
          
          // Return fake response
          return new Response(JSON.stringify({ 
            error: 'Unauthorized',
            message: 'This endpoint does not exist'
          }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        return originalFetch.apply(this, args);
      };
    },

    /**
     * Create hidden honeypot links
     */
    createHoneypotLinks() {
      const container = document.createElement('div');
      container.style.display = 'none';
      container.setAttribute('aria-hidden', 'true');
      container.innerHTML = `
        <a href="/admin/login" id="admin-panel-link">Admin Panel</a>
        <a href="/api/admin/users" id="user-management">User Management</a>
        <a href="/.env" id="config-file">Configuration</a>
      `;

      // Monitor clicks on these links
      container.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
          e.preventDefault();
          this.reportThreat('honeypot_link_clicked', {
            href: e.target.href,
            linkId: e.target.id
          });
        }
      });

      document.body.appendChild(container);
    },

    /**
     * Check if URL is a honeypot endpoint
     */
    isHoneypotEndpoint(url) {
      if (typeof url !== 'string') return false;
      
      return this.honeypots.files.some(honeypot => 
        url.includes(honeypot)
      );
    },

    /**
     * Detect developer tools being opened
     */
    detectDevTools() {
      // Method 1: Check console.log performance
      let devtools = false;
      const element = new Image();
      Object.defineProperty(element, 'id', {
        get: () => {
          devtools = true;
          this.reportThreat('devtools_detected', {
            method: 'console.log'
          });
        }
      });

      // Method 2: Check window size (unreliable but useful)
      setInterval(() => {
        if (window.outerWidth - window.innerWidth > 200 ||
            window.outerHeight - window.innerHeight > 200) {
          if (!devtools) {
            this.reportThreat('devtools_possible', {
              method: 'window_size',
              outerSize: `${window.outerWidth}x${window.outerHeight}`,
              innerSize: `${window.innerWidth}x${window.innerHeight}`
            });
          }
        }
      }, 60000); // Check every minute
    },

    /**
     * Intercept network requests
     */
    interceptNetworkRequests() {
      // Monitor XMLHttpRequest
      const originalXHR = window.XMLHttpRequest.prototype.open;
      window.XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        IntrusionDetection.analyzeRequest(method, url);
        return originalXHR.apply(this, [method, url, ...rest]);
      };

      // Already monitoring fetch in setupHoneypotEndpoints
    },

    /**
     * Monitor storage access patterns
     */
    monitorStorageAccess() {
      // Monitor localStorage access
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function(key, value) {
        IntrusionDetection.analyzeStorageAccess('set', key, value);
        return originalSetItem.apply(this, arguments);
      };

      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = function(key) {
        IntrusionDetection.analyzeStorageAccess('get', key);
        return originalGetItem.apply(this, arguments);
      };
    },

    /**
     * Analyze network request for threats
     */
    analyzeRequest(method, url) {
      // Check for SQL injection in URL
      if (this.detectThreatPattern(url, 'sqlInjection')) {
        this.reportThreat('sql_injection_attempt', {
          method,
          url: url.substring(0, 100)
        });
      }

      // Check for XSS in URL
      if (this.detectThreatPattern(url, 'xss')) {
        this.reportThreat('xss_attempt', {
          method,
          url: url.substring(0, 100)
        });
      }

      // Check for path traversal
      if (this.detectThreatPattern(url, 'pathTraversal')) {
        this.reportThreat('path_traversal_attempt', {
          method,
          url: url.substring(0, 100)
        });
      }

      // Check for command injection
      if (this.detectThreatPattern(url, 'commandInjection')) {
        this.reportThreat('command_injection_attempt', {
          method,
          url: url.substring(0, 100)
        });
      }
    },

    /**
     * Analyze storage access for suspicious patterns
     */
    analyzeStorageAccess(action, key, value) {
      // Check for attempts to access sensitive keys
      const sensitiveKeys = [
        'admin', 'password', 'token', 'secret', 'api_key',
        'private_key', 'session', 'auth', 'credentials'
      ];

      const isSensitive = sensitiveKeys.some(sk => 
        key.toLowerCase().includes(sk)
      );

      if (isSensitive) {
        this.logAccess('storage', `${action}_${key}`, {
          key: key,
          sensitive: true
        });
      }
    },

    /**
     * Analyze form submission for threats
     */
    analyzeFormSubmission(event) {
      const form = event.target;
      const formData = new FormData(form);

      // Check honeypot fields
      const honeypotValue = formData.get('admin_access');
      if (honeypotValue) {
        event.preventDefault();
        this.reportThreat('bot_detected', {
          form: form.id || form.action,
          honeypotValue: honeypotValue
        });
        return;
      }

      // Check for injection attempts in form data
      for (const [key, value] of formData.entries()) {
        if (typeof value === 'string') {
          if (this.detectThreatPattern(value, 'sqlInjection')) {
            event.preventDefault();
            this.reportThreat('sql_injection_in_form', {
              field: key,
              form: form.id || form.action
            });
            return;
          }

          if (this.detectThreatPattern(value, 'xss')) {
            event.preventDefault();
            this.reportThreat('xss_in_form', {
              field: key,
              form: form.id || form.action
            });
            return;
          }
        }
      }
    },

    /**
     * Check restricted access attempts
     */
    checkRestrictedAccess(event) {
      const hash = window.location.hash;
      const restrictedHashes = ['#admin', '#config', '#debug', '#private'];

      if (restrictedHashes.some(r => hash.includes(r))) {
        this.reportThreat('restricted_area_access', {
          hash: hash,
          previousHash: event.oldURL?.split('#')[1] || ''
        });
      }
    },

    /**
     * Detect threat patterns in text
     */
    detectThreatPattern(text, patternType) {
      if (!text || typeof text !== 'string') return false;
      
      const patterns = this.threatPatterns[patternType];
      if (!patterns) return false;

      return patterns.some(pattern => pattern.test(text));
    },

    /**
     * Handle authentication failure
     */
    handleAuthFailure(details) {
      const fingerprint = this.getCurrentFingerprint();
      const key = fingerprint || details.ip || 'unknown';

      // Track failed attempts
      const attempts = this.suspiciousActivity.filter(a => 
        a.fingerprint === key && 
        a.type === 'auth_failed' &&
        Date.now() - a.timestamp < 3600000 // Last hour
      ).length;

      this.logAccess('auth', 'AUTH_FAILED', {
        username: details.username,
        attempts: attempts + 1
      });

      if (attempts >= this.config.maxFailedAttempts) {
        this.blockAccess(key, 'too_many_auth_failures');
      }
    },

    /**
     * Report a detected threat
     */
    reportThreat(threatType, details = {}) {
      const threat = {
        id: this.generateId(),
        type: threatType,
        timestamp: Date.now(),
        fingerprint: this.getCurrentFingerprint(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        details: details
      };

      this.suspiciousActivity.push(threat);
      
      // Check if this is a honeypot hit ("dangerous bee" detected)
      const isHoneypotThreat = threatType.includes('honeypot') || 
                               threatType.includes('bot_detected');
      
      if (isHoneypotThreat) {
        // Track as "dangerous African bee" (high-priority threat)
        const bee = {
          ...threat,
          threatLevel: 'critical',
          category: 'dangerous_bee',
          description: 'Dangerous actor detected in honeypot'
        };
        this.dangerousBees.push(bee);
        this.log(`🐝 DANGEROUS BEE DETECTED: ${threatType}`, 'error');
        
        // Save bee data
        this.saveBeeData();
      } else {
        this.log(`Threat detected: ${threatType}`, 'warn');
      }

      // Save to storage
      this.saveToStorage();

      // Send to server if configured
      if (this.config.logToServer) {
        this.sendThreatToServer(threat);
      }

      // Auto-block if configured
      if (this.config.autoBlock) {
        const fingerprint = this.getCurrentFingerprint();
        if (fingerprint) {
          // Block after 3 threats
          const recentThreats = this.suspiciousActivity.filter(a =>
            a.fingerprint === fingerprint &&
            Date.now() - a.timestamp < 3600000
          ).length;

          if (recentThreats >= 3) {
            this.blockAccess(fingerprint, 'multiple_threats');
          }
        }
      }

      // Dispatch custom event for monitoring dashboard
      window.dispatchEvent(new CustomEvent('ids-threat-detected', {
        detail: threat
      }));
      
      // Dispatch bee alert if honeypot hit
      if (isHoneypotThreat) {
        window.dispatchEvent(new CustomEvent('ids-dangerous-bee-detected', {
          detail: threat
        }));
      }
    },

    /**
     * Block access for a fingerprint/IP
     */
    blockAccess(identifier, reason) {
      const block = {
        identifier: identifier,
        reason: reason,
        timestamp: Date.now(),
        expiresAt: Date.now() + (this.config.blockDurationMinutes * 60000)
      };

      this.blockedIPs.add(JSON.stringify(block));
      this.log(`Access blocked: ${identifier} - ${reason}`, 'warn');

      this.saveToStorage();

      // Dispatch event
      window.dispatchEvent(new CustomEvent('ids-access-blocked', {
        detail: block
      }));

      // Reload page to enforce block
      setTimeout(() => {
        alert('Suspicious activity detected. Access has been restricted.');
        window.location.href = '/';
      }, 1000);
    },

    /**
     * Check if current access is blocked
     */
    isBlocked() {
      const fingerprint = this.getCurrentFingerprint();
      if (!fingerprint) return false;

      const now = Date.now();
      
      for (const blockStr of this.blockedIPs) {
        const block = JSON.parse(blockStr);
        
        // Remove expired blocks
        if (block.expiresAt < now) {
          this.blockedIPs.delete(blockStr);
          continue;
        }

        if (block.identifier === fingerprint) {
          return block;
        }
      }

      return false;
    },

    /**
     * Log access attempt
     */
    logAccess(category, action, details = {}) {
      const log = {
        id: this.generateId(),
        category: category,
        action: action,
        timestamp: Date.now(),
        fingerprint: this.getCurrentFingerprint(),
        url: window.location.href,
        details: details
      };

      this.accessLog.push(log);

      // Keep only last 1000 entries
      if (this.accessLog.length > 1000) {
        this.accessLog = this.accessLog.slice(-1000);
      }

      if (this.config.logToConsole) {
        console.log('[IDS]', category, action, details);
      }

      // Save periodically
      if (this.accessLog.length % 10 === 0) {
        this.saveToStorage();
      }
    },

    /**
     * Generate device fingerprint
     */
    async generateFingerprint() {
      try {
        const components = [
          navigator.userAgent,
          navigator.language,
          screen.width + 'x' + screen.height,
          screen.colorDepth,
          new Date().getTimezoneOffset(),
          !!window.sessionStorage,
          !!window.localStorage,
          navigator.plugins.length,
          navigator.platform
        ];

        // Add canvas fingerprint
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('fingerprint', 2, 2);
        components.push(canvas.toDataURL());

        const fingerprint = await this.hashString(components.join('|'));
        this.currentFingerprint = fingerprint;
        
        return fingerprint;
      } catch (error) {
        this.log('Failed to generate fingerprint: ' + error.message, 'error');
        return null;
      }
    },

    /**
     * Get current fingerprint
     */
    getCurrentFingerprint() {
      return this.currentFingerprint || null;
    },

    /**
     * Hash string using SHA-256
     */
    async hashString(str) {
      if (!window.crypto || !window.crypto.subtle) {
        // Fallback to simple hash
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        return hash.toString(16);
      }

      const encoder = new TextEncoder();
      const data = encoder.encode(str);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    /**
     * Start real-time monitoring
     */
    startMonitoring() {
      // Check for blocked access
      const block = this.isBlocked();
      if (block) {
        alert('Your access has been restricted due to suspicious activity.');
        window.location.href = '/';
        return;
      }

      // Monitor system resources
      this.monitoringInterval = setInterval(() => {
        // Collect metrics
        const metrics = {
          accessLogs: this.accessLog.length,
          threats: this.suspiciousActivity.length,
          blocked: this.blockedIPs.size,
          timestamp: Date.now()
        };

        // Dispatch event for dashboard
        window.dispatchEvent(new CustomEvent('ids-metrics', {
          detail: metrics
        }));

      }, 30000); // Every 30 seconds
    },

    /**
     * Send threat to server
     */
    async sendThreatToServer(threat) {
      try {
        // In production, send to actual security endpoint
        const endpoint = '/api/security/threat';
        
        await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(threat)
        }).catch(() => {
          // Fail silently - server might not exist
        });
      } catch (error) {
        // Fail silently
      }
    },

    /**
     * Load data from storage
     */
    loadFromStorage() {
      try {
        const accessLog = localStorage.getItem(this.storageKeys.accessLog);
        if (accessLog) {
          this.accessLog = JSON.parse(accessLog);
        }

        const suspicious = localStorage.getItem(this.storageKeys.suspiciousActivity);
        if (suspicious) {
          this.suspiciousActivity = JSON.parse(suspicious);
        }

        const blocked = localStorage.getItem(this.storageKeys.blockedIPs);
        if (blocked) {
          this.blockedIPs = new Set(JSON.parse(blocked));
        }

        // Load bee data
        this.loadBeeData();
      } catch (error) {
        this.log('Failed to load from storage: ' + error.message, 'error');
      }
    },

    /**
     * Save data to storage
     */
    saveToStorage() {
      try {
        localStorage.setItem(
          this.storageKeys.accessLog,
          JSON.stringify(this.accessLog.slice(-1000))
        );

        localStorage.setItem(
          this.storageKeys.suspiciousActivity,
          JSON.stringify(this.suspiciousActivity.slice(-500))
        );

        localStorage.setItem(
          this.storageKeys.blockedIPs,
          JSON.stringify(Array.from(this.blockedIPs))
        );
      } catch (error) {
        // Fail silently if storage is full
      }
    },

    /**
     * Save dangerous bee data
     */
    saveBeeData() {
      try {
        localStorage.setItem(
          'ids_dangerous_bees',
          JSON.stringify(this.dangerousBees.slice(-100))
        );
      } catch (error) {
        // Fail silently if storage is full
      }
    },

    /**
     * Load dangerous bee data
     */
    loadBeeData() {
      try {
        const bees = localStorage.getItem('ids_dangerous_bees');
        if (bees) {
          this.dangerousBees = JSON.parse(bees);
        }
      } catch (error) {
        this.log('Failed to load bee data: ' + error.message, 'error');
      }
    },

    /**
     * Generate unique ID
     */
    generateId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Log message
     */
    log(message, level = 'info') {
      const prefix = '[IDS]';
      const styles = {
        info: 'color: #0066cc',
        success: 'color: #00cc00',
        warn: 'color: #ff9900',
        error: 'color: #cc0000'
      };

      if (this.config.logToConsole) {
        console.log(`%c${prefix} ${message}`, styles[level] || styles.info);
      }
    },

    /**
     * Get security report
     */
    getSecurityReport() {
      const now = Date.now();
      const last24h = now - (24 * 60 * 60 * 1000);

      const recentThreats = this.suspiciousActivity.filter(t => 
        t.timestamp > last24h
      );

      const threatsByType = {};
      recentThreats.forEach(t => {
        threatsByType[t.type] = (threatsByType[t.type] || 0) + 1;
      });

      // Count dangerous bees in last 24h
      const recentBees = this.dangerousBees.filter(b => 
        b.timestamp > last24h
      );

      return {
        enabled: this.config.enabled,
        honeypots: this.config.honeypotEnabled,
        monitoring: this.config.realTimeMonitoring,
        honeypotStatus: {
          active: this.config.honeypotEnabled,
          dangerousBeesDetected: this.dangerousBees.length,
          recentBees24h: recentBees.length,
          honeypotHits: this.suspiciousActivity.filter(t => 
            t.type.includes('honeypot') || t.type.includes('bot_detected')
          ).length
        },
        statistics: {
          totalAccessLogs: this.accessLog.length,
          totalThreats: this.suspiciousActivity.length,
          recentThreats: recentThreats.length,
          threatsByType: threatsByType,
          blockedIPs: this.blockedIPs.size,
          currentFingerprint: this.currentFingerprint
        },
        recentActivity: this.suspiciousActivity.slice(-10),
        blockedAccess: Array.from(this.blockedIPs).map(b => JSON.parse(b)),
        dangerousBees: recentBees.slice(-10)
      };
    },

    /**
     * Get honeypot status report
     */
    getHoneypotStatus() {
      const now = Date.now();
      const last24h = now - (24 * 60 * 60 * 1000);
      
      const recentBees = this.dangerousBees.filter(b => 
        b.timestamp > last24h
      );

      return {
        status: this.config.honeypotEnabled ? 'ACTIVE' : 'INACTIVE',
        online: this.initialized,
        honeypots: {
          files: this.honeypots.files.length,
          endpoints: this.honeypots.endpoints.length,
          credentials: this.honeypots.credentials.length,
          total: this.honeypots.files.length + 
                 this.honeypots.endpoints.length + 
                 this.honeypots.credentials.length
        },
        dangerousBees: {
          total: this.dangerousBees.length,
          last24h: recentBees.length,
          critical: recentBees.filter(b => b.threatLevel === 'critical').length,
          recent: recentBees.slice(-5).map(b => ({
            id: b.id,
            type: b.type,
            timestamp: new Date(b.timestamp).toISOString(),
            fingerprint: b.fingerprint,
            description: b.description
          }))
        },
        message: recentBees.length > 0 
          ? `⚠️ ${recentBees.length} dangerous bee(s) detected in last 24 hours!`
          : '✅ No dangerous bees detected. All honeypots secure.'
      };
    },

    /**
     * Clean up and stop monitoring
     */
    cleanup() {
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
      }
      this.saveToStorage();
    }
  };

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      IntrusionDetection.init();
    });
  } else {
    IntrusionDetection.init();
  }

  // Cleanup on unload
  window.addEventListener('beforeunload', () => {
    IntrusionDetection.cleanup();
  });

  // Global access
  window.IntrusionDetection = IntrusionDetection;

  // Export for modules
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = IntrusionDetection;
  }

})(typeof window !== 'undefined' ? window : {});
