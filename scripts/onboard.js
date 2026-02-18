#!/usr/bin/env node

/**
 * 🚀 Automated Developer Onboarding Script
 * 
 * This script automates the entire onboarding process:
 * - Checks prerequisites
 * - Creates .env file with sensible defaults
 * - Generates UUID for UNIVERSE_KEY
 * - Validates environment
 * - Provides next steps
 * 
 * Usage: npm run onboard
 * 
 * @author Consciousness Revolution Platform Team
 * @version 2.0.0
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');
const crypto = require('crypto');

// Terminal colors
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
};

class OnboardingWizard {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '..');
        this.envPath = path.join(this.projectRoot, '.env');
        this.envCoreExamplePath = path.join(this.projectRoot, '.env.core.example');
        this.envExamplePath = path.join(this.projectRoot, '.env.example');
        
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        this.checks = {
            node: false,
            npm: false,
            git: false,
            env: false,
        };
    }
    
    /**
     * Main entry point
     */
    async run() {
        try {
            this.printHeader();
            await this.checkPrerequisites();
            await this.setupEnvironment();
            await this.verifySetup();
            this.printNextSteps();
            this.rl.close();
            process.exit(0);
        } catch (error) {
            this.error(`Onboarding failed: ${error.message}`);
            this.rl.close();
            process.exit(1);
        }
    }
    
    /**
     * Print welcome header
     */
    printHeader() {
        console.log('\n' + '═'.repeat(70));
        console.log(`${colors.cyan}${colors.bright}🚀 Consciousness Revolution - Developer Onboarding${colors.reset}`);
        console.log('═'.repeat(70) + '\n');
        this.info('Welcome! This wizard will set up your development environment.\n');
    }
    
    /**
     * Check all prerequisites
     */
    async checkPrerequisites() {
        this.section('📋 Step 1: Checking Prerequisites');
        
        // Check Node.js
        try {
            const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
            const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
            
            if (majorVersion >= 16) {
                this.success(`Node.js: ${nodeVersion} ✓`);
                this.checks.node = true;
            } else {
                this.warn(`Node.js: ${nodeVersion} (v16+ recommended)`);
                this.checks.node = false;
            }
        } catch (error) {
            this.error('Node.js: Not found ✗');
            this.info('Please install Node.js from: https://nodejs.org/');
            throw new Error('Node.js is required');
        }
        
        // Check npm
        try {
            const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
            this.success(`npm: ${npmVersion} ✓`);
            this.checks.npm = true;
        } catch (error) {
            this.error('npm: Not found ✗');
            throw new Error('npm is required (usually comes with Node.js)');
        }
        
        // Check Git
        try {
            const gitVersion = execSync('git --version', { encoding: 'utf8' }).trim();
            this.success(`Git: ${gitVersion} ✓`);
            this.checks.git = true;
        } catch (error) {
            this.warn('Git: Not found (optional, but recommended)');
            this.info('Install from: https://git-scm.com/');
        }
        
        console.log();
    }
    
    /**
     * Setup environment configuration
     */
    async setupEnvironment() {
        this.section('⚙️  Step 2: Environment Configuration');
        
        // Check if .env already exists
        if (fs.existsSync(this.envPath)) {
            this.warn('.env file already exists');
            const overwrite = await this.confirm('Do you want to overwrite it?', false);
            
            if (!overwrite) {
                this.info('Keeping existing .env file');
                this.checks.env = true;
                console.log();
                return;
            }
        }
        
        // Generate UUID for UNIVERSE_KEY
        const universeKey = crypto.randomUUID();
        this.info(`Generated UNIVERSE_KEY: ${universeKey}`);
        
        // Get port preference
        const defaultPort = 3000;
        const portInput = await this.question(`Port for local server [${defaultPort}]: `);
        const port = portInput.trim() || defaultPort;
        
        // Create .env content
        const envContent = `# ════════════════════════════════════════════════════════════════
# CONSCIOUSNESS REVOLUTION - ENVIRONMENT CONFIGURATION
# ════════════════════════════════════════════════════════════════
# Auto-generated by onboarding wizard
# Date: ${new Date().toISOString()}
# ════════════════════════════════════════════════════════════════

# ────────────────────────────────────────────────────────────────
# CORE CONFIGURATION (Required)
# ────────────────────────────────────────────────────────────────

# Unique identifier for your instance
UNIVERSE_KEY=${universeKey}

# Environment: development | production | test
NODE_ENV=development

# Server port
PORT=${port}

# ════════════════════════════════════════════════════════════════
# OPTIONAL INTEGRATIONS
# ════════════════════════════════════════════════════════════════
# Add your API keys below as needed
# See DEVELOPER_ONBOARDING.md for instructions
# ════════════════════════════════════════════════════════════════

# AI Services (Optional)
# OPENAI_API_KEY=sk-your-key-here
# GROQ_API_KEY=gsk-your-key-here
# ANTHROPIC_API_KEY=sk-ant-your-key-here

# GitHub Integration (Optional)
# GITHUB_TOKEN=ghp-your-token-here

# Database (Optional)
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your-anon-key-here

# Payments (Optional)
# PAYPAL_CLIENT_ID=your-client-id-here
# PAYPAL_CLIENT_SECRET=your-client-secret-here

# ════════════════════════════════════════════════════════════════
# For the complete list of integrations, see .env.example
# To add API keys later, run: node setup-api-keys.js
# ════════════════════════════════════════════════════════════════
`;
        
        // Write .env file
        try {
            fs.writeFileSync(this.envPath, envContent, { mode: 0o600 });
            this.success('.env file created successfully ✓');
            this.checks.env = true;
            
            // Set restrictive permissions
            try {
                fs.chmodSync(this.envPath, 0o600);
                this.info('File permissions set to 600 (owner read/write only)');
            } catch (error) {
                this.warn('Could not set file permissions (Windows?)');
            }
        } catch (error) {
            throw new Error(`Failed to create .env file: ${error.message}`);
        }
        
        console.log();
    }
    
    /**
     * Verify the setup
     */
    async verifySetup() {
        this.section('✅ Step 3: Verifying Setup');
        
        // Check .env exists and is readable
        try {
            const envContent = fs.readFileSync(this.envPath, 'utf8');
            
            // Verify required variables
            const hasUniverseKey = /UNIVERSE_KEY=/.test(envContent);
            const hasNodeEnv = /NODE_ENV=/.test(envContent);
            const hasPort = /PORT=/.test(envContent);
            
            if (hasUniverseKey && hasNodeEnv && hasPort) {
                this.success('All required environment variables present ✓');
            } else {
                this.warn('Some required variables might be missing');
            }
            
            // Check for security issues
            const hasSuspiciousKeys = /sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{36,}/.test(envContent);
            if (!hasSuspiciousKeys) {
                this.success('No hardcoded secrets detected ✓');
            } else {
                this.warn('Potential API keys found in .env (this is OK if intentional)');
            }
            
        } catch (error) {
            this.error(`Failed to verify .env: ${error.message}`);
        }
        
        // Check gitignore
        try {
            const gitignorePath = path.join(this.projectRoot, '.gitignore');
            const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
            
            if (gitignoreContent.includes('.env')) {
                this.success('.env is properly gitignored ✓');
            } else {
                this.warn('.env might not be in .gitignore (security risk!)');
            }
        } catch (error) {
            this.warn('.gitignore not found or not readable');
        }
        
        console.log();
    }
    
    /**
     * Print next steps
     */
    printNextSteps() {
        this.section('🎉 Setup Complete!');
        
        console.log(`${colors.green}You're ready to start developing!${colors.reset}\n`);
        
        console.log(`${colors.bright}Next steps:${colors.reset}\n`);
        console.log(`  1. ${colors.cyan}Start the development server:${colors.reset}`);
        console.log(`     ${colors.dim}npm start${colors.reset}\n`);
        
        console.log(`  2. ${colors.cyan}Open in your browser:${colors.reset}`);
        console.log(`     ${colors.dim}http://localhost:${this.checks.env ? process.env.PORT || 3000 : 3000}${colors.reset}\n`);
        
        console.log(`  3. ${colors.cyan}Read the developer guide:${colors.reset}`);
        console.log(`     ${colors.dim}DEVELOPER_ONBOARDING.md${colors.reset}\n`);
        
        console.log(`${colors.bright}Optional:${colors.reset}\n`);
        console.log(`  • Add API keys for advanced features:`);
        console.log(`    ${colors.dim}node setup-api-keys.js${colors.reset}\n`);
        
        console.log(`  • Run tests to verify everything works:`);
        console.log(`    ${colors.dim}npm test${colors.reset}\n`);
        
        console.log(`  • Install git hooks for secret protection:`);
        console.log(`    ${colors.dim}npm run setup:git-hooks${colors.reset}\n`);
        
        console.log('═'.repeat(70));
        console.log(`${colors.cyan}${colors.bright}Happy coding! 🚀${colors.reset}\n`);
    }
    
    /**
     * Logging helpers
     */
    section(title) {
        console.log(`${colors.blue}${colors.bright}${title}${colors.reset}`);
        console.log('─'.repeat(70));
    }
    
    success(message) {
        console.log(`${colors.green}✓ ${message}${colors.reset}`);
    }
    
    info(message) {
        console.log(`${colors.cyan}ℹ ${message}${colors.reset}`);
    }
    
    warn(message) {
        console.log(`${colors.yellow}⚠ ${message}${colors.reset}`);
    }
    
    error(message) {
        console.log(`${colors.red}✗ ${message}${colors.reset}`);
    }
    
    /**
     * Prompt helpers
     */
    question(prompt) {
        return new Promise((resolve) => {
            this.rl.question(`${colors.cyan}${prompt}${colors.reset}`, resolve);
        });
    }
    
    confirm(prompt, defaultValue = true) {
        const suffix = defaultValue ? '[Y/n]' : '[y/N]';
        return new Promise((resolve) => {
            this.rl.question(`${colors.cyan}${prompt} ${suffix}: ${colors.reset}`, (answer) => {
                const normalized = answer.toLowerCase().trim();
                if (normalized === '') {
                    resolve(defaultValue);
                } else {
                    resolve(normalized === 'y' || normalized === 'yes');
                }
            });
        });
    }
}

// Run the wizard
if (require.main === module) {
    const wizard = new OnboardingWizard();
    wizard.run().catch((error) => {
        console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
        process.exit(1);
    });
}

module.exports = OnboardingWizard;
