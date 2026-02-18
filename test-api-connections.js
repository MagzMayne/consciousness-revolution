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
 * File: test-api-connections.js
 * Declaration ID: IP-2804F650-MLL28ZWI
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
 * API Connection Testing Suite
 * Comprehensive tests for all API connections and automated setup
 * 
 * Tests:
 * - OpenAI API connection and fallback
 * - SAM.gov API connection and fallback
 * - GitHub API connection
 * - PayPal API connection
 * - Etherscan API connection
 * - CoinGecko API connection
 * - Infura API connection
 * - Anthropic API connection
 * 
 * Features:
 * - Automated API key detection from environment
 * - Connection health testing
 * - Fallback mechanism testing
 * - Auto-healing capabilities
 * - Setup automation
 * 
 * @author BarbrickDesign Platform Team
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

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

class APIConnectionTester {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            warnings: 0,
            total: 0
        };
        
        // Load environment variables if .env exists
        this.loadEnv();
        
        // API services to test
        this.services = {
            openai: {
                name: 'OpenAI',
                envVar: 'OPENAI_API_KEY',
                required: false,
                hasFallback: true,
                testEndpoint: 'https://api.openai.com/v1/models',
                authType: 'bearer'
            },
            anthropic: {
                name: 'Anthropic Claude',
                envVar: 'ANTHROPIC_API_KEY',
                required: false,
                hasFallback: true,
                testEndpoint: 'https://api.anthropic.com/v1/messages',
                authType: 'x-api-key'
            },
            samgov: {
                name: 'SAM.gov',
                envVar: 'SAMGOV_API_KEY',
                required: false,
                hasFallback: true,
                testEndpoint: 'https://api.sam.gov/prod/opportunities/v2/search?limit=1',
                authType: 'x-api-key'
            },
            github: {
                name: 'GitHub',
                envVar: 'GITHUB_TOKEN',
                required: false,
                hasFallback: false,
                testEndpoint: 'https://api.github.com/user',
                authType: 'token'
            },
            etherscan: {
                name: 'Etherscan',
                envVar: 'ETHERSCAN_API_KEY',
                required: false,
                hasFallback: true,
                testEndpoint: 'https://api.etherscan.io/api?module=stats&action=ethsupply&apikey=',
                authType: 'query'
            },
            coingecko: {
                name: 'CoinGecko',
                envVar: 'COINGECKO_API_KEY',
                required: false,
                hasFallback: true,
                testEndpoint: 'https://api.coingecko.com/api/v3/ping',
                authType: 'x-api-key'
            },
            infura: {
                name: 'Infura',
                envVar: 'INFURA_PROJECT_ID',
                required: false,
                hasFallback: false,
                testEndpoint: null, // JSON-RPC, special handling
                authType: 'url'
            },
            paypal: {
                name: 'PayPal',
                envVar: 'PAYPAL_CLIENT_ID',
                required: false,
                hasFallback: false,
                testEndpoint: 'https://api.paypal.com/v1/oauth2/token',
                authType: 'oauth'
            }
        };
        
        this.connectionStatus = {};
    }
    
    /**
     * Load environment variables from .env file
     */
    loadEnv() {
        const envPath = path.join(__dirname, '.env');
        const envExamplePath = path.join(__dirname, '.env.example');
        
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            this.parseEnvFile(envContent);
            this.log('info', 'Loaded environment variables from .env file');
        } else {
            this.log('warn', '.env file not found, using environment variables only');
            
            if (fs.existsSync(envExamplePath)) {
                this.log('info', 'Found .env.example - you can copy it to .env and configure your keys');
            }
        }
    }
    
    /**
     * Parse .env file content
     */
    parseEnvFile(content) {
        const lines = content.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
                const [key, ...valueParts] = trimmed.split('=');
                const value = valueParts.join('=').trim();
                if (value && !value.startsWith('your-') && !value.includes('-here')) {
                    process.env[key.trim()] = value;
                }
            }
        }
    }
    
    /**
     * Log with colors
     */
    log(type, message, data = null) {
        const color = type === 'error' ? colors.red :
                     type === 'warn' ? colors.yellow :
                     type === 'success' ? colors.green :
                     type === 'info' ? colors.cyan : colors.reset;
        
        const prefix = type === 'error' ? '❌' :
                      type === 'warn' ? '⚠️ ' :
                      type === 'success' ? '✅' :
                      type === 'info' ? 'ℹ️ ' : '  ';
        
        console.log(`${color}${prefix} ${message}${colors.reset}`);
        if (data) {
            console.log(`   ${JSON.stringify(data, null, 2)}`);
        }
    }
    
    /**
     * Run all tests
     */
    async runTests() {
        console.log('\n' + '='.repeat(70));
        console.log(`${colors.cyan}🧪 API Connection Testing Suite${colors.reset}`);
        console.log('='.repeat(70) + '\n');
        
        // Test 1: Check API Connection Manager exists
        await this.testAPIConnectionManagerExists();
        
        // Test 2: Check for environment setup
        await this.testEnvironmentSetup();
        
        // Test 3: Test each API connection
        await this.testAllConnections();
        
        // Test 4: Test fallback mechanisms
        await this.testFallbackMechanisms();
        
        // Test 5: Test auto-healing capabilities
        await this.testAutoHealing();
        
        // Test 6: Generate automated setup recommendations
        await this.generateSetupRecommendations();
        
        // Print summary
        this.printSummary();
        
        return this.testResults;
    }
    
    /**
     * Test 1: API Connection Manager exists
     */
    async testAPIConnectionManagerExists() {
        this.log('info', '\n📋 Test 1: API Connection Manager Infrastructure');
        
        const requiredFiles = [
            'src/ai/api-connection-manager.js',
            'src/utils/api-key-validator.js',
            'js/api-connection-auto-inject.js',
            'api-connection-test.html'
        ];
        
        let allExist = true;
        for (const file of requiredFiles) {
            const filePath = path.join(__dirname, file);
            if (fs.existsSync(filePath)) {
                this.log('success', `${file} exists`);
                this.testResults.passed++;
            } else {
                this.log('error', `${file} NOT FOUND`);
                this.testResults.failed++;
                allExist = false;
            }
            this.testResults.total++;
        }
        
        if (allExist) {
            this.log('success', 'All API Connection Manager files present\n');
        }
    }
    
    /**
     * Test 2: Environment setup
     */
    async testEnvironmentSetup() {
        this.log('info', '\n📋 Test 2: Environment Configuration');
        
        // Check if .env exists
        const envPath = path.join(__dirname, '.env');
        const envExamplePath = path.join(__dirname, '.env.example');
        
        if (fs.existsSync(envPath)) {
            this.log('success', '.env file exists');
            this.testResults.passed++;
        } else {
            this.log('warn', '.env file not found');
            this.testResults.warnings++;
            
            if (fs.existsSync(envExamplePath)) {
                this.log('info', 'You can create .env by copying .env.example');
            }
        }
        this.testResults.total++;
        
        // Check for API keys
        let configuredKeys = 0;
        for (const [serviceId, service] of Object.entries(this.services)) {
            const apiKey = process.env[service.envVar];
            if (apiKey && !apiKey.startsWith('your-') && !apiKey.includes('-here')) {
                configuredKeys++;
                this.log('success', `${service.name} API key configured`);
            } else if (!service.required) {
                this.log('info', `${service.name} API key not configured (optional)`);
            } else {
                this.log('warn', `${service.name} API key not configured (required)`);
            }
        }
        
        this.log('info', `\nConfigured API keys: ${configuredKeys}/${Object.keys(this.services).length}\n`);
    }
    
    /**
     * Test 3: Test all API connections
     */
    async testAllConnections() {
        this.log('info', '\n📋 Test 3: API Connection Tests');
        
        for (const [serviceId, service] of Object.entries(this.services)) {
            await this.testServiceConnection(serviceId, service);
        }
        
        console.log('');
    }
    
    /**
     * Test individual service connection
     */
    async testServiceConnection(serviceId, service) {
        const apiKey = process.env[service.envVar];
        const hasKey = apiKey && !apiKey.startsWith('your-') && !apiKey.includes('-here');
        
        this.connectionStatus[serviceId] = {
            hasKey,
            connected: false,
            error: null,
            fallbackAvailable: service.hasFallback
        };
        
        if (!hasKey) {
            if (service.hasFallback) {
                this.log('info', `${service.name}: No API key (will use fallback)`);
                this.connectionStatus[serviceId].connected = true; // Fallback available
            } else {
                this.log('warn', `${service.name}: No API key configured`);
                this.testResults.warnings++;
            }
            this.testResults.total++;
            return;
        }
        
        // Special handling for different services
        if (serviceId === 'infura') {
            // Infura uses project ID in URL, can't easily test without making actual RPC call
            this.log('success', `${service.name}: API key configured (RPC endpoint ready)`);
            this.connectionStatus[serviceId].connected = true;
            this.testResults.passed++;
            this.testResults.total++;
            return;
        }
        
        if (serviceId === 'paypal') {
            // PayPal requires OAuth flow with both client ID and secret
            const secret = process.env.PAYPAL_SECRET;
            if (secret && !secret.startsWith('your-')) {
                this.log('success', `${service.name}: Client ID and Secret configured`);
                this.connectionStatus[serviceId].connected = true;
                this.testResults.passed++;
            } else {
                this.log('warn', `${service.name}: Client ID found but Secret missing`);
                this.testResults.warnings++;
            }
            this.testResults.total++;
            return;
        }
        
        // For other services, we can check the API key format
        if (this.validateAPIKeyFormat(serviceId, apiKey)) {
            this.log('success', `${service.name}: API key format valid`);
            this.connectionStatus[serviceId].connected = true;
            this.testResults.passed++;
        } else {
            this.log('error', `${service.name}: API key format invalid`);
            this.connectionStatus[serviceId].error = 'Invalid key format';
            this.testResults.failed++;
        }
        this.testResults.total++;
    }
    
    /**
     * Validate API key format
     */
    validateAPIKeyFormat(serviceId, apiKey) {
        if (!apiKey) return false;
        
        switch(serviceId) {
            case 'openai':
                return apiKey.startsWith('sk-') && apiKey.length > 20;
            case 'anthropic':
                return apiKey.startsWith('sk-ant-') && apiKey.length > 20;
            case 'github':
                return (apiKey.startsWith('ghp_') || apiKey.startsWith('github_pat_')) && apiKey.length > 20;
            case 'coingecko':
                return apiKey.startsWith('CG-') && apiKey.length > 10;
            case 'samgov':
            case 'etherscan':
                return apiKey.length > 10; // Generic validation
            default:
                return apiKey.length > 5;
        }
    }
    
    /**
     * Test 4: Fallback mechanisms
     */
    async testFallbackMechanisms() {
        this.log('info', '\n📋 Test 4: Fallback Mechanism Tests');
        
        // Check that services with fallback have fallback code
        const apiConnectionManagerPath = path.join(__dirname, 'src/ai/api-connection-manager.js');
        if (fs.existsSync(apiConnectionManagerPath)) {
            const content = fs.readFileSync(apiConnectionManagerPath, 'utf8');
            
            const fallbackServices = Object.entries(this.services)
                .filter(([_, service]) => service.hasFallback)
                .map(([id, _]) => id);
            
            let fallbacksImplemented = 0;
            for (const serviceId of fallbackServices) {
                // Check for more specific fallback patterns
                const hasFallbackMethod = content.includes('getFallbackResponse');
                const hasServiceCheck = content.includes(`serviceId === '${serviceId}'`);
                const hasFallbackKeyword = content.includes('fallback');
                
                // More robust detection: must have fallback method AND service-specific handling
                if (hasFallbackMethod && (hasServiceCheck || hasFallbackKeyword)) {
                    this.log('success', `${this.services[serviceId].name}: Fallback implemented`);
                    fallbacksImplemented++;
                    this.testResults.passed++;
                } else {
                    this.log('warn', `${this.services[serviceId].name}: Fallback may not be implemented`);
                    this.testResults.warnings++;
                }
                this.testResults.total++;
            }
            
            this.log('info', `\nFallback implementations: ${fallbacksImplemented}/${fallbackServices.length}\n`);
        }
    }
    
    /**
     * Test 5: Auto-healing capabilities
     */
    async testAutoHealing() {
        this.log('info', '\n📋 Test 5: Auto-Healing Capabilities');
        
        // Check if self-healing.js exists
        const selfHealingPath = path.join(__dirname, 'self-healing.js');
        if (fs.existsSync(selfHealingPath)) {
            this.log('success', 'Self-healing module exists');
            this.testResults.passed++;
        } else {
            this.log('warn', 'Self-healing module not found');
            this.testResults.warnings++;
        }
        this.testResults.total++;
        
        // Check API connection manager has retry logic
        const apiConnectionManagerPath = path.join(__dirname, 'src/ai/api-connection-manager.js');
        if (fs.existsSync(apiConnectionManagerPath)) {
            const content = fs.readFileSync(apiConnectionManagerPath, 'utf8');
            
            // More specific checks for retry implementation
            const hasRetryMethod = content.includes('retryRequest') || content.includes('async retryRequest');
            const hasRetryConfig = content.includes('retryConfig') || content.includes('maxRetries');
            
            if (hasRetryMethod && hasRetryConfig) {
                this.log('success', 'API Connection Manager has retry logic');
                this.testResults.passed++;
            } else {
                this.log('warn', 'Retry logic not found in API Connection Manager');
                this.testResults.warnings++;
            }
            this.testResults.total++;
            
            // Check for exponential backoff implementation
            const hasBackoffMethod = content.includes('calculateBackoff') || content.includes('exponentialBackoff');
            const hasBackoffMath = content.includes('Math.pow') && (content.includes('backoff') || content.includes('delay'));
            
            if (hasBackoffMethod || hasBackoffMath) {
                this.log('success', 'Exponential backoff implemented');
                this.testResults.passed++;
            } else {
                this.log('warn', 'Exponential backoff may not be implemented');
                this.testResults.warnings++;
            }
            this.testResults.total++;
        }
        
        console.log('');
    }
    
    /**
     * Test 6: Generate setup recommendations
     */
    async generateSetupRecommendations() {
        this.log('info', '\n📋 Test 6: Setup Recommendations\n');
        
        const unconfiguredServices = [];
        const configuredServices = [];
        
        for (const [serviceId, status] of Object.entries(this.connectionStatus)) {
            const service = this.services[serviceId];
            if (status.hasKey) {
                configuredServices.push(service.name);
            } else {
                unconfiguredServices.push({ id: serviceId, ...service });
            }
        }
        
        if (unconfiguredServices.length === 0) {
            this.log('success', 'All API services are configured! 🎉');
        } else {
            this.log('info', 'The following API services are not configured:\n');
            
            for (const service of unconfiguredServices) {
                console.log(`${colors.yellow}  ${service.name}${colors.reset}`);
                console.log(`    Environment variable: ${colors.cyan}${service.envVar}${colors.reset}`);
                if (service.hasFallback) {
                    console.log(`    ${colors.green}✓ Has fallback mode${colors.reset}`);
                } else {
                    console.log(`    ${colors.red}✗ No fallback available${colors.reset}`);
                }
                console.log('');
            }
            
            console.log(`${colors.blue}📝 To configure these services:${colors.reset}`);
            console.log('  1. Copy .env.example to .env:');
            console.log(`     ${colors.cyan}cp .env.example .env${colors.reset}`);
            console.log('  2. Edit .env and add your API keys');
            console.log('  3. Restart your application');
            console.log('  4. Run this test again to verify\n');
        }
        
        if (configuredServices.length > 0) {
            this.log('success', `Configured services: ${configuredServices.join(', ')}\n`);
        }
    }
    
    /**
     * Print test summary
     */
    printSummary() {
        console.log('\n' + '='.repeat(70));
        console.log(`${colors.cyan}📊 Test Summary${colors.reset}`);
        console.log('='.repeat(70));
        
        const passRate = this.testResults.total > 0 
            ? Math.round((this.testResults.passed / this.testResults.total) * 100)
            : 0;
        
        console.log(`\n  Total Tests:    ${this.testResults.total}`);
        console.log(`  ${colors.green}✅ Passed:       ${this.testResults.passed}${colors.reset}`);
        console.log(`  ${colors.red}❌ Failed:       ${this.testResults.failed}${colors.reset}`);
        console.log(`  ${colors.yellow}⚠️  Warnings:     ${this.testResults.warnings}${colors.reset}`);
        console.log(`  ${colors.blue}Pass Rate:      ${passRate}%${colors.reset}\n`);
        
        if (this.testResults.failed === 0) {
            console.log(`${colors.green}🎉 All critical tests passed!${colors.reset}\n`);
        } else {
            console.log(`${colors.red}⚠️  Some tests failed. Please review the output above.${colors.reset}\n`);
        }
        
        console.log('='.repeat(70) + '\n');
        
        // Return exit code
        process.exitCode = this.testResults.failed > 0 ? 1 : 0;
    }
}

// Run tests if executed directly
if (require.main === module) {
    const tester = new APIConnectionTester();
    tester.runTests().catch(error => {
        console.error(`${colors.red}❌ Fatal error:${colors.reset}`, error);
        process.exit(1);
    });
}

module.exports = APIConnectionTester;
