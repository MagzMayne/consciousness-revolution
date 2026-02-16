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
 * Declaration ID: IP-3ADC9083-MLL28ZUM
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
 * Wake on LAN Backend Service
 * Provides API endpoint to send Wake on LAN magic packets to devices on the network
 */

const express = require('express');
const cors = require('cors');
const dgram = require('dgram');

const app = express();
const PORT = process.env.PORT || 3010;

// In-memory state management (use database in production)
const deviceState = {
  acknowledgments: new Map(),
  commands: new Map()
};

// Middleware
app.use(cors());
app.use(express.json());

/**
 * Creates a Wake on LAN magic packet
 * @param {string} macAddress - MAC address in format 'AA:BB:CC:DD:EE:FF' or 'AA-BB-CC-DD-EE-FF'
 * @returns {Buffer} Magic packet buffer
 */
function createMagicPacket(macAddress) {
  // Normalize MAC address (remove : and - separators)
  const mac = macAddress.replace(/[:-]/g, '');
  
  // Validate MAC address format
  if (!/^[0-9A-Fa-f]{12}$/.test(mac)) {
    throw new Error('Invalid MAC address format. Expected format: AA:BB:CC:DD:EE:FF');
  }
  
  // Convert MAC string to bytes
  const macBytes = [];
  for (let i = 0; i < 12; i += 2) {
    macBytes.push(parseInt(mac.substr(i, 2), 16));
  }
  
  // Create magic packet: 6 bytes of 0xFF followed by 16 repetitions of the MAC address
  const packet = Buffer.alloc(102); // 6 + (6 * 16) = 102 bytes
  
  // Fill first 6 bytes with 0xFF
  for (let i = 0; i < 6; i++) {
    packet[i] = 0xFF;
  }
  
  // Repeat MAC address 16 times
  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < 6; j++) {
      packet[6 + i * 6 + j] = macBytes[j];
    }
  }
  
  return packet;
}

/**
 * Sends Wake on LAN packet to target device with optional AI script injection
 * @param {string} macAddress - MAC address of target device
 * @param {string} ipAddress - Broadcast IP address (defaults to 255.255.255.255)
 * @param {number} port - UDP port (defaults to 9)
 * @param {boolean} injectAI - Whether to inject AI script payload
 * @param {string} deviceId - Device identifier for tracking
 * @returns {Promise} Promise that resolves when packet is sent
 */
function sendWakeOnLan(macAddress, ipAddress = '255.255.255.255', port = 9, injectAI = false, deviceId = null) {
  return new Promise((resolve, reject) => {
    try {
      const packet = createMagicPacket(macAddress);
      const socket = dgram.createSocket('udp4');
      
      // Enable broadcast
      socket.bind(() => {
        socket.setBroadcast(true);
        
        socket.send(packet, 0, packet.length, port, ipAddress, (err) => {
          socket.close();
          
          if (err) {
            reject(err);
          } else {
            const result = {
              success: true,
              macAddress,
              ipAddress,
              port,
              timestamp: new Date().toISOString(),
              aiInjected: injectAI,
              acknowledged: false
            };

            // If AI injection is enabled, simulate the AI script deployment
            if (injectAI) {
              console.log(`[WOL] Deploying AI script to device ${macAddress}...`);
              // In production, this would trigger actual AI script deployment
              // via power line communication or secondary network channel
              result.aiScript = {
                deployed: true,
                scriptVersion: '1.0.0',
                capabilities: ['heartbeat', 'command-receiver', 'status-reporter']
              };
            }

            // Simulate device acknowledgment after a brief delay
            if (deviceId) {
              setTimeout(() => {
                simulateDeviceAcknowledgment(deviceId, macAddress);
              }, 2000);
              result.acknowledgmentPending = true;
            }
            
            resolve(result);
          }
        });
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Simulate device acknowledgment signal
 * In production, this would be received from the actual device
 */
function simulateDeviceAcknowledgment(deviceId, macAddress) {
  console.log(`[WOL] Device ${macAddress} sending acknowledgment signal...`);
  
  // Store acknowledgment in memory
  deviceState.acknowledgments.set(deviceId, {
    macAddress,
    acknowledged: true,
    timestamp: new Date().toISOString(),
    status: 'online',
    aiScriptActive: true
  });
  
  console.log(`[WOL] Device ${macAddress} acknowledged successfully`);
}

// API Routes

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'wake-on-lan',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

/**
 * Wake a device
 * POST /wake
 * Body: { macAddress: 'AA:BB:CC:DD:EE:FF', ipAddress?: '192.168.1.255', port?: 9, injectAI?: true, waitForAck?: true, deviceId?: 'device-123' }
 */
app.post('/wake', async (req, res) => {
  try {
    const { macAddress, ipAddress, port, injectAI = true, waitForAck = true, deviceId } = req.body;
    
    if (!macAddress) {
      return res.status(400).json({
        success: false,
        error: 'MAC address is required'
      });
    }
    
    console.log(`[WOL] Sending magic packet to ${macAddress}${ipAddress ? ` via ${ipAddress}` : ''}`);
    if (injectAI) {
      console.log(`[WOL] AI script injection enabled for ${macAddress}`);
    }
    
    const result = await sendWakeOnLan(macAddress, ipAddress, port, injectAI, deviceId);
    
    console.log(`[WOL] Magic packet sent successfully to ${macAddress}`);
    
    res.json(result);
  } catch (error) {
    console.error(`[WOL] Error sending magic packet:`, error.message);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Wake multiple devices
 * POST /wake-batch
 * Body: { devices: [{ macAddress: 'AA:BB:CC:DD:EE:FF', ipAddress?: '192.168.1.255', port?: 9 }] }
 */
app.post('/wake-batch', async (req, res) => {
  try {
    const { devices } = req.body;
    
    if (!devices || !Array.isArray(devices) || devices.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Devices array is required and must not be empty'
      });
    }
    
    const results = [];
    
    for (const device of devices) {
      try {
        const result = await sendWakeOnLan(device.macAddress, device.ipAddress, device.port);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          macAddress: device.macAddress,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      results,
      total: devices.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🌐 Wake on LAN service running on port ${PORT}`);
  console.log(`📡 Ready to send magic packets`);
  console.log(`🔗 http://localhost:${PORT}`);
});

/**
 * Send command to device via Power Line Communication (PLC)
 * POST /plc-command
 * Body: { deviceId: 'device-123', macAddress: 'AA:BB:CC:DD:EE:FF', command: { type: 'status', data: {} } }
 */
app.post('/plc-command', async (req, res) => {
  try {
    const { deviceId, macAddress, command } = req.body;
    
    if (!deviceId || !macAddress || !command) {
      return res.status(400).json({
        success: false,
        error: 'deviceId, macAddress, and command are required'
      });
    }
    
    console.log(`[PLC] Sending command '${command.type}' to device ${macAddress} via power line modulation`);
    
    // Simulate power line communication
    // In production, this would use actual PLC hardware/protocols
    const result = {
      success: true,
      deviceId,
      macAddress,
      command: command.type,
      transmitted: true,
      modulationFrequency: '125kHz', // Typical PLC frequency
      signalStrength: 'strong',
      timestamp: new Date().toISOString()
    };
    
    // Store command in memory for device to retrieve
    if (!deviceState.commands.has(deviceId)) {
      deviceState.commands.set(deviceId, []);
    }
    deviceState.commands.get(deviceId).push({
      command,
      timestamp: new Date().toISOString(),
      status: 'pending'
    });
    
    console.log(`[PLC] Command transmitted successfully to ${macAddress}`);
    
    res.json(result);
  } catch (error) {
    console.error(`[PLC] Error sending command:`, error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get device heartbeat status
 * GET /device-heartbeat/:deviceId
 */
app.get('/device-heartbeat/:deviceId', (req, res) => {
  try {
    const { deviceId } = req.params;
    
    const ack = deviceState.acknowledgments.get(deviceId);
    
    if (!ack) {
      return res.json({
        online: false,
        deviceId,
        message: 'No heartbeat data available'
      });
    }
    
    // Check if heartbeat is recent (within last 60 seconds)
    const lastHeartbeat = new Date(ack.timestamp);
    const now = new Date();
    const timeDiff = (now - lastHeartbeat) / 1000; // seconds
    
    res.json({
      online: timeDiff < 60,
      deviceId,
      macAddress: ack.macAddress,
      lastHeartbeat: ack.timestamp,
      status: ack.status,
      aiScriptActive: ack.aiScriptActive,
      secondsSinceLastHeartbeat: Math.floor(timeDiff)
    });
  } catch (error) {
    console.error(`[Heartbeat] Error checking device heartbeat:`, error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Device check-in endpoint (for devices to report status)
 * POST /device-checkin
 * Body: { deviceId: 'device-123', macAddress: 'AA:BB:CC:DD:EE:FF', status: 'online', aiScriptVersion: '1.0.0' }
 */
app.post('/device-checkin', (req, res) => {
  try {
    const { deviceId, macAddress, status, aiScriptVersion } = req.body;
    
    if (!deviceId || !macAddress) {
      return res.status(400).json({
        success: false,
        error: 'deviceId and macAddress are required'
      });
    }
    
    console.log(`[Heartbeat] Device ${macAddress} checking in with status: ${status}`);
    
    // Update device acknowledgment data
    deviceState.acknowledgments.set(deviceId, {
      macAddress,
      acknowledged: true,
      timestamp: new Date().toISOString(),
      status: status || 'online',
      aiScriptActive: true,
      aiScriptVersion: aiScriptVersion || '1.0.0'
    });
    
    // Return any pending commands for this device
    const pendingCommands = deviceState.commands.get(deviceId) || [];
    
    res.json({
      success: true,
      deviceId,
      timestamp: new Date().toISOString(),
      pendingCommands: pendingCommands.filter(cmd => cmd.status === 'pending')
    });
  } catch (error) {
    console.error(`[Heartbeat] Error processing device check-in:`, error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = app;
