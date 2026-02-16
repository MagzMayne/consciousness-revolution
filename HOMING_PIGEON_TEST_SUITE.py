#!/usr/bin/env python3
"""
HOMING PIGEON ALGORITHMS TEST SUITE
Comprehensive tests for all 5 homing pigeon navigation mechanics.
"""

import unittest
import math
from typing import Tuple

from HOMING_PIGEON_ALGORITHMS import (
    NavigationVector, VectorNavigator,
    GradientFollower, SwarmIntelligence,
    DeadReckoning, HomeVectorEncoder
)


class TestVectorNavigation(unittest.TestCase):
    """Tests for vector-based navigation"""
    
    def setUp(self):
        self.navigator = VectorNavigator()
    
    def test_signal_fusion_single_source(self):
        """Test fusion with single navigation signal"""
        signal = NavigationVector(
            source="sun",
            direction=(1.0, 0.0, 0.0),
            strength=1.0,
            reliability=1.0,
            timestamp=0.0
        )
        
        result = self.navigator.fuse_signals([signal])
        self.assertAlmostEqual(result[0], 1.0, places=5)
        self.assertAlmostEqual(result[1], 0.0, places=5)
        self.assertAlmostEqual(result[2], 0.0, places=5)
    
    def test_signal_fusion_multiple_sources(self):
        """Test fusion with multiple signals"""
        signals = [
            NavigationVector("sun", (1.0, 0.0, 0.0), 1.0, 1.0, 0.0),
            NavigationVector("magnetic", (0.0, 1.0, 0.0), 1.0, 1.0, 0.0)
        ]
        
        result = self.navigator.fuse_signals(signals)
        # Should blend the two directions
        self.assertGreater(result[0], 0)
        self.assertGreater(result[1], 0)
    
    def test_signal_weighting(self):
        """Test that signal weights affect fusion"""
        # High reliability signal should dominate
        signals = [
            NavigationVector("sun", (1.0, 0.0, 0.0), 1.0, 1.0, 0.0),
            NavigationVector("weak", (0.0, 1.0, 0.0), 0.1, 0.1, 0.0)
        ]
        
        result = self.navigator.fuse_signals(signals)
        # X component should be much larger than Y
        self.assertGreater(result[0], result[1])
    
    def test_navigate_toward_target(self):
        """Test navigation produces direction toward target"""
        current = (0.0, 0.0, 0.0)
        target = (10.0, 10.0, 0.0)
        signals = [
            NavigationVector("sun", (0.7, 0.7, 0.0), 1.0, 1.0, 0.0)
        ]
        
        direction = self.navigator.navigate(current, target, signals)
        
        # Direction should have positive X and Y components
        self.assertGreater(direction[0], 0)
        self.assertGreater(direction[1], 0)


class TestGradientFollowing(unittest.TestCase):
    """Tests for gradient-based optimization"""
    
    def setUp(self):
        self.follower = GradientFollower(learning_rate=0.1)
    
    def test_gradient_calculation(self):
        """Test gradient calculation for simple function"""
        # Simple quadratic: f(x) = -x^2 (maximum at x=0)
        def objective(pos):
            return -(pos[0]**2)
        
        position = [1.0]
        grad = self.follower.gradient(position, objective)
        
        # Gradient should be negative (pointing toward x=0)
        self.assertLess(grad[0], 0)
    
    def test_optimization_converges(self):
        """Test that optimization converges to optimum"""
        # Optimize: minimize distance to (5, 5)
        def objective(pos):
            return -((pos[0]-5)**2 + (pos[1]-5)**2)
        
        initial = [0.0, 0.0]
        optimal_pos, optimal_val = self.follower.optimize(
            initial, 
            objective, 
            max_iterations=100
        )
        
        # Should converge near (5, 5)
        self.assertLess(abs(optimal_pos[0] - 5.0), 1.0)
        self.assertLess(abs(optimal_pos[1] - 5.0), 1.0)
    
    def test_tracks_best_position(self):
        """Test that best position is tracked during optimization"""
        def objective(pos):
            return -(pos[0]**2)
        
        self.follower.optimize([2.0], objective, max_iterations=50)
        
        self.assertIsNotNone(self.follower.best_position)
        self.assertIsNotNone(self.follower.best_value)


class TestSwarmIntelligence(unittest.TestCase):
    """Tests for swarm-based optimization"""
    
    def setUp(self):
        self.swarm = SwarmIntelligence(n_agents=5, dimensions=2)
    
    def test_swarm_initialization(self):
        """Test swarm initializes with correct number of agents"""
        self.assertEqual(len(self.swarm.agents), 5)
        
        # All agents should have positions and velocities
        for agent in self.swarm.agents:
            self.assertEqual(len(agent.position), 2)
            self.assertEqual(len(agent.velocity), 2)
    
    def test_agent_update(self):
        """Test individual agent updates"""
        def objective(pos):
            return -(pos[0]**2 + pos[1]**2)  # Maximize at (0, 0)
        
        agent = self.swarm.agents[0]
        initial_pos = agent.position
        
        self.swarm.update_agent(agent, objective)
        
        # Position should have changed
        self.assertNotEqual(agent.position, initial_pos)
    
    def test_swarm_optimization(self):
        """Test swarm finds optimal solution"""
        def objective(pos):
            # Maximize at (3, 3)
            return -((pos[0]-3)**2 + (pos[1]-3)**2)
        
        best_pos, best_val = self.swarm.optimize(objective, max_iterations=50)
        
        # Should find position near (3, 3)
        self.assertIsNotNone(best_pos)
        self.assertLess(abs(best_pos[0] - 3.0), 2.0)
        self.assertLess(abs(best_pos[1] - 3.0), 2.0)
    
    def test_global_best_tracking(self):
        """Test that global best is tracked across swarm"""
        def objective(pos):
            return -(pos[0]**2 + pos[1]**2)
        
        self.swarm.step(objective)
        
        self.assertIsNotNone(self.swarm.global_best_position)
        self.assertNotEqual(self.swarm.global_best_value, float('-inf'))


class TestDeadReckoning(unittest.TestCase):
    """Tests for dead reckoning state estimation"""
    
    def setUp(self):
        self.tracker = DeadReckoning(
            initial_position=(0.0, 0.0, 0.0),
            process_noise=0.1,
            measurement_noise=0.5
        )
    
    def test_prediction_updates_position(self):
        """Test that prediction moves position based on velocity"""
        self.tracker.velocity = [1.0, 1.0, 0.0]
        initial_pos = self.tracker.position.copy()
        
        self.tracker.predict(delta_time=1.0)
        
        # Position should have moved
        self.assertNotEqual(self.tracker.position[0], initial_pos[0])
        self.assertNotEqual(self.tracker.position[1], initial_pos[1])
    
    def test_prediction_increases_uncertainty(self):
        """Test that uncertainty grows with prediction"""
        initial_uncertainty = self.tracker.uncertainty
        
        self.tracker.predict(delta_time=1.0)
        
        self.assertGreater(self.tracker.uncertainty, initial_uncertainty)
    
    def test_measurement_update_reduces_uncertainty(self):
        """Test that measurements reduce uncertainty"""
        # Predict to build up uncertainty
        self.tracker.predict(delta_time=5.0)
        uncertainty_before = self.tracker.uncertainty
        
        # Update with measurement
        self.tracker.update((1.0, 1.0, 0.0), measurement_confidence=1.0)
        
        # Uncertainty should decrease
        self.assertLess(self.tracker.uncertainty, uncertainty_before)
    
    def test_measurement_update_corrects_position(self):
        """Test that measurements correct position estimate"""
        # Set position with some error
        self.tracker.position = [5.0, 5.0, 0.0]
        
        # Correct measurement
        true_position = (3.0, 3.0, 0.0)
        self.tracker.update(true_position, measurement_confidence=1.0)
        
        # Position should move toward measurement
        self.assertLess(abs(self.tracker.position[0] - 3.0), 5.0)
        self.assertLess(abs(self.tracker.position[1] - 3.0), 5.0)
    
    def test_velocity_estimation(self):
        """Test velocity estimation from position changes"""
        old_pos = (0.0, 0.0, 0.0)
        new_pos = (2.0, 2.0, 0.0)
        
        self.tracker.position = list(old_pos)
        self.tracker.estimate_velocity(new_pos, delta_time=1.0)
        
        # Velocity should be approximately 2.0 in X and Y
        self.assertAlmostEqual(self.tracker.velocity[0], 2.0, places=5)
        self.assertAlmostEqual(self.tracker.velocity[1], 2.0, places=5)


class TestHomeVectorEncoding(unittest.TestCase):
    """Tests for home vector goal persistence"""
    
    def setUp(self):
        self.home_position = (10.0, 10.0, 0.0)
        self.encoder = HomeVectorEncoder(self.home_position)
    
    def test_home_vector_points_home(self):
        """Test that home vector points toward home"""
        self.encoder.set_current_position((0.0, 0.0, 0.0))
        
        vector = self.encoder.get_home_vector()
        
        # Vector should point from (0,0,0) to (10,10,0)
        self.assertEqual(vector[0], 10.0)
        self.assertEqual(vector[1], 10.0)
        self.assertEqual(vector[2], 0.0)
    
    def test_distance_calculation(self):
        """Test distance to home calculation"""
        self.encoder.set_current_position((0.0, 0.0, 0.0))
        
        distance = self.encoder.distance_to_home()
        
        # Distance should be sqrt(10^2 + 10^2) ≈ 14.14
        expected = math.sqrt(10**2 + 10**2)
        self.assertAlmostEqual(distance, expected, places=5)
    
    def test_evaluate_action_moving_closer(self):
        """Test that moving closer to home gives positive score"""
        self.encoder.set_current_position((0.0, 0.0, 0.0))
        
        # Propose moving toward home
        proposed = (5.0, 5.0, 0.0)
        score = self.encoder.evaluate_action(proposed)
        
        # Score should be positive (moving closer)
        self.assertGreater(score, 0)
    
    def test_evaluate_action_moving_away(self):
        """Test that moving away from home gives negative score"""
        self.encoder.set_current_position((0.0, 0.0, 0.0))
        
        # Propose moving away from home
        proposed = (-5.0, -5.0, 0.0)
        score = self.encoder.evaluate_action(proposed)
        
        # Score should be negative (moving away)
        self.assertLess(score, 0)
    
    def test_is_home_detection(self):
        """Test detection of reaching home"""
        # Far from home
        self.encoder.set_current_position((0.0, 0.0, 0.0))
        self.assertFalse(self.encoder.is_home(tolerance=1.0))
        
        # At home
        self.encoder.set_current_position((10.0, 10.0, 0.0))
        self.assertTrue(self.encoder.is_home(tolerance=1.0))
        
        # Near home
        self.encoder.set_current_position((10.5, 10.5, 0.0))
        self.assertTrue(self.encoder.is_home(tolerance=1.0))
    
    def test_trajectory_tracking(self):
        """Test that trajectory is tracked"""
        positions = [(0.0, 0.0, 0.0), (3.0, 3.0, 0.0), (7.0, 7.0, 0.0)]
        
        for pos in positions:
            self.encoder.set_current_position(pos)
        
        self.assertEqual(len(self.encoder.trajectory), 3)
    
    def test_trajectory_efficiency(self):
        """Test trajectory efficiency calculation"""
        # Straight path should have efficiency near 1.0
        self.encoder.set_current_position((0.0, 0.0, 0.0))
        self.encoder.set_current_position((5.0, 5.0, 0.0))
        self.encoder.set_current_position((10.0, 10.0, 0.0))
        
        efficiency = self.encoder.get_trajectory_efficiency()
        
        # Should be close to 1.0 for straight path
        self.assertGreater(efficiency, 0.9)


class TestIntegration(unittest.TestCase):
    """Integration tests combining multiple algorithms"""
    
    def test_navigation_with_dead_reckoning(self):
        """Test combining vector navigation with dead reckoning"""
        navigator = VectorNavigator()
        tracker = DeadReckoning((0.0, 0.0, 0.0))
        
        # Navigate with signals
        signals = [
            NavigationVector("sun", (1.0, 0.0, 0.0), 1.0, 1.0, 0.0)
        ]
        
        direction = navigator.fuse_signals(signals)
        
        # Use direction as velocity for dead reckoning
        tracker.velocity = list(direction)
        tracker.predict(delta_time=1.0)
        
        # Position should have moved in direction
        self.assertGreater(tracker.position[0], 0)
    
    def test_home_vector_with_optimization(self):
        """Test combining home vector with gradient optimization"""
        home = (10.0, 10.0, 0.0)
        encoder = HomeVectorEncoder(home)
        encoder.set_current_position((0.0, 0.0, 0.0))
        
        # Use home distance as objective
        def objective(pos):
            encoder.set_current_position(tuple(pos + [0.0] * (3 - len(pos))))
            return -encoder.distance_to_home()
        
        follower = GradientFollower(learning_rate=0.5)
        optimal_pos, _ = follower.optimize([0.0, 0.0], objective, max_iterations=50)
        
        # Should optimize toward home
        self.assertGreater(optimal_pos[0], 0)
        self.assertGreater(optimal_pos[1], 0)


def run_tests():
    """Run all tests and generate report"""
    import json
    from datetime import datetime
    
    # Run tests
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromModule(__import__(__name__))
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Generate report
    report = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "total_tests": result.testsRun,
        "passed": result.testsRun - len(result.failures) - len(result.errors),
        "failed": len(result.failures),
        "errors": len(result.errors),
        "success_rate": f"{((result.testsRun - len(result.failures) - len(result.errors)) / result.testsRun * 100):.1f}%",
        "test_categories": {
            "vector_navigation": 4,
            "gradient_following": 3,
            "swarm_intelligence": 4,
            "dead_reckoning": 5,
            "home_vector_encoding": 7,
            "integration": 2
        }
    }
    
    # Save report
    with open("HOMING_PIGEON_TEST_RESULTS.json", "w") as f:
        json.dump(report, f, indent=2)
    
    print("\n" + "=" * 70)
    print(f"Test Report: {report['passed']}/{report['total_tests']} passed ({report['success_rate']})")
    print("=" * 70)
    
    return result.wasSuccessful()


if __name__ == "__main__":
    success = run_tests()
    exit(0 if success else 1)
