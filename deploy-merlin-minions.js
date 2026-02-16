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
 * File: deploy-merlin-minions.js
 * Declaration ID: IP-DD0B836-MLL28ZUQ
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
 * Merlin's Minions - Auto-Deploy Script
 * Automatically adds value tracking system to all HTML files
 * Usage: node deploy-merlin-minions.js
 */

const fs = require('fs');
const path = require('path');

const SCRIPT_TAG = `
<!-- Merlin's Minions Value Tracker -->
<script src="js/merlin-value-tracker.js"></script>
<script src="js/merlin-enhancement-tracker.js"></script>
`;

const DEPLOYMENT_LOG = {
    timestamp: new Date().toISOString(),
    filesProcessed: [],
    filesSkipped: [],
    errors: []
};

/**
 * Find all HTML files in directory
 */
function findHTMLFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            // Skip node_modules, .git, etc.
            if (!file.startsWith('.') && file !== 'node_modules') {
                findHTMLFiles(filePath, fileList);
            }
        } else if (file.endsWith('.html')) {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

/**
 * Check if file already has Merlin's Minions
 */
function hasTracker(content) {
    return content.includes('merlin-value-tracker.js') || 
           content.includes("Merlin's Minions");
}

/**
 * Add tracker to HTML file
 */
function addTracker(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Check if already has tracker
        if (hasTracker(content)) {
            console.log(`⏭️  Skipped (already has tracker): ${filePath}`);
            DEPLOYMENT_LOG.filesSkipped.push(filePath);
            return false;
        }
        
        // Find </head> tag
        const headCloseIndex = content.indexOf('</head>');
        
        if (headCloseIndex === -1) {
            console.log(`⚠️  Skipped (no </head> tag): ${filePath}`);
            DEPLOYMENT_LOG.filesSkipped.push(filePath);
            return false;
        }
        
        // Insert script tags before </head>
        const newContent = 
            content.slice(0, headCloseIndex) + 
            SCRIPT_TAG + 
            '\n' +
            content.slice(headCloseIndex);
        
        // Write updated content
        fs.writeFileSync(filePath, newContent, 'utf8');
        
        console.log(`✅ Added tracker to: ${filePath}`);
        DEPLOYMENT_LOG.filesProcessed.push(filePath);
        return true;
        
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        DEPLOYMENT_LOG.errors.push({
            file: filePath,
            error: error.message
        });
        return false;
    }
}

/**
 * Create backup of file
 */
function createBackup(filePath) {
    const backupPath = filePath + '.bak';
    try {
        if (fs.existsSync(filePath)) {
            fs.copyFileSync(filePath, backupPath);
        }
    } catch (error) {
        console.warn(`⚠️  Could not create backup for ${filePath}`);
    }
}

/**
 * Main deployment function
 */
function deploy() {
    console.log('🧙 Merlin\'s Minions Auto-Deploy Script');
    console.log('=====================================\n');
    
    const rootDir = process.cwd();
    console.log(`📁 Scanning directory: ${rootDir}\n`);
    
    // Find all HTML files
    const htmlFiles = findHTMLFiles(rootDir);
    console.log(`📄 Found ${htmlFiles.length} HTML files\n`);
    
    if (htmlFiles.length === 0) {
        console.log('No HTML files found to process.');
        return;
    }
    
    // Ask for confirmation (if in interactive mode)
    if (process.stdin.isTTY) {
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        readline.question('Proceed with deployment? (y/n): ', (answer) => {
            if (answer.toLowerCase() === 'y') {
                processFiles(htmlFiles);
            } else {
                console.log('Deployment cancelled.');
            }
            readline.close();
        });
    } else {
        processFiles(htmlFiles);
    }
}

/**
 * Process all HTML files
 */
function processFiles(htmlFiles) {
    console.log('\n🚀 Starting deployment...\n');
    
    let processed = 0;
    
    htmlFiles.forEach(filePath => {
        // Skip the demo file itself
        if (filePath.includes('merlin-value-demo.html')) {
            console.log(`⏭️  Skipped (demo file): ${filePath}`);
            DEPLOYMENT_LOG.filesSkipped.push(filePath);
            return;
        }
        
        if (addTracker(filePath)) {
            processed++;
        }
    });
    
    // Summary
    console.log('\n=====================================');
    console.log('📊 Deployment Summary');
    console.log('=====================================');
    console.log(`✅ Files processed: ${DEPLOYMENT_LOG.filesProcessed.length}`);
    console.log(`⏭️  Files skipped: ${DEPLOYMENT_LOG.filesSkipped.length}`);
    console.log(`❌ Errors: ${DEPLOYMENT_LOG.errors.length}`);
    
    // Save deployment log
    const logPath = path.join(process.cwd(), 'merlin-deployment-log.json');
    fs.writeFileSync(logPath, JSON.stringify(DEPLOYMENT_LOG, null, 2));
    console.log(`\n📝 Deployment log saved to: ${logPath}`);
    
    console.log('\n🎉 Deployment complete!');
    console.log('🧙 Merlin\'s Minions are now tracking value across all pages.');
}

/**
 * Rollback function to remove tracker
 */
function rollback() {
    console.log('🔄 Rollback mode - removing Merlin\'s Minions tracker\n');
    
    const rootDir = process.cwd();
    const htmlFiles = findHTMLFiles(rootDir);
    
    htmlFiles.forEach(filePath => {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            
            if (hasTracker(content)) {
                // Remove the script tags
                content = content.replace(/<!-- Merlin's Minions Value Tracker -->[\s\S]*?<script src="js\/merlin-enhancement-tracker\.js"><\/script>/g, '');
                
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`✅ Removed tracker from: ${filePath}`);
            }
        } catch (error) {
            console.error(`❌ Error processing ${filePath}:`, error.message);
        }
    });
    
    console.log('\n🔄 Rollback complete!');
}

// CLI argument parsing
const args = process.argv.slice(2);

if (args.includes('--rollback')) {
    rollback();
} else if (args.includes('--help')) {
    console.log(`
🧙 Merlin's Minions Auto-Deploy Script

Usage:
  node deploy-merlin-minions.js           Deploy to all HTML files
  node deploy-merlin-minions.js --rollback Remove from all HTML files
  node deploy-merlin-minions.js --help     Show this help message

Description:
  Automatically adds value tracking system to all HTML files in the repository.
  The system will calculate and display the development value of each page.

Contact: barbrickdesign@gmail.com
    `);
} else {
    deploy();
}
