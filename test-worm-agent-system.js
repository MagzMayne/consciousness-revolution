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
 * File: test-worm-agent-system.js
 * Declaration ID: IP-33895C41-MLL28ZWL
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Test Suite for Worm Agent System
 * Tests all components: WormAgent, WormCoordinator, and Integration
 */

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m'
};

class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    test(name, fn) {
        this.tests.push({ name, fn });
    }

    async run() {
        console.log(`\n${colors.cyan}🧪 Running Worm Agent System Tests${colors.reset}\n`);

        for (const test of this.tests) {
            try {
                await test.fn();
                this.passed++;
                console.log(`${colors.green}✅ ${test.name}${colors.reset}`);
            } catch (error) {
                this.failed++;
                console.log(`${colors.red}❌ ${test.name}${colors.reset}`);
                console.log(`   ${colors.red}Error: ${error.message}${colors.reset}`);
            }
        }

        console.log(`\n${colors.cyan}📊 Test Results${colors.reset}`);
        console.log(`   ${colors.green}Passed: ${this.passed}${colors.reset}`);
        console.log(`   ${colors.red}Failed: ${this.failed}${colors.reset}`);
        console.log(`   Total: ${this.tests.length}\n`);

        return this.failed === 0;
    }
}

// Mock logger for testing
class MockLogger {
    constructor() {
        this.logs = [];
    }
    
    info(name, message, data) {
        this.logs.push({ level: 'info', name, message, data });
    }
    
    success(name, message, data) {
        this.logs.push({ level: 'success', name, message, data });
    }
    
    warn(name, message, data) {
        this.logs.push({ level: 'warn', name, message, data });
    }
    
    error(name, message, data) {
        this.logs.push({ level: 'error', name, message, data });
    }
}

// Load modules
let WormAgent, WormCoordinator, WormAgentSystem;

try {
    if (typeof require !== 'undefined') {
        WormAgent = require('./src/agents/worm-agent.js');
        WormCoordinator = require('./src/agents/worm-coordinator.js');
        WormAgentSystem = require('./src/systems/worm-agent-system.js');
    } else {
        // Browser environment
        WormAgent = window.WormAgent;
        WormCoordinator = window.WormCoordinator;
        WormAgentSystem = window.WormAgentSystem;
    }
} catch (error) {
    console.error('Failed to load modules:', error.message);
    process.exit(1);
}

// Create test runner
const runner = new TestRunner();

// Test 1: WormAgent Creation
runner.test('WormAgent can be created', async () => {
    const logger = new MockLogger();
    const agent = new WormAgent(0, logger);
    
    if (!agent) throw new Error('Failed to create WormAgent');
    if (agent.id !== 0) throw new Error('Agent ID not set correctly');
    if (!agent.memory) throw new Error('Agent memory not initialized');
});

// Test 2: WormAgent Pattern Loading
runner.test('WormAgent loads known patterns', async () => {
    const logger = new MockLogger();
    const agent = new WormAgent(0, logger);
    
    if (!agent.knownPatterns) throw new Error('Known patterns not loaded');
    if (!agent.knownPatterns.functionDeclarations) throw new Error('Function patterns not loaded');
    if (!agent.knownPatterns.security) throw new Error('Security patterns not loaded');
});

// Test 3: WormAgent Line Analysis
runner.test('WormAgent can analyze code lines', async () => {
    const logger = new MockLogger();
    const agent = new WormAgent(0, logger);
    
    const testLine = "console.log('test');";
    const fileContext = { functions: new Set(), variables: new Set(), imports: new Set(), exports: new Set() };
    const mockFile = { path: 'test.js', content: testLine };
    
    await agent.analyzeLine(testLine, 0, fileContext, mockFile);
    
    // Should detect console statement
    const consoleIssues = agent.memory.issuesFound.filter(i => i.type === 'console');
    if (consoleIssues.length === 0) throw new Error('Failed to detect console statement');
});

// Test 4: WormAgent Security Detection
runner.test('WormAgent detects security issues', async () => {
    const logger = new MockLogger();
    const agent = new WormAgent(0, logger);
    
    const testLine = "const apiKey = 'sk-1234567890';";
    const fileContext = { functions: new Set(), variables: new Set(), imports: new Set(), exports: new Set() };
    const mockFile = { path: 'config.js', content: testLine };
    
    await agent.analyzeLine(testLine, 0, fileContext, mockFile);
    
    // Should detect exposed API key
    const securityIssues = agent.memory.issuesFound.filter(i => i.type === 'security');
    if (securityIssues.length === 0) throw new Error('Failed to detect security issue');
});

// Test 5: WormCoordinator Creation
runner.test('WormCoordinator can be created', async () => {
    const logger = new MockLogger();
    const coordinator = new WormCoordinator(logger);
    
    if (!coordinator) throw new Error('Failed to create WormCoordinator');
    if (!coordinator.statistics) throw new Error('Statistics not initialized');
});

// Test 6: WormCoordinator Initialization
runner.test('WormCoordinator can initialize', async () => {
    const logger = new MockLogger();
    const coordinator = new WormCoordinator(logger);
    
    await coordinator.initialize();
    
    if (coordinator.status !== 'ready') throw new Error('Coordinator not ready after initialization');
});

// Test 7: WormCoordinator Agent Deployment
runner.test('WormCoordinator can deploy agents', async () => {
    const logger = new MockLogger();
    const coordinator = new WormCoordinator(logger);
    
    await coordinator.initialize();
    
    const mockFiles = [
        { path: 'file1.js', content: 'test', type: 'javascript' },
        { path: 'file2.js', content: 'test', type: 'javascript' }
    ];
    
    const agents = await coordinator.deployAgents(mockFiles);
    
    if (agents.length === 0) throw new Error('No agents deployed');
    if (coordinator.statistics.totalAgentsDeployed === 0) throw new Error('Statistics not updated');
});

// Test 8: WormCoordinator Event System
runner.test('WormCoordinator event system works', async () => {
    const logger = new MockLogger();
    const coordinator = new WormCoordinator(logger);
    
    let eventFired = false;
    coordinator.on('testEvent', (data) => {
        eventFired = true;
    });
    
    coordinator.emit('testEvent', { test: true });
    
    if (!eventFired) throw new Error('Event not fired');
});

// Test 9: WormAgentSystem Creation
runner.test('WormAgentSystem can be created', async () => {
    const system = new WormAgentSystem();
    
    if (!system) throw new Error('Failed to create WormAgentSystem');
    if (!system.config) throw new Error('Config not initialized');
});

// Test 10: WormAgentSystem Initialization
runner.test('WormAgentSystem can initialize', async () => {
    const system = new WormAgentSystem();
    const result = await system.initialize();
    
    if (!result.success) throw new Error('System initialization failed');
    if (!system.isInitialized) throw new Error('System not marked as initialized');
});

// Test 11: WormAgentSystem Configuration
runner.test('WormAgentSystem can be configured', async () => {
    const system = new WormAgentSystem();
    await system.initialize();
    
    system.configure({ maxAgents: 5 });
    
    if (system.config.maxAgents !== 5) throw new Error('Configuration not updated');
});

// Test 12: WormAgentSystem Health Check
runner.test('WormAgentSystem health check works', async () => {
    const system = new WormAgentSystem();
    await system.initialize();
    
    const health = await system.healthCheck();
    
    if (!health.healthy) throw new Error('System not healthy');
    if (!health.checks.initialized) throw new Error('Health check failed');
});

// Test 13: WormAgent File Processing
runner.test('WormAgent can process files', async () => {
    const logger = new MockLogger();
    const agent = new WormAgent(0, logger);
    
    const mockFile = {
        path: 'test.js',
        content: 'function test() {\n  console.log("test");\n}\n',
        type: 'javascript'
    };
    
    await agent.processFile(mockFile);
    
    if (agent.memory.linesProcessed === 0) throw new Error('No lines processed');
    if (agent.memory.filesScanned.length === 0) throw new Error('File not marked as scanned');
});

// Test 14: WormAgent Report Generation
runner.test('WormAgent generates reports', async () => {
    const logger = new MockLogger();
    const agent = new WormAgent(0, logger);
    
    const report = agent.getReport();
    
    if (!report) throw new Error('No report generated');
    if (!report.statistics) throw new Error('No statistics in report');
    if (report.agentId !== 0) throw new Error('Agent ID not in report');
});

// Test 15: WormCoordinator Report Generation
runner.test('WormCoordinator generates reports', async () => {
    const logger = new MockLogger();
    const coordinator = new WormCoordinator(logger);
    
    await coordinator.initialize();
    
    const report = coordinator.getCoordinatorReport();
    
    if (!report) throw new Error('No report generated');
    if (!report.coordinator) throw new Error('No coordinator info in report');
    if (!report.summary) throw new Error('No summary in report');
});

// Test 16: Export Formats
runner.test('WormAgentSystem can export in different formats', async () => {
    const system = new WormAgentSystem();
    await system.initialize();
    
    // Mock coordinator with data
    system.coordinator.statistics = {
        totalFilesProcessed: 10,
        totalLinesProcessed: 100,
        totalIssuesFound: 5,
        totalRepairsMade: 3
    };
    
    const json = system.exportResults('json');
    const csv = system.exportResults('csv');
    const markdown = system.exportResults('markdown');
    
    if (!json) throw new Error('JSON export failed');
    if (!csv) throw new Error('CSV export failed');
    if (!markdown) throw new Error('Markdown export failed');
});

// Run tests
if (typeof window === 'undefined') {
    // Node.js environment
    runner.run().then(success => {
        process.exit(success ? 0 : 1);
    });
} else {
    // Browser environment
    window.addEventListener('DOMContentLoaded', () => {
        runner.run();
    });
}

// Export for browser
if (typeof window !== 'undefined') {
    window.WormAgentTestRunner = runner;
}
