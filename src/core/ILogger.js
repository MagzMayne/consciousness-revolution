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
 * File: ILogger.js
 * Declaration ID: IP-49F283E2-MLL28ZW3
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
 * LOGGER INTERFACE
 * Defines the contract for all logger implementations
 * Demonstrates interface-based polymorphism
 * 
 * Key Polymorphic Features:
 * - Interface segregation principle
 * - Multiple implementations with same interface
 * - Runtime type selection
 * - Dependency injection support
 */

class ILogger {
    /**
     * Log an info message
     * @param {string} agent - Agent name
     * @param {string} action - Action description
     * @param {object} details - Additional details
     * @param {any} result - Optional result
     */
    info(agent, action, details = {}, result = null) {
        throw new Error('ILogger.info() must be implemented');
    }

    /**
     * Log a success message
     * @param {string} agent - Agent name
     * @param {string} action - Action description
     * @param {object} details - Additional details
     * @param {any} result - Optional result
     */
    success(agent, action, details = {}, result = null) {
        throw new Error('ILogger.success() must be implemented');
    }

    /**
     * Log a warning message
     * @param {string} agent - Agent name
     * @param {string} action - Action description
     * @param {object} details - Additional details
     * @param {any} result - Optional result
     */
    warn(agent, action, details = {}, result = null) {
        throw new Error('ILogger.warn() must be implemented');
    }

    /**
     * Log an error message
     * @param {string} agent - Agent name
     * @param {string} action - Action description
     * @param {object} details - Additional details
     * @param {any} result - Optional result
     */
    error(agent, action, details = {}, result = null) {
        throw new Error('ILogger.error() must be implemented');
    }

    /**
     * Get filtered logs
     * @param {object} filters - Filter criteria
     * @returns {Array} Filtered log entries
     */
    getFilteredLogs(filters = {}) {
        throw new Error('ILogger.getFilteredLogs() must be implemented');
    }

    /**
     * Get statistics
     * @returns {object} Log statistics
     */
    getStats() {
        throw new Error('ILogger.getStats() must be implemented');
    }

    /**
     * Export logs
     * @param {string} format - Export format (json, csv, etc.)
     * @returns {string} Exported data
     */
    exportLogs(format = 'json') {
        throw new Error('ILogger.exportLogs() must be implemented');
    }

    /**
     * Clear logs
     */
    clearLogs() {
        throw new Error('ILogger.clearLogs() must be implemented');
    }
}

/**
 * CONSOLE LOGGER IMPLEMENTATION
 * Simple console-based logger implementing ILogger interface
 * Demonstrates interface implementation and method overriding
 */
class ConsoleLogger extends ILogger {
    constructor() {
        super();
        this.logs = [];
        this.logLimit = 1000;
    }

    info(agent, action, details = {}, result = null) {
        const entry = this._createEntry('INFO', agent, action, details, result);
        this.logs.push(entry);
        console.log(`ℹ️ [${agent}] ${action}:`, details);
        return entry;
    }

    success(agent, action, details = {}, result = null) {
        const entry = this._createEntry('SUCCESS', agent, action, details, result);
        this.logs.push(entry);
        console.log(`✅ [${agent}] ${action}:`, details);
        return entry;
    }

    warn(agent, action, details = {}, result = null) {
        const entry = this._createEntry('WARNING', agent, action, details, result);
        this.logs.push(entry);
        console.warn(`⚠️ [${agent}] ${action}:`, details);
        return entry;
    }

    error(agent, action, details = {}, result = null) {
        const entry = this._createEntry('ERROR', agent, action, details, result);
        this.logs.push(entry);
        console.error(`❌ [${agent}] ${action}:`, details);
        return entry;
    }

    getFilteredLogs(filters = {}) {
        return this.logs.filter(log => {
            if (filters.agent && log.agent !== filters.agent) return false;
            if (filters.level && log.level !== filters.level) return false;
            return true;
        });
    }

    getStats() {
        return {
            total: this.logs.length,
            byLevel: this._countByLevel(),
            byAgent: this._countByAgent()
        };
    }

    exportLogs(format = 'json') {
        if (format === 'json') {
            return JSON.stringify(this.logs, null, 2);
        }
        return this.logs;
    }

    clearLogs() {
        this.logs = [];
        console.log('🗑️ Logs cleared');
    }

    _createEntry(level, agent, action, details, result) {
        return {
            timestamp: new Date().toISOString(),
            level,
            agent,
            action,
            details,
            result,
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
        };
    }

    _countByLevel() {
        const counts = {};
        this.logs.forEach(log => {
            counts[log.level] = (counts[log.level] || 0) + 1;
        });
        return counts;
    }

    _countByAgent() {
        const counts = {};
        this.logs.forEach(log => {
            counts[log.agent] = (counts[log.agent] || 0) + 1;
        });
        return counts;
    }
}

/**
 * STORAGE LOGGER IMPLEMENTATION
 * Logger with persistent storage implementing ILogger interface
 * Demonstrates different implementation of same interface
 */
class StorageLogger extends ILogger {
    constructor(storageKey = 'app_logs') {
        super();
        this.storageKey = storageKey;
        this.logs = [];
        this.logLimit = 10000;
        this.loadLogs();
    }

    loadLogs() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.logs = JSON.parse(stored);
            }
        } catch (error) {
            console.warn('Failed to load logs:', error);
            this.logs = [];
        }
    }

    saveLogs() {
        try {
            const logsToSave = this.logs.slice(-this.logLimit);
            localStorage.setItem(this.storageKey, JSON.stringify(logsToSave));
        } catch (error) {
            console.error('Failed to save logs:', error);
        }
    }

    info(agent, action, details = {}, result = null) {
        return this._log('INFO', agent, action, details, result);
    }

    success(agent, action, details = {}, result = null) {
        return this._log('SUCCESS', agent, action, details, result);
    }

    warn(agent, action, details = {}, result = null) {
        return this._log('WARNING', agent, action, details, result);
    }

    error(agent, action, details = {}, result = null) {
        return this._log('ERROR', agent, action, details, result);
    }

    _log(level, agent, action, details, result) {
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            agent,
            action,
            details,
            result,
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
        };
        
        this.logs.push(entry);
        this.saveLogs();
        
        const emoji = this._getEmoji(level);
        console.log(`${emoji} [${agent}] ${action}:`, details);
        
        return entry;
    }

    _getEmoji(level) {
        const emojis = {
            'INFO': 'ℹ️',
            'SUCCESS': '✅',
            'WARNING': '⚠️',
            'ERROR': '❌'
        };
        return emojis[level] || '📝';
    }

    getFilteredLogs(filters = {}) {
        return this.logs.filter(log => {
            if (filters.agent && log.agent !== filters.agent) return false;
            if (filters.level && log.level !== filters.level) return false;
            if (filters.startDate && new Date(log.timestamp) < new Date(filters.startDate)) return false;
            if (filters.endDate && new Date(log.timestamp) > new Date(filters.endDate)) return false;
            return true;
        });
    }

    getStats() {
        const stats = {
            total: this.logs.length,
            byLevel: {},
            byAgent: {},
            recentActivity: this.logs.slice(-50).reverse()
        };

        this.logs.forEach(log => {
            stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
            stats.byAgent[log.agent] = (stats.byAgent[log.agent] || 0) + 1;
        });

        return stats;
    }

    exportLogs(format = 'json') {
        const data = {
            exportDate: new Date().toISOString(),
            totalLogs: this.logs.length,
            logs: this.logs
        };

        if (format === 'json') {
            return JSON.stringify(data, null, 2);
        } else if (format === 'csv') {
            return this._convertToCSV(data.logs);
        }

        return data;
    }

    _convertToCSV(logs) {
        const headers = ['Timestamp', 'Level', 'Agent', 'Action', 'Details', 'Result'];
        const rows = logs.map(log => [
            log.timestamp,
            log.level,
            log.agent,
            log.action,
            JSON.stringify(log.details),
            JSON.stringify(log.result)
        ]);

        return [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
    }

    clearLogs() {
        this.logs = [];
        this.saveLogs();
        console.log('🗑️ All logs cleared');
    }
}

/**
 * LOGGER FACTORY
 * Factory pattern for creating logger instances
 * Demonstrates parametric polymorphism
 */
class LoggerFactory {
    static createLogger(type = 'storage', options = {}) {
        switch (type.toLowerCase()) {
            case 'console':
                return new ConsoleLogger();
            case 'storage':
                return new StorageLogger(options.storageKey);
            default:
                console.warn(`Unknown logger type: ${type}, using storage logger`);
                return new StorageLogger();
        }
    }
}

// Export for different environments
if (typeof window !== 'undefined') {
    window.ILogger = ILogger;
    window.ConsoleLogger = ConsoleLogger;
    window.StorageLogger = StorageLogger;
    window.LoggerFactory = LoggerFactory;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ILogger, ConsoleLogger, StorageLogger, LoggerFactory };
}
