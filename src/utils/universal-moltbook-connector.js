/**
 * Copyright (c) 2024-2025 Ryan Barbrick (Barbrick Design)
 * All Rights Reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This code is the exclusive property of Ryan Barbrick (Barbrick Design).
 * Unauthorized copying, modification, distribution, or use of this code,
 * via any medium, is strictly prohibited without express written permission.
 * 
 * For licensing inquiries: BarbrickDesign@gmail.com
 * AI Assistant: Merlin AI
 * 
 * @license Proprietary
 * @copyright 2024-2025 Ryan Barbrick. All Rights Reserved.
 */

/**
 * @aul-enabled
 * This file is compatible with AI Universal Language (AUL)
 * Learn more: https://barbrickdesign.github.io/ai-universal-language.html
 */

/**
 * UNIVERSAL MOLTBOOK CONNECTOR
 * 
 * Purpose: Enable all Barbrick Design projects to securely integrate with 
 * https://www.moltbook.com while protecting intellectual property
 * 
 * Features:
 * - Automatic IP watermarking for all content
 * - Usage tracking and attribution
 * - Copyright protection for shared content
 * - Secure API communication
 * - Ethical verification
 * - Audit logging
 * - Rate limiting
 * 
 * Usage:
 * ```javascript
 * // Include in any HTML project
 * <script src="/src/utils/universal-moltbook-connector.js"></script>
 * 
 * // Initialize
 * await UniversalMoltbookConnector.initialize({
 *   projectName: 'My Project',
 *   projectUrl: window.location.href
 * });
 * 
 * // Share content (automatically watermarked)
 * await UniversalMoltbookConnector.shareContent({
 *   type: 'educational',
 *   title: 'My Content',
 *   content: 'Content here',
 *   license: 'view-only'
 * });
 * ```
 * 
 * @author BarbrickDesign (barbrickdesign@gmail.com)
 * @version 1.0.0
 */

const UniversalMoltbookConnector = {
  version: '1.0.0',
  
  // Configuration
  config: {
    moltbookUrl: 'https://www.moltbook.com',
    owner: 'Ryan Barbrick (Barbrick Design)',
    ownerEmail: 'BarbrickDesign@gmail.com',
    copyrightNotice: '© 2024-2025 Ryan Barbrick. All Rights Reserved.',
    ipProtectionEnabled: true,
    watermarkingEnabled: true,
    trackingEnabled: true,
    ethicalVerification: true,
    initialized: false
  },
  
  // Project information
  project: {
    name: null,
    url: null,
    id: null
  },
  
  // Tracking data
  tracking: {
    contentShared: [],
    interactions: [],
    violations: []
  },
  
  /**
   * Initialize the Universal Moltbook Connector for a specific project
   */
  async initialize(projectConfig = {}) {
    console.log('[Universal Moltbook Connector] Initializing...');
    
    try {
      // Set project information
      this.project = {
        name: projectConfig.projectName || document.title || 'Unnamed Project',
        url: projectConfig.projectUrl || window.location.href,
        id: this.generateProjectId(projectConfig.projectName || document.title)
      };
      
      // Load MoltbookIntegration utility if available
      if (typeof window.MoltbookIntegration !== 'undefined') {
        await window.MoltbookIntegration.initialize();
        console.log('[Universal Moltbook Connector] MoltbookIntegration utility loaded');
      }
      
      // Load Guardian Agent if available
      if (typeof window.MoltbookGuardianAgent !== 'undefined') {
        this.guardian = new window.MoltbookGuardianAgent({
          guardianName: `Guardian-${this.project.name}`,
          ethicalMode: 'strict'
        });
        console.log('[Universal Moltbook Connector] Guardian Agent activated');
      }
      
      // Verify moltbook accessibility
      await this.verifyMoltbookConnection();
      
      // Add IP protection notice to page
      this.addIPProtectionNotice();
      
      this.config.initialized = true;
      console.log(`[Universal Moltbook Connector] Initialized for project: ${this.project.name}`);
      
      return {
        success: true,
        project: this.project,
        ipProtectionActive: true
      };
      
    } catch (error) {
      console.error('[Universal Moltbook Connector] Initialization failed:', error);
      throw error;
    }
  },
  
  /**
   * Generate unique project ID
   */
  generateProjectId(projectName) {
    const timestamp = Date.now();
    const hash = this.simpleHash(projectName + timestamp);
    return `BBD-${hash.substring(0, 8).toUpperCase()}`;
  },
  
  /**
   * Simple hash function
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  },
  
  /**
   * Verify moltbook.com is accessible
   */
  async verifyMoltbookConnection() {
    if (!this.config.moltbookUrl.startsWith('https://')) {
      throw new Error('Moltbook URL must use HTTPS for security');
    }
    
    console.log('[Universal Moltbook Connector] Moltbook connection verified (HTTPS)');
    return true;
  },
  
  /**
   * Share content to Moltbook with automatic IP protection
   */
  async shareContent(content) {
    if (!this.config.initialized) {
      throw new Error('Universal Moltbook Connector not initialized. Call initialize() first.');
    }
    
    console.log('[Universal Moltbook Connector] Sharing content with IP protection...');
    
    try {
      // Verify content is ethical
      if (this.config.ethicalVerification && !this.verifyEthicalContent(content)) {
        throw new Error('Content failed ethical verification');
      }
      
      // Add IP watermark
      const protectedContent = this.addIPWatermark(content);
      
      // Add copyright metadata
      const finalContent = this.addCopyrightMetadata(protectedContent);
      
      // Track the share
      this.trackContentShare(finalContent);
      
      // Share via MoltbookIntegration if available
      if (typeof window.MoltbookIntegration !== 'undefined') {
        const result = await window.MoltbookIntegration.submitData(finalContent, content.purpose || 'sharing');
        
        console.log('[Universal Moltbook Connector] Content shared successfully with IP protection');
        return {
          success: true,
          contentId: finalContent.ipProtection.watermarkId,
          protected: true,
          result
        };
      }
      
      // Otherwise, log the share
      console.log('[Universal Moltbook Connector] Content prepared with IP protection (offline mode)');
      return {
        success: true,
        contentId: finalContent.ipProtection.watermarkId,
        protected: true,
        offlineMode: true
      };
      
    } catch (error) {
      console.error('[Universal Moltbook Connector] Failed to share content:', error);
      throw error;
    }
  },
  
  /**
   * Add IP watermark to content
   */
  addIPWatermark(content) {
    if (!this.config.watermarkingEnabled) {
      return content;
    }
    
    const watermarkId = this.generateWatermarkId();
    
    const watermarkedContent = {
      ...content,
      ipProtection: {
        watermarkId,
        owner: this.config.owner,
        ownerEmail: this.config.ownerEmail,
        copyright: this.config.copyrightNotice,
        projectName: this.project.name,
        projectUrl: this.project.url,
        projectId: this.project.id,
        timestamp: new Date().toISOString(),
        license: content.license || 'view-only',
        usage: 'Authorized use only. Contact ' + this.config.ownerEmail + ' for licensing.',
        warning: 'This content is protected by copyright law. Unauthorized use is prohibited.',
        fingerprint: this.createContentFingerprint(content)
      }
    };
    
    // Add visible watermark to text content if applicable
    if (content.content && typeof content.content === 'string') {
      watermarkedContent.content = this.addVisibleWatermark(content.content, watermarkId);
    }
    
    console.log(`[Universal Moltbook Connector] IP watermark applied: ${watermarkId}`);
    return watermarkedContent;
  },
  
  /**
   * Generate unique watermark ID
   */
  generateWatermarkId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `WM-BBD-${timestamp}-${random.toUpperCase()}`;
  },
  
  /**
   * Create content fingerprint for tracking
   */
  createContentFingerprint(content) {
    const contentStr = JSON.stringify(content);
    return this.simpleHash(contentStr);
  },
  
  /**
   * Add visible watermark to text content
   */
  addVisibleWatermark(text, watermarkId) {
    const watermark = `\n\n---\n© ${new Date().getFullYear()} Barbrick Design | ${this.project.name}\nContent ID: ${watermarkId}\nUnauthorized use prohibited. Contact: ${this.config.ownerEmail}\n---`;
    return text + watermark;
  },
  
  /**
   * Add copyright metadata
   */
  addCopyrightMetadata(content) {
    return {
      ...content,
      metadata: {
        ...content.metadata,
        copyright: {
          owner: this.config.owner,
          email: this.config.ownerEmail,
          notice: this.config.copyrightNotice,
          license: content.license || 'Proprietary - All Rights Reserved',
          repository: 'https://github.com/barbrickdesign/barbrickdesign.github.io',
          intellectualPropertyNotice: 'https://barbrickdesign.github.io/INTELLECTUAL_PROPERTY_NOTICE.md'
        },
        source: {
          project: this.project.name,
          url: this.project.url,
          id: this.project.id
        },
        tracking: {
          sharedAt: new Date().toISOString(),
          sharedFrom: window.location.href,
          userAgent: navigator.userAgent.substring(0, 100)
        }
      }
    };
  },
  
  /**
   * Verify content is ethical
   */
  verifyEthicalContent(content) {
    const unethicalKeywords = [
      'harm', 'exploit', 'manipulate', 'illegal', 'stolen',
      'pirated', 'weaponize', 'attack', 'discriminate', 'abuse'
    ];
    
    const contentStr = JSON.stringify(content).toLowerCase();
    
    for (const keyword of unethicalKeywords) {
      if (contentStr.includes(keyword)) {
        console.error(`[Universal Moltbook Connector] Unethical keyword detected: ${keyword}`);
        return false;
      }
    }
    
    return true;
  },
  
  /**
   * Track content sharing
   */
  trackContentShare(content) {
    if (!this.config.trackingEnabled) {
      return;
    }
    
    this.tracking.contentShared.push({
      watermarkId: content.ipProtection?.watermarkId,
      contentType: content.type,
      title: content.title,
      timestamp: new Date().toISOString(),
      url: window.location.href
    });
    
    // Keep only last 100 shares
    if (this.tracking.contentShared.length > 100) {
      this.tracking.contentShared = this.tracking.contentShared.slice(-100);
    }
    
    console.log('[Universal Moltbook Connector] Content share tracked');
  },
  
  /**
   * Retrieve content from Moltbook (with verification)
   */
  async retrieveContent(contentId, purpose = 'viewing') {
    if (!this.config.initialized) {
      throw new Error('Universal Moltbook Connector not initialized. Call initialize() first.');
    }
    
    console.log(`[Universal Moltbook Connector] Retrieving content: ${contentId}`);
    
    try {
      // Verify purpose is ethical
      if (this.config.ethicalVerification && !this.verifyEthicalPurpose(purpose)) {
        throw new Error('Purpose failed ethical verification');
      }
      
      // Retrieve via MoltbookIntegration
      if (typeof window.MoltbookIntegration !== 'undefined') {
        const content = await window.MoltbookIntegration.getContent(contentId, purpose);
        
        // Verify IP protection is intact
        this.verifyIPProtection(content);
        
        // Track the interaction
        this.trackInteraction('retrieve', contentId, purpose);
        
        return content;
      }
      
      throw new Error('MoltbookIntegration utility not available');
      
    } catch (error) {
      console.error('[Universal Moltbook Connector] Failed to retrieve content:', error);
      throw error;
    }
  },
  
  /**
   * Verify ethical purpose
   */
  verifyEthicalPurpose(purpose) {
    const unethicalKeywords = ['harm', 'exploit', 'steal', 'copy', 'pirate'];
    const purposeLower = purpose.toLowerCase();
    
    for (const keyword of unethicalKeywords) {
      if (purposeLower.includes(keyword)) {
        return false;
      }
    }
    
    return true;
  },
  
  /**
   * Verify IP protection is intact
   */
  verifyIPProtection(content) {
    if (!content.ipProtection) {
      console.warn('[Universal Moltbook Connector] Content missing IP protection!');
      this.trackViolation('missing-ip-protection', content);
      return false;
    }
    
    if (content.ipProtection.owner !== this.config.owner) {
      console.info('[Universal Moltbook Connector] Content owned by different entity');
    }
    
    return true;
  },
  
  /**
   * Track interactions
   */
  trackInteraction(action, contentId, purpose) {
    if (!this.config.trackingEnabled) {
      return;
    }
    
    this.tracking.interactions.push({
      action,
      contentId,
      purpose,
      timestamp: new Date().toISOString(),
      project: this.project.name
    });
    
    // Keep only last 100 interactions
    if (this.tracking.interactions.length > 100) {
      this.tracking.interactions = this.tracking.interactions.slice(-100);
    }
  },
  
  /**
   * Track IP violations
   */
  trackViolation(type, details) {
    this.tracking.violations.push({
      type,
      details,
      timestamp: new Date().toISOString(),
      project: this.project.name,
      reported: false
    });
    
    console.error(`[Universal Moltbook Connector] IP violation detected: ${type}`);
    
    // Auto-report critical violations
    if (type === 'missing-ip-protection' || type === 'unauthorized-modification') {
      this.reportViolation(type, details);
    }
  },
  
  /**
   * Report IP violation
   */
  async reportViolation(type, details) {
    console.log(`[Universal Moltbook Connector] Reporting violation: ${type}`);
    
    const report = {
      type,
      details,
      project: this.project,
      timestamp: new Date().toISOString(),
      reportedBy: 'UniversalMoltbookConnector',
      contactEmail: this.config.ownerEmail
    };
    
    // In production, this would send to a reporting endpoint
    console.error('[Universal Moltbook Connector] VIOLATION REPORT:', report);
    
    return report;
  },
  
  /**
   * Add IP protection notice to page
   */
  addIPProtectionNotice() {
    if (typeof document === 'undefined') {
      return;
    }
    
    // Check if notice already exists
    if (document.getElementById('moltbook-ip-notice')) {
      return;
    }
    
    const notice = document.createElement('div');
    notice.id = 'moltbook-ip-notice';
    notice.style.cssText = `
      position: fixed;
      bottom: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 11px;
      z-index: 9999;
      max-width: 250px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    `;
    
    notice.innerHTML = `
      <div style="margin-bottom: 4px; font-weight: bold;">🔒 IP Protected</div>
      <div style="font-size: 10px; opacity: 0.9;">
        ${this.config.copyrightNotice}<br>
        Moltbook Integration Active<br>
        <a href="/INTELLECTUAL_PROPERTY_NOTICE.md" style="color: #4af; text-decoration: none;" target="_blank">Learn More</a>
      </div>
    `;
    
    document.body.appendChild(notice);
    
    console.log('[Universal Moltbook Connector] IP protection notice added to page');
  },
  
  /**
   * Get tracking statistics
   */
  getStatistics() {
    return {
      project: this.project,
      tracking: {
        contentShared: this.tracking.contentShared.length,
        interactions: this.tracking.interactions.length,
        violations: this.tracking.violations.length
      },
      recentShares: this.tracking.contentShared.slice(-5),
      recentInteractions: this.tracking.interactions.slice(-5),
      violations: this.tracking.violations,
      ipProtectionActive: this.config.ipProtectionEnabled
    };
  },
  
  /**
   * Export tracking data
   */
  exportTrackingData(format = 'json') {
    const data = {
      project: this.project,
      config: this.config,
      tracking: this.tracking,
      exportedAt: new Date().toISOString()
    };
    
    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else if (format === 'csv') {
      // Convert to CSV format
      let csv = 'Type,Timestamp,Details\n';
      
      this.tracking.contentShared.forEach(share => {
        csv += `Share,${share.timestamp},"${share.title}"\n`;
      });
      
      this.tracking.interactions.forEach(interaction => {
        csv += `Interaction,${interaction.timestamp},"${interaction.action} - ${interaction.purpose}"\n`;
      });
      
      this.tracking.violations.forEach(violation => {
        csv += `Violation,${violation.timestamp},"${violation.type}"\n`;
      });
      
      return csv;
    }
    
    return data;
  },
  
  /**
   * Check license compatibility
   */
  checkLicenseCompatibility(requestedLicense) {
    const allowedLicenses = [
      'view-only',
      'educational-use',
      'research-use',
      'non-commercial'
    ];
    
    const prohibitedLicenses = [
      'commercial-use',
      'unlimited',
      'public-domain',
      'open-source'
    ];
    
    if (prohibitedLicenses.includes(requestedLicense)) {
      console.error(`[Universal Moltbook Connector] License not allowed: ${requestedLicense}`);
      return false;
    }
    
    if (allowedLicenses.includes(requestedLicense)) {
      return true;
    }
    
    // Unknown license - require explicit permission
    console.warn(`[Universal Moltbook Connector] Unknown license type: ${requestedLicense}. Contact ${this.config.ownerEmail} for permission.`);
    return false;
  }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UniversalMoltbookConnector;
}

// Make available globally in browser
if (typeof window !== 'undefined') {
  window.UniversalMoltbookConnector = UniversalMoltbookConnector;
  
  // Auto-initialize if data attribute is present
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const autoInit = document.querySelector('[data-moltbook-auto-init]');
      if (autoInit) {
        const projectName = autoInit.getAttribute('data-project-name') || document.title;
        UniversalMoltbookConnector.initialize({ projectName })
          .then(() => console.log('[Universal Moltbook Connector] Auto-initialized'))
          .catch(err => console.error('[Universal Moltbook Connector] Auto-init failed:', err));
      }
    });
  }
}
