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
 * File: fix-projects.js
 * Declaration ID: IP-61113D85-MLL28ZUS
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

#!/usr/bin/env node

/**
 * Project Fixer
 * Adds universal CSS/JS and navigation to all HTML project files
 * 
 * Copyright (c) 2024-2025 Ryan Barbrick (Barbrick Design)
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Starting Project Fixer...\n');

// Configuration
const UNIVERSAL_CSS = '/css/universal-styles.css';
const UNIVERSAL_JS = '/js/universal-utilities.js';
const EXCLUDED_FILES = [
    'index.html',
    'index-optimized.html',
    'index.html.old',
    'index.html.backup',
    'test-',
    '-test.',
    '.backup',
    '_backup',
    '.old',
    '_old',
    'Copy (',
    ' - Copy'
];

let stats = {
    processed: 0,
    updated: 0,
    skipped: 0,
    errors: 0
};

/**
 * Check if file should be processed
 */
function shouldProcess(filename) {
    for (const pattern of EXCLUDED_FILES) {
        if (filename.includes(pattern)) {
            return false;
        }
    }
    return true;
}

/**
 * Check if HTML already has universal assets
 */
function hasUniversalAssets(content) {
    return content.includes('universal-styles.css') || 
           content.includes('universal-utilities.js');
}

/**
 * Inject CSS link into HTML head
 */
function injectCSS(content) {
    // Try to inject before </head>
    if (content.includes('</head>')) {
        const cssLink = `    <link rel="stylesheet" href="${UNIVERSAL_CSS}">\n`;
        return content.replace('</head>', cssLink + '</head>');
    }
    
    // Try to inject after <head>
    if (content.includes('<head>')) {
        const cssLink = `\n    <link rel="stylesheet" href="${UNIVERSAL_CSS}">`;
        return content.replace('<head>', '<head>' + cssLink);
    }
    
    return content;
}

/**
 * Inject JS script before </body>
 */
function injectJS(content) {
    // Try to inject before </body>
    if (content.includes('</body>')) {
        const jsScript = `    <script src="${UNIVERSAL_JS}"></script>\n`;
        return content.replace('</body>', jsScript + '</body>');
    }
    
    // Try to inject before </html>
    if (content.includes('</html>')) {
        const jsScript = `    <script src="${UNIVERSAL_JS}"></script>\n`;
        return content.replace('</html>', jsScript + '</html>');
    }
    
    return content;
}

/**
 * Add navigation header if missing
 */
function addNavigation(content) {
    // Check if already has navigation
    if (content.includes('back-button') || content.includes('Back to Hub')) {
        return content;
    }
    
    // Create navigation HTML
    const nav = `
    <!-- Universal Navigation - Added by Project Fixer -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof BarbrickUniversal !== 'undefined') {
                // Only add navigation if not already present
                if (!document.querySelector('.universal-header')) {
                    BarbrickUniversal.createBackButton();
                }
                
                // Add footer if not present
                if (!document.querySelector('.universal-footer')) {
                    BarbrickUniversal.createFooter();
                }
            }
        });
    </script>
`;
    
    // Try to inject before </body>
    if (content.includes('</body>')) {
        return content.replace('</body>', nav + '</body>');
    }
    
    return content;
}

/**
 * Process a single HTML file
 */
function processFile(filepath) {
    try {
        stats.processed++;
        
        const filename = path.basename(filepath);
        
        // Skip if shouldn't process
        if (!shouldProcess(filename)) {
            stats.skipped++;
            return;
        }
        
        // Read file
        let content = fs.readFileSync(filepath, 'utf8');
        
        // Skip if already has universal assets
        if (hasUniversalAssets(content)) {
            console.log(`  ⏭️  Skipped (already updated): ${filename}`);
            stats.skipped++;
            return;
        }
        
        // Make changes
        let modified = false;
        let newContent = content;
        
        // Inject CSS
        const withCSS = injectCSS(newContent);
        if (withCSS !== newContent) {
            newContent = withCSS;
            modified = true;
        }
        
        // Inject JS
        const withJS = injectJS(newContent);
        if (withJS !== newContent) {
            newContent = withJS;
            modified = true;
        }
        
        // Add navigation
        const withNav = addNavigation(newContent);
        if (withNav !== newContent) {
            newContent = withNav;
            modified = true;
        }
        
        // Write back if modified
        if (modified) {
            fs.writeFileSync(filepath, newContent);
            console.log(`  ✅ Updated: ${filename}`);
            stats.updated++;
        } else {
            console.log(`  ⚠️  No changes needed: ${filename}`);
            stats.skipped++;
        }
        
    } catch (error) {
        console.error(`  ❌ Error processing ${filepath}:`, error.message);
        stats.errors++;
    }
}

/**
 * Process projects from projects.json
 */
function processProjects() {
    const projectsFile = path.join(process.cwd(), 'projects.json');
    
    if (!fs.existsSync(projectsFile)) {
        console.error('❌ projects.json not found!');
        process.exit(1);
    }
    
    const data = JSON.parse(fs.readFileSync(projectsFile, 'utf8'));
    const projects = data.projects || [];
    
    console.log(`📁 Found ${projects.length} projects in projects.json\n`);
    console.log('🔄 Processing files...\n');
    
    for (const project of projects) {
        const filepath = path.join(process.cwd(), project.path);
        
        if (fs.existsSync(filepath)) {
            processFile(filepath);
        } else {
            console.log(`  ⚠️  File not found: ${project.path}`);
        }
    }
}

/**
 * Main execution
 */
function main() {
    const startTime = Date.now();
    
    processProjects();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Processing Complete!\n');
    console.log(`   Processed: ${stats.processed}`);
    console.log(`   Updated:   ${stats.updated} files`);
    console.log(`   Skipped:   ${stats.skipped} files`);
    console.log(`   Errors:    ${stats.errors}`);
    console.log(`   Duration:  ${duration}s`);
    console.log('='.repeat(60) + '\n');
    
    if (stats.updated > 0) {
        console.log('✅ Files have been updated with universal assets!');
        console.log('   - CSS: /css/universal-styles.css');
        console.log('   - JS: /js/universal-utilities.js');
        console.log('   - Navigation: Auto-added back button and footer\n');
    }
    
    if (stats.errors > 0) {
        console.log('⚠️  Some errors occurred. Check the log above.\n');
        process.exit(1);
    }
}

// Run the fixer
main();
