#!/usr/bin/env node

/**
 * Test Suite for README Automation Scripts
 * Validates that scan-projects.js, update-projects-json.js, and update-readme.js work correctly
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '../..');
const SCRIPTS_DIR = path.join(__dirname);

// ANSI colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function testFileExists(filePath, description) {
  log(`\nTesting: ${description}`, 'cyan');
  if (fs.existsSync(filePath)) {
    log(`✅ PASS: ${path.basename(filePath)} exists`, 'green');
    return true;
  } else {
    log(`❌ FAIL: ${path.basename(filePath)} not found`, 'red');
    return false;
  }
}

function testJSONStructure(filePath, requiredFields, description) {
  log(`\nTesting: ${description}`, 'cyan');
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    const missingFields = requiredFields.filter(field => {
      const parts = field.split('.');
      let current = data;
      for (const part of parts) {
        if (current[part] === undefined) return true;
        current = current[part];
      }
      return false;
    });
    
    if (missingFields.length === 0) {
      log(`✅ PASS: JSON structure valid with all required fields`, 'green');
      return true;
    } else {
      log(`❌ FAIL: Missing fields: ${missingFields.join(', ')}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ FAIL: ${error.message}`, 'red');
    return false;
  }
}

function testScriptExecution(scriptPath, description) {
  log(`\nTesting: ${description}`, 'cyan');
  try {
    const output = execSync(`node ${scriptPath}`, {
      cwd: REPO_ROOT,
      encoding: 'utf8'
    });
    
    if (output.includes('✅')) {
      log(`✅ PASS: Script executed successfully`, 'green');
      log(`   Output: ${output.split('\n')[0]}`, 'yellow');
      return true;
    } else {
      log(`⚠️ WARN: Script executed but unexpected output`, 'yellow');
      log(`   Output: ${output}`, 'yellow');
      return true; // Still passing, just warning
    }
  } catch (error) {
    log(`❌ FAIL: Script execution failed`, 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

function testREADMEContent(description) {
  log(`\nTesting: ${description}`, 'cyan');
  try {
    const readme = fs.readFileSync(path.join(REPO_ROOT, 'README.md'), 'utf8');
    
    const checks = [
      { pattern: '### 📊 Project Statistics', name: 'Statistics section' },
      { pattern: '### 📅 Recent Projects', name: 'Recent projects section' },
      { pattern: '**Total Projects**:', name: 'Total projects count' },
      { pattern: '**Status Breakdown**:', name: 'Status breakdown' },
      { pattern: '**Top Categories**:', name: 'Top categories' },
      { pattern: '**Top Technologies**:', name: 'Top technologies' },
      { pattern: '*Last scanned:', name: 'Last scanned timestamp' }
    ];
    
    let allPassed = true;
    for (const check of checks) {
      if (readme.includes(check.pattern)) {
        log(`  ✓ ${check.name} found`, 'green');
      } else {
        log(`  ✗ ${check.name} missing`, 'red');
        allPassed = false;
      }
    }
    
    if (allPassed) {
      log(`✅ PASS: README contains all required sections`, 'green');
      return true;
    } else {
      log(`❌ FAIL: README missing some sections`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ FAIL: ${error.message}`, 'red');
    return false;
  }
}

function testProjectMetadata(description) {
  log(`\nTesting: ${description}`, 'cyan');
  try {
    const scannedPath = path.join(SCRIPTS_DIR, 'scanned-projects.json');
    const content = fs.readFileSync(scannedPath, 'utf8');
    const data = JSON.parse(content);
    
    if (!data.projects || data.projects.length === 0) {
      log(`❌ FAIL: No projects found in scan`, 'red');
      return false;
    }
    
    // Check first project has all required fields
    const project = data.projects[0];
    const requiredFields = [
      'name', 'fileName', 'path', 'title', 'description',
      'category', 'status', 'technologies', 'hasInteractive',
      'created', 'modified', 'size'
    ];
    
    const missingFields = requiredFields.filter(field => project[field] === undefined);
    
    if (missingFields.length === 0) {
      log(`✅ PASS: Project metadata includes all required fields`, 'green');
      log(`   Sample project: ${project.title}`, 'yellow');
      log(`   Category: ${project.category}, Status: ${project.status}`, 'yellow');
      log(`   Technologies: ${project.technologies.join(', ') || 'none'}`, 'yellow');
      return true;
    } else {
      log(`❌ FAIL: Missing fields in project metadata: ${missingFields.join(', ')}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ FAIL: ${error.message}`, 'red');
    return false;
  }
}

function testStatistics(description) {
  log(`\nTesting: ${description}`, 'cyan');
  try {
    const scannedPath = path.join(SCRIPTS_DIR, 'scanned-projects.json');
    const content = fs.readFileSync(scannedPath, 'utf8');
    const data = JSON.parse(content);
    
    if (!data.statistics) {
      log(`❌ FAIL: Statistics not found in scanned data`, 'red');
      return false;
    }
    
    const stats = data.statistics;
    
    // Check statistics structure
    if (stats.byStatus && stats.byCategory && stats.topTechnologies) {
      log(`✅ PASS: Statistics structure valid`, 'green');
      log(`   Working: ${stats.byStatus.working}, Partial: ${stats.byStatus.partial}`, 'yellow');
      log(`   Categories: ${Object.keys(stats.byCategory).length}`, 'yellow');
      log(`   Technologies tracked: ${Object.keys(stats.topTechnologies).length}`, 'yellow');
      return true;
    } else {
      log(`❌ FAIL: Statistics structure incomplete`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ FAIL: ${error.message}`, 'red');
    return false;
  }
}

// Main test execution
function runTests() {
  log('===========================================', 'cyan');
  log('README Automation Test Suite', 'cyan');
  log('===========================================', 'cyan');
  
  const results = [];
  
  // Test 1: Check script files exist
  results.push(testFileExists(
    path.join(SCRIPTS_DIR, 'scan-projects.js'),
    'scan-projects.js exists'
  ));
  
  results.push(testFileExists(
    path.join(SCRIPTS_DIR, 'update-projects-json.js'),
    'update-projects-json.js exists'
  ));
  
  results.push(testFileExists(
    path.join(SCRIPTS_DIR, 'update-readme.js'),
    'update-readme.js exists'
  ));
  
  // Test 2: Execute scan-projects.js
  results.push(testScriptExecution(
    path.join(SCRIPTS_DIR, 'scan-projects.js'),
    'Execute scan-projects.js'
  ));
  
  // Test 3: Check scanned-projects.json structure
  results.push(testJSONStructure(
    path.join(SCRIPTS_DIR, 'scanned-projects.json'),
    ['scanDate', 'totalProjects', 'recentProjects', 'statistics', 'projects'],
    'scanned-projects.json structure'
  ));
  
  // Test 4: Check project metadata
  results.push(testProjectMetadata('Project metadata completeness'));
  
  // Test 5: Check statistics
  results.push(testStatistics('Statistics calculation'));
  
  // Test 6: Execute update-projects-json.js
  results.push(testScriptExecution(
    path.join(SCRIPTS_DIR, 'update-projects-json.js'),
    'Execute update-projects-json.js'
  ));
  
  // Test 7: Check projects.json structure
  results.push(testJSONStructure(
    path.join(REPO_ROOT, 'projects.json'),
    ['meta', 'html_projects'],
    'projects.json structure'
  ));
  
  // Test 8: Check recent-projects.json
  results.push(testJSONStructure(
    path.join(SCRIPTS_DIR, 'recent-projects.json'),
    ['generated', 'projects'],
    'recent-projects.json structure'
  ));
  
  // Test 9: Execute update-readme.js
  results.push(testScriptExecution(
    path.join(SCRIPTS_DIR, 'update-readme.js'),
    'Execute update-readme.js'
  ));
  
  // Test 10: Check README content
  results.push(testREADMEContent('README.md content validation'));
  
  // Summary
  log('\n===========================================', 'cyan');
  log('Test Summary', 'cyan');
  log('===========================================', 'cyan');
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  const percentage = Math.round((passed / total) * 100);
  
  log(`\nTests Passed: ${passed}/${total} (${percentage}%)`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    log('\n🎉 All tests passed! Automation system is working correctly.', 'green');
    process.exit(0);
  } else {
    log('\n⚠️ Some tests failed. Please review the errors above.', 'yellow');
    process.exit(1);
  }
}

// Run the tests
runTests();
