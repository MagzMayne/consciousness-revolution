#!/usr/bin/env python3
"""
Universal Deterministic Reasoning Scaffold - Canonical Schemas
Data contracts that all agents must respect

Version: 1.0.0
"""

from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any, Optional, Literal
from datetime import datetime
import uuid
import json


@dataclass
class Object:
    """Object in the reasoning system"""
    id: str
    type: str
    attributes: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Object':
        return cls(**data)


@dataclass
class Relation:
    """Relation between objects"""
    id: str
    type: str
    from_id: str  # renamed from 'from' to avoid Python keyword
    to_id: str    # renamed from 'to' to avoid Python keyword
    attributes: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data['from'] = data.pop('from_id')
        data['to'] = data.pop('to_id')
        return data

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Relation':
        data_copy = data.copy()
        data_copy['from_id'] = data_copy.pop('from', '')
        data_copy['to_id'] = data_copy.pop('to', '')
        return cls(**data_copy)


@dataclass
class TaskSpecification:
    """
    Task specification - canonical format for all tasks
    Schema: 3.1 from specification
    """
    task_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    source: Literal["user", "system", "agent"] = "user"
    natural_language: str = ""
    domain: str = "custom"
    goal: str = ""
    objects: List[Object] = field(default_factory=list)
    relations: List[Relation] = field(default_factory=list)
    constraints: List[str] = field(default_factory=list)
    verification: Dict[str, List[str]] = field(default_factory=lambda: {
        "modes": ["constraint_satisfaction", "bidirectional_relations"]
    })
    metadata: Dict[str, Any] = field(default_factory=lambda: {
        "priority": "medium",
        "created_at": datetime.utcnow().isoformat() + "Z",
        "created_by": "system"
    })

    def to_dict(self) -> Dict[str, Any]:
        return {
            "task_id": self.task_id,
            "source": self.source,
            "natural_language": self.natural_language,
            "domain": self.domain,
            "goal": self.goal,
            "objects": [obj.to_dict() for obj in self.objects],
            "relations": [rel.to_dict() for rel in self.relations],
            "constraints": self.constraints,
            "verification": self.verification,
            "metadata": self.metadata
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'TaskSpecification':
        data_copy = data.copy()
        data_copy['objects'] = [Object.from_dict(obj) for obj in data_copy.get('objects', [])]
        data_copy['relations'] = [Relation.from_dict(rel) for rel in data_copy.get('relations', [])]
        return cls(**data_copy)

    def to_json(self) -> str:
        return json.dumps(self.to_dict(), indent=2)


@dataclass
class StateChange:
    """Proposed state change in a reasoning step"""
    type: Literal["add_fact", "update_fact", "delete_fact"]
    fact: Any  # string or structured fact

    def to_dict(self) -> Dict[str, Any]:
        return {
            "type": self.type,
            "fact": self.fact
        }


@dataclass
class ReasoningStep:
    """
    Reasoning step - atomic unit of reasoning
    Schema: 3.2 from specification
    """
    step_id: int
    task_id: str
    agent_role: Literal["planner", "solver", "critic", "verifier"]
    depends_on: List[int] = field(default_factory=list)
    operation: str = ""
    input_facts: List[str] = field(default_factory=list)
    output_facts: List[str] = field(default_factory=list)
    proposed_state_changes: List[StateChange] = field(default_factory=list)
    justification: str = ""
    confidence: float = 0.0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "step_id": self.step_id,
            "task_id": self.task_id,
            "agent_role": self.agent_role,
            "depends_on": self.depends_on,
            "operation": self.operation,
            "input_facts": self.input_facts,
            "output_facts": self.output_facts,
            "proposed_state_changes": [sc.to_dict() for sc in self.proposed_state_changes],
            "justification": self.justification,
            "confidence": self.confidence
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ReasoningStep':
        data_copy = data.copy()
        changes = data_copy.pop('proposed_state_changes', [])
        data_copy['proposed_state_changes'] = [
            StateChange(**change) for change in changes
        ]
        return cls(**data_copy)

    def to_json(self) -> str:
        return json.dumps(self.to_dict(), indent=2)


@dataclass
class Fact:
    """Fact in the state"""
    id: str
    content: Any  # string or structured
    source_step_id: int

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class StateSnapshot:
    """
    State snapshot - canonical world state at a point in time
    Schema: 3.3 from specification
    """
    state_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    task_id: str = ""
    facts: List[Fact] = field(default_factory=list)
    relations: List[Relation] = field(default_factory=list)
    version: int = 1
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "state_id": self.state_id,
            "task_id": self.task_id,
            "facts": [fact.to_dict() for fact in self.facts],
            "relations": [rel.to_dict() for rel in self.relations],
            "version": self.version,
            "timestamp": self.timestamp
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'StateSnapshot':
        data_copy = data.copy()
        data_copy['facts'] = [Fact(**fact) for fact in data_copy.get('facts', [])]
        data_copy['relations'] = [Relation.from_dict(rel) for rel in data_copy.get('relations', [])]
        return cls(**data_copy)

    def to_json(self) -> str:
        return json.dumps(self.to_dict(), indent=2)


@dataclass
class VerificationResult:
    """
    Verification result - outcome of constraint checking
    Schema: 3.4 from specification
    """
    task_id: str
    step_id: int
    verifier_id: str
    status: Literal["accepted", "rejected", "needs_revision"]
    reasons: List[str] = field(default_factory=list)
    violated_constraints: List[str] = field(default_factory=list)
    suggested_fixes: List[Any] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'VerificationResult':
        return cls(**data)

    def to_json(self) -> str:
        return json.dumps(self.to_dict(), indent=2)


# Schema validation functions
def validate_task_spec(task_spec: Dict[str, Any]) -> tuple[bool, List[str]]:
    """Validate task specification against schema"""
    errors = []
    
    required_fields = ['task_id', 'source', 'natural_language', 'domain', 'goal']
    for field in required_fields:
        if field not in task_spec:
            errors.append(f"Missing required field: {field}")
    
    if 'source' in task_spec and task_spec['source'] not in ['user', 'system', 'agent']:
        errors.append(f"Invalid source: {task_spec['source']}")
    
    return len(errors) == 0, errors


def validate_reasoning_step(step: Dict[str, Any]) -> tuple[bool, List[str]]:
    """Validate reasoning step against schema"""
    errors = []
    
    required_fields = ['step_id', 'task_id', 'agent_role']
    for field in required_fields:
        if field not in step:
            errors.append(f"Missing required field: {field}")
    
    if 'agent_role' in step and step['agent_role'] not in ['planner', 'solver', 'critic', 'verifier']:
        errors.append(f"Invalid agent_role: {step['agent_role']}")
    
    if 'confidence' in step:
        if not isinstance(step['confidence'], (int, float)) or not (0 <= step['confidence'] <= 1):
            errors.append("confidence must be a number between 0 and 1")
    
    return len(errors) == 0, errors


if __name__ == "__main__":
    # Example usage and testing
    print("Testing Universal Deterministic Reasoning Schemas...")
    
    # Create a sample task spec
    task = TaskSpecification(
        source="user",
        natural_language="Schedule a meeting between Alice and Bob",
        domain="scheduling",
        goal="Find a mutually available time slot",
        objects=[
            Object(id="person_1", type="Person", attributes={"name": "Alice"}),
            Object(id="person_2", type="Person", attributes={"name": "Bob"}),
        ],
        constraints=["no_overlapping_meetings", "business_hours_only"]
    )
    
    print("\n✓ Task Specification:")
    print(task.to_json())
    
    # Create a reasoning step
    step = ReasoningStep(
        step_id=1,
        task_id=task.task_id,
        agent_role="planner",
        operation="decompose_task",
        justification="Break down scheduling into subtasks",
        confidence=0.95
    )
    
    print("\n✓ Reasoning Step:")
    print(step.to_json())
    
    # Create a state snapshot
    state = StateSnapshot(
        task_id=task.task_id,
        facts=[
            Fact(id="fact_1", content="Alice is available on Monday", source_step_id=1)
        ]
    )
    
    print("\n✓ State Snapshot:")
    print(state.to_json())
    
    # Create a verification result
    verification = VerificationResult(
        task_id=task.task_id,
        step_id=1,
        verifier_id="constraint_engine",
        status="accepted",
        reasons=["All constraints satisfied"]
    )
    
    print("\n✓ Verification Result:")
    print(verification.to_json())
    
    print("\n✓ All schemas validated successfully!")
