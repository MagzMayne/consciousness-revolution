// RootIB: RB-20260319142113-F97BFFC9
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
 * File: update-helper.js
 * Declaration ID: IP-7B3AD785-MLL28ZV8
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
 * Update Helper - Automatically populate update information from Git
 * 
 * This module fetches the last commit information for the current page
 * and initializes the UpdateNotificationSystem with that data.
 * 
 * Usage:
 * Simply include this script after update-notification-system.js
 * It will automatically initialize with Git commit data.
 */

(function() {
  'use strict';

  // Configuration
  const AUTO_INIT = true; // Set to false to disable auto-initialization
  const FALLBACK_CONFIG = {
    version: 'v2026.01.06',
    date: 'Jan 6, 2026',
    time: '09:30 UTC',
    description: 'Page updated with latest improvements',
    updatedBy: 'GitHub Copilot',
    autoHideDelay: 8000,
    showOnce: true
  };

  /**
   * Get current page name
   */
  function getCurrentPageName() {
    const pathname = window.location.pathname;
    const pageName = pathname.split('/').pop() || 'index.html';
    return pageName;
  }

  /**
   * Format date to readable string
   */
  function formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch (e) {
      return dateString;
    }
  }

  /**
   * Format time to readable string
   */
  function formatTime(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'UTC'
      }) + ' UTC';
    } catch (e) {
      return '';
    }
  }

  /**
   * Extract version from commit message
   * Looks for version patterns like v1.0.0, version 1.0.0, etc.
   * Supports both semantic versioning (x.y.z) and two-part versions (x.y)
   */
  function extractVersion(commitMessage) {
    // Try semantic versioning first (x.y.z)
    let versionPattern = /v?\d+\.\d+\.\d+/i;
    let match = commitMessage.match(versionPattern);
    
    // Fall back to two-part version (x.y)
    if (!match) {
      versionPattern = /v?\d+\.\d+/i;
      match = commitMessage.match(versionPattern);
    }
    
    if (match) {
      return match[0].startsWith('v') || match[0].startsWith('V') ? match[0] : 'v' + match[0];
    }
    return null;
  }

  /**
   * Try to fetch Git information from meta tags
   * Pages can include meta tags with Git info for the update system
   * Example:
   * <meta name="git-commit-hash" content="abc123">
   * <meta name="git-commit-date" content="2026-01-06T09:30:00Z">
   * <meta name="git-commit-author" content="John Doe">
   * <meta name="git-commit-message" content="Updated feature X">
   */
  function getGitInfoFromMeta() {
    const hash = document.querySelector('meta[name="git-commit-hash"]')?.content;
    const date = document.querySelector('meta[name="git-commit-date"]')?.content;
    const author = document.querySelector('meta[name="git-commit-author"]')?.content;
    const message = document.querySelector('meta[name="git-commit-message"]')?.content;

    if (date && author && message) {
      return {
        hash,
        date,
        author,
        message
      };
    }
    return null;
  }

  /**
   * Try to fetch Git information from a data attribute on the body tag
   * Example: <body data-last-update='{"date":"2026-01-06","author":"John","message":"Update"}'>
   */
  function getGitInfoFromBody() {
    try {
      const updateData = document.body.getAttribute('data-last-update');
      if (updateData) {
        return JSON.parse(updateData);
      }
    } catch (e) {
      console.warn('Could not parse data-last-update attribute');
    }
    return null;
  }

  /**
   * Initialize the update notification system
   */
  function initializeUpdateNotification() {
    // Check if UpdateNotificationSystem is available
    if (typeof UpdateNotificationSystem === 'undefined') {
      console.error('UpdateNotificationSystem not loaded. Please include update-notification-system.js first.');
      return;
    }

    // Try to get Git info from various sources
    let gitInfo = getGitInfoFromMeta() || getGitInfoFromBody();

    let config;
    if (gitInfo) {
      // Build config from Git info
      config = {
        date: formatDate(gitInfo.date),
        time: formatTime(gitInfo.date),
        description: gitInfo.message || 'Page updated',
        updatedBy: gitInfo.author || 'Developer',
        version: extractVersion(gitInfo.message || '') || FALLBACK_CONFIG.version,
        autoHideDelay: 8000,
        showOnce: true
      };
    } else {
      // Use fallback config with page-specific description
      const pageName = getCurrentPageName();
      config = {
        ...FALLBACK_CONFIG,
        description: `${pageName.replace('.html', '')} page updated with latest improvements`
      };
    }

    // Initialize the system
    UpdateNotificationSystem.init(config);
  }

  // Auto-initialize on page load
  if (AUTO_INIT) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeUpdateNotification);
    } else {
      // DOM already loaded
      initializeUpdateNotification();
    }
  }

  // Make functions available globally for manual initialization
  window.UpdateHelper = {
    init: initializeUpdateNotification,
    getGitInfoFromMeta,
    getGitInfoFromBody,
    formatDate,
    formatTime
  };
})();
