/**
 * ════════════════════════════════════════════════════════════════════════════════
 * © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * PIGEON NAVIGATION AGENT
 * 
 * Autonomous agent using homing pigeon mechanics for:
 * - Self-correcting navigation through complex problem spaces
 * - Distributed coordination with other agents
 * - Persistent goal-oriented behavior
 * - Robust handling of noisy/imperfect data
 * 
 * Author: Ryan Barbrick
 * Business: Barbrick Design
 * Contact: BarbrickDesign@gmail.com
 * AI Assistant: Merlin AI
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * @aul-enabled
 * This file is compatible with AI Universal Language (AUL)
 * Learn more: https://barbrickdesign.github.io/ai-universal-language.html
 */

class PigeonNavigationAgent {
    constructor(config = {}) {
        this.config = {
            agentId: config.agentId || `pigeon-agent-${Date.now()}`,
            homePosition: config.homePosition || null,
            initialPosition: config.initialPosition || { x: 0, y: 0, z: 0 },
            
            // Navigation settings
            sensorNoise: config.sensorNoise || 0.1,
            adaptiveLearning: config.adaptiveLearning !== false,
            
            // Swarm settings
            swarmEnabled: config.swarmEnabled !== false,
            swarmId: config.swarmId || null,
            
            // Logging
            logLevel: config.logLevel || 'info',
            maxHistorySize: config.maxHistorySize || 1000,
            
            ...config
        };
        
        // Load homing pigeon framework
        if (typeof HomingPigeonFramework === 'undefined' && typeof require !== 'undefined') {
            const HomingPigeonFramework = require('../ai/homing-pigeon-framework.js');
            this.framework = new HomingPigeonFramework(config);
        } else if (typeof HomingPigeonFramework !== 'undefined') {
            this.framework = new HomingPigeonFramework(config);
        } else {
            throw new Error('HomingPigeonFramework not available. Load homing-pigeon-framework.js first.');
        }
        
        this.currentPosition = { ...this.config.initialPosition };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.history = [];
        this.sensorData = {
            sun: null,
            magnetic: null,
            landmark: null,
            olfactory: null
        };
        
        // Set home vector if provided
        if (this.config.homePosition) {
            this.framework.setHomeVector(this.config.homePosition);
        }
        
        this.isActive = false;
        this.taskQueue = [];
        this.currentTask = null;
        
        this.log('Agent initialized', 'info');
    }

    // ============================================================================
    // AGENT LIFECYCLE
    // ============================================================================
    
    async start() {
        this.isActive = true;
        this.log('Agent started', 'info');
        
        // Begin navigation loop if home is set
        if (this.framework.homeVector) {
            this.navigationLoop();
        }
    }
    
    async stop() {
        this.isActive = false;
        this.log('Agent stopped', 'info');
    }
    
    async navigationLoop() {
        while (this.isActive) {
            if (this.currentTask) {
                await this.executeTask(this.currentTask);
            } else if (this.taskQueue.length > 0) {
                this.currentTask = this.taskQueue.shift();
            } else {
                // If no tasks, navigate toward home
                await this.navigateToHome();
            }
            
            // Small delay to prevent busy loop
            await this.sleep(100);
        }
    }

    // ============================================================================
    // NAVIGATION METHODS
    // ============================================================================
    
    /**
     * Navigate to home using sensor fusion
     */
    async navigateToHome() {
        if (!this.framework.homeVector) {
            this.log('No home vector set', 'warn');
            return;
        }
        
        // Update sensor data (simulated)
        await this.updateSensors();
        
        // Use vector navigation with multiple sensors
        const result = this.framework.vectorNavigate(
            this.currentPosition,
            this.framework.homeVector,
            this.sensorData
        );
        
        // Update position
        this.currentPosition = result.nextPosition;
        this.velocity = result.direction;
        
        // Record history
        this.recordHistory({
            position: { ...this.currentPosition },
            distance: result.distance,
            timestamp: Date.now()
        });
        
        // Check if reached home
        if (this.framework.isHome(this.currentPosition, 0.5)) {
            this.log('Reached home!', 'success');
            await this.onHomeReached();
        }
        
        return result;
    }
    
    /**
     * Update sensor data with simulated readings
     */
    async updateSensors() {
        // In a real implementation, these would be actual sensor readings
        // For now, we simulate noisy but generally accurate sensors
        
        const noise = this.config.sensorNoise;
        const homeVector = this.framework.getHomeVector(this.currentPosition);
        
        // Simulate sun compass (usually most reliable)
        this.sensorData.sun = {
            direction: this.addNoise(homeVector, noise * 0.5),
            reliability: 0.9 - Math.random() * 0.2
        };
        
        // Simulate magnetic field (medium reliability)
        this.sensorData.magnetic = {
            direction: this.addNoise(homeVector, noise),
            reliability: 0.7 - Math.random() * 0.2
        };
        
        // Simulate landmark recognition (varies by distance)
        const distanceToHome = this.framework.calculateDistance(
            this.currentPosition, 
            this.framework.homeVector
        );
        const landmarkReliability = Math.max(0.3, 1.0 - distanceToHome / 10.0);
        this.sensorData.landmark = {
            direction: this.addNoise(homeVector, noise * 1.5),
            reliability: landmarkReliability
        };
        
        // Simulate olfactory cues (low reliability, high noise)
        this.sensorData.olfactory = {
            direction: this.addNoise(homeVector, noise * 2.0),
            reliability: 0.5 - Math.random() * 0.3
        };
    }
    
    addNoise(vector, noiseLevel) {
        return {
            x: vector.x + (Math.random() - 0.5) * noiseLevel,
            y: vector.y + (Math.random() - 0.5) * noiseLevel,
            z: (vector.z || 0) + (Math.random() - 0.5) * noiseLevel
        };
    }

    // ============================================================================
    // TASK EXECUTION
    // ============================================================================
    
    async executeTask(task) {
        this.log(`Executing task: ${task.type}`, 'info');
        
        switch (task.type) {
            case 'navigate':
                await this.navigateToPosition(task.target);
                break;
                
            case 'search':
                await this.searchArea(task.bounds, task.objective);
                break;
                
            case 'optimize':
                await this.optimizeFunction(task.objective, task.bounds);
                break;
                
            case 'coordinate':
                await this.coordinateWithSwarm(task.swarm, task.target);
                break;
                
            default:
                this.log(`Unknown task type: ${task.type}`, 'warn');
        }
        
        this.currentTask = null;
    }
    
    /**
     * Navigate to a specific position
     */
    async navigateToPosition(target) {
        const maxSteps = 1000;
        let steps = 0;
        
        while (steps < maxSteps && !this.framework.isHome(this.currentPosition, 0.5)) {
            // Temporarily set target as home
            const originalHome = this.framework.homeVector;
            this.framework.setHomeVector(target);
            
            await this.navigateToHome();
            
            // Restore original home
            if (originalHome) {
                this.framework.setHomeVector(originalHome);
            }
            
            steps++;
            
            if (this.framework.calculateDistance(this.currentPosition, target) < 0.5) {
                this.log('Reached target position', 'success');
                break;
            }
        }
    }
    
    /**
     * Search an area using gradient following
     */
    async searchArea(bounds, objectiveFunction) {
        this.log('Starting area search', 'info');
        
        // Use gradient descent to find optimal point
        const result = this.framework.gradientFollow(
            objectiveFunction,
            this.currentPosition,
            { maxIterations: 500 }
        );
        
        // Move to optimal position
        this.currentPosition = result.optimal;
        
        this.log(`Search complete. Found optimal at ${JSON.stringify(result.optimal)}`, 'success');
        return result;
    }
    
    /**
     * Optimize a function using particle swarm
     */
    async optimizeFunction(objectiveFunction, bounds) {
        this.log('Starting function optimization', 'info');
        
        const result = this.framework.particleSwarmOptimization(
            objectiveFunction,
            bounds,
            { swarmSize: 20, maxIterations: 200 }
        );
        
        this.log(`Optimization complete. Best value: ${result.value}`, 'success');
        return result;
    }
    
    /**
     * Coordinate with other agents in swarm
     */
    async coordinateWithSwarm(swarmAgents, target) {
        this.log('Coordinating with swarm', 'info');
        
        // Convert agents to format expected by swarm coordination
        const agents = swarmAgents.map(agent => ({
            position: agent.currentPosition,
            velocity: agent.velocity
        }));
        
        // Update all agent positions
        const updatedAgents = this.framework.swarmCoordinate(agents, target);
        
        // Update this agent's state
        const myIndex = swarmAgents.findIndex(a => a.config.agentId === this.config.agentId);
        if (myIndex >= 0) {
            this.currentPosition = updatedAgents[myIndex].position;
            this.velocity = updatedAgents[myIndex].velocity;
        }
        
        return updatedAgents;
    }

    // ============================================================================
    // TASK MANAGEMENT
    // ============================================================================
    
    addTask(task) {
        this.taskQueue.push(task);
        this.log(`Task added: ${task.type}`, 'info');
    }
    
    clearTasks() {
        this.taskQueue = [];
        this.currentTask = null;
        this.log('All tasks cleared', 'info');
    }
    
    async onHomeReached() {
        this.log('Home reached - ready for new tasks', 'info');
        // Override this method in subclasses for custom behavior
    }

    // ============================================================================
    // STATE & REPORTING
    // ============================================================================
    
    getState() {
        return {
            agentId: this.config.agentId,
            isActive: this.isActive,
            currentPosition: { ...this.currentPosition },
            velocity: { ...this.velocity },
            homeVector: this.framework.homeVector,
            distanceToHome: this.framework.homeVector ? 
                this.framework.calculateDistance(this.currentPosition, this.framework.homeVector) : null,
            taskQueue: this.taskQueue.length,
            currentTask: this.currentTask ? this.currentTask.type : null,
            historySize: this.history.length
        };
    }
    
    getProgress() {
        if (!this.framework.homeVector || this.history.length < 2) {
            return null;
        }
        
        const current = this.history[this.history.length - 1];
        const previous = this.history[this.history.length - 2];
        
        return this.framework.evaluateProgress(
            current.position,
            previous.position
        );
    }
    
    recordHistory(entry) {
        this.history.push(entry);
        
        // Limit history size
        if (this.history.length > this.config.maxHistorySize) {
            this.history = this.history.slice(-this.config.maxHistorySize);
        }
    }
    
    exportHistory(format = 'json') {
        if (format === 'json') {
            return JSON.stringify(this.history, null, 2);
        } else if (format === 'csv') {
            const headers = 'Timestamp,X,Y,Z,Distance\n';
            const rows = this.history.map(h => 
                `${h.timestamp},${h.position.x},${h.position.y},${h.position.z},${h.distance}`
            ).join('\n');
            return headers + rows;
        }
    }

    // ============================================================================
    // UTILITIES
    // ============================================================================
    
    log(message, level = 'info') {
        const levels = { debug: 0, info: 1, warn: 2, error: 3, success: 1 };
        const configLevel = levels[this.config.logLevel] || 1;
        const messageLevel = levels[level] || 1;
        
        if (messageLevel >= configLevel) {
            const timestamp = new Date().toISOString();
            const prefix = `[${timestamp}] [${this.config.agentId}] [${level.toUpperCase()}]`;
            console.log(`${prefix} ${message}`);
        }
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PigeonNavigationAgent;
}

if (typeof window !== 'undefined') {
    window.PigeonNavigationAgent = PigeonNavigationAgent;
}
