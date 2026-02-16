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
 * File: api-config.js
 * Declaration ID: IP-6FDFA47E-MLL28ZWB
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * TopStepX API Configuration Manager
 * Handles API credential setup and configuration
 */

class TopStepAPIConfig {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.STORAGE_KEY = 'topstep_api_config';
    this.config = this.loadConfig();
  }

  /**
   * Load configuration from localStorage
   */
  loadConfig() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {
        enabled: false,
        autoSync: true,
        syncInterval: 30000, // 30 seconds
        realTimeData: true,
        notifications: true
      };
    } catch (e) {
      console.error('Failed to load config:', e);
      return {};
    }
  }

  /**
   * Save configuration to localStorage
   */
  saveConfig() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.config));
      return true;
    } catch (e) {
      console.error('Failed to save config:', e);
      return false;
    }
  }

  /**
   * Check if API is enabled and configured
   */
  isEnabled() {
    return this.config.enabled && this.apiClient.hasCredentials();
  }

  /**
   * Enable API integration
   */
  enable() {
    this.config.enabled = true;
    this.saveConfig();
  }

  /**
   * Disable API integration
   */
  disable() {
    this.config.enabled = false;
    this.saveConfig();
  }

  /**
   * Update configuration
   */
  updateConfig(updates) {
    Object.assign(this.config, updates);
    this.saveConfig();
  }

  /**
   * Get configuration
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Render configuration modal HTML
   */
  renderConfigModal() {
    const status = this.apiClient.getStatus();
    const credentials = this.apiClient.credentials;

    return `
      <div class="api-config-section">
        <div class="config-header">
          <h4>TopStepX API Configuration</h4>
          <div class="status-badge ${status.isAuthenticated ? 'status-connected' : 'status-disconnected'}">
            ${status.isAuthenticated ? '✓ Connected' : '○ Not Connected'}
          </div>
        </div>

        <div class="config-info">
          <p style="color: #a0aec0; font-size: 0.9em; margin-bottom: 15px;">
            Connect to your TopStepX account to enable live trading, real-time data, and automated order management.
          </p>
          <a href="https://api.topstepx.com/swagger/index.html" target="_blank" style="color: #38b2ac; text-decoration: none; font-size: 0.9em;">
            📚 View API Documentation
          </a>
        </div>

        <div class="form-group">
          <label class="form-label">
            Username
            <span style="color: #fc8181; margin-left: 4px;">*</span>
          </label>
          <input 
            type="text" 
            class="form-input" 
            id="apiUsername" 
            value="${credentials ? credentials.username : ''}"
            placeholder="your-username"
          >
        </div>

        <div class="form-group">
          <label class="form-label">
            API Key
            <span style="color: #fc8181; margin-left: 4px;">*</span>
          </label>
          <input 
            type="password" 
            class="form-input" 
            id="apiKey" 
            value="${credentials ? credentials.apiKey : ''}"
            placeholder="••••••••••••••••"
          >
          <div style="font-size: 0.85em; color: #a0aec0; margin-top: 8px;">
            Get your API key from Settings → API in your TopStepX platform
          </div>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              id="enableAPI" 
              ${this.config.enabled ? 'checked' : ''}
            >
            <span>Enable API Integration</span>
          </label>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              id="autoSync" 
              ${this.config.autoSync ? 'checked' : ''}
            >
            <span>Auto-sync account data</span>
          </label>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              id="realTimeData" 
              ${this.config.realTimeData ? 'checked' : ''}
            >
            <span>Enable real-time market data (WebSocket)</span>
          </label>
        </div>

        <div class="form-group">
          <label class="form-label">Sync Interval (seconds)</label>
          <input 
            type="number" 
            class="form-input" 
            id="syncInterval" 
            value="${this.config.syncInterval / 1000}"
            min="10"
            max="300"
            step="5"
          >
        </div>

        <div class="button-group">
          <button class="btn btn-primary" onclick="topstepAPIConfig.saveCredentials()">
            💾 Save Configuration
          </button>
          <button class="btn btn-secondary" onclick="topstepAPIConfig.testConnection()">
            🔌 Test Connection
          </button>
          ${status.hasCredentials ? `
            <button class="btn btn-danger" onclick="topstepAPIConfig.clearCredentials()">
              🗑️ Clear Credentials
            </button>
          ` : ''}
        </div>

        ${status.hasCredentials ? `
          <div class="api-status-details">
            <h5 style="color: #38b2ac; margin: 20px 0 10px;">Connection Status</h5>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9em;">
              <div>
                <div style="color: #a0aec0;">Token Valid</div>
                <div style="font-weight: 600;">${status.isAuthenticated ? 'Yes' : 'No'}</div>
              </div>
              <div>
                <div style="color: #a0aec0;">WebSocket</div>
                <div style="font-weight: 600;">${status.wsConnected ? 'Connected' : 'Disconnected'}</div>
              </div>
              ${status.tokenExpiry ? `
                <div style="grid-column: 1 / -1;">
                  <div style="color: #a0aec0;">Token Expires</div>
                  <div style="font-weight: 600;">${new Date(status.tokenExpiry).toLocaleString()}</div>
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Save credentials from form
   */
  async saveCredentials() {
    const username = document.getElementById('apiUsername').value.trim();
    const apiKey = document.getElementById('apiKey').value.trim();
    const enabled = document.getElementById('enableAPI').checked;
    const autoSync = document.getElementById('autoSync').checked;
    const realTimeData = document.getElementById('realTimeData').checked;
    const syncInterval = parseInt(document.getElementById('syncInterval').value) * 1000;

    if (!username || !apiKey) {
      alert('Please enter both username and API key');
      return;
    }

    // Save credentials
    this.apiClient.saveCredentials(username, apiKey);

    // Update configuration
    this.config.enabled = enabled;
    this.config.autoSync = autoSync;
    this.config.realTimeData = realTimeData;
    this.config.syncInterval = syncInterval;
    this.saveConfig();

    // Show success message
    if (typeof showNotification === 'function') {
      showNotification('API configuration saved successfully!');
    } else {
      alert('API configuration saved successfully!');
    }

    // Refresh the modal
    this.refreshModal();
  }

  /**
   * Test API connection
   */
  async testConnection() {
    if (!this.apiClient.hasCredentials()) {
      alert('Please save credentials first');
      return;
    }

    const testButton = event.target;
    testButton.disabled = true;
    testButton.textContent = '⏳ Testing...';

    try {
      const result = await this.apiClient.testConnection();
      
      if (result.success) {
        alert(`✅ Connection successful!\n\nFound ${result.accountCount} account(s).`);
      } else {
        alert(`❌ Connection failed:\n\n${result.error}`);
      }
    } catch (error) {
      alert(`❌ Connection test failed:\n\n${error.message}`);
    } finally {
      testButton.disabled = false;
      testButton.textContent = '🔌 Test Connection';
    }
  }

  /**
   * Clear stored credentials
   */
  clearCredentials() {
    if (confirm('Are you sure you want to clear stored API credentials? This will disconnect the API.')) {
      this.apiClient.clearCredentials();
      this.config.enabled = false;
      this.saveConfig();
      
      if (typeof showNotification === 'function') {
        showNotification('API credentials cleared');
      } else {
        alert('API credentials cleared');
      }
      
      this.refreshModal();
    }
  }

  /**
   * Refresh the configuration modal
   */
  refreshModal() {
    const content = document.getElementById('apiConfigContent');
    if (content) {
      content.innerHTML = this.renderConfigModal();
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TopStepAPIConfig;
}
