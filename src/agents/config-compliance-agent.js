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
 * File: config-compliance-agent.js
 * Declaration ID: IP-3A119B39-MLL28ZVY
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

/** SIGNED BY MeRLynn - ID: MERLYNN-2a19a0c0 - TIMESTAMP: 2025-12-19T05:53:06.532Z - HASH: 0cbbc786 */
/** SIGNED BY AGentR - ID: AGENTR-59acf2b3 - TIMESTAMP: 2025-12-19T05:53:06.532Z - HASH: 0cbbc786 */

/**
 * CONFIGURATION COMPLIANCE AGENT
 * Checks configuration files for deployment and security best practices
 * Reviews package.json, netlify.toml, and other config files
 */

class ConfigComplianceAgent {
    constructor(logger = null) {
        this.logger = logger || console;
        this.results = {
            packageJson: [],
            netlifyToml: [],
            circleCI: [],
            gitConfig: [],
            otherConfigs: [],
            summary: {
                totalIssues: 0,
                securityIssues: 0,
                deploymentIssues: 0,
                performanceIssues: 0,
                bestPracticeIssues: 0
            }
        };
        
        // Known vulnerable packages - should be updated regularly
        // Note: For production use, consider integrating with npm audit or Snyk
        this.KNOWN_VULNERABLE_PACKAGES = [
            'event-stream',
            'flatmap-stream', 
            'getcookies'
        ];
    }

    /**
     * Start comprehensive configuration analysis
     */
    async analyzeConfigurations() {
        this.log('info', 'Starting configuration compliance analysis...');
        
        try {
            // Check package.json
            await this.checkPackageJson();
            
            // Check netlify.toml
            await this.checkNetlifyToml();
            
            // Check CircleCI config
            await this.checkCircleCI();
            
            // Check .gitignore
            await this.checkGitIgnore();
            
            // Check other config files
            await this.checkOtherConfigs();
            
            // Generate summary
            this.generateSummary();
            
            this.log('success', `Analysis complete. Found ${this.results.summary.totalIssues} configuration issues.`);
            
            return this.results;
        } catch (error) {
            this.log('error', `Analysis failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Check package.json for best practices
     */
    async checkPackageJson() {
        const fs = require('fs').promises;
        const issues = [];
        
        try {
            const content = await fs.readFile('./package.json', 'utf8');
            const pkg = JSON.parse(content);
            
            // Check required fields
            const requiredFields = ['name', 'version', 'description'];
            requiredFields.forEach(field => {
                if (!pkg[field]) {
                    issues.push({
                        severity: 'warning',
                        category: 'best-practice',
                        field: field,
                        message: `Missing required field: ${field}`,
                        recommendation: `Add ${field} to package.json`
                    });
                }
            });
            
            // Check for dependencies
            if (pkg.dependencies) {
                // Check for known vulnerable packages
                Object.keys(pkg.dependencies).forEach(dep => {
                    if (this.KNOWN_VULNERABLE_PACKAGES.includes(dep)) {
                        issues.push({
                            severity: 'critical',
                            category: 'security',
                            field: 'dependencies',
                            package: dep,
                            message: `Known vulnerable package: ${dep}`,
                            recommendation: 'Remove or update to secure version'
                        });
                    }
                });
                
                // Check for wildcard versions
                Object.entries(pkg.dependencies).forEach(([dep, version]) => {
                    if (version === '*' || version === 'latest') {
                        issues.push({
                            severity: 'warning',
                            category: 'deployment',
                            field: 'dependencies',
                            package: dep,
                            message: `Wildcard version for ${dep}: ${version}`,
                            recommendation: 'Pin to specific version for reproducible builds'
                        });
                    }
                });
            }
            
            // Check devDependencies
            if (pkg.devDependencies) {
                Object.entries(pkg.devDependencies).forEach(([dep, version]) => {
                    if (version === '*' || version === 'latest') {
                        issues.push({
                            severity: 'suggestion',
                            category: 'best-practice',
                            field: 'devDependencies',
                            package: dep,
                            message: `Wildcard devDependency version for ${dep}`,
                            recommendation: 'Consider pinning devDependency versions'
                        });
                    }
                });
            }
            
            // Check scripts
            if (pkg.scripts) {
                // Check for security-related scripts
                if (!pkg.scripts.audit && !pkg.scripts.security) {
                    issues.push({
                        severity: 'suggestion',
                        category: 'security',
                        field: 'scripts',
                        message: 'No security audit script found',
                        recommendation: 'Add "audit": "npm audit" to scripts'
                    });
                }
                
                // Check for test script
                if (!pkg.scripts.test || pkg.scripts.test === 'echo "Error: no test specified" && exit 1') {
                    issues.push({
                        severity: 'warning',
                        category: 'best-practice',
                        field: 'scripts',
                        message: 'No test script configured',
                        recommendation: 'Add proper test script'
                    });
                }
                
                // Check for build script
                if (!pkg.scripts.build) {
                    issues.push({
                        severity: 'suggestion',
                        category: 'deployment',
                        field: 'scripts',
                        message: 'No build script found',
                        recommendation: 'Consider adding a build script for production'
                    });
                }
            }
            
            // Check engines
            if (!pkg.engines) {
                issues.push({
                    severity: 'suggestion',
                    category: 'deployment',
                    field: 'engines',
                    message: 'No engines field specified',
                    recommendation: 'Specify Node.js and npm versions for consistency'
                });
            } else {
                if (!pkg.engines.node) {
                    issues.push({
                        severity: 'suggestion',
                        category: 'deployment',
                        field: 'engines.node',
                        message: 'Node.js version not specified',
                        recommendation: 'Specify required Node.js version'
                    });
                }
            }
            
            // Check repository field
            if (!pkg.repository) {
                issues.push({
                    severity: 'suggestion',
                    category: 'best-practice',
                    field: 'repository',
                    message: 'No repository field',
                    recommendation: 'Add repository URL for better package management'
                });
            }
            
            // Check license
            if (!pkg.license) {
                issues.push({
                    severity: 'warning',
                    category: 'best-practice',
                    field: 'license',
                    message: 'No license specified',
                    recommendation: 'Add license field (e.g., MIT, ISC)'
                });
            }
            
            // Check for private flag if not meant to be published
            if (!pkg.private && !pkg.publishConfig) {
                issues.push({
                    severity: 'suggestion',
                    category: 'best-practice',
                    field: 'private',
                    message: 'Package not marked as private',
                    recommendation: 'Add "private": true if not publishing to npm'
                });
            }
            
            this.results.packageJson = issues;
            this.log('info', `package.json: Found ${issues.length} issues`);
            
        } catch (error) {
            if (error.code !== 'ENOENT') {
                this.log('error', `Failed to check package.json: ${error.message}`);
            } else {
                this.log('info', 'No package.json found');
            }
        }
    }

    /**
     * Check netlify.toml for deployment best practices
     */
    async checkNetlifyToml() {
        const fs = require('fs').promises;
        const issues = [];
        
        try {
            const content = await fs.readFile('./netlify.toml', 'utf8');
            
            // Check for build command
            if (!content.includes('command =')) {
                issues.push({
                    severity: 'warning',
                    category: 'deployment',
                    section: 'build',
                    message: 'No build command specified',
                    recommendation: 'Add build command in [build] section'
                });
            }
            
            // Check for publish directory
            if (!content.includes('publish =')) {
                issues.push({
                    severity: 'warning',
                    category: 'deployment',
                    section: 'build',
                    message: 'No publish directory specified',
                    recommendation: 'Add publish directory in [build] section'
                });
            }
            
            // Check for security headers
            if (!content.includes('[[headers]]')) {
                issues.push({
                    severity: 'warning',
                    category: 'security',
                    section: 'headers',
                    message: 'No custom headers configured',
                    recommendation: 'Add security headers (CSP, X-Frame-Options, etc.)'
                });
            } else {
                // Check for specific security headers
                const securityHeaders = [
                    { name: 'X-Frame-Options', recommendation: 'Protect against clickjacking' },
                    { name: 'X-Content-Type-Options', recommendation: 'Prevent MIME sniffing' },
                    { name: 'X-XSS-Protection', recommendation: 'Enable XSS filter' },
                    { name: 'Content-Security-Policy', recommendation: 'Prevent XSS and injection attacks' }
                ];
                
                securityHeaders.forEach(header => {
                    if (!content.includes(header.name)) {
                        issues.push({
                            severity: 'suggestion',
                            category: 'security',
                            section: 'headers',
                            message: `Missing ${header.name} header`,
                            recommendation: header.recommendation
                        });
                    }
                });
            }
            
            // Check for redirects
            if (!content.includes('[[redirects]]')) {
                issues.push({
                    severity: 'suggestion',
                    category: 'best-practice',
                    section: 'redirects',
                    message: 'No redirects configured',
                    recommendation: 'Consider adding redirects for SPA routing or URL changes'
                });
            }
            
            // Check for environment variables
            if (content.includes('API_KEY') || content.includes('SECRET') || content.includes('PASSWORD')) {
                issues.push({
                    severity: 'critical',
                    category: 'security',
                    section: 'build.environment',
                    message: 'Potential hardcoded secrets in config',
                    recommendation: 'Move secrets to Netlify environment variables UI'
                });
            }
            
            // Check for caching headers
            if (!content.includes('Cache-Control') && !content.includes('cache-control')) {
                issues.push({
                    severity: 'suggestion',
                    category: 'performance',
                    section: 'headers',
                    message: 'No cache control headers configured',
                    recommendation: 'Add Cache-Control headers for better performance'
                });
            }
            
            this.results.netlifyToml = issues;
            this.log('info', `netlify.toml: Found ${issues.length} issues`);
            
        } catch (error) {
            if (error.code !== 'ENOENT') {
                this.log('error', `Failed to check netlify.toml: ${error.message}`);
            } else {
                this.log('info', 'No netlify.toml found');
            }
        }
    }

    /**
     * Check CircleCI configuration
     */
    async checkCircleCI() {
        const fs = require('fs').promises;
        const issues = [];
        
        try {
            const content = await fs.readFile('./.circleci/config.yml', 'utf8');
            
            // Check for version
            if (!content.includes('version:')) {
                issues.push({
                    severity: 'warning',
                    category: 'deployment',
                    message: 'No version specified',
                    recommendation: 'Add version to CircleCI config'
                });
            }
            
            // Check for workflows
            if (!content.includes('workflows:')) {
                issues.push({
                    severity: 'suggestion',
                    category: 'best-practice',
                    message: 'No workflows defined',
                    recommendation: 'Define workflows for better CI/CD organization'
                });
            }
            
            // Check for caching
            if (!content.includes('save_cache') && !content.includes('restore_cache')) {
                issues.push({
                    severity: 'suggestion',
                    category: 'performance',
                    message: 'No caching configured',
                    recommendation: 'Add caching to speed up builds'
                });
            }
            
            // Check for test job
            if (!content.includes('test') && !content.includes('npm test') && !content.includes('yarn test')) {
                issues.push({
                    severity: 'warning',
                    category: 'best-practice',
                    message: 'No test job found',
                    recommendation: 'Add automated testing to CI pipeline'
                });
            }
            
            // Check for secrets in config
            if (content.includes('password:') || content.includes('token:') || content.includes('key:')) {
                const lines = content.split('\n');
                lines.forEach((line, index) => {
                    if (/password:|token:|key:/i.test(line) && !line.includes('$')) {
                        issues.push({
                            severity: 'critical',
                            category: 'security',
                            line: index + 1,
                            message: 'Potential hardcoded secret',
                            recommendation: 'Use CircleCI environment variables'
                        });
                    }
                });
            }
            
            this.results.circleCI = issues;
            this.log('info', `.circleci/config.yml: Found ${issues.length} issues`);
            
        } catch (error) {
            if (error.code !== 'ENOENT') {
                this.log('error', `Failed to check CircleCI config: ${error.message}`);
            } else {
                this.log('info', 'No CircleCI config found');
            }
        }
    }

    /**
     * Check .gitignore for best practices
     */
    async checkGitIgnore() {
        const fs = require('fs').promises;
        const issues = [];
        
        try {
            const content = await fs.readFile('./.gitignore', 'utf8');
            
            // Check for common patterns
            const importantPatterns = [
                { pattern: 'node_modules', message: 'node_modules should be ignored' },
                { pattern: '.env', message: '.env files should be ignored' },
                { pattern: 'dist', message: 'Build artifacts (dist) should be ignored' },
                { pattern: '*.log', message: 'Log files should be ignored' }
            ];
            
            importantPatterns.forEach(({ pattern, message }) => {
                if (!content.includes(pattern)) {
                    issues.push({
                        severity: 'warning',
                        category: 'best-practice',
                        pattern: pattern,
                        message: message,
                        recommendation: `Add ${pattern} to .gitignore`
                    });
                }
            });
            
            // Check for OS-specific files
            const osPatterns = ['.DS_Store', 'Thumbs.db', '*.swp'];
            const missingOsPatterns = osPatterns.filter(p => !content.includes(p));
            
            if (missingOsPatterns.length > 0) {
                issues.push({
                    severity: 'suggestion',
                    category: 'best-practice',
                    message: 'Missing OS-specific file patterns',
                    recommendation: `Add patterns: ${missingOsPatterns.join(', ')}`
                });
            }
            
            // Check for IDE files
            const idePatterns = ['.vscode', '.idea', '*.sublime'];
            const missingIdePatterns = idePatterns.filter(p => !content.includes(p.replace(/\*/g, '')));
            
            if (missingIdePatterns.length > 1) {
                issues.push({
                    severity: 'suggestion',
                    category: 'best-practice',
                    message: 'Missing IDE-specific file patterns',
                    recommendation: 'Consider adding common IDE patterns'
                });
            }
            
            this.results.gitConfig = issues;
            this.log('info', `.gitignore: Found ${issues.length} issues`);
            
        } catch (error) {
            if (error.code !== 'ENOENT') {
                this.log('error', `Failed to check .gitignore: ${error.message}`);
            } else {
                issues.push({
                    severity: 'critical',
                    category: 'best-practice',
                    message: 'No .gitignore file found',
                    recommendation: 'Create .gitignore to prevent committing sensitive files'
                });
                this.results.gitConfig = issues;
            }
        }
    }

    /**
     * Check other configuration files
     */
    async checkOtherConfigs() {
        const fs = require('fs').promises;
        const configs = [
            { file: '.env.example', required: false },
            { file: 'tsconfig.json', required: false },
            { file: '.eslintrc', required: false },
            { file: '.prettierrc', required: false }
        ];
        
        for (const config of configs) {
            try {
                await fs.access(`./${config.file}`);
                // File exists, no issue
            } catch (error) {
                if (config.required) {
                    this.results.otherConfigs.push({
                        severity: 'warning',
                        category: 'best-practice',
                        file: config.file,
                        message: `Missing ${config.file}`,
                        recommendation: `Add ${config.file} for better development workflow`
                    });
                }
            }
        }
        
        this.log('info', `Other configs: Found ${this.results.otherConfigs.length} issues`);
    }

    /**
     * Generate summary
     */
    generateSummary() {
        const allIssues = [
            ...this.results.packageJson,
            ...this.results.netlifyToml,
            ...this.results.circleCI,
            ...this.results.gitConfig,
            ...this.results.otherConfigs
        ];
        
        this.results.summary.totalIssues = allIssues.length;
        this.results.summary.securityIssues = allIssues.filter(i => i.category === 'security').length;
        this.results.summary.deploymentIssues = allIssues.filter(i => i.category === 'deployment').length;
        this.results.summary.performanceIssues = allIssues.filter(i => i.category === 'performance').length;
        this.results.summary.bestPracticeIssues = allIssues.filter(i => i.category === 'best-practice').length;
        
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
            totalIssues: this.results.summary.totalIssues,
            securityIssues: this.results.summary.securityIssues,
            deploymentIssues: this.results.summary.deploymentIssues,
            active: true
        };
    }

    /**
     * Logger helper
     */
    log(level, message, data = null) {
        if (this.logger && typeof this.logger[level] === 'function') {
            this.logger[level]('ConfigComplianceAgent', message, data);
        } else if (this.logger) {
            this.logger.log(`[${level.toUpperCase()}] ConfigComplianceAgent: ${message}`, data);
        }
    }
}

// Export for Node.js and browser
if (typeof window !== 'undefined') {
    window.ConfigComplianceAgent = ConfigComplianceAgent;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfigComplianceAgent;
}
