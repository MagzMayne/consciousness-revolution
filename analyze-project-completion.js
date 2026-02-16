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
 * File: analyze-project-completion.js
 * Declaration ID: IP-1A0A40DA-MLL28ZUH
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

#!/usr/bin/env node

/**
 * Project Completion and Functionality Analyzer
 * 
 * This script analyzes each project file to determine:
 * 1. Completion percentage (0-100%)
 * 2. Functionality status (working/partial/broken/untested)
 * 
 * Analysis is based on:
 * - File size and content
 * - Presence of key HTML/JS elements
 * - Error handling
 * - API integrations
 * - UI completeness
 */

const fs = require('fs');
const path = require('path');

// Read projects.json
const projectsPath = path.join(__dirname, 'projects.json');
const projectsData = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));

/**
 * Analyze a single project file
 */
function analyzeProject(projectPath) {
    try {
        if (!fs.existsSync(projectPath)) {
            return {
                completion: 0,
                functionality: 'untested',
                reason: 'File not found'
            };
        }

        const content = fs.readFileSync(projectPath, 'utf8');
        
        let completionScore = 0;
        let functionalityIndicators = {
            working: 0,
            broken: 0,
            features: 0
        };

        // Check 1: Basic HTML structure (10 points)
        if (content.includes('<!DOCTYPE html>') && content.includes('<html') && content.includes('</html>')) {
            completionScore += 10;
            functionalityIndicators.working += 1;
        }

        // Check 2: Head section with meta tags (10 points)
        if (content.includes('<head>') && content.includes('<meta') && content.includes('<title>')) {
            completionScore += 10;
            functionalityIndicators.working += 1;
        }

        // Check 3: CSS styling (10 points)
        if (content.includes('<style>') || content.includes('.css')) {
            completionScore += 10;
            functionalityIndicators.features += 1;
        }

        // Check 4: JavaScript functionality (15 points)
        if (content.includes('<script>') || content.includes('.js')) {
            completionScore += 15;
            functionalityIndicators.features += 1;
        }

        // Check 5: Interactive elements (10 points)
        const interactiveElements = [
            'addEventListener',
            'onclick',
            'onchange',
            'onsubmit',
            'button',
            'input',
            'form'
        ];
        const interactiveCount = interactiveElements.filter(el => 
            content.toLowerCase().includes(el.toLowerCase())
        ).length;
        
        if (interactiveCount >= 2) {
            completionScore += 10;
            functionalityIndicators.features += 1;
        }

        // Check 6: API integrations (15 points)
        const apiIndicators = [
            'fetch(',
            'XMLHttpRequest',
            'axios',
            'api',
            '.then(',
            'async',
            'await'
        ];
        const apiCount = apiIndicators.filter(api => content.includes(api)).length;
        
        if (apiCount >= 2) {
            completionScore += 15;
            functionalityIndicators.features += 1;
        }

        // Check 7: Error handling (10 points)
        const errorHandling = [
            'try {',
            'catch',
            'error',
            'console.error'
        ];
        const errorCount = errorHandling.filter(eh => content.includes(eh)).length;
        
        if (errorCount >= 2) {
            completionScore += 10;
            functionalityIndicators.working += 1;
        }

        // Check 8: Responsive design (10 points)
        if (content.includes('viewport') && content.includes('@media')) {
            completionScore += 10;
            functionalityIndicators.features += 1;
        }

        // Check 9: Navigation/back links (5 points)
        if (content.includes('index.html') || content.includes('back') || content.includes('home')) {
            completionScore += 5;
            functionalityIndicators.features += 1;
        }

        // Check 10: Content density (5 points)
        // If file has substantial content (more than 5KB)
        if (content.length > 5000) {
            completionScore += 5;
        }

        // Detect potential issues that indicate broken functionality
        const errorPatterns = [
            /TODO/gi,
            /FIXME/gi,
            /BUG/gi,
            /NOT WORKING/gi,
            /BROKEN/gi,
            /DEPRECATED/gi
        ];
        
        errorPatterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches && matches.length > 0) {
                functionalityIndicators.broken += matches.length;
            }
        });

        // Determine functionality status
        let functionality = 'untested';
        
        if (functionalityIndicators.broken >= 3) {
            functionality = 'broken';
        } else if (functionalityIndicators.working >= 3 && functionalityIndicators.broken <= 1) {
            functionality = 'working';
        } else if (functionalityIndicators.features >= 2) {
            functionality = 'partial';
        }

        // Cap completion at 100%
        completionScore = Math.min(completionScore, 100);

        return {
            completion: completionScore,
            functionality: functionality,
            indicators: functionalityIndicators
        };

    } catch (error) {
        return {
            completion: 0,
            functionality: 'broken',
            reason: error.message
        };
    }
}

/**
 * Update projects.json with analysis results
 */
function updateProjectsData() {
    console.log('Analyzing projects...\n');
    
    let analyzed = 0;
    let skipped = 0;

    projectsData.projects.forEach((project, index) => {
        const projectPath = path.join(__dirname, project.filename);
        const analysis = analyzeProject(projectPath);

        // Update project with new fields
        project.completion = analysis.completion;
        project.functionality = analysis.functionality;

        analyzed++;

        // Log progress every 50 projects
        if ((index + 1) % 50 === 0) {
            console.log(`Analyzed ${index + 1}/${projectsData.projects.length} projects...`);
        }
    });

    // Update metadata
    projectsData.meta.last_analyzed = new Date().toISOString();
    projectsData.meta.analyzer_version = '1.0.0';

    // Calculate statistics
    const stats = {
        avgCompletion: 0,
        functionalityBreakdown: {
            working: 0,
            partial: 0,
            broken: 0,
            untested: 0
        }
    };

    let totalCompletion = 0;
    projectsData.projects.forEach(project => {
        totalCompletion += project.completion || 0;
        const func = project.functionality || 'untested';
        stats.functionalityBreakdown[func] = (stats.functionalityBreakdown[func] || 0) + 1;
    });

    stats.avgCompletion = Math.round(totalCompletion / projectsData.projects.length);
    projectsData.meta.stats = stats;

    // Save updated projects.json
    fs.writeFileSync(projectsPath, JSON.stringify(projectsData, null, 2), 'utf8');

    console.log('\n✅ Analysis complete!');
    console.log(`\nStatistics:`);
    console.log(`- Total projects: ${projectsData.projects.length}`);
    console.log(`- Average completion: ${stats.avgCompletion}%`);
    console.log(`\nFunctionality breakdown:`);
    console.log(`- Working: ${stats.functionalityBreakdown.working} (${Math.round(stats.functionalityBreakdown.working / projectsData.projects.length * 100)}%)`);
    console.log(`- Partial: ${stats.functionalityBreakdown.partial} (${Math.round(stats.functionalityBreakdown.partial / projectsData.projects.length * 100)}%)`);
    console.log(`- Broken: ${stats.functionalityBreakdown.broken} (${Math.round(stats.functionalityBreakdown.broken / projectsData.projects.length * 100)}%)`);
    console.log(`- Untested: ${stats.functionalityBreakdown.untested} (${Math.round(stats.functionalityBreakdown.untested / projectsData.projects.length * 100)}%)`);
}

// Run the analysis
updateProjectsData();
