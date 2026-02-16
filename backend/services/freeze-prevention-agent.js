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
 * File: freeze-prevention-agent.js
 * Declaration ID: IP-11FADA99-MLL28ZUL
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Freeze Prevention Agent for Power Line Protection
 * =================================================
 * Autonomous agent that monitors temperature and prevents power line freezing
 * using pulse modulation techniques
 * 
 * Features:
 * - Temperature monitoring across grid infrastructure
 * - Automatic activation when conditions approach freezing
 * - Pulse modulation to prevent ice buildup on power lines
 * - Adaptive response based on weather severity
 * - Integration with grid AI agent system
 */

const EventEmitter = require('events');

class FreezePreventionAgent extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.id = config.id || `freeze-prevention-${Date.now()}`;
    this.status = 'initializing';
    
    this.config = {
      // Temperature thresholds (Celsius)
      freezeThreshold: config.freezeThreshold || 2,      // Start monitoring at 2°C
      criticalThreshold: config.criticalThreshold || -5,  // Critical ice conditions
      activationThreshold: config.activationThreshold || 0, // Activate at 0°C
      
      // Monitoring intervals
      monitoringInterval: config.monitoringInterval || 30000, // 30 seconds
      pulseInterval: config.pulseInterval || 60000,          // 1 minute between pulses
      
      // Pulse modulation parameters
      pulseFrequency: config.pulseFrequency || 60,           // Base frequency Hz
      pulseModulation: config.pulseModulation || 0.3,        // Modulation amplitude
      pulseDuration: config.pulseDuration || 500,            // 500ms pulse duration
      pulsePattern: config.pulsePattern || 'anti-freeze',    // Specialized pattern
      
      // Safety parameters
      maxContinuousPulses: config.maxContinuousPulses || 100,
      cooldownPeriod: config.cooldownPeriod || 300000,       // 5 minutes cooldown
      
      ...config
    };
    
    this.metrics = {
      temperaturesMonitored: 0,
      freezeEventsDetected: 0,
      pulsesActivated: 0,
      linesProtected: 0,
      activationTime: null,
      lastPulseTime: null
    };
    
    this.temperatureData = new Map(); // Store temperature readings per location
    this.activeLocations = new Set(); // Locations currently being protected
    this.pulseCount = 0;
    this.isActive = false;
    this.monitoringTimer = null;
    this.plcModulation = null;
  }
  
  /**
   * Initialize and activate the freeze prevention agent
   */
  async activate(plcModulation) {
    console.log(`[Freeze Prevention] Activating agent ${this.id}...`);
    
    this.plcModulation = plcModulation;
    this.status = 'active';
    this.isActive = true;
    
    // Start temperature monitoring
    this.startMonitoring();
    
    this.emit('activated', {
      id: this.id,
      timestamp: Date.now(),
      config: this.config
    });
    
    console.log(`[Freeze Prevention] Agent activated - Monitoring for freezing conditions`);
  }
  
  /**
   * Deactivate the agent
   */
  deactivate() {
    console.log(`[Freeze Prevention] Deactivating agent ${this.id}...`);
    
    this.isActive = false;
    this.status = 'inactive';
    
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = null;
    }
    
    // Stop any active freeze prevention pulses
    this.stopFreezePrevention();
    
    this.emit('deactivated', {
      id: this.id,
      metrics: this.metrics,
      timestamp: Date.now()
    });
  }
  
  /**
   * Start temperature monitoring loop
   */
  startMonitoring() {
    // Initial monitoring check
    this.monitorTemperatures();
    
    // Set up periodic monitoring
    this.monitoringTimer = setInterval(() => {
      this.monitorTemperatures();
    }, this.config.monitoringInterval);
    
    console.log(`[Freeze Prevention] Temperature monitoring started (interval: ${this.config.monitoringInterval}ms)`);
  }
  
  /**
   * Monitor temperatures across the grid
   */
  async monitorTemperatures() {
    try {
      // Collect temperature data from multiple sources
      const temperatures = await this.collectTemperatureData();
      
      this.metrics.temperaturesMonitored += temperatures.length;
      
      // Analyze temperatures and determine if freeze prevention needed
      for (const tempReading of temperatures) {
        this.processTemperatureReading(tempReading);
      }
      
      // Emit monitoring update
      this.emit('monitoring-update', {
        temperatures,
        activeLocations: Array.from(this.activeLocations),
        timestamp: Date.now()
      });
      
    } catch (error) {
      console.error(`[Freeze Prevention] Monitoring error:`, error);
      this.emit('error', { error, timestamp: Date.now() });
    }
  }
  
  /**
   * Collect temperature data from grid sensors and weather sources
   */
  async collectTemperatureData() {
    // In production, this would query actual temperature sensors on power lines
    // and integrate with weather APIs
    
    const temperatures = [];
    const locations = [
      'substation-north', 'substation-south', 'substation-east', 'substation-west',
      'line-segment-1', 'line-segment-2', 'line-segment-3', 'line-segment-4',
      'tower-01', 'tower-02', 'tower-03', 'tower-04'
    ];
    
    for (const location of locations) {
      // Simulate temperature readings (in production, read from actual sensors)
      // Current simulation includes some variation and seasonal effects
      const baseTemp = this.getSimulatedTemperature();
      const locationVariation = (Math.random() - 0.5) * 5;
      const temperature = baseTemp + locationVariation;
      
      const reading = {
        location,
        temperature,
        humidity: 60 + Math.random() * 30,
        windSpeed: Math.random() * 20,
        precipitation: Math.random() > 0.8,
        timestamp: Date.now()
      };
      
      temperatures.push(reading);
      this.temperatureData.set(location, reading);
    }
    
    return temperatures;
  }
  
  /**
   * Get simulated temperature (in production, replace with real sensor data)
   */
  getSimulatedTemperature() {
    // Simulate winter conditions with some random variation
    // In production, this would be actual sensor readings
    const hour = new Date().getHours();
    const nightCooling = hour < 6 || hour > 20 ? -3 : 0;
    const baseWinterTemp = -2; // Simulating winter freeze conditions
    const randomVariation = (Math.random() - 0.5) * 4;
    
    return baseWinterTemp + nightCooling + randomVariation;
  }
  
  /**
   * Process a temperature reading and take action if needed
   */
  processTemperatureReading(reading) {
    const { location, temperature, windSpeed, precipitation } = reading;
    
    // Calculate freeze risk based on multiple factors
    const windChillFactor = windSpeed > 10 ? -2 : 0;
    const precipitationFactor = precipitation ? -1 : 0;
    const effectiveTemp = temperature + windChillFactor + precipitationFactor;
    
    // Determine if freeze prevention needed
    if (effectiveTemp <= this.config.activationThreshold) {
      if (!this.activeLocations.has(location)) {
        console.log(`[Freeze Prevention] ⚠️  FREEZE RISK DETECTED at ${location}: ${effectiveTemp.toFixed(1)}°C`);
        this.metrics.freezeEventsDetected++;
        
        // Activate freeze prevention for this location
        this.activateFreezePrevention(location, reading);
      }
      
      // Check for critical conditions
      if (effectiveTemp <= this.config.criticalThreshold) {
        this.handleCriticalConditions(location, reading);
      }
    } else if (effectiveTemp > this.config.freezeThreshold) {
      // Conditions improved, can deactivate protection
      if (this.activeLocations.has(location)) {
        console.log(`[Freeze Prevention] ✓ Conditions improved at ${location}: ${effectiveTemp.toFixed(1)}°C`);
        this.deactivateFreezePrevention(location);
      }
    }
  }
  
  /**
   * Activate freeze prevention for a specific location
   */
  activateFreezePrevention(location, reading) {
    console.log(`[Freeze Prevention] 🔥 Activating anti-freeze pulse modulation for ${location}`);
    
    this.activeLocations.add(location);
    this.metrics.linesProtected++;
    
    if (!this.metrics.activationTime) {
      this.metrics.activationTime = Date.now();
    }
    
    // Start pulse modulation to prevent freezing
    this.startAntiFreezePulses(location, reading);
    
    this.emit('freeze-prevention-activated', {
      location,
      temperature: reading.temperature,
      timestamp: Date.now()
    });
  }
  
  /**
   * Deactivate freeze prevention for a location
   */
  deactivateFreezePrevention(location) {
    this.activeLocations.delete(location);
    
    if (this.activeLocations.size === 0) {
      this.metrics.activationTime = null;
    }
    
    this.emit('freeze-prevention-deactivated', {
      location,
      timestamp: Date.now()
    });
  }
  
  /**
   * Start anti-freeze pulse modulation
   */
  async startAntiFreezePulses(location, reading) {
    if (!this.plcModulation) {
      console.error('[Freeze Prevention] PLC modulation system not available');
      return;
    }
    
    // Check pulse count and cooldown
    if (this.pulseCount >= this.config.maxContinuousPulses) {
      const timeSinceLastPulse = Date.now() - this.metrics.lastPulseTime;
      if (timeSinceLastPulse < this.config.cooldownPeriod) {
        console.log('[Freeze Prevention] Cooldown period active, deferring pulse');
        return;
      } else {
        // Reset pulse count after cooldown
        this.pulseCount = 0;
      }
    }
    
    // Calculate pulse intensity based on temperature severity
    const severity = this.calculateSeverity(reading.temperature);
    const pulseIntensity = this.calculatePulseIntensity(severity);
    
    // Generate anti-freeze pulse pattern
    const pulseData = {
      type: 'anti-freeze',
      location,
      temperature: reading.temperature,
      severity,
      intensity: pulseIntensity,
      pattern: this.generateAntiFreezPattern(severity),
      timestamp: Date.now()
    };
    
    try {
      // Send pulse modulation through power lines
      const transmissionId = this.plcModulation.sendData(location, pulseData, {
        priority: severity === 'critical' ? 'high' : 'normal',
        frequency: this.config.pulseFrequency
      });
      
      this.pulseCount++;
      this.metrics.pulsesActivated++;
      this.metrics.lastPulseTime = Date.now();
      
      console.log(`[Freeze Prevention] 📡 Anti-freeze pulse transmitted to ${location} (Intensity: ${pulseIntensity.toFixed(2)}, Severity: ${severity})`);
      
      this.emit('pulse-transmitted', {
        transmissionId,
        location,
        pulseData,
        timestamp: Date.now()
      });
      
      // Schedule next pulse if conditions persist
      if (this.activeLocations.has(location)) {
        setTimeout(() => {
          if (this.activeLocations.has(location) && this.isActive) {
            this.startAntiFreezePulses(location, reading);
          }
        }, this.config.pulseInterval);
      }
      
    } catch (error) {
      console.error(`[Freeze Prevention] Failed to send anti-freeze pulse:`, error);
      this.emit('pulse-error', { location, error, timestamp: Date.now() });
    }
  }
  
  /**
   * Stop all freeze prevention operations
   */
  stopFreezePrevention() {
    const locations = Array.from(this.activeLocations);
    
    for (const location of locations) {
      this.deactivateFreezePrevention(location);
    }
    
    console.log('[Freeze Prevention] All anti-freeze operations stopped');
  }
  
  /**
   * Handle critical freezing conditions
   */
  handleCriticalConditions(location, reading) {
    console.log(`[Freeze Prevention] 🚨 CRITICAL: Severe ice conditions at ${location}: ${reading.temperature.toFixed(1)}°C`);
    
    // Send high-priority alert
    this.emit('critical-freeze-alert', {
      location,
      temperature: reading.temperature,
      severity: 'critical',
      message: `Severe freezing conditions detected. Ice formation imminent.`,
      timestamp: Date.now()
    });
    
    // Increase pulse frequency for critical conditions
    if (this.plcModulation) {
      // Send immediate high-intensity pulse
      const emergencyPulse = {
        type: 'emergency-anti-freeze',
        location,
        temperature: reading.temperature,
        intensity: 1.0,
        pattern: this.generateAntiFreezPattern('critical'),
        timestamp: Date.now()
      };
      
      this.plcModulation.sendData(location, emergencyPulse, {
        priority: 'high',
        frequency: this.config.pulseFrequency
      });
    }
  }
  
  /**
   * Calculate severity level based on temperature
   */
  calculateSeverity(temperature) {
    if (temperature <= this.config.criticalThreshold) {
      return 'critical';
    } else if (temperature <= -2) {
      return 'high';
    } else if (temperature <= 0) {
      return 'medium';
    } else {
      return 'low';
    }
  }
  
  /**
   * Calculate pulse intensity based on severity
   */
  calculatePulseIntensity(severity) {
    const intensityMap = {
      'critical': 1.0,
      'high': 0.8,
      'medium': 0.6,
      'low': 0.4
    };
    
    return intensityMap[severity] || 0.5;
  }
  
  /**
   * Generate anti-freeze pulse pattern
   */
  generateAntiFreezPattern(severity) {
    const baseFreq = this.config.pulseFrequency;
    const modulation = this.config.pulseModulation;
    
    // Different patterns for different severity levels
    const patterns = {
      'critical': {
        sequence: [
          baseFreq + modulation,
          baseFreq - modulation,
          baseFreq + modulation,
          baseFreq,
          baseFreq + modulation,
          baseFreq - modulation
        ],
        duration: this.config.pulseDuration,
        repetitions: 3
      },
      'high': {
        sequence: [
          baseFreq + modulation,
          baseFreq - modulation,
          baseFreq,
          baseFreq + modulation
        ],
        duration: this.config.pulseDuration,
        repetitions: 2
      },
      'medium': {
        sequence: [
          baseFreq + modulation,
          baseFreq - modulation,
          baseFreq
        ],
        duration: this.config.pulseDuration,
        repetitions: 2
      },
      'low': {
        sequence: [
          baseFreq + modulation,
          baseFreq
        ],
        duration: this.config.pulseDuration,
        repetitions: 1
      }
    };
    
    return patterns[severity] || patterns['medium'];
  }
  
  /**
   * Get agent status and metrics
   */
  getStatus() {
    return {
      id: this.id,
      type: 'freeze-prevention',
      status: this.status,
      isActive: this.isActive,
      metrics: this.metrics,
      activeLocations: Array.from(this.activeLocations),
      pulseCount: this.pulseCount,
      config: {
        freezeThreshold: this.config.freezeThreshold,
        criticalThreshold: this.config.criticalThreshold,
        activationThreshold: this.config.activationThreshold
      },
      timestamp: Date.now()
    };
  }
  
  /**
   * Get temperature report for all monitored locations
   */
  getTemperatureReport() {
    const report = {
      timestamp: Date.now(),
      locations: [],
      summary: {
        total: this.temperatureData.size,
        freezing: 0,
        belowFreezing: 0,
        critical: 0,
        protected: this.activeLocations.size
      }
    };
    
    for (const [location, reading] of this.temperatureData.entries()) {
      report.locations.push({
        location,
        temperature: reading.temperature,
        status: this.activeLocations.has(location) ? 'protected' : 'normal',
        lastUpdate: reading.timestamp
      });
      
      if (reading.temperature <= 0) {
        report.summary.freezing++;
      }
      if (reading.temperature < 0) {
        report.summary.belowFreezing++;
      }
      if (reading.temperature <= this.config.criticalThreshold) {
        report.summary.critical++;
      }
    }
    
    return report;
  }
}

module.exports = FreezePreventionAgent;
