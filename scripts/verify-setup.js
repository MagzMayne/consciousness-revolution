#!/usr/bin/env node

/**
 * 🔍 Setup Verification Script
 * 
 * Validates that the development environment is properly configured.
 * Checks:
 * - Required dependencies
 * - Environment variables
 * - API connectivity (if keys configured)
 * - Security issues
 * 
 * Usage: npm run verify:setup
 * 
 * @author Consciousness Revolution Platform Team
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Terminal colors
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
};

class SetupVerifier {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '..');
        this.envPath = path.join(this.projectRoot, '.env');
        this.passed = 0;
        this.failed = 0;
        this.warnings = 0;
        this.skipped = 0;
    }
    
    /**
     * Run all verification checks
     */
    async run() {
        this.printHeader();
        
        await this.checkDependencies();
        await this.checkEnvironment();
        await this.checkSecurity();
        await this.checkOptionalAPIs();
        
        this.printSummary();
        
        // Exit with appropriate code
        if (this.failed > 0) {
            process.exit(1);
        } else if (this.warnings > 0) {
            process.exit(0); // Warnings are OK
        } else {
            process.exit(0);
        }
    }
    
    /**
     * Print header
     */
    printHeader() {
        console.log('\n' + '═'.repeat(70));
        console.log(`${colors.cyan}${colors.bright}🔍 Setup Verification${colors.reset}`);
        console.log('═'.repeat(70) + '\n');
    }
    
    /**
     * Check dependencies
     */
    async checkDependencies() {
        this.section('Dependencies');
        
        // Node.js
        try {
            const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
            const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
            
            if (majorVersion >= 16) {
                this.pass(`Node.js: ${nodeVersion}`);
            } else {
                this.fail(`Node.js: ${nodeVersion} (v16+ required)`);
            }
        } catch (error) {
            this.fail('Node.js: Not installed');
        }
        
        // npm
        try {
            const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
            this.pass(`npm: ${npmVersion}`);
        } catch (error) {
            this.fail('npm: Not installed');
        }
        
        // Git (optional)
        try {
            const gitVersion = execSync('git --version', { encoding: 'utf8' }).trim();
            this.pass(`Git: ${gitVersion}`);
        } catch (error) {
            this.skip('Git: Not installed (optional)');
        }
        
        // Python (optional)
        try {
            const pythonVersion = execSync('python --version 2>&1', { encoding: 'utf8' }).trim();
            this.pass(`Python: ${pythonVersion}`);
        } catch (error) {
            this.skip('Python: Not installed (optional for agents)');
        }
        
        console.log();
    }
    
    /**
     * Check environment configuration
     */
    async checkEnvironment() {
        this.section('Environment Configuration');
        
        // Check .env exists
        if (!fs.existsSync(this.envPath)) {
            this.fail('.env file: Not found');
            this.warn('Run: npm run onboard');
            console.log();
            return;
        }
        
        this.pass('.env file: Found');
        
        // Load .env
        let envContent;
        try {
            envContent = fs.readFileSync(this.envPath, 'utf8');
        } catch (error) {
            this.fail(`.env file: Cannot read (${error.message})`);
            console.log();
            return;
        }
        
        // Parse environment variables
        const envVars = {};
        envContent.split('\n').forEach(line => {
            const match = line.match(/^([A-Z_]+)=(.*)$/);
            if (match) {
                envVars[match[1]] = match[2];
            }
        });
        
        // Check required variables
        this.checkEnvVar(envVars, 'UNIVERSE_KEY', (value) => {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            return uuidRegex.test(value);
        }, 'Valid UUID');
        
        this.checkEnvVar(envVars, 'NODE_ENV', (value) => {
            return ['development', 'production', 'test'].includes(value);
        }, 'Valid environment');
        
        this.checkEnvVar(envVars, 'PORT', (value) => {
            const port = parseInt(value);
            return !isNaN(port) && port > 0 && port < 65536;
        }, 'Valid port number');
        
        // Check file permissions (Unix only)
        if (process.platform !== 'win32') {
            try {
                const stats = fs.statSync(this.envPath);
                const mode = (stats.mode & parseInt('777', 8)).toString(8);
                if (mode === '600') {
                    this.pass('.env permissions: 600 (secure)');
                } else {
                    this.warn(`.env permissions: ${mode} (should be 600)`);
                }
            } catch (error) {
                this.skip('.env permissions: Cannot check');
            }
        }
        
        console.log();
    }
    
    /**
     * Check security
     */
    async checkSecurity() {
        this.section('Security Checks');
        
        // Check .gitignore
        const gitignorePath = path.join(this.projectRoot, '.gitignore');
        if (fs.existsSync(gitignorePath)) {
            const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
            if (gitignoreContent.includes('.env')) {
                this.pass('.env is in .gitignore');
            } else {
                this.fail('.env is NOT in .gitignore (SECURITY RISK!)');
            }
        } else {
            this.warn('.gitignore not found');
        }
        
        // Scan for exposed secrets in committed files
        const secretPatterns = [
            { pattern: /sk-[a-zA-Z0-9]{20,}/g, name: 'OpenAI API key' },
            { pattern: /ghp_[a-zA-Z0-9]{36,}/g, name: 'GitHub token' },
            { pattern: /github_pat_[a-zA-Z0-9_]{22,}/g, name: 'GitHub PAT' },
            { pattern: /sk-ant-[a-zA-Z0-9-_]{20,}/g, name: 'Anthropic key' },
            { pattern: /gsk-[a-zA-Z0-9]{20,}/g, name: 'Groq API key' },
        ];
        
        let secretsFound = false;
        const filesToCheck = this.getJavaScriptFiles();
        
        for (const file of filesToCheck) {
            // Skip .env files
            if (file.includes('.env')) continue;
            
            try {
                const content = fs.readFileSync(file, 'utf8');
                
                for (const { pattern, name } of secretPatterns) {
                    const matches = content.match(pattern);
                    if (matches) {
                        // Check if it's in a comment or example
                        const isComment = matches.some(m => {
                            const lines = content.split('\n');
                            return lines.some(l => l.includes(m) && (l.trim().startsWith('//') || l.trim().startsWith('*')));
                        });
                        
                        const isExample = matches.some(m => m.includes('your-') || m.includes('example'));
                        
                        if (!isComment && !isExample) {
                            this.warn(`Potential ${name} found in: ${path.relative(this.projectRoot, file)}`);
                            secretsFound = true;
                        }
                    }
                }
            } catch (error) {
                // Skip files we can't read
            }
        }
        
        if (!secretsFound) {
            this.pass('No exposed secrets detected');
        }
        
        console.log();
    }
    
    /**
     * Check optional API configurations
     */
    async checkOptionalAPIs() {
        this.section('Optional Integrations');
        
        if (!fs.existsSync(this.envPath)) {
            this.skip('Cannot check APIs (.env not found)');
            console.log();
            return;
        }
        
        const envContent = fs.readFileSync(this.envPath, 'utf8');
        
        // Define optional APIs
        const optionalAPIs = [
            { key: 'OPENAI_API_KEY', name: 'OpenAI', pattern: /^sk-[a-zA-Z0-9]{20,}$/ },
            { key: 'GROQ_API_KEY', name: 'Groq', pattern: /^gsk-[a-zA-Z0-9]{20,}$/ },
            { key: 'ANTHROPIC_API_KEY', name: 'Anthropic', pattern: /^sk-ant-[a-zA-Z0-9-_]{20,}$/ },
            { key: 'GITHUB_TOKEN', name: 'GitHub', pattern: /^(ghp_|github_pat_)[a-zA-Z0-9_]{20,}$/ },
            { key: 'SUPABASE_URL', name: 'Supabase', pattern: /^https:\/\/.+\.supabase\.co$/ },
            { key: 'PAYPAL_CLIENT_ID', name: 'PayPal', pattern: /.{20,}/ },
        ];
        
        let configuredCount = 0;
        
        for (const { key, name, pattern } of optionalAPIs) {
            const match = envContent.match(new RegExp(`^${key}=(.+)$`, 'm'));
            if (match && match[1] && !match[1].includes('your-') && pattern.test(match[1])) {
                this.pass(`${name}: Configured`);
                configuredCount++;
            } else {
                this.skip(`${name}: Not configured (optional)`);
            }
        }
        
        if (configuredCount === 0) {
            this.info('Tip: Add API keys to enable advanced features');
            this.info('Run: node setup-api-keys.js');
        }
        
        console.log();
    }
    
    /**
     * Print summary
     */
    printSummary() {
        this.section('Summary');
        
        const total = this.passed + this.failed + this.warnings + this.skipped;
        
        console.log(`${colors.green}✓ Passed:  ${this.passed}${colors.reset}`);
        console.log(`${colors.red}✗ Failed:  ${this.failed}${colors.reset}`);
        console.log(`${colors.yellow}⚠ Warnings: ${this.warnings}${colors.reset}`);
        console.log(`${colors.cyan}○ Skipped: ${this.skipped}${colors.reset}`);
        console.log('─'.repeat(70));
        console.log(`Total checks: ${total}\n`);
        
        if (this.failed === 0 && this.warnings === 0) {
            console.log(`${colors.green}${colors.bright}🎉 Setup verified! You're ready to develop.${colors.reset}\n`);
        } else if (this.failed === 0) {
            console.log(`${colors.yellow}${colors.bright}⚠️  Setup OK with warnings. You can proceed.${colors.reset}\n`);
        } else {
            console.log(`${colors.red}${colors.bright}❌ Setup has issues. Please fix the errors above.${colors.reset}\n`);
        }
        
        console.log('═'.repeat(70) + '\n');
    }
    
    /**
     * Helper methods
     */
    section(title) {
        console.log(`${colors.cyan}${colors.bright}${title}${colors.reset}`);
        console.log('─'.repeat(70));
    }
    
    pass(message) {
        console.log(`${colors.green}✓${colors.reset} ${message}`);
        this.passed++;
    }
    
    fail(message) {
        console.log(`${colors.red}✗${colors.reset} ${message}`);
        this.failed++;
    }
    
    warn(message) {
        console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
        this.warnings++;
    }
    
    skip(message) {
        console.log(`${colors.cyan}○${colors.reset} ${message}`);
        this.skipped++;
    }
    
    info(message) {
        console.log(`  ${colors.cyan}ℹ${colors.reset} ${message}`);
    }
    
    checkEnvVar(envVars, key, validator, validMessage) {
        if (!envVars[key]) {
            this.fail(`${key}: Not set`);
        } else if (validator(envVars[key])) {
            this.pass(`${key}: ${validMessage}`);
        } else {
            this.fail(`${key}: Invalid value`);
        }
    }
    
    getJavaScriptFiles() {
        const files = [];
        const dirsToCheck = [
            path.join(this.projectRoot, 'js'),
            path.join(this.projectRoot, 'src'),
            path.join(this.projectRoot, 'backend'),
            path.join(this.projectRoot, 'scripts'),
        ];
        
        for (const dir of dirsToCheck) {
            if (fs.existsSync(dir)) {
                this.walkDir(dir, files, ['.js', '.ts', '.jsx', '.tsx']);
            }
        }
        
        return files;
    }
    
    walkDir(dir, fileList, extensions) {
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                // Skip node_modules and hidden dirs
                if (file !== 'node_modules' && !file.startsWith('.')) {
                    this.walkDir(filePath, fileList, extensions);
                }
            } else {
                const ext = path.extname(file);
                if (extensions.includes(ext)) {
                    fileList.push(filePath);
                }
            }
        }
    }
}

// Run verification
if (require.main === module) {
    const verifier = new SetupVerifier();
    verifier.run().catch((error) => {
        console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
        process.exit(1);
    });
}

module.exports = SetupVerifier;
