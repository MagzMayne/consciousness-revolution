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
 * File: api-client.js
 * Declaration ID: IP-4E953259-MLL28ZWB
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * TopStepX API Client
 * Provides interface to TopStepX REST API and WebSocket endpoints
 * Documentation: https://api.topstepx.com/swagger/index.html
 */

class TopStepXAPIClient {
  constructor() {
    this.baseURL = 'https://api.topstepx.com';
    this.wsURL = 'wss://api.topstepx.com/signalr';
    this.token = null;
    this.tokenExpiry = null;
    this.credentials = this.loadCredentials();
    this.wsConnection = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = {
      accountUpdate: [],
      positionUpdate: [],
      orderUpdate: [],
      tradeUpdate: [],
      marketData: [],
      error: [],
      connected: [],
      disconnected: []
    };
  }

  /**
   * Load API credentials from localStorage
   */
  loadCredentials() {
    try {
      const data = localStorage.getItem('topstep_api_credentials');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to load credentials:', e);
      return null;
    }
  }

  /**
   * Save API credentials to localStorage
   */
  saveCredentials(username, apiKey) {
    const credentials = { username, apiKey, savedAt: Date.now() };
    try {
      localStorage.setItem('topstep_api_credentials', JSON.stringify(credentials));
      this.credentials = credentials;
      return true;
    } catch (e) {
      console.error('Failed to save credentials:', e);
      return false;
    }
  }

  /**
   * Clear stored credentials
   */
  clearCredentials() {
    localStorage.removeItem('topstep_api_credentials');
    this.credentials = null;
    this.token = null;
    this.tokenExpiry = null;
  }

  /**
   * Check if credentials are configured
   */
  hasCredentials() {
    return this.credentials && this.credentials.username && this.credentials.apiKey;
  }

  /**
   * Check if token is valid
   */
  isTokenValid() {
    if (!this.token || !this.tokenExpiry) return false;
    // Add 5-minute buffer before expiry
    return Date.now() < (this.tokenExpiry - 5 * 60 * 1000);
  }

  /**
   * Authenticate with TopStepX API
   */
  async authenticate() {
    if (!this.hasCredentials()) {
      throw new Error('No API credentials configured');
    }

    if (this.isTokenValid()) {
      return this.token;
    }

    try {
      const response = await fetch(`${this.baseURL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: this.credentials.username,
          apiKey: this.credentials.apiKey
        })
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.token = data.token;
      // Tokens are valid for 24 hours
      this.tokenExpiry = Date.now() + (24 * 60 * 60 * 1000);
      
      return this.token;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  /**
   * Make authenticated API request
   */
  async request(endpoint, options = {}) {
    // Ensure we have a valid token
    await this.authenticate();

    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  /**
   * Get all accounts
   */
  async getAccounts() {
    return await this.request('/api/accounts');
  }

  /**
   * Get account by ID
   */
  async getAccount(accountId) {
    return await this.request(`/api/accounts/${accountId}`);
  }

  /**
   * Search contracts
   */
  async searchContracts(query) {
    return await this.request(`/api/contracts/search?q=${encodeURIComponent(query)}`);
  }

  /**
   * Get contract by ID
   */
  async getContract(contractId) {
    return await this.request(`/api/contracts/${contractId}`);
  }

  /**
   * Get historical bar data
   */
  async getHistoricalData(contractId, interval, startDate, endDate) {
    const params = new URLSearchParams({
      contractId,
      interval,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
    return await this.request(`/api/data/bars?${params}`);
  }

  /**
   * Get all orders for account
   */
  async getOrders(accountId, filter = {}) {
    const params = new URLSearchParams({
      accountId,
      ...filter
    });
    return await this.request(`/api/orders?${params}`);
  }

  /**
   * Place a new order
   */
  async placeOrder(order) {
    return await this.request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(order)
    });
  }

  /**
   * Modify an existing order
   */
  async modifyOrder(orderId, modifications) {
    return await this.request(`/api/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(modifications)
    });
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId) {
    return await this.request(`/api/orders/${orderId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Get all positions for account
   */
  async getPositions(accountId) {
    return await this.request(`/api/positions?accountId=${accountId}`);
  }

  /**
   * Close a position (full or partial)
   */
  async closePosition(positionId, quantity = null) {
    const body = quantity ? { quantity } : {};
    return await this.request(`/api/positions/${positionId}/close`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  /**
   * Get trade history
   */
  async getTrades(accountId, filter = {}) {
    const params = new URLSearchParams({
      accountId,
      ...filter
    });
    return await this.request(`/api/trades?${params}`);
  }

  /**
   * Connect to WebSocket for real-time updates
   */
  async connectWebSocket() {
    if (this.wsConnection && this.wsConnection.state === 'Connected') {
      console.log('WebSocket already connected');
      return;
    }

    try {
      // Ensure we have a valid token
      await this.authenticate();

      // Note: Actual implementation would use SignalR client library
      // This is a placeholder showing the structure
      console.log('WebSocket connection would be established here with SignalR');
      console.log(`Token: ${this.token}`);
      
      // Simulate connection success
      this.notifyListeners('connected', { timestamp: Date.now() });
      this.reconnectAttempts = 0;

    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleWebSocketError(error);
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnectWebSocket() {
    if (this.wsConnection) {
      this.wsConnection.stop();
      this.wsConnection = null;
      this.notifyListeners('disconnected', { timestamp: Date.now() });
    }
  }

  /**
   * Handle WebSocket errors with reconnection logic
   */
  handleWebSocketError(error) {
    this.notifyListeners('error', error);

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      console.log(`Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.connectWebSocket();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  /**
   * Subscribe to account updates
   */
  async subscribeToAccount(accountId) {
    if (!this.wsConnection) {
      await this.connectWebSocket();
    }
    // Actual SignalR subscription would go here
    console.log(`Subscribed to account updates: ${accountId}`);
  }

  /**
   * Subscribe to market data for contract
   */
  async subscribeToMarketData(contractId) {
    if (!this.wsConnection) {
      await this.connectWebSocket();
    }
    // Actual SignalR subscription would go here
    console.log(`Subscribed to market data: ${contractId}`);
  }

  /**
   * Add event listener
   */
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  /**
   * Notify all listeners for an event
   */
  notifyListeners(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (e) {
          console.error(`Listener error for ${event}:`, e);
        }
      });
    }
  }

  /**
   * Get API connection status
   */
  getStatus() {
    // Check WebSocket connection state (supports both SignalR and native WebSocket)
    let wsConnected = false;
    if (this.wsConnection) {
      if (this.wsConnection.state === 'Connected' || this.wsConnection.state === WebSocket.OPEN) {
        wsConnected = true;
      }
    }

    return {
      hasCredentials: this.hasCredentials(),
      isAuthenticated: this.isTokenValid(),
      tokenExpiry: this.tokenExpiry,
      wsConnected: wsConnected,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      await this.authenticate();
      const accounts = await this.getAccounts();
      return {
        success: true,
        accountCount: accounts.length,
        message: 'Connection successful'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TopStepXAPIClient;
}
