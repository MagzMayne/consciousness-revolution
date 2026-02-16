# 🕊️ Homing Pigeon Mechanics Framework

## Overview

This framework translates biological homing pigeon navigation mechanics into functional programming patterns for AI, robotics, distributed systems, and search algorithms.

**Created by:** Ryan Barbrick (Barbrick Design)  
**AI Assistant:** Merlin AI  
**Contact:** BarbrickDesign@gmail.com

---

## 📋 Table of Contents

1. [Core Concepts](#core-concepts)
2. [Quick Start](#quick-start)
3. [API Reference](#api-reference)
4. [Usage Examples](#usage-examples)
5. [Integration Guide](#integration-guide)
6. [Advanced Topics](#advanced-topics)

---

## Core Concepts

### The Five Pillars

| Biological Mechanism | Programming Pattern | Use Case |
|---------------------|---------------------|----------|
| **Vector Navigation** | Vector-Based Pathfinding | Robots/drones navigating with multiple noisy sensors |
| **Gradient Following** | Optimization Algorithms | Finding optimal solutions in large search spaces |
| **Distributed Decision-Making** | Swarm Intelligence | Multi-agent coordination without central control |
| **Dead Reckoning** | State Estimation | Tracking position through imperfect measurements |
| **Home Vector Encoding** | Persistent Goal State | Maintaining consistent objective across actions |

### Why Pigeon Mechanics?

Homing pigeons demonstrate remarkable navigation abilities:
- Navigate 1000+ miles back home
- Self-correct through imperfect/noisy data
- Work in flocks without central leadership
- Maintain persistent goal state
- Adapt to environmental changes

These same patterns solve common programming challenges in:
- **AI Systems** - Goal-oriented agents
- **Robotics** - Sensor fusion and navigation
- **Distributed Systems** - Coordination without central control
- **Optimization** - Finding solutions in complex spaces
- **Game AI** - Intelligent NPC behavior

---

## Quick Start

### Installation

```html
<!-- Browser -->
<script src="src/ai/homing-pigeon-framework.js"></script>
<script src="src/agents/pigeon-navigation-agent.js"></script>
```

```javascript
// Node.js
const HomingPigeonFramework = require('./src/ai/homing-pigeon-framework.js');
const PigeonNavigationAgent = require('./src/agents/pigeon-navigation-agent.js');
```

### Basic Usage

```javascript
// Create framework instance
const pigeon = new HomingPigeonFramework({
    navigationPrecision: 0.01,
    learningRate: 0.1,
    swarmSize: 10
});

// Set home position (goal)
pigeon.setHomeVector({ x: 100, y: 100, z: 0 });

// Navigate using multiple sensors
const current = { x: 0, y: 0, z: 0 };
const target = { x: 100, y: 100, z: 0 };

const sensors = {
    sun: { 
        direction: { x: 0.7, y: 0.7, z: 0 }, 
        reliability: 0.9 
    },
    magnetic: { 
        direction: { x: 0.71, y: 0.71, z: 0 }, 
        reliability: 0.7 
    }
};

const result = pigeon.vectorNavigate(current, target, sensors);
console.log('Next position:', result.nextPosition);
```

---

## API Reference

### HomingPigeonFramework

Main class providing all five pigeon mechanics algorithms.

#### Constructor

```javascript
new HomingPigeonFramework(config)
```

**Configuration Options:**
```javascript
{
    navigationPrecision: 0.01,          // Navigation accuracy threshold
    maxIterations: 1000,                // Max iterations for algorithms
    learningRate: 0.1,                  // Gradient descent learning rate
    gradientThreshold: 0.001,           // Convergence threshold
    swarmSize: 10,                      // Default swarm size
    communicationRadius: 5,             // Agent communication range
    kalmanProcessNoise: 0.1,            // Kalman filter process noise
    kalmanMeasurementNoise: 0.1,        // Kalman filter measurement noise
    persistentGoalTracking: true        // Enable home vector tracking
}
```

---

### 1. Vector Navigation

Navigate using multiple weighted sensor inputs (sensor fusion).

#### `vectorNavigate(current, target, sensors)`

**Parameters:**
- `current` - Current position `{x, y, z}`
- `target` - Target position `{x, y, z}`
- `sensors` - Sensor readings object:
  ```javascript
  {
      sun: { direction: {x, y, z}, reliability: 0.0-1.0 },
      magnetic: { direction: {x, y, z}, reliability: 0.0-1.0 },
      landmark: { direction: {x, y, z}, reliability: 0.0-1.0 },
      olfactory: { direction: {x, y, z}, reliability: 0.0-1.0 }
  }
  ```

**Returns:**
```javascript
{
    nextPosition: {x, y, z},     // Next step position
    direction: {x, y, z},         // Weighted direction vector
    homeVector: {x, y, z},        // Vector toward target
    distance: Number              // Remaining distance to target
}
```

**Example:**
```javascript
const result = pigeon.vectorNavigate(
    { x: 0, y: 0, z: 0 },
    { x: 10, y: 10, z: 0 },
    {
        sun: { direction: { x: 0.7, y: 0.7, z: 0 }, reliability: 0.9 },
        magnetic: { direction: { x: 0.71, y: 0.71, z: 0 }, reliability: 0.7 }
    }
);
```

---

### 2. Gradient Following

Optimization algorithms for finding optimal solutions.

#### `gradientFollow(objectiveFunction, initialPosition, options)`

Gradient descent optimization.

**Parameters:**
- `objectiveFunction` - Function to minimize `(position) => value`
- `initialPosition` - Starting point `{x, y, z}`
- `options` - Optional settings:
  ```javascript
  {
      maxIterations: 1000,
      learningRate: 0.1,
      threshold: 0.001
  }
  ```

**Returns:**
```javascript
{
    optimal: {x, y, z},           // Optimal position found
    path: [{x, y, z}, ...],       // Path taken
    iterations: Number,            // Iterations used
    finalValue: Number,            // Final objective value
    converged: Boolean             // Whether converged
}
```

**Example:**
```javascript
// Minimize a function (find lowest point)
const objective = (pos) => (pos.x - 5)**2 + (pos.y - 5)**2;

const result = pigeon.gradientFollow(
    objective,
    { x: 0, y: 0 },
    { learningRate: 0.1, maxIterations: 500 }
);

console.log('Optimal point:', result.optimal);  // Near {x: 5, y: 5}
```

#### `simulatedAnnealing(objectiveFunction, initialPosition, options)`

Simulated annealing for escaping local minima.

**Parameters:**
- `objectiveFunction` - Function to minimize
- `initialPosition` - Starting point
- `options`:
  ```javascript
  {
      maxIterations: 1000,
      initialTemp: 100,
      coolingRate: 0.95
  }
  ```

**Returns:**
```javascript
{
    optimal: {x, y, z},
    path: [{x, y, z}, ...],
    finalValue: Number
}
```

---

### 3. Swarm Intelligence

Multi-agent coordination algorithms.

#### `swarmCoordinate(agents, target)`

Coordinate multiple agents using flocking behavior.

**Parameters:**
- `agents` - Array of agent objects:
  ```javascript
  [
      {
          position: {x, y, z},
          velocity: {x, y, z}
      },
      ...
  ]
  ```
- `target` - Target position `{x, y, z}`

**Returns:**
Array of updated agent states with new positions and velocities.

**Example:**
```javascript
const agents = [
    { position: { x: 0, y: 0, z: 0 }, velocity: { x: 1, y: 0, z: 0 } },
    { position: { x: 1, y: 1, z: 0 }, velocity: { x: 0, y: 1, z: 0 } },
    { position: { x: 2, y: 0, z: 0 }, velocity: { x: -1, y: 0, z: 0 } }
];

const target = { x: 10, y: 10, z: 0 };
const updated = pigeon.swarmCoordinate(agents, target);

// Agents now move together toward target
```

#### `particleSwarmOptimization(objectiveFunction, bounds, options)`

Particle swarm optimization for distributed search.

**Parameters:**
- `objectiveFunction` - Function to minimize
- `bounds` - Search space bounds:
  ```javascript
  {
      x: { min: 0, max: 100 },
      y: { min: 0, max: 100 },
      z: { min: 0, max: 100 }  // Optional
  }
  ```
- `options`:
  ```javascript
  {
      swarmSize: 20,
      maxIterations: 200,
      inertia: 0.7,
      cognitive: 1.5,
      social: 1.5
  }
  ```

**Returns:**
```javascript
{
    optimal: {x, y, z},
    value: Number,
    particles: [...]
}
```

---

### 4. Dead Reckoning

State estimation and tracking.

#### `deadReckon(initialState, movements)`

Track position through movement history.

**Parameters:**
- `initialState` - Starting state:
  ```javascript
  {
      position: {x, y, z},
      velocity: {x, y, z}
  }
  ```
- `movements` - Array of movements:
  ```javascript
  [
      {
          acceleration: {x, y, z},
          deltaTime: Number
      },
      ...
  ]
  ```

**Returns:**
```javascript
{
    state: {
        position: {x, y, z},
        velocity: {x, y, z},
        distance: Number,
        direction: {x, y, z}
    },
    path: [{x, y, z}, ...],
    totalDistance: Number
}
```

#### `kalmanFilter(measurements, initialState)`

Filter noisy measurements for accurate state estimation.

**Parameters:**
- `measurements` - Array of noisy position measurements `[{x, y, z}, ...]`
- `initialState` - Optional initial state (defaults to origin)

**Returns:**
```javascript
{
    estimatedState: {
        position: {x, y, z},
        velocity: {x, y, z}
    },
    path: [{x, y, z}, ...],
    errorCovariance: Number
}
```

**Example:**
```javascript
// Noisy GPS measurements
const measurements = [
    { x: 1.1, y: 0.9, z: 0 },
    { x: 2.2, y: 1.8, z: 0 },
    { x: 3.3, y: 3.1, z: 0 }
];

const filtered = pigeon.kalmanFilter(measurements);
// Returns smoothed, more accurate positions
```

---

### 5. Home Vector Encoding

Persistent goal tracking.

#### `setHomeVector(homePosition)`

Set the persistent goal/target position.

**Parameters:**
- `homePosition` - Target position `{x, y, z}`

**Returns:** The home vector that was set.

#### `getHomeVector(currentPosition)`

Get direction vector from current position to home.

**Parameters:**
- `currentPosition` - Current position `{x, y, z}`

**Returns:** Normalized direction vector to home.

#### `evaluateProgress(currentPosition, previousPosition)`

Evaluate progress toward goal.

**Parameters:**
- `currentPosition` - Current position
- `previousPosition` - Previous position (optional)

**Returns:**
```javascript
{
    currentDistance: Number,
    previousDistance: Number,      // If previous provided
    improvement: Number,            // Distance improvement
    improvementPercent: Number,     // % improvement
    movingTowardGoal: Boolean       // True if getting closer
}
```

#### `isHome(currentPosition, tolerance)`

Check if position is within tolerance of home.

**Parameters:**
- `currentPosition` - Current position
- `tolerance` - Distance tolerance (default: 0.1)

**Returns:** `true` if within tolerance of home.

---

### PigeonNavigationAgent

Autonomous agent using pigeon mechanics.

#### Constructor

```javascript
new PigeonNavigationAgent(config)
```

**Configuration:**
```javascript
{
    agentId: 'pigeon-agent-1',
    homePosition: {x: 100, y: 100, z: 0},
    initialPosition: {x: 0, y: 0, z: 0},
    sensorNoise: 0.1,
    adaptiveLearning: true,
    swarmEnabled: true,
    swarmId: 'swarm-1',
    logLevel: 'info',
    maxHistorySize: 1000
}
```

#### Methods

##### `start()` / `stop()`
Start/stop the agent's autonomous navigation loop.

##### `addTask(task)`
Add a task to the agent's queue.

**Task Types:**
```javascript
// Navigate to position
{ type: 'navigate', target: {x, y, z} }

// Search area
{ type: 'search', bounds: {...}, objective: (pos) => value }

// Optimize function
{ type: 'optimize', objective: (pos) => value, bounds: {...} }

// Coordinate with swarm
{ type: 'coordinate', swarm: [...agents], target: {x, y, z} }
```

##### `getState()`
Get current agent state.

**Returns:**
```javascript
{
    agentId: String,
    isActive: Boolean,
    currentPosition: {x, y, z},
    velocity: {x, y, z},
    homeVector: {x, y, z},
    distanceToHome: Number,
    taskQueue: Number,
    currentTask: String,
    historySize: Number
}
```

##### `getProgress()`
Get progress toward goal.

##### `exportHistory(format)`
Export movement history ('json' or 'csv').

---

## Usage Examples

### Example 1: Robot Navigation with Sensor Fusion

```javascript
const pigeon = new HomingPigeonFramework();

// Robot needs to get home using GPS, compass, and landmarks
pigeon.setHomeVector({ x: 50, y: 50, z: 0 });

let robotPosition = { x: 0, y: 0, z: 0 };

function simulateRobotStep() {
    // Simulate sensor readings (with noise)
    const sensors = {
        sun: {
            direction: addNoise(getDirectionTo(robotPosition, { x: 50, y: 50 }), 0.1),
            reliability: 0.9
        },
        magnetic: {
            direction: addNoise(getDirectionTo(robotPosition, { x: 50, y: 50 }), 0.15),
            reliability: 0.7
        },
        landmark: {
            direction: addNoise(getDirectionTo(robotPosition, { x: 50, y: 50 }), 0.2),
            reliability: 0.6
        }
    };
    
    const result = pigeon.vectorNavigate(
        robotPosition,
        pigeon.homeVector,
        sensors
    );
    
    robotPosition = result.nextPosition;
    
    console.log(`Robot at ${JSON.stringify(robotPosition)}, ` +
                `distance to home: ${result.distance.toFixed(2)}`);
    
    if (pigeon.isHome(robotPosition, 1.0)) {
        console.log('Robot reached home!');
        return true;
    }
    
    return false;
}

// Run simulation
let steps = 0;
while (!simulateRobotStep() && steps < 100) {
    steps++;
}
```

### Example 2: Puzzle Hunt Agent with Home Vector

```javascript
// Agent solving a puzzle hunt always maintains the "solution" as home vector
const agent = new PigeonNavigationAgent({
    agentId: 'puzzle-solver-1',
    homePosition: { x: 100, y: 100, z: 0 }  // The solution
});

// Agent explores clues but always evaluates relative to solution
agent.start();

// Add search tasks
agent.addTask({
    type: 'search',
    bounds: {
        x: { min: 0, max: 50 },
        y: { min: 0, max: 50 }
    },
    objective: (pos) => {
        // Function that returns "closeness" to solution
        // Lower is better (this is finding optimal clue)
        return calculateClueRelevance(pos);
    }
});

// Check progress
setInterval(() => {
    const progress = agent.getProgress();
    if (progress && progress.movingTowardGoal) {
        console.log('Agent moving closer to solution!');
    }
}, 1000);
```

### Example 3: Swarm of Autonomous Drones

```javascript
const pigeon = new HomingPigeonFramework({
    swarmSize: 5,
    communicationRadius: 10
});

// Create drone swarm
const drones = [];
for (let i = 0; i < 5; i++) {
    drones.push({
        position: {
            x: Math.random() * 20 - 10,
            y: Math.random() * 20 - 10,
            z: Math.random() * 5
        },
        velocity: { x: 0, y: 0, z: 0 }
    });
}

// Target position for swarm
const target = { x: 50, y: 50, z: 10 };

// Simulate swarm movement
function updateSwarm() {
    const updated = pigeon.swarmCoordinate(drones, target);
    
    // Update drone positions
    for (let i = 0; i < drones.length; i++) {
        drones[i] = updated[i];
    }
    
    // Check if swarm reached target
    const avgPosition = {
        x: drones.reduce((sum, d) => sum + d.position.x, 0) / drones.length,
        y: drones.reduce((sum, d) => sum + d.position.y, 0) / drones.length,
        z: drones.reduce((sum, d) => sum + d.position.z, 0) / drones.length
    };
    
    const distance = pigeon.calculateDistance(avgPosition, target);
    console.log(`Swarm distance to target: ${distance.toFixed(2)}`);
    
    return distance < 5;  // Within 5 units of target
}

// Run swarm simulation
const interval = setInterval(() => {
    if (updateSwarm()) {
        console.log('Swarm reached target!');
        clearInterval(interval);
    }
}, 100);
```

### Example 4: Optimization with Gradient Descent

```javascript
const pigeon = new HomingPigeonFramework({
    learningRate: 0.1,
    maxIterations: 1000
});

// Define a complex function to minimize
// (e.g., finding best hyperparameters for ML model)
function costFunction(params) {
    const x = params.x;
    const y = params.y;
    
    // Example: Rosenbrock function (challenging optimization problem)
    const a = 1;
    const b = 100;
    return (a - x)**2 + b * (y - x**2)**2;
}

// Find optimal parameters
const result = pigeon.gradientFollow(
    costFunction,
    { x: -1, y: 1 },  // Starting guess
    { maxIterations: 1000, learningRate: 0.001 }
);

console.log('Optimal parameters:', result.optimal);
console.log('Minimum value:', result.finalValue);
console.log('Converged:', result.converged);
console.log('Path length:', result.path.length);
```

### Example 5: Particle Swarm for Global Optimization

```javascript
const pigeon = new HomingPigeonFramework();

// Find global minimum of a function with many local minima
function complexFunction(pos) {
    // Rastrigin function - has many local minima
    const A = 10;
    const n = 2;
    return A * n + 
           (pos.x**2 - A * Math.cos(2 * Math.PI * pos.x)) +
           (pos.y**2 - A * Math.cos(2 * Math.PI * pos.y));
}

const result = pigeon.particleSwarmOptimization(
    complexFunction,
    {
        x: { min: -5.12, max: 5.12 },
        y: { min: -5.12, max: 5.12 }
    },
    {
        swarmSize: 30,
        maxIterations: 200
    }
);

console.log('Global minimum found at:', result.optimal);
console.log('Function value:', result.value);
// Should find near {x: 0, y: 0} with value near 0
```

### Example 6: State Estimation with Kalman Filter

```javascript
const pigeon = new HomingPigeonFramework({
    kalmanProcessNoise: 0.1,
    kalmanMeasurementNoise: 0.1
});

// Simulate noisy GPS measurements of a moving object
const truePath = [];
const noisyMeasurements = [];

for (let t = 0; t < 50; t++) {
    const truePos = {
        x: t * 0.5,
        y: Math.sin(t * 0.2) * 10,
        z: 0
    };
    truePath.push(truePos);
    
    // Add measurement noise
    noisyMeasurements.push({
        x: truePos.x + (Math.random() - 0.5) * 2,
        y: truePos.y + (Math.random() - 0.5) * 2,
        z: 0
    });
}

// Filter the noisy measurements
const filtered = pigeon.kalmanFilter(noisyMeasurements);

// Compare filtered vs noisy
console.log('Noisy position:', noisyMeasurements[49]);
console.log('Filtered position:', filtered.path[49]);
console.log('True position:', truePath[49]);
// Filtered should be much closer to true position
```

---

## Integration Guide

### Integrating with Existing Agent Systems

```javascript
// In existing agent code
class MyExistingAgent {
    constructor() {
        // Add pigeon mechanics
        this.pigeonFramework = new HomingPigeonFramework();
        
        // Set goal
        this.pigeonFramework.setHomeVector(this.targetPosition);
    }
    
    navigate() {
        // Use pigeon navigation instead of manual pathfinding
        const result = this.pigeonFramework.vectorNavigate(
            this.currentPosition,
            this.targetPosition,
            this.getSensors()
        );
        
        this.currentPosition = result.nextPosition;
    }
    
    optimizeStrategy() {
        // Use gradient descent for strategy optimization
        const result = this.pigeonFramework.gradientFollow(
            this.evaluateStrategy.bind(this),
            this.currentStrategy
        );
        
        this.currentStrategy = result.optimal;
    }
}
```

### Integrating with Robotics Systems

```javascript
// ROS-style robot controller
class RobotController {
    constructor() {
        this.pigeon = new HomingPigeonFramework();
        this.pigeon.setHomeVector(this.homePosition);
    }
    
    onSensorUpdate(sensors) {
        // Convert sensor data to pigeon format
        const pigeonSensors = {
            sun: {
                direction: this.compassToVector(sensors.compass),
                reliability: sensors.compassQuality
            },
            magnetic: {
                direction: this.magnetometerToVector(sensors.magnetometer),
                reliability: sensors.magnetometerQuality
            },
            landmark: {
                direction: this.cameraToVector(sensors.camera),
                reliability: sensors.cameraConfidence
            }
        };
        
        // Get navigation command
        const nav = this.pigeon.vectorNavigate(
            this.odometry.position,
            this.pigeon.homeVector,
            pigeonSensors
        );
        
        // Send to motor controller
        this.setTargetPosition(nav.nextPosition);
    }
}
```

### Integrating with Game AI

```javascript
// NPC using pigeon mechanics
class NPCActor {
    constructor(homeLocation) {
        this.agent = new PigeonNavigationAgent({
            homePosition: homeLocation,
            initialPosition: this.transform.position
        });
        
        this.agent.start();
    }
    
    update(deltaTime) {
        // NPC automatically navigates home
        const state = this.agent.getState();
        this.transform.position = state.currentPosition;
        
        // Check if reached destination
        if (this.agent.framework.isHome(this.transform.position, 1.0)) {
            this.onReachedHome();
        }
    }
    
    onPlayerDetected(playerPos) {
        // Dynamically change goal
        this.agent.framework.setHomeVector(playerPos);
    }
}
```

---

## Advanced Topics

### Custom Objective Functions

When using optimization algorithms, design objective functions that:

1. **Return lower values for better solutions**
2. **Are continuous and differentiable** (for gradient descent)
3. **Scale appropriately** (avoid extreme values)

```javascript
// Good objective function
function goodObjective(params) {
    const error = calculateError(params);
    const complexity = calculateComplexity(params);
    const regularization = 0.01;
    
    return error + regularization * complexity;
}

// Bad objective function (discrete, not smooth)
function badObjective(params) {
    if (params.x > 0 && params.y > 0) return 0;
    else return 1000000;
}
```

### Tuning Parameters

**Navigation Precision:** Lower = more accurate but slower
```javascript
{ navigationPrecision: 0.001 }  // Very precise
{ navigationPrecision: 0.1 }    // Fast but less precise
```

**Learning Rate:** Controls gradient descent step size
```javascript
{ learningRate: 0.001 }  // Slow, safe convergence
{ learningRate: 0.5 }    // Fast but may overshoot
```

**Swarm Size:** More particles = better search but slower
```javascript
{ swarmSize: 10 }   // Fast, may miss optimal
{ swarmSize: 100 }  // Thorough, slower
```

### Performance Optimization

**For real-time applications:**
```javascript
const pigeon = new HomingPigeonFramework({
    maxIterations: 100,        // Limit iterations
    navigationPrecision: 0.1,  // Lower precision
    swarmSize: 5               // Smaller swarm
});
```

**For offline optimization:**
```javascript
const pigeon = new HomingPigeonFramework({
    maxIterations: 10000,      // More iterations
    navigationPrecision: 0.001, // High precision
    swarmSize: 50              // Larger swarm
});
```

### Combining Algorithms

Use multiple pigeon mechanics together:

```javascript
// 1. Use PSO to find rough solution
const roughResult = pigeon.particleSwarmOptimization(objective, bounds);

// 2. Refine with gradient descent
const refinedResult = pigeon.gradientFollow(
    objective,
    roughResult.optimal,
    { learningRate: 0.01, maxIterations: 500 }
);

// 3. Use swarm coordination for execution
const agents = createAgentsAt(refinedResult.optimal);
const coordinated = pigeon.swarmCoordinate(agents, finalTarget);
```

---

## Troubleshooting

### Navigation Not Converging

**Problem:** Agent circles around target
**Solution:** 
- Reduce sensor noise
- Increase navigation precision
- Check sensor reliability weights

### Optimization Stuck in Local Minimum

**Problem:** Gradient descent finds poor solution
**Solution:**
- Use simulated annealing instead
- Use particle swarm optimization
- Try multiple starting positions

### Swarm Not Coordinating

**Problem:** Agents don't stay together
**Solution:**
- Increase communication radius
- Adjust separation/alignment/cohesion weights
- Reduce maximum velocity

---

## Performance Benchmarks

Typical performance on modern hardware:

| Algorithm | Operations/Second | Agents/Particles |
|-----------|-------------------|------------------|
| Vector Navigation | 100,000+ | N/A |
| Gradient Descent | 10,000+ | N/A |
| Swarm Coordination | 1,000+ | 100 |
| Particle Swarm | 500+ | 50 |
| Kalman Filter | 50,000+ | N/A |

---

## Contributing

To extend the framework:

1. Follow existing code patterns
2. Add comprehensive documentation
3. Include usage examples
4. Test with multiple scenarios
5. Maintain backward compatibility

---

## License

© 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.

For licensing inquiries: BarbrickDesign@gmail.com

---

## References

- Reynolds, C. W. (1987). "Flocks, herds and schools: A distributed behavioral model"
- Kennedy, J., & Eberhart, R. (1995). "Particle swarm optimization"
- Kalman, R. E. (1960). "A New Approach to Linear Filtering and Prediction Problems"
- Siegwart, R., et al. (2011). "Introduction to Autonomous Mobile Robots"

---

**Created with 🕊️ by Ryan Barbrick | Powered by biological inspiration**
