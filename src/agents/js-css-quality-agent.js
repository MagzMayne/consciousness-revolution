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
 * File: js-css-quality-agent.js
 * Declaration ID: IP-24CB2A6E-MLL28ZVZ
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

/** SIGNED BY MeRLynn - ID: MERLYNN-1054b90b - TIMESTAMP: 2025-12-19T05:53:06.533Z - HASH: 29de3f11 */
/** SIGNED BY AGentR - ID: AGENTR-7ca966be - TIMESTAMP: 2025-12-19T05:53:06.533Z - HASH: 29de3f11 */

/**
 * JS/CSS QUALITY AGENT
 * Reviews JavaScript and CSS files for code quality, performance, and responsiveness
 * Excludes HTML files from main repository structure
 */

class JsCssQualityAgent {
    constructor(logger = null) {
        this.logger = logger || console;
        this.results = {
            javascript: [],
            css: [],
            summary: {
                totalFiles: 0,
                issuesFound: 0,
                criticalIssues: 0,
                warnings: 0,
                suggestions: 0
            }
        };
        
        // Configuration constants
        this.MAGIC_NUMBER_MIN_DIGITS = 4;
        this.MAGIC_NUMBER_THRESHOLD = 3;
        this.DOC_COVERAGE_MIN_FUNCTIONS = 5;
        this.DOC_COVERAGE_THRESHOLD = 0.5;
        this.BYTES_PER_KB = 1024;
        
        this.codingStandards = {
            js: {
                maxLineLength: 120,
                maxFunctionLength: 50,
                maxFileSize: 500 * this.BYTES_PER_KB, // 500KB
                requireSemicolons: true,
                requireStrict: true,
                noConsoleLog: true
            },
            css: {
                maxFileSize: 200 * this.BYTES_PER_KB, // 200KB
                requireMinification: false,
                checkResponsiveness: true,
                checkBrowserPrefixes: true
            }
        };
    }

    /**
     * Start comprehensive JS/CSS analysis
     */
    async analyzeAllFiles() {
        this.log('info', 'Starting JS/CSS quality analysis...');
        
        try {
            // Find all JS and CSS files (excluding HTML)
            const jsFiles = await this.findFiles('**/*.js', ['node_modules', '.git', 'vendor', 'dist']);
            const cssFiles = await this.findFiles('**/*.css', ['node_modules', '.git', 'vendor', 'dist']);

            this.log('info', `Found ${jsFiles.length} JS files and ${cssFiles.length} CSS files`);

            // Analyze JavaScript files
            for (const file of jsFiles) {
                await this.analyzeJavaScriptFile(file);
            }

            // Analyze CSS files
            for (const file of cssFiles) {
                await this.analyzeCSSFile(file);
            }

            // Generate summary
            this.generateSummary();

            this.log('success', `Analysis complete. Found ${this.results.summary.issuesFound} issues.`);
            
            return this.results;
        } catch (error) {
            this.log('error', `Analysis failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Find files matching pattern
     */
    async findFiles(pattern, excludeDirs = []) {
        const fs = require('fs').promises;
        const path = require('path');
        const files = [];

        async function walk(dir) {
            try {
                const entries = await fs.readdir(dir, { withFileTypes: true });
                
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    
                    if (entry.isDirectory()) {
                        if (!excludeDirs.includes(entry.name) && !entry.name.startsWith('.')) {
                            await walk(fullPath);
                        }
                    } else if (entry.isFile()) {
                        // Match pattern
                        if (pattern.includes('*.js') && entry.name.endsWith('.js')) {
                            files.push(fullPath);
                        } else if (pattern.includes('*.css') && entry.name.endsWith('.css')) {
                            files.push(fullPath);
                        }
                    }
                }
            } catch (error) {
                // Skip directories we can't read
            }
        }

        await walk('.');
        return files;
    }

    /**
     * Analyze JavaScript file
     */
    async analyzeJavaScriptFile(filePath) {
        const fs = require('fs').promises;
        const issues = [];
        
        try {
            const content = await fs.readFile(filePath, 'utf8');
            const stats = await fs.stat(filePath);
            const lines = content.split('\n');

            // File size check
            if (stats.size > this.codingStandards.js.maxFileSize) {
                issues.push({
                    severity: 'warning',
                    type: 'performance',
                    message: `File size (${(stats.size / 1024).toFixed(1)}KB) exceeds recommended maximum (${this.codingStandards.js.maxFileSize / 1024}KB)`,
                    suggestion: 'Consider code splitting or refactoring'
                });
            }

            // Coding standards checks
            this.checkJavaScriptCodingStandards(content, lines, filePath, issues);

            // Performance checks
            this.checkJavaScriptPerformance(content, issues);

            // Security checks
            this.checkJavaScriptSecurity(content, issues);

            // Best practices
            this.checkJavaScriptBestPractices(content, lines, issues);

            if (issues.length > 0) {
                this.results.javascript.push({
                    file: filePath,
                    issues: issues,
                    linesOfCode: lines.length,
                    fileSize: stats.size
                });

                // Update summary
                this.results.summary.totalFiles++;
                this.results.summary.issuesFound += issues.length;
                this.results.summary.criticalIssues += issues.filter(i => i.severity === 'critical').length;
                this.results.summary.warnings += issues.filter(i => i.severity === 'warning').length;
                this.results.summary.suggestions += issues.filter(i => i.severity === 'suggestion').length;
            }
        } catch (error) {
            this.log('error', `Failed to analyze ${filePath}: ${error.message}`);
        }
    }

    /**
     * Check JavaScript coding standards
     */
    checkJavaScriptCodingStandards(content, lines, filePath, issues) {
        // Check for long lines
        lines.forEach((line, index) => {
            if (line.length > this.codingStandards.js.maxLineLength) {
                issues.push({
                    severity: 'suggestion',
                    type: 'coding-standard',
                    line: index + 1,
                    message: `Line exceeds ${this.codingStandards.js.maxLineLength} characters (${line.length})`,
                    suggestion: 'Break long lines for better readability'
                });
            }
        });

        // Check for console.log in production code (excluding test files)
        if (!filePath.includes('test') && this.codingStandards.js.noConsoleLog) {
            const consoleCount = (content.match(/console\.(log|debug|info)/g) || []).length;
            if (consoleCount > 0) {
                issues.push({
                    severity: 'warning',
                    type: 'coding-standard',
                    message: `Found ${consoleCount} console.log/debug/info statements`,
                    suggestion: 'Remove console statements or use proper logging library'
                });
            }
        }

        // Check for 'use strict'
        if (this.codingStandards.js.requireStrict && !content.includes("'use strict'") && !content.includes('"use strict"')) {
            if (!content.includes('class ') && !content.includes('import ') && !content.includes('export ')) {
                issues.push({
                    severity: 'suggestion',
                    type: 'coding-standard',
                    message: 'Missing "use strict" directive',
                    suggestion: 'Add "use strict" at the top of the file'
                });
            }
        }

        // Check for var usage (should use let/const)
        const varCount = (content.match(/\bvar\s+\w+/g) || []).length;
        if (varCount > 0) {
            issues.push({
                severity: 'suggestion',
                type: 'coding-standard',
                message: `Found ${varCount} var declarations`,
                suggestion: 'Use let or const instead of var for better scoping'
            });
        }

        // Check for magic numbers
        const magicNumberPattern = new RegExp(`[^a-zA-Z0-9_](\\d{${this.MAGIC_NUMBER_MIN_DIGITS},})[^a-zA-Z0-9_]`, 'g');
        const magicNumbers = content.match(magicNumberPattern);
        if (magicNumbers && magicNumbers.length > this.MAGIC_NUMBER_THRESHOLD) {
            issues.push({
                severity: 'suggestion',
                type: 'coding-standard',
                message: 'Multiple magic numbers found',
                suggestion: 'Consider extracting numbers to named constants'
            });
        }
    }

    /**
     * Check JavaScript performance
     */
    checkJavaScriptPerformance(content, issues) {
        // Check for synchronous operations that should be async
        const syncOperations = [
            { pattern: /readFileSync/g, message: 'readFileSync' },
            { pattern: /writeFileSync/g, message: 'writeFileSync' },
            { pattern: /execSync/g, message: 'execSync' }
        ];

        syncOperations.forEach(({ pattern, message }) => {
            if (pattern.test(content)) {
                issues.push({
                    severity: 'warning',
                    type: 'performance',
                    message: `Using ${message} (blocking operation)`,
                    suggestion: `Consider using async version for better performance`
                });
            }
        });

        // Check for nested loops
        const nestedLoops = content.match(/for\s*\([^)]*\)\s*{[^}]*for\s*\([^)]*\)/g);
        if (nestedLoops && nestedLoops.length > 2) {
            issues.push({
                severity: 'warning',
                type: 'performance',
                message: 'Multiple nested loops detected',
                suggestion: 'Consider algorithm optimization to reduce complexity'
            });
        }

        // Check for large object literals
        const largeObjects = content.match(/\{[^}]{500,}\}/g);
        if (largeObjects && largeObjects.length > 0) {
            issues.push({
                severity: 'suggestion',
                type: 'performance',
                message: 'Large object literals found',
                suggestion: 'Consider breaking into smaller objects or loading dynamically'
            });
        }

        // Check for DOM queries in loops
        if (content.includes('querySelector') || content.includes('getElementById')) {
            const domInLoops = content.match(/for\s*\([^)]*\)\s*{[^}]*(querySelector|getElementById|getElementsBy)/g);
            if (domInLoops && domInLoops.length > 0) {
                issues.push({
                    severity: 'warning',
                    type: 'performance',
                    message: 'DOM queries inside loops detected',
                    suggestion: 'Cache DOM references outside loops'
                });
            }
        }
    }

    /**
     * Check JavaScript security
     */
    checkJavaScriptSecurity(content, issues) {
        // Check for eval usage
        if (content.includes('eval(')) {
            issues.push({
                severity: 'critical',
                type: 'security',
                message: 'eval() usage detected',
                suggestion: 'Remove eval() - it\'s a serious security risk'
            });
        }

        // Check for innerHTML without sanitization
        if (content.includes('innerHTML') && !content.includes('DOMPurify') && !content.includes('sanitize')) {
            issues.push({
                severity: 'warning',
                type: 'security',
                message: 'innerHTML usage without apparent sanitization',
                suggestion: 'Use textContent or sanitize HTML with DOMPurify'
            });
        }

        // Check for document.write
        if (content.includes('document.write')) {
            issues.push({
                severity: 'warning',
                type: 'security',
                message: 'document.write() usage detected',
                suggestion: 'Use DOM manipulation methods instead'
            });
        }

        // Check for hardcoded credentials patterns
        const credentialPatterns = [
            /password\s*=\s*['"][^'"]{5,}['"]/i,
            /apikey\s*=\s*['"][^'"]{10,}['"]/i,
            /secret\s*=\s*['"][^'"]{10,}['"]/i,
            /token\s*=\s*['"][^'"]{20,}['"]/i
        ];

        credentialPatterns.forEach(pattern => {
            if (pattern.test(content)) {
                issues.push({
                    severity: 'critical',
                    type: 'security',
                    message: 'Potential hardcoded credentials detected',
                    suggestion: 'Move credentials to environment variables'
                });
            }
        });
    }

    /**
     * Check JavaScript best practices
     */
    checkJavaScriptBestPractices(content, lines, issues) {
        // Check for proper error handling
        const tryBlocks = (content.match(/try\s*{/g) || []).length;
        const catchBlocks = (content.match(/catch\s*\(/g) || []).length;
        
        if (tryBlocks > catchBlocks) {
            issues.push({
                severity: 'warning',
                type: 'best-practice',
                message: 'Unmatched try blocks (missing catch)',
                suggestion: 'Ensure all try blocks have catch handlers'
            });
        }

        // Check for async/await without try-catch
        const asyncFunctions = (content.match(/async\s+function/g) || []).length;
        if (asyncFunctions > 0 && catchBlocks === 0) {
            issues.push({
                severity: 'suggestion',
                type: 'best-practice',
                message: 'Async functions without error handling',
                suggestion: 'Add try-catch blocks to async functions'
            });
        }

        // Check for proper function documentation
        const functionCount = (content.match(/function\s+\w+/g) || []).length + 
                            (content.match(/const\s+\w+\s*=\s*(async\s+)?\(/g) || []).length;
        const docComments = (content.match(/\/\*\*[\s\S]*?\*\//g) || []).length;
        
        if (functionCount > this.DOC_COVERAGE_MIN_FUNCTIONS && 
            docComments < functionCount * this.DOC_COVERAGE_THRESHOLD) {
            issues.push({
                severity: 'suggestion',
                type: 'best-practice',
                message: 'Insufficient function documentation',
                suggestion: 'Add JSDoc comments to public functions'
            });
        }

        // Check for TODO/FIXME comments
        const todoComments = (content.match(/\/\/\s*(TODO|FIXME|HACK)/gi) || []).length;
        if (todoComments > 0) {
            issues.push({
                severity: 'suggestion',
                type: 'best-practice',
                message: `Found ${todoComments} TODO/FIXME comments`,
                suggestion: 'Address TODO/FIXME comments before production'
            });
        }
    }

    /**
     * Analyze CSS file
     */
    async analyzeCSSFile(filePath) {
        const fs = require('fs').promises;
        const issues = [];
        
        try {
            const content = await fs.readFile(filePath, 'utf8');
            const stats = await fs.stat(filePath);
            const lines = content.split('\n');

            // File size check
            if (stats.size > this.codingStandards.css.maxFileSize) {
                issues.push({
                    severity: 'warning',
                    type: 'performance',
                    message: `File size (${(stats.size / 1024).toFixed(1)}KB) exceeds recommended maximum (${this.codingStandards.css.maxFileSize / 1024}KB)`,
                    suggestion: 'Consider splitting into multiple files or minification'
                });
            }

            // Responsiveness checks
            this.checkCSSResponsiveness(content, issues);

            // Performance checks
            this.checkCSSPerformance(content, issues);

            // Browser compatibility
            this.checkCSSBrowserCompatibility(content, issues);

            // Best practices
            this.checkCSSBestPractices(content, lines, issues);

            if (issues.length > 0) {
                this.results.css.push({
                    file: filePath,
                    issues: issues,
                    linesOfCode: lines.length,
                    fileSize: stats.size
                });

                // Update summary
                this.results.summary.totalFiles++;
                this.results.summary.issuesFound += issues.length;
                this.results.summary.criticalIssues += issues.filter(i => i.severity === 'critical').length;
                this.results.summary.warnings += issues.filter(i => i.severity === 'warning').length;
                this.results.summary.suggestions += issues.filter(i => i.severity === 'suggestion').length;
            }
        } catch (error) {
            this.log('error', `Failed to analyze ${filePath}: ${error.message}`);
        }
    }

    /**
     * Check CSS responsiveness
     */
    checkCSSResponsiveness(content, issues) {
        // Check for media queries
        const mediaQueries = (content.match(/@media/g) || []).length;
        
        if (mediaQueries === 0 && content.length > 1000) {
            issues.push({
                severity: 'warning',
                type: 'responsiveness',
                message: 'No media queries found in substantial CSS file',
                suggestion: 'Add responsive breakpoints for mobile, tablet, and desktop'
            });
        }

        // Check for common breakpoints
        const commonBreakpoints = [
            { pattern: /@media.*\(.*max-width:\s*768px\)/i, name: 'mobile (768px)' },
            { pattern: /@media.*\(.*max-width:\s*1024px\)/i, name: 'tablet (1024px)' },
            { pattern: /@media.*\(.*min-width:\s*1200px\)/i, name: 'desktop (1200px)' }
        ];

        const foundBreakpoints = commonBreakpoints.filter(bp => bp.pattern.test(content));
        
        if (mediaQueries > 0 && foundBreakpoints.length < 2) {
            issues.push({
                severity: 'suggestion',
                type: 'responsiveness',
                message: 'Limited responsive breakpoints detected',
                suggestion: 'Consider adding breakpoints for mobile, tablet, and desktop'
            });
        }

        // Check for fixed widths without responsive alternatives
        const fixedWidths = content.match(/width:\s*\d+px/g);
        if (fixedWidths && fixedWidths.length > 10 && mediaQueries === 0) {
            issues.push({
                severity: 'warning',
                type: 'responsiveness',
                message: 'Many fixed pixel widths without responsive alternatives',
                suggestion: 'Use relative units (%, rem, em) or add responsive overrides'
            });
        }

        // Check for viewport units
        const viewportUnits = (content.match(/\d+(vw|vh|vmin|vmax)/g) || []).length;
        if (viewportUnits > 0) {
            issues.push({
                severity: 'suggestion',
                type: 'responsiveness',
                message: `Found ${viewportUnits} viewport unit declarations`,
                suggestion: 'Ensure viewport units work correctly on mobile devices'
            });
        }
    }

    /**
     * Check CSS performance
     */
    checkCSSPerformance(content, issues) {
        // Check for expensive selectors
        const universalSelectors = (content.match(/\*\s*{/g) || []).length;
        if (universalSelectors > 2) {
            issues.push({
                severity: 'warning',
                type: 'performance',
                message: 'Multiple universal selectors (*) found',
                suggestion: 'Universal selectors are slow; use specific selectors'
            });
        }

        // Check for deep nesting (more than 3 levels)
        const deepNesting = content.match(/([^{]+{[^{}]*){3,}/g);
        if (deepNesting && deepNesting.length > 5) {
            issues.push({
                severity: 'warning',
                type: 'performance',
                message: 'Deep CSS nesting detected',
                suggestion: 'Reduce selector specificity and nesting depth'
            });
        }

        // Check for @import (should use <link> instead)
        const imports = (content.match(/@import/g) || []).length;
        if (imports > 0) {
            issues.push({
                severity: 'warning',
                type: 'performance',
                message: `Found ${imports} @import statements`,
                suggestion: 'Use <link> tags instead of @import for better performance'
            });
        }

        // Check for animations without will-change
        const animations = (content.match(/@keyframes/g) || []).length;
        const willChange = (content.match(/will-change:/g) || []).length;
        
        if (animations > 2 && willChange === 0) {
            issues.push({
                severity: 'suggestion',
                type: 'performance',
                message: 'Animations without will-change optimization',
                suggestion: 'Add will-change property for better animation performance'
            });
        }

        // Check for large base64 data URIs
        const dataURIs = content.match(/url\(data:image[^)]{1000,}\)/g);
        if (dataURIs && dataURIs.length > 0) {
            issues.push({
                severity: 'warning',
                type: 'performance',
                message: 'Large base64 data URIs found',
                suggestion: 'Use external image files for better caching'
            });
        }
    }

    /**
     * Check CSS browser compatibility
     */
    checkCSSBrowserCompatibility(content, issues) {
        // Properties that need vendor prefixes
        const prefixNeeded = [
            { property: 'transform', prefix: '-webkit-transform' },
            { property: 'transition', prefix: '-webkit-transition' },
            { property: 'animation', prefix: '-webkit-animation' },
            { property: 'user-select', prefix: '-webkit-user-select' },
            { property: 'appearance', prefix: '-webkit-appearance' }
        ];

        prefixNeeded.forEach(({ property, prefix }) => {
            const hasProperty = new RegExp(`\\b${property}\\s*:`).test(content);
            const hasPrefix = new RegExp(`\\b${prefix}\\s*:`).test(content);
            
            if (hasProperty && !hasPrefix) {
                issues.push({
                    severity: 'suggestion',
                    type: 'compatibility',
                    message: `${property} used without vendor prefix`,
                    suggestion: `Add ${prefix} for better browser support`
                });
            }
        });

        // Check for modern features without fallbacks
        const modernFeatures = [
            { feature: 'grid', fallback: 'flexbox or float', pattern: /display:\s*grid/ },
            { feature: 'flex', fallback: 'float', pattern: /display:\s*flex/ },
            { feature: 'css variables', fallback: 'static values', pattern: /var\(--/ }
        ];

        modernFeatures.forEach(({ feature, fallback, pattern }) => {
            if (pattern.test(content) && !content.includes('@supports')) {
                issues.push({
                    severity: 'suggestion',
                    type: 'compatibility',
                    message: `Using ${feature} without @supports feature detection`,
                    suggestion: `Consider ${fallback} as fallback for older browsers`
                });
            }
        });
    }

    /**
     * Check CSS best practices
     */
    checkCSSBestPractices(content, lines, issues) {
        // Check for !important usage
        const importantCount = (content.match(/!important/g) || []).length;
        if (importantCount > 5) {
            issues.push({
                severity: 'warning',
                type: 'best-practice',
                message: `Excessive !important usage (${importantCount} occurrences)`,
                suggestion: 'Refactor CSS to avoid !important'
            });
        }

        // Check for duplicate selectors
        const selectors = content.match(/[^{}]+(?=\s*{)/g) || [];
        const selectorCounts = {};
        selectors.forEach(sel => {
            const trimmed = sel.trim();
            selectorCounts[trimmed] = (selectorCounts[trimmed] || 0) + 1;
        });
        
        const duplicates = Object.entries(selectorCounts).filter(([_, count]) => count > 1);
        if (duplicates.length > 3) {
            issues.push({
                severity: 'suggestion',
                type: 'best-practice',
                message: `${duplicates.length} duplicate selectors found`,
                suggestion: 'Consolidate duplicate selectors to reduce file size'
            });
        }

        // Check for color consistency
        const colors = content.match(/#[0-9a-f]{3,6}\b/gi) || [];
        const uniqueColors = [...new Set(colors)];
        
        if (uniqueColors.length > 20) {
            issues.push({
                severity: 'suggestion',
                type: 'best-practice',
                message: `Many unique colors (${uniqueColors.length}) found`,
                suggestion: 'Consider using CSS variables for consistent color palette'
            });
        }

        // Check for font-size consistency
        const fontSizes = content.match(/font-size:\s*[\d.]+(?:px|em|rem)/g) || [];
        const uniqueFontSizes = [...new Set(fontSizes)];
        
        if (uniqueFontSizes.length > 15) {
            issues.push({
                severity: 'suggestion',
                type: 'best-practice',
                message: `Many font sizes (${uniqueFontSizes.length}) found`,
                suggestion: 'Establish a consistent typography scale'
            });
        }
    }

    /**
     * Generate analysis summary
     */
    generateSummary() {
        this.results.summary.totalFiles = 
            this.results.javascript.length + this.results.css.length;
        
        // Already calculated during analysis
        this.log('info', 'Summary generated');
    }

    /**
     * Get results
     */
    getResults() {
        return this.results;
    }

    /**
     * Get status
     */
    getStatus() {
        return {
            analyzed: this.results.summary.totalFiles,
            issues: this.results.summary.issuesFound,
            critical: this.results.summary.criticalIssues,
            active: true
        };
    }

    /**
     * Logger helper
     */
    log(level, message, data = null) {
        if (this.logger && typeof this.logger[level] === 'function') {
            this.logger[level]('JsCssQualityAgent', message, data);
        } else if (this.logger) {
            this.logger.log(`[${level.toUpperCase()}] JsCssQualityAgent: ${message}`, data);
        }
    }
}

// Export for Node.js and browser
if (typeof window !== 'undefined') {
    window.JsCssQualityAgent = JsCssQualityAgent;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = JsCssQualityAgent;
}
