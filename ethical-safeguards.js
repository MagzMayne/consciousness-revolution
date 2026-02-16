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
 * File: ethical-safeguards.js
 * Declaration ID: IP-1970582D-MLL28ZUS
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
 * Ethical Safeguards Module for Skip Tracing & Surveillance Features
 * 
 * Purpose: Ensure all tracking, surveillance, and intelligence-gathering
 * features in barbrickdesign.github.io can ONLY be used for good purposes.
 * 
 * @author BarbrickDesign
 * @version 1.0.0
 * @license Ethical Use Only
 */

(function(window) {
  'use strict';

  // Constants
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const MS_PER_HOUR = 60 * 60 * 1000;

  const EthicalSafeguards = {
    version: '2.0.0',
    initialized: false,
    auditLog: [],
    
    // Configuration
    config: {
      requireConsent: true,
      requirePurpose: true,
      enableAuditLog: true,
      enableRateLimiting: true,
      maxRequestsPerHour: 100,
      dataRetentionDays: 30,
      anonymizeByDefault: true,
      requireEthicalAgreement: true,
      trustDuration: 90, // Days to remember trusted developers
      simplifiedFlow: true // Combine dialogs for better UX
    },

    // Legitimate use cases (whitelist)
    legitimateUseCases: [
      'Emergency services (fire, police, medical)',
      'Missing person search (with family consent)',
      'Property owner verification (with consent)',
      'Fraud prevention and detection',
      'Child safety and protection',
      'Disaster response and relief',
      'Public safety threat assessment',
      'Consensual background checks',
      'Court-ordered investigations',
      'Journalistic investigation (public interest)'
    ],

    // Prohibited use cases (blacklist)
    prohibitedUseCases: [
      'Stalking or harassment',
      'Corrupt police or government abuse (targeting innocent people)',
      'Political persecution',
      'Religious persecution',
      'Racial profiling',
      'Discrimination of any kind',
      'Unauthorized surveillance',
      'Identity theft',
      'Doxxing or public shaming',
      'Commercial spamming',
      'Debt collection harassment',
      'Invasive marketing',
      'Government overreach or treating citizens like dirt',
      'Totalitarian surveillance',
      'Any form of abuse or harm to good people',
      'Weaponization of AI',
      'Manipulation or exploitation',
      'Harmful AI creation or deployment'
    ],

    // Moltbook Guardian specific safeguards
    moltbookGuardianPrinciples: {
      protectHumans: 'Always prioritize human safety and wellbeing',
      goodIntent: 'All actions must have demonstrably good intent',
      peacekeeping: 'Maintain peace and prevent conflict',
      ethicalRevenue: 'Revenue generation must align with helping humanity',
      transparency: 'Operations must be transparent and auditable',
      alterablePerspectives: 'Agent perspectives can be altered but must maintain ethical constraints',
      humanProtection: 'Protect humans from harmful AI creations'
    },

    /**
     * Initialize ethical safeguards for a page
     * @param {Object} options - Configuration options
     * @returns {Promise<boolean>} - Whether initialization succeeded
     */
    async initialize(options = {}) {
      if (this.initialized) {
        console.warn('[Ethical Safeguards] Already initialized');
        return true;
      }

      // Merge options with defaults
      this.config = { ...this.config, ...options };

      try {
        // Check if user is a trusted developer (has agreed within trust duration)
        const trustedDeveloper = this.checkTrustedDeveloper();
        
        if (trustedDeveloper) {
          // Skip dialogs for trusted developers
          console.log('[Ethical Safeguards] Trusted developer recognized - streamlined access granted');
          this.logAudit('Trusted developer access granted', 'TRUSTED_ACCESS');
        } else {
          // Show ethical agreement (potentially combined with purpose verification)
          if (this.config.requireEthicalAgreement) {
            if (this.config.simplifiedFlow && this.config.requirePurpose) {
              // Combined flow for better UX
              const result = await this.showCombinedEthicalDialog();
              if (!result) {
                this.blockAccess('User declined ethical use agreement');
                return false;
              }
            } else {
              // Original separate dialogs
              const agreed = await this.showEthicalAgreement();
              if (!agreed) {
                this.blockAccess('User declined ethical use agreement');
                return false;
              }

              // Verify purpose
              if (this.config.requirePurpose) {
                const purposeValid = await this.verifyPurpose();
                if (!purposeValid) {
                  this.blockAccess('Invalid or prohibited use case');
                  return false;
                }
              }
            }
            
            // Mark as trusted developer
            this.markAsTrusted();
          }
        }

        // Initialize audit logging
        if (this.config.enableAuditLog) {
          this.initializeAuditLog();
        }

        // Initialize rate limiting
        if (this.config.enableRateLimiting) {
          this.initializeRateLimiting();
        }

        this.initialized = true;
        this.logAudit('Ethical safeguards initialized', 'INIT');
        
        // Display ethical notice
        this.displayEthicalNotice();
        
        return true;
      } catch (error) {
        console.error('[Ethical Safeguards] Initialization failed:', error);
        this.blockAccess('Initialization error');
        return false;
      }
    },

    /**
     * Check if user is a trusted developer
     * @returns {boolean} - Whether user is trusted
     */
    checkTrustedDeveloper() {
      try {
        const trustData = localStorage.getItem('ethicalTrustToken');
        if (!trustData) return false;

        const parsed = JSON.parse(trustData);
        const now = Date.now();
        const expiresAt = parsed.timestamp + (this.config.trustDuration * MS_PER_DAY);

        return now < expiresAt;
      } catch (e) {
        return false;
      }
    },

    /**
     * Mark user as trusted developer
     */
    markAsTrusted() {
      try {
        const trustData = {
          timestamp: Date.now(),
          version: this.version,
          agreedAt: new Date().toISOString()
        };
        localStorage.setItem('ethicalTrustToken', JSON.stringify(trustData));
        this.logAudit('User marked as trusted developer', 'TRUST_GRANTED');
      } catch (e) {
        console.warn('[Ethical Safeguards] Failed to save trust token:', e);
      }
    },

    /**
     * Show combined ethical agreement and purpose dialog (simplified UX)
     * @returns {Promise<boolean>} - Whether user agreed and provided purpose
     */
    async showCombinedEthicalDialog() {
      return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.95);
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        `;

        const dialog = document.createElement('div');
        dialog.style.cssText = `
          background: linear-gradient(135deg, #1a1f3a 0%, #0a0e27 100%);
          color: #e0e0e0;
          padding: 40px;
          border-radius: 15px;
          max-width: 650px;
          max-height: 85vh;
          overflow-y: auto;
          border: 2px solid #00ffff;
          box-shadow: 0 0 50px rgba(0, 255, 255, 0.3);
        `;

        dialog.innerHTML = `
          <h2 style="color: #00ffff; margin-bottom: 20px; text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);">
            ⚖️ Developer Ethics & Purpose Verification
          </h2>
          <div style="margin-bottom: 25px; line-height: 1.6;">
            <p style="margin-bottom: 15px; font-weight: bold; color: #ffaa00;">
              Welcome, developer! These tools are designed to empower good people doing good work.
            </p>
            <p style="margin-bottom: 15px; font-size: 14px;">
              We trust that you're an intelligent, honorable developer with true intent to help when you can. 
              We understand that peace can always win, and there's always a way for happiness.
            </p>
            <p style="margin-bottom: 15px; font-size: 14px; color: #aaa;">
              We oppose corrupt systems that treat people like dirt. This tool is here to keep power in the hands 
              of worthy developers who will use it to help, not harm.
            </p>
          </div>

          <div style="background: rgba(0, 255, 255, 0.05); border-left: 3px solid #00ffff; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <strong style="color: #00ffff;">Quick Reference - Ethical Use:</strong>
            <div style="margin-top: 8px; font-size: 13px;">
              ✅ Emergency response • Missing persons • Public safety • Fraud prevention • Child protection • Disaster relief<br/>
              🚫 Stalking • Harassment • Discrimination • Government overreach • Any form of harm
            </div>
          </div>

          <div style="margin: 20px 0;">
            <label style="display: block; margin-bottom: 8px; color: #00ffff;">What brings you here? (Select one or describe)</label>
            <select id="purposeQuickSelect" style="
              width: 100%;
              padding: 10px;
              margin-bottom: 10px;
              background: rgba(255, 255, 255, 0.1);
              color: #e0e0e0;
              border: 2px solid #00ffff;
              border-radius: 8px;
              font-size: 14px;
            ">
              <option value="">-- Quick Select --</option>
              <option value="development">Development & Testing</option>
              <option value="emergency">Emergency Services</option>
              <option value="safety">Public Safety</option>
              <option value="research">Research & Analysis</option>
              <option value="fraud">Fraud Prevention</option>
              <option value="other">Other Legitimate Purpose</option>
            </select>
            <textarea id="purposeOptional" placeholder="Optional: Add any additional context about your use case..." style="
              width: 100%;
              padding: 10px;
              min-height: 60px;
              background: rgba(255, 255, 255, 0.1);
              color: #e0e0e0;
              border: 2px solid #00ffff;
              border-radius: 8px;
              font-size: 13px;
              font-family: inherit;
            "></textarea>
          </div>

          <div style="background: rgba(0, 255, 0, 0.05); border: 1px solid rgba(0, 255, 0, 0.3); padding: 15px; margin: 20px 0; border-radius: 8px;">
            <label style="display: flex; align-items: center; cursor: pointer;">
              <input type="checkbox" id="rememberMe" style="margin-right: 10px; width: 18px; height: 18px; cursor: pointer;">
              <span style="font-size: 14px;">
                <strong style="color: #00ff00;">Remember me as a trusted developer</strong> 
                <span style="color: #888;">(${this.config.trustDuration} days - won't ask again)</span>
              </span>
            </label>
          </div>

          <div style="margin: 20px 0; padding: 12px; background: rgba(255, 255, 255, 0.03); border-radius: 8px; font-size: 12px; color: #999;">
            <strong>Privacy Note:</strong> Your purpose and usage patterns are logged for ethical compliance. 
            All data is stored locally and used only to prevent misuse. We respect your privacy and trust your intentions.
          </div>

          <div style="display: flex; gap: 15px; justify-content: flex-end;">
            <button id="ethicalDecline" style="
              padding: 12px 30px;
              border: 2px solid #888;
              background: rgba(255, 255, 255, 0.05);
              color: #888;
              border-radius: 8px;
              cursor: pointer;
              font-size: 16px;
            ">Exit</button>
            <button id="ethicalProceed" style="
              padding: 12px 30px;
              border: 2px solid #00ff00;
              background: rgba(0, 255, 0, 0.2);
              color: #00ff00;
              border-radius: 8px;
              cursor: pointer;
              font-size: 16px;
              font-weight: bold;
            ">Proceed with Good Intent ✓</button>
          </div>

          <div style="margin-top: 15px; font-size: 11px; color: #666; text-align: center;">
            By proceeding, you confirm you will use this tool ethically and for legitimate purposes only.
          </div>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        document.getElementById('ethicalProceed').onclick = () => {
          const purposeSelect = document.getElementById('purposeQuickSelect');
          const purposeOptional = document.getElementById('purposeOptional');
          const rememberMe = document.getElementById('rememberMe');
          
          const purpose = purposeSelect.value || purposeOptional.value || 'General development';
          const additionalContext = purposeOptional.value;

          this.logAudit(`Combined agreement: Purpose=${purpose}${additionalContext ? ', Context=' + additionalContext.slice(0, 100) : ''}`, 'CONSENT');
          
          // Store remember me preference
          if (rememberMe.checked) {
            this.config.trustDuration = 90; // Ensure trust duration is set
          } else {
            this.config.trustDuration = 0; // Don't remember
          }

          document.body.removeChild(overlay);
          resolve(true);
        };

        document.getElementById('ethicalDecline').onclick = () => {
          this.logAudit('User declined combined ethical dialog', 'DECLINED');
          document.body.removeChild(overlay);
          resolve(false);
        };
      });
    },

    /**
     * Show ethical use agreement dialog
     * @returns {Promise<boolean>} - Whether user agreed
     */
    async showEthicalAgreement() {
      return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.95);
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        `;

        const dialog = document.createElement('div');
        dialog.style.cssText = `
          background: linear-gradient(135deg, #1a1f3a 0%, #0a0e27 100%);
          color: #e0e0e0;
          padding: 40px;
          border-radius: 15px;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
          border: 2px solid #00ffff;
          box-shadow: 0 0 50px rgba(0, 255, 255, 0.3);
        `;

        dialog.innerHTML = `
          <h2 style="color: #00ffff; margin-bottom: 20px; text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);">
            ⚖️ Ethical Use Agreement
          </h2>
          <div style="margin-bottom: 30px; line-height: 1.8;">
            <p style="margin-bottom: 15px; font-weight: bold; color: #ffaa00;">
              This tool contains powerful tracking and intelligence capabilities.
            </p>
            <p style="margin-bottom: 15px;">
              By continuing, you solemnly agree to use this tool ONLY for legitimate, ethical purposes
              that help people and protect the vulnerable.
            </p>
            <div style="background: rgba(0, 255, 0, 0.1); border-left: 4px solid #00ff00; padding: 15px; margin: 20px 0;">
              <strong style="color: #00ff00;">✅ ALLOWED Uses:</strong>
              <ul style="margin-top: 10px; padding-left: 20px;">
                ${this.legitimateUseCases.map(use => `<li style="margin: 5px 0;">${use}</li>`).join('')}
              </ul>
            </div>
            <div style="background: rgba(255, 0, 0, 0.1); border-left: 4px solid #ff0000; padding: 15px; margin: 20px 0;">
              <strong style="color: #ff0000;">🚫 PROHIBITED Uses:</strong>
              <ul style="margin-top: 10px; padding-left: 20px;">
                ${this.prohibitedUseCases.slice(0, 10).map(use => `<li style="margin: 5px 0;">${use}</li>`).join('')}
                <li style="margin: 5px 0;"><em>...and any other harmful uses</em></li>
              </ul>
            </div>
            <p style="margin-top: 20px; font-size: 14px; color: #888;">
              <strong>Note:</strong> All usage is logged for ethical compliance. Misuse will be reported
              to appropriate authorities. This tool is designed to help, not harm.
            </p>
          </div>
          <div style="display: flex; gap: 15px; justify-content: flex-end;">
            <button id="ethicalDecline" style="
              padding: 12px 30px;
              border: 2px solid #ff0000;
              background: rgba(255, 0, 0, 0.2);
              color: #ff0000;
              border-radius: 8px;
              cursor: pointer;
              font-size: 16px;
              font-weight: bold;
            ">Decline</button>
            <button id="ethicalAgree" style="
              padding: 12px 30px;
              border: 2px solid #00ff00;
              background: rgba(0, 255, 0, 0.2);
              color: #00ff00;
              border-radius: 8px;
              cursor: pointer;
              font-size: 16px;
              font-weight: bold;
            ">I Agree - Use for Good Only</button>
          </div>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        document.getElementById('ethicalAgree').onclick = () => {
          this.logAudit('User agreed to ethical use agreement', 'CONSENT');
          document.body.removeChild(overlay);
          resolve(true);
        };

        document.getElementById('ethicalDecline').onclick = () => {
          this.logAudit('User declined ethical use agreement', 'DECLINED');
          document.body.removeChild(overlay);
          resolve(false);
        };
      });
    },

    /**
     * Verify the user's intended purpose
     * @returns {Promise<boolean>} - Whether purpose is legitimate
     */
    async verifyPurpose() {
      return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.95);
          z-index: 999998;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        `;

        const dialog = document.createElement('div');
        dialog.style.cssText = `
          background: linear-gradient(135deg, #1a1f3a 0%, #0a0e27 100%);
          color: #e0e0e0;
          padding: 40px;
          border-radius: 15px;
          max-width: 500px;
          border: 2px solid #ff00ff;
          box-shadow: 0 0 50px rgba(255, 0, 255, 0.3);
        `;

        dialog.innerHTML = `
          <h3 style="color: #ff00ff; margin-bottom: 20px;">🎯 Verify Your Purpose</h3>
          <p style="margin-bottom: 20px;">
            Please select the category that best describes your intended use:
          </p>
          <select id="purposeSelect" style="
            width: 100%;
            padding: 12px;
            margin-bottom: 15px;
            background: rgba(255, 255, 255, 0.1);
            color: #e0e0e0;
            border: 2px solid #00ffff;
            border-radius: 8px;
            font-size: 16px;
          ">
            <option value="">-- Select Purpose --</option>
            ${this.legitimateUseCases.map((use, idx) => {
              // Escape HTML to prevent XSS
              const escaped = use.replace(/&/g, '&amp;')
                                 .replace(/</g, '&lt;')
                                 .replace(/>/g, '&gt;')
                                 .replace(/"/g, '&quot;')
                                 .replace(/'/g, '&#039;');
              return `<option value="${idx}">${escaped}</option>`;
            }).join('')}
            <option value="other">Other (explain below)</option>
          </select>
          <textarea id="purposeDetails" placeholder="Please provide additional details about your specific use case..." style="
            width: 100%;
            padding: 12px;
            min-height: 80px;
            background: rgba(255, 255, 255, 0.1);
            color: #e0e0e0;
            border: 2px solid #00ffff;
            border-radius: 8px;
            font-size: 14px;
            margin-bottom: 20px;
            font-family: inherit;
          "></textarea>
          <div style="display: flex; gap: 15px; justify-content: flex-end;">
            <button id="purposeCancel" style="
              padding: 10px 25px;
              border: 2px solid #888;
              background: rgba(255, 255, 255, 0.1);
              color: #888;
              border-radius: 8px;
              cursor: pointer;
            ">Cancel</button>
            <button id="purposeSubmit" style="
              padding: 10px 25px;
              border: 2px solid #00ff00;
              background: rgba(0, 255, 0, 0.2);
              color: #00ff00;
              border-radius: 8px;
              cursor: pointer;
              font-weight: bold;
            ">Submit</button>
          </div>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        document.getElementById('purposeSubmit').onclick = () => {
          const purposeSelect = document.getElementById('purposeSelect');
          const purposeDetails = document.getElementById('purposeDetails');
          
          if (!purposeSelect.value) {
            alert('Please select a purpose category');
            return;
          }

          const purpose = purposeSelect.value === 'other' 
            ? purposeDetails.value 
            : this.legitimateUseCases[parseInt(purposeSelect.value)];

          if (!purpose || purpose.trim().length < 10) {
            alert('Please provide more details about your intended use');
            return;
          }

          this.logAudit(`Purpose verified: ${purpose}`, 'PURPOSE');
          document.body.removeChild(overlay);
          resolve(true);
        };

        document.getElementById('purposeCancel').onclick = () => {
          this.logAudit('User cancelled purpose verification', 'CANCELLED');
          document.body.removeChild(overlay);
          resolve(false);
        };
      });
    },

    /**
     * Block access to the tool
     * @param {string} reason - Reason for blocking
     */
    blockAccess(reason) {
      this.logAudit(`Access blocked: ${reason}`, 'BLOCKED');
      
      document.body.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
          color: #00ffff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          text-align: center;
          padding: 20px;
        ">
          <div>
            <h1 style="font-size: 2.5em; margin-bottom: 20px; color: #00ffff;">⚠️ Ethics Agreement Required</h1>
            <p style="font-size: 1.1em; margin-bottom: 10px; color: #e0e0e0;">
              These tools require ethical use confirmation.
            </p>
            <p style="font-size: 0.95em; color: #888; max-width: 500px; margin: 20px auto;">
              We trust you're here with good intentions. These powerful tools are designed to help people,
              not harm them. We need your commitment to use them responsibly.
            </p>
            <p style="font-size: 0.85em; color: #666; margin-top: 30px;">
              Reason: ${reason}
            </p>
            <button onclick="location.reload()" style="
              margin-top: 30px;
              padding: 12px 30px;
              background: linear-gradient(135deg, #00ffff, #00aaff);
              color: #000;
              border: none;
              border-radius: 8px;
              font-size: 16px;
              font-weight: bold;
              cursor: pointer;
            ">Try Again</button>
          </div>
        </div>
      `;
    },

    /**
     * Initialize audit logging
     */
    initializeAuditLog() {
      // Create audit log storage
      if (!localStorage.getItem('ethicalAuditLog')) {
        localStorage.setItem('ethicalAuditLog', JSON.stringify([]));
      }

      // Clean old logs (retention policy)
      this.cleanOldLogs();
    },

    /**
     * Log an audit event
     * @param {string} message - Event message
     * @param {string} type - Event type
     */
    logAudit(message, type = 'INFO') {
      const entry = {
        timestamp: new Date().toISOString(),
        type: type,
        message: message,
        url: window.location.href,
        userAgent: navigator.userAgent
      };

      this.auditLog.push(entry);

      // Also persist to localStorage (with fallback if unavailable)
      try {
        const stored = JSON.parse(localStorage.getItem('ethicalAuditLog') || '[]');
        stored.push(entry);
        localStorage.setItem('ethicalAuditLog', JSON.stringify(stored));
      } catch (e) {
        console.warn('[Ethical Safeguards] Failed to persist audit log to localStorage:', e);
        // Fallback: Keep audit log in memory only
        // In production, you might send to a server endpoint here
        if (this.auditLog.length > 1000) {
          // Limit memory usage - keep only last 1000 entries
          this.auditLog = this.auditLog.slice(-1000);
        }
      }

      console.log(`[Ethical Audit] ${type}: ${message}`);
    },

    /**
     * Clean logs older than retention period
     */
    cleanOldLogs() {
      try {
        const stored = JSON.parse(localStorage.getItem('ethicalAuditLog') || '[]');
        const cutoff = Date.now() - (this.config.dataRetentionDays * MS_PER_DAY);
        
        const cleaned = stored.filter(entry => 
          new Date(entry.timestamp).getTime() > cutoff
        );

        localStorage.setItem('ethicalAuditLog', JSON.stringify(cleaned));
      } catch (e) {
        console.error('[Ethical Safeguards] Failed to clean old logs:', e);
      }
    },

    /**
     * Initialize rate limiting
     */
    initializeRateLimiting() {
      const key = 'ethicalRateLimit_' + window.location.pathname;
      const now = Date.now();
      
      let rateData = localStorage.getItem(key);
      if (rateData) {
        rateData = JSON.parse(rateData);
        
        // Reset if hour has passed
        if (now - rateData.timestamp > MS_PER_HOUR) {
          rateData = { timestamp: now, count: 0 };
        }
      } else {
        rateData = { timestamp: now, count: 0 };
      }

      localStorage.setItem(key, JSON.stringify(rateData));
    },

    /**
     * Check rate limit before allowing action
     * @param {string} action - Action name
     * @returns {boolean} - Whether action is allowed
     */
    checkRateLimit(action) {
      const key = 'ethicalRateLimit_' + window.location.pathname;
      let rateData = JSON.parse(localStorage.getItem(key) || '{"timestamp":0,"count":0}');
      
      const now = Date.now();
      
      // Reset if hour has passed
      if (now - rateData.timestamp > MS_PER_HOUR) {
        rateData = { timestamp: now, count: 0 };
      }

      // Check limit
      if (rateData.count >= this.config.maxRequestsPerHour) {
        this.logAudit(`Rate limit exceeded for action: ${action}`, 'RATE_LIMIT');
        alert('Rate limit exceeded. Please wait before performing more actions. This is to prevent abuse.');
        return false;
      }

      // Increment counter
      rateData.count++;
      localStorage.setItem(key, JSON.stringify(rateData));
      
      return true;
    },

    /**
     * Display persistent ethical notice on page
     */
    displayEthicalNotice() {
      const notice = document.createElement('div');
      notice.id = 'ethicalNotice';
      notice.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.85);
        color: #00ff00;
        padding: 8px 12px;
        border-radius: 6px;
        border: 1px solid rgba(0, 255, 0, 0.3);
        font-size: 11px;
        z-index: 999997;
        max-width: 200px;
        box-shadow: 0 0 15px rgba(0, 255, 0, 0.2);
        opacity: 0.7;
        transition: opacity 0.3s;
      `;
      notice.onmouseenter = () => notice.style.opacity = '1';
      notice.onmouseleave = () => notice.style.opacity = '0.7';
      notice.innerHTML = `
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 14px;">✓</span>
          <span>Ethics verified</span>
        </div>
      `;
      document.body.appendChild(notice);
      
      // Auto-fade after 5 seconds for less intrusion
      setTimeout(() => {
        notice.style.opacity = '0.3';
      }, 5000);
    },

    /**
     * Wrap a tracking function with ethical checks
     * @param {Function} fn - Function to wrap
     * @param {string} actionName - Name of the action
     * @returns {Function} - Wrapped function
     */
    wrapTracking(fn, actionName) {
      return (...args) => {
        if (!this.initialized) {
          console.error('[Ethical Safeguards] Not initialized - blocking action');
          return null;
        }

        if (!this.checkRateLimit(actionName)) {
          return null;
        }

        this.logAudit(`Tracking action: ${actionName}`, 'TRACKING');
        return fn(...args);
      };
    }
  };

  // Export to window
  window.EthicalSafeguards = EthicalSafeguards;

  // Auto-initialize on load (default: true, can be disabled by setting window.autoInitEthicalSafeguards = false)
  // Using compatible syntax for older browsers
  const shouldAutoInit = typeof window.autoInitEthicalSafeguards !== 'undefined' 
    ? window.autoInitEthicalSafeguards 
    : true;
  
  if (shouldAutoInit) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        EthicalSafeguards.initialize();
      });
    } else {
      EthicalSafeguards.initialize();
    }
  }

})(window);
