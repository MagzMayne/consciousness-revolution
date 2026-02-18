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
 * File: functionality-scoring-system.js
 * Declaration ID: IP-25516198-MLL28ZUT
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
 * FUNCTIONALITY SCORING SYSTEM
 * Comprehensive automated testing and scoring for all HTML projects
 * 
 * @version 2.0
 * @changelog
 * - v2.0: Fibonacci-weighted scoring for natural priority distribution
 *   - Load Success: 21 points (fib(8)) - Most critical
 *   - Interactive Elements: 13 points (fib(7))
 *   - Error Handling: 8 points (fib(6))
 *   - Visual Rendering: 5 points (fib(5))
 *   - Mobile Responsive: 3 points (fib(4))
 *   - 3D/Canvas Elements: 2 points (fib(3))
 *   - Wallet Integration: 1 point (fib(2))
 *   Total: 53 points → Normalized to 100-point scale
 * 
 * Scoring Criteria (Fibonacci-weighted):
 * - Load Success (21 points): Does the page load without errors?
 * - Interactive Elements (13 points): Do buttons, forms, and interactive elements work?
 * - Error Handling (8 points): Are there proper error handlers?
 * - Visual Rendering (5 points): Does the page render correctly (no blank screens)?
 * - Mobile Responsive (3 points): Does it work on mobile?
 * - 3D/Canvas Elements (2 points): Do 3D/canvas elements initialize properly?
 * - Wallet Integration (1 point): Does wallet connection work if present?
 * 
 * Total: 53 raw points → Normalized to 100-point scale
 */

const fs = require('fs');
const path = require('path');

// Load Fibonacci utilities (graceful degradation if unavailable)
let FibonacciUtils = null;
try {
    FibonacciUtils = require('./src/utils/fibonacci-utils.js');
    console.log('✅ Fibonacci utilities loaded');
} catch (e) {
    console.log('⚠️  Fibonacci utilities not available, using hardcoded weights');
}

class FunctionalityScorer {
    constructor() {
        this.projectsData = null;
        this.scores = {};
        this.reportPath = './functionality-scores.json';
        
        // Fibonacci-based weights (fib(8), fib(7), fib(6), fib(5), fib(4), fib(3), fib(2))
        // Total raw points: 21 + 13 + 8 + 5 + 3 + 2 + 1 = 53
        this.weights = {
            loadSuccess: 21,      // fib(8) - Most critical
            interactiveElements: 13,  // fib(7)
            errorHandling: 8,     // fib(6)
            visualRendering: 5,   // fib(5)
            mobileResponsive: 3,  // fib(4)
            threeD: 2,            // fib(3)
            walletIntegration: 1  // fib(2)
        };
        
        this.totalRawPoints = Object.values(this.weights).reduce((sum, val) => sum + val, 0);
        console.log(`📊 Fibonacci scoring weights: Total raw points = ${this.totalRawPoints}, normalized to 100`);
    }

    async initialize() {
        console.log('🚀 Initializing Functionality Scoring System...\n');
        await this.loadProjects();
    }

    async loadProjects() {
        try {
            const projectsPath = path.join(__dirname, 'projects.json');
            const data = fs.readFileSync(projectsPath, 'utf8');
            this.projectsData = JSON.parse(data);
            console.log(`✅ Loaded ${this.projectsData.html_projects.length} HTML projects\n`);
        } catch (error) {
            console.error('❌ Error loading projects.json:', error.message);
            process.exit(1);
        }
    }

    async scoreProject(project) {
        const score = {
            path: project.path,
            title: project.title,
            timestamp: new Date().toISOString(),
            total: 0,
            rawTotal: 0,
            breakdown: {},
            status: 'pending',
            issues: [],
            recommendations: []
        };

        try {
            const filePath = path.join(__dirname, project.path);
            
            // Check if file exists
            if (!fs.existsSync(filePath)) {
                score.status = 'error';
                score.issues.push('File does not exist');
                score.total = 0;
                score.rawTotal = 0;
                return score;
            }

            const content = fs.readFileSync(filePath, 'utf8');

            // 1. Load Success (21 points - fib(8))
            score.breakdown.loadSuccess = this.checkLoadSuccess(content);
            
            // 2. Interactive Elements (13 points - fib(7))
            score.breakdown.interactiveElements = this.checkInteractiveElements(content);
            
            // 3. Error Handling (8 points - fib(6))
            score.breakdown.errorHandling = this.checkErrorHandling(content);
            
            // 4. Visual Rendering (5 points - fib(5))
            score.breakdown.visualRendering = this.checkVisualRendering(content);
            
            // 5. Mobile Responsive (3 points - fib(4))
            score.breakdown.mobileResponsive = this.checkMobileResponsive(content);
            
            // 6. 3D/Canvas Elements (2 points - fib(3))
            score.breakdown.threeD = this.check3DElements(content);

            // 7. Wallet Integration (1 point - fib(2))
            score.breakdown.walletIntegration = this.checkWalletIntegration(content);

            // Calculate raw total (0-53 points)
            score.rawTotal = Object.values(score.breakdown).reduce((sum, val) => sum + val.score, 0);
            
            // Normalize to 100-point scale
            score.total = Math.round((score.rawTotal / this.totalRawPoints) * 100);
            
            // Determine status
            if (score.total >= 80) {
                score.status = 'excellent';
            } else if (score.total >= 60) {
                score.status = 'good';
            } else if (score.total >= 40) {
                score.status = 'needs-improvement';
            } else {
                score.status = 'critical';
            }

            // Collect all issues and recommendations
            Object.values(score.breakdown).forEach(criteria => {
                if (criteria.issues) score.issues.push(...criteria.issues);
                if (criteria.recommendations) score.recommendations.push(...criteria.recommendations);
            });

        } catch (error) {
            score.status = 'error';
            score.issues.push(`Error analyzing file: ${error.message}`);
            score.total = 0;
            score.rawTotal = 0;
        }

        return score;
    }

    checkLoadSuccess(content) {
        const maxPoints = this.weights.loadSuccess; // 21 points (fib(8))
        const result = { score: 0, max: maxPoints, issues: [], recommendations: [] };
        const pointsPerCheck = maxPoints / 4; // Divide equally among 4 checks
        
        // Check for basic HTML structure
        if (content.includes('<!DOCTYPE') || content.includes('<!doctype')) {
            result.score += pointsPerCheck;
        } else {
            result.issues.push('Missing DOCTYPE declaration');
            result.recommendations.push('Add proper DOCTYPE declaration');
        }

        if (content.includes('<html')) {
            result.score += pointsPerCheck;
        } else {
            result.issues.push('Missing <html> tag');
        }

        if (content.includes('<head>') && content.includes('</head>')) {
            result.score += pointsPerCheck;
        } else {
            result.issues.push('Missing or malformed <head> section');
        }

        if (content.includes('<body>') && content.includes('</body>')) {
            result.score += pointsPerCheck;
        } else {
            result.issues.push('Missing or malformed <body> section');
        }

        result.score = Math.round(result.score * 10) / 10; // Round to 1 decimal
        return result;
    }

    checkInteractiveElements(content) {
        const maxPoints = this.weights.interactiveElements; // 13 points (fib(7))
        const result = { score: 0, max: maxPoints, issues: [], recommendations: [] };
        const pointsPerCheck = maxPoints / 4; // Divide among 4 checks
        
        // Check for buttons
        const buttonCount = (content.match(/<button/gi) || []).length;
        if (buttonCount > 0) {
            result.score += pointsPerCheck;
        } else {
            result.recommendations.push('Consider adding interactive buttons');
        }

        // Check for event listeners
        if (content.includes('addEventListener') || content.includes('onclick')) {
            result.score += pointsPerCheck;
        } else {
            result.issues.push('No event listeners found');
            result.recommendations.push('Add event listeners for interactivity');
        }

        // Check for forms or inputs
        if (content.includes('<form') || content.includes('<input') || content.includes('<select')) {
            result.score += pointsPerCheck;
        }

        // Check for interactive scripts
        if (content.includes('<script') && !content.includes('src=') && content.includes('function')) {
            result.score += pointsPerCheck;
        } else if (content.includes('src=') && content.match(/<script.*src=/gi)) {
            result.score += pointsPerCheck;
        }

        result.score = Math.round(result.score * 10) / 10;
        return result;
    }

    checkErrorHandling(content) {
        const maxPoints = this.weights.errorHandling; // 8 points (fib(6))
        const result = { score: 0, max: maxPoints, issues: [], recommendations: [] };
        const pointsPerCheck = maxPoints / 3; // Divide among 3 checks
        
        // Check for try-catch blocks
        const tryCatchCount = (content.match(/try\s*{/gi) || []).length;
        if (tryCatchCount > 0) {
            result.score += pointsPerCheck;
        } else {
            result.recommendations.push('Add try-catch blocks for error handling');
        }

        // Check for error handling in promises
        if (content.includes('.catch(') || content.includes('catch (')) {
            result.score += pointsPerCheck;
        } else {
            result.recommendations.push('Add error handlers for async operations');
        }

        // Check for console.error or logging
        if (content.includes('console.error') || content.includes('console.warn')) {
            result.score += pointsPerCheck;
        }

        result.score = Math.round(result.score * 10) / 10;
        return result;
    }

    checkVisualRendering(content) {
        const maxPoints = this.weights.visualRendering; // 5 points (fib(5))
        const result = { score: 0, max: maxPoints, issues: [], recommendations: [] };
        const pointsPerCheck = maxPoints / 3; // Divide among 3 checks
        
        // Check for CSS
        if (content.includes('<style') || content.includes('href=') && content.includes('.css')) {
            result.score += pointsPerCheck;
        } else {
            result.issues.push('No CSS found');
            result.recommendations.push('Add styling for better visual presentation');
        }

        // Check for visible content
        const hasVisibleContent = content.includes('<h1') || content.includes('<h2') || 
                                  content.includes('<p') || content.includes('<div');
        if (hasVisibleContent) {
            result.score += pointsPerCheck;
        } else {
            result.issues.push('Limited visible content structure');
        }

        // Check for images or media
        if (content.includes('<img') || content.includes('<canvas') || content.includes('<video')) {
            result.score += pointsPerCheck;
        }

        result.score = Math.round(result.score * 10) / 10;
        return result;
    }

    checkMobileResponsive(content) {
        const maxPoints = this.weights.mobileResponsive; // 3 points (fib(4))
        const result = { score: 0, max: maxPoints, issues: [], recommendations: [] };
        const pointsPerCheck = maxPoints / 3; // Divide among 3 checks
        
        // Check for viewport meta tag
        if (content.includes('viewport') && content.includes('width=device-width')) {
            result.score += pointsPerCheck;
        } else {
            result.issues.push('Missing responsive viewport meta tag');
            result.recommendations.push('Add viewport meta tag for mobile responsiveness');
        }

        // Check for media queries
        if (content.includes('@media')) {
            result.score += pointsPerCheck;
        } else {
            result.recommendations.push('Add media queries for responsive design');
        }

        // Check for mobile-friendly CSS
        if (content.includes('max-width') || content.includes('min-width') || 
            content.includes('flex') || content.includes('grid')) {
            result.score += pointsPerCheck;
        }

        result.score = Math.round(result.score * 10) / 10;
        return result;
    }

    check3DElements(content) {
        const maxPoints = this.weights.threeD; // 2 points (fib(3))
        const result = { score: 0, max: maxPoints, issues: [], recommendations: [] };
        const pointsPerCheck = maxPoints / 3; // Divide among 3 checks
        
        // Check for Three.js
        if (content.includes('three.js') || content.includes('THREE.')) {
            result.score += pointsPerCheck;
        }

        // Check for WebGL/Canvas
        if (content.includes('WebGL') || content.includes('getContext') && content.includes('webgl')) {
            result.score += pointsPerCheck;
        }

        // Check for 3D initialization
        if (content.includes('Scene()') || content.includes('PerspectiveCamera') || content.includes('WebGLRenderer')) {
            result.score += pointsPerCheck;
        } else if (result.score < maxPoints && (content.includes('three.js') || content.includes('canvas'))) {
            result.recommendations.push('Initialize 3D scene properly');
        }

        result.score = Math.round(result.score * 10) / 10;
        return result;
    }

    checkWalletIntegration(content) {
        const maxPoints = this.weights.walletIntegration; // 1 point (fib(2))
        const result = { score: 0, max: maxPoints, issues: [], recommendations: [] };
        
        // Check for wallet libraries and connection logic
        if (content.includes('solana') || content.includes('phantom') || content.includes('@solana/web3.js')) {
            result.score += maxPoints / 2;
        }

        if (content.includes('connect') && (content.includes('wallet') || content.includes('Wallet'))) {
            result.score += maxPoints / 2;
        }

        result.score = Math.round(result.score * 10) / 10;
        return result;
    }

    async scoreAllProjects() {
        console.log('📊 Scoring all projects...\n');
        
        const totalProjects = this.projectsData.html_projects.length;
        let completedCount = 0;
        
        for (const project of this.projectsData.html_projects) {
            completedCount++;
            process.stdout.write(`\rProgress: ${completedCount}/${totalProjects} (${Math.round(completedCount/totalProjects*100)}%)`);
            
            const score = await this.scoreProject(project);
            this.scores[project.path] = score;
        }
        
        console.log('\n\n✅ Scoring complete!\n');
    }

    generateReport() {
        console.log('📝 Generating reports...\n');

        // Calculate statistics
        const allScores = Object.values(this.scores);
        const totalProjects = allScores.length;
        const avgScore = allScores.reduce((sum, s) => sum + s.total, 0) / totalProjects;
        
        const statusCounts = {
            excellent: allScores.filter(s => s.status === 'excellent').length,
            good: allScores.filter(s => s.status === 'good').length,
            'needs-improvement': allScores.filter(s => s.status === 'needs-improvement').length,
            critical: allScores.filter(s => s.status === 'critical').length,
            error: allScores.filter(s => s.status === 'error').length
        };

        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalProjects,
                averageScore: Math.round(avgScore * 10) / 10,
                statusCounts
            },
            projects: this.scores
        };

        // Save JSON report
        fs.writeFileSync(this.reportPath, JSON.stringify(report, null, 2));
        console.log(`✅ JSON report saved to: ${this.reportPath}`);

        // Generate Markdown report
        this.generateMarkdownReport(report);

        // Print summary
        this.printSummary(report);
    }

    generateMarkdownReport(report) {
        const mdPath = './FUNCTIONALITY_SCORES_REPORT.md';
        
        let md = `# 🎯 Functionality Scores Report\n\n`;
        md += `**Generated:** ${new Date(report.timestamp).toLocaleString()}\n\n`;
        md += `## 📊 Summary\n\n`;
        md += `- **Total Projects:** ${report.summary.totalProjects}\n`;
        md += `- **Average Score:** ${report.summary.averageScore}/100\n\n`;
        md += `### Status Distribution\n\n`;
        md += `| Status | Count | Percentage |\n`;
        md += `|--------|-------|------------|\n`;
        
        Object.entries(report.summary.statusCounts).forEach(([status, count]) => {
            const pct = Math.round((count / report.summary.totalProjects) * 100);
            md += `| ${status} | ${count} | ${pct}% |\n`;
        });
        
        md += `\n## 🏆 Top Performing Projects\n\n`;
        const topProjects = Object.values(report.projects)
            .sort((a, b) => b.total - a.total)
            .slice(0, 20);
        
        topProjects.forEach((project, idx) => {
            md += `${idx + 1}. **${project.title}** (${project.path}) - Score: ${project.total}/100\n`;
        });
        
        md += `\n## ⚠️ Projects Needing Attention\n\n`;
        const criticalProjects = Object.values(report.projects)
            .filter(p => p.status === 'critical' || p.status === 'error')
            .sort((a, b) => a.total - b.total)
            .slice(0, 30);
        
        criticalProjects.forEach((project, idx) => {
            md += `${idx + 1}. **${project.title}** (${project.path}) - Score: ${project.total}/100\n`;
            if (project.issues.length > 0) {
                md += `   - Issues: ${project.issues.slice(0, 3).join('; ')}\n`;
            }
        });
        
        md += `\n## 📈 Detailed Breakdown\n\n`;
        md += `| Project | Score | Status | Load | Interactive | Visual | 3D | Wallet | Errors | Mobile |\n`;
        md += `|---------|-------|--------|------|-------------|--------|----|----|--------|--------|\n`;
        
        Object.values(report.projects)
            .sort((a, b) => b.total - a.total)
            .forEach(project => {
                const b = project.breakdown;
                md += `| ${project.title.substring(0, 40)} | ${project.total} | ${project.status} | `;
                md += `${b.loadSuccess?.score || 0} | ${b.interactiveElements?.score || 0} | `;
                md += `${b.visualRendering?.score || 0} | ${b.threeD?.score || 0} | `;
                md += `${b.walletIntegration?.score || 0} | ${b.errorHandling?.score || 0} | `;
                md += `${b.mobileResponsive?.score || 0} |\n`;
            });

        fs.writeFileSync(mdPath, md);
        console.log(`✅ Markdown report saved to: ${mdPath}`);
    }

    printSummary(report) {
        console.log('\n' + '='.repeat(60));
        console.log('📊 FUNCTIONALITY SCORES SUMMARY');
        console.log('='.repeat(60));
        console.log(`\nTotal Projects: ${report.summary.totalProjects}`);
        console.log(`Average Score: ${report.summary.averageScore}/100`);
        console.log(`\nStatus Breakdown:`);
        console.log(`  ✅ Excellent (80-100): ${report.summary.statusCounts.excellent}`);
        console.log(`  👍 Good (60-79): ${report.summary.statusCounts.good}`);
        console.log(`  ⚠️  Needs Improvement (40-59): ${report.summary.statusCounts['needs-improvement']}`);
        console.log(`  🔴 Critical (<40): ${report.summary.statusCounts.critical}`);
        console.log(`  ❌ Error: ${report.summary.statusCounts.error}`);
        console.log('\n' + '='.repeat(60) + '\n');
    }

    async run() {
        await this.initialize();
        await this.scoreAllProjects();
        this.generateReport();
        console.log('🎉 Functionality scoring complete!\n');
    }
}

// Run if called directly
if (require.main === module) {
    const scorer = new FunctionalityScorer();
    scorer.run().catch(console.error);
}

module.exports = FunctionalityScorer;
