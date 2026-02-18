#!/usr/bin/env python3
"""
Failure Mode Analyzer
Simulates experienced engineer intuition to anticipate common failure scenarios

Philosophy:
- Real software has architecture tradeoffs, side effects, race conditions, memory issues
- Experienced engineers simulate mentally: "What if this runs concurrently?"
- Constraint surfaces become enormous in production systems
- Human accountability comes from compressed experience + responsibility

Module: Extension to reasoning scaffold for failure mode anticipation
"""

from typing import List, Dict, Any, Tuple
from dataclasses import dataclass, field
import logging
from .schemas import (
    TaskSpecification,
    StateSnapshot,
    ReasoningStep
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class FailureMode:
    """Represents a potential failure mode"""
    category: str  # Type of failure
    description: str  # What could go wrong
    severity: str  # low, medium, high, critical
    likelihood: str  # low, medium, high
    trigger_conditions: List[str] = field(default_factory=list)  # When it happens
    symptoms: List[str] = field(default_factory=list)  # How to detect it
    mitigation: str = ""  # How to prevent/handle it
    example_scenario: str = ""  # Concrete example
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "category": self.category,
            "description": self.description,
            "severity": self.severity,
            "likelihood": self.likelihood,
            "trigger_conditions": self.trigger_conditions,
            "symptoms": self.symptoms,
            "mitigation": self.mitigation,
            "example_scenario": self.example_scenario
        }


@dataclass
class FailureModeAnalysis:
    """Complete failure mode analysis result"""
    step_id: int
    identified_failure_modes: List[FailureMode] = field(default_factory=list)
    critical_questions: List[str] = field(default_factory=list)
    risk_score: float = 0.0  # 0-1, higher = more risky
    overall_assessment: str = ""
    recommended_actions: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "step_id": self.step_id,
            "identified_failure_modes": [fm.to_dict() for fm in self.identified_failure_modes],
            "critical_questions": self.critical_questions,
            "risk_score": self.risk_score,
            "overall_assessment": self.overall_assessment,
            "recommended_actions": self.recommended_actions
        }


class FailureModeAnalyzer:
    """
    Analyzes reasoning steps for potential failure modes
    Simulates experienced engineer asking critical "what if" questions
    """
    
    def __init__(self):
        # Database of known failure patterns and heuristics
        self.failure_heuristics = self._build_failure_heuristics()
        
        # Critical questions to ask for each category
        self.critical_questions = {
            "concurrency": [
                "What if this runs concurrently with other operations?",
                "What if two instances try to modify the same state?",
                "Are there race conditions between read and write operations?"
            ],
            "input": [
                "What if the input is malformed or unexpected?",
                "What if the input is empty, null, or at boundary values?",
                "What if the input contains malicious data?"
            ],
            "performance": [
                "What if this operation takes much longer than expected?",
                "What if the state grows very large?",
                "What if there are latency spikes in dependencies?"
            ],
            "integration": [
                "What if external systems are unavailable?",
                "What if external systems return unexpected responses?",
                "What if there are version mismatches between components?"
            ],
            "state": [
                "What if the state is inconsistent or corrupted?",
                "What if state transitions happen in unexpected order?",
                "What if rollback is needed after partial completion?"
            ],
            "resource": [
                "What if resources (memory, disk, connections) are exhausted?",
                "What if there are resource leaks?",
                "What if cleanup fails partway through?"
            ],
            "emergent": [
                "What if components interact in unexpected ways?",
                "What if there are unintended side effects?",
                "What if the system behaves differently at scale?"
            ]
        }
        
    def analyze(
        self,
        task_spec: TaskSpecification,
        state: StateSnapshot,
        step: ReasoningStep
    ) -> FailureModeAnalysis:
        """
        Analyze a reasoning step for potential failure modes
        
        Args:
            task_spec: The task specification
            state: Current state snapshot
            step: The reasoning step to analyze
            
        Returns:
            FailureModeAnalysis with identified failure modes and recommendations
        """
        logger.info(f"Analyzing failure modes for step {step.step_id}")
        
        identified_modes = []
        applicable_questions = []
        
        # Check each failure category
        categories = [
            "concurrency",
            "input",
            "performance",
            "integration",
            "state",
            "resource",
            "emergent"
        ]
        
        for category in categories:
            modes = self._check_category(category, task_spec, state, step)
            if modes:
                identified_modes.extend(modes)
                # Add critical questions for this category
                applicable_questions.extend(self.critical_questions[category])
        
        # Calculate risk score
        risk_score = self._calculate_risk_score(identified_modes)
        
        # Generate overall assessment
        assessment = self._generate_assessment(identified_modes, risk_score)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(identified_modes, risk_score)
        
        analysis = FailureModeAnalysis(
            step_id=step.step_id,
            identified_failure_modes=identified_modes,
            critical_questions=applicable_questions,
            risk_score=risk_score,
            overall_assessment=assessment,
            recommended_actions=recommendations
        )
        
        logger.info(
            f"Failure mode analysis complete: {len(identified_modes)} mode(s), "
            f"risk score: {risk_score:.2f}"
        )
        
        return analysis
    
    def _build_failure_heuristics(self) -> Dict[str, List[Dict[str, Any]]]:
        """Build database of known failure patterns"""
        return {
            "concurrency": [
                {
                    "pattern": ["multiple", "state", "change"],
                    "severity": "high",
                    "description": "Multiple state changes create race condition risk"
                },
                {
                    "pattern": ["update", "read", "modify"],
                    "severity": "medium",
                    "description": "Read-modify-write operations are not atomic"
                },
                {
                    "pattern": ["shared", "resource"],
                    "severity": "high",
                    "description": "Shared resource access without synchronization"
                }
            ],
            "input": [
                {
                    "pattern": ["parse", "input"],
                    "severity": "medium",
                    "description": "Input parsing can fail on malformed data"
                },
                {
                    "pattern": ["external", "data"],
                    "severity": "medium",
                    "description": "External data may not match expected format"
                },
                {
                    "pattern": ["user", "provided"],
                    "severity": "high",
                    "description": "User-provided data needs validation"
                }
            ],
            "performance": [
                {
                    "pattern": ["loop", "iterate"],
                    "severity": "medium",
                    "description": "Loops may perform poorly with large datasets"
                },
                {
                    "pattern": ["search", "find"],
                    "severity": "medium",
                    "description": "Search operations may be slow on large state"
                },
                {
                    "pattern": ["recursive"],
                    "severity": "high",
                    "description": "Recursive operations risk stack overflow"
                }
            ],
            "integration": [
                {
                    "pattern": ["api", "call"],
                    "severity": "high",
                    "description": "API calls may fail or timeout"
                },
                {
                    "pattern": ["external", "service"],
                    "severity": "high",
                    "description": "External services may be unavailable"
                },
                {
                    "pattern": ["network", "remote"],
                    "severity": "medium",
                    "description": "Network operations can experience latency or failures"
                }
            ],
            "state": [
                {
                    "pattern": ["transaction", "rollback"],
                    "severity": "high",
                    "description": "Partial failures need rollback mechanisms"
                },
                {
                    "pattern": ["state", "dependency"],
                    "severity": "medium",
                    "description": "State dependencies may create ordering issues"
                },
                {
                    "pattern": ["consistency"],
                    "severity": "high",
                    "description": "State consistency not guaranteed across operations"
                }
            ],
            "resource": [
                {
                    "pattern": ["allocate", "memory"],
                    "severity": "medium",
                    "description": "Memory allocation may fail under load"
                },
                {
                    "pattern": ["connection", "pool"],
                    "severity": "high",
                    "description": "Connection pools may be exhausted"
                },
                {
                    "pattern": ["file", "handle"],
                    "severity": "medium",
                    "description": "File handles may leak if not properly closed"
                }
            ],
            "emergent": [
                {
                    "pattern": ["complex", "interaction"],
                    "severity": "high",
                    "description": "Complex interactions may have emergent failures"
                },
                {
                    "pattern": ["cascade", "chain"],
                    "severity": "high",
                    "description": "Cascading failures can occur in dependency chains"
                },
                {
                    "pattern": ["scale", "growth"],
                    "severity": "medium",
                    "description": "Behavior may change at different scales"
                }
            ]
        }
    
    def _check_category(
        self,
        category: str,
        task_spec: TaskSpecification,
        state: StateSnapshot,
        step: ReasoningStep
    ) -> List[FailureMode]:
        """Check for failure modes in a specific category"""
        failure_modes = []
        
        # Get heuristics for this category
        heuristics = self.failure_heuristics.get(category, [])
        
        # Combine relevant text from step
        step_text = " ".join([
            step.operation.lower(),
            step.justification.lower(),
            " ".join(step.input_facts).lower(),
            " ".join(step.output_facts).lower()
        ])
        
        # Check each heuristic
        for heuristic in heuristics:
            pattern_keywords = heuristic["pattern"]
            if any(keyword in step_text for keyword in pattern_keywords):
                # Pattern matched, create failure mode
                failure_mode = self._create_failure_mode(
                    category,
                    heuristic,
                    task_spec,
                    state,
                    step
                )
                failure_modes.append(failure_mode)
        
        # Add category-specific checks
        if category == "concurrency":
            failure_modes.extend(self._check_concurrency(task_spec, state, step))
        elif category == "input":
            failure_modes.extend(self._check_input(task_spec, state, step))
        elif category == "performance":
            failure_modes.extend(self._check_performance(task_spec, state, step))
        elif category == "integration":
            failure_modes.extend(self._check_integration(task_spec, state, step))
        elif category == "state":
            failure_modes.extend(self._check_state(task_spec, state, step))
        elif category == "resource":
            failure_modes.extend(self._check_resource(task_spec, state, step))
        elif category == "emergent":
            failure_modes.extend(self._check_emergent(task_spec, state, step))
        
        return failure_modes
    
    def _create_failure_mode(
        self,
        category: str,
        heuristic: Dict[str, Any],
        task_spec: TaskSpecification,
        state: StateSnapshot,
        step: ReasoningStep
    ) -> FailureMode:
        """Create a failure mode from a matched heuristic"""
        return FailureMode(
            category=category,
            description=heuristic["description"],
            severity=heuristic["severity"],
            likelihood="medium",  # Default
            trigger_conditions=[f"Pattern detected in operation: {', '.join(heuristic['pattern'])}"],
            symptoms=[],
            mitigation=self._get_default_mitigation(category),
            example_scenario=""
        )
    
    def _check_concurrency(
        self,
        task_spec: TaskSpecification,
        state: StateSnapshot,
        step: ReasoningStep
    ) -> List[FailureMode]:
        """Check for concurrency-related failure modes"""
        modes = []
        
        # Multiple state changes without ordering
        if len(step.proposed_state_changes) > 1:
            modes.append(FailureMode(
                category="concurrency",
                description="Multiple state changes may create race conditions",
                severity="high",
                likelihood="medium",
                trigger_conditions=["Multiple state changes in single step"],
                symptoms=["Inconsistent state", "Lost updates", "Partial writes"],
                mitigation="Use atomic transactions or explicit ordering",
                example_scenario="Two processes update same fact simultaneously, one update lost"
            ))
        
        # Operations that modify shared state
        if any(keyword in step.operation.lower() for keyword in ['update', 'modify', 'change']):
            if len(state.facts) > 10:  # Shared state exists
                modes.append(FailureMode(
                    category="concurrency",
                    description="State modification without synchronization",
                    severity="medium",
                    likelihood="low",
                    trigger_conditions=["Shared state exists", "Modification operation"],
                    symptoms=["Race conditions", "Data corruption"],
                    mitigation="Add locking or use optimistic concurrency control",
                    example_scenario="Read-modify-write cycle interrupted by concurrent update"
                ))
        
        return modes
    
    def _check_input(
        self,
        task_spec: TaskSpecification,
        state: StateSnapshot,
        step: ReasoningStep
    ) -> List[FailureMode]:
        """Check for input-related failure modes"""
        modes = []
        
        # External input without validation
        if step.input_facts:
            modes.append(FailureMode(
                category="input",
                description="Input data may be malformed or unexpected",
                severity="medium",
                likelihood="medium",
                trigger_conditions=["Input facts present"],
                symptoms=["Parse errors", "Type mismatches", "Unexpected values"],
                mitigation="Add explicit input validation before processing",
                example_scenario="Input contains null when string expected, causing crash"
            ))
        
        # Boundary conditions
        if any(keyword in step.operation.lower() for keyword in ['zero', 'empty', 'maximum', 'minimum']):
            modes.append(FailureMode(
                category="input",
                description="Boundary conditions may not be handled correctly",
                severity="high",
                likelihood="medium",
                trigger_conditions=["Boundary value operations"],
                symptoms=["Divide by zero", "Index out of bounds", "Overflow"],
                mitigation="Explicitly test boundary conditions",
                example_scenario="Division by zero when count is zero"
            ))
        
        return modes
    
    def _check_performance(
        self,
        task_spec: TaskSpecification,
        state: StateSnapshot,
        step: ReasoningStep
    ) -> List[FailureMode]:
        """Check for performance-related failure modes"""
        modes = []
        
        # Large state operations
        if len(state.facts) > 50 or len(state.relations) > 50:
            modes.append(FailureMode(
                category="performance",
                description="Operations on large state may be slow",
                severity="medium",
                likelihood="high",
                trigger_conditions=["Large state space"],
                symptoms=["Slow response times", "Timeouts", "Resource exhaustion"],
                mitigation="Optimize algorithms or add caching",
                example_scenario="Linear search through 10000 facts causes timeout"
            ))
        
        # Long dependency chains
        if len(step.depends_on) > 5:
            modes.append(FailureMode(
                category="performance",
                description="Long dependency chains increase latency",
                severity="low",
                likelihood="medium",
                trigger_conditions=["Many dependencies"],
                symptoms=["Cumulative delays", "Timeout cascades"],
                mitigation="Parallelize independent operations",
                example_scenario="Sequential processing of 10 steps takes too long"
            ))
        
        return modes
    
    def _check_integration(
        self,
        task_spec: TaskSpecification,
        state: StateSnapshot,
        step: ReasoningStep
    ) -> List[FailureMode]:
        """Check for integration-related failure modes"""
        modes = []
        
        # External dependencies
        if any(keyword in str(step.input_facts).lower() for keyword in ['external', 'api', 'service']):
            modes.append(FailureMode(
                category="integration",
                description="External dependencies may be unavailable",
                severity="high",
                likelihood="medium",
                trigger_conditions=["External system dependency"],
                symptoms=["Connection timeouts", "Service unavailable errors"],
                mitigation="Add retry logic and fallback mechanisms",
                example_scenario="External API down causes operation to fail"
            ))
        
        return modes
    
    def _check_state(
        self,
        task_spec: TaskSpecification,
        state: StateSnapshot,
        step: ReasoningStep
    ) -> List[FailureMode]:
        """Check for state-related failure modes"""
        modes = []
        
        # State changes without rollback
        if len(step.proposed_state_changes) > 0:
            modes.append(FailureMode(
                category="state",
                description="Partial failures may leave state inconsistent",
                severity="high",
                likelihood="low",
                trigger_conditions=["State modifications"],
                symptoms=["Inconsistent state", "Orphaned records"],
                mitigation="Implement transaction semantics with rollback",
                example_scenario="First update succeeds, second fails, state inconsistent"
            ))
        
        return modes
    
    def _check_resource(
        self,
        task_spec: TaskSpecification,
        state: StateSnapshot,
        step: ReasoningStep
    ) -> List[FailureMode]:
        """Check for resource-related failure modes"""
        modes = []
        
        # Memory growth
        if len(state.facts) > 100:
            modes.append(FailureMode(
                category="resource",
                description="Large state may cause memory issues",
                severity="medium",
                likelihood="low",
                trigger_conditions=["Growing state size"],
                symptoms=["Out of memory errors", "Slow garbage collection"],
                mitigation="Implement state cleanup or archiving",
                example_scenario="State grows unbounded causing memory exhaustion"
            ))
        
        return modes
    
    def _check_emergent(
        self,
        task_spec: TaskSpecification,
        state: StateSnapshot,
        step: ReasoningStep
    ) -> List[FailureMode]:
        """Check for emergent failure modes"""
        modes = []
        
        # Complex interactions
        if len(step.depends_on) > 3 and len(step.proposed_state_changes) > 1:
            modes.append(FailureMode(
                category="emergent",
                description="Complex interactions may have unexpected effects",
                severity="high",
                likelihood="low",
                trigger_conditions=["Multiple dependencies and state changes"],
                symptoms=["Unexpected behavior", "Side effects"],
                mitigation="Add integration tests for complex scenarios",
                example_scenario="Combination of steps creates unexpected state"
            ))
        
        return modes
    
    def _get_default_mitigation(self, category: str) -> str:
        """Get default mitigation strategy for a category"""
        mitigations = {
            "concurrency": "Add synchronization or use atomic operations",
            "input": "Validate and sanitize all inputs",
            "performance": "Optimize algorithms and add performance testing",
            "integration": "Add retry logic and circuit breakers",
            "state": "Implement proper transaction management",
            "resource": "Monitor resource usage and implement limits",
            "emergent": "Add comprehensive integration testing"
        }
        return mitigations.get(category, "Review and test thoroughly")
    
    def _calculate_risk_score(self, failure_modes: List[FailureMode]) -> float:
        """Calculate overall risk score from failure modes"""
        if not failure_modes:
            return 0.0
        
        severity_weights = {
            "low": 0.2,
            "medium": 0.5,
            "high": 0.8,
            "critical": 1.0
        }
        
        likelihood_weights = {
            "low": 0.3,
            "medium": 0.6,
            "high": 0.9
        }
        
        total_risk = 0.0
        for mode in failure_modes:
            severity_score = severity_weights.get(mode.severity, 0.5)
            likelihood_score = likelihood_weights.get(mode.likelihood, 0.5)
            risk = severity_score * likelihood_score
            total_risk += risk
        
        # Normalize to 0-1 range (cap at 1.0)
        normalized_risk = min(1.0, total_risk / len(failure_modes))
        return normalized_risk
    
    def _generate_assessment(self, failure_modes: List[FailureMode], risk_score: float) -> str:
        """Generate overall assessment"""
        if not failure_modes:
            return "✓ No significant failure modes identified. Step appears robust."
        
        critical = [m for m in failure_modes if m.severity == "critical"]
        high = [m for m in failure_modes if m.severity == "high"]
        
        if critical:
            return f"⚠ CRITICAL: {len(critical)} critical failure mode(s) identified. Immediate attention required."
        elif high:
            return f"⚠ HIGH RISK: {len(high)} high-severity failure mode(s) identified. Review and mitigation recommended."
        elif risk_score > 0.6:
            return f"⚠ MODERATE RISK: {len(failure_modes)} failure mode(s) identified. Consider mitigation strategies."
        else:
            return f"✓ LOW RISK: {len(failure_modes)} minor failure mode(s) identified. Monitor during testing."
    
    def _generate_recommendations(self, failure_modes: List[FailureMode], risk_score: float) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        if not failure_modes:
            recommendations.append("Continue with standard testing procedures")
            return recommendations
        
        # Group by category
        by_category = {}
        for mode in failure_modes:
            if mode.category not in by_category:
                by_category[mode.category] = []
            by_category[mode.category].append(mode)
        
        # Generate recommendations per category
        for category, modes in by_category.items():
            if category == "concurrency":
                recommendations.append("Add concurrency tests and consider atomic operations")
            elif category == "input":
                recommendations.append("Implement comprehensive input validation")
            elif category == "performance":
                recommendations.append("Add performance benchmarks and load testing")
            elif category == "integration":
                recommendations.append("Implement retry logic and fallback mechanisms")
            elif category == "state":
                recommendations.append("Design rollback procedures for state changes")
            elif category == "resource":
                recommendations.append("Monitor resource usage and set limits")
            elif category == "emergent":
                recommendations.append("Create integration tests for complex scenarios")
        
        # Risk-based recommendations
        if risk_score > 0.7:
            recommendations.append("Consider breaking into smaller, safer steps")
        
        if any(m.severity == "critical" for m in failure_modes):
            recommendations.append("Seek senior review before proceeding")
        
        return recommendations


# Self-test
if __name__ == "__main__":
    print("Testing FailureModeAnalyzer...")
    
    from .schemas import TaskSpecification, StateSnapshot, ReasoningStep, StateChange, Fact, Relation
    
    # Create test data with potential failure modes
    task_spec = TaskSpecification(
        task_id="test-task-1",
        natural_language="Update external API data with concurrent access",
        domain="test",
        goal="Test goal"
    )
    
    # Large state to trigger performance checks
    state = StateSnapshot(
        task_id="test-task-1",
        facts=[Fact(id=f"f{i}", content=f"fact {i}", source_step_id=1) for i in range(60)],
        relations=[Relation(id=f"r{i}", type="test", from_id=f"f{i}", to_id=f"f{i+1}") for i in range(55)]
    )
    
    # Step with multiple failure risk factors
    step = ReasoningStep(
        step_id=2,
        task_id="test-task-1",
        agent_role="solver",
        operation="update external API and modify shared state concurrently",
        justification="Need to sync data",
        confidence=0.7,
        depends_on=[1],
        input_facts=["external API data", "user provided input"],
        proposed_state_changes=[
            StateChange(type="add_fact", fact="new fact 1"),
            StateChange(type="update_fact", fact="updated fact 2")
        ]
    )
    
    # Run failure mode analysis
    analyzer = FailureModeAnalyzer()
    analysis = analyzer.analyze(task_spec, state, step)
    
    print("\n=== Failure Mode Analysis Result ===")
    print(f"Risk Score: {analysis.risk_score:.2f}")
    print(f"\nOverall Assessment:\n{analysis.overall_assessment}")
    print(f"\nIdentified Failure Modes: {len(analysis.identified_failure_modes)}")
    for mode in analysis.identified_failure_modes:
        print(f"\n  Category: {mode.category}")
        print(f"  Severity: {mode.severity} | Likelihood: {mode.likelihood}")
        print(f"  Description: {mode.description}")
        if mode.mitigation:
            print(f"  Mitigation: {mode.mitigation}")
    
    print(f"\nCritical Questions ({len(analysis.critical_questions)}):")
    for i, question in enumerate(analysis.critical_questions[:5], 1):  # Show first 5
        print(f"  {i}. {question}")
    
    print(f"\nRecommended Actions:")
    for i, action in enumerate(analysis.recommended_actions, 1):
        print(f"  {i}. {action}")
    
    print("\n✓ FailureModeAnalyzer self-test passed")
