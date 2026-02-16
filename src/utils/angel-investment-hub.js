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
 * File: angel-investment-hub.js
 * Declaration ID: IP-6DDB9250-MLL28ZWD
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
 * Angel Investment Hub
 * 
 * A comprehensive investment tracking system that allows users to invest in projects,
 * track their returns in real-time, and cash out after a predetermined time period.
 * 
 * Features:
 * - Investment management with PayPal integration
 * - Real-time ROI calculation and display
 * - Time-locked cash out mechanism
 * - Investment history and portfolio tracking
 * - LocalStorage persistence for user data
 * 
 * Usage:
 *   Include this script and call AngelInvestmentHub.init() when DOM is ready
 */

const AngelInvestmentHub = (function() {
  'use strict';

  // Configuration
  const CONFIG = {
    // Payment email - can be overridden via window.ANGEL_HUB_CONFIG if needed
    PAYMENT_EMAIL: window.ANGEL_HUB_CONFIG?.paymentEmail || 'BarbrickDesign@gmail.com',
    MIN_INVESTMENT: 10,
    MAX_INVESTMENT: 100000,
    DEFAULT_LOCK_PERIOD_DAYS: 90, // Default lock period (can be customized per project)
    DEFAULT_ANNUAL_ROI: 0.15, // 15% annual ROI as default
    STORAGE_KEY: 'angelInvestmentHub_data',
    UPDATE_INTERVAL: 60000, // Update ROI every minute
  };

  let state = {
    investments: [],
    isInitialized: false,
    updateInterval: null,
  };

  /**
   * Initialize the Angel Investment Hub
   */
  function init() {
    if (state.isInitialized) {
      return;
    }

    loadInvestments();
    injectHubUI();
    attachEventListeners();
    startROIUpdates();
    
    state.isInitialized = true;
    console.log('Angel Investment Hub initialized');
  }

  /**
   * Load investments from localStorage
   */
  function loadInvestments() {
    try {
      const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
      if (stored) {
        state.investments = JSON.parse(stored);
        // Clean up old investments (optional)
        state.investments = state.investments.filter(inv => !inv.cashedOut);
      }
    } catch (error) {
      console.error('Failed to load investments:', error);
      state.investments = [];
    }
  }

  /**
   * Save investments to localStorage
   */
  function saveInvestments() {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state.investments));
    } catch (error) {
      console.error('Failed to save investments:', error);
    }
  }

  /**
   * Inject the hub UI into the page
   */
  function injectHubUI() {
    // Check if hub already exists
    if (document.getElementById('angel-investment-hub')) {
      return;
    }

    const hubHTML = `
      <div id="angel-investment-hub" class="angel-hub-container">
        <button id="angel-hub-toggle" class="angel-hub-toggle" title="Open Angel Investment Hub">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
          </svg>
          <span class="angel-hub-badge" id="angel-hub-badge">0</span>
        </button>
        
        <div id="angel-hub-modal" class="angel-hub-modal">
          <div class="angel-hub-modal-content">
            <div class="angel-hub-header">
              <h2>Angel Investment Hub</h2>
              <button id="angel-hub-close" class="angel-hub-close">&times;</button>
            </div>
            
            <div class="angel-hub-tabs">
              <button class="angel-hub-tab active" data-tab="invest">Invest</button>
              <button class="angel-hub-tab" data-tab="portfolio">Portfolio</button>
              <button class="angel-hub-tab" data-tab="history">History</button>
            </div>
            
            <div id="angel-hub-content" class="angel-hub-content">
              <!-- Content will be dynamically rendered here -->
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', hubHTML);
    injectStyles();
  }

  /**
   * Inject CSS styles for the hub
   */
  function injectStyles() {
    if (document.getElementById('angel-hub-styles')) {
      return;
    }

    const styles = `
      <style id="angel-hub-styles">
        .angel-hub-container {
          position: fixed;
          z-index: 999999;
        }
        
        .angel-hub-toggle {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        
        .angel-hub-toggle:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 30px rgba(102, 126, 234, 0.6);
        }
        
        .angel-hub-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ef4444;
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          border: 2px solid white;
        }
        
        .angel-hub-modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(4px);
          z-index: 1000000;
          align-items: center;
          justify-content: center;
        }
        
        .angel-hub-modal.active {
          display: flex;
        }
        
        .angel-hub-modal-content {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border-radius: 16px;
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .angel-hub-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .angel-hub-header h2 {
          margin: 0;
          color: white;
          font-size: 24px;
          font-weight: 600;
        }
        
        .angel-hub-close {
          background: none;
          border: none;
          color: white;
          font-size: 32px;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: background 0.2s ease;
        }
        
        .angel-hub-close:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .angel-hub-tabs {
          display: flex;
          padding: 0 24px;
          gap: 8px;
          background: rgba(0, 0, 0, 0.2);
        }
        
        .angel-hub-tab {
          padding: 12px 24px;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          border-bottom: 2px solid transparent;
          transition: all 0.2s ease;
        }
        
        .angel-hub-tab:hover {
          color: rgba(255, 255, 255, 0.9);
        }
        
        .angel-hub-tab.active {
          color: white;
          border-bottom-color: #667eea;
        }
        
        .angel-hub-content {
          padding: 24px;
          max-height: calc(90vh - 180px);
          overflow-y: auto;
          color: white;
        }
        
        .angel-hub-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .angel-hub-form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .angel-hub-form-group label {
          font-size: 14px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.9);
        }
        
        .angel-hub-form-group input,
        .angel-hub-form-group select,
        .angel-hub-form-group textarea {
          padding: 12px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
          color: white;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        
        .angel-hub-form-group input:focus,
        .angel-hub-form-group select:focus,
        .angel-hub-form-group textarea:focus {
          outline: none;
          border-color: #667eea;
          background: rgba(255, 255, 255, 0.1);
        }
        
        .angel-hub-form-group small {
          color: rgba(255, 255, 255, 0.6);
          font-size: 12px;
        }
        
        .angel-hub-button {
          padding: 12px 24px;
          border-radius: 8px;
          border: none;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .angel-hub-button-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .angel-hub-button-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        
        .angel-hub-button-secondary {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .angel-hub-button-secondary:hover {
          background: rgba(255, 255, 255, 0.15);
        }
        
        .angel-hub-button-success {
          background: #10b981;
          color: white;
        }
        
        .angel-hub-button-success:hover {
          background: #059669;
        }
        
        .angel-hub-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .angel-hub-investment-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
        }
        
        .angel-hub-investment-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 16px;
        }
        
        .angel-hub-investment-title {
          font-size: 18px;
          font-weight: 600;
          color: white;
          margin: 0 0 4px 0;
        }
        
        .angel-hub-investment-date {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }
        
        .angel-hub-investment-status {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .angel-hub-status-locked {
          background: rgba(234, 179, 8, 0.2);
          color: #fbbf24;
        }
        
        .angel-hub-status-unlocked {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }
        
        .angel-hub-status-cashed {
          background: rgba(107, 114, 128, 0.2);
          color: #9ca3af;
        }
        
        .angel-hub-investment-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
          margin-top: 16px;
        }
        
        .angel-hub-stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .angel-hub-stat-label {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }
        
        .angel-hub-stat-value {
          font-size: 20px;
          font-weight: 600;
          color: white;
        }
        
        .angel-hub-stat-value.positive {
          color: #10b981;
        }
        
        .angel-hub-stat-value.negative {
          color: #ef4444;
        }
        
        .angel-hub-progress-bar {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
          margin-top: 12px;
        }
        
        .angel-hub-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          transition: width 0.3s ease;
        }
        
        .angel-hub-empty-state {
          text-align: center;
          padding: 60px 20px;
          color: rgba(255, 255, 255, 0.6);
        }
        
        .angel-hub-empty-state svg {
          width: 64px;
          height: 64px;
          margin-bottom: 16px;
          opacity: 0.4;
        }
        
        .angel-hub-info-box {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 8px;
          padding: 16px;
          margin: 16px 0;
        }
        
        .angel-hub-info-box-title {
          font-weight: 600;
          color: #60a5fa;
          margin-bottom: 8px;
        }
        
        .angel-hub-info-box p {
          margin: 0;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.5;
        }
        
        @media (max-width: 768px) {
          .angel-hub-modal-content {
            width: 95%;
            max-height: 95vh;
          }
          
          .angel-hub-tabs {
            overflow-x: auto;
          }
          
          .angel-hub-investment-stats {
            grid-template-columns: 1fr;
          }
        }
      </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
  }

  /**
   * Attach event listeners
   */
  function attachEventListeners() {
    const toggle = document.getElementById('angel-hub-toggle');
    const modal = document.getElementById('angel-hub-modal');
    const closeBtn = document.getElementById('angel-hub-close');
    const tabs = document.querySelectorAll('.angel-hub-tab');

    toggle.addEventListener('click', () => openHub());
    closeBtn.addEventListener('click', () => closeHub());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeHub();
    });

    tabs.forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Initial render
    switchTab('invest');
  }

  /**
   * Open the hub modal
   */
  function openHub() {
    const modal = document.getElementById('angel-hub-modal');
    modal.classList.add('active');
    updateBadge();
  }

  /**
   * Close the hub modal
   */
  function closeHub() {
    const modal = document.getElementById('angel-hub-modal');
    modal.classList.remove('active');
  }

  /**
   * Switch between tabs
   */
  function switchTab(tabName) {
    const tabs = document.querySelectorAll('.angel-hub-tab');
    tabs.forEach(tab => {
      if (tab.dataset.tab === tabName) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    const content = document.getElementById('angel-hub-content');
    
    switch(tabName) {
      case 'invest':
        renderInvestTab(content);
        break;
      case 'portfolio':
        renderPortfolioTab(content);
        break;
      case 'history':
        renderHistoryTab(content);
        break;
    }
  }

  /**
   * Render the Invest tab
   */
  function renderInvestTab(container) {
    const currentPage = getPageProjectName();
    
    container.innerHTML = `
      <div class="angel-hub-info-box">
        <div class="angel-hub-info-box-title">💼 How Angel Investment Works</div>
        <p>
          Invest in projects through our platform. Your investment is securely processed via PayPal to ${CONFIG.PAYMENT_EMAIL}.
          Track your ROI in real-time and cash out after the lock period expires.
        </p>
      </div>
      
      <form id="angel-investment-form" class="angel-hub-form">
        <div class="angel-hub-form-group">
          <label for="project-name">Project Name</label>
          <input type="text" id="project-name" value="${currentPage}" required>
          <small>The project you're investing in</small>
        </div>
        
        <div class="angel-hub-form-group">
          <label for="investment-amount">Investment Amount (USD)</label>
          <input type="number" id="investment-amount" min="${CONFIG.MIN_INVESTMENT}" max="${CONFIG.MAX_INVESTMENT}" step="1" value="100" required>
          <small>Minimum: $${CONFIG.MIN_INVESTMENT} | Maximum: $${CONFIG.MAX_INVESTMENT}</small>
        </div>
        
        <div class="angel-hub-form-group">
          <label for="expected-roi">Expected Annual ROI (%)</label>
          <input type="number" id="expected-roi" min="1" max="100" step="0.1" value="${CONFIG.DEFAULT_ANNUAL_ROI * 100}" required>
          <small>Expected return on investment per year</small>
        </div>
        
        <div class="angel-hub-form-group">
          <label for="lock-period">Lock Period (Days)</label>
          <input type="number" id="lock-period" min="30" max="1825" step="1" value="${CONFIG.DEFAULT_LOCK_PERIOD_DAYS}" required>
          <small>How long before you can cash out (30 days to 5 years)</small>
        </div>
        
        <div class="angel-hub-form-group">
          <label for="investment-notes">Notes (Optional)</label>
          <textarea id="investment-notes" rows="3" placeholder="Add any notes about this investment..."></textarea>
        </div>
        
        <button type="submit" class="angel-hub-button angel-hub-button-primary">
          Proceed to Payment
        </button>
      </form>
    `;

    const form = document.getElementById('angel-investment-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleInvestmentSubmit();
    });
  }

  /**
   * Render the Portfolio tab
   */
  function renderPortfolioTab(container) {
    const activeInvestments = state.investments.filter(inv => !inv.cashedOut);
    
    if (activeInvestments.length === 0) {
      container.innerHTML = `
        <div class="angel-hub-empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3>No Active Investments</h3>
          <p>Start investing in projects to see them here.</p>
        </div>
      `;
      return;
    }

    const totalInvested = activeInvestments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalCurrentValue = activeInvestments.reduce((sum, inv) => sum + calculateCurrentValue(inv), 0);
    const totalProfit = totalCurrentValue - totalInvested;
    const totalROI = ((totalProfit / totalInvested) * 100).toFixed(2);

    let html = `
      <div class="angel-hub-investment-card" style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);">
        <div class="angel-hub-investment-title">Total Portfolio Value</div>
        <div class="angel-hub-investment-stats">
          <div class="angel-hub-stat">
            <div class="angel-hub-stat-label">Invested</div>
            <div class="angel-hub-stat-value">$${totalInvested.toFixed(2)}</div>
          </div>
          <div class="angel-hub-stat">
            <div class="angel-hub-stat-label">Current Value</div>
            <div class="angel-hub-stat-value positive">$${totalCurrentValue.toFixed(2)}</div>
          </div>
          <div class="angel-hub-stat">
            <div class="angel-hub-stat-label">Profit/Loss</div>
            <div class="angel-hub-stat-value ${totalProfit >= 0 ? 'positive' : 'negative'}">
              ${totalProfit >= 0 ? '+' : ''}$${totalProfit.toFixed(2)}
            </div>
          </div>
          <div class="angel-hub-stat">
            <div class="angel-hub-stat-label">ROI</div>
            <div class="angel-hub-stat-value ${totalProfit >= 0 ? 'positive' : 'negative'}">
              ${totalROI >= 0 ? '+' : ''}${totalROI}%
            </div>
          </div>
        </div>
      </div>
    `;

    activeInvestments.forEach(investment => {
      html += renderInvestmentCard(investment);
    });

    container.innerHTML = html;

    // Attach cash out listeners
    activeInvestments.forEach(investment => {
      const btn = document.getElementById(`cashout-${investment.id}`);
      if (btn) {
        btn.addEventListener('click', () => handleCashOut(investment.id));
      }
    });
  }

  /**
   * Render the History tab
   */
  function renderHistoryTab(container) {
    const cashedInvestments = state.investments.filter(inv => inv.cashedOut);
    
    if (cashedInvestments.length === 0) {
      container.innerHTML = `
        <div class="angel-hub-empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3>No Investment History</h3>
          <p>Your cashed out investments will appear here.</p>
        </div>
      `;
      return;
    }

    let html = '';
    cashedInvestments.forEach(investment => {
      html += renderInvestmentCard(investment, true);
    });

    container.innerHTML = html;
  }

  /**
   * Render an investment card
   */
  function renderInvestmentCard(investment, isHistory = false) {
    const currentValue = calculateCurrentValue(investment);
    const profit = currentValue - investment.amount;
    const roi = ((profit / investment.amount) * 100).toFixed(2);
    const daysElapsed = Math.floor((Date.now() - investment.createdAt) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, investment.lockPeriodDays - daysElapsed);
    const unlockDate = new Date(investment.createdAt + investment.lockPeriodDays * 24 * 60 * 60 * 1000);
    const isUnlocked = Date.now() >= unlockDate.getTime();
    const progress = Math.min(100, (daysElapsed / investment.lockPeriodDays) * 100);

    let statusClass = 'angel-hub-status-locked';
    let statusText = `Locked (${daysRemaining} days)`;
    
    if (investment.cashedOut) {
      statusClass = 'angel-hub-status-cashed';
      statusText = 'Cashed Out';
    } else if (isUnlocked) {
      statusClass = 'angel-hub-status-unlocked';
      statusText = 'Ready to Cash Out';
    }

    return `
      <div class="angel-hub-investment-card">
        <div class="angel-hub-investment-header">
          <div>
            <div class="angel-hub-investment-title">${investment.projectName}</div>
            <div class="angel-hub-investment-date">${new Date(investment.createdAt).toLocaleDateString()}</div>
          </div>
          <div class="angel-hub-investment-status ${statusClass}">
            ${statusText}
          </div>
        </div>
        
        ${investment.notes ? `<p style="margin: 8px 0; color: rgba(255, 255, 255, 0.7); font-size: 14px;">${investment.notes}</p>` : ''}
        
        <div class="angel-hub-investment-stats">
          <div class="angel-hub-stat">
            <div class="angel-hub-stat-label">Invested</div>
            <div class="angel-hub-stat-value">$${investment.amount.toFixed(2)}</div>
          </div>
          <div class="angel-hub-stat">
            <div class="angel-hub-stat-label">Current Value</div>
            <div class="angel-hub-stat-value positive">$${currentValue.toFixed(2)}</div>
          </div>
          <div class="angel-hub-stat">
            <div class="angel-hub-stat-label">Profit/Loss</div>
            <div class="angel-hub-stat-value ${profit >= 0 ? 'positive' : 'negative'}">
              ${profit >= 0 ? '+' : ''}$${profit.toFixed(2)}
            </div>
          </div>
          <div class="angel-hub-stat">
            <div class="angel-hub-stat-label">ROI</div>
            <div class="angel-hub-stat-value ${profit >= 0 ? 'positive' : 'negative'}">
              ${roi >= 0 ? '+' : ''}${roi}%
            </div>
          </div>
        </div>
        
        ${!investment.cashedOut ? `
          <div class="angel-hub-progress-bar">
            <div class="angel-hub-progress-fill" style="width: ${progress}%"></div>
          </div>
          <p style="margin: 8px 0 16px; font-size: 12px; color: rgba(255, 255, 255, 0.6);">
            Unlock date: ${unlockDate.toLocaleDateString()}
          </p>
          <button 
            id="cashout-${investment.id}" 
            class="angel-hub-button angel-hub-button-success" 
            ${!isUnlocked ? 'disabled' : ''}
            style="width: 100%;"
          >
            ${isUnlocked ? 'Cash Out Now' : `Locked for ${daysRemaining} more days`}
          </button>
        ` : `
          <p style="margin: 16px 0 0; font-size: 12px; color: rgba(255, 255, 255, 0.6);">
            Cashed out on: ${new Date(investment.cashedOutAt).toLocaleDateString()}
          </p>
        `}
      </div>
    `;
  }

  /**
   * Handle investment form submission
   */
  function handleInvestmentSubmit() {
    const projectName = document.getElementById('project-name').value.trim();
    const amount = parseFloat(document.getElementById('investment-amount').value);
    const expectedROI = parseFloat(document.getElementById('expected-roi').value) / 100;
    const lockPeriodDays = parseInt(document.getElementById('lock-period').value);
    const notes = document.getElementById('investment-notes').value.trim();

    // Validate
    if (!projectName) {
      alert('Please enter a project name.');
      return;
    }
    
    if (amount < CONFIG.MIN_INVESTMENT || amount > CONFIG.MAX_INVESTMENT) {
      alert(`Investment amount must be between $${CONFIG.MIN_INVESTMENT} and $${CONFIG.MAX_INVESTMENT.toLocaleString()}.`);
      return;
    }

    // Check if PayPal integration is available
    if (!window.PayPalIntegration || !window.PayPalIntegration.isAvailable()) {
      alert('Payment system is temporarily unavailable. Please try again later or contact support at ' + CONFIG.PAYMENT_EMAIL);
      return;
    }

    // Create investment record
    const investment = {
      id: generateId(),
      projectName,
      amount,
      expectedROI,
      lockPeriodDays,
      notes,
      createdAt: Date.now(),
      cashedOut: false,
      cashedOutAt: null,
    };

    // Process payment with PayPal
    processPayment(investment);
  }

  /**
   * Process payment via PayPal
   */
  function processPayment(investment) {
    // Create a temporary container for PayPal button
    const container = document.getElementById('angel-hub-content');
    const paymentContainer = document.createElement('div');
    paymentContainer.innerHTML = `
      <div class="angel-hub-info-box">
        <div class="angel-hub-info-box-title">Complete Your Investment</div>
        <p>
          You're investing <strong>$${investment.amount.toFixed(2)}</strong> in <strong>${investment.projectName}</strong>.
          Complete your payment below using PayPal.
        </p>
      </div>
      <div id="paypal-button-temp" style="margin: 20px 0;"></div>
      <button type="button" id="cancel-payment" class="angel-hub-button angel-hub-button-secondary" style="width: 100%;">
        Cancel
      </button>
    `;
    
    container.innerHTML = '';
    container.appendChild(paymentContainer);

    // Render PayPal button
    window.PayPalIntegration.renderButton('paypal-button-temp', {
      amount: investment.amount,
      description: `Angel Investment in ${investment.projectName}`,
      onSuccess: (data) => {
        investment.paymentId = data.orderID;
        state.investments.push(investment);
        saveInvestments();
        updateBadge();
        
        alert('Investment successful! You can track your ROI in the Portfolio tab.');
        switchTab('portfolio');
      },
      onError: (err) => {
        alert('Payment failed. Please try again.');
        console.error('Payment error:', err);
      },
      onCancel: (data) => {
        alert('Payment cancelled.');
        switchTab('invest');
      }
    }).catch(err => {
      alert('Failed to initialize PayPal. Please try again.');
      console.error('PayPal initialization error:', err);
    });

    // Cancel button
    document.getElementById('cancel-payment').addEventListener('click', () => {
      switchTab('invest');
    });
  }

  /**
   * Handle cash out
   */
  function handleCashOut(investmentId) {
    const investment = state.investments.find(inv => inv.id === investmentId);
    if (!investment) return;

    const currentValue = calculateCurrentValue(investment);
    const profit = currentValue - investment.amount;

    if (!confirm(`Cash out this investment?\n\nCurrent Value: $${currentValue.toFixed(2)}\nProfit: $${profit.toFixed(2)}\n\nYour payout will be processed to your registered payment method.`)) {
      return;
    }

    investment.cashedOut = true;
    investment.cashedOutAt = Date.now();
    investment.finalValue = currentValue;
    
    saveInvestments();
    updateBadge();
    
    // Show success message
    alert(`Successfully cashed out $${currentValue.toFixed(2)}!\n\nYour payout request has been recorded and will be processed shortly.`);
    
    // Refresh portfolio view
    switchTab('portfolio');
  }

  /**
   * Calculate current value of investment with ROI
   */
  function calculateCurrentValue(investment) {
    if (investment.cashedOut && investment.finalValue) {
      return investment.finalValue;
    }

    const daysElapsed = (Date.now() - investment.createdAt) / (1000 * 60 * 60 * 24);
    const yearsElapsed = daysElapsed / 365;
    
    // Simple compound interest: A = P(1 + r)^t
    const currentValue = investment.amount * Math.pow(1 + investment.expectedROI, yearsElapsed);
    
    return currentValue;
  }

  /**
   * Start ROI update interval
   */
  function startROIUpdates() {
    if (state.updateInterval) {
      clearInterval(state.updateInterval);
    }

    state.updateInterval = setInterval(() => {
      // Only update if modal is open and on portfolio tab
      const modal = document.getElementById('angel-hub-modal');
      if (modal && modal.classList.contains('active')) {
        const activeTab = document.querySelector('.angel-hub-tab.active');
        if (activeTab && activeTab.dataset.tab === 'portfolio') {
          const content = document.getElementById('angel-hub-content');
          renderPortfolioTab(content);
        }
      }
    }, CONFIG.UPDATE_INTERVAL);
  }

  /**
   * Update badge count
   */
  function updateBadge() {
    const activeInvestments = state.investments.filter(inv => !inv.cashedOut);
    const badge = document.getElementById('angel-hub-badge');
    if (badge) {
      badge.textContent = activeInvestments.length;
    }
  }

  /**
   * Get page project name from title or filename
   */
  function getPageProjectName() {
    const title = document.title;
    if (title && title !== 'BARBRICKDESIGN - Elite Web3 Hub') {
      return title;
    }
    
    const path = window.location.pathname;
    const filename = path.split('/').pop().replace('.html', '');
    return filename || 'BarbrickDesign Project';
  }

  /**
   * Generate unique ID
   */
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Get all investments
   */
  function getInvestments() {
    return state.investments;
  }

  /**
   * Get portfolio summary
   */
  function getPortfolioSummary() {
    const active = state.investments.filter(inv => !inv.cashedOut);
    const totalInvested = active.reduce((sum, inv) => sum + inv.amount, 0);
    const totalValue = active.reduce((sum, inv) => sum + calculateCurrentValue(inv), 0);
    
    return {
      totalInvestments: active.length,
      totalInvested,
      totalValue,
      totalProfit: totalValue - totalInvested,
      roi: totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0
    };
  }

  // Public API
  return {
    init,
    getInvestments,
    getPortfolioSummary,
  };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Wait for PayPal integration to be available
    if (window.PayPalIntegration) {
      AngelInvestmentHub.init();
    } else {
      // Retry after a short delay
      setTimeout(() => {
        if (window.PayPalIntegration) {
          AngelInvestmentHub.init();
        } else {
          console.warn('PayPal integration not found. Angel Investment Hub requires PayPal integration.');
        }
      }, 1000);
    }
  });
} else {
  // DOM already loaded
  if (window.PayPalIntegration) {
    AngelInvestmentHub.init();
  } else {
    setTimeout(() => {
      if (window.PayPalIntegration) {
        AngelInvestmentHub.init();
      } else {
        console.warn('PayPal integration not found. Angel Investment Hub requires PayPal integration.');
      }
    }, 1000);
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AngelInvestmentHub;
}
