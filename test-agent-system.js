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
 * File: test-agent-system.js
 * Declaration ID: IP-6510D69B-MLL28ZWI
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

/** SIGNED BY MeRLynn - ID: MERLYNN-04f33189 - TIMESTAMP: 2025-12-19T05:53:06.547Z - HASH: 74174441 */
/** SIGNED BY AGentR - ID: AGENTR-0820f744 - TIMESTAMP: 2025-12-19T05:53:06.547Z - HASH: 74174441 */

/**
 * TEST AGENT SYSTEM
 * Tests all components of the agent management system
 */

// Simulate browser environment for testing
global.window = {};
global.localStorage = {
    data: {},
    getItem(key) {
        return this.data[key] || null;
    },
    setItem(key, value) {
        this.data[key] = value;
    },
    removeItem(key) {
        delete this.data[key];
    },
    clear() {
        this.data = {};
    }
};
global.navigator = {
    onLine: true
};
global.document = {
    querySelector: () => ({ textContent: '' }),
    createElement: () => ({})
};

// Load agent modules
const AgentLogger = require('./src/agents/agent-logger.js');
const ManagementAgent = require('./src/agents/management-agent.js');
const DeploymentAgent = require('./src/agents/deployment-agent.js');
const AgentCoordinator = require('./src/agents/agent-coordinator.js');

// Test counters
let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
    try {
        console.log(`\n🧪 Testing: ${name}`);
        fn();
        testsPassed++;
        console.log(`✅ PASSED: ${name}`);
    } catch (error) {
        testsFailed++;
        console.error(`❌ FAILED: ${name}`);
        console.error(`   Error: ${error.message}`);
    }
}

async function asyncTest(name, fn) {
    try {
        console.log(`\n🧪 Testing: ${name}`);
        await fn();
        testsPassed++;
        console.log(`✅ PASSED: ${name}`);
    } catch (error) {
        testsFailed++;
        console.error(`❌ FAILED: ${name}`);
        console.error(`   Error: ${error.message}`);
    }
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

// Run tests
async function runTests() {
    console.log('='.repeat(60));
    console.log('🚀 AGENT SYSTEM TEST SUITE');
    console.log('='.repeat(60));

    // Test 1: AgentLogger
    test('AgentLogger instantiation', () => {
        const logger = new AgentLogger();
        assert(logger instanceof AgentLogger, 'Logger should be an instance of AgentLogger');
        assert(Array.isArray(logger.logs), 'Logger should have logs array');
    });

    test('AgentLogger logging', () => {
        const logger = new AgentLogger();
        const entry = logger.info('TestAgent', 'Test action', { test: true });
        assert(entry.level === 'INFO', 'Log level should be INFO');
        assert(entry.agent === 'TestAgent', 'Agent name should match');
        assert(entry.action === 'Test action', 'Action should match');
    });

    test('AgentLogger filtering', () => {
        const logger = new AgentLogger();
        logger.info('Agent1', 'Action1');
        logger.error('Agent2', 'Action2');
        logger.warn('Agent1', 'Action3');
        
        const agent1Logs = logger.getFilteredLogs({ agent: 'Agent1' });
        assert(agent1Logs.length === 2, 'Should filter logs by agent');
        
        const errorLogs = logger.getFilteredLogs({ level: 'error' });
        assert(errorLogs.length === 1, 'Should filter logs by level');
    });

    test('AgentLogger stats', () => {
        // Clear localStorage for this test
        global.localStorage.clear();
        const logger = new AgentLogger();
        logger.info('Agent1', 'Action1');
        logger.error('Agent2', 'Action2');
        
        const stats = logger.getStats();
        assert(stats.total >= 2, 'Stats should show at least 2 logs');
        assert(stats.byLevel.INFO >= 1, 'Stats should count INFO logs');
        assert(stats.byLevel.ERROR >= 1, 'Stats should count ERROR logs');
    });

    // Test 2: ManagementAgent
    test('ManagementAgent instantiation', () => {
        const logger = new AgentLogger();
        const agent = new ManagementAgent(logger);
        assert(agent instanceof ManagementAgent, 'Should be an instance of ManagementAgent');
        assert(agent.name === 'ManagementAgent', 'Agent name should be correct');
    });

    await asyncTest('ManagementAgent crawl', async () => {
        const logger = new AgentLogger();
        const agent = new ManagementAgent(logger);
        const results = await agent.startCrawl();
        
        assert(results.totalFiles > 0, 'Should discover files');
        assert(typeof results.healthScore === 'number', 'Should calculate health score');
        assert(Array.isArray(results.issues), 'Should have issues array');
    });

    test('ManagementAgent status', () => {
        const logger = new AgentLogger();
        const agent = new ManagementAgent(logger);
        const status = agent.getStatus();
        
        assert(status.name === 'ManagementAgent', 'Status should include agent name');
        assert(status.active === true, 'Status should show active');
        assert(typeof status.healthScore === 'number', 'Status should include health score');
    });

    // Test 3: DeploymentAgent
    test('DeploymentAgent instantiation', () => {
        const logger = new AgentLogger();
        const agent = new DeploymentAgent(logger);
        assert(agent instanceof DeploymentAgent, 'Should be an instance of DeploymentAgent');
        assert(agent.name === 'DeploymentAgent', 'Agent name should be correct');
    });

    await asyncTest('DeploymentAgent health check', async () => {
        const logger = new AgentLogger();
        const agent = new DeploymentAgent(logger);
        const status = await agent.performHealthCheck();
        
        assert(typeof status.healthy === 'boolean', 'Should have healthy status');
        assert(status.lastCheck !== null, 'Should have last check timestamp');
        assert(Array.isArray(status.issues), 'Should have issues array');
    });

    await asyncTest('DeploymentAgent verification', async () => {
        const logger = new AgentLogger();
        const agent = new DeploymentAgent(logger);
        const verification = await agent.verifyDeployment();
        
        assert(verification.timestamp !== undefined, 'Should have timestamp');
        assert(typeof verification.overall === 'boolean', 'Should have overall status');
        assert(verification.checks !== undefined, 'Should have checks');
    });

    test('DeploymentAgent configuration', () => {
        const logger = new AgentLogger();
        const agent = new DeploymentAgent(logger);
        
        agent.updateEnvironmentConfig({ autoFix: false });
        assert(agent.environmentConfig.autoFix === false, 'Should update config');
        
        agent.toggleFeature('walletIntegration', false);
        assert(agent.environmentConfig.features.walletIntegration === false, 'Should toggle feature');
    });

    // Test 4: AgentCoordinator
    await asyncTest('AgentCoordinator instantiation', async () => {
        const coordinator = new AgentCoordinator({
            AgentLogger,
            ManagementAgent,
            DeploymentAgent
        });
        await new Promise(resolve => setTimeout(resolve, 200)); // Wait for init
        
        assert(coordinator instanceof AgentCoordinator, 'Should be an instance of AgentCoordinator');
        assert(coordinator.managementAgent !== null, 'Should have management agent');
        assert(coordinator.deploymentAgent !== null, 'Should have deployment agent');
    });

    await asyncTest('AgentCoordinator status', async () => {
        const coordinator = new AgentCoordinator({
            AgentLogger,
            ManagementAgent,
            DeploymentAgent
        });
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const status = coordinator.getStatus();
        assert(status.coordinator !== undefined, 'Should have coordinator status');
        assert(status.agents !== undefined, 'Should have agents status');
        assert(status.logger !== undefined, 'Should have logger status');
    });

    await asyncTest('AgentCoordinator task queue', async () => {
        const coordinator = new AgentCoordinator({
            AgentLogger,
            ManagementAgent,
            DeploymentAgent
        });
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const taskId = coordinator.addTask({
            type: 'health-check',
            priority: 'high'
        });
        
        assert(typeof taskId === 'string', 'Should return task ID');
        assert(taskId.startsWith('task-'), 'Task ID should have correct format');
    });

    // Test 5: Integration tests
    await asyncTest('Full operation flow', async () => {
        const coordinator = new AgentCoordinator({
            AgentLogger,
            ManagementAgent,
            DeploymentAgent
        });
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const report = await coordinator.startFullOperation();
        
        assert(report !== null, 'Should generate report');
        assert(report.summary !== undefined, 'Report should have summary');
        assert(report.phases !== undefined, 'Report should have phases');
        assert(Array.isArray(report.recommendations), 'Report should have recommendations');
    });

    await asyncTest('Quick health check integration', async () => {
        const coordinator = new AgentCoordinator({
            AgentLogger,
            ManagementAgent,
            DeploymentAgent
        });
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const status = await coordinator.quickHealthCheck();
        
        assert(status.coordinator !== undefined, 'Should have coordinator status');
        assert(status.agents.management !== null, 'Should have management agent status');
        assert(status.agents.deployment !== null, 'Should have deployment agent status');
    });

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${testsPassed}`);
    console.log(`❌ Failed: ${testsFailed}`);
    console.log(`📈 Total: ${testsPassed + testsFailed}`);
    console.log(`🎯 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
    console.log('='.repeat(60));

    if (testsFailed === 0) {
        console.log('\n🎉 All tests passed! Agent system is working correctly.\n');
        process.exit(0);
    } else {
        console.log('\n⚠️ Some tests failed. Please review the errors above.\n');
        process.exit(1);
    }
}

// Run the tests
runTests().catch(error => {
    console.error('Fatal error during testing:', error);
    process.exit(1);
});
