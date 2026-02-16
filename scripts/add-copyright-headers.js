#!/usr/bin/env node

/**
 * Copyright Header Injection Script
 * 
 * Adds copyright headers to all JavaScript, HTML, and CSS files
 * that don't already have them.
 * 
 * © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 */

const fs = require('fs');
const path = require('path');

// Copyright headers for different file types
const COPYRIGHT_HEADERS = {
    js: `/**
 * Copyright (c) 2024-2025 Ryan Barbrick (Barbrick Design)
 * All Rights Reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This code is the exclusive property of Ryan Barbrick (Barbrick Design).
 * Unauthorized copying, modification, distribution, or use of this code,
 * via any medium, is strictly prohibited without express written permission.
 * 
 * For licensing inquiries: BarbrickDesign@gmail.com
 * AI Assistant: Merlin AI
 * 
 * @license Proprietary
 * @copyright 2024-2025 Ryan Barbrick. All Rights Reserved.
 */

`,
    html: `<!--
  Copyright (c) 2024-2025 Ryan Barbrick (Barbrick Design)
  All Rights Reserved.
  
  PROPRIETARY AND CONFIDENTIAL
  
  This code is the exclusive property of Ryan Barbrick (Barbrick Design).
  Unauthorized copying, modification, distribution, or use of this code,
  via any medium, is strictly prohibited without express written permission.
  
  For licensing inquiries: BarbrickDesign@gmail.com
  AI Assistant: Merlin AI
-->
`,
    css: `/**
 * Copyright (c) 2024-2025 Ryan Barbrick (Barbrick Design)
 * All Rights Reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This code is the exclusive property of Ryan Barbrick (Barbrick Design).
 * Unauthorized copying, modification, distribution, or use of this code,
 * via any medium, is strictly prohibited without express written permission.
 * 
 * For licensing inquiries: BarbrickDesign@gmail.com
 * AI Assistant: Merlin AI
 */

`
};

// Check if file already has copyright notice
function hasCopyrightNotice(content) {
    const copyrightPatterns = [
        /Copyright.*Ryan Barbrick/i,
        /Barbrick Design/i,
        /All Rights Reserved/i,
        /PROPRIETARY AND CONFIDENTIAL/i,
        /©.*Ryan Barbrick/i
    ];
    
    return copyrightPatterns.some(pattern => pattern.test(content));
}

// Check if file is third-party
function isThirdPartyFile(content, filePath) {
    const thirdPartyIndicators = [
        /Copyright.*(?!Ryan Barbrick)/i,
        /MIT License/i,
        /Apache License/i,
        /BSD License/i,
        /GNU General Public License/i,
    ];
    
    // Check file path for common third-party locations
    const thirdPartyPaths = [
        'node_modules/',
        '/vendor/',
        '/third-party/',
        '/lib/',
        '/libs/',
        '/external/',
        'three.min.js',
        'babylon.min.js',
        'bootstrap',
        'jquery',
        'OrbitControls.js',
        'STLLoader.js'
    ];
    
    if (thirdPartyPaths.some(p => filePath.includes(p))) {
        return true;
    }
    
    // Check first 50 lines for third-party indicators
    const firstLines = content.split('\n').slice(0, 50).join('\n');
    return thirdPartyIndicators.some(pattern => pattern.test(firstLines));
}

// Add copyright header to file
function addCopyrightHeader(filePath, fileType) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Skip if already has copyright
        if (hasCopyrightNotice(content)) {
            return { skipped: true, reason: 'has-copyright' };
        }
        
        // Skip if third-party file
        if (isThirdPartyFile(content, filePath)) {
            return { skipped: true, reason: 'third-party' };
        }
        
        // Add appropriate header based on file type
        const header = COPYRIGHT_HEADERS[fileType];
        const newContent = header + content;
        
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Added: ${filePath}`);
        return { success: true };
        
    } catch (error) {
        console.error(`❌ Error: ${filePath}`);
        return { error: true, message: error.message };
    }
}

console.log('🔒 Adding copyright headers...\n');
console.log('This may take a few minutes for 1000+ files...\n');

// Get files passed as arguments or process all
const args = process.argv.slice(2);
if (args.length > 0) {
    // Process specific files
    args.forEach(file => {
        let fileType = null;
        if (file.endsWith('.js')) fileType = 'js';
        else if (file.endsWith('.html')) fileType = 'html';
        else if (file.endsWith('.css')) fileType = 'css';
        
        if (fileType) {
            addCopyrightHeader(file, fileType);
        }
    });
} else {
    console.log('Usage: node scripts/add-copyright-headers.js [file1] [file2] ...');
    console.log('Or use the batch script to process all files');
}

console.log('\n✅ Done!');
