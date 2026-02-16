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
 * File: mobile-power-grid-agent.js
 * Declaration ID: IP-268A0B06-MLL28ZW0
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Mobile Power Grid Agent
 * Phase 1: Mobile Battery Detection & Grid Data Switching
 * 
 * Features:
 * - Detects if device is on mobile (battery)
 * - Detects if device is plugged into charger (power grid connection)
 * - Automatically switches data source:
 *   - When unplugged: Use WiFi modem/PC grid data
 *   - When plugged in: Use direct power grid connection
 * - Implements event system for data source changes
 * 
 * @version 1.0.0
 * @author Barbrick Design
 */

class MobilePowerGridAgent {
  constructor() {
    this.initialized = false;
    this.batteryAPI = null;
    this.currentSource = 'unknown'; // 'battery', 'charging', 'network'
    this.listeners = new Map();
    this.monitoringInterval = null;
    this.lastBatteryState = null;
    
    // Configuration
    this.config = {
      checkInterval: 5000, // Check battery status every 5 seconds
      enableAutoSwitch: true,
      sources: {
        battery: 'network', // WiFi/PC grid when on battery
        charging: 'direct'  // Direct power grid when plugged in
      }
    };
    
    // Initialize automatically
    this.init();
  }
  
  /**
   * Initialize the mobile power detection system
   */
  async init() {
    console.log('[MobilePowerGridAgent] Initializing...');
    
    try {
      // Check if Battery API is available
      if ('getBattery' in navigator) {
        this.batteryAPI = await navigator.getBattery();
        console.log('[MobilePowerGridAgent] ✓ Battery API available');
        
        // Set up battery event listeners
        this.setupBatteryListeners();
        
        // Get initial battery state
        await this.updateBatteryState();
        
        // Start monitoring
        this.startMonitoring();
        
        this.initialized = true;
        this.emit('initialized', {
          batterySupported: true,
          initialSource: this.currentSource,
          charging: this.batteryAPI.charging,
          level: this.batteryAPI.level
        });
        
        console.log('[MobilePowerGridAgent] ✓ Initialized successfully');
      } else {
        console.warn('[MobilePowerGridAgent] ⚠ Battery API not available - assuming desktop/plugged in');
        this.currentSource = 'network';
        this.initialized = true;
        
        this.emit('initialized', {
          batterySupported: false,
          initialSource: this.currentSource,
          assumedState: 'desktop'
        });
      }
    } catch (error) {
      console.error('[MobilePowerGridAgent] Failed to initialize:', error);
      this.currentSource = 'network';
      this.initialized = true;
      
      this.emit('error', {
        message: 'Failed to initialize battery detection',
        error: error.message
      });
    }
  }
  
  /**
   * Set up battery event listeners
   */
  setupBatteryListeners() {
    if (!this.batteryAPI) return;
    
    // Listen for charging state changes
    this.batteryAPI.addEventListener('chargingchange', () => {
      console.log('[MobilePowerGridAgent] Charging state changed:', this.batteryAPI.charging);
      this.updateBatteryState();
    });
    
    // Listen for battery level changes
    this.batteryAPI.addEventListener('levelchange', () => {
      console.log('[MobilePowerGridAgent] Battery level changed:', this.batteryAPI.level);
      this.updateBatteryState();
    });
    
    // Listen for charging time changes
    this.batteryAPI.addEventListener('chargingtimechange', () => {
      this.updateBatteryState();
    });
    
    // Listen for discharging time changes
    this.batteryAPI.addEventListener('dischargingtimechange', () => {
      this.updateBatteryState();
    });
  }
  
  /**
   * Update battery state and switch data source if needed
   */
  async updateBatteryState() {
    if (!this.batteryAPI) return;
    
    const newState = {
      charging: this.batteryAPI.charging,
      level: this.batteryAPI.level,
      chargingTime: this.batteryAPI.chargingTime,
      dischargingTime: this.batteryAPI.dischargingTime,
      timestamp: Date.now()
    };
    
    // Determine new data source based on charging state
    const newSource = newState.charging ? 'charging' : 'battery';
    const dataSource = this.config.sources[newSource];
    
    // Check if source changed
    if (this.currentSource !== newSource) {
      const oldSource = this.currentSource;
      this.currentSource = newSource;
      
      console.log(`[MobilePowerGridAgent] Source changed: ${oldSource} → ${newSource}`);
      console.log(`[MobilePowerGridAgent] Data source switched: ${dataSource}`);
      
      // Emit source change event
      this.emit('source-changed', {
        oldSource,
        newSource,
        dataSource,
        charging: newState.charging,
        batteryLevel: newState.level,
        recommendation: this.getRecommendation(newState)
      });
      
      // If auto-switch enabled, notify PLC system
      if (this.config.enableAutoSwitch && window.plcSystem) {
        window.plcSystem.switchDataSource(dataSource, {
          reason: 'battery-state-change',
          charging: newState.charging,
          batteryLevel: newState.level
        });
      }
    }
    
    this.lastBatteryState = newState;
    
    // Emit battery update event
    this.emit('battery-update', newState);
  }
  
  /**
   * Get recommendation based on battery state
   */
  getRecommendation(state) {
    if (state.charging) {
      return {
        dataSource: 'direct',
        reason: 'Device is plugged in - using direct power grid connection for optimal data',
        powerMode: 'high-performance'
      };
    } else {
      return {
        dataSource: 'network',
        reason: 'Device on battery - using WiFi/PC grid data to conserve power',
        powerMode: 'power-saver',
        batteryWarning: state.level < 0.2 ? 'Low battery - consider plugging in' : null
      };
    }
  }
  
  /**
   * Start monitoring battery state
   */
  startMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    this.monitoringInterval = setInterval(() => {
      this.updateBatteryState();
    }, this.config.checkInterval);
    
    console.log('[MobilePowerGridAgent] Started monitoring (every', this.config.checkInterval, 'ms)');
  }
  
  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('[MobilePowerGridAgent] Stopped monitoring');
    }
  }
  
  /**
   * Get current battery status
   */
  getBatteryStatus() {
    if (!this.batteryAPI) {
      return {
        supported: false,
        source: this.currentSource,
        dataSource: 'network'
      };
    }
    
    return {
      supported: true,
      charging: this.batteryAPI.charging,
      level: this.batteryAPI.level,
      chargingTime: this.batteryAPI.chargingTime,
      dischargingTime: this.batteryAPI.dischargingTime,
      source: this.currentSource,
      dataSource: this.config.sources[this.currentSource],
      recommendation: this.getRecommendation(this.lastBatteryState || {
        charging: this.batteryAPI.charging,
        level: this.batteryAPI.level
      })
    };
  }
  
  /**
   * Check if device is on mobile (battery power)
   */
  isOnBattery() {
    if (!this.batteryAPI) return false;
    return !this.batteryAPI.charging;
  }
  
  /**
   * Check if device is plugged in (charging)
   */
  isPluggedIn() {
    if (!this.batteryAPI) return true; // Assume desktop is plugged in
    return this.batteryAPI.charging;
  }
  
  /**
   * Manually switch data source
   */
  switchDataSource(source) {
    if (!['network', 'direct'].includes(source)) {
      console.error('[MobilePowerGridAgent] Invalid source:', source);
      return false;
    }
    
    console.log('[MobilePowerGridAgent] Manually switching to:', source);
    
    if (window.plcSystem) {
      window.plcSystem.switchDataSource(source, {
        reason: 'manual-override'
      });
      
      this.emit('source-switched', {
        source,
        manual: true
      });
      
      return true;
    }
    
    console.warn('[MobilePowerGridAgent] PLC system not available');
    return false;
  }
  
  /**
   * Event emitter
   */
  emit(event, data) {
    const handlers = this.listeners.get(event) || [];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`[MobilePowerGridAgent] Error in event handler for ${event}:`, error);
      }
    });
  }
  
  /**
   * Subscribe to events
   */
  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(handler);
  }
  
  /**
   * Unsubscribe from events
   */
  off(event, handler) {
    if (!this.listeners.has(event)) return;
    const handlers = this.listeners.get(event);
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }
  
  /**
   * Get agent health status
   */
  getHealth() {
    return {
      initialized: this.initialized,
      batteryAPIAvailable: this.batteryAPI !== null,
      currentSource: this.currentSource,
      monitoring: this.monitoringInterval !== null,
      lastUpdate: this.lastBatteryState?.timestamp || null,
      status: this.initialized ? 'healthy' : 'initializing'
    };
  }
  
  /**
   * Cleanup
   */
  destroy() {
    this.stopMonitoring();
    this.listeners.clear();
    console.log('[MobilePowerGridAgent] Destroyed');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MobilePowerGridAgent;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.MobilePowerGridAgent = MobilePowerGridAgent;
}
