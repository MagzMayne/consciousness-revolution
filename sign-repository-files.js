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
 * File: sign-repository-files.js
 * Declaration ID: IP-33BCDF33-MLL28ZVW
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
 * REPOSITORY FILE SIGNING SCRIPT
 * ===============================
 * Signs all JavaScript files in the repository with MeRLynn & AGentR signatures
 * 
 * PURPOSE: Bulk sign files to track usage across networks
 * USAGE: node sign-repository-files.js [--dry-run] [--force]
 */

const fs = require('fs');
const path = require('path');

// Import signature system (adapted for Node.js)
class SignatureSystem {
    constructor() {
        this.version = '1.0.0';
    }

    generateHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).padStart(8, '0');
    }

    generateMeRLynnSignature(scriptContent = '', options = {}) {
        const timestamp = options.timestamp || new Date().toISOString();
        const contentHash = this.generateHash(scriptContent);
        const uniqueId = this.generateHash(timestamp + contentHash);
        
        return {
            agent: 'MeRLynn',
            version: this.version,
            timestamp: timestamp,
            contentHash: contentHash,
            signatureId: `MERLYNN-${uniqueId}`,
            signature: `/** SIGNED BY MeRLynn - ID: MERLYNN-${uniqueId} - TIMESTAMP: ${timestamp} - HASH: ${contentHash} */`
        };
    }

    generateAGentRSignature(scriptContent = '', options = {}) {
        const timestamp = options.timestamp || new Date().toISOString();
        const contentHash = this.generateHash(scriptContent);
        const uniqueId = this.generateHash(timestamp + contentHash + 'agentr');
        
        return {
            agent: 'AGenTR',
            version: this.version,
            timestamp: timestamp,
            contentHash: contentHash,
            signatureId: `AGENTR-${uniqueId}`,
            signature: `/** SIGNED BY AGenTR - ID: AGENTR-${uniqueId} - TIMESTAMP: ${timestamp} - HASH: ${contentHash} */`
        };
    }

    signScript(scriptContent = '', options = {}) {
        const timestamp = options.timestamp || new Date().toISOString();
        
        const merlynnSig = this.generateMeRLynnSignature(scriptContent, { timestamp });
        const agentrSig = this.generateAGentRSignature(scriptContent, { timestamp });
        
        return {
            merlynn: merlynnSig,
            agentr: agentrSig,
            combined: `${merlynnSig.signature}\n${agentrSig.signature}`
        };
    }

    addSignaturesToScript(scriptContent, options = {}) {
        const { position = 'top' } = options;
        const signatures = this.signScript(scriptContent, options);
        
        if (position === 'top') {
            return `${signatures.combined}\n\n${scriptContent}`;
        } else {
            return `${scriptContent}\n\n${signatures.combined}`;
        }
    }

    isAlreadySigned(content) {
        return content.includes('SIGNED BY MeRLynn') || content.includes('SIGNED BY AGenTR') || content.includes('SIGNED BY AGentR');
    }
}

// Configuration
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isForce = args.includes('--force');

const repoPath = __dirname;
const signatureSystem = new SignatureSystem();

// Directories to exclude
const excludeDirs = [
    'node_modules',
    '.git',
    'dist',
    'build',
    '.vscode',
    '.tours'
];

// File patterns to sign
const signPatterns = [
    /\.js$/,
    /\.mjs$/
];

// Logger
const log = {
    info: (msg) => console.log(`ℹ️  ${msg}`),
    success: (msg) => console.log(`✅ ${msg}`),
    warning: (msg) => console.log(`⚠️  ${msg}`),
    error: (msg) => console.error(`❌ ${msg}`),
    action: (msg) => console.log(`🔧 ${msg}`)
};

/**
 * Check if file should be signed
 */
function shouldSignFile(filePath) {
    // Check if in excluded directory
    const relativePath = path.relative(repoPath, filePath);
    const parts = relativePath.split(path.sep);
    
    for (const excludeDir of excludeDirs) {
        if (parts.includes(excludeDir)) {
            return false;
        }
    }
    
    // Check if matches sign patterns
    for (const pattern of signPatterns) {
        if (pattern.test(filePath)) {
            return true;
        }
    }
    
    return false;
}

/**
 * Recursively find all files
 */
function findFiles(dir, files = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
            // Skip excluded directories
            if (!excludeDirs.includes(entry.name)) {
                findFiles(fullPath, files);
            }
        } else if (entry.isFile() && shouldSignFile(fullPath)) {
            files.push(fullPath);
        }
    }
    
    return files;
}

/**
 * Sign a file
 */
function signFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check if already signed
        if (signatureSystem.isAlreadySigned(content) && !isForce) {
            log.warning(`Skipped (already signed): ${path.relative(repoPath, filePath)}`);
            return { success: false, skipped: true };
        }
        
        // Sign the content
        const signedContent = signatureSystem.addSignaturesToScript(content);
        
        // Write back (if not dry run)
        if (!isDryRun) {
            fs.writeFileSync(filePath, signedContent, 'utf8');
            log.success(`Signed: ${path.relative(repoPath, filePath)}`);
        } else {
            log.action(`Would sign: ${path.relative(repoPath, filePath)}`);
        }
        
        return { success: true, file: filePath };
        
    } catch (error) {
        log.error(`Failed to sign ${filePath}: ${error.message}`);
        return { success: false, error: error.message };
    }
}

/**
 * Main execution
 */
function main() {
    console.log('\n==============================================');
    console.log('🔐 MeRLynn & AGentR Repository File Signing');
    console.log('==============================================\n');
    
    if (isDryRun) {
        log.info('Running in DRY RUN mode (no files will be modified)');
    }
    
    if (isForce) {
        log.info('FORCE mode enabled (will re-sign already signed files)');
    }
    
    log.info('Discovering files to sign...');
    const files = findFiles(repoPath);
    log.info(`Found ${files.length} files to process\n`);
    
    let signed = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const file of files) {
        const result = signFile(file);
        
        if (result.success) {
            signed++;
        } else if (result.skipped) {
            skipped++;
        } else {
            errors++;
        }
    }
    
    console.log('\n==============================================');
    console.log('Summary:');
    console.log(`  Total files: ${files.length}`);
    console.log(`  Signed: ${signed}`);
    console.log(`  Skipped: ${skipped}`);
    console.log(`  Errors: ${errors}`);
    console.log('==============================================\n');
    
    if (isDryRun) {
        log.info('This was a dry run. Run without --dry-run to actually sign files.');
    } else {
        log.success('Signing operation completed!');
    }
}

// Run
try {
    main();
} catch (error) {
    log.error(`Fatal error: ${error.message}`);
    process.exit(1);
}
