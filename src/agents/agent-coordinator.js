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
 * File: agent-coordinator.js
 * Declaration ID: IP-25752F71-MLL28ZVX
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

/** SIGNED BY MeRLynn - ID: MERLYNN-09c2de08 - TIMESTAMP: 2025-12-19T05:53:06.532Z - HASH: 0dc0fc5d */
/** SIGNED BY AGentR - ID: AGENTR-2a375615 - TIMESTAMP: 2025-12-19T05:53:06.532Z - HASH: 0dc0fc5d */

/**
 * AGENT COORDINATOR
 * Orchestrates multiple agents, manages communication, prioritizes tasks
 * Central command center for the agent system
 * 
 * ENHANCED WITH HOMING PIGEON MECHANICS:
 * - Swarm coordination for distributed agent management
 * - Persistent goal state (home vector) for consistent objectives
 * - Self-correcting navigation through task space
 */

class AgentCoordinator {
    constructor(dependencies = {}) {
        this.logger = null;
        this.managementAgent = null;
        this.deploymentAgent = null;
        this.githubPRAgent = null;
        this.mergeCoordinator = null;
        this.isRunning = false;
        this.taskQueue = [];
        this.activeTask = null;
        this.history = [];
        
        // Store dependencies for Node.js compatibility
        this.AgentLogger = dependencies.AgentLogger || (typeof window !== 'undefined' && window.AgentLogger);
        this.ManagementAgent = dependencies.ManagementAgent || (typeof window !== 'undefined' && window.ManagementAgent);
        this.DeploymentAgent = dependencies.DeploymentAgent || (typeof window !== 'undefined' && window.DeploymentAgent);
        this.GitHubPRReviewAgent = dependencies.GitHubPRReviewAgent || (typeof window !== 'undefined' && window.GitHubPRReviewAgent);
        this.MergeCoordinatorAgent = dependencies.MergeCoordinatorAgent || (typeof window !== 'undefined' && window.MergeCoordinatorAgent);
        
        // Homing pigeon mechanics integration
        this.pigeonFramework = null;
        this.systemGoal = null;  // Persistent home vector for the system
        this.agentStates = [];   // Track all agent positions/states for swarm coordination
        
        this.init();
    }

    async init() {
        console.log('🎯 Agent Coordinator initializing...');

        // Initialize logger first
        this.logger = (typeof window !== 'undefined' && window.AgentLogger) || 
                     (this.AgentLogger ? new this.AgentLogger() : null);
        
        if (!this.logger) {
            console.error('AgentLogger not available');
            return;
        }
        
        // Wait a moment for logger to be ready
        await this.sleep(100);
        
        // Initialize homing pigeon framework for advanced coordination
        try {
            // Try to load HomingPigeonFramework if available
            const HomingPigeonFramework = (typeof window !== 'undefined' && window.HomingPigeonFramework) ||
                                         (dependencies.HomingPigeonFramework);
            
            if (HomingPigeonFramework) {
                this.pigeonFramework = new HomingPigeonFramework({
                    swarmSize: 5,  // Number of coordinated agents
                    communicationRadius: 10,
                    adaptiveLearning: true
                });
                
                // Set system goal (healthy repository with 100% functionality)
                this.setSystemGoal({
                    healthScore: 100,
                    functionality: 100,
                    performance: 100
                });
                
                console.log('🕊️ Homing Pigeon mechanics enabled for agent coordination');
            } else {
                console.log('ℹ️ Homing Pigeon mechanics not available - using standard coordination');
            }
        } catch (error) {
            console.warn('⚠️ Could not initialize Homing Pigeon mechanics:', error.message);
        }
        
        // Initialize merge coordinator for conflict prevention
        if (this.MergeCoordinatorAgent) {
            this.mergeCoordinator = new this.MergeCoordinatorAgent({
                enabled: true,
                lockTimeout: 300000, // 5 minutes
                syncBeforeCommit: true
            });
            await this.mergeCoordinator.init();
            console.log('✅ Merge Coordinator initialized');
        } else {
            console.warn('⚠️ MergeCoordinatorAgent not available - merge coordination disabled');
        }
        
        // Initialize agents
        if (this.ManagementAgent) {
            this.managementAgent = new this.ManagementAgent(this.logger);
        }
        if (this.DeploymentAgent) {
            this.deploymentAgent = new this.DeploymentAgent(this.logger);
        }
        if (this.GitHubPRReviewAgent) {
            this.githubPRAgent = new this.GitHubPRReviewAgent(this.logger);
        }
        
        this.logger.success('AgentCoordinator', 'Initialization complete', {
            agents: ['ManagementAgent', 'DeploymentAgent', 'GitHubPRReviewAgent', 'MergeCoordinatorAgent']
        });
        
        console.log('✅ Agent Coordinator ready');
    }

    /**
     * Start full agent system operation
     */
    async startFullOperation() {
        if (this.isRunning) {
            this.logger.warn('AgentCoordinator', 'Already running');
            return;
        }

        this.isRunning = true;
        this.logger.info('AgentCoordinator', 'Starting full operation', {
            timestamp: new Date().toISOString()
        });

        try {
            // Phase 1: Management agent crawls and analyzes
            this.logger.info('AgentCoordinator', 'Phase 1: File crawl and analysis');
            const crawlResults = await this.managementAgent.startCrawl();
            
            this.history.push({
                phase: 'crawl',
                timestamp: new Date().toISOString(),
                results: crawlResults
            });

            // Phase 2: Deployment agent health check
            this.logger.info('AgentCoordinator', 'Phase 2: Health check');
            const healthStatus = await this.deploymentAgent.performHealthCheck();
            
            this.history.push({
                phase: 'health-check',
                timestamp: new Date().toISOString(),
                results: healthStatus
            });

            // Phase 3: Apply fixes if needed
            if (crawlResults.issues && crawlResults.issues.length > 0) {
                this.logger.info('AgentCoordinator', 'Phase 3: Applying fixes', {
                    issueCount: crawlResults.issues.length
                });
                
                const fixResults = await this.deploymentAgent.applyManagementFixes(crawlResults.issues);
                
                this.history.push({
                    phase: 'fix-application',
                    timestamp: new Date().toISOString(),
                    results: fixResults
                });
            } else {
                this.logger.success('AgentCoordinator', 'Phase 3: No fixes needed');
            }

            // Phase 4: Verify deployment
            this.logger.info('AgentCoordinator', 'Phase 4: Deployment verification');
            const verification = await this.deploymentAgent.verifyDeployment();
            
            this.history.push({
                phase: 'verification',
                timestamp: new Date().toISOString(),
                results: verification
            });

            // Phase 5: Generate final report
            const finalReport = this.generateFinalReport();
            
            this.logger.success('AgentCoordinator', 'Full operation complete', {
                phases: this.history.length,
                healthScore: crawlResults.healthScore,
                fixesApplied: this.deploymentAgent.appliedFixes.length
            });

            this.isRunning = false;
            return finalReport;

        } catch (error) {
            this.logger.error('AgentCoordinator', 'Operation failed', {
                error: error.message,
                stack: error.stack
            });
            this.isRunning = false;
            throw error;
        }
    }

    /**
     * Quick health check of all systems
     */
    async quickHealthCheck() {
        this.logger.info('AgentCoordinator', 'Quick health check');

        const status = {
            timestamp: new Date().toISOString(),
            coordinator: {
                active: true,
                running: this.isRunning
            },
            agents: {
                management: this.managementAgent.getStatus(),
                deployment: this.deploymentAgent.getStatus(),
                githubPR: this.githubPRAgent ? this.githubPRAgent.getStatus() : null
            },
            logger: {
                active: this.logger !== null,
                logCount: this.logger.logs.length
            }
        };

        this.logger.success('AgentCoordinator', 'Health check complete', status);
        return status;
    }

    /**
     * Add task to queue
     */
    addTask(task) {
        const taskId = this.generateTaskId();
        const queuedTask = {
            id: taskId,
            ...task,
            status: 'queued',
            addedAt: new Date().toISOString()
        };

        this.taskQueue.push(queuedTask);
        
        this.logger.info('AgentCoordinator', 'Task queued', {
            taskId,
            type: task.type,
            queueLength: this.taskQueue.length
        });

        // Start processing if not already running
        if (!this.isRunning && !this.activeTask) {
            this.processTaskQueue();
        }

        return taskId;
    }

    /**
     * Process task queue
     */
    async processTaskQueue() {
        while (this.taskQueue.length > 0) {
            const task = this.taskQueue.shift();
            this.activeTask = task;
            task.status = 'processing';
            task.startedAt = new Date().toISOString();

            this.logger.info('AgentCoordinator', 'Processing task', {
                taskId: task.id,
                type: task.type
            });

            try {
                const result = await this.executeTask(task);
                task.status = 'completed';
                task.completedAt = new Date().toISOString();
                task.result = result;

                this.logger.success('AgentCoordinator', 'Task completed', {
                    taskId: task.id,
                    duration: Date.parse(task.completedAt) - Date.parse(task.startedAt)
                });

            } catch (error) {
                task.status = 'failed';
                task.error = error.message;
                task.completedAt = new Date().toISOString();

                this.logger.error('AgentCoordinator', 'Task failed', {
                    taskId: task.id,
                    error: error.message
                });
            }

            this.history.push(task);
            this.activeTask = null;
        }
    }

    /**
     * Execute individual task
     */
    async executeTask(task) {
        switch (task.type) {
            case 'crawl':
                return await this.managementAgent.startCrawl();
            
            case 'health-check':
                return await this.deploymentAgent.performHealthCheck();
            
            case 'fix':
                return await this.deploymentAgent.applyManagementFixes(task.issues || []);
            
            case 'verify':
                return await this.deploymentAgent.verifyDeployment();
            
            case 'full-operation':
                return await this.startFullOperation();
            
            case 'github-pr-review':
                if (!this.githubPRAgent) {
                    throw new Error('GitHub PR Review Agent not initialized');
                }
                return await this.githubPRAgent.processAllNotifications();
            
            default:
                throw new Error(`Unknown task type: ${task.type}`);
        }
    }

    /**
     * Generate task ID
     */
    generateTaskId() {
        return `task-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    }

    /**
     * Generate final report
     */
    generateFinalReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                operationHistory: this.history.length,
                totalIssuesFound: 0,
                totalFixesApplied: this.deploymentAgent.appliedFixes.length,
                healthScore: 100,
                systemStatus: 'healthy'
            },
            phases: this.history,
            agents: {
                management: this.managementAgent.getStatus(),
                deployment: this.deploymentAgent.getStatus(),
                githubPR: this.githubPRAgent ? this.githubPRAgent.getStatus() : null
            },
            recommendations: []
        };

        // Calculate totals from history
        this.history.forEach(phase => {
            if (phase.results && phase.results.issues) {
                report.summary.totalIssuesFound += phase.results.issues.length || 0;
            }
            if (phase.results && phase.results.healthScore !== undefined) {
                report.summary.healthScore = phase.results.healthScore;
            }
        });

        // Generate recommendations
        if (report.summary.totalIssuesFound === 0) {
            report.recommendations.push('✅ All systems operational - no issues detected');
        } else {
            report.recommendations.push('⚠️ Issues detected and logged');
            if (report.summary.totalFixesApplied > 0) {
                report.recommendations.push(`✅ ${report.summary.totalFixesApplied} fixes automatically applied`);
            }
        }

        if (report.summary.healthScore < 80) {
            report.summary.systemStatus = 'needs-attention';
            report.recommendations.push('⚠️ Health score below 80 - manual review recommended');
        } else if (report.summary.healthScore < 95) {
            report.summary.systemStatus = 'good';
        } else {
            report.summary.systemStatus = 'excellent';
        }

        return report;
    }

    /**
     * Get current status
     */
    getStatus() {
        return {
            coordinator: {
                running: this.isRunning,
                activeTask: this.activeTask,
                queuedTasks: this.taskQueue.length,
                historyLength: this.history.length
            },
            agents: {
                management: this.managementAgent ? this.managementAgent.getStatus() : null,
                deployment: this.deploymentAgent ? this.deploymentAgent.getStatus() : null,
                githubPR: this.githubPRAgent ? this.githubPRAgent.getStatus() : null
            },
            logger: this.logger ? {
                logCount: this.logger.logs.length
            } : null
        };
    }

    /**
     * Get operation history
     */
    getHistory(limit = 10) {
        return this.history.slice(-limit).reverse();
    }

    /**
     * Clear history
     */
    clearHistory() {
        const count = this.history.length;
        this.history = [];
        this.logger.info('AgentCoordinator', 'History cleared', { itemsCleared: count });
        return count;
    }

    /**
     * Emergency stop
     */
    emergencyStop() {
        this.logger.warn('AgentCoordinator', 'Emergency stop initiated');
        this.isRunning = false;
        this.activeTask = null;
        this.taskQueue = [];
        this.logger.success('AgentCoordinator', 'Emergency stop complete');
    }

    /**
     * Execute agent operation with merge coordination
     * This ensures safe operations with conflict prevention
     * 
     * @param {string} agentId - ID of the agent
     * @param {string[]} files - Files to be modified
     * @param {string} branch - Branch name
     * @param {Function} operation - Operation to perform
     * @returns {Promise<Object>} Operation result
     */
    async executeWithMergeCoordination(agentId, files, branch, operation) {
        if (!this.mergeCoordinator) {
            // No merge coordinator available, execute directly (not recommended)
            this.logger.warn('AgentCoordinator', 'Executing without merge coordination', {
                agentId,
                files: files.length
            });
            return await operation();
        }

        let lockResult = null;
        
        try {
            // Step 1: Request merge lock
            this.logger.info('AgentCoordinator', 'Requesting merge lock', {
                agentId,
                files: files.length,
                branch
            });
            
            lockResult = await this.mergeCoordinator.requestMergeLock(
                agentId,
                files,
                branch
            );

            if (!lockResult.success) {
                // Files are locked by another agent
                this.logger.warn('AgentCoordinator', 'Merge lock denied', {
                    agentId,
                    conflictingLocks: lockResult.conflictingLocks
                });
                
                return {
                    success: false,
                    skipped: true,
                    reason: 'Files locked by another agent',
                    conflictingLocks: lockResult.conflictingLocks
                };
            }

            // Step 2: Check merge readiness
            const readiness = await this.mergeCoordinator.checkMergeReadiness(
                branch,
                'main'
            );

            if (!readiness.ready) {
                this.logger.warn('AgentCoordinator', 'Branch not ready for merge', {
                    agentId,
                    branch,
                    checks: readiness.checks
                });
                
                // Release lock before returning
                await this.mergeCoordinator.releaseMergeLock(lockResult.lockId);
                
                return {
                    success: false,
                    notReady: true,
                    reason: readiness.recommendation,
                    checks: readiness.checks
                };
            }

            // Step 3: Execute the operation
            this.logger.info('AgentCoordinator', 'Executing operation with merge lock', {
                agentId,
                lockId: lockResult.lockId
            });
            
            const result = await operation();

            // Step 4: Validate before commit (if operation was successful)
            if (result.success && result.needsCommit) {
                const validation = await this.mergeCoordinator.validatePreCommit(
                    agentId,
                    files,
                    branch
                );

                if (!validation.valid) {
                    this.logger.error('AgentCoordinator', 'Pre-commit validation failed', {
                        agentId,
                        validations: validation.validations,
                        warnings: validation.warnings
                    });
                    
                    return {
                        success: false,
                        validationFailed: true,
                        validations: validation.validations,
                        warnings: validation.warnings
                    };
                }
                
                this.logger.success('AgentCoordinator', 'Pre-commit validation passed', {
                    agentId
                });
            }

            return {
                success: true,
                result,
                lockId: lockResult.lockId
            };

        } catch (error) {
            this.logger.error('AgentCoordinator', 'Operation failed with error', {
                agentId,
                error: error.message
            });
            
            return {
                success: false,
                error: error.message
            };

        } finally {
            // Always release the lock
            if (lockResult && lockResult.success) {
                this.logger.info('AgentCoordinator', 'Releasing merge lock', {
                    agentId,
                    lockId: lockResult.lockId
                });
                
                await this.mergeCoordinator.releaseMergeLock(lockResult.lockId);
            }
        }
    }

    /**
     * Get merge coordinator status
     */
    getMergeCoordinatorStatus() {
        if (!this.mergeCoordinator) {
            return {
                available: false,
                message: 'Merge coordinator not initialized'
            };
        }
        
        return {
            available: true,
            ...this.mergeCoordinator.getStatus()
        };
    }

    /**
     * Helper sleep function
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // ============================================================================
    // HOMING PIGEON MECHANICS METHODS
    // ============================================================================
    
    /**
     * Set the system goal (home vector)
     * This is the persistent target state all agents work toward
     */
    setSystemGoal(goal) {
        if (this.pigeonFramework) {
            this.systemGoal = goal;
            // Convert goal to 3D position for framework
            const goalPosition = {
                x: goal.healthScore || 0,
                y: goal.functionality || 0,
                z: goal.performance || 0
            };
            this.pigeonFramework.setHomeVector(goalPosition);
            this.logger?.info('AgentCoordinator', 'System goal set', goal);
        }
    }
    
    /**
     * Evaluate progress toward system goal
     */
    evaluateSystemProgress(currentState) {
        if (!this.pigeonFramework || !this.systemGoal) {
            return null;
        }
        
        const currentPosition = {
            x: currentState.healthScore || 0,
            y: currentState.functionality || 0,
            z: currentState.performance || 0
        };
        
        return this.pigeonFramework.evaluateProgress(currentPosition);
    }
    
    /**
     * Coordinate agents using swarm intelligence
     * Agents work together without central control
     */
    coordinateAgentsWithSwarm(targetState) {
        if (!this.pigeonFramework) {
            return null;
        }
        
        // Convert agent states to swarm format
        const swarmAgents = this.agentStates.map(agent => ({
            position: {
                x: agent.healthScore || 0,
                y: agent.functionality || 0,
                z: agent.performance || 0
            },
            velocity: agent.velocity || { x: 0, y: 0, z: 0 }
        }));
        
        const target = {
            x: targetState.healthScore || 100,
            y: targetState.functionality || 100,
            z: targetState.performance || 100
        };
        
        // Get coordinated movements
        const coordinated = this.pigeonFramework.swarmCoordinate(swarmAgents, target);
        
        // Update agent states
        coordinated.forEach((updated, i) => {
            if (this.agentStates[i]) {
                this.agentStates[i].healthScore = updated.position.x;
                this.agentStates[i].functionality = updated.position.y;
                this.agentStates[i].performance = updated.position.z;
                this.agentStates[i].velocity = updated.velocity;
            }
        });
        
        return coordinated;
    }
    
    /**
     * Use gradient descent to optimize agent strategy
     */
    optimizeAgentStrategy(objectiveFunction, currentStrategy) {
        if (!this.pigeonFramework) {
            return null;
        }
        
        const result = this.pigeonFramework.gradientFollow(
            objectiveFunction,
            currentStrategy,
            { maxIterations: 100, learningRate: 0.1 }
        );
        
        this.logger?.info('AgentCoordinator', 'Strategy optimized', {
            iterations: result.iterations,
            converged: result.converged
        });
        
        return result.optimal;
    }
    
    /**
     * Track agent state using dead reckoning
     */
    trackAgentState(agentId, movements) {
        if (!this.pigeonFramework) {
            return null;
        }
        
        const agent = this.agentStates.find(a => a.id === agentId);
        if (!agent) {
            return null;
        }
        
        const initialState = {
            position: {
                x: agent.healthScore || 0,
                y: agent.functionality || 0,
                z: agent.performance || 0
            },
            velocity: agent.velocity || { x: 0, y: 0, z: 0 }
        };
        
        return this.pigeonFramework.deadReckon(initialState, movements);
    }
}

// Create singleton instance
if (typeof window !== 'undefined') {
    window.AgentCoordinator = AgentCoordinator;
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgentCoordinator;
}
