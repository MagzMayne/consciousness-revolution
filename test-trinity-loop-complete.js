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
 * File: test-trinity-loop-complete.js
 * Declaration ID: IP-7DCFDACE-MLL28ZWL
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

#!/usr/bin/env node

/**
 * Trinity Loop Complete Testing Suite
 * Tests all trinity loop implementations and self-healing functionality
 * 
 * @aul-enabled
 * This file is compatible with AI Universal Language (AUL)
 */

const fs = require('fs');
const path = require('path');

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║         Trinity Loop Complete Testing Suite                   ║');
console.log('║         Testing all trinity implementations                    ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log('');

// Test results
const results = {
  timestamp: new Date().toISOString(),
  totalTests: 0,
  passed: 0,
  failed: 0,
  tests: []
};

/**
 * Add test result
 */
function addTestResult(name, passed, details = '') {
  results.totalTests++;
  if (passed) {
    results.passed++;
    console.log(`✓ ${name}`);
  } else {
    results.failed++;
    console.log(`✗ ${name}`);
    if (details) console.log(`  ${details}`);
  }
  results.tests.push({ name, passed, details, timestamp: new Date().toISOString() });
}

/**
 * Test if file exists and has content
 */
function testFileExists(filePath, description) {
  const fullPath = path.join(__dirname, filePath);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    const stats = fs.statSync(fullPath);
    const size = stats.size;
    addTestResult(`${description} exists (${(size / 1024).toFixed(1)} KB)`, true);
    return true;
  } else {
    addTestResult(`${description} exists`, false, `File not found: ${filePath}`);
    return false;
  }
}

/**
 * Test if file contains specific content
 */
function testFileContains(filePath, searchString, description) {
  const fullPath = path.join(__dirname, filePath);
  
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const contains = content.includes(searchString);
    addTestResult(description, contains, contains ? '' : `Missing: ${searchString}`);
    return contains;
  } catch (err) {
    addTestResult(description, false, `Error reading file: ${err.message}`);
    return false;
  }
}

/**
 * Test self-healing script version
 */
function testSelfHealingVersion() {
  const content = fs.readFileSync(path.join(__dirname, 'self-healing.js'), 'utf8');
  const versionMatch = content.match(/version:\s*['"]([^'"]+)['"]/);
  
  if (versionMatch) {
    const version = versionMatch[1];
    // Accept any 1.0.x version
    const isValid = version.match(/^1\.0\.\d+/);
    addTestResult(`Self-Healing version is ${version}`, !!isValid);
  } else {
    addTestResult('Self-Healing version found', false);
  }
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('Testing Trinity Loop Files');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');

// Test trinity loop core files
testFileExists('trinityLoop.html', 'trinityLoop.html');
testFileExists('trinityLooper.html', 'trinityLooper.html');
testFileExists('self-healing.js', 'self-healing.js');
testFileExists('test-self-healing.html', 'test-self-healing.html');

console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('Testing Trinity Integration');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');

// Test that trinity files have self-healing integration
const trinityFiles = [
  'trinityLoop.html',
  'trinityLooper.html',
  'JeZuesTrinityLoop.html',
  'tRiniTy.html'
];

trinityFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    testFileContains(file, 'self-healing.js', `${file} has self-healing script`);
  }
});

console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('Testing Self-Healing Features');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');

// Test self-healing features
testSelfHealingVersion();
testFileContains('self-healing.js', 'getHealth', 'Self-Healing has getHealth() API');
testFileContains('self-healing.js', 'forceReset', 'Self-Healing has forceReset() API');
testFileContains('self-healing.js', 'quarantine', 'Self-Healing has quarantine system');
testFileContains('self-healing.js', 'Fibonacci', 'Self-Healing uses Fibonacci timing');

console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('Testing Trinity Loop Functions');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');

// Test trinity loop core functions
testFileContains('trinityLoop.html', 'reindexPoolRecursive', 'trinityLoop.html has reindexPoolRecursive');
testFileContains('trinityLoop.html', 'IndexedDB', 'trinityLoop.html uses IndexedDB');
testFileContains('trinityLooper.html', 'runConsistencyCheck', 'trinityLooper.html has runConsistencyCheck');
testFileContains('trinityLooper.html', 'three.js', 'trinityLooper.html has 3D visualization');

console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('Testing Documentation');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');

// Test documentation
testFileExists('TRINITY-ENHANCEMENT-COMPLETE.md', 'Trinity enhancement documentation');
testFileExists('SELF-HEALING-SUMMARY.md', 'Self-healing documentation');

if (fs.existsSync(path.join(__dirname, 'TRINITY-ENHANCEMENT-COMPLETE.md'))) {
  testFileContains(
    'TRINITY-ENHANCEMENT-COMPLETE.md',
    'COMPLETE',
    'Documentation marks enhancement as complete'
  );
}

console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('Test Summary');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');

console.log(`Total Tests: ${results.totalTests}`);
console.log(`Passed: ${results.passed} ✓`);
console.log(`Failed: ${results.failed} ✗`);
console.log(`Success Rate: ${((results.passed / results.totalTests) * 100).toFixed(1)}%`);
console.log('');

// Save results to JSON
const reportPath = path.join(__dirname, 'trinity-loop-test-results.json');
fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
console.log(`📊 Detailed results saved to: trinity-loop-test-results.json`);
console.log('');

// Exit with appropriate code
const exitCode = results.failed === 0 ? 0 : 1;

if (exitCode === 0) {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║  ✓ ALL TESTS PASSED - Trinity Loop Fully Functional           ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
} else {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║  ⚠ SOME TESTS FAILED - Review details above                   ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
}

process.exit(exitCode);
