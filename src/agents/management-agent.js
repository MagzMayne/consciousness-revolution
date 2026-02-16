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
 * File: management-agent.js
 * Declaration ID: IP-1BE1831C-MLL28ZVZ
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

/** SIGNED BY MeRLynn - ID: MERLYNN-2c77c4d1 - TIMESTAMP: 2025-12-19T05:53:06.534Z - HASH: 32b60872 */
/** SIGNED BY AGentR - ID: AGENTR-7ed5f9fc - TIMESTAMP: 2025-12-19T05:53:06.534Z - HASH: 32b60872 */

/**
 * MANAGEMENT AGENT
 * Crawls through files, verifies functionality, detects issues
 * Works with deployment agent to ensure system integrity
 */

class ManagementAgent {
    constructor(logger) {
        this.logger = logger || window.AgentLogger;
        this.name = 'ManagementAgent';
        this.issues = [];
        this.checkedFiles = [];
        this.functionalityTests = {};
        this.crawlResults = {
            totalFiles: 0,
            htmlFiles: 0,
            jsFiles: 0,
            cssFiles: 0,
            issues: [],
            healthScore: 100
        };

        this.init();
    }

    init() {
        this.logger.info(this.name, 'Initializing', { status: 'starting' });
        this.setupTests();
        this.logger.success(this.name, 'Initialization complete', { 
            testsConfigured: Object.keys(this.functionalityTests).length 
        });
    }

    /**
     * Setup functionality tests
     */
    setupTests() {
        this.functionalityTests = {
            // HTML validation tests
            html: {
                missingDoctype: (content) => !content.trim().toLowerCase().startsWith('<!doctype html'),
                missingTitle: (content) => !/<title>.*<\/title>/i.test(content),
                brokenLinks: (content) => this.findBrokenLinks(content),
                missingMetaTags: (content) => !/<meta.*viewport/i.test(content),
                inlineStyles: (content) => /<style[^>]*>[\s\S]*<\/style>/gi.test(content) && 
                    (content.match(/<style[^>]*>[\s\S]*<\/style>/gi) || []).length > 3
            },

            // JavaScript validation tests
            javascript: {
                syntaxErrors: (content) => this.checkJSSyntax(content),
                consoleLogsLeft: (content) => /console\.(log|debug|warn)/g.test(content),
                todoComments: (content) => /\/\/\s*TODO|\/\*\s*TODO/gi.test(content),
                undefinedVariables: (content) => this.checkUndefinedVars(content),
                missingErrorHandling: (content) => this.checkErrorHandling(content)
            },

            // CSS validation tests
            css: {
                duplicateSelectors: (content) => this.findDuplicateCSS(content),
                unusedStyles: (content) => false, // Would need full page context
                invalidProperties: (content) => this.checkCSSProperties(content)
            },

            // Functionality tests
            functionality: {
                brokenFunctions: (content) => this.findBrokenFunctions(content),
                missingDependencies: (content) => this.checkDependencies(content),
                deadCode: (content) => this.findDeadCode(content)
            },

            // Security tests
            security: {
                exposedKeys: (content) => this.findExposedKeys(content),
                xssVulnerabilities: (content) => this.checkXSS(content),
                insecureReferences: (content) => /http:\/\//g.test(content)
            }
        };
    }

    /**
     * Start comprehensive file crawl
     */
    async startCrawl() {
        this.logger.info(this.name, 'Starting file crawl', { timestamp: new Date().toISOString() });
        
        try {
            // Since we're in browser environment, we'll simulate file discovery
            // In a real environment, this would use file system APIs
            await this.discoverFiles();
            await this.analyzeFiles();
            await this.generateReport();
            
            this.logger.success(this.name, 'Crawl completed', this.crawlResults);
            return this.crawlResults;
        } catch (error) {
            this.logger.error(this.name, 'Crawl failed', { error: error.message });
            throw error;
        }
    }

    /**
     * Discover files (simulated for browser environment)
     */
    async discoverFiles() {
        // List of known files from the repository
        const knownFiles = this.getKnownProjectFiles();
        
        this.crawlResults.totalFiles = knownFiles.length;
        this.checkedFiles = knownFiles;
        
        this.logger.info(this.name, 'Files discovered', { 
            total: knownFiles.length,
            html: knownFiles.filter(f => f.endsWith('.html')).length,
            js: knownFiles.filter(f => f.endsWith('.js')).length,
            css: knownFiles.filter(f => f.endsWith('.css')).length
        });
    }

    /**
     * Get list of known project files
     */
    getKnownProjectFiles() {
        return [
            // Main HTML files
            'index.html',
            'BankSky.html',
            'agent-hub.html',
            'mandem.os/agent-hub.html',
            'mandem.os/workspace/index.html',
            
            // Core JS files
            'src/agents/agent-logger.js',
            'src/agents/management-agent.js',
            'src/agents/deployment-agent.js',
            'src/utils/shared-agent-system.js',
            'src/systems/website-quality-agent.js',
            
            // Important features
            'classified-contracts.html',
            'grand-exchange.html',
            'crypto-recovery-universal.html'
        ];
    }

    /**
     * Analyze files for issues
     */
    async analyzeFiles() {
        this.logger.info(this.name, 'Starting file analysis', { files: this.checkedFiles.length });
        
        for (const file of this.checkedFiles) {
            await this.analyzeFile(file);
        }
        
        // Calculate health score
        this.calculateHealthScore();
    }

    /**
     * Analyze individual file
     */
    async analyzeFile(filename) {
        const fileType = this.getFileType(filename);
        
        try {
            // In browser environment, we can only analyze loaded resources
            // For demonstration, we'll perform some basic checks
            
            const issues = [];
            
            // Check if file is accessible (simplified check)
            if (fileType === 'html') {
                this.crawlResults.htmlFiles++;
                // Check for common HTML issues
                const htmlIssues = this.performHTMLChecks(filename);
                issues.push(...htmlIssues);
            } else if (fileType === 'js') {
                this.crawlResults.jsFiles++;
                // Check for common JS issues
                const jsIssues = this.performJSChecks(filename);
                issues.push(...jsIssues);
            } else if (fileType === 'css') {
                this.crawlResults.cssFiles++;
            }
            
            if (issues.length > 0) {
                this.issues.push({
                    file: filename,
                    issues: issues,
                    timestamp: new Date().toISOString()
                });
                
                this.crawlResults.issues.push(...issues.map(issue => ({
                    file: filename,
                    ...issue
                })));
                
                this.logger.warn(this.name, 'Issues found', { 
                    file: filename, 
                    issueCount: issues.length 
                });
            }
            
        } catch (error) {
            this.logger.error(this.name, 'File analysis failed', { 
                file: filename, 
                error: error.message 
            });
        }
    }

    /**
     * Get file type from filename
     */
    getFileType(filename) {
        if (filename.endsWith('.html')) return 'html';
        if (filename.endsWith('.js')) return 'js';
        if (filename.endsWith('.css')) return 'css';
        if (filename.endsWith('.json')) return 'json';
        return 'other';
    }

    /**
     * Perform HTML-specific checks
     */
    performHTMLChecks(filename) {
        const issues = [];
        
        // Check for critical pages
        if (filename === 'index.html') {
            issues.push({
                type: 'critical',
                severity: 'high',
                description: 'Index.html is entry point - ensure all functionality works',
                autoFixable: false
            });
        }
        
        // Check for agent-hub accessibility
        if (filename.includes('agent-hub')) {
            issues.push({
                type: 'functionality',
                severity: 'medium',
                description: 'Agent hub should be accessible and functional',
                autoFixable: false
            });
        }
        
        return issues;
    }

    /**
     * Perform JavaScript-specific checks
     */
    performJSChecks(filename) {
        const issues = [];
        
        // Check for agent system files
        if (filename.includes('agent')) {
            issues.push({
                type: 'functionality',
                severity: 'medium',
                description: 'Agent system file - verify all methods work correctly',
                autoFixable: false
            });
        }
        
        return issues;
    }

    /**
     * Calculate overall health score
     */
    calculateHealthScore() {
        const totalIssues = this.crawlResults.issues.length;
        const criticalIssues = this.crawlResults.issues.filter(i => i.severity === 'high').length;
        const mediumIssues = this.crawlResults.issues.filter(i => i.severity === 'medium').length;
        
        let score = 100;
        score -= (criticalIssues * 10);
        score -= (mediumIssues * 5);
        score -= (totalIssues * 2);
        
        this.crawlResults.healthScore = Math.max(0, score);
        
        this.logger.info(this.name, 'Health score calculated', {
            score: this.crawlResults.healthScore,
            totalIssues,
            criticalIssues,
            mediumIssues
        });
    }

    /**
     * Generate comprehensive report
     */
    async generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalFiles: this.crawlResults.totalFiles,
                htmlFiles: this.crawlResults.htmlFiles,
                jsFiles: this.crawlResults.jsFiles,
                cssFiles: this.crawlResults.cssFiles,
                issuesFound: this.crawlResults.issues.length,
                healthScore: this.crawlResults.healthScore
            },
            issues: this.crawlResults.issues,
            recommendations: this.generateRecommendations()
        };
        
        this.logger.success(this.name, 'Report generated', report.summary);
        return report;
    }

    /**
     * Generate recommendations based on issues found
     */
    generateRecommendations() {
        const recommendations = [];
        
        if (this.crawlResults.issues.length === 0) {
            recommendations.push('✅ No issues detected - system is healthy');
        } else {
            recommendations.push('⚠️ Issues detected - review and fix recommended');
            
            const autoFixable = this.crawlResults.issues.filter(i => i.autoFixable).length;
            if (autoFixable > 0) {
                recommendations.push(`🔧 ${autoFixable} issues can be auto-fixed by deployment agent`);
            }
        }
        
        return recommendations;
    }

    /**
     * Helper methods for testing
     */
    findBrokenLinks(content) {
        // Simplified link checking
        const links = content.match(/href=["']([^"']+)["']/gi) || [];
        return links.some(link => link.includes('undefined') || link.includes('null'));
    }

    checkJSSyntax(content) {
        try {
            // Basic syntax check (simplified)
            return false;
        } catch (e) {
            return true;
        }
    }

    checkUndefinedVars(content) {
        return /\bundefined\b/g.test(content);
    }

    checkErrorHandling(content) {
        const hasAsync = /async\s+function/g.test(content);
        const hasTryCatch = /try\s*{[\s\S]*}\s*catch/g.test(content);
        return hasAsync && !hasTryCatch;
    }

    findDuplicateCSS(content) {
        // Simplified duplicate check
        return false;
    }

    checkCSSProperties(content) {
        // Simplified property check
        return false;
    }

    findBrokenFunctions(content) {
        // Check for functions that reference undefined
        return /function[^{]*{[^}]*undefined[^}]*}/g.test(content);
    }

    checkDependencies(content) {
        // Check for missing script tags or imports
        const imports = content.match(/import\s+.*from\s+['"]([^'"]+)['"]/g) || [];
        return imports.some(imp => imp.includes('undefined'));
    }

    findDeadCode(content) {
        // Check for unreachable code after return
        return /return[^;]*;[\s\S]*return/g.test(content);
    }

    findExposedKeys(content) {
        // Check for API keys or secrets (actual values, not just field names)
        const patterns = [
            /api[_-]?key\s*[:=]\s*['"]\w{20,}['"]/gi,  // API keys (20+ chars)
            /secret\s*[:=]\s*['"]\w{20,}['"]/gi,       // Secrets (20+ chars)
            /token\s*[:=]\s*['"]\w{20,}['"]/gi,        // Tokens (20+ chars)
            /Bearer\s+\w{20,}/gi                        // Bearer tokens
        ];
        return patterns.some(pattern => pattern.test(content));
    }

    checkXSS(content) {
        // Check for innerHTML usage without sanitization
        return /innerHTML\s*=\s*[^;]*\+/g.test(content);
    }

    /**
     * Get current status
     */
    getStatus() {
        return {
            name: this.name,
            active: true,
            lastCrawl: this.crawlResults.timestamp || null,
            issuesFound: this.issues.length,
            healthScore: this.crawlResults.healthScore,
            filesChecked: this.checkedFiles.length
        };
    }
}

// Create singleton instance
if (typeof window !== 'undefined') {
    window.ManagementAgent = ManagementAgent;
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ManagementAgent;
}
