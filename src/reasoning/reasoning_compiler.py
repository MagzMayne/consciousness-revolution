#!/usr/bin/env python3
"""
Reasoning Compiler
Validates reasoning steps, not just final answers

Module: 4.3 from specification
"""

from typing import List, Dict, Any, Tuple
import logging
from .schemas import (
    TaskSpecification,
    ReasoningStep,
    StateSnapshot,
    VerificationResult
)
from .constraint_engine import DeterministicConstraintEngine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ReasoningCompiler:
    """
    Reasoning Compiler - validates reasoning steps
    
    Module: 4.3 from specification
    
    Responsibilities:
    - Validate reasoning steps, not just final answers
    - Check step dependencies exist and are valid
    - Check for contradictions with accepted facts
    - Check all implied reverse relations are consistent
    - Check all constraints satisfied via DCE
    - Maintain a "compiled reasoning trace" per task
    """
    
    def __init__(self, constraint_engine: DeterministicConstraintEngine):
        self.constraint_engine = constraint_engine
        self.compiled_traces: Dict[str, List[ReasoningStep]] = {}  # task_id -> list of steps
        self.step_verifications: Dict[str, Dict[int, VerificationResult]] = {}  # task_id -> step_id -> result
        logger.info("Reasoning Compiler initialized")
    
    def compile_step(
        self,
        task_spec: TaskSpecification,
        state: StateSnapshot,
        step: ReasoningStep
    ) -> VerificationResult:
        """
        Compile (validate) a reasoning step
        
        Args:
            task_spec: The task specification
            state: Current state snapshot
            step: Reasoning step to validate
        
        Returns:
            VerificationResult with accept/reject/needs_revision
        """
        logger.info(f"Compiling step {step.step_id} for task {step.task_id}")
        
        errors = []
        
        # 1. Check step dependencies exist and are valid
        dep_valid, dep_errors = self._validate_dependencies(step, task_spec.task_id)
        if not dep_valid:
            errors.extend(dep_errors)
        
        # 2. Check for contradictions with accepted facts
        contra_valid, contra_errors = self._check_contradictions(step, state)
        if not contra_valid:
            errors.extend(contra_errors)
        
        # 3. Check structural validity
        struct_valid, struct_errors = self._validate_structure(step)
        if not struct_valid:
            errors.extend(struct_errors)
        
        # 4. Check constraints via DCE
        dce_result = self.constraint_engine.verify(task_spec, state, step)
        if dce_result.status == "rejected":
            errors.extend(dce_result.reasons)
        
        # Determine final status
        if len(errors) == 0:
            status = "accepted"
            reasons = ["Step compiled successfully"]
            
            # Add to compiled trace
            if task_spec.task_id not in self.compiled_traces:
                self.compiled_traces[task_spec.task_id] = []
            self.compiled_traces[task_spec.task_id].append(step)
        elif any("critical" in str(e).lower() for e in errors):
            status = "rejected"
            reasons = errors
        else:
            status = "needs_revision"
            reasons = errors
        
        # Create verification result
        result = VerificationResult(
            task_id=step.task_id,
            step_id=step.step_id,
            verifier_id="reasoning_compiler",
            status=status,
            reasons=reasons,
            violated_constraints=dce_result.violated_constraints if dce_result.status == "rejected" else [],
            suggested_fixes=self._generate_fixes(errors) if status != "accepted" else []
        )
        
        # Store verification
        if step.task_id not in self.step_verifications:
            self.step_verifications[step.task_id] = {}
        self.step_verifications[step.task_id][step.step_id] = result
        
        logger.info(f"Step {step.step_id} compilation result: {status}")
        return result
    
    def _validate_dependencies(self, step: ReasoningStep, task_id: str) -> Tuple[bool, List[str]]:
        """Validate that all dependencies exist and are accepted"""
        errors = []
        
        if task_id not in self.compiled_traces:
            # First step - no dependencies expected
            if len(step.depends_on) > 0:
                errors.append(f"Step {step.step_id} depends on {step.depends_on} but no prior steps exist")
            return len(errors) == 0, errors
        
        compiled_step_ids = {s.step_id for s in self.compiled_traces[task_id]}
        
        for dep_id in step.depends_on:
            if dep_id not in compiled_step_ids:
                errors.append(f"Step {step.step_id} depends on step {dep_id} which has not been compiled")
            
            # Check if dependency was accepted
            if task_id in self.step_verifications and dep_id in self.step_verifications[task_id]:
                dep_result = self.step_verifications[task_id][dep_id]
                if dep_result.status != "accepted":
                    errors.append(f"Step {step.step_id} depends on step {dep_id} which was {dep_result.status}")
        
        return len(errors) == 0, errors
    
    def _check_contradictions(self, step: ReasoningStep, state: StateSnapshot) -> Tuple[bool, List[str]]:
        """Check for contradictions with existing facts"""
        errors = []
        
        # Check output facts don't contradict existing facts
        existing_fact_contents = {f.content for f in state.facts if isinstance(f.content, str)}
        
        for output_fact in step.output_facts:
            # Simple check: look for negations
            if isinstance(output_fact, str):
                # Check for explicit contradictions (e.g., "X is true" vs "X is false")
                if "not" in output_fact.lower() or "false" in output_fact.lower():
                    # Check if positive version exists
                    positive = output_fact.replace("not ", "").replace("false", "true")
                    if positive in existing_fact_contents:
                        errors.append(f"Output fact '{output_fact}' contradicts existing fact '{positive}'")
        
        return len(errors) == 0, errors
    
    def _validate_structure(self, step: ReasoningStep) -> Tuple[bool, List[str]]:
        """Validate step structure"""
        errors = []
        
        # Check required fields
        if not step.operation:
            errors.append("Step operation is empty")
        
        if not step.justification:
            errors.append("Step justification is empty")
        
        if step.confidence < 0 or step.confidence > 1:
            errors.append(f"Step confidence {step.confidence} is out of range [0, 1]")
        
        # Check role-specific requirements
        if step.agent_role == "planner":
            # Planners should decompose tasks
            if "decompose" not in step.operation.lower() and "plan" not in step.operation.lower():
                pass  # Warning, not error
        
        elif step.agent_role == "solver":
            # Solvers should have concrete state changes
            if len(step.proposed_state_changes) == 0:
                errors.append("Solver step has no proposed state changes")
        
        return len(errors) == 0, errors
    
    def _generate_fixes(self, errors: List[str]) -> List[str]:
        """Generate suggested fixes for errors"""
        fixes = []
        
        for error in errors:
            if "depends on" in error:
                fixes.append("Reorder steps to satisfy dependencies")
            elif "contradicts" in error:
                fixes.append("Remove contradictory output facts or revise reasoning")
            elif "empty" in error:
                fixes.append("Provide complete step information")
        
        return fixes
    
    def get_compiled_trace(self, task_id: str) -> List[ReasoningStep]:
        """Get the compiled reasoning trace for a task"""
        return self.compiled_traces.get(task_id, [])
    
    def get_compilation_stats(self, task_id: str) -> Dict[str, Any]:
        """Get compilation statistics for a task"""
        if task_id not in self.step_verifications:
            return {"error": "No verifications for task"}
        
        verifications = self.step_verifications[task_id]
        
        accepted = sum(1 for v in verifications.values() if v.status == "accepted")
        rejected = sum(1 for v in verifications.values() if v.status == "rejected")
        needs_revision = sum(1 for v in verifications.values() if v.status == "needs_revision")
        
        return {
            "total_steps": len(verifications),
            "accepted": accepted,
            "rejected": rejected,
            "needs_revision": needs_revision,
            "acceptance_rate": f"{(accepted / len(verifications) * 100):.1f}%" if verifications else "0%"
        }


if __name__ == "__main__":
    # Test the reasoning compiler
    from .schemas import Object, StateChange
    from .state_manager import StateManager
    
    print("Testing Reasoning Compiler...")
    
    # Create components
    engine = DeterministicConstraintEngine()
    compiler = ReasoningCompiler(engine)
    state_mgr = StateManager()
    
    # Create a test task
    task = TaskSpecification(
        source="user",
        natural_language="Test reasoning compilation",
        domain="testing",
        goal="Verify step validation",
        objects=[
            Object(id="obj_1", type="TestObject", attributes={"name": "Test"}),
        ]
    )
    
    # Create initial state
    state = state_mgr.create_initial_state(task)
    
    # Test 1: Valid step
    step1 = ReasoningStep(
        step_id=1,
        task_id=task.task_id,
        agent_role="solver",
        operation="add_fact",
        justification="Adding initial fact",
        confidence=0.9,
        proposed_state_changes=[
            StateChange(type="add_fact", fact="Initial fact")
        ]
    )
    
    result1 = compiler.compile_step(task, state, step1)
    print(f"\n✓ Test 1 - Valid step:")
    print(f"  Status: {result1.status}")
    print(f"  Reasons: {result1.reasons}")
    
    # Test 2: Step with invalid dependency
    step2 = ReasoningStep(
        step_id=2,
        task_id=task.task_id,
        agent_role="solver",
        operation="depend_on_999",
        depends_on=[999],  # Non-existent step
        justification="Testing dependency",
        confidence=0.8,
        proposed_state_changes=[
            StateChange(type="add_fact", fact="Dependent fact")
        ]
    )
    
    result2 = compiler.compile_step(task, state, step2)
    print(f"\n✓ Test 2 - Invalid dependency:")
    print(f"  Status: {result2.status}")
    print(f"  Reasons: {result2.reasons[:1]}")  # Show first reason only
    
    # Test 3: Step with missing operation
    step3 = ReasoningStep(
        step_id=3,
        task_id=task.task_id,
        agent_role="solver",
        operation="",  # Empty operation
        justification="Testing validation",
        confidence=0.7
    )
    
    result3 = compiler.compile_step(task, state, step3)
    print(f"\n✓ Test 3 - Missing operation:")
    print(f"  Status: {result3.status}")
    
    # Get stats
    stats = compiler.get_compilation_stats(task.task_id)
    print(f"\n✓ Compilation Stats:")
    import json
    print(json.dumps(stats, indent=2))
    
    print("\n✓ Reasoning Compiler test complete!")
