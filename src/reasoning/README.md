# Universal Deterministic Reasoning Scaffold

A shareable specification and implementation for autonomous agents and dev teams that wraps LLMs in a deterministic scaffold enforcing logic, constraints, and state consistency.

## Overview

This system implements the Universal Deterministic Reasoning Scaffold specification, providing:

- **Deterministic validation** of LLM-generated reasoning steps
- **State consistency** across complex reasoning tasks
- **Constraint enforcement** using logical rules
- **Multi-domain support** via pluggable domain packs
- **Complete audit trail** of reasoning steps

## Core Principle

```
LLMs never own truth or state. They only propose structured changes.
```

- **LLM Role**: Stochastic proposal generator
- **Scaffold Role**: Deterministic validator, state owner, and constraint enforcer

## Architecture

### Module Structure

```
src/reasoning/
├── schemas.py              # Canonical data contracts
├── constraint_engine.py    # Deterministic constraint enforcement
├── state_manager.py        # Canonical state ownership
├── protocol_agent.py       # Natural language to TaskSpec conversion
├── reasoning_compiler.py   # Step validation and compilation
└── domains/               # Pluggable domain-specific logic
    ├── base.py           # Domain pack interface
    ├── scheduling.py     # Scheduling domain (planned)
    ├── relationships.py  # Relationships domain (planned)
    └── workflow.py       # Workflow domain (planned)
```

### Data Flow

```
1. Natural Language Input
   ↓
2. Protocol Agent → TaskSpec (canonical format)
   ↓
3. LLM Orchestrator → ReasoningSteps (proposals)
   ↓
4. Reasoning Compiler + Constraint Engine → Verification
   ↓
5. State Manager → New State (if accepted)
   ↓
6. Explainer Agent → Human-Readable Output
```

## Quick Start

### Basic Usage

```python
import sys
sys.path.insert(0, 'src')

from reasoning.protocol_agent import ProtocolAgent
from reasoning.constraint_engine import DeterministicConstraintEngine
from reasoning.state_manager import StateManager
from reasoning.reasoning_compiler import ReasoningCompiler
from reasoning.schemas import ReasoningStep, StateChange

# 1. Parse natural language to TaskSpec
protocol_agent = ProtocolAgent()
task_spec = protocol_agent.parse_natural_language(
    "Schedule a meeting between Alice and Bob on Monday"
)

# 2. Initialize components
constraint_engine = DeterministicConstraintEngine()
state_manager = StateManager()
compiler = ReasoningCompiler(constraint_engine)

# 3. Create initial state
state = state_manager.create_initial_state(task_spec)

# 4. Create a reasoning step (normally from LLM)
step = ReasoningStep(
    step_id=1,
    task_id=task_spec.task_id,
    agent_role="solver",
    operation="add_availability",
    justification="Recording availability",
    confidence=0.9,
    proposed_state_changes=[
        StateChange(type="add_fact", fact="Alice available Monday 2pm")
    ]
)

# 5. Compile (validate) the step
verification = compiler.compile_step(task_spec, state, step)

# 6. Apply if accepted
if verification.status == "accepted":
    new_state = state_manager.apply_step(step, verification)
    print(f"✓ Step applied, new state version: {new_state.version}")
else:
    print(f"✗ Step rejected: {verification.reasons}")
```

## Canonical Schemas

### TaskSpecification

Defines a task in canonical format:

```python
{
    "task_id": "uuid",
    "source": "user|system|agent",
    "natural_language": "Original request text",
    "domain": "scheduling|relationships|puzzle|workflow|custom",
    "goal": "Clear goal statement",
    "objects": [
        {
            "id": "obj_1",
            "type": "Person",
            "attributes": {"name": "Alice"}
        }
    ],
    "relations": [
        {
            "id": "rel_1",
            "type": "parent_of",
            "from": "obj_1",
            "to": "obj_2"
        }
    ],
    "constraints": ["no_overlapping", "business_hours_only"],
    "verification": {
        "modes": ["constraint_satisfaction", "bidirectional_relations"]
    }
}
```

### ReasoningStep

Atomic unit of reasoning:

```python
{
    "step_id": 1,
    "task_id": "uuid",
    "agent_role": "planner|solver|critic|verifier",
    "depends_on": [previous_step_ids],
    "operation": "describe_operation",
    "input_facts": ["fact_references"],
    "output_facts": ["new_facts"],
    "proposed_state_changes": [
        {
            "type": "add_fact|update_fact|delete_fact",
            "fact": "fact_content"
        }
    ],
    "justification": "Why this step is valid",
    "confidence": 0.0-1.0
}
```

### StateSnapshot

World state at a point in time:

```python
{
    "state_id": "uuid",
    "task_id": "uuid",
    "facts": [
        {
            "id": "fact_1",
            "content": "Alice is available Monday",
            "source_step_id": 1
        }
    ],
    "relations": [relation_objects],
    "version": 1,
    "timestamp": "ISO8601"
}
```

### VerificationResult

Outcome of constraint checking:

```python
{
    "task_id": "uuid",
    "step_id": 1,
    "verifier_id": "constraint_engine",
    "status": "accepted|rejected|needs_revision",
    "reasons": ["Explanation of decision"],
    "violated_constraints": ["constraint_ids"],
    "suggested_fixes": ["How to fix issues"]
}
```

## Constraint Engine

The Deterministic Constraint Engine enforces logical and domain-specific rules:

### Built-in Rules

1. **Symmetry Rules**
   - `equals(A, B) ⇒ equals(B, A)`
   - `spouse_of(A, B) ⇒ spouse_of(B, A)`
   - `sibling_of(A, B) ⇒ sibling_of(B, A)`

2. **Transitivity Rules**
   - `before(A, B) ∧ before(B, C) ⇒ before(A, C)`
   - `ancestor_of(A, B) ∧ ancestor_of(B, C) ⇒ ancestor_of(A, C)`

3. **Anti-Symmetry Rules**
   - `parent_of(A, B) ⇒ ¬parent_of(B, A)`
   - `before(A, B) ⇒ ¬before(B, A)`

4. **Implication Rules**
   - `parent_of(A, B) ⇒ child_of(B, A)`
   - `child_of(A, B) ⇒ parent_of(B, A)`

### Adding Custom Rules

```python
from reasoning.constraint_engine import ConstraintRule

class CustomRule(ConstraintRule):
    def __init__(self):
        super().__init__(
            name="my_custom_rule",
            description="Description of the rule"
        )
    
    def check(self, state, step):
        violations = []
        # Your logic here
        return len(violations) == 0, violations

# Add to engine
engine = DeterministicConstraintEngine()
engine.add_rule(CustomRule())
```

## State Manager

Manages canonical world state with full version history:

### Features

- **Version Control**: Complete history of all state changes
- **Deterministic**: Only applies accepted reasoning steps
- **Auditable**: Full trace of what changed and when
- **Queryable**: Get state at any version or diff between versions

### Usage

```python
# Get current state
current = state_manager.get_current_state(task_id)

# Get specific version
v5 = state_manager.get_state_version(task_id, version=5)

# Get state diff
diff = state_manager.get_state_diff(task_id, from_version=1, to_version=5)
print(f"Added facts: {len(diff['added_facts'])}")
print(f"Removed facts: {len(diff['removed_facts'])}")

# Get statistics
stats = state_manager.get_stats()
print(f"Total tasks: {stats['total_tasks']}")
print(f"Total states: {stats['total_states']}")
```

## Protocol Agent

Converts natural language to structured TaskSpec:

### Supported Domains

- **Scheduling**: Meetings, appointments, time slots
- **Relationships**: Family trees, social graphs
- **Puzzle**: Logic puzzles, constraint satisfaction
- **Workflow**: Task dependencies, processes
- **Custom**: General purpose

### Example

```python
protocol_agent = ProtocolAgent()

# Scheduling
task1 = protocol_agent.parse_natural_language(
    "Schedule a meeting between Alice and Bob for Monday at 2 PM"
)
assert task1.domain == "scheduling"
assert len(task1.objects) >= 2  # Alice, Bob, and time

# Relationships
task2 = protocol_agent.parse_natural_language(
    "Alice is the parent of Bob"
)
assert task2.domain == "relationships"
assert len(task2.relations) == 1
assert task2.relations[0].type == "parent_of"
```

## Reasoning Compiler

Validates reasoning steps before applying them:

### Validation Checks

1. **Dependency Validation**: All depends_on steps exist and are accepted
2. **Contradiction Detection**: No conflicts with existing facts
3. **Structural Validation**: Required fields present and valid
4. **Constraint Enforcement**: Via Deterministic Constraint Engine

### Compilation Statistics

```python
stats = compiler.get_compilation_stats(task_id)
# Returns:
# {
#     "total_steps": 10,
#     "accepted": 8,
#     "rejected": 1,
#     "needs_revision": 1,
#     "acceptance_rate": "80.0%"
# }
```

## Domain Packs

Pluggable modules for domain-specific logic:

### Creating a Domain Pack

```python
from reasoning.domains.base import DomainPack
from reasoning.constraint_engine import ConstraintRule

class MyDomainPack(DomainPack):
    def __init__(self):
        super().__init__("my_domain")
    
    def get_object_types(self):
        return ["MyType1", "MyType2"]
    
    def get_relation_types(self):
        return [
            {
                "type": "my_relation",
                "properties": {
                    "symmetric": False,
                    "transitive": True,
                    "anti_symmetric": False
                }
            }
        ]
    
    def get_constraint_rules(self):
        return [MyCustomRule()]
```

## Agent Roles

The system supports multiple agent roles:

1. **Planner**: Decomposes tasks into subtasks
2. **Solver**: Proposes concrete reasoning steps
3. **Critic**: Finds flaws and proposes corrections
4. **Verifier**: Validates reasoning steps
5. **Explainer**: Converts compiled trace to human-readable output

## Testing

Run the built-in tests:

```bash
# Test schemas
python3 -m src.reasoning.schemas

# Test constraint engine
python3 -m src.reasoning.constraint_engine

# Test state manager
python3 -m src.reasoning.state_manager

# Test protocol agent
python3 -m src.reasoning.protocol_agent

# Test reasoning compiler
python3 -m src.reasoning.reasoning_compiler

# Integration test
cd src/reasoning && python3 -c "
import sys
sys.path.insert(0, '..')
# ... integration test code ...
"
```

## Implementation Status

### ✅ Phase 1: Core Skeleton (Complete)
- [x] Canonical schemas
- [x] Deterministic Constraint Engine
- [x] State Manager
- [x] Protocol Agent

### ✅ Phase 2: Reasoning Loop (Enhanced)
- [x] Reasoning Compiler
- [x] **Probabilistic Validator** (NEW)
- [x] **Failure Mode Analyzer** (NEW)
- [ ] LLM Orchestrator (planned)
- [ ] Planner Agent (planned)
- [ ] Solver Agent (planned)
- [ ] Critic Agent (planned)
- [ ] Explainer Agent (planned)

### 🔄 Phase 3: Domain Generalization (In Progress)
- [x] Domain Pack interface
- [ ] Scheduling Domain Pack
- [ ] Relationships Domain Pack
- [ ] Workflow Domain Pack

## Enhanced Validation System

### Probabilistic Validation Layer

The system now includes a **probabilistic validation layer** that wraps deterministic constraints with probability estimation, acknowledging that "validation reduces error probability but does not guarantee correctness."

#### Key Philosophy
- Real software has architecture tradeoffs, side effects, race conditions, memory issues
- Constraint surfaces become enormous in production systems  
- Human intuition and failure mode anticipation are critical
- Experienced engineers simulate mentally: "What if this runs concurrently?"

#### ProbabilisticValidator Features

**Located in**: `src/reasoning/probabilistic_validator.py`

```python
from reasoning.probabilistic_validator import ProbabilisticValidator

validator = ProbabilisticValidator()
prob_result = validator.validate(task_spec, state, step, deterministic_result)

# Access results
print(f"Validation Probability: {prob_result.validation_probability:.2f}")
print(f"Recommendation: {prob_result.combined_recommendation}")
print(f"Confidence Scores: {prob_result.confidence_scores}")
print(f"Edge Cases: {prob_result.edge_case_risks}")
print(f"Limitations: {prob_result.applicable_limitations}")
```

**Capabilities:**
- **Confidence Scoring**: Per-aspect confidence (structural, logical, dependency, state_change, llm_confidence, complexity)
- **Complexity Assessment**: Evaluates operation complexity (low/medium/high/very_high)
- **Uncertainty Tracking**: Identifies sources of uncertainty (large state, many constraints, low LLM confidence)
- **Edge Case Detection**: Finds potential edge cases (concurrency, boundaries, state explosion, dependency chains)
- **Known Limitations**: Acknowledges what validation cannot detect (race conditions, performance, side effects, emergent behavior, external dependencies)
- **Human-Readable Interpretations**: Explains confidence levels and risks
- **Combined Recommendations**: accept/accept_with_caution/human_review/reject/needs_revision

#### FailureModeAnalyzer Features

**Located in**: `src/reasoning/failure_mode_analyzer.py`

```python
from reasoning.failure_mode_analyzer import FailureModeAnalyzer

analyzer = FailureModeAnalyzer()
analysis = analyzer.analyze(task_spec, state, step)

# Access results
print(f"Risk Score: {analysis.risk_score:.2f}")
print(f"Failure Modes: {len(analysis.identified_failure_modes)}")
print(f"Critical Questions: {analysis.critical_questions}")
print(f"Recommendations: {analysis.recommended_actions}")
```

**Failure Categories** (7 types):
1. **Concurrency**: Race conditions, shared resource access, atomicity issues
2. **Input**: Malformed data, boundary conditions, validation gaps
3. **Performance**: Large state operations, latency, recursion risks
4. **Integration**: External dependencies, API failures, network issues
5. **State**: Consistency, rollback, transaction semantics
6. **Resource**: Memory leaks, connection pools, cleanup failures
7. **Emergent**: Complex interactions, cascading failures, scale effects

**Critical Questions** (per category):
- "What if this runs concurrently with other operations?"
- "What if the input is malformed or unexpected?"
- "What if this operation takes much longer than expected?"
- "What if external systems are unavailable?"
- "What if the state is inconsistent or corrupted?"
- "What if resources (memory, disk, connections) are exhausted?"
- "What if components interact in unexpected ways?"

**Output:**
- Severity assessment (low/medium/high/critical)
- Likelihood estimation (low/medium/high)
- Specific trigger conditions
- Observable symptoms
- Mitigation strategies
- Example scenarios
- Overall risk score (0-1)
- Actionable recommendations

### Using Enhanced Validation

#### Basic Usage

```python
from reasoning.constraint_engine import DeterministicConstraintEngine
from reasoning.reasoning_compiler import ReasoningCompiler
from reasoning.schemas import TaskSpecification, StateSnapshot, ReasoningStep

# Create compiler with enhancements enabled (default)
constraint_engine = DeterministicConstraintEngine()
compiler = ReasoningCompiler(
    constraint_engine,
    enable_probabilistic_validation=True,  # Enable probabilistic analysis
    enable_failure_mode_analysis=True      # Enable failure mode detection
)

# Compile a step
result = compiler.compile_step(task_spec, state, step)

# Access deterministic result
print(f"Status: {result.status}")
print(f"Reasons: {result.reasons}")

# Access probabilistic analysis
if result.probabilistic_analysis:
    prob = result.probabilistic_analysis['validation_probability']
    recommendation = result.probabilistic_analysis['combined_recommendation']
    print(f"Validation Probability: {prob:.2f}")
    print(f"Recommendation: {recommendation}")

# Access failure mode analysis
if result.failure_mode_analysis:
    risk = result.failure_mode_analysis['risk_score']
    modes = result.failure_mode_analysis['identified_failure_modes']
    print(f"Risk Score: {risk:.2f}")
    print(f"Identified {len(modes)} failure modes")
```

#### Disabling Enhancements

```python
# Use only deterministic validation (original behavior)
compiler = ReasoningCompiler(
    constraint_engine,
    enable_probabilistic_validation=False,
    enable_failure_mode_analysis=False
)

result = compiler.compile_step(task_spec, state, step)
# result.probabilistic_analysis will be None
# result.failure_mode_analysis will be None
```

### Extended VerificationResult Schema

The `VerificationResult` schema has been extended to include probabilistic and failure mode analysis:

```python
@dataclass
class VerificationResult:
    # Original fields
    task_id: str
    step_id: int
    verifier_id: str
    status: Literal["accepted", "rejected", "needs_revision"]
    reasons: List[str]
    violated_constraints: List[str]
    suggested_fixes: List[Any]
    
    # Extended fields (new)
    probabilistic_analysis: Optional[Dict[str, Any]] = None
    failure_mode_analysis: Optional[Dict[str, Any]] = None
```

### Testing

Comprehensive test suite available:

```bash
# Run probabilistic validation tests
python3 src/reasoning/test_probabilistic_validation.py

# Expected output: 5 tests, all passing
# - Test 1: Probabilistic Validator standalone
# - Test 2: Failure Mode Analyzer standalone  
# - Test 3: Integrated Reasoning Compiler
# - Test 4: Compiler with enhancements disabled
# - Test 5: Complex high-risk scenario
```

## Non-Negotiables

As per the specification:

1. ✅ All inter-module communication uses schemas from Section 3
2. ✅ LLMs may only propose ReasoningSteps; they never mutate state directly
3. ✅ DCE and State Manager are deterministic (no probabilistic reasoning)

## Future Enhancements

- [ ] LLM Orchestrator with OpenAI/Anthropic integration
- [ ] Multi-agent cross-verification system
- [ ] Complete domain packs for scheduling, relationships, workflows
- [ ] Explainer agent for human-readable output
- [ ] Web API interface
- [ ] Visualization dashboard for probabilistic analysis and failure modes
- [ ] Performance optimizations for large state spaces
- [ ] Red team agent role for adversarial edge case discovery
- [ ] Expanded failure mode heuristics database from production experience
- [ ] Interactive "what if" scenario simulator
- [ ] Machine learning-based failure mode prediction

## License

MIT License - See repository root for details

## Contact

For questions or contributions, please refer to the main repository documentation.

---

**Acknowledgment**: The probabilistic validation and failure mode analysis enhancements acknowledge a key insight: **"Validation reduces error probability but does not guarantee correctness."** This system combines deterministic constraint checking with probabilistic risk assessment and human intuition simulation to provide a more complete picture of reasoning step reliability in real-world scenarios.
