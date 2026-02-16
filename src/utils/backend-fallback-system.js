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
 * File: backend-fallback-system.js
 * Declaration ID: IP-69E16BEA-MLL28ZWE
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Backend Fallback System
 * 
 * Provides automatic fallback to frontend storage when backend is unavailable
 * Works with localStorage/IndexedDB for data persistence
 * Automatically detects backend availability and switches modes
 * 
 * @author Barbrick Design
 * @date 2026-02-03
 */

class BackendFallbackSystem {
  constructor(config = {}) {
    this.backendUrl = config.backendUrl || 'http://localhost:4000';
    this.checkInterval = config.checkInterval || 10000; // 10 seconds
    this.isBackendAvailable = false;
    this.mode = 'unknown'; // 'backend', 'frontend', 'unknown'
    this.listeners = [];
    this.storagePrefix = config.storagePrefix || 'bfb_';
    this.retryAttempts = 0;
    this.maxRetryAttempts = config.maxRetryAttempts || 3;
    
    // Initialize
    this.init();
  }
  
  /**
   * Initialize the fallback system
   */
  async init() {
    console.log('🔄 Backend Fallback System initializing...');
    
    // Check backend availability immediately
    await this.checkBackendHealth();
    
    // Start periodic health checks
    this.startHealthChecks();
    
    // Log initial status
    console.log(`✓ Backend Fallback System ready (Mode: ${this.mode})`);
  }
  
  /**
   * Check if backend is available
   */
  async checkBackendHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${this.backendUrl}/health`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        this.setBackendAvailable(true);
        this.retryAttempts = 0;
        return true;
      } else {
        this.setBackendAvailable(false);
        return false;
      }
    } catch (error) {
      this.setBackendAvailable(false);
      return false;
    }
  }
  
  /**
   * Set backend availability status
   */
  setBackendAvailable(available) {
    const previousMode = this.mode;
    this.isBackendAvailable = available;
    this.mode = available ? 'backend' : 'frontend';
    
    if (previousMode !== this.mode && previousMode !== 'unknown') {
      console.log(`🔄 Mode switched: ${previousMode} → ${this.mode}`);
      this.notifyListeners({
        type: 'mode_change',
        previousMode,
        currentMode: this.mode,
        backendAvailable: available
      });
    }
  }
  
  /**
   * Start periodic health checks
   */
  startHealthChecks() {
    setInterval(async () => {
      await this.checkBackendHealth();
    }, this.checkInterval);
  }
  
  /**
   * Add event listener
   */
  on(event, callback) {
    this.listeners.push({ event, callback });
  }
  
  /**
   * Notify all listeners
   */
  notifyListeners(data) {
    this.listeners.forEach(listener => {
      if (listener.event === 'change' || listener.event === data.type) {
        listener.callback(data);
      }
    });
  }
  
  /**
   * Universal request handler - tries backend, falls back to frontend
   */
  async request(endpoint, options = {}) {
    const method = options.method || 'GET';
    const body = options.body || null;
    
    // Try backend first if available
    if (this.isBackendAvailable) {
      try {
        const response = await this.backendRequest(endpoint, options);
        return { success: true, data: response, source: 'backend' };
      } catch (error) {
        console.warn(`Backend request failed, falling back to frontend: ${error.message}`);
        // Backend failed, mark as unavailable and try frontend
        this.setBackendAvailable(false);
      }
    }
    
    // Use frontend storage
    try {
      const response = await this.frontendRequest(endpoint, options);
      return { success: true, data: response, source: 'frontend' };
    } catch (error) {
      console.error('Frontend request also failed:', error);
      return { success: false, error: error.message, source: 'none' };
    }
  }
  
  /**
   * Make request to backend
   */
  async backendRequest(endpoint, options) {
    const url = `${this.backendUrl}${endpoint}`;
    const method = options.method || 'GET';
    
    const fetchOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };
    
    if (options.body) {
      fetchOptions.body = JSON.stringify(options.body);
    }
    
    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  /**
   * Make request using frontend storage
   */
  async frontendRequest(endpoint, options) {
    const method = options.method || 'GET';
    const body = options.body || null;
    
    // Parse endpoint to determine resource type
    const parts = endpoint.split('/').filter(p => p);
    const resource = parts[0]; // e.g., 'emails', 'leads', 'stats'
    const id = parts[1];
    const subresource = parts[2];
    
    switch (method) {
      case 'GET':
        return this.frontendGet(resource, id, subresource);
      
      case 'POST':
        return this.frontendPost(resource, id, subresource, body);
      
      case 'PATCH':
      case 'PUT':
        return this.frontendUpdate(resource, id, body);
      
      case 'DELETE':
        return this.frontendDelete(resource, id);
      
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  }
  
  /**
   * Frontend GET request
   */
  frontendGet(resource, id, subresource) {
    const storageKey = `${this.storagePrefix}${resource}`;
    const data = this.getFromStorage(storageKey) || [];
    
    if (resource === 'stats') {
      return this.calculateStats();
    }
    
    if (id) {
      const item = data.find(d => d.id === id);
      if (!item) {
        throw new Error(`${resource} not found: ${id}`);
      }
      return item;
    }
    
    return data;
  }
  
  /**
   * Frontend POST request
   */
  frontendPost(resource, id, subresource, body) {
    const storageKey = `${this.storagePrefix}${resource}`;
    const data = this.getFromStorage(storageKey) || [];
    
    // Handle subresources (e.g., /leads/:id/threads)
    if (id && subresource) {
      const item = data.find(d => d.id === id);
      if (!item) {
        throw new Error(`${resource} not found: ${id}`);
      }
      
      const newSubItem = {
        id: this.generateId(),
        ...body,
        timestamp: new Date().toISOString()
      };
      
      item[subresource] = item[subresource] || [];
      item[subresource].push(newSubItem);
      item.updated_at = new Date().toISOString();
      
      this.saveToStorage(storageKey, data);
      
      return { success: true, [subresource.slice(0, -1)]: newSubItem };
    }
    
    // Regular POST (create new item)
    const newItem = {
      id: this.generateId(),
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Add default fields based on resource type
    if (resource === 'emails') {
      newItem.status = newItem.status || 'sent';
      newItem.sent_at = newItem.sent_at || new Date().toISOString();
      newItem.confirmed_at = null;
      newItem.tracking_token = this.generateId();
    } else if (resource === 'leads') {
      newItem.status = newItem.status || 'new';
      newItem.threads = newItem.threads || [];
      newItem.objectives = newItem.objectives || [];
      newItem.next_actions = newItem.next_actions || [];
      newItem.revenue = newItem.revenue || 0;
    }
    
    data.push(newItem);
    this.saveToStorage(storageKey, data);
    
    return { success: true, [resource.slice(0, -1)]: newItem, id: newItem.id };
  }
  
  /**
   * Frontend UPDATE request
   */
  frontendUpdate(resource, id, body) {
    const storageKey = `${this.storagePrefix}${resource}`;
    const data = this.getFromStorage(storageKey) || [];
    
    const index = data.findIndex(d => d.id === id);
    if (index === -1) {
      throw new Error(`${resource} not found: ${id}`);
    }
    
    data[index] = {
      ...data[index],
      ...body,
      updated_at: new Date().toISOString()
    };
    
    this.saveToStorage(storageKey, data);
    
    return { success: true, [resource.slice(0, -1)]: data[index] };
  }
  
  /**
   * Frontend DELETE request
   */
  frontendDelete(resource, id) {
    const storageKey = `${this.storagePrefix}${resource}`;
    const data = this.getFromStorage(storageKey) || [];
    
    const index = data.findIndex(d => d.id === id);
    if (index === -1) {
      throw new Error(`${resource} not found: ${id}`);
    }
    
    data.splice(index, 1);
    this.saveToStorage(storageKey, data);
    
    return { success: true };
  }
  
  /**
   * Calculate statistics
   */
  calculateStats() {
    const emails = this.getFromStorage(`${this.storagePrefix}emails`) || [];
    const leads = this.getFromStorage(`${this.storagePrefix}leads`) || [];
    
    const totalEmails = emails.length;
    const confirmedEmails = emails.filter(e => e.status === 'confirmed').length;
    const totalLeads = leads.length;
    const activeLeads = leads.filter(l => l.status === 'active' || l.status === 'engaged').length;
    const totalRevenue = leads.reduce((sum, l) => sum + (l.revenue || 0), 0);
    
    return {
      emails: {
        total: totalEmails,
        confirmed: confirmedEmails,
        confirmationRate: totalEmails > 0 ? (confirmedEmails / totalEmails * 100).toFixed(2) : 0
      },
      leads: {
        total: totalLeads,
        active: activeLeads
      },
      revenue: {
        total: totalRevenue,
        formatted: `$${totalRevenue.toFixed(2)}`
      }
    };
  }
  
  /**
   * Get data from localStorage
   */
  getFromStorage(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  }
  
  /**
   * Save data to localStorage
   */
  saveToStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving to storage:', error);
      return false;
    }
  }
  
  /**
   * Generate unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }
  
  /**
   * Get current status
   */
  getStatus() {
    return {
      mode: this.mode,
      backendAvailable: this.isBackendAvailable,
      backendUrl: this.backendUrl,
      retryAttempts: this.retryAttempts
    };
  }
  
  /**
   * Sync frontend data to backend when it comes online
   */
  async syncToBackend() {
    if (!this.isBackendAvailable) {
      console.warn('Cannot sync - backend not available');
      return false;
    }
    
    console.log('🔄 Syncing frontend data to backend...');
    
    try {
      // Sync emails
      const emails = this.getFromStorage(`${this.storagePrefix}emails`) || [];
      for (const email of emails) {
        try {
          await this.backendRequest('/send-email', {
            method: 'POST',
            body: email
          });
        } catch (error) {
          console.warn('Failed to sync email:', email.id, error.message);
        }
      }
      
      // Sync leads
      const leads = this.getFromStorage(`${this.storagePrefix}leads`) || [];
      for (const lead of leads) {
        try {
          await this.backendRequest('/leads', {
            method: 'POST',
            body: lead
          });
        } catch (error) {
          console.warn('Failed to sync lead:', lead.id, error.message);
        }
      }
      
      console.log('✓ Sync completed successfully');
      return true;
    } catch (error) {
      console.error('Sync failed:', error);
      return false;
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BackendFallbackSystem;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.BackendFallbackSystem = BackendFallbackSystem;
}
