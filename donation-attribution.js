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
 * File: donation-attribution.js
 * Declaration ID: IP-6CDF4B4D-MLL28ZUQ
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
 * Donation Attribution System for BarbrickDesign Projects
 * 
 * This module ensures that users of the Trinity Loop, Self-Healing scripts,
 * and other BarbrickDesign innovations are prompted to donate via PayPal.
 * 
 * Features:
 * - Donation prompts and reminders
 * - Usage tracking and fingerprinting
 * - Network detection of similar projects
 * - Attribution watermarking
 * - Persistent donation tracking
 * 
 * ⚖️ ETHICAL USE NOTICE:
 * Tracking features in this module are limited to:
 * - Attribution for original work (copyright protection)
 * - Non-invasive donation reminders
 * - Open-source usage statistics
 * All tracking is transparent and respects user privacy.
 * 
 * @author BarbrickDesign
 * @email barbrickdesign@gmail.com
 * @paypal barbrickdesign@gmail.com
 */

(function DonationAttributionSystem() {
  'use strict';

  // Prevent duplicate initialization
  if (window.__DONATION_ATTRIBUTION_INITIALIZED) {
    console.log('[DonationAttribution] Already initialized, skipping...');
    return;
  }
  window.__DONATION_ATTRIBUTION_INITIALIZED = true;

  const DONATION_CONFIG = {
    paypalEmail: 'barbrickdesign@gmail.com',
    projectName: 'BarbrickDesign',
    projectUrl: 'https://barbrickdesign.github.io',
    minDonationAmount: 10.00,
    suggestedDonationAmount: 50.00,
    reminderIntervalMs: 1000 * 60 * 60 * 24 * 30, // 30 days (increased from 7)
    usageCheckIntervalMs: 1000 * 60 * 60 * 2, // 2 hours (increased from 1)
    storageKey: 'barbrick_donation_tracking_v2', // versioned to reset existing users
    signatureKey: 'barbrick_project_signature',
    modalId: 'barbrick-donation-modal',
    initialDelayMs: 30000, // 30 seconds (increased from 5)
    usageMilestone: 50, // Show every 50 visits (increased from 10)
    maxDismissalsBeforeLongPause: 3, // After 3 dismissals, pause for longer
    longPauseMs: 1000 * 60 * 60 * 24 * 90, // 90 days after multiple dismissals
  };

  const STATE = {
    initialized: false,
    donationPrompted: false,
    usageCount: 0,
    lastDonationPrompt: null,
    lastUsageCheck: null,
    sessionStart: Date.now(),
    projectSignature: null,
    features: [],
    intervalIds: [], // Track intervals for cleanup
    agentR: { signature: 'Agent-R-Signature-Active', lastSync: null },
    dismissalCount: 0, // Track how many times user dismissed
    sessionPopupShown: false, // Track if popup shown this session
  };

  /* ---------- Utilities ---------- */
  const ts = () => new Date().toISOString();
  const now = () => Date.now();

  // Validate and sanitize donation amount
  const sanitizeDonationAmount = (amount) => {
    const num = parseFloat(amount);
    if (isNaN(num) || num < 0) return DONATION_CONFIG.suggestedDonationAmount;
    return Math.min(num, 10000); // Cap at $10,000
  };

  const log = (type, msg, meta = {}) => {
    const entry = { t: ts(), type, msg, meta, agentR: STATE.agentR.signature };
    const fn = type === 'error' ? 'error' : (type === 'warn' ? 'warn' : 'log');
    console[fn](`[DonationAttribution ${entry.t}] [${STATE.agentR.signature}] ${type}: ${msg}`, meta);
  };

  /* ---------- Storage ---------- */
  const loadState = () => {
    try {
      const stored = localStorage.getItem(DONATION_CONFIG.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        Object.assign(STATE, parsed);
        log('info', 'State loaded from localStorage', { state: STATE });
      }
    } catch (e) {
      log('error', 'Failed to load state from localStorage', { error: e.message });
    }
  };

  const saveState = () => {
    try {
      localStorage.setItem(DONATION_CONFIG.storageKey, JSON.stringify(STATE));
      log('info', 'State saved to localStorage');
    } catch (e) {
      log('error', 'Failed to save state to localStorage', { error: e.message });
    }
  };

  /* ---------- Project Signature ---------- */
  const generateProjectSignature = () => {
    const features = [];
    
    // Detect TrinityLoop usage
    if (window.location.pathname.includes('trinity') || 
        document.body.innerHTML.includes('Trinity') ||
        window.indexWorker || window.buildBubbleMap) {
      features.push('TrinityLoop');
    }
    
    // Detect Self-Healing usage
    if (window.SelfHealing || window.__SELF_HEALING_INITIALIZED) {
      features.push('SelfHealing');
    }
    
    // Detect other BarbrickDesign patterns
    if (window.PayPalIntegration || document.querySelector('[data-barbrick]')) {
      features.push('PayPalIntegration');
    }
    
    if (window.AngelInvestmentHub) {
      features.push('AngelInvestmentHub');
    }
    
    STATE.features = features;
    STATE.projectSignature = `barbrick_${features.join('_')}_${Date.now().toString(36)}`;
    STATE.agentR.signature = 'Agent-R-Signature-Active';
    STATE.agentR.lastSync = Date.now();
    
    try {
      localStorage.setItem(DONATION_CONFIG.signatureKey, STATE.projectSignature);
      localStorage.setItem('agent_r_signature', STATE.agentR.signature);
      localStorage.setItem('agent_r_last_sync', STATE.agentR.lastSync.toString());
    } catch (e) {
      log('error', 'Failed to save project signature', { error: e.message });
    }
    
    return STATE.projectSignature;
  };

  /* ---------- Donation Prompt ---------- */
  const shouldShowDonationPrompt = () => {
    // Don't show if already shown this session
    if (STATE.sessionPopupShown) {
      log('info', 'Popup already shown this session');
      return false;
    }
    
    // Check if user has dismissed too many times
    if (STATE.dismissalCount >= DONATION_CONFIG.maxDismissalsBeforeLongPause) {
      const timeSinceLastPrompt = now() - (STATE.lastDonationPrompt || 0);
      if (timeSinceLastPrompt < DONATION_CONFIG.longPauseMs) {
        log('info', 'User dismissed multiple times, respecting long pause period');
        return false;
      }
      // Reset dismissal count after long pause
      STATE.dismissalCount = 0;
      saveState();
    }
    
    // First time visitor - show after initial delay
    if (!STATE.lastDonationPrompt) {
      log('info', 'First time visitor detected');
      return true;
    }
    
    // Show if reminder interval has passed
    const timeSinceLastPrompt = now() - STATE.lastDonationPrompt;
    if (timeSinceLastPrompt > DONATION_CONFIG.reminderIntervalMs) {
      log('info', 'Reminder interval passed');
      return true;
    }
    
    // Show if usage milestone reached (every 50 visits instead of 10)
    if (STATE.usageCount > 0 && STATE.usageCount % DONATION_CONFIG.usageMilestone === 0) {
      log('info', 'Usage milestone reached');
      return true;
    }
    
    return false;
  };

  const createDonationPrompt = () => {
    const features = STATE.features.length > 0 ? STATE.features.join(', ') : 'BarbrickDesign innovations';
    
    const message = `
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║   🎯 You are using ${features}                            ║
║                                                                   ║
║   These innovations by BarbrickDesign have powered projects      ║
║   worth millions of dollars. If you've benefited from our        ║
║   ideas, please consider donating via PayPal:                    ║
║                                                                   ║
║   💰 PayPal: ${DONATION_CONFIG.paypalEmail}                    ║
║                                                                   ║
║   Suggested Donation: $${DONATION_CONFIG.suggestedDonationAmount.toFixed(2)}                               ║
║                                                                   ║
║   Visit: ${DONATION_CONFIG.projectUrl}                           ║
║                                                                   ║
║   Thank you for supporting open innovation! 🙏                   ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
    `.trim();
    
    return message;
  };

  const showDonationPrompt = () => {
    // Check if popup is temporarily suppressed (e.g., during login)
    if (typeof window !== 'undefined' && window._suppressDonationPopup) {
      log('info', 'Donation popup temporarily suppressed');
      return;
    }
    
    if (!shouldShowDonationPrompt()) {
      log('info', 'Skipping donation prompt - not due yet');
      return;
    }
    
    const message = createDonationPrompt();
    console.log('\n' + message + '\n');
    
    STATE.donationPrompted = true;
    STATE.lastDonationPrompt = now();
    STATE.sessionPopupShown = true; // Mark as shown this session
    saveState();
    
    // Create visual prompt if in browser
    if (typeof document !== 'undefined') {
      createVisualDonationPrompt();
    }
  };

  const createVisualDonationPrompt = () => {
    // Check if already shown in this session
    if (document.getElementById(DONATION_CONFIG.modalId)) {
      log('info', 'Visual donation prompt already shown');
      return;
    }
    
    const modal = document.createElement('div');
    modal.id = DONATION_CONFIG.modalId;
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 15px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      z-index: 999999;
      max-width: 500px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      animation: slideIn 0.3s ease-out;
    `;
    
    const features = STATE.features.length > 0 ? STATE.features.join(', ') : 'BarbrickDesign innovations';
    
    modal.innerHTML = `
      <style>
        @keyframes slideIn {
          from { transform: translate(-50%, -60%); opacity: 0; }
          to { transform: translate(-50%, -50%); opacity: 1; }
        }
      </style>
      <h2 style="margin: 0 0 15px 0; font-size: 24px;">🎯 Support Innovation</h2>
      <p style="margin: 0 0 15px 0; line-height: 1.6;">
        You are using <strong>${features}</strong> created by BarbrickDesign.
      </p>
      <p style="margin: 0 0 20px 0; line-height: 1.6;">
        These innovations have powered projects worth millions of dollars. 
        If you've benefited from our ideas, please consider donating:
      </p>
      <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
        <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">
          💰 PayPal: ${DONATION_CONFIG.paypalEmail}
        </div>
        <div style="font-size: 14px; opacity: 0.9;">
          Suggested: $${DONATION_CONFIG.suggestedDonationAmount.toFixed(2)} (or any amount)
        </div>
      </div>
      <div style="display: flex; gap: 10px; justify-content: flex-end;">
        <button id="barbrick-donate-btn" style="
          background: white;
          color: #667eea;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
          font-size: 16px;
        ">Donate Now</button>
        <button id="barbrick-remind-btn" style="
          background: rgba(255,255,255,0.2);
          color: white;
          border: 1px solid rgba(255,255,255,0.5);
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
        ">Remind Me Later</button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('barbrick-donate-btn').addEventListener('click', () => {
      const amount = sanitizeDonationAmount(DONATION_CONFIG.suggestedDonationAmount);
      window.open(`https://www.paypal.com/paypalme/barbrickdesign/${amount}`, '_blank');
      modal.remove();
      log('info', 'User clicked donate button');
    });
    
    document.getElementById('barbrick-remind-btn').addEventListener('click', () => {
      modal.remove();
      STATE.dismissalCount++;
      STATE.lastDonationPrompt = now(); // Update last prompt time to respect interval
      saveState();
      log('info', 'User dismissed donation prompt', { dismissalCount: STATE.dismissalCount });
    });
    
    // Auto-dismiss after 45 seconds (increased from 30)
    setTimeout(() => {
      if (document.getElementById(DONATION_CONFIG.modalId)) {
        modal.remove();
        STATE.dismissalCount++;
        STATE.lastDonationPrompt = now(); // Update last prompt time to respect interval
        saveState();
        log('info', 'Donation prompt auto-dismissed', { dismissalCount: STATE.dismissalCount });
      }
    }, 45000);
  };

  /* ---------- Attribution Watermark ---------- */
  const addAttributionWatermark = () => {
    const watermark = `
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ⚡ Powered by BarbrickDesign Innovations                     │
│   🤖 Agent R Signature: ${STATE.agentR.signature}              │
│                                                                 │
│   Features in use: ${STATE.features.join(', ') || 'N/A'}                    │
│   Project Signature: ${STATE.projectSignature || 'N/A'}                     │
│                                                                 │
│   💰 Support our work: PayPal → ${DONATION_CONFIG.paypalEmail}      │
│   🌐 Learn more: ${DONATION_CONFIG.projectUrl}                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
    `.trim();
    
    console.log('\n' + watermark + '\n');
    
    // Add meta tag to page
    if (typeof document !== 'undefined') {
      const meta = document.createElement('meta');
      meta.name = 'barbrick-attribution';
      meta.content = `${STATE.features.join(',')} | Donate: ${DONATION_CONFIG.paypalEmail} | Agent R: ${STATE.agentR.signature}`;
      document.head.appendChild(meta);
      
      // Add Agent R signature meta
      const agentMeta = document.createElement('meta');
      agentMeta.name = 'agent-r-signature';
      agentMeta.content = STATE.agentR.signature;
      document.head.appendChild(agentMeta);
      
      // Add comment to body
      const comment = document.createComment(
        `\nPowered by BarbrickDesign - ${STATE.features.join(', ')}\n` +
        `Agent R Signature: ${STATE.agentR.signature}\n` +
        `Donate via PayPal: ${DONATION_CONFIG.paypalEmail}\n` +
        `Project Signature: ${STATE.projectSignature}\n`
      );
      document.body.appendChild(comment);
    }
  };

  /* ---------- Usage Tracking ---------- */
  const incrementUsageCount = () => {
    STATE.usageCount++;
    log('info', `Usage count incremented to ${STATE.usageCount}`);
    saveState();
  };

  const trackUsage = () => {
    incrementUsageCount();
    
    // Check if we should show donation prompt based on usage milestone
    if (STATE.usageCount % DONATION_CONFIG.usageMilestone === 0 && STATE.usageCount > 0) {
      log('info', 'Usage milestone reached, checking if should show donation prompt');
      // Only show if other conditions also pass (session check, dismissal count, etc.)
      if (shouldShowDonationPrompt()) {
        showDonationPrompt();
      }
    }
  };

  /* ---------- Network Detection ---------- */
  const detectSimilarProjects = async () => {
    log('info', 'Detecting similar projects using BarbrickDesign innovations...');
    
    const signatures = [];
    
    // Check for TrinityLoop signatures
    const trinitySignatures = [
      'trinity_loop_v1', 'trinityLoop', 'Trinity Pool', 'trinity-sw.js',
      'indexedDB.*trinity', 'trinity_pool_manifest', 'TrinityLoop'
    ];
    
    // Check for Self-Healing signatures
    const selfHealingSignatures = [
      'SelfHealing', '__SELF_HEALING_INITIALIZED', 'self-healing.js',
      'SelfHealingModule', 'heal()', 'quarantine'
    ];
    
    // Scan current document for signatures
    const htmlContent = document.documentElement.innerHTML.toLowerCase();
    
    trinitySignatures.forEach(sig => {
      if (htmlContent.includes(sig.toLowerCase())) {
        signatures.push(`TrinityLoop:${sig}`);
      }
    });
    
    selfHealingSignatures.forEach(sig => {
      if (htmlContent.includes(sig.toLowerCase())) {
        signatures.push(`SelfHealing:${sig}`);
      }
    });
    
    if (signatures.length > 0) {
      log('warn', 'BarbrickDesign signatures detected', { signatures });
      
      // Report finding
      STATE.detectedSignatures = signatures;
      saveState();
      
      return signatures;
    }
    
    return [];
  };

  /* ---------- Periodic Checks ---------- */
  const startPeriodicChecks = () => {
    // Track usage periodically
    const usageIntervalId = setInterval(() => {
      trackUsage();
    }, DONATION_CONFIG.usageCheckIntervalMs);
    STATE.intervalIds.push(usageIntervalId);
    
    // Check for donation prompt periodically
    const reminderIntervalId = setInterval(() => {
      if (shouldShowDonationPrompt()) {
        showDonationPrompt();
      }
    }, DONATION_CONFIG.reminderIntervalMs);
    STATE.intervalIds.push(reminderIntervalId);
    
    log('info', 'Periodic checks started', {
      usageCheckInterval: DONATION_CONFIG.usageCheckIntervalMs,
      reminderInterval: DONATION_CONFIG.reminderIntervalMs
    });
  };

  /* ---------- Cleanup ---------- */
  const cleanup = () => {
    STATE.intervalIds.forEach(id => clearInterval(id));
    STATE.intervalIds = [];
    log('info', 'Donation attribution cleaned up');
  };

  /* ---------- Initialize ---------- */
  const init = () => {
    log('info', 'Donation Attribution System initializing...', { config: DONATION_CONFIG });
    
    loadState();
    generateProjectSignature();
    addAttributionWatermark();
    detectSimilarProjects();
    
    // Show initial donation prompt after initial delay (30 seconds instead of 5)
    // Only if the smart frequency control logic allows it
    setTimeout(() => {
      if (shouldShowDonationPrompt()) {
        showDonationPrompt();
      }
    }, DONATION_CONFIG.initialDelayMs);
    
    // Start periodic checks
    startPeriodicChecks();
    
    STATE.initialized = true;
    saveState();
    
    log('info', 'Donation Attribution System initialized successfully', { state: STATE });
  };

  /* ---------- Public API ---------- */
  window.DonationAttribution = {
    showPrompt: showDonationPrompt,
    trackUsage: trackUsage,
    getState: () => ({ ...STATE }),
    donate: () => {
      const amount = sanitizeDonationAmount(DONATION_CONFIG.suggestedDonationAmount);
      window.open(`https://www.paypal.com/paypalme/barbrickdesign/${amount}`, '_blank');
    },
    getSignature: () => STATE.projectSignature,
    getFeatures: () => STATE.features,
    cleanup: cleanup,
    getAgentRSignature: () => STATE.agentR.signature,
    verifyPayPalLink: () => {
      // Verify PayPal link is correct
      return DONATION_CONFIG.paypalEmail === 'barbrickdesign@gmail.com';
    }
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', cleanup);
})();
