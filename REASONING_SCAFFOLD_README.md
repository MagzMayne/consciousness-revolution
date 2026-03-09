# Universal Deterministic Reasoning Scaffold

**© 2008-2026 Ryan Barbrick (Barbrick Design). All Rights Reserved.**

A shareable specification and implementation for wrapping LLMs in deterministic constraints and logic enforcement. Created for autonomous agents and development teams.

---

## 🎯 Overview

### What is This?

The Universal Deterministic Reasoning Scaffold is a **system architecture pattern** that separates:
- **Stochastic Components**: LLMs propose solutions
- **Deterministic Components**: Logic and constraints validate solutions

### Core Principle

> **LLMs never own truth or state. They only propose structured changes.**

This separation ensures:
- ✅ Logical consistency
- ✅ Constraint satisfaction
- ✅ Reproducible reasoning
- ✅ Traceable decisions
- ✅ Domain-specific validation

---

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│           Universal Reasoning Scaffold                   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────┐        ┌──────────────────┐       │
│  │ Protocol Layer  │───────▶│   TaskSpec       │       │
│  │  (NL → JSON)    │        │   (Canonical)    │       │
│  └─────────────────┘        └──────────────────┘       │
│           │                           │                  │
│           ▼                           ▼                  │
│  ┌─────────────────┐        ┌──────────────────┐       │
│  │ LLM Orchestrator│───────▶│ Reasoning Steps  │       │
│  │ - Planner       │        │   (Proposals)    │       │
│  │ - Solver        │        └──────────────────┘       │
│  │ - Critic        │                 │                  │
│  │ - Explainer     │                 │                  │
│  └─────────────────┘                 ▼                  │
│                            ┌──────────────────┐         │
│  ┌─────────────────┐      │ Constraint Engine│         │
│  │ Reasoning       │◀─────│  (Deterministic) │         │
│  │ Compiler        │      └──────────────────┘         │
│  └─────────────────┘                 │                  │
│           │                           │                  │
│           ▼                           ▼                  │
│  ┌─────────────────┐        ┌──────────────────┐       │
│  │ State Manager   │◀───────│ Verification     │       │
│  │  (Versioned)    │        │   Results        │       │
│  └─────────────────┘        └──────────────────┘       │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Module Responsibilities

| Module | Type | Responsibility |
|--------|------|----------------|
| **Protocol Layer** | Hybrid | Convert natural language → TaskSpec |
| **Constraint Engine** | Deterministic | Enforce logical & domain constraints |
| **Reasoning Compiler** | Deterministic | Validate reasoning steps |
| **State Manager** | Deterministic | Own canonical world state |
| **LLM Orchestrator** | Stochastic | Coordinate LLM agent roles |
| **Domain Packs** | Deterministic | Pluggable domain logic |

---

## 📋 Data Contracts

### TaskSpec Schema

```javascript
{
  "task_id": "uuid",
  "source": "user|system|agent",
  "natural_language": "string",
  "domain": "scheduling|relationships|puzzle|workflow|custom",
  "goal": "string",
  "objects": [
    {
      "id": "string",
      "type": "string",
      "attributes": {}
    }
  ],
  "relations": [
    {
      "id": "string",
      "type": "string",
      "from": "object_id",
      "to": "object_id",
      "attributes": {}
    }
  ],
  "constraints": ["string"],
  "verification": {
    "modes": ["constraint_satisfaction", "bidirectional_relations"]
  },
  "metadata": {
    "priority": "low|medium|high",
    "created_at": "iso8601",
    "created_by": "agent_id"
  }
}
```

### ReasoningStep Schema

```javascript
{
  "step_id": number,
  "task_id": "uuid",
  "agent_role": "planner|solver|critic|verifier",
  "depends_on": [1, 2],
  "operation": "string",
  "input_facts": ["string"],
  "output_facts": ["string"],
  "proposed_state_changes": [
    {
      "type": "add_fact|update_fact|delete_fact",
      "fact": {}
    }
  ],
  "justification": "string",
  "confidence": 0.0-1.0
}
```

### StateSnapshot Schema

```javascript
{
  "state_id": "uuid",
  "task_id": "uuid",
  "facts": [
    {
      "id": "string",
      "content": "string or structured",
      "source_step_id": number
    }
  ],
  "relations": [
    {
      "id": "string",
      "type": "string",
      "from": "fact_id",
      "to": "fact_id"
    }
  ],
  "version": number,
  "timestamp": "iso8601"
}
```

### VerificationResult Schema

```javascript
{
  "task_id": "uuid",
  "step_id": number,
  "verifier_id": "string",
  "status": "accepted|rejected|needs_revision",
  "reasons": ["string"],
  "violated_constraints": ["string"],
  "suggested_fixes": ["string"]
}
```

---

## 🚀 Quick Start

### Installation

```bash
# In Node.js environment
npm install
```

### Basic Usage

```javascript
const { ReasoningScaffold } = require('./src/reasoning-scaffold');

// Initialize scaffold
const scaffold = new ReasoningScaffold({
  maxIterations: 5,
  strictMode: true
});

// Execute reasoning
const result = await scaffold.execute(
  "John is the parent of Mary. Mary is the parent of Bob. What is John's relationship to Bob?"
);

console.log(result.explanation);
console.log(result.finalState);
```

### With LLM Provider

```javascript
// Set up your LLM provider
const llmProvider = {
  complete: async (prompt, config) => {
    // Your LLM API call here
    return response.text;
  }
};

scaffold.setLLMProvider(llmProvider);

// Now execute with LLM-powered agents
const result = await scaffold.execute("Complex reasoning task...");
```

---

## 🎮 Agent Roles

### Planner Agent
- **Role**: Decomposes tasks into subtasks
- **Output**: High-level ReasoningSteps
- **Prompt Pattern**: "Break this task into logical steps"

### Solver Agent
- **Role**: Proposes concrete state changes
- **Output**: Detailed ReasoningSteps with proposed_state_changes
- **Prompt Pattern**: "Given this step, what state changes are needed?"

### Critic Agent
- **Role**: Attacks reasoning to find flaws
- **Output**: Critiques and suggested fixes
- **Prompt Pattern**: "Find contradictions and violations in these steps"

### Explainer Agent
- **Role**: Generates human-readable explanations
- **Output**: Natural language explanation
- **Prompt Pattern**: "Explain this reasoning trace to a human"

---

## 🎯 Domain Packs

### Scheduling Domain

**Object Types**: Person, Task, Resource, TimeSlot

**Constraints**:
- No overlap
- Capacity limits
- Precedence (before/after)
- Availability

**Example**:
```javascript
const result = await scaffold.execute(
  "Schedule 3 meetings without overlap between 9am-5pm"
);
```

### Relationships Domain

**Object Types**: Person

**Constraints**:
- Symmetry (sibling_of, spouse_of)
- Transitivity (ancestor_of)
- Exclusivity (can't be both parent and sibling)
- Bidirectionality (parent_of ⟺ child_of)

**Example**:
```javascript
const result = await scaffold.execute(
  "John is Mary's parent. Mary is Bob's parent. Infer all relationships."
);
```

### Workflow Domain

**Object Types**: Task, Agent, Resource, Artifact

**Constraints**:
- Acyclic dependencies (DAG)
- Resource availability
- Dependency satisfaction
- Agent capacity

**Example**:
```javascript
const result = await scaffold.execute(
  "Task A produces X. Task B requires X. What's the execution order?"
);
```

---

## 🔧 Core Components

### StateManager (Deterministic)

```javascript
const stateManager = new StateManager();

// Initialize state
const state = stateManager.initializeState(taskId);

// Apply changes (only if verified)
const newState = stateManager.applyStateChanges(
  taskId, 
  reasoningStep, 
  verificationResult
);

// Query state
const facts = stateManager.queryFacts(taskId, f => f.content.includes('parent'));

// Rollback
const rolledBack = stateManager.rollback(taskId, version);
```

### ConstraintEngine (Deterministic)

```javascript
const engine = new ConstraintEngine();

// Load domain pack
engine.loadDomainPack('scheduling', new SchedulingDomain());

// Verify step
const result = engine.verify(taskSpec, reasoningStep, currentState);

// Check violations
const violations = engine.getAllViolations(taskSpec, currentState);

// Suggest fixes
const fixes = engine.suggestFixes(violations, currentState);
```

### ReasoningCompiler (Deterministic)

```javascript
const compiler = new ReasoningCompiler(constraintEngine);

// Compile single step
const verification = await compiler.compileStep(
  taskSpec, 
  reasoningStep, 
  currentState
);

// Compile sequence
const results = await compiler.compileSequence(
  taskSpec, 
  steps, 
  currentState
);

// Get trace summary
const summary = compiler.getTraceSummary(taskId);
```

---

## 📊 Execution Flow

```
1. Natural Language Input
   ↓
2. Protocol Layer → TaskSpec
   ↓
3. State Manager → Initialize State
   ↓
4. LLM Orchestrator → Planner Agent → Plan Steps
   ↓
5. LLM Orchestrator → Solver Agent → Solve Each Step
   ↓
6. Reasoning Compiler → Validate Structure & Dependencies
   ↓
7. Constraint Engine → Check Constraints & Logic
   ↓
8. Critic Agent → Find Flaws (if any, iterate)
   ↓
9. State Manager → Apply Accepted Steps
   ↓
10. Explainer Agent → Generate Explanation
    ↓
11. Return Final Result
```

---

## 🧪 Testing

### Unit Tests

```javascript
// Test schemas
const taskSpec = new TaskSpec({ /* ... */ });
const validation = taskSpec.validate();
assert(validation.valid);

// Test state manager
const state = stateManager.initializeState(taskId);
state.addFact('Test fact');
assert(state.facts.length === 1);

// Test constraint engine
const result = engine.verify(taskSpec, step, state);
assert(result.status === 'accepted');
```

### Integration Tests

```javascript
// Test end-to-end
const scaffold = new ReasoningScaffold();
const result = await scaffold.execute(
  "John is Mary's parent. Mary is Bob's parent."
);

assert(result.success);
assert(result.reasoning.acceptedSteps > 0);
assert(result.finalState.facts.length > 0);
```

---

## 🎨 Custom Domain Packs

### Creating a Custom Domain

```javascript
class MyCustomDomain {
  constructor() {
    this.name = 'my_domain';
    this.objectTypes = ['type1', 'type2'];
    this.relationTypes = ['rel1', 'rel2'];
  }

  validate(state, taskSpec) {
    const result = {
      valid: true,
      reasons: [],
      violated_constraints: []
    };

    // Your validation logic here
    // Check domain-specific constraints
    // Return validation result

    return result;
  }

  getConstraints() {
    return [
      {
        id: 'constraint1',
        description: 'Your constraint description'
      }
    ];
  }
}

// Register domain
scaffold.addDomainPack('my_domain', new MyCustomDomain());
```

---

## 🔒 Security & Best Practices

### Do's ✅
- Always validate LLM outputs
- Use schemas to enforce structure
- Keep state immutable (versioned)
- Log all reasoning steps
- Test constraint rules thoroughly
- Use domain packs for specialized logic

### Don'ts ❌
- Never let LLM directly mutate state
- Don't skip constraint validation
- Don't trust LLM confidence scores alone
- Don't allow circular dependencies
- Don't hardcode domain logic in core

---

## 📖 API Reference

### ReasoningScaffold

```javascript
// Constructor
new ReasoningScaffold(config?)

// Methods
execute(naturalLanguage, options?) → Promise<Result>
executeStepByStep(naturalLanguage) → Promise<StepExecutor>
validateReasoning(taskSpec, steps) → Promise<VerificationResult[]>
setLLMProvider(provider) → void
addDomainPack(name, pack) → void
reset() → void
getStatus() → Status
```

### Full API documentation available in code comments.

---

## 🤝 Contributing

This is a proprietary implementation but the specification is shareable. To implement your own version:

1. Follow the schemas exactly
2. Keep deterministic components pure
3. Use LLMs only for proposals
4. Validate everything
5. Maintain full traceability

---

## 📄 License

© 2008-2026 Ryan Barbrick (Barbrick Design). All Rights Reserved.

Contact: BarbrickDesign@gmail.com

---

## 🎲 Enhanced: Probabilistic Validation & Failure Mode Analysis

### Overview

The reasoning scaffold has been enhanced to acknowledge real-world complexity and uncertainty:

> **Key Insight**: Validation reduces error probability but does NOT guarantee correctness.

Real software systems have:
- Architecture tradeoffs
- Side effects and race conditions
- Memory behavior and performance issues
- Undefined edge cases
- Emergent complexity from component interactions

### New Components

#### 1. ProbabilisticValidator

Wraps deterministic constraint validation with probability estimation:

```javascript
const scaffold = new ReasoningScaffold({
  enableProbabilisticValidation: true
});

const result = await scaffold.execute("Your task...");

// Access probabilistic analysis
console.log(result.probabilisticAnalysis);
// {
//   overallProbability: 0.85,
//   interpretation: "High Confidence - validation appears sound but edge cases may exist",
//   stepResults: [...],
//   warning: null
// }
```

**Features**:
- Estimates validation probability based on complexity metrics
- Calculates confidence intervals and uncertainty factors
- Identifies applicable limitations (concurrency, performance, etc.)
- Provides human-readable interpretations
- Generates recommendations for improvement

**Complexity Factors**:
- State size (more facts/relations = more edge cases)
- Constraint count (more constraints = more interactions)
- Relation depth (deep hierarchies = harder to verify)
- Domain complexity (varies by domain)
- Edge case coverage (known vs. possible edge cases)

#### 2. FailureModeAnalyzer

Simulates engineer intuition to anticipate what could go wrong:

```javascript
const scaffold = new ReasoningScaffold({
  enableFailureModeAnalysis: true
});

const result = await scaffold.execute("Your task...");

// Access failure mode analysis
console.log(result.failureModeAnalysis);
// {
//   summary: {
//     totalCriticalFailures: 0,
//     totalHighRiskFailures: 3,
//     totalStepsAnalyzed: 5
//   },
//   stepResults: [...],
//   engineerInsight: "..."
// }
```

**Failure Mode Categories**:
- **Concurrency**: Race conditions, deadlocks, resource contention
- **Input**: Malformed input, missing data, boundary values, injection attacks
- **Performance**: Latency spikes, memory leaks, CPU exhaustion, scaling bottlenecks
- **Integration**: Unexpected interactions, version mismatches, network partitions
- **State**: State inconsistency, stale data
- **Resource**: Resource exhaustion, connection pool issues
- **Emergent**: Emergent complexity, cascade failures

**Key Questions (Like an Experienced Engineer)**:
- "What if this runs concurrently?"
- "What if input is malformed?"
- "What if latency spikes?"
- "What if this interacts with something unexpected three layers down?"

#### 3. Red Team Agent

New LLM agent role that actively searches for edge cases and failure modes:

```javascript
const scaffold = new ReasoningScaffold({
  enableRedTeam: true,
  llm: yourLLMProvider
});

const result = await scaffold.execute("Your task...");

// Access red team analysis
console.log(result.redTeamAnalysis);
// {
//   failure_modes: [...],
//   edge_cases: [...],
//   overall_assessment: "...",
//   confidence_reduction: 15
// }
```

### Configuration

```javascript
const scaffold = new ReasoningScaffold({
  // Core settings
  maxIterations: 5,
  strictMode: false,
  
  // Enhanced validation (all enabled by default)
  enableProbabilisticValidation: true,
  enableFailureModeAnalysis: true,
  enableRedTeam: true,
  
  // LLM provider (required for red team)
  llm: yourLLMProvider
});
```

### Philosophy

**Traditional Approach**:
- Constraint satisfaction → Validation passed → Assumed correct

**Enhanced Approach**:
- Constraint satisfaction → Validation passed → Estimate probability → Analyze failure modes → Acknowledge uncertainty

**Key Principles**:
1. **Validation reduces but doesn't eliminate error probability**
2. **Real-world complexity exceeds formal specifications**
3. **Experienced engineers simulate failure modes mentally**
4. **Human intuition = compressed experience + accountability**
5. **Acknowledge limitations rather than claiming guarantees**

### Example Usage

```javascript
const { ReasoningScaffold } = require('./src/reasoning-scaffold');

// Initialize with enhanced validation
const scaffold = new ReasoningScaffold({
  enableProbabilisticValidation: true,
  enableFailureModeAnalysis: true,
  enableRedTeam: true
});

// Execute reasoning
const result = await scaffold.execute(
  "Schedule 3 meetings without overlap between 9am-5pm"
);

// Check results
console.log('Success:', result.success);
console.log('Probability:', result.probabilisticAnalysis.overallProbability);
console.log('Critical Failures:', result.failureModeAnalysis.summary.totalCriticalFailures);
console.log('Red Team Issues:', result.redTeamAnalysis.failure_modes.length);

// Review detailed analysis
if (result.probabilisticAnalysis.warning) {
  console.warn('Warning:', result.probabilisticAnalysis.warning);
}

for (const failure of result.failureModeAnalysis.stepResults) {
  if (failure.criticalFailures.length > 0) {
    console.error('Critical issues in step', failure.step_id);
    console.error(failure.engineerInsight);
  }
}
```

### Interpreting Results

**High Probability (≥0.85)**:
- Validation appears sound
- Edge cases may still exist
- Proceed with standard monitoring

**Medium Probability (0.70-0.84)**:
- Validation is reasonable
- Significant uncertainty remains
- Add extra validation or tests

**Low Probability (<0.70)**:
- High risk of undetected issues
- Human review recommended
- Consider simplifying or adding constraints

**Failure Mode Severity**:
- **Critical**: Security issues, data corruption - must fix
- **High**: Race conditions, deadlocks - should fix
- **Medium**: Performance issues - consider fixing
- **Low**: Minor edge cases - monitor

---

## 🎯 Roadmap

- [x] Core schemas
- [x] Deterministic components
- [x] LLM orchestration
- [x] Domain packs (3)
- [x] Demo playground
- [x] Probabilistic validation
- [x] Failure mode analysis
- [x] Red team agent
- [ ] More domain packs
- [ ] Performance optimization
- [ ] Distributed execution
- [ ] Web UI dashboard
- [ ] API server
- [ ] CLI tool

---

## 📚 Resources

- **Demo**: Open `reasoning-scaffold-demo.html` in browser
- **Source**: `src/reasoning-scaffold/`
- **Examples**: See demo for working examples
- **Support**: BarbrickDesign@gmail.com

---

**Built with ❤️ by Ryan Barbrick | AI Assistant: Merlin AI**
