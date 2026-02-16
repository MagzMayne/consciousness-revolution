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
 * File: agent-logger.js
 * Declaration ID: IP-5299FD9F-MLL28ZVX
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

/** SIGNED BY MeRLynn - ID: MERLYNN-2202ebb9 - TIMESTAMP: 2025-12-19T05:53:06.532Z - HASH: 12f4ec5f */
/** SIGNED BY AGentR - ID: AGENTR-56a89b06 - TIMESTAMP: 2025-12-19T05:53:06.532Z - HASH: 12f4ec5f */

/**
 * AGENT LOGGER SYSTEM
 * Comprehensive logging system for all agent activities
 * Provides structured logging with persistence and analysis capabilities
 */

class AgentLogger {
    constructor() {
        this.logs = [];
        this.logLimit = 10000; // Max logs to keep in memory
        this.storageKey = 'agent_system_logs';
        this.init();
    }

    init() {
        // Load existing logs from localStorage
        this.loadLogs();
        console.log(`📋 Agent Logger initialized with ${this.logs.length} existing logs`);
    }

    /**
     * Load logs from localStorage
     */
    loadLogs() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.logs = JSON.parse(stored);
                // Trim to limit if needed
                if (this.logs.length > this.logLimit) {
                    this.logs = this.logs.slice(-this.logLimit);
                }
            }
        } catch (error) {
            console.warn('Failed to load logs:', error);
            this.logs = [];
        }
    }

    /**
     * Save logs to localStorage
     */
    saveLogs() {
        try {
            // Keep only recent logs within limit
            const logsToSave = this.logs.slice(-this.logLimit);
            localStorage.setItem(this.storageKey, JSON.stringify(logsToSave));
        } catch (error) {
            console.error('Failed to save logs:', error);
        }
    }

    /**
     * Create a log entry
     */
    log(level, agent, action, details = {}, result = null) {
        const entry = {
            timestamp: new Date().toISOString(),
            level: level.toUpperCase(),
            agent: agent,
            action: action,
            details: details,
            result: result,
            id: this.generateLogId()
        };

        this.logs.push(entry);
        
        // Save to localStorage
        this.saveLogs();

        // Console output with appropriate styling
        const emoji = this.getEmoji(level);
        console.log(`${emoji} [${agent}] ${action}:`, details);

        if (result) {
            console.log('  └─ Result:', result);
        }

        return entry;
    }

    /**
     * Info level log
     */
    info(agent, action, details = {}, result = null) {
        return this.log('info', agent, action, details, result);
    }

    /**
     * Success level log
     */
    success(agent, action, details = {}, result = null) {
        return this.log('success', agent, action, details, result);
    }

    /**
     * Warning level log
     */
    warn(agent, action, details = {}, result = null) {
        return this.log('warning', agent, action, details, result);
    }

    /**
     * Error level log
     */
    error(agent, action, details = {}, result = null) {
        return this.log('error', agent, action, details, result);
    }

    /**
     * Get emoji for log level
     */
    getEmoji(level) {
        const emojis = {
            'INFO': 'ℹ️',
            'SUCCESS': '✅',
            'WARNING': '⚠️',
            'ERROR': '❌',
            'DEBUG': '🔍'
        };
        return emojis[level.toUpperCase()] || '📝';
    }

    /**
     * Generate unique log ID
     */
    generateLogId() {
        return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    }

    /**
     * Get logs filtered by criteria
     */
    getFilteredLogs(filters = {}) {
        let filtered = [...this.logs];

        if (filters.agent) {
            filtered = filtered.filter(log => log.agent === filters.agent);
        }

        if (filters.level) {
            filtered = filtered.filter(log => log.level === filters.level.toUpperCase());
        }

        if (filters.action) {
            filtered = filtered.filter(log => log.action.includes(filters.action));
        }

        if (filters.startDate) {
            filtered = filtered.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
        }

        if (filters.endDate) {
            filtered = filtered.filter(log => new Date(log.timestamp) <= new Date(filters.endDate));
        }

        if (filters.limit) {
            filtered = filtered.slice(-filters.limit);
        }

        return filtered;
    }

    /**
     * Get statistics from logs
     */
    getStats() {
        const stats = {
            total: this.logs.length,
            byLevel: {},
            byAgent: {},
            byAction: {},
            recentActivity: []
        };

        // Count by level
        this.logs.forEach(log => {
            stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
            stats.byAgent[log.agent] = (stats.byAgent[log.agent] || 0) + 1;
        });

        // Recent activity (last 50 logs)
        stats.recentActivity = this.logs.slice(-50).reverse();

        return stats;
    }

    /**
     * Export logs as JSON
     */
    exportLogs(format = 'json') {
        const data = {
            exportDate: new Date().toISOString(),
            totalLogs: this.logs.length,
            logs: this.logs
        };

        if (format === 'json') {
            return JSON.stringify(data, null, 2);
        } else if (format === 'csv') {
            return this.convertToCSV(data.logs);
        }

        return data;
    }

    /**
     * Convert logs to CSV format
     */
    convertToCSV(logs) {
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

    /**
     * Clear all logs
     */
    clearLogs() {
        this.logs = [];
        this.saveLogs();
        console.log('🗑️ All logs cleared');
    }

    /**
     * Clear old logs (older than specified days)
     */
    clearOldLogs(daysToKeep = 7) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        const originalLength = this.logs.length;
        this.logs = this.logs.filter(log => new Date(log.timestamp) >= cutoffDate);
        
        this.saveLogs();
        
        const removedCount = originalLength - this.logs.length;
        console.log(`🗑️ Removed ${removedCount} old logs (kept last ${daysToKeep} days)`);
        
        return removedCount;
    }
}

// Create singleton instance
if (typeof window !== 'undefined') {
    window.AgentLogger = window.AgentLogger || new AgentLogger();
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgentLogger;
}
