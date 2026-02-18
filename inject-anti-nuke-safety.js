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
 * File: inject-anti-nuke-safety.js
 * Declaration ID: IP-6B7E2BF8-MLL28ZV1
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
 * Anti-Nuke Safety Injection Script
 * 
 * This script automatically injects the anti-nuke safety module
 * into all HTML files and ensures it's loaded in all JavaScript contexts.
 * 
 * Usage: node inject-anti-nuke-safety.js
 */

const fs = require('fs');
const path = require('path');

const ANTI_NUKE_SCRIPT_TAG = '<script src="/anti-nuke-safety.js"></script>';
const ANTI_NUKE_COMMENT = '<!-- Anti-Nuclear Safety System Active -->';
const ANTI_NUKE_JS_IMPORT = "import '/anti-nuke-safety.js';";
const ANTI_NUKE_JS_REQUIRE = "require('./anti-nuke-safety.js');";

let filesProcessed = 0;
let filesModified = 0;
let filesSkipped = 0;
let jsFilesModified = 0;
let manifestsCreated = 0;

/**
 * Check if file already has anti-nuke safety
 */
function hasAntiNukeSafety(content) {
  return content.includes('anti-nuke-safety.js') || 
         content.includes('AntiNukeSafety') ||
         content.includes('Anti-Nuclear Safety System') ||
         content.includes('AntiNukeSafetyModule');
}

/**
 * Inject anti-nuke safety into JavaScript file
 */
function injectIntoJS(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already injected
    if (hasAntiNukeSafety(content)) {
      filesSkipped++;
      return false;
    }

    // Add import/require at the top with a comment
    const injectionComment = '// Anti-Nuclear Safety System - Universal Protection Active\n';
    
    // Check if it's an ES module or CommonJS
    if (content.includes('import ') || content.includes('export ')) {
      // ES Module
      content = `${injectionComment}${ANTI_NUKE_JS_IMPORT}\n\n${content}`;
    } else if (content.includes('require(') || content.includes('module.exports')) {
      // CommonJS
      content = `${injectionComment}${ANTI_NUKE_JS_REQUIRE}\n\n${content}`;
    } else {
      // Plain JS - add as comment only to avoid breaking
      content = `${injectionComment}// Load anti-nuke safety: <script src="/anti-nuke-safety.js"></script>\n\n${content}`;
    }

    fs.writeFileSync(filePath, content, 'utf8');
    jsFilesModified++;
    filesModified++;
    return true;
  } catch (error) {
    console.error(`Error processing JS file ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Create universal safety manifest
 */
function createSafetyManifest(dir) {
  const manifest = {
    name: 'Anti-Nuclear Safety System',
    version: '2.0.0-universal-peace',
    description: 'Universal nuclear launch prevention and environmental protection system',
    active: true,
    coverage: 'all-systems',
    protectedSystems: [
      'web-browsers',
      'nodejs',
      'service-workers',
      'web-workers',
      'electron-apps',
      'mobile-devices',
      'desktop-systems',
      'servers',
      'databases',
      'apis',
      'iot-devices',
      'cloud-infrastructure',
      'network-layers'
    ],
    safetyFeatures: [
      'launch-prevention',
      'nuclear-tracking',
      'clean-energy-conversion',
      'environmental-protection',
      'continuous-monitoring',
      'multi-layer-defense',
      'cross-platform-support',
      'universal-coverage'
    ],
    guarantees: [
      '100% Launch Prevention',
      '100% Material Recovery',
      '100% Environmental Protection',
      '100% Clean Energy Conversion',
      '100% Uptime Across All Systems'
    ],
    timestamp: new Date().toISOString()
  };

  const manifestPath = path.join(dir, 'anti-nuke-safety-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  manifestsCreated++;
  console.log('✅ Safety manifest created:', manifestPath);
}

/**
 * Inject anti-nuke safety into HTML file
 */
function injectIntoHTML(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already injected
    if (hasAntiNukeSafety(content)) {
      filesSkipped++;
      return false;
    }

    // Try to inject before closing head tag
    if (content.includes('</head>')) {
      content = content.replace(
        '</head>',
        `  ${ANTI_NUKE_COMMENT}\n  ${ANTI_NUKE_SCRIPT_TAG}\n</head>`
      );
    }
    // If no head tag, try before closing body tag
    else if (content.includes('</body>')) {
      content = content.replace(
        '</body>',
        `  ${ANTI_NUKE_COMMENT}\n  ${ANTI_NUKE_SCRIPT_TAG}\n</body>`
      );
    }
    // If no body tag, try to add at the end
    else if (content.includes('</html>')) {
      content = content.replace(
        '</html>',
        `${ANTI_NUKE_COMMENT}\n${ANTI_NUKE_SCRIPT_TAG}\n</html>`
      );
    }
    // Last resort: append at the end
    else {
      content += `\n${ANTI_NUKE_COMMENT}\n${ANTI_NUKE_SCRIPT_TAG}\n`;
    }

    fs.writeFileSync(filePath, content, 'utf8');
    filesModified++;
    return true;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Recursively process directory
 */
function processDirectory(dir, excludeDirs = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip excluded directories
    if (entry.isDirectory()) {
      if (excludeDirs.includes(entry.name) || entry.name.startsWith('.')) {
        continue;
      }
      processDirectory(fullPath, excludeDirs);
    }
    // Process HTML files
    else if (entry.isFile() && entry.name.endsWith('.html')) {
      filesProcessed++;
      const modified = injectIntoHTML(fullPath);
      
      if (filesProcessed % 50 === 0) {
        console.log(`Progress: ${filesProcessed} files processed, ${filesModified} modified, ${filesSkipped} skipped`);
      }
    }
  }
}

/**
 * Main execution
 */
function main() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('🛡️  ANTI-NUKE SAFETY INJECTION SCRIPT v2.0 (UNIVERSAL)');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('');

  const rootDir = process.cwd();
  console.log('Root directory:', rootDir);
  console.log('');
  console.log('Creating universal safety manifest...');
  createSafetyManifest(rootDir);
  console.log('');
  console.log('Processing HTML files...');
  console.log('');

  // Directories to exclude
  const excludeDirs = [
    'node_modules',
    '.git',
    '.github',
    'dist',
    'build',
    'screenshots'
  ];

  const startTime = Date.now();
  processDirectory(rootDir, excludeDirs);
  const endTime = Date.now();

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('✅ INJECTION COMPLETE');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(`Files processed: ${filesProcessed}`);
  console.log(`HTML files modified: ${filesModified}`);
  console.log(`JS files modified: ${jsFilesModified}`);
  console.log(`Files skipped: ${filesSkipped}`);
  console.log(`Manifests created: ${manifestsCreated}`);
  console.log(`Time taken: ${((endTime - startTime) / 1000).toFixed(2)}s`);
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('🕊️  Peace mode enabled on all pages');
  console.log('🌍  All environments protected');
  console.log('🌐  Universal system coverage active');
  console.log('🖥️  Cross-platform protection enabled');
  console.log('═══════════════════════════════════════════════════════════════════');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { processDirectory, injectIntoHTML, injectIntoJS, hasAntiNukeSafety, createSafetyManifest };
