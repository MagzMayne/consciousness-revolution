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
 * File: BaseUtility.js
 * Declaration ID: IP-407C4124-MLL28ZW3
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
 * BASE UTILITY CLASS
 * Abstract base class for utility implementations
 * Demonstrates inheritance hierarchy and method overloading patterns
 * 
 * Key Polymorphic Features:
 * - Abstract methods for specialized implementations
 * - Method overloading through parameter variations
 * - Template method pattern
 * - Protected/public method distinction
 */

class BaseUtility {
    constructor(name, config = {}) {
        if (this.constructor === BaseUtility) {
            throw new Error('BaseUtility is abstract and cannot be instantiated directly');
        }
        
        this.name = name;
        this.config = { ...this.getDefaultConfig(), ...config };
        this.initialized = false;
        this.operationCount = 0;
        
        this._init();
    }

    /**
     * ABSTRACT METHOD - Must be implemented by subclasses
     */
    async process(data) {
        throw new Error(`${this.name} must implement process() method`);
    }

    /**
     * ABSTRACT METHOD - Validation logic
     */
    validate(data) {
        throw new Error(`${this.name} must implement validate() method`);
    }

    /**
     * VIRTUAL METHOD - Default configuration
     */
    getDefaultConfig() {
        return {
            enabled: true,
            timeout: 5000,
            retries: 3,
            cache: true
        };
    }

    /**
     * Template method - initialization flow
     */
    _init() {
        console.log(`Initializing ${this.name}...`);
        this.loadState();
        this.setupHandlers();
        this.initialized = true;
        console.log(`${this.name} initialized successfully`);
    }

    /**
     * VIRTUAL METHOD - Load state
     */
    loadState() {
        const storageKey = `utility_${this.name.toLowerCase()}`;
        try {
            const state = localStorage.getItem(storageKey);
            this.state = state ? JSON.parse(state) : {};
        } catch (error) {
            console.warn(`Failed to load state for ${this.name}:`, error);
            this.state = {};
        }
    }

    /**
     * VIRTUAL METHOD - Save state
     */
    saveState() {
        const storageKey = `utility_${this.name.toLowerCase()}`;
        try {
            localStorage.setItem(storageKey, JSON.stringify(this.state));
        } catch (error) {
            console.error(`Failed to save state for ${this.name}:`, error);
        }
    }

    /**
     * VIRTUAL METHOD - Setup handlers
     */
    setupHandlers() {
        // Override in subclasses to setup specific handlers
    }

    /**
     * METHOD OVERLOADING PATTERN - Execute with various parameter combinations
     * JavaScript doesn't support true method overloading, but we can simulate it
     */
    execute(...args) {
        // Overload based on argument count and types
        if (args.length === 0) {
            return this._executeDefault();
        } else if (args.length === 1 && typeof args[0] === 'string') {
            return this._executeByName(args[0]);
        } else if (args.length === 1 && typeof args[0] === 'object') {
            return this._executeWithOptions(args[0]);
        } else if (args.length === 2) {
            return this._executeWithCallback(args[0], args[1]);
        }
        
        throw new Error(`Invalid arguments for execute() in ${this.name}`);
    }

    /**
     * Protected methods - different execution strategies
     */
    _executeDefault() {
        console.log(`${this.name}: Executing default operation`);
        this.operationCount++;
        return { success: true, mode: 'default' };
    }

    _executeByName(name) {
        console.log(`${this.name}: Executing operation: ${name}`);
        this.operationCount++;
        return { success: true, mode: 'by-name', name };
    }

    _executeWithOptions(options) {
        console.log(`${this.name}: Executing with options:`, options);
        this.operationCount++;
        return { success: true, mode: 'with-options', options };
    }

    _executeWithCallback(data, callback) {
        console.log(`${this.name}: Executing with callback`);
        this.operationCount++;
        const result = { success: true, mode: 'with-callback', data };
        if (typeof callback === 'function') {
            callback(result);
        }
        return result;
    }

    /**
     * Common utility methods
     */
    async retry(operation, maxRetries = null) {
        const retries = maxRetries !== null ? maxRetries : this.config.retries;
        let lastError;
        
        for (let i = 0; i < retries; i++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                console.warn(`${this.name}: Retry ${i + 1}/${retries} failed:`, error.message);
                await this._delay(Math.pow(2, i) * 1000); // Exponential backoff
            }
        }
        
        throw lastError;
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Cache mechanism - demonstrates polymorphic data handling
     */
    getCached(key) {
        if (!this.config.cache) return null;
        
        const cacheKey = `${this.name}_cache_${key}`;
        try {
            const cached = sessionStorage.getItem(cacheKey);
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < this.config.timeout) {
                    return data;
                }
            }
        } catch (error) {
            console.warn(`Cache read failed for ${this.name}:`, error);
        }
        return null;
    }

    setCached(key, data) {
        if (!this.config.cache) return;
        
        const cacheKey = `${this.name}_cache_${key}`;
        try {
            const cacheData = {
                data,
                timestamp: Date.now()
            };
            sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
        } catch (error) {
            console.warn(`Cache write failed for ${this.name}:`, error);
        }
    }

    clearCache() {
        if (!this.config.cache) return;
        
        const prefix = `${this.name}_cache_`;
        Object.keys(sessionStorage)
            .filter(key => key.startsWith(prefix))
            .forEach(key => sessionStorage.removeItem(key));
        
        console.log(`${this.name}: Cache cleared`);
    }

    /**
     * Get utility statistics
     */
    getStats() {
        return {
            name: this.name,
            type: this.constructor.name,
            initialized: this.initialized,
            operationCount: this.operationCount,
            config: { ...this.config }
        };
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        console.log(`${this.name}: Cleaning up resources`);
        this.saveState();
        this.clearCache();
        this.initialized = false;
    }
}

// Export for different environments
if (typeof window !== 'undefined') {
    window.BaseUtility = BaseUtility;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BaseUtility;
}
