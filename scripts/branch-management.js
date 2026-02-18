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
 * File: branch-management.js
 * Declaration ID: IP-4B2A3617-MLL28ZVU
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Branch Management Script for Barbrick Design Repository
 * 
 * This script helps manage the 715+ branches in the repository by:
 * - Analyzing branch states
 * - Identifying stale branches
 * - Checking merge status
 * - Generating reports
 * 
 * Usage: node scripts/branch-management.js [command]
 * Commands:
 *   analyze    - Analyze all branches and generate report
 *   stale      - List stale branches (older than 90 days)
 *   conflicts  - Check for branches with merge conflicts
 *   merged     - List branches already merged into main
 *   help       - Show this help message
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const STALE_DAYS = 90; // Consider branches stale after 90 days
const MAIN_BRANCH = 'main';

// Helper functions
function execCommand(command) {
  try {
    return execSync(command, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    return '';
  }
}

function getAllRemoteBranches() {
  const output = execCommand('git ls-remote --heads origin');
  const branches = [];
  
  output.split('\n').forEach(line => {
    if (line.trim()) {
      const [sha, ref] = line.split('\t');
      const branchName = ref.replace('refs/heads/', '');
      branches.push({ name: branchName, sha: sha.trim() });
    }
  });
  
  return branches;
}

function getBranchAge(branchName) {
  try {
    const timestamp = execCommand(`git log -1 --format=%ct origin/${branchName}`).trim();
    const date = new Date(parseInt(timestamp) * 1000);
    const now = new Date();
    const ageInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    return { date, ageInDays };
  } catch (error) {
    return { date: null, ageInDays: null };
  }
}

function isAlreadyMerged(branchName) {
  try {
    const output = execCommand(`git branch -r --merged ${MAIN_BRANCH} | grep "origin/${branchName}$"`);
    return output.trim().length > 0;
  } catch (error) {
    return false;
  }
}

function hasConflicts(branchName) {
  try {
    // Try a test merge
    execCommand(`git merge-tree $(git merge-base ${MAIN_BRANCH} origin/${branchName}) ${MAIN_BRANCH} origin/${branchName} > /tmp/merge-test-${Date.now()}.txt 2>&1`);
    const result = execCommand(`cat /tmp/merge-test-${Date.now()}.txt | grep -c "<<<<<<" || true`).trim();
    return parseInt(result) > 0;
  } catch (error) {
    return false;
  }
}

function analyzeBranches() {
  console.log('🔍 Analyzing all branches...\n');
  console.log('Fetching branch list...');
  
  const branches = getAllRemoteBranches();
  console.log(`Found ${branches.length} remote branches\n`);
  
  const analysis = {
    total: branches.length,
    stale: [],
    merged: [],
    active: [],
    mainBranch: null
  };
  
  console.log('Analyzing each branch (this may take a while)...\n');
  
  branches.forEach((branch, index) => {
    if (index % 50 === 0) {
      console.log(`Progress: ${index}/${branches.length} branches analyzed...`);
    }
    
    if (branch.name === MAIN_BRANCH) {
      analysis.mainBranch = branch;
      return;
    }
    
    const { date, ageInDays } = getBranchAge(branch.name);
    const merged = isAlreadyMerged(branch.name);
    
    const branchInfo = {
      name: branch.name,
      sha: branch.sha,
      lastCommitDate: date,
      ageInDays: ageInDays,
      merged: merged
    };
    
    if (merged) {
      analysis.merged.push(branchInfo);
    } else if (ageInDays > STALE_DAYS) {
      analysis.stale.push(branchInfo);
    } else {
      analysis.active.push(branchInfo);
    }
  });
  
  return analysis;
}

function generateReport(analysis) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 BRANCH ANALYSIS REPORT');
  console.log('='.repeat(80));
  console.log();
  
  console.log(`Total branches: ${analysis.total}`);
  console.log(`Main branch: ${MAIN_BRANCH}`);
  console.log();
  
  console.log('📈 Branch Status:');
  console.log(`  ✅ Already merged: ${analysis.merged.length} branches`);
  console.log(`  ⏰ Stale (>${STALE_DAYS} days): ${analysis.stale.length} branches`);
  console.log(`  🚀 Active: ${analysis.active.length} branches`);
  console.log();
  
  // Save detailed report
  const reportPath = path.join(process.cwd(), 'branch-analysis-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));
  console.log(`📁 Detailed report saved to: ${reportPath}`);
  console.log();
  
  return analysis;
}

function showStaleBranches() {
  console.log('🔍 Finding stale branches...\n');
  
  const branches = getAllRemoteBranches();
  const staleBranches = [];
  
  branches.forEach((branch, index) => {
    if (branch.name === MAIN_BRANCH) return;
    
    if (index % 50 === 0) {
      console.log(`Progress: ${index}/${branches.length} branches checked...`);
    }
    
    const { date, ageInDays } = getBranchAge(branch.name);
    
    if (ageInDays > STALE_DAYS) {
      staleBranches.push({
        name: branch.name,
        ageInDays: ageInDays,
        lastCommitDate: date
      });
    }
  });
  
  console.log('\n' + '='.repeat(80));
  console.log(`⏰ STALE BRANCHES (older than ${STALE_DAYS} days)`);
  console.log('='.repeat(80));
  console.log();
  console.log(`Found ${staleBranches.length} stale branches\n`);
  
  // Sort by age
  staleBranches.sort((a, b) => b.ageInDays - a.ageInDays);
  
  // Show top 20 oldest
  console.log('Top 20 oldest branches:');
  staleBranches.slice(0, 20).forEach(branch => {
    console.log(`  - ${branch.name} (${branch.ageInDays} days old, last commit: ${branch.lastCommitDate?.toISOString().split('T')[0]})`);
  });
  
  // Save full list
  const reportPath = path.join(process.cwd(), 'stale-branches-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(staleBranches, null, 2));
  console.log(`\n📁 Full list saved to: ${reportPath}`);
}

function showMergedBranches() {
  console.log('🔍 Finding branches already merged into main...\n');
  
  const output = execCommand(`git branch -r --merged ${MAIN_BRANCH}`);
  const mergedBranches = output
    .split('\n')
    .map(line => line.trim().replace('origin/', ''))
    .filter(branch => branch && branch !== MAIN_BRANCH && branch !== 'HEAD');
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ ALREADY MERGED BRANCHES');
  console.log('='.repeat(80));
  console.log();
  console.log(`Found ${mergedBranches.length} branches already merged into ${MAIN_BRANCH}\n`);
  
  // Show first 20
  console.log('First 20 merged branches:');
  mergedBranches.slice(0, 20).forEach(branch => {
    console.log(`  - ${branch}`);
  });
  
  if (mergedBranches.length > 20) {
    console.log(`  ... and ${mergedBranches.length - 20} more`);
  }
  
  // Save full list
  const reportPath = path.join(process.cwd(), 'merged-branches-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(mergedBranches, null, 2));
  console.log(`\n📁 Full list saved to: ${reportPath}`);
}

function showHelp() {
  console.log(`
Branch Management Script for Barbrick Design Repository

Usage: node scripts/branch-management.js [command]

Commands:
  analyze    - Analyze all branches and generate comprehensive report
  stale      - List stale branches (older than ${STALE_DAYS} days)
  merged     - List branches already merged into main
  help       - Show this help message

Examples:
  node scripts/branch-management.js analyze
  node scripts/branch-management.js stale
  node scripts/branch-management.js merged

Notes:
  - Analysis may take several minutes with 715+ branches
  - Reports are saved as JSON files in the repository root
  - All commands are read-only and safe to run
  `);
}

// Main execution
const command = process.argv[2] || 'help';

console.log('🌳 Barbrick Design Branch Management Tool\n');

switch (command) {
  case 'analyze':
    const analysis = analyzeBranches();
    generateReport(analysis);
    break;
  
  case 'stale':
    showStaleBranches();
    break;
  
  case 'merged':
    showMergedBranches();
    break;
  
  case 'help':
  default:
    showHelp();
    break;
}
