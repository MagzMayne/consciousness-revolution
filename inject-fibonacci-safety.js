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
 * File: inject-fibonacci-safety.js
 * Declaration ID: IP-8B7D1C2-MLL28ZV1
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
 * Fibonacci Vehicle Safety System Injection Script
 * 
 * Automatically injects the Fibonacci vehicle safety system into HTML files
 * that are related to vehicles, safety, travel, or live monitoring.
 */

const fs = require('fs');
const path = require('path');

const SCRIPT_TAG = '  <script src="/fibonacci-vehicle-safety.js"></script>';
const COMMENT_TAG = '  <!-- Fibonacci Vehicle Safety System -->';

// Files that should have the safety system
const TARGET_PATTERNS = [
  /live.*safe/i,
  /vehicle/i,
  /travel/i,
  /map/i,
  /route/i,
  /driver/i,
  /safety/i,
  /gunshot/i,
  /detect/i
];

// Directories to search
const SEARCH_DIRS = ['.'];

// Directories to skip
const SKIP_DIRS = ['node_modules', '.git', 'Mandemos-v2-main', 'ember-terminal', 'ember-terminal-main'];

let stats = {
  scanned: 0,
  injected: 0,
  skipped: 0,
  errors: 0,
  files: []
};

/**
 * Check if filename matches target patterns
 */
function isTargetFile(filename) {
  return TARGET_PATTERNS.some(pattern => pattern.test(filename));
}

/**
 * Check if file already has the safety system
 */
function hasScript(content) {
  return content.includes('fibonacci-vehicle-safety.js');
}

/**
 * Inject the script into HTML file
 */
function injectScript(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already injected
    if (hasScript(content)) {
      stats.skipped++;
      console.log(`⏭️  Skipped (already has script): ${filePath}`);
      return false;
    }
    
    // Find the </head> tag
    const headCloseIndex = content.indexOf('</head>');
    
    if (headCloseIndex === -1) {
      console.log(`⚠️  Warning: No </head> tag found in ${filePath}`);
      stats.errors++;
      return false;
    }
    
    // Insert the script before </head>
    const injection = `\n${COMMENT_TAG}\n${SCRIPT_TAG}\n`;
    content = content.slice(0, headCloseIndex) + injection + content.slice(headCloseIndex);
    
    // Write back to file
    fs.writeFileSync(filePath, content, 'utf8');
    
    stats.injected++;
    stats.files.push(filePath);
    console.log(`✅ Injected: ${filePath}`);
    return true;
    
  } catch (error) {
    stats.errors++;
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Recursively scan directory for HTML files
 */
function scanDirectory(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      // Skip certain directories
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.includes(entry.name) && !entry.name.startsWith('.')) {
          scanDirectory(fullPath);
        }
        continue;
      }
      
      // Process HTML files
      if (entry.isFile() && entry.name.endsWith('.html')) {
        stats.scanned++;
        
        // Check if this is a target file
        if (isTargetFile(entry.name)) {
          injectScript(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}: ${error.message}`);
  }
}

/**
 * Main execution
 */
function main() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('🚗 Fibonacci Vehicle Safety System - Injection Script');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('');
  
  // Scan all directories
  SEARCH_DIRS.forEach(dir => {
    console.log(`📁 Scanning directory: ${dir}`);
    scanDirectory(dir);
  });
  
  // Print summary
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('📊 INJECTION SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(`HTML Files Scanned: ${stats.scanned}`);
  console.log(`Files Injected: ${stats.injected}`);
  console.log(`Files Skipped: ${stats.skipped}`);
  console.log(`Errors: ${stats.errors}`);
  console.log('───────────────────────────────────────────────────────────────────');
  
  if (stats.files.length > 0) {
    console.log('');
    console.log('✅ Successfully injected into:');
    stats.files.forEach(file => console.log(`   - ${file}`));
  }
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════');
  
  if (stats.injected > 0) {
    console.log('✅ Injection complete!');
    console.log('🚗 All target files now have Fibonacci Vehicle Safety protection');
  } else {
    console.log('ℹ️  No new files needed injection (all already protected)');
  }
  
  console.log('═══════════════════════════════════════════════════════════════════');
}

// Run the script
main();
