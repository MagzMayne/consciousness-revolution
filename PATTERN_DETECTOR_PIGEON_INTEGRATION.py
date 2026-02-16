#!/usr/bin/env python3
"""
PATTERN DETECTOR WITH HOMING PIGEON INTEGRATION
Demonstrates how homing pigeon algorithms enhance pattern recognition.

This integration treats pattern detection as a navigation problem:
- "Home" = correct pattern identification
- Multiple indicators = navigation signals to fuse
- Confidence scoring = distance to "home" (correct pattern)
- Optimization = finding best pattern parameters
"""

import json
import math
from typing import Dict, List, Any, Tuple
from pathlib import Path

# Import pattern detector
try:
    from PATTERN_DETECTOR import MANIPULATION_PATTERNS
except ImportError:
    # Define subset if PATTERN_DETECTOR not available
    MANIPULATION_PATTERNS = {
        "gaslighting": {
            "domain": "relationships",
            "severity": "high",
            "indicators": ["you're crazy", "that never happened"],
            "description": "Making someone question their reality"
        },
        "love_bombing": {
            "domain": "relationships", 
            "severity": "medium",
            "indicators": ["you're perfect", "i can't live without you"],
            "description": "Overwhelming affection to gain control"
        }
    }

# Import homing pigeon algorithms
from HOMING_PIGEON_ALGORITHMS import (
    VectorNavigator, NavigationVector,
    GradientFollower, SwarmIntelligence,
    HomeVectorEncoder
)


class HomingPigeonPatternDetector:
    """
    Enhanced pattern detector using homing pigeon navigation mechanics.
    
    Key Innovation: Pattern detection as navigation problem
    - Each pattern is a "home" position in pattern space
    - Text indicators are "navigation signals" pointing toward patterns
    - Confidence is based on how close signals point to a pattern
    """
    
    def __init__(self):
        self.patterns = MANIPULATION_PATTERNS
        self.navigator = VectorNavigator()
        self.home_encoders = {}
        
        # Create home encoder for each pattern
        # Position in 2D space: (severity, certainty)
        pattern_positions = {
            "gaslighting": (0.9, 0.8),      # High severity, high certainty
            "love_bombing": (0.6, 0.7),     # Medium severity, good certainty
            "guilt_tripping": (0.6, 0.8),   # Medium severity, high certainty
            "triangulation": (0.8, 0.7),    # High severity, good certainty
            "fear_mongering": (0.9, 0.6),   # High severity, medium certainty
        }
        
        for pattern_name, position in pattern_positions.items():
            self.home_encoders[pattern_name] = HomeVectorEncoder(
                home_position=(position[0], position[1], 0.0),
                home_state={"pattern": pattern_name}
            )
    
    def analyze_text(self, text: str) -> Dict[str, Any]:
        """
        Analyze text for manipulation patterns using homing pigeon mechanics.
        
        Method:
        1. Extract indicators from text (navigation signals)
        2. Each indicator points toward certain patterns
        3. Use vector navigation to fuse signals
        4. Evaluate which pattern "home" we're closest to
        """
        text_lower = text.lower()
        
        # Find all matching indicators across patterns
        pattern_signals = {}
        
        for pattern_name, pattern_info in self.patterns.items():
            signals = []
            indicator_matches = 0
            
            for indicator in pattern_info.get("indicators", []):
                if isinstance(indicator, str):
                    if indicator.lower() in text_lower:
                        indicator_matches += 1
                        
                        # Create navigation signal pointing toward this pattern
                        # Strength based on indicator specificity
                        strength = min(1.0, len(indicator.split()) / 5.0)
                        
                        # Direction: point toward pattern position
                        encoder = self.home_encoders.get(pattern_name)
                        if encoder:
                            # Signal points toward pattern's home position
                            home_pos = encoder.home_position
                            signal = NavigationVector(
                                source=f"{pattern_name}_indicator",
                                direction=(home_pos[0], home_pos[1], 0.0),
                                strength=strength,
                                reliability=0.85,
                                timestamp=0.0
                            )
                            signals.append(signal)
            
            if signals:
                pattern_signals[pattern_name] = {
                    "signals": signals,
                    "match_count": indicator_matches,
                    "fused_direction": self.navigator.fuse_signals(signals)
                }
        
        # Evaluate which pattern we're closest to
        best_pattern = None
        best_score = 0.0
        pattern_scores = {}
        
        for pattern_name, signal_data in pattern_signals.items():
            fused_dir = signal_data["fused_direction"]
            encoder = self.home_encoders[pattern_name]
            
            # Set current position to fused signal direction
            encoder.set_current_position(fused_dir)
            
            # Score based on distance to home (inverse distance)
            distance = encoder.distance_to_home()
            score = signal_data["match_count"] * (1.0 / (1.0 + distance))
            
            pattern_scores[pattern_name] = {
                "score": score,
                "distance_to_home": distance,
                "match_count": signal_data["match_count"],
                "is_match": encoder.is_home(tolerance=0.5)
            }
            
            if score > best_score:
                best_score = score
                best_pattern = pattern_name
        
        # Build result
        if best_pattern:
            result = {
                "detected_pattern": best_pattern,
                "confidence": min(1.0, best_score / 3.0),  # Normalize to 0-1
                "pattern_info": self.patterns[best_pattern],
                "all_pattern_scores": pattern_scores,
                "method": "homing_pigeon_navigation"
            }
        else:
            result = {
                "detected_pattern": None,
                "confidence": 0.0,
                "pattern_info": None,
                "all_pattern_scores": {},
                "method": "homing_pigeon_navigation"
            }
        
        return result


class PatternParameterOptimizer:
    """
    Use gradient following to optimize pattern detection parameters.
    
    Example: Find optimal threshold and weights for pattern detection.
    """
    
    def __init__(self, training_data: List[Dict]):
        self.training_data = training_data
        self.gradient_follower = GradientFollower(learning_rate=0.01)
    
    def objective_function(self, params: List[float]) -> float:
        """
        Evaluate pattern detector accuracy with given parameters.
        
        Args:
            params: [threshold, weight1, weight2, weight3]
        
        Returns:
            Accuracy score (higher is better)
        """
        threshold, w1, w2, w3 = params
        
        correct = 0
        total = len(self.training_data)
        
        for example in self.training_data:
            # Simulate pattern detection with these parameters
            text = example["text"]
            true_pattern = example["pattern"]
            
            # Calculate weighted score
            indicator_count = example.get("indicator_count", 0)
            severity = example.get("severity", 0.5)
            certainty = example.get("certainty", 0.5)
            
            score = (indicator_count * w1 + severity * w2 + certainty * w3) / threshold
            
            # Check if detected correctly
            if score > 0.5 and true_pattern:
                correct += 1
            elif score <= 0.5 and not true_pattern:
                correct += 1
        
        accuracy = correct / total if total > 0 else 0.0
        return accuracy
    
    def optimize(self, initial_params: List[float] = None) -> Tuple[List[float], float]:
        """
        Find optimal parameters for pattern detection.
        
        Returns:
            (optimal_params, best_accuracy)
        """
        if initial_params is None:
            initial_params = [1.0, 1.0, 1.0, 1.0]  # Default starting point
        
        print("Optimizing pattern detection parameters...")
        
        optimal_params, optimal_accuracy = self.gradient_follower.optimize(
            initial_position=initial_params,
            objective_fn=self.objective_function,
            max_iterations=100,
            tolerance=1e-4
        )
        
        print(f"Optimization complete!")
        print(f"  Best parameters: {optimal_params}")
        print(f"  Best accuracy: {optimal_accuracy:.4f}")
        
        return optimal_params, optimal_accuracy


class SwarmPatternSearch:
    """
    Use swarm intelligence to search for optimal pattern configurations.
    
    Multiple agents explore parameter space in parallel to find best settings.
    """
    
    def __init__(self, n_agents: int = 10):
        self.swarm = SwarmIntelligence(n_agents=n_agents, dimensions=4)
    
    def search(self, objective_fn) -> Tuple[Tuple[float, ...], float]:
        """
        Search for optimal pattern parameters using swarm.
        
        Returns:
            (best_params, best_score)
        """
        print(f"Starting swarm search with {len(self.swarm.agents)} agents...")
        
        best_params, best_score = self.swarm.optimize(
            objective_fn=objective_fn,
            max_iterations=50
        )
        
        print(f"Swarm search complete!")
        print(f"  Best parameters: {best_params}")
        print(f"  Best score: {best_score:.4f}")
        
        return best_params, best_score


# ============================================================================
# Example Usage & Testing
# ============================================================================

def test_pigeon_pattern_detection():
    """Test pattern detection with homing pigeon algorithms"""
    
    print("=" * 70)
    print("🕊️  HOMING PIGEON PATTERN DETECTION")
    print("=" * 70)
    
    detector = HomingPigeonPatternDetector()
    
    # Test texts
    test_cases = [
        {
            "text": "You're crazy! That never happened. You're imagining things.",
            "expected": "gaslighting"
        },
        {
            "text": "You're absolutely perfect. I can't live without you. We're soulmates.",
            "expected": "love_bombing"
        },
        {
            "text": "Just a normal conversation with no manipulation.",
            "expected": None
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{'='*70}")
        print(f"Test {i}: {test_case['text'][:50]}...")
        print(f"{'='*70}")
        
        result = detector.analyze_text(test_case["text"])
        
        print(f"\n✅ Detected Pattern: {result['detected_pattern']}")
        print(f"📊 Confidence: {result['confidence']:.2%}")
        
        if result['pattern_info']:
            print(f"📝 Description: {result['pattern_info']['description']}")
            print(f"⚠️  Severity: {result['pattern_info']['severity']}")
        
        print(f"\n🔍 Pattern Scores:")
        for pattern, scores in result['all_pattern_scores'].items():
            print(f"  • {pattern}: {scores['score']:.3f} "
                  f"(matches: {scores['match_count']}, "
                  f"distance: {scores['distance_to_home']:.3f})")
        
        # Verify result
        expected = test_case['expected']
        actual = result['detected_pattern']
        
        if expected == actual:
            print(f"\n✅ PASS: Correctly identified {expected or 'no pattern'}")
        else:
            print(f"\n❌ FAIL: Expected {expected}, got {actual}")


def test_parameter_optimization():
    """Test parameter optimization with gradient following"""
    
    print("\n" + "=" * 70)
    print("⛰️  PARAMETER OPTIMIZATION WITH GRADIENT FOLLOWING")
    print("=" * 70)
    
    # Create synthetic training data
    training_data = [
        {"text": "test1", "pattern": "gaslighting", "indicator_count": 3, "severity": 0.9, "certainty": 0.8},
        {"text": "test2", "pattern": "love_bombing", "indicator_count": 2, "severity": 0.6, "certainty": 0.7},
        {"text": "test3", "pattern": None, "indicator_count": 0, "severity": 0.1, "certainty": 0.2},
        {"text": "test4", "pattern": "gaslighting", "indicator_count": 4, "severity": 0.85, "certainty": 0.9},
        {"text": "test5", "pattern": None, "indicator_count": 1, "severity": 0.2, "certainty": 0.3},
    ]
    
    optimizer = PatternParameterOptimizer(training_data)
    
    # Optimize parameters
    optimal_params, accuracy = optimizer.optimize(initial_params=[1.0, 1.0, 1.0, 1.0])
    
    print(f"\n📈 Optimized Parameters:")
    print(f"  Threshold: {optimal_params[0]:.3f}")
    print(f"  Weight 1 (indicator count): {optimal_params[1]:.3f}")
    print(f"  Weight 2 (severity): {optimal_params[2]:.3f}")
    print(f"  Weight 3 (certainty): {optimal_params[3]:.3f}")
    print(f"  Accuracy: {accuracy:.2%}")


def test_swarm_search():
    """Test swarm-based parameter search"""
    
    print("\n" + "=" * 70)
    print("🐝 SWARM INTELLIGENCE PARAMETER SEARCH")
    print("=" * 70)
    
    # Simple objective: find parameters that maximize a function
    def test_objective(params):
        """Test function with known optimum"""
        threshold, w1, w2, w3 = params
        # Optimum at [1.0, 1.0, 1.0, 1.0]
        return -((threshold-1)**2 + (w1-1)**2 + (w2-1)**2 + (w3-1)**2)
    
    swarm = SwarmPatternSearch(n_agents=10)
    best_params, best_score = swarm.search(test_objective)
    
    print(f"\n📊 Swarm Results:")
    print(f"  Best parameters found: {[f'{p:.3f}' for p in best_params]}")
    print(f"  Best score: {best_score:.4f}")
    print(f"  Distance from true optimum: {sum((p-1)**2 for p in best_params):.4f}")


def main():
    """Run all integration tests"""
    
    print("\n" + "🕊️" * 35)
    print("HOMING PIGEON PATTERN DETECTION INTEGRATION")
    print("🕊️" * 35 + "\n")
    
    # Test 1: Pattern detection with navigation
    test_pigeon_pattern_detection()
    
    # Test 2: Parameter optimization with gradient following
    test_parameter_optimization()
    
    # Test 3: Swarm-based parameter search
    test_swarm_search()
    
    print("\n" + "=" * 70)
    print("✅ All integration tests complete!")
    print("=" * 70)


if __name__ == "__main__":
    main()
