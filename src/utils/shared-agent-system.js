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
 * File: shared-agent-system.js
 * Declaration ID: IP-62CE74C8-MLL28ZWG
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

/** SIGNED BY MeRLynn - ID: MERLYNN-769b65c4 - TIMESTAMP: 2025-12-19T05:53:06.546Z - HASH: 70bea4b7 */
/** SIGNED BY AGentR - ID: AGENTR-7f601b49 - TIMESTAMP: 2025-12-19T05:53:06.546Z - HASH: 70bea4b7 */

/**
 * SHARED AGENT SYSTEM - Consolidated
 * Unified agent monitoring and management system
 * Combines best features from all agent implementations
 */

class SharedAgentSystem {
    constructor() {
        this.agents = [];
        this.logs = [];
        this.errors = [];
        this.fixes = 0;
        this.testsRun = 0;
        this.isRunning = false;
        this.lastHealthCheck = null;
        this.healthStatus = 'unknown';
        this.agentStats = {};

        // Trading capabilities
        this.registeredAgents = {};
        this.agentTradingHistory = {};
        this.agentWallets = {};

        this.init();
    }

    async init() {
        console.log('🤖 Shared Agent System initializing...');

        // Load existing data
        this.loadAgentData();
        this.loadTradingData();

        // Setup monitoring
        this.setupMonitoring();

        console.log('✅ Shared Agent System ready');
    }

    /**
     * Load agent system data
     */
    loadAgentData() {
        try {
            const agentData = localStorage.getItem('shared_agent_system');
            if (agentData) {
                const data = JSON.parse(agentData);
                this.agents = data.agents || [];
                this.logs = data.logs || [];
                this.errors = data.errors || [];
                this.fixes = data.fixes || 0;
                this.testsRun = data.testsRun || 0;
                this.agentStats = data.agentStats || {};
            }
        } catch (error) {
            console.warn('Failed to load agent data:', error);
        }
    }

    /**
     * Load trading data
     */
    loadTradingData() {
        try {
            const tradingData = localStorage.getItem('shared_agent_trading');
            if (tradingData) {
                const data = JSON.parse(tradingData);
                this.registeredAgents = data.registeredAgents || {};
                this.agentTradingHistory = data.agentTradingHistory || {};
                this.agentWallets = data.agentWallets || {};
            }
        } catch (error) {
            console.warn('Failed to load trading data:', error);
        }
    }

    /**
     * Save all data
     */
    saveData() {
        try {
            const agentData = {
                agents: this.agents,
                logs: this.logs,
                errors: this.errors,
                fixes: this.fixes,
                testsRun: this.testsRun,
                agentStats: this.agentStats,
                lastSaved: new Date().toISOString()
            };
            localStorage.setItem('shared_agent_system', JSON.stringify(agentData));

            const tradingData = {
                registeredAgents: this.registeredAgents,
                agentTradingHistory: this.agentTradingHistory,
                agentWallets: this.agentWallets,
                lastSaved: new Date().toISOString()
            };
            localStorage.setItem('shared_agent_trading', JSON.stringify(tradingData));
        } catch (error) {
            console.warn('Failed to save agent data:', error);
        }
    }

    /**
     * Setup monitoring systems
     */
    setupMonitoring() {
        // Monitor critical systems
        this.monitorCriticalSystems();

        // Setup error monitoring
        this.setupErrorMonitoring();

        // Auto-save every 5 minutes
        setInterval(() => this.saveData(), 5 * 60 * 1000);
    }

    /**
     * Monitor critical systems
     */
    monitorCriticalSystems() {
        const criticalSystems = [
            { name: 'Wallet Auth', path: 'src/core/universal-wallet-auth.js', check: () => !!window.universalWalletAuth },
            { name: 'Auth Integration', path: 'src/core/auth-integration.js', check: () => !!window.authIntegration },
            { name: 'FPDS Schema', path: 'src/utils/fpds-contract-schema.js', check: () => !!window.fpdsContractSchema },
            { name: 'SAM.gov Integration', path: 'src/utils/samgov-integration.js', check: () => !!window.samGovIntegration }
        ];

        criticalSystems.forEach(system => {
            if (!system.check()) {
                this.logError({
                    component: system.name,
                    message: `${system.name} not loaded properly`,
                    severity: 'high',
                    category: 'system'
                });
            }
        });
    }

    /**
     * Setup error monitoring
     */
    setupErrorMonitoring() {
        window.addEventListener('error', (event) => {
            this.logError({
                component: 'Global Error',
                message: event.message,
                severity: 'high',
                category: 'javascript',
                stack: event.error?.stack
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                component: 'Unhandled Promise',
                message: event.reason?.message || event.reason,
                severity: 'high',
                category: 'promise'
            });
        });
    }

    /**
     * Log an error
     */
    logError(error) {
        const errorEntry = {
            id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            component: error.component,
            message: error.message,
            severity: error.severity || 'medium',
            category: error.category || 'unknown',
            stack: error.stack,
            status: 'open',
            fixAttempts: []
        };

        this.errors.push(errorEntry);

        // Log to console with appropriate level
        const logMethod = error.severity === 'high' ? 'error' : 'warn';
        console[logMethod](`[${error.component}] ${error.message}`);

        this.saveData();
    }

    /**
     * Log a message
     */
    logMessage(level, component, message, data = null) {
        const logEntry = {
            id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            level: level,
            component: component,
            message: message,
            data: data
        };

        this.logs.push(logEntry);

        // Keep only last 1000 logs
        if (this.logs.length > 1000) {
            this.logs = this.logs.slice(-1000);
        }

        console.log(`[${component}] ${message}`);
        this.saveData();
    }

    /**
     * Register a new agent
     */
    registerAgent(agentConfig) {
        const agent = {
            id: agentConfig.id || Date.now().toString(),
            name: agentConfig.name,
            type: agentConfig.type || 'generic',
            capabilities: agentConfig.capabilities || [],
            status: 'active',
            registeredAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            stats: {
                testsRun: 0,
                errorsFixed: 0,
                uptime: 0
            }
        };

        this.agents.push(agent);
        this.registeredAgents[agent.id] = agent;

        // Generate wallet for agent if trading is enabled
        if (agent.capabilities.includes('trading')) {
            this.generateAgentWallet(agent.id, agent.name);
        }

        this.logMessage('info', 'AgentManager', `Agent ${agent.name} registered`);
        this.saveData();

        return agent;
    }

    /**
     * Generate wallet identifier for agent tracking
     * Note: These are internal tracking IDs, not blockchain addresses
     */
    generateAgentWallet(agentId, agentName) {
        // Generate a unique agent tracking identifier using cryptographically secure random values
        // Format: AGENT-{timestamp}-{10charHash}
        const timestamp = Date.now().toString(36);
        
        // Generate exactly 10 character random hash using secure random values
        let randomHash;
        if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
            // Browser environment with crypto API - generates cryptographically secure random hash
            const randomBytes = new Uint8Array(5); // 5 bytes = 10 hex characters
            crypto.getRandomValues(randomBytes);
            // Convert to hex for consistent encoding
            randomHash = Array.from(randomBytes)
                .map(byte => byte.toString(16).padStart(2, '0'))
                .join('');
        } else {
            // Fallback for older environments - ensure exactly 10 characters
            randomHash = (Math.random().toString(36).substring(2) + 
                         Math.random().toString(36).substring(2))
                         .substring(0, 10);
        }
        
        const walletAddress = `AGENT-${timestamp}-${randomHash}`;
        
        this.agentWallets[agentId] = {
            address: walletAddress,
            balance: '0',
            createdAt: new Date().toISOString(),
            type: 'internal_tracking' // Clarify this is not a blockchain address
        };

        this.logMessage('info', 'WalletManager', `Generated tracking ID for agent ${agentName}: ${walletAddress}`);
    }

    /**
     * Get agent statistics
     */
    getStats() {
        return {
            totalAgents: this.agents.length,
            activeAgents: this.agents.filter(a => a.status === 'active').length,
            totalErrors: this.errors.length,
            openErrors: this.errors.filter(e => e.status === 'open').length,
            totalFixes: this.fixes,
            testsRun: this.testsRun,
            healthStatus: this.getHealthStatus(),
            lastHealthCheck: this.lastHealthCheck
        };
    }

    /**
     * Get health status
     */
    getHealthStatus() {
        const stats = this.getStats();
        const errorRate = stats.totalErrors / Math.max(stats.testsRun, 1);

        if (errorRate > 0.1) return 'critical';
        if (errorRate > 0.05) return 'warning';
        if (stats.openErrors > 5) return 'degraded';
        return 'healthy';
    }

    /**
     * Run health check
     */
    async runHealthCheck() {
        this.lastHealthCheck = new Date().toISOString();
        this.testsRun++;

        // Test critical systems
        const criticalSystems = [
            { name: 'Wallet System', check: () => window.sharedWalletSystem?.connected || window.universalWalletAuth?.isAuthenticated() },
            { name: 'Auth System', check: () => !!window.authIntegration },
            // Only check for FPDS/SAM.gov if they exist (not required for all pages)
            { name: 'FPDS Schema', check: () => !window.fpdsContractSchema ? true : !!window.fpdsContractSchema, optional: true },
            { name: 'SAM.gov Integration', check: () => !window.samGovIntegration ? true : !!window.samGovIntegration, optional: true }
        ];

        let allHealthy = true;
        for (const system of criticalSystems) {
            try {
                const healthy = system.check();
                if (!healthy && !system.optional) {
                    this.logError({
                        component: system.name,
                        message: `${system.name} health check failed`,
                        severity: 'medium',
                        category: 'health'
                    });
                    allHealthy = false;
                } else if (!healthy && system.optional) {
                    // Optional systems - just log as info, not error
                    console.log(`ℹ️ Optional system ${system.name} not available`);
                }
            } catch (error) {
                if (!system.optional) {
                    this.logError({
                        component: system.name,
                        message: `Health check error: ${error.message}`,
                        severity: 'high',
                        category: 'health'
                    });
                    allHealthy = false;
                }
            }
        }

        this.healthStatus = allHealthy ? 'healthy' : 'degraded';
        this.saveData();

        return this.healthStatus;
    }

    /**
     * Start the agent system
     */
    async start() {
        if (this.isRunning) return;

        console.log('🚀 Starting Shared Agent System...');

        this.isRunning = true;

        // Run initial health check
        await this.runHealthCheck();

        // Setup periodic health checks
        setInterval(() => this.runHealthCheck(), 5 * 60 * 1000); // Every 5 minutes

        console.log('✅ Shared Agent System started');
    }

    /**
     * Stop the agent system
     */
    stop() {
        this.isRunning = false;
        console.log('🛑 Shared Agent System stopped');
    }
}

// Auto-initialize when DOM is ready - DISABLED on main page to prevent errors
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', () => {
//         window.sharedAgentSystem = new SharedAgentSystem();
//     });
// } else {
//     window.sharedAgentSystem = new SharedAgentSystem();
// }

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SharedAgentSystem;
}

console.log('🤖 Shared Agent System loaded - consolidating all agent functionality');
