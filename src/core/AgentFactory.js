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
 * File: AgentFactory.js
 * Declaration ID: IP-72EC0972-MLL28ZW3
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
 * AGENT FACTORY
 * Factory pattern for creating polymorphic agent instances
 * Demonstrates factory pattern, dependency injection, and runtime type creation
 * 
 * Key Polymorphic Features:
 * - Factory method pattern
 * - Runtime type selection
 * - Dependency injection
 * - Registration mechanism for extensibility
 */

class AgentFactory {
    constructor() {
        this.agentRegistry = new Map();
        this.instances = new Map();
        this.logger = null;
        
        this._registerBuiltInAgents();
    }

    /**
     * Register built-in agent types
     */
    _registerBuiltInAgents() {
        // Registry will be populated as agents are loaded
        console.log('AgentFactory: Built-in agent types ready for registration');
    }

    /**
     * Register an agent type
     * Enables extensibility - new agent types can be added at runtime
     * 
     * @param {string} type - Agent type identifier
     * @param {class} AgentClass - Agent class constructor
     * @param {object} metadata - Optional metadata about the agent type
     */
    registerAgentType(type, AgentClass, metadata = {}) {
        if (this.agentRegistry.has(type)) {
            console.warn(`AgentFactory: Overwriting existing agent type: ${type}`);
        }
        
        this.agentRegistry.set(type, {
            constructor: AgentClass,
            metadata: {
                ...metadata,
                registeredAt: new Date().toISOString()
            }
        });
        
        console.log(`AgentFactory: Registered agent type: ${type}`);
        return this;
    }

    /**
     * FACTORY METHOD - Create agent instance
     * Demonstrates runtime polymorphism through factory pattern
     * 
     * @param {string} type - Agent type to create
     * @param {string} name - Instance name
     * @param {object} config - Configuration options
     * @param {boolean} singleton - Whether to return existing instance
     * @returns {BaseAgent} Agent instance
     */
    createAgent(type, name, config = {}, singleton = false) {
        // Check if singleton instance exists
        if (singleton) {
            const existingInstance = this.getInstance(type, name);
            if (existingInstance) {
                console.log(`AgentFactory: Returning existing ${type} instance: ${name}`);
                return existingInstance;
            }
        }

        // Get agent class from registry
        const agentInfo = this.agentRegistry.get(type);
        
        if (!agentInfo) {
            throw new Error(`AgentFactory: Unknown agent type: ${type}. Available types: ${Array.from(this.agentRegistry.keys()).join(', ')}`);
        }

        // Create instance with dependency injection
        try {
            const AgentClass = agentInfo.constructor;
            const logger = this.logger || this._getDefaultLogger();
            
            // Polymorphic instantiation - actual type determined at runtime
            const instance = new AgentClass(name, logger, config);
            
            // Store instance if singleton
            if (singleton) {
                const instanceKey = `${type}_${name}`;
                this.instances.set(instanceKey, instance);
            }
            
            console.log(`AgentFactory: Created ${type} agent: ${name}`);
            return instance;
            
        } catch (error) {
            console.error(`AgentFactory: Failed to create ${type} agent:`, error);
            throw error;
        }
    }

    /**
     * Get existing instance
     */
    getInstance(type, name) {
        const instanceKey = `${type}_${name}`;
        return this.instances.get(instanceKey);
    }

    /**
     * POLYMORPHIC METHOD - Create multiple agents of same type
     * Demonstrates parametric polymorphism
     */
    createAgentBatch(type, count, namePrefix = 'agent', config = {}) {
        const agents = [];
        
        for (let i = 0; i < count; i++) {
            const name = `${namePrefix}_${i + 1}`;
            try {
                const agent = this.createAgent(type, name, config, false);
                agents.push(agent);
            } catch (error) {
                console.error(`AgentFactory: Failed to create agent ${name}:`, error);
            }
        }
        
        console.log(`AgentFactory: Created batch of ${agents.length} ${type} agents`);
        return agents;
    }

    /**
     * Create agent from configuration object
     * Demonstrates flexible factory pattern
     */
    createFromConfig(agentConfig) {
        const { type, name, config, singleton = false } = agentConfig;
        
        if (!type || !name) {
            throw new Error('AgentFactory: Agent configuration must include type and name');
        }
        
        return this.createAgent(type, name, config, singleton);
    }

    /**
     * Create multiple agents from configuration array
     */
    createFromConfigBatch(configArray) {
        return configArray.map(config => {
            try {
                return this.createFromConfig(config);
            } catch (error) {
                console.error('AgentFactory: Failed to create agent from config:', error);
                return null;
            }
        }).filter(agent => agent !== null);
    }

    /**
     * Set logger for dependency injection
     * Demonstrates dependency injection pattern
     */
    setLogger(logger) {
        this.logger = logger;
        console.log('AgentFactory: Logger configured');
        return this;
    }

    /**
     * Get default logger if none provided
     */
    _getDefaultLogger() {
        if (typeof window !== 'undefined' && window.AgentLogger) {
            return window.AgentLogger;
        }
        
        // Fallback to console logger
        return {
            info: (agent, action, details) => console.log(`[INFO] ${agent}: ${action}`, details),
            success: (agent, action, details) => console.log(`[SUCCESS] ${agent}: ${action}`, details),
            warn: (agent, action, details) => console.warn(`[WARN] ${agent}: ${action}`, details),
            error: (agent, action, details) => console.error(`[ERROR] ${agent}: ${action}`, details)
        };
    }

    /**
     * Get all registered agent types
     */
    getRegisteredTypes() {
        return Array.from(this.agentRegistry.keys());
    }

    /**
     * Get metadata for an agent type
     */
    getTypeMetadata(type) {
        const agentInfo = this.agentRegistry.get(type);
        return agentInfo ? agentInfo.metadata : null;
    }

    /**
     * Get all active instances
     */
    getActiveInstances() {
        const instances = [];
        this.instances.forEach((instance, key) => {
            instances.push({
                key,
                type: instance.constructor.name,
                name: instance.name,
                status: instance.getStatus()
            });
        });
        return instances;
    }

    /**
     * Destroy an instance
     */
    async destroyInstance(type, name) {
        const instanceKey = `${type}_${name}`;
        const instance = this.instances.get(instanceKey);
        
        if (instance) {
            await instance.cleanup();
            this.instances.delete(instanceKey);
            console.log(`AgentFactory: Destroyed instance: ${instanceKey}`);
            return true;
        }
        
        return false;
    }

    /**
     * Destroy all instances of a type
     */
    async destroyInstancesByType(type) {
        const destroyed = [];
        
        for (const [key, instance] of this.instances.entries()) {
            if (key.startsWith(type + '_')) {
                await instance.cleanup();
                this.instances.delete(key);
                destroyed.push(key);
            }
        }
        
        console.log(`AgentFactory: Destroyed ${destroyed.length} instances of type ${type}`);
        return destroyed;
    }

    /**
     * Destroy all instances
     */
    async destroyAllInstances() {
        const keys = Array.from(this.instances.keys());
        
        for (const key of keys) {
            const instance = this.instances.get(key);
            await instance.cleanup();
            this.instances.delete(key);
        }
        
        console.log(`AgentFactory: Destroyed all ${keys.length} instances`);
        return keys;
    }

    /**
     * Get factory statistics
     */
    getStats() {
        return {
            registeredTypes: this.getRegisteredTypes().length,
            activeInstances: this.instances.size,
            types: this.getRegisteredTypes(),
            instances: this.getActiveInstances().map(i => ({ 
                key: i.key, 
                type: i.type, 
                name: i.name 
            }))
        };
    }

    /**
     * Health check for all instances
     */
    async healthCheckAll() {
        const results = [];
        
        for (const [key, instance] of this.instances.entries()) {
            try {
                const health = await instance.healthCheck();
                results.push({
                    key,
                    ...health
                });
            } catch (error) {
                results.push({
                    key,
                    healthy: false,
                    error: error.message
                });
            }
        }
        
        return {
            total: results.length,
            healthy: results.filter(r => r.healthy).length,
            unhealthy: results.filter(r => !r.healthy).length,
            results
        };
    }
}

// Create singleton instance
let factoryInstance = null;

function getAgentFactory() {
    if (!factoryInstance) {
        factoryInstance = new AgentFactory();
    }
    return factoryInstance;
}

// Export for different environments
if (typeof window !== 'undefined') {
    window.AgentFactory = AgentFactory;
    window.getAgentFactory = getAgentFactory;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AgentFactory, getAgentFactory };
}
