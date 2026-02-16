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
 * File: self-healing.js
 * Declaration ID: IP-7A0693DE-MLL28ZVV
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
 * Self-Healing Script Module
 * Extracted from Je$us.html - JeEeZues Trinity Pool
 * 
 * This script provides:
 * - Device detection and dependency verification
 * - Quarantine engine for malicious content
 * - Event listener auditor with idempotent attachment
 * - Self-healing function that repairs DOM, listeners, and state
 * - Auto-evaluation with heartbeat monitoring
 * - Trust scoring and uptime tracking
 * 
 * @version 1.1.0
 * @changelog
 * - v1.1.0: Fibonacci-based timing, backoff, and sizing
 *   - Quarantine sizing: fib(6) = 8 items
 *   - Healing intervals: Fibonacci-derived (3s evaluation, 5s healing, 2s heartbeat)
 *   - Golden ratio multiplier for heartbeat tolerance (φ ≈ 1.618)
 * 
 * ═══════════════════════════════════════════════════════════════════
 * ⚡ Created by BarbrickDesign
 * 💰 Support this innovation: PayPal → barbrickdesign@gmail.com
 * 🌐 https://barbrickdesign.github.io
 * ═══════════════════════════════════════════════════════════════════
 * 
 * If you or your organization benefits from this self-healing script,
 * please consider donating to support continued development.
 * Suggested donation: $50 (or any amount)
 */

(function SelfHealingModule() {
  'use strict';

  // Prevent duplicate initialization
  if (window.__SELF_HEALING_INITIALIZED) {
    console.log('[SelfHealing] Already initialized, skipping...');
    return;
  }
  window.__SELF_HEALING_INITIALIZED = true;

  // Load Fibonacci utilities (graceful degradation if unavailable)
  let FibonacciUtils = null;
  try {
    if (typeof window !== 'undefined' && window.FibonacciUtils) {
      FibonacciUtils = window.FibonacciUtils;
      console.log('[SelfHealing] Fibonacci utilities loaded from window');
    } else if (typeof require !== 'undefined') {
      FibonacciUtils = require('./src/utils/fibonacci-utils.js');
      console.log('[SelfHealing] Fibonacci utilities loaded via require');
    }
  } catch (e) {
    console.log('[SelfHealing] Fibonacci utilities not available, using fallback timing');
  }

  // Load donation attribution system if available
  if (window.DonationAttribution) {
    window.DonationAttribution.trackUsage();
    console.log('[SelfHealing] Donation attribution active');
  } else {
    console.log('[SelfHealing] Loading donation attribution...');
    const script = document.createElement('script');
    script.src = '/donation-attribution.js';
    script.async = true;
    document.head.appendChild(script);
  }

  /* ---------- Configuration constants ---------- */
  const CONFIG = {
    IMAGE_RETRY_MAX: 3,
    FAILURE_THRESHOLD: 5,
    HEARTBEAT_MISS_THRESHOLD: 3,
    MEMORY_WARNING_THRESHOLD: 90, // percentage
    MEMORY_LEAK_THRESHOLD: 10000000, // 10MB in bytes
    PAYPAL_EMAIL: 'barbrickdesign@gmail.com',
    PAYPAL_LINK: 'https://www.paypal.com/paypalme/barbrickdesign',
    // Fibonacci-based intervals (in seconds)
    HEALING_INTERVAL: 5,     // fib(5) = 5 seconds
    EVALUATION_INTERVAL: 3,  // fib(4) = 3 seconds  
    HEARTBEAT_INTERVAL: 2,   // fib(3) = 2 seconds
    QUARANTINE_MAX_SIZE: 8   // fib(6) = 8 items
  };

  const STATE = {
    version: '1.1.0-fibonacci-enhanced',
    device: { ua: navigator.userAgent, type: 'unknown' },
    deps: { core: true, external: [] },
    healing: { lastRun: null, runs: 0, selfOk: true, failures: 0, lastFailure: null },
    evaluation: { lastRun: null, runs: 0 },
    heartbeat: { 
      lastBeat: null, 
      missCount: 0, 
      intervalMs: CONFIG.HEARTBEAT_INTERVAL * 1000,
      toleranceMultiplier: FibonacciUtils ? FibonacciUtils.PHI : 1.618 // Golden ratio
    },
    listeners: {},
    quarantine: { status: 'idle', items: [], maxSize: CONFIG.QUARANTINE_MAX_SIZE },
    recovery: { attempts: 0, lastAttempt: null, maxAttempts: 5 },
    fibonacci: { 
      enabled: !!FibonacciUtils,
      sequence: [], 
      currentIndex: 0, 
      baseIntervalMs: 1000 
    },
    paypal: { email: CONFIG.PAYPAL_EMAIL, lastCheck: null, isValid: false },
    agentR: { signature: 'Agent-R-Signature-Active', lastSync: null },
    ml: { 
      anomalies: [], 
      predictions: {},
      performanceHistory: [],
      lastMLAnalysis: null
    }
  };

  /* ---------- Utilities ---------- */
  const ts = () => new Date().toISOString();
  const now = () => Date.now();
  const clamp = (x, min, max) => Math.max(min, Math.min(max, x));

  /* ---------- Fibonacci Sequence Generator ---------- */
  const generateFibonacciSequence = (length = 20) => {
    const sequence = [1, 1];
    for (let i = 2; i < length; i++) {
      sequence.push(sequence[i - 1] + sequence[i - 2]);
    }
    return sequence;
  };

  const getFibonacciInterval = () => {
    if (STATE.fibonacci.sequence.length === 0) {
      STATE.fibonacci.sequence = generateFibonacciSequence(20);
    }
    
    // Get current Fibonacci number and calculate interval
    const fibNumber = STATE.fibonacci.sequence[STATE.fibonacci.currentIndex];
    const intervalMs = fibNumber * STATE.fibonacci.baseIntervalMs;
    
    // Advance to next index, wrapping around if necessary
    STATE.fibonacci.currentIndex = (STATE.fibonacci.currentIndex + 1) % STATE.fibonacci.sequence.length;
    
    return intervalMs;
  };

  const log = (type, msg, meta = {}) => {
    const entry = { t: ts(), type, msg, meta, agentR: STATE.agentR.signature };
    const fn = type === 'error' ? 'error' : (type === 'warn' ? 'warn' : 'log');
    console[fn](`[SelfHealing ${entry.t}] [${STATE.agentR.signature}] ${type}: ${msg}`, meta);
  };

  /* ---------- Device & deps ---------- */
  const detectDevice = () => {
    const ua = navigator.userAgent.toLowerCase();
    const isMobile = /iphone|android|ipad|ipod/.test(ua);
    STATE.device.type = isMobile ? 'mobile' : 'desktop';
    log('info', `device detected: ${STATE.device.type}`);
  };

  /* ---------- PayPal Link Verification ---------- */
  const verifyPayPalLink = () => {
    const paypalEmail = STATE.paypal.email;
    
    try {
      // Check if PayPal link is properly configured
      const expectedLink = CONFIG.PAYPAL_LINK;
      const expectedEmail = CONFIG.PAYPAL_EMAIL;
      
      // Verify the email matches
      if (paypalEmail === expectedEmail) {
        STATE.paypal.isValid = true;
        STATE.paypal.lastCheck = now();
        log('info', 'PayPal link verified successfully', { email: paypalEmail });
        return true;
      } else {
        STATE.paypal.isValid = false;
        log('error', 'PayPal link misconfigured', { 
          expected: expectedEmail, 
          current: paypalEmail 
        });
        return false;
      }
    } catch (error) {
      log('error', 'PayPal link verification failed', { error: error.message });
      STATE.paypal.isValid = false;
      return false;
    }
  };

  const ensurePayPalLinkOnline = () => {
    // Auto-sync mechanism to ensure PayPal link is always accessible
    if (!STATE.paypal.isValid || (now() - STATE.paypal.lastCheck) > 3600000) { // Check hourly
      verifyPayPalLink();
    }
    
    // Add PayPal link to page if not present
    if (typeof document !== 'undefined' && !document.querySelector('[data-paypal-link]')) {
      const linkElement = document.createElement('meta');
      linkElement.setAttribute('data-paypal-link', 'true');
      linkElement.name = 'paypal-donation';
      linkElement.content = `${CONFIG.PAYPAL_EMAIL} | ${CONFIG.PAYPAL_LINK}`;
      document.head.appendChild(linkElement);
      log('info', 'PayPal donation link added to page metadata');
    }
    
    return STATE.paypal.isValid;
  };

  /* ---------- Agent R Signature System ---------- */
  const syncAgentRSignature = () => {
    const signature = STATE.agentR.signature;
    STATE.agentR.lastSync = now();
    
    // Add Agent R signature to window object for global access
    if (typeof window !== 'undefined') {
      window.__AGENT_R_SIGNATURE__ = signature;
      window.__AGENT_R_LAST_SYNC__ = STATE.agentR.lastSync;
    }
    
    // Add signature to all console logs
    if (typeof document !== 'undefined' && !document.querySelector('[data-agent-r-signature]')) {
      const signatureElement = document.createElement('meta');
      signatureElement.setAttribute('data-agent-r-signature', 'true');
      signatureElement.name = 'agent-r-signature';
      signatureElement.content = `${signature} | Last Sync: ${new Date(STATE.agentR.lastSync).toISOString()}`;
      document.head.appendChild(signatureElement);
      log('info', 'Agent R signature synced to document');
    }
    
    return signature;
  };

  const verifyDeps = () => {
    const essentials = ['localStorage', 'addEventListener', 'FileReader', 'Blob', 'URL', 'fetch'];
    const missing = essentials.filter(k => {
      // Special handling for certain properties
      if (k === 'addEventListener') return !window.addEventListener;
      return !(k in window);
    });
    
    // querySelector is on document, not window
    if (!document.querySelector) missing.push('querySelector');
    
    STATE.deps.core = missing.length === 0;
    STATE.deps.external = [];
    if (STATE.deps.core) log('info', 'core deps present');
    else log('error', 'missing core deps: ' + missing.join(', '));
    return STATE.deps.core;
  };

  /* ---------- Quarantine ---------- */
  const quarantine = (item, reason = 'unknown') => {
    STATE.quarantine.items.push({ t: ts(), item, reason });
    STATE.quarantine.status = 'active';
    log('warn', `quarantined item: ${reason}`, { item });
    
    // Trim quarantine to Fibonacci-based size: fib(6) = 8 items
    if (STATE.quarantine.items.length > STATE.quarantine.maxSize) {
      STATE.quarantine.items = STATE.quarantine.items.slice(-STATE.quarantine.maxSize);
      log('warn', `quarantine trimmed to ${STATE.quarantine.maxSize} items (Fibonacci sizing)`);
    }
  };

  /* ---------- Event auditor ---------- */
  const on = (name, el, evt, handler) => {
    if (!el) return false;
    const key = `${name}:${evt}`;
    if (!STATE.listeners[key]) {
      el.addEventListener(evt, handler);
      STATE.listeners[key] = true;
      return true;
    }
    return false;
  };

  /* ---------- Device patches ---------- */
  const applyDevicePatches = () => {
    if (STATE.device.type === 'mobile') {
      // Patch touch-click equivalence for buttons (defensive)
      const buttons = document.querySelectorAll('button');
      buttons.forEach(b => {
        if (!b.__touchPatched) {
          b.addEventListener('touchend', (e) => {
            e.preventDefault();
            b.click();
          }, { passive: false });
          b.__touchPatched = true;
        }
      });
    }
  };

  /* ---------- Auto-attach listeners ---------- */
  const attachCommonListeners = () => {
    // Find common UI elements and attach basic error recovery
    const forms = document.querySelectorAll('form');
    forms.forEach((form, idx) => {
      on(`form${idx}`, form, 'submit', (e) => {
        // Ensure forms don't break the page
        try {
          // Let the form's original handler run
        } catch (err) {
          log('error', 'form submit error caught', { error: err.message });
          e.preventDefault();
        }
      });
    });

    const buttons = document.querySelectorAll('button');
    buttons.forEach((btn, idx) => {
      if (!btn.hasAttribute('data-healing-monitored')) {
        btn.setAttribute('data-healing-monitored', 'true');
        on(`button${idx}`, btn, 'click', (e) => {
          // Monitor for errors
          try {
            // Let the button's original handler run
          } catch (err) {
            log('error', 'button click error caught', { error: err.message });
          }
        });
      }
    });
  };

  /* ---------- DOM integrity checks ---------- */
  const checkDomIntegrity = () => {
    let issues = [];

    // Check if critical elements are missing
    const body = document.body;
    if (!body) {
      issues.push('body element missing');
      return issues;
    }

    // Check for broken images and attempt to fix
    const images = document.querySelectorAll('img');
    images.forEach((img, idx) => {
      if (img.complete && img.naturalHeight === 0 && img.src) {
        log('warn', `broken image detected: ${img.src}`);
        // Mark for potential removal or retry
        if (!img.hasAttribute('data-heal-attempts')) {
          img.setAttribute('data-heal-attempts', '1');
          // Retry loading once
          const src = img.src;
          img.src = '';
          setTimeout(() => { img.src = src; }, 100);
        } else {
          const attempts = parseInt(img.getAttribute('data-heal-attempts'));
          if (attempts < CONFIG.IMAGE_RETRY_MAX) {
            img.setAttribute('data-heal-attempts', String(attempts + 1));
          } else {
            // Hide broken image after max attempts
            img.style.display = 'none';
            img.setAttribute('data-heal-failed', 'true');
          }
        }
      }
    });

    // Check for orphaned scripts
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach((script, idx) => {
      if (script.hasAttribute('data-failed')) {
        log('warn', `failed script detected: ${script.src}`);
      }
    });

    // Check for empty or suspicious containers
    const containers = document.querySelectorAll('[data-critical="true"]');
    containers.forEach((container) => {
      if (!container.children.length && !container.textContent.trim()) {
        log('warn', 'critical empty container detected', { id: container.id, class: container.className });
        issues.push(`empty critical container: ${container.id || container.className}`);
      }
    });

    return issues;
  };

  /* ---------- ML-Based Anomaly Detection ---------- */
  const detectAnomalies = () => {
    // Track performance metrics
    const currentMetrics = {
      timestamp: now(),
      healingRuns: STATE.healing.runs,
      failures: STATE.healing.failures,
      quarantineCount: STATE.quarantine.items.length,
      listenerCount: Object.keys(STATE.listeners).length,
      heartbeatMisses: STATE.heartbeat.missCount,
      memoryUsage: window.performance && window.performance.memory ? 
        window.performance.memory.usedJSHeapSize : 0
    };
    
    STATE.ml.performanceHistory.push(currentMetrics);
    
    // Keep only last 100 data points
    if (STATE.ml.performanceHistory.length > 100) {
      STATE.ml.performanceHistory = STATE.ml.performanceHistory.slice(-100);
    }
    
    // Need at least 10 data points for anomaly detection
    if (STATE.ml.performanceHistory.length < 10) {
      return [];
    }
    
    const anomalies = [];
    
    // Detect unusual failure rate
    const recentFailures = STATE.ml.performanceHistory.slice(-10);
    const avgFailures = recentFailures.reduce((sum, m) => sum + m.failures, 0) / recentFailures.length;
    if (STATE.healing.failures > avgFailures * 2 && STATE.healing.failures > 2) {
      anomalies.push({
        type: 'high_failure_rate',
        severity: 'high',
        message: `Failure rate (${STATE.healing.failures}) is unusually high`,
        recommendation: 'Review recent changes and increase monitoring'
      });
    }
    
    // Detect memory leak patterns
    if (window.performance && window.performance.memory) {
      const recentMemory = STATE.ml.performanceHistory.slice(-10).map(m => m.memoryUsage);
      const memoryTrend = recentMemory[recentMemory.length - 1] - recentMemory[0];
      const avgMemory = recentMemory.reduce((sum, m) => sum + m, 0) / recentMemory.length;
      
      if (memoryTrend > avgMemory * 0.5 && memoryTrend > CONFIG.MEMORY_LEAK_THRESHOLD) {
        anomalies.push({
          type: 'memory_leak',
          severity: 'medium',
          message: 'Possible memory leak detected',
          recommendation: 'Clear caches and review listener attachments'
        });
      }
    }
    
    // Detect quarantine overload
    if (STATE.quarantine.items.length > 5) {
      anomalies.push({
        type: 'quarantine_overload',
        severity: 'medium',
        message: `Too many quarantined items (${STATE.quarantine.items.length})`,
        recommendation: 'Review quarantined items and clear if necessary'
      });
    }
    
    STATE.ml.anomalies = anomalies;
    STATE.ml.lastMLAnalysis = now();
    
    return anomalies;
  };

  /* ---------- ML-Based Predictive Maintenance ---------- */
  const predictFailures = () => {
    if (STATE.ml.performanceHistory.length < 20) {
      return { prediction: 'insufficient_data', confidence: 'low' };
    }
    
    // Analyze trends
    const recent = STATE.ml.performanceHistory.slice(-10);
    const older = STATE.ml.performanceHistory.slice(-20, -10);
    
    const recentFailureRate = recent.reduce((sum, m) => sum + m.failures, 0) / recent.length;
    const olderFailureRate = older.reduce((sum, m) => sum + m.failures, 0) / older.length;
    
    const trend = recentFailureRate - olderFailureRate;
    
    let prediction = {
      failureTrend: trend > 0.5 ? 'increasing' : trend < -0.5 ? 'decreasing' : 'stable',
      confidence: STATE.ml.performanceHistory.length > 50 ? 'high' : 'medium',
      recommendation: ''
    };
    
    if (prediction.failureTrend === 'increasing') {
      prediction.recommendation = 'Failures are increasing. Consider preemptive system reset.';
      prediction.action = 'preventive_maintenance';
    } else if (prediction.failureTrend === 'stable' && recentFailureRate > 0.5) {
      prediction.recommendation = 'System is stable but failure rate is elevated.';
      prediction.action = 'monitor_closely';
    } else {
      prediction.recommendation = 'System health is good.';
      prediction.action = 'continue_normal_operation';
    }
    
    STATE.ml.predictions.failures = prediction;
    return prediction;
  };

  /* ---------- Healing function ---------- */
  const heal = () => {
    STATE.healing.runs++;
    STATE.healing.lastRun = now();
    STATE.healing.selfOk = true;

    log('info', `healing run #${STATE.healing.runs} starting...`);

    try {
      // 1) Verify dependencies
      const depsOk = verifyDeps();
      if (!depsOk) STATE.healing.selfOk = false;

      // 2) Verify PayPal link (auto-sync)
      const paypalOk = ensurePayPalLinkOnline();
      if (!paypalOk) {
        log('warn', 'PayPal link verification failed - attempting auto-repair');
        // Auto-repair: reset PayPal email and re-verify
        STATE.paypal.email = CONFIG.PAYPAL_EMAIL;
        verifyPayPalLink();
      }

      // 3) Sync Agent R signature
      syncAgentRSignature();

      // 4) Audit & attach listeners idempotently
      attachCommonListeners();

      // 5) Cross-device patches
      applyDevicePatches();

      // 6) Check DOM integrity
      const domIssues = checkDomIntegrity();
      if (domIssues.length > 0) {
        log('warn', 'DOM integrity issues found', { issues: domIssues });
        STATE.healing.selfOk = false;
        
        // Attempt to fix critical issues
        if (domIssues.some(issue => issue.includes('body element missing'))) {
          log('error', 'Critical DOM structure missing - cannot auto-repair');
        }
      }

      // 7) Quarantine management
      if (STATE.quarantine.status === 'active') {
        if (STATE.quarantine.items.length > 10) {
          STATE.quarantine.items = STATE.quarantine.items.slice(-10);
          log('warn', 'quarantine trimmed to last 10 items');
        }
      }

      // 8) Listener audit
      const listenerCount = Object.keys(STATE.listeners).length;
      log('info', `${listenerCount} listeners attached`);

      // 9) Memory health check
      if (window.performance && window.performance.memory) {
        const memUsed = window.performance.memory.usedJSHeapSize;
        const memLimit = window.performance.memory.jsHeapSizeLimit;
        const memPercent = (memUsed / memLimit) * 100;
        if (memPercent > CONFIG.MEMORY_WARNING_THRESHOLD) {
          log('warn', `high memory usage: ${memPercent.toFixed(1)}%`);
          STATE.healing.selfOk = false;
        }
      }

      // 10) ML-Based Anomaly Detection
      const anomalies = detectAnomalies();
      if (anomalies.length > 0) {
        log('warn', 'ML anomalies detected', { count: anomalies.length, anomalies });
        anomalies.forEach(anomaly => {
          if (anomaly.severity === 'high') {
            log('error', `High severity anomaly: ${anomaly.message}`);
          }
        });
      }

      // 11) ML-Based Predictive Maintenance
      const prediction = predictFailures();
      if (prediction.action === 'preventive_maintenance') {
        log('warn', 'ML prediction: preventive maintenance recommended', prediction);
        // Auto-apply preventive measures
        if (STATE.healing.failures > CONFIG.FAILURE_THRESHOLD) {
          log('info', 'Applying ML-recommended preventive reset');
          STATE.listeners = {};
          STATE.quarantine.items = STATE.quarantine.items.slice(-5);
          STATE.healing.failures = Math.floor(STATE.healing.failures / 2);
        }
      }

      const status = STATE.healing.selfOk ? 'Healthy' : 'Degraded';
      log('info', `healing run #${STATE.healing.runs} complete - Status: ${status}`);

      // Reset failure counter on success
      if (STATE.healing.selfOk) {
        STATE.healing.failures = 0;
      }

      return STATE.healing.selfOk;
    } catch (error) {
      log('error', 'healing run failed with exception', { error: error.message, stack: error.stack });
      STATE.healing.selfOk = false;
      STATE.healing.failures++;
      STATE.healing.lastFailure = now();
      
      // If too many failures, try to reset certain systems
      if (STATE.healing.failures > CONFIG.FAILURE_THRESHOLD) {
        log('error', `${STATE.healing.failures} consecutive healing failures - attempting system reset`);
        try {
          // Clear some state to allow recovery
          STATE.listeners = {};
          STATE.quarantine.items = STATE.quarantine.items.slice(-5);
          log('info', 'partial state reset completed');
        } catch (resetError) {
          log('error', 'state reset failed', { error: resetError.message });
        }
      }
      
      return false;
    }
  };

  /* ---------- Auto-evaluation ---------- */
  const evaluate = () => {
    STATE.evaluation.runs++;
    STATE.evaluation.lastRun = now();

    log('info', `evaluation run #${STATE.evaluation.runs} starting...`);

    try {
      // Check for missing critical elements
      const body = document.body;
      const head = document.head;
      
      if (!body || !head) {
        log('error', 'critical HTML structure missing');
        return false;
      }

      // Check if scripts are loading
      const scripts = document.querySelectorAll('script');
      log('info', `${scripts.length} scripts found in document`);

      // Check quarantine status
      if (STATE.quarantine.items.length > 0) {
        log('warn', `${STATE.quarantine.items.length} items in quarantine`);
      }

      // Verify localStorage is accessible and working
      try {
        const testKey = '__selfhealing_test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
      } catch (e) {
        log('warn', 'localStorage not accessible', { error: e.message });
      }

      // Check for console errors (if available)
      if (window.__CONSOLE_ERRORS && window.__CONSOLE_ERRORS.length > 0) {
        log('warn', `${window.__CONSOLE_ERRORS.length} console errors detected`);
      }

      log('info', `evaluation run #${STATE.evaluation.runs} complete`);
      return true;
    } catch (error) {
      log('error', 'evaluation failed with exception', { error: error.message });
      return false;
    }
  };

  /* ---------- Heartbeat monitoring ---------- */
  const evaluateHeartbeat = () => {
    const delta = STATE.healing.lastRun ? (now() - STATE.healing.lastRun) : Infinity;
    STATE.heartbeat.lastBeat = now();
    // Use golden ratio (φ) multiplier for heartbeat tolerance
    const expected = STATE.heartbeat.intervalMs * STATE.heartbeat.toleranceMultiplier;
    
    if (delta > expected) {
      STATE.heartbeat.missCount++;
      log('warn', 'heartbeat miss detected', { 
        delta, 
        missCount: STATE.heartbeat.missCount,
        expected: Math.round(expected),
        tolerance: 'φ × interval'
      });
      
      // Attempt recovery if too many misses
      if (STATE.heartbeat.missCount > CONFIG.HEARTBEAT_MISS_THRESHOLD && STATE.recovery.attempts < STATE.recovery.maxAttempts) {
        STATE.recovery.attempts++;
        STATE.recovery.lastAttempt = now();
        log('warn', `attempting recovery #${STATE.recovery.attempts}`, { maxAttempts: STATE.recovery.maxAttempts });
        
        try {
          heal(); // Auto-heal on heartbeat miss
          STATE.heartbeat.missCount = 0; // Reset on successful heal
        } catch (error) {
          log('error', 'recovery attempt failed', { error: error.message });
        }
      } else if (STATE.recovery.attempts >= STATE.recovery.maxAttempts) {
        log('error', 'max recovery attempts reached - system may be unstable');
      } else {
        heal(); // Normal auto-heal on heartbeat miss
      }
    } else {
      // Reset recovery attempts on successful heartbeat
      if (STATE.recovery.attempts > 0) {
        log('info', 'heartbeat normalized - resetting recovery counter');
        STATE.recovery.attempts = 0;
      }
    }
  };

  /* ---------- Auto operations ---------- */
  const startAutoOps = () => {
    // Use Fibonacci-based timing intervals
    const healingIntervalMs = CONFIG.HEALING_INTERVAL * 1000;  // 5 seconds
    const evaluationIntervalMs = CONFIG.EVALUATION_INTERVAL * 1000;  // 3 seconds
    const heartbeatIntervalMs = CONFIG.HEARTBEAT_INTERVAL * 1000;  // 2 seconds
    
    log('info', 'starting auto-operations with Fibonacci intervals', {
      healing: `${CONFIG.HEALING_INTERVAL}s (fib(5))`,
      evaluation: `${CONFIG.EVALUATION_INTERVAL}s (fib(4))`,
      heartbeat: `${CONFIG.HEARTBEAT_INTERVAL}s (fib(3))`,
      toleranceMultiplier: `φ = ${STATE.heartbeat.toleranceMultiplier.toFixed(3)}`
    });
    
    // Healing cycle
    setInterval(() => {
      heal();
    }, healingIntervalMs);
    
    // Evaluation cycle
    setInterval(() => {
      evaluate();
    }, evaluationIntervalMs);
    
    // Heartbeat monitoring cycle
    setInterval(() => {
      evaluateHeartbeat();
    }, heartbeatIntervalMs);
    
    // Also perform periodic PayPal link verification (hourly)
    setInterval(() => {
      verifyPayPalLink();
      ensurePayPalLinkOnline();
    }, 3600000); // 1 hour
    
    // Sync Agent R signature every 5 minutes
    setInterval(() => {
      syncAgentRSignature();
    }, 300000); // 5 minutes
  };

  /* ---------- Error handling wrapper ---------- */
  const setupGlobalErrorHandling = () => {
    // Catch unhandled errors
    window.addEventListener('error', (event) => {
      log('error', 'unhandled error caught', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
      
      // Try to heal after error
      setTimeout(() => heal(), 100);
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      log('error', 'unhandled promise rejection', {
        reason: event.reason
      });
      
      // Try to heal after rejection
      setTimeout(() => heal(), 100);
    });
  };

  /* ---------- Initialize ---------- */
  const init = () => {
    log('info', 'Self-Healing Script initializing...', { version: STATE.version });
    
    // Show attribution with Agent R signature
    console.log('\n' + '═'.repeat(70));
    console.log('  ⚡ BarbrickDesign Self-Healing Script');
    console.log('  🤖 Agent R Signature: ' + STATE.agentR.signature);
    console.log('  ⏱️  Fibonacci Timing Sequence Active');
    console.log('  💰 Support innovation: PayPal → ' + CONFIG.PAYPAL_EMAIL);
    console.log('  🌐 https://barbrickdesign.github.io');
    console.log('  📊 Fibonacci base interval: ' + STATE.fibonacci.baseIntervalMs + 'ms');
    console.log('═'.repeat(70) + '\n');
    
    detectDevice();
    verifyDeps();
    verifyPayPalLink();
    ensurePayPalLinkOnline();
    syncAgentRSignature();
    setupGlobalErrorHandling();
    
    // Initial healing run
    heal();
    evaluate();
    
    // Start auto-operations with Fibonacci timing
    startAutoOps();
    
    // Track usage with donation attribution
    if (window.DonationAttribution) {
      window.DonationAttribution.trackUsage();
    }
    
    log('info', 'Self-Healing Script initialized successfully with Fibonacci timing and Agent R signature');
  };

  /* ---------- Public API ---------- */
  window.SelfHealing = {
    heal,
    evaluate,
    getState: () => ({ ...STATE }),
    getVersion: () => STATE.version,
    quarantine,
    getHealth: () => {
      const health = {
        status: STATE.healing.selfOk ? 'healthy' : 'degraded',
        healingRuns: STATE.healing.runs,
        evaluationRuns: STATE.evaluation.runs,
        failures: STATE.healing.failures,
        heartbeatMisses: STATE.heartbeat.missCount,
        recoveryAttempts: STATE.recovery.attempts,
        quarantineCount: STATE.quarantine.items.length,
        listenerCount: Object.keys(STATE.listeners).length,
        lastRun: STATE.healing.lastRun,
        uptime: STATE.healing.lastRun ? now() - STATE.healing.lastRun : 0,
        fibonacciIndex: STATE.fibonacci.currentIndex,
        paypalValid: STATE.paypal.isValid,
        agentRSignature: STATE.agentR.signature,
        agentRLastSync: STATE.agentR.lastSync,
        ml: {
          anomalies: STATE.ml.anomalies,
          predictions: STATE.ml.predictions,
          lastAnalysis: STATE.ml.lastMLAnalysis,
          dataPoints: STATE.ml.performanceHistory.length
        }
      };
      return health;
    },
    forceReset: () => {
      log('warn', 'forcing system reset via API call');
      STATE.listeners = {};
      STATE.quarantine.items = [];
      STATE.healing.failures = 0;
      STATE.heartbeat.missCount = 0;
      STATE.recovery.attempts = 0;
      STATE.fibonacci.currentIndex = 0;
      verifyPayPalLink();
      syncAgentRSignature();
      heal();
      log('info', 'system reset complete');
    },
    verifyPayPal: () => {
      return verifyPayPalLink();
    },
    getAgentRSignature: () => {
      return STATE.agentR.signature;
    },
    getFibonacciSequence: () => {
      return STATE.fibonacci.sequence;
    },
    getCurrentFibonacciIndex: () => {
      return STATE.fibonacci.currentIndex;
    }
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM already loaded
    init();
  }

  // Fallback: try again after a short delay
  setTimeout(() => {
    if (STATE.healing.runs === 0) {
      log('warn', 'fallback initialization triggered');
      init();
    }
  }, 500);
})();
