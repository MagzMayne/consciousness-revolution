#!/usr/bin/env python3
"""
Demo: Enhanced Failure Mode Detection
Showcases the probabilistic validation and failure mode analysis capabilities
"""

import sys
sys.path.insert(0, 'src')

from reasoning.schemas import (
    TaskSpecification,
    StateSnapshot,
    ReasoningStep,
    StateChange,
    Fact,
    Relation
)
from reasoning.constraint_engine import DeterministicConstraintEngine
from reasoning.reasoning_compiler import ReasoningCompiler


def print_divider(title=""):
    """Print a formatted divider"""
    if title:
        print(f"\n{'='*70}")
        print(f"{title.center(70)}")
        print('='*70)
    else:
        print('-'*70)


def print_result(result):
    """Pretty print verification result"""
    print(f"\n📋 DETERMINISTIC VALIDATION")
    print(f"  Status: {result.status}")
    print(f"  Reasons: {', '.join(result.reasons) if result.reasons else 'None'}")
    if result.violated_constraints:
        print(f"  Violated Constraints: {', '.join(result.violated_constraints)}")
    
    if result.probabilistic_analysis and 'error' not in result.probabilistic_analysis:
        pa = result.probabilistic_analysis
        print(f"\n🎲 PROBABILISTIC ANALYSIS")
        print(f"  Validation Probability: {pa['validation_probability']:.2%}")
        print(f"  Recommendation: {pa['combined_recommendation'].upper()}")
        
        print(f"\n  Confidence Scores:")
        for aspect, score in pa['confidence_scores'].items():
            bar = '█' * int(score * 20)
            print(f"    {aspect:20s} {score:.2f} {bar}")
        
        if pa['uncertainty_factors']:
            print(f"\n  ⚠️  Uncertainty Factors ({len(pa['uncertainty_factors'])}):")
            for factor in pa['uncertainty_factors']:
                print(f"    • {factor}")
        
        if pa['edge_case_risks']:
            print(f"\n  ⚠️  Edge Case Risks ({len(pa['edge_case_risks'])}):")
            for risk in pa['edge_case_risks'][:3]:  # Show top 3
                print(f"    • [{risk['severity'].upper()}] {risk['type']}: {risk['description']}")
                print(f"      Mitigation: {risk['mitigation']}")
        
        if pa['applicable_limitations']:
            print(f"\n  ℹ️  Known Limitations ({len(pa['applicable_limitations'])}):")
            for lim in pa['applicable_limitations'][:2]:  # Show top 2
                print(f"    • {lim}")
    
    if result.failure_mode_analysis and 'error' not in result.failure_mode_analysis:
        fa = result.failure_mode_analysis
        print(f"\n🔍 FAILURE MODE ANALYSIS")
        print(f"  Risk Score: {fa['risk_score']:.2f}/1.0")
        print(f"  Overall Assessment: {fa['overall_assessment']}")
        
        if fa['identified_failure_modes']:
            print(f"\n  Identified Failure Modes ({len(fa['identified_failure_modes'])}):")
            
            # Group by severity
            by_severity = {}
            for mode in fa['identified_failure_modes']:
                severity = mode['severity']
                if severity not in by_severity:
                    by_severity[severity] = []
                by_severity[severity].append(mode)
            
            for severity in ['critical', 'high', 'medium', 'low']:
                if severity in by_severity:
                    modes = by_severity[severity]
                    print(f"\n    [{severity.upper()}] {len(modes)} mode(s):")
                    for mode in modes[:2]:  # Show top 2 per severity
                        print(f"      • {mode['category']}: {mode['description']}")
        
        if fa['critical_questions']:
            print(f"\n  🤔 Critical Questions ({len(fa['critical_questions'])}):")
            for question in fa['critical_questions'][:3]:  # Show top 3
                print(f"    • {question}")
        
        if fa['recommended_actions']:
            print(f"\n  ✅ Recommended Actions:")
            for action in fa['recommended_actions']:
                print(f"    • {action}")


def demo_simple_safe_operation():
    """Demo 1: Simple, safe operation - should pass with high confidence"""
    print_divider("DEMO 1: Simple Safe Operation")
    
    constraint_engine = DeterministicConstraintEngine()
    compiler = ReasoningCompiler(
        constraint_engine,
        enable_probabilistic_validation=True,
        enable_failure_mode_analysis=True
    )
    
    task_spec = TaskSpecification(
        task_id='demo-1',
        natural_language='Record a simple fact',
        domain='test',
        goal='Add a fact to the knowledge base'
    )
    
    state = StateSnapshot(
        task_id='demo-1',
        facts=[],
        relations=[]
    )
    
    step = ReasoningStep(
        step_id=1,
        task_id='demo-1',
        agent_role='solver',
        operation='add_fact',
        justification='Recording a simple, isolated fact with no dependencies',
        confidence=0.95,
        proposed_state_changes=[
            StateChange(type='add_fact', fact='The sky is blue')
        ]
    )
    
    result = compiler.compile_step(task_spec, state, step)
    print_result(result)


def demo_moderate_risk_operation():
    """Demo 2: Moderate risk operation with some concerns"""
    print_divider("DEMO 2: Moderate Risk Operation")
    
    constraint_engine = DeterministicConstraintEngine()
    compiler = ReasoningCompiler(
        constraint_engine,
        enable_probabilistic_validation=True,
        enable_failure_mode_analysis=True
    )
    
    task_spec = TaskSpecification(
        task_id='demo-2',
        natural_language='Update external data source',
        domain='integration',
        goal='Sync with external API'
    )
    
    state = StateSnapshot(
        task_id='demo-2',
        facts=[Fact(id=f'f{i}', content=f'existing fact {i}', source_step_id=0) for i in range(20)],
        relations=[]
    )
    
    step = ReasoningStep(
        step_id=2,
        task_id='demo-2',
        agent_role='solver',
        operation='update external API data',
        justification='Syncing local state with external service',
        confidence=0.75,
        depends_on=[1],
        input_facts=['external API endpoint', 'user data'],
        proposed_state_changes=[
            StateChange(type='update_fact', fact='synced_timestamp'),
            StateChange(type='add_fact', fact='api_response_data')
        ]
    )
    
    result = compiler.compile_step(task_spec, state, step)
    print_result(result)


def demo_high_risk_complex_operation():
    """Demo 3: High risk, complex operation - should flag multiple concerns"""
    print_divider("DEMO 3: High-Risk Complex Operation")
    
    constraint_engine = DeterministicConstraintEngine()
    compiler = ReasoningCompiler(
        constraint_engine,
        enable_probabilistic_validation=True,
        enable_failure_mode_analysis=True
    )
    
    task_spec = TaskSpecification(
        task_id='demo-3',
        natural_language='Concurrent multi-step workflow with external dependencies',
        domain='workflow',
        goal='Execute complex distributed transaction',
        constraints=[
            'atomic_transaction',
            'no_concurrent_writes',
            'external_apis_available',
            'rollback_on_failure',
            'performance_sla'
        ]
    )
    
    # Large complex state
    state = StateSnapshot(
        task_id='demo-3',
        facts=[Fact(id=f'f{i}', content=f'complex fact {i}', source_step_id=0) for i in range(150)],
        relations=[Relation(id=f'r{i}', type='depends_on', from_id=f'f{i}', to_id=f'f{i+1}') for i in range(100)]
    )
    
    step = ReasoningStep(
        step_id=10,
        task_id='demo-3',
        agent_role='solver',
        operation='concurrent update of shared state with recursive processing and external API calls',
        justification='Complex distributed operation requiring coordination across multiple services',
        confidence=0.55,  # Low confidence
        depends_on=[1, 2, 3, 4, 5, 6, 7, 8, 9],  # Long dependency chain
        input_facts=[
            'external payment API',
            'external inventory API',
            'user shopping cart',
            'database transaction state',
            'cache state'
        ],
        proposed_state_changes=[
            StateChange(type='update_fact', fact='payment_status'),
            StateChange(type='update_fact', fact='inventory_reserved'),
            StateChange(type='add_fact', fact='order_created'),
            StateChange(type='update_fact', fact='cache_invalidated'),
            StateChange(type='add_fact', fact='notification_queued')
        ]
    )
    
    result = compiler.compile_step(task_spec, state, step)
    print_result(result)


def main():
    """Run all demos"""
    print("\n" + "="*70)
    print("ENHANCED FAILURE MODE DETECTION DEMO".center(70))
    print("Probabilistic Validation & Failure Mode Analysis".center(70))
    print("="*70)
    
    try:
        demo_simple_safe_operation()
        input("\nPress Enter to continue to Demo 2...")
        
        demo_moderate_risk_operation()
        input("\nPress Enter to continue to Demo 3...")
        
        demo_high_risk_complex_operation()
        
        print_divider()
        print("\n✅ Demo Complete!")
        print("\nKey Observations:")
        print("  • Simple operations get high confidence and minimal warnings")
        print("  • Moderate risk operations get appropriate cautions")
        print("  • Complex operations trigger detailed failure mode analysis")
        print("  • System provides actionable recommendations at all risk levels")
        print("\nPhilosophy: 'Validation reduces error probability but does not guarantee correctness'")
        print_divider()
        
    except KeyboardInterrupt:
        print("\n\nDemo interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Error in demo: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
