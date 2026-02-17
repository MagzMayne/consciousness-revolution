#!/usr/bin/env python3
"""
Deterministic Constraint Engine (DCE)
Enforces logical, relational, and domain constraints

Module: 4.2 from specification
"""

from typing import List, Dict, Any, Tuple, Set
import logging
from .schemas import (
    TaskSpecification,
    StateSnapshot,
    ReasoningStep,
    VerificationResult,
    Relation
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ConstraintRule:
    """Base class for constraint rules"""
    
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
    
    def check(self, state: StateSnapshot, step: ReasoningStep) -> Tuple[bool, List[str]]:
        """
        Check if the rule is satisfied
        Returns: (is_valid, reasons)
        """
        raise NotImplementedError("Subclasses must implement check()")


class SymmetryRule(ConstraintRule):
    """Enforce symmetry: R(A,B) => R(B,A)"""
    
    def __init__(self, relation_type: str):
        super().__init__(
            name=f"symmetry_{relation_type}",
            description=f"{relation_type} must be symmetric"
        )
        self.relation_type = relation_type
    
    def check(self, state: StateSnapshot, step: ReasoningStep) -> Tuple[bool, List[str]]:
        """Check symmetry constraint"""
        violations = []
        
        # Get all relations of this type
        relations = [r for r in state.relations if r.type == self.relation_type]
        
        # Check each relation has its reverse
        for rel in relations:
            reverse_exists = any(
                r.type == self.relation_type and
                r.from_id == rel.to_id and
                r.to_id == rel.from_id
                for r in relations
            )
            
            if not reverse_exists:
                violations.append(
                    f"Missing reverse relation: {self.relation_type}({rel.to_id}, {rel.from_id})"
                )
        
        return len(violations) == 0, violations


class TransitivityRule(ConstraintRule):
    """Enforce transitivity: R(A,B) ∧ R(B,C) => R(A,C)"""
    
    def __init__(self, relation_type: str):
        super().__init__(
            name=f"transitivity_{relation_type}",
            description=f"{relation_type} must be transitive"
        )
        self.relation_type = relation_type
    
    def check(self, state: StateSnapshot, step: ReasoningStep) -> Tuple[bool, List[str]]:
        """Check transitivity constraint"""
        violations = []
        
        # Get all relations of this type
        relations = [r for r in state.relations if r.type == self.relation_type]
        
        # Build relation graph
        graph = {}
        for rel in relations:
            if rel.from_id not in graph:
                graph[rel.from_id] = set()
            graph[rel.from_id].add(rel.to_id)
        
        # Check transitivity
        for a in graph:
            for b in graph[a]:
                if b in graph:
                    for c in graph[b]:
                        # Check if R(a,c) exists
                        if c not in graph.get(a, set()):
                            violations.append(
                                f"Missing transitive relation: {self.relation_type}({a}, {c}) "
                                f"from {self.relation_type}({a}, {b}) and {self.relation_type}({b}, {c})"
                            )
        
        return len(violations) == 0, violations


class AntiSymmetryRule(ConstraintRule):
    """Enforce anti-symmetry: R(A,B) => ¬R(B,A)"""
    
    def __init__(self, relation_type: str):
        super().__init__(
            name=f"antisymmetry_{relation_type}",
            description=f"{relation_type} must be anti-symmetric"
        )
        self.relation_type = relation_type
    
    def check(self, state: StateSnapshot, step: ReasoningStep) -> Tuple[bool, List[str]]:
        """Check anti-symmetry constraint"""
        violations = []
        
        relations = [r for r in state.relations if r.type == self.relation_type]
        
        for rel in relations:
            # Check if reverse relation exists
            reverse_exists = any(
                r.type == self.relation_type and
                r.from_id == rel.to_id and
                r.to_id == rel.from_id and
                r.id != rel.id  # Not the same relation
                for r in relations
            )
            
            if reverse_exists:
                violations.append(
                    f"Anti-symmetry violated: both {self.relation_type}({rel.from_id}, {rel.to_id}) "
                    f"and {self.relation_type}({rel.to_id}, {rel.from_id}) exist"
                )
        
        return len(violations) == 0, violations


class ImplicationRule(ConstraintRule):
    """Enforce implication: R1(A,B) => R2(B,A)"""
    
    def __init__(self, source_type: str, target_type: str, reverse: bool = False):
        super().__init__(
            name=f"implication_{source_type}_to_{target_type}",
            description=f"{source_type} implies {target_type}"
        )
        self.source_type = source_type
        self.target_type = target_type
        self.reverse = reverse
    
    def check(self, state: StateSnapshot, step: ReasoningStep) -> Tuple[bool, List[str]]:
        """Check implication constraint"""
        violations = []
        
        source_relations = [r for r in state.relations if r.type == self.source_type]
        target_relations = [r for r in state.relations if r.type == self.target_type]
        
        for source_rel in source_relations:
            # Determine what target relation should exist
            if self.reverse:
                expected_from = source_rel.to_id
                expected_to = source_rel.from_id
            else:
                expected_from = source_rel.from_id
                expected_to = source_rel.to_id
            
            # Check if implied relation exists
            target_exists = any(
                r.from_id == expected_from and r.to_id == expected_to
                for r in target_relations
            )
            
            if not target_exists:
                violations.append(
                    f"Missing implied relation: {self.target_type}({expected_from}, {expected_to}) "
                    f"from {self.source_type}({source_rel.from_id}, {source_rel.to_id})"
                )
        
        return len(violations) == 0, violations


class DeterministicConstraintEngine:
    """
    Deterministic Constraint Engine (DCE)
    Enforces logical, relational, and domain constraints
    
    Module: 4.2 from specification
    """
    
    def __init__(self):
        self.rules: List[ConstraintRule] = []
        self.domain_constraints: Dict[str, List[ConstraintRule]] = {}
        
        # Initialize with common logical rules
        self._initialize_default_rules()
    
    def _initialize_default_rules(self):
        """Initialize default logical rules"""
        # Common symmetric relations
        self.add_rule(SymmetryRule("equals"))
        self.add_rule(SymmetryRule("spouse_of"))
        self.add_rule(SymmetryRule("sibling_of"))
        
        # Common transitive relations
        self.add_rule(TransitivityRule("before"))
        self.add_rule(TransitivityRule("after"))
        self.add_rule(TransitivityRule("ancestor_of"))
        
        # Common anti-symmetric relations
        self.add_rule(AntiSymmetryRule("parent_of"))
        self.add_rule(AntiSymmetryRule("before"))
        
        # Common implications
        self.add_rule(ImplicationRule("parent_of", "child_of", reverse=True))
        self.add_rule(ImplicationRule("child_of", "parent_of", reverse=True))
        
        logger.info("Initialized default logical rules")
    
    def add_rule(self, rule: ConstraintRule):
        """Add a constraint rule"""
        self.rules.append(rule)
        logger.debug(f"Added rule: {rule.name}")
    
    def add_domain_rule(self, domain: str, rule: ConstraintRule):
        """Add a domain-specific constraint rule"""
        if domain not in self.domain_constraints:
            self.domain_constraints[domain] = []
        self.domain_constraints[domain].append(rule)
        logger.debug(f"Added domain rule for {domain}: {rule.name}")
    
    def verify(
        self,
        task_spec: TaskSpecification,
        state: StateSnapshot,
        step: ReasoningStep
    ) -> VerificationResult:
        """
        Verify a reasoning step against all constraints
        
        Args:
            task_spec: The task specification
            state: Current state snapshot
            step: Reasoning step to verify
        
        Returns:
            VerificationResult with status and reasons
        """
        all_violations = []
        violated_constraints = []
        
        # Check global rules
        for rule in self.rules:
            is_valid, violations = rule.check(state, step)
            if not is_valid:
                all_violations.extend(violations)
                violated_constraints.append(rule.name)
        
        # Check domain-specific rules
        if task_spec.domain in self.domain_constraints:
            for rule in self.domain_constraints[task_spec.domain]:
                is_valid, violations = rule.check(state, step)
                if not is_valid:
                    all_violations.extend(violations)
                    violated_constraints.append(rule.name)
        
        # Check custom constraints from task spec
        for constraint in task_spec.constraints:
            # This is a simple string matching - in production, you'd parse and evaluate
            # constraint expressions properly
            pass  # Placeholder for custom constraint checking
        
        # Determine status
        if len(all_violations) == 0:
            status = "accepted"
            reasons = ["All constraints satisfied"]
        else:
            status = "rejected"
            reasons = all_violations
        
        return VerificationResult(
            task_id=task_spec.task_id,
            step_id=step.step_id,
            verifier_id="constraint_engine",
            status=status,
            reasons=reasons,
            violated_constraints=violated_constraints,
            suggested_fixes=[]
        )
    
    def get_rules_summary(self) -> Dict[str, Any]:
        """Get summary of all loaded rules"""
        return {
            "total_rules": len(self.rules),
            "global_rules": [r.name for r in self.rules],
            "domain_rules": {
                domain: [r.name for r in rules]
                for domain, rules in self.domain_constraints.items()
            }
        }


if __name__ == "__main__":
    # Test the constraint engine
    from .schemas import Object, Relation, Fact
    
    print("Testing Deterministic Constraint Engine...")
    
    # Create a constraint engine
    engine = DeterministicConstraintEngine()
    
    # Create a test task
    task = TaskSpecification(
        source="user",
        natural_language="Family relationship test",
        domain="relationships",
        goal="Verify family relationships",
        objects=[
            Object(id="alice", type="Person", attributes={"name": "Alice"}),
            Object(id="bob", type="Person", attributes={"name": "Bob"}),
        ]
    )
    
    # Create a state with parent-child relation
    state = StateSnapshot(
        task_id=task.task_id,
        relations=[
            Relation(id="rel_1", type="parent_of", from_id="alice", to_id="bob"),
            # Missing reverse child_of relation - should be caught
        ]
    )
    
    # Create a reasoning step
    step = ReasoningStep(
        step_id=1,
        task_id=task.task_id,
        agent_role="solver",
        operation="verify_relations"
    )
    
    # Verify
    result = engine.verify(task, state, step)
    
    print(f"\n✓ Verification Status: {result.status}")
    print(f"✓ Reasons: {result.reasons}")
    if result.violated_constraints:
        print(f"✓ Violated Constraints: {result.violated_constraints}")
    
    print(f"\n✓ Rules Summary:")
    import json
    print(json.dumps(engine.get_rules_summary(), indent=2))
    
    print("\n✓ Constraint Engine test complete!")
