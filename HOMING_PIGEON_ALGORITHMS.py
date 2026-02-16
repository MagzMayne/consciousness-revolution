#!/usr/bin/env python3
"""
HOMING PIGEON ALGORITHMS
Biological navigation patterns translated into functional programming concepts.

This module implements 5 core navigation mechanics inspired by homing pigeons:
1. Vector Navigation - Multi-source pathfinding with weighted heuristics
2. Gradient Following - Optimization through environmental signals
3. Distributed Decision-Making - Swarm intelligence without central control
4. Dead Reckoning - State estimation with uncertainty tracking
5. Home Vector Encoding - Persistent goal-oriented navigation

Use cases: AI agents, robotics, search algorithms, pattern recognition, distributed systems
"""

import math
import random
from typing import List, Dict, Any, Tuple, Optional, Callable
from dataclasses import dataclass
from enum import Enum
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ============================================================================
# 1. VECTOR NAVIGATION - Multi-Source Pathfinding
# ============================================================================

@dataclass
class NavigationVector:
    """Represents a directional signal from a navigation source"""
    source: str  # e.g., "sun", "magnetic", "landmark", "olfactory"
    direction: Tuple[float, float, float]  # 3D vector (x, y, z)
    strength: float  # Signal strength 0.0-1.0
    reliability: float  # Historical accuracy 0.0-1.0
    timestamp: float  # When this reading was taken


class VectorNavigator:
    """
    Multi-source vector-based navigation with sensor fusion.
    Combines multiple imperfect signals to determine optimal direction.
    
    Real-world analogs:
    - Pigeons use: sun compass, magnetic fields, landmarks, smell
    - Robots use: GPS, IMU, LIDAR, cameras
    - AI agents use: multiple heuristics, confidence scores, past experience
    """
    
    def __init__(self, weights: Optional[Dict[str, float]] = None):
        """
        Initialize navigator with source weights.
        
        Args:
            weights: Dictionary of source names to weight values (higher = more trusted)
        """
        self.weights = weights or {
            "sun": 1.0,
            "magnetic": 0.9,
            "landmark": 0.8,
            "olfactory": 0.7
        }
        self.history: List[NavigationVector] = []
    
    def add_signal(self, vector: NavigationVector):
        """Add a navigation signal"""
        self.history.append(vector)
        logger.debug(f"Added {vector.source} signal: {vector.direction}")
    
    def fuse_signals(self, vectors: List[NavigationVector]) -> Tuple[float, float, float]:
        """
        Fuse multiple navigation signals into single direction vector.
        Uses weighted average based on signal strength, reliability, and source weight.
        
        This is the core "sensor fusion" algorithm.
        """
        if not vectors:
            return (0.0, 0.0, 0.0)
        
        total_x, total_y, total_z = 0.0, 0.0, 0.0
        total_weight = 0.0
        
        for vec in vectors:
            # Calculate combined weight
            source_weight = self.weights.get(vec.source, 0.5)
            combined_weight = vec.strength * vec.reliability * source_weight
            
            # Add weighted vector components
            total_x += vec.direction[0] * combined_weight
            total_y += vec.direction[1] * combined_weight
            total_z += vec.direction[2] * combined_weight
            total_weight += combined_weight
        
        # Normalize by total weight
        if total_weight > 0:
            return (
                total_x / total_weight,
                total_y / total_weight,
                total_z / total_weight
            )
        
        return (0.0, 0.0, 0.0)
    
    def navigate(self, current_position: Tuple[float, float, float],
                 target_position: Tuple[float, float, float],
                 available_signals: List[NavigationVector]) -> Tuple[float, float, float]:
        """
        Determine next direction to move based on available signals.
        
        Returns:
            Direction vector (x, y, z) to move toward target
        """
        # Fuse all available signals
        signal_direction = self.fuse_signals(available_signals)
        
        # Calculate direct vector to target (ideal direction)
        dx = target_position[0] - current_position[0]
        dy = target_position[1] - current_position[1]
        dz = target_position[2] - current_position[2]
        
        # Normalize ideal direction
        magnitude = math.sqrt(dx*dx + dy*dy + dz*dz)
        if magnitude > 0:
            ideal_direction = (dx/magnitude, dy/magnitude, dz/magnitude)
        else:
            ideal_direction = (0.0, 0.0, 0.0)
        
        # Blend signal direction with ideal direction (trust signals 70%, ideal 30%)
        blend_signal = 0.7
        blend_ideal = 0.3
        
        final_direction = (
            signal_direction[0] * blend_signal + ideal_direction[0] * blend_ideal,
            signal_direction[1] * blend_signal + ideal_direction[1] * blend_ideal,
            signal_direction[2] * blend_signal + ideal_direction[2] * blend_ideal
        )
        
        return final_direction


# ============================================================================
# 2. GRADIENT FOLLOWING - Optimization Algorithms
# ============================================================================

class GradientFollower:
    """
    Follow environmental gradients to find optimal solutions.
    
    Pigeon analog: Following smell/magnetic intensity gradients
    Algorithm analogs: Hill climbing, gradient descent, simulated annealing
    
    Use cases:
    - Finding optimal parameters in large search spaces
    - Pattern recognition optimization
    - Resource allocation
    """
    
    def __init__(self, learning_rate: float = 0.1, momentum: float = 0.9):
        self.learning_rate = learning_rate
        self.momentum = momentum
        self.velocity = None
        self.best_position = None
        self.best_value = float('-inf')
    
    def gradient(self, position: List[float], 
                 objective_fn: Callable[[List[float]], float],
                 epsilon: float = 1e-5) -> List[float]:
        """
        Calculate gradient at current position using finite differences.
        
        Args:
            position: Current position in search space
            objective_fn: Function to optimize (higher is better)
            epsilon: Small step for numerical gradient
            
        Returns:
            Gradient vector
        """
        grad = []
        base_value = objective_fn(position)
        
        for i in range(len(position)):
            # Perturb dimension i
            position_plus = position.copy()
            position_plus[i] += epsilon
            
            # Calculate partial derivative
            value_plus = objective_fn(position_plus)
            partial = (value_plus - base_value) / epsilon
            grad.append(partial)
        
        return grad
    
    def step(self, current_position: List[float],
             objective_fn: Callable[[List[float]], float]) -> List[float]:
        """
        Take one step following the gradient.
        Uses momentum for smoother convergence.
        
        Returns:
            New position after gradient step
        """
        # Calculate gradient
        grad = self.gradient(current_position, objective_fn)
        
        # Initialize velocity on first step
        if self.velocity is None:
            self.velocity = [0.0] * len(grad)
        
        # Update velocity with momentum
        new_position = []
        for i in range(len(current_position)):
            # Update velocity: v = momentum * v + learning_rate * gradient
            self.velocity[i] = self.momentum * self.velocity[i] + self.learning_rate * grad[i]
            
            # Update position
            new_pos = current_position[i] + self.velocity[i]
            new_position.append(new_pos)
        
        # Track best position seen
        current_value = objective_fn(new_position)
        if current_value > self.best_value:
            self.best_value = current_value
            self.best_position = new_position.copy()
        
        return new_position
    
    def optimize(self, initial_position: List[float],
                 objective_fn: Callable[[List[float]], float],
                 max_iterations: int = 1000,
                 tolerance: float = 1e-6) -> Tuple[List[float], float]:
        """
        Optimize objective function starting from initial position.
        
        Returns:
            (optimal_position, optimal_value)
        """
        position = initial_position.copy()
        
        for iteration in range(max_iterations):
            new_position = self.step(position, objective_fn)
            
            # Check convergence
            delta = sum((new_position[i] - position[i])**2 for i in range(len(position)))
            if delta < tolerance:
                logger.info(f"Converged after {iteration} iterations")
                break
            
            position = new_position
        
        return self.best_position or position, self.best_value


# ============================================================================
# 3. DISTRIBUTED DECISION-MAKING - Swarm Intelligence
# ============================================================================

@dataclass
class SwarmAgent:
    """Individual agent in a swarm"""
    id: str
    position: Tuple[float, float, float]
    velocity: Tuple[float, float, float]
    best_position: Tuple[float, float, float]
    best_value: float


class SwarmIntelligence:
    """
    Self-organizing swarm without central controller.
    
    Pigeon analog: Flocks self-organize without leader
    Algorithm analogs: Particle swarm optimization, ant colony optimization
    
    Use cases:
    - Multi-agent coordination
    - Distributed search
    - Autonomous agent frameworks
    """
    
    def __init__(self, n_agents: int, dimensions: int = 3,
                 w: float = 0.7, c1: float = 1.5, c2: float = 1.5):
        """
        Initialize swarm.
        
        Args:
            n_agents: Number of agents in swarm
            dimensions: Dimensionality of search space
            w: Inertia weight (momentum)
            c1: Cognitive coefficient (personal best attraction)
            c2: Social coefficient (global best attraction)
        """
        self.agents: List[SwarmAgent] = []
        self.dimensions = dimensions
        self.w = w
        self.c1 = c1
        self.c2 = c2
        self.global_best_position = None
        self.global_best_value = float('-inf')
        
        # Initialize agents with random positions
        for i in range(n_agents):
            pos = tuple(random.uniform(-10, 10) for _ in range(dimensions))
            vel = tuple(random.uniform(-1, 1) for _ in range(dimensions))
            agent = SwarmAgent(
                id=f"agent-{i}",
                position=pos,
                velocity=vel,
                best_position=pos,
                best_value=float('-inf')
            )
            self.agents.append(agent)
    
    def update_agent(self, agent: SwarmAgent, 
                     objective_fn: Callable[[Tuple[float, ...]], float]):
        """
        Update single agent's position and velocity based on swarm rules.
        
        Swarm intelligence emerges from these simple rules:
        1. Move toward your personal best
        2. Move toward the swarm's best
        3. Maintain momentum
        """
        # Evaluate current position
        current_value = objective_fn(agent.position)
        
        # Update personal best
        if current_value > agent.best_value:
            agent.best_value = current_value
            agent.best_position = agent.position
        
        # Update global best
        if current_value > self.global_best_value:
            self.global_best_value = current_value
            self.global_best_position = agent.position
        
        # Calculate new velocity
        new_velocity = []
        new_position = []
        
        for d in range(self.dimensions):
            # Inertia term
            inertia = self.w * agent.velocity[d]
            
            # Cognitive term (attraction to personal best)
            r1 = random.random()
            cognitive = self.c1 * r1 * (agent.best_position[d] - agent.position[d])
            
            # Social term (attraction to global best)
            r2 = random.random()
            if self.global_best_position:
                social = self.c2 * r2 * (self.global_best_position[d] - agent.position[d])
            else:
                social = 0.0
            
            # New velocity
            vel = inertia + cognitive + social
            new_velocity.append(vel)
            
            # New position
            pos = agent.position[d] + vel
            new_position.append(pos)
        
        # Update agent
        agent.velocity = tuple(new_velocity)
        agent.position = tuple(new_position)
    
    def step(self, objective_fn: Callable[[Tuple[float, ...]], float]):
        """Execute one step for all agents in the swarm"""
        for agent in self.agents:
            self.update_agent(agent, objective_fn)
    
    def optimize(self, objective_fn: Callable[[Tuple[float, ...]], float],
                 max_iterations: int = 100) -> Tuple[Tuple[float, ...], float]:
        """
        Optimize using swarm intelligence.
        
        Returns:
            (optimal_position, optimal_value)
        """
        for iteration in range(max_iterations):
            self.step(objective_fn)
            
            if iteration % 10 == 0:
                logger.info(f"Iteration {iteration}: Best value = {self.global_best_value:.6f}")
        
        return self.global_best_position, self.global_best_value


# ============================================================================
# 4. DEAD RECKONING - State Estimation
# ============================================================================

@dataclass
class StateEstimate:
    """State estimate with uncertainty"""
    position: Tuple[float, float, float]
    velocity: Tuple[float, float, float]
    uncertainty: float  # Position uncertainty (standard deviation)
    timestamp: float


class DeadReckoning:
    """
    Track position through integration of movement with uncertainty tracking.
    
    Pigeon analog: Track distance traveled, direction changes, speed
    Algorithm analogs: Kalman filter, SLAM, predictive modeling
    
    Use cases:
    - Robot localization
    - State estimation in noisy environments
    - Predictive modeling
    """
    
    def __init__(self, initial_position: Tuple[float, float, float],
                 process_noise: float = 0.1,
                 measurement_noise: float = 0.5):
        self.position = list(initial_position)
        self.velocity = [0.0, 0.0, 0.0]
        self.uncertainty = 0.0
        self.process_noise = process_noise  # Uncertainty growth per step
        self.measurement_noise = measurement_noise  # Measurement uncertainty
        self.history: List[StateEstimate] = []
        self.timestamp = 0.0
    
    def predict(self, delta_time: float):
        """
        Predict new position based on current velocity (dead reckoning).
        Uncertainty grows over time without measurements.
        """
        # Update position using velocity
        for i in range(3):
            self.position[i] += self.velocity[i] * delta_time
        
        # Uncertainty grows with motion
        self.uncertainty += self.process_noise * delta_time
        self.timestamp += delta_time
        
        # Save to history
        self.history.append(StateEstimate(
            position=tuple(self.position),
            velocity=tuple(self.velocity),
            uncertainty=self.uncertainty,
            timestamp=self.timestamp
        ))
    
    def update(self, measured_position: Tuple[float, float, float],
               measurement_confidence: float = 1.0):
        """
        Update position estimate with new measurement (sensor fusion).
        Uses Kalman-like update to blend prediction with measurement.
        
        Higher measurement confidence = trust measurement more
        """
        # Kalman gain: how much to trust measurement vs prediction
        kalman_gain = self.uncertainty / (self.uncertainty + self.measurement_noise / measurement_confidence)
        
        # Update position estimate
        for i in range(3):
            innovation = measured_position[i] - self.position[i]
            self.position[i] += kalman_gain * innovation
        
        # Reduce uncertainty with measurement
        self.uncertainty *= (1 - kalman_gain)
        
        logger.debug(f"Updated position with measurement (uncertainty: {self.uncertainty:.3f})")
    
    def estimate_velocity(self, new_position: Tuple[float, float, float],
                         delta_time: float):
        """Estimate velocity from position change"""
        if delta_time > 0:
            for i in range(3):
                self.velocity[i] = (new_position[i] - self.position[i]) / delta_time
    
    def get_state(self) -> StateEstimate:
        """Get current state estimate"""
        return StateEstimate(
            position=tuple(self.position),
            velocity=tuple(self.velocity),
            uncertainty=self.uncertainty,
            timestamp=self.timestamp
        )


# ============================================================================
# 5. HOME VECTOR ENCODING - Persistent Goal State
# ============================================================================

class HomeVectorEncoder:
    """
    Maintain persistent goal state and evaluate everything relative to it.
    
    Pigeon analog: Always maintain a "home vector" pointing toward roost
    Programming analogs: Global objective function, persistent target state
    
    Use cases:
    - Goal-driven agents
    - Puzzle solving with meta-objectives
    - Long-term planning with persistent goals
    """
    
    def __init__(self, home_position: Tuple[float, float, float],
                 home_state: Optional[Dict[str, Any]] = None):
        self.home_position = home_position
        self.home_state = home_state or {}
        self.current_position = None
        self.trajectory: List[Tuple[float, float, float]] = []
        self.deviations: List[float] = []
    
    def set_current_position(self, position: Tuple[float, float, float]):
        """Update current position"""
        self.current_position = position
        self.trajectory.append(position)
    
    def get_home_vector(self) -> Tuple[float, float, float]:
        """
        Get vector pointing toward home from current position.
        This is the core "homing" mechanism.
        """
        if not self.current_position:
            return (0.0, 0.0, 0.0)
        
        # Calculate vector from current to home
        dx = self.home_position[0] - self.current_position[0]
        dy = self.home_position[1] - self.current_position[1]
        dz = self.home_position[2] - self.current_position[2]
        
        return (dx, dy, dz)
    
    def distance_to_home(self) -> float:
        """Calculate straight-line distance to home"""
        if not self.current_position:
            return float('inf')
        
        vector = self.get_home_vector()
        return math.sqrt(vector[0]**2 + vector[1]**2 + vector[2]**2)
    
    def evaluate_action(self, proposed_position: Tuple[float, float, float]) -> float:
        """
        Evaluate how good an action is based on whether it moves toward home.
        
        Returns:
            Score (higher is better). Positive if moving toward home, negative if away.
        """
        if not self.current_position:
            return 0.0
        
        # Current distance to home
        current_distance = self.distance_to_home()
        
        # Distance after proposed move
        old_pos = self.current_position
        self.current_position = proposed_position
        proposed_distance = self.distance_to_home()
        self.current_position = old_pos  # Restore
        
        # Score is negative of distance change (reward moving closer)
        score = current_distance - proposed_distance
        
        return score
    
    def is_home(self, tolerance: float = 1.0) -> bool:
        """Check if we've reached home within tolerance"""
        return self.distance_to_home() < tolerance
    
    def track_deviation(self):
        """Track how much we're deviating from optimal path"""
        deviation = self.distance_to_home()
        self.deviations.append(deviation)
    
    def get_trajectory_efficiency(self) -> float:
        """
        Calculate efficiency of trajectory taken.
        
        Returns:
            Efficiency ratio (0.0 to 1.0, where 1.0 is perfectly straight path)
        """
        if len(self.trajectory) < 2:
            return 1.0
        
        # Calculate actual path length
        actual_length = 0.0
        for i in range(len(self.trajectory) - 1):
            dx = self.trajectory[i+1][0] - self.trajectory[i][0]
            dy = self.trajectory[i+1][1] - self.trajectory[i][1]
            dz = self.trajectory[i+1][2] - self.trajectory[i][2]
            actual_length += math.sqrt(dx*dx + dy*dy + dz*dz)
        
        # Calculate straight-line distance
        start = self.trajectory[0]
        end = self.trajectory[-1]
        dx = end[0] - start[0]
        dy = end[1] - start[1]
        dz = end[2] - start[2]
        straight_line = math.sqrt(dx*dx + dy*dy + dz*dz)
        
        # Efficiency is straight line / actual path
        if actual_length > 0:
            return straight_line / actual_length
        return 1.0


# ============================================================================
# INTEGRATION HELPERS
# ============================================================================

def create_navigation_example():
    """Example of using all 5 homing pigeon algorithms together"""
    
    print("=" * 70)
    print("HOMING PIGEON ALGORITHMS - Integrated Example")
    print("=" * 70)
    
    # Setup: Agent needs to navigate home using multiple imperfect signals
    current_pos = (0.0, 0.0, 0.0)
    home_pos = (100.0, 100.0, 0.0)
    
    # 1. Home Vector Encoder - Know where home is
    home_encoder = HomeVectorEncoder(home_pos)
    home_encoder.set_current_position(current_pos)
    
    print(f"\n1. HOME VECTOR ENCODING")
    print(f"   Current position: {current_pos}")
    print(f"   Home position: {home_pos}")
    print(f"   Distance to home: {home_encoder.distance_to_home():.2f}")
    print(f"   Home vector: {home_encoder.get_home_vector()}")
    
    # 2. Vector Navigation - Use multiple signals to navigate
    navigator = VectorNavigator()
    
    # Simulate noisy navigation signals
    signals = [
        NavigationVector("sun", (0.7, 0.7, 0.0), strength=0.9, reliability=0.85, timestamp=0.0),
        NavigationVector("magnetic", (0.6, 0.8, 0.0), strength=0.8, reliability=0.75, timestamp=0.0),
        NavigationVector("landmark", (0.75, 0.65, 0.0), strength=0.7, reliability=0.9, timestamp=0.0),
    ]
    
    direction = navigator.navigate(current_pos, home_pos, signals)
    
    print(f"\n2. VECTOR NAVIGATION (Multi-sensor fusion)")
    print(f"   Available signals: {len(signals)}")
    print(f"   Fused direction: ({direction[0]:.3f}, {direction[1]:.3f}, {direction[2]:.3f})")
    
    # 3. Dead Reckoning - Track position with uncertainty
    dead_reckoning = DeadReckoning(current_pos)
    dead_reckoning.velocity = list(direction)  # Use navigation direction as velocity
    dead_reckoning.predict(delta_time=1.0)
    
    print(f"\n3. DEAD RECKONING (State estimation)")
    print(f"   Predicted position: {dead_reckoning.position}")
    print(f"   Uncertainty: {dead_reckoning.uncertainty:.3f}")
    
    # 4. Gradient Following - Optimize path
    def distance_objective(pos):
        """Objective: minimize distance to home (negative distance for maximization)"""
        dx = home_pos[0] - pos[0]
        dy = home_pos[1] - pos[1]
        dz = home_pos[2] - pos[2]
        return -math.sqrt(dx*dx + dy*dy + dz*dz)
    
    gradient = GradientFollower(learning_rate=0.5)
    optimized_pos, value = gradient.optimize(list(current_pos), distance_objective, max_iterations=10)
    
    print(f"\n4. GRADIENT FOLLOWING (Path optimization)")
    print(f"   Optimized position: {optimized_pos}")
    print(f"   Objective value: {value:.2f}")
    
    # 5. Swarm Intelligence - Coordinate multiple agents
    swarm = SwarmIntelligence(n_agents=5, dimensions=3)
    
    def swarm_objective(pos):
        """Swarm objective: find position closest to home"""
        dx = home_pos[0] - pos[0]
        dy = home_pos[1] - pos[1]
        dz = home_pos[2] - pos[2]
        return -math.sqrt(dx*dx + dy*dy + dz*dz)
    
    best_pos, best_val = swarm.optimize(swarm_objective, max_iterations=20)
    
    print(f"\n5. SWARM INTELLIGENCE (Distributed coordination)")
    print(f"   Number of agents: {len(swarm.agents)}")
    print(f"   Best position found: ({best_pos[0]:.2f}, {best_pos[1]:.2f}, {best_pos[2]:.2f})")
    print(f"   Best value: {best_val:.2f}")
    
    print(f"\n{'=' * 70}")
    print("All 5 homing pigeon algorithms demonstrated successfully!")
    print(f"{'=' * 70}")


if __name__ == "__main__":
    # Run integrated example
    create_navigation_example()
