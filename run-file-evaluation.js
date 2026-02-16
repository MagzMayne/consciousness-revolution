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
 * File: run-file-evaluation.js
 * Declaration ID: IP-174512C-MLL28ZVU
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

/** SIGNED BY MeRLynn - ID: MERLYNN-5d1fefc9 - TIMESTAMP: 2025-12-19T05:53:06.531Z - HASH: 3211e79c */
/** SIGNED BY AGentR - ID: AGENTR-676be904 - TIMESTAMP: 2025-12-19T05:53:06.531Z - HASH: 3211e79c */

#!/usr/bin/env node

/**
 * FILE EVALUATION CLI RUNNER
 * Convenient script to run the complete file evaluation system
 */

const FileEvaluationOrchestrator = require('./src/agents/file-evaluation-orchestrator');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
    help: args.includes('--help') || args.includes('-h'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    exportOnly: args.includes('--export-only'),
    quiet: args.includes('--quiet') || args.includes('-q')
};

// Display help
if (options.help) {
    console.log(`
File Evaluation System - Repository Analysis Tool

USAGE:
    node run-file-evaluation.js [OPTIONS]

OPTIONS:
    -h, --help          Show this help message
    -v, --verbose       Show detailed logging
    -q, --quiet         Minimal output
    --export-only       Skip analysis, only export existing results

DESCRIPTION:
    Analyzes JavaScript, CSS, and configuration files in the repository.
    Excludes HTML files from main repository structure.
    
    The system includes:
    - JS/CSS Quality Agent: Code quality, performance, responsiveness
    - File Usage Agent: Unused/redundant file detection
    - Configuration Agent: Config file compliance checking
    - Report Generator: Detailed reports and recommendations

OUTPUT:
    Reports are saved to ./agent-reports/ in multiple formats:
    - JSON: Machine-readable data
    - Markdown: Human-readable summary
    - HTML: Interactive web report

EXAMPLES:
    node run-file-evaluation.js
    node run-file-evaluation.js --verbose
    node run-file-evaluation.js --quiet
`);
    process.exit(0);
}

// Main execution
(async () => {
    if (!options.quiet) {
        console.log('╔═══════════════════════════════════════════════════════════════╗');
        console.log('║         FILE EVALUATION SYSTEM - Repository Analysis         ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝\n');
    }
    
    const orchestrator = new FileEvaluationOrchestrator();
    
    try {
        if (options.exportOnly) {
            if (!options.quiet) {
                console.log('📤 Exporting existing results...\n');
            }
            await orchestrator.exportResults();
        } else {
            // Initialize and run complete evaluation
            await orchestrator.initialize();
            await orchestrator.runCompleteEvaluation();
            
            // Export results
            if (!options.quiet) {
                console.log('\n📤 Exporting results...');
            }
            const exportPath = await orchestrator.exportResults();
            
            if (!options.quiet) {
                console.log(`\n✅ Results exported to: ${exportPath}`);
            }
        }
        
        if (!options.quiet) {
            console.log('\n╔═══════════════════════════════════════════════════════════════╗');
            console.log('║                    EVALUATION COMPLETE                        ║');
            console.log('╚═══════════════════════════════════════════════════════════════╝');
            console.log('\n📂 Check ./agent-reports/ for detailed analysis reports');
            console.log('📊 Review recommendations and action items\n');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ ERROR: Evaluation failed');
        console.error(`   ${error.message}\n`);
        
        if (options.verbose) {
            console.error('Stack trace:');
            console.error(error.stack);
        }
        
        process.exit(1);
    }
})();
