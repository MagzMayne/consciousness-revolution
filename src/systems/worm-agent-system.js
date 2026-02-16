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
 * File: worm-agent-system.js
 * Declaration ID: IP-614589E6-MLL28ZWA
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * @aul-enabled
 * WORM AGENT SYSTEM INTEGRATION
 * Connects worm agents, coordinator, visualization, and existing agent systems
 */

// Load dependencies if in Node.js
if (typeof module !== 'undefined' && typeof require !== 'undefined' && typeof window === 'undefined') {
    global.WormCoordinator = require('../agents/worm-coordinator.js');
    global.WormAgent = require('../agents/worm-agent.js');
}

class WormAgentSystem {
    constructor() {
        this.logger = null;
        this.coordinator = null;
        this.visualization = null;
        this.isInitialized = false;
        this.config = {
            maxAgents: 10,
            autoRepair: true,
            realTimeUpdates: true,
            visualizationEnabled: true
        };
    }

    /**
     * Initialize the complete system
     */
    async initialize() {
        console.log('🚀 Initializing Worm Agent System...');

        try {
            // 1. Initialize logger
            if (typeof AgentLogger !== 'undefined') {
                this.logger = new AgentLogger();
                console.log('✅ Logger initialized');
            } else {
                console.warn('⚠️ AgentLogger not found, using console');
                this.logger = this.createFallbackLogger();
            }

            // 2. Initialize coordinator
            if (typeof WormCoordinator !== 'undefined') {
                this.coordinator = new WormCoordinator(this.logger);
                await this.coordinator.initialize();
                console.log('✅ Coordinator initialized');
            } else {
                throw new Error('WormCoordinator not found');
            }

            // 3. Setup event handlers
            this.setupEventHandlers();

            this.isInitialized = true;
            console.log('✅ Worm Agent System fully initialized');

            return {
                success: true,
                message: 'System initialized successfully'
            };

        } catch (error) {
            console.error('❌ Initialization failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Create fallback logger if AgentLogger not available
     */
    createFallbackLogger() {
        return {
            info: (name, message, data) => console.log(`[INFO] ${name}: ${message}`, data),
            success: (name, message, data) => console.log(`[SUCCESS] ${name}: ${message}`, data),
            warn: (name, message, data) => console.warn(`[WARN] ${name}: ${message}`, data),
            error: (name, message, data) => console.error(`[ERROR] ${name}: ${message}`, data)
        };
    }

    /**
     * Setup event handlers for coordinator
     */
    setupEventHandlers() {
        if (!this.coordinator) return;

        this.coordinator.on('agentDeployed', (data) => {
            this.logger.info('WormSystem', 'Agent deployed', data);
            this.emitSystemEvent('agent:deployed', data);
        });

        this.coordinator.on('agentStarted', (data) => {
            this.logger.info('WormSystem', 'Agent started', data);
            this.emitSystemEvent('agent:started', data);
        });

        this.coordinator.on('resultsAggregated', (data) => {
            this.logger.success('WormSystem', 'Results aggregated', data);
            this.emitSystemEvent('results:aggregated', data);
        });

        this.coordinator.on('allAgentsStopped', (data) => {
            this.logger.warn('WormSystem', 'All agents stopped', data);
            this.emitSystemEvent('agents:stopped', data);
        });
    }

    /**
     * Emit system-wide events
     */
    emitSystemEvent(event, data) {
        const customEvent = new CustomEvent('wormAgentSystem', {
            detail: { event, data, timestamp: Date.now() }
        });
        window.dispatchEvent(customEvent);
    }

    /**
     * Start autonomous crawl operation
     */
    async startCrawl(options = {}) {
        if (!this.isInitialized) {
            throw new Error('System not initialized. Call initialize() first.');
        }

        this.logger.info('WormSystem', 'Starting crawl operation', options);

        try {
            // Get files to scan
            const files = options.files || await this.scanFiles();
            
            this.logger.info('WormSystem', 'Files discovered', {
                count: files.length
            });

            // Start the crawl
            const result = await this.coordinator.startCrawl(files);

            this.logger.success('WormSystem', 'Crawl completed', {
                statistics: result.statistics
            });

            return result;

        } catch (error) {
            this.logger.error('WormSystem', 'Crawl failed', {
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Scan repository for files
     */
    async scanFiles() {
        // Use coordinator's scan functionality
        return await this.coordinator.scanRepository();
    }

    /**
     * Get real-time system status
     */
    getStatus() {
        if (!this.isInitialized) {
            return {
                initialized: false,
                status: 'not_initialized'
            };
        }

        return {
            initialized: true,
            coordinator: this.coordinator ? this.coordinator.getRealTimeStats() : null,
            config: this.config
        };
    }

    /**
     * Stop all agents
     */
    stopAll() {
        if (this.coordinator) {
            this.coordinator.stopAll();
        }
    }

    /**
     * Configure system
     */
    configure(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.logger.info('WormSystem', 'Configuration updated', this.config);
    }

    /**
     * Export results
     */
    exportResults(format = 'json') {
        if (!this.coordinator) {
            throw new Error('No coordinator available');
        }

        const report = this.coordinator.getCoordinatorReport();

        switch (format) {
            case 'json':
                return JSON.stringify(report, null, 2);
            
            case 'csv':
                return this.convertToCSV(report);
            
            case 'markdown':
                return this.convertToMarkdown(report);
            
            default:
                return report;
        }
    }

    /**
     * Convert report to CSV
     */
    convertToCSV(report) {
        const rows = [];
        rows.push('Metric,Value');
        rows.push(`Status,${report.coordinator.status}`);
        rows.push(`Agents Deployed,${report.coordinator.agentsDeployed}`);
        rows.push(`Files Processed,${report.summary.filesProcessed}`);
        rows.push(`Lines Processed,${report.summary.linesProcessed}`);
        rows.push(`Issues Found,${report.summary.issuesFound}`);
        rows.push(`Repairs Made,${report.summary.repairsMade}`);
        rows.push(`Success Rate,${report.summary.successRate}`);
        return rows.join('\n');
    }

    /**
     * Convert report to Markdown
     */
    convertToMarkdown(report) {
        return `# Worm Agent System Report

## Summary
- **Status**: ${report.coordinator.status}
- **Agents Deployed**: ${report.coordinator.agentsDeployed}
- **Duration**: ${report.coordinator.duration}s

## Statistics
- **Files Processed**: ${report.summary.filesProcessed}
- **Lines Processed**: ${report.summary.linesProcessed}
- **Issues Found**: ${report.summary.issuesFound}
- **Repairs Made**: ${report.summary.repairsMade}
- **Success Rate**: ${report.summary.successRate}

## Agent Details
${report.agents.map((agent, i) => `
### Agent ${i}
- Files Scanned: ${agent.statistics.filesScanned}
- Lines Processed: ${agent.statistics.linesProcessed}
- Issues Found: ${agent.statistics.issuesFound}
- Repairs Made: ${agent.statistics.repairsMade}
`).join('\n')}
`;
    }

    /**
     * Health check
     */
    async healthCheck() {
        const checks = {
            logger: !!this.logger,
            coordinator: !!this.coordinator,
            initialized: this.isInitialized,
            timestamp: Date.now()
        };

        const healthy = Object.values(checks).every(v => v === true || typeof v === 'number');

        return {
            healthy,
            checks,
            status: healthy ? 'healthy' : 'unhealthy'
        };
    }
}

// Create global instance
if (typeof window !== 'undefined') {
    window.WormAgentSystem = WormAgentSystem;
    
    // Auto-initialize if requested
    if (window.location.search.includes('auto-init')) {
        window.addEventListener('DOMContentLoaded', async () => {
            const system = new WormAgentSystem();
            await system.initialize();
            window.wormSystem = system;
            console.log('🚀 Worm Agent System auto-initialized');
        });
    }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WormAgentSystem;
}
