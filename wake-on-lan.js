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
 * File: wake-on-lan.js
 * Declaration ID: IP-3ADC9083-MLL28ZWM
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
 * Wake on LAN Client Library
 * Provides client-side interface to send Wake on LAN requests to the backend service
 */

class WakeOnLANClient {
  constructor(baseURL = 'http://localhost:3010') {
    this.baseURL = baseURL;
    this.devices = this.loadDevices();
  }

  /**
   * Load saved devices from localStorage
   * @returns {Array} Array of saved devices
   */
  loadDevices() {
    try {
      const saved = localStorage.getItem('wol-devices');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('[WOL] Error loading devices:', error);
      return [];
    }
  }

  /**
   * Save devices to localStorage
   */
  saveDevices() {
    try {
      localStorage.setItem('wol-devices', JSON.stringify(this.devices));
    } catch (error) {
      console.error('[WOL] Error saving devices:', error);
    }
  }

  /**
   * Add a new device
   * @param {Object} device - Device configuration
   * @param {string} device.name - Device name
   * @param {string} device.macAddress - MAC address
   * @param {string} device.ipAddress - Optional broadcast IP address
   * @param {number} device.port - Optional UDP port
   * @param {string} device.type - Optional device type (e.g., 'fridge', 'tv', 'computer')
   * @returns {Object} Added device with ID
   */
  addDevice(device) {
    const newDevice = {
      id: Date.now().toString(),
      name: device.name,
      macAddress: device.macAddress,
      ipAddress: device.ipAddress || '255.255.255.255',
      port: device.port || 9,
      type: device.type || 'other',
      status: 'unknown',
      lastWake: null,
      addedAt: new Date().toISOString()
    };

    this.devices.push(newDevice);
    this.saveDevices();
    
    console.log('[WOL] Device added:', newDevice.name);
    return newDevice;
  }

  /**
   * Remove a device by ID
   * @param {string} deviceId - Device ID
   * @returns {boolean} True if device was removed
   */
  removeDevice(deviceId) {
    const index = this.devices.findIndex(d => d.id === deviceId);
    if (index !== -1) {
      const device = this.devices.splice(index, 1)[0];
      this.saveDevices();
      console.log('[WOL] Device removed:', device.name);
      return true;
    }
    return false;
  }

  /**
   * Update device information
   * @param {string} deviceId - Device ID
   * @param {Object} updates - Fields to update
   * @returns {Object|null} Updated device or null if not found
   */
  updateDevice(deviceId, updates) {
    const device = this.devices.find(d => d.id === deviceId);
    if (device) {
      Object.assign(device, updates);
      this.saveDevices();
      console.log('[WOL] Device updated:', device.name);
      return device;
    }
    return null;
  }

  /**
   * Get all devices
   * @returns {Array} Array of devices
   */
  getDevices() {
    return this.devices;
  }

  /**
   * Get device by ID
   * @param {string} deviceId - Device ID
   * @returns {Object|null} Device or null if not found
   */
  getDevice(deviceId) {
    return this.devices.find(d => d.id === deviceId) || null;
  }

  /**
   * Validate MAC address format
   * @param {string} macAddress - MAC address to validate
   * @returns {boolean} True if valid
   */
  validateMACAddress(macAddress) {
    const pattern = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return pattern.test(macAddress);
  }

  /**
   * Wake a device by sending magic packet with AI script injection
   * @param {string} deviceId - Device ID
   * @param {Object} options - Wake options
   * @param {boolean} options.injectAI - Whether to inject AI script (default: true)
   * @param {boolean} options.waitForAck - Whether to wait for acknowledgment (default: true)
   * @returns {Promise<Object>} Result of wake request with acknowledgment
   */
  async wakeDevice(deviceId, options = {}) {
    const device = this.getDevice(deviceId);
    if (!device) {
      throw new Error('Device not found');
    }

    const { injectAI = true, waitForAck = true } = options;

    try {
      console.log(`[WOL] Waking device: ${device.name} (${device.macAddress})`);
      
      const response = await fetch(`${this.baseURL}/wake`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          macAddress: device.macAddress,
          ipAddress: device.ipAddress,
          port: device.port,
          injectAI: injectAI,
          waitForAck: waitForAck,
          deviceId: deviceId
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Update device status
        this.updateDevice(deviceId, {
          status: 'waking',
          lastWake: new Date().toISOString(),
          aiInjected: injectAI,
          acknowledged: result.acknowledged || false
        });
        
        console.log(`[WOL] Magic packet sent to ${device.name}`);
        if (injectAI) {
          console.log(`[WOL] AI script injection initiated for ${device.name}`);
        }
        if (result.acknowledged) {
          console.log(`[WOL] Device ${device.name} acknowledged wake-up signal`);
        }
      } else {
        console.error(`[WOL] Failed to wake ${device.name}:`, result.error);
      }
      
      return result;
    } catch (error) {
      console.error(`[WOL] Error waking device ${device.name}:`, error);
      throw error;
    }
  }

  /**
   * Wake multiple devices
   * @param {Array<string>} deviceIds - Array of device IDs
   * @returns {Promise<Object>} Results of wake requests
   */
  async wakeDevices(deviceIds) {
    const devices = deviceIds
      .map(id => this.getDevice(id))
      .filter(d => d !== null);

    if (devices.length === 0) {
      throw new Error('No valid devices found');
    }

    try {
      const response = await fetch(`${this.baseURL}/wake-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          devices: devices.map(d => ({
            macAddress: d.macAddress,
            ipAddress: d.ipAddress,
            port: d.port
          }))
        })
      });

      const result = await response.json();
      
      // Update device statuses
      devices.forEach(device => {
        this.updateDevice(device.id, {
          status: 'waking',
          lastWake: new Date().toISOString()
        });
      });
      
      return result;
    } catch (error) {
      console.error('[WOL] Error waking devices:', error);
      throw error;
    }
  }

  /**
   * Check if backend service is available
   * @returns {Promise<boolean>} True if service is available
   */
  async checkServiceHealth() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      const result = await response.json();
      return result.status === 'ok';
    } catch (error) {
      console.error('[WOL] Service health check failed:', error);
      return false;
    }
  }

  /**
   * Listen for device acknowledgment signals
   * @param {string} deviceId - Device ID to monitor
   * @param {number} timeout - Timeout in milliseconds (default: 30000)
   * @returns {Promise<Object>} Acknowledgment data or timeout
   */
  async listenForAcknowledgment(deviceId, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        document.removeEventListener('wol-device-ack', listener);
        reject(new Error('Acknowledgment timeout'));
      }, timeout);

      const listener = (event) => {
        if (event.detail.deviceId === deviceId) {
          clearTimeout(timeoutId);
          document.removeEventListener('wol-device-ack', listener);
          resolve(event.detail);
        }
      };

      document.addEventListener('wol-device-ack', listener);
      
      // Note: The actual acknowledgment event should be dispatched by the backend
      // via WebSocket or Server-Sent Events in production. This is a simulation-ready
      // implementation that can be integrated with real-time communication.
    });
  }

  /**
   * Send command to device over power line modulation
   * @param {string} deviceId - Device ID
   * @param {Object} command - Command to send
   * @returns {Promise<Object>} Command result
   */
  async sendPowerLineCommand(deviceId, command) {
    const device = this.getDevice(deviceId);
    if (!device) {
      throw new Error('Device not found');
    }

    try {
      console.log(`[WOL] Sending power line command to ${device.name}:`, command.type);
      
      const response = await fetch(`${this.baseURL}/plc-command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deviceId: deviceId,
          macAddress: device.macAddress,
          command: command
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`[WOL] Command sent successfully to ${device.name}`);
      }
      
      return result;
    } catch (error) {
      console.error(`[WOL] Error sending command to ${device.name}:`, error);
      throw error;
    }
  }

  /**
   * Get device heartbeat status
   * @param {string} deviceId - Device ID
   * @returns {Promise<Object>} Device heartbeat data
   */
  async getDeviceHeartbeat(deviceId) {
    const device = this.getDevice(deviceId);
    if (!device) {
      throw new Error('Device not found');
    }

    try {
      const response = await fetch(`${this.baseURL}/device-heartbeat/${deviceId}`);
      const result = await response.json();
      
      if (result.online) {
        this.updateDevice(deviceId, {
          status: 'online',
          lastHeartbeat: result.lastHeartbeat
        });
      }
      
      return result;
    } catch (error) {
      console.error(`[WOL] Error getting heartbeat for ${device.name}:`, error);
      throw error;
    }
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WakeOnLANClient;
}
