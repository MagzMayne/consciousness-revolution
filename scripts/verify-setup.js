#!/usr/bin/env node

/**
 * Setup Verification Script
 * 
 * This script validates the development environment:
 * 1. Checks Node.js version
 * 2. Validates required dependencies
 * 3. Checks for required environment variables
 * 4. Validates security configuration
 * 5. Tests file permissions
 * 
 * Usage: npm run verify:setup
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

let passedChecks = 0;
let failedChecks = 0;
let warnings = 0;

function check(name, fn, critical = false) {
    try {
        const result = fn();
        if (result === true) {
            log(`   ✅ ${name}`, 'green');
            passedChecks++;
        } else if (result === 'warning') {
            log(`   ⚠️  ${name}`, 'yellow');
            warnings++;
        } else {
            log(`   ❌ ${name}`, 'red');
            if (critical) {
                failedChecks++;
            } else {
                warnings++;
            }
        }
        return result;
    } catch (error) {
        log(`   ❌ ${name}: ${error.message}`, 'red');
        if (critical) {
            failedChecks++;
        } else {
            warnings++;
        }
        return false;
    }
}

function main() {
    log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
    log('║         🔍 Setup Verification - Environment Check          ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');
    
    // 1. Node.js Version Check
    log('📦 Checking Node.js version...', 'blue');
    check('Node.js version >= 16.0.0', () => {
        const version = process.version;
        const major = parseInt(version.split('.')[0].substring(1));
        if (major >= 16) {
            log(`      Current version: ${version}`, 'green');
            return true;
        } else {
            log(`      Current version: ${version} (required: >= 16.0.0)`, 'red');
            return false;
        }
    }, true);
    
    // 2. Dependencies Check
    log('\n📚 Checking dependencies...', 'blue');
    check('package.json exists', () => {
        return fs.existsSync(path.join(process.cwd(), 'package.json'));
    }, true);
    
    check('node_modules directory exists', () => {
        const exists = fs.existsSync(path.join(process.cwd(), 'node_modules'));
        if (!exists) {
            log('      Run: npm install', 'yellow');
        }
        return exists ? true : 'warning';
    });
    
    // 3. Environment Variables Check
    log('\n🔑 Checking environment configuration...', 'blue');
    const envPath = path.join(process.cwd(), '.env');
    const envExists = check('.env file exists', () => {
        const exists = fs.existsSync(envPath);
        if (!exists) {
            log('      Run: npm run onboard', 'yellow');
        }
        return exists ? true : 'warning';
    });
    
    if (envExists === true) {
        check('UNIVERSE_KEY is set', () => {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const hasKey = envContent.includes('UNIVERSE_KEY=') && 
                          !envContent.includes('UNIVERSE_KEY=your-unique-uuid-here');
            if (!hasKey) {
                log('      UNIVERSE_KEY not configured', 'yellow');
            }
            return hasKey ? true : 'warning';
        });
        
        check('NODE_ENV is set', () => {
            const envContent = fs.readFileSync(envPath, 'utf8');
            return envContent.includes('NODE_ENV=');
        });
        
        check('PORT is set', () => {
            const envContent = fs.readFileSync(envPath, 'utf8');
            return envContent.includes('PORT=');
        });
        
        check('.env has secure permissions (600)', () => {
            try {
                const stats = fs.statSync(envPath);
                const mode = stats.mode & 0o777;
                if (mode === 0o600) {
                    return true;
                } else {
                    log(`      Current permissions: ${mode.toString(8)} (recommended: 600)`, 'yellow');
                    log('      Run: chmod 600 .env', 'yellow');
                    return 'warning';
                }
            } catch (error) {
                return 'warning';
            }
        });
    }
    
    // 4. Security Configuration
    log('\n🛡️  Checking security configuration...', 'blue');
    check('.gitignore exists', () => {
        return fs.existsSync(path.join(process.cwd(), '.gitignore'));
    }, true);
    
    check('.env is in .gitignore', () => {
        const gitignorePath = path.join(process.cwd(), '.gitignore');
        if (fs.existsSync(gitignorePath)) {
            const content = fs.readFileSync(gitignorePath, 'utf8');
            if (content.includes('.env')) {
                return true;
            } else {
                log('      Add .env to .gitignore immediately!', 'yellow');
                return 'warning';
            }
        }
        return false;
    }, true);
    
    check('Pre-commit hook installed', () => {
        const hookPath = path.join(process.cwd(), '.git', 'hooks', 'pre-commit');
        const exists = fs.existsSync(hookPath);
        if (!exists) {
            log('      Run: npm run setup:git-hooks', 'yellow');
        }
        return exists ? true : 'warning';
    });
    
    // 5. Git Configuration
    log('\n🔧 Checking git configuration...', 'blue');
    check('Git repository initialized', () => {
        return fs.existsSync(path.join(process.cwd(), '.git'));
    }, true);
    
    check('Git user configured', () => {
        try {
            execSync('git config user.name', { stdio: 'pipe' });
            execSync('git config user.email', { stdio: 'pipe' });
            return true;
        } catch (error) {
            log('      Run: git config --global user.name "Your Name"', 'yellow');
            log('      Run: git config --global user.email "your@email.com"', 'yellow');
            return 'warning';
        }
    });
    
    // 6. Project Files
    log('\n📄 Checking project files...', 'blue');
    check('README.md exists', () => {
        return fs.existsSync(path.join(process.cwd(), 'README.md'));
    });
    
    check('DEVELOPER_ONBOARDING.md exists', () => {
        const exists = fs.existsSync(path.join(process.cwd(), 'DEVELOPER_ONBOARDING.md'));
        if (!exists) {
            log('      Developer onboarding guide not found', 'yellow');
        }
        return exists ? true : 'warning';
    });
    
    // Summary
    log('\n╔════════════════════════════════════════════════════════════╗', 'bright');
    log('║                    📊 Verification Results                  ║', 'bright');
    log('╚════════════════════════════════════════════════════════════╝', 'bright');
    
    log(`\n   ✅ Passed: ${passedChecks}`, 'green');
    log(`   ⚠️  Warnings: ${warnings}`, 'yellow');
    log(`   ❌ Failed: ${failedChecks}`, failedChecks > 0 ? 'red' : 'green');
    
    if (failedChecks === 0 && warnings === 0) {
        log('\n🎉 Perfect! Your environment is fully configured!', 'green');
        log('\n🚀 You\'re ready to start developing!', 'green');
        log('   Run: npm start\n', 'cyan');
        process.exit(0);
    } else if (failedChecks === 0) {
        log('\n✅ Your environment is functional with some optional improvements.', 'yellow');
        log('   Address warnings above for best practices.\n', 'yellow');
        process.exit(0);
    } else {
        log('\n❌ Setup incomplete. Please address failed checks above.', 'red');
        log('   Critical issues must be resolved before development.\n', 'red');
        process.exit(1);
    }
}

main();
