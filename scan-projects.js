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
 * File: scan-projects.js
 * Declaration ID: IP-47F91BED-MLL28ZVU
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * HTML Project Scanner
 * Scans all HTML files in the repository and builds a comprehensive projects.json
 * 
 * Copyright (c) 2024-2025 Ryan Barbrick (Barbrick Design)
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Starting HTML Project Scanner...\n');

// Directories to exclude
const EXCLUDED_DIRS = [
    'node_modules',
    '.git',
    'backend',
    'dist',
    'build',
    '.github',
    '.circleci',
    '.vscode',
    '.tours',
    'logs',
    'ember-terminal',
    'Mandemos-v2-main',
    'mandem.os',
    'city-3d',
    'crypto',
    'rdata',
    'facetdiagrams-integration',
    'projectPool',
    'language-samples',
    'meshMintVaultLauncher',
    'GemBotMemory2025',
    'relicLogger',
    'languages',
    'approvals',
    'screenshots',
    'OSKeyMap',
    'leah1',
    'CSS'
];

// Files to exclude (patterns)
const EXCLUDED_FILES = [
    'node_modules',
    '.test-',
    'test-',
    '-test.',
    '.backup',
    '-backup',
    '_backup',
    '.old',
    '-old',
    '_old',
    'Copy (',
    ' - Copy',
    '_enhanced',
    '_original',
    '_complete',
    '_integrated',
    '_optimized'
];

/**
 * Extract title from HTML content
 */
function extractTitle(htmlContent, filename) {
    // Try to find <title> tag
    const titleMatch = htmlContent.match(/<title[^>]*>(.*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
        return titleMatch[1].trim();
    }
    
    // Try to find first <h1> tag
    const h1Match = htmlContent.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (h1Match && h1Match[1]) {
        return h1Match[1].replace(/<[^>]*>/g, '').trim();
    }
    
    // Fallback to filename
    return filename
        .replace('.html', '')
        .replace(/([A-Z])/g, ' $1')
        .replace(/[-_]/g, ' ')
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Extract description from HTML content
 */
function extractDescription(htmlContent) {
    // Try meta description
    const metaMatch = htmlContent.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
    if (metaMatch && metaMatch[1]) {
        return metaMatch[1].trim();
    }
    
    // Try first paragraph
    const pMatch = htmlContent.match(/<p[^>]*>(.*?)<\/p>/i);
    if (pMatch && pMatch[1]) {
        const desc = pMatch[1].replace(/<[^>]*>/g, '').trim();
        if (desc.length > 10 && desc.length < 200) {
            return desc;
        }
    }
    
    return null;
}

/**
 * Categorize project based on filename and content
 */
function categorizeProject(filename, title, content) {
    const lowerFilename = filename.toLowerCase();
    const lowerTitle = title.toLowerCase();
    const lowerContent = content.toLowerCase().slice(0, 5000); // Check first 5KB
    
    // Priority order - check specific categories first
    const categories = [
        {
            name: 'Gaming',
            keywords: ['poker', 'casino', 'craps', 'dragon.*poker', 'card.*game', 'slot', 'gambl'],
            weight: 10
        },
        {
            name: 'Blockchain & Crypto',
            keywords: ['crypto', 'blockchain', 'wallet', 'ethereum', 'bitcoin', 'solana', 'tron', '\\bnft\\b', 'defi', '\\bsol\\b.*recover', 'token.*trad'],
            weight: 9
        },
        {
            name: 'Trading & Finance',
            keywords: ['trader', 'trading', 'futures', 'topstep', 'signal.*tool', 'market.*trad', 'stock.*trad', 'forex'],
            weight: 8
        },
        {
            name: 'E-commerce & Sales',
            keywords: ['\\bebay\\b', 'auction', 'swarm', 'marketplace', 'store.*front', 'ecommerce'],
            weight: 7
        },
        {
            name: '3D Graphics',
            keywords: ['\\b3d\\b', 'babylon', 'three\\.js', 'webgl', 'coverflow', '3d.*card', 'holograph'],
            weight: 6
        },
        {
            name: 'Government & Grants',
            keywords: ['government', 'grant.*portal', 'contract.*track', 'federal', 'sam\\.gov'],
            weight: 6
        },
        {
            name: 'Dashboards',
            keywords: ['dashboard', 'admin.*dash', 'management.*dash', 'monitor.*dash', 'control.*panel'],
            weight: 5
        },
        {
            name: 'AI & Machine Learning',
            keywords: ['\\bai\\b.*chat', 'machine.*learn', 'neural', 'tensorflow', 'merlin.*ai', 'agent.*system', 'intelligence'],
            weight: 5
        },
        {
            name: 'Social & Communication',
            keywords: ['discord', 'telegram', 'chat.*app', 'messag.*app', 'safeaigram'],
            weight: 4
        },
        {
            name: 'Education & Learning',
            keywords: ['academy', 'school', 'course', 'tutorial', 'education.*platform', 'learning.*platform'],
            weight: 4
        },
        {
            name: 'Real Estate',
            keywords: ['landlord', 'property.*manag', 'real.*estate', 'rent.*track'],
            weight: 4
        },
        {
            name: 'Art & Design',
            keywords: ['ccart', 'art.*card', 'gallery', 'design.*tool', 'creative'],
            weight: 3
        },
        {
            name: 'Security & Safety',
            keywords: ['anti.*nuke', 'vehicle.*safety', 'security.*system', 'gunshot.*detect', 'intrusion'],
            weight: 3
        },
        {
            name: 'Data & Analytics',
            keywords: ['analyt', 'report.*gen', 'data.*visual', 'metric', 'statistic'],
            weight: 2
        },
        {
            name: 'Tools & Utilities',
            keywords: ['scanner', 'detector', 'calculator', 'converter', 'validator', 'checker', 'analyzer'],
            weight: 1
        }
    ];
    
    let bestCategory = 'Miscellaneous';
    let bestScore = 0;
    
    for (const category of categories) {
        for (const keyword of category.keywords) {
            const regex = new RegExp(keyword, 'i');
            
            // Calculate score based on where the match is found
            let score = 0;
            if (regex.test(lowerFilename)) score += category.weight * 3; // Filename is most important
            if (regex.test(lowerTitle)) score += category.weight * 2;    // Title is second
            if (regex.test(lowerContent)) score += category.weight;       // Content is third
            
            if (score > bestScore) {
                bestScore = score;
                bestCategory = category.name;
            }
        }
    }
    
    return bestCategory;
}

/**
 * Extract tags from content
 */
function extractTags(filename, title, content, category) {
    const tags = new Set();
    
    // Add category as tag
    tags.add(category.toLowerCase().replace(/\s+/g, '-'));
    
    // Common tech tags
    const techKeywords = {
        'html5': /html5|<!DOCTYPE html>/i,
        'javascript': /javascript|<script/i,
        'css3': /css3|stylesheet/i,
        'web3': /web3|blockchain/i,
        'react': /react/i,
        'vue': /vue/i,
        'three.js': /three\.js|THREE\./i,
        'babylon.js': /babylon|BABYLON\./i,
        'p5.js': /p5\.js|p5\./i,
        'tensorflow': /tensorflow|@tensorflow/i,
        'api': /api|fetch\(|axios/i,
        'responsive': /responsive|@media|viewport/i,
        'interactive': /interactive|onclick|addEventListener/i,
        'real-time': /real-time|websocket|socket\.io/i,
        'mobile': /mobile|touch|gesture/i
    };
    
    const searchText = (filename + ' ' + title + ' ' + content.slice(0, 10000)).toLowerCase();
    
    for (const [tag, regex] of Object.entries(techKeywords)) {
        if (regex.test(searchText)) {
            tags.add(tag);
        }
    }
    
    return Array.from(tags).slice(0, 8); // Max 8 tags
}

/**
 * Check if file should be excluded
 */
function shouldExclude(filepath) {
    // Check if in excluded directory
    for (const dir of EXCLUDED_DIRS) {
        if (filepath.includes(`${path.sep}${dir}${path.sep}`) || filepath.startsWith(dir + path.sep)) {
            return true;
        }
    }
    
    // Check if filename matches excluded pattern
    const basename = path.basename(filepath);
    for (const pattern of EXCLUDED_FILES) {
        if (basename.includes(pattern)) {
            return true;
        }
    }
    
    return false;
}

/**
 * Recursively scan directory for HTML files
 */
function scanDirectory(dir, baseDir = dir) {
    const projects = [];
    
    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = path.relative(baseDir, fullPath);
            
            if (shouldExclude(relativePath)) {
                continue;
            }
            
            if (entry.isDirectory()) {
                // Recursively scan subdirectories
                projects.push(...scanDirectory(fullPath, baseDir));
            } else if (entry.isFile() && entry.name.endsWith('.html')) {
                try {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    const filename = entry.name;
                    const title = extractTitle(content, filename);
                    const description = extractDescription(content);
                    const category = categorizeProject(filename, title, content);
                    const tags = extractTags(filename, title, content, category);
                    
                    projects.push({
                        filename: filename,
                        path: relativePath.replace(/\\/g, '/'),
                        title: title,
                        description: description || `${title} - Interactive web application`,
                        category: category,
                        tags: tags,
                        url: '/' + relativePath.replace(/\\/g, '/'),
                        active: true,
                        lastModified: fs.statSync(fullPath).mtime.toISOString()
                    });
                } catch (err) {
                    console.error(`  ❌ Error processing ${entry.name}:`, err.message);
                }
            }
        }
    } catch (err) {
        console.error(`  ❌ Error scanning directory ${dir}:`, err.message);
    }
    
    return projects;
}

/**
 * Load existing projects.json to preserve dates when re-scanning
 */
function loadExistingProjects(rootDir) {
    const outputPath = path.join(rootDir, 'projects.json');
    try {
        if (fs.existsSync(outputPath)) {
            const content = fs.readFileSync(outputPath, 'utf8');
            const data = JSON.parse(content);
            // Create a map of existing projects by filename for quick lookup
            const existingMap = new Map();
            if (data.projects && Array.isArray(data.projects)) {
                data.projects.forEach(proj => {
                    if (proj.filename) {
                        existingMap.set(proj.filename, proj);
                    }
                });
            }
            return existingMap;
        }
    } catch (err) {
        console.log('  ℹ️  No existing projects.json found or error reading it, starting fresh');
    }
    return new Map();
}

/**
 * Merge new project data with existing data to preserve dates
 */
function mergeProjectData(newProj, existingProj) {
    // If the file modification time hasn't changed, preserve the original lastModified
    // This prevents all projects from getting the same date on re-scan
    if (existingProj && existingProj.lastModified) {
        // Keep existing lastModified unless file actually changed
        return existingProj.lastModified;
    }
    return newProj.lastModified;
}

/**
 * Main execution
 */
function main() {
    const rootDir = process.cwd();
    
    console.log(`📁 Scanning directory: ${rootDir}\n`);
    
    // Load existing projects to preserve dates
    const existingProjects = loadExistingProjects(rootDir);
    console.log(`  ℹ️  Found ${existingProjects.size} existing projects in projects.json\n`);
    
    const projects = scanDirectory(rootDir);
    
    // Merge with existing data to preserve dates
    for (const project of projects) {
        const existing = existingProjects.get(project.filename);
        if (existing) {
            project.lastModified = mergeProjectData(project, existing);
        }
    }
    
    // Sort projects by lastModified date (NEWEST FIRST for feed)
    // Then by category and title as secondary sort
    projects.sort((a, b) => {
        // Primary sort: lastModified (newest first)
        const dateA = new Date(a.lastModified);
        const dateB = new Date(b.lastModified);
        const dateDiff = dateB - dateA;
        if (dateDiff !== 0) return dateDiff;
        
        // Secondary sort: category
        if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
        }
        
        // Tertiary sort: title
        return a.title.localeCompare(b.title);
    });
    
    // Generate category summary
    const categoryCount = {};
    for (const project of projects) {
        categoryCount[project.category] = (categoryCount[project.category] || 0) + 1;
    }
    
    // Build output
    const output = {
        meta: {
            last_updated: new Date().toISOString(),
            total_projects: projects.length,
            scanner_version: '1.1.0',
            categories: Object.keys(categoryCount).length,
            note: 'Projects sorted by lastModified date (newest first) for live feed'
        },
        category_summary: categoryCount,
        projects: projects
    };
    
    // Write to file
    const outputPath = path.join(rootDir, 'projects.json');
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    
    console.log('✅ Scan complete!\n');
    console.log(`📊 Statistics:`);
    console.log(`   Total projects: ${projects.length}`);
    console.log(`   Categories: ${Object.keys(categoryCount).length}`);
    console.log(`   Preserved dates: ${existingProjects.size} projects kept original timestamps`);
    console.log(`\n📁 Category Breakdown:`);
    
    for (const [category, count] of Object.entries(categoryCount).sort((a, b) => b[1] - a[1])) {
        console.log(`   ${category.padEnd(30)} ${count}`);
    }
    
    console.log(`\n📝 Recent Projects (Top 5):`);
    for (let i = 0; i < Math.min(5, projects.length); i++) {
        const proj = projects[i];
        const date = new Date(proj.lastModified).toLocaleDateString();
        console.log(`   ${(i + 1)}. ${proj.title.substring(0, 50)} (${date})`);
    }
    
    console.log(`\n💾 Output saved to: ${outputPath}`);
    console.log(`\n🎉 Ready to use! Projects sorted by date (newest first) for live feed.`);
}

// Run the scanner
main();
