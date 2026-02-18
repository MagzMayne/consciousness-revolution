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
 * File: setup-api-keys.js
 * Declaration ID: IP-D137380-MLL28ZVV
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
 * API Key Setup Wizard
 * Interactive wizard for setting up API keys and connections
 * 
 * Features:
 * - Interactive prompts for each API service
 * - Automatic .env file generation
 * - API key format validation
 * - Connection testing after setup
 * - Automated detection of missing keys
 * 
 * @author BarbrickDesign Platform Team
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Colors for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
};

class APIKeySetupWizard {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        this.envPath = path.join(__dirname, '.env');
        this.envExamplePath = path.join(__dirname, '.env.example');
        
        this.services = {
            openai: {
                name: 'OpenAI',
                envVar: 'OPENAI_API_KEY',
                description: 'GPT models, DALL-E, Whisper',
                getKeyUrl: 'https://platform.openai.com/api-keys',
                format: 'sk-...',
                validator: (key) => key.startsWith('sk-') && key.length > 20,
                optional: true
            },
            anthropic: {
                name: 'Anthropic Claude',
                envVar: 'ANTHROPIC_API_KEY',
                description: 'Claude AI models',
                getKeyUrl: 'https://console.anthropic.com/settings/keys',
                format: 'sk-ant-...',
                validator: (key) => key.startsWith('sk-ant-') && key.length > 20,
                optional: true
            },
            samgov: {
                name: 'SAM.gov',
                envVar: 'SAMGOV_API_KEY',
                description: 'Government contract opportunities',
                getKeyUrl: 'https://open.gsa.gov/api/get-opportunities-public-api/',
                format: 'Any alphanumeric string',
                validator: (key) => key.length > 10,
                optional: true
            },
            github: {
                name: 'GitHub',
                envVar: 'GITHUB_TOKEN',
                description: 'Repository management and PR automation',
                getKeyUrl: 'https://github.com/settings/tokens',
                format: 'ghp_... or github_pat_...',
                validator: (key) => (key.startsWith('ghp_') || key.startsWith('github_pat_')) && key.length > 20,
                optional: true
            },
            etherscan: {
                name: 'Etherscan',
                envVar: 'ETHERSCAN_API_KEY',
                description: 'Ethereum blockchain data',
                getKeyUrl: 'https://etherscan.io/apis',
                format: 'Alphanumeric string',
                validator: (key) => key.length > 10,
                optional: true
            },
            coingecko: {
                name: 'CoinGecko',
                envVar: 'COINGECKO_API_KEY',
                description: 'Cryptocurrency prices',
                getKeyUrl: 'https://www.coingecko.com/en/api/pricing',
                format: 'CG-...',
                validator: (key) => key.startsWith('CG-') && key.length > 10,
                optional: true
            },
            infura: {
                name: 'Infura',
                envVar: 'INFURA_PROJECT_ID',
                description: 'Web3 provider for Ethereum',
                getKeyUrl: 'https://infura.io/dashboard',
                format: 'Project ID (32 chars)',
                validator: (key) => key.length >= 32,
                optional: true
            },
            paypal: {
                name: 'PayPal',
                envVar: 'PAYPAL_CLIENT_ID',
                description: 'Payment processing',
                getKeyUrl: 'https://developer.paypal.com/dashboard/applications',
                format: 'Client ID',
                validator: (key) => key.length > 20,
                optional: true,
                hasSecret: true
            }
        };
        
        this.apiKeys = {};
    }
    
    /**
     * Ask a question and get user input
     */
    question(prompt) {
        return new Promise((resolve) => {
            this.rl.question(prompt, resolve);
        });
    }
    
    /**
     * Log with colors
     */
    log(type, message) {
        const color = type === 'error' ? colors.red :
                     type === 'warn' ? colors.yellow :
                     type === 'success' ? colors.green :
                     type === 'info' ? colors.cyan :
                     type === 'header' ? colors.magenta : colors.reset;
        
        const prefix = type === 'error' ? '❌' :
                      type === 'warn' ? '⚠️ ' :
                      type === 'success' ? '✅' :
                      type === 'info' ? 'ℹ️ ' :
                      type === 'header' ? '🔧' : '  ';
        
        console.log(`${color}${prefix} ${message}${colors.reset}`);
    }
    
    /**
     * Run the setup wizard
     */
    async run() {
        console.log('\n' + '='.repeat(70));
        console.log(`${colors.cyan}🔧 API Key Setup Wizard${colors.reset}`);
        console.log('='.repeat(70) + '\n');
        
        this.log('info', 'This wizard will help you configure API keys for all services.');
        this.log('info', 'You can skip any service by pressing Enter without typing anything.\n');
        
        // Check if .env already exists
        if (fs.existsSync(this.envPath)) {
            const response = await this.question(`${colors.yellow}⚠️  .env file already exists. Overwrite? (y/N): ${colors.reset}`);
            if (response.toLowerCase() !== 'y') {
                this.log('info', 'Setup cancelled. Your existing .env file was not modified.');
                this.rl.close();
                return;
            }
        }
        
        // Guide user through each service
        for (const [serviceId, service] of Object.entries(this.services)) {
            await this.setupService(serviceId, service);
        }
        
        // Generate .env file
        await this.generateEnvFile();
        
        // Offer to test connections
        const testResponse = await this.question(`\n${colors.cyan}Would you like to test the connections now? (Y/n): ${colors.reset}`);
        if (testResponse.toLowerCase() !== 'n') {
            await this.testConnections();
        }
        
        this.log('success', '\n✨ Setup complete! Your API keys have been configured.');
        this.log('info', 'You can update them anytime by editing the .env file or running this wizard again.\n');
        
        this.rl.close();
    }
    
    /**
     * Setup individual service
     */
    async setupService(serviceId, service) {
        console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
        console.log(`${colors.cyan}${service.name}${colors.reset}`);
        console.log(`Description: ${service.description}`);
        console.log(`Get your key: ${colors.blue}${service.getKeyUrl}${colors.reset}`);
        console.log(`Expected format: ${service.format}`);
        console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
        
        const apiKey = await this.question(`Enter ${service.name} API key (or press Enter to skip): `);
        
        if (!apiKey.trim()) {
            this.log('info', `Skipped ${service.name} (will use fallback if available)`);
            return;
        }
        
        // Validate key format
        if (service.validator(apiKey)) {
            this.apiKeys[service.envVar] = apiKey;
            this.log('success', `${service.name} API key validated and saved`);
            
            // Handle PayPal secret if needed
            if (service.hasSecret) {
                const secret = await this.question('Enter PayPal Secret: ');
                if (secret.trim()) {
                    this.apiKeys['PAYPAL_SECRET'] = secret;
                    this.log('success', 'PayPal Secret saved');
                    
                    const mode = await this.question('PayPal mode (sandbox/live) [sandbox]: ');
                    this.apiKeys['PAYPAL_MODE'] = mode.trim() || 'sandbox';
                }
            }
        } else {
            this.log('warn', `${service.name} API key format looks incorrect. Saving anyway...`);
            this.apiKeys[service.envVar] = apiKey;
        }
    }
    
    /**
     * Generate .env file
     */
    async generateEnvFile() {
        this.log('info', '\nGenerating .env file...');
        
        let envContent = '# API Keys Configuration\n';
        envContent += '# Generated by API Key Setup Wizard\n';
        envContent += `# Generated on: ${new Date().toISOString()}\n`;
        envContent += '#\n';
        envContent += '# SECURITY WARNING: Never commit this file to version control!\n';
        envContent += '#\n\n';
        
        // Load existing .env.example for reference
        let exampleContent = '';
        if (fs.existsSync(this.envExamplePath)) {
            exampleContent = fs.readFileSync(this.envExamplePath, 'utf8');
        }
        
        // Add configured keys
        envContent += '# Configured API Keys\n';
        for (const [key, value] of Object.entries(this.apiKeys)) {
            envContent += `${key}=${value}\n`;
        }
        envContent += '\n';
        
        // Add default configuration from example (if exists)
        if (exampleContent) {
            envContent += '# Additional Configuration (from .env.example)\n';
            const lines = exampleContent.split('\n');
            for (const line of lines) {
                const trimmed = line.trim();
                // Skip lines that are already configured
                if (trimmed.startsWith('#') || !trimmed.includes('=')) {
                    continue;
                }
                const key = trimmed.split('=')[0].trim();
                if (!this.apiKeys[key] && !key.includes('API_KEY') && !key.includes('TOKEN') && !key.includes('SECRET')) {
                    envContent += line + '\n';
                }
            }
        }
        
        // Write to file
        fs.writeFileSync(this.envPath, envContent);
        this.log('success', '.env file created successfully');
        
        // Add to .gitignore if not already there
        this.ensureGitIgnore();
    }
    
    /**
     * Ensure .env is in .gitignore
     */
    ensureGitIgnore() {
        const gitignorePath = path.join(__dirname, '.gitignore');
        
        if (fs.existsSync(gitignorePath)) {
            const content = fs.readFileSync(gitignorePath, 'utf8');
            if (!content.includes('.env')) {
                fs.appendFileSync(gitignorePath, '\n# Environment variables\n.env\n');
                this.log('success', 'Added .env to .gitignore');
            }
        } else {
            fs.writeFileSync(gitignorePath, '# Environment variables\n.env\n');
            this.log('success', 'Created .gitignore with .env');
        }
    }
    
    /**
     * Test connections
     */
    async testConnections() {
        this.log('info', '\nTesting API connections...\n');
        
        try {
            const APIConnectionTester = require('./test-api-connections.js');
            const tester = new APIConnectionTester();
            await tester.runTests();
        } catch (error) {
            this.log('error', 'Failed to run connection tests: ' + error.message);
            this.log('info', 'You can manually test connections by running: npm run test:api');
        }
    }
}

// Run wizard if executed directly
if (require.main === module) {
    const wizard = new APIKeySetupWizard();
    wizard.run().catch(error => {
        console.error(`${colors.red}❌ Fatal error:${colors.reset}`, error);
        process.exit(1);
    });
}

module.exports = APIKeySetupWizard;
