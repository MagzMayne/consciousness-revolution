"""
Universal Deterministic Reasoning Scaffold
"""

from .schemas import (
    Object,
    Relation,
    TaskSpecification,
    StateChange,
    ReasoningStep,
    Fact,
    StateSnapshot,
    VerificationResult,
    validate_task_spec,
    validate_reasoning_step
)

__all__ = [
    'Object',
    'Relation',
    'TaskSpecification',
    'StateChange',
    'ReasoningStep',
    'Fact',
    'StateSnapshot',
    'VerificationResult',
    'validate_task_spec',
    'validate_reasoning_step'
]

__version__ = '1.0.0'
