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
 * File: node-hosting-system.js
 * Declaration ID: IP-784E676-MLL28ZW2
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
 * Node Hosting & Resource Sharing System
 * Allows users to contribute computing resources (storage, RAM, bandwidth)
 * to support the platform and earn rewards
 * 
 * Features:
 * - Resource allocation management (drive space, RAM, bandwidth)
 * - Uptime tracking and monitoring
 * - Reward calculation based on contribution and availability
 * - P2P node discovery and connection
 * - Resource usage statistics
 * - Automatic reward distribution
 * 
 * @version 1.0.0
 * @author BarbrickDesign Platform Team
 */

class NodeHostingSystem {
    constructor() {
        this.nodes = new Map(); // Map of nodeId -> node details
        this.userNodes = new Map(); // Map of userId -> Set of nodeIds
        this.uptimeLog = []; // Array of uptime check records
        this.resourceUsageLog = []; // Array of resource usage records
        
        // Uptime monitoring configuration
        this.uptimeConfig = {
            heartbeatTimeoutMinutes: 15, // Minutes without heartbeat before considering offline
            maxUptimeReduction: 10, // Maximum uptime reduction per check
            reductionRate: 5, // Uptime reduction per hour offline
            checkIntervalMinutes: 5 // How often to check node health
        };
        
        this.rewardRates = {
            storage: {
                pointsPerGBPerDay: 0.5,
                bonusForHighAvailability: 1.5
            },
            ram: {
                pointsPerGBPerDay: 1.0,
                bonusForHighAvailability: 1.5
            },
            bandwidth: {
                pointsPerGBTransferred: 0.1,
                bonusForHighSpeed: 1.3
            },
            uptime: {
                pointsPerDayAt100Percent: 10,
                minimumUptimeForRewards: 95 // percent
            }
        };
        this.initialized = false;
        this.storageKey = 'bcert_node_hosting';
        this.uptimeLogKey = 'bcert_node_uptime_log';
        this.nodeCheckInterval = null;
    }

    /**
     * Initialize the system and load saved data
     */
    async initialize() {
        if (this.initialized) return true;

        try {
            // Load nodes from localStorage
            const nodesData = localStorage.getItem(this.storageKey);
            if (nodesData) {
                const parsed = JSON.parse(nodesData);
                this.nodes = new Map(Object.entries(parsed.nodes || {}));
                this.userNodes = new Map(
                    Object.entries(parsed.userNodes || {}).map(([k, v]) => [k, new Set(v)])
                );
            }

            // Load uptime log
            const uptimeData = localStorage.getItem(this.uptimeLogKey);
            if (uptimeData) {
                this.uptimeLog = JSON.parse(uptimeData);
            }

            this.initialized = true;
            console.log('✅ Node Hosting System initialized');
            
            // Start monitoring active nodes
            this.startNodeMonitoring();
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Node Hosting System:', error);
            return false;
        }
    }

    /**
     * Register a new node for hosting
     */
    async registerNode(userId, resourceAllocation, options = {}) {
        if (!this.initialized) await this.initialize();

        // Validate inputs
        if (!userId || !resourceAllocation) {
            throw new Error('Missing required parameters: userId, resourceAllocation');
        }

        // Validate resource allocation
        const { storageGB, ramGB, bandwidthGBPerMonth } = resourceAllocation;
        
        if (!storageGB || storageGB < 1) {
            throw new Error('Minimum storage allocation is 1 GB');
        }
        if (!ramGB || ramGB < 0.5) {
            throw new Error('Minimum RAM allocation is 0.5 GB');
        }
        if (!bandwidthGBPerMonth || bandwidthGBPerMonth < 10) {
            throw new Error('Minimum bandwidth allocation is 10 GB per month');
        }

        // Create node record
        const nodeId = this.generateNodeId();
        const node = {
            id: nodeId,
            userId: userId,
            status: 'active',
            registeredAt: new Date().toISOString(),
            lastHeartbeat: new Date().toISOString(),
            resourceAllocation: {
                storageGB: storageGB,
                ramGB: ramGB,
                bandwidthGBPerMonth: bandwidthGBPerMonth
            },
            resourceUsage: {
                storageUsedGB: 0,
                ramUsedGB: 0,
                bandwidthUsedGB: 0
            },
            performance: {
                uptime: 100, // percentage
                avgResponseTime: 0,
                totalRequests: 0,
                successfulRequests: 0
            },
            rewards: {
                totalPointsEarned: 0,
                lastRewardCalculation: new Date().toISOString()
            },
            settings: {
                autoRenew: options.autoRenew !== false,
                allowPublicAccess: options.allowPublicAccess !== false,
                maxConcurrentConnections: options.maxConcurrentConnections || 10
            },
            metadata: {
                nodeVersion: '1.0.0',
                location: options.location || 'unknown',
                connectionType: options.connectionType || 'unknown' // wifi, ethernet, fiber
            }
        };

        // Save node
        this.nodes.set(nodeId, node);

        // Update user nodes
        if (!this.userNodes.has(userId)) {
            this.userNodes.set(userId, new Set());
        }
        this.userNodes.get(userId).add(nodeId);

        // Persist to storage
        this.saveToStorage();

        // Log the registration
        this.logEvent({
            type: 'registration',
            nodeId: nodeId,
            userId: userId,
            resources: resourceAllocation,
            timestamp: new Date().toISOString()
        });

        console.log(`✅ Node registered successfully (ID: ${nodeId})`);
        console.log(`📊 Allocated: ${storageGB}GB storage, ${ramGB}GB RAM, ${bandwidthGBPerMonth}GB bandwidth/month`);
        
        return {
            success: true,
            nodeId: nodeId,
            message: 'Node registered successfully! You will earn points based on uptime and resource usage.',
            estimatedPointsPerDay: this.estimateDailyRewards(resourceAllocation)
        };
    }

    /**
     * Send heartbeat to keep node active
     */
    async sendHeartbeat(nodeId, performanceMetrics = {}) {
        if (!this.initialized) await this.initialize();

        const node = this.nodes.get(nodeId);
        if (!node) {
            throw new Error('Node not found');
        }

        // Update last heartbeat
        node.lastHeartbeat = new Date().toISOString();

        // Update performance metrics if provided
        if (performanceMetrics.responseTime) {
            node.performance.avgResponseTime = 
                (node.performance.avgResponseTime * 0.9) + (performanceMetrics.responseTime * 0.1);
        }
        if (performanceMetrics.requestCount) {
            node.performance.totalRequests += performanceMetrics.requestCount;
        }
        if (performanceMetrics.successCount) {
            node.performance.successfulRequests += performanceMetrics.successCount;
        }

        // Update resource usage if provided
        if (performanceMetrics.storageUsedGB !== undefined) {
            node.resourceUsage.storageUsedGB = performanceMetrics.storageUsedGB;
        }
        if (performanceMetrics.ramUsedGB !== undefined) {
            node.resourceUsage.ramUsedGB = performanceMetrics.ramUsedGB;
        }
        if (performanceMetrics.bandwidthUsedGB !== undefined) {
            node.resourceUsage.bandwidthUsedGB = performanceMetrics.bandwidthUsedGB;
        }

        this.nodes.set(nodeId, node);
        this.saveToStorage();

        return {
            success: true,
            message: 'Heartbeat received',
            nodeStatus: node.status,
            uptime: node.performance.uptime
        };
    }

    /**
     * Calculate and award rewards for a node
     */
    async calculateRewards(nodeId) {
        if (!this.initialized) await this.initialize();

        const node = this.nodes.get(nodeId);
        if (!node) {
            throw new Error('Node not found');
        }

        const now = new Date();
        const lastCalculation = new Date(node.rewards.lastRewardCalculation);
        const daysSinceLastCalculation = (now - lastCalculation) / (1000 * 60 * 60 * 24);

        // Only calculate if at least 1 hour has passed
        if (daysSinceLastCalculation < 1/24) {
            return {
                success: false,
                message: 'Rewards calculated less than 1 hour ago'
            };
        }

        // Calculate rewards based on resource allocation and uptime
        let points = 0;

        // Storage points
        points += node.resourceAllocation.storageGB * 
                  this.rewardRates.storage.pointsPerGBPerDay * 
                  daysSinceLastCalculation;

        // RAM points
        points += node.resourceAllocation.ramGB * 
                  this.rewardRates.ram.pointsPerGBPerDay * 
                  daysSinceLastCalculation;

        // Bandwidth points (based on actual usage)
        points += node.resourceUsage.bandwidthUsedGB * 
                  this.rewardRates.bandwidth.pointsPerGBTransferred;

        // Uptime bonus
        if (node.performance.uptime >= this.rewardRates.uptime.minimumUptimeForRewards) {
            const uptimePoints = this.rewardRates.uptime.pointsPerDayAt100Percent * 
                                (node.performance.uptime / 100) * 
                                daysSinceLastCalculation;
            points += uptimePoints;
        }

        // High availability bonus
        if (node.performance.uptime >= 99) {
            points *= this.rewardRates.storage.bonusForHighAvailability;
        }

        points = Math.round(points * 100) / 100; // Round to 2 decimals

        // Update node rewards
        node.rewards.totalPointsEarned += points;
        node.rewards.lastRewardCalculation = now.toISOString();
        this.nodes.set(nodeId, node);

        // Log reward calculation
        this.logEvent({
            type: 'reward_calculation',
            nodeId: nodeId,
            userId: node.userId,
            pointsAwarded: points,
            timestamp: now.toISOString()
        });

        this.saveToStorage();

        console.log(`💰 ${points} points awarded to node ${nodeId}`);

        return {
            success: true,
            pointsAwarded: points,
            totalPoints: node.rewards.totalPointsEarned,
            uptime: node.performance.uptime
        };
    }

    /**
     * Get node statistics
     */
    getNodeStats(nodeId) {
        if (!this.initialized) {
            console.warn('System not initialized');
            return null;
        }

        const node = this.nodes.get(nodeId);
        if (!node) {
            throw new Error('Node not found');
        }

        return {
            nodeId: node.id,
            status: node.status,
            uptime: node.performance.uptime,
            resourceAllocation: node.resourceAllocation,
            resourceUsage: node.resourceUsage,
            utilizationPercentage: {
                storage: (node.resourceUsage.storageUsedGB / node.resourceAllocation.storageGB * 100).toFixed(2),
                ram: (node.resourceUsage.ramUsedGB / node.resourceAllocation.ramGB * 100).toFixed(2)
            },
            performance: node.performance,
            rewards: node.rewards,
            estimatedDailyPoints: this.estimateDailyRewards(node.resourceAllocation, node.performance.uptime)
        };
    }

    /**
     * Get user's node statistics
     */
    getUserNodeStats(userId) {
        if (!this.initialized) {
            console.warn('System not initialized');
            return null;
        }

        const userNodeIds = this.userNodes.get(userId);
        if (!userNodeIds || userNodeIds.size === 0) {
            return {
                totalNodes: 0,
                activeNodes: 0,
                totalResourcesAllocated: { storageGB: 0, ramGB: 0, bandwidthGBPerMonth: 0 },
                totalPointsEarned: 0,
                averageUptime: 0,
                nodes: []
            };
        }

        const nodes = Array.from(userNodeIds).map(id => 
            this.nodes.get(id)
        ).filter(n => n !== undefined);

        const stats = {
            totalNodes: nodes.length,
            activeNodes: nodes.filter(n => n.status === 'active').length,
            totalResourcesAllocated: {
                storageGB: nodes.reduce((sum, n) => sum + n.resourceAllocation.storageGB, 0),
                ramGB: nodes.reduce((sum, n) => sum + n.resourceAllocation.ramGB, 0),
                bandwidthGBPerMonth: nodes.reduce((sum, n) => sum + n.resourceAllocation.bandwidthGBPerMonth, 0)
            },
            totalPointsEarned: nodes.reduce((sum, n) => sum + n.rewards.totalPointsEarned, 0),
            averageUptime: nodes.reduce((sum, n) => sum + n.performance.uptime, 0) / nodes.length,
            nodes: nodes.map(n => ({
                nodeId: n.id,
                status: n.status,
                uptime: n.performance.uptime,
                pointsEarned: n.rewards.totalPointsEarned,
                registeredAt: n.registeredAt
            }))
        };

        return stats;
    }

    /**
     * Get leaderboard of top node hosts
     */
    getLeaderboard(limit = 10) {
        if (!this.initialized) {
            console.warn('System not initialized');
            return [];
        }

        // Aggregate points by user
        const userPoints = new Map();
        
        for (const [userId, nodeIds] of this.userNodes.entries()) {
            let totalPoints = 0;
            let totalUptime = 0;
            let nodeCount = 0;

            for (const nodeId of nodeIds) {
                const node = this.nodes.get(nodeId);
                if (node && node.status === 'active') {
                    totalPoints += node.rewards.totalPointsEarned;
                    totalUptime += node.performance.uptime;
                    nodeCount++;
                }
            }

            if (nodeCount > 0) {
                userPoints.set(userId, {
                    userId: userId,
                    totalPoints: totalPoints,
                    averageUptime: totalUptime / nodeCount,
                    activeNodes: nodeCount
                });
            }
        }

        // Sort by points and return top N
        return Array.from(userPoints.values())
            .sort((a, b) => b.totalPoints - a.totalPoints)
            .slice(0, limit);
    }

    /**
     * Deactivate/remove a node
     */
    async deactivateNode(nodeId, userId) {
        if (!this.initialized) await this.initialize();

        const node = this.nodes.get(nodeId);
        
        if (!node) {
            throw new Error('Node not found');
        }

        if (node.userId !== userId) {
            throw new Error('Unauthorized: You can only deactivate your own nodes');
        }

        // Calculate final rewards before deactivation
        await this.calculateRewards(nodeId);

        node.status = 'deactivated';
        node.deactivatedAt = new Date().toISOString();
        this.nodes.set(nodeId, node);

        this.saveToStorage();

        this.logEvent({
            type: 'deactivation',
            nodeId: nodeId,
            userId: userId,
            timestamp: new Date().toISOString()
        });

        return {
            success: true,
            message: 'Node deactivated successfully',
            finalStats: {
                uptime: node.performance.uptime,
                totalPointsEarned: node.rewards.totalPointsEarned
            }
        };
    }

    /**
     * Start monitoring active nodes
     */
    startNodeMonitoring() {
        if (this.nodeCheckInterval) {
            clearInterval(this.nodeCheckInterval);
        }

        // Check nodes every 5 minutes
        this.nodeCheckInterval = setInterval(() => {
            this.checkNodeHealth();
        }, 5 * 60 * 1000);
    }

    /**
     * Check health of all active nodes
     */
    checkNodeHealth() {
        if (!this.initialized) return;

        const now = new Date();
        
        for (const [nodeId, node] of this.nodes.entries()) {
            if (node.status !== 'active') continue;

            const lastHeartbeat = new Date(node.lastHeartbeat);
            const minutesSinceHeartbeat = (now - lastHeartbeat) / (1000 * 60);

            // If no heartbeat for configured timeout, mark as offline and reduce uptime
            if (minutesSinceHeartbeat > this.uptimeConfig.heartbeatTimeoutMinutes) {
                // Calculate uptime reduction based on time offline
                const hoursSinceHeartbeat = minutesSinceHeartbeat / 60;
                const uptimeReduction = Math.min(
                    this.uptimeConfig.maxUptimeReduction, 
                    hoursSinceHeartbeat * this.uptimeConfig.reductionRate
                );
                node.performance.uptime = Math.max(0, node.performance.uptime - uptimeReduction);
                
                // Log uptime check
                this.uptimeLog.push({
                    nodeId: nodeId,
                    timestamp: now.toISOString(),
                    status: 'offline',
                    uptime: node.performance.uptime
                });

                this.nodes.set(nodeId, node);
            }
        }

        // Keep uptime log manageable
        if (this.uptimeLog.length > 1000) {
            this.uptimeLog = this.uptimeLog.slice(-1000);
        }

        this.saveToStorage();
    }

    /**
     * Estimate daily rewards for given resource allocation
     */
    estimateDailyRewards(resourceAllocation, uptime = 100) {
        let points = 0;

        // Storage points
        points += resourceAllocation.storageGB * 
                  this.rewardRates.storage.pointsPerGBPerDay;

        // RAM points
        points += resourceAllocation.ramGB * 
                  this.rewardRates.ram.pointsPerGBPerDay;

        // Uptime points
        if (uptime >= this.rewardRates.uptime.minimumUptimeForRewards) {
            points += this.rewardRates.uptime.pointsPerDayAt100Percent * (uptime / 100);
        }

        // High availability bonus
        if (uptime >= 99) {
            points *= this.rewardRates.storage.bonusForHighAvailability;
        }

        return Math.round(points * 100) / 100;
    }

    /**
     * Helper: Generate unique node ID
     */
    generateNodeId() {
        return 'node_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
    }

    /**
     * Helper: Save to localStorage
     */
    saveToStorage() {
        try {
            const nodesData = {
                nodes: Object.fromEntries(this.nodes),
                userNodes: Object.fromEntries(
                    Array.from(this.userNodes.entries()).map(([k, v]) => [k, Array.from(v)])
                )
            };
            localStorage.setItem(this.storageKey, JSON.stringify(nodesData));
            localStorage.setItem(this.uptimeLogKey, JSON.stringify(this.uptimeLog.slice(-500)));
        } catch (error) {
            console.error('Failed to save to storage:', error);
        }
    }

    /**
     * Helper: Log events
     */
    logEvent(event) {
        const auditLog = JSON.parse(localStorage.getItem('bcert_node_audit_log') || '[]');
        auditLog.push(event);
        
        // Keep last 1000 events
        if (auditLog.length > 1000) {
            auditLog.splice(0, auditLog.length - 1000);
        }
        
        localStorage.setItem('bcert_node_audit_log', JSON.stringify(auditLog));
    }

    /**
     * Get system statistics
     */
    getSystemStats() {
        return {
            totalNodes: this.nodes.size,
            activeNodes: Array.from(this.nodes.values()).filter(n => n.status === 'active').length,
            totalHosts: this.userNodes.size,
            totalResourcesAllocated: this.getTotalResources(),
            totalPointsDistributed: Array.from(this.nodes.values()).reduce(
                (sum, n) => sum + n.rewards.totalPointsEarned, 0
            ),
            averageUptime: this.getAverageUptime()
        };
    }

    /**
     * Get total resources across all nodes
     */
    getTotalResources() {
        const total = {
            storageGB: 0,
            ramGB: 0,
            bandwidthGBPerMonth: 0
        };

        for (const node of this.nodes.values()) {
            if (node.status === 'active') {
                total.storageGB += node.resourceAllocation.storageGB;
                total.ramGB += node.resourceAllocation.ramGB;
                total.bandwidthGBPerMonth += node.resourceAllocation.bandwidthGBPerMonth;
            }
        }

        return total;
    }

    /**
     * Get average uptime across all active nodes
     */
    getAverageUptime() {
        const activeNodes = Array.from(this.nodes.values()).filter(n => n.status === 'active');
        if (activeNodes.length === 0) return 0;

        const totalUptime = activeNodes.reduce((sum, n) => sum + n.performance.uptime, 0);
        return Math.round(totalUptime / activeNodes.length * 100) / 100;
    }
}

// Create and export global instance
if (typeof window !== 'undefined') {
    window.NodeHostingSystem = NodeHostingSystem;
    window.nodeHostingSystem = new NodeHostingSystem();
    
    // Auto-initialize on load
    if (document.readyState === 'complete') {
        window.nodeHostingSystem.initialize();
    } else {
        window.addEventListener('load', () => {
            window.nodeHostingSystem.initialize();
        });
    }
    
    console.log('🖥️ Node Hosting System loaded');
    console.log('💡 Type nodeHostingSystem.getSystemStats() to see hosting statistics');
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NodeHostingSystem;
}
