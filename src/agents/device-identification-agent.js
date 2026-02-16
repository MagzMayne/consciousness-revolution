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
 * File: device-identification-agent.js
 * Declaration ID: IP-509AED26-MLL28ZVY
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Device Identification Agent
 * Phase 2: Device Identification by Power Draw
 * 
 * Features:
 * - Power signature analysis system
 * - Device fingerprinting based on unique power draw patterns
 * - Device identification database (12 device types)
 * - Real-time power draw monitoring and matching
 * - Learning mode for unknown devices
 * - 85% confidence threshold for identification
 * 
 * @version 1.0.0
 * @author Barbrick Design
 */

class DeviceIdentificationAgent {
  constructor() {
    this.initialized = false;
    this.deviceDatabase = new Map();
    this.identifiedDevices = new Map();
    this.unknownDevices = new Map();
    this.listeners = new Map();
    this.monitoringInterval = null;
    this.learningMode = false;
    
    // Configuration
    this.config = {
      confidenceThreshold: 0.85, // 85% confidence required
      checkInterval: 10000, // Check power signatures every 10 seconds
      enableLearning: true,
      signatureWindow: 30, // Samples for signature analysis
      matchTolerance: 0.15 // 15% tolerance for pattern matching
    };
    
    // Initialize device database
    this.initializeDeviceDatabase();
    
    // Initialize automatically
    this.init();
  }
  
  /**
   * Initialize device signature database
   */
  initializeDeviceDatabase() {
    // Define power signatures for 12 common device types
    const signatures = [
      {
        id: 'laptop',
        name: 'Laptop Computer',
        icon: '💻',
        signature: {
          basePower: 45, // Watts
          variance: 15,
          pattern: 'variable', // Spikes when processing
          frequency: 'medium', // Changes every few seconds
          startup: 65,
          idle: 25,
          peakPower: 85
        }
      },
      {
        id: 'desktop',
        name: 'Desktop Computer',
        icon: '🖥️',
        signature: {
          basePower: 120,
          variance: 40,
          pattern: 'variable',
          frequency: 'high',
          startup: 200,
          idle: 80,
          peakPower: 300
        }
      },
      {
        id: 'monitor',
        name: 'LCD Monitor',
        icon: '🖥️',
        signature: {
          basePower: 30,
          variance: 5,
          pattern: 'steady',
          frequency: 'low',
          startup: 45,
          idle: 28,
          peakPower: 40
        }
      },
      {
        id: 'led-light',
        name: 'LED Light Bulb',
        icon: '💡',
        signature: {
          basePower: 10,
          variance: 1,
          pattern: 'constant',
          frequency: 'none',
          startup: 12,
          idle: 10,
          peakPower: 12
        }
      },
      {
        id: 'refrigerator',
        name: 'Refrigerator',
        icon: '🧊',
        signature: {
          basePower: 150,
          variance: 80,
          pattern: 'cyclic', // Compressor cycles
          frequency: 'low',
          startup: 400,
          idle: 100,
          peakPower: 500
        }
      },
      {
        id: 'microwave',
        name: 'Microwave Oven',
        icon: '📡',
        signature: {
          basePower: 1200,
          variance: 50,
          pattern: 'constant-high',
          frequency: 'none',
          startup: 1400,
          idle: 5,
          peakPower: 1500
        }
      },
      {
        id: 'tv',
        name: 'Television',
        icon: '📺',
        signature: {
          basePower: 80,
          variance: 20,
          pattern: 'variable',
          frequency: 'medium',
          startup: 120,
          idle: 50,
          peakPower: 150
        }
      },
      {
        id: 'router',
        name: 'WiFi Router',
        icon: '📡',
        signature: {
          basePower: 12,
          variance: 3,
          pattern: 'steady-variable',
          frequency: 'high',
          startup: 15,
          idle: 10,
          peakPower: 18
        }
      },
      {
        id: 'hvac',
        name: 'HVAC System',
        icon: '❄️',
        signature: {
          basePower: 3500,
          variance: 500,
          pattern: 'cyclic-heavy',
          frequency: 'low',
          startup: 5000,
          idle: 200,
          peakPower: 6000
        }
      },
      {
        id: 'washing-machine',
        name: 'Washing Machine',
        icon: '🧺',
        signature: {
          basePower: 500,
          variance: 200,
          pattern: 'multi-phase', // Fill, wash, spin cycles
          frequency: 'low',
          startup: 800,
          idle: 5,
          peakPower: 1200
        }
      },
      {
        id: 'printer',
        name: 'Laser Printer',
        icon: '🖨️',
        signature: {
          basePower: 50,
          variance: 400,
          pattern: 'burst', // High power when printing
          frequency: 'sporadic',
          startup: 100,
          idle: 10,
          peakPower: 600
        }
      },
      {
        id: 'phone-charger',
        name: 'Phone Charger',
        icon: '📱',
        signature: {
          basePower: 5,
          variance: 2,
          pattern: 'declining', // Decreases as battery fills
          frequency: 'slow',
          startup: 10,
          idle: 2,
          peakPower: 12
        }
      }
    ];
    
    signatures.forEach(sig => {
      this.deviceDatabase.set(sig.id, sig);
    });
    
    console.log('[DeviceIdentificationAgent] Loaded', signatures.length, 'device signatures');
  }
  
  /**
   * Initialize the agent
   */
  async init() {
    console.log('[DeviceIdentificationAgent] Initializing...');
    
    try {
      this.initialized = true;
      
      // Start monitoring if PLC system is available
      if (window.plcSystem) {
        this.startMonitoring();
      } else {
        console.warn('[DeviceIdentificationAgent] PLC system not yet available, waiting...');
        // Listen for PLC initialization
        window.addEventListener('plc-initialized', () => {
          console.log('[DeviceIdentificationAgent] PLC system now available');
          this.startMonitoring();
        });
      }
      
      this.emit('initialized', {
        deviceTypes: this.deviceDatabase.size,
        confidenceThreshold: this.config.confidenceThreshold,
        learningEnabled: this.config.enableLearning
      });
      
      console.log('[DeviceIdentificationAgent] ✓ Initialized successfully');
    } catch (error) {
      console.error('[DeviceIdentificationAgent] Failed to initialize:', error);
      this.emit('error', {
        message: 'Failed to initialize device identification',
        error: error.message
      });
    }
  }
  
  /**
   * Start monitoring power signatures
   */
  startMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    this.monitoringInterval = setInterval(() => {
      this.analyzeDevices();
    }, this.config.checkInterval);
    
    console.log('[DeviceIdentificationAgent] Started monitoring');
    
    // Perform initial analysis
    this.analyzeDevices();
  }
  
  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('[DeviceIdentificationAgent] Stopped monitoring');
    }
  }
  
  /**
   * Analyze devices and identify them by power signature
   */
  analyzeDevices() {
    if (!window.plcSystem || !window.plcSystem.devices) {
      return;
    }
    
    const devices = Array.from(window.plcSystem.devices.values());
    
    devices.forEach(device => {
      // Skip if already identified with high confidence
      if (this.identifiedDevices.has(device.id)) {
        const existing = this.identifiedDevices.get(device.id);
        if (existing.confidence > 0.95) {
          return; // Already confidently identified
        }
      }
      
      // Analyze power signature
      const identification = this.identifyDevice(device);
      
      if (identification.confidence >= this.config.confidenceThreshold) {
        // Device identified!
        this.identifiedDevices.set(device.id, identification);
        
        console.log(`[DeviceIdentificationAgent] ✓ Identified: ${device.name} → ${identification.type.name} (${(identification.confidence * 100).toFixed(1)}%)`);
        
        this.emit('device-identified', {
          deviceId: device.id,
          deviceName: device.name,
          identification
        });
      } else if (this.config.enableLearning) {
        // Unknown device - add to learning queue
        if (!this.unknownDevices.has(device.id)) {
          this.unknownDevices.set(device.id, {
            device,
            samples: [],
            firstSeen: Date.now()
          });
          
          console.log(`[DeviceIdentificationAgent] ? Unknown device: ${device.name} (${(identification.confidence * 100).toFixed(1)}% confidence)`);
          
          this.emit('unknown-device', {
            deviceId: device.id,
            deviceName: device.name,
            bestGuess: identification
          });
        }
      }
    });
  }
  
  /**
   * Identify a device by analyzing its power signature
   */
  identifyDevice(device) {
    if (!device.telemetry) {
      return {
        type: null,
        confidence: 0,
        reason: 'No telemetry data available'
      };
    }
    
    const power = device.telemetry.power || 0;
    const voltage = device.telemetry.voltage || 120;
    const current = device.telemetry.current || 0;
    
    // Calculate actual power if not provided
    const actualPower = power || (voltage * current);
    
    let bestMatch = null;
    let bestScore = 0;
    
    // Compare against all known signatures
    this.deviceDatabase.forEach(signature => {
      const score = this.calculateSignatureMatch(actualPower, device, signature);
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = signature;
      }
    });
    
    return {
      type: bestMatch,
      confidence: bestScore,
      power: actualPower,
      reason: this.getMatchReason(actualPower, bestMatch)
    };
  }
  
  /**
   * Calculate how well a device matches a signature
   */
  calculateSignatureMatch(actualPower, device, signature) {
    let score = 0;
    let factors = 0;
    
    // Factor 1: Base power match (40% weight)
    const powerDiff = Math.abs(actualPower - signature.signature.basePower);
    const powerTolerance = signature.signature.basePower * this.config.matchTolerance;
    
    if (powerDiff <= powerTolerance) {
      const powerScore = 1 - (powerDiff / powerTolerance);
      score += powerScore * 0.4;
    }
    factors += 0.4;
    
    // Factor 2: Power range check (30% weight)
    const withinRange = actualPower >= (signature.signature.idle * 0.9) &&
                       actualPower <= (signature.signature.peakPower * 1.1);
    
    if (withinRange) {
      score += 0.3;
    }
    factors += 0.3;
    
    // Factor 3: Device type hints from metadata (20% weight)
    if (device.type && signature.name.toLowerCase().includes(device.type.toLowerCase())) {
      score += 0.2;
    }
    factors += 0.2;
    
    // Factor 4: Name matching (10% weight)
    if (device.name && signature.name.toLowerCase().includes(device.name.toLowerCase())) {
      score += 0.1;
    }
    factors += 0.1;
    
    // Normalize score
    return score / factors;
  }
  
  /**
   * Get human-readable reason for match
   */
  getMatchReason(power, signature) {
    if (!signature) return 'No matching signature found';
    
    const reasons = [];
    
    if (power >= signature.signature.idle && power <= signature.signature.peakPower) {
      reasons.push('Power draw within expected range');
    }
    
    const powerDiff = Math.abs(power - signature.signature.basePower);
    if (powerDiff < signature.signature.basePower * 0.1) {
      reasons.push('Very close to typical power draw');
    } else if (powerDiff < signature.signature.basePower * 0.2) {
      reasons.push('Close to typical power draw');
    }
    
    return reasons.join(', ') || 'Pattern analysis match';
  }
  
  /**
   * Enable learning mode
   */
  enableLearning() {
    this.learningMode = true;
    this.config.enableLearning = true;
    console.log('[DeviceIdentificationAgent] Learning mode enabled');
    
    this.emit('learning-mode-changed', {
      enabled: true
    });
  }
  
  /**
   * Disable learning mode
   */
  disableLearning() {
    this.learningMode = false;
    this.config.enableLearning = false;
    console.log('[DeviceIdentificationAgent] Learning mode disabled');
    
    this.emit('learning-mode-changed', {
      enabled: false
    });
  }
  
  /**
   * Add a new device signature from learning
   */
  addDeviceSignature(id, name, icon, signature) {
    const newDevice = {
      id,
      name,
      icon,
      signature
    };
    
    this.deviceDatabase.set(id, newDevice);
    
    console.log('[DeviceIdentificationAgent] Added new device signature:', name);
    
    this.emit('signature-added', {
      deviceId: id,
      deviceName: name
    });
    
    return newDevice;
  }
  
  /**
   * Get identification results
   */
  getIdentificationResults() {
    const results = {
      identified: Array.from(this.identifiedDevices.values()),
      unknown: Array.from(this.unknownDevices.values()),
      databaseSize: this.deviceDatabase.size,
      confidenceThreshold: this.config.confidenceThreshold
    };
    
    return results;
  }
  
  /**
   * Get device database
   */
  getDeviceDatabase() {
    return Array.from(this.deviceDatabase.values());
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
        console.error(`[DeviceIdentificationAgent] Error in event handler for ${event}:`, error);
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
      monitoring: this.monitoringInterval !== null,
      deviceTypesKnown: this.deviceDatabase.size,
      devicesIdentified: this.identifiedDevices.size,
      unknownDevices: this.unknownDevices.size,
      learningMode: this.learningMode,
      status: this.initialized ? 'healthy' : 'initializing'
    };
  }
  
  /**
   * Cleanup
   */
  destroy() {
    this.stopMonitoring();
    this.listeners.clear();
    console.log('[DeviceIdentificationAgent] Destroyed');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DeviceIdentificationAgent;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.DeviceIdentificationAgent = DeviceIdentificationAgent;
}
