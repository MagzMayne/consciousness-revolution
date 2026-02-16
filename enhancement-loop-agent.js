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
 * File: enhancement-loop-agent.js
 * Declaration ID: IP-577C4EDA-MLL28ZUS
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
 * ENHANCEMENT LOOP AGENT
 * ======================
 * 
 * Automated enhancement system that continuously monitors and improves projects
 * 
 * FEATURES:
 * - Runs functionality scoring on all projects
 * - Monitors for declining quality or issues
 * - Automatically deploys enhancement agents
 * - Triggers auto-iteration system
 * - Logs all activities for transparency
 * 
 * USAGE:
 * - node enhancement-loop-agent.js              # Run once
 * - node enhancement-loop-agent.js --loop       # Continuous mode (30 min default)
 * - node enhancement-loop-agent.js --loop 15    # Custom interval (15 minutes)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONFIG = {
    repoPath: __dirname,
    logFile: path.join(__dirname, 'enhancement-loop.log'),
    defaultIntervalMinutes: 30,
    minScore: 60, // Minimum acceptable score
    criticalScore: 40 // Critical threshold
};

class EnhancementLoopAgent {
    constructor() {
        this.isLooping = process.argv.includes('--loop');
        this.intervalMinutes = this.parseInterval();
        this.cycleCount = 0;
    }

    parseInterval() {
        const loopIndex = process.argv.indexOf('--loop');
        if (loopIndex !== -1 && process.argv[loopIndex + 1]) {
            const interval = parseInt(process.argv[loopIndex + 1]);
            if (!isNaN(interval) && interval > 0) {
                return interval;
            }
        }
        return CONFIG.defaultIntervalMinutes;
    }

    log(message, level = 'INFO') {
        const timestamp = new Date().toISOString();
        const prefix = {
            INFO: 'ℹ️',
            SUCCESS: '✅',
            ERROR: '❌',
            WARNING: '⚠️',
            ACTION: '🔧'
        }[level] || '📝';

        const logMessage = `[${timestamp}] ${prefix} ${message}`;
        console.log(logMessage);

        // Append to log file
        fs.appendFileSync(CONFIG.logFile, logMessage + '\n');
    }

    async runEnhancementCycle() {
        this.cycleCount++;
        this.log(`Starting enhancement cycle #${this.cycleCount}`, 'INFO');
        this.log('='.repeat(60), 'INFO');

        try {
            // Step 1: Run functionality scoring
            this.log('Step 1: Running functionality scoring system...', 'ACTION');
            await this.runFunctionalityScoring();

            // Step 2: Analyze scores and identify issues
            this.log('Step 2: Analyzing project scores...', 'ACTION');
            const analysis = await this.analyzeScores();

            // Step 3: Deploy enhancement agents if needed
            if (analysis.needsEnhancement) {
                this.log('Step 3: Deploying enhancement agents...', 'ACTION');
                await this.deployEnhancementAgents(analysis);
            } else {
                this.log('Step 3: No enhancement agents needed - all projects healthy', 'SUCCESS');
            }

            // Step 4: Run auto-iteration system
            this.log('Step 4: Running auto-iteration system...', 'ACTION');
            await this.runAutoIteration();

            // Step 5: Generate summary
            this.log('Step 5: Generating cycle summary...', 'ACTION');
            this.generateCycleSummary(analysis);

            this.log('Enhancement cycle complete!', 'SUCCESS');
            this.log('='.repeat(60), 'INFO');

        } catch (error) {
            this.log(`Error during enhancement cycle: ${error.message}`, 'ERROR');
            this.log(`Stack: ${error.stack}`, 'ERROR');
        }
    }

    async runFunctionalityScoring() {
        try {
            // Check if Node.js scoring system exists
            const scorerPath = path.join(CONFIG.repoPath, 'functionality-scoring-system.js');
            if (!fs.existsSync(scorerPath)) {
                this.log('Functionality scoring system not found', 'WARNING');
                return;
            }

            // Run the scoring system
            this.log('Executing: node functionality-scoring-system.js', 'INFO');
            const output = execSync('node functionality-scoring-system.js', {
                cwd: CONFIG.repoPath,
                encoding: 'utf8',
                stdio: 'pipe'
            });

            this.log('Functionality scoring completed', 'SUCCESS');
            
            // Check if scores file was created
            const scoresPath = path.join(CONFIG.repoPath, 'functionality-scores.json');
            if (fs.existsSync(scoresPath)) {
                const stats = fs.statSync(scoresPath);
                this.log(`Scores file updated: ${stats.size} bytes`, 'INFO');
            }

        } catch (error) {
            this.log(`Scoring system error: ${error.message}`, 'ERROR');
            // Continue anyway - other steps might still be useful
        }
    }

    async analyzeScores() {
        const scoresPath = path.join(CONFIG.repoPath, 'functionality-scores.json');
        
        if (!fs.existsSync(scoresPath)) {
            this.log('No scores file found - skipping analysis', 'WARNING');
            return { needsEnhancement: false };
        }

        try {
            const data = JSON.parse(fs.readFileSync(scoresPath, 'utf8'));
            const projects = Object.values(data.projects);
            
            const critical = projects.filter(p => p.total < CONFIG.criticalScore);
            const needsImprovement = projects.filter(p => p.total >= CONFIG.criticalScore && p.total < CONFIG.minScore);
            const healthy = projects.filter(p => p.total >= CONFIG.minScore);

            this.log(`Total projects: ${projects.length}`, 'INFO');
            this.log(`Average score: ${data.summary.averageScore}/100`, 'INFO');
            this.log(`Critical (< ${CONFIG.criticalScore}): ${critical.length}`, critical.length > 0 ? 'WARNING' : 'INFO');
            this.log(`Needs improvement (${CONFIG.criticalScore}-${CONFIG.minScore}): ${needsImprovement.length}`, needsImprovement.length > 0 ? 'WARNING' : 'INFO');
            this.log(`Healthy (>= ${CONFIG.minScore}): ${healthy.length}`, 'SUCCESS');

            return {
                needsEnhancement: critical.length > 0 || needsImprovement.length > 0,
                totalProjects: projects.length,
                criticalCount: critical.length,
                needsImprovementCount: needsImprovement.length,
                healthyCount: healthy.length,
                averageScore: data.summary.averageScore,
                criticalProjects: critical.slice(0, 10).map(p => ({
                    path: p.path,
                    title: p.title,
                    score: p.total
                }))
            };

        } catch (error) {
            this.log(`Error analyzing scores: ${error.message}`, 'ERROR');
            return { needsEnhancement: false };
        }
    }

    async deployEnhancementAgents(analysis) {
        this.log(`Deploying agents for ${analysis.criticalCount + analysis.needsImprovementCount} projects`, 'ACTION');

        // Check for auto-deploy script
        const autoDeployPath = path.join(CONFIG.repoPath, 'auto-deploy-all-agents.js');
        if (fs.existsSync(autoDeployPath)) {
            try {
                this.log('Running: node auto-deploy-all-agents.js', 'ACTION');
                execSync('node auto-deploy-all-agents.js', {
                    cwd: CONFIG.repoPath,
                    encoding: 'utf8',
                    stdio: 'pipe'
                });
                this.log('Agent deployment completed', 'SUCCESS');
            } catch (error) {
                this.log(`Agent deployment error: ${error.message}`, 'WARNING');
            }
        } else {
            this.log('Auto-deploy script not found - agents not deployed', 'WARNING');
        }

        // Log critical projects for manual review
        if (analysis.criticalProjects && analysis.criticalProjects.length > 0) {
            this.log('Critical projects requiring attention:', 'WARNING');
            analysis.criticalProjects.forEach(p => {
                this.log(`  - ${p.title} (${p.path}): ${p.score}/100`, 'WARNING');
            });
        }
    }

    async runAutoIteration() {
        const iteratePath = path.join(CONFIG.repoPath, 'auto-iterate-system.js');
        
        if (!fs.existsSync(iteratePath)) {
            this.log('Auto-iterate system not found', 'WARNING');
            return;
        }

        try {
            this.log('Running: node auto-iterate-system.js', 'ACTION');
            const output = execSync('node auto-iterate-system.js', {
                cwd: CONFIG.repoPath,
                encoding: 'utf8',
                stdio: 'pipe',
                timeout: 120000 // 2 minute timeout
            });
            this.log('Auto-iteration completed', 'SUCCESS');
        } catch (error) {
            this.log(`Auto-iteration warning: ${error.message}`, 'WARNING');
            // Don't fail the whole cycle if iteration has issues
        }
    }

    generateCycleSummary(analysis) {
        this.log('', 'INFO');
        this.log('📊 CYCLE SUMMARY', 'INFO');
        this.log('-'.repeat(60), 'INFO');
        this.log(`Cycle #${this.cycleCount} completed at ${new Date().toLocaleString()}`, 'INFO');
        
        if (analysis.totalProjects) {
            this.log(`Projects Analyzed: ${analysis.totalProjects}`, 'INFO');
            this.log(`Average Score: ${analysis.averageScore}/100`, 'INFO');
            this.log(`Health Status: ${analysis.healthyCount}/${analysis.totalProjects} healthy`, 'INFO');
            
            if (analysis.needsEnhancement) {
                this.log(`Action Taken: Enhancement agents deployed`, 'ACTION');
            } else {
                this.log(`Action Taken: None needed - all projects healthy`, 'SUCCESS');
            }
        }

        if (this.isLooping) {
            const nextRun = new Date(Date.now() + this.intervalMinutes * 60000);
            this.log(`Next cycle scheduled: ${nextRun.toLocaleString()} (in ${this.intervalMinutes} minutes)`, 'INFO');
        }
        
        this.log('-'.repeat(60), 'INFO');
        this.log('', 'INFO');
    }

    async start() {
        this.log('🚀 ENHANCEMENT LOOP AGENT STARTING', 'INFO');
        this.log(`Mode: ${this.isLooping ? 'CONTINUOUS' : 'SINGLE RUN'}`, 'INFO');
        if (this.isLooping) {
            this.log(`Interval: ${this.intervalMinutes} minutes`, 'INFO');
        }
        this.log('', 'INFO');

        // Run first cycle
        await this.runEnhancementCycle();

        // Set up loop if continuous mode
        if (this.isLooping) {
            setInterval(async () => {
                await this.runEnhancementCycle();
            }, this.intervalMinutes * 60000);
            
            this.log('Loop active - press Ctrl+C to stop', 'INFO');
        } else {
            this.log('Single run complete - exiting', 'SUCCESS');
            process.exit(0);
        }
    }
}

// Show usage info
function showUsage() {
    console.log(`
🤖 ENHANCEMENT LOOP AGENT

Automated system for continuous project enhancement

USAGE:
  node enhancement-loop-agent.js              Run once and exit
  node enhancement-loop-agent.js --loop       Run continuously (30 min interval)
  node enhancement-loop-agent.js --loop 15    Custom interval (15 minutes)

FEATURES:
  ✅ Automatic functionality scoring
  ✅ Project health monitoring
  ✅ Smart enhancement deployment
  ✅ Auto-iteration integration
  ✅ Comprehensive logging

INTEGRATION:
  - Works with functionality-scoring-system.js
  - Triggers auto-deploy-all-agents.js
  - Runs auto-iterate-system.js
  - Updates functionality-dashboard.html

Built for barbrickdesign.github.io
`);
}

// Main execution
if (require.main === module) {
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
        showUsage();
        process.exit(0);
    }

    const agent = new EnhancementLoopAgent();
    agent.start().catch(error => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
}

module.exports = EnhancementLoopAgent;
