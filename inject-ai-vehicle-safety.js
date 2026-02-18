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
 * File: inject-ai-vehicle-safety.js
 * Declaration ID: IP-3A35A0DB-MLL28ZV1
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
 * AI Vehicle Safety Injection Script
 * 
 * Automatically injects the AI vehicle safety monitoring system
 * into relevant HTML files across the repository.
 * 
 * Usage: node inject-ai-vehicle-safety.js
 */

const fs = require('fs');
const path = require('path');

const SAFETY_SCRIPT_TAG = '<script src="ai-vehicle-safety.js"></script>';
const SAFETY_MARKER = '<!-- AI Vehicle Safety Injected -->';

// Files that should have vehicle safety monitoring
const TARGET_FILES = [
  'MandemOS.html',
  'MandemOSv3.html',
  'index.html',
  'all-repos-hub.html',
  'autoval.html',
  'autoval-enhanced.html'
];

// Directories to scan
const SCAN_DIRS = [
  '.',
  'ember-terminal',
  'ember-terminal/MandemOsV3'
];

let injectedCount = 0;
let skippedCount = 0;
let errorCount = 0;

console.log('═══════════════════════════════════════════════════');
console.log('🚗 AI Vehicle Safety Injection Script');
console.log('═══════════════════════════════════════════════════\n');

function injectIntoFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if already injected
    if (content.includes(SAFETY_MARKER) || content.includes('ai-vehicle-safety.js')) {
      console.log(`⏭️  Skipped (already injected): ${filePath}`);
      skippedCount++;
      return;
    }
    
    // Find the closing </body> tag
    const bodyCloseIndex = content.lastIndexOf('</body>');
    
    if (bodyCloseIndex === -1) {
      console.log(`⚠️  Warning: No </body> tag found in ${filePath}`);
      errorCount++;
      return;
    }
    
    // Inject the script before </body>
    const injection = `\n  ${SAFETY_MARKER}\n  ${SAFETY_SCRIPT_TAG}\n`;
    content = content.slice(0, bodyCloseIndex) + injection + content.slice(bodyCloseIndex);
    
    // Write back to file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Injected: ${filePath}`);
    injectedCount++;
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    errorCount++;
  }
}

function scanAndInject() {
  SCAN_DIRS.forEach(dir => {
    const dirPath = path.resolve(__dirname, dir);
    
    if (!fs.existsSync(dirPath)) {
      console.log(`⚠️  Directory not found: ${dirPath}`);
      return;
    }
    
    TARGET_FILES.forEach(file => {
      const filePath = path.join(dirPath, file);
      
      if (fs.existsSync(filePath)) {
        injectIntoFile(filePath);
      }
    });
  });
}

// Run injection
scanAndInject();

// Summary
console.log('\n═══════════════════════════════════════════════════');
console.log('📊 Injection Summary');
console.log('═══════════════════════════════════════════════════');
console.log(`✅ Files injected: ${injectedCount}`);
console.log(`⏭️  Files skipped: ${skippedCount}`);
console.log(`❌ Errors: ${errorCount}`);
console.log('═══════════════════════════════════════════════════\n');

if (injectedCount > 0) {
  console.log('🎉 AI Vehicle Safety system has been injected!');
  console.log('🚗 All vehicles are now under AI monitoring');
  console.log('🔇 Monitoring is silent and runs in the background\n');
}

process.exit(errorCount > 0 ? 1 : 0);
