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
 * File: test-master-system-integration.js
 * Declaration ID: IP-353B5ACF-MLL28ZWK
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

#!/usr/bin/env node

/**
 * Test Script for Email Service and Master System Integration
 * Run this to verify the setup is working
 */

const http = require('http');

const EMAIL_SERVICE_URL = 'http://localhost:4000';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, EMAIL_SERVICE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve(json);
        } catch {
          resolve(body);
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

async function runTests() {
  console.log('🧪 Testing Email Service & Master System Integration\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣  Health Check...');
    const health = await makeRequest('GET', '/health');
    console.log('   ✅ Service is healthy:', health.status);
    console.log('');

    // Test 2: Create a Lead
    console.log('2️⃣  Creating Test Lead...');
    const leadData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      company: 'Acme Corp',
      status: 'new',
      source: 'test-script'
    };
    const leadResult = await makeRequest('POST', '/leads', leadData);
    if (leadResult.success) {
      console.log('   ✅ Lead created:', leadResult.lead.id);
      console.log('   📧 Email:', leadResult.lead.email);
    } else {
      console.log('   ❌ Failed to create lead');
    }
    console.log('');

    // Test 3: Send Test Email
    console.log('3️⃣  Sending Test Email...');
    const emailData = {
      to: 'barbrickdesign@gmail.com',
      subject: 'Master System Test Email',
      html: '<h1>Test Email</h1><p>This is a test from the Master System integration.</p>',
      text: 'Test Email',
      meta: { test: true, source: 'test-script' }
    };
    const emailResult = await makeRequest('POST', '/send-email', emailData);
    if (emailResult.success) {
      console.log('   ✅ Email sent:', emailResult.id);
      console.log('   🔗 Tracking URL:', emailResult.trackingUrl);
    } else {
      console.log('   ❌ Failed to send email');
    }
    console.log('');

    // Test 4: Get Stats
    console.log('4️⃣  Getting Statistics...');
    const stats = await makeRequest('GET', '/stats');
    console.log('   📊 Stats:');
    console.log('      Total Emails:', stats.emails.total);
    console.log('      Confirmed:', stats.emails.confirmed);
    console.log('      Total Leads:', stats.leads.total);
    console.log('      Revenue:', stats.revenue.formatted);
    console.log('');

    // Test 5: Get All Leads
    console.log('5️⃣  Getting All Leads...');
    const leads = await makeRequest('GET', '/leads');
    console.log('   ✅ Found', leads.length, 'leads');
    console.log('');

    // Test 6: Get All Emails
    console.log('6️⃣  Getting All Emails...');
    const emails = await makeRequest('GET', '/emails');
    console.log('   ✅ Found', emails.length, 'emails');
    console.log('');

    console.log('✨ All tests completed successfully!\n');
    console.log('Next steps:');
    console.log('1. Open emailDashboard.html in your browser');
    console.log('2. Open masterSystem.html in your browser');
    console.log('3. Click PayPal buttons to test payment flow');
    console.log('4. Add leads and send emails\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nMake sure the email service is running:');
    console.log('  npm run email-service\n');
    process.exit(1);
  }
}

// Run tests
runTests();
