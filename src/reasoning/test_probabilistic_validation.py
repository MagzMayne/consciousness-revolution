#!/usr/bin/env python3
"""
Test Suite for Probabilistic Validation and Failure Mode Analysis
"""

import sys
sys.path.insert(0, 'src')

from reasoning.schemas import (
    TaskSpecification,
    StateSnapshot,
    ReasoningStep,
    StateChange,
    Fact,
    Relation,
    VerificationResult
)
from reasoning.constraint_engine import DeterministicConstraintEngine
from reasoning.reasoning_compiler import ReasoningCompiler
from reasoning.probabilistic_validator import ProbabilisticValidator
from reasoning.failure_mode_analyzer import FailureModeAnalyzer


def test_probabilistic_validator():
    """Test probabilistic validator standalone"""
    print("\n" + "="*70)
    print("TEST 1: Probabilistic Validator")
    print("="*70)
    
    # Create test data
    task_spec = TaskSpecification(
        task_id='test-task-1',
        natural_language='Simple test task',
        domain='test',
        goal='Test goal'
    )
    
    state = StateSnapshot(
        task_id='test-task-1',
        facts=[Fact(id='f1', content='test fact', source_step_id=1)],
        relations=[]
    )
    
    step = ReasoningStep(
        step_id=2,
        task_id='test-task-1',
        agent_role='solver',
        operation='simple_operation',
        justification='Test justification',
        confidence=0.85,
        proposed_state_changes=[
            StateChange(type='add_fact', fact='new test fact')
        ]
    )
    
    deterministic_result = VerificationResult(
        task_id='test-task-1',
        step_id=2,
        verifier_id='test_verifier',
        status='accepted',
        reasons=['Step valid'],
        violated_constraints=[]
    )
    
    # Run probabilistic validation
    validator = ProbabilisticValidator()
    result = validator.validate(task_spec, state, step, deterministic_result)
    
    print(f"✓ Probabilistic validation completed")
    print(f"  Validation Probability: {result.validation_probability:.2f}")
    print(f"  Recommendation: {result.combined_recommendation}")
    print(f"  Confidence Scores: {len(result.confidence_scores)} aspects")
    print(f"  Uncertainty Factors: {len(result.uncertainty_factors)}")
    print(f"  Edge Cases: {len(result.edge_case_risks)}")
    print(f"  Interpretation: {result.human_readable_interpretation[:100]}...")
    
    assert result.validation_probability > 0.0
    assert result.combined_recommendation in ['accept', 'accept_with_caution', 'human_review', 'reject', 'needs_revision']
    print("✓ All assertions passed")


def test_failure_mode_analyzer():
    """Test failure mode analyzer standalone"""
    print("\n" + "="*70)
    print("TEST 2: Failure Mode Analyzer")
    print("="*70)
    
    # Create test data with potential failure modes
    task_spec = TaskSpecification(
        task_id='test-task-2',
        natural_language='Complex concurrent operation with external API',
        domain='test',
        goal='Test goal'
    )
    
    # Large state to trigger warnings
    state = StateSnapshot(
        task_id='test-task-2',
        facts=[Fact(id=f'f{i}', content=f'fact {i}', source_step_id=1) for i in range(60)],
        relations=[Relation(id=f'r{i}', type='test', from_id=f'f{i}', to_id=f'f{i+1}') for i in range(55)]
    )
    
    # Step with multiple failure risk factors
    step = ReasoningStep(
        step_id=2,
        task_id='test-task-2',
        agent_role='solver',
        operation='concurrent update of shared state with external API call',
        justification='Complex operation',
        confidence=0.6,
        depends_on=[1],
        input_facts=['external API data', 'user input'],
        proposed_state_changes=[
            StateChange(type='add_fact', fact='fact 1'),
            StateChange(type='update_fact', fact='fact 2')
        ]
    )
    
    # Run failure mode analysis
    analyzer = FailureModeAnalyzer()
    analysis = analyzer.analyze(task_spec, state, step)
    
    print(f"✓ Failure mode analysis completed")
    print(f"  Risk Score: {analysis.risk_score:.2f}")
    print(f"  Identified Failure Modes: {len(analysis.identified_failure_modes)}")
    print(f"  Critical Questions: {len(analysis.critical_questions)}")
    print(f"  Recommended Actions: {len(analysis.recommended_actions)}")
    print(f"  Assessment: {analysis.overall_assessment[:80]}...")
    
    assert analysis.risk_score >= 0.0 and analysis.risk_score <= 1.0
    assert len(analysis.identified_failure_modes) > 0  # Should detect issues
    assert len(analysis.critical_questions) > 0
    print("✓ All assertions passed")


def test_integrated_reasoning_compiler():
    """Test integrated reasoning compiler with all enhancements"""
    print("\n" + "="*70)
    print("TEST 3: Integrated Reasoning Compiler")
    print("="*70)
    
    # Create components
    constraint_engine = DeterministicConstraintEngine()
    compiler = ReasoningCompiler(
        constraint_engine,
        enable_probabilistic_validation=True,
        enable_failure_mode_analysis=True
    )
    
    # Create test data
    task_spec = TaskSpecification(
        task_id='test-task-3',
        natural_language='Schedule meeting between Alice and Bob',
        domain='scheduling',
        goal='Schedule meeting'
    )
    
    state = StateSnapshot(
        task_id='test-task-3',
        facts=[],
        relations=[]
    )
    
    step = ReasoningStep(
        step_id=1,
        task_id='test-task-3',
        agent_role='solver',
        operation='add_availability',
        justification='Recording availability for Alice',
        confidence=0.9,
        proposed_state_changes=[
            StateChange(type='add_fact', fact='Alice available Monday 2pm')
        ]
    )
    
    # Compile step
    result = compiler.compile_step(task_spec, state, step)
    
    print(f"✓ Step compiled with status: {result.status}")
    print(f"  Reasons: {len(result.reasons)}")
    print(f"  Violated Constraints: {len(result.violated_constraints)}")
    
    # Check probabilistic analysis
    assert result.probabilistic_analysis is not None
    print(f"✓ Probabilistic analysis present")
    if 'error' not in result.probabilistic_analysis:
        print(f"  Validation Probability: {result.probabilistic_analysis['validation_probability']:.2f}")
        print(f"  Recommendation: {result.probabilistic_analysis['combined_recommendation']}")
    
    # Check failure mode analysis
    assert result.failure_mode_analysis is not None
    print(f"✓ Failure mode analysis present")
    if 'error' not in result.failure_mode_analysis:
        print(f"  Risk Score: {result.failure_mode_analysis['risk_score']:.2f}")
        print(f"  Failure Modes: {len(result.failure_mode_analysis['identified_failure_modes'])}")
    
    print("✓ All assertions passed")


def test_compiler_without_enhancements():
    """Test compiler with enhancements disabled"""
    print("\n" + "="*70)
    print("TEST 4: Compiler with Enhancements Disabled")
    print("="*70)
    
    # Create components with enhancements disabled
    constraint_engine = DeterministicConstraintEngine()
    compiler = ReasoningCompiler(
        constraint_engine,
        enable_probabilistic_validation=False,
        enable_failure_mode_analysis=False
    )
    
    task_spec = TaskSpecification(
        task_id='test-task-4',
        natural_language='Simple task',
        domain='test',
        goal='Test'
    )
    
    state = StateSnapshot(
        task_id='test-task-4',
        facts=[],
        relations=[]
    )
    
    step = ReasoningStep(
        step_id=1,
        task_id='test-task-4',
        agent_role='solver',
        operation='simple_op',
        justification='Simple justification',
        confidence=0.8,
        proposed_state_changes=[]
    )
    
    result = compiler.compile_step(task_spec, state, step)
    
    print(f"✓ Step compiled with status: {result.status}")
    print(f"  Probabilistic analysis: {result.probabilistic_analysis}")
    print(f"  Failure mode analysis: {result.failure_mode_analysis}")
    
    assert result.probabilistic_analysis is None
    assert result.failure_mode_analysis is None
    print("✓ Enhancements correctly disabled")


def test_complex_scenario():
    """Test complex scenario with multiple risk factors"""
    print("\n" + "="*70)
    print("TEST 5: Complex High-Risk Scenario")
    print("="*70)
    
    constraint_engine = DeterministicConstraintEngine()
    compiler = ReasoningCompiler(
        constraint_engine,
        enable_probabilistic_validation=True,
        enable_failure_mode_analysis=True
    )
    
    # Complex task with many constraints
    task_spec = TaskSpecification(
        task_id='test-task-5',
        natural_language='Complex concurrent operation with multiple external dependencies',
        domain='workflow',
        goal='Coordinate complex workflow',
        constraints=[
            'no_overlapping_operations',
            'external_api_available',
            'atomic_transactions',
            'consistent_state',
            'performance_sla_met'
        ]
    )
    
    # Large complex state
    state = StateSnapshot(
        task_id='test-task-5',
        facts=[Fact(id=f'f{i}', content=f'complex fact {i}', source_step_id=0) for i in range(120)],
        relations=[Relation(id=f'r{i}', type='depends_on', from_id=f'f{i}', to_id=f'f{i+1}') for i in range(100)]
    )
    
    # High-risk operation
    step = ReasoningStep(
        step_id=10,
        task_id='test-task-5',
        agent_role='solver',
        operation='concurrent update of shared state with external API calls and recursive processing',
        justification='Complex multi-step operation with external dependencies',
        confidence=0.5,  # Low confidence
        depends_on=[1, 2, 3, 4, 5, 6, 7, 8, 9],  # Many dependencies
        input_facts=['external API 1', 'external API 2', 'user input', 'database state'],
        proposed_state_changes=[
            StateChange(type='add_fact', fact='new state 1'),
            StateChange(type='update_fact', fact='updated state 2'),
            StateChange(type='add_fact', fact='new state 3'),
            StateChange(type='update_fact', fact='updated state 4')
        ]
    )
    
    result = compiler.compile_step(task_spec, state, step)
    
    print(f"✓ Complex scenario compiled: {result.status}")
    
    # Analyze results
    if result.probabilistic_analysis and 'error' not in result.probabilistic_analysis:
        prob = result.probabilistic_analysis['validation_probability']
        recommendation = result.probabilistic_analysis['combined_recommendation']
        print(f"  Validation Probability: {prob:.2f}")
        print(f"  Recommendation: {recommendation}")
        print(f"  Uncertainty Factors: {len(result.probabilistic_analysis['uncertainty_factors'])}")
        print(f"  Edge Cases: {len(result.probabilistic_analysis['edge_case_risks'])}")
        
        # Should have low confidence due to complexity
        assert prob < 0.9, "Expected low probability for complex risky operation"
        assert recommendation in ['human_review', 'accept_with_caution', 'needs_revision']
    
    if result.failure_mode_analysis and 'error' not in result.failure_mode_analysis:
        risk_score = result.failure_mode_analysis['risk_score']
        failure_modes = result.failure_mode_analysis['identified_failure_modes']
        print(f"  Risk Score: {risk_score:.2f}")
        print(f"  Failure Modes: {len(failure_modes)}")
        print(f"  Recommendations: {len(result.failure_mode_analysis['recommended_actions'])}")
        
        # Should identify multiple failure modes
        assert len(failure_modes) > 5, "Expected multiple failure modes for complex operation"
        assert risk_score > 0.3, "Expected high risk score"
    
    print("✓ Complex scenario handled appropriately")


def run_all_tests():
    """Run all test cases"""
    print("\n" + "="*70)
    print("PROBABILISTIC VALIDATION & FAILURE MODE ANALYSIS TEST SUITE")
    print("="*70)
    
    tests = [
        test_probabilistic_validator,
        test_failure_mode_analyzer,
        test_integrated_reasoning_compiler,
        test_compiler_without_enhancements,
        test_complex_scenario
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            test()
            passed += 1
        except Exception as e:
            print(f"\n✗ TEST FAILED: {test.__name__}")
            print(f"  Error: {e}")
            import traceback
            traceback.print_exc()
            failed += 1
    
    print("\n" + "="*70)
    print(f"TEST SUMMARY: {passed} passed, {failed} failed")
    print("="*70)
    
    if failed == 0:
        print("✓ ALL TESTS PASSED")
        return 0
    else:
        print(f"✗ {failed} TESTS FAILED")
        return 1


if __name__ == "__main__":
    exit_code = run_all_tests()
    sys.exit(exit_code)
