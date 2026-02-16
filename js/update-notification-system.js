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
 * File: update-notification-system.js
 * Declaration ID: IP-5AB83376-MLL28ZV8
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
 * Universal Update Notification System
 * 
 * This module provides a standardized update popup/banner for all HTML pages
 * showing when the page was last updated, by whom, and with what changes.
 * 
 * Usage:
 * 1. Include this script in your HTML file
 * 2. Call UpdateNotificationSystem.init(config) with your update details
 * 
 * Example:
 * UpdateNotificationSystem.init({
 *   version: 'v2026.01.06',
 *   date: 'Jan 6, 2026',
 *   time: '09:30 UTC',
 *   description: 'Added new features and bug fixes',
 *   updatedBy: 'GitHub Copilot',
 *   autoHideDelay: 8000
 * });
 */

const UpdateNotificationSystem = (function() {
  'use strict';

  // Default configuration
  const DEFAULT_CONFIG = {
    version: 'v1.0.0',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + ' UTC',
    description: 'Page updated with latest changes',
    updatedBy: 'System',
    autoHideDelay: 8000, // 8 seconds
    showOnce: false, // If true, only show once per version using localStorage
    storageKey: null // Auto-generated from page URL
  };

  let config = { ...DEFAULT_CONFIG };
  let bannerId = 'universalUpdateBanner';

  /**
   * Initialize the update notification system
   * @param {Object} userConfig - Configuration object
   */
  function init(userConfig = {}) {
    config = { ...DEFAULT_CONFIG, ...userConfig };
    
    // Auto-generate storage key if not provided
    if (!config.storageKey) {
      const pageName = window.location.pathname.split('/').pop() || 'index.html';
      config.storageKey = `update_shown_${pageName}_${config.version}`;
    }

    // Check if we should show the banner
    if (config.showOnce && hasBeenShown()) {
      return;
    }

    // Create and inject the banner
    createBanner();
    showBanner();

    // Mark as shown if configured to show once
    if (config.showOnce) {
      markAsShown();
    }

    // Auto-hide after delay
    if (config.autoHideDelay > 0) {
      setTimeout(() => {
        hideBanner();
      }, config.autoHideDelay);
    }
  }

  /**
   * Check if banner has been shown for this version
   * @returns {boolean}
   */
  function hasBeenShown() {
    try {
      return localStorage.getItem(config.storageKey) === 'true';
    } catch (e) {
      return false;
    }
  }

  /**
   * Mark banner as shown
   */
  function markAsShown() {
    try {
      localStorage.setItem(config.storageKey, 'true');
    } catch (e) {
      console.warn('Could not save update notification state to localStorage');
    }
  }

  /**
   * Create the banner HTML and CSS
   */
  function createBanner() {
    // Check if banner already exists
    if (document.getElementById(bannerId)) {
      return;
    }

    // Inject CSS styles if not already present
    if (!document.getElementById('updateNotificationStyles')) {
      injectStyles();
    }

    // Create banner element
    const banner = document.createElement('div');
    banner.id = bannerId;
    banner.className = 'universal-update-banner';
    banner.innerHTML = `
      <div class="update-banner-content">
        <span class="update-icon">✨</span>
        <div class="update-info">
          <div class="update-main">
            <span class="update-badge">Updated</span>
            <span class="update-description">${escapeHtml(config.description)}</span>
          </div>
          <div class="update-meta">
            <span class="update-date">${escapeHtml(config.date)} ${escapeHtml(config.time)}</span>
            <span class="update-divider">•</span>
            <span class="update-by">by ${escapeHtml(config.updatedBy)}</span>
            ${config.version ? `<span class="update-divider">•</span><span class="update-version">${escapeHtml(config.version)}</span>` : ''}
          </div>
        </div>
        <button class="update-close-btn" aria-label="Close notification">✕</button>
      </div>
    `;

    // Insert at the beginning of body
    if (document.body) {
      document.body.insertBefore(banner, document.body.firstChild);
      // Attach event listener to close button
      const closeBtn = banner.querySelector('.update-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', hideBanner);
      }
    } else {
      // If body not ready, wait for DOMContentLoaded
      document.addEventListener('DOMContentLoaded', () => {
        document.body.insertBefore(banner, document.body.firstChild);
        // Attach event listener to close button
        const closeBtn = banner.querySelector('.update-close-btn');
        if (closeBtn) {
          closeBtn.addEventListener('click', hideBanner);
        }
      });
    }
  }

  /**
   * Inject CSS styles
   */
  function injectStyles() {
    const style = document.createElement('style');
    style.id = 'updateNotificationStyles';
    style.textContent = `
      .universal-update-banner {
        position: fixed;
        top: 64px;
        left: 50%;
        transform: translateX(-50%);
        background: radial-gradient(circle at top, rgba(79, 240, 255, 0.4), transparent 55%),
                    rgba(10, 18, 35, 0.98);
        border-radius: 999px;
        padding: 10px 20px;
        font-size: 12px;
        color: #f9fbff;
        border: 1px solid rgba(79, 240, 255, 0.9);
        box-shadow: 0 0 18px rgba(79, 240, 255, 0.8),
                    0 4px 12px rgba(0, 0, 0, 0.5);
        z-index: 10000;
        display: none;
        opacity: 0;
        animation: slideDown 0.4s ease-out forwards;
        max-width: 90%;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
        backdrop-filter: blur(10px);
      }

      @keyframes slideDown {
        from {
          top: 20px;
          opacity: 0;
        }
        to {
          top: 64px;
          opacity: 1;
        }
      }

      .universal-update-banner.visible {
        display: flex;
      }

      .update-banner-content {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
      }

      .update-icon {
        font-size: 18px;
        animation: pulse 2s infinite;
        flex-shrink: 0;
      }

      @keyframes pulse {
        0%, 100% { 
          transform: scale(1); 
          opacity: 1; 
        }
        50% { 
          transform: scale(1.1); 
          opacity: 0.8; 
        }
      }

      .update-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
      }

      .update-main {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .update-badge {
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #4ff0ff;
        flex-shrink: 0;
      }

      .update-description {
        color: #f9fbff;
        line-height: 1.4;
      }

      .update-meta {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 10px;
        color: #a7b2d9;
        flex-wrap: wrap;
      }

      .update-divider {
        opacity: 0.5;
      }

      .update-date,
      .update-by,
      .update-version {
        white-space: nowrap;
      }

      .update-close-btn {
        background: transparent;
        border: none;
        color: #4ff0ff;
        cursor: pointer;
        font-size: 18px;
        padding: 4px 8px;
        margin-left: 8px;
        transition: transform 0.2s;
        flex-shrink: 0;
        line-height: 1;
      }

      .update-close-btn:hover {
        transform: scale(1.2);
      }

      .update-close-btn:active {
        transform: scale(1);
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .universal-update-banner {
          top: 10px;
          padding: 8px 16px;
          font-size: 11px;
        }

        @keyframes slideDown {
          from {
            top: -50px;
            opacity: 0;
          }
          to {
            top: 10px;
            opacity: 1;
          }
        }

        .update-icon {
          font-size: 16px;
        }

        .update-meta {
          font-size: 9px;
        }
      }

      @media (max-width: 480px) {
        .universal-update-banner {
          border-radius: 16px;
          padding: 8px 12px;
        }

        .update-info {
          gap: 2px;
        }

        .update-main {
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Show the banner
   */
  function showBanner() {
    const banner = document.getElementById(bannerId);
    if (banner) {
      banner.classList.add('visible');
    }
  }

  /**
   * Hide the banner with animation
   */
  function hideBanner() {
    const banner = document.getElementById(bannerId);
    if (banner) {
      banner.style.opacity = '0';
      banner.style.transform = 'translateX(-50%) translateY(-20px)';
      banner.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
      setTimeout(() => {
        banner.classList.remove('visible');
        banner.style.display = 'none';
      }, 300);
    }
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text
   * @returns {string}
   */
  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, (char) => map[char]);
  }

  /**
   * Manually trigger banner display (useful for testing)
   */
  function showManually(userConfig = {}) {
    config = { ...DEFAULT_CONFIG, ...userConfig };
    createBanner();
    showBanner();
  }

  // Public API
  return {
    init,
    showBanner,
    hideBanner,
    showManually,
    getConfig: () => ({ ...config })
  };
})();

// Make it globally available
if (typeof window !== 'undefined') {
  window.UpdateNotificationSystem = UpdateNotificationSystem;
}
