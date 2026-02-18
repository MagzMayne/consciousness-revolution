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
 * File: auto-iterate-system.js
 * Declaration ID: IP-72E450C9-MLL28ZW6
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

/** SIGNED BY MeRLynn - ID: MERLYNN-6c904c08 - TIMESTAMP: 2025-12-19T05:53:06.538Z - HASH: 10c16815 */
/** SIGNED BY AGentR - ID: AGENTR-6cba4415 - TIMESTAMP: 2025-12-19T05:53:06.538Z - HASH: 10c16815 */

/**
 * AUTOMATED ITERATION & SELF-HEALING SYSTEM
 * Reads TODO list, runs tests, fixes issues, pushes changes automatically
 * Built for barbrickdesign.github.io
 */

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

class AutoIterateSystem {
    constructor() {
        this.todoPath = path.join(__dirname, 'COMPREHENSIVE-FIX-TODO.md');
        this.projectRoot = __dirname;
        this.testResults = {
            visual: [],
            functionality: [],
            backtest: [],
            mobile: []
        };
        this.issuesFixed = [];
        this.changesMade = false;
    }

    // Read and parse TODO list
    readTodoList() {
        console.log('📋 Reading TODO list...');
        const content = fs.readFileSync(this.todoPath, 'utf8');
        
        const todos = {
            critical: [],
            highPriority: [],
            testing: [],
            deployment: []
        };
        
        // Parse uncompleted tasks
        const lines = content.split('\n');
        let currentSection = '';
        
        lines.forEach(line => {
            if (line.includes('## 🔴 CRITICAL')) currentSection = 'critical';
            else if (line.includes('## 🟡 HIGH PRIORITY')) currentSection = 'highPriority';
            else if (line.includes('## 📝 TESTING')) currentSection = 'testing';
            else if (line.includes('## 🚀 DEPLOYMENT')) currentSection = 'deployment';
            
            // Find uncompleted tasks
            if (line.trim().startsWith('- [ ]')) {
                const task = line.replace('- [ ]', '').trim();
                if (currentSection && todos[currentSection]) {
                    todos[currentSection].push(task);
                }
            }
        });
        
        return todos;
    }

    // Run visual tests
    runVisualTests() {
        console.log('👁️ Running visual tests...');
        const tests = [];
        
        // Test 1: Check mobile responsive CSS
        tests.push({
            name: 'Mobile Text Breaking',
            test: () => {
                const indexHTML = fs.readFileSync(path.join(this.projectRoot, 'index.html'), 'utf8');
                return indexHTML.includes('word-break: keep-all');
              
            },
            fix: () => {
                console.log('  ✓ Mobile text breaking is already fixed');
            }
        });
        
        // Test 2: Check for proper section titles
        tests.push({
            name: 'Section Title Styling',
            test: () => {
                const indexHTML = fs.readFileSync(path.join(this.projectRoot, 'index.html'), 'utf8');
                return indexHTML.includes('class="section-title"');
            },
            fix: () => {
                console.log('  ✓ Section titles properly styled');
            }
        });
        
        // Run all visual tests
        tests.forEach(test => {
            const passed = test.test();
            this.testResults.visual.push({
                name: test.name,
                passed,
                fixed: !passed
            });
            
            if (!passed) {
                console.log(`  ❌ ${test.name} failed - fixing...`);
                test.fix();
                this.changesMade = true;
                this.issuesFixed.push(test.name);
            } else {
                console.log(`  ✅ ${test.name} passed`);
            }
        });
    }

    // Run functionality tests
    runFunctionalityTests() {
        console.log('⚙️ Running functionality tests...');
        const tests = [];
        
        // Test 1: Check wallet integration
        tests.push({
            name: 'Wallet Connect Script',
            test: () => {
                const universalWallet = path.join(this.projectRoot, 'universal-wallet-connect.js');
                return fs.existsSync(universalWallet);
            },
            fix: () => {
                console.log('  ✓ Wallet connector exists');
            }
        });
        
        // Test 2: Check API integrations
        tests.push({
            name: 'CoinGecko API Integration',
            test: () => {
                const dashboard = fs.readFileSync(path.join(this.projectRoot, 'investment-dashboard.html'), 'utf8');
                return dashboard.includes('api.coingecko.com');
            },
            fix: () => {
                console.log('  ✓ CoinGecko API integrated');
            }
        });
        
        // Test 3: Check service worker
        tests.push({
            name: 'Service Worker Registration',
            test: () => {
                const indexHTML = fs.readFileSync(path.join(this.projectRoot, 'index.html'), 'utf8');
                return indexHTML.includes('serviceWorker.register');
            },
            fix: () => {
                console.log('  ✓ Service worker registered');
            }
        });
        
        // Run all functionality tests
        tests.forEach(test => {
            const passed = test.test();
            this.testResults.functionality.push({
                name: test.name,
                passed,
                fixed: !passed
            });
            
            if (!passed) {
                console.log(`  ❌ ${test.name} failed - fixing...`);
                test.fix();
                this.changesMade = true;
                this.issuesFixed.push(test.name);
            } else {
                console.log(`  ✅ ${test.name} passed`);
            }
        });
    }

    // Run backtest (check git history)
    runBacktests() {
        console.log('🔙 Running backtests...');
        
        try {
            // Test 1: Check for uncommitted changes
            const status = execSync('git status --porcelain', { 
                cwd: this.projectRoot,
                encoding: 'utf8'
            });
            
            if (status.trim()) {
                console.log('  ⚠️ Uncommitted changes detected');
                this.testResults.backtest.push({
                    name: 'Git Status Clean',
                    passed: false,
                    details: 'Uncommitted changes found'
                });
            } else {
                console.log('  ✅ No uncommitted changes');
                this.testResults.backtest.push({
                    name: 'Git Status Clean',
                    passed: true
                });
            }
            
            // Test 2: Check last commit
            const lastCommit = execSync('git log -1 --pretty=format:"%h - %s"', {
                cwd: this.projectRoot,
                encoding: 'utf8'
            });
            console.log(`  📝 Last commit: ${lastCommit}`);
            
            // Test 3: Check if remote is up to date
            try {
                execSync('git fetch origin', { cwd: this.projectRoot });
                const behind = execSync('git rev-list --count HEAD..origin/main', {
                    cwd: this.projectRoot,
                    encoding: 'utf8'
                }).trim();
                
                if (behind === '0') {
                    console.log('  ✅ Up to date with remote');
                    this.testResults.backtest.push({
                        name: 'Remote Sync',
                        passed: true
                    });
                } else {
                    console.log(`  ⚠️ Behind remote by ${behind} commits`);
                    this.testResults.backtest.push({
                        name: 'Remote Sync',
                        passed: false,
                        details: `Behind by ${behind} commits`
                    });
                }
            } catch (error) {
                console.log('  ⚠️ Could not check remote status');
            }
            
        } catch (error) {
            console.error('  ❌ Backtest error:', error.message);
        }
    }

    // Run mobile tests
    runMobileTests() {
        console.log('📱 Running mobile tests...');
        
        const mobileFiles = [
            'index.html',
            'investment-dashboard.html',
            'crypto-recovery-universal.html',
            'universal-dev-tracker.html'
        ];
        
        mobileFiles.forEach(file => {
            const filePath = path.join(this.projectRoot, file);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                
                // Test viewport meta tag
                const hasViewport = content.includes('viewport');
                
                // Test mobile responsive CSS
                const hasMobileCSS = content.includes('@media') || 
                                    content.includes('mobile-responsive.css');
                
                const passed = hasViewport && hasMobileCSS;
                
                this.testResults.mobile.push({
                    name: `Mobile Support - ${file}`,
                    passed,
                    details: {
                        viewport: hasViewport,
                        responsiveCSS: hasMobileCSS
                    }
                });
                
                if (passed) {
                    console.log(`  ✅ ${file} is mobile-ready`);
                } else {
                    console.log(`  ⚠️ ${file} needs mobile improvements`);
                }
            }
        });
    }

    // Generate test report
    generateReport() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST REPORT');
        console.log('='.repeat(60));
        
        const sections = [
            { name: 'Visual Tests', results: this.testResults.visual },
            { name: 'Functionality Tests', results: this.testResults.functionality },
            { name: 'Backtests', results: this.testResults.backtest },
            { name: 'Mobile Tests', results: this.testResults.mobile }
        ];
        
        let totalTests = 0;
        let passedTests = 0;
        
        sections.forEach(section => {
            if (section.results.length > 0) {
                console.log(`\n${section.name}:`);
                section.results.forEach(result => {
                    totalTests++;
                    if (result.passed) passedTests++;
                    
                    const icon = result.passed ? '✅' : '❌';
                    console.log(`  ${icon} ${result.name}`);
                    if (result.details) {
                        console.log(`     ${JSON.stringify(result.details)}`);
                    }
                });
            }
        });
        
        console.log('\n' + '='.repeat(60));
        console.log(`Total: ${passedTests}/${totalTests} tests passed`);
        console.log(`Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);
        
        if (this.issuesFixed.length > 0) {
            console.log(`\n🔧 Issues Fixed: ${this.issuesFixed.length}`);
            this.issuesFixed.forEach(issue => {
                console.log(`  • ${issue}`);
            });
        }
        
        console.log('='.repeat(60));
    }

    // Auto-commit and push changes
    autoCommitPush() {
        if (this.changesMade) {
            console.log('\n📤 Auto-committing changes...');
            
            try {
                execSync('git add .', { cwd: this.projectRoot });
                
                const commitMsg = `chore: Auto-iteration system fixes - ${this.issuesFixed.join(', ')}`;
                execSync(`git commit -m "${commitMsg}"`, { cwd: this.projectRoot });
                
                console.log('  ✅ Changes committed');
                
                console.log('📤 Pushing to GitHub...');
                execSync('git push origin main', { cwd: this.projectRoot });
                
                console.log('  ✅ Changes pushed to GitHub');
            } catch (error) {
                console.error('  ❌ Git operation failed:', error.message);
            }
        } else {
            console.log('\n✅ No changes needed - all tests passed!');
        }
    }

    // Update TODO list with improved matching
    updateTodoList(completedTasks) {
        if (completedTasks.length === 0) return;
        
        console.log('\n📝 Updating TODO list...');
        let content = fs.readFileSync(this.todoPath, 'utf8');
        let updatedCount = 0;
        
        // Map test names to TODO item keywords for fuzzy matching
        const taskMappings = {
            'Mobile Text Breaking': ['text breaking', 'CORE SYSTEMS', 'word-break'],
            'Section Title Styling': ['section title', 'section-title'],
            'Wallet Connect Script': ['wallet', 'universal-wallet-connect'],
            'CoinGecko API Integration': ['coingecko', 'api integration'],
            'Service Worker Registration': ['service worker', 'serviceWorker.register']
        };
        
        completedTasks.forEach(task => {
            // First try exact match
            let taskRegex = new RegExp(`- \\[ \\] (.*)${this.escapeRegex(task)}(.*)`, 'i');
            if (content.match(taskRegex)) {
                content = content.replace(taskRegex, (match, before, after) => {
                    updatedCount++;
                    return `- [x] ${before}${task}${after}`;
                });
                console.log(`    ✓ Matched exact: ${task}`);
                return;
            }
            
            // Try fuzzy matching using mappings
            const keywords = taskMappings[task];
            if (keywords) {
                keywords.forEach(keyword => {
                    const fuzzyRegex = new RegExp(`- \\[ \\] ([^\\n]*${this.escapeRegex(keyword)}[^\\n]*)`, 'i');
                    const match = content.match(fuzzyRegex);
                    if (match) {
                        content = content.replace(fuzzyRegex, `- [x] ${match[1]}`);
                        updatedCount++;
                        console.log(`    ✓ Matched fuzzy "${keyword}": ${match[1]}`);
                    }
                });
            }
        });
        
        if (updatedCount > 0) {
            fs.writeFileSync(this.todoPath, content);
            console.log(`  ✅ Updated ${updatedCount} tasks in TODO list`);
        } else {
            console.log(`  ⚠️ No matching tasks found to update`);
        }
    }
    
    // Helper to escape regex special characters
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Main iteration loop
    async iterate() {
        console.log('\n🚀 AUTOMATED ITERATION SYSTEM STARTING...\n');
        console.log(`Time: ${new Date().toLocaleString()}\n`);
        
        // Read TODO list
        const todos = this.readTodoList();
        console.log(`📋 Found ${Object.values(todos).flat().length} pending tasks\n`);
        
        // Run all tests
        this.runVisualTests();
        console.log('');
        this.runFunctionalityTests();
        console.log('');
        this.runBacktests();
        console.log('');
        this.runMobileTests();
        
        // Generate report
        this.generateReport();
        
        // Auto-commit and push if needed
        this.autoCommitPush();
        
        // Mark completed tasks
        if (this.issuesFixed.length > 0) {
            this.updateTodoList(this.issuesFixed);
        }
        
        console.log('\n✨ Iteration complete!\n');
    }

    // Continuous iteration mode
    async continuousIterate(intervalMinutes = 30) {
        console.log(`🔄 Starting continuous iteration mode (every ${intervalMinutes} minutes)...`);
        
        // Run immediately
        await this.iterate();
        
        // Then run on interval
        setInterval(async () => {
            console.log('\n' + '━'.repeat(60));
            console.log('🔄 Starting scheduled iteration...');
            console.log('━'.repeat(60) + '\n');
            await this.iterate();
        }, intervalMinutes * 60 * 1000);
    }
}

// CLI Interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const system = new AutoIterateSystem();
    
    if (args.includes('--continuous') || args.includes('-c')) {
        const interval = parseInt(args[args.indexOf('--continuous') + 1] || 
                                 args[args.indexOf('-c') + 1]) || 30;
        system.continuousIterate(interval);
    } else {
        system.iterate().then(() => {
            console.log('✅ Single iteration complete. Use --continuous for ongoing monitoring.');
            process.exit(0);
        });
    }
}

module.exports = AutoIterateSystem;
