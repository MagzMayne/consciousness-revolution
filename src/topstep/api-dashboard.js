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
 * File: api-dashboard.js
 * Declaration ID: IP-1E1C3BB6-MLL28ZWB
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * TopStepX API Dashboard
 * Enhanced monitoring and statistics for API integration
 */

class TopStepAPIDashboard {
  constructor(apiClient, apiSyncManager) {
    this.apiClient = apiClient;
    this.apiSyncManager = apiSyncManager;
  }

  /**
   * Render API status dashboard
   */
  renderDashboard() {
    const status = this.apiClient.getStatus();
    const syncStats = this.apiSyncManager.getSyncStats();

    return `
      <div class="api-dashboard">
        <div class="dashboard-grid">
          <!-- Connection Status -->
          <div class="dashboard-card">
            <div class="card-icon">🔌</div>
            <div class="card-content">
              <div class="card-label">Connection</div>
              <div class="card-value ${status.isAuthenticated ? 'positive' : 'negative'}">
                ${status.isAuthenticated ? 'Connected' : 'Disconnected'}
              </div>
            </div>
          </div>

          <!-- WebSocket Status -->
          <div class="dashboard-card">
            <div class="card-icon">🌐</div>
            <div class="card-content">
              <div class="card-label">Real-Time Data</div>
              <div class="card-value ${status.wsConnected ? 'positive' : 'neutral'}">
                ${status.wsConnected ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>

          <!-- Total Syncs -->
          <div class="dashboard-card">
            <div class="card-icon">🔄</div>
            <div class="card-content">
              <div class="card-label">Total Syncs</div>
              <div class="card-value">${syncStats.totalSyncs}</div>
            </div>
          </div>

          <!-- Success Rate -->
          <div class="dashboard-card">
            <div class="card-icon">✅</div>
            <div class="card-content">
              <div class="card-label">Success Rate</div>
              <div class="card-value ${this.getSuccessRateColor(syncStats)}">
                ${this.calculateSuccessRate(syncStats)}%
              </div>
            </div>
          </div>

          <!-- Last Sync -->
          <div class="dashboard-card">
            <div class="card-icon">⏱️</div>
            <div class="card-content">
              <div class="card-label">Last Sync</div>
              <div class="card-value">
                ${syncStats.lastSyncTime ? this.formatTimeAgo(syncStats.lastSyncTime) : 'Never'}
              </div>
            </div>
          </div>

          <!-- Auto Sync Status -->
          <div class="dashboard-card">
            <div class="card-icon">⚙️</div>
            <div class="card-content">
              <div class="card-label">Auto Sync</div>
              <div class="card-value ${syncStats.isAutoSyncRunning ? 'positive' : 'neutral'}">
                ${syncStats.isAutoSyncRunning ? 'Running' : 'Stopped'}
              </div>
            </div>
          </div>
        </div>

        ${status.tokenExpiry ? `
          <div class="token-expiry-bar">
            <div class="expiry-info">
              <span>🔑 Token expires: ${new Date(status.tokenExpiry).toLocaleString()}</span>
              <span>${this.formatTimeUntil(status.tokenExpiry)}</span>
            </div>
            <div class="expiry-progress">
              <div class="expiry-progress-bar" style="width: ${this.calculateTokenProgress(status.tokenExpiry)}%"></div>
            </div>
          </div>
        ` : ''}

        ${syncStats.lastError ? `
          <div class="error-alert">
            <div class="error-icon">⚠️</div>
            <div class="error-content">
              <div class="error-title">Last Sync Error</div>
              <div class="error-message">${syncStats.lastError}</div>
            </div>
          </div>
        ` : ''}

        <div class="dashboard-actions">
          <button class="btn btn-primary" onclick="apiDashboard.manualSync(event)">
            🔄 Sync Now
          </button>
          <button class="btn btn-secondary" onclick="apiDashboard.toggleAutoSync()">
            ${syncStats.isAutoSyncRunning ? '⏸️ Pause Auto-Sync' : '▶️ Start Auto-Sync'}
          </button>
          <button class="btn btn-secondary" onclick="apiDashboard.resetStats()">
            🔄 Reset Stats
          </button>
        </div>
      </div>

      <style>
        .api-dashboard {
          padding: 20px 0;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .dashboard-card {
          background: rgba(30, 41, 59, 0.8);
          border: 2px solid rgba(148, 163, 184, 0.2);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          transition: all 0.3s;
        }

        .dashboard-card:hover {
          transform: translateY(-2px);
          border-color: rgba(56, 178, 172, 0.4);
        }

        .card-icon {
          font-size: 2em;
          opacity: 0.8;
        }

        .card-content {
          flex: 1;
        }

        .card-label {
          font-size: 0.85em;
          color: #a0aec0;
          margin-bottom: 5px;
        }

        .card-value {
          font-size: 1.3em;
          font-weight: 700;
          color: #e2e8f0;
        }

        .card-value.positive {
          color: #68d391;
        }

        .card-value.negative {
          color: #fc8181;
        }

        .card-value.neutral {
          color: #a0aec0;
        }

        .token-expiry-bar {
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
        }

        .expiry-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 0.9em;
          color: #a0aec0;
        }

        .expiry-progress {
          height: 8px;
          background: rgba(148, 163, 184, 0.2);
          border-radius: 4px;
          overflow: hidden;
        }

        .expiry-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #38b2ac, #48bb78);
          transition: width 1s linear;
        }

        .error-alert {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          padding: 15px;
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
        }

        .error-icon {
          font-size: 1.5em;
        }

        .error-content {
          flex: 1;
        }

        .error-title {
          font-weight: 700;
          color: #fca5a5;
          margin-bottom: 5px;
        }

        .error-message {
          font-size: 0.9em;
          color: #e2e8f0;
        }

        .dashboard-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .dashboard-actions .btn {
          flex: 1;
          min-width: 150px;
        }
      </style>
    `;
  }

  /**
   * Calculate success rate percentage
   */
  calculateSuccessRate(syncStats) {
    if (syncStats.totalSyncs === 0) return 100;
    return Math.round((syncStats.successfulSyncs / syncStats.totalSyncs) * 100);
  }

  /**
   * Get color class for success rate
   */
  getSuccessRateColor(syncStats) {
    const rate = this.calculateSuccessRate(syncStats);
    if (rate >= 90) return 'positive';
    if (rate >= 70) return 'neutral';
    return 'negative';
  }

  /**
   * Format time ago
   */
  formatTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  /**
   * Format time until
   */
  formatTimeUntil(timestamp) {
    const seconds = Math.floor((timestamp - Date.now()) / 1000);
    
    if (seconds < 0) return 'Expired';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m remaining`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h remaining`;
    return `${Math.floor(seconds / 86400)}d remaining`;
  }

  /**
   * Calculate token expiry progress (0-100%)
   */
  calculateTokenProgress(tokenExpiry) {
    const tokenLifetime = 24 * 60 * 60 * 1000; // 24 hours
    const timeRemaining = tokenExpiry - Date.now();
    const progress = (timeRemaining / tokenLifetime) * 100;
    return Math.max(0, Math.min(100, progress));
  }

  /**
   * Manual sync action
   */
  async manualSync(event) {
    if (!event || !event.target) {
      console.error('Manual sync called without event');
      return;
    }
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '⏳ Syncing...';

    try {
      const result = await this.apiSyncManager.syncAll();
      
      if (result.success) {
        if (typeof showNotification === 'function') {
          showNotification('✅ Sync completed successfully!');
        }
        this.refreshDashboard();
      } else {
        if (typeof showNotification === 'function') {
          showNotification(`❌ Sync failed: ${result.error}`);
        }
      }
    } catch (error) {
      if (typeof showNotification === 'function') {
        showNotification(`❌ Sync error: ${error.message}`);
      }
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  }

  /**
   * Toggle auto-sync
   */
  toggleAutoSync() {
    const syncStats = this.apiSyncManager.getSyncStats();
    
    if (syncStats.isAutoSyncRunning) {
      this.apiSyncManager.stopAutoSync();
      if (typeof showNotification === 'function') {
        showNotification('Auto-sync paused');
      }
    } else {
      // Use default interval if topstepAPIConfig is not available
      const interval = (typeof topstepAPIConfig !== 'undefined' && topstepAPIConfig.config.syncInterval) || 30000;
      this.apiSyncManager.startAutoSync(interval);
      if (typeof showNotification === 'function') {
        showNotification('Auto-sync started');
      }
    }
    
    this.refreshDashboard();
  }

  /**
   * Reset statistics
   */
  resetStats() {
    if (confirm('Reset all sync statistics?')) {
      this.apiSyncManager.resetSyncStats();
      if (typeof showNotification === 'function') {
        showNotification('Statistics reset');
      }
      this.refreshDashboard();
    }
  }

  /**
   * Refresh dashboard display
   */
  refreshDashboard() {
    const container = document.getElementById('apiDashboardContent');
    if (container) {
      container.innerHTML = this.renderDashboard();
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TopStepAPIDashboard;
}
