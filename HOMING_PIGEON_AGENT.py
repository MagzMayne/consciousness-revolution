#!/usr/bin/env python3
"""
HOMING PIGEON AGENT
AUL-compliant autonomous agent that uses homing pigeon mechanics for navigation,
optimization, and goal-driven behavior.

This agent demonstrates how biological navigation patterns can be translated
into functional AI agent behaviors.
"""

import json
import time
from typing import Dict, List, Any, Tuple, Optional
from datetime import datetime

from aul_agent_base import AULAgent, AULMessage
from HOMING_PIGEON_ALGORITHMS import (
    VectorNavigator, NavigationVector,
    GradientFollower, SwarmIntelligence,
    DeadReckoning, HomeVectorEncoder
)


class HomingPigeonAgent(AULAgent):
    """
    Autonomous agent with homing pigeon navigation mechanics.
    
    Capabilities:
    - Vector-based navigation with multi-source fusion
    - Gradient-based optimization
    - Swarm coordination
    - Dead reckoning state estimation
    - Home vector goal persistence
    
    Use cases:
    - Autonomous navigation tasks
    - Search and optimization problems
    - Pattern recognition with meta-objectives
    - Multi-agent coordination
    """
    
    def __init__(
        self,
        agent_id: str = "homing-pigeon-01",
        home_position: Tuple[float, float, float] = (0.0, 0.0, 0.0),
        **kwargs
    ):
        super().__init__(
            agent_id=agent_id,
            agent_type="homing_pigeon",
            version="1.0.0",
            capabilities=[
                "vector_navigation",
                "gradient_optimization",
                "swarm_coordination",
                "dead_reckoning",
                "home_vector_tracking",
                "multi_agent_search",
                "pattern_recognition"
            ],
            **kwargs
        )
        
        # Initialize homing pigeon subsystems
        self.vector_navigator = VectorNavigator()
        self.gradient_follower = GradientFollower(learning_rate=0.1)
        self.dead_reckoning = DeadReckoning(home_position)
        self.home_encoder = HomeVectorEncoder(home_position)
        
        # Swarm coordination (initialized on demand)
        self.swarm = None
        self.is_swarm_coordinator = False
        
        # Current state
        self.current_position = home_position
        self.home_position = home_position
        self.current_goal = None
        self.navigation_signals = []
        
        # Mission tracking
        self.missions = []
        self.mission_history = []
        
        # Register message handlers
        self.register_handler("navigate_to", self._handle_navigate_to)
        self.register_handler("optimize_path", self._handle_optimize_path)
        self.register_handler("join_swarm", self._handle_join_swarm)
        self.register_handler("update_position", self._handle_update_position)
        self.register_handler("add_signal", self._handle_add_signal)
        self.register_handler("get_status", self._handle_get_status)
        self.register_handler("set_home", self._handle_set_home)
    
    def on_start(self):
        """Called when agent starts"""
        print(f"🕊️  Homing Pigeon Agent started: {self.agent_id}")
        print(f"   Home position: {self.home_position}")
        print(f"   Current position: {self.current_position}")
        print(f"   Capabilities: {', '.join(self.capabilities)}")
        
        # Initialize position tracking
        self.home_encoder.set_current_position(self.current_position)
    
    def handle_message(self, message: AULMessage) -> Any:
        """Default message handler"""
        return {
            "status": "acknowledged",
            "agent_id": self.agent_id,
            "message_type": message.message_type
        }
    
    # ========================================================================
    # Message Handlers
    # ========================================================================
    
    def _handle_navigate_to(self, message: AULMessage) -> Dict:
        """
        Navigate to a target position using homing pigeon mechanics.
        
        Payload:
        {
            "target": [x, y, z],
            "signals": [{"source": "...", "direction": [...], ...}],
            "method": "vector_navigation" | "gradient_following"
        }
        """
        payload = message.payload
        target = tuple(payload.get("target", self.home_position))
        signals_data = payload.get("signals", [])
        method = payload.get("method", "vector_navigation")
        
        # Parse navigation signals
        signals = []
        for sig_data in signals_data:
            signal = NavigationVector(
                source=sig_data["source"],
                direction=tuple(sig_data["direction"]),
                strength=sig_data.get("strength", 1.0),
                reliability=sig_data.get("reliability", 1.0),
                timestamp=time.time()
            )
            signals.append(signal)
            self.navigation_signals.append(signal)
        
        # Navigate using specified method
        if method == "vector_navigation":
            direction = self.vector_navigator.navigate(
                self.current_position,
                target,
                signals
            )
            
            # Update position (simulate movement)
            step_size = 1.0
            new_position = (
                self.current_position[0] + direction[0] * step_size,
                self.current_position[1] + direction[1] * step_size,
                self.current_position[2] + direction[2] * step_size
            )
            
            self._update_position(new_position)
            
            return {
                "method": "vector_navigation",
                "direction": direction,
                "new_position": new_position,
                "distance_to_target": self._distance(new_position, target)
            }
        
        elif method == "gradient_following":
            # Define objective function (get closer to target)
            def objective(pos):
                dx = target[0] - pos[0]
                dy = target[1] - pos[1]
                dz = target[2] - pos[2]
                return -math.sqrt(dx*dx + dy*dy + dz*dz)  # Negative distance
            
            # Take gradient step
            new_position_list = self.gradient_follower.step(
                list(self.current_position),
                objective
            )
            new_position = tuple(new_position_list)
            
            self._update_position(new_position)
            
            return {
                "method": "gradient_following",
                "new_position": new_position,
                "distance_to_target": self._distance(new_position, target),
                "objective_value": objective(new_position_list)
            }
        
        else:
            return {"error": f"Unknown navigation method: {method}"}
    
    def _handle_optimize_path(self, message: AULMessage) -> Dict:
        """
        Optimize path to target using gradient following.
        
        Payload:
        {
            "target": [x, y, z],
            "max_iterations": 100
        }
        """
        payload = message.payload
        target = tuple(payload.get("target", self.home_position))
        max_iterations = payload.get("max_iterations", 100)
        
        # Define objective: minimize distance to target
        def objective(pos):
            dx = target[0] - pos[0]
            dy = target[1] - pos[1]
            dz = target[2] - pos[2]
            return -math.sqrt(dx*dx + dy*dy + dz*dz)
        
        # Optimize path
        optimal_position, optimal_value = self.gradient_follower.optimize(
            list(self.current_position),
            objective,
            max_iterations=max_iterations
        )
        
        return {
            "optimal_position": optimal_position,
            "optimal_value": optimal_value,
            "iterations": max_iterations,
            "improvement": optimal_value - objective(list(self.current_position))
        }
    
    def _handle_join_swarm(self, message: AULMessage) -> Dict:
        """
        Join or create a swarm for distributed search.
        
        Payload:
        {
            "swarm_id": "...",
            "role": "member" | "coordinator",
            "n_agents": 5,
            "objective": {...}
        }
        """
        payload = message.payload
        swarm_id = payload.get("swarm_id", f"swarm-{self.agent_id}")
        role = payload.get("role", "member")
        n_agents = payload.get("n_agents", 5)
        
        # Create or join swarm
        if role == "coordinator":
            self.is_swarm_coordinator = True
            self.swarm = SwarmIntelligence(n_agents=n_agents, dimensions=3)
            
            return {
                "status": "swarm_created",
                "swarm_id": swarm_id,
                "role": "coordinator",
                "n_agents": len(self.swarm.agents)
            }
        else:
            return {
                "status": "swarm_joined",
                "swarm_id": swarm_id,
                "role": "member"
            }
    
    def _handle_update_position(self, message: AULMessage) -> Dict:
        """
        Update agent position with measurement and dead reckoning.
        
        Payload:
        {
            "measured_position": [x, y, z],
            "confidence": 0.0-1.0,
            "delta_time": 1.0
        }
        """
        payload = message.payload
        measured_position = tuple(payload.get("measured_position", self.current_position))
        confidence = payload.get("confidence", 1.0)
        delta_time = payload.get("delta_time", 1.0)
        
        # Dead reckoning prediction
        self.dead_reckoning.predict(delta_time)
        
        # Update with measurement
        self.dead_reckoning.update(measured_position, confidence)
        
        # Get corrected state estimate
        state = self.dead_reckoning.get_state()
        
        # Update position
        self._update_position(state.position)
        
        return {
            "position": state.position,
            "velocity": state.velocity,
            "uncertainty": state.uncertainty,
            "timestamp": state.timestamp
        }
    
    def _handle_add_signal(self, message: AULMessage) -> Dict:
        """
        Add a navigation signal for sensor fusion.
        
        Payload:
        {
            "source": "sun|magnetic|landmark|olfactory",
            "direction": [x, y, z],
            "strength": 0.0-1.0,
            "reliability": 0.0-1.0
        }
        """
        payload = message.payload
        signal = NavigationVector(
            source=payload["source"],
            direction=tuple(payload["direction"]),
            strength=payload.get("strength", 1.0),
            reliability=payload.get("reliability", 1.0),
            timestamp=time.time()
        )
        
        self.navigation_signals.append(signal)
        self.vector_navigator.add_signal(signal)
        
        return {
            "status": "signal_added",
            "source": signal.source,
            "total_signals": len(self.navigation_signals)
        }
    
    def _handle_get_status(self, message: AULMessage) -> Dict:
        """Get comprehensive agent status"""
        return self.get_pigeon_status()
    
    def _handle_set_home(self, message: AULMessage) -> Dict:
        """
        Set new home position.
        
        Payload:
        {
            "home_position": [x, y, z]
        }
        """
        payload = message.payload
        new_home = tuple(payload.get("home_position", self.home_position))
        
        self.home_position = new_home
        self.home_encoder = HomeVectorEncoder(new_home)
        self.home_encoder.set_current_position(self.current_position)
        
        return {
            "status": "home_updated",
            "home_position": new_home,
            "distance_to_home": self.home_encoder.distance_to_home()
        }
    
    # ========================================================================
    # Internal Methods
    # ========================================================================
    
    def _update_position(self, new_position: Tuple[float, float, float]):
        """Update current position and related state"""
        self.current_position = new_position
        self.home_encoder.set_current_position(new_position)
        self.home_encoder.track_deviation()
    
    def _distance(self, pos1: Tuple[float, float, float], 
                  pos2: Tuple[float, float, float]) -> float:
        """Calculate distance between two positions"""
        import math
        dx = pos2[0] - pos1[0]
        dy = pos2[1] - pos1[1]
        dz = pos2[2] - pos1[2]
        return math.sqrt(dx*dx + dy*dy + dz*dz)
    
    def get_pigeon_status(self) -> Dict:
        """Get comprehensive status including homing pigeon metrics"""
        base_health = self.get_health_status()
        
        return {
            **base_health,
            "pigeon_status": {
                "current_position": self.current_position,
                "home_position": self.home_position,
                "distance_to_home": self.home_encoder.distance_to_home(),
                "home_vector": self.home_encoder.get_home_vector(),
                "is_home": self.home_encoder.is_home(tolerance=1.0),
                "trajectory_length": len(self.home_encoder.trajectory),
                "trajectory_efficiency": self.home_encoder.get_trajectory_efficiency(),
                "navigation_signals": len(self.navigation_signals),
                "dead_reckoning_uncertainty": self.dead_reckoning.uncertainty,
                "in_swarm": self.swarm is not None,
                "is_swarm_coordinator": self.is_swarm_coordinator
            }
        }


# ============================================================================
# Example Usage & Testing
# ============================================================================

def test_homing_pigeon_agent():
    """Test the homing pigeon agent with various scenarios"""
    
    print("=" * 70)
    print("🕊️  HOMING PIGEON AGENT TEST")
    print("=" * 70)
    
    # Create agent with home at origin
    agent = HomingPigeonAgent(
        agent_id="pigeon-test-01",
        home_position=(0.0, 0.0, 0.0)
    )
    agent.start()
    
    # Test 1: Navigate to target with vector navigation
    print("\n📍 Test 1: Vector Navigation")
    print("-" * 70)
    
    navigate_msg = AULMessage(
        sender_id="test-controller",
        sender_type="test",
        message_type="navigate_to",
        payload={
            "target": [10.0, 10.0, 0.0],
            "signals": [
                {
                    "source": "sun",
                    "direction": [0.7, 0.7, 0.0],
                    "strength": 0.9,
                    "reliability": 0.85
                },
                {
                    "source": "magnetic",
                    "direction": [0.6, 0.8, 0.0],
                    "strength": 0.8,
                    "reliability": 0.75
                }
            ],
            "method": "vector_navigation"
        }
    )
    
    result = agent.receive_message(navigate_msg)
    print(f"Result: {json.dumps(result['data'], indent=2)}")
    
    # Test 2: Optimize path to target
    print("\n🎯 Test 2: Path Optimization")
    print("-" * 70)
    
    optimize_msg = AULMessage(
        sender_id="test-controller",
        sender_type="test",
        message_type="optimize_path",
        payload={
            "target": [20.0, 20.0, 0.0],
            "max_iterations": 50
        }
    )
    
    result = agent.receive_message(optimize_msg)
    print(f"Result: {json.dumps(result['data'], indent=2)}")
    
    # Test 3: Dead reckoning update
    print("\n📡 Test 3: Dead Reckoning Update")
    print("-" * 70)
    
    update_msg = AULMessage(
        sender_id="test-controller",
        sender_type="test",
        message_type="update_position",
        payload={
            "measured_position": [15.0, 15.0, 0.0],
            "confidence": 0.8,
            "delta_time": 1.0
        }
    )
    
    result = agent.receive_message(update_msg)
    print(f"Result: {json.dumps(result['data'], indent=2)}")
    
    # Test 4: Get comprehensive status
    print("\n📊 Test 4: Agent Status")
    print("-" * 70)
    
    status_msg = AULMessage(
        sender_id="test-controller",
        sender_type="test",
        message_type="get_status",
        payload={}
    )
    
    result = agent.receive_message(status_msg)
    print(f"Status: {json.dumps(result['data'], indent=2)}")
    
    # Test 5: Join swarm
    print("\n🐝 Test 5: Swarm Coordination")
    print("-" * 70)
    
    swarm_msg = AULMessage(
        sender_id="test-controller",
        sender_type="test",
        message_type="join_swarm",
        payload={
            "swarm_id": "test-swarm-01",
            "role": "coordinator",
            "n_agents": 5
        }
    )
    
    result = agent.receive_message(swarm_msg)
    print(f"Result: {json.dumps(result['data'], indent=2)}")
    
    # Stop agent
    time.sleep(1)
    agent.stop()
    
    print("\n" + "=" * 70)
    print("✅ All tests completed successfully!")
    print("=" * 70)


if __name__ == "__main__":
    import math
    test_homing_pigeon_agent()
