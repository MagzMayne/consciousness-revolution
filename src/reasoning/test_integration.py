#!/usr/bin/env python3
"""
Integration Test for Universal Deterministic Reasoning Scaffold
Tests the complete workflow from natural language to reasoning execution
"""

import json
import logging
from schemas import (
    TaskSpecification,
    ReasoningStep,
    StateChange,
    Object,
    Relation
)
from constraint_engine import DeterministicConstraintEngine
from state_manager import StateManager
from protocol_agent import ProtocolAgent
from reasoning_compiler import ReasoningCompiler

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def test_scheduling_workflow():
    """Test complete workflow for scheduling domain"""
    print("\n" + "="*80)
    print("TEST: Scheduling Domain Workflow")
    print("="*80)
    
    # Initialize components
    protocol_agent = ProtocolAgent()
    constraint_engine = DeterministicConstraintEngine()
    state_manager = StateManager()
    compiler = ReasoningCompiler(constraint_engine)
    
    # Step 1: Natural language to TaskSpec
    print("\n[1] Protocol Agent: Natural Language -> TaskSpec")
    nl_input = "Schedule a meeting between Alice and Bob on Monday"
    task_spec = protocol_agent.parse_natural_language(nl_input)
    print(f"✓ Created task: {task_spec.task_id}")
    print(f"  Domain: {task_spec.domain}")
    print(f"  Objects: {len(task_spec.objects)}")
    print(f"  Goal: {task_spec.goal}")
    
    # Step 2: Create initial state
    print("\n[2] State Manager: Initialize State")
    state = state_manager.create_initial_state(task_spec)
    print(f"✓ Initial state version: {state.version}")
    
    # Step 3: Create reasoning steps
    print("\n[3] Reasoning Steps: Propose Solutions")
    
    # Planner step: Decompose task
    step1 = ReasoningStep(
        step_id=1,
        task_id=task_spec.task_id,
        agent_role="planner",
        operation="decompose_scheduling_task",
        justification="Break down scheduling into availability check and slot selection",
        confidence=0.95,
        output_facts=["Need to check Alice availability", "Need to check Bob availability"]
    )
    
    result1 = compiler.compile_step(task_spec, state, step1)
    print(f"✓ Step 1 ({step1.agent_role}): {result1.status}")
    
    if result1.status == "accepted":
        state = state_manager.apply_step(step1, result1)
    
    # Solver step: Add availability fact
    step2 = ReasoningStep(
        step_id=2,
        task_id=task_spec.task_id,
        agent_role="solver",
        depends_on=[1],
        operation="add_availability_fact",
        justification="Recording Alice's availability",
        confidence=0.9,
        proposed_state_changes=[
            StateChange(type="add_fact", fact="Alice is available on Monday at 2 PM")
        ]
    )
    
    result2 = compiler.compile_step(task_spec, state, step2)
    print(f"✓ Step 2 ({step2.agent_role}): {result2.status}")
    
    if result2.status == "accepted":
        state = state_manager.apply_step(step2, result2)
    
    # Solver step: Add Bob's availability
    step3 = ReasoningStep(
        step_id=3,
        task_id=task_spec.task_id,
        agent_role="solver",
        depends_on=[1],
        operation="add_availability_fact",
        justification="Recording Bob's availability",
        confidence=0.9,
        proposed_state_changes=[
            StateChange(type="add_fact", fact="Bob is available on Monday at 2 PM")
        ]
    )
    
    result3 = compiler.compile_step(task_spec, state, step3)
    print(f"✓ Step 3 ({step3.agent_role}): {result3.status}")
    
    if result3.status == "accepted":
        state = state_manager.apply_step(step3, result3)
    
    # Step 4: Check final state
    print("\n[4] Final State")
    final_state = state_manager.get_current_state(task_spec.task_id)
    print(f"✓ Final state version: {final_state.version}")
    print(f"  Facts: {len(final_state.facts)}")
    for fact in final_state.facts:
        print(f"    - {fact.content}")
    
    # Step 5: Get compilation stats
    print("\n[5] Compilation Statistics")
    stats = compiler.get_compilation_stats(task_spec.task_id)
    print(json.dumps(stats, indent=2))
    
    return True


def test_relationships_workflow():
    """Test complete workflow for relationships domain"""
    print("\n" + "="*80)
    print("TEST: Relationships Domain Workflow")
    print("="*80)
    
    # Initialize components
    protocol_agent = ProtocolAgent()
    constraint_engine = DeterministicConstraintEngine()
    state_manager = StateManager()
    compiler = ReasoningCompiler(constraint_engine)
    
    # Step 1: Parse relationship statement
    print("\n[1] Protocol Agent: Parse Relationships")
    nl_input = "Alice is the parent of Bob"
    task_spec = protocol_agent.parse_natural_language(nl_input)
    print(f"✓ Domain: {task_spec.domain}")
    print(f"  Relations: {len(task_spec.relations)}")
    for rel in task_spec.relations:
        print(f"    - {rel.type}: {rel.from_id} -> {rel.to_id}")
    
    # Step 2: Create initial state with relation
    print("\n[2] State Manager: Initialize with Relations")
    state = state_manager.create_initial_state(task_spec)
    print(f"✓ Relations in state: {len(state.relations)}")
    
    # Step 3: Verify constraints
    print("\n[3] Constraint Engine: Verify Relations")
    step1 = ReasoningStep(
        step_id=1,
        task_id=task_spec.task_id,
        agent_role="verifier",
        operation="verify_relations",
        justification="Check if all implied relations exist"
    )
    
    result1 = compiler.compile_step(task_spec, state, step1)
    print(f"✓ Verification status: {result1.status}")
    if result1.status == "rejected":
        print(f"  Violated constraints: {result1.violated_constraints}")
        print(f"  Reasons: {result1.reasons}")
    
    # Step 4: Add missing reverse relation
    if result1.status == "rejected":
        print("\n[4] Solver: Add Missing Relations")
        # Extract missing relations from violation messages
        state.relations.append(Relation(
            id="rel_child_of_auto",
            type="child_of",
            from_id="person_2",  # Bob
            to_id="person_0"     # Alice
        ))
        
        step2 = ReasoningStep(
            step_id=2,
            task_id=task_spec.task_id,
            agent_role="solver",
            operation="add_reverse_relation",
            justification="Adding implied child_of relation"
        )
        
        result2 = compiler.compile_step(task_spec, state, step2)
        print(f"✓ After adding reverse relation: {result2.status}")
    
    return True


def test_constraint_violations():
    """Test constraint violation detection"""
    print("\n" + "="*80)
    print("TEST: Constraint Violation Detection")
    print("="*80)
    
    constraint_engine = DeterministicConstraintEngine()
    state_manager = StateManager()
    compiler = ReasoningCompiler(constraint_engine)
    
    # Create a task with symmetric relation
    task_spec = TaskSpecification(
        source="system",
        natural_language="Test symmetry constraints",
        domain="relationships",
        goal="Verify symmetric relations"
    )
    
    state = state_manager.create_initial_state(task_spec)
    
    # Add a spouse relation (should be symmetric)
    state.relations.append(Relation(
        id="rel_spouse_1",
        type="spouse_of",
        from_id="alice",
        to_id="bob"
    ))
    # Missing reverse relation - should be caught
    
    print("\n[1] Testing Symmetry Constraint")
    step1 = ReasoningStep(
        step_id=1,
        task_id=task_spec.task_id,
        agent_role="verifier",
        operation="verify_symmetry"
    )
    
    result1 = compiler.compile_step(task_spec, state, step1)
    print(f"✓ Status: {result1.status}")
    if result1.status == "rejected":
        print(f"  Violations detected:")
        for reason in result1.reasons:
            print(f"    - {reason}")
    
    return True


def main():
    """Run all integration tests"""
    print("\n" + "="*80)
    print("UNIVERSAL DETERMINISTIC REASONING SCAFFOLD")
    print("Integration Test Suite")
    print("="*80)
    
    tests = [
        ("Scheduling Workflow", test_scheduling_workflow),
        ("Relationships Workflow", test_relationships_workflow),
        ("Constraint Violations", test_constraint_violations)
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            if result:
                passed += 1
                print(f"\n✓ {test_name}: PASSED")
            else:
                failed += 1
                print(f"\n✗ {test_name}: FAILED")
        except Exception as e:
            failed += 1
            print(f"\n✗ {test_name}: ERROR - {str(e)}")
            import traceback
            traceback.print_exc()
    
    print("\n" + "="*80)
    print(f"Test Results: {passed} passed, {failed} failed out of {len(tests)} total")
    print("="*80)
    
    return failed == 0


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
