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
 * File: crawl-network-links.js
 * Declaration ID: IP-36C58ABD-MLL28ZUP
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
 * NETWORK LINK CRAWLING SCRIPT
 * =============================
 * Crawls repository files to discover and catalog all links and signatures
 * 
 * PURPOSE: Deploy agent to gather all links and signatures across the codebase
 * USAGE: node crawl-network-links.js [--output <file>]
 * 
 * ⚖️ ETHICAL USE ONLY:
 * This tool must only be used for legitimate purposes such as:
 * - Repository maintenance and documentation
 * - Security audits with proper authorization
 * - Link validation and quality assurance
 * - Internal codebase analysis
 * 
 * PROHIBITED USES:
 * - Unauthorized reconnaissance of external systems
 * - Malicious network mapping
 * - Privacy violations
 * - Any form of abuse or harm
 */

const fs = require('fs');
const path = require('path');

// Configuration
const args = process.argv.slice(2);
const outputIndex = args.indexOf('--output');
const outputFile = outputIndex !== -1 && args[outputIndex + 1] 
    ? args[outputIndex + 1] 
    : 'network-crawl-report.json';

const repoPath = __dirname;

// Directories to exclude
const excludeDirs = [
    'node_modules',
    '.git',
    'dist',
    'build',
    '.vscode',
    '.tours'
];

// File patterns to crawl
const crawlPatterns = [
    /\.js$/,
    /\.mjs$/,
    /\.html$/,
    /\.htm$/,
    /\.css$/,
    /\.json$/,
    /\.md$/
];

// Logger
const log = {
    info: (msg) => console.log(`ℹ️  ${msg}`),
    success: (msg) => console.log(`✅ ${msg}`),
    warning: (msg) => console.log(`⚠️  ${msg}`),
    error: (msg) => console.error(`❌ ${msg}`)
};

// Results storage
const results = {
    timestamp: new Date().toISOString(),
    filesScanned: 0,
    linksFound: [],
    signaturesFound: [],
    internalLinks: [],
    externalLinks: [],
    signedFiles: [],
    unsignedFiles: [],
    statistics: {}
};

/**
 * Check if file should be crawled
 */
function shouldCrawlFile(filePath) {
    const relativePath = path.relative(repoPath, filePath);
    const parts = relativePath.split(path.sep);
    
    for (const excludeDir of excludeDirs) {
        if (parts.includes(excludeDir)) {
            return false;
        }
    }
    
    for (const pattern of crawlPatterns) {
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
    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            
            if (entry.isDirectory()) {
                if (!excludeDirs.includes(entry.name)) {
                    findFiles(fullPath, files);
                }
            } else if (entry.isFile() && shouldCrawlFile(fullPath)) {
                files.push(fullPath);
            }
        }
    } catch (error) {
        log.warning(`Cannot read directory ${dir}: ${error.message}`);
    }
    
    return files;
}

/**
 * Extract links from content
 */
function extractLinks(content, fileName) {
    const links = [];
    const seenUrls = new Set();
    
    const patterns = [
        /href=["']([^"']+)["']/gi,
        /src=["']([^"']+)["']/gi,
        /https?:\/\/[^\s<>"']+/gi,
        /import\s+.*from\s+["']([^"']+)["']/gi,
        /require\(["']([^"']+)["']\)/gi,
        /url\(["']?([^"')]+)["']?\)/gi
    ];
    
    for (const pattern of patterns) {
        const matches = content.matchAll(pattern);
        for (const match of matches) {
            const url = (match[1] || match[0]).trim().replace(/[,;]$/, '');
            
            if (isValidUrl(url) && !seenUrls.has(url)) {
                seenUrls.add(url);
                links.push({
                    url: url,
                    sourceFile: path.relative(repoPath, fileName),
                    type: classifyLink(url),
                    foundAt: new Date().toISOString()
                });
            }
        }
    }
    
    return links;
}

/**
 * Extract signatures from content
 */
function extractSignatures(content, fileName) {
    const signatures = [];
    
    const merlynnMatches = content.matchAll(/SIGNED BY MeRLynn - ID: (MERLYNN-[a-f0-9]+) - TIMESTAMP: ([0-9T:.Z-]+) - HASH: ([a-f0-9]+)/g);
    for (const match of merlynnMatches) {
        signatures.push({
            agent: 'MeRLynn',
            signatureId: match[1],
            timestamp: match[2].trim(),
            contentHash: match[3],
            file: path.relative(repoPath, fileName)
        });
    }
    
    const agentrMatches = content.matchAll(/SIGNED BY AGen[tT]R - ID: (AGENTR-[a-f0-9]+) - TIMESTAMP: ([0-9T:.Z-]+) - HASH: ([a-f0-9]+)/g);
    for (const match of agentrMatches) {
        signatures.push({
            agent: 'AGenTR',
            signatureId: match[1],
            timestamp: match[2].trim(),
            contentHash: match[3],
            file: path.relative(repoPath, fileName)
        });
    }
    
    return signatures;
}

/**
 * Check if URL is valid
 */
function isValidUrl(url) {
    if (!url || url.length < 3) return false;
    if (url.startsWith('#')) return false;
    if (url.startsWith('javascript:')) return false;
    if (url.startsWith('data:')) return false;
    if (url.includes('{{') || url.includes('}}')) return false;
    return true;
}

/**
 * Classify link type
 */
function classifyLink(url) {
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return 'external';
    }
    if (url.endsWith('.html') || url.endsWith('.htm')) {
        return 'html';
    }
    if (url.endsWith('.js') || url.endsWith('.mjs')) {
        return 'javascript';
    }
    if (url.endsWith('.css')) {
        return 'stylesheet';
    }
    if (url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
        return 'image';
    }
    if (url.match(/\.(mp4|webm|ogg|mp3|wav)$/i)) {
        return 'media';
    }
    return 'other';
}

/**
 * Check if link is internal
 */
function isInternalLink(url) {
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url.includes('barbrickdesign.github.io') || 
               url.includes('localhost') ||
               url.includes('127.0.0.1');
    }
    return true;
}

/**
 * Crawl a file
 */
function crawlFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        results.filesScanned++;
        
        // Extract links
        const links = extractLinks(content, filePath);
        results.linksFound.push(...links);
        
        // Extract signatures
        const signatures = extractSignatures(content, filePath);
        
        if (signatures.length > 0) {
            results.signaturesFound.push(...signatures);
            results.signedFiles.push(path.relative(repoPath, filePath));
        } else {
            results.unsignedFiles.push(path.relative(repoPath, filePath));
        }
        
        // Categorize links
        for (const link of links) {
            if (isInternalLink(link.url)) {
                results.internalLinks.push(link);
            } else {
                results.externalLinks.push(link);
            }
        }
        
    } catch (error) {
        log.warning(`Cannot read file ${filePath}: ${error.message}`);
    }
}

/**
 * Generate statistics
 */
function generateStatistics() {
    const stats = {
        totalFilesScanned: results.filesScanned,
        totalLinksFound: results.linksFound.length,
        totalSignaturesFound: results.signaturesFound.length,
        internalLinksCount: results.internalLinks.length,
        externalLinksCount: results.externalLinks.length,
        signedFilesCount: results.signedFiles.length,
        unsignedFilesCount: results.unsignedFiles.length,
        signaturePercentage: results.filesScanned > 0
            ? ((results.signedFiles.length / results.filesScanned) * 100).toFixed(2)
            : 0
    };
    
    // Signature breakdown
    const merlynnCount = results.signaturesFound.filter(s => s.agent === 'MeRLynn').length;
    const agentrCount = results.signaturesFound.filter(s => s.agent === 'AGentR').length;
    
    stats.signatureBreakdown = {
        total: results.signaturesFound.length,
        merlynn: merlynnCount,
        agentr: agentrCount
    };
    
    // Link type breakdown
    const linkTypes = {};
    for (const link of results.linksFound) {
        linkTypes[link.type] = (linkTypes[link.type] || 0) + 1;
    }
    stats.linkTypeBreakdown = linkTypes;
    
    // Top external domains
    const domains = {};
    for (const link of results.externalLinks) {
        try {
            const url = new URL(link.url);
            domains[url.hostname] = (domains[url.hostname] || 0) + 1;
        } catch (e) {
            // Invalid URL, skip
        }
    }
    
    stats.topExternalDomains = Object.entries(domains)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([domain, count]) => ({ domain, count }));
    
    results.statistics = stats;
}

/**
 * Main execution
 */
function main() {
    console.log('\n==============================================');
    console.log('🌐 Network Link & Signature Crawler');
    console.log('==============================================\n');
    
    log.info('Starting network crawl...');
    log.info('Discovering files...');
    
    const files = findFiles(repoPath);
    log.info(`Found ${files.length} files to crawl\n`);
    
    // Crawl each file
    let processed = 0;
    for (const file of files) {
        crawlFile(file);
        processed++;
        
        if (processed % 50 === 0) {
            log.info(`Processed ${processed}/${files.length} files...`);
        }
    }
    
    log.success(`Crawled all ${files.length} files\n`);
    
    // Generate statistics
    log.info('Generating statistics...');
    generateStatistics();
    
    // Display summary
    console.log('\n==============================================');
    console.log('Summary:');
    console.log(`  Files scanned: ${results.statistics.totalFilesScanned}`);
    console.log(`  Links found: ${results.statistics.totalLinksFound}`);
    console.log(`    - Internal: ${results.statistics.internalLinksCount}`);
    console.log(`    - External: ${results.statistics.externalLinksCount}`);
    console.log(`  Signatures found: ${results.statistics.totalSignaturesFound}`);
    console.log(`    - MeRLynn: ${results.statistics.signatureBreakdown.merlynn}`);
    console.log(`    - AGentR: ${results.statistics.signatureBreakdown.agentr}`);
    console.log(`  Signed files: ${results.statistics.signedFilesCount} (${results.statistics.signaturePercentage}%)`);
    console.log('==============================================\n');
    
    // Top external domains
    if (results.statistics.topExternalDomains.length > 0) {
        console.log('Top External Domains:');
        results.statistics.topExternalDomains.forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.domain} (${item.count} links)`);
        });
        console.log('');
    }
    
    // Save report
    log.info(`Saving report to ${outputFile}...`);
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2), 'utf8');
    log.success(`Report saved to ${outputFile}`);
    
    console.log('\n==============================================\n');
}

// Run
try {
    main();
} catch (error) {
    log.error(`Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
}
