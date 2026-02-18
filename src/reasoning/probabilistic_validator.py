#!/usr/bin/env python3
"""
Probabilistic Validation Layer
Wraps deterministic constraint validation with probability estimation

Acknowledges: "Validation reduces error probability but does not guarantee correctness"

Module: Extension to 4.2 (DCE) from specification
"""

from typing import List, Dict, Any, Tuple, Optional
from dataclasses import dataclass, field
import logging
import math
from .schemas import (
    TaskSpecification,
    StateSnapshot,
    ReasoningStep,
    VerificationResult
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class ProbabilisticResult:
    """
    Probabilistic validation result
    Extends deterministic validation with probability estimates
    """
    deterministic_status: str  # from DCE: accepted/rejected/needs_revision
    validation_probability: float  # Estimated probability validation is correct [0, 1]
    confidence_scores: Dict[str, float] = field(default_factory=dict)  # Per-aspect confidence
    uncertainty_factors: List[str] = field(default_factory=list)  # Sources of uncertainty
    edge_case_risks: List[Dict[str, Any]] = field(default_factory=list)  # Identified edge cases
    applicable_limitations: List[str] = field(default_factory=list)  # Known limitations
    human_readable_interpretation: str = ""
    combined_recommendation: str = ""  # accept/reject/human_review
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "deterministic_status": self.deterministic_status,
            "validation_probability": self.validation_probability,
            "confidence_scores": self.confidence_scores,
            "uncertainty_factors": self.uncertainty_factors,
            "edge_case_risks": self.edge_case_risks,
            "applicable_limitations": self.applicable_limitations,
            "human_readable_interpretation": self.human_readable_interpretation,
            "combined_recommendation": self.combined_recommendation
        }


class ProbabilisticValidator:
    """
    Probabilistic validation layer that wraps deterministic constraints
    
    Philosophy:
    - Validation is probabilistic, not absolute
    - Real-world systems have architecture tradeoffs, side effects, race conditions
    - Constraint surfaces become enormous in production
    - Human intuition and failure mode anticipation are critical
    """
    
    def __init__(self):
        self.complexity_weights = {
            "low": 0.95,      # Simple operations: high confidence
            "medium": 0.80,   # Moderate complexity: good confidence
            "high": 0.60,     # Complex operations: moderate confidence
            "very_high": 0.40 # Very complex: low confidence
        }
        
        self.known_limitations = {
            "concurrency": "Validation cannot detect race conditions or concurrent access issues",
            "performance": "Validation cannot predict performance characteristics or resource usage",
            "side_effects": "Validation cannot detect unintended side effects in complex systems",
            "emergent_behavior": "Validation cannot predict emergent behaviors from component interactions",
            "external_dependencies": "Validation cannot verify external system behavior or availability",
            "state_complexity": "Validation becomes less reliable as state complexity increases",
            "temporal_issues": "Validation cannot detect timing-dependent bugs or edge cases"
        }
        
    def validate(
        self,
        task_spec: TaskSpecification,
        state: StateSnapshot,
        step: ReasoningStep,
        deterministic_result: VerificationResult
    ) -> ProbabilisticResult:
        """
        Perform probabilistic validation analysis
        
        Args:
            task_spec: The task specification
            state: Current state snapshot
            step: The reasoning step being validated
            deterministic_result: Result from deterministic constraint engine
            
        Returns:
            ProbabilisticResult with confidence scores and uncertainty analysis
        """
        logger.info(f"Running probabilistic validation for step {step.step_id}")
        
        # Calculate base probability from deterministic result
        base_probability = self._calculate_base_probability(deterministic_result)
        
        # Assess complexity and adjust probability
        complexity_score = self._assess_complexity(task_spec, state, step)
        complexity_adjustment = self._get_complexity_adjustment(complexity_score)
        
        # Identify uncertainty factors
        uncertainty_factors = self._identify_uncertainty_factors(
            task_spec, state, step, deterministic_result
        )
        
        # Calculate per-aspect confidence scores
        confidence_scores = self._calculate_confidence_scores(
            task_spec, state, step, deterministic_result, complexity_score
        )
        
        # Identify edge case risks
        edge_case_risks = self._identify_edge_cases(task_spec, state, step)
        
        # Determine applicable limitations
        applicable_limitations = self._determine_limitations(task_spec, state, step)
        
        # Calculate final validation probability
        validation_probability = self._calculate_validation_probability(
            base_probability,
            complexity_adjustment,
            confidence_scores,
            len(uncertainty_factors),
            len(edge_case_risks)
        )
        
        # Generate human-readable interpretation
        interpretation = self._generate_interpretation(
            deterministic_result.status,
            validation_probability,
            confidence_scores,
            uncertainty_factors,
            edge_case_risks
        )
        
        # Make combined recommendation
        recommendation = self._make_recommendation(
            deterministic_result.status,
            validation_probability,
            edge_case_risks
        )
        
        result = ProbabilisticResult(
            deterministic_status=deterministic_result.status,
            validation_probability=validation_probability,
            confidence_scores=confidence_scores,
            uncertainty_factors=uncertainty_factors,
            edge_case_risks=edge_case_risks,
            applicable_limitations=[
                self.known_limitations[lim] for lim in applicable_limitations
            ],
            human_readable_interpretation=interpretation,
            combined_recommendation=recommendation
        )
        
        logger.info(
            f"Probabilistic validation complete: {recommendation} "
            f"(probability: {validation_probability:.2f})"
        )
        
        return result
    
    def _calculate_base_probability(self, deterministic_result: VerificationResult) -> float:
        """Calculate base probability from deterministic result"""
        if deterministic_result.status == "accepted":
            return 0.90  # High confidence for accepted steps
        elif deterministic_result.status == "needs_revision":
            return 0.50  # Medium confidence for steps needing revision
        else:  # rejected
            return 0.10  # Low confidence for rejected steps
    
    def _assess_complexity(
        self,
        task_spec: TaskSpecification,
        state: StateSnapshot,
        step: ReasoningStep
    ) -> str:
        """Assess complexity of the reasoning step"""
        complexity_score = 0
        
        # Factor 1: Number of state changes
        complexity_score += len(step.proposed_state_changes) * 2
        
        # Factor 2: Number of dependencies
        complexity_score += len(step.depends_on) * 1
        
        # Factor 3: Number of relations in current state
        complexity_score += len(state.relations) * 0.5
        
        # Factor 4: Number of constraints
        complexity_score += len(task_spec.constraints) * 1.5
        
        # Factor 5: Operation complexity heuristics
        operation_lower = step.operation.lower()
        if any(keyword in operation_lower for keyword in ['concurrent', 'async', 'parallel']):
            complexity_score += 10
        if any(keyword in operation_lower for keyword in ['complex', 'intricate', 'advanced']):
            complexity_score += 5
        
        # Classify complexity
        if complexity_score < 5:
            return "low"
        elif complexity_score < 15:
            return "medium"
        elif complexity_score < 30:
            return "high"
        else:
            return "very_high"
    
    def _get_complexity_adjustment(self, complexity_score: str) -> float:
        """Get probability adjustment factor based on complexity"""
        return self.complexity_weights.get(complexity_score, 0.50)
    
    def _identify_uncertainty_factors(
        self,
        task_spec: TaskSpecification,
        state: StateSnapshot,
        step: ReasoningStep,
        deterministic_result: VerificationResult
    ) -> List[str]:
        """Identify sources of uncertainty in validation"""
        factors = []
        
        # Large state space increases uncertainty
        if len(state.facts) > 50:
            factors.append("Large state space reduces validation reliability")
        
        # Many constraints increase uncertainty
        if len(task_spec.constraints) > 10:
            factors.append("Complex constraint set may have undetected interactions")
        
        # Low confidence from LLM
        if step.confidence < 0.5:
            factors.append("Low LLM confidence indicates uncertainty in reasoning")
        
        # Many violated constraints (even if eventually accepted)
        if len(deterministic_result.violated_constraints) > 3:
            factors.append("Multiple constraint violations suggest edge case scenario")
        
        # Dependencies create uncertainty
        if len(step.depends_on) > 5:
            factors.append("Long dependency chain increases risk of cascading errors")
        
        # Complex justification may indicate uncertainty
        if len(step.justification) > 500:
            factors.append("Complex justification may indicate uncertain reasoning")
        
        # Concurrent or async operations
        if 'concurrent' in step.operation.lower() or 'async' in step.operation.lower():
            factors.append("Concurrent operations have timing-dependent behavior")
        
        return factors
    
    def _calculate_confidence_scores(
        self,
        task_spec: TaskSpecification,
        state: StateSnapshot,
        step: ReasoningStep,
        deterministic_result: VerificationResult,
        complexity_score: str
    ) -> Dict[str, float]:
        """Calculate confidence scores for different aspects"""
        scores = {}
        
        # Structural confidence (based on schema validation)
        scores["structural"] = 0.95 if step.operation and step.justification else 0.60
        
        # Logical confidence (based on constraint satisfaction)
        if deterministic_result.status == "accepted":
            scores["logical"] = 0.90
        elif len(deterministic_result.violated_constraints) == 0:
            scores["logical"] = 0.75
        else:
            scores["logical"] = 0.30
        
        # Dependency confidence
        if len(step.depends_on) == 0:
            scores["dependency"] = 0.95
        elif len(step.depends_on) < 3:
            scores["dependency"] = 0.80
        else:
            scores["dependency"] = 0.60
        
        # State change confidence
        if len(step.proposed_state_changes) == 0:
            scores["state_change"] = 0.95  # No changes = high confidence
        elif len(step.proposed_state_changes) < 3:
            scores["state_change"] = 0.80
        else:
            scores["state_change"] = 0.60
        
        # LLM confidence (from the step itself)
        scores["llm_confidence"] = step.confidence
        
        # Complexity confidence (inverse of complexity)
        scores["complexity"] = self.complexity_weights[complexity_score]
        
        return scores
    
    def _identify_edge_cases(
        self,
        task_spec: TaskSpecification,
        state: StateSnapshot,
        step: ReasoningStep
    ) -> List[Dict[str, Any]]:
        """Identify potential edge cases that validation might miss"""
        edge_cases = []
        
        # Edge case 1: Concurrent access
        if 'concurrent' in step.operation.lower() or len(step.proposed_state_changes) > 1:
            edge_cases.append({
                "type": "concurrency",
                "description": "Multiple state changes may create race conditions",
                "severity": "medium",
                "mitigation": "Consider adding synchronization or ordering constraints"
            })
        
        # Edge case 2: Boundary conditions
        for change in step.proposed_state_changes:
            if isinstance(change.fact, str) and any(
                keyword in change.fact.lower() 
                for keyword in ['zero', 'empty', 'null', 'maximum', 'minimum']
            ):
                edge_cases.append({
                    "type": "boundary_condition",
                    "description": f"Boundary condition detected: {change.fact[:50]}...",
                    "severity": "low",
                    "mitigation": "Verify behavior at boundaries"
                })
        
        # Edge case 3: State explosion
        if len(state.relations) > 100:
            edge_cases.append({
                "type": "state_complexity",
                "description": "Large state space may hide undetected constraint violations",
                "severity": "high",
                "mitigation": "Consider state space reduction or partitioning"
            })
        
        # Edge case 4: Long dependency chains
        if len(step.depends_on) > 7:
            edge_cases.append({
                "type": "dependency_chain",
                "description": "Long dependency chain increases risk of cascading failures",
                "severity": "medium",
                "mitigation": "Break into smaller independent steps if possible"
            })
        
        # Edge case 5: External references
        if any('external' in fact.lower() for fact in step.input_facts):
            edge_cases.append({
                "type": "external_dependency",
                "description": "External dependencies cannot be validated",
                "severity": "high",
                "mitigation": "Add runtime checks for external system availability"
            })
        
        return edge_cases
    
    def _determine_limitations(
        self,
        task_spec: TaskSpecification,
        state: StateSnapshot,
        step: ReasoningStep
    ) -> List[str]:
        """Determine which known limitations apply to this validation"""
        applicable = []
        
        # Check each limitation
        if 'concurrent' in step.operation.lower():
            applicable.append("concurrency")
        
        if any(perf_keyword in step.operation.lower() 
               for perf_keyword in ['optimize', 'performance', 'speed', 'scale']):
            applicable.append("performance")
        
        if len(step.proposed_state_changes) > 2:
            applicable.append("side_effects")
        
        if len(state.relations) > 50:
            applicable.append("emergent_behavior")
            applicable.append("state_complexity")
        
        if any('external' in fact.lower() for fact in step.input_facts):
            applicable.append("external_dependencies")
        
        if 'time' in step.operation.lower() or 'schedule' in step.operation.lower():
            applicable.append("temporal_issues")
        
        return applicable
    
    def _calculate_validation_probability(
        self,
        base_probability: float,
        complexity_adjustment: float,
        confidence_scores: Dict[str, float],
        uncertainty_count: int,
        edge_case_count: int
    ) -> float:
        """Calculate final validation probability"""
        # Start with base probability
        probability = base_probability
        
        # Apply complexity adjustment
        probability *= complexity_adjustment
        
        # Average confidence scores and blend with probability
        if confidence_scores:
            avg_confidence = sum(confidence_scores.values()) / len(confidence_scores)
            probability = (probability + avg_confidence) / 2
        
        # Reduce probability for each uncertainty factor
        uncertainty_penalty = 0.02 * uncertainty_count
        probability *= (1 - uncertainty_penalty)
        
        # Reduce probability for each edge case
        edge_case_penalty = 0.03 * edge_case_count
        probability *= (1 - edge_case_penalty)
        
        # Clamp to [0, 1]
        return max(0.0, min(1.0, probability))
    
    def _generate_interpretation(
        self,
        deterministic_status: str,
        validation_probability: float,
        confidence_scores: Dict[str, float],
        uncertainty_factors: List[str],
        edge_case_risks: List[Dict[str, Any]]
    ) -> str:
        """Generate human-readable interpretation"""
        interpretation = []
        
        # Overall assessment
        if deterministic_status == "accepted" and validation_probability > 0.8:
            interpretation.append("✓ High confidence: Deterministic validation passed with strong probability.")
        elif deterministic_status == "accepted" and validation_probability > 0.6:
            interpretation.append("⚠ Moderate confidence: Deterministic validation passed but some uncertainty exists.")
        elif deterministic_status == "accepted":
            interpretation.append("⚠ Low confidence: Deterministic validation passed but significant uncertainties detected.")
        elif deterministic_status == "needs_revision":
            interpretation.append("⚠ Needs revision: Step requires changes before acceptance.")
        else:
            interpretation.append("✗ Rejected: Step violates constraints.")
        
        # Confidence breakdown
        if confidence_scores:
            low_confidence_aspects = [
                aspect for aspect, score in confidence_scores.items() 
                if score < 0.6
            ]
            if low_confidence_aspects:
                interpretation.append(
                    f"Low confidence in: {', '.join(low_confidence_aspects)}"
                )
        
        # Uncertainty summary
        if uncertainty_factors:
            interpretation.append(
                f"{len(uncertainty_factors)} uncertainty factor(s) identified"
            )
        
        # Edge case summary
        if edge_case_risks:
            high_severity = [ec for ec in edge_case_risks if ec["severity"] == "high"]
            if high_severity:
                interpretation.append(
                    f"⚠ {len(high_severity)} high-severity edge case(s) detected"
                )
        
        # Disclaimer
        interpretation.append(
            "Note: Validation reduces error probability but does not guarantee correctness."
        )
        
        return " ".join(interpretation)
    
    def _make_recommendation(
        self,
        deterministic_status: str,
        validation_probability: float,
        edge_case_risks: List[Dict[str, Any]]
    ) -> str:
        """Make combined recommendation"""
        # Check for high-severity edge cases
        high_severity_count = sum(
            1 for ec in edge_case_risks if ec["severity"] == "high"
        )
        
        if deterministic_status == "rejected":
            return "reject"
        
        if deterministic_status == "needs_revision":
            return "needs_revision"
        
        # Deterministic status is "accepted"
        if validation_probability > 0.8 and high_severity_count == 0:
            return "accept"
        elif validation_probability > 0.6 and high_severity_count < 2:
            return "accept_with_caution"
        else:
            return "human_review"


# Self-test
if __name__ == "__main__":
    print("Testing ProbabilisticValidator...")
    
    from .schemas import TaskSpecification, StateSnapshot, ReasoningStep, VerificationResult, StateChange, Fact
    
    # Create test data
    task_spec = TaskSpecification(
        task_id="test-task-1",
        natural_language="Test task",
        domain="test",
        goal="Test goal"
    )
    
    state = StateSnapshot(
        task_id="test-task-1",
        facts=[Fact(id="f1", content="test fact", source_step_id=1)],
        relations=[]
    )
    
    step = ReasoningStep(
        step_id=2,
        task_id="test-task-1",
        agent_role="solver",
        operation="test_operation",
        justification="Test justification",
        confidence=0.8,
        proposed_state_changes=[
            StateChange(type="add_fact", fact="new test fact")
        ]
    )
    
    deterministic_result = VerificationResult(
        task_id="test-task-1",
        step_id=2,
        verifier_id="test_verifier",
        status="accepted",
        reasons=[],
        violated_constraints=[]
    )
    
    # Run probabilistic validation
    validator = ProbabilisticValidator()
    result = validator.validate(task_spec, state, step, deterministic_result)
    
    print("\n=== Probabilistic Validation Result ===")
    print(f"Deterministic Status: {result.deterministic_status}")
    print(f"Validation Probability: {result.validation_probability:.2f}")
    print(f"Recommendation: {result.combined_recommendation}")
    print(f"\nConfidence Scores:")
    for aspect, score in result.confidence_scores.items():
        print(f"  {aspect}: {score:.2f}")
    print(f"\nUncertainty Factors: {len(result.uncertainty_factors)}")
    for factor in result.uncertainty_factors:
        print(f"  - {factor}")
    print(f"\nEdge Cases: {len(result.edge_case_risks)}")
    for edge_case in result.edge_case_risks:
        print(f"  - {edge_case['type']}: {edge_case['description']}")
    print(f"\nInterpretation:\n{result.human_readable_interpretation}")
    
    print("\n✓ ProbabilisticValidator self-test passed")
