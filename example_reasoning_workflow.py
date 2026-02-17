#!/usr/bin/env python3
"""
Example: Complete Reasoning Workflow
Demonstrates end-to-end usage of the Universal Deterministic Reasoning Scaffold
"""

import sys
sys.path.insert(0, 'src')

from reasoning.protocol_agent import ProtocolAgent
from reasoning.constraint_engine import DeterministicConstraintEngine
from reasoning.state_manager import StateManager
from reasoning.reasoning_compiler import ReasoningCompiler
from reasoning.schemas import ReasoningStep, StateChange
import json


def example_scheduling_task():
    """
    Example: Schedule a meeting between two people
    Demonstrates protocol parsing, state management, and step validation
    """
    print("\n" + "="*80)
    print("EXAMPLE: Scheduling Workflow")
    print("="*80)
    
    # Initialize the system
    print("\n[1] Initialize System Components")
    protocol_agent = ProtocolAgent()
    constraint_engine = DeterministicConstraintEngine()
    state_manager = StateManager()
    compiler = ReasoningCompiler(constraint_engine)
    print("✓ All components initialized")
    
    # Parse natural language request
    print("\n[2] Parse Natural Language Request")
    natural_language = "Schedule a meeting between Alice and Bob on Monday at 2 PM"
    print(f"Input: \"{natural_language}\"")
    
    task_spec = protocol_agent.parse_natural_language(natural_language)
    print(f"✓ Created TaskSpec:")
    print(f"  - Task ID: {task_spec.task_id}")
    print(f"  - Domain: {task_spec.domain}")
    print(f"  - Goal: {task_spec.goal}")
    print(f"  - Objects: {len(task_spec.objects)}")
    for obj in task_spec.objects:
        print(f"    • {obj.type}: {obj.attributes.get('name', obj.attributes.get('value', 'N/A'))}")
    
    # Create initial state
    print("\n[3] Create Initial State")
    state = state_manager.create_initial_state(task_spec)
    print(f"✓ State version {state.version} created")
    print(f"  - Facts: {len(state.facts)}")
    print(f"  - Relations: {len(state.relations)}")
    
    # Step 1: Planner decomposes task
    print("\n[4] Reasoning Step 1: Planner Decomposes Task")
    step1 = ReasoningStep(
        step_id=1,
        task_id=task_spec.task_id,
        agent_role="planner",
        operation="decompose_scheduling_task",
        justification="Break down meeting scheduling into subtasks: check availability, find common slot, book meeting",
        confidence=0.95,
        output_facts=[
            "Need to check Alice availability on Monday",
            "Need to check Bob availability on Monday",
            "Need to find common time slot at 2 PM"
        ]
    )
    
    verification1 = compiler.compile_step(task_spec, state, step1)
    print(f"✓ Verification: {verification1.status}")
    print(f"  - Reasons: {verification1.reasons}")
    
    if verification1.status == "accepted":
        state = state_manager.apply_step(step1, verification1)
        print(f"  - New state version: {state.version}")
    
    # Step 2: Solver records Alice's availability
    print("\n[5] Reasoning Step 2: Solver Records Alice's Availability")
    step2 = ReasoningStep(
        step_id=2,
        task_id=task_spec.task_id,
        agent_role="solver",
        depends_on=[1],
        operation="record_availability",
        justification="Alice has confirmed availability for Monday at 2 PM",
        confidence=0.9,
        proposed_state_changes=[
            StateChange(
                type="add_fact",
                fact="Alice is available on Monday at 2:00 PM"
            )
        ]
    )
    
    verification2 = compiler.compile_step(task_spec, state, step2)
    print(f"✓ Verification: {verification2.status}")
    
    if verification2.status == "accepted":
        state = state_manager.apply_step(step2, verification2)
        print(f"  - New state version: {state.version}")
        print(f"  - Total facts: {len(state.facts)}")
    
    # Step 3: Solver records Bob's availability
    print("\n[6] Reasoning Step 3: Solver Records Bob's Availability")
    step3 = ReasoningStep(
        step_id=3,
        task_id=task_spec.task_id,
        agent_role="solver",
        depends_on=[1],
        operation="record_availability",
        justification="Bob has confirmed availability for Monday at 2 PM",
        confidence=0.9,
        proposed_state_changes=[
            StateChange(
                type="add_fact",
                fact="Bob is available on Monday at 2:00 PM"
            )
        ]
    )
    
    verification3 = compiler.compile_step(task_spec, state, step3)
    print(f"✓ Verification: {verification3.status}")
    
    if verification3.status == "accepted":
        state = state_manager.apply_step(step3, verification3)
        print(f"  - New state version: {state.version}")
        print(f"  - Total facts: {len(state.facts)}")
    
    # Step 4: Verifier confirms meeting can be scheduled
    print("\n[7] Reasoning Step 4: Verifier Confirms Meeting Feasibility")
    step4 = ReasoningStep(
        step_id=4,
        task_id=task_spec.task_id,
        agent_role="verifier",
        depends_on=[2, 3],
        operation="verify_meeting_feasibility",
        justification="Both Alice and Bob are available at the requested time",
        confidence=1.0,
        output_facts=[
            "Meeting can be scheduled for Monday at 2:00 PM"
        ]
    )
    
    verification4 = compiler.compile_step(task_spec, state, step4)
    print(f"✓ Verification: {verification4.status}")
    
    # Final state summary
    print("\n[8] Final State Summary")
    final_state = state_manager.get_current_state(task_spec.task_id)
    print(f"✓ Final state version: {final_state.version}")
    print(f"  - Total facts: {len(final_state.facts)}")
    print(f"  - Facts added:")
    for fact in final_state.facts:
        print(f"    • {fact.content} (from step {fact.source_step_id})")
    
    # Compilation statistics
    print("\n[9] Compilation Statistics")
    stats = compiler.get_compilation_stats(task_spec.task_id)
    print(f"✓ Compilation stats:")
    print(f"  - Total steps: {stats['total_steps']}")
    print(f"  - Accepted: {stats['accepted']}")
    print(f"  - Rejected: {stats['rejected']}")
    print(f"  - Needs revision: {stats['needs_revision']}")
    print(f"  - Acceptance rate: {stats['acceptance_rate']}")
    
    # State history
    print("\n[10] State Version History")
    history = state_manager.get_state_history(task_spec.task_id)
    print(f"✓ Total versions: {len(history)}")
    for i, hist_state in enumerate(history):
        print(f"  - Version {hist_state.version}: {len(hist_state.facts)} facts")
    
    return task_spec.task_id


def example_relationships_task():
    """
    Example: Family relationship reasoning
    Demonstrates constraint enforcement for bidirectional relations
    """
    print("\n" + "="*80)
    print("EXAMPLE: Relationships Workflow")
    print("="*80)
    
    # Initialize
    print("\n[1] Initialize Components")
    protocol_agent = ProtocolAgent()
    constraint_engine = DeterministicConstraintEngine()
    state_manager = StateManager()
    compiler = ReasoningCompiler(constraint_engine)
    print("✓ Components initialized")
    
    # Parse family relationship
    print("\n[2] Parse Family Relationship")
    natural_language = "Alice is the parent of Bob"
    print(f"Input: \"{natural_language}\"")
    
    task_spec = protocol_agent.parse_natural_language(natural_language)
    print(f"✓ Domain: {task_spec.domain}")
    print(f"  - Objects: {len(task_spec.objects)}")
    print(f"  - Relations: {len(task_spec.relations)}")
    for rel in task_spec.relations:
        print(f"    • {rel.type}: {rel.from_id} -> {rel.to_id}")
    
    # Create initial state
    print("\n[3] Create Initial State with Relations")
    state = state_manager.create_initial_state(task_spec)
    print(f"✓ State created with {len(state.relations)} relations")
    
    # Verify - should detect missing reverse relation
    print("\n[4] Verify Constraints")
    step1 = ReasoningStep(
        step_id=1,
        task_id=task_spec.task_id,
        agent_role="verifier",
        operation="verify_family_relations",
        justification="Check if all implied relations exist"
    )
    
    verification = compiler.compile_step(task_spec, state, step1)
    print(f"✓ Verification status: {verification.status}")
    
    if verification.status == "rejected":
        print(f"  - Violated constraints: {verification.violated_constraints}")
        print(f"  - Issues found:")
        for reason in verification.reasons:
            print(f"    • {reason}")
        print(f"\nℹ The constraint engine detected that parent_of(Alice, Bob)")
        print(f"  implies child_of(Bob, Alice) which is missing!")
    
    return task_spec.task_id


def example_state_diff():
    """
    Example: State diff queries
    Demonstrates version control and state comparison
    """
    print("\n" + "="*80)
    print("EXAMPLE: State Diff Queries")
    print("="*80)
    
    # Initialize
    protocol_agent = ProtocolAgent()
    state_manager = StateManager()
    compiler = ReasoningCompiler(DeterministicConstraintEngine())
    
    # Create task and state
    task_spec = protocol_agent.parse_natural_language("Test state versioning")
    state = state_manager.create_initial_state(task_spec)
    
    print(f"\n[1] Initial State: Version {state.version}")
    print(f"  - Facts: {len(state.facts)}")
    
    # Add several facts through steps
    for i in range(1, 4):
        step = ReasoningStep(
            step_id=i,
            task_id=task_spec.task_id,
            agent_role="solver",
            operation=f"add_fact_{i}",
            justification=f"Adding fact {i}",
            confidence=0.9,
            proposed_state_changes=[
                StateChange(type="add_fact", fact=f"Fact number {i}")
            ]
        )
        
        verification = compiler.compile_step(task_spec, state, step)
        if verification.status == "accepted":
            state = state_manager.apply_step(step, verification)
            print(f"\n[{i+1}] After Step {i}: Version {state.version}")
            print(f"  - Facts: {len(state.facts)}")
    
    # Query state diff
    print("\n[5] State Diff Query")
    diff = state_manager.get_state_diff(task_spec.task_id, from_version=1, to_version=4)
    print(f"✓ Diff from version 1 to 4:")
    print(f"  - Added facts: {len(diff['added_facts'])}")
    for fact in diff['added_facts']:
        print(f"    • {fact['content']}")
    
    # Statistics
    stats = state_manager.get_stats()
    print(f"\n[6] State Manager Statistics")
    print(f"✓ Stats:")
    print(json.dumps(stats, indent=2))


def main():
    """Run all examples"""
    print("\n" + "="*80)
    print("UNIVERSAL DETERMINISTIC REASONING SCAFFOLD")
    print("Complete Usage Examples")
    print("="*80)
    
    print("\nThese examples demonstrate:")
    print("  1. Natural language parsing to structured TaskSpec")
    print("  2. State management with version control")
    print("  3. Reasoning step validation and compilation")
    print("  4. Constraint enforcement (symmetry, implication, etc.)")
    print("  5. Complete audit trail of reasoning process")
    
    # Run examples
    example_scheduling_task()
    example_relationships_task()
    example_state_diff()
    
    print("\n" + "="*80)
    print("All examples completed successfully!")
    print("="*80)
    print("\nKey Takeaways:")
    print("  • LLMs only propose changes; scaffold validates deterministically")
    print("  • Complete state history with version control")
    print("  • Logical constraints automatically enforced")
    print("  • Multi-domain support (scheduling, relationships, etc.)")
    print("  • Full audit trail for debugging and verification")
    print("\nFor more information, see: src/reasoning/README.md")


if __name__ == "__main__":
    main()
