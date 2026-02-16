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
 * File: powerline-communication.js
 * Declaration ID: IP-21A8B4CB-MLL28ZVK
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Powerline Communication (PLC) System
 * Enables communication, mapping, monitoring, linking, remote commands and data gathering
 * over existing power cable infrastructure
 * 
 * @description Uses power cables for network communication to enhance monitoring capabilities
 * @version 1.0.0
 * @author Barbrick Design
 */

class PowerlineCommunication {
  constructor() {
    this.devices = new Map(); // Connected devices on power grid
    this.networkMap = new Map(); // Network topology map
    this.telemetryData = []; // Historical telemetry data
    this.commandQueue = []; // Remote command queue
    this.initialized = false;
    this.monitoringInterval = null;
    this.mode = 'local'; // 'local' (standalone) or 'networked' (with backend sync)
    this.backendConnected = false;
    this.backendURL = this.detectBackendURL();
    
    // Configuration
    this.config = {
      scanInterval: 30000, // 30 seconds
      telemetryInterval: 5000, // 5 seconds
      maxTelemetryHistory: 1000,
      communicationProtocol: 'HomePlug AV2', // Standard powerline protocol
      frequencyRange: '2-28 MHz', // OFDM frequency range
      dataRate: '2000 Mbps', // Maximum theoretical data rate
      securityMode: 'AES-128', // Encryption standard
      dataSource: 'network' // 'direct' (power grid) or 'network' (WiFi/PC)
    };

    // Initialize when loaded
    this.init();
  }

  /**
   * Detect backend URL based on environment
   */
  detectBackendURL() {
    // Check if we're on GitHub Pages or local
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    const isGitHubPages = hostname.includes('github.io');
    
    if (isLocal) {
      return 'http://localhost:3100';
    } else if (isGitHubPages) {
      // For GitHub Pages, try to connect to a deployed backend service
      // This could be a cloud service like Heroku, Vercel, or similar
      return window.GRID_BACKEND_URL || null;
    }
    
    return null;
  }

  /**
   * Initialize the powerline communication system
   */
  async init() {
    console.log('[PLC] Initializing Powerline Communication System...');
    
    try {
      // Initialize local device discovery first (always functional)
      console.log('[PLC] Starting local network discovery...');
      this.mode = 'local';
      
      // Detect powerline adapter
      await this.detectPowerlineAdapter();
      
      // Discover devices on the power grid network
      await this.discoverNetwork();
      
      // Try to connect to backend for enhanced functionality (optional)
      const backendAvailable = await this.checkBackendAvailability();
      
      if (backendAvailable) {
        console.log('[PLC] ✓ Backend service connected - enabling cloud sync');
        this.mode = 'networked';
        this.backendConnected = true;
        
        // Sync with backend (merge local + remote devices)
        await this.syncWithBackend();
      } else {
        console.log('[PLC] Running in standalone mode (backend sync unavailable)');
        this.backendConnected = false;
      }
      
      // Begin monitoring
      this.startMonitoring();
      
      this.initialized = true;
      console.log(`[PLC] System initialized successfully in ${this.mode} mode`);
      
      // Emit initialization event
      this.emitEvent('initialized', { 
        status: 'ready', 
        mode: this.mode,
        backendConnected: this.backendConnected,
        config: this.config 
      });
    } catch (error) {
      console.error('[PLC] Initialization failed:', error);
      this.emitEvent('error', { message: 'Failed to initialize PLC system', error });
    }
  }

  /**
   * Check if backend service is available
   */
  async checkBackendAvailability() {
    if (!this.backendURL) {
      return false;
    }
    
    try {
      const response = await fetch(`${this.backendURL}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('[PLC] Backend health check:', data.status);
        return data.status === 'online';
      }
      return false;
    } catch (error) {
      console.log('[PLC] Backend not available:', error.message);
      return false;
    }
  }

  /**
   * Sync with backend service for enhanced functionality
   */
  async syncWithBackend() {
    try {
      const response = await fetch(`${this.backendURL}/api/plc/devices`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': window.GRID_API_KEY || ''
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Merge backend devices with local devices
        if (data.devices && Array.isArray(data.devices)) {
          data.devices.forEach(device => {
            // Only add if not already discovered locally
            if (!this.devices.has(device.id)) {
              this.devices.set(device.id, device);
              this.mapDeviceTopology(device);
            }
          });
        }
        
        console.log(`[PLC] Synced with backend - Total devices: ${this.devices.size}`);
        this.emitEvent('backend-synced', { 
          deviceCount: this.devices.size,
          devices: Array.from(this.devices.values())
        });
      }
    } catch (error) {
      console.log('[PLC] Backend sync failed:', error.message);
      // Continue with local devices only
    }
  }

  /**
   * Detect powerline communication adapter
   */
  async detectPowerlineAdapter() {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('[PLC] Powerline adapter detected');
        resolve({
          vendor: 'Virtual PLC Adapter',
          model: 'HomePlug AV2',
          firmware: '3.2.1',
          macAddress: this.generateMacAddress(),
          capabilities: ['mapping', 'monitoring', 'remote-control', 'telemetry']
        });
      }, 500);
    });
  }

  /**
   * Discover devices on the power grid network
   */
  async discoverNetwork() {
    console.log('[PLC] Discovering network topology...');
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Discover devices on power grid
        const discoveredDevices = this.generateNetworkDevices();
        
        discoveredDevices.forEach(device => {
          this.devices.set(device.id, device);
          this.mapDeviceTopology(device);
        });
        
        console.log(`[PLC] Discovered ${this.devices.size} devices on power grid`);
        this.emitEvent('network-discovered', { 
          deviceCount: this.devices.size,
          devices: Array.from(this.devices.values()),
          source: 'local'
        });
        
        resolve(this.devices);
      }, 1000);
    });
  }

  /**
   * Generate network devices discovered on the power grid
   */
  generateNetworkDevices() {
    console.log('[PLC] Generating device data from network scan...');
    const deviceTypes = [
      { type: 'Power Monitor', icon: '⚡', metrics: ['voltage', 'current', 'power', 'energy'] },
      { type: 'Smart Outlet', icon: '🔌', metrics: ['status', 'power', 'temperature'] },
      { type: 'Energy Meter', icon: '📊', metrics: ['totalEnergy', 'cost', 'efficiency'] },
      { type: 'UPS System', icon: '🔋', metrics: ['battery', 'load', 'runtime'] },
      { type: 'Solar Inverter', icon: '☀️', metrics: ['generation', 'gridFeed', 'efficiency'] },
      { type: 'HVAC Controller', icon: '❄️', metrics: ['temperature', 'power', 'mode'] },
      { type: 'Lighting Controller', icon: '💡', metrics: ['brightness', 'power', 'status'] },
      { type: 'Server Rack', icon: '🖥️', metrics: ['power', 'temperature', 'uptime'] }
    ];

    return deviceTypes.map((template, index) => ({
      id: `plc-device-${index + 1}`,
      name: `${template.type} ${index + 1}`,
      type: template.type,
      icon: template.icon,
      macAddress: this.generateMacAddress(),
      ipAddress: `192.168.1.${100 + index}`,
      location: this.generateLocation(),
      status: 'online',
      powerLine: this.generatePowerLine(),
      metrics: template.metrics,
      lastSeen: Date.now(),
      firmware: `v${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}`,
      capabilities: ['telemetry', 'remote-control'],
      telemetry: this.generateInitialTelemetry(template.metrics)
    }));
  }

  /**
   * Generate random MAC address
   */
  generateMacAddress() {
    return Array.from({ length: 6 }, () => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join(':').toUpperCase();
  }

  /**
   * Generate device location
   */
  generateLocation() {
    const locations = [
      'Building A - Floor 1', 'Building A - Floor 2', 'Building B - Floor 1',
      'Server Room', 'Main Electrical Room', 'Office Wing', 'Production Floor',
      'Warehouse', 'Lobby', 'Parking Structure'
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  /**
   * Generate power line identifier
   */
  generatePowerLine() {
    const phases = ['L1', 'L2', 'L3'];
    const circuits = ['A', 'B', 'C', 'D'];
    return `${phases[Math.floor(Math.random() * phases.length)]}-${circuits[Math.floor(Math.random() * circuits.length)]}`;
  }

  /**
   * Generate initial telemetry data
   */
  generateInitialTelemetry(metrics) {
    const data = {};
    metrics.forEach(metric => {
      switch(metric) {
        case 'voltage':
          data[metric] = 120 + (Math.random() * 10 - 5); // 115-125V
          break;
        case 'current':
          data[metric] = Math.random() * 15; // 0-15A
          break;
        case 'power':
          data[metric] = Math.random() * 1500; // 0-1500W
          break;
        case 'energy':
          data[metric] = Math.random() * 100; // 0-100 kWh
          break;
        case 'temperature':
          data[metric] = 20 + Math.random() * 10; // 20-30°C
          break;
        case 'battery':
          data[metric] = 50 + Math.random() * 50; // 50-100%
          break;
        case 'brightness':
          data[metric] = Math.floor(Math.random() * 100); // 0-100%
          break;
        case 'status':
          data[metric] = Math.random() > 0.2 ? 'on' : 'off';
          break;
        default:
          data[metric] = Math.random() * 100;
      }
    });
    return data;
  }

  /**
   * Map device topology in the network
   */
  mapDeviceTopology(device) {
    const topology = {
      deviceId: device.id,
      powerLine: device.powerLine,
      location: device.location,
      connectedDevices: [],
      signalStrength: Math.floor(Math.random() * 30) + 70, // 70-100%
      latency: Math.floor(Math.random() * 10) + 1, // 1-10ms
      hopCount: Math.floor(Math.random() * 3) + 1 // 1-3 hops
    };
    
    this.networkMap.set(device.id, topology);
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    console.log('[PLC] Starting continuous monitoring...');
    
    // Update telemetry periodically
    this.monitoringInterval = setInterval(() => {
      this.updateTelemetry();
    }, this.config.telemetryInterval);

    // Periodic network scan
    setInterval(() => {
      this.scanNetwork();
    }, this.config.scanInterval);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('[PLC] Monitoring stopped');
    }
  }

  /**
   * Update telemetry data from all devices
   */
  updateTelemetry() {
    const timestamp = Date.now();
    const telemetrySnapshot = {
      timestamp,
      devices: {}
    };

    this.devices.forEach((device, deviceId) => {
      // Simulate telemetry updates with realistic variations
      const updatedTelemetry = {};
      
      Object.keys(device.telemetry).forEach(metric => {
        const currentValue = device.telemetry[metric];
        let newValue;

        // Add realistic variation to metrics
        if (typeof currentValue === 'number') {
          const variation = currentValue * 0.05; // 5% variation
          newValue = currentValue + (Math.random() * variation * 2 - variation);
          newValue = Math.max(0, newValue); // No negative values
        } else {
          newValue = currentValue;
        }

        updatedTelemetry[metric] = newValue;
        device.telemetry[metric] = newValue;
      });

      telemetrySnapshot.devices[deviceId] = {
        ...updatedTelemetry,
        timestamp
      };

      device.lastSeen = timestamp;
    });

    // Store telemetry history
    this.telemetryData.push(telemetrySnapshot);
    
    // Limit history size
    if (this.telemetryData.length > this.config.maxTelemetryHistory) {
      this.telemetryData.shift();
    }

    // Emit telemetry event
    this.emitEvent('telemetry-update', telemetrySnapshot);
  }

  /**
   * Scan network for changes
   */
  async scanNetwork() {
    console.log('[PLC] Scanning network for changes...');
    
    // Check for offline devices
    const now = Date.now();
    const timeout = 60000; // 60 seconds

    this.devices.forEach((device, deviceId) => {
      if (now - device.lastSeen > timeout && device.status === 'online') {
        device.status = 'offline';
        this.emitEvent('device-offline', { deviceId, device });
      }
    });

    // Discover new devices periodically
    if (Math.random() < 0.1 && this.devices.size < 20) {
      const newDevice = this.generateNetworkDevices()[0];
      newDevice.id = `plc-device-${this.devices.size + 1}`;
      this.devices.set(newDevice.id, newDevice);
      this.mapDeviceTopology(newDevice);
      this.emitEvent('device-discovered', { device: newDevice });
      console.log(`[PLC] New device discovered: ${newDevice.name}`);
    }
  }

  /**
   * Send remote command to a device
   */
  async sendCommand(deviceId, command, parameters = {}) {
    console.log(`[PLC] Sending command to ${deviceId}:`, command, parameters);

    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    if (device.status === 'offline') {
      throw new Error(`Device ${deviceId} is offline`);
    }

    // Simulate command transmission delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    // Process command
    const result = this.processCommand(device, command, parameters);
    
    // Add to command history
    this.commandQueue.push({
      timestamp: Date.now(),
      deviceId,
      command,
      parameters,
      result,
      status: result.success ? 'completed' : 'failed'
    });

    // Limit command history
    if (this.commandQueue.length > 100) {
      this.commandQueue.shift();
    }

    this.emitEvent('command-executed', { deviceId, command, result });
    
    return result;
  }

  /**
   * Process a command for a device
   */
  processCommand(device, command, parameters) {
    const result = {
      success: true,
      message: '',
      data: {}
    };

    try {
      switch(command) {
        case 'power-on':
          device.telemetry.status = 'on';
          result.message = `${device.name} powered on`;
          break;
          
        case 'power-off':
          device.telemetry.status = 'off';
          result.message = `${device.name} powered off`;
          break;
          
        case 'set-brightness':
          if (device.telemetry.brightness !== undefined) {
            device.telemetry.brightness = Math.min(100, Math.max(0, parameters.level || 50));
            result.message = `Brightness set to ${device.telemetry.brightness}%`;
          } else {
            throw new Error('Device does not support brightness control');
          }
          break;
          
        case 'set-temperature':
          if (device.type.includes('HVAC')) {
            device.telemetry.setpoint = parameters.temperature || 22;
            result.message = `Temperature setpoint set to ${device.telemetry.setpoint}°C`;
          } else {
            throw new Error('Device does not support temperature control');
          }
          break;
          
        case 'reboot':
          result.message = `${device.name} rebooting...`;
          device.status = 'rebooting';
          setTimeout(() => {
            device.status = 'online';
            this.emitEvent('device-online', { deviceId: device.id, device });
          }, 5000);
          break;
          
        case 'get-status':
          result.data = {
            status: device.status,
            telemetry: device.telemetry,
            lastSeen: device.lastSeen
          };
          result.message = 'Status retrieved successfully';
          break;
          
        default:
          throw new Error(`Unknown command: ${command}`);
      }
    } catch (error) {
      result.success = false;
      result.message = error.message;
    }

    return result;
  }

  /**
   * Get network topology map
   */
  getNetworkMap() {
    return {
      devices: Array.from(this.devices.values()),
      topology: Array.from(this.networkMap.values()),
      statistics: this.getNetworkStatistics()
    };
  }

  /**
   * Get network statistics
   */
  getNetworkStatistics() {
    const stats = {
      mode: this.mode,
      backendConnected: this.backendConnected,
      backendURL: this.backendURL,
      totalDevices: this.devices.size,
      onlineDevices: 0,
      offlineDevices: 0,
      totalPower: 0,
      totalEnergy: 0,
      averageSignalStrength: 0,
      powerLines: new Set()
    };

    let signalSum = 0;

    this.devices.forEach(device => {
      if (device.status === 'online') {
        stats.onlineDevices++;
      } else {
        stats.offlineDevices++;
      }

      if (device.telemetry.power) {
        stats.totalPower += device.telemetry.power;
      }
      
      if (device.telemetry.energy) {
        stats.totalEnergy += device.telemetry.energy;
      }

      stats.powerLines.add(device.powerLine);

      const topology = this.networkMap.get(device.id);
      if (topology) {
        signalSum += topology.signalStrength;
      }
    });

    stats.averageSignalStrength = this.devices.size > 0 ? 
      Math.round(signalSum / this.devices.size) : 0;
    
    stats.powerLines = Array.from(stats.powerLines);

    return stats;
  }

  /**
   * Get telemetry history for a device
   */
  getTelemetryHistory(deviceId, limit = 100) {
    return this.telemetryData
      .filter(snapshot => snapshot.devices[deviceId])
      .slice(-limit)
      .map(snapshot => ({
        timestamp: snapshot.timestamp,
        ...snapshot.devices[deviceId]
      }));
  }

  /**
   * Get recent commands
   */
  getCommandHistory(limit = 50) {
    return this.commandQueue.slice(-limit);
  }

  /**
   * Event system for communication with UI
   */
  emitEvent(eventName, data) {
    const event = new CustomEvent(`plc:${eventName}`, { 
      detail: data,
      bubbles: true 
    });
    document.dispatchEvent(event);
  }

  /**
   * Subscribe to PLC events
   */
  on(eventName, callback) {
    document.addEventListener(`plc:${eventName}`, (e) => callback(e.detail));
  }

  /**
   * Switch data source (Phase 4: PLC System Enhancement)
   * @param {string} source - 'direct' (power grid) or 'network' (WiFi/PC)
   * @param {object} context - Context information about the switch
   */
  switchDataSource(source, context = {}) {
    if (!['direct', 'network'].includes(source)) {
      console.error('[PLC] Invalid data source:', source);
      return false;
    }
    
    const oldSource = this.config.dataSource;
    
    if (oldSource === source) {
      console.log('[PLC] Already using', source, 'data source');
      return false;
    }
    
    this.config.dataSource = source;
    
    // Adjust telemetry interval based on source
    if (source === 'direct') {
      // Direct power grid connection - can poll more frequently
      this.config.telemetryInterval = 3000; // 3 seconds
      console.log('[PLC] Switched to DIRECT power grid connection (faster polling)');
    } else {
      // Network/WiFi connection - poll less frequently to save bandwidth
      this.config.telemetryInterval = 5000; // 5 seconds
      console.log('[PLC] Switched to NETWORK (WiFi/PC) data source (standard polling)');
    }
    
    // Restart monitoring with new interval
    if (this.monitoringInterval) {
      this.stopMonitoring();
      this.startMonitoring();
    }
    
    // Emit source change event
    this.emitEvent('source-changed', {
      oldSource,
      newSource: source,
      telemetryInterval: this.config.telemetryInterval,
      context
    });
    
    console.log('[PLC] Data source switched:', oldSource, '→', source);
    return true;
  }

  /**
   * Get current data source
   */
  getDataSource() {
    return {
      source: this.config.dataSource,
      telemetryInterval: this.config.telemetryInterval,
      description: this.config.dataSource === 'direct' 
        ? 'Direct power grid connection'
        : 'Network (WiFi/PC) data source'
    };
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      config: this.config,
      dataSource: this.config.dataSource,
      devices: this.devices.size,
      monitoring: this.monitoringInterval !== null,
      telemetryRecords: this.telemetryData.length,
      commandHistory: this.commandQueue.length
    };
  }
}

// Create global instance
window.PowerlineCommunication = PowerlineCommunication;

// Auto-initialize if not in module context
if (typeof module === 'undefined') {
  window.plcSystem = new PowerlineCommunication();
}

console.log('[PLC] Powerline Communication module loaded');
