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
 * File: test-known-working-keys.js
 * Declaration ID: IP-2AEBB62-MLL28ZWK
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
 * Test Suite for Known Working Keys Feature
 * 
 * Tests:
 * 1. Known working keys registry initialization
 * 2. Search for known keys
 * 3. Integration with API connection manager
 * 4. Verification of all services
 * 
 * @author BarbrickDesign Platform Team
 * @version 1.0.0
 */

const path = require('path');

// Colors for output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m'
};

class KnownWorkingKeysTest {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0
        };
        
        // Initialize registry once for all tests
        const KnownWorkingKeysRegistry = require('./src/utils/known-working-keys-registry.js');
        this.registry = new KnownWorkingKeysRegistry();
    }

    log(type, message) {
        const color = type === 'error' ? colors.red :
                     type === 'success' ? colors.green :
                     type === 'info' ? colors.cyan : colors.reset;
        
        const prefix = type === 'error' ? '❌' :
                      type === 'success' ? '✅' :
                      type === 'info' ? 'ℹ️ ' : '  ';
        
        console.log(`${color}${prefix} ${message}${colors.reset}`);
    }

    async runTests() {
        console.log('\n' + '='.repeat(70));
        console.log(`${colors.cyan}🧪 Known Working Keys Test Suite${colors.reset}`);
        console.log('='.repeat(70) + '\n');

        // Test 1: Load the registry module
        await this.testLoadRegistry();

        // Test 2: Search for known keys
        await this.testSearchKnownKeys();

        // Test 3: Verify specific services
        await this.testSpecificServices();

        // Test 4: Test service info retrieval
        await this.testServiceInfo();

        // Test 5: Test known keys report generation
        await this.testReportGeneration();

        // Print summary
        this.printSummary();
        
        return this.testResults;
    }

    async testLoadRegistry() {
        this.log('info', '\n📋 Test 1: Load Known Working Keys Registry');
        
        try {
            const KnownWorkingKeysRegistry = require('./src/utils/known-working-keys-registry.js');
            const registry = new KnownWorkingKeysRegistry();
            
            if (registry && registry.registry) {
                this.log('success', 'Registry module loaded successfully');
                this.testResults.passed++;
            } else {
                this.log('error', 'Registry loaded but has no data');
                this.testResults.failed++;
            }
        } catch (error) {
            this.log('error', `Failed to load registry: ${error.message}`);
            this.testResults.failed++;
        }
        this.testResults.total++;
    }

    async testSearchKnownKeys() {
        this.log('info', '\n📋 Test 2: Search for Known Keys');

        // Get services dynamically from registry
        const testServices = Object.keys(this.registry.registry).slice(0, 4);
        
        for (const serviceId of testServices) {
            const result = this.registry.searchKnownKeys(serviceId);
            
            if (result) {
                this.log('success', `${serviceId}: Search completed`);
                if (result.found) {
                    this.log('info', `  Found: ${result.type}`);
                    if (result.limitations) {
                        this.log('info', `  Limitations: ${result.limitations}`);
                    }
                }
                this.testResults.passed++;
            } else {
                this.log('error', `${serviceId}: Search failed`);
                this.testResults.failed++;
            }
            this.testResults.total++;
        }
    }

    async testSpecificServices() {
        this.log('info', '\n📋 Test 3: Verify Specific Services');

        // Test SAM.gov DEMO_KEY
        const samgovResult = this.registry.searchKnownKeys('samgov');
        if (samgovResult.found && samgovResult.key === 'DEMO_KEY') {
            this.log('success', 'SAM.gov DEMO_KEY found');
            this.testResults.passed++;
        } else {
            this.log('error', 'SAM.gov DEMO_KEY not found');
            this.testResults.failed++;
        }
        this.testResults.total++;

        // Test CoinGecko public endpoint
        const coingeckoResult = this.registry.searchKnownKeys('coingecko');
        if (coingeckoResult.found && coingeckoResult.type === 'public_endpoint') {
            this.log('success', 'CoinGecko public endpoint available');
            this.testResults.passed++;
        } else {
            this.log('error', 'CoinGecko public endpoint not found');
            this.testResults.failed++;
        }
        this.testResults.total++;

        // Test GitHub public endpoint
        const githubResult = this.registry.searchKnownKeys('github');
        if (githubResult.found && githubResult.type === 'public_endpoint') {
            this.log('success', 'GitHub public endpoint available');
            this.testResults.passed++;
        } else {
            this.log('error', 'GitHub public endpoint not found');
            this.testResults.failed++;
        }
        this.testResults.total++;

        // Test OpenAI (should require key)
        const openaiResult = this.registry.searchKnownKeys('openai');
        if (!openaiResult.found && openaiResult.requiresKey) {
            this.log('success', 'OpenAI correctly requires API key');
            this.testResults.passed++;
        } else {
            this.log('error', 'OpenAI key requirement check failed');
            this.testResults.failed++;
        }
        this.testResults.total++;
    }

    async testServiceInfo() {
        this.log('info', '\n📋 Test 4: Service Info Retrieval');

        const testServices = ['samgov', 'coingecko', 'github'];
        
        for (const serviceId of testServices) {
            const info = this.registry.getServiceInfo(serviceId);
            
            if (info && info.found) {
                this.log('success', `${serviceId}: Service info retrieved`);
                this.log('info', `  Name: ${info.name}`);
                this.log('info', `  Requires Key: ${info.requiresKey}`);
                this.log('info', `  Has Public Endpoint: ${info.hasPublicEndpoint}`);
                this.testResults.passed++;
            } else {
                this.log('error', `${serviceId}: Failed to retrieve service info`);
                this.testResults.failed++;
            }
            this.testResults.total++;
        }
    }

    async testReportGeneration() {
        this.log('info', '\n📋 Test 5: Report Generation');

        try {
            const report = this.registry.generateReport();
            
            if (report && report.length > 0) {
                this.log('success', 'Report generated successfully');
                this.log('info', `Report length: ${report.length} characters`);
                
                // Check for key content - verifying service names in report text
                // Note: This is not URL validation, just checking for expected strings in report
                if (report.includes('SAM.gov') && report.includes('CoinGecko')) {
                    this.log('success', 'Report contains expected services');
                    this.testResults.passed++;
                } else {
                    this.log('error', 'Report missing expected services');
                    this.testResults.failed++;
                }
            } else {
                this.log('error', 'Report generation failed');
                this.testResults.failed++;
            }
        } catch (error) {
            this.log('error', `Report generation error: ${error.message}`);
            this.testResults.failed++;
        }
        this.testResults.total++;

        // Test getServicesWithKnownKeys
        try {
            const services = this.registry.getServicesWithKnownKeys();
            
            if (services && Array.isArray(services) && services.length > 0) {
                this.log('success', `Found ${services.length} services with known keys`);
                for (const service of services) {
                    this.log('info', `  - ${service.serviceName} (${service.type})`);
                }
                this.testResults.passed++;
            } else {
                this.log('error', 'No services with known keys found');
                this.testResults.failed++;
            }
        } catch (error) {
            this.log('error', `Service listing error: ${error.message}`);
            this.testResults.failed++;
        }
        this.testResults.total++;
    }

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
        console.log(`  ${colors.cyan}Pass Rate:      ${passRate}%${colors.reset}\n`);
        
        if (this.testResults.failed === 0) {
            console.log(`${colors.green}🎉 All tests passed!${colors.reset}\n`);
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
    const tester = new KnownWorkingKeysTest();
    tester.runTests().catch(error => {
        console.error(`${colors.red}❌ Fatal error:${colors.reset}`, error);
        process.exit(1);
    });
}

module.exports = KnownWorkingKeysTest;
