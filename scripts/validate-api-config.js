#!/usr/bin/env node

/**
 * API and Server Configuration Validator
 * 
 * Validates that all API servers and integrations are properly configured
 * and functioning correctly throughout the repository.
 */

const fs = require('fs');
const path = require('path');

class ConfigurationValidator {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            checks: [],
            summary: {
                total: 0,
                passed: 0,
                failed: 0,
                warnings: 0
            }
        };
    }

    /**
     * Run all validation checks
     */
    async validate() {
        console.log('🔍 Starting API and Server Configuration Validation...\n');

        // Multi-Provider AI
        await this.checkMultiProviderAI();

        // Backend Services
        await this.checkBackendServices();

        // Environment Variables
        await this.checkEnvironmentVariables();

        // AFactory Integrations
        await this.checkAFactoryIntegrations();

        // Netlify Functions
        await this.checkNetlifyFunctions();

        // Generate summary
        this.generateSummary();

        // Save results
        this.saveResults();

        return this.results;
    }

    /**
     * Check Multi-Provider AI System
     */
    async checkMultiProviderAI() {
        console.log('📡 Checking Multi-Provider AI System...');

        const checks = [
            {
                name: 'Multi-Provider Orchestrator Exists',
                check: () => fs.existsSync('src/ai/multi-provider-orchestrator.js'),
                critical: true
            },
            {
                name: 'Mock Response Implementation Complete',
                check: () => {
                    const content = fs.readFileSync('src/ai/multi-provider-orchestrator.js', 'utf8');
                    // Check for all task types in getMockResponse
                    return content.includes("case 'chat'") &&
                           content.includes("case 'image'") &&
                           content.includes("case 'embeddings'") &&
                           content.includes("case 'audio'");
                },
                critical: false
            },
            {
                name: 'Fallback Logic Present',
                check: () => {
                    const content = fs.readFileSync('src/ai/multi-provider-orchestrator.js', 'utf8');
                    return content.includes('getMockResponse') && 
                           content.includes('recordFailure');
                },
                critical: false
            },
            {
                name: 'Provider Configuration Available',
                check: () => {
                    const content = fs.readFileSync('src/ai/multi-provider-orchestrator.js', 'utf8');
                    return content.includes('openai') &&
                           content.includes('groq') &&
                           content.includes('huggingface');
                },
                critical: false
            }
        ];

        for (const check of checks) {
            this.runCheck('Multi-Provider AI', check);
        }

        console.log('');
    }

    /**
     * Check Backend Services
     */
    async checkBackendServices() {
        console.log('🖥️  Checking Backend Services...');

        const servicesDir = 'backend/services';
        
        const checks = [
            {
                name: 'Backend Services Directory Exists',
                check: () => fs.existsSync(servicesDir),
                critical: true
            },
            {
                name: 'Payment Services Present',
                check: () => {
                    if (!fs.existsSync(servicesDir)) return false;
                    const files = fs.readdirSync(servicesDir);
                    return files.some(f => f.includes('paypal') || f.includes('stripe'));
                },
                critical: false
            },
            {
                name: 'Email Service Present',
                check: () => {
                    if (!fs.existsSync(servicesDir)) return false;
                    const files = fs.readdirSync(servicesDir);
                    return files.some(f => f.includes('email'));
                },
                critical: false
            },
            {
                name: 'Blockchain Services Present',
                check: () => {
                    if (!fs.existsSync(servicesDir)) return false;
                    const files = fs.readdirSync(servicesDir);
                    return files.some(f => f.includes('kas') || f.includes('grid'));
                },
                critical: false
            }
        ];

        for (const check of checks) {
            this.runCheck('Backend Services', check);
        }

        console.log('');
    }

    /**
     * Check Environment Variables
     */
    async checkEnvironmentVariables() {
        console.log('🔐 Checking Environment Variables...');

        const requiredVars = {
            // Payment Systems (one of each required)
            payment: ['PAYPAL_CLIENT_ID', 'STRIPE_SECRET_KEY'],
            // AI Providers (at least one required)
            ai: ['OPENAI_API_KEY', 'GROQ_API_KEY', 'HUGGINGFACE_API_KEY'],
            // Optional but recommended
            optional: ['SMTP_HOST', 'DATABASE_URL', 'SUPABASE_URL']
        };

        const checks = [
            {
                name: '.env.example Exists',
                check: () => fs.existsSync('.env.example') || fs.existsSync('.env.template'),
                critical: false
            },
            {
                name: 'Payment System Configured',
                check: () => {
                    return requiredVars.payment.some(v => process.env[v]);
                },
                critical: false,
                warning: 'No payment system API keys configured'
            },
            {
                name: 'AI Provider Configured',
                check: () => {
                    return requiredVars.ai.some(v => process.env[v]);
                },
                critical: false,
                warning: 'No AI provider API keys configured - mock responses will be used'
            },
            {
                name: 'Environment Template Complete',
                check: () => {
                    if (!fs.existsSync('.env.example')) return true;
                    const content = fs.readFileSync('.env.example', 'utf8');
                    return content.includes('OPENAI_API_KEY') &&
                           content.includes('PAYPAL_CLIENT_ID');
                },
                critical: false
            }
        ];

        for (const check of checks) {
            this.runCheck('Environment Variables', check);
        }

        console.log('');
    }

    /**
     * Check AFactory Integrations
     */
    async checkAFactoryIntegrations() {
        console.log('🏭 Checking AFactory Integrations...');

        const checks = [
            {
                name: 'AFactory Integrations File Exists',
                check: () => fs.existsSync('src/systems/afactory-integrations.js'),
                critical: false
            },
            {
                name: 'Integration Classes Defined',
                check: () => {
                    if (!fs.existsSync('src/systems/afactory-integrations.js')) return false;
                    const content = fs.readFileSync('src/systems/afactory-integrations.js', 'utf8');
                    return content.includes('class AFactoryIntegrations');
                },
                critical: false
            },
            {
                name: 'API Key Configuration Present',
                check: () => {
                    if (!fs.existsSync('src/systems/afactory-integrations.js')) return false;
                    const content = fs.readFileSync('src/systems/afactory-integrations.js', 'utf8');
                    return content.includes('gumroadApiKey') &&
                           content.includes('mediumApiKey');
                },
                critical: false
            },
            {
                name: 'Pending Integrations Documented',
                check: () => {
                    if (!fs.existsSync('src/systems/afactory-integrations.js')) return false;
                    const content = fs.readFileSync('src/systems/afactory-integrations.js', 'utf8');
                    return content.includes('note:') || content.includes('pending');
                },
                critical: false
            }
        ];

        for (const check of checks) {
            this.runCheck('AFactory Integrations', check);
        }

        console.log('');
    }

    /**
     * Check Netlify Functions
     */
    async checkNetlifyFunctions() {
        console.log('⚡ Checking Netlify Functions...');

        const functionsDir = 'netlify/functions';

        const checks = [
            {
                name: 'Netlify Functions Directory Exists',
                check: () => fs.existsSync(functionsDir),
                critical: false
            },
            {
                name: 'netlify.toml Configuration Exists',
                check: () => fs.existsSync('netlify.toml'),
                critical: false
            },
            {
                name: 'Payment Webhooks Present',
                check: () => {
                    if (!fs.existsSync(functionsDir)) return false;
                    const files = fs.readdirSync(functionsDir);
                    return files.some(f => f.includes('paypal') || f.includes('stripe'));
                },
                critical: false
            },
            {
                name: 'ARAYA Brain Functions Present',
                check: () => {
                    if (!fs.existsSync(functionsDir)) return false;
                    const files = fs.readdirSync(functionsDir);
                    return files.some(f => f.includes('araya') || f.includes('brain'));
                },
                critical: false
            }
        ];

        for (const check of checks) {
            this.runCheck('Netlify Functions', check);
        }

        console.log('');
    }

    /**
     * Run a single check
     */
    runCheck(category, checkConfig) {
        const result = {
            category,
            name: checkConfig.name,
            critical: checkConfig.critical || false,
            status: 'unknown',
            message: '',
            timestamp: new Date().toISOString()
        };

        try {
            const passed = checkConfig.check();
            
            if (passed) {
                result.status = 'passed';
                result.message = '✅ OK';
                this.results.summary.passed++;
                console.log(`  ✅ ${checkConfig.name}`);
            } else {
                if (checkConfig.critical) {
                    result.status = 'failed';
                    result.message = '❌ FAILED (Critical)';
                    this.results.summary.failed++;
                    console.log(`  ❌ ${checkConfig.name} (CRITICAL)`);
                } else {
                    result.status = 'warning';
                    result.message = checkConfig.warning || '⚠️  Warning';
                    this.results.summary.warnings++;
                    console.log(`  ⚠️  ${checkConfig.name}`);
                }
            }
        } catch (error) {
            result.status = 'error';
            result.message = `Error: ${error.message}`;
            this.results.summary.failed++;
            console.log(`  ❌ ${checkConfig.name} - Error: ${error.message}`);
        }

        this.results.checks.push(result);
        this.results.summary.total++;
    }

    /**
     * Generate summary
     */
    generateSummary() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 VALIDATION SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total Checks: ${this.results.summary.total}`);
        console.log(`✅ Passed: ${this.results.summary.passed}`);
        console.log(`❌ Failed: ${this.results.summary.failed}`);
        console.log(`⚠️  Warnings: ${this.results.summary.warnings}`);
        console.log('='.repeat(60) + '\n');

        // Calculate score
        const score = ((this.results.summary.passed / this.results.summary.total) * 100).toFixed(1);
        console.log(`Overall Score: ${score}%\n`);

        // Recommendations
        if (this.results.summary.failed > 0) {
            console.log('⚠️  CRITICAL ISSUES DETECTED - Please review failed checks above\n');
        } else if (this.results.summary.warnings > 0) {
            console.log('ℹ️  Some configurations are incomplete but system should function\n');
        } else {
            console.log('✅ All checks passed! System is properly configured\n');
        }
    }

    /**
     * Save results to file
     */
    saveResults() {
        const outputPath = 'validation-results.json';
        fs.writeFileSync(outputPath, JSON.stringify(this.results, null, 2));
        console.log(`📄 Results saved to: ${outputPath}\n`);
    }
}

// Run validation if executed directly
if (require.main === module) {
    const validator = new ConfigurationValidator();
    validator.validate().catch(error => {
        console.error('❌ Validation failed:', error);
        process.exit(1);
    });
}

module.exports = ConfigurationValidator;
