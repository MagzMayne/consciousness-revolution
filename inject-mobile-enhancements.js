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
 * File: inject-mobile-enhancements.js
 * Declaration ID: IP-7A9E73BF-MLL28ZV1
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
 * Script to inject mobile enhancements into all HTML files
 * Adds CSS and JS references to enable mobile-first design
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CSS_LINK = '<link rel="stylesheet" href="/css/mobile-enhanced.css">';
const JS_SCRIPT = '<script src="/js/mobile-enhancer.js"></script>';
const MARKER_CSS = '<!-- Mobile Enhanced CSS -->';
const MARKER_JS = '<!-- Mobile Enhanced JS -->';

const IGNORE_DIRS = new Set([
  'node_modules',
  'Mandemos-v2-main',
  'ember-terminal-main',
  'meshMintVaultLauncher',
  'projectPool',
  'relicLogger',
  'city-3d',
  '.git',
  'backend'
]);

/**
 * Recursively find all HTML files
 */
function findHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip ignored directories
      if (!IGNORE_DIRS.has(file)) {
        findHtmlFiles(filePath, fileList);
      }
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Check if file already has mobile enhancements
 */
function hasEnhancements(content) {
  return content.includes('mobile-enhanced.css') || content.includes('mobile-enhancer.js');
}

/**
 * Inject enhancements into HTML content
 */
function injectEnhancements(content) {
  // Check if already enhanced
  if (hasEnhancements(content)) {
    return { content, modified: false };
  }

  let modified = false;
  let newContent = content;

  // Inject CSS in <head> section
  if (/<head>/i.test(newContent)) {
    newContent = newContent.replace(
      /<head>/i,
      `<head>\n  ${MARKER_CSS}\n  ${CSS_LINK}`
    );
    modified = true;
  }

  // Inject JS before closing </body> tag
  if (/<\/body>/i.test(newContent)) {
    newContent = newContent.replace(
      /<\/body>/i,
      `  ${MARKER_JS}\n  ${JS_SCRIPT}\n</body>`
    );
    modified = true;
  }

  return { content: newContent, modified };
}

/**
 * Process a single HTML file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { content: newContent, modified } = injectEnhancements(content);

    if (modified) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Enhanced: ${path.relative(process.cwd(), filePath)}`);
      return true;
    } else {
      console.log(`⏭️  Skipped: ${path.relative(process.cwd(), filePath)}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Starting mobile enhancement injection...\n');

  // Find all HTML files
  const htmlFiles = findHtmlFiles(__dirname);

  console.log(`📄 Found ${htmlFiles.length} HTML files\n`);

  let enhanced = 0;
  let skipped = 0;

  // Process each file
  for (const file of htmlFiles) {
    if (processFile(file)) {
      enhanced++;
    } else {
      skipped++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary:');
  console.log(`   Total files: ${htmlFiles.length}`);
  console.log(`   Enhanced: ${enhanced}`);
  console.log(`   Skipped: ${skipped}`);
  console.log('='.repeat(50));
  console.log('\n✨ Mobile enhancement injection complete!');
}

// Run the script
try {
  main();
} catch (error) {
  console.error('❌ Fatal error:', error);
  process.exit(1);
}
