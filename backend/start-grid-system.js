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
 * File: start-grid-system.js
 * Declaration ID: IP-437A4C6C-MLL28ZUM
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Grid Control System - Startup Script
 * ======================================
 * Initializes and starts all grid control services
 */

require('dotenv').config();

const { startServer: startGridAPI, setFreezePreventionAgent } = require('./services/grid-control-api');
const PLCModulation = require('./services/plc-modulation');
const { AIGridAgentManager } = require('./services/ai-grid-agents');
const FreezePreventionAgent = require('./services/freeze-prevention-agent');

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║   AI Grid Link - Production System Startup              ║');
console.log('║   Real PLC Integration & Grid Control                   ║');
console.log('╚══════════════════════════════════════════════════════════╝');
console.log('');

async function startSystem() {
  try {
    // 1. Start Grid Control API Server
    console.log('[Startup] Starting Grid Control API...');
    startGridAPI();
    
    // Wait for API to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 2. Initialize PLC Modulation System
    console.log('[Startup] Initializing PLC Modulation System...');
    const plcModulation = new PLCModulation({
      baseFrequency: 60, // 60 Hz for Americas
      carrierFrequency: 125000, // 125 kHz
      bitRate: 9600,
      discoveryInterval: 30000 // 30 seconds
    });
    
    // Handle PLC events
    plcModulation.on('device-discovered', (data) => {
      console.log('[PLC] Device discovered:', data.deviceId);
    });
    
    plcModulation.on('transmission-complete', (data) => {
      console.log('[PLC] Transmission complete:', data.id);
    });
    
    plcModulation.on('modulation-error', (data) => {
      console.error('[PLC] Modulation error:', data.error.message);
    });
    
    plcModulation.start();
    
    // 3. Deploy AI Grid Agents
    console.log('[Startup] Deploying AI Grid Agents...');
    const agentManager = new AIGridAgentManager();
    
    // Handle agent events
    agentManager.on('anomaly-detected', (data) => {
      console.log('[AI Agent] Anomaly detected:', data.type, 'Severity:', data.severity);
    });
    
    agentManager.on('optimization-recommended', (data) => {
      console.log('[AI Agent] Optimization recommended:', data.recommendation.action);
    });
    
    agentManager.on('healing-action', (data) => {
      console.log('[AI Agent] Healing action executed:', data.action.type);
    });
    
    agentManager.on('security-threat', (data) => {
      console.warn('[AI Agent] Security threat detected:', data.threat.type);
    });
    
    await agentManager.deployFullSuite();
    
    // 4. Deploy Freeze Prevention Agent
    console.log('[Startup] Deploying Freeze Prevention Agent...');
    const freezeAgent = new FreezePreventionAgent({
      freezeThreshold: 2,
      criticalThreshold: -5,
      activationThreshold: 0,
      monitoringInterval: 30000,
      pulseInterval: 60000
    });
    
    // Handle freeze prevention events
    freezeAgent.on('freeze-prevention-activated', (data) => {
      console.log(`[Freeze Prevention] 🔥 ACTIVATED at ${data.location} (${data.temperature.toFixed(1)}°C)`);
    });
    
    freezeAgent.on('critical-freeze-alert', (data) => {
      console.log(`[Freeze Prevention] 🚨 CRITICAL ALERT: ${data.message} at ${data.location}`);
    });
    
    freezeAgent.on('pulse-transmitted', (data) => {
      console.log(`[Freeze Prevention] 📡 Pulse sent to ${data.location}`);
    });
    
    // Activate the freeze prevention agent
    await freezeAgent.activate(plcModulation);
    
    // Register with grid control API
    setFreezePreventionAgent(freezeAgent);
    
    console.log('');
    console.log('✓ Grid Control API Server: Running');
    console.log('✓ PLC Modulation System: Active');
    console.log('✓ AI Grid Agents: Deployed');
    console.log('✓ Freeze Prevention Agent: Monitoring');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(' System Status: OPERATIONAL');
    console.log(' Always Online: ✓');
    console.log(' Pulse Modulation: ✓ Active');
    console.log(' AI Agents: ✓ Monitoring Grid');
    console.log(' Freeze Prevention: ✓ Protecting Power Lines');
    console.log(' Security: ✓ Enabled');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('Grid Control System is now fully operational.');
    console.log('Frontend available at: http://localhost:3100');
    console.log('API Documentation: See README-GRID-CONTROL.md');
    console.log('');
    
    // Keep the process running
    process.on('SIGTERM', async () => {
      console.log('[Shutdown] Graceful shutdown initiated...');
      freezeAgent.deactivate();
      plcModulation.stop();
      agentManager.deactivateAll();
      process.exit(0);
    });
    
    process.on('SIGINT', async () => {
      console.log('[Shutdown] Graceful shutdown initiated...');
      freezeAgent.deactivate();
      plcModulation.stop();
      agentManager.deactivateAll();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('[Startup] Fatal error:', error);
    process.exit(1);
  }
}

// Start the system
startSystem().catch(error => {
  console.error('[Startup] Failed to start system:', error);
  process.exit(1);
});
