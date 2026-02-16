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
 * File: resource-contribution-system.js
 * Declaration ID: IP-176C948A-MLL28ZW5
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
 * Resource Contribution System
 * Allows users to contribute compute resources (RAM, bandwidth, local storage)
 * for distributed machine learning and price prediction algorithms
 * 
 * Features:
 * - RAM contribution monitoring
 * - Bandwidth sharing and tracking
 * - Local storage allocation
 * - Compute task distribution
 * - Resource-based rewards
 * - Performance benchmarking
 * 
 * @version 1.0.0
 */

class ResourceContributionSystem {
    constructor() {
        this.contributors = new Map(); // userId -> resource allocation
        this.tasks = new Map(); // taskId -> task details
        this.performanceMetrics = new Map(); // userId -> performance stats
        this.storageKey = 'resource_contribution_data';
        this.initialized = false;
        this.activeWorkers = new Map(); // userId -> Web Worker instance
    }

    /**
     * Initialize the resource contribution system
     */
    async initialize() {
        if (this.initialized) return true;

        try {
            // Load saved data
            const savedData = localStorage.getItem(this.storageKey);
            if (savedData) {
                const data = JSON.parse(savedData);
                
                if (data.contributors) {
                    this.contributors = new Map(Object.entries(data.contributors));
                }
                
                if (data.performanceMetrics) {
                    this.performanceMetrics = new Map(Object.entries(data.performanceMetrics));
                }
            }

            // Detect available resources
            await this.detectSystemResources();

            this.initialized = true;
            console.log('✅ Resource Contribution System initialized');
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Resource Contribution System:', error);
            return false;
        }
    }

    /**
     * Detect system resources available for contribution
     */
    async detectSystemResources() {
        const resources = {
            memory: {
                total: 0,
                available: 0
            },
            storage: {
                total: 0,
                available: 0
            },
            connection: {
                type: 'unknown',
                downlink: 0,
                effectiveType: 'unknown'
            },
            cpu: {
                cores: navigator.hardwareConcurrency || 1,
                performance: 0
            }
        };

        // Memory detection
        if (performance.memory) {
            resources.memory.total = performance.memory.jsHeapSizeLimit;
            resources.memory.available = performance.memory.jsHeapSizeLimit - performance.memory.usedJSHeapSize;
        }

        // Storage detection
        if (navigator.storage && navigator.storage.estimate) {
            const estimate = await navigator.storage.estimate();
            resources.storage.total = estimate.quota || 0;
            resources.storage.available = (estimate.quota || 0) - (estimate.usage || 0);
        }

        // Network detection
        if (navigator.connection) {
            resources.connection.type = navigator.connection.type || 'unknown';
            resources.connection.downlink = navigator.connection.downlink || 0;
            resources.connection.effectiveType = navigator.connection.effectiveType || 'unknown';
        }

        // CPU performance benchmark
        resources.cpu.performance = await this.benchmarkCPU();

        this.systemResources = resources;
        return resources;
    }

    /**
     * Contribute resources to the pool
     */
    async contributeResources(userId, allocation = {}) {
        if (!this.initialized) await this.initialize();

        // Validate and set defaults
        const contribution = {
            userId: userId,
            ram: Math.min(allocation.ram || 0, this.systemResources.memory.available * 0.5), // Max 50% of available
            storage: Math.min(allocation.storage || 0, this.systemResources.storage.available * 0.3), // Max 30%
            bandwidth: allocation.bandwidth || 0, // In Mbps
            cpuCores: Math.min(allocation.cpuCores || 1, Math.max(1, this.systemResources.cpu.cores - 1)),
            startedAt: Date.now(),
            status: 'active',
            settings: {
                autoScale: allocation.autoScale !== false,
                maxCPUUsage: allocation.maxCPUUsage || 50, // percentage
                priorityLevel: allocation.priorityLevel || 'normal', // high, normal, low
                allowBackgroundTasks: allocation.allowBackgroundTasks !== false
            }
        };

        // Store contribution
        this.contributors.set(userId, contribution);

        // Initialize performance tracking
        if (!this.performanceMetrics.has(userId)) {
            this.performanceMetrics.set(userId, {
                tasksCompleted: 0,
                totalComputeTime: 0,
                averageTaskTime: 0,
                pointsEarned: 0,
                efficiency: 100,
                uptime: 100,
                lastActive: Date.now()
            });
        }

        // Start worker if CPU cores contributed
        if (contribution.cpuCores > 0) {
            this.startWorker(userId);
        }

        this.save();

        console.log(`✅ Resources contributed by ${userId}`);
        
        return {
            success: true,
            contribution: contribution,
            estimatedEarnings: this.estimateResourceEarnings(contribution)
        };
    }

    /**
     * Stop contributing resources
     */
    async stopContribution(userId) {
        if (!this.initialized) await this.initialize();

        const contribution = this.contributors.get(userId);
        if (!contribution) {
            return { success: false, error: 'No active contribution found' };
        }

        // Stop worker
        if (this.activeWorkers.has(userId)) {
            const worker = this.activeWorkers.get(userId);
            worker.terminate();
            this.activeWorkers.delete(userId);
        }

        // Update contribution status
        contribution.status = 'stopped';
        contribution.stoppedAt = Date.now();

        this.save();

        return {
            success: true,
            message: 'Resource contribution stopped',
            stats: this.performanceMetrics.get(userId)
        };
    }

    /**
     * Start a Web Worker for compute tasks
     */
    startWorker(userId) {
        try {
            const workerCode = `
                self.onmessage = function(e) {
                    const { taskId, type, data } = e.data;
                    
                    let result;
                    const startTime = performance.now();
                    
                    try {
                        switch(type) {
                            case 'ml_training':
                                result = performMLTraining(data);
                                break;
                            case 'price_prediction':
                                result = predictPrice(data);
                                break;
                            case 'data_processing':
                                result = processData(data);
                                break;
                            default:
                                result = { error: 'Unknown task type' };
                        }
                        
                        const endTime = performance.now();
                        
                        self.postMessage({
                            taskId: taskId,
                            success: true,
                            result: result,
                            computeTime: endTime - startTime
                        });
                    } catch (error) {
                        self.postMessage({
                            taskId: taskId,
                            success: false,
                            error: error.message
                        });
                    }
                };
                
                function performMLTraining(data) {
                    // Simplified ML training simulation
                    const iterations = data.iterations || 100;
                    let weights = data.weights || [Math.random(), Math.random()];
                    
                    for (let i = 0; i < iterations; i++) {
                        weights = weights.map(w => w + (Math.random() - 0.5) * 0.01);
                    }
                    
                    return { weights, iterations };
                }
                
                function predictPrice(data) {
                    // Simplified price prediction
                    const { historicalPrices, timeframe } = data;
                    
                    if (!historicalPrices || historicalPrices.length === 0) {
                        return { prediction: 0, confidence: 0 };
                    }
                    
                    const avg = historicalPrices.reduce((a, b) => a + b, 0) / historicalPrices.length;
                    const trend = (historicalPrices[historicalPrices.length - 1] - historicalPrices[0]) / historicalPrices.length;
                    
                    const prediction = avg + trend * (timeframe || 1);
                    const confidence = Math.min(95, 50 + Math.random() * 45);
                    
                    return { prediction, confidence, trend };
                }
                
                function processData(data) {
                    // Data processing simulation
                    const { values, operation } = data;
                    
                    switch(operation) {
                        case 'normalize':
                            const max = Math.max(...values);
                            const min = Math.min(...values);
                            return values.map(v => (v - min) / (max - min));
                        case 'aggregate':
                            return values.reduce((a, b) => a + b, 0) / values.length;
                        default:
                            return values;
                    }
                }
            `;

            const blob = new Blob([workerCode], { type: 'application/javascript' });
            const workerUrl = URL.createObjectURL(blob);
            const worker = new Worker(workerUrl);

            // Handle worker messages
            worker.onmessage = (e) => {
                this.handleTaskComplete(userId, e.data);
            };

            worker.onerror = (error) => {
                console.error(`Worker error for ${userId}:`, error);
            };

            this.activeWorkers.set(userId, worker);
            console.log(`✅ Worker started for ${userId}`);
            
        } catch (error) {
            console.error('Failed to start worker:', error);
        }
    }

    /**
     * Distribute a compute task to available contributors
     */
    async distributeTask(taskType, taskData, priority = 'normal') {
        if (!this.initialized) await this.initialize();

        // Find available contributors
        const availableContributors = Array.from(this.contributors.entries())
            .filter(([userId, contrib]) => {
                return contrib.status === 'active' && 
                       contrib.cpuCores > 0 &&
                       this.activeWorkers.has(userId);
            })
            .sort((a, b) => {
                // Sort by performance and priority
                const metricsA = this.performanceMetrics.get(a[0]);
                const metricsB = this.performanceMetrics.get(b[0]);
                return (metricsB?.efficiency || 0) - (metricsA?.efficiency || 0);
            });

        if (availableContributors.length === 0) {
            return {
                success: false,
                error: 'No available contributors',
                fallbackMode: true
            };
        }

        // Select contributor based on priority and load
        const [selectedUserId, contribution] = availableContributors[0];
        const taskId = this.generateTaskId();

        // Create task record
        const task = {
            id: taskId,
            type: taskType,
            data: taskData,
            assignedTo: selectedUserId,
            priority: priority,
            status: 'running',
            createdAt: Date.now(),
            startedAt: Date.now()
        };

        this.tasks.set(taskId, task);

        // Send task to worker
        const worker = this.activeWorkers.get(selectedUserId);
        worker.postMessage({
            taskId: taskId,
            type: taskType,
            data: taskData
        });

        console.log(`📤 Task ${taskId} assigned to ${selectedUserId}`);

        return {
            success: true,
            taskId: taskId,
            assignedTo: selectedUserId
        };
    }

    /**
     * Handle task completion from worker
     */
    handleTaskComplete(userId, response) {
        const task = this.tasks.get(response.taskId);
        if (!task) return;

        // Update task status
        task.status = response.success ? 'completed' : 'failed';
        task.completedAt = Date.now();
        task.result = response.result;
        task.computeTime = response.computeTime;

        // Update contributor metrics
        const metrics = this.performanceMetrics.get(userId);
        if (metrics && response.success) {
            metrics.tasksCompleted++;
            metrics.totalComputeTime += response.computeTime;
            metrics.averageTaskTime = metrics.totalComputeTime / metrics.tasksCompleted;
            metrics.lastActive = Date.now();
            
            // Calculate points earned (1 point per 100ms of compute)
            const pointsForTask = Math.ceil(response.computeTime / 100);
            metrics.pointsEarned += pointsForTask;
            
            // Update efficiency based on performance
            const expectedTime = 1000; // Expected time for reference
            metrics.efficiency = Math.min(100, (expectedTime / metrics.averageTaskTime) * 100);
        }

        this.save();

        console.log(`✅ Task ${response.taskId} completed by ${userId}`);
    }

    /**
     * Get contributor resource stats
     */
    getContributorStats(userId) {
        const contribution = this.contributors.get(userId);
        const metrics = this.performanceMetrics.get(userId);

        if (!contribution) {
            return { found: false };
        }

        return {
            found: true,
            contribution: contribution,
            metrics: metrics,
            isActive: this.activeWorkers.has(userId)
        };
    }

    /**
     * Get resource pool statistics
     */
    getPoolStats() {
        const stats = {
            totalContributors: this.contributors.size,
            activeContributors: 0,
            totalResources: {
                ram: 0,
                storage: 0,
                bandwidth: 0,
                cpuCores: 0
            },
            totalTasksCompleted: 0,
            totalComputeTime: 0
        };

        for (const [userId, contrib] of this.contributors.entries()) {
            if (contrib.status === 'active') {
                stats.activeContributors++;
                stats.totalResources.ram += contrib.ram;
                stats.totalResources.storage += contrib.storage;
                stats.totalResources.bandwidth += contrib.bandwidth;
                stats.totalResources.cpuCores += contrib.cpuCores;
            }

            const metrics = this.performanceMetrics.get(userId);
            if (metrics) {
                stats.totalTasksCompleted += metrics.tasksCompleted;
                stats.totalComputeTime += metrics.totalComputeTime;
            }
        }

        return stats;
    }

    /**
     * Get resource leaderboard
     */
    getLeaderboard(type = 'points', limit = 10) {
        const contributors = Array.from(this.performanceMetrics.entries())
            .map(([userId, metrics]) => ({
                userId,
                ...metrics
            }));

        if (type === 'points') {
            contributors.sort((a, b) => b.pointsEarned - a.pointsEarned);
        } else if (type === 'tasks') {
            contributors.sort((a, b) => b.tasksCompleted - a.tasksCompleted);
        } else if (type === 'efficiency') {
            contributors.sort((a, b) => b.efficiency - a.efficiency);
        }

        return contributors.slice(0, limit).map((c, index) => ({
            rank: index + 1,
            userId: c.userId,
            pointsEarned: c.pointsEarned,
            tasksCompleted: c.tasksCompleted,
            efficiency: c.efficiency.toFixed(1)
        }));
    }

    /**
     * Estimate earnings from resource contribution
     */
    estimateResourceEarnings(contribution) {
        // Points per hour based on resources
        const ramPoints = (contribution.ram / (1024 * 1024 * 1024)) * 10; // 10 points per GB/hour
        const storagePoints = (contribution.storage / (1024 * 1024 * 1024)) * 2; // 2 points per GB/hour
        const cpuPoints = contribution.cpuCores * 50; // 50 points per core/hour
        const bandwidthPoints = contribution.bandwidth * 5; // 5 points per Mbps/hour

        const hourlyPoints = ramPoints + storagePoints + cpuPoints + bandwidthPoints;

        return {
            hourly: Math.round(hourlyPoints),
            daily: Math.round(hourlyPoints * 24),
            weekly: Math.round(hourlyPoints * 24 * 7),
            monthly: Math.round(hourlyPoints * 24 * 30)
        };
    }

    /**
     * Benchmark CPU performance
     */
    async benchmarkCPU() {
        return new Promise((resolve) => {
            const start = performance.now();
            let iterations = 0;
            const maxTime = 100; // 100ms benchmark

            while (performance.now() - start < maxTime) {
                // Simple computation benchmark
                Math.sqrt(Math.random() * 1000000);
                iterations++;
            }

            const iterationsPerSecond = (iterations / maxTime) * 1000;
            resolve(Math.round(iterationsPerSecond));
        });
    }

    /**
     * Generate unique task ID
     */
    generateTaskId() {
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Save data to localStorage
     */
    save() {
        try {
            const data = {
                contributors: Object.fromEntries(this.contributors),
                performanceMetrics: Object.fromEntries(this.performanceMetrics),
                lastSaved: Date.now()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save resource data:', error);
        }
    }

    /**
     * Clear all data
     */
    clearAll() {
        // Terminate all workers
        for (const worker of this.activeWorkers.values()) {
            worker.terminate();
        }
        
        this.contributors.clear();
        this.tasks.clear();
        this.performanceMetrics.clear();
        this.activeWorkers.clear();
        localStorage.removeItem(this.storageKey);
        console.log('🗑️ All resource data cleared');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResourceContributionSystem;
}
