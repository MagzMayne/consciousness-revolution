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
 * File: file-evaluation-orchestrator.js
 * Declaration ID: IP-596E038D-MLL28ZVZ
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

/** SIGNED BY MeRLynn - ID: MERLYNN-2554b3cd - TIMESTAMP: 2025-12-19T05:53:06.533Z - HASH: 5f6f114f */
/** SIGNED BY AGentR - ID: AGENTR-267efbe6 - TIMESTAMP: 2025-12-19T05:53:06.533Z - HASH: 5f6f114f */

/**
 * FILE EVALUATION ORCHESTRATOR
 * Coordinates all evaluation agents to analyze repository files
 * Excludes HTML files from main repository structure as specified
 */

class FileEvaluationOrchestrator {
    constructor(logger = null) {
        this.logger = logger || this.createDefaultLogger();
        this.agents = {};
        this.results = {};
        this.startTime = null;
        this.endTime = null;
    }

    /**
     * Create default logger
     */
    createDefaultLogger() {
        return {
            info: (agent, message, data) => console.log(`ℹ️  [${agent}] ${message}`, data || ''),
            success: (agent, message, data) => console.log(`✅ [${agent}] ${message}`, data || ''),
            warn: (agent, message, data) => console.warn(`⚠️  [${agent}] ${message}`, data || ''),
            error: (agent, message, data) => console.error(`❌ [${agent}] ${message}`, data || ''),
            log: (message, data) => console.log(message, data || '')
        };
    }

    /**
     * Initialize all agents
     */
    async initialize() {
        this.log('info', 'Initializing File Evaluation Orchestrator...');
        
        try {
            // Load agent modules
            const JsCssQualityAgent = require('./js-css-quality-agent');
            const FileUsageAgent = require('./file-usage-agent');
            const ConfigComplianceAgent = require('./config-compliance-agent');
            const ReportGeneratorAgent = require('./report-generator-agent');
            
            // Initialize agents
            this.agents.codeQuality = new JsCssQualityAgent(this.logger);
            this.agents.fileUsage = new FileUsageAgent(this.logger);
            this.agents.configuration = new ConfigComplianceAgent(this.logger);
            this.agents.reportGenerator = new ReportGeneratorAgent(this.logger);
            
            this.log('success', 'All agents initialized successfully');
            
            return true;
        } catch (error) {
            this.log('error', `Failed to initialize agents: ${error.message}`);
            throw error;
        }
    }

    /**
     * Run complete evaluation
     */
    async runCompleteEvaluation() {
        this.startTime = Date.now();
        
        this.log('info', '🚀 Starting complete file evaluation...');
        this.log('info', '📋 Scope: JS, CSS, and config files (excluding HTML in main repo)');
        
        try {
            // Phase 1: Code Quality Analysis
            await this.runPhase('Code Quality Analysis', async () => {
                this.results.codeQuality = await this.agents.codeQuality.analyzeAllFiles();
            });
            
            // Phase 2: File Usage Analysis
            await this.runPhase('File Usage Analysis', async () => {
                this.results.fileUsage = await this.agents.fileUsage.analyzeRepository();
            });
            
            // Phase 3: Configuration Compliance
            await this.runPhase('Configuration Compliance', async () => {
                this.results.configuration = await this.agents.configuration.analyzeConfigurations();
            });
            
            // Phase 4: Report Generation
            await this.runPhase('Report Generation', async () => {
                this.results.report = await this.agents.reportGenerator.generateComprehensiveReport(this.results);
            });
            
            this.endTime = Date.now();
            const duration = ((this.endTime - this.startTime) / 1000).toFixed(2);
            
            this.log('success', `✨ Complete evaluation finished in ${duration}s`);
            
            // Print summary
            this.printSummary();
            
            return this.results;
        } catch (error) {
            this.log('error', `Evaluation failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Run a single phase
     */
    async runPhase(phaseName, phaseFunction) {
        this.log('info', `\n📊 Phase: ${phaseName}`);
        this.log('info', '═'.repeat(50));
        
        const phaseStart = Date.now();
        
        try {
            await phaseFunction();
            
            const phaseDuration = ((Date.now() - phaseStart) / 1000).toFixed(2);
            this.log('success', `✅ ${phaseName} completed in ${phaseDuration}s`);
        } catch (error) {
            this.log('error', `❌ ${phaseName} failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Print evaluation summary
     */
    printSummary() {
        console.log('\n' + '═'.repeat(70));
        console.log('📋 EVALUATION SUMMARY');
        console.log('═'.repeat(70));
        
        if (this.results.codeQuality) {
            const cq = this.results.codeQuality.summary;
            console.log('\n🔍 CODE QUALITY:');
            console.log(`   Files Analyzed: ${cq.totalFiles}`);
            console.log(`   Issues Found: ${cq.issuesFound}`);
            console.log(`   - Critical: ${cq.criticalIssues}`);
            console.log(`   - Warnings: ${cq.warnings}`);
            console.log(`   - Suggestions: ${cq.suggestions}`);
        }
        
        if (this.results.fileUsage) {
            const fu = this.results.fileUsage.summary;
            console.log('\n📂 FILE USAGE:');
            console.log(`   Total Files Scanned: ${fu.totalFiles}`);
            console.log(`   Unused Files: ${fu.unusedCount}`);
            console.log(`   Orphaned Files: ${fu.orphanedCount}`);
            console.log(`   Duplicate Sets: ${fu.duplicateCount}`);
            console.log(`   Potential Savings: ${(fu.potentialSavings / 1024).toFixed(2)} KB`);
        }
        
        if (this.results.configuration) {
            const cfg = this.results.configuration.summary;
            console.log('\n⚙️  CONFIGURATION:');
            console.log(`   Total Issues: ${cfg.totalIssues}`);
            console.log(`   - Security: ${cfg.securityIssues}`);
            console.log(`   - Deployment: ${cfg.deploymentIssues}`);
            console.log(`   - Performance: ${cfg.performanceIssues}`);
            console.log(`   - Best Practices: ${cfg.bestPracticeIssues}`);
        }
        
        if (this.results.report) {
            const report = this.results.report;
            console.log('\n🎯 OVERALL METRICS:');
            console.log(`   Overall Health: ${report.executiveSummary.overallHealth}`);
            console.log(`   Quality Score: ${report.metrics.qualityScore.overall}/100`);
            console.log(`   - Code Quality: ${report.metrics.qualityScore.codeQuality}/100`);
            console.log(`   - File Organization: ${report.metrics.qualityScore.fileOrganization}/100`);
            console.log(`   - Configuration: ${report.metrics.qualityScore.configuration}/100`);
            
            console.log('\n📝 TOP RECOMMENDATIONS:');
            report.recommendations.slice(0, 5).forEach((rec, idx) => {
                const icon = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
                console.log(`   ${idx + 1}. ${icon} ${rec.title}`);
                console.log(`      ${rec.description}`);
            });
        }
        
        console.log('\n' + '═'.repeat(70));
        console.log('📄 Reports saved in: ./agent-reports/');
        console.log('═'.repeat(70) + '\n');
    }

    /**
     * Get agent status
     */
    getStatus() {
        const status = {
            orchestrator: {
                running: this.startTime !== null && this.endTime === null,
                startTime: this.startTime,
                endTime: this.endTime,
                duration: this.endTime ? this.endTime - this.startTime : null
            },
            agents: {}
        };
        
        Object.keys(this.agents).forEach(agentName => {
            if (this.agents[agentName] && typeof this.agents[agentName].getStatus === 'function') {
                status.agents[agentName] = this.agents[agentName].getStatus();
            }
        });
        
        return status;
    }

    /**
     * Get results
     */
    getResults() {
        return this.results;
    }

    /**
     * Export results to file
     */
    async exportResults(filename = null) {
        const fs = require('fs').promises;
        const path = require('path');
        
        if (!filename) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            filename = `evaluation-results-${timestamp}.json`;
        }
        
        const outputDir = './agent-reports';
        await fs.mkdir(outputDir, { recursive: true });
        
        const fullPath = path.join(outputDir, filename);
        await fs.writeFile(fullPath, JSON.stringify(this.results, null, 2), 'utf8');
        
        this.log('success', `Results exported to: ${fullPath}`);
        
        return fullPath;
    }

    /**
     * Logger helper
     */
    log(level, message, data = null) {
        if (this.logger && typeof this.logger[level] === 'function') {
            this.logger[level]('FileEvaluationOrchestrator', message, data);
        } else if (this.logger) {
            this.logger.log(`[${level.toUpperCase()}] FileEvaluationOrchestrator: ${message}`, data);
        }
    }
}

// Export for Node.js and browser
if (typeof window !== 'undefined') {
    window.FileEvaluationOrchestrator = FileEvaluationOrchestrator;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FileEvaluationOrchestrator;
}

// CLI runner
if (typeof require !== 'undefined' && require.main === module) {
    (async () => {
        console.log('🚀 Starting File Evaluation System...\n');
        
        const orchestrator = new FileEvaluationOrchestrator();
        
        try {
            await orchestrator.initialize();
            await orchestrator.runCompleteEvaluation();
            await orchestrator.exportResults();
            
            console.log('\n✅ Evaluation complete! Check ./agent-reports/ for detailed results.\n');
            process.exit(0);
        } catch (error) {
            console.error('\n❌ Evaluation failed:', error.message);
            console.error(error.stack);
            process.exit(1);
        }
    })();
}
