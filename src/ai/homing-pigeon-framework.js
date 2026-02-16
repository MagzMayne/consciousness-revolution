/**
 * ════════════════════════════════════════════════════════════════════════════════
 * © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * HOMING PIGEON MECHANICS FRAMEWORK
 * 
 * Biological navigation mechanics translated into programming patterns:
 * 1. Vector Navigation → Vector-Based Pathfinding
 * 2. Gradient Following → Optimization Algorithms  
 * 3. Distributed Decision-Making → Swarm Intelligence
 * 4. Dead Reckoning → State Estimation
 * 5. Home Vector Encoding → Persistent Goal State
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

class HomingPigeonFramework {
    constructor(config = {}) {
        this.config = {
            // Vector navigation settings
            navigationPrecision: config.navigationPrecision || 0.01,
            maxIterations: config.maxIterations || 1000,
            
            // Gradient following settings
            learningRate: config.learningRate || 0.1,
            gradientThreshold: config.gradientThreshold || 0.001,
            
            // Swarm intelligence settings
            swarmSize: config.swarmSize || 10,
            communicationRadius: config.communicationRadius || 5,
            
            // State estimation settings
            kalmanProcessNoise: config.kalmanProcessNoise || 0.1,
            kalmanMeasurementNoise: config.kalmanMeasurementNoise || 0.1,
            
            // Home vector settings
            persistentGoalTracking: config.persistentGoalTracking !== false,
            
            ...config
        };
        
        this.homeVector = null;
        this.currentState = null;
        this.history = [];
    }

    // ============================================================================
    // 1. VECTOR NAVIGATION - Vector-Based Pathfinding
    // ============================================================================
    
    /**
     * Navigate from current position to target using multiple weighted signals
     * (Like a pigeon using sun compass, magnetic fields, landmarks, olfactory cues)
     * 
     * @param {Object} current - Current position {x, y, z}
     * @param {Object} target - Target position {x, y, z}
     * @param {Object} sensors - Multiple sensor inputs {sun, magnetic, landmark, olfactory}
     * @returns {Object} Next position and path
     */
    vectorNavigate(current, target, sensors = {}) {
        // Calculate home vector (direction to target)
        const homeVector = this.calculateVector(current, target);
        
        // Weight different sensor inputs (sensor fusion)
        const weights = {
            sun: sensors.sun?.reliability || 0.3,
            magnetic: sensors.magnetic?.reliability || 0.25,
            landmark: sensors.landmark?.reliability || 0.25,
            olfactory: sensors.olfactory?.reliability || 0.2
        };
        
        // Combine signals using weighted heuristics
        let weightedDirection = { x: 0, y: 0, z: 0 };
        
        if (sensors.sun) {
            const sunWeight = weights.sun;
            weightedDirection.x += sensors.sun.direction.x * sunWeight;
            weightedDirection.y += sensors.sun.direction.y * sunWeight;
            weightedDirection.z += (sensors.sun.direction.z || 0) * sunWeight;
        }
        
        if (sensors.magnetic) {
            const magWeight = weights.magnetic;
            weightedDirection.x += sensors.magnetic.direction.x * magWeight;
            weightedDirection.y += sensors.magnetic.direction.y * magWeight;
            weightedDirection.z += (sensors.magnetic.direction.z || 0) * magWeight;
        }
        
        if (sensors.landmark) {
            const landWeight = weights.landmark;
            weightedDirection.x += sensors.landmark.direction.x * landWeight;
            weightedDirection.y += sensors.landmark.direction.y * landWeight;
            weightedDirection.z += (sensors.landmark.direction.z || 0) * landWeight;
        }
        
        if (sensors.olfactory) {
            const olfWeight = weights.olfactory;
            weightedDirection.x += sensors.olfactory.direction.x * olfWeight;
            weightedDirection.y += sensors.olfactory.direction.y * olfWeight;
            weightedDirection.z += (sensors.olfactory.direction.z || 0) * olfWeight;
        }
        
        // Normalize the weighted direction
        const magnitude = Math.sqrt(
            weightedDirection.x ** 2 + 
            weightedDirection.y ** 2 + 
            weightedDirection.z ** 2
        );
        
        if (magnitude > 0) {
            weightedDirection.x /= magnitude;
            weightedDirection.y /= magnitude;
            weightedDirection.z /= magnitude;
        }
        
        // Calculate next position
        const stepSize = 1.0;
        const nextPosition = {
            x: current.x + weightedDirection.x * stepSize,
            y: current.y + weightedDirection.y * stepSize,
            z: current.z + weightedDirection.z * stepSize
        };
        
        return {
            nextPosition,
            direction: weightedDirection,
            homeVector,
            distance: this.calculateDistance(nextPosition, target)
        };
    }

    // ============================================================================
    // 2. GRADIENT FOLLOWING - Optimization Algorithms
    // ============================================================================
    
    /**
     * Follow environmental gradients to find optimal solution
     * (Like a pigeon following smell or magnetic intensity gradients)
     * 
     * @param {Function} objectiveFunction - Function to optimize
     * @param {Object} initialPosition - Starting point
     * @param {Object} options - Optimization options
     * @returns {Object} Optimal solution and path
     */
    gradientFollow(objectiveFunction, initialPosition, options = {}) {
        const maxIterations = options.maxIterations || this.config.maxIterations;
        const learningRate = options.learningRate || this.config.learningRate;
        const threshold = options.threshold || this.config.gradientThreshold;
        
        let current = { ...initialPosition };
        const path = [{ ...current }];
        let iteration = 0;
        
        while (iteration < maxIterations) {
            // Calculate gradient using finite differences
            const gradient = this.calculateGradient(objectiveFunction, current);
            
            // Check if we've converged
            const gradientMagnitude = this.vectorMagnitude(gradient);
            if (gradientMagnitude < threshold) {
                break;
            }
            
            // Update position using gradient descent
            current.x -= learningRate * gradient.x;
            current.y -= learningRate * gradient.y;
            if (current.z !== undefined) {
                current.z -= learningRate * gradient.z;
            }
            
            path.push({ ...current });
            iteration++;
        }
        
        return {
            optimal: current,
            path,
            iterations: iteration,
            finalValue: objectiveFunction(current),
            converged: iteration < maxIterations
        };
    }
    
    /**
     * Simulated annealing - like a pigeon making broader searches when lost
     */
    simulatedAnnealing(objectiveFunction, initialPosition, options = {}) {
        const maxIterations = options.maxIterations || this.config.maxIterations;
        const initialTemp = options.initialTemp || 100;
        const coolingRate = options.coolingRate || 0.95;
        
        let current = { ...initialPosition };
        let best = { ...current };
        let bestValue = objectiveFunction(best);
        let temperature = initialTemp;
        const path = [{ ...current }];
        
        for (let i = 0; i < maxIterations; i++) {
            // Generate neighbor solution (random step)
            const neighbor = {
                x: current.x + (Math.random() - 0.5) * temperature * 0.1,
                y: current.y + (Math.random() - 0.5) * temperature * 0.1,
                z: current.z !== undefined ? 
                    current.z + (Math.random() - 0.5) * temperature * 0.1 : undefined
            };
            
            const currentValue = objectiveFunction(current);
            const neighborValue = objectiveFunction(neighbor);
            
            // Accept if better, or with probability based on temperature
            const delta = neighborValue - currentValue;
            if (delta < 0 || Math.random() < Math.exp(-delta / temperature)) {
                current = neighbor;
                path.push({ ...current });
            }
            
            // Update best solution
            if (neighborValue < bestValue) {
                best = { ...neighbor };
                bestValue = neighborValue;
            }
            
            // Cool down
            temperature *= coolingRate;
        }
        
        return {
            optimal: best,
            path,
            finalValue: bestValue
        };
    }

    // ============================================================================
    // 3. DISTRIBUTED DECISION-MAKING - Swarm Intelligence
    // ============================================================================
    
    /**
     * Coordinate multiple agents using swarm intelligence
     * (Like a flock of pigeons self-organizing without a leader)
     * 
     * @param {Array} agents - Array of agent objects with position and velocity
     * @param {Object} target - Target position for the swarm
     * @returns {Array} Updated agent states
     */
    swarmCoordinate(agents, target) {
        const updatedAgents = [];
        const swarmSize = agents.length;
        
        for (let i = 0; i < swarmSize; i++) {
            const agent = agents[i];
            const velocity = agent.velocity || { x: 0, y: 0, z: 0 };
            
            // Three forces: separation, alignment, cohesion
            const separation = this.calculateSeparation(agent, agents);
            const alignment = this.calculateAlignment(agent, agents);
            const cohesion = this.calculateCohesion(agent, agents);
            const targetAttraction = this.calculateVector(agent.position, target);
            
            // Weight the forces
            const newVelocity = {
                x: velocity.x + 
                   separation.x * 0.3 + 
                   alignment.x * 0.2 + 
                   cohesion.x * 0.2 + 
                   targetAttraction.x * 0.3,
                y: velocity.y + 
                   separation.y * 0.3 + 
                   alignment.y * 0.2 + 
                   cohesion.y * 0.2 + 
                   targetAttraction.y * 0.3,
                z: (velocity.z || 0) + 
                   (separation.z || 0) * 0.3 + 
                   (alignment.z || 0) * 0.2 + 
                   (cohesion.z || 0) * 0.2 + 
                   (targetAttraction.z || 0) * 0.3
            };
            
            // Limit velocity
            const maxSpeed = 2.0;
            const speed = this.vectorMagnitude(newVelocity);
            if (speed > maxSpeed) {
                newVelocity.x = (newVelocity.x / speed) * maxSpeed;
                newVelocity.y = (newVelocity.y / speed) * maxSpeed;
                newVelocity.z = (newVelocity.z / speed) * maxSpeed;
            }
            
            // Update position
            const newPosition = {
                x: agent.position.x + newVelocity.x,
                y: agent.position.y + newVelocity.y,
                z: agent.position.z + newVelocity.z
            };
            
            updatedAgents.push({
                ...agent,
                position: newPosition,
                velocity: newVelocity
            });
        }
        
        return updatedAgents;
    }
    
    /**
     * Particle swarm optimization for distributed search
     */
    particleSwarmOptimization(objectiveFunction, bounds, options = {}) {
        const swarmSize = options.swarmSize || this.config.swarmSize;
        const maxIterations = options.maxIterations || this.config.maxIterations;
        const inertia = options.inertia || 0.7;
        const cognitive = options.cognitive || 1.5;
        const social = options.social || 1.5;
        
        // Initialize particles
        const particles = [];
        let globalBest = null;
        let globalBestValue = Infinity;
        
        for (let i = 0; i < swarmSize; i++) {
            const position = {
                x: bounds.x.min + Math.random() * (bounds.x.max - bounds.x.min),
                y: bounds.y.min + Math.random() * (bounds.y.max - bounds.y.min),
                z: bounds.z ? bounds.z.min + Math.random() * (bounds.z.max - bounds.z.min) : 0
            };
            
            const value = objectiveFunction(position);
            
            particles.push({
                position: { ...position },
                velocity: { x: 0, y: 0, z: 0 },
                bestPosition: { ...position },
                bestValue: value
            });
            
            if (value < globalBestValue) {
                globalBest = { ...position };
                globalBestValue = value;
            }
        }
        
        // Iterate
        for (let iter = 0; iter < maxIterations; iter++) {
            for (let i = 0; i < swarmSize; i++) {
                const particle = particles[i];
                
                // Update velocity
                const r1 = Math.random();
                const r2 = Math.random();
                
                particle.velocity.x = 
                    inertia * particle.velocity.x +
                    cognitive * r1 * (particle.bestPosition.x - particle.position.x) +
                    social * r2 * (globalBest.x - particle.position.x);
                    
                particle.velocity.y = 
                    inertia * particle.velocity.y +
                    cognitive * r1 * (particle.bestPosition.y - particle.position.y) +
                    social * r2 * (globalBest.y - particle.position.y);
                    
                if (bounds.z) {
                    particle.velocity.z = 
                        inertia * particle.velocity.z +
                        cognitive * r1 * (particle.bestPosition.z - particle.position.z) +
                        social * r2 * (globalBest.z - particle.position.z);
                }
                
                // Update position
                particle.position.x += particle.velocity.x;
                particle.position.y += particle.velocity.y;
                if (bounds.z) {
                    particle.position.z += particle.velocity.z;
                }
                
                // Enforce bounds
                particle.position.x = Math.max(bounds.x.min, Math.min(bounds.x.max, particle.position.x));
                particle.position.y = Math.max(bounds.y.min, Math.min(bounds.y.max, particle.position.y));
                if (bounds.z) {
                    particle.position.z = Math.max(bounds.z.min, Math.min(bounds.z.max, particle.position.z));
                }
                
                // Evaluate
                const value = objectiveFunction(particle.position);
                
                // Update personal best
                if (value < particle.bestValue) {
                    particle.bestPosition = { ...particle.position };
                    particle.bestValue = value;
                }
                
                // Update global best
                if (value < globalBestValue) {
                    globalBest = { ...particle.position };
                    globalBestValue = value;
                }
            }
        }
        
        return {
            optimal: globalBest,
            value: globalBestValue,
            particles
        };
    }

    // ============================================================================
    // 4. DEAD RECKONING - State Estimation
    // ============================================================================
    
    /**
     * Track position using distance, direction, and speed
     * (Like a pigeon's internal navigation system)
     * 
     * @param {Object} initialState - Starting state {position, velocity}
     * @param {Array} movements - Array of movement vectors
     * @returns {Object} Estimated final state
     */
    deadReckon(initialState, movements) {
        let state = {
            position: { ...initialState.position },
            velocity: initialState.velocity ? { ...initialState.velocity } : { x: 0, y: 0, z: 0 },
            distance: 0,
            direction: { x: 0, y: 0, z: 0 }
        };
        
        const path = [{ ...state.position }];
        
        for (const movement of movements) {
            // Update velocity
            if (movement.acceleration) {
                state.velocity.x += movement.acceleration.x;
                state.velocity.y += movement.acceleration.y;
                state.velocity.z += (movement.acceleration.z || 0);
            }
            
            // Update position based on velocity and time
            const dt = movement.deltaTime || 1.0;
            state.position.x += state.velocity.x * dt;
            state.position.y += state.velocity.y * dt;
            state.position.z += state.velocity.z * dt;
            
            // Track distance traveled
            const displacement = Math.sqrt(
                (state.velocity.x * dt) ** 2 +
                (state.velocity.y * dt) ** 2 +
                (state.velocity.z * dt) ** 2
            );
            state.distance += displacement;
            
            path.push({ ...state.position });
        }
        
        // Calculate average direction
        if (movements.length > 0) {
            const totalDelta = {
                x: state.position.x - initialState.position.x,
                y: state.position.y - initialState.position.y,
                z: state.position.z - initialState.position.z
            };
            const magnitude = Math.sqrt(totalDelta.x ** 2 + totalDelta.y ** 2 + totalDelta.z ** 2);
            if (magnitude > 0) {
                state.direction = {
                    x: totalDelta.x / magnitude,
                    y: totalDelta.y / magnitude,
                    z: totalDelta.z / magnitude
                };
            }
        }
        
        return {
            state,
            path,
            totalDistance: state.distance
        };
    }
    
    /**
     * Kalman filter for state estimation with noisy measurements
     */
    kalmanFilter(measurements, initialState = null) {
        // Initialize state
        let state = initialState || {
            position: { x: 0, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 }
        };
        
        // Initialize error covariance
        let errorCovariance = 1.0;
        const processNoise = this.config.kalmanProcessNoise;
        const measurementNoise = this.config.kalmanMeasurementNoise;
        
        const estimatedPath = [];
        
        for (const measurement of measurements) {
            // Prediction step
            const predictedState = {
                position: {
                    x: state.position.x + state.velocity.x,
                    y: state.position.y + state.velocity.y,
                    z: state.position.z + state.velocity.z
                },
                velocity: { ...state.velocity }
            };
            
            const predictedErrorCovariance = errorCovariance + processNoise;
            
            // Update step
            const kalmanGain = predictedErrorCovariance / (predictedErrorCovariance + measurementNoise);
            
            state.position.x = predictedState.position.x + 
                kalmanGain * (measurement.x - predictedState.position.x);
            state.position.y = predictedState.position.y + 
                kalmanGain * (measurement.y - predictedState.position.y);
            if (measurement.z !== undefined) {
                state.position.z = predictedState.position.z + 
                    kalmanGain * (measurement.z - predictedState.position.z);
            }
            
            errorCovariance = (1 - kalmanGain) * predictedErrorCovariance;
            
            estimatedPath.push({ ...state.position });
        }
        
        return {
            estimatedState: state,
            path: estimatedPath,
            errorCovariance
        };
    }

    // ============================================================================
    // 5. HOME VECTOR ENCODING - Persistent Goal State
    // ============================================================================
    
    /**
     * Maintain a persistent "home" vector that guides all decisions
     * (Like a pigeon always knowing the direction home)
     * 
     * @param {Object} homePosition - The goal/target position
     */
    setHomeVector(homePosition) {
        this.homeVector = { ...homePosition };
        return this.homeVector;
    }
    
    /**
     * Get the home vector from any position
     */
    getHomeVector(currentPosition) {
        if (!this.homeVector) {
            throw new Error('Home vector not set. Call setHomeVector() first.');
        }
        
        return this.calculateVector(currentPosition, this.homeVector);
    }
    
    /**
     * Evaluate progress toward home vector
     */
    evaluateProgress(currentPosition, previousPosition = null) {
        if (!this.homeVector) {
            throw new Error('Home vector not set. Call setHomeVector() first.');
        }
        
        const currentDistance = this.calculateDistance(currentPosition, this.homeVector);
        
        if (previousPosition) {
            const previousDistance = this.calculateDistance(previousPosition, this.homeVector);
            const improvement = previousDistance - currentDistance;
            const improvementPercent = (improvement / previousDistance) * 100;
            
            return {
                currentDistance,
                previousDistance,
                improvement,
                improvementPercent,
                movingTowardGoal: improvement > 0
            };
        }
        
        return {
            currentDistance,
            distanceToGoal: currentDistance
        };
    }
    
    /**
     * Check if we've reached home (within tolerance)
     */
    isHome(currentPosition, tolerance = 0.1) {
        if (!this.homeVector) {
            return false;
        }
        
        const distance = this.calculateDistance(currentPosition, this.homeVector);
        return distance <= tolerance;
    }

    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================
    
    calculateVector(from, to) {
        const vector = {
            x: to.x - from.x,
            y: to.y - from.y,
            z: (to.z !== undefined && from.z !== undefined) ? to.z - from.z : 0
        };
        
        // Normalize
        const magnitude = this.vectorMagnitude(vector);
        if (magnitude > 0) {
            vector.x /= magnitude;
            vector.y /= magnitude;
            vector.z /= magnitude;
        }
        
        return vector;
    }
    
    calculateDistance(pos1, pos2) {
        return Math.sqrt(
            (pos2.x - pos1.x) ** 2 +
            (pos2.y - pos1.y) ** 2 +
            ((pos2.z || 0) - (pos1.z || 0)) ** 2
        );
    }
    
    vectorMagnitude(vector) {
        return Math.sqrt(
            vector.x ** 2 + 
            vector.y ** 2 + 
            (vector.z || 0) ** 2
        );
    }
    
    calculateGradient(func, point, epsilon = 0.01) {
        const fx = func(point);
        
        const gradient = {
            x: (func({ ...point, x: point.x + epsilon }) - fx) / epsilon,
            y: (func({ ...point, y: point.y + epsilon }) - fx) / epsilon
        };
        
        if (point.z !== undefined) {
            gradient.z = (func({ ...point, z: point.z + epsilon }) - fx) / epsilon;
        }
        
        return gradient;
    }
    
    calculateSeparation(agent, agents) {
        const separationRadius = this.config.communicationRadius;
        let separation = { x: 0, y: 0, z: 0 };
        let count = 0;
        
        for (const other of agents) {
            if (other === agent) continue;
            
            const distance = this.calculateDistance(agent.position, other.position);
            if (distance < separationRadius && distance > 0) {
                const diff = {
                    x: agent.position.x - other.position.x,
                    y: agent.position.y - other.position.y,
                    z: agent.position.z - other.position.z
                };
                
                separation.x += diff.x / distance;
                separation.y += diff.y / distance;
                separation.z += diff.z / distance;
                count++;
            }
        }
        
        if (count > 0) {
            separation.x /= count;
            separation.y /= count;
            separation.z /= count;
        }
        
        return separation;
    }
    
    calculateAlignment(agent, agents) {
        const alignmentRadius = this.config.communicationRadius;
        let avgVelocity = { x: 0, y: 0, z: 0 };
        let count = 0;
        
        for (const other of agents) {
            if (other === agent) continue;
            
            const distance = this.calculateDistance(agent.position, other.position);
            if (distance < alignmentRadius) {
                avgVelocity.x += other.velocity.x;
                avgVelocity.y += other.velocity.y;
                avgVelocity.z += other.velocity.z;
                count++;
            }
        }
        
        if (count > 0) {
            avgVelocity.x /= count;
            avgVelocity.y /= count;
            avgVelocity.z /= count;
            
            // Return difference from current velocity
            return {
                x: avgVelocity.x - agent.velocity.x,
                y: avgVelocity.y - agent.velocity.y,
                z: avgVelocity.z - agent.velocity.z
            };
        }
        
        return { x: 0, y: 0, z: 0 };
    }
    
    calculateCohesion(agent, agents) {
        const cohesionRadius = this.config.communicationRadius;
        let centerOfMass = { x: 0, y: 0, z: 0 };
        let count = 0;
        
        for (const other of agents) {
            if (other === agent) continue;
            
            const distance = this.calculateDistance(agent.position, other.position);
            if (distance < cohesionRadius) {
                centerOfMass.x += other.position.x;
                centerOfMass.y += other.position.y;
                centerOfMass.z += other.position.z;
                count++;
            }
        }
        
        if (count > 0) {
            centerOfMass.x /= count;
            centerOfMass.y /= count;
            centerOfMass.z /= count;
            
            // Return vector toward center of mass
            return this.calculateVector(agent.position, centerOfMass);
        }
        
        return { x: 0, y: 0, z: 0 };
    }
}

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HomingPigeonFramework;
}

if (typeof window !== 'undefined') {
    window.HomingPigeonFramework = HomingPigeonFramework;
}
