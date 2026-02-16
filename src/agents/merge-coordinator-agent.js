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
 * File: merge-coordinator-agent.js
 * Declaration ID: IP-2AE06EBC-MLL28ZW0
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
 * MERGE COORDINATOR AGENT
 * 
 * Purpose: Ensures agent branches can always merge by:
 * - Implementing merge locks to prevent concurrent operations
 * - Pre-commit validation and conflict detection
 * - Automatic branch synchronization
 * - Safe merge strategies
 * 
 * Critical for: Preventing merge conflicts when multiple agents run
 * 
 * Contact: BarbrickDesign@gmail.com
 */

class MergeCoordinatorAgent {
    constructor(config = {}) {
        this.config = {
            enabled: true,
            lockTimeout: 300000, // 5 minutes
            syncBeforeCommit: true,
            maxRetries: 3,
            ...config
        };
        
        this.activeLocks = new Map(); // file -> { agent, timestamp, branch }
        this.mergeQueue = []; // Queue of pending merge operations
        this.isActive = false;
        this.logs = [];
        this.metrics = {
            locksAcquired: 0,
            locksReleased: 0,
            conflictsPrevented: 0,
            mergesCompleted: 0,
            mergesFailed: 0
        };
    }

    /**
     * Initialize the merge coordinator
     */
    async init() {
        try {
            this.log('Initializing Merge Coordinator Agent...', 'info');
            
            // Load any existing lock state
            await this.loadLockState();
            
            // Start lock cleanup timer
            this.startLockCleanup();
            
            this.isActive = true;
            this.log('Merge Coordinator Agent initialized successfully', 'success');
            
            return { success: true };
        } catch (error) {
            this.log(`Failed to initialize: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * Request a merge lock for specified files
     * @param {string} agentId - ID of the requesting agent
     * @param {string[]} files - Files that need to be locked
     * @param {string} branch - Branch name
     * @returns {Promise<Object>} Lock result with lockId
     */
    async requestMergeLock(agentId, files, branch) {
        this.log(`Lock request from ${agentId} for ${files.length} files on ${branch}`, 'info');
        
        // Check if any of the files are already locked
        const conflictingLocks = [];
        for (const file of files) {
            if (this.activeLocks.has(file)) {
                const lock = this.activeLocks.get(file);
                // Check if lock is still valid
                if (Date.now() - lock.timestamp < this.config.lockTimeout) {
                    conflictingLocks.push({ file, lock });
                } else {
                    // Lock expired, remove it
                    this.activeLocks.delete(file);
                }
            }
        }

        if (conflictingLocks.length > 0) {
            this.log(`Lock denied: ${conflictingLocks.length} conflicting locks`, 'warning');
            return {
                success: false,
                conflictingLocks: conflictingLocks.map(c => ({
                    file: c.file,
                    lockedBy: c.lock.agent,
                    lockedAt: new Date(c.lock.timestamp).toISOString()
                }))
            };
        }

        // Acquire locks
        const lockId = `${agentId}-${Date.now()}`;
        const timestamp = Date.now();
        
        for (const file of files) {
            this.activeLocks.set(file, {
                agent: agentId,
                timestamp,
                branch,
                lockId
            });
        }

        this.metrics.locksAcquired += files.length;
        this.log(`Lock acquired: ${lockId} for ${files.length} files`, 'success');

        return {
            success: true,
            lockId,
            files,
            expiresAt: new Date(timestamp + this.config.lockTimeout).toISOString()
        };
    }

    /**
     * Release a merge lock
     * @param {string} lockId - Lock ID to release
     */
    async releaseMergeLock(lockId) {
        this.log(`Releasing lock: ${lockId}`, 'info');
        
        let releasedCount = 0;
        for (const [file, lock] of this.activeLocks.entries()) {
            if (lock.lockId === lockId) {
                this.activeLocks.delete(file);
                releasedCount++;
            }
        }

        this.metrics.locksReleased += releasedCount;
        this.log(`Lock released: ${lockId} (${releasedCount} files)`, 'success');

        return { success: true, filesReleased: releasedCount };
    }

    /**
     * Check if branch is ready to merge
     * @param {string} branch - Branch name to check
     * @param {string} baseBranch - Base branch (usually 'main')
     * @returns {Promise<Object>} Merge readiness status
     */
    async checkMergeReadiness(branch, baseBranch = 'main') {
        this.log(`Checking merge readiness: ${branch} -> ${baseBranch}`, 'info');
        
        try {
            // Check if branch exists
            const branchExists = await this.checkBranchExists(branch);
            if (!branchExists) {
                return {
                    ready: false,
                    reason: 'Branch does not exist',
                    checks: { branchExists: false }
                };
            }

            // Check for conflicts
            const hasConflicts = await this.checkForConflicts(branch, baseBranch);
            
            // Check if branch is behind base
            const behindStatus = await this.checkBehindStatus(branch, baseBranch);
            
            // Check for active locks on this branch
            const hasActiveLocks = this.hasActiveLocks(branch);

            const checks = {
                branchExists: true,
                hasConflicts,
                isBehind: behindStatus.behind,
                commitsBehind: behindStatus.count,
                hasActiveLocks
            };

            const ready = !hasConflicts && !hasActiveLocks;

            if (ready) {
                this.log(`Branch ${branch} is ready to merge`, 'success');
            } else {
                this.log(`Branch ${branch} is NOT ready to merge`, 'warning');
            }

            return {
                ready,
                checks,
                recommendation: this.getMergeRecommendation(checks)
            };

        } catch (error) {
            this.log(`Error checking merge readiness: ${error.message}`, 'error');
            return {
                ready: false,
                reason: error.message,
                checks: { error: true }
            };
        }
    }

    /**
     * Synchronize branch with base before committing
     * @param {string} branch - Branch to synchronize
     * @param {string} baseBranch - Base branch
     */
    async syncBranchBeforeCommit(branch, baseBranch = 'main') {
        this.log(`Synchronizing ${branch} with ${baseBranch}`, 'info');
        
        try {
            // This would typically use git operations
            // For now, we'll return a status object
            
            const status = await this.checkBehindStatus(branch, baseBranch);
            
            if (status.behind && status.count > 0) {
                this.log(`Branch is ${status.count} commits behind, sync recommended`, 'warning');
                
                return {
                    success: false,
                    needsSync: true,
                    commitsBehind: status.count,
                    message: `Branch needs to be updated with ${status.count} commits from ${baseBranch}`,
                    gitCommand: `git pull origin ${baseBranch}`
                };
            }

            this.log('Branch is up to date', 'success');
            return {
                success: true,
                needsSync: false,
                message: 'Branch is synchronized'
            };

        } catch (error) {
            this.log(`Error during sync: ${error.message}`, 'error');
            return {
                success: false,
                needsSync: false,
                error: error.message
            };
        }
    }

    /**
     * Pre-commit validation
     * Ensures it's safe to commit changes
     */
    async validatePreCommit(agentId, files, branch) {
        this.log(`Pre-commit validation for ${agentId} on ${branch}`, 'info');
        
        const validations = {
            hasLock: false,
            branchSynced: false,
            noConflicts: false,
            safe: false
        };

        try {
            // Check if agent has locks for these files
            const lockedFiles = [];
            for (const file of files) {
                const lock = this.activeLocks.get(file);
                if (lock && lock.agent === agentId) {
                    lockedFiles.push(file);
                }
            }
            
            validations.hasLock = lockedFiles.length === files.length;

            // Check if branch is synchronized
            const syncStatus = await this.syncBranchBeforeCommit(branch);
            validations.branchSynced = syncStatus.success && !syncStatus.needsSync;

            // Check for conflicts
            const hasConflicts = await this.checkForConflicts(branch, 'main');
            validations.noConflicts = !hasConflicts;

            // Overall safety check
            validations.safe = validations.hasLock && 
                              validations.branchSynced && 
                              validations.noConflicts;

            if (validations.safe) {
                this.log('Pre-commit validation passed', 'success');
                this.metrics.conflictsPrevented++;
            } else {
                this.log('Pre-commit validation failed', 'error');
            }

            return {
                valid: validations.safe,
                validations,
                warnings: this.getValidationWarnings(validations)
            };

        } catch (error) {
            this.log(`Pre-commit validation error: ${error.message}`, 'error');
            return {
                valid: false,
                validations,
                error: error.message
            };
        }
    }

    /**
     * Helper: Check if branch exists
     */
    async checkBranchExists(branch) {
        // In a real implementation, this would use git commands
        // For now, we'll assume branches exist
        return true;
    }

    /**
     * Helper: Check for conflicts between branches
     */
    async checkForConflicts(branch, baseBranch) {
        // In a real implementation, this would perform a test merge
        // For now, we'll return false (no conflicts)
        // This should be implemented with actual git operations
        return false;
    }

    /**
     * Helper: Check if branch is behind base
     */
    async checkBehindStatus(branch, baseBranch) {
        // In a real implementation, this would count commits
        // For now, we'll return a mock status
        return {
            behind: false,
            count: 0
        };
    }

    /**
     * Helper: Check if there are active locks for this branch
     */
    hasActiveLocks(branch) {
        for (const lock of this.activeLocks.values()) {
            if (lock.branch === branch) {
                // Check if lock is still valid
                if (Date.now() - lock.timestamp < this.config.lockTimeout) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Helper: Get merge recommendation based on checks
     */
    getMergeRecommendation(checks) {
        if (checks.hasConflicts) {
            return 'Resolve conflicts before merging';
        }
        if (checks.hasActiveLocks) {
            return 'Wait for active operations to complete';
        }
        if (checks.isBehind && checks.commitsBehind > 10) {
            return 'Update branch with base changes (significantly behind)';
        }
        if (checks.isBehind) {
            return 'Consider updating branch with base changes';
        }
        return 'Safe to merge';
    }

    /**
     * Helper: Get validation warnings
     */
    getValidationWarnings(validations) {
        const warnings = [];
        
        if (!validations.hasLock) {
            warnings.push('No merge lock acquired for files - concurrent modifications possible');
        }
        if (!validations.branchSynced) {
            warnings.push('Branch not synchronized with base - update recommended');
        }
        if (!validations.noConflicts) {
            warnings.push('Conflicts detected - resolve before committing');
        }
        
        return warnings;
    }

    /**
     * Start automatic cleanup of expired locks
     */
    startLockCleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }

        this.cleanupInterval = setInterval(() => {
            this.cleanupExpiredLocks();
        }, 60000); // Run every minute
    }

    /**
     * Clean up expired locks
     */
    cleanupExpiredLocks() {
        const now = Date.now();
        let cleanedCount = 0;

        for (const [file, lock] of this.activeLocks.entries()) {
            if (now - lock.timestamp > this.config.lockTimeout) {
                this.activeLocks.delete(file);
                cleanedCount++;
            }
        }

        if (cleanedCount > 0) {
            this.log(`Cleaned up ${cleanedCount} expired locks`, 'info');
        }
    }

    /**
     * Load lock state (for persistence)
     */
    async loadLockState() {
        // In a real implementation, this would load from storage
        // For now, start with empty state
        this.log('Lock state loaded (empty)', 'info');
    }

    /**
     * Save lock state (for persistence)
     */
    async saveLockState() {
        // In a real implementation, this would save to storage
        // For now, this is a no-op
    }

    /**
     * Get current status
     */
    getStatus() {
        return {
            isActive: this.isActive,
            activeLocks: this.activeLocks.size,
            queueLength: this.mergeQueue.length,
            metrics: this.metrics,
            config: this.config
        };
    }

    /**
     * Logging system
     */
    log(message, level = 'info') {
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            agent: 'MergeCoordinatorAgent'
        };
        
        this.logs.push(entry);
        
        // Keep only last 1000 logs
        if (this.logs.length > 1000) {
            this.logs = this.logs.slice(-1000);
        }
        
        // Console output with color
        const colors = {
            info: '\x1b[36m',    // Cyan
            success: '\x1b[32m', // Green
            warning: '\x1b[33m', // Yellow
            error: '\x1b[31m'    // Red
        };
        
        console.log(`${colors[level]}[${level.toUpperCase()}] ${message}\x1b[0m`);
    }

    /**
     * Stop the coordinator
     */
    async stop() {
        this.log('Stopping Merge Coordinator Agent...', 'info');
        
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        
        // Release all locks
        this.activeLocks.clear();
        this.isActive = false;
        
        this.log('Merge Coordinator Agent stopped', 'success');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MergeCoordinatorAgent;
}

// Make available globally in browser
if (typeof window !== 'undefined') {
    window.MergeCoordinatorAgent = MergeCoordinatorAgent;
}
