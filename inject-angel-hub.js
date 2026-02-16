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
 * File: inject-angel-hub.js
 * Declaration ID: IP-3F7C8D16-MLL28ZV1
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
 * Angel Investment Hub Injector
 * 
 * This script automatically injects the Angel Investment Hub into all HTML files
 * in the repository. It adds the necessary script tags before the closing </body> tag.
 * 
 * Usage: node inject-angel-hub.js [--dry-run] [--force]
 * 
 * Options:
 *   --dry-run  Show what would be changed without making changes
 *   --force    Inject even if already present (re-inject)
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  SCRIPT_TAG: '<script src="/src/utils/angel-investment-hub.js"></script>',
  PAYPAL_SCRIPT_TAG: '<script src="/src/utils/paypal-integration.js"></script>',
  COMMENT_MARKER: '<!-- Angel Investment Hub -->',
  PAYPAL_COMMENT: '<!-- PayPal Integration -->',
  SCRIPT_PATHS: {
    angelHub: '/src/utils/angel-investment-hub.js',
    paypal: '/src/utils/paypal-integration.js'
  }
};

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isForce = args.includes('--force');

// Statistics
let stats = {
  total: 0,
  injected: 0,
  alreadyPresent: 0,
  failed: 0,
  skipped: 0
};

/**
 * Find all HTML files in the repository
 */
function findHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip certain directories
      if (!['node_modules', '.git', 'backend', 'dist', '.vscode', '.github'].includes(file)) {
        findHtmlFiles(filePath, fileList);
      }
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Check if file already has the Angel Investment Hub
 */
function hasAngelHub(content) {
  return content.includes(CONFIG.SCRIPT_PATHS.angelHub) || content.includes(CONFIG.COMMENT_MARKER);
}

/**
 * Check if file has PayPal integration
 */
function hasPayPalIntegration(content) {
  return content.includes(CONFIG.SCRIPT_PATHS.paypal) || content.includes(CONFIG.PAYPAL_COMMENT);
}

/**
 * Inject scripts into HTML file
 */
function injectScripts(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Check if already injected
    if (hasAngelHub(content) && !isForce) {
      stats.alreadyPresent++;
      return false;
    }
    
    // Find the closing body tag
    const bodyCloseIndex = content.lastIndexOf('</body>');
    
    if (bodyCloseIndex === -1) {
      console.log(`⚠️  No </body> tag found in ${path.basename(filePath)} - skipping`);
      stats.skipped++;
      return false;
    }
    
    // Prepare injection content
    let injection = '';
    
    // Add PayPal integration if not present
    if (!hasPayPalIntegration(content)) {
      injection += `\n${CONFIG.PAYPAL_COMMENT}\n${CONFIG.PAYPAL_SCRIPT_TAG}\n`;
    }
    
    // Add Angel Investment Hub
    injection += `${CONFIG.COMMENT_MARKER}\n${CONFIG.SCRIPT_TAG}\n`;
    
    // Remove old injection if force mode
    if (isForce && hasAngelHub(content)) {
      // Remove old Angel Hub injection - use configurable path
      const escapedPath = CONFIG.SCRIPT_PATHS.angelHub.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      content = content.replace(new RegExp(`\\s*${CONFIG.COMMENT_MARKER}\\s*\\n\\s*<script[^>]*${escapedPath}[^>]*></script>\\s*\\n?`, 'g'), '');
    }
    
    // Inject before closing body tag
    content = content.slice(0, bodyCloseIndex) + injection + content.slice(bodyCloseIndex);
    modified = true;
    
    // Write back to file (unless dry run)
    if (!isDryRun && modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      stats.injected++;
      return true;
    } else if (isDryRun && modified) {
      stats.injected++; // Count for dry run
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${path.basename(filePath)}:`, error.message);
    stats.failed++;
    return false;
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Angel Investment Hub Injector\n');
  
  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  }
  
  if (isForce) {
    console.log('⚡ FORCE MODE - Re-injecting even if already present\n');
  }
  
  const rootDir = __dirname;
  console.log(`📁 Scanning directory: ${rootDir}\n`);
  
  const htmlFiles = findHtmlFiles(rootDir);
  stats.total = htmlFiles.length;
  
  console.log(`Found ${htmlFiles.length} HTML files\n`);
  console.log('Processing files...\n');
  
  htmlFiles.forEach((file, index) => {
    const relativePath = path.relative(rootDir, file);
    const injected = injectScripts(file);
    
    if (injected) {
      console.log(`✅ [${index + 1}/${htmlFiles.length}] Injected: ${relativePath}`);
    } else if (hasAngelHub(fs.readFileSync(file, 'utf8')) && !isForce) {
      // Already present, not verbose
    } else {
      // Skipped or failed (already logged)
    }
  });
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total HTML files:        ${stats.total}`);
  console.log(`✅ Injected:             ${stats.injected}`);
  console.log(`ℹ️  Already present:      ${stats.alreadyPresent}`);
  console.log(`⚠️  Skipped:              ${stats.skipped}`);
  console.log(`❌ Failed:               ${stats.failed}`);
  console.log('='.repeat(60));
  
  if (isDryRun) {
    console.log('\n💡 This was a dry run. Run without --dry-run to apply changes.');
  } else {
    console.log('\n✨ Done! Angel Investment Hub has been injected into all HTML files.');
  }
  
  // Exit with appropriate code
  process.exit(stats.failed > 0 ? 1 : 0);
}

// Run the script
main();
