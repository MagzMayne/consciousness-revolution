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
 * File: example-evaluation.js
 * Declaration ID: IP-4817A5E8-MLL28ZUS
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

/** SIGNED BY MeRLynn - ID: MERLYNN-48719e13 - TIMESTAMP: 2025-12-19T05:53:06.516Z - HASH: 53458fe6 */
/** SIGNED BY AGentR - ID: AGENTR-20baa1e0 - TIMESTAMP: 2025-12-19T05:53:06.516Z - HASH: 53458fe6 */

/**
 * EXAMPLE: Using the File Evaluation System Programmatically
 * 
 * This example demonstrates how to use the file evaluation agents
 * individually or as a complete system.
 */

const FileEvaluationOrchestrator = require('./src/agents/file-evaluation-orchestrator');
const JsCssQualityAgent = require('./src/agents/js-css-quality-agent');
const FileUsageAgent = require('./src/agents/file-usage-agent');
const ConfigComplianceAgent = require('./src/agents/config-compliance-agent');

// Example 1: Using the complete orchestrator
async function exampleFullEvaluation() {
    console.log('=== Example 1: Full Evaluation ===\n');
    
    const orchestrator = new FileEvaluationOrchestrator();
    
    await orchestrator.initialize();
    const results = await orchestrator.runCompleteEvaluation();
    
    console.log('\n✅ Full evaluation completed');
    console.log(`Overall Quality Score: ${results.report.metrics.qualityScore.overall}/100`);
    
    return results;
}

// Example 2: Using individual agents
async function exampleIndividualAgents() {
    console.log('\n=== Example 2: Individual Agents ===\n');
    
    // JS/CSS Quality Agent
    console.log('Running JS/CSS Quality Agent...');
    const codeAgent = new JsCssQualityAgent();
    const codeResults = await codeAgent.analyzeAllFiles();
    console.log(`✓ Found ${codeResults.summary.issuesFound} code issues`);
    
    // File Usage Agent
    console.log('Running File Usage Agent...');
    const fileAgent = new FileUsageAgent();
    const fileResults = await fileAgent.analyzeRepository();
    console.log(`✓ Found ${fileResults.summary.unusedCount} unused files`);
    
    // Configuration Agent
    console.log('Running Configuration Agent...');
    const configAgent = new ConfigComplianceAgent();
    const configResults = await configAgent.analyzeConfigurations();
    console.log(`✓ Found ${configResults.summary.totalIssues} config issues`);
    
    return { codeResults, fileResults, configResults };
}

// Example 3: Custom filtering and analysis
async function exampleCustomAnalysis() {
    console.log('\n=== Example 3: Custom Analysis ===\n');
    
    const codeAgent = new JsCssQualityAgent();
    const results = await codeAgent.analyzeAllFiles();
    
    // Filter only critical issues
    const criticalIssues = [];
    results.javascript.forEach(file => {
        const critical = file.issues.filter(issue => issue.severity === 'critical');
        if (critical.length > 0) {
            criticalIssues.push({ file: file.file, issues: critical });
        }
    });
    
    console.log(`Found ${criticalIssues.length} files with critical issues:`);
    criticalIssues.forEach(item => {
        console.log(`  - ${item.file}: ${item.issues.length} critical issue(s)`);
        item.issues.forEach(issue => {
            console.log(`    • ${issue.message}`);
        });
    });
    
    return criticalIssues;
}

// Example 4: Get status and metrics
async function exampleStatusMonitoring() {
    console.log('\n=== Example 4: Status Monitoring ===\n');
    
    const orchestrator = new FileEvaluationOrchestrator();
    await orchestrator.initialize();
    
    // Get initial status
    console.log('Initial status:');
    console.log(JSON.stringify(orchestrator.getStatus(), null, 2));
    
    // Run evaluation
    await orchestrator.runCompleteEvaluation();
    
    // Get final status
    console.log('\nFinal status:');
    const finalStatus = orchestrator.getStatus();
    console.log(`Duration: ${finalStatus.orchestrator.duration}ms`);
    
    return finalStatus;
}

// Run examples
(async () => {
    const examples = process.argv[2] || 'all';
    
    try {
        switch (examples) {
            case '1':
                await exampleFullEvaluation();
                break;
            case '2':
                await exampleIndividualAgents();
                break;
            case '3':
                await exampleCustomAnalysis();
                break;
            case '4':
                await exampleStatusMonitoring();
                break;
            case 'all':
            default:
                console.log('Running all examples...\n');
                console.log('Note: Running example 1 only to avoid duplication\n');
                await exampleFullEvaluation();
                break;
        }
        
        console.log('\n✨ Examples completed successfully!\n');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error running examples:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
})();
