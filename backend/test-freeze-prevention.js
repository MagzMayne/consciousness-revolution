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
 * File: test-freeze-prevention.js
 * Declaration ID: IP-53AA7D94-MLL28ZUN
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

#!/usr/bin/env node

/**
 * Test script for Freeze Prevention System
 * Tests all endpoints and functionality
 */

const http = require('http');

const API_KEY = 'CHANGE_THIS_IN_PRODUCTION';
const BASE_URL = 'http://localhost:3100';

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      }
    };
    
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });
    
    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

async function runTests() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║   Freeze Prevention System - Test Suite             ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');
  
  let passed = 0;
  let failed = 0;
  
  // Wait for server to be ready
  console.log('[Test] Waiting for server to start...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test 1: Health Check
  console.log('[Test 1] Health Check...');
  try {
    const result = await makeRequest('/api/health');
    if (result.status === 200 && result.data.status === 'operational') {
      console.log('✓ Health check passed');
      passed++;
    } else {
      console.log('✗ Health check failed:', result);
      failed++;
    }
  } catch (error) {
    console.log('✗ Health check error:', error.message);
    failed++;
  }
  
  // Test 2: Get Freeze Prevention Status
  console.log('[Test 2] Get Freeze Prevention Status...');
  try {
    const result = await makeRequest('/api/freeze-prevention/status');
    if (result.status === 200 && result.data.type === 'freeze-prevention') {
      console.log('✓ Freeze prevention status retrieved');
      console.log('  - Status:', result.data.status);
      console.log('  - Active Locations:', result.data.activeLocations.length);
      console.log('  - Pulses Activated:', result.data.metrics.pulsesActivated);
      console.log('  - Freeze Events:', result.data.metrics.freezeEventsDetected);
      passed++;
    } else {
      console.log('✗ Freeze prevention status failed:', result);
      failed++;
    }
  } catch (error) {
    console.log('✗ Freeze prevention status error:', error.message);
    failed++;
  }
  
  // Test 3: Get Temperature Report
  console.log('[Test 3] Get Temperature Report...');
  try {
    const result = await makeRequest('/api/freeze-prevention/temperature');
    if (result.status === 200 && result.data.locations) {
      console.log('✓ Temperature report retrieved');
      console.log('  - Total Locations:', result.data.summary.total);
      console.log('  - Freezing Locations:', result.data.summary.freezing);
      console.log('  - Critical Locations:', result.data.summary.critical);
      console.log('  - Protected Locations:', result.data.summary.protected);
      
      // Show sample temperature readings
      console.log('  - Sample readings:');
      for (let i = 0; i < Math.min(3, result.data.locations.length); i++) {
        const loc = result.data.locations[i];
        console.log(`    • ${loc.location}: ${loc.temperature.toFixed(1)}°C (${loc.status})`);
      }
      passed++;
    } else {
      console.log('✗ Temperature report failed:', result);
      failed++;
    }
  } catch (error) {
    console.log('✗ Temperature report error:', error.message);
    failed++;
  }
  
  // Test 4: Get Grid State
  console.log('[Test 4] Get Grid State...');
  try {
    const result = await makeRequest('/api/grid/state');
    if (result.status === 200) {
      console.log('✓ Grid state retrieved');
      console.log('  - Nodes:', result.data.nodes.length);
      console.log('  - Devices:', result.data.devices.length);
      console.log('  - Agents:', result.data.agents.length);
      console.log('  - System Status:', result.data.systemStatus);
      console.log('  - Modulation Active:', result.data.modulationActive);
      passed++;
    } else {
      console.log('✗ Grid state failed:', result);
      failed++;
    }
  } catch (error) {
    console.log('✗ Grid state error:', error.message);
    failed++;
  }
  
  // Test 5: Get System Metrics
  console.log('[Test 5] Get System Metrics...');
  try {
    const result = await makeRequest('/api/metrics');
    if (result.status === 200) {
      console.log('✓ System metrics retrieved');
      console.log('  - Uptime:', Math.round(result.data.uptime), 'seconds');
      console.log('  - Memory Used:', result.data.memory.heapUsed);
      console.log('  - Grid Nodes:', result.data.grid.nodes);
      console.log('  - PLC Connections:', result.data.grid.plcConnections);
      passed++;
    } else {
      console.log('✗ System metrics failed:', result);
      failed++;
    }
  } catch (error) {
    console.log('✗ System metrics error:', error.message);
    failed++;
  }
  
  // Test 6: Get Alerts
  console.log('[Test 6] Get Alerts...');
  try {
    const result = await makeRequest('/api/alerts?severity=high');
    if (result.status === 200) {
      console.log('✓ Alerts retrieved');
      console.log('  - Alert Count:', result.data.count);
      if (result.data.alerts.length > 0) {
        console.log('  - Sample alert:', result.data.alerts[0].type);
      }
      passed++;
    } else {
      console.log('✗ Alerts failed:', result);
      failed++;
    }
  } catch (error) {
    console.log('✗ Alerts error:', error.message);
    failed++;
  }
  
  // Test 7: PLC Device List
  console.log('[Test 7] PLC Device List...');
  try {
    const result = await makeRequest('/api/plc/devices');
    if (result.status === 200) {
      console.log('✓ PLC devices retrieved');
      console.log('  - Device Count:', result.data.count);
      passed++;
    } else {
      console.log('✗ PLC devices failed:', result);
      failed++;
    }
  } catch (error) {
    console.log('✗ PLC devices error:', error.message);
    failed++;
  }
  
  // Summary
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('Test Results:');
  console.log(`  ✓ Passed: ${passed}`);
  console.log(`  ✗ Failed: ${failed}`);
  console.log(`  Total:    ${passed + failed}`);
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  
  if (failed === 0) {
    console.log('🎉 All tests passed! Freeze prevention system is operational.');
  } else {
    console.log('⚠️  Some tests failed. Please review the output above.');
  }
  
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
