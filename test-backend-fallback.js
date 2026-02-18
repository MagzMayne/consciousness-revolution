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
 * File: test-backend-fallback.js
 * Declaration ID: IP-35A7E061-MLL28ZWI
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Backend Fallback System - Node.js Test
 * 
 * Tests the backend fallback system without needing a browser
 */

const BackendFallbackSystem = require('./src/utils/backend-fallback-system.js');

// Mock localStorage for Node.js environment
global.localStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  removeItem(key) {
    delete this.data[key];
  },
  clear() {
    this.data = {};
  }
};

async function runTests() {
  console.log(`
╔════════════════════════════════════════════════════╗
║   Backend Fallback System - Test Suite            ║
╚════════════════════════════════════════════════════╝
  `);
  
  let passed = 0;
  let failed = 0;
  let warnings = 0;
  
  try {
    // Test 1: Initialization
    console.log('\n📋 Test 1: System Initialization');
    const system = new BackendFallbackSystem({
      backendUrl: 'http://localhost:4000',
      checkInterval: 60000,
      storagePrefix: 'test_'
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const status = system.getStatus();
    console.log(`   Mode: ${status.mode}`);
    console.log(`   Backend Available: ${status.backendAvailable}`);
    
    if (status.mode !== 'unknown') {
      console.log('   ✓ System initialized successfully');
      passed++;
    } else {
      console.log('   ✗ System failed to initialize');
      failed++;
    }
    
    // Test 2: Backend Health Check
    console.log('\n📋 Test 2: Backend Health Check');
    const isHealthy = await system.checkBackendHealth();
    console.log(`   Health Check Result: ${isHealthy ? 'Healthy' : 'Unavailable'}`);
    console.log(`   Current Mode: ${system.getStatus().mode}`);
    
    if (!isHealthy) {
      console.log('   ⚠ Backend offline (expected - will use frontend mode)');
      warnings++;
    } else {
      console.log('   ✓ Backend is online');
      passed++;
    }
    
    // Test 3: Frontend Storage
    console.log('\n📋 Test 3: Frontend Storage Operations');
    localStorage.clear();
    
    const testData = [
      { id: 'test1', name: 'Test Item 1' },
      { id: 'test2', name: 'Test Item 2' }
    ];
    
    system.saveToStorage('test_items', testData);
    const retrieved = system.getFromStorage('test_items');
    
    if (retrieved && retrieved.length === 2 && retrieved[0].id === 'test1') {
      console.log('   ✓ Storage write: OK');
      console.log('   ✓ Storage read: OK');
      console.log(`   ✓ Data integrity: OK (${retrieved.length} items)`);
      passed++;
    } else {
      console.log('   ✗ Storage operations failed');
      failed++;
    }
    
    // Test 4: Email Operations
    console.log('\n📋 Test 4: Email CRUD Operations');
    localStorage.clear();
    
    // CREATE
    const createResult = await system.request('/emails', {
      method: 'POST',
      body: {
        to_email: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>'
      }
    });
    
    if (!createResult.success) {
      console.log('   ✗ Email CREATE failed');
      failed++;
    } else {
      console.log(`   ✓ Email CREATE: OK (id: ${createResult.data.id}, source: ${createResult.source})`);
      
      // READ
      const listResult = await system.request('/emails', { method: 'GET' });
      if (listResult.success && listResult.data.length > 0) {
        console.log(`   ✓ Email READ: OK (${listResult.data.length} emails)`);
        
        // UPDATE
        const emailId = createResult.data.id;
        const updateResult = await system.request(`/emails/${emailId}`, {
          method: 'PATCH',
          body: { status: 'confirmed' }
        });
        
        if (updateResult.success) {
          console.log(`   ✓ Email UPDATE: OK (status: confirmed)`);
          passed++;
        } else {
          console.log('   ✗ Email UPDATE failed');
          failed++;
        }
      } else {
        console.log('   ✗ Email READ failed');
        failed++;
      }
    }
    
    // Test 5: Lead Operations
    console.log('\n📋 Test 5: Lead CRUD Operations');
    localStorage.removeItem('test_leads');
    
    // CREATE
    const leadCreate = await system.request('/leads', {
      method: 'POST',
      body: {
        name: 'John Doe',
        email: 'john@example.com',
        company: 'Test Corp',
        status: 'new'
      }
    });
    
    if (!leadCreate.success) {
      console.log('   ✗ Lead CREATE failed');
      failed++;
    } else {
      console.log(`   ✓ Lead CREATE: OK (id: ${leadCreate.data.id})`);
      
      // ADD THREAD
      const leadId = leadCreate.data.id;
      const threadResult = await system.request(`/leads/${leadId}/threads`, {
        method: 'POST',
        body: {
          message: 'Test thread message',
          author: 'agent',
          type: 'note'
        }
      });
      
      if (threadResult.success) {
        console.log(`   ✓ Thread CREATE: OK`);
        
        // UPDATE
        const updateResult = await system.request(`/leads/${leadId}`, {
          method: 'PATCH',
          body: { status: 'active', revenue: 1000 }
        });
        
        if (updateResult.success) {
          console.log(`   ✓ Lead UPDATE: OK (revenue: $1000)`);
          passed++;
        } else {
          console.log('   ✗ Lead UPDATE failed');
          failed++;
        }
      } else {
        console.log('   ✗ Thread CREATE failed');
        failed++;
      }
    }
    
    // Test 6: Statistics
    console.log('\n📋 Test 6: Statistics Calculation');
    
    const statsResult = await system.request('/stats', { method: 'GET' });
    
    if (statsResult.success) {
      const stats = statsResult.data;
      console.log(`   ✓ Stats calculation: OK`);
      console.log(`   Emails: ${stats.emails.total} (${stats.emails.confirmed} confirmed)`);
      console.log(`   Leads: ${stats.leads.total} (${stats.leads.active} active)`);
      console.log(`   Revenue: ${stats.revenue.formatted}`);
      passed++;
    } else {
      console.log('   ✗ Stats calculation failed');
      failed++;
    }
    
    // Summary
    console.log(`
╔════════════════════════════════════════════════════╗
║   Test Summary                                     ║
╚════════════════════════════════════════════════════╝

✓ Passed:    ${passed}
⚠ Warnings:  ${warnings}
✗ Failed:    ${failed}
────────────────────────────────────────────────────
Total Tests: ${passed + failed + warnings}
Success Rate: ${((passed / (passed + failed + warnings)) * 100).toFixed(0)}%

${failed === 0 ? '🎉 All critical tests passed!' : ''}
${warnings > 0 ? '⚠️ Backend offline - using frontend fallback mode (expected)' : ''}
${failed > 0 ? '❌ Some tests failed - please review' : ''}
    `);
    
    process.exit(failed === 0 ? 0 : 1);
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Run tests
runTests().catch(console.error);
