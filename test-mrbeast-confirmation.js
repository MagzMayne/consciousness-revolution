#!/usr/bin/env node

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
 * File: test-mrbeast-confirmation.js
 * Declaration ID: IP-2B223274-MLL28ZWK
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Test script for Mr. Beast Confirmation System
 * Tests both the confirmation service and email notification
 */

const http = require('http');

// Test configuration
const CONFIRMATION_SERVICE_PORT = 4001;
const EMAIL_SERVICE_PORT = 4000;

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

/**
 * Make HTTP request
 */
function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ statusCode: res.statusCode, data: json });
        } catch (error) {
          resolve({ statusCode: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * Test confirmation service health
 */
async function testHealth(port, serviceName) {
  console.log(`\n${colors.blue}Testing ${serviceName} health...${colors.reset}`);
  
  try {
    const result = await makeRequest({
      hostname: 'localhost',
      port: port,
      path: '/health',
      method: 'GET'
    });
    
    if (result.statusCode === 200) {
      console.log(`${colors.green}✓ ${serviceName} is healthy${colors.reset}`);
      console.log(`  Status: ${result.data.status}`);
      console.log(`  Uptime: ${Math.floor(result.data.uptime)}s`);
      return true;
    } else {
      console.log(`${colors.red}✗ ${serviceName} returned status ${result.statusCode}${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗ ${serviceName} is not running${colors.reset}`);
    console.log(`  Error: ${error.message}`);
    return false;
  }
}

/**
 * Test confirmation endpoint
 */
async function testConfirmation() {
  console.log(`\n${colors.blue}Testing confirmation endpoint...${colors.reset}`);
  
  const confirmationData = {
    timestamp: new Date().toISOString(),
    userAgent: 'Test Script / Node.js',
    screenResolution: '1920x1080',
    language: 'en-US'
  };
  
  try {
    const result = await makeRequest({
      hostname: 'localhost',
      port: CONFIRMATION_SERVICE_PORT,
      path: '/api/confirm-mrbeast-contact',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, confirmationData);
    
    if (result.statusCode === 200 && result.data.success) {
      console.log(`${colors.green}✓ Confirmation sent successfully${colors.reset}`);
      console.log(`  Confirmation ID: ${result.data.confirmation.id}`);
      console.log(`  Email sent: ${result.data.emailSent ? 'Yes' : 'No'}`);
      return true;
    } else {
      console.log(`${colors.red}✗ Confirmation failed${colors.reset}`);
      console.log(`  Status: ${result.statusCode}`);
      console.log(`  Response:`, result.data);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Confirmation request failed${colors.reset}`);
    console.log(`  Error: ${error.message}`);
    return false;
  }
}

/**
 * Test get confirmations
 */
async function testGetConfirmations() {
  console.log(`\n${colors.blue}Testing get confirmations...${colors.reset}`);
  
  try {
    const result = await makeRequest({
      hostname: 'localhost',
      port: CONFIRMATION_SERVICE_PORT,
      path: '/api/confirmations',
      method: 'GET'
    });
    
    if (result.statusCode === 200 && result.data.success) {
      console.log(`${colors.green}✓ Retrieved confirmations${colors.reset}`);
      console.log(`  Total confirmations: ${result.data.total}`);
      
      if (result.data.total > 0) {
        const latest = result.data.confirmations[0];
        console.log(`  Latest confirmation:`);
        console.log(`    - ID: ${latest.id}`);
        console.log(`    - Time: ${new Date(latest.confirmedAt).toLocaleString()}`);
      }
      
      return true;
    } else {
      console.log(`${colors.yellow}⚠ Could not retrieve confirmations${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Get confirmations failed${colors.reset}`);
    console.log(`  Error: ${error.message}`);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║   🧪 Mr. Beast Confirmation System Test Suite        ║
╚═══════════════════════════════════════════════════════╝
  `);
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };
  
  // Test confirmation service health
  results.total++;
  if (await testHealth(CONFIRMATION_SERVICE_PORT, 'Confirmation Service')) {
    results.passed++;
  } else {
    results.failed++;
    console.log(`\n${colors.yellow}⚠ Confirmation service not running. Start it with:${colors.reset}`);
    console.log(`  node backend/services/mrbeast-confirmation-service.js\n`);
  }
  
  // Test email service health (fallback)
  results.total++;
  if (await testHealth(EMAIL_SERVICE_PORT, 'Email Service')) {
    results.passed++;
  } else {
    results.failed++;
    console.log(`\n${colors.yellow}⚠ Email service not running (optional fallback). Start it with:${colors.reset}`);
    console.log(`  node backend/services/email-service.js\n`);
  }
  
  // Only run these tests if confirmation service is available
  if (results.passed > 0) {
    // Test confirmation
    results.total++;
    if (await testConfirmation()) {
      results.passed++;
    } else {
      results.failed++;
    }
    
    // Test get confirmations
    results.total++;
    if (await testGetConfirmations()) {
      results.passed++;
    } else {
      results.failed++;
    }
  }
  
  // Print summary
  console.log(`
╔═══════════════════════════════════════════════════════╗
║   Test Summary                                        ║
╚═══════════════════════════════════════════════════════╝
  `);
  
  console.log(`  Total tests: ${results.total}`);
  console.log(`  ${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`  ${colors.red}Failed: ${results.failed}${colors.reset}`);
  
  const successRate = ((results.passed / results.total) * 100).toFixed(0);
  console.log(`  Success rate: ${successRate}%`);
  
  if (results.failed === 0) {
    console.log(`\n${colors.green}✓ All tests passed!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.yellow}⚠ Some tests failed. Check the output above for details.${colors.reset}\n`);
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
