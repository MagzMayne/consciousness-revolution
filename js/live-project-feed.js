// RootIB: RB-20260319142113-2E06227F
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
 * File: live-project-feed.js
 * Declaration ID: IP-153AE604-MLL28ZV4
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Live Project Feed Ticker
 * A stock ticker-style live feed showing recent projects
 * Automatically fetches from projects.json and displays recent additions
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    refreshInterval: 30000, // Refresh every 30 seconds
    animationSpeed: 120, // Pixels per second for scrolling (increased for faster scroll)
    maxProjects: 20, // Maximum number of projects to show in ticker
    autoStart: true
  };

  // Ticker state
  let tickerData = [];
  let tickerRunning = false;
  let scrollPosition = 0;
  let animationFrame = null;

  /**
   * Initialize the ticker
   */
  function init() {
    // Create ticker container if it doesn't exist
    createTickerElement();
    
    // Load initial data
    loadProjectData();
    
    // Start ticker if auto-start is enabled
    if (CONFIG.autoStart) {
      startTicker();
    }
    
    // Set up periodic refresh
    setInterval(loadProjectData, CONFIG.refreshInterval);
  }

  /**
   * Create the ticker HTML element
   */
  function createTickerElement() {
    // Check if ticker already exists
    if (document.getElementById('project-feed-ticker')) {
      return;
    }

    const tickerHTML = `
      <div id="project-feed-ticker" class="project-ticker">
        <div class="ticker-label">
          <span class="ticker-icon">🔴</span>
          <span class="ticker-text">LIVE FEED</span>
        </div>
        <div class="ticker-content-wrapper">
          <div class="ticker-content" id="ticker-content"></div>
        </div>
      </div>
    `;

    // Insert ticker at the top of the body
    const tickerContainer = document.createElement('div');
    tickerContainer.innerHTML = tickerHTML;
    document.body.insertBefore(tickerContainer.firstElementChild, document.body.firstChild);

    // Add CSS
    injectStyles();
  }

  /**
   * Inject ticker styles
   */
  function injectStyles() {
    const styles = `
      .project-ticker {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 45px;
        background: linear-gradient(90deg, 
          rgba(0, 0, 0, 0.95) 0%, 
          rgba(10, 10, 30, 0.95) 50%, 
          rgba(0, 0, 0, 0.95) 100%);
        border-bottom: 2px solid rgba(0, 255, 255, 0.3);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
        z-index: 999999;
        display: flex;
        align-items: center;
        overflow: hidden;
        font-family: 'JetBrains Mono', 'Courier New', monospace;
      }

      .ticker-label {
        flex-shrink: 0;
        padding: 0 15px;
        background: rgba(255, 0, 0, 0.1);
        border-right: 2px solid rgba(0, 255, 255, 0.3);
        height: 100%;
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        font-size: 0.9rem;
        color: #00ffff;
        text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
      }

      .ticker-icon {
        animation: blink 1s infinite;
      }

      @keyframes blink {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0.3; }
      }

      .ticker-content-wrapper {
        flex: 1;
        overflow: hidden;
        position: relative;
      }

      .ticker-content {
        display: flex;
        align-items: center;
        white-space: nowrap;
        padding: 0 20px;
        height: 100%;
      }

      .ticker-item {
        display: inline-flex;
        align-items: center;
        padding: 0 30px;
        color: #ffffff;
        font-size: 0.85rem;
        border-right: 1px solid rgba(0, 255, 255, 0.2);
        transition: all 0.3s ease;
      }

      .ticker-item:hover {
        color: #00ffff;
        text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
        transform: scale(1.05);
        cursor: pointer;
      }

      .ticker-item-icon {
        margin-right: 8px;
        font-size: 1.1rem;
      }

      .ticker-item-title {
        font-weight: 600;
        margin-right: 8px;
      }

      .ticker-item-badge {
        background: rgba(255, 215, 0, 0.2);
        border: 1px solid #ffd700;
        color: #ffd700;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 0.7rem;
        margin-left: 8px;
        font-weight: 700;
      }

      .ticker-item-date {
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.75rem;
        margin-left: 8px;
      }

      /* Mobile responsive */
      @media (max-width: 768px) {
        .project-ticker {
          height: 40px;
        }
        
        .ticker-label {
          padding: 0 10px;
          font-size: 0.8rem;
        }
        
        .ticker-item {
          font-size: 0.75rem;
          padding: 0 15px;
        }
        
        .ticker-item-date {
          display: none;
        }
      }

      /* Adjust body padding to account for fixed ticker */
      body {
        padding-top: 45px !important;
      }

      @media (max-width: 768px) {
        body {
          padding-top: 40px !important;
        }
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  /**
   * Load project data from projects.json
   */
  async function loadProjectData() {
    try {
      const response = await fetch('/projects.json?t=' + Date.now());
      const data = await response.json();
      
      // Get recent HTML projects
      // Sort by lastModified date - NEWEST FIRST (descending order)
      const recentProjects = (data.projects || [])
        .filter(p => p.lastModified)
        .sort((a, b) => {
          // Sort by date descending (newest first)
          const dateA = new Date(a.lastModified);
          const dateB = new Date(b.lastModified);
          return dateB - dateA; // b - a = descending (newest first)
        })
        .slice(0, CONFIG.maxProjects);
      
      // Log for debugging
      if (recentProjects.length > 0) {
        console.log(`[Project Feed] Loaded ${recentProjects.length} projects, newest: "${recentProjects[0].title}" (${recentProjects[0].lastModified})`);
      }
      
      tickerData = recentProjects;
      renderTicker();
      
    } catch (error) {
      console.error('[Project Feed] Error loading project data:', error);
      // Use fallback data
      tickerData = [{
        title: 'Barbrick Design Projects',
        filename: 'index.html',
        category: 'web-app',
        lastModified: new Date().toISOString()
      }];
      renderTicker();
    }
  }

  /**
   * Render ticker content
   */
  function renderTicker() {
    const contentEl = document.getElementById('ticker-content');
    if (!contentEl) return;

    const items = tickerData.map(project => createTickerItem(project)).join('');
    
    // Duplicate content for seamless looping
    contentEl.innerHTML = items + items;
  }

  /**
   * Create a ticker item HTML
   */
  function createTickerItem(project) {
    const icon = getCategoryIcon(project.category);
    const isNew = isRecentProject(project.lastModified);
    const badge = isNew ? '<span class="ticker-item-badge">NEW</span>' : '';
    
    const date = new Date(project.lastModified).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    
    const link = project.path || project.filename;
    
    // Format value display
    const valueDisplay = project.value ? formatValue(project.value) : '';
    const valueSpan = valueDisplay ? `<span class="ticker-item-value" style="color: #4ade80; font-weight: 700; margin-left: 8px;">💰 ${valueDisplay}</span>` : '';
    
    return `
      <div class="ticker-item" onclick="window.location.href='/${link}'">
        <span class="ticker-item-icon">${icon}</span>
        <span class="ticker-item-title">${escapeHtml(project.title)}</span>
        ${badge}
        ${valueSpan}
        <span class="ticker-item-date">${date}</span>
      </div>
    `;
  }
  
  /**
   * Format value as currency
   */
  function formatValue(value) {
    if (value >= 1000000) {
      return '$' + (value / 1000000).toFixed(2) + 'M';
    } else if (value >= 1000) {
      return '$' + (value / 1000).toFixed(1) + 'K';
    }
    return '$' + value.toLocaleString();
  }

  /**
   * Get icon for category
   */
  function getCategoryIcon(category) {
    const icons = {
      'game': '🎮',
      'ai-tool': '🤖',
      'blockchain': '💎',
      'dashboard': '📊',
      'utility': '🛠️',
      '3d-experience': '🌐',
      'marketplace': '💰',
      'web-app': '✨'
    };
    return icons[category] || '📄';
  }

  /**
   * Check if project is recent (within 7 days)
   */
  function isRecentProject(modifiedDate) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return new Date(modifiedDate) > sevenDaysAgo;
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Start ticker animation
   */
  function startTicker() {
    if (tickerRunning) return;
    
    tickerRunning = true;
    animateTicker();
  }

  /**
   * Animate ticker scrolling
   */
  function animateTicker() {
    const contentEl = document.getElementById('ticker-content');
    if (!contentEl) return;

    const scrollWidth = contentEl.scrollWidth / 2; // Half because content is duplicated
    
    scrollPosition += CONFIG.animationSpeed / 60; // 60 FPS
    
    if (scrollPosition >= scrollWidth) {
      scrollPosition = 0;
    }
    
    contentEl.style.transform = `translateX(-${scrollPosition}px)`;
    
    if (tickerRunning) {
      animationFrame = requestAnimationFrame(animateTicker);
    }
  }

  /**
   * Stop ticker animation
   */
  function stopTicker() {
    tickerRunning = false;
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API for external control
  window.ProjectFeedTicker = {
    start: startTicker,
    stop: stopTicker,
    refresh: loadProjectData
  };

})();
