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
 * File: test-gem-scraper.js
 * Declaration ID: IP-70A6432E-MLL28ZWJ
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Test script for Gem Scraper Service
 */

const API_BASE = 'http://localhost:3010';

async function testEndpoint(name, url, options = {}) {
  try {
    console.log(`\n🧪 Testing: ${name}`);
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`   ✅ Success`);
      console.log(`   Response:`, JSON.stringify(data, null, 2).substring(0, 500));
      return true;
    } else {
      console.log(`   ❌ Failed: ${response.status}`);
      console.log(`   Error:`, data);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🔍 Gem Scraper Service - API Tests\n');
  console.log('Make sure the service is running on port 3010');
  console.log('Run: node services/gem-scraper-service.js\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Health check
  if (await testEndpoint('Health Check', `${API_BASE}/health`)) {
    passed++;
  } else {
    failed++;
  }

  // Wait a bit between requests
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 2: Instagram user scraping
  if (await testEndpoint(
    'Instagram User Scraping',
    `${API_BASE}/api/instagram/user/gemdealer?limit=5`
  )) {
    passed++;
  } else {
    failed++;
  }

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 3: Instagram hashtag search
  if (await testEndpoint(
    'Instagram Hashtag Search',
    `${API_BASE}/api/instagram/hashtag/gemsforsale?limit=5`
  )) {
    passed++;
  } else {
    failed++;
  }

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 4: eBay sold listings
  if (await testEndpoint(
    'eBay Sold Listings',
    `${API_BASE}/api/ebay/sold?query=tourmaline+2.5ct&limit=10`
  )) {
    passed++;
  } else {
    failed++;
  }

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 5: Analyze stone
  if (await testEndpoint(
    'Analyze Stone',
    `${API_BASE}/api/analyze`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stone_name: 'Tourmaline',
        price_value: 150,
        weight_ct: 2.5,
        source: '@gemdealer'
      })
    }
  )) {
    passed++;
  } else {
    failed++;
  }

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 6: Automated discovery
  if (await testEndpoint(
    'Automated Discovery',
    `${API_BASE}/api/discover`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usernames: ['gemdealer'],
        hashtags: ['gemsforsale']
      })
    }
  )) {
    passed++;
  } else {
    failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Test Summary:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   Total: ${passed + failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above.');
  }
}

// Check if service is running
async function checkService() {
  try {
    // Create manual timeout for compatibility with older Node versions
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch(`${API_BASE}/health`, { 
      signal: controller.signal 
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Main execution
(async () => {
  console.log('Checking if service is running...\n');
  
  const isRunning = await checkService();
  
  if (!isRunning) {
    console.log('❌ Service is not running on port 3010');
    console.log('\nTo start the service, run:');
    console.log('  cd backend');
    console.log('  node services/gem-scraper-service.js');
    console.log('\nThen run this test again.\n');
    process.exit(1);
  }
  
  console.log('✅ Service is running!\n');
  await runTests();
})();
