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
 * File: validate-copilot-config.js
 * Declaration ID: IP-35581843-MLL28ZWL
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Validation script for GitHub Copilot agent configuration
 * 
 * This script validates that all required Copilot instruction files
 * exist and contain the necessary information.
 */

const fs = require('fs');
const path = require('path');

console.log('🤖 Validating GitHub Copilot Agent Configuration...\n');

let errors = 0;
let warnings = 0;

/**
 * Check if file exists
 */
function checkFileExists(filePath, description) {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${description}: ${filePath}`);
    return true;
  } else {
    console.log(`❌ ${description} NOT FOUND: ${filePath}`);
    errors++;
    return false;
  }
}

/**
 * Check file content for required sections
 */
function checkFileContent(filePath, requiredSections) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    return false;
  }
  
  const content = fs.readFileSync(fullPath, 'utf-8');
  const missing = [];
  
  requiredSections.forEach(section => {
    if (!content.toLowerCase().includes(section.toLowerCase())) {
      missing.push(section);
    }
  });
  
  if (missing.length > 0) {
    console.log(`⚠️  ${filePath} missing sections: ${missing.join(', ')}`);
    warnings++;
    return false;
  }
  
  return true;
}

// Check main Copilot instructions file
console.log('📋 Checking main instruction files...');
checkFileExists('.github/copilot-instructions.md', 'Repository-wide instructions');
checkFileExists('COPILOT_QUICKSTART.md', 'Quick start guide');
checkFileExists('AGENTS.md', 'Agent-specific instructions');

console.log('\n📁 Checking path-specific instruction files...');
const instructionFiles = [
  '.github/instructions/html-files.instructions.md',
  '.github/instructions/javascript-files.instructions.md',
  '.github/instructions/agent-files.instructions.md',
  '.github/instructions/workflow-files.instructions.md'
];

instructionFiles.forEach(file => {
  checkFileExists(file, `Path-specific instructions: ${path.basename(file)}`);
});

console.log('\n🔍 Validating content of instruction files...');

// Check repository-wide instructions
checkFileContent('.github/copilot-instructions.md', [
  'Project Overview',
  'Core Technologies',
  'Repository Structure',
  'Development Workflow',
  'Code Standards',
  'Monetization Systems',
  'PayPal Integration',
  'Agent Systems',
  'Security Requirements',
  'Testing Requirements'
]);

// Check HTML instructions
checkFileContent('.github/instructions/html-files.instructions.md', [
  'applyTo',
  'Accessibility Requirements',
  'Mobile Responsiveness',
  'Payment Pages',
  'PayPal'
]);

// Check JavaScript instructions
checkFileContent('.github/instructions/javascript-files.instructions.md', [
  'applyTo',
  'Code Style Standards',
  'Error Handling',
  'Payment Integration',
  'Security Requirements'
]);

// Check agent instructions
checkFileContent('.github/instructions/agent-files.instructions.md', [
  'applyTo',
  'Agent Design Principles',
  'Self-healing',
  'Merlin Hive'
]);

// Check workflow instructions
checkFileContent('.github/instructions/workflow-files.instructions.md', [
  'applyTo',
  'Workflow Structure Standards',
  'Security Checklist',
  'Revenue-Critical Workflows'
]);

console.log('\n📊 Checking monetization documentation...');
checkFileExists('MONETIZATION.md', 'Monetization guide');
checkFileContent('MONETIZATION.md', [
  'Government Grant',
  'Contributor Revenue Sharing',
  'PayPal'
]);

console.log('\n🔧 Checking configuration files...');
const configFiles = [
  'package.json',
  'agent-deployment-manifest.json',
  'merlin-minions-config.json',
  'agent-r-manifest.json'
];

configFiles.forEach(file => {
  checkFileExists(file, `Configuration: ${file}`);
});

console.log('\n💰 Checking revenue-critical files...');
const criticalFiles = [
  'contributor-registration-enhanced.html',
  'government-grants-portal.html'
];

criticalFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`✅ Revenue-critical file exists: ${file}`);
  } else {
    console.log(`⚠️  Revenue-critical file not found: ${file}`);
    warnings++;
  }
});

console.log('\n🧪 Checking test scripts...');
const testScripts = [
  'test-paypal-integration.js',
  'test-agent-system.js'
];

testScripts.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ Test script exists: ${file}`);
  } else {
    console.log(`⚠️  Test script not found: ${file}`);
    warnings++;
  }
});

// Check package.json scripts
console.log('\n📦 Checking npm scripts...');
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const requiredScripts = ['start', 'test', 'build'];
    
    requiredScripts.forEach(script => {
      if (packageJson.scripts && packageJson.scripts[script]) {
        console.log(`✅ npm script exists: ${script}`);
      } else {
        console.log(`❌ npm script missing: ${script}`);
        errors++;
      }
    });
  } catch (error) {
    console.log(`❌ Failed to parse package.json: ${error.message}`);
    errors++;
  }
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 Validation Summary');
console.log('='.repeat(60));

if (errors === 0 && warnings === 0) {
  console.log('✨ All checks passed! GitHub Copilot configuration is complete.');
  console.log('\n🚀 Ready to use with GitHub Copilot coding agent!');
  console.log('\n📖 Next steps:');
  console.log('   1. Read COPILOT_QUICKSTART.md for usage guidelines');
  console.log('   2. Create clear, well-scoped issues for Copilot');
  console.log('   3. Review Copilot\'s changes carefully');
  console.log('   4. Test thoroughly before merging');
  process.exit(0);
} else {
  console.log(`⚠️  Validation completed with issues:`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   ⚠️  Warnings: ${warnings}`);
  
  if (errors > 0) {
    console.log('\n❌ Critical files missing. Please review and fix errors.');
    process.exit(1);
  } else {
    console.log('\n⚠️  Some warnings found, but configuration should still work.');
    console.log('   Consider addressing warnings for optimal results.');
    process.exit(0);
  }
}
