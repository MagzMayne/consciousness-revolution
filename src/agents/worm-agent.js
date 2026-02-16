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
 * File: worm-agent.js
 * Declaration ID: IP-125C21B4-MLL28ZW0
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * @aul-enabled
 * WORM AGENT - Crawls through code line-by-line
 * Acts like a worm, moving through every line, ingesting data, repairing issues
 */

class WormAgent {
    constructor(id, logger) {
        this.id = id;
        this.logger = logger || window.AgentLogger;
        this.name = `WormAgent-${id}`;
        this.position = { file: null, line: 0, column: 0 };
        this.status = 'idle'; // idle, crawling, analyzing, repairing
        this.memory = {
            filesScanned: [],
            linesProcessed: 0,
            issuesFound: [],
            repairsMade: [],
            crossLinks: new Map()
        };
        this.knownPatterns = this.loadKnownPatterns();
        this.active = false;
    }

    /**
     * Load known working patterns from the codebase
     */
    loadKnownPatterns() {
        return {
            // Function patterns
            functionDeclarations: /function\s+(\w+)\s*\(/g,
            arrowFunctions: /const\s+(\w+)\s*=\s*\([^)]*\)\s*=>/g,
            asyncFunctions: /async\s+function\s+(\w+)/g,
            
            // Import/Export patterns
            imports: /import\s+.*from\s+['"]([^'"]+)['"]/g,
            exports: /export\s+(default\s+)?(class|function|const|let|var)\s+(\w+)/g,
            
            // Common issues
            console: /console\.(log|warn|error|debug)/g,
            todos: /\/\/\s*TODO|\/\*\s*TODO/gi,
            fixmes: /\/\/\s*FIXME|\/\*\s*FIXME/gi,
            
            // Security patterns
            security: {
                apiKeys: /(api[_-]?key|apikey|api_secret|access[_-]?token)\s*[:=]\s*['"][^'"]+['"]/gi,
                hardcodedPasswords: /(password|passwd|pwd)\s*[:=]\s*['"][^'"]+['"]/gi
            },
            apiKeys: /(api[_-]?key|apikey|api_secret|access[_-]?token)\s*[:=]\s*['"][^'"]+['"]/gi,
            hardcodedPasswords: /(password|passwd|pwd)\s*[:=]\s*['"][^'"]+['"]/gi,
            
            // Cross-reference patterns
            functionCalls: /(\w+)\s*\(/g,
            variableReferences: /\b(\w+)\b/g,
            classUsage: /new\s+(\w+)\s*\(/g,
            
            // Performance patterns
            syncOperations: /\.sync\(/g,
            blockingCalls: /(alert|confirm|prompt)\s*\(/g,
            
            // Best practices
            strictMode: /'use strict'/,
            docComments: /\/\*\*[\s\S]*?\*\//g
        };
    }

    /**
     * Start the worm agent
     */
    async start(files) {
        this.active = true;
        this.status = 'crawling';
        this.logger.info(this.name, 'Starting worm crawl', { 
            fileCount: files.length,
            agentId: this.id 
        });

        for (const file of files) {
            if (!this.active) break;
            await this.processFile(file);
        }

        this.status = 'idle';
        this.logger.success(this.name, 'Crawl complete', {
            linesProcessed: this.memory.linesProcessed,
            issuesFound: this.memory.issuesFound.length,
            repairsMade: this.memory.repairsMade.length
        });

        return this.getReport();
    }

    /**
     * Process a single file line by line
     */
    async processFile(file) {
        this.position.file = file.path;
        this.position.line = 0;
        this.logger.info(this.name, `Processing file: ${file.path}`);

        const lines = file.content.split('\n');
        const fileContext = {
            functions: new Set(),
            variables: new Set(),
            imports: new Set(),
            exports: new Set()
        };

        // First pass: Collect declarations
        for (let i = 0; i < lines.length; i++) {
            this.position.line = i + 1;
            await this.collectDeclarations(lines[i], fileContext);
        }

        // Second pass: Analyze each line
        for (let i = 0; i < lines.length; i++) {
            this.position.line = i + 1;
            this.position.column = 0;
            
            await this.analyzeLine(lines[i], i, fileContext, file);
            this.memory.linesProcessed++;

            // Simulate worm movement (can be visualized)
            if (this.memory.linesProcessed % 100 === 0) {
                await this.sleep(10); // Allow visualization updates
            }
        }

        this.memory.filesScanned.push(file.path);
        
        // Third pass: Cross-link validation
        await this.validateCrossLinks(file, fileContext);
    }

    /**
     * Collect function and variable declarations
     */
    async collectDeclarations(line, context) {
        // Functions
        let match;
        while ((match = this.knownPatterns.functionDeclarations.exec(line)) !== null) {
            context.functions.add(match[1]);
        }
        while ((match = this.knownPatterns.arrowFunctions.exec(line)) !== null) {
            context.variables.add(match[1]);
        }

        // Imports
        this.knownPatterns.imports.lastIndex = 0;
        while ((match = this.knownPatterns.imports.exec(line)) !== null) {
            context.imports.add(match[1]);
        }

        // Exports
        this.knownPatterns.exports.lastIndex = 0;
        while ((match = this.knownPatterns.exports.exec(line)) !== null) {
            context.exports.add(match[3]);
        }
    }

    /**
     * Analyze a single line of code
     */
    async analyzeLine(line, lineNum, fileContext, file) {
        const issues = [];

        // Check for console statements
        if (this.knownPatterns.console.test(line)) {
            issues.push({
                type: 'console',
                line: lineNum + 1,
                message: 'Console statement found',
                severity: 'low',
                autoFix: true
            });
        }

        // Check for TODOs
        if (this.knownPatterns.todos.test(line)) {
            issues.push({
                type: 'todo',
                line: lineNum + 1,
                message: 'TODO comment found',
                severity: 'low',
                autoFix: false
            });
        }

        // Check for security issues
        this.knownPatterns.apiKeys.lastIndex = 0;
        if (this.knownPatterns.apiKeys.test(line)) {
            issues.push({
                type: 'security',
                line: lineNum + 1,
                message: 'Potential exposed API key',
                severity: 'critical',
                autoFix: true
            });
        }

        this.knownPatterns.hardcodedPasswords.lastIndex = 0;
        if (this.knownPatterns.hardcodedPasswords.test(line)) {
            issues.push({
                type: 'security',
                line: lineNum + 1,
                message: 'Hardcoded password detected',
                severity: 'critical',
                autoFix: true
            });
        }

        // Check for blocking operations
        if (this.knownPatterns.blockingCalls.test(line)) {
            issues.push({
                type: 'performance',
                line: lineNum + 1,
                message: 'Blocking call detected',
                severity: 'medium',
                autoFix: false
            });
        }

        // Store issues
        if (issues.length > 0) {
            issues.forEach(issue => {
                this.memory.issuesFound.push({
                    ...issue,
                    file: file.path,
                    content: line.trim()
                });
            });

            // Auto-repair if possible
            for (const issue of issues) {
                if (issue.autoFix) {
                    await this.repairIssue(issue, line, file);
                }
            }
        }
    }

    /**
     * Repair an issue automatically
     */
    async repairIssue(issue, line, file) {
        let repairedLine = line;

        switch (issue.type) {
            case 'console':
                // Comment out console statements
                repairedLine = line.replace(/console\.(log|warn|error|debug)/, '// console.$1');
                break;

            case 'security':
                // Replace exposed secrets with environment variables
                if (issue.message.includes('API key')) {
                    repairedLine = line.replace(
                        /(api[_-]?key|apikey|api_secret)\s*[:=]\s*['"]([^'"]+)['"]/gi,
                        '$1: process.env.API_KEY || "$2"'
                    );
                } else if (issue.message.includes('password')) {
                    repairedLine = line.replace(
                        /(password|passwd|pwd)\s*[:=]\s*['"]([^'"]+)['"]/gi,
                        '$1: process.env.PASSWORD || "$2"'
                    );
                }
                break;
        }

        if (repairedLine !== line) {
            this.memory.repairsMade.push({
                file: file.path,
                line: issue.line,
                original: line.trim(),
                repaired: repairedLine.trim(),
                type: issue.type
            });

            this.logger.success(this.name, `Repaired ${issue.type} issue`, {
                file: file.path,
                line: issue.line
            });
        }
    }

    /**
     * Validate cross-links between files
     */
    async validateCrossLinks(file, fileContext) {
        const fileKey = file.path;
        
        // Store this file's exports for cross-referencing
        this.memory.crossLinks.set(fileKey, {
            exports: Array.from(fileContext.exports),
            functions: Array.from(fileContext.functions),
            imports: Array.from(fileContext.imports)
        });

        // Check if imports are valid
        for (const importPath of fileContext.imports) {
            const resolvedPath = this.resolvePath(importPath, file.path);
            if (!this.memory.crossLinks.has(resolvedPath)) {
                this.memory.issuesFound.push({
                    type: 'missing-dependency',
                    file: file.path,
                    message: `Import not found: ${importPath}`,
                    severity: 'high',
                    autoFix: false
                });
            }
        }
    }

    /**
     * Resolve relative import paths
     */
    resolvePath(importPath, currentFile) {
        // Simple resolution - would need more sophistication in production
        if (importPath.startsWith('./') || importPath.startsWith('../')) {
            const parts = currentFile.split('/');
            parts.pop(); // Remove filename
            return parts.join('/') + '/' + importPath;
        }
        return importPath;
    }

    /**
     * Stop the worm agent
     */
    stop() {
        this.active = false;
        this.status = 'idle';
        this.logger.info(this.name, 'Stopping worm agent');
    }

    /**
     * Get agent report
     */
    getReport() {
        return {
            agentId: this.id,
            status: this.status,
            position: { ...this.position },
            statistics: {
                filesScanned: this.memory.filesScanned.length,
                linesProcessed: this.memory.linesProcessed,
                issuesFound: this.memory.issuesFound.length,
                repairsMade: this.memory.repairsMade.length,
                crossLinksValidated: this.memory.crossLinks.size
            },
            issues: this.memory.issuesFound,
            repairs: this.memory.repairsMade,
            crossLinks: Array.from(this.memory.crossLinks.entries())
        };
    }

    /**
     * Get current position for visualization
     */
    getPosition() {
        return {
            agentId: this.id,
            file: this.position.file,
            line: this.position.line,
            column: this.position.column,
            status: this.status
        };
    }

    /**
     * Sleep utility for visualization
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WormAgent;
}
if (typeof window !== 'undefined') {
    window.WormAgent = WormAgent;
}
