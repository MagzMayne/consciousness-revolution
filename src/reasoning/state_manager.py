#!/usr/bin/env python3
"""
State Manager
Owns the canonical world state with version history

Module: 4.6 from specification
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid
import logging
from .schemas import (
    TaskSpecification,
    ReasoningStep,
    StateSnapshot,
    VerificationResult,
    Fact,
    Relation
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class StateManager:
    """
    State Manager - owns canonical world state
    
    Module: 4.6 from specification
    
    Responsibilities:
    - Own the canonical world state
    - Maintain full version history
    - Only apply accepted reasoning steps
    - Provide diff queries for agents
    """
    
    def __init__(self):
        self.states: Dict[str, List[StateSnapshot]] = {}  # task_id -> list of states
        self.current_version: Dict[str, int] = {}  # task_id -> current version
        logger.info("State Manager initialized")
    
    def create_initial_state(self, task_spec: TaskSpecification) -> StateSnapshot:
        """Create initial state for a task"""
        state = StateSnapshot(
            task_id=task_spec.task_id,
            facts=[],
            relations=task_spec.relations.copy(),
            version=1
        )
        
        if task_spec.task_id not in self.states:
            self.states[task_spec.task_id] = []
            self.current_version[task_spec.task_id] = 0
        
        self.states[task_spec.task_id].append(state)
        self.current_version[task_spec.task_id] = 1
        
        logger.info(f"Created initial state for task {task_spec.task_id}")
        return state
    
    def get_current_state(self, task_id: str) -> Optional[StateSnapshot]:
        """Get current state for a task"""
        if task_id not in self.states or len(self.states[task_id]) == 0:
            return None
        return self.states[task_id][-1]
    
    def get_state_version(self, task_id: str, version: int) -> Optional[StateSnapshot]:
        """Get a specific version of state"""
        if task_id not in self.states:
            return None
        
        states = self.states[task_id]
        for state in states:
            if state.version == version:
                return state
        return None
    
    def get_state_history(self, task_id: str) -> List[StateSnapshot]:
        """Get full state history for a task"""
        return self.states.get(task_id, [])
    
    def apply_step(
        self,
        step: ReasoningStep,
        verification: VerificationResult
    ) -> Optional[StateSnapshot]:
        """
        Apply an accepted reasoning step to create new state
        
        Rules:
        - Only apply steps with status = "accepted"
        - Create new state version
        - Maintain full version history
        
        Args:
            step: The reasoning step to apply
            verification: The verification result
        
        Returns:
            New state snapshot if applied, None otherwise
        """
        # Only apply accepted steps
        if verification.status != "accepted":
            logger.warning(f"Cannot apply step {step.step_id}: status is {verification.status}")
            return None
        
        # Get current state
        current_state = self.get_current_state(step.task_id)
        if current_state is None:
            logger.error(f"No state found for task {step.task_id}")
            return None
        
        # Create new state by copying current state
        new_state = StateSnapshot(
            state_id=str(uuid.uuid4()),
            task_id=step.task_id,
            facts=current_state.facts.copy(),
            relations=current_state.relations.copy(),
            version=current_state.version + 1,
            timestamp=datetime.utcnow().isoformat() + "Z"
        )
        
        # Apply state changes from the step
        for change in step.proposed_state_changes:
            if change.type == "add_fact":
                # Add new fact
                fact = Fact(
                    id=f"fact_{step.step_id}_{len(new_state.facts)}",
                    content=change.fact,
                    source_step_id=step.step_id
                )
                new_state.facts.append(fact)
                logger.debug(f"Added fact: {fact.id}")
            
            elif change.type == "update_fact":
                # Update existing fact
                # In a real implementation, you'd have a way to identify which fact to update
                logger.debug(f"Update fact: {change.fact}")
            
            elif change.type == "delete_fact":
                # Remove fact
                # In a real implementation, you'd have a way to identify which fact to delete
                logger.debug(f"Delete fact: {change.fact}")
        
        # Store new state
        self.states[step.task_id].append(new_state)
        self.current_version[step.task_id] = new_state.version
        
        logger.info(f"Applied step {step.step_id}, created state version {new_state.version}")
        return new_state
    
    def get_state_diff(
        self,
        task_id: str,
        from_version: int,
        to_version: int
    ) -> Dict[str, Any]:
        """
        Get differences between two state versions
        
        Args:
            task_id: The task ID
            from_version: Starting version
            to_version: Ending version
        
        Returns:
            Dictionary with added/removed/changed facts and relations
        """
        from_state = self.get_state_version(task_id, from_version)
        to_state = self.get_state_version(task_id, to_version)
        
        if from_state is None or to_state is None:
            return {"error": "Invalid version numbers"}
        
        # Calculate differences
        from_fact_ids = {f.id for f in from_state.facts}
        to_fact_ids = {f.id for f in to_state.facts}
        
        added_facts = [f for f in to_state.facts if f.id not in from_fact_ids]
        removed_facts = [f for f in from_state.facts if f.id not in to_fact_ids]
        
        from_rel_ids = {r.id for r in from_state.relations}
        to_rel_ids = {r.id for r in to_state.relations}
        
        added_relations = [r for r in to_state.relations if r.id not in from_rel_ids]
        removed_relations = [r for r in from_state.relations if r.id not in to_rel_ids]
        
        return {
            "from_version": from_version,
            "to_version": to_version,
            "added_facts": [f.to_dict() for f in added_facts],
            "removed_facts": [f.to_dict() for f in removed_facts],
            "added_relations": [r.to_dict() for r in added_relations],
            "removed_relations": [r.to_dict() for r in removed_relations]
        }
    
    def get_stats(self) -> Dict[str, Any]:
        """Get statistics about managed states"""
        return {
            "total_tasks": len(self.states),
            "total_states": sum(len(states) for states in self.states.values()),
            "tasks": {
                task_id: {
                    "versions": len(states),
                    "current_version": self.current_version.get(task_id, 0)
                }
                for task_id, states in self.states.items()
            }
        }


if __name__ == "__main__":
    # Test the state manager
    from .schemas import Object, StateChange
    
    print("Testing State Manager...")
    
    # Create state manager
    manager = StateManager()
    
    # Create a test task
    task = TaskSpecification(
        source="user",
        natural_language="Test state management",
        domain="testing",
        goal="Verify state transitions",
        objects=[
            Object(id="obj_1", type="TestObject", attributes={"name": "Test"}),
        ]
    )
    
    # Create initial state
    state_v1 = manager.create_initial_state(task)
    print(f"\n✓ Initial state created: version {state_v1.version}")
    
    # Create a reasoning step with state changes
    step1 = ReasoningStep(
        step_id=1,
        task_id=task.task_id,
        agent_role="solver",
        operation="add_fact",
        proposed_state_changes=[
            StateChange(type="add_fact", fact="The sky is blue")
        ]
    )
    
    # Create verification result (accepted)
    verification1 = VerificationResult(
        task_id=task.task_id,
        step_id=1,
        verifier_id="test",
        status="accepted"
    )
    
    # Apply step
    state_v2 = manager.apply_step(step1, verification1)
    print(f"✓ Step 1 applied: version {state_v2.version if state_v2 else 'N/A'}")
    print(f"✓ Facts in state: {len(state_v2.facts if state_v2 else [])}")
    
    # Get state diff
    diff = manager.get_state_diff(task.task_id, 1, 2)
    print(f"\n✓ State diff (v1 -> v2):")
    print(f"  - Added facts: {len(diff.get('added_facts', []))}")
    
    # Get stats
    stats = manager.get_stats()
    print(f"\n✓ State Manager Stats:")
    import json
    print(json.dumps(stats, indent=2))
    
    print("\n✓ State Manager test complete!")
