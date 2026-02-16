/**
 * ════════════════════════════════════════════════════════════════════════════════
 * © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * PIGEON MECHANICS INTEGRATION EXAMPLES
 * 
 * Practical examples showing how to integrate homing pigeon mechanics
 * into existing systems in this repository.
 * 
 * Author: Ryan Barbrick
 * Business: Barbrick Design
 * Contact: BarbrickDesign@gmail.com
 * AI Assistant: Merlin AI
 * ════════════════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// EXAMPLE 1: Enhance Agent Coordinator with Swarm Intelligence
// ============================================================================

/**
 * Before: Manual agent coordination
 */
class OldAgentCoordinator {
    coordinateAgents() {
        // Manual sequential processing
        this.agents.forEach(agent => {
            agent.processTask();
        });
    }
}

/**
 * After: Swarm-based agent coordination
 */
class EnhancedAgentCoordinator {
    constructor() {
        this.pigeonFramework = new HomingPigeonFramework();
        this.agents = [];
    }
    
    coordinateAgents(targetGoal) {
        // Convert agents to swarm format
        const swarmAgents = this.agents.map(agent => ({
            position: agent.getCurrentState(),
            velocity: agent.getVelocity()
        }));
        
        // Use swarm coordination - agents self-organize
        const coordinated = this.pigeonFramework.swarmCoordinate(
            swarmAgents,
            targetGoal
        );
        
        // Update each agent with coordinated movement
        coordinated.forEach((updated, i) => {
            this.agents[i].moveToward(updated.position);
        });
    }
}

// ============================================================================
// EXAMPLE 2: 3D Navigation with Sensor Fusion
// ============================================================================

/**
 * Enhance 3D scene navigation with pigeon mechanics
 */
class Enhanced3DNavigator {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.pigeon = new HomingPigeonFramework();
        
        // Set target position (e.g., POI in 3D scene)
        this.pigeon.setHomeVector({ x: 100, y: 50, z: 30 });
    }
    
    /**
     * Navigate camera using multiple input sources
     * (mouse, keyboard, gamepad, etc.)
     */
    updateCameraPosition(inputs) {
        const currentPos = {
            x: this.camera.position.x,
            y: this.camera.position.y,
            z: this.camera.position.z
        };
        
        // Simulate multiple "sensors" from different inputs
        const sensors = {
            // Mouse input (like sun compass - usually reliable)
            sun: {
                direction: this.getMouseDirection(),
                reliability: 0.9
            },
            // Keyboard (like magnetic field)
            magnetic: {
                direction: this.getKeyboardDirection(),
                reliability: 0.7
            },
            // Gamepad (like landmarks)
            landmark: {
                direction: this.getGamepadDirection(),
                reliability: 0.6
            }
        };
        
        // Fuse all inputs into optimal movement
        const navigation = this.pigeon.vectorNavigate(
            currentPos,
            this.pigeon.homeVector,
            sensors
        );
        
        // Smoothly move camera
        this.camera.position.x = navigation.nextPosition.x;
        this.camera.position.y = navigation.nextPosition.y;
        this.camera.position.z = navigation.nextPosition.z;
        
        return navigation.distance;
    }
    
    getMouseDirection() {
        // Convert mouse input to direction vector
        return { x: 0.7, y: 0.7, z: 0 };
    }
    
    getKeyboardDirection() {
        // Convert keyboard input to direction vector
        return { x: 0.71, y: 0.71, z: 0 };
    }
    
    getGamepadDirection() {
        // Convert gamepad input to direction vector
        return { x: 0.72, y: 0.68, z: 0 };
    }
}

// ============================================================================
// EXAMPLE 3: Puzzle Solver with Persistent Goal
// ============================================================================

/**
 * Puzzle-solving agent that always maintains "solution" as home vector
 */
class PuzzleSolverAgent {
    constructor(solutionState) {
        this.agent = new PigeonNavigationAgent({
            homePosition: solutionState,
            initialPosition: this.getCurrentPuzzleState()
        });
    }
    
    async solveClue(clue) {
        // Add search task to find clue meaning
        this.agent.addTask({
            type: 'search',
            bounds: this.getClueSearchSpace(clue),
            objective: (pos) => this.evaluateClueRelevance(pos, clue)
        });
        
        // Agent automatically evaluates each clue relative to solution
        const result = await this.agent.searchArea(
            this.getClueSearchSpace(clue),
            (pos) => this.evaluateClueRelevance(pos, clue)
        );
        
        return result.optimal;
    }
    
    checkProgress() {
        // Always know how close we are to solution
        const progress = this.agent.getProgress();
        
        if (progress && progress.movingTowardGoal) {
            console.log('🎯 Moving closer to solution!');
            console.log(`Progress: ${progress.improvementPercent.toFixed(2)}%`);
        }
        
        return progress;
    }
    
    getCurrentPuzzleState() {
        // Return current puzzle understanding as 3D position
        return { x: 0, y: 0, z: 0 };
    }
    
    getClueSearchSpace(clue) {
        // Define search bounds based on clue type
        return {
            x: { min: 0, max: 100 },
            y: { min: 0, max: 100 },
            z: { min: 0, max: 100 }
        };
    }
    
    evaluateClueRelevance(position, clue) {
        // Return how relevant this position is to solving the clue
        // Lower = better (for minimization)
        return Math.random() * 100;
    }
}

// ============================================================================
// EXAMPLE 4: AI Strategy Optimization
// ============================================================================

/**
 * Use gradient descent to optimize AI strategy parameters
 */
class AIStrategyOptimizer {
    constructor() {
        this.pigeon = new HomingPigeonFramework({
            learningRate: 0.05,
            maxIterations: 500
        });
    }
    
    /**
     * Optimize strategy parameters to minimize error
     */
    optimizeStrategy(currentStrategy, performanceData) {
        // Define objective function (strategy quality)
        const objectiveFunction = (strategy) => {
            // Simulate strategy with these parameters
            const result = this.simulateStrategy(strategy);
            
            // Return error (lower is better)
            return result.error + result.complexity * 0.1;
        };
        
        // Use gradient descent to find optimal strategy
        const result = this.pigeon.gradientFollow(
            objectiveFunction,
            currentStrategy,
            { maxIterations: 500 }
        );
        
        console.log('Strategy optimized:');
        console.log('  Iterations:', result.iterations);
        console.log('  Converged:', result.converged);
        console.log('  Optimal strategy:', result.optimal);
        
        return result.optimal;
    }
    
    /**
     * Use particle swarm for complex strategy spaces
     */
    findGlobalOptimalStrategy(bounds) {
        const objectiveFunction = (strategy) => {
            return this.evaluateStrategy(strategy);
        };
        
        // PSO is better for avoiding local minima
        const result = this.pigeon.particleSwarmOptimization(
            objectiveFunction,
            bounds,
            { swarmSize: 30, maxIterations: 200 }
        );
        
        return result.optimal;
    }
    
    simulateStrategy(strategy) {
        // Simulate strategy performance
        return {
            error: Math.random() * 10,
            complexity: Math.abs(strategy.x) + Math.abs(strategy.y)
        };
    }
    
    evaluateStrategy(strategy) {
        // Evaluate strategy quality
        return Math.random() * 100;
    }
}

// ============================================================================
// EXAMPLE 5: Robot Navigation with Noisy Sensors
// ============================================================================

/**
 * Real-world robot navigation with imperfect sensors
 */
class RobotNavigator {
    constructor() {
        this.pigeon = new HomingPigeonFramework({
            kalmanProcessNoise: 0.1,
            kalmanMeasurementNoise: 0.2
        });
        
        this.position = { x: 0, y: 0, z: 0 };
        this.measurements = [];
    }
    
    /**
     * Set target destination
     */
    setDestination(destination) {
        this.pigeon.setHomeVector(destination);
    }
    
    /**
     * Process noisy GPS/sensor readings
     */
    updatePosition(gpsReading) {
        // Add noisy measurement
        this.measurements.push(gpsReading);
        
        // Use Kalman filter to get accurate position
        const filtered = this.pigeon.kalmanFilter(
            this.measurements.slice(-10)  // Last 10 measurements
        );
        
        this.position = filtered.estimatedState.position;
        
        return this.position;
    }
    
    /**
     * Navigate to destination using sensor fusion
     */
    navigate() {
        // Get readings from multiple sensors
        const sensors = {
            sun: {
                direction: this.getCompassReading(),
                reliability: 0.9
            },
            magnetic: {
                direction: this.getMagnetometerReading(),
                reliability: 0.7
            },
            landmark: {
                direction: this.getCameraLandmarkReading(),
                reliability: 0.6
            }
        };
        
        // Navigate using fused sensor data
        const nav = this.pigeon.vectorNavigate(
            this.position,
            this.pigeon.homeVector,
            sensors
        );
        
        // Send motor commands
        this.moveToward(nav.nextPosition);
        
        return {
            position: nav.nextPosition,
            distanceRemaining: nav.distance
        };
    }
    
    getCompassReading() {
        // Get compass direction (with noise)
        const direction = this.pigeon.getHomeVector(this.position);
        return this.addNoise(direction, 0.1);
    }
    
    getMagnetometerReading() {
        const direction = this.pigeon.getHomeVector(this.position);
        return this.addNoise(direction, 0.15);
    }
    
    getCameraLandmarkReading() {
        const direction = this.pigeon.getHomeVector(this.position);
        return this.addNoise(direction, 0.2);
    }
    
    addNoise(vector, amount) {
        return {
            x: vector.x + (Math.random() - 0.5) * amount,
            y: vector.y + (Math.random() - 0.5) * amount,
            z: (vector.z || 0) + (Math.random() - 0.5) * amount
        };
    }
    
    moveToward(position) {
        // Send motor commands to move robot
        console.log('Moving to:', position);
    }
}

// ============================================================================
// EXAMPLE 6: Game AI with Swarm Behavior
// ============================================================================

/**
 * NPCs using swarm intelligence for coordinated behavior
 */
class NPCSwarmController {
    constructor() {
        this.pigeon = new HomingPigeonFramework({
            swarmSize: 10,
            communicationRadius: 15
        });
        this.npcs = [];
    }
    
    addNPC(npc) {
        this.npcs.push({
            entity: npc,
            position: npc.transform.position,
            velocity: { x: 0, y: 0, z: 0 }
        });
    }
    
    /**
     * Update all NPCs each frame
     */
    update(playerPosition) {
        // Convert NPCs to swarm format
        const swarm = this.npcs.map(npc => ({
            position: npc.position,
            velocity: npc.velocity
        }));
        
        // Coordinate swarm movement toward player
        const coordinated = this.pigeon.swarmCoordinate(swarm, playerPosition);
        
        // Apply coordinated movement to each NPC
        coordinated.forEach((updated, i) => {
            this.npcs[i].position = updated.position;
            this.npcs[i].velocity = updated.velocity;
            this.npcs[i].entity.moveTo(updated.position);
        });
    }
}

// ============================================================================
// EXAMPLE 7: Machine Learning Hyperparameter Optimization
// ============================================================================

/**
 * Optimize ML model hyperparameters using PSO
 */
class MLHyperparameterOptimizer {
    constructor(model, validationData) {
        this.model = model;
        this.validationData = validationData;
        this.pigeon = new HomingPigeonFramework();
    }
    
    optimize() {
        // Define search space for hyperparameters
        const bounds = {
            x: { min: 0.0001, max: 0.1 },    // Learning rate
            y: { min: 16, max: 256 },         // Batch size
            z: { min: 0.1, max: 0.9 }         // Dropout rate
        };
        
        // Objective: minimize validation error
        const objectiveFunction = (params) => {
            const learningRate = params.x;
            const batchSize = Math.round(params.y);
            const dropoutRate = params.z;
            
            // Train model with these hyperparameters
            const metrics = this.trainAndEvaluate({
                learningRate,
                batchSize,
                dropoutRate
            });
            
            // Return validation error (lower is better)
            return metrics.validationError;
        };
        
        // Use PSO to search hyperparameter space
        const result = this.pigeon.particleSwarmOptimization(
            objectiveFunction,
            bounds,
            {
                swarmSize: 20,
                maxIterations: 50
            }
        );
        
        return {
            learningRate: result.optimal.x,
            batchSize: Math.round(result.optimal.y),
            dropoutRate: result.optimal.z,
            validationError: result.value
        };
    }
    
    trainAndEvaluate(hyperparams) {
        // Simulate training and return metrics
        return {
            validationError: Math.random() * 0.5,
            trainError: Math.random() * 0.3
        };
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EnhancedAgentCoordinator,
        Enhanced3DNavigator,
        PuzzleSolverAgent,
        AIStrategyOptimizer,
        RobotNavigator,
        NPCSwarmController,
        MLHyperparameterOptimizer
    };
}

if (typeof window !== 'undefined') {
    window.PigeonMechanicsExamples = {
        EnhancedAgentCoordinator,
        Enhanced3DNavigator,
        PuzzleSolverAgent,
        AIStrategyOptimizer,
        RobotNavigator,
        NPCSwarmController,
        MLHyperparameterOptimizer
    };
}
