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
 * File: BaseAgent.js
 * Declaration ID: IP-222C51D-MLL28ZW3
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
 * BASE AGENT CLASS
 * Abstract base class implementing polymorphism for all agent types
 * Demonstrates inheritance, method overriding, and runtime polymorphism
 * 
 * Key Polymorphic Features:
 * - Abstract methods for subclass implementation (runtime polymorphism)
 * - Virtual methods that can be overridden (method overriding)
 * - Common interface for all agent types (subtype polymorphism)
 * - Template method pattern for consistent behavior
 */

class BaseAgent {
    constructor(name, logger) {
        if (this.constructor === BaseAgent) {
            throw new Error('BaseAgent is abstract and cannot be instantiated directly');
        }
        
        this.name = name;
        this.logger = logger || window.AgentLogger;
        this.isActive = false;
        this.status = 'initialized';
        this.metrics = {
            tasksCompleted: 0,
            errors: 0,
            lastRun: null,
            avgExecutionTime: 0
        };
        
        this._initialize();
    }

    /**
     * Template method - defines the algorithm structure
     * Subclasses can override specific steps while maintaining the overall flow
     */
    _initialize() {
        this.log('info', 'Initializing', { agent: this.name });
        this.loadConfiguration();
        this.setupCapabilities();
        this.registerWithSystem();
        this.log('success', 'Initialization complete', { agent: this.name });
    }

    /**
     * ABSTRACT METHOD - Must be implemented by subclasses
     * This is runtime polymorphism - different implementations at runtime
     */
    async execute() {
        throw new Error(`${this.name} must implement execute() method`);
    }

    /**
     * ABSTRACT METHOD - Agent-specific task execution
     */
    async performTask(task) {
        throw new Error(`${this.name} must implement performTask() method`);
    }

    /**
     * VIRTUAL METHOD - Can be overridden by subclasses
     * Default implementation provided, demonstrating method overriding
     */
    loadConfiguration() {
        const storageKey = `${this.name.toLowerCase()}_config`;
        try {
            const config = localStorage.getItem(storageKey);
            this.config = config ? JSON.parse(config) : this.getDefaultConfig();
        } catch (error) {
            this.log('warning', 'Failed to load config, using defaults', { error: error.message });
            this.config = this.getDefaultConfig();
        }
    }

    /**
     * VIRTUAL METHOD - Provides default configuration
     * Subclasses override to provide specific defaults
     */
    getDefaultConfig() {
        return {
            enabled: true,
            interval: 60000,
            maxRetries: 3,
            timeout: 30000
        };
    }

    /**
     * VIRTUAL METHOD - Setup agent capabilities
     * Subclasses override to add specific capabilities
     */
    setupCapabilities() {
        this.capabilities = ['monitor', 'report'];
    }

    /**
     * VIRTUAL METHOD - Register with central system
     * Demonstrates polymorphic behavior across different agent types
     */
    registerWithSystem() {
        if (typeof window !== 'undefined' && window.SharedAgentSystem) {
            window.SharedAgentSystem.registerAgent(this);
        }
    }

    /**
     * Common method using polymorphic logging
     * Demonstrates how base class methods can work with overridden methods
     */
    async run() {
        if (!this.isActive) {
            this.log('warning', 'Agent not active', { agent: this.name });
            return { success: false, reason: 'not_active' };
        }

        const startTime = Date.now();
        
        try {
            this.log('info', 'Starting execution', { agent: this.name });
            
            // Polymorphic call - actual implementation depends on subclass
            const result = await this.execute();
            
            const executionTime = Date.now() - startTime;
            this.updateMetrics(true, executionTime);
            
            this.log('success', 'Execution completed', { 
                agent: this.name,
                executionTime,
                result 
            });
            
            return { success: true, result, executionTime };
            
        } catch (error) {
            const executionTime = Date.now() - startTime;
            this.updateMetrics(false, executionTime);
            
            this.log('error', 'Execution failed', { 
                agent: this.name,
                error: error.message,
                executionTime 
            });
            
            // Polymorphic error handling
            await this.handleError(error);
            
            return { success: false, error: error.message, executionTime };
        }
    }

    /**
     * VIRTUAL METHOD - Error handling with polymorphic behavior
     * Subclasses can override for specific error handling strategies
     */
    async handleError(error) {
        this.log('error', 'Error occurred', { 
            agent: this.name,
            error: error.message,
            stack: error.stack 
        });
        
        // Default retry logic - can be overridden
        if (this.config.maxRetries > 0) {
            await this.retry();
        }
    }

    /**
     * VIRTUAL METHOD - Retry mechanism
     * Can be overridden for different retry strategies
     */
    async retry() {
        this.log('info', 'Retrying', { agent: this.name });
        // Default implementation - subclasses can override
    }

    /**
     * Polymorphic logging interface
     * Supports different log levels through method overloading pattern
     */
    log(level, message, details = {}) {
        if (this.logger && typeof this.logger[level] === 'function') {
            this.logger[level](this.name, message, details);
        } else {
            console.log(`[${level.toUpperCase()}] ${this.name}: ${message}`, details);
        }
    }

    /**
     * Update agent metrics
     */
    updateMetrics(success, executionTime) {
        if (success) {
            this.metrics.tasksCompleted++;
        } else {
            this.metrics.errors++;
        }
        
        this.metrics.lastRun = new Date().toISOString();
        
        // Calculate average execution time
        const currentAvg = this.metrics.avgExecutionTime;
        const totalRuns = this.metrics.tasksCompleted + this.metrics.errors;
        this.metrics.avgExecutionTime = ((currentAvg * (totalRuns - 1)) + executionTime) / totalRuns;
    }

    /**
     * Start agent - polymorphic activation
     */
    start() {
        this.isActive = true;
        this.status = 'running';
        this.log('success', 'Agent started', { agent: this.name });
        return this;
    }

    /**
     * Stop agent - polymorphic deactivation
     */
    stop() {
        this.isActive = false;
        this.status = 'stopped';
        this.log('info', 'Agent stopped', { agent: this.name });
        return this;
    }

    /**
     * Get agent status - polymorphic reporting
     * Subclasses can extend with additional status information
     */
    getStatus() {
        return {
            name: this.name,
            type: this.constructor.name,
            isActive: this.isActive,
            status: this.status,
            metrics: { ...this.metrics },
            capabilities: [...this.capabilities],
            config: { ...this.config }
        };
    }

    /**
     * Health check - virtual method for monitoring
     */
    async healthCheck() {
        return {
            healthy: this.isActive,
            name: this.name,
            lastRun: this.metrics.lastRun,
            errorRate: this.metrics.tasksCompleted > 0 
                ? this.metrics.errors / (this.metrics.tasksCompleted + this.metrics.errors)
                : 0
        };
    }

    /**
     * Cleanup resources - virtual method
     * Subclasses override to add specific cleanup logic
     */
    async cleanup() {
        this.log('info', 'Cleaning up resources', { agent: this.name });
        this.stop();
    }

    /**
     * Export agent data - polymorphic serialization
     */
    toJSON() {
        return {
            name: this.name,
            type: this.constructor.name,
            status: this.getStatus(),
            timestamp: new Date().toISOString()
        };
    }
}

// Export for different environments
if (typeof window !== 'undefined') {
    window.BaseAgent = BaseAgent;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BaseAgent;
}
