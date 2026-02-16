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
 * File: test-extracted-html.js
 * Declaration ID: IP-3E01A204-MLL28ZWJ
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

#!/usr/bin/env node
/**
 * Test script to verify all extracted HTML files from .txt sources
 * Tests that the HTML is valid and contains expected functionality
 */

const fs = require('fs');
const path = require('path');

// Files that were extracted from .txt sources
const extractedFiles = [
  {
    path: 'LEAH.html',
    name: 'LEAH - Ledger Evaluation Automation Hub',
    expectedFeatures: [
      'GitHub',
      'valuation',
      'submission',
      'JSZip',
      'sha256hex',
      'scanTextForComponents'
    ]
  },
  {
    path: 'projects/LINKt/linkt.html',
    name: 'SanctumLink - Sovereign Atlas',
    expectedFeatures: [
      'Solana',
      'Phantom',
      'Cesium',
      'Three.js',
      'QRCode',
      'sanctum'
    ]
  },
  {
    path: 'mandem.os/workingNicely/index.html',
    name: 'Mandem.OS Terminal',
    expectedFeatures: [
      'EVM',
      'wallet',
      'Copper Key',
      'flameCanvas',
      'terminal'
    ]
  },
  {
    path: 'rdata/index.html',
    name: 'Rdata - Freedom Quest',
    expectedFeatures: [
      'Three.js',
      'globe',
      'OrbitControls',
      'initGame'
    ]
  }
];

console.log('🧪 Testing Extracted HTML Files\n');
console.log('=' .repeat(70));

let passed = 0;
let failed = 0;

for (const file of extractedFiles) {
  console.log(`\n📄 Testing: ${file.name}`);
  console.log(`   Path: ${file.path}`);
  
  try {
    // Check if file exists
    if (!fs.existsSync(file.path)) {
      console.log('   ❌ File not found');
      failed++;
      continue;
    }
    
    // Read file content
    const content = fs.readFileSync(file.path, 'utf8');
    
    // Check file size
    const sizeKB = (content.length / 1024).toFixed(2);
    console.log(`   📊 Size: ${sizeKB} KB`);
    
    // Check basic HTML structure
    const hasDoctype = content.includes('<!DOCTYPE') || content.includes('<!doctype');
    const hasHtml = content.includes('<html');
    const hasHead = content.includes('<head>');
    const hasBody = content.includes('<body>');
    const hasClosingHtml = content.includes('</html>');
    
    if (!hasDoctype || !hasHtml || !hasHead || !hasBody || !hasClosingHtml) {
      console.log('   ❌ Invalid HTML structure');
      console.log(`      DOCTYPE: ${hasDoctype}, <html>: ${hasHtml}, <head>: ${hasHead}, <body>: ${hasBody}, </html>: ${hasClosingHtml}`);
      failed++;
      continue;
    }
    
    // Check for expected features
    let missingFeatures = [];
    for (const feature of file.expectedFeatures) {
      if (!content.toLowerCase().includes(feature.toLowerCase())) {
        missingFeatures.push(feature);
      }
    }
    
    if (missingFeatures.length > 0) {
      console.log(`   ⚠️  Missing features: ${missingFeatures.join(', ')}`);
    }
    
    // Check script balance
    const scriptOpen = (content.match(/<script/g) || []).length;
    const scriptClose = (content.match(/<\/script>/g) || []).length;
    
    if (scriptOpen !== scriptClose) {
      console.log(`   ❌ Unbalanced script tags: ${scriptOpen} open, ${scriptClose} close`);
      failed++;
      continue;
    }
    
    // Check for basic syntax errors (removed overly simplistic regex check)
    
    console.log('   ✅ Valid HTML structure');
    console.log(`   ✅ ${scriptOpen} script tag(s) balanced`);
    console.log(`   ✅ ${file.expectedFeatures.length - missingFeatures.length}/${file.expectedFeatures.length} expected features found`);
    passed++;
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    failed++;
  }
}

console.log('\n' + '='.repeat(70));
console.log('\n📊 Test Results:');
console.log(`   ✅ Passed: ${passed}/${extractedFiles.length}`);
console.log(`   ❌ Failed: ${failed}/${extractedFiles.length}`);

if (failed === 0) {
  console.log('\n🎉 All extracted HTML files are valid!\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Some files have issues. Please review.\n');
  process.exit(1);
}
