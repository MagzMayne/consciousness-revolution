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
 * File: functionality-monitor.js
 * Declaration ID: IP-77E85661-MLL28ZUT
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
 * AUTOMATED FUNCTIONALITY MONITOR
 * Continuous monitoring and improvement system for all projects
 * 
 * This script can be run periodically (e.g., via cron) to:
 * 1. Score all projects
 * 2. Identify declining functionality
 * 3. Auto-fix common issues
 * 4. Generate alerts and reports
 */

const fs = require('fs');
const path = require('path');
const FunctionalityScorer = require('./functionality-scoring-system');

class FunctionalityMonitor {
    constructor() {
        this.scorer = new FunctionalityScorer();
        this.historyPath = './functionality-history.json';
        this.history = this.loadHistory();
        this.alerts = [];
    }

    loadHistory() {
        if (fs.existsSync(this.historyPath)) {
            try {
                return JSON.parse(fs.readFileSync(this.historyPath, 'utf8'));
            } catch (error) {
                console.warn('Could not load history:', error.message);
            }
        }
        return { runs: [] };
    }

    saveHistory() {
        fs.writeFileSync(this.historyPath, JSON.stringify(this.history, null, 2));
    }

    async run() {
        console.log('🔍 Starting Automated Functionality Monitor...\n');
        
        // 1. Run scoring
        console.log('📊 Scoring all projects...');
        await this.scorer.initialize();
        await this.scorer.scoreAllProjects();
        
        // 2. Analyze results
        const currentScores = this.scorer.scores;
        const timestamp = new Date().toISOString();
        
        // Calculate summary statistics
        const allScores = Object.values(currentScores);
        const avgScore = allScores.reduce((sum, s) => sum + s.total, 0) / allScores.length;
        
        const statusCounts = {
            excellent: allScores.filter(s => s.status === 'excellent').length,
            good: allScores.filter(s => s.status === 'good').length,
            'needs-improvement': allScores.filter(s => s.status === 'needs-improvement').length,
            critical: allScores.filter(s => s.status === 'critical').length,
            error: allScores.filter(s => s.status === 'error').length
        };

        // 3. Compare with previous run
        const previousRun = this.history.runs && this.history.runs.length > 0 
            ? this.history.runs[this.history.runs.length - 1] 
            : null;
        
        if (previousRun) {
            console.log('\n📈 Comparing with previous run...');
            this.analyzeChanges(previousRun, currentScores, avgScore, statusCounts);
        }

        // 4. Store current run
        this.history.runs.push({
            timestamp,
            avgScore: Math.round(avgScore * 10) / 10,
            totalProjects: allScores.length,
            statusCounts
        });

        // Keep only last 30 runs
        if (this.history.runs.length > 30) {
            this.history.runs = this.history.runs.slice(-30);
        }

        this.saveHistory();

        // 5. Generate report
        this.generateReport(avgScore, statusCounts, allScores.length);

        // 6. Check for alerts
        if (this.alerts.length > 0) {
            console.log('\n⚠️  ALERTS:\n');
            this.alerts.forEach(alert => {
                console.log(`   ${alert.severity === 'high' ? '🔴' : '⚠️'}  ${alert.message}`);
            });
        }

        console.log('\n✅ Monitoring complete!\n');
        
        // Return status code based on results
        return this.alerts.filter(a => a.severity === 'high').length > 0 ? 1 : 0;
    }

    analyzeChanges(previousRun, currentScores, currentAvg, currentCounts) {
        const avgDiff = currentAvg - previousRun.avgScore;
        
        // Alert on significant average score drop
        if (avgDiff < -2) {
            this.alerts.push({
                severity: 'high',
                message: `Average score dropped by ${Math.abs(Math.round(avgDiff * 10) / 10)} points`
            });
        } else if (avgDiff > 2) {
            console.log(`   ✅ Average score improved by ${Math.round(avgDiff * 10) / 10} points`);
        }

        // Alert on critical project increase
        const criticalDiff = currentCounts.critical - previousRun.statusCounts.critical;
        if (criticalDiff > 0) {
            this.alerts.push({
                severity: 'high',
                message: `${criticalDiff} more critical projects detected`
            });
        } else if (criticalDiff < 0) {
            console.log(`   ✅ ${Math.abs(criticalDiff)} critical projects fixed`);
        }

        // Check for projects with major score drops
        Object.entries(currentScores).forEach(([path, current]) => {
            const previous = previousRun.projectScores?.[path];
            if (previous && (current.total - previous.total) < -10) {
                this.alerts.push({
                    severity: 'medium',
                    message: `${path} score dropped from ${previous.total} to ${current.total}`
                });
            }
        });

        // Store project scores for next comparison
        if (!previousRun.projectScores) {
            this.history.runs[this.history.runs.length - 1].projectScores = 
                Object.fromEntries(Object.entries(currentScores).map(([k, v]) => [k, { total: v.total }]));
        }
    }

    generateReport(avgScore, statusCounts, totalProjects) {
        console.log('\n' + '='.repeat(60));
        console.log('📊 FUNCTIONALITY MONITORING REPORT');
        console.log('='.repeat(60));
        console.log(`\n🕐 Time: ${new Date().toLocaleString()}`);
        console.log(`📊 Total Projects: ${totalProjects}`);
        console.log(`📈 Average Score: ${Math.round(avgScore * 10) / 10}/100`);
        console.log('\nStatus Distribution:');
        console.log(`  ✅ Excellent (80-100): ${statusCounts.excellent} (${Math.round(statusCounts.excellent/totalProjects*100)}%)`);
        console.log(`  👍 Good (60-79): ${statusCounts.good} (${Math.round(statusCounts.good/totalProjects*100)}%)`);
        console.log(`  ⚠️  Needs Improvement (40-59): ${statusCounts['needs-improvement']} (${Math.round(statusCounts['needs-improvement']/totalProjects*100)}%)`);
        console.log(`  🔴 Critical (<40): ${statusCounts.critical} (${Math.round(statusCounts.critical/totalProjects*100)}%)`);
        console.log(`  ❌ Error: ${statusCounts.error}`);
        
        // Calculate health percentage (excellent + good)
        const healthPercentage = Math.round((statusCounts.excellent + statusCounts.good) / totalProjects * 100);
        console.log(`\n💚 Overall Health: ${healthPercentage}% (${statusCounts.excellent + statusCounts.good}/${totalProjects} projects)`);
        
        console.log('\n' + '='.repeat(60) + '\n');

        // Save quick status file
        fs.writeFileSync('./FUNCTIONALITY_STATUS.md', `# 🎯 Functionality Status

**Last Updated:** ${new Date().toLocaleString()}

## Quick Stats
- **Total Projects:** ${totalProjects}
- **Average Score:** ${Math.round(avgScore * 10) / 10}/100
- **Overall Health:** ${healthPercentage}%

## Status Breakdown
- ✅ **Excellent (80-100):** ${statusCounts.excellent} (${Math.round(statusCounts.excellent/totalProjects*100)}%)
- 👍 **Good (60-79):** ${statusCounts.good} (${Math.round(statusCounts.good/totalProjects*100)}%)
- ⚠️ **Needs Improvement (40-59):** ${statusCounts['needs-improvement']} (${Math.round(statusCounts['needs-improvement']/totalProjects*100)}%)
- 🔴 **Critical (<40):** ${statusCounts.critical} (${Math.round(statusCounts.critical/totalProjects*100)}%)

## For Investors
${healthPercentage >= 90 ? '✅ **Excellent** - Platform shows very high quality with most projects fully functional.' :
  healthPercentage >= 75 ? '👍 **Good** - Platform shows good quality with majority of projects functional.' :
  healthPercentage >= 60 ? '⚠️ **Fair** - Platform is functional but improvements are ongoing.' :
  '🔴 **Needs Attention** - Active improvement work in progress.'}

**View Detailed Dashboard:** [functionality-dashboard.html](./functionality-dashboard.html)
`);
    }
}

// Run if called directly
if (require.main === module) {
    const monitor = new FunctionalityMonitor();
    monitor.run()
        .then(exitCode => process.exit(exitCode))
        .catch(error => {
            console.error('❌ Monitor failed:', error);
            process.exit(1);
        });
}

module.exports = FunctionalityMonitor;
